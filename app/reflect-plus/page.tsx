'use client'

/**
 * Reflect+ Guides — Route: /reflect-plus
 *
 * Reflect+ subscribers only. Redirects to /paywall for others.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const GUIDES = [
  {
    title:       'Dream Symbols 101',
    description: 'A foundational guide to common dream symbols, what they may mean, and how to work with them.',
    path:        '/guides/Dream_Symbols_101_v1.pdf',
    icon:        '🌙',
  },
  {
    title:       'Signs & Symbols Field Guide',
    description: 'An illustrated reference for omens, synchronicities, and recurring signs in everyday life.',
    path:        '/guides/Signs_and_Symbols_Field_Guide_v1.pdf',
    icon:        '📖',
  },
]

export default function ReflectPlusPage() {
  const router  = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/paywall')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', data.user.id)
        .single()

      const isReflectPlus =
        profile?.subscription_status === 'active' &&
        profile?.subscription_tier === 'reflect_plus'

      if (!isReflectPlus) {
        router.replace('/paywall')
        return
      }

      setReady(true)
    })
  }, [router])

  if (!ready) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '60px auto' }} />
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/account" aria-label="Back" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Your Guides</h1>
      </header>

      <div
        style={{
          background:   'var(--sage)',
          borderRadius: 'var(--radius-s)',
          padding:      '6px 14px',
          display:      'inline-flex',
          alignItems:   'center',
          gap:          6,
          marginBottom: 24,
        }}
      >
        <span style={{ fontSize: 12 }}>✨</span>
        <p className="text-caption" style={{ color: 'white', fontWeight: 700, letterSpacing: '0.04em' }}>
          REFLECT+ EXCLUSIVE
        </p>
      </div>

      <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
        These guides are yours as a Reflect+ subscriber. Download them to keep forever.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {GUIDES.map(guide => (
          <a
            key={guide.path}
            href={guide.path}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="card-primary"
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        16,
                cursor:     'pointer',
                transition: 'opacity 0.15s ease',
              }}
            >
              <div
                style={{
                  fontSize:   32,
                  flexShrink: 0,
                  width:      52,
                  height:     52,
                  background: 'var(--sand)',
                  borderRadius: 'var(--radius-s)',
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {guide.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p className="text-helper" style={{ color: 'var(--ink)', fontWeight: 700, marginBottom: 3 }}>
                  {guide.title}
                </p>
                <p className="text-caption" style={{ color: 'var(--text-secondary)', lineHeight: '16px' }}>
                  {guide.description}
                </p>
              </div>
              <span style={{ color: 'var(--cedar)', fontSize: 18, flexShrink: 0 }}>↓</span>
            </div>
          </a>
        ))}
      </div>

    </main>
  )
}
