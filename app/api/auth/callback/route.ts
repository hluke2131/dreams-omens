/**
 * GET /api/auth/callback
 *
 * Handles the OAuth / magic-link redirect from Supabase.
 * Supabase sends users here after email confirmation or OAuth sign-in.
 * Configure this URL in your Supabase project under:
 *   Authentication → URL Configuration → Redirect URLs
 *   Value: https://yourdomain.com/api/auth/callback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect to home with error param
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
