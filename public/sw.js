// Don't Drift — Service Worker
// Handles push notifications and basic PWA caching

const CACHE_NAME = 'dont-drift-v4'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  // Clear all old caches so the new bundle is always used
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// ── Fetch: cache static assets, network-first for navigations ──────────────
// Hashed Vite assets (/assets/*) are immutable → stale-while-revalidate.
// HTML navigations stay network-first so new deploys land immediately, with a
// cached fallback when offline.
self.addEventListener('fetch', event => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // never cache Supabase / push / fonts

  // App shell / page navigations — network first, cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(req, copy))
          return res
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/')))
    )
    return
  }

  // Static assets — serve from cache, refresh in background
  if (url.pathname.startsWith('/assets/') || /\.(?:js|css|svg|png|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req).then(res => {
          if (res && res.status === 200) {
            const copy = res.clone()
            caches.open(CACHE_NAME).then(c => c.put(req, copy))
          }
          return res
        }).catch(() => cached)
        return cached || network
      })
    )
  }
})

// ── Push notification handler ──────────────────────────────────────────────
self.addEventListener('push', event => {
  let data
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
