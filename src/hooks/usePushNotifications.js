// usePushNotifications
// Handles requesting notification permission, subscribing to Web Push,
// and saving user preferences (time + topic) to the server.

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function usePushNotifications() {
  // Permission / support state is known synchronously — derive the initial
  // value instead of setting it in an effect (avoids a cascading render).
  const [status, setStatus] = useState(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
    if (Notification.permission === 'denied') return 'denied'
    return 'idle' // idle | requesting | subscribed | denied | unsupported
  })
  const [error, setError]       = useState(null)
  const [prefsSaved, setPrefsSaved] = useState(false) // flash state for save button

  // On mount, detect an existing subscription (async — needs the SW)
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready
        .then(reg => reg.pushManager.getSubscription())
        .then(sub => { if (sub) setStatus('subscribed') })
    }
  }, [])

  async function subscribe() {
    setError(null)
    setStatus('requesting')
    try {
      if (!VAPID_PUBLIC_KEY) throw new Error('VAPID public key not configured')

      // Ask permission first — don't block on SW ready before showing the dialog
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      // Register (or re-use) the service worker
      await navigator.serviceWorker.register('/sw.js')

      // Wait for the SW to be fully active before touching pushManager
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 15000)),
      ])

      // Clear any existing subscription so a fresh one is created with the current key
      const existingSub = await reg.pushManager.getSubscription().catch(() => null)
      if (existingSub) await existingSub.unsubscribe()

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify(subscription),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      setStatus('subscribed')
    } catch (err) {
      console.error('Push subscribe error:', err)
      setError(err.message)
      setStatus('idle')
    }
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      setStatus('idle')
    } catch (err) {
      console.error('Unsubscribe error:', err)
    }
  }

  // Save notification schedules to the server (Edge Config)
  // schedules: [{ id, hour, minute, topic }, ...]
  async function savePrefs(schedules) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/save-prefs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ schedules }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setPrefsSaved(true)
      setTimeout(() => setPrefsSaved(false), 2000)
    } catch (err) {
      console.error('savePrefs error:', err)
      setError(err.message)
    }
  }

  return { status, error, prefsSaved, subscribe, unsubscribe, savePrefs }
}
