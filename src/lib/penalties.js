import { BUBBLE_RULES } from '../constants/bubbles'
import { doneKeysFor } from '../constants/mandatory'
import { dayKey } from './stats'

// Never look back further than this — protects against a huge one-off backfill
// if the app hasn't been opened in a long time.
const MAX_LOOKBACK_DAYS = 14

// Returns the past scheduled days that should be penalised, as
// [{ dateISO, ruleKey, label, delta }]. Excludes today (not over yet), anything
// before the enforcement epoch, days already logged, and days already penalised.
//
// `mandatory` is the user's editable list of mandatory activities (see
// constants/mandatory.js for the shape).
export function findMissedPenalties(logs, epochDateStr, mandatory, now = new Date()) {
  if (!epochDateStr || !mandatory?.length) return []

  const epoch = new Date(epochDateStr)
  epoch.setHours(0, 0, 0, 0)

  const out = []

  for (const m of mandatory) {
    const doneKeys = doneKeysFor(m)
    const doneOn = new Set(
      logs.filter(l => doneKeys.includes(l.ruleKey)).map(l => dayKey(l.date))
    )
    const penalisedOn = new Set(
      logs.filter(l => l.ruleKey === m.missedKey).map(l => dayKey(l.date))
    )
    const label = BUBBLE_RULES[m.missedKey]?.label ?? `Missed ${m.label.toLowerCase()}`
    const delta = -Math.abs(m.penalty)

    for (let i = 1; i <= MAX_LOOKBACK_DAYS; i++) {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      if (d < epoch) break
      if (!m.scheduledDays.includes(d.getDay())) continue
      const key = d.toDateString()
      if (doneOn.has(key) || penalisedOn.has(key)) continue

      const stamp = new Date(d)
      stamp.setHours(21, 0, 0, 0)
      out.push({ dateISO: stamp.toISOString(), ruleKey: m.missedKey, label, delta })
    }
  }
  return out
}
