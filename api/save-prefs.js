// POST /api/save-prefs
// Saves notification preferences (time + topic) to Vercel Edge Config.
// Called when the user updates their notification settings.

async function edgeConfigUpsert(items) {
  const edgeConfigId = process.env.EDGE_CONFIG_ID
  const vercelToken  = process.env.VERCEL_API_TOKEN
  const r = await fetch(
    `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    }
  )
  if (!r.ok) throw new Error(`Vercel API ${r.status}: ${await r.text()}`)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { hour, minute, topic } = req.body ?? {}

  if (hour == null || minute == null || !topic) {
    return res.status(400).json({ error: 'hour, minute and topic are required' })
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return res.status(400).json({ error: 'Invalid time values' })
  }

  try {
    await edgeConfigUpsert([
      { operation: 'upsert', key: 'notif_prefs', value: JSON.stringify({ hour, minute, topic }) },
    ])
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('save-prefs error:', err)
    return res.status(500).json({ error: err.message })
  }
}
