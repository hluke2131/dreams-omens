'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost, BlogCategory } from '@/lib/blog-types'
import { estimateReadTime, formatDate } from '@/lib/blog-types'

const PAGE_SIZE = 9

const CATEGORIES: { value: BlogCategory | 'all'; label: string }[] = [
  { value: 'all',      label: 'All'      },
  { value: 'dream',    label: 'Dreams'   },
  { value: 'omen',     label: 'Omens'    },
  { value: 'practice', label: 'Practice' },
]

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  dream:    'var(--cedar)',
  omen:     'var(--moss)',
  practice: 'var(--sage)',
}

export default function BlogFilter({ posts }: { posts: BlogPost[] }) {
  const [active,       setActive]       = useState<BlogCategory | 'all'>('all')
  const [query,        setQuery]        = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const q = query.trim().toLowerCase()

  const filtered = posts.filter(p => {
    const matchesCat = active === 'all' || p.category === active
    const matchesQ   = !q || p.title.toLowerCase().includes(q) || (p.excerpt ?? '').toLowerCase().includes(q)
    return matchesCat && matchesQ
  })

  // Reset visible count when filter/search changes so results aren't hidden.
  const visible = filtered.slice(0, q ? filtered.length : visibleCount)
  const hasMore = !q && visibleCount < filtered.length

  function handleCategoryChange(cat: BlogCategory | 'all') {
    setActive(cat)
    setVisibleCount(PAGE_SIZE)
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div>
      {/* Search input */}
      <input
        type="search"
        value={query}
        onChange={handleQueryChange}
        placeholder="Search posts…"
        aria-label="Search blog posts"
        style={{
          width:        '100%',
          padding:      '10px 16px',
          marginBottom: 20,
          borderRadius: 'var(--radius-m)',
          border:       '1px solid var(--stroke-soft)',
          background:   'var(--bone)',
          color:        'var(--ink)',
          fontSize:     15,
          fontFamily:   'inherit',
          outline:      'none',
          boxSizing:    'border-box',
        }}
      />

      {/* Category filter tabs */}
      <div
        style={{
          display:      'flex',
          gap:          8,
          marginBottom: 32,
          flexWrap:     'wrap',
        }}
      >
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleCategoryChange(value)}
            style={{
              padding:      '8px 18px',
              borderRadius: 'var(--radius-m)',
              border:       '1px solid var(--stroke-soft)',
              background:   active === value ? 'var(--cedar)' : 'var(--bone)',
              color:        active === value ? 'white' : 'var(--owl-brown)',
              fontWeight:   active === value ? 700 : 500,
              fontSize:     14,
              cursor:       'pointer',
              fontFamily:   'inherit',
              transition:   'background 0.15s ease, color 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Post grid */}
      {filtered.length === 0 ? (
        <p className="text-body" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
          No posts found.
        </p>
      ) : (
        <>
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap:                 24,
            }}
          >
            {visible.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="btn-secondary"
                style={{ width: 'auto', padding: '12px 32px', fontSize: 15 }}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
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
