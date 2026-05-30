export const LEVELS = [
  { level: 1, name: 'Seahorse',   min: 0,     max: 199  },
  { level: 2, name: 'Pufferfish', min: 200,   max: 499  },
  { level: 3, name: 'Barracuda',  min: 500,   max: 999  },
  { level: 4, name: 'Octopus',    min: 1000,  max: 1799 },
  { level: 5, name: 'Manta Ray',  min: 1800,  max: 2999 },
  { level: 6, name: 'Orca',       min: 3000,  max: 4499 },
  { level: 7, name: 'Blue Whale', min: 4500,  max: Infinity },
]

export function getLevelForBubbles(bubbles) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (bubbles >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getProgressToNextLevel(bubbles) {
  const current = getLevelForBubbles(bubbles)
  if (current.level === 7) return { progress: 1, bubblesInLevel: bubbles - current.min, levelRange: 0 }
  const next = LEVELS[current.level]
  const bubblesInLevel = bubbles - current.min
  const levelRange = next.min - current.min
  return { progress: Math.max(0, bubblesInLevel / levelRange), bubblesInLevel, levelRange, next }
}
