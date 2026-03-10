"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ToggleLeft, ToggleRight, Plus, X, Trash2, Loader2 } from "lucide-react";

const PRESET_CATEGORIES = [
  "Monitors", "Monitors & Lighting", "Keyboards", "Mice",
  "Desk & Seating", "Accessories", "Cables & Hubs", "Smart Home", "Cleaning", "Bags",
];

type GroupMode = "options" | "per_option_price" | "combo_price";
type VariantGroup = { name: string; options: string[]; mode: GroupMode; optionPrices: string[] };
type ComboEntry = { key: string; labels: string[]; price: string };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildCombos(groups: VariantGroup[]): ComboEntry[] {
  const ng = groups.filter(g => g.name.trim() && g.options.length);
  if (ng.length < 2) return [];
  return ng[0].options.flatMap(ao => ng[1].options.map(bo => ({ key: `${ao}|${bo}`, labels: [ao, bo], price: "" })));
}

// Parse variants JSONB back into VariantGroup[] + comboPrices
function parseVariants(raw: unknown[]): { groups: VariantGroup[]; comboPrices: Record<string, string> } {
  if (!raw?.length) return { groups: [], comboPrices: {} };
  const comboPricesObj = raw.find((v: unknown) => (v as Record<string, unknown>).combo_prices) as Record<string, Record<string, number>> | undefined;
  const comboPrices: Record<string, string> = {};
  if (comboPricesObj?.combo_prices) {
    Object.entries(comboPricesObj.combo_prices).forEach(([k, v]) => { comboPrices[k] = String(v); });
  }
  const namedGroups = (raw as Record<string, unknown>[]).filter(v => v.name && v.options) as { name: string; options: string[]; prices?: number[] }[];
  const groups: VariantGroup[] = namedGroups.map(g => {
    const mode: GroupMode = comboPricesObj ? "combo_price" : g.prices?.length ? "per_option_price" : "options";
    return {
      name: g.name,
      options: g.options,
      mode,
      optionPrices: g.prices ? g.prices.map(String) : g.options.map(() => ""),
    };
  });
  return { groups, comboPrices };
}

const inp = "w-full bg-[#0a0a0a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
      {children}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 space-y-4">
      <div className="mb-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        {hint && <p className="text-xs text-gray-600 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export default function EditProductPage() {
  const router = useRouter();
  const { slug: slugParam } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productId, setProductId] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [partner, setPartner] = useState("");
  const [inStock, setInStock] = useState(true);
  const [lowStockCount, setLowStockCount] = useState<string>("");

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [groups, setGroups] = useState<VariantGroup[]>([]);
  const [comboPrices, setComboPrices] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Load product
  useEffect(() => {
    if (!supabase || !slugParam) return;
    supabase.from("products").select("*").eq("slug", slugParam).single().then(({ data }) => {
      if (!data) { router.push("/admin/products"); return; }
      setProductId(data.id);
      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setSlug(data.slug ?? "");
      setPrice(data.price_naira?.toString() ?? "");
      setCategory(data.category ?? "");
      setCategoryInput(data.category ?? "");
      setPartner(data.partner ?? "");
      setInStock(data.in_stock ?? true);
      setLowStockCount(data.low_stock_count?.toString() ?? "");
      setExistingImages(data.images ?? (data.image_url ? [data.image_url] : []));
      const { groups, comboPrices } = parseVariants(data.variants ?? []);
      setGroups(groups);
      setComboPrices(comboPrices);
      setLoadingProduct(false);
    });
  }, [slugParam]);

  const totalImages = existingImages.length + newImageFiles.length;
  const hasComboGroup = groups.some(g => g.mode === "combo_price");
  const comboGroups = groups.filter(g => g.mode === "combo_price");
  const comboEntries = comboGroups.length >= 2 ? buildCombos(comboGroups) : [];

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - totalImages);
    setNewImageFiles(p => [...p, ...files]);
    files.forEach(f => {
      const r = new FileReader();
      r.onload = ev => setNewImagePreviews(p => [...p, ev.target?.result as string]);
      r.readAsDataURL(f);
    });
    e.target.value = "";
  }

  function removeExistingImage(i: number) { setExistingImages(p => p.filter((_, j) => j !== i)); }
  function removeNewImage(i: number) {
    setNewImageFiles(p => p.filter((_, j) => j !== i));
    setNewImagePreviews(p => p.filter((_, j) => j !== i));
  }

  function addGroup() { setGroups(p => [...p, { name: "", options: [], mode: "options", optionPrices: [] }]); }
  function removeGroup(i: number) { setGroups(p => p.filter((_, j) => j !== i)); }
  function updateGroup(i: number, patch: Partial<VariantGroup>) {
    setGroups(p => p.map((g, j) => j === i ? { ...g, ...patch } : g));
  }
  function setOptionsFromInput(i: number, raw: string) {
    const opts = raw.split(",").map(s => s.trim()).filter(Boolean);
    updateGroup(i, { options: opts, optionPrices: opts.map((_, oi) => groups[i].optionPrices[oi] ?? "") });
  }
  function setOptionPrice(gi: number, oi: number, val: string) {
    setGroups(p => p.map((g, j) => {
      if (j !== gi) return g;
      const prices = [...g.optionPrices]; prices[oi] = val;
      return { ...g, optionPrices: prices };
    }));
  }

  async function handleSave() {
    setError("");
    if (!name.trim()) return setError("Product name is required.");
    if (!slug.trim()) return setError("Slug is required.");
    if (!category.trim()) return setError("Category is required.");
    if (totalImages === 0) return setError("At least one image is required.");
    if (!productId || !supabase) return;

    setSaving(true);
    try {
      // Upload any new images
      const newUrls: string[] = [];
      for (const file of newImageFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("slug", slug.trim());
        const res = await fetch("/api/upload-image", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        newUrls.push(data.url);
      }

      const allImages = [...existingImages, ...newUrls];

      // Build variants
      let variantsJson: object[] | null = null;
      if (hasComboGroup && comboGroups.length >= 2) {
        const namedEntries = comboGroups.map(g => ({ name: g.name.trim(), options: g.options }));
        const prices: Record<string, number> = {};
        comboEntries.forEach(e => { if (comboPrices[e.key]) prices[e.key] = Number(comboPrices[e.key]); });
        variantsJson = [...namedEntries, { combo_prices: prices }];
      } else if (groups.length > 0) {
        variantsJson = groups.filter(g => g.name.trim() && g.options.length).map(g => {
          const base: Record<string, unknown> = { name: g.name.trim(), options: g.options };
          if (g.mode === "per_option_price") {
            const prices: Record<string, number> = {};
            g.options.forEach((opt, i) => { if (g.optionPrices[i]) prices[opt] = Number(g.optionPrices[i]); });
            base.prices = Object.values(prices);
          }
          return base;
        });
      }

      const { error: updateErr } = await supabase.from("products").update({
        name: name.trim(),
        description: description.trim() || null,
        slug: slug.trim(),
        price_naira: price ? Number(price) : null,
        category: category.trim(),
        partner: partner.trim() || null,
        in_stock: inStock,
        low_stock_count: lowStockCount ? parseInt(lowStockCount) : null,
        image_url: allImages[0],
        images: allImages,
        variants: variantsJson,
      }).eq("id", productId);

      if (updateErr) throw new Error(updateErr.message);
      router.push("/admin/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!productId || !supabase) return;
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await supabase.from("products").delete().eq("id", productId);
    router.push("/admin/products");
  }

  const filteredCats = PRESET_CATEGORIES.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()));

  if (loadingProduct) return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/[0.03] rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm">{error}</div>
        )}

        <div className="flex flex-col gap-5">
          {/* Basic Info */}
          <Section title="Basic Info">
            <Field label="Product Name *">
              <input className={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Logitech MX Master 4" />
            </Field>
            <Field label="Slug *" hint="Changing this will break existing links to this product">
              <input className={inp} value={slug} onChange={e => setSlug(slugify(e.target.value))} />
            </Field>
            <Field label="Description">
              <textarea className={`${inp} resize-none h-24`} value={description}
                onChange={e => setDescription(e.target.value)} placeholder="Short product description..." />
            </Field>
          </Section>

          {/* Pricing & Category */}
          <Section title="Pricing & Category">
            <Field label="Base Price (₦)" hint="Leave blank if pricing is handled by variants">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">₦</span>
                <input className={`${inp} pl-7`} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="45000" />
              </div>
            </Field>
            <Field label="Category *">
              <div className="relative">
                <input className={inp} value={categoryInput}
                  onChange={e => { setCategoryInput(e.target.value); setCategory(e.target.value); setShowCategoryDropdown(true); }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 150)} />
                {showCategoryDropdown && filteredCats.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
                    {filteredCats.map(c => (
                      <li key={c} onMouseDown={() => { setCategory(c); setCategoryInput(c); setShowCategoryDropdown(false); }}
                        className="px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.05] hover:text-white cursor-pointer transition-colors">{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Field>
            <Field label="Partner / Supplier" hint="Optional">
              <input className={inp} value={partner} onChange={e => setPartner(e.target.value)} placeholder="e.g. Jumia, Aliexpress" />
            </Field>
          </Section>

          {/* Availability */}
          <Section title="Availability">
            <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/[0.08] rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">In Stock</p>
                <p className="text-xs text-gray-600 mt-0.5">Out of stock products show with a disabled button</p>
              </div>
              <button onClick={() => setInStock(v => !v)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${inStock ? "text-green-400" : "text-gray-600"}`}>
                {inStock ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                {inStock ? "In Stock" : "Out of Stock"}
              </button>
            </div>
          </Section>

          <Field label="Low Stock Count" hint="Set a number to show 'Only X left' label. Leave blank to hide.">
            <input
              className={inp}
              type="number"
              min="0"
              value={lowStockCount}
              onChange={e => setLowStockCount(e.target.value)}
              placeholder="e.g. 3"
            />
          </Field>

          {/* Images */}
          <Section title={`Images (${totalImages}/5)`} hint="First image is used as thumbnail. Remove or reorder existing images.">
            <div className="space-y-3">
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {existingImages.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08]">
                      <img src={src} alt="" className="w-full h-full object-contain p-1 bg-[#0a0a0a]" />
                      {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-500/80 text-[9px] text-center py-0.5 text-white">Thumbnail</span>}
                      <button onClick={() => removeExistingImage(i)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 rounded-full w-4 h-4 flex items-center justify-center transition-colors">
                        <X size={8} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* New image previews */}
              {newImagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {newImagePreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-blue-500/30">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 left-0 right-0 bg-blue-500/80 text-[9px] text-center py-0.5 text-white">New</span>
                      <button onClick={() => removeNewImage(i)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 rounded-full w-4 h-4 flex items-center justify-center transition-colors">
                        <X size={8} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {totalImages < 5 && (
                <>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/[0.08] hover:border-blue-500/50 rounded-xl py-4 text-sm text-gray-600 hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Upload New Image
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </>
              )}
            </div>
          </Section>

          {/* Variants */}
          <Section title="Variants" hint="Options like Size, Color, or Motor type">
            <div className="space-y-3">
              {groups.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-5 border border-white/[0.06] rounded-xl">No variants.</p>
              )}
              {groups.map((g, gi) => (
                <div key={gi} className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input className={`${inp} flex-1`} value={g.name}
                      onChange={e => updateGroup(gi, { name: e.target.value })}
                      placeholder="Group name (e.g. Color, Size)" />
                    <button onClick={() => removeGroup(gi)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                  <input className={inp}
                    defaultValue={g.options.join(", ")}
                    placeholder="Options, comma-separated"
                    onChange={e => setOptionsFromInput(gi, e.target.value)} />
                  <div className="flex gap-2 flex-wrap">
                    {(["options", "per_option_price", "combo_price"] as GroupMode[]).map(mode => (
                      <button key={mode} onClick={() => updateGroup(gi, { mode })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          g.mode === mode ? "bg-blue-500 text-white border-blue-500" : "border-white/[0.08] text-gray-500 hover:border-blue-500/50 hover:text-gray-300"
                        }`}>
                        {mode === "options" && "No pricing"}
                        {mode === "per_option_price" && "Per-option price"}
                        {mode === "combo_price" && "Combo price"}
                      </button>
                    ))}
                  </div>
                  {g.mode === "per_option_price" && g.options.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs text-gray-500">Price per option:</p>
                      {g.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-24 flex-shrink-0">{opt}</span>
                          <input className={`${inp} flex-1`} type="number"
                            value={g.optionPrices[oi] ?? ""}
                            onChange={e => setOptionPrice(gi, oi, e.target.value)}
                            placeholder="₦ Price" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addGroup}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 px-3 py-2 rounded-xl transition-all w-full justify-center">
                <Plus size={12} /> Add Variant Group
              </button>
            </div>

            {hasComboGroup && comboGroups.length >= 2 && comboEntries.length > 0 && (
              <div className="mt-3 bg-blue-500/[0.05] border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm font-medium text-blue-400 mb-1">Combo Price Matrix</p>
                <p className="text-xs text-gray-500 mb-4">{comboGroups[0].name} × {comboGroups[1].name}</p>
                <div className="space-y-2">
                  {comboEntries.map(entry => (
                    <div key={entry.key} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-48 flex-shrink-0">{entry.labels[0]} + {entry.labels[1]}</span>
                      <input className={`${inp} flex-1`} type="number"
                        value={comboPrices[entry.key] ?? ""}
                        onChange={e => setComboPrices(p => ({ ...p, [entry.key]: e.target.value }))}
                        placeholder="₦ Price" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Actions */}
          <div className="flex gap-3 pb-10">
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-all disabled:opacity-50">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
            <button onClick={() => router.push("/admin/products")}
              className="flex-1 py-3 rounded-xl border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04] text-sm transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}