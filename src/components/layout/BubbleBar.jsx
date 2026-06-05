import { useState, useEffect, useRef } from 'react'
import { getLevelForBubbles, getProgressToNextLevel } from '../../constants/levels'
import { useStore } from '../../store/useStore'

// ── Odometer hook — counts from prev value to new value ──────────
function useAnimatedNumber(value, duration = 700) {
  const [displayed, setDisplayed] = useState(value)
  const prevRef = useRef(value)
  const rafRef  = useRef(null)

  useEffect(() => {
    const from = prevRef.current
    const to   = value
    if (from === to) return

    const start = performance.now()
    function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setDisplayed(Math.round(from + (to - from) * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else { prevRef.current = to; setDisplayed(to) }
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return displayed
}

export default function BubbleBar({ onManualAlert }) {
  const bubbles = useStore(s => s.bubbles)
  const level   = getLevelForBubbles(bubbles)
  const { progress, next } = getProgressToNextLevel(bubbles)
  const isNegative   = bubbles < 0
  const [pulsing, setPulsing] = useState(false)
  const displayedBubbles = useAnimatedNumber(bubbles)

  function handleManualAlert() {
    setPulsing(true)
    setTimeout(() => setPulsing(false), 600)
    onManualAlert()
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-panel-alt)', flexShrink: 0 }}>
      <div className="flex items-center gap-3 lg:gap-5 px-4 lg:px-6 py-2.5">

        {/* Level badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hexagon flex items-center justify-center font-mono font-bold"
            style={{ width: 28, height: 32, background: 'rgba(201,168,76,0.12)', color: 'var(--brass)', fontSize: '0.65rem', border: '1px solid var(--border)' }}
          >
            {level.level}
          </div>
          <div className="leading-none hidden sm:block">
            <div className="label-xs mb-0.5">Level {level.level}</div>
            <div className="font-serif text-sm font-medium" style={{ color: 'var(--brass)', letterSpacing: '0.02em' }}>
              {level.name}
            </div>
          </div>
        </div>

        <div className="w-px h-7 shrink-0" style={{ background: 'var(--border-dim)' }} />

        {/* Progress — spring transition */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <span className="label-xs truncate">{next ? `To ${next.name}` : 'Max rank'}</span>
            {next && <span className="label-xs ml-2 shrink-0">{Math.max(0, next.min - bubbles).toLocaleString()}</span>}
          </div>
          <div className="h-px w-full" style={{ background: 'var(--border-dim)', position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              background: 'var(--brass)',
              transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }} />
          </div>
        </div>

        <div className="w-px h-7 shrink-0" style={{ background: 'var(--border-dim)' }} />

        {/* Bubble count — animated odometer */}
        <div className="text-right shrink-0">
          <div className="label-xs mb-0.5">🫧 Bubbles</div>
          <div className="font-mono font-bold leading-none"
            style={{ fontSize: '1.2rem', color: isNegative ? 'var(--negative)' : 'var(--brass)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}
          >
            {isNegative ? '−' : ''}{Math.abs(displayedBubbles).toLocaleString()}
          </div>
        </div>

        <div className="w-px h-7 shrink-0" style={{ background: 'var(--border-dim)' }} />

        <OceanButton onClick={handleManualAlert} pulsing={pulsing} />
      </div>
    </div>
  )
}

function OceanButton({ onClick, pulsing }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: -6, borderRadius: '50%',
        border: '1px solid var(--aqua)',
        opacity: pulsing ? 0 : hovered ? 0.5 : 0,
        transform: pulsing ? 'scale(1.5)' : hovered ? 'scale(1.15)' : 'scale(1)',
        transition: pulsing ? 'transform 0.5s ease-out, opacity 0.5s ease-out' : 'transform 0.25s ease, opacity 0.25s ease',
        pointerEvents: 'none',
      }} />
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Ask the ocean"
        style={{
          width: 32, height: 32, borderRadius: '50%',
          border: `1px solid ${hovered ? 'var(--aqua)' : 'var(--border)'}`,
          background: hovered ? 'rgba(126,207,192,0.08)' : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s, background 0.2s, transform 0.1s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onMouseUp={e   => e.currentTarget.style.transform = 'scale(1)'}
      >
        <WaveIcon hovered={hovered} />
      </button>
    </div>
  )
}

function WaveIcon({ hovered }) {
  const c = hovered ? 'var(--aqua)' : 'var(--brass)'
  return (
    <svg viewBox="0 0 18 18" width="14" height="14" fill="none">
      <path d="M2,13 Q4.5,10 7,13 Q9.5,16 12,13 Q14.5,10 16,13" stroke={c} strokeWidth="1.5" strokeLinecap="round" style={{ transition: 'stroke 0.2s' }}/>
      <path d="M2,9 Q4.5,6 7,9 Q9.5,12 12,9 Q14.5,6 16,9"   stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.65" style={{ transition: 'stroke 0.2s' }}/>
      <path d="M2,5 Q4.5,2 7,5 Q9.5,8 12,5 Q14.5,2 16,5"   stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"  style={{ transition: 'stroke 0.2s' }}/>
    </svg>
  )
}
