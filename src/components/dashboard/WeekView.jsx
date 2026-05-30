import { useStore } from '../../store/useStore'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getWeekDates() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    return d
  })
}

export default function WeekView() {
  const logs = useStore(s => s.logs)
  const weekDates = getWeekDates()
  const todayStr = new Date().toDateString()

  function getDayLogs(date) {
    return logs.filter(l => new Date(l.date).toDateString() === date.toDateString())
  }

  return (
    <div>
      <div className="label-xs mb-3">This week</div>
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, i) => {
          const isToday = date.toDateString() === todayStr
          const dayLogs = getDayLogs(date)
          const total   = dayLogs.reduce((s, l) => s + l.delta, 0)
          const hasActivity = dayLogs.some(l => l.delta > 0)

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="label-xs">{DAYS[date.getDay()]}</span>

              <div
                style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontFamily: 'DM Mono, monospace',
                  fontWeight: isToday ? 700 : 400,
                  background: isToday
                    ? 'rgba(201,168,76,0.18)'
                    : hasActivity
                    ? 'rgba(201,168,76,0.07)'
                    : 'transparent',
                  border: isToday
                    ? '1px solid var(--border-strong)'
                    : '1px solid var(--border-dim)',
                  color: total < 0 ? 'var(--negative)' : 'var(--text-2)',
                  borderRadius: 1,
                }}
              >
                {date.getDate()}
              </div>

              {/* Activity dots */}
              <div style={{ display: 'flex', gap: 2, minHeight: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {dayLogs.slice(0, 3).map((l, j) => (
                  <div key={j} style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: l.delta > 0 ? 'var(--brass)' : 'var(--negative)',
                    opacity: 0.8,
                  }} title={l.label} />
                ))}
              </div>

              {total !== 0 && (
                <span style={{
                  fontSize: '0.5rem',
                  fontFamily: 'DM Mono, monospace',
                  color: total > 0 ? 'var(--brass-dim)' : 'var(--negative-dim)',
                }}>
                  {total > 0 ? '+' : ''}{total}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
