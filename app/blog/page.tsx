"use client";

import { useEffect, useState } from "react";
import { MediumPost } from "@/lib/medium";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

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
    <main className="min-h-screen bg-white pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline mb-10">
          <ArrowLeft size={13} /> Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-500">The Blog</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Articles & Guides</h1>
          <p className="text-gray-500 max-w-xl">
            Tech guides, honest reviews, and setup breakdowns — written from real experience in the Nigerian market.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mb-10 border-b border-gray-100">
          <button className="text-sm font-semibold text-gray-900 border-b-2 border-blue-500 pb-3 px-1 mr-2">
            Articles
          </button>
          <Link
            href="/workspace-tours"
            className="text-sm font-medium text-gray-400 hover:text-gray-700 border-b-2 border-transparent pb-3 px-1 transition-colors"
          >
            Workspace Tours
          </Link>
        </div>

        {/* Medium posts */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gray-100" />
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">From Our Medium</p>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 animate-pulse h-52" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <p className="text-3xl mb-3">📭</p>
              <p>No Medium posts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map(post => (
                <a key={post.link} href={post.link} target="_blank" rel="noopener noreferrer"
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-sm transition-all flex flex-col group">
                  {post.categories[0] && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 w-fit mb-4">
                      {post.categories[0]}
                    </span>
                  )}
                  <h2 className="font-bold text-base mb-2 text-gray-900 group-hover:text-blue-500 transition-colors flex-1">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(post.date)}</span>
                    <span className="flex items-center gap-1">{readTime(post.excerpt)} <ArrowUpRight size={11} /></span>
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <a href="https://medium.com/@kaizensetup.ng" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:underline">
              Read all posts on Medium <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}