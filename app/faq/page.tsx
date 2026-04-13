import Link from 'next/link'

export const metadata = { title: 'FAQ — Dreams & Omens' }

const FAQS = [
  {
    q: 'What is Dreams & Omens?',
    a: 'Dreams & Omens is an AI-powered interpretation tool for your dreams, recurring symbols, and everyday signs. You describe what you experienced, and the app provides a warm, grounded interpretation that blends psychology, pattern recognition, and timeless symbolism.',
  },
  {
    q: 'How does the AI interpretation work?',
    a: 'Your description is sent securely to an AI model (GPT-4o mini) with a carefully crafted system prompt focused on practical, warm interpretations. The AI is instructed to avoid medical, legal, or financial advice and to keep responses grounded. Your text is never stored on our servers beyond the request itself.',
  },
  {
    q: 'How many free interpretations do I get?',
    a: 'The free tier includes 3 interpretations per calendar month. This counter resets automatically on the 1st of each month. Perspective lens re-interpretations (Archetypal, Cognitive, Cultural) count toward your monthly total.',
  },
  {
    q: 'What is the difference between a Dream and an Omen interpretation?',
    a: 'Dream interpretation focuses on sleep experiences—symbols, emotions, characters, and narratives from your subconscious. Omen interpretation focuses on waking-life events—coincidences, signs, animal encounters, or patterns you notice in everyday life. The AI uses different prompting approaches for each.',
  },
  {
    q: 'What are the perspective lenses (Archetypal, Cognitive, Cultural)?',
    a: 'Each lens re-interprets your original input through a specific framework. Archetypal explores universal symbols and Jungian archetypes (Shadow, Anima/Animus, Hero). Cognitive examines what your brain might be processing from memory, emotion, or stress. Cultural considers symbolism rooted in mythology, folklore, and cross-cultural traditions. Each lens is a separate AI call and produces a new result.',
  },
  {
    q: 'Is my data private?',
    a: 'Free-tier interpretations are processed in real time and never stored server-side. All local history is kept only on your device in browser localStorage. If you create an account, your cloud history is stored encrypted in transit via Supabase and is never sold or shared with third parties. See our Privacy Policy for full details.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. The free tier requires no account whatsoever. You can interpret dreams and omens anonymously and your local history is saved automatically on your device. An account is required for cloud sync and Reflect+ features.',
  },
  {
    q: 'What does a paid subscription include?',
    a: 'Basic ($2.99/month) removes the monthly interpretation limit and suppresses ads. Reflect+ ($4.99/month) includes everything in Basic plus cloud-saved history, AI symbol tracking across your interpretations, a concise answers mode, subscriber-only guides, and early access to new features. Both plans currently offer a $0.99 introductory first month.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can cancel anytime from the Settings screen → Manage Subscription. Your access continues until the end of your current billing period. We do not offer prorated refunds, but you will never be charged after cancellation.',
  },
  {
    q: 'Is this a substitute for therapy or professional advice?',
    a: 'No. Dreams & Omens is for personal reflection and entertainment only. Interpretations are AI-generated and are not a substitute for professional medical, psychological, legal, or financial advice. If you are in distress or experiencing symptoms that concern you, please seek help from a qualified professional.',
  },
]

export default function FaqPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>FAQ</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FAQS.map(({ q, a }, i) => (
          <div key={i} className="card-primary">
            <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 8 }}>{q}</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>{a}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          Still have questions?
        </p>
        <Link href="/contact" style={{ color: 'var(--cedar)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
          Contact us →
        </Link>
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
