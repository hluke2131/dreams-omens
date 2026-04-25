import { createClient } from '@/lib/supabase/server'
import type { BlogCategory, BlogPost } from '@/lib/blog-types'

// Re-export types and pure utils from the client-safe module so that
// server-only callers can keep a single import path.
export type { BlogCategory, BlogPost } from '@/lib/blog-types'
export { estimateReadTime, formatDate, splitAtFirstParagraph } from '@/lib/blog-types'

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

