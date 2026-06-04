import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { LEVELS } from '../../constants/levels'
import SeaAnimalIllustration from '../SeaAnimalIllustration'
import { usePushNotifications } from '../../hooks/usePushNotifications'

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

export default function Settings() {
  const { settings, updateSettings } = useStore()
  const bubbles = useStore(s => s.bubbles)
  const { status: pushStatus, error: pushError, prefsSaved, subscribe, unsubscribe, savePrefs } = usePushNotifications()
  const [saved, setSaved] = useState(false)

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
          <div>
            {/* ── Time picker ── */}
            <div style={{ marginBottom: 20 }}>
              <div className="label-xs" style={{ marginBottom: 10 }}>Notify me at</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TimeInput
                  label="Hour (24h)"
                  value={settings.notifHour ?? 19}
                  onChange={v => updateSettings({ notifHour: v })}
                  min={0} max={23}
                />
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '1.5rem', fontWeight: 300,
                  color: 'var(--text-3)', paddingTop: 22, flexShrink: 0,
                }}>:</div>
                <TimeInput
                  label="Minute"
                  value={settings.notifMinute ?? 0}
                  onChange={v => updateSettings({ notifMinute: v })}
                  min={0} max={59}
                />
              </div>
              <div style={{ marginTop: 8, fontFamily: 'DM Mono, monospace', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                {String(settings.notifHour ?? 19).padStart(2,'0')}:{String(settings.notifMinute ?? 0).padStart(2,'0')} IST daily
              </div>
            </div>

            {/* ── Topic selector ── */}
            <div style={{ marginBottom: 20 }}>
              <div className="label-xs" style={{ marginBottom: 10 }}>Remind me about</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {NOTIF_TOPICS.map(t => {
                  const active = (settings.notifTopic ?? 'shoulder') === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ notifTopic: t.id })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 13px',
                        fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: active ? 600 : 400,
                        background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                        border: active ? '1px solid var(--brass)' : '1px solid var(--border-dim)',
                        borderRadius: 2, cursor: 'pointer',
                        color: active ? 'var(--brass)' : 'var(--text-2)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '0.85rem' }}>{t.icon}</span>
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Save + disable ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => savePrefs(settings.notifHour ?? 19, settings.notifMinute ?? 0, settings.notifTopic ?? 'shoulder')}
                className="btn-brass"
                style={{ flex: 1 }}
              >
                {prefsSaved ? '✓ Saved' : 'Save notification preferences'}
              </button>
              <button
                onClick={unsubscribe}
                className="btn-ghost"
                style={{ fontSize: '0.65rem', padding: '8px 14px', flexShrink: 0 }}
              >
                Disable
              </button>
            </div>

            {pushError && (
              <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--negative)', fontFamily: 'DM Mono, monospace' }}>
                {pushError}
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={save} className="btn-brass" style={{ width: '100%' }}>
        {saved ? '✓ Saved' : 'Save settings'}
      </button>
    </div>
  )
}
