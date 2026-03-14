import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TEMPLATE_IDS = { fulfilled: 4, cancelled: 5 };

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

function buildItemsList(items: { name: string; quantity: number; variant?: string; price?: number }[]) {
  return items.map(i =>
    `${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.quantity}${i.price ? ` — ₦${(i.price * i.quantity).toLocaleString("en-NG")}` : ""}`
  ).join("\n");
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { id, status } = await req.json();

  if (!id || !["fulfilled", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: order, error: fetchErr } = await supabase
    .from("consultation_requests")
    .select("id, name, email, items, total_naira, status")
    .eq("id", id)
    .single();

  if (fetchErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const alreadySameStatus = order.status === status;

  const { error: updateErr } = await supabase
    .from("consultation_requests")
    .update({ status })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  if (!alreadySameStatus && order.email) {
    const firstName = order.name?.split(" ")[0] ?? "there";
    const items = order.items ?? [];
    const total = order.total_naira ? fmt(order.total_naira) : "—";

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        templateId: TEMPLATE_IDS[status as "fulfilled" | "cancelled"],
        to: [{ email: order.email, name: order.name }],
        params: {
          first_name: firstName,
          items_list: buildItemsList(items),
          total,
          order_id: order.id,
          track_url: "https://www.kaizensetup.name.ng/track",
        },
      }),
    });
  }

  return NextResponse.json({ ok: true });
}