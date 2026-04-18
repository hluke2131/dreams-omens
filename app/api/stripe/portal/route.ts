/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session so subscribers can manage/cancel
 * their subscription.  Requires the user to be authenticated.
 *
 * Handles stale / test-mode customer IDs gracefully:
 *   1. If the stored stripe_customer_id returns resource_missing, clear it.
 *   2. Look up an existing live-mode customer by email.
 *   3. Create a new customer if none found.
 *   4. Persist the new ID and create the portal session.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // ── Resolve a valid live-mode Stripe customer ID ──────────────────────────

  let customerId: string | null = profile?.stripe_customer_id ?? null

  // If we have a stored ID, verify it actually exists in this Stripe mode
  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId)
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError && err.code === 'resource_missing') {
        // Stale ID (e.g. from test mode) — clear it and fall through to lookup
        console.warn('[portal] Stored customer ID not found in Stripe — clearing:', customerId)
        customerId = null
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: null })
          .eq('id', user.id)
      } else {
        throw err
      }
    }
  }

  // No valid customer on file — look up by email, then create if necessary
  if (!customerId) {
    const email = user.email
    if (!email) {
      return NextResponse.json({ error: 'User email required to create customer' }, { status: 400 })
    }

    // Search for an existing live-mode customer with this email
    const existing = await stripe.customers.list({ email, limit: 1 })

    if (existing.data.length > 0) {
      customerId = existing.data[0].id
      console.log('[portal] Found existing Stripe customer by email:', customerId)
    } else {
      const created = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = created.id
      console.log('[portal] Created new Stripe customer:', customerId)
    }

    // Persist so future requests skip this lookup
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // ── Create the portal session ─────────────────────────────────────────────

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   customerId,
    return_url: `${origin}/account`,
  })

  return NextResponse.json({ url: portalSession.url })
}
