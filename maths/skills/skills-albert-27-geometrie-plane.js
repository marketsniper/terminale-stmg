/* ===== Maths · Objectif Albert School : alb-27 · Géométrie plane : Pythagore, aires, angles =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS.
   gen(level, R) : niveaux 1 à 5 (bornés), n'utilise que R.int, R.pick, R.shuffle, ne lève jamais d'exception.
   Toutes les réponses sont calculées à partir des données tirées (tables de triplets construites au chargement).
   Sous-types :
   N1 hypoténuse (triangle, écran, terrain, échelle), côté de l'angle droit (triangle, échelle, écran, câble),
      troisième angle (quelconque, rectangle, isocèle), aires usuelles (triangle, parallélogramme, trapèze, losange),
      longueur d'un cercle (rayon, diamètre, roue avec π ≈ 3,14) ;
   N2 carré et diagonale (aire, carré inscrit dans un cercle, diagonale depuis l'aire ou le côté), somme des angles
      d'un polygone et angle d'un polygone régulier, aire d'un triangle rectangle ou d'un rectangle (Pythagore puis
      aire), distance dans un repère, inégalité triangulaire (nombre de longueurs, extrêmes, triplet constructible),
      angles du triangle isocèle et angle extérieur ;
   N3 polygone régulier retrouvé (angle intérieur, somme, écart intérieur/extérieur), losange (périmètre, aire),
      triangle isocèle ou équilatéral (aire, hauteur, côté), échelle qui glisse, angles liés par des relations,
      aire d'un triangle dans un repère, trapèze rectangle ;
   N4 grande diagonale d'un pavé ou d'un cube, ficelle enroulée sur un cylindre, hauteur relative à l'hypoténuse,
      diagonales et polygones réguliers, angles entre sommets d'un polygone régulier, rectangle (périmètre et
      diagonale), suite de triangles rectangles, aire d'un quadrilatère dans un repère ;
   N5 aire d'un triangle à côtés entiers, cercle inscrit dans un triangle rectangle, rectangle (périmètre et
      diagonale, côtés non entiers), polygones réguliers à angles entiers, hauteur et segments de l'hypoténuse,
      plus court chemin d'une fourmi sur un pavé, aire d'un triangle équilatéral depuis sa hauteur. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales ---------- */
/* Même normalisation que normStr (core/pedagogie.js), chargé après ce fichier. */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
/* Nombre à la française : d décimales au plus (2 par défaut), virgule, U+202F pour les milliers, vrai signe moins. */
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));
const sg = k => (k % 2 ? 1 : -1) * Math.ceil(k / 2);              // 1, −1, 2, −2, …
const ok = v => typeof v === 'number' && isFinite(v) && v > 0;
const entier = v => ok(v) && Math.abs(v - Math.round(v)) < 1e-9;
/* Longueur, aire ou nombre positif avec unité facultative ; null si la valeur n'a pas de sens. */
const L = (v, u) => ok(v) ? nb(v) + (u ? ' ' + u : '') : null;
const deg = v => ok(v) && v < 360 ? nb(v) + '°' : null;
const degS = v => ok(v) ? nb(v) + '°' : null;                      // somme d'angles (peut dépasser 360°)
const par = v => v < 0 ? '(' + nb(v) + ')' : nb(v);
/* √n simplifié, n entier positif : 50 → 5√2, 49 → 7, 3 → √3. */
function rac(n){
  if (!entier(n)) return null;
  let k = 1, m = Math.round(n);
  for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0){ m /= f * f; k *= f; }
  return m === 1 ? nb(k) : (k === 1 ? '' : nb(k)) + '√' + m;
}
const racEg = n => (rac(n) === '√' + n ? rac(n) : '√' + nb(n) + ' = ' + rac(n));   // « √48 = 4√3 », ou « √3 » seul
const racU = (n, u) => { const r = rac(n); return r ? r + (u ? ' ' + u : '') : null; };
const piU = (k, u) => ok(k) ? (Math.abs(k - 1) < 1e-12 ? '' : nb(k)) + 'π' + (u ? ' ' + u : '') : null;
const NOMS = ['ABC', 'DEF', 'EFG', 'IJK', 'KLM', 'MNP', 'RST', 'UVW'];
const NOMPOLY = {5: 'pentagone', 6: 'hexagone', 7: 'heptagone', 8: 'octogone', 9: 'ennéagone', 10: 'décagone', 12: 'dodécagone'};
const polyConvexe = n => NOMPOLY[n] ? `d'un ${NOMPOLY[n]} convexe (${n} côtés)` : `d'un polygone convexe à ${n} côtés`;
const polyRegulier = n => NOMPOLY[n] ? `d'un ${NOMPOLY[n]} régulier (${n} côtés)` : `d'un polygone régulier à ${n} côtés`;

/* QCM : la bonne réponse, les distracteurs [choix, raison] (la raison ne figure dans « Piège » que si le choix est
   retenu), puis des voisins jusqu'à 4 choix distincts au sens de normStr. */
function mk(q, a, items, voisin, base){
  const ch = [a], vus = new Set([norm(a)]), ph = [];
  items.forEach(it => {
    const c = it[0];
    if (ch.length < 4 && c && !vus.has(norm(c))){ vus.add(norm(c)); ch.push(c); if (it[1]) ph.push(c + ' ' + it[1]); }
  });
  for (let k = 1; ch.length < 4 && k < 200; k++){
    const c = voisin(k);
    if (c && !vus.has(norm(c))){ vus.add(norm(c)); ch.push(c); }
  }
  return { q, a, accept: null, choix: ch, expl: base + (ph.length ? ' Piège : ' + ph.join(' ; ') + '.' : '') };
}

/* ---------- tables construites au chargement ---------- */
/* Triplets de Pythagore a < b < c, c ≤ 65. */
const TRIPLES = (function(){
  const T = [];
  for (let c = 5; c <= 65; c++) for (let a = 3; a < c; a++){
    const b2 = c * c - a * a, b = Math.round(Math.sqrt(b2));
    if (b > a && b * b === b2) T.push([a, b, c]);
  }
  return T;
})();
const T1 = [[3, 4, 5], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25], [5, 12, 13], [10, 24, 26], [8, 15, 17], [7, 24, 25]];
const T_ECH = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [1.5, 2, 2.5], [0.9, 1.2, 1.5], [1.2, 1.6, 2]];
const T3 = TRIPLES.filter(t => t[2] <= 30);
const REG = [5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72];

/* Échelle qui glisse : [longueur, pied avant, pied après, hauteur avant, hauteur après] (même famille de triplets). */
const ECH = (function(){
  const T = [];
  for (const c of [25, 50]){
    const legs = [];
    TRIPLES.filter(t => t[2] === c).forEach(t => { legs.push(t[0], t[1]); });
    legs.sort((x, y) => x - y);
    for (let i = 0; i < legs.length; i++) for (let j = i + 1; j < legs.length; j++){
      const a1 = legs[i], a2 = legs[j], h1 = Math.round(Math.sqrt(c * c - a1 * a1)), h2 = Math.round(Math.sqrt(c * c - a2 * a2));
      if (a2 - a1 === h1 - h2) continue;                           // le haut descend autant que le pied recule : ambigu
      T.push([c, a1, a2, h1, h2]);
    }
  }
  return T;
})();
/* Rapports d'angles p < q < r avec p + q + r diviseur de 180. */
const RAP = (function(){
  const T = [];
  for (let p = 1; p <= 8; p++) for (let q = p + 1; q <= 12; q++) for (let r = q + 1; r <= 16; r++){
    const s = p + q + r;
    if (180 % s === 0 && s <= 36 && 180 / s * r < 180) T.push([p, q, r]);
  }
  return T;
})();
/* Pavés à grande diagonale entière : a ≤ b ≤ c, d ≤ 30. */
const QUAD = (function(){
  const T = [];
  for (let a = 1; a <= 24; a++) for (let b = a; b <= 24; b++) for (let c = b; c <= 24; c++){
    const s = a * a + b * b + c * c, d = Math.round(Math.sqrt(s));
    if (d * d === s && d <= 30) T.push([a, b, c, d]);
  }
  return T;
})();
/* Ficelle sur un cylindre : [tours, périmètre, hauteur, longueur]. */
const CYL = (function(){
  const T = [];
  TRIPLES.forEach(([x, y, z]) => [[x, y], [y, x]].forEach(([X, h]) => {
    for (const n of [1, 2, 3, 4]) if (X % n === 0){
      const p = X / n;
      if (p >= 6 && p <= 40 && h >= 5 && h <= 60) T.push([n, p, h, z]);
    }
  }));
  return T;
})();
/* Hauteur relative à l'hypoténuse avec au plus 2 décimales. */
const HYP = TRIPLES.filter(([a, b, c]) => c <= 50 && Math.abs(a * b * 100 / c - Math.round(a * b * 100 / c)) < 1e-9);
/* Suite de triangles rectangles : [a, b, N, hypoténuse finale]. */
const SPI = (function(){
  const T = [];
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let N = 3; N <= 30; N++){
    const s = a * a + N * b * b, r = Math.round(Math.sqrt(s));
    if (r * r === s) T.push([a, b, N, r]);
  }
  return T;
})();
/* Triangles à côtés entiers : deux triangles de Pythagore accolés le long d'une hauteur commune h. */
const HERON = (function(){
  const T = [], legs = [];
  TRIPLES.forEach(([a, b, c]) => { legs.push([a, b, c]); legs.push([b, a, c]); });
  legs.forEach(([x1, h, s1]) => legs.forEach(([x2, h2, s2]) => {
    if (h !== h2 || x1 >= x2) return;
    const base = x1 + x2;
    if (base > 42 || s1 > 41 || s2 > 41) return;
    if (s1 * s1 + s2 * s2 === base * base) return;                 // triangle rectangle : trop facile
    T.push([s1, s2, base, h, x1, x2]);
  }));
  return T;
})();
/* Rectangle de demi-périmètre s et de diagonale d, côtés non entiers. */
const RECT5 = (function(){
  const T = [];
  for (let d = 5; d <= 25; d++) for (let s = d + 2; s * s < 2 * d * d; s += 2){
    if ((s - d) % 2) continue;
    const disc = 2 * d * d - s * s, r = Math.round(Math.sqrt(disc));
    if (r * r === disc) continue;
    T.push([s, d, (s * s - d * d) / 2]);
  }
  return T;
})();
/* Hauteur sur l'hypoténuse : segments p < q, h = √(pq) entier. */
const PROJ = (function(){
  const T = [];
  for (let p = 1; p <= 25; p++) for (let q = p + 1; q <= 45; q++){
    if (p + q > 50) continue;
    const h = Math.round(Math.sqrt(p * q));
    if (h * h === p * q) T.push([p, q, h]);
  }
  return T;
})();
/* Fourmi sur un pavé l ≥ w ≥ h : plus court chemin √(l² + (w + h)²) entier. */
const FOURMI = (function(){
  const T = [];
  for (let l = 3; l <= 30; l++) for (let w = 1; w <= l; w++) for (let h = 1; h <= w; h++){
    const s = l * l + (w + h) * (w + h), r = Math.round(Math.sqrt(s));
    if (r * r === s && r <= 40 && l + w + h !== r) T.push([l, w, h, r]);
  }
  return T;
})();

/* =====================================================
   NIVEAU 1 · découverte
   ===================================================== */

/* 1a · Hypoténuse. */
function s1a(R){
  const w = R.int(0, 3);
  let a, b, c, u, q, H, ctx = '';
  if (w === 3){
    [a, b, c] = R.pick(T_ECH); u = 'm'; H = 'L';
    q = `Le pied d'une échelle est posé sur le sol à ${nb(a)} m d'un mur vertical, et le haut de l'échelle touche le mur à ${nb(b)} m du sol. Quelle est la longueur de l'échelle ?`;
    ctx = 'Le mur, le sol et l\'échelle forment un triangle rectangle dont l\'échelle L est l\'hypoténuse. ';
  } else {
    const t = R.pick(T1), sw = R.int(0, 1);
    a = t[sw]; b = t[1 - sw]; c = t[2];
    if (w === 0){
      const T = R.pick(NOMS); u = 'cm'; H = T[1] + T[2];
      q = `Un triangle ${T} est rectangle en ${T[0]}, avec ${T[0]}${T[1]} = ${a} cm et ${T[0]}${T[2]} = ${b} cm. Combien mesure ${H} ?`;
    } else if (w === 1){
      a = t[1]; b = t[0]; u = 'cm'; H = 'd';
      q = `Un écran rectangulaire mesure ${a} cm de large et ${b} cm de haut. Combien mesure sa diagonale ?`;
      ctx = 'La diagonale d coupe l\'écran en deux triangles rectangles dont elle est l\'hypoténuse. ';
    } else {
      u = 'm'; H = 'd';
      q = `Un terrain rectangulaire mesure ${a} m sur ${b} m. Quelle est la longueur de sa diagonale ?`;
      ctx = 'La diagonale d coupe le terrain en deux triangles rectangles dont elle est l\'hypoténuse. ';
    }
  }
  const diff = b * b - a * a;
  const base = `Dans un triangle rectangle, le carré de l'hypoténuse (le côté opposé à l'angle droit) est égal à la somme des carrés des deux autres côtés. ${ctx}Ici ${H}² = ${nb(a)}² + ${nb(b)}² = ${nb(a * a)} + ${nb(b * b)} = ${nb(c * c)}, donc ${H} = ${nb(c)} ${u}.`;
  return mk(q, L(c, u), [
    [L(a + b, u), 'additionne les longueurs au lieu de leurs carrés'],
    [L(c * c, u), 'oublie de prendre la racine carrée'],
    [entier(Math.abs(diff)) ? racU(Math.abs(diff), u) : null, 'soustrait les carrés au lieu de les additionner']
  ], k => L(c + sg(k), u), base);
}

/* 1b · Côté de l'angle droit. */
function s1b(R){
  const w = R.int(0, 3);
  let a, b, c, u, q, X;
  if (w === 0){
    const t = R.pick(T1), sw = R.int(0, 1), T = R.pick(NOMS);
    a = t[sw]; b = t[1 - sw]; c = t[2]; u = 'cm'; X = T[0] + T[2];
    q = `Un triangle ${T} est rectangle en ${T[0]}, avec ${T[1]}${T[2]} = ${c} cm et ${T[0]}${T[1]} = ${a} cm. Combien mesure ${X} ?`;
  } else if (w === 1){
    [a, b, c] = R.pick(T_ECH); u = 'm'; X = 'h';
    q = `Une échelle de ${nb(c)} m est appuyée contre un mur vertical. Son pied est posé sur le sol à ${nb(a)} m du mur. À quelle hauteur le haut de l'échelle touche-t-il le mur ?`;
  } else if (w === 2){
    const t = R.pick(T1);
    a = t[1]; b = t[0]; c = t[2]; u = 'cm'; X = 'h';
    q = `Un écran rectangulaire a une diagonale de ${c} cm et une largeur de ${a} cm. Quelle est sa hauteur ?`;
  } else {
    const t = R.pick(T1), sw = R.int(0, 1);
    a = t[sw]; b = t[1 - sw]; c = t[2]; u = 'm'; X = 'h';
    q = `Un câble tendu de ${c} m relie le sommet d'un poteau vertical à un point du sol situé à ${a} m du pied du poteau. Quelle est la hauteur du poteau ?`;
  }
  const s = c * c + a * a;
  const base = `On cherche un côté de l'angle droit : on part du carré de l'hypoténuse (le plus grand côté) et on lui retire le carré du côté connu. Ici ${X}² = ${nb(c)}² − ${nb(a)}² = ${nb(c * c)} − ${nb(a * a)} = ${nb(b * b)}, donc ${X} = ${nb(b)} ${u}.`;
  return mk(q, L(b, u), [
    [L(c - a, u), 'soustrait les longueurs au lieu de leurs carrés'],
    [L(b * b, u), 'oublie de prendre la racine carrée'],
    [entier(s) ? racU(s, u) : null, 'additionne les carrés alors que l\'hypoténuse est déjà connue']
  ], k => L(b + sg(k), u), base);
}

/* 1c · Troisième angle d'un triangle. */
function s1c(R){
  const w = R.int(0, 2), T = R.pick(NOMS);
  if (w === 0){
    let x, y;
    do { x = R.int(25, 95); y = R.int(20, 165 - x); } while (x + y === 90);
    const z = 180 - x - y;
    const q = `Dans un triangle ${T}, l'angle en ${T[0]} mesure ${x}° et l'angle en ${T[1]} mesure ${y}°. Combien mesure l'angle en ${T[2]} ?`;
    const base = `La somme des trois angles d'un triangle vaut toujours 180° : on retire de 180° les deux angles connus. Ici 180 − ${x} − ${y} = ${z}°.`;
    return mk(q, deg(z), [
      [deg(360 - x - y), 'part de 360° (la somme des angles d\'un quadrilatère)'],
      [deg(x + y), 'est la somme des deux angles connus, pas le troisième angle'],
      [deg(180 - x), 'oublie de retirer l\'angle en ' + T[1]]
    ], k => deg(z + 5 * sg(k)), base);
  }
  if (w === 1){
    let x;
    do { x = R.int(12, 78); } while (x === 45);
    const q = `Un triangle ${T} est rectangle en ${T[0]}. L'angle en ${T[1]} mesure ${x}°. Combien mesure l'angle en ${T[2]} ?`;
    const base = `Dans un triangle rectangle, l'angle droit prend déjà 90° sur les 180°, donc les deux angles aigus se partagent les 90° restants. Ici 90 − ${x} = ${nb(90 - x)}°.`;
    return mk(q, deg(90 - x), [
      [deg(180 - x), 'oublie de retirer l\'angle droit'],
      [deg(x), 'supposerait le triangle isocèle'],
      [deg(90 + x), 'ajoute l\'angle au lieu de le retirer']
    ], k => deg(90 - x + 5 * sg(k)), base);
  }
  let x;
  do { x = 2 * R.int(10, 75); } while (x === 60);
  const z = (180 - x) / 2;
  const q = `Un triangle ${T} est isocèle en ${T[0]}, et l'angle en ${T[0]} mesure ${x}°. Combien mesure l'angle en ${T[1]} ?`;
  const base = `Dans un triangle isocèle, les deux angles à la base sont égaux : ils se partagent ce qui reste quand on retire de 180° l'angle au sommet principal. Ici (180 − ${x}) ÷ 2 = ${nb(180 - x)} ÷ 2 = ${z}°.`;
  return mk(q, deg(z), [
    [deg(180 - x), 'oublie de partager le reste entre les deux angles de la base'],
    [deg(x), 'recopie l\'angle au sommet principal'],
    [deg(180 - 2 * x), 'prend l\'angle donné pour un angle de la base']
  ], k => deg(z + 5 * sg(k)), base);
}

/* 1d · Aires usuelles. */
function s1d(R){
  const w = R.int(0, 3);
  if (w === 0){
    const T = R.pick(NOMS), b = R.int(4, 16), h = R.int(3, 12), s = h + R.int(1, 5), A2 = b * h / 2;
    const q = `Dans un triangle ${T}, le côté [${T[1]}${T[2]}] mesure ${b} cm, le côté [${T[0]}${T[1]}] mesure ${s} cm et la hauteur issue de ${T[0]} mesure ${h} cm. Quelle est l'aire du triangle ${T} ?`;
    const base = `L'aire d'un triangle vaut base × hauteur ÷ 2, la hauteur étant perpendiculaire à la base choisie. La hauteur issue de ${T[0]} est perpendiculaire au côté [${T[1]}${T[2]}], donc l'aire vaut ${b} × ${h} ÷ 2 = ${nb(A2)} cm².`;
    return mk(q, L(A2, 'cm²'), [
      [L(b * h, 'cm²'), 'oublie le ÷ 2'],
      [L(b * s / 2, 'cm²'), `prend le côté [${T[0]}${T[1]}], qui est oblique, pour une hauteur`],
      [L(s * h / 2, 'cm²'), 'multiplie la hauteur par le mauvais côté']
    ], k => L(A2 + sg(k), 'cm²'), base);
  }
  if (w === 1){
    const b = R.int(5, 15);
    let s; do { s = R.int(4, 12); } while (s === b);
    const h = R.int(2, s - 1);
    const q = `Un parallélogramme a des côtés de ${b} cm et ${s} cm. La hauteur relative au côté de ${b} cm mesure ${h} cm. Quelle est son aire ?`;
    const base = `L'aire d'un parallélogramme vaut base × hauteur, la hauteur étant perpendiculaire à la base (ce n'est pas l'autre côté, qui est penché). Ici ${b} × ${h} = ${nb(b * h)} cm².`;
    return mk(q, L(b * h, 'cm²'), [
      [L(b * s, 'cm²'), 'multiplie les deux côtés, comme pour un rectangle'],
      [L(b * h / 2, 'cm²'), 'ajoute un ÷ 2 qui ne sert que pour le triangle'],
      [L(2 * (b + s), 'cm²'), 'calcule le périmètre, pas l\'aire']
    ], k => L(b * h + sg(k) * 2, 'cm²'), base);
  }
  if (w === 2){
    const B = R.int(6, 20), b = R.int(2, B - 2), h = R.int(2, 12), A2 = (B + b) * h / 2;
    const q = `Un trapèze a deux côtés parallèles de ${B} cm et ${b} cm, séparés par une distance (la hauteur) de ${h} cm. Quelle est son aire ?`;
    const base = `L'aire d'un trapèze vaut (grande base + petite base) × hauteur ÷ 2 : c'est la moyenne des deux bases multipliée par la hauteur. Ici (${B} + ${b}) × ${h} ÷ 2 = ${nb(B + b)} × ${h} ÷ 2 = ${nb(A2)} cm².`;
    return mk(q, L(A2, 'cm²'), [
      [L((B + b) * h, 'cm²'), 'oublie le ÷ 2'],
      [L(B * h, 'cm²'), `traite la figure comme un rectangle de ${B} cm sur ${h} cm`],
      [L((B - b) * h / 2, 'cm²'), 'soustrait les bases au lieu de les additionner']
    ], k => L(A2 + sg(k), 'cm²'), base);
  }
  const D = R.int(6, 20), d = R.int(4, D - 2), A2 = D * d / 2;
  const q = `Un losange a des diagonales de ${D} cm et ${d} cm. Quelle est son aire ?`;
  const base = `L'aire d'un losange vaut grande diagonale × petite diagonale ÷ 2 : le losange occupe la moitié du rectangle formé par ses diagonales. Ici ${D} × ${d} ÷ 2 = ${nb(A2)} cm².`;
  return mk(q, L(A2, 'cm²'), [
    [L(D * d, 'cm²'), 'est l\'aire du rectangle qui entoure le losange, il faut la diviser par 2'],
    [L(D * d / 4, 'cm²'), 'divise par 4 au lieu de 2'],
    [L(2 * (D + d), 'cm²'), 'additionne les diagonales au lieu de les multiplier']
  ], k => L(A2 + sg(k), 'cm²'), base);
}

/* 1e · Longueur d'un cercle. */
function s1e(R){
  const w = R.int(0, 2);
  if (w === 0){
    let r; do { r = R.int(3, 20); } while (r === 4);
    const q = `Quelle est la longueur (le périmètre) d'un cercle de rayon ${r} cm ?`;
    const base = `La longueur d'un cercle de rayon r vaut 2 × π × r, c'est-à-dire π fois le diamètre. Ici 2 × π × ${r} = ${nb(2 * r)}π cm.`;
    return mk(q, piU(2 * r, 'cm'), [
      [piU(r * r, 'cm'), 'vient de la formule de l\'aire (π × r²)'],
      [piU(r, 'cm'), 'oublie le facteur 2'],
      [piU(4 * r, 'cm'), 'prend le diamètre pour le rayon']
    ], k => piU(2 * r + sg(k), 'cm'), base);
  }
  if (w === 1){
    let d; do { d = 2 * R.int(3, 15); } while (d === 8);
    const q = `Un cercle a un diamètre de ${d} cm. Quelle est sa longueur (son périmètre) ?`;
    const base = `La longueur d'un cercle vaut π × diamètre (ou 2 × π × rayon). Ici π × ${d} = ${d}π cm.`;
    return mk(q, piU(d, 'cm'), [
      [piU(2 * d, 'cm'), 'prend le diamètre pour le rayon dans 2 × π × r'],
      [piU(d * d / 4, 'cm'), 'vient de la formule de l\'aire (π × r²)'],
      [piU(d / 2, 'cm'), 'utilise le rayon au lieu du diamètre']
    ], k => piU(d + sg(k), 'cm'), base);
  }
  const r = R.pick([10, 20, 25, 50]), n = R.pick([1, 10, 100]), un = Math.round(628 * r) / 100;   // 2 × 3,14 × r
  if (n === 1){
    const q = `Une roue a un rayon de ${r} cm. Quelle distance parcourt-elle en faisant un tour complet, sans glisser ? On prend π ≈ 3,14.`;
    const base = `En un tour sans glisser, la roue avance d'une longueur égale à son périmètre, 2 × π × rayon. Ici 2 × 3,14 × ${r} = ${nb(un)} cm.`;
    return mk(q, L(un, 'cm'), [
      [L(un / 2, 'cm'), 'oublie le facteur 2 du périmètre'],
      [L(un * 2, 'cm'), 'prend le diamètre pour le rayon'],
      [L(3.14 * r * r, 'cm'), 'calcule l\'aire de la roue, pas son périmètre']
    ], k => L(un + sg(k) * 10, 'cm'), base);
  }
  const V = Math.round(un * n) / 100;   // en m
  const q = `Une roue a un rayon de ${r} cm. Quelle distance parcourt-elle en ${n} tours complets, sans glisser ? On prend π ≈ 3,14.`;
  const base = `En un tour sans glisser, la roue avance d'une longueur égale à son périmètre, 2 × π × rayon ; on multiplie ensuite par le nombre de tours et on convertit en mètres. Un tour : 2 × 3,14 × ${r} = ${nb(un)} cm. En ${n} tours : ${nb(un)} × ${n} = ${nb(un * n)} cm, soit ${nb(V)} m.`;
  return mk(q, L(V, 'm'), [
    [L(V / 2, 'm'), 'oublie le facteur 2 du périmètre'],
    [L(V * 2, 'm'), 'prend le diamètre pour le rayon'],
    [L(V * 10, 'm'), 'se trompe dans la conversion des centimètres en mètres']
  ], k => L(V + sg(k), 'm'), base);
}

/* =====================================================
   NIVEAU 2 · maîtrise
   ===================================================== */

/* 2a · Carré et diagonale. */
function s2a(R){
  const w = R.int(0, 3);
  if (w === 0){
    const d = R.int(3, 20), A2 = d * d / 2;
    const q = `Un carré a une diagonale de ${d} cm. Quelle est son aire ?`;
    const base = `Un carré est un losange particulier : son aire vaut diagonale × diagonale ÷ 2 (Pythagore donne aussi côté² = diagonale² ÷ 2). Ici ${d} × ${d} ÷ 2 = ${nb(A2)} cm².`;
    return mk(q, L(A2, 'cm²'), [
      [L(d * d, 'cm²'), 'prend la diagonale pour le côté'],
      [L(d * d / 4, 'cm²'), 'prend la moitié de la diagonale pour le côté'],
      [L(2 * d * d, 'cm²'), 'multiplie par 2 au lieu de diviser par 2']
    ], k => L(A2 + sg(k) * 2, 'cm²'), base);
  }
  if (w === 1){
    const r = R.int(2, 15);
    const q = `Un carré est inscrit dans un cercle de rayon ${r} cm : ses quatre sommets sont sur le cercle. Quelle est l'aire du carré ?`;
    const base = `Les diagonales du carré passent par le centre du cercle : chacune est un diamètre, et l'aire d'un carré vaut diagonale² ÷ 2. La diagonale mesure 2 × ${r} = ${nb(2 * r)} cm, donc l'aire vaut ${nb(2 * r)}² ÷ 2 = ${nb(4 * r * r)} ÷ 2 = ${nb(2 * r * r)} cm².`;
    return mk(q, L(2 * r * r, 'cm²'), [
      [L(r * r, 'cm²'), 'prend le rayon pour le côté du carré'],
      [L(4 * r * r, 'cm²'), 'prend le diamètre pour le côté du carré'],
      [piU(r * r, 'cm²'), 'est l\'aire du disque, pas celle du carré']
    ], k => L(2 * r * r + sg(k) * 2, 'cm²'), base);
  }
  if (w === 2){
    const m = R.int(2, 12), Aire = 2 * m * m;
    const q = `Un carré a une aire de ${Aire} cm². Combien mesure sa diagonale ?`;
    const base = `L'aire d'un carré vaut aussi diagonale² ÷ 2 : on multiplie l'aire par 2, puis on prend la racine carrée. Ici diagonale² = 2 × ${Aire} = ${nb(2 * Aire)}, donc la diagonale mesure ${nb(2 * m)} cm.`;
    return mk(q, L(2 * m, 'cm'), [
      [racU(Aire, 'cm'), `est le côté du carré (√${Aire}), pas sa diagonale`],
      [L(Aire / 2, 'cm'), 'divise l\'aire par 2 et oublie la racine carrée'],
      [racU(4 * Aire, 'cm'), 'double le côté au lieu de le multiplier par √2']
    ], k => L(2 * m + sg(k), 'cm'), base);
  }
  const c = R.int(2, 15);
  const q = `Un carré a un côté de ${c} cm. Combien mesure sa diagonale ?`;
  const base = `La diagonale partage le carré en deux triangles rectangles isocèles dont elle est l'hypoténuse : diagonale² = côté² + côté². Ici diagonale² = ${nb(c * c)} + ${nb(c * c)} = ${nb(2 * c * c)}, donc la diagonale mesure ${racEg(2 * c * c)} cm.`;
  return mk(q, racU(2 * c * c, 'cm'), [
    [L(2 * c, 'cm'), 'additionne les côtés au lieu de leurs carrés'],
    [racU(2 * c, 'cm'), 'oublie d\'élever les côtés au carré'],
    [racU(3 * c * c, 'cm'), 'confond avec la grande diagonale d\'un cube']
  ], k => racU(2 * c * c + sg(k), 'cm'), base);
}

/* 2b · Somme des angles d'un polygone, angle d'un polygone régulier. */
function s2b(R){
  if (R.int(0, 1)){
    const n = R.int(5, 20), S = (n - 2) * 180;
    const q = `Quelle est la somme des angles intérieurs ${polyConvexe(n)} ?`;
    const base = `Depuis un sommet, les diagonales découpent un polygone convexe à n côtés en n − 2 triangles, et chaque triangle apporte 180°. Ici ${n} − 2 = ${nb(n - 2)} triangles, donc la somme vaut ${nb(n - 2)} × 180 = ${degS(S)}.`;
    return mk(q, degS(S), [
      [degS(n * 180), `compte un triangle par côté (${n} au lieu de ${nb(n - 2)})`],
      [degS((n - 1) * 180), `compte ${nb(n - 1)} triangles au lieu de ${nb(n - 2)}`],
      [degS(360), 'est la somme des angles extérieurs, pas des angles intérieurs']
    ], k => degS(S + 180 * sg(k)), base);
  }
  const n = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]), e = 360 / n, x = 180 - e, S = (n - 2) * 180;
  const q = `Combien mesure chaque angle intérieur ${polyRegulier(n)} ?`;
  const base = `Dans un polygone régulier, l'angle extérieur vaut 360° ÷ n et l'angle intérieur est son supplémentaire (180° moins l'angle extérieur). Ici 360 ÷ ${n} = ${e}°, donc l'angle intérieur vaut 180 − ${e} = ${x}°. Autre chemin : ${nb(S)} ÷ ${n} = ${x}°, car la somme des angles vaut (${n} − 2) × 180 = ${degS(S)}.`;
  return mk(q, deg(x), [
    [deg(e), 'est l\'angle extérieur, pas l\'angle intérieur'],
    [degS(S), 'est la somme de tous les angles intérieurs'],
    [deg(180 - 180 / n), 'divise 180° au lieu de 360° par le nombre de côtés']
  ], k => deg(x + 2 * sg(k)), base);
}

/* 2c · Pythagore puis aire (triangle rectangle ou rectangle). */
function s2c(R){
  const t = R.pick(T1);
  if (R.int(0, 1)){
    const sw = R.int(0, 1), a = t[sw], b = t[1 - sw], c = t[2], T = R.pick(NOMS), X = T[0] + T[2];
    const q = `Un triangle ${T} est rectangle en ${T[0]}, avec ${T[1]}${T[2]} = ${c} cm et ${T[0]}${T[1]} = ${a} cm. Quelle est l'aire du triangle ${T} ?`;
    const base = `Dans un triangle rectangle, les deux côtés de l'angle droit servent de base et de hauteur : on trouve d'abord le côté qui manque avec Pythagore. ${X}² = ${c}² − ${a}² = ${nb(c * c)} − ${nb(a * a)} = ${nb(b * b)}, donc ${X} = ${b} cm. Aire : ${a} × ${b} ÷ 2 = ${nb(a * b / 2)} cm².`;
    return mk(q, L(a * b / 2, 'cm²'), [
      [L(a * c / 2, 'cm²'), 'prend l\'hypoténuse pour une hauteur'],
      [L(a * b, 'cm²'), 'oublie le ÷ 2'],
      [L(a * (c - a) / 2, 'cm²'), `prend ${c} − ${a} = ${nb(c - a)} cm pour le côté manquant`]
    ], k => L(a * b / 2 + sg(k) * 3, 'cm²'), base);
  }
  const a = t[0], b = t[1], c = t[2];
  const q = `Un rectangle a une diagonale de ${c} cm et une largeur de ${a} cm. Quelle est son aire ?`;
  const base = `La diagonale coupe le rectangle en deux triangles rectangles : Pythagore donne la longueur, puis aire = longueur × largeur. Longueur² = ${c}² − ${a}² = ${nb(c * c)} − ${nb(a * a)} = ${nb(b * b)}, donc la longueur mesure ${b} cm. Aire : ${b} × ${a} = ${nb(a * b)} cm².`;
  return mk(q, L(a * b, 'cm²'), [
    [L(a * c, 'cm²'), 'multiplie la largeur par la diagonale'],
    [L(a * b / 2, 'cm²'), 'calcule l\'aire d\'un seul des deux triangles'],
    [L(c * c / 2, 'cm²'), 'est l\'aire d\'un carré qui aurait cette diagonale']
  ], k => L(a * b + sg(k) * 4, 'cm²'), base);
}

/* 2d · Distance dans un repère. */
function s2d(R){
  let dx, dy;
  if (R.int(0, 2) > 0){ const t = R.pick(T1.slice(0, 7)), sw = R.int(0, 1); dx = t[sw]; dy = t[1 - sw]; }
  else { dx = R.int(1, 6); dy = R.int(1, 6); }
  const x1 = R.int(-6, 6), y1 = R.int(-6, 6), x2 = x1 + R.pick([1, -1]) * dx, y2 = y1 + R.pick([1, -1]) * dy;
  const P = R.pick(['AB', 'MN', 'EF', 'PQ', 'RS']), D2 = dx * dx + dy * dy, S2 = (x1 + x2) * (x1 + x2) + (y1 + y2) * (y1 + y2);
  const q = `Dans un repère orthonormé, on donne les points ${P[0]}(${nb(x1)} ; ${nb(y1)}) et ${P[1]}(${nb(x2)} ; ${nb(y2)}). Quelle est la distance ${P} ?`;
  const base = `Dans un repère orthonormé, l'écart des abscisses et l'écart des ordonnées sont les côtés de l'angle droit d'un triangle rectangle dont ${P} est l'hypoténuse. Écart des abscisses : ${nb(x2)} − ${par(x1)} = ${nb(x2 - x1)} ; écart des ordonnées : ${nb(y2)} − ${par(y1)} = ${nb(y2 - y1)}. ${P}² = ${par(x2 - x1)}² + ${par(y2 - y1)}² = ${nb(dx * dx)} + ${nb(dy * dy)} = ${D2}, donc ${P} = ${rac(D2)}.`;
  return mk(q, rac(D2), [
    [nb(dx + dy), 'additionne les écarts sans les élever au carré'],
    [nb(D2), 'oublie de prendre la racine carrée'],
    [S2 > 0 && S2 !== D2 ? rac(S2) : null, 'additionne les coordonnées au lieu de les soustraire']
  ], k => rac(D2 + sg(k)), base);
}

/* 2e · Inégalité triangulaire. */
function s2e(R){
  const w = R.int(0, 2);
  if (w === 0){
    const a = R.int(2, 12), b = a + R.int(1, 12), n = 2 * a - 1;
    const q = `Un triangle a deux côtés qui mesurent ${a} cm et ${b} cm. Son troisième côté mesure un nombre entier de centimètres. Combien de longueurs sont possibles pour ce troisième côté ?`;
    const base = `Dans un triangle, chaque côté est strictement plus petit que la somme des deux autres, donc le troisième côté x est strictement compris entre la différence et la somme des deux côtés connus. Ici ${b} − ${a} < x < ${b} + ${a}, soit ${nb(b - a)} < x < ${nb(a + b)} : x va de ${nb(b - a + 1)} à ${nb(a + b - 1)}, ce qui fait ${nb(a + b - 1)} − ${nb(b - a + 1)} + 1 = ${n} longueurs.`;
    return mk(q, nb(n), [
      [nb(n + 2), `garde les bornes ${nb(b - a)} et ${nb(a + b)}, qui donnent un triangle aplati`],
      [nb(n + 1), 'garde une des deux bornes'],
      [nb(a + b - 1), 'oublie la borne du bas']
    ], k => (n + sg(k) >= 1 ? nb(n + sg(k)) : null), base);
  }
  if (w === 1){
    const a = R.int(2, 12), b = a + R.int(2, 12), max = R.int(0, 1) === 1;
    const v = max ? a + b - 1 : b - a + 1;
    const q = `Un triangle a deux côtés de ${a} cm et ${b} cm. Son troisième côté mesure un nombre entier de centimètres. Quelle est la plus ${max ? 'grande' : 'petite'} longueur possible pour ce troisième côté ?`;
    const base = `Le troisième côté doit être strictement plus petit que la somme des deux autres et strictement plus grand que leur différence (inégalité triangulaire). Ici il est strictement compris entre ${nb(b - a)} et ${nb(a + b)}, donc la plus ${max ? 'grande' : 'petite'} longueur entière vaut ${v} cm.`;
    return mk(q, L(v, 'cm'), max ? [
      [L(a + b, 'cm'), 'donne un triangle aplati'],
      [L(b - a + 1, 'cm'), 'est la plus petite longueur possible'],
      [L(b, 'cm'), 'reprend le plus grand côté connu']
    ] : [
      [L(b - a, 'cm'), 'donne un triangle aplati'],
      [L(1, 'cm'), 'oublie que le troisième côté doit dépasser la différence des deux autres'],
      [L(a + b - 1, 'cm'), 'est la plus grande longueur possible']
    ], k => L(v + sg(k), 'cm'), base);
  }
  // cinq baguettes : combien de triangles non aplatis ?
  let t, bons, plats;
  do {
    const pool = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, 5).sort((x, y) => x - y);
    t = pool; bons = []; plats = [];
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) for (let k = j + 1; k < 5; k++){
      if (t[k] < t[i] + t[j]) bons.push([t[i], t[j], t[k]]); else if (t[k] === t[i] + t[j]) plats.push([t[i], t[j], t[k]]);
    }
  } while (bons.length < 1 || bons.length > 8);
  const v = bons.length, liste = l => l.map(x => x.join(', ')).join(' ; ');
  const q = `On dispose de cinq baguettes qui mesurent ${t[0]} cm, ${t[1]} cm, ${t[2]} cm, ${t[3]} cm et ${t[4]} cm. Combien de triangles non aplatis différents peut-on former en prenant trois de ces baguettes ?`;
  const base = `On passe en revue toutes les façons de choisir trois baguettes et on garde celles où la plus longue est strictement plus courte que la somme des deux autres (inégalité triangulaire). Sur les 10 choix possibles, conviennent : ${liste(bons)}, soit ${v} triangle${v > 1 ? 's' : ''}.` + (plats.length ? ` Les choix ${liste(plats)} donnent des triangles aplatis, car la plus longue est égale à la somme des deux autres.` : '');
  return mk(q, nb(v), [
    [nb(10), 'compte tous les choix de trois baguettes sans vérifier l\'inégalité triangulaire'],
    [plats.length ? nb(v + plats.length) : null, 'compte aussi les triangles aplatis'],
    [nb(v + 1), 'garde un triplet de trop'],
    [v > 1 ? nb(v - 1) : null, 'oublie un triplet']
  ], k => (v + sg(k) >= 1 && v + sg(k) !== 10 ? nb(v + sg(k)) : null), base);
}

/* 2f · Angles du triangle isocèle, angle extérieur. */
function s2f(R){
  const T = R.pick(NOMS);
  if (R.int(0, 1)){
    let x; do { x = R.int(20, 85); } while (x === 60);
    const z = 180 - 2 * x;
    const q = `Un triangle ${T} est isocèle en ${T[0]}, et l'angle en ${T[1]} mesure ${x}°. Combien mesure l'angle en ${T[0]} ?`;
    const base = `Dans un triangle isocèle en ${T[0]}, les angles en ${T[1]} et en ${T[2]} sont égaux, et l'angle en ${T[0]} est ce qui reste sur 180°. Ici l'angle en ${T[2]} mesure aussi ${x}°, donc l'angle en ${T[0]} vaut 180 − 2 × ${x} = ${z}°.`;
    return mk(q, deg(z), [
      [deg(180 - x), `oublie que l'angle en ${T[2]} mesure aussi ${x}°`],
      [deg((180 - x) / 2), 'prend l\'angle donné pour l\'angle au sommet principal'],
      [deg(x), 'supposerait les trois angles égaux']
    ], k => deg(z + 4 * sg(k)), base);
  }
  let x, y;
  do { x = R.int(25, 85); y = R.int(25, 150 - x); } while (x + y === 90);
  const z = 180 - x - y;
  const q = `Dans un triangle ${T}, l'angle en ${T[0]} mesure ${x}° et l'angle en ${T[1]} mesure ${y}°. On prolonge le côté [${T[1]}${T[2]}] au-delà de ${T[2]}. Combien mesure l'angle extérieur ainsi formé en ${T[2]}, entre ce prolongement et le côté [${T[2]}${T[0]}] ?`;
  const base = `L'angle extérieur en ${T[2]} et l'angle intérieur en ${T[2]} sont supplémentaires (ils font 180° ensemble). Angle intérieur en ${T[2]} : 180 − ${x} − ${y} = ${z}°, donc angle extérieur : 180 − ${z} = ${nb(x + y)}°. Raccourci : un angle extérieur d'un triangle est égal à la somme des deux angles intérieurs qui ne lui sont pas adjacents.`;
  return mk(q, deg(x + y), [
    [deg(z), `est l'angle intérieur en ${T[2]}, pas l'angle extérieur`],
    [deg(360 - x - y), 'part de 360° au lieu de 180°'],
    [deg(180 - x), `oublie l'angle en ${T[1]}`]
  ], k => deg(x + y + 5 * sg(k)), base);
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels
   ===================================================== */

/* 3a · Polygone régulier retrouvé. */
function s3a(R){
  const w = R.int(0, 2);
  if (w === 0){
    const n = R.pick(REG), e = 360 / n, x = 180 - e;
    const q = `Chaque angle intérieur d'un polygone régulier mesure ${x}°. Combien ce polygone a-t-il de côtés ?`;
    const base = `Passe par l'angle extérieur : dans un polygone régulier, il vaut 180° moins l'angle intérieur, et les angles extérieurs font 360° au total. Ici l'angle extérieur vaut 180 − ${x} = ${e}°, donc le nombre de côtés vaut 360 ÷ ${e} = ${n}.`;
    return mk(q, nb(n), [
      [n % 2 === 0 && n / 2 >= 3 ? nb(n / 2) : null, `vient de 180 ÷ ${e} au lieu de 360 ÷ ${e}`],
      [nb(n - 2), 'est le nombre de triangles du découpage, pas le nombre de côtés']
    ], k => (n + sg(k) >= 3 ? nb(n + sg(k)) : null), base);
  }
  if (w === 1){
    const n = R.int(5, 24), S = (n - 2) * 180;
    const q = `La somme des angles intérieurs d'un polygone convexe vaut ${degS(S)}. Combien ce polygone a-t-il de côtés ?`;
    const base = `La somme des angles d'un polygone convexe à n côtés vaut (n − 2) × 180° : on divise la somme par 180, puis on ajoute 2. Ici ${nb(S)} ÷ 180 = ${nb(n - 2)}, donc le polygone a ${nb(n - 2)} + 2 = ${n} côtés.`;
    return mk(q, nb(n), [
      [nb(n - 2), 'est le nombre de triangles du découpage, pas le nombre de côtés'],
      [nb(n - 1), 'ajoute 1 au lieu de 2'],
      [nb(S / 360 + 2) !== nb(n) && entier(S / 360) ? nb(S / 360 + 2) : null, 'divise par 360 au lieu de 180']
    ], k => (n + sg(k) >= 3 ? nb(n + sg(k)) : null), base);
  }
  const n = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]), e = 360 / n, x = 180 - e, d = x - e;
  const q = `Dans un polygone régulier, chaque angle intérieur mesure ${d}° de plus que chaque angle extérieur. Combien ce polygone a-t-il de côtés ?`;
  const base = `Un angle intérieur et l'angle extérieur voisin font 180° ensemble : on connaît leur somme et leur différence, ce qui donne l'angle extérieur, puis le nombre de côtés avec 360°. Ici extérieur + intérieur = 180 et intérieur − extérieur = ${d}, donc 2 × extérieur = 180 − ${d} = ${nb(180 - d)} et l'angle extérieur vaut ${e}°. Nombre de côtés : 360 ÷ ${e} = ${n}.`;
  return mk(q, nb(n), [
    [n % 2 === 0 && n / 2 >= 3 ? nb(n / 2) : null, 'oublie de diviser 180 − ' + d + ' par 2'],
    [entier(360 / d) && 360 / d >= 3 ? nb(360 / d) : null, `divise 360 par l'écart ${d} au lieu de l'angle extérieur`],
    [nb(n - 2), 'retire 2 au nombre de côtés']
  ], k => (n + sg(k) >= 3 ? nb(n + sg(k)) : null), base);
}

/* 3b · Losange. */
function s3b(R){
  const t = R.pick(T3), sw = R.int(0, 1), p = t[sw], r = t[1 - sw], c = t[2], D = 2 * p, d = 2 * r;
  if (R.int(0, 1)){
    const q = `Un losange a des diagonales de ${D} cm et ${d} cm. Quel est son périmètre ?`;
    const base = `Les diagonales d'un losange se coupent en leur milieu et à angle droit : chaque côté est l'hypoténuse d'un triangle rectangle dont les côtés de l'angle droit sont les demi-diagonales. Les demi-diagonales mesurent ${p} cm et ${r} cm, donc côté² = ${p}² + ${r}² = ${nb(p * p)} + ${nb(r * r)} = ${nb(c * c)} et le côté mesure ${c} cm. Périmètre : 4 × ${c} = ${nb(4 * c)} cm.`;
    return mk(q, L(4 * c, 'cm'), [
      [L(8 * c, 'cm'), 'utilise les diagonales entières au lieu des demi-diagonales'],
      [L(2 * (D + d), 'cm'), 'additionne les demi-diagonales au lieu de leurs carrés'],
      [L(D * d / 2, 'cm'), 'est l\'aire du losange, pas son périmètre']
    ], k => L(4 * c + 4 * sg(k), 'cm'), base);
  }
  const q = `Un losange a des côtés de ${c} cm et une diagonale de ${D} cm. Quelle est son aire ?`;
  const base = `Les diagonales d'un losange se coupent en leur milieu à angle droit : Pythagore donne la moitié de l'autre diagonale, puis aire = diagonale × diagonale ÷ 2. Demi-diagonale connue : ${p} cm ; l'autre vérifie x² = ${c}² − ${p}² = ${nb(c * c)} − ${nb(p * p)} = ${nb(r * r)}, donc x = ${r} cm et l'autre diagonale mesure ${d} cm. Aire : ${D} × ${d} ÷ 2 = ${nb(D * d / 2)} cm².`;
  return mk(q, L(D * d / 2, 'cm²'), [
    [L(D * d, 'cm²'), 'oublie le ÷ 2'],
    [L(c * c, 'cm²'), 'traite le losange comme un carré'],
    [L(D * r / 2, 'cm²'), 'prend la demi-diagonale au lieu de la diagonale entière']
  ], k => L(D * d / 2 + 2 * sg(k), 'cm²'), base);
}

/* 3c · Triangle isocèle ou équilatéral. */
function s3c(R){
  const w = R.int(0, 2);
  if (w === 1){
    const k = R.int(1, 10), c = 2 * k;
    const q = `Un triangle équilatéral a des côtés de ${c} cm. Combien mesure sa hauteur ?`;
    const base = `La hauteur d'un triangle équilatéral coupe le côté opposé en son milieu : elle forme un triangle rectangle d'hypoténuse un côté entier et dont un côté de l'angle droit vaut la moitié d'un côté. Hauteur² = ${c}² − ${k}² = ${nb(c * c)} − ${nb(k * k)} = ${nb(3 * k * k)}, donc la hauteur mesure ${racEg(3 * k * k)} cm.`;
    return mk(q, racU(3 * k * k, 'cm'), [
      [racU(5 * k * k, 'cm'), 'additionne les carrés au lieu de les soustraire'],
      [racU(12 * k * k, 'cm'), 'oublie de diviser par 2 (la hauteur vaut côté × √3 ÷ 2)'],
      [racU(2 * k * k, 'cm'), 'confond avec la formule de la diagonale d\'un carré']
    ], j => racU(3 * k * k + sg(j), 'cm'), base);
  }
  const t = R.pick(T3), sw = R.int(0, 1), p = t[sw], h = t[1 - sw], s = t[2], b = 2 * p;
  if (w === 0){
    const q = `Un triangle est isocèle : ses deux côtés égaux mesurent ${s} cm et sa base mesure ${b} cm. Quelle est son aire ?`;
    const base = `Dans un triangle isocèle, la hauteur issue du sommet principal coupe la base en son milieu : elle forme deux triangles rectangles, où Pythagore donne la hauteur. Demi-base : ${p} cm ; hauteur² = ${s}² − ${p}² = ${nb(s * s)} − ${nb(p * p)} = ${nb(h * h)}, donc la hauteur mesure ${h} cm. Aire : ${b} × ${h} ÷ 2 = ${nb(p * h)} cm².`;
    return mk(q, L(p * h, 'cm²'), [
      [L(b * s / 2, 'cm²'), 'prend un côté oblique pour la hauteur'],
      [L(b * h, 'cm²'), 'oublie le ÷ 2'],
      [L(s * s / 2, 'cm²'), 'fait comme si le triangle était rectangle au sommet principal']
    ], k => L(p * h + 2 * sg(k), 'cm²'), base);
  }
  const Aire = p * h;
  const q = `Un triangle isocèle a une base de ${b} cm et une aire de ${Aire} cm². Combien mesurent ses deux côtés égaux ?`;
  const base = `L'aire donne d'abord la hauteur (aire = base × hauteur ÷ 2), puis Pythagore donne le côté dans le triangle rectangle formé par la hauteur et la demi-base. Hauteur : 2 × ${Aire} ÷ ${b} = ${h} cm. Côté² = ${h}² + ${p}² = ${nb(h * h)} + ${nb(p * p)} = ${nb(s * s)}, donc chaque côté égal mesure ${s} cm.`;
  return mk(q, L(s, 'cm'), [
    [L(h, 'cm'), 'est la hauteur, pas le côté'],
    [racU(h * h + b * b, 'cm'), 'utilise la base entière au lieu de la demi-base'],
    [L(h + p, 'cm'), 'additionne la hauteur et la demi-base au lieu de leurs carrés']
  ], k => L(s + sg(k), 'cm'), base);
}

/* 3d · Échelle qui glisse. */
function s3d(R){
  const [c0, a1, a2, h1, h2] = R.pick(ECH);
  let f, u, objet;
  if (c0 === 25){ [f, u, objet] = R.pick([[1, 'm', 'Une grande échelle de pompiers'], [0.1, 'm', 'Une échelle'], [10, 'cm', 'Une échelle']]); }
  else { [f, u, objet] = [1, 'cm', 'Une planche']; }
  const v = x => nb(x * f);
  const c = c0 * f;
  if (R.int(0, 1)){
    const D = (h1 - h2) * f;
    const q = `${objet} de ${v(c0)} ${u} est appuyée contre un mur vertical, son pied étant posé sur le sol à ${v(a1)} ${u} du mur. Le pied glisse et s'éloigne : il se retrouve à ${v(a2)} ${u} du mur, le haut touchant toujours le mur. De combien le haut est-il descendu ?`;
    const base = `Calcule la hauteur atteinte par le haut avant et après avec Pythagore (la longueur de l'objet est l'hypoténuse), puis fais la différence. Avant : h² = ${v(c0)}² − ${v(a1)}² = ${nb(c * c)} − ${nb(a1 * a1 * f * f)} = ${nb(h1 * h1 * f * f)}, donc h = ${v(h1)} ${u}. Après : h² = ${nb(c * c)} − ${nb(a2 * a2 * f * f)} = ${nb(h2 * h2 * f * f)}, donc h = ${v(h2)} ${u}. Le haut descend de ${v(h1)} − ${v(h2)} = ${nb(D)} ${u}.`;
    return mk(q, L(D, u), [
      [L((a2 - a1) * f, u), 'suppose que le haut descend d\'autant que le pied s\'éloigne'],
      [L(h2 * f, u), 'est la nouvelle hauteur, pas la descente'],
      [L(h1 * f, u), 'est la hauteur de départ']
    ], k => L(D + sg(k) * f, u), base);
  }
  const X = (h1 - h2) * f, M = (a2 - a1) * f;
  const q = `${objet} de ${v(c0)} ${u} est appuyée contre un mur vertical, son pied étant posé sur le sol à ${v(a1)} ${u} du mur. Le haut glisse le long du mur et descend de ${nb(X)} ${u}. De combien le pied s'est-il éloigné du mur ?`;
  const base = `Calcule la hauteur de départ avec Pythagore (la longueur de l'objet est l'hypoténuse), retire la descente, puis retrouve la nouvelle distance du pied au mur avec Pythagore. Départ : h² = ${v(c0)}² − ${v(a1)}² = ${nb(c * c)} − ${nb(a1 * a1 * f * f)} = ${nb(h1 * h1 * f * f)}, donc h = ${v(h1)} ${u}. Après : h = ${v(h1)} − ${nb(X)} = ${v(h2)} ${u}, et pied² = ${nb(c * c)} − ${nb(h2 * h2 * f * f)} = ${nb(a2 * a2 * f * f)}, donc le pied est à ${v(a2)} ${u}. Il s'est éloigné de ${v(a2)} − ${v(a1)} = ${nb(M)} ${u}.`;
  return mk(q, L(M, u), [
    [L(X, u), 'suppose que le pied s\'éloigne d\'autant que le haut descend'],
    [L(a2 * f, u), 'est la nouvelle distance au mur, pas le déplacement'],
    [L(h2 * f, u), 'est la nouvelle hauteur']
  ], k => L(M + sg(k) * f, u), base);
}

/* 3e · Angles liés par des relations. */
function s3e(R){
  const w = R.int(0, 2), T = R.pick(NOMS);
  if (w === 0){
    const [p, q2, r] = R.pick(RAP), s = p + q2 + r, k = 180 / s, grand = R.int(0, 1) === 1, x = grand ? r : p;
    const q = `Les trois angles d'un triangle sont proportionnels aux nombres ${p}, ${q2} et ${r}. Combien mesure le plus ${grand ? 'grand' : 'petit'} de ces angles ?`;
    const base = `On partage 180° en parts égales : il y a autant de parts que la somme des trois nombres, et chaque angle reçoit son nombre de parts. Ici ${p} + ${q2} + ${r} = ${s} parts, une part vaut 180 ÷ ${s} = ${k}°, donc les angles mesurent ${nb(p * k)}°, ${nb(q2 * k)}° et ${nb(r * k)}°. Le plus ${grand ? 'grand' : 'petit'} mesure ${nb(x * k)}°.`;
    return mk(q, deg(x * k), [
      [deg(360 * x / s), 'partage 360° au lieu de 180°'],
      [deg((grand ? p : r) * k), `est le plus ${grand ? 'petit' : 'grand'} angle`],
      [deg(q2 * k), 'est l\'angle du milieu']
    ], j => deg(x * k + 5 * sg(j)), base);
  }
  if (w === 1){
    let a, z;
    do { a = R.int(15, 55); z = 180 - 3 * a; } while (z === a || z === 2 * a || z <= 0);
    const q = `Dans un triangle ${T}, l'angle en ${T[1]} est le double de l'angle en ${T[0]}, et l'angle en ${T[2]} mesure ${z}°. Combien mesure l'angle en ${T[1]} ?`;
    const base = `Pose x pour l'angle en ${T[0]} : l'angle en ${T[1]} vaut 2x, et la somme des trois angles vaut 180°. Ici x + 2x + ${z} = 180, donc 3x = ${nb(180 - z)} et x = ${a}°. L'angle en ${T[1]} vaut 2 × ${a} = ${nb(2 * a)}°.`;
    return mk(q, deg(2 * a), [
      [deg(a), `est l'angle en ${T[0]}`],
      [deg((180 - z) / 2), 'partage le reste en deux parts égales'],
      [deg(180 - z), `attribue tout le reste à l'angle en ${T[1]}`]
    ], j => deg(2 * a + 4 * sg(j)), base);
  }
  let a, d;
  do { a = R.int(15, 40); d = 180 - 4 * a; } while (d <= 0 || d === a || 2 * a === a + d);
  const q = `Dans un triangle ${T}, l'angle en ${T[1]} mesure ${d}° de plus que l'angle en ${T[0]}, et l'angle en ${T[2]} est le double de l'angle en ${T[0]}. Combien mesure l'angle en ${T[2]} ?`;
  const base = `Exprime les trois angles en fonction de l'angle en ${T[0]}, noté x, puis écris que leur somme vaut 180°. Ici x + (x + ${d}) + 2x = 180, donc 4x = ${nb(180 - d)} et x = ${a}°. L'angle en ${T[2]} vaut 2 × ${a} = ${nb(2 * a)}°.`;
  return mk(q, deg(2 * a), [
    [deg(a), `est l'angle en ${T[0]}`],
    [deg(a + d), `est l'angle en ${T[1]}`],
    [entier(2 * (180 - d) / 3) ? deg(2 * (180 - d) / 3) : null, `écrit x + ${d} + 2x = 180 en oubliant un des x`]
  ], j => deg(2 * a + 4 * sg(j)), base);
}

/* 3f · Aire d'un triangle dans un repère (rectangle englobant moins trois triangles). */
function s3f(R){
  for (let essai = 0; essai < 200; essai++){
    const P = [[R.int(0, 8), R.int(0, 8)], [R.int(0, 8), R.int(0, 8)], [R.int(0, 8), R.int(0, 8)]];
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    if (new Set(xs).size < 3 || new Set(ys).size < 3) continue;
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), W = x1 - x0, H = y1 - y0;
    const coins = P.filter(([x, y]) => (x === x0 || x === x1) && (y === y0 || y === y1));
    if (coins.length !== 1) continue;
    const cr = Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]));
    const Aire = cr / 2;
    if (Aire < 4 || Aire * 2 === W * H) continue;
    // triangles des coins : le sommet en coin V, les deux autres sur les côtés opposés
    const V = coins[0], O = P.filter(p => p !== V);
    const tri = O.map(p => Math.abs(p[0] - V[0]) * Math.abs(p[1] - V[1]) / 2);
    const t3 = (Math.abs(O[0][0] - O[1][0]) * Math.abs(O[0][1] - O[1][1])) / 2;
    if (Math.abs(W * H - tri[0] - tri[1] - t3 - Aire) > 1e-9) continue;
    const pt = (n, p) => `${n}(${p[0]} ; ${p[1]})`;
    const q = `Dans un repère orthonormé, on place les points ${pt('A', P[0])}, ${pt('B', P[1])} et ${pt('C', P[2])}. Quelle est l'aire du triangle ABC, en unités d'aire ?`;
    const base = `Encadre le triangle dans un rectangle aux côtés parallèles aux axes, puis retire de l'aire de ce rectangle les triangles rectangles qui restent dans les coins. Rectangle : x de ${x0} à ${x1} et y de ${y0} à ${y1}, soit ${W} × ${H} = ${nb(W * H)}. Les trois triangles à retirer ont pour aires ${nb(tri[0])}, ${nb(tri[1])} et ${nb(t3)} (côtés de l'angle droit lus sur les axes, produit divisé par 2). Aire : ${nb(W * H)} − ${nb(tri[0])} − ${nb(tri[1])} − ${nb(t3)} = ${nb(Aire)}.`;
    return mk(q, nb(Aire), [
      [nb(W * H / 2), 'suppose que le triangle occupe la moitié du rectangle qui l\'entoure'],
      [nb(cr), 'oublie le ÷ 2'],
      [nb(W * H), 'est l\'aire du rectangle qui entoure le triangle']
    ], k => (Aire + sg(k) > 0 ? nb(Aire + sg(k)) : null), base);
  }
  return null;
}

/* 3g · Trapèze rectangle. */
function s3g(R){
  const t = R.pick(T3), sw = R.int(0, 1), dd = t[sw], h = t[1 - sw], s = t[2], b = R.int(2, 12), B = b + dd, Aire = (B + b) * h / 2;
  const q = `Un trapèze ABCD a deux angles droits, en A et en D. Ses côtés parallèles mesurent AB = ${B} cm et DC = ${b} cm, et son côté oblique mesure BC = ${s} cm. Quelle est son aire ?`;
  const base = `Trace la hauteur issue de C : elle découpe un rectangle et un triangle rectangle d'hypoténuse [BC], dont un côté vaut la différence des bases ; Pythagore donne alors la hauteur. Différence des bases : ${B} − ${b} = ${dd} cm ; hauteur² = ${s}² − ${dd}² = ${nb(s * s)} − ${nb(dd * dd)} = ${nb(h * h)}, donc la hauteur mesure ${h} cm. Aire : (${B} + ${b}) × ${h} ÷ 2 = ${nb(Aire)} cm².`;
  return mk(q, L(Aire, 'cm²'), [
    [L((B + b) * s / 2, 'cm²'), `prend le côté oblique (${s} cm) pour la hauteur`],
    [L((B + b) * h, 'cm²'), 'oublie le ÷ 2'],
    [L(B * h, 'cm²'), 'traite le trapèze comme un rectangle']
  ], k => L(Aire + 2 * sg(k), 'cm²'), base);
}

/* =====================================================
   NIVEAU 4 · plus dur que les exemples officiels
   ===================================================== */

/* 4a · Grande diagonale d'un pavé ou d'un cube. */
function s4a(R){
  const w = R.int(0, 2);
  if (w === 2){
    const a = R.int(2, 12);
    const q = `Un cube a des arêtes de ${a} cm. Quelle est la longueur de la diagonale qui relie deux sommets opposés du cube (en passant par l'intérieur) ?`;
    const base = `On applique Pythagore deux fois : d'abord dans une face (diagonale d'un carré), puis dans le triangle rectangle formé par cette diagonale et une arête verticale ; au total, d² = a² + a² + a². Ici d² = 3 × ${nb(a * a)} = ${nb(3 * a * a)}, donc d = ${rac(3 * a * a)} cm.`;
    return mk(q, racU(3 * a * a, 'cm'), [
      [racU(2 * a * a, 'cm'), 'est seulement la diagonale d\'une face'],
      [L(3 * a, 'cm'), 'additionne trois arêtes'],
      [racU(3 * a, 'cm'), 'oublie d\'élever les arêtes au carré']
    ], k => racU(3 * a * a + sg(k), 'cm'), base);
  }
  let a, b, c, d, u, q;
  if (w === 1){
    const salles = QUAD.filter(t => t[0] >= 2 && t[0] <= 4 && t[2] <= 14);
    [c, a, b, d] = R.pick(salles);                                 // c = hauteur (la plus petite)
    u = 'm';
    q = `Une pièce mesure ${b} m de long, ${a} m de large et ${c} m de haut. Quelle est la distance en ligne droite entre un coin du sol et le coin du plafond le plus éloigné ?`;
  } else {
    const t = R.pick(QUAD.filter(t => t[0] >= 2)), o = R.shuffle([t[0], t[1], t[2]]);
    [a, b, c] = o; d = t[3]; u = 'cm';
    q = `Une boîte en forme de pavé droit mesure ${a} cm × ${b} cm × ${c} cm à l'intérieur. Quelle est la longueur de la plus longue baguette, droite et très fine, qu'on peut y ranger ?`;
  }
  const s = [a, b, c].sort((x, y) => x - y);
  const base = `La plus grande longueur dans un pavé est sa grande diagonale : Pythagore dans une face, puis Pythagore dans le triangle rectangle formé par cette diagonale de face et une arête, ce qui donne d² = a² + b² + c². Ici d² = ${a}² + ${b}² + ${c}² = ${nb(a * a)} + ${nb(b * b)} + ${nb(c * c)} = ${nb(d * d)}, donc d = ${d} ${u}.`;
  return mk(q, L(d, u), [
    [racU(s[1] * s[1] + s[2] * s[2], u), 'n\'est que la diagonale de la plus grande face'],
    [L(a + b + c, u), 'additionne les trois arêtes'],
    [L(d * d, u), 'oublie de prendre la racine carrée']
  ], k => L(d + sg(k), u), base);
}

/* 4b · Ficelle enroulée sur un cylindre. */
function s4b(R){
  const [n, p, h, z] = R.pick(CYL), np = n * p;
  const tours = n === 1 ? 'exactement un tour' : `exactement ${n} tours`;
  const q = `Un cylindre a une hauteur de ${h} cm, et le tour de sa base (son périmètre) mesure ${p} cm. Une ficelle part d'un point du bord du bas, s'enroule en faisant ${tours} autour du cylindre en montant régulièrement, et arrive au point du bord du haut situé juste au-dessus de son départ. Quelle est la longueur de la ficelle ?`;
  const base = `Déroule la surface du cylindre : elle devient un rectangle, et la ficelle devient un segment, hypoténuse d'un triangle rectangle. ${n === 1 ? `Un côté vaut le périmètre, ${p} cm` : `Les ${n} tours mis bout à bout font ${n} × ${p} = ${np} cm de large`}, l'autre la hauteur, ${h} cm : L² = ${np}² + ${h}² = ${nb(np * np)} + ${nb(h * h)} = ${nb(z * z)}, donc L = ${z} cm.`;
  const items = n === 1 ? [
    [L(h + p, 'cm'), 'additionne les longueurs au lieu de leurs carrés'],
    [L(z * z, 'cm'), 'oublie de prendre la racine carrée'],
    [racU(Math.abs(p * p - h * h), 'cm'), 'soustrait les carrés au lieu de les additionner']
  ] : [
    [racU(p * p + h * h, 'cm'), 'ne compte qu\'un seul tour'],
    [racU(n * n * (p * p + h * h), 'cm'), `fait monter la ficelle de ${h} cm à chaque tour`],
    [L(h + np, 'cm'), 'additionne les longueurs au lieu de leurs carrés']
  ];
  return mk(q, L(z, 'cm'), items, k => L(z + sg(k), 'cm'), base);
}

/* 4c · Hauteur relative à l'hypoténuse. */
function s4c(R){
  const [a0, b0, c] = R.pick(HYP), sw = R.int(0, 1), a = sw ? b0 : a0, b = sw ? a0 : b0, h = a * b / c;
  let q;
  if (R.int(0, 1)){
    const T = R.pick(NOMS);
    q = `Un triangle ${T} est rectangle en ${T[0]}, avec ${T[0]}${T[1]} = ${a} cm et ${T[0]}${T[2]} = ${b} cm. Combien mesure la hauteur issue de ${T[0]} ?`;
  } else {
    q = `Un rectangle mesure ${a} cm sur ${b} cm. Quelle est la distance entre un de ses sommets et la diagonale qui ne passe pas par ce sommet ?`;
  }
  const base = `Calcule l'aire du triangle rectangle de deux façons : avec les deux côtés de l'angle droit, puis avec l'hypoténuse comme base et la hauteur cherchée. Hypoténuse : √(${nb(a * a)} + ${nb(b * b)}) = √${nb(c * c)} = ${c} cm. Aire : ${a} × ${b} ÷ 2 = ${nb(a * b / 2)} cm². Avec l'hypoténuse : ${c} × h ÷ 2 = ${nb(a * b / 2)}, donc h = ${nb(a * b)} ÷ ${c} = ${nb(h)} cm.`;
  return mk(q, L(h, 'cm'), [
    [L(c / 2, 'cm'), 'est la moitié de l\'hypoténuse (la médiane, pas la hauteur)'],
    [L((a + b) / 2, 'cm'), 'fait la moyenne des deux côtés'],
    [L(a * b / 2, 'cm'), 'est l\'aire du triangle, pas une longueur']
  ], k => L(h + 0.2 * sg(k), 'cm'), base);
}

/* 4d · Diagonales et polygones réguliers. */
function s4d(R){
  const w = R.int(0, 2);
  if (w === 0){
    const n = R.int(5, 15), S = (n - 2) * 180, D = n * (n - 3) / 2, m = n - 2;
    const q = `La somme des angles intérieurs d'un polygone convexe vaut ${degS(S)}. Combien ce polygone a-t-il de diagonales ?`;
    const base = `Retrouve d'abord le nombre de côtés n avec (n − 2) × 180° = somme des angles, puis compte les diagonales : chaque sommet est relié à n − 3 autres sommets par une diagonale, et chaque diagonale est comptée deux fois. Ici ${nb(S)} ÷ 180 = ${nb(n - 2)}, donc n = ${n}. Diagonales : ${n} × ${nb(n - 3)} ÷ 2 = ${D}.`;
    return mk(q, nb(D), [
      [nb(n * (n - 1) / 2), 'compte aussi les côtés'],
      [nb(n * (n - 3)), 'compte chaque diagonale deux fois'],
      [m >= 4 ? nb(m * (m - 3) / 2) : null, `utilise ${m} côtés au lieu de ${n}`]
    ], k => (D + sg(k) > 0 ? nb(D + sg(k)) : null), base);
  }
  if (w === 1){
    const k = R.pick([2, 3, 4, 5, 8, 9, 11, 14, 17, 19, 29]), e = 180 / (k + 1), n = 360 / e;
    const q = `Dans un polygone régulier, chaque angle intérieur vaut ${k} fois l'angle extérieur. Combien ce polygone a-t-il de côtés ?`;
    const base = `Un angle intérieur et l'angle extérieur voisin font 180° ensemble : si l'extérieur vaut e, l'intérieur vaut ${k}e, donc (${k} + 1) × e = 180°, puis le nombre de côtés vaut 360° ÷ e. Ici e = 180 ÷ ${nb(k + 1)} = ${nb(e)}°, et le nombre de côtés vaut 360 ÷ ${nb(e)} = ${n}.`;
    return mk(q, nb(n), [
      [nb(k + 1), 'divise 180° au lieu de 360° par l\'angle extérieur'],
      [nb(2 * k), `écrit ${k}e = 180° en oubliant l'angle extérieur lui-même`],
      [nb(n + 2), 'ajoute 2 côtés de trop']
    ], j => (n + sg(j) >= 3 ? nb(n + sg(j)) : null), base);
  }
  const n = R.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), e = 360 / n, x = 180 - e, D = n * (n - 3) / 2;
  const q = `Chaque angle intérieur d'un polygone régulier mesure ${x}°. Combien ce polygone a-t-il de diagonales ?`;
  const base = `Retrouve le nombre de côtés grâce à l'angle extérieur (360° au total), puis compte les diagonales : chaque sommet en envoie n − 3, et chacune est comptée deux fois. Angle extérieur : 180 − ${x} = ${e}°, donc n = 360 ÷ ${e} = ${n}. Diagonales : ${n} × ${nb(n - 3)} ÷ 2 = ${D}.`;
  return mk(q, nb(D), [
    [nb(n * (n - 1) / 2), 'compte aussi les côtés'],
    [nb(n * (n - 3)), 'compte chaque diagonale deux fois'],
    [nb(n - 3), 'ne compte que les diagonales issues d\'un seul sommet']
  ], k => (D + sg(k) > 0 ? nb(D + sg(k)) : null), base);
}

/* 4e · Angle entre trois sommets d'un polygone régulier. */
function s4e(R){
  const n = R.pick([5, 6, 8, 10, 12]), lettres = 'ABCDEFGHIJKL'.slice(0, n);
  const adj = (i, j) => (i - j + n) % n === 1 || (j - i + n) % n === 1;
  let v, p, r;
  do { v = R.int(0, n - 1); p = R.int(0, n - 1); r = R.int(0, n - 1); }
  while (p === v || r === v || p === r || (adj(v, p) && adj(v, r)));
  // arc de p à r qui ne contient pas v
  const avance = (r - p + n) % n, vEntre = ((v - p + n) % n) < avance, k = vEntre ? n - avance : avance;
  const unite = 180 / n, x = k * unite, interieur = 180 - 360 / n;
  const P = lettres[p], V = lettres[v], Q = lettres[r];
  const q = `${lettres} est un ${NOMPOLY[n]} régulier : ses sommets sont nommés dans l'ordre en tournant. Combien mesure l'angle ${P}${V}${Q}, de sommet ${V} ?`;
  const base = `Dans un polygone régulier, chaque côté est vu depuis un autre sommet sous un même angle de 180° ÷ n : on le voit avec le triangle isocèle formé par deux côtés consécutifs. Ici l'angle intérieur vaut 180 − 360 ÷ ${n} = ${nb(interieur)}°, donc dans le triangle isocèle formé par deux côtés consécutifs, les deux autres angles valent (180 − ${nb(interieur)}) ÷ 2 = ${nb(unite)}°. Entre ${P} et ${Q}, du côté opposé à ${V}, il y a ${k} côté${k > 1 ? 's' : ''}, donc l'angle ${P}${V}${Q} mesure ${k} × ${nb(unite)} = ${nb(x)}°.`;
  return mk(q, deg(x), [
    [deg(interieur), `est l'angle intérieur complet en ${V}`],
    [deg(2 * x), 'confond avec l\'angle au centre du polygone'],
    [deg(180 - x), 'prend le supplémentaire de l\'angle cherché']
  ], j => deg(x + unite * sg(j)), base);
}

/* 4f · Rectangle : périmètre et diagonale (côtés entiers). */
function s4f(R){
  const [a, b, c] = R.pick(TRIPLES.filter(t => t[2] <= 50)), s = a + b, P = 2 * s;
  const q = `Un rectangle a un périmètre de ${P} cm et une diagonale de ${c} cm. Quelle est son aire ?`;
  const base = `Note L et l les côtés : tu connais L + l (le demi-périmètre) et L² + l² (Pythagore avec la diagonale), et l'aire L × l se déduit de (L + l)² = L² + l² + 2 × L × l. Ici L + l = ${s} et L² + l² = ${nb(c * c)}, donc 2 × L × l = ${nb(s * s)} − ${nb(c * c)} = ${nb(2 * a * b)} et l'aire vaut ${nb(a * b)} cm². Vérification : ${a} + ${b} = ${s} et ${a}² + ${b}² = ${nb(c * c)}.`;
  return mk(q, L(a * b, 'cm²'), [
    [L(2 * a * b, 'cm²'), 'oublie de diviser par 2'],
    [L(c * c / 2, 'cm²'), 'suppose que le rectangle est un carré de cette diagonale'],
    [L(s * s / 4, 'cm²'), 'suppose que le rectangle est un carré de ce périmètre']
  ], k => L(a * b + 2 * sg(k), 'cm²'), base);
}

/* 4g · Suite de triangles rectangles. */
function s4g(R){
  const [a, b, N, r] = R.pick(SPI), S = a * a + N * b * b, h1 = Math.sqrt(a * a + b * b);
  const q = `On construit une suite de triangles rectangles. Le premier a des côtés de l'angle droit de ${a} cm et ${b} cm. Chaque nouveau triangle a pour côtés de l'angle droit l'hypoténuse du triangle précédent et un segment de ${b} cm. Combien mesure l'hypoténuse du ${N}e triangle ?`;
  const base = `À chaque nouveau triangle, Pythagore ajoute le carré du segment au carré de l'hypoténuse : il suffit de suivre les carrés, pas les longueurs. Premier triangle : hypoténuse² = ${a}² + ${b}² = ${nb(a * a + b * b)}. Chaque triangle suivant ajoute ${b}² = ${nb(b * b)}, donc le ${N}e a pour hypoténuse² = ${nb(a * a)} + ${N} × ${nb(b * b)} = ${S}, et son hypoténuse mesure √${S} = ${r} cm.`;
  return mk(q, L(r, 'cm'), [
    [racU(a * a + (N - 1) * b * b, 'cm'), `compte ${nb(N - 1)} segments au lieu de ${N}`],
    [racU(a * a + (N + 1) * b * b, 'cm'), `compte ${nb(N + 1)} segments au lieu de ${N}`],
    [entier(h1) ? L(h1 + (N - 1) * b, 'cm') : L(a + N * b, 'cm'), 'additionne les longueurs au lieu de leurs carrés']
  ], k => L(r + sg(k), 'cm'), base);
}

/* 4h · Aire d'un quadrilatère dans un repère. */
function s4h(R){
  for (let essai = 0; essai < 200; essai++){
    const W = R.int(4, 9), H = R.int(4, 9), ox = R.int(0, 3), oy = R.int(0, 3);
    const x1 = R.int(1, W - 1), y2 = R.int(1, H - 1), x3 = R.int(1, W - 1), y4 = R.int(1, H - 1);
    const t = [x1 * y4 / 2, (W - x1) * y2 / 2, (W - x3) * (H - y2) / 2, x3 * (H - y4) / 2], S = t[0] + t[1] + t[2] + t[3], Aire = W * H - S;
    if (Aire * 2 === W * H) continue;
    const P = [[x1 + ox, oy], [W + ox, y2 + oy], [x3 + ox, H + oy], [ox, y4 + oy]];
    const pt = (n, p) => `${n}(${p[0]} ; ${p[1]})`;
    const q = `Dans un repère orthonormé, on place les points ${pt('A', P[0])}, ${pt('B', P[1])}, ${pt('C', P[2])} et ${pt('D', P[3])}. Quelle est l'aire du quadrilatère ABCD, en unités d'aire ?`;
    const base = `Encadre le quadrilatère dans un rectangle aux côtés parallèles aux axes : chaque sommet est sur un côté de ce rectangle, et il reste à retirer les quatre triangles rectangles des coins. Rectangle : x de ${ox} à ${nb(W + ox)} et y de ${oy} à ${nb(H + oy)}, soit ${W} × ${H} = ${nb(W * H)}. Triangles des coins : ${nb(t[0])}, ${nb(t[1])}, ${nb(t[2])} et ${nb(t[3])}, soit ${nb(S)} au total. Aire : ${nb(W * H)} − ${nb(S)} = ${nb(Aire)}.`;
    return mk(q, nb(Aire), [
      [nb(W * H), 'est l\'aire du rectangle qui entoure le quadrilatère'],
      [nb(W * H / 2), 'suppose que le quadrilatère occupe la moitié du rectangle'],
      [nb(S), 'est l\'aire des quatre coins retirés, pas celle du quadrilatère']
    ], k => (Aire + sg(k) > 0 ? nb(Aire + sg(k)) : null), base);
  }
  return null;
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif
   ===================================================== */

/* 5a · Aire d'un triangle à côtés entiers. */
function s5a(R){
  const [s1, s2, b, h, x1, x2] = R.pick(HERON), Aire = b * h / 2, cotes = R.shuffle([s1, s2, b]);
  const q = `Un triangle a des côtés de ${cotes[0]} cm, ${cotes[1]} cm et ${cotes[2]} cm. Quelle est son aire ?`;
  const base = `Trace une hauteur : elle découpe le triangle en deux triangles rectangles qui ont cette hauteur en commun, et Pythagore écrit dans chacun d'eux donne la position du pied de la hauteur. Prends le côté de ${b} cm comme base et note x la distance entre le pied de la hauteur et l'extrémité commune avec le côté de ${s1} cm : ${s1}² − x² = ${s2}² − (${b} − x)², ce qui donne ${nb(2 * b)}x = ${nb(s1 * s1)} − ${nb(s2 * s2)} + ${nb(b * b)} = ${nb(2 * b * x1)}, donc x = ${x1}. Hauteur² = ${s1}² − ${x1}² = ${nb(s1 * s1)} − ${nb(x1 * x1)} = ${nb(h * h)}, donc la hauteur mesure ${h} cm. Aire : ${b} × ${h} ÷ 2 = ${nb(Aire)} cm². On reconnaît deux triangles de Pythagore accolés : ${x1}, ${h}, ${s1} et ${x2}, ${h}, ${s2}.`;
  return mk(q, L(Aire, 'cm²'), [
    [L(s1 * s2 / 2, 'cm²'), 'fait comme si le triangle était rectangle'],
    [L(b * Math.min(s1, s2) / 2, 'cm²'), 'prend un côté oblique pour la hauteur'],
    [L(b * h, 'cm²'), 'oublie le ÷ 2']
  ], k => L(Aire + 6 * sg(k), 'cm²'), base);
}

/* 5b · Cercle inscrit dans un triangle rectangle. */
function s5b(R){
  const [a, b, c] = R.pick(TRIPLES.filter(t => t[2] <= 41)), r = (a + b - c) / 2, Aire = a * b / 2, P = a + b + c;
  const base0 = `Relie le centre du cercle inscrit aux trois sommets : le triangle se découpe en trois triangles de hauteur r, donc aire = r × périmètre ÷ 2, d'où r = 2 × aire ÷ périmètre. Aire : ${a} × ${b} ÷ 2 = ${nb(Aire)} cm² ; périmètre : ${a} + ${b} + ${c} = ${P} cm ; r = 2 × ${nb(Aire)} ÷ ${P} = ${nb(r)} cm.`;
  if (R.int(0, 1)){
    const q = `Un triangle rectangle a des côtés de ${a} cm, ${b} cm et ${c} cm. Quel est le rayon du cercle inscrit dans ce triangle, c'est-à-dire du cercle tangent à ses trois côtés ?`;
    const hh = a * b / c;
    return mk(q, L(r, 'cm'), [
      [L(c / 2, 'cm'), 'est le rayon du cercle circonscrit (la moitié de l\'hypoténuse)'],
      [L(r / 2, 'cm'), 'divise l\'aire par le périmètre sans le facteur 2'],
      [Math.abs(hh * 100 - Math.round(hh * 100)) < 1e-9 ? L(hh, 'cm') : L(r * 2, 'cm'), Math.abs(hh * 100 - Math.round(hh * 100)) < 1e-9 ? 'est la hauteur issue de l\'angle droit' : 'est le diamètre du cercle inscrit, pas son rayon']
    ], k => L(r + sg(k), 'cm'), base0 + ` Raccourci pour un triangle rectangle : r = (${a} + ${b} − ${c}) ÷ 2.`);
  }
  const q = `Un triangle rectangle a des côtés de ${a} cm, ${b} cm et ${c} cm. Quelle est l'aire du disque inscrit dans ce triangle (le disque tangent à ses trois côtés) ?`;
  return mk(q, piU(r * r, 'cm²'), [
    [piU(c * c / 4, 'cm²'), 'est l\'aire du disque circonscrit (de rayon la moitié de l\'hypoténuse)'],
    [piU(2 * r, 'cm²'), 'calcule le périmètre du cercle, pas l\'aire du disque'],
    [piU(4 * r * r, 'cm²'), 'prend le diamètre pour le rayon']
  ], k => piU(r * r + sg(k), 'cm²'), base0 + ` Aire du disque : π × ${nb(r)}² = ${nb(r * r)}π cm².`);
}

/* 5c · Rectangle : périmètre et diagonale, côtés non entiers. */
function s5c(R){
  const [s, d, Aire] = R.pick(RECT5);
  const q = `Un rectangle a un périmètre de ${nb(2 * s)} cm et une diagonale de ${d} cm. Quelle est son aire ?`;
  const base = `Note L et l les côtés : tu connais L + l (le demi-périmètre) et L² + l² (Pythagore avec la diagonale), et l'aire L × l se déduit de (L + l)² = L² + l² + 2 × L × l. Ici L + l = ${s} et L² + l² = ${nb(d * d)}, donc 2 × L × l = ${nb(s * s)} − ${nb(d * d)} = ${nb(s * s - d * d)} et l'aire vaut ${nb(Aire)} cm². Les côtés ne sont pas des nombres entiers : inutile de les chercher.`;
  return mk(q, L(Aire, 'cm²'), [
    [L(s * s - d * d, 'cm²'), 'oublie de diviser par 2'],
    [L(d * d / 2, 'cm²'), 'suppose que le rectangle est un carré de cette diagonale'],
    [L(s * s / 4, 'cm²'), 'suppose que le rectangle est un carré de ce périmètre']
  ], k => L(Aire + 2 * sg(k), 'cm²'), base);
}

/* 5d · Polygones réguliers dont l'angle intérieur est entier (ou multiple de m). */
function s5d(R){
  const m = R.pick([1, 1, 1, 2, 3, 4, 5, 6, 9, 10, 12, 15, 20]), M = 360 / m;
  const N = m === 1 ? R.int(10, 200) : R.int(8, Math.min(200, Math.max(20, M + 10)));
  const divs = []; for (let n = 3; n <= N; n++) if (M % n === 0) divs.push(n);
  const D180 = []; for (let n = 3; n <= N; n++) if ((180 / m) % n === 0) D180.push(n);
  const D360 = []; for (let n = 3; n <= N; n++) if (360 % n === 0) D360.push(n);
  const c = divs.length;
  if (c < 2) return null;
  const cond = m === 1 ? 'un nombre entier de degrés' : `un nombre entier de degrés multiple de ${m}`;
  const q = `Pour combien d'entiers n compris entre 3 et ${N} (inclus) l'angle intérieur d'un polygone régulier à n côtés mesure-t-il ${cond} ?`;
  const base = `L'angle intérieur vaut 180° moins l'angle extérieur, et l'angle extérieur vaut 360° ÷ n : on ramène la condition à une condition sur 360 ÷ n. ` + (m === 1
    ? `L'angle intérieur est entier exactement quand 360 ÷ n est entier, c'est-à-dire quand n divise 360.`
    : `Comme 180 est un multiple de ${m}, l'angle intérieur est un multiple de ${m} exactement quand 360 ÷ n est un multiple entier de ${m}, c'est-à-dire quand n divise 360 ÷ ${m} = ${M}.`)
    + ` Diviseurs de ${M} compris entre 3 et ${N} : ${divs.join(', ')}. Il y en a ${c}.`;
  return mk(q, nb(c), [
    [D180.length !== c ? nb(D180.length) : null, `cherche les diviseurs de ${nb(180 / m)} au lieu de ${M}`],
    [m > 1 && D360.length !== c ? nb(D360.length) : null, `oublie la condition « multiple de ${m} »`],
    [nb(c + (M % 2 === 0 ? 2 : 1)), 'compte aussi n = 1' + (M % 2 === 0 ? ' et n = 2' : '') + ', qui ne sont pas des polygones']
  ], k => (c + sg(k) >= 1 ? nb(c + sg(k)) : null), base);
}

/* 5e · Hauteur et segments de l'hypoténuse. */
function s5e(R){
  const [p, r, h] = R.pick(PROJ), T = R.pick(NOMS), Aire = (p + r) * h / 2;
  const q = `Dans un triangle ${T} rectangle en ${T[0]}, la hauteur issue de ${T[0]} coupe l'hypoténuse [${T[1]}${T[2]}] en un point H tel que ${T[1]}H = ${p} cm et H${T[2]} = ${r} cm. Quelle est l'aire du triangle ${T} ?`;
  const base = `Écris Pythagore dans les trois triangles rectangles (les deux petits et le grand) et compare : on obtient que le carré de la hauteur est égal au produit des deux segments de l'hypoténuse. Avec ${T[0]}H = h : ${T[0]}${T[1]}² = ${p}² + h², ${T[0]}${T[2]}² = ${r}² + h² et ${T[0]}${T[1]}² + ${T[0]}${T[2]}² = ${nb(p + r)}². Donc ${nb(p * p)} + ${nb(r * r)} + 2h² = ${nb((p + r) * (p + r))}, d'où h² = ${p} × ${r} = ${nb(p * r)} et h = ${h} cm. Aire : ${nb(p + r)} × ${h} ÷ 2 = ${nb(Aire)} cm².`;
  return mk(q, L(Aire, 'cm²'), [
    [L(p * r / 2, 'cm²'), 'multiplie les deux segments au lieu d\'utiliser la hauteur'],
    [L((p + r) * h, 'cm²'), 'oublie le ÷ 2'],
    [L((p + r) * (p + r) / 4, 'cm²'), 'prend la moitié de l\'hypoténuse pour la hauteur']
  ], k => L(Aire + 3 * sg(k), 'cm²'), base);
}

/* 5f · Plus court chemin d'une fourmi sur un pavé. */
function s5f(R){
  const [l, w, h, r] = R.pick(FOURMI);
  const dims = R.int(0, 1) ? [['long', l], ['large', w], ['haut', h]] : [['long', l], ['haut', w], ['large', h]];
  const q = `Une boîte fermée en forme de pavé droit mesure ${dims[0][1]} cm de ${dims[0][0]}, ${dims.find(x => x[0] === 'large')[1]} cm de large et ${dims.find(x => x[0] === 'haut')[1]} cm de haut. Une fourmi part d'un coin de la boîte et veut atteindre le coin opposé, le plus éloigné, en marchant uniquement sur la surface de la boîte. Quelle est la longueur du plus court chemin possible ?`;
  const autre1 = w * w + (l + h) * (l + h), autre2 = h * h + (l + w) * (l + w);
  const autres = [autre1, autre2].filter(x => x !== r * r);
  const base = `Déplie à plat deux faces voisines de la boîte : le chemin devient un segment, hypoténuse d'un triangle rectangle ; on compare les dépliages possibles et on garde le plus court, celui où les deux plus petites dimensions s'additionnent. Côtés de l'angle droit : ${l} et ${w} + ${h} = ${nb(w + h)}, donc L² = ${nb(l * l)} + ${nb((w + h) * (w + h))} = ${nb(r * r)} et L = ${r} cm.` + (autres.length ? ` Les autres dépliages donnent ${autres.map(x => rac(x) + ' cm').join(' et ')}, plus long${autres.length > 1 ? 's' : ''}.` : '');
  return mk(q, L(r, 'cm'), R.shuffle([
    [racU(l * l + w * w + h * h, 'cm'), 'traverse l\'intérieur de la boîte, ce que la fourmi ne peut pas faire'],
    [L(l + w + h, 'cm'), 'suit les arêtes'],
    [racU(autre2 !== r * r ? autre2 : autre1, 'cm'), 'déplie la boîte du mauvais côté']
  ]), k => L(r + sg(k), 'cm'), base);
}

/* 5g · Aire d'un triangle équilatéral à partir de sa hauteur. */
function s5g(R){
  const m = R.int(1, 8), h = 3 * m, c2 = 12 * m * m;        // côté² = 4h²/3
  const coef = 3 * m * m;                                     // aire = 3m²√3
  const q = `Un triangle équilatéral a une hauteur de ${h} cm. Quelle est son aire ?`;
  const base = `Dans un triangle équilatéral de côté c, la hauteur coupe le côté opposé en son milieu, donc Pythagore donne h² = c² − (c ÷ 2)² = 3c² ÷ 4 ; on en tire c, puis aire = c × h ÷ 2. Ici c² = 4 × ${nb(h * h)} ÷ 3 = ${c2}, donc c = ${rac(c2)} cm. Aire : ${rac(c2)} × ${h} ÷ 2 = ${rac(3 * coef * coef)} cm².`;
  return mk(q, racU(3 * coef * coef, 'cm²'), [
    [racU(12 * coef * coef, 'cm²'), 'oublie le ÷ 2'],
    [h % 2 === 0 ? racU(3 * (h * h / 4) * (h * h / 4), 'cm²') : null, 'applique la formule côté² × √3 ÷ 4 avec la hauteur à la place du côté'],
    [L(h * h / 2, 'cm²'), 'prend la hauteur pour la base'],
    [racU(3 * (coef / 2) * (coef / 2), 'cm²'), 'divise par 4 au lieu de 2']
  ], k => racU(3 * (coef + sg(k)) * (coef + sg(k)), 'cm²'), base);
}

/* ---------- répartition et repli ---------- */
const GEN = {
  1: [s1a, s1b, s1c, s1d, s1e],
  2: [s2a, s2b, s2c, s2d, s2e, s2f],
  3: [s3a, s3b, s3c, s3d, s3e, s3f, s3g],
  4: [s4a, s4b, s4c, s4d, s4e, s4f, s4g, s4h],
  5: [s5a, s5b, s5c, s5d, s5e, s5f, s5g]
};
function valide(ex){
  if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return false;
  const n = ex.choix.map(norm);
  return new Set(n).size === 4 && n.indexOf(norm(ex.a)) >= 0 && typeof ex.expl === 'string';
}
function secours(){
  return {
    q: 'Un triangle est rectangle et ses côtés de l\'angle droit mesurent 3 cm et 4 cm. Combien mesure son hypoténuse ?',
    a: '5 cm', accept: null, choix: ['5 cm', '7 cm', '25 cm', '√7 cm'],
    expl: 'Dans un triangle rectangle, le carré de l\'hypoténuse est égal à la somme des carrés des deux autres côtés. Ici 3² + 4² = 9 + 16 = 25, donc l\'hypoténuse mesure 5 cm. Piège : 7 cm additionne les longueurs, 25 cm oublie la racine carrée.'
  };
}

A.push({
  id: 'alb-27-geometrie-plane',
  phase: 'albert',
  ordre: 27,
  theme: 'geometrie',
  titre: 'Géométrie plane : Pythagore, aires, angles',
  objectif: 'Trouver une longueur, une aire ou un angle sans calculatrice : repérer un triangle rectangle, découper la figure, utiliser la somme des angles.',
  lecon:
`<p class="lede">Le test peut glisser quelques questions de géométrie du collège : un triangle rectangle, une aire, un angle de polygone. Pas de démonstration ni de figure compliquée : il faut <mark>faire un croquis, repérer (ou créer) un triangle rectangle, découper la figure</mark>, puis faire un calcul court, de tête.</p>
<h3>Ce que le test demande</h3>
<p>L'énoncé décrit la figure avec des mots, sans dessin : une échelle contre un mur, un losange dont on connaît les diagonales, un polygone régulier, des points dans un repère, une boîte. On te demande une longueur, une aire ou un angle. Les nombres sont choisis pour que tout se fasse sans calculatrice : les racines carrées tombent juste, ou bien la réponse s'écrit avec √2, √3 ou π. Aux niveaux les plus hauts, il faut enchaîner deux idées : Pythagore puis une aire, ou la somme des angles puis un dénombrement.</p>
<h3>Les prérequis</h3>
<div class="formule"><p>Pythagore : dans un triangle rectangle, hypoténuse² = côté² + côté²</p><p>Somme des angles : 180° dans un triangle, (n − 2) × 180° dans un polygone convexe à n côtés</p><p>Cercle de rayon r : longueur 2 × π × r ; aire π × r²</p></div>
<table class="tbl">
<tr><th>Figure</th><th>Aire</th></tr>
<tr><td>Triangle</td><td>base × hauteur ÷ 2</td></tr>
<tr><td>Parallélogramme</td><td>base × hauteur</td></tr>
<tr><td>Trapèze</td><td>(grande base + petite base) × hauteur ÷ 2</td></tr>
<tr><td>Losange</td><td>grande diagonale × petite diagonale ÷ 2</td></tr>
<tr><td>Carré de diagonale d</td><td>d² ÷ 2</td></tr>
</table>
<p>Retiens aussi : la diagonale d'un carré de côté c mesure c√2 ; la hauteur d'un triangle équilatéral de côté c mesure c√3 ÷ 2 ; les diagonales d'un losange se coupent en leur milieu à angle droit ; dans un triangle isocèle, les deux angles de la base sont égaux et la hauteur issue du sommet principal coupe la base en son milieu ; un angle extérieur d'un triangle vaut la somme des deux angles intérieurs qui ne lui sont pas adjacents ; les angles extérieurs d'un polygone convexe font 360° au total, donc ceux d'un polygone régulier valent 360° ÷ n. Enfin, inégalité triangulaire : chaque côté d'un triangle est strictement plus petit que la somme des deux autres.</p>
<h3>La méthode</h3>
<div class="etapes">
<p><strong>1. Je fais un croquis</strong> à main levée et j'y reporte toutes les longueurs et tous les angles de l'énoncé.</p>
<p><strong>2. Je cherche un triangle rectangle</strong> : diagonale d'un rectangle, hauteur d'un triangle isocèle, demi-diagonales d'un losange, échelle contre un mur. S'il n'y en a pas, j'en crée un en traçant une hauteur.</p>
<p><strong>3. Je découpe ou je complète</strong> : une aire difficile vaut un rectangle englobant moins des triangles faciles ; un polygone se découpe en triangles depuis un sommet.</p>
<p><strong>4. J'écris la relation</strong> (Pythagore, somme des angles, formule d'aire) avant de calculer, puis je contrôle : l'hypoténuse est le plus grand côté, un angle de triangle est entre 0° et 180°, une aire est en unités carrées.</p>
</div>
<h3>Exemples résolus</h3>
<p><strong>Exemple 1.</strong> Un triangle est rectangle et ses côtés de l'angle droit mesurent 9 cm et 12 cm. Hypoténuse² = 81 + 144 = 225, donc l'hypoténuse mesure 15 cm. C'est le triplet 3, 4, 5 multiplié par 3.</p>
<p><strong>Exemple 2.</strong> Un carré est inscrit dans un cercle de rayon 6 cm. Sa diagonale est un diamètre, 12 cm, donc son aire vaut 12² ÷ 2 = 72 cm².</p>
<p><strong>Exemple 3.</strong> Angle intérieur d'un décagone régulier (10 côtés) : l'angle extérieur vaut 360 ÷ 10 = 36°, donc l'angle intérieur vaut 180 − 36 = 144°. Vérification : la somme vaut 8 × 180 = 1 440°, et 1 440 ÷ 10 = 144°.</p>
<p><strong>Exemple 4 (niveau du test).</strong> Un losange a des diagonales de 10 cm et 24 cm. Elles se coupent en leur milieu à angle droit : chaque côté est l'hypoténuse d'un triangle rectangle de côtés 5 et 12, donc mesure 13 cm. Périmètre : 4 × 13 = 52 cm.</p>
<h3>Les réflexes sans calculatrice</h3>
<p>Connais par cœur les triplets 3, 4, 5 ; 5, 12, 13 ; 8, 15, 17 ; 7, 24, 25 ; 20, 21, 29 et leurs multiples (6, 8, 10 ; 9, 12, 15 ; 10, 24, 26…), ainsi que les carrés jusqu'à 30² = 900. Garde √2 ≈ 1,41, √3 ≈ 1,73 et π ≈ 3,14 pour éliminer des choix. Dans un repère, encadre la figure par un rectangle et retire les triangles rectangles des coins. Pour un polygone régulier, passe par l'angle extérieur 360 ÷ n. Pour un trajet sur la surface d'un solide (fourmi, ficelle autour d'un cylindre), déplie la surface à plat : le chemin devient l'hypoténuse d'un triangle rectangle. Pour un rectangle dont on connaît le périmètre et la diagonale, utilise (L + l)² = L² + l² + 2 × L × l : tu obtiens l'aire sans chercher les côtés. Pour une hauteur dans un triangle rectangle, calcule l'aire de deux façons ; si la hauteur coupe l'hypoténuse en deux segments, son carré est égal au produit de ces segments. Le rayon du cercle inscrit dans un triangle vaut 2 × aire ÷ périmètre. Dans un polygone régulier à n côtés, chaque côté est vu depuis un autre sommet sous un angle de 180° ÷ n : c'est l'angle à la base du triangle isocèle formé par deux côtés consécutifs.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Fais un croquis, cherche ou crée un triangle rectangle (hauteur, diagonale, demi-diagonale), puis écris Pythagore, la somme des angles ou la formule d'aire avant de calculer.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Additionner les longueurs au lieu de leurs carrés, ou oublier la racine carrée à la fin. Additionner les carrés quand on cherche un côté de l'angle droit : l'hypoténuse est toujours le plus grand côté. Oublier le ÷ 2 dans l'aire d'un triangle ou d'un losange. Prendre un côté oblique pour une hauteur. Confondre rayon et diamètre, périmètre et aire, angle intérieur et angle extérieur. Oublier que l'inégalité triangulaire est stricte : avec 3, 4 et 7, le triangle est aplati.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Pythagore pour toute longueur ; aire du triangle = base × hauteur ÷ 2 ; somme des angles d'un polygone à n côtés = (n − 2) × 180° ; angle extérieur d'un polygone régulier = 360° ÷ n ; diagonale du carré = côté × √2 ; aire du carré = diagonale² ÷ 2.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      for (let essai = 0; essai < 8; essai++){
        const ex = R.pick(GEN[n])(R);
        if (valide(ex)) return ex;
      }
    } catch(err){ /* repli ci-dessous */ }
    return secours();
  }
});

})();
