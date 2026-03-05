"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#services" },
  { label: "Reviews", href: "#reviews" },
  { label: "Shop", href: "/shop" },
  { label: "Creators", href: "/ugc" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      scrolled
        ? "bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur border-gray-200 dark:border-gray-800"
        : "bg-transparent border-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
          Kaizen<span className="text-gray-500">Setup</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
          <button onClick={toggleDark}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-colors text-gray-600 dark:text-gray-300">
            {mounted ? (dark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleDark}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
            {mounted ? (dark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-700 dark:text-gray-300">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0f0f0f] px-6 pb-6 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}