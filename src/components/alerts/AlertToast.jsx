import { useEffect } from 'react'
import SeaAnimalIllustration from '../SeaAnimalIllustration'
import { getLevelForBubbles } from '../../constants/levels'
import { useStore } from '../../store/useStore'

// Map alert animal emoji to the closest sea animal illustration name
const ANIMAL_MAP = {
  '🐙': 'Octopus', '🐋': 'Orca', '🐳': 'Blue Whale', '🐟': 'Barracuda',
  '🐡': 'Pufferfish', '🐬': 'Octopus', '🌊': 'Seahorse', '🐢': 'Manta Ray',
  '🦞': 'Barracuda', '🪼': 'Seahorse', '🐠': 'Pufferfish', '🦑': 'Octopus',
  '⭐': 'Seahorse', '🐚': 'Seahorse', '🐍': 'Barracuda',
}

export default function AlertToast({ alert, onDismiss }) {
  const bubbles    = useStore(s => s.bubbles)
  const level      = getLevelForBubbles(bubbles)
  const animalName = ANIMAL_MAP[alert.animal] ?? level.name

  useEffect(() => {
    const timer = setTimeout(onDismiss, 9000)
    return () => clearTimeout(timer)
  }, [alert, onDismiss])

  return (
    <div
      className="fixed z-50 animate-slide-in"
      style={{
        bottom: 80,          // above bottom tab bar on mobile
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(420px, calc(100vw - 32px))',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 2,
        boxShadow: '0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,168,76,0.08)',
      }}
    >
      {/* Top brass accent line */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--brass), transparent)', borderRadius: '2px 2px 0 0' }} />

      <div style={{ padding: '16px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>

          {/* Sea animal illustration */}
          <div style={{
            flexShrink: 0,
            width: 48, height: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(201,168,76,0.06)',
            borderRadius: 1,
            border: '1px solid var(--border-dim)',
          }}>
            <SeaAnimalIllustration
              animal={animalName}
              size={36}
              color="var(--aqua)"
              opacity={0.85}
            />
          </div>

          {/* Text */}
          <p style={{
            flex: 1, margin: 0,
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: 'var(--text-1)',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {alert.text}
          </p>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            style={{
              flexShrink: 0, marginTop: 2,
              width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brass)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        {/* Auto-dismiss progress */}
        <div style={{ marginTop: 12, height: 1, background: 'var(--border-dim)', overflow: 'hidden', borderRadius: 1 }}>
          <div style={{
            height: '100%', background: 'var(--brass)', opacity: 0.45,
            animation: 'shrink 9s linear forwards', width: '100%',
          }} />
        </div>
      </div>

      <style>{`@keyframes shrink { from { width:100%; } to { width:0%; } }`}</style>
    </div>
  )
}
