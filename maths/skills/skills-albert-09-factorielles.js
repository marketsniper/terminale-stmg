/* ===== Maths · Objectif Albert School : alb-09 · Factorielles, divisibilité et restes de division =====
   Une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS (aucun symbole de premier niveau).
   gen(level, R) n'utilise que R.int, R.pick, R.shuffle ; niveau borné de 1 à 5 ; jamais d'exception.
   Toutes les réponses sont calculées par le code : exposants des facteurs premiers dans n! (comptes de
   multiples), critères de divisibilité, restes de proche en proche, recherches exhaustives sur les chiffres.
   Vérification indépendante : contenu/verifs/alb-09-factorielles-verif.js (factorielles exactes en BigInt,
   divisions directes, force brute). */
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

/* ---------- aides propres à cette compétence ---------- */
const FINE = ' ';
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(c => SUP[+c]).join('');
const pw = (b, e) => (e === 1 ? nb(b) : nb(b) + sup(e));            // 2⁷, 3², 5
const fa = n => nb(n) + '!';                                          // 2 026!
const somme = l => l.reduce((s, x) => s + x, 0);
const produit = l => l.reduce((s, x) => s * x, 1);
const listeEt = l => (l.length < 2 ? l.join('') : l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1]);
const listeOu = l => (l.length < 2 ? l.join('') : l.slice(0, -1).join(', ') + ' ou ' + l[l.length - 1]);
const listeDe = l => 'de ' + (l.length < 2 ? l.join('') : l.slice(0, -1).join(', de ') + ' ou de ' + l[l.length - 1]);
const pl = (n, s, p) => nb(n) + ' ' + (n > 1 ? (p || s + 's') : s);
const deux = x => (x < 10 ? '0' : '') + x;
function mk(q, bonne, autres, voisin, expl){ return {q, a: bonne, accept: null, choix: qcm(bonne, autres, voisin), expl}; }
const vNombre = bonne => k => { const v = bonne + (k % 2 ? 1 : -1) * Math.ceil(k / 2); return v >= 0 ? nb(v) : null; };
const vChiffre = bonne => k => String((bonne + k) % 10);
const rien = () => null;
/* n! exact en nombre JavaScript jusqu'à 18! (6,4 × 10¹⁵ < 2⁵³). */
function fact(n){ let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; }
/* Nombre de facteurs p dans n! : n ÷ p + n ÷ p² + … (parties entières). */
function vp(n, p){ let s = 0; for (let q = p; q <= n; q *= p) s += Math.floor(n / q); return s; }
function vpTermes(n, p){ const t = []; for (let q = p; q <= n; q *= p) t.push([q, Math.floor(n / q)]); return t; }
function facto(d){
  const out = []; let x = d;
  for (let p = 2; p * p <= x; p++){ if (x % p === 0){ let e = 0; while (x % p === 0){ x /= p; e++; } out.push([p, e]); } }
  if (x > 1) out.push([x, 1]);
  return out;
}
const ecrit = f => f.map(([p, e]) => pw(p, e)).join(' × ');
const estPremier = x => { if (x < 2) return false; for (let p = 2; p * p <= x; p++) if (x % p === 0) return false; return true; };
function premiersJusqua(n){ const l = []; for (let p = 2; p <= n; p++) if (estPremier(p)) l.push(p); return l; }
const decompFact = n => premiersJusqua(n).map(p => [p, vp(n, p)]);
const divFact = (n, d) => facto(d).every(([p, e]) => vp(n, p) >= e);
const sch = x => String(x).split('').reduce((s, c) => s + Number(c), 0);
const plusChiffres = x => String(x).split('').join(' + ');
function pgcd(a, b){ while (b){ const t = a % b; a = b; b = t; } return a; }
const ppcmL = l => l.reduce((m, x) => m / pgcd(m, x) * x, 1);
function tirer(f, essais){ for (let i = 0; i < (essais || 400); i++){ const x = f(); if (x != null) return x; } return null; }
/* Somme alternée depuis les unités : u − d + c − … */
function alt(x){ const c = String(x).split('').reverse().map(Number); return c.reduce((s, v, i) => s + (i % 2 ? -v : v), 0); }
function altTxt(x){ const c = String(x).split('').reverse(); return c.map((v, i) => (i === 0 ? v : (i % 2 ? ' − ' : ' + ') + v)).join('') + ' = ' + nb(alt(x)); }
/* Texte « 30 ÷ 5 → 6 ; 30 ÷ 25 → 1 » et total. */
function legendre(n, p){
  const t = vpTermes(n, p);
  return {t, v: somme(t.map(x => x[1])), txt: t.map(([q, v]) => nb(n) + ' ÷ ' + nb(q) + ' → ' + nb(v)).join(' ; '), plus: t.map(x => nb(x[1])).join(' + ')};
}
/* Multiples de p jusqu'à n et facteurs p apportés par chacun. */
function apport(n, p){
  const m = [], v = [];
  for (let x = p; x <= n; x += p){ let e = 0, y = x; while (y % p === 0){ y /= p; e++; } m.push(x); v.push(e); }
  const tot = somme(v);
  return 'multiples de ' + p + ' jusqu\'à ' + n + ' : ' + listeEt(m.map(String)) + ', ' + (m.length > 1 ? 'qui apportent ' + v.join(' + ') + ' = ' + tot : 'qui apporte ' + tot) + ' ' + (tot > 1 ? 'facteurs ' : 'facteur ') + p;
}
/* Plus petit n tel que n! contienne au moins e facteurs p : on avance de multiple en multiple. */
function chaineMin(p, e){
  let c = 0, x = 0; const pas = [];
  while (c < e){ x += p; let y = x; while (y % p === 0){ y /= p; c++; } pas.push(nb(x) + ' → ' + c); }
  return {n: x, txt: pas.join(', ')};
}
const nMin = f => Math.max.apply(null, f.map(([p, e]) => chaineMin(p, e).n));
/* Écriture d'un nombre par blocs de trois chiffres, avec des chiffres masqués. */
function affiche(s, caches){
  const ch = s.split('').map((c, i) => caches[i] || c), out = [];
  for (let i = ch.length; i > 0; i -= 3) out.unshift(ch.slice(Math.max(0, i - 3), i).join(''));
  return out.join(FINE);
}
function prodTxt(M, N){
  if (M === N) return '1 × 2 × … × ' + nb(N);
  if (M === N - 1) return '1 × 2 × … × ' + nb(M) + ' × ' + nb(N);
  return '1 × 2 × … × ' + nb(M) + ' × … × ' + nb(N);
}
const RAPPEL = ' (Rappel : n! = 1 × 2 × 3 × … × n.)';

/* =====================================================================
   Briques communes
   ===================================================================== */

/* Critères de divisibilité : « Parmi les nombres …, lequel est divisible par k ? » */
const CRIT = {
  3: {lo: 1000, hi: 9999,
    pieges: [x => x % 10 === 3, x => x % 10 === 6 || x % 10 === 9, x => sch(x) % 10 === 3],
    methode: 'On additionne les chiffres de chaque nombre : un nombre est divisible par trois exactement quand la somme de ses chiffres l\'est.',
    test: x => plusChiffres(x) + ' = ' + sch(x) + (sch(x) % 3 ? ', non' : ', oui'),
    piege: 'Piège : le dernier chiffre ne dit rien pour 3 (13, 26 ou 29 ne sont pas des multiples de 3), seule la somme des chiffres compte.'},
  9: {lo: 1000, hi: 9999,
    pieges: [x => x % 3 === 0, x => x % 10 === 9, x => sch(x) % 10 === 9],
    methode: 'On additionne les chiffres de chaque nombre : un nombre est divisible par neuf exactement quand la somme de ses chiffres l\'est.',
    test: x => plusChiffres(x) + ' = ' + sch(x) + (sch(x) % 9 ? ', non' : ', oui'),
    piege: 'Piège : se terminer par 9 ne suffit pas, et un multiple de 3 n\'est pas forcément un multiple de 9 : c\'est la somme des chiffres qui doit être un multiple de 9.'},
  4: {lo: 1000, hi: 9999,
    pieges: [x => x % 10 === 4 || x % 10 === 8, x => x % 2 === 0, x => sch(x) % 4 === 0],
    methode: 'On regarde seulement les deux derniers chiffres : un nombre est divisible par quatre exactement quand le nombre formé par ses deux derniers chiffres l\'est.',
    test: x => { const d = x % 100; return deux(d) + (d % 4 ? ' n\'est pas un multiple de 4, non' : ' = 4 × ' + d / 4 + ', oui'); },
    piege: 'Piège : se terminer par 4 ou 8 ne suffit pas (14 et 38 ne sont pas des multiples de 4), et un nombre pair n\'est pas forcément un multiple de 4.'},
  8: {lo: 10000, hi: 99999,
    pieges: [x => x % 4 === 0, x => (x % 100) % 8 === 0, x => x % 10 === 8],
    methode: 'On regarde seulement les trois derniers chiffres : un nombre est divisible par huit exactement quand le nombre formé par ses trois derniers chiffres l\'est.',
    test: x => { const d = x % 1000; return nb(d) + (d % 8 ? ' = 8 × ' + Math.floor(d / 8) + ' + ' + (d % 8) + ', non' : ' = 8 × ' + d / 8 + ', oui'); },
    piege: 'Piège : pour 8, les deux derniers chiffres ne suffisent pas, il en faut trois (116 n\'est pas un multiple de 8, alors que 16 l\'est).'},
  11: {lo: 1000, hi: 99999,
    pieges: [x => sch(x) % 11 === 0, x => x % 100 === 11, x => Math.abs(alt(x)) % 11 === 1],
    methode: 'On calcule la somme alternée des chiffres en partant des unités (plus, moins, plus…) : un nombre est divisible par onze exactement quand ce résultat est un multiple de onze, zéro compris.',
    test: x => altTxt(x) + (alt(x) % 11 ? ', non' : ', oui'),
    piege: 'Piège : pour 11, la somme des chiffres ne sert à rien et se terminer par 11 non plus : seule la somme alternée compte.'},
  6: {lo: 1000, hi: 9999,
    pieges: [x => x % 2 === 0, x => x % 3 === 0, x => x % 10 === 6],
    methode: 'Un nombre est divisible par six exactement quand il est pair et que la somme de ses chiffres est un multiple de trois.',
    test: x => (x % 2 ? 'impair' : 'pair') + ', somme des chiffres ' + sch(x) + (x % 6 ? ', non' : ', oui'),
    piege: 'Piège : il faut les deux conditions à la fois, être pair et avoir une somme de chiffres multiple de 3.'},
  12: {lo: 1000, hi: 9999,
    pieges: [x => x % 6 === 0, x => x % 4 === 0, x => x % 100 === 12],
    methode: 'Un nombre est divisible par douze exactement quand il est divisible par trois (somme des chiffres) et par quatre (deux derniers chiffres).',
    test: x => 'somme des chiffres ' + sch(x) + ', deux derniers chiffres ' + deux(x % 100) + (x % 12 ? ', non' : ', oui'),
    piege: 'Piège : il faut 3 et 4 ; être divisible par 2 et par 6 ne suffit pas (18 l\'est, mais pas par 12).'},
  15: {lo: 1000, hi: 9999,
    pieges: [x => x % 10 === 5, x => x % 3 === 0, x => x % 100 === 15],
    methode: 'Un nombre est divisible par quinze exactement quand il est divisible par trois (somme des chiffres) et par cinq (dernier chiffre zéro ou cinq).',
    test: x => 'dernier chiffre ' + (x % 10) + ', somme des chiffres ' + sch(x) + (x % 15 ? ', non' : ', oui'),
    piege: 'Piège : il faut les deux conditions à la fois, 3 et 5.'}
};
function gCritere(R, k){
  const C = CRIT[k];
  for (let essai = 0; essai < 60; essai++){
    const bon = tirer(() => { const x = R.int(C.lo, C.hi); return x % k === 0 ? x : null; });
    const pieges = C.pieges.map(f => tirer(() => { const x = R.int(C.lo, C.hi); return f(x) && x % k !== 0 ? x : null; }, 1500));
    const l = [bon].concat(pieges);
    if (l.some(x => x == null) || new Set(l).size !== 4) continue;
    const ordre = R.shuffle(l);
    const q = 'Parmi les nombres ' + listeEt(ordre.map(x => nb(x))) + ', lequel est divisible par ' + k + ' ?';
    const expl = C.methode + ' ' + ordre.map(x => nb(x) + ' : ' + C.test(x)).join(' ; ') + '. Seul ' + nb(bon) + ' est divisible par ' + k + '. ' + C.piege;
    return mk(q, nb(bon), pieges.map(x => nb(x)), rien, expl);
  }
  return null;
}

/* Somme 1! + 2! + … + N! : reste par m, chiffre des unités (m = 10) ou deux derniers chiffres (m = 100). */
function seuil(m){ let k = 1; while (fact(k) % m !== 0) k++; return k; }
function gSommeFact(R, m, N){
  const t = seuil(m), fin = Math.min(N, t);
  const res = [], lignes = [];
  let r = 0;
  for (let k = 1; k <= fin; k++){
    const v = k === 1 ? 1 : r * k;
    r = v % m; res.push(r);
    lignes.push(k === 1 ? '1! → 1' : fa(k) + ' → ' + nb(res[k - 2]) + ' × ' + k + ' = ' + nb(v) + (v >= m ? ' → ' + nb(r) : ''));
  }
  const utiles = res.filter(x => x > 0), S = somme(utiles), rep = S % m;
  const quoi = m === 10 ? 'le chiffre des unités' : (m === 100 ? 'les deux derniers chiffres' : 'le reste');
  const serie = '1! + 2! + 3! + … + ' + fa(N);
  const q = m === 10 ? 'Quel est le chiffre des unités de la somme ' + serie + ' ?'
    : (m === 100 ? 'Quels sont les deux derniers chiffres de la somme ' + serie + ' ?'
      : 'Quel est le reste de la division euclidienne de ' + serie + ' par ' + m + ' ?');
  const intro = 'Dès qu\'une factorielle est divisible par le diviseur, toutes les suivantes le sont aussi, car elles en sont des multiples : seuls les premiers termes comptent, et l\'on calcule leurs restes de proche en proche.';
  const rendu = x => (m === 100 ? deux(x) : nb(x));
  let expl = intro + (m === 10 ? ' Le chiffre des unités est le reste de la division par 10.' : (m === 100 ? ' Les deux derniers chiffres forment le reste de la division par 100.' : ''))
    + ' Restes successifs (on multiplie à chaque fois le reste précédent par le nouveau facteur) : ' + lignes.join(' ; ') + '.';
  if (fin === t) expl += ' À partir de ' + fa(t) + ', tous les restes sont nuls jusqu\'à ' + fa(N) + '.';
  expl += ' Somme des restes : ' + utiles.map(nb).join(' + ') + ' = ' + nb(S) + (S >= m ? ', qui a pour reste ' + rendu(rep) : '') + '. Donc ' + quoi + (m === 100 ? ' sont ' : ' vaut ') + rendu(rep) + '.';
  /* Pièges : s'arrêter trop tôt (dès qu'un terme se termine par 0), croire que tout est nul. */
  const tronq = j => somme(res.slice(0, j)) % m;
  const autres = [];
  if (m === 100){ [4, 5, 6, 7, 8].forEach(j => { if (j < fin){ const v = tronq(j); if (v >= 10 && v !== rep) autres.push(deux(v)); } }); }
  else { autres.push('0'); if (fin >= 2) autres.push(nb(tronq(fin - 2 >= 1 ? fin - 2 : 1))); if (S >= m) autres.push(nb(S)); autres.push('1'); }
  if (m === 100 && fin === t) expl += ' Piège : 5! = 120 ne se termine que par un seul zéro, il compte encore pour les deux derniers chiffres ; seules les factorielles à partir de 10! se terminent par 00.';
  else if (fin === t && t >= 3) expl += ' Piège : ' + fa(t - 1) + ' n\'est pas encore divisible par ' + m + ', il ne faut pas l\'oublier.';
  const voisin = m === 100 ? (k => { const v = (rep + 20 * k) % 100; return v >= 10 ? deux(v) : null; }) : (k => { const v = (rep + k) % m; return nb(v); });
  return mk(q, rendu(rep), autres, voisin, expl);
}

/* Nombre de diviseurs d'un entier. */
function gDiviseurs(R, N){
  const f = facto(N), tau = produit(f.map(([, e]) => e + 1)), sig = somme(f.map(([, e]) => e + 1)), pe = produit(f.map(([, e]) => e));
  const q = R.int(0, 1) ? 'Combien de diviseurs positifs le nombre ' + nb(N) + ' possède-t-il (1 et ' + nb(N) + ' compris) ?'
    : 'En comptant 1 et ' + nb(N) + ', combien le nombre ' + nb(N) + ' a-t-il de diviseurs positifs ?';
  const paires = []; for (let d = 1; d * d <= N; d++) if (N % d === 0) paires.push(d + ' × ' + nb(N / d));
  const expl = 'On décompose le nombre en facteurs premiers : chaque diviseur s\'obtient en choisissant combien de fois on prend chacun de ces facteurs, de zéro fois jusqu\'au maximum. '
    + nb(N) + ' = ' + ecrit(f) + '. ' + f.map(([p, e], i) => (i ? 'facteur ' : 'Facteur ') + p + ' : de 0 à ' + e + ' fois, soit ' + (e + 1) + ' choix').join(' ; ')
    + '. Total : ' + f.map(([, e]) => e + 1).join(' × ') + ' = ' + tau + ' diviseurs.'
    + (tau <= 12 ? ' Vérification par paires : ' + paires.join(', ') + '.' : '')
    + ' Piège : additionner les nombres de choix au lieu de les multiplier donne ' + sig + ', et oublier 1 et ' + nb(N) + ' donne ' + (tau - 2) + '.';
  return mk(q, String(tau), [String(tau - 2), String(sig), pe > 1 ? String(pe) : null, tau % 2 ? null : String(tau / 2)], vNombre(tau), expl);
}
function listeDiv(lo, hi, pmax, tauMin){
  const l = [];
  for (let N = lo; N <= hi; N++){
    const f = facto(N);
    if (f.length < 2 || f.some(([p]) => p > pmax)) continue;
    if (produit(f.map(([, e]) => e + 1)) >= tauMin) l.push(N);
  }
  return l;
}
const DIV3 = listeDiv(30, 400, 7, 6), DIV4 = listeDiv(500, 2200, 23, 12);

/* Plus petit multiple commun, justifié par les multiples du plus grand diviseur. */
function justifPpcm(D, L){
  const M = Math.max.apply(null, D), l = [];
  for (let x = M; x <= L; x += M) l.push(x);
  if (l.length <= 6) return 'multiples de ' + M + ' : ' + l.join(', ') + ' ; ' + L + ' est le premier divisible par ' + listeEt(D.filter(d => d !== M).map(String));
  /* Sinon : chaque facteur premier avec son plus grand exposant. */
  const exp = {};
  D.forEach(d => facto(d).forEach(([p, e]) => { exp[p] = Math.max(exp[p] || 0, e); }));
  const f = Object.keys(exp).map(Number).sort((x, y) => x - y).map(p => [p, exp[p]]);
  return D.filter(d => facto(d).length > 1 || facto(d)[0][1] > 1).map(d => d + ' = ' + ecrit(facto(d))).concat([]).join(', ')
    + (D.some(d => facto(d).length > 1 || facto(d)[0][1] > 1) ? ' ; ' : '') + 'on garde chaque facteur premier avec son plus grand exposant : ' + ecrit(f) + ' = ' + L;
}

/* =====================================================================
   Niveau 1 · découverte
   ===================================================================== */
function chaineFact(n){ const l = ['2! = 2']; let f = 2; for (let k = 3; k <= n; k++){ l.push(k + '! = ' + k + ' × ' + nb(f) + ' = ' + nb(f * k)); f *= k; } return l.join(', '); }
function g1Valeur(R){
  if (R.int(0, 2) === 0){
    const n = R.int(4, 7), f = fact(n), som = n * (n + 1) / 2, fac = Array.from({length: n}, (_, i) => i + 1);
    const q = 'On note n! (on lit « factorielle n ») le produit 1 × 2 × 3 × … × n de tous les entiers de 1 à n. Combien vaut ' + n + '! ?';
    const expl = 'On multiplie tous les entiers depuis un jusqu\'au nombre indiqué, sans en oublier aucun. '
      + n + '! = ' + fac.join(' × ') + '. De proche en proche : ' + chaineFact(n) + '. Donc ' + n + '! = ' + nb(f) + '.'
      + ' Piège : ' + fac.join(' + ') + ' = ' + som + ' est une somme, pas un produit.';
    return mk(q, nb(f), [nb(som), nb(fact(n - 1)), nb(fact(n + 1))], vNombre(f), expl);
  }
  const n = R.int(6, 40);
  const q = 'Combien vaut ' + n + '! ÷ ' + (n - 1) + '! ?' + RAPPEL;
  const expl = 'On écrit la grande factorielle à l\'aide de la petite, puis on simplifie au lieu de calculer. '
    + n + '! = 1 × 2 × … × ' + (n - 1) + ' × ' + n + ' = ' + n + ' × ' + (n - 1) + '!. Donc ' + n + '! ÷ ' + (n - 1) + '! = ' + n + '.'
    + ' Piège : le quotient ne vaut pas 1, car le facteur ' + n + ' reste au numérateur.';
  return mk(q, String(n), ['1', String(n - 1), nb(n * (n - 1))], vNombre(n), expl);
}
function g1ResteFact(R){
  const n = R.int(7, 20), d = R.int(5, n), r = n % d;
  if (R.int(0, 1)){
    const k = R.int(1, d - 1);
    const q = 'Quel est le reste de la division euclidienne de ' + n + '! + ' + k + ' par ' + d + ' ?' + RAPPEL;
    const expl = 'On cherche d\'abord le reste de la factorielle, puis on ajoute le petit nombre. '
      + 'Le produit ' + n + '! = ' + prodTxt(d, n) + ' contient le facteur ' + d + ' : c\'est un multiple de ' + d + ', son reste est 0. '
      + 'On ajoute ' + k + ', qui est plus petit que ' + d + ' : le reste vaut 0 + ' + k + ' = ' + k + '.'
      + ' Piège : le reste n\'est pas 0, car on a ajouté ' + k + ' à un multiple de ' + d + '.';
    return mk(q, String(k), ['0', String((n + k) % d), String(d - k), String(k + 1)], k2 => String((k + k2) % d), expl);
  }
  const q = R.int(0, 1) ? 'Quel est le reste de la division euclidienne de ' + n + '! par ' + d + ' ?' + RAPPEL
    : 'On note N le produit 1 × 2 × 3 × … × ' + n + '. Quel est le reste de la division euclidienne de N par ' + d + ' ?';
  const expl = 'Un nombre qui figure parmi les facteurs d\'un produit divise ce produit, sans aucun calcul. '
    + 'Le produit ' + prodTxt(d, n) + ' contient le facteur ' + d + ' : il s\'écrit ' + d + ' × (produit des autres facteurs), c\'est donc un multiple de ' + d + '. Le reste vaut 0.'
    + (r ? ' Piège : ' + r + ' est le reste de ' + n + ' par ' + d + ', mais on divise ici tout le produit, pas ' + n + '.' : '');
  return mk(q, '0', [r ? String(r) : null, '1', String(d - 1)], k => (k < d ? String(k) : null), expl);
}
function g1Critere(R){ return gCritere(R, R.pick([3, 9, 9])); }
function g1DiviseFact(R){
  for (let essai = 0; essai < 80; essai++){
    const n = R.int(6, 12), a = R.int(2, n - 1), b = R.int(a + 1, n), d = a * b;
    if (d <= n || d > 99) continue;
    const grands = premiersJusqua(3 * n).filter(p => p > n);
    const [p1, p2] = R.shuffle(grands), p3 = R.pick(grands.filter(p => 2 * p < 100)), c = 2 * p3;
    const l = [d, p1, p2, c];
    if (new Set(l).size !== 4) continue;
    const ordre = R.shuffle(l);
    const q = 'Parmi les nombres ' + listeEt(ordre.map(String)) + ', lequel divise ' + n + '! ?' + RAPPEL;
    const expl = 'Un nombre divise une factorielle s\'il s\'écrit comme un produit de facteurs distincts pris parmi ses facteurs, alors qu\'un nombre premier plus grand que le dernier facteur ne la divise jamais. '
      + d + ' = ' + a + ' × ' + b + ', deux facteurs distincts de ' + n + '! : il le divise. '
      + p1 + ' et ' + p2 + ' sont premiers et plus grands que ' + n + ' : aucun des facteurs 1, 2, …, ' + n + ' ne les contient. '
      + c + ' = 2 × ' + p3 + ' : il faudrait le facteur premier ' + p3 + ', absent de ' + n + '!. La réponse est ' + d + '.'
      + ' Piège : ' + c + ' n\'est pas premier, mais il contient le nombre premier ' + p3 + ', trop grand.';
    return mk(q, String(d), [String(p1), String(p2), String(c)], rien, expl);
  }
  return null;
}

/* =====================================================================
   Niveau 2 · maîtrise
   ===================================================================== */
function g2ResteSomme(R){
  const n = R.int(8, 16), d = R.int(5, n);
  let k;
  do { k = R.int(d + 1, 3 * d - 1); } while (k % d === 0);
  const r = k % d;
  const q = 'Quel est le reste de la division euclidienne de ' + n + '! + ' + k + ' par ' + d + ' ?';
  const expl = 'On cherche le reste de chaque morceau de la somme, puis on additionne ces restes. '
    + n + '! contient le facteur ' + d + ', donc son reste est 0. '
    + (k < d ? k + ' est plus petit que ' + d + ', c\'est son propre reste. Le reste cherché vaut 0 + ' + k + ' = ' + r + '.'
      : k + ' = ' + d + ' × ' + Math.floor(k / d) + ' + ' + r + ', donc le reste de ' + k + ' est ' + r + '. Le reste cherché vaut 0 + ' + r + ' = ' + r + '.'
        + ' Piège : ' + k + ' ne peut pas être un reste, car un reste est toujours plus petit que le diviseur ' + d + '.');
  return mk(q, String(r), [k >= d ? String(k) : null, '0', String(d - r), String((r + 1) % d)], k2 => String((r + k2) % d), expl);
}
function g2ResteChiffres(R){
  const k = R.pick([9, 9, 3, 4]), N = R.int(0, 1) ? R.int(1990, 2100) : R.int(1000, 9999), r = N % k;
  const q = 'Quel est le reste de la division euclidienne de ' + nb(N) + ' par ' + k + ' ?';
  if (k === 4){
    const L = N % 100;
    const expl = 'Pour la division par quatre, seuls les deux derniers chiffres comptent, car cent est un multiple de quatre. '
      + 'Le nombre se termine par ' + deux(L) + ' : ' + L + ' = 4 × ' + Math.floor(L / 4) + ' + ' + r + '. Le reste vaut ' + r + '.'
      + ' Piège : le dernier chiffre seul ne suffit pas (c\'est le critère de 2), il faut les deux derniers.';
    return mk(q, String(r), [String((N % 10) % 4), L >= 4 ? String(L) : null, String((r + 2) % 4)], k2 => String((r + k2) % 5), expl);
  }
  const S = sch(N), mot = k === 9 ? 'neuf' : 'trois';
  const expl = 'Un nombre et la somme de ses chiffres ont le même reste dans la division par ' + mot + ' : on remplace donc le nombre par la somme de ses chiffres. '
    + plusChiffres(N) + ' = ' + S + (S >= k ? ', et ' + S + ' = ' + k + ' × ' + Math.floor(S / k) + ' + ' + (S % k) : '') + '. Le reste vaut ' + r + '.'
    + ' Vérification : ' + k + ' × ' + nb(Math.floor(N / k)) + ' = ' + nb(N - r) + ' et ' + nb(N) + ' − ' + nb(N - r) + ' = ' + r + '.'
    + (S >= k ? ' Piège : ' + S + ' n\'est pas un reste, car il dépasse ' + (k - 1) + ' : il faut encore le diviser par ' + k + '.' : '');
  return mk(q, String(r), [S !== r ? String(S) : null, String((N % 10) % k), String((r + 1) % k)], k2 => String(k2 < k ? (r + k2) % k : k2), expl);
}
function g2ChiffreManquant(R){
  const mode = R.pick([9, 9, 3, 4]);
  for (let essai = 0; essai < 200; essai++){
    const L = R.int(4, 5), ch = [R.int(1, 9)];
    for (let i = 1; i < L; i++) ch.push(R.int(0, 9));
    const pos = mode === 4 ? L - 1 : R.int(1, L - 1);
    const pat = ch.map((c, i) => (i === pos ? '★' : String(c))).join('');
    const vis = ch.filter((c, i) => i !== pos), s = somme(vis);
    if (mode === 9){
      const x = (9 - s % 9) % 9;
      if (x === 0) continue;                       // ★ = 0 et ★ = 9 conviendraient tous les deux
      const trois = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(y => y !== x && (s + y) % 3 === 0);
      const full = ch.map((c, i) => (i === pos ? x : c)).join('');
      const q = 'On remplace ★ par un chiffre pour que le nombre ' + pat + ' soit divisible par 9. Quel chiffre faut-il écrire à la place de ★ ?';
      const expl = 'Il faut que la somme de tous les chiffres soit un multiple de neuf. Sans ★, la somme des chiffres vaut ' + vis.join(' + ') + ' = ' + s + '. '
        + 'Le multiple de 9 qui suit est ' + (s + x) + ', donc ★ = ' + (s + x) + ' − ' + s + ' = ' + x + ' (★ = ' + (x + 9) + ' est impossible pour un chiffre). '
        + 'Vérification : ' + full + ' a pour somme de chiffres ' + (s + x) + '. La réponse est ' + x + '.'
        + ' Piège : ★ = ' + trois[0] + ' donnerait une somme de ' + (s + trois[0]) + ', multiple de 3 mais pas de 9.';
      return mk(q, String(x), R.shuffle(trois).concat([String(s % 9)]).map(String), vChiffre(x), expl);
    }
    if (mode === 3){
      const ok = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(y => (s + y) % 3 === 0), c = ok.length;
      const q = 'Combien de chiffres différents peut-on écrire à la place de ★ pour que le nombre ' + pat + ' soit divisible par 3 ?';
      const expl = 'Il faut que la somme des chiffres soit un multiple de trois, et ★ peut valoir n\'importe quel chiffre de zéro à neuf. '
        + 'Sans ★, la somme vaut ' + vis.join(' + ') + ' = ' + s + '. Il faut donc que ' + s + ' + ★ soit un multiple de 3 : ★ = ' + listeOu(ok.map(String)) + ' (sommes ' + listeEt(ok.map(y => String(s + y))) + '). '
        + 'Cela fait ' + c + ' chiffres possibles.'
        + (c === 4 ? ' Piège : ne pas oublier ★ = 0 et ★ = 9.' : ' Piège : il y a plusieurs chiffres possibles, pas un seul comme pour 9.');
      return mk(q, String(c), ['1', String(7 - c), '2'], k => String(c + k), expl);
    }
    const t = ch[L - 2], ok = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(y => (10 * t + y) % 4 === 0), c = ok.length;
    const q = 'Combien de chiffres différents peut-on écrire à la place de ★ pour que le nombre ' + pat + ' soit divisible par 4 ?';
    const expl = 'Un nombre est divisible par quatre exactement quand le nombre formé par ses deux derniers chiffres l\'est. '
      + 'Ici les deux derniers chiffres forment ' + t + '★, entre ' + deux(10 * t) + ' et ' + deux(10 * t + 9) + ' : les multiples de 4 sont ' + listeEt(ok.map(y => deux(10 * t + y))) + '. '
      + 'Il y a donc ' + c + ' chiffres possibles : ★ = ' + listeOu(ok.map(String)) + '.'
      + ' Piège : être pair ne suffit pas ; il y a 5 chiffres pairs, mais seuls ' + listeEt(ok.map(String)) + ' conviennent.';
    return mk(q, String(c), ['5', String(5 - c), '1'], k => String(c + k), expl);
  }
  return null;
}
function g2Zeros(R){
  const n = R.int(10, 24), z = Math.floor(n / 5), m5 = [], m10 = [];
  for (let x = 5; x <= n; x += 5){ m5.push(x); if (x % 10 === 0) m10.push(x); }
  const q = R.int(0, 1) ? 'Par combien de zéros se termine l\'écriture de ' + n + '! ?' : 'Le produit 1 × 2 × 3 × … × ' + n + ' se termine par combien de zéros ?';
  const expl = 'Chaque zéro final vient d\'un facteur dix, c\'est-à-dire d\'un deux multiplié par un cinq ; les facteurs deux sont bien plus nombreux, il suffit donc de compter les facteurs cinq. '
    + 'Jusqu\'à ' + n + ', les multiples de 5 sont ' + listeEt(m5.map(String)) + ' : chacun apporte un seul facteur 5 (aucun n\'est un multiple de 25). '
    + 'Il y a donc ' + z + ' facteurs 5, et le produit se termine par ' + z + ' zéros.'
    + ' Piège : compter seulement les multiples de 10 (' + listeEt(m10.map(String)) + ') oublie les zéros fabriqués par 5 × 2, 15 × 4…';
  return mk(q, String(z), [String(m10.length), String(z + 1), String(Math.floor(n / 2))], vNombre(z), expl);
}
const BIN = [[5, 3, 2], [6, 3, 3], [6, 4, 2], [7, 5, 2], [7, 4, 3], [8, 6, 2], [8, 5, 3], [8, 4, 4], [9, 7, 2], [9, 6, 3], [10, 8, 2], [10, 7, 3], [11, 9, 2], [12, 10, 2], [9, 5, 4]];
function g2Quotient(R){
  if (R.int(0, 1)){
    const n = R.int(8, 30), v = n * (n - 1);
    const q = 'Combien vaut ' + n + '! ÷ ' + (n - 2) + '! ?';
    const expl = 'On écrit la grande factorielle jusqu\'à faire apparaître la petite, puis on simplifie. '
      + n + '! = ' + n + ' × ' + (n - 1) + ' × ' + (n - 2) + '!, donc ' + n + '! ÷ ' + (n - 2) + '! = ' + n + ' × ' + (n - 1) + ' = ' + nb(v) + '.'
      + ' Piège : il ne reste que deux facteurs, ' + n + ' et ' + (n - 1) + ' ; tous les autres disparaissent avec ' + (n - 2) + '!.';
    return mk(q, nb(v), [nb(n * (n + 1)), nb(n * (n - 1) * (n - 2)), nb(2 * n - 1)], vNombre(v), expl);
  }
  const [a, b, c] = R.pick(BIN), haut = [];
  for (let k = a; k > b; k--) haut.push(k);
  const top = produit(haut), v = top / fact(c);
  const q = 'Combien vaut ' + a + '! ÷ (' + b + '! × ' + c + '!) ?';
  const expl = 'On simplifie d\'abord par la plus grande factorielle du bas, puis on divise par l\'autre. '
    + a + '! ÷ ' + b + '! = ' + haut.join(' × ') + ' = ' + nb(top) + ', puis ' + nb(top) + ' ÷ ' + c + '! = ' + nb(top) + ' ÷ ' + fact(c) + ' = ' + nb(v) + '.'
    + ' Piège : ' + b + '! × ' + c + '! n\'est pas égal à ' + a + '!, et il faut bien diviser par ' + c + '! = ' + fact(c) + (c > 2 ? ', pas par ' + c : '') + '.';
  return mk(q, nb(v), ['1', nb(top), c > 2 && top % c === 0 ? nb(top / c) : null], vNombre(v), expl);
}
function g2Critere(R){ return gCritere(R, R.pick([4, 8, 11, 6, 12, 15])); }

/* =====================================================================
   Niveau 3 · niveau des exemples officiels
   ===================================================================== */
function g3Grand(R){
  const N = R.int(2015, 2035), t = R.int(1, 3);
  if (t === 1){
    const j = R.pick([0, 1, 1, 2, 3, 5, 10]), M = N - j;
    const q = 'Quel est le reste de la division euclidienne de ' + fa(N) + ' par ' + nb(M) + ' ?';
    const expl = 'Si le diviseur est inférieur ou égal au dernier facteur de la factorielle, il fait partie du produit. '
      + fa(N) + ' = ' + prodTxt(M, N) + ' contient le facteur ' + nb(M) + ' : c\'est un multiple de ' + nb(M) + ', et le reste vaut 0.'
      + (j ? ' Piège : ' + j + ' est le reste de ' + nb(N) + ' par ' + nb(M) + ', pas celui de ' + fa(N) + '.' : ' Inutile de calculer quoi que ce soit.');
    return mk(q, '0', ['1', j >= 2 ? String(j) : '2', nb(M - 1)], k => String(k + 2), expl);
  }
  const M = N - R.pick([0, 0, 1, 2]), r = R.int(1, 9);
  if (t === 2){
    const K = R.pick([M + r, M + r, 2 * M + r, r]);
    const q = 'Quel est le reste de la division euclidienne de ' + fa(N) + ' + ' + nb(K) + ' par ' + nb(M) + ' ?';
    const expl = 'On cherche le reste de chaque morceau de la somme, puis on additionne ces restes. '
      + fa(N) + ' contient le facteur ' + nb(M) + ', donc son reste est 0. '
      + (K >= M ? nb(K) + ' = ' + nb(M) + ' × ' + Math.floor(K / M) + ' + ' + r + ', donc son reste est ' + r : nb(K) + ' est plus petit que ' + nb(M) + ', c\'est son propre reste')
      + '. Le reste cherché vaut 0 + ' + r + ' = ' + r + '.'
      + (K >= M ? ' Piège : ' + nb(K) + ' ne peut pas être un reste, car il dépasse le diviseur ' + nb(M) + '.' : '');
    return mk(q, String(r), [K >= M ? nb(K) : null, '0', String(r + 1), nb(M - r)], k => String(r + k + 1), expl);
  }
  const q = 'Quel est le reste de la division euclidienne de ' + fa(N) + ' − ' + r + ' par ' + nb(M) + ' ?';
  const expl = 'Un reste est toujours positif ou nul et plus petit que le diviseur : on écrit le nombre sous la forme diviseur × quotient + reste, en respectant cette règle. '
    + fa(N) + ' est un multiple de ' + nb(M) + ' : on l\'écrit ' + nb(M) + ' × Q. Alors ' + fa(N) + ' − ' + r + ' = ' + nb(M) + ' × Q − ' + r + ' = ' + nb(M) + ' × (Q − 1) + ' + nb(M - r)
    + ', car ' + nb(M) + ' − ' + r + ' = ' + nb(M - r) + '. Le reste vaut ' + nb(M - r) + '.'
    + ' Piège : −' + r + ' n\'est pas un reste (il est négatif), et ' + r + ' non plus : on a retiré ' + r + ', on ne l\'a pas ajouté.';
  return mk(q, nb(M - r), [String(r), '−' + r, '0'], vNombre(M - r), expl);
}
function g3Zeros(R){
  const n = R.int(25, 124), L = legendre(n, 5), a = Math.floor(n / 5), b = Math.floor(n / 25), z = L.v, m25 = [];
  for (let x = 25; x <= n; x += 25) m25.push(x);
  const t = R.int(1, 3);
  const q = t === 1 ? 'Par combien de zéros se termine l\'écriture de ' + fa(n) + ' ?'
    : (t === 2 ? 'Combien de zéros consécutifs y a-t-il à la fin de l\'écriture de ' + fa(n) + ' ?' : 'Le produit 1 × 2 × 3 × … × ' + n + ' se termine par combien de zéros ?');
  const expl = 'On compte les facteurs cinq contenus dans le produit, car chaque zéro final vient d\'un deux multiplié par un cinq, et les facteurs deux sont plus nombreux. '
    + 'Multiples de 5 jusqu\'à ' + n + ' : ' + n + ' ÷ 5 → ' + a + ' (partie entière). Multiples de 25, qui apportent un second facteur 5 : ' + n + ' ÷ 25 → ' + b + '. '
    + 'Total : ' + a + ' + ' + b + ' = ' + z + ', donc le produit se termine par ' + z + ' zéros.'
    + ' Piège : oublier que ' + listeEt(m25.map(String)) + ' ' + (m25.length > 1 ? 'contiennent' : 'contient') + ' deux facteurs 5 donne ' + a + '.';
  return mk(q, String(z), [String(a), String(Math.floor(n / 10)), String(a + 2 * b), String(z + 1)], vNombre(z), expl);
}
const SF3 = [10, 4, 5, 6, 8, 12, 15, 20, 24, 40, 60, 3];
function g3SommeFact(R){ return gSommeFact(R, R.pick(SF3), R.int(0, 1) ? R.int(2015, 2035) : R.int(20, 999)); }
function g3Simplif(R){
  const t = R.int(1, 3);
  if (t === 3){
    const N = R.int(10, 40), v = N * (N + 1);
    const q = 'Combien vaut ' + fa(N + 1) + ' ÷ ' + fa(N - 1) + ' ?';
    const expl = 'On écrit la plus grande factorielle à l\'aide de la plus petite, puis on simplifie. '
      + fa(N + 1) + ' = ' + (N + 1) + ' × ' + N + ' × ' + fa(N - 1) + ', donc le quotient vaut ' + (N + 1) + ' × ' + N + ' = ' + nb(v) + '.'
      + ' Piège : entre les deux factorielles, il y a deux facteurs, ' + N + ' et ' + (N + 1) + ', pas un seul.';
    return mk(q, nb(v), [nb(N + 1), nb(N * (N - 1)), '2'], vNombre(v), expl);
  }
  const N = R.int(0, 2) ? R.int(2015, 2035) : R.int(20, 99);
  if (t === 1){
    const q = 'Combien vaut (' + fa(N) + ' + ' + fa(N + 1) + ') ÷ ' + fa(N) + ' ?';
    const expl = 'On écrit la plus grande factorielle à l\'aide de la plus petite, puis on met la plus petite en facteur. '
      + fa(N + 1) + ' = ' + nb(N + 1) + ' × ' + fa(N) + ', donc ' + fa(N) + ' + ' + fa(N + 1) + ' = ' + fa(N) + ' × (1 + ' + nb(N + 1) + ') = ' + fa(N) + ' × ' + nb(N + 2) + '. '
      + 'En divisant par ' + fa(N) + ', il reste ' + nb(N + 2) + '.'
      + ' Piège : oublier le 1 (qui vient de ' + fa(N) + ' = 1 × ' + fa(N) + ') donne ' + nb(N + 1) + '.';
    return mk(q, nb(N + 2), [nb(N + 1), '2', nb(N)], vNombre(N + 2), expl);
  }
  const q = 'Combien vaut (' + fa(N + 1) + ' − ' + fa(N) + ') ÷ ' + fa(N) + ' ?';
  const expl = 'On écrit la plus grande factorielle à l\'aide de la plus petite, puis on met la plus petite en facteur. '
    + fa(N + 1) + ' − ' + fa(N) + ' = ' + nb(N + 1) + ' × ' + fa(N) + ' − 1 × ' + fa(N) + ' = ' + fa(N) + ' × (' + nb(N + 1) + ' − 1) = ' + fa(N) + ' × ' + nb(N) + '. '
    + 'En divisant par ' + fa(N) + ', il reste ' + nb(N) + '.'
    + ' Piège : ' + fa(N + 1) + ' ÷ ' + fa(N) + ' vaut ' + nb(N + 1) + ', mais il faut encore retirer ' + fa(N) + ' ÷ ' + fa(N) + ' = 1.';
  return mk(q, nb(N), [nb(N + 1), '1', nb(N - 1)], vNombre(N), expl);
}
function g3Premiers(R){
  if (R.int(0, 2) === 0){
    const n = R.int(0, 2) ? R.int(10, 40) : R.int(2015, 2035), pi = n <= 40 ? premiersJusqua(n).length : null;
    const q = 'Combien de nombres premiers y a-t-il dans la liste ' + fa(n) + ' + 2, ' + fa(n) + ' + 3, ' + fa(n) + ' + 4, …, ' + fa(n) + ' + ' + nb(n) + ' ?';
    const expl = 'Chaque nombre de la liste est une factorielle plus un petit entier k : on cherche un diviseur commun aux deux morceaux. '
      + 'Ici k va de 2 à ' + nb(n) + ', donc k est l\'un des facteurs de ' + fa(n) + ' : k divise ' + fa(n) + ' et k divise k, donc k divise ' + fa(n) + ' + k. '
      + 'Comme ' + fa(n) + ' + k est bien plus grand que k, il a un diviseur autre que 1 et lui-même : il n\'est pas premier. Par exemple, ' + fa(n) + ' + 3 est divisible par 3. '
      + 'Aucun nombre de la liste n\'est premier : la réponse est 0.'
      + (pi ? ' Piège : ' + fa(n) + ' + 5 n\'est pas premier même si 5 l\'est ; compter les nombres premiers de 2 à ' + n + ' donne ' + pi + '.' : ' Piège : un nombre impair n\'est pas forcément premier.');
    return mk(q, '0', [pi ? String(pi) : null, '1', nb(Math.floor((n - 1) / 2)), nb(n - 1)], k => String(k + 1), expl);
  }
  const n = R.int(12, 60), d = R.int(2, 7), c = Math.floor(n / d);
  const q = 'Parmi les nombres ' + fa(n) + ' + 1, ' + fa(n) + ' + 2, ' + fa(n) + ' + 3, …, ' + fa(n) + ' + ' + n + ', combien sont divisibles par ' + d + ' ?';
  const expl = 'La factorielle est un multiple du diviseur, qui fait partie de ses facteurs : chaque nombre de la liste a donc le même reste que le petit entier ajouté. '
    + fa(n) + ' est divisible par ' + d + ', donc ' + fa(n) + ' + k est divisible par ' + d + ' exactement quand k l\'est. '
    + 'Parmi 1, 2, …, ' + n + ', les multiples de ' + d + ' sont ' + d + ', ' + (2 * d) + ', …, ' + (c * d) + ' : il y en a ' + n + ' ÷ ' + d + ' → ' + c + ' (partie entière). La réponse est ' + c + '.'
    + ' Piège : la factorielle ne rend pas tous les nombres de la liste divisibles par ' + d + ', seulement ceux où l\'on ajoute un multiple de ' + d + '.';
  return mk(q, String(c), ['0', String(c + 1), String(n - c), String(c - 1)], vNombre(c), expl);
}
function g3DiviseComposite(R){
  for (let essai = 0; essai < 80; essai++){
    const n = R.int(7, 14), max = n <= 10 ? 150 : 200, div = [], non = [];
    for (let x = n + 1; x <= max; x++){
      const f = facto(x);
      if (f.length === 1 && f[0][1] === 1) continue;        // nombre premier : piège trop facile ici
      if (f.some(([p]) => p > n)) continue;                  // facteur premier trop grand : idem
      (divFact(n, x) ? div : non).push(x);
    }
    if (!non.length || div.length < 3) continue;
    const rep = R.pick(non), autres = R.shuffle(div).slice(0, 3), ordre = R.shuffle([rep].concat(autres));
    const manque = facto(rep).find(([p, e]) => vp(n, p) < e), p = manque[0], e = manque[1];
    const expl = 'On décompose la factorielle en facteurs premiers, puis on vérifie que chaque nombre ne demande pas plus de facteurs qu\'elle n\'en contient. '
      + fa(n) + ' = ' + ecrit(decompFact(n)) + ' (' + apport(n, p) + '). '
      + ordre.slice().sort((x, y) => x - y).map(x => nb(x) + ' = ' + ecrit(facto(x)) + (x === rep
        ? ' : non, il faudrait ' + e + ' facteurs ' + p + ' et ' + fa(n) + ' n\'en contient que ' + vp(n, p) : ' : oui')).join(' ; ')
      + '. La réponse est ' + rep + '. Piège : ' + rep + ' n\'a que de petits facteurs premiers, mais il en demande trop.';
    return mk('Parmi les nombres ' + listeEt(ordre.map(x => nb(x))) + ', lequel ne divise pas ' + fa(n) + ' ?', nb(rep), autres.map(x => nb(x)), rien, expl);
  }
  return null;
}
function g3Diviseurs(R){ return gDiviseurs(R, R.pick(DIV3)); }
const ENS = [[2, 3, 4], [4, 6], [3, 4, 6], [4, 5, 6], [6, 8], [6, 9], [4, 6, 9], [6, 10], [8, 12], [9, 12], [10, 15], [3, 5, 6], [4, 10], [2, 3, 4, 5, 6], [6, 8, 9], [4, 6, 8]];
function g3ResteSimultane(R){
  for (let essai = 0; essai < 100; essai++){
    const D = R.pick(ENS), L = ppcmL(D), r = R.int(1, Math.min.apply(null, D) - 1);
    const kmax = Math.floor(350 / L);
    if (kmax < 1) continue;
    const N = R.int(1, kmax) * L + r;
    if (N < 20) continue;
    const A0 = Math.max(10, Math.floor((N - R.int(1, L - 1)) / 10) * 10), B0 = Math.ceil((N + R.int(1, L - 1)) / 10) * 10;
    const ok = x => D.every(d => x % d === r);
    const sol = [];
    for (let x = A0; x <= B0; x++) if (ok(x)) sol.push(x);
    if (sol.length !== 1 || sol[0] !== N) continue;
    const presque = [];
    for (let x = A0; x <= B0; x++) if (!ok(x) && D.filter(d => x % d === r).length === D.length - 1) presque.push(x);
    const pieges = R.shuffle(presque).slice(0, 2), Ds = D.map(String), ctx = R.int(1, 3);
    let q;
    if (ctx === 1) q = 'Un entier N est compris entre ' + A0 + ' et ' + B0 + '. Divisé par ' + listeOu(Ds) + ', il donne toujours un reste de ' + r + '. Combien vaut N ?';
    else if (ctx === 2) q = 'On répartit les participants d\'un tournoi en équipes égales : avec des équipes ' + listeDe(Ds) + ' joueurs, il reste toujours exactement ' + pl(r, 'joueur') + ' sans équipe. Il y a entre ' + A0 + ' et ' + B0 + ' participants. Combien sont-ils ?';
    else q = 'Une fleuriste essaie de répartir toutes ses roses en bouquets identiques : avec des bouquets ' + listeDe(Ds) + ' roses, il lui reste toujours exactement ' + pl(r, 'rose') + '. Elle a entre ' + A0 + ' et ' + B0 + ' roses. Combien en a-t-elle ?';
    const seq = [N - L, N, N + L].filter(x => x > 0);
    let expl = 'Si toutes les divisions laissent le même reste, le nombre diminué de ce reste est divisible par chacun des diviseurs, donc par leur plus petit multiple commun. '
      + 'Le plus petit multiple commun de ' + listeEt(Ds) + ' est ' + L + ' (' + justifPpcm(D, L) + '). '
      + 'Donc N − ' + r + ' est un multiple de ' + L + ', et N fait partie de la liste …, ' + seq.join(', ') + ', … Le seul nombre entre ' + A0 + ' et ' + B0 + ' est ' + N + '. '
      + 'Vérification : ' + D.map(d => N + ' = ' + d + ' × ' + Math.floor(N / d) + ' + ' + r).join(' ; ') + '.';
    if (pieges.length){ const x = pieges[0], bad = D.find(d => x % d !== r); expl += ' Piège : ' + x + ' marche pour ' + listeEt(D.filter(d => d !== bad).map(String)) + ', mais pas pour ' + bad + ' (reste ' + (x % bad) + ').'; }
    const autres = pieges.map(String).concat([N - r >= A0 ? String(N - r) : null]);
    return mk(q, String(N), autres, vNombre(N), expl);
  }
  return null;
}

/* =====================================================================
   Niveau 4 · au-dessus des exemples officiels
   ===================================================================== */
function g4ZerosGrand(R){
  if (R.int(0, 2) === 0){
    const a = R.int(25, 120), b = R.int(a + 1, 130), La = legendre(a, 5), Lb = legendre(b, 5), v = La.v + Lb.v;
    const q = 'Par combien de zéros se termine l\'écriture du produit ' + fa(a) + ' × ' + fa(b) + ' ?';
    const expl = 'Les zéros d\'un produit se comptent avec les facteurs cinq de tous les morceaux, car les facteurs deux sont toujours plus nombreux. '
      + fa(a) + ' contient ' + La.plus + ' = ' + La.v + ' facteurs 5 (' + La.txt + ') ; ' + fa(b) + ' en contient ' + Lb.plus + ' = ' + Lb.v + ' (' + Lb.txt + '). '
      + 'Le produit en contient ' + La.v + ' + ' + Lb.v + ' = ' + v + ', et encore plus de facteurs 2 : il se termine par ' + v + ' zéros.'
      + ' Piège : ' + fa(a) + ' × ' + fa(b) + ' n\'est pas ' + fa(a + b) + ', qui se termine par ' + vp(a + b, 5) + ' zéros.';
    return mk(q, String(v), [String(vp(a + b, 5)), String(Math.floor(a / 5) + Math.floor(b / 5)), String(Math.max(La.v, Lb.v)), String(v + 1)], vNombre(v), expl);
  }
  const n = R.int(0, 1) ? R.int(2015, 2035) : R.int(125, 2100), L = legendre(n, 5), t = L.t, z = L.v;
  const sansDernier = somme(t.slice(0, -1).map(x => x[1]));
  const q = R.int(0, 1) ? 'Par combien de zéros se termine l\'écriture de ' + fa(n) + ' ?' : 'Combien de zéros consécutifs y a-t-il à la fin de l\'écriture de ' + fa(n) + ' ?';
  const expl = 'On compte les facteurs cinq : chaque multiple de cinq en apporte un, chaque multiple de vingt-cinq un deuxième, chaque multiple de cent vingt-cinq un troisième, et ainsi de suite. '
    + L.txt + '. Total : ' + L.plus + ' = ' + nb(z) + '. ' + fa(n) + ' se termine donc par ' + nb(z) + ' zéros.'
    + ' Piège : s\'arrêter à ' + nb(n) + ' ÷ 25 oublie les multiples de 125' + (n >= 625 ? ' et de 625' : '') + ', qui apportent des facteurs 5 supplémentaires.';
  return mk(q, nb(z), [nb(sansDernier), nb(t[0][1]), nb(Math.floor(n / 10)), nb(z + 1)], vNombre(z), expl);
}
const LG = [[2, 10, 40], [3, 12, 80], [5, 30, 150], [7, 50, 150]];
function g4Legendre(R){
  const [p, lo, hi] = R.pick(LG), n = R.int(lo, hi), L = legendre(n, p), k = L.v;
  const ex = []; for (let x = p * p; x <= n && ex.length < 3; x += p * p) ex.push(x);
  const q = 'Quel est le plus grand entier k tel que ' + p + 'ᵏ divise ' + fa(n) + ' ?';
  const expl = 'On compte les facteurs premiers un par un : chaque multiple du nombre premier en apporte un, chaque multiple de son carré un deuxième, chaque multiple de son cube un troisième, et ainsi de suite. '
    + L.txt + '. Total : ' + L.plus + ' = ' + k + ', donc k = ' + k + '.'
    + ' Piège : s\'arrêter aux multiples de ' + p + ' donne ' + L.t[0][1] + ' : on oublie que ' + listeEt(ex.map(String)) + '… contiennent plusieurs facteurs ' + p + '.';
  return mk(q, String(k), [String(L.t[0][1]), L.t.length > 2 ? String(k - L.t[L.t.length - 1][1]) : null, String(k + 1), String(Math.floor(n / p) + 1)], vNombre(k), expl);
}
const PE = [[2, 8], [2, 10], [2, 11], [2, 15], [2, 16], [2, 20], [3, 4], [3, 5], [3, 6], [3, 8], [3, 10], [5, 6], [5, 7], [5, 12], [7, 3], [7, 8], [11, 2], [13, 2], [5, 4]];
const PAIRES = [[2, 3], [2, 5], [3, 5], [2, 7], [3, 7]];
function g4PlusPetitN(R){
  const t = R.int(1, 3);
  let f, X;
  if (t === 1){ const k = R.int(3, 9); f = [[2, k], [5, k]]; X = nb(Math.pow(10, k)); }
  else if (t === 2){ const pe = R.pick(PE); f = [pe]; X = pw(pe[0], pe[1]); }
  else { const [p1, p2] = R.pick(PAIRES); f = [[p1, R.int(p1 === 2 ? 4 : 2, p1 === 2 ? 10 : 5)], [p2, R.int(2, p2 === 3 ? 5 : 3)]]; X = ecrit(f); }
  const ch = f.map(([p, e]) => ({p, e, c: chaineMin(p, e)})), ans = Math.max.apply(null, ch.map(o => o.c.n));
  const naif = Math.max.apply(null, f.map(([p, e]) => p * e));
  const q = 'Quel est le plus petit entier n tel que n! soit divisible par ' + X + ' ?';
  let expl = 'Pour chaque facteur premier, on cherche la plus petite factorielle qui en contient assez, en avançant de multiple en multiple, puis on garde la plus grande de ces valeurs. ';
  if (t === 1) expl += nb(Math.pow(10, f[0][1])) + ' = ' + pw(2, f[0][1]) + ' × ' + pw(5, f[0][1]) + ', et une factorielle contient toujours plus de facteurs 2 que de facteurs 5 : seul le compte des 5 décide. '
    + 'Facteurs 5 cumulés : ' + ch[1].c.txt + '. Il en faut ' + f[0][1] + ', atteints pour la première fois avec ' + ans + '!. ';
  else expl += ch.map(o => 'Il faut ' + o.e + ' facteurs ' + o.p + ' ; facteurs ' + o.p + ' cumulés : ' + o.c.txt + ', donc n ≥ ' + o.c.n).join('. ') + '. ';
  expl += 'La réponse est ' + ans + '.' + (naif !== ans ? ' Piège : le calcul naïf (facteur premier × nombre de facteurs voulus) donne ' + naif + ', mais des multiples comme ' + listeEt(f.map(([p]) => String(p * p))) + ' apportent plusieurs facteurs d\'un coup.' : ' Piège : ne pas oublier que certains multiples apportent plusieurs facteurs d\'un coup ; ici le compte tombe juste.');
  const autres = [String(naif), String(ans + 1), String(ans - 1)];
  if (t === 1) autres.unshift(String(10 * f[0][1]));
  if (t === 3) autres.unshift(String(Math.min.apply(null, ch.map(o => o.c.n))));
  return mk(q, String(ans), autres, vNombre(ans), expl);
}
const SF4 = [7, 9, 14, 16, 21, 35, 36, 45, 63, 80, 90, 18];
function g4SommeFact(R){ return gSommeFact(R, R.pick(SF4), R.int(0, 1) ? R.int(2015, 2035) : R.int(20, 999)); }
const CI = {72: [8, 9], 44: [4, 11], 88: [8, 11], 99: [9, 11], 55: [5, 11]};
function g4ChiffresInconnus(R){
  for (let essai = 0; essai < 400; essai++){
    const D = +R.pick(['72', '72', '44', '88', '99', '99', '55']), [Aa, Bb] = CI[D];
    const d1 = R.int(1, 9), d3 = R.int(0, 9), d4 = R.int(0, 9);
    const val = (x, y) => d1 * 10000 + x * 1000 + d3 * 100 + d4 * 10 + y;
    const sol = [], demi = [];
    for (let x = 0; x <= 9; x++) for (let y = 0; y <= 9; y++){
      const v = val(x, y);
      if (v % D === 0) sol.push([x, y]); else if (v % Aa === 0 || v % Bb === 0) demi.push(x + y);
    }
    if (sol.length !== 1) continue;
    const [x, y] = sol[0], ans = x + y, pat = d1 + 'x' + d3 + d4 + 'y';
    const q = 'Dans le nombre à cinq chiffres ' + pat + ', x et y désignent deux chiffres (pas forcément différents). Ce nombre est divisible par ' + D + '. Combien vaut x + y ?';
    let expl = 'On sépare le diviseur en deux diviseurs plus simples, sans facteur commun, dont on connaît les critères de divisibilité. ' + D + ' = ' + Aa + ' × ' + Bb + ' : le nombre doit être divisible par ' + Aa + ' et par ' + Bb + '. ';
    const s0 = d1 + d3 + d4, c11 = d1 + d3 - d4;
    const txt11 = 'la somme alternée depuis les unités, y − ' + d4 + ' + ' + d3 + ' − x + ' + d1 + ' = y − x ' + (c11 < 0 ? '− ' + (-c11) : '+ ' + c11) + ', doit être un multiple de 11 (zéro compris)';
    if (D === 99){
      const c9 = (9 - s0 % 9) % 9, sommes = [c9, c9 + 9, c9 + 18].filter(v => v <= 18);
      const cd = (((-c11) % 11) + 11) % 11, diffs = [cd, cd - 11].filter(v => v >= -9 && v <= 9);
      expl += 'Divisible par 9 : ' + d1 + ' + x + ' + d3 + ' + ' + d4 + ' + y = ' + s0 + ' + x + y doit être un multiple de 9, donc x + y vaut ' + listeOu(sommes.map(String)) + '. '
        + 'Divisible par 11 : ' + txt11 + ', donc y − x vaut ' + listeOu(diffs.map(v => nb(v))) + '. '
        + 'Comme x + y et y − x ont la même parité et que x et y sont des chiffres, la seule possibilité est x + y = ' + ans + ' et y − x = ' + nb(y - x) + ', d\'où y = ' + y + ' et x = ' + x + '. ';
    } else {
      const ys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => (Aa === 8 ? (100 * d3 + 10 * d4 + v) % 8 : (Aa === 4 ? (10 * d4 + v) % 4 : v % 5)) === 0);
      if (Aa === 8) expl += 'Divisible par 8 : le nombre formé par les trois derniers chiffres doit être un multiple de 8 ; parmi ' + nb(100 * d3 + 10 * d4) + ' à ' + nb(100 * d3 + 10 * d4 + 9) + ', ' + (ys.length > 1 ? 'seuls ' : 'seul ') + listeEt(ys.map(v => nb(100 * d3 + 10 * d4 + v))) + (ys.length > 1 ? ' conviennent' : ' convient') + ', donc y = ' + listeOu(ys.map(String)) + '. ';
      else if (Aa === 4) expl += 'Divisible par 4 : le nombre formé par les deux derniers chiffres, ' + d4 + 'y, doit être un multiple de 4, donc y = ' + listeOu(ys.map(String)) + '. ';
      else expl += 'Divisible par 5 : le dernier chiffre vaut 0 ou 5, donc y = 0 ou y = 5. ';
      const parY = ys.map(v => {
        let xs;
        if (Bb === 9){ const r = (9 - (s0 + v) % 9) % 9; xs = r === 0 ? [0, 9] : [r]; }
        else { const r = (((v + c11) % 11) + 11) % 11; xs = r <= 9 ? [r] : []; }
        return 'avec y = ' + v + ', ' + (xs.length ? 'x = ' + listeOu(xs.map(String)) : 'aucun chiffre x ne convient');
      });
      expl += (Bb === 9 ? 'Divisible par 9 : ' + d1 + ' + x + ' + d3 + ' + ' + d4 + ' + y = ' + s0 + ' + x + y doit être un multiple de 9' : 'Divisible par 11 : ' + txt11) + ' ; ' + parY.join(' ; ') + '. ';
    }
    expl += 'Le nombre est ' + nb(val(x, y)) + ' et x + y = ' + ans + '.' + ' Piège : vérifier un seul des deux critères laisse d\'autres couples possibles.';
    return mk(q, String(ans), R.shuffle(demi.filter(v => v !== ans)).slice(0, 3).map(String), vNombre(ans), expl);
  }
  return null;
}
function g4ChiffreCache(R){
  for (let essai = 0; essai < 50; essai++){
    const n = R.int(10, 18), s = String(fact(n)), z = s.length - s.replace(/0+$/, '').length, pos = [];
    for (let i = 1; i < s.length - z; i++) if (+s[i] >= 1 && +s[i] <= 8) pos.push(i);
    if (!pos.length) continue;
    const i = R.pick(pos), d = +s[i], vis = s.split('').filter((c, j) => j !== i).map(Number), S = somme(vis), M = S + d;
    const trois = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(y => y !== d && (S + y) % 3 === 0);
    const q = 'On sait que ' + fa(n) + ' = ' + affiche(s, {[i]: '★'}) + '. Quel est le chiffre caché par ★ ?';
    const expl = 'Comme la factorielle contient les facteurs trois et six, elle est divisible par neuf : la somme de ses chiffres doit donc être un multiple de neuf. '
      + 'Somme des chiffres visibles (les zéros ne comptent pas) : ' + vis.filter(v => v > 0).join(' + ') + ' = ' + S + '. '
      + 'Le multiple de 9 qui suit est ' + M + ', donc ★ = ' + M + ' − ' + S + ' = ' + d + ' (★ = ' + (d + 9) + ' est impossible pour un chiffre). La réponse est ' + d + '.'
      + ' Piège : avec le seul critère de 3, ★ pourrait aussi valoir ' + listeOu(trois.map(String)) + '.';
    return mk(q, String(d), R.shuffle(trois).map(String), vChiffre(d), expl);
  }
  return null;
}
const PF = [13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 1999, 2003, 2011, 2017, 2027, 2029, 2039];
function g4Factorisation(R){
  const p = R.pick(PF), N = p - 2, r = R.int(0, 2) === 0 ? 0 : R.int(1, 9);
  const q = 'Quel est le reste de la division euclidienne de ' + fa(N) + ' + ' + fa(N + 1) + (r ? ' + ' + r : '') + ' par ' + nb(p) + ' ?';
  const expl = 'On met la plus petite factorielle en facteur, en écrivant la plus grande comme un produit. '
    + fa(N + 1) + ' = ' + nb(N + 1) + ' × ' + fa(N) + ', donc ' + fa(N) + ' + ' + fa(N + 1) + ' = ' + fa(N) + ' × (1 + ' + nb(N + 1) + ') = ' + fa(N) + ' × ' + nb(p) + ' : c\'est un multiple de ' + nb(p) + '.'
    + (r ? ' En ajoutant ' + r + ', plus petit que ' + nb(p) + ', le reste devient ' + r + '.' : ' Le reste vaut 0.')
    + ' Piège : ' + nb(p) + ' est un nombre premier plus grand que ' + nb(N + 1) + ' : il ne divise ni ' + fa(N) + ' ni ' + fa(N + 1) + ' séparément, seule la mise en facteur permet de conclure.';
  return mk(q, String(r), [r ? '0' : '1', String(r + 1), nb(p - 1), r ? null : '2'], k => String(r + k + 1), expl);
}
const ENS2 = [[2, 3, 4, 5, 6], [4, 6, 8], [5, 6, 8], [3, 5, 7], [3, 4, 7], [4, 6, 9], [4, 5, 9], [5, 6, 7], [6, 9, 15], [6, 8, 9], [3, 7, 9], [8, 9, 10]];
function g4ResteSimultane2(R){
  const D = R.pick(ENS2), s = R.int(1, Math.min(3, Math.min.apply(null, D) - 1)), L = ppcmL(D), N = L - s, P = produit(D);
  const q = R.int(0, 1)
    ? 'Quel est le plus petit entier positif N qui vérifie toutes ces conditions ?\n' + D.map(d => '- divisé par ' + d + ', N donne un reste de ' + (d - s)).join(' ;\n') + '.'
    : 'Un marchand range ses œufs dans des boîtes toutes de même taille. Avec des boîtes ' + listeDe(D.map(String)) + ' œufs, toutes les boîtes sont pleines sauf la dernière, où il manque toujours exactement ' + pl(s, 'œuf') + '. Quel est le plus petit nombre d\'œufs possible ?';
  const expl = 'Si chaque reste vaut le diviseur moins un même nombre, il suffit d\'ajouter ce nombre pour obtenir un multiple de chaque diviseur. '
    + 'Ici N + ' + s + ' est divisible par ' + listeEt(D.map(String)) + ', donc par leur plus petit multiple commun, ' + L + ' (' + justifPpcm(D, L) + '). '
    + 'Le plus petit choix est N + ' + s + ' = ' + L + ', soit N = ' + N + '. '
    + 'Vérification : ' + D.map(d => N + ' = ' + d + ' × ' + Math.floor(N / d) + ' + ' + (N % d)).join(' ; ') + '.'
    + ' Piège : ' + (L + s) + ' donnerait des restes de ' + s + ', et ' + (P !== L ? 'le produit ' + D.join(' × ') + ' = ' + P + ' n\'est pas le plus petit multiple commun.' : (2 * L - s) + ' convient aussi, mais n\'est pas le plus petit.');
  return mk(q, String(N), [String(L + s), String(L), P !== L ? String(P - s) : String(2 * L - s)], vNombre(N), expl);
}
function g4Diviseurs(R){ return gDiviseurs(R, R.pick(DIV4)); }

/* =====================================================================
   Niveau 5 · haut du test adaptatif
   ===================================================================== */
const zf = n => vp(n, 5);
function premierMultiple5(k){ let m = 5; while (zf(m) < k) m += 5; return m; }
function g5Zeros(R){
  if (R.int(0, 1)){
    const voulu = R.int(0, 1) === 1;
    let k, m;
    for (let i = 0; i < 300; i++){ k = R.int(3, 150); m = premierMultiple5(k); if ((zf(m) === k) === voulu) break; }
    const atteint = zf(m) === k, ans = atteint ? 5 : 0, Lm = legendre(m, 5);
    const q = 'Pour combien d\'entiers positifs n le nombre n! se termine-t-il par exactement ' + k + ' zéros ?';
    let expl = 'Le nombre de zéros de n! ne change que lorsque n atteint un multiple de cinq, et il augmente de plus d\'une unité à chaque multiple de vingt-cinq. ';
    if (atteint) expl += fa(m - 1) + ' se termine par ' + zf(m - 1) + ' zéros et ' + fa(m) + ' par ' + Lm.plus + ' = ' + k + ' zéros ; le compte ne bouge plus jusqu\'à ' + fa(m + 4) + ', et ' + fa(m + 5) + ' en a ' + zf(m + 5) + '. '
      + 'Les entiers qui conviennent sont ' + listeEt([m, m + 1, m + 2, m + 3, m + 4].map(String)) + ' : il y en a 5.'
      + ' Piège : la réponse n\'est pas 1, car n!, (n + 1)!… ont le même nombre de zéros tant qu\'on ne passe pas un multiple de 5.';
    else expl += fa(m - 1) + ' se termine par ' + zf(m - 1) + ' zéros, mais ' + fa(m) + ' en a ' + Lm.plus + ' = ' + zf(m) + ' : ' + m + ' est un multiple de ' + (m % 125 === 0 ? '125' : '25') + ', qui apporte ' + (zf(m) - zf(m - 1)) + ' facteurs 5 d\'un coup. '
      + 'Le compte saute de ' + zf(m - 1) + ' à ' + zf(m) + ' sans passer par ' + k + ' : aucun entier ne convient, la réponse est 0.'
      + ' Piège : croire que chaque nombre de zéros est atteint par cinq entiers.';
    return mk(q, String(ans), ['0', '5', '1', '4'], rien, expl);
  }
  const k = R.int(10, 120), m = premierMultiple5(k);
  let s0 = 5 * Math.round(4 * k / 5); if (s0 < 5) s0 = 5;
  const pas = [];
  if (zf(s0) >= k){ let x = s0; pas.push(x); while (zf(x - 5) >= k){ x -= 5; pas.push(x); } pas.push(x - 5); }
  else { let x = s0; pas.push(x); while (zf(x) < k){ x += 5; pas.push(x); } }
  const q = 'Quel est le plus petit entier n tel que n! se termine par au moins ' + k + ' zéros ?';
  const expl = 'On part d\'une estimation, puis on corrige de cinq en cinq en comptant les facteurs cinq, car seuls les multiples de cinq changent le nombre de zéros. '
    + 'Une factorielle gagne environ un zéro tous les quatre nombres (chaque bloc de 25 nombres en apporte 6), donc on essaie autour de 4 × ' + k + ' : '
    + pas.map(x => { const L = legendre(x, 5); return fa(x) + ' a ' + L.plus + ' = ' + L.v + ' zéros'; }).join(' ; ') + '. '
    + 'La première factorielle qui atteint ' + k + ' zéros est ' + fa(m) + ' : n = ' + m + '.'
    + ' Piège : ' + (5 * k) + ' (cinq fois ' + k + ') est trop grand, car les multiples de 25 apportent des zéros en plus.';
  return mk(q, String(m), [String(5 * k), String(m - 5), String(m + 5), String(4 * k)], vNombre(m), expl);
}
/* Bases avec au moins un exposant ≥ 2 : il faut former des paquets, et le facteur limitant n'est pas toujours le plus grand. */
const BC = [12, 18, 20, 24, 28, 36, 40, 45, 48, 50, 54, 72, 75];
function g5PuissanceComposite(R){
  const b = R.pick(BC), n = R.int(15, 60), f = facto(b);
  const parts = f.map(([p, e]) => { const L = legendre(n, p); return {p, e, v: L.v, L, q: Math.floor(L.v / e)}; });
  const ans = Math.min.apply(null, parts.map(o => o.q)), lim = parts.find(o => o.q === ans);
  const q = 'Quel est le plus grand entier k tel que ' + b + 'ᵏ divise ' + fa(n) + ' ?';
  const expl = 'On décompose la base en facteurs premiers, on compte chacun d\'eux dans la factorielle, puis on regarde lequel s\'épuise en premier. '
    + b + ' = ' + ecrit(f) + '. '
    + parts.map((o, i) => (i ? 'facteurs ' : 'Facteurs ') + o.p + ' dans ' + fa(n) + ' : ' + o.L.plus + ' = ' + o.v + (o.e > 1 ? ', soit ' + o.q + ' paquets de ' + pw(o.p, o.e) : '')).join(' ; ') + '. '
    + 'Chaque facteur ' + b + ' utilise ' + listeEt(f.map(([p, e]) => pw(p, e))) + ' : le facteur ' + lim.p + ' est le premier épuisé, donc k = ' + ans + '.'
    + ' Piège : diviser ' + n + ' par ' + b + ' donne ' + Math.floor(n / b) + ', mais les facteurs ' + b + ' se forment avec des morceaux de nombres différents.';
  return mk(q, String(ans), [String(Math.floor(n / b)), String(Math.max.apply(null, parts.map(o => o.v))), String(Math.max.apply(null, parts.map(o => o.q))), String(ans + 1)], vNombre(ans), expl);
}
const Y5 = (() => {
  const l = [];
  for (let Y = 1000; Y <= 2200; Y++){
    const f = facto(Y);
    if (f.some(([p]) => p > 47) || f.length < 2) continue;
    if (nMin(f) >= 10) l.push(Y);
  }
  return l;
})();
const Y5INT = Y5.filter(Y => { const f = facto(Y); return nMin(f) !== f[f.length - 1][0]; });
const Y5SPE = [2020, 2022, 2026, 2034];
function primaliteTxt(P){
  const l = []; let p = 2;
  for (; p * p <= P; p++) if (estPremier(p)) l.push(p);
  while (!estPremier(p)) p++;
  return nb(P) + ' est premier : il n\'est divisible par aucun des nombres premiers ' + listeEt(l.map(String)) + ', et ' + p + ' × ' + p + ' = ' + nb(p * p) + ' dépasse ' + nb(P) + '.';
}
function g5PlusPetitY(R){
  const u = R.int(1, 5), Y = u <= 2 ? R.pick(Y5INT) : (u <= 4 ? R.pick(Y5) : R.pick(Y5SPE));
  const f = facto(Y), ch = f.map(([p, e]) => ({p, e, c: chaineMin(p, e)})), ans = Math.max.apply(null, ch.map(o => o.c.n));
  const P = f[f.length - 1][0], naif = Math.max.apply(null, f.map(([p, e]) => p * e));
  const q = 'Quel est le plus petit entier n tel que n! soit divisible par ' + nb(Y) + ' ?';
  let expl = 'On décompose le nombre en facteurs premiers, puis on cherche pour chaque facteur premier la plus petite factorielle qui en contient assez ; la réponse est la plus grande de ces valeurs. '
    + nb(Y) + ' = ' + ecrit(f) + '. ' + (P > 47 ? primaliteTxt(P) + ' ' : '')
    + ch.map(o => (o.e === 1 ? 'Un facteur ' + nb(o.p) + ' : il apparaît pour la première fois dans ' + fa(o.p) : 'Il faut ' + o.e + ' facteurs ' + o.p + ' ; facteurs ' + o.p + ' cumulés : ' + o.c.txt + ', donc n ≥ ' + o.c.n)).join('. ')
    + '. La plus grande de ces valeurs est ' + nb(ans) + ', donc n = ' + nb(ans) + '.';
  const lim = ch.find(o => o.c.n === ans);
  if (ans !== P) expl += lim.p === P
    ? ' Piège : ' + fa(P) + ' ne contient qu\'un seul facteur ' + P + ' ; il en faut ' + lim.e + ', il faut donc aller jusqu\'à ' + fa(ans) + '.'
    : ' Piège : le plus grand facteur premier, ' + nb(P) + ', ne suffit pas : il faut aussi ' + lim.e + ' facteurs ' + lim.p + ', atteints seulement avec ' + fa(ans) + '.';
  else if (naif !== ans) expl += ' Piège : le calcul naïf (facteur premier × exposant) donne ' + nb(naif) + ', mais ici c\'est le grand facteur premier ' + nb(P) + ' qui décide.';
  else expl += ' Piège : prendre n = ' + nb(Y) + ' marche, mais ce n\'est pas le plus petit.';
  return mk(q, nb(ans), [ans !== P ? nb(P) : nb(Y), nb(naif), nb(ans + 1), nb(ans - 1)], vNombre(ans), expl);
}
function g5SommeFactMod(R){
  const m = R.pick([100, 100, 25, 32, 27, 81, 11, 75]);
  const N = m === 100 && R.int(0, 3) === 0 ? R.int(5, 9) : (R.int(0, 1) ? R.int(2015, 2035) : R.int(10, 999));
  return gSommeFact(R, m, N);
}
const LETTRES = {tous: 1, impairs: 1, pairs: 1, carres: 1, mult10: 1};
function g5DiviseursFact(R){
  const n = R.int(5, 10), f = decompFact(n), type = R.pick(Object.keys(LETTRES));
  const tous = produit(f.map(([, e]) => e + 1)), impairs = produit(f.filter(([p]) => p !== 2).map(([, e]) => e + 1));
  const e2 = f[0][1], e5 = f.find(([p]) => p === 5)[1];
  const choixTxt = (p, de, a) => (de === a ? 'exposant de ' + p + ' égal à ' + a + ' (1 choix)' : 'exposant de ' + p + ' de ' + de + ' à ' + a + ' (' + (a - de + 1) + ' choix)');
  let ans, q, detail;
  const L2 = legendre(n, 2), L3 = legendre(n, 3);
  const decomp = fa(n) + ' = ' + ecrit(f) + ' (facteurs 2 : ' + L2.plus + ' = ' + e2 + ' ; facteurs 3 : ' + (L3.t.length > 1 ? L3.plus + ' = ' : '') + f[1][1] + ')';
  if (type === 'tous'){
    ans = tous; q = 'Combien de diviseurs positifs le nombre ' + fa(n) + ' possède-t-il ?';
    detail = 'Un diviseur se fabrique en choisissant l\'exposant de chaque facteur premier : ' + f.map(([p, e]) => choixTxt(p, 0, e)).join(', ') + '. Total : ' + f.map(([, e]) => e + 1).join(' × ') + ' = ' + ans + '.';
  } else if (type === 'impairs'){
    ans = impairs; q = 'Combien de diviseurs positifs de ' + fa(n) + ' sont impairs ?';
    detail = 'Un diviseur impair ne contient aucun facteur 2 : l\'exposant de 2 vaut 0 (1 choix), puis ' + f.slice(1).map(([p, e]) => choixTxt(p, 0, e)).join(', ') + '. Total : ' + f.slice(1).map(([, e]) => e + 1).join(' × ') + ' = ' + ans + '.';
  } else if (type === 'pairs'){
    ans = tous - impairs; q = 'Combien de diviseurs positifs de ' + fa(n) + ' sont pairs ?';
    detail = 'Un diviseur pair contient au moins un facteur 2 : ' + choixTxt(2, 1, e2) + ', puis ' + f.slice(1).map(([p, e]) => choixTxt(p, 0, e)).join(', ') + '. Total : ' + [e2].concat(f.slice(1).map(([, e]) => e + 1)).join(' × ') + ' = ' + ans + '.';
  } else if (type === 'carres'){
    ans = produit(f.map(([, e]) => Math.floor(e / 2) + 1)); q = 'Combien de diviseurs positifs de ' + fa(n) + ' sont des carrés parfaits (comme 1, 4, 9 ou 16) ?';
    detail = 'Un carré parfait a tous ses exposants pairs : ' + f.map(([p, e]) => { const l = []; for (let j = 0; j <= e; j += 2) l.push(j); return l.length === 1 ? 'exposant de ' + p + ' égal à 0 (1 choix)' : 'exposant de ' + p + ' parmi ' + listeEt(l.map(String)) + ' (' + l.length + ' choix)'; }).join(', ') + '. Total : ' + f.map(([, e]) => Math.floor(e / 2) + 1).join(' × ') + ' = ' + ans + '.';
  } else {
    const autresP = f.filter(([p]) => p !== 2 && p !== 5);
    ans = e2 * e5 * produit(autresP.map(([, e]) => e + 1)); q = 'Combien de diviseurs positifs de ' + fa(n) + ' sont des multiples de 10 ?';
    detail = 'Un multiple de 10 contient au moins un facteur 2 et au moins un facteur 5 : ' + choixTxt(2, 1, e2) + ', ' + choixTxt(5, 1, e5) + ', puis ' + autresP.map(([p, e]) => choixTxt(p, 0, e)).join(', ') + '. Total : ' + [e2, e5].concat(autresP.map(([, e]) => e + 1)).join(' × ') + ' = ' + ans + '.';
  }
  const expl = 'On écrit d\'abord la factorielle en facteurs premiers, puis on compte les choix possibles pour l\'exposant de chaque facteur premier et on les multiplie. '
    + decomp + '. ' + detail + ' Piège : ' + (type === 'tous' ? 'additionner les nombres de choix donne ' + somme(f.map(([, e]) => e + 1)) + ', et oublier l\'exposant 0 donne ' + produit(f.map(([, e]) => e)) + '.' : 'il ne faut pas compter tous les diviseurs (il y en a ' + tous + ' en tout).');
  return mk(q, String(ans), [type === 'tous' ? String(produit(f.map(([, e]) => e))) : String(tous), type === 'tous' ? String(somme(f.map(([, e]) => e + 1))) : String(tous - ans), String(2 * ans)], vNombre(ans), expl);
}
function g5DeuxChiffresCaches(R){
  for (let essai = 0; essai < 300; essai++){
    const n = R.int(11, 18), s = String(fact(n)), Lg = s.length, z = Lg - s.replace(/0+$/, '').length;
    const i = R.int(1, Lg - z - 1), j = R.int(1, Lg - z - 1);
    if (i === j) continue;
    const ri = Lg - 1 - i, rj = Lg - 1 - j;                                       // rangs depuis les unités (0 = unités)
    if (ri % 2 === rj % 2) continue;                                             // signes opposés dans la somme alternée
    const v0 = s.split('').map(Number);
    const sol = [], parNeuf = [];
    for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++){
      const v = v0.slice(); v[i] = a; v[j] = b;
      const S = somme(v), T = v.reduce((t, c, k) => t + ((Lg - 1 - k) % 2 ? -c : c), 0);
      if (S % 9 === 0 && T % 11 === 0) sol.push([a, b]); else if (S % 9 === 0) parNeuf.push(a);
    }
    if (sol.length !== 1) continue;
    const [a, b] = sol[0];
    const caches = {}; caches[i] = '★'; caches[j] = '●';
    const visI = v0.filter((c, k) => k !== i && k !== j);
    const S = somme(visI);
    let P = 0, I = 0; v0.forEach((c, k) => { if (k === i || k === j) return; if ((Lg - 1 - k) % 2 === 0) P += c; else I += c; });
    const c9 = (9 - S % 9) % 9, sommes = [c9, c9 + 9, c9 + 18].filter(v => v <= 18);
    const etoileImpair = ri % 2 === 0;                                          // rang impair en numérotant les unités 1
    const lab = etoileImpair ? '★ − ●' : '● − ★';
    const cd = (((I - P) % 11) + 11) % 11, diffs = [cd, cd - 11].filter(v => v >= -9 && v <= 9);
    const dv = etoileImpair ? a - b : b - a;
    const q = 'On sait que ' + fa(n) + ' = ' + affiche(s, caches) + ', où ★ et ● sont deux chiffres effacés. Quel est le chiffre ★ ?';
    const expl = 'Dès onze, la factorielle contient les facteurs neuf et onze : la somme de ses chiffres est un multiple de neuf, et sa somme alternée (chiffres de rang impair moins chiffres de rang pair, en partant des unités) est un multiple de onze. '
      + 'Somme des chiffres visibles : ' + S + ', donc ★ + ● vaut ' + listeOu(sommes.map(String)) + '. '
      + 'En numérotant les chiffres depuis les unités, les chiffres visibles de rang impair ont pour somme ' + P + ' et ceux de rang pair ' + I + ' ; ★ est de rang ' + (etoileImpair ? 'impair' : 'pair') + ' et ● de rang ' + (etoileImpair ? 'pair' : 'impair') + ', donc ' + lab + ' vaut ' + listeOu(diffs.map(v => nb(v))) + '. '
      + 'Une somme et une différence de deux mêmes chiffres ont la même parité, et les chiffres vont de 0 à 9 : la seule possibilité est ★ + ● = ' + (a + b) + ' et ' + lab + ' = ' + nb(dv) + ', d\'où ★ = ' + a + ' et ● = ' + b + '. La réponse est ' + a + '.'
      + ' Piège : la somme des chiffres seule laisse plusieurs couples possibles, il faut aussi le critère de 11.';
    return mk(q, String(a), [String(b)].concat(R.shuffle(parNeuf.filter(x => x !== a)).map(String)), vChiffre(a), expl);
  }
  return null;
}

const GEN = {
  1: [g1Valeur, g1ResteFact, g1Critere, g1DiviseFact],
  2: [g2ResteSomme, g2ResteChiffres, g2ChiffreManquant, g2Zeros, g2Quotient, g2Critere],
  3: [g3Grand, g3Grand, g3Zeros, g3SommeFact, g3Simplif, g3Premiers, g3DiviseComposite, g3Diviseurs, g3ResteSimultane],
  4: [g4ZerosGrand, g4Legendre, g4PlusPetitN, g4SommeFact, g4ChiffresInconnus, g4ChiffreCache, g4Factorisation, g4ResteSimultane2, g4Diviseurs],
  5: [g5Zeros, g5PuissanceComposite, g5PlusPetitY, g5SommeFactMod, g5DiviseursFact, g5DeuxChiffresCaches]
};
function secours(){
  return {q: 'Quel est le reste de la division euclidienne de 10! par 7 ?' + RAPPEL, a: '0', accept: null, choix: ['0', '3', '1', '6'],
    expl: 'Un nombre qui figure parmi les facteurs d\'un produit divise ce produit, sans aucun calcul. Le produit 1 × 2 × … × 7 × … × 10 contient le facteur 7 : c\'est un multiple de 7, et le reste vaut 0. Piège : 3 est le reste de 10 par 7, pas celui de 10!.'};
}

A.push({
  id: 'alb-09-factorielles',
  phase: 'albert',
  ordre: 9,
  theme: 'arithmetique',
  titre: 'Factorielles, divisibilité et restes de division',
  objectif: 'Trouver sans calculer un reste, un nombre de zéros ou un diviseur d\'une factorielle géante comme 2027!, en lisant n! comme un produit de facteurs et en utilisant les critères de divisibilité.',
  lecon:
`<p class="lede">Au test, une question d'arithmétique peut contenir un nombre monstrueux comme <mark>2 027!</mark> et te demander un reste, un nombre de zéros ou un diviseur. Personne ne calcule 2 027! : la réponse tient en deux lignes dès que tu lis une factorielle comme un <mark>produit de facteurs</mark>.</p>
<h3>Ce que le test demande</h3>
<p>Des questions courtes, sans calculatrice : le reste de la division de 2 027! par 2 026, le reste de 2 026! + 2 027 par 2 026, le nombre de zéros à la fin de 30!, le chiffre qui manque pour qu'un nombre soit divisible par 9, le plus petit n tel que n! soit divisible par 1 000. Aucune formule à réciter : il faut repérer le raccourci, puis vérifier.</p>
<h3>Les prérequis, en partant de zéro</h3>
<p><strong>La factorielle.</strong> n! (on lit « factorielle n ») est le produit de tous les entiers de 1 à n : 5! = 1 × 2 × 3 × 4 × 5 = 120. Chaque factorielle s'obtient à partir de la précédente : 6! = 6 × 5! = 720.</p>
<table class="tbl"><tr><th>n</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td></tr>
<tr><th>n!</th><td>1</td><td>2</td><td>6</td><td>24</td><td>120</td><td>720</td><td>5 040</td><td>40 320</td></tr></table>
<p><strong>Diviseur, multiple, reste.</strong> Diviser a par d, c'est écrire a = d × q + r avec un reste r compris entre 0 et d − 1. Le reste vaut 0 exactement quand d divise a. Exemple : 2 027 = 9 × 225 + 2.</p>
<p><strong>Nombres premiers.</strong> Un nombre premier a exactement deux diviseurs, 1 et lui-même : 2, 3, 5, 7, 11, 13… (1 n'est pas premier, 2 est le seul premier pair). Tout entier se décompose en produit de nombres premiers : 360 = 2³ × 3² × 5.</p>
<table class="tbl"><tr><th>Divisible par</th><th>Critère</th></tr>
<tr><td>2 ; 5 ; 10</td><td>dernier chiffre pair ; 0 ou 5 ; 0</td></tr>
<tr><td>3 ; 9</td><td>somme des chiffres divisible par 3 ; par 9</td></tr>
<tr><td>4 ; 8</td><td>nombre formé par les deux ; par les trois derniers chiffres</td></tr>
<tr><td>11</td><td>somme alternée depuis les unités (unités − dizaines + centaines − …) divisible par 11</td></tr>
<tr><td>6 ; 12 ; 15 ; 72</td><td>deux critères à la fois : 2 et 3 ; 3 et 4 ; 3 et 5 ; 8 et 9</td></tr></table>
<p>Bonus utile : un nombre a le même reste que la somme de ses chiffres dans la division par 9 (et par 3).</p>
<div class="formule"><p>n! = 1 × 2 × 3 × … × n est divisible par chaque entier de 1 à n ; le reste d'une somme est la somme des restes, que l'on réduit</p></div>
<h3>La méthode</h3>
<div class="etapes">
<p><strong>1. Je ne calcule pas :</strong> je regarde si le diviseur figure parmi les facteurs. Si d ≤ n, alors n! est un multiple de d et le reste vaut 0.</p>
<p><strong>2. Si le diviseur dépasse n :</strong> je le décompose en facteurs premiers et je vérifie que n! en contient assez. 13 ne divise pas 12! (13 est premier et plus grand que 12) ; 27 = 3³ ne divise pas 8!, qui ne contient que deux facteurs 3 (dans 3 et 6).</p>
<p><strong>3. Pour une somme :</strong> je prends le reste de chaque morceau, j'additionne, puis je réduis. Un reste est toujours positif ou nul et plus petit que le diviseur.</p>
<p><strong>4. Pour les zéros finaux :</strong> chaque zéro vient d'un 2 × 5, et les 2 sont plus nombreux : je compte les facteurs 5 avec n ÷ 5 + n ÷ 25 + n ÷ 125 + … (parties entières).</p>
</div>
<h3>Exemples résolus</h3>
<p><strong>Exemple 1.</strong> Reste de 10! par 7. 10! = 1 × 2 × … × 7 × … × 10 contient le facteur 7 : c'est un multiple de 7, le reste vaut <mark>0</mark>.</p>
<p><strong>Exemple 2.</strong> Reste de 2 027 par 9. Somme des chiffres : 2 + 0 + 2 + 7 = 11, et 11 = 9 + 2. Le reste vaut <mark>2</mark>. Vérification : 9 × 225 = 2 025.</p>
<p><strong>Exemple 3.</strong> Reste de 2 026! + 2 027 par 2 026. 2 026! a un reste 0 ; 2 027 = 2 026 + 1 a un reste 1. Total : <mark>1</mark>. Et pour 2 026! − 1 ? On écrit 2 026! − 1 = 2 026 × (Q − 1) + 2 025 : le reste vaut 2 025, jamais −1.</p>
<p><strong>Exemple 4.</strong> Zéros à la fin de 30!. 30 ÷ 5 → 6 multiples de 5, et 30 ÷ 25 → 1 multiple de 25 qui apporte un second facteur 5. Total : 6 + 1 = <mark>7</mark> zéros.</p>
<p><strong>Exemple 5.</strong> Reste de 1! + 2! + … + 2 026! par 12. 4! = 24 est un multiple de 12, donc 4!, 5!, …, 2 026! ont tous un reste 0. Il reste 1 + 2 + 6 = <mark>9</mark>.</p>
<h3>Pour les questions les plus dures</h3>
<p><strong>Mettre en facteur.</strong> 2 025! + 2 026! = 2 025! × (1 + 2 026) = 2 025! × 2 027 : c'est un multiple de 2 027, alors que 2 027, premier, ne divise ni 2 025! ni 2 026!.</p>
<p><strong>Le plus petit n.</strong> Pour que n! soit divisible par 2⁶ = 64, on avance de multiple de 2 en multiple de 2 en cumulant les facteurs : 2 → 1, 4 → 3, 6 → 4, 8 → 7. Donc n = 8, et non 2 × 6 = 12.</p>
<p><strong>Le nombre de diviseurs.</strong> 72 = 2³ × 3² : un diviseur prend le facteur 2 de 0 à 3 fois (4 choix) et le facteur 3 de 0 à 2 fois (3 choix), soit 4 × 3 = 12 diviseurs.</p>
<p><strong>Les restes identiques.</strong> Un nombre qui, divisé par 4, 6 ou 9, laisse toujours un reste 3, s'écrit 36k + 3, car 36 est le plus petit multiple commun de 4, 6 et 9.</p>
<p><strong>Les restes décalés.</strong> Si un nombre, divisé par 3, 4 et 5, laisse les restes 2, 3 et 4, il lui manque toujours 1 pour tomber juste : N + 1 est un multiple de 60, et le plus petit N vaut 59.</p>
<p><strong>Les chiffres effacés.</strong> Dès 6!, une factorielle est divisible par 9 : la somme de ses chiffres est un multiple de 9. Dès 11!, elle est aussi divisible par 11 : sa somme alternée est un multiple de 11. Ces deux conditions suffisent pour retrouver deux chiffres effacés.</p>
<p><strong>Les sauts de zéros.</strong> Le nombre de zéros de n! augmente de 1 à chaque multiple de 5, mais de 2 d'un coup à chaque multiple de 25 : 24! se termine par 4 zéros et 25! par 6, donc aucune factorielle ne se termine par exactement 5 zéros.</p>
<h3>Réflexes sans calculatrice</h3>
<ul>
<li>Connais par cœur 1! à 7! : 1, 2, 6, 24, 120, 720, 5 040.</li>
<li>n! ÷ (n − 1)! = n : on simplifie au lieu de calculer.</li>
<li>Restes de proche en proche : pour k!, multiplie le reste de (k − 1)! par k, puis réduis.</li>
<li>Avant de poser une division, applique les critères : ils donnent le reste par 3, 9, 4 ou 8 en quelques secondes.</li>
<li>Dans un QCM, élimine tout « reste » négatif ou plus grand que le diviseur.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Lis n! comme le produit 1 × 2 × … × n : tout diviseur qu'on peut fabriquer avec ces facteurs donne un reste nul, et il ne reste à traiter que les petits morceaux ajoutés ou retirés.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Ne te lance jamais dans le calcul. Le critère de 4 regarde deux chiffres, celui de 8 en regarde trois. 25, 50, 75 et 100 apportent chacun deux facteurs 5 (30! se termine par 7 zéros, pas 6), et 125 en apporte trois. Un nombre premier plus grand que n ne divise pas n! (13 ne divise pas 12!), et un nombre aux petits facteurs peut quand même en demander trop (27 ne divise pas 8!). Un reste n'est jamais négatif ni plus grand que le diviseur.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>n! est divisible par tous les entiers de 1 à n. Reste d'une somme = somme des restes, que l'on réduit. Zéros de n! = n ÷ 5 + n ÷ 25 + n ÷ 125 + … ; facteurs p dans n! = n ÷ p + n ÷ p² + … Critères : 3 et 9 par la somme des chiffres, 4 et 8 par les deux ou trois derniers chiffres, 11 par la somme alternée.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(GEN[n])(R);
      if (ex && typeof ex.q === 'string' && typeof ex.a === 'string' && Array.isArray(ex.choix) && ex.choix.length === 4) return ex;
    } catch (e) { /* repli ci-dessous */ }
    return secours();
  }
});

})();
