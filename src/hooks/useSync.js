// useSync
// Keeps Zustand state in sync with Supabase.
//
// On login:
//   - Fetches cloud data for this user
//   - If cloud row exists → hydrate store from cloud (cloud wins, it's the source of truth)
//   - If no cloud row → migrate local localStorage data up (first login from a device with existing data)
//
// While logged in:
//   - Every store change debounces 2 s then upserts to Supabase

import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'

const SYNC_KEYS = ['bubbles', 'logs', 'weightLog', 'streaks', 'settings', 'cheatAllowances', 'seenAlertIds', 'penaltyEpoch', 'mandatoryActivities', 'anchorState']
const DEBOUNCE_MS = 2000
const PENDING_KEY = 'dont-drift-pending-sync'

function pickSyncKeys(state) {
  return Object.fromEntries(SYNC_KEYS.map(k => [k, state[k]]))
}

// Persist a write that couldn't reach the cloud (offline / failed) so it can be
// retried on reconnect or next launch.
function stashPending(userId, payload) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify({ userId, payload })) } catch (_) {}
}
function clearPending() {
  try { localStorage.removeItem(PENDING_KEY) } catch (_) {}
}
async function flushPending() {
  let pending
  try { pending = JSON.parse(localStorage.getItem(PENDING_KEY)) } catch (_) { return }
  if (!pending?.userId) return
  const { error } = await supabase.from('user_data').upsert({
    user_id:    pending.userId,
    data:       pending.payload,
    updated_at: new Date().toISOString(),
  })
  if (!error) clearPending()
}

export function useSync() {
  const store          = useStore()
  const hydrateFromCloud = useStore(s => s.hydrateFromCloud)
  const timerRef       = useRef(null)
  const userIdRef      = useRef(null)
  const initializedRef = useRef(false)

  // ── Pull from cloud or migrate local data ───────────────────────────────
  const initSync = useCallback(async (userId) => {
    userIdRef.current   = userId
    initializedRef.current = false

    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = row not found, anything else is a real error
      console.error('Supabase fetch error:', error)
      initializedRef.current = true
      return
    }

    if (data?.data) {
      // Cloud row exists — hydrate store from it
      hydrateFromCloud(data.data)
    } else {
      // First login — migrate local state up to cloud
      const localState = pickSyncKeys(useStore.getState())
      await supabase.from('user_data').upsert({
        user_id:    userId,
        data:       localState,
        updated_at: new Date().toISOString(),
      })
    }

    initializedRef.current = true
  }, [hydrateFromCloud])

  // ── Auth state listener ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) initSync(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        initSync(session.user.id)
      } else {
        userIdRef.current      = null
        initializedRef.current = false
      }
    })

    return () => subscription.unsubscribe()
  }, [initSync])

  // ── Flush any queued offline write on reconnect / tab return ─────────────
  useEffect(() => {
    const tryFlush = () => { if (navigator.onLine) flushPending() }
    window.addEventListener('online', tryFlush)
    document.addEventListener('visibilitychange', tryFlush)
    tryFlush() // attempt once on mount (e.g. data queued from a previous launch)
    return () => {
      window.removeEventListener('online', tryFlush)
      document.removeEventListener('visibilitychange', tryFlush)
    }
  }, [])

  // ── Debounced write on every state change ───────────────────────────────
  useEffect(() => {
    if (!userIdRef.current || !initializedRef.current) return

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (!userIdRef.current) return
      const payload = pickSyncKeys(useStore.getState())
      if (!navigator.onLine) { stashPending(userIdRef.current, payload); return }
      const { error } = await supabase.from('user_data').upsert({
        user_id:    userIdRef.current,
        data:       payload,
        updated_at: new Date().toISOString(),
      })
      if (error) {
        console.error('Supabase sync write error:', error)
        stashPending(userIdRef.current, payload)
      } else {
        clearPending()
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timerRef.current)
  // Subscribe to the keys we care about
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.bubbles,
    store.logs,
    store.weightLog,
    store.streaks,
    store.settings,
    store.cheatAllowances,
    store.seenAlertIds,
    store.penaltyEpoch,
    store.mandatoryActivities,
    store.anchorState,
  ])
}
