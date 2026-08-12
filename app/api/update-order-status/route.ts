import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TEMPLATE_IDS: Record<string, number> = {
  confirmed: 4,
  processing: 4,
  out_for_delivery: 4,
  fulfilled: 4,
  cancelled: 5,
};

const STATUS_SUBJECT: Record<string, string> = {
  confirmed: "Your order has been confirmed ✅",
  processing: "Your order is being processed 🔧",
  out_for_delivery: "Your order is on the way 🚚",
  fulfilled: "Your order has been delivered 🎉",
  cancelled: "Your order has been cancelled",
};

const STATUS_DESCRIPTION: Record<string, string> = {
  confirmed: "Great news! We've confirmed your order and we're getting it ready for you.",
  processing: "Your order is currently being packaged and prepared for dispatch.",
  out_for_delivery: "Your order is on its way! Our delivery team is headed to you.",
  fulfilled: "Your order has been delivered. We hope you love your new setup! 🎉",
  cancelled: "Your order has been cancelled. If you have questions, reach us on WhatsApp.",
};

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

  try {
    const { id, status } = await req.json();

    if (!id || !["confirmed", "processing", "out_for_delivery", "fulfilled", "cancelled", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data: order, error: fetchErr } = await supabase
      .from("order_requests")
      .select("id, name, email, items, total_naira, status")
      .eq("id", id)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const alreadySameStatus = order.status === status;

    const { error: updateErr } = await supabase
      .from("order_requests")
      .update({ status })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    if (!alreadySameStatus && order.email && TEMPLATE_IDS[status]) {
      const firstName = order.name?.split(" ")[0] ?? "there";
      const items = order.items ?? [];
      const total = order.total_naira ? fmt(order.total_naira) : "—";

      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY!,
          },
          body: JSON.stringify({
            templateId: TEMPLATE_IDS[status],
            to: [{ email: order.email, name: order.name }],
            sender: { email: "hello@kaizensetup.name.ng", name: "KaizenSetup" },
            subject: STATUS_SUBJECT[status],
            params: {
              first_name: firstName,
              items_list: buildItemsList(items),
              total,
              order_id: order.id,
              status_label: STATUS_SUBJECT[status],
              status_description: STATUS_DESCRIPTION[status],
              track_url: `https://www.kaizensetup.name.ng/track?order=${order.id}&email=${encodeURIComponent(order.email)}`,
            },
          }),
        });
      } catch (emailErr) {
        console.error("Brevo email failed:", emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("update-order-status error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
