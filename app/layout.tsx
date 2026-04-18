import type { Metadata } from 'next'
import Script from 'next/script'
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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const isProd = process.env.NODE_ENV === 'production'

  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
        {isProd && gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
