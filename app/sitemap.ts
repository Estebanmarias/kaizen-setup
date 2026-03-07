import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE_URL = "https://kaizensetup.name.ng";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all product slugs
  const { data: products } = await supabase
    .from("products")
    .select("slug, created_at");

  const productUrls = (products ?? []).map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/ugc`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/auth`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...productUrls,
  ];
}