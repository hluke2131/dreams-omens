import Link from 'next/link'
import Image from 'next/image'
import { getPublishedPosts, getPublishedPostCount, POSTS_PER_PAGE } from '@/lib/blog'
import BlogFilter from '@/app/components/blog/BlogFilter'
import PageFooter from '@/app/components/PageFooter'

export const revalidate = 60

export async function generateMetadata() {
  const total      = await getPublishedPostCount()
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)

  return {
    title:       'Dream & Omen Interpretations | Dreams & Omens',
    description: 'Explore dream symbols, animal omens, and practical guidance for understanding what your subconscious and the world around you might be saying.',
    alternates:  totalPages > 1 ? { canonical: '/blog', next: '/blog/page/2' } : { canonical: '/blog' },
  }
}

export default async function BlogIndexPage() {
  const [posts, total] = await Promise.all([getPublishedPosts(), getPublishedPostCount()])
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          maxWidth:  960,
          margin:    '0 auto',
          padding:   '56px 20px 40px',
          textAlign: 'center',
        }}
      >
        <Image
          src="/images/Dreams_omens_logo_sm.png"
          alt="Dreams & Omens"
          width={140}
          height={140}
          style={{ display: 'block', margin: '0 auto 24px' }}
        />
        <h1
          className="text-title-xl"
          style={{ color: 'var(--ink)', marginBottom: 12, fontSize: 32, lineHeight: '40px' }}
        >
          Dream &amp; omen interpretations,<br />one symbol at a time.
        </h1>
        <p
          className="text-body"
          style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 520, margin: '0 auto 24px' }}
        >
          Curious what something means? These posts go deeper than a dictionary entry —
          exploring the psychology, tradition, and personal context behind common symbols.
        </p>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button
            className="btn-secondary"
            style={{ width: 'auto', padding: '12px 28px', fontSize: 14 }}
          >
            Get your own interpretation →
          </button>
        </Link>
      </section>

      {/* Post grid with filter + search + load-more */}
      <section
        style={{
          maxWidth: 960,
          margin:   '0 auto',
          padding:  '0 20px 64px',
        }}
      >
        <BlogFilter posts={posts} />
      </section>

      {/* Crawler-visible pagination links */}
      {totalPages > 1 && (
        <nav
          aria-label="Blog pages"
          style={{ textAlign: 'center', padding: '0 20px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginRight: 4 }}>
            More posts:
          </span>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Link
              key={page}
              href={page === 1 ? '/blog' : `/blog/page/${page}`}
              aria-label={`Page ${page}`}
              aria-current={page === 1 ? 'page' : undefined}
              style={{
                padding:        '6px 14px',
                borderRadius:   'var(--radius-s)',
                border:         '1px solid var(--stroke-soft)',
                color:          page === 1 ? 'white' : 'var(--owl-brown)',
                background:     page === 1 ? 'var(--cedar)' : 'var(--bone)',
                fontSize:       13,
                fontWeight:     page === 1 ? 700 : 500,
                textDecoration: 'none',
              }}
            >
              Page {page}
            </Link>
          ))}
        </nav>
      )}

      <footer style={{ textAlign: 'center', padding: '0 20px 40px' }}>
        <PageFooter />
      </footer>
    </main>
  )
}
