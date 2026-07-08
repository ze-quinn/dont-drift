import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useSyncStatus } from '../../store/useSyncStatus'
import { LEVELS } from '../../constants/levels'
import SeaAnimalIllustration from '../SeaAnimalIllustration'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import MandatoryActivities from './MandatoryActivities'
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

const BUILTIN_NOTIF_TOPICS = [
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
  const customActivities  = useStore(s => s.customActivities)

  // Merge built-in topics with user's custom activities
  const NOTIF_TOPICS = [
    ...BUILTIN_NOTIF_TOPICS,
    ...customActivities.map(a => ({
      id:     a.id,
      label:  a.label,
      icon:   a.icon ?? '⭐',
      custom: true,
    })),
  ]

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
    // Attach label + icon for custom topics so the server can generate messages
    const enriched = schedules.map(s => {
      const topic = NOTIF_TOPICS.find(t => t.id === s.topic)
      return topic?.custom
        ? { ...s, label: topic.label, icon: topic.icon }
        : s
    })
    setNotifSchedules(enriched)
    savePrefs(enriched)
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
          {prefsSaved ? '✓ Saved' : 'Save'}
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

function SyncedLine() {
  const status = useSyncStatus(s => s.status)
  const lastSyncedAt = useSyncStatus(s => s.lastSyncedAt)
  const ago = timeAgo(lastSyncedAt)
  const text =
    status === 'offline' ? 'Offline — changes saved locally' :
    status === 'error'   ? 'Sync failed — will retry' :
    status === 'syncing' ? 'Syncing…' :
    ago ? `Last synced ${ago} ✓` : 'Synced across all devices'
  return (
    <div className="label-xs" style={{ marginTop: 3, color: status === 'offline' || status === 'error' ? 'var(--negative)' : undefined }}>
      {text}
    </div>
  )
}

// Relative "x min ago" formatter for the sync timestamp
function timeAgo(iso) {
  if (!iso) return null
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 min ago'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return hrs === 1 ? '1 hr ago' : `${hrs} hrs ago`
}

function Toggle({ label, sublabel, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-1)', fontFamily: 'DM Sans, sans-serif' }}>{label}</div>
        {sublabel && <div className="label-xs" style={{ marginTop: 2 }}>{sublabel}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch" aria-checked={value} aria-label={label}
        style={{
          width: 40, height: 22, borderRadius: 11, flexShrink: 0, cursor: 'pointer',
          border: `1px solid ${value ? 'var(--brass)' : 'var(--border-dim)'}`,
          background: value ? 'rgba(201,168,76,0.25)' : 'var(--bg-input)',
          position: 'relative', transition: 'background 0.2s, border-color 0.2s', padding: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: value ? 'var(--brass)' : 'var(--text-3)',
          transition: 'left 0.2s, background 0.2s',
        }} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { settings, updateSettings } = useStore()
  const bubbles = useStore(s => s.bubbles)
  const { status: pushStatus, error: pushError, prefsSaved, subscribe, unsubscribe, savePrefs } = usePushNotifications()
  const [userEmail, setUserEmail] = useState('')
  const [sleepEditing, setSleepEditing]   = useState(false)
  const [sleepSaved,   setSleepSaved]     = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? '')
    })
  }, [])

  function saveSleep() {
    setSleepEditing(false)
    setSleepSaved(true)
    setTimeout(() => setSleepSaved(false), 2000)
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

      {/* Sleep */}
      <div className="panel" style={{ padding: 20, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="label-xs" style={{ color: 'var(--brass)' }}>Sleep goal</div>
          {!sleepEditing && (
            <button onClick={() => setSleepEditing(true)} className="btn-ghost"
              style={{ fontSize: '0.62rem', padding: '4px 10px' }}>
              {sleepSaved ? '✓ Saved' : 'Edit'}
            </button>
          )}
        </div>
        {sleepEditing ? (
          <>
            <Field label="Target hours" value={settings.sleepGoalHours ?? 7} onChange={v => updateSettings({ sleepGoalHours: Number(v) })} min={6} max={10}/>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={saveSleep} className="btn-brass" style={{ flex: 1 }}>Save</button>
              <button onClick={() => setSleepEditing(false)} className="btn-ghost"
                style={{ fontSize: '0.65rem', padding: '8px 14px' }}>Cancel</button>
            </div>
          </>
        ) : (
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brass)', letterSpacing: '-0.02em' }}>
            {settings.sleepGoalHours ?? 7}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-3)', marginLeft: 4 }}>hrs</span>
          </div>
        )}
      </div>

      {/* Sound + haptics */}
      <div className="panel" style={{ padding: 20, marginBottom: 12 }}>
        <div className="label-xs" style={{ color: 'var(--brass)', marginBottom: 8 }}>Sound &amp; haptics</div>
        <Toggle
          label="Bubble sounds"
          sublabel="Pops, chimes and gains"
          value={settings.soundEnabled ?? true}
          onChange={v => updateSettings({ soundEnabled: v })}
        />
        <div style={{ height: 1, background: 'var(--border-dim)' }} />
        <Toggle
          label="Haptics"
          sublabel="Vibration on log and level-up (Android)"
          value={settings.hapticsEnabled ?? true}
          onChange={v => updateSettings({ hapticsEnabled: v })}
        />
      </div>

      {/* Mandatory activities */}
      <MandatoryActivities />

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
            <SyncedLine />
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

    </div>
  )
}
