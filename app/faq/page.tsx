import Link from 'next/link'
import FaqAccordion, { type FaqItem } from '@/app/components/FaqAccordion'
import PageFooter from '@/app/components/PageFooter'

export const metadata = { title: 'FAQ — Dreams & Omens' }

const FAQS: FaqItem[] = [
  {
    q: 'What is Dreams & Omens?',
    a: 'Dreams & Omens is a personal reflection tool for your dreams, recurring symbols, and everyday signs. You describe what you experienced, and we deliver a warm, grounded interpretation—drawing from psychology, cross-cultural symbolism, and pattern recognition. Think of it as a thoughtful companion for exploring what your inner world might be telling you.',
  },
  {
    q: 'How does interpretation work?',
    a: 'When you submit a dream or omen, we analyze it using a carefully built interpretation system focused on symbolic meaning, psychological frameworks, and cultural traditions. Responses are designed to be warm and practical—never diagnostic. Your text is processed in real time and not retained on our servers once your interpretation is delivered.',
  },
  {
    q: 'How many free interpretations do I get?',
    a: 'The free tier includes 3 interpretations per calendar month. This resets automatically at the start of each new month. Perspective lens re-interpretations (Archetypal, Cognitive, Cultural) each count as one interpretation toward your monthly total.',
  },
  {
    q: 'What is the difference between a Dream and an Omen interpretation?',
    a: 'Dream interpretation focuses on sleep experiences—the symbols, emotions, characters, and narratives that arose while you were asleep. Omen interpretation focuses on waking-life moments—coincidences, animals, numbers, or recurring patterns you notice in everyday life. We approach each type a little differently to draw out what\'s most meaningful.',
  },
  {
    q: 'What are the perspective lenses (Archetypal, Cognitive, Cultural)?',
    a: 'Lenses let you re-read your dream or omen through a different angle of meaning. Archetypal explores universal symbols and the classic story figures that appear across human history—Shadow, Anima/Animus, Hero. Cognitive looks at what your mind might be working through: memories, emotions, or everyday stress. Cultural draws on mythology, folklore, and traditions from around the world. Each lens produces a completely fresh interpretation of your original entry.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Free-tier interpretations are processed in real time and nothing is saved on our servers once your reading is delivered. Your interpretation history lives only on your own device. If you create an account, your cloud history is stored securely and is never sold or shared with third parties. See our Privacy Policy for full details.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. You can start interpreting right now, completely anonymously. Your history is saved automatically on your device. An account is only needed if you want history saved across devices or access to Reflect+ features.',
  },
  {
    q: 'What does a paid subscription include?',
    a: 'Basic ($2.99/month) removes the monthly interpretation limit and unlocks perspective lenses on every reading. Reflect+ ($4.99/month) includes everything in Basic, plus cloud-saved history across devices, symbol tracking that spots recurring themes over time, a concise answers mode for shorter readings, subscriber-only guides, and early access to new features. Both plans start at $0.99 for your first month.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: "You can cancel anytime from Settings → Manage Subscription. Your access continues through the end of your current billing period. You won't be charged again after you cancel, and we don't offer prorated refunds for partial months.",
  },
  {
    q: 'Is this a substitute for therapy or professional advice?',
    a: "No—and we want to be clear about that. Dreams & Omens is for personal reflection and entertainment only. Nothing here constitutes medical, psychological, legal, or financial advice. If you're going through a difficult time or have concerns about your mental health, please reach out to a qualified professional. This app is a starting point for curiosity, not a replacement for real support.",
  },
]

export default function FaqPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>FAQ</h1>
      </header>

      <FaqAccordion items={FAQS} />

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <p className="text-helper" style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          Still have questions?
        </p>
        <Link href="/contact" style={{ color: 'var(--cedar)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
          Contact us →
        </Link>
      </div>

      <footer style={{ textAlign: 'center', marginTop: 40 }}>
        <PageFooter />
      </footer>

    </main>
  )
}
