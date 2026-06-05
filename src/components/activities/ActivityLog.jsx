import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { BUBBLE_RULES } from '../../constants/bubbles'
import { isWeekend } from '../../constants/activities'
import { useAlertTrigger } from '../../context/AlertContext'

// ── Built-in options ──────────────────────────────────────────────────────────
const BUILTIN_GAINS = [
  { id: 'run',           label: '🏃 Run',               hasDuration: true,  getRule: m => m < 20 ? 'RUN_SHORT' : m < 40 ? 'RUN_MID' : 'RUN_LONG', saturdayBonus: true },
  { id: 'tennis',        label: '🎾 Tennis',             hasDuration: true,  getRule: m => m < 45 ? 'TENNIS_SHORT' : m < 75 ? 'TENNIS_MID' : 'TENNIS_LONG' },
  { id: 'swim',          label: '🏊 Swimming',           hasDuration: true,  getRule: m => m < 20 ? 'SWIM_SHORT' : m < 40 ? 'SWIM_MID' : 'SWIM_LONG' },
  { id: 'shoulder_done', label: '💪 Shoulder work',      ruleKey: 'SHOULDER_DONE' },
  { id: 'strength',      label: '🏋️ Functional strength', ruleKey: 'STRENGTH' },
  { id: 'yoga',          label: '🧘 Yoga / mobility',    ruleKey: 'YOGA' },
  { id: 'protein',       label: '🥤 Vegan protein',      ruleKey: 'PROTEIN_POWDER' },
  { id: 'sleep7',        label: '😴 Slept 7+ hours',     ruleKey: 'SLEEP_7' },
  { id: 'book',          label: '📚 Finished a book',    ruleKey: 'FINISHED_BOOK' },
]

const BUILTIN_PENALTIES = [
  { id: 'shoulder_missed', label: '💪 Missed shoulder work',  ruleKey: 'SHOULDER_MISSED' },
  { id: 'skipped_run',     label: '🏃 Skipped scheduled run', ruleKey: 'SKIPPED_RUN' },
  { id: 'woke_late',       label: '⏰ Woke up late',          ruleKey: 'WOKE_LATE' },
]

// Duration-based rule keys per built-in id — for "logged today" check
const DURATION_RULEKEYS = {
  run:    ['RUN_SHORT', 'RUN_MID', 'RUN_LONG'],
  swim:   ['SWIM_SHORT', 'SWIM_MID', 'SWIM_LONG'],
  tennis: ['TENNIS_SHORT', 'TENNIS_MID', 'TENNIS_LONG'],
}

// ── Bubble flash particles ────────────────────────────────────────────────────
const PARTICLES = [
  { x: -6,  size: 10, dur: 0.9, delay: 0.05 },
  { x:  0,  size: 14, dur: 1.1, delay: 0    },
  { x:  8,  size: 8,  dur: 0.8, delay: 0.15 },
  { x: -12, size: 6,  dur: 1.0, delay: 0.2  },
  { x:  14, size: 11, dur: 1.2, delay: 0.08 },
]

function BubbleFlash({ delta, onDone }) {
  const color = delta >= 0 ? 'var(--brass)' : 'var(--negative)'
  const glow  = delta >= 0 ? 'rgba(201,168,76,0.5)' : 'rgba(91,156,196,0.5)'
  return (
    <>
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'fixed', left: `calc(50% + ${p.x}px)`, top: '50%',
          width: p.size, height: p.size, borderRadius: '50%', background: color,
          opacity: 0, animation: `bubbleRise ${p.dur}s ease-out ${p.delay}s forwards`,
          pointerEvents: 'none', zIndex: 99, marginLeft: -p.size/2, marginTop: -p.size/2,
        }} />
      ))}
      <div className="animate-bubble-pop" onAnimationEnd={onDone} style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', zIndex: 100, pointerEvents: 'none',
        animationFillMode: 'forwards', animationDuration: '1.4s',
      }}>
        <div style={{
          padding: '20px 40px', background: color,
          color: delta >= 0 ? 'var(--bg)' : '#fff',
          borderRadius: 1, textAlign: 'center', boxShadow: `0 0 60px ${glow}`,
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
            {delta > 0 ? '+' : ''}{delta}
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', marginTop: 4, opacity: 0.8 }}>
            bubbles 🫧
          </div>
        </div>
      </div>
    </>
  )
}

// ── Delta picker helpers ──────────────────────────────────────────────────────
const POS_DELTAS = [10,20,30,40,50,60,80,100,120,150,200]
const NEG_DELTAS = [-10,-20,-30,-40,-50,-60,-80,-100]

function DeltaPicker({ value, onChange, isPenalty }) {
  const opts = isPenalty ? NEG_DELTAS : POS_DELTAS
  const accent = isPenalty ? 'var(--negative)' : 'var(--brass)'
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {opts.map(d => (
        <button key={d} onClick={() => onChange(d)}
          style={{
            padding: '5px 10px', borderRadius: 1, border: 'none', cursor: 'pointer',
            fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', fontWeight: 700,
            background: value === d ? accent : 'var(--bg-input)',
            color: value === d ? (isPenalty ? '#fff' : 'var(--bg)') : 'var(--text-2)',
            transition: 'background 0.1s',
          }}
        >
          {d > 0 ? '+' : ''}{d}
        </button>
      ))}
    </div>
  )
}

// ── Add-custom sheet ──────────────────────────────────────────────────────────
function AddActivitySheet({ forType, onAdd, onClose }) {
  const isPenalty = forType === 'penalty'
  const accent = isPenalty ? 'var(--negative)' : 'var(--brass)'

  const [icon,  setIcon]  = useState('⭐')
  const [label, setLabel] = useState('')
  const [delta, setDelta] = useState(isPenalty ? -20 : 30)
  const [timed, setTimed] = useState(false)
  const [tiers, setTiers] = useState([
    { maxMin: 20, delta: isPenalty ? -10 : 20 },
    { maxMin: 40, delta: isPenalty ? -20 : 35 },
    { maxMin: null, delta: isPenalty ? -30 : 50 },
  ])

  function updateTier(i, key, val) {
    setTiers(t => t.map((tier, idx) => idx === i ? { ...tier, [key]: val } : tier))
  }

  function handleAdd() {
    if (!label.trim()) return
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2,6)}`
    if (timed) {
      onAdd({ id, icon, label: `${icon} ${label}`, type: forType, hasDuration: true, tiers })
    } else {
      onAdd({ id, icon, label: `${icon} ${label}`, type: forType, hasDuration: false, delta })
    }
    onClose()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-panel)', borderTop: '1px solid var(--border)',
        borderRadius: '4px 4px 0 0',
        padding: '0 20px env(safe-area-inset-bottom)',
        maxHeight: '88vh', overflowY: 'auto',
        animation: 'actSheetUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.4)',
      }}>
        <style>{`@keyframes actSheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--border)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 0 16px' }}>
          <div className="font-serif font-light" style={{ fontSize: '1.3rem', color: accent }}>
            Add {isPenalty ? 'penalty' : 'activity'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
            <svg viewBox="0 0 10 10" fill="none" width="12" height="12">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        {/* Icon + Label */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div>
            <div className="label-xs" style={{ marginBottom: 6 }}>Icon</div>
            <input
              value={icon} onChange={e => setIcon(e.target.value.slice(-2) || '⭐')}
              style={{
                width: 52, height: 44, textAlign: 'center', fontSize: '1.4rem',
                background: 'var(--bg-input)', border: '1px solid var(--border-dim)',
                borderRadius: 1, color: 'var(--text-1)', outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div className="label-xs" style={{ marginBottom: 6 }}>Name</div>
            <input
              value={label} onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Climbing, Cold shower…"
              style={{
                width: '100%', height: 44, padding: '0 12px', boxSizing: 'border-box',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem',
                background: 'var(--bg-input)', border: '1px solid var(--border-dim)',
                borderRadius: 1, color: 'var(--text-1)', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'}
            />
          </div>
        </div>

        {/* Duration toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div className="label-xs" style={{ flex: 1 }}>Duration-based (like run / tennis)</div>
          <button
            onClick={() => setTimed(t => !t)}
            style={{
              width: 40, height: 22, borderRadius: 11,
              background: timed ? accent : 'var(--border)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3, left: timed ? 21 : 3,
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {!timed ? (
          <div style={{ marginBottom: 20 }}>
            <div className="label-xs" style={{ marginBottom: 10 }}>Bubbles</div>
            <DeltaPicker value={delta} onChange={setDelta} isPenalty={isPenalty} />
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <div className="label-xs" style={{ marginBottom: 12 }}>Duration tiers</div>
            {tiers.map((tier, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div className="label-xs" style={{ marginBottom: 6 }}>
                  {i === 0
                    ? `Short (< ${tier.maxMin ?? '?'} min)`
                    : i === 1
                    ? `Mid (${tiers[0].maxMin}–${tier.maxMin ?? '?'} min)`
                    : `Long (${tiers[1].maxMin}+ min)`}
                  {i < 2 && (
                    <span style={{ marginLeft: 8 }}>
                      — threshold:
                      <input
                        type="number" value={tier.maxMin ?? ''} min={5} max={120} step={5}
                        onChange={e => updateTier(i, 'maxMin', Number(e.target.value))}
                        style={{
                          marginLeft: 6, width: 52, padding: '2px 6px',
                          fontFamily: 'DM Mono, monospace', fontSize: '0.75rem',
                          background: 'var(--bg-input)', border: '1px solid var(--border-dim)',
                          borderRadius: 1, color: 'var(--text-1)', outline: 'none',
                        }}
                      />
                      <span className="label-xs" style={{ marginLeft: 4 }}>min</span>
                    </span>
                  )}
                </div>
                <DeltaPicker value={tier.delta} onChange={v => updateTier(i, 'delta', v)} isPenalty={isPenalty} />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!label.trim()}
          className="btn-brass"
          style={{ width: '100%', marginBottom: 16, opacity: label.trim() ? 1 : 0.4 }}
        >
          Add to {isPenalty ? 'penalties' : 'gains'}
        </button>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ActivityLog() {
  const addBubbles           = useStore(s => s.addBubbles)
  const isLoggedToday        = useStore(s => s.isLoggedToday)
  const allLogs              = useStore(s => s.logs)
  const customActivities     = useStore(s => s.customActivities)
  const removedActivities    = useStore(s => s.removedActivities)
  const addCustomActivity    = useStore(s => s.addCustomActivity)
  const removeActivity       = useStore(s => s.removeActivity)
  const removeCustomActivity = useStore(s => s.removeCustomActivity)
  const { showAlert } = useAlertTrigger()

  const todayStr  = new Date().toDateString()
  const todayLogs = allLogs.filter(l => new Date(l.date).toDateString() === todayStr)

  const [tab,      setTab]      = useState('activity')
  const [selected, setSelected] = useState(null)
  const [duration, setDuration] = useState(30)
  const [note,     setNote]     = useState('')
  const [flash,    setFlash]    = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [addSheet, setAddSheet] = useState(null) // null | 'gain' | 'penalty'

  const weekend    = isWeekend()
  const isSaturday = new Date().getDay() === 6

  // Build visible option lists
  const gains = [
    ...BUILTIN_GAINS.filter(o => !removedActivities.includes(o.id)),
    ...customActivities.filter(a => a.type === 'gain'),
  ]
  const penalties = [
    ...BUILTIN_PENALTIES.filter(o => !removedActivities.includes(o.id)),
    ...customActivities.filter(a => a.type === 'penalty'),
  ]
  const currentOptions = tab === 'activity' ? gains : penalties
  const selectedOpt    = currentOptions.find(o => o.id === selected)

  function isActivityLoggedToday(opt) {
    if (!opt.hasDuration && opt.ruleKey)   return isLoggedToday(opt.ruleKey)
    if (opt.hasDuration && DURATION_RULEKEYS[opt.id])
      return DURATION_RULEKEYS[opt.id].some(k => todayLogs.some(l => l.ruleKey === k))
    if (!opt.hasDuration && !opt.ruleKey)  return isLoggedToday(opt.id)
    if (opt.hasDuration && opt.tiers)
      return opt.tiers.some((_, i) => isLoggedToday(`${opt.id}_t${i}`))
    return false
  }

  function handleRemove(opt) {
    const isBuiltIn = BUILTIN_GAINS.find(b => b.id === opt.id) || BUILTIN_PENALTIES.find(b => b.id === opt.id)
    if (isBuiltIn) removeActivity(opt.id)
    else removeCustomActivity(opt.id)
    if (selected === opt.id) setSelected(null)
  }

  function handleSubmit() {
    if (!selected || !selectedOpt) return
    let totalDelta = 0

    if (selectedOpt.ruleKey) {
      const rule = BUBBLE_RULES[selectedOpt.ruleKey]
      if (!rule) return
      addBubbles(selectedOpt.ruleKey, rule.label, rule.delta, note)
      totalDelta = rule.delta
    } else if (selectedOpt.hasDuration && selectedOpt.getRule) {
      // built-in duration
      const ruleKey = selectedOpt.getRule(duration)
      const rule    = BUBBLE_RULES[ruleKey]
      addBubbles(ruleKey, rule.label, rule.delta, `${duration} min${note ? ' — ' + note : ''}`)
      totalDelta += rule.delta
      if (selectedOpt.saturdayBonus && isSaturday) {
        const bonus = BUBBLE_RULES.RUN_SATURDAY_BONUS
        addBubbles('RUN_SATURDAY_BONUS', bonus.label, bonus.delta)
        totalDelta += bonus.delta
      }
    } else if (selectedOpt.hasDuration && selectedOpt.tiers) {
      // custom duration
      const tierIdx = selectedOpt.tiers.findIndex((t, i) =>
        i === selectedOpt.tiers.length - 1 ? true : duration < t.maxMin
      )
      const tier = selectedOpt.tiers[tierIdx]
      addBubbles(`${selectedOpt.id}_t${tierIdx}`, `${selectedOpt.label} (${duration} min)`, tier.delta, note)
      totalDelta = tier.delta
    } else if (!selectedOpt.hasDuration && selectedOpt.delta !== undefined) {
      // custom fixed
      addBubbles(selectedOpt.id, selectedOpt.label, selectedOpt.delta, note)
      totalDelta = selectedOpt.delta
    }

    setFlash(totalDelta)
    setSelected(null)
    setNote('')
    setDuration(30)
    setTimeout(() => showAlert('general'), 2200)
  }

  const accentColor = tab === 'penalty' ? 'var(--negative)' : 'var(--brass)'
  const accentRgba  = tab === 'penalty' ? 'rgba(91,156,196,0.1)' : 'rgba(201,168,76,0.1)'

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="label-xs" style={{ marginBottom: 6 }}>Record</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 className="font-serif font-light" style={{ fontSize: '3rem', color: 'var(--text-1)', margin: 0, lineHeight: 1 }}>
            Log
          </h1>
          <button
            onClick={() => { setEditMode(e => !e); setSelected(null) }}
            style={{
              background: editMode ? 'rgba(201,168,76,0.12)' : 'none',
              border: editMode ? '1px solid var(--brass)' : '1px solid var(--border-dim)',
              borderRadius: 1, padding: '5px 10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: editMode ? 'var(--brass)' : 'var(--text-3)',
              marginBottom: 4, flexShrink: 0,
            }}
          >
            {editMode ? 'Done' : '✏ Edit'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ height: 1, width: 80, background: 'var(--brass)' }} />
          <div style={{ height: 1, width: 16, background: 'var(--brass)', opacity: 0.4 }} />
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 1, marginBottom: 24, overflow: 'hidden' }}>
        {[{ key: 'activity', label: '+ Gain' }, { key: 'penalty', label: '− Penalty' }].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSelected(null) }}
            style={{
              padding: '8px 20px',
              fontSize: '0.65rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              background: tab === t.key ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: tab === t.key ? 'var(--brass)' : 'var(--text-3)',
              borderBottom: tab === t.key ? '2px solid var(--brass)' : '2px solid transparent',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Weekend note */}
      {weekend && tab === 'penalty' && (
        <div style={{
          marginBottom: 16, padding: '8px 14px', fontSize: '0.75rem',
          background: 'rgba(126,207,192,0.08)', border: '1px solid rgba(126,207,192,0.25)',
          color: 'var(--aqua)', borderRadius: 1, fontFamily: 'DM Sans, sans-serif',
        }}>
          It's the weekend — food and alcohol penalties don't apply. Enjoy it.
        </div>
      )}

      {/* Options grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 8, marginBottom: 20 }}>
        {currentOptions.map(opt => {
          const isSelected = selected === opt.id
          const doneToday  = isActivityLoggedToday(opt)
          const preview    = opt.ruleKey
            ? BUBBLE_RULES[opt.ruleKey]?.delta
            : (opt.hasDuration ? null : (opt.delta ?? null))

          return (
            <div key={opt.id} style={{ position: 'relative' }}>
              {editMode && (
                <button
                  onClick={() => handleRemove(opt)}
                  style={{
                    position: 'absolute', top: -6, right: -6, zIndex: 2,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--negative)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0,
                  }}
                >
                  <svg viewBox="0 0 8 8" fill="none" width="8" height="8">
                    <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" stroke="#fff" strokeWidth="1.5"/>
                    <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" stroke="#fff" strokeWidth="1.5"/>
                  </svg>
                </button>
              )}
              <button
                onClick={() => !editMode && setSelected(opt.id === selected ? null : opt.id)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', textAlign: 'left',
                  background: isSelected ? accentRgba : doneToday ? 'rgba(201,168,76,0.05)' : 'transparent',
                  border: isSelected
                    ? `1px solid ${accentColor}`
                    : doneToday
                    ? '1px solid rgba(201,168,76,0.35)'
                    : '1px solid var(--border-dim)',
                  borderRadius: 1, cursor: editMode ? 'default' : 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--text-2)', fontFamily: 'DM Sans, sans-serif', flex: 1 }}>
                  {opt.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {doneToday && (
                    <svg viewBox="0 0 10 10" fill="none" width="9" height="9" style={{ opacity: 0.7 }}>
                      <polyline points="1.5,5 4,7.5 8.5,2" stroke="var(--brass)" strokeWidth="1.5" strokeLinecap="square"/>
                    </svg>
                  )}
                  {preview !== null && preview !== undefined && (
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', fontWeight: 700,
                      color: preview >= 0 ? 'var(--brass)' : 'var(--negative)',
                    }}>
                      {preview > 0 ? '+' : ''}{preview}
                    </span>
                  )}
                </div>
              </button>
            </div>
          )
        })}

        {/* Add new tile (edit mode) */}
        {editMode && (
          <button
            onClick={() => setAddSheet(tab === 'activity' ? 'gain' : 'penalty')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 14px', border: `1px dashed ${accentColor}`,
              borderRadius: 1, background: 'transparent', cursor: 'pointer',
              color: accentColor, fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
            Add {tab === 'activity' ? 'activity' : 'penalty'}
          </button>
        )}
      </div>

      {/* Duration slider (normal mode only) */}
      {!editMode && selectedOpt?.hasDuration && (
        <div className="panel animate-slide-up" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span className="label-xs">Duration</span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.875rem', color: 'var(--brass)' }}>
              {duration} min
            </span>
          </div>
          <input
            type="range" min="10" max="120" step="5" value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--brass)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span className="label-xs">10 min</span>
            <span className="label-xs">2 hrs</span>
          </div>
          {selectedOpt.saturdayBonus && isSaturday && (
            <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--aqua)', fontFamily: 'DM Sans, sans-serif' }}>
              Saturday — +20 bonus bubbles will also be added
            </div>
          )}
          {/* Custom tier preview */}
          {selectedOpt.tiers && (() => {
            const tierIdx = selectedOpt.tiers.findIndex((t, i) =>
              i === selectedOpt.tiers.length - 1 ? true : duration < t.maxMin
            )
            const d = selectedOpt.tiers[tierIdx]?.delta
            return d !== undefined ? (
              <div style={{ marginTop: 6, fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: accentColor }}>
                {d > 0 ? '+' : ''}{d} bubbles at this duration
              </div>
            ) : null
          })()}
        </div>
      )}

      {/* Note field (normal mode only) */}
      {!editMode && selected && (
        <div style={{ marginBottom: 20 }} className="animate-slide-up">
          <input
            type="text" placeholder="Optional note…" value={note}
            onChange={e => setNote(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
              background: 'var(--bg-input)', border: '1px solid var(--border-dim)',
              borderRadius: 1, color: 'var(--text-1)', outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'}
          />
        </div>
      )}

      {!editMode && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="btn-brass"
          style={{ width: '100%', opacity: selected ? 1 : 0.35, cursor: selected ? 'pointer' : 'not-allowed' }}
        >
          Log it
        </button>
      )}

      {flash !== null && <BubbleFlash delta={flash} onDone={() => setFlash(null)} />}

      {addSheet && (
        <AddActivitySheet
          forType={addSheet}
          onAdd={addCustomActivity}
          onClose={() => setAddSheet(null)}
        />
      )}
    </div>
  )
}
