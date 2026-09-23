const CACHE = 'rstmg-39866e9350';
//  Plusieurs apps cohabitent sur le domaine (perso à la racine, Maths dans /maths/, version partagée dans
//  son propre dossier). Chacune ne nettoie QUE ses caches (même préfixe) et ne sert QUE son dossier.
const PREFIX = CACHE.slice(0, CACHE.lastIndexOf('-') + 1);
const SCOPE = new URL('./', self.location).pathname;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
//  Délai au-delà duquel on préfère la copie hors ligne à un réseau qui traîne (voir plus bas).
const DELAI_RESEAU = 2000;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    //  `cache: 'reload'` est indispensable : sans lui, le cache HTTP du navigateur peut rendre une page
    //  périmée, qu'on figerait alors dans le cache du service worker.
    //  Un échec sur un fichier ne doit pas faire échouer l'installation : mieux vaut une app en ligne
    //  qu'un service worker qui n'arrive jamais à s'installer.
    await Promise.all(ASSETS.map(async u => {
      try {
        const r = await fetch(new Request(u, { cache: 'reload' }));
        if (r.ok) await c.put(u, r.clone());
      } catch (_) { /* réseau indisponible pendant l'installation */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith(PREFIX)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

//  Met à jour le cache en tâche de fond. `e.waitUntil` n'est pas décoratif : sans lui, le service worker
//  peut être arrêté avant la fin de l'écriture, et le cache ne se rafraîchit alors JAMAIS.
function revalider(e, requete, cle, cache) {
  const p = (async () => {
    const res = await fetch(requete);
    if (res.ok) await cache.put(cle, res.clone());
    return res;
  })();
  e.waitUntil(p.catch(() => {}));
  return p;
}

//  Une requête qui ne peut PAS être servie par le cache HTTP du navigateur.
//  GitHub Pages répond `max-age=600` : sans ça, un `fetch` depuis le service worker peut rendre
//  pendant dix minutes la page d'avant le déploiement, cache du service worker à jour ou non.
//  `no-cache` (et pas `reload`) laisse le navigateur valider avec l'ETag : réponse 304 le plus souvent,
//  donc aucun téléchargement inutile des 2 Mo de la page.
function sansCacheHttp(url) {
  return new Request(url, { cache: 'no-cache', credentials: 'same-origin' });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith(SCOPE)) return;

  //  une autre app du domaine (la version partagée, par exemple) doit recevoir SA page, pas la nôtre :
  //  on ne répond aux navigations que pour notre propre index.
  const navigation = e.request.mode === 'navigate';
  if (navigation && url.pathname !== SCOPE && url.pathname !== SCOPE + 'index.html') return;
  const key = navigation ? './index.html' : e.request;

  if (navigation) {
    //  LA PAGE ELLE-MÊME : RÉSEAU D'ABORD, cache en secours passé DELAI_RESEAU.
    //  Servir le cache d'abord serait plus rapide, mais une correction publiée la veille d'un contrôle
    //  n'arriverait qu'au chargement SUIVANT — c'est exactement le défaut constaté le 20/09/2026.
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      let minuteur;
      const reseau = revalider(e, sansCacheHttp(e.request.url), key, cache);
      const attente = new Promise(r => { minuteur = setTimeout(() => r(null), DELAI_RESEAU); });
      try {
        const res = await Promise.race([reseau, attente]);
        if (res) { clearTimeout(minuteur); return res; }
      } catch (_) { /* hors ligne : on passe au cache */ }
      clearTimeout(minuteur);
      const hit = await cache.match(key);
      return hit || reseau;
    })());
    return;
  }

  //  LE RESTE (icônes, manifeste…) : cache d'abord, et on rafraîchit derrière pour la fois suivante.
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(key);
    if (hit) { revalider(e, e.request, key, cache); return hit; }
    try { return await revalider(e, e.request, key, cache); }
    catch (_) { return Response.error(); }
  })());
});
