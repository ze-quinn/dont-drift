import { useState } from 'react'
import { useStore, DEFAULT_CHEAT_CONFIG } from '../../store/useStore'
import { isWeekend } from '../../constants/activities'
import { BUBBLE_RULES } from '../../constants/bubbles'
import { useAlertTrigger } from '../../context/AlertContext'

// ── Built-in habits ────────────────────────────────────────────────────────────
const BUILTIN_HABITS = [
  { id: 'sleep7',  label: 'Slept 7+ hours',      icon: '😴', ruleKey: 'SLEEP_7',       delta: +20 },
  { id: 'protein', label: 'Vegan protein powder', icon: '🥤', ruleKey: 'PROTEIN_POWDER', delta: +10 },
]
// Food/drink cheats live exclusively in the cheat tracker
const BUILTIN_PENALTIES = [
  { id: 'woke_late', label: 'Woke up late', icon: '⏰', ruleKey: 'WOKE_LATE', delta: -10, isPenalty: true },
]

function SectionHeader({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
      <span className="label-xs" style={{ color, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `${color}30` }} />
    </div>
  )
}

// ── Habit row ──────────────────────────────────────────────────────────────────
function HabitRow({ habit, logged, onLog, editMode, onRemove }) {
  const weekend  = isWeekend()
  const disabled = (habit.weekdayOnly && weekend) || logged
  const accent   = habit.isPenalty ? 'var(--negative)' : 'var(--brass)'
  const [ripples, setRipples] = useState([])

  function handleClick() {
    if (disabled || editMode) return
    const id = Date.now()
    setRipples(r => [...r, id])
    setTimeout(() => setRipples(r => r.filter(x => x !== id)), 600)
    onLog(habit)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-dim)' }}>
      <button onClick={handleClick} disabled={disabled || editMode}
        style={{
          width: 22, height: 22, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          background: logged ? (habit.isPenalty ? 'rgba(91,156,196,0.15)' : 'rgba(201,168,76,0.15)') : 'transparent',
          border: logged ? `1px solid ${accent}` : '1px solid var(--border-dim)',
          borderRadius: 1, cursor: disabled || editMode ? 'default' : 'pointer',
          opacity: (habit.weekdayOnly && weekend && !logged) ? 0.3 : 1,
          transition: 'background 0.2s, border-color 0.2s',
        }}>
        {ripples.map(id => (
          <span key={id} className="ripple" style={{ width: 40, height: 40, left: '50%', top: '50%', marginLeft: -20, marginTop: -20, background: habit.isPenalty ? 'var(--negative)' : 'var(--brass)' }} />
        ))}
        {logged && (
          <svg viewBox="0 0 10 10" fill="none" width="10" height="10" style={{ position: 'relative', zIndex: 1 }}>
            <polyline points="1.5,5 4,7.5 8.5,2" stroke={accent} strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        )}
      </button>

      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{habit.icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '0.875rem', fontFamily: 'DM Sans, sans-serif', color: (habit.weekdayOnly && weekend) ? 'var(--text-3)' : logged ? 'var(--text-3)' : 'var(--text-1)' }}>
          {habit.label}
        </span>
        {habit.weekdayOnly && weekend && <div className="label-xs" style={{ color: 'var(--text-3)', marginTop: 1 }}>Weekday only</div>}
      </div>

      {!editMode && (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', fontWeight: 700, color: habit.delta >= 0 ? 'var(--brass)' : 'var(--negative)', flexShrink: 0 }}>
          {habit.delta > 0 ? '+' : ''}{habit.delta}
        </span>
      )}

      {editMode && (
        <button onClick={() => onRemove(habit.id)}
          style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--negative)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          <svg viewBox="0 0 8 8" fill="none" width="8" height="8">
            <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" stroke="#fff" strokeWidth="1.5"/>
            <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" stroke="#fff" strokeWidth="1.5"/>
          </svg>
        </button>
      )}
    </div>
  )
}

// ── Add-habit sheet ────────────────────────────────────────────────────────────
const POS_DELTAS = [10,20,30,40,50,60,80,100]
const NEG_DELTAS = [-10,-20,-30,-40,-50,-60,-80,-100]

function AddHabitSheet({ forType, onAdd, onClose }) {
  const isPenalty = forType === 'penalty'
  const accent    = isPenalty ? 'var(--negative)' : 'var(--brass)'
  const [icon,        setIcon]       = useState(isPenalty ? '❌' : '✅')
  const [label,       setLabel]      = useState('')
  const [delta,       setDelta]      = useState(isPenalty ? -10 : 10)
  const [weekdayOnly, setWeekdayOnly]= useState(false)

  function handleAdd() {
    if (!label.trim()) return
    const id = `custom_h_${Date.now()}_${Math.random().toString(36).slice(2,5)}`
    onAdd({ id, icon, label, delta, isPenalty, weekdayOnly })
    onClose()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-panel)', borderTop: '1px solid var(--border)',
        borderRadius: '4px 4px 0 0', padding: '0 20px env(safe-area-inset-bottom)',
        maxHeight: '80vh', overflowY: 'auto',
        animation: 'habitSheetUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.4)',
      }}>
        <style>{`@keyframes habitSheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--border)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 0 16px' }}>
          <div className="font-serif font-light" style={{ fontSize: '1.3rem', color: accent }}>
            Add {isPenalty ? 'penalty' : 'habit'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
            <svg viewBox="0 0 10 10" fill="none" width="12" height="12">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div>
            <div className="label-xs" style={{ marginBottom: 6 }}>Icon</div>
            <input value={icon} onChange={e => setIcon(e.target.value.slice(-2) || '✅')}
              style={{ width: 52, height: 44, textAlign: 'center', fontSize: '1.4rem', background: 'var(--bg-input)', border: '1px solid var(--border-dim)', borderRadius: 1, color: 'var(--text-1)', outline: 'none' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="label-xs" style={{ marginBottom: 6 }}>Name</div>
            <input value={label} onChange={e => setLabel(e.target.value)}
              placeholder={isPenalty ? 'e.g. Skipped meditation…' : 'e.g. Drank 2L water…'}
              style={{ width: '100%', height: 44, padding: '0 12px', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', background: 'var(--bg-input)', border: '1px solid var(--border-dim)', borderRadius: 1, color: 'var(--text-1)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div className="label-xs" style={{ marginBottom: 10 }}>Bubbles</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(isPenalty ? NEG_DELTAS : POS_DELTAS).map(d => (
              <button key={d} onClick={() => setDelta(d)}
                style={{
                  padding: '5px 10px', borderRadius: 1, border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', fontWeight: 700,
                  background: delta === d ? accent : 'var(--bg-input)',
                  color: delta === d ? (isPenalty ? '#fff' : 'var(--bg)') : 'var(--text-2)',
                }}>
                {d > 0 ? '+' : ''}{d}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="label-xs" style={{ flex: 1 }}>Weekday only</div>
          <button onClick={() => setWeekdayOnly(w => !w)}
            style={{ width: 40, height: 22, borderRadius: 11, background: weekdayOnly ? accent : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: weekdayOnly ? 21 : 3, transition: 'left 0.2s' }} />
          </button>
        </div>
        <button onClick={handleAdd} disabled={!label.trim()} className="btn-brass"
          style={{ width: '100%', marginBottom: 16, opacity: label.trim() ? 1 : 0.4 }}>
          Add to {isPenalty ? 'penalties' : 'habits'}
        </button>
      </div>
    </>
  )
}

// ── Cheat editor sheet ─────────────────────────────────────────────────────────
const CHEAT_ICONS = ['🍔','🍕','🌮','🥗','🍰','🍩','🍪','🧁','🍟','🍷','🍺','🍸','🥂','🧃','🍦','🍫','🧀','🥩','🍣','🍜']

function CheatEditorSheet({ config, onSave, onClose }) {
  const [items, setItems] = useState(config.map(c => ({ ...c })))
  const [newItem, setNewItem] = useState({ icon: '🍕', label: '', allowance: 2 })
  const [addingNew, setAddingNew] = useState(false)

  function updateItem(idx, key, val) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: val } : item))
  }

  const stepperBtn = (onClick, label) => (
    <button onClick={onClick} style={{ width: 28, height: 28, border: '1px solid var(--border-dim)', borderRadius: 1, background: 'none', cursor: 'pointer', color: 'var(--text-2)', fontFamily: 'DM Mono, monospace', fontSize: '1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
      {label}
    </button>
  )

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-panel)', borderTop: '1px solid var(--border)',
        borderRadius: '4px 4px 0 0', padding: '0 20px env(safe-area-inset-bottom)',
        maxHeight: '85vh', overflowY: 'auto',
        animation: 'cheatSheetUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.4)',
      }}>
        <style>{`@keyframes cheatSheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 3, borderRadius: 2, background: 'var(--border)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 0 12px' }}>
          <div className="font-serif font-light" style={{ fontSize: '1.3rem', color: 'var(--brass)' }}>Edit cheat allowances</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
            <svg viewBox="0 0 10 10" fill="none" width="12" height="12">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontFamily: 'DM Sans, sans-serif', marginBottom: 16, lineHeight: 1.55 }}>
          Within allowance = free. Going over costs −20 bubbles each.
        </div>

        {items.map((item, idx) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid var(--border-dim)' }}>
            <select value={item.icon} onChange={e => updateItem(idx, 'icon', e.target.value)}
              style={{ width: 44, height: 38, textAlign: 'center', fontSize: '1.1rem', background: 'var(--bg-input)', border: '1px solid var(--border-dim)', borderRadius: 1, color: 'var(--text-1)', outline: 'none', padding: 0, cursor: 'pointer' }}>
              {CHEAT_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
            <input value={item.label} onChange={e => updateItem(idx, 'label', e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: '8px 10px', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', background: 'var(--bg-input)', border: '1px solid var(--border-dim)', borderRadius: 1, color: 'var(--text-1)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              {stepperBtn(() => updateItem(idx, 'allowance', Math.max(0, (item.allowance||0) - 1)), '−')}
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '1rem', fontWeight: 700, color: 'var(--brass)', minWidth: 22, textAlign: 'center' }}>{item.allowance || 0}</span>
              {stepperBtn(() => updateItem(idx, 'allowance', (item.allowance||0) + 1), '+')}
            </div>
            <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
              style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--negative)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
              <svg viewBox="0 0 8 8" fill="none" width="8" height="8">
                <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" stroke="#fff" strokeWidth="1.5"/>
                <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" stroke="#fff" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
        ))}

        {addingNew ? (
          <div style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <select value={newItem.icon} onChange={e => setNewItem(n => ({ ...n, icon: e.target.value }))}
                style={{ width: 44, height: 38, textAlign: 'center', fontSize: '1.1rem', background: 'var(--bg-input)', border: '1px solid var(--border-dim)', borderRadius: 1, color: 'var(--text-1)', outline: 'none', padding: 0 }}>
                {CHEAT_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
              <input value={newItem.label} onChange={e => setNewItem(n => ({ ...n, label: e.target.value }))} placeholder="Label…"
                style={{ flex: 1, minWidth: 0, padding: '8px 10px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', background: 'var(--bg-input)', border: '1px solid var(--border-dim)', borderRadius: 1, color: 'var(--text-1)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {stepperBtn(() => setNewItem(n => ({ ...n, allowance: Math.max(0, (n.allowance||0) - 1) })), '−')}
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '1rem', fontWeight: 700, color: 'var(--brass)', minWidth: 22, textAlign: 'center' }}>{newItem.allowance || 0}</span>
                {stepperBtn(() => setNewItem(n => ({ ...n, allowance: (n.allowance||0) + 1 })), '+')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => {
                if (!newItem.label.trim()) return
                const id = `cheat_${Date.now()}`
                setItems(prev => [...prev, { ...newItem, id, allowance: Number(newItem.allowance) || 1 }])
                setNewItem({ icon: '🍕', label: '', allowance: 2 })
                setAddingNew(false)
              }} disabled={!newItem.label.trim()} className="btn-brass" style={{ flex: 1, opacity: newItem.label.trim() ? 1 : 0.4 }}>Add</button>
              <button onClick={() => setAddingNew(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingNew(true)}
            style={{ width: '100%', marginTop: 12, padding: '10px', border: '1px dashed var(--brass)', borderRadius: 1, background: 'transparent', color: 'var(--brass)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>+</span> Add cheat type
          </button>
        )}

        <button onClick={() => { onSave(items); onClose() }} className="btn-brass" style={{ width: '100%', margin: '16px 0' }}>
          Save allowances
        </button>
      </div>
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HabitTracker() {
  const addBubbles        = useStore(s => s.addBubbles)
  const isLoggedToday     = useStore(s => s.isLoggedToday)
  const customHabits      = useStore(s => s.customHabits)
  const removedHabits     = useStore(s => s.removedHabits)
  const addCustomHabit    = useStore(s => s.addCustomHabit)
  const removeHabit       = useStore(s => s.removeHabit)
  const removeCustomHabit = useStore(s => s.removeCustomHabit)
  const cheatConfig       = useStore(s => s.cheatConfig)
  const cheatUsage        = useStore(s => s.cheatUsage)
  const setCheatConfig    = useStore(s => s.setCheatConfig)
  const logCheat          = useStore(s => s.logCheat)
  const undoCheat         = useStore(s => s.undoCheat)
  const { showAlert } = useAlertTrigger()

  const weekend = isWeekend()
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthUsage = cheatUsage.month === currentMonth ? cheatUsage.counts : {}

  const [editMode,    setEditMode]    = useState(false)
  const [addSheet,    setAddSheet]    = useState(null)   // null | 'habit' | 'penalty'
  const [cheatEditor, setCheatEditor] = useState(false)

  const habits = [
    ...BUILTIN_HABITS.filter(h => !removedHabits.includes(h.id)),
    ...customHabits.filter(h => !h.isPenalty),
  ]
  const penalties = [
    ...BUILTIN_PENALTIES.filter(h => !removedHabits.includes(h.id)),
    ...customHabits.filter(h => h.isPenalty),
  ]

  const bookLogged = isLoggedToday('FINISHED_BOOK')

  // Build logged map without filtering inside selector (avoid infinite loop)
  const loggedMap = {}
  ;[...habits, ...penalties].forEach(h => {
    loggedMap[h.id] = isLoggedToday(h.ruleKey || h.id)
  })

  function handleLog(habit) {
    const ruleKey = habit.ruleKey || habit.id
    const rule    = BUBBLE_RULES[ruleKey]
    if (rule) addBubbles(ruleKey, rule.label, rule.delta)
    else      addBubbles(habit.id, habit.label, habit.delta)
    if (Math.random() < 0.4) setTimeout(() => showAlert('general'), 1800)
  }

  function handleRemoveHabit(id) {
    const isBuiltIn = BUILTIN_HABITS.find(h => h.id === id) || BUILTIN_PENALTIES.find(h => h.id === id)
    if (isBuiltIn) removeHabit(id)
    else           removeCustomHabit(id)
  }

  function handleLogCheat(id) {
    logCheat(id)
    if (Math.random() < 0.3) setTimeout(() => showAlert('general'), 1500)
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="label-xs" style={{ marginBottom: 6 }}>Daily</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 className="font-serif font-light" style={{ fontSize: '3rem', color: 'var(--text-1)', margin: 0, lineHeight: 1 }}>
            Habits
          </h1>
          <button onClick={() => setEditMode(e => !e)}
            style={{
              background: editMode ? 'rgba(201,168,76,0.12)' : 'none',
              border: editMode ? '1px solid var(--brass)' : '1px solid var(--border-dim)',
              borderRadius: 1, padding: '5px 10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.6rem', fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: editMode ? 'var(--brass)' : 'var(--text-3)', marginBottom: 4, flexShrink: 0,
            }}>
            {editMode ? 'Done' : '✏ Edit'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
          <div style={{ height: 1, width: 80, background: 'var(--brass)' }} />
          <div style={{ height: 1, width: 16, background: 'var(--brass)', opacity: 0.4 }} />
        </div>
      </div>

      {weekend && !editMode && (
        <div style={{ marginBottom: 20, padding: '8px 14px', fontSize: '0.75rem', background: 'rgba(126,207,192,0.08)', border: '1px solid rgba(126,207,192,0.25)', color: 'var(--aqua)', borderRadius: 1, fontFamily: 'DM Sans, sans-serif' }}>
          Weekend — food and alcohol penalties suspended.
        </div>
      )}

      {/* Good habits */}
      <div className="panel" style={{ padding: '4px 16px 8px', marginBottom: 12 }}>
        <div style={{ paddingTop: 14, marginBottom: 8 }}><SectionHeader label="Good stuff" color="var(--brass)"/></div>
        {habits.map(h => (
          <HabitRow key={h.id} habit={h} logged={!!loggedMap[h.id]} onLog={handleLog} editMode={editMode} onRemove={handleRemoveHabit}/>
        ))}
        {editMode && (
          <button onClick={() => setAddSheet('habit')}
            style={{ width: '100%', marginTop: 10, padding: '8px', border: '1px dashed var(--brass)', borderRadius: 1, background: 'transparent', color: 'var(--brass)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>+</span> Add habit
          </button>
        )}
      </div>

      {/* Penalties */}
      <div className="panel" style={{ padding: '4px 16px 8px', marginBottom: 12 }}>
        <div style={{ paddingTop: 14, marginBottom: 8 }}><SectionHeader label="Honest accounting" color="var(--negative)"/></div>
        {penalties.map(h => (
          <HabitRow key={h.id} habit={h} logged={!!loggedMap[h.id]} onLog={handleLog} editMode={editMode} onRemove={handleRemoveHabit}/>
        ))}
        {editMode && (
          <button onClick={() => setAddSheet('penalty')}
            style={{ width: '100%', marginTop: 10, padding: '8px', border: '1px dashed var(--negative)', borderRadius: 1, background: 'transparent', color: 'var(--negative)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>+</span> Add penalty
          </button>
        )}
      </div>

      {/* Book milestone */}
      <div className="panel" style={{ padding: '4px 16px 12px', marginBottom: 12 }}>
        <div style={{ paddingTop: 14, marginBottom: 8 }}><SectionHeader label="Milestones" color="var(--brass)"/></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
          <button
            onClick={() => !bookLogged && addBubbles('FINISHED_BOOK', BUBBLE_RULES.FINISHED_BOOK.label, BUBBLE_RULES.FINISHED_BOOK.delta)}
            disabled={bookLogged}
            style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bookLogged ? 'rgba(201,168,76,0.15)' : 'transparent', border: bookLogged ? '1px solid var(--brass)' : '1px solid var(--border-dim)', borderRadius: 1, cursor: bookLogged ? 'default' : 'pointer' }}>
            {bookLogged && (
              <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                <polyline points="1.5,5 4,7.5 8.5,2" stroke="var(--brass)" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
            )}
          </button>
          <span style={{ fontSize: '1rem' }}>📚</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-1)', fontFamily: 'DM Sans, sans-serif' }}>Finished a book</div>
            <div className="label-xs" style={{ marginTop: 1 }}>One-time trigger per book</div>
          </div>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brass)' }}>+100</span>
        </div>
      </div>

      {/* Monthly cheat tracker */}
      <div className="panel" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="label-xs">Monthly cheat allowances</div>
          <button onClick={() => setCheatEditor(true)}
            style={{ background: 'none', border: '1px solid var(--border-dim)', borderRadius: 1, padding: '3px 8px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
            ⚙ Edit
          </button>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'DM Sans, sans-serif', marginBottom: 14, lineHeight: 1.5 }}>
          Within allowance = free. Over = −20 bubbles each.
        </div>

        {cheatConfig.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div className="label-xs" style={{ color: 'var(--text-3)' }}>No cheat types — tap ⚙ Edit to add some</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cheatConfig.map(item => {
              const used  = monthUsage[item.id] ?? 0
              const over  = used > item.allowance
              const dots  = Math.max(item.allowance, used)
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 1,
                  border: `1px solid ${over ? 'rgba(91,156,196,0.4)' : 'var(--border-dim)'}`,
                  background: over ? 'rgba(91,156,196,0.06)' : 'transparent',
                }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: 'var(--text-1)' }}>
                      {item.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                        {Array.from({ length: Math.min(dots, 12) }, (_, i) => (
                          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i < used ? (i >= item.allowance ? 'var(--negative)' : 'var(--brass)') : 'var(--border)' }} />
                        ))}
                        {dots > 12 && <span className="label-xs">…</span>}
                      </div>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', color: over ? 'var(--negative)' : 'var(--text-3)' }}>
                        {used}/{item.allowance}{over ? ` (+${used - item.allowance} over)` : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => undoCheat(item.id)} disabled={used === 0}
                      style={{ width: 30, height: 30, borderRadius: 1, background: 'none', border: '1px solid var(--border-dim)', cursor: used > 0 ? 'pointer' : 'default', opacity: used > 0 ? 1 : 0.3, color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: '1rem' }}
                      title="Undo last">
                      −
                    </button>
                    <button onClick={() => handleLogCheat(item.id)}
                      style={{ width: 30, height: 30, borderRadius: 1, background: over ? 'rgba(91,156,196,0.15)' : 'rgba(201,168,76,0.12)', border: `1px solid ${over ? 'var(--negative)' : 'var(--brass)'}`, cursor: 'pointer', color: over ? 'var(--negative)' : 'var(--brass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: '1rem', fontWeight: 700 }}
                      title={over ? 'Log (−20 penalty)' : 'Log (free)'}>
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {addSheet && (
        <AddHabitSheet forType={addSheet} onAdd={addCustomHabit} onClose={() => setAddSheet(null)} />
      )}
      {cheatEditor && (
        <CheatEditorSheet
          config={cheatConfig.length ? cheatConfig : DEFAULT_CHEAT_CONFIG}
          onSave={setCheatConfig}
          onClose={() => setCheatEditor(false)}
        />
      )}
    </div>
  )
}
