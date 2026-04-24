import { createClient } from '@/lib/supabase/server'

export type BlogCategory = 'dream' | 'omen' | 'practice'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  body_markdown: string
  featured_image_url: string | null
  featured_image_alt: string | null
  category: BlogCategory
  tags: string[]
  status: 'draft' | 'published'
  published_at: string | null
  author_id: string | null
  created_at: string
  updated_at: string
}

export function estimateReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  return (data as BlogPost[]) ?? []
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return (data as BlogPost) ?? null
}

export async function getRelatedPosts(category: BlogCategory, currentId: string): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .neq('id', currentId)
    .order('published_at', { ascending: false })
    .limit(3)
  return (data as BlogPost[]) ?? []
}

export async function getAllPostsForAdmin(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false })
  return (data as BlogPost[]) ?? []
}

export async function getPostByIdForAdmin(id: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()
  return (data as BlogPost) ?? null
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
