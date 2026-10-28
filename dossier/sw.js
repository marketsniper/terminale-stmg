/* Service worker de « Mon dossier » (/dossier/), copié du modèle de l'app STMG (sw.js racine).
   Préfixe de cache propre (dsp-) : il ne nettoie que ses caches et ne sert que son dossier. Le service worker
   racine n'intercepte pas /dossier/ (voir le crochet « Mode Parcoursup » dans sw.js racine). */
const CACHE = 'dsp-2026-10-28a';
const PREFIX = CACHE.slice(0, CACHE.lastIndexOf('-') + 1);
const SCOPE = new URL('./', self.location).pathname;
const ASSETS = ['./', './index.html', './dossier.css', './calc.js', './formations.js', './jalons.js', './pdf-texte.js', './bulletin-parse.js', './etat.js', './ui.js', './ia.js', './modele.js',
  './vue-tableau.js', './vue-bulletins.js', './vue-import.js', './vue-jury.js', './vue-simulateur.js', './vue-histoire.js', './vue-calendrier.js', './vue-reglages.js', './app.js',
  './cadre.js', './cadre.css', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
const DELAI_RESEAU = 2000;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(ASSETS.map(async u => {
      try { const r = await fetch(new Request(u, { cache: 'reload' })); if (r.ok) await c.put(u, r.clone()); } catch (_) { }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith(PREFIX)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function revalider(e, requete, cle, cache) {
  const p = (async () => { const res = await fetch(requete); if (res.ok) await cache.put(cle, res.clone()); return res; })();
  e.waitUntil(p.catch(() => { }));
  return p;
}
function sansCacheHttp(url) { return new Request(url, { cache: 'no-cache', credentials: 'same-origin' }); }
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith(SCOPE)) return;
  const navigation = e.request.mode === 'navigate';
  if (navigation && url.pathname !== SCOPE && url.pathname !== SCOPE + 'index.html') return;
  const key = navigation ? './index.html' : e.request;
  if (navigation) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      let minuteur;
      const reseau = revalider(e, sansCacheHttp(e.request.url), key, cache);
      const attente = new Promise(r => { minuteur = setTimeout(() => r(null), DELAI_RESEAU); });
      try { const res = await Promise.race([reseau, attente]); if (res) { clearTimeout(minuteur); return res; } } catch (_) { }
      clearTimeout(minuteur);
      const hit = await cache.match(key);
      return hit || reseau;
    })());
    return;
  }
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(key);
    if (hit) { revalider(e, e.request, key, cache); return hit; }
    try { return await revalider(e, e.request, key, cache); } catch (_) { return Response.error(); }
  })());
});
