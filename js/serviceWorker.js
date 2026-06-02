const CACHE_NAME = 'attendance-pwa-v2';  // Incremented version to force cache update
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/member.html',
  '/success.html',
  '/css/style.css',
  '/js/config.js',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/member.js',
  '/js/success.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Skip caching for API calls and non-GET requests
  if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});