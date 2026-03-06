'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ToggleLeft, ToggleRight } from 'lucide-react'

const PRESET_CATEGORIES = [
  'Monitors', 'Monitors & Lighting', 'Keyboards', 'Mice',
  'Desk & Seating', 'Accessories', 'Cables & Hubs', 'Smart Home', 'Cleaning', 'Bags',
]

// Variant group modes
type GroupMode = 'options' | 'per_option_price' | 'combo_price'

type VariantGroup = {
  name: string
  options: string[]   // comma-separated input
  mode: GroupMode
  // per_option_price: one price per option
  optionPrices: string[]
}

type ComboEntry = { key: string; labels: string[]; price: string }

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Generate all combos from two groups
function buildCombos(groups: VariantGroup[]): ComboEntry[] {
  const namedGroups = groups.filter(g => g.name.trim() && g.options.length)
  if (namedGroups.length < 2) return []
  const [a, b] = namedGroups
  const combos: ComboEntry[] = []
  a.options.forEach(ao => {
    b.options.forEach(bo => {
      combos.push({ key: `${ao}|${bo}`, labels: [ao, bo], price: '' })
    })
  })
  return combos
}

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [partner, setPartner] = useState('')
  const [inStock, setInStock] = useState(true)

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [groups, setGroups] = useState<VariantGroup[]>([])
  // combo prices state: keyed by "groupA_option|groupB_option"
  const [comboPrices, setComboPrices] = useState<Record<string, string>>({})

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Detect if any group is in combo mode
  const hasComboGroup = groups.some(g => g.mode === 'combo_price')
  // Combo entries are derived from the two groups that have combo mode
  const comboGroups = groups.filter(g => g.mode === 'combo_price')
  const comboEntries: ComboEntry[] = comboGroups.length >= 2 ? buildCombos(comboGroups) : []

  function handleNameChange(v: string) {
    setName(v)
    if (!slugManual) setSlug(slugify(v))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - imageFiles.length)
    setImageFiles(p => [...p, ...files])
    files.forEach(f => {
      const r = new FileReader()
      r.onload = ev => setImagePreviews(p => [...p, ev.target?.result as string])
      r.readAsDataURL(f)
    })
    e.target.value = ''
  }

  function removeImage(i: number) {
    setImageFiles(p => p.filter((_, j) => j !== i))
    setImagePreviews(p => p.filter((_, j) => j !== i))
  }

  function addGroup() {
    setGroups(p => [...p, { name: '', options: [], mode: 'options', optionPrices: [] }])
  }

  function removeGroup(i: number) {
    setGroups(p => p.filter((_, j) => j !== i))
  }

  function updateGroup(i: number, patch: Partial<VariantGroup>) {
    setGroups(p => p.map((g, j) => j === i ? { ...g, ...patch } : g))
  }

  function setOptionsFromInput(i: number, raw: string) {
    const opts = raw.split(',').map(s => s.trim()).filter(Boolean)
    const g = groups[i]
    updateGroup(i, {
      options: opts,
      optionPrices: opts.map((_, oi) => g.optionPrices[oi] ?? ''),
    })
  }

  function setOptionPrice(gi: number, oi: number, val: string) {
    setGroups(p => p.map((g, j) => {
      if (j !== gi) return g
      const prices = [...g.optionPrices]
      prices[oi] = val
      return { ...g, optionPrices: prices }
    }))
  }

  async function handleSave() {
    setError('')
    if (!name.trim()) return setError('Product name is required.')
    if (!slug.trim()) return setError('Slug is required.')
    if (!category.trim()) return setError('Category is required.')
    if (imageFiles.length === 0) return setError('At least one image is required.')

    setSaving(true)
    try {
      // Upload images via API route (keeps service role key server-side)
      const urls: string[] = []
      for (const file of imageFiles) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('slug', slug.trim())
        const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Upload failed')
        urls.push(data.url)
      }

      // Build variants JSON
      let variantsJson: object[] | null = null

      if (hasComboGroup && comboGroups.length >= 2) {
        // Two named groups + combo_prices object
        const namedEntries = comboGroups.map(g => ({ name: g.name.trim(), options: g.options }))
        const prices: Record<string, number> = {}
        comboEntries.forEach(entry => {
          const val = comboPrices[entry.key]
          if (val) prices[entry.key] = Number(val)
        })
        variantsJson = [...namedEntries, { combo_prices: prices }]
      } else if (groups.length > 0) {
        variantsJson = groups
          .filter(g => g.name.trim() && g.options.length)
          .map(g => {
            const base: Record<string, unknown> = { name: g.name.trim(), options: g.options }
            if (g.mode === 'per_option_price') {
              const prices: Record<string, number> = {}
              g.options.forEach((opt, i) => {
                if (g.optionPrices[i]) prices[opt] = Number(g.optionPrices[i])
              })
              base.prices = Object.values(prices)
            }
            return base
          })
      }

      if (!supabase) throw new Error('Supabase client not available')
      const { error: insertErr } = await supabase.from('products').insert({
        name: name.trim(),
        description: description.trim() || null,
        slug: slug.trim(),
        price_naira: price ? Number(price) : null,
        category: category.trim(),
        partner: partner.trim() || null,
        in_stock: inStock,
        image_url: urls[0],
        images: urls,
        variants: variantsJson,
      })

      if (insertErr) throw new Error(insertErr.message)
      router.push('/admin/products')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  const filteredCats = PRESET_CATEGORIES.filter(c =>
    c.toLowerCase().includes(categoryInput.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/admin/products')} className="text-gray-400 hover:text-white text-sm">
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Add New Product</h1>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-lg p-4 mb-6 text-sm">{error}</div>
        )}

        <div className="space-y-6">

          <Field label="Product Name *">
            <input className={inp} value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Logitech MX Master 4" />
          </Field>

          <Field label="Slug *" hint="Used in the URL: /shop/[slug]">
            <input className={inp} value={slug}
              onChange={e => { setSlugManual(true); setSlug(slugify(e.target.value)) }}
              placeholder="logitech-mx-master-4" />
          </Field>

          <Field label="Description">
            <textarea className={`${inp} resize-none h-28`} value={description}
              onChange={e => setDescription(e.target.value)} placeholder="Short product description..." />
          </Field>

          <Field label="Base Price (₦)" hint="Leave blank if TBD or all pricing is in variants">
            <input className={inp} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 45000" />
          </Field>

          {/* Category */}
          <Field label="Category *">
            <div className="relative">
              <input className={inp} value={categoryInput}
                onChange={e => { setCategoryInput(e.target.value); setCategory(e.target.value); setShowCategoryDropdown(true) }}
                onFocus={() => setShowCategoryDropdown(true)}
                onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 150)}
                placeholder="Select or type a category" />
              {showCategoryDropdown && filteredCats.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                  {filteredCats.map(c => (
                    <li key={c} onMouseDown={() => { setCategory(c); setCategoryInput(c); setShowCategoryDropdown(false) }}
                      className="px-4 py-2.5 text-sm hover:bg-gray-700 cursor-pointer">{c}</li>
                  ))}
                </ul>
              )}
            </div>
          </Field>

          <Field label="Partner / Supplier" hint="Optional">
            <input className={inp} value={partner} onChange={e => setPartner(e.target.value)} placeholder="e.g. Jumia, Aliexpress" />
          </Field>

          {/* In Stock */}
          <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium">In Stock</p>
              <p className="text-xs text-gray-400 mt-0.5">Out of stock products show with a disabled button</p>
            </div>
            <button onClick={() => setInStock(v => !v)}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${inStock ? 'text-green-400' : 'text-gray-500'}`}>
              {inStock ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              {inStock ? 'In Stock' : 'Out of Stock'}
            </button>
          </div>

          {/* Images */}
          <Field label={`Images * (${imageFiles.length}/5)`} hint="First image is used as thumbnail">
            <div className="space-y-3">
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-500/80 text-[10px] text-center py-0.5">Thumbnail</span>}
                      <button onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/70 rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-red-500">✕</button>
                    </div>
                  ))}
                </div>
              )}
              {imageFiles.length < 5 && (
                <>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-lg py-4 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    + Upload Image
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </>
              )}
            </div>
          </Field>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Variants</label>
              <button onClick={addGroup}
                className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/40 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors">
                + Add Variant Group
              </button>
            </div>

            {groups.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4 border border-gray-800 rounded-lg">
                No variants. Add one if the product has options like Color or Size.
              </p>
            )}

            <div className="space-y-4">
              {groups.map((g, gi) => (
                <div key={gi} className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input className={`${inp} flex-1`} value={g.name}
                      onChange={e => updateGroup(gi, { name: e.target.value })}
                      placeholder="Group name (e.g. Color, Size)" />
                    <button onClick={() => removeGroup(gi)} className="text-red-400 hover:text-red-300 text-xs px-2">Remove</button>
                  </div>

                  <input className={inp} placeholder="Options, comma-separated (e.g. Red, Blue, Grey)"
                    onChange={e => setOptionsFromInput(gi, e.target.value)} />

                  {/* Pricing mode selector */}
                  <div className="flex gap-2 flex-wrap">
                    {(['options', 'per_option_price', 'combo_price'] as GroupMode[]).map(mode => (
                      <button key={mode}
                        onClick={() => updateGroup(gi, { mode })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          g.mode === mode
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-600 text-gray-400 hover:border-blue-500'
                        }`}>
                        {mode === 'options' && 'No pricing'}
                        {mode === 'per_option_price' && 'Per-option price'}
                        {mode === 'combo_price' && 'Combo price'}
                      </button>
                    ))}
                  </div>

                  {g.mode === 'combo_price' && (
                    <p className="text-xs text-blue-400">
                      Mark both groups as "Combo price" — the price matrix will appear below once both have options.
                    </p>
                  )}

                  {/* Per-option prices */}
                  {g.mode === 'per_option_price' && g.options.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs text-gray-400">Set price per option:</p>
                      {g.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-3">
                          <span className="text-xs text-gray-300 w-24 flex-shrink-0">{opt}</span>
                          <input className={`${inp} flex-1`} type="number"
                            value={g.optionPrices[oi] ?? ''}
                            onChange={e => setOptionPrice(gi, oi, e.target.value)}
                            placeholder="₦ Price" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Combo price matrix */}
            {hasComboGroup && comboGroups.length >= 2 && comboEntries.length > 0 && (
              <div className="mt-4 bg-gray-900 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-400 mb-1">Combo Price Matrix</p>
                <p className="text-xs text-gray-400 mb-4">
                  {comboGroups[0].name} × {comboGroups[1].name} — set a price for each combination.
                </p>
                <div className="space-y-2">
                  {comboEntries.map(entry => (
                    <div key={entry.key} className="flex items-center gap-3">
                      <span className="text-xs text-gray-300 w-48 flex-shrink-0">
                        {entry.labels[0]} + {entry.labels[1]}
                      </span>
                      <input
                        className={`${inp} flex-1`}
                        type="number"
                        value={comboPrices[entry.key] ?? ''}
                        onChange={e => setComboPrices(p => ({ ...p, [entry.key]: e.target.value }))}
                        placeholder="₦ Price"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasComboGroup && comboGroups.length < 2 && (
              <p className="mt-3 text-xs text-yellow-500 border border-yellow-500/30 rounded-lg px-3 py-2">
                Add a second group and set it to "Combo price" to unlock the price matrix.
              </p>
            )}
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-2 pb-10">
            <button onClick={() => router.push('/admin/products')}
              className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors">
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const inp = 'w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {children}
    </div>
  )
}