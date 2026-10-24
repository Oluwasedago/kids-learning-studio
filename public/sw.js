// Service worker: lets the Studio start without Wi-Fi once it has been opened online.
// (New concept: a service worker is a small script the browser keeps next to a site. It sits between the page
// and the network, so it can answer from a saved copy when there is no connection.)
//
// - Page loads: network first, so new versions arrive; the saved page only when offline.
// - App files (assets, emoji, fonts): cache first (built file names change with every version, so never stale).
// - The app's update check (src/shared/autoUpdate.ts, cache: 'no-store'): always the network, never the saved
//   page. Answered from here it would always name the running version, so no update would ever be seen.
// Paths are relative to where this file lives, so it works under /kids-learning-studio/ on GitHub Pages.

const CACHE = 'kls-v4' // bump to make installed apps fetch changed files with fixed names (icons, emoji, photos)
const INDEX = new URL('./', self.registration.scope).href

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  // Only this site's own files. Radio streams, videos etc. go straight to the network, and so does the update check.
  if (req.method !== 'GET' || url.origin !== location.origin || !url.href.startsWith(self.registration.scope)) return
  if (req.cache === 'no-store') return

  if (req.mode === 'navigate') {
    // Each page (the app, the install page) is kept under its own address, without "?…" (e.g. ?demo).
    const page = url.origin + url.pathname
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && !res.redirected) caches.open(CACHE).then((c) => c.put(page, res.clone()))
          return res
        })
        .catch(() =>
          caches
            .match(page)
            .then((hit) => hit ?? caches.match(INDEX))
            .then((hit) => hit ?? Response.error()),
        ),
    )
    return
  }

  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ??
        fetch(req).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()))
          return res
        }),
    ),
  )
})
