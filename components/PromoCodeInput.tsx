"use client";

import { useState } from "react";
import { Tag } from "lucide-react";

interface Props {
  totalNaira: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  applied: boolean;
  appliedCode: string;
  discountAmount: number;
}

export default function PromoCodeInput({
  totalNaira, onApply, onRemove, applied, appliedCode, discountAmount
}: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await fetch("/api/apply-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim(), total_naira: totalNaira }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Invalid promo code.");
      return;
    }

    setSuccessMsg(data.message);
    onApply(data.discount_naira, code.trim().toUpperCase());
    setCode("");
  };

  const handleRemove = () => {
    setSuccessMsg("");
    setError("");
    setCode("");
    onRemove();
  };

  // ── Coming Soon state ──────────────────────────────────────────
  const COMING_SOON = true; // flip to false when launching promo codes

  if (COMING_SOON) {
    return (
      <div className="flex items-center gap-2 py-3 border-t border-gray-100 dark:border-gray-800">
        <Tag size={15} className="text-gray-300 dark:text-gray-600 shrink-0" />
        <span className="text-sm text-gray-300 dark:text-gray-600 select-none">Promo code</span>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full">
          Coming Soon
        </span>
      </div>
    );
  }
  // ──────────────────────────────────────────────────────────────

  if (applied) {
    return (
      <div className="flex items-center gap-2 py-3 border-t border-gray-100 dark:border-gray-800">
        <Tag size={15} className="text-green-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-600 dark:text-green-400 truncate">
            {appliedCode} — save ₦{discountAmount.toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="py-3 border-t border-gray-100 dark:border-gray-800">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
          <Tag size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleApply()}
            placeholder="Promo code"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "..." : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      {successMsg && <p className="text-xs text-green-500 mt-1.5">{successMsg}</p>}
    </div>
  );
}