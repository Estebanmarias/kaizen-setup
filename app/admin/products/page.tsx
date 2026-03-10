"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, ToggleLeft, ToggleRight, Plus, Package, Pencil } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price_naira: number | null;
  category: string;
  in_stock: boolean;
  slug: string;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, { price: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("products").select("id,name,price_naira,category,in_stock,slug")
      .order("name")
      .then(({ data }) => {
        setProducts(data ?? []);
        const init: Record<string, { price: string }> = {};
        (data ?? []).forEach(p => { init[p.id] = { price: p.price_naira?.toString() ?? "" }; });
        setEditing(init);
        setLoading(false);
      });
  }, []);

  const savePrice = async (id: string) => {
    if (!supabase) return;
    setSaving(id);
    const price = editing[id]?.price;
    const price_naira = price ? parseInt(price) : null;
    await supabase.from("products").update({ price_naira }).eq("id", id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, price_naira } : p));
    setSaving(null);
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
  };

  
const toggleStock = async (id: string, current: boolean) => {
  if (!supabase) return;
  const newStock = !current;
  await supabase.from("products").update({ in_stock: newStock }).eq("id", id);
  setProducts(prev => prev.map(p => p.id === id ? { ...p, in_stock: newStock } : p));

  // If toggling back IN stock, trigger notification emails
  if (newStock) {
    await fetch("/api/notify-back-in-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: id }),
    });
  }
};


  const categories = [...new Set(products.map(p => p.category))].sort();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs text-gray-500">{products.length} products</p>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {categories.map(cat => (
            <div key={cat} className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <Package size={13} className="text-gray-500" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{cat}</p>
                <span className="text-xs text-gray-600 ml-auto">{products.filter(p => p.category === cat).length}</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {products.filter(p => p.category === cat).map(p => (
                  <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">/shop/{p.slug}</p>
                    </div>
                    {/* Price input */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">₦</span>
                        <input
                          type="number"
                          value={editing[p.id]?.price ?? ""}
                          onChange={e => setEditing(prev => ({ ...prev, [p.id]: { price: e.target.value } }))}
                          placeholder="Set price"
                          className="w-32 pl-7 pr-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <button onClick={() => savePrice(p.id)} disabled={saving === p.id}
                        className={`p-1.5 rounded-lg transition-all text-sm ${
                          saved === p.id
                            ? "bg-green-500/10 text-green-400"
                            : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                        } disabled:opacity-50`}>
                        <Save size={13} />
                      </button>
                    </div>
                    {/* Stock toggle */}
                    <button onClick={() => toggleStock(p.id, p.in_stock)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors flex-shrink-0 ${
                        p.in_stock ? "text-green-400" : "text-gray-600"
                      }`}>
                      {p.in_stock ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      <span className="w-16">{p.in_stock ? "In Stock" : "Out of Stock"}</span>
                    </button>
                    {/* Edit button */}
                    <Link href={`/admin/products/${p.slug}/edit`}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-500 hover:text-white transition-all flex-shrink-0 opacity-0 group-hover:opacity-100">
                      <Pencil size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}