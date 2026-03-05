import { getMediumPosts, MediumPost } from "@/lib/medium";
import Link from "next/link";

export const revalidate = 3600;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function readTime(excerpt: string) {
  const words = excerpt.split(" ").length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
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
    <section id="blog" className="py-20 px-6 bg-white dark:bg-[#0f0f0f]">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-500 mb-3">
          From the Blog
        </p>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Latest Articles
          </h2>
          <Link
            href="/blog"
            className="text-sm font-semibold text-emerald-500 hover:underline hidden sm:block"
          >
            View All Posts →
          </Link>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl">
          Tech news, honest reviews, and setup guides — written from real
          experience in the Nigerian market.
        </p>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <p className="text-4xl mb-4">✍️</p>
            <p className="font-medium">Articles coming soon.</p>
            <a
              href="https://medium.com/@kaizensetup.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 text-sm mt-2 inline-block hover:underline"
            >
              Read on Medium →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <a
                key={post.link}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-emerald-500 transition-colors flex flex-col group"
              >
                {post.categories[0] && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 w-fit mb-4">
                    {post.categories[0]}
                  </span>
                )}
                <h3 className="font-semibold text-base mb-2 text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
                  <span>{formatDate(post.date)}</span>
                  <span>{readTime(post.excerpt)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 sm:hidden">
          <Link
            href="/blog"
            className="text-sm font-semibold text-emerald-500 hover:underline"
          >
            View All Posts →
          </Link>
        </div>
      </div>
    </section>
  );
}