"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Users, Search, Download } from "lucide-react";

type Subscriber = { id: string; email: string; created_at: string };
type RegisteredUser = { id: string; email: string; full_name: string | null; avatar_url: string | null; created_at: string };

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"subscribers" | "users">("subscribers");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("newsletter_signups").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]).then(([{ data: subs }, { data: u }]) => {
      setSubscribers(subs ?? []);
      setUsers(u ?? []);
      setLoading(false);
    });
  }, []);

  const filteredSubs = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const rows = tab === "subscribers"
      ? filteredSubs.map(s => `${s.email},${s.created_at}`)
      : filteredUsers.map(u => `${u.email},${u.full_name ?? ""},${u.created_at}`);
    const header = tab === "subscribers" ? "Email,Joined" : "Email,Name,Joined";
    const blob = new Blob([`${header}\n${rows.join("\n")}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kaizen-${tab}-${Date.now()}.csv`; a.click();
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="p-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: "Newsletter Subscribers", value: subscribers.length, icon: Mail, color: "blue" },
          { label: "Registered Users", value: users.length, icon: Users, color: "green" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
              color === "blue" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"
            }`}>
              <Icon size={15} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search + Export */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          {/* Tabs */}
          <div className="flex bg-white/[0.04] rounded-lg p-0.5">
            {(["subscribers", "users"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setSearch(""); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tab === t ? "bg-white/[0.08] text-white" : "text-gray-500 hover:text-gray-300"
                }`}>
                {t === "subscribers" ? <Mail size={12} /> : <Users size={12} />}
                {t === "subscribers" ? "Subscribers" : "Registered Users"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-lg pl-8 pr-4 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          {/* Export */}
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-all flex-shrink-0">
            <Download size={12} /> Export CSV
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-white/[0.03] rounded-lg animate-pulse" />)}
          </div>
        ) : tab === "subscribers" ? (
          filteredSubs.length === 0 ? <Empty /> : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredSubs.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 text-[10px] font-bold flex-shrink-0">
                          {s.email[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-white">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{fmt(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          filteredUsers.length === 0 ? <Empty /> : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">User</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center text-green-400 text-[10px] font-bold flex-shrink-0">
                            {(u.full_name ?? u.email)[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-white">{u.full_name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{fmt(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

function Empty() {
  return <div className="py-14 text-center text-gray-600 text-sm">No results found.</div>;
}