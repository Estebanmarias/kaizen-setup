"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSession, signOut } from "@/lib/admin-auth";
import { LayoutDashboard, ShoppingBag, Package, Mail, MessageSquare, LogOut } from "lucide-react";

const NAV = [
  { label: "Orders", href: "/admin", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Contacts", href: "/admin/contacts", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSession().then(session => {
      if (!session && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
      setChecking(false);
    });
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (checking) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <p className="font-bold text-white text-sm">Kaizen<span className="text-gray-500">Setup</span></p>
          <p className="text-xs text-gray-500 mt-0.5">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={async () => { await signOut(); router.replace("/admin/login"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}