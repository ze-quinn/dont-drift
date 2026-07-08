import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { findMissedPenalties } from '../lib/penalties'

export function useMissedPenalties() {
  const ensurePenaltyEpoch = useStore(s => s.ensurePenaltyEpoch)
  const addBackdatedEntry  = useStore(s => s.addBackdatedEntry)
  const epoch              = useStore(s => s.penaltyEpoch)
  const ran = useRef(false)

  useEffect(() => { ensurePenaltyEpoch() }, [ensurePenaltyEpoch])

  useEffect(() => {
    if (ran.current || !epoch) return
    ran.current = true
    const t = setTimeout(() => {
      const s = useStore.getState()
      // Skip penalty evaluation while anchored — user is paused
      if (s.anchorState) return
      const penalties = findMissedPenalties(s.logs, epoch, s.mandatoryActivities)
      penalties.forEach(p => addBackdatedEntry(p))
    }, 2500)
    return () => clearTimeout(t)
  }, [epoch, addBackdatedEntry])
}
