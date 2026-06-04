// POST /api/send-push
// Reads the stored subscription from KV and sends a push notification.
// Called by the Vercel cron job at 7 pm IST (13:30 UTC) daily.
// Can also be triggered manually for testing.

import webpush from 'web-push'
import { kv } from '@vercel/kv'

const SHOULDER_MESSAGES = [
  { title: "Don't Drift", body: "Shoulder work window — 7 pm. Your rotator cuff is a long-term investment. 🫧" },
  { title: "Don't Drift", body: "Sea turtles never skip shoulder day. Neither should you. 7 pm reminder. 🐢" },
  { title: "Don't Drift", body: "Octopuses have 8 arms because they never missed a session. Your turn. 🐙" },
  { title: "Don't Drift", body: "Evening shoulder work — now. Ten minutes is all it needs. 🫧" },
  { title: "Don't Drift", body: "Blue whales are built differently. So are people who show up daily. 🐋" },
  { title: "Don't Drift", body: "Shoulder check-in — 7 pm. Small consistent effort > irregular intensity. 🫧" },
  { title: "Don't Drift", body: "Barracudas are precise, fast, and consistent. Hit your shoulder routine. 🐟" },
]

export default async function handler(req, res) {
  // Allow GET for cron, POST for manual trigger
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const vapidPublic  = process.env.VITE_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidEmail   = process.env.VAPID_EMAIL ?? 'mailto:harleen.chatha@canvs.in'

  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: 'VAPID keys not configured' })
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate)

  let raw
  try {
    raw = await kv.get('push_subscription')
  } catch (err) {
    console.error('KV read error:', err)
    return res.status(500).json({ error: 'Could not read subscription from KV' })
  }

  if (!raw) {
    return res.status(404).json({ error: 'No subscription stored. Open the app and enable notifications first.' })
  }

  const subscription = typeof raw === 'string' ? JSON.parse(raw) : raw

  // Pick a message — rotate by day of week so it varies
  const msg = SHOULDER_MESSAGES[new Date().getDay() % SHOULDER_MESSAGES.length]

  try {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: msg.title,
      body: msg.body,
      tag: 'shoulder-reminder',
      url: '/',
    }))
    return res.status(200).json({ ok: true, sent: msg.body })
  } catch (err) {
    console.error('Push send error:', err)
    // 410 = subscription expired/invalid, clean up
    if (err.statusCode === 410) {
      await kv.del('push_subscription')
      return res.status(410).json({ error: 'Subscription expired. Re-enable notifications in the app.' })
    }
    return res.status(500).json({ error: err.message })
  }
}
