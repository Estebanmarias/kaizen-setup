import Parser from "rss-parser";

export type MediumPost = {
  title: string;
  link: string;
  date: string;
  excerpt: string;
  categories: string[];
};

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; KaizenSetup/1.0)",
  },
});

export async function getMediumPosts(): Promise<MediumPost[]> {
  try {
    const feed = await parser.parseURL(
      "https://medium.com/feed/@kaizensetup.ng"
    );
    return feed.items.map((item) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      date: item.pubDate ?? "",
      excerpt: item.contentSnippet
        ? item.contentSnippet.slice(0, 120) + "..."
        : "",
      categories: item.categories ?? [],
    }));
  } catch (e) {
    console.error("Medium RSS fetch failed:", e);
    return [];
  }
}