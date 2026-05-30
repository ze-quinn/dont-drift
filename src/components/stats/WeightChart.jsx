export default function WeightChart({ weightLog }) {
  if (!weightLog || weightLog.length < 2) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
        <span className="label-xs">Log at least 2 weights to see a trend</span>
      </div>
    )
  }

  const recent = [...weightLog].reverse().slice(0, 30)
  const values = recent.map(w => w.weight)
  const min    = Math.min(...values) - 0.5
  const max    = Math.max(...values) + 0.5
  const range  = max - min || 1

  const W = 400, H = 80
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const polyline = pts.join(' ')
  const area     = `0,${H} ${polyline} ${W},${H}`

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--brass)" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="var(--brass)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#wGrad)"/>
        <polyline points={polyline} fill="none" stroke="var(--brass)" strokeWidth="1.5" strokeLinejoin="round"/>
        {values.map((v, i) => {
          const x = (i / (values.length - 1)) * W
          const y = H - ((v - min) / range) * H
          return (
            <circle key={i} cx={x} cy={y} r="3"
              fill="var(--brass)"
              opacity={i === values.length - 1 ? 1 : 0.35}
            />
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span className="label-xs">{recent[0]?.weight} kg</span>
        <span className="label-xs">{recent[recent.length - 1]?.weight} kg latest</span>
      </div>
    </div>
  )
}
