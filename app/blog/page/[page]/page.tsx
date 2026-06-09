import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  getPublishedPostsPage,
  getPublishedPostCount,
  POSTS_PER_PAGE,
} from '@/lib/blog'
import { estimateReadTime, formatDate } from '@/lib/blog-types'
import type { BlogPost, BlogCategory } from '@/lib/blog-types'
import PageFooter from '@/app/components/PageFooter'

export const revalidate = 60

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  dream:    'var(--cedar)',
  omen:     'var(--moss)',
  practice: 'var(--sage)',
}

type Props = { params: Promise<{ page: string }> }

export async function generateStaticParams() {
  const total      = await getPublishedPostCount()
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)
  // page 1 is /blog; /blog/page/[page] starts at 2
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }))
}

export async function generateMetadata({ params }: Props) {
  const { page: pageStr } = await params
  const pageNum    = Number(pageStr)
  const total      = await getPublishedPostCount()
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)

  const alternates: Record<string, string> = { canonical: `/blog/page/${pageNum}` }
  if (pageNum > 2)         alternates.prev = `/blog/page/${pageNum - 1}`
  else if (pageNum === 2)  alternates.prev = '/blog'
  if (pageNum < totalPages) alternates.next = `/blog/page/${pageNum + 1}`

  return {
    title:       `Dream & Omen Interpretations — Page ${pageNum} | Dreams & Omens`,
    description: `Browse dream symbols, animal omens, and interpretation guides — page ${pageNum}.`,
    alternates,
  }
}

export default async function BlogPageN({ params }: Props) {
  const { page: pageStr } = await params
  const pageNum    = Number(pageStr)
  const total      = await getPublishedPostCount()
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)

  if (!pageNum || pageNum < 2 || pageNum > totalPages) notFound()

  const posts = await getPublishedPostsPage(pageNum)

  return (
    <main>
      <section
        style={{
          maxWidth:  960,
          margin:    '0 auto',
          padding:   '40px 20px 16px',
          textAlign: 'center',
        }}
      >
        <Image
          src="/images/Dreams_omens_logo_sm.png"
          alt="Dreams & Omens"
          width={100}
          height={100}
          style={{ display: 'block', margin: '0 auto 20px' }}
        />
        <h1
          className="text-title-xl"
          style={{ color: 'var(--ink)', fontSize: 28, lineHeight: '36px', marginBottom: 8 }}
        >
          Dream &amp; omen interpretations
        </h1>
        <p className="text-caption" style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Page {pageNum} of {totalPages}
        </p>
        <Link href="/blog" style={{ textDecoration: 'none' }}>
          <button className="btn-secondary" style={{ width: 'auto', padding: '10px 24px', fontSize: 14 }}>
            ← Back to all posts
          </button>
        </Link>
      </section>

      <section
        style={{
          maxWidth: 960,
          margin:   '0 auto',
          padding:  '24px 20px 48px',
        }}
      >
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap:                 24,
          }}
        >
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      </section>

      {/* Pagination navigation */}
      <nav
        aria-label="Blog pages"
        style={{ textAlign: 'center', padding: '0 20px 32px', display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}
      >
        {pageNum > 1 && (
          <Link
            href={pageNum === 2 ? '/blog' : `/blog/page/${pageNum - 1}`}
            style={{
              padding:        '8px 18px',
              borderRadius:   'var(--radius-m)',
              border:         '1px solid var(--stroke-soft)',
              color:          'var(--owl-brown)',
              background:     'var(--bone)',
              fontSize:       14,
              textDecoration: 'none',
            }}
          >
            ← Previous
          </Link>
        )}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <Link
            key={p}
            href={p === 1 ? '/blog' : `/blog/page/${p}`}
            aria-label={`Page ${p}`}
            aria-current={p === pageNum ? 'page' : undefined}
            style={{
              padding:        '8px 14px',
              borderRadius:   'var(--radius-s)',
              border:         '1px solid var(--stroke-soft)',
              color:          p === pageNum ? 'white' : 'var(--owl-brown)',
              background:     p === pageNum ? 'var(--cedar)' : 'var(--bone)',
              fontSize:       13,
              fontWeight:     p === pageNum ? 700 : 500,
              textDecoration: 'none',
            }}
          >
            {p}
          </Link>
        ))}
        {pageNum < totalPages && (
          <Link
            href={`/blog/page/${pageNum + 1}`}
            style={{
              padding:        '8px 18px',
              borderRadius:   'var(--radius-m)',
              border:         '1px solid var(--stroke-soft)',
              color:          'var(--owl-brown)',
              background:     'var(--bone)',
              fontSize:       14,
              textDecoration: 'none',
            }}
          >
            Next →
          </Link>
        )}
      </nav>

      <footer style={{ textAlign: 'center', padding: '0 20px 40px' }}>
        <PageFooter />
      </footer>
    </main>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  const readTime = estimateReadTime(post.body_markdown)
  const date     = post.published_at ? formatDate(post.published_at) : ''
  const color    = CATEGORY_COLORS[post.category]

  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        className="card-primary"
        style={{
          padding:       0,
          overflow:      'hidden',
          transition:    'box-shadow 0.15s ease',
          height:        '100%',
          display:       'flex',
          flexDirection: 'column',
        }}
      >
        {post.featured_image_url && (
          <div style={{ position: 'relative', height: 180, flexShrink: 0 }}>
            <Image
              src={post.featured_image_url}
              alt={post.featured_image_alt ?? post.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 600px) 100vw, 50vw"
            />
          </div>
        )}
        <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <span
            style={{
              display:       'inline-block',
              background:    color,
              color:         'white',
              fontSize:      11,
              fontWeight:    700,
              padding:       '3px 10px',
              borderRadius:  'var(--radius-s)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              alignSelf:     'flex-start',
            }}
          >
            {post.category}
          </span>
          <h2 className="text-title-m" style={{ color: 'var(--ink)', margin: 0 }}>
            {post.title}
          </h2>
          <p className="text-helper" style={{ color: 'var(--text-secondary)', lineHeight: '20px', flex: 1 }}>
            {post.excerpt}
          </p>
          <p className="text-caption" style={{ color: 'var(--owl-brown)', marginTop: 4 }}>
            {date}{date && ' · '}{readTime} min read
          </p>
        </div>
      </article>
    </Link>
  )
}
