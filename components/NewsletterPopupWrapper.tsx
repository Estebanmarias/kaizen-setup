"use client";

import { usePathname } from "next/navigation";
import NewsletterPopup from "@/components/NewsletterPopup";

export default function NewsletterPopupWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <NewsletterPopup />;
}