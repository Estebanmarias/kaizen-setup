"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSession, signOut } from "@/lib/admin-auth";
import { ShoppingBag, Package, Mail, MessageSquare, LogOut, Zap } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Contacts", href: "/admin/contacts", icon: MessageSquare },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/newsletter": "Newsletter",
  "/admin/contacts": "Contacts",
  "/admin/products/[slug]/edit": "Edit Product",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSession().then(session => {
      if (!session && pathname !== "/admin/login") router.replace("/admin/login");
      setChecking(false);
    });
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (checking) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pageTitle = PAGE_TITLES[pathname] ?? "Admin";
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0f0f0f]">
        {/* Brand */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">KaizenSetup</p>
              <p className="text-[10px] text-gray-500 leading-tight">Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "text-gray-500 hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}>
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={async () => { await signOut(); router.replace("/admin/login"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06] border border-transparent transition-all w-full">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-8 flex-shrink-0 bg-[#0f0f0f]/50 backdrop-blur">
          <h1 className="text-sm font-semibold text-white">{pageTitle}</h1>
          <p className="text-xs text-gray-500">{today}</p>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}