const CACHE = 'amistmg-f517140a6e';
//  Plusieurs apps cohabitent sur le domaine (perso à la racine, Maths dans /maths/, version partagée dans
//  son propre dossier). Chacune ne nettoie QUE ses caches (même préfixe) et ne sert QUE son dossier.
const PREFIX = CACHE.slice(0, CACHE.lastIndexOf('-') + 1);
const SCOPE = new URL('./', self.location).pathname;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith(PREFIX)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith(SCOPE)) return;
  // l'app Maths (/maths/) a son propre service worker : ne pas intercepter
  if (url.pathname.includes('/maths/')) return;
  // les échéances changent tous les jours : réseau d'abord, cache en secours (hors-ligne)
  if (url.pathname.endsWith('/echeances.enc.json')){
    e.respondWith(fetch(e.request).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put('./echeances.enc.json', res.clone())); return res; })
      .catch(() => caches.match('./echeances.enc.json')));
    return;
  }

  //  une autre app du domaine (la version partagée, par exemple) doit recevoir SA page, pas la nôtre :
  //  on ne répond aux navigations que pour notre propre index.
  const navigation = e.request.mode === 'navigate';
  if (navigation && url.pathname !== SCOPE && url.pathname !== SCOPE + 'index.html') return;
  const key = navigation ? './index.html' : e.request;
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
