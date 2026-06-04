// POST /api/subscribe
// Saves the browser's push subscription to Upstash Redis (REST API).

async function kvSet(key, value) {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })
  if (!res.ok) throw new Error(`Upstash set failed: ${res.status}`)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const subscription = req.body
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' })
  }

  try {
    await kvSet('push_subscription', JSON.stringify(subscription))
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('subscribe error:', err)
    return res.status(500).json({ error: 'Failed to save subscription' })
  }
}
