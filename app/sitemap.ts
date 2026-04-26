import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'

const APP_URL = 'https://www.dreamsandomens.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${APP_URL}`,                                    lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${APP_URL}/blog`,                               lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${APP_URL}/dream-symbols-101`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/signs-and-symbols-field-guide`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/about`,                              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/pricing`,                            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/faq`,                                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/contact`,                            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${APP_URL}/privacy`,                            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${APP_URL}/terms`,                              lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
  ]

  const postPages: MetadataRoute.Sitemap = posts.map(post => ({
    url:             `${APP_URL}/blog/${post.slug}`,
    lastModified:    new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority:        0.7,
  }))

  return [...staticPages, ...postPages]
}
