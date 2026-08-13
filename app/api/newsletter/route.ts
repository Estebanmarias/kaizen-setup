import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = (req as any).headers.get?.("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = rateLimit({ key: `newsletter:${ip}`, limit: 3, windowMs: 60 * 60 * 1000 });
  if (!success) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from("newsletter_signups")
      .insert([{ email }]);

    const isNew = !insertError;

    if (insertError && insertError.code !== "23505") {
      throw insertError;
    }

    const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({ email, listIds: [2], updateEnabled: true }),
    });

    if (!contactRes.ok) {
      console.error("Brevo contact sync failed:", await contactRes.json());
    }

    if (isNew) {
      const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY!,
        },
        body: JSON.stringify({ to: [{ email }], templateId: 1 }),
      });

      if (!emailRes.ok) {
        console.error("Brevo welcome email failed:", await emailRes.json());
      }
    }

    return NextResponse.json({ message: "Subscribed" }, { status: 200 });
  } catch (e) {
    console.error("Newsletter signup error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}