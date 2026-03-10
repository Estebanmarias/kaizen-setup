"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Check, X, Star, Clock } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Review = {
  id: string;
  rating: number;
  body: string;
  status: string;
  created_at: string;
  product_id: string;
  product_name?: string;
  user_email?: string;
};

const STATUS_STYLE: Record<string, string> = {
  pending:  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={12}
          className={n <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-700"} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
  const { data: reviewData, error: reviewError } = await supabase
    .from("reviews")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  console.log("reviewData:", reviewData);
  console.log("reviewError:", reviewError);

  if (!reviewData) { setLoading(false); return; }

  const userIds = [...new Set(reviewData.map(r => r.user_id))];
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  console.log("profiles:", profiles);
  console.log("profileError:", profileError);

  const profileMap: Record<string, string> = {};
  (profiles ?? []).forEach(p => { profileMap[p.id] = p.email ?? p.full_name ?? "Unknown"; });

  setReviews(reviewData.map(r => ({
    ...r,
    product_name: r.products?.name ?? "Unknown product",
    user_email: profileMap[r.user_id] ?? "Unknown user",
  })));
  setLoading(false);
};

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("reviews").update({ status }).eq("id", id);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const filtered = filter === "all" ? reviews : reviews.filter(r => r.status === filter);
  const counts = {
    pending: reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    rejected: reviews.filter(r => r.status === "rejected").length,
  };

  if (loading) return (
    <div className="p-8 flex flex-col gap-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/[0.03] rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">Approve or reject customer reviews before they go live.</p>
      </div>

      {/* Filter tabs */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-white">All Reviews</p>
          <div className="flex gap-1.5">
            {["all", "pending", "approved", "rejected"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === s ? "bg-blue-500 text-white" : "bg-white/[0.04] text-gray-500 hover:text-white"
                }`}>
                {s}{s !== "all" && ` (${counts[s as keyof typeof counts]})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-600 text-sm">No {filter} reviews.</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(r => (
              <div key={r.id} className="px-6 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StarDisplay rating={r.rating} />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLE[r.status]}`}>
                      {r.status}
                    </span>
                    <span className="text-xs font-medium text-white truncate">{r.product_name}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-1">{r.body}</p>
                  <p className="text-xs text-gray-600">
                    {r.user_email} · {new Date(r.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => updateStatus(r.id, "approved")} title="Approve"
                    className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors">
                    <Check size={13} />
                  </button>
                  <button onClick={() => updateStatus(r.id, "pending")} title="Mark pending"
                    className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors">
                    <Clock size={13} />
                  </button>
                  <button onClick={() => updateStatus(r.id, "rejected")} title="Reject"
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