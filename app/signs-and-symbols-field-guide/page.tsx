import type { Metadata } from 'next'
import LandingPageShell from '@/app/components/landing/LandingPageShell'

const APP_URL = 'https://www.dreamsandomens.com'
const CANONICAL = `${APP_URL}/signs-and-symbols-field-guide`

export const metadata: Metadata = {
  title:       'Signs & Symbols: A Free Field Guide to Animal & Omen Meanings | Dreams & Omens',
  description: 'Free guide. Owls, crows, cardinals, 11:11, feathers — what the everyday signs around you might actually mean. Warm, grounded, and superstition-free.',
  alternates:  { canonical: CANONICAL },
  openGraph: {
    title:       'Signs & Symbols: A Free Field Guide to Animal & Omen Meanings',
    description: 'Free guide. Owls, crows, cardinals, 11:11, feathers — what the everyday signs around you might actually mean. Warm, grounded, and superstition-free.',
    url:         CANONICAL,
    type:        'website',
    images:      [{ url: `${APP_URL}/images/Dreams_omens_logo_sm.png`, alt: 'Dreams & Omens' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Signs & Symbols: A Free Field Guide to Animal & Omen Meanings',
    description: 'Free guide. Owls, crows, cardinals, 11:11, feathers — what the everyday signs around you might actually mean.',
    images:      [`${APP_URL}/images/Dreams_omens_logo_sm.png`],
  },
}

export default function SignsAndSymbolsFieldGuidePage() {
  return (
    <LandingPageShell
      headline="Signs & Symbols: A Friendly Field Guide"
      subheadline="What it might mean when the universe throws you an owl, a crow, or a cricket."
      description="That deer on a quiet morning. The clock reading 11:11 again. A feather on the sidewalk right after a tough conversation. This free guide is a warm, grounded field companion for noticing the small signals around you — without falling down a superstition rabbit hole."
      bullets={[
        'Fifteen animal symbols decoded — what it might mean when you keep seeing owls, crows, cats, snakes, deer, butterflies, foxes, hawks, rabbits, bears, wolves, herons, spiders, dragonflies, and crickets',
        'Everyday omens beyond animals: repeating numbers (hi, 11:11), weather and sky signs, found objects, songs that land at the right moment, dream-to-waking-life crossovers',
        'A gentle five-step system for noticing signs without getting lost in superstition (the "Notice, Note, Name, Nudge, Next" method)',
        'True stories from the symbol trail — real moments when a deer, a dragonfly, a coin, or a crow arrived at exactly the right time',
        'A one-page quick reference cheat sheet of common signs and what they often mean, with a "next step" for each',
      ]}
      whoThisIsFor="If you're the kind of person who notices a cardinal and pauses, but doesn't want to pretend every squirrel is a divine message — this is for you. Grounded, warm, and just curious enough. No dogma, no rigid meanings. Just good company on the trail."
      secondaryCtaHeading="Saw a sign and want to know what it might mean for YOU?"
      secondaryCtaCopy="Our full tool asks about your specific context before interpreting. Three free interpretations a month, no account needed."
      placeholderCoverTitle="Signs & Symbols: A Friendly Field Guide"
      apiEndpoint="/api/landing/field-guide-capture"
      pdfPath="/guides/Signs_and_Symbols_Field_Guide_v1.pdf"
      ebookTitle="Signs & Symbols Field Guide"
      reflectPlusNote="P.S. The guide mentions Reflect+ (our subscription tier) a few times — that's our tool for tracking signs and patterns over time. Totally optional. The guide stands on its own."
      coverImageSrc="/images/covers/signs-symbols-field-guide-cover.png"
      coverBgColor="linear-gradient(145deg, #7C9B6E, var(--moss))"
    />
  )
}
