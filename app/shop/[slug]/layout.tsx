import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const OG_IMAGE = "https://tyegjxrlfblojnimzkzp.supabase.co/storage/v1/object/public/product-images/kaizenSetup.jpg";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("name, description, image_url")
    .eq("slug", slug)
    .single();

  if (!product) {
    return { title: "Product Not Found" };
  }

  const image = product.image_url ?? OG_IMAGE;

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | KaizenSetup`,
      description: product.description,
      url: `https://www.kaizensetup.name.ng/shop/${slug}`,
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      title: `${product.name} | KaizenSetup`,
      description: product.description,
      images: [image],
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}