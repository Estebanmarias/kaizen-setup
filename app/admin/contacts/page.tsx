"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Contact Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">{contacts.length} submissions</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No contact submissions yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {contacts.map(c => (
            <div key={c.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-white text-sm">{c.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <p className="text-xs text-gray-500 mb-3">{c.email} · {c.phone}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}