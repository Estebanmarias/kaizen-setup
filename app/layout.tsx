import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';
import NavbarWrapper from "@/components/NavbarWrapper";
import NewsletterPopupWrapper from "@/components/NewsletterPopupWrapper";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <NavbarWrapper />
        {children}
        <NewsletterPopupWrapper />
        <GoogleAnalytics gaId="G-M13PZ1RESN" />
      </body>
    </html>
  );
}