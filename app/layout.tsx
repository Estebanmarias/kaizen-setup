import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';
import NavbarWrapper from "@/components/NavbarWrapper";
import NewsletterPopupWrapper from "@/components/NewsletterPopupWrapper";
import WhatsAppBubble from "@/components/WhatsAppBubble";

const inter = Inter({ subsets: ["latin"] });

const OG_IMAGE = "https://tyegjxrlfblojnimzkzp.supabase.co/storage/v1/object/public/product-images/kaizenSetup.jpg";

export const metadata: Metadata = {
  metadataBase: new URL("https://kaizensetup.name.ng"),
  title: {
    default: "KaizenSetup — Smart & Affordable Tech Setups in Nigeria",
    template: "%s | KaizenSetup",
  },
  description:
    "KaizenSetup helps you build efficient workspaces, gaming stations, and business tech systems without overspending. Based in Ibadan, Nigeria.",
  keywords: ["tech setup", "workspace", "gaming setup", "Nigeria", "Ibadan", "KaizenSetup"],
  authors: [{ name: "KaizenSetup" }],
  creator: "KaizenSetup",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "KaizenSetup — Smart & Affordable Tech Setups in Nigeria",
    description:
      "Honest tech setup consultancy based in Ibadan, Nigeria. Real testing, budget-first thinking, zero corporate fluff.",
    url: "https://kaizen-setup.vercel.app",
    siteName: "KaizenSetup",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1080,
        height: 1080,
        alt: "KaizenSetup — Smart & Affordable Tech Setups in Nigeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KaizenSetup — Smart & Affordable Tech Setups in Nigeria",
    description: "Honest tech setup consultancy based in Ibadan, Nigeria.",
    site: "@kaizensetupng",
    creator: "@kaizensetupng",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
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
        <WhatsAppBubble />
        <GoogleAnalytics gaId="G-M13PZ1RESN" />
      </body>
    </html>
  );
}