const CACHE_NAME = 'guitar-tracker-v2';
const IMAGE_CACHE_NAME = 'guitar-tracker-images-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache Spotify CDN images with stale-while-revalidate strategy
  if (url.hostname === 'i.scdn.co') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        
        const fetchPromise = fetch(request).then((response) => {
          // Clone the response before caching
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => cached); // Fallback to cache if network fails

        // Return cached immediately if available, fetch in background
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default cache-first strategy for other requests
  event.respondWith(
    caches.match(request)
      .then((response) => response || fetch(request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
