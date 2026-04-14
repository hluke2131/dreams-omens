/**
 * POST /api/stripe/webhook
 *
 * Stripe sends signed webhook events here.
 * Uses the SERVICE ROLE Supabase client to bypass RLS — required because
 * there is no authenticated user session in a webhook request.
 *
 * Events handled:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *
 * NOTE — API version 2026-03-25.dahlia:
 *   current_period_end was removed from the Subscription object and is
 *   now on each SubscriptionItem (subscription.items.data[0].current_period_end).
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export const runtime = 'nodejs'

function tierFromPriceKey(priceKey: string | undefined): 'basic' | 'reflect_plus' {
  if (priceKey === 'reflect_plus_monthly') return 'reflect_plus'
  return 'basic'
}

/** Returns the period-end ISO string from a subscription in API v2026-03-25.dahlia+ */
function periodEnd(sub: Stripe.Subscription): string | null {
  const ts = sub.items?.data?.[0]?.current_period_end
  if (!ts) return null
  return new Date(ts * 1000).toISOString()
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

  console.log(`[stripe/webhook] Received event: ${event.type} (${event.id})`)

  // Use service role client — bypasses RLS, required for webhook context
  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session  = event.data.object as Stripe.Checkout.Session
        const userId   = session.metadata?.supabase_user_id
        const priceKey = session.metadata?.price_key

        console.log('[stripe/webhook] checkout.session.completed', {
          sessionId:    session.id,
          userId,
          priceKey,
          subscription: session.subscription,
          customer:     session.customer,
        })

        if (!userId) {
          console.error('[stripe/webhook] No supabase_user_id in session metadata — cannot update profile')
          break
        }

        // Verify the profile row exists before attempting update
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, subscription_tier')
          .eq('id', userId)
          .single()

        if (fetchError || !existingProfile) {
          console.error('[stripe/webhook] Profile not found for userId:', userId, fetchError)
          break
        }

        console.log('[stripe/webhook] Found profile:', existingProfile)

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          { expand: ['items'] },
        )

        console.log('[stripe/webhook] Retrieved subscription:', {
          id:         subscription.id,
          status:     subscription.status,
          periodEnd:  periodEnd(subscription),
          itemsCount: subscription.items?.data?.length,
        })

        const tier = tierFromPriceKey(priceKey)
        const updatePayload = {
          subscription_tier:       tier,
          stripe_subscription_id:  subscription.id,
          subscription_status:     subscription.status,
          subscription_period_end: periodEnd(subscription),
        }

        console.log('[stripe/webhook] Updating profile with:', updatePayload)

        const { error: updateError, count } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId)

        if (updateError) {
          console.error('[stripe/webhook] Supabase update error:', updateError)
        } else {
          console.log(`[stripe/webhook] Profile updated successfully (rows affected: ${count}), tier → ${tier}`)
        }

        break
      }

      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id

        console.log('[stripe/webhook] customer.subscription.updated', {
          subscriptionId: sub.id,
          status:         sub.status,
          userId,
          customer:       sub.customer,
        })

        if (!userId) {
          // Fall back to looking up by stripe_customer_id
          const { data, error: lookupError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', sub.customer as string)
            .single()

          if (lookupError || !data) {
            console.error('[stripe/webhook] No profile found for customer:', sub.customer, lookupError)
            break
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              subscription_status:     sub.status,
              subscription_period_end: periodEnd(sub),
            })
            .eq('id', data.id)

          if (updateError) {
            console.error('[stripe/webhook] Supabase update error (by customer):', updateError)
          } else {
            console.log('[stripe/webhook] Profile updated (by customer lookup)')
          }
          break
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status:     sub.status,
            subscription_period_end: periodEnd(sub),
          })
          .eq('id', userId)

        if (updateError) {
          console.error('[stripe/webhook] Supabase update error (by userId):', updateError)
        } else {
          console.log('[stripe/webhook] Profile updated (by userId)')
        }

        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        console.log('[stripe/webhook] customer.subscription.deleted', {
          subscriptionId: sub.id,
          customer:       sub.customer,
        })

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_tier:       'free',
            subscription_status:     'canceled',
            stripe_subscription_id:  null,
            subscription_period_end: null,
          })
          .eq('stripe_subscription_id', sub.id)

        if (updateError) {
          console.error('[stripe/webhook] Supabase update error (deletion):', updateError)
        } else {
          console.log('[stripe/webhook] Profile downgraded to free')
        }

        break
      }

      default:
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`)
        break
    }
  } catch (err) {
    console.error(`[stripe/webhook] Unexpected error handling ${event.type}:`, err)
  }

  return NextResponse.json({ received: true })
}
