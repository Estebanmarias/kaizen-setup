"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Signup = { id: string; email: string; created_at: string };

export default function AdminNewsletter() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("newsletter_signups").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setSignups(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Newsletter Signups</h1>
        <p className="text-gray-500 text-sm mt-1">{signups.length} subscribers</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      ) : signups.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No signups yet.</div>
      ) : (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s, i) => (
                <tr key={s.id} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                  <td className="px-5 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-5 py-3 text-sm text-white">{s.email}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {new Date(s.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
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