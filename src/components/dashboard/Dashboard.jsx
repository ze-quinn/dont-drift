import BubbleGauge from './BubbleGauge'
import WeekView from './WeekView'
import TaskList from '../tasks/TaskList'
import SeaAnimalIllustration from '../SeaAnimalIllustration'
import { useStore } from '../../store/useStore'
import { getLevelForBubbles } from '../../constants/levels'

export default function Dashboard() {
  const bubbles = useStore(s => s.bubbles)
  const logs = useStore(s => s.logs)
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
          <div
            className="panel p-6 flex flex-col items-center relative overflow-hidden"
            style={{ minHeight: 340 }}
          >
            {/* Sea animal watermark — large, centred, behind gauge */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <SeaAnimalIllustration
                animal={level.name}
                size={180}
                color="var(--aqua)"
                opacity={0.07}
                style={{ transform: 'translateY(24px)' }}
              />
            </div>

            {/* Gauge on top */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <BubbleGauge />
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
              <div className="text-center py-8">
                <div className="font-serif text-2xl font-light mb-2" style={{ color: 'var(--text-3)' }}>
                  Nothing logged yet
                </div>
                <div className="label-xs">Use the Log tab to record an activity</div>
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
