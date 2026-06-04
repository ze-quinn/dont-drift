import { useState, useEffect, useCallback, useRef } from 'react'
import { useStore } from '../store/useStore'
import { ALERTS } from '../constants/alerts'

/**
 * Ambient cadence:
 *   - 4 s after first mount
 *   - Every 8–12 min thereafter (randomised to avoid feeling mechanical)
 *   - 3-min idle timer on the dashboard resets on any pointer move
 *
 * Event-driven triggers (called externally):
 *   triggerAlert(context)  — activity logged, habit tapped, page entered, etc.
 */
export function useAlerts() {
  const [currentAlert, setCurrentAlert] = useState(null)
  const { seenAlertIds, markAlertSeen } = useStore()
  const lastShownId = useRef(null)
  const ambientTimerRef = useRef(null)

  // Pick a fresh alert — never the same one twice in a row,
  // prefer unseen, fall back to full pool if all seen.
  const pickAlert = useCallback((context = 'general') => {
    const contextPool = ALERTS.filter(
      a => a.context === context || a.context === 'general'
    )
    const pool = contextPool.length > 0 ? contextPool : ALERTS

    // Remove the last shown to prevent immediate repeat
    const candidates = pool.filter(a => a.id !== lastShownId.current)
    // Prefer unseen
    const unseen = candidates.filter(a => !seenAlertIds.includes(a.id))
    const source = unseen.length > 0 ? unseen : candidates

    return source[Math.floor(Math.random() * source.length)] ?? pool[0]
  }, [seenAlertIds])

  const showAlert = useCallback((context = 'general') => {
    const alert = pickAlert(context)
    if (!alert) return
    lastShownId.current = alert.id
    setCurrentAlert(alert)
    markAlertSeen(alert.id)
  }, [pickAlert, markAlertSeen])

  const dismissAlert = useCallback(() => {
    setCurrentAlert(null)
  }, [])

  // Schedule the next ambient alert (8–12 min)
  const scheduleNext = useCallback(() => {
    clearTimeout(ambientTimerRef.current)
    const delay = (8 + Math.random() * 4) * 60 * 1000  // 8–12 min
    ambientTimerRef.current = setTimeout(() => {
      showAlert('general')
      scheduleNext()
    }, delay)
  }, [showAlert])

  // On first mount: show after 4 s, then begin ambient cycle
  useEffect(() => {
    const boot = setTimeout(() => {
      showAlert('general')
      scheduleNext()
    }, 4000)
    return () => {
      clearTimeout(boot)
      clearTimeout(ambientTimerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { currentAlert, showAlert, dismissAlert }
}
