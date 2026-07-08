// feedback.js — Sound + haptic micro-interactions for Don't Drift
// Sounds are generated via Web Audio API (no audio files needed).
// Haptics use navigator.vibrate() — works on Android, silently ignored on iOS.

let ctx = null
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// iOS/Safari suspend the AudioContext until a user gesture. Create + resume it
// on the first real interaction so the very first sound (e.g. app-open pops)
// isn't silently dropped.
if (typeof window !== 'undefined') {
  const unlock = () => {
    try { getCtx() } catch (_) {}
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('touchend', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('touchend', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
}

// Respect the user's reduced-motion preference — skip synthesized audio.
function motionOK() {
  try {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch (_) { return true }
}

// Settings toggles — read from the persisted store snapshot (localStorage)
// instead of importing the store, which would create an import cycle.
function readSetting(key, fallback = true) {
  try {
    const raw = JSON.parse(localStorage.getItem('dont-drift-store'))
    return raw?.state?.settings?.[key] ?? fallback
  } catch (_) { return fallback }
}
function soundOK()  { return motionOK() && readSetting('soundEnabled') }
function hapticOK() { return readSetting('hapticsEnabled') }

// ── Core synth helpers ────────────────────────────────────────────────────────

function playTone({ freq = 440, type = 'sine', gain = 0.18, duration = 0.12, attack = 0.005 } = {}) {
  if (!soundOK()) return
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const amp = c.createGain()
    osc.connect(amp)
    amp.connect(c.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)
    amp.gain.setValueAtTime(0, c.currentTime)
    amp.gain.linearRampToValueAtTime(gain, c.currentTime + attack)
    amp.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration + 0.01)
  } catch (_) { /* AudioContext not available */ }
}

function playChord(notes, { type = 'sine', gain = 0.14, duration = 0.18, stagger = 0.06 } = {}) {
  notes.forEach((freq, i) => {
    setTimeout(() => playTone({ freq, type, gain, duration }), i * stagger * 1000)
  })
}

// ── Core synth helpers ────────────────────────────────────────────────────────

// Single bubble pop — tiny pitched blip, freq determines pitch
export function soundBubblePop(freq = 600, gain = 0.09) {
  if (!soundOK()) return
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const amp = c.createGain()
    osc.connect(amp); amp.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.6, c.currentTime + 0.03)
    amp.gain.setValueAtTime(gain, c.currentTime)
    amp.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.08)
    osc.start(c.currentTime); osc.stop(c.currentTime + 0.09)
  } catch (_) {}
}

// Play staggered pops for an array of bubble configs [{delay, r}]
// r (radius) maps to pitch — bigger bubble = lower pop
export function soundBubbles(bubbleConfigs) {
  bubbleConfigs.forEach(({ delay, r }) => {
    const freq = 900 - (r ?? 4) * 28   // bigger radius → lower freq
    setTimeout(() => soundBubblePop(Math.max(400, freq)), delay)
  })
}

// ── Named sounds ──────────────────────────────────────────────────────────────

// Bubble gained — ascending two-note chime, warm and soft
export function soundGain() {
  playChord([523.25, 783.99], { type: 'sine', gain: 0.16, duration: 0.22, stagger: 0.07 })
}

// Penalty / bubble lost — short descending tone
export function soundLoss() {
  if (!soundOK()) return
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const amp = c.createGain()
    osc.connect(amp); amp.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(330, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.18)
    amp.gain.setValueAtTime(0.14, c.currentTime)
    amp.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2)
    osc.start(c.currentTime); osc.stop(c.currentTime + 0.22)
  } catch (_) {}
}

// Habit checked — satisfying soft tick
export function soundTick() {
  playTone({ freq: 880, type: 'sine', gain: 0.12, duration: 0.08, attack: 0.002, decay: 0.06 })
}

// Sleep logged — gentle two-note lullaby interval (major third)
export function soundSleep() {
  playChord([392, 493.88], { type: 'sine', gain: 0.13, duration: 0.28, stagger: 0.09 })
}

// Stepper tap — barely-there click
export function soundStep() {
  playTone({ freq: 660, type: 'sine', gain: 0.07, duration: 0.04, attack: 0.001 })
}

// Save / confirm — soft single note
export function soundSave() {
  playTone({ freq: 659.25, type: 'sine', gain: 0.13, duration: 0.15, attack: 0.004 })
}

// ── Haptics ───────────────────────────────────────────────────────────────────

function vibrate(pattern) {
  if (!hapticOK()) return
  try { navigator.vibrate?.(pattern) } catch (_) {}
}

export function hapticLight()   { vibrate(10) }
export function hapticMedium()  { vibrate(20) }
export function hapticSuccess() { vibrate([10, 40, 20]) }
export function hapticError()   { vibrate([30, 20, 30]) }
export function hapticStep()    { vibrate(6) }

// ── Convenience combos ────────────────────────────────────────────────────────

export function feedbackGain()    { soundGain();  hapticSuccess() }
export function feedbackLoss()    { soundLoss();  hapticMedium() }
export function feedbackHabit()   { soundTick();  hapticLight() }
export function feedbackSleep()   { soundSleep(); hapticSuccess() }
export function feedbackStep()    { soundStep();  hapticStep() }
export function feedbackSave()    { soundSave();  hapticLight() }
