import Link from 'next/link'

export const metadata = { title: 'Contact — Dreams & Omens' }

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Contact</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div className="card-primary" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>✉️</div>
          <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 8 }}>
            Get in touch
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            Have a question, feedback, or a bug to report? We&apos;d love to hear from you.
          </p>
          <a
            href="mailto:hello@dreamsandomens.com?subject=app%20support%20request"
            style={{ textDecoration: 'none' }}
          >
            <button className="btn-primary">
              hello@dreamsandomens.com
            </button>
          </a>
        </div>

        <div className="card-secondary">
          <h3 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 8 }}>Response time</h3>
          <p className="text-helper" style={{ color: 'var(--text-secondary)' }}>
            We typically respond within 1–2 business days. For subscription billing issues,
            please include your account email in your message.
          </p>
        </div>

        <div className="card-secondary">
          <h3 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 8 }}>Before you write</h3>
          <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>
            You may find a quick answer in our FAQ.
          </p>
          <Link href="/faq" style={{ color: 'var(--cedar)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
            Read the FAQ →
          </Link>
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
