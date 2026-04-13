import Link from 'next/link'

export const metadata = { title: '404 — Dreams & Omens' }

export default function NotFound() {
  return (
    <main
      style={{
        maxWidth:       480,
        margin:         '0 auto',
        padding:        '40px 24px',
        textAlign:      'center',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        minHeight:      '100dvh',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 72, marginBottom: 20 }}>🦉</div>

      <h1 className="text-title-xl" style={{ color: 'var(--ink)', marginBottom: 8 }}>
        Page not found
      </h1>

      <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 8, maxWidth: 320 }}>
        Even the owl couldn&apos;t find this one.
      </p>

      <p className="text-helper" style={{ color: 'var(--owl-brown)', marginBottom: 40, maxWidth: 300 }}>
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>

      <Link href="/" style={{ textDecoration: 'none', width: '100%', maxWidth: 320 }}>
        <button className="btn-primary">Back to Home</button>
      </Link>

      <div style={{ display: 'flex', gap: 20, marginTop: 28 }}>
        <Link href="/faq"     className="text-helper" style={{ color: 'var(--cedar)', textDecoration: 'none' }}>FAQ</Link>
        <Link href="/contact" className="text-helper" style={{ color: 'var(--cedar)', textDecoration: 'none' }}>Contact</Link>
        <Link href="/pricing" className="text-helper" style={{ color: 'var(--cedar)', textDecoration: 'none' }}>Pricing</Link>
      </div>
    </main>
  )
}
