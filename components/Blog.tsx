import { getMediumPosts, MediumPost } from "@/lib/medium";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const revalidate = 3600;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function readTime(excerpt: string) {
  return `${Math.max(1, Math.ceil(excerpt.split(" ").length / 200))} min read`;
}

export default async function Blog() {
  let posts: MediumPost[] = [];
  try {
    const all = await getMediumPosts();
    posts = all.slice(0, 3);
  } catch (e) {
    console.error("Failed to fetch Medium posts", e);
  }

  return (
    <section id="blog" className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-14">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-500">From the Blog</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Latest Articles</h2>
            <p className="text-gray-500 max-w-xl">
              Tech news, honest reviews, and setup guides — written from real experience in the Nigerian market.
            </p>
          </div>
          <Link href="/blog"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:underline flex-shrink-0 ml-8">
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">✍️</p>
            <p className="font-medium">Articles coming soon.</p>
            <a href="https://medium.com/@kaizensetup.ng" target="_blank" rel="noopener noreferrer"
              className="text-blue-500 text-sm mt-2 inline-block hover:underline">
              Read on Medium →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <a key={post.link} href={post.link} target="_blank" rel="noopener noreferrer"
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-sm transition-all flex flex-col group">
                {post.categories[0] && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 w-fit mb-4">
                    {post.categories[0]}
                  </span>
                )}
                <h3 className="font-bold text-base mb-2 text-gray-900 group-hover:text-blue-500 transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(post.date)}</span>
                  <span>{readTime(post.excerpt)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 sm:hidden">
          <Link href="/blog" className="text-sm font-semibold text-blue-500 hover:underline">
            View All Posts →
          </Link>
        </div>
      </div>
    </section>
  );
}