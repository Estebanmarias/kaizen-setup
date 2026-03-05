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

    const { error } = await supabase
      .from("newsletter_signups")
      .insert([{ email }]);

    if (error) {
      // Handle duplicate email gracefully
      if (error.code === "23505") {
        return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ message: "Subscribed" }, { status: 200 });
  } catch (e) {
    console.error("Newsletter signup error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}