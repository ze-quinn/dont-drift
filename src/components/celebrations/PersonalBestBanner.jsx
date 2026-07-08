import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { todayTotal, personalBestDay, dayKey } from '../../lib/stats'

// Thin celebratory banner shown the moment today's net bubbles beat your best
// single day ever. Dismissable, and only shows once per day.
export default function PersonalBestBanner() {
  const logs = useStore(s => s.logs)
  const today = todayTotal(logs)
  const prevBest = personalBestDay(logs, dayKey())

  const storageKey = `dd-pb-${new Date().toISOString().slice(0, 10)}`
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(storageKey) === '1' } catch { return false }
  })

  const isRecord = prevBest > 0 && today > prevBest
  if (!isRecord || dismissed) return null

  function dismiss() {
    try { localStorage.setItem(storageKey, '1') } catch (_) {}
    setDismissed(true)
  }

  return (
    <div
      className="animate-slide-up"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--brass)',
        borderRadius: 2, padding: '12px 16px', marginBottom: 20,
      }}
    >
      <span style={{ fontSize: 18 }}>🌊</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="label-xs" style={{ color: 'var(--brass)' }}>New personal best</div>
        <div className="text-sm" style={{ color: 'var(--text-1)' }}>
          <span className="font-mono font-bold" style={{ color: 'var(--brass)' }}>+{today}</span>{' '}
          bubbles today — your best day yet (was +{prevBest}).
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  )
}
