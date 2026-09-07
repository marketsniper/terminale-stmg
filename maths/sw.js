/* ===== Maths · De zéro au sommet — service worker =====
   Hors-ligne complet, mise à jour annoncée (jamais de skipWaiting silencieux). */
'use strict';

const CACHE = 'mzs-v9';

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
   ne doit jamais faire échouer l'installation entière. */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(ASSETS.map(u => c.add(u).catch(() => null)))
  ));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* La page décide du moment : toast « Nouvelle version prête. Recharger ». */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
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
