import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     ['/blog', '/blog/'],
        disallow:  ['/admin', '/admin/'],
      },
    ],
    sitemap: 'https://www.dreamsandomens.com/sitemap.xml',
  }
}
