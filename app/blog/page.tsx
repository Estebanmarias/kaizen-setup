"use client";

import { useEffect, useState } from "react";
import { MediumPost } from "@/lib/medium";
import Link from "next/link";

const CATEGORIES = ["All", "Tech News", "Reviews", "Setup Guides"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function readTime(excerpt: string) {
  const words = excerpt.split(" ").length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<MediumPost[]>([]);
  const [filtered, setFiltered] = useState<MediumPost[]>([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filter = (cat: string) => {
    setActive(cat);
    if (cat === "All") {
      setFiltered(posts);
    } else {
      setFiltered(
        posts.filter((p) =>
          p.categories.some((c) =>
            c.toLowerCase().includes(cat.toLowerCase())
          )
        )
      );
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-sm text-emerald-500 hover:underline mb-8 inline-block"
        >
          ← Back to Home
        </Link>

        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-500 mb-3">
          The Blog
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          All Articles
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl">
          Tech news, honest reviews, and setup guides from KaizenSetup.
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => filter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                active === cat
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 animate-pulse h-52"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-medium">No posts found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <a
                key={post.link}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors flex flex-col group"
              >
                {post.categories[0] && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 w-fit mb-4">
                    {post.categories[0]}
                  </span>
                )}
                <h2 className="font-semibold text-base mb-2 text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
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
      </div>
    </main>
  );
}