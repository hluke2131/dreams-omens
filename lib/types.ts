// ─── Core domain types ────────────────────────────────────────────────────────

export type InterpretationType = 'dream' | 'omen'

export type LensType = 'none' | 'archetypal' | 'cognitive' | 'cultural'

export type SubscriptionTier = 'free' | 'basic' | 'reflect_plus'

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled'

export const DREAM_TAGS = ['Nightmare', 'Lucid', 'Recurring', 'Vivid', 'Symbolic'] as const
export const OMEN_TAGS  = ['Animals', 'Numbers', 'Nature', 'Patterns', 'Synchronicity'] as const

export type DreamTag = (typeof DREAM_TAGS)[number]
export type OmenTag  = (typeof OMEN_TAGS)[number]

// ─── Interpretation ───────────────────────────────────────────────────────────

export interface Interpretation {
  /** Date.now().toString(); lens re-interpretations: "{timestamp}_{lens}" */
  id:     string
  date:   Date
  type:   InterpretationType
  input:  string
  tags:   string[]
  lens:   LensType
  result: string
}

// ─── Supabase DB row shapes ───────────────────────────────────────────────────

export interface ProfileRow {
  id:                           string
  email:                        string | null
  subscription_tier:            SubscriptionTier
  stripe_customer_id:           string | null
  stripe_subscription_id:       string | null
  subscription_status:          SubscriptionStatus
  subscription_period_end:      string | null
  monthly_interpretation_count: number
  monthly_count_reset_date:     string
  created_at:                   string
  updated_at:                   string
}

export interface InterpretationRow {
  id:         string
  user_id:    string
  type:       InterpretationType
  input:      string
  tags:       string[]
  lens:       LensType
  result:     string
  created_at: string
}

export interface SymbolRow {
  id:                 string
  user_id:            string
  name:               string
  count:              number
  last_seen_at:       string
  interpretation_ids: string[]
  created_at:         string
}

export interface UserSettingsRow {
  user_id:         string
  concise_answers: boolean
  created_at:      string
  updated_at:      string
}

// ─── API request / response shapes ───────────────────────────────────────────

export interface InterpretRequest {
  type:  InterpretationType
  text:  string
  tags?: string[]
  lens?: LensType
  /** Only sent when user has concise mode on (Reflect+ only) */
  concise?: boolean
}

export interface InterpretResponse {
  result: string
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

export const STRIPE_PRICES = {
  basic_monthly:        process.env.STRIPE_PRICE_BASIC_MONTHLY        ?? '',
  reflect_plus_monthly: process.env.STRIPE_PRICE_REFLECT_PLUS_MONTHLY ?? '',
} as const

// ─── Usage gating (free tier) ─────────────────────────────────────────────────

export const FREE_MONTHLY_LIMIT = 3

/** localStorage key format: interpret_count_month_YYYY-MM */
export function monthlyUsageKey(): string {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm   = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `interpret_count_month_${yyyy}-${mm}`
}

/** Returns current month's usage count from localStorage (client only). */
export function getMonthlyUsage(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(monthlyUsageKey()) ?? '0', 10)
}

/** Increments after a successful interpretation (client only). */
export function incrementMonthlyUsage(): void {
  if (typeof window === 'undefined') return
  const key     = monthlyUsageKey()
  const current = parseInt(localStorage.getItem(key) ?? '0', 10)
  localStorage.setItem(key, String(current + 1))
}
