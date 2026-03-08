import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description: "Tested and recommended workspace gear. Every product has been used or reviewed by KaizenSetup. Based in Ibadan, Nigeria.",
  openGraph: {
    title: "Shop | KaizenSetup",
    description: "Tested and recommended workspace gear curated by KaizenSetup.",
    url: "https://www.kaizensetup.name.ng/shop",
  },
  twitter: {
    title: "Shop | KaizenSetup",
    description: "Tested and recommended workspace gear curated by KaizenSetup.",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}