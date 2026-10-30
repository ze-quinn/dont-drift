import { ACTIVITIES } from '../../constants/activities'
import { ACTIVITY_META, ACTIVITY_DONE_KEYS, doneKeysFor } from '../../constants/mandatory'
import { useStore } from '../../store/useStore'
import { useNavigate } from 'react-router-dom'
import SeaAnimalIllustration from '../SeaAnimalIllustration'

export default function TaskList() {
  const isLoggedToday = useStore(s => s.isLoggedToday)
  const mandatory = useStore(s => s.mandatoryActivities)
  const navigate = useNavigate()
  const dow = new Date().getDay()

  // Today's schedule comes from the user's mandatory list (Settings), not constants.
  const scheduled = mandatory
    .filter(m => m.scheduledDays.includes(dow))
    .map(m => ({
      id: m.id,
      icon: m.icon ?? ACTIVITY_META[m.activityId]?.icon,
      label: m.label,
      penalty: m.penalty,
      doneKeys: doneKeysFor(m),
    }))
  const mandatoryIds = new Set(mandatory.map(m => m.activityId))
  const optional = Object.values(ACTIVITIES).filter(
    a => !mandatoryIds.has(a.id) && ACTIVITY_DONE_KEYS[a.id]
  )

  const loggedAny = keys => keys.some(k => isLoggedToday(k))
  const isOptionalDone = a => loggedAny(ACTIVITY_DONE_KEYS[a.id])

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

      {scheduled.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, opacity: 0.3 }}>
            <SeaAnimalIllustration animal="Manta Ray" size={56} color="var(--aqua)" opacity={1} />
          </div>
          <div className="label-xs">No scheduled tasks today — calm waters</div>
        </div>
      )}

      <div>
        {scheduled.map((activity) => {
          const done = loggedAny(activity.doneKeys)

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

              {!done && (
                <span className="label-xs" style={{ color: 'var(--negative)' }}>
                  {Math.abs(activity.penalty)} if missed
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
                color: isOptionalDone(a) ? 'var(--brass)' : 'var(--text-3)',
                background: isOptionalDone(a) ? 'rgba(201,168,76,0.08)' : 'transparent',
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
