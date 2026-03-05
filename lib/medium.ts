export type MediumPost = {
  title: string;
  link: string;
  date: string;
  excerpt: string;
  categories: string[];
};

export async function getMediumPosts(): Promise<MediumPost[]> {
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@kaizensetup.ng`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();

    if (data.status !== "ok") return [];

   return data.items.map((item: any) => ({
  title: item.title ?? "",
  link: item.link ?? "",
  date: item.pubDate ?? "",
  excerpt: (item.content || item.description || "")
    .replace(/<[^>]+>/g, "")
    .slice(0, 120) + "...",
  categories: item.categories ?? [],
}));
  } catch (e) {
    console.error("Failed to fetch Medium posts", e);
    return [];
  }
}