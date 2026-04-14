/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout Session for the given price key.
 * Requires the user to be authenticated.
 *
 * Body: { priceKey: 'basic_monthly' | 'reflect_plus_monthly', source?: 'gate' }
 *
 * Discount logic:
 *   source = 'gate'  → first-month $0.99 offer, applied server-side via
 *                       STRIPE_COUPON_GATE_BASIC / STRIPE_COUPON_GATE_REFLECT_PLUS
 *   source = omitted → full price, no server-side coupon
 *
 * The Stripe Checkout promotion-code field is always enabled, so customers
 * can enter the DREAMS2 promo code (email popup offer) on any checkout.
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_IDS, type PriceKey } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Gate-screen first-month discount coupons (server-applied, not customer-entered)
const GATE_COUPON_IDS: Record<PriceKey, string | undefined> = {
  basic_monthly:        process.env.STRIPE_COUPON_GATE_BASIC          || undefined,
  reflect_plus_monthly: process.env.STRIPE_COUPON_GATE_REFLECT_PLUS   || undefined,
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let priceKey: PriceKey
  let source: string | undefined
  try {
    const body = await req.json()
    priceKey = body.priceKey
    source   = body.source
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

  // Gate-screen checkout: apply server-side first-month coupon
  const gateCouponId = source === 'gate' ? GATE_COUPON_IDS[priceKey] : undefined
  const discounts    = gateCouponId ? [{ coupon: gateCouponId }] : undefined

  const session = await stripe.checkout.sessions.create({
    customer:              customerId,
    mode:                  'subscription',
    line_items:            [{ price: priceId, quantity: 1 }],
    ...(discounts ? { discounts } : {}),
    // Allow customers to enter promo codes (e.g. DREAMS2 from email popup)
    // Note: allow_promotion_codes cannot be set when discounts is also set,
    // so it only activates on standard and DREAMS2 flows (not gate).
    ...(discounts ? {} : { allow_promotion_codes: true }),
    success_url: `${origin}/account?checkout=success`,
    cancel_url:  `${origin}/paywall`,
    metadata:    { supabase_user_id: user.id, price_key: priceKey },
  })

  return NextResponse.json({ url: session.url })
}
