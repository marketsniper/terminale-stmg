/* ===== Maths · Objectif Albert School : alb-17 · Écriture décimale : 10a + b, chiffres, palindromes =====
   Piste séparée window.ALBERT_SKILLS (jamais SKILLS). Une IIFE, aucun symbole de premier niveau.
   Idée centrale : écrire le nombre avec ses chiffres (10a + b, 100a + 10b + c), traduire l'énoncé en condition
   sur les chiffres, puis lister. Toutes les réponses sont CALCULÉES par le code (énumération des chiffres,
   formules de position) ; le vérificateur indépendant les recalcule par force brute sur les nombres eux-mêmes.
   Sous-types :
     N1 : somme des chiffres de 10ⁿ − 1 ; nombres à deux chiffres de somme donnée ; effet du renversement (9 × écart) ;
          chiffres pour numéroter de 1 à N (N < 100) ; nombre de fois qu'on écrit un chiffre (1 à N ≤ 100) ;
          palindromes à trois chiffres dans une tranche.
     N2 : nombre égal à k fois la somme de ses chiffres (ou son chiffre des dizaines, ou qui la dépasse de m) ;
          nombres qui augmentent ou diminuent de 9d quand on les renverse ; produit des chiffres donné ;
          pages de 1 à N (N < 1 000) ; prochaine année ou prochain kilométrage palindrome ; somme des chiffres de 10ⁿ − k ;
          dénombrement de palindromes (total, pairs, multiples de 5, tranches, somme des chiffres).
     N3 : équations sur les chiffres (somme, unités, produit, somme + produit) ; somme d'un nombre et de son renversé ;
          palindromes divisibles par 2, 3, 9 ou 11 ; somme des chiffres de 10ⁿ − m ; nombre de pages à partir du
          nombre de chiffres ; k-ième chiffre de 123456789101112… (zone à deux chiffres) ; trois chiffres de petite somme.
     N4 : renversement d'un nombre à trois chiffres (99 × écart) ; produit de trois chiffres ; « au moins un chiffre d » ;
          somme des chiffres de 99…9 × k ; k-ième chiffre (zone à trois chiffres) ; carrés de 11…1 ; blocs répétés
          (abab, abcabc, ababab, aaa, aabb) ; palindromes divisibles par 4, 6, 11 ou 99 ; somme des chiffres de 1 à N.
     N5 : trois chiffres de grande somme ; trois chiffres égaux à k fois la somme de leurs chiffres ; palindromes à cinq
          ou six chiffres divisibles par 3, 4, 9, 11 ou 25 ; k-ième chiffre lointain ; pages à quatre chiffres ;
          nombre de fois qu'on écrit un chiffre de 1 à N ≤ 1 000 ; nombre + renversé multiple de m ou carré, différence
          carrée ou cubique ; somme de tous les chiffres de 1 à N (N à trois chiffres).
   N'utilise que R.int, R.pick, R.shuffle. Niveau inconnu : borné. gen ne lève jamais d'exception. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (recopiées de la référence alb-01) ---------- */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
function qcm(bonne, autres, voisin){
  const vus = new Set([norm(bonne)]), ch = [bonne];
  const ajouter = c => { if (ch.length < 4 && c != null && c !== '' && !vus.has(norm(c))){ vus.add(norm(c)); ch.push(String(c)); } };
  autres.forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 60; k++) ajouter(voisin(k));
  return ch;
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));

/* ---------- outils sur l'écriture des nombres ---------- */
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const sup = n => String(n).split('').map(c => SUP[+c]).join('');
const P10 = n => '10' + sup(n);
function ds(n){ let s = 0; n = Math.abs(Math.round(n)); while (n > 0){ s += n % 10; n = Math.floor(n / 10); } return s; }
function pgcd(x, y){ x = Math.abs(x); y = Math.abs(y); while (y){ const t = x % y; x = y; y = t; } return x; }
const somme = l => l.reduce((s, x) => s + x, 0);
function enumTxt(l, mot){ l = l.map(String); return l.length < 2 ? (l[0] || '') : l.slice(0, -1).join(', ') + ' ' + (mot || 'et') + ' ' + l[l.length - 1]; }
const MOTS = {2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six'};
const cl = (c, x) => (c === 1 ? x : c + x);                       // 1 → « a », 3 → « 3a »
const somme1aN = n => { const t = []; for (let i = n; i >= 1; i--) t.push(i); return t; };
const serie = m => (m <= 3 ? somme1aN(m).reverse().join(' + ') : '1 + 2 + … + ' + m);
/* Palindromes construits par leur moitié gauche (chiffre du milieu compris). */
function miroir(g, L){ const s = String(g); return Number(s + s.slice(0, L - s.length).split('').reverse().join('')); }
function palSuivant(N){
  const L = String(N).length, h = Math.ceil(L / 2);
  let g = Number(String(N).slice(0, h));
  const c = miroir(g, L);
  if (c > N) return c;
  g++; if (String(g).length > h) return null;
  return miroir(g, L);
}
function palPrec(N){
  const L = String(N).length, h = Math.ceil(L / 2);
  let g = Number(String(N).slice(0, h));
  const c = miroir(g, L);
  if (c < N) return c;
  g--; if (String(g).length < h) return null;
  return miroir(g, L);
}
const estPal = n => String(n) === String(n).split('').reverse().join('');
function palins(L, X, Y){
  const h = Math.ceil(L / 2), p = Math.pow(10, h - 1), out = [];
  for (let g = p; g < 10 * p; g++){ const a = Math.floor(g / p); if (a >= X && a <= Y) out.push(miroir(g, L)); }
  return out;
}
const ord = k => (k === 1 ? '1er' : k + 'e');

/* Sortie QCM : bonne réponse, distracteurs [valeur, piège nommé], voisins ±1, ±2… dans [min, max]. */
function sortie(q, bonne, pieges, expl, o){
  o = o || {};
  const min = o.min == null ? 0 : o.min, max = o.max == null ? Infinity : o.max, f = o.fmt || (v => nb(v));
  const ok = (pieges || []).filter(p => p && typeof p[0] === 'number' && isFinite(p[0]) && Math.round(p[0]) === p[0] && p[0] >= min && p[0] <= max && p[0] !== bonne);
  const choix = qcm(f(bonne), ok.map(p => f(p[0])), k => { const v = bonne + (k % 2 ? (k + 1) / 2 : -k / 2); return v >= min && v <= max ? f(v) : null; });
  const txt = [], dits = new Set();
  ok.forEach(p => { const s = f(p[0]); if (p[1] && choix.indexOf(s) > 0 && !dits.has(s) && txt.length < 2){ dits.add(s); txt.push(p[1](s)); } });
  return {q: q, a: f(bonne), accept: null, choix: choix, expl: expl + (txt.length ? ' ' + txt.join(' ') : '')};
}

/* Phrases de méthode communes (première phrase de l'explication : jamais de chiffre, jamais la réponse). */
const M_EQ = 'On écrit le nombre avec ses chiffres a (dizaines) et b (unités), on traduit la phrase en équation, puis on cherche tous les couples de chiffres qui la vérifient.';
const M_EQ3 = 'On écrit le nombre avec ses trois chiffres a, b et c, on traduit la phrase en équation, puis on essaie chaque valeur du premier chiffre.';
const M_PAL = 'Un palindrome est fixé par sa première moitié (avec le chiffre du milieu s\'il y en a un) : on compte les choix de ces chiffres, le premier ne pouvant pas être zéro.';
const M_DIV = 'On traduit la divisibilité en condition sur les chiffres du palindrome, puis on compte, premier chiffre par premier chiffre, les valeurs possibles des autres chiffres.';
const M_REV = 'On compare le nombre et son renversé : leur différence vaut toujours neuf fois l\'écart entre les deux chiffres.';
const EX_PAL = {3: ['474', '818', '303', '595'], 4: ['3443', '6006', '1771', '8558'], 5: ['24742', '50305', '13531'], 6: ['125521', '400004', '738837']};
const INTRO = (L, R) => 'Un palindrome se lit de la même façon dans les deux sens, comme ' + R.pick(EX_PAL[L]) + '.';

/* ---------- tables calculées une fois ---------- */
/* Produits de deux chiffres non nuls ayant au moins deux nombres à deux chiffres. */
const P2LIST = [];
for (let p = 2; p <= 81; p++){
  const L = []; for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) if (a * b === p) L.push(10 * a + b);
  if (L.length >= 2) P2LIST.push({p: p, L: L});
}
/* Nombres à deux chiffres égaux à k fois leur chiffre des unités, ou à k fois le produit de leurs chiffres. */
function sol2(pred){ const L = []; for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) if (pred(a, b)) L.push(10 * a + b); return L; }
const K_UNITES = [], K_PRODUIT = [];
for (let k = 3; k <= 41; k++) if (sol2((a, b) => 10 * a + b === k * b).length) K_UNITES.push(k);
for (let k = 1; k <= 12; k++) if (sol2((a, b) => 10 * a + b === k * a * b).length) K_PRODUIT.push(k);
/* Nombres à trois chiffres égaux à k fois la somme de leurs chiffres (1 à 15 solutions). */
function sol3(pred){ const L = []; for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) for (let c = 0; c <= 9; c++) if (pred(a, b, c)) L.push(100 * a + 10 * b + c); return L; }
/* k retenus : équation simplifiée à petits coefficients, ou qu'un argument de divisibilité règle (c ou b imposé). */
const K3 = [19, 25, 34, 40, 55, 64, 70, 73, 82, 91].filter(k => sol3((a, b, c) => 100 * a + 10 * b + c === k * (a + b + c)).length >= 1);
/* Produits de trois chiffres non nuls avec au moins deux groupes de chiffres et un chiffre 1 dans un groupe. */
const P3LIST = [];
for (let p = 4; p <= 72; p++){
  const G = []; for (let a = 1; a <= 9; a++) for (let b = a; b <= 9; b++) for (let c = b; c <= 9; c++) if (a * b * c === p) G.push([a, b, c]);
  if (G.length >= 2 && G.some(g => g[0] === 1) && G.length <= 5) P3LIST.push({p: p, G: G});
}
const ordres = g => (g[0] === g[2] ? 1 : (g[0] === g[1] || g[1] === g[2]) ? 3 : 6);

/* =====================================================================
   NIVEAU 1
   ===================================================================== */
function n1Neuf(R){
  let n = R.int(6, 60); if (n === 20) n = 19;
  const forme = R.int(0, 1), bonne = 9 * n, P = P10(n);
  const q = forme === 0
    ? 'Quelle est la somme des chiffres du nombre ' + P + ' − 1 ?'
    : 'Quelle est la somme des chiffres du plus grand nombre entier qui s\'écrit avec ' + n + ' chiffres ?';
  const expl = (forme === 0
      ? 'Une puissance de dix diminuée de un s\'écrit uniquement avec des chiffres neuf : il suffit de compter ces neuf. ' + P + ' s\'écrit avec un 1 suivi de ' + n + ' zéros, donc ' + P + ' − 1 s\'écrit avec ' + n + ' chiffres 9 (comme 10³ − 1 = 999).'
      : 'Le plus grand nombre d\'une longueur donnée s\'écrit uniquement avec des chiffres neuf : il suffit de compter ces neuf. Le plus grand nombre à ' + n + ' chiffres s\'écrit avec ' + n + ' chiffres 9 (comme 999 pour trois chiffres).')
    + ' La somme des chiffres vaut ' + n + ' × 9 = ' + nb(bonne) + '.';
  return sortie(q, bonne, [
    [9 * (n - 1), v => 'Piège : ' + v + ' ne compte que ' + (n - 1) + ' chiffres 9, alors qu\'il y en a ' + n + '.'],
    [9 * (n + 1), v => 'Piège : ' + v + ' compte un 9 de trop' + (forme === 0 ? ' : ' + P + ' a ' + (n + 1) + ' chiffres, mais en retirant 1, le chiffre 1 de tête disparaît.' : '.')],
    [n, v => 'Piège : ' + v + ' est le nombre de chiffres, pas leur somme : on confond chiffre et nombre.']
  ], expl, {min: 1});
}

function n1SommeDeux(R){
  const s = R.int(2, 17), forme = R.int(0, 1);
  const q = forme === 0
    ? 'Combien de nombres entiers à deux chiffres ont une somme des chiffres égale à ' + s + ' ?'
    : 'Combien y a-t-il de nombres entiers de 10 à 99 dont les deux chiffres ont pour somme ' + s + ' ?';
  const L = []; for (let a = 1; a <= 9; a++){ const b = s - a; if (b >= 0 && b <= 9) L.push(10 * a + b); }
  const bonne = L.length, aMin = Math.max(1, s - 9), aMax = Math.min(9, s);
  const expl = 'On fait varier le chiffre des dizaines et on en déduit celui des unités, qui doit rester entre zéro et neuf. ' +
    'Ici le chiffre des dizaines va de ' + aMin + ' à ' + aMax + ' : ' + enumTxt(L) + '. Il y en a ' + bonne + '.';
  const pieges = s <= 9
    ? [[s + 1, v => 'Piège : ' + v + ' compte aussi « 0' + s + ' », qui n\'est pas un nombre à deux chiffres : le chiffre des dizaines ne vaut jamais 0.'],
       [s - 1, v => 'Piège : ' + v + ' oublie ' + (10 * s) + ', dont le chiffre des unités est 0.']]
    : [[s - 1, v => 'Piège : ' + v + ' fait aller le chiffre des dizaines de 1 à ' + (s - 1) + ', mais le chiffre des unités ne peut pas dépasser 9.'],
       [20 - s, v => 'Piège : ' + v + ' compte une valeur de trop : de ' + aMin + ' à 9, il y a 9 − ' + aMin + ' + 1 = ' + bonne + ' valeurs.']];
  return sortie(q, bonne, pieges, expl, {min: 1});
}

function n1Renverse(R){
  const forme = R.int(0, 2);
  let q, d, ex = '', formule;
  if (forme < 2){
    d = R.int(1, 8);
    const x = R.int(1, 9 - d), y = x + d;                 // y > x : deux chiffres non nuls pour l'exemple
    if (forme === 0){
      q = 'Dans un nombre à deux chiffres, le chiffre des dizaines dépasse de ' + d + ' le chiffre des unités. De combien ce nombre diminue-t-il quand on inverse ses deux chiffres ?';
      formule = 'Avec a pour le chiffre des dizaines et b pour celui des unités : (10a + b) − (10b + a) = 9a − 9b = 9 × (a − b).';
      ex = (10 * y + x) + ' − ' + (10 * x + y) + ' = ' + (9 * d);
    } else {
      q = 'Dans un nombre à deux chiffres, le chiffre des unités dépasse de ' + d + ' le chiffre des dizaines. De combien ce nombre augmente-t-il quand on inverse ses deux chiffres ?';
      formule = 'Avec a pour le chiffre des dizaines et b pour celui des unités : (10b + a) − (10a + b) = 9b − 9a = 9 × (b − a).';
      ex = (10 * y + x) + ' − ' + (10 * x + y) + ' = ' + (9 * d);
    }
  } else {
    const b = R.int(1, 7); d = R.int(2, 9 - b); const a = b + d;
    q = 'On inverse les chiffres de ' + (10 * a + b) + ', ce qui donne ' + (10 * b + a) + '. Combien vaut ' + (10 * a + b) + ' − ' + (10 * b + a) + ' ?';
    formule = '(10a + b) − (10b + a) = 9a − 9b = 9 × (a − b). Ici ' + a + ' − ' + b + ' = ' + d + '.';
  }
  const bonne = 9 * d;
  const expl = 'On écrit le nombre avec ses deux chiffres puis on retranche le nombre renversé : la différence ne dépend que de l\'écart entre les deux chiffres. ' +
    formule + ' La différence vaut 9 × ' + d + ' = ' + bonne + '.' + (ex ? ' Vérification sur un exemple : ' + ex + '.' : '');
  return sortie(q, bonne, [
    [d, v => 'Piège : ' + v + ' est l\'écart entre les deux chiffres, pas entre les deux nombres.'],
    [10 * d, v => 'Piège : ' + v + ' ne regarde que le chiffre des dizaines ; le chiffre des unités change aussi, en sens inverse.'],
    [11 * d, v => forme === 2 ? 'Piège : ' + v + ' soustrait chiffre à chiffre en oubliant la retenue.' : 'Piège : ' + v + ' ajoute l\'effet des dizaines et celui des unités au lieu de les retrancher.']
  ], expl, {min: 1});
}

const NUMEROTE2 = [
  N => 'Pour numéroter les pages d\'un carnet de ' + N + ' pages, de 1 à ' + N + ', combien de chiffres faut-il écrire en tout ?',
  N => 'Les places d\'une petite salle de spectacle sont numérotées de 1 à ' + N + '. Combien de chiffres a-t-on peints en tout pour écrire ces numéros ?',
  N => 'On numérote de 1 à ' + N + ' les casiers d\'un vestiaire. Combien de chiffres écrit-on en tout ?',
  N => 'Les dossards d\'une course portent les numéros 1 à ' + N + '. Combien de chiffres a-t-on imprimés en tout ?'
];
function n1Pages2(R){
  const N = R.int(20, 99), q = R.pick(NUMEROTE2)(N), M = N - 9, bonne = 9 + 2 * M;
  const expl = 'On sépare les numéros à un chiffre et les numéros à deux chiffres, et on compte chaque groupe avec la règle « dernier moins premier plus un ». ' +
    'De 1 à 9 : 9 numéros, soit 9 chiffres. De 10 à ' + N + ' : ' + N + ' − 10 + 1 = ' + M + ' numéros, soit 2 × ' + M + ' = ' + (2 * M) + ' chiffres. Total : 9 + ' + (2 * M) + ' = ' + nb(bonne) + '.';
  return sortie(q, bonne, [
    [2 * N, v => 'Piège : ' + v + ' compte deux chiffres pour chaque numéro, alors que 1 à 9 n\'en ont qu\'un.'],
    [9 + 2 * (N - 10), v => 'Piège : ' + v + ' oublie le +1 : de 10 à ' + N + ', il y a ' + M + ' numéros, pas ' + (M - 1) + '.'],
    [N, v => 'Piège : ' + v + ' est le nombre de numéros, pas le nombre de chiffres.']
  ], expl, {min: 1});
}

/* Nombre de fois qu'on écrit le chiffre d (1 à 9) de 1 à N, position par position. */
function occPos(N, d, p){ const bloc = 10 * p, full = Math.floor((N + 1) / bloc) * p, rest = (N + 1) % bloc; return full + Math.max(0, Math.min(rest - d * p, p)); }
const ECRIRE = [
  (N, d) => 'On écrit tous les nombres entiers de 1 à ' + N + '. Combien de fois écrit-on le chiffre ' + d + ' ?',
  (N, d) => 'Un imprimeur numérote des tickets de 1 à ' + N + '. Combien de fois imprime-t-il le chiffre ' + d + ' ?'
];
function n1Compte(R){
  const d = R.int(1, 9), N = R.int(0, 2) === 0 ? R.pick([99, 100]) : R.int(Math.max(30, 10 * d - 5), 99);
  const u = occPos(N, d, 1), t = occPos(N, d, 10), h = occPos(N, d, 100), bonne = u + t + h;
  const lastU = d + 10 * (u - 1);
  const listU = u > 3 ? d + ', ' + (10 + d) + ', ' + (20 + d) + ', …, ' + lastU : enumTxt(somme1aN(u).reverse().map(i => d + 10 * (i - 1)));
  const parts = [u, t].concat(h ? [h] : []);
  const expl = 'On compte séparément ce chiffre à la place des unités et à la place des dizaines, puis on additionne. ' +
    'Unités : ' + listU + ', soit ' + u + ' fois. ' +
    (t > 0 ? 'Dizaines : de ' + (10 * d) + ' à ' + Math.min(N, 10 * d + 9) + ', soit ' + t + ' fois. ' : 'Dizaines : aucun, car ' + (10 * d) + ' dépasse ' + N + '. ') +
    (h ? 'Et 100 contient un chiffre 1 de plus. ' : '') +
    'Total : ' + parts.join(' + ') + ' = ' + bonne + '.' + (11 * d <= N ? ' Le nombre ' + (11 * d) + ' compte bien deux fois, puisqu\'il contient deux chiffres ' + d + '.' : '');
  return sortie(R.pick(ECRIRE)(N, d), bonne, [
    11 * d <= N ? [bonne - 1, v => 'Piège : ' + v + ' compte une seule fois ' + (11 * d) + ', qui contient pourtant deux chiffres ' + d + '.'] : null,
    t > 0 ? [u, v => 'Piège : ' + v + ' ne compte que les chiffres des unités.'] : null,
    h ? [u + t, v => 'Piège : ' + v + ' oublie le chiffre 1 de 100.'] : null,
    t > 0 ? [t, v => 'Piège : ' + v + ' ne compte que les chiffres des dizaines.'] : null
  ], expl, {min: 1});
}

function n1PalinTranche(R){
  const X = R.int(1, 8), Y = R.int(X + 1, 9), k = Y - X + 1, bonne = 10 * k;
  const q = 'Un palindrome est un nombre qui se lit de la même façon de gauche à droite et de droite à gauche, comme ' + R.pick(EX_PAL[3]) + '. Combien de palindromes à trois chiffres y a-t-il de ' + X + '00 à ' + Y + '99 ?';
  const expl = 'Un palindrome à trois chiffres est fixé dès qu\'on choisit son premier chiffre (qui est aussi le dernier) et son chiffre du milieu : on multiplie les nombres de choix. ' +
    'Ici le premier chiffre va de ' + X + ' à ' + Y + ', soit ' + Y + ' − ' + X + ' + 1 = ' + k + ' choix, et le chiffre du milieu a 10 choix (de 0 à 9). Total : ' + k + ' × 10 = ' + bonne + '.';
  return sortie(q, bonne, [
    [10 * (k - 1), v => 'Piège : ' + v + ' oublie le +1 : de ' + X + ' à ' + Y + ', il y a ' + k + ' premiers chiffres possibles.'],
    [9 * k, v => 'Piège : ' + v + ' oublie que le chiffre du milieu peut valoir 0, comme dans ' + X + '0' + X + '.'],
    [k, v => 'Piège : ' + v + ' oublie le chiffre du milieu, qui est libre.'],
    [100 * k, v => 'Piège : ' + v + ' laisse le dernier chiffre libre, alors qu\'il recopie le premier.']
  ], expl, {min: 1});
}

/* =====================================================================
   NIVEAU 2
   ===================================================================== */
function eqSomme(k){
  if (k === 10) return '10a + b = 10(a + b) donne 0 = 9b, donc b = 0.';
  const L = 10 - k, M = k - 1, g = pgcd(L, M);
  const l = L / g, m = M / g;
  return '10a + b = ' + k + '(a + b) = ' + k + 'a + ' + k + 'b donne ' + cl(L, 'a') + ' = ' + cl(M, 'b') + (g > 1 ? ', soit ' + cl(l, 'a') + ' = ' + cl(m, 'b') : '') + '.' +
    indiceMult(l, m);
}
function indiceMult(l, m){ return l > 1 && m > 1 && pgcd(l, m) === 1 ? ' Comme ' + l + ' et ' + m + ' n\'ont pas de diviseur commun, a est un multiple de ' + m + ' et b un multiple de ' + l + '.' : ''; }
function finListe(L){ return L.length === 1 ? 'La seule solution est ' + L[0] + '.' : 'Solutions : ' + enumTxt(L) + '. Il y en a ' + L.length + '.'; }
function piegesListe(L){
  return L.length > 1
    ? [[1, v => 'Piège : ' + v + ' revient à s\'arrêter au premier nombre trouvé, alors qu\'il faut chercher toutes les solutions.']]
    : [[0, v => 'Piège : ' + v + ' conclut trop vite qu\'aucun nombre ne convient, alors que ' + L[0] + ' marche.'], [2, null]];
}
function n2Kfois(R){
  const forme = R.pick(['somme', 'somme', 'diz', 'dep']);
  let q, L, eq, pieges = [];
  if (forme === 'somme'){
    const k = R.pick([2, 3, 4, 5, 6, 8, 9, 10]);
    q = 'Combien de nombres entiers à deux chiffres sont égaux à ' + k + ' fois la somme de leurs chiffres ?';
    L = sol2((a, b) => 10 * a + b === k * (a + b)); eq = eqSomme(k);
  } else if (forme === 'diz'){
    const k = R.int(11, 19);
    q = 'Combien de nombres entiers à deux chiffres sont égaux à ' + k + ' fois leur chiffre des dizaines ?';
    L = sol2((a, b) => 10 * a + b === k * a); eq = '10a + b = ' + k + 'a donne b = ' + cl(k - 10, 'a') + ', et b ne dépasse pas 9.';
  } else {
    const j = R.int(1, 9), m = 9 * j;
    q = 'Combien de nombres entiers à deux chiffres dépassent de ' + m + ' la somme de leurs chiffres ?';
    L = sol2((a, b) => 10 * a + b - (a + b) === m);
    eq = '(10a + b) − (a + b) = 9a, donc 9a = ' + m + ', soit a = ' + j + ', et le chiffre des unités b est libre.';
    pieges.push([9, v => 'Piège : ' + v + ' oublie ' + (10 * j) + ', dont le chiffre des unités est 0.']);
  }
  pieges = pieges.concat(piegesListe(L));
  return sortie(q, L.length, pieges, M_EQ + ' ' + eq + ' ' + finListe(L), {min: 0});
}

function n2RenverseCompte(R){
  const sens = R.int(0, 1), impossible = R.int(1, 8) === 1;
  let X; if (impossible){ do { X = R.int(10, 80); } while (X % 9 === 0); } else X = 9 * R.int(1, 8);
  const d = X / 9;
  const q = sens === 0
    ? 'Combien de nombres entiers à deux chiffres augmentent de ' + X + ' quand on inverse l\'ordre de leurs chiffres ?'
    : 'Combien de nombres entiers à deux chiffres, sans chiffre 0, diminuent de ' + X + ' quand on inverse l\'ordre de leurs chiffres ?';
  const L = []; for (let a = 1; a <= 9; a++) for (let b = sens === 0 ? 0 : 1; b <= 9; b++){ const diff = sens === 0 ? 9 * (b - a) : 9 * (a - b); if (diff === X) L.push(10 * a + b); }
  const bonne = L.length;
  const f = sens === 0 ? '(10b + a) − (10a + b) = 9 × (b − a)' : '(10a + b) − (10b + a) = 9 × (a − b)';
  let expl = M_REV + ' Avec a pour le chiffre des dizaines et b pour celui des unités : ' + f + '.';
  let pieges;
  if (impossible){
    const dd = Math.max(1, Math.min(8, Math.round(X / 9)));
    expl += ' Or ' + X + ' n\'est pas un multiple de 9 : aucun nombre ne convient, la réponse est 0.';
    pieges = [[9 - dd, v => 'Piège : ' + v + ' fait comme si ' + X + ' était un multiple de 9 ; la différence d\'un nombre et de son renversé l\'est toujours.'], [1, null], [10 - dd, null]];
  } else {
    expl += ' Ici 9 × ' + (sens === 0 ? '(b − a)' : '(a − b)') + ' = ' + X + ' donne ' + (sens === 0 ? 'b = a + ' + d : 'a = b + ' + d) + '. ' +
      (sens === 0 ? 'Le chiffre des dizaines a va de 1 à ' + (9 - d) : 'Le chiffre des unités b va de 1 à ' + (9 - d)) + ' : ' + enumTxt(L) + '. Il y en a ' + bonne + '.';
    pieges = [
      [10 - d, v => sens === 0 ? 'Piège : ' + v + ' compte aussi « 0' + d + ' », qui n\'est pas un nombre à deux chiffres.' : 'Piège : ' + v + ' compte aussi ' + (10 * d) + ', qui contient un 0, exclu par l\'énoncé.'],
      [d, v => 'Piège : ' + v + ' est l\'écart entre les deux chiffres, pas le nombre de solutions.'],
      [1, v => 'Piège : ' + v + ' revient à s\'arrêter au premier exemple trouvé.']
    ];
  }
  return sortie(q, bonne, pieges, expl, {min: 0});
}

function n2Produit2(R){
  const it = R.pick(P2LIST), p = it.p, L = it.L, forme = R.int(0, 1);
  const q = forme === 0
    ? 'Combien de nombres entiers à deux chiffres ont un produit des chiffres égal à ' + p + ' ?'
    : 'Le produit des deux chiffres d\'un nombre entier à deux chiffres vaut ' + p + '. Combien de nombres sont possibles ?';
  const D = []; for (let a = 1; a <= 9; a++) for (let b = a; b <= 9; b++) if (a * b === p) D.push([a, b]);
  const expl = 'On écrit ce produit comme produit de deux chiffres de toutes les façons possibles, sans oublier le chiffre un, puis on place chaque couple dans les deux ordres. ' +
    p + ' = ' + D.map(x => x[0] + ' × ' + x[1]).join(' = ') + '. Nombres : ' + enumTxt(L) + '. Il y en a ' + L.length + '.';
  const sans1 = L.filter(n => n % 10 !== 1 && Math.floor(n / 10) !== 1).length;
  const nonCarre = D.find(x => x[0] !== x[1]), carre = D.find(x => x[0] === x[1]);
  return sortie(q, L.length, [
    p <= 9 ? [sans1, v => 'Piège : ' + v + ' oublie les chiffres 1 : 1 × ' + p + ' = ' + p + ' donne 1' + p + ' et ' + p + '1.'] : null,
    nonCarre ? [D.length, v => 'Piège : ' + v + ' compte les décompositions, pas les nombres : ' + (10 * nonCarre[0] + nonCarre[1]) + ' et ' + (10 * nonCarre[1] + nonCarre[0]) + ' sont deux nombres différents.'] : null,
    carre ? [2 * D.length, v => 'Piège : ' + v + ' compte deux fois ' + (11 * carre[0]) + ', qui reste le même quand on inverse ses chiffres.'] : null
  ], expl, {min: 0});
}

const LIVRES = ['d\'un roman', 'd\'un livre de cuisine', 'd\'un catalogue', 'd\'un dictionnaire de poche', 'd\'un manuel', 'd\'un atlas'];
function n2Pages3(R){
  const N = R.int(100, 999), M = N - 99, bonne = 9 + 180 + 3 * M;
  const q = 'Pour numéroter les pages ' + R.pick(LIVRES) + ' de ' + N + ' pages, de 1 à ' + N + ', combien de chiffres faut-il imprimer en tout ?';
  const expl = 'On compte par tranches, les numéros à un, deux puis trois chiffres, chaque tranche avec la règle « dernier moins premier plus un ». ' +
    'De 1 à 9 : 9 numéros, 9 chiffres. De 10 à 99 : 90 numéros, 180 chiffres. De 100 à ' + N + ' : ' + N + ' − 99 = ' + M + ' numéros, soit 3 × ' + M + ' = ' + nb(3 * M) + ' chiffres. Total : 9 + 180 + ' + nb(3 * M) + ' = ' + nb(bonne) + '.';
  return sortie(q, bonne, [
    [3 * N, v => 'Piège : ' + v + ' compte trois chiffres pour chaque page, alors que les pages 1 à 99 en ont moins.'],
    [bonne - 3, v => 'Piège : ' + v + ' oublie le +1 : de 100 à ' + N + ', il y a ' + M + ' numéros, pas ' + (M - 1) + '.'],
    [bonne + 18, v => 'Piège : ' + v + ' compte 99 numéros à deux chiffres au lieu de 90 (de 10 à 99).']
  ], expl, {min: 1});
}

function n2PalinSuivant(R){
  if (R.int(0, 1) === 0){
    let Y; do { Y = R.int(1100, 9800); } while (estPal(Y));
    const P = palSuivant(Y), P2 = palSuivant(P), Pp = palPrec(Y), g = Math.floor(Y / 100), c0 = miroir(g, 4);
    const q = 'L\'année ' + Y + ' n\'est pas un palindrome : elle ne se lit pas de la même façon dans les deux sens. Quelle est la première année palindrome après ' + Y + ' ?';
    const expl = 'On recopie à l\'envers la première moitié de l\'année ; si on obtient une année déjà passée, on augmente cette moitié d\'une unité et on recommence. ' +
      'La première moitié de ' + Y + ' est ' + g + ', ce qui donne ' + c0 + (c0 > Y ? ', qui vient bien après ' + Y + '.' : ', qui est avant ' + Y + ' ; on passe à ' + (g + 1) + ', ce qui donne ' + P + '.') +
      ' La première année palindrome après ' + Y + ' est ' + P + '.';
    return sortie(q, P, [
      Pp ? [Pp, v => 'Piège : ' + v + ' est avant ' + Y + ' : c\'est le dernier palindrome passé, pas le prochain.'] : null,
      P2 ? [P2, v => 'Piège : ' + v + ' est bien un palindrome, mais ' + P + ' arrive avant.'] : null,
      P2 ? [palSuivant(P2), null] : null
    ], expl, {min: 1000, max: 9999, fmt: String});
  }
  let N; do { N = R.int(10000, 99800); } while (estPal(N));
  const P = palSuivant(N), P2 = palSuivant(P), Pp = palPrec(N), g = Math.floor(N / 100), c0 = miroir(g, 5), bonne = P - N;
  const q = 'Le compteur kilométrique d\'une voiture affiche ' + N + ' km. Au bout de combien de kilomètres, au minimum, affichera-t-il un palindrome, c\'est-à-dire un nombre qui se lit de la même façon dans les deux sens ?';
  const expl = 'On cherche le premier palindrome après le nombre affiché en recopiant à l\'envers sa première moitié (chiffre du milieu compris), puis on fait la différence. ' +
    'La moitié gauche de ' + N + ' est ' + g + ', ce qui donne ' + c0 + (c0 > N ? ', qui vient bien après ' + N + '.' : ', qui est avant ' + N + ' ; on passe à ' + (g + 1) + ', ce qui donne ' + P + '.') +
    ' Il faut donc ' + P + ' − ' + N + ' = ' + nb(bonne) + ' km.';
  return sortie(q, bonne, [
    P2 ? [P2 - N, v => 'Piège : ' + v + ' mène à ' + P2 + ', mais le palindrome ' + P + ' arrive avant.'] : null,
    Pp ? [N - Pp, v => 'Piège : ' + v + ' est l\'écart avec ' + Pp + ', un palindrome déjà dépassé.'] : null,
    [bonne - 1, v => 'Piège : ' + v + ' compte les nombres situés strictement entre les deux, pas l\'écart.']
  ], expl, {min: 1});
}

function n2NeufK(R){
  const n = R.int(8, 50), k = R.int(2, 9), r = 10 - k, bonne = 9 * (n - 1) + r, P = P10(n);
  const q = 'Quelle est la somme des chiffres du nombre ' + P + ' − ' + k + ' ?';
  const expl = 'On écrit d\'abord le nombre sur un petit exemple : retirer un petit nombre à une puissance de dix donne une suite de neuf terminée par un autre chiffre. ' +
    'Par exemple, 10⁴ − ' + k + ' = 999' + r + '. Ici ' + P + ' − ' + k + ' s\'écrit avec ' + (n - 1) + ' chiffres 9 suivis du chiffre ' + r + '. Somme : 9 × ' + (n - 1) + ' + ' + r + ' = ' + nb(bonne) + '.';
  return sortie(q, bonne, [
    [9 * n, v => 'Piège : ' + v + ' suppose que tous les chiffres valent 9 ; le dernier vaut ' + r + '.'],
    [9 * (n - 1), v => 'Piège : ' + v + ' oublie le dernier chiffre, ' + r + '.'],
    [9 * (n - 1) + k, v => 'Piège : le dernier chiffre est 10 − ' + k + ' = ' + r + ', pas ' + k + '.'],
    [9 * n - k, v => 'Piège : ' + v + ' retire ' + k + ' à 9 × ' + n + ', alors que ' + P + ' − ' + k + ' = (' + P + ' − 1) − ' + (k - 1) + ' : on ne retire que ' + (k - 1) + '.']
  ], expl, {min: 1});
}

function n2PalinCompte(R){
  const t = R.int(0, 7);
  if (t === 0){
    const L = R.pick([4, 5, 6]), lib = Math.ceil(L / 2), bonne = 9 * Math.pow(10, lib - 1);
    const lettres = {4: 'abba', 5: 'abcba', 6: 'abccba'}[L];
    const q = INTRO(L, R) + ' Combien y a-t-il de palindromes à ' + MOTS[L] + ' chiffres ?';
    const expl = M_PAL + ' Un palindrome à ' + MOTS[L] + ' chiffres s\'écrit ' + lettres + ' : a de 1 à 9 (9 choix), ' +
      (lib === 2 ? 'b de 0 à 9 (10 choix). Total : 9 × 10 = 90.' : 'b et c de 0 à 9 (10 choix chacun). Total : 9 × 10 × 10 = 900.');
    return sortie(q, bonne, [
      [Math.pow(10, lib), v => 'Piège : ' + v + ' laisse le premier chiffre valoir 0, ce qui ne donne pas un nombre à ' + MOTS[L] + ' chiffres.'],
      [9 * Math.pow(10, lib), v => 'Piège : ' + v + ' compte un chiffre libre de trop : les derniers chiffres recopient les premiers.'],
      L === 4 ? [81, v => 'Piège : ' + v + ' interdit le 0 en deuxième position, alors que 1001 est un palindrome.'] : [9 * Math.pow(10, lib - 2), v => 'Piège : ' + v + ' oublie un chiffre libre.']
    ], expl, {min: 1});
  }
  if (t === 1 || t === 2){
    const L = R.pick([3, 4, 5]), lib = Math.ceil(L / 2), tot = 9 * Math.pow(10, lib - 1), autres = Math.pow(10, lib - 1);
    const autresTxt = lib === 2 ? 'le chiffre ' + (L === 3 ? 'du milieu' : 'suivant') + ' a 10 choix' : 'les deux chiffres suivants ont 10 × 10 = 100 choix';
    if (t === 1){
      const bonne = 4 * autres;
      const q = INTRO(L, R) + ' Combien de palindromes à ' + MOTS[L] + ' chiffres sont des nombres pairs ?';
      const expl = 'Un nombre est pair quand son dernier chiffre est pair ; dans un palindrome, le dernier chiffre est aussi le premier, qui ne peut pas être zéro. ' +
        'Le premier chiffre vaut donc 2, 4, 6 ou 8 (4 choix) et ' + autresTxt + '. Total : 4 × ' + autres + ' = ' + bonne + '.';
      return sortie(q, bonne, [
        [tot / 2, v => 'Piège : ' + v + ' prend la moitié des palindromes ; or le premier chiffre a 4 valeurs paires (2, 4, 6, 8) contre 5 impaires.'],
        [5 * autres, v => 'Piège : ' + v + ' compte 0 parmi les premiers chiffres possibles.'],
        [4 * autres / 10, v => 'Piège : ' + v + ' oublie un chiffre libre.']
      ], expl, {min: 1});
    }
    const bonne = autres;
    const q = INTRO(L, R) + ' Combien de palindromes à ' + MOTS[L] + ' chiffres sont des multiples de 5 ?';
    const expl = 'Un multiple de cinq se termine par zéro ou par cinq ; dans un palindrome, le dernier chiffre est aussi le premier, qui ne peut pas valoir zéro. ' +
      'Le premier et le dernier chiffre valent donc 5, et ' + autresTxt + '. Total : ' + bonne + '.';
    return sortie(q, bonne, [
      [2 * bonne, v => 'Piège : ' + v + ' accepte un dernier chiffre 0, qui imposerait un premier chiffre 0.'],
      [tot / 5, v => 'Piège : ' + v + ' prend un palindrome sur cinq ; ici seul le chiffre 5 convient aux deux bouts.'],
      [bonne / 10, v => 'Piège : ' + v + ' oublie un chiffre libre.']
    ], expl, {min: 1});
  }
  if (t === 3){
    let X, Y; do { X = R.int(1, 8); Y = R.int(X + 1, 9); } while (X === 1 && Y === 9);
    const k = Y - X + 1, bonne = 10 * k;
    const q = INTRO(4, R) + ' Combien de palindromes à quatre chiffres y a-t-il de ' + X + '000 à ' + Y + '999 ?';
    const expl = M_PAL + ' Un palindrome à quatre chiffres s\'écrit abba. Ici a va de ' + X + ' à ' + Y + ' : ' + Y + ' − ' + X + ' + 1 = ' + k + ' choix ; b a 10 choix. Total : ' + k + ' × 10 = ' + bonne + '.';
    return sortie(q, bonne, [
      [10 * (k - 1), v => 'Piège : ' + v + ' oublie le +1 : de ' + X + ' à ' + Y + ', il y a ' + k + ' premiers chiffres.'],
      [100 * k, v => 'Piège : ' + v + ' laisse libres les deux derniers chiffres, qui recopient pourtant les deux premiers.'],
      [9 * k, v => 'Piège : ' + v + ' interdit le 0 en deuxième position, alors que ' + X + '00' + X + ' convient.']
    ], expl, {min: 1});
  }
  if (t === 4){
    const d = R.int(1, 9);
    const q = INTRO(5, R) + ' Combien de palindromes à cinq chiffres commencent par ' + d + ' ?';
    const expl = M_PAL + ' Un palindrome à cinq chiffres qui commence par ' + d + ' s\'écrit ' + d + 'bcb' + d + ' : b et c ont 10 choix chacun. Total : 10 × 10 = 100.';
    return sortie(q, 100, [
      [10, v => 'Piège : ' + v + ' oublie le chiffre du milieu, qui est libre.'],
      [1000, v => 'Piège : ' + v + ' laisse libres des chiffres qui recopient les premiers.'],
      [81, v => 'Piège : ' + v + ' interdit le chiffre 0, alors que ' + d + '000' + d + ' convient.']
    ], expl, {min: 1});
  }
  if (t === 5){
    const X = R.int(1, 8), bonne = 10 * (10 - X);
    const q = INTRO(3, R) + ' Combien de palindromes à trois chiffres sont plus grands que ' + X + '00 ?';
    const expl = M_PAL + ' Un palindrome à trois chiffres plus grand que ' + X + '00 commence par un chiffre de ' + X + ' à 9 : même ceux qui commencent par ' + X + ', comme ' + X + '0' + X + ', dépassent ' + X + '00. ' +
      'Cela fait ' + (10 - X) + ' choix pour le premier chiffre et 10 pour celui du milieu. Total : ' + (10 - X) + ' × 10 = ' + bonne + '.';
    return sortie(q, bonne, [
      [10 * (9 - X), v => 'Piège : ' + v + ' oublie les palindromes qui commencent par ' + X + ', comme ' + X + '0' + X + ', pourtant plus grands que ' + X + '00.'],
      [9 * (10 - X), v => 'Piège : ' + v + ' oublie que le chiffre du milieu peut valoir 0.'],
      [10 - X, v => 'Piège : ' + v + ' oublie le chiffre du milieu.']
    ], expl, {min: 1});
  }
  if (t === 6){
    const q = INTRO(3, R) + ' Combien de palindromes à trois chiffres s\'écrivent avec deux chiffres différents ?';
    const expl = M_PAL + ' Un tel palindrome s\'écrit aba avec b différent de a : 9 choix pour a (de 1 à 9), puis 9 choix pour b (les dix chiffres sauf a). Total : 9 × 9 = 81. Autre chemin : 90 palindromes à trois chiffres, moins les 9 de la forme aaa (111, 222, …, 999).';
    return sortie(q, 81, [
      [90, v => 'Piège : ' + v + ' oublie de retirer les palindromes écrits avec un seul chiffre, comme 444.'],
      [72, v => 'Piège : ' + v + ' interdit aussi le 0 au milieu, alors que 505 convient.'],
      [80, v => 'Piège : ' + v + ' retire 10 palindromes au lieu de 9 : 000 n\'est pas un nombre à trois chiffres.']
    ], expl, {min: 1});
  }
  const S = 2 * R.int(2, 17), tt = S / 2;
  const L = []; for (let a = 1; a <= 9; a++){ const b = tt - a; if (b >= 0 && b <= 9) L.push(1001 * a + 110 * b); }
  const bonne = L.length;
  const q = INTRO(4, R) + ' Combien de palindromes à quatre chiffres ont une somme des chiffres égale à ' + S + ' ?';
  const expl = 'Dans un palindrome à quatre chiffres, chacun des deux premiers chiffres est écrit deux fois : la somme des chiffres vaut le double de la somme des deux premiers. ' +
    'abba : a + b + b + a = 2(a + b) = ' + S + ', donc a + b = ' + tt + ', avec a de 1 à 9 et b de 0 à 9. ' + (L.length > 1 ? 'Palindromes : ' + enumTxt(L) + '. Il y en a ' + bonne + '.' : 'Seul ' + L[0] + ' convient.');
  return sortie(q, bonne, [
    tt <= 9 ? [tt + 1, v => 'Piège : ' + v + ' laisse le premier chiffre valoir 0.'] : [tt - 1, v => 'Piège : ' + v + ' oublie qu\'un chiffre ne dépasse pas 9.'],
    S <= 18 ? [S <= 9 ? S : 19 - S, v => 'Piège : ' + v + ' oublie que chaque chiffre compte deux fois dans la somme.'] : null,
    tt <= 9 ? [tt - 1, v => 'Piège : ' + v + ' oublie le palindrome dont le deuxième chiffre est 0, ' + (1001 * tt) + '.'] : null
  ], expl, {min: 1});
}

/* =====================================================================
   NIVEAU 3
   ===================================================================== */
function n3Equation(R){
  const forme = R.pick(['somme', 'unites', 'unites', 'produit', 'sp']);
  let q, L, eq;
  if (forme === 'somme'){
    const k = R.pick([2, 3, 4, 5, 6, 8, 9, 10]);
    q = 'Combien de nombres entiers à deux chiffres sont égaux à ' + k + ' fois la somme de leurs chiffres ?';
    L = sol2((a, b) => 10 * a + b === k * (a + b)); eq = eqSomme(k);
  } else if (forme === 'unites'){
    const k = R.pick(K_UNITES), M = k - 1, g = pgcd(10, M);
    q = 'Combien de nombres entiers à deux chiffres sont égaux à ' + k + ' fois leur chiffre des unités ?';
    L = sol2((a, b) => 10 * a + b === k * b);
    eq = '10a + b = ' + k + 'b donne 10a = ' + cl(M, 'b') + (g > 1 ? ', soit ' + cl(10 / g, 'a') + ' = ' + cl(M / g, 'b') : '') + '.' + indiceMult(10 / g, M / g);
  } else if (forme === 'produit'){
    const k = R.pick(K_PRODUIT);
    q = 'Combien de nombres entiers à deux chiffres sont égaux à ' + (k === 1 ? 'au produit de leurs chiffres' : k + ' fois le produit de leurs chiffres') + ' ?';
    L = sol2((a, b) => 10 * a + b === k * a * b);
    const det = L.map(n => n + ' = ' + (k === 1 ? '' : k + ' × ') + Math.floor(n / 10) + ' × ' + (n % 10));
    eq = '10a + b = ' + (k === 1 ? 'ab' : k + 'ab') + '. Le chiffre b n\'est pas nul (sinon le produit vaut 0), et l\'équation s\'écrit b × (' + (k === 1 ? 'a' : k + 'a') + ' − 1) = 10a. On essaie a = 1, 2, …, 9 : seul' + (L.length > 1 ? 's ' : ' ') + enumTxt(L.map(n => 'a = ' + Math.floor(n / 10) + ' (b = ' + (n % 10) + ')')) + (L.length > 1 ? ' donnent' : ' donne') + ' un chiffre b entier. Vérification : ' + det.join(' ; ') + '.';
  } else {
    q = 'Combien de nombres entiers à deux chiffres sont égaux à la somme de leurs chiffres augmentée du produit de leurs chiffres ?';
    L = sol2((a, b) => 10 * a + b === a + b + a * b);
    eq = '10a + b = a + b + ab donne 9a = ab, donc b = 9 puisque a n\'est pas nul : tous les nombres qui finissent par 9 conviennent.';
  }
  const pieges = piegesListe(L);
  if (forme === 'sp') pieges.push([8, v => 'Piège : ' + v + ' oublie 99, qui convient aussi : 9 + 9 + 81 = 99.']);
  return sortie(q, L.length, pieges, M_EQ + ' ' + eq + ' ' + finListe(L), {min: 0});
}

function n3RenverseSomme(R){
  const impossible = R.int(1, 8) === 1;
  let S, s;
  if (impossible){ do { S = R.int(30, 190); } while (S % 11 === 0); } else { s = R.int(3, 17); S = 11 * s; }
  const q = R.int(0, 1) === 0
    ? 'On ajoute un nombre entier à deux chiffres, sans chiffre 0, et le nombre obtenu en inversant ses chiffres. On trouve ' + S + '. Combien de nombres à deux chiffres ont cette propriété ?'
    : 'Combien de nombres entiers à deux chiffres, sans chiffre 0, donnent ' + S + ' quand on les ajoute au nombre obtenu en inversant leurs chiffres ?';
  const L = []; for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) if (11 * (a + b) === S) L.push(10 * a + b);
  const bonne = L.length;
  let expl = 'La somme d\'un nombre et de son renversé vaut onze fois la somme de ses deux chiffres : on divise par onze, puis on compte les couples de chiffres. (10a + b) + (10b + a) = 11a + 11b = 11 × (a + b).';
  let pieges;
  if (impossible){
    const ss = Math.max(3, Math.min(17, Math.round(S / 11)));
    expl += ' Or ' + S + ' n\'est pas un multiple de 11 : aucun nombre ne convient, la réponse est 0.';
    pieges = [[ss <= 9 ? ss - 1 : 19 - ss, v => 'Piège : ' + v + ' fait comme si ' + S + ' était un multiple de 11 ; la somme d\'un nombre et de son renversé l\'est toujours.'], [1, null], [2, null]];
  } else {
    expl += ' Ici 11 × (a + b) = ' + S + ' donne a + b = ' + s + ', avec a et b entre 1 et 9 : ' + enumTxt(L) + '. Il y en a ' + bonne + '.';
    pieges = s <= 9
      ? [[s, v => 'Piège : ' + v + ' compte aussi ' + (10 * s) + ', qui contient un 0, exclu par l\'énoncé.'], [s - 2, v => 'Piège : ' + v + ' oublie un nombre de la liste : le chiffre des dizaines va de 1 à ' + (s - 1) + '.']]
      : [[s - 1, v => 'Piège : ' + v + ' fait aller le premier chiffre de 1 à ' + (s - 1) + ' sans voir qu\'un chiffre ne dépasse pas 9.'],
         [20 - s, v => 'Piège : ' + v + ' compte un nombre de trop : le premier chiffre va de ' + (s - 9) + ' à 9.'],
         [s, v => 'Piège : ' + v + ' est la somme des chiffres, pas le nombre de solutions.']];
  }
  return sortie(q, bonne, pieges, expl, {min: 0});
}

/* Palindromes à 3 ou 4 chiffres divisibles par d, comptés par premier chiffre (deuxième chiffre listé). */
const CRIT = {
  '4-11': 'Un palindrome abba vaut 1000a + 100b + 10b + a = 1001a + 110b = 11 × (91a + 10b) : il est toujours divisible par 11.',
  '4-9': 'La somme des chiffres de abba vaut 2(a + b) ; elle est un multiple de 9 seulement si a + b vaut 9 ou 18.',
  '4-3': 'La somme des chiffres de abba vaut 2(a + b) ; elle est un multiple de 3 exactement quand a + b en est un.',
  '4-2': 'Un palindrome abba est pair quand son dernier chiffre, égal au premier, est pair.',
  '4-4': 'Un nombre est divisible par 4 quand ses deux derniers chiffres forment un multiple de 4 ; pour abba, c\'est le nombre « b puis a », donc a doit être pair.',
  '4-6': 'Divisible par 6 signifie pair et divisible par 3 : a pair, et a + b multiple de 3 (la somme des chiffres vaut 2(a + b)).',
  '4-99': 'abba = 11 × (91a + 10b) est toujours un multiple de 11 ; il faut en plus la divisibilité par 9 : 2(a + b) multiple de 9, donc a + b vaut 9 ou 18.',
  '3-3': 'La somme des chiffres de aba vaut 2a + b ; elle doit être un multiple de 3.',
  '3-9': 'La somme des chiffres de aba vaut 2a + b ; elle doit être un multiple de 9.',
  '3-11': 'Pour 11, on fait la somme alternée des chiffres : a − b + a = 2a − b doit être un multiple de 11, donc 2a − b vaut 0 ou 11.',
  '3-4': 'Un nombre est divisible par 4 quand ses deux derniers chiffres forment un multiple de 4 ; pour aba, c\'est le nombre « b puis a », donc a doit être pair.',
  '3-6': 'Divisible par 6 signifie pair et divisible par 3 : a pair, et 2a + b multiple de 3.'
};
function palDivDetail(L, d, X, Y){
  const groupes = [], cnt = [];
  for (let a = X; a <= Y; a++){
    const bs = []; for (let b = 0; b <= 9; b++){ const n = L === 3 ? 101 * a + 10 * b : 1001 * a + 110 * b; if (n % d === 0) bs.push(b); }
    cnt.push(bs.length);
    groupes.push('a = ' + a + ' : ' + (bs.length === 10 ? 'les 10 valeurs de b' : bs.length ? 'b = ' + enumTxt(bs, 'ou') : 'aucun b'));
  }
  return {total: somme(cnt), cnt: cnt, txt: groupes.join(' ; ')};
}
function palDivSortie(L, d, X, Y, q, extra){
  const D = palDivDetail(L, d, X, Y), bonne = D.total, tot = (Y - X + 1) * 10;
  const nz = D.cnt.filter(x => x > 0);
  const expl = M_DIV + ' ' + CRIT[L + '-' + d] + ' ' + D.txt + '. Total : ' + (nz.length > 1 ? nz.join(' + ') + ' = ' : '') + bonne + '.';
  const pieges = [[Math.round(tot / d), v => 'Piège : ' + v + ' suppose qu\'un palindrome sur ' + d + ' convient, au lieu d\'appliquer le critère.']].concat(extra(D, tot));
  return sortie(q, bonne, pieges, expl, {min: 0});
}
function n3PalinDiv(R){
  if (R.int(0, 1) === 0){
    let X, Y; do { X = R.int(1, 8); Y = R.int(X + 1, 9); } while (X === 1 && Y === 9);
    const d = R.pick([11, 11, 9, 3, 2]);
    const q = INTRO(4, R) + ' Combien de palindromes à quatre chiffres, de ' + X + '000 à ' + Y + '999, sont divisibles par ' + d + ' ?';
    return palDivSortie(4, d, X, Y, q, (D, tot) => {
      if (d === 11) return [[0, v => 'Piège : ' + v + ' : croire qu\'aucun palindrome à quatre chiffres n\'est multiple de 11, alors qu\'ils le sont tous.'], [tot - (Y - X + 1), null]];
      if (d === 9){ const seul9 = D.total - (Y === 9 ? 1 : 0); return [[seul9, v => 'Piège : ' + v + ' oublie le cas a + b = 18, c\'est-à-dire 9999.'], [Y - X + 1, null]]; }
      if (d === 3) return [[3 * (Y - X + 1), v => 'Piège : ' + v + ' compte toujours trois valeurs de b, alors qu\'il y en a quatre (0, 3, 6 ou 9) quand a est un multiple de 3.'], [4 * (Y - X + 1), null]];
      return [[D.total / 10, v => 'Piège : ' + v + ' oublie que le deuxième chiffre est libre (10 choix).']];
    });
  }
  const d = R.pick([3, 9, 11]);
  const q = INTRO(3, R) + ' Combien de palindromes à trois chiffres sont divisibles par ' + d + ' ?';
  return palDivSortie(3, d, 1, 9, q, D => {
    if (d === 3) return [[27, v => 'Piège : ' + v + ' compte toujours trois valeurs de b, alors qu\'il y en a quatre quand a est un multiple de 3.'], [36, null]];
    if (d === 9) return [[9, v => 'Piège : ' + v + ' oublie que pour a = 9, b peut valoir 0 ou 9 (909 et 999).']];
    return [[4, v => 'Piège : ' + v + ' ne garde que le cas 2a − b = 0 et oublie 2a − b = 11, comme dans 616.'], [9, null]];
  });
}

function n3NeufM(R){
  const n = R.int(8, 40);
  let m; do { m = R.int(11, 99); } while (m % 10 === 0);
  const r = 100 - m, rs = (r < 10 ? '0' : '') + r, bonne = 9 * (n - 2) + ds(r), P = P10(n);
  const q = 'Quelle est la somme des chiffres du nombre ' + P + ' − ' + m + ' ?';
  const expl = 'On écrit le nombre comme une suite de neuf suivie de quelques derniers chiffres, en passant par un nombre rond. ' +
    P + ' − ' + m + ' = (' + P + ' − 100) + (100 − ' + m + ') : ' + P + ' − 100 s\'écrit avec ' + (n - 2) + ' chiffres 9 suivis de 00, et 100 − ' + m + ' = ' + r + '. ' +
    'Donc ' + P + ' − ' + m + ' s\'écrit avec ' + (n - 2) + ' chiffres 9 suivis de ' + rs + ' (par exemple 10⁵ − ' + m + ' = 999' + rs + '). Somme : 9 × ' + (n - 2) + ' + ' + rs.split('').join(' + ') + ' = ' + nb(bonne) + '.';
  return sortie(q, bonne, [
    [9 * n - ds(m), v => 'Piège : ' + v + ' retire la somme des chiffres de ' + m + ' à 9 × ' + n + ' ; on ne retire pas chiffre à chiffre.'],
    [9 * (n - 2), v => 'Piège : ' + v + ' oublie les deux derniers chiffres.'],
    [9 * (n - 1) + ds(r), v => 'Piège : ' + v + ' compte un 9 de trop : il n\'en reste que ' + (n - 2) + '.'],
    [9 * n, v => 'Piège : ' + v + ' suppose que tous les chiffres valent 9.']
  ], expl, {min: 1});
}

const NUMEROTE_INV = [
  D => 'Pour numéroter les pages d\'un livre, de la page 1 à la dernière, un imprimeur a utilisé ' + D + ' chiffres en tout. Combien de pages compte ce livre ?',
  D => 'On numérote à partir de 1 les billets d\'une tombola. Il a fallu écrire ' + D + ' chiffres en tout. Combien y a-t-il de billets ?',
  D => 'Les sièges d\'une salle sont numérotés à partir de 1. Pour peindre tous les numéros, on a peint ' + D + ' chiffres. Combien y a-t-il de sièges ?'
];
function n3PagesInv(R){
  const N = R.int(100, 999), D = 3 * N - 108, r = D - 189, qq = r / 3;
  const q = R.pick(NUMEROTE_INV)(nb(D));
  const expl = 'On retire les chiffres utilisés par les numéros à un et à deux chiffres, puis on divise le reste par trois. ' +
    'De 1 à 9 : 9 chiffres ; de 10 à 99 : 90 × 2 = 180 chiffres ; total 189. Il reste ' + nb(D) + ' − 189 = ' + nb(r) + ' chiffres, soit ' + nb(r) + ' ÷ 3 = ' + qq + ' numéros à trois chiffres, de 100 à 99 + ' + qq + ' = ' + N + '. La réponse est ' + N + '.';
  return sortie(q, N, [
    [D / 3, v => 'Piège : ' + v + ' suppose que tous les numéros ont trois chiffres.'],
    [qq, v => 'Piège : ' + v + ' est le nombre de numéros à trois chiffres ; il faut ajouter les 99 premiers.'],
    [N + 1, v => 'Piège : ' + v + ' : le dernier numéro est 99 + ' + qq + ', pas 100 + ' + qq + '.']
  ], expl, {min: 1});
}

const SUITE = 'On écrit à la suite tous les nombres entiers à partir de 1, sans espace : 123456789101112131415…';
function rangChiffre(k){
  if (k <= 9) return {n: k, pos: 0, len: 1};
  if (k <= 189){ const p = k - 9; return {n: 10 + Math.floor((p - 1) / 2), pos: (p - 1) % 2, len: 2}; }
  const p = k - 189; return {n: 100 + Math.floor((p - 1) / 3), pos: (p - 1) % 3, len: 3};
}
const chiffreDe = (n, pos) => Number(String(n)[pos]);
const NOMS_POS = {2: ['premier', 'second'], 3: ['premier', 'deuxième', 'troisième']};
function rangSortie(k, R){
  const r = rangChiffre(k), bonne = chiffreDe(r.n, r.pos), L = r.len;
  const q = SUITE + ' Quel est le ' + k + 'e chiffre écrit ?';
  const base = L === 2 ? 9 : 189, p = k - base, qq = Math.floor(p / L), reste = p % L;
  const expl = (L === 2
      ? 'On retire d\'abord les chiffres des nombres de un à neuf, puis on avance par paquets de deux chiffres, un paquet par nombre à deux chiffres. Les nombres de 1 à 9 occupent les 9 premières places.'
      : 'On retire d\'abord les chiffres des nombres à un et à deux chiffres, puis on avance par paquets de trois chiffres. De 1 à 9 : 9 chiffres ; de 10 à 99 : 180 chiffres ; soit 189 places.') +
    ' Il reste ' + k + ' − ' + base + ' = ' + p + ' places, et ' + p + ' = ' + L + ' × ' + qq + ' + ' + reste + '. ' +
    (reste === 0
      ? 'On termine donc exactement le ' + ord(qq) + ' nombre à ' + MOTS[L] + ' chiffres, ' + r.n + ' (' + (L === 2 ? '10' : '100') + ' + ' + (qq - 1) + '), et l\'on prend son dernier chiffre.'
      : (qq === 0
        ? 'On est dans le premier nombre à ' + MOTS[L] + ' chiffres, ' + r.n + ', et l\'on prend son ' + NOMS_POS[L][reste - 1] + ' chiffre.'
        : 'On a écrit en entier ' + qq + ' nombre' + (qq > 1 ? 's' : '') + ' à ' + MOTS[L] + ' chiffres, jusqu\'à ' + (r.n - 1) + ' ; on est dans le suivant, ' + r.n + ', et l\'on prend son ' + NOMS_POS[L][reste - 1] + ' chiffre.')) +
    ' Le ' + k + 'e chiffre est ' + bonne + '.';
  const autres = String(r.n).split('').map(Number).filter((c, i) => i !== r.pos);
  const pieges = autres.map((c, i) => [c, i === 0 ? v => 'Piège : ' + v + ' est un autre chiffre du bon nombre, ' + r.n + ' : il faut bien repérer la place dans le nombre.' : null]);
  pieges.push([chiffreDe(r.n + 1 <= (L === 2 ? 99 : 999) ? r.n + 1 : r.n - 1, r.pos), v => 'Piège : ' + v + ' vient d\'un nombre voisin : erreur d\'une unité en comptant les nombres écrits.']);
  if (L === 2 && k <= 99){ const f = rangChiffre(k + 9); pieges.push([chiffreDe(f.n, f.pos), v => 'Piège : ' + v + ' oublie de retirer les neuf premiers chiffres, ceux de 1 à 9.']); }
  return sortie(q, bonne, pieges, expl, {min: 0, max: 9});
}
function n3Rang2(R){ return rangSortie(R.int(10, 189), R); }

function n3Somme3(R){
  const s = R.int(2, 9), bonne = s * (s + 1) / 2;
  const q = R.int(0, 1) === 0
    ? 'Combien de nombres entiers à trois chiffres ont une somme des chiffres égale à ' + s + ' ?'
    : 'Combien de nombres entiers de 100 à 999 ont des chiffres dont la somme vaut ' + s + ' ?';
  const terms = somme1aN(s);
  const expl = 'On fixe le chiffre des centaines, puis on compte les façons de compléter avec les deux autres chiffres. ' +
    'Si le chiffre des centaines vaut a, les deux autres chiffres font ' + s + ' − a, ce qui laisse ' + s + ' − a + 1 possibilités (par exemple, pour un total de 3 : 03, 12, 21, 30). ' +
    'a = 1 : ' + s + ' ; a = 2 : ' + (s - 1) + ' ; … ; a = ' + s + ' : 1. Total : ' + terms.join(' + ') + ' = ' + bonne + '.';
  return sortie(q, bonne, [
    [(s + 1) * (s + 2) / 2, v => 'Piège : ' + v + ' compte aussi les écritures qui commencent par 0, comme 0' + s + '0.'],
    [(s - 1) * (s - 2) / 2, v => 'Piège : ' + v + ' oublie les nombres qui contiennent un 0, comme ' + s + '00.'],
    [s * (s - 1) / 2, v => 'Piège : ' + v + ' oublie le cas où le chiffre des centaines vaut ' + s + ' et les autres 0.']
  ], expl, {min: 1});
}

/* =====================================================================
   NIVEAU 4
   ===================================================================== */
function n4Renverse3(R){
  const d = R.int(1, 8), X = 99 * d, sens = R.int(0, 1);
  const q = sens === 0
    ? 'Combien de nombres entiers à trois chiffres augmentent de ' + X + ' quand on écrit leurs chiffres dans l\'ordre inverse ?'
    : 'Combien de nombres entiers à trois chiffres, dont le chiffre des unités n\'est pas 0, diminuent de ' + X + ' quand on écrit leurs chiffres dans l\'ordre inverse ?';
  let n = 0; for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) for (let c = sens === 0 ? 0 : 1; c <= 9; c++) if ((sens === 0 ? 99 * (c - a) : 99 * (a - c)) === X) n++;
  const premiers = sens === 0 ? 'a va de 1 à ' + (9 - d) + ' (et c = a + ' + d + ')' : 'c va de 1 à ' + (9 - d) + ' (et a = c + ' + d + ')';
  const expl = 'On écrit le nombre avec ses trois chiffres et on retranche son renversé : le chiffre du milieu disparaît, il ne reste que l\'écart entre le premier et le dernier chiffre. ' +
    (sens === 0 ? '(100c + 10b + a) − (100a + 10b + c) = 99 × (c − a) = ' + X + ' donne c − a = ' + d + '.' : '(100a + 10b + c) − (100c + 10b + a) = 99 × (a − c) = ' + X + ' donne a − c = ' + d + '.') +
    ' Le chiffre ' + premiers + ' : ' + (9 - d) + ' choix ; le chiffre du milieu b est libre : 10 choix. Total : ' + (9 - d) + ' × 10 = ' + n + '.';
  return sortie(q, n, [
    [9 - d, v => 'Piège : ' + v + ' oublie le chiffre du milieu, qui peut prendre 10 valeurs.'],
    [10 * (10 - d), v => sens === 0 ? 'Piège : ' + v + ' laisse le premier chiffre valoir 0, ce qui ne donne pas un nombre à trois chiffres.' : 'Piège : ' + v + ' accepte un chiffre des unités nul, exclu par l\'énoncé.'],
    [9 * (9 - d), v => 'Piège : ' + v + ' oublie que le chiffre du milieu peut valoir 0.']
  ], expl, {min: 1});
}

function n4Produit3(R){
  const it = R.pick(P3LIST), p = it.p, G = it.G;
  let n = 0; for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) for (let c = 1; c <= 9; c++) if (a * b * c === p) n++;
  const q = 'Combien de nombres entiers à trois chiffres ont un produit des chiffres égal à ' + p + ' ?';
  const parts = G.map(g => g.join(' × ') + ' (' + ordres(g) + ' ordre' + (ordres(g) > 1 ? 's' : '') + ')');
  const expl = 'On écrit ce produit comme produit de trois chiffres de toutes les façons possibles, sans oublier le chiffre un, puis on compte les ordres de chaque groupe : six si les trois chiffres sont différents, trois si deux sont égaux, un s\'ils le sont tous. ' +
    p + ' = ' + parts.join(' = ') + '. Total : ' + G.map(ordres).join(' + ') + ' = ' + n + '.';
  const sans1 = somme(G.filter(g => g[0] !== 1).map(ordres));
  return sortie(q, n, [
    [sans1, v => 'Piège : ' + v + ' oublie les groupes qui contiennent le chiffre 1, comme ' + G.find(g => g[0] === 1).join(' × ') + '.'],
    [G.length, v => 'Piège : ' + v + ' compte les groupes de chiffres sans compter leurs ordres.'],
    [6 * G.length, v => 'Piège : ' + v + ' compte six ordres pour chaque groupe, même quand deux chiffres sont égaux.']
  ], expl, {min: 1});
}

/* « au moins un chiffre d » / « aucun chiffre d » entre L et U (blocs complets de longueurs). */
function sansD(Lo, Up, d){
  let tot = 0; const det = [];
  for (let k = 1; k <= 3; k++){
    const lo = k === 1 ? 1 : Math.pow(10, k - 1), up = Math.pow(10, k) - 1;
    if (lo < Lo || up > Up) continue;
    const prem = d === 0 ? 9 : 8, v = prem * Math.pow(9, k - 1);
    tot += v; det.push({k: k, prem: prem, v: v});
  }
  return {tot: tot, det: det};
}
function n4AuMoins(R){
  const plage = R.pick([[1, 99], [10, 99], [1, 999], [100, 999], [1, 999], [100, 999]]), Lo = plage[0], Up = plage[1];
  const d = R.int(0, 9), aumoins = R.int(0, 2) > 0, total = Up - Lo + 1;
  const S = sansD(Lo, Up, d), avec = total - S.tot, bonne = aumoins ? avec : S.tot;
  const q = 'Combien de nombres entiers de ' + Lo + ' à ' + Up + (aumoins ? ' s\'écrivent avec au moins un chiffre ' + d + ' ?' : ' s\'écrivent sans aucun chiffre ' + d + ' ?');
  const lignes = S.det.map(x => (x.k === 1 ? 'à un chiffre : ' + x.prem + (d === 0 ? ' (tous, de 1 à 9)' : ' (de 1 à 9 sauf ' + d + ')')
    : 'à ' + MOTS[x.k] + ' chiffres : ' + x.prem + ' × ' + (x.k === 2 ? '9' : '9 × 9') + ' = ' + x.v + ' (premier chiffre ni 0 ni ' + d + ', puis 9 choix par chiffre)')
    .replace(' ni 0 ni 0', ' différent de 0'));
  let occ = 0;
  for (let n = Lo; n <= Up; n++){ let m = n; while (m > 0){ if (m % 10 === d) occ++; m = Math.floor(m / 10); } }
  const expl = 'On compte d\'abord les nombres qui n\'utilisent pas ce chiffre, place par place, puis on les retire du total si la question porte sur « au moins un ». ' +
    'Sans chiffre ' + d + ', nombres ' + lignes.join(' ; ') + '. Cela fait ' + (S.det.length > 1 ? S.det.map(x => x.v).join(' + ') + ' = ' : '') + S.tot + ' nombres sans ' + d + '.' +
    (aumoins ? ' De ' + Lo + ' à ' + Up + ', il y a ' + total + ' nombres, donc ' + total + ' − ' + S.tot + ' = ' + nb(avec) + ' contiennent au moins un ' + d + '.' : ' La réponse est ' + S.tot + '.');
  const mauvaisPrem = (() => { let t = 0; S.det.forEach(x => { t += 9 * Math.pow(9, x.k - 1); }); return t; })();
  const pieges = aumoins
    ? [[occ, v => 'Piège : ' + v + ' compte les chiffres ' + d + ' écrits, pas les nombres : ' + (d === 0 ? '100' : String(11 * d)) + ' ne compte qu\'une fois.'],
       [S.tot, v => 'Piège : ' + v + ' est le nombre de ceux qui ne contiennent pas ' + d + '.'],
       [total - mauvaisPrem, v => 'Piège : ' + v + ' laisse 9 choix au premier chiffre, qui ne peut pourtant être ni 0 ni ' + d + '.']]
    : [[avec, v => 'Piège : ' + v + ' compte ceux qui contiennent le chiffre ' + d + '.'],
       [total - occ, v => 'Piège : ' + v + ' retire le nombre de chiffres ' + d + ' écrits, ce qui compte deux fois des nombres comme ' + (d === 0 ? '100' : String(11 * d)) + '.'],
       [mauvaisPrem, v => 'Piège : ' + v + ' laisse 9 choix au premier chiffre, qui ne peut pourtant être ni 0 ni ' + d + '.']];
  return sortie(q, bonne, pieges, expl, {min: 1});
}

function n4NeufFois(R){
  const n = R.int(6, 40); let k; do { k = R.int(2, 99); } while (k % 10 === 0);
  const bonne = 9 * n, ex = 999 * k;
  const q = 'On multiplie par ' + k + ' le nombre qui s\'écrit avec ' + n + ' chiffres 9 (99…9). Quelle est la somme des chiffres du résultat ?';
  const expl = 'On essaie d\'abord avec un petit nombre de neuf, puis on explique la règle en écrivant le produit comme une soustraction. ' +
    'Par exemple 999 × ' + k + ' = ' + nb(ex) + ', dont la somme des chiffres vaut ' + ds(ex) + ' = 9 × 3. Ici, le nombre écrit avec ' + n + ' chiffres 9 vaut ' + P10(n) + ' − 1, donc le produit vaut ' + k + ' × ' + P10(n) + ' − ' + k + ' : on obtient ' + (k - 1) + ' suivi des chiffres de ' + P10(n) + ' − ' + k + ', qui complètent ceux de ' + (k - 1) + ' jusqu\'à 9 ; les chiffres de ' + (k - 1) + ' et leurs compléments s\'annulent. ' +
    'La somme vaut donc 9 × ' + n + ' = ' + nb(bonne) + ', quel que soit le multiplicateur, pourvu qu\'il ne dépasse pas ' + P10(n) + '.';
  return sortie(q, bonne, [
    [9 * n * ds(k), v => 'Piège : ' + v + ' multiplie la somme des chiffres par la somme des chiffres de ' + k + ' ; la somme des chiffres ne se multiplie pas comme le nombre.'],
    [9 * n + ds(k), v => 'Piège : ' + v + ' ajoute les chiffres de ' + k + ', qui sont en fait compensés.'],
    [9 * (n + 1), v => 'Piège : ' + v + ' : le résultat a un chiffre de plus, mais la somme reste 9 × ' + n + '.']
  ], expl, {min: 1});
}

function n4Rang3(R){ return rangSortie(R.int(190, 1200), R); }

function n4Repunit(R){
  const n = R.int(3, 9), forme = R.int(0, 2), rep = '1'.repeat(n);
  const carre = (() => { const t = []; for (let i = 1; i <= n; i++) t.push(i); for (let i = n - 1; i >= 1; i--) t.push(i); return t.join(''); })();
  const intro = 'On élève au carré le nombre ' + rep + ', écrit avec ' + n + ' chiffres 1.';
  const regle = 'On calcule les petits cas pour faire apparaître la règle, puis on l\'applique. 11² = 121 ; 111² = 12321 ; 1111² = 1234321. Avec ' + n + ' chiffres 1, le carré monte de 1 à ' + n + ' puis redescend : ' + rep + '² = ' + carre + '.';
  if (forme === 0){
    const bonne = n * n;
    return sortie(intro + ' Quelle est la somme des chiffres du résultat ?', bonne, [
      [2 * n - 1, v => 'Piège : ' + v + ' est le nombre de chiffres du carré, pas leur somme.'],
      [n * (n + 1) / 2, v => 'Piège : ' + v + ' n\'additionne que la montée ' + serie(n) + ', sans la descente.'],
      [n * (n + 1), v => 'Piège : ' + v + ' compte deux fois le chiffre du milieu, ' + n + '.']
    ], regle + ' Somme : 2 × (' + serie(n - 1) + ') + ' + n + ' = ' + (n * (n - 1)) + ' + ' + n + ' = ' + bonne + '.', {min: 1});
  }
  if (forme === 1){
    return sortie(intro + ' Quel est le plus grand chiffre du résultat ?', n, [
      [n - 1, v => 'Piège : ' + v + ' arrête la montée un cran trop tôt.'],
      [Math.min(9, n + 1), v => 'Piège : ' + v + ' monte un cran trop haut : le sommet vaut le nombre de chiffres 1.'],
      [1, v => 'Piège : ' + v + ' croit que le carré ne s\'écrit qu\'avec des 1.']
    ], regle + ' Le plus grand chiffre, au milieu, est ' + n + '.', {min: 1, max: 9});
  }
  const bonne = 2 * n - 1;
  return sortie(intro + ' Combien de chiffres compte le résultat ?', bonne, [
    [2 * n, v => 'Piège : ' + v + ' compte deux fois le chiffre du milieu.'],
    [n * n, v => 'Piège : ' + v + ' est la somme des chiffres, pas leur nombre.'],
    [n, v => 'Piège : ' + v + ' est le nombre de chiffres de ' + rep + ', pas de son carré.']
  ], regle + ' Le carré compte ' + n + ' + ' + (n - 1) + ' = ' + bonne + ' chiffres.', {min: 1});
}

/* Blocs répétés : X × M. Toujours divisible par d ⟺ d divise M (car les blocs 100 et 101, par exemple, sont premiers entre eux). */
const BLOCS = [
  {M: 101, txt: 'Un nombre de quatre chiffres s\'écrit en répétant deux fois un même nombre de deux chiffres, comme ', lo: 10, hi: 99, ecr: x => String(x) + String(x),
   dec: (x, N) => N + ' = ' + x + ' × 100 + ' + x + ' = ' + x + ' × 101', fact: '101 est un nombre premier', bons: [101], faux: [3, 7, 11, 13, 9, 37, 111]},
  {M: 1001, txt: 'Un nombre de six chiffres s\'écrit en répétant deux fois un même nombre de trois chiffres, comme ', lo: 100, hi: 999, ecr: x => String(x) + String(x),
   dec: (x, N) => N + ' = ' + x + ' × 1000 + ' + x + ' = ' + x + ' × 1001', fact: '1001 = 7 × 11 × 13', bons: [7, 11, 13, 77, 91, 143], faux: [3, 9, 17, 19, 37, 101, 111]},
  {M: 10101, txt: 'Un nombre de six chiffres s\'écrit en répétant trois fois un même nombre de deux chiffres, comme ', lo: 10, hi: 99, ecr: x => String(x).repeat(3),
   dec: (x, N) => N + ' = ' + x + ' × 10000 + ' + x + ' × 100 + ' + x + ' = ' + x + ' × 10101', fact: '10101 = 3 × 7 × 13 × 37', bons: [3, 7, 13, 37, 21, 39], faux: [9, 11, 17, 19, 101, 27]},
  {M: 111, txt: 'Un nombre de trois chiffres s\'écrit avec trois fois le même chiffre, comme ', lo: 1, hi: 9, ecr: x => String(x).repeat(3),
   dec: (x, N) => N + ' = ' + x + ' × 111', fact: '111 = 3 × 37', bons: [3, 37], faux: [7, 9, 11, 13, 17, 27]},
  {M: 11, txt: 'Un nombre de quatre chiffres s\'écrit avec deux chiffres égaux suivis de deux chiffres égaux, comme ', lo: 0, hi: 0, ecr: null,
   dec: null, fact: '', bons: [11], faux: [3, 7, 9, 13, 37, 101]}
];
function n4Blocs(R){
  const B = R.pick(BLOCS);
  let N, decTxt, cleN;
  if (B.M === 11){
    const a = R.int(1, 9); let b; do { b = R.int(0, 9); } while (b === a);
    N = String(1100 * a + 11 * b); cleN = 100 * a + b;
    decTxt = N + ' = 1100 × ' + a + ' + 11 × ' + b + ' = 11 × (100 × ' + a + ' + ' + b + ') : tout nombre aabb vaut 11 × (100a + b)';
  } else {
    const x = R.int(B.lo, B.hi); N = B.ecr(x); cleN = x;
    decTxt = B.dec(x, N) + ', et ' + B.fact;
  }
  const bonne = B.bons[cleN % B.bons.length];                 // même énoncé → même réponse
  const faux = R.shuffle(B.faux).slice(0, 3);
  const q = B.txt + N + '. Par lequel de ces nombres un tel nombre est-il toujours divisible ?';
  const contre = faux.map(f => {
    let ce = null;
    if (B.M === 11){ for (let a = 1; a <= 9 && ce === null; a++) for (let b = 0; b <= 9; b++){ const v = 1100 * a + 11 * b; if (v % f){ ce = v; break; } } }
    else for (let x = B.lo; x <= B.hi; x++){ const v = Number(B.ecr(x)); if (v % f){ ce = v; break; } }
    return ce === null ? null : f + ' ne divise pas ' + ce;
  }).filter(Boolean);
  const expl = 'On écrit le nombre comme le bloc répété multiplié par un nombre fixe, puis on décompose ce nombre fixe. ' + decTxt + '. ' +
    'Donc ' + bonne + ' divise toujours un tel nombre. Les autres choix ne marchent pas toujours : ' + contre.join(', ') + '.';
  return {q: q, a: String(bonne), accept: null, choix: [String(bonne)].concat(faux.map(String)), expl: expl};
}

function n4PalinDiv(R){
  const cas = R.pick([[3, 4], [3, 6], [3, 11], [4, 4], [4, 6], [4, 99]]), L = cas[0], d = cas[1];
  const q = INTRO(L, R) + ' Combien de palindromes à ' + MOTS[L] + ' chiffres sont divisibles par ' + d + ' ?';
  return palDivSortie(L, d, 1, 9, q, D => {
    if (d === 4) return [[40, v => 'Piège : ' + v + ' ne vérifie que la parité ; être pair ne suffit pas pour être divisible par 4.']];
    if (d === 6) return [[40, v => 'Piège : ' + v + ' compte les palindromes pairs ; il faut aussi la divisibilité par 3.'], [30, v => 'Piège : ' + v + ' compte les multiples de 3 ; il faut aussi être pair.']];
    if (d === 11) return [[4, v => 'Piège : ' + v + ' ne garde que le cas 2a − b = 0 et oublie 2a − b = 11, comme dans 616.']];
    return [[9, v => 'Piège : ' + v + ' oublie le cas a + b = 18, c\'est-à-dire 9999.'], [90, v => 'Piège : ' + v + ' ne vérifie que la divisibilité par 11 ; 99 = 9 × 11.']];
  });
}

function sommeTousSortie(N, R){
  const L = String(N).length, c = Math.floor((N + 1) / (L === 2 ? 10 : 100));
  const bonne = L === 2 ? 5 * c * (c - 1) + 45 * c : 50 * c * (c - 1) + 900 * c;
  const q = R.int(0, 1) === 0
    ? 'On écrit tous les nombres entiers de 1 à ' + N + '. Quelle est la somme de tous les chiffres écrits ?'
    : 'Quelle est la somme de tous les chiffres qu\'on écrit en écrivant les nombres entiers de 1 à ' + N + ' ?';
  let expl;
  if (L === 2){
    const T = c * (c - 1) / 2;
    expl = 'On additionne séparément les chiffres des unités et ceux des dizaines, en repérant des blocs de dix nombres qui se répètent. ' +
      'Unités : de 0 à ' + N + ', les chiffres 0 à 9 défilent ' + c + ' fois, soit ' + c + ' × 45 = ' + nb(45 * c) + '. ' +
      (c === 2 ? 'Dizaines : le chiffre 1 apparaît 10 fois (de 10 à 19), soit 10. ' : 'Dizaines : chaque chiffre de 1 à ' + (c - 1) + ' apparaît 10 fois, soit 10 × (' + serie(c - 1) + ') = 10 × ' + T + ' = ' + nb(10 * T) + '. ') +
      'Total : ' + nb(45 * c) + ' + ' + nb(10 * T) + ' = ' + nb(bonne) + '.';
    return sortie(q, bonne, [
      [45 * c, v => 'Piège : ' + v + ' oublie les chiffres des dizaines.'],
      [N * (N + 1) / 2, v => 'Piège : ' + v + ' additionne les nombres eux-mêmes, pas leurs chiffres.'],
      [bonne - 45, v => 'Piège : ' + v + ' compte un bloc d\'unités de moins.']
    ], expl, {min: 1});
  }
  const T = c * (c - 1) / 2;
  expl = 'On additionne séparément les chiffres des unités, des dizaines et des centaines, en repérant des blocs de cent nombres qui se répètent. ' +
    'Dans chaque bloc de cent (de 00 à 99), les unités donnent 10 × 45 = 450 et les dizaines aussi 450, soit 900 par bloc ; il y a ' + c + ' blocs, d\'où ' + c + ' × 900 = ' + nb(900 * c) + '. ' +
    (c === 2 ? 'Centaines : le chiffre 1 apparaît 100 fois (de 100 à 199), soit 100. ' : 'Centaines : chaque chiffre de 1 à ' + (c - 1) + ' apparaît 100 fois, soit 100 × (' + serie(c - 1) + ') = 100 × ' + T + ' = ' + nb(100 * T) + '. ') +
    'Total : ' + nb(900 * c) + ' + ' + nb(100 * T) + ' = ' + nb(bonne) + '.';
  return sortie(q, bonne, [
    [900 * c, v => 'Piège : ' + v + ' oublie les chiffres des centaines.'],
    [N * (N + 1) / 2, v => 'Piège : ' + v + ' additionne les nombres eux-mêmes, pas leurs chiffres.'],
    [450 * c + 100 * T, v => 'Piège : ' + v + ' oublie les chiffres des dizaines.']
  ], expl, {min: 1});
}
function n4SommeTous2(R){ return sommeTousSortie(10 * R.int(2, 10) - 1, R); }

/* =====================================================================
   NIVEAU 5
   ===================================================================== */
const f2 = t => (t < 0 || t > 18 ? 0 : t <= 9 ? t + 1 : 19 - t);   // couples de chiffres de somme t
function n5Somme3Grand(R){
  const s = R.pick([10, 11, 12, 19, 20, 21, 22, 23, 24, 25, 26]);
  const parA = []; for (let a = 1; a <= 9; a++) parA.push(f2(s - a));
  const bonne = somme(parA);
  const q = R.int(0, 1) === 0
    ? 'Combien de nombres entiers à trois chiffres ont une somme des chiffres égale à ' + s + ' ?'
    : 'Combien de nombres entiers de 100 à 999 ont des chiffres dont la somme vaut ' + s + ' ?';
  let expl;
  if (s >= 19){
    const t = 27 - s, terms = somme1aN(t + 1);
    expl = 'On travaille avec l\'écart de chaque chiffre à neuf : la somme de ces écarts est petite, donc facile à répartir. ' +
      'Les écarts x, y, z (de 0 à 9) vérifient x + y + z = 27 − ' + s + ' = ' + t + ' ; le premier chiffre vaut 9 − x, jamais 0 ici. ' +
      'Si x = 0, y + z = ' + t + ' laisse ' + (t + 1) + ' possibilités ; si x = 1, ' + t + ' ; … ; si x = ' + t + ', 1. Total : ' + terms.join(' + ') + ' = ' + bonne + '.';
  } else {
    expl = 'On fixe le chiffre des centaines a, puis on compte les couples de chiffres qui complètent la somme, sans oublier qu\'un chiffre ne dépasse pas neuf. ' +
      'Pour un total t, il y a t + 1 couples si t vaut au plus 9, et 19 − t sinon. ' +
      parA.map((v, i) => 'a = ' + (i + 1) + ' : ' + v).join(' ; ') + '. Total : ' + parA.join(' + ') + ' = ' + bonne + '.';
  }
  let avec0 = 0; for (let a = 0; a <= 9; a++) avec0 += f2(s - a);
  const t = 27 - s;
  return sortie(q, bonne, [
    s <= 12 ? [s * (s + 1) / 2, v => 'Piège : ' + v + ' applique 1 + 2 + … + ' + s + ', qui ne vaut que si la somme est au plus 9 : ici un chiffre ne peut pas dépasser 9.'] : [(t + 1) * (t + 2) / 2 - (t + 1), v => 'Piège : ' + v + ' oublie le cas où le premier écart vaut 0, c\'est-à-dire un premier chiffre égal à 9.'],
    s <= 12 ? [avec0, v => 'Piège : ' + v + ' compte aussi les écritures qui commencent par 0.'] : [(t + 1) * (t + 1), v => 'Piège : ' + v + ' compte ' + (t + 1) + ' possibilités pour chaque écart, quel que soit le premier.'],
    [bonne + 1, null]
  ], expl, {min: 1});
}

function n5Kfois3(R){
  const k = R.pick(K3);
  const L = sol3((a, b, c) => 100 * a + 10 * b + c === k * (a + b + c));
  const A_ = 100 - k, B_ = k - 10, C_ = k - 1, g = pgcd(pgcd(A_, B_), C_);
  const q = 'Combien de nombres entiers à trois chiffres sont égaux à ' + k + ' fois la somme de leurs chiffres ?';
  const parA = {}; L.forEach(n => { const a = Math.floor(n / 100); (parA[a] = parA[a] || []).push(n); });
  const a1 = A_ / g, b1 = B_ / g, c1 = C_ / g, gab = pgcd(a1, b1), gac = pgcd(a1, c1);
  const eqTxt = cl(a1, 'a') + ' = ' + cl(b1, 'b') + ' + ' + cl(c1, 'c');
  const multiples = m => { const t = []; for (let x = 0; x <= 9; x += m) t.push(x); return t; };
  let obs = '';
  if (gab > 1 && pgcd(gab, c1) === 1) obs = ' Comme ' + cl(a1, 'a') + ' et ' + cl(b1, 'b') + ' sont des multiples de ' + gab + ', ' + cl(c1, 'c') + ' doit l\'être aussi : c vaut ' + enumTxt(multiples(gab), 'ou') + '.';
  else if (gac > 1 && pgcd(gac, b1) === 1) obs = ' Comme ' + cl(a1, 'a') + ' et ' + cl(c1, 'c') + ' sont des multiples de ' + gac + ', ' + cl(b1, 'b') + ' doit l\'être aussi : b vaut ' + enumTxt(multiples(gac), 'ou') + '.';
  const parTxt = Object.keys(parA).map(a => 'a = ' + a + ' : ' + cl(b1, 'b') + ' + ' + cl(c1, 'c') + ' = ' + (a1 * a) + ', d\'où ' + enumTxt(parA[a])).join(' ; ');
  const expl = M_EQ3 + ' 100a + 10b + c = ' + k + '(a + b + c) donne ' + cl(A_, 'a') + ' = ' + cl(B_, 'b') + ' + ' + cl(C_, 'c') +
    (g > 1 ? ', soit ' + eqTxt : '') + '.' + obs + ' Le membre de gauche vaut au plus ' + a1 + ' × 9 = ' + (9 * a1) + ', ce qui limite fortement b et c. ' +
    parTxt + (L.length > 1 ? '. Il y en a ' + L.length + '.' : '. C\'est la seule solution.');
  const pieges = L.length > 1 ? [[1, v => 'Piège : ' + v + ' revient à s\'arrêter au premier nombre trouvé.']] : [[0, v => 'Piège : ' + v + ' conclut trop vite qu\'aucun nombre ne convient.'], [2, null]];
  const premiers = Object.keys(parA);
  if (premiers.length > 1) pieges.push([parA[premiers[0]].length, v => 'Piège : ' + v + ' ne cherche que pour a = ' + premiers[0] + ' ; d\'autres premiers chiffres marchent aussi.']);
  return sortie(q, L.length, pieges, expl, {min: 0});
}

const CRIT5 = {
  11: 'Pour 11, la somme alternée a − b + c − b + a = 2a − 2b + c doit être un multiple de 11. Pour chaque couple (a, b), cela fixe c, sauf quand il faudrait c = 10 : c\'est le cas si b − a vaut 5 ou −6, soit 4 + 4 = 8 couples (a, b) sur 90. Total : 90 − 8 = 82.',
  9: 'La somme des chiffres 2a + 2b + c doit être un multiple de 9. Pour chaque couple (a, b), un seul c convient, sauf si 2(a + b) est déjà un multiple de 9 (a + b vaut 9 ou 18) : alors c = 0 ou c = 9. Il y a 9 + 1 = 10 tels couples. Total : 90 + 10 = 100.',
  3: 'La somme des chiffres 2a + 2b + c doit être un multiple de 3. Pour chaque couple (a, b), c a 4 valeurs (0, 3, 6, 9) si a + b est un multiple de 3, et 3 valeurs sinon. Couples avec a + b multiple de 3 : 3 × 4 + 3 × 3 + 3 × 3 = 30. Total : 30 × 4 + 60 × 3 = 300.',
  4: 'Les deux derniers chiffres « b puis a » doivent former un multiple de 4 : a pair ; pour a = 2 ou 6, b impair, pour a = 4 ou 8, b pair, soit 4 × 5 = 20 couples (a, b). Le chiffre du milieu c est libre. Total : 20 × 10 = 200.',
  25: 'Les deux derniers chiffres « b puis a » doivent valoir 00, 25, 50 ou 75 ; comme a n\'est pas nul, il reste 25 et 75 : a = 5 et b = 2 ou 7. Le chiffre du milieu c est libre. Total : 2 × 10 = 20.'
};
function n5PalinDiv5(R){
  const choix = R.pick([['5', 11], ['5', 9], ['5', 3], ['5', 4], ['5', 25], ['6', 11]]), L = Number(choix[0]), d = choix[1];
  const liste = palins(L, 1, 9), bonne = liste.filter(n => n % d === 0).length, tot = liste.length;
  const q = INTRO(L, R) + ' Combien de palindromes à ' + MOTS[L] + ' chiffres sont divisibles par ' + d + ' ?';
  let expl, pieges;
  if (L === 6){
    expl = M_DIV + ' Un palindrome abccba vaut 100001a + 10010b + 1100c, et 100001 = 11 × 9091, 10010 = 11 × 910, 1100 = 11 × 100 : il est toujours divisible par 11. Les 9 × 10 × 10 = 900 palindromes à six chiffres conviennent.';
    pieges = [[Math.round(tot / 11), v => 'Piège : ' + v + ' suppose qu\'un palindrome sur onze convient ; ici tous sont des multiples de 11.'], [90, v => 'Piège : ' + v + ' oublie un chiffre libre.'], [0, null]];
  } else {
    expl = M_DIV + ' Un palindrome à cinq chiffres s\'écrit abcba, avec 90 couples (a, b) possibles. ' + CRIT5[d];
    pieges = [[Math.round(tot / d), v => 'Piège : ' + v + ' suppose qu\'un palindrome sur ' + d + ' convient, au lieu d\'appliquer le critère.']];
    if (d === 11) pieges.push([90, v => 'Piège : ' + v + ' suppose qu\'on trouve toujours un chiffre du milieu qui convient ; pour 8 couples, il faudrait c = 10.']);
    if (d === 9) pieges.push([90, v => 'Piège : ' + v + ' oublie que c peut valoir 0 ou 9 quand a + b vaut 9 ou 18.']);
    if (d === 3) pieges.push([270, v => 'Piège : ' + v + ' compte toujours trois valeurs de c, alors qu\'il y en a quatre (0, 3, 6, 9) quand a + b est un multiple de 3.']);
    if (d === 4) pieges.push([400, v => 'Piège : ' + v + ' compte les palindromes pairs ; être pair ne suffit pas pour être divisible par 4.']);
    if (d === 25) pieges.push([40, v => 'Piège : ' + v + ' garde aussi les fins 00 et 50, impossibles car le dernier chiffre est aussi le premier.']);
  }
  return sortie(q, bonne, pieges, expl, {min: 0});
}

function n5Rang3(R){ return rangSortie(R.int(1201, 2889), R); }

function n5Pages4(R){
  const N = R.int(1000, 3000), D = 4 * N - 1107, r = D - 2889, qq = r / 4;
  if (R.int(0, 1) === 0){
    const q = R.pick(NUMEROTE_INV)(nb(D));
    const expl = 'On retire les chiffres utilisés par les numéros à un, deux et trois chiffres, puis on divise le reste par quatre. ' +
      'De 1 à 9 : 9 ; de 10 à 99 : 180 ; de 100 à 999 : 900 × 3 = 2 700 ; total 2 889. Il reste ' + nb(D) + ' − 2 889 = ' + nb(r) + ' chiffres, soit ' + nb(r) + ' ÷ 4 = ' + nb(qq) + ' numéros à quatre chiffres, de 1 000 à 999 + ' + nb(qq) + ' = ' + nb(N) + '. La réponse est ' + nb(N) + '.';
    return sortie(q, N, [
      [N + 1, v => 'Piège : ' + v + ' : le dernier numéro est 999 + ' + nb(qq) + ', pas 1 000 + ' + nb(qq) + '.'],
      [qq, v => 'Piège : ' + v + ' est le nombre de numéros à quatre chiffres seulement.'],
      [Math.round(D / 4), v => 'Piège : ' + v + ' suppose que tous les numéros ont quatre chiffres.']
    ], expl, {min: 1});
  }
  const q = 'Pour numéroter les pages d\'une encyclopédie de ' + nb(N) + ' pages, de 1 à ' + nb(N) + ', combien de chiffres faut-il imprimer en tout ?';
  const M = N - 999;
  const expl = 'On compte par tranches, les numéros à un, deux, trois puis quatre chiffres, chaque tranche avec la règle « dernier moins premier plus un ». ' +
    'De 1 à 9 : 9 ; de 10 à 99 : 180 ; de 100 à 999 : 2 700 ; total 2 889. De 1 000 à ' + nb(N) + ' : ' + nb(M) + ' numéros, soit 4 × ' + nb(M) + ' = ' + nb(4 * M) + ' chiffres. Total : 2 889 + ' + nb(4 * M) + ' = ' + nb(D) + '.';
  return sortie(q, D, [
    [4 * N, v => 'Piège : ' + v + ' compte quatre chiffres pour chaque page.'],
    [D - 4, v => 'Piège : ' + v + ' oublie le +1 : de 1 000 à ' + nb(N) + ', il y a ' + nb(M) + ' numéros.'],
    [D - 900, v => 'Piège : ' + v + ' compte deux chiffres au lieu de trois pour les pages 100 à 999.']
  ], expl, {min: 1});
}

function n5CompteChiffre3(R){
  const N = R.pick([199, 299, 399, 499, 599, 699, 799, 899, 999, 1000]), d = R.int(1, 9);
  const u = occPos(N, d, 1), t = occPos(N, d, 10), h = occPos(N, d, 100), m = N === 1000 && d === 1 ? 1 : 0, bonne = u + t + h + m;
  let contient = 0; for (let n = 1; n <= N; n++) if (String(n).indexOf(String(d)) >= 0) contient++;
  const expl = 'On compte ce chiffre position par position, unités, dizaines puis centaines, et on additionne. ' +
    'Unités : une fois tous les dix nombres, soit ' + u + ' fois. Dizaines : dix fois par centaine (de ' + d + '0 à ' + d + '9), soit ' + t + ' fois. ' +
    'Centaines : ' + (h ? 'les cent nombres de ' + d + '00 à ' + d + '99, soit 100 fois. ' : 'aucun, car ' + d + '00 dépasse ' + N + '. ') +
    (m ? 'Et 1 000 apporte un chiffre 1 de plus. ' : '') + 'Total : ' + [u, t, h].concat(m ? [m] : []).join(' + ') + ' = ' + bonne + '.';
  return sortie(R.pick(ECRIRE)(N, d), bonne, [
    [contient, v => 'Piège : ' + v + ' compte les nombres qui contiennent le chiffre, pas le nombre de fois où il est écrit : ' + (111 * d <= N ? 111 * d : 11 * d) + ' le contient plusieurs fois.'],
    h ? [u + t + m, v => 'Piège : ' + v + ' oublie les chiffres des centaines.'] : null,
    [u + h + m, v => 'Piège : ' + v + ' oublie les chiffres des dizaines.']
  ], expl, {min: 1});
}

function n5RenverseMult(R){
  const forme = R.pick(['mult', 'mult', 'mult', 'carre', 'dcarre', 'dcube']);
  const L = [], avec0 = [];
  let q, cond, expl;
  const intro = 'On appelle renversé d\'un nombre à deux chiffres le nombre obtenu en inversant ses chiffres (le renversé de 47 est 74).';
  if (forme === 'mult'){
    const m = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17]);
    q = intro + ' Combien de nombres à deux chiffres, sans chiffre 0, ont une somme avec leur renversé qui est un multiple de ' + m + ' ?';
    cond = (a, b) => (11 * (a + b)) % m === 0;
    const sommes = []; for (let s = 2; s <= 18; s++) if (s % m === 0) sommes.push(s);
    const nbS = sommes.map(s => { let n = 0; for (let a = 1; a <= 9; a++){ const b = s - a; if (b >= 1 && b <= 9) n++; } return n; });
    expl = 'La somme d\'un nombre et de son renversé vaut onze fois la somme des chiffres : on ramène la condition à une condition sur cette somme, puis on compte les couples de chiffres. ' +
      '(10a + b) + (10b + a) = 11 × (a + b), et 11 n\'a aucun facteur commun avec ' + m + ' : il faut que a + b soit un multiple de ' + m + ', entre 2 et 18. ' +
      'Sommes possibles : ' + enumTxt(sommes) + '. Avec a et b de 1 à 9, une somme t donne t − 1 nombres si t vaut au plus 10, et 19 − t sinon : ' + sommes.map((s, i) => s + ' → ' + nbS[i]).join(' ; ') + '. Total : ' + (nbS.length > 1 ? nbS.join(' + ') + ' = ' : '') + somme(nbS) + '.';
    for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) if (cond(a, b)) L.push(10 * a + b);
    for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) if (cond(a, b)) avec0.push(10 * a + b);
    const maxS = sommes[sommes.length - 1], nMax = nbS[nbS.length - 1];
    return sortie(q, L.length, [
      [sommes.length, v => 'Piège : ' + v + ' compte les sommes de chiffres possibles, pas les nombres.'],
      [avec0.length, v => 'Piège : ' + v + ' compte aussi des nombres avec un 0, exclus par l\'énoncé.'],
      sommes.length > 1 ? [L.length - nMax, v => 'Piège : ' + v + ' oublie la somme ' + maxS + '.'] : null
    ], expl, {min: 1});
  }
  if (forme === 'carre'){
    q = intro + ' Combien de nombres à deux chiffres, sans chiffre 0, ont une somme avec leur renversé qui est un carré parfait ?';
    for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++){ const v = 11 * (a + b), r = Math.round(Math.sqrt(v)); if (r * r === v) L.push(10 * a + b); }
    expl = 'La somme d\'un nombre et de son renversé vaut onze fois la somme des chiffres : on cherche quand ce produit peut être un carré. ' +
      '11 × (a + b) est un carré seulement si a + b contient lui aussi le facteur 11 ; comme a + b est entre 2 et 18, il faut a + b = 11, et la somme vaut 121 = 11². Nombres : ' + enumTxt(L) + '. Il y en a ' + L.length + '.';
    return sortie(q, L.length, [
      [14, v => 'Piège : ' + v + ' cherche une somme des chiffres qui soit un carré (4, 9 ou 16), alors que c\'est 11 × (a + b) qui doit en être un.'],
      [1, v => 'Piège : ' + v + ' revient à s\'arrêter au premier exemple trouvé.'],
      [9, null]
    ], expl, {min: 1});
  }
  const cube = forme === 'dcube';
  q = intro + ' Combien de nombres à deux chiffres, sans chiffre 0, sont tels que le nombre moins son renversé est un ' + (cube ? 'cube parfait' : 'carré parfait') + ' non nul ?';
  for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++){ const v = 9 * (a - b); if (v > 0){ const r = Math.round(cube ? Math.cbrt(v) : Math.sqrt(v)); if ((cube ? r * r * r : r * r) === v) L.push(10 * a + b); } }
  for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++){ const v = 9 * (a - b); if (v > 0){ const r = Math.round(cube ? Math.cbrt(v) : Math.sqrt(v)); if ((cube ? r * r * r : r * r) === v) avec0.push(10 * a + b); } }
  if (cube){
    expl = 'La différence entre un nombre et son renversé vaut neuf fois l\'écart des chiffres : on cherche quand ce produit peut être un cube. ' +
      '9 × (a − b) avec a − b entre 1 et 8 : seul 9 × 3 = 27 = 3³ est un cube. Il faut a − b = 3 avec b au moins 1 : ' + enumTxt(L) + '. Il y en a ' + L.length + '.';
    return sortie(q, L.length, [
      [avec0.length, v => 'Piège : ' + v + ' compte aussi 30, qui contient un 0, exclu par l\'énoncé.'],
      [1, v => 'Piège : ' + v + ' revient à s\'arrêter au premier exemple trouvé.'],
      [3, null]
    ], expl, {min: 1});
  }
  expl = 'La différence entre un nombre et son renversé vaut neuf fois l\'écart des chiffres : comme neuf est déjà un carré, il faut que l\'écart en soit un aussi. ' +
    '9 × (a − b) est un carré non nul quand a − b vaut 1, 4 ou 9 ; avec b au moins 1, a − b = 9 est impossible. a − b = 1 : 8 nombres (21 à 98) ; a − b = 4 : 5 nombres (51 à 95). Total : 8 + 5 = 13.';
  return sortie(q, L.length, [
    [8, v => 'Piège : ' + v + ' ne garde que l\'écart 1 et oublie l\'écart 4 (9 × 4 = 36 = 6²).'],
    [avec0.length, v => 'Piège : ' + v + ' compte aussi des nombres avec un 0 (comme 10, 40 ou 90), exclus par l\'énoncé.'],
    [3, v => 'Piège : ' + v + ' compte les écarts possibles, pas les nombres.']
  ], expl, {min: 1});
}

function n5SommeTous3(R){ return sommeTousSortie(100 * R.int(2, 10) - 1, R); }

/* ---------- répartition par niveau ---------- */
const NIVEAUX = {
  1: [n1Neuf, n1SommeDeux, n1Renverse, n1Pages2, n1Compte, n1PalinTranche],
  2: [n2Kfois, n2RenverseCompte, n2Produit2, n2Pages3, n2PalinSuivant, n2NeufK, n2PalinCompte],
  3: [n3Equation, n3RenverseSomme, n3PalinDiv, n3NeufM, n3PagesInv, n3Rang2, n3Somme3],
  4: [n4Renverse3, n4Produit3, n4AuMoins, n4NeufFois, n4Rang3, n4Repunit, n4Blocs, n4PalinDiv, n4SommeTous2],
  5: [n5Somme3Grand, n5Kfois3, n5PalinDiv5, n5Rang3, n5Pages4, n5CompteChiffre3, n5RenverseMult, n5SommeTous3]
};
function valide(e){
  if (!e || typeof e.q !== 'string' || typeof e.a !== 'string' || !Array.isArray(e.choix) || e.choix.length !== 4) return false;
  const n = e.choix.map(norm);
  return new Set(n).size === 4 && n.filter(x => x === norm(e.a)).length === 1;
}
function secours(){
  return {
    q: 'Quelle est la somme des chiffres du nombre 10⁷ − 1 ?',
    a: '63', accept: null, choix: ['63', '54', '72', '7'],
    expl: 'Une puissance de dix diminuée de un s\'écrit uniquement avec des chiffres neuf : il suffit de compter ces neuf. 10⁷ − 1 = 9 999 999 s\'écrit avec 7 chiffres 9 : la somme vaut 7 × 9 = 63. Piège : 7 est le nombre de chiffres, pas leur somme.'
  };
}

A.push({
  id: 'alb-17-chiffres-ecriture',
  phase: 'albert',
  ordre: 17,
  theme: 'arithmetique',
  titre: 'Écriture décimale : 10a + b, chiffres, palindromes',
  objectif: 'Écrire un nombre avec ses chiffres (10a + b, 100a + 10b + c) pour compter des nombres, renverser un nombre, trouver une somme de chiffres ou un palindrome, sans calculatrice et sans oublier de cas.',
  lecon:
`<p class="lede">Au test, plusieurs questions jouent sur l'<mark>écriture des nombres</mark> : un nombre qu'on retourne, une somme de chiffres, un palindrome, des pages à numéroter. Le réflexe qui débloque presque tout : écrire le nombre avec ses chiffres, sous la forme <mark>10a + b</mark>.</p>
<h2>Ce que le test demande</h2>
<p>On te demande rarement un long calcul. On te demande plutôt de <strong>compter</strong> les nombres qui vérifient une condition sur leurs chiffres (combien de nombres à deux chiffres valent quatre fois la somme de leurs chiffres ?), de trouver la <strong>somme des chiffres</strong> d'un nombre gigantesque comme 10³⁰ − 7, de compter des <strong>palindromes</strong>, ou de savoir combien de chiffres on écrit pour numéroter des pages. Les questions les plus difficiles ajoutent un critère de divisibilité.</p>
<h2>Ce qu'il faut savoir avant</h2>
<p>Un <mark>chiffre</mark> est l'un des dix symboles de 0 à 9 ; un nombre s'écrit avec des chiffres. Dans 47, le chiffre des dizaines est 4 et celui des unités est 7, donc 47 = 10 × 4 + 7.</p>
<div class="formule"><p>nombre à deux chiffres : 10a + b, avec a de 1 à 9 et b de 0 à 9</p><p>nombre à trois chiffres : 100a + 10b + c</p></div>
<p>Le premier chiffre n'est jamais 0 : 07 n'est pas un nombre à deux chiffres. Le <strong>renversé</strong> de 10a + b est 10b + a. Un <mark>palindrome</mark> se lit de la même façon dans les deux sens, comme 747 ou 5225. Enfin, 10ⁿ s'écrit avec un 1 suivi de n zéros, donc 10ⁿ − 1 s'écrit avec n chiffres 9.</p>
<table class="tbl"><tr><th>Divisible par</th><th>Critère</th></tr>
<tr><td>2 ; 5</td><td>dernier chiffre pair ; dernier chiffre 0 ou 5</td></tr>
<tr><td>3 ; 9</td><td>somme des chiffres multiple de 3 ; de 9</td></tr>
<tr><td>4 ; 25</td><td>les deux derniers chiffres forment un multiple de 4 ; de 25</td></tr>
<tr><td>11</td><td>somme alternée des chiffres (+, −, +, …) multiple de 11 : pour 2 728, 2 − 7 + 2 − 8 = −11</td></tr></table>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. J'écris le nombre avec ses chiffres :</strong> 10a + b ou 100a + 10b + c, en notant les bornes de chaque chiffre.</p>
<p><strong>2. Je traduis la phrase en équation :</strong> « égal à 4 fois la somme de ses chiffres » donne 10a + b = 4(a + b).</p>
<p><strong>3. Je simplifie :</strong> 10a + b = 4a + 4b donne 6a = 3b, soit b = 2a.</p>
<p><strong>4. Je liste toutes les solutions</strong> en faisant varier le premier chiffre et en vérifiant les bornes : a va de 1 à 4, d'où 12, 24, 36 et 48, soit 4 nombres.</p>
</div>
<h2>Exemples résolus</h2>
<h3>Exemple 1 : la somme des chiffres de 10¹⁵ − 1</h3>
<p>10¹⁵ − 1 = 999…9 s'écrit avec 15 chiffres 9. La somme vaut 15 × 9 = <strong>135</strong>. Variante : 10¹⁵ − 7 s'écrit avec 14 chiffres 9 suivis d'un 3 (comme 10⁴ − 7 = 9 993), d'où 14 × 9 + 3 = 129.</p>
<h3>Exemple 2 : on retourne un nombre</h3>
<p>Combien de nombres à deux chiffres augmentent de 36 quand on inverse leurs chiffres ? (10b + a) − (10a + b) = 9(b − a) = 36, donc b = a + 4. Avec a au moins 1 et b au plus 9 : 15, 26, 37, 48 et 59, soit <strong>5 nombres</strong>. Retiens : nombre moins renversé = 9 × (écart des chiffres), nombre plus renversé = 11 × (somme des chiffres).</p>
<h3>Exemple 3 : des pages à numéroter</h3>
<p>Livre de 250 pages : 9 chiffres pour les pages 1 à 9, 90 × 2 = 180 pour les pages 10 à 99, et 151 × 3 = 453 pour les pages 100 à 250 (250 − 100 + 1 = 151 pages). Total : 9 + 180 + 453 = <strong>642 chiffres</strong>.</p>
<h3>Exemple 4 : niveau du test, palindromes et divisibilité</h3>
<p>Combien de palindromes à quatre chiffres compris entre 2000 et 4999 sont divisibles par 9 ? Un tel palindrome s'écrit abba, et sa somme des chiffres vaut 2(a + b) : elle est multiple de 9 seulement si a + b vaut 9 ou 18. Avec a = 2, 3 ou 4 : 2772, 3663 et 4554, soit <strong>3 palindromes</strong>. Et pour 11 ? abba = 1001a + 110b = 11 × (91a + 10b) : tous les palindromes à quatre chiffres sont des multiples de 11.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl"><tr><th>Écriture</th><th>Ce qu'on en tire</th></tr>
<tr><td>10ⁿ − 1</td><td>n chiffres 9</td></tr>
<tr><td>99…9 × k</td><td>somme des chiffres 9 × (nombre de 9), tant que k ne dépasse pas le nombre de 9 écrit</td></tr>
<tr><td>abc − cba</td><td>99 × (a − c) : le chiffre du milieu disparaît</td></tr>
<tr><td>abcabc</td><td>abc × 1001, et 1001 = 7 × 11 × 13</td></tr>
<tr><td>pages 1 à 9, 10 à 99, 100 à 999</td><td>9, puis 180, puis 2 700 chiffres</td></tr>
<tr><td>palindromes à 3, 4, 5 chiffres</td><td>90, 90, 900 : seule la première moitié est libre</td></tr></table>
<p>Pour compter, fais varier le premier chiffre et écris la liste : c'est plus sûr qu'une formule apprise par cœur. Pour un produit de chiffres, n'oublie pas le chiffre 1 (12 = 1 × 2 × 6). Pour « au moins un chiffre 7 », compte plutôt les nombres qui n'en ont aucun, place par place, et retire-les du total. Face à une règle inconnue, essaie un petit cas : 999 × 7 = 6 993, dont la somme des chiffres vaut 27.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Écris le nombre avec ses chiffres (10a + b ou 100a + 10b + c), traduis l'énoncé en équation sur les chiffres, puis liste toutes les solutions en gardant chaque chiffre entre 0 et 9 et le premier chiffre non nul.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Faire commencer un nombre par 0. Oublier un nombre qui finit par 0, comme 70. Oublier le chiffre 1 dans un produit de chiffres. Compter 26 et 62 comme un seul nombre. Oublier le +1 en comptant de 10 à N. Confondre un chiffre et un nombre, ou la somme des chiffres et le nombre de chiffres. Prendre « un sur onze » pour les palindromes divisibles par 11 au lieu d'écrire abba en fonction de a et b.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Nombre : 10a + b ; renversé : 10b + a ; leur somme : 11(a + b) ; leur différence : 9(a − b). 10ⁿ − 1 s'écrit avec n chiffres 9. Un palindrome est fixé par sa première moitié. Pages : 9, puis 180, puis 2 700 chiffres.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const e = R.pick(NIVEAUX[n])(R);
      return valide(e) ? e : secours();
    } catch (err){
      return secours();
    }
  }
});

})();
