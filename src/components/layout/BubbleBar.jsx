import { getLevelForBubbles, getProgressToNextLevel } from '../../constants/levels'
import { useStore } from '../../store/useStore'

export default function BubbleBar() {
  const bubbles = useStore(s => s.bubbles)
  const level = getLevelForBubbles(bubbles)
  const { progress, next } = getProgressToNextLevel(bubbles)
  const isNegative = bubbles < 0

  return (
    <div
      className="flex items-center gap-5 px-6 py-2.5"
      style={{
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-panel-alt)',
      }}
    >
      {/* Level hexagon badge */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="hexagon w-8 h-9 flex items-center justify-center font-mono font-bold"
          style={{
            background: 'rgba(201,168,76,0.12)',
            color: 'var(--brass)',
            fontSize: '0.7rem',
            border: '1px solid var(--border)',
          }}
        >
          {level.level}
        </div>
        <div className="hidden sm:block leading-none">
          <div className="label-xs mb-0.5">Level {level.level}</div>
          <div className="font-serif text-sm font-medium" style={{ color: 'var(--brass)', letterSpacing: '0.02em' }}>
            {level.name}
          </div>
        </div>
      </div>

      {/* Ruled vertical separator */}
      <div className="w-px h-8 shrink-0" style={{ background: 'var(--border-dim)' }} />

      {/* Progress bar */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="label-xs">
            {next ? `To ${next.name}` : 'Maximum rank'}
          </span>
          {next && (
            <span className="label-xs">
              {Math.max(0, next.min - bubbles).toLocaleString()} to go
            </span>
          )}
        </div>
        <div className="h-px w-full" style={{ background: 'var(--border-dim)', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              background: 'var(--brass)',
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
      </div>

      {/* Ruled vertical separator */}
      <div className="w-px h-8 shrink-0" style={{ background: 'var(--border-dim)' }} />

      {/* Bubble count */}
      <div className="text-right shrink-0">
        <div className="label-xs mb-1">🫧 Bubbles</div>
        <div
          className="font-mono font-bold leading-none"
          style={{
            fontSize: '1.25rem',
            color: isNegative ? 'var(--negative)' : 'var(--brass)',
            letterSpacing: '-0.02em',
          }}
        >
          {isNegative ? '−' : ''}{Math.abs(bubbles).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
