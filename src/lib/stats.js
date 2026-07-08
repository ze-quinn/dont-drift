// stats.js — derive streaks, tides, personal bests and weekly recaps from the
// bubble log. All pure functions; no store coupling.

export function dayKey(date = new Date()) {
  return new Date(date).toDateString()
}

// { 'Mon Jun 16 2026': 60, ... } — net delta per calendar day
export function dailyTotalsMap(logs) {
  const m = {}
  for (const l of logs) {
    const d = dayKey(l.date)
    m[d] = (m[d] ?? 0) + l.delta
  }
  return m
}

// Consecutive days (ending today, or yesterday if nothing logged yet today)
// on which at least one activity was logged.
export function currentStreak(logs) {
  const days = new Set(logs.map(l => dayKey(l.date)))
  const d = new Date()
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1)
  let streak = 0
  while (days.has(d.toDateString())) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function todayTotal(logs) {
  const k = dayKey()
  return logs
    .filter(l => dayKey(l.date) === k)
    .reduce((s, l) => s + l.delta, 0)
}

// Best single positive day, optionally excluding one day key (e.g. today).
export function personalBestDay(logs, excludeKey) {
  const m = dailyTotalsMap(logs)
  let best = 0
  for (const [k, v] of Object.entries(m)) {
    if (k === excludeKey) continue
    if (v > best) best = v
  }
  return best
}

// Monday-anchored ISO-ish week key, e.g. '2026-06-15'
export function weekKey(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - dow)
  return d.toISOString().slice(0, 10)
}

// Stats for the previous Mon–Sun week (used by the Monday recap card).
export function lastWeekStats(logs) {
  const now = new Date()
  const dow = (now.getDay() + 6) % 7
  const thisMon = new Date(now)
  thisMon.setHours(0, 0, 0, 0)
  thisMon.setDate(now.getDate() - dow)
  const lastMon = new Date(thisMon)
  lastMon.setDate(thisMon.getDate() - 7)

  const inRange = logs.filter(l => {
    const t = new Date(l.date)
    return t >= lastMon && t < thisMon
  })
  const net = inRange.reduce((s, l) => s + l.delta, 0)

  const m = {}
  for (const l of inRange) {
    const d = dayKey(l.date)
    m[d] = (m[d] ?? 0) + l.delta
  }
  const dayTotals = Object.values(m)
  const best = dayTotals.length ? Math.max(...dayTotals) : 0

  return {
    net,
    best,
    daysActive: Object.keys(m).length,
    start: lastMon,
    end: new Date(thisMon.getTime() - 1),
    hasData: inRange.length > 0,
  }
}
