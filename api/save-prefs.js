// POST /api/save-prefs
// Saves notification schedules to Supabase, keyed by user_id from the JWT.

import { createClient } from '@supabase/supabase-js'

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

  const jwt = (req.headers.authorization ?? '').replace('Bearer ', '')
  if (!jwt) return res.status(401).json({ error: 'Missing auth token' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt)
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' })

  const { error } = await supabase
    .from('push_subscriptions')
    .update({ prefs: schedules, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) {
    console.error('save-prefs error:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ ok: true })
}
