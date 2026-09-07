/* ===== Maths · De zéro au sommet — système d'interface =====
   Registre de minuteries, bus d'événements, toasts, feuilles modales, anneaux,
   ligne de crête, contexte de page, célébrations graduées, états vides.
   Script classique : portée globale partagée (ordre de chargement dans index.html). */
'use strict';

/* ============================================================
   0. Bus d'événements (PRODUCT-SPEC M1)
   ============================================================ */
const bus = new Map();
function ecouter(type, fn){
  if (typeof fn !== 'function') return () => {};
  if (!bus.has(type)) bus.set(type, new Set());
  bus.get(type).add(fn);
  return () => { const s = bus.get(type); if (s) s.delete(fn); };
}
function emettre(type, payload){
  const s = bus.get(type);
  if (s) for (const fn of Array.from(s)){ try { fn(payload, type); } catch(e){ console.warn('[bus]', type, e); } }
  const t = bus.get('*');
  if (t) for (const fn of Array.from(t)){ try { fn(payload, type); } catch(e){} }
}
/* alias historiques attendus par les specs (propriétés de window : jamais de redéclaration) */
window.emit = emettre;
window.on = ecouter;
window.off = function(type, fn){ const s = bus.get(type); if (s) s.delete(fn); };

/* ============================================================
   1. Registre de minuteries et nettoyeurs (DESIGN-SPEC §5.6)
   Corrige le bug des chronos fantômes : plus aucune vue quittée
   ne peut réécrire l'écran d'une autre.
   ============================================================ */
const TIMERS = new Set();
let _uiNettoyeurs = [];          // rempli par surQuitter() (core/routeur.js)
let _uiPauseToast = false;       // posé par nav() pendant une transition de vue

function every(ms, fn){
  const id = setInterval(fn, ms);
  TIMERS.add(id);
  return id;
}
function after(ms, fn){
  const id = setTimeout(() => { TIMERS.delete(id); fn(); }, ms);
  TIMERS.add(id);
  return id;
}
function teardown(){
  for (const id of TIMERS){ clearInterval(id); clearTimeout(id); }
  TIMERS.clear();
  const liste = _uiNettoyeurs;
  _uiNettoyeurs = [];
  liste.forEach(fn => { try { fn(); } catch(e){} });
  window.ASSIST_CTX = null;
  window.MODE_EXAMEN = false;
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  setCtx('home');
}

/* ============================================================
   2. Petits utilitaires internes
   ============================================================ */
function _uiSon(nom, arg){ try { if (window.snd && typeof snd[nom] === 'function') snd[nom](arg); } catch(e){} }
function _uiVibrer(motif){
  try {
    if (typeof S !== 'undefined' && S.prefs && S.prefs.haptique === false) return;
    if (typeof vibrer === 'function') vibrer(motif);
    else if ('vibrate' in navigator) navigator.vibrate(motif);
  } catch(e){}
}
function _uiReduit(){
  try {
    if (document.documentElement.dataset.motion === 'reduit') return true;
    if (typeof REDUCE !== 'undefined' && REDUCE) return true;
  } catch(e){}
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function _uiEsc(s){ return (typeof esc === 'function') ? esc(s) : String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function _uiIc(nom, taille){ return '<svg class="ic ic-' + (taille || 20) + '" aria-hidden="true" focusable="false"><use href="#i-' + nom + '"/></svg>'; }
let _uiSeq = 0;
const _uiActions = new Map();    // id de bouton → fonction (états vides, toasts rendus en HTML)
document.addEventListener('click', e => {
  const b = e.target && e.target.closest ? e.target.closest('[data-ui-act]') : null;
  if (!b) return;
  const fn = _uiActions.get(b.getAttribute('data-ui-act'));
  if (fn){ _uiSon('click'); fn(e); }
});

/* Annonce au lecteur d'écran (PRODUCT-SPEC M14) : une seule région #statut. */
function _uiAnnoncer(texte){
  const el = document.getElementById('statut');
  if (!el || !texte) return;
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = String(texte); });
}
window.annoncer = _uiAnnoncer;

/* ============================================================
   3. Toasts (DESIGN-SPEC §6.23)
   ============================================================ */
const _uiFileToast = [];
let _uiToastActif = null;
const _uiToastIcones = {info:'info', ok:'check-circle', ko:'warning-circle', gold:'flag', glacier:'clock-countdown'};

function toast(texte, opts){
  const o = opts || {};
  if (!texte) return;
  if (_uiFileToast.length >= 3) return;                 // au-delà de 3 en attente : abandon
  _uiFileToast.push({texte: String(texte), tone: o.tone || 'info', icon: o.icon,
                     ms: o.action ? 0 : (typeof o.ms === 'number' ? o.ms : 3000), action: o.action || null});
  _uiToastSuivant();
}
function _uiToastSuivant(){
  if (_uiToastActif || _uiPauseToast || !_uiFileToast.length) return;
  const conteneur = document.getElementById('toasts');
  if (!conteneur) { _uiFileToast.length = 0; return; }
  const t = _uiFileToast.shift();
  const el = document.createElement('div');
  el.className = 'toast';
  el.dataset.tone = t.tone;
  el.setAttribute('role', t.tone === 'ko' ? 'alert' : 'status');
  const nomIc = t.icon || _uiToastIcones[t.tone] || 'info';
  el.innerHTML = _uiIc(nomIc, 20) + '<span>' + _uiEsc(t.texte) + '</span>' +
    (t.action ? '<button class="btn sm" type="button" data-toast-act>' + _uiEsc(t.action.label) + '</button>' : '');
  conteneur.appendChild(el);
  _uiToastActif = el;
  _uiAnnoncer(t.texte);
  let ferme = false;
  const fermer = () => {
    if (ferme) return; ferme = true;
    el.classList.add('out');
    setTimeout(() => { el.remove(); if (_uiToastActif === el) _uiToastActif = null; _uiToastSuivant(); }, _uiReduit() ? 80 : 140);
  };
  if (t.action){
    const b = el.querySelector('[data-toast-act]');
    b.addEventListener('click', ev => { ev.stopPropagation(); fermer(); try { t.action.fn(); } catch(e){} });
  }
  el.addEventListener('click', fermer);
  if (t.ms > 0) setTimeout(fermer, t.ms);              // hors registre : un toast survit au changement de vue
}

/* ============================================================
   4. Feuille modale et dialogue (DESIGN-SPEC §6.22)
   Remplace tous les dialogues natifs du navigateur.
   ============================================================ */
const _uiFileFeuille = [];
let _uiFeuilleActive = null;

function ouvrirFeuille(o){
  return new Promise(resolve => {
    _uiFileFeuille.push({o: o || {}, resolve});
    _uiFeuilleSuivante();
  });
}
function _uiFeuilleSuivante(){
  if (_uiFeuilleActive || !_uiFileFeuille.length) return;
  const {o, resolve} = _uiFileFeuille.shift();
  const hote = document.getElementById('sheets') || document.body;
  const declencheur = document.activeElement;
  const uid = 'sh-' + (++_uiSeq);
  const boutons = (o.boutons && o.boutons.length) ? o.boutons : [{label:'Fermer'}];
  /* index du bouton secondaire : le premier non primaire / non danger, sinon 0 */
  let iSec = boutons.findIndex(b => !b.style || b.style === 'secondaire');
  if (iSec < 0) iSec = 0;

  const dlg = document.createElement('dialog');
  dlg.className = 'sheet' + (o.classe ? ' ' + o.classe : '');
  dlg.id = uid;
  if (o.titre) dlg.setAttribute('aria-labelledby', uid + '-t');
  else if (o.aria) dlg.setAttribute('aria-label', o.aria);
  dlg.innerHTML =
    '<div class="sheet-grip" aria-hidden="true"></div>' +
    (o.titre ? '<h2 id="' + uid + '-t">' + _uiEsc(o.titre) + '</h2>' : '') +
    (o.texte ? '<p class="ink-2">' + _uiEsc(o.texte) + '</p>' : '') +
    (o.contenu ? '<div class="sheet-body">' + o.contenu + '</div>' : '') +
    '<div class="sheet-actions">' + boutons.map((b, i) =>
      '<button class="btn lg' + (b.style === 'primaire' ? ' btn-primary' : b.style === 'danger' ? ' btn-danger' : '') +
      '" type="button" data-i="' + i + '">' + _uiEsc(b.label) + '</button>').join('') + '</div>';
  hote.appendChild(dlg);
  _uiFeuilleActive = dlg;

  let fini = false;
  const terminer = i => {
    if (fini) return; fini = true;
    const b = boutons[i];
    try { dlg.close(); } catch(e){}
    dlg.remove();
    _uiFeuilleActive = null;
    try { if (declencheur && declencheur.focus && document.contains(declencheur)) declencheur.focus(); } catch(e){}
    if (b && typeof b.fn === 'function'){ try { b.fn(); } catch(e){} }
    resolve(i);
    _uiFeuilleSuivante();
  };
  dlg._uiTerminer = terminer;
  dlg._uiSec = iSec;
  dlg.querySelectorAll('.sheet-actions [data-i]').forEach(b =>
    b.addEventListener('click', () => { _uiSon('click'); terminer(Number(b.dataset.i)); }));
  dlg.addEventListener('cancel', e => { e.preventDefault(); terminer(iSec); });   // Échap → bouton secondaire

  /* glisser vers le bas (> 80 px) ferme, sur écran tactile */
  let y0 = null;
  dlg.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, {passive: true});
  dlg.addEventListener('touchend', e => {
    if (y0 === null) return;
    const dy = (e.changedTouches[0] ? e.changedTouches[0].clientY : y0) - y0;
    y0 = null;
    if (dy > 80) terminer(iSec);
  }, {passive: true});

  try { dlg.showModal(); } catch(e){ dlg.setAttribute('open', ''); }
  if (typeof o.apres === 'function'){ try { o.apres(dlg); } catch(e){} }
  const cible = dlg.querySelector('[data-focus]') || dlg.querySelectorAll('.sheet-actions [data-i]')[iSec];
  if (cible) try { cible.focus(); } catch(e){}
}
function fermerFeuille(i){
  const dlg = _uiFeuilleActive;
  if (!dlg || !dlg._uiTerminer) return;
  dlg._uiTerminer(typeof i === 'number' ? i : dlg._uiSec);
}
function confirmer(titre, texte, o){
  const opt = o || {};
  return ouvrirFeuille({
    titre, texte,
    classe: opt.classe,
    boutons: [{label: opt.annuler || 'Annuler'}, {label: opt.valider || 'Continuer', style: opt.danger ? 'danger' : 'primaire'}]
  }).then(i => i === 1);
}
/* alias de la signature du PRODUCT-SPEC M2 (propriété de window, aucune redéclaration) */
window.sheet = ouvrirFeuille;

/* ============================================================
   5. Anneau de progression (DESIGN-SPEC §6.7)
   ============================================================ */
function ringSVG(o){
  const c = o || {};
  const val = Number(c.val) || 0, max = Number(c.max) || 1, taille = c.taille || 48;
  const p = Math.max(0, Math.min(100, Math.round(100 * val / (max || 1))));
  const plein = p >= 100;
  const classes = ['ring', 'allow-motion'];
  if (c.ton) classes.push(c.ton);
  if (plein) classes.push('full');
  if (val > max) classes.push('over');
  const texte = c.texte === false ? '' :
    (plein && c.check !== false
      ? '<use class="ring-ic" href="#i-check" x="18" y="18" width="12" height="12"/>'
      : '<text class="ring-txt num" x="24" y="24">' + _uiEsc(c.texte != null ? c.texte : val) + '</text>');
  return '<svg class="' + classes.join(' ') + '" viewBox="0 0 48 48" width="' + taille + '" height="' + taille + '"' +
    ' role="progressbar" aria-valuenow="' + val + '" aria-valuemin="0" aria-valuemax="' + max + '"' +
    ' aria-valuetext="' + _uiEsc(c.libelle || (val + ' sur ' + max)) + '" style="--p:' + p + '">' +
    '<circle class="track" cx="24" cy="24" r="20" pathLength="100"/>' +
    '<circle class="val" cx="24" cy="24" r="20" pathLength="100"/>' + texte + '</svg>';
}

/* ============================================================
   6. Ligne de crête (DESIGN-SPEC §6.9)
   ============================================================ */
const _uiCreteD = 'M0,18 L60,12 L90,16 L120,8 L150,13 L180,5 L210,10 L240,3 L265,9 L292,4 L308,8 L322,2 L340,6 L360,0';
function creteSVG(){
  const hote = document.getElementById('crete');
  if (!hote || hote.querySelector('.crete-svg')) return;
  hote.innerHTML =
    '<svg class="crete-svg" viewBox="0 0 360 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="crete-clip"><rect id="crete-clip-rect" x="0" y="0" width="0" height="24"/></clipPath></defs>' +
      '<path id="crete-fill" class="crete-fill" d="M0,24 L0,18 L60,12 L90,16 L120,8 L150,13 L180,5 L210,10 L240,3 L265,9 L292,4 L308,8 L322,2 L340,6 L360,0 L360,24 Z" clip-path="url(#crete-clip)"/>' +
      '<path id="crete-line" class="crete-line" d="' + _uiCreteD + '"/>' +
      '<circle id="crete-dot" class="crete-dot" r="3" cx="0" cy="18"/>' +
    '</svg>';
  majCrete();
}
function majCrete(alt){
  const ligne = document.getElementById('crete-line');
  const rect = document.getElementById('crete-clip-rect');
  const dot = document.getElementById('crete-dot');
  if (!ligne || !rect || !dot) return;
  let a = alt;
  if (typeof a !== 'number'){ try { a = altitude(); } catch(e){ a = 0; } }
  const sommet = (typeof SOMMET === 'number' && SOMMET) ? SOMMET : 4810;
  const frac = Math.max(0, Math.min(1, a / sommet));
  rect.setAttribute('width', String(frac * 360));
  try {
    const p = ligne.getPointAtLength(frac * ligne.getTotalLength());
    dot.setAttribute('cx', String(p.x));
    dot.setAttribute('cy', String(p.y));
  } catch(e){ dot.setAttribute('cx', String(frac * 360)); }
  /* teinte de la phase courante, si la pédagogie sait la donner */
  try {
    const f = (typeof frontier === 'function') ? frontier() : null;
    const ph = f && f.phase ? Math.min(7, Math.max(1, f.phase)) : 1;
    const c = document.getElementById('crete');
    if (c) c.style.setProperty('--tint', 'var(--tint-' + ph + ')');
  } catch(e){}
}

/* ============================================================
   7. Anneau du jour dans l'en-tête (DESIGN-SPEC §6.8)
   ============================================================ */
function majAnneauJour(){
  const hote = document.getElementById('ring-day');
  if (!hote) return;
  let ok = 0, obj = 25;
  try {
    const j = jToday();
    ok = j.ok || 0;
    obj = (typeof objectifJour === 'function' ? objectifJour() : (j.obj || (S.profil && S.profil.objectif) || 25));
  } catch(e){}
  hote.setAttribute('aria-label', 'Objectif du jour : ' + ok + ' sur ' + obj);
  hote.innerHTML = ringSVG({val: ok, max: obj, taille: 40, texte: false,
                            libelle: 'Objectif du jour : ' + ok + ' sur ' + obj}) +
                   '<span class="num">' + ok + '</span>';
}

/* ============================================================
   8. Contexte de page (DESIGN-SPEC §5.7)
   ============================================================ */
let _uiCtx = {ctx: 'home', onQuit: null, parent: null};
function setCtx(ctx, opts){
  const o = opts || {};
  const c = ['home', 'outil', 'lecon', 'parcours', 'plein'].indexOf(ctx) >= 0 ? ctx : 'home';
  _uiCtx = {ctx: c, onQuit: o.onQuit || null, parent: o.parent || null};
  document.body.dataset.ctx = c;

  const parcours = (c === 'parcours'), lecon = (c === 'lecon'), plein = (c === 'plein');
  const el = id => document.getElementById(id);
  const montre = (id, v) => { const n = el(id); if (n) n.hidden = !v; };

  montre('btn-quit', parcours || plein);
  montre('btn-back', lecon);
  montre('btn-pause', parcours && !!o.pause);
  montre('head-title', (parcours || lecon) && !!o.title);
  montre('head-count', parcours && o.count != null);
  const ht = el('head-title'); if (ht && o.title) ht.textContent = o.title;
  const hc = el('head-count'); if (hc && o.count != null) hc.textContent = String(o.count);

  const anneau = el('ring-day');
  if (anneau) anneau.hidden = parcours || plein;
  const tb = el('tabbar'); if (tb) tb.classList.toggle('away', parcours || plein);
  const fab = el('assist-fab');
  if (fab){
    let veut = (parcours || lecon);
    try { if (typeof S !== 'undefined' && S.prefs && S.prefs.prof === false) veut = false; } catch(e){}
    fab.hidden = !veut;
  }
  if (!parcours) majAnneauJour();
}

/* ============================================================
   9. Onglet actif (DESIGN-SPEC §5.5)
   ============================================================ */
function syncNav(v){
  document.querySelectorAll('.tabbar [data-v], .topnav [data-v]').forEach(a => {
    if (a.dataset.v === v) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

/* ============================================================
   10. Compteur animé (rAF, DESIGN-SPEC §6.9 et §8 n° 6)
   ============================================================ */
function compteur(el, de, a, ms){
  if (!el) return;
  const fin = Number(a) || 0, debut = Number(de) || 0;
  const format = n => { try { return (typeof nf === 'function') ? nf(Math.round(n)) : String(Math.round(n)); } catch(e){ return String(Math.round(n)); } };
  if (_uiReduit() || debut === fin){ el.textContent = format(fin); return; }
  const duree = ms || 800, t0 = performance.now();
  const pas = now => {
    const p = Math.min(1, (now - t0) / duree);
    const e = 1 - Math.pow(1 - p, 3);                 // ease-out cubique
    el.textContent = format(debut + (fin - debut) * e);
    if (p < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}

/* ============================================================
   11. État vide (DESIGN-SPEC §6.25) et squelette (§6.26)
   ============================================================ */
function vide(o){
  const c = o || {};
  let visuel = '';
  if (c.illus) visuel = '<svg class="illus" aria-hidden="true" focusable="false"><use href="#' + _uiEsc(c.illus) + '"/></svg>';
  else if (c.icone) visuel = _uiIc(c.icone, 40);
  let action = '';
  if (c.action && c.action.label){
    const id = 'act-' + (++_uiSeq);
    if (typeof c.action.fn === 'function') _uiActions.set(id, c.action.fn);
    action = '<button class="btn" type="button" data-ui-act="' + id + '"' +
             (c.action.id ? ' id="' + _uiEsc(c.action.id) + '"' : '') + '>' + _uiEsc(c.action.label) + '</button>';
  }
  return '<div class="empty">' + visuel +
    (c.titre ? '<h2>' + _uiEsc(c.titre) + '</h2>' : '') +
    (c.texte ? '<p class="ink-2">' + _uiEsc(c.texte) + '</p>' : '') + action + '</div>';
}
function squelette(n){
  const blocs = Math.max(1, Number(n) || 2);
  let h = '<div class="skeleton" aria-hidden="true"><div class="sk sk-line w-60"></div><div class="sk sk-line"></div>';
  for (let i = 0; i < blocs; i++) h += '<div class="sk sk-block"></div>';
  return h + '</div>';
}

/* ============================================================
   12. Célébrations graduées (PRODUCT-SPEC M2)
   Niveau 1 juste · 1b faux · 2 toast court · 3 toast palier
   · 4 verrou · 5 plein écran.
   ============================================================ */
let _uiDernierHaut = 0;              // horodatage du dernier niveau ≥ 3
const _uiFileCeleb = [];

function celebrer(niveau, payload){
  const n = Number(niveau) || 1, p = payload || {};
  const examen = !!(window.MODE_EXAMEN) && n >= 1 && n <= 4;
  if (examen) return;                                   // différé à la correction

  if (n === 1){ _uiSon('good'); _uiVibrer(10); return; }
  if (n === 0){ _uiSon('bad'); return; }                // 1b : faux, aucune haptique
  if (n === 2){
    _uiSon('tic');
    if (p.texte) toast(p.texte, {tone: p.tone || 'info', icon: p.icon, ms: p.ms || 3000, action: p.action});
    return;
  }
  /* niveaux 3 et plus : jamais deux en moins de 3 s */
  const maintenant = Date.now();
  const attente = Math.max(0, 3000 - (maintenant - _uiDernierHaut));
  if (attente > 0 && _uiFileCeleb.length < 4){
    _uiFileCeleb.push({n, p});
    if (_uiFileCeleb.length === 1) setTimeout(_uiCelebSuivante, attente + 20);
    return;
  }
  _uiCelebJouer(n, p);
}
function _uiCelebSuivante(){
  if (!_uiFileCeleb.length) return;
  const {n, p} = _uiFileCeleb.shift();
  _uiCelebJouer(n, p);
  if (_uiFileCeleb.length) setTimeout(_uiCelebSuivante, 3020);
}
function _uiCelebJouer(n, p){
  _uiDernierHaut = Date.now();
  if (n === 3){
    _uiSon('arpege', 3); _uiVibrer([20, 40, 20]);
    if (p.texte) toast(p.texte, {tone: p.tone || 'gold', icon: p.icon, ms: p.ms || 3000, action: p.action});
    _uiPulse(p.cible);
    return;
  }
  if (n === 4){
    _uiSon('arpege', 3); _uiSon('accord'); _uiVibrer([20, 40, 20]);
    toast(p.texte || 'Verrouillé à 90 %.', {tone: 'gold', icon: 'lock-simple', ms: 3000});
    _uiPulse(p.cible);
    _uiAnnoncer(p.texte || 'Compétence verrouillée.');
    return;
  }
  plein(p);
}
function _uiPulse(el){
  if (!el || _uiReduit() || !el.classList) return;
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
  setTimeout(() => el.classList.remove('pulse'), 520);
}

/* Célébration plein écran (niveau 5) : camp, sommet, série de 30. */
function plein(o){
  const c = o || {};
  const hote = document.getElementById('fullscreens') || document.body;
  const dlg = document.createElement('dialog');
  dlg.className = 'fin-card';
  dlg.dataset.kind = c.kind || 'camp';
  dlg.setAttribute('aria-labelledby', 'fin-t');
  dlg.innerHTML =
    (c.medaille ? '<span class="medaillon" aria-hidden="true">' + _uiIc(c.medaille, 40) + '</span>' : '') +
    (c.overline ? '<p class="k k-gold">' + _uiEsc(c.overline) + '</p>' : '') +
    '<h2 id="fin-t">' + _uiEsc(c.titre || 'Camp atteint.') + '</h2>' +
    (c.texte ? '<p class="ink-2">' + _uiEsc(c.texte) + '</p>' : '') +
    (c.alt != null ? '<p class="display-xl alt-label"><span class="num-val">' + _uiEsc(c.alt) + '</span><span class="unit">m</span></p>' : '') +
    '<div class="sheet-actions"><button class="btn-primary lg" type="button" data-fermer>' + _uiEsc(c.bouton || 'Continuer') + '</button></div>';
  hote.appendChild(dlg);
  const declencheur = document.activeElement;
  const fermer = () => {
    try { dlg.close(); } catch(e){}
    dlg.remove();
    try { if (declencheur && declencheur.focus && document.contains(declencheur)) declencheur.focus(); } catch(e){}
    if (typeof c.apres === 'function'){ try { c.apres(); } catch(e){} }
  };
  dlg.querySelector('[data-fermer]').addEventListener('click', () => { _uiSon('click'); fermer(); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); fermer(); });
  try { dlg.showModal(); } catch(e){ dlg.setAttribute('open', ''); }
  dlg.querySelector('[data-fermer]').focus();
  _uiSon('arpege', 5);
  if (c.kind === 'camp' || c.kind === 'sommet') _uiSon('plant');
  _uiVibrer([30, 60, 30, 60, 60]);
  if (!_uiReduit()){ try { if (typeof confetti === 'function') confetti(true); } catch(e){} }
  _uiAnnoncer((c.titre || '') + ' ' + (c.texte || ''));
  return dlg;
}

/* ============================================================
   13. Pastille réseau (PRODUCT-SPEC M2)
   ============================================================ */
let _uiHorsLigneSignale = false;
function _uiPastilleReseau(){
  const el = document.getElementById('reseau');
  const enLigne = navigator.onLine !== false;
  if (el) el.hidden = enLigne;
  if (!enLigne && !_uiHorsLigneSignale){
    _uiHorsLigneSignale = true;
    toast('Hors ligne. Tout continue de fonctionner, la sauvegarde GitHub attendra.', {tone: 'info', icon: 'wifi-slash'});
  }
  if (enLigne && _uiHorsLigneSignale){
    _uiHorsLigneSignale = false;
    let attendait = false;
    try { attendait = !!dernierEchec; } catch(e){}
    try { if (typeof lancerSync === 'function') lancerSync(); } catch(e){}
    if (attendait) toast('Connexion retrouvée. Sauvegarde envoyée.', {tone: 'ok', icon: 'cloud-check'});
  }
}
window.pastilleReseau = _uiPastilleReseau;

/* Passerelle nommée attendue par les specs pour les célébrations. */
window.fx = {celebrer: celebrer, plein: plein};
