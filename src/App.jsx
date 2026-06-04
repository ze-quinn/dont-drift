import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Shell from './components/layout/Shell'
import Dashboard from './components/dashboard/Dashboard'
import ActivityLog from './components/activities/ActivityLog'
import HabitTracker from './components/habits/HabitTracker'
import BodyStats from './components/stats/BodyStats'
import Settings from './components/settings/Settings'
import AuthGate from './components/auth/AuthGate'

export default function App() {
  return (
    <AuthGate>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="/log" element={<ActivityLog />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/stats" element={<BodyStats />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthGate>
  )
}
