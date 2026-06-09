const CACHE_NAME = 'cinesearch-v3';

// Instant install - no heavy caching to prevent timeout/hanging
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Activate immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache on-demand during fetch
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('api.themoviedb.org')) return;
  if (e.request.url.includes('image.tmdb.org')) return;
  if (e.request.url.includes('vidsrc')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
