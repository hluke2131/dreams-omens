import Link from 'next/link'

const NAV_LINKS = [
  { href: '/blog',    label: 'Blog'    },
  { href: '/about',   label: 'About'   },
  { href: '/faq',     label: 'FAQ'     },
  { href: '/pricing', label: 'Pricing' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms',   label: 'Terms'   },
]

/**
 * Shared footer content used on every page.
 * Wrap in a <footer> element with the page's desired marginTop.
 */
export default function PageFooter() {
  return (
    <>
      <div
        style={{
          display:        'flex',
          justifyContent: 'center',
          flexWrap:       'wrap',
          gap:            '6px 16px',
          marginBottom:   14,
        }}
      >
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-caption"
            style={{ color: 'var(--cedar)', textDecoration: 'none' }}
          >
            {label}
          </Link>
        ))}
      </div>
      <p className="text-caption" style={{ color: 'var(--owl-brown)', marginBottom: 4 }}>
        © 2026 - DreamsAndOmens.com - All Rights Reserved
      </p>
      <p className="text-caption" style={{ color: 'var(--owl-brown)' }}>
        For entertainment purposes only. Not a substitute for professional advice.
      </p>
    </>
  )
}
