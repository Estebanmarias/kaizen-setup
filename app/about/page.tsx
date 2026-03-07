import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "KaizenSetup is a Nigerian workspace brand obsessed with helping people build smarter, more efficient setups without overspending.",
};

const VALUES = [
  {
    icon: "🔍",
    title: "Honest Reviews",
    desc: "We only recommend what we've tested. No paid placements, no inflated ratings. If it's on the site, it earned its spot.",
  },
  {
    icon: "💰",
    title: "Budget-First Thinking",
    desc: "Premium doesn't always mean better. We find gear that delivers real value at prices that make sense for the Nigerian market.",
  },
  {
    icon: "⚡",
    title: "Practical Over Perfect",
    desc: "We care about what actually works in your space — not what looks good in a studio shoot.",
  },
  {
    icon: "📦",
    title: "Curated, Not Cluttered",
    desc: "Every product on KaizenSetup is handpicked. We'd rather have 25 great products than 500 average ones.",
  },
];

const TIMELINE = [
  {
    year: "2023",
    title: "The frustration",
    desc: "Like a lot of people working from home in Nigeria, we kept running into the same problem — overpriced gear, bad advice, and products that looked nothing like their listings. We decided to fix that.",
  },
  {
    year: "2024",
    title: "The first setups",
    desc: "We started sourcing, testing, and documenting workspace gear ourselves. What began as personal setups turned into a small but growing catalogue of products we actually trusted.",
  },
  {
    year: "2025",
    title: "KaizenSetup launches",
    desc: "We went live with the shop, the blog, and a growing community of creators and remote workers who care about their space. The name says it all — Kaizen means continuous improvement.",
  },
  {
    year: "Now",
    title: "Still improving",
    desc: "New products, new reviews, new setups. We're building this alongside our customers — if you have feedback, we genuinely want to hear it.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-8 inline-block">← Back to Home</Link>

        {/* Hero */}
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">Our Story</p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          We built the shop<br className="hidden md:block" /> we wished existed.
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-16 max-w-2xl">
          KaizenSetup started from a simple frustration — finding quality workspace gear in Nigeria was harder than it should be. Bad listings, inflated prices, and zero honest reviews. So we started doing it ourselves.
        </p>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">How we got here</h2>
          <div className="flex flex-col gap-0">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex gap-6 relative">
                {/* Line */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-800 my-1" />}
                </div>
                <div className="pb-10">
                  <span className="text-xs font-bold text-blue-500 tracking-widest uppercase">{item.year}</span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">What we stand for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map(v => (
              <div key={v.title} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <p className="text-2xl mb-3">{v.icon}</p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What Kaizen means */}
        <div className="bg-gray-900 dark:bg-[#1a1a1a] rounded-2xl p-8 mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">The name</p>
          <h2 className="text-2xl font-bold text-white mb-4">改善 — Kaizen</h2>
          <p className="text-gray-300 leading-relaxed text-sm">
            Kaizen is a Japanese philosophy that means <span className="text-white font-semibold">"continuous improvement"</span> — small, consistent upgrades that compound over time. That's exactly how we think about workspaces. You don't need a perfect setup on day one. You just need to keep making it better.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Ready to upgrade your setup?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Browse tested gear or reach out — we're always happy to help you figure out what you actually need.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Browse the Shop
            </Link>
            <a href="https://wa.me/2347035378462" target="_blank" rel="noopener noreferrer"
              className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-500 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}