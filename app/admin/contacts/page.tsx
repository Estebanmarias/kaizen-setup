"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Mail, Phone } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
};

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("contact_submissions").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setContacts(data ?? []); setLoading(false); });
  }, []);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="p-8">
      <p className="text-xs text-gray-500 mb-6">{contacts.length} submissions</p>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/[0.03] rounded-2xl animate-pulse" />)}
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl py-16 text-center text-gray-600 text-sm">
          No contact submissions yet.
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.04] overflow-hidden">
          {contacts.map(c => (
            <div key={c.id} className="px-6 py-5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                    {c.name[0].toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                </div>
                <p className="text-xs text-gray-600 flex-shrink-0">{fmt(c.created_at)}</p>
              </div>
              <div className="flex items-center gap-4 mb-3 ml-11">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail size={11} /> {c.email}
                </span>
                {c.phone && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={11} /> {c.phone}
                  </span>
                )}
              </div>
              <div className="ml-11 flex items-start gap-2">
                <MessageSquare size={12} className="text-gray-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-400 leading-relaxed">{c.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}