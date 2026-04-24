import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

const NAV: { href: string; label: string }[] = [
  { href: '/blog',    label: 'Blog'    },
  { href: '/about',   label: 'About'   },
  { href: '/pricing', label: 'Pricing' },
]

export default async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = !!profile?.is_admin
  }

  return (
    <header
      style={{
        borderBottom:     '1px solid var(--stroke-soft)',
        background:       'var(--bone)',
        position:         'sticky',
        top:              0,
        zIndex:           50,
        backdropFilter:   'blur(8px)',
      }}
    >
      <div
        style={{
          maxWidth:       960,
          margin:         '0 auto',
          padding:        '0 20px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          height:         56,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Image
            src="/images/Dreams_omens_logo_sm.png"
            alt="Dreams & Omens"
            width={28}
            height={28}
          />
          <span
            className="text-helper"
            style={{ fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}
          >
            Dreams & Omens
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} style={linkStyle}>{label}</Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/blog"
              style={{ ...linkStyle, color: 'var(--sage)', fontWeight: 700 }}
            >
              Admin
            </Link>
          )}
          {user ? (
            <Link href="/account" style={{ ...linkStyle, color: 'var(--cedar)', fontWeight: 700 }}>
              Account
            </Link>
          ) : (
            <Link href="/auth/sign-in" style={{ ...linkStyle, color: 'var(--cedar)', fontWeight: 700 }}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

const linkStyle: React.CSSProperties = {
  color:          'var(--owl-brown)',
  textDecoration: 'none',
  fontSize:       13,
  fontWeight:     500,
}
