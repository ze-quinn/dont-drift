// Tiny line-art bubble glyph — replaces the 🫧 emoji so the mark renders
// identically on every platform and matches the engraved-brass aesthetic.
// Same double-circle motif as the app logo.
export default function BubbleGlyph({ size = 11, color = 'currentColor', style = {} }) {
  return (
    <svg
      viewBox="0 0 14 14"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: '-0.08em', ...style }}
    >
      <circle cx="5.5" cy="8" r="4.6" stroke={color} strokeWidth="1.3" />
      <circle cx="10.4" cy="4" r="2.4" stroke={color} strokeWidth="1.1" />
    </svg>
  )
}
