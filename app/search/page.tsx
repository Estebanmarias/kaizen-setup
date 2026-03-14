"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  slug: string;
  price_naira: number | null;
  image_url: string;
  category: string;
  in_stock: boolean;
  variants: any;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  created_at: string;
  cover_image: string | null;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";

  const [query, setQuery] = useState(q);
  const [inputValue, setInputValue] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const logSearch = async (term: string, count: number) => {
    const { data: { session } } = await supabase!.auth.getSession();
    await supabase!.from("search_logs").insert({
      query: term.trim(),
      results_count: count,
      user_id: session?.user.id ?? null,
    });
  };

  const runSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    const pattern = `%${term.trim()}%`;
    const [productRes, blogRes] = await Promise.all([
      supabase!.from("products").select("id, name, slug, price_naira, image_url, category, in_stock, variants")
        .or(`name.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`).order("name"),
      supabase!.from("blog_posts").select("id, title, slug, excerpt, created_at, cover_image")
        .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`).not("published_at", "is", null)
        .order("created_at", { ascending: false }),
    ]);
    const total = (productRes?.data?.length ?? 0) + (blogRes?.data?.length ?? 0);
    setProducts(productRes?.data || []);
    setPosts(blogRes?.data || []);
    setLoading(false);
    logSearch(term, total);
  }, []);

  useEffect(() => {
    if (q) { setInputValue(q); setQuery(q); runSearch(q); }
  }, [q, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  const getMinPrice = (product: Product): number | null => {
    if (product.price_naira) return product.price_naira;
    if (!product.variants) return null;
    const v = Array.isArray(product.variants) ? product.variants : [];
    const comboPrices = v.find((x: any) => x.combo_prices)?.combo_prices;
    if (comboPrices) return Math.min(...Object.values(comboPrices) as number[]);
    const perOption = v.find((x: any) => x.prices)?.prices;
    if (perOption) return Math.min(...perOption);
    return null;
  };

  const totalResults = products.length + posts.length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search products, blog posts..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
              <button type="submit"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                Search
              </button>
            </form>
            {searched && !loading && (
              <p className="mt-3 text-sm text-gray-500">
                {totalResults === 0
                  ? `No results for "${query}"`
                  : `${totalResults} result${totalResults !== 1 ? "s" : ""} for "${query}"`}
              </p>
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && searched && totalResults === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-gray-500 text-sm">
                Try different keywords or browse the{" "}
                <Link href="/shop" className="text-blue-500 hover:underline">shop</Link>.
              </p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <section className="mb-12">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-5">
                Products ({products.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map(p => {
                  const minPrice = getMinPrice(p);
                  return (
                    <Link key={p.id} href={`/shop/${p.slug}`}
                      className="group rounded-xl border border-gray-100 overflow-hidden hover:border-blue-500 transition-colors">
                      <div className="relative aspect-square bg-gray-50">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📦</div>
                        )}
                        {!p.in_stock && (
                          <span className="absolute top-2 left-2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded">
                            Out of stock
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                        {minPrice && <p className="text-sm font-semibold text-blue-500 mt-1">₦{minPrice.toLocaleString()}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {!loading && posts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-5">
                Blog Posts ({posts.length})
              </h2>
              <div className="flex flex-col gap-4">
                {posts.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`}
                    className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-500 transition-colors group">
                    {post.cover_image && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                        <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col justify-center min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-500 transition-colors line-clamp-2">{post.title}</p>
                      {post.excerpt && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(post.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!searched && (
            <div className="text-center py-20 text-gray-400 text-sm">
              Type something above to search products and blog posts.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}