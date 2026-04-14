'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PageFooter from '@/app/components/PageFooter'

export default function SignInPage() {
  const router = useRouter()

  const [mode,     setMode]     = useState<'password' | 'magic'>('password')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [sent,     setSent]     = useState(false)

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>
        <div className="card-primary" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 12 }}>
            Check your email
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            We sent a sign-in link to <strong>{email}</strong>.
            Click it to access your account.
          </p>
          <Link href="/" style={{ color: 'var(--cedar)', fontWeight: 600, fontSize: 14 }}>
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" aria-label="Back" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>
          ←
        </Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Sign in</h1>
      </header>

      {/* Mode toggle */}
      <div
        style={{
          display:      'flex',
          background:   'var(--sand)',
          borderRadius: 'var(--radius-m)',
          padding:      4,
          marginBottom: 24,
          gap:          4,
        }}
      >
        {(['password', 'magic'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null) }}
            style={{
              flex:         1,
              padding:      '10px 0',
              borderRadius: 'var(--radius-s)',
              border:       'none',
              cursor:       'pointer',
              fontFamily:   'inherit',
              fontSize:     14,
              fontWeight:   600,
              background:   mode === m ? 'var(--bone)' : 'transparent',
              color:        mode === m ? 'var(--ink)' : 'var(--owl-brown)',
              boxShadow:    mode === m ? '0 2px 8px rgba(29,27,22,0.08)' : 'none',
              transition:   'all 0.15s ease',
            }}
          >
            {m === 'password' ? 'Email & Password' : 'Magic Link'}
          </button>
        ))}
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePasswordSignIn}>
          <div style={{ marginBottom: 14 }}>
            <label className="text-helper" style={{ display: 'block', color: 'var(--owl-brown)', marginBottom: 6, fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label className="text-helper" style={{ display: 'block', color: 'var(--owl-brown)', marginBottom: 6, fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              required
              disabled={loading}
              style={inputStyle}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Link href="/auth/reset-password" style={{ color: 'var(--cedar)', fontSize: 13 }}>
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="text-helper" style={{ color: 'var(--cedar)', marginBottom: 14 }}>{error}</p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleMagicLink}>
          <div style={{ marginBottom: 20 }}>
            <label className="text-helper" style={{ display: 'block', color: 'var(--owl-brown)', marginBottom: 6, fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              style={inputStyle}
            />
          </div>

          {error && (
            <p className="text-helper" style={{ color: 'var(--cedar)', marginBottom: 14 }}>{error}</p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending link…' : 'Send magic link'}
          </button>

          <p className="text-helper" style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 12 }}>
            We&apos;ll email you a one-click sign-in link. No password needed.
          </p>
        </form>
      )}

      <p className="text-helper" style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 28 }}>
        Don&apos;t have an account?{' '}
        <Link href="/auth/sign-up" style={{ color: 'var(--cedar)', fontWeight: 600 }}>
          Create one
        </Link>
      </p>

      <footer style={{ textAlign: 'center', marginTop: 40 }}>
        <PageFooter />
      </footer>

    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width:        '100%',
  padding:      '14px 16px',
  borderRadius: 'var(--radius-m)',
  border:       '1px solid var(--stroke-soft)',
  background:   'var(--bone)',
  color:        'var(--ink)',
  fontSize:     16,
  fontFamily:   'inherit',
  boxSizing:    'border-box',
  outline:      'none',
}
