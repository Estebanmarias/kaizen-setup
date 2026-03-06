'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Package, LogOut, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'

type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

type Order = {
  id: string
  created_at: string
  message: string
  status: string
  name: string
}

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'orders' | 'profile'>('orders')

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth?next=/account'); return }

      const { data: profile } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      const { data: orders } = await supabase!
        .from('consultation_requests')
        .select('*')
        .eq('email', data.user.email)
        .order('created_at', { ascending: false })

      setProfile(profile)
      setOrders(orders ?? [])
      setLoading(false)
    })
  }, [router])

  const signOut = async () => {
    await supabase?.auth.signOut()
    router.push('/')
  }

  const statusColor: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    fulfilled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  if (loading) return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    </main>
  )

  const displayName = profile?.full_name ?? profile?.email?.split('@')[0]
  const initials = displayName?.[0]?.toUpperCase()
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : ''

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f0f0f] pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-blue-500 hover:underline mb-8 inline-block">← Back to Home</Link>

        {/* Profile card */}
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-5">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName ?? ''} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{displayName}</h1>
            <p className="text-sm text-gray-400 truncate">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock size={11} /> Member since {memberSince}
            </p>
          </div>
          <button onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
            <LogOut size={13} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-[#1a1a1a] rounded-xl p-1 mb-6">
          {([
            { key: 'orders', label: 'My Orders', icon: Package },
            { key: 'profile', label: 'Profile', icon: User },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === key
                  ? 'bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
                <Package size={36} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No orders yet</p>
                <Link href="/shop" className="text-blue-500 text-sm hover:underline mt-2 inline-block">
                  Browse the shop →
                </Link>
              </div>
            ) : orders.map(order => (
              <div key={order.id}
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-start gap-4">
                <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{order.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[order.status] ?? statusColor.pending}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl divide-y divide-gray-200 dark:divide-gray-800">
            {[
              { label: 'Full Name', value: profile?.full_name ?? '—' },
              { label: 'Email', value: profile?.email ?? '—' },
              { label: 'Member Since', value: memberSince },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Password</span>
              <button className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                Change <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}