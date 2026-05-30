// Day indices: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
export const ACTIVITIES = {
  run: {
    id: 'run',
    label: 'Run',
    scheduledDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
    penaltyForSkip: true,
    optional: false,
    icon: '🏃',
  },
  tennis: {
    id: 'tennis',
    label: 'Tennis',
    scheduledDays: null, // flexible
    penaltyForSkip: false,
    optional: true,
    icon: '🎾',
  },
  swim: {
    id: 'swim',
    label: 'Swimming',
    scheduledDays: null,
    penaltyForSkip: false,
    optional: true,
    icon: '🏊',
  },
  shoulder: {
    id: 'shoulder',
    label: 'Shoulder strengthening',
    scheduledDays: [1, 2, 3, 4, 5, 6, 0], // every day
    penaltyForSkip: true,
    optional: false,
    icon: '💪',
    targetHour: 19, // 7pm default, configurable
  },
  strength: {
    id: 'strength',
    label: 'Functional strength',
    scheduledDays: null,
    penaltyForSkip: false,
    optional: true,
    icon: '🏋️',
  },
  yoga: {
    id: 'yoga',
    label: 'Yoga / mobility',
    scheduledDays: null,
    penaltyForSkip: false,
    optional: true,
    icon: '🧘',
  },
}

export const HABITS = {
  sleep7: {
    id: 'sleep7',
    label: 'Slept 7+ hours',
    icon: '😴',
    positive: true,
  },
  wakeOnTime: {
    id: 'wakeOnTime',
    label: 'Woke up on time',
    icon: '⏰',
    positive: true,
  },
  proteinPowder: {
    id: 'proteinPowder',
    label: 'Vegan protein powder',
    icon: '🥤',
    positive: true,
  },
  noAlcohol: {
    id: 'noAlcohol',
    label: 'No alcohol',
    icon: '🚫',
    positive: true,
    weekdayOnly: true,
  },
}

export function isWeekend(date = new Date()) {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function isScheduledDay(activity, date = new Date()) {
  if (!activity.scheduledDays) return false
  return activity.scheduledDays.includes(date.getDay())
}
