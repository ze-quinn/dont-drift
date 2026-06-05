import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { LEVELS } from '../../constants/levels'
import SeaAnimalIllustration from '../SeaAnimalIllustration'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { supabase } from '../../lib/supabase'

function Field({ label, value, onChange, type = 'number', min, max, hint }) {
  return (
    <div>
      <label className="label-xs" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      {hint && <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>{hint}</div>}
      <input
        type={type} value={value} min={min} max={max}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 12px',
          fontFamily: 'DM Mono, monospace', fontSize: '0.875rem',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-dim)',
          borderRadius: 1, color: 'var(--text-1)', outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'}
      />
    </div>
  )
}

const NOTIF_TOPICS = [
  { id: 'shoulder',   label: 'Shoulder work',     icon: '💪' },
  { id: 'run',        label: 'Run reminder',       icon: '🏃' },
  { id: 'swim',       label: 'Swim reminder',      icon: '🏊' },
  { id: 'tennis',     label: 'Tennis reminder',    icon: '🎾' },
  { id: 'motivation', label: 'General motivation', icon: '🌊' },
  { id: 'habits',     label: 'Habits check-in',    icon: '✅' },
]

function TimeInput({ label, value, onChange, min, max }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="label-xs" style={{ marginBottom: 6 }}>{label}</div>
      <input
        type="number" value={value} min={min} max={max}
        onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        style={{
          width: '100%', padding: '10px 12px', textAlign: 'center',
          fontFamily: 'DM Mono, monospace', fontSize: '1.25rem', fontWeight: 700,
          background: 'var(--bg-input)', border: '1px solid var(--border-dim)',
          borderRadius: 1, color: 'var(--brass)', outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'}
      />
    </div>
  )
}

// ── Multi-schedule notification component ─────────────────────────────────────
function NotifSchedules({ savePrefs, prefsSaved, pushError, unsubscribe }) {
  const notifSchedules    = useStore(s => s.notifSchedules)
  const setNotifSchedules = useStore(s => s.setNotifSchedules)

  // Local copy for editing before saving
  const [schedules, setSchedules] = useState(() =>
    (notifSchedules ?? [{ id: 'default', hour: 19, minute: 0, topic: 'shoulder' }])
      .map(s => ({ ...s }))
  )

  function updateSchedule(idx, key, val) {
    setSchedules(prev => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s))
  }

  function addSchedule() {
    if (schedules.length >= 8) return
    setSchedules(prev => [...prev, {
      id: `notif_${Date.now()}`,
      hour: 8, minute: 0, topic: 'motivation',
    }])
  }

  function removeSchedule(idx) {
    if (schedules.length <= 1) return
    setSchedules(prev => prev.filter((_, i) => i !== idx))
  }

  function handleSave() {
    setNotifSchedules(schedules)
    savePrefs(schedules)
  }

  return (
    <div>
      {schedules.map((sched, idx) => (
        <div key={sched.id ?? idx} style={{
          marginBottom: 16, padding: 14,
          border: '1px solid var(--border-dim)', borderRadius: 1,
          background: 'rgba(201,168,76,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="label-xs" style={{ color: 'var(--brass)' }}>
              Reminder {schedules.length > 1 ? idx + 1 : ''}
            </span>
            {schedules.length > 1 && (
              <button onClick={() => removeSchedule(idx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>
                <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                  <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            )}
          </div>

          {/* Time row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TimeInput label="Hour (24h)" value={sched.hour}
              onChange={v => updateSchedule(idx, 'hour', v)} min={0} max={23} />
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.5rem', fontWeight: 300, color: 'var(--text-3)', paddingTop: 22, flexShrink: 0 }}>:</div>
            <TimeInput label="Minute" value={sched.minute}
              onChange={v => updateSchedule(idx, 'minute', v)} min={0} max={59} />
          </div>
          <div style={{ marginBottom: 12, fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--text-3)' }}>
            {String(sched.hour).padStart(2,'0')}:{String(sched.minute).padStart(2,'0')} IST daily
          </div>

          {/* Topic */}
          <div className="label-xs" style={{ marginBottom: 8 }}>Remind me about</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {NOTIF_TOPICS.map(t => {
              const active = sched.topic === t.id
              return (
                <button key={t.id} onClick={() => updateSchedule(idx, 'topic', t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
                    fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: active ? 600 : 400,
                    background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                    border: active ? '1px solid var(--brass)' : '1px solid var(--border-dim)',
                    borderRadius: 2, cursor: 'pointer',
                    color: active ? 'var(--brass)' : 'var(--text-2)',
                    transition: 'all 0.15s',
                  }}>
                  <span style={{ fontSize: '0.8rem' }}>{t.icon}</span>
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {schedules.length < 8 && (
        <button onClick={addSchedule}
          style={{
            width: '100%', marginBottom: 16, padding: '10px',
            border: '1px dashed var(--brass)', borderRadius: 1, background: 'transparent',
            color: 'var(--brass)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          <span style={{ fontSize: '1rem' }}>+</span> Add another reminder
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={handleSave} className="btn-brass" style={{ flex: 1 }}>
          {prefsSaved ? '✓ Saved' : 'Save notification preferences'}
        </button>
        <button onClick={unsubscribe} className="btn-ghost"
          style={{ fontSize: '0.65rem', padding: '8px 14px', flexShrink: 0 }}>
          Disable
        </button>
      </div>

      {pushError && (
        <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--negative)', fontFamily: 'DM Mono, monospace' }}>
          {pushError}
        </div>
      )}
    </div>
  )
}

export default function Settings() {
  const { settings, updateSettings } = useStore()
  const bubbles = useStore(s => s.bubbles)
  const { status: pushStatus, error: pushError, prefsSaved, subscribe, unsubscribe, savePrefs } = usePushNotifications()
  const [saved, setSaved]     = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? '')
    })
  }, [])

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <div className="label-xs" style={{ marginBottom: 6 }}>Configuration</div>
        <h1 className="font-serif font-light" style={{ fontSize: '3rem', color: 'var(--text-1)', margin: 0, lineHeight: 1 }}>
          Settings
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
          <div style={{ height: 1, width: 80, background: 'var(--brass)' }} />
          <div style={{ height: 1, width: 16, background: 'var(--brass)', opacity: 0.4 }} />
        </div>
      </div>

      {/* Alarm */}
      <div className="panel" style={{ padding: 20, marginBottom: 12 }}>
        <div className="label-xs" style={{ color: 'var(--brass)', marginBottom: 16 }}>Wake alarm</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Hour"   value={settings.alarmHour}   onChange={v => updateSettings({ alarmHour: Number(v) })}   min={4} max={12}/>
          <Field label="Minute" value={settings.alarmMinute} onChange={v => updateSettings({ alarmMinute: Number(v) })} min={0} max={59}/>
        </div>
        <div className="label-xs" style={{ marginTop: 10 }}>
          Set: {String(settings.alarmHour ?? 7).padStart(2,'0')}:{String(settings.alarmMinute ?? 0).padStart(2,'0')}
        </div>
      </div>

      {/* Shoulder target */}
      <div className="panel" style={{ padding: 20, marginBottom: 12 }}>
        <div className="label-xs" style={{ color: 'var(--brass)', marginBottom: 16 }}>Shoulder work target</div>
        <Field
          label="Target hour (24hr)"
          value={settings.shoulderTargetHour}
          onChange={v => updateSettings({ shoulderTargetHour: Number(v) })}
          min={6} max={22}
          hint="You'll be reminded around this time daily"
        />
      </div>

      {/* Sleep */}
      <div className="panel" style={{ padding: 20, marginBottom: 12 }}>
        <div className="label-xs" style={{ color: 'var(--brass)', marginBottom: 16 }}>Sleep goal</div>
        <Field label="Target hours" value={settings.sleepGoalHours} onChange={v => updateSettings({ sleepGoalHours: Number(v) })} min={6} max={10}/>
      </div>

      {/* Level table with animal previews */}
      <div className="panel" style={{ padding: 20, marginBottom: 12 }}>
        <div className="label-xs" style={{ marginBottom: 16 }}>Level table</div>
        {LEVELS.map((l, i) => {
          const currentLevel = LEVELS.slice().reverse().find(lv => bubbles >= lv.min)
          const isCurrent = l.level === currentLevel?.level
          return (
            <div key={l.level}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: i < LEVELS.length - 1 ? '1px solid var(--border-dim)' : 'none',
                opacity: isCurrent ? 1 : 0.55,
              }}
            >
              {/* Mini animal illustration */}
              <div style={{ width: 40, height: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SeaAnimalIllustration
                  animal={l.name}
                  size={28}
                  color={isCurrent ? 'var(--aqua)' : 'var(--text-3)'}
                  opacity={isCurrent ? 0.9 : 0.5}
                />
              </div>

              <div style={{ flex: 1 }}>
                <span className="font-serif" style={{ fontSize: '1rem', color: isCurrent ? 'var(--brass)' : 'var(--text-2)' }}>
                  {l.name}
                </span>
              </div>

              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.7rem', color: 'var(--text-3)' }}>
                {l.min.toLocaleString()} 🫧
              </span>

              {isCurrent && (
                <div style={{
                  padding: '2px 8px', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif',
                  background: 'rgba(201,168,76,0.15)', color: 'var(--brass)', borderRadius: 1,
                }}>
                  You
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Push notifications */}
      <div className="panel" style={{ padding: 20, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="label-xs" style={{ color: 'var(--brass)' }}>Notifications</div>
          {pushStatus === 'subscribed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--aqua)', boxShadow: '0 0 5px var(--aqua)',
              }} />
              <span style={{ fontSize: '0.6rem', fontFamily: 'DM Sans, sans-serif', color: 'var(--aqua)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Active
              </span>
            </div>
          )}
        </div>

        {pushStatus === 'unsupported' && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
            Push notifications require the app to be added to your home screen and opened from there.
          </div>
        )}

        {pushStatus === 'denied' && (
          <div style={{ fontSize: '0.8rem', color: 'var(--negative)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
            Notifications are blocked. Go to Settings → Safari → this site to re-enable.
          </div>
        )}

        {(pushStatus === 'idle' || pushStatus === 'requesting') && (
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontFamily: 'DM Sans, sans-serif', marginBottom: 16, lineHeight: 1.6 }}>
              Get a daily reminder from the ocean — your time, your topic.
            </div>
            <button
              onClick={subscribe}
              disabled={pushStatus === 'requesting'}
              className="btn-brass"
              style={{ opacity: pushStatus === 'requesting' ? 0.6 : 1 }}
            >
              {pushStatus === 'requesting' ? 'Requesting permission…' : 'Enable notifications'}
            </button>
            {pushError && (
              <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--negative)', fontFamily: 'DM Mono, monospace' }}>
                {pushError}
              </div>
            )}
          </div>
        )}

        {pushStatus === 'subscribed' && (
          <NotifSchedules
            savePrefs={savePrefs}
            prefsSaved={prefsSaved}
            pushError={pushError}
            unsubscribe={unsubscribe}
          />
        )}
      </div>

      {/* Account */}
      <div className="panel" style={{ padding: 20, marginBottom: 12 }}>
        <div className="label-xs" style={{ color: 'var(--brass)', marginBottom: 14 }}>Account</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontFamily: 'DM Sans, sans-serif' }}>
              {userEmail || '—'}
            </div>
            <div className="label-xs" style={{ marginTop: 3 }}>Synced across all devices</div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-ghost"
            style={{ fontSize: '0.65rem', padding: '6px 14px', flexShrink: 0 }}
          >
            Sign out
          </button>
        </div>
      </div>

      <button onClick={save} className="btn-brass" style={{ width: '100%' }}>
        {saved ? '✓ Saved' : 'Save settings'}
      </button>
    </div>
  )
}
