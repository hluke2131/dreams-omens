'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { hasOnboarded } from '@/lib/storage'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (!hasOnboarded()) router.replace('/onboarding')
  }, [router])

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Link href="/history" aria-label="History" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>☰</Link>
        <Link href="/pricing" style={{ color: 'var(--cedar)', fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}>Pricing</Link>
        <Link href="/settings" aria-label="Settings" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>⚙</Link>
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

        {/* Footer nav links */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 14 }}>
          {[
            { href: '/about',   label: 'About'   },
            { href: '/faq',     label: 'FAQ'     },
            { href: '/pricing', label: 'Pricing' },
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms',   label: 'Terms'   },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-caption"
              style={{ color: 'var(--cedar)', textDecoration: 'none' }}
            >
              {label}
            </Link>
          ))}
        </div>

        <p className="text-caption" style={{ color: 'var(--owl-brown)', marginBottom: 4 }}>
          © 2026 - DreamsAndOmens.com - All Rights Reserved
        </p>
        <p className="text-caption" style={{ color: 'var(--owl-brown)' }}>
          For entertainment purposes only. Not a substitute for professional advice.
        </p>
      </footer>

    </main>
  )
}
