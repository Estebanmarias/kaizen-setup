'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Users, Search, Download } from 'lucide-react'

type Subscriber = {
  id: string
  email: string
  created_at: string
}

type RegisteredUser = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'subscribers' | 'users'>('subscribers')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!supabase) return
    Promise.all([
      supabase.from('newsletter_signups').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]).then(([{ data: subs }, { data: users }]) => {
      setSubscribers(subs ?? [])
      setUsers(users ?? [])
      setLoading(false)
    })
  }, [])

  const filteredSubs = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const exportCSV = () => {
    const rows = tab === 'subscribers'
      ? filteredSubs.map(s => `${s.email},${s.created_at}`)
      : filteredUsers.map(u => `${u.email},${u.full_name ?? ''},${u.created_at}`)
    const header = tab === 'subscribers' ? 'Email,Joined' : 'Email,Name,Joined'
    const blob = new Blob([`${header}\n${rows.join('\n')}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kaizen-${tab}-${Date.now()}.csv`
    a.click()
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audience</h1>
          <p className="text-gray-500 text-sm mt-1">
            {subscribers.length} subscribers · {users.length} registered users
          </p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Newsletter Subscribers', value: subscribers.length, icon: Mail, color: 'text-blue-400' },
          { label: 'Registered Users', value: users.length, icon: Users, color: 'text-green-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-[#1a1a1a] border border-gray-800 rounded-xl p-1">
          {([
            { key: 'subscribers', label: 'Subscribers', icon: Mail },
            { key: 'users', label: 'Registered Users', icon: Users },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setTab(key); setSearch('') }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-[#1a1a1a] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
          {tab === 'subscribers' ? (
            filteredSubs.length === 0 ? (
              <EmptyState label="No subscribers found" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((s, i) => (
                    <tr key={s.id} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                      <td className="px-5 py-3.5 text-sm text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">
                          {s.email[0].toUpperCase()}
                        </div>
                        {s.email}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{fmt(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            filteredUsers.length === 0 ? (
              <EmptyState label="No registered users found" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.full_name ?? ''} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">
                              {(u.full_name ?? u.email)[0].toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium text-white">{u.full_name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{u.email}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{fmt(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  )
}