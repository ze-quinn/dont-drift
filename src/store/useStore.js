import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultSettings = {
  theme: 'dark',
  alarmHour: 7,
  alarmMinute: 0,
  shoulderTargetHour: 19,
  height: '',
  weight: '',
  targetWeight: '',
  age: '',
  restingHR: '',
  sleepGoalHours: 7,
  notifHour: 19,
  notifMinute: 0,
  notifTopic: 'shoulder',
}

const defaultHealthData = {
  steps: null,
  activeCalories: null,
  sleepHours: null,
  restingHR: null,
  lastSynced: null,
}

// Default cheat allowance config — structure editable by user
export const DEFAULT_CHEAT_CONFIG = [
  { id: 'burgers',     label: 'Burgers',      icon: '🍔', allowance: 2 },
  { id: 'otherTreats', label: 'Other treats', icon: '🍰', allowance: 1 },
  { id: 'boozeDays',   label: 'Booze days',   icon: '🍷', allowance: 6 },
]

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Core ──────────────────────────────────────────────────────
      bubbles: 0,
      logs: [],        // { id, date, ruleKey, label, delta, note }
      weightLog: [],   // { date, weight }
      streaks: {},     // { activityId: number }
      settings: defaultSettings,
      healthData: defaultHealthData,
      seenAlertIds: [],

      // ── Custom activity/habit/penalty config ──────────────────────
      // custom items added by user
      // gain/penalty: { id, icon, label, delta, type:'gain'|'penalty', hasDuration, tiers:[{maxMin,delta}] }
      // habit:        { id, icon, label, delta, isPenalty, weekdayOnly }
      customActivities: [],
      removedActivities: [],  // array of built-in opt.id strings user has removed
      customHabits: [],
      removedHabits: [],      // array of built-in habit ids

      // ── Cheat allowances ─────────────────────────────────────────
      // config: what cheat types exist and how many are allowed per month
      cheatConfig: DEFAULT_CHEAT_CONFIG,
      // usage: how many used this month per id
      cheatUsage: { month: '', counts: {} },

      // ── Bubble operations ──────────────────────────────────────────
      addBubbles: (ruleKey, label, delta, note = '') => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const entry = { id, date: new Date().toISOString(), ruleKey, label, delta, note }
        set(state => ({
          bubbles: state.bubbles + delta,
          logs: [entry, ...state.logs].slice(0, 500),
        }))
        return entry
      },

      // ── Weight log ─────────────────────────────────────────────────
      logWeight: (weight) => {
        set(state => ({
          weightLog: [
            { date: new Date().toISOString(), weight: parseFloat(weight) },
            ...state.weightLog,
          ].slice(0, 365),
          settings: { ...state.settings, weight: String(weight) },
        }))
      },

      // ── Streaks ─────────────────────────────────────────────────────
      updateStreak: (activityId, completed) => {
        set(state => {
          const current = state.streaks[activityId] || 0
          return { streaks: { ...state.streaks, [activityId]: completed ? current + 1 : 0 } }
        })
      },

      // ── Settings ────────────────────────────────────────────────────
      updateSettings: (patch) => {
        set(state => ({ settings: { ...state.settings, ...patch } }))
      },

      // ── Custom activities ────────────────────────────────────────────
      addCustomActivity: (item) => {
        set(state => ({ customActivities: [...state.customActivities, item] }))
      },
      removeActivity: (id) => {
        set(state => ({ removedActivities: [...state.removedActivities, id] }))
      },
      restoreActivity: (id) => {
        set(state => ({ removedActivities: state.removedActivities.filter(x => x !== id) }))
      },
      removeCustomActivity: (id) => {
        set(state => ({ customActivities: state.customActivities.filter(a => a.id !== id) }))
      },

      // ── Custom habits ─────────────────────────────────────────────────
      addCustomHabit: (item) => {
        set(state => ({ customHabits: [...state.customHabits, item] }))
      },
      removeHabit: (id) => {
        set(state => ({ removedHabits: [...state.removedHabits, id] }))
      },
      restoreHabit: (id) => {
        set(state => ({ removedHabits: state.removedHabits.filter(x => x !== id) }))
      },
      removeCustomHabit: (id) => {
        set(state => ({ customHabits: state.customHabits.filter(h => h.id !== id) }))
      },

      // ── Cheat allowances ──────────────────────────────────────────────
      setCheatConfig: (config) => set({ cheatConfig: config }),

      logCheat: (id) => {
        const state = get()
        const currentMonth = new Date().toISOString().slice(0, 7)
        const prevUsage = state.cheatUsage.month === currentMonth
          ? state.cheatUsage
          : { month: currentMonth, counts: {} }
        const prevCount = prevUsage.counts[id] ?? 0
        const cfg = state.cheatConfig.find(c => c.id === id)
        const newCount = prevCount + 1
        const newUsage = { ...prevUsage, counts: { ...prevUsage.counts, [id]: newCount } }
        set({ cheatUsage: newUsage })
        // Penalty only when over allowance
        if (newCount > (cfg?.allowance ?? 0)) {
          get().addBubbles(
            `CHEAT_OVER_${id}_${Date.now()}`,
            `${cfg?.label ?? 'Cheat'} — over limit`,
            -20
          )
        }
      },

      undoCheat: (id) => {
        const state = get()
        const currentMonth = new Date().toISOString().slice(0, 7)
        if (state.cheatUsage.month !== currentMonth) return
        const prevCount = state.cheatUsage.counts[id] ?? 0
        if (prevCount <= 0) return
        set(s => ({
          cheatUsage: {
            ...s.cheatUsage,
            counts: { ...s.cheatUsage.counts, [id]: prevCount - 1 },
          },
        }))
      },

      // ── Health data ───────────────────────────────────────────────────
      updateHealthData: (patch) => {
        set(state => ({
          healthData: { ...state.healthData, ...patch, lastSynced: new Date().toISOString() },
        }))
      },

      // ── Cloud sync ────────────────────────────────────────────────────
      hydrateFromCloud: (data) => {
        set(state => ({
          bubbles:           data.bubbles           ?? state.bubbles,
          logs:              data.logs              ?? state.logs,
          weightLog:         data.weightLog         ?? state.weightLog,
          streaks:           data.streaks           ?? state.streaks,
          settings:          data.settings          ? { ...state.settings, ...data.settings } : state.settings,
          seenAlertIds:      data.seenAlertIds      ?? state.seenAlertIds,
          customActivities:  data.customActivities  ?? state.customActivities,
          removedActivities: data.removedActivities ?? state.removedActivities,
          customHabits:      data.customHabits      ?? state.customHabits,
          removedHabits:     data.removedHabits     ?? state.removedHabits,
          cheatConfig:       data.cheatConfig       ?? state.cheatConfig,
          cheatUsage:        data.cheatUsage        ?? state.cheatUsage,
        }))
      },

      // ── Alert deduplication ────────────────────────────────────────────
      markAlertSeen: (alertId) => {
        set(state => ({ seenAlertIds: [...state.seenAlertIds, alertId].slice(-50) }))
      },

      // ── Helpers ───────────────────────────────────────────────────────
      getTodayLogs: () => {
        const today = new Date().toDateString()
        return get().logs.filter(l => new Date(l.date).toDateString() === today)
      },

      isLoggedToday: (ruleKey) => {
        const today = new Date().toDateString()
        return get().logs.some(
          l => l.ruleKey === ruleKey && new Date(l.date).toDateString() === today
        )
      },
    }),
    {
      name: 'dont-drift-store',
      version: 2,
      migrate: (old, v) => {
        // v1 → v2: drop old cheatAllowances shape, introduce new keys
        if (v < 2) {
          return {
            ...old,
            customActivities:  old.customActivities  ?? [],
            removedActivities: old.removedActivities ?? [],
            customHabits:      old.customHabits      ?? [],
            removedHabits:     old.removedHabits     ?? [],
            cheatConfig:       old.cheatConfig       ?? DEFAULT_CHEAT_CONFIG,
            cheatUsage:        old.cheatUsage        ?? { month: '', counts: {} },
          }
        }
        return old
      },
    }
  )
)
