import { useState, useEffect, useRef } from 'react'
import { getLevelForBubbles, getProgressToNextLevel } from '../../constants/levels'
import { useStore } from '../../store/useStore'
import { soundBubbles } from '../../lib/feedback'
import { useSyncStatus } from '../../store/useSyncStatus'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import BubbleGlyph from '../BubbleGlyph'

export default function BubbleBar({ onManualAlert }) {
  const bubbles = useStore(s => s.bubbles)
  const level   = getLevelForBubbles(bubbles)
  const { progress, next } = getProgressToNextLevel(bubbles)
  const isNegative   = bubbles < 0
  const [pulsing, setPulsing]                 = useState(false)
  const [hexClicked, setHexClicked]           = useState(false)
  const [progressTooltip, setProgressTooltip] = useState(false)
  const [countPulsing, setCountPulsing]       = useState(false)
  const [countPulseKey, setCountPulseKey]     = useState(0)
  const displayedBubbles                      = useAnimatedNumber(bubbles)

  const COUNT_BUBBLES = [
    { x:  -6, r: 3,   delay: 0   },
    { x:   8, r: 4,   delay: 110 },
    { x: -14, r: 2.5, delay: 220 },
    { x:  14, r: 3.5, delay: 300 },
    { x:   2, r: 4.5, delay: 160 },
  ]

  // Play bubble pops whenever the bubble count changes
  const prevBubblesRef = useRef(bubbles)
  useEffect(() => {
    if (prevBubblesRef.current === bubbles) return
    prevBubblesRef.current = bubbles
    soundBubbles(COUNT_BUBBLES)
  }, [bubbles]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleHexClick() {
    setHexClicked(true)
    setTimeout(() => setHexClicked(false), 500)
  }

  function handleManualAlert() {
    setPulsing(true)
    setTimeout(() => setPulsing(false), 600)
    onManualAlert()
  }

  function handleCountClick() {
    setCountPulseKey(k => k + 1)
    setCountPulsing(true)
    setTimeout(() => setCountPulsing(false), 1600)
    soundBubbles(COUNT_BUBBLES)
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-panel-alt)', flexShrink: 0, paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center gap-3 lg:gap-5 px-4 lg:px-6 py-2.5">

        {/* Level badge — SVG hex so stroke is never clipped */}
        <div className="flex items-center gap-2 shrink-0" style={{ cursor: 'pointer' }} onClick={handleHexClick}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg viewBox="0 0 28 32" width="28" height="32">
              <polygon
                points="14,1.5 26.5,8.5 26.5,23.5 14,30.5 1.5,23.5 1.5,8.5"
                fill={hexClicked ? 'rgba(201,168,76,0.28)' : 'rgba(201,168,76,0.10)'}
                stroke="var(--brass)"
                strokeWidth="1.5"
                style={{ transition: 'fill 0.2s' }}
              />
              <text x="14" y="20.5" textAnchor="middle" style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 10, fontWeight: 700,
                fill: 'var(--brass)',
              }}>
                {level.level}
              </text>
            </svg>
            {/* Pulse ring */}
            {hexClicked && (
              <div style={{
                position: 'absolute', inset: -5, borderRadius: 3,
                border: '1.5px solid var(--brass)',
                animation: 'hexPulse 0.5s ease-out forwards',
                pointerEvents: 'none',
              }} />
            )}
          </div>
          <div className="leading-none hidden sm:block">
            <div className="label-xs mb-0.5">Level {level.level}</div>
            <div className="font-serif text-sm font-medium" style={{ color: 'var(--brass)', letterSpacing: '0.02em' }}>
              {level.name}
            </div>
          </div>
        </div>

        <div className="w-px h-7 shrink-0" style={{ background: 'var(--border-dim)' }} />

        {/* Progress */}
        <div
          className="flex-1 min-w-0"
          style={{ position: 'relative', cursor: next ? 'pointer' : 'default' }}
          onClick={() => next && setProgressTooltip(v => !v)}
          onMouseEnter={() => next && setProgressTooltip(true)}
          onMouseLeave={() => setProgressTooltip(false)}
        >
          <div className="flex justify-between items-baseline mb-1">
            <span className="label-xs truncate">
              {next ? (
                <>
                  <span className="hidden sm:inline">{`To ${next.name}`}</span>
                  <span className="sm:hidden">{`To L${next.level}`}</span>
                </>
              ) : 'Max rank'}
            </span>
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
          {/* Tooltip — below the bar so it doesn't go off-screen */}
          {progressTooltip && next && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: 2, padding: '7px 12px', whiteSpace: 'nowrap',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: 'var(--text-1)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              pointerEvents: 'none', zIndex: 50,
            }}>
              <span style={{ color: 'var(--text-3)' }}>To </span>
              <span style={{ color: 'var(--brass)', fontWeight: 600 }}>{next.name}</span>
              <span style={{ color: 'var(--text-3)' }}> — </span>
              <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>{Math.max(0, next.min - bubbles).toLocaleString()}</span>
              <span style={{ color: 'var(--text-3)' }}> <BubbleGlyph size={10} /> to go</span>
            </div>
          )}
        </div>

        <div className="w-px h-7 shrink-0" style={{ background: 'var(--border-dim)' }} />

        {/* Bubble count — click for bubble burst */}
        <div
          className="text-right shrink-0"
          style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' }}
          onClick={handleCountClick}
        >
          <div className="label-xs mb-0.5"><BubbleGlyph size={10} /> Bubbles</div>
          <div className="font-mono font-bold leading-none"
            style={{ fontSize: '1.2rem', color: isNegative ? 'var(--negative)' : 'var(--brass)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}
          >
            {isNegative ? '−' : ''}{Math.abs(displayedBubbles).toLocaleString()}
          </div>
          {/* Bubbles */}
          {countPulsing && COUNT_BUBBLES.map((b, i) => (
            <div key={`${countPulseKey}-b${i}`} style={{
              position: 'absolute',
              left: `calc(50% + ${b.x}px)`,
              bottom: '70%',
              width: b.r * 2, height: b.r * 2,
              borderRadius: '50%',
              border: '1px solid var(--brass)',
              opacity: 0,
              pointerEvents: 'none',
              animation: `bubbleRiseSmall 1.4s ease-out ${b.delay}ms forwards`,
            }} />
          ))}
        </div>

        <div className="w-px h-7 shrink-0" style={{ background: 'var(--border-dim)' }} />

        <SyncPill />

        <OceanButton onClick={handleManualAlert} pulsing={pulsing} />
      </div>
    </div>
  )
}

// ── Sync status — dot on mobile, dot + label from sm: up ──────────────────
const SYNC_META = {
  idle:    { color: 'var(--text-3)',  label: 'LOCAL' },
  syncing: { color: 'var(--brass)',   label: 'SYNCING\u2026', blink: true },
  synced:  { color: 'var(--aqua)',    label: 'SYNCED' },
  offline: { color: 'var(--negative)',label: 'OFFLINE' },
  error:   { color: 'var(--negative)',label: 'RETRYING' },
}

function SyncPill() {
  const status = useSyncStatus(s => s.status)
  const [showTip, setShowTip] = useState(false)
  const meta = SYNC_META[status] ?? SYNC_META.idle
  if (status === 'idle') return null // logged out / nothing synced yet

  function tapDot() {
    setShowTip(true)
    setTimeout(() => setShowTip(false), 2000)
  }

  return (
    <div className="shrink-0" style={{ position: 'relative' }} onClick={tapDot} title={meta.label.toLowerCase()}>
      <div
        className="flex items-center sm:gap-1.5 sm:px-2.5 sm:py-1"
        style={{ cursor: 'default', borderRadius: 20 }}
      >
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: meta.color, flexShrink: 0,
          animation: meta.blink ? 'syncBlink 1.2s ease-in-out infinite' : 'none',
        }} />
        <span className="label-xs hidden sm:inline" style={{ color: 'var(--text-2)' }}>{meta.label}</span>
      </div>
      {showTip && (
        <div className="sm:hidden" style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: 2, padding: '5px 10px', whiteSpace: 'nowrap',
          fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--text-2)',
          zIndex: 50, pointerEvents: 'none',
        }}>
          {meta.label}
        </div>
      )}
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
