/* ===== Maths · De zéro au sommet — service worker =====
   Hors-ligne complet, mise à jour annoncée (jamais de skipWaiting silencieux). */
'use strict';

const CACHE = 'mzs-ae76ad4dfd';
/* Plusieurs apps vivent sur le même domaine (l'app STMG à la racine, celle-ci dans /maths/).
   Chacune ne nettoie QUE ses caches (même préfixe) et ne sert QUE son dossier. */
const PREFIXE = 'mzs-';
const PORTEE = new URL('./', self.location).pathname;

const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './fonts.css', './css/1-socle.css', './css/2-composants.css', './css/3-vues.css',
  './icons.svg', './illus.svg', './grain.png',
  './fonts/Fraunces.woff2', './fonts/InstrumentSans.woff2', './fonts/InstrumentSans-Italic.woff2', './fonts/JetBrainsMono-Medium.woff2',
  './core/base.js', './core/etat.js', './core/theme.js', './core/sons.js', './core/pedagogie.js',
  './core/ui.js', './core/routeur.js', './core/question.js',
  './vues/accueil.js', './vues/programme.js', './vues/seance.js', './vues/calcul-mental.js',
  './vues/test.js', './vues/erreurs.js', './vues/coach.js', './vues/micro-ds.js',
  './vues/epreuve.js', './vues/papier.js', './vues/reglages.js', './vues/onboarding.js',
  './app.js', './techniques.js', './assistant.js',
  './papier/papier-a.js', './papier/papier-b.js', './papier/papier-c.js', './papier/papier-d.js',
  './skills/skills-p1.js', './skills/skills-p2.js', './skills/skills-p3.js', './skills/skills-p4.js',
  './skills/skills-p4b.js', './skills/skills-p5.js', './skills/skills-p6.js', './skills/skills-p7.js',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'
];

/* Mise en cache une par une : un fichier optionnel absent (illus.svg, grain.png)
   ne doit jamais faire échouer l'installation entière.
   cache:'no-cache' est indispensable : sans lui, le cache HTTP du navigateur (10 min sur GitHub Pages)
   peut rendre les anciens fichiers, que l'on figerait dans le cache de la nouvelle version.
   'no-cache' (et pas 'reload') fait valider chaque fichier auprès du serveur : réponse 304 pour ceux que
   la page vient de charger, donc rien n'est téléchargé deux fois au premier lancement. */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(ASSETS.map(u =>
      fetch(new Request(u, {cache: 'no-cache'})).then(r => r.ok ? c.put(u, r) : null).catch(() => null)))
  ));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith(PREFIXE)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* La page décide du moment : toast « Nouvelle version prête. Recharger ». */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* Rafraîchit le cache en tâche de fond. e.waitUntil n'est pas décoratif : sans lui, le service worker
   peut être arrêté avant la fin de l'écriture (iOS), et le cache ne se rafraîchit alors jamais.
   cache:'no-cache' fait valider le fichier auprès du serveur (réponse 304 le plus souvent) au lieu de
   relire le cache HTTP : une correction publiée arrive au lancement suivant, pas dix minutes plus tard. */
function revalider(e, url, cle, cache){
  const p = fetch(new Request(url, {cache: 'no-cache', credentials: 'same-origin'})).then(res => {
    if (!res.ok) return res;
    return cache.put(cle, res.clone()).then(() => res);
  });
  e.waitUntil(p.catch(() => {}));
  return p;
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith(PORTEE)) return;
  /* Seule la page de l'app est servie sous la clé './index.html'. Ouvrir un autre fichier du dossier
     (manifeste, icons.svg…) ne doit ni recevoir la page, ni la remplacer dans le cache. */
  const navigation = e.request.mode === 'navigate';
  if (navigation && url.pathname !== PORTEE && url.pathname !== PORTEE + 'index.html') return;
  const cle = navigation ? './index.html' : e.request;
  /* Cache d'abord (toute l'app vient de la même version), rafraîchi derrière pour le lancement suivant. */
  e.respondWith(caches.open(CACHE).then(cache =>
    cache.match(cle).then(hit => {
      const reseau = revalider(e, e.request.url, cle, cache);
      if (hit){ reseau.catch(() => {}); return hit; }
      return reseau.catch(() => Response.error());
    })
  ));
});
