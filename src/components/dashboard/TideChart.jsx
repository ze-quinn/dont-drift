import { useStore } from '../../store/useStore'
import { dailyTotalsMap, dayKey } from '../../lib/stats'

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
export default function TideChart() {
  const logs = useStore(s => s.logs)
  const totals = dailyTotalsMap(logs)
  const dates = weekDates()
  const todayStr = new Date().toDateString()

  const values = dates.map(d => totals[d.toDateString()] ?? 0)
  const net = values.reduce((a, b) => a + b, 0)
  const maxAbs = Math.max(30, ...values.map(v => Math.abs(v)))

  const mid  = H / 2
  const half = mid - PAD_Y
  const x = i => PAD_X + (i * (W - PAD_X * 2)) / 6
  const y = v => mid - (v / maxAbs) * half

  const linePts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const areaPts = `${x(0)},${mid} ${linePts} ${x(6)},${mid}`

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
      </svg>

      <div className="flex justify-between px-1 mt-1">
        {dates.map((d, i) => (
          <span key={i} className="label-xs" style={{ color: d.toDateString() === todayStr ? 'var(--aqua)' : 'var(--text-3)' }}>
            {DAYS_SHORT[d.getDay()]}
          </span>
        ))}
      </div>
    </div>
  )
}
