'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type PostFormData = {
  title:              string
  slug:               string
  excerpt:            string
  body_markdown:      string
  category:           'dream' | 'omen' | 'practice'
  tags:               string
  featured_image_url: string
  featured_image_alt: string
  status:             'draft' | 'published'
}

async function getAdminSupabase() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return null
  return { supabase, user }
}

function parsePost(data: PostFormData) {
  return {
    title:              data.title.trim(),
    slug:               data.slug.trim().toLowerCase(),
    excerpt:            data.excerpt.trim(),
    body_markdown:      data.body_markdown,
    category:           data.category,
    tags:               data.tags.split(',').map(t => t.trim()).filter(Boolean),
    featured_image_url: data.featured_image_url.trim() || null,
    featured_image_alt: data.featured_image_alt.trim() || null,
    status:             data.status,
  }
}

export async function createPost(data: PostFormData): Promise<{ error: string } | undefined> {
  const admin = await getAdminSupabase()
  if (!admin) return { error: 'Not authorized.' }

  const parsed = parsePost(data)
  const published_at = parsed.status === 'published' ? new Date().toISOString() : null

  const { error } = await admin.supabase.from('blog_posts').insert({
    ...parsed,
    published_at,
    author_id: admin.user.id,
  })

  if (error) {
    if (error.code === '23505') return { error: 'A post with this slug already exists.' }
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function updatePost(id: string, data: PostFormData): Promise<{ error: string } | undefined> {
  const admin = await getAdminSupabase()
  if (!admin) return { error: 'Not authorized.' }

  const parsed = parsePost(data)

  const { data: current } = await admin.supabase
    .from('blog_posts')
    .select('published_at, status')
    .eq('id', id)
    .single()

  let published_at = current?.published_at ?? null
  if (parsed.status === 'published' && !published_at) {
    published_at = new Date().toISOString()
  } else if (parsed.status === 'draft') {
    published_at = null
  }

  const { error } = await admin.supabase
    .from('blog_posts')
    .update({ ...parsed, published_at })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'A post with this slug already exists.' }
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${parsed.slug}`)
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function deletePost(formData: FormData) {
  const admin = await getAdminSupabase()
  if (!admin) redirect('/')

  const id = formData.get('id') as string
  await admin.supabase.from('blog_posts').delete().eq('id', id)

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function togglePostStatus(formData: FormData) {
  const admin = await getAdminSupabase()
  if (!admin) redirect('/')

  const id            = formData.get('id') as string
  const currentStatus = formData.get('status') as string
  const newStatus     = currentStatus === 'published' ? 'draft' : 'published'
  const published_at  = newStatus === 'published' ? new Date().toISOString() : null

  await admin.supabase
    .from('blog_posts')
    .update({ status: newStatus, published_at })
    .eq('id', id)

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}
