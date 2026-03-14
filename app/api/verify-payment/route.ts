import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kaizensetup.name.ng";
const ADMIN_EMAIL = "kaizensetup.ng@gmail.com";

async function sendBrevo(payload: object) {
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { reference, orderData } = await req.json();

    if (!reference || !orderData) {
      return NextResponse.json({ error: "Missing reference or order data" }, { status: 400 });
    }

    // ── Resolve user_id from session token ─────────────────────────────────
    let resolvedUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      resolvedUserId = user?.id ?? null;
    }

    // ── Verify with Paystack ────────────────────────────────────────────────
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // ── Confirm amount matches (kobo) ───────────────────────────────────────
    const paidKobo = paystackData.data.amount;

    if (!orderData.total_naira || orderData.total_naira <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    const expectedKobo = Math.round(orderData.total_naira * 100);
    if (paidKobo < expectedKobo) {
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    // ── Save order ──────────────────────────────────────────────────────────
    const { user_id: _ignored, ...safeOrderData } = orderData;

    const { data: insertedOrder, error: insertErr } = await supabaseAdmin
      .from("consultation_requests")
      .insert({
        ...safeOrderData,
        user_id: resolvedUserId,
        payment_status: "paid",
        payment_ref: reference,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    const orderId = insertedOrder?.id ?? null;

    // ── Deduct stock ────────────────────────────────────────────────────────
    const items: { name: string; quantity: number; price?: number; variant?: string }[] = orderData.items ?? [];

    await Promise.all(
      items.map(async (item) => {
        const { data: product } = await supabaseAdmin
          .from("products")
          .select("id, low_stock_count, in_stock")
          .eq("name", item.name)
          .single();

        if (!product || product.low_stock_count === null) return;

        const newCount = Math.max(0, product.low_stock_count - item.quantity);
        await supabaseAdmin
          .from("products")
          .update({
            low_stock_count: newCount,
            ...(newCount === 0 ? { in_stock: false } : {}),
          })
          .eq("id", product.id);
      })
    );

    // ── Build shared order data for emails ─────────────────────────────────
    const firstName = (orderData.name as string)?.split(" ")[0] ?? "there";
    const totalFormatted = `₦${Number(orderData.total_naira).toLocaleString("en-NG")}`;
    const trackUrl = orderId
      ? `${BASE_URL}/track?order=${orderId}&email=${encodeURIComponent(orderData.email)}`
      : `${BASE_URL}/track`;

    const itemsList = items
      .map(i => `• ${i.name}${i.variant ? ` (${i.variant})` : ""} × ${i.quantity}${i.price ? ` — ₦${(i.price * i.quantity).toLocaleString("en-NG")}` : ""}`)
      .join("\n");

    // ── 1. Customer order confirmation (Brevo template 4) ──────────────────
    await sendBrevo({
      to: [{ email: orderData.email, name: orderData.name }],
      templateId: 4,
      params: {
        first_name: firstName,
        items_list: itemsList,
        total: totalFormatted,
        order_id: orderId ?? reference,
        track_url: trackUrl,
      },
    });

    // ── 2. Admin notification (inline HTML) ────────────────────────────────
    const adminHtml = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f0f0f;border-radius:12px;overflow:hidden;">
        <div style="background:#1a1a1a;padding:20px 28px;border-bottom:1px solid #ffffff12;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">New Paid Order</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#ffffff;">₦${Number(orderData.total_naira).toLocaleString("en-NG")} received</p>
        </div>
        <div style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr><td style="color:#6b7280;padding:6px 0;">Customer</td><td style="color:#ffffff;font-weight:600;text-align:right;">${orderData.name}</td></tr>
            <tr><td style="color:#6b7280;padding:6px 0;">Email</td><td style="color:#ffffff;text-align:right;">${orderData.email}</td></tr>
            <tr><td style="color:#6b7280;padding:6px 0;">Phone</td><td style="color:#ffffff;text-align:right;">${orderData.phone ?? "—"}</td></tr>
            <tr><td style="color:#6b7280;padding:6px 0;">Payment Ref</td><td style="color:#ffffff;font-family:monospace;font-size:11px;text-align:right;">${reference}</td></tr>
            ${orderId ? `<tr><td style="color:#6b7280;padding:6px 0;">Order ID</td><td style="color:#ffffff;font-family:monospace;font-size:11px;text-align:right;">${orderId}</td></tr>` : ""}
          </table>
          <div style="margin-top:20px;background:#ffffff08;border-radius:8px;padding:14px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">Items</p>
            <p style="margin:0;font-size:13px;color:#d1d5db;white-space:pre-line;">${itemsList}</p>
          </div>
          ${orderData.message ? `<div style="margin-top:14px;background:#ffffff08;border-radius:8px;padding:14px;"><p style="margin:0 0 4px;font-size:11px;color:#6b7280;">Note from customer</p><p style="margin:0;font-size:13px;color:#d1d5db;">${orderData.message}</p></div>` : ""}
          <div style="margin-top:20px;text-align:center;">
            <a href="https://wa.me/${orderData.phone?.replace(/\D/g, "") ?? "2347035378462"}?text=${encodeURIComponent(`Hi ${firstName}! Your KaizenSetup order of ${totalFormatted} has been confirmed. We'll be in touch shortly with delivery details.`)}"
              style="display:inline-block;background:#25d366;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;margin-right:8px;">
              WhatsApp Customer
            </a>
            <a href="${BASE_URL}/admin"
              style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">
              View in Admin →
            </a>
          </div>
        </div>
      </div>
    `;

    await sendBrevo({
      to: [{ email: ADMIN_EMAIL, name: "KaizenSetup Admin" }],
      sender: { email: "hello@kaizensetup.name.ng", name: "KaizenSetup" },
      subject: `🛍️ New Order — ${orderData.name} · ${totalFormatted}`,
      htmlContent: adminHtml,
    });

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("verify-payment error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}