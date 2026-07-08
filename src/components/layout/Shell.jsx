import { useEffect, lazy, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavRail from './NavRail'
import BubbleBar from './BubbleBar'
import AlertToast from '../alerts/AlertToast'
import { useAlerts } from '../../hooks/useAlerts'
import { useStore } from '../../store/useStore'
import { AlertContext } from '../../context/AlertContext'
import { useSync } from '../../hooks/useSync'
import { useMissedPenalties } from '../../hooks/useMissedPenalties'
import { soundBubbles } from '../../lib/feedback'
import WaterBackground from './WaterBackground'
// Lazy — pulls SeaAnimalIllustration (heavy) out of the entry chunk
const LevelUpCelebration = lazy(() => import('../celebrations/LevelUpCelebration'))

const OPEN_BUBBLES = [
  { r: 5,   delay: 80  },
  { r: 3,   delay: 200 },
  { r: 7,   delay: 340 },
  { r: 4,   delay: 460 },
  { r: 6,   delay: 580 },
  { r: 3.5, delay: 700 },
  { r: 5,   delay: 820 },
  { r: 4.5, delay: 940 },
]

export default function Shell() {
  const { currentAlert, showAlert, dismissAlert } = useAlerts()
  const theme    = useStore(s => s.settings.theme ?? 'dark')
  const location = useLocation()
  useSync()
  useMissedPenalties()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Day/night tone shift — daytime 07:00–19:00, re-checked every 10 min
  useEffect(() => {
    function applyTime() {
      const h = new Date().getHours()
      const time = h >= 7 && h < 19 ? 'day' : 'night'
      document.documentElement.setAttribute('data-time', time)
    }
    applyTime()
    const id = setInterval(applyTime, 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  // Play bubble pops on app open — fired once on mount
  useEffect(() => {
    const t = setTimeout(() => soundBubbles(OPEN_BUBBLES), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)', position: 'relative' }}>
        {/* Ambient water layer — sits behind everything, decorative only */}
        <WaterBackground />

        {/* Sidebar — desktop only */}
        <NavRail />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
          <BubbleBar onManualAlert={() => showAlert('general')} />

          {/* Page content — fades on route change */}
          <main
            key={location.pathname}
            className="flex-1 overflow-y-auto animate-page-in"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)', overflowX: 'hidden' }}
          >
            <Outlet />
          </main>

        </div>

        {currentAlert && (
          <AlertToast alert={currentAlert} onDismiss={dismissAlert} />
        )}

        <Suspense fallback={null}>
          <LevelUpCelebration />
        </Suspense>
      </div>
    </AlertContext.Provider>
  )
}
