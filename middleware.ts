import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["kaizensetup.ng@gmail.com"];
const ADMIN_LOGIN = "/admin/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes — skip the login page itself
  if (!pathname.startsWith("/admin") || pathname === ADMIN_LOGIN) {
    return NextResponse.next();
  }

  // Check for Supabase session cookie
  const accessToken = req.cookies.get("sb-access-token")?.value
    ?? req.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`)?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN, req.url));
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user || !ADMIN_EMAILS.includes(user.email ?? "")) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(ADMIN_LOGIN, req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};