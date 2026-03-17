"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Quote, Minus, Eye, EyeOff, Loader2, ArrowLeft, ImagePlus, LayoutTemplate
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
      className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600 transition-colors">
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
      .replace(/^---$/gm, "<hr class='my-6 border-gray-200' />")
      .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
      .replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>")
      .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-blue-500 hover:underline' target='_blank'>$1</a>")
      .replace(/!\[(.+?)\]\((.+?)\)/g, "<img src='$2' alt='$1' class='rounded-xl my-4 max-w-full shadow-sm' />")
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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/blog")}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to Posts
          </button>
          <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
          <span className="text-sm font-semibold text-gray-900 hidden sm:block">
            {initial?.id ? "Edit Post" : "New Post"}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => save("draft")} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200">
            Save Draft
          </button>
          <button onClick={() => save("published")} disabled={saving}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Editor Area */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100">
              <input 
                value={form.title} 
                onChange={e => handleTitle(e.target.value)}
                placeholder="Post Title..."
                className="w-full text-3xl md:text-4xl font-bold bg-transparent outline-none text-gray-900 placeholder-gray-300" 
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100 bg-gray-50 flex-wrap sticky top-[73px] z-10">
              <ToolbarBtn onClick={() => wrap("**", "**", "bold text")} title="Bold"><Bold size={16} /></ToolbarBtn>
              <ToolbarBtn onClick={() => wrap("*", "*", "italic text")} title="Italic"><Italic size={16} /></ToolbarBtn>
              <div className="w-px h-5 bg-gray-300 mx-2" />
              <ToolbarBtn onClick={() => insertLine("## ")} title="Heading 2"><Heading2 size={16} /></ToolbarBtn>
              <ToolbarBtn onClick={() => insertLine("### ")} title="Heading 3"><Heading3 size={16} /></ToolbarBtn>
              <div className="w-px h-5 bg-gray-300 mx-2" />
              <ToolbarBtn onClick={() => insertLine("- ")} title="Bullet list"><List size={16} /></ToolbarBtn>
              <ToolbarBtn onClick={() => insertLine("1. ")} title="Numbered list"><ListOrdered size={16} /></ToolbarBtn>
              <div className="w-px h-5 bg-gray-300 mx-2" />
              <ToolbarBtn onClick={() => insertLine("> ")} title="Quote"><Quote size={16} /></ToolbarBtn>
              <ToolbarBtn onClick={() => insertLine("---")} title="Divider"><Minus size={16} /></ToolbarBtn>
              <div className="w-px h-5 bg-gray-300 mx-2" />
              <ToolbarBtn onClick={insertLink} title="Insert link"><LinkIcon size={16} /></ToolbarBtn>
              <ToolbarBtn onClick={insertImage} title="Insert image"><ImageIcon size={16} /></ToolbarBtn>
              <div className="flex-1" />
              <button type="button" onClick={() => setPreview(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  preview ? "bg-blue-50 text-blue-600 border border-blue-200" : "text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}>
                {preview ? <><EyeOff size={14} /> Edit</> : <><Eye size={14} /> Preview</>}
              </button>
            </div>

            {/* Editor / Preview */}
            <div className="bg-white">
              {preview ? (
                <div
                  className="min-h-[500px] p-6 md:p-8 prose prose-gray max-w-none text-gray-900"
                  dangerouslySetInnerHTML={{ __html: renderPreview(form.content) }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={form.content}
                  onChange={e => set("content", e.target.value)}
                  placeholder="Start writing... Use ## for headings, **bold**, *italic*, - for bullets"
                  className="w-full min-h-[500px] p-6 md:p-8 bg-transparent text-base text-gray-900 focus:outline-none resize-y font-mono leading-relaxed placeholder-gray-400"
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-5">
              <LayoutTemplate size={18} className="text-blue-500" />
              Post Settings
            </h3>
            
            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Category</label>
                <select value={form.category} onChange={e => set("category", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">URL Slug</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/blog/</span>
                  <input value={form.slug} onChange={e => set("slug", slugify(e.target.value))}
                    placeholder="post-url-slug"
                    className="w-full pl-12 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)}
                  placeholder="Short description for the blog list..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" />
              </div>

              {/* Cover Image */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ImagePlus size={14} /> Cover Image URL
                </label>
                <input value={form.cover_image} onChange={e => set("cover_image", e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                
                {form.cover_image && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-video relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}