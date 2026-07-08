// POST /api/subscribe
// Saves the push subscription to Supabase, keyed by user_id from the JWT.

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const subscription = req.body
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' })
  }

  const jwt = (req.headers.authorization ?? '').replace('Bearer ', '')
  if (!jwt) return res.status(401).json({ error: 'Missing auth token' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Verify the JWT and get the user
  const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt)
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' })

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: user.id, subscription, updated_at: new Date().toISOString() })

  if (error) {
    console.error('subscribe upsert error:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ ok: true })
}
