import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { ALERTS, getRandomAlert } from '../constants/alerts'

export function useAlerts() {
  const [currentAlert, setCurrentAlert] = useState(null)
  const { bubbles, seenAlertIds, markAlertSeen } = useStore()

  const showAlert = useCallback((context = 'general') => {
    const unseen = ALERTS.filter(a => !seenAlertIds.includes(a.id))
    const pool = unseen.length > 2 ? unseen : ALERTS
    const contextPool = pool.filter(a => a.context === context || a.context === 'general')
    const chosen = contextPool[Math.floor(Math.random() * contextPool.length)]
    if (chosen) {
      setCurrentAlert(chosen)
      markAlertSeen(chosen.id)
    }
  }, [seenAlertIds, markAlertSeen])

  const dismissAlert = useCallback(() => {
    setCurrentAlert(null)
  }, [])

  // Ambient alert: show every 45–90 minutes
  useEffect(() => {
    const delay = (45 + Math.random() * 45) * 60 * 1000
    const timer = setTimeout(() => showAlert('general'), delay)
    return () => clearTimeout(timer)
  }, [showAlert])

  // Show on load after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => showAlert('general'), 8000)
    return () => clearTimeout(timer)
  }, [])

  return { currentAlert, showAlert, dismissAlert }
}
