import Link from 'next/link'

export const metadata = { title: 'About — Dreams & Omens' }

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>About</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🦉</div>
          <h2 className="text-title-xl" style={{ color: 'var(--ink)', marginBottom: 8 }}>Dreams &amp; Omens</h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            AI-powered dream and omen interpretation. Anonymous, self-guided, and grounded.
          </p>
        </div>

        <div className="card-primary">
          <h3 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 10 }}>What we do</h3>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            Dreams &amp; Omens helps you explore the symbols in your dreams and everyday life.
            Enter what you experienced—a vivid dream, a strange coincidence, a recurring image—and
            receive a warm, grounded interpretation in seconds.
          </p>
        </div>

        <div className="card-primary">
          <h3 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 10 }}>Our approach</h3>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            We blend three traditions: <strong style={{ color: 'var(--ink)' }}>psychology</strong> (Jungian archetypes,
            cognitive science of dreaming), <strong style={{ color: 'var(--ink)' }}>pattern recognition</strong>
            {' '}(recurring symbols and their meanings across cultures), and{' '}
            <strong style={{ color: 'var(--ink)' }}>timeless symbolism</strong> (folklore, mythology, and
            cross-cultural dream wisdom). There&apos;s no fortune-telling here—just thoughtful reflection.
          </p>
        </div>

        <div className="card-primary">
          <h3 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 10 }}>Anonymous &amp; private</h3>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            No account is required to get started. Free interpretations are processed in real time and
            stored only on your device. We never sell your data. If you choose to create an account,
            your history is encrypted in transit and stored securely via Supabase.
          </p>
        </div>

        <div className="card-secondary">
          <p className="text-helper" style={{ color: 'var(--owl-brown)' }}>
            <strong>Disclaimer:</strong> Dreams &amp; Omens is for entertainment and personal reflection
            only. Interpretations are AI-generated and do not constitute medical, psychological,
            legal, or financial advice. If you are experiencing distress, please seek help from a
            qualified professional.
          </p>
        </div>

      </div>

      <footer style={{ textAlign: 'center', marginTop: 40 }}>
        <p className="text-caption" style={{ color: 'var(--owl-brown)', marginBottom: 4 }}>
          © 2026 - DreamsAndOmens.com - All Rights Reserved
        </p>
        <p className="text-caption" style={{ color: 'var(--owl-brown)' }}>
          For entertainment purposes only. Not a substitute for professional advice.
        </p>
      </footer>

    </main>
  )
}
