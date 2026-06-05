import { useEffect, useRef } from 'react'
import BubbleGauge from './BubbleGauge'
import WeekView from './WeekView'
import TaskList from '../tasks/TaskList'
import SeaAnimalIllustration from '../SeaAnimalIllustration'
import { useStore } from '../../store/useStore'
import { getLevelForBubbles } from '../../constants/levels'
import { useAlertTrigger } from '../../context/AlertContext'

const IDLE_MS = 3 * 60 * 1000 // 3 minutes idle on dashboard

export default function Dashboard() {
  const bubbles = useStore(s => s.bubbles)
  const logs = useStore(s => s.logs)
  const { showAlert } = useAlertTrigger()
  const idleTimerRef = useRef(null)

  // Idle trigger — show a sea animal after 3 min of no pointer activity
  useEffect(() => {
    function resetIdle() {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => showAlert('general'), IDLE_MS)
    }
    resetIdle() // arm immediately on mount
    window.addEventListener('pointermove', resetIdle)
    window.addEventListener('pointerdown', resetIdle)
    window.addEventListener('keydown', resetIdle)
    return () => {
      clearTimeout(idleTimerRef.current)
      window.removeEventListener('pointermove', resetIdle)
      window.removeEventListener('pointerdown', resetIdle)
      window.removeEventListener('keydown', resetIdle)
    }
  }, [showAlert])
  const level = getLevelForBubbles(bubbles)
  const recentLogs = logs.slice(0, 6)

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="label-xs mb-1.5">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h1
          className="font-serif font-light leading-none"
          style={{ fontSize: '3.5rem', color: 'var(--text-1)', letterSpacing: '-0.01em' }}
        >
          Don't Drift
        </h1>
        {/* Art deco underline rule */}
        <div className="flex items-center gap-3 mt-3">
          <div className="h-px w-32" style={{ background: 'var(--brass)' }} />
          <div className="h-px w-4"  style={{ background: 'var(--brass)', opacity: 0.4 }} />
          <div className="h-px w-1.5" style={{ background: 'var(--brass)', opacity: 0.2 }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left column ── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Gauge panel with large animal watermark */}
          <div className="panel p-5 flex flex-col items-center relative overflow-hidden">
            {/* Sea animal watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
              <SeaAnimalIllustration animal={level.name} size={160} color="var(--aqua)" opacity={0.07} />
            </div>
            {/* Gauge */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <BubbleGauge />
            </div>
            {/* Level name beneath gauge */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: 2, paddingBottom: 4 }}>
              <div className="font-serif font-light" style={{ fontSize: '1.1rem', color: 'var(--brass)', letterSpacing: '0.04em' }}>
                {level.name}
              </div>
              <div className="label-xs" style={{ marginTop: 2 }}>Level {level.level}</div>
            </div>
          </div>

          {/* Week view */}
          <div className="panel p-4">
            <WeekView />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Today's tasks */}
          <div className="panel p-5">
            <TaskList />
          </div>

          {/* Recent activity log */}
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="label-xs">Recent activity</div>
              {recentLogs.length > 0 && (
                <div className="label-xs" style={{ color: 'var(--text-3)' }}>
                  Today's total:{' '}
                  <span style={{ color: recentLogs.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).reduce((s,l)=>s+l.delta,0) >= 0 ? 'var(--brass)' : 'var(--negative)' }}>
                    {recentLogs.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).reduce((s,l)=>s+l.delta,0) > 0 ? '+' : ''}
                    {recentLogs.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).reduce((s,l)=>s+l.delta,0)}
                  </span>
                </div>
              )}
            </div>

            {recentLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.35 }}>
                  <SeaAnimalIllustration animal={level.name} size={64} color="var(--aqua)" opacity={1} />
                </div>
                <div className="font-serif font-light" style={{ fontSize: '1.25rem', color: 'var(--text-3)', marginBottom: 6 }}>
                  Nothing logged yet
                </div>
                <div className="label-xs">The ocean is waiting — log your first activity</div>
              </div>
            ) : (
              <div>
                {recentLogs.map((log, i) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: i < recentLogs.length - 1 ? '1px solid var(--border-dim)' : 'none' }}
                  >
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                        {log.label}
                      </div>
                      {log.note && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{log.note}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color: log.delta >= 0 ? 'var(--brass)' : 'var(--negative)' }}
                      >
                        {log.delta > 0 ? '+' : ''}{log.delta}
                      </span>
                      <span className="label-xs tabular-nums">
                        {new Date(log.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
