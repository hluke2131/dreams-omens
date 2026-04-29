const KIT_API_BASE = 'https://api.kit.com/v4'

/**
 * Subscribe an email address to a Kit form.
 *
 * Best-effort: logs failures server-side but never throws, so a Kit
 * outage cannot break the caller's funnel or the Supabase write.
 *
 * No-ops if KIT_API_KEY is not set — the route still works in
 * environments where Kit isn't configured (local dev, staging).
 */
export async function subscribeToKitForm(
  email:  string,
  formId: number,
): Promise<void> {
  const apiKey = process.env.KIT_API_KEY

  if (!apiKey) {
    console.warn('[kit] KIT_API_KEY not set — skipping Kit subscription')
    return
  }

  try {
    const res = await fetch(`${KIT_API_BASE}/forms/${formId}/subscribers`, {
      method:  'POST',
      headers: {
        'X-Kit-Api-Key': apiKey,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ email_address: email }),
    })

    // 200 = already subscribed, 201 = newly subscribed — both are fine
    if (res.status !== 200 && res.status !== 201) {
      console.error(`[kit] Unexpected status ${res.status} subscribing ${email} to form ${formId}`)
    }
  } catch (err) {
    console.error(`[kit] Fetch error subscribing to form ${formId}:`, err)
  }
}
