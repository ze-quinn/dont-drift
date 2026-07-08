// Lightweight sync-status store — separate from the main persisted store so
// status flags never get written to localStorage or synced to the cloud.
import { create } from 'zustand'

export const useSyncStatus = create(set => ({
  status: 'idle',        // idle | syncing | synced | offline | error
  lastSyncedAt: null,    // ISO string of last successful upsert / hydrate
  setStatus: (status) => set({ status }),
  markSynced: () => set({ status: 'synced', lastSyncedAt: new Date().toISOString() }),
}))
