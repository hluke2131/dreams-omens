'use client'

/**
 * CheckoutButton
 *
 * Handles the full Stripe Checkout flow from the client:
 *   1. If not logged in → redirect to /auth/sign-in?next=<returnPath>
 *   2. POST /api/stripe/create-checkout with the given priceKey
 *   3. Redirect to Stripe Checkout URL
 *
 * Usage:
 *   <CheckoutButton priceKey="basic_monthly">Get Basic</CheckoutButton>
 *   <CheckoutButton priceKey="reflect_plus_monthly" returnPath="/paywall">Get Reflect+</CheckoutButton>
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PriceKey } from '@/lib/stripe'

interface Props {
  priceKey: PriceKey
  /** Where to send the user after sign-in if not logged in. Defaults to /paywall */
  returnPath?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export default function CheckoutButton({
  priceKey,
  returnPath = '/paywall',
  className,
  style,
  children,
}: Props) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Not logged in — redirect to sign-in, come back to returnPath after
      const next = encodeURIComponent(returnPath)
      router.push(`/auth/sign-in?next=${next}`)
      return
    }

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ priceKey }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Could not start checkout. Please try again.')
        setLoading(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className}
        style={style}
      >
        {loading ? 'Loading…' : children}
      </button>
      {error && (
        <p
          className="text-helper"
          style={{ color: 'var(--cedar)', marginTop: 8, textAlign: 'center' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
