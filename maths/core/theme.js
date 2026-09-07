/* ===== Maths · De zéro au sommet : thème Aube et Nuit =====
   Script classique : portée globale partagée avec les autres modules.
   Ce fichier déclare : initTheme, setTheme, themeActuel, sunrise.
   Source de vérité : S.prefs.theme parmi 'auto', 'light', 'dark' ; localStorage('mzs-theme') en est le miroir. */
'use strict';

/* Couleurs de la barre d'état, une par thème (DESIGN-SPEC §2.4). */
const _themeMeta = {light: '#F5F2EB', dark: '#0C1122'};
let _themeMQ = null, _themeTimer = null;

/* Thème réellement affiché : 'light' ou 'dark', même quand la préférence est 'auto'. */
function themeActuel(){
  const p = (typeof S !== 'undefined' && S.prefs && S.prefs.theme) || 'auto';
  if (p === 'light' || p === 'dark') return p;
  try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch(e){ return 'light'; }
}

/* Pose l'attribut, le miroir localStorage et la couleur de barre d'état. Aucune transition ici. */
function _themeAppliquer(){
  const p = (typeof S !== 'undefined' && S.prefs && S.prefs.theme) || 'auto';
  const html = document.documentElement;
  if (p === 'light' || p === 'dark') html.setAttribute('data-theme', p); else html.removeAttribute('data-theme');
  const eff = themeActuel();
  html.style.colorScheme = eff;
  const meta = document.getElementById('meta-theme');
  if (meta) meta.setAttribute('content', _themeMeta[eff]);
  try { p === 'auto' ? localStorage.removeItem('mzs-theme') : localStorage.setItem('mzs-theme', p); } catch(e){}
}

/* Initialise le thème au démarrage : aucun flash, et suivi du système quand la préférence est 'auto'. */
function initTheme(){
  _themeAppliquer();
  if (_themeMQ) return;
  try {
    _themeMQ = matchMedia('(prefers-color-scheme: dark)');
    const suivre = () => { if (!S.prefs || S.prefs.theme === 'auto') _themeAppliquer(); };
    if (_themeMQ.addEventListener) _themeMQ.addEventListener('change', suivre);
    else if (_themeMQ.addListener) _themeMQ.addListener(suivre);
  } catch(e){}
}

/* Change la préférence de thème et l'enregistre. La transition de 300 ms n'existe que le temps de la bascule. */
function setTheme(v){
  if (v !== 'auto' && v !== 'light' && v !== 'dark') v = 'auto';
  if (typeof S !== 'undefined' && S.prefs) S.prefs.theme = v;
  const html = document.documentElement;
  let reduit = false;
  try { reduit = matchMedia('(prefers-reduced-motion: reduce)').matches || html.getAttribute('data-motion') === 'reduit'; } catch(e){}
  if (!reduit){
    html.classList.add('theming');
    clearTimeout(_themeTimer);
    _themeTimer = setTimeout(() => html.classList.remove('theming'), 320);
  }
  _themeAppliquer();
  if (typeof save === 'function') save();
  return v;
}

/* Lever de soleil : la bascule se propage en cercle depuis le point (x, y) du bouton.
   Transition circulaire quand document.startViewTransition existe, fondu simple sinon, rien en mouvement réduit.
   fn est la mutation à effectuer ; par défaut on alterne Aube et Nuit. */
function sunrise(x, y, fn){
  const html = document.documentElement;
  const muter = typeof fn === 'function' ? fn : () => setTheme(themeActuel() === 'dark' ? 'light' : 'dark');
  let reduit = false, grossier = false;
  try {
    reduit = matchMedia('(prefers-reduced-motion: reduce)').matches || html.getAttribute('data-motion') === 'reduit';
    grossier = matchMedia('(pointer: coarse)').matches;
  } catch(e){}
  if (reduit || grossier || typeof document.startViewTransition !== 'function'){ muter(); return; }
  html.style.setProperty('--tx', (x || innerWidth / 2) + 'px');
  html.style.setProperty('--ty', (y || 0) + 'px');
  try { document.startViewTransition(() => { muter(); }); } catch(e){ muter(); }
}

/* Application immédiate : le thème est déjà posé par le script inline de index.html, on le resynchronise avec S. */
initTheme();
