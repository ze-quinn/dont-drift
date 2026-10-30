import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { findMissedPenalties } from '../lib/penalties'

const DAY_CHECK_MS = 60 * 1000

export function useMissedPenalties() {
  const ensurePenaltyEpoch = useStore(s => s.ensurePenaltyEpoch)
  const addBackdatedEntry  = useStore(s => s.addBackdatedEntry)
  const epoch              = useStore(s => s.penaltyEpoch)
  const lastCheckedDay = useRef(null)

  useEffect(() => { ensurePenaltyEpoch() }, [ensurePenaltyEpoch])

  useEffect(() => {
    if (!epoch) return

    // Evaluates once per calendar day; re-armed by resume/day-rollover below.
    function check() {
      const today = new Date().toDateString()
      if (lastCheckedDay.current === today) return
      const s = useStore.getState()
      if (s.anchorState) return // paused — retry once the anchor is weighed
      lastCheckedDay.current = today
      findMissedPenalties(s.logs, s.penaltyEpoch ?? epoch, s.mandatoryActivities)
        .forEach(p => addBackdatedEntry(p))
    }

    const initial = setTimeout(check, 2500)
    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)
    const tick = setInterval(check, DAY_CHECK_MS)

    return () => {
      clearTimeout(initial)
      clearInterval(tick)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [epoch, addBackdatedEntry])
}
