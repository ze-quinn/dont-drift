// useSync
// Keeps Zustand state in sync with Supabase.
//
// On login:
//   - Flushes any queued offline write first, then fetches cloud data
//   - Newest wins: hydrate from cloud only if the cloud row is newer than the
//     last local write on this device; otherwise push local state up
//   - If no cloud row → migrate local localStorage data up (first login from a device with existing data)
//
// While logged in:
//   - Every store change debounces 2 s then upserts to Supabase

import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { useSyncStatus } from '../store/useSyncStatus'

const SYNC_KEYS = ['bubbles', 'logs', 'weightLog', 'streaks', 'settings', 'cheatAllowances', 'seenAlertIds', 'penaltyEpoch', 'mandatoryActivities', 'anchorState']
const DEBOUNCE_MS = 2000
const PENDING_KEY = 'dont-drift-pending-sync'
const LAST_WRITE_KEY = 'dont-drift-last-local-write'

// Timestamp of the last state change made on THIS device (synced or not).
// Compared against the cloud row's updated_at on login so a stale cloud row
// can't clobber newer offline work.
function markLocalWrite() {
  try { localStorage.setItem(LAST_WRITE_KEY, new Date().toISOString()) } catch { /* quota */ }
}
function getLastLocalWrite() {
  try { return localStorage.getItem(LAST_WRITE_KEY) } catch { return null }
}

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
  if (!error) {
    clearPending()
    useSyncStatus.getState().markSynced()
  }
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

    // Push any queued offline write up BEFORE fetching, so it isn't lost
    // to the hydrate below.
    await flushPending()

    const { data, error } = await supabase
      .from('user_data')
      .select('data, updated_at')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = row not found, anything else is a real error
      console.error('Supabase fetch error:', error)
      initializedRef.current = true
      return
    }

    if (data?.data) {
      // Cloud row exists — newest wins. Only hydrate if the cloud row is
      // newer than the last write made on this device; otherwise this
      // device has fresher (e.g. offline) state, so push it up instead.
      const lastLocal = getLastLocalWrite()
      const cloudNewer = !lastLocal || !data.updated_at || new Date(data.updated_at) >= new Date(lastLocal)
      if (cloudNewer) {
        hydrateFromCloud(data.data)
        useSyncStatus.getState().markSynced()
      } else {
        const localState = pickSyncKeys(useStore.getState())
        const { error: upErr } = await supabase.from('user_data').upsert({
          user_id:    userId,
          data:       localState,
          updated_at: new Date().toISOString(),
        })
        if (!upErr) useSyncStatus.getState().markSynced()
      }
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
    const onOffline = () => useSyncStatus.getState().setStatus('offline')
    window.addEventListener('online', tryFlush)
    window.addEventListener('offline', onOffline)
    document.addEventListener('visibilitychange', tryFlush)
    tryFlush() // attempt once on mount (e.g. data queued from a previous launch)
    return () => {
      window.removeEventListener('online', tryFlush)
      window.removeEventListener('offline', onOffline)
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
      markLocalWrite()
      if (!navigator.onLine) {
        stashPending(userIdRef.current, payload)
        useSyncStatus.getState().setStatus('offline')
        return
      }
      useSyncStatus.getState().setStatus('syncing')
      const { error } = await supabase.from('user_data').upsert({
        user_id:    userIdRef.current,
        data:       payload,
        updated_at: new Date().toISOString(),
      })
      if (error) {
        console.error('Supabase sync write error:', error)
        stashPending(userIdRef.current, payload)
        useSyncStatus.getState().setStatus(navigator.onLine ? 'error' : 'offline')
      } else {
        clearPending()
        useSyncStatus.getState().markSynced()
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timerRef.current)
  // Subscribe to the keys we care about
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
