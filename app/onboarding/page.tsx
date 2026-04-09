/**
 * Onboarding — Route: /onboarding
 *
 * Shown on first launch before redirecting to Home.
 * Sets 'hasOnboarded' in localStorage on completion.
 * Stub — full UI in next session.
 */
export default function OnboardingPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🦉</div>
      <h1 className="text-title-xl" style={{ color: 'var(--ink)', marginBottom: 12 }}>
        Welcome to Dreams &amp; Omens
      </h1>
      <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
        Anonymous and self-guided. Explore the symbols in your dreams and everyday life.
      </p>
      <p className="text-caption" style={{ color: 'var(--owl-brown)' }}>
        [Stub] Onboarding flow coming soon.
      </p>
    </main>
  )
}
