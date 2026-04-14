'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import CheckoutButton from '@/app/components/CheckoutButton'
import PageFooter from '@/app/components/PageFooter'
import type { User } from '@supabase/supabase-js'
import type { SubscriptionTier, ProfileRow } from '@/lib/types'
import { monthlyUsageKey } from '@/lib/types'

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free:         'Free',
  basic:        'Basic',
  reflect_plus: 'Reflect+',
}

function AccountContent() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const checkoutParam = searchParams.get('checkout')

  const [user,          setUser]          = useState<User | null>(null)
  const [profile,       setProfile]       = useState<ProfileRow | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError,   setPortalError]   = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/auth/sign-in')
        return
      }
      setUser(data.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      setProfile(profileData ?? null)
      setLoading(false)
    })
  }, [router])

  // Clear the localStorage monthly counter when landing from a successful checkout
  // so the compose page doesn't show a stale gate on the subscriber's next visit.
  useEffect(() => {
    if (checkoutParam === 'success') {
      localStorage.removeItem(monthlyUsageKey())
    }
  }, [checkoutParam])

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

  if (loading) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '60px auto' }} />
      </main>
    )
  }

  const initial      = user?.email?.[0]?.toUpperCase() ?? '?'
  const tier         = (profile?.subscription_tier as SubscriptionTier | null) ?? 'free'
  const isActive     = profile?.subscription_status === 'active'
  const isSubscribed = isActive && (tier === 'basic' || tier === 'reflect_plus')
  const periodEnd    = profile?.subscription_period_end
    ? new Date(profile.subscription_period_end).toLocaleDateString(undefined, {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" aria-label="Back" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>
          ←
        </Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>My Account</h1>
      </header>

      {/* Success banner */}
      {checkoutParam === 'success' && (
        <div
          className="card-secondary"
          style={{ marginBottom: 20, borderColor: 'var(--sage)', borderWidth: 2, textAlign: 'center' }}
        >
          <p className="text-body" style={{ color: 'var(--moss)', fontWeight: 600, marginBottom: 4 }}>
            Subscription activated!
          </p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
            Welcome to {TIER_LABELS[tier]}. Your access is now active.
          </p>
        </div>
      )}

      {/* Avatar + email */}
      <div className="card-primary" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div
          style={{
            width:          44,
            height:         44,
            borderRadius:   '50%',
            background:     'var(--cedar)',
            color:          'white',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       18,
            fontWeight:     700,
            flexShrink:     0,
          }}
        >
          {initial}
        </div>
        <div>
          <p className="text-body" style={{ color: 'var(--ink)', fontWeight: 600 }}>
            {user?.email}
          </p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
            Joined {new Date(user?.created_at ?? '').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Subscription card */}
      <div className="card-secondary" style={{ marginBottom: 20 }}>
        <p className="text-helper" style={{ color: 'var(--owl-brown)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.05em' }}>
          SUBSCRIPTION
        </p>

        {/* Current plan badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p className="text-title-m" style={{ color: 'var(--ink)' }}>
              {TIER_LABELS[tier]}
            </p>
            {isSubscribed && (
              <p className="text-helper" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                Status: active
              </p>
            )}
          </div>
          {isSubscribed && (
            <span
              style={{
                background:    tier === 'reflect_plus' ? 'var(--sage)' : 'var(--cedar)',
                color:         'white',
                fontSize:      11,
                fontWeight:    700,
                padding:       '4px 10px',
                borderRadius:  20,
                letterSpacing: '0.04em',
              }}
            >
              {tier === 'reflect_plus' ? 'REFLECT+' : 'BASIC'}
            </span>
          )}
        </div>

        {/* Next billing date */}
        {isSubscribed && periodEnd && (
          <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            Next billing date: <strong style={{ color: 'var(--ink)' }}>{periodEnd}</strong>
          </p>
        )}

        {/* Actions */}
        {isSubscribed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tier === 'basic' && (
              <CheckoutButton
                priceKey="reflect_plus_monthly"
                returnPath="/account"
                className="btn-primary"
              >
                Upgrade to Reflect+
              </CheckoutButton>
            )}
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="btn-secondary"
            >
              {portalLoading ? 'Opening portal…' : 'Manage Subscription'}
            </button>
            {portalError && (
              <p className="text-helper" style={{ color: 'var(--cedar)', textAlign: 'center' }}>{portalError}</p>
            )}
            <p className="text-caption" style={{ color: 'var(--owl-brown)', textAlign: 'center' }}>
              Upgrade, downgrade, or cancel anytime via the Stripe portal.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
              You&apos;re on the Free plan — 3 interpretations per month.
            </p>
            <Link href="/paywall" style={{ textDecoration: 'none' }}>
              <button className="btn-primary">
                Upgrade — from $0.99/month
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="btn-secondary"
        style={{ background: 'transparent', color: 'var(--cedar)', border: '1px solid var(--cedar)', boxShadow: 'none' }}
      >
        Sign out
      </button>

      <footer style={{ textAlign: 'center', marginTop: 40 }}>
        <PageFooter />
      </footer>

    </main>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '60px auto' }} />
      </main>
    }>
      <AccountContent />
    </Suspense>
  )
}
