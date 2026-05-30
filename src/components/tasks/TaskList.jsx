import { ACTIVITIES, isScheduledDay } from '../../constants/activities'
import { useStore } from '../../store/useStore'
import { BUBBLE_RULES } from '../../constants/bubbles'
import { useNavigate } from 'react-router-dom'

export default function TaskList() {
  const isLoggedToday = useStore(s => s.isLoggedToday)
  const navigate = useNavigate()
  const today = new Date()

  const scheduled = Object.values(ACTIVITIES).filter(
    a => a.scheduledDays && isScheduledDay(a, today)
  )
  const optional = Object.values(ACTIVITIES).filter(
    a => a.optional && !a.scheduledDays
  )

  const doneToday = {
    run:      isLoggedToday('RUN_SHORT') || isLoggedToday('RUN_MID') || isLoggedToday('RUN_LONG'),
    shoulder: isLoggedToday('SHOULDER_DONE'),
    tennis:   isLoggedToday('TENNIS_SHORT') || isLoggedToday('TENNIS_MID') || isLoggedToday('TENNIS_LONG'),
    swim:     isLoggedToday('SWIM_SHORT') || isLoggedToday('SWIM_MID') || isLoggedToday('SWIM_LONG'),
    strength: isLoggedToday('STRENGTH'),
    yoga:     isLoggedToday('YOGA'),
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="label-xs">Today's schedule</div>
        <button
          onClick={() => navigate('/log')}
          className="label-xs px-3 py-1"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--brass)',
            background: 'transparent',
            cursor: 'pointer',
            borderRadius: 1,
            transition: 'border-color 0.15s',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          + Log
        </button>
      </div>

      <div>
        {scheduled.map((activity, i) => {
          const done = doneToday[activity.id]
          const penaltyDelta = activity.id === 'run'
            ? BUBBLE_RULES.SKIPPED_RUN.delta
            : BUBBLE_RULES.SHOULDER_MISSED.delta

          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 py-2.5"
              style={{ borderBottom: '1px solid var(--border-dim)' }}
            >
              {/* Checkbox */}
              <div style={{
                width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                background: done ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: done ? '1px solid var(--border-strong)' : '1px solid var(--border-dim)',
                borderRadius: 1,
              }}>
                {done && (
                  <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                    <polyline points="1.5,5 4,7.5 8.5,2" stroke="var(--brass)" strokeWidth="1.5" strokeLinecap="square"/>
                  </svg>
                )}
              </div>

              <span className="text-sm flex-1" style={{
                color: done ? 'var(--text-3)' : 'var(--text-1)',
                textDecoration: done ? 'line-through' : 'none',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                {activity.icon} {activity.label}
              </span>

              {activity.penaltyForSkip && !done && (
                <span className="label-xs" style={{ color: 'var(--negative)' }}>
                  {Math.abs(penaltyDelta)} if missed
                </span>
              )}
              {done && <span className="label-xs" style={{ color: 'var(--text-3)' }}>Done</span>}
            </div>
          )
        })}
      </div>

      {optional.length > 0 && (
        <div className="mt-4">
          <div className="label-xs mb-2" style={{ color: 'var(--text-3)' }}>Optional</div>
          <div className="flex flex-wrap gap-2">
            {optional.map(a => (
              <div key={a.id} style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                border: '1px solid var(--border-dim)',
                borderRadius: 1,
                color: doneToday[a.id] ? 'var(--brass)' : 'var(--text-3)',
                background: doneToday[a.id] ? 'rgba(201,168,76,0.08)' : 'transparent',
                fontFamily: 'DM Sans, sans-serif',
              }}>
                {a.icon} {a.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
