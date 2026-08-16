const CACHE = 'mzs-v3';
const ASSETS = ['./', './index.html', './styles.css', './engine.js', './techniques.js', './assistant.js',
  './skills/skills-p1.js', './skills/skills-p2.js', './skills/skills-p3.js',
  './skills/skills-p4.js', './skills/skills-p4b.js', './skills/skills-p5.js', './skills/skills-p6.js', './skills/skills-p7.js',
  './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const key = e.request.mode === 'navigate' ? './index.html' : e.request;
  e.respondWith(
    caches.match(key).then(hit => {
      const fetched = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(key, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || fetched;
    })
  );
});
