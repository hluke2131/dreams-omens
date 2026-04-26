import Image from 'next/image'
import Link from 'next/link'
import PageFooter from '@/app/components/PageFooter'
import LandingForm from './LandingForm'
import styles from './LandingPageShell.module.css'

export interface LandingPageShellProps {
  headline:             string
  subheadline:          string
  description:          string
  bullets:              string[]
  whoThisIsFor:         string
  secondaryCtaHeading:  string
  secondaryCtaCopy:     string
  placeholderCoverTitle: string
  apiEndpoint:          string
  pdfPath:              string
  ebookTitle:           string
  reflectPlusNote:      string
  coverImageSrc?:       string  // real cover — replaces placeholder when provided
  coverBgColor?:        string
}

export default function LandingPageShell({
  headline,
  subheadline,
  description,
  bullets,
  whoThisIsFor,
  secondaryCtaHeading,
  secondaryCtaCopy,
  placeholderCoverTitle,
  apiEndpoint,
  pdfPath,
  ebookTitle,
  reflectPlusNote,
  coverImageSrc,
  coverBgColor = 'linear-gradient(145deg, var(--sage), var(--moss))',
}: LandingPageShellProps) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* Logo-only header — no nav, no sign-in */}
      <header
        style={{
          padding:    '16px 20px',
          borderBottom: '1px solid var(--divider)',
          background: 'var(--bone)',
        }}
      >
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image
            src="/images/Dreams_omens_logo_sm.png"
            alt="Dreams & Omens"
            width={36}
            height={36}
          />
          <span
            className="text-helper"
            style={{ color: 'var(--owl-brown)', fontWeight: 600 }}
          >
            Dreams &amp; Omens
          </span>
        </Link>
      </header>

      <main style={{ flex: 1 }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 960,
            margin:   '0 auto',
            padding:  '40px 20px 48px',
          }}
        >
          <div className={styles.heroGrid}>

            {/* Left: eBook cover */}
            {coverImageSrc ? (
              <div
                className={styles.bookCover}
                style={{
                  borderRadius: 'var(--radius-m)',
                  overflow:     'hidden',
                  boxShadow:    '0 8px 24px rgba(29, 27, 22, 0.18), 4px 4px 0 rgba(29, 27, 22, 0.12)',
                  position:     'relative',
                }}
              >
                <Image
                  src={coverImageSrc}
                  alt={placeholderCoverTitle}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(min-width: 640px) 380px, 100vw"
                  priority
                />
              </div>
            ) : (
              /* TODO: replace placeholder with real eBook cover at /images/covers/[slug]-cover.jpg */
              <div
                className={styles.bookCover}
                style={{
                  background:    coverBgColor,
                  borderRadius:  'var(--radius-m)',
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  justifyContent: 'center',
                  padding:       '24px 20px',
                  boxShadow:     '0 8px 24px rgba(29, 27, 22, 0.18), 4px 4px 0 rgba(29, 27, 22, 0.12)',
                  textAlign:     'center',
                  position:      'relative',
                  overflow:      'hidden',
                }}
              >
                <div
                  style={{
                    position:     'absolute',
                    inset:        '10px',
                    border:       '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 'calc(var(--radius-m) - 4px)',
                    pointerEvents: 'none',
                  }}
                />
                <Image
                  src="/images/Dreams_omens_logo_sm.png"
                  alt=""
                  width={48}
                  height={48}
                  style={{ opacity: 0.85, marginBottom: 16 }}
                />
                <p style={{ color: 'white', fontSize: 18, fontWeight: 700, lineHeight: '24px', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                  {placeholderCoverTitle}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Free Guide
                </p>
              </div>
            )}

            {/* Right: copy + form */}
            <div>
              <p
                className="text-helper"
                style={{
                  color:         'var(--cedar)',
                  fontWeight:    700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom:  10,
                }}
              >
                Free guide
              </p>
              <h1
                className="text-title-xl"
                style={{ color: 'var(--ink)', marginBottom: 10, fontSize: 30, lineHeight: '36px' }}
              >
                {headline}
              </h1>
              <p
                className="text-body"
                style={{ color: 'var(--cedar)', fontWeight: 500, marginBottom: 14 }}
              >
                {subheadline}
              </p>
              <p
                className="text-body"
                style={{ color: 'var(--text-secondary)', marginBottom: 24 }}
              >
                {description}
              </p>

              <LandingForm
                apiEndpoint={apiEndpoint}
                pdfPath={pdfPath}
                ebookTitle={ebookTitle}
                reflectPlusNote={reflectPlusNote}
              />
            </div>

          </div>
        </section>

        {/* ── What's inside ────────────────────────────────────────────── */}
        <section
          style={{
            background: 'var(--sand)',
            borderTop:  '1px solid var(--divider)',
          }}
        >
          <div
            style={{
              maxWidth: 720,
              margin:   '0 auto',
              padding:  '48px 20px',
            }}
          >
            <h2
              className="text-title-l"
              style={{ color: 'var(--ink)', marginBottom: 28 }}
            >
              What&apos;s inside
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bullets.map((bullet, i) => (
                <li
                  key={i}
                  style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}
                >
                  <span
                    style={{
                      flexShrink:  0,
                      width:       24,
                      height:      24,
                      borderRadius: '50%',
                      background:  'var(--cedar)',
                      color:       'white',
                      fontSize:    12,
                      fontWeight:  700,
                      display:     'flex',
                      alignItems:  'center',
                      justifyContent: 'center',
                      marginTop:   1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-body" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                    {bullet}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Who this is for ──────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 720,
            margin:   '0 auto',
            padding:  '48px 20px',
          }}
        >
          <h2
            className="text-title-l"
            style={{ color: 'var(--ink)', marginBottom: 16 }}
          >
            Who this is for
          </h2>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {whoThisIsFor}
          </p>
        </section>

        {/* ── Secondary CTA ────────────────────────────────────────────── */}
        <section
          style={{
            background:  'var(--cream)',
            borderTop:   '1px solid var(--divider)',
            borderBottom: '1px solid var(--divider)',
          }}
        >
          <div
            style={{
              maxWidth:  600,
              margin:    '0 auto',
              padding:   '48px 20px',
              textAlign: 'center',
            }}
          >
            <h2
              className="text-title-m"
              style={{ color: 'var(--ink)', marginBottom: 12 }}
            >
              {secondaryCtaHeading}
            </h2>
            <p
              className="text-body"
              style={{ color: 'var(--text-secondary)', marginBottom: 24 }}
            >
              {secondaryCtaCopy}
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button
                className="btn-secondary"
                style={{ width: 'auto', padding: '12px 28px', fontSize: 15 }}
              >
                Try the free interpretation tool →
              </button>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '32px 20px' }}>
        <PageFooter />
      </footer>

    </div>
  )
}
