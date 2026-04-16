'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PageFooter from '@/app/components/PageFooter'
import PasswordInput from '@/app/components/PasswordInput'

export default function ResetPasswordPage() {
  const router = useRouter()

  // If the user arrives here from the reset-password email link,
  // Supabase puts them in a recovery session. We detect that and show the
  // new-password form instead of the request form.
  const [hasRecoverySession, setHasRecoverySession] = useState(false)

  const [email,       setEmail]       = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [done,        setDone]        = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // Check if the user is already in a recovery / password_recovery state
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoverySession(true)
      }
    })
  }, [])

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  async function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // ── Sent confirmation ────────────────────────────────────────────────────────
  if (done) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>
        <div className="card-primary" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 12 }}>
            Check your email
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            We sent a password reset link to <strong>{email}</strong>.
          </p>
          <Link href="/auth/sign-in" style={{ color: 'var(--cedar)', fontWeight: 600, fontSize: 14 }}>
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  // ── Set new password (recovery session) ─────────────────────────────────────
  if (hasRecoverySession) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

        <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Set new password</h1>
        </header>

        <form onSubmit={handleSetNewPassword}>
          <div style={{ marginBottom: 20 }}>
            <label className="text-helper" style={{ display: 'block', color: 'var(--owl-brown)', marginBottom: 6, fontWeight: 600 }}>
              New password
            </label>
            <PasswordInput
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              disabled={loading}
              style={inputStyle}
            />
          </div>

          {error && (
            <p className="text-helper" style={{ color: 'var(--cedar)', marginBottom: 14 }}>{error}</p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <footer style={{ textAlign: 'center', marginTop: 40 }}>
          <PageFooter />
        </footer>

      </main>
    )
  }

  // ── Request reset form ───────────────────────────────────────────────────────
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/auth/sign-in" aria-label="Back" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>
          ←
        </Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Reset password</h1>
      </header>

      <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleRequestReset}>
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
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

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
