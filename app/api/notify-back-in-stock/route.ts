
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { product_id } = await req.json();
  if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 });

  // Get product name
  const { data: product } = await supabase
    .from("products")
    .select("name, slug")
    .eq("id", product_id)
    .single();

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // Get all pending notification requests
  const { data: requests } = await supabase
    .from("back_in_stock_requests")
    .select("id, email")
    .eq("product_id", product_id)
    .is("notified_at", null);

  if (!requests?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;
  for (const req of requests) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        templateId: 8, // ← update after creating Brevo template
        to: [{ email: req.email }],
        params: {
          product_name: product.name,
          product_url: `https://www.kaizensetup.name.ng/shop/${product.slug}`,
          shop_url: "https://www.kaizensetup.name.ng/shop",
        },
      }),
    });

    if (res.ok) {
      await supabase
        .from("back_in_stock_requests")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", req.id);
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
