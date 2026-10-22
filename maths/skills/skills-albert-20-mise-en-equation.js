/* ===== Maths · Objectif Albert School : alb-20 · Mise en équation, systèmes 2×2, problèmes d'âges =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS.
   gen(level, R) : niveaux 1 à 5 (bornés), n'utilise que R.int, R.pick, R.shuffle, ne lève jamais d'exception.
   Chaque énoncé est construit à partir de la solution tirée au hasard : la réponse est toujours calculée.
   Sous-types : N1 nombre mystère, somme et différence, écart d'âge constant, entiers consécutifs ;
   N2 rapport d'âges qui change, système direct, prix de deux articles, deux sortes de pièces ;
   N3 têtes et pattes, total de sommes deux à deux, achats symétriques, somme des âges, « dans combien d'années » ;
   N4 un nombre parmi des sommes deux à deux, transferts entre deux groupes, parent contre somme des enfants,
      « quand il avait ton âge » ; N5 « j'ai k fois l'âge que tu avais… », enfant pas encore né,
      parent et enfants avec deux conditions (égalité ou double dans n ans), quatre nombres additionnés trois par trois.
   Vérifié par verifs/alb-20-mise-en-equation-verif.js (relecture de l'énoncé et force brute, unicité de la solution). */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales ---------- */
/* Même normalisation que normStr (core/pedagogie.js), chargé après ce fichier. */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
/* Nombre à la française : virgule, U+202F pour les milliers, vrai signe moins. */
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));
const ent = v => typeof v === 'number' && isFinite(v) && Math.abs(v - Math.round(v)) < 1e-9;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const ans = v => v + (v === 1 ? ' an' : ' ans');
const brut = v => String(v);
const euro = v => nb(v, 0) + ' €';
/* Montant en centimes vers « 4,60 € » ou « 5 € ». */
function eur(c){ c = Math.round(c); const e = Math.floor(c / 100), r = c % 100; return nb(e, 0) + (r ? ',' + (r < 10 ? '0' : '') + r : '') + ' €'; }
/* « le double de », « le triple de », « le quadruple de », sinon « k fois ». */
const fois = k => k === 2 ? 'le double de' : k === 3 ? 'le triple de' : k === 4 ? 'le quadruple de' : k + ' fois';
const MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six'];
/* Élision : « de vaches », « d'araignées ». */
const de = w => (/^[aeiouyéèêàâîôû]/i.test(w) ? 'd\'' : 'de ') + w;
/* Terme d'une équation : 1x s'écrit x. */
const tx = (c, v) => (c === 1 ? '' : String(c)) + v;
/* Article et quantité : « un café », « une crêpe », « 3 cahiers ». */
const un = it => (it.f ? 'une ' : 'un ') + it.s;
const qte = (n, it) => n === 1 ? un(it) : n + ' ' + it.p;
/* Liste française : « 4, 7 et 12 ». */
const liste = l => l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1];

/* QCM : la bonne réponse, les distracteurs pédagogiques (entiers > 0 seulement), puis des voisins. */
function choix(bonne, autres, fmt, pas, ok){
  const valide = v => ent(v) && v > 0 && (!ok || ok(v));
  const ch = [fmt(bonne)], vus = new Set([norm(ch[0])]);
  const ajouter = v => { if (ch.length < 4 && valide(v)){ const s = fmt(Math.round(v)); if (!vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); } } };
  autres.forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 120; k++) ajouter(bonne + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * pas);
  for (let k = 1; ch.length < 4 && k < 400; k++) ajouter(bonne + k * pas);
  return ch;
}
/* Un âge proposé reste plausible (moins de 100 ans). */
const Q = (q, bonne, autres, fmt, pas, expl, ok) => {
  const ok2 = fmt === ans ? (v => v < 100 && (!ok || ok(v))) : ok;
  return { q, a: fmt(bonne), accept: null, choix: choix(bonne, autres, fmt, pas || 1, ok2), expl };
};

/* Aucun prénom ne commence par une voyelle ou un h muet : « de Léa », « que Tom » se disent sans élision. */
const FILLES = ['Léa', 'Rose', 'Jade', 'Nour', 'Lina', 'Clara', 'Zoé', 'Sarah', 'Chloé', 'Maya', 'Yasmine', 'Camille', 'Manon', 'Lou'];
const GARCONS = ['Tom', 'Jules', 'Sami', 'Lucas', 'Yanis', 'Malik', 'Noé', 'Rayan', 'Maël', 'Léo', 'Bilal', 'Théo', 'Karim', 'Nathan'];
const FAMILLES = ['Martin', 'Bernard', 'Petit', 'Durand', 'Moreau', 'Laurent', 'Benali', 'Nguyen', 'Diallo', 'Rossi', 'Lefebvre', 'Garcia'];
/* Noms distincts, filles et garçons mêlés. */
function noms(R, n){
  const pool = R.shuffle(FILLES.concat(GARCONS));
  return pool.slice(0, n).map(x => ({ nom: x, f: FILLES.indexOf(x) >= 0 }));
}
const DUOS = [
  { Pm: 'Un père', P: 'un père', le: 'le père', il: 'il', E: 'son fils', le_e: 'le fils', du_e: 'du fils', eux: 'à eux deux' },
  { Pm: 'Une mère', P: 'une mère', le: 'la mère', il: 'elle', E: 'sa fille', le_e: 'la fille', du_e: 'de la fille', eux: 'à elles deux' },
  { Pm: 'Une mère', P: 'une mère', le: 'la mère', il: 'elle', E: 'son fils', le_e: 'le fils', du_e: 'du fils', eux: 'à eux deux' },
  { Pm: 'Un père', P: 'un père', le: 'le père', il: 'il', E: 'sa fille', le_e: 'la fille', du_e: 'de la fille', eux: 'à eux deux' }
];

/* =====================================================
   NIVEAU 1 · découverte
   ===================================================== */

/* 1a · Nombre mystère : kx + b = c ou kx − b = c. */
function s1a(R){
  const k = R.pick([2, 3, 4, 5]), x = R.int(3, 25), b = R.int(2, 19);
  const plus = R.int(0, 1) === 1 || k * x - b < 4;
  const c = plus ? k * x + b : k * x - b;
  const mot = { 2: 'Le double', 3: 'Le triple', 4: 'Le quadruple', 5: 'Le quintuple' }[k];
  const ctx = R.int(0, 2);
  let q;
  if (ctx === 0) q = `${mot} d'un nombre, ${plus ? 'augmenté' : 'diminué'} de ${b}, vaut ${c}. Quel est ce nombre ?`;
  else if (ctx === 1) q = `Je pense à un nombre. Je le multiplie par ${k}, puis ${plus ? 'j\'ajoute' : 'j\'enlève'} ${b} : j'obtiens ${c}. Quel est mon nombre ?`;
  else if (plus) q = `Une salle d'escalade fait payer ${b} € d'inscription, puis ${k} € par séance. ${R.pick(FILLES)} a payé ${c} € en tout. Combien de séances a-t-elle faites ?`;
  else q = `${R.pick(GARCONS)} achète ${k} places de concert au même prix. Grâce à un bon de réduction de ${b} € sur le total, il paie ${c} €. Combien coûte une place, en euros ?`;
  const debut = 'Traduis l\'énoncé par une équation, puis défais les opérations dans l\'ordre inverse. ';
  const expl = plus
    ? debut + `Avec x le nombre cherché : ${k}x + ${b} = ${c}. On retire ${b} des deux côtés : ${k}x = ${c - b}. On divise par ${k} : x = ${x}. Vérification : ${k} × ${x} + ${b} = ${c}. Piège : s'arrêter à ${c - b}, qui vaut ${k}x et pas x.`
    : debut + `Avec x le nombre cherché : ${k}x − ${b} = ${c}. On ajoute ${b} des deux côtés : ${k}x = ${c + b}. On divise par ${k} : x = ${x}. Vérification : ${k} × ${x} − ${b} = ${c}. Piège : retirer ${b} au lieu de l'ajouter, c'est l'erreur de signe classique quand un terme change de côté.`;
  const autres = plus ? [c - b, (c + b) / k, c / k - b, c / k] : [c + b, (c - b) / k, c / k + b, c / k];
  return Q(q, x, autres, brut, 1, expl);
}

/* 1b · Somme et différence. */
function s1b(R){
  const pt = R.int(4, 40), D = R.int(2, 20), gd = pt + D, S = pt + gd, grand = R.int(0, 1) === 1;
  const ctx = R.int(0, 3);
  let q;
  if (ctx === 0) q = `Deux nombres ont pour somme ${S} et pour différence ${D}. Quel est le plus ${grand ? 'grand' : 'petit'} des deux ?`;
  else if (ctx === 1){
    const f = R.pick(FILLES), g = R.pick(GARCONS);
    q = `À eux deux, ${f} et ${g} possèdent ${S} €. ${f} a ${D} € de plus que ${g}. Combien d'euros possède ${grand ? f : g} ?`;
  }
  else if (ctx === 2) q = `Une ficelle de ${S} cm est coupée en deux morceaux. L'un mesure ${D} cm de plus que l'autre. Combien mesure le morceau le plus ${grand ? 'long' : 'court'}, en cm ?`;
  else q = `Un club de théâtre compte ${S} membres. Il y a ${D} filles de plus que de garçons. Combien y a-t-il de ${grand ? 'filles' : 'garçons'} ?`;
  const expl = `Retire l'écart pour obtenir deux parts égales, puis partage en deux. ${S} − ${D} = ${2 * pt}, et ${2 * pt} ÷ 2 = ${pt} : c'est la petite part. La grande vaut ${pt} + ${D} = ${gd}. Vérification : ${pt} + ${gd} = ${S} et ${gd} − ${pt} = ${D}. `
    + (grand ? `Piège : ${S} ÷ 2 ne tient pas compte de l'écart.` : `Piège : ${2 * pt} est le double de la petite part, pas la petite part.`);
  return Q(q, grand ? gd : pt, grand ? [pt, S / 2, S - D] : [gd, S - D, S / 2], brut, 1, expl);
}

/* 1c · L'écart d'âge ne change pas. */
function s1c(R){
  const fille = R.int(0, 1) === 1, nom = R.pick(fille ? FILLES : GARCONS);
  const pere = R.int(0, 1) === 1, par = pere ? 'son père' : 'sa mère';
  if (R.int(0, 1) === 1){
    for (let t = 0; t < 200; t++){
      const c = R.int(4, 14), k = R.pick([3, 4, 5]), gap = (k - 1) * c;
      if (gap < 22 || gap > 42) continue;
      const F = c + R.int(3, 20), P = k * c, rep = F + gap;
      const q = `${nom} a ${c} ans et ${par} a ${fois(k)} son âge. Quel âge aura ${par} quand ${nom} aura ${F} ans ?`;
      const expl = `L'écart d'âge entre deux personnes ne change jamais : calcule-le aujourd'hui, puis ajoute-le au bon moment. Aujourd'hui, ${par} a ${k} × ${c} = ${P} ans, soit ${gap} ans de plus que ${nom}. Quand ${nom} aura ${F} ans, ${par} aura ${F} + ${gap} = ${rep} ans. Piège : ${k} × ${F} = ${k * F} est faux, car le rapport entre les deux âges change avec le temps ; seul l'écart reste fixe.`;
      return Q(q, rep, [k * F, P + F, P], ans, 1, expl);
    }
  }
  const c = R.int(8, 16), gap = R.int(22, 40), P = c + gap, tp = R.int(1, c - 3), rep = tp + gap;
  const q = `Aujourd'hui, ${nom} a ${c} ans et ${par} ${P} ans. Quel âge avait ${par} quand ${nom} avait ${ans(tp)} ?`;
  const expl = `L'écart d'âge ne change jamais : calcule-le, puis applique-le au moment demandé. L'écart vaut ${P} − ${c} = ${gap} ans. Quand ${nom} avait ${ans(tp)}, ${par} avait donc ${tp} + ${gap} = ${rep} ans (c'était il y a ${ans(c - tp)}, et ${P} − ${c - tp} = ${rep}). Piège : ${P} − ${tp} = ${P - tp} retire l'âge de ${nom} au lieu du nombre d'années écoulées.`;
  return Q(q, rep, [P - tp, P - c, gap, P * tp / c], ans, 1, expl);
}

/* 1d · Entiers consécutifs (ou pairs consécutifs). */
function s1d(R){
  const n = R.pick([2, 3, 3, 4, 5]), pair = n >= 3 && R.int(0, 2) === 0, st = pair ? 2 : 1;
  const livre = n === 2 && R.int(0, 1) === 1;
  let m = R.int(6, 60); if ((pair || livre) && m % 2) m++;
  const S = n * m + st * n * (n - 1) / 2, last = m + (n - 1) * st, grand = R.int(0, 1) === 1, rep = grand ? last : m;
  const q = livre
    ? `Un livre est ouvert sur deux pages qui se suivent. La somme des deux numéros de page vaut ${S}. Quel est le plus ${grand ? 'grand' : 'petit'} des deux numéros ?`
    : `La somme de ${MOTS[n]} ${pair ? 'nombres pairs consécutifs' : 'entiers consécutifs'} vaut ${S}. Quel est le plus ${grand ? 'grand' : 'petit'} de ces nombres ?`;
  const termes = [], plus = st * n * (n - 1) / 2;
  for (let i = 0; i < n; i++) termes.push(i === 0 ? 'x' : 'x + ' + i * st);
  const vals = []; for (let i = 0; i < n; i++) vals.push(m + i * st);
  let expl = `Appelle x le plus petit des nombres et écris les suivants à partir de lui. Les nombres sont ${liste(termes)} : leur somme vaut ${n}x + ${plus} = ${S}. Donc ${n}x = ${S} − ${plus} = ${S - plus}, et x = ${m}. Les nombres sont ${liste(vals)}. `;
  expl += pair ? 'Piège : des nombres pairs consécutifs vont de 2 en 2, pas de 1 en 1.'
    : grand ? `Piège : le plus grand vaut x + ${(n - 1) * st}, pas x + ${n * st} : ${MOTS[n]} nombres ne font que ${MOTS[n - 1]} écart${n > 2 ? 's' : ''}.`
    : `Piège : ne confonds pas le plus petit avec le nombre du milieu.`;
  const mid = S / n;
  const autres = grand ? [m, m + n * st, pair ? mid + 1 : mid, last - st] : [last, mid, m - st, m + st];
  return Q(q, rep, autres, brut, 1, expl);
}

/* =====================================================
   NIVEAU 2 · maîtrise
   ===================================================== */

/* 2a · Rapport d'âges qui change : kF + n = m(F + n) ou kF − n = m(F − n). */
function s2a(R){
  let F = 12, k = 3, m = 2, n = 12, fut = true;
  for (let t = 0; t < 400; t++){
    const f = R.int(0, 2) > 0, F0 = R.int(3, 16);
    if (f){
      const k0 = R.int(3, 7), m0 = R.pick([2, 3].filter(v => v < k0)), n0 = F0 * (k0 - m0) / (m0 - 1), gap = (k0 - 1) * F0;
      if (!ent(n0) || n0 < 2 || n0 > 30 || gap < 20 || gap > 45) continue;
      F = F0; k = k0; m = m0; n = n0; fut = true; break;
    } else {
      const k0 = R.int(2, 4), m0 = R.int(k0 + 1, 7), n0 = F0 * (m0 - k0) / (m0 - 1), gap = (k0 - 1) * F0;
      if (!ent(n0) || n0 < 2 || n0 > F0 - 1 || gap < 20 || gap > 45) continue;
      F = F0; k = k0; m = m0; n = n0; fut = false; break;
    }
  }
  const d = R.pick(DUOS), P = k * F, askE = R.int(0, 4) < 3;
  const q = `${d.Pm} a aujourd'hui ${fois(k)} l'âge de ${d.E}. ${fut ? 'Dans ' + n + ' ans, ' + d.il + ' aura' : 'Il y a ' + n + ' ans, ' + d.il + ' avait'} ${fois(m)} l'âge de ${d.E}. Quel âge a ${askE ? d.le_e : d.le} aujourd'hui ?`;
  const s = fut ? '+' : '−', dk = fut ? k - m : m - k;
  let expl = `Pose x l'âge ${d.du_e} aujourd'hui, puis ${fut ? 'ajoute' : 'retire'} le même nombre d'années aux deux personnes. Aujourd'hui : ${d.le_e} a x ans, ${d.le} ${k}x. ${fut ? 'Dans' : 'Il y a'} ${n} ans : x ${s} ${n} et ${k}x ${s} ${n}. Équation : ${k}x ${s} ${n} = ${m}(x ${s} ${n}), soit ${k}x ${s} ${n} = ${m}x ${s} ${m * n}. `;
  expl += `Donc ${tx(dk, 'x')} = ${m * n} − ${n} = ${(m - 1) * n}` + (dk > 1 ? `, et x = ${F}` : '') + `. ${cap(d.le_e)} a ${F} ans et ${d.le} ${P} ans. Vérification : ${fut ? 'dans' : 'il y a'} ${n} ans, ${P} ${s} ${n} = ${fut ? P + n : P - n} et ${m} × ${fut ? F + n : F - n} = ${m * (fut ? F + n : F - n)}. Piège : ${fut ? 'ajouter' : 'retirer'} ${n} ans au parent seulement.`;
  const faux = fut ? n / (k - m) : null;
  const autres = askE ? [P, fut ? F + n : F - n, n, faux] : [F, fut ? P + n : P - n, m * F, faux == null ? null : k * faux];
  return Q(q, askE ? F : P, autres, ans, 1, expl);
}

/* 2b · Système 2×2 direct (combinaison ou substitution). */
function s2b(R){
  for (let t = 0; t < 400; t++){
    let x = R.int(1, 9), y = R.int(1, 9);
    const pat = R.int(0, 3), askX = R.int(0, 1) === 1;
    let e1, e2, expl, err = null;
    if (pat <= 1){
      if (x === y) continue;
      const u = pat === 0 ? 'x' : 'y', w = pat === 0 ? 'y' : 'x', vu = pat === 0 ? x : y, vw = pat === 0 ? y : x;
      const a = R.int(2, 5), b = R.int(1, a - 1), e = a * vu + vw, f = b * vu + vw, dd = a - b;
      const L1 = pat === 0 ? tx(a, 'x') + ' + y' : 'x + ' + tx(a, 'y'), L2 = pat === 0 ? tx(b, 'x') + ' + y' : 'x + ' + tx(b, 'y');
      e1 = L1 + ' = ' + e; e2 = L2 + ' = ' + f;
      expl = `Les deux équations ont le même terme en ${w} : soustrais-les membre à membre pour éliminer ${w}. (${L1}) − (${L2}) = ${e} − ${f}, donc ${tx(dd, u)} = ${e - f}` + (dd > 1 ? `, puis ${u} = ${e - f} ÷ ${dd} = ${vu}` : '')
        + `. On reporte dans la seconde équation : ${w} = ${f} − ${b * vu} = ${vw}. Vérification : ${pat === 0 ? a + ' × ' + vu + ' + ' + vw : vw + ' + ' + a + ' × ' + vu} = ${e}.` + (dd > 1 ? ` Piège : ${e - f} vaut ${tx(dd, u)}, pas ${u}.` : '');
      if (dd > 1) err = (askX === (u === 'x')) ? e - f : f - b * (e - f);
    } else if (pat === 2){
      if (x === y) continue;
      const s = x + y, b = R.int(2, 5), a = R.int(1, 5);
      if (a === b) continue;
      const e = a * x + b * y;
      e1 = 'x + y = ' + s; e2 = tx(a, 'x') + ' + ' + b + 'y = ' + e;
      const dd = Math.abs(a - b);
      expl = `Rends identiques les termes en y des deux équations, puis soustrais-les pour éliminer y. On multiplie la première par ${b} : ${b}x + ${b}y = ${b * s}. `
        + (a > b ? `On la retire de la seconde : ${tx(dd, 'x')} = ${e} − ${b * s} = ${e - b * s}` : `On en retire la seconde : ${tx(dd, 'x')} = ${b * s} − ${e} = ${b * s - e}`)
        + (dd > 1 ? `, donc x = ${x}` : '') + `. Enfin y = ${s} − ${x} = ${y}. Vérification : ${a === 1 ? '' : a + ' × '}${x} + ${b} × ${y} = ${e}.`;
    } else {
      const a = R.int(1, 3), b = R.int(1, 4), c = R.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      y = a * x + c;
      if (y < 1 || y > 30 || y === x) continue;
      const e = b * x + y, sg = c > 0 ? '+' : '−', ac = Math.abs(c);
      e1 = `y = ${tx(a, 'x')} ${sg} ${ac}`; e2 = `${tx(b, 'x')} + y = ${e}`;
      expl = `Remplace y par son expression dans l'autre équation : il ne reste plus que x. ${tx(b, 'x')} + (${tx(a, 'x')} ${sg} ${ac}) = ${e}, soit ${tx(a + b, 'x')} ${sg} ${ac} = ${e}. Donc ${tx(a + b, 'x')} = ${e} ${c > 0 ? '−' : '+'} ${ac} = ${e - c}, et x = ${x}. Enfin y = ${a === 1 ? '' : a + ' × '}${x} ${sg} ${ac} = ${y}. Piège : en passant de l'autre côté, ${sg} ${ac} devient ${c > 0 ? '−' : '+'} ${ac}.`;
      const xf = (e + c) / (a + b);
      if (ent(xf)) err = askX ? xf : a * xf + c;
    }
    const cible = askX ? 'x' : 'y', rep = askX ? x : y, autre = askX ? y : x;
    const v = R.int(0, 2);
    const q = v === 0 ? `On sait que ${e1} et que ${e2}. Que vaut ${cible} ?`
      : v === 1 ? `Les nombres x et y vérifient à la fois ${e1} et ${e2}. Combien vaut ${cible} ?`
      : `Résous le système formé par les équations ${e1} et ${e2}. Que vaut ${cible} ?`;
    return Q(q, rep, [autre, err, x + y], brut, 1, expl);
  }
  return Q('On sait que 3x + y = 17 et que x + y = 9. Que vaut x ?', 4, [5, 8, 9], brut, 1,
    'Les deux équations ont le même terme en y : soustrais-les membre à membre pour éliminer y. (3x + y) − (x + y) = 17 − 9, donc 2x = 8, puis x = 8 ÷ 2 = 4. On reporte dans la seconde équation : y = 9 − 4 = 5. Vérification : 3 × 4 + 5 = 17. Piège : 8 vaut 2x, pas x.');
}

/* 2c · Prix de deux articles : deux achats qui ne diffèrent que par un article. */
/* r : fourchette de prix de chaque article, en multiples de « pas » centimes (un classeur coûte plus qu'une gomme). */
const BOUT = [
  { lieu: 'Dans une boulangerie', it: [{ s: 'croissant', p: 'croissants' }, { s: 'café', p: 'cafés' }], r: [[8, 16], [12, 30]], pas: 10 },
  { lieu: 'Dans une boulangerie', it: [{ s: 'pain au chocolat', p: 'pains au chocolat' }, { s: 'jus de fruits', p: 'jus de fruits' }], r: [[9, 18], [15, 35]], pas: 10 },
  { lieu: 'À la cafétéria', it: [{ s: 'crêpe', p: 'crêpes', f: 1 }, { s: 'boisson', p: 'boissons', f: 1 }], r: [[20, 45], [12, 30]], pas: 10 },
  { lieu: 'Dans une papeterie', it: [{ s: 'cahier', p: 'cahiers' }, { s: 'stylo', p: 'stylos' }], r: [[15, 45], [5, 20]], pas: 10 },
  { lieu: 'Dans une papeterie', it: [{ s: 'classeur', p: 'classeurs' }, { s: 'gomme', p: 'gommes', f: 1 }], r: [[20, 60], [4, 15]], pas: 10 },
  { lieu: 'Au cinéma', it: [{ s: 'place adulte', p: 'places adultes', f: 1 }, { s: 'place enfant', p: 'places enfants', f: 1 }], r: [[16, 26], [9, 15]], pas: 50 }
];
function s2c(R){
  for (let t = 0; t < 400; t++){
    const B = R.pick(BOUT), P = [R.int(B.r[0][0], B.r[0][1]) * B.pas, R.int(B.r[1][0], B.r[1][1]) * B.pas];
    if (P[0] === P[1]) continue;
    const sh = R.int(0, 1), o = 1 - sh, s = R.pick([1, 2]), u = R.pick([2, 3]), v = R.int(1, u - 1);
    const q1 = [0, 0], q2 = [0, 0]; q1[sh] = s; q2[sh] = s; q1[o] = u; q2[o] = v;
    const M = q1[0] * P[0] + q1[1] * P[1], N = q2[0] * P[0] + q2[1] * P[1];
    if (M > 6000) continue;
    const tg = R.int(0, 1), it = B.it, d = u - v, D = M - N;
    const q = `${B.lieu}, ${qte(q1[0], it[0])} et ${qte(q1[1], it[1])} coûtent ${eur(M)} ; ${qte(q2[0], it[0])} et ${qte(q2[1], it[1])} coûtent ${eur(N)}. Combien coûte ${un(it[tg])} ?`;
    let expl = `Compare les deux achats : seul le nombre ${de(it[o].p)} change, donc la différence de prix vient d'eux seuls. ${eur(M)} − ${eur(N)} = ${eur(D)} pour ${qte(d, it[o])} de plus`
      + (d > 1 ? `, donc ${un(it[o])} coûte ${eur(D)} ÷ ${d} = ${eur(P[o])}` : ` : c'est le prix d'${un(it[o])}`)
      + `. Dans le second achat, ${qte(v, it[o])} ${v > 1 ? 'coûtent' : 'coûte'} ${eur(v * P[o])}, donc ${qte(s, it[sh])} ${s > 1 ? 'coûtent' : 'coûte'} ${eur(N)} − ${eur(v * P[o])} = ${eur(s * P[sh])}`
      + (s > 1 ? `, et ${un(it[sh])} coûte ${eur(P[sh])}` : '') + '.';
    expl += ` Vérification : ${q1[0]} × ${eur(P[0])} + ${q1[1]} × ${eur(P[1])} = ${eur(M)}.`;
    if (tg === sh) expl += ` Piège : ${eur(D)} vient des ${it[o].p}, pas des ${it[sh].p}.`;
    else if (d > 1) expl += ` Piège : ${eur(D)} est le prix de ${d} ${it[o].p}, pas d'${it[o].f ? 'une seule' : 'un seul'}.`;
    else expl += ` Piège : répondre le prix ${it[sh].f ? 'de la' : 'du'} ${it[sh].s}, ${eur(P[sh])}, au lieu de celui ${it[o].f ? 'de la' : 'du'} ${it[o].s}.`;
    return Q(q, P[tg], [P[1 - tg], D, P[0] + P[1], N - P[o]], eur, B.pas, expl);
  }
  return Q('Dans une boulangerie, 2 croissants et un café coûtent 4,60 € ; un croissant et un café coûtent 3,20 €. Combien coûte un café ?', 180, [140, 320, 160], eur, 10,
    'Compare les deux achats : seul le nombre de croissants change, donc la différence de prix vient d\'eux seuls. 4,60 € − 3,20 € = 1,40 € pour un croissant de plus : c\'est le prix d\'un croissant. Dans le second achat, un croissant coûte 1,40 €, donc un café coûte 3,20 € − 1,40 € = 1,80 €. Vérification : 2 × 1,40 € + 1 × 1,80 € = 4,60 €. Piège : 1,40 € vient des croissants, pas des cafés.');
}

/* 2d et 3a · Deux sortes d'objets : « tout dans la petite sorte », puis on répartit l'écart. */
const SORTES2 = [
  { a: 1, b: 2, t: (N, V) => `Une tirelire contient ${N} pièces, uniquement des pièces de 1 € et de 2 €, pour un total de ${V} €.`, A: 'pièces de 1 €', B: 'pièces de 2 €', unA: 'une pièce de 1 €', unB: 'une pièce de 2 €', u1: '€', up: '€', v: 'vaut' },
  { a: 5, b: 10, t: (N, V) => `Un portefeuille contient ${N} billets, uniquement des billets de 5 € et de 10 €, pour un total de ${V} €.`, A: 'billets de 5 €', B: 'billets de 10 €', unA: 'un billet de 5 €', unB: 'un billet de 10 €', u1: '€', up: '€', v: 'vaut' },
  { a: 10, b: 20, t: (N, V) => `Une caisse contient ${N} billets, uniquement des billets de 10 € et de 20 €, pour un total de ${V} €.`, A: 'billets de 10 €', B: 'billets de 20 €', unA: 'un billet de 10 €', unB: 'un billet de 20 €', u1: '€', up: '€', v: 'vaut' },
  { a: 2, b: 3, t: (N, V) => `Un contrôle comporte ${N} questions : certaines rapportent 2 points, les autres 3 points. Le total des points vaut ${V}.`, A: 'questions à 2 points', B: 'questions à 3 points', unA: 'une question à 2 points', unB: 'une question à 3 points', u1: 'point', up: 'points', v: 'rapporte' },
  { a: 4, b: 6, t: (N, V) => `Un restaurant a ${N} tables, de 4 places ou de 6 places, soit ${V} places en tout.`, A: 'tables de 4 places', B: 'tables de 6 places', unA: 'une table de 4 places', unB: 'une table de 6 places', u1: 'place', up: 'places', v: 'compte' },
  { a: 6, b: 9, t: (N, V) => `Un groupe de ${N} personnes va au cinéma. La place enfant coûte 6 € et la place adulte 9 €. Le groupe paie ${V} € en tout.`, A: 'enfants', B: 'adultes', unA: 'un enfant', unB: 'un adulte', u1: '€', up: '€', v: 'paie' }
];
const SORTES3 = [
  { a: 2, b: 4, t: (N, V) => `Dans une ferme, il n'y a que des poules et des vaches. On compte ${N} têtes et ${V} pattes.`, A: 'poules', B: 'vaches', unA: 'une poule', unB: 'une vache', u1: 'patte', up: 'pattes', v: 'a' },
  { a: 2, b: 4, t: (N, V) => `Sur un parking, il n'y a que des motos et des voitures : ${N} véhicules et ${V} roues en tout.`, A: 'motos', B: 'voitures', unA: 'une moto', unB: 'une voiture', u1: 'roue', up: 'roues', v: 'a' },
  { a: 3, b: 4, t: (N, V) => `Dans une salle, il n'y a que des tabourets à 3 pieds et des chaises à 4 pieds : ${N} sièges et ${V} pieds en tout.`, A: 'tabourets', B: 'chaises', unA: 'un tabouret', unB: 'une chaise', u1: 'pied', up: 'pieds', v: 'a' },
  { a: 2, b: 3, t: (N, V) => `Un loueur possède ${N} vélos et tricycles, qui ont ${V} roues en tout.`, A: 'vélos', B: 'tricycles', unA: 'un vélo', unB: 'un tricycle', u1: 'roue', up: 'roues', v: 'a' },
  { a: 6, b: 8, t: (N, V) => `Un terrarium abrite ${N} petites bêtes, des scarabées (6 pattes) et des araignées (8 pattes), soit ${V} pattes en tout.`, A: 'scarabées', B: 'araignées', unA: 'un scarabée', unB: 'une araignée', u1: 'patte', up: 'pattes', v: 'a', petit: true },
  { a: 2, b: 4, t: (N, V) => `Dans un enclos, il y a des canards et des moutons : ${N} têtes et ${V} pattes.`, A: 'canards', B: 'moutons', unA: 'un canard', unB: 'un mouton', u1: 'patte', up: 'pattes', v: 'a' }
];
function deuxSortes(R, liste_, nMin, nMax){
  const c = R.pick(liste_), N = R.int(c.petit ? Math.min(nMin, 10) : nMin, c.petit ? Math.min(nMax, 30) : nMax);
  const nB = R.int(2, N - 2), nA = N - nB, V = nA * c.a + nB * c.b, askB = R.int(0, 1) === 1;
  const uq = n => n + ' ' + (n === 1 ? c.u1 : c.up), d = V - N * c.a, diff = c.b - c.a;
  const q = c.t(N, V) + ` Combien y a-t-il ${de(askB ? c.B : c.A)} ?`;
  const expl = `Fais comme si tout était de la plus petite sorte, puis répartis la différence avec le vrai total. Avec ${N} ${c.A}, on aurait ${uq(N * c.a)} ; il manque ${uq(d)}. ${cap(c.unB)} ${c.v} ${uq(diff)} de plus qu'${c.unA} : il y a donc `
    + (diff > 1 ? `${d} ÷ ${diff} = ${nB}` : `${nB}`) + ` ${c.B} et ${nA} ${c.A}. Vérification : ${nB} × ${c.b} + ${nA} × ${c.a} = ${V}.`
    + (diff > 1 ? ` Piège : ${d} est ce qui manque, pas le nombre ${de(c.B)}.` : ` Piège : ne confonds pas le nombre ${de(c.B)} et celui ${de(c.A)}.`);
  return Q(q, askB ? nB : nA, askB ? [nA, d, V / c.b, N / 2] : [nB, d, N - d, N / 2], brut, 1, expl, v => v < V);
}
const s2d = R => deuxSortes(R, SORTES2, 6, 15);
const s3a = R => deuxSortes(R, SORTES3, 18, 50);

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels
   ===================================================== */

/* Trois valeurs et leurs sommes deux à deux : (0,1), (1,2), (0,2). Contexte commun à 3b et 4a. */
function trio(R, ctx){
  const bornes = [[5, 60], [35, 85], [2, 9], [3, 30]][ctx];
  let v;
  for (let t = 0; t < 100; t++){
    v = [R.int(bornes[0], bornes[1]), R.int(bornes[0], bornes[1]), R.int(bornes[0], bornes[1])];
    if (v[0] !== v[1] && v[1] !== v[2] && v[0] !== v[2]) break;
  }
  const nmo = noms(R, 3), nm = nmo.map(o => o.nom), fem = nmo.every(o => o.f);
  return { v, p: v[0] + v[1], q: v[1] + v[2], r: v[0] + v[2], nm, fem };
}
function enonceTrio(ctx, T, fin){
  const { p, q, r, nm } = T;
  if (ctx === 0) return `Trois nombres a, b et c vérifient a + b = ${p}, b + c = ${q} et a + c = ${r}. ${fin}`;
  if (ctx === 1) return `${nm[0]}, ${nm[1]} et ${nm[2]} se pèsent deux par deux : ${nm[0]} et ${nm[1]} pèsent ensemble ${p} kg, ${nm[1]} et ${nm[2]} ${q} kg, ${nm[0]} et ${nm[2]} ${r} kg. ${fin}`;
  if (ctx === 2) return `Dans un snack, un sandwich et une boisson coûtent ${p} €, une boisson et un dessert ${q} €, un sandwich et un dessert ${r} €. ${fin}`;
  return `${nm[0]} et ${nm[1]} ont ensemble ${p} ans, ${nm[1]} et ${nm[2]} ${q} ans, ${nm[0]} et ${nm[2]} ${r} ans. ${fin}`;
}
const FMT_TRIO = [brut, brut, euro, ans];
const ELEM_TRIO = ['nombre', 'personne', 'article', 'personne'];

/* 3b · Total à partir des sommes deux à deux. */
function s3b(R){
  const ctx = R.int(0, 3), T = trio(R, ctx), tot = T.v[0] + T.v[1] + T.v[2];
  const fin = ['Que vaut a + b + c ?', T.fem ? 'Combien pèsent-elles à elles trois, en kg ?' : 'Combien pèsent-ils à eux trois, en kg ?', 'Combien coûte le menu complet, avec un sandwich, une boisson et un dessert ?', 'Quelle est la somme de leurs trois âges ?'][ctx];
  const el = ELEM_TRIO[ctx];
  const expl = `Additionne les trois égalités : chaque ${el} y apparaît exactement deux fois. ${T.p} + ${T.q} + ${T.r} = ${2 * tot}, et ce total compte chaque ${el} deux fois, donc la somme des trois vaut ${2 * tot} ÷ 2 = ${tot}. Piège : s'arrêter à ${2 * tot}, ou diviser par 3 au lieu de 2.`;
  /* Une somme de trois âges peut dépasser 100 ans : format « ans » sans le plafond d'âge individuel. */
  const fmt = ctx === 3 ? (v => ans(v)) : FMT_TRIO[ctx];
  return Q(enonceTrio(ctx, T, fin), tot, [2 * tot, 2 * tot / 3, Math.max(T.p, T.q, T.r)], fmt, 1, expl);
}

/* 3c · Achats symétriques : on additionne (ou on soustrait) les deux achats. */
const SYM = [
  { lieu: 'Dans une papeterie', X: { s: 'classeur', p: 'classeurs' }, Y: { s: 'cahier', p: 'cahiers' }, mn: 1, mx: 9 },
  { lieu: 'Dans une boulangerie', X: { s: 'sandwich', p: 'sandwichs' }, Y: { s: 'part de tarte', p: 'parts de tarte', f: 1 }, mn: 2, mx: 7 },
  { lieu: 'Dans un magasin de sport', X: { s: 'ballon', p: 'ballons' }, Y: { s: 'raquette', p: 'raquettes', f: 1 }, mn: 4, mx: 18 },
  { lieu: 'À la fête foraine', X: { s: 'ticket de manège', p: 'tickets de manège' }, Y: { s: 'barbe à papa', p: 'barbes à papa', f: 1 }, mn: 2, mx: 7 },
  { lieu: 'Au marché', X: { s: 'melon', p: 'melons' }, Y: { s: 'ananas', p: 'ananas' }, mn: 1, mx: 6 }
];
function s3c(R){
  for (let t = 0; t < 300; t++){
    const c = R.pick(SYM), pq = R.pick([[3, 2], [4, 1], [5, 2], [4, 3], [5, 3], [3, 1], [5, 4], [2, 1]]), p = pq[0], q = pq[1];
    let X = c.X, Y = c.Y, x = R.int(c.mn, c.mx), y = R.int(c.mn, c.mx);
    if (x === y) continue;
    const somme = R.int(0, 2) > 0;
    if (!somme && x < y){ [X, Y] = [Y, X]; [x, y] = [y, x]; }
    const M = p * x + q * y, N = q * x + p * y;
    const debut = `${c.lieu}, ${qte(p, X)} et ${qte(q, Y)} coûtent ${M} € ; ${qte(q, X)} et ${qte(p, Y)} coûtent ${N} €. `;
    if (somme){
      const S = x + y;
      const expl = `Additionne les deux achats : tu obtiens autant ${de(X.p)} que ${de(Y.p)}. ${M} + ${N} = ${M + N} € pour ${p + q} ${X.p} et ${p + q} ${Y.p}, donc ${un(X)} et ${un(Y)} coûtent ensemble ${M + N} ÷ ${p + q} = ${S} €. Inutile de trouver chaque prix (${un(X)} coûte ${x} €, ${un(Y)} ${y} €). Piège : diviser ${M + N} par 2 au lieu de ${p + q}.`;
      return Q(debut + `Combien coûtent ${un(X)} et ${un(Y)} ensemble ?`, S, [(M + N) / 2, x, M - N, M + N], euro, 1, expl);
    }
    const D = x - y, k = p - q;
    const expl = `Soustrais les deux achats : les articles en commun s'éliminent. ${M} − ${N} = ${M - N} € correspond à ${qte(k, X)} de plus et ${qte(k, Y)} de moins`
      + (k > 1 ? `, donc ${un(X)} coûte ${M - N} ÷ ${k} = ${D} € de plus qu'${un(Y)}` : `, donc ${un(X)} coûte ${D} € de plus qu'${un(Y)}`)
      + `. Chaque prix : ${un(X)} coûte ${x} €, ${un(Y)} ${y} €.` + (k > 1 ? ` Piège : ${M - N} € est l'écart pour ${k} ${X.p}, pas pour ${X.f ? 'une seule' : 'un seul'}.` : ` Piège : additionner les achats donne la somme des prix, pas leur écart.`);
    return Q(debut + `Combien ${un(X)} coûte-t-${X.f ? 'elle' : 'il'} de plus qu'${un(Y)} ?`, D, [M - N, x + y, x, y], euro, 1, expl);
  }
  return Q('Dans une papeterie, 3 stylos et 2 cahiers coûtent 19 € ; 2 stylos et 3 cahiers coûtent 16 €. Combien coûtent un stylo et un cahier ensemble ?', 7, [17, 5, 3], euro, 1,
    'Additionne les deux achats : tu obtiens autant de stylos que de cahiers. 19 + 16 = 35 € pour 5 stylos et 5 cahiers, donc un stylo et un cahier coûtent ensemble 35 ÷ 5 = 7 €. Inutile de trouver chaque prix (un stylo coûte 5 €, un cahier 2 €). Piège : diviser 35 par 2 au lieu de 5.');
}

/* 3d · Somme des âges et rapport futur (ou passé). */
function s3d(R){
  let F = 10, M = 38, k = 3, n = 4, fut = true;
  for (let t = 0; t < 400; t++){
    const f = R.int(0, 1) === 1;
    if (f){
      const F0 = R.int(4, 20), n0 = R.int(2, 20), k0 = R.pick([2, 3]), M0 = k0 * (F0 + n0) - n0;
      if (M0 - F0 < 20 || M0 - F0 > 42) continue;
      F = F0; M = M0; k = k0; n = n0; fut = true; break;
    } else {
      const F0 = R.int(8, 25), n0 = R.int(2, F0 - 2), k0 = R.pick([3, 4, 5]), M0 = k0 * (F0 - n0) + n0;
      if (M0 - F0 < 20 || M0 - F0 > 42) continue;
      F = F0; M = M0; k = k0; n = n0; fut = false; break;
    }
  }
  const d = R.pick(DUOS), S = M + F, askE = R.int(0, 2) > 0, s = fut ? '+' : '−';
  const q = `Aujourd'hui, ${d.P} et ${d.E} ont ${S} ans ${d.eux}. ${fut ? 'Dans ' + n + ' ans, ' + d.le + ' aura' : 'Il y a ' + n + ' ans, ' + d.le + ' avait'} ${fois(k)} l'âge de ${d.E}. Quel âge a ${askE ? d.le_e : d.le} aujourd'hui ?`;
  const droite = fut ? S - (k - 1) * n : S + (k - 1) * n;
  const expl = `Pose x l'âge ${d.du_e} aujourd'hui, exprime l'âge de l'autre avec la somme, puis ${fut ? 'ajoute' : 'retire'} le même nombre d'années aux deux. Aujourd'hui : ${d.le_e} x, ${d.le} ${S} − x. ${fut ? 'Dans' : 'Il y a'} ${n} ans : x ${s} ${n} et ${S} − x ${s} ${n}. Équation : ${S} − x ${s} ${n} = ${k}(x ${s} ${n}), soit ${fut ? S + n : S - n} − x = ${k}x ${s} ${k * n}. `
    + `Donc ${k + 1}x = ${droite}, et x = ${F}. ${cap(d.le_e)} a ${F} ans et ${d.le} ${M} ans. Vérification : ${fut ? 'dans' : 'il y a'} ${n} ans, ${fut ? M + n : M - n} = ${k} × ${fut ? F + n : F - n}. Piège : ${fut ? 'ajouter' : 'retirer'} les ${n} ans à une seule des deux personnes.`;
  const faux = fut ? (S + n) / (k + 1) : (S - n) / (k + 1);
  const autres = askE ? [M, fut ? F + n : F - n, faux, S / (k + 1)] : [F, fut ? M + n : M - n, S - faux, S - S / (k + 1)];
  return Q(q, askE ? F : M, autres, ans, 1, expl);
}

/* 3e · « Dans combien d'années… » / « Il y a combien d'années… ». */
function s3e(R){
  let P = 42, C = 12, k = 2, cT = 30, tt = 18, fut = true;
  for (let t = 0; t < 400; t++){
    const f = R.int(0, 1) === 1, C0 = R.int(3, 16), G = R.int(20, 42), k0 = f ? R.pick([2, 3]) : R.pick([3, 4, 5]);
    if (G % (k0 - 1)) continue;
    const c0 = G / (k0 - 1);
    if (f){ if (c0 <= C0 || c0 - C0 > 40) continue; }
    else if (c0 >= C0 || c0 < 1) continue;
    P = C0 + G; C = C0; k = k0; cT = c0; tt = f ? c0 - C0 : C0 - c0; fut = f; break;
  }
  const d = R.pick(DUOS), G = P - C;
  const q = fut
    ? `${d.Pm} a ${P} ans et ${d.E} ${C} ans. Dans combien d'années ${d.le} aura-t-${d.il} ${fois(k)} l'âge de ${d.E} ?`
    : `${d.Pm} a ${P} ans et ${d.E} ${C} ans. Il y a combien d'années ${d.le} avait-${d.il} ${fois(k)} l'âge de ${d.E} ?`;
  const expl = `L'écart d'âge ne change jamais : cherche d'abord l'âge de l'enfant au moment voulu, puis compte les années. L'écart vaut ${P} − ${C} = ${G} ans. Quand ${d.le} a ${fois(k)} l'âge de l'enfant, l'écart vaut ${k === 2 ? 'exactement l\'âge de l\'enfant' : (k - 1) + ' fois l\'âge de l\'enfant'} : ${d.le_e} ${fut ? 'aura' : 'avait'} alors ${k === 2 ? G + ' ans' : G + ' ÷ ' + (k - 1) + ' = ' + cT + ' ans'} et ${d.le} ${cT + G} ans. `
    + (fut ? `C'est dans ${cT} − ${C} = ${ans(tt)}.` : `C'était il y a ${C} − ${cT} = ${ans(tt)}.`) + ` Piège : ${cT} ans est l'âge de l'enfant à ce moment, pas le nombre d'années cherché.`;
  /* âge de l'enfant à ce moment, oubli du vieillissement du parent, âge du parent à ce moment, écart */
  const autres = fut ? [cT, P / k - C, cT + G, P - k * C, G] : [cT, C - P / k, cT + G, k * C - P, G];
  return Q(q, tt, autres, ans, 1, expl);
}

/* =====================================================
   NIVEAU 4 · plus dur que les exemples officiels
   ===================================================== */

/* 4a · Un des trois nombres à partir des sommes deux à deux (nommées ou dans le désordre). */
function s4a(R){
  if (R.int(0, 2) === 0){
    let v = [5, 12, 20];
    for (let t = 0; t < 100; t++){
      v = [R.int(3, 60), R.int(3, 60), R.int(3, 60)].sort((a, b) => a - b);
      if (v[0] < v[1] && v[1] < v[2]) break;
    }
    if (!(v[0] < v[1] && v[1] < v[2])) v = [5, 12, 20];
    const sommes = R.shuffle([v[0] + v[1], v[0] + v[2], v[1] + v[2]]), tot = v[0] + v[1] + v[2], grand = R.int(0, 1) === 1;
    const mn = v[0] + v[1], mx = v[1] + v[2], rep = grand ? v[2] : v[0];
    const q = `On choisit trois nombres entiers différents. En les additionnant deux par deux, on obtient ${liste(sommes)}. Quel est le plus ${grand ? 'grand' : 'petit'} des trois nombres ?`;
    const expl = `Additionne les trois sommes pour obtenir le double du total, puis retire la somme qui ne contient pas le nombre cherché. ${liste(sommes).replace(' et ', ' + ').replace(/, /g, ' + ')} = ${2 * tot} = 2 × total, donc le total vaut ${tot}. `
      + (grand ? `Le plus grand nombre n'est pas dans la plus petite somme (${mn}) : il vaut ${tot} − ${mn} = ${v[2]}.` : `Le plus petit nombre n'est pas dans la plus grande somme (${mx}) : il vaut ${tot} − ${mx} = ${v[0]}.`)
      + ` Les trois nombres sont ${liste(v)}. Piège : répondre le total ${tot}, ou la moitié d'une somme.`;
    return Q(q, rep, [tot, grand ? v[0] : v[2], v[1], (grand ? mx : mn) / 2], brut, 1, expl);
  }
  const ctx = R.int(0, 3), T = trio(R, ctx), tot = T.v[0] + T.v[1] + T.v[2], i = R.int(0, 2);
  const nomsCtx = [['a', 'b', 'c'], T.nm, ['un sandwich', 'une boisson', 'un dessert'], T.nm][ctx];
  const fin = [`Que vaut ${nomsCtx[i]} ?`, `Combien pèse ${nomsCtx[i]}, en kg ?`, `Combien coûte ${nomsCtx[i]} ?`, `Quel âge a ${nomsCtx[i]} ?`][ctx];
  /* la paire qui ne contient pas i */
  const oppose = [T.q, T.r, T.p][i], lab = [[1, 2], [0, 2], [0, 1]][i];
  const u = ['', ' kg', ' €', ' ans'][ctx], l0 = nomsCtx[lab[0]], l1 = nomsCtx[lab[1]], li = nomsCtx[i], vi = T.v[i];
  const fin2 = [`Or ${l0} + ${l1} = ${oppose}, donc ${li} = ${tot} − ${oppose} = ${vi}.`,
    `Or ${l0} et ${l1} pèsent ensemble ${oppose} kg, donc ${li} pèse ${tot} − ${oppose} = ${vi} kg.`,
    `Or ${l0} et ${l1} coûtent ${oppose} €, donc ${li} coûte ${tot} − ${oppose} = ${vi} €.`,
    `Or ${l0} et ${l1} ont ensemble ${oppose} ans, donc ${li} a ${tot} − ${oppose} = ${vi} ans.`][ctx];
  const expl = `Additionne les trois égalités pour obtenir le double du total, puis retire la paire qui ne contient pas l'inconnue cherchée. ${T.p} + ${T.q} + ${T.r} = ${2 * tot}${u}, c'est le double du total, donc le total des trois vaut ${tot}${u}. ${fin2} Piège : répondre le total ${tot}, ou oublier de diviser ${2 * tot} par 2.`;
  const autres = [tot, T.v[(i + 1) % 3], T.v[(i + 2) % 3], 2 * T.v[i]];
  return Q(enonceTrio(ctx, T, fin), T.v[i], autres, FMT_TRIO[ctx], 1, expl);
}

/* 4b · Transferts entre deux groupes : x − p = y + p et x + q = k(y − q). */
function s4b(R){
  let X = 22, Y = 14, p = 4, q = 2, k = 2;
  for (let t = 0; t < 400; t++){
    const Y0 = R.int(6, 40), p0 = R.int(2, 8), X0 = Y0 + 2 * p0, k0 = R.pick([2, 3, 4]), q0 = (k0 * Y0 - X0) / (k0 + 1);
    if (!ent(q0) || q0 < 2 || q0 > Y0 - 1) continue;
    X = X0; Y = Y0; p = p0; q = q0; k = k0; break;
  }
  const kmot = k === 2 ? 'le double du' : k === 3 ? 'le triple du' : 'le quadruple du';
  const ctx = R.int(0, 2), ask = R.int(0, 2);   // 0 total, 1 premier, 2 second
  let q_, labX, labY;
  if (ctx === 0){
    const nm = noms(R, 2), a = nm[0].nom, b = nm[1].nom, ff = nm[0].f && nm[1].f;
    labX = 'le nombre de billes de ' + a; labY = 'celui de ' + b;
    q_ = `Si ${a} donne ${p} billes à ${b}, les deux en ont autant. Si au contraire ${b} donne ${q} billes à ${a}, ${a} a alors ${kmot} nombre de billes de ${b}. `
      + [`Combien de billes ont-${ff ? 'elles à elles' : 'ils à eux'} deux ?`, `Combien de billes possède ${a} ?`, `Combien de billes possède ${b} ?`][ask];
  } else if (ctx === 1){
    labX = 'le nombre d\'élèves du premier car'; labY = 'celui du second';
    q_ = `Deux cars emmènent des élèves en sortie. Si ${p} élèves passent du premier car au second, les deux cars ont autant d'élèves. Si au contraire ${q} élèves passent du second car au premier, le premier car a ${kmot} nombre d'élèves du second. `
      + ['Combien d\'élèves partent en sortie ?', 'Combien d\'élèves y a-t-il dans le premier car ?', 'Combien d\'élèves y a-t-il dans le second car ?'][ask];
  } else {
    labX = 'le nombre de livres de l\'étagère du haut'; labY = 'celui de l\'étagère du bas';
    q_ = `Une bibliothèque a deux étagères. Si on déplace ${p} livres de l'étagère du haut vers celle du bas, les deux étagères portent autant de livres. Si on déplace plutôt ${q} livres de celle du bas vers celle du haut, l'étagère du haut porte ${kmot} nombre de livres de celle du bas. `
      + ['Combien de livres y a-t-il sur les deux étagères ?', 'Combien de livres y a-t-il sur l\'étagère du haut ?', 'Combien de livres y a-t-il sur l\'étagère du bas ?'][ask];
  }
  const rhs = 2 * p + q + k * q;
  const expl = `Traduis chaque phrase par une équation, en retirant à l'un ce que tu ajoutes à l'autre. Avec x ${labX} et y ${labY} : x − ${p} = y + ${p}, donc x = y + ${2 * p} (l'écart vaut ${2 * p}, pas ${p}). Ensuite x + ${q} = ${k}(y − ${q}). En remplaçant x : y + ${2 * p + q} = ${k}y − ${k * q}, donc ${tx(k - 1, 'y')} = ${rhs}`
    + (k > 2 ? `, y = ${Y}` : '') + ` et x = ${X}. Vérification : ${X} − ${p} = ${Y} + ${p} = ${X - p}, et ${X + q} = ${k} × ${Y - q}.` + (ask === 0 ? ` En tout : ${X} + ${Y} = ${X + Y}.` : '') + ` Piège : écrire x = y + ${p}.`;
  const yf = (p + q + k * q) / (k - 1), xf = yf + p;
  const rep = [X + Y, X, Y][ask];
  const autres = [[X, Y, xf + yf, 2 * X], [Y, X + Y, xf, X - p], [X, X + Y, yf, Y + p]][ask];
  return Q(q_, rep, autres, brut, 1, expl);
}

/* 4c · Âge d'un parent (ou des deux) contre la somme des âges des enfants. */
function s4c(R){
  if (R.int(0, 2) > 0){
    for (let t = 0; t < 400; t++){
      const m = R.pick([2, 3, 3, 4]), P = R.int(30, 55), ages = [];
      for (let i = 0; i < m; i++) ages.push(R.int(1, P - 22));
      ages.sort((a, b) => a - b);
      if (ages.some((v, j) => j > 0 && v === ages[j - 1])) continue;
      const E = ages.reduce((s, v) => s + v, 0);
      if (E >= P) continue;
      const tt = (P - E) / (m - 1);
      if (!ent(tt) || tt < 2 || tt > 40) continue;
      const d = R.pick(DUOS);
      const q = `${d.Pm} a ${P} ans. Ses ${MOTS[m]} enfants ont ${liste(ages)} ans. Dans combien d'années l'âge ${d.le === 'le père' ? 'du père' : 'de la mère'} sera-t-il égal à la somme des âges de ses enfants ?`;
      const expl = `Chaque année, ${d.le} prend un an, mais la somme des âges des enfants augmente d'autant d'années qu'il y a d'enfants. Aujourd'hui, les enfants totalisent ${liste(ages).replace(' et ', ' + ').replace(/, /g, ' + ')} = ${E} ans, soit ${P - E} ans de moins que ${d.le}. `
        + (m === 2 ? `Avec deux enfants, cet écart diminue d'un an chaque année : il s'annule au bout de ${ans(tt)}.` : `Chaque année, cet écart diminue de ${m} − 1 = ${m - 1} ans : il s'annule au bout de ${P - E} ÷ ${m - 1} = ${ans(tt)}.`)
        + ` Vérification : dans ${ans(tt)}, ${d.le} aura ${P + tt} ans et les enfants ${E} + ${m} × ${tt} = ${E + m * tt} ans. `
        + (m === 2 ? 'Piège : diviser l\'écart par 2.' : `Piège : répondre ${P - E}, en oubliant que chaque enfant vieillit aussi.`);
      return Q(q, tt, [P - E, (P - E) / m, P + tt, (P - E) / (m + 1)], ans, 1, expl);
    }
  }
  for (let t = 0; t < 400; t++){
    const m = R.pick([3, 4]), Ps = R.int(60, 100), E = R.int(m * 3, Ps - 4), tt = (Ps - E) / (m - 2);
    /* réalisme : un enfant a en moyenne au moins 20 ans de moins qu'un parent */
    if (!ent(tt) || tt < 2 || tt > 30 || E > m * 25 || E > m * (Ps / 2 - 20)) continue;
    const q = `Dans une famille, la somme des âges des deux parents vaut ${Ps} ans et celle des âges de leurs ${MOTS[m]} enfants vaut ${E} ans. Dans combien d'années ces deux sommes seront-elles égales ?`;
    const expl = `Chaque année, la somme des parents augmente de deux ans, celle des enfants d'autant d'années qu'il y a d'enfants. L'écart actuel vaut ${Ps} − ${E} = ${Ps - E} ans, et il diminue chaque année de ${m} − 2 = ${m - 2} an${m - 2 > 1 ? 's' : ''} : `
      + (m === 3 ? `il s'annule au bout de ${ans(tt)}.` : `il s'annule au bout de ${Ps - E} ÷ 2 = ${ans(tt)}.`)
      + ` Vérification : dans ${ans(tt)}, ${Ps} + 2 × ${tt} = ${Ps + 2 * tt} et ${E} + ${m} × ${tt} = ${E + m * tt}. Piège : oublier que les deux parents vieillissent aussi, ce qui donne ${Ps - E} ÷ ${m - 1}.`;
    return Q(q, tt, [(Ps - E) / (m - 1), (Ps - E) / m, m === 4 ? Ps - E : (Ps - E) / 2, Ps + 2 * tt], ans, 1, expl);
  }
  return Q('Un père a 41 ans. Ses trois enfants ont 4, 7 et 12 ans. Dans combien d\'années l\'âge du père sera-t-il égal à la somme des âges de ses enfants ?', 9, [18, 6, 50], ans, 1,
    'Chaque année, le père prend un an, mais la somme des âges des enfants augmente d\'autant d\'années qu\'il y a d\'enfants. Aujourd\'hui, les enfants totalisent 4 + 7 + 12 = 23 ans, soit 18 ans de moins que le père. Chaque année, cet écart diminue de 3 − 1 = 2 ans : il s\'annule au bout de 18 ÷ 2 = 9 ans. Vérification : dans 9 ans, le père aura 50 ans et les enfants 23 + 3 × 9 = 50 ans. Piège : répondre 18, en oubliant que chaque enfant vieillit aussi.');
}

/* 4d · « Quand X avait l'âge qu'a Y… » : x, âge de Y, âge de X, y vont de d en d. */
function s4d(R){
  let B = 20, d = 6;
  for (let t = 0; t < 200; t++){
    const B0 = R.int(8, 40), d0 = R.int(3, 20);
    if (B0 - d0 < 2 || B0 + 3 * d0 > 90) continue;
    B = B0; d = d0; break;
  }
  const Aa = B + d, x = B - d, y = Aa + d, nm = noms(R, 2), X = nm[0].nom, Y = nm[1].nom, askX = R.int(0, 1) === 1;
  const q = `Quand ${X} avait l'âge qu'a ${Y} aujourd'hui, ${Y} avait ${x} ans. Quand ${Y} aura l'âge qu'a ${X} aujourd'hui, ${X} aura ${y} ans. Quel âge a ${askX ? X : Y} aujourd'hui ?`;
  const expl = `Appelle d l'écart d'âge, qui ne change jamais : le premier moment date d'il y a d ans, le second arrive dans d ans. Il y a d ans, ${Y} avait ${x} ans ; aujourd'hui ${Y} a ${x} + d ans, ${X} a ${x} + 2d ans, et dans d ans ${X} aura ${x} + 3d = ${y} ans. Donc 3d = ${y} − ${x} = ${y - x}, d = ${d}. `
    + `${X} a ${x} + ${2 * d} = ${Aa} ans et ${Y} a ${x} + ${d} = ${B} ans. Vérification : il y a ${d} ans, ${X} avait ${B} ans, l'âge actuel de ${Y}. Piège : faire la moyenne de ${x} et de ${y}.`;
  return Q(q, askX ? Aa : B, [(x + y) / 2, askX ? B : Aa, y - x, d], ans, 1, expl);
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif
   ===================================================== */

/* 5a · « J'ai k fois l'âge que tu avais quand j'avais l'âge que tu as. » x = k(2y − x) donne x : y = r1 : r2. */
const RAPPORTS = { 2: [4, 3], 3: [3, 2], 4: [8, 5], 5: [5, 3] };
function s5a(R){
  let k = 2, u = 7, cond = 0;
  for (let t = 0; t < 300; t++){
    const k0 = R.pick([2, 3, 4, 5]), r = RAPPORTS[k0], u0 = R.int(2, 20);
    if (r[0] * u0 < 16 || r[0] * u0 > 80 || r[1] * u0 < 8) continue;
    k = k0; u = u0; cond = R.int(0, 2); break;
  }
  const r = RAPPORTS[k], X = r[0] * u, Y = r[1] * u, d = X - Y, nm = noms(R, 2), a = nm[0].nom, b = nm[1].nom, askX = R.int(0, 1) === 1;
  let phrase, eq, coefU, valC, faux;
  if (cond === 0){
    valC = 3 * X - Y; coefU = 3 * r[0] - r[1];
    phrase = `Quand ${b} aura l'âge qu'a ${a} aujourd'hui, la somme de leurs deux âges sera ${valC} ans.`;
    eq = `Quand ${b} aura x ans, ${a} aura x + (x − y) = 2x − y ans : la somme vaut 3x − y = ${3 * r[0]}u − ${r[1]}u = ${coefU}u = ${valC}`;
    const yf = valC / (3 * k - 1); faux = askX ? k * yf : yf;
  } else if (cond === 1){
    valC = X + Y; coefU = r[0] + r[1];
    phrase = `Aujourd'hui, la somme de leurs âges vaut ${valC} ans.`;
    eq = `La somme vaut x + y = ${r[0]}u + ${r[1]}u = ${coefU}u = ${valC}`;
    faux = askX ? k * valC / (k + 1) : valC / (k + 1);
  } else {
    valC = d; coefU = r[0] - r[1];
    phrase = `${a} a ${d} ans de plus que ${b}.`;
    eq = `L'écart vaut x − y = ${r[0]}u − ${r[1]}u = ${coefU === 1 ? 'u' : coefU + 'u'} = ${d}`;
    faux = askX ? k * d / (k - 1) : d / (k - 1);
  }
  const q = `${a} dit à ${b} : « J'ai ${fois(k)} l'âge que tu avais quand j'avais l'âge que tu as aujourd'hui. » ${phrase} Quel âge a ${askX ? a : b} aujourd'hui ?`;
  const simpl = { 2: '3x = 4y', 3: '4x = 6y, soit 2x = 3y', 4: '5x = 8y', 5: '6x = 10y, soit 3x = 5y' }[k];
  const expl = `Appelle x l'âge de ${a} et y celui de ${b}, puis remonte dans le passé d'autant d'années que leur écart d'âge. ${a} avait l'âge actuel de ${b} il y a x − y ans, et ${b} avait alors y − (x − y) = 2y − x ans. La phrase de ${a} s'écrit x = ${k}(2y − x), soit ${simpl} : on peut écrire x = ${r[0]}u et y = ${r[1]}u. `
    + `${eq}, donc u = ${u}. ${a} a ${X} ans et ${b} ${Y} ans. Vérification : il y a ${d} ans, ${a} avait ${Y} ans et ${b} ${Y - d} ans, et ${k} × ${Y - d} = ${X}. Piège : traduire la phrase par x = ${k}y, ce qui oublie le retour dans le passé.`;
  const autres = [askX ? Y : X, faux, cond === 1 ? valC / 2 : d, askX ? X + d : Y - d];
  return Q(q, askX ? X : Y, autres, ans, 1, expl);
}

/* 5b · Un enfant qui n'était pas encore né : la somme a augmenté moins que prévu. */
function s5b(R){
  for (let t = 0; t < 400; t++){
    const cinq = R.int(0, 2) === 0, n = R.int(3, 12), c = R.int(1, n - 1);
    if (n === 2 * c) continue;   /* sinon le manque n − c serait égal à la réponse */
    const grands = cinq ? [R.int(n + 1, 20), R.int(n + 1, 20)] : [R.int(n + 1, 20)];
    if (cinq && grands[0] === grands[1]) continue;
    grands.sort((a, b) => b - a);
    const p1 = R.int(grands[0] + 20, 55), p2 = R.int(grands[0] + 20, 55);
    const membres = cinq ? 5 : 4, Sg = grands.reduce((s, v) => s + v, 0);
    const S1 = p1 + p2 + Sg - (membres - 1) * n, S2 = p1 + p2 + Sg + c;
    const nm = noms(R, membres - 1), cadet = nm[nm.length - 1], fam = R.pick(FAMILLES);
    const ne = cadet.f ? 'née' : 'né';
    const presente = cinq
      ? `les deux parents, ${nm[0].nom} (${grands[0]} ans), ${nm[1].nom} (${grands[1]} ans) et ${cadet.f ? 'la petite dernière' : 'le petit dernier'}, ${cadet.nom}`
      : `les deux parents, ${nm[0].nom}, qui a ${grands[0]} ans, et ${cadet.f ? 'sa petite sœur' : 'son petit frère'} ${cadet.nom}`;
    const q = `Il y a ${n} ans, la somme des âges des membres de la famille ${fam} valait ${S1} ans. Aujourd'hui, la famille compte ${MOTS[membres]} personnes : ${presente}. La somme de leurs ${MOTS[membres]} âges vaut ${S2} ans. Quel âge a ${cadet.nom} ?`;
    const hausse = S2 - S1, autresM = membres - 1;
    const expl = `Compare la hausse réelle de la somme avec celle qu'on aurait si tout le monde était déjà né. Si les ${MOTS[membres]} membres avaient tous vieilli de ${n} ans, la somme aurait augmenté de ${membres} × ${n} = ${membres * n} ans. Elle n'a augmenté que de ${S2} − ${S1} = ${hausse} ans : ${cadet.nom} n'était donc pas ${ne} il y a ${n} ans. `
      + `Les ${MOTS[autresM]} autres ont pris ${n} ans chacun, soit ${autresM * n} ans ; le reste, ${hausse} − ${autresM * n} = ${c}, est l'âge de ${cadet.nom}. Piège : l'âge ${cinq ? 'des aînés' : 'de ' + nm[0].nom} ne sert qu'à savoir qu'${cinq ? 'ils étaient' : (nm[0].f ? 'elle était' : 'il était')} déjà ${cinq ? 'nés' : (nm[0].f ? 'née' : 'né')} ; et ${membres * n} − ${hausse} = ${ans(n - c)} est le manque par rapport à la hausse prévue, pas l'âge de ${cadet.nom}.`;
    return Q(q, c, [n - c, hausse - 2 * n, hausse / membres, n], ans, 1, expl, v => v < grands[grands.length - 1] || v <= c + 3);
  }
  return Q('Il y a 6 ans, la somme des âges des membres de la famille Martin valait 70 ans. Aujourd\'hui, la famille compte quatre personnes : les deux parents, Léo, qui a 11 ans, et sa petite sœur Jade. La somme de leurs quatre âges vaut 92 ans. Quel âge a Jade ?', 4, [2, 10, 6], ans, 1,
    'Compare la hausse réelle de la somme avec celle qu\'on aurait si tout le monde était déjà né. Si les quatre membres avaient tous vieilli de 6 ans, la somme aurait augmenté de 4 × 6 = 24 ans. Elle n\'a augmenté que de 92 − 70 = 22 ans : Jade n\'était donc pas née il y a 6 ans. Les trois autres ont pris 6 ans chacun, soit 18 ans ; le reste, 22 − 18 = 4, est l\'âge de Jade. Piège : l\'âge de Léo ne sert qu\'à savoir qu\'il était déjà né ; et 24 − 22 = 2 ans est le manque par rapport à la hausse prévue, pas l\'âge de Jade.');
}

/* 5c · Un parent et ses enfants, deux conditions. Dans n ans, l'âge du parent vaudra j fois (j = 1 ou 2)
   la somme des âges des enfants, et chacun des m enfants aura vieilli de n ans. */
function s5c(R){
  const d = R.pick(DUOS.filter(o => o.E === 'son fils')), duPar = d.le === 'le père' ? 'du père' : 'de la mère';
  const futur = (j, n) => `Dans ${n} ans, ` + (j === 1 ? `l'âge ${duPar} sera égal à la somme des âges de ses enfants.` : `${d.le} aura ${fois(j)} la somme des âges de ses enfants.`);
  const egalite = (L, j, mn) => j === 1 ? `${L} = x + ${mn}` : `${L} = ${j}(x + ${mn}), soit ${L} = ${j}x + ${j * mn}`;
  if (R.int(0, 1) === 1){
    for (let t = 0; t < 400; t++){
      const j = R.pick([1, 2, 2]), k = R.pick(j === 1 ? [2, 3, 4] : [3, 4, 5]), m = R.pick([2, 3]), n = R.int(2, 40);
      const E = (j * m - 1) * n / (k - j), M = k * E;
      if (!ent(E) || E < 2 * m || M < 26 || M > 55 || M - E / m < 20) continue;
      const q = `${d.Pm} a aujourd'hui ${fois(k)} la somme des âges de ses ${MOTS[m]} enfants. ${futur(j, n)} Quel âge a ${d.le} aujourd'hui ?`;
      const expl = `Pose x la somme des âges des enfants aujourd'hui : chaque année, elle augmente d'autant d'années qu'il y a d'enfants, alors que l'âge ${duPar} n'augmente que d'un an. Aujourd'hui : enfants x, ${d.le} ${k}x. Dans ${n} ans : ${d.le} ${k}x + ${n}, enfants x + ${m} × ${n} = x + ${m * n}. `
        + `Équation : ${egalite(k + 'x + ' + n, j, m * n)}. Donc ${tx(k - j, 'x')} = ${j * m * n} − ${n} = ${(j * m - 1) * n}` + (k - j > 1 ? `, x = ${E}` : '') + `, et ${d.le} a ${k} × ${E} = ${M} ans. `
        + `Vérification : dans ${n} ans, ${d.le} aura ${M + n} ans et les enfants ${E} + ${m * n} = ${E + m * n} ans` + (j === 1 ? '.' : `, et ${j} × ${E + m * n} = ${M + n}.`)
        + ` Piège : ajouter seulement ${n} ans à la somme des enfants, alors que chacun des ${MOTS[m]} vieillit de ${n} ans.`;
      const x1 = (j - 1) * n / (k - j);   /* enfants : n ans de plus en tout */
      const x2 = j * m * n / (k - j);     /* parent qui ne vieillit pas */
      return Q(q, M, [E, M + n, k * x1, k * x2, M - n], ans, 1, expl, v => v === E || v >= 20);
    }
  }
  for (let t = 0; t < 400; t++){
    const j = R.pick([1, 2, 2]), m = R.pick([2, 3, 4]), n = R.int(2, 20), E = R.int(2 * m, 40), M = j * (E + m * n) - n;
    if (M < 28 || M > 55 || M - E / m < 20) continue;
    const T = M + E, askM = R.int(0, 2) > 0;
    const q = `${d.Pm} et ses ${MOTS[m]} enfants ont, à eux ${MOTS[m + 1]}, ${T} ans. ${futur(j, n)} ` + (askM ? `Quel âge a ${d.le} aujourd'hui ?` : 'Quelle est aujourd\'hui la somme des âges des enfants ?');
    const expl = `Pose x la somme des âges des enfants aujourd'hui : ${d.le} a le reste du total, et chacun des enfants vieillira aussi. Aujourd'hui : enfants x, ${d.le} ${T} − x. Dans ${n} ans : ${d.le} ${T} − x + ${n} = ${T + n} − x, enfants x + ${m} × ${n} = x + ${m * n}. `
      + `Équation : ${egalite((T + n) + ' − x', j, m * n)}. Donc ${j + 1}x = ${T + n} − ${j * m * n} = ${T + n - j * m * n}, et x = ${E}. Les enfants totalisent ${E} ans et ${d.le} a ${T} − ${E} = ${M} ans. `
      + `Vérification : dans ${n} ans, ${d.le} aura ${M + n} ans et les enfants ${E} + ${m * n} = ${E + m * n} ans` + (j === 1 ? '.' : `, et ${j} × ${E + m * n} = ${M + n}.`)
      + ` Piège : n'ajouter que ${n} ans en tout aux enfants, alors que chacun des ${MOTS[m]} vieillit de ${n} ans.`;
    const Ef = (T + n - j * n) / (j + 1);   /* enfants : n ans de plus en tout */
    const Eg = (T - j * m * n) / (j + 1);   /* parent qui ne vieillit pas */
    const autres = askM ? [E, T - Ef, T - Eg, M + n, T / 2] : [M, Ef, Eg, E + m * n];
    return Q(q, askM ? M : E, autres, ans, 1, expl, askM ? (v => v === E || v >= 20) : null);
  }
  return Q('Un père et ses trois enfants ont, à eux quatre, 66 ans. Dans 9 ans, l\'âge du père sera égal à la somme des âges de ses enfants. Quel âge a le père aujourd\'hui ?', 42, [24, 33, 47], ans, 1,
    'Pose x la somme des âges des enfants aujourd\'hui : le père a le reste du total, et chacun des enfants vieillira aussi. Aujourd\'hui : enfants x, le père 66 − x. Dans 9 ans : le père 66 − x + 9 = 75 − x, enfants x + 3 × 9 = x + 27. Équation : 75 − x = x + 27. Donc 2x = 75 − 27 = 48, et x = 24. Les enfants totalisent 24 ans et le père a 66 − 24 = 42 ans. Vérification : dans 9 ans, le père aura 51 ans et les enfants 24 + 27 = 51 ans. Piège : n\'ajouter que 9 ans en tout aux enfants, alors que chacun des trois vieillit de 9 ans.');
}

/* 5d · Quatre nombres additionnés trois par trois. */
function s5d(R){
  const ctx = R.int(0, 2), bornes = [[2, 40], [1, 30], [3, 40]][ctx];
  let v = [3, 7, 9, 14];
  for (let t = 0; t < 200; t++){
    const w = [R.int(bornes[0], bornes[1]), R.int(bornes[0], bornes[1]), R.int(bornes[0], bornes[1]), R.int(bornes[0], bornes[1])].sort((a, b) => a - b);
    if (w[0] < w[1] && w[1] < w[2] && w[2] < w[3]) { v = w; break; }
  }
  const tot = v[0] + v[1] + v[2] + v[3], sommes = R.shuffle(v.map(x => tot - x)), grand = R.int(0, 1) === 1;
  const mn = tot - v[3], mx = tot - v[0], rep = grand ? v[3] : v[0];
  let q;
  if (ctx === 0) q = `On choisit quatre nombres entiers différents. En les additionnant trois par trois, de toutes les façons possibles, on obtient ${liste(sommes)}. Quel est le plus ${grand ? 'grand' : 'petit'} des quatre nombres ?`;
  else if (ctx === 1) q = `On pèse quatre colis par groupes de trois, de toutes les façons possibles. La balance affiche ${liste(sommes)} kg. Combien pèse le colis le plus ${grand ? 'lourd' : 'léger'}, en kg ?`;
  else q = `Quatre cousins ont des âges différents. En additionnant les âges de trois d'entre eux, de toutes les façons possibles, on trouve ${liste(sommes)} ans. Quel âge a le plus ${grand ? 'âgé' : 'jeune'} ?`;
  const expl = `Additionne les quatre sommes : chaque nombre y apparaît exactement trois fois. ${liste(sommes).replace(' et ', ' + ').replace(/, /g, ' + ')} = ${3 * tot} = 3 × total, donc le total des quatre vaut ${tot}. `
    + (grand ? `La plus petite somme (${mn}) est celle qui ne contient pas le plus grand : il vaut ${tot} − ${mn} = ${v[3]}.` : `La plus grande somme (${mx}) est celle qui ne contient pas le plus petit : il vaut ${tot} − ${mx} = ${v[0]}.`)
    + ` Les quatre valeurs sont ${liste(v)}. Piège : répondre le total ${tot}, ou retirer la mauvaise somme.`;
  return Q(q, rep, [tot, grand ? v[0] : v[3], (grand ? mx : mn) / 3, tot / 4], ctx === 2 ? ans : brut, 1, expl);
}

const TYPES = {
  1: [s1a, s1b, s1c, s1d],
  2: [s2a, s2b, s2c, s2d],
  3: [s3a, s3b, s3c, s3d, s3e],
  4: [s4a, s4b, s4c, s4d],
  5: [s5a, s5b, s5c, s5d]
};
const SECOURS = () => Q('Le triple d\'un nombre, augmenté de 7, vaut 31. Quel est ce nombre ?', 8, [24, 12, 3], brut, 1,
  'Traduis l\'énoncé par une équation, puis défais les opérations dans l\'ordre inverse. Avec x le nombre cherché : 3x + 7 = 31. On retire 7 des deux côtés : 3x = 24. On divise par 3 : x = 8. Vérification : 3 × 8 + 7 = 31. Piège : s\'arrêter à 24, qui vaut 3x et pas x.');

/* =====================================================
   alb-20 · la compétence
   ===================================================== */
A.push({
  id: 'alb-20-mise-en-equation',
  phase: 'albert',
  ordre: 20,
  theme: 'algebre',
  titre: 'Mise en équation, systèmes 2×2, problèmes d\'âges',
  objectif: 'Traduire un petit problème (âges, achats, pièces, pattes) en une ou deux équations, puis le résoudre sans calculatrice en moins de trois minutes.',
  lecon:
`<p class="lede">Ici, l'énoncé raconte une petite histoire (des âges, des achats, des pattes d'animaux) et tu dois retrouver un nombre caché. La clé : <mark>traduire chaque phrase en une égalité</mark>, puis résoudre. Aucune formule à apprendre par cœur, seulement une méthode.</p>
<h2>Ce que le test te demande</h2>
<p>Le test d'Albert School pose des problèmes courts : un nombre mystère, l'âge d'un parent et de son enfant, des pièces dans une tirelire, des poules et des vaches, trois amis qui se pèsent deux par deux. Les questions faciles tiennent en une seule équation. Les plus difficiles demandent deux équations (un système 2×2) ou une astuce, comme additionner toutes les égalités d'un coup. Tu as 4 choix, pas de calculatrice et environ 2 à 3 minutes par question.</p>
<h2>Les prérequis, en bref</h2>
<p><strong>Une équation</strong> est une égalité avec une inconnue x. On la résout en faisant la même opération des deux côtés. Un terme qui change de côté change de signe : 3x + 7 = 31 devient 3x = 31 − 7 = 24, puis x = 24 ÷ 3 = 8.</p>
<p><strong>Un système 2×2</strong>, ce sont deux équations avec deux inconnues x et y. Deux façons de le résoudre :</p>
<ul>
<li><strong>Substitution :</strong> si y = 2x + 1, on remplace y par 2x + 1 dans l'autre équation, et il ne reste que x.</li>
<li><strong>Combinaison :</strong> si les deux équations ont le même terme en y, on les soustrait. Avec 3x + y = 17 et x + y = 9, on obtient 2x = 8, donc x = 4, puis y = 5.</li>
</ul>
<h2>La méthode en 4 étapes</h2>
<div class="etapes">
<p><strong>1. Je choisis l'inconnue :</strong> j'écris en toutes lettres « x = l'âge du fils aujourd'hui ».</p>
<p><strong>2. Je traduis phrase par phrase :</strong> « le triple de » donne 3x, « de plus que » donne une différence, « dans 12 ans » ajoute 12 à chaque personne.</p>
<p><strong>3. Je résous :</strong> une équation, ou un système par substitution ou par combinaison.</p>
<p><strong>4. Je vérifie dans l'énoncé :</strong> je remets ma réponse dans chaque phrase. En QCM, je peux aussi tester les 4 choix.</p>
</div>
<h2>Pour les âges : le tableau</h2>
<table class="tbl">
<thead><tr><th></th><th>Il y a 5 ans</th><th>Aujourd'hui</th><th>Dans 18 ans</th></tr></thead>
<tbody><tr><th>Fille</th><td>x − 5</td><td>x</td><td>x + 18</td></tr>
<tr><th>Père</th><td>4x − 5</td><td>4x</td><td>4x + 18</td></tr></tbody>
</table>
<p>Tout le monde vieillit du même nombre d'années : <mark>l'écart d'âge ne change jamais</mark>, mais le rapport (le double, le triple) change avec le temps.</p>
<h2>Exemples résolus</h2>
<h3>1. Le nombre mystère</h3>
<p>« Le quadruple d'un nombre, diminué de 6, vaut 30. » On écrit 4x − 6 = 30. On ajoute 6 : 4x = 36. On divise par 4 : x = 9. Vérification : 4 × 9 − 6 = 30.</p>
<h3>2. Le père et sa fille</h3>
<p>« Un père a 4 fois l'âge de sa fille. Dans 18 ans, il aura le double de son âge. » Fille : x, père : 4x. Dans 18 ans : x + 18 et 4x + 18. Donc 4x + 18 = 2(x + 18) = 2x + 36, d'où 2x = 18 et x = 9. La fille a 9 ans, le père 36 ans. Vérification : dans 18 ans, 54 = 2 × 27.</p>
<h3>3. Têtes et pattes</h3>
<p>« Une ferme compte 26 têtes et 70 pattes, seulement des poules et des vaches. Combien de vaches ? » Fais comme s'il n'y avait que des poules : 26 poules auraient 52 pattes. Il manque 70 − 52 = 18 pattes. Chaque vache a 2 pattes de plus qu'une poule : 18 ÷ 2 = 9 vaches, donc 17 poules. Vérification : 9 × 4 + 17 × 2 = 36 + 34 = 70.</p>
<h3>4. Les sommes deux à deux</h3>
<p>« a + b = 15, b + c = 22 et a + c = 19. Que vaut a + b + c ? » Inutile de résoudre le système en entier : additionne les trois égalités. Chaque lettre apparaît deux fois, donc 2(a + b + c) = 15 + 22 + 19 = 56, et a + b + c = 28. Si on te demande c : c = 28 − (a + b) = 28 − 15 = 13.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl">
<thead><tr><th>Situation</th><th>Réflexe</th></tr></thead>
<tbody>
<tr><td>Somme S et écart D</td><td>petit = (S − D) ÷ 2, grand = petit + D</td></tr>
<tr><td>Entiers consécutifs</td><td>x, x + 1, x + 2 : le nombre du milieu vaut somme ÷ 3</td></tr>
<tr><td>Deux sortes d'objets</td><td>tout mettre dans la petite sorte, puis répartir ce qui manque</td></tr>
<tr><td>Égalités qui se ressemblent</td><td>tout additionner (ou soustraire), puis diviser</td></tr>
<tr><td>Âges</td><td>tableau avant / aujourd'hui / après ; l'écart est constant</td></tr>
<tr><td>Plusieurs enfants</td><td>en 1 an, 3 enfants prennent 3 ans à eux trois, le parent 1 an</td></tr>
<tr><td>QCM bloqué</td><td>tester chaque choix dans l'énoncé</td></tr>
</tbody>
</table>
<div class="box astuce"><p class="box-t">Astuce</p><p>Nomme l'inconnue en toutes lettres, traduis chaque phrase par une égalité, résous, puis vérifie ta réponse dans l'énoncé.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Dans 10 ans, tout le monde a 10 ans de plus, pas seulement le père, et trois enfants prennent 30 ans à eux trois. Un rapport d'âges change avec le temps, l'écart non. Si Tom donne 3 billes à Léa pour qu'ils en aient autant, l'écart de départ est 6, pas 3. Un terme qui change de côté change de signe. Enfin, si une somme d'âges a moins augmenté que prévu, quelqu'un n'était pas encore né.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Une inconnue bien nommée, une égalité par phrase, la même opération des deux côtés. Pour un système : substitution ou combinaison. Quand les égalités se ressemblent, additionne-les toutes.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(TYPES[n])(R);
      if (ex && typeof ex.q === 'string' && Array.isArray(ex.choix) && ex.choix.length === 4) return ex;
    } catch(e){ /* repli ci-dessous */ }
    return SECOURS();
  }
});

})();
