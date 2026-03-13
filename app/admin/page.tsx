"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShoppingBag, TrendingUp, Clock, XCircle, CreditCard,
  Check, X, ArrowUpRight, ArrowDownRight, Download
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
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
  payment_status: string | null; // "paid" | "unpaid" | null
  items: { name: string; quantity: number; price?: number; variant?: string }[] | null;
};

type Product = { name: string; category: string };

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  fulfilled: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  cancellation_requested: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function buildWeeklyData(orders: Order[]) {
  const now = new Date();
  return Array.from({ length: 8 }, (_, i) => {
    const start = new Date(now);
    start.setDate(now.getDate() - (7 - i) * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const label = start.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
    const bucket = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= start && d <= end && o.status !== "cancelled";
    });
    return { label, revenue: bucket.reduce((s, o) => s + (o.total_naira ?? 0), 0), count: bucket.length };
  });
}

function buildTopProducts(orders: Order[]) {
  const counts: Record<string, number> = {};
  orders.filter(o => o.status !== "cancelled").forEach(o => {
    (o.items ?? []).forEach(item => {
      counts[item.name] = (counts[item.name] ?? 0) + item.quantity;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 22) + "…" : name, count }));
}

function buildCategoryRevenue(orders: Order[], products: Product[]) {
  const catMap: Record<string, string> = {};
  products.forEach(p => { catMap[p.name] = p.category; });

  const revenue: Record<string, number> = {};
  orders.filter(o => o.status === "fulfilled").forEach(o => {
    (o.items ?? []).forEach(item => {
      const cat = catMap[item.name] ?? "Other";
      const itemRevenue = item.price ? item.price * item.quantity : 0;
      revenue[cat] = (revenue[cat] ?? 0) + itemRevenue;
    });
  });
  return Object.entries(revenue)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, revenue]) => ({ cat: cat.length > 14 ? cat.slice(0, 14) + "…" : cat, revenue }));
}

const BAR_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e"];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("consultation_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("name,category"),
    ]).then(([{ data: orders }, { data: products }]) => {
      setOrders(orders ?? []);
      setProducts(products ?? []);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (id: string, status: string) => {
  const res = await fetch("/api/update-order-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });

  if (res.ok) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  } else {
    console.error("Failed to update order status");
  }
};

  const markAsPaid = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase
    .from("consultation_requests")
    .update({ payment_status: "paid" })
    .eq("id", id);

  if (!error) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: "paid" } : o));
  } else {
    console.error("Failed to mark as paid", error);
  }
};

const handleExportCSV = () => {
  const from = exportFrom ? new Date(exportFrom) : null;
  const to = exportTo ? new Date(exportTo) : null;
  if (to) to.setHours(23, 59, 59, 999);

  const rows = orders.filter(o => {
    const d = new Date(o.created_at);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });

  const headers = ["Date", "Name", "Email", "Phone", "Status", "Items", "Total (₦)", "Payment Status", "Promo Code", "Discount (₦)"];
  const lines = rows.map(o => [
    new Date(o.created_at).toLocaleDateString("en-NG"),
    o.name,
    o.email,
    o.phone,
    o.status,
    (o.items ?? []).map(i => `${i.name} x${i.quantity}${i.variant ? ` (${i.variant})` : ""}`).join(" | "),
    o.total_naira ?? "",
    (o as any).payment_status ?? "",
    (o as any).promo_code ?? "",
    (o as any).discount_naira ?? "",
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kaizen-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

  const pending   = orders.filter(o => o.status === "pending");
  const fulfilled = orders.filter(o => o.status === "fulfilled");
  const cancelled = orders.filter(o => o.status === "cancelled");
  const revenue   = fulfilled.reduce((s, o) => s + (o.total_naira ?? 0), 0);
  const avgOrder  = fulfilled.length ? Math.round(revenue / fulfilled.length) : 0;

  const thisMonth = orders.filter(o => {
    const d = new Date(o.created_at), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = orders.filter(o => {
    const d = new Date(o.created_at), now = new Date();
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const orderGrowth = lastMonth.length
    ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100)
    : null;

  const weekly         = buildWeeklyData(orders);
  const topProducts    = buildTopProducts(orders);
  const categoryRevenue = buildCategoryRevenue(orders, products);
  const filtered       = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const STATS = [
    {
      label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "blue",
      sub: orderGrowth !== null
        ? { text: `${orderGrowth >= 0 ? "+" : ""}${orderGrowth}% vs last month`, up: orderGrowth >= 0 }
        : { text: `This month: ${thisMonth.length}`, up: true },
    },
    {
      label: "Revenue (Fulfilled)", value: fmt(revenue), icon: TrendingUp, color: "green",
      sub: { text: `Avg order: ${fmt(avgOrder)}`, up: true },
    },
    {
      label: "Pending", value: pending.length, icon: Clock, color: "yellow",
      sub: { text: "Needs attention", up: false },
    },
    {
      label: "Cancelled", value: cancelled.length, icon: XCircle, color: "red",
      sub: { text: `${orders.length ? Math.round((cancelled.length / orders.length) * 100) : 0}% of total`, up: false },
    },
  ];

  const colorMap: Record<string, string> = {
    blue:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green:  "bg-green-500/10 text-green-400 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    red:    "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const tooltipStyle = {
    contentStyle: { background: "#1a1a1a", border: "1px solid #ffffff14", borderRadius: "10px", fontSize: "12px" },
    labelStyle: { color: "#9ca3af", marginBottom: "4px" },
    itemStyle: { color: "#ffffff" },
    cursor: { stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" },
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

      {/* Revenue chart + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue area chart */}
        <div className="lg:col-span-2 bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
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
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v === 0 ? "0" : `₦${(v / 1000).toFixed(0)}k`} width={48} />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [fmt(v as number), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2}
                fill="url(#revenueGrad)" dot={false}
                activeDot={{ r: 4, fill: "#3b82f6", stroke: "#0a0a0a", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
          <p className="text-sm font-semibold text-white mb-1">Top Products</p>
          <p className="text-xs text-gray-500 mb-5">By units ordered</p>
          {topProducts.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-8">No item data yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{p.name}</p>
                    <div className="mt-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(p.count / topProducts[0].count) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-white flex-shrink-0">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category revenue bar chart */}
      {categoryRevenue.length > 0 && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold text-white">Revenue by Category</p>
            <p className="text-xs text-gray-500 mt-0.5">Fulfilled orders only</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="cat" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v === 0 ? "0" : `₦${(v / 1000).toFixed(0)}k`} width={48} />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [fmt(v as number), "Revenue"]} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {categoryRevenue.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-white/[0.06]">
  <div className="flex items-center justify-between gap-3 flex-wrap">
    <p className="text-sm font-semibold text-white">Orders</p>
    <div className="flex items-center gap-2 flex-wrap">
      <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)}
        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-blue-500" />
      <span className="text-xs text-gray-600">to</span>
      <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)}
        className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-gray-400 focus:outline-none focus:border-blue-500" />
      <button onClick={handleExportCSV}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors">
        <Download size={12} /> Export CSV
      </button>
    </div>
  </div>
  <div className="flex gap-1.5 flex-wrap">
    {["all", "pending", "cancellation_requested", "fulfilled", "cancelled"].map(s => (
      <button key={s} onClick={() => setFilter(s)}
        className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
          filter === s ? "bg-blue-500 text-white" : "bg-white/[0.04] text-gray-500 hover:text-white"
        }`}>
        {s === "cancellation_requested"
          ? `Cancel Req (${orders.filter(o => o.status === "cancellation_requested").length})`
          : `${s}${s !== "all" ? ` (${orders.filter(o => o.status === s).length})` : ""}`}
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
    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
      <p className="text-sm font-medium text-white truncate">{order.name}</p>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLE[order.status] ?? STATUS_STYLE.pending}`}>
        {order.status}
      </span>
      {/* Payment badge */}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
        order.payment_status === "paid"
          ? "bg-green-500/10 border-green-500/20 text-green-400"
          : "bg-gray-500/10 border-gray-500/20 text-gray-500"
      }`}>
        {order.payment_status === "paid" ? "paid" : "unpaid"}
      </span>
    </div>
    <p className="text-xs text-gray-500 truncate">
      {order.email} · {order.phone}
      {order.total_naira ? ` · ${fmt(order.total_naira)}` : ""}
      {" · "}{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
    </p>
    {Array.isArray(order.items) && order.items.length > 0 && (
      <p className="text-xs text-gray-600 truncate mt-0.5">
        {order.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
      </p>
    )}
  </div>
  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
    {/* Mark as Paid button — only show for unpaid orders */}
    {order.payment_status !== "paid" && (
      <button onClick={() => markAsPaid(order.id)} title="Mark as paid"
        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors">
        <CreditCard size={13} />
      </button>
    )}
    {order.status === "cancellation_requested" ? (
      <>
        <button onClick={() => updateStatus(order.id, "cancelled")} title="Approve cancellation"
          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
          <Check size={13} />
        </button>
        <button onClick={() => updateStatus(order.id, "pending")} title="Reject cancellation"
          className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors">
          <X size={13} />
        </button>
      </>
    ) : (
      <>
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
      </>
    )}
  </div>
</div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}