// GET /api/send-push  — called by cron every 30 min
// POST /api/send-push — manual trigger (sends all schedules regardless of time)
//
// Reads all push subscriptions + prefs from Supabase,
// checks each user's schedules against the current IST time,
// and sends the appropriate notification.

import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

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

// ── Generic messages for custom activities ────────────────────────────────────
function customMessages(label, icon) {
  const e = icon ?? '🫧'
  return [
    { title: "Don't Drift", body: `Time for ${label}. Keep the streak alive. ${e}` },
    { title: "Don't Drift", body: `${e} ${label} — the ocean doesn't skip days.` },
    { title: "Don't Drift", body: `Your ${label} reminder. Small consistent effort compounds. ${e}` },
    { title: "Don't Drift", body: `Seahorses grip through storms. You can do ${label}. ${e}` },
    { title: "Don't Drift", body: `${label}. Lobsters keep growing their whole lives. So do you. ${e}` },
  ]
}

function pickMessage(topic, sched) {
  const pool = MESSAGES[topic]
  if (pool) return pool[new Date().getDate() % pool.length]
  const customs = customMessages(sched?.label ?? topic, sched?.icon)
  return customs[new Date().getDate() % customs.length]
}

// Is the current UTC time within ±14 min of the user's preferred IST time?
function isWithinWindow(prefHour, prefMinute) {
  const now = new Date()
  const istMs = now.getTime() + (5 * 60 + 30) * 60 * 1000
  const ist = new Date(istMs)
  const nowMins  = ist.getUTCHours() * 60 + ist.getUTCMinutes()
  const prefMins = prefHour * 60 + prefMinute
  const diff = Math.abs(nowMins - prefMins)
  return diff <= 14 || (1440 - diff) <= 14
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

  // Load all subscriptions from Supabase using service role key
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: rows, error: dbErr } = await supabase
    .from('push_subscriptions')
    .select('user_id, subscription, prefs')

  if (dbErr) {
    console.error('Supabase read error:', dbErr)
    return res.status(500).json({ error: 'Could not read subscriptions' })
  }

  if (!rows || rows.length === 0) {
    return res.status(200).json({ ok: true, skipped: true, reason: 'No subscribers' })
  }

  const isCron = req.method === 'GET'
  const expiredUserIds = []
  const allResults = []

  for (const row of rows) {
    if (!row.subscription) continue

    const schedules = Array.isArray(row.prefs) ? row.prefs
      : row.prefs ? [row.prefs]
      : [{ id: 'default', hour: 19, minute: 0, topic: 'motivation' }]

    const toSend = isCron
      ? schedules.filter(s => isWithinWindow(s.hour, s.minute))
      : schedules

    if (toSend.length === 0) continue

    for (const sched of toSend) {
      const msg = pickMessage(sched.topic, sched)
      try {
        await webpush.sendNotification(row.subscription, JSON.stringify({
          title: msg.title,
          body:  msg.body,
          tag:   `dont-drift-${sched.id ?? sched.topic}`,
          url:   '/',
        }))
        allResults.push({ ok: true, user: row.user_id, topic: sched.topic })
      } catch (err) {
        console.error('Push send error:', err)
        allResults.push({ ok: false, user: row.user_id, topic: sched.topic, error: err.message, statusCode: err.statusCode, body: err.body, endpoint: row.subscription?.endpoint?.slice(0, 60) })
        // 410 Gone or 404 = subscription expired, clean it up
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredUserIds.push(row.user_id)
        }
      }
    }
  }

  // Remove expired subscriptions
  if (expiredUserIds.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('user_id', expiredUserIds)
  }

  const anyOk = allResults.some(r => r.ok)
  return res.status(200).json({ ok: anyOk || allResults.length === 0, results: allResults })
}
