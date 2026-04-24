import Link from 'next/link'
import EmailCaptureInline from './EmailCaptureInline'

export default function DreamCtaBlock() {
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
        Want a personalized take on your dream?
      </h3>
      <p className="text-body" style={{ color: 'var(--text-secondary)', lineHeight: '26px', marginBottom: 20 }}>
        Dream dictionaries give you generic answers. We ask about you first, then interpret.
      </p>
      <Link href="/compose/dream" style={{ textDecoration: 'none' }}>
        <button className="btn-primary" style={{ maxWidth: 280, marginBottom: 16 }}>
          Interpret my dream →
        </button>
      </Link>
      <div>
        <EmailCaptureInline
          ctaText="Or grab the free Dream Symbols 101 guide →"
          source="blog_dream_cta"
          pdfPath="/guides/Dream_Symbols_101_v1.pdf"
        />
      </div>
    </div>
  )
}
