/* ===== Maths · Objectif Albert School : alb-15 · Aires, effet du carré, échelles (type pizzas) =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS.
   gen(level, R) : niveaux 1 à 5 (bornés), n'utilise que R.int, R.pick, R.shuffle, ne lève jamais d'exception.
   Chaque énoncé est construit à partir de la solution tirée au hasard : la réponse est toujours calculée.
   Sous-types :
   N1 facteur k sur les longueurs (aire × k²), pourcentage sur le côté (aire), aire d'un disque en π (diamètre,
      rayon, ou diamètre à partir de l'aire), conversions d'aires (cm², m², ha, km²), agrandissement ou réduction ;
   N2 combien de petites pizzas pour une grande, tarte et nombre de personnes, rectangle à deux pourcentages
      (taux ou dimensions réelles), plan à l'échelle 1/50 à 1/500, figures de même forme, prix proportionnel à l'aire ;
   N3 n petites pizzas contre une grande (gagnant et pourcentage), carte en hectares ou km², de l'aire au côté
      (pourcentage inverse), bordure de pizza, allée autour d'un bassin, cadre d'un tableau, largeur qui compense ;
   N4 pizzas de Pythagore (deux pour une), échelle d'une carte retrouvée, deux cartes, réel vers carte, parallèle
      dans un triangle (Thalès), carré tourné dans un carré, carrés emboîtés, carré dans un cercle, maquettes
      (aire, masse au cube, peinture), parts de pizzas, évolutions successives (rayon, côté, diamètre et épaisseur) ;
   N5 bandes d'un triangle (1, 3, 5, 7…), marge ou allée (équation du second degré), trois pizzas pour une,
      longueur de départ retrouvée (pourcentage ou cm²), carrés et disques inscrits en chaîne, prix au cm². */
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
const pgcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a; };
const sg = k => (k % 2 ? 1 : -1) * Math.ceil(k / 2);             // 1, −1, 2, −2, …
/* v s'écrit exactement avec d décimales au plus. */
const nice = (v, d) => typeof v === 'number' && isFinite(v) && Math.abs(v - Math.round(v * Math.pow(10, d)) / Math.pow(10, d)) <= 1e-9 * Math.max(1, Math.abs(v));
const frac = (n, d) => { const g = pgcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; };
const egal = (v, d) => (nice(v, d) ? '= ' : '≈ ') + nb(v, d);
const evo = v => (Math.round(v * 100) / 100 > 0 ? '+' : '') + nb(v, 2) + ' %';
const pct = v => nb(v, 2) + ' %';
const cm = v => nb(v, 1) + ' cm';
const m = v => nb(v, 1) + ' m';
const cm2 = v => nb(v, 4) + ' cm²';
const m2 = v => nb(v, 6) + ' m²';
const pis = u => v => (nb(v, 2) === '1' ? '' : nb(v, 2)) + 'π ' + u;
const eur = v => (nice(v, 0) ? nb(v, 0) : nb(v, 2).replace(/,(\d)$/, ',$10')) + ' €';
const NOMBRE = {2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six'};
const ORD = {2: 'deuxième', 3: 'troisième', 4: 'quatrième', 5: 'cinquième'};
const Cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const cx = v => nb(v, 4);                                         // coefficient : 1,2 ; 0,64 ; 1,4641

/* QCM : la bonne réponse, les distracteurs pédagogiques, puis des voisins jusqu'à 4 choix distincts.
   Un distracteur peut être un texte, ajouté tel quel ; un nombre doit passer ok (par défaut : > 0 et au plus 2 décimales). */
function Q(q, bonne, autres, fmt, voisin, expl, ok){
  const f = v => typeof v === 'string' ? v : fmt(v);
  const test = ok || (v => v > 0 && nice(v, 2));
  const valide = v => typeof v === 'string' ? v.length > 0 : (typeof v === 'number' && isFinite(v) && test(v));
  const ch = [f(bonne)], vus = new Set([norm(ch[0])]);
  const aj = v => { if (ch.length < 4 && v != null && valide(v)){ const s = f(v); if (!vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); } } };
  autres.forEach(aj);
  for (let k = 1; ch.length < 4 && k < 400; k++) aj(voisin(k));
  return { q, a: ch[0], accept: null, choix: ch, expl };
}
/* Variante pour des pourcentages signés : distracteurs à au moins 1 point de la bonne réponse, 2 décimales au plus. */
const okPct = bonne => v => nice(v, 2) && Math.abs(v - bonne) >= 1 && Math.abs(v) < 2000;

/* ---------- décors ---------- */
/* Tous féminins : « une pizza », « la grande », « les petites ». */
const ROND = [
  { s: 'pizza', p: 'pizzas' }, { s: 'tarte', p: 'tartes' }, { s: 'galette', p: 'galettes' },
  { s: 'quiche', p: 'quiches' }, { s: 'crêpe', p: 'crêpes' }
];

/* ---------- tables précalculées (au chargement, quelques millisecondes) ---------- */
/* n petites pizzas de rayon r contre une grande de rayon g : écart d'environ N %, N entier (à 0,25 près). */
const PIZ = (function(){
  const L = [];
  for (const n of [2, 3, 4]) for (let r = 5; r <= 20; r++) for (let g = r + 1; g <= 30; g++){
    if (n === 2 && 2 * g === 3 * r) continue;                       // rapport de l'exemple officiel : exclu
    const P = n * r * r, G = g * g;
    if (P === G) continue;
    const p = (Math.max(P, G) / Math.min(P, G) - 1) * 100, N = Math.round(p);
    if (p < 4 || p > 60 || Math.abs(p - N) > 0.25) continue;
    L.push([n, r, g]);
  }
  return L;
})();
/* Parts : pizza de rayon r1 en k1 parts contre rayon r2 en k2 parts, écart exact à 0,1 % près. */
const PARTS = (function(){
  const L = [], K = [4, 6, 8, 10, 12];
  for (let r1 = 11; r1 <= 25; r1++) for (let r2 = 8; r2 < r1; r2++) for (const k1 of K) for (const k2 of K){
    if (k1 <= k2) continue;
    const p = (r1 * r1 * k2 / (r2 * r2 * k1) - 1) * 100;
    if (!nice(p, 1) || Math.abs(p) < 4 || Math.abs(p) > 60) continue;
    L.push([r1, k1, r2, k2]);
  }
  return L;
})();
/* Prix au cm² : petite d1 à p1 €, grande d2 à p2 €, prix au cm² de la grande = celui de la petite × (1 + c/100). */
const PRIX = (function(){
  const L = [], D = [20, 24, 26, 28, 30, 32, 34, 36, 40, 42, 44, 48];
  for (const d1 of D) for (const d2 of D) if (d2 > d1) for (let p1 = 5; p1 <= 14; p1++) for (const c of [-40, -36, -30, -25, -20, -10, 10, 20, 25]){
    const juste = p1 * d2 * d2 / (d1 * d1);
    if (!nice(juste, 2)) continue;
    const p2 = juste * (1 + c / 100);
    if (!nice(p2, 1) || p2 > 40 || p2 <= p1) continue;
    L.push([d1, p1, d2, Math.round(p2 * 10) / 10, c]);
  }
  return L;
})();
/* Marge de largeur x autour d'un rectangle a × b : aire totale = (kn/kd) × a × b. */
const CADRE = (function(){
  const L = [];
  for (let a = 6; a <= 40; a++) for (let b = a; b <= Math.min(60, 3 * a); b++) for (let x = 1; x < a && x <= 20; x++){
    const T = (a + 2 * x) * (b + 2 * x), P = a * b;
    for (const [kn, kd] of [[2, 1], [3, 1], [3, 2], [4, 1]]) if (T * kd === P * kn) L.push([a, b, x, kn, kd]);
  }
  return L;
})();
/* Quadruplets a² + b² + c² = d², diamètres de 6 à 50 cm. */
const QUAD = (function(){
  const L = [];
  for (let d = 3; d <= 50; d++) for (let a = 6; a < d; a++) for (let b = a; b < d; b++){
    const c2 = d * d - a * a - b * b;
    if (c2 < b * b) break;
    const c = Math.round(Math.sqrt(c2));
    if (c * c === c2) L.push([a, b, c, d]);
  }
  return L;
})();
/* Triplets a² + b² = c², diamètres de 8 à 60 cm. */
const TRIP = (function(){
  const L = [];
  for (let c = 5; c <= 60; c++) for (let a = 8; a < c; a++) for (let b = a + 1; b < c; b++) if (a * a + b * b === c * c) L.push([a, b, c]);
  return L;
})();
/* Longueur +a %, aire visée +x % : largeur b % entière. */
const COMP = (function(){
  const L = [];
  for (const a of [10, 20, 25, 50, 60, 100, -10, -20, -25, -40, -50, -60]) for (const x of [0, 8, 10, 12, 20, 25, 32, 44, 50, -4, -10, -20, -25, -28, -36, -40, -50]){
    const b = ((100 + x) / (100 + a) - 1) * 100;
    if (!nice(b, 0) || Math.round(b) === 0 || Math.abs(b) > 80 || Math.abs(b - x) < 1e-9 || a === x) continue;
    L.push([a, x, Math.round(b)]);
  }
  return L;
})();
/* Tartes : d cm pour p personnes, D cm pour res personnes (rapport u/v, v ≤ 4, résultats entiers). */
const NOURRIR = (function(){
  const L = [];
  for (const d of [16, 18, 20, 22, 24, 25, 26, 28, 30, 32]) for (let D = d + 2; D <= Math.min(50, 2.5 * d); D++){
    const g = pgcd(d, D), u = D / g, v = d / g;
    if (v > 4) continue;
    for (let p = v * v; p <= 12; p += v * v){
      const res = p * u * u / (v * v);
      if (p >= 2 && res <= 40) L.push([d, D, p, res, u, v]);
    }
  }
  return L;
})();
/* Prix proportionnel à l'aire : d cm à p €, D cm à P € (P au centime, 4 € ≤ P ≤ 40 €). */
const PRIXA = (function(){
  const L = [];
  for (const d of [20, 24, 25, 26, 28, 30, 32, 36, 40]) for (const D of [16, 18, 20, 24, 25, 28, 30, 32, 35, 36, 40, 42, 45, 48, 50]){
    if (D === d) continue;
    const g = pgcd(d, D), u = D / g, v = d / g;
    if (v > 4 || u > 5) continue;
    for (let p = 4; p <= 20; p++){
      const P = p * u * u / (v * v);
      if (nice(P, 1) && P >= 4 && P <= 40) L.push([d, D, p, P, u, v]);
    }
  }
  return L;
})();

/* =====================================================
   NIVEAU 1 · découverte
   ===================================================== */

const FIG = [
  { suj: 'le côté d\'un carré', aire: 'son aire' },
  { suj: 'le rayon d\'un disque', aire: 'son aire' },
  { suj: 'le diamètre d\'une pizza', aire: 'sa surface' },
  { suj: 'la longueur et la largeur d\'un rectangle', aire: 'son aire' },
  { suj: 'les trois côtés d\'un triangle', aire: 'son aire' },
  { suj: 'toutes les dimensions d\'une photo', aire: 'sa surface' }
];

/* 1a · Longueurs × k (ou ÷ k) : par combien l'aire est-elle multipliée (ou divisée) ? */
function s1a(R){
  const f = R.pick(FIG), k = R.pick([2, 3, 4, 5, 10]), mult = R.int(0, 3) > 0;
  let verbe;
  if (mult) verbe = k === 2 && R.int(0, 1) ? 'On double ' : k === 3 && R.int(0, 1) ? 'On triple ' : 'On multiplie par ' + k + ' ';
  else verbe = 'On divise par ' + k + ' ';
  const part = mult ? 'multipliée' : 'divisée', parts = mult ? 'multipliées' : 'divisées';
  const q = verbe + f.suj + '. Par combien ' + f.aire + ' est-elle ' + part + ' ?';
  const expl = `Quand toutes les longueurs d'une figure sont ${parts} par un même nombre, son aire est ${part} par le carré de ce nombre. Ici les longueurs sont ${parts} par ${k}, donc ${f.aire} est ${part} par ${k} × ${k} = ${k * k}. Piège : répondre ${k}, c'est oublier qu'une aire dépend de deux longueurs ; ${nb(k * k * k)} (${k} × ${k} × ${k}) serait l'effet sur un volume.`;
  return Q(q, k * k, [k, 2 * k, k * k * k], v => nb(v, 0), i => k * k + sg(i), expl, v => v > 0 && nice(v, 0));
}

const FIGP = [
  { suj: 'Le côté d\'un carré', aire: 'son aire', pl: false },
  { suj: 'Le rayon d\'un disque', aire: 'son aire', pl: false },
  { suj: 'Le diamètre d\'une pizza', aire: 'sa surface', pl: false },
  { suj: 'La longueur et la largeur d\'un rectangle', aire: 'son aire', pl: true, tous: ' toutes les deux' },
  { suj: 'Toutes les dimensions d\'une photo', aire: 'sa surface', pl: true }
];

/* 1b · Le côté évolue de t % : comment évolue l'aire ? */
function s1b(R){
  const f = R.pick(FIGP), hausse = R.int(0, 2) > 0;
  const t = hausse ? R.pick([10, 20, 30, 40, 50, 100]) : R.pick([10, 20, 30, 40, 50]);
  const c = hausse ? 1 + t / 100 : 1 - t / 100, c2 = c * c, v = (c2 - 1) * 100, s = hausse ? 1 : -1;
  const verbe = hausse ? (f.pl ? 'augmentent' : 'augmente') : (f.pl ? 'diminuent' : 'diminue');
  const q = `${f.suj} ${verbe}${f.tous || ''} de ${t} %. Comment évolue ${f.aire} ?`;
  const piege = hausse
    ? ` Piège : ${evo(t)} oublie l'effet du carré, ${evo(2 * t)} oublie le petit carré ${cx(t / 100)} × ${cx(t / 100)} = ${cx(t * t / 10000)}, et ${evo(100 * c2)} confond le coefficient ${cx(c2)} avec le pourcentage d'évolution.`
    : ` Piège : ${evo(-t)} oublie l'effet du carré, et ${evo(-100 * c2)} confond ce qui reste (${nb(100 * c2)} % de l'aire de départ) avec la baisse.`;
  const expl = `Une évolution de ${t} % multiplie chaque longueur par un même coefficient ; l'aire est alors multipliée par le carré de ce coefficient. Ici le coefficient vaut ${cx(c)} : l'aire est multipliée par ${cx(c)} × ${cx(c)} = ${cx(c2)}, soit ${evo(v)}.` + piege;
  return Q(q, v, [s * t, s * 2 * t, s * 100 * c2], evo, i => v + sg(i) * 5, expl, okPct(v));
}

/* 1c · Aire d'un disque en π : à partir du diamètre, du rayon, ou diamètre à partir de l'aire. */
function s1c(R){
  const o = R.pick(ROND), w = R.int(0, 2);
  if (w === 0){
    const D = 2 * R.int(5, 20), r = D / 2;
    const q = `Une ${o.s} a un diamètre de ${D} cm. Quelle est son aire ?`;
    const expl = `L'aire d'un disque vaut π × r², où r est le rayon, c'est-à-dire la moitié du diamètre. Ici r = ${D} ÷ 2 = ${r} cm, donc l'aire vaut π × ${r}² = ${nb(r * r)}π cm². Piège : ${nb(D * D)}π utilise le diamètre au lieu du rayon, ${nb(D * D / 2)}π vient de ${D}² ÷ 2 au lieu de (${D} ÷ 2)², et ${D}π est le périmètre, pas l'aire.`;
    return Q(q, r * r, [D * D, D * D / 2, D], pis('cm²'), i => r * r + sg(i) * 2, expl);
  }
  if (w === 1){
    const r = R.int(3, 20);
    const q = `Un disque a un rayon de ${r} cm. Quelle est son aire ?`;
    const expl = `L'aire d'un disque vaut π × r², où r est le rayon. Ici π × ${r}² = ${nb(r * r)}π cm². Piège : ${nb(4 * r * r)}π prend le diamètre (${2 * r} cm) à la place du rayon, ${2 * r}π est le périmètre, et ${nb(r * r)} cm² oublie π.`;
    return Q(q, r * r, [4 * r * r, 2 * r, nb(r * r) + ' cm²'], pis('cm²'), i => r * r + sg(i) * 2, expl);
  }
  const r = R.int(5, 15);
  const q = `Une ${o.s} a une aire de ${nb(r * r)}π cm². Quel est son diamètre ?`;
  const expl = `On retrouve le rayon r grâce à l'aire π × r², puis on double le rayon pour obtenir le diamètre. Ici r² = ${nb(r * r)}, donc r = ${r} cm, et le diamètre vaut 2 × ${r} = ${2 * r} cm. Piège : ${r} cm est le rayon, pas le diamètre, et ${nb(r * r)} cm oublie de prendre la racine carrée.`;
  return Q(q, 2 * r, [r, r * r, 4 * r], cm, i => 2 * r + sg(i) * 2, expl, v => v > 0 && nice(v, 0));
}

/* 1d · Conversions d'aires. */
const CONV = [
  { g: 'm²', p: 'cm²', F: 10000, L: 100, txt: '1 m = 100 cm, donc 1 m² = 100 × 100 = 10 000 cm²' },
  { g: 'm²', p: 'dm²', F: 100, L: 10, txt: '1 m = 10 dm, donc 1 m² = 10 × 10 = 100 dm²' },
  { g: 'dm²', p: 'cm²', F: 100, L: 10, txt: '1 dm = 10 cm, donc 1 dm² = 10 × 10 = 100 cm²' },
  { g: 'cm²', p: 'mm²', F: 100, L: 10, txt: '1 cm = 10 mm, donc 1 cm² = 10 × 10 = 100 mm²' },
  { g: 'ha', p: 'm²', F: 10000, L: 100, txt: '1 ha est l\'aire d\'un carré de 100 m de côté, donc 1 ha = 100 × 100 = 10 000 m²' },
  { g: 'km²', p: 'ha', F: 100, L: 10, txt: '1 km = 10 fois 100 m et 1 ha est un carré de 100 m de côté, donc 1 km² = 10 × 10 = 100 ha' },
  { g: 'km²', p: 'm²', F: 1000000, L: 1000, txt: '1 km = 1 000 m, donc 1 km² = 1 000 × 1 000 = 1 000 000 m²' }
];
function s1d(R){
  const c = R.pick(CONV), desc = R.int(0, 1) === 1;
  const ok = v => v > 0 && nice(v, 6) && v < 1e9;
  if (desc){
    const x = R.pick([2, 3, 4, 5, 6, 8, 12, 15, 25, 0.5, 1.5, 2.5, 3.5, 0.8, 0.25, 0.3, 7.2, 0.04]), y = x * c.F;
    const q = `Convertis ${nb(x)} ${c.g} en ${c.p}.`;
    const expl = `Pour convertir une aire, on élève au carré le rapport entre les unités de longueur. ${c.txt}. Donc ${nb(x)} ${c.g} = ${nb(x)} × ${nb(c.F)} = ${nb(y, 6)} ${c.p}. Piège : ${nb(x * c.L, 6)} ${c.p} applique le rapport des longueurs (${nb(c.L)}) au lieu du rapport des aires (${nb(c.F)}).`;
    return Q(q, y, [x * c.L, x * c.F / 10, x * c.F * 10], v => nb(v, 6) + ' ' + c.p, i => y * Math.pow(10, sg(i) * 2), expl, ok);
  }
  const yb = R.pick([0.5, 2.5, 4.5, 1.2, 0.35, 3, 12, 0.08, 0.06, 7, 1.5, 0.24]), x = yb * c.F;
  const q = `Convertis ${nb(x, 6)} ${c.p} en ${c.g}.`;
  const expl = `Pour convertir une aire, on élève au carré le rapport entre les unités de longueur. ${c.txt}. Donc ${nb(x, 6)} ${c.p} = ${nb(x, 6)} ÷ ${nb(c.F)} = ${nb(yb, 6)} ${c.g}. Piège : ${nb(x / c.L, 6)} ${c.g} divise par le rapport des longueurs (${nb(c.L)}) au lieu du rapport des aires (${nb(c.F)}).`;
  return Q(q, yb, [x / c.L, x / c.F * 10, x / c.F / 10], v => nb(v, 6) + ' ' + c.g, i => yb * Math.pow(10, sg(i) * 2), expl, ok);
}

/* 1e · Agrandissement ou réduction d'une figure d'aire connue. */
const OBJ1 = [['Un rectangle', 'du rectangle'], ['Un triangle', 'du triangle'], ['Un logo', 'du logo'], ['Un dessin', 'du dessin'], ['Un motif', 'du motif'], ['Un panneau', 'du panneau']];
function s1e(R){
  const o = R.pick(OBJ1);
  if (R.int(0, 2) > 0){
    const k = R.pick([2, 3, 4, 5, 10, 1.5]), Ai = k === 1.5 ? 4 * R.int(1, 6) : R.int(2, 20), Af = Ai * k * k;
    const q = `${o[0]} d'aire ${nb(Ai)} cm² est agrandi : toutes ses longueurs sont multipliées par ${nb(k)}. Quelle est l'aire ${o[1]} agrandi ?`;
    const expl = `Quand toutes les longueurs sont multipliées par un nombre k, l'aire est multipliée par k². Ici k = ${nb(k)} et k² = ${nb(k)} × ${nb(k)} = ${nb(k * k)}, donc l'aire devient ${nb(Ai)} × ${nb(k * k)} = ${nb(Af)} cm². Piège : ${nb(Ai)} × ${nb(k)} = ${nb(Ai * k)} cm² applique à l'aire le coefficient des longueurs.`;
    return Q(q, Af, [Ai * k, Ai * 2 * k, Ai * k * k * k], cm2, i => Af + sg(i) * Ai, expl);
  }
  const k = R.pick([2, 3, 4, 5]), mm = R.int(2, 12), Ai = mm * k * k;
  const q = `${o[0]} d'aire ${nb(Ai)} cm² est réduit : toutes ses longueurs sont divisées par ${k}. Quelle est l'aire ${o[1]} réduit ?`;
  const expl = `Quand toutes les longueurs sont divisées par un nombre k, l'aire est divisée par k². Ici k² = ${k} × ${k} = ${k * k}, donc l'aire devient ${nb(Ai)} ÷ ${k * k} = ${nb(mm)} cm². Piège : ${nb(Ai)} ÷ ${k} = ${nb(Ai / k)} cm² divise l'aire par le coefficient des longueurs seulement.`;
  return Q(q, mm, [Ai / k, Ai / (2 * k), Ai / (k * k * k)], cm2, i => mm + sg(i), expl);
}

/* =====================================================
   NIVEAU 2 · maîtrise
   ===================================================== */

/* 2a · Combien de petites pour une grande ; tarte et nombre de personnes. */
function s2a(R){
  const o = R.pick(ROND);
  if (R.int(0, 1)){
    const k = R.pick([2, 3, 4]);
    const d = R.pick(k === 4 ? [6, 8, 10, 12] : k === 3 ? [8, 10, 12, 14, 15, 16, 20] : [10, 12, 14, 15, 16, 18, 20, 24, 25, 30]), D = k * d;
    const q = `Combien de ${o.p} de ${d} cm de diamètre faut-il pour avoir la même surface qu'une seule ${o.s} de ${D} cm de diamètre ?`;
    const expl = `La surface d'un disque est proportionnelle au carré de son diamètre : on élève au carré le rapport des diamètres. Le diamètre est multiplié par ${D} ÷ ${d} = ${k}, donc la surface est multipliée par ${k} × ${k} = ${k * k} : il faut ${k * k} ${o.p}. Piège : ${k} ${o.p} suffiraient seulement si la surface était proportionnelle au diamètre.`;
    return Q(q, k * k, [k, 2 * k, k * k * k], v => nb(v, 0), i => k * k + sg(i), expl, v => v > 0 && nice(v, 0));
  }
  const [d, D, p, res, u, v] = R.pick(NOURRIR), rk = frac(u, v), rk2 = frac(u * u, v * v);
  const q = `Une ${o.s} de ${d} cm de diamètre suffit pour ${p} personnes. Pour combien de personnes suffit une ${o.s} de même épaisseur et de ${D} cm de diamètre ?`;
  const lin = p * u / v;
  const expl = `À épaisseur égale, la quantité est proportionnelle à la surface, donc au carré du diamètre. Le diamètre est multiplié par ${D}/${d} = ${rk}, donc la surface par (${rk})² = ${rk2} : ${p} × ${rk2} = ${res} personnes. Piège : ${nb(lin)} personnes applique le rapport des diamètres à une surface.`;
  return Q(q, res, [lin, p * (2 * u / v - 1), p * u * u * u / (v * v * v)], v2 => nb(v2, 0), i => res + sg(i), expl, x => x > 0 && nice(x, 0));
}

/* 2b · Rectangle : longueur +a %, largeur ±b % (taux, ou dimensions réelles). */
function s2b(R){
  if (R.int(0, 2) > 0){
    const a = R.pick([10, 20, 25, 30, 40, 50]), b = R.pick([10, 20, 25, 30, 40, 50]), s = R.int(0, 1) ? 1 : -1;
    const c1 = 1 + a / 100, c2 = 1 + s * b / 100, v = (c1 * c2 - 1) * 100;
    const q = `La longueur d'un rectangle augmente de ${a} % et sa largeur ${s > 0 ? 'augmente' : 'diminue'} de ${b} %. Comment évolue son aire ?`;
    const pieges = s > 0 ? [a + b, 100 * c1 * c2, (a + b) / 2] : [a - b, a - b + a * b / 100, -v];
    const expl = `Les coefficients multiplicateurs se multiplient : coefficient de l'aire = coefficient de la longueur × coefficient de la largeur. Ici ${cx(c1)} × ${cx(c2)} = ${cx(c1 * c2)}, soit ${evo(v)}. Piège : ${evo(a + s * b)} additionne les pourcentages et oublie le produit croisé ${cx(a / 100)} × ${cx(b / 100)} = ${cx(a * b / 10000)}.`;
    return Q(q, v, pieges, evo, i => v + sg(i) * 2, expl, okPct(v));
  }
  const a = R.pick([10, 20, 25, 50]), b = R.pick([10, 20, 25, 50]), L = R.pick([20, 30, 40, 50, 60, 80].filter(x => x * a % 100 === 0)), W = R.pick([10, 20, 30, 40].filter(x => x < L && x * b % 100 === 0));
  const L1 = L * (1 + a / 100), W1 = W * (1 - b / 100), S = L1 * W1;
  const q = `Un terrain rectangulaire mesure ${L} m sur ${W} m. On allonge sa longueur de ${a} % et on raccourcit sa largeur de ${b} %. Quelle est sa nouvelle aire ?`;
  const add = L * W * (1 + (a - b) / 100);
  const expl = `Calcule les nouvelles dimensions, puis leur produit. Longueur : ${L} × ${cx(1 + a / 100)} = ${nb(L1)} m ; largeur : ${W} × ${cx(1 - b / 100)} = ${nb(W1)} m ; aire : ${nb(L1)} × ${nb(W1)} = ${nb(S)} m². Piège : ${nb(add)} m² applique à l'aire de départ (${nb(L * W)} m²) l'évolution ${evo(a - b)}, obtenue en additionnant les pourcentages, ce qui ne marche pas pour un produit.`;
  return Q(q, S, [add, L * W, L1 * W], m2, i => S + sg(i) * 20, expl);
}

/* 2c · Plan à l'échelle 1/k : pièce a × b cm, ou surface s cm². */
function s2c(R){
  const k = R.pick([50, 100, 200, 250, 500]), Lc = k / 100;
  if (R.int(0, 1)){
    let a = R.int(3, 12), b = R.int(2, 10);
    if (b >= a){ const t = a; a = b + 1; b = t; }
    const S = a * Lc * b * Lc, lin = a * b * k / 10000;
    const q = `Sur un plan à l'échelle 1/${k}, ${k <= 100 ? R.pick(['une pièce rectangulaire', 'une chambre rectangulaire', 'un salon rectangulaire']) : R.pick(['un terrain rectangulaire', 'un jardin rectangulaire', 'un parking rectangulaire'])} mesure ${a} cm sur ${b} cm. Quelle est sa surface réelle ?`;
    const expl = `Convertis d'abord chaque longueur du plan en longueur réelle, puis calcule l'aire. À l'échelle 1/${k}, 1 cm sur le plan représente ${k} cm = ${nb(Lc)} m. La pièce mesure ${nb(a * Lc)} m sur ${nb(b * Lc)} m, soit ${nb(S, 4)} m². Piège : ${a * b} cm² × ${k} = ${nb(a * b * k)} cm² = ${nb(lin, 4)} m² applique l'échelle des longueurs à une aire.`;
    return Q(q, S, [lin, S * 10, S / 10], m2, i => S * Math.pow(10, sg(i)), expl, v => v > 0 && nice(v, 4));
  }
  const s = R.int(4, 40), S = s * Lc * Lc, lin = s * k / 10000;
  const q = `Sur un plan à l'échelle 1/${k}, ${k <= 100 ? R.pick(['une terrasse', 'un appartement', 'une cuisine']) : R.pick(['un jardin', 'un terrain', 'une cour'])} occupe une surface de ${s} cm². Quelle est sa surface réelle ?`;
  const expl = `Traduis 1 cm du plan en longueur réelle, puis élève au carré pour savoir ce que représente 1 cm². À l'échelle 1/${k}, 1 cm représente ${nb(Lc)} m, donc 1 cm² représente ${nb(Lc)} m × ${nb(Lc)} m = ${nb(Lc * Lc, 4)} m². ${s} cm² représentent ${s} × ${nb(Lc * Lc, 4)} = ${nb(S, 4)} m². Piège : ${s} × ${k} = ${nb(s * k)} cm² = ${nb(lin, 4)} m² applique l'échelle des longueurs à une aire.`;
  return Q(q, S, [lin, S * 100, S / 100], m2, i => S * Math.pow(10, sg(i)), expl, v => v > 0 && nice(v, 4));
}

/* 2d · Deux figures de même forme : de l'aire de l'une à l'aire de l'autre. */
const PAIRES = [[3, 6], [4, 8], [5, 10], [2, 6], [3, 9], [4, 12], [4, 6], [6, 9], [8, 12], [2, 5], [4, 10], [6, 15], [6, 8], [9, 12], [3, 5], [6, 10], [2, 8], [3, 12], [5, 20], [2, 10], [3, 15]];
const OBJ2 = ['panneaux', 'logos', 'triangles', 'drapeaux', 'autocollants'];
function s2d(R){
  const [c, C] = R.pick(PAIRES), g = pgcd(c, C), u = C / g, v = c / g, o = R.pick(OBJ2);
  const rk = frac(u, v), rk2 = frac(u * u, v * v);
  const As = v * v * R.int(1, Math.max(1, Math.floor(60 / (v * v)))), Ag = As * u * u / (v * v);
  if (R.int(0, 2) > 0){
    const q = `Deux ${o} ont exactement la même forme. Un côté mesure ${c} cm sur le petit et ${C} cm sur le grand. L'aire du petit vaut ${nb(As)} cm². Quelle est l'aire du grand ?`;
    const expl = `Pour deux figures de même forme, le rapport des aires est le carré du rapport des longueurs. Rapport des longueurs : ${C} ÷ ${c} = ${rk} ; rapport des aires : (${rk})² = ${rk2}. Aire du grand : ${nb(As)} × ${rk2} = ${nb(Ag)} cm². Piège : ${nb(As * u / v)} cm² applique le rapport des longueurs à l'aire.`;
    return Q(q, Ag, [As * u / v, As * u * u * u / (v * v * v)], cm2, i => Ag + sg(i) * Math.max(1, Math.round(Ag / 10)), expl);
  }
  const q = `Deux ${o} ont exactement la même forme. Un côté mesure ${c} cm sur le petit et ${C} cm sur le grand. L'aire du grand vaut ${nb(Ag)} cm². Quelle est l'aire du petit ?`;
  const expl = `Pour deux figures de même forme, le rapport des aires est le carré du rapport des longueurs. Rapport des longueurs : ${C} ÷ ${c} = ${rk} ; rapport des aires : (${rk})² = ${rk2}. Aire du petit : ${nb(Ag)} ÷ ${rk2} = ${nb(As)} cm². Piège : ${nb(Ag * v / u)} cm² divise l'aire par le rapport des longueurs seulement.`;
  return Q(q, As, [Ag * v / u, Ag * v * v * v / (u * u * u)], cm2, i => As + sg(i) * Math.max(1, Math.round(As / 10)), expl);
}

/* 2e · Prix proportionnel à la surface. */
function s2e(R){
  const [d, D, p, P, u, v] = R.pick(PRIXA), rk = frac(u, v), rk2 = frac(u * u, v * v);
  const q = `Dans une pizzeria, le prix d'une pizza est proportionnel à sa surface. Une pizza de ${d} cm de diamètre coûte ${eur(p)}. Combien coûte une pizza de ${D} cm de diamètre ?`;
  const expl = `Le prix suit la surface, et la surface est proportionnelle au carré du diamètre : on multiplie le prix par le carré du rapport des diamètres. Rapport des diamètres : ${D}/${d} = ${rk} ; rapport des surfaces : (${rk})² = ${rk2}. Prix : ${eur(p)} × ${rk2} = ${eur(P)}. Piège : ${eur(p * u / v)} rend le prix proportionnel au diamètre.`;
  return Q(q, P, [p * u / v, p * (2 * u / v - 1), p * u * u * u / (v * v * v)], eur, i => P + sg(i), expl);
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels
   ===================================================== */

/* 3a · n petites pizzas contre une grande : laquelle, et d'environ combien de pour cent ? */
function s3a(R){
  const [n, r, g] = R.pick(PIZ), o = R.pick(ROND), P = n * r * r, G = g * g;
  const d = 2 * r, D = 2 * g, nom = NOMBRE[n];
  const WG = 'La grande', WP = `Les ${nom} petites`;
  const gagne = G > P ? WG : WP, autre = G > P ? WP : WG;
  const mx = Math.max(P, G), mn = Math.min(P, G), N = Math.round((mx / mn - 1) * 100);
  const lib = (W, x) => `${W}, environ ${x} % de plus`;
  const bonne = lib(gagne, N);
  const cand = [];
  // piège 1 : comparer les diamètres
  const dP = n * d, Wd = D > dP ? WG : WP, Nd = Math.round((Math.max(dP, D) / Math.min(dP, D) - 1) * 100);
  if (dP !== D) cand.push([Wd, Nd]);
  const autres = [];
  autres.push([WG, Math.round((G / (r * r) - 1) * 100)]);           // piège 2 : une seule petite
  autres.push([autre, N]);                                          // piège 3 : gagnant inversé
  autres.push([gagne, Math.round((mx - mn) / mx * 100)]);          // piège 4 : mauvaise base
  R.shuffle(autres).forEach(x => cand.push(x));
  const ch = [bonne], vus = new Set([norm(bonne)]);
  cand.forEach(([W, x]) => {
    if (ch.length >= 4 || x <= 0) return;
    if (W === gagne && Math.abs(x - N) < 4) return;                 // trop proche de la bonne réponse : ambigu
    const s = lib(W, x);
    if (!vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); }
  });
  [`Autant dans les deux cas`, lib(autre, N + 10), lib(gagne, N + 15), lib(gagne, 2 * N + 5)].forEach(s => { if (ch.length < 4 && !vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); } });
  const q = `Pour le même prix, on te propose soit ${nom} ${o.p} de ${d} cm de diamètre, soit une seule ${o.s} de ${D} cm de diamètre, toutes de même épaisseur. Quel choix donne le plus à manger, et d'environ combien de pour cent ?`;
  const piege = Wd === gagne
    ? `comparer les diamètres (${n} × ${d} = ${dP} cm contre ${D} cm) donne le bon gagnant mais un pourcentage faux`
    : `comparer les diamètres (${n} × ${d} = ${dP} cm contre ${D} cm) ferait croire que les petites donnent plus`;
  const expl = `À épaisseur égale, la quantité est proportionnelle à l'aire, donc au carré du rayon : π se simplifie, et on compare les carrés des rayons. Les ${nom} petites : ${n} × ${r}² = ${nb(P)}. La grande : ${g}² = ${nb(G)}. ${gagne === WG ? 'La grande' : 'Les petites'} l'emporte${gagne === WG ? '' : 'nt'} : ${nb(mx)} ÷ ${nb(mn)} ${egal(mx / mn, 3)}, soit environ ${N} % de plus. Piège : ${piege} ; et l'écart se calcule par rapport à la plus petite quantité.`;
  return { q, a: bonne, accept: null, choix: ch, expl };
}

/* 3b · Carte : de la surface sur la carte à la superficie réelle. */
const ECH = [
  { k: 5000, U: ['ha', 'm²'] }, { k: 10000, U: ['ha'] }, { k: 20000, U: ['ha'] }, { k: 25000, U: ['ha'] },
  { k: 50000, U: ['ha', 'km²'] }, { k: 100000, U: ['km²', 'ha'] }, { k: 200000, U: ['km²'] }, { k: 250000, U: ['km²'] }
];
const UNOM = { 'm²': 'en m²', 'ha': 'en hectares', 'km²': 'en km²' };
const UM2 = { 'm²': 1, 'ha': 10000, 'km²': 1000000 };
const LIEUX = ['une forêt', 'un lac', 'un champ', 'un parc', 'un domaine', 'un étang', 'un vignoble'];
function s3b(R){
  const e = R.pick(ECH), U = R.pick(e.U), Lm = e.k / 100, perM2 = Lm * Lm, perU = perM2 / UM2[U];
  let s = R.int(2, 20);
  if (!nice(s * perU, 2)) s = 4 * R.int(1, 5);
  const S = s * perU, lin = s * Lm / UM2[U];
  const q = `Sur une carte à l'échelle 1/${nb(e.k)}, ${R.pick(LIEUX)} occupe une surface de ${s} cm². Quelle est sa superficie réelle, ${UNOM[U]} ?`;
  const conv = U === 'm²' ? '' : ` = ${nb(perU, 4)} ${U}`;
  const expl = `Traduis d'abord 1 cm de la carte en longueur réelle, puis élève au carré pour savoir ce que représente 1 cm². À l'échelle 1/${nb(e.k)}, 1 cm représente ${nb(e.k)} cm = ${nb(Lm)} m, donc 1 cm² représente ${nb(Lm)} m × ${nb(Lm)} m = ${nb(perM2)} m²${conv}. ${s} cm² représentent ${s} × ${nb(perU, 4)} = ${nb(S, 4)} ${U}. Piège : ${s} × ${nb(Lm)} = ${nb(s * Lm)} m² applique l'échelle des longueurs à une aire.`;
  return Q(q, S, [lin, S * 100, S / 100, S * 10], v => nb(v, 6) + ' ' + U, i => S * Math.pow(10, sg(i) * 3), expl, v => v > 0 && nice(v, 6));
}

/* 3c · De l'évolution de l'aire à l'évolution des longueurs. */
const INV = [[10, 1], [20, 1], [30, 1], [40, 1], [50, 1], [60, 1], [100, 1], [25, 1], [10, -1], [20, -1], [30, -1], [40, -1], [50, -1]];
function s3c(R){
  const [t, s] = R.pick(INV), c = 1 + s * t / 100, T = (c * c - 1) * 100, absT = Math.abs(T);
  const vb = s > 0 ? 'augmente' : 'diminue', w = R.int(0, 3);
  let q, obj;
  if (w === 0){ q = `L'aire d'un carré ${vb} de ${nb(absT)} %. Comment évolue son côté ?`; obj = 'le côté'; }
  else if (w === 1){ q = `L'aire d'un disque ${vb} de ${nb(absT)} %. Comment évolue son rayon ?`; obj = 'le rayon'; }
  else if (w === 2){ q = `Une pizzeria change la taille de sa pizza, sans changer l'épaisseur : la quantité de pizza ${vb} de ${nb(absT)} %. Comment évolue son diamètre ?`; obj = 'le diamètre'; }
  else { q = `Une photo est ${s > 0 ? 'agrandie' : 'réduite'} sans être déformée : sa surface ${vb} de ${nb(absT)} %. Comment évoluent sa longueur et sa largeur ?`; obj = 'chaque dimension'; }
  const h = 1 + T / 200;
  const expl = `Si les longueurs sont multipliées par un coefficient c, l'aire est multipliée par c² : on cherche donc le nombre dont le carré est le coefficient de l'aire. ${evo(T)} pour l'aire donne le coefficient ${cx(c * c)} = ${cx(c)} × ${cx(c)}, donc ${obj} est multiplié par ${cx(c)}, soit ${evo(s * t)}. Piège : ${evo(T / 2)} divise le pourcentage par 2, mais ${cx(h)} × ${cx(h)} ${egal(h * h, 4)}, pas ${cx(c * c)} ; et ${evo(s * 10 * c)} vient de la racine de ${nb(100 * c * c)}, qui n'est pas le pourcentage d'évolution.`;
  return Q(q, s * t, [T / 2, T, s * 10 * c], evo, i => s * t + sg(i) * 5, expl, okPct(s * t));
}

/* 3d · Bordure de pizza, allée autour d'un bassin, cadre d'un tableau. */
function s3d(R){
  const w = R.int(0, 2);
  if (w === 0){
    const o = R.pick(ROND), r = R.int(8, 20), b = R.int(1, Math.min(5, Math.floor(r / 3))), ri = r - b, D = 2 * r;
    const bonne = frac(ri * ri, r * r);
    const pieges = [frac(ri, r), frac(r * r - ri * ri, r * r), frac((D - b) * (D - b), D * D)];
    const ch = [bonne], vus = new Set([norm(bonne)]);
    pieges.concat([frac((ri - 1) * (ri - 1), r * r), frac((ri + 1) * (ri + 1), r * r), frac(ri * ri, (r + 1) * (r + 1))]).forEach(s => { if (ch.length < 4 && !vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); } });
    const q = `Une ${o.s} de ${D} cm de diamètre a, tout autour, une bordure sans garniture de ${b} cm de large. Quelle fraction de sa surface est garnie ?`;
    const red = frac(ri * ri, r * r) === ri * ri + '/' + r * r ? '' : ` = ${bonne}`;
    const expl = `La partie garnie est un disque de même centre, dont le rayon vaut le rayon total moins la largeur de la bordure ; le rapport des aires est le carré du rapport des rayons. Rayon total : ${D} ÷ 2 = ${r} cm ; rayon garni : ${r} − ${b} = ${ri} cm. Fraction garnie : (${ri}/${r})² = ${ri * ri}/${r * r}${red}. Piège : ${pieges[0]} oublie d'élever au carré, ${pieges[1]} est la part de la bordure, et ${pieges[2]} retire ${b} cm au diamètre une seule fois, alors que la bordure est des deux côtés.`;
    return { q, a: bonne, accept: null, choix: ch, expl };
  }
  if (w === 1){
    const r = R.int(2, 10), b = R.int(1, 3), S = 2 * r * b + b * b;
    const q = `Un bassin circulaire de ${r} m de rayon est entouré d'une allée de ${b} m de large. Quelle est l'aire de l'allée ?`;
    const expl = `L'allée est la différence entre deux disques de même centre : le grand disque (bassin et allée) moins le bassin. Grand disque : π × ${r + b}² = ${(r + b) * (r + b)}π ; bassin : π × ${r}² = ${r * r}π ; allée : ${(r + b) * (r + b)}π − ${r * r}π = ${S}π m². Piège : π × ${b}² = ${b * b}π élève au carré la largeur seule, ${2 * r * b}π multiplie le tour du bassin par la largeur et oublie un morceau, et ${(r + b) * (r + b)}π compte aussi le bassin.`;
    return Q(q, S, [b * b, 2 * r * b, (r + b) * (r + b)], pis('m²'), i => S + sg(i) * 2, expl);
  }
  const c = 2 * R.int(5, 20), b = R.int(1, 5), S = (c + 2 * b) * (c + 2 * b) - c * c;
  const q = `Un tableau carré de ${c} cm de côté est entouré d'un cadre de ${b} cm de large. Quelle est l'aire du cadre ?`;
  const expl = `L'aire du cadre est l'aire du grand carré (tableau et cadre) moins l'aire du tableau. Le grand carré a pour côté ${c} + 2 × ${b} = ${c + 2 * b} cm : ${nb((c + 2 * b) * (c + 2 * b))} − ${nb(c * c)} = ${nb(S)} cm². Piège : ${nb(4 * c * b)} cm² compte quatre bandes de ${c} cm sur ${b} cm et oublie les quatre coins, et ${nb((c + b) * (c + b) - c * c)} cm² n'ajoute la largeur du cadre qu'une seule fois au côté.`;
  return Q(q, S, [4 * c * b, (c + b) * (c + b) - c * c, 4 * c * b + 8 * b * b], cm2, i => S + sg(i) * 4, expl);
}

/* 3e · Longueur +a % : comment faire évoluer la largeur pour une aire donnée ? */
function s3e(R){
  const [a, x, b] = R.pick(COMP);
  const but = x === 0 ? 'reste la même' : (x > 0 ? 'augmente' : 'diminue') + ' de ' + Math.abs(x) + ' %';
  const q = `La longueur d'un rectangle ${a > 0 ? 'augmente' : 'diminue'} de ${Math.abs(a)} %. Comment doit évoluer sa largeur pour que son aire ${but} ?`;
  const ca = 1 + a / 100, cxv = 1 + x / 100, cb = 1 + b / 100, cadd = 1 + (x - a) / 100;
  const expl = `Le coefficient de l'aire est le produit des coefficients de la longueur et de la largeur : on divise le coefficient visé pour l'aire par celui de la longueur. ${cx(cxv)} ÷ ${cx(ca)} = ${cx(cb)}, donc la largeur doit évoluer de ${evo(b)}. Vérification : ${cx(ca)} × ${cx(cb)} = ${cx(cxv)}. Piège : ${evo(x - a)} se contente de soustraire les pourcentages, or ${cx(ca)} × ${cx(cadd)} = ${cx(ca * cadd)}, pas ${cx(cxv)}.`;
  return Q(q, b, [x - a, -b, -a, x], evo, i => b + sg(i) * 5, expl, v => okPct(b)(v) && nice(v, 0) && v > -100 && v !== 0);
}

/* =====================================================
   NIVEAU 4 · plus dur que les exemples officiels
   ===================================================== */

/* 4a · Pizzas de Pythagore : deux pizzas valent une seule pizza de quel diamètre ? */
function s4a(R){
  const [a, b, c] = R.pick(TRIP), o = R.pick(ROND);
  if (R.int(0, 1)){
    const q = `Deux ${o.p} de même épaisseur ont pour diamètres ${a} cm et ${b} cm. Quel diamètre doit avoir une seule ${o.s}, de même épaisseur, pour contenir exactement autant que les deux réunies ?`;
    const expl = `À épaisseur égale, la quantité est proportionnelle au carré du diamètre : on additionne les carrés des diamètres, puis on cherche le nombre dont le carré donne cette somme. ${a}² + ${b}² = ${nb(a * a)} + ${nb(b * b)} = ${nb(c * c)} = ${c}², donc le diamètre cherché est ${c} cm. Piège : ${a + b} cm additionne les diamètres, ce qui donne beaucoup trop (${a + b}² = ${nb((a + b) * (a + b))}), et ${nb(c / 2, 1)} cm est le rayon, pas le diamètre.`;
    return Q(q, c, [a + b, c / 2, (a + b) / 2], cm, i => c + sg(i) * 2, expl, v => v > 0 && nice(v, 1));
  }
  const [x, y] = R.int(0, 1) ? [a, b] : [b, a];
  const q = `Une ${o.s} de ${c} cm de diamètre contient exactement autant que deux ${o.p} réunies, toutes de même épaisseur. L'une des deux a un diamètre de ${x} cm. Quel est le diamètre de l'autre ?`;
  const expl = `À épaisseur égale, la quantité est proportionnelle au carré du diamètre : le carré du grand diamètre est la somme des carrés des deux autres. ${c}² − ${x}² = ${nb(c * c)} − ${nb(x * x)} = ${nb(y * y)} = ${y}², donc l'autre ${o.s} mesure ${y} cm. Piège : ${c} − ${x} = ${c - x} cm soustrait les diamètres comme si la quantité leur était proportionnelle.`;
  return Q(q, y, [c - x, y / 2, (c + x) / 2], cm, i => y + sg(i) * 2, expl, v => v > 0 && nice(v, 1));
}

/* 4b · Échelle retrouvée, deux cartes, superficie réelle vers carte. */
const ECH4 = [{ k: 5000, ha: 0.25 }, { k: 10000, ha: 1 }, { k: 20000, ha: 4 }, { k: 25000, ha: 6.25 }, { k: 50000, ha: 25 }];
function s4b(R){
  const w = R.int(0, 2);
  if (w === 0){
    const e = R.pick(ECH4);
    let s = R.int(2, 16);
    if (!nice(s * e.ha, 2)) s = 4 * R.int(1, 4);
    const S = s * e.ha, perM2 = e.ha * 10000, Lm = e.k / 100;
    const ech = k => '1/' + nb(k);
    const q = `Sur une carte, un champ de ${nb(S)} ha est représenté par une surface de ${s} cm². Quelle est l'échelle de la carte ?`;
    const piege = perM2 !== e.k ? ` Piège : ${ech(perM2)} oublie de prendre la racine carrée, en lisant ${nb(perM2)} m² comme une longueur.` : ` Piège : une erreur de conversion (1 m = 100 cm) décale l'échelle d'un facteur 10.`;
    const expl = `Cherche quelle aire réelle représente 1 cm² de la carte, puis la longueur réelle représentée par 1 cm : c'est le côté du carré correspondant. 1 cm² représente ${nb(S)} ÷ ${s} = ${nb(e.ha)} ha = ${nb(perM2)} m², l'aire d'un carré de ${nb(Lm)} m de côté. Donc 1 cm représente ${nb(Lm)} m = ${nb(e.k)} cm : l'échelle est ${ech(e.k)}.` + piege;
    return Q(q, ech(e.k), [ech(perM2), ech(e.k * 10), ech(e.k / 10)], x => x, i => ech(e.k * Math.pow(10, sg(i) + (sg(i) > 0 ? 1 : -1))), expl);
  }
  if (w === 1){
    const K = [5000, 10000, 20000, 25000, 50000, 100000];
    let k1, k2, r, s, S;
    for (let i = 0; i < 40; i++){
      k1 = R.pick(K); k2 = R.pick(K); r = k1 / k2; s = R.int(1, 20); S = s * r * r;
      if (k1 !== k2 && nice(S, 2) && S >= 0.5 && S <= 400 && nice(s * r, 2)) break;
      k1 = 50000; k2 = 25000; r = 2; s = 3; S = 12;
    }
    const q = `Sur une carte au 1/${nb(k1)}, un lac occupe ${s} cm². Quelle surface occupe-t-il sur une carte au 1/${nb(k2)} ?`;
    const expl = `Pour passer d'une carte à l'autre, les longueurs sont multipliées par le quotient des échelles, et les aires par le carré de ce quotient. Les longueurs sont multipliées par ${nb(k1)} ÷ ${nb(k2)} = ${nb(r, 4)}, donc les aires par ${nb(r, 4)}² = ${nb(r * r, 4)} : ${s} × ${nb(r * r, 4)} = ${nb(S, 4)} cm². Piège : ${nb(s * r, 4)} cm² applique aux aires le rapport des longueurs, et ${nb(s / (r * r), 4)} cm² prend le rapport à l'envers.`;
    return Q(q, S, [s * r, s / (r * r), s / r], cm2, i => S + sg(i) * Math.max(1, Math.round(S / 4)), expl, v => v > 0 && nice(v, 4));
  }
  const e = R.pick([{ k: 10000, ha: 1 }, { k: 20000, ha: 4 }, { k: 25000, ha: 6.25 }, { k: 50000, ha: 25 }, { k: 100000, ha: 100 }]);
  const s = R.int(2, 20), S = s * e.ha, Lm = e.k / 100, kmU = S >= 100 && nice(S / 100, 2);
  const Stxt = kmU ? nb(S / 100) + ' km²' : nb(S) + ' ha';
  const q = `Un domaine a une superficie de ${Stxt}. Quelle surface occupe-t-il sur une carte au 1/${nb(e.k)} ?`;
  const lin = S * 10000 / Lm;
  const expl = `Traduis d'abord 1 cm² de la carte en aire réelle, en élevant au carré la longueur que représente 1 cm. 1 cm représente ${nb(e.k)} cm = ${nb(Lm)} m, donc 1 cm² représente ${nb(Lm)} × ${nb(Lm)} = ${nb(Lm * Lm)} m² = ${nb(e.ha)} ha. ${Stxt}${kmU ? ' = ' + nb(S) + ' ha' : ''} occupent donc ${nb(S)} ÷ ${nb(e.ha)} = ${s} cm². Piège : diviser ${nb(S * 10000)} m² par ${nb(Lm)} (la longueur pour 1 cm) donne ${nb(lin)} cm², car on oublie d'élever au carré.`;
  return Q(q, s, [lin, s * 100, s / 100], cm2, i => s + sg(i) * 2, expl, v => v > 0 && nice(v, 4));
}

/* 4c · Parallèle dans un triangle : aire du petit triangle ou du trapèze. */
const RAT = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5]];
function s4c(R){
  const [p, q0] = R.pick(RAT), w = R.int(0, 2);
  let place, Aire;
  if (w === 2){
    const u = R.int(2, 5), v = R.pick([2, 3, 4, 5].filter(x => x !== u));
    Aire = q0 * q0 * R.int(1, Math.floor(u * v / 2));                // aire ≤ AB × AC ÷ 2 : triangle possible
    place = `on place M sur [AB] et N sur [AC] avec AB = ${q0 * u} cm, AM = ${p * u} cm, AC = ${q0 * v} cm et AN = ${p * v} cm`;
  } else {
    Aire = q0 * q0 * R.int(1, Math.max(1, Math.floor(200 / (q0 * q0))));
    place = (w === 0 && p === 1 && q0 === 2) ? 'M est le milieu de [AB] et N celui de [AC]'
      : `on place M sur [AB] et N sur [AC] avec AM = ${p}/${q0} × AB et AN = ${p}/${q0} × AC`;
  }
  const tri = Aire * p * p / (q0 * q0), quad = Aire - tri, askTri = R.int(0, 1) === 1;
  const q = `Dans un triangle ABC d'aire ${nb(Aire)} cm², ${place}. Quelle est l'aire ${askTri ? 'du triangle AMN' : 'du quadrilatère MBCN'} ?`;
  const lin = Aire * p / q0;
  const expl = `Comme AM/AB = AN/AC, les droites (MN) et (BC) sont parallèles et le triangle AMN est une réduction du triangle ABC : son aire s'obtient en multipliant celle de ABC par le carré du rapport de réduction. Rapport : ${p}/${q0} ; aire de AMN : ${nb(Aire)} × ${p * p}/${q0 * q0} = ${nb(tri)} cm²${askTri ? '' : ` ; aire de MBCN : ${nb(Aire)} − ${nb(tri)} = ${nb(quad)} cm²`}. Piège : ${nb(Aire)} × ${p}/${q0} = ${nb(lin)} applique à une aire le rapport des longueurs${askTri ? '' : ', et ' + nb(tri) + ' cm² est l\'aire du petit triangle, pas celle du quadrilatère'}.`;
  if (askTri) return Q(q, tri, [lin, quad, Aire * p / (2 * q0)], cm2, i => tri + sg(i), expl);
  return Q(q, quad, [Aire - lin, tri, lin], cm2, i => quad + sg(i), expl);
}

/* 4d · Carré tourné dans un carré, carrés emboîtés par les milieux, carré dans un cercle. */
function s4d(R){
  const w = R.int(0, 2);
  if (w === 0){
    const c = R.int(6, 14), a = R.int(1, Math.floor((c - 1) / 2)), S = a * a + (c - a) * (c - a), t = a * (c - a) / 2;
    const q = `ABCD est un carré de ${c} cm de côté. On place P sur [AB], Q sur [BC], R sur [CD] et S sur [DA] avec AP = BQ = CR = DS = ${a} cm. Quelle est l'aire du quadrilatère PQRS ?`;
    const expl = `On retire au grand carré les quatre triangles rectangles des coins, qui sont tous identiques. Chaque coin est un triangle rectangle de côtés ${a} cm et ${c - a} cm, d'aire ${a} × ${c - a} ÷ 2 = ${nb(t)} cm². PQRS : ${c * c} − 4 × ${nb(t)} = ${S} cm². Piège : ${c * c} − 4 × ${a * (c - a)} oublie de diviser par 2 l'aire de chaque triangle, et ${nb(c * c / 2)} cm² (la moitié du carré) ne vaut que si les points sont les milieux.`;
    return Q(q, S, [c * c - 4 * a * (c - a), (c - a) * (c - a), c * c / 2], cm2, i => S + sg(i) * 2, expl);
  }
  if (w === 1){
    const A0 = R.pick([64, 128, 256, 512, 100, 200, 400, 800, 96, 160, 320, 48]), k = R.int(3, 5), S = A0 / Math.pow(2, k - 1);
    const q = `On part d'un carré d'aire ${A0} cm². En joignant les milieux de ses côtés, on obtient un deuxième carré. On recommence avec ce deuxième carré pour obtenir un troisième carré, et ainsi de suite. Quelle est l'aire du ${ORD[k]} carré ?`;
    const expl = `Le carré obtenu en joignant les milieux a une aire égale à la moitié de celle du carré de départ : les quatre coins coupés forment ensemble l'autre moitié. Du premier au ${ORD[k]} carré, on divise ${k - 1} fois par 2, donc par ${Math.pow(2, k - 1)} : ${A0} ÷ ${Math.pow(2, k - 1)} = ${nb(S)} cm². Piège : diviser par 4 à chaque étape revient à croire que le côté est divisé par 2, alors qu'il est divisé par √2 ; et attention à compter les étapes (${k - 1}, pas ${k}).`;
    return Q(q, S, [A0 / Math.pow(4, k - 1), A0 / Math.pow(2, k), A0 / Math.pow(2, k - 2)], cm2, i => S * Math.pow(2, sg(i) * 2), expl);
  }
  const c = 2 * R.int(2, 10), S = c * c / 2;
  const q = `Un carré de ${c} cm de côté a ses quatre sommets sur un cercle. Quelle est l'aire du disque délimité par ce cercle ?`;
  const expl = `Le diamètre du cercle est la diagonale du carré, et le carré de la diagonale vaut 2 × côté² (Pythagore) : inutile de calculer la racine carrée. Diagonale² = 2 × ${c}² = ${2 * c * c}, donc r² = ${2 * c * c} ÷ 4 = ${nb(S)}, et l'aire vaut π × r² = ${nb(S)}π cm². Piège : ${nb(c * c / 4)}π prend pour rayon la moitié du côté (c'est le disque inscrit dans le carré), et ${c * c}π prend le côté pour rayon.`;
  return Q(q, S, [c * c / 4, c * c, 2 * c * c], pis('cm²'), i => S + sg(i) * 4, expl);
}

/* 4e · Maquettes : aire (échelle au carré), masse (au cube), peinture (au carré). */
const MAQ = [
  { maq: 'de voilier', piece: 'la voile', vraie: 'la vraie voile' },
  { maq: 'de maison', piece: 'le toit', vraie: 'le vrai toit' },
  { maq: 'd\'avion', piece: 'une aile', vraie: 'la vraie aile' },
  { maq: 'de stade', piece: 'la pelouse', vraie: 'la vraie pelouse' }
];
function s4e(R){
  const w = R.int(0, 2);
  if (w === 0){
    const o = R.pick(MAQ), k = R.pick([10, 20, 25, 50, 100]);
    const s = k === 10 ? 50 * R.int(4, 30) : k === 20 ? 25 * R.int(2, 20) : k === 25 ? 16 * R.int(1, 15) : k === 50 ? 4 * R.int(1, 20) : R.int(2, 30);
    const S = s * k * k / 10000, lin = s * k / 10000;
    const q = `Une maquette ${o.maq} est construite à l'échelle 1/${k}. Sur la maquette, ${o.piece} a une aire de ${nb(s)} cm². Quelle est l'aire de ${o.vraie} ?`;
    const expl = `À l'échelle 1/${k}, les longueurs réelles sont ${k} fois plus grandes, donc les aires réelles sont ${k}² fois plus grandes. ${nb(s)} × ${nb(k * k)} = ${nb(s * k * k)} cm² = ${nb(S, 4)} m², car 1 m² = 10 000 cm². Piège : ${nb(s)} × ${k} = ${nb(s * k)} cm² = ${nb(lin, 4)} m² multiplie l'aire par ${k} seulement.`;
    return Q(q, S, [lin, S * 10, S / 10, S * 100], m2, i => S * Math.pow(10, sg(i)), expl, v => v > 0 && nice(v, 4));
  }
  if (w === 1){
    const [H, h] = R.pick([[1, 50], [1, 25], [1, 20], [1, 10], [2, 50], [2, 40], [2, 20], [1.5, 50], [1.5, 30], [3, 60], [3, 30]]);
    const r = H * 100 / h, r3 = r * r * r, M = r3 * R.int(1, Math.max(1, Math.floor(2000 / r3))), S = M / r3;
    const q = `Une statue pleine en bronze de ${nb(H)} m de haut pèse ${nb(M)} kg. Une copie exacte de ${h} cm de haut, pleine elle aussi et dans le même bronze, pèse combien ?`;
    const expl = `Pour deux objets pleins de même forme, les masses (comme les volumes) sont dans le rapport du cube du rapport des longueurs. Rapport des hauteurs : ${h} cm ÷ ${nb(H * 100)} cm = 1/${r}, donc la masse est divisée par ${r}³ = ${nb(r3)} : ${nb(M)} ÷ ${nb(r3)} = ${nb(S)} kg. Piège : diviser par ${r} (${nb(M / r)} kg) ou par ${r}² (${nb(M / (r * r))} kg) oublie que la statue a trois dimensions.`;
    return Q(q, S, [M / r, M / (r * r)], v => nb(v, 2) + ' kg', i => S * (1 + sg(i) / 2), expl);
  }
  const e = R.pick([10, 15, 20, 25, 30]), k = R.pick([2, 3, 4]), V = R.pick([15, 20, 25, 30, 40, 50]), S = V * k * k;
  const q = `Il faut ${V} mL de peinture pour peindre toutes les faces d'une boîte cubique de ${e} cm d'arête. Combien en faut-il, avec la même couche, pour une boîte cubique de ${e * k} cm d'arête ?`;
  const expl = `La peinture recouvre une surface : la quantité est proportionnelle à l'aire, donc au carré du rapport des arêtes. L'arête est multipliée par ${k}, l'aire par ${k * k} : ${V} × ${k * k} = ${nb(S)} mL. Piège : ${nb(V * k * k * k)} mL utilise le cube, qui sert pour un volume (remplir la boîte), pas pour la peindre ; ${V * k} mL oublie l'effet du carré.`;
  return Q(q, S, [V * k, V * k * k * k, V * 2 * k], v => nb(v, 0) + ' mL', i => S + sg(i) * V, expl, v => v > 0 && nice(v, 0));
}

/* 4f · Parts de pizzas : laquelle est la plus grosse, et de combien ? */
function s4f(R){
  const [r1, k1, r2, k2] = R.pick(PARTS), o = R.pick(ROND), A1 = r1 * r1 / k1, A2 = r2 * r2 / k2;
  const p = (A1 / A2 - 1) * 100, gros = p > 0;
  const lib = x => x > 0 ? `${nb(x, 1)} % plus grosse` : `${nb(-x, 1)} % plus petite`;
  const bonne = lib(p), ch = [bonne], vus = new Set([norm(bonne)]);
  const cands = [
    (r1 * r1 / (r2 * r2) - 1) * 100,                                 // oubli du nombre de parts
    (r1 * k2 / (r2 * k1) - 1) * 100,                                 // comparaison des diamètres
    -p,                                                              // sens inversé
    (1 - A2 / A1) * 100                                              // mauvaise base
  ];
  cands.forEach(x => {
    if (ch.length >= 4 || !nice(x, 1) || Math.abs(x) < 1) return;
    if ((x > 0) === gros && Math.abs(Math.abs(x) - Math.abs(p)) < 2) return;
    const s = lib(x);
    if (!vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); }
  });
  ['Exactement de même taille'].concat([1, 2, 3, 4, 5, 6].map(i => lib(p + (gros ? 1 : -1) * 5 * i))).forEach(s => { if (ch.length < 4 && !vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); } });
  const q = `Une ${o.s} de ${2 * r1} cm de diamètre est coupée en ${k1} parts égales, et une ${o.s} de ${2 * r2} cm de diamètre en ${k2} parts égales. Comment une part de la grande se compare-t-elle à une part de la petite ?`;
  const expl = `Une part a pour aire l'aire de la ${o.s} divisée par le nombre de parts, et l'aire est proportionnelle au carré du rayon : π se simplifie. Grande : ${r1}² ÷ ${k1} = ${r1 * r1} ÷ ${k1} ${egal(A1, 2)}. Petite : ${r2}² ÷ ${k2} = ${r2 * r2} ÷ ${k2} ${egal(A2, 2)}. Rapport des parts : (${r1 * r1} × ${k2}) ÷ (${r2 * r2} × ${k1}) = ${nb(r1 * r1 * k2)} ÷ ${nb(r2 * r2 * k1)} = ${cx(A1 / A2)} : une part de la grande est ${bonne}. Piège : comparer seulement les ${o.p} entières oublie le nombre de parts${gros ? '' : ' ; ici, la plus grande ' + o.s + ' donne pourtant les plus petites parts'}.`;
  return { q, a: bonne, accept: null, choix: ch, expl };
}

/* 4g · Évolutions successives : rayon +a % puis −b %, côté +a % deux fois, diamètre et épaisseur. */
function s4g(R){
  const w = R.int(0, 2);
  if (w === 0){
    let a, b, c, v;
    for (let i = 0; i < 60; i++){                                   // évolution exacte avec 2 décimales au plus
      a = R.pick([10, 20, 25, 50]); b = R.pick([10, 20, 25, 40, 50]); c = (1 + a / 100) * (1 - b / 100); v = (c * c - 1) * 100;
      if (nice(v, 2)) break;
      a = 20; b = 50; c = 0.6; v = -64;
    }
    const q = `Le rayon d'un disque augmente de ${a} %, puis ce nouveau rayon diminue de ${b} %. Comment évolue l'aire du disque entre le début et la fin ?`;
    const expl = `Calcule d'abord le coefficient global du rayon, puis élève-le au carré pour obtenir celui de l'aire. Rayon : ${cx(1 + a / 100)} × ${cx(1 - b / 100)} = ${cx(c)} ; aire : ${cx(c)} × ${cx(c)} = ${cx(c * c)}, soit ${evo(v)}. Piège : ${evo((c - 1) * 100)} est l'évolution du rayon, pas celle de l'aire${a === b ? ', et 0 % croit que la hausse et la baisse se compensent' : ''}.`;
    return Q(q, v, [(c - 1) * 100, a - b, 2 * (a - b)], evo, i => v + sg(i) * 3, expl, okPct(v));
  }
  if (w === 1){
    const a = R.pick([10, 20, 50]), c = (1 + a / 100) * (1 + a / 100), v = (c * c - 1) * 100;
    const q = `Le côté d'un carré augmente de ${a} %, puis le nouveau côté augmente encore de ${a} %. Comment évolue l'aire du carré entre le début et la fin ?`;
    const expl = `Le côté est multiplié deux fois par ${cx(1 + a / 100)}, et l'aire par le carré du coefficient du côté. Côté : ${cx(1 + a / 100)} × ${cx(1 + a / 100)} = ${cx(c)} ; aire : ${cx(c)} × ${cx(c)} = ${cx(c * c)}, soit ${evo(v)}. Piège : ${evo(((1 + a / 50) * (1 + a / 50) - 1) * 100)} vient de l'addition ${a} + ${a} = ${2 * a} % pour le côté, et ${evo((c - 1) * 100)} ne compte qu'une seule hausse.`;
    return Q(q, v, [((1 + a / 50) * (1 + a / 50) - 1) * 100, (c - 1) * 100, 2 * a, 4 * a], evo, i => v + sg(i) * 5, expl, okPct(v));
  }
  let a, b, s2, c, v;
  for (let i = 0; i < 60; i++){                                     // évolution exacte avec 2 décimales au plus
    a = R.pick([10, 20, 25, 50]); b = R.pick([10, 20, 25, 40, 50]); s2 = (1 + a / 100) * (1 + a / 100); c = s2 * (1 - b / 100); v = (c - 1) * 100;
    if (nice(v, 2)) break;
    a = 20; b = 20; s2 = 1.44; c = 1.152; v = 15.2;
  }
  const q = `Une pizzeria augmente de ${a} % le diamètre de sa pizza, mais diminue son épaisseur de ${b} %. Comment évolue la quantité de pâte ?`;
  const expl = `La quantité de pâte est un volume : surface × épaisseur, et la surface suit le carré du diamètre. Surface : ${cx(1 + a / 100)} × ${cx(1 + a / 100)} = ${cx(s2)} ; quantité : ${cx(s2)} × ${cx(1 - b / 100)} = ${cx(c)}, soit ${evo(v)}. Piège : ${evo(a - b)} additionne les pourcentages et oublie l'effet du carré, et ${evo(((1 + a / 100) * (1 - b / 100) - 1) * 100)} oublie que le diamètre agit deux fois.`;
  return Q(q, v, [a - b, ((1 + a / 100) * (1 - b / 100) - 1) * 100, 2 * a - b], evo, i => v + sg(i) * 3, expl, okPct(v));
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif
   ===================================================== */

/* 5a · Triangle découpé en n morceaux par des parallèles équidistantes : aires a, 3a, 5a, 7a… */
function s5a(R){
  const n = R.int(3, 6), w = R.int(0, 3), a = R.int(1, 12);
  let info = `Le morceau 1 a une aire de ${a} cm².`, qu, S, pieges, cible;
  if (w === 0){ qu = `Quelle est l'aire du morceau ${n}, celui qui touche la base ?`; cible = n; S = (2 * n - 1) * a; pieges = [a, n * a, n * n * a]; }
  else if (w === 1){ const j = R.int(2, n - 1); cible = j; qu = `Quelle est l'aire du morceau ${j} ?`; S = (2 * j - 1) * a; pieges = [a, j * a, j * j * a, (j - 1) * (j - 1) * a]; }
  else if (w === 2){ cible = 0; qu = 'Quelle est l\'aire du triangle entier ?'; S = n * n * a; pieges = [n * a, (2 * n - 1) * a, n * (n + 1) / 2 * a]; }
  else {
    const mm = R.int(1, Math.max(1, Math.floor(150 / (n * n)))), T = n * n * mm, j = R.int(1, n);
    cible = j; info = `Le triangle entier a une aire de ${T} cm².`; qu = `Quelle est l'aire du morceau ${j} ?`;
    S = (2 * j - 1) * mm; pieges = [T / n, j * j * mm, j * mm];
  }
  const q = `${Cap(NOMBRE[n - 1])} droites parallèles à la base d'un triangle partagent sa hauteur en ${n} parts égales. Elles découpent le triangle en ${n} morceaux, numérotés de 1 à ${n} en partant du sommet : le morceau 1 est un petit triangle, les autres sont des bandes. ${info} ${qu}`;
  const u = w === 3 ? 'm' : 'a';
  const cum = [], bandes = [];
  for (let k = 1; k <= n; k++){ cum.push((k * k === 1 ? '' : k * k) + u); bandes.push((2 * k - 1 === 1 ? '' : 2 * k - 1) + u); }
  const fin = w === 2 ? `Le triangle entier vaut ${n * n} × ${a} = ${S} cm².`
    : w === 3 ? `Le triangle entier vaut ${n * n}m = ${n * n * (S / (2 * cible - 1))} cm², donc m = ${S / (2 * cible - 1)} cm², et le morceau ${cible} vaut ${2 * cible - 1} × ${S / (2 * cible - 1)} = ${S} cm².`
    : `Le morceau ${cible} vaut ${2 * cible - 1} × ${a} = ${S} cm².`;
  const expl = `Les triangles qui partent du sommet et s'arrêtent sur une des droites sont des réductions du grand triangle : celui qui s'arrête à la k-ième division a des longueurs k fois plus grandes que le morceau 1, donc une aire k² fois plus grande. En notant ${u} l'aire du morceau 1, ces triangles ont pour aires ${cum.join(', ')} ; chaque morceau est la différence de deux triangles consécutifs : ${bandes.join(', ')}. ${fin} Piège : les morceaux n'ont pas tous la même aire, et l'aire n'est pas proportionnelle à la distance au sommet.`;
  return Q(q, S, pieges, cm2, i => S + sg(i) * (w === 3 ? 1 : a), expl, v => v > 0 && nice(v, 2));
}

/* 5b · Marge ou allée de largeur constante : équation du second degré. */
const KTXT = {
  '2/1': ['est égale à', 'le double de'], '3/1': ['est le double de', 'le triple de'],
  '3/2': ['vaut la moitié de', '1,5 fois'], '4/1': ['est le triple de', 'le quadruple de']
};
function s5b(R){
  const [a, b, x, kn, kd] = R.pick(CADRE), K = kn / kd, kt = KTXT[kn + '/' + kd];
  const photo = R.int(0, 2) > 0;
  const u = photo ? 'cm' : 'm', u2 = photo ? 'cm²' : 'm²';
  const q = photo
    ? `Une photo de ${a} cm sur ${b} cm est collée sur un carton rectangulaire, avec une marge de même largeur tout autour. L'aire de la marge ${kt[0]} l'aire de la photo. Quelle est la largeur de la marge ?`
    : `Un bassin rectangulaire de ${a} m sur ${b} m est entouré d'une allée de largeur constante. L'aire de l'allée ${kt[0]} l'aire du bassin. Quelle est la largeur de l'allée ?`;
  const P = a * b, T = K * P, sansCoins = (K - 1) * P / (2 * (a + b));
  const pieges = [2 * x];
  if (nice(sansCoins, 1) && Math.abs(sansCoins - x) > 1e-9) pieges.push(sansCoins);
  pieges.push(x / 2);
  const fmt = v => nb(v, 1) + ' ' + u;
  const expl = `Appelle x la largeur cherchée : le grand rectangle mesure (${a} + 2x) sur (${b} + 2x), et son aire vaut ${kt[1]} celle ${photo ? 'de la photo' : 'du bassin'} ; avec un QCM, le plus rapide est de tester les propositions. ${photo ? 'Photo' : 'Bassin'} : ${a} × ${b} = ${nb(P)} ${u2}, donc il faut un grand rectangle de ${nb(T)} ${u2}. Avec x = ${x} : ${a + 2 * x} × ${b + 2 * x} = ${nb(T)}. Piège : ${fmt(2 * x)} vient de (${a} + x)(${b} + x), qui oublie que la largeur s'ajoute des deux côtés${pieges.length > 2 ? ', et ' + fmt(sansCoins) + ' vient de 2 × (' + a + ' + ' + b + ') × x, qui oublie les quatre coins' : ''}.`;
  return Q(q, x, pieges, fmt, i => x + sg(i), expl, v => v > 0 && nice(v, 1));
}

/* 5c · Trois pizzas pour une : a² + b² + c² = d². */
function s5c(R){
  const [a, b, c, d] = R.pick(QUAD), o = R.pick(ROND);
  if (R.int(0, 1)){
    const q = `Trois ${o.p} de même épaisseur ont pour diamètres ${a} cm, ${b} cm et ${c} cm. Quel diamètre doit avoir une seule ${o.s}, de même épaisseur, pour contenir exactement autant que les trois réunies ?`;
    const expl = `À épaisseur égale, les quantités sont proportionnelles aux carrés des diamètres : on additionne les carrés, puis on cherche le nombre dont le carré donne cette somme. ${a}² + ${b}² + ${c}² = ${nb(a * a)} + ${nb(b * b)} + ${nb(c * c)} = ${nb(d * d)} = ${d}². Le diamètre cherché est ${d} cm. Piège : ${a + b + c} cm additionne les diamètres, et ${nb(d / 2, 1)} cm est le rayon.`;
    return Q(q, d, [a + b + c, d / 2, (a + b + c) / 3], cm, i => d + sg(i), expl, v => v > 0 && nice(v, 1));
  }
  const L = R.shuffle([a, b, c]), x = L[0], y = L[1], z = L[2];
  const q = `Une ${o.s} de ${d} cm de diamètre contient exactement autant que trois ${o.p} réunies, toutes de même épaisseur. ${x === y ? 'Deux d\'entre elles ont un diamètre de ' + x + ' cm' : 'Deux d\'entre elles ont pour diamètres ' + x + ' cm et ' + y + ' cm'}. Quel est le diamètre de la troisième ?`;
  const expl = `À épaisseur égale, les quantités sont proportionnelles aux carrés des diamètres : le carré du grand diamètre est la somme des carrés des trois autres. ${d}² − ${x}² − ${y}² = ${nb(d * d)} − ${nb(x * x)} − ${nb(y * y)} = ${nb(z * z)} = ${z}². La troisième mesure ${z} cm. Piège : ${d - x - y > 0 ? d + ' − ' + x + ' − ' + y + ' = ' + (d - x - y) + ' cm soustrait' : 'il ne faut pas soustraire'} les diamètres comme si la quantité leur était proportionnelle, et ${nb(z / 2, 1)} cm serait le rayon.`;
  return Q(q, z, [d - x - y, z / 2, z * z], cm, i => z + sg(i), expl, v => v > 0 && nice(v, 1) && v < 200);
}

/* 5d · Longueur de départ : +a cm donne +t % d'aire ; ou +a cm donne +Δ cm². */
const COEF5 = [[1.1, 21], [1.2, 44], [1.25, 56.25], [1.3, 69], [1.4, 96], [1.5, 125], [1.6, 156]];
function s5d(R){
  if (R.int(0, 2) > 0){
    let c, t, ad, D, carre = R.int(0, 2) === 0;
    for (let i = 0; i < 60; i++){
      [c, t] = R.pick(COEF5); ad = R.int(1, 20); D = ad / (c - 1);
      if (nice(D, 0) && D >= (carre ? 4 : 10) && D <= (carre ? 40 : 60)) break;
      c = 1.2; t = 44; ad = 6; D = 30;
    }
    D = Math.round(D);
    const o = R.pick(ROND), len = carre ? 'côté' : 'diamètre';
    const q = carre
      ? `En augmentant de ${ad} cm le côté d'un carré, on augmente son aire de ${nb(t)} %. Quel était le côté de départ ?`
      : `En augmentant de ${ad} cm le diamètre d'une ${o.s}, on obtient une ${o.s} de même épaisseur qui contient ${nb(t)} % de plus. Quel était le diamètre de départ ?`;
    const lin = ad * 100 / t;
    const pieges = carre ? [D + ad, lin, ad * 200 / t] : [D / 2, D + ad, lin];
    const expl = `Commence par trouver le coefficient des longueurs : c'est le nombre dont le carré est le coefficient de l'aire. ${evo(t)} pour l'aire donne × ${cx(c * c)} = ${cx(c)} × ${cx(c)}, donc le ${len} est multiplié par ${cx(c)} : il augmente de ${nb((c - 1) * 100)} %. Ces ${nb((c - 1) * 100)} % du ${len} de départ valent ${ad} cm, donc le ${len} de départ vaut ${ad} ÷ ${cx(c - 1)} = ${D} cm. Piège : ${D + ad} cm est le ${len} d'arrivée${carre ? '' : ', ' + nb(D / 2, 1) + ' cm est le rayon'}, et appliquer les ${nb(t)} % au ${len} lui-même ne marche pas.`;
    return Q(q, D, pieges, cm, i => D + sg(i) * 2, expl, v => v > 0 && nice(v, 1));
  }
  const ad = R.int(1, 6), cc = R.int(3, 30), De = 2 * ad * cc + ad * ad;
  const q = `Si on augmente de ${ad} cm le côté d'un carré, son aire augmente de ${De} cm². Quel est le côté de ce carré ?`;
  const expl = `Si le côté passe de c à c + ${ad}, l'aire passe de c² à (c + ${ad})², donc elle augmente de 2 × ${ad} × c + ${ad}² ; avec un QCM, on peut aussi tester chaque proposition. 2 × ${ad} × c + ${ad * ad} = ${De} donne ${2 * ad} × c = ${De - ad * ad}, donc c = ${cc} cm. Vérification : ${cc + ad}² − ${cc}² = ${nb((cc + ad) * (cc + ad))} − ${nb(cc * cc)} = ${De}. Piège : ${nb(De / (2 * ad), 1)} cm oublie le petit carré ${ad}² = ${ad * ad}, et ${nb((De - ad * ad) / ad, 1)} cm oublie le facteur 2.`;
  return Q(q, cc, [De / (2 * ad), (De - ad * ad) / ad, De / ad], cm, i => cc + sg(i), expl, v => v > 0 && nice(v, 1));
}

/* 5e · Carrés et disques inscrits en chaîne. */
function s5e(R){
  const k = R.int(2, 5), c = R.pick(k >= 4 ? [4, 8, 12, 16, 20] : [4, 6, 8, 10, 12, 16, 20]);
  const etapes = ['On trace un carré de ' + c + ' cm de côté', 'puis le disque inscrit dans ce carré (il touche ses quatre côtés)', 'puis le carré inscrit dans ce disque (ses quatre sommets sont sur le cercle)', 'puis le disque inscrit dans ce deuxième carré', 'puis le carré inscrit dans ce deuxième disque', 'puis le disque inscrit dans ce troisième carré'];
  const q = etapes.slice(0, k + 1).join(', ') + '. Quelle est l\'aire de la dernière figure tracée ?';
  const C2 = c * c;
  // figure k : carré si k est pair (carré numéro k/2 + 1), disque si k est impair (disque numéro (k+1)/2)
  const disque = k % 2 === 1, j = disque ? (k + 1) / 2 : k / 2;
  let S, pieges, fmt;
  const sq = i => C2 / Math.pow(2, i);                               // aire du carré numéro i + 1
  const dk = i => C2 / (4 * Math.pow(2, i - 1));                      // aire / π du disque numéro i
  if (disque){
    S = dk(j); fmt = pis('cm²');
    pieges = [C2 / (4 * Math.pow(4, j - 1)), dk(j - 1), C2 / (4 * Math.pow(2, j)), nb(sq(j - 1), 2) + ' cm²'];
  } else {
    S = sq(j); fmt = cm2;
    pieges = [C2 / Math.pow(4, j), sq(j - 1), nb(dk(j), 2) + 'π cm²'];
  }
  const ligne = [];
  for (let i = 0; i <= k; i++){
    if (i % 2 === 0) ligne.push(`carré : ${nb(sq(i / 2), 2)} cm²`);
    else ligne.push(`disque : ${nb(dk((i + 1) / 2), 2)}π cm²`);
  }
  const expl = `Un disque inscrit dans un carré de côté s a pour rayon s/2, donc pour aire π × s²/4 ; le carré inscrit dans ce disque a pour diagonale s, donc pour aire s²/2 : à chaque aller-retour, l'aire du carré est divisée par 2. Les aires successives sont : ${ligne.join(' ; ')}. Piège : le côté n'est pas divisé par 2 à chaque étape mais par √2, donc l'aire des carrés est divisée par 2, et non par 4 ; et il faut compter les étapes avec soin.`;
  return Q(q, S, pieges, fmt, i => S * Math.pow(2, sg(i)), expl);
}

/* 5f · Prix au cm² : la grande est-elle plus ou moins chère au cm², et de combien ? */
function s5f(R){
  const [d1, p1, d2, p2, c] = R.pick(PRIX), g = pgcd(d1, d2), u = d2 / g, v = d1 / g, juste = p1 * u * u / (v * v);
  const lib = x => x > 0 ? `${nb(x, 1)} % plus cher` : `${nb(-x, 1)} % moins cher`;
  const bonne = lib(c), ch = [bonne], vus = new Set([norm(bonne)]);
  const cands = [
    (p2 / p1 - 1) * 100,                                             // comparaison des prix seuls
    (p2 * d1 / (p1 * d2) - 1) * 100,                                 // prix au cm de diamètre
    -c,                                                              // sens inversé
    -(juste / p2 - 1) * 100                                          // mauvaise base (petite comparée à la grande)
  ];
  cands.forEach(x => {
    if (ch.length >= 4 || !nice(x, 1) || Math.abs(x) < 1) return;
    if ((x > 0) === (c > 0) && Math.abs(Math.abs(x) - Math.abs(c)) < 2) return;
    const s = lib(x);
    if (!vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); }
  });
  ['Le même prix au cm²'].concat([1, 2, 3, 4, 5, 6].map(i => lib(c + (c > 0 ? 1 : -1) * 5 * i))).forEach(s => { if (ch.length < 4 && !vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); } });
  const q = `Une pizzeria vend une pizza de ${d1} cm de diamètre à ${eur(p1)} et une pizza de ${d2} cm, de même épaisseur, à ${eur(p2)}. Par rapport à la petite, que vaut le prix d'un cm² de pizza dans la grande ?`;
  const rk = frac(u, v), rk2 = frac(u * u, v * v);
  const expl = `Calcule le prix qu'aurait la grande pizza si son cm² coûtait autant que celui de la petite : on multiplie le prix de la petite par le rapport des surfaces, c'est-à-dire par le carré du rapport des diamètres. Rapport des diamètres : ${d2}/${d1} = ${rk} ; rapport des surfaces : ${rk2}. Prix « au même tarif » : ${eur(p1)} × ${rk2} = ${eur(juste)}. La grande coûte ${eur(p2)}, et ${eur(p2)} ÷ ${eur(juste)} = ${cx(1 + c / 100)} : son cm² est ${bonne}. Piège : comparer seulement les prix (${nb(p2 / p1, 3)} fois plus cher) oublie que la grande pizza est aussi beaucoup plus grande.`;
  return { q, a: bonne, accept: null, choix: ch, expl };
}

/* ---------- répartition par niveau ---------- */
const TYPES = {
  1: [s1a, s1b, s1c, s1d, s1e],
  2: [s2a, s2b, s2c, s2d, s2e],
  3: [s3a, s3b, s3c, s3d, s3e],
  4: [s4a, s4b, s4c, s4d, s4e, s4f, s4g],
  5: [s5a, s5b, s5c, s5d, s5e, s5f]
};
/* Repli si un tirage échoue : une question simple et toujours valide. */
function SECOURS(){
  return {
    q: 'On double le côté d\'un carré. Par combien son aire est-elle multipliée ?', a: '4', accept: null, choix: ['4', '2', '8', '6'],
    expl: 'Quand toutes les longueurs d\'une figure sont multipliées par un même nombre, son aire est multipliée par le carré de ce nombre. Ici 2 × 2 = 4. Piège : répondre 2, c\'est oublier qu\'une aire dépend de deux longueurs.'
  };
}
function valide(ex){
  if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return false;
  const n = ex.choix.map(norm);
  return new Set(n).size === 4 && n.filter(x => x === norm(ex.a)).length === 1 && !/NaN|undefined|Infinity/.test(ex.q + ex.choix.join(' ') + ex.expl);
}

A.push({
  id: 'alb-15-aires-effet-carre',
  phase: 'albert',
  ordre: 15,
  theme: 'geometrie',
  titre: 'Aires, effet du carré, échelles (type pizzas)',
  objectif: 'Comparer des aires sans calculatrice : effet du carré quand les longueurs changent, pizzas et disques comparés par le carré du rayon, plans et cartes à l\'échelle, conversions d\'aires.',
  lecon:
`<p class="lede">Quand une figure s'agrandit, son aire grandit bien plus vite que ses longueurs : si les longueurs sont multipliées par k, l'aire est multipliée par <mark>k²</mark>. C'est tout le secret des questions de pizzas, de plans et de cartes.</p>
<h2>Ce que le test te demande</h2>
<p>Le test d'Albert School aime les situations concrètes où l'intuition se trompe : deux petites pizzas ou une grande, laquelle donne le plus ? De combien augmente une aire quand le côté augmente de 10 % ? Quelle superficie réelle représente une tache de quelques cm² sur une carte ? On ne te demande pas de réciter une formule, mais de comparer et d'estimer vite, sans calculatrice. Les questions faciles se règlent avec le réflexe « k² » ; les plus difficiles le cachent dans une échelle, un pourcentage ou une petite équation.</p>
<h2>Les prérequis, en bref</h2>
<table class="tbl">
<thead><tr><th>Figure</th><th>Aire</th></tr></thead>
<tbody>
<tr><td>Carré de côté c</td><td>c × c = c²</td></tr>
<tr><td>Rectangle de longueur L et de largeur l</td><td>L × l</td></tr>
<tr><td>Triangle de base b et de hauteur h</td><td>b × h ÷ 2</td></tr>
<tr><td>Disque de rayon r (diamètre d = 2r)</td><td>π × r²</td></tr>
</tbody>
</table>
<p>Une unité d'aire est un carré : 1 m = 100 cm, donc 1 m² = 100 × 100 = 10 000 cm². De même, 1 ha est un carré de 100 m de côté, soit 10 000 m², et 1 km² = 100 ha = 1 000 000 m². Une évolution de t % multiplie par le coefficient 1 + t/100, et le pourcentage d'évolution vaut coefficient − 1.</p>
<div class="formule"><p>longueurs × k, donc aires × k², et volumes × k³</p></div>
<h2>La méthode en 4 étapes</h2>
<div class="etapes">
<p><strong>1. Je repère le rapport des longueurs k :</strong> rapport des diamètres, coefficient 1 + t/100 d'un pourcentage, ou échelle d'un plan.</p>
<p><strong>2. Je l'élève au carré pour les aires :</strong> k = 1,2 donne 1,44 ; k = 3 donne 9 ; au 1/25 000, 1 cm représente 250 m, donc 1 cm² représente 250 × 250 = 62 500 m².</p>
<p><strong>3. Je compare sans π :</strong> pour des disques, π se simplifie ; je compare les carrés des rayons (ou des diamètres).</p>
<p><strong>4. Je reviens à la question :</strong> pourcentage = coefficient − 1, bonne unité, et la bonne base pour « de plus que » (la plus petite quantité).</p>
</div>
<h2>Exemples résolus</h2>
<h3>1. Le côté augmente de 10 %</h3>
<p>Le coefficient des longueurs est 1,1 ; celui de l'aire est 1,1 × 1,1 = 1,21. L'aire augmente donc de 21 %, ni de 10 %, ni de 20 %.</p>
<h3>2. Deux petites pizzas ou une grande ?</h3>
<p>« Deux pizzas de 24 cm ou une pizza de 34 cm ? » Les diamètres font croire que les petites gagnent largement (48 cm contre 34 cm). Compare plutôt les carrés des rayons : 2 × 12² = 288 contre 17² = 289. C'est pratiquement pareil ! Autre cas : trois pizzas de 20 cm contre une de 36 cm donnent 3 × 10² = 300 contre 18² = 324, et 324 ÷ 300 = 1,08 : la grande donne environ 8 % de plus.</p>
<h3>3. Une carte</h3>
<p>« Sur une carte au 1/20 000, un bois occupe 6 cm². Superficie réelle ? » 1 cm représente 20 000 cm = 200 m, donc 1 cm² représente 200 × 200 = 40 000 m² = 4 ha. Les 6 cm² représentent 6 × 4 = 24 ha. Le piège serait 6 × 200 = 1 200 m², qui applique l'échelle des longueurs à une aire.</p>
<h3>4. Remonter de l'aire à la longueur</h3>
<p>« L'aire d'un disque a augmenté de 69 %. Et son rayon ? » Le coefficient de l'aire est 1,69 = 1,3 × 1,3, donc le rayon a été multiplié par 1,3 : il a augmenté de 30 %. Diviser 69 par 2 (34,5 %) est faux.</p>
<h3>5. Additionner des aires</h3>
<p>« Une pizza de 30 cm et une de 40 cm contiennent autant qu'une seule pizza de quel diamètre ? » On additionne les carrés : 30² + 40² = 900 + 1 600 = 2 500 = 50². Réponse : 50 cm, et surtout pas 70 cm.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl">
<thead><tr><th>Longueurs</th><th>+10 %</th><th>+20 %</th><th>+30 %</th><th>+50 %</th><th>−10 %</th><th>−20 %</th><th>−50 %</th></tr></thead>
<tbody><tr><th>Aire</th><td>+21 %</td><td>+44 %</td><td>+69 %</td><td>+125 %</td><td>−19 %</td><td>−36 %</td><td>−75 %</td></tr></tbody>
</table>
<p>Connais les carrés de 11 à 25 : 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625. Retiens les triangles rectangles « entiers » (3, 4, 5) et (5, 12, 13) et leurs multiples : 30² + 40² = 50². Sur une carte, au 1/10 000, 1 cm² représente 1 ha ; au 1/100 000, 1 cm² représente 1 km². Pour un disque, garde π en facteur jusqu'au bout : 225π se compare à 200π sans rien calculer. Enfin, une masse ou un volume suit le cube : une copie deux fois plus petite pèse 8 fois moins.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Repère le rapport des longueurs, élève-le au carré pour passer aux aires (au cube pour un volume), et compare les disques par les carrés de leurs rayons, sans π.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Comparer les diamètres au lieu des aires ; appliquer l'échelle d'une carte directement à une aire ; oublier de diviser le diamètre par 2 ; additionner des pourcentages (+20 % sur le côté ne donne pas +40 % d'aire, mais +44 %) ; diviser par 2 un pourcentage d'aire pour retrouver celui du côté ; calculer un « de plus que » par rapport à la mauvaise base.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Longueurs × k, aires × k², volumes × k³. Pour des disques, compare les r². Échelle 1/n : 1 cm² sur la carte représente n² cm² en vrai. Pour remonter d'une aire à une longueur, prends la racine carrée du coefficient.</p></div>`,
  gen(level, R){
    const n = niv(level);
    for (let essai = 0; essai < 6; essai++){
      try {
        const ex = R.pick(TYPES[n])(R);
        if (valide(ex)) return ex;
      } catch(e){ /* nouvel essai, puis repli ci-dessous */ }
    }
    return SECOURS();
  }
});

})();
