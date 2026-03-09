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

    if (!error && data.user) {
      const { user } = data

      // Auto-subscribe to newsletter
      if (user.email) {
        await supabase
          .from('newsletter_signups')
          .upsert({ email: user.email }, { onConflict: 'email', ignoreDuplicates: true })
      }

      // Record referral if ref_code cookie is present
      const refCode = req.cookies.get('ref_code')?.value
      if (refCode) {
        await fetch(`${origin}/api/record-referral`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ref_code: refCode,
            referred_id: user.id,
            referred_email: user.email,
          }),
        })

        // Clear the cookie after recording
        const res = NextResponse.redirect(`${origin}${next}`)
        res.cookies.set('ref_code', '', { path: '/', maxAge: 0 })
        return res
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}