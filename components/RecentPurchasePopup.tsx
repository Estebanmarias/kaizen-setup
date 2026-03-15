"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, X } from "lucide-react";

type Purchase = {
  name: string;
  item: string;
  timeAgo: string;
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return "recently";
}

export default function RecentPurchasePopup() {
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("recent_purchase_shown")) return;

    if (!supabase) return;

    // Delay 8 seconds before showing
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("consultation_requests")
        .select("name, items, created_at")
        .eq("payment_status", "paid")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!data?.length) return;

      // Pick a random recent paid order
      const order = data[Math.floor(Math.random() * data.length)];
      const items = order.items as { name: string }[] | null;
      if (!items?.length) return;

      const firstName = order.name?.split(" ")[0] ?? "Someone";
      const itemName = items[0].name;

      setPurchase({
        name: firstName,
        item: itemName.length > 32 ? itemName.slice(0, 32) + "…" : itemName,
        timeAgo: timeAgo(order.created_at),
      });
      setVisible(true);
      sessionStorage.setItem("recent_purchase_shown", "true");

      // Auto-dismiss after 6 seconds
      setTimeout(() => setVisible(false), 6000);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!purchase) return null;

  return (
    <div className={`fixed bottom-6 left-4 z-50 transition-all duration-500 ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
    }`}>
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 max-w-[280px]">
        <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={16} className="text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 leading-snug">
            {purchase.name} just bought
          </p>
          <p className="text-xs text-gray-500 truncate">{purchase.item}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{purchase.timeAgo}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 ml-1">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}