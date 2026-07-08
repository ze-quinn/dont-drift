import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'

// Geometric kelp + seabed — Bauhaus line style matching the sea animals.
function Seabed() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 120"
      preserveAspectRatio="xMidYMax slice"
      style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 120, opacity: 0.45, pointerEvents: 'none' }}
    >
      {/* Left kelp cluster — aqua-dim */}
      <path d="M34,120 Q26,84 34,56 Q42,30 34,8"  stroke="var(--aqua-dim)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M34,56 Q48,50 54,36"               stroke="var(--aqua-dim)" strokeWidth="2"   fill="none" strokeLinecap="round"/>
      <path d="M34,86 Q20,80 16,66"               stroke="var(--aqua-dim)" strokeWidth="2"   fill="none" strokeLinecap="round"/>
      <path d="M60,120 Q52,90 60,62 Q68,38 62,18" stroke="var(--aqua-dim)" strokeWidth="2"   fill="none" strokeLinecap="round"/>
      {/* Right kelp cluster — aqua */}
      <path d="M322,120 Q314,82 322,52 Q330,28 324,6" stroke="var(--aqua)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M322,52 Q338,46 344,32"                stroke="var(--aqua)" strokeWidth="2"   fill="none" strokeLinecap="round"/>
      <path d="M322,86 Q306,80 302,68"                stroke="var(--aqua)" strokeWidth="2"   fill="none" strokeLinecap="round"/>
      <path d="M298,120 Q291,92 299,66"               stroke="var(--aqua)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Seabed rocks */}
      <polygon points="150,120 172,100 196,120" stroke="var(--text-3)" strokeWidth="1.5" fill="none"/>
      <polygon points="198,120 214,106 232,120" stroke="var(--text-3)" strokeWidth="1.5" fill="none"/>
      {/* Drifting bubbles */}
      <circle cx="120" cy="40" r="3"   stroke="var(--aqua)"  strokeWidth="1" fill="none"/>
      <circle cx="244" cy="28" r="4"   stroke="var(--brass)" strokeWidth="1" fill="none"/>
      <circle cx="182" cy="20" r="2.5" stroke="var(--aqua)"  strokeWidth="1" fill="none"/>
    </svg>
  )
}

// Shown on the dashboard when bubbles go negative — a gentle, on-brand prompt
// to start swimming back up rather than a punishment screen.
export default function RescueCard() {
  const bubbles  = useStore(s => s.bubbles)
  const navigate = useNavigate()
  if (bubbles >= 0) return null

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--bg-panel)',
        border: '1px solid rgba(91,156,196,0.3)',
        borderRadius: 2, marginBottom: 20,
        padding: '20px 22px 92px',
      }}
    >
      <Seabed />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div className="label-xs" style={{ color: 'var(--negative)', marginBottom: 6 }}>
          {bubbles.toLocaleString()} bubbles
        </div>
        <div className="font-serif font-light" style={{ fontSize: '1.4rem', color: 'var(--text-2)', marginBottom: 6 }}>
          You've drifted below the surface.
        </div>
        <div className="text-xs" style={{ color: 'var(--text-3)', lineHeight: 1.5, maxWidth: 300, margin: '0 auto 16px' }}>
          The ocean is deeper than it looks. Log one small thing and start swimming back up.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-ghost" style={{ padding: '9px 18px' }} onClick={() => navigate('/log')}>
            Log an activity
          </button>
          <button className="btn-ghost" style={{ padding: '9px 18px' }} onClick={() => navigate('/habits')}>
            Check habits
          </button>
        </div>
      </div>
    </div>
  )
}
