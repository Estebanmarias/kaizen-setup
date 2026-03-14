"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, ChevronDown, ChevronUp, MessageCircle, Mail } from "lucide-react";

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_naira: number | null;
  payment_status: string | null;
  items: { name: string; quantity: number; variant?: string }[] | null;
};

type Customer = {
  name: string;
  email: string;
  phone: string;
  orders: Order[];
  totalSpend: number;
  lastOrder: string;
};

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

const STATUS_STYLE: Record<string, string> = {
  pending:                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  fulfilled:              "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled:              "bg-red-500/10 text-red-400 border-red-500/20",
  cancellation_requested: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("consultation_requests")
      .select("id, name, email, phone, status, created_at, total_naira, payment_status, items")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }

        // Group by email
        const map: Record<string, Customer> = {};
        data.forEach(o => {
          const key = o.email?.toLowerCase();
          if (!key) return;
          if (!map[key]) {
            map[key] = {
              name: o.name,
              email: o.email,
              phone: o.phone,
              orders: [],
              totalSpend: 0,
              lastOrder: o.created_at,
            };
          }
          map[key].orders.push(o);
          if (o.status === "fulfilled" && o.total_naira) {
            map[key].totalSpend += o.total_naira;
          }
          if (o.created_at > map[key].lastOrder) {
            map[key].lastOrder = o.created_at;
          }
        });

        // Sort by most recent order
        const sorted = Object.values(map).sort(
          (a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
        );
        setCustomers(sorted);
        setLoading(false);
      });
  }, []);

  const filtered = search.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
      )
    : customers;

  if (loading) return (
    <div className="p-8 flex flex-col gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-white/[0.03] rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-xl font-bold text-white">Customers</h1>
          <p className="text-xs text-gray-500 mt-0.5">{customers.length} unique customers</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-4 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: customers.length },
          { label: "Repeat Buyers", value: customers.filter(c => c.orders.length > 1).length },
          { label: "Total Revenue", value: fmt(customers.reduce((s, c) => s + c.totalSpend, 0)) },
          { label: "Avg Spend", value: customers.length ? fmt(Math.round(customers.reduce((s, c) => s + c.totalSpend, 0) / customers.filter(c => c.totalSpend > 0).length || 0)) : "₦0" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Customer list */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-600 text-sm">No customers found.</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(c => (
              <div key={c.email}>
                {/* Customer row */}
                <div className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-400">
                      {c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{c.name}</p>
                      {c.orders.length > 1 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          {c.orders.length}x buyer
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {c.email} · {c.phone}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-sm font-bold text-white">{c.totalSpend > 0 ? fmt(c.totalSpend) : "—"}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(c.lastOrder).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a href={`mailto:${c.email}`} title="Send email"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors">
                      <Mail size={13} />
                    </a>
                    {c.phone && (
                      <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition-colors">
                        <MessageCircle size={13} />
                      </a>
                    )}
                    <button onClick={() => setExpanded(expanded === c.email ? null : c.email)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors">
                      {expanded === c.email ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {/* Expanded order history */}
                {expanded === c.email && (
                  <div className="border-t border-white/[0.04] bg-black/20 px-5 py-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                      Order History ({c.orders.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {c.orders.map(o => (
                        <div key={o.id} className="flex items-start justify-between gap-4 bg-white/[0.02] rounded-xl px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${STATUS_STYLE[o.status] ?? STATUS_STYLE.pending}`}>
                                {o.status}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                                o.payment_status === "paid"
                                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                                  : "bg-gray-500/10 border-gray-500/20 text-gray-500"
                              }`}>
                                {o.payment_status === "paid" ? "paid" : "unpaid"}
                              </span>
                            </div>
                            {o.items && o.items.length > 0 && (
                              <p className="text-xs text-gray-400 truncate">
                                {o.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {o.total_naira && <p className="text-xs font-semibold text-white">{fmt(o.total_naira)}</p>}
                            <p className="text-[10px] text-gray-600 mt-0.5">
                              {new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}