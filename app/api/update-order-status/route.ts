import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ← Replace with your actual Brevo template IDs
const TEMPLATE_IDS = {
  fulfilled: 4, // ← your fulfilled template ID
  cancelled: 5, // ← your cancelled template ID
};

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

function buildItemsHtml(
  items: { name: string; quantity: number; variant?: string; price?: number }[]
) {
  return items.map(i => `
    <tr>
      <td style="font-family:Inter,Arial,sans-serif;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">
        ${i.name}${i.variant ? ` <span style="color:#6b7280;">(${i.variant})</span>` : ""}
      </td>
      <td style="font-family:Inter,Arial,sans-serif;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;text-align:center;">
        x${i.quantity}
      </td>
      <td style="font-family:Inter,Arial,sans-serif;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;text-align:right;">
        ${i.price ? fmt(i.price * i.quantity) : "—"}
      </td>
    </tr>
  `).join("");
}

export async function POST(req: NextRequest) {
  const { id, status } = await req.json();

  if (!id || !["fulfilled", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // 1. Fetch order
  const { data: order, error: fetchErr } = await supabase
    .from("consultation_requests")
    .select("id, name, email, items, total_naira, status")
    .eq("id", id)
    .single();

  if (fetchErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const alreadySameStatus = order.status === status;

  // 2. Update status
  const { error: updateErr } = await supabase
    .from("consultation_requests")
    .update({ status })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  // 3. Send Brevo template email (skip if status unchanged or no email)
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
          items_html: buildItemsHtml(items),
          total,
        },
      }),
    });
  }

  return NextResponse.json({ ok: true });
}