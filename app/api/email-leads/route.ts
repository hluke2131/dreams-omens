import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { subscribeToKitForm } from '@/lib/kit'

// Map blog CTA source values to Kit form IDs.
// Only sources in this map trigger a Kit subscription — other sources
// (e.g. future non-lead-magnet captures) are intentionally excluded.
const KIT_FORM_BY_SOURCE: Record<string, number> = {
  blog_dream_cta: 9381629,
  blog_omen_cta:  9381636,
}

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
    }

    const trimmed = email.trim().toLowerCase()
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Upsert so duplicate submissions are silently ignored
    const { error } = await supabase
      .from('email_leads')
      .upsert(
        { email: trimmed, source: source ?? null },
        { onConflict: 'email', ignoreDuplicates: true },
      )

    if (error) {
      console.error('[email-leads] Supabase error:', error.message)
      // Don't leak DB errors to client — just succeed silently
    }

    // Push to Kit only for known lead-magnet sources
    const kitFormId = typeof source === 'string' ? KIT_FORM_BY_SOURCE[source] : undefined
    if (kitFormId) {
      await subscribeToKitForm(trimmed, kitFormId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[email-leads] Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
