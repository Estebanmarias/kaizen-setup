
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Search, Eye, TrendingUp } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SearchLog = { query: string; results_count: number; created_at: string };
type ProductView = { product_name: string; slug: string; created_at: string };

export default function AdminAnalyticsPage() {
  const [searches, setSearches] = useState<SearchLog[]>([]);
  const [views, setViews] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("search_logs").select("query, results_count, created_at").order("created_at", { ascending: false }).limit(200),
      supabase.from("product_views").select("product_name, slug, created_at").order("created_at", { ascending: false }).limit(500),
    ]).then(([{ data: s }, { data: v }]) => {
      setSearches(s ?? []);
      setViews(v ?? []);
      setLoading(false);
    });
  }, []);

  // Top search terms
  const searchCounts = searches.reduce<Record<string, { count: number; noResults: number }>>((acc, s) => {
    const q = s.query.toLowerCase();
    if (!acc[q]) acc[q] = { count: 0, noResults: 0 };
    acc[q].count++;
    if (s.results_count === 0) acc[q].noResults++;
    return acc;
  }, {});
  const topSearches = Object.entries(searchCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15);

  // Zero result searches
  const zeroResults = Object.entries(searchCounts)
    .filter(([, v]) => v.noResults > 0)
    .sort((a, b) => b[1].noResults - a[1].noResults)
    .slice(0, 10);

  // Top viewed products
  const viewCounts = views.reduce<Record<string, number>>((acc, v) => {
    acc[v.product_name] = (acc[v.product_name] ?? 0) + 1;
    return acc;
  }, {});
  const topViewed = Object.entries(viewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (loading) return (
    <div className="p-8 flex flex-col gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white/[0.03] rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Search queries and product views from your visitors.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Searches", value: searches.length, icon: Search, color: "blue" },
          { label: "Total Product Views", value: views.length, icon: Eye, color: "green" },
          { label: "Zero-Result Searches", value: zeroResults.length, icon: TrendingUp, color: "red" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-gray-500">{label}</p>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                color === "blue" ? "bg-blue-500/10 text-blue-400" :
                color === "green" ? "bg-green-500/10 text-green-400" :
                "bg-red-500/10 text-red-400"
              }`}>
                <Icon size={13} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top search terms */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
          <p className="text-sm font-semibold text-white mb-1">Top Search Terms</p>
          <p className="text-xs text-gray-500 mb-5">What visitors are searching for</p>
          {topSearches.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-8">No searches yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topSearches.map(([query, { count }], i) => (
                <div key={query} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{query}</p>
                    <div className="mt-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(count / topSearches[0][1].count) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-white flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top viewed products */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
          <p className="text-sm font-semibold text-white mb-1">Most Viewed Products</p>
          <p className="text-xs text-gray-500 mb-5">By page visits</p>
          {topViewed.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-8">No views yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topViewed.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{name}</p>
                    <div className="mt-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-green-500"
                        style={{ width: `${(count / topViewed[0][1]) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-white flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zero result searches */}
      {zeroResults.length > 0 && (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6">
          <p className="text-sm font-semibold text-white mb-1">Zero-Result Searches</p>
          <p className="text-xs text-gray-500 mb-5">What visitors searched for but couldn't find — potential product gaps</p>
          <div className="flex flex-wrap gap-2">
            {zeroResults.map(([query, { noResults }]) => (
              <span key={query} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                {query} <span className="text-red-600">×{noResults}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent searches */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <p className="text-sm font-semibold text-white">Recent Searches</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {searches.slice(0, 20).map((s, i) => (
            <div key={i} className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search size={12} className="text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-300">{s.query}</span>
                {s.results_count === 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">no results</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600">{s.results_count} result{s.results_count !== 1 ? "s" : ""}</span>
                <span className="text-xs text-gray-600">
                  {new Date(s.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}