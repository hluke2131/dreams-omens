'use client'

import { useState, useEffect } from 'react'

const POPUP_SEEN_KEY = 'email_popup_seen'
const EBOOK_URL = '/placeholder-ebook.pdf' // Replace with real file path when supplied

export default function EmailCapturePopup() {
  const [visible, setVisible]   = useState(false)
  const [email,   setEmail]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  useEffect(() => {
    // Only show if not already dismissed/submitted on this device
    if (!localStorage.getItem(POPUP_SEEN_KEY)) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(POPUP_SEEN_KEY, '1')
    setVisible(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/email-leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')

      localStorage.setItem(POPUP_SEEN_KEY, '1')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position:   'fixed',
          inset:      0,
          background: 'rgba(29, 27, 22, 0.45)',
          zIndex:     900,
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Special offer"
        style={{
          position:     'fixed',
          bottom:       0,
          left:         '50%',
          transform:    'translateX(-50%)',
          width:        '100%',
          maxWidth:     480,
          background:   'var(--bone)',
          borderRadius: 'var(--radius-l) var(--radius-l) 0 0',
          padding:      '28px 24px 36px',
          zIndex:       910,
          boxShadow:    '0 -8px 40px rgba(29, 27, 22, 0.18)',
        }}
      >
        {success ? (
          // ── Success state ────────────────────────────────────────────────────
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>✨</div>
            <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 10 }}>
              Your offer is waiting
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Use code <strong style={{ color: 'var(--moss)', fontSize: 18, letterSpacing: '0.04em' }}>DREAMS2</strong> at checkout
              to get your first <strong>2 months for $0.99/month</strong>.
            </p>
            <a
              href={EBOOK_URL}
              download
              style={{ display: 'block', marginBottom: 20, textDecoration: 'none' }}
            >
              <button className="btn-secondary" style={{ fontSize: 14 }}>
                Download Your Free Dream Guide ↓
              </button>
            </a>
            <button
              onClick={dismiss}
              style={{
                background:  'none',
                border:      'none',
                cursor:      'pointer',
                color:       'var(--owl-brown)',
                fontSize:    13,
                fontFamily:  'inherit',
              }}
            >
              Close
            </button>
          </div>
        ) : (
          // ── Offer state ──────────────────────────────────────────────────────
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🌙</div>
              <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 8 }}>
                Unlock 2 months for $0.99 each
              </h2>
              <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>
                Enter your email to claim an exclusive coupon code—plus a free dream guide to keep.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                style={{
                  width:          '100%',
                  padding:        '14px 16px',
                  borderRadius:   'var(--radius-m)',
                  border:         '1px solid var(--stroke-soft)',
                  background:     'var(--cream)',
                  color:          'var(--ink)',
                  fontSize:       16,
                  fontFamily:     'inherit',
                  boxSizing:      'border-box',
                  marginBottom:   12,
                  outline:        'none',
                }}
              />

              {error && (
                <p className="text-helper" style={{ color: 'var(--cedar)', marginBottom: 10 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !email.trim()}
                style={{ marginBottom: 8 }}
              >
                {loading ? 'Claiming…' : 'Claim My Offer'}
              </button>
            </form>

            <p className="text-caption" style={{ color: 'var(--owl-brown)', textAlign: 'center', marginBottom: 14 }}>
              $0.99/month for your first 2 months. Auto-renews at regular price. Cancel anytime.
            </p>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={dismiss}
                style={{
                  background:  'none',
                  border:      'none',
                  cursor:      'pointer',
                  color:       'var(--owl-brown)',
                  fontSize:    13,
                  fontFamily:  'inherit',
                  textDecoration: 'underline',
                }}
              >
                No thanks
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
