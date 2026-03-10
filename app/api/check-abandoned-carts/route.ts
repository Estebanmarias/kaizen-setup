import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Secure the endpoint with a secret
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Find carts not updated in 24h, not yet emailed
  const { data: carts, error } = await supabase
    .from("abandoned_carts")
    .select("*")
    .lt("updated_at", cutoff)
    .is("emailed_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!carts?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const cart of carts) {
    const items = cart.items as { name: string; quantity: number; image_url?: string; price_naira?: number }[];

    // Send via Brevo
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        templateId: 6, // ← set this to your Brevo template ID after creating it
        to: [{ email: cart.email }],
        params: {
          items: items.map(i => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price_naira ? `₦${i.price_naira.toLocaleString()}` : "Price on request",
            image_url: i.image_url ?? "",
          })),
          cart_url: "https://www.kaizensetup.name.ng/cart",
          shop_url: "https://www.kaizensetup.name.ng/shop",
        },
      }),
    });

    if (res.ok) {
      await supabase
        .from("abandoned_carts")
        .update({ emailed_at: new Date().toISOString() })
        .eq("id", cart.id);
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
