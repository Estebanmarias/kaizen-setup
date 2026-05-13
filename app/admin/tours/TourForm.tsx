"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Loader2, Eye, EyeOff } from "lucide-react";

type GearRow = { item: string; model: string };
type SocialLinks = { instagram?: string; linkedin?: string; twitter?: string; website?: string };

type TourData = {
  id?: string;
  name: string;
  slug: string;
  occupation: string;
  location: string;
  room_size: string;
  social_links: SocialLinks;
  intro: string;
  gear_table: GearRow[];
  content: string;
  cover_image: string;
  images: string[];
  tips: string;
  status: "draft" | "published";
};

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

const inp = "w-full px-3 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors";
const label = "text-xs font-semibold text-gray-400 mb-1.5 block";

export default function TourForm({ initial }: { initial?: Partial<TourData> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [newImage, setNewImage] = useState("");

  const [form, setForm] = useState<TourData>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    occupation: initial?.occupation ?? "",
    location: initial?.location ?? "",
    room_size: initial?.room_size ?? "",
    social_links: initial?.social_links ?? {},
    intro: initial?.intro ?? "",
    gear_table: initial?.gear_table ?? [{ item: "", model: "" }],
    content: initial?.content ?? "",
    cover_image: initial?.cover_image ?? "",
    images: initial?.images ?? [],
    tips: initial?.tips ?? "",
    status: initial?.status ?? "draft",
  });

  const set = (k: keyof TourData, v: any) => setForm(f => ({ ...f, [k]: v }));
  const setSocial = (k: keyof SocialLinks, v: string) =>
    setForm(f => ({ ...f, social_links: { ...f.social_links, [k]: v } }));

  const handleName = (v: string) => {
    set("name", v);
    if (!initial?.slug) set("slug", slugify(v));
  };

  // Gear table
  const addGearRow = () => set("gear_table", [...form.gear_table, { item: "", model: "" }]);
  const removeGearRow = (i: number) => set("gear_table", form.gear_table.filter((_, idx) => idx !== i));
  const updateGear = (i: number, k: keyof GearRow, v: string) => {
    const updated = [...form.gear_table];
    updated[i] = { ...updated[i], [k]: v };
    set("gear_table", updated);
  };

  // Images
  const addImage = () => {
    if (!newImage.trim()) return;
    set("images", [...form.images, newImage.trim()]);
    setNewImage("");
  };
  const removeImage = (i: number) => set("images", form.images.filter((_, idx) => idx !== i));

  const save = async (status: "draft" | "published") => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.slug.trim()) { setError("Slug is required."); return; }
    if (!supabase) return;
    setSaving(true); setError("");

    const payload = {
      ...form,
      status,
      slug: slugify(form.slug),
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    let err;
    if (initial?.id) {
      ({ error: err } = await supabase.from("workspace_tours").update(payload).eq("id", initial.id));
    } else {
      ({ error: err } = await supabase.from("workspace_tours").insert(payload));
    }

    if (err) { setError(err.message); setSaving(false); return; }
    router.push("/admin/tours");
  };

  const renderPreview = (md: string) => md
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold mt-8 mb-3 text-white'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-bold mt-8 mb-4 text-white'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, "<blockquote class='border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4'>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc text-gray-300'>$1</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-blue-400 hover:underline'>$1</a>")
    .replace(/!\[(.+?)\]\((.+?)\)/g, "<img src='$2' alt='$1' class='rounded-xl my-4 max-w-full' />")
    .replace(/\n\n/g, "</p><p class='mb-4 text-gray-300'>")
    .replace(/^(?!<)(.+)$/gm, "<p class='mb-4 text-gray-300'>$1</p>");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white">{initial?.id ? "Edit Tour" : "New Workspace Tour"}</h1>
        <button onClick={() => router.push("/admin/tours")} className="text-sm text-gray-500 hover:text-white transition-colors">← Back</button>
      </div>

      <div className="flex flex-col gap-6">

        {/* Basic info */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Person Info</p>
          <div>
            <label className={label}>Full Name *</label>
            <input value={form.name} onChange={e => handleName(e.target.value)} placeholder="Ogeh Ezeonu" className={inp} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Slug *</label>
              <input value={form.slug} onChange={e => set("slug", slugify(e.target.value))} placeholder="ogeh-ezeonu" className={`${inp} font-mono`} />
            </div>
            <div>
              <label className={label}>Occupation</label>
              <input value={form.occupation} onChange={e => set("occupation", e.target.value)} placeholder="Product Designer" className={inp} />
            </div>
            <div>
              <label className={label}>Location</label>
              <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Lagos, Nigeria" className={inp} />
            </div>
            <div>
              <label className={label}>Room Size</label>
              <input value={form.room_size} onChange={e => set("room_size", e.target.value)} placeholder="15 m² (164 ft²)" className={inp} />
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Social Links</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["instagram", "linkedin", "twitter", "website"] as const).map(k => (
              <div key={k}>
                <label className={label}>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                <input value={form.social_links[k] ?? ""} onChange={e => setSocial(k, e.target.value)}
                  placeholder={`https://${k}.com/...`} className={inp} />
              </div>
            ))}
          </div>
        </div>

        {/* Cover image */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Cover Image</p>
          <input value={form.cover_image} onChange={e => set("cover_image", e.target.value)}
            placeholder="https://..." className={inp} />
          {form.cover_image && (
            <img src={form.cover_image} alt="Cover preview" className="h-40 w-full object-cover rounded-xl" />
          )}
        </div>

        {/* Intro */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Introduction</p>
          <p className="text-xs text-gray-500">The "Hello! Tell us a bit about yourself" section.</p>
          <textarea value={form.intro} onChange={e => set("intro", e.target.value)}
            rows={5} placeholder="Write the intro here..." className={inp + " resize-y"} />
        </div>

        {/* Gear table */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Gear Table</p>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 mb-1">
              <p className="text-xs font-semibold text-gray-500 px-1">Item</p>
              <p className="text-xs font-semibold text-gray-500 px-1">Model</p>
            </div>
            {form.gear_table.map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 items-center">
                <input value={row.item} onChange={e => updateGear(i, "item", e.target.value)}
                  placeholder="Monitor" className={inp} />
                <div className="flex gap-2">
                  <input value={row.model} onChange={e => updateGear(i, "model", e.target.value)}
                    placeholder="LG 38WN95C-W" className={inp} />
                  <button onClick={() => removeGearRow(i)}
                    className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addGearRow}
              className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-400 transition-colors mt-1">
              <Plus size={13} /> Add row
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Main Content</p>
            <button onClick={() => setPreview(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-white/[0.08] text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
              {preview ? <><EyeOff size={12} /> Edit</> : <><Eye size={12} /> Preview</>}
            </button>
          </div>
          <p className="text-xs text-gray-500">Use ## for section headings, **bold**, *italic*, - for bullets, ![alt](url) for images.</p>
          {preview ? (
            <div className="min-h-[300px] p-4 rounded-lg border border-white/[0.06] text-sm"
              dangerouslySetInnerHTML={{ __html: renderPreview(form.content) }} />
          ) : (
            <textarea value={form.content} onChange={e => set("content", e.target.value)}
              rows={16} placeholder="## Take us through your setup&#10;&#10;Write the full tour content here using markdown..." className={`${inp} resize-y font-mono text-xs leading-relaxed`} />
          )}
        </div>

        {/* Tips */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Tips for Other Makers</p>
          <textarea value={form.tips} onChange={e => set("tips", e.target.value)}
            rows={4} placeholder="Any tips for other makers who want to improve their workspaces?" className={inp + " resize-y"} />
        </div>

        {/* Additional images */}
        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Additional Images</p>
          <div className="flex gap-2">
            <input value={newImage} onChange={e => setNewImage(e.target.value)}
              placeholder="https://image-url.com/photo.jpg" className={inp} />
            <button onClick={addImage}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0">
              Add
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                  <button onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => save("published")} disabled={saving}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving..." : "Publish"}
          </button>
          <button onClick={() => save("draft")} disabled={saving}
            className="border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}