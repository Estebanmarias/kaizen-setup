import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = "kaizensetup.ng@gmail.com";

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

async function sendEmail(to: { email: string; name: string }, subject: string, html: string) {
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: "KaizenSetup", email: "hello@kaizensetup.name.ng" },
      to: [to],
      subject,
      htmlContent: html,
    }),
  });
}

function customerEmail(type: "requested" | "approved" | "rejected", order: {
  name: string;
  items: { name: string; quantity: number; price?: number; variant?: string }[];
  total_naira: number | null;
  payment_status: string;
}) {
  const firstName = order.name.split(" ")[0];
  const isPaid = order.payment_status === "paid";

  const headlines: Record<string, string> = {
    requested: `Got it, ${firstName}. Your cancellation request is being reviewed.`,
    approved:  `Your cancellation has been approved, ${firstName}.`,
    rejected:  `Your cancellation request was declined, ${firstName}.`,
  };
  const bodies: Record<string, string> = {
    requested: isPaid
      ? "We've received your cancellation request. Since this order was paid, we'll review it and get back to you within 24 hours regarding your refund."
      : "We've received your cancellation request. It will be reviewed shortly.",
    approved: isPaid
      ? "Your order has been cancelled and a refund will be processed to your original payment method. Please allow 3–5 business days."
      : "Your order has been successfully cancelled.",
    rejected: "After reviewing your request, we're unable to cancel this order as it's already being processed. Reach out via WhatsApp if you have questions.",
  };
  const badges: Record<string, { color: string; label: string }> = {
    requested: { color: "#f59e0b", label: "Cancellation Requested" },
    approved:  { color: "#22c55e", label: "Cancellation Approved" },
    rejected:  { color: "#ef4444", label: "Cancellation Declined" },
  };

  const { color, label } = badges[type];
  const itemRows = (order.items ?? []).map(i => `
    <tr>
      <td style="font-family:Inter,Arial,sans-serif;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">
        ${i.name}${i.variant ? ` <span style="color:#6b7280;">(${i.variant})</span>` : ""}
      </td>
      <td style="font-family:Inter,Arial,sans-serif;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;text-align:center;">x${i.quantity}</td>
      <td style="font-family:Inter,Arial,sans-serif;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;text-align:right;">
        ${i.price ? fmt(i.price * i.quantity) : "—"}
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Inter,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:#0f0f0f;padding:28px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-family:Inter,Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">Kaizen<span style="color:#6b7280;">Setup</span></td>
            <td align="right" style="font-family:Inter,Arial,sans-serif;font-size:11px;font-weight:600;color:${color};letter-spacing:1px;text-transform:uppercase;">${label}</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:32px 40px;">
        <p style="font-size:17px;font-weight:600;color:#111827;margin:0 0 8px;">${headlines[type]}</p>
        <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 24px;">${bodies[type]}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;">
          <thead><tr style="background:#f9fafb;">
            <th style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;padding:8px 12px;text-align:left;border-bottom:1px solid #e5e7eb;">Item</th>
            <th style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;padding:8px 12px;text-align:center;border-bottom:1px solid #e5e7eb;">Qty</th>
            <th style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;padding:8px 12px;text-align:right;border-bottom:1px solid #e5e7eb;">Subtotal</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        ${order.total_naira ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="background:#f9fafb;border-radius:10px;padding:14px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="font-size:13px;font-weight:600;color:#6b7280;">Total</td>
              <td align="right" style="font-size:16px;font-weight:800;color:#111827;">${fmt(order.total_naira)}</td>
            </tr></table>
          </td></tr>
        </table>` : ""}
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr><td style="background:#3b82f6;border-radius:10px;">
            <a href="https://wa.me/2347035378462" style="display:inline-block;font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;padding:12px 28px;">Contact Us on WhatsApp →</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">© ${new Date().getFullYear()} KaizenSetup · Lagos, Nigeria</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function adminEmail(order: {
  name: string; email: string; phone: string;
  items: { name: string; quantity: number; price?: number }[];
  total_naira: number | null; payment_status: string; id: string;
}) {
  const isPaid = order.payment_status === "paid";
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:#0f0f0f;padding:24px 32px;">
        <p style="font-size:18px;font-weight:700;color:#fff;margin:0;">Kaizen<span style="color:#6b7280;">Setup</span> <span style="font-size:12px;color:#f59e0b;font-weight:600;letter-spacing:1px;text-transform:uppercase;">· Cancellation Request</span></p>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        <p style="font-size:15px;font-weight:600;color:#111827;margin:0 0 16px;">A customer has requested to cancel their order.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;margin-bottom:20px;">
          <tr><td style="padding:16px;">
            <p style="font-size:12px;color:#6b7280;margin:0 0 4px;">Customer</p>
            <p style="font-size:14px;font-weight:600;color:#111827;margin:0 0 12px;">${order.name} · ${order.email} · ${order.phone}</p>
            <p style="font-size:12px;color:#6b7280;margin:0 0 4px;">Items</p>
            <p style="font-size:14px;color:#111827;margin:0 0 12px;">${(order.items ?? []).map(i => `${i.name} x${i.quantity}`).join(", ")}</p>
            <p style="font-size:12px;color:#6b7280;margin:0 0 4px;">Total · Payment</p>
            <p style="font-size:14px;font-weight:600;color:#111827;margin:0;">${order.total_naira ? fmt(order.total_naira) : "—"} · <span style="color:${isPaid ? "#22c55e" : "#f59e0b"}">${isPaid ? "PAID — refund required" : "Unpaid"}</span></p>
          </td></tr>
        </table>
        <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">Go to your admin dashboard to approve or reject this request.</p>
        <table cellpadding="0" cellspacing="0"><tr><td style="background:#0f0f0f;border-radius:8px;">
          <a href="https://www.kaizensetup.name.ng/admin" style="display:inline-block;font-size:13px;font-weight:700;color:#fff;text-decoration:none;padding:10px 24px;">Go to Admin →</a>
        </td></tr></table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  const { orderId, userId } = await req.json();

  if (!orderId || !userId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Fetch order
  const { data: order, error: fetchErr } = await supabase
    .from("consultation_requests")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Security: ensure order belongs to this user
  if (order.user_id && order.user_id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Only pending orders can be cancelled
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Only pending orders can be cancelled" }, { status: 400 });
  }

  const isPaid = order.payment_status === "paid";
  const newStatus = isPaid ? "cancellation_requested" : "cancelled";

  // Update status
  const { error: updateErr } = await supabase
    .from("consultation_requests")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  // Email customer
  await sendEmail(
    { email: order.email, name: order.name },
    isPaid ? "Your cancellation request has been received" : "Your KaizenSetup order has been cancelled",
    customerEmail(isPaid ? "requested" : "approved", order)
  );

  // Email admin
  await sendEmail(
    { email: ADMIN_EMAIL, name: "KaizenSetup Admin" },
    `Cancellation request — ${order.name}${isPaid ? " (PAID)" : ""}`,
    adminEmail(order)
  );

  return NextResponse.json({ ok: true, status: newStatus });
}