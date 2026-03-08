"use client";

import { useEffect, useState } from "react";
import { MediumPost } from "@/lib/medium";
import Link from "next/link";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function readTime(excerpt: string) {
  return `${Math.max(1, Math.ceil(excerpt.split(" ").length / 200))} min read`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<MediumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        {/* ── Coming Soon Banner ── */}
        <div className="mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">The Blog</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Coming Soon
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mb-8">
            We're building a proper home for our tech guides, honest reviews, and setup breakdowns.
            In the meantime, find our latest writing on Medium below.
          </p>
          <div className="inline-flex items-center gap-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl px-6 py-4">
            <span className="text-2xl">🔧</span>
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Full blog launching soon</p>
              <p className="text-xs text-blue-500 dark:text-blue-400">Guides, reviews, and setup breakdowns — hosted right here.</p>
            </div>
          </div>
        </div>

        {/* ── Medium RSS Fallback ── */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">From Our Medium</p>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 animate-pulse h-52" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <p className="text-3xl mb-3">📭</p>
              <p>No Medium posts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <a key={post.link} href={post.link} target="_blank" rel="noopener noreferrer"
                  className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors flex flex-col group">
                  {post.categories[0] && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 w-fit mb-4">
                      {post.categories[0]}
                    </span>
                  )}
                  <h2 className="font-semibold text-base mb-2 text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
                    <span>{formatDate(post.date)}</span>
                    <span>{readTime(post.excerpt)}</span>
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <a href="https://medium.com/@kaizensetup.ng" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline">
              Read all posts on Medium →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}