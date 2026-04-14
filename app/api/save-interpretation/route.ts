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
    console.warn('[save-interpretation] Rejected: invalid JSON body')
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
    console.error('[save-interpretation] Upsert error:', insertError)
    return NextResponse.json({ error: 'Failed to save interpretation' }, { status: 500 })
  }

  console.log('[save-interpretation] Upsert succeeded for id:', id)

  // ── Symbol extraction ────────────────────────────────────────────────────
  // IMPORTANT: must be awaited before returning — Vercel terminates the
  // serverless function execution context the moment the response is sent,
  // killing any fire-and-forget work that hasn't completed yet.
  try {
    await extractAndSaveSymbols(user.id, id, result)
  } catch (err) {
    // Log but don't fail the response — the interpretation save already succeeded.
    console.error('[save-interpretation] Symbol extraction threw unexpectedly:', err)
  }

  return NextResponse.json({ success: true })
}

async function extractAndSaveSymbols(
  userId:           string,
  interpretationId: string,
  resultText:       string,
): Promise<void> {
  console.log('[save-interpretation] Starting symbol extraction for id:', interpretationId)

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[save-interpretation] Symbol extraction skipped: OPENAI_API_KEY not set')
    return
  }

  // ── Call OpenAI to extract symbols ───────────────────────────────────────
  let raw: string
  try {
    const openai   = new OpenAI({ apiKey })
    const response = await openai.chat.completions.create({
      model:       'gpt-4o-mini',
      temperature: 0,
      max_tokens:  100,
      messages: [
        {
          role:    'system',
          content: "You are a symbol extraction tool. From the following dream/omen interpretation, extract 1-5 key symbols (single words or short phrases like 'water', 'falling', 'teeth', 'black cat'). Return ONLY a JSON array of strings. No explanation, no markdown, just the array.",
        },
        {
          role:    'user',
          content: resultText,
        },
      ],
    })
    raw = response.choices[0]?.message?.content?.trim() ?? '[]'
    console.log('[save-interpretation] OpenAI raw symbol response:', raw)
  } catch (err) {
    console.error('[save-interpretation] OpenAI symbol extraction call failed:', err)
    return
  }

  // ── Parse the JSON array ─────────────────────────────────────────────────
  let symbols: string[]
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      console.warn('[save-interpretation] Symbol response was not an array:', raw)
      return
    }
    symbols = parsed
      .filter((s: unknown) => typeof s === 'string' && (s as string).trim().length > 0)
      .map((s: string) => s.trim().toLowerCase())
      .slice(0, 5)
  } catch {
    console.error('[save-interpretation] Failed to parse symbol JSON:', raw)
    return
  }

  if (symbols.length === 0) {
    console.warn('[save-interpretation] No usable symbols extracted from response:', raw)
    return
  }

  console.log('[save-interpretation] Extracted symbols:', symbols)

  // ── Upsert symbols (admin client bypasses RLS) ───────────────────────────
  const admin = createAdminClient()

  for (const symbol of symbols) {
    console.log('[save-interpretation] Upserting symbol:', symbol)

    const { data: existing, error: selectErr } = await admin
      .from('symbols')
      .select('id, count, interpretation_ids')
      .eq('user_id', userId)
      .eq('name', symbol)
      .single()

    if (selectErr && selectErr.code !== 'PGRST116') {
      // PGRST116 = "no rows returned" — not an error, means it's a new symbol
      console.error('[save-interpretation] Symbol select error for', symbol, ':', selectErr)
      continue
    }

    if (existing) {
      const ids = existing.interpretation_ids ?? []
      if (ids.includes(interpretationId)) {
        console.log('[save-interpretation] Symbol', symbol, 'already linked to this interpretation — skipping')
        continue
      }
      const { error: updateErr } = await admin
        .from('symbols')
        .update({
          count:              existing.count + 1,
          last_seen_at:       new Date().toISOString(),
          interpretation_ids: [...ids, interpretationId],
        })
        .eq('id', existing.id)

      if (updateErr) console.error('[save-interpretation] Symbol update error for', symbol, ':', updateErr)
      else console.log('[save-interpretation] Symbol', symbol, 'incremented to count', existing.count + 1)
    } else {
      const { error: insertErr } = await admin
        .from('symbols')
        .insert({
          user_id:            userId,
          name:               symbol,
          count:              1,
          last_seen_at:       new Date().toISOString(),
          interpretation_ids: [interpretationId],
        })

      if (insertErr) console.error('[save-interpretation] Symbol insert error for', symbol, ':', insertErr)
      else console.log('[save-interpretation] Symbol', symbol, 'inserted with count 1')
    }
  }

  console.log('[save-interpretation] Symbol extraction complete for id:', interpretationId)
}
