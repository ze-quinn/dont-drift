// usePushNotifications
// Handles requesting notification permission, subscribing to Web Push,
// and saving user preferences (time + topic) to the server.

import { useState, useEffect } from 'react'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const [status, setStatus]     = useState('idle') // idle | requesting | subscribed | denied | unsupported
  const [error, setError]       = useState(null)
  const [prefsSaved, setPrefsSaved] = useState(false) // flash state for save button

  // On mount, detect current permission + subscription state
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied'); return
    }
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
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // Save time + topic preferences to the server (Edge Config)
  async function savePrefs(hour, minute, topic) {
    try {
      const res = await fetch('/api/save-prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hour, minute, topic }),
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
