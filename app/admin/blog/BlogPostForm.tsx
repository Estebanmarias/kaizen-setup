"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Quote, Minus, Eye, EyeOff, Loader2
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = ["General", "Tech News", "Reviews", "Setup Guides", "Tips & Tricks"];

type PostData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  status: "draft" | "published";
};

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Toolbar button ─────────────────────────────────────────────────────────────
function ToolbarBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
      {children}
    </button>
  );
}

export default function BlogPostForm({ initial }: { initial?: Partial<PostData> }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PostData>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    cover_image: initial?.cover_image ?? "",
    category: initial?.category ?? "General",
    status: initial?.status ?? "draft",
  });

  const set = (k: keyof PostData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleTitle = (v: string) => {
    set("title", v);
    if (!initial?.slug) set("slug", slugify(v));
  };

  // ── Toolbar helpers ──────────────────────────────────────────────────────────
  const wrap = (before: string, after: string, placeholder = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.substring(start, end) || placeholder;
    const newContent = form.content.substring(0, start) + before + selected + after + form.content.substring(end);
    set("content", newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertLine = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = form.content.lastIndexOf("\n", start - 1) + 1;
    const newContent = form.content.substring(0, lineStart) + prefix + form.content.substring(lineStart);
    set("content", newContent);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, start + prefix.length); }, 0);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (!url) return;
    wrap(`[`, `](${url})`, "link text");
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (!url) return;
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const ins = `\n![Image](${url})\n`;
    set("content", form.content.substring(0, pos) + ins + form.content.substring(pos));
  };

  // ── Simple markdown → HTML preview ──────────────────────────────────────────
  const renderPreview = (md: string) => {
    return md
      .replace(/^### (.+)$/gm, "<h3 class='text-lg font-bold mt-6 mb-2'>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold mt-8 mb-3'>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold mt-8 mb-4'>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^> (.+)$/gm, "<blockquote class='border-l-4 border-blue-500 pl-4 italic text-gray-500 my-4'>$1</blockquote>")
      .replace(/^---$/gm, "<hr class='my-6 border-gray-200 dark:border-gray-700' />")
      .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
      .replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>")
      .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-blue-500 hover:underline' target='_blank'>$1</a>")
      .replace(/!\[(.+?)\]\((.+?)\)/g, "<img src='$2' alt='$1' class='rounded-xl my-4 max-w-full' />")
      .replace(/\n\n/g, "</p><p class='mb-4'>")
      .replace(/^(?!<[h|b|l|i|p])(.+)$/gm, "<p class='mb-4'>$1</p>");
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const save = async (status: "draft" | "published") => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.content.trim()) { setError("Content is required."); return; }
    if (!form.slug.trim()) { setError("Slug is required."); return; }
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      status,
      slug: slugify(form.slug),
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    let err;
    if (initial?.id) {
      ({ error: err } = await supabase.from("blog_posts").update(payload).eq("id", initial.id));
    } else {
      ({ error: err } = await supabase.from("blog_posts").insert(payload));
    }

    if (err) { setError(err.message); setSaving(false); return; }
    router.push("/admin/blog");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {initial?.id ? "Edit Post" : "New Post"}
        </h1>
        <button onClick={() => router.push("/admin/blog")}
          className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          ← Back
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* Title */}
        <input value={form.title} onChange={e => handleTitle(e.target.value)}
          placeholder="Post title..."
          className="text-2xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none pb-2 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 transition-colors" />

        {/* Slug + Category row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Slug</label>
            <input value={form.slug} onChange={e => set("slug", slugify(e.target.value))}
              placeholder="post-url-slug"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-mono" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Excerpt</label>
          <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)}
            placeholder="Short description shown on the blog listing page..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" />
        </div>

        {/* Cover image */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Cover Image URL</label>
          <input value={form.cover_image} onChange={e => set("cover_image", e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
        </div>

        {/* Content editor */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] flex-wrap">
            <ToolbarBtn onClick={() => wrap("**", "**", "bold text")} title="Bold"><Bold size={15} /></ToolbarBtn>
            <ToolbarBtn onClick={() => wrap("*", "*", "italic text")} title="Italic"><Italic size={15} /></ToolbarBtn>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <ToolbarBtn onClick={() => insertLine("## ")} title="Heading 2"><Heading2 size={15} /></ToolbarBtn>
            <ToolbarBtn onClick={() => insertLine("### ")} title="Heading 3"><Heading3 size={15} /></ToolbarBtn>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <ToolbarBtn onClick={() => insertLine("- ")} title="Bullet list"><List size={15} /></ToolbarBtn>
            <ToolbarBtn onClick={() => insertLine("1. ")} title="Numbered list"><ListOrdered size={15} /></ToolbarBtn>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <ToolbarBtn onClick={() => insertLine("> ")} title="Quote"><Quote size={15} /></ToolbarBtn>
            <ToolbarBtn onClick={() => insertLine("---")} title="Divider"><Minus size={15} /></ToolbarBtn>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <ToolbarBtn onClick={insertLink} title="Insert link"><LinkIcon size={15} /></ToolbarBtn>
            <ToolbarBtn onClick={insertImage} title="Insert image"><ImageIcon size={15} /></ToolbarBtn>
            <div className="flex-1" />
            <button type="button" onClick={() => setPreview(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
              {preview ? <><EyeOff size={13} /> Edit</> : <><Eye size={13} /> Preview</>}
            </button>
          </div>

          {/* Editor / Preview */}
          {preview ? (
            <div
              className="min-h-[400px] p-5 prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-white"
              dangerouslySetInnerHTML={{ __html: renderPreview(form.content) }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={form.content}
              onChange={e => set("content", e.target.value)}
              placeholder="Write your post here... Use ## for headings, **bold**, *italic*, - for bullets"
              className="w-full min-h-[400px] p-5 bg-white dark:bg-[#0f0f0f] text-sm text-gray-900 dark:text-white focus:outline-none resize-y font-mono leading-relaxed"
            />
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => save("published")} disabled={saving}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {saving ? "Saving..." : "Publish"}
          </button>
          <button onClick={() => save("draft")} disabled={saving}
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}