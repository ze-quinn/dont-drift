// POST /api/subscribe
// Saves the browser's push subscription to Vercel KV so the cron can use it later.

import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const subscription = req.body
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' })
  }

  try {
    // Store under a fixed key — single user app
    await kv.set('push_subscription', JSON.stringify(subscription))
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('subscribe error:', err)
    return res.status(500).json({ error: 'Failed to save subscription' })
  }
}
