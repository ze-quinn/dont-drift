import { useStore } from '../store/useStore'
import { BUBBLE_RULES, getRunRule, getTennisRule, getSwimRule } from '../constants/bubbles'
import { getLevelForBubbles, getProgressToNextLevel } from '../constants/levels'
import { isWeekend } from '../constants/activities'

export function useBubbles() {
  const { bubbles, addBubbles, logs } = useStore()
  const level = getLevelForBubbles(bubbles)
  const progress = getProgressToNextLevel(bubbles)

  function log(ruleKey, note = '') {
    const rule = BUBBLE_RULES[ruleKey]
    if (!rule) return
    return addBubbles(ruleKey, rule.label, rule.delta, note)
  }

  function logRun(durationMinutes, isSaturday = false) {
    const ruleKey = getRunRule(durationMinutes)
    const entry = log(ruleKey, `${durationMinutes} min`)
    if (isSaturday) log('RUN_SATURDAY_BONUS')
    return entry
  }

  function logTennis(durationMinutes) {
    return log(getTennisRule(durationMinutes), `${durationMinutes} min`)
  }

  function logSwim(durationMinutes) {
    return log(getSwimRule(durationMinutes), `${durationMinutes} min`)
  }

  function logPenalty(ruleKey, skipIfWeekend = true) {
    if (skipIfWeekend && isWeekend()) return null
    return log(ruleKey)
  }

  return {
    bubbles,
    level,
    progress,
    log,
    logRun,
    logTennis,
    logSwim,
    logPenalty,
    logs,
  }
}
