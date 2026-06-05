// POST /api/save-prefs
// Saves notification schedules (array of { id, hour, minute, topic }) to Vercel Edge Config.

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

  const { schedules } = req.body ?? {}

  if (!Array.isArray(schedules) || schedules.length === 0) {
    return res.status(400).json({ error: 'schedules array required' })
  }
  if (schedules.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 notification schedules' })
  }

  for (const s of schedules) {
    if (s.hour == null || s.minute == null || !s.topic) {
      return res.status(400).json({ error: 'Each schedule needs hour, minute, topic' })
    }
    if (s.hour < 0 || s.hour > 23 || s.minute < 0 || s.minute > 59) {
      return res.status(400).json({ error: `Invalid time: ${s.hour}:${s.minute}` })
    }
  }

  try {
    await edgeConfigUpsert([
      { operation: 'upsert', key: 'notif_prefs', value: JSON.stringify(schedules) },
    ])
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('save-prefs error:', err)
    return res.status(500).json({ error: err.message })
  }
}
