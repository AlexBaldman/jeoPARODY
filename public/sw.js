const CACHE = 'jeopardish-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/assets/fonts/stylesheet.css'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Cache-first for static and questions; pass-through for others
  const shouldCache = url.origin === self.location.origin && (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  );
  if (!shouldCache) return;
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request).then((r) => {
      const copy = r.clone(); caches.open(CACHE).then((c)=>c.put(e.request, copy)).catch(()=>{}); return r;
    }).catch(()=>res))
  );
});

