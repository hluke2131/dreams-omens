import Link from 'next/link'
import Image from 'next/image'
import { getPublishedPosts } from '@/lib/blog'
import BlogFilter from '@/app/components/blog/BlogFilter'
import PageFooter from '@/app/components/PageFooter'

export const revalidate = 60

export const metadata = {
  title:       'Dream & Omen Interpretations | Dreams & Omens',
  description: 'Explore dream symbols, animal omens, and practical guidance for understanding what your subconscious and the world around you might be saying.',
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts()

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          maxWidth:    960,
          margin:      '0 auto',
          padding:     '56px 20px 40px',
          textAlign:   'center',
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

      {/* Post grid with filter */}
      <section
        style={{
          maxWidth: 960,
          margin:   '0 auto',
          padding:  '0 20px 64px',
        }}
      >
        <BlogFilter posts={posts} />
      </section>

      <footer style={{ textAlign: 'center', padding: '0 20px 40px' }}>
        <PageFooter />
      </footer>
    </main>
  )
}
