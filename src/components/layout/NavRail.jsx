import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'

const NAV = [
  { to: '/',         icon: GridIcon,  label: 'Today'    },
  { to: '/log',      icon: PlusIcon,  label: 'Log'      },
  { to: '/habits',   icon: CheckIcon, label: 'Habits'   },
  { to: '/stats',    icon: ChartIcon, label: 'Stats'    },
  { to: '/settings', icon: GearIcon,  label: 'Settings' },
]

// ── Sidebar nav (desktop) ──────────────────────────────────────
export default function NavRail() {
  const { settings, updateSettings } = useStore()
  const theme = settings.theme ?? 'dark'
  const location = useLocation()

  // Sliding indicator
  const itemRefs  = useRef([])
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, opacity: 0 })

  useEffect(() => {
    const idx = NAV.findIndex(n =>
      n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
    )
    const el = itemRefs.current[idx]
    if (el) {
      setIndicatorStyle({
        top: el.offsetTop + el.offsetHeight / 2 - 14,
        opacity: 1,
      })
    }
  }, [location.pathname])

  function toggleTheme() {
    updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })
  }

  return (
    <nav
      className="flex flex-col items-center py-5 gap-0.5 w-[68px] lg:w-[76px] shrink-0"
      style={{
        borderRight: '1px solid var(--border-dim)',
        background: 'var(--bg-panel-alt)',
        position: 'relative',
      }}
    >
      {/* Sliding active indicator */}
      <div style={{
        position: 'absolute',
        left: 0,
        width: 2,
        height: 28,
        background: 'var(--brass)',
        borderRadius: '0 1px 1px 0',
        transition: 'top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s',
        ...indicatorStyle,
      }} />

      {/* Bubble logo */}
      <div className="mb-5 mt-1">
        <BubbleLogo />
      </div>

      {/* Nav links */}
      {NAV.map(({ to, icon: Icon, label }, i) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          ref={el => itemRefs.current[i] = el}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={label}
        >
          <span className="w-4 h-4 flex items-center justify-center"><Icon /></span>
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

// ── Bottom tab bar (mobile) ────────────────────────────────────
export function BottomTabBar() {
  const { settings, updateSettings } = useStore()
  const theme = settings.theme ?? 'dark'

  return (
    <nav
      className="lg:hidden flex items-stretch"
      style={{
        borderTop: '1px solid var(--border-dim)',
        background: 'var(--bg-panel-alt)',
        flexShrink: 0,
      }}
    >
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="w-4 h-4 flex items-center justify-center"><Icon /></span>
          <span style={{ fontSize: '0.48rem', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
            {label}
          </span>
        </NavLink>
      ))}
      {/* Theme toggle as last tab */}
      <button
        onClick={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
        className="tab-item"
        style={{ background: 'none', border: 'none', cursor: 'pointer', flex: 0, padding: '10px 12px 8px' }}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </nav>
  )
}

/* ── Bubble Logo ──────────────────────────────────────────────── */
const LOGO_BUBBLES = [
  { x:  -8, r: 3,   delay: 0   },
  { x:   6, r: 4.5, delay: 120 },
  { x: -14, r: 2.5, delay: 230 },
  { x:  10, r: 3.5, delay: 340 },
  { x:   0, r: 5,   delay: 160 },
]

function BubbleLogo() {
  const [pulsing, setPulsing] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

  function handleClick() {
    setPulseKey(k => k + 1)
    setPulsing(true)
    setTimeout(() => setPulsing(false), 1600)
  }

  return (
    <div style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' }} onClick={handleClick}>
      <svg viewBox="0 0 36 36" width="34" height="34" fill="none">
        <circle cx="16" cy="21" r="9"   stroke="var(--brass)" strokeWidth="1.5" fill="none" opacity="0.9"/>
        <circle cx="25" cy="14" r="6"   stroke="var(--brass)" strokeWidth="1.4" fill="none" opacity="0.6"/>
        <circle cx="10" cy="12" r="4"   stroke="var(--brass)" strokeWidth="1.2" fill="none" opacity="0.4"/>
        <circle cx="13.5" cy="18"   r="1.3" fill="var(--brass)" opacity="0.55"/>
        <circle cx="23"   cy="12"   r="0.9" fill="var(--brass)" opacity="0.4"/>
        <circle cx="8.5"  cy="10.5" r="0.6" fill="var(--brass)" opacity="0.3"/>
      </svg>
      {/* Bubbles */}
      {pulsing && LOGO_BUBBLES.map((b, i) => (
        <div key={`${pulseKey}-b${i}`} style={{
          position: 'absolute',
          left: `calc(50% + ${b.x}px)`,
          bottom: '60%',
          width: b.r * 2, height: b.r * 2,
          borderRadius: '50%',
          border: '1px solid var(--brass)',
          opacity: 0,
          pointerEvents: 'none',
          '--bx': '0px',
          animation: `bubbleRiseSmall 1.5s ease-out ${b.delay}ms forwards`,
        }} />
      ))}
    </div>
  )
}

/* ── Icons ────────────────────────────────────────────────────── */
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
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
    </svg>
  )
}
