/* Mushaf service worker — offline support.
 * At build time vite.config.ts writes the list of built files into PRECACHE below.
 */
const VERSION = '__BUILD_VERSION__';
const STATIC_CACHE = 'mushaf-static-' + VERSION;
const RUNTIME_CACHE = 'mushaf-runtime-v4';
const PRECACHE = __PRECACHE_MANIFEST__;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.all(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isAudio(url, request) {
  return request.destination === 'audio' || /\.mp3($|\?)/.test(url.pathname) || request.headers.has('range');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // The server API (اسأل chat) is never cached: always the live answer
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  // The download page (/download) is its own page, not the app: never cached, never answered with the app shell
  if (url.origin === self.location.origin && (url.pathname === '/download' || url.pathname.startsWith('/download/'))) return;

  // Audio streams (range requests) go straight to the network
  if (isAudio(url, request)) return;

  // App navigation: network first, fall back to the cached app shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put('/index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Same-origin files (JS, CSS, Quran text, icons): cache first, then network
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        });
      })
    );
    return;
  }

  // Google Fonts and the Quran text mirror: cache first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || url.pathname.includes('/quran/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res && (res.ok || res.type === 'opaque')) {
              const copy = res.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy)).catch(() => {});
            }
            return res;
          })
      )
    );
    return;
  }

  // Tafsir / prayer-time APIs: network first, cached answer when offline
  if (url.hostname === 'api.alquran.cloud' || url.hostname === 'api.aladhan.com') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || new Response(JSON.stringify({ code: 503, status: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } })))
    );
  }
});
