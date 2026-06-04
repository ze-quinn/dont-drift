// POST /api/send-push
// Reads the stored subscription from Upstash Redis and sends a push notification.
// Called by the Vercel cron job at 7 pm IST (13:30 UTC) daily.

import webpush from 'web-push'

const SHOULDER_MESSAGES = [
  { title: "Don't Drift", body: "Shoulder work window — 7 pm. Your rotator cuff is a long-term investment. 🫧" },
  { title: "Don't Drift", body: "Sea turtles never skip shoulder day. Neither should you. 7 pm reminder. 🐢" },
  { title: "Don't Drift", body: "Octopuses have 8 arms because they never missed a session. Your turn. 🐙" },
  { title: "Don't Drift", body: "Evening shoulder work — now. Ten minutes is all it needs. 🫧" },
  { title: "Don't Drift", body: "Blue whales are built differently. So are people who show up daily. 🐋" },
  { title: "Don't Drift", body: "Shoulder check-in — 7 pm. Small consistent effort > irregular intensity. 🫧" },
  { title: "Don't Drift", body: "Barracudas are precise, fast, and consistent. Hit your shoulder routine. 🐟" },
]

async function kvGet(key) {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Upstash get failed: ${res.status}`)
  const json = await res.json()
  return json.result ?? null
}

async function kvDel(key) {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export default async function handler(req, res) {
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
    raw = await kvGet('push_subscription')
  } catch (err) {
    console.error('KV read error:', err)
    return res.status(500).json({ error: 'Could not read subscription from storage' })
  }

  if (!raw) {
    return res.status(404).json({ error: 'No subscription stored. Open the app and enable notifications first.' })
  }

  const subscription = typeof raw === 'string' ? JSON.parse(raw) : raw

  const msg = SHOULDER_MESSAGES[new Date().getDay() % SHOULDER_MESSAGES.length]

  try {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: msg.title,
      body:  msg.body,
      tag:   'shoulder-reminder',
      url:   '/',
    }))
    return res.status(200).json({ ok: true, sent: msg.body })
  } catch (err) {
    console.error('Push send error:', err)
    if (err.statusCode === 410) {
      await kvDel('push_subscription')
      return res.status(410).json({ error: 'Subscription expired. Re-enable notifications in the app.' })
    }
    return res.status(500).json({ error: err.message })
  }
}
