/* ===== Maths · Objectif Albert School : alb-02 · Calcul mental et calcul astucieux sans calculatrice =====
   Fichier frère de skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS (aucun symbole global).
   gen(level, R) rend un QCM { q, a, accept: null, choix: [4], expl } ; n'utilise que R.int, R.pick, R.shuffle.
   Niveaux : 1 découverte (1 min), 2 maîtrise, 3 niveau des exemples officiels, 4 au-dessus, 5 haut du test adaptatif.
   Convention d'écriture (celle du helper nb de skills-albert.js) : espace fine U+202F entre les milliers dès 4 chiffres
   (1 200, 10 000, 203 203). Seules les « années » choisies entre 2012 et 2040 comme opérandes (2026² − 2025²)
   restent collées, comme dans les exemples officiels ; les fractions s'écrivent sans espace (1/9900). */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (privées à ce fichier) ---------- */
/* Même normalisation que normStr (core/pedagogie.js:13). */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
/* Groupes de milliers (U+202F) dès 4 chiffres, comme nb dans skills-albert.js. */
function grp(ip){ return ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
/* Nombre à la française : d décimales au plus (2 par défaut), virgule, vrai signe moins. */
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + grp(p[0]) + (p[1] ? ',' + p[1] : '');
}
const ent = x => nb(x, 0);
const dn = x => nb(x, 6);
/* Décimal exact m × 10^e (m entier) : aucune erreur d'arrondi. */
function dec(m, e){
  const neg = m < 0; let s = String(Math.abs(m)), ip, fp = '';
  if (e >= 0) ip = s + '0'.repeat(e);
  else { const k = -e; s = s.padStart(k + 1, '0'); ip = s.slice(0, s.length - k); fp = s.slice(s.length - k).replace(/0+$/, ''); }
  ip = ip.replace(/^0+(?=\d)/, '');
  return (neg ? '−' : '') + grp(ip) + (fp ? ',' + fp : '');
}
function pgcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a || 1; }
/* Fraction réduite p/q, ou entier si q divise p. */
function fr(p, q){
  if (q < 0){ p = -p; q = -q; }
  const g = pgcd(p, q); p /= g; q /= g;
  return q === 1 ? ent(p) : (p < 0 ? '−' : '') + Math.abs(p) + '/' + q;
}
/* Valeur numérique d'un choix, comme le banc (pour refuser 0,5 et 1/2 ensemble). */
function val(s){ const m = /^([+-]?\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/.exec(norm(s)); return m ? (m[2] ? +m[1] / +m[2] : +m[1]) : null; }
/* QCM : la bonne réponse, puis les distracteurs pédagogiques, puis des voisins jusqu'à 4 choix distincts
   (distincts au sens de normStr ET par la valeur). */
function qcm(bonne, autres, voisin){
  const ch = [], vs = [], ns = new Set();
  const ajouter = c => {
    if (ch.length >= 4 || c == null) return;
    c = String(c);
    if (!c.trim() || /NaN|Infinity|undefined|null/.test(c)) return;
    const n = norm(c), v = val(c);
    if (ns.has(n) || (v !== null && vs.some(w => Math.abs(w - v) < 1e-9))) return;
    ns.add(n); if (v !== null) vs.push(v); ch.push(c);
  };
  ajouter(bonne);
  (autres || []).forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 200; k++) ajouter(voisin(k));
  return ch;
}
const pm = k => (k % 2 ? 1 : -1) * Math.ceil(k / 2);              // 1, −1, 2, −2, 3…
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));
const sg = x => (x < 0 ? '− ' + ent(-x) : '+ ' + ent(x));         // « + 3 » ou « − 3 » dans un calcul
const par = x => (x < 0 ? '(' + ent(x) + ')' : ent(x));
const ex = (q, a, choix, expl) => ({ q, a, accept: null, choix, expl });
const calc = (R, E) => (R.int(0, 1) ? 'Calcule ' + E + '.' : 'Combien vaut ' + E + ' ?');

/* =====================================================
   NIVEAU 1 · découverte
   ===================================================== */

/* 1a · Paires rondes : 25 × 4 = 100, 125 × 8 = 1000, regroupements. */
function n1Paires(R){
  const v = R.int(1, 3);
  if (v === 1){
    const k = R.pick([3, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24]), N = 4 * k, res = 100 * k;
    const forme = R.int(1, 3), f = x => ent(x) + (forme === 3 ? ' €' : '');
    const q = forme === 1 ? 'Calcule 25 × ' + N + '.' : forme === 2 ? 'Calcule ' + N + ' × 25.'
      : 'Une association commande ' + N + ' t-shirts à 25 € pièce. Quel est le montant total de la commande ?';
    return ex(q, f(res), qcm(f(res), [f(10 * k), f(200 * k), f(1000 * k)], j => f(res + 25 * pm(j))),
      'On cherche un 4 caché dans ' + N + ' pour l\'associer à 25, car 25 × 4 = 100. Ici ' + N + ' = 4 × ' + k + ', donc 25 × ' + N + ' = (25 × 4) × ' + k + ' = 100 × ' + k + ' = ' + f(res) + '. Piège : diviser ' + N + ' par 2 au lieu de 4 (25 × ' + N + ' = 100 × ' + N + ' ÷ 4) donne le double, ' + f(200 * k) + ' ; oublier un zéro donne ' + f(10 * k) + '.');
  }
  if (v === 2){
    const k = R.pick([2, 3, 4, 6, 7, 9, 11, 12]), N = 8 * k, res = 1000 * k;
    const forme = R.int(1, 3);
    const q = forme === 1 ? 'Calcule 125 × ' + N + '.' : forme === 2 ? 'Calcule ' + N + ' × 125.'
      : 'Un grossiste vend des cartons de 125 stylos. Combien de stylos y a-t-il dans ' + N + ' cartons ?';
    return ex(q, ent(res), qcm(ent(res), [ent(100 * k), ent(2000 * k), ent(10000 * k)], j => ent(res + 125 * pm(j))),
      'On cherche un 8 caché dans ' + N + ' pour l\'associer à 125, car 125 × 8 = ' + ent(1000) + '. Ici ' + N + ' = 8 × ' + k + ', donc 125 × ' + N + ' = (125 × 8) × ' + k + ' = ' + ent(1000) + ' × ' + k + ' = ' + ent(res) + '. Piège : croire que 125 × 4 = 1 000 donne le double, ' + ent(2000 * k) + '.');
  }
  const P = R.pick([[4, 25], [25, 4], [2, 50], [50, 2], [5, 20], [20, 5], [8, 125], [125, 8], [2, 5], [5, 2], [4, 250], [250, 4]]);
  const a = P[0], b = P[1], M = R.pick([11, 12, 13, 14, 16, 17, 18, 19, 21, 23, 24, 26, 27, 28, 29, 31, 32, 33, 34, 36, 37, 38, 39, 41, 42, 43, 46, 47, 48, 49]);
  const res = a * b * M;
  return ex('Calcule ' + a + ' × ' + M + ' × ' + b + '.', ent(res), qcm(ent(res), [dn(res / 10), ent(res * 10), dn(res / 2)], j => ent(res + a * b * pm(j))),
    'On change l\'ordre des facteurs pour regrouper ' + a + ' et ' + b + ', qui donnent un nombre rond. ' + a + ' × ' + b + ' = ' + ent(a * b) + ', donc ' + a + ' × ' + M + ' × ' + b + ' = ' + ent(a * b) + ' × ' + M + ' = ' + ent(res) + '. Piège : un zéro oublié ou ajouté donne ' + dn(res / 10) + ' ou ' + ent(res * 10) + '.');
}

/* 1b · Pourcentage de tête à partir de 10 %. */
function n1Pourcent(R){
  const p = R.pick([5, 15, 20, 30, 35, 45, 60]);
  let V = 20 * R.int(5, 24); if (p === 5 && V === 200) V = 220;
  const res = p * V / 100, dix = V / 10, diz = Math.floor(p / 10), cinq = p % 10 === 5;
  const forme = R.int(1, 3), f = x => dn(x) + (forme === 3 ? ' €' : '');
  const q = forme === 1 ? 'Calcule ' + p + ' % de ' + V + '.'
    : forme === 2 ? 'Dans un lycée de ' + V + ' élèves, ' + p + ' % sont internes. Combien d\'élèves sont internes ?'
    : 'Un article coûte ' + V + ' €. On applique une remise de ' + p + ' %. Quel est le montant de la remise ?';
  let t = '10 % de ' + V + ' vaut ' + dn(dix) + '. ';
  if (p === 5) t += '5 % en est la moitié : ' + dn(dix) + ' ÷ 2 = ' + f(res) + '.';
  else if (cinq && diz === 1) t += '5 % en est la moitié, ' + dn(dix / 2) + ', donc 15 % = ' + dn(dix) + ' + ' + dn(dix / 2) + ' = ' + f(res) + '.';
  else if (cinq) t += (p - 5) + ' % = ' + diz + ' × ' + dn(dix) + ' = ' + dn(diz * dix) + ' et 5 % = ' + dn(dix) + ' ÷ 2 = ' + dn(dix / 2) + ', donc ' + p + ' % = ' + dn(diz * dix) + ' + ' + dn(dix / 2) + ' = ' + f(res) + '.';
  else t += 'Donc ' + p + ' % = ' + diz + ' × ' + dn(dix) + ' = ' + f(res) + '.';
  const err5 = diz * dix + dix / 10;
  const piege = cinq ? ' Piège : prendre 5 % comme 10 % ÷ 10 au lieu de 10 % ÷ 2 donne ' + f(err5) + ' ; et ' + f(V - res) + ' est ce qui reste, pas la part demandée.'
    : ' Piège : ' + f(V - res) + ' est ce qui reste, pas la part demandée.';
  return ex(q, f(res), qcm(f(res), [f(V - res), cinq ? f(err5) : f(res + dix), f(res * 10)], j => f(res + 2 * pm(j))),
    'On part de 10 %, qu\'on obtient en divisant par 10, puis on combine. ' + t + piege);
}

/* 1c · Priorités opératoires. */
function n1Prio(R){
  const F = R.int(1, 5);
  let expr, res, errs, detail, piege, meth;
  if (F === 1){
    const a = R.int(2, 20), b = R.int(2, 9), c = R.int(2, 9);
    expr = a + ' + ' + b + ' × ' + c; res = a + b * c; errs = [(a + b) * c];
    detail = b + ' × ' + c + ' = ' + (b * c) + ', puis ' + a + ' + ' + (b * c) + ' = ' + ent(res) + '.';
    piege = 'calculer de gauche à droite, (' + a + ' + ' + b + ') × ' + c + ', donne ' + ent(errs[0]) + '.';
  } else if (F === 2){
    const a = R.int(2, 20), b = R.int(2, 9), c = R.int(3, 9), d = R.int(1, c - 1);
    expr = a + ' + ' + b + ' × ' + c + ' − ' + d; res = a + b * c - d; errs = [(a + b) * c - d, a + b * (c - d)];
    detail = b + ' × ' + c + ' = ' + (b * c) + ', puis ' + a + ' + ' + (b * c) + ' − ' + d + ' = ' + ent(res) + '.';
    piege = 'calculer de gauche à droite, (' + a + ' + ' + b + ') × ' + c + ' − ' + d + ', donne ' + ent(errs[0]) + '.';
  } else if (F === 3){
    const a = R.int(2, 9), b = R.int(3, 9), c = R.int(2, b - 1), d = R.int(2, 9);
    expr = a + ' × ' + b + ' − ' + c + ' × ' + d; res = a * b - c * d; errs = [(a * b - c) * d, a * (b - c) * d];
    detail = a + ' × ' + b + ' = ' + (a * b) + ' et ' + c + ' × ' + d + ' = ' + (c * d) + ', puis ' + (a * b) + ' − ' + (c * d) + ' = ' + ent(res) + '.';
    piege = 'calculer de gauche à droite, (' + a + ' × ' + b + ' − ' + c + ') × ' + d + ', donne ' + ent(errs[0]) + '.';
  } else if (F === 4){
    const b = R.int(4, 19), c = R.int(2, 19), a = R.int(b + c + 2, 60);
    expr = a + ' − ' + b + ' + ' + c; res = a - b + c; errs = [a - b - c];
    detail = a + ' − ' + b + ' = ' + ent(a - b) + ', puis ' + ent(a - b) + ' + ' + c + ' = ' + ent(res) + '.';
    piege = 'calculer ' + b + ' + ' + c + ' d\'abord revient à retirer ' + (b + c) + ' et donne ' + ent(errs[0]) + '.';
  } else {
    const a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 9), d = R.int(1, 9);
    expr = a + ' × (' + b + ' + ' + c + ') − ' + d; res = a * (b + c) - d; errs = [a * b + c - d, a * (b + c - d)];
    detail = b + ' + ' + c + ' = ' + (b + c) + ', puis ' + a + ' × ' + (b + c) + ' = ' + (a * (b + c)) + ', puis ' + (a * (b + c)) + ' − ' + d + ' = ' + ent(res) + '.';
    piege = 'oublier la parenthèse, ' + a + ' × ' + b + ' + ' + c + ' − ' + d + ', donne ' + ent(errs[0]) + '.';
  }
  meth = F === 4 ? 'Additions et soustractions ont la même priorité : on les effectue de gauche à droite.'
    : F === 5 ? 'On calcule d\'abord la parenthèse, puis la multiplication, et la soustraction en dernier.'
    : 'La multiplication est prioritaire : on l\'effectue avant les additions et les soustractions.';
  const q = R.int(0, 1) ? 'Calcule ' + expr + '.' : 'Combien vaut ' + expr + ' ?';
  return ex(q, ent(res), qcm(ent(res), errs.map(ent), j => ent(res + pm(j))), meth + ' ' + detail + ' Piège : ' + piege);
}

/* 1d · Diviser par 0,5 ; 0,25 ; 0,2 ; 0,1. */
function n1Decimal(R){
  const D = R.pick([{ s: '0,5', m: 2 }, { s: '0,25', m: 4 }, { s: '0,2', m: 5 }, { s: '0,1', m: 10 }]);
  const N = D.m === 10 ? R.pick([3, 4, 6, 7, 8, 9, 12, 13, 15, 17, 24, 35, 48, 56, 73]) : R.int(3, 40), res = N * D.m;
  const forme = R.int(1, 2);
  let q = 'Calcule ' + N + ' ÷ ' + D.s + '.';
  if (forme === 2){
    if (D.m === 2) q = 'Avec ' + N + ' litres de jus, combien de bouteilles de 0,5 L peut-on remplir ?';
    else if (D.m === 4) q = 'Avec ' + N + ' kg de riz, combien de sachets de 0,25 kg peut-on remplir ?';
    else if (D.m === 5) q = 'Une ficelle de ' + N + ' m est coupée en morceaux de 0,2 m. Combien de morceaux obtient-on ?';
    else q = 'Une feuille de papier a une épaisseur de 0,1 mm. Combien de feuilles y a-t-il dans une pile de ' + N + ' mm ?';
  }
  return ex(q, ent(res), qcm(ent(res), [dn(N / D.m), ent(res * 10), dn(res / 10)], j => ent(res + pm(j))),
    'Diviser par ' + D.s + ' revient à multiplier par ' + D.m + ', car il y a ' + D.m + ' fois ' + D.s + ' dans 1. ' + N + ' ÷ ' + D.s + ' = ' + N + ' × ' + D.m + ' = ' + ent(res) + '. Piège : confondre avec « multiplier par ' + D.s + ' », qui donne ' + dn(N / D.m) + ' ; on doit trouver plus que ' + N + ', car on compte des parts plus petites que 1.');
}

/* 1e · Compenser : + 298 = + 300 − 2. */
function n1Compense(R){
  const B = R.pick([[100, 1], [100, 2], [200, 1], [200, 2], [300, 1], [300, 2], [300, 3], [400, 1], [400, 2], [500, 1], [500, 2], [500, 3], [600, 1], [700, 2], [800, 1], [1000, 1], [1000, 2]]);
  const Rr = B[0], s = B[1], b = Rr - s, plus = R.int(0, 1) === 1, forme = R.int(1, 2);
  if (plus){
    let a = R.int(121, 899); if (a % 10 === 0) a += 3; if (a + b === Rr) a += 7;
    const res = a + b;
    const q = forme === 1 ? 'Calcule ' + a + ' + ' + b + '.' : 'Tu as ' + a + ' € sur ton compte et tu reçois ' + b + ' €. Combien as-tu maintenant ?';
    const f = x => ent(x) + (forme === 2 ? ' €' : '');
    return ex(q, f(res), qcm(f(res), [f(res + 2 * s), f(res + s), f(res + 10)], j => f(res + 10 * pm(j))),
      'On remplace ' + b + ' par le nombre rond ' + ent(Rr) + ', puis on corrige l\'écart de ' + s + '. ' + a + ' + ' + ent(Rr) + ' = ' + ent(a + Rr) + ' ; on a ajouté ' + s + ' de trop, donc on retire ' + s + ' : ' + ent(a + Rr) + ' − ' + s + ' = ' + f(res) + '. Piège : corriger dans le mauvais sens donne ' + f(res + 2 * s) + ', oublier de corriger donne ' + f(res + s) + '.');
  }
  let a = R.int(b + 101, b + 600); if (a % 10 === 0) a += 3;
  if (a - b === b || a - b === Rr) a += 3;                      // la réponse ne doit pas apparaître dans l'indice
  const res = a - b;
  const q = forme === 1 ? 'Calcule ' + ent(a) + ' − ' + b + '.' : 'Un entrepôt contient ' + ent(a) + ' cartons. On en expédie ' + b + '. Combien en reste-t-il ?';
  return ex(q, ent(res), qcm(ent(res), [ent(res - 2 * s), ent(res - s), ent(res - 10)], j => ent(res + 10 * pm(j))),
    'On remplace ' + b + ' par le nombre rond ' + ent(Rr) + ', puis on corrige l\'écart de ' + s + '. ' + ent(a) + ' − ' + ent(Rr) + ' = ' + ent(a - Rr) + ' ; on a retiré ' + s + ' de trop, donc on rajoute ' + s + ' : ' + ent(a - Rr) + ' + ' + s + ' = ' + ent(res) + '. Piège : corriger dans le mauvais sens donne ' + ent(res - 2 * s) + ', oublier de corriger donne ' + ent(res - s) + '.');
}

/* =====================================================
   NIVEAU 2 · maîtrise
   ===================================================== */

/* 2a · Différence de carrés : 47 × 53 = 50² − 3². */
function n2DiffCarres(R){
  const m = R.pick([20, 30, 40, 50, 60, 70, 80, 90]), d = R.int(1, 9), x = m - d, y = m + d, res = m * m - d * d;
  const [u, w] = R.int(0, 1) ? [x, y] : [y, x], forme = R.int(1, 3);
  const q = forme === 1 ? 'Calcule ' + u + ' × ' + w + '.'
    : forme === 2 ? 'Une salle de spectacle compte ' + u + ' rangées de ' + w + ' fauteuils. Combien y a-t-il de fauteuils en tout ?'
    : 'Un terrain rectangulaire mesure ' + u + ' m sur ' + w + ' m. Quelle est son aire, en m² ?';
  const piege = d > 1 ? 'Piège : oublier d\'élever ' + d + ' au carré donne ' + ent(m * m - d) + ' ; se tromper de signe donne ' + ent(m * m + d * d) + '.'
    : 'Piège : se tromper de signe donne ' + ent(m * m + 1) + '.';
  return ex(q, ent(res), qcm(ent(res), [ent(m * m - d), ent(m * m + d * d)], j => ent(res + 10 * pm(j))),
    'On écrit les deux facteurs autour de leur milieu ' + m + ', puis on utilise (a − b)(a + b) = a² − b². ' + x + ' = ' + m + ' − ' + d + ' et ' + y + ' = ' + m + ' + ' + d + ', donc ' + u + ' × ' + w + ' = ' + m + '² − ' + d + '² = ' + ent(m * m) + ' − ' + (d * d) + ' = ' + ent(res) + '. ' + piege);
}

/* 2b · Carré d'un nombre proche d'un rond : 99², 51², 997². */
function n2Carre(R){
  const m = R.pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 1000]), d = R.int(1, 3), s = R.pick([1, -1]);
  const n = m + s * d, res = n * n, M = m * m, P = 2 * m * d, D = d * d, forme = R.int(1, 3);
  const nS = ent(n), mS = ent(m);
  const q = forme === 1 ? 'Calcule ' + nS + '².' : forme === 2 ? 'Calcule ' + nS + ' × ' + nS + '.' : 'Un carré a pour côté ' + nS + ' cm. Quelle est son aire, en cm² ?';
  const op = s > 0 ? '+' : '−';
  return ex(q, ent(res), qcm(ent(res), [ent(M + s * D), ent(M + s * P - D), ent(M + s * m * d + D)], j => ent(res + 100 * pm(j))),
    'On écrit le nombre comme un nombre rond plus ou moins un petit écart, puis on développe avec l\'identité remarquable. ' + nS + ' = ' + mS + ' ' + op + ' ' + d + ', donc ' + nS + '² = ' + mS + '² ' + op + ' 2 × ' + mS + ' × ' + d + ' + ' + d + '² = ' + ent(M) + ' ' + op + ' ' + ent(P) + ' + ' + D + ' = ' + ent(res) + '. Piège : oublier le double produit 2 × ' + mS + ' × ' + d + ' donne ' + ent(M + s * D) + ' ; le dernier terme ' + d + '² est toujours ajouté.');
}

/* 2c · Compenser une multiplication : × 99 = × 100 − × 1. */
function n2Compense(R){
  const K = R.pick([{ k: 9, r: 10, s: -1 }, { k: 11, r: 10, s: 1 }, { k: 99, r: 100, s: -1 }, { k: 101, r: 100, s: 1 }, { k: 999, r: 1000, s: -1 }]);
  let N = K.k === 999 ? R.int(12, 49) : R.int(12, 98); if (N % 10 === 0) N += 3;
  const res = N * K.k, base = N * K.r, forme = R.int(1, 3), f = x => ent(x) + (forme === 3 ? ' €' : '');
  const q = forme === 1 ? 'Calcule ' + N + ' × ' + K.k + '.' : forme === 2 ? 'Calcule ' + K.k + ' × ' + N + '.'
    : 'Un abonnement coûte ' + K.k + ' € par an. Combien paient ' + N + ' abonnés au total ?';
  const op = K.s > 0 ? '+' : '−';
  return ex(q, f(res), qcm(f(res), [f(base + K.s), f(base - K.s * N), f(base + K.s * K.r)], j => f(res + 10 * pm(j))),
    'On remplace ' + K.k + ' par ' + ent(K.r) + ' ' + op + ' 1 et on distribue la multiplication. ' + N + ' × ' + K.k + ' = ' + N + ' × ' + ent(K.r) + ' ' + op + ' ' + N + ' × 1 = ' + ent(base) + ' ' + op + ' ' + N + ' = ' + f(res) + '. Piège : corriger de 1 au lieu de ' + N + ' donne ' + f(base + K.s) + ' ; corriger dans le mauvais sens donne ' + f(base - K.s * N) + '.');
}

/* 2d · Mettre en facteur : 17 × 23 + 17 × 77 = 17 × 100. */
function n2Facteur(R){
  const decimal = R.int(1, 4) === 1;
  let a10 = R.int(13, 99); if (a10 % 10 === 0) a10 += 3;
  const aS = decimal ? dec(a10, -1) : String(a10);
  const somme = R.int(0, 1) === 1;
  let T, b, c;
  if (somme){ T = R.pick([100, 100, 1000, 10]); b = T === 10 ? R.int(2, 8) : T === 100 ? R.int(11, 89) : 10 * R.int(11, 89) + R.int(1, 9); c = T - b; }
  else { T = R.pick([10, 100]); c = R.int(11, 89); b = c + T; }
  const resM = a10 * T, res = decimal ? resM / 10 : resM, f = decimal ? dn : ent;
  const t1 = R.int(0, 1) ? aS + ' × ' + b : b + ' × ' + aS, t2 = R.int(0, 1) ? aS + ' × ' + c : c + ' × ' + aS;
  const q = 'Calcule ' + t1 + (somme ? ' + ' : ' − ') + t2 + '.';
  return ex(q, f(res), qcm(f(res), [f(res * 10), dn(res / 10), f(res * 2)], j => f(res + (decimal ? 1 : 10) * pm(j))),
    'Le même facteur ' + aS + ' apparaît dans les deux produits : on le met en facteur. ' + t1 + (somme ? ' + ' : ' − ') + t2 + ' = ' + aS + ' × (' + b + (somme ? ' + ' : ' − ') + c + ') = ' + aS + ' × ' + ent(T) + ' = ' + f(res) + '. Piège : écrire (' + aS + ' + ' + aS + ') × (' + b + (somme ? ' + ' : ' − ') + c + ') compte le facteur deux fois et donne ' + f(res * 2) + '.');
}

/* 2e · Décimaux : produits et divisions sans perdre la virgule. */
function n2Decimaux(R){
  const v = R.int(1, 3);
  if (v === 1){
    const i = R.int(2, 9), j = R.int(2, 9), p = i * j, res = dec(p, -2);
    return ex('Calcule 0,' + i + ' × 0,' + j + '.', res, qcm(res, [dec(p, -1), dec(p, -3), String(p)], k => dec(p + pm(k), -2)),
      'On multiplie les nombres sans la virgule, puis on place autant de chiffres après la virgule qu\'il y en a en tout dans les deux facteurs. ' + i + ' × ' + j + ' = ' + p + ', et il faut deux chiffres après la virgule (un dans chaque facteur) : 0,' + i + ' × 0,' + j + ' = ' + res + '. Piège : ' + dec(p, -1) + ' ne compte qu\'un chiffre après la virgule ; multiplier par un nombre plus petit que 1 doit rendre le résultat plus petit.');
  }
  if (v === 2){
    const C = R.pick([['0,25', 1, 4], ['0,75', 3, 4], ['1,5', 3, 2], ['2,5', 5, 2], ['0,2', 1, 5], ['1,25', 5, 4], ['0,4', 2, 5], ['0,6', 3, 5], ['1,2', 6, 5]]);
    const den = C[2], num = C[1], N = den * R.int(Math.ceil(12 / den), Math.floor(96 / den)), res = num * N / den;
    const q = R.int(0, 1) ? 'Calcule ' + C[0] + ' × ' + N + '.' : 'Calcule ' + N + ' × ' + C[0] + '.';
    const inv = (N * den) % num === 0 ? ent(N * den / num) : null;
    return ex(q, ent(res), qcm(ent(res), [ent(res * 10), dn(res / 10), inv], k => ent(res + pm(k))),
      'On remplace le décimal par la fraction simple qui lui correspond, puis on divise avant de multiplier. ' + C[0] + ' = ' + num + '/' + den + ', donc ' + N + ' × ' + C[0] + ' = ' + N + ' ÷ ' + den + (num > 1 ? ' × ' + num : '') + ' = ' + ent(N / den) + (num > 1 ? ' × ' + num : '') + ' = ' + ent(res) + '. Piège : une virgule mal placée donne ' + ent(res * 10) + ' ou ' + dn(res / 10) + (inv && inv !== ent(res) ? ' ; diviser par ' + C[0] + ' au lieu de multiplier donne ' + inv : '') + '.');
  }
  const k = R.int(2, 9), j = R.int(2, 9), aS = dec(k * j, -1);
  return ex('Calcule ' + aS + ' ÷ 0,' + j + '.', String(k), qcm(String(k), [dec(k, -1), String(10 * k), dec(k * j * j, -2)], i => String(k + pm(i))),
    'On multiplie les deux nombres par 10 pour que le diviseur devienne entier. ' + aS + ' ÷ 0,' + j + ' = ' + (k * j) + ' ÷ ' + j + ' = ' + k + '. Piège : ' + dec(k, -1) + ' vient d\'une virgule oubliée, et ' + dec(k * j * j, -2) + ' d\'une multiplication à la place de la division ; diviser par un nombre plus petit que 1 donne un résultat plus grand que ' + aS + '.');
}

/* 2f · Simplifier en croix avant de multiplier deux fractions (produit, quotient, fraction d'une fraction). */
const frb = (p, q) => (q === 1 ? String(p) : p + '/' + q);            // fraction telle qu'écrite, sans réduction
const CTX_FR = [
  (f1, f2) => 'Une entreprise consacre les ' + f1 + ' de son budget au marketing, et les ' + f2 + ' de ce budget marketing vont à la publicité en ligne. Quelle fraction du budget total va à la publicité en ligne ?',
  (f1, f2) => 'Dans un club de sport, les ' + f1 + ' des membres sont majeurs, et les ' + f2 + ' des membres majeurs ont le permis de conduire. Quelle fraction des membres du club est majeure et a le permis ?'
];
function n2Fractions(R){
  const G = [3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15];
  let t = null;
  for (let essai = 0; essai < 200 && !t; essai++){
    const g1 = R.pick(G), g2 = R.pick(G), p1 = R.int(1, 5), q1 = R.int(1, 5), p2 = R.int(1, 5), q2 = R.int(1, 5);
    const a = p1 * g1, b = q1 * g2, c = p2 * g2, d = q2 * g1;
    if (pgcd(g1, g2) !== 1 || pgcd(a, b) !== 1 || pgcd(c, d) !== 1 || pgcd(p1, q2) !== 1 || pgcd(p2, q1) !== 1) continue;
    if (Math.max(a, b, c, d) > 99 || p1 * p2 === q1 * q2) continue;
    t = { g1, g2, p1, q1, p2, q2, a, b, c, d };
  }
  if (!t) t = { g1: 7, g2: 5, p1: 2, q1: 3, p2: 5, q2: 3, a: 14, b: 15, c: 25, d: 21 };
  const { g1, g2, p1, q1, p2, q2, a, b, c, d } = t, P = p1 * p2, Qd = q1 * q2, res = fr(P, Qd);
  const f1 = a + '/' + b, f2 = c + '/' + d, somme = fr(a + c, b + d), croix = fr(a * d, b * c), inv = fr(Qd, P);
  let F = R.int(1, 3); if (F === 3 && (a > b || c > d)) F = 1;
  const simpl = a + ' et ' + d + ' se simplifient par ' + g1 + ' (il reste ' + p1 + ' et ' + q2 + '), ' + c + ' et ' + b + ' par ' + g2 + ' (il reste ' + p2 + ' et ' + q1 + '). Il reste ' + frb(p1, q1) + ' × ' + frb(p2, q2) + ' = ' + res + '.';
  const voisin = j => fr(P + j, Qd);
  if (F === 2){
    const q = 'Calcule ' + f1 + ' ÷ ' + d + '/' + c + '.';
    return ex(q, res, qcm(res, [croix, inv, somme], voisin),
      'Diviser par une fraction revient à multiplier par son inverse, puis on simplifie en croix avant de multiplier. ' + f1 + ' ÷ ' + d + '/' + c + ' = ' + f1 + ' × ' + f2 + ' ; ' + simpl + ' Piège : oublier d\'inverser la seconde fraction donne ' + croix + ' ; inverser la première au lieu de la seconde donne ' + inv + '.');
  }
  if (F === 3){
    const q = R.pick(CTX_FR)(f1, f2);
    return ex(q, res, qcm(res, [fr(c, d), fr(a, b), somme], voisin),
      'Prendre une fraction d\'une fraction revient à multiplier les deux fractions, en simplifiant en croix avant de multiplier. On calcule ' + f1 + ' × ' + f2 + ' : ' + simpl + ' Piège : ' + fr(c, d) + ' est la part dans le sous-groupe, pas dans le total ; ' + fr(a, b) + ' oublie la seconde condition ; additionner numérateurs et dénominateurs donne ' + somme + ', ce qui n\'a pas de sens.');
  }
  const E = R.int(0, 1) ? f1 + ' × ' + f2 : f2 + ' × ' + f1;
  return ex('Calcule ' + E + '.', res, qcm(res, [somme, croix, inv], voisin),
    'On simplifie en croix avant de multiplier : chaque numérateur avec le dénominateur de l\'autre fraction. ' + simpl + ' Piège : additionner numérateurs et dénominateurs donne ' + somme + ' ; multiplier en croix, ce qui revient à diviser, donne ' + croix + '.');
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels
   ===================================================== */

/* 3a · a² − b² avec de grands nombres. */
function n3DiffGrands(R){
  const a = R.int(2015, 2040), d = R.int(1, 4), b = a - d, res = d * (a + b), forme = R.int(1, 3);
  const q = forme === 1 ? 'Calcule ' + a + '² − ' + b + '².' : forme === 2 ? 'Calcule ' + a + ' × ' + a + ' − ' + b + ' × ' + b + '.' : 'Combien vaut ' + a + '² − ' + b + '² ?';
  const autres = d === 1 ? [ent(1), ent(2 * a), ent(2 * b)] : [ent(d * d), ent(a + b), ent(2 * a * d)];
  return ex(q, ent(res), qcm(ent(res), autres, j => ent(res + pm(j))),
    'On factorise avec a² − b² = (a − b)(a + b) au lieu de calculer les deux carrés. ' + a + '² − ' + b + '² = (' + a + ' − ' + b + ') × (' + a + ' + ' + b + ') = ' + d + ' × ' + ent(a + b) + ' = ' + ent(res) + '. Piège : confondre avec (' + a + ' − ' + b + ')², qui vaut seulement ' + (d * d) + (d === 1 ? ' ; et ' + ent(2 * b) + ' ou ' + ent(2 * a) + ' sont décalés d\'une unité.' : ' ; oublier le facteur ' + d + ' donne ' + ent(a + b) + '.'));
}

/* 3b · (n − d)(n + d) − n². */
function n3Voisins(R){
  const n = R.int(2012, 2040), d = R.int(1, 4), D = d * d, neg = R.int(0, 1) === 1, res = neg ? -D : D;
  const prod = (n - d) + ' × ' + (n + d);
  const q = neg ? 'Calcule ' + prod + ' − ' + n + '².' : 'Calcule ' + n + '² − ' + prod + '.';
  const autres = neg ? [ent(D), '0', ent(-2 * d)] : [ent(-D), '0', ent(2 * d)];
  return ex(q, ent(res), qcm(ent(res), autres, j => ent(res + pm(j))),
    'On reconnaît deux facteurs placés symétriquement autour du nombre élevé au carré, et on utilise (a − b)(a + b) = a² − b². ' + prod + ' = (' + n + ' − ' + d + ')(' + n + ' + ' + d + ') = ' + n + '² − ' + D + ', donc ' + (neg ? '(' + n + '² − ' + D + ') − ' + n + '² = ' + ent(res) : n + '² − (' + n + '² − ' + D + ') = ' + ent(res)) + '. Piège : croire que tout s\'annule donne 0 ; attention aussi au signe' + (d !== 2 ? ', et à ne pas confondre ' + d + '² avec 2 × ' + d : '') + '.');
}

/* 3c · Produit de décimaux à regrouper : 0,125 × 64 × 2,5. */
const PARTENAIRES = [
  { s: '0,125', p: 8, u: 1 }, { s: '0,25', p: 4, u: 1 }, { s: '2,5', p: 4, u: 10 }, { s: '1,25', p: 8, u: 10 },
  { s: '12,5', p: 8, u: 100 }, { s: '0,5', p: 2, u: 1 }, { s: '0,2', p: 5, u: 1 }, { s: '0,04', p: 25, u: 1 }, { s: '0,75', p: 4, u: 3 }
];
function n3ProduitDec(R){
  const L = R.shuffle(PARTENAIRES), c1 = L[0], c2 = L[1];
  let j = R.pick([1, 2, 3, 5]); if (c1.p * c2.p * j > 400) j = 1;
  const N = c1.p * c2.p * j, res = c1.u * c2.u * j;
  const q = R.int(0, 1) ? 'Calcule ' + c1.s + ' × ' + N + ' × ' + c2.s + '.' : 'Calcule ' + N + ' × ' + c1.s + ' × ' + c2.s + '.';
  const has125 = c1.s === '0,125' || c2.s === '0,125';
  const piege = j > 1 ? ' ; oublier le facteur ' + j + ' qui reste donne ' + ent(res / j) : has125 ? ' ; prendre 0,125 pour 1/4 donne le double, ' + ent(2 * res) : '';
  return ex(q, ent(res), qcm(ent(res), [ent(res * 10), dn(res / 10), j > 1 ? ent(res / j) : ent(res * 2)], k => ent(res + pm(k))),
    'On regroupe chaque décimal avec un facteur caché dans l\'entier pour former des nombres ronds. ' + N + ' = ' + c1.p + ' × ' + c2.p + (j > 1 ? ' × ' + j : '') + ', puis ' + c1.s + ' × ' + c1.p + ' = ' + c1.u + ' et ' + c2.s + ' × ' + c2.p + ' = ' + c2.u + ', donc le produit vaut ' + c1.u + ' × ' + c2.u + (j > 1 ? ' × ' + j : '') + ' = ' + ent(res) + '. Piège : une erreur de virgule donne ' + ent(res * 10) + ' ou ' + dn(res / 10) + piege + '.');
}

/* 3d · Diviser par un petit décimal : 1 ÷ 0,04 ; 1,8 ÷ 0,06. */
const DIVISEURS = [
  { s: '0,04', m: 4, e: -2 }, { s: '0,05', m: 5, e: -2 }, { s: '0,02', m: 2, e: -2 }, { s: '0,25', m: 25, e: -2 },
  { s: '0,125', m: 125, e: -3 }, { s: '0,06', m: 6, e: -2 }, { s: '0,08', m: 8, e: -2 }, { s: '0,15', m: 15, e: -2 },
  { s: '0,12', m: 12, e: -2 }, { s: '0,002', m: 2, e: -3 }, { s: '0,005', m: 5, e: -3 }, { s: '0,008', m: 8, e: -3 }, { s: '0,03', m: 3, e: -2 }
];
function n3DivDec(R){
  const D = R.pick(DIVISEURS), K = R.shuffle([4, 5, 8, 15, 20, 25, 30, 40, 50, 60, 75, 80, 120, 125, 150, 200, 250, 300, 400, 500]);
  let k = 25, mant = 25 * D.m;
  for (let i = 0; i < K.length; i++){
    const mm = K[i] * D.m, sig = String(mm).replace(/0+$/, '').length, v = mm * Math.pow(10, D.e);
    if (sig <= 2 && v >= 0.01 && v <= 100 && K[i] * D.m !== D.m){ k = K[i]; mant = mm; break; }
  }
  const Ds = dec(mant, D.e), mult = D.e === -2 ? '100' : ent(1000);
  const q = R.int(0, 2) ? 'Calcule ' + Ds + ' ÷ ' + D.s + '.' : 'Un ruban de ' + Ds + ' m est coupé en morceaux de ' + D.s + ' m. Combien de morceaux obtient-on ?';
  return ex(q, ent(k), qcm(ent(k), [dn(k / 10), ent(10 * k), ent(100 * k)], i => ent(k + pm(i))),
    'On multiplie le dividende et le diviseur par une même puissance de dix pour rendre le diviseur entier. En multipliant les deux nombres par ' + mult + ', ' + Ds + ' ÷ ' + D.s + ' = ' + ent(mant) + ' ÷ ' + D.m + ' = ' + ent(k) + '. Piège : décaler la virgule d\'un rang de trop ou de moins donne ' + ent(10 * k) + ' ou ' + dn(k / 10) + '.');
}

/* 3e · Mettre en facteur avec de grands nombres. */
function n3FacteurGrand(R){
  const F = R.int(1, 3), Y = R.int(2015, 2040);
  if (F === 1){
    const somme = R.int(0, 1) === 1;
    let T, b, c;
    if (somme){ T = R.pick([100, 1000]); b = T === 100 ? R.int(11, 89) : R.int(101, 899); c = T - b; }
    else { T = R.pick([10, 100]); c = R.int(11, 89); b = c + T; }
    const res = Y * T, op = somme ? ' + ' : ' − ';
    const t1 = R.int(0, 1) ? Y + ' × ' + b : b + ' × ' + Y, t2 = R.int(0, 1) ? Y + ' × ' + c : c + ' × ' + Y;
    return ex('Calcule ' + t1 + op + t2 + '.', ent(res), qcm(ent(res), [ent(res * 10), dn(res / 10), ent(res * 2)], j => ent(res + Y * pm(j))),
      'On repère le facteur commun aux deux termes et on le met en facteur. ' + t1 + op + t2 + ' = ' + Y + ' × (' + b + op + c + ') = ' + Y + ' × ' + ent(T) + ' = ' + ent(res) + '. Piège : un zéro de trop ou de moins donne ' + ent(res * 10) + ' ou ' + dn(res / 10) + '.');
  }
  if (F === 2){
    const K = R.pick([[9, 1], [99, 1], [999, 1], [11, -1], [101, -1], [1001, -1]]), k = K[0], s = K[1], res = Y * (k + s);
    const kS = ent(k);
    const q = 'Calcule ' + Y + ' × ' + kS + (s > 0 ? ' + ' : ' − ') + Y + '.';
    return ex(q, ent(res), qcm(ent(res), [ent(res * 10), dn(res / 10), ent(Y * k)], j => ent(res + Y * pm(j))),
      'On repère le facteur commun aux deux termes et on le met en facteur, sans oublier que ' + Y + ' = ' + Y + ' × 1. ' + Y + ' × ' + kS + (s > 0 ? ' + ' : ' − ') + Y + ' × 1 = ' + Y + ' × (' + kS + (s > 0 ? ' + ' : ' − ') + '1) = ' + Y + ' × ' + ent(k + s) + ' = ' + ent(res) + '. Piège : oublier le terme ' + Y + ' isolé donne ' + ent(Y * k) + ' ; un zéro de trop ou de moins donne ' + ent(res * 10) + ' ou ' + dn(res / 10) + '.');
  }
  const d = R.int(1, 3), b = Y, a = b + d, inverse = R.int(0, 1) === 1;
  const res = inverse ? a * d : b * d;
  const q = inverse ? 'Calcule ' + a + '² − ' + a + ' × ' + b + '.' : 'Calcule ' + a + ' × ' + b + ' − ' + b + '².';
  const autre = inverse ? b * d : a * d;
  return ex(q, ent(res), qcm(ent(res), [ent(d), ent(autre), '0'], j => ent(res + pm(j))),
    'On repère le facteur commun aux deux termes et on le met en facteur. ' + (inverse
      ? a + '² − ' + a + ' × ' + b + ' = ' + a + ' × (' + a + ' − ' + b + ') = ' + a + ' × ' + d
      : a + ' × ' + b + ' − ' + b + '² = ' + b + ' × (' + a + ' − ' + b + ') = ' + b + ' × ' + d) + ' = ' + ent(res) + '. Piège : garder seulement ' + a + ' − ' + b + ' = ' + d + ' oublie le facteur commun ; mettre l\'autre nombre en facteur donne ' + ent(autre) + '.');
}

/* 3f · Puissances : 2ⁿ × 5ᵐ, aᵏ × bᵏ = (a × b)ᵏ, 2ⁿ⁺¹ − 2ⁿ, 4 × 2ⁿ (connaître 2¹⁰ = 1 024). */
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(ch => SUP[+ch]).join('');
const pw = (b, e) => b + (e === 1 ? '' : sup(e));                   // 2⁵, ou 2 pour l'exposant 1
function n3Puissances(R){
  const F = R.int(1, 4);
  if (F === 1){
    const n = R.int(3, 7); let e = R.pick([-3, -2, -1, 1, 2, 3]); if (n + e < 2) e = -e;
    const m = n + e, k = Math.min(m, n), e2 = Math.abs(e), base = m > n ? 2 : 5, reste = Math.pow(base, e2);
    const res = reste * Math.pow(10, k), haut = Math.pow(10, Math.max(m, n)), dix = Math.pow(10, k);
    const t2 = pw(2, m), t5 = pw(5, n), E = R.int(0, 1) ? t2 + ' × ' + t5 : t5 + ' × ' + t2;
    return ex(calc(R, E), ent(res), qcm(ent(res), [ent(dix), ent(haut), ent(res * 10)], j => ent(res + dix * pm(j))),
      'On associe chaque facteur 2 à un facteur 5, car 2 × 5 = 10, puis on garde les facteurs en trop. ' + E + ' = (2 × 5)' + sup(k) + ' × ' + pw(base, e2) + ' = 10' + sup(k) + ' × ' + ent(reste) + ' = ' + ent(res) + '. Piège : oublier ' + (e2 > 1 ? 'les facteurs ' + base + ' en trop' : 'le facteur ' + base + ' en trop') + ' donne ' + ent(dix) + ' ; prendre le plus grand exposant pour 10 donne ' + ent(haut) + '.');
  }
  if (F === 2){
    const C = R.pick([[4, 25, 100], [25, 4, 100], [2, 50, 100], [50, 2, 100], [20, 5, 100], [5, 20, 100],
      [8, 125, 1000], [125, 8, 1000], [40, 25, 1000], [25, 40, 1000], [4, 250, 1000], [250, 4, 1000]]);
    const a = C[0], b = C[1], P = C[2], z = P === 100 ? 2 : 3, k = z === 2 ? R.int(2, 4) : R.int(2, 3), res = Math.pow(P, k);
    const E = a + sup(k) + ' × ' + b + sup(k);
    return ex(calc(R, E), ent(res), qcm(ent(res), [ent(P * k), ent(Math.pow(10, z + k)), ent(res * 10)], j => ent(res * Math.pow(10, j + 1))),
      'Deux puissances de même exposant se multiplient en multipliant les bases, puis on compte les zéros. ' + E + ' = (' + a + ' × ' + b + ')' + sup(k) + ' = ' + ent(P) + sup(k) + ' = ' + ent(res) + ', soit un 1 suivi de ' + (z * k) + ' zéros. Piège : multiplier ' + ent(P) + ' par l\'exposant ' + k + ' donne ' + ent(P * k) + ' ; ajouter ' + k + ' zéros au lieu de ' + (z * k) + ' donne ' + ent(Math.pow(10, z + k)) + '.');
  }
  if (F === 3){
    const n = R.int(5, 9), res = Math.pow(2, n), E = pw(2, n + 1) + ' − ' + pw(2, n);
    return ex(calc(R, E), ent(res), qcm(ent(res), ['2', ent(res / 2), ent(res * 2)], j => ent(res + 2 * pm(j))),
      'On écrit la plus grande puissance comme le double de la plus petite, puis on met en facteur. ' + pw(2, n + 1) + ' = 2 × ' + pw(2, n) + ', donc ' + E + ' = 2 × ' + pw(2, n) + ' − ' + pw(2, n) + ' = ' + pw(2, n) + ' = ' + ent(res) + '. Piège : soustraire les exposants donne 2¹ = 2, mais une différence de puissances ne se calcule pas sur les exposants.');
  }
  const n = R.int(5, 8), t = pw(2, n), res = Math.pow(2, n + 2), E = t + ' + ' + t + ' + ' + t + ' + ' + t;
  return ex(calc(R, E), ent(res), qcm(ent(res), [ent(Math.pow(2, n + 4)), ent(Math.pow(8, n)), ent(Math.pow(2, n + 1))], j => ent(res + 2 * pm(j))),
    'Quatre termes égaux font quatre fois ce terme, et 4 = 2², donc on ajoute 2 à l\'exposant. ' + E + ' = 4 × ' + t + ' = 2² × ' + t + ' = ' + pw(2, n + 2) + ' = ' + ent(res) + '. Piège : additionner les bases donne 8' + sup(n) + ' = ' + ent(Math.pow(8, n)) + ' ; ajouter 4 à l\'exposant donne ' + pw(2, n + 4) + ' = ' + ent(Math.pow(2, n + 4)) + ' ; ' + ent(Math.pow(2, n + 1)) + ' ne compte que deux termes.');
}

/* =====================================================
   NIVEAU 4 · plus dur que les exemples officiels
   ===================================================== */

/* 4a · Reconnaître (a ± b)² développé. */
function n4Identite(R){
  const s = R.pick([100, 200, 300, 1000, 2000, 3000]), b = R.pick([3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 23, 24, 26, 27, 28, 29, 31, 33, 36, 37, 39, 41, 43, 47, 49]);
  const plus = R.int(0, 1) === 1, a = plus ? s - b : s + b, res = s * s, aS = ent(a);
  const q = 'Calcule ' + aS + '² ' + (plus ? '+' : '−') + ' 2 × ' + aS + ' × ' + b + ' + ' + b + '².';
  return ex(q, ent(res), qcm(ent(res), [ent(2 * s), ent(res / 10), ent(res * 10)], j => ent(res + s * pm(j))),
    'On reconnaît une identité remarquable développée, qu\'on factorise. ' + (plus ? 'a² + 2ab + b² = (a + b)²' : 'a² − 2ab + b² = (a − b)²') + ' avec a = ' + aS + ' et b = ' + b + ', donc le calcul vaut (' + aS + (plus ? ' + ' : ' − ') + b + ')² = ' + ent(s) + '² = ' + ent(res) + '. Piège : doubler au lieu d\'élever au carré donne ' + ent(2 * s) + ' ; compte bien les zéros.');
}

/* 4b · Quotient : (n² − d²) ÷ (n − d). */
function n4Quotient(R){
  const n = R.int(2015, 2040), d = R.int(1, 4), D = d * d, moins = R.int(0, 1) === 1;
  const div = moins ? n - d : n + d, res = moins ? n + d : n - d;
  const q = calc(R, '(' + n + '² − ' + D + ') ÷ ' + div);
  /* Les réponses sont des « années » voisines de n : écrites collées comme n dans l'énoncé. */
  const S = String, autres = moins ? [S(n), S(n - d), S(n + d + 1)] : [S(n), S(n + d), S(n - d - 1)];
  return ex(q, S(res), qcm(S(res), autres, j => S(res + pm(j))),
    'On factorise le numérateur avec a² − b² = (a − b)(a + b), puis on simplifie par le diviseur. ' + D + ' = ' + d + '², donc ' + n + '² − ' + D + ' = (' + n + ' − ' + d + ')(' + n + ' + ' + d + ') = ' + (n - d) + ' × ' + (n + d) + '. En divisant par ' + div + ', il reste ' + S(res) + '. Piège : ' + S(n) + ' oublie l\'écart, et ' + S(moins ? n - d : n + d) + ' garde le mauvais facteur.');
}

/* 4c · Produits symétriques : (n − a)(n + a) − (n − b)(n + b), ou très grand n. */
function n4Symetrie(R){
  if (R.int(0, 1)){
    const n = R.int(2015, 2040), a = R.int(1, 3), b = R.int(a + 1, a + 3), sens = R.int(0, 1) === 1;
    const P1 = (n - a) + ' × ' + (n + a), P2 = (n - b) + ' × ' + (n + b);
    const res = sens ? b * b - a * a : a * a - b * b;
    const q = 'Calcule ' + (sens ? P1 + ' − ' + P2 : P2 + ' − ' + P1) + '.';
    const autres = [ent(sens ? b - a : a - b), ent(-res), ent(sens ? (b - a) * (b - a) : -(b - a) * (b - a)), '0'];
    return ex(q, ent(res), qcm(ent(res), autres, j => ent(res + pm(j))),
      'On écrit chaque produit sous la forme (n − k)(n + k) = n² − k², puis les deux n² s\'éliminent. ' + P1 + ' = ' + n + '² − ' + (a * a) + ' et ' + P2 + ' = ' + n + '² − ' + (b * b) + ', donc la différence vaut ' + (sens ? '−' + (a * a) + ' + ' + (b * b) : '−' + (b * b) + ' + ' + (a * a)) + ' = ' + ent(res) + '. Piège : oublier les carrés donne ' + ent(sens ? b - a : a - b) + ' ; attention au signe.');
  }
  const N = R.pick([12345, 54321, 98765, 10001, 31416, 27182, 77777, 24680, 13579, 86420, 99999, 50505, 65536, 46368, 75025, 11111, 20202, 43210, 56789, 90909]), d = R.int(1, 5), D = d * d, neg = R.int(0, 1) === 1, res = neg ? -D : D;
  const prod = ent(N - d) + ' × ' + ent(N + d);
  const q = neg ? 'Calcule ' + prod + ' − ' + ent(N) + '².' : 'Calcule ' + ent(N) + '² − ' + prod + '.';
  return ex(q, ent(res), qcm(ent(res), [ent(-res), '0', ent(neg ? -2 * d : 2 * d)], j => ent(res + pm(j))),
    'On écrit chaque produit sous la forme (n − k)(n + k) = n² − k², puis les deux n² s\'éliminent. ' + prod + ' = (' + ent(N) + ' − ' + d + ')(' + ent(N) + ' + ' + d + ') = ' + ent(N) + '² − ' + D + ', donc le calcul vaut ' + ent(res) + ' sans aucune grande multiplication. Piège : croire que tout s\'annule donne 0 ; attention au signe.');
}

/* 4d · Produit télescopique : (1 − 1/2)(1 − 1/3)…(1 − 1/n). */
function n4Telescope(R){
  if (R.int(0, 1)){
    const n = R.int(10, 99);
    const q = calc(R, '(1 − 1/2) × (1 − 1/3) × (1 − 1/4) × … × (1 − 1/' + n + ')');
    return ex(q, fr(1, n), qcm(fr(1, n), [fr(1, n - 1), fr(1, n + 1), fr(n - 1, n)], j => fr(1, n + 1 + j)),
      'On écrit chaque facteur comme une seule fraction pour voir les simplifications en chaîne. 1 − 1/k = (k − 1)/k, donc le produit vaut 1/2 × 2/3 × 3/4 × … × ' + (n - 1) + '/' + n + '. Chaque numérateur se simplifie avec le dénominateur précédent : il ne reste que le premier numérateur et le dernier dénominateur, soit ' + fr(1, n) + '. Piège : se tromper d\'un rang donne ' + fr(1, n - 1) + ' ou ' + fr(1, n + 1) + '.');
  }
  const n = R.int(9, 99);
  const q = calc(R, '(1 + 1/2) × (1 + 1/3) × (1 + 1/4) × … × (1 + 1/' + n + ')');
  const res = fr(n + 1, 2);
  return ex(q, res, qcm(res, [fr(n, 2), fr(n + 2, 2), ent(n + 1)], j => fr(n + 1 + 2 * j, 2)),
    'On écrit chaque facteur comme une seule fraction pour voir les simplifications en chaîne. 1 + 1/k = (k + 1)/k, donc le produit vaut 3/2 × 4/3 × 5/4 × … × ' + (n + 1) + '/' + n + '. Chaque numérateur se simplifie avec le dénominateur suivant : il reste ' + (n + 1) + '/2 = ' + res + '. Piège : oublier le dénominateur 2 qui reste donne ' + ent(n + 1) + ' ; se tromper d\'un rang donne ' + fr(n, 2) + ' ou ' + fr(n + 2, 2) + '.');
}

/* 4e · Puissances de dix et décimaux : 0,0003 × 4000 ÷ 0,06. */
const TRIPLETS = [], EXPOS = [];
(function(){
  for (let x = 2; x <= 9; x++) for (let y = 2; y <= 9; y++) [2, 3, 4, 5, 6, 8].forEach(z => {
    if ((x * y) % z === 0 && x * y / z >= 2 && x % z !== 0 && y % z !== 0) TRIPLETS.push([x, y, z]);
  });
  for (let p = 2; p <= 4; p++) for (let q = 2; q <= 5; q++) for (let r = 1; r <= 3; r++){
    const E = q + r - p; if (E >= 0 && E <= 3) EXPOS.push([p, q, r, E]);
  }
})();
function n4Puissances(R){
  const T = R.pick(TRIPLETS), X = R.pick(EXPOS), x = T[0], y = T[1], z = T[2], p = X[0], qq = X[1], r = X[2], E = X[3];
  const k = x * y / z, aS = dec(x, -p), bS = dec(y, qq), cS = dec(z, -r), res = dec(k, E);
  const P = dec(x * y, qq - p), P2 = dec(x * y, qq - p + r);
  return ex('Calcule ' + aS + ' × ' + bS + ' ÷ ' + cS + '.', res, qcm(res, [dec(k, E + 1), dec(k, E - 1), dec(k, E + 2)], j => dec(k + pm(j), E)),
    'On sépare les chiffres significatifs et les puissances de dix, puis on compte les décalages de virgule. ' + aS + ' × ' + bS + ' = ' + P + ' (car ' + x + ' × ' + y + ' = ' + (x * y) + '). Ensuite ' + P + ' ÷ ' + cS + ' = ' + P2 + ' ÷ ' + z + ' (on a multiplié les deux nombres par ' + dec(1, r) + ') = ' + res + '. Piège : un décalage oublié donne ' + dec(k, E - 1) + ' ou ' + dec(k, E + 1) + '.');
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif
   ===================================================== */

/* 5a · √(n(n+1)(n+2)(n+3) + 1). */
const RACINES = [];
for (let k = 11; k <= 60; k++) RACINES.push(k);
RACINES.push(97, 98, 99, 100, 101);
function n5Racine(R){
  const n = R.pick(RACINES), P = n * (n + 3), res = P + 1;
  const prod = n + ' × ' + (n + 1) + ' × ' + (n + 2) + ' × ' + (n + 3);
  const q = calc(R, '√(' + (R.int(0, 1) ? prod + ' + 1' : '1 + ' + prod) + ')');
  return ex(q, ent(res), qcm(ent(res), [ent(P), ent(P + 2), ent(P + 3)], j => ent(res + 2 * pm(j))),
    'On multiplie le premier facteur par le dernier et les deux du milieu entre eux, puis on reconnaît un carré. ' + n + ' × ' + (n + 3) + ' = ' + ent(P) + ' et ' + (n + 1) + ' × ' + (n + 2) + ' = ' + ent(P + 2) + ' : ces deux nombres entourent m = ' + ent(res) + '. Le produit vaut (m − 1)(m + 1) = m² − 1, donc en ajoutant 1 on obtient m², et la racine vaut ' + ent(res) + '. Piège : s\'arrêter à ' + ent(P) + ' ou à ' + ent(P + 2) + ', les deux voisins.');
}

/* 5b · (1 − 1/2²)(1 − 1/3²)…(1 − 1/n²). */
function n5TeleCarres(R){
  const n = R.int(9, 99), res = fr(n + 1, 2 * n);
  const q = calc(R, '(1 − 1/2²) × (1 − 1/3²) × (1 − 1/4²) × … × (1 − 1/' + n + '²)');
  return ex(q, res, qcm(res, [fr(1, n), fr(n - 1, 2 * n), '1/2'], j => fr(n + 1, 2 * n + 2 * j)),
    'On factorise chaque facteur par une différence de carrés, puis on sépare deux produits qui se simplifient en chaîne. 1 − 1/k² = (k − 1)(k + 1)/k² = (k − 1)/k × (k + 1)/k. Le produit des (k − 1)/k pour k allant de 2 à ' + n + ' vaut 1/' + n + ' ; celui des (k + 1)/k vaut ' + (n + 1) + '/2. Le résultat est 1/' + n + ' × ' + (n + 1) + '/2 = ' + (n + 1) + '/' + (2 * n) + (res !== (n + 1) + '/' + (2 * n) ? ' = ' + res : '') + '. Piège : ' + fr(1, n) + ' est le produit sans les carrés ; 1/2 n\'est que la valeur limite.');
}

/* 5c · Blocs répétés : abc × defdef − def × ghighi (× 1001). */
function n5Blocs(R){
  const d = R.int(1, 3), c = R.pick([345, 412, 457, 503, 538, 581, 624, 676, 718, 769]), a = c + d;
  const b = R.pick([117, 123, 142, 158, 163, 186, 204, 231, 268, 307]);            // b ≤ 333 : b × d garde 3 chiffres
  const BB = b * 1001, CC = c * 1001, res = 1001 * b * d;
  const q = 'Calcule ' + a + ' × ' + ent(BB) + ' − ' + b + ' × ' + ent(CC) + '.';
  return ex(q, ent(res), qcm(ent(res), ['0', ent(b * d), ent(1001 * c * d)], j => ent(res + 1001 * pm(j))),
    'On remarque qu\'un nombre formé de deux blocs identiques de trois chiffres vaut ce bloc multiplié par 1 001, puis on met en facteur. ' + ent(BB) + ' = ' + b + ' × 1 001 et ' + ent(CC) + ' = ' + c + ' × 1 001, donc le calcul vaut 1 001 × (' + a + ' × ' + b + ' − ' + b + ' × ' + c + ') = 1 001 × ' + b + ' × (' + a + ' − ' + c + ') = 1 001 × ' + (b * d) + ' = ' + ent(res) + '. Piège : croire que tout s\'annule donne 0 ; oublier le facteur 1 001 donne ' + ent(b * d) + '.');
}

/* 5d · Somme alternée de carrés : n² − (n − 1)² + … + 2² − 1². */
function n5Alterne(R){
  const n = R.int(20, 100), pair = n % 2 === 0, res = n * (n + 1) / 2, un = pair ? n / 2 : (n + 1) / 2;
  const q = calc(R, n + '² − ' + (n - 1) + '² + ' + (n - 2) + '² − ' + (n - 3) + '² + … + ' + (pair ? '2² − 1²' : '3² − 2² + 1²'));
  return ex(q, ent(res), qcm(ent(res), [ent(un), ent(n * (n + 1)), ent(n * (n - 1) / 2)], j => ent(res + n * pm(j))),
    'On regroupe les termes deux par deux et on factorise chaque différence de deux carrés consécutifs. ' + n + '² − ' + (n - 1) + '² = (' + n + ' − ' + (n - 1) + ')(' + n + ' + ' + (n - 1) + ') = ' + (2 * n - 1) + ', puis ' + (n - 2) + '² − ' + (n - 3) + '² = ' + (2 * n - 5) + ', et ainsi de suite jusqu\'à ' + (pair ? '2² − 1² = 3' : '3² − 2² = 5, puis il reste 1² = 1') + '. Chaque paire vaut la somme de ses deux nombres, donc le total vaut ' + n + ' + ' + (n - 1) + ' + … + 2 + 1 = ' + n + ' × ' + (n + 1) + ' ÷ 2 = ' + ent(res) + '. Piège : croire que chaque différence vaut 1 donne ' + ent(un) + ' ; oublier de diviser par 2 donne ' + ent(n * (n + 1)) + '.');
}

/* 5e · Somme télescopique : 1/(1 × 2) + 1/(2 × 3) + … */
function n5TeleSomme(R){
  const n = R.int(9, 99), res = fr(n, n + 1), v = R.int(0, 1);
  const q = calc(R, v ? '1/(1 × 2) + 1/(2 × 3) + 1/(3 × 4) + … + 1/(' + n + ' × ' + (n + 1) + ')'
    : '1/2 + 1/6 + 1/12 + 1/20 + … + 1/' + (n * (n + 1)));
  return ex(q, res, qcm(res, [fr(n - 1, n), fr(1, n + 1), fr(n + 1, n + 2)], j => fr(n + j, n + j + 1)),
    'On décompose chaque fraction en différence de deux fractions plus simples, puis les termes s\'annulent en chaîne. ' + (v ? '' : 'Les dénominateurs sont 1 × 2, 2 × 3, 3 × 4, 4 × 5, … jusqu\'à ' + n + ' × ' + (n + 1) + ' = ' + ent(n * (n + 1)) + '. ') + '1/(k × (k + 1)) = 1/k − 1/(k + 1), donc la somme vaut (1 − 1/2) + (1/2 − 1/3) + … + (1/' + n + ' − 1/' + (n + 1) + ') = 1 − 1/' + (n + 1) + ' = ' + res + '. Piège : s\'arrêter un rang trop tôt donne ' + fr(n - 1, n) + ' ; garder seulement le dernier terme donne ' + fr(1, n + 1) + '.');
}

const GEN = [
  [n1Paires, n1Pourcent, n1Prio, n1Decimal, n1Compense],
  [n2DiffCarres, n2Carre, n2Compense, n2Facteur, n2Decimaux, n2Fractions],
  [n3DiffGrands, n3Voisins, n3ProduitDec, n3DivDec, n3FacteurGrand, n3Puissances],
  [n4Identite, n4Quotient, n4Symetrie, n4Telescope, n4Puissances],
  [n5Racine, n5TeleCarres, n5Blocs, n5Alterne, n5TeleSomme]
];

A.push({
  id: 'alb-02-calcul-mental',
  phase: 'albert',
  ordre: 2,
  theme: 'calcul',
  titre: 'Calcul mental et calcul astucieux sans calculatrice',
  objectif: 'Repérer le raccourci caché dans un calcul (regrouper, compenser, factoriser, identité remarquable) et le mener sans calculatrice en moins de deux minutes.',
  lecon:
`<p class="lede">Au test d'Albert School, la calculatrice est interdite et chaque minute compte. Les calculs proposés paraissent souvent énormes, mais ils cachent presque toujours <mark>un raccourci</mark> : ton travail est de le repérer avant de poser quoi que ce soit.</p>
<h2>Ce que le test te demande</h2>
<p>Tu verras des calculs comme 25 × 48, 47 × 53, 2026² − 2025², 0,125 × 64 × 2,5 ou 1 ÷ 0,04, avec quatre réponses proposées. Le calcul direct serait long et risqué ; avec la bonne idée, il tient en deux ou trois lignes de brouillon. Les mauvaises réponses ne sont pas choisies au hasard : elles correspondent aux erreurs classiques (virgule décalée, carré oublié, signe inversé, résultat décalé d'une unité). Plus tu montes en niveau, plus l'astuce est cachée, mais ce sont toujours les mêmes outils.</p>
<h2>Les prérequis, en version courte</h2>
<ul>
<li>Les tables jusqu'à 12 et les carrés jusqu'à 25 : 13² = 169, 15² = 225, 25² = 625.</li>
<li>Les paires qui font un nombre rond : 2 × 5 = 10, 4 × 25 = 100, 8 × 125 = 1 000, 4 × 2,5 = 10, 8 × 0,125 = 1.</li>
<li>Les décimaux à reconnaître en fraction : 0,5 = 1/2 ; 0,25 = 1/4 ; 0,75 = 3/4 ; 0,2 = 1/5 ; 0,125 = 1/8.</li>
<li>Les puissances de 2 : 2⁵ = 32, 2⁸ = 256, 2⁹ = 512, 2¹⁰ = 1 024. Et deux puissances de même exposant se multiplient en multipliant les bases : 2⁴ × 5⁴ = 10⁴.</li>
<li>Les fractions : pour multiplier, on multiplie les numérateurs entre eux et les dénominateurs entre eux ; pour diviser par une fraction, on multiplie par son inverse.</li>
<li>Les priorités : multiplications et divisions d'abord, puis additions et soustractions, de gauche à droite à priorité égale.</li>
<li>Les identités remarquables : (a + b)² = a² + 2ab + b², (a − b)² = a² − 2ab + b² et (a − b)(a + b) = a² − b².</li>
</ul>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je regarde avant de calculer :</strong> un nombre proche d'un rond (99, 101, 298), un facteur commun, des carrés, deux nombres symétriques autour d'un centre (47 et 53 autour de 50), des fractions qui se simplifient entre elles.</p>
<p><strong>2. Je choisis l'outil :</strong> regrouper, compenser, factoriser, simplifier avant de multiplier ou reconnaître une identité.</p>
<p><strong>3. Je calcule proprement sur le brouillon,</strong> une ligne par étape, sans perdre un signe.</p>
<p><strong>4. Je contrôle :</strong> l'ordre de grandeur et le dernier chiffre éliminent souvent deux réponses.</p>
</div>
<table class="tbl">
<tr><th>Outil</th><th>Exemple</th></tr>
<tr><td>Regrouper</td><td>4 × 37 × 25 = 37 × 100 = 3 700</td></tr>
<tr><td>Compenser</td><td>37 × 99 = 3 700 − 37 = 3 663 ; 742 − 298 = 742 − 300 + 2 = 444</td></tr>
<tr><td>Factoriser</td><td>17 × 23 + 17 × 77 = 17 × 100 = 1 700</td></tr>
<tr><td>Différence de carrés</td><td>47 × 53 = (50 − 3)(50 + 3) = 2 500 − 9 = 2 491</td></tr>
<tr><td>Carré d'un presque rond</td><td>99² = 10 000 − 200 + 1 = 9 801</td></tr>
<tr><td>Simplifier en croix</td><td>14/15 × 25/28 = 1/3 × 5/2 = 5/6 (14 avec 28, 25 avec 15)</td></tr>
<tr><td>Former des 10</td><td>2⁶ × 5⁴ = 2² × (2 × 5)⁴ = 4 × 10 000 = 40 000</td></tr>
<tr><td>Diviser par un décimal</td><td>1,8 ÷ 0,06 = 180 ÷ 6 = 30</td></tr>
</table>
<h2>Exemples résolus</h2>
<h3>1. Découverte : 25 × 48</h3>
<p>48 = 4 × 12, donc 25 × 48 = (25 × 4) × 12 = 100 × 12 = <mark>1 200</mark>. Pas besoin de poser la multiplication.</p>
<h3>2. Maîtrise : 98²</h3>
<p>98 = 100 − 2, donc 98² = 100² − 2 × 100 × 2 + 2² = 10 000 − 400 + 4 = <mark>9 604</mark>. N'oublie pas le double produit : 10 000 − 4 serait faux.</p>
<h3>3. Niveau du test : 2031² − 2029²</h3>
<p>Calculer deux carrés de cette taille prendrait cinq minutes. On factorise : 2031² − 2029² = (2031 − 2029)(2031 + 2029) = 2 × 4 060 = <mark>8 120</mark>. Le piège serait de répondre 2² = 4, en confondant avec (2031 − 2029)².</p>
<h3>4. Plus difficile : (1 − 1/2) × (1 − 1/3) × … × (1 − 1/10)</h3>
<p>On écrit chaque facteur comme une seule fraction : 1/2 × 2/3 × 3/4 × … × 9/10. Chaque numérateur se simplifie avec le dénominateur précédent, il ne reste que <mark>1/10</mark>. Quand un calcul aligne beaucoup de facteurs qui se ressemblent, cherche ces simplifications en chaîne.</p>
<h2>Les réflexes sans calculatrice</h2>
<ul>
<li>Diviser par 0,5, c'est multiplier par 2 ; diviser par 0,25, multiplier par 4 ; diviser par 0,125, multiplier par 8.</li>
<li>Pour diviser par un décimal, multiplie les deux nombres par 10, 100 ou 1 000 jusqu'à ce que le diviseur soit entier : 1 ÷ 0,04 = 100 ÷ 4 = 25.</li>
<li>Pour multiplier des décimaux, calcule sans virgule puis compte les chiffres après la virgule : 0,3 × 0,4 = 0,12, pas 1,2.</li>
<li>Pour un pourcentage, pars de 10 % : 15 % de 260 = 26 + 13 = 39.</li>
<li>Avec des zéros et des virgules, sépare les chiffres des puissances de 10 : 0,003 × 2 000 = 6, car 3 × 2 = 6 et les décalages se compensent.</li>
<li>Avant de multiplier des fractions, simplifie chaque numérateur avec le dénominateur de l'autre fraction : les nombres restent petits.</li>
<li>Avec des 2 et des 5, forme le plus possible de 10 : 2⁷ × 5⁴ = 2³ × 10⁴ = 80 000.</li>
<li>Deux nombres symétriques autour de n : leur produit vaut n² moins le carré de l'écart, par exemple 2025 × 2027 = 2026² − 1.</li>
</ul>
<h2>Pour les questions les plus dures</h2>
<ul>
<li>Le produit de quatre entiers consécutifs, plus 1, est un carré : 7 × 8 × 9 × 10 + 1 = 71², car 7 × 10 = 70 et 8 × 9 = 72 encadrent 71.</li>
<li>1/(k × (k + 1)) = 1/k − 1/(k + 1) : une somme de ces fractions se simplifie en chaîne.</li>
<li>Un nombre formé de deux blocs identiques de trois chiffres vaut le bloc multiplié par 1 001 : 203 203 = 203 × 1 001.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Avant de calculer, cherche le nombre rond caché : regroupe les paires rondes, compense autour d'un nombre rond, mets en facteur, simplifie avant de multiplier ou reconnais une identité remarquable.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Les erreurs classiques : la virgule décalée (0,3 × 0,4 = 0,12) ; diviser par 0,5 confondu avec multiplier par 0,5 ; le double produit oublié, car (a + b)² n'est pas a² + b² ; a² − b² confondu avec (a − b)² ; les priorités (2 + 3 × 4 = 14, pas 20) ; la correction faite dans le mauvais sens quand on compense ; les exposants additionnés à tort (2⁹ + 2⁹ = 2¹⁰, pas 2¹⁸) ; les fractions additionnées terme à terme ; une réponse décalée d'une unité. Va vite sur les questions faciles, mais relis : tu ne pourras pas revenir en arrière.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>25 × 4 = 100, 125 × 8 = 1 000 et 2¹⁰ = 1 024. (a − b)(a + b) = a² − b² et (a ± b)² = a² ± 2ab + b². k × a + k × b = k × (a + b). Pour diviser par un décimal, rends le diviseur entier en multipliant les deux nombres par la même puissance de 10. Si un calcul paraît énorme, il y a un raccourci.</p></div>`,
  gen(level, R){
    const n = niv(level), liste = GEN[n - 1];
    try { return liste[R.int(0, liste.length - 1)](R); }
    catch (e){ return n1Paires(R); }
  }
});

})();
