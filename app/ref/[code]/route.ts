import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;
  const res = NextResponse.redirect(new URL("/", req.url));

  // Store referral code in cookie for 30 days — read on signup
  res.cookies.set("ref_code", code, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false, // needs to be readable client-side on auth callback
    sameSite: "lax",
  });

  return res;
}