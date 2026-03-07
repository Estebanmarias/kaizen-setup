"use client";

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["All", "Desk & Seating", "Monitors & Lighting", "Accessories", "Cables & Hubs", "Smart Home", "Cleaning", "Bags", "Keyboards", "Mice", "Monitors"];

type Variant = {
  name?: string;
  options?: string[];
  prices?: number[];
  combo_prices?: Record<string, number>;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price_naira: number | null;
  category: string;
  partner: string | null;
  in_stock: boolean;
  image_url: string | null;
  slug: string;
  variants: Variant[] | null;
};

type CartItem = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  price_naira: number | null;
  quantity: number;
  variants: Record<string, string>;
};

type FlyItem = { src: string; startX: number; startY: number; id: number };

const colorMap: Record<string, { bg: string; text: string }> = {
  Yellow: { bg: "#FACC15", text: "#000000" },
  Green:  { bg: "#22C55E", text: "#ffffff" },
  Blue:   { bg: "#3B82F6", text: "#ffffff" },
  Red:    { bg: "#EF4444", text: "#ffffff" },
  Black:  { bg: "#111111", text: "#ffffff" },
  White:  { bg: "#ffffff", text: "#111111" },
  Grey:   { bg: "#6B7280", text: "#ffffff" },
};

function isComboProduct(v: Variant[] | null) { return !!(v?.find(x => x.combo_prices)); }
function getComboPrice(v: Variant[] | null, sel: Record<string, string>): number | null {
  const cp = v?.find(x => x.combo_prices)?.combo_prices;
  if (!cp) return null;
  const key = v!.filter(x => x.name && x.options).map(g => sel[g.name!] ?? "").join("|");
  return cp[key] ?? null;
}
function getComboMin(v: Variant[] | null): number | null {
  const cp = v?.find(x => x.combo_prices)?.combo_prices;
  return cp ? Math.min(...Object.values(cp)) : null;
}
function getDefaultCombo(v: Variant[] | null): Record<string, string> {
  const d: Record<string, string> = {};
  v?.filter(x => x.name && x.options).forEach(g => { d[g.name!] = g.options![0]; });
  return d;
}
function allComboSelected(v: Variant[] | null, sel: Record<string, string>) {
  return v?.filter(x => x.name && x.options).every(g => !!sel[g.name!]) ?? true;
}

function ComboPriceTable({ variants }: { variants: Variant[] }) {
  const cp = variants.find(v => v.combo_prices)?.combo_prices;
  const groups = variants.filter(v => v.name && v.options);
  if (!cp || groups.length < 2) return null;
  const [rG, cG] = groups;
  return (
    <table className="w-full text-xs mt-2 border-collapse">
      <thead>
        <tr>
          <th className="text-left pb-1.5 text-gray-400 font-medium pr-3">{rG.name}</th>
          {cG.options!.map(o => <th key={o} className="pb-1.5 text-gray-400 font-medium text-right">{o}</th>)}
        </tr>
      </thead>
      <tbody>
        {rG.options!.map(row => (
          <tr key={row} className="border-t border-gray-100 dark:border-gray-800">
            <td className="py-1.5 text-gray-700 dark:text-gray-300 font-medium pr-3">{row}</td>
            {cG.options!.map(col => {
              const price = cp[`${row}|${col}`];
              return <td key={col} className="py-1.5 text-right text-gray-900 dark:text-white font-semibold">{price ? `₦${(price/1000).toFixed(0)}k` : "—"}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Fly-to-cart animation ──────────────────────────────────────────────────────
function FlyAnimation({ items, cartRef }: { items: FlyItem[]; cartRef: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <>
      {items.map(item => {
        const cartEl = cartRef.current;
        const cartRect = cartEl?.getBoundingClientRect();
        const endX = cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth - 60;
        const endY = cartRect ? cartRect.top + cartRect.height / 2 : 60;
        return (
          <div key={item.id} className="pointer-events-none fixed z-[999]"
            style={{
              left: item.startX, top: item.startY, width: 48, height: 48,
              animation: "flyToCart 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
              ["--endX" as string]: `${endX - item.startX}px`,
              ["--endY" as string]: `${endY - item.startY}px`,
            }}>
            <img src={item.src} alt="" className="w-full h-full object-contain rounded-lg border border-gray-200 bg-white p-1 shadow-lg" />
          </div>
        );
      })}

    </>
  );
}

// ── Quick Add Drawer ───────────────────────────────────────────────────────────
function QuickAddDrawer({ product, onClose, onAdded }: {
  product: Product;
  onClose: () => void;
  onAdded: (imgSrc: string) => void;
}) {
  const isCombo = isComboProduct(product.variants);
  const [sel, setSel] = useState<Record<string, string>>(isCombo ? getDefaultCombo(product.variants) : {});
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const comboPrice = isCombo ? getComboPrice(product.variants, sel) : null;
  const perOptionPrice = (() => {
    if (!product.variants || isCombo) return null;
    for (const v of product.variants) {
      if (v.prices && v.name && sel[v.name]) {
        const idx = v.options?.indexOf(sel[v.name]) ?? -1;
        if (idx >= 0) return v.prices[idx];
      }
    }
    return null;
  })();
  const displayPrice = comboPrice ?? perOptionPrice ?? product.price_naira;
  const canAdd = !isCombo || allComboSelected(product.variants, sel);

  const addToCart = () => {
    if (!canAdd) return;
    const cart: CartItem[] = JSON.parse(localStorage.getItem("kaizen_cart") ?? "[]");
    const variantSummary = Object.entries(sel).map(([k, v]) => `${k}: ${v}`).join(", ");
    const key = `${product.id}-${variantSummary}`;
    const idx = cart.findIndex(i => i.id === key);
    if (idx >= 0) cart[idx].quantity += qty;
    else cart.push({ id: key, name: product.name, slug: product.slug, image_url: product.image_url, price_naira: displayPrice, quantity: qty, variants: sel });
    localStorage.setItem("kaizen_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));
    setAdded(true);
    onAdded(product.image_url ?? "");
    setTimeout(() => { setAdded(false); onClose(); }, 1200);
  };

  const namedVariants = product.variants?.filter(v => v.name && v.options) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#111] h-full flex flex-col shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Quick Add</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-800">
              <img src={product.image_url ?? "/images/products/placeholder.jpg"} alt={product.name} className="max-h-full max-w-full object-contain p-1" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-500 mb-1">{product.category}</p>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{product.name}</h3>
              {displayPrice ? (
                <p className="font-bold text-gray-900 dark:text-white mt-1">₦{displayPrice.toLocaleString()}</p>
              ) : isCombo ? (
                <p className="text-xs text-gray-400 mt-1">Select options to see price</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Price on request</p>
              )}
            </div>
          </div>
          {namedVariants.length > 0 && (
            <div className="flex flex-col gap-4">
              {namedVariants.map(variant => (
                <div key={variant.name}>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {variant.name}{sel[variant.name!] && <span className="font-normal text-blue-500 ml-2">{sel[variant.name!]}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variant.name === "Color"
                      ? variant.options!.map(opt => {
                          const isSelected = sel[variant.name!] === opt;
                          const colors = colorMap[opt];
                          return (
                            <button key={opt} onClick={() => setSel(p => ({ ...p, [variant.name!]: opt }))}
                              style={isSelected ? { backgroundColor: colors?.bg, color: colors?.text } : {}}
                              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isSelected ? "border-transparent" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-500"}`}>
                              {opt}
                            </button>
                          );
                        })
                      : variant.options!.map(opt => (
                          <button key={opt} onClick={() => setSel(p => ({ ...p, [variant.name!]: opt }))}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${sel[variant.name!] === opt ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-500"}`}>
                            {opt}
                          </button>
                        ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</p>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Minus size={14} /></button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-700">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Plus size={14} /></button>
            </div>
          </div>
          <Link href={`/shop/${product.slug}`} onClick={onClose} className="text-sm text-blue-500 hover:underline flex items-center gap-1">
            View full product details <ArrowRight size={12} />
          </Link>
        </div>
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2">
          {isCombo && !canAdd && <p className="text-xs text-center text-gray-400">Select all options to add to cart</p>}
          <button onClick={addToCart} disabled={!canAdd}
            className={`w-full min-h-[48px] flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-colors ${added ? "bg-green-500 text-white" : canAdd ? "bg-blue-500 hover:bg-blue-400 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"}`}>
            <ShoppingCart size={16} />{added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutButton({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const handleCheckout = async () => {
    setChecking(true);
    const { data } = await supabase?.auth.getUser() ?? { data: { user: null } };
    if (data.user) { onClose(); router.push('/cart'); }
    else { onClose(); router.push('/auth?next=/cart'); }
    setChecking(false);
  };
  return (
    <button onClick={handleCheckout} disabled={checking}
      className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm transition-colors">
      <ShoppingCart size={16} /> Checkout
    </button>
  );
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVariants, setEditVariants] = useState<Record<string, string>>({});

  useEffect(() => { setCart(JSON.parse(localStorage.getItem("kaizen_cart") ?? "[]")); }, []);

  const save = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem("kaizen_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart_updated"));
  };
  const updateQty = (id: string, delta: number) => save(cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const remove = (id: string) => save(cart.filter(i => i.id !== id));
  const startEdit = (item: CartItem) => { setEditingId(item.id); setEditVariants({ ...item.variants }); };
  const saveEdit = (item: CartItem) => {
    const vs = Object.entries(editVariants).map(([k, v]) => `${k}: ${v}`).join(", ");
    const newId = `${item.id.split("-")[0]}-${vs}`;
    save(cart.map(i => i.id === item.id ? { ...i, id: newId, variants: editVariants } : i));
    setEditingId(null);
  };
  const total = cart.reduce((s, i) => s + (i.price_naira ?? 0) * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#111] h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart size={40} className="text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-400 text-sm">Your cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-3">
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-white dark:bg-[#111] rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-800">
                  <img src={item.image_url ?? "/images/products/placeholder.jpg"} alt={item.name} className="max-h-full max-w-full object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">{item.name}</p>
                  {Object.entries(item.variants).length > 0 && editingId !== item.id && (
                    <p className="text-xs text-gray-400 mt-0.5">{Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
                  )}
                  {item.price_naira && <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">₦{(item.price_naira * item.quantity).toLocaleString()}</p>}
                </div>
                <button onClick={() => remove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"><Trash2 size={14} /></button>
              </div>
              {editingId === item.id && (
                <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-xs text-gray-400">Edit selections then save:</p>
                  {Object.entries(editVariants).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-16 flex-shrink-0">{k}</span>
                      <input value={v} onChange={e => setEditVariants(p => ({ ...p, [k]: e.target.value }))}
                        className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                    </div>
                  ))}
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => saveEdit(item)} className="flex-1 bg-blue-500 hover:bg-blue-400 text-white text-xs py-1.5 rounded-lg font-semibold transition-colors">Save</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs py-1.5 rounded-lg font-semibold transition-colors">Cancel</button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Minus size={11} /></button>
                  <span className="px-3 py-1 text-xs font-semibold text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-700">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Plus size={11} /></button>
                </div>
                {Object.keys(item.variants).length > 0 && (
                  <button onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)} className="text-xs text-blue-500 hover:underline">
                    {editingId === item.id ? "Cancel" : "Edit"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3">
            {total > 0 && (
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-blue-500">₦{total.toLocaleString()}</span>
              </div>
            )}
            <CheckoutButton onClose={onClose} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shop Page ──────────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [quickAdd, setQuickAdd] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [expandedPrices, setExpandedPrices] = useState<Record<string, boolean>>({});
  const [flyItems, setFlyItems] = useState<FlyItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const flyId = useRef(0);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from("products").select("*").then(({ data }) => {
      setProducts(data ?? []);
      setFiltered(data ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const update = () => {
      const cart: CartItem[] = JSON.parse(localStorage.getItem("kaizen_cart") ?? "[]");
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    update();
    window.addEventListener("cart_updated", update);
    return () => window.removeEventListener("cart_updated", update);
  }, []);

  const filter = (cat: string) => {
    setActive(cat);
    setFiltered(cat === "All" ? products : products.filter(p => p.category === cat));
  };

  const togglePrices = (id: string) => setExpandedPrices(prev => ({ ...prev, [id]: !prev[id] }));

  const openDrawer = () => window.dispatchEvent(new Event("drawer_opened"));
  const closeDrawer = () => window.dispatchEvent(new Event("drawer_closed"));

  const handleAdded = (imgSrc: string) => {
    const cartEl = cartBtnRef.current;
    if (!cartEl || !imgSrc) return;
    const rect = cartEl.getBoundingClientRect();
    // Start from center of screen (approximate Quick Add drawer image position)
    const startX = window.innerWidth / 2 - 80;
    const startY = window.innerHeight / 2 - 100;
    const id = flyId.current++;
    setFlyItems(prev => [...prev, { src: imgSrc, startX, startY, id }]);
    setTimeout(() => setFlyItems(prev => prev.filter(f => f.id !== id)), 800);
    // Open cart drawer after animation
    setTimeout(() => { setQuickAdd(null); setCartOpen(true); }, 700);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <FlyAnimation items={flyItems} cartRef={cartBtnRef} />

      {quickAdd && (
        <QuickAddDrawer
          product={quickAdd}
          onClose={() => { setQuickAdd(null); closeDrawer(); }}
          onAdded={handleAdded}
        />
      )}
      {cartOpen && !quickAdd && <CartDrawer onClose={() => { setCartOpen(false); closeDrawer(); }} />}

      {/* Floating cart button — hidden when drawer is open */}
      <button ref={cartBtnRef} onClick={() => { setCartOpen(true); openDrawer(); }}
        className={`fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-full shadow-xl hover:scale-105 transition-transform font-semibold text-sm ${cartOpen || quickAdd ? "opacity-0 pointer-events-none" : ""}`}>
        <ShoppingCart size={18} />
        Cart
        {cartCount > 0 && (
          <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-8 inline-block">← Back to Home</Link>
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">The Shop</p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Products</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl">
          Tested and recommended gear. Every product on this page has been used or reviewed by KaizenSetup.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => filter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${active === cat ? "bg-blue-500 text-white border-blue-500" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-500"}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 animate-pulse h-72" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => {
              const combo = isComboProduct(p.variants);
              const comboMin = combo ? getComboMin(p.variants) : null;
              const perOptionMin = !combo && p.variants?.some(v => v.prices?.length)
                ? Math.min(...(p.variants.flatMap(v => v.prices ?? []))) : null;

              return (
                <div key={p.id} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition-colors flex flex-col">
                  <Link href={`/shop/${p.slug}`} className="block">
                    <div className="bg-white dark:bg-[#111] h-52 flex items-center justify-center p-4 overflow-hidden">
                      <img src={p.image_url ?? "/images/products/placeholder.jpg"} alt={p.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 ease-in-out hover:scale-110" />
                    </div>
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-blue-500 mb-1">{p.category}</span>
                    <Link href={`/shop/${p.slug}`}>
                      <h2 className="font-semibold text-base text-gray-900 dark:text-white mb-2 hover:text-blue-500 transition-colors">{p.name}</h2>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-3">{p.description}</p>

                    {p.price_naira ? (
                      <p className="font-bold text-gray-900 dark:text-white mb-4">₦{p.price_naira.toLocaleString()}</p>
                    ) : comboMin ? (
                      <div className="mb-3">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900 dark:text-white">from ₦{comboMin.toLocaleString()}</p>
                          <button onClick={() => togglePrices(p.id)} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors">
                            {expandedPrices[p.id] ? <><ChevronUp size={12} /> Hide</> : <><ChevronDown size={12} /> View all prices</>}
                          </button>
                        </div>
                        {expandedPrices[p.id] && p.variants && (
                          <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-[#0f0f0f]">
                            <ComboPriceTable variants={p.variants} />
                          </div>
                        )}
                      </div>
                    ) : perOptionMin ? (
                      <p className="font-bold text-gray-900 dark:text-white mb-4">from ₦{perOptionMin.toLocaleString()}</p>
                    ) : null}

                    {p.in_stock ? (
                      <button onClick={() => setQuickAdd(p)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors mt-auto">
                        <ShoppingCart size={16} /> Add to Cart
                      </button>
                    ) : (
                      <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-400 py-2.5 rounded-lg font-semibold text-sm cursor-not-allowed mt-auto">
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}