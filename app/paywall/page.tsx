/**
 * /paywall
 *
 * Full paywall UI with feature checklist and Stripe Checkout buttons.
 * Reads auth state server-side so subscribed users see their current plan.
 */

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CheckoutButton from '@/app/components/CheckoutButton'
import PageFooter from '@/app/components/PageFooter'
import type { SubscriptionTier } from '@/lib/types'

export const metadata = { title: 'Upgrade — Dreams & Omens' }

const FEATURES_CHECKLIST = [
  'No ads — ever',
  'Save & revisit interpretations',
  'Track recurring symbols & themes',
  'Bonus dream & archetype guides',
  'Early access to new features',
]

const FEATURES_BASIC = [
  'Unlimited interpretations',
  'No monthly limit',
  'No ads',
]

const FEATURES_REFLECT = [
  'Everything in Basic',
  'Cloud-saved history across devices',
  'Track recurring symbols & patterns',
  'Concise answers mode',
  'Subscriber-only PDF guides',
  'Early access features',
]

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free:         'Free',
  basic:        'Basic',
  reflect_plus: 'Reflect+',
}

export default async function PaywallPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let tier: SubscriptionTier = 'free'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()
    if (profile?.subscription_status === 'active') {
      tier = (profile.subscription_tier as SubscriptionTier) ?? 'free'
    }
  }

  const isSubscribed = tier === 'basic' || tier === 'reflect_plus'

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <Link href="/" aria-label="Back" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>
          ←
        </Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Upgrade</h1>
      </header>

      {/* Hero copy */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p className="text-title-xl" style={{ color: 'var(--ink)', marginBottom: 8 }}>
          Reflect+ unlocks it all
        </p>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Get the full experience without limits
        </p>
      </div>

      {/* Feature checklist */}
      <div className="card-secondary" style={{ marginBottom: 24 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FEATURES_CHECKLIST.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width:          22,
                  height:         22,
                  borderRadius:   '50%',
                  background:     'var(--sage)',
                  color:          'white',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       12,
                  fontWeight:     700,
                  flexShrink:     0,
                }}
              >
                ✓
              </span>
              <span className="text-body" style={{ color: 'var(--ink)' }}>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Intro offer banner */}
      <div
        className="card-secondary"
        style={{ textAlign: 'center', marginBottom: 20, borderColor: 'var(--sage)', borderWidth: 2 }}
      >
        <p className="text-title-m" style={{ color: 'var(--moss)', marginBottom: 4 }}>Limited intro offer</p>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Start any plan for <strong style={{ color: 'var(--ink)' }}>$0.99/month for 2 months</strong>,
          then auto-renews at regular price.
        </p>
      </div>

      {/* Already subscribed — show current plan */}
      {isSubscribed && (
        <div
          className="card-secondary"
          style={{ textAlign: 'center', marginBottom: 20, borderColor: 'var(--sage)', borderWidth: 2 }}
        >
          <p className="text-body" style={{ color: 'var(--ink)', fontWeight: 600 }}>
            You&apos;re on {TIER_LABELS[tier]}
          </p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            <Link href="/account" style={{ color: 'var(--cedar)', fontWeight: 600 }}>
              Manage your subscription →
            </Link>
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>

        {/* Basic */}
        <div className="card-primary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h2 className="text-title-m" style={{ color: 'var(--ink)' }}>Basic</h2>
              <p className="text-helper" style={{ color: 'var(--sage)', fontWeight: 600 }}>$0.99 first 2 months</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="text-title-l" style={{ color: 'var(--ink)' }}>$2.99</span>
              <span className="text-helper" style={{ color: 'var(--text-secondary)' }}>/mo</span>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FEATURES_BASIC.map(f => (
              <li key={f} className="text-helper" style={{ color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--sage)', flexShrink: 0 }}>✓</span>{f}
              </li>
            ))}
          </ul>
          {tier === 'basic' ? (
            <p className="text-helper" style={{ color: 'var(--sage)', fontWeight: 600, textAlign: 'center' }}>
              ✓ Current plan
            </p>
          ) : tier === 'reflect_plus' ? (
            <p className="text-helper" style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
              Included in Reflect+
            </p>
          ) : (
            <CheckoutButton priceKey="basic_monthly" returnPath="/paywall" className="btn-secondary">
              Get Basic — $0.99 first 2 months
            </CheckoutButton>
          )}
        </div>

        {/* Reflect+ */}
        <div
          className="card-primary"
          style={{ border: '2px solid var(--sage)', position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position:      'absolute',
              top:           14,
              right:         -28,
              background:    'var(--sage)',
              color:         'white',
              fontSize:      11,
              fontWeight:    700,
              padding:       '4px 36px',
              transform:     'rotate(45deg)',
              letterSpacing: '0.05em',
            }}
          >
            BEST VALUE
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h2 className="text-title-m" style={{ color: 'var(--ink)' }}>Reflect+</h2>
              <p className="text-helper" style={{ color: 'var(--sage)', fontWeight: 600 }}>$0.99 first 2 months</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="text-title-l" style={{ color: 'var(--ink)' }}>$4.99</span>
              <span className="text-helper" style={{ color: 'var(--text-secondary)' }}>/mo</span>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FEATURES_REFLECT.map(f => (
              <li key={f} className="text-helper" style={{ color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--sage)', flexShrink: 0 }}>✓</span>{f}
              </li>
            ))}
          </ul>
          {tier === 'reflect_plus' ? (
            <p className="text-helper" style={{ color: 'var(--sage)', fontWeight: 600, textAlign: 'center' }}>
              ✓ Current plan
            </p>
          ) : (
            <CheckoutButton priceKey="reflect_plus_monthly" returnPath="/paywall" className="btn-primary">
              Get Reflect+ — $0.99 first 2 months
            </CheckoutButton>
          )}
        </div>

      </div>

      {/* Footer links */}
      <p className="text-caption" style={{ color: 'var(--owl-brown)', textAlign: 'center', marginBottom: 8 }}>
        Intro offer applies to first 2 billing months only. Subscriptions auto-renew monthly.
        Cancel anytime. No prorated refunds.
      </p>
      <p className="text-caption" style={{ color: 'var(--owl-brown)', textAlign: 'center', marginBottom: 24 }}>
        <Link href="/" style={{ color: 'var(--cedar)' }}>Maybe later</Link>
        {' '}·{' '}
        <Link href="/faq" style={{ color: 'var(--cedar)' }}>FAQ</Link>
        {' '}·{' '}
        <Link href="/contact" style={{ color: 'var(--cedar)' }}>Support</Link>
      </p>

      <footer style={{ textAlign: 'center' }}>
        <PageFooter />
      </footer>

    </main>
  )
}
