"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type Tour = {
  id: string;
  name: string;
  slug: string;
  occupation: string | null;
  location: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("workspace_tours")
      .select("id, name, slug, occupation, location, status, published_at, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setTours(data ?? []); setLoading(false); });
  }, []);

  const deleteTour = async (id: string) => {
    if (!confirm("Delete this tour? This cannot be undone.")) return;
    if (!supabase) return;
    await supabase.from("workspace_tours").delete().eq("id", id);
    setTours(prev => prev.filter(t => t.id !== id));
  };

  const toggleStatus = async (tour: Tour) => {
    if (!supabase) return;
    const newStatus = tour.status === "published" ? "draft" : "published";
    const payload: any = { status: newStatus };
    if (newStatus === "published" && !tour.published_at) {
      payload.published_at = new Date().toISOString();
    }
    await supabase.from("workspace_tours").update(payload).eq("id", tour.id);
    setTours(prev => prev.map(t => t.id === tour.id ? { ...t, ...payload } : t));
  };

  if (loading) return (
    <div className="p-8 flex flex-col gap-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white/[0.03] rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-xl font-bold text-white">Workspace Tours</h1>
          <p className="text-xs text-gray-500 mt-0.5">{tours.length} tours</p>
        </div>
        <Link href="/admin/tours/new"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={15} /> New Tour
        </Link>
      </div>

      {tours.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl py-16 text-center">
          <p className="text-gray-600 text-sm mb-4">No workspace tours yet.</p>
          <Link href="/admin/tours/new"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus size={15} /> Add your first tour
          </Link>
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {tours.map(tour => (
              <div key={tour.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-white truncate">{tour.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                      tour.status === "published"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-gray-500/10 border-gray-500/20 text-gray-500"
                    }`}>{tour.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {tour.occupation}{tour.location ? ` · ${tour.location}` : ""}
                    {" · "}{tour.published_at ? `Published ${formatDate(tour.published_at)}` : `Created ${formatDate(tour.created_at)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleStatus(tour)} title={tour.status === "published" ? "Unpublish" : "Publish"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      tour.status === "published"
                        ? "bg-green-500/10 hover:bg-green-500/20 text-green-400"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-gray-500"
                    }`}>
                    {tour.status === "published" ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <Link href={`/admin/tours/${tour.id}/edit`}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors">
                    <Pencil size={13} />
                  </Link>
                  <button onClick={() => deleteTour(tour.id)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}