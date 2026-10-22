/* ===== Maths · Objectif Albert School : alb-18 · Puissances et exposants : ramener à la même base =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS.
   gen(level, R) : niveaux 1 à 5 (bornés), n'utilise que R.int, R.pick, R.shuffle, ne lève jamais d'exception.
   Toutes les réponses sont CALCULÉES à partir des nombres tirés ; les choix « puissance » sont dédoublonnés
   par valeur exacte (décomposition en facteurs premiers), jamais deux choix égaux comme 4⁷ et 2¹⁴.
   Sous-types :
   N1 produit de même base, quotient de même base, puissance de puissance, reconnaître 8 × 16 = 2ⁿ,
      résoudre 3ⁿ = 81 ;
   N2 changer de base (8⁴ = 2ⁿ), somme de b termes égaux à bᵉ, coefficient égal à la base (2 × 4⁵),
      moitié, double, tiers… d'une puissance, produit ou quotient de deux bases d'une même famille ;
   N3 somme de termes égaux avec changement de base, facteur commun (quotient ou k × bᵐ), équation
      4ⁿ = 8⁶ (avec décalage n + s), racine carrée d'une puissance, chiffres ou zéros de 2ᵃ × 5ᵇ,
      comparer quatre puissances (bases ≤ 32), coefficient puissance (4 × 16¹⁵), moitié de 4²⁰ en base 2 ;
   N4 coefficients additionnés (3 × 9⁵ + 6 × 9⁵), produit d'inconnues (2ⁿ × 4ⁿ × 8ⁿ), substitution
      (2ˣ = 5, donc 4ˣ⁺¹), chiffres ou zéros de 4ᵃ × 125ᵇ, quotient de deux sommes, décomposition
      2ᵃ × 3ᵇ, comparer ou ranger (bases jusqu'à 256), nombre de termes égaux pour atteindre une puissance ;
   N5 comparer avec 2¹⁰ = 1 024 contre 10³ = 1 000, deux inconnues (2ᵃ = 3, 2ᵇ = 5), équation avec somme
      (termes égaux ou géométrique), encadrement 2ⁿ < 10ᵏ et chiffres de 2¹⁰ᵐ, quotient à trois termes,
      chiffres ou somme des chiffres d'un produit de trois facteurs. */
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
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));
const n0 = v => nb(v, 0);
const pw = Math.pow;
const ent = v => typeof v === 'number' && isFinite(v) && Math.abs(v - Math.round(v)) < 1e-9;
const somme = l => l.reduce((s, v) => s + v, 0);
const sChiffres = v => String(Math.round(v)).split('').reduce((s, d) => s + Number(d), 0);
const longueur = v => String(Math.round(v)).length;

/* Exposants en exposant Unicode : sup('n+1') → ⁿ⁺¹, sup(12) → ¹². */
const SUPC = {'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', 'n': 'ⁿ', 'x': 'ˣ', 'a': 'ᵃ', 'b': 'ᵇ'};
const sup = s => String(s).split('').map(ch => SUPC[ch] || ch).join('');
/* bᵉ : P(2, 10) → 2¹⁰ ; P(4, 'n+1') → 4ⁿ⁺¹. */
const P = (b, e) => n0(b) + sup(e);

/* QCM : la bonne réponse, les distracteurs pédagogiques, puis des voisins jusqu'à 4 choix distincts. */
function qcm(bonne, autres, voisin){
  const vus = new Set([norm(bonne)]), ch = [bonne];
  const ajouter = c => { if (ch.length < 4 && c != null && c !== '' && !vus.has(norm(c))){ vus.add(norm(c)); ch.push(String(c)); } };
  autres.forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 120; k++) ajouter(voisin(k));
  return ch;
}
/* Réponse entière : distracteurs entiers ≥ min (1 par défaut), voisins de pas « pas ». */
function Qn(q, bonne, autres, expl, min, pas){
  const lo = min == null ? 1 : min, st = pas || 1;
  const ok = v => typeof v === 'number' && ent(v) && v >= lo && v !== bonne;
  const ch = qcm(n0(bonne), autres.filter(ok).map(n0), k => {
    const v = bonne + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * st;
    return ok(v) ? n0(v) : null;
  });
  return { q, a: n0(bonne), accept: null, choix: ch, expl };
}
/* Valeur exacte de c × bᵉ sous forme de clé « premier:exposant » : sert à écarter deux choix égaux (4⁷ et 2¹⁴). */
function facteurs(n){
  const f = {}; let m = Math.round(n);
  for (let p = 2; p <= 13 && m > 1; p++) while (m % p === 0){ f[p] = (f[p] || 0) + 1; m = m / p; }
  if (m > 1) f[m] = (f[m] || 0) + 1;
  return f;
}
function cle(c, b, e){
  const f = {}, add = (g, k) => Object.keys(g).forEach(p => { f[p] = (f[p] || 0) + g[p] * k; });
  add(facteurs(c), 1); add(facteurs(b), e);
  return Object.keys(f).filter(p => f[p]).sort((x, y) => x - y).map(p => p + ':' + f[p]).join(',') || '1';
}
/* Réponse « puissance » : bonne et autres sont des [b, e] ; jamais deux choix de même valeur, exposants ≥ 2. */
function Qp(q, bonne, autres, expl, voisin){
  const vus = new Set(), ch = [];
  const essai = x => {
    if (!x || ch.length >= 4) return;
    const b = x[0], e = x[1];
    if (!(b >= 1) || !ent(b) || !(e >= 2) || !ent(e) || e > 999) return;
    const k = cle(1, b, e), t = P(b, e);
    if (vus.has(k) || ch.some(c => norm(c) === norm(t))) return;
    vus.add(k); ch.push(t);
  };
  essai(bonne); autres.forEach(essai);
  for (let k = 1; ch.length < 4 && k < 80; k++) essai(voisin(k));
  return { q, a: ch[0], accept: null, choix: ch, expl };
}
const voisinsP = (b, e) => k => [b, e + (k % 2 ? 1 : -1) * Math.ceil(k / 2)];

/* Bases b = cⁱ : [b, c, i]. */
const BASES = [[4, 2, 2], [8, 2, 3], [16, 2, 4], [32, 2, 5], [9, 3, 2], [27, 3, 3], [81, 3, 4], [25, 5, 2], [125, 5, 3]];
const FAM = { 2: [[2, 1], [4, 2], [8, 3], [16, 4]], 3: [[3, 1], [9, 2], [27, 3]], 5: [[5, 1], [25, 2], [125, 3]] };
/* « 8⁵ = (2³)⁵ = 2¹⁵ » ou « 2⁷ est déjà une puissance de 2 ». */
const conv = (b, i, c, e) => i === 1 ? P(b, e) + ' est déjà une puissance de ' + c : P(b, e) + ' = (' + P(c, i) + ')' + sup(e) + ' = ' + P(c, i * e);

/* ===================== NIVEAU 1 : découverte ===================== */
function n1Produit(R){
  const b = R.pick([2, 3, 5, 7, 10]);
  let m = R.int(2, 9), k = R.int(2, 9);
  if (m === 2 && k === 2) k = R.int(3, 9);
  const s = m + k;
  const methode = 'Pour multiplier deux puissances de même base, on garde la base et on additionne les exposants.';
  const corps = P(b, m) + ' × ' + P(b, k) + ' = ' + P(b, m + '+' + k) + ' = ' + P(b, s) + ' : il y a ' + m + ' + ' + k + ' = ' + s + ' facteurs ' + b + ' en tout.';
  if (R.int(0, 1)){
    return Qp('Écris ' + P(b, m) + ' × ' + P(b, k) + ' sous la forme d\'une seule puissance.', [b, s],
      [[b, m * k], [b * b, s], [b * b, m * k]],
      methode + ' ' + corps + ' Piège : multiplier les exposants donne ' + P(b, m * k) + ', et multiplier les bases donne ' + P(b * b, s) + ' ; la base ne change pas.',
      voisinsP(b, s));
  }
  return Qn(P(b, m) + ' × ' + P(b, k) + ' = ' + b + 'ⁿ. Que vaut n ?', s, [m * k, s + 1, s - 1],
    methode + ' ' + corps + ' Donc n = ' + s + '. Piège : multiplier les exposants donne ' + (m * k) + ' ; on ne multiplie les exposants que pour une puissance de puissance.');
}
function n1Quotient(R){
  const b = R.pick([2, 3, 5, 7, 10]), k = R.int(2, 6);
  const m = R.int(0, 1) ? k * R.int(2, 4) : k + R.int(2, 8), d = m - k;
  const div = m % k === 0 && m / k !== d ? m / k : null;
  const methode = 'Pour diviser deux puissances de même base, on garde la base et on soustrait les exposants.';
  const corps = P(b, m) + ' ÷ ' + P(b, k) + ' = ' + P(b, m + '-' + k) + ' = ' + P(b, d) + ' : on retire ' + k + ' facteurs ' + b + ' aux ' + m + ' du départ.';
  if (R.int(0, 1)){
    return Qp('Écris ' + P(b, m) + ' ÷ ' + P(b, k) + ' sous la forme d\'une seule puissance.', [b, d],
      [div ? [b, div] : null, [1, d], [b, m + k]],
      methode + ' ' + corps + ' Piège : ' + (div ? 'diviser les exposants donne ' + P(b, div) + ', et ' : '') + 'diviser les bases donne ' + P(1, d) + ' = 1 ; la base ne change pas.',
      voisinsP(b, d));
  }
  return Qn(P(b, m) + ' ÷ ' + P(b, k) + ' = ' + b + 'ⁿ. Que vaut n ?', d, [div, m + k, d + 1],
    methode + ' ' + corps + ' Donc n = ' + d + '. Piège : ' + (div ? 'diviser ' + m + ' par ' + k + ' donne ' + div + ', mais on soustrait les exposants, on ne les divise pas.' : 'additionner les exposants donne ' + (m + k) + ', c\'est la règle du produit, pas celle du quotient.'));
}
function n1PuisPuis(R){
  const b = R.pick([2, 3, 5, 7, 10]);
  let m = R.int(2, 6), k = R.int(2, 5);
  if (m === 2 && k === 2) m = R.int(3, 6);
  const p = m * k, tour = pw(m, k), tour2 = pw(k, m), expr = '(' + P(b, m) + ')' + sup(k);
  const methode = 'Une puissance de puissance se calcule en multipliant les exposants.';
  const corps = expr + ' = ' + Array(k).fill(P(b, m)).join(' × ') + ' = ' + P(b, p) + ', car ' + m + ' × ' + k + ' = ' + p + '.';
  const piege = ' Piège : additionner les exposants donne ' + P(b, m + k) + (tour <= 100 ? ', et ' + b + ' puissance ' + P(m, k) + ', c\'est-à-dire ' + P(b, tour) + ', n\'a rien à voir.' : '.');
  if (R.int(0, 1)){
    return Qp('Écris ' + expr + ' sous la forme d\'une seule puissance.', [b, p],
      [[b, m + k], tour <= 100 ? [b, tour] : null, tour2 <= 100 ? [b, tour2] : null], methode + ' ' + corps + piege, voisinsP(b, p));
  }
  return Qn(expr + ' = ' + b + 'ⁿ. Que vaut n ?', p, [m + k, tour <= 100 ? tour : null, tour2 <= 100 ? tour2 : null, p + 1],
    methode + ' ' + corps + ' Donc n = ' + p + '.' + piege);
}
function n1Reconnaitre(R){
  const c = R.pick([2, 2, 3, 5]);
  const ex = c === 2 ? [2, 3, 4, 5, 6, 7] : c === 3 ? [2, 3, 4] : [2, 3];
  const nf = c === 2 && R.int(0, 2) === 0 ? 3 : 2;
  const es = []; for (let t = 0; t < nf; t++) es.push(R.pick(ex));
  const s = somme(es), pr = es.reduce((u, v) => u * v, 1), val = pw(c, s);
  const uniq = es.filter((e, j) => es.indexOf(e) === j);
  const expl = 'Écris chaque nombre comme une puissance de ' + c + ', puis additionne les exposants. ' +
    uniq.map(e => n0(pw(c, e)) + ' = ' + P(c, e)).join(', ') + ', donc le produit vaut ' + es.map(e => P(c, e)).join(' × ') + ' = ' + P(c, s) +
    '. Donc n = ' + s + '. Piège : n est l\'exposant, pas le résultat ' + n0(val) + ' ; et on additionne les exposants, on ne les multiplie pas.';
  return Qn(es.map(e => n0(pw(c, e))).join(' × ') + ' = ' + c + 'ⁿ. Que vaut n ?', s, [pr, val <= 99999 ? val : null, s + 1], expl);
}
function n1Equation(R){
  const c = R.pick([2, 3, 5]);
  const n = c === 2 ? R.int(4, 10) : c === 3 ? R.int(3, 6) : R.int(3, 4);
  const V = pw(c, n), rac = Math.round(Math.sqrt(V));
  const suite = []; for (let t = 1; t <= n; t++) suite.push(P(c, t) + ' = ' + n0(pw(c, t)));
  const expl = 'Multiplie ' + c + ' par lui-même en comptant les facteurs jusqu\'à obtenir ' + n0(V) + '. ' + suite.join(', ') +
    '. Donc n = ' + n + '. Piège : ' + c + 'ⁿ n\'est pas ' + c + ' × n, donc n n\'est pas ' + n0(V) + ' ÷ ' + c + ' = ' + n0(V / c) + '.';
  return Qn('Quel entier n vérifie ' + c + 'ⁿ = ' + n0(V) + ' ?', n, [V / c, rac * rac === V ? rac : null, n + 1, n - 1], expl);
}

/* ===================== NIVEAU 2 : maîtrise ===================== */
function n2Base(R){
  const x = R.pick(BASES.concat([[16, 4, 2], [64, 4, 3], [81, 9, 2]])), b = x[0], c = x[1], i = x[2], e = R.int(2, 12), p = i * e;
  const methode = 'Écris d\'abord ' + b + ' comme une puissance de ' + c + ', puis multiplie les exposants.';
  const corps = b + ' = ' + P(c, i) + ', donc ' + P(b, e) + ' = (' + P(c, i) + ')' + sup(e) + ' = ' + P(c, p) + ', car ' + i + ' × ' + e + ' = ' + p + '.';
  const piege = ' Piège : additionner ' + i + ' et ' + e + ' donne ' + (i + e) + ', et garder l\'exposant ' + e + ' oublie que ' + b + ' vaut ' + P(c, i) + '.';
  if (R.int(0, 2) > 0){
    return Qn(P(b, e) + ' = ' + c + 'ⁿ. Que vaut n ?', p, [i + e, e, b * e <= 300 ? b * e : null, p + i], methode + ' ' + corps + ' Donc n = ' + p + '.' + piege);
  }
  return Qp('Écris ' + P(b, e) + ' comme une puissance de ' + c + '.', [c, p],
    [[c, i + e], pw(i, e) <= 100 ? [c, pw(i, e)] : null, [c, e], [c, p + i]], methode + ' ' + corps + piege, voisinsP(c, p));
}
function n2Somme(R){
  const b = R.pick([2, 3, 4, 5]), e = R.int(3, 15);
  const termes = Array(b).fill(P(b, e)).join(' + ');
  const methode = 'Additionner ' + b + ' fois le même nombre, c\'est le multiplier par ' + b + '.';
  const corps = termes + ' = ' + b + ' × ' + P(b, e) + ' = ' + P(b, 1) + ' × ' + P(b, e) + ' = ' + P(b, e + 1) + '.';
  const piege = ' Piège : on n\'additionne pas les exposants, car c\'est une somme et non un produit (' + P(b, b * e) + ' serait faux), et la base ne devient pas ' + (b * b) + '.';
  if (R.int(0, 1)){
    return Qp('Écris ' + termes + ' sous la forme d\'une seule puissance.', [b, e + 1],
      [[b, b * e], [b * b, e], [b * b, e + 1], [b, e + b]], methode + ' ' + corps + piege, voisinsP(b, e + 1));
  }
  return Qn(termes + ' = ' + b + 'ⁿ. Que vaut n ?', e + 1, [b * e, e, e + b], methode + ' ' + corps + ' Donc n = ' + (e + 1) + '.' + piege);
}
function n2Coef(R){
  const x = R.pick([[4, 2, 2], [8, 2, 3], [16, 2, 4], [9, 3, 2], [27, 3, 3], [25, 5, 2]]);
  const b = x[0], c = x[1], i = x[2], e = R.int(3, 12), p = i * e + 1;
  const methode = 'Écris tout en base ' + c + ', sans oublier que le facteur ' + c + ' seul vaut ' + P(c, 1) + '.';
  const corps = P(b, e) + ' = (' + P(c, i) + ')' + sup(e) + ' = ' + P(c, i * e) + ', donc ' + c + ' × ' + P(b, e) + ' = ' + P(c, 1) + ' × ' + P(c, i * e) + ' = ' + P(c, p) + '.';
  const piege = ' Piège : ' + c + ' × ' + P(b, e) + ' n\'est pas ' + P(c * b, e) + ', qui vaudrait ' + P(c, (i + 1) * e) + ' ; le facteur ' + c + ' ne passe pas sous l\'exposant.';
  if (R.int(0, 1)){
    return Qn(c + ' × ' + P(b, e) + ' = ' + c + 'ⁿ. Que vaut n ?', p, [(i + 1) * e, i * e, e + 1, i * (e + 1)], methode + ' ' + corps + ' Donc n = ' + p + '.' + piege);
  }
  return Qp('Écris ' + c + ' × ' + P(b, e) + ' comme une puissance de ' + c + '.', [c, p],
    [[c, (i + 1) * e], [c, i * e], [c, e + 1], [c, i * (e + 1)]], methode + ' ' + corps + piege, voisinsP(c, p));
}
const OPS = [
  {art: 'la moitié', Art: 'La moitié', verbe: 'diviser', imp: 'divise', c: 2, s: -1},
  {art: 'le double', Art: 'Le double', verbe: 'multiplier', imp: 'multiplie', c: 2, s: 1},
  {art: 'le quart', Art: 'Le quart', verbe: 'diviser', imp: 'divise', c: 2, s: -2},
  {art: 'le quadruple', Art: 'Le quadruple', verbe: 'multiplier', imp: 'multiplie', c: 2, s: 2},
  {art: 'le tiers', Art: 'Le tiers', verbe: 'diviser', imp: 'divise', c: 3, s: -1},
  {art: 'le triple', Art: 'Le triple', verbe: 'multiplier', imp: 'multiplie', c: 3, s: 1},
  {art: 'le cinquième', Art: 'Le cinquième', verbe: 'diviser', imp: 'divise', c: 5, s: -1}
];
function n2Moitie(R){
  const o = R.pick(OPS), c = o.c, a = Math.abs(o.s), f = pw(c, a), div = o.s < 0;
  const e = R.int(8, 40), p = e + o.s;
  const methode = 'Prendre ' + o.art + ' d\'un nombre, c\'est le ' + o.verbe + ' par ' + f + ' = ' + P(c, a) + ', donc ' + (div ? 'retirer ' : 'ajouter ') + a + ' à l\'exposant.';
  const corps = o.Art + ' de ' + P(c, e) + ' vaut ' + P(c, e) + (div ? ' ÷ ' : ' × ') + P(c, a) + ' = ' + P(c, e + (div ? '-' : '+') + a) + ' = ' + P(c, p) + '.';
  let autres, piege;
  if (div){
    const h = e % f === 0 ? e / f : null;
    autres = [h ? [c, h] : null, f === c ? [1, e] : null, [c, e - f], [c, p - 1]];
    piege = ' Piège : on ne divise ni l\'exposant' + (h ? ' (' + P(c, h) + ' serait faux)' : '') + ' ni la base' + (f === c ? ' (' + P(1, e) + ' vaut 1)' : '') + ' : on retire ' + a + ' à l\'exposant.';
  } else {
    autres = [[c * f, e], [c, e * f], [c, e + f], [c * f, p], [c, p + 1]];
    piege = ' Piège : ' + o.art + ' de ' + P(c, e) + ' n\'est pas ' + P(c * f, e) + ' : multiplier la base par ' + f + ' revient à multiplier le nombre par ' + P(f, e) + ', pas par ' + f + '.';
  }
  /* Voisins : jamais le nombre de départ lui-même. */
  return Qp('Que vaut ' + o.art + ' de ' + P(c, e) + ' ?', [c, p], autres, methode + ' ' + corps + piege, k => { const x = voisinsP(c, p)(k); return x[1] === e ? null : x; });
}
function n2Mixte(R){
  const c = R.pick([2, 2, 3, 5]), L = R.shuffle(FAM[c]);
  let x1 = L[0], x2 = L[1];
  const e1 = R.int(2, 10), e2 = R.int(2, 10);
  let E1 = x1[1] * e1, E2 = x2[1] * e2, f1 = e1, f2 = e2;
  const quotient = R.int(0, 1) === 1 && E1 !== E2;
  if (quotient && E1 < E2){ const t = x1; x1 = x2; x2 = t; const u = E1; E1 = E2; E2 = u; const v = f1; f1 = f2; f2 = v; }
  const op = quotient ? ' ÷ ' : ' × ', ans = quotient ? E1 - E2 : E1 + E2;
  const methode = 'Ramène les deux puissances à la base ' + c + ', puis ' + (quotient ? 'soustrais' : 'additionne') + ' les exposants.';
  const corps = conv(x1[0], x1[1], c, f1) + ' et ' + conv(x2[0], x2[1], c, f2) + ', donc ' + P(x1[0], f1) + op + P(x2[0], f2) + ' = ' + P(c, E1) + op + P(c, E2) + ' = ' + P(c, ans) + '. Donc n = ' + ans + '.';
  const naif = quotient ? f1 - f2 : f1 + f2;
  const piege = naif > 0 ? ' Piège : travailler directement sur les exposants ' + f1 + ' et ' + f2 + ' donne ' + naif + ', mais les bases ' + x1[0] + ' et ' + x2[0] + ' sont différentes.'
    : ' Piège : soustraire directement les exposants ' + f1 + ' et ' + f2 + ' n\'a pas de sens, car les bases ' + x1[0] + ' et ' + x2[0] + ' sont différentes.';
  const autres = quotient ? [naif, E1 + E2, E1 - f2, x1[1] * (f1 - f2)] : [naif, E1 + f2, f1 + E2, E1 * E2 <= 200 ? E1 * E2 : null];
  return Qn(P(x1[0], f1) + op + P(x2[0], f2) + ' = ' + c + 'ⁿ. Que vaut n ?', ans, autres, methode + ' ' + corps + piege);
}

/* ===================== NIVEAU 3 : niveau des exemples officiels ===================== */
const SOM3 = [[2, 2, 1], [2, 4, 2], [3, 3, 1], [5, 5, 1]];   // [c, k, j] : k termes, k = cʲ
function n3SommeBase(R){
  let c = 2, k = 4, j = 2, b = 8, i = 3;
  for (let t = 0; t < 30; t++){
    const s = R.pick(SOM3); c = s[0]; k = s[1]; j = s[2];
    const x = R.pick(FAM[c]); b = x[0]; i = x[1];
    if (!(i === 1 && k === c)) break;
  }
  const e = R.int(3, 12), ans = i * e + j;
  const termes = Array(k).fill(P(b, e)).join(' + ');
  const enMots = R.int(0, 2) === 0;
  const q = enMots ? 'On additionne ' + k + ' nombres tous égaux à ' + P(b, e) + '. Le résultat s\'écrit ' + c + 'ⁿ. Que vaut n ?' : termes + ' = ' + c + 'ⁿ. Que vaut n ?';
  const expl = 'Remplace la somme de ' + k + ' termes égaux par un produit par ' + k + ', puis écris tout en base ' + c + '. ' +
    'La somme vaut ' + k + ' × ' + P(b, e) + '. Or ' + k + ' = ' + P(c, j) + (i > 1 ? ' et ' + P(b, e) + ' = ' + P(c, i * e) : '') +
    ', donc le total vaut ' + P(c, j) + ' × ' + P(c, i * e) + ' = ' + P(c, ans) + '. Donc n = ' + ans + '. Piège : additionner les exposants donnerait ' + (i * e * k) +
    ', mais une somme de puissances égales n\'est pas un produit de puissances' + (i > 1 ? ' ; et garder la base ' + b + ' fait oublier que ' + b + ' = ' + P(c, i) : '') + '.';
  return Qn(q, ans, [i * e, i * e * k, e + j, i * (e + 1)], expl);
}
function n3Facteur(R){
  const v = R.int(0, 2);
  if (v < 2){
    const b = R.pick([2, 2, 3, 5]), dmax = b === 2 ? 4 : b === 3 ? 3 : 2, plus = v === 0;
    const d = R.int(plus ? 1 : (b === 2 ? 2 : 1), dmax), m = R.int(8, 40), bd = pw(b, d), ans = bd + (plus ? 1 : -1);
    const q = 'Calcule (' + P(b, m + d) + (plus ? ' + ' : ' − ') + P(b, m) + ') ÷ ' + P(b, m) + '.';
    const expl = 'Divise chacun des deux termes de la parenthèse par ' + P(b, m) + ', ce qui revient à mettre ' + P(b, m) + ' en facteur. ' +
      P(b, m + d) + ' ÷ ' + P(b, m) + ' = ' + P(b, d) + ' = ' + bd + ' et ' + P(b, m) + ' ÷ ' + P(b, m) + ' = 1, donc le résultat vaut ' + bd + (plus ? ' + ' : ' − ') + '1 = ' + ans +
      '. Piège : ' + P(b, m) + ' ÷ ' + P(b, m) + ' vaut 1, pas 0 ni ' + b + ' ; et ' + P(b, d) + ' vaut ' + bd + ', pas ' + d + '.';
    const autres = plus ? [bd, d + 1, bd + b, bd - 1] : [bd, bd - b, d - 1, bd + 1];
    return Qn(q, ans, autres, expl, 0);
  }
  const b = R.pick([2, 2, 3]), m = R.int(5, 30);
  const offs = R.pick(b === 2 ? [[0, 1], [0, 2], [0, 3], [0, 1, 2], [0, 1, 3], [0, 2, 3], [0, 1, 2, 3]] : [[0, 1], [0, 2], [0, 1, 2], [0, 1, 3]]);
  const k = somme(offs.map(o => pw(b, o)));
  const q = offs.map(o => P(b, m + o)).join(' + ') + ' = k × ' + P(b, m) + '. Que vaut k ?';
  const expl = 'Écris chaque terme comme un nombre multiplié par ' + P(b, m) + ', puis additionne ces nombres. ' +
    offs.map(o => o === 0 ? P(b, m) + ' = 1 × ' + P(b, m) : P(b, m + o) + ' = ' + P(b, o) + ' × ' + P(b, m) + ' = ' + pw(b, o) + ' × ' + P(b, m)).join(' ; ') +
    '. Donc la somme vaut (' + offs.map(o => pw(b, o)).join(' + ') + ') × ' + P(b, m) + ' = ' + k + ' × ' + P(b, m) + ', soit k = ' + k +
    '. Piège : le terme ' + P(b, m) + ' compte pour 1, pas pour 0 ; et additionner les exposants n\'a pas de sens dans une somme.';
  return Qn(q, k, [offs.length, k - 1, pw(b, somme(offs)) <= 2000 ? pw(b, somme(offs)) : null, k + 1], expl);
}
const EQ3 = [[4, 8, 2, 2, 3], [8, 4, 2, 3, 2], [4, 32, 2, 2, 5], [16, 8, 2, 4, 3], [8, 16, 2, 3, 4], [4, 2, 2, 2, 1], [8, 2, 2, 3, 1], [16, 32, 2, 4, 5], [32, 8, 2, 5, 3],
  [9, 27, 3, 2, 3], [27, 9, 3, 3, 2], [9, 3, 3, 2, 1], [27, 81, 3, 3, 4], [81, 27, 3, 4, 3], [25, 125, 5, 2, 3], [125, 25, 5, 3, 2], [25, 5, 5, 2, 1]];
function n3Equation(R){
  let x = EQ3[0], s = 0, n = 6, e = 9;
  for (let t = 0; t < 60; t++){
    x = R.pick(EQ3); s = R.pick([0, 0, 1, 2]); n = R.int(2, 12);
    const tot = x[3] * (n + s);
    if (tot % x[4] === 0 && tot / x[4] >= 2){ e = tot / x[4]; break; }
    x = EQ3[0]; s = 0; n = 6; e = 4;   // repli sûr : 4⁶ = 8⁴
  }
  const b1 = x[0], b2 = x[1], c = x[2], i = x[3], j = x[4], E = j * e;
  const gauche = P(b1, s ? 'n+' + s : 'n');
  const q = 'Quel entier n vérifie ' + gauche + ' = ' + P(b2, e) + ' ?';
  const expoG = i + 'n' + (s ? '+' + (i * s) : '');
  const expl = 'Écris les deux membres comme des puissances de ' + c + ', puis égalise les exposants. ' +
    gauche + ' = (' + P(c, i) + ')' + sup(s ? 'n+' + s : 'n') + ' = ' + P(c, expoG) + ' et ' + (j === 1 ? P(b2, e) + ' est déjà une puissance de ' + c : P(b2, e) + ' = ' + P(c, E)) + '. ' +
    'Donc ' + i + 'n' + (s ? ' + ' + (i * s) : '') + ' = ' + E + ', soit n = ' + n + '. Piège : garder l\'exposant ' + e + ' revient à oublier que les bases ' + b1 + ' et ' + b2 + ' sont différentes' +
    (s ? ' ; et il ne faut pas oublier le « + ' + s + ' » de l\'exposant.' : '.');
  const autres = s ? [n + s, E - s, e - s, e, (E - s) % i === 0 ? (E - s) / i : null] : [e, E, (i * e) % j === 0 ? i * e / j : null, n + 1];
  return Qn(q, n, autres, expl);
}
function n3Racine(R){
  const x = R.pick(BASES.concat([[16, 4, 2], [64, 4, 3], [64, 2, 6]])), b = x[0], c = x[1], i = x[2];
  let e = R.int(3, 12);
  if ((i * e) % 2) e++;                       // i × e pair : la racine tombe juste
  const E = i * e, ans = E / 2;
  const q = '√(' + P(b, e) + ') = ' + c + 'ⁿ. Que vaut n ?';
  const expl = 'Écris le nombre sous la racine comme une puissance de ' + c + ' : prendre la racine carrée revient à diviser l\'exposant par 2. ' +
    P(b, e) + ' = (' + P(c, i) + ')' + sup(e) + ' = ' + P(c, E) + ', et ' + P(c, E) + ' = (' + P(c, ans) + ')², donc √(' + P(b, e) + ') = ' + P(c, ans) + '. Donc n = ' + ans +
    '. Piège : sans la racine, on obtiendrait ' + E + ' ; et diviser ' + e + ' par 2 sans changer de base ne donne pas l\'exposant en base ' + c + '.';
  return Qn(q, ans, [E, e % 2 === 0 ? e / 2 : null, e, ans * 2 + 1, ans + 1], expl);
}
function n3Chiffres(R){
  const m = R.int(6, 30), up = R.int(0, 1) ? R.int(1, 6) : -R.int(1, 4);
  const a = up > 0 ? m + up : m, b = up > 0 ? m : m - up;
  const reste = up > 0 ? pw(2, up) : pw(5, -up), L = longueur(reste);
  const expr = R.int(0, 1) ? P(2, a) + ' × ' + P(5, b) : P(5, b) + ' × ' + P(2, a);
  const methode = 'Forme des paquets d\'un facteur deux et d\'un facteur cinq : chaque paquet vaut dix.';
  const decomp = expr + ' = ' + n0(reste) + ' × ' + P(2, m) + ' × ' + P(5, m) + ' = ' + n0(reste) + ' × ' + P(10, m) + ', car il reste ' + (up > 0 ? P(2, up) : P(5, -up)) + ' = ' + n0(reste) + ' après avoir formé ' + m + ' paquets.';
  if (R.int(0, 2) === 0){
    const expl = methode + ' ' + decomp + ' Ce nombre s\'écrit ' + n0(reste) + ' suivi de ' + m + ' zéros, et ' + n0(reste) + ' ne se termine pas par 0 : il se termine donc par ' + m + ' zéros exactement. Piège : on ne compte pas ' + a + ' + ' + b + ' zéros ; seuls les paquets complets 2 × 5 en donnent.';
    return Qn('Par combien de zéros se termine le nombre ' + expr + ' ?', m, [a + b, Math.max(a, b), m + 1, Math.abs(up)], expl);
  }
  const ans = m + L;
  const expl = methode + ' ' + decomp + ' Ce nombre s\'écrit ' + n0(reste) + ' suivi de ' + m + ' zéros : il a ' + L + ' + ' + m + ' = ' + ans + ' chiffres. Piège : ' + P(10, m) + ' seul aurait ' + (m + 1) + ' chiffres ; il faut ajouter les chiffres de ' + n0(reste) + ' et ne pas additionner les exposants ' + a + ' et ' + b + '.';
  return Qn('Combien de chiffres a le nombre ' + expr + ' ?', ans, [m + 1, a + b, Math.max(a, b), m], expl);
}
/* Comparer quatre puissances : bᵗᵏ = (bᵗ)ᵏ ; l'extrême n'a ni l'exposant extrême ni la base extrême. */
function comparer(R, pool, ks, repli, proche){
  let L = null, max = true, best = 0, k = 10;
  for (let essai = 0; essai < 300 && !L; essai++){
    const C = R.shuffle(pool).slice(0, 4), vals = C.map(x => pw(x[0], x[1]));
    if (new Set(vals).size < 4 || new Set(C.map(x => x[0])).size < 4) continue;   // bases affichées toutes différentes
    const mx = R.int(0, 1) === 1;
    const tri = vals.slice().sort((u, v) => mx ? v - u : u - v), ib = vals.indexOf(tri[0]);
    const ts = C.map(x => x[1]), bs = C.map(x => x[0]);
    if (mx && (ts[ib] === Math.max.apply(null, ts) || bs[ib] === Math.max.apply(null, bs))) continue;
    if (!mx && (ts[ib] === Math.min.apply(null, ts) || bs[ib] === Math.min.apply(null, bs))) continue;
    if (proche && Math.max(tri[0], tri[1]) / Math.min(tri[0], tri[1]) > proche) continue;
    L = C; max = mx; best = ib;
  }
  if (!L){ L = repli; max = true; const vals = L.map(x => pw(x[0], x[1])); best = vals.indexOf(Math.max.apply(null, vals)); }
  k = R.pick(ks);
  const vals = L.map(x => pw(x[0], x[1])), rep = L[best];
  const ts = L.map(x => x[1]), bs = L.map(x => x[0]);
  const iExp = ts.indexOf(max ? Math.max.apply(null, ts) : Math.min.apply(null, ts)), iBase = bs.indexOf(max ? Math.max.apply(null, bs) : Math.min.apply(null, bs));
  const mot = max ? 'grand' : 'petit';
  const expl = 'Écris chaque nombre comme une puissance d\'exposant ' + k + ', puis compare les bases obtenues. ' +
    L.map((x, j) => x[1] === 1 ? P(x[0], k) + ' a déjà l\'exposant ' + k : P(x[0], x[1] * k) + ' = (' + P(x[0], x[1]) + ')' + sup(k) + ' = ' + P(vals[j], k)).join(' ; ') +
    '. À exposant égal, le plus ' + mot + ' nombre est celui qui a la plus ' + mot + 'e base, ici ' + n0(vals[best]) + ' : la réponse est ' + P(rep[0], rep[1] * k) +
    '. Piège : le plus ' + mot + ' exposant (' + P(L[iExp][0], L[iExp][1] * k) + ') ou la plus ' + mot + 'e base (' + P(L[iBase][0], L[iBase][1] * k) + ') ne suffisent pas à conclure.';
  const liste = R.shuffle(L).map(x => P(x[0], x[1] * k));
  return Qp('Lequel de ces nombres est le plus ' + mot + ' : ' + liste.slice(0, 3).join(', ') + ' ou ' + liste[3] + ' ?', [rep[0], rep[1] * k],
    L.filter((x, j) => j !== best).map(x => [x[0], x[1] * k]), expl, () => null);
}
const POOL3 = [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 1], [3, 2], [3, 3], [4, 2], [5, 1], [5, 2], [6, 1], [7, 1], [10, 1], [11, 1], [6, 2]];
function n3Compare(R){ return comparer(R, POOL3, [10, 20, 50, 100], [[2, 4], [3, 3], [5, 2], [7, 1]], 0); }
function n3CoefPuis(R){
  const x = R.pick([[4, 2, 2, [[8, 3], [16, 4]]], [8, 2, 3, [[4, 2], [16, 4], [32, 5]]], [16, 2, 4, [[8, 3], [32, 5]]], [9, 3, 2, [[27, 3], [81, 4]]], [27, 3, 3, [[9, 2]]], [25, 5, 2, [[125, 3]]]]);
  const C = x[0], c = x[1], j = x[2], y = R.pick(x[3]), b = y[0], i = y[1], e = R.int(5, 20), ans = j + i * e;
  const expl = 'Écris le coefficient ' + C + ' et la puissance dans la même base ' + c + ', puis additionne les exposants. ' +
    C + ' = ' + P(c, j) + ' et ' + P(b, e) + ' = (' + P(c, i) + ')' + sup(e) + ' = ' + P(c, i * e) + ', donc ' + C + ' × ' + P(b, e) + ' = ' + P(c, j + '+' + (i * e)) + ' = ' + P(c, ans) +
    '. Donc n = ' + ans + '. Piège : ' + C + ' × ' + P(b, e) + ' n\'est pas ' + P(C * b, e) + ', qui vaudrait ' + P(c, (i + j) * e) + ' ; le coefficient ne passe pas sous l\'exposant.';
  return Qn(C + ' × ' + P(b, e) + ' = ' + c + 'ⁿ. Que vaut n ?', ans, [(i + j) * e, i * e, 1 + i * e, e + j], expl);
}
const OPS3 = [OPS[0], OPS[1], OPS[2], OPS[3], OPS[4], OPS[5]];
function n3MoitieBase(R){
  const o = R.pick(OPS3), c = o.c, a = Math.abs(o.s), f = pw(c, a), div = o.s < 0;
  const x = R.pick(BASES.filter(y => y[1] === c)), b = x[0], i = x[2], e = R.int(5, 30), E = i * e, ans = E + o.s;
  const q = o.Art + ' de ' + P(b, e) + ' s\'écrit ' + c + 'ⁿ. Que vaut n ?';
  const expl = 'Écris d\'abord ' + P(b, e) + ' comme une puissance de ' + c + ', puis ' + o.imp + ' par ' + f + ' = ' + P(c, a) + '. ' +
    P(b, e) + ' = (' + P(c, i) + ')' + sup(e) + ' = ' + P(c, E) + ', et ' + o.verbe + ' par ' + P(c, a) + ' revient à ' + (div ? 'retirer ' : 'ajouter ') + a + ' à l\'exposant : ' + P(c, ans) +
    '. Donc n = ' + ans + '. Piège : ' + o.art + ' de ' + P(b, e) + ' n\'est pas ' + P(b, e + o.s) + ', qui reviendrait à ' + o.verbe + ' par ' + (a === 1 ? b : P(b, a) + ' = ' + n0(pw(b, a))) + ' ; et ' + (div ? 'diviser l\'exposant' : 'multiplier l\'exposant') + ' n\'a pas de sens ici.';
  const autres = [E, i * (e + o.s), e + o.s, div ? (E % f === 0 ? E / f : null) : E * f];
  return Qn(q, ans, autres, expl);
}

/* ===================== NIVEAU 4 : plus dur que les exemples officiels ===================== */
function n4Coefs(R){
  let c = 3, b = 9, i = 2, T = 9, t = 2, e = 5, coefs = [3, 6];
  for (let essai = 0; essai < 60; essai++){
    c = R.pick([2, 2, 3, 5]);
    const xb = R.pick(BASES.filter(y => y[1] === c)); b = xb[0]; i = xb[2];
    const xt = R.pick({2: [[4, 2], [8, 3], [16, 4], [32, 5]], 3: [[9, 2], [27, 3]], 5: [[5, 1], [25, 2], [125, 3]]}[c]); T = xt[0]; t = xt[1];
    e = R.int(3, 12);
    if (T >= 8 && R.int(0, 2) === 0){
      const c1 = R.int(1, T - 2), c2 = R.int(1, T - c1 - 1); coefs = [c1, c2, T - c1 - c2];
    } else { const c1 = R.int(1, T - 1); coefs = [c1, T - c1]; }
    if (c === 5 && b === 25 && e === 4 && coefs.length === 2 && coefs.indexOf(5) >= 0 && coefs.indexOf(20) >= 0) continue;
    if (coefs.every(v => v === 1)) continue;
    break;
  }
  const terme = k => (k === 1 ? '' : k + ' × ') + P(b, e);
  const ans = t + i * e;
  const q = coefs.map(terme).join(' + ') + ' = ' + c + 'ⁿ. Que vaut n ?';
  const expl = 'Mets ' + P(b, e) + ' en facteur pour additionner les coefficients, puis écris tout en base ' + c + '. ' +
    coefs.map(terme).join(' + ') + ' = (' + coefs.join(' + ') + ') × ' + P(b, e) + ' = ' + T + ' × ' + P(b, e) + '. Or ' + T + ' = ' + P(c, t) + ' et ' + P(b, e) + ' = ' + P(c, i * e) +
    ', donc le total vaut ' + P(c, t + '+' + (i * e)) + ' = ' + P(c, ans) + '. Donc n = ' + ans + '. Piège : on additionne les coefficients, pas les exposants des termes ; et ' + T + ' × ' + P(b, e) + ' n\'est pas ' + P(T * b, e) + '.';
  return Qn(q, ans, [i * e, t + e, coefs.length * i * e, i * e + 1, (t + i) * e], expl);
}
function n4Prod(R){
  const c = R.pick([2, 2, 3]), F = c === 2 ? [[2, 1], [4, 2], [8, 3], [16, 4]] : [[3, 1], [9, 2], [27, 3]];
  const nf = R.int(2, 3), bs = R.shuffle(F).slice(0, nf).sort((u, v) => u[0] - v[0]);
  const J = somme(bs.map(x => x[1])), n = R.int(2, 12), E = J * n;
  const opts = F.filter(x => E % x[1] === 0 && E / x[1] >= 2), d = R.pick(opts), l = d[1], ed = E / l;
  const q = bs.map(x => x[0] + 'ⁿ').join(' × ') + ' = ' + P(d[0], ed) + '. Que vaut n ?';
  const expl = 'Écris chaque facteur comme une puissance de ' + c + ', puis additionne les exposants. ' +
    bs.map(x => x[1] === 1 ? x[0] + 'ⁿ' : x[0] + 'ⁿ = ' + P(c, x[1] + 'n')).join(' ; ') + ' ; le produit vaut donc ' + P(c, bs.map(x => (x[1] === 1 ? '' : x[1]) + 'n').join('+')) + ' = ' + P(c, J + 'n') + '. ' +
    (l > 1 ? 'De plus, ' + P(d[0], ed) + ' = ' + P(c, E) + '. ' : '') + 'On résout ' + J + 'n = ' + E + ' : n = ' + n +
    '. Piège : ' + bs.map(x => x[0] + 'ⁿ').join(' × ') + ' n\'est pas ' + P(c, nf + 'n') + ' : chaque base doit être convertie avant d\'additionner les exposants.';
  return Qn(q, n, [E % nf === 0 ? E / nf : null, ed % J === 0 ? ed / J : null, ed % nf === 0 ? ed / nf : null, E - J, n + 1], expl);
}
function n4Subst(R){
  const c = R.pick([2, 3]);
  const T = c === 2 ? [[2, 0], [2, 2], [3, 0], [1, 3], [2, 1], [2, 4], [1, 4], [3, 3]] : [[2, 0], [2, 2], [1, 2], [2, 1], [3, 0], [1, 3]];
  let v = 5, al = 2, s = 2, ans = 100;
  for (let essai = 0; essai < 60; essai++){
    v = R.pick(c === 2 ? [3, 5, 6, 7, 9, 10, 11, 12] : [2, 4, 5, 7, 8, 10]);
    const t = R.pick(T); al = t[0]; s = t[1]; ans = pw(v, al) * pw(c, s);
    if (ans <= 2500) break;
    v = c === 2 ? 5 : 2; al = 2; s = 2; ans = pw(v, 2) * pw(c, 2);
  }
  const grande = al > 1 && s % al === 0 && (s === 0 || R.int(0, 1) === 1);
  const disp = grande ? P(pw(c, al), s ? 'x+' + (s / al) : 'x') : P(c, (al > 1 ? al : '') + 'x' + (s ? '+' + s : ''));
  const q = 'On sait que ' + c + 'ˣ = ' + v + '. Combien vaut ' + disp + ' ?';
  const fac = (al > 1 ? '(' + c + 'ˣ)' + sup(al) : c + 'ˣ') + (s ? ' × ' + P(c, s) : '');
  const num = (al > 1 ? P(v, al) : String(v)) + (s ? ' × ' + n0(pw(c, s)) : '');
  const expl = 'Fais apparaître ' + c + 'ˣ dans la puissance demandée, en séparant l\'exposant en morceaux. ' +
    disp + ' = ' + fac + ' = ' + num + ' = ' + n0(ans) + '. Piège : ' + (al > 1 ? '(' + c + 'ˣ)' + sup(al) + ' vaut ' + P(v, al) + ' = ' + pw(v, al) + ', pas ' + al + ' × ' + v + (s ? ' ; et le facteur ' + P(c, s) + ' se multiplie, il ne s\'ajoute pas.' : '.') : 'le facteur ' + P(c, s) + ' se multiplie, il ne s\'ajoute pas.');
  const autres = [al * v * pw(c, s), pw(v, al) + pw(c, s), al > 1 && s ? pw(v, al) * pw(c, s / al) : null, s ? pw(v, al) : null, al > 1 ? v * pw(c, s) : null, s ? pw(v + s, al) : null];
  return Qn(q, ans, autres.filter(w => w === null || w <= 99999), expl, 1);
}
function chiffresProduit(E2, E5){
  const m = Math.min(E2, E5), d = E2 - E5;
  const reste = d >= 0 ? pw(2, d) : pw(5, -d);
  return { m, d, reste, chiffres: m + longueur(reste) };
}
function n4Chiffres(R){
  const P2 = [[2, 1], [4, 2], [8, 3], [16, 4]], P5 = [[5, 1], [25, 2], [125, 3]];
  let x2 = [4, 2], x5 = [5, 1], a = 8, b = 15;
  for (let essai = 0; essai < 80; essai++){
    x2 = R.pick(P2); x5 = R.pick(P5);
    if (x2[1] === 1 && x5[1] === 1) continue;
    a = R.int(3, 15);
    const E2 = x2[1] * a, cand = [];
    for (let bb = 2; bb <= 25; bb++){ const dd = E2 - x5[1] * bb; if (dd >= -4 && dd <= 6 && Math.min(E2, x5[1] * bb) >= 5) cand.push(bb); }
    if (!cand.length) continue;
    b = R.pick(cand); break;
  }
  const E2 = x2[1] * a, E5 = x5[1] * b, r = chiffresProduit(E2, E5);
  const expr = R.int(0, 1) ? P(x2[0], a) + ' × ' + P(x5[0], b) : P(x5[0], b) + ' × ' + P(x2[0], a);
  const naif = chiffresProduit(a, b);
  const methode = 'Écris tout avec des facteurs deux et cinq, puis forme des paquets « deux fois cinq » qui valent dix.';
  const corps = conv(x2[0], x2[1], 2, a) + ' et ' + conv(x5[0], x5[1], 5, b) + '. On forme ' + r.m + ' paquets 2 × 5 et il ' +
    (r.d === 0 ? 'ne reste rien' : 'reste ' + (r.d > 0 ? P(2, r.d) : P(5, -r.d)) + ' = ' + n0(r.reste)) + ' : le produit vaut ' + (r.d === 0 ? P(10, r.m) : n0(r.reste) + ' × ' + P(10, r.m)) + '.';
  if (R.int(0, 2) === 0){
    const expl = methode + ' ' + corps + ' Il se termine donc par ' + r.m + ' zéros' + (r.d === 0 ? '' : ', car ' + n0(r.reste) + ' ne se termine pas par 0') + '. Piège : sans conversion, on compterait ' + Math.min(a, b) + ' zéros en lisant les exposants ' + a + ' et ' + b + '.';
    return Qn('Par combien de zéros se termine le nombre ' + expr + ' ?', r.m, [Math.min(a, b), E2 + E5, Math.max(E2, E5), r.m + 1], expl);
  }
  const expl = methode + ' ' + corps + ' Il s\'écrit ' + (r.d === 0 ? '1' : n0(r.reste)) + ' suivi de ' + r.m + ' zéros, soit ' + longueur(r.reste) + ' + ' + r.m + ' = ' + r.chiffres +
    ' chiffres. Piège : sans conversion, en lisant directement les exposants ' + a + ' et ' + b + ', on trouverait ' + naif.chiffres + ' chiffres.';
  return Qn('Combien de chiffres a le nombre ' + expr + ' ?', r.chiffres, [naif.chiffres, r.m + 1, r.m, E2 + E5], expl);
}
/* Fin d'explication d'un quotient factorisé : « Comme 2⁸ ÷ 2⁶ = 2² = 4, le quotient vaut 17 × 4 = 68 ». */
function finQuot(b, m, md, t, An, Bd, ans){
  const calc = String(An) + (t ? ' × ' + pw(b, t) : '') + (Bd > 1 ? ' ÷ ' + Bd : '');
  const debut = t ? 'Comme ' + P(b, m) + ' ÷ ' + P(b, md) + ' = ' + P(b, t) + ' = ' + pw(b, t) + ', le quotient vaut ' : 'Les puissances ' + P(b, m) + ' se simplifient, et le quotient vaut ';
  return debut + (calc === String(ans) ? String(ans) : calc + ' = ' + ans);
}
/* Quotients (bᵐ⁺ᵖ ± bᵐ) ÷ (bᵐ⁻ᵗ⁺ʳ ± bᵐ⁻ᵗ) entiers, listés une fois pour toutes. */
const QD = [];
[2, 3].forEach(b => {
  for (let p = 1; p <= (b === 2 ? 4 : 3); p++) for (let r = 1; r <= 3; r++) for (const sN of [1, -1]) for (const sD of [1, -1]) for (let t = 0; t <= 2; t++){
    const num = pw(b, t) * (pw(b, p) + sN), den = pw(b, r) + sD;
    if (den > 0 && num > 0 && num % den === 0 && num / den >= 2 && num / den <= 300 && !(p === r && sN === sD)) QD.push([b, p, sN, r, sD, t, num / den]);
  }
});
function n4QuotDeux(R){
  const x = R.pick(QD), b = x[0], p = x[1], sN = x[2], r = x[3], sD = x[4], t = x[5], ans = x[6];
  const m = R.int(t + 6, 40), md = m - t;
  const sg = s => s > 0 ? ' + ' : ' − ';
  const q = 'Calcule (' + P(b, m + p) + sg(sN) + P(b, m) + ') ÷ (' + P(b, md + r) + sg(sD) + P(b, md) + ').';
  const An = pw(b, p) + sN, Bd = pw(b, r) + sD;
  const expl = 'Mets en facteur la plus petite puissance, en haut comme en bas, avant de simplifier. ' +
    'En haut : ' + P(b, m + p) + sg(sN) + P(b, m) + ' = (' + pw(b, p) + sg(sN) + '1) × ' + P(b, m) + ' = ' + An + ' × ' + P(b, m) + '. ' +
    'En bas : ' + P(b, md + r) + sg(sD) + P(b, md) + ' = (' + pw(b, r) + sg(sD) + '1) × ' + P(b, md) + ' = ' + Bd + ' × ' + P(b, md) + '. ' +
    finQuot(b, m, md, t, An, Bd, ans) + '. Piège : on ne simplifie pas une somme terme à terme ; on factorise d\'abord.';
  const lead = p - r + t >= 0 ? pw(b, p - r + t) : null;
  const autres = [lead, t && An % Bd === 0 ? An / Bd : null, lead !== null ? lead + sN * pw(b, t) : null, ans * b, An];
  return Qn(q, ans, autres, expl);
}
const DEC23 = {4: [2, 0], 6: [1, 1], 8: [3, 0], 9: [0, 2], 12: [2, 1], 16: [4, 0], 18: [1, 2], 24: [3, 1], 27: [0, 3], 36: [2, 2], 48: [4, 1], 54: [1, 3], 72: [3, 2]};
function n4Decomp(R){
  const cles = Object.keys(DEC23).map(Number);
  let B1 = 6, B2 = 12, e1 = 4, e2 = 3, a = 10, b = 7;
  for (let essai = 0; essai < 60; essai++){
    const L = R.shuffle(cles); B1 = Math.min(L[0], L[1]); B2 = Math.max(L[0], L[1]);
    e1 = R.int(2, 7); e2 = R.int(2, 7);
    a = DEC23[B1][0] * e1 + DEC23[B2][0] * e2; b = DEC23[B1][1] * e1 + DEC23[B2][1] * e2;
    if (a >= 1 && b >= 1 && a !== b) break;
  }
  const quoi = R.pick(['a + b', 'a + b', 'a', 'b']);
  const ans = quoi === 'a' ? a : quoi === 'b' ? b : a + b;
  const dec = B => { const d = DEC23[B]; return d[0] && d[1] ? B + ' = ' + (d[0] === 1 ? '2' : P(2, d[0])) + ' × ' + (d[1] === 1 ? '3' : P(3, d[1])) : B + ' = ' + (d[0] ? P(2, d[0]) : P(3, d[1])); };
  const part = (B, e) => { const d = DEC23[B]; return P(B, e) + ' = ' + [d[0] ? P(2, d[0] * e) : '', d[1] ? P(3, d[1] * e) : ''].filter(Boolean).join(' × '); };
  const q = 'On écrit ' + P(B1, e1) + ' × ' + P(B2, e2) + ' sous la forme 2ᵃ × 3ᵇ, avec a et b entiers. Que vaut ' + quoi + ' ?';
  const expl = 'Décompose chaque base en un produit de 2 et de 3, puis regroupe d\'un côté les exposants de 2, de l\'autre ceux de 3. ' +
    dec(B1) + ' et ' + dec(B2) + ', donc ' + part(B1, e1) + ' et ' + part(B2, e2) + '. Au total a = ' + a + ' et b = ' + b + ', donc ' + quoi + ' = ' + ans +
    '. Piège : additionner les exposants affichés ' + e1 + ' et ' + e2 + ' ne tient pas compte de la décomposition des bases.';
  const autres = quoi === 'a + b' ? [e1 + e2, a, b, a + b + 1] : quoi === 'a' ? [b, e1 + e2, a + b, a + 1] : [a, e1 + e2, a + b, b + 1];
  return Qn(q, ans, autres, expl);
}
const POOL4 = [[2, 5], [2, 6], [2, 7], [2, 8], [3, 3], [3, 4], [3, 5], [5, 2], [5, 3], [6, 2], [7, 2], [10, 2], [11, 2], [12, 2], [13, 2], [15, 2], [6, 3]];
function n4Compare(R){
  if (R.int(0, 2) > 0) return comparer(R, POOL4, [10, 20, 30, 50], [[2, 7], [5, 3], [11, 2], [3, 4]], 1.35);
  /* Ranger trois nombres dans l'ordre croissant. */
  let C = [[2, 7], [5, 3], [3, 4]];
  for (let essai = 0; essai < 300; essai++){
    const D = R.shuffle(POOL4).slice(0, 3), vals = D.map(x => pw(x[0], x[1]));
    if (new Set(vals).size < 3 || new Set(D.map(x => x[1])).size < 3 || new Set(D.map(x => x[0])).size < 3) continue;
    const ordre = D.slice().sort((u, v) => pw(u[0], u[1]) - pw(v[0], v[1])), parT = D.slice().sort((u, v) => u[1] - v[1]), parB = D.slice().sort((u, v) => u[0] - v[0]);
    const id = l => l.map(x => x.join('^')).join(',');
    if (id(ordre) === id(parT) || id(ordre) === id(parB)) continue;
    C = D; break;
  }
  const k = R.pick([10, 20, 30]);
  const vals = C.map(x => pw(x[0], x[1]));
  const ordre = C.slice().sort((u, v) => pw(u[0], u[1]) - pw(v[0], v[1])), parT = C.slice().sort((u, v) => u[1] - v[1]), parB = C.slice().sort((u, v) => u[0] - v[0]);
  const txt = l => l.map(x => P(x[0], x[1] * k)).join(' < ');
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(pp => pp.map(j => ordre[j]));
  const ch = qcm(txt(ordre), [txt(parT), txt(parB)].concat(R.shuffle(perms).map(txt)), () => null);
  const expl = 'Écris les trois nombres avec le même exposant ' + k + ', puis range les bases. ' +
    C.map((x, j) => P(x[0], x[1] * k) + ' = (' + P(x[0], x[1]) + ')' + sup(k) + ' = ' + P(vals[j], k)).join(' ; ') +
    '. Les bases rangées donnent ' + ordre.map(x => n0(pw(x[0], x[1]))).join(' < ') + ', donc ' + txt(ordre) + '. Piège : ranger selon les exposants affichés ou selon les bases affichées donne un ordre faux.';
  return { q: 'Range ces trois nombres dans l\'ordre croissant : ' + R.shuffle(C).map(x => P(x[0], x[1] * k)).join(', ') + '.', a: txt(ordre), accept: null, choix: ch, expl };
}
function n4Termes(R){
  let c = 2, b1 = 4, i1 = 2, e1 = 5, b2 = 8, i2 = 3, e2 = 6, D = 8;
  const DM = {2: 10, 3: 6, 5: 4};
  for (let essai = 0; essai < 80; essai++){
    c = R.pick([2, 2, 3, 5]);
    const L = R.shuffle(FAM[c]); b1 = L[0][0]; i1 = L[0][1]; b2 = L[1][0]; i2 = L[1][1];
    e1 = R.int(3, 15); D = R.int(2, DM[c]);
    const tot = D + i1 * e1;
    if (tot % i2 === 0 && tot / i2 >= 2){ e2 = tot / i2; break; }
    c = 2; b1 = 4; i1 = 2; e1 = 5; b2 = 8; i2 = 3; e2 = 6; D = 8;
  }
  const N = pw(c, D);
  const q = 'Combien de nombres tous égaux à ' + P(b1, e1) + ' faut-il additionner pour obtenir ' + P(b2, e2) + ' ?';
  const expl = 'Additionner N nombres égaux à ' + P(b1, e1) + ', c\'est calculer N × ' + P(b1, e1) + ' : il faut donc diviser ' + P(b2, e2) + ' par ' + P(b1, e1) + ', en base ' + c + '. ' +
    conv(b2, i2, c, e2) + ' et ' + conv(b1, i1, c, e1) + ', donc N = ' + P(c, i2 * e2) + ' ÷ ' + P(c, i1 * e1) + ' = ' + P(c, D) + ' = ' + n0(N) + '. Piège : N n\'est pas la différence des exposants (' + D + ') ; c\'est ' + c + ' puissance cette différence.';
  const autres = [D, pw(c, D - 1), pw(c, D + 1), e2 > e1 && pw(b2, e2 - e1) <= 99999 ? pw(b2, e2 - e1) : null, e2 - e1];
  return Qn(q, N, autres, expl);
}

/* ===================== NIVEAU 5 : haut du test adaptatif ===================== */
const POOL5 = [[2, 9], [2, 10], [2, 11], [3, 6], [3, 7], [5, 4], [6, 4], [7, 3], [7, 4], [10, 3], [11, 3], [12, 3], [5, 5]];
function n5Compare(R){ return comparer(R, POOL5, [10, 20, 30], [[2, 10], [10, 3], [3, 6], [5, 4]], 1.25); }
function n5Deux(R){
  const c = R.pick([2, 3]), c2 = c * c, c3 = c * c * c;
  const V = c === 2 ? [3, 5, 6, 7, 9, 10, 11] : [2, 4, 5, 7];
  const T = [
    {d: P(c2, 'a+b'), f: (p, q) => pw(p * q, 2), dev: (p, q) => '(' + c + 'ᵃ⁺ᵇ)² = (' + c + 'ᵃ × ' + c + 'ᵇ)² = (' + p + ' × ' + q + ')² = ' + P(p * q, 2), err: (p, q) => [2 * p * q, pw(p + q, 2), p * p + q * q, p * q], pg: 'élever au carré n\'est pas multiplier par 2, et ' + c + 'ᵃ⁺ᵇ est un produit, pas une somme'},
    {d: P(c, 'a+2b'), f: (p, q) => p * q * q, dev: (p, q) => c + 'ᵃ × (' + c + 'ᵇ)² = ' + p + ' × ' + P(q, 2) + ' = ' + p + ' × ' + (q * q), err: (p, q) => [p * 2 * q, p + q * q, p * p * q, pw(p * q, 2)], pg: c + '²ᵇ vaut (' + c + 'ᵇ)², pas 2 × ' + c + 'ᵇ'},
    {d: P(c, '2a+b'), f: (p, q) => p * p * q, dev: (p, q) => '(' + c + 'ᵃ)² × ' + c + 'ᵇ = ' + P(p, 2) + ' × ' + q + ' = ' + (p * p) + ' × ' + q, err: (p, q) => [2 * p * q, p * p + q, p * q * q, pw(p * q, 2)], pg: c + '²ᵃ vaut (' + c + 'ᵃ)², pas 2 × ' + c + 'ᵃ'},
    {d: P(c2, 'a') + ' × ' + P(c3, 'b'), f: (p, q) => p * p * q * q * q, dev: (p, q) => '(' + c + 'ᵃ)² × (' + c + 'ᵇ)³ = ' + P(p, 2) + ' × ' + P(q, 3) + ' = ' + (p * p) + ' × ' + (q * q * q), err: (p, q) => [2 * p * 3 * q, p * p + q * q * q, p * p * p * q * q, 6 * p * q], pg: c2 + 'ᵃ = (' + c + 'ᵃ)² et ' + c3 + 'ᵇ = (' + c + 'ᵇ)³ : on élève à une puissance, on ne multiplie pas par 2 ou 3'},
    {d: P(c, '2a-b'), f: (p, q) => p * p / q, dev: (p, q) => '(' + c + 'ᵃ)² ÷ ' + c + 'ᵇ = ' + P(p, 2) + ' ÷ ' + q + ' = ' + (p * p) + ' ÷ ' + q, err: (p, q) => [p * p - q, 2 * p - q, p * p * q, 2 * p * q], pg: 'un exposant « moins b » correspond à une division par ' + c + 'ᵇ, pas à une soustraction, et ' + c + '²ᵃ vaut (' + c + 'ᵃ)², pas 2 × ' + c + 'ᵃ'},
    {d: P(c2, 'a+b+1'), f: (p, q) => pw(p * q, 2) * c2, dev: (p, q) => '(' + c + 'ᵃ⁺ᵇ)² × ' + c2 + ' = (' + p + ' × ' + q + ')² × ' + c2 + ' = ' + (p * p * q * q) + ' × ' + c2, err: (p, q) => [pw(p * q, 2) * c, 2 * p * q * c2, pw(p * q, 2) + c2, pw(p * q + 1, 2)], pg: c2 + 'ᵃ⁺ᵇ⁺¹ = ' + c2 + ' × (' + c + 'ᵃ⁺ᵇ)² : le décalage +1 se fait en base ' + c2 + ', donc il donne un facteur ' + c2 + ', pas ' + c},
    {d: P(c3, 'a+b'), f: (p, q) => pw(p * q, 3), dev: (p, q) => '(' + c + 'ᵃ⁺ᵇ)³ = (' + p + ' × ' + q + ')³ = ' + P(p * q, 3), err: (p, q) => [3 * p * q, pw(p + q, 3), pw(p, 3) + pw(q, 3), pw(p * q, 2)], pg: 'élever au cube n\'est pas multiplier par 3'}
  ];
  let t = T[0], p = 3, q = 5, ans = 225;
  for (let essai = 0; essai < 80; essai++){
    t = R.pick(T); const L = R.shuffle(V); p = L[0]; q = L[1]; ans = t.f(p, q);
    if (ent(ans) && ans >= 2 && ans <= 3000) break;
    t = T[0]; p = V[0]; q = V[1]; ans = t.f(p, q);
  }
  const qtxt = 'On sait que ' + c + 'ᵃ = ' + p + ' et ' + c + 'ᵇ = ' + q + '. Combien vaut ' + t.d + ' ?';
  const expl = 'Réécris la puissance demandée avec ' + c + 'ᵃ et ' + c + 'ᵇ (produit, quotient ou puissance de ces deux nombres), puis remplace-les par leurs valeurs. ' +
    t.d + ' = ' + t.dev(p, q) + ' = ' + n0(ans) + '. Piège : ' + t.pg + '.';
  return Qn(qtxt, ans, t.err(p, q).filter(w => w <= 99999), expl);
}
function n5EqSomme(R){
  if (R.int(0, 1)){
    /* k termes égaux à bⁿ, membre de droite dans une autre base. */
    const K = {2: [[2, 1], [4, 2], [8, 3]], 3: [[3, 1], [9, 2]], 5: [[5, 1]]};
    let c = 2, k = 4, j = 2, b = 4, i = 2, d = 8, l = 3, e = 10, n = 14;
    for (let essai = 0; essai < 80; essai++){
      c = R.pick([2, 2, 3, 5]);
      const kk = R.pick(K[c]); k = kk[0]; j = kk[1];
      const xb = R.pick(FAM[c].filter(y => y[1] >= 2)); b = xb[0]; i = xb[1];
      n = R.int(3, 20);
      const E = i * n + j, ds = FAM[c].filter(y => y[0] !== b && E % y[1] === 0 && E / y[1] >= 2);
      if (!ds.length) continue;
      const dd = R.pick(ds); d = dd[0]; l = dd[1]; e = E / l; break;
    }
    if (!(i * n + j === l * e)){ c = 2; k = 4; j = 2; b = 4; i = 2; d = 8; l = 3; e = 10; n = 14; }
    const E = l * e;
    const gauche = k <= 5 && R.int(0, 2) > 0 ? Array(k).fill(b + 'ⁿ').join(' + ') + ' = ' + P(d, e) + '.' : 'La somme de ' + k + ' nombres tous égaux à ' + b + 'ⁿ vaut ' + P(d, e) + '.';
    const expl = 'Transforme la somme en produit par ' + k + ', écris tout en base ' + c + ', puis égalise les exposants. ' +
      'La somme vaut ' + k + ' × ' + b + 'ⁿ = ' + P(c, j) + ' × ' + P(c, i + 'n') + ' = ' + P(c, i + 'n+' + j) + ', et ' + (l === 1 ? P(d, e) + ' est déjà une puissance de ' + c : P(d, e) + ' = ' + P(c, E)) +
      '. Donc ' + i + 'n + ' + j + ' = ' + E + ', soit ' + i + 'n = ' + (E - j) + ' et n = ' + n + '. Piège : oublier le facteur ' + k + ' (le « + ' + j + ' » de l\'exposant) ou oublier de diviser par ' + i + ' donne une valeur fausse.';
    return Qn(gauche + ' Que vaut n ?', n, [E % i === 0 ? E / i : null, E - j, e % i === 0 ? e / i : null, e, n + 1], expl);
  }
  /* Somme géométrique : cⁿ⁺ᵒ¹ + cⁿ⁺ᵒ² + … = K × dᵉ. */
  const c = R.pick([2, 2, 3]);
  const offs = R.pick(c === 2 ? [[0, 1], [0, 1, 2], [1, 2], [0, 2], [1, 3], [0, 3], [2, 3], [0, 1, 3]] : [[0, 1], [0, 1, 2], [1, 2], [0, 2], [1, 3]]);
  const o0 = offs[0], K = somme(offs.map(o => pw(c, o - o0)));
  let d = c, l = 1, e = 10, n = 10;
  for (let essai = 0; essai < 60; essai++){
    const dd = R.pick(FAM[c].filter(y => y[1] >= 2)); d = dd[0]; l = dd[1]; e = R.int(3, 15); n = l * e - o0;
    if (n >= 2) break;
    d = c * c; l = 2; e = 10; n = 20 - o0;
  }
  const terme = o => c + sup('n' + (o ? '+' + o : ''));
  const q = offs.map(terme).join(' + ') + ' = ' + K + ' × ' + P(d, e) + '. Que vaut n ?';
  const facteur = c + sup('n' + (o0 ? '+' + o0 : ''));
  const expl = 'Mets la plus petite puissance ' + facteur + ' en facteur à gauche, écris le membre de droite en base ' + c + ', puis compare. ' +
    offs.map(terme).join(' + ') + ' = (' + offs.map(o => pw(c, o - o0)).join(' + ') + ') × ' + facteur + ' = ' + K + ' × ' + facteur + '. ' +
    'À droite, ' + P(d, e) + ' = (' + P(c, l) + ')' + sup(e) + ' = ' + P(c, l * e) + '. Donc ' + (o0 ? 'n + ' + o0 + ' = ' + (l * e) + ', soit n = ' + n : 'n = ' + n) +
    '. Piège : garder l\'exposant ' + e + ' sans passer en base ' + c + (o0 ? ', ou oublier le décalage + ' + o0 + ' de l\'exposant,' : '') + ' donne une valeur fausse.';
  return Qn(q, n, [o0 ? l * e : l * e - 1, e - o0, l * e - offs[offs.length - 1], n + 1], expl);
}
function n5Encadre(R){
  const v = R.int(0, 2);
  if (v < 2){
    const k = R.int(4, 15), q3 = Math.floor(k / 3), r = k % 3;
    const nmax = r === 0 ? 10 * q3 - 1 : r === 1 ? 10 * q3 + 3 : 10 * q3 + 6;
    const petit = v === 1, ans = petit ? nmax + 1 : nmax;
    const q = petit ? 'Quel est le plus petit entier n tel que 2ⁿ > ' + P(10, k) + ' ?' : 'Quel est le plus grand entier n tel que 2ⁿ < ' + P(10, k) + ' ?';
    const base = P(2, 10 * q3) + ' = (2¹⁰)' + sup(q3) + ' = 1' + ' ' + '024' + sup(q3) + ', un peu plus grand que 1' + ' ' + '000' + sup(q3) + ' = ' + P(10, 3 * q3);
    let corps;
    if (r === 0){
      corps = base + ' = ' + P(10, k) + ' : donc ' + P(2, 10 * q3) + ' > ' + P(10, k) + '. Sa moitié ' + P(2, 10 * q3 - 1) + ' vaut à peu près la moitié de ' + P(10, k) + ' (1,024' + sup(q3) + ' reste inférieur à 2), donc elle est plus petite que ' + P(10, k) + '.';
    } else if (r === 1){
      corps = base + ' (de moins de 13 %). ' + P(10, k) + ' = 10 × ' + P(10, 3 * q3) + '. Alors ' + P(2, 10 * q3 + 3) + ' = 8 × ' + P(2, 10 * q3) + ' reste inférieur à 10 × ' + P(10, 3 * q3) + ' (car 8 × 1,13 < 10), tandis que ' + P(2, 10 * q3 + 4) + ' = 16 × ' + P(2, 10 * q3) + ' dépasse ' + P(10, k) + '.';
    } else {
      corps = base + ' (de moins de 13 %). ' + P(10, k) + ' = 100 × ' + P(10, 3 * q3) + '. Alors ' + P(2, 10 * q3 + 6) + ' = 64 × ' + P(2, 10 * q3) + ' reste inférieur à 100 × ' + P(10, 3 * q3) + ' (car 64 × 1,13 < 100), tandis que ' + P(2, 10 * q3 + 7) + ' = 128 × ' + P(2, 10 * q3) + ' dépasse ' + P(10, k) + '.';
    }
    const expl = 'Pars de 2¹⁰ = 1' + ' ' + '024, à peine plus que 10³ = 1' + ' ' + '000, puis cherche les deux puissances de 2 consécutives qui encadrent ' + P(10, k) + '. ' + corps +
      ' Donc ' + P(2, nmax) + ' < ' + P(10, k) + ' < ' + P(2, nmax + 1) + ', et la réponse est ' + ans + '. Piège : prendre 2¹⁰ exactement égal à 10³ fait facilement rater d\'une unité ; c\'est l\'écart entre 1 024 et 1 000 qui tranche, et 2³ = 8 n\'est pas 10.';
    return Qn(q, ans, [Math.floor(10 * k / 3) + (petit ? 1 : 0), 3 * k, Math.round(10 * k / 3), ans + 1, ans - 1, 4 * k], expl);
  }
  /* Nombre de chiffres de bᵉ = 2¹⁰ᵐ. */
  let b = 2, i = 1, m = 5, e = 50;
  for (let essai = 0; essai < 60; essai++){
    const x = R.pick(FAM[2].concat([[32, 5]])); b = x[0]; i = x[1]; m = R.int(2, 9);
    if ((10 * m) % i === 0){ e = 10 * m / i; break; }
    b = 2; i = 1; m = 5; e = 50;
  }
  const ans = 3 * m + 1, naif = Math.floor(e * Math.log(2) / Math.log(10)) + 1;
  const expl = 'Ramène-toi à une puissance de 2¹⁰ = 1' + ' ' + '024, qui vaut à peine plus que 10³. ' + (i > 1 ? P(b, e) + ' = ' + P(2, 10 * m) + ' = ' : P(2, 10 * m) + ' = ') + '(2¹⁰)' + sup(m) + ' = 1' + ' ' + '024' + sup(m) +
    '. Ce nombre dépasse 1' + ' ' + '000' + sup(m) + ' = ' + P(10, 3 * m) + ', qui a ' + (3 * m + 1) + ' chiffres, mais reste inférieur à 2 × ' + P(10, 3 * m) + ' car 1,024' + sup(m) + ' < 2. Il s\'écrit donc avec un 1 en tête suivi de ' + (3 * m) + ' autres chiffres : ' + ans +
    ' chiffres. Piège : compter seulement 3 chiffres par facteur 1' + ' ' + '024 donne ' + (3 * m) + ' et oublie le chiffre de tête.';
  return Qn('Combien de chiffres a le nombre ' + P(b, e) + ' ?', ans, [3 * m, 3 * m + 2, i > 1 ? naif : null, Math.round(10 * m / 3), 4 * m], expl);
}
/* Quotients à numérateur de trois termes, entiers, listés une fois pour toutes. */
const QT = [];
[2, 3].forEach(b => {
  const pm = b === 2 ? 4 : 3;
  for (let p1 = 1; p1 < pm; p1++) for (let p2 = p1 + 1; p2 <= pm; p2++) for (const s1 of [1, -1]) for (const s0 of [1, -1]) for (let r = 1; r <= 3; r++) for (const sD of [1, -1]) for (let t = 0; t <= 2; t++){
    const A = pw(b, p2) + s1 * pw(b, p1) + s0, num = pw(b, t) * A, den = pw(b, r) + sD;
    if (A > 0 && den > 0 && num % den === 0 && num / den >= 2 && num / den <= 400) QT.push([b, p2, s1, p1, s0, r, sD, t, num / den]);
  }
});
function n5QuotTrois(R){
  const x = R.pick(QT), b = x[0], p2 = x[1], s1 = x[2], p1 = x[3], s0 = x[4], r = x[5], sD = x[6], t = x[7], ans = x[8];
  const m = R.int(t + 10, 60), md = m - t, sg = s => s > 0 ? ' + ' : ' − ';
  const q = 'Calcule (' + P(b, m + p2) + sg(s1) + P(b, m + p1) + sg(s0) + P(b, m) + ') ÷ (' + P(b, md + r) + sg(sD) + P(b, md) + ').';
  const An = pw(b, p2) + s1 * pw(b, p1) + s0, Bd = pw(b, r) + sD;
  const expl = 'Mets en facteur la plus petite puissance, en haut comme en bas, puis simplifie les puissances qui restent. ' +
    'En haut : (' + pw(b, p2) + sg(s1) + pw(b, p1) + sg(s0) + '1) × ' + P(b, m) + ' = ' + An + ' × ' + P(b, m) + '. En bas : (' + pw(b, r) + sg(sD) + '1) × ' + P(b, md) + ' = ' + Bd + ' × ' + P(b, md) + '. ' +
    finQuot(b, m, md, t, An, Bd, ans) + '. Piège : on ne simplifie pas une somme terme à terme, et le dernier terme ' + P(b, m) + ' compte pour 1 dans la parenthèse.';
  const lead = p2 - r + t >= 0 ? pw(b, p2 - r + t) : null;
  const sans1 = pw(b, t) * (pw(b, p2) + s1 * pw(b, p1));
  const autres = [lead, t && An % Bd === 0 ? An / Bd : null, sans1 % Bd === 0 ? sans1 / Bd : null, An, ans * b];
  return Qn(q, ans, autres, expl);
}
function n5Chiffres(R){
  const F2 = [[2, 1], [4, 2], [8, 3], [16, 4], [32, 5]], F5 = [[5, 1], [25, 2], [125, 3]];
  const ds = R.int(0, 1) === 1;
  let fs = [[4, 2, 6], [25, 2, 5], [125, 3, 3]], E2 = 12, E5 = 19;
  for (let essai = 0; essai < 200; essai++){
    const deux2 = R.int(0, 1) === 1;
    const L2 = R.shuffle(F2).slice(0, deux2 ? 2 : 1), L5 = R.shuffle(F5).slice(0, deux2 ? 1 : 2);
    const g = L2.concat(L5).map(x => [x[0], x[1], R.int(2, 12)]);
    if (g.every(x => x[1] === 1)) continue;
    const e2 = somme(g.filter(x => x[0] % 2 === 0).map(x => x[1] * x[2])), e5 = somme(g.filter(x => x[0] % 5 === 0).map(x => x[1] * x[2]));
    const d = e2 - e5;
    if (Math.min(e2, e5) < 8) continue;
    if (ds ? !((d >= 3 && d <= 10) || (d <= -2 && d >= -5)) : !(d >= -4 && d <= 8)) continue;
    fs = R.shuffle(g); E2 = e2; E5 = e5; break;
  }
  const r = chiffresProduit(E2, E5);
  const expr = fs.map(x => P(x[0], x[2])).join(' × ');
  const conv2 = fs.map(x => conv(x[0], x[1], x[0] % 2 === 0 ? 2 : 5, x[2])).join(' ; ');
  const methode = 'Écris chaque facteur avec des facteurs deux et cinq, forme les paquets « deux fois cinq » qui valent dix, puis regarde ce qui reste.';
  const corps = conv2 + '. Au total ' + P(2, E2) + ' × ' + P(5, E5) + ' : on forme ' + r.m + ' paquets et il ' + (r.d === 0 ? 'ne reste rien' : 'reste ' + (r.d > 0 ? P(2, r.d) : P(5, -r.d)) + ' = ' + n0(r.reste)) +
    '. Le nombre vaut donc ' + (r.d === 0 ? P(10, r.m) : n0(r.reste) + ' × ' + P(10, r.m)) + ', c\'est-à-dire ' + (r.d === 0 ? '1' : n0(r.reste)) + ' suivi de ' + r.m + ' zéros.';
  if (ds){
    const ans = sChiffres(r.reste);
    const voisin = k => r.d > 0 ? sChiffres(pw(2, r.d + k)) : sChiffres(pw(5, -r.d + k));
    const expl = methode + ' ' + corps + ' Les zéros ne comptent pas : la somme des chiffres est celle de ' + n0(r.reste) + ', soit ' + String(r.reste).split('').join(' + ') + ' = ' + ans +
      '. Piège : croire qu\'il ne reste que des 10 et répondre 1, ou se tromper d\'une puissance dans le reste.';
    return Qn('Quelle est la somme des chiffres du nombre ' + expr + ' ?', ans, [1, voisin(-1), voisin(1), Math.abs(r.d), longueur(r.reste)], expl);
  }
  const naif = chiffresProduit(somme(fs.filter(x => x[0] % 2 === 0).map(x => x[2])), somme(fs.filter(x => x[0] % 5 === 0).map(x => x[2])));
  const expl = methode + ' ' + corps + ' Il a donc ' + longueur(r.reste) + ' + ' + r.m + ' = ' + r.chiffres + ' chiffres. Piège : lire les exposants sans convertir les bases donnerait ' + naif.chiffres + ' chiffres.';
  return Qn('Combien de chiffres a le nombre ' + expr + ' ?', r.chiffres, [naif.chiffres, r.m + 1, E2 + E5, r.chiffres + 1, r.m], expl);
}

const NIV = {
  1: [n1Produit, n1Quotient, n1PuisPuis, n1Reconnaitre, n1Equation],
  2: [n2Base, n2Somme, n2Coef, n2Moitie, n2Mixte],
  3: [n3SommeBase, n3Facteur, n3Equation, n3Racine, n3Chiffres, n3Compare, n3CoefPuis, n3MoitieBase],
  4: [n4Coefs, n4Prod, n4Subst, n4Chiffres, n4QuotDeux, n4Decomp, n4Compare, n4Termes],
  5: [n5Compare, n5Deux, n5EqSomme, n5Encadre, n5QuotTrois, n5Chiffres]
};

A.push({
  id: 'alb-18-puissances',
  phase: 'albert',
  ordre: 18,
  theme: 'algebre',
  titre: 'Puissances et exposants : ramener à la même base',
  objectif: 'Réécrire des puissances dans une même base pour trouver un exposant, simplifier une somme ou un quotient, comparer de très grands nombres et compter leurs chiffres, sans calculatrice.',
  lecon:
`<p class="lede">Au test, les puissances arrivent avec des exposants énormes : 8²⁰, 4¹⁵ + 4¹⁵, 2¹⁰⁰. Impossible de les calculer, et c'est voulu. Tout tient en une idée : <mark>réécrire chaque nombre dans la même base</mark>, puis ne travailler que sur les exposants.</p>
<h2>Ce que le test te demande</h2>
<p>On te donne une expression pleine de puissances et tu dois l'écrire comme une seule puissance, trouver l'exposant n qui rend une égalité vraie, simplifier une somme ou un quotient, comparer des nombres géants ou compter les chiffres d'un produit. Tu n'as jamais besoin de calculer 3²⁰ en entier : la réponse se lit sur les exposants, avec quelques petits calculs de tête. Les questions difficiles mélangent deux bases (4 et 8, 9 et 27) ou cachent une somme de termes égaux.</p>
<h2>Les prérequis, en bref</h2>
<p>aⁿ veut dire a multiplié par lui-même n fois : 2⁵ = 2 × 2 × 2 × 2 × 2 = 32. Pour une même base a, quatre règles suffisent.</p>
<table class="tbl">
<thead><tr><th>Règle</th><th>Exemple</th></tr></thead>
<tbody>
<tr><td>aᵐ × aⁿ = aᵐ⁺ⁿ</td><td>2⁴ × 2³ = 2⁷</td></tr>
<tr><td>aᵐ ÷ aⁿ = aᵐ⁻ⁿ</td><td>5⁹ ÷ 5³ = 5⁶</td></tr>
<tr><td>(aᵐ)ⁿ = aᵐⁿ, on multiplie</td><td>(2³)⁴ = 2¹²</td></tr>
<tr><td>a⁰ = 1 et a¹ = a</td><td>7⁰ = 1</td></tr>
</tbody>
</table>
<p>Deux compléments utiles. Des puissances de même exposant se regroupent : aⁿ × bⁿ = (a × b)ⁿ, par exemple 2¹⁰ × 5¹⁰ = 10¹⁰. Et la racine carrée divise l'exposant par 2 : √(2²⁰) = 2¹⁰, car (2¹⁰)² = 2²⁰.</p>
<p>Connais par cœur les premières puissances, elles servent à reconnaître la base cachée :</p>
<table class="tbl">
<thead><tr><th>Base</th><th>Puissances successives</th></tr></thead>
<tbody>
<tr><td>2</td><td>2, 4, 8, 16, 32, 64, 128, 256, 512, 1 024</td></tr>
<tr><td>3</td><td>3, 9, 27, 81, 243, 729</td></tr>
<tr><td>5</td><td>5, 25, 125, 625</td></tr>
</tbody>
</table>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je repère la base commune :</strong> 4, 8, 16, 32 sont des puissances de 2 ; 9, 27, 81 des puissances de 3 ; 25 et 125 des puissances de 5.</p>
<p><strong>2. Je réécris tout dans cette base :</strong> 8⁵ = (2³)⁵ = 2¹⁵, et un coefficient aussi : 4 = 2².</p>
<p><strong>3. Je transforme les sommes :</strong> une somme de termes égaux est un produit (3⁷ + 3⁷ + 3⁷ = 3 × 3⁷ = 3⁸) ; une somme de puissances différentes se factorise par la plus petite (2¹² + 2¹⁰ = (4 + 1) × 2¹⁰ = 5 × 2¹⁰).</p>
<p><strong>4. Je conclus sur les exposants :</strong> si 2ᵖ = 2ᵠ, alors p = q. Pour comparer, je ramène tout au même exposant et je compare les bases.</p>
</div>
<h2>Exemples résolus</h2>
<h3>1. Changer de base</h3>
<p>27⁵ = 3ⁿ. Comme 27 = 3³, on a 27⁵ = (3³)⁵ = 3¹⁵, donc n = 15, et non 3 + 5 = 8.</p>
<h3>2. Une somme de termes égaux</h3>
<p>4⁹ + 4⁹ + 4⁹ + 4⁹ = 2ⁿ. Quatre termes égaux font 4 × 4⁹ = 4¹⁰. Puis 4¹⁰ = (2²)¹⁰ = 2²⁰, donc n = 20. Additionner les exposants serait faux : c'est une somme, pas un produit.</p>
<h3>3. Mettre en facteur</h3>
<p>Calcule (3¹⁴ + 3¹²) ÷ 3¹². On écrit 3¹⁴ = 9 × 3¹², donc la parenthèse vaut (9 + 1) × 3¹² = 10 × 3¹², et le quotient vaut 10.</p>
<h3>4. Comparer des géants</h3>
<p>Lequel est le plus grand : 2⁶⁰, 3⁴⁰ ou 5²⁰ ? Les exposants sont des multiples de 20 : 2⁶⁰ = (2³)²⁰ = 8²⁰ et 3⁴⁰ = (3²)²⁰ = 9²⁰. Même exposant, donc on compare les bases 8, 9 et 5 : c'est 3⁴⁰, alors que 2⁶⁰ a le plus grand exposant.</p>
<h3>5. Compter les chiffres</h3>
<p>Combien de chiffres a 4⁷ × 5¹² ? On a 4⁷ = 2¹⁴ = 2² × 2¹², donc le produit vaut 4 × 2¹² × 5¹² = 4 × 10¹² : un 4 suivi de 12 zéros, soit 13 chiffres.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl">
<thead><tr><th>Tu vois</th><th>Tu penses</th></tr></thead>
<tbody>
<tr><td>8, 16, 32, 64</td><td>2³, 2⁴, 2⁵, 2⁶</td></tr>
<tr><td>2ⁿ + 2ⁿ</td><td>2 × 2ⁿ = 2ⁿ⁺¹</td></tr>
<tr><td>la moitié de 2³⁰</td><td>2²⁹, ni 2¹⁵ ni 1³⁰</td></tr>
<tr><td>2¹² + 2¹⁰</td><td>(4 + 1) × 2¹⁰</td></tr>
<tr><td>2ᵃ × 5ᵇ</td><td>des paquets 2 × 5 = 10</td></tr>
<tr><td>2ˣ = 5, que vaut 4ˣ⁺¹ ?</td><td>4ˣ⁺¹ = 4 × (2ˣ)² = 4 × 25 = 100</td></tr>
<tr><td>2¹⁰</td><td>1 024, à peine plus que 10³</td></tr>
</tbody>
</table>
<div class="box astuce"><p class="box-t">Astuce</p><p>Réécris chaque nombre comme une puissance de la même base (2, 3 ou 5), transforme les sommes en produits, puis raisonne uniquement sur les exposants.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>2³ + 2³ = 2⁴, pas 2⁶ : on n'additionne les exposants que dans un produit. 4 × 16¹⁵ n'est pas 64¹⁵ : le coefficient ne passe pas sous l'exposant, et 4 × 16¹⁵ = 2² × 2⁶⁰ = 2⁶². (2³)² = 2⁶, pas 2⁹. La moitié de 2²⁰ est 2¹⁹. a⁰ vaut 1, pas 0. Le plus grand exposant ne donne pas forcément le plus grand nombre.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Même base : on additionne les exposants pour un produit, on les soustrait pour un quotient, on les multiplie pour une puissance de puissance. Une somme de k termes égaux vaut k fois le terme. Pour comparer, même exposant, puis on compare les bases. 2¹⁰ = 1 024, à peine plus que 10³.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(NIV[n])(R);
      if (ex && typeof ex.q === 'string' && Array.isArray(ex.choix) && ex.choix.length === 4) return ex;
    } catch (e) { /*repli*/ }
    /*repli2*/
    return n1Produit(R);
  }
});

})();
