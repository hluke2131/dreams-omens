import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SOURCE = 'landing_dream_symbols_101'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: true }) // don't block PDF delivery
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

    if (error) console.error('[dream-symbols-capture] Supabase error:', error.message)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[dream-symbols-capture] Unexpected error:', err)
    return NextResponse.json({ ok: true }) // always return ok — PDF delivery is the promise
  }
}
