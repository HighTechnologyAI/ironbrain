self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Minimal pass-through service worker; ready for future offline caching
self.addEventListener('fetch', () => {});
