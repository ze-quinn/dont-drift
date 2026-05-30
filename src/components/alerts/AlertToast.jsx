import { useEffect } from 'react'

export default function AlertToast({ alert, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 9000)
    return () => clearTimeout(timer)
  }, [alert, onDismiss])

  return (
    <div
      className="fixed bottom-6 right-6 max-w-sm animate-slide-in z-50"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 1,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top accent line */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, var(--brass), transparent)',
      }} />

      <div style={{ padding: '14px 16px' }}>
        <div className="flex items-start gap-3">
          <div style={{ fontSize: '1.5rem', lineHeight: 1, marginTop: 2, flexShrink: 0 }}>
            {alert.animal}
          </div>
          <p style={{
            flex: 1,
            fontSize: '0.875rem',
            lineHeight: 1.55,
            color: 'var(--text-1)',
            margin: 0,
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {alert.text}
          </p>
          <button
            onClick={onDismiss}
            style={{
              flexShrink: 0, marginTop: 2,
              width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)',
              transition: 'color 0.15s',
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

        {/* Auto-dismiss bar */}
        <div style={{ marginTop: 12, height: 1, background: 'var(--border-dim)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'var(--brass)',
            opacity: 0.5,
            animation: 'shrink 9s linear forwards',
            width: '100%',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  )
}
