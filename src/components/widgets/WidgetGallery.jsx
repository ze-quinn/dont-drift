import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { useStore } from '../../store/useStore'
import { getLevelForBubbles, getProgressToNextLevel } from '../../constants/levels'
import { currentStreak, dailyTotalsMap } from '../../lib/stats'
import SeaAnimalIllustration from '../SeaAnimalIllustration'

// Fixed brand palette — widgets render in deep-water style regardless of the
// app's current theme, so an exported image always looks the same.
const C = {
  navy: '#0d1b2a', teal: '#103c47', panel: '#0a1622',
  brass: '#c9a84c', brassBright: '#e8c56a', aqua: '#7ecfc0',
  text: '#f5ede0', dim: '#5a6e82',
}

// ── Mini arc gauge geometry (matches the dashboard gauge) ──────────
const cx = 50, cy = 50, r = 38
const xy = (theta) => {
  const rad = (theta * Math.PI) / 180
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)]
}
const arc = (from, to) => {
  const [x1, y1] = xy(from)
  const [x2, y2] = xy(to)
  const large = Math.abs(to - from) > 180 ? 1 : 0
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

function weekNet(logs) {
  const totals = dailyTotalsMap(logs)
  const today = new Date()
  const dow = today.getDay()
  let net = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - dow + i)
    net += totals[d.toDateString()] ?? 0
  }
  return net
}

function ShareButton({ onClick, busy }) {
  return (
    <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.62rem' }} onClick={onClick} disabled={busy}>
      {busy ? 'Rendering…' : 'Save / share image'}
    </button>
  )
}

export default function WidgetGallery() {
  const bubbles = useStore(s => s.bubbles)
  const logs    = useStore(s => s.logs)
  const level   = getLevelForBubbles(bubbles)
  const { progress } = getProgressToNextLevel(bubbles)
  const streak  = currentStreak(logs)
  const net     = weekNet(logs)

  const frac = Math.min(1, Math.max(0, progress))
  const fillPath = frac > 0.005 ? arc(210, 210 + frac * 300) : null

  const gaugeRef = useRef(null)
  const portraitRef = useRef(null)
  const tideRef = useRef(null)
  const [busy, setBusy] = useState(null)

  async function exportCard(ref, name, key) {
    if (!ref.current) return
    setBusy(key)
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2.5, cacheBust: true })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `${name}.png`, { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Don't Drift" })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl; a.download = `${name}.png`; a.click()
      }
    } catch (_) { /* user cancelled share or render failed */ }
    setBusy(null)
  }

  const numFmt = `${bubbles < 0 ? '−' : ''}${Math.abs(bubbles).toLocaleString()}`

  return (
    <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
      <div className="label-xs" style={{ marginBottom: 4 }}>Your widgets</div>
      <div className="text-xs" style={{ color: 'var(--text-3)', marginBottom: 16 }}>
        Live snapshots of your progress — save one as an image to share or set as a wallpaper.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* A · Deep-water gauge */}
        <div>
          <div ref={gaugeRef} style={{
            width: 200, height: 200, margin: '0 auto', boxSizing: 'border-box',
            borderRadius: 28, padding: 16, position: 'relative', overflow: 'hidden',
            background: `linear-gradient(160deg, ${C.teal}33 0%, ${C.navy} 55%, ${C.panel} 100%)`,
            border: `1px solid ${C.brass}59`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'absolute', top: 14, left: 18, fontSize: 8, letterSpacing: '0.18em', color: C.aqua, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>DON'T DRIFT</div>
            <svg viewBox="0 0 100 100" width="150" height="150">
              <circle cx="50" cy="50" r="42" fill="none" stroke={C.dim} strokeWidth="2" strokeDasharray="0.7 7" opacity="0.4"/>
              <path d={arc(210, 510)} fill="none" stroke={`${C.brass}2e`} strokeWidth="3.5"/>
              {fillPath && <path d={fillPath} fill="none" stroke="url(#gwGrad)" strokeWidth="3.5" strokeLinecap="round"/>}
              <defs><linearGradient id="gwGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#8a6e2f"/><stop offset="100%" stopColor={C.brassBright}/></linearGradient></defs>
              <text x="50" y="49" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="15" fontWeight="700" fill={C.brassBright}>{numFmt}</text>
              <text x="50" y="61" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="5" letterSpacing="1.2" fill={C.aqua}>{level.name.toUpperCase()} · L{level.level}</text>
            </svg>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <ShareButton busy={busy === 'gauge'} onClick={() => exportCard(gaugeRef, 'dont-drift-gauge', 'gauge')} />
          </div>
        </div>

        {/* B · Framed portrait */}
        <div>
          <div ref={portraitRef} style={{
            width: 200, height: 200, margin: '0 auto', boxSizing: 'border-box',
            borderRadius: 28, padding: 5, position: 'relative', overflow: 'hidden',
            background: `radial-gradient(120% 120% at 70% 20%, ${C.teal}40, ${C.navy} 60%)`,
            border: `1px solid ${C.brass}59`,
          }}>
            <div style={{ height: '100%', boxSizing: 'border-box', border: `1px solid ${C.brass}40`, borderRadius: 22, padding: 16, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ position: 'absolute', right: -24, top: '50%', transform: 'translateY(-50%)', opacity: 0.22 }}>
                <SeaAnimalIllustration animal={level.name} size={120} color={C.aqua} opacity={1} />
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 4, height: 4, transform: 'rotate(45deg)', background: C.brass }} />
                  <div style={{ fontSize: 8, letterSpacing: '0.16em', color: C.brass, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>LEVEL {level.level}</div>
                </div>
                <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 24, color: C.aqua, marginTop: 2 }}>{level.name}</div>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 28, color: C.brass, fontWeight: 700, lineHeight: 1 }}>{numFmt}</div>
                <div style={{ fontSize: 8, letterSpacing: '0.16em', color: C.dim, marginTop: 3, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>BUBBLES</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <ShareButton busy={busy === 'portrait'} onClick={() => exportCard(portraitRef, 'dont-drift-portrait', 'portrait')} />
          </div>
        </div>

        {/* C · Wide tide hero */}
        <div>
          <div ref={tideRef} style={{
            width: '100%', maxWidth: 360, margin: '0 auto', boxSizing: 'border-box',
            borderRadius: 24, padding: 18, position: 'relative', overflow: 'hidden',
            background: `linear-gradient(180deg, ${C.navy}, ${C.panel})`,
            border: `1px solid ${C.brass}59`,
          }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }} viewBox="0 0 400 140" preserveAspectRatio="none">
              <defs><linearGradient id="thGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.aqua} stopOpacity="0.22"/><stop offset="100%" stopColor={C.aqua} stopOpacity="0"/></linearGradient></defs>
              <path d="M0,100 C60,70 120,118 180,80 C240,44 300,96 400,60 L400,140 L0,140 Z" fill="url(#thGrad)"/>
              <path d="M0,100 C60,70 120,118 180,80 C240,44 300,96 400,60" fill="none" stroke={C.aqua} strokeWidth="1.5"/>
            </svg>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 8, letterSpacing: '0.16em', color: C.aqua, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>DON'T DRIFT · THIS WEEK</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 30, color: C.brass, fontWeight: 700, lineHeight: 1.1 }}>{numFmt}</div>
                <div style={{ fontSize: 9, color: C.dim, fontFamily: 'DM Sans, sans-serif' }}>{level.name} · lvl {level.level} · {net >= 0 ? '+' : ''}{net} this week</div>
              </div>
              <div style={{ textAlign: 'center', paddingLeft: 12, borderLeft: `1px solid ${C.brass}33` }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, color: C.aqua, fontWeight: 700 }}>{streak}</div>
                <div style={{ fontSize: 7, letterSpacing: '0.12em', color: C.dim, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>DAY STREAK</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <ShareButton busy={busy === 'tide'} onClick={() => exportCard(tideRef, 'dont-drift-tide', 'tide')} />
          </div>
        </div>

      </div>
    </div>
  )
}
