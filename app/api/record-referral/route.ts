import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { ref_code, referred_id, referred_email } = await req.json();

  if (!ref_code || !referred_id) {
    return NextResponse.json({ error: "Missing params." }, { status: 400 });
  }

  // Find referrer by code
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", ref_code)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Invalid referral code." }, { status: 404 });
  }

  // Don't allow self-referral
  if (profile.id === referred_id) {
    return NextResponse.json({ error: "Self-referral not allowed." }, { status: 400 });
  }

  // Prevent duplicate referral
  const { data: existing } = await supabase
    .from("referrals")
    .select("id")
    .eq("referred_id", referred_id)
    .single();

  if (existing) {
    return NextResponse.json({ ok: true, note: "Already recorded." });
  }

  await supabase.from("referrals").insert({
    referrer_id: profile.id,
    referred_id,
    referred_email,
    status: "signed_up",
  });

  return NextResponse.json({ ok: true });
}