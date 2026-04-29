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

  // Step 1 — create/find the subscriber
  let subscriberId: number
  try {
    const res1 = await fetch(`${KIT_API_BASE}/subscribers`, {
      method:  'POST',
      headers: {
        'X-Kit-Api-Key': apiKey,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ email_address: email }),
    })

    if (res1.status !== 200 && res1.status !== 201) {
      const body = await res1.text()
      console.error(`[kit] Step 1 failed (status ${res1.status}) for ${email}:`, body)
      return
    }

    const data = await res1.json() as { subscriber?: { id?: number } }
    const id = data?.subscriber?.id
    if (!id) {
      console.warn('[kit] Step 1 response missing subscriber.id — skipping form add')
      return
    }
    subscriberId = id
  } catch (err) {
    console.error('[kit] Step 1 fetch error:', err)
    return
  }

  // Step 2 — add subscriber to the form
  try {
    const res2 = await fetch(`${KIT_API_BASE}/forms/${formId}/subscribers/${subscriberId}`, {
      method:  'POST',
      headers: { 'X-Kit-Api-Key': apiKey },
    })

    if (res2.status !== 200 && res2.status !== 201) {
      const body = await res2.text()
      console.error(`[kit] Step 2 failed (status ${res2.status}) adding subscriber to form ${formId}:`, body)
    }
  } catch (err) {
    console.error(`[kit] Step 2 fetch error adding subscriber to form ${formId}:`, err)
  }
}
