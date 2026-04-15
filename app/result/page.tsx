'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Interpretation, LensType } from '@/lib/types'
import { getInterpretationById, saveInterpretation } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import EmailCapturePopup from '@/app/components/EmailCapturePopup'

const LENSES: { label: string; value: LensType }[] = [
  { label: 'Archetypal', value: 'archetypal' },
  { label: 'Cognitive',  value: 'cognitive'  },
  { label: 'Cultural',   value: 'cultural'   },
]

// ── Share icon (box with arrow up — universal share symbol) ───────────────────
function ShareIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

// ── Share modal (desktop fallback) ────────────────────────────────────────────
function ShareModal({
  shareText,
  shareTitle,
  onClose,
}: {
  shareText:  string
  shareTitle: string
  onClose:    () => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const encodedText = encodeURIComponent(shareText)
  const twitterUrl  = `https://twitter.com/intent/tweet?text=${encodedText}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://dreamsandomens.com')}`
  const emailUrl    = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodedText}`

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(29, 27, 22, 0.55)',
        display:         'flex',
        alignItems:      'flex-end',
        justifyContent:  'center',
        zIndex:          1000,
        padding:         '0 0 env(safe-area-inset-bottom, 0)',
      }}
    >
      <div
        className="card-primary"
        style={{
          width:        '100%',
          maxWidth:     480,
          borderRadius: 'var(--radius-l) var(--radius-l) 0 0',
          padding:      '24px 20px 32px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p className="text-title-m" style={{ color: 'var(--ink)' }}>Share</p>
          <button
            onClick={onClose}
            aria-label="Dismiss"
            style={{
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              fontSize:   20,
              color:      'var(--owl-brown)',
              lineHeight: 1,
              padding:    4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Share text preview */}
        <textarea
          readOnly
          value={shareText}
          rows={6}
          style={{
            width:        '100%',
            padding:      '12px 14px',
            borderRadius: 'var(--radius-s)',
            border:       '1px solid var(--stroke-soft)',
            background:   'var(--sand)',
            color:        'var(--ink)',
            fontSize:     13,
            lineHeight:   '19px',
            resize:       'none',
            fontFamily:   'inherit',
            boxSizing:    'border-box',
            marginBottom: 14,
          }}
        />

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="btn-primary"
          style={{ marginBottom: 16 }}
        >
          {copied ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>

        {/* Platform links */}
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            <button
              style={{
                width:        '100%',
                padding:      '10px 0',
                borderRadius: 'var(--radius-s)',
                border:       '1px solid var(--stroke-soft)',
                background:   'var(--bone)',
                color:        'var(--ink)',
                fontSize:     13,
                fontWeight:   600,
                cursor:       'pointer',
                fontFamily:   'inherit',
              }}
            >
              𝕏 / Twitter
            </button>
          </a>

          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            <button
              style={{
                width:        '100%',
                padding:      '10px 0',
                borderRadius: 'var(--radius-s)',
                border:       '1px solid var(--stroke-soft)',
                background:   'var(--bone)',
                color:        'var(--ink)',
                fontSize:     13,
                fontWeight:   600,
                cursor:       'pointer',
                fontFamily:   'inherit',
              }}
            >
              Facebook
            </button>
          </a>

          <a
            href={emailUrl}
            style={{ flex: 1, textDecoration: 'none' }}
          >
            <button
              style={{
                width:        '100%',
                padding:      '10px 0',
                borderRadius: 'var(--radius-s)',
                border:       '1px solid var(--stroke-soft)',
                background:   'var(--bone)',
                color:        'var(--ink)',
                fontSize:     13,
                fontWeight:   600,
                cursor:       'pointer',
                fontFamily:   'inherit',
              }}
            >
              Email
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResultPage() {
  const router = useRouter()

  const [interp,        setInterp]        = useState<Interpretation | null>(null)
  const [lensLoading,   setLensLoading]   = useState(false)
  const [lensError,     setLensError]     = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isReflectPlus, setIsReflectPlus] = useState(false)
  const [conciseMode,   setConciseMode]   = useState(false)

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timedOutRef = useRef(false)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id')
    if (!id) { router.replace('/'); return }
    const found = getInterpretationById(id)
    if (!found) { router.replace('/'); return }
    setInterp(found)
  }, [router])

  // Check Reflect+ and concise mode
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return

      const [profileRes, settingsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('subscription_tier, subscription_status')
          .eq('id', data.user.id)
          .single(),
        supabase
          .from('user_settings')
          .select('concise_answers')
          .eq('user_id', data.user.id)
          .maybeSingle(),
      ])

      const profile = profileRes.data
      if (
        profile?.subscription_status === 'active' &&
        profile?.subscription_tier === 'reflect_plus'
      ) {
        setIsReflectPlus(true)
      }

      if (settingsRes.data?.concise_answers) {
        setConciseMode(true)
      }
    })
  }, [])

  // Clear any pending timer if the page unmounts mid-request
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // ── Build share content ────────────────────────────────────────────────────
  function buildShareContent(interp: Interpretation): { title: string; text: string } {
    const typeLabel  = interp.type === 'dream' ? 'dream' : 'omen'
    const typeEmoji  = interp.type === 'dream' ? '🌙' : '👁'
    const inputPreview  = interp.input.slice(0, 100).trimEnd()
    const resultPreview = interp.result.slice(0, 150).trimEnd()

    const title = `My ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} Interpretation — Dreams & Omens`

    const text = [
      `${typeEmoji} I just got my ${typeLabel} interpreted at Dreams & Omens:`,
      '',
      `"${inputPreview}${interp.input.length > 100 ? '...' : ''}"`,
      '',
      `"${resultPreview}${interp.result.length > 150 ? '...' : ''}"`,
      '',
      'Get your own free interpretation at dreamsandomens.com',
    ].join('\n')

    return { title, text }
  }

  async function handleShare() {
    if (!interp) return
    const { title, text } = buildShareContent(interp)

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: 'https://dreamsandomens.com' })
      } catch {
        // User dismissed the share sheet — not an error
      }
    } else {
      // Desktop: show modal
      setShowShareModal(true)
    }
  }

  async function handleLens(lens: LensType) {
    if (!interp || lensLoading) return
    setLensLoading(true)
    setLensError(null)
    timedOutRef.current = false

    // 9-second UI timeout — same pattern as ComposeClient
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timedOutRef.current = true
      timerRef.current = null
      setLensLoading(false)
      setLensError(
        'The interpretation is taking longer than expected. Please check your internet connection and try again.',
      )
    }, 9_000)

    try {
      const res = await fetch('/api/interpret', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type:    interp.type,
          text:    interp.input,
          tags:    interp.tags,
          lens,
          concise: isReflectPlus && conciseMode ? true : undefined,
        }),
      })

      if (timedOutRef.current) return
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "We couldn't get an interpretation.")

      const id = `${Date.now()}_${lens}`
      const newInterp: Interpretation = {
        id,
        date:   new Date(),
        type:   interp.type,
        input:  interp.input,
        tags:   interp.tags,
        lens,
        result: data.result,
      }
      saveInterpretation(newInterp)

      // Cloud save for Reflect+ (fire-and-forget)
      // keepalive: true keeps the request alive through the router.push() that follows.
      console.log('[result] isReflectPlus:', isReflectPlus, '— attempting cloud save for lens id:', id)
      if (isReflectPlus) {
        fetch('/api/save-interpretation', {
          method:    'POST',
          headers:   { 'Content-Type': 'application/json' },
          keepalive: true,
          body:      JSON.stringify({
            id,
            type:   interp.type,
            input:  interp.input,
            tags:   interp.tags,
            lens,
            result: data.result,
          }),
        })
          .then(r => {
            if (!r.ok) console.error('[result] save-interpretation responded with status', r.status)
            else console.log('[result] cloud save succeeded for lens id:', id)
          })
          .catch(err => console.error('[result] save-interpretation fetch error:', err))
      }

      router.push(`/result?id=${id}`)
    } catch (err) {
      if (timedOutRef.current) return
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      setLensLoading(false)
      setLensError(err instanceof Error ? err.message : "We couldn't get an interpretation.")
    }
  }

  // ── Not yet loaded ───────────────────────────────────────────────────────────
  if (!interp) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '60px auto' }} />
      </main>
    )
  }

  const typeLabel = interp.type === 'dream' ? 'Dream' : 'Omen'
  const typeIcon  = interp.type === 'dream' ? '🌙' : '👁'
  const lensLabel = interp.lens !== 'none'
    ? ` · ${interp.lens.charAt(0).toUpperCase() + interp.lens.slice(1)} lens`
    : ''

  const { title: shareTitle, text: shareText } = buildShareContent(interp)

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            href="/"
            aria-label="Home"
            style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none', lineHeight: 1 }}
          >
            ←
          </Link>
          <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>
            {typeIcon} {typeLabel} Result
          </h1>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          aria-label="Share"
          style={{
            background:   'none',
            border:       '1px solid var(--stroke-soft)',
            borderRadius: 'var(--radius-s)',
            cursor:       'pointer',
            color:        'var(--cedar)',
            padding:      '6px 12px',
            display:      'flex',
            alignItems:   'center',
            gap:          6,
            fontFamily:   'inherit',
          }}
        >
          <ShareIcon />
          <span className="text-caption" style={{ color: 'var(--cedar)', fontWeight: 600 }}>Share</span>
        </button>
      </header>

      {/* Meta (date + lens) */}
      <p className="text-caption" style={{ color: 'var(--owl-brown)', marginBottom: 20 }}>
        {interp.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        {lensLabel}
        {interp.tags.length > 0 && ` · ${interp.tags.join(', ')}`}
      </p>

      {/* Your input card */}
      <div className="card-secondary" style={{ marginBottom: 16 }}>
        <p className="text-caption" style={{ color: 'var(--owl-brown)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your {typeLabel.toLowerCase()}
        </p>
        <p className="text-body" style={{ color: 'var(--ink)' }}>{interp.input}</p>
      </div>

      {/* Result card */}
      <div className="card-primary" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <p className="text-caption" style={{ color: 'var(--owl-brown)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interpretation
          </p>
          <p className="text-caption" style={{ color: 'var(--owl-brown)' }}>
            {interp.result.length} chars
          </p>
        </div>
        <p className="text-body" style={{ color: 'var(--ink)', lineHeight: '26px', whiteSpace: 'pre-wrap' }}>
          {interp.result}
        </p>
      </div>

      {/* Lens error */}
      {lensError && (
        <div className="card-secondary" style={{ marginBottom: 20 }}>
          <p className="text-helper" style={{ color: 'var(--ink)' }}>{lensError}</p>
        </div>
      )}

      {/* Perspective lenses */}
      <div style={{ marginBottom: 32 }}>
        <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          Try another perspective:
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {LENSES.map(({ label, value }) => (
            <button
              key={value}
              className="btn-lens"
              disabled={lensLoading}
              onClick={() => handleLens(value)}
            >
              {lensLoading && interp.lens === value ? (
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              ) : label}
            </button>
          ))}
        </div>
        {lensLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>Working…</p>
          </div>
        )}
      </div>

      {/* New interpretation CTA */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <button className="btn-secondary">New Interpretation</button>
      </Link>

      {/* Email capture — shown once per device after first interpretation */}
      <EmailCapturePopup />

      {/* Share modal — desktop fallback */}
      {showShareModal && (
        <ShareModal
          shareText={shareText}
          shareTitle={shareTitle}
          onClose={() => setShowShareModal(false)}
        />
      )}

    </main>
  )
}
