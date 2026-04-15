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

      <h1 className="text-title-xl" style={{ color: 'var(--ink)', marginBottom: 20 }}>
        Your dreams are trying to tell you something.
      </h1>

      <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 48, maxWidth: 340, lineHeight: '26px' }}>
        Most people ignore them. Or Google them and get a generic answer that feels like it was
        written for someone else. Dreams &amp; Omens gives you something better: a real
        interpretation of your dream, in plain language, in seconds. Ready to start noticing?
      </p>

      <button className="btn-primary" onClick={handleStart} style={{ maxWidth: 320, width: '100%' }}>
        Let&apos;s go
      </button>
    </main>
  )
}
