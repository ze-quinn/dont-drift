// RankSheet — tap the gauge watermark to see all 7 ranks.
// Unlocked ranks show in aqua; locked ranks are dimmed silhouettes.
import { useEffect } from 'react'
import SeaAnimalIllustration from '../SeaAnimalIllustration'

// Wide-format animals render ~1.9x their base size in width — use a smaller
// base so every rank fits the same 84px column.
const WIDE_RANKS = ['Barracuda', 'Blue Whale', 'Manta Ray', 'Orca']

export default function RankSheet({ currentLevel, bubbles, levels, onClose }) {
  // Esc closes; lock body scroll while open
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(5,10,18,0.72)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      className="animate-fade-in"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-slide-up"
        style={{
          width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
          background: 'var(--bg-panel)', borderTop: '1px solid var(--border)',
          borderLeft: '1px solid var(--border-dim)', borderRight: '1px solid var(--border-dim)',
          borderRadius: '8px 8px 0 0', padding: '20px 20px calc(20px + env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="label-xs mb-1">The ranks</div>
            <div className="font-serif font-light" style={{ fontSize: '1.4rem', color: 'var(--text-1)' }}>
              Just keep swimming
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid var(--border-dim)', background: 'transparent',
              color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div>
          {levels.map((lv, i) => {
            const unlocked = lv.level <= currentLevel
            const isCurrent = lv.level === currentLevel
            const toGo = Math.max(0, lv.min - bubbles)
            return (
              <div
                key={lv.level}
                className="flex items-center gap-4 py-3"
                style={{
                  borderBottom: i < levels.length - 1 ? '1px solid var(--border-dim)' : 'none',
                  background: isCurrent ? 'rgba(126,207,192,0.06)' : 'transparent',
                  borderRadius: 4, paddingLeft: 8, paddingRight: 8,
                }}
              >
                <div style={{ width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SeaAnimalIllustration
                    animal={lv.name}
                    size={WIDE_RANKS.includes(lv.name) ? 44 : 60}
                    color={unlocked ? 'var(--aqua)' : 'var(--text-3)'}
                    opacity={unlocked ? 0.95 : 0.3}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="label-xs mb-0.5">Level {lv.level}</div>
                  <div
                    className="font-serif font-medium"
                    style={{ fontSize: '1.05rem', color: unlocked ? 'var(--brass)' : 'var(--text-3)' }}
                  >
                    {lv.name}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {isCurrent ? (
                    <span className="label-xs" style={{ color: 'var(--aqua)' }}>CURRENT</span>
                  ) : unlocked ? (
                    <span className="label-xs" style={{ color: 'var(--text-3)' }}>UNLOCKED</span>
                  ) : (
                    <span className="label-xs" style={{ color: 'var(--text-3)' }}>
                      <span style={{ color: 'var(--brass)', fontFamily: 'DM Mono, monospace' }}>
                        {toGo.toLocaleString()}
                      </span>{' '}
                      🫧 to go
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
