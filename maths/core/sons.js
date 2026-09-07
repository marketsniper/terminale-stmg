/* ===== Maths · De zéro au sommet : palette sonore, haptique et neige =====
   Script classique : portée globale partagée avec les autres modules.
   Ce fichier déclare : actx, audio, tone, snd, REDUCE, confetti, vibrer.
   Réglage à trois états dans S.prefs.son : 'off', 'discret' (niveaux 1 et 2, gain 0,08), 'complet'. */
'use strict';

/* Mouvement réduit : recalculable après un changement de réglage par window.majReduce(). */
let REDUCE = false;
try { REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
window.majReduce = function(){
  let m = false;
  try { m = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-motion') === 'reduit'; } catch(e){}
  REDUCE = m;
  return m;
};

/* ---------- contexte audio, créé au premier geste seulement ---------- */
let actx = null;
let _sonGeste = false;
/* Retourne le contexte audio, en le créant au besoin. Ne fait rien avant le premier geste utilisateur. */
function audio(){
  if (!_sonGeste) return null;
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch(e){ return null; }
  return actx;
}
/* Le premier geste débloque l'audio sur iPhone comme sur Mac. */
(function(){
  const eveiller = () => {
    _sonGeste = true;
    try { audio(); } catch(e){}
    ['pointerdown', 'keydown', 'touchstart'].forEach(t => removeEventListener(t, eveiller, true));
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach(t => { try { addEventListener(t, eveiller, true); } catch(e){} });
})();

/* Mode sonore courant, avec repli sur 'discret'. */
function _sonMode(){
  const p = (typeof S !== 'undefined' && S.prefs && S.prefs.son) || 'discret';
  return p === 'off' || p === 'complet' || p === 'discret' ? p : 'discret';
}
/* Un son de ce niveau de célébration a-t-il le droit de sonner maintenant ? */
function _sonOk(niveau){
  const m = _sonMode();
  if (m === 'off') return false;
  if (typeof document !== 'undefined' && document.hidden) return false;
  if (m === 'discret' && (niveau || 1) > 2) return false;
  return true;
}
/* Gain final : plafonné à 0,08 en mode discret, à 0,18 pour les célébrations. */
function _sonVol(v, niveau){
  const m = _sonMode();
  if (m === 'discret') return Math.min(v, .08);
  return (niveau || 1) >= 3 ? Math.min(v, .18) : v;
}

/* Joue une note. o : {type, dur, vol, delay, slide, niveau}. */
function tone(f, o){
  o = o || {};
  const niveau = o.niveau || 1;
  if (!_sonOk(niveau)) return;
  try {
    const c = audio(); if (!c) return;
    const t = c.currentTime + (o.delay || 0), dur = o.dur || .12;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(_sonVol(o.vol || .12, niveau), t + .012);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    osc.connect(g); g.connect(c.destination); osc.start(t); osc.stop(t + dur + .05);
  } catch(e){}
}

/* Palette sonore complète (DESIGN-SPEC §8). Aucun buzzer : l'erreur est une note grave et douce. */
const snd = {
  /* Clic d'interface, très court. */
  click: () => tone(660, {dur:.05, vol:.06, niveau:1}),
  /* Réponse juste : deux notes qui montent. */
  good: () => { tone(660, {dur:.09, vol:.12, niveau:1}); tone(880, {dur:.12, vol:.12, delay:.07, niveau:1}); },
  /* Réponse fausse : une seule note grave, sans glissando ni dent de scie. */
  bad: () => tone(220, {type:'triangle', dur:.12, vol:.08, niveau:1}),
  /* Apparition d'un élément. */
  pop: () => tone(520, {slide:800, dur:.09, vol:.1, niveau:2}),
  /* Tic très court : toast de niveau 2, rappel coché. */
  tic: () => tone(1200, {dur:.03, vol:.05, niveau:2}),
  /* Arpège de jalon : Do, Mi, Sol (3 notes) ou Do, Mi, Sol, Do, Mi (5 notes). */
  arpege(n){
    const notes = (n >= 5 ? [523, 659, 784, 1047, 1319] : n >= 4 ? [523, 659, 784, 1047] : [523, 659, 784]).slice(0, Math.max(2, n || 3));
    notes.forEach((f, i) => tone(f, {dur:.16, vol:.15, delay:i * .07, niveau:3}));
  },
  /* Accord tenu du verrouillage à 90 %. */
  accord(){ [523, 659, 784].forEach(f => tone(f, {dur:.4, vol:.09, niveau:4})); },
  /* Drapeau planté au camp. */
  plant: () => tone(110, {type:'triangle', dur:.2, vol:.12, niveau:5}),
  /* Alias historique : arpège gradué selon la proportion de réussite p (0 à 1). */
  win(p){ snd.arpege(p >= 1 ? 5 : p >= .8 ? 4 : p >= .5 ? 3 : 2); }
};

/* Haptique : uniquement si le navigateur la propose vraiment et si le réglage l'autorise. */
function vibrer(motif){
  try {
    if (typeof S !== 'undefined' && S.prefs && S.prefs.haptique === false) return false;
    if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') return false;
    return navigator.vibrate(motif == null ? 10 : motif);
  } catch(e){ return false; }
}

/* Neige de célébration : 40 flocons blancs qui tombent pendant 2 s. Jamais de confettis de fête.
   Réservée aux camps et au sommet ; ne fait rien en mouvement réduit. */
function confetti(fort){
  if (REDUCE) return;
  let cv = document.getElementById('confetti');
  if (!cv){ cv = document.createElement('canvas'); cv.id = 'confetti'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv); }
  cv.hidden = false;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.floor(innerWidth * dpr); cv.height = Math.floor(innerHeight * dpr);
  const g = cv.getContext('2d');
  if (!g) return;
  g.scale(dpr, dpr);
  const lire = n => { try { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); } catch(e){ return ''; } };
  const blanc = lire('--snow') || '#FFFFFF';
  const n = fort ? 60 : 40;
  const P = Array.from({length: n}, () => ({
    x: Math.random() * innerWidth, y: -10 - Math.random() * innerHeight * .5,
    vx: (Math.random() - .5) * .5, vy: .9 + Math.random() * 1.4,
    r: 1.4 + Math.random() * 1.2, a: .35 + Math.random() * .5, ph: Math.random() * Math.PI * 2
  }));
  const t0 = performance.now();
  (function boucle(t){
    const dt = t - t0;
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P){
      p.ph += .03; p.x += p.vx + Math.sin(p.ph) * .3; p.y += p.vy;
      g.globalAlpha = p.a * Math.max(0, 1 - dt / 2000);
      g.fillStyle = blanc;
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    if (dt < 2000) requestAnimationFrame(boucle);
    else { g.clearRect(0, 0, innerWidth, innerHeight); cv.hidden = true; }
  })(t0);
}
