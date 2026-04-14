/**
 * /pricing
 *
 * Server component — reads auth state to show current plan or checkout CTAs.
 * CheckoutButton is a client component imported for interactive subscribe actions.
 */

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CheckoutButton from '@/app/components/CheckoutButton'
import PageFooter from '@/app/components/PageFooter'
import type { SubscriptionTier } from '@/lib/types'

export const metadata = { title: 'Pricing — Dreams & Omens' }

const FEATURES_FREE    = ['3 interpretations/month', 'Dream & omen interpretation', 'Perspective lenses (Archetypal, Cognitive, Cultural)', 'Local history on your device', 'No account or sign-up required']
const FEATURES_BASIC   = ['Unlimited interpretations', 'Dream & omen interpretation', 'Perspective lenses on every reading', 'No monthly limit']
const FEATURES_REFLECT = ['Everything in Basic', 'Cloud-saved history across devices', 'Symbol tracking & pattern dashboard', 'Concise answers mode', 'Subscriber-only PDF guides', 'Early access to new features']

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free', basic: 'Basic', reflect_plus: 'Reflect+',
}

export default async function PricingPage() {
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

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Pricing</h1>
      </header>

      {/* Current plan banner for subscribers */}
      {isSubscribed && (
        <div
          className="card-secondary"
          style={{ textAlign: 'center', marginBottom: 24, borderColor: 'var(--sage)', borderWidth: 2 }}
        >
          <p className="text-body" style={{ color: 'var(--moss)', fontWeight: 600, marginBottom: 4 }}>
            You&apos;re on {TIER_LABELS[tier]}
          </p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/account" style={{ color: 'var(--cedar)', fontWeight: 600 }}>
              Manage subscription →
            </Link>
          </p>
        </div>
      )}

      {/* Intro offer callout (for non-subscribers) */}
      {!isSubscribed && (
        <div
          className="card-secondary"
          style={{ textAlign: 'center', marginBottom: 24, borderColor: 'var(--sage)', borderWidth: 2 }}
        >
          <p className="text-title-m" style={{ color: 'var(--moss)', marginBottom: 4 }}>Limited intro offer</p>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Start any paid plan for <strong style={{ color: 'var(--ink)' }}>$0.99/month for your first 2 months</strong>.
            Auto-renews at regular price. Cancel anytime.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>

        {/* Free tier */}
        <div className="card-primary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h2 className="text-title-m" style={{ color: 'var(--ink)' }}>Free</h2>
              <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>No account needed</p>
            </div>
            <span className="text-title-l" style={{ color: 'var(--ink)' }}>$0</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FEATURES_FREE.map(f => (
              <li key={f} className="text-helper" style={{ color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--sage)', flexShrink: 0 }}>✓</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary">Start for free</button>
          </Link>
        </div>

        {/* Basic tier */}
        <div className="card-primary">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h2 className="text-title-m" style={{ color: 'var(--ink)' }}>Basic</h2>
              <p className="text-helper" style={{ color: 'var(--sage)', fontWeight: 600 }}>
                $0.99 first 2 months
              </p>
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
              Included in your Reflect+ plan
            </p>
          ) : (
            <CheckoutButton priceKey="basic_monthly" returnPath="/pricing" className="btn-secondary">
              Get Basic — $0.99 for 2 months
            </CheckoutButton>
          )}
        </div>

        {/* Reflect+ tier */}
        <div
          className="card-primary"
          style={{ border: '2px solid var(--sage)', position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position:   'absolute',
              top:        14,
              right:      -28,
              background: 'var(--sage)',
              color:      'white',
              fontSize:   11,
              fontWeight: 700,
              padding:    '4px 36px',
              transform:  'rotate(45deg)',
              letterSpacing: '0.05em',
            }}
          >
            BEST VALUE
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h2 className="text-title-m" style={{ color: 'var(--ink)' }}>Reflect+</h2>
              <p className="text-helper" style={{ color: 'var(--sage)', fontWeight: 600 }}>
                $0.99 first 2 months
              </p>
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
            <CheckoutButton priceKey="reflect_plus_monthly" returnPath="/pricing" className="btn-primary">
              Get Reflect+ — $0.99 for 2 months
            </CheckoutButton>
          )}
        </div>

      </div>

      {/* Fine print */}
      <p className="text-caption" style={{ color: 'var(--owl-brown)', textAlign: 'center', marginBottom: 8 }}>
        Intro offer applies to first 2 billing months only. Subscriptions auto-renew monthly.
        Cancel anytime in Settings. No prorated refunds.
      </p>
      <p className="text-caption" style={{ color: 'var(--owl-brown)', textAlign: 'center', marginBottom: 32 }}>
        Questions?{' '}
        <Link href="/contact" style={{ color: 'var(--cedar)' }}>Contact us</Link>
        {' '}·{' '}
        <Link href="/faq" style={{ color: 'var(--cedar)' }}>FAQ</Link>
      </p>

      <footer style={{ textAlign: 'center' }}>
        <PageFooter />
      </footer>

    </main>
  )
}
