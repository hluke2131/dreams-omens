import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Dreams & Omens' }

const LAST_UPDATED = 'April 12, 2026'

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <Link href="/" style={{ color: 'var(--owl-brown)', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <h1 className="text-title-l" style={{ color: 'var(--ink)' }}>Privacy Policy</h1>
      </header>

      <p className="text-helper" style={{ color: 'var(--owl-brown)', marginBottom: 28 }}>
        Last updated: {LAST_UPDATED}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        <Section title="Overview">
          Dreams &amp; Omens (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your privacy.
          This policy explains what data we collect, how we use it, and the choices you have.
          By using DreamsAndOmens.com you agree to the practices described here.
        </Section>

        <Section title="Information we collect">
          <strong>Without an account (free tier):</strong> Your dream or omen text is transmitted
          to our API to generate an interpretation and is not stored on our servers after the
          response is returned. All local history is kept exclusively in your browser&apos;s
          localStorage and never leaves your device unless you create an account.
          <br /><br />
          <strong>With an account (Basic / Reflect+):</strong> We collect your email address and
          store your interpretation history, symbol frequency data, and preferences in our
          database (Supabase). We also store your Stripe customer ID and subscription status
          to manage billing.
          <br /><br />
          <strong>Automatically:</strong> Standard web server logs (IP address, browser type,
          pages visited) are collected for security and performance monitoring. These are
          retained for up to 30 days.
        </Section>

        <Section title="How we use your data">
          We use the information we collect to:
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>Provide and improve the interpretation service</li>
            <li style={{ marginBottom: 6 }}>Manage your account and subscription</li>
            <li style={{ marginBottom: 6 }}>Send transactional emails (account confirmation, password reset)</li>
            <li style={{ marginBottom: 6 }}>Detect and prevent fraud or abuse</li>
            <li style={{ marginBottom: 6 }}>Comply with legal obligations</li>
          </ul>
          We do not sell, rent, or share your personal data with third parties for marketing purposes.
        </Section>

        <Section title="AI processing">
          Interpretation text you submit is sent to OpenAI (GPT-4o mini) to generate a response.
          OpenAI processes this data under their own{' '}
          <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--cedar)' }}>Privacy Policy</a>.
          We have configured our API usage so that your inputs are not used to train OpenAI models.
          We recommend you avoid including sensitive personal information (full name, address,
          health details) in your interpretations.
        </Section>

        <Section title="Cookies and local storage">
          We use browser localStorage to store:
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>Your local interpretation history</li>
            <li style={{ marginBottom: 6 }}>Your monthly usage count</li>
            <li style={{ marginBottom: 6 }}>Onboarding completion flag</li>
            <li style={{ marginBottom: 6 }}>App preferences (concise mode, cookie consent)</li>
          </ul>
          Supabase sets session cookies to keep you signed in. Stripe may set cookies during
          the checkout flow. You can manage cookie preferences using our cookie consent banner
          or your browser settings.
        </Section>

        <Section title="Third-party services">
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}><strong>Supabase</strong> — authentication and database (EU/US data centers)</li>
            <li style={{ marginBottom: 6 }}><strong>OpenAI</strong> — AI interpretation generation</li>
            <li style={{ marginBottom: 6 }}><strong>Stripe</strong> — payment processing (PCI-DSS compliant)</li>
            <li style={{ marginBottom: 6 }}><strong>Vercel</strong> — hosting and CDN</li>
          </ul>
          Each provider has their own privacy policy governing their use of data.
        </Section>

        <Section title="Data retention">
          Anonymous usage data (localStorage) exists only on your device and is cleared when
          you clear your browser data. Account data is retained for the duration of your account.
          If you delete your account, we delete your profile and interpretation history within
          30 days. Billing records are retained for 7 years as required by law.
        </Section>

        <Section title="Your rights">
          You have the right to access, correct, export, or delete your personal data at any
          time. To make a request, email us at{' '}
          <a href="mailto:hello@dreamsandomens.com" style={{ color: 'var(--cedar)' }}>
            hello@dreamsandomens.com
          </a>.
          We will respond within 30 days.
        </Section>

        <Section title="Children">
          Dreams &amp; Omens is not directed at children under 13. We do not knowingly collect
          personal information from children under 13. If you believe a child has provided
          us with personal information, please contact us and we will delete it promptly.
        </Section>

        <Section title="Changes to this policy">
          We may update this policy from time to time. We will post the revised policy on this
          page with an updated &ldquo;Last updated&rdquo; date. Continued use of the service after changes
          constitutes acceptance of the revised policy.
        </Section>

        <Section title="Contact">
          Questions about this privacy policy? Email us at{' '}
          <a href="mailto:hello@dreamsandomens.com" style={{ color: 'var(--cedar)' }}>
            hello@dreamsandomens.com
          </a>.
        </Section>

      </div>

      <footer style={{ textAlign: 'center', marginTop: 40 }}>
        <p className="text-caption" style={{ color: 'var(--owl-brown)', marginBottom: 4 }}>
          © 2026 - DreamsAndOmens.com - All Rights Reserved
        </p>
        <p className="text-caption" style={{ color: 'var(--owl-brown)' }}>
          For entertainment purposes only. Not a substitute for professional advice.
        </p>
      </footer>

    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-primary">
      <h2 className="text-title-m" style={{ color: 'var(--ink)', marginBottom: 10 }}>{title}</h2>
      <div className="text-body" style={{ color: 'var(--text-secondary)', lineHeight: '24px' }}>
        {children}
      </div>
    </div>
  )
}
