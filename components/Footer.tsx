import Link from "next/link";
import { Youtube, Instagram } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#services" },
  { label: "Reviews", href: "#reviews" },
  { label: "Shop", href: "/shop" },
  { label: "Creators", href: "/ugc" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/kaizensetup/",
    icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@KaizenSetupng",
    icon: Youtube,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@kaizensetup",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/kaizensetupng",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Medium",
    href: "https://medium.com/@kaizensetup.ng",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-[#0a0a0a] border-t border-gray-800 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <p className="font-bold text-xl text-white mb-2">
              Kaizen<span className="text-blue-500">Setup</span>
            </p>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Smart & affordable tech setups for homes and businesses in Nigeria.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-4">
              Navigation
            </p>
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((l) => (
                <Link key={l.label} href={l.href}
                  className="text-sm text-gray-400 hover:text-blue-500 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-4">
              Follow Us
            </p>
            <div className="flex flex-col gap-3">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-500 transition-colors">
                    <Icon />
                    {s.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} KaizenSetup. All rights reserved.</p>
          <p>Built in Ibadan, Nigeria 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
}