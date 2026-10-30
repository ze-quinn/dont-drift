import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MANDATORY_DEFAULTS } from '../constants/mandatory'

const defaultSettings = {
  theme: 'dark',
  soundEnabled: true,
  hapticsEnabled: true,
  shoulderTargetHour: 19,
  height: '',
  weight: '',
  targetWeight: '',
  age: '',
  restingHR: '',
  sleepGoalHours: 7,
  // legacy single-notif fields kept for migration only
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
      penaltyEpoch: null,  // dateString from which missed-activity penalties are enforced
      mandatoryActivities: MANDATORY_DEFAULTS,  // user-editable list of penalised-if-skipped activities
      anchorState: null,   // null | { since: ISO string, notifOptIn: boolean | null }
      weightLog: [],   // { date, weight }
      sleepLogs: [],   // { id, date, hoursSlept, goal, delta }
      streaks: {},     // { activityId: number }
      settings: defaultSettings,
      healthData: defaultHealthData,
      seenAlertIds: [],

      // ── Notification schedules ────────────────────────────────────
      // array of { id, hour, minute, topic } — one entry per notification slot
      notifSchedules: [{ id: 'default', hour: 19, minute: 0, topic: 'shoulder' }],

      setNotifSchedules: (schedules) => set({ notifSchedules: schedules }),

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

      // ── Anchor (pause) ────────────────────────────────────────────
      dropAnchor: () => {
        const state = get()
        if (state.anchorState) return
        const id = `ANCHOR_DROP-${Date.now()}`
        const entry = { id, date: new Date().toISOString(), ruleKey: 'ANCHOR_DROP', label: 'Dropped anchor', delta: -20, note: '' }
        set(state => ({
          bubbles: state.bubbles - 20,
          logs: [entry, ...state.logs].slice(0, 500),
          anchorState: { since: new Date().toISOString(), notifOptIn: null },
        }))
      },

      weighAnchor: () => {
        // Move the enforcement epoch to today so days spent anchored are never charged.
        set({ anchorState: null, penaltyEpoch: new Date().toDateString() })
      },

      setAnchorNotifOptIn: (val) => {
        const current = get().anchorState
        if (!current) return
        set({ anchorState: { ...current, notifOptIn: val } })
      },

      // ── Missed-activity penalties ──────────────────────────────────
      // Set the enforcement epoch once, so past history isn't penalized.
      ensurePenaltyEpoch: () => {
        if (!get().penaltyEpoch) set({ penaltyEpoch: new Date().toDateString() })
      },

      // Mandatory-activity config (penalised when skipped). "Keep past, stop
      // future" — removing an entry never reverses penalties already applied.
      addMandatoryActivity: (item) => {
        set(state => ({ mandatoryActivities: [...state.mandatoryActivities, item] }))
      },
      updateMandatoryActivity: (id, patch) => {
        set(state => ({
          mandatoryActivities: state.mandatoryActivities.map(m => (m.id === id ? { ...m, ...patch } : m)),
        }))
      },
      removeMandatoryActivity: (id) => {
        set(state => ({ mandatoryActivities: state.mandatoryActivities.filter(m => m.id !== id) }))
      },

      // Add a penalty (or any entry) dated to a past day. Idempotent: if an
      // entry with the same ruleKey already exists on that calendar day, no-op.
      addBackdatedEntry: ({ dateISO, ruleKey, label, delta }) => {
        const dayStr = new Date(dateISO).toDateString()
        const exists = get().logs.some(
          l => l.ruleKey === ruleKey && new Date(l.date).toDateString() === dayStr
        )
        if (exists) return
        const entry = { id: `${ruleKey}-${dayStr}`, date: dateISO, ruleKey, label, delta, note: '' }
        set(state => ({
          bubbles: state.bubbles + delta,
          logs: [entry, ...state.logs]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 500),
        }))
      },

      // ── Sleep log ──────────────────────────────────────────────────
      logSleep: (hoursSlept) => {
        const state = get()
        const goal  = state.settings.sleepGoalHours ?? 7
        const diff  = hoursSlept - goal
        let delta
        if (diff >= 0) {
          delta = Math.min(30, Math.round(diff * 10) + 5)
        } else {
          delta = Math.max(-30, Math.round(diff * 10))
        }
        const label = `😴 Slept ${hoursSlept}h (goal ${goal}h)`
        get().addBubbles('SLEEP_LOG', label, delta)
        const entry = { id: `sleep_${Date.now()}`, date: new Date().toISOString(), hoursSlept, goal, delta }
        set(state => ({ sleepLogs: [entry, ...state.sleepLogs].slice(0, 365) }))
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
          penaltyEpoch:      data.penaltyEpoch      ?? state.penaltyEpoch,
          mandatoryActivities: data.mandatoryActivities ?? state.mandatoryActivities,
          anchorState:         data.anchorState         ?? state.anchorState,
          weightLog:         data.weightLog         ?? state.weightLog,
          streaks:           data.streaks           ?? state.streaks,
          settings:          data.settings          ? { ...state.settings, ...data.settings } : state.settings,
          seenAlertIds:      data.seenAlertIds      ?? state.seenAlertIds,
          sleepLogs:         data.sleepLogs         ?? state.sleepLogs,
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
      migrate: (old, v) => {
        let state = { ...old }
        if (v < 2) {
          state = {
            ...state,
            customActivities:  state.customActivities  ?? [],
            removedActivities: state.removedActivities ?? [],
            customHabits:      state.customHabits      ?? [],
            removedHabits:     state.removedHabits     ?? [],
            cheatConfig:       state.cheatConfig       ?? DEFAULT_CHEAT_CONFIG,
            cheatUsage:        state.cheatUsage        ?? { month: '', counts: {} },
          }
        }
        if (v < 3) {
          const s = state.settings ?? {}
          state = {
            ...state,
            notifSchedules: state.notifSchedules ?? [{
              id: 'default',
              hour:   s.notifHour   ?? 19,
              minute: s.notifMinute ?? 0,
              topic:  s.notifTopic  ?? 'shoulder',
            }],
          }
        }
        if (v < 4) {
          state = { ...state, sleepLogs: state.sleepLogs ?? [] }
        }
        if (v < 5) {
          state = { ...state, anchorState: state.anchorState ?? null }
        }
        return state
      },
      version: 5,
    }
  )
)
