"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("blog_posts")
      .select("id, title, slug, excerpt, category, status, published_at, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false); });
  }, []);

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    if (!supabase) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const toggleStatus = async (post: BlogPost) => {
    if (!supabase) return;
    const newStatus = post.status === "published" ? "draft" : "published";
    const payload: any = { status: newStatus };
    if (newStatus === "published" && !post.published_at) {
      payload.published_at = new Date().toISOString();
    }
    await supabase.from("blog_posts").update(payload).eq("id", post.id);
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, ...payload } : p));
  };

  if (loading) return (
    <div className="p-8 flex flex-col gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-white/[0.03] rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-xl font-bold text-white">Blog Posts</h1>
          <p className="text-xs text-gray-500 mt-0.5">{posts.length} posts</p>
        </div>
        <Link href="/admin/blog/new"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={15} /> New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl py-16 text-center">
          <p className="text-gray-600 text-sm mb-4">No posts yet.</p>
          <Link href="/admin/blog/new"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus size={15} /> Write your first post
          </Link>
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {posts.map(post => (
              <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-white truncate">{post.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                      post.status === "published"
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-gray-500/10 border-gray-500/20 text-gray-500"
                    }`}>
                      {post.status}
                    </span>
                    {post.category && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex-shrink-0">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {post.published_at ? `Published ${formatDate(post.published_at)}` : `Created ${formatDate(post.created_at)}`}
                    {" · "}/blog/{post.slug}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleStatus(post)} title={post.status === "published" ? "Unpublish" : "Publish"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      post.status === "published"
                        ? "bg-green-500/10 hover:bg-green-500/20 text-green-400"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-gray-500"
                    }`}>
                    {post.status === "published" ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <Link href={`/admin/blog/${post.id}/edit`} title="Edit"
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-colors">
                    <Pencil size={13} />
                  </Link>
                  <button onClick={() => deletePost(post.id)} title="Delete"
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