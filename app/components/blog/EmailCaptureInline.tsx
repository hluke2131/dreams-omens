'use client'

import { useState } from 'react'

interface Props {
  ctaText: string
  source:  string
  pdfPath: string
}

export default function EmailCaptureInline({ ctaText, source, pdfPath }: Props) {
  const [expanded,   setExpanded]   = useState(false)
  const [email,      setEmail]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/email-leads', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, source }),
    })

    if (res.ok) {
      setDone(true)
      window.open(pdfPath, '_blank')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <p className="text-helper" style={{ color: 'var(--moss)', fontWeight: 600, marginTop: 8 }}>
        Your guide is on its way. Check the new tab that opened — or look for it in your downloads.
      </p>
    )
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          background:     'none',
          border:         'none',
          padding:        0,
          cursor:         'pointer',
          color:          'var(--cedar)',
          fontSize:       14,
          fontWeight:     600,
          textDecoration: 'underline',
          fontFamily:     'inherit',
        }}
      >
        {ctaText}
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start', marginTop: 10 }}
    >
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          flex:         '1 1 180px',
          padding:      '10px 14px',
          borderRadius: 'var(--radius-s)',
          border:       '1px solid var(--stroke-soft)',
          background:   'var(--bone)',
          color:        'var(--ink)',
          fontSize:     14,
          fontFamily:   'inherit',
          outline:      'none',
        }}
      />
      <button
        type="submit"
        disabled={submitting}
        className="btn-secondary"
        style={{ flex: '0 0 auto', padding: '10px 20px', fontSize: 14, width: 'auto' }}
      >
        {submitting ? '…' : 'Send me the guide'}
      </button>
      {error && (
        <p className="text-helper" style={{ color: 'var(--cedar)', width: '100%', margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  )
}
