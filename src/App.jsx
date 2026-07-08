import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Shell from './components/layout/Shell'
import AuthGate from './components/auth/AuthGate'

// Route-level code splitting — each page loads on demand
const Dashboard    = lazy(() => import('./components/dashboard/Dashboard'))
const ActivityLog  = lazy(() => import('./components/activities/ActivityLog'))
const HabitTracker = lazy(() => import('./components/habits/HabitTracker'))
const BodyStats    = lazy(() => import('./components/stats/BodyStats'))
const Settings     = lazy(() => import('./components/settings/Settings'))

// Brass-tinted skeleton shown while a lazy page chunk loads
function PageSkeleton() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 44, width: 260, marginBottom: 28 }} />
      <div className="skeleton" style={{ height: 180, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 120 }} />
    </div>
  )
}

export default function App() {
  return (
    <AuthGate>
      <BrowserRouter>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<Dashboard />} />
              <Route path="/log" element={<ActivityLog />} />
              <Route path="/habits" element={<HabitTracker />} />
              <Route path="/stats" element={<BodyStats />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthGate>
  )
}
