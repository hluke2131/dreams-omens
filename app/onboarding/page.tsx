'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasOnboarded, setOnboarded } from '@/lib/storage'

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    if (hasOnboarded()) router.replace('/')
  }, [router])

  function handleStart() {
    setOnboarded()
    router.replace('/')
  }

  return (
    <main
      style={{
        maxWidth:       480,
        margin:         '0 auto',
        padding:        '40px 24px',
        textAlign:      'center',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        minHeight:      '100dvh',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 80, marginBottom: 24 }}>🦉</div>

      <h1 className="text-title-xl" style={{ color: 'var(--ink)', marginBottom: 16 }}>
        Dreams &amp; Omens
      </h1>

      <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 16, maxWidth: 340 }}>
        Anonymous and self-guided. Explore the symbols in your dreams and everyday life.
      </p>

      <p className="text-helper" style={{ color: 'var(--owl-brown)', marginBottom: 48, maxWidth: 320 }}>
        There&apos;s meaning in the magic. We blend psychology, pattern-spotting, and timeless
        symbolism—no fortune-telling.
      </p>

      <button className="btn-primary" onClick={handleStart} style={{ maxWidth: 320, width: '100%' }}>
        Get Started
      </button>
    </main>
  )
}
