import { useStore } from '../../store/useStore'
import { currentStreak, dayKey } from '../../lib/stats'

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function weekDates() {
  const today = new Date()
  const dow = today.getDay()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dow + i)
    return d
  })
}

// Consecutive-days-logged streak, with a 7-day fill strip for the current week.
export default function StreaksCard() {
  const logs = useStore(s => s.logs)
  const streak = currentStreak(logs)
  const logged = new Set(logs.map(l => dayKey(l.date)))
  const todayStr = new Date().toDateString()
  const dates = weekDates()

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="label-xs">Current streak</div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono font-bold" style={{ fontSize: '1.5rem', color: streak > 0 ? 'var(--brass)' : 'var(--text-3)', lineHeight: 1 }}>
            {streak}
          </span>
          <span className="label-xs">{streak === 1 ? 'day' : 'days'}</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {dates.map((d, i) => {
          const isToday  = d.toDateString() === todayStr
          const isFuture = d > new Date() && !isToday
          const did      = logged.has(d.toDateString())
          return (
            <div key={i} className="flex-1 text-center">
              <div className={did ? 'streak-shimmer' : ''} style={{
                animationDelay: did ? `${i * 90 + 200}ms` : undefined,
                height: 26, borderRadius: 2,
                background: did ? (isToday ? 'var(--aqua)' : 'var(--brass)') : 'transparent',
                border: did ? 'none' : `1px dashed ${isFuture ? 'var(--border-dim)' : 'var(--border)'}`,
                opacity: isFuture ? 0.4 : 1,
                transition: 'background 0.2s',
              }} />
              <div className="label-xs" style={{ marginTop: 4, color: isToday ? 'var(--aqua)' : 'var(--text-3)' }}>
                {DAYS_SHORT[d.getDay()]}
              </div>
            </div>
          )
        })}
      </div>

      {streak > 0 && !logged.has(todayStr) && (
        <div className="label-xs" style={{ marginTop: 12, textAlign: 'center', color: 'var(--aqua)' }}>
          Keep it alive — log something today
        </div>
      )}
    </div>
  )
}
