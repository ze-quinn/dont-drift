import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import NavRail from './NavRail'
import BubbleBar from './BubbleBar'
import AlertToast from '../alerts/AlertToast'
import { useAlerts } from '../../hooks/useAlerts'
import { useStore } from '../../store/useStore'
import { AlertContext } from '../../context/AlertContext'

export default function Shell() {
  const { currentAlert, showAlert, dismissAlert } = useAlerts()
  const theme = useStore(s => s.settings.theme ?? 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
        <NavRail />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <BubbleBar onManualAlert={() => showAlert('general')} />
          <main className="flex-1 overflow-y-auto">
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
