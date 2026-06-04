// POST /api/subscribe
// Saves the push subscription to Vercel Edge Config via the Vercel API.
// Edge Config is free, built into Vercel — no third-party service needed.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const subscription = req.body
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' })
  }

  const edgeConfigId = process.env.EDGE_CONFIG_ID       // e.g. ecfg_xxxx
  const vercelToken  = process.env.VERCEL_API_TOKEN      // from Vercel account settings

  if (!edgeConfigId || !vercelToken) {
    return res.status(500).json({ error: 'Edge Config not configured' })
  }

  try {
    const r = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ operation: 'upsert', key: 'push_subscription', value: JSON.stringify(subscription) }],
        }),
      }
    )
    if (!r.ok) {
      const txt = await r.text()
      throw new Error(`Vercel API ${r.status}: ${txt}`)
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('subscribe error:', err)
    return res.status(500).json({ error: err.message })
  }
}
