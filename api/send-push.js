// GET /api/send-push
// Vercel cron fires every 30 min. Reads saved preferences from Edge Config,
// checks whether it's the user's chosen notification time (±14 min window),
// and sends the appropriate sea animal push notification.

import webpush from 'web-push'
import { createClient } from '@vercel/edge-config'

// ── Message library by topic ─────────────────────────────────────────────
const MESSAGES = {
  shoulder: [
    { title: "Don't Drift", body: "Shoulder work time. An octopus has three hearts and still uses all eight arms. 🐙" },
    { title: "Don't Drift", body: "Sea turtles never skip shoulder day. Your rotator cuff is a long-term investment. 🐢" },
    { title: "Don't Drift", body: "Small consistent effort > irregular intensity. Ten minutes is all it needs. 🫧" },
    { title: "Don't Drift", body: "Barracudas are precise and consistent. Time to hit your shoulder routine. 🐟" },
    { title: "Don't Drift", body: "Blue whales are built differently. So are people who show up every day. 🐋" },
    { title: "Don't Drift", body: "Shoulder check-in. The ocean doesn't take rest days. Neither should this. 🌊" },
    { title: "Don't Drift", body: "Moray eels have a second jaw. That's two jaws of determination. Match it. 🫧" },
  ],
  run: [
    { title: "Don't Drift", body: "Orcas teach their young to hunt. Pass something good on today — go for that run. 🐋" },
    { title: "Don't Drift", body: "Barracudas hit 40 km/h. Your run doesn't need to be fast. It just needs to happen. 🐟" },
    { title: "Don't Drift", body: "Humpbacks travel 16,000 miles without stopping. You have a few km on the plan. 🐳" },
    { title: "Don't Drift", body: "Anglerfish live at crushing depths with no light. You have shoes and daylight. 🫧" },
    { title: "Don't Drift", body: "Clownfish never leave their anemone. Your running shoes have been waiting. 🐠" },
    { title: "Don't Drift", body: "Seahorses grip seagrass in storms rather than swim away. Hold the habit. 🌊" },
  ],
  swim: [
    { title: "Don't Drift", body: "Manta rays migrate thousands of miles. The pool is 20 minutes away. Just saying. 🌊" },
    { title: "Don't Drift", body: "Dolphins have been observed surfing waves purely for fun. Train and play. 🐬" },
    { title: "Don't Drift", body: "Sea turtles navigate by the Earth's magnetic field. Consistency is a superpower. 🐢" },
    { title: "Don't Drift", body: "Blue whale heart: size of a small car, beats twice a minute. Calm, unstoppable. 🐳" },
    { title: "Don't Drift", body: "The pool is waiting. Manta rays don't need a reason. Neither do you. 🫧" },
  ],
  tennis: [
    { title: "Don't Drift", body: "Barracudas are precise, fast, consistent. Court's calling. 🐟" },
    { title: "Don't Drift", body: "Orcas hunt in coordinated packs. Your game sharpens with every session. 🐋" },
    { title: "Don't Drift", body: "Mantis shrimp punch with bullet force. Channel 10% of that on court today. 🦞" },
    { title: "Don't Drift", body: "Dolphins play in the waves for pure joy. That's what the court is for. 🐬" },
    { title: "Don't Drift", body: "Lobsters keep growing their entire lives. So does your backhand. 🦞" },
  ],
  motivation: [
    { title: "Don't Drift", body: "A blue whale's heart beats just twice a minute. Calm, consistent, unstoppable. 🐳" },
    { title: "Don't Drift", body: "Pufferfish double in size when they need to. Show up bigger than yesterday. 🐡" },
    { title: "Don't Drift", body: "The immortal jellyfish can revert to its juvenile state. Fresh start, any time. 🪼" },
    { title: "Don't Drift", body: "Lobsters keep growing their entire lives. They don't plateau. Neither should you. 🦞" },
    { title: "Don't Drift", body: "Sea turtles return to the exact beach they were born on. Consistency wins. 🐢" },
    { title: "Don't Drift", body: "Cuttlefish see polarised light. They see everything — including your excuses. 🦑" },
    { title: "Don't Drift", body: "Starfish can regenerate a lost arm. You can regenerate a lost week. 🫧" },
  ],
  habits: [
    { title: "Don't Drift", body: "Seahorses have no stomach — they eat constantly to survive. One protein shake isn't a lot to ask. 🌊" },
    { title: "Don't Drift", body: "A blue whale eats 4 tonnes of krill a day. One vegan protein shake is, comparatively, very manageable. 🐳" },
    { title: "Don't Drift", body: "Dolphins sleep with one eye open. You're already ahead — keep the streak alive. 🐬" },
    { title: "Don't Drift", body: "The oldest clam lived 507 years. It did not miss a single day of being a clam. 🐚" },
    { title: "Don't Drift", body: "Orcas maintain strategies passed down through generations. Your streak is your strategy. 🐋" },
    { title: "Don't Drift", body: "Check in. Log it. The ocean is watching (warmly). 🫧" },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────

function pickMessage(topic) {
  const pool = MESSAGES[topic] ?? MESSAGES.motivation
  return pool[new Date().getDate() % pool.length] // rotate daily, deterministic
}

// Is the current UTC time within ±14 min of the user's preferred IST time?
function isWithinWindow(prefHour, prefMinute) {
  const now = new Date()
  // IST = UTC + 5h30m
  const istMs = now.getTime() + (5 * 60 + 30) * 60 * 1000
  const ist = new Date(istMs)
  const nowMins  = ist.getUTCHours() * 60 + ist.getUTCMinutes()
  const prefMins = prefHour * 60 + prefMinute
  const diff = Math.abs(nowMins - prefMins)
  // Handle midnight wrap
  return diff <= 14 || (1440 - diff) <= 14
}

async function edgeGet(key) {
  const client = createClient(process.env.EDGE_CONFIG)
  const val = await client.get(key)
  return val ?? null
}

// ── Handler ───────────────────────────────────────────────────────────────
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

  // Load subscription + prefs from Edge Config
  let rawSub, rawPrefs
  try {
    ;[rawSub, rawPrefs] = await Promise.all([
      edgeGet('push_subscription'),
      edgeGet('notif_prefs'),
    ])
  } catch (err) {
    console.error('Edge Config read error:', err)
    return res.status(500).json({ error: 'Could not read from Edge Config' })
  }

  if (!rawSub) {
    return res.status(404).json({ error: 'No subscription stored. Enable notifications in the app first.' })
  }

  // Parse prefs — support both legacy single object and new array format
  let schedules
  if (rawPrefs) {
    const parsed = typeof rawPrefs === 'string' ? JSON.parse(rawPrefs) : rawPrefs
    schedules = Array.isArray(parsed) ? parsed : [parsed]
  } else {
    schedules = [{ hour: 19, minute: 0, topic: 'shoulder' }]
  }

  const subscription = typeof rawSub === 'string' ? JSON.parse(rawSub) : rawSub

  // For GET (cron): send only the schedules that match the current time window
  // For POST (manual trigger): send all
  const toSend = req.method === 'GET'
    ? schedules.filter(s => isWithinWindow(s.hour, s.minute))
    : schedules

  if (req.method === 'GET' && toSend.length === 0) {
    return res.status(200).json({ ok: true, skipped: true, reason: 'Outside all notification windows' })
  }

  const results = []
  for (const sched of toSend) {
    const msg = pickMessage(sched.topic)
    try {
      await webpush.sendNotification(subscription, JSON.stringify({
        title: msg.title,
        body:  msg.body,
        tag:   `dont-drift-${sched.id ?? sched.topic}`,
        url:   '/',
      }))
      results.push({ ok: true, topic: sched.topic, sent: msg.body })
    } catch (err) {
      console.error('Push send error:', err)
      results.push({ ok: false, topic: sched.topic, error: err.message })
    }
  }

  const allFailed = results.every(r => !r.ok)
  return res.status(allFailed ? 500 : 200).json({ ok: !allFailed, results })
}
