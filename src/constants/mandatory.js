// Catalog of loggable activities that can be made "mandatory" (penalised when
// skipped on a scheduled day), plus the default mandatory set.

// Which rule keys count as having DONE each activity that day.
export const ACTIVITY_DONE_KEYS = {
  run:      ['RUN_SHORT', 'RUN_MID', 'RUN_LONG'],
  tennis:   ['TENNIS_SHORT', 'TENNIS_MID', 'TENNIS_LONG'],
  swim:     ['SWIM_SHORT', 'SWIM_MID', 'SWIM_LONG'],
  strength: ['STRENGTH'],
  yoga:     ['YOGA'],
  shoulder: ['SHOULDER_DONE'],
}

// Display metadata for each catalog activity.
export const ACTIVITY_META = {
  run:      { label: 'Run',             icon: '🏃' },
  tennis:   { label: 'Tennis',          icon: '🎾' },
  swim:     { label: 'Swimming',        icon: '🏊' },
  strength: { label: 'Functional strength', icon: '🏋️' },
  yoga:     { label: 'Yoga / mobility', icon: '🧘' },
  shoulder: { label: 'Shoulder work',   icon: '💪' },
}

// Cardio/workout activities — any of these satisfies an "any workout" entry.
// (Shoulder is rehab, not interchangeable, so it's excluded.)
export const ALL_WORKOUT_KEYS = [
  ...ACTIVITY_DONE_KEYS.run,
  ...ACTIVITY_DONE_KEYS.tennis,
  ...ACTIVITY_DONE_KEYS.swim,
  ...ACTIVITY_DONE_KEYS.strength,
  ...ACTIVITY_DONE_KEYS.yoga,
]

// Activities that meaningfully support an "any workout counts" toggle.
export const SUBSTITUTABLE = new Set(['run', 'tennis', 'swim', 'strength', 'yoga'])

// Default mandatory set — matches the original hardcoded behaviour.
export const MANDATORY_DEFAULTS = [
  { id: 'run',      activityId: 'run',      label: 'Run',           icon: '🏃', scheduledDays: [1, 2, 3, 4, 5, 6], penalty: 20, missedKey: 'SKIPPED_RUN',     anyWorkout: false },
  { id: 'shoulder', activityId: 'shoulder', label: 'Shoulder work', icon: '💪', scheduledDays: [0, 1, 2, 3, 4, 5, 6], penalty: 20, missedKey: 'SHOULDER_MISSED', anyWorkout: false },
]

// Resolve the rule keys that count as DONE for a mandatory entry.
export function doneKeysFor(entry) {
  if (entry.anyWorkout) return ALL_WORKOUT_KEYS
  return ACTIVITY_DONE_KEYS[entry.activityId] ?? []
}
