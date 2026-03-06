"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Sun, Moon, User, LogOut, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

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
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    // Auth state
    supabase?.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: listener } = supabase?.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    }) ?? { data: null }

    return () => {
      window.removeEventListener("scroll", onScroll)
      listener?.subscription.unsubscribe()
    }
  }, []);

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  };

  const signOut = async () => {
    await supabase?.auth.signOut()
    setUserMenuOpen(false)
    router.push('/')
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0]
  const avatarUrl = user?.user_metadata?.avatar_url
    ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName ?? 'U')}&backgroundColor=3b82f6&textColor=ffffff`

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

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full pl-1 pr-3 py-1 hover:border-blue-500 transition-colors">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName ?? ''} className="w-7 h-7 rounded-full object-cover bg-blue-500" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {displayName?.[0]?.toUpperCase()}
                  </div>
                )}
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
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
          )}
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
          {user ? (
            <>
              <Link href="/account" onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                My Account
              </Link>
              <button onClick={signOut}
                className="text-left text-sm font-medium text-red-500">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" onClick={() => setMenuOpen(false)}
              className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center transition-colors">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}