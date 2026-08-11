"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, LogOut, ChevronDown, ShoppingCart, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const PRIMARY_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Blog", href: "/blog" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const pillContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("kaizen_cart") ?? "[]");
    setCartCount(cart.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    supabase?.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase?.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    }) ?? { data: null };

    updateCartCount();
    window.addEventListener("cart_updated", updateCartCount);

    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("cart_updated", updateCartCount);
      document.removeEventListener("mousedown", onClickOutside);
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Update liquid pill position
  useEffect(() => {
    const idx = hoveredIndex ?? PRIMARY_LINKS.findIndex(l => isActive(l.href));
    const el = linkRefs.current[idx];
    const container = pillContainerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setPillStyle({
      left: elRect.left - containerRect.left,
      width: elRect.width,
      opacity: 1,
    });
  }, [hoveredIndex, pathname]);

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

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false; // anchor links never count as active
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("#")[0]) && href.split("#")[0] !== "/";
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0];
  const avatarUrl =
    user?.user_metadata?.avatar_url ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName ?? "U")}`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      scrolled
        ? "bg-white/95 backdrop-blur border-gray-200"
        : "bg-transparent border-transparent"
    }`}>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="font-semibold text-lg sm:text-xl tracking-tight text-gray-900 flex-shrink-0">
          Kaizen<span className="text-blue-500">Setup</span>
        </Link>

        {/* Desktop nav — liquid pill */}
        <div
          ref={pillContainerRef}
          className="hidden md:flex items-center relative bg-gray-100 border border-gray-300 rounded-full px-2 py-1.5"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Liquid sliding background */}
          <div
            className="absolute top-1.5 bottom-1.5 bg-white rounded-full shadow-sm pointer-events-none"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              opacity: pillStyle.opacity,
              transition: "left 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.15s ease",
            }}
          />

          {PRIMARY_LINKS.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              ref={el => { linkRefs.current[i] = el; }}
              onMouseEnter={() => setHoveredIndex(i)}
              className={`relative z-10 text-sm font-medium px-4 py-1.5 rounded-full whitespace-nowrap transition-colors duration-150 ${
                hoveredIndex === i || (hoveredIndex === null && isActive(l.href))
                  ? "text-gray-900"
                  : "text-gray-500"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">

          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-28 focus:w-40 transition-all duration-200"
            />
          </form>

          {/* Cart */}
          <Link href="/cart" aria-label="View cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-3 py-1 hover:border-blue-500 transition-colors">
                <img src={avatarUrl} alt={displayName ?? ""} className="w-7 h-7 rounded-full object-cover bg-blue-500" />
                <span className="text-sm font-medium text-gray-700 max-w-[90px] truncate">{displayName}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-1.5">
                    <Link href="/account" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      <User size={14} /> My Account
                    </Link>
                    <button onClick={signOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth"
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors whitespace-nowrap">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile right actions */}
        <div className="md:hidden flex items-center gap-1 flex-shrink-0">
          <button onClick={() => { setMobileSearchOpen(v => !v); setMenuOpen(false); }} aria-label="Search"
            className="p-2 text-gray-600">
            <Search size={20} />
          </button>
          <Link href="/cart" className="relative p-2 text-gray-600">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => { setMenuOpen(!menuOpen); setMobileSearchOpen(false); }} aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="p-2 text-gray-700">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, blog posts..."
              autoFocus
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">Go</button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1 overflow-y-auto z-40">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                isActive(l.href)
                  ? "bg-blue-50 text-blue-500"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}>
              {l.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <img src={avatarUrl} alt={displayName ?? ""} className="w-8 h-8 rounded-full object-cover bg-blue-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">{displayName}</span>
                </div>
                <Link href="/account" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                  <User size={15} /> My Account
                </Link>
                <button onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth" onClick={() => setMenuOpen(false)}
                className="block bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full text-center transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}