'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { InterpretationType, Interpretation } from '@/lib/types'
import { FREE_MONTHLY_LIMIT, getMonthlyUsage, incrementMonthlyUsage } from '@/lib/types'
import { saveInterpretation } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'
import CheckoutButton from '@/app/components/CheckoutButton'

const MAX_CHARS  = 1200
const UI_TIMEOUT = 9_000

interface Props {
  type:        InterpretationType
  title:       string
  icon:        string
  placeholder: string
  hint:        string
  tags:        readonly string[]
}

export default function ComposeClient({ type, title, icon, placeholder, hint, tags }: Props) {
  const router = useRouter()

  const [text,             setText]             = useState('')
  const [selectedTags,     setSelectedTags]     = useState<string[]>([])
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState<string | null>(null)
  const [showGate,         setShowGate]         = useState(false)
  // null = still checking, true = paid subscriber (skip gate), false = free/logged-out
  const [isPaidSubscriber, setIsPaidSubscriber] = useState<boolean | null>(null)
  const [isReflectPlus,      setIsReflectPlus]      = useState(false)
  const [conciseMode,        setConciseMode]        = useState(false)   // global default from user_settings
  const [conciseThisOne,     setConciseThisOne]     = useState(false)   // per-interpretation override

  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledRef = useRef(false)   // true after 9s timeout fires

  // Check subscription status and concise setting on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setIsPaidSubscriber(false)
        return
      }

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
      const paid =
        profile?.subscription_status === 'active' &&
        (profile?.subscription_tier === 'basic' || profile?.subscription_tier === 'reflect_plus')

      setIsPaidSubscriber(paid)
      setIsReflectPlus(
        profile?.subscription_status === 'active' &&
        profile?.subscription_tier === 'reflect_plus',
      )

      const globalConcise = settingsRes.data?.concise_answers ?? false
      setConciseMode(globalConcise)
      setConciseThisOne(globalConcise)   // per-interpretation starts at the global default
    })
  }, [])

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    )
  }

  async function handleSubmit() {
    if (!text.trim() || loading) return

    // Free-tier gate — skipped entirely for confirmed paid subscribers.
    // isPaidSubscriber === null means the Supabase check is still in flight;
    // we give the benefit of the doubt and let the server enforce the limit.
    if (isPaidSubscriber !== true && getMonthlyUsage() >= FREE_MONTHLY_LIMIT) {
      setShowGate(true)
      return
    }

    setLoading(true)
    setError(null)
    cancelledRef.current = false

    // 9-second UI timeout
    timerRef.current = setTimeout(() => {
      cancelledRef.current = true
      timerRef.current = null
      setLoading(false)
      setError(
        'The interpretation is taking longer than expected. Please check your internet connection and try again.',
      )
    }, UI_TIMEOUT)

    try {
      const res = await fetch('/api/interpret', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type,
          text:    text.trim(),
          tags:    selectedTags,
          concise: isReflectPlus && conciseThisOne ? true : undefined,
        }),
      })

      // If the 9s timeout already fired, silently discard this result
      if (cancelledRef.current) return

      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "We couldn't get an interpretation.")
      }

      // Save locally (all tiers)
      const id: string = Date.now().toString()
      const interp: Interpretation = {
        id,
        date:   new Date(),
        type,
        input:  text.trim(),
        tags:   selectedTags,
        lens:   'none',
        result: data.result,
      }
      saveInterpretation(interp)
      incrementMonthlyUsage()

      // Cloud save for Reflect+ (fire-and-forget — don't block navigation)
      // keepalive: true ensures the request survives the router.push() navigation
      // that follows immediately. Without it the browser can cancel the fetch.
      console.log('[compose] isReflectPlus:', isReflectPlus, '— attempting cloud save for id:', id)
      if (isReflectPlus) {
        fetch('/api/save-interpretation', {
          method:    'POST',
          headers:   { 'Content-Type': 'application/json' },
          keepalive: true,
          body:      JSON.stringify({
            id,
            type,
            input:  text.trim(),
            tags:   selectedTags,
            lens:   'none',
            result: data.result,
          }),
        })
          .then(r => {
            if (!r.ok) console.error('[compose] save-interpretation responded with status', r.status)
            else console.log('[compose] cloud save succeeded for id:', id)
          })
          .catch(err => console.error('[compose] save-interpretation fetch error:', err))
      }

      router.push(`/result?id=${id}`)
    } catch (err) {
      if (cancelledRef.current) return
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setLoading(false)
      setError(err instanceof Error ? err.message : "We couldn't get an interpretation.")
    }
  }

  // ── Gate screen ─────────────────────────────────────────────────────────────
  if (showGate) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>
        <div className="card-primary" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 12 }}>
            You&apos;ve used your 3 free interpretations this month
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
            Upgrade to keep interpreting—and unlock cloud history, symbol tracking, and more.
          </p>

          <CheckoutButton
            priceKey="basic_monthly"
            source="gate"
            returnPath="/compose/dream"
            className="btn-secondary"
            style={{ marginBottom: 10, textAlign: 'left', paddingTop: 14, paddingBottom: 14 }}
          >
            <span style={{ display: 'block', fontWeight: 700 }}>Upgrade to Basic</span>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 400, opacity: 0.85, marginTop: 2 }}>
              $0.99 first month, then $2.99/month
            </span>
          </CheckoutButton>

          <CheckoutButton
            priceKey="reflect_plus_monthly"
            source="gate"
            returnPath="/compose/dream"
            className="btn-primary"
            style={{ marginBottom: 20, textAlign: 'left', paddingTop: 14, paddingBottom: 14 }}
          >
            <span style={{ display: 'block', fontWeight: 700 }}>Upgrade to Reflect+</span>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 400, opacity: 0.85, marginTop: 2 }}>
              $0.99 first month, then $4.99/month
            </span>
          </CheckoutButton>

          <p className="text-caption" style={{ color: 'var(--owl-brown)', marginBottom: 20 }}>
            Intro offer. Auto-renews at regular price after 30 days. Cancel anytime.
          </p>

          <button
            className="btn-secondary"
            style={{ background: 'transparent', color: 'var(--owl-brown)', boxShadow: 'none', marginBottom: 20 }}
            onClick={() => setShowGate(false)}
          >
            Maybe Later
          </button>

          <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 16 }}>
            <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
              Already a subscriber?{' '}
              <Link href="/auth/sign-in" style={{ color: 'var(--cedar)', fontWeight: 600 }}>
                Sign in to restore access.
              </Link>
            </p>
          </div>
        </div>
      </main>
    )
  }

  // ── Compose form ─────────────────────────────────────────────────────────────
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <Link
          href="/"
          aria-label="Back"
          style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none', lineHeight: 1 }}
        >
          ←
        </Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>
          {icon} {title}
        </h1>
      </header>

      {/* Hint */}
      <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>
        {hint}
      </p>

      {/* Textarea */}
      <div style={{ marginBottom: 16 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder={placeholder}
          disabled={loading}
          rows={6}
          style={{
            width:      '100%',
            padding:    '14px 16px',
            borderRadius: 'var(--radius-m)',
            border:     '1px solid var(--stroke-soft)',
            background: 'var(--bone)',
            color:      'var(--ink)',
            fontSize:   16,
            lineHeight: '22px',
            resize:     'vertical',
            fontFamily: 'inherit',
            boxSizing:  'border-box',
          }}
        />
        <p
          className="text-caption"
          style={{
            textAlign: 'right',
            marginTop: 4,
            color: text.length > MAX_CHARS - 100 ? 'var(--cedar)' : 'var(--owl-brown)',
          }}
        >
          {text.length}/{MAX_CHARS}
        </p>
      </div>

      {/* Tag chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`tag-chip${selectedTags.includes(tag) ? ' selected' : ''}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Concise toggle — Reflect+ only */}
      {isReflectPlus && (
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
            gap:          12,
            marginBottom: 24,
            padding:      '10px 14px',
            borderRadius: 'var(--radius-s)',
            background:   'var(--sand)',
            border:       '1px solid var(--stroke-soft)',
          }}
        >
          <div>
            <p className="text-helper" style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 1 }}>
              Concise answer
            </p>
            <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
              Get a shorter interpretation for this one
            </p>
          </div>
          <button
            onClick={() => setConciseThisOne(v => !v)}
            disabled={loading}
            aria-label="Toggle concise answer"
            style={{
              width:        44,
              height:       26,
              borderRadius: 13,
              border:       'none',
              background:   conciseThisOne ? 'var(--sage)' : 'var(--stroke-soft)',
              cursor:       loading ? 'not-allowed' : 'pointer',
              position:     'relative',
              transition:   'background 0.2s ease',
              flexShrink:   0,
            }}
          >
            <span
              style={{
                position:     'absolute',
                top:          3,
                left:         conciseThisOne ? 21 : 3,
                width:        20,
                height:       20,
                borderRadius: '50%',
                background:   'white',
                boxShadow:    '0 1px 3px rgba(0,0,0,0.2)',
                transition:   'left 0.2s ease',
              }}
            />
          </button>
        </div>
      )}

      {/* Loading card */}
      {loading && (
        <div className="card-secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p className="text-body" style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>
            Working…
          </p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
            This usually takes a few seconds.
          </p>
        </div>
      )}

      {/* Error card */}
      {error && !loading && (
        <div className="card-secondary" style={{ marginBottom: 24 }}>
          <p className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 8 }}>
            We couldn&apos;t get an interpretation.
          </p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            {error}
          </p>
          <button className="btn-secondary" onClick={() => setError(null)}>
            Try Again
          </button>
        </div>
      )}

      {/* Submit */}
      {!loading && (
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!text.trim()}
        >
          Interpret {type === 'dream' ? 'Dream' : 'Omen'}
        </button>
      )}
    </main>
  )
}
