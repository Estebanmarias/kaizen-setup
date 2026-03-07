import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Save to Supabase
    const { error: insertError } = await supabase
      .from("newsletter_signups")
      .insert([{ email }]);

    const isNew = !insertError;

    if (insertError && insertError.code !== "23505") {
      throw insertError;
    }

    // Sync to Brevo contact list
    const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        email,
        listIds: [2],
        updateEnabled: true,
      }),
    });

    if (!contactRes.ok) {
      const contactErr = await contactRes.json();
      console.error("Brevo contact sync failed:", contactErr);
    }

    // Send welcome email only to new subscribers
    if (isNew) {
      const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY!,
        },
        body: JSON.stringify({
          to: [{ email }],
          templateId: 1,
        }),
      });

      if (!emailRes.ok) {
        const emailErr = await emailRes.json();
        console.error("Brevo welcome email failed:", emailErr);
      } else {
        console.log("Brevo welcome email sent to:", email);
      }
    }

    return NextResponse.json({ message: "Subscribed" }, { status: 200 });
  } catch (e) {
    console.error("Newsletter signup error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}