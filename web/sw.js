// 离线缓存：先用网络取最新版本，取不到（断网）时用缓存。
const CACHE = 'liuri-v1';
const FILES = ['widget.html', 'engine.js', 'channels.js', 'cities.js', 'vendor/swisseph.js', 'vendor/swisseph-wasm.js',
  'icon-180.png', 'icon-512.png', 'manifest.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
