import type { Metadata } from 'next'
import SiteHeader from '@/app/components/SiteHeader'

export const metadata: Metadata = {
  title: {
    default:  'Blog — Dreams & Omens',
    template: '%s | Dreams & Omens',
  },
  description:
    'Dream and omen interpretations, symbol explorations, and practical guidance for understanding your inner life.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh' }}>
      <SiteHeader />
      {children}
    </div>
  )
}
