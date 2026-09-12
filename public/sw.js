const CACHE = 'quintal-v1';
const FILES = ['/', '/index.html', '/styles.css', '/app.js', '/data.js', '/schema.js', '/manifest.webmanifest', '/assets/map.svg', '/assets/cat.svg', '/assets/dog.svg', '/assets/hen.svg', '/assets/rooster.svg', '/assets/chick.svg', '/assets/favicon.svg', '/assets/fonts.css', '/assets/nunito-regular.ttf', '/assets/nunito-extrabold.ttf'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('quintal-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !FILES.includes(url.pathname)) return;
  event.respondWith(fetch(event.request).then(response => { if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(c => c.put(event.request, copy))); } return response; }).catch(() => caches.match(event.request)));
});
