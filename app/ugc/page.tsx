import { Instagram } from "lucide-react";
import Link from "next/link";

const REELS = [
  { title: "Wireless AirTag Dual Review", creator: "XY Shot", link: "https://www.instagram.com/kaizensetup/reel/DVAxZSuDFKA/" },
  { title: "G30LD Ergonomic Mouse Review", creator: "XY Shot", link: "https://www.instagram.com/kaizensetup/reel/DU_SPlsjLbE/" },
  { title: "CX23 Keyboard First Impression", creator: "XY Shot", link: "https://www.instagram.com/kaizensetup/reel/DVLplqIjOGX/" },
  { title: "CX23 Keyboard Unboxing", creator: "XY Shot", link: "https://www.instagram.com/xy_shots/reel/DTz4WfejHTP/" },
  { title: "Wireless Tag Dual Review", creator: "Esuola Daniel", link: "https://www.instagram.com/kaizensetup/reel/DVQbplSjBuv/" },
  { title: "Wireless AirTag Dual Unboxing", creator: "Angivatech", link: "https://www.instagram.com/kaizensetup/reel/DO6p75HjIvH/" },
  { title: "How to Connect on iOS", creator: "Angiva Tech", link: "https://www.instagram.com/kaizensetup/reel/DPIzpG_jKSf/" },
  { title: "How to Connect on Android", creator: "Angiva Tech", link: "https://www.instagram.com/kaizensetup/reel/DPI4Ko2DJa_/" },
];

export default function UGCPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">Instagram Reels</p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Creator Reviews</h1>
        <p className="text-gray-500 mb-12 max-w-xl">
          Watch real unboxings, reviews, and tutorials from creators who've used our products.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REELS.map((r) => (
            <a key={r.link} href={r.link} target="_blank" rel="noopener noreferrer"
              className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-blue-500 transition-colors group flex flex-col gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                <Instagram size={18} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-500 transition-colors leading-snug">{r.title}</p>
              <p className="text-xs text-gray-400">by {r.creator}</p>
              <span className="text-xs font-semibold text-blue-500 group-hover:underline mt-auto">Watch on Instagram →</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}