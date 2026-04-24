import Link from 'next/link'

export default function PracticeCtaBlock() {
  return (
    <div
      style={{
        background:   'linear-gradient(135deg, var(--sand) 0%, var(--bone) 100%)',
        borderRadius: 'var(--radius-l)',
        border:       '1px solid var(--stroke-soft)',
        padding:      28,
        margin:       '32px 0',
      }}
    >
      <h3 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 8 }}>
        Ready to try an interpretation?
      </h3>
      <p className="text-body" style={{ color: 'var(--text-secondary)', lineHeight: '26px', marginBottom: 20 }}>
        Three free interpretations a month, no account required. See what it feels like to
        get a reading that&apos;s actually about you.
      </p>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <button className="btn-primary" style={{ maxWidth: 280 }}>
          Try a free interpretation →
        </button>
      </Link>
    </div>
  )
}
