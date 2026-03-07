"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShoppingBag, TrendingUp, Clock, XCircle,
  Check, X, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

type Order = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  setup_type: string;
  status: string;
  created_at: string;
  total_naira: number | null;
  items: unknown;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  fulfilled: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

// Build last 8 weeks buckets from orders
function buildWeeklyData(orders: Order[]) {
  const now = new Date();
  const weeks: { label: string; revenue: number; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i * 7 - 6);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const label = start.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
    const bucket = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= start && d <= end && o.status !== "cancelled";
    });
    weeks.push({ label, revenue: bucket.reduce((s, o) => s + (o.total_naira ?? 0), 0), count: bucket.length });
  }
  return weeks;
}

export default function AdminDashboard() {
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

  const pending = orders.filter(o => o.status === "pending");
  const fulfilled = orders.filter(o => o.status === "fulfilled");
  const cancelled = orders.filter(o => o.status === "cancelled");
  const revenue = fulfilled.reduce((s, o) => s + (o.total_naira ?? 0), 0);

  const thisMonth = orders.filter(o => {
    const d = new Date(o.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = orders.filter(o => {
    const d = new Date(o.created_at);
    const now = new Date();
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const orderGrowth = lastMonth.length ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100) : null;

  const weekly = buildWeeklyData(orders);
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const STATS = [
    {
      label: "Total Orders", value: orders.length, icon: ShoppingBag,
      sub: orderGrowth !== null
        ? { text: `${orderGrowth >= 0 ? "+" : ""}${orderGrowth}% vs last month`, up: orderGrowth >= 0 }
        : { text: "This month: " + thisMonth.length, up: true },
      color: "blue",
    },
    {
      label: "Revenue (Fulfilled)", value: fmt(revenue), icon: TrendingUp,
      sub: { text: `${fulfilled.length} fulfilled orders`, up: true },
      color: "green",
    },
    {
      label: "Pending", value: pending.length, icon: Clock,
      sub: { text: "Needs attention", up: false },
      color: "yellow",
    },
    {
      label: "Cancelled", value: cancelled.length, icon: XCircle,
      sub: { text: `${orders.length ? Math.round((cancelled.length / orders.length) * 100) : 0}% of total`, up: false },
      color: "red",
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  if (loading) return (
    <div className="p-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/[0.03] rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-8">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, sub, color }) => (
          <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
                <Icon size={14} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <div className="flex items-center gap-1">
              {sub.up
                ? <ArrowUpRight size={12} className="text-green-400" />
                : <ArrowDownRight size={12} className="text-red-400" />}
              <p className="text-xs text-gray-500">{sub.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-white">Revenue (8 weeks)</p>
            <p className="text-xs text-gray-500 mt-0.5">Fulfilled orders only</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-500">Weekly revenue</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weekly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v === 0 ? "0" : `₦${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff14", borderRadius: "10px", fontSize: "12px" }}
              labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
              itemStyle={{ color: "#ffffff" }}
              formatter={(v: unknown) => [fmt(v as number), "Revenue"]}
              cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6", stroke: "#0a0a0a", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders table */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-white">Orders</p>
          <div className="flex gap-1.5">
            {["all", "pending", "fulfilled", "cancelled"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === s ? "bg-blue-500 text-white" : "bg-white/[0.04] text-gray-500 hover:text-white"
                }`}>
                {s}{s !== "all" && ` (${orders.filter(o => o.status === s).length})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-600 text-sm">No orders found.</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(order => (
              <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white truncate">{order.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLE[order.status] ?? STATUS_STYLE.pending}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {order.email} · {order.phone}
                    {order.total_naira ? ` · ${fmt(order.total_naira)}` : ""}
                    {" · "}{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {order.message && <p className="text-xs text-gray-600 truncate mt-0.5">{order.message}</p>}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => updateStatus(order.id, "fulfilled")} title="Mark fulfilled"
                    className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                    <Check size={13} />
                  </button>
                  <button onClick={() => updateStatus(order.id, "pending")} title="Mark pending"
                    className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors">
                    <Clock size={13} />
                  </button>
                  <button onClick={() => updateStatus(order.id, "cancelled")} title="Mark cancelled"
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}