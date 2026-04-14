/**
 * POST /api/symbols/insight
 *
 * Generates (and caches in Supabase) a one-sentence AI insight for a symbol.
 * Called from the history page for symbols that don't yet have an insight cached.
 * Only callable by authenticated Reflect+ subscribers.
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface InsightRequest {
  symbolId: string
  name:     string
  count:    number
}

export async function POST(req: NextRequest) {
  // ── Auth & Reflect+ check ─────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single()

  const isReflectPlus =
    profile?.subscription_status === 'active' &&
    profile?.subscription_tier === 'reflect_plus'

  if (!isReflectPlus) {
    return NextResponse.json({ error: 'Reflect+ subscription required' }, { status: 403 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: InsightRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { symbolId, name, count } = body

  if (!symbolId || !name || typeof count !== 'number') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // ── Check cache first ─────────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from('symbols')
    .select('insight')
    .eq('id', symbolId)
    .eq('user_id', user.id)
    .single()

  if (existing?.insight) {
    return NextResponse.json({ insight: existing.insight })
  }

  // ── Generate insight ──────────────────────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }

  const openai = new OpenAI({ apiKey })

  try {
    const response = await openai.chat.completions.create({
      model:       'gpt-4o-mini',
      temperature: 0.6,
      max_tokens:  80,
      messages: [
        {
          role:    'system',
          content: 'You write warm, grounded, practical insights in one sentence.',
        },
        {
          role:    'user',
          content: `The user has dreamed of ${name} ${count} ${count === 1 ? 'time' : 'times'}. What might this pattern suggest? Keep it to one sentence, warm and reflective.`,
        },
      ],
    })

    const insight = response.choices[0]?.message?.content?.trim() ?? ''

    // Cache in Supabase (use admin to ensure the update lands)
    const admin = createAdminClient()
    await admin
      .from('symbols')
      .update({ insight })
      .eq('id', symbolId)

    return NextResponse.json({ insight })
  } catch (err) {
    console.error('[symbols/insight] OpenAI error:', err)
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 })
  }
}
