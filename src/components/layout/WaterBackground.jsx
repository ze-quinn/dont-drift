/**
 * Ambient water background — a faint, slowly drifting caustic layer that sits
 * behind ALL app content (z-index 0, pointer-events none). Purely decorative:
 * it never touches the gauge, panels, or any interactive element. Uses the aqua
 * accent at very low opacity so it reads as light playing through water.
 *
 * Honours prefers-reduced-motion via CSS (.water-bg animation disabled).
 */
export default function WaterBackground() {
  return (
    <div className="water-bg" aria-hidden="true">
      <svg
        width="100%" height="100%"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.05 }}
      >
        <g className="layer-a" stroke="var(--aqua)" fill="none">
          <ellipse cx="240"  cy="160" rx="300" ry="90"  strokeWidth="1" />
          <ellipse cx="900"  cy="300" rx="380" ry="110" strokeWidth="0.8" />
          <ellipse cx="520"  cy="560" rx="340" ry="100" strokeWidth="1.1" />
          <ellipse cx="1050" cy="680" rx="260" ry="80"  strokeWidth="0.9" />
        </g>
        <g className="layer-b" stroke="var(--brass)" fill="none">
          <ellipse cx="640"  cy="120" rx="260" ry="70"  strokeWidth="0.6" />
          <ellipse cx="180"  cy="460" rx="300" ry="90"  strokeWidth="0.7" />
          <ellipse cx="980"  cy="520" rx="240" ry="70"  strokeWidth="0.6" />
        </g>
      </svg>
    </div>
  )
}
