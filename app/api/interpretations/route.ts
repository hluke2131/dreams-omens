/**
 * DELETE /api/interpretations
 *
 * Deletes one or all interpretation entries for the authenticated user,
 * and cleans up orphaned symbol rows.
 *
 * Body: { id: string }        — delete a single entry
 * Body: { all: true }         — delete all entries for this user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { id?: string; all?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const admin = createAdminClient()

  // ── Delete all ─────────────────────────────────────────────────────────────
  if (body.all) {
    // Collect all interpretation IDs before deleting
    const { data: interps } = await supabase
      .from('interpretations')
      .select('id')
      .eq('user_id', user.id)

    const ids = (interps ?? []).map((r: { id: string }) => r.id)

    if (ids.length > 0) {
      await cleanupSymbols(admin, user.id, ids)
    }

    const { error } = await supabase
      .from('interpretations')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete interpretations' }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: ids.length })
  }

  // ── Delete single ──────────────────────────────────────────────────────────
  if (body.id) {
    // Verify the interpretation belongs to this user
    const { data: interp } = await supabase
      .from('interpretations')
      .select('id')
      .eq('id', body.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!interp) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await cleanupSymbols(admin, user.id, [body.id])

    const { error } = await supabase
      .from('interpretations')
      .delete()
      .eq('id', body.id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete interpretation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Provide id or all: true' }, { status: 400 })
}

/**
 * Remove deleted interpretation IDs from symbol rows.
 * Decrements count accordingly; deletes symbol row if count reaches 0.
 */
async function cleanupSymbols(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin:              any,
  userId:             string,
  deletedInterpIds:   string[],
): Promise<void> {
  const { data: symbols } = await admin
    .from('symbols')
    .select('id, count, interpretation_ids')
    .eq('user_id', userId)

  for (const sym of (symbols ?? [])) {
    const ids: string[] = sym.interpretation_ids ?? []
    const newIds = ids.filter((id: string) => !deletedInterpIds.includes(id))

    if (newIds.length === ids.length) continue // symbol not affected

    if (newIds.length === 0) {
      await admin.from('symbols').delete().eq('id', sym.id)
    } else {
      await admin.from('symbols').update({
        count:              newIds.length,
        interpretation_ids: newIds,
      }).eq('id', sym.id)
    }
  }
}
