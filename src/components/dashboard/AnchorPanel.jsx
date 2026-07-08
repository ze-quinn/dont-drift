import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { feedbackLoss, feedbackGain } from '../../lib/feedback'

function daysSince(isoString) {
  const ms = Date.now() - new Date(isoString).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

// Floating bubble-cost particle on drop
function CostFloat({ onDone }) {
  return (
    <div
      onAnimationEnd={onDone}
      style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 200, pointerEvents: 'none',
        fontFamily: 'DM Mono, monospace', fontSize: '1.5rem', fontWeight: 700,
        color: 'var(--negative)',
        animation: 'anchorCostFloat 1.2s ease-out forwards',
      }}
    >
      −20
    </div>
  )
}

// Confirm dialog for drop
function DropConfirm({ onConfirm, onCancel }) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(5,12,20,0.75)' }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 91,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-dim)',
        borderRadius: 4,
        padding: '28px 24px',
        width: 'min(320px, calc(100vw - 48px))',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        animation: 'anchorModalIn 0.2s ease-out',
      }}>
        <div style={{ fontSize: 32, animation: 'anchorDropIn 0.4s ease-in 0.1s both' }}>⚓</div>
        <div className="font-serif font-light" style={{ fontSize: '1.4rem', color: 'var(--text-1)', textAlign: 'center' }}>
          Drop anchor?
        </div>
        <div style={{
          fontSize: '0.8rem', color: 'var(--text-3)',
          fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, textAlign: 'center',
        }}>
          Your streak and mandatory penalties pause while you're anchored. No bubbles lost for skipping activities.
        </div>
        <div style={{
          fontFamily: 'DM Mono, monospace', fontSize: '1.1rem', fontWeight: 700,
          color: 'var(--negative)',
        }}>
          − 20 bubbles
        </div>
        <div style={{
          fontSize: '0.72rem', color: 'var(--text-3)',
          fontFamily: 'DM Sans, sans-serif', textAlign: 'center',
        }}>
          One-time cost to anchor. Resume whenever you're ready.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: 'none',
              border: '1px solid var(--border-dim)',
              borderRadius: 2, cursor: 'pointer',
              fontFamily: 'DM Mono, monospace', fontSize: '0.7rem',
              color: 'var(--text-3)', letterSpacing: '0.06em',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.4)',
              borderRadius: 2, cursor: 'pointer',
              fontFamily: 'DM Mono, monospace', fontSize: '0.7rem',
              color: 'var(--brass)', letterSpacing: '0.06em',
            }}
          >
            Drop anchor
          </button>
        </div>
      </div>
    </>
  )
}

// Confirm dialog for resume
function ResumeConfirm({ onConfirm, onCancel }) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(5,12,20,0.75)' }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 91,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-dim)',
        borderRadius: 4,
        padding: '28px 24px',
        width: 'min(320px, calc(100vw - 48px))',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        animation: 'anchorModalIn 0.2s ease-out',
      }}>
        <div style={{ fontSize: 32 }}>🌊</div>
        <div className="font-serif font-light" style={{ fontSize: '1.4rem', color: 'var(--text-1)', textAlign: 'center' }}>
          Weigh anchor?
        </div>
        <div style={{
          fontSize: '0.8rem', color: 'var(--text-3)',
          fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, textAlign: 'center',
        }}>
          Mandatory penalties resume from today. Past anchored days won't be charged.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: 'none',
              border: '1px solid var(--border-dim)',
              borderRadius: 2, cursor: 'pointer',
              fontFamily: 'DM Mono, monospace', fontSize: '0.7rem',
              color: 'var(--text-3)', letterSpacing: '0.06em',
            }}
          >
            Stay anchored
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: 'rgba(126,207,192,0.1)',
              border: '1px solid rgba(126,207,192,0.4)',
              borderRadius: 2, cursor: 'pointer',
              fontFamily: 'DM Mono, monospace', fontSize: '0.7rem',
              color: 'var(--aqua)', letterSpacing: '0.06em',
            }}
          >
            Weigh anchor
          </button>
        </div>
      </div>
    </>
  )
}

export default function AnchorPanel() {
  const anchorState        = useStore(s => s.anchorState)
  const dropAnchor         = useStore(s => s.dropAnchor)
  const weighAnchor        = useStore(s => s.weighAnchor)
  const setAnchorNotifOptIn = useStore(s => s.setAnchorNotifOptIn)

  const [showDropConfirm,    setShowDropConfirm]    = useState(false)
  const [showResumeConfirm,  setShowResumeConfirm]  = useState(false)
  const [showCostFloat,      setShowCostFloat]      = useState(false)
  const [dropping,           setDropping]           = useState(false)
  const [rising,             setRising]             = useState(false)

  function handleDrop() {
    setShowDropConfirm(false)
    setDropping(true)
    dropAnchor()
    feedbackLoss()
    setShowCostFloat(true)
    setTimeout(() => setDropping(false), 600)
  }

  function handleWeigh() {
    setShowResumeConfirm(false)
    setRising(true)
    weighAnchor()
    feedbackGain()
    setTimeout(() => setRising(false), 600)
  }

  // Not anchored: show subtle button
  if (!anchorState) {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button
            onClick={() => setShowDropConfirm(true)}
            style={{
              background: 'none',
              border: '1px dashed rgba(126,207,192,0.18)',
              borderRadius: 2,
              padding: '5px 12px',
              display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer',
              transition: 'border-color 0.15s, opacity 0.15s',
              opacity: 0.6,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'rgba(126,207,192,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.borderColor = 'rgba(126,207,192,0.18)' }}
          >
            <span style={{ fontSize: 13 }}>⚓</span>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
              color: 'var(--text-3)', letterSpacing: '0.07em',
            }}>
              Drop anchor
            </span>
          </button>
        </div>

        {showDropConfirm && (
          <DropConfirm onConfirm={handleDrop} onCancel={() => setShowDropConfirm(false)} />
        )}
        {showCostFloat && <CostFloat onDone={() => setShowCostFloat(false)} />}
      </>
    )
  }

  // Anchored state
  const days = daysSince(anchorState.since)
  const notifOptIn = anchorState.notifOptIn

  return (
    <>
      {/* Anchored banner */}
      <div
        className={rising ? 'anchor-rising' : ''}
        style={{
          marginTop: 12,
          background: 'rgba(120,120,120,0.06)',
          border: '1px solid rgba(160,160,160,0.18)',
          borderRadius: 3,
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.72rem',
            color: 'rgba(160,160,160,0.7)', letterSpacing: '0.07em',
          }}>
            ⚓ Anchored{days > 0 ? ` · Day ${days}` : ''}
          </span>
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.62rem',
            color: 'rgba(140,140,140,0.4)',
          }}>
            Penalties paused
          </span>
        </div>

        <div style={{
          fontSize: '0.78rem', color: 'rgba(160,160,160,0.6)',
          fontFamily: 'DM Sans, sans-serif', lineHeight: 1.55,
        }}>
          Mandatory penalties are paused. Your streak is holding. Come back when you're ready.
        </div>

        <button
          onClick={() => setShowResumeConfirm(true)}
          style={{
            alignSelf: 'flex-start',
            background: 'rgba(126,207,192,0.08)',
            border: '1px solid rgba(126,207,192,0.28)',
            borderRadius: 2, padding: '6px 14px',
            fontFamily: 'DM Mono, monospace', fontSize: '0.68rem',
            color: 'var(--aqua)', letterSpacing: '0.06em',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(126,207,192,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(126,207,192,0.08)'}
        >
          Weigh anchor →
        </button>
      </div>

      {/* Notification opt-in — shown once after first anchor drop */}
      {notifOptIn === null && (
        <div style={{
          marginTop: 8,
          background: 'rgba(126,207,192,0.04)',
          border: '1px solid rgba(126,207,192,0.12)',
          borderRadius: 3,
          padding: '12px 14px',
        }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
            color: 'rgba(126,207,192,0.6)', letterSpacing: '0.06em', marginBottom: 5,
          }}>
            Send a nudge to resurface?
          </div>
          <div style={{
            fontSize: '0.75rem', color: 'var(--text-3)',
            fontFamily: 'DM Sans, sans-serif', lineHeight: 1.55, marginBottom: 10,
          }}>
            We can remind you in a few days that your anchor is still down — no pressure, just a signal.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setAnchorNotifOptIn(true)}
              style={{
                padding: '5px 14px',
                background: 'rgba(126,207,192,0.1)',
                border: '1px solid rgba(126,207,192,0.3)',
                borderRadius: 2, cursor: 'pointer',
                fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
                color: 'var(--aqua)', letterSpacing: '0.05em',
              }}
            >
              Yes, remind me
            </button>
            <button
              onClick={() => setAnchorNotifOptIn(false)}
              style={{
                padding: '5px 14px',
                background: 'none',
                border: '1px solid rgba(126,207,192,0.12)',
                borderRadius: 2, cursor: 'pointer',
                fontFamily: 'DM Mono, monospace', fontSize: '0.65rem',
                color: 'rgba(126,207,192,0.35)', letterSpacing: '0.05em',
              }}
            >
              No thanks
            </button>
          </div>
        </div>
      )}

      {showResumeConfirm && (
        <ResumeConfirm onConfirm={handleWeigh} onCancel={() => setShowResumeConfirm(false)} />
      )}
    </>
  )
}
