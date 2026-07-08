import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { dailyTotalsMap } from '../../lib/stats'

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const W = 300, H = 110, PAD_X = 16, PAD_Y = 14

function weekDates() {
  const today = new Date()
  const dow = today.getDay()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dow + i)
    return d
  })
}

// Net bubbles per day across the current week, drawn as a tide line above/below
// a zero "surface" line. Dipping below the line = a drifting day.
// Tap / hover a day to see that day's logged activities.
export default function TideChart() {
  const logs = useStore(s => s.logs)
  const totals = dailyTotalsMap(logs)
  const dates = weekDates()
  const todayStr = new Date().toDateString()
  const [selected, setSelected] = useState(null) // day index or null

  const values = dates.map(d => totals[d.toDateString()] ?? 0)
  const net = values.reduce((a, b) => a + b, 0)
  const maxAbs = Math.max(30, ...values.map(v => Math.abs(v)))

  const mid  = H / 2
  const half = mid - PAD_Y
  const x = i => PAD_X + (i * (W - PAD_X * 2)) / 6
  const y = v => mid - (v / maxAbs) * half

  const linePts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const areaPts = `${x(0)},${mid} ${linePts} ${x(6)},${mid}`

  const selLogs = selected == null ? [] : logs.filter(
    l => new Date(l.date).toDateString() === dates[selected].toDateString()
  )

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="label-xs">This week's tide</div>
        <div className="font-mono font-bold" style={{ fontSize: '0.9rem', color: net >= 0 ? 'var(--brass)' : 'var(--negative)' }}>
          {net >= 0 ? '+' : ''}{net}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Weekly bubble tide">
        <defs>
          <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--aqua)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--aqua)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Zero / surface line */}
        <line x1="0" y1={mid} x2={W} y2={mid} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 4" />

        {/* Tide */}
        <polygon points={areaPts} fill="url(#tideFill)" />
        <polyline points={linePts} fill="none" stroke="var(--aqua)" strokeWidth="2" strokeLinejoin="round" />

        {/* Selected-day marker line */}
        {selected != null && (
          <line x1={x(selected)} y1={PAD_Y} x2={x(selected)} y2={H - PAD_Y}
            stroke="var(--brass)" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
        )}

        {/* Day markers */}
        {values.map((v, i) => {
          const isToday = dates[i].toDateString() === todayStr
          if (v === 0 && !isToday) return null
          return (
            <circle key={i} cx={x(i)} cy={y(v)} r={isToday ? 4 : 3}
              fill={isToday ? 'var(--bg-panel)' : 'var(--aqua)'}
              stroke={isToday ? 'var(--brass)' : 'none'} strokeWidth="2" />
          )
        })}

        {/* Invisible tap targets — full-height column per day */}
        {values.map((_, i) => (
          <rect key={`hit-${i}`}
            x={x(i) - (W - PAD_X * 2) / 12} y="0"
            width={(W - PAD_X * 2) / 6} height={H}
            fill="transparent" style={{ cursor: 'pointer' }}
            onClick={() => setSelected(s => (s === i ? null : i))}
          />
        ))}
      </svg>

      <div className="flex justify-between px-1 mt-1">
        {dates.map((d, i) => (
          <span key={i} className="label-xs"
            style={{
              color: selected === i ? 'var(--brass)'
                : d.toDateString() === todayStr ? 'var(--aqua)' : 'var(--text-3)',
              cursor: 'pointer',
            }}
            onClick={() => setSelected(s => (s === i ? null : i))}
          >
            {DAYS_SHORT[d.getDay()]}
          </span>
        ))}
      </div>

      {/* Day detail — activities logged on the selected day */}
      {selected != null && (
        <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: '1px solid var(--border-dim)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="label-xs">
              {dates[selected].toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
            <span className="font-mono text-xs font-bold"
              style={{ color: values[selected] >= 0 ? 'var(--brass)' : 'var(--negative)' }}>
              {values[selected] > 0 ? '+' : ''}{values[selected]}
            </span>
          </div>
          {selLogs.length === 0 ? (
            <div className="label-xs" style={{ color: 'var(--text-3)' }}>Nothing logged this day</div>
          ) : (
            selLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-1">
                <span className="text-xs" style={{ color: 'var(--text-2)' }}>{log.label}</span>
                <span className="font-mono text-xs font-bold"
                  style={{ color: log.delta >= 0 ? 'var(--brass)' : 'var(--negative)' }}>
                  {log.delta > 0 ? '+' : ''}{log.delta}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
