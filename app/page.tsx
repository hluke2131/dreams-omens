'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { hasOnboarded } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import PageFooter from '@/app/components/PageFooter'

export default function Home() {
  const router = useRouter()
  const [userInitial,  setUserInitial]  = useState<string | null>(null)
  // true until we confirm the user is an active paid subscriber
  const [showPricing,   setShowPricing]   = useState(true)
  const [showHistory,   setShowHistory]   = useState(false)

  useEffect(() => {
    if (!hasOnboarded()) router.replace('/onboarding')
  }, [router])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user?.email) return
      setUserInitial(data.user.email[0].toUpperCase())

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', data.user.id)
        .single()

      const isPaid =
        profile?.subscription_status === 'active' &&
        (profile?.subscription_tier === 'basic' || profile?.subscription_tier === 'reflect_plus')

      if (isPaid) setShowPricing(false)

      if (
        profile?.subscription_status === 'active' &&
        profile?.subscription_tier === 'reflect_plus'
      ) {
        setShowHistory(true)
      }
    })
  }, [])

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        {showHistory ? (
          <Link href="/history" style={{ color: 'var(--cedar)', fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}>History</Link>
        ) : (
          <Link href="/history" aria-label="History" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>☰</Link>
        )}
        {showPricing && (
          <Link href="/pricing" style={{ color: 'var(--cedar)', fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}>Pricing</Link>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {userInitial ? (
            <Link
              href="/account"
              aria-label="My Account"
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  width:          30,
                  height:         30,
                  borderRadius:   '50%',
                  background:     'var(--cedar)',
                  color:          'white',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       13,
                  fontWeight:     700,
                }}
              >
                {userInitial}
              </div>
            </Link>
          ) : null}
          <Link href="/settings" aria-label="Settings" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>⚙</Link>
        </div>
      </header>

      {/* Brand lockup */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🦉</div>
        <h1 className="text-title-xl" style={{ color: 'var(--ink)', marginBottom: 8 }}>
          Dreams &amp; Omens
        </h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Anonymous and self-guided. Explore the symbols in your dreams and everyday life.
        </p>
      </div>

      {/* Interpret cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        <Link href="/compose/dream" style={{ textDecoration: 'none' }}>
          <div
            className="card-primary"
            style={{ cursor: 'pointer', transition: 'opacity 0.15s ease' }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🌙</div>
            <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 4 }}>
              Interpret Dream
            </h2>
            <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
              Explore the symbols and meanings in your dreams
            </p>
          </div>
        </Link>

        <Link href="/compose/omen" style={{ textDecoration: 'none' }}>
          <div
            className="card-primary"
            style={{ cursor: 'pointer', transition: 'opacity 0.15s ease' }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>👁</div>
            <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 4 }}>
              Interpret Omen
            </h2>
            <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
              Understand the signs and synchronicities around you
            </p>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center' }}>
        <p className="text-caption" style={{ color: 'var(--owl-brown)', marginBottom: 16 }}>
          There&apos;s meaning in the magic. We blend psychology, pattern-spotting, and timeless
          symbolism—no fortune-telling.
        </p>
        <PageFooter />
      </footer>

    </main>
  )
}
