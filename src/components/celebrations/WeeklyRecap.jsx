import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { lastWeekStats, weekKey } from '../../lib/stats'

// Monday-morning recap of the week just gone. Appears at the top of the
// dashboard, dismissable, shown once per week.
export default function WeeklyRecap() {
  const logs = useStore(s => s.logs)
  const isMonday = new Date().getDay() === 1
  const stats = lastWeekStats(logs)

  const storageKey = `dd-recap-${weekKey()}`
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(storageKey) === '1' } catch { return false }
  })

  if (!isMonday || !stats.hasData || dismissed) return null

  function dismiss() {
    try { localStorage.setItem(storageKey, '1') } catch (_) {}
    setDismissed(true)
  }

  const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'relative',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 2, padding: '18px 20px', marginBottom: 20,
      }}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
      >
        ×
      </button>

      <div className="label-xs" style={{ color: 'var(--aqua)', marginBottom: 2 }}>Last week</div>
      <div className="font-serif font-light" style={{ fontSize: '1.25rem', color: 'var(--text-1)', marginBottom: 14 }}>
        {fmt(stats.start)} – {fmt(stats.end)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
        <Stat value={`${stats.net >= 0 ? '+' : ''}${stats.net}`} label="bubbles" positive={stats.net >= 0} />
        <Stat value={stats.daysActive} label="active days" />
        <Stat value={`+${stats.best}`} label="best day" />
      </div>
    </div>
  )
}

function Stat({ value, label, positive = true }) {
  return (
    <div>
      <div className="font-mono font-bold" style={{ fontSize: '1.3rem', color: positive ? 'var(--brass)' : 'var(--negative)' }}>
        {value}
      </div>
      <div className="label-xs" style={{ marginTop: 2 }}>{label}</div>
    </div>
  )
}
