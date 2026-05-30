import { useStore } from '../../store/useStore'
import { getLevelForBubbles, getProgressToNextLevel, LEVELS } from '../../constants/levels'

const R = 72
const ARC_START  = 210
const ARC_SWEEP  = 300

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end   = polarToCartesian(cx, cy, r, startAngle)
  const large = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`
}

export default function BubbleGauge() {
  const bubbles = useStore(s => s.bubbles)
  const level   = getLevelForBubbles(bubbles)
  const { progress } = getProgressToNextLevel(bubbles)
  const isNegative = bubbles < 0

  const clampedProgress = Math.min(1, Math.max(0, isNegative ? 0 : progress))
  const sweepAngle = ARC_SWEEP * clampedProgress
  const cx = 100, cy = 100

  const trackStart = ARC_START - ARC_SWEEP / 2
  const trackEnd   = ARC_START + ARC_SWEEP / 2
  const fillEnd    = trackStart + sweepAngle

  const trackPath = describeArc(cx, cy, R, trackStart, trackEnd)
  const fillPath  = sweepAngle > 1 ? describeArc(cx, cy, R, trackStart, fillEnd) : null

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: 200, height: 200, position: 'relative' }}>
        <svg viewBox="0 0 200 200" width="200" height="200">
          {/* Sunburst tick marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 360) / 36
            const isMajor = i % 3 === 0
            const inner = polarToCartesian(cx, cy, R + 6, angle)
            const outer = polarToCartesian(cx, cy, R + (isMajor ? 16 : 11), angle)
            return (
              <line key={i}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="var(--border-dim)"
                strokeWidth={isMajor ? 1.5 : 0.75}
              />
            )
          })}

          {/* Track arc */}
          <path
            d={trackPath}
            fill="none"
            stroke="var(--border-dim)"
            strokeWidth="5"
            strokeLinecap="square"
          />

          {/* Fill arc */}
          {fillPath && (
            <path
              d={fillPath}
              fill="none"
              stroke={isNegative ? 'var(--negative)' : 'url(#gaugeGrad)'}
              strokeWidth="5"
              strokeLinecap="square"
              style={{ transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' }}
            />
          )}

          {/* Level tick marks */}
          {LEVELS.map((l, i) => {
            if (i === 0) return null
            const maxBubbles = LEVELS[LEVELS.length - 1].min
            const frac = Math.min(l.min / maxBubbles, 0.995)
            const tickAngle = trackStart + ARC_SWEEP * frac
            const inner = polarToCartesian(cx, cy, R - 8, tickAngle)
            const outer = polarToCartesian(cx, cy, R + 2, tickAngle)
            return (
              <line key={i}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="var(--border)"
                strokeWidth="1.5"
              />
            )
          })}

          {/* Defs */}
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="var(--brass-dim)"/>
              <stop offset="100%" stopColor="var(--brass-bright)"/>
            </linearGradient>
          </defs>

          {/* Centre: label */}
          <text x={cx} y={cy - 14} textAnchor="middle"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 8,
              fontWeight: 700,
              fill: 'var(--text-3)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            BUBBLES
          </text>

          {/* Centre: number */}
          <text x={cx} y={cy + 12} textAnchor="middle"
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 30,
              fontWeight: 700,
              fill: isNegative ? 'var(--negative)' : 'var(--brass)',
              letterSpacing: '-0.02em',
            }}
          >
            {isNegative ? '−' : ''}{Math.abs(bubbles).toLocaleString()}
          </text>

          {/* Negative label */}
          {isNegative && (
            <text x={cx} y={cy + 26} textAnchor="middle"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 7,
                fontWeight: 700,
                fill: 'var(--negative)',
                letterSpacing: '0.2em',
              }}
            >
              NEGATIVE
            </text>
          )}
        </svg>
      </div>

      {/* Level name below gauge */}
      <div className="text-center mt-2">
        <div className="label-xs mb-1">Current rank</div>
        <div
          className="font-serif font-light"
          style={{ fontSize: '1.6rem', color: 'var(--brass)', letterSpacing: '0.03em', lineHeight: 1 }}
        >
          {level.name}
        </div>
        <div className="label-xs mt-1">Level {level.level}</div>
      </div>
    </div>
  )
}
