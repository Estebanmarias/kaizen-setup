import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user?.email) {
      await supabase
        .from('newsletter_signups')
        .upsert({ email: data.user.email }, { onConflict: 'email', ignoreDuplicates: true })
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}