/* ===== Maths · Objectif Albert School : alb-12 · Courbes : intersections, positions, régions du plan =====
   Piste séparée window.ALBERT_SKILLS (jamais SKILLS). Une IIFE, aucun symbole de premier niveau.
   Idée centrale : points communs = solutions de f(x) = g(x) ; position = signe de f(x) − g(x) ;
   régions = 2 pour la première courbe infinie, puis chaque courbe infinie ajoute (points distincts de rencontre + 1),
   et un cercle tracé en dernier ajoute (points distincts de rencontre), ou 1 s'il ne touche rien.
   Toutes les réponses sont CALCULÉES : moteur d'intersections exact (coefficients entiers, discriminant entier,
   racines rationnelles) et comptage incrémental des régions. N'utilise que R.int, R.pick, R.shuffle.
   Niveau inconnu : borné. gen ne lève jamais d'exception (repli fixe en cas d'erreur imprévue). */
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

/* ---------- écriture ---------- */
const M = '−';
const z = n => (n < 0 ? M + Math.abs(n) : String(n));
const par = n => (n < 0 ? '(' + z(n) + ')' : String(n));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function pgcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a || 1; }
const listeEt = l => l.length <= 1 ? l.join('') : l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1];
const nPts = k => k === 1 ? 'un point' : k + ' points';
/* Réel → écriture exacte simple (entier, fraction de petit dénominateur, ±√n), sinon null. */
function ecr(x){
  if (Math.abs(x - Math.round(x)) < 1e-9) return z(Math.round(x));
  for (let q = 2; q <= 12; q++){ const p = Math.round(x * q); if (Math.abs(x - p / q) < 1e-9){ const g = pgcd(p, q); return z(p / g) + '/' + (q / g); } }
  const c = x * x, n = Math.round(c);
  if (Math.abs(c - n) < 1e-7) return (x < 0 ? M : '') + '√' + n;
  return null;
}
const pt = (x, y) => { const a = ecr(x), b = ecr(y); return a === null || b === null ? null : '(' + a + ' ; ' + b + ')'; };
const P2 = (x, y) => '(' + z(x) + ' ; ' + z(y) + ')';
/* Polynôme c[0] + c[1]x + c[2]x² + c[3]x³ écrit « x³ − 7x + 6 ». */
function poly(c){
  const sup = ['', 'x', 'x²', 'x³']; let s = '';
  for (let i = 3; i >= 0; i--){
    const a = c[i] || 0; if (!a) continue;
    const m = Math.abs(a), corps = i === 0 ? String(m) : (m === 1 ? '' : String(m)) + sup[i];
    s += !s ? (a < 0 ? M : '') + corps : (a < 0 ? ' − ' : ' + ') + corps;
  }
  return s || '0';
}
/* Calcul détaillé de c(x) : « (−2)² + 3 × (−2) − 1 = 4 − 6 − 1 = −3 ». */
function calc(c, x){
  const P = par(x), ex = [], vs = [];
  for (let i = 3; i >= 0; i--){
    const a = c[i] || 0; if (!a) continue;
    const m = Math.abs(a);
    ex.push([a < 0, i === 0 ? String(m) : (m === 1 ? '' : m + ' × ') + P + (i === 2 ? '²' : i === 3 ? '³' : '')]);
    vs.push(a * Math.pow(x, i));
  }
  const joint = l => l.map((t, j) => j === 0 ? (t[0] ? M : '') + t[1] : (t[0] ? ' − ' : ' + ') + t[1]).join('');
  const s1 = joint(ex), s2 = joint(vs.map(v => [v < 0, String(Math.abs(v))])), r = z(val(c, x));
  if (!ex.length) return '0';
  let out = s1;
  if (s2 !== s1) out += ' = ' + s2;
  if (vs.length > 1) out += ' = ' + r;
  return out;
}

/* ---------- polynômes à coefficients entiers ---------- */
function deg(c){ for (let i = 3; i >= 0; i--) if (c[i]) return i; return -1; }
const sub = (a, b) => [0, 1, 2, 3].map(i => (a[i] || 0) - (b[i] || 0));
const val = (c, x) => (c[0] || 0) + x * ((c[1] || 0) + x * ((c[2] || 0) + x * (c[3] || 0)));
function diviseurs(n){ n = Math.abs(n); const l = []; for (let d = 1; d <= n; d++) if (n % d === 0) l.push(d); return l; }
function rac2(c0, c1, c2){
  const D = c1 * c1 - 4 * c2 * c0;
  if (D < 0) return [];
  if (D === 0) return [{x: -c1 / (2 * c2), m: 2}];
  const s = Math.sqrt(D); return [{x: (-c1 - s) / (2 * c2), m: 1}, {x: (-c1 + s) / (2 * c2), m: 1}];
}
function fusion(l){
  const r = [];
  l.forEach(p => { const q = r.find(u => Math.abs(u.x - p.x) < 1e-9); if (q) q.m += p.m; else r.push({x: p.x, m: p.m}); });
  return r.sort((a, b) => a.x - b.x);
}
/* Racines réelles distinctes avec multiplicité (degré ≤ 3, coefficients entiers). */
function racines(c){
  const d = deg(c);
  if (d < 1) return [];
  if (d === 1) return [{x: -c[0] / c[1], m: 1}];
  if (d === 2) return fusion(rac2(c[0], c[1], c[2]));
  if (c[0] === 0){
    const q = [c[1], c[2], c[3]];
    const reste = deg(q) === 2 ? rac2(q[0], q[1], q[2]) : deg(q) === 1 ? [{x: -q[0] / q[1], m: 1}] : [{x: 0, m: 2}];
    return fusion([{x: 0, m: 1}].concat(reste));
  }
  for (const p of diviseurs(c[0])) for (const q of diviseurs(c[3])) for (const s of [1, -1]){
    const P = s * p;
    if (c[3] * P * P * P + c[2] * P * P * q + c[1] * P * q * q + c[0] * q * q * q === 0){
      const r = P / q, b2 = c[3], b1 = c[2] + r * b2, b0 = c[1] + r * b1;
      return fusion([{x: r, m: 1}].concat(rac2(b0, b1, b2)));
    }
  }
  /* pas de racine rationnelle : racines simples, balayage puis dichotomie */
  const l = []; let x0 = -200, v0 = val(c, x0);
  for (let i = 1; i <= 40000; i++){
    const x1 = -200 + i * 0.01, v1 = val(c, x1);
    if (v0 === 0) l.push({x: x0, m: 1});
    else if (v0 * v1 < 0){ let a = x0, b = x1; for (let k = 0; k < 60; k++){ const m = (a + b) / 2; if (val(c, a) * val(c, m) <= 0) b = m; else a = m; } l.push({x: (a + b) / 2, m: 1}); }
    x0 = x1; v0 = v1;
  }
  return fusion(l);
}
function facto(E, rs){
  const d = deg(E); if (d < 1) return null;
  if (rs.reduce((s, u) => s + u.m, 0) !== d) return null;
  if (!rs.every(u => Math.abs(u.x - Math.round(u.x)) < 1e-9)) return null;
  const lead = E[d];
  let s = lead === 1 ? '' : lead === -1 ? M : String(lead);
  const ord = rs.slice().sort((u, v) => (Math.round(u.x) === 0 ? -1 : 0) - (Math.round(v.x) === 0 ? -1 : 0) || u.x - v.x);
  ord.forEach(u => {
    const r = Math.round(u.x), e = u.m === 2 ? '²' : u.m === 3 ? '³' : '';
    s += r === 0 ? 'x' + e : '(x ' + (r > 0 ? '− ' + r : '+ ' + (-r)) + ')' + e;
  });
  return s;
}

/* ---------- courbes ---------- */
const G = c => ({k: 'G', c: [c[0] || 0, c[1] || 0, c[2] || 0, c[3] || 0]});   // y = polynôme
const V = x => ({k: 'V', x: x});                                               // x = constante
const C = r => ({k: 'C', r: r});                                               // cercle de centre O, rayon r
const cle = c => c.k + (c.k === 'V' ? c.x : c.k === 'C' ? c.r : c.c.join(','));
const distinctes = L => new Set(L.map(cle)).size === L.length;
const degC = c => c.k === 'V' ? 1 : c.k === 'C' ? 2 : deg(c.c);
function eq(c){ return c.k === 'V' ? 'x = ' + z(c.x) : c.k === 'C' ? 'x² + y² = ' + c.r * c.r : 'y = ' + poly(c.c); }
function nom(c){
  if (c.k === 'C') return 'le cercle de rayon ' + c.r;
  const d = degC(c);
  return (d <= 1 ? 'la droite ' : d === 2 ? 'la parabole ' : 'la courbe ') + eq(c);
}
const pente = c => c.k === 'V' ? 'V' : c.c[1];

/* Points communs à deux courbes : [{x, y, t}] (t : contact sans traversée, racine multiple). */
function inter(a, b){
  if (a.k === 'C' && b.k === 'C') return [];
  if (a.k === 'C' || b.k === 'C'){
    const ce = a.k === 'C' ? a : b, d = a.k === 'C' ? b : a, r2 = ce.r * ce.r;
    if (d.k === 'V'){
      const e = r2 - d.x * d.x;
      if (e < 0) return [];
      if (e === 0) return [{x: d.x, y: 0, t: true}];
      const s = Math.sqrt(e); return [{x: d.x, y: -s, t: false}, {x: d.x, y: s, t: false}];
    }
    const p = d.c[1], q = d.c[0];
    return racines([q * q - r2, 2 * p * q, 1 + p * p]).map(u => ({x: u.x, y: p * u.x + q, t: u.m > 1}));
  }
  if (a.k === 'V' && b.k === 'V') return [];
  if (a.k === 'V' || b.k === 'V'){ const v = a.k === 'V' ? a : b, g = a.k === 'V' ? b : a; return [{x: v.x, y: val(g.c, v.x), t: false}]; }
  return racines(sub(a.c, b.c)).map(u => ({x: u.x, y: val(a.c, u.x), t: u.m > 1}));
}
const proche = (u, v) => Math.abs(u.x - v.x) < 1e-7 && Math.abs(u.y - v.y) < 1e-7;

/* Régions bornées : Euler sur le graphe formé des seuls morceaux finis (arêtes entre points communs). */
function bornees(L){
  const S = [], E = []; let isoles = 0;
  const idx = p => { let i = S.findIndex(u => proche(u, p)); if (i < 0){ S.push(p); i = S.length - 1; } return i; };
  L.forEach((c, i) => {
    const pts = [];
    L.forEach((d, j) => { if (j !== i) inter(c, d).forEach(p => { if (!pts.some(u => proche(u, p))) pts.push(p); }); });
    if (c.k === 'C'){
      if (!pts.length){ isoles++; return; }
      pts.sort((u, v) => Math.atan2(u.y, u.x) - Math.atan2(v.y, v.x));
      const ids = pts.map(idx); ids.forEach((v, t) => E.push([v, ids[(t + 1) % ids.length]]));
    } else {
      pts.sort((u, v) => c.k === 'V' ? u.y - v.y : u.x - v.x);
      const ids = pts.map(idx); for (let t = 0; t + 1 < ids.length; t++) E.push([ids[t], ids[t + 1]]);
    }
  });
  const pa = S.map((_, i) => i), f = i => pa[i] === i ? i : (pa[i] = f(pa[i]));
  E.forEach(e => { pa[f(e[0])] = f(e[1]); });
  const comp = S.filter((_, i) => f(i) === i).length;
  return E.length - S.length + comp + isoles;
}

/* Comptage incrémental des régions. Les courbes infinies d'abord, le cercle en dernier.
   brut : chaque point compté une fois par courbe rencontrée (oubli des points communs à trois courbes).
   sansPlus : chaque courbe ajoute k au lieu de k + 1. ordreLibre : on garde l'ordre donné (cercle d'abord = erreur). */
function decoupe(liste, ordreLibre){
  const L = ordreLibre ? liste.slice() : liste.filter(c => c.k !== 'C').concat(liste.filter(c => c.k === 'C'));
  let total = 1, brut = 1, sansPlus = 1; const det = [];
  L.forEach((c, i) => {
    const pts = []; let b = 0;
    for (let j = 0; j < i; j++) inter(c, L[j]).forEach(p => { b++; const q = pts.find(u => proche(u, p)); if (q){ q.n++; q.t = q.t || p.t; } else pts.push({x: p.x, y: p.y, n: 1, t: p.t}); });
    const k = pts.length, ferme = c.k === 'C';
    const add = ferme ? Math.max(k, 1) : k + 1;
    total += add; brut += ferme ? Math.max(b, 1) : b + 1; sansPlus += i === 0 ? 1 : (ferme ? Math.max(k, 1) : k);
    pts.sort((u, v) => u.x - v.x || u.y - v.y);
    det.push({c, k, b, add, pts});
  });
  return {total, brut, sansPlus, det, ordre: L, bornees: bornees(L)};
}
/* Explication pas à pas du comptage. */
function explReg(D){
  const s = [], morceaux = [];
  D.det.forEach((e, i) => {
    const N = cap(nom(e.c));
    if (i === 0){ s.push(N + ' seule coupe le plan en 2 régions.'); morceaux.push(2); return; }
    const liste = e.pts.map(p => pt(p.x, p.y)), lp = e.k && liste.every(x => x) ? ', ' + listeEt(liste) : '';
    let ph;
    if (e.c.k === 'C') ph = e.k ? N + ', tracé en dernier, rencontre les droites en ' + nPts(e.k) + (e.k > 1 ? ' distincts' : '') + lp + ' : il est découpé en ' + e.k + ' arc' + (e.k > 1 ? 's' : '') + ', d\'où +' + e.add + '.'
                            : N + ', tracé en dernier, ne touche aucune droite : il ajoute 1 région, son intérieur.';
    else if (!e.k) ph = N + ' ne rencontre aucune des courbes déjà tracées : un seul morceau, d\'où +1.';
    else ph = N + ' rencontre les courbes déjà tracées en ' + nPts(e.k) + (e.k > 1 ? ' distincts' : '') + lp + ' : elle a ' + (e.k + 1) + ' morceaux, d\'où +' + e.add + '.';
    if (e.b > e.k) ph += ' Un point commun à plusieurs courbes ne compte qu\'une fois.';
    if (e.pts.some(p => p.t)) ph += ' Un point de contact, même sans traversée, coupe la courbe en deux morceaux.';
    s.push(ph); morceaux.push(e.add);
  });
  return s.join(' ') + ' Total : ' + morceaux.join(' + ') + ' = ' + D.total + ' régions.';
}
/* Résolution détaillée de f(x) = g(x) pour deux graphes. */
function resout(a, b){
  const D = sub(a.c, b.c), d = deg(D), eqn = poly(a.c) + ' = ' + poly(b.c);
  if (d < 0) return eqn + ' : courbes confondues.';
  if (d === 0) return eqn + ' est impossible : ' + (deg(a.c) <= 1 && deg(b.c) <= 1 ? 'les droites sont parallèles' : 'les termes en x s\'éliminent et il reste ' + z(a.c[0]) + ' = ' + z(b.c[0]) + ', ce qui est faux') + '.';
  const sg = D[d] < 0 ? -1 : 1, E = D.map(v => v * sg), rs = racines(E);
  let t = eqn === poly(E) + ' = 0' ? eqn : eqn + ' ⟺ ' + poly(E) + ' = 0';
  if (!rs.length){
    if (d === 2 && !E[1]) return t + ' ⟺ x² = ' + ecr(-E[0] / E[2]) + ', impossible car un carré n\'est jamais négatif.';
    return t + ', sans solution (Δ = ' + z(E[1] * E[1] - 4 * E[2] * E[0]) + ', négatif).';
  }
  const f = facto(E, rs);
  if (f && f !== poly(E) && d > 1) t += ' ⟺ ' + f + ' = 0';
  const sols = rs.map(u => ecr(u.x));
  if (sols.some(x => x === null)) return t + ' : Δ = ' + z(E[1] * E[1] - 4 * E[2] * E[0]) + ', positif, donc deux solutions.';
  t += rs.length === 1 ? ', donc x = ' + sols[0] + ' seulement' : ', donc x = ' + sols.slice(0, -1).join(', x = ') + ' ou x = ' + sols[sols.length - 1];
  const mult = rs.filter(u => u.m > 1);
  if (mult.length) t += ' (x = ' + ecr(mult[0].x) + ' est une solution ' + (mult[0].m === 2 ? 'double' : 'triple') + ', un seul point commun à cet endroit)';
  return t + '.';
}

/* ---------- sorties QCM ---------- */
/* Réponse entière : distracteurs [valeur, texte du piège avec # pour la valeur], puis voisins. */
function sortie(q, bonne, pieges, expl, min){
  const lo = min == null ? 1 : min;
  const ok = pieges.filter(p => p && typeof p[0] === 'number' && isFinite(p[0]) && Math.round(p[0]) === p[0] && p[0] >= lo && p[0] !== bonne);
  const choix = qcm(nb(bonne), ok.map(p => nb(p[0])), k => { const v = bonne + (k % 2 ? (k + 1) / 2 : -k / 2); return v >= lo ? nb(v) : null; });
  const txt = [], dits = new Set();
  ok.forEach(p => { const s = nb(p[0]); if (p[1] && choix.indexOf(s) > 0 && !dits.has(s) && txt.length < 2){ dits.add(s); txt.push(p[1].replace('#', s)); } });
  return {q, a: nb(bonne), accept: null, choix, expl: expl + (txt.length ? ' ' + txt.join(' ') : '')};
}
/* Réponse texte : distracteurs [texte, piège], puis voisins. */
function sortieT(q, bonne, pieges, expl, voisin){
  const ok = pieges.filter(p => p && p[0] && norm(p[0]) !== norm(bonne));
  const choix = qcm(bonne, ok.map(p => p[0]), voisin);
  const txt = [], dits = new Set();
  ok.forEach(p => { if (p[1] && choix.indexOf(p[0]) > 0 && !dits.has(p[1]) && txt.length < 2){ dits.add(p[1]); txt.push(p[1]); } });
  return {q, a: bonne, accept: null, choix, expl: expl + (txt.length ? ' ' + txt.join(' ') : '')};
}
const dehors = (a, b) => 'x < ' + z(a) + ' ou x > ' + z(b);
const entre = (a, b) => z(a) + ' < x < ' + z(b);
const METHODE_REG = 'On trace les courbes une par une : la première coupe le plan en 2 régions, puis chaque nouvelle courbe infinie ajoute autant de régions qu\'elle a de morceaux, c\'est-à-dire son nombre de points distincts de rencontre avec les courbes déjà tracées, plus 1.';

/* =====================================================
   NIVEAU 1 : découverte
   ===================================================== */

/* Parabole y = ax² et droite horizontale y = k. */
function n1Horiz(R){
  const t = R.int(1, 10);
  let a = 1, s = 0, k;
  if (t <= 5){ s = R.int(2, 12); k = s * s; }
  else if (t <= 7){ a = R.pick([2, 3, 4]); s = R.int(2, a === 2 ? 6 : 4); k = a * s * s; }
  else k = -R.pick([1, 2, 3, 4, 5, 7, 8, 9, 10, 16, 25, 36, 49, 64]);
  const Px = (a === 1 ? '' : a) + 'x²';
  const q = R.int(0, 1) ? 'La parabole d\'équation y = ' + Px + ' et la droite d\'équation y = ' + z(k) + ' ont-elles des points communs ? Si oui, quelles sont leurs abscisses ?'
                        : 'Combien de points communs ont la droite d\'équation y = ' + z(k) + ' et la parabole d\'équation y = ' + Px + ', et quelles sont leurs abscisses ?';
  const deux = v => 'deux points, d\'abscisses ' + M + v + ' et ' + v;
  const un = v => 'un seul point, d\'abscisse ' + v;
  const AUCUN = 'aucun point';
  const rac = n => { const r = Math.round(Math.sqrt(n)); return r * r === n ? String(r) : '√' + n; };
  const debut = 'On remplace y par ' + z(k) + ' dans l\'équation de la parabole, puis on résout l\'équation obtenue.';
  if (k > 0){
    const etape = a === 1 ? 'x² = ' + k : a + 'x² = ' + k + ' donne x² = ' + s * s + ', qui';
    const expl = debut + ' ' + etape + ' a deux solutions, x = ' + s + ' et x = ' + M + s + ', car ' + s + '² = (' + M + s + ')² = ' + s * s + '. La droite coupe donc la parabole en deux points symétriques, (' + M + s + ' ; ' + k + ') et (' + s + ' ; ' + k + ').';
    return sortieT(q, deux(String(s)), [
      [un(String(s)), 'Piège : un nombre positif a deux racines carrées, une positive et une négative, d\'où deux points symétriques.'],
      [a === 1 ? deux(nb(k / 2)) : deux(rac(k)), a === 1 ? 'Piège : la racine carrée de ' + k + ' n\'est pas sa moitié.' : 'Piège : il faut d\'abord diviser par ' + a + ', puis prendre la racine carrée.'],
      [deux(String(s * s)), 'Piège : x² = ' + s * s + ' donne x = ' + s + ' ou x = ' + M + s + ', pas ' + s * s + '.']
    ], expl, j => j === 1 ? AUCUN : deux(String(s + j)));
  }
  const m = -k, r = rac(m);
  const expl = debut + ' x² = ' + z(k) + ' n\'a aucune solution, car un carré n\'est jamais négatif : la parabole est tout entière au-dessus de l\'axe des abscisses, et la droite passe sous son sommet (0 ; 0). Il n\'y a aucun point commun.';
  return sortieT(q, AUCUN, [
    [deux(r), 'Piège : ' + r + ' et ' + M + r + ' ont pour carré ' + m + ', pas ' + z(k) + '.'],
    [un(M + r), 'Piège : (' + M + r + ')² = ' + m + ' ; un carré est toujours positif.'],
    [un('0'), null]
  ], expl, j => deux(String(j)));
}

/* Point d'intersection de deux droites. */
function n1Inter(R){
  let x0 = 2, y0 = 5, a1 = 3, a2 = -1, b1 = -1, b2 = 7;
  for (let e = 0; e < 60; e++){
    const X = R.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), Y = R.int(-8, 12);
    const p1 = R.pick([-3, -2, -1, 1, 2, 3, 4]), p2 = R.pick([-3, -2, -1, 0, 1, 2, 3]);
    const c1 = Y - p1 * X, c2 = Y - p2 * X;
    if (p1 !== p2 && Math.abs(c1) <= 15 && Math.abs(c2) <= 15 && X !== Y && c1 !== 0){ x0 = X; y0 = Y; a1 = p1; a2 = p2; b1 = c1; b2 = c2; break; }
  }
  if (R.int(0, 1)){ let t = a1; a1 = a2; a2 = t; t = b1; b1 = b2; b2 = t; }
  const d1 = poly([b1, a1]), d2 = poly([b2, a2]);
  const q = R.int(0, 1) ? 'Les droites d\'équations y = ' + d1 + ' et y = ' + d2 + ' se coupent en un point. Quelles sont ses coordonnées ?'
                        : 'Quel est le point d\'intersection des droites d\'équations y = ' + d1 + ' et y = ' + d2 + ' ?';
  const bonne = P2(x0, y0);
  const yCalc = (a, b, x) => a === 0 ? z(b) : calc([b, a], x);
  const expl = 'On cherche l\'abscisse x pour laquelle les deux expressions sont égales, puis on calcule l\'ordonnée avec l\'une des deux équations. ' +
    d1 + ' = ' + d2 + ' donne ' + poly([0, a1 - a2]) + ' = ' + z(b2 - b1) + (Math.abs(a1 - a2) !== 1 || a1 - a2 < 0 ? ', donc x = ' + z(x0) : '') + '. Puis y = ' + yCalc(a1, b1, x0) + '. Vérification avec l\'autre droite : ' + yCalc(a2, b2, x0) + ' aussi. Le point est ' + bonne + '.';
  const a0 = a1 !== 0 ? a1 : a2, c0 = a1 !== 0 ? b1 : b2;
  return sortieT(q, bonne, [
    [P2(y0, x0), 'Piège : dans (x ; y), l\'abscisse vient en premier.'],
    [P2(-x0, a0 * -x0 + c0), 'Piège : erreur de signe en passant un terme de l\'autre côté du signe égal.'],
    [c0 ? P2(x0, a0 * x0 - c0) : null, null]
  ], expl, j => P2(x0, y0 + (j % 2 ? (j + 1) / 2 : -j / 2)));
}

/* Régions formées par deux droites. */
function n1Reg2(R){
  const t = R.int(1, 6); let L, para = '';
  const autre = b => { let c = R.int(-6, 6); for (let e = 0; e < 10 && c === b; e++) c = R.int(-6, 6); return c === b ? b + 3 : c; };
  if (t === 1){ const a = R.pick([-3, -2, -1, 1, 2, 3, 4]), b = R.int(-6, 6); L = [G([b, a]), G([autre(b), a])]; para = 'Les deux droites ont le même coefficient directeur, ' + z(a) + ' : elles sont parallèles et ne se coupent jamais.'; }
  else if (t === 2){ const b = R.int(-6, 6); L = [G([b]), G([autre(b)])]; para = 'Deux droites horizontales sont parallèles : elles ne se coupent jamais.'; }
  else if (t === 3){ const b = R.int(-6, 6); L = [V(b), V(autre(b))]; para = 'Deux droites verticales sont parallèles : elles ne se coupent jamais.'; }
  else if (t === 4) L = [G([R.int(-6, 6)]), V(R.int(-6, 6))];
  else if (t === 5){ const a = R.pick([-3, -2, -1, 1, 2, 3]), c = R.pick([-3, -2, -1, 1, 2, 3, 4].filter(x => x !== a)); L = [G([R.int(-6, 6), a]), G([R.int(-6, 6), c])]; }
  else L = [G([R.int(-6, 6), R.pick([-3, -2, -1, 1, 2, 3])]), V(R.int(-5, 5))];
  L = R.shuffle(L);
  const D = decoupe(L), n = D.total;
  const q = 'En combien de régions les droites d\'équations ' + eq(L[0]) + ' et ' + eq(L[1]) + ' découpent-elles le plan ?';
  let expl = 'Une droite seule coupe le plan en 2 régions ; une deuxième droite ajoute autant de régions qu\'elle a de morceaux, c\'est-à-dire son nombre de points de rencontre avec la première, plus 1. ';
  if (n === 3) expl += para + ' La deuxième droite n\'a qu\'un morceau : 2 + 1 = 3 régions, deux demi-plans et la bande entre les deux droites.';
  else { const p = D.det[1].pts[0]; expl += 'Les deux droites ne sont pas parallèles : elles se coupent en un point' + (pt(p.x, p.y) ? ', ' + pt(p.x, p.y) : '') + '. La deuxième droite a donc 2 morceaux : 2 + 2 = 4 régions.'; }
  return sortie(q, n, [
    [n === 3 ? 4 : 3, n === 3 ? 'Piège : # régions, c\'est le cas de deux droites qui se croisent ; deux parallèles ne se croisent pas.' : 'Piège : # régions, c\'est le cas de deux droites parallèles.'],
    [2, 'Piège : répondre #, c\'est oublier que la deuxième droite coupe à son tour des régions.'], [n + 2, null]
  ], expl);
}

/* Lequel de ces points est sur la courbe ? */
function n1Point(R){
  const t = R.int(1, 4); let c, x0;
  if (t === 1){ c = [R.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), 0, 1]; x0 = R.pick([-4, -3, -2, -1, -3, -2, 2, 3]); }
  else if (t === 2){ c = [R.int(1, 9), 0, -1]; x0 = R.pick([-3, -2, -1, 1, 2, 3]); }
  else if (t === 3){ c = [0, R.pick([-4, -3, -2, -1, 1, 2, 3, 4]), 1]; x0 = R.pick([-3, -2, -1, 1, 2, 3]); }
  else { c = [R.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), R.pick([-3, -2, 2, 3, 4]), 0]; x0 = R.pick([-3, -2, -1, 1, 2, 3, 4]); }
  const y0 = val(c, x0), sur = (x, y) => val(c, x) === y;
  const cand = [];
  if (t <= 3 && x0 < 0) cand.push([x0, val([c[0], c[1], -c[2]], x0), 'Piège : ' + par(x0) + '² = ' + x0 * x0 + ', le carré d\'un nombre négatif est positif.']);
  if (t <= 3) cand.push([x0, val([c[0], c[1] + 2 * c[2], 0], x0), 'Piège : x² signifie x × x, pas 2 × x.']);
  cand.push([y0, x0, 'Piège : dans un point (a ; b), a est l\'abscisse x et b l\'ordonnée y.']);
  if (c[1]) cand.push([x0, val([c[0], -c[1], c[2]], x0), x0 < 0 ? 'Piège : attention au signe du terme en x quand x est négatif.' : null]);
  if (c[0]) cand.push([x0, val([-c[0], c[1], c[2]], x0), null]);
  if (t === 4) cand.push([x0, c[1] + x0 + c[0], null]);
  const ok = cand.filter(u => !sur(u[0], u[1]));
  const bonne = P2(x0, y0), d = degC(G(c));
  const q = R.int(0, 1) ? 'Quelles sont les coordonnées du point d\'abscisse ' + z(x0) + ' situé sur ' + (d === 1 ? 'la droite' : 'la parabole') + ' d\'équation y = ' + poly(c) + ' ?'
                        : 'Un point de ' + (d === 1 ? 'la droite' : 'la parabole') + ' d\'équation y = ' + poly(c) + ' a pour abscisse ' + z(x0) + '. Quelles sont ses coordonnées ?';
  const expl = 'On remplace x par l\'abscisse dans l\'équation pour obtenir l\'ordonnée, puis on écrit le point sous la forme (abscisse ; ordonnée). Pour x = ' + z(x0) + ' : y = ' + calc(c, x0) + '. Le point est donc ' + bonne + '. Les autres choix ne vérifient pas l\'équation.';
  return sortieT(q, bonne, ok.map(u => [P2(u[0], u[1]), u[2]]), expl, j => P2(x0, y0 + (j % 2 ? (j + 1) / 2 : -j / 2)));
}

/* =====================================================
   NIVEAU 2 : maîtrise
   ===================================================== */

/* Parabole et droite passant par son point sur l'axe des ordonnées : factoriser par x. */
function n2Origine(R){
  const t = R.int(1, 6);
  let a = 1, c = 0, m;
  if (t <= 3) m = R.pick([-6, -5, -4, -3, -2, -1, 1, 3, 4, 5, 6, 7, 8]);
  else if (t === 4){ a = 2; m = R.pick([-6, -4, -2, 2, 4, 6, 8]); }
  else if (t === 5){ a = -1; m = R.pick([-5, -4, -3, -2, 2, 3, 4, 5]); }
  else { c = R.pick([-4, -3, -2, -1, 1, 2, 3, 5]); m = R.pick([-4, -3, -2, 2, 3, 4, 5]); }
  const P = [c, 0, a], Dr = [c, m], x1 = m / a, y1 = val(P, x1);
  const bonne = P2(0, c) + ' et ' + P2(x1, y1);
  const q = 'En quels points la parabole d\'équation y = ' + poly(P) + ' et la droite d\'équation y = ' + poly(Dr) + ' se coupent-elles ?';
  const expl = 'On écrit que les deux ordonnées sont égales, on ramène tout du même côté et on factorise par x, sans jamais diviser par x. ' +
    poly(P) + ' = ' + poly(Dr) + ' ⟺ ' + poly([0, -m, a]) + ' = 0 ⟺ x(' + poly([-m, a]) + ') = 0. Un produit est nul quand l\'un de ses facteurs est nul : x = 0 ou x = ' + z(x1) + '. Avec l\'équation de la droite : pour x = 0, y = ' + z(c) + ' ; pour x = ' + z(x1) + ', y = ' + calc(Dr, x1) + '. Les deux points sont ' + bonne + '.';
  return sortieT(q, bonne, [
    [P2(x1, y1) + ' seulement', 'Piège : diviser par x fait perdre la solution x = 0.'],
    [P2(0, c) + ' et ' + P2(-x1, val(P, -x1)), 'Piège : erreur de signe en résolvant ' + poly([-m, a]) + ' = 0.'],
    c !== 0 ? [P2(0, 0) + ' et ' + P2(x1, y1), 'Piège : le premier point est sur l\'axe des ordonnées en (0 ; ' + z(c) + '), pas à l\'origine.'] : [P2(0, 0) + ' et ' + P2(y1, x1), 'Piège : dans (x ; y), l\'abscisse vient en premier.']
  ], expl, j => P2(0, c) + ' et ' + P2(x1, y1 + j));
}

const PENTES = ['V', 0, 1, -1, 2, -2, 3, -3];
const parPoint = (p, q, s) => s === 'V' ? V(p) : G([q - s * p, s]);
function droiteAlea(R){ const f = R.int(1, 6); if (f === 1) return V(R.int(-4, 4)); if (f === 2) return G([R.int(-4, 4)]); return G([R.int(-5, 5), R.pick([-3, -2, -1, 1, 2, 3])]); }

/* Régions formées par trois droites. */
function n2Reg3(R){
  let L = null; const t = R.int(1, 20);
  for (let e = 0; e < 60 && !L; e++){
    let T = null;
    if (t <= 7){ const p = R.int(-3, 3), q = R.int(-3, 3); T = R.shuffle(PENTES).slice(0, 3).map(s => parPoint(p, q, s)); }
    else if (t <= 12){ T = [droiteAlea(R), droiteAlea(R), droiteAlea(R)]; if (new Set(T.map(pente)).size < 3 || decoupe(T).total !== 7) T = null; }
    else if (t <= 18){
      const s = R.pick(PENTES), b = R.int(-4, 4), b2 = R.int(-4, 4);
      if (b2 !== b){ const s3 = R.pick(PENTES.filter(x => x !== s)); T = (s === 'V' ? [V(b), V(b2)] : [G([b, s]), G([b2, s])]).concat([s3 === 'V' ? V(R.int(-4, 4)) : G([R.int(-4, 4), s3])]); }
    } else { const s = R.pick(PENTES); T = R.shuffle([-4, -3, -2, -1, 0, 1, 2, 3, 4]).slice(0, 3).map(b => s === 'V' ? V(b) : G([b, s])); }
    if (T && distinctes(T)) L = R.shuffle(T);
  }
  if (!L) L = [G([0, 1]), G([0, -1]), G([3])];
  const D = decoupe(L), n = D.total;
  const q = 'En combien de régions les droites d\'équations ' + eq(L[0]) + ', ' + eq(L[1]) + ' et ' + eq(L[2]) + ' découpent-elles le plan ?';
  return sortie(q, n, [
    [7, 'Piège : # est le nombre de régions de trois droites sans parallèles ni point commun aux trois ; ici, la figure est particulière.'],
    [D.brut, 'Piège : répondre # revient à compter plusieurs fois le point où passent les trois droites.'],
    [D.bornees, 'Piège : répondre #, c\'est ne compter que les régions fermées et oublier les régions infinies.'],
    [6, null], [8, null]
  ], METHODE_REG + ' ' + explReg(D));
}

/* Position : où une courbe est-elle au-dessus de l'autre ? */
function n2Position(R){
  const dessus = R.int(0, 1) === 1, mot = dessus ? 'strictement au-dessus' : 'strictement au-dessous', sgn = dessus ? ' > ' : ' < ';
  if (R.int(0, 1)){
    let a1 = 2, a2 = -1, x0 = 2, b1 = 1, b2 = 7;
    for (let e = 0; e < 60; e++){
      const p1 = R.pick([-3, -2, -1, 1, 2, 3, 4]), p2 = R.pick([-3, -2, -1, 0, 1, 2, 3]), X = R.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), c1 = R.int(-8, 8), c2 = c1 + (p1 - p2) * X;
      if (p1 !== p2 && Math.abs(c2) <= 15){ a1 = p1; a2 = p2; x0 = X; b1 = c1; b2 = c2; break; }
    }
    const d = a1 - a2, e = b2 - b1, plus = (d > 0) === dessus, dir = plus ? ' > ' : ' < ', inv = plus ? ' < ' : ' > ';
    const bonne = 'x' + dir + z(x0);
    const q = 'Pour quelles valeurs de x la droite d\'équation y = ' + poly([b1, a1]) + ' est-elle ' + mot + ' de la droite d\'équation y = ' + poly([b2, a2]) + ' ?';
    const xt = plus ? x0 + 1 : x0 - 1;
    const expl = 'On écrit l\'inégalité entre les deux expressions, on regroupe les x d\'un côté, puis on divise en surveillant le signe du nombre par lequel on divise. ' +
      poly([b1, a1]) + sgn + poly([b2, a2]) + ' ⟺ ' + poly([0, d]) + sgn + z(e) + (d !== 1 ? ' ⟺ ' + bonne : '') + (d < 0 ? ' (on divise par ' + z(d) + ', un nombre négatif, donc le sens de l\'inégalité change)' : '') +
      '. Vérification en x = ' + z(xt) + ' : la première droite donne ' + z(val([b1, a1], xt)) + ' et la seconde ' + z(val([b2, a2], xt)) + '.';
    return sortieT(q, bonne, [
      ['x' + inv + z(x0), d < 0 ? 'Piège : en divisant par un nombre négatif, il faut changer le sens de l\'inégalité.' : 'Piège : c\'est l\'ensemble où la première droite est de l\'autre côté.'],
      ['x' + dir + z(-x0), 'Piège : erreur de signe en passant un terme de l\'autre côté.'],
      Math.abs(d) !== 1 ? ['x' + dir + z(e), 'Piège : il fallait encore diviser par ' + z(d) + '.'] : null
    ], expl, j => 'x' + dir + z(x0 + j));
  }
  const s = R.int(1, 9), c = R.pick([0, 0, 0, -3, -2, -1, 1, 2, 4]), k = c + s * s, Pc = [c, 0, 1];
  const bonne = dessus ? dehors(-s, s) : entre(-s, s);
  const q = 'Pour quelles valeurs de x la parabole d\'équation y = ' + poly(Pc) + ' est-elle ' + mot + ' de la droite d\'équation y = ' + z(k) + ' ?';
  const expl = 'On cherche d\'abord où les deux courbes se rencontrent, puis on regarde laquelle est au-dessus entre ces points et à l\'extérieur. ' +
    (c ? poly(Pc) + ' = ' + z(k) + ' ⟺ ' : '') + 'x² = ' + s * s + ' ⟺ x = ' + M + s + ' ou x = ' + s + '. En x = 0, entre les deux, la parabole vaut ' + z(c) + ', sous la droite ; en x = ' + (s + 1) + ', à l\'extérieur, elle vaut ' + z(val(Pc, s + 1)) + ', au-dessus. La parabole est donc ' + mot + ' de la droite pour ' + bonne + '.';
  return sortieT(q, bonne, [
    [dessus ? entre(-s, s) : dehors(-s, s), 'Piège : entre les deux points de rencontre, c\'est la droite qui est au-dessus de la parabole.'],
    [dessus ? 'x > ' + s : 'x < ' + s, 'Piège : il ne faut pas oublier les valeurs négatives de x.'],
    s > 1 ? [dessus ? dehors(-s * s, s * s) : entre(-s * s, s * s), 'Piège : x² = ' + s * s + ' donne x = ' + M + s + ' ou x = ' + s + ', il faut prendre la racine carrée.'] : null
  ], expl, j => dessus ? dehors(-s - j, s + j) : entre(-s - j, s + j));
}

/* Points de rencontre d'une parabole avec les axes. */
function n2Axes(R){
  const t = R.int(1, 3);
  const fac = r => r === 0 ? 'x' : '(x ' + (r > 0 ? '− ' + r : '+ ' + (-r)) + ')';
  if (t === 1){
    const s = R.int(1, 10), Pc = [-s * s, 0, 1];
    const q = 'En quels points la parabole d\'équation y = ' + poly(Pc) + ' coupe-t-elle l\'axe des abscisses ?';
    const bonne = P2(-s, 0) + ' et ' + P2(s, 0);
    const expl = 'Sur l\'axe des abscisses, y = 0 : on résout donc ' + poly(Pc) + ' = 0. Cela donne x² = ' + s * s + ', soit x = ' + M + s + ' ou x = ' + s + '. Les points sont ' + bonne + '.';
    return sortieT(q, bonne, [
      [P2(s, 0) + ' seulement', 'Piège : x² = ' + s * s + ' a aussi la solution négative ' + M + s + '.'],
      [P2(0, -s * s), 'Piège : ' + P2(0, -s * s) + ' est le point de l\'axe des ordonnées, pas de l\'axe des abscisses.'],
      s > 1 ? [P2(-s * s, 0) + ' et ' + P2(s * s, 0), 'Piège : il faut prendre la racine carrée de ' + s * s + '.'] : null
    ], expl, j => P2(-s - j, 0) + ' et ' + P2(s + j, 0));
  }
  let r1 = R.int(-6, 6), r2 = R.int(-6, 6);
  for (let e = 0; e < 40 && (r1 === r2 || r1 === -r2 || (t === 3 && r1 * r2 === 0)); e++){ r1 = R.int(-6, 6); r2 = R.int(-6, 6); }
  if (r1 === r2 || r1 === -r2 || (t === 3 && r1 * r2 === 0)){ r1 = 2; r2 = -5; }
  const a = R.pick([1, 1, 1, 2, -1]);
  const expr = (a === 1 ? '' : a === -1 ? M : String(a)) + (r1 === 0 ? 'x' + fac(r2) : r2 === 0 ? 'x' + fac(r1) : fac(r1) + fac(r2));
  const u = Math.min(r1, r2), v = Math.max(r1, r2);
  if (t === 2){
    const q = 'En quels points la parabole d\'équation y = ' + expr + ' coupe-t-elle l\'axe des abscisses ?';
    const bonne = P2(u, 0) + ' et ' + P2(v, 0);
    const expl = 'Sur l\'axe des abscisses, y = 0 : on résout « produit = 0 », qui est vrai quand l\'un des facteurs est nul. ' +
      [r1, r2].map(r => r === 0 ? 'x = 0' : fac(r).slice(1, -1) + ' = 0 donne x = ' + z(r)).join(' ; ') + '. Les points sont ' + bonne + '.';
    return sortieT(q, bonne, [
      [P2(-v, 0) + ' et ' + P2(-u, 0), 'Piège : x − a s\'annule pour x = a, et x + a pour x = −a : attention aux signes.'],
      r1 * r2 !== 0 ? [P2(0, a * r1 * r2), 'Piège : ' + P2(0, a * r1 * r2) + ' est le point de l\'axe des ordonnées.'] : [P2(r1 || r2, 0) + ' seulement', 'Piège : le facteur x s\'annule aussi, donc x = 0 est une solution.'],
      [P2(Math.min(r1, -r2), 0) + ' et ' + P2(Math.max(r1, -r2), 0), null]
    ], expl, j => P2(u, 0) + ' et ' + P2(v + j, 0));
  }
  const y0 = a * r1 * r2;
  const q = 'En quel point la parabole d\'équation y = ' + expr + ' coupe-t-elle l\'axe des ordonnées ?';
  const bonne = P2(0, y0);
  const expl = 'Sur l\'axe des ordonnées, x = 0 : on remplace x par 0 dans l\'équation. y = ' + (a === 1 ? '' : a === -1 ? M : a + ' × ') + '(0 ' + (r1 > 0 ? '− ' + r1 : '+ ' + (-r1)) + ')(0 ' + (r2 > 0 ? '− ' + r2 : '+ ' + (-r2)) + ') = ' + (a === 1 ? '' : a === -1 ? M : a + ' × ') + par(-r1) + ' × ' + par(-r2) + ' = ' + z(y0) + '. Le point est ' + bonne + '.';
  return sortieT(q, bonne, [
    y0 !== 0 ? [P2(0, -y0), 'Piège : attention aux signes : (0 − a)(0 − b) = a × b.'] : null,
    [P2(u, 0) + ' et ' + P2(v, 0), 'Piège : ce sont les points de l\'axe des abscisses (y = 0), pas de l\'axe des ordonnées.'],
    [P2(0, -a * (r1 + r2)), null], [P2(0, a * (r1 + r2)), null]
  ], expl, j => P2(0, y0 + (j % 2 ? (j + 1) / 2 : -j / 2)));
}

/* =====================================================
   NIVEAU 3 : niveau des exemples officiels
   ===================================================== */

/* Régions : une parabole et une droite. */
function n3ParDroite(R){
  const tp = R.int(1, 8);
  let a = 1, c = 0;
  if (tp === 6) c = R.pick([-4, -3, -2, -1, 1, 2, 3]);
  if (tp === 7){ a = -1; c = R.pick([0, 1, 2, 4, -1]); }
  if (tp === 8) a = 2;
  const P = G([c, 0, a]);
  let Ld, cas;
  const tl = R.int(1, 6);
  if (tl === 1){ Ld = G([R.pick(a > 0 ? [c + 1, c + 4, c + 9, c + 2, c, c - 1, c - 4] : [c - 1, c - 4, c, c + 2, c + 1])]); cas = 'h'; }
  else if (tl === 2){ Ld = V(R.pick([-3, -2, -1, 0, 1, 2, 3])); cas = 'v'; }
  else if (tl === 3){ Ld = G([c, R.pick([-4, -3, -2, -1, 1, 2, 3, 4]) * (a === 2 ? 2 : 1)]); cas = 'o'; }
  else if (tl === 4 && a !== 2){ const t = R.pick([-3, -2, -1, 1, 2, 3]); Ld = G([c - a * t * t, 2 * a * t]); cas = 't'; }
  else { const r1 = R.int(-3, 2), r2 = R.int(r1 + 1, 4); Ld = G([c - a * r1 * r2, a * (r1 + r2)]); cas = 's'; }
  if (a === 1 && c === 0 && Ld.k === 'G' && Ld.c[0] === 0 && Ld.c[1] === 2) Ld = G([0, 3]);   // jamais l'exemple officiel
  const L = [P, Ld], D = decoupe(L), n = D.total, k = D.det[1].k;
  const q = R.int(0, 1) ? 'En combien de régions la parabole d\'équation y = ' + poly(P.c) + ' et la droite d\'équation ' + eq(Ld) + ' découpent-elles le plan ?'
                        : 'La parabole d\'équation y = ' + poly(P.c) + ' et la droite d\'équation ' + eq(Ld) + ' partagent le plan en plusieurs régions, bornées ou non. Combien ?';
  const calcul = Ld.k === 'V' ? 'Une droite verticale coupe la parabole en un seul point : ' + pt(Ld.x, val(P.c, Ld.x)) + '.' : 'Points communs : ' + resout(P, Ld);
  const expl = 'On compte courbe par courbe : la parabole seule fait 2 régions, l\'intérieur et l\'extérieur du U, puis la droite ajoute autant de régions que de morceaux, c\'est-à-dire son nombre de points communs avec la parabole, plus 1. ' + calcul + ' ' + explReg(D).replace(/^La parabole [^.]* seule coupe le plan en 2 régions\. /, '');
  const pieges = [];
  if (k === 2){ pieges.push([D.sansPlus, 'Piège : répondre #, c\'est oublier le +1 : deux points découpent la droite en trois morceaux.'], [D.bornees, 'Piège : répondre #, c\'est ne compter que la région fermée entre la droite et la parabole ; les régions infinies comptent aussi.']); }
  if (k === 1) pieges.push([n + 1, cas === 'v' ? 'Piège : répondre # supposerait deux points communs ; une droite verticale ne coupe la parabole qu\'une fois.' : 'Piège : répondre # supposerait que la droite traverse la parabole en deux points ; elle la touche en un seul point.'], [n - 1, 'Piège : répondre #, c\'est oublier que le point de contact coupe quand même la droite en deux morceaux.']);
  if (k === 0) pieges.push([n + 2, 'Piège : répondre # supposerait deux points communs ; ici la droite ne touche pas la parabole.'], [2, 'Piège : répondre #, c\'est oublier que la droite, même sans toucher la parabole, coupe une région en deux.']);
  pieges.push([3, null], [4, null], [5, null], [6, null]);
  return sortie(q, n, pieges, expl);
}

/* Régions : quatre droites, avec parallèles ou points communs à plusieurs droites. */
function n3Reg4(R){
  let L = null;
  const cfg = R.pick(['grille', 'etoile', 'trois1', 'paires', 'par3', 'general', 'sommet', 'trois1']);
  for (let e = 0; e < 60 && !L; e++){
    let T = null;
    if (cfg === 'grille'){ const h = R.shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, 2), v = R.shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, 2); T = [G([h[0]]), G([h[1]]), V(v[0]), V(v[1])]; }
    else if (cfg === 'etoile'){ const p = R.int(-2, 2), q = R.int(-2, 2); T = R.shuffle(PENTES).slice(0, 4).map(s => parPoint(p, q, s)); }
    else if (cfg === 'trois1'){ const p = R.int(-2, 2), q = R.int(-2, 2); T = R.shuffle(PENTES).slice(0, 3).map(s => parPoint(p, q, s)); const d = droiteAlea(R); T.push(d); if (inter(d, T[0]).some(u => proche(u, {x: p, y: q})) || d.k === 'V' && d.x === p) T = null; }
    else if (cfg === 'paires'){ const s = R.shuffle(PENTES).slice(0, 2), b = R.shuffle([-3, -2, -1, 0, 1, 2, 3]); T = [parPoint(b[0], b[0], s[0]), parPoint(b[1], b[1], s[0]), parPoint(b[2], -b[2], s[1]), parPoint(b[3], -b[3], s[1])]; }
    else if (cfg === 'par3'){ const s = R.pick(PENTES), b = R.shuffle([-4, -3, -2, -1, 0, 1, 2, 3, 4]).slice(0, 3); T = b.map(x => s === 'V' ? V(x) : G([x, s])); T.push(droiteAlea(R)); if (pente(T[3]) === s) T = null; }
    else if (cfg === 'general'){ T = [droiteAlea(R), droiteAlea(R), droiteAlea(R), droiteAlea(R)]; }
    else { T = [droiteAlea(R), droiteAlea(R), droiteAlea(R)]; if (new Set(T.map(pente)).size < 3 || decoupe(T).total !== 7) T = null; else { const I = inter(T[0], T[1])[0]; if (!I || Math.abs(I.x - Math.round(I.x)) > 1e-9 || Math.abs(I.y - Math.round(I.y)) > 1e-9) T = null; else { const s = R.pick(PENTES.filter(x => x !== pente(T[0]) && x !== pente(T[1]) && x !== pente(T[2]))); T.push(parPoint(Math.round(I.x), Math.round(I.y), s)); } } }
    if (T && distinctes(T)) L = R.shuffle(T);
  }
  if (!L) L = [G([0, 1]), G([0, -1]), V(0), G([2])];
  const D = decoupe(L), n = D.total;
  const q = 'En combien de régions les quatre droites d\'équations ' + listeEt(L.map(eq)) + ' découpent-elles le plan ?';
  return sortie(q, n, [
    [11, 'Piège : # est le maximum, pour quatre droites sans parallèles ni point commun à trois d\'entre elles ; ici, la figure est particulière.'],
    [D.brut, 'Piège : répondre # revient à compter plusieurs fois un point par lequel passent plus de deux droites.'],
    [D.bornees, 'Piège : répondre #, c\'est ne compter que les régions fermées et oublier les régions infinies.'],
    [8, null], [10, null], [9, null]
  ], METHODE_REG + ' ' + explReg(D));
}

/* Abscisses des points communs d'une parabole et d'une droite (racines entières). */
function constrPD(R){
  for (let e = 0; e < 80; e++){
    const r1 = R.int(-5, 5), r2 = R.int(-5, 6), b = R.int(-4, 4), c = R.int(-6, 6);
    if (r1 >= r2) continue;
    const m = b + r1 + r2, p = c - r1 * r2;
    if (Math.abs(m) > 8 || Math.abs(p) > 15 || (m === 0 && p === 0) || r1 + r2 === 0) continue;
    return {r1, r2, b, c, m, p};
  }
  return {r1: -1, r2: 3, b: -1, c: 0, m: 1, p: 3};
}
function n3Abscisses(R){
  const s = constrPD(R), P = [s.c, s.b, 1], Dr = [s.p, s.m];
  const q = 'La parabole d\'équation y = ' + poly(P) + ' et la droite d\'équation y = ' + poly(Dr) + ' se coupent en deux points. Quelles sont leurs abscisses ?';
  const X = (u, v) => u === v ? null : 'x = ' + z(Math.min(u, v)) + ' et x = ' + z(Math.max(u, v));
  const bonne = X(s.r1, s.r2), S = s.r1 + s.r2, Pr = s.r1 * s.r2;
  const expl = 'On égale les deux expressions et on ramène tout d\'un côté pour obtenir une équation du second degré, que l\'on factorise (ou on teste les valeurs proposées dans les deux équations). ' +
    resout(G(P), G(Dr)) + ' Astuce : x² + Bx + C = (x − a)(x − b) quand a + b = −B et a × b = C ; ici, somme ' + z(S) + ' et produit ' + z(Pr) + '. Vérification en x = ' + z(s.r1) + ' : la parabole donne ' + z(val(P, s.r1)) + ' et la droite aussi.';
  return sortieT(q, bonne, [
    [X(-s.r1, -s.r2), 'Piège : (x − a)(x − b) = 0 donne x = a ou x = b, sans changer les signes.'],
    Pr !== 0 ? [X(0, S), 'Piège : on a oublié le terme constant en regroupant tout d\'un côté.'] : null,
    X(s.r1, -s.r2) ? [X(s.r1, -s.r2), null] : null, X(-s.r1, s.r2) ? [X(-s.r1, s.r2), null] : null
  ], expl, j => X(s.r1, s.r2 + j) || X(s.r1 - j, s.r2));
}

/* Position d'une parabole par rapport à une droite (signe d'un trinôme factorisé). */
function n3Position(R){
  const s = constrPD(R), bas = R.int(1, 3) === 1;   // parabole tournée vers le bas : y = −x² + …
  let Pc, Dr;
  if (!bas){ Pc = [s.c, s.b, 1]; Dr = [s.p, s.m]; }
  else { Pc = [-s.c, -s.b, -1]; Dr = [-s.p, -s.m]; }   // −(x² + bx + c) − (−(mx + p)) = −(x − r1)(x − r2)
  const dessus = R.int(0, 1) === 1, mot = dessus ? 'strictement au-dessus' : 'strictement au-dessous';
  const exterieur = dessus !== bas;   // parabole − droite = ±(x − r1)(x − r2)
  const bonne = exterieur ? dehors(s.r1, s.r2) : entre(s.r1, s.r2);
  const q = 'Pour quelles valeurs de x la parabole d\'équation y = ' + poly(Pc) + ' est-elle ' + mot + ' de la droite d\'équation y = ' + poly(Dr) + ' ?';
  const mil = s.r2 - s.r1 >= 2 ? s.r1 + 1 : null, ext = s.r2 + 1;
  const diff = sub(Pc, Dr);
  const expl = 'On étudie le signe de la différence « parabole moins droite » : on la factorise, puis on utilise la règle du trinôme (signe du coefficient de x² à l\'extérieur des racines, signe contraire entre les racines). ' +
    'Différence : ' + poly(diff) + ' = ' + facto(diff, [{x: s.r1, m: 1}, {x: s.r2, m: 1}]) + ', qui s\'annule en x = ' + z(s.r1) + ' et x = ' + z(s.r2) + '. ' +
    (mil !== null ? 'En x = ' + z(mil) + ' (entre les racines), la différence vaut ' + z(val(diff, mil)) + ' ; ' : '') + 'en x = ' + z(ext) + ' (à l\'extérieur), elle vaut ' + z(val(diff, ext)) + '. ' +
    'La parabole est donc ' + mot + ' de la droite pour ' + bonne + '.';
  return sortieT(q, bonne, [
    [exterieur ? entre(s.r1, s.r2) : dehors(s.r1, s.r2), 'Piège : c\'est l\'ensemble où la parabole est de l\'autre côté de la droite ; un test avec une valeur simple évite cette confusion.'],
    [exterieur ? dehors(-s.r2, -s.r1) : entre(-s.r2, -s.r1), 'Piège : erreur de signe sur les racines.'],
    exterieur ? ['x > ' + z(s.r2), 'Piège : il y a deux zones où la parabole est au-dessus, de part et d\'autre des points communs.'] : ['x < ' + z(s.r2), null]
  ], expl, j => exterieur ? dehors(s.r1 - j, s.r2) : entre(s.r1 - j, s.r2));
}

/* Nombre de points communs à deux paraboles. */
function n3DeuxPar(R){
  const t = R.int(1, 5); let P1, P2c, piege = null;
  if (t === 1 || t === 5){
    const c1 = R.int(-4, 4), d = R.pick([2, 8, 18, 2, 8, 0, -2, -4, -6, -8]);
    P1 = [c1, 0, 1]; P2c = [c1 + d, 0, -1];
    if (d === 0) piege = 'Piège : x² = 0 n\'a qu\'une solution, x = 0 : les deux paraboles se touchent en un seul point.';
  } else if (t === 2){
    const b1 = R.int(-4, 4); let b2 = R.int(-4, 4); if (b2 === b1) b2 = b1 + R.pick([-3, 2, 5]);
    P1 = [R.int(-5, 5), b1, 1]; P2c = [R.int(-5, 5), b2, 1];
    piege = 'Piège : les termes en x² s\'éliminent ; il reste une équation du premier degré, donc un seul point commun.';
  } else if (t === 3){
    const b = R.int(-4, 4), c1 = R.int(-5, 5); let c2 = R.int(-5, 5); if (c2 === c1) c2 = c1 + R.pick([-3, 2, 4]);
    P1 = [c1, b, 1]; P2c = [c2, b, 1];
    piege = 'Piège : les deux paraboles sont superposables, l\'une est l\'autre décalée verticalement ; elles ne se rencontrent jamais.';
  } else {
    const a1 = R.pick([1, 2, 3]), a2 = R.pick([1, 2, 3].filter(x => x !== a1)), w = R.pick([1, 4, 9, 0, -1, -4]), c1 = R.int(-4, 4);
    P1 = [c1, 0, a1]; P2c = [c1 + (a1 - a2) * w, 0, a2];
  }
  if (R.int(0, 1)){ const x = P1; P1 = P2c; P2c = x; }
  const n = racines(sub(P1, P2c)).length;
  const q = 'Combien de points communs ont les paraboles d\'équations y = ' + poly(P1) + ' et y = ' + poly(P2c) + ' ?';
  const expl = 'On résout l\'équation « première expression = deuxième expression » : chaque solution donne un point commun. ' + resout(G(P1), G(P2c)) + (n === 0 ? ' Il n\'y a donc aucun point commun.' : n === 1 ? ' Il y a donc un seul point commun.' : ' Il y a donc ' + n + ' points communs.') + (piege ? ' ' + piege : '');
  const choix = qcm(String(n), ['0', '1', '2', '4'], k => String(k + 4));
  return {q, a: String(n), accept: null, choix, expl};
}

/* =====================================================
   NIVEAU 4 : plus dur que les exemples officiels
   ===================================================== */

/* Droites « lisibles » face à la parabole y = x². */
function lignePour(R){
  const f = R.int(1, 6);
  if (f === 1) return G([R.pick([1, 4, 9, 0, -1, -4, 2, 3])]);
  if (f === 2) return V(R.int(-3, 3));
  if (f === 3) return G([0, R.pick([-3, -2, -1, 1, 2, 3])]);
  if (f === 4){ const t = R.pick([-2, -1, 1, 2]); return G([-t * t, 2 * t]); }
  if (f === 5){ const r1 = R.int(-3, 2), r2 = R.int(r1 + 1, 3); return G([-r1 * r2, r1 + r2]); }
  return G([R.pick([-3, -2, -1]), R.pick([-1, 1])]);
}
/* Droites passant par le point (t ; t²) de la parabole. */
function passantPar(R, t){
  const r = R.pick([-3, -2, -1, 0, 1, 2, 3].filter(x => x !== t));
  return R.shuffle([V(t), G([t * t]), G([0, t]), G([-t * t, 2 * t]), G([-t * r, t + r])]);
}
function explParabole(P, L){
  return L.filter(d => d.k !== 'V').map(d => 'Avec ' + nom(d) + ' : ' + resout(P, d)).join(' ');
}
/* Régions : la parabole y = x² et deux droites. */
function n4Par2(R){
  const P = G([0, 0, 1]); let L = null;
  for (let e = 0; e < 60 && !L; e++){
    let T;
    if (R.int(1, 10) <= 4){ const t = R.pick([-2, -1, 1, 2]); T = passantPar(R, t).slice(0, 2); }
    else T = [lignePour(R), lignePour(R)];
    if (distinctes([P].concat(T))) L = T;
  }
  if (!L) L = [V(2), G([4])];
  const D = decoupe([P].concat(L)), n = D.total;
  const q = 'En combien de régions la parabole d\'équation y = x² et les droites d\'équations ' + eq(L[0]) + ' et ' + eq(L[1]) + ' découpent-elles le plan ?';
  const expl = METHODE_REG + ' ' + explParabole(P, L) + ' ' + explReg(D);
  return sortie(q, n, [
    [D.brut, 'Piège : répondre # revient à compter deux fois un point par lequel passent trois des courbes.'],
    [D.sansPlus, 'Piège : répondre #, c\'est oublier le +1 : une courbe coupée en k points a k + 1 morceaux.'],
    [D.bornees, 'Piège : répondre #, c\'est ne compter que les régions fermées et oublier les régions infinies.'],
    [9, null], [n + 1, null], [n - 1, null]
  ], expl);
}

/* Droites décrites par des mots. */
function n4Mots(R){
  const t = R.int(1, 5);
  const C2 = n => n * (n - 1) / 2;
  if (t === 1 || t === 5){
    const n = R.int(4, 8), rep = 1 + n + C2(n);
    const q = t === 1 ? 'On trace ' + n + ' droites dans le plan. Aucune n\'est parallèle à une autre, et trois d\'entre elles ne passent jamais par un même point. En combien de régions ces droites découpent-elles le plan ?'
                      : 'Avec ' + n + ' coupes droites, combien de morceaux peut-on obtenir, au maximum, dans une pizza ronde, sans déplacer les morceaux entre deux coupes ?';
    const somme = []; for (let i = 1; i <= n; i++) somme.push(i);
    const expl = 'On ajoute les droites une par une : la k-ième droite rencontre les k − 1 précédentes en k − 1 points distincts, elle a donc k morceaux et ajoute k régions. ' +
      (t === 5 ? 'Le maximum est atteint quand deux coupes se croisent toujours, dans la pizza, et jamais trois au même point. ' : '') +
      'On part de 1 région (le plan entier) : 1 + ' + somme.join(' + ') + ' = 1 + ' + n * (n + 1) / 2 + ' = ' + rep + '.';
    return sortie(q, rep, [
      [2 * n, 'Piège : répondre # supposerait que toutes les ' + (t === 5 ? 'coupes passent par le centre' : 'droites passent par un même point') + '.'],
      [n * (n + 1) / 2, 'Piège : répondre #, c\'est oublier la région de départ, le plan entier avant la première ' + (t === 5 ? 'coupe' : 'droite') + '.'],
      [1 + n + 2 * C2(n), 'Piège : répondre #, c\'est compter chaque croisement deux fois.'],
      n <= 6 ? [Math.pow(2, n), 'Piège : répondre #, c\'est supposer que chaque droite double le nombre de régions ; c\'est faux dès la troisième.'] : null
    ], expl);
  }
  if (t === 2){
    const p = R.int(2, 4), n = R.int(p + 2, 7), rep = 1 + n + C2(n) - C2(p);
    const q = 'On trace ' + n + ' droites dans le plan. Exactement ' + p + ' d\'entre elles sont parallèles entre elles ; aucune des autres n\'est parallèle à une autre droite, et trois droites ne passent jamais par un même point. En combien de régions ces ' + n + ' droites découpent-elles le plan ?';
    const adds = []; for (let i = 1; i <= n - p; i++) adds.push(p + i);
    const expl = 'On trace d\'abord les droites parallèles, puis les autres une par une : chaque nouvelle droite ajoute son nombre de points de rencontre avec les droites déjà tracées, plus 1. ' +
      'Les ' + p + ' parallèles découpent le plan en ' + (p + 1) + ' bandes. Chaque autre droite coupe toutes celles déjà tracées : elle ajoute ' + listeEt(adds.map(String)) + ' régions. Total : ' + (p + 1) + ' + ' + adds.join(' + ') + ' = ' + rep + '.';
    return sortie(q, rep, [
      [1 + n + C2(n), 'Piège : # est le résultat sans droites parallèles ; des parallèles ne se coupent pas.'],
      [rep - p + 1, null], [2 * n, null], [rep + 1, null]
    ], expl);
  }
  if (t === 3){
    const h = R.int(2, 5), v = R.int(2, 5), obl = R.int(0, 2) > 0, grille = (h + 1) * (v + 1), rep = grille + (obl ? h + v + 1 : 0), N = h + v + (obl ? 1 : 0);
    const q = 'On trace ' + h + ' droites horizontales et ' + v + ' droites verticales' + (obl ? ', puis une droite oblique qui ne passe par aucun des points où elles se croisent' : '') + '. En combien de régions ces ' + N + ' droites découpent-elles le plan ?';
    const expl = 'Les droites horizontales découpent le plan en bandes, puis les verticales coupent chaque bande en morceaux : on multiplie' + (obl ? ', et on ajoute enfin les morceaux de la droite oblique' : '') + '. ' + h + ' horizontales donnent ' + (h + 1) + ' bandes ; ' + v + ' verticales coupent chaque bande en ' + (v + 1) + ' morceaux : ' + (h + 1) + ' × ' + (v + 1) + ' = ' + grille + ' régions.' +
      (obl ? ' La droite oblique coupe chacune des ' + (h + v) + ' autres droites, en des points tous différents puisqu\'elle évite les croisements : elle a ' + (h + v + 1) + ' morceaux et ajoute ' + (h + v + 1) + ' régions. Total : ' + grille + ' + ' + (h + v + 1) + ' = ' + rep + '.' : '');
    return sortie(q, rep, obl ? [
      [grille + h + v, 'Piège : répondre #, c\'est oublier le +1 : coupée en ' + (h + v) + ' points, la droite oblique a ' + (h + v + 1) + ' morceaux.'],
      [grille, 'Piège : répondre #, c\'est oublier la droite oblique.'],
      [1 + N + C2(N), 'Piège : répondre # supposerait qu\'aucune droite n\'est parallèle à une autre.'],
      [grille + h * v, null]
    ] : [
      [(h - 1) * (v - 1), 'Piège : répondre #, c\'est ne compter que les cases fermées du quadrillage, sans les régions infinies.'],
      [h * v, 'Piège : # est le nombre de croisements, pas de régions.'],
      [1 + N + C2(N), 'Piège : répondre # supposerait qu\'aucune droite n\'est parallèle à une autre.'],
      [h + v + 1, null]
    ], expl);
  }
  const n = R.int(3, 8), plus = R.int(0, 2) > 0, rep = 2 * n + (plus ? n + 1 : 0), N = n + (plus ? 1 : 0);
  const q = 'On trace ' + n + ' droites distinctes qui passent toutes par un même point P' + (plus ? ', puis une autre droite qui ne passe pas par P et qui n\'est parallèle à aucune des précédentes' : '') + '. En combien de régions ces ' + N + ' droites découpent-elles le plan ?';
  const expl = 'Comme les rayons d\'une roue, chaque droite donne deux demi-droites issues du point commun, et deux demi-droites voisines délimitent une région : on compte les demi-droites' + (plus ? ', puis on ajoute les morceaux de la dernière droite' : '') + '. ' + n + ' droites donnent ' + 2 * n + ' demi-droites, donc ' + 2 * n + ' régions.' +
    (plus ? ' La dernière droite coupe les ' + n + ' autres en ' + n + ' points différents (deux d\'entre elles ne se croisent qu\'en P) : elle a ' + (n + 1) + ' morceaux. Total : ' + 2 * n + ' + ' + (n + 1) + ' = ' + rep + '.' : '');
  return sortie(q, rep, plus ? [
    [1 + N + C2(N), 'Piège : # est le résultat quand trois droites ne passent jamais par un même point.'],
    [3 * n, 'Piège : répondre #, c\'est oublier le +1 : coupée en ' + n + ' points, la dernière droite a ' + (n + 1) + ' morceaux.'],
    [2 * N, 'Piège : répondre # supposerait que toutes les droites passent par P.'],
    [rep + 1, null]
  ] : [
    [1 + n + C2(n), 'Piège : # est le résultat quand trois droites ne passent jamais par un même point.'],
    [n + 1, 'Piège : répondre #, c\'est oublier que chaque droite traverse le point commun et se prolonge de l\'autre côté.'],
    [rep - 1, null], [rep + 2, null]
  ], expl);
}

/* Régions : deux courbes de degré 2 ou 3. */
function n4Courbes2(R){
  const x2 = G([0, 0, 1]), x3 = G([0, 0, 0, 1]);
  const s = R.int(1, 3), cfg = R.int(1, 10);
  let L;
  if (cfg === 1) L = [x2, G([2 * s * s, 0, -1])];
  else if (cfg === 2) L = [x2, G([R.pick([-3, -2, -1, 1, 2, 3]), 0, 1])];
  else if (cfg === 3) L = [x2, G([0, 0, R.pick([2, 3, -1, -2])])];
  else if (cfg === 4) L = [x2, G([R.int(-3, 3), R.pick([-3, -2, -1, 1, 2, 3]), 1])];
  else if (cfg === 5){ const c1 = R.int(0, 3); L = [G([c1, 0, 1]), G([c1 - R.int(1, 4), 0, -1])]; }
  else if (cfg === 6) L = [x3, G([0, s * s])];
  else if (cfg === 7) L = [x3, G([0, -R.int(1, 4)])];
  else if (cfg === 8) L = [x3, G([R.pick([0, 0, -1, 1, 8, -8, 2])])];
  else if (cfg === 9) L = [x3, G([0, 0, R.pick([1, 2, 3, -1, -2])])];
  else L = [G([0, -s * s, 0, 1]), G([0])];
  const D = decoupe(L), n = D.total, k = D.det[1].k;
  const nomQ = c => c.k === 'G' && deg(c.c) < 0 ? 'l\'axe des abscisses' : (degC(c) <= 1 ? 'la droite' : degC(c) === 2 ? 'la parabole' : 'la courbe') + ' d\'équation ' + eq(c);
  const q = 'En combien de régions ' + nomQ(L[0]) + ' et ' + nomQ(L[1]) + ' découpent-elles le plan ?';
  const rs = racines(sub(L[0].c, L[1].c)), multiple = rs.some(u => u.m > 1);
  const expl = 'La première courbe seule fait 2 régions ; la seconde, infinie elle aussi, ajoute autant de régions que de morceaux, c\'est-à-dire son nombre de points distincts de rencontre avec la première, plus 1. ' + resout(L[0], L[1]) + ' ' + explReg(D);
  const nRac = rs.reduce((t, u) => t + u.m, 0);
  return sortie(q, n, [
    multiple ? [n + nRac - k, 'Piège : répondre #, c\'est compter une solution double ou triple comme plusieurs points ; c\'est un seul point de contact.'] : null,
    k === 0 ? [2, 'Piège : répondre #, c\'est oublier que la seconde courbe, même sans toucher la première, coupe une région en deux.'] : null,
    [D.sansPlus, 'Piège : répondre #, c\'est oublier le +1 : k points de rencontre découpent la courbe en k + 1 morceaux.'],
    [D.bornees, 'Piège : répondre #, c\'est ne compter que les régions fermées et oublier les régions infinies.'],
    [6, null], [5, null], [4, null], [3, null]
  ], expl);
}

/* Paramètre : tangence ou condition sur une droite horizontale. */
function n4Param(R){
  const t = R.int(1, 3);
  if (t === 1){
    const u = R.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), c = R.pick([0, 0, 0, 1, -2, 3]), m = 2 * u, rep = c - u * u;
    const Pc = [c, 0, 1];
    const q = 'Pour quelle valeur de p la droite d\'équation y = ' + poly([0, m]) + ' + p est-elle tangente à la parabole d\'équation y = ' + poly(Pc) + ', c\'est-à-dire la touche en un seul point ?';
    const expl = 'On écrit l\'équation des abscisses des points communs, puis on impose qu\'elle ait une seule solution : discriminant nul. ' +
      poly(Pc) + ' = ' + poly([0, m]) + ' + p ⟺ x² ' + (m > 0 ? '− ' + m : '+ ' + (-m)) + 'x ' + (c ? '+ (' + z(c) + ' − p)' : '− p') + ' = 0. Δ = ' + m * m + ' − 4 × ' + (c ? '(' + z(c) + ' − p)' : '(−p)') + ' = ' + (m * m - 4 * c) + ' + 4p, nul pour p = ' + z(rep) + '. Vérification : x² ' + (m > 0 ? '− ' + m : '+ ' + (-m)) + 'x + ' + u * u + ' = (x ' + (u > 0 ? '− ' + u : '+ ' + (-u)) + ')², un seul point de contact, en x = ' + z(u) + '.';
    return sortie(q, rep, [
      [-rep, 'Piège : erreur de signe dans le discriminant.'],
      [c - 4 * u * u, 'Piège : on a oublié de diviser par 4.'],
      [c - m, null], [c + m, null]
    ], expl, -1000);
  }
  if (t === 2){
    const u = R.pick([-4, -3, -2, -1, 1, 2, 3, 4]), m = 2 * u, rep = u * u;
    const q = 'Pour quelle valeur de c la parabole d\'équation y = x² + c est-elle tangente à la droite d\'équation y = ' + poly([0, m]) + ', c\'est-à-dire la touche en un seul point ?';
    const expl = 'On écrit l\'équation des abscisses des points communs, puis on impose qu\'elle ait une seule solution : discriminant nul. x² + c = ' + poly([0, m]) + ' ⟺ x² ' + (m > 0 ? '− ' + m : '+ ' + (-m)) + 'x + c = 0. Δ = ' + m * m + ' − 4c, nul pour c = ' + rep + '. Vérification : x² ' + (m > 0 ? '− ' + m : '+ ' + (-m)) + 'x + ' + rep + ' = (x ' + (u > 0 ? '− ' + u : '+ ' + (-u)) + ')², un seul point de contact.';
    return sortie(q, rep, [
      [-rep, 'Piège : erreur de signe dans le discriminant.'],
      [m * m, 'Piège : on a oublié de diviser par 4.'],
      [Math.abs(m), null], [rep + 1, null]
    ], expl, -1000);
  }
  const h = R.pick([-4, -3, -2, -1, 1, 2, 3, 4]), c = R.int(-5, 6), Pc = [c, -2 * h, 1], mn = c - h * h;
  const q = 'Pour quelles valeurs de k la droite d\'équation y = k coupe-t-elle la parabole d\'équation y = ' + poly(Pc) + ' en deux points ?';
  const bonne = 'k > ' + z(mn);
  const expl = 'On cherche le point le plus bas de la parabole, son sommet : une droite horizontale strictement au-dessus du sommet coupe la parabole en deux points, à la hauteur du sommet elle la touche, en dessous elle la manque. ' +
    'Le sommet est là où la dérivée 2x ' + (h > 0 ? '− ' + 2 * h : '+ ' + (-2 * h)) + ' s\'annule, en x = ' + z(h) + ' ; son ordonnée vaut ' + calc(Pc, h) + '. Il faut donc ' + bonne + '.';
  return sortieT(q, bonne, [
    ['k > ' + z(c), 'Piège : ' + z(c) + ' est l\'ordonnée du point d\'abscisse 0, pas celle du sommet.'],
    ['k < ' + z(mn), 'Piège : la parabole est tournée vers le haut ; sous le sommet, une droite horizontale ne la touche pas.'],
    ['k > ' + z(h), 'Piège : ' + z(h) + ' est l\'abscisse du sommet ; c\'est son ordonnée qui compte.'],
    ['k > ' + z(c + h * h), null]
  ], expl, j => 'k > ' + z(mn + j));
}

/* Position : courbe de degré 3 face à une droite, ou deux paraboles. */
function n4Position(R){
  const dessus = R.int(0, 1) === 1, mot = dessus ? 'strictement au-dessus' : 'strictement au-dessous';
  if (R.int(1, 3) <= 2){
    const s = R.int(1, 5), D = G([0, s * s]);
    const bonne = dessus ? z(-s) + ' < x < 0 ou x > ' + s : 'x < ' + z(-s) + ' ou 0 < x < ' + s;
    const autre = dessus ? 'x < ' + z(-s) + ' ou 0 < x < ' + s : z(-s) + ' < x < 0 ou x > ' + s;
    const q = 'Pour quelles valeurs de x la courbe d\'équation y = x³ est-elle ' + mot + ' de la droite d\'équation y = ' + poly(D.c) + ' ?';
    const expl = 'On étudie le signe de la différence x³ − ' + poly(D.c) + ' en la factorisant, puis on fait un tableau de signes. ' +
      'x³ − ' + poly(D.c) + ' = x(x² − ' + s * s + ') = x(x + ' + s + ')(x − ' + s + '), qui s\'annule en ' + M + s + ', 0 et ' + s + '. Tableau de signes : négatif avant ' + M + s + ', positif entre ' + M + s + ' et 0, négatif entre 0 et ' + s + ', positif après ' + s + '. ' +
      'Exemple : en x = ' + (s + 1) + ', x³ = ' + Math.pow(s + 1, 3) + ' et la droite vaut ' + s * s * (s + 1) + '. La courbe est ' + mot + ' de la droite pour ' + bonne + '.';
    return sortieT(q, bonne, [
      [autre, 'Piège : c\'est là que la courbe est de l\'autre côté ; un test avec une valeur simple évite cette confusion.'],
      [dessus ? 'x > ' + s : 'x < ' + s, 'Piège : diviser par x fait perdre le point x = 0 et une partie des solutions ; le signe de x compte.'],
      [dessus ? dehors(-s, s) : entre(-s, s), 'Piège : une courbe de degré 3 ne se comporte pas comme une parabole ; il y a trois points communs, donc quatre zones.']
    ], expl, j => dessus ? z(-s - j) + ' < x < 0 ou x > ' + (s + j) : 'x < ' + z(-s - j) + ' ou 0 < x < ' + (s + j));
  }
  const s = R.int(1, 6), c1 = R.int(-3, 3), P1 = [c1, 0, 1], P2c = [c1 + 2 * s * s, 0, -1];
  const bonne = dessus ? dehors(-s, s) : entre(-s, s);
  const q = 'Pour quelles valeurs de x la parabole d\'équation y = ' + poly(P1) + ' est-elle ' + mot + ' de la parabole d\'équation y = ' + poly(P2c) + ' ?';
  const expl = 'On étudie le signe de la différence des deux expressions. ' + poly(P1) + ' − (' + poly(P2c) + ') = ' + poly(sub(P1, P2c)) + ' = 2(x² − ' + s * s + '), qui s\'annule en ' + M + s + ' et ' + s + ' : positive à l\'extérieur des racines, négative entre elles. La première parabole est donc ' + mot + ' de la seconde pour ' + bonne + '.';
  return sortieT(q, bonne, [
    [dessus ? entre(-s, s) : dehors(-s, s), 'Piège : c\'est l\'ensemble où la première parabole est de l\'autre côté.'],
    [dessus ? 'x > ' + s : 'x < ' + s, 'Piège : il ne faut pas oublier les valeurs négatives de x.'],
    s > 1 ? [dessus ? dehors(-s * s, s * s) : entre(-s * s, s * s), 'Piège : il faut prendre la racine carrée.'] : [dessus ? dehors(-2, 2) : entre(-2, 2), null]
  ], expl, j => dessus ? dehors(-s - j, s + j) : entre(-s - j, s + j));
}

/* =====================================================
   NIVEAU 5 : haut du test adaptatif
   ===================================================== */

/* Régions : parabole et trois droites, dont plusieurs passent par un même point de la parabole. */
function n5Par3(R){
  const P = G([0, 0, 1]); let L = null;
  for (let e = 0; e < 60 && !L; e++){
    const t = R.pick([-2, -1, 1, 2]), T = passantPar(R, t).slice(0, R.int(2, 3));
    while (T.length < 3) T.push(lignePour(R));
    if (distinctes([P].concat(T))) L = R.shuffle(T);
  }
  if (!L) L = [V(1), G([1]), G([0, 1])];
  const D = decoupe([P].concat(L)), n = D.total;
  const q = 'En combien de régions la parabole d\'équation y = x² et les droites d\'équations ' + listeEt(L.map(eq)) + ' découpent-elles le plan ?';
  const expl = METHODE_REG + ' ' + explParabole(P, L) + ' ' + explReg(D);
  return sortie(q, n, [
    [D.brut, 'Piège : répondre #, c\'est compter plusieurs fois un point par lequel passent trois courbes ou plus.'],
    [14, 'Piège : # est le maximum possible, quand tous les points de rencontre sont distincts ; ce n\'est pas le cas ici.'],
    [D.bornees, 'Piège : répondre #, c\'est ne compter que les régions fermées et oublier les régions infinies.'],
    [D.sansPlus, null], [n + 1, null], [n - 1, null]
  ], expl);
}

/* Régions : un quadrillage et une droite oblique qui passe par des nœuds. */
function n5Grille(R){
  const a = R.int(1, 3), b = R.int(1, 3);
  const xs = [], ys = []; for (let i = 0; i <= a; i++) xs.push(i); for (let j = 0; j <= b; j++) ys.push(j);
  const diag = R.pick([G([0, 1]), G([0, 1]), G([1, 1]), G([-1, 1]), G([a, -1]), G([b, -1]), G([0, 2]), G([1, -1]), G([0, -1]), G([2, -1])]);
  const L = xs.map(V).concat(ys.map(y => G([y]))).concat([diag]);
  const D = decoupe(L), n = D.total, N = L.length, grille = (a + 2) * (b + 2);
  const e = D.det[D.det.length - 1];
  const q = 'On trace les droites verticales ' + listeEt(xs.map(x => 'x = ' + x)) + ', les droites horizontales ' + listeEt(ys.map(y => 'y = ' + y)) + ', puis la droite d\'équation ' + eq(diag) + '. En combien de régions ces ' + N + ' droites découpent-elles le plan ?';
  const noeuds = e.pts.filter(p => p.n > 1).length;
  const expl = 'On compte d\'abord les régions du quadrillage, puis on ajoute les morceaux de la droite oblique, en comptant une seule fois chaque point où elle traverse un croisement du quadrillage. ' +
    'Les ' + (a + 1) + ' verticales découpent le plan en ' + (a + 2) + ' bandes, et les ' + (b + 1) + ' horizontales coupent chacune en ' + (b + 2) + ' : ' + (a + 2) + ' × ' + (b + 2) + ' = ' + grille + ' régions. ' +
    'La droite ' + eq(diag) + ' rencontre le quadrillage en ' + e.k + ' points distincts : ' + listeEt(e.pts.map(p => pt(p.x, p.y))) + (noeuds ? ', dont ' + noeuds + ' croisement' + (noeuds > 1 ? 's' : '') + ' d\'une verticale et d\'une horizontale, compté' + (noeuds > 1 ? 's' : '') + ' une seule fois' : '') + '. Elle a donc ' + (e.k + 1) + ' morceaux : ' + grille + ' + ' + (e.k + 1) + ' = ' + n + ' régions.';
  return sortie(q, n, [
    [D.brut, 'Piège : répondre #, c\'est compter deux fois chaque croisement du quadrillage par lequel passe la droite oblique.'],
    [1 + N + N * (N - 1) / 2, 'Piège : répondre # supposerait des droites sans parallèles ni point commun à trois.'],
    [grille, 'Piège : répondre #, c\'est oublier la droite oblique.'],
    [D.bornees, 'Piège : répondre #, c\'est ne compter que les régions fermées et oublier les régions infinies.'],
    [n + 1, null], [n - 1, null]
  ], expl);
}

/* Régions : un cercle de centre O et des droites horizontales ou verticales. */
function n5Cercle(R){
  const r = R.pick([5, 5, 5, 10, 13]), tri = r === 5 ? [3, 4] : r === 10 ? [6, 8] : [5, 12];
  let L = null;
  for (let e = 0; e < 80 && !L; e++){
    const T = [], coin = R.int(1, 10) <= 7;
    if (coin){ const i = R.int(0, 1), p = tri[i] * R.pick([1, -1]), q = tri[1 - i] * R.pick([1, -1]); T.push(V(p), G([q])); }
    const pool = [V(tri[0]), V(-tri[0]), V(tri[1]), G([tri[0]]), G([-tri[1]]), V(r), G([-r]), V(0), G([0]), V(r + 1), G([r + 2]), V(1), G([-2])];
    const cible = coin ? R.int(2, 3) : 3;
    while (T.length < cible) T.push(R.pick(pool));
    if (!distinctes(T)) continue;
    /* au moins une vraie difficulté : deux droites qui se croisent SUR le cercle, ou une droite tangente */
    let surCercle = false;
    T.forEach((d1, i) => T.forEach((d2, j) => { if (j > i) inter(d1, d2).forEach(p => { if (Math.abs(p.x * p.x + p.y * p.y - r * r) < 1e-9) surCercle = true; }); }));
    if (surCercle || T.some(d => inter(d, C(r)).length === 1)) L = R.shuffle(T);
  }
  if (!L) L = [V(3), G([4])];
  const Ce = C(r), D = decoupe(L.concat([Ce])), n = D.total, faux = decoupe([Ce].concat(L), true).total;
  const q = 'Dans un repère, on trace le cercle de centre O(0 ; 0) et de rayon ' + r + ', ainsi que les droites d\'équations ' + listeEt(L.map(eq)) + '. En combien de régions ces figures découpent-elles le plan ?';
  const surCercle = [];
  L.forEach((d1, i) => L.forEach((d2, j) => { if (j > i) inter(d1, d2).forEach(p => { if (Math.abs(p.x * p.x + p.y * p.y - r * r) < 1e-9) surCercle.push(p); }); }));
  const expl = 'On trace d\'abord les droites, puis le cercle en dernier : chaque droite ajoute son nombre de points de rencontre avec les précédentes, plus 1, et le cercle ajoute autant de régions que de points distincts où il rencontre les droites (1 s\'il n\'en rencontre aucune). ' +
    'Un point (x ; y) est sur le cercle quand x² + y² = ' + r * r + '. ' +
    (surCercle.length ? 'Ici, ' + surCercle.map(p => pt(p.x, p.y)).join(' et ') + ' est à la fois sur deux droites et sur le cercle, car ' + Math.abs(surCercle[0].x) + '² + ' + Math.abs(surCercle[0].y) + '² = ' + r * r + '. ' : '') + explReg(D);
  return sortie(q, n, [
    [faux !== n ? faux : null, 'Piège : répondre #, c\'est tracer le cercle en premier ; une droite tracée après lui a ses deux bouts infinis dans la même région extérieure, ce qui compte des régions en trop. Le cercle se trace en dernier.'],
    [D.brut, 'Piège : répondre #, c\'est compter plusieurs fois un point par lequel passent deux droites et le cercle.'],
    [D.bornees, 'Piège : répondre #, c\'est ne compter que les régions fermées et oublier les régions infinies.'],
    [n + 1, null], [n - 1, null]
  ], expl);
}

/* Compter des valeurs entières d'un paramètre (discriminant, variations d'une courbe de degré 3). */
function n5Compte(R){
  const t = R.int(1, 4);
  if (t <= 2){
    const c = R.int(1, 12), N = (() => { let k = 0; for (let m = -20; m <= 20; m++) if (m * m < 4 * c) k++; return k; })();
    const q = 'Pour combien de valeurs entières de m la droite d\'équation y = mx − ' + c + ' ne rencontre-t-elle pas la parabole d\'équation y = x² ?';
    const mx = (N - 1) / 2, carre = Math.round(Math.sqrt(4 * c)) ** 2 === 4 * c;
    const expl = 'On écrit l\'équation des abscisses des points communs, puis on cherche quand elle n\'a pas de solution : discriminant strictement négatif. ' +
      'x² = mx − ' + c + ' ⟺ x² − mx + ' + c + ' = 0, Δ = m² − ' + 4 * c + '. Aucun point commun ⟺ m² < ' + 4 * c + ' ⟺ ' + M + mx + ' ≤ m ≤ ' + mx + ', soit ' + N + ' entiers (zéro compris).' + (carre ? ' Pour m = ±' + Math.sqrt(4 * c) + ', Δ = 0 : la droite touche la parabole, elle la rencontre donc.' : '');
    const plusC = (() => { let k = 0; for (let m = -20; m <= 20; m++) if (m * m < c) k++; return k; })();
    return sortie(q, N, [
      carre ? [N + 2, 'Piège : répondre #, c\'est compter aussi les deux droites tangentes, qui touchent la parabole.'] : null,
      [mx, 'Piège : répondre #, c\'est oublier les valeurs négatives de m et zéro.'],
      [plusC !== N ? plusC : null, 'Piège : répondre #, c\'est oublier le facteur 4 dans le discriminant.'],
      [N - 1, 'Piège : répondre #, c\'est oublier m = 0.'], [N + 1, null]
    ], expl);
  }
  if (t === 3){
    const a = R.pick([1, 1, 2, 2, 3]), d = R.pick([0, 0, -2, -1, 1, 2]), forme = R.int(0, 1);
    const c = forme ? [d, 0, -3 * a, 1] : [d, -3 * a * a, 0, 1];
    const x1 = forme ? 0 : -a, x2 = forme ? 2 * a : a, haut = val(c, x1), bas = val(c, x2), N = haut - bas - 1;
    const q = 'Pour combien de valeurs entières de k la droite d\'équation y = k coupe-t-elle la courbe d\'équation y = ' + poly(c) + ' en trois points distincts ?';
    const der = forme ? '3x² − ' + 6 * a + 'x = 3x(x − ' + 2 * a + ')' : '3x² − ' + 3 * a * a + ' = 3(x + ' + a + ')(x − ' + a + ')';
    const expl = 'On étudie les variations de la courbe avec sa dérivée : une droite horizontale coupe la courbe en trois points exactement quand elle passe strictement entre le maximum local et le minimum local. ' +
      'Dérivée : ' + der + ', qui s\'annule en x = ' + z(x1) + ' et x = ' + z(x2) + '. Maximum local : f(' + z(x1) + ') = ' + calc(c, x1) + ' ; minimum local : f(' + z(x2) + ') = ' + calc(c, x2) + '. ' +
      'Il faut ' + z(bas) + ' < k < ' + z(haut) + ', soit ' + N + ' entiers. Pour k = ' + z(bas) + ' ou k = ' + z(haut) + ', la droite touche la courbe et ne la coupe qu\'en deux points.';
    return sortie(q, N, [
      [N + 2, 'Piège : répondre #, c\'est compter aussi les deux valeurs où la droite touche la courbe ; il n\'y a alors que deux points communs.'],
      [N + 1, null], [(N - 1) / 2, 'Piège : répondre #, c\'est ne compter qu\'un côté, entre 0 et l\'un des extremums.'], [N - 1, null]
    ], expl);
  }
  const c = R.int(0, 1) ? R.pick([1, 4, 9, 16, 25]) : R.pick([2, 3, 5, 6, 7, 8, 10, 12, 18, 20]), carre = Math.round(Math.sqrt(c)) ** 2 === c, N = carre ? 2 : 0;
  const q = 'Pour combien de valeurs entières de m la droite d\'équation y = mx − ' + c + ' est-elle tangente à la parabole d\'équation y = x², c\'est-à-dire la touche en un seul point ?';
  const expl = 'On écrit l\'équation des abscisses des points communs et on impose une seule solution : discriminant nul. x² − mx + ' + c + ' = 0, Δ = m² − ' + 4 * c + '. Δ = 0 ⟺ m² = ' + 4 * c + (carre ? ' ⟺ m = ' + 2 * Math.sqrt(c) + ' ou m = ' + M + 2 * Math.sqrt(c) + ' : 2 valeurs entières.' : ', or ' + 4 * c + ' n\'est pas un carré parfait : aucune valeur entière de m ne convient.');
  return sortie(q, N, [
    [carre ? 1 : 2, carre ? 'Piège : répondre #, c\'est oublier la valeur négative de m.' : 'Piège : répondre #, c\'est supposer que ' + 4 * c + ' est un carré parfait.'],
    [carre ? 0 : 1, null], [4, null], [3, null]
  ], expl, 0);
}

/* Courbe y = x³ et droite à trois racines entières (ou contact) : régions et position. */
const TRIPLES = [[-3, 1, 2], [-4, 1, 3], [-5, 2, 3], [-5, 1, 4], [-2, -1, 3], [-3, -1, 4], [-4, -1, 5], [-6, 1, 5], [-6, 2, 4], [-1, -2, 3]];
function n5Cubique(R){
  let rts;
  if (R.int(1, 3) === 1){ const t = R.pick([1, 2, -1, -2]); rts = [t, t, -2 * t]; }
  else { rts = R.pick(TRIPLES); if (R.int(0, 1)) rts = rts.map(x => -x); }
  const [u, v, w] = rts, paires = u * v + u * w + v * w, prod = u * v * w;
  const Dr = G([prod, -paires]), Cb = G([0, 0, 0, 1]);    // x³ − (−paires)x − prod = (x − u)(x − v)(x − w)
  const tri = [...new Set(rts)].sort((a, b) => a - b), contact = tri.length === 2;
  if (R.int(0, 1)){
    const D = decoupe([Cb, Dr]), n = D.total;
    const q = 'En combien de régions la courbe d\'équation y = x³ et la droite d\'équation y = ' + poly(Dr.c) + ' découpent-elles le plan ?';
    const expl = 'On cherche les abscisses des points communs en résolvant x³ = ' + poly(Dr.c) + ' : on teste de petits entiers (diviseurs de ' + Math.abs(prod) + '), puis on factorise. ' + resout(Cb, Dr) + ' ' + explReg(D);
    return sortie(q, n, [
      contact ? [6, 'Piège : répondre #, c\'est compter la solution double comme deux points ; la droite touche la courbe en un seul point à cet endroit.'] : [5, 'Piège : répondre #, c\'est oublier un des trois points communs.'],
      [D.sansPlus, 'Piège : répondre #, c\'est oublier le +1 : k points de rencontre donnent k + 1 morceaux.'],
      [D.bornees, 'Piège : répondre #, c\'est ne compter que les régions fermées et oublier les régions infinies.'],
      [4, null], [7, null]
    ], expl);
  }
  const dessus = R.int(0, 1) === 1, mot = dessus ? 'strictement au-dessus' : 'strictement au-dessous';
  /* signe de (x − u)(x − v)(x − w) */
  let bonne, pieges;
  if (!contact){
    const [a, b, c] = tri;
    bonne = dessus ? entre(a, b) + ' ou x > ' + z(c) : 'x < ' + z(a) + ' ou ' + entre(b, c);
    pieges = [[dessus ? 'x < ' + z(a) + ' ou ' + entre(b, c) : entre(a, b) + ' ou x > ' + z(c), 'Piège : c\'est là que la courbe est de l\'autre côté ; un test avec une valeur simple évite cette confusion.'],
      [dessus ? 'x > ' + z(c) : 'x < ' + z(a), 'Piège : il y a deux zones, pas une seule, car la courbe traverse la droite trois fois.'],
      [dessus ? entre(-c, -b) + ' ou x > ' + z(-a) : 'x < ' + z(-c) + ' ou ' + entre(-b, -a), 'Piège : (x − a) s\'annule en x = a : attention aux signes des racines.']];
  } else {
    const d = rts[0], s = rts[2];   // racine double d, simple s
    /* (x − d)²(x − s) : signe de (x − s), nul en d */
    if (dessus){ bonne = s < d ? entre(s, d) + ' ou x > ' + z(d) : 'x > ' + z(s); pieges = [[s < d ? 'x > ' + z(s) : 'x < ' + z(s), s < d ? 'Piège : en x = ' + z(d) + ', la courbe touche la droite ; elle n\'est pas strictement au-dessus en ce point.' : 'Piège : c\'est l\'ensemble où la courbe est sous la droite.'], ['x < ' + z(s), null], [s < d ? 'x > ' + z(d) : 'x > ' + z(d), null]]; }
    else { bonne = s > d ? 'x < ' + z(d) + ' ou ' + entre(d, s) : 'x < ' + z(s); pieges = [[s > d ? 'x < ' + z(s) : 'x > ' + z(s), s > d ? 'Piège : en x = ' + z(d) + ', la courbe touche la droite ; elle n\'est pas strictement au-dessous en ce point.' : 'Piège : c\'est l\'ensemble où la courbe est au-dessus de la droite.'], ['x > ' + z(s), null], ['x < ' + z(d), null]]; }
  }
  const q = 'Pour quelles valeurs de x la courbe d\'équation y = x³ est-elle ' + mot + ' de la droite d\'équation y = ' + poly(Dr.c) + ' ?';
  const E = sub(Cb.c, Dr.c);
  const expl = 'On étudie le signe de x³ − (' + poly(Dr.c) + ') : on trouve ses racines en testant de petits entiers, on factorise, puis on fait un tableau de signes. ' +
    'x³ − (' + poly(Dr.c) + ') = ' + poly(E) + ' = ' + facto(E, racines(E)) + '. ' +
    (contact ? 'Le facteur au carré est toujours positif ou nul : le signe est celui du facteur simple, et la différence vaut 0 à la racine double. ' : 'Le signe change à chaque racine : négatif avant ' + z(tri[0]) + ', positif entre ' + z(tri[0]) + ' et ' + z(tri[1]) + ', négatif entre ' + z(tri[1]) + ' et ' + z(tri[2]) + ', positif après ' + z(tri[2]) + '. ') +
    'La courbe est ' + mot + ' de la droite pour ' + bonne + '.';
  return sortieT(q, bonne, pieges, expl, j => (dessus ? 'x > ' : 'x < ') + z(tri[dessus ? tri.length - 1 : 0] + (dessus ? j : -j)));
}

/* ---------- repli fixe (jamais atteint en pratique, garantit l'absence d'exception) ---------- */
function secours(){
  return {q: 'En combien de régions la parabole d\'équation y = x² et la droite d\'équation y = 9 découpent-elles le plan ?', a: '5', accept: null, choix: ['5', '4', '3', '6'],
    expl: 'La parabole seule fait 2 régions ; la droite ajoute autant de régions que de morceaux, c\'est-à-dire son nombre de points communs avec la parabole, plus 1. x² = 9 donne x = −3 ou x = 3 : 2 points, 3 morceaux, d\'où 2 + 3 = 5 régions.'};
}
const TYPES = {
  1: [n1Horiz, n1Inter, n1Reg2, n1Point],
  2: [n2Origine, n2Reg3, n2Position, n2Axes],
  3: [n3ParDroite, n3Reg4, n3Abscisses, n3Position, n3DeuxPar],
  4: [n4Par2, n4Mots, n4Courbes2, n4Param, n4Position],
  5: [n5Par3, n5Grille, n5Cercle, n5Compte, n5Cubique]
};

A.push({
  id: 'alb-12-courbes-regions',
  phase: 'albert',
  ordre: 12,
  theme: 'fonctions',
  titre: 'Courbes : intersections, positions, régions du plan',
  objectif: 'Trouver les points communs de deux courbes, dire laquelle est au-dessus de l\'autre et compter les régions du plan qu\'elles délimitent, sans calculatrice.',
  lecon:
`<p class="lede">Au test, on te donne deux ou trois courbes par leurs équations (droites, paraboles, parfois une courbe de degré 3 ou un cercle) et on te demande où elles se rencontrent, laquelle est au-dessus de l'autre, ou en combien de <mark>régions</mark> elles découpent le plan. Aucun dessin n'est fourni : c'est à toi d'esquisser et de calculer.</p>
<h2>Ce que le test demande</h2>
<p>Trois familles de questions. Les <strong>points communs</strong> : combien, et où. La <strong>position</strong> : pour quelles valeurs de x une courbe est au-dessus de l'autre. Les <strong>régions</strong> : en combien de morceaux le plan est coupé, morceaux infinis compris. C'est le type le plus piégeux : on oublie facilement des régions.</p>
<h2>Ce qu'il faut savoir avant</h2>
<p><strong>Droites.</strong> y = ax + b : a est le coefficient directeur (la pente), b l'ordonnée à l'origine. Deux droites de même coefficient directeur sont parallèles et ne se coupent jamais. x = c est une droite verticale, y = k une droite horizontale.</p>
<p><strong>Paraboles.</strong> y = x² a la forme d'un U de sommet (0 ; 0), tout entier au-dessus de l'axe des abscisses. y = −x² est un U retourné. y = x² + c est la même courbe, décalée de c vers le haut.</p>
<p><strong>Points communs.</strong> Un point est sur les deux courbes quand les deux ordonnées sont égales : on résout f(x) = g(x). Le nombre de solutions est le nombre de points communs.</p>
<p><strong>Résoudre.</strong> On ramène tout d'un côté et on factorise. x² = 3x devient x(x − 3) = 0, donc x = 0 ou x = 3 : ne divise jamais par x, tu perdrais x = 0. Pour x² + Bx + C = 0, cherche deux nombres de somme −B et de produit C : x² − x − 6 = (x − 3)(x + 2). Sinon, le discriminant Δ = B² − 4AC : Δ &gt; 0 donne deux solutions, Δ = 0 une seule (la droite touche la courbe, elle est tangente), Δ &lt; 0 aucune.</p>
<p><strong>Cercle.</strong> Le cercle de centre O et de rayon r contient les points (x ; y) tels que x² + y² = r². Par exemple, (3 ; 4) est sur le cercle de rayon 5, car 9 + 16 = 25.</p>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. J'esquisse :</strong> à main levée, les U, les droites, leurs points remarquables. Le dessin sert à ne rien oublier, pas à mesurer.</p>
<p><strong>2. Je calcule les points communs :</strong> pour chaque paire de courbes, je résous f(x) = g(x).</p>
<p><strong>3. Je compte les régions courbe par courbe :</strong> la première courbe infinie (droite, parabole, courbe de degré 3) coupe le plan en 2. Chaque nouvelle courbe infinie est découpée en morceaux par ses points de rencontre avec les courbes déjà tracées : k points distincts donnent k + 1 morceaux, et chaque morceau coupe une région en deux.</p>
<p><strong>4. Je vérifie :</strong> un point par lequel passent trois courbes ne compte qu'une fois ; les régions infinies comptent autant que les régions fermées.</p>
</div>
<div class="formule"><p>régions = 2 + (k<sub>2</sub> + 1) + (k<sub>3</sub> + 1) + …, où k<sub>i</sub> = nombre de points distincts où la courbe i rencontre les courbes déjà tracées</p></div>
<p><strong>Position.</strong> On étudie le signe de f(x) − g(x). Entre deux points communs consécutifs, ce signe ne change pas : un seul test par intervalle suffit.</p>
<p><strong>Cercle.</strong> Trace d'abord les droites, puis le cercle : il ajoute autant de régions que de points distincts de rencontre, et 1 s'il ne touche rien.</p>
<p><strong>Droites seules.</strong> n droites sans parallèles et sans trois droites concourantes donnent 1 + n + n(n − 1)/2 régions. Chaque paire de parallèles en retire 1, chaque point où passent trois droites en retire 1.</p>
<h2>Exemples résolus</h2>
<h3>Exemple 1 : y = x² et y = 16</h3>
<p>x² = 16 donne x = 4 ou x = −4. Deux points communs : (−4 ; 16) et (4 ; 16). Ne pas oublier la solution négative.</p>
<h3>Exemple 2 : les droites y = x + 1, y = −x + 3 et y = 3x − 1</h3>
<p>Les deux premières se coupent quand x + 1 = −x + 3, soit x = 1 : au point (1 ; 2). Or 3 × 1 − 1 = 2 : la troisième passe aussi par (1 ; 2). Comptage : 2, puis +2 (un point), puis +2 (un seul point distinct). Total : <strong>6 régions</strong>, et non 7.</p>
<h3>Exemple 3 : la parabole y = x² et la droite y = 3x</h3>
<p>x² = 3x ⟺ x(x − 3) = 0 : x = 0 ou x = 3, deux points. La parabole fait 2 régions, la droite coupée en 3 morceaux en ajoute 3 : <strong>5 régions</strong>. Une seule est fermée (entre la droite et la parabole), les quatre autres sont infinies.</p>
<h3>Exemple 4 : y = x², x = 2 et y = 4</h3>
<p>Parabole : 2. La droite y = 4 la coupe en (−2 ; 4) et (2 ; 4) : +3, soit 5. La droite x = 2 coupe la parabole en (2 ; 4) et la droite y = 4 en (2 ; 4) : c'est le même point ! Un seul point, donc 2 morceaux : +2. Total : <strong>7 régions</strong>, et non 8.</p>
<h3>Exemple 5 : position de y = x² et y = x + 2</h3>
<p>x² − (x + 2) = x² − x − 2 = (x − 2)(x + 1). Ce produit est positif à l'extérieur des racines. La parabole est au-dessus de la droite pour x &lt; −1 ou x &gt; 2, au-dessous pour −1 &lt; x &lt; 2.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl"><tr><th>Figure</th><th>Régions</th></tr>
<tr><td>une droite ou une parabole</td><td>2</td></tr>
<tr><td>deux droites parallèles</td><td>3</td></tr>
<tr><td>deux droites sécantes</td><td>4</td></tr>
<tr><td>parabole et droite qui ne la touche pas</td><td>3</td></tr>
<tr><td>parabole et droite tangente ou verticale</td><td>4</td></tr>
<tr><td>parabole et droite qui la coupe deux fois</td><td>5</td></tr>
<tr><td>trois droites sans parallèles ni point triple</td><td>7</td></tr></table>
<p>Une droite verticale coupe toujours une courbe y = f(x) en exactement un point. Deux paraboles y = x² + bx + c ont le même terme en x² : il s'élimine, donc elles ont au plus un point commun (aucun si elles ne sont que décalées). Une droite coupe y = x³ en au plus trois points. En QCM, teste de petites valeurs entières (0, 1, −1, 2, −2) dans f(x) = g(x) : c'est souvent le plus rapide.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Compte courbe par courbe : chaque nouvelle courbe infinie ajoute (nombre de points distincts où elle rencontre les courbes déjà tracées) + 1 régions.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Oublier les régions infinies. Croire qu'une droite verticale ou tangente coupe la parabole deux fois. Compter deux fois un point par lequel passent trois courbes. Diviser par x dans x² = 3x et perdre x = 0. Oublier la solution négative de x² = 9. Tracer le cercle avant les droites et ajouter k + 1 au lieu de k.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Points communs : résoudre f(x) = g(x). Position : signe de f(x) − g(x). Régions : 2 pour la première courbe, puis + (k + 1) pour chaque courbe infinie, et + k (ou + 1 s'il ne touche rien) pour un cercle tracé en dernier.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(TYPES[n])(R);
      if (!ex || typeof ex.q !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return secours();
      return ex;
    } catch (e){ return secours(); }
  }
});

})();
