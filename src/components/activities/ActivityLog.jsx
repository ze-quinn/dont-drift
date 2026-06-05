import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { BUBBLE_RULES } from '../../constants/bubbles'
import { isWeekend } from '../../constants/activities'
import { useAlertTrigger } from '../../context/AlertContext'

const ACTIVITY_OPTIONS = [
  { id: 'run',           label: '🏃 Run',                  hasDuration: true,  getRule: m => m < 20 ? 'RUN_SHORT' : m < 40 ? 'RUN_MID' : 'RUN_LONG', saturdayBonus: true },
  { id: 'tennis',        label: '🎾 Tennis',               hasDuration: true,  getRule: m => m < 45 ? 'TENNIS_SHORT' : m < 75 ? 'TENNIS_MID' : 'TENNIS_LONG' },
  { id: 'swim',          label: '🏊 Swimming',             hasDuration: true,  getRule: m => m < 20 ? 'SWIM_SHORT' : m < 40 ? 'SWIM_MID' : 'SWIM_LONG' },
  { id: 'shoulder_done', label: '💪 Shoulder work',        ruleKey: 'SHOULDER_DONE' },
  { id: 'strength',      label: '🏋️ Functional strength',  ruleKey: 'STRENGTH' },
  { id: 'yoga',          label: '🧘 Yoga / mobility',       ruleKey: 'YOGA' },
  { id: 'protein',       label: '🥤 Vegan protein',        ruleKey: 'PROTEIN_POWDER' },
  { id: 'sleep7',        label: '😴 Slept 7+ hours',       ruleKey: 'SLEEP_7' },
  { id: 'book',          label: '📚 Finished a book',      ruleKey: 'FINISHED_BOOK' },
]

const PENALTY_OPTIONS = [
  { id: 'shoulder_missed', label: '💪 Missed shoulder work',        ruleKey: 'SHOULDER_MISSED' },
  { id: 'skipped_run',     label: '🏃 Skipped scheduled run',       ruleKey: 'SKIPPED_RUN' },
  { id: 'woke_late',       label: '⏰ Woke up late',                ruleKey: 'WOKE_LATE' },
  { id: 'alcohol',         label: '🍷 Drank alcohol',              ruleKey: 'ALCOHOL_WEEKDAY',    weekdayOnly: true },
  { id: 'cheat_meal',      label: '🍔 Cheat meal',                 ruleKey: 'CHEAT_MEAL_WEEKDAY', weekdayOnly: true },
  { id: 'junk',            label: '🍟 Ate junk',                   ruleKey: 'JUNK_WEEKDAY',       weekdayOnly: true },
]

// ── Floating bubble particles ────────────────────────────────────
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
      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `calc(50% + ${p.x}px)`,
          top: '50%',
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: color,
          opacity: 0,
          animation: `bubbleRise ${p.dur}s ease-out ${p.delay}s forwards`,
          pointerEvents: 'none',
          zIndex: 99,
          marginLeft: -p.size/2,
          marginTop: -p.size/2,
        }} />
      ))}

      {/* Main flash */}
      <div
        className="animate-bubble-pop"
        onAnimationEnd={onDone}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100, pointerEvents: 'none',
          animationFillMode: 'forwards', animationDuration: '1.4s',
        }}
      >
        <div style={{
          padding: '20px 40px',
          background: color, color: delta >= 0 ? 'var(--bg)' : '#fff',
          borderRadius: 1, textAlign: 'center',
          boxShadow: `0 0 60px ${glow}`,
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

export default function ActivityLog() {
  const addBubbles = useStore(s => s.addBubbles)
  const { showAlert } = useAlertTrigger()
  const [tab, setTab]           = useState('activity')
  const [selected, setSelected] = useState(null)
  const [duration, setDuration] = useState(30)
  const [note, setNote]         = useState('')
  const [flash, setFlash]       = useState(null)
  const weekend    = isWeekend()
  const isSaturday = new Date().getDay() === 6

  const currentOptions = tab === 'activity' ? ACTIVITY_OPTIONS : PENALTY_OPTIONS
  const selectedOpt    = currentOptions.find(o => o.id === selected)

  function handleSubmit() {
    if (!selected || !selectedOpt) return
    if (selectedOpt.weekdayOnly && weekend) return

    let totalDelta = 0

    if (selectedOpt.ruleKey) {
      const rule = BUBBLE_RULES[selectedOpt.ruleKey]
      if (!rule) return
      addBubbles(selectedOpt.ruleKey, rule.label, rule.delta, note)
      totalDelta = rule.delta
    } else if (selectedOpt.getRule) {
      const ruleKey = selectedOpt.getRule(duration)
      const rule    = BUBBLE_RULES[ruleKey]
      addBubbles(ruleKey, rule.label, rule.delta, `${duration} min${note ? ' — ' + note : ''}`)
      totalDelta += rule.delta
      if (selectedOpt.saturdayBonus && isSaturday) {
        const bonus = BUBBLE_RULES.RUN_SATURDAY_BONUS
        addBubbles('RUN_SATURDAY_BONUS', bonus.label, bonus.delta)
        totalDelta += bonus.delta
      }
    }

    setFlash(totalDelta)
    setSelected(null)
    setNote('')
    setDuration(30)
    // Ambient trigger — show a sea animal after logging, with a short delay
    // so it doesn't compete with the bubble flash
    setTimeout(() => showAlert('general'), 2200)
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="label-xs" style={{ marginBottom: 6 }}>Record</div>
        <h1 className="font-serif font-light" style={{ fontSize: '3rem', color: 'var(--text-1)', margin: 0, lineHeight: 1 }}>
          Log Activity
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ height: 1, width: 80, background: 'var(--brass)' }} />
          <div style={{ height: 1, width: 16, background: 'var(--brass)', opacity: 0.4 }} />
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 1, marginBottom: 24, overflow: 'hidden' }}>
        {[
          { key: 'activity', label: '+ Gain' },
          { key: 'penalty',  label: '− Penalty' },
        ].map(t => (
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

      {/* Options grid — 1 col on very small, 2 col on 380px+ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 8, marginBottom: 20 }}>
        {currentOptions.map(opt => {
          const isDisabled = opt.weekdayOnly && weekend
          const preview    = opt.ruleKey ? BUBBLE_RULES[opt.ruleKey]?.delta : null
          const isSelected = selected === opt.id

          return (
            <button
              key={opt.id}
              onClick={() => !isDisabled && setSelected(opt.id === selected ? null : opt.id)}
              disabled={isDisabled}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', textAlign: 'left',
                background: isSelected ? 'rgba(201,168,76,0.1)' : 'transparent',
                border: isSelected ? '1px solid var(--border-strong)' : '1px solid var(--border-dim)',
                borderRadius: 1, cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.3 : 1,
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span style={{ fontSize: '0.875rem', color: isSelected ? 'var(--text-1)' : 'var(--text-2)', fontFamily: 'DM Sans, sans-serif' }}>
                {opt.label}
              </span>
              {preview !== null && preview !== undefined && (
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', fontWeight: 700, marginLeft: 8,
                  color: preview >= 0 ? 'var(--brass)' : 'var(--negative)',
                }}>
                  {preview > 0 ? '+' : ''}{preview}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Duration slider */}
      {selectedOpt?.hasDuration && (
        <div className="panel animate-slide-up" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span className="label-xs">Duration</span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.875rem', color: 'var(--brass)' }}>
              {duration} min
            </span>
          </div>
          <input
            type="range" min="10" max="120" step="5"
            value={duration}
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
        </div>
      )}

      {/* Note field */}
      {selected && (
        <div style={{ marginBottom: 20 }} className="animate-slide-up">
          <input
            type="text"
            placeholder="Optional note…"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-dim)',
              borderRadius: 1, color: 'var(--text-1)', outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e  => e.target.style.borderColor = 'var(--border-strong)'}
            onBlur={e   => e.target.style.borderColor = 'var(--border-dim)'}
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selected}
        className="btn-brass"
        style={{ width: '100%', opacity: selected ? 1 : 0.35, cursor: selected ? 'pointer' : 'not-allowed' }}
      >
        Log it
      </button>

      {flash !== null && (
        <BubbleFlash delta={flash} onDone={() => setFlash(null)} />
      )}
    </div>
  )
}
