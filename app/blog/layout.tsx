import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tech news, honest reviews, and setup guides from KaizenSetup. Based in Ibadan, Nigeria.",
  openGraph: {
    title: "Blog | KaizenSetup",
    description: "Tech news, honest reviews, and setup guides from KaizenSetup.",
    url: "https://www.kaizensetup.name.ng/blog",
  },
  twitter: {
    title: "Blog | KaizenSetup",
    description: "Tech news, honest reviews, and setup guides from KaizenSetup.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}