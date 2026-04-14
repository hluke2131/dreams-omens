import { createClient } from '@supabase/supabase-js'

/**
 * Supabase admin client — uses the SERVICE ROLE key.
 *
 * This client bypasses Row Level Security and should only ever be used
 * in server-side API routes that are NOT reachable by end users without
 * authentication (e.g. Stripe webhook, background jobs).
 *
 * NEVER import this in Client Components or expose it to the browser.
 */
export function createAdminClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !svcKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, svcKey, {
    auth: {
      // Service role clients must not persist sessions or auto-refresh tokens
      autoRefreshToken:  false,
      persistSession:    false,
      detectSessionInUrl: false,
    },
  })
}
