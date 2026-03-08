import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { reference, orderData } = await req.json();

    if (!reference || !orderData) {
      return NextResponse.json({ error: "Missing reference or order data" }, { status: 400 });
    }

    // ── Resolve user_id server-side from the session token ─────────────────
    // Never trust user_id from the client body — resolve it here instead.
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
    // Strip any client-supplied user_id; use the server-resolved one only.
    const { user_id: _ignored, ...safeOrderData } = orderData;

    const { error: insertErr } = await supabaseAdmin.from("consultation_requests").insert({
      ...safeOrderData,
      user_id: resolvedUserId,
      payment_status: "paid",
      payment_ref: reference,
      status: "pending",
    });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify-payment error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}