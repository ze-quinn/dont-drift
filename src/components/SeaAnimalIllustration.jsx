/**
 * Geometric Bauhaus-style sea animal illustrations.
 * Each animal is a bold constructivist silhouette — reduced to
 * pure geometry in the Cassandre / Herbert Bayer tradition.
 * Rendered in the aqua accent colour at configurable opacity.
 */

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

/* ── Public API ─────────────────────────────────────────────── */

const ANIMAL_COMPONENTS = {
  Seahorse:   Seahorse,
  Pufferfish: Pufferfish,
  Barracuda:  Barracuda,
  Octopus:    Octopus,
  'Manta Ray':MantaRay,
  Orca:       Orca,
  'Blue Whale':BlueWhale,
}

export default function SeaAnimalIllustration({
  animal,        // e.g. "Orca"
  size = 120,    // base height in px
  opacity = 1,   // overall opacity
  color = 'currentColor',
  className = '',
  style = {},
}) {
  const Component = ANIMAL_COMPONENTS[animal]
  if (!Component) return null
  return (
    <div className={className} style={{ opacity, display: 'inline-flex', ...style }}>
      <Component color={color} size={size}/>
    </div>
  )
}

export { ANIMAL_COMPONENTS }
