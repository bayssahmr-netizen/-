// Service Worker - سوق لعوينات العملاق
// Strategy: Network-First for navigations, scripts and styles.
// A fresh copy is cached after every successful network response,
// so users NEVER stay stuck on an old HTML/JS/CSS version in production.
const CACHE_NAME = 'souq-elaouinet-runtime-v4';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Only handle same-origin requests (no CDN / Firebase Storage interception)
  if (url.origin !== self.location.origin) return;

  const isNavigate = event.request.mode === 'navigate';
  const isCore = isNavigate || ['script', 'style'].includes(event.request.destination);
  if (!isCore) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a fresh copy for offline fallback
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy))
            .catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(
          (hit) =>
            hit ||
            caches.match('./index.html') ||
            caches.match('/index.html')
        )
      )
  );
});
