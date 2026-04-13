import type { Metadata } from 'next'
import './globals.css'
import CookieConsent from './components/CookieConsent'

export const metadata: Metadata = {
  title:       'Dreams & Omens',
  description: 'Dream and omen interpretation. Anonymous, self-guided, and grounded.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
