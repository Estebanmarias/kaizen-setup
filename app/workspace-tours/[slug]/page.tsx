import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Instagram, Linkedin, Twitter, Globe, ArrowLeft, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";

type GearRow = { item: string; model: string };
type SocialLinks = {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
};

type Tour = {
  id: string;
  slug: string;
  name: string;
  occupation: string | null;
  location: string | null;
  room_size: string | null;
  social_links: SocialLinks;
  intro: string | null;
  gear_table: GearRow[];
  content: string | null;
  tips: string | null;
  cover_image: string | null;
  cover_image_alt: string | null;
  images: string[];
  published_at: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tour } = await supabase
    .from("workspace_tours")
    .select("name, occupation, location, cover_image, intro")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!tour) return { title: "Tour Not Found | KaizenSetup" };

  return {
    title: `${tour.name}'s Setup | KaizenSetup Workspace Tours`,
    description:
      tour.intro?.slice(0, 155) ??
      `Inside ${tour.name}'s workspace — ${tour.occupation ?? "creator"} based in ${tour.location ?? "Nigeria"}.`,
    openGraph: {
      title: `${tour.name}'s Setup | KaizenSetup`,
      description: tour.intro?.slice(0, 155) ?? "",
      images: tour.cover_image ? [{ url: tour.cover_image }] : [],
    },
  };
}

export default async function WorkspaceTourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tour } = (await supabase
    .from("workspace_tours")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()) as { data: Tour | null };

  if (!tour) notFound();

  const hasSocials =
    tour.social_links?.instagram ||
    tour.social_links?.linkedin ||
    tour.social_links?.twitter ||
    tour.social_links?.website;

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      {/* Back link */}
      <div className="px-6 max-w-4xl mx-auto mb-8">
        <Link
          href="/workspace-tours"
          className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline"
        >
          <ArrowLeft size={13} /> Back to Workspace Tours
        </Link>
      </div>

      {/* Cover image */}
      {tour.cover_image && (
        <div className="relative w-full h-72 md:h-[480px] bg-gray-100 mb-10">
          <Image
            src={tour.cover_image}
            alt={tour.cover_image_alt ?? `${tour.name}'s workspace`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b border-gray-100 pb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-2">
            Workspace Tour
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
            {tour.name}&apos;s Setup
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 mb-5">
            {tour.occupation && (
              <span className="font-medium text-gray-700">{tour.occupation}</span>
            )}
            {tour.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {tour.location}
              </span>
            )}
            {tour.room_size && <span>📐 {tour.room_size}</span>}
            <span className="text-gray-400">{formatDate(tour.published_at)}</span>
          </div>

          {/* Socials */}
          {hasSocials && (
            <div className="flex items-center gap-3">
              {tour.social_links?.instagram && (
                <a
                  href={`https://instagram.com/${tour.social_links.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Instagram size={14} />
                  {tour.social_links.instagram}
                </a>
              )}
              {tour.social_links?.twitter && (
                <a
                  href={`https://twitter.com/${tour.social_links.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Twitter size={14} />
                  {tour.social_links.twitter}
                </a>
              )}
              {tour.social_links?.linkedin && (
                <a
                  href={tour.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Linkedin size={14} />
                  LinkedIn
                </a>
              )}
              {tour.social_links?.website && (
                <a
                  href={tour.social_links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Globe size={14} />
                  Website
                </a>
              )}
            </div>
          )}
        </div>

        {/* Intro */}
        {tour.intro && (
          <section className="mb-10">
            <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-blue-500 pl-5 italic">
              {tour.intro}
            </p>
          </section>
        )}

        {/* Gear Table */}
        {tour.gear_table?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">The Gear</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 w-2/5">
                      Item
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">
                      Model
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tour.gear_table.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-100 last:border-0 ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {row.item}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{row.model}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Main Content (markdown) */}
        {tour.content && (
          <section className="mb-12 prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:w-full prose-strong:text-gray-800">
            <ReactMarkdown>{tour.content}</ReactMarkdown>
          </section>
        )}

        {/* Image Gallery */}
        {tour.images?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">More Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tour.images.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 group"
                >
                  <Image
                    src={url}
                    alt={`${tour.name}'s setup — photo ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Maximize2
                      size={20}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tips */}
        {tour.tips && (
          <section className="mb-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              💡 Tips from {tour.name}
            </h2>
            <p className="text-gray-700 leading-relaxed">{tour.tips}</p>
          </section>
        )}

        {/* Footer CTA */}
        <div className="border-t border-gray-100 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Want a setup like this?</p>
            <p className="text-sm text-gray-500">
              Browse our curated gear — built for Nigerian workspaces.
            </p>
          </div>
          <Link
            href="/shop"
            className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Shop the Gear →
          </Link>
        </div>
      </div>
    </main>
  );
}