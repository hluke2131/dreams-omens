/**
 * Paywall — Route: /paywall
 *
 * Presents Basic ($2.99/mo) and Reflect+ ($4.99/mo) plans.
 * On subscribe, calls POST /api/stripe/create-checkout.
 * Stub — full UI in next session.
 */
export default function PaywallPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>
      <h1 className="text-title-l" style={{ color: 'var(--ink)', marginBottom: 8 }}>
        Reflect+ unlocks it all
      </h1>
      <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Get the full experience without limits
      </p>

      {/* Plan stubs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card-secondary">
          <p className="text-title-m" style={{ color: 'var(--ink)' }}>Basic — $2.99/month</p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
            Unlimited interpretations, no ads
          </p>
        </div>
        <div className="card-secondary" style={{ borderColor: 'var(--sage)' }}>
          <span className="text-caption" style={{ background: 'var(--sage)', color: 'white', padding: '2px 8px', borderRadius: 8 }}>
            Best Value
          </span>
          <p className="text-title-m" style={{ color: 'var(--ink)', marginTop: 8 }}>Reflect+ — $4.99/month</p>
          <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
            Unlimited + cloud history + symbol tracking
          </p>
        </div>
      </div>

      <p className="text-caption" style={{ color: 'var(--owl-brown)', marginTop: 20, textAlign: 'center' }}>
        [Stub] Full paywall UI coming soon.
      </p>
    </main>
  )
}
