'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { BlogPost, BlogCategory } from '@/lib/blog'
import { createPost, updatePost, type PostFormData } from '@/app/admin/blog/actions'

interface Props {
  post?: BlogPost
}

export default function PostForm({ post }: Props) {
  const [title,              setTitle]              = useState(post?.title ?? '')
  const [slug,               setSlug]               = useState(post?.slug ?? '')
  const [slugEdited,         setSlugEdited]         = useState(!!post?.slug)
  const [excerpt,            setExcerpt]            = useState(post?.excerpt ?? '')
  const [category,           setCategory]           = useState<BlogCategory>(post?.category ?? 'dream')
  const [tags,               setTags]               = useState((post?.tags ?? []).join(', '))
  const [imageUrl,           setImageUrl]           = useState(post?.featured_image_url ?? '')
  const [imageAlt,           setImageAlt]           = useState(post?.featured_image_alt ?? '')
  const [body,               setBody]               = useState(post?.body_markdown ?? '')
  const [status,             setStatus]             = useState<'draft' | 'published'>(post?.status ?? 'draft')
  const [error,              setError]              = useState<string | null>(null)
  const [saving,             setSaving]             = useState(false)

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slugEdited) setSlug(generateSlug(v))
  }

  function handleSlugChange(v: string) {
    setSlug(v)
    setSlugEdited(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const data: PostFormData = {
      title,
      slug,
      excerpt,
      body_markdown:      body,
      category,
      tags,
      featured_image_url: imageUrl,
      featured_image_alt: imageAlt,
      status,
    }

    const result = post
      ? await updatePost(post.id, data)
      : await createPost(data)

    if (result?.error) {
      setError(result.error)
      setSaving(false)
    }
    // On success the server action calls redirect() — page navigates automatically
  }

  return (
    <form onSubmit={handleSubmit} style={{ minHeight: '100dvh', background: '#f4f4f5' }}>

      {/* Sticky save bar */}
      <div
        style={{
          position:     'sticky',
          top:          0,
          zIndex:       20,
          background:   '#18181b',
          padding:      '12px 24px',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          gap:          12,
        }}
      >
        <h1 style={{ color: '#f4f4f5', fontSize: 15, fontWeight: 700, margin: 0 }}>
          {post ? `Editing: ${post.title || 'Untitled'}` : 'New Post'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {error && (
            <span style={{ color: '#f87171', fontSize: 13 }}>{error}</span>
          )}
          <button
            type="submit"
            disabled={saving}
            style={{
              background:   saving ? '#6b7280' : '#4ade80',
              color:        '#000',
              border:       'none',
              padding:      '8px 22px',
              borderRadius: 8,
              fontWeight:   700,
              fontSize:     14,
              cursor:       saving ? 'not-allowed' : 'pointer',
              fontFamily:   'inherit',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Form body */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>

        {/* Title + Slug row */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              required
              placeholder="Post title"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Slug (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={e => handleSlugChange(e.target.value)}
              required
              placeholder="url-slug-here"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Excerpt */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <label style={labelStyle}>Excerpt (max 280 chars)</label>
            <span style={{ fontSize: 12, color: excerpt.length > 270 ? '#f87171' : '#6b7280' }}>
              {excerpt.length}/280
            </span>
          </div>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            maxLength={280}
            required
            rows={3}
            placeholder="2–3 sentence summary shown in post listings and meta description"
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Category + Status row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'flex', gap: 20, paddingTop: 10 }}>
              {(['dream', 'omen', 'practice'] as const).map(c => (
                <label key={c} style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="category"
                    value={c}
                    checked={category === c}
                    onChange={() => setCategory(c)}
                    style={{ accentColor: '#4ade80' }}
                  />
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <div style={{ display: 'flex', gap: 20, paddingTop: 10 }}>
              {(['draft', 'published'] as const).map(s => (
                <label key={s} style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    style={{ accentColor: '#4ade80' }}
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="dreams, common dreams, anxiety"
            style={inputStyle}
          />
        </div>

        {/* Image URL + Alt */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={labelStyle}>Featured Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Image Alt Text</label>
            <input
              type="text"
              value={imageAlt}
              onChange={e => setImageAlt(e.target.value)}
              placeholder="Descriptive alt text"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Body + Preview (side-by-side) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Body (Markdown)</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              placeholder="Write your post in Markdown..."
              style={{
                ...inputStyle,
                minHeight:  600,
                resize:     'vertical',
                fontFamily: 'ui-monospace, "Cascadia Code", monospace',
                fontSize:   13,
                lineHeight: '1.6',
                flex:       1,
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Preview</label>
            <div
              style={{
                minHeight:    600,
                background:   '#f9f6f2',
                borderRadius: 8,
                padding:      '20px 24px',
                overflowY:    'auto',
                border:       '1px solid #e4e0da',
                flex:         1,
              }}
            >
              {body ? (
                <div className="blog-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                </div>
              ) : (
                <p style={{ color: '#999', fontStyle: 'italic', fontSize: 14 }}>
                  Start typing to see a preview…
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      11,
  fontWeight:    700,
  color:         '#6b7280',
  marginBottom:  4,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const inputStyle: React.CSSProperties = {
  width:        '100%',
  padding:      '10px 12px',
  borderRadius: 6,
  border:       '1px solid #d1d5db',
  background:   '#ffffff',
  color:        '#111827',
  fontSize:     14,
  fontFamily:   'inherit',
  boxSizing:    'border-box',
  outline:      'none',
}

const radioLabelStyle: React.CSSProperties = {
  display:    'flex',
  gap:        6,
  alignItems: 'center',
  cursor:     'pointer',
  color:      '#374151',
  fontSize:   14,
  fontWeight: 500,
}
