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

export default function Settings() {
  const { settings, updateSettings } = useStore()
  const bubbles = useStore(s => s.bubbles)
  const { status: pushStatus, error: pushError, subscribe, unsubscribe } = usePushNotifications()
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
        <div className="label-xs" style={{ color: 'var(--brass)', marginBottom: 12 }}>Notifications</div>

        {pushStatus === 'unsupported' && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontFamily: 'DM Sans, sans-serif' }}>
            Push notifications aren't supported in this browser. Add the app to your home screen and open it from there.
          </div>
        )}

        {pushStatus === 'denied' && (
          <div style={{ fontSize: '0.8rem', color: 'var(--negative)', fontFamily: 'DM Sans, sans-serif' }}>
            Notifications are blocked. Go to your device Settings → Safari → [this site] to re-enable.
          </div>
        )}

        {(pushStatus === 'idle' || pushStatus === 'requesting') && pushStatus !== 'unsupported' && pushStatus !== 'denied' && (
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontFamily: 'DM Sans, sans-serif', marginBottom: 14, lineHeight: 1.5 }}>
              Get a daily shoulder work reminder at 7 pm. The ocean will come to you.
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--aqua)', boxShadow: '0 0 6px var(--aqua)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--aqua)', fontFamily: 'DM Sans, sans-serif' }}>
                Active — daily shoulder reminder at 7 pm
              </span>
            </div>
            <button
              onClick={unsubscribe}
              className="btn-ghost"
              style={{ fontSize: '0.65rem', padding: '6px 14px' }}
            >
              Disable
            </button>
          </div>
        )}
      </div>

      <button onClick={save} className="btn-brass" style={{ width: '100%' }}>
        {saved ? '✓ Saved' : 'Save settings'}
      </button>
    </div>
  )
}
