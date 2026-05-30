import { NavLink } from 'react-router-dom'
import { useStore } from '../../store/useStore'

const NAV = [
  { to: '/',         icon: <GridIcon />,  label: 'Today'    },
  { to: '/log',      icon: <PlusIcon />,  label: 'Log'      },
  { to: '/habits',   icon: <CheckIcon />, label: 'Habits'   },
  { to: '/stats',    icon: <ChartIcon />, label: 'Stats'    },
  { to: '/settings', icon: <GearIcon />,  label: 'Settings' },
]

export default function NavRail() {
  const { settings, updateSettings } = useStore()
  const theme = settings.theme ?? 'dark'

  function toggleTheme() {
    updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })
  }

  return (
    <nav
      className="flex flex-col items-center py-5 gap-0.5 w-[62px] shrink-0"
      style={{
        borderRight: '1px solid var(--border-dim)',
        background: 'var(--bg-panel-alt)',
      }}
    >
      {/* Bubble logo */}
      <div className="mb-5 mt-1">
        <BubbleLogo />
      </div>

      {/* Nav links */}
      {NAV.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={label}
        >
          <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
          <span style={{ fontSize: '0.52rem', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
            {label}
          </span>
        </NavLink>
      ))}

      {/* Theme toggle — pinned to bottom */}
      <div className="flex-1" />
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="nav-item mb-2"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        <span style={{ fontSize: '0.52rem', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-3)' }}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </span>
      </button>
    </nav>
  )
}

/* ── Logo ─────────────────────────────────────────────────── */
function BubbleLogo() {
  return (
    <svg viewBox="0 0 36 36" width="34" height="34" fill="none">
      {/* Outer hex frame */}
      <polygon
        points="18,2 32,10 32,26 18,34 4,26 4,10"
        stroke="var(--brass)" strokeWidth="1.5" fill="none" opacity="0.7"
      />
      {/* Three bubbles — different sizes, Bauhaus cluster */}
      <circle cx="18" cy="15" r="5.5" stroke="var(--brass)" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="22" r="3.5" stroke="var(--brass)" strokeWidth="1.5" fill="none"/>
      <circle cx="24" cy="23" r="2.5" stroke="var(--brass)" strokeWidth="1.5" fill="none"/>
      {/* Specular dots — Bauhaus detail */}
      <circle cx="16.5" cy="13.5" r="1" fill="var(--brass)" opacity="0.6"/>
      <circle cx="11"   cy="21"   r="0.7" fill="var(--brass)" opacity="0.6"/>
      <circle cx="23"   cy="22"   r="0.5" fill="var(--brass)" opacity="0.6"/>
    </svg>
  )
}

/* ── Icons ────────────────────────────────────────────────── */
function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <rect x="1" y="1" width="6" height="6" rx="0.5"/>
      <rect x="9" y="1" width="6" height="6" rx="0.5"/>
      <rect x="1" y="9" width="6" height="6" rx="0.5"/>
      <rect x="9" y="9" width="6" height="6" rx="0.5"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="8" cy="8" r="6.5"/>
      <line x1="8" y1="4.5" x2="8" y2="11.5"/>
      <line x1="4.5" y1="8" x2="11.5" y2="8"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="1" y="1" width="6" height="6" rx="0.5"/>
      <rect x="9" y="1" width="6" height="6" rx="0.5"/>
      <rect x="1" y="9" width="6" height="6" rx="0.5"/>
      <polyline points="9,12 11,14 15,10" strokeLinecap="square"/>
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <polyline points="1,12 5,7 9,9.5 15,3" strokeLinecap="square" strokeLinejoin="miter"/>
      <line x1="1" y1="15" x2="15" y2="15"/>
    </svg>
  )
}
function GearIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="8" cy="8" r="2.5"/>
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/>
    </svg>
  )
}
function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="8" cy="8" r="3"/>
      <line x1="8" y1="1" x2="8" y2="3"/>
      <line x1="8" y1="13" x2="8" y2="15"/>
      <line x1="1" y1="8" x2="3" y2="8"/>
      <line x1="13" y1="8" x2="15" y2="8"/>
      <line x1="3.05" y1="3.05" x2="4.46" y2="4.46"/>
      <line x1="11.54" y1="11.54" x2="12.95" y2="12.95"/>
      <line x1="12.95" y1="3.05" x2="11.54" y2="4.46"/>
      <line x1="4.46" y1="11.54" x2="3.05" y2="12.95"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M13.5 10A6 6 0 016 2.5a6 6 0 100 11 6 6 0 007.5-3.5z"/>
    </svg>
  )
}
