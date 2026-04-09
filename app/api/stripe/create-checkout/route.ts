/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout Session for the given price key.
 * Requires the user to be authenticated.
 *
 * Body: { priceKey: 'basic_monthly' | 'reflect_plus_monthly' }
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_IDS, type PriceKey } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let priceKey: PriceKey
  try {
    const body = await req.json()
    priceKey = body.priceKey
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!priceKey || !(priceKey in PRICE_IDS)) {
    return NextResponse.json({ error: 'Invalid priceKey' }, { status: 400 })
  }

  const priceId = PRICE_IDS[priceKey]
  if (!priceId) {
    return NextResponse.json(
      { error: 'Stripe price not configured yet. Add STRIPE_PRICE_* to .env.local.' },
      { status: 503 },
    )
  }

  // Retrieve or create a Stripe customer tied to this user
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer:   customerId,
    mode:       'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings?checkout=success`,
    cancel_url:  `${origin}/paywall?checkout=canceled`,
    metadata: { supabase_user_id: user.id, price_key: priceKey },
  })

  return NextResponse.json({ url: session.url })
}
