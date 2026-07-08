// Odometer hook — animates from the previous value to the new value.
// Respects prefers-reduced-motion (jumps straight to the target).
import { useState, useEffect, useRef } from 'react'

export function useAnimatedNumber(value, duration = 700) {
  const [displayed, setDisplayed] = useState(value)
  const prevRef = useRef(value)
  const rafRef  = useRef(null)

  useEffect(() => {
    const from = prevRef.current
    const to   = value
    prevRef.current = value
    if (from === to) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- single jump-to-target, no cascade
      setDisplayed(to)
      return
    }
    const start = performance.now()
    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(from + (to - from) * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return displayed
}
