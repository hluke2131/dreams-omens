'use client'

import { useState, useEffect } from 'react'

const COOKIE_KEY = 'cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position:     'fixed',
        bottom:       0,
        left:         0,
        right:        0,
        zIndex:       1000,
        background:   'var(--bone)',
        borderTop:    '1px solid var(--stroke-soft)',
        boxShadow:    '0 -4px 24px rgba(29,27,22,0.10)',
        padding:      '16px 20px',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
        gap:          16,
        flexWrap:     'wrap',
      }}
    >
      <p className="text-helper" style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 200 }}>
        We use cookies and local storage to remember your preferences and keep you signed in.
        See our{' '}
        <a href="/privacy" style={{ color: 'var(--cedar)' }}>Privacy Policy</a>.
      </p>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding:      '8px 16px',
            borderRadius: 'var(--radius-s)',
            border:       '1px solid var(--stroke-soft)',
            background:   'transparent',
            color:        'var(--owl-brown)',
            fontSize:     13,
            fontWeight:   600,
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            padding:      '8px 16px',
            borderRadius: 'var(--radius-s)',
            border:       'none',
            background:   'var(--sage)',
            color:        'white',
            fontSize:     13,
            fontWeight:   600,
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
