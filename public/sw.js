// Don't Drift — Service Worker
// Handles push notifications and basic PWA caching

const CACHE_NAME = 'dont-drift-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

// ── Push notification handler ──────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: "Don't Drift", body: event.data?.text() ?? 'Time to check in.' }
  }

  const title = data.title ?? "Don't Drift"
  const options = {
    body: data.body ?? 'Your ocean is calling.',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag ?? 'dont-drift',
    renotify: true,
    data: { url: data.url ?? '/' },
    actions: data.actions ?? [],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── Notification click → open app ─────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) {
        existing.focus()
        existing.navigate(url)
      } else {
        self.clients.openWindow(url)
      }
    })
  )
})
