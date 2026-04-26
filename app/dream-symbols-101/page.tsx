import type { Metadata } from 'next'
import LandingPageShell from '@/app/components/landing/LandingPageShell'

const APP_URL = 'https://www.dreamsandomens.com'
const CANONICAL = `${APP_URL}/dream-symbols-101`

export const metadata: Metadata = {
  title:       'Dream Symbols 101: A Free Guide to What Your Dreams Might Mean | Dreams & Omens',
  description: 'Free guide. The most common dream symbols explained in warm, plain language. Teeth falling out, flying, being chased — what your brain is actually doing in there.',
  alternates:  { canonical: CANONICAL },
  openGraph: {
    title:       'Dream Symbols 101: A Free Guide to What Your Dreams Might Mean',
    description: 'Free guide. The most common dream symbols explained in warm, plain language. Teeth falling out, flying, being chased — what your brain is actually doing in there.',
    url:         CANONICAL,
    type:        'website',
    images:      [{ url: `${APP_URL}/images/Dreams_omens_logo_sm.png`, alt: 'Dreams & Omens' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Dream Symbols 101: A Free Guide to What Your Dreams Might Mean',
    description: 'Free guide. The most common dream symbols explained in warm, plain language.',
    images:      [`${APP_URL}/images/Dreams_omens_logo_sm.png`],
  },
}

export default function DreamSymbols101Page() {
  return (
    <LandingPageShell
      headline="Dream Symbols 101"
      subheadline="A quick, warm-hearted starter guide to what those weird, recurring images in your sleep might actually mean."
      description="Teeth falling out. Flying. Being chased. Dreams speak in symbols, and most of them aren't as random as they feel. This free guide breaks down the most common dream symbols, the science behind why your brain uses them, and how to start spotting your own patterns."
      bullets={[
        'A warm plain-language explainer of what dream symbols actually ARE (hint: they\'re closer to your brain\'s inside jokes than to prophecy)',
        'The most common dream symbols decoded: falling, flying, teeth, being chased, water, being late, showing up unprepared',
        'A super-quick history of dream interpretation, from ancient Greek dream temples to modern sleep science',
        'How to start a dream journal you\'ll actually keep — with do\'s, don\'ts, and a color-coding trick for the especially dedicated',
        'A guided subscriber challenge: track one recurring symbol for 30 days and see what it\'s trying to tell you',
      ]}
      whoThisIsFor="If you've ever woken up at 3 a.m. from the same weird dream for the fourth time and wondered what your brain is doing in there — this is for you. No mystical hand-waving, no dream dictionaries pretending every snake means the same thing. Just a warm, grounded starting point."
      secondaryCtaHeading="Already know you want personalized dream interpretations?"
      secondaryCtaCopy="Our full tool asks about YOU first, then interprets the dream. Three free interpretations a month, no account needed."
      coverImageSrc="/images/covers/dream-symbols-101-cover.png"
      placeholderCoverTitle="Dream Symbols 101"
      apiEndpoint="/api/landing/dream-symbols-capture"
      pdfPath="/guides/Dream_Symbols_101_v1.pdf"
      ebookTitle="Dream Symbols 101"
      reflectPlusNote="P.S. The guide mentions Reflect+ (our subscription tier) a few times — that's our tool for tracking dreams over time. Totally optional. The guide stands on its own."
    />
  )
}
