export const BUBBLE_RULES = {
  // Positive
  RUN_SHORT:          { label: 'Run (< 20 min)',       delta: +20, category: 'activity' },
  RUN_MID:            { label: 'Run (20–40 min)',      delta: +40, category: 'activity' },
  RUN_LONG:           { label: 'Run (40+ min)',        delta: +60, category: 'activity' },
  RUN_SATURDAY_BONUS: { label: 'Saturday run bonus',  delta: +20, category: 'bonus'    },
  TENNIS_SHORT:       { label: 'Tennis (< 45 min)',   delta: +40, category: 'activity' },
  TENNIS_MID:         { label: 'Tennis (45–75 min)',  delta: +60, category: 'activity' },
  TENNIS_LONG:        { label: 'Tennis (75+ min)',    delta: +80, category: 'activity' },
  SWIM_SHORT:         { label: 'Swim (< 20 min)',     delta: +20, category: 'activity' },
  SWIM_MID:           { label: 'Swim (20–40 min)',    delta: +35, category: 'activity' },
  SWIM_LONG:          { label: 'Swim (40+ min)',      delta: +50, category: 'activity' },
  STRENGTH:           { label: 'Functional strength', delta: +30, category: 'activity' },
  SHOULDER_DONE:      { label: 'Shoulder strengthening', delta: +20, category: 'habit' },
  YOGA:               { label: 'Yoga / mobility',    delta: +20, category: 'activity' },
  PROTEIN_POWDER:     { label: 'Had vegan protein',  delta: +10, category: 'habit'    },
  SLEEP_7:            { label: 'Slept 7+ hrs',       delta: +20, category: 'habit'    },
  FINISHED_BOOK:      { label: 'Finished a book',    delta: +100,category: 'milestone' },

  // Negative
  SHOULDER_MISSED:    { label: 'Missed shoulder work', delta: -20, category: 'penalty' },
  SKIPPED_RUN:        { label: 'Skipped run',          delta: -20, category: 'penalty' },
  WOKE_LATE:          { label: 'Woke up late',         delta: -10, category: 'penalty' },
  ALCOHOL_WEEKDAY:    { label: 'Drank alcohol (weekday)', delta: -20, category: 'penalty' },
  CHEAT_MEAL_WEEKDAY: { label: 'Cheat meal (weekday)', delta: -20, category: 'penalty' },
  JUNK_WEEKDAY:       { label: 'Ate junk (weekday)',   delta: -10, category: 'penalty' },
}

export function getRunRule(durationMinutes) {
  if (durationMinutes < 20) return 'RUN_SHORT'
  if (durationMinutes < 40) return 'RUN_MID'
  return 'RUN_LONG'
}

export function getTennisRule(durationMinutes) {
  if (durationMinutes < 45) return 'TENNIS_SHORT'
  if (durationMinutes < 75) return 'TENNIS_MID'
  return 'TENNIS_LONG'
}

export function getSwimRule(durationMinutes) {
  if (durationMinutes < 20) return 'SWIM_SHORT'
  if (durationMinutes < 40) return 'SWIM_MID'
  return 'SWIM_LONG'
}

export const CHEAT_ALLOWANCES = {
  burgers: 2,
  otherTreats: 1,
  boozeDays: 6,
}
