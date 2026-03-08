import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Reviews",
  description: "Watch real unboxings, reviews, and tutorials from creators who've used KaizenSetup products.",
  openGraph: {
    title: "Creator Reviews | KaizenSetup",
    description: "Real unboxings, reviews, and tutorials from creators who've used KaizenSetup products.",
    url: "https://www.kaizensetup.name.ng/ugc",
  },
  twitter: {
    title: "Creator Reviews | KaizenSetup",
    description: "Real unboxings, reviews, and tutorials from creators who've used KaizenSetup products.",
  },
};

export default function UGCLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}