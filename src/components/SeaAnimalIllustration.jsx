/**
 * Sea animal illustrations — two styles share one API.
 *
 *   variant="halftone"  (default) — soft stippled dot-work silhouettes,
 *                                    poses traced from reference photos.
 *   variant="lineart"             — the original geometric Bauhaus line work,
 *                                    retained so we can switch back any time.
 *
 * Both render in the aqua accent colour at a configurable size / opacity.
 */

/* ══════════════════════════════════════════════════════════════════
   1.  LINE-ART STYLE  (original — kept for fallback)
   ══════════════════════════════════════════════════════════════════ */

function Seahorse({ color, size }) {
  return (
    <svg viewBox="0 0 120 200" width={size} height={size * 1.67} fill="none">
      {/* Crown spines */}
      <line x1="60" y1="18" x2="50" y2="2"  stroke={color} strokeWidth="3" strokeLinecap="square"/>
      <line x1="60" y1="18" x2="60" y2="0"  stroke={color} strokeWidth="3" strokeLinecap="square"/>
      <line x1="60" y1="18" x2="70" y2="2"  stroke={color} strokeWidth="3" strokeLinecap="square"/>
      <line x1="60" y1="18" x2="78" y2="8"  stroke={color} strokeWidth="2" strokeLinecap="square"/>
      <line x1="60" y1="18" x2="44" y2="8"  stroke={color} strokeWidth="2" strokeLinecap="square"/>
      {/* Head — elongated hexagon */}
      <polygon points="42,18 78,18 86,34 78,50 42,50 34,34" stroke={color} strokeWidth="2.5" fill="none"/>
      {/* Eye */}
      <circle cx="72" cy="34" r="5" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="72" cy="34" r="2" fill={color}/>
      {/* Snout */}
      <polygon points="78,28 110,30 110,38 78,42" stroke={color} strokeWidth="2" fill="none"/>
      {/* Body segments — stacked trapezoids */}
      <polygon points="38,52 82,52 86,68 34,68" stroke={color} strokeWidth="2" fill="none"/>
      <polygon points="36,70 84,70 80,86 40,86" stroke={color} strokeWidth="2" fill="none"/>
      <polygon points="40,88 80,88 74,104 46,104" stroke={color} strokeWidth="2" fill="none"/>
      <polygon points="46,106 74,106 68,120 52,120" stroke={color} strokeWidth="2" fill="none"/>
      <polygon points="52,122 68,122 62,136 58,136" stroke={color} strokeWidth="2" fill="none"/>
      {/* Dorsal fin */}
      <path d="M82,54 Q110,60 108,76 Q106,88 86,86" stroke={color} strokeWidth="2" fill="none"/>
      {/* Curled tail */}
      <path d="M58,138 Q46,150 50,164 Q54,176 68,176 Q82,176 86,164 Q90,152 80,148" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Tail curl end */}
      <circle cx="76" cy="152" r="6" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  )
}

function Pufferfish({ color, size }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none">
      {/* Spines — radiating lines */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16
        const rad = (angle - 90) * Math.PI / 180
        const x1 = 100 + 72 * Math.cos(rad)
        const y1 = 100 + 72 * Math.sin(rad)
        const x2 = 100 + 96 * Math.cos(rad)
        const y2 = 100 + 96 * Math.sin(rad)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={i % 2 === 0 ? 3 : 1.5} strokeLinecap="square"/>
      })}
      {/* Body circle */}
      <circle cx="100" cy="100" r="68" stroke={color} strokeWidth="3" fill="none"/>
      {/* Inner circle */}
      <circle cx="100" cy="100" r="48" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="4 4"/>
      {/* Eye rings */}
      <circle cx="120" cy="88" r="14" stroke={color} strokeWidth="2.5" fill="none"/>
      <circle cx="120" cy="88" r="6"  stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="122" cy="86" r="2"  fill={color}/>
      {/* Mouth — geometric arc */}
      <path d="M94,118 Q100,126 112,118" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="square"/>
      {/* Tail */}
      <polygon points="28,90 2,78 2,122 28,110" stroke={color} strokeWidth="2.5" fill="none"/>
      {/* Pectoral fins — small triangles */}
      <polygon points="88,148 76,168 104,162" stroke={color} strokeWidth="2" fill="none"/>
      <polygon points="88,52 76,32 104,38" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  )
}

function Barracuda({ color, size }) {
  return (
    <svg viewBox="0 0 300 120" width={size * 2.5} height={size} fill="none">
      {/* Main body — long torpedo */}
      <polygon points="280,60 240,30 60,38 20,60 60,82 240,90" stroke={color} strokeWidth="3" fill="none"/>
      {/* Jaw line — lower */}
      <path d="M240,90 Q260,90 280,60" stroke={color} strokeWidth="2" fill="none"/>
      {/* Lateral line */}
      <line x1="60" y1="60" x2="240" y2="60" stroke={color} strokeWidth="1.5" strokeDasharray="8 4"/>
      {/* Dorsal fin 1 — tall triangle */}
      <polygon points="160,38 140,8 120,38" stroke={color} strokeWidth="2.5" fill="none"/>
      {/* Dorsal fin 2 — smaller */}
      <polygon points="200,42 188,22 176,42" stroke={color} strokeWidth="2" fill="none"/>
      {/* Caudal fin — forked */}
      <polygon points="20,60 2,38 38,52" stroke={color} strokeWidth="2.5" fill="none"/>
      <polygon points="20,60 2,82 38,68" stroke={color} strokeWidth="2.5" fill="none"/>
      {/* Pectoral fin */}
      <polygon points="200,60 220,82 240,62" stroke={color} strokeWidth="2" fill="none"/>
      {/* Anal fin */}
      <polygon points="140,82 128,102 116,82" stroke={color} strokeWidth="2" fill="none"/>
      {/* Eye */}
      <circle cx="250" cy="52" r="8" stroke={color} strokeWidth="2.5" fill="none"/>
      <circle cx="252" cy="50" r="3" fill={color}/>
      {/* Teeth marks on jaw */}
      <line x1="256" y1="66" x2="260" y2="72" stroke={color} strokeWidth="2"/>
      <line x1="264" y1="64" x2="268" y2="70" stroke={color} strokeWidth="2"/>
      <line x1="272" y1="62" x2="275" y2="68" stroke={color} strokeWidth="2"/>
    </svg>
  )
}

function Octopus({ color, size }) {
  return (
    <svg viewBox="0 0 200 240" width={size * 0.83} height={size} fill="none">
      {/* Head dome */}
      <path d="M40,90 Q40,20 100,20 Q160,20 160,90 L160,110 Q100,130 40,110 Z" stroke={color} strokeWidth="3" fill="none"/>
      {/* Eye left */}
      <circle cx="72" cy="68" r="12" stroke={color} strokeWidth="2.5" fill="none"/>
      <circle cx="72" cy="68" r="5"  stroke={color} strokeWidth="2" fill="none"/>
      {/* Eye right */}
      <circle cx="128" cy="68" r="12" stroke={color} strokeWidth="2.5" fill="none"/>
      <circle cx="128" cy="68" r="5"  stroke={color} strokeWidth="2" fill="none"/>
      {/* Mantle ridge lines */}
      <line x1="100" y1="20" x2="100" y2="90" stroke={color} strokeWidth="1" strokeDasharray="5 4"/>
      {/* 8 tentacles — sinuous geometric paths */}
      <path d="M55,112 Q30,140 20,170 Q14,190 28,200 Q42,208 46,188 Q50,170 60,150" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M68,118 Q52,148 48,180 Q44,204 58,210 Q72,214 72,192 Q72,172 78,152" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M82,122 Q74,154 72,186 Q70,210 84,214 Q98,216 96,194 Q94,174 96,154" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M96,124 Q96,158 96,192 Q96,216 110,214 Q124,210 120,188 Q116,168 116,148" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M110,122 Q118,154 118,186 Q118,210 132,210 Q146,208 142,186 Q138,166 132,148" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M124,118 Q136,148 140,180 Q144,204 158,200 Q170,192 162,172 Q154,152 144,134" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M136,112 Q156,140 164,170 Q172,192 158,200" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M148,106 Q172,130 178,160 Q182,184 170,194" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Sucker dots on a couple arms */}
      {[140,152,164].map((y,i) => <circle key={i} cx={60 + i*2} cy={y} r="2.5" fill={color}/>)}
      {[142,154,166].map((y,i) => <circle key={i} cx={130 + i*2} cy={y} r="2.5" fill={color}/>)}
    </svg>
  )
}

function MantaRay({ color, size }) {
  return (
    <svg viewBox="0 0 300 160" width={size * 1.875} height={size} fill="none">
      {/* Main wing shape */}
      <path d="M150,80 Q200,20 298,40 Q260,80 298,120 Q200,140 150,80 Z" stroke={color} strokeWidth="3" fill="none"/>
      <path d="M150,80 Q100,20 2,40 Q40,80 2,120 Q100,140 150,80 Z"   stroke={color} strokeWidth="3" fill="none"/>
      {/* Body centre stripe */}
      <ellipse cx="150" cy="80" rx="22" ry="36" stroke={color} strokeWidth="2.5" fill="none"/>
      {/* Ventral patches */}
      <ellipse cx="150" cy="80" rx="10" ry="18" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="3 3"/>
      {/* Cephalic fins — horns */}
      <path d="M136,62 Q120,42 104,30 Q114,50 122,66" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M164,62 Q180,42 196,30 Q186,50 178,66" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Tail */}
      <path d="M150,116 Q148,144 152,172 Q154,182 158,178" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Tail spine */}
      <line x1="150" y1="148" x2="144" y2="158" stroke={color} strokeWidth="1.5"/>
      {/* Eye */}
      <circle cx="138" cy="74" r="5" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="140" cy="72" r="2" fill={color}/>
      {/* Wing vein lines */}
      <path d="M150,70 Q210,55 280,50" stroke={color} strokeWidth="1"   strokeDasharray="6 4"/>
      <path d="M150,90 Q210,105 280,110" stroke={color} strokeWidth="1" strokeDasharray="6 4"/>
      <path d="M150,70 Q90,55 20,50"    stroke={color} strokeWidth="1"  strokeDasharray="6 4"/>
      <path d="M150,90 Q90,105 20,110"  stroke={color} strokeWidth="1"  strokeDasharray="6 4"/>
    </svg>
  )
}

function Orca({ color, size }) {
  return (
    <svg viewBox="0 0 300 180" width={size * 1.67} height={size} fill="none">
      {/* Body — large torpedo */}
      <path d="M260,90 Q280,70 294,90 Q280,110 260,90" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M260,90 Q240,40 120,30 Q40,28 10,70 Q4,80 10,90 Q4,100 10,110 Q40,152 120,150 Q240,140 260,90 Z" stroke={color} strokeWidth="3" fill="none"/>
      {/* White saddle patch */}
      <path d="M180,40 Q220,36 240,56 Q250,70 244,84 Q236,98 218,96 Q196,94 182,74 Q172,56 180,40 Z" stroke={color} strokeWidth="2" fill="none" strokeDasharray="4 3"/>
      {/* White eye patch */}
      <ellipse cx="240" cy="70" rx="14" ry="10" stroke={color} strokeWidth="2" fill="none" strokeDasharray="4 3"/>
      {/* Eye */}
      <circle cx="244" cy="68" r="4" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="245" cy="67" r="1.5" fill={color}/>
      {/* Dorsal fin — tall blade */}
      <polygon points="180,34 156,2 148,34" stroke={color} strokeWidth="3" fill="none"/>
      {/* Pectoral fin — paddle */}
      <path d="M200,104 Q220,136 200,152 Q180,160 172,144 Q164,126 180,106 Z" stroke={color} strokeWidth="2.5" fill="none"/>
      {/* Caudal flukes */}
      <path d="M10,70 Q-10,48 4,36" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M10,110 Q-10,132 4,144" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <line x1="10" y1="70" x2="10" y2="110" stroke={color} strokeWidth="2.5"/>
      {/* Lateral line */}
      <path d="M240,90 Q180,88 120,86 Q80,85 40,88" stroke={color} strokeWidth="1" strokeDasharray="6 4"/>
      {/* Mouth */}
      <path d="M258,86 Q270,90 258,94" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  )
}

function BlueWhale({ color, size }) {
  return (
    <svg viewBox="0 0 360 160" width={size * 2.25} height={size} fill="none">
      {/* Body — massive elongated teardrop */}
      <path d="M320,80 Q344,60 358,80 Q344,100 320,80" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M320,80 Q300,30 180,16 Q80,6 20,52 Q4,64 4,80 Q4,96 20,108 Q80,154 180,144 Q300,130 320,80 Z" stroke={color} strokeWidth="3.5" fill="none"/>
      {/* Ventral pleats — parallel lines */}
      {[0,1,2,3,4,5].map(i => (
        <line key={i}
          x1={60 + i*22} y1={108 + (i % 2) * 4}
          x2={60 + i*22} y2={148 - (i % 2) * 4}
          stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      {/* Eye */}
      <circle cx="300" cy="68" r="7" stroke={color} strokeWidth="2.5" fill="none"/>
      <circle cx="302" cy="66" r="2.5" fill={color}/>
      {/* Blowhole */}
      <ellipse cx="280" cy="20" rx="8" ry="5" stroke={color} strokeWidth="2" fill="none"/>
      {/* Blow spout */}
      <path d="M278,16 Q272,4 276,0 M280,15 Q280,2 282,0 M282,16 Q288,4 284,0" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Dorsal fin — small hump */}
      <path d="M200,22 Q192,6 180,18" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Pectoral fin */}
      <path d="M240,116 Q260,148 236,160 Q212,166 208,144 Q204,122 224,112 Z" stroke={color} strokeWidth="2.5" fill="none"/>
      {/* Rostrum ridges */}
      <path d="M316,76 Q340,74 354,80" stroke={color} strokeWidth="1.5" strokeDasharray="4 3"/>
      <path d="M316,84 Q340,86 354,80" stroke={color} strokeWidth="1.5" strokeDasharray="4 3"/>
      {/* Caudal flukes — massive */}
      <path d="M4,52 Q-16,30 0,18" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M4,108 Q-16,130 0,142" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <line x1="4" y1="52" x2="4" y2="108" stroke={color} strokeWidth="3"/>
      {/* Lateral line */}
      <path d="M300,80 Q220,76 140,78 Q80,79 40,82" stroke={color} strokeWidth="1" strokeDasharray="8 5"/>
    </svg>
  )
}

const LINEART_COMPONENTS = {
  Seahorse:   Seahorse,
  Pufferfish: Pufferfish,
  Barracuda:  Barracuda,
  Octopus:    Octopus,
  'Manta Ray':MantaRay,
  Orca:       Orca,
  'Blue Whale':BlueWhale,
}

/* ══════════════════════════════════════════════════════════════════
   2.  HALFTONE STYLE  (default — dot-work silhouettes)
   Polygon silhouettes + Delaunay-free hex-grid stipple.  Dots are
   generated once at module load and stored as markup strings.
   ══════════════════════════════════════════════════════════════════ */

function pip(px, py, poly) {
  let i, j, c = false
  for (i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c = !c
  }
  return c
}
function insideAny(x, y, ps) { for (let i = 0; i < ps.length; i++) if (pip(x, y, ps[i])) return true; return false }
function bboxM(ps) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
  for (let k = 0; k < ps.length; k++) { const p = ps[k]; for (let i = 0; i < p.length; i++) { if (p[i][0] < x0) x0 = p[i][0]; if (p[i][0] > x1) x1 = p[i][0]; if (p[i][1] < y0) y0 = p[i][1]; if (p[i][1] > y1) y1 = p[i][1] } }
  return { x0, y0, x1, y1 }
}
function mirror(h, W) { const o = h.slice(); for (let i = h.length - 2; i >= 1; i--) o.push([W - h[i][0], h[i][1]]); return o }
const DIRS = [[1,0],[0.7,0.7],[0,1],[-0.7,0.7],[-1,0],[-0.7,-0.7],[0,-1],[0.7,-0.7]]
function halftone(ps, g, mR) {
  const bb = bboxM(ps), H = bb.y1 - bb.y0; let s = '', row = 0
  for (let y = bb.y0 + g * 0.4; y < bb.y1 + g; y += g * 0.87) {
    const off = (row % 2) * g * 0.5; row++
    for (let x = bb.x0 - g + off; x < bb.x1 + g; x += g) {
      if (!insideAny(x, y, ps)) continue
      let n = 0; for (let d = 0; d < 8; d++) { if (insideAny(x + DIRS[d][0] * g, y + DIRS[d][1] * g, ps)) n++ }
      const e = Math.pow(n / 8, 0.6), fy = (y - bb.y0) / H, t = 0.32 + 0.68 * fy, r = mR * t * e
      if (r < 0.4) continue
      s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(2) + '" fill="currentColor"/>'
    }
  }
  return s
}
function smooth(pts, k) {
  const n = pts.length, o = []
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t
      o.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ])
    }
  }
  return o
}
function spiral(cx, cy, a0, a1, r0, r1, w0, w1) {
  const N = 44, L = [], R = []
  for (let i = 0; i <= N; i++) {
    const t = i / N, ang = (a0 + (a1 - a0) * t) * Math.PI / 180, r = r0 + (r1 - r0) * t, x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang)
    const da = (a1 - a0) * Math.PI / 180 / N, dx = Math.cos(ang) * (r1 - r0) / N - r * Math.sin(ang) * da, dy = Math.sin(ang) * (r1 - r0) / N + r * Math.cos(ang) * da
    const ln = Math.hypot(dx, dy) || 1, nx = -dy / ln, ny = dx / ln, hw = (w0 + (w1 - w0) * t) / 2 + 1.1
    L.push([x + nx * hw, y + ny * hw]); R.push([x - nx * hw, y - ny * hw])
  }
  return L.concat(R.reverse())
}
function ribbon(p0, pc, p1, w0, mw) {
  mw = mw || 1.4; const N = 20, L = [], Rr = []
  for (let i = 0; i <= N; i++) {
    const t = i / N, mt = 1 - t, x = mt * mt * p0[0] + 2 * mt * t * pc[0] + t * t * p1[0], y = mt * mt * p0[1] + 2 * mt * t * pc[1] + t * t * p1[1]
    const dx = 2 * mt * (pc[0] - p0[0]) + 2 * t * (p1[0] - pc[0]), dy = 2 * mt * (pc[1] - p0[1]) + 2 * t * (p1[1] - pc[1])
    const ln = Math.hypot(dx, dy) || 1, nx = -dy / ln, ny = dx / ln, hw = w0 * (1 - t) / 2 + mw
    L.push([x + nx * hw, y + ny * hw]); Rr.push([x - nx * hw, y - ny * hw])
  }
  return L.concat(Rr.reverse())
}
function curl(tip, a0, sw, r0, w0) {
  const c = [tip[0] - r0 * Math.cos(a0 * Math.PI / 180), tip[1] - r0 * Math.sin(a0 * Math.PI / 180)]
  return spiral(c[0], c[1], a0, a0 + sw, r0, r0 * 0.32, w0, 1.6)
}
function offsetSpine(pts, wid) {
  const L = [], R = [], n = pts.length
  for (let i = 0; i < n; i++) {
    const p = pts[i]; let dx, dy
    if (i === 0) { dx = pts[1][0] - p[0]; dy = pts[1][1] - p[1] }
    else if (i === n - 1) { dx = p[0] - pts[i - 1][0]; dy = p[1] - pts[i - 1][1] }
    else { dx = pts[i + 1][0] - pts[i - 1][0]; dy = pts[i + 1][1] - pts[i - 1][1] }
    const ln = Math.hypot(dx, dy) || 1, nx = -dy / ln, ny = dx / ln, w = wid[i]
    L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w])
  }
  return L.concat(R.reverse())
}
function egg(cx, cy, rx, ry, tp) { const p = []; for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 2, ct = Math.cos(t), st = Math.sin(t); p.push([cx + rx * (1 - tp * st) * ct, cy + ry * st]) } return p }
function spikeBody(cx, cy, rx, ry, N, o, inn) {
  const p = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2 - Math.PI / 2; p.push([cx + rx * o * Math.cos(t), cy + ry * o * Math.sin(t)])
    const t2 = ((i + 0.5) / N) * Math.PI * 2 - Math.PI / 2; p.push([cx + rx * inn * Math.cos(t2), cy + ry * inn * Math.sin(t2)])
  }
  return p
}
function fit(ps, pad) {
  const nb = bboxM(ps), sx = pad - nb.x0, sy = pad - nb.y0
  const o = ps.map(poly => poly.map(p => [p[0] + sx, p[1] + sy]))
  return { polys: o, vbw: (nb.x1 - nb.x0) + pad * 2, vbh: (nb.y1 - nb.y0) + pad * 2 }
}
function rotateFit(ps, deg, pad) {
  const bb = bboxM(ps), cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2, th = deg * Math.PI / 180, co = Math.cos(th), si = Math.sin(th)
  const o = ps.map(poly => poly.map(p => { const dx = p[0] - cx, dy = p[1] - cy; return [cx + dx * co - dy * si, cy + dx * si + dy * co] }))
  return fit(o, pad)
}

/* ── Silhouettes (traced from reference photos) ────────────────── */
const _WH = [[[30,84],[26,72],[36,62],[58,56],[96,52],[150,49],[210,47],[268,48],[300,50],[312,40],[324,42],[326,52],[356,56],[388,62],[406,68],[434,46],[418,68],[436,92],[406,78],[374,86],[330,93],[288,97],[250,98],[238,120],[224,114],[232,98],[196,100],[140,101],[92,99],[58,95],[34,88]]]
const _MR = [mirror([[180,46],[190,46],[198,22],[208,26],[202,52],[224,58],[262,78],[300,116],[326,156],[300,176],[262,180],[226,176],[206,188],[196,210],[190,250],[186,300],[182,316],[180,316]], 360)]
const _BA = [[[12,70],[46,60],[96,52],[156,47],[220,45],[280,47],[330,52],[360,50],[378,42],[392,52],[410,56],[448,40],[434,66],[452,92],[416,72],[388,76],[360,80],[348,92],[338,88],[350,78],[300,84],[240,88],[180,90],[120,88],[70,84],[34,80]]]
const _PF = (() => { const p = [spikeBody(130,125,90,84,22,1.0,0.92)]; p.push([[214,120],[256,96],[244,124],[256,150]]); p.push([[150,206],[136,230],[170,224]]); p.push([[150,44],[136,22],[170,28]]); return p })()
const _OR = (() => {
  const b = offsetSpine([[143,30],[150,58],[164,92],[168,128],[160,166],[148,202],[140,234],[140,258]], [7,22,31,32,28,22,15,10])
  const d = [[150,58],[116,18],[107,30],[140,66]]
  const f = ribbon([150,150],[122,182],[104,212],15,2)
  const k = [[140,252],[168,258],[192,276],[182,288],[156,278],[150,294],[128,292],[122,274],[136,262]]
  return rotateFit([b, d, f, k], -38, 12)
})()
const _SH = (() => {
  const bp = [[98,54],[110,60],[126,76],[144,96],[166,116],[170,124],[166,130],[150,124],[136,114],[124,104],[114,100],[104,112],[112,132],[126,164],[138,196],[141,226],[134,256],[121,280],[113,291],[99,288],[98,256],[100,220],[101,184],[98,152],[91,126],[88,108],[86,90],[92,72]]
  return [smooth(bp,8), spiral(128,309,228.2,-275.8,25.5,5,14,1.4),
    [[90,62],[84,40],[98,58]],[[99,60],[96,34],[108,56]],[[107,58],[110,36],[115,58]],
    [[97,160],[86,158],[97,172]],[[99,192],[88,193],[99,206]],[[98,226],[87,228],[98,240]]]
})()
const _OC = (() => {
  const p = [egg(160,74,58,68,0.16)]
  const arms = [
    { b:[170,128], c:[176,180], t:[174,226], w:15, ca:95 },
    { b:[188,120], c:[201,172], t:[203,220], w:15, ca:80 },
    { b:[203,108], c:[226,158], t:[236,204], w:14, ca:62 },
    { b:[214,96],  c:[244,142], t:[254,188], w:13, ca:48 },
  ]
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < arms.length; i++) {
      const a = arms[i]
      const b = s ? [320 - a.b[0], a.b[1]] : a.b, c = s ? [320 - a.c[0], a.c[1]] : a.c, t = s ? [320 - a.t[0], a.t[1]] : a.t
      const ca = s ? 180 - a.ca : a.ca, cs = s ? -300 : 300
      p.push(ribbon(b, c, t, a.w, 2.2)); p.push(curl(t, ca, cs, 11, 8))
    }
  }
  return fit(p, 12)
})()

/* Per-animal stipple density (g = grid, r = max dot radius) and a size
   boost so wide / tall silhouettes carry equal visual weight. */
function build(polys, g, r, boost) {
  const ft = fit(polys, 8)
  const vbw = ft.vbw, vbh = ft.vbh
  let base = boost / Math.sqrt(vbw * vbh)
  let wf = vbw * base, hf = vbh * base
  const m = Math.max(wf, hf)
  if (m > 1.9) { const kk = 1.9 / m; wf *= kk; hf *= kk }
  return { vbw, vbh, wFactor: wf, hFactor: hf, dots: halftone(ft.polys, g, r) }
}
function buildFitted(ft, g, r, boost) {
  const vbw = ft.vbw, vbh = ft.vbh
  let base = boost / Math.sqrt(vbw * vbh)
  let wf = vbw * base, hf = vbh * base
  const m = Math.max(wf, hf)
  if (m > 1.9) { const kk = 1.9 / m; wf *= kk; hf *= kk }
  return { vbw, vbh, wFactor: wf, hFactor: hf, dots: halftone(ft.polys, g, r) }
}

// Recipes are thunks — dots are only generated for the animal actually
// rendered (first access), then memoised. Avoids ~5k point-in-polygon dot
// computations for all 7 animals at module load.
const HALFTONE_RECIPES = {
  Seahorse:    () => buildFitted(fit(_SH, 8), 4,   2.0, 1.28),
  Pufferfish:  () => build(_PF, 6,   2.9, 1.05),
  Barracuda:   () => build(_BA, 4.5, 2.2, 1.35),
  Octopus:     () => buildFitted(_OC, 5.5, 2.6, 1.0),
  'Manta Ray': () => build(_MR, 6,   3.0, 1.0),
  Orca:        () => buildFitted(_OR, 5,   2.5, 1.0),
  'Blue Whale':() => build(_WH, 6,   2.9, 1.35),
}
const _halftoneCache = {}
function getHalftone(animal) {
  if (!(animal in _halftoneCache)) {
    _halftoneCache[animal] = HALFTONE_RECIPES[animal] ? HALFTONE_RECIPES[animal]() : null
  }
  return _halftoneCache[animal]
}

/* ══════════════════════════════════════════════════════════════════
   3.  PUBLIC COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function SeaAnimalIllustration({
  animal,                 // e.g. "Orca"
  size = 120,             // base px size (geometric-mean dimension)
  opacity = 1,            // overall opacity (accepts a CSS var string too)
  color = 'currentColor', // accent colour
  className = '',
  style = {},
  variant = 'halftone',   // 'halftone' | 'lineart'
}) {
  if (variant === 'lineart') {
    const Component = LINEART_COMPONENTS[animal]
    if (!Component) return null
    return (
      <div className={className} style={{ opacity, display: 'inline-flex', ...style }}>
        <Component color={color} size={size} />
      </div>
    )
  }

  const cfg = getHalftone(animal)
  if (!cfg) return null
  const W = Math.round(size * cfg.wFactor)
  const H = Math.round(size * cfg.hFactor)
  return (
    <div className={className} style={{ opacity, display: 'inline-flex', color, ...style }}>
      <svg
        viewBox={`0 0 ${cfg.vbw} ${cfg.vbh}`}
        width={W}
        height={H}
        style={{ display: 'block' }}
        dangerouslySetInnerHTML={{ __html: cfg.dots }}
      />
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- intentional shared exports
export { LINEART_COMPONENTS, getHalftone }
export const ANIMAL_COMPONENTS = LINEART_COMPONENTS
