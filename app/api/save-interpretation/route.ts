/**
 * POST /api/save-interpretation
 *
 * Cloud-saves an interpretation for Reflect+ subscribers and
 * triggers symbol extraction as a second OpenAI call.
 *
 * Only callable by authenticated Reflect+ subscribers.
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { InterpretationType, LensType } from '@/lib/types'

interface SaveRequest {
  id:     string
  type:   InterpretationType
  input:  string
  tags:   string[]
  lens:   LensType
  result: string
}

export async function POST(req: NextRequest) {
  console.log('[save-interpretation] Request received')

  // ── Auth & Reflect+ check ────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.warn('[save-interpretation] Rejected: no authenticated user')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[save-interpretation] Authenticated user:', user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single()

  console.log('[save-interpretation] Profile:', profile?.subscription_tier, profile?.subscription_status)

  const isReflectPlus =
    profile?.subscription_status === 'active' &&
    profile?.subscription_tier === 'reflect_plus'

  if (!isReflectPlus) {
    console.warn('[save-interpretation] Rejected: not Reflect+ (tier:', profile?.subscription_tier, 'status:', profile?.subscription_status, ')')
    return NextResponse.json({ error: 'Reflect+ subscription required' }, { status: 403 })
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: SaveRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id, type, input, tags, lens, result } = body

  if (!id || !type || !input || !result) {
    console.warn('[save-interpretation] Rejected: missing fields — id:', !!id, 'type:', !!type, 'input:', !!input, 'result:', !!result)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  console.log('[save-interpretation] Saving id:', id, 'type:', type)

  // ── Upsert interpretation (idempotent on re-save) ────────────────────────
  const { error: insertError } = await supabase
    .from('interpretations')
    .upsert({
      id,
      user_id: user.id,
      type,
      input,
      tags:   tags ?? [],
      lens:   lens ?? 'none',
      result,
    })

  if (insertError) {
    console.error('[save-interpretation] insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save interpretation' }, { status: 500 })
  }

  console.log('[save-interpretation] Upsert succeeded for id:', id)

  // ── Symbol extraction ────────────────────────────────────────────────────
  // Fire-and-forget: we don't block the response on symbol extraction.
  // Errors here are logged but don't fail the save.
  extractAndSaveSymbols(user.id, id, result).catch(err =>
    console.error('[save-interpretation] symbol extraction error:', err),
  )

  return NextResponse.json({ success: true })
}

async function extractAndSaveSymbols(
  userId:           string,
  interpretationId: string,
  resultText:       string,
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return

  const openai = new OpenAI({ apiKey })

  const response = await openai.chat.completions.create({
    model:       'gpt-4o-mini',
    temperature: 0,
    max_tokens:  100,
    messages: [
      {
        role:    'system',
        content: 'You are a symbol extraction tool. From the following dream/omen interpretation, extract 1-5 key symbols (single words or short phrases like \'water\', \'falling\', \'teeth\', \'black cat\'). Return ONLY a JSON array of strings. No explanation, no markdown, just the array.',
      },
      {
        role:    'user',
        content: resultText,
      },
    ],
  })

  const raw = response.choices[0]?.message?.content?.trim() ?? '[]'

  let symbols: string[]
  try {
    symbols = JSON.parse(raw)
    if (!Array.isArray(symbols)) return
    symbols = symbols
      .filter(s => typeof s === 'string' && s.trim().length > 0)
      .map(s => s.trim().toLowerCase())
      .slice(0, 5)
  } catch {
    return
  }

  if (symbols.length === 0) return

  // Use Supabase admin to bypass RLS for upsert
  const admin = createAdminClient()

  for (const symbol of symbols) {
    // Try to increment if exists, otherwise insert
    const { data: existing } = await admin
      .from('symbols')
      .select('id, count, interpretation_ids')
      .eq('user_id', userId)
      .eq('name', symbol)
      .single()

    if (existing) {
      const ids = existing.interpretation_ids ?? []
      if (!ids.includes(interpretationId)) {
        await admin
          .from('symbols')
          .update({
            count:              existing.count + 1,
            last_seen_at:       new Date().toISOString(),
            interpretation_ids: [...ids, interpretationId],
          })
          .eq('id', existing.id)
      }
    } else {
      await admin
        .from('symbols')
        .insert({
          user_id:            userId,
          name:               symbol,
          count:              1,
          last_seen_at:       new Date().toISOString(),
          interpretation_ids: [interpretationId],
        })
    }
  }
}
