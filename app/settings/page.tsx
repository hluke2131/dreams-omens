'use client'

/**
 * Settings — Route: /settings
 *
 * Subscription management, preferences, info links.
 * All logged-in users can access. Concise answers toggle is Reflect+ only.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PageFooter from '@/app/components/PageFooter'
import type { User } from '@supabase/supabase-js'
import type { SubscriptionTier, ProfileRow } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()

  const [user,             setUser]             = useState<User | null>(null)
  const [profile,          setProfile]          = useState<ProfileRow | null>(null)
  const [conciseMode,      setConciseMode]      = useState(false)
  const [conciseSaving,    setConciseSaving]    = useState(false)
  const [loading,          setLoading]          = useState(true)
  const [portalLoading,    setPortalLoading]    = useState(false)
  const [portalError,      setPortalError]      = useState<string | null>(null)
  const [privacyOpen,      setPrivacyOpen]      = useState(false)
  const [settingsUserId,   setSettingsUserId]   = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/auth/sign-in')
        return
      }
      setUser(data.user)
      setSettingsUserId(data.user.id)

      const [profileRes, settingsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single(),
        supabase
          .from('user_settings')
          .select('concise_answers')
          .eq('user_id', data.user.id)
          .maybeSingle(),
      ])

      setProfile(profileRes.data ?? null)
      setConciseMode(settingsRes.data?.concise_answers ?? false)
      setLoading(false)
    })
  }, [router])

  const tier         = (profile?.subscription_tier as SubscriptionTier | null) ?? 'free'
  const isActive     = profile?.subscription_status === 'active'
  const isSubscribed = isActive && (tier === 'basic' || tier === 'reflect_plus')
  const isReflectPlus = isActive && tier === 'reflect_plus'

  async function handleConciseToggle() {
    if (!isReflectPlus || conciseSaving || !settingsUserId) return
    const next = !conciseMode

    setConciseMode(next)
    setConciseSaving(true)

    const supabase = createClient()
    // Upsert user_settings row
    await supabase
      .from('user_settings')
      .upsert({ user_id: settingsUserId, concise_answers: next })

    setConciseSaving(false)
  }

  async function handleManageSubscription() {
    if (portalLoading) return
    setPortalLoading(true)
    setPortalError(null)

    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setPortalError(data.error ?? 'Could not open portal. Please try again.')
        setPortalLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setPortalError('Something went wrong. Please try again.')
      setPortalLoading(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '60px auto' }} />
      </main>
    )
  }

  // ── Not signed in (edge case) ────────────────────────────────────────────────
  if (!user) return null

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" aria-label="Back" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Settings</h1>
      </header>

      {/* ── Subscription ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 24 }}>
        <p className="text-caption" style={{ color: 'var(--owl-brown)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Subscription
        </p>
        <div className="card-secondary">
          {isSubscribed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p className="text-body" style={{ color: 'var(--ink)', fontWeight: 600 }}>
                  {tier === 'reflect_plus' ? 'Reflect+' : 'Basic'} Active
                </p>
                <span
                  style={{
                    background:    isReflectPlus ? 'var(--sage)' : 'var(--cedar)',
                    color:         'white',
                    fontSize:      10,
                    fontWeight:    700,
                    padding:       '3px 10px',
                    borderRadius:  20,
                    letterSpacing: '0.04em',
                  }}
                >
                  {isReflectPlus ? 'REFLECT+' : 'BASIC'}
                </span>
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                style={{
                  background:   'none',
                  border:       '1px solid var(--stroke-soft)',
                  borderRadius: 'var(--radius-s)',
                  padding:      '9px 16px',
                  width:        '100%',
                  fontSize:     14,
                  fontWeight:   600,
                  color:        'var(--cedar)',
                  cursor:       'pointer',
                  fontFamily:   'inherit',
                }}
              >
                {portalLoading ? 'Opening…' : 'Manage Subscription'}
              </button>
              {portalError && (
                <p className="text-caption" style={{ color: 'var(--cedar)', marginTop: 8 }}>{portalError}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
                You&apos;re on the Free plan — 3 interpretations per month.
              </p>
              <Link href="/paywall" style={{ textDecoration: 'none' }}>
                <button className="btn-primary">Upgrade — from $0.99/month</button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Preferences ───────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 24 }}>
        <p className="text-caption" style={{ color: 'var(--owl-brown)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Preferences
        </p>
        <div className="card-secondary">
          {/* Concise answers toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <p className="text-helper" style={{ color: 'var(--ink)', fontWeight: 600 }}>
                  Always give concise answers
                </p>
                {!isReflectPlus && (
                  <span style={{ fontSize: 13 }} title="Reflect+ only">🔒</span>
                )}
              </div>
              <p className="text-caption" style={{ color: 'var(--text-secondary)', lineHeight: '16px' }}>
                When enabled, all your interpretations will default to shorter responses. You can still override this per interpretation on the compose screen.
              </p>
            </div>
            {isReflectPlus ? (
              <button
                onClick={handleConciseToggle}
                disabled={conciseSaving}
                aria-label="Toggle concise answers"
                style={{
                  width:        48,
                  height:       28,
                  borderRadius: 14,
                  border:       'none',
                  background:   conciseMode ? 'var(--sage)' : 'var(--stroke-soft)',
                  cursor:       conciseSaving ? 'not-allowed' : 'pointer',
                  position:     'relative',
                  transition:   'background 0.2s ease',
                  flexShrink:   0,
                }}
              >
                <span
                  style={{
                    position:   'absolute',
                    top:        3,
                    left:       conciseMode ? 23 : 3,
                    width:      22,
                    height:     22,
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow:  '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s ease',
                  }}
                />
              </button>
            ) : (
              <Link href="/paywall" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    width:        48,
                    height:       28,
                    borderRadius: 14,
                    border:       'none',
                    background:   'var(--stroke-soft)',
                    cursor:       'pointer',
                    position:     'relative',
                    flexShrink:   0,
                  }}
                >
                  <span
                    style={{
                      position:   'absolute',
                      top:        3,
                      left:       3,
                      width:      22,
                      height:     22,
                      borderRadius: '50%',
                      background: 'white',
                      boxShadow:  '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Account ───────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 24 }}>
        <p className="text-caption" style={{ color: 'var(--owl-brown)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Account
        </p>
        <div className="card-secondary" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p className="text-caption" style={{ color: 'var(--owl-brown)', marginBottom: 2 }}>Email</p>
            <p className="text-helper" style={{ color: 'var(--ink)', fontWeight: 600 }}>{user.email}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 12 }}>
            <Link href="/auth/reset-password" style={{ textDecoration: 'none' }}>
              <p className="text-helper" style={{ color: 'var(--cedar)', fontWeight: 600 }}>
                Change password →
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Information ───────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: 24 }}>
        <p className="text-caption" style={{ color: 'var(--owl-brown)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Information
        </p>
        <div className="card-secondary" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Privacy & Disclaimers */}
          <button
            onClick={() => setPrivacyOpen(o => !o)}
            style={{
              width:      '100%',
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              textAlign:  'left',
              padding:    '14px 20px',
              fontFamily: 'inherit',
              display:    'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p className="text-helper" style={{ color: 'var(--ink)', fontWeight: 600 }}>Privacy &amp; Disclaimers</p>
            <span style={{ color: 'var(--owl-brown)', fontSize: 11 }}>{privacyOpen ? '▲' : '▼'}</span>
          </button>

          {privacyOpen && (
            <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--divider)' }}>
              <p className="text-caption" style={{ color: 'var(--text-secondary)', lineHeight: '18px', marginTop: 12 }}>
                Dreams &amp; Omens provides interpretations for reflective and entertainment purposes only. Nothing here constitutes medical, psychological, legal, or financial advice. All content is AI-generated and should not be relied upon as a substitute for professional guidance. By using this app you agree to our{' '}
                <Link href="/terms" style={{ color: 'var(--cedar)' }}>Terms of Service</Link>{' '}and{' '}
                <Link href="/privacy" style={{ color: 'var(--cedar)' }}>Privacy Policy</Link>.
              </p>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--divider)', padding: '14px 20px' }}>
            <a
              href="mailto:hello@dreamsandomens.com?subject=app%20support%20request"
              style={{ textDecoration: 'none' }}
            >
              <p className="text-helper" style={{ color: 'var(--cedar)', fontWeight: 600 }}>
                Contact Support →
              </p>
            </a>
          </div>

        </div>
      </section>

      {/* ── Sign out ──────────────────────────────────────────────────────────── */}
      <button
        onClick={handleSignOut}
        style={{
          width:      '100%',
          background: 'transparent',
          border:     '1px solid var(--cedar)',
          borderRadius: 'var(--radius-m)',
          padding:    '14px 28px',
          fontSize:   16,
          fontWeight: 600,
          color:      'var(--cedar)',
          cursor:     'pointer',
          fontFamily: 'inherit',
          marginBottom: 32,
        }}
      >
        Sign out
      </button>

      <footer style={{ textAlign: 'center' }}>
        <PageFooter />
      </footer>

    </main>
  )
}
