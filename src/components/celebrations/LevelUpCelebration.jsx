import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { getLevelForBubbles } from '../../constants/levels'
import SeaAnimalIllustration from '../SeaAnimalIllustration'
import { feedbackGain, soundBubbles } from '../../lib/feedback'

const KEY = 'dd-last-level'

const CELEBRATE_BUBBLES = [
  { r: 6, delay: 0 }, { r: 4, delay: 140 }, { r: 7, delay: 280 },
  { r: 5, delay: 420 }, { r: 4.5, delay: 560 }, { r: 6, delay: 700 },
]

// Full-screen celebration when the user crosses into a new level (= new sea
// animal). Fires once per level gained, survives reloads via localStorage.
export default function LevelUpCelebration() {
  const bubbles = useStore(s => s.bubbles)
  const level   = getLevelForBubbles(bubbles)
  const [show, setShow]   = useState(false)
  const prevLevel = useRef(null)

  useEffect(() => {
    const stored   = parseInt(localStorage.getItem(KEY) ?? '', 10)
    const baseline = Number.isNaN(stored) ? level.level : stored
    if (prevLevel.current === null) prevLevel.current = baseline

    if (level.level > prevLevel.current) {
      prevLevel.current = level.level
      localStorage.setItem(KEY, String(level.level))
      setShow(true)
      feedbackGain()
      soundBubbles(CELEBRATE_BUBBLES)
      const t = setTimeout(() => setShow(false), 4500)
      return () => clearTimeout(t)
    }
    if (level.level !== prevLevel.current) {
      // dropped a level — re-baseline silently so re-climbing celebrates again
      prevLevel.current = level.level
      localStorage.setItem(KEY, String(level.level))
    }
  }, [level.level])

  if (!show) return null

  return (
    <div
      onClick={() => setShow(false)}
      className="animate-fade-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(6,14,22,0.82)', backdropFilter: 'blur(3px)',
        cursor: 'pointer', padding: 24,
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          textAlign: 'center', position: 'relative',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 4, padding: '34px 40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          maxWidth: 360,
        }}
      >
        {/* Rising bubbles behind the animal */}
        {CELEBRATE_BUBBLES.map((b, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `calc(50% + ${(i - 2.5) * 22}px)`,
            top: '52%',
            width: b.r * 2, height: b.r * 2,
            borderRadius: '50%', border: '1.5px solid var(--brass)',
            opacity: 0, pointerEvents: 'none',
            animation: `bubbleRiseBig 2.4s ease-out ${b.delay}ms infinite`,
          }} />
        ))}

        <div className="label-xs" style={{ color: 'var(--aqua)', marginBottom: 10 }}>
          You became
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <SeaAnimalIllustration animal={level.name} size={96} color="var(--aqua)" opacity={0.95} />
        </div>
        <div className="font-serif" style={{
          fontSize: '2.2rem', color: 'var(--brass)', letterSpacing: '0.03em',
          fontWeight: 300, lineHeight: 1, marginBottom: 6,
        }}>
          {level.name}
        </div>
        <div className="label-xs">
          Level {level.level} · {Math.abs(bubbles).toLocaleString()} bubbles
        </div>
        <div className="label-xs" style={{ marginTop: 16, color: 'var(--text-3)', opacity: 0.7 }}>
          Tap to continue
        </div>
      </div>
    </div>
  )
}
