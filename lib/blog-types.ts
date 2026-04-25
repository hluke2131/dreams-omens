// Pure types and utilities — no server-only imports.
// Safe to import from both Server and Client Components.

export type BlogCategory = 'dream' | 'omen' | 'practice'

export interface BlogPost {
  id:                 string
  slug:               string
  title:              string
  excerpt:            string
  body_markdown:      string
  featured_image_url: string | null
  featured_image_alt: string | null
  category:           BlogCategory
  tags:               string[]
  status:             'draft' | 'published'
  published_at:       string | null
  author_id:          string | null
  created_at:         string
  updated_at:         string
}

export function estimateReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
  })
}

export function splitAtFirstParagraph(markdown: string): [string, string] {
  const lines = markdown.split('\n')
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      return [
        lines.slice(0, i).join('\n'),
        lines.slice(i + 1).join('\n'),
      ]
    }
  }
  return [markdown, '']
}
