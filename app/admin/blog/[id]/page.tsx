"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BlogPostForm from "../../blog/BlogPostForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("id", id).single()
      .then(({ data }) => { setPost(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-64 bg-gray.200 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );

  if (!post) return (
    <div className="p-6 text-center text-gray-400">Post not found.</div>
  );

  return <BlogPostForm initial={post} />;
}