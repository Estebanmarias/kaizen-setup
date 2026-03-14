'use client'

import { useState, Suspense, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const inp = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const ref = searchParams.get('ref')

  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (ref) {
      document.cookie = `ref_code=${ref}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    }
  }, [ref])

  const handleSubmit = async () => {
    if (!supabase) return
    setError(''); setSuccess(''); setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      })
      if (error) { setError(error.message); setLoading(false); return }
      await supabase.from('newsletter_signups').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })
      setSuccess('Check your email to confirm your account.')
      setLoading(false)
      return
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (signInData.user) {
      await supabase.from('newsletter_signups').upsert({ email: signInData.user.email }, { onConflict: 'email', ignoreDuplicates: true })
    }
    router.push(next)
  }

  const handleGoogle = async () => {
    if (!supabase) return
    setGoogleLoading(true)
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.kaizensetup.name.ng'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${BASE_URL}/api/auth/callback?next=${next}` },
    })
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center font-bold text-xl tracking-tight text-gray-900 mb-8">
          Kaizen<span className="text-blue-500">Setup</span>
        </Link>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors mb-6 disabled:opacity-50">
            {googleLoading ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className={inp} />
            )}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className={inp} />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className={`${inp} pr-10`}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}
            {success && <p className="text-green-500 text-xs">{success}</p>}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing you agree to our terms and privacy policy.
        </p>
      </div>
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </main>
    }>
      <AuthForm />
    </Suspense>
  )
}