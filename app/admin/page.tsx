"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Clock, X } from "lucide-react";

type Order = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  setup_type: string;
  status: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  fulfilled: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("consultation_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    if (!supabase) return;
    await supabase.from("consultation_requests").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "fulfilled", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === s ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No orders found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(order => (
            <div key={order.id}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-white text-sm">{order.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {order.email} · {order.phone} · {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-sm text-gray-400 truncate">{order.message}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => updateStatus(order.id, "fulfilled")}
                  title="Mark fulfilled"
                  className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                  <Check size={14} />
                </button>
                <button onClick={() => updateStatus(order.id, "pending")}
                  title="Mark pending"
                  className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors">
                  <Clock size={14} />
                </button>
                <button onClick={() => updateStatus(order.id, "cancelled")}
                  title="Mark cancelled"
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}