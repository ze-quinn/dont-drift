import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useHealth } from '../../hooks/useHealth'
import WeightChart from './WeightChart'

function StatCard({ label, value, unit, sub }) {
  return (
    <div className="panel" style={{ padding: 16, textAlign: 'center' }}>
      <div className="label-xs" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{
        fontFamily: 'DM Mono, monospace', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1,
        color: value ? 'var(--brass)' : 'var(--text-3)',
      }}>
        {value ?? '—'}
        {value && unit && (
          <span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: 4, color: 'var(--text-2)' }}>{unit}</span>
        )}
      </div>
      {sub && <div className="label-xs" style={{ marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function Field({ label, value, onChange, unit }) {
  return (
    <div style={{ minWidth: 0, overflow: 'hidden' }}>
      <label className="label-xs" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1, minWidth: 0, width: '100%', padding: '8px 10px',
            fontFamily: 'DM Mono, monospace', fontSize: '0.875rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-dim)',
            boxSizing: 'border-box',
            borderRadius: 1, color: 'var(--text-1)', outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--border-strong)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border-dim)'}
        />
        {unit && <span className="label-xs" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{unit}</span>}
      </div>
    </div>
  )
}

export default function BodyStats() {
  const { settings, updateSettings, weightLog, logWeight, healthData, updateHealthData } = useStore()
  const { bmi, bmr, distanceToTarget } = useHealth()

  const [localWeight, setLocalWeight] = useState(settings.weight || '')
  const [manualHealth, setManualHealth] = useState({
    steps:          healthData.steps ?? '',
    activeCalories: healthData.activeCalories ?? '',
    sleepHours:     healthData.sleepHours ?? '',
    restingHR:      healthData.restingHR ?? '',
  })

  function saveSettings() {
    updateSettings({ weight: localWeight })
    if (localWeight) logWeight(localWeight)
  }

  function saveHealthData() {
    updateHealthData({
      steps:          manualHealth.steps          ? Number(manualHealth.steps)          : null,
      activeCalories: manualHealth.activeCalories ? Number(manualHealth.activeCalories) : null,
      sleepHours:     manualHealth.sleepHours     ? Number(manualHealth.sleepHours)     : null,
      restingHR:      manualHealth.restingHR      ? Number(manualHealth.restingHR)      : null,
    })
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, width: '100%', boxSizing: 'border-box', margin: '0 auto', overflowX: 'hidden' }} className="animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <div className="label-xs" style={{ marginBottom: 6 }}>Body</div>
        <h1 className="font-serif font-light" style={{ fontSize: '3rem', color: 'var(--text-1)', margin: 0, lineHeight: 1 }}>
          Stats
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
          <div style={{ height: 1, width: 80, background: 'var(--brass)' }} />
          <div style={{ height: 1, width: 16, background: 'var(--brass)', opacity: 0.4 }} />
        </div>
      </div>

      {/* Computed stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="BMI"      value={bmi} sub={bmi ? (parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Healthy' : 'Overweight') : null}/>
        <StatCard label="BMR"      value={bmr} unit="kcal"/>
        <StatCard label="To target" value={distanceToTarget ? Math.abs(distanceToTarget) : null} unit="kg" sub={distanceToTarget ? (parseFloat(distanceToTarget) > 0 ? 'to lose' : 'to gain') : null}/>
        <StatCard label="Weight"   value={settings.weight ? parseFloat(settings.weight).toFixed(1) : null} unit="kg"/>
      </div>

      {/* Weight chart */}
      <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
        <div className="label-xs" style={{ marginBottom: 16 }}>Weight trend</div>
        <WeightChart weightLog={weightLog} />
      </div>

      {/* Body data */}
      <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
        <div className="label-xs" style={{ marginBottom: 16 }}>Body data</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
          <Field label="Height"         value={settings.height}       onChange={v => updateSettings({ height: v })}       unit="cm"/>
          <Field label="Current weight" value={localWeight}            onChange={setLocalWeight}                           unit="kg"/>
          <Field label="Target weight"  value={settings.targetWeight} onChange={v => updateSettings({ targetWeight: v })} unit="kg"/>
          <Field label="Age"            value={settings.age}          onChange={v => updateSettings({ age: v })}          unit="yrs"/>
        </div>
        <button onClick={saveSettings} className="btn-brass" style={{ width: '100%' }}>
          Save & log weight
        </button>
      </div>

      {/* Apple Health */}
      <div className="panel" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div className="label-xs">Apple Health data</div>
          <div className="label-xs" style={{ color: 'var(--text-3)' }}>
            {healthData.lastSynced
              ? `Synced ${new Date(healthData.lastSynced).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
              : 'Not synced'}
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>
          Manual entry for now — HealthKit bridge coming in a future phase.
        </p>

        {healthData.steps && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Steps',       value: healthData.steps?.toLocaleString() },
              { label: 'Active cal',  value: healthData.activeCalories },
              { label: 'Sleep',       value: healthData.sleepHours ? `${healthData.sleepHours}h` : null },
              { label: 'Resting HR',  value: healthData.restingHR ? `${healthData.restingHR} bpm` : null },
            ].map(item => (
              <div key={item.label} style={{
                textAlign: 'center', padding: '10px 8px', borderRadius: 1,
                background: 'rgba(126,207,192,0.06)', border: '1px solid rgba(126,207,192,0.15)',
              }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.875rem', fontWeight: 700, color: 'var(--aqua)' }}>
                  {item.value ?? '—'}
                </div>
                <div className="label-xs" style={{ marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
          <Field label="Steps"           value={manualHealth.steps}          onChange={v => setManualHealth(h => ({...h, steps: v}))}          unit="steps"/>
          <Field label="Active calories" value={manualHealth.activeCalories} onChange={v => setManualHealth(h => ({...h, activeCalories: v}))} unit="kcal"/>
          <Field label="Sleep"           value={manualHealth.sleepHours}     onChange={v => setManualHealth(h => ({...h, sleepHours: v}))}     unit="hrs"/>
          <Field label="Resting HR"      value={manualHealth.restingHR}      onChange={v => setManualHealth(h => ({...h, restingHR: v}))}      unit="bpm"/>
        </div>
        <button onClick={saveHealthData} className="btn-ghost" style={{ width: '100%' }}>
          Sync manual data
        </button>
      </div>
    </div>
  )
}
