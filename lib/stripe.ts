import Stripe from 'stripe'

/**
 * Server-side Stripe client.
 * Never import this in Client Components.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER', {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

// ─── Product / price catalogue ────────────────────────────────────────────────
//
// After creating products in the Stripe dashboard, paste the price IDs into
// your .env.local.  These are referenced from the checkout API route.
//
//   STRIPE_PRICE_BASIC_MONTHLY        = price_xxxxx   ($2.99/mo)
//   STRIPE_PRICE_REFLECT_PLUS_MONTHLY = price_xxxxx   ($4.99/mo)
//
// ─────────────────────────────────────────────────────────────────────────────

export const PRICE_IDS = {
  basic_monthly:        process.env.STRIPE_PRICE_BASIC_MONTHLY        ?? '',
  reflect_plus_monthly: process.env.STRIPE_PRICE_REFLECT_PLUS_MONTHLY ?? '',
} as const

export type PriceKey = keyof typeof PRICE_IDS

/** Human-readable labels for each plan shown in the UI. */
export const PLAN_LABELS: Record<PriceKey, { name: string; price: string }> = {
  basic_monthly:        { name: 'Basic',    price: '$2.99/month' },
  reflect_plus_monthly: { name: 'Reflect+', price: '$4.99/month' },
}
