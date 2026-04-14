import Link from 'next/link'
import PageFooter from '@/app/components/PageFooter'

export const metadata = { title: 'Pricing — Dreams & Omens' }

const FEATURES_FREE    = ['3 interpretations/month', 'Dream & omen interpretation', 'Perspective lenses (Archetypal, Cognitive, Cultural)', 'Local history on your device', 'No account or sign-up required']
const FEATURES_BASIC   = ['Unlimited interpretations', 'Dream & omen interpretation', 'Perspective lenses on every reading', 'No monthly limit']
const FEATURES_REFLECT = ['Everything in Basic', 'Cloud-saved history across devices', 'Symbol tracking & pattern dashboard', 'Concise answers mode', 'Subscriber-only PDF guides', 'Early access to new features']

export default function PricingPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Pricing</h1>
      </header>

      {/* Intro offer callout */}
      <div
        className="card-secondary"
        style={{ textAlign: 'center', marginBottom: 24, borderColor: 'var(--sage)', borderWidth: 2 }}
      >
        <p className="text-title-m" style={{ color: 'var(--moss)', marginBottom: 4 }}>🎉 Limited intro offer</p>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
          Start any paid plan for <strong style={{ color: 'var(--ink)' }}>$0.99 your first month</strong>.
          Auto-renews at regular price after 30 days. Cancel anytime.
        </p>
      </div>

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
                $0.99 first month
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
          <Link href="/auth/sign-up" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary">Get Basic</button>
          </Link>
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
                $0.99 first month
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
          <Link href="/auth/sign-up" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Get Reflect+</button>
          </Link>
        </div>

      </div>

      {/* Fine print */}
      <p className="text-caption" style={{ color: 'var(--owl-brown)', textAlign: 'center', marginBottom: 8 }}>
        Intro offer applies to first billing period only. Subscriptions auto-renew monthly.
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
