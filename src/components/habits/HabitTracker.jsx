import { useStore } from '../../store/useStore'
import { isWeekend } from '../../constants/activities'
import { CHEAT_ALLOWANCES } from '../../constants/bubbles'
import { BUBBLE_RULES } from '../../constants/bubbles'

const HABITS_LIST = [
  { id: 'sleep7',   label: 'Slept 7+ hours',          icon: '😴', ruleKey: 'SLEEP_7',            delta: +20 },
  { id: 'protein',  label: 'Vegan protein powder',     icon: '🥤', ruleKey: 'PROTEIN_POWDER',      delta: +10 },
]
const PENALTIES_LIST = [
  { id: 'woke_late',   label: 'Woke up late',              icon: '⏰', ruleKey: 'WOKE_LATE',           delta: -10, isPenalty: true },
  { id: 'alcohol_wd',  label: 'Drank alcohol',             icon: '🍷', ruleKey: 'ALCOHOL_WEEKDAY',     delta: -20, isPenalty: true, weekdayOnly: true },
  { id: 'cheat_meal',  label: 'Cheat meal',                icon: '🍔', ruleKey: 'CHEAT_MEAL_WEEKDAY',  delta: -20, isPenalty: true, weekdayOnly: true },
  { id: 'junk',        label: 'Ate junk',                  icon: '🍟', ruleKey: 'JUNK_WEEKDAY',        delta: -10, isPenalty: true, weekdayOnly: true },
]

function HabitRow({ habit, logged, onLog }) {
  const weekend  = isWeekend()
  const disabled = (habit.weekdayOnly && weekend) || logged
  const accent   = habit.isPenalty ? 'var(--negative)' : 'var(--brass)'

  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--border-dim)' }}>
      <button
        onClick={() => !disabled && onLog(habit)}
        disabled={disabled}
        style={{
          width: 22, height: 22, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: logged ? (habit.isPenalty ? 'rgba(91,156,196,0.15)' : 'rgba(201,168,76,0.15)') : 'transparent',
          border: logged ? `1px solid ${accent}` : '1px solid var(--border-dim)',
          borderRadius: 1, cursor: disabled ? 'default' : 'pointer',
          opacity: (habit.weekdayOnly && weekend && !logged) ? 0.3 : 1,
          transition: 'all 0.15s',
        }}
      >
        {logged && (
          <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
            <polyline points="1.5,5 4,7.5 8.5,2" stroke={accent} strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        )}
      </button>

      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{habit.icon}</span>

      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif',
          color: (habit.weekdayOnly && weekend) ? 'var(--text-3)' : logged ? 'var(--text-3)' : 'var(--text-1)',
        }}>
          {habit.label}
        </span>
        {habit.weekdayOnly && weekend && (
          <div className="label-xs" style={{ color: 'var(--text-3)', marginTop: 1 }}>Weekday only</div>
        )}
      </div>

      {habit.delta !== null && (
        <span style={{
          fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', fontWeight: 700,
          color: habit.delta >= 0 ? 'var(--brass)' : 'var(--negative)',
        }}>
          {habit.delta > 0 ? '+' : ''}{habit.delta}
        </span>
      )}
    </div>
  )
}

function SectionHeader({ label, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4,
    }}>
      <span className="label-xs" style={{ color, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `${color}30` }} />
    </div>
  )
}

export default function HabitTracker() {
  const addBubbles     = useStore(s => s.addBubbles)
  const isLoggedToday  = useStore(s => s.isLoggedToday)
  const cheatAllowances   = useStore(s => s.cheatAllowances)
  const updateCheatAllowances = useStore(s => s.updateCheatAllowances)
  const weekend = isWeekend()

  const logged = {
    sleep7:     isLoggedToday('SLEEP_7'),
    protein:    isLoggedToday('PROTEIN_POWDER'),
    woke_late:  isLoggedToday('WOKE_LATE'),
    alcohol_wd: isLoggedToday('ALCOHOL_WEEKDAY'),
    cheat_meal: isLoggedToday('CHEAT_MEAL_WEEKDAY'),
    junk:       isLoggedToday('JUNK_WEEKDAY'),
  }
  const bookLogged = isLoggedToday('FINISHED_BOOK')

  function handleLog(habit) {
    if (!habit.ruleKey) return
    const rule = BUBBLE_RULES[habit.ruleKey]
    addBubbles(habit.ruleKey, rule.label, rule.delta)
    if (habit.ruleKey === 'CHEAT_MEAL_WEEKDAY') updateCheatAllowances({ burgers: cheatAllowances.burgers + 1 })
    if (habit.ruleKey === 'ALCOHOL_WEEKDAY')    updateCheatAllowances({ boozeDays: cheatAllowances.boozeDays + 1 })
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="label-xs" style={{ marginBottom: 6 }}>Daily</div>
        <h1 className="font-serif font-light" style={{ fontSize: '3rem', color: 'var(--text-1)', margin: 0, lineHeight: 1 }}>
          Habits
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
          <div style={{ height: 1, width: 80, background: 'var(--brass)' }} />
          <div style={{ height: 1, width: 16, background: 'var(--brass)', opacity: 0.4 }} />
        </div>
      </div>

      {weekend && (
        <div style={{
          marginBottom: 20, padding: '8px 14px', fontSize: '0.75rem',
          background: 'rgba(126,207,192,0.08)', border: '1px solid rgba(126,207,192,0.25)',
          color: 'var(--aqua)', borderRadius: 1, fontFamily: 'DM Sans, sans-serif',
        }}>
          Weekend — food and alcohol penalties suspended.
        </div>
      )}

      {/* Positive habits */}
      <div className="panel" style={{ padding: '4px 16px 8px', marginBottom: 12 }}>
        <div style={{ paddingTop: 14, marginBottom: 8 }}>
          <SectionHeader label="Good stuff" color="var(--brass)"/>
        </div>
        {HABITS_LIST.map(h => (
          <HabitRow key={h.id} habit={h} logged={!!logged[h.id]} onLog={handleLog}/>
        ))}
      </div>

      {/* Penalties */}
      <div className="panel" style={{ padding: '4px 16px 8px', marginBottom: 12 }}>
        <div style={{ paddingTop: 14, marginBottom: 8 }}>
          <SectionHeader label="Honest accounting" color="var(--negative)"/>
        </div>
        {PENALTIES_LIST.map(h => (
          <HabitRow key={h.id} habit={h} logged={!!logged[h.id]} onLog={handleLog}/>
        ))}
      </div>

      {/* Book milestone */}
      <div className="panel" style={{ padding: '4px 16px 12px', marginBottom: 12 }}>
        <div style={{ paddingTop: 14, marginBottom: 8 }}>
          <SectionHeader label="Milestones" color="var(--brass)"/>
        </div>
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={() => !bookLogged && addBubbles('FINISHED_BOOK', BUBBLE_RULES.FINISHED_BOOK.label, BUBBLE_RULES.FINISHED_BOOK.delta)}
            disabled={bookLogged}
            style={{
              width: 22, height: 22, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: bookLogged ? 'rgba(201,168,76,0.15)' : 'transparent',
              border: bookLogged ? '1px solid var(--brass)' : '1px solid var(--border-dim)',
              borderRadius: 1, cursor: bookLogged ? 'default' : 'pointer',
            }}
          >
            {bookLogged && (
              <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                <polyline points="1.5,5 4,7.5 8.5,2" stroke="var(--brass)" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
            )}
          </button>
          <span style={{ fontSize: '1rem' }}>📚</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-1)', fontFamily: 'DM Sans, sans-serif' }}>
              Finished a book
            </div>
            <div className="label-xs" style={{ marginTop: 1 }}>One-time trigger per book</div>
          </div>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brass)' }}>+100</span>
        </div>
      </div>

      {/* Monthly cheat tracker */}
      <div className="panel" style={{ padding: 16 }}>
        <div className="label-xs" style={{ marginBottom: 16 }}>Monthly cheat allowances</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { label: 'Burgers',      used: cheatAllowances.burgers,     max: CHEAT_ALLOWANCES.burgers,     icon: '🍔' },
            { label: 'Other treats', used: cheatAllowances.otherTreats,  max: CHEAT_ALLOWANCES.otherTreats, icon: '🍰' },
            { label: 'Booze days',   used: cheatAllowances.boozeDays,    max: CHEAT_ALLOWANCES.boozeDays,   icon: '🍷' },
          ].map(item => {
            const over = item.used >= item.max
            return (
              <div key={item.label} style={{
                textAlign: 'center', padding: 12, borderRadius: 1,
                border: '1px solid var(--border-dim)',
                background: over ? 'rgba(91,156,196,0.06)' : 'transparent',
              }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>{item.icon}</div>
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '1.25rem', fontWeight: 700,
                  color: over ? 'var(--negative)' : 'var(--brass)',
                }}>
                  {item.used}
                  <span style={{ color: 'var(--text-3)', fontSize: '0.875rem', fontWeight: 400 }}>/{item.max}</span>
                </div>
                <div className="label-xs" style={{ marginTop: 4 }}>{item.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
