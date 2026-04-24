import Link from 'next/link'
import EmailCaptureInline from './EmailCaptureInline'

export default function OmenCtaBlock() {
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
        Want a personalized take on your sign?
      </h3>
      <p className="text-body" style={{ color: 'var(--text-secondary)', lineHeight: '26px', marginBottom: 20 }}>
        Generic interpretations miss the context that makes a sign meaningful. We ask about yours first.
      </p>
      <Link href="/compose/omen" style={{ textDecoration: 'none' }}>
        <button className="btn-primary" style={{ maxWidth: 280, marginBottom: 16 }}>
          Interpret my omen →
        </button>
      </Link>
      <div>
        <EmailCaptureInline
          ctaText="Or grab the free Signs & Symbols Field Guide →"
          source="blog_omen_cta"
          pdfPath="/guides/Signs_and_Symbols_Field_Guide_v1.pdf"
        />
      </div>
    </div>
  )
}
