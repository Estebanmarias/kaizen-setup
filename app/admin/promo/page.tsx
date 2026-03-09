"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PromoCode {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order_naira: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

const empty: { code: string; type: "percent" | "fixed"; value: number; min_order_naira: number; max_uses: string; expires_at: string } = {
  code: "", type: "percent", value: 10,
  min_order_naira: 0, max_uses: "", expires_at: ""
};

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    setPromos(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.code.trim()) { setError("Code is required."); return; }
    if (!form.value || form.value <= 0) { setError("Value must be greater than 0."); return; }
    setSaving(true);
    setError("");

    const { error: err } = await supabase.from("promo_codes").insert({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      min_order_naira: Number(form.min_order_naira) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
    });

    setSaving(false);
    if (err) { setError(err.message); return; }
    setForm(empty);
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("promo_codes").update({ active: !current }).eq("id", id);
    load();
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Tag size={22} className="text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promo Codes</h1>
      </div>

      {/* Create form */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">New Code</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Code</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. KAIZEN20"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as "percent" | "fixed" }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed (₦)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Value ({form.type === "percent" ? "%" : "₦"})
            </label>
            <input
              type="number" min={1}
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min order (₦) — optional</label>
            <input
              type="number" min={0}
              value={form.min_order_naira}
              onChange={e => setForm(f => ({ ...f, min_order_naira: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max uses — optional</label>
            <input
              type="number" min={1}
              value={form.max_uses}
              onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
              placeholder="Unlimited"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Expires at — optional</label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={saving}
          className="mt-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={15} /> {saving ? "Creating..." : "Create Code"}
        </button>
      </div>

      {/* Codes table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : promos.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-12">No promo codes yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {promos.map(p => (
            <div key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              p.active
                ? "bg-white dark:bg-[#111] border-gray-200 dark:border-gray-800"
                : "bg-gray-50 dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-900 opacity-60"
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{p.code}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {p.type === "percent" ? `${p.value}% off` : `₦${p.value.toLocaleString()} off`}
                  </span>
                  {!p.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p.uses} use{p.uses !== 1 ? "s" : ""}
                  {p.max_uses ? ` / ${p.max_uses}` : " / unlimited"}
                  {p.min_order_naira > 0 ? ` · min ₦${p.min_order_naira.toLocaleString()}` : ""}
                  {p.expires_at ? ` · expires ${new Date(p.expires_at).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(p.id, p.active)} className="text-gray-400 hover:text-blue-500 transition-colors">
                  {p.active ? <ToggleRight size={22} className="text-blue-500" /> : <ToggleLeft size={22} />}
                </button>
                <button onClick={() => deletePromo(p.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}