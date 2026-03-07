import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { reference, orderData } = await req.json();

    if (!reference || !orderData) {
      return NextResponse.json({ error: "Missing reference or order data" }, { status: 400 });
    }

    // Verify with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Confirm amount matches (in kobo)
    const paidKobo = data.data.amount;
    const expectedKobo = orderData.total_naira * 100;
    if (paidKobo < expectedKobo) {
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    // Save order to Supabase
    const { error: insertErr } = await supabase.from("consultation_requests").insert({
      ...orderData,
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