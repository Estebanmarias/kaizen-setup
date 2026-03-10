
export type RecentProduct = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  price_naira: number | null;
  category: string;
};

const KEY = "kaizen_recently_viewed";
const MAX = 6;

export function addRecentlyViewed(product: RecentProduct) {
  if (typeof window === "undefined") return;
  const existing: RecentProduct[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  const filtered = existing.filter(p => p.id !== product.id);
  const updated = [product, ...filtered].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getRecentlyViewed(): RecentProduct[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEY) ?? "[]");
}