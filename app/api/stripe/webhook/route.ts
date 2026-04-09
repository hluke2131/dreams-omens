/**
 * POST /api/stripe/webhook
 *
 * Stripe sends signed webhook events here.
 * This route updates the profiles table when subscription status changes.
 *
 * Required env var: STRIPE_WEBHOOK_SECRET
 * Set up the webhook endpoint in the Stripe dashboard pointing to:
 *   https://yourdomain.com/api/stripe/webhook
 *
 * Events handled:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Next.js 13+ App Router requires this to read the raw body for signature verification
export const runtime = 'nodejs'

function tierFromPriceKey(priceKey: string | undefined): 'basic' | 'reflect_plus' {
  if (priceKey === 'reflect_plus_monthly') return 'reflect_plus'
  return 'basic'
}

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId  = session.metadata?.supabase_user_id
      const priceKey = session.metadata?.price_key

      if (!userId) break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

      await supabase
        .from('profiles')
        .update({
          subscription_tier:        tierFromPriceKey(priceKey),
          stripe_subscription_id:   subscription.id,
          subscription_status:      subscription.status,
          subscription_period_end:  new Date((subscription as any).current_period_end * 1000).toISOString(),
        })
        .eq('id', userId)

      break
    }

    case 'customer.subscription.updated': {
      const sub    = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id

      if (!userId) {
        // Fall back to looking up by stripe_customer_id
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', sub.customer as string)
          .single()

        if (data) {
          await supabase
            .from('profiles')
            .update({
              subscription_status:     sub.status,
              subscription_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', data.id)
        }
        break
      }

      await supabase
        .from('profiles')
        .update({
          subscription_status:     sub.status,
          subscription_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        })
        .eq('id', userId)

      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await supabase
        .from('profiles')
        .update({
          subscription_tier:       'free',
          subscription_status:     'canceled',
          stripe_subscription_id:  null,
          subscription_period_end: null,
        })
        .eq('stripe_subscription_id', sub.id)

      break
    }

    default:
      // Unhandled event — return 200 so Stripe doesn't retry
      break
  }

  return NextResponse.json({ received: true })
}
