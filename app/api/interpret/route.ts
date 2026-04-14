/**
 * POST /api/interpret
 *
 * Server-side proxy for all OpenAI interpretation calls.
 * The OpenAI API key is NEVER exposed to the client.
 *
 * - Free tier (logged out or subscription_tier = 'free'): 3/month cap, enforced here
 * - Basic / Reflect+: unlimited — no cap enforced
 */

import { NextRequest, NextResponse } from 'next/server'
import { getInterpretation } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'
import type { InterpretRequest, InterpretResponse } from '@/lib/types'
import { FREE_MONTHLY_LIMIT } from '@/lib/types'

export async function POST(req: NextRequest) {
  // ── Parse & validate request body ────────────────────────────────────────
  let body: InterpretRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { type, text, tags, lens, concise } = body

  if (!type || !['dream', 'omen'].includes(type)) {
    return NextResponse.json({ error: 'type must be "dream" or "omen"' }, { status: 400 })
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  if (text.length > 1200) {
    return NextResponse.json({ error: 'text exceeds 1200 character limit' }, { status: 400 })
  }

  // ── Auth & subscription check ─────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isFreeTier = true // default: treat unauthenticated users as free

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, monthly_interpretation_count, monthly_count_reset_date')
      .eq('id', user.id)
      .single()

    const isPaidActive =
      profile?.subscription_status === 'active' &&
      (profile?.subscription_tier === 'basic' || profile?.subscription_tier === 'reflect_plus')

    if (isPaidActive) {
      isFreeTier = false // paid subscribers bypass the monthly cap entirely
    } else {
      // Free tier — enforce monthly cap server-side
      const today      = new Date().toISOString().substring(0, 7) // YYYY-MM
      const resetMonth = (profile?.monthly_count_reset_date ?? '').substring(0, 7)

      let currentCount = profile?.monthly_interpretation_count ?? 0
      if (today !== resetMonth) {
        currentCount = 0
        await supabase
          .from('profiles')
          .update({
            monthly_interpretation_count: 0,
            monthly_count_reset_date:     new Date().toISOString().split('T')[0],
          })
          .eq('id', user.id)
      }

      if (currentCount >= FREE_MONTHLY_LIMIT) {
        return NextResponse.json(
          { error: 'Monthly interpretation limit reached. Upgrade to continue.' },
          { status: 429 },
        )
      }
    }
  }

  // ── Call OpenAI ───────────────────────────────────────────────────────────
  try {
    const result = await getInterpretation({ type, text, tags, lens, concise })

    // Increment server-side counter for authenticated free-tier users only
    if (user && isFreeTier) {
      await supabase.rpc('increment_monthly_usage', { uid: user.id })
    }

    return NextResponse.json<InterpretResponse>({ result })
  } catch (err) {
    console.error('[/api/interpret] OpenAI error:', err)

    const isTimeout =
      err instanceof Error &&
      (err.message.includes('timeout') || err.message.includes('ETIMEDOUT'))

    if (isTimeout) {
      return NextResponse.json(
        { error: 'The interpretation is taking longer than expected. Please check your internet connection and try again.' },
        { status: 504 },
      )
    }

    return NextResponse.json(
      { error: "We couldn't get an interpretation." },
      { status: 500 },
    )
  }
}
