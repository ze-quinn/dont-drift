import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavRail from './NavRail'
import BubbleBar from './BubbleBar'
import AlertToast from '../alerts/AlertToast'
import { useAlerts } from '../../hooks/useAlerts'
import { useStore } from '../../store/useStore'
import { AlertContext } from '../../context/AlertContext'
import { useSync } from '../../hooks/useSync'

export default function Shell() {
  const { currentAlert, showAlert, dismissAlert } = useAlerts()
  const theme    = useStore(s => s.settings.theme ?? 'dark')
  const location = useLocation()
  useSync()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* Sidebar — desktop only */}
        <NavRail />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <BubbleBar onManualAlert={() => showAlert('general')} />

          {/* Page content — fades on route change */}
          <main
            key={location.pathname}
            className="flex-1 overflow-y-auto animate-page-in"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <Outlet />
          </main>

        </div>

        {currentAlert && (
          <AlertToast alert={currentAlert} onDismiss={dismissAlert} />
        )}
      </div>
    </AlertContext.Provider>
  )
}
