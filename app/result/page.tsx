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

export default function ResultPage() {
  const router = useRouter()

  const [interp,       setInterp]       = useState<Interpretation | null>(null)
  const [lensLoading,  setLensLoading]  = useState(false)
  const [lensError,    setLensError]    = useState<string | null>(null)
  const [copied,       setCopied]       = useState(false)
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
          .single(),
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

  function handleShare() {
    if (!interp) return
    const typeLabel = interp.type === 'dream' ? 'dream' : 'omen'
    const preview   = interp.result.slice(0, 100)
    const text = `🔮 Just got an amazing ${typeLabel} interpretation from Dreams & Omens! Check it out: ${preview}...\n\nTry it at: https://dreamsandomens.com`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
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
        <button
          onClick={handleShare}
          aria-label="Share"
          style={{
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            fontSize:   20,
            color:      'var(--owl-brown)',
            padding:    4,
          }}
        >
          {copied ? '✓' : '↑'}
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

    </main>
  )
}
