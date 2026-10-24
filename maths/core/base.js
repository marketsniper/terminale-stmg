/* ===== Maths · De zéro au sommet : socle : utilitaires, constantes, phases, icônes =====
   Script classique : portée globale partagée avec les autres modules (ordre de chargement dans index.html).
   Ce fichier déclare : $, esc, R, JOUR, todayKey, PHASES, DATE_CONCOURS, DATE_BAC, SOMMET, fv, nf, ic, chargerSprite. */
'use strict';

/* ---------- sélection et échappement ---------- */
/* Raccourci document.getElementById. */
const $ = id => document.getElementById(id);
/* Échappe les caractères dangereux avant injection dans du HTML. */
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- hasard (avec variante reproductible pour le mode présentation) ---------- */
const R = {
  /* Entier aléatoire entre a et b inclus. */
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  /* Élément au hasard dans un tableau. */
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  /* Copie mélangée d'un tableau (Fisher-Yates). */
  shuffle(arr){ const c = arr.slice(); for (let i = c.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; },
  /* Générateur reproductible (mulberry32) : même graine, même suite de questions. */
  seed(n){
    let a = (n >>> 0) || 1;
    const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const g = {
      alea: rnd,
      int: (x, y) => x + Math.floor(rnd() * (y - x + 1)),
      pick: arr => arr[Math.floor(rnd() * arr.length)],
      shuffle(arr){ const c = arr.slice(); for (let i = c.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }
    };
    return g;
  }
};

/* ---------- temps ---------- */
const JOUR = 86400000;
/* Clé de journal « AAAA-MM-JJ » en heure locale. */
const todayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

/* ---------- phases et sommet ----------
   Le camp indiqué est celui que l'on atteint EN FIN de phase (PRODUCT-SPEC §8.2). */
const PHASES = {
  1:{nom:'Fondations (6e-5e)',        camp:'Camp 1'},
  2:{nom:'Collège complet (4e-3e)',   camp:'Camp 2'},
  3:{nom:'Seconde',                   camp:'Camp 3'},
  4:{nom:'Première STMG',             camp:'Camp 4'},
  5:{nom:'Terminale et concours',     camp:'Camp 5'},
  6:{nom:'Sprint concours',           camp:'Camp 6'},
  7:{nom:'Objectif bac',              camp:'Sommet'}
};
/* Replis : les vraies dates vivent dans S.profil.concours / S.profil.bac (M12). */
const DATE_CONCOURS = new Date(2027, 3, 10);
const DATE_BAC = new Date(2027, 5, 14);
const SOMMET = 4810;                            // mètres : le Mont Blanc

/* Version d'application (miroir du CACHE de sw.js). Exposée sans déclaration lexicale
   pour ne jamais entrer en collision avec un autre module. */
window.APP_VERSION = '2.0.0';

/* ---------- nombres au format français ----------
   Virgule décimale, espace fine insécable U+202F pour les milliers, vrai signe moins U+2212. */
function fv(x, dec){
  if (x === null || x === undefined || x === '') return '';
  let n = typeof x === 'number' ? x : parseFloat(String(x).replace(/ | |\s/g, '').replace(',', '.'));
  if (typeof n !== 'number' || !isFinite(n)) return String(x);
  if (dec !== undefined && dec !== null) n = Number(n.toFixed(dec));
  const negatif = n < 0 || Object.is(n, -0);
  let s = Math.abs(n).toString();
  if (/e/i.test(s)) s = Math.abs(n).toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
  const part = s.split('.');
  part[0] = part[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (negatif ? '−' : '') + part[0] + (part[1] ? ',' + part[1] : '');
}
/* Nombre suivi d'une unité, séparés par une espace fine insécable : nf(1240,'m') = « 1 240 m ». */
function nf(n, unite, dec){ const t = fv(n, dec); return unite ? t + ' ' + unite : t; }

/* ---------- icônes (sprite Phosphor, DESIGN-SPEC §4.1) ---------- */
/* Rend un <svg> qui pointe vers le symbole #i-<nom> du sprite. */
function ic(nom, cls){
  const c = cls ? 'ic ' + cls : 'ic';
  return '<svg class="' + c + '" aria-hidden="true" focusable="false"><use href="#i-' + nom + '"/></svg>';
}

/* Injecte icons.svg et illus.svg en tête de <body>.
   Ne rejette jamais et ne fait jamais attendre le premier rendu plus de 1 500 ms. */
function chargerSprite(){
  const poser = txt => {
    if (!txt) return;
    const cible = document.body || document.documentElement;
    try { cible.insertAdjacentHTML('afterbegin', txt); } catch(e){}
  };
  const un = f => fetch(f).then(r => (r && r.ok) ? r.text() : '').then(poser).catch(() => {});
  const tout = Promise.all([un('icons.svg'), un('illus.svg')]).then(() => true, () => true);
  const limite = new Promise(res => setTimeout(() => res(false), 1500));
  return Promise.race([tout, limite]).then(() => true, () => true);
}

/* ---------- catalogue des compétences ---------- */
if (typeof SKILLS !== 'undefined' && Array.isArray(SKILLS)) SKILLS.sort((a, b) => a.phase - b.phase || a.ordre - b.ordre);
