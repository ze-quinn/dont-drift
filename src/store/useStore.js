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
}

const defaultCheatAllowances = {
  burgers: 0,
  otherTreats: 0,
  boozeDays: 0,
  month: new Date().toISOString().slice(0, 7), // YYYY-MM
}

const defaultHealthData = {
  steps: null,
  activeCalories: null,
  sleepHours: null,
  restingHR: null,
  lastSynced: null,
}

export const useStore = create(
  persist(
    (set, get) => ({
      // Core
      bubbles: 0,
      logs: [],           // { id, date, ruleKey, label, delta, note }
      weightLog: [],      // { date, weight }
      streaks: {},        // { activityId: number }
      settings: defaultSettings,
      cheatAllowances: defaultCheatAllowances,
      healthData: defaultHealthData,
      seenAlertIds: [],

      // Bubble operations
      addBubbles: (ruleKey, label, delta, note = '') => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const entry = {
          id,
          date: new Date().toISOString(),
          ruleKey,
          label,
          delta,
          note,
        }
        set(state => ({
          bubbles: state.bubbles + delta,
          logs: [entry, ...state.logs].slice(0, 500),
        }))
        return entry
      },

      // Weight log
      logWeight: (weight) => {
        set(state => ({
          weightLog: [
            { date: new Date().toISOString(), weight: parseFloat(weight) },
            ...state.weightLog,
          ].slice(0, 365),
          settings: { ...state.settings, weight: String(weight) },
        }))
      },

      // Streaks
      updateStreak: (activityId, completed) => {
        set(state => {
          const current = state.streaks[activityId] || 0
          return {
            streaks: {
              ...state.streaks,
              [activityId]: completed ? current + 1 : 0,
            },
          }
        })
      },

      // Settings
      updateSettings: (patch) => {
        set(state => ({ settings: { ...state.settings, ...patch } }))
      },

      // Cheat allowances — reset monthly
      updateCheatAllowances: (patch) => {
        const currentMonth = new Date().toISOString().slice(0, 7)
        set(state => {
          const base = state.cheatAllowances.month === currentMonth
            ? state.cheatAllowances
            : { ...defaultCheatAllowances, month: currentMonth }
          return { cheatAllowances: { ...base, ...patch, month: currentMonth } }
        })
      },

      // Health data (placeholder for HealthKit)
      updateHealthData: (patch) => {
        set(state => ({
          healthData: {
            ...state.healthData,
            ...patch,
            lastSynced: new Date().toISOString(),
          },
        }))
      },

      // Alert deduplication
      markAlertSeen: (alertId) => {
        set(state => ({
          seenAlertIds: [...state.seenAlertIds, alertId].slice(-50),
        }))
      },

      // Today's logs
      getTodayLogs: () => {
        const today = new Date().toDateString()
        return get().logs.filter(l => new Date(l.date).toDateString() === today)
      },

      // Check if activity logged today
      isLoggedToday: (ruleKey) => {
        const today = new Date().toDateString()
        return get().logs.some(
          l => l.ruleKey === ruleKey && new Date(l.date).toDateString() === today
        )
      },
    }),
    {
      name: 'dont-drift-store',
      version: 1,
    }
  )
)
