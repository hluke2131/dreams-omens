'use client'

import { useState } from 'react'

interface Props {
  apiEndpoint:     string
  pdfPath:         string
  ebookTitle:      string
  reflectPlusNote: string
}

export default function LandingForm({ apiEndpoint, pdfPath, ebookTitle, reflectPlusNote }: Props) {
  const [email,      setEmail]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      await fetch(apiEndpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
    } catch {
      // Email capture is nice-to-have; PDF delivery is the promise — show success regardless
    }

    setDone(true)
  }

  if (done) {
    return (
      <div>
        <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 12 }}>
          Your guide is ready.
        </h2>
        <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          Click below to download, and check your inbox — we&apos;ll send you the
          link there too just in case.
        </p>
        <a
          href={pdfPath}
          download
          style={{
            display:      'block',
            textAlign:    'center',
            textDecoration: 'none',
            background:   'var(--sage)',
            color:        'white',
            borderRadius: 'var(--radius-m)',
            padding:      '14px 24px',
            fontSize:     16,
            fontWeight:   600,
            fontFamily:   'inherit',
            marginBottom: 16,
          }}
        >
          Download {ebookTitle} (PDF)
        </a>
        <p
          className="text-helper"
          style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}
        >
          {reflectPlusNote}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        placeholder="your@email.com"
        style={{
          width:        '100%',
          padding:      '14px 16px',
          borderRadius: 'var(--radius-s)',
          border:       '1px solid var(--stroke-soft)',
          background:   'var(--bone)',
          color:        'var(--ink)',
          fontSize:     16,
          fontFamily:   'inherit',
          outline:      'none',
          marginBottom: 12,
          boxSizing:    'border-box',
        }}
      />
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary"
      >
        {submitting ? '…' : 'Send me the guide'}
      </button>
      <p
        className="text-helper"
        style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 10 }}
      >
        No spam. Unsubscribe anytime.
      </p>
    </form>
  )
}
