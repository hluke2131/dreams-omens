'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PageFooter from '@/app/components/PageFooter'
import type { User } from '@supabase/supabase-js'

export default function AccountPage() {
  const router = useRouter()
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/sign-in')
      } else {
        setUser(data.user)
        setLoading(false)
      }
    })
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '60px auto' }} />
      </main>
    )
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" aria-label="Back" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>
          ←
        </Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>My Account</h1>
      </header>

      {/* Avatar + email */}
      <div className="card-primary" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div
          style={{
            width:          44,
            height:         44,
            borderRadius:   '50%',
            background:     'var(--cedar)',
            color:          'white',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       18,
            fontWeight:     700,
            flexShrink:     0,
          }}
        >
          {initial}
        </div>
        <div>
          <p className="text-body" style={{ color: 'var(--ink)', fontWeight: 600 }}>
            {user?.email}
          </p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
            Joined {new Date(user?.created_at ?? '').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Subscription placeholder */}
      <div className="card-secondary" style={{ marginBottom: 20 }}>
        <p className="text-helper" style={{ color: 'var(--owl-brown)', fontWeight: 600, marginBottom: 6 }}>
          SUBSCRIPTION
        </p>
        <p className="text-body" style={{ color: 'var(--ink)', marginBottom: 12 }}>
          Subscription details coming in Phase 3.
        </p>
        <Link href="/pricing" style={{ color: 'var(--cedar)', fontWeight: 600, fontSize: 14 }}>
          View plans →
        </Link>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="btn-secondary"
        style={{ background: 'transparent', color: 'var(--cedar)', border: '1px solid var(--cedar)', boxShadow: 'none' }}
      >
        Sign out
      </button>

      <footer style={{ textAlign: 'center', marginTop: 40 }}>
        <PageFooter />
      </footer>

    </main>
  )
}
