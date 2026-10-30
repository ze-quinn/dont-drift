import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { ACTIVITY_META, SUBSTITUTABLE } from '../../constants/mandatory'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] // getDay 0–6

function missedKeyFor(id) {
  if (id === 'run') return 'SKIPPED_RUN'
  if (id === 'shoulder') return 'SHOULDER_MISSED'
  return `MISSED_${id.toUpperCase()}`
}

function DayChips({ days, onToggle }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {DAY_LABELS.map((lbl, i) => {
        const on = days.includes(i)
        return (
          <button
            key={i}
            onClick={() => onToggle(i)}
            style={{
              width: 28, height: 28, borderRadius: 2, cursor: 'pointer',
              fontSize: '0.65rem', fontFamily: 'DM Sans, sans-serif', fontWeight: on ? 700 : 600,
              background: on ? 'var(--brass)' : 'transparent',
              color: on ? 'var(--bg)' : 'var(--text-3)',
              border: on ? 'none' : '1px dashed var(--border-dim)',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            {lbl}
          </button>
        )
      })}
    </div>
  )
}

function PenaltyStepper({ value, onChange }) {
  const step = (d) => onChange(Math.min(100, Math.max(5, value + d)))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button onClick={() => step(-5)} style={stepBtn}>−</button>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--negative)', minWidth: 34, textAlign: 'center' }}>
        −{value}
      </span>
      <button onClick={() => step(5)} style={stepBtn}>+</button>
    </div>
  )
}

const stepBtn = {
  width: 24, height: 24, borderRadius: 1, cursor: 'pointer',
  background: 'var(--bg-input)', border: '1px solid var(--border-dim)',
  color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

function StrictToggle({ anyWorkout, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
      <span className="label-xs">Counts as done</span>
      <div style={{ display: 'flex', border: '1px solid var(--border-dim)', borderRadius: 2, overflow: 'hidden' }}>
        {[['Only this', false], ['Any workout', true]].map(([lbl, val]) => (
          <button
            key={lbl}
            onClick={() => onChange(val)}
            style={{
              padding: '4px 10px', fontSize: '0.62rem', cursor: 'pointer', border: 'none',
              fontFamily: 'DM Sans, sans-serif', fontWeight: anyWorkout === val ? 700 : 600,
              background: anyWorkout === val ? 'var(--brass)' : 'transparent',
              color: anyWorkout === val ? 'var(--bg)' : 'var(--text-3)',
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MandatoryActivities() {
  const mandatory = useStore(s => s.mandatoryActivities)
  const addMandatoryActivity    = useStore(s => s.addMandatoryActivity)
  const updateMandatoryActivity = useStore(s => s.updateMandatoryActivity)
  const removeMandatoryActivity = useStore(s => s.removeMandatoryActivity)

  const present = new Set(mandatory.map(m => m.activityId))
  const available = Object.keys(ACTIVITY_META).filter(k => !present.has(k))
  const [picked, setPicked] = useState(available[0] ?? '')

  function toggleDay(m, dayIdx) {
    const removing = m.scheduledDays.includes(dayIdx)
    const days = removing
      ? m.scheduledDays.filter(d => d !== dayIdx)
      : [...m.scheduledDays, dayIdx].sort((a, b) => a - b)
    // Newly scheduled day → no back-charging for earlier occurrences of that weekday.
    updateMandatoryActivity(m.id, removing
      ? { scheduledDays: days }
      : { scheduledDays: days, startDate: new Date().toDateString() })
  }

  function addPicked() {
    if (!picked) return
    const meta = ACTIVITY_META[picked]
    addMandatoryActivity({
      id: picked, activityId: picked,
      label: meta.label, icon: meta.icon,
      scheduledDays: [1, 2, 3, 4, 5, 6], penalty: 20,
      missedKey: missedKeyFor(picked), anyWorkout: false,
      startDate: new Date().toDateString(),
    })
    const remaining = available.filter(k => k !== picked)
    setPicked(remaining[0] ?? '')
  }

  return (
    <div className="panel" style={{ padding: 20, marginBottom: 12 }}>
      <div className="label-xs" style={{ color: 'var(--brass)', marginBottom: 4 }}>Mandatory activities</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>
        Miss one on a scheduled day and you lose bubbles automatically.
      </div>

      {mandatory.length === 0 && (
        <div className="label-xs" style={{ color: 'var(--text-3)', marginBottom: 12 }}>
          None — you won't be penalised for skipping anything.
        </div>
      )}

      {mandatory.map(m => (
        <div key={m.id} style={{ border: '1px solid var(--border-dim)', borderRadius: 3, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-1)', fontFamily: 'DM Sans, sans-serif' }}>{m.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <PenaltyStepper value={m.penalty} onChange={v => updateMandatoryActivity(m.id, { penalty: v })} />
              <button
                onClick={() => removeMandatoryActivity(m.id)}
                aria-label={`Remove ${m.label}`}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          </div>
          <DayChips days={m.scheduledDays} onToggle={i => toggleDay(m, i)} />
          {SUBSTITUTABLE.has(m.activityId) && (
            <StrictToggle anyWorkout={m.anyWorkout} onChange={v => updateMandatoryActivity(m.id, { anyWorkout: v })} />
          )}
        </div>
      ))}

      {available.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <select
            value={picked}
            onChange={e => setPicked(e.target.value)}
            style={{
              flex: 1, padding: '9px 10px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
              background: 'var(--bg-input)', border: '1px solid var(--border-dim)', borderRadius: 1,
              color: 'var(--text-1)', outline: 'none',
            }}
          >
            {available.map(k => (
              <option key={k} value={k}>{ACTIVITY_META[k].icon} {ACTIVITY_META[k].label}</option>
            ))}
          </select>
          <button className="btn-ghost" style={{ padding: '9px 18px', whiteSpace: 'nowrap' }} onClick={addPicked}>
            + Add
          </button>
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
        New penalties start from today — your history is never charged retroactively. Removing an activity keeps past penalties but stops future ones.
      </div>
    </div>
  )
}
