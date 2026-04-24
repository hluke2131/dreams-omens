import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  getPostBySlug,
  getRelatedPosts,
  estimateReadTime,
  formatDate,
  splitAtFirstParagraph,
  type BlogPost,
  type BlogCategory,
} from '@/lib/blog'
import MarkdownRenderer from '@/app/components/blog/MarkdownRenderer'
import DreamCtaBlock from '@/app/components/blog/DreamCtaBlock'
import OmenCtaBlock from '@/app/components/blog/OmenCtaBlock'
import PracticeCtaBlock from '@/app/components/blog/PracticeCtaBlock'
import PageFooter from '@/app/components/PageFooter'

export const revalidate = 60

const APP_URL = 'https://www.dreamsandomens.com'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }

  const url = `${APP_URL}/blog/${post.slug}`

  return {
    title:       post.title,
    description: post.excerpt,
    alternates:  { canonical: url },
    openGraph: {
      title:         post.title,
      description:   post.excerpt,
      type:          'article',
      url,
      images:        post.featured_image_url
        ? [{ url: post.featured_image_url, alt: post.featured_image_alt ?? '' }]
        : [],
      publishedTime: post.published_at ?? undefined,
      modifiedTime:  post.updated_at,
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.title,
      description: post.excerpt,
      images:      post.featured_image_url ? [post.featured_image_url] : [],
    },
  }
}

function CtaBlock({ category }: { category: BlogCategory }) {
  if (category === 'dream') return <DreamCtaBlock />
  if (category === 'omen')  return <OmenCtaBlock />
  return <PracticeCtaBlock />
}

const CATEGORY_LABEL: Record<BlogCategory, string> = {
  dream:    'Dreams',
  omen:     'Omens',
  practice: 'Practice',
}

const CATEGORY_COLOR: Record<BlogCategory, string> = {
  dream:    'var(--cedar)',
  omen:     'var(--moss)',
  practice: 'var(--sage)',
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, _] = await Promise.all([getPostBySlug(slug), Promise.resolve()])
  if (!post) notFound()

  const related   = await getRelatedPosts(post.category, post.id)
  const readTime  = estimateReadTime(post.body_markdown)
  const date      = post.published_at ? formatDate(post.published_at) : ''
  const [firstPart, rest] = splitAtFirstParagraph(post.body_markdown)

  const jsonLd = {
    '@context':   'https://schema.org',
    '@type':      'Article',
    headline:     post.title,
    description:  post.excerpt,
    image:        post.featured_image_url ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified:  post.updated_at,
    author: { '@type': 'Organization', name: 'Dreams & Omens' },
    publisher: {
      '@type': 'Organization',
      name:    'Dreams & Omens',
      url:     APP_URL,
    },
    url: `${APP_URL}/blog/${post.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 64px' }}>

        {/* Back link */}
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/blog"
            style={{ color: 'var(--cedar)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            ← All posts
          </Link>
        </div>

        {/* Category badge */}
        <div style={{ marginBottom: 16 }}>
          <span
            style={{
              display:       'inline-block',
              background:    CATEGORY_COLOR[post.category],
              color:         'white',
              fontSize:      11,
              fontWeight:    700,
              padding:       '4px 12px',
              borderRadius:  'var(--radius-s)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {CATEGORY_LABEL[post.category]}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-title-xl"
          style={{ color: 'var(--ink)', marginBottom: 12, lineHeight: '36px', fontSize: 28 }}
        >
          {post.title}
        </h1>

        {/* Meta */}
        <p className="text-helper" style={{ color: 'var(--owl-brown)', marginBottom: 28 }}>
          {date}{date && ' · '}{readTime} min read
        </p>

        {/* Featured image */}
        {post.featured_image_url && (
          <div
            style={{
              position:     'relative',
              height:       340,
              borderRadius: 'var(--radius-l)',
              overflow:     'hidden',
              marginBottom: 36,
            }}
          >
            <Image
              src={post.featured_image_url}
              alt={post.featured_image_alt ?? post.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
              sizes="760px"
            />
          </div>
        )}

        {/* First paragraph of body */}
        <MarkdownRenderer content={firstPart} />

        {/* Top CTA */}
        <CtaBlock category={post.category} />

        {/* Rest of body */}
        {rest && <MarkdownRenderer content={rest} />}

        {/* Bottom CTA */}
        <CtaBlock category={post.category} />

        {/* Related posts */}
        {related.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <h2
              className="text-title-m"
              style={{ color: 'var(--ink)', marginBottom: 20, borderTop: '1px solid var(--divider)', paddingTop: 32 }}
            >
              More from {CATEGORY_LABEL[post.category]}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {related.map(r => (
                <RelatedCard key={r.id} post={r} />
              ))}
            </div>
          </section>
        )}

        <footer style={{ textAlign: 'center', marginTop: 56 }}>
          <PageFooter />
        </footer>
      </main>
    </>
  )
}

function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div
        className="card-secondary"
        style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16 }}
      >
        {post.featured_image_url && (
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0, borderRadius: 'var(--radius-s)', overflow: 'hidden' }}>
            <Image
              src={post.featured_image_url}
              alt={post.featured_image_alt ?? post.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="72px"
            />
          </div>
        )}
        <div>
          <p className="text-helper" style={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}>
            {post.title}
          </p>
          <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            {estimateReadTime(post.body_markdown)} min read
          </p>
        </div>
      </div>
    </Link>
  )
}
