import { useState } from 'react'
import { useStore } from '../../store/useStore'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getWeekDates() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    return d
  })
}

function DayDetail({ date, logs, onClose }) {
  const total = logs.reduce((s, l) => s + l.delta, 0)
  const label = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
        borderRadius: '4px 4px 0 0',
        padding: '0 0 env(safe-area-inset-bottom)',
        maxHeight: '70vh',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.4)',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div className="font-serif font-light" style={{ fontSize: '1.4rem', color: 'var(--text-1)', lineHeight: 1 }}>
              {label}
            </div>
            {logs.length > 0 && (
              <div className="label-xs" style={{ marginTop: 4 }}>
                Total:{' '}
                <span style={{ color: total >= 0 ? 'var(--brass)' : 'var(--negative)' }}>
                  {total > 0 ? '+' : ''}{total} bubbles
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
            <svg viewBox="0 0 10 10" fill="none" width="12" height="12">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        {/* Brass rule */}
        <div style={{ height: 1, background: 'var(--border-dim)', margin: '0 20px' }} />

        {/* Log entries */}
        <div style={{ overflowY: 'auto', padding: '8px 20px 20px' }}>
          {logs.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <div className="label-xs" style={{ color: 'var(--text-3)' }}>Nothing logged</div>
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={log.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 0',
                  borderBottom: i < logs.length - 1 ? '1px solid var(--border-dim)' : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-1)', fontFamily: 'DM Sans, sans-serif' }}>
                    {log.label}
                  </div>
                  {log.note && (
                    <div className="label-xs" style={{ marginTop: 2, color: 'var(--text-3)' }}>{log.note}</div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 12 }}>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '0.875rem', fontWeight: 700,
                    color: log.delta >= 0 ? 'var(--brass)' : 'var(--negative)',
                  }}>
                    {log.delta > 0 ? '+' : ''}{log.delta}
                  </span>
                  <span className="label-xs tabular-nums" style={{ color: 'var(--text-3)' }}>
                    {new Date(log.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  )
}

export default function WeekView() {
  const logs = useStore(s => s.logs)
  const weekDates = getWeekDates()
  const todayStr  = new Date().toDateString()
  const [selectedDate, setSelectedDate] = useState(null)

  function getDayLogs(date) {
    return logs.filter(l => new Date(l.date).toDateString() === date.toDateString())
  }

  const selectedDayLogs = selectedDate ? getDayLogs(selectedDate) : []

  return (
    <>
      <div>
        <div className="label-xs mb-3">This week</div>
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((date, i) => {
            const isToday    = date.toDateString() === todayStr
            const dayLogs    = getDayLogs(date)
            const total      = dayLogs.reduce((s, l) => s + l.delta, 0)
            const hasActivity = dayLogs.some(l => l.delta > 0)
            const isFuture   = date > new Date() && !isToday

            return (
              <button
                key={i}
                onClick={() => !isFuture && setSelectedDate(date)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  background: 'none', border: 'none',
                  cursor: isFuture ? 'default' : 'pointer',
                  padding: '2px 0', borderRadius: 1,
                  opacity: isFuture ? 0.35 : 1,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span className="label-xs">{DAYS_SHORT[date.getDay()]}</span>

                <div style={{
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
                  transition: 'background 0.1s, border-color 0.1s',
                }}>
                  {date.getDate()}
                </div>

                {/* Activity dots */}
                <div style={{ display: 'flex', gap: 2, minHeight: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {dayLogs.slice(0, 3).map((l, j) => (
                    <div key={j} style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: l.delta > 0 ? 'var(--brass)' : 'var(--negative)',
                      opacity: 0.8,
                    }} />
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
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <DayDetail
          date={selectedDate}
          logs={selectedDayLogs}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  )
}
