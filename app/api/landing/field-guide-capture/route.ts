import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { subscribeToKitForm } from '@/lib/kit'

const SOURCE   = 'landing_signs_symbols_field_guide'
const KIT_FORM = 9381636

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: true })
    }

    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ ok: true })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('email_leads')
      .upsert(
        { email: trimmed, source: SOURCE },
        { onConflict: 'email', ignoreDuplicates: true },
      )

    if (error) console.error('[field-guide-capture] Supabase error:', error.message)

    await subscribeToKitForm(trimmed, KIT_FORM)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[field-guide-capture] Unexpected error:', err)
    return NextResponse.json({ ok: true })
  }
}
