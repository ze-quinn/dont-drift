import { useState } from 'react'
import { getLevelForBubbles, getProgressToNextLevel } from '../../constants/levels'
import { useStore } from '../../store/useStore'

export default function BubbleBar({ onManualAlert }) {
  const bubbles = useStore(s => s.bubbles)
  const level   = getLevelForBubbles(bubbles)
  const { progress, next } = getProgressToNextLevel(bubbles)
  const isNegative = bubbles < 0
  const [pulsing, setPulsing] = useState(false)

  function handleManualAlert() {
    setPulsing(true)
    setTimeout(() => setPulsing(false), 600)
    onManualAlert()
  }

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
              position: 'absolute', left: 0, top: 0, height: '100%',
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

      {/* Ruled vertical separator */}
      <div className="w-px h-8 shrink-0" style={{ background: 'var(--border-dim)' }} />

      {/* ── Manual alert trigger ────────────────────────────────── */}
      <OceanButton onClick={handleManualAlert} pulsing={pulsing} />
    </div>
  )
}

/**
 * A designed object — not a debug button.
 * A small circular brass sigil with a wave motif inside.
 * Hover: aqua halo ring expands outward.
 * Click: ring pulses once, collapses.
 * Tooltip: "Ask the ocean"
 */
function OceanButton({ onClick, pulsing }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* Halo ring — expands on hover, pulses on click */}
      <div
        style={{
          position: 'absolute',
          inset: -6,
          borderRadius: '50%',
          border: '1px solid var(--aqua)',
          opacity: pulsing ? 0 : hovered ? 0.5 : 0,
          transform: pulsing ? 'scale(1.5)' : hovered ? 'scale(1.15)' : 'scale(1)',
          transition: pulsing
            ? 'transform 0.5s ease-out, opacity 0.5s ease-out'
            : 'transform 0.25s ease, opacity 0.25s ease',
          pointerEvents: 'none',
        }}
      />

      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Ask the ocean"
        style={{
          width: 32, height: 32,
          borderRadius: '50%',
          border: `1px solid ${hovered ? 'var(--aqua)' : 'var(--border)'}`,
          background: hovered ? 'rgba(126,207,192,0.08)' : 'transparent',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s, background 0.2s',
          position: 'relative',
        }}
      >
        <WaveIcon hovered={hovered} />
      </button>
    </div>
  )
}

function WaveIcon({ hovered }) {
  return (
    <svg viewBox="0 0 18 18" width="14" height="14" fill="none">
      {/* Three stacked arc-waves — Bauhaus ocean motif */}
      <path
        d="M2,13 Q4.5,10 7,13 Q9.5,16 12,13 Q14.5,10 16,13"
        stroke={hovered ? 'var(--aqua)' : 'var(--brass)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'stroke 0.2s' }}
      />
      <path
        d="M2,9 Q4.5,6 7,9 Q9.5,12 12,9 Q14.5,6 16,9"
        stroke={hovered ? 'var(--aqua)' : 'var(--brass)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
        style={{ transition: 'stroke 0.2s' }}
      />
      <path
        d="M2,5 Q4.5,2 7,5 Q9.5,8 12,5 Q14.5,2 16,5"
        stroke={hovered ? 'var(--aqua)' : 'var(--brass)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
        style={{ transition: 'stroke 0.2s' }}
      />
    </svg>
  )
}
