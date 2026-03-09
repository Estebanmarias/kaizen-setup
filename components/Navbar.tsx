"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Sun, Moon, User, LogOut, ChevronDown, ShoppingCart, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#services" },
  { label: "Reviews", href: "#reviews" },
  { label: "Shop", href: "/shop" },
  { label: "Creators", href: "/ugc" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("kaizen_cart") ?? "[]");
    setCartCount(cart.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
  };

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    supabase?.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase?.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    }) ?? { data: null };

    updateCartCount();
    window.addEventListener("cart_updated", updateCartCount);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("cart_updated", updateCartCount);
      listener?.subscription.unsubscribe();
    };
  }, []);

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setMobileSearchOpen(false);
    setMenuOpen(false);
    const q = searchQuery.trim();
    setSearchQuery("");
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0];
  const avatarUrl =
    user?.user_metadata?.avatar_url ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName ?? "U")}`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      scrolled
        ? "bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur border-gray-200 dark:border-gray-800"
        : "bg-transparent border-transparent"
    }`}>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">

        {/* Logo */}
        <Link href="/" className="font-bold text-lg sm:text-xl tracking-tight text-gray-900 dark:text-white flex-shrink-0">
          Kaizen<span className="text-gray-500">Setup</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none w-32 focus:w-44 transition-all duration-200"
            />
          </form>

          <Link href="/cart" aria-label="View cart" className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button onClick={toggleDark} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-colors text-gray-600 dark:text-gray-300">
            {mounted ? (dark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
          </button>

          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full pl-1 pr-3 py-1 hover:border-blue-500 transition-colors">
                <img src={avatarUrl} alt={displayName ?? ""} className="w-7 h-7 rounded-full object-cover bg-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{displayName}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <Link href="/account" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                    <User size={14} /> My Account
                  </Link>
                  <button onClick={signOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth"
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile right actions */}
        <div className="md:hidden flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => { setMobileSearchOpen(v => !v); setMenuOpen(false); }}
            aria-label="Search"
            className="p-2 text-gray-600 dark:text-gray-300"
          >
            <Search size={20} />
          </button>
          <Link href="/cart" className="relative p-2 text-gray-600 dark:text-gray-300">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={toggleDark} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-colors text-gray-600 dark:text-gray-300">
            {mounted ? (dark ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
          </button>
          <button onClick={() => { setMenuOpen(!menuOpen); setMobileSearchOpen(false); }} aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="p-2 text-gray-700 dark:text-gray-300">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white dark:bg-[#0f0f0f] border-t border-gray-100 dark:border-gray-800 px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, blog posts..."
              autoFocus
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
              Go
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0f0f0f] border-t border-gray-100 dark:border-gray-800 px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
              {l.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <img src={avatarUrl} alt={displayName ?? ""} className="w-8 h-8 rounded-full object-cover bg-blue-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{displayName}</span>
                </div>
                <Link href="/account" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                  <User size={15} /> My Account
                </Link>
                <button onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/[0.06] transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth" onClick={() => setMenuOpen(false)}
                className="block bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}