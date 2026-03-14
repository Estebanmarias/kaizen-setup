import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { code, total_naira } = await req.json();

  if (!code || !total_naira) {
    return NextResponse.json({ error: "Missing code or total." }, { status: 400 });
  }

  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .single();

  if (error || !promo) {
    return NextResponse.json({ error: "Invalid or expired promo code." }, { status: 404 });
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
  }

  if (promo.max_uses !== null && promo.uses >= promo.max_uses) {
    return NextResponse.json({ error: "This promo code has reached its usage limit." }, { status: 400 });
  }

  if (promo.min_order_naira && total_naira < promo.min_order_naira) {
    return NextResponse.json({
      error: `Minimum order of ₦${promo.min_order_naira.toLocaleString()} required for this code.`
    }, { status: 400 });
  }

  let discount = 0;
  if (promo.type === "percent") {
    discount = Math.round((promo.value / 100) * total_naira);
  } else {
    discount = Math.min(promo.value, total_naira);
  }

  return NextResponse.json({
    valid: true,
    discount_naira: discount,
    type: promo.type,
    value: promo.value,
    message: promo.type === "percent"
      ? `${promo.value}% off applied — you save ₦${discount.toLocaleString()}`
      : `₦${discount.toLocaleString()} off applied`,
  });
}