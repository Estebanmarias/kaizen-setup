import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KaizenSetup — Smart & Affordable Tech Setups in Nigeria",
  description:
    "KaizenSetup helps you build efficient workspaces, gaming stations, and business tech systems without overspending. Based in Ibadan, Nigeria.",
  keywords: ["tech setup", "workspace", "gaming setup", "Nigeria", "Ibadan", "KaizenSetup"],
  openGraph: {
    title: "KaizenSetup — Smart & Affordable Tech Setups in Nigeria",
    description:
      "Honest tech setup consultancy based in Ibadan, Nigeria. Real testing, budget-first thinking, zero corporate fluff.",
    url: "https://kaizensetup.ng",
    siteName: "KaizenSetup",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KaizenSetup — Smart & Affordable Tech Setups in Nigeria",
    description: "Honest tech setup consultancy based in Ibadan, Nigeria.",
    site: "@kaizensetupng",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}