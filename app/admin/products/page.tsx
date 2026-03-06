"use client";

import Link from 'next/link'
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";

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
  };

  const toggleStock = async (id: string, current: boolean) => {
    if (!supabase) return;
    await supabase.from("products").update({ in_stock: !current }).eq("id", id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, in_stock: !current } : p));
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Price (₦)</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                  <td className="px-5 py-3 text-sm text-white font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{p.category}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editing[p.id]?.price ?? ""}
                        onChange={e => setEditing(prev => ({ ...prev, [p.id]: { price: e.target.value } }))}
                        placeholder="Set price"
                        className="w-32 px-3 py-1.5 rounded-lg bg-[#0f0f0f] border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button onClick={() => savePrice(p.id)} disabled={saving === p.id}
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors disabled:opacity-50">
                        <Save size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleStock(p.id, p.in_stock)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        p.in_stock ? "text-green-400" : "text-gray-500"
                      }`}>
                      {p.in_stock ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {p.in_stock ? "In Stock" : "Out of Stock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}