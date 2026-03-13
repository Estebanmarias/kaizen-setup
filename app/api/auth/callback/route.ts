import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.kaizensetup.name.ng'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { user } = data

      if (user.email) {
        await supabase
          .from('newsletter_signups')
          .upsert({ email: user.email }, { onConflict: 'email', ignoreDuplicates: true })
      }

      const refCode = req.cookies.get('ref_code')?.value ?? searchParams.get('ref') ?? null
      if (refCode) {
        await fetch(`${BASE_URL}/api/record-referral`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ref_code: refCode,
            referred_id: user.id,
            referred_email: user.email,
          }),
        })

        const res = NextResponse.redirect(`${BASE_URL}${next}`)
        res.cookies.set('ref_code', '', { path: '/', maxAge: 0 })
        return res
      }
    }
  }

  return NextResponse.redirect(`${BASE_URL}${next}`)
}