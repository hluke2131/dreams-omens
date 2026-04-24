import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const supabase = await createClient()

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

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[email-leads] Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
