/* ===== Maths · Objectif Albert School : piste de compétences (hors Sentier) =====
   Catalogue SÉPARÉ : window.ALBERT_SKILLS (jamais SKILLS). Ids « alb-NN-slug », jamais « p1- » à « p7- ».
   Chaque gen(level, R) rend un QCM : exactement 4 choix distincts au sens de normStr, dont a ; accept: null.
   Niveaux 1 à 3 : séries de la leçon (runSerie). Niveaux 4 et 5 : paliers hauts du test blanc adaptatif.
   Script classique dans une IIFE : aucun symbole de premier niveau. Banc : node banc.js <maths> 3000 ALBERT_SKILLS

   Ce fichier porte la première compétence (alb-01-pourcentages). Le reste de la piste vit dans
   des fichiers frères skills/skills-albert-*.js, sur le même modèle :
     /* ===== Maths · Objectif Albert School : alb-01 · Pourcentages, coefficients multiplicateurs, proportions =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS.
   gen(level, R) rend un QCM { q, a, accept: null, choix: [4 chaînes], expl } ; niveaux bornés à 1..5.
   Sous-types : N1 part, appliquer, coefficient, taux, proportion · N2 successives, TVA, valeur initiale,
   réciproque, points, proportion de proportion · N3 aire, produit de deux grandeurs, bénéfice, moyenne pondérée,
   promotions, dilution, évolution répétée · N4 séchage, départs ou arrivées, évolution manquante, grandeurs
   inversement liées, deux évolutions égales, proportion inversée · N5 rapport de moyennes, mélange, eau évaporée,
   +x % puis −x %, doublement, écart relatif entre deux grandeurs qui évoluent. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales ---------- */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
function valeur(s){ const m = /^([+-]?\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/.exec(norm(s)); return m ? (m[2] ? +m[1] / +m[2] : +m[1]) : null; }
/* Nombre à la française : d décimales au plus (2 par défaut), virgule, U+202F pour les milliers, vrai signe moins. */
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
const eur = x => nb(x) + ' €';
const pct = x => nb(x) + ' %';
const evo = x => (Math.round(x * 100) / 100 > 0 ? '+' : '') + nb(x) + ' %';
const alt = k => (k % 2 ? 1 : -1) * Math.ceil(k / 2);
const ent = x => isFinite(x) && Math.abs(x - Math.round(x)) < 1e-9;
const dec1 = x => isFinite(x) && Math.abs(x * 10 - Math.round(x * 10)) < 1e-7;
const dec2 = x => isFinite(x) && Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;
const abs = Math.abs;
/* QCM : la bonne réponse, puis les distracteurs pédagogiques, puis des voisins ; jamais deux choix de même valeur. */
function qcm(bonne, autres, voisin){
  const ch = [], vusN = new Set(), vusV = [];
  const ajouter = c => {
    if (ch.length >= 4 || c == null) return;
    c = String(c);
    if (!c.trim() || /NaN|Infinity|undefined/.test(c)) return;
    const n = norm(c), v = valeur(c);
    if (vusN.has(n)) return;
    if (v !== null && vusV.some(w => abs(w - v) < 1e-9)) return;
    vusN.add(n); if (v !== null) vusV.push(v); ch.push(c);
  };
  ajouter(bonne);
  autres.forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 300; k++) ajouter(voisin(k));
  return ch;
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));
function tirer(f, essais){ for (let i = 0; i < (essais || 200); i++){ const v = f(); if (v) return v; } return null; }
/* Petites fractions usuelles pour les explications. */
const FR = {0.1: '1/10', 0.2: '1/5', 0.25: '1/4', 0.4: '2/5', 0.5: '1/2', 0.625: '5/8', 0.75: '3/4', 0.8: '4/5', 1.25: '5/4', 1.6: '8/5', 2: '2', 2.5: '5/2', 4: '4', 5: '5', 10: '10'};
const fr = x => FR[Math.round(x * 1000) / 1000] || nb(x, 4);
/* « 0,8 (soit 4/5) », sans répétition quand la fraction est un entier. */
const coefTxt = x => fr(x) === nb(x, 3) ? nb(x, 3) : nb(x, 3) + ' (soit ' + fr(x) + ')';
/* Astuce de division par un coefficient, si elle existe. */
const DIV = {110: 'diviser par 1,1 revient à multiplier par 10/11', 120: 'diviser par 1,2 revient à multiplier par 5/6', 125: 'diviser par 1,25 revient à multiplier par 0,8', 150: 'diviser par 1,5 revient à multiplier par 2/3', 160: 'diviser par 1,6 revient à multiplier par 5/8', 200: 'diviser par 2, c\'est prendre la moitié', 90: 'diviser par 0,9 revient à multiplier par 10/9', 80: 'diviser par 0,8 revient à multiplier par 1,25', 75: 'diviser par 0,75 revient à multiplier par 4/3', 60: 'diviser par 0,6 revient à multiplier par 5/3', 50: 'diviser par 0,5 revient à multiplier par 2'};
const verbe = s => s > 0 ? 'augmente' : 'baisse';
const FRUITS = [['champignons', 'm'], ['tomates', 'f'], ['abricots', 'm'], ['prunes', 'f'], ['figues', 'f'], ['pommes', 'f']];
const accord = (g, m, f) => g === 'f' ? f : m;
const de = x => (/^[aeiouyéèêh]/i.test(x) ? 'd\'' : 'de ') + x;

/* ---------- tables précalculées (déterministes, au chargement) ---------- */
const SECHAGE = [];   // [p1, p2, facteur] : (100 − p1)/(100 − p2) ∈ {0,2 ; 0,25 ; 0,4 ; 0,5}
[60, 70, 75, 80, 85, 88, 90, 92, 95, 96, 98, 99].forEach(p1 => [20, 25, 40, 50, 60, 70, 75, 76, 80, 84, 90, 92, 95, 96, 98].forEach(p2 => {
  if (p2 >= p1) return;
  const f = (100 - p1) / (100 - p2);
  if ([0.2, 0.25, 0.4, 0.5].some(v => abs(v - f) < 1e-9)) SECHAGE.push([p1, p2, Math.round(f * 100) / 100]);
}));
const EVAP = [];      // [p1, p2, part de l'eau évaporée en %]
[40, 50, 60, 75, 80, 90, 95, 96, 98, 99].forEach(p1 => [10, 15, 20, 25, 40, 50, 60, 75, 80, 90, 95, 96, 98].forEach(p2 => {
  if (p2 >= p1) return;
  const d = 100 - p1, T2 = d * 100 / (100 - p2), W2 = T2 - d, f = (p1 - W2) / p1 * 100;
  if (dec1(f) && f > 0 && f < 100 && abs(f - (p1 - p2)) > 1e-9 && abs(f - (100 - T2)) > 1e-9) EVAP.push([p1, p2, Math.round(f * 10) / 10]);
}));
const RAPPORTS = [];  // [p, q, rapport des moyennes]
[10, 20, 25, 30, 40, 50, 60, 75, 80].forEach(p => [25, 40, 50, 60, 75, 80, 90, 95].forEach(q => {
  if (q <= p) return;
  const r = q * (100 - p) / (p * (100 - q));
  if (dec2(r) && r >= 1.5 && r <= 20) RAPPORTS.push([p, q, Math.round(r * 100) / 100]);
}));
const BAYES = [];     // [contexte, p, rA, rB, réponse]
[[0, [40, 50, 60], [5, 10, 15, 20, 25, 30, 40]], [1, [20, 25, 30, 40, 50, 60, 70, 75, 80], [1, 2, 3, 4, 5, 6, 8, 10]], [2, [20, 25, 30, 40, 50, 60, 75], [5, 10, 15, 20, 25, 30]]].forEach(c => {
  c[1].forEach(p => c[2].forEach(rA => c[2].forEach(rB => {
    if (rA === rB) return;
    const x = 100 * p * rA / (p * rA + (100 - p) * rB);
    if (ent(x) && x !== p && x !== rA && x > 0 && x < 100) BAYES.push([c[0], p, rA, rB, Math.round(x)]);
  })));
});

const ECARTS = [];   // [p, a, b, X] : A dépassait B de p %, A évolue de a %, B de b %, A dépasse alors B de X %
[10, 20, 25, 40, 50, 60, 75, 80, 100, 150, 200].forEach(p => [-50, -40, -25, -20, -10, 10, 20, 25, 50, 60].forEach(a => [-50, -40, -25, -20, -10, 10, 20, 25, 50, 60].forEach(b => {
  if (a === b) return;
  const X = (100 + p) * (100 + a) / (100 + b) - 100, add = p + a - b;
  if (!dec1(X) || X <= 0 || X > 300 || abs(X - p) < 1e-9 || add <= 0 || abs(add - X) < 1e-9) return;
  ECARTS.push([p, a, b, Math.round(X * 10) / 10]);
})));

/* =========================== NIVEAU 1 =========================== */
function parDix(t, N){
  const d = N / 10;
  if (t === 5) return '10 % de ' + nb(N) + ' font ' + nb(d) + ', et 5 % en est la moitié : ' + nb(d / 2) + '.';
  if (t === 10) return '10 % de ' + nb(N) + ', c\'est ' + nb(N) + ' ÷ 10 = ' + nb(d) + '.';
  if (t === 15) return '10 % de ' + nb(N) + ' font ' + nb(d) + ' et 5 % font ' + nb(d / 2) + ', donc 15 % font ' + nb(d) + ' + ' + nb(d / 2) + ' = ' + nb(1.5 * d) + '.';
  if (t === 25) return '25 %, c\'est le quart : ' + nb(N) + ' ÷ 4 = ' + nb(N / 4) + '.';
  if (t === 75) return '75 %, ce sont les trois quarts : ' + nb(N) + ' ÷ 4 = ' + nb(N / 4) + ', puis × 3 = ' + nb(3 * N / 4) + '.';
  return '10 % de ' + nb(N) + ' font ' + nb(d) + ', donc ' + t + ' % font ' + (t / 10) + ' × ' + nb(d) + ' = ' + nb(t * d / 10) + '.';
}

function n1Part(R){
  const t = R.pick([5, 10, 15, 20, 25, 30, 40, 60, 75]), ctx = R.int(0, 3);
  let N, q, u;
  if (ctx === 0){ N = R.pick([40, 60, 80, 120, 140, 160, 180, 240, 260, 320, 360, 480]); q = 'Combien font ' + t + ' % de ' + nb(N) + ' ?'; u = x => nb(x); }
  else if (ctx === 1){ N = R.pick([300, 400, 500, 600, 700, 800, 900, 1200]); q = 'Un lycée compte ' + nb(N) + ' élèves, dont ' + t + ' % sont internes. Combien d\'élèves sont internes ?'; u = x => nb(x); }
  else if (ctx === 2){ N = R.pick([40, 60, 80, 120, 160, 180, 240, 320, 360, 480, 640]); q = 'Une facture de ' + eur(N) + ' bénéficie d\'une remise de ' + t + ' %. Quel est le montant de la remise ?'; u = eur; }
  else { N = R.pick([120, 160, 240, 360, 420, 480, 560, 640, 720, 840]); q = 'Sur un trajet de ' + nb(N) + ' km, ' + t + ' % du parcours se fait sur autoroute. Combien de kilomètres se font sur autoroute ?'; u = x => nb(x) + ' km'; }
  const r = N * t / 100;
  return {
    q, a: u(r), accept: null,
    choix: qcm(u(r), [u(N - r), u(r * 10), u(r / 10), ent(N / t) ? u(N / t) : null], k => { const x = r + alt(k) * (r >= 20 ? 5 : 1); return x > 0 ? u(x) : null; }),
    expl: 'Pour prendre un pourcentage d\'un nombre, on multiplie ce nombre par le pourcentage puis on divise par cent ; de tête, on passe par le dixième du nombre (dix pour cent). ' + parDix(t, N) + ' Réponse : ' + u(r) + '. Piège : ' + u(N - r) + ' est ce qui reste une fois les ' + t + ' % retirés, pas les ' + t + ' % eux-mêmes.'
  };
}

function n1Appliquer(R){
  const t = R.pick([5, 10, 15, 20, 25, 30, 40, 50]), hausse = R.int(0, 1) === 1;
  const P = R.pick([20, 40, 60, 80, 120, 140, 160, 200, 240, 300, 400, 500, 600, 800]);
  const c = hausse ? 100 + t : 100 - t, f = P * c / 100, v = P * t / 100, ctx = R.int(0, 2);
  let q;
  if (ctx === 0) q = 'Un article coûte ' + eur(P) + '. Son prix ' + (hausse ? 'augmente' : 'baisse') + ' de ' + t + ' %. Quel est son nouveau prix ?';
  else if (ctx === 1) q = 'Un abonnement annuel coûte ' + eur(P) + '. Son tarif ' + (hausse ? 'augmente' : 'diminue') + ' de ' + t + ' %. Quel est le nouveau tarif ?';
  else q = hausse ? 'Le loyer mensuel d\'un garage, de ' + eur(P) + ', augmente de ' + t + ' %. Quel est le nouveau loyer ?' : 'Un blouson affiché ' + eur(P) + ' est soldé à −' + t + ' %. Quel est son prix soldé ?';
  const k = nb(c / 100), pos = x => x > 0 ? eur(x) : null;
  return {
    q, a: eur(f), accept: null,
    choix: qcm(eur(f), [pos(hausse ? P + t : P - t), pos(P * (hausse ? 100 - t : 100 + t) / 100), pos(v)], k2 => pos(f + alt(k2) * (f >= 50 ? 5 : 1))),
    expl: 'Une évolution en pourcentage revient à multiplier par un coefficient : 1 + taux pour une hausse, 1 − taux pour une baisse. Ici le coefficient vaut ' + k + ' : ' + eur(P) + ' × ' + k + ' = ' + eur(f) + '. Autre chemin : ' + t + ' % de ' + eur(P) + ' font ' + eur(v) + ', et ' + eur(P) + (hausse ? ' + ' : ' − ') + eur(v) + ' = ' + eur(f) + '. Piège : ' + (hausse ? 'ajouter' : 'retirer') + ' ' + t + ' € au lieu de ' + t + ' %' + ((hausse ? P + t : P - t) > 0 ? ' donne ' + eur(hausse ? P + t : P - t) + ', ce qui est faux' : '') + '.'
  };
}

function n1Coef(R){
  const mode = R.int(0, 2);
  if (mode < 2){
    const hausse = mode === 0, t = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 18, 25, 30, 35, 40, 45, 60, 70, 80]);
    const c = hausse ? (100 + t) / 100 : (100 - t) / 100;
    const q = R.int(0, 1) ? ((hausse ? 'Augmenter' : 'Baisser') + ' une quantité de ' + t + ' % revient à la multiplier par :') : ('Par quel nombre faut-il multiplier un prix pour ' + (hausse ? 'l\'augmenter' : 'le baisser') + ' de ' + t + ' % ?');
    const virgule = t < 10 ? (hausse ? 1 + t / 10 : 1 - t / 10) : (hausse ? 100 + t : 100 - t);
    const inverse = hausse ? (100 - t) / 100 : (100 + t) / 100;
    return {
      q, a: nb(c, 4), accept: null,
      choix: qcm(nb(c, 4), [nb(inverse, 4), nb(t / 100, 4), nb(virgule, 4)], k => { const x = c + alt(k) * 0.01; return x > 0 ? nb(x, 4) : null; }),
      expl: (hausse ? 'Augmenter de t %, c\'est garder la quantité entière (100 %) et ajouter t % : on multiplie par 1 + t/100.' : 'Baisser de t %, c\'est garder la quantité entière (100 %) et retirer t % : on multiplie par 1 − t/100.') + ' Ici 1 ' + (hausse ? '+ ' : '− ') + nb(t / 100) + ' = ' + nb(c, 4) + '. Piège : ' + nb(t / 100) + ' ne donne que le montant de la variation, et ' + nb(inverse, 4) + ' correspond ' + (hausse ? 'à une baisse' : 'à une hausse') + ' de ' + t + ' %.'
    };
  }
  const hausse = R.int(0, 1) === 1, t = R.pick([3, 4, 5, 6, 7, 8, 12, 15, 20, 25, 30, 35, 40, 60, 75]);
  const c = hausse ? (100 + t) / 100 : (100 - t) / 100;
  const aug = x => 'l\'augmenter de ' + nb(x) + ' %', bai = x => 'le baisser de ' + nb(x) + ' %';
  const bonne = hausse ? aug(t) : bai(t);
  const autres = hausse ? [aug(100 + t), bai(t), t < 10 ? aug(10 * t) : aug(t / 10)] : [bai(100 - t), aug(t), t < 10 ? bai(10 * t) : bai(t / 10)];
  return {
    q: 'Multiplier un prix par ' + nb(c, 4) + ' revient à :', a: bonne, accept: null,
    choix: qcm(bonne, autres, k => { const x = t + alt(k); return x > 0 ? (hausse ? aug(x) : bai(x)) : null; }),
    expl: 'Compare le coefficient à 1 : au-dessus de 1 c\'est une hausse, en dessous c\'est une baisse, et l\'écart avec 1 donne le taux. Ici ' + nb(c, 4) + (hausse ? ' = 1 + ' : ' = 1 − ') + nb(t / 100) + ', donc on ' + (hausse ? 'augmente' : 'baisse') + ' le prix de ' + t + ' %. Piège : lire directement ' + nb(c * 100) + ' % ; ce nombre est ce que devient le prix (' + nb(c * 100) + ' % du prix de départ), pas le taux d\'évolution.'
  };
}

function n1Taux(R){
  const s = tirer(() => {
    const V1 = R.pick([20, 40, 50, 60, 80, 120, 150, 200, 250, 400, 500]), r = R.pick([10, 20, 25, 40, 50, 60, 75, 100, -10, -20, -25, -40, -50, -60, -75]);
    const V2 = V1 * (100 + r) / 100;
    return ent(V2) && V2 > 0 ? {V1, r, V2} : null;
  }) || {V1: 40, r: 25, V2: 50};
  const {V1, r, V2} = s, ctx = R.int(0, 3);
  let q;
  if (ctx === 0) q = 'Le prix d\'un article passe de ' + eur(V1) + ' à ' + eur(V2) + '.';
  else if (ctx === 1) q = 'Le nombre d\'abonnés d\'un club passe de ' + nb(V1) + ' à ' + nb(V2) + '.';
  else if (ctx === 2) q = 'Les ventes mensuelles d\'une boutique passent de ' + nb(V1) + ' à ' + nb(V2) + ' unités.';
  else q = 'Une entreprise passe de ' + nb(V1) + ' à ' + nb(V2) + ' salariés.';
  q += ' Quel est le taux d\'évolution ?';
  const mauvaiseBase = (V2 - V1) / V2 * 100;
  return {
    q, a: evo(r), accept: null,
    choix: qcm(evo(r), [mauvaiseBase, (r > 0 ? 1 : -1) * V2 / V1 * 100, V2 - V1].filter(v => v > -100).map(evo), k => { const v = r + alt(k) * 5; return v > -100 ? evo(v) : null; }),
    expl: 'Le taux d\'évolution se calcule par (valeur d\'arrivée − valeur de départ) ÷ valeur de départ. Ici (' + nb(V2) + ' − ' + nb(V1) + ') ÷ ' + nb(V1) + ' = ' + nb(V2 - V1) + ' ÷ ' + nb(V1) + ' = ' + nb(r / 100) + ', soit ' + evo(r) + '. Piège : diviser par la valeur d\'arrivée donne ' + evo(mauvaiseBase) + ', ce qui est faux, car on compare toujours à la valeur de départ.'
  };
}

function n1Prop(R){
  const ctx = R.int(0, 3);
  const s = tirer(() => {
    const N = R.pick(ctx === 0 ? [20, 25, 30] : [40, 50, 200, 250, 400, 500]);
    const k = R.int(1, N - 1), p = 100 * k / N;
    return ent(p) && p !== 50 ? {N, k, p} : null;
  }) || {N: 25, k: 9, p: 36};
  const {N, k, p} = s;
  let q;
  if (ctx === 0) q = 'Dans une classe de ' + N + ' élèves, ' + k + ' pratiquent un sport en club. Quel pourcentage des élèves de la classe cela représente-t-il ?';
  else if (ctx === 1) q = 'Sur ' + nb(N) + ' candidats à un concours, ' + nb(k) + ' ont été admis. Quel est le taux d\'admission ?';
  else if (ctx === 2) q = 'Un magasin a vendu ' + nb(N) + ' articles, dont ' + nb(k) + ' en ligne. Quel pourcentage des ventes s\'est fait en ligne ?';
  else q = 'Un club compte ' + nb(N) + ' adhérents, dont ' + nb(k) + ' ont moins de 18 ans. Quel pourcentage des adhérents a moins de 18 ans ?';
  const reste = 100 * k / (N - k);
  const sur100 = ent(100 / N) ? ' (on peut aussi ramener à 100 : ' + nb(k) + ' × ' + nb(100 / N) + ' = ' + nb(p) + ' sur 100)'
    : ent(N / 100) ? ' (on peut aussi ramener à 100 : ' + nb(N) + ' ÷ ' + nb(N / 100) + ' = 100 et ' + nb(k) + ' ÷ ' + nb(N / 100) + ' = ' + nb(p) + ', donc ' + nb(p) + ' sur 100)'
    : ' (on peut aussi simplifier la fraction ' + nb(k) + '/' + nb(N) + ')';
  return {
    q, a: pct(p), accept: null,
    choix: qcm(pct(p), [k !== p && k < 100 ? pct(k) : null, pct(100 - p), reste < 100 ? pct(reste) : null], j => { const x = p + alt(j) * 5; return x > 0 && x < 100 ? pct(x) : null; }),
    expl: 'Une proportion en pourcentage, c\'est la partie divisée par le tout, multipliée par 100. Ici ' + nb(k) + ' ÷ ' + nb(N) + ' = ' + nb(p / 100) + ', soit ' + pct(p) + sur100 + '. Piège : ' + pct(100 - p) + ' est la part des autres' + (reste < 100 ? ', et ' + pct(reste) + ' compare la partie aux autres au lieu de la comparer au tout' : '') + '.'
  };
}

/* =========================== NIVEAU 2 =========================== */
function n2Succ(R){
  const a = R.pick([5, 10, 20, 25, 30, 40, 50]), b = R.pick([5, 10, 20, 25, 30, 40, 50]);
  const x = R.pick([1, -1]) * a, y = R.pick([1, -1]) * b, g = x + y + x * y / 100, ctx = R.int(0, 2);
  let q;
  if (ctx === 0) q = 'Un prix ' + verbe(x) + ' de ' + a + ' %, puis ' + verbe(y) + ' de ' + b + ' %.';
  else if (ctx === 1) q = 'Le chiffre d\'affaires d\'une boutique ' + verbe(x) + ' de ' + a + ' % en janvier, puis ' + verbe(y) + ' de ' + b + ' % en février.';
  else q = 'Le nombre de visiteurs d\'un musée ' + verbe(x) + ' de ' + a + ' % une année, puis ' + verbe(y) + ' de ' + b + ' % l\'année suivante.';
  q += ' Quelle est l\'évolution globale ?';
  return {
    q, a: evo(g), accept: null,
    choix: qcm(evo(g), [evo(x + y), x + y - x * y / 100 > -100 ? evo(x + y - x * y / 100) : null, -g > -100 ? evo(-g) : null], k => { const v = g + alt(k); return v > -100 ? evo(v) : null; }),
    expl: 'Chaque évolution se traduit par un coefficient multiplicateur, et des évolutions successives se multiplient. Ici ' + nb(1 + x / 100) + ' × ' + nb(1 + y / 100) + ' = ' + nb(1 + g / 100, 4) + ', donc l\'évolution globale vaut ' + evo(g) + '. Piège : additionner les taux donne ' + evo(x + y) + ', ce qui est faux, car la seconde évolution s\'applique à une valeur qui a déjà changé.'
  };
}

function n2Tva(R){
  const tau = R.pick([20, 20, 10]);
  const HT = R.pick(tau === 20 ? [25, 40, 45, 50, 60, 75, 80, 90, 120, 150, 200, 250, 300, 350, 400, 450, 500, 600, 750, 800, 1000, 1500] : [30, 40, 50, 60, 70, 80, 90, 120, 150, 200, 250, 300, 500]);
  const TTC = HT * (100 + tau) / 100, tva = TTC - HT, k = nb(1 + tau / 100, 3);
  const objet = R.pick(tau === 20 ? ['Un casque audio', 'Un vélo', 'Une imprimante', 'Un meuble de bureau'] : ['Un repas de groupe au restaurant', 'Une course en taxi', 'Une nuit d\'hôtel']);
  const debut = objet + ' coûte ' + eur(TTC) + ' TTC, avec une TVA de ' + nb(tau) + ' %.';
  const div = tau === 20 ? ' Diviser par 1,2, c\'est diviser par 6 puis multiplier par 5.' : ' Diviser par 1,1, c\'est diviser par 11 puis multiplier par 10.';
  if (R.int(0, 2) < 2){
    return {
      q: debut + ' Quel est son prix hors taxes (HT) ?', a: eur(HT), accept: null,
      choix: qcm(eur(HT), [eur(TTC * (100 - tau) / 100), eur(TTC - tau), eur(TTC * (100 + tau) / 100)], j => { const x = HT + alt(j) * 5; return x > 0 ? eur(x) : null; }),
      expl: 'Le prix TTC s\'obtient en multipliant le prix HT par 1 + taux de TVA ; pour remonter au HT, on divise donc le TTC par ce coefficient. Ici ' + eur(TTC) + ' ÷ ' + k + ' = ' + eur(HT) + '.' + div + ' Vérification : ' + eur(HT) + ' × ' + k + ' = ' + eur(TTC) + '. Piège : ' + eur(TTC) + ' × ' + nb(1 - tau / 100, 3) + ' = ' + eur(TTC * (100 - tau) / 100) + ' est faux, car la TVA se calcule sur le prix HT, pas sur le prix TTC.'
    };
  }
  return {
    q: debut + ' Quel est le montant de la TVA ?', a: eur(tva), accept: null,
    choix: qcm(eur(tva), [eur(TTC * tau / 100), eur(HT), eur(tau)], j => { const x = tva + alt(j) * 2; return x > 0 ? eur(x) : null; }),
    expl: 'Retrouve d\'abord le prix HT en divisant le TTC par 1 + taux de TVA, puis fais la différence TTC − HT. Ici HT = ' + eur(TTC) + ' ÷ ' + k + ' = ' + eur(HT) + ', donc TVA = ' + eur(TTC) + ' − ' + eur(HT) + ' = ' + eur(tva) + '.' + div + ' Piège : ' + nb(tau) + ' % de ' + eur(TTC) + ' = ' + eur(TTC * tau / 100) + ' est faux, car la TVA est un pourcentage du prix HT.'
  };
}

function n2Init(R){
  const t = R.pick([10, 20, 25, 40, 50, 60, 75]), hausse = R.int(0, 1) === 1;
  const I = R.pick([40, 60, 80, 100, 120, 160, 200, 240, 300, 400, 500, 800]);
  const c = hausse ? 100 + t : 100 - t, F = I * c / 100, ctx = R.int(0, 1);
  let q;
  if (hausse) q = ctx ? 'Après une augmentation de ' + t + ' %, une facture d\'électricité s\'élève à ' + eur(F) + '. Quel était son montant avant l\'augmentation ?' : 'Après une hausse de ' + t + ' %, un abonnement coûte ' + eur(F) + '. Combien coûtait-il avant la hausse ?';
  else q = ctx ? 'Après une baisse de ' + t + ' %, une action vaut ' + eur(F) + '. Combien valait-elle avant la baisse ?' : 'Après une remise de ' + t + ' %, un manteau est vendu ' + eur(F) + '. Quel était son prix avant la remise ?';
  const piege = F * (hausse ? 100 - t : 100 + t) / 100;
  const autres = (hausse ? [piege, F - t, F * 100 / (100 - t)] : [piege, F + t, F * 100 / (100 + t)]).filter(v => v > 0 && dec1(v)).map(eur);
  return {
    q, a: eur(I), accept: null,
    choix: qcm(eur(I), autres, j => { const x = I + alt(j) * (I >= 100 ? 20 : 5); return x > 0 ? eur(x) : null; }),
    expl: 'Pour retrouver la valeur de départ, on divise la valeur finale par le coefficient multiplicateur de l\'évolution ; on ne lui applique pas l\'évolution contraire. Le coefficient vaut ' + nb(c / 100) + ', donc ' + eur(F) + ' ÷ ' + nb(c / 100) + ' = ' + eur(I) + (DIV[c] ? ' (' + DIV[c] + ')' : '') + '. Vérification : ' + eur(I) + ' × ' + nb(c / 100) + ' = ' + eur(F) + '. Piège : ' + (hausse ? 'retirer ' : 'ajouter ') + t + ' % à ' + eur(F) + ' donne ' + eur(piege) + ', car ce pourcentage porte sur la valeur de départ, pas sur la valeur finale.'
  };
}

function n2Recip(R){
  const P = R.pick([[20, 25], [50, 100], [60, 150], [75, 300], [80, 400], [37.5, 60]]), baisseDabord = R.int(0, 1) === 1;
  const t1 = baisseDabord ? P[0] : P[1], t2 = baisseDabord ? P[1] : P[0], ctx = R.int(0, 2);
  const c1 = baisseDabord ? (100 - t1) / 100 : (100 + t1) / 100;
  let q;
  if (ctx === 0) q = 'Le cours d\'une action ' + (baisseDabord ? 'baisse' : 'augmente') + ' de ' + nb(t1) + ' %. De quel pourcentage doit-il ' + (baisseDabord ? 'augmenter' : 'baisser') + ' pour retrouver sa valeur de départ ?';
  else if (ctx === 1) q = 'Le prix d\'un produit ' + (baisseDabord ? 'baisse' : 'augmente') + ' de ' + nb(t1) + ' %. Quelle évolution faut-il ensuite lui appliquer pour revenir au prix initial ?';
  else q = 'La fréquentation d\'un site internet ' + (baisseDabord ? 'baisse' : 'augmente') + ' de ' + nb(t1) + ' %. Quelle évolution doit-elle ensuite connaître pour revenir à son niveau initial ?';
  const bonne = baisseDabord ? evo(t2) : evo(-t2);
  const autres = baisseDabord ? [t1, 100 / c1, t1 + t1 * t1 / 100, 2 * t1].filter(v => v > 0 && dec2(v)).map(evo) : [-100 / c1, -t1, -t1 / 2].filter(v => v < 0 && v >= -100 && dec2(v)).map(evo);
  return {
    q, a: bonne, accept: null,
    choix: qcm(bonne, autres, k => { const x = (baisseDabord ? t2 : -t2) + alt(k) * 5; return baisseDabord ? (x > 0 ? evo(x) : null) : (x < 0 && x > -100 ? evo(x) : null); }),
    expl: 'Le coefficient qui annule une évolution est l\'inverse du premier coefficient : 1 divisé par ce coefficient. Le premier coefficient vaut ' + coefTxt(c1) + ', son inverse vaut ' + coefTxt(1 / c1) + ', soit une évolution de ' + bonne + '. Vérification : ' + nb(c1, 3) + ' × ' + nb(1 / c1, 3) + ' = 1. Piège : ' + (baisseDabord ? 'une hausse de ' + nb(t1) + ' % ne compense pas, car elle s\'applique à une valeur plus petite que la valeur de départ ; et ' + evo(100 / c1) + ' confond le coefficient ' + nb(1 / c1, 3) + ' avec le taux.' : (t1 < 100 ? 'une baisse de ' + nb(t1) + ' % ne compense pas, car elle s\'applique à une valeur plus grande que la valeur de départ ; et ' : (t1 === 100 ? 'une baisse de 100 % ferait tout disparaître ; et ' : 'une baisse de ' + nb(t1) + ' % est impossible, puisqu\'une baisse de 100 % fait déjà tout disparaître ; et ')) + 'le coefficient ' + nb(1 / c1, 3) + ' signifie qu\'il reste ' + pct(100 / c1) + ' de la valeur, donc une baisse de ' + pct(t2) + '.')
  };
}

function n2Points(R){
  const s = tirer(() => {
    const p1 = R.pick([4, 5, 8, 10, 12, 15, 16, 20, 24, 25, 30, 40, 50, 60]), e = R.pick([-50, -40, -25, -20, 20, 25, 40, 50]);
    const p2 = p1 * (100 + e) / 100;
    return ent(p2) && p2 > 0 && p2 < 100 ? {p1, e, p2} : null;
  }) || {p1: 20, e: 25, p2: 25};
  const {p1, e, p2} = s;
  const ctx = p1 > 30 ? R.int(1, 3) : R.int(0, 3);
  const sujet = ['Le taux de chômage d\'une région passe', 'La part des ventes en ligne d\'une enseigne passe', 'Le taux d\'abstention à une élection passe', 'La part de marché d\'une marque passe'][ctx];
  const q = sujet + ' de ' + p1 + ' % à ' + p2 + ' %. Quelle est son évolution en pourcentage (et non en points) ?';
  return {
    q, a: evo(e), accept: null,
    choix: qcm(evo(e), [p2 - p1, (p2 - p1) / p2 * 100, (e > 0 ? 1 : -1) * p2 / p1 * 100].filter(v => v > -100).map(evo), k => { const v = e + alt(k) * 5; return v > -100 ? evo(v) : null; }),
    expl: 'Un écart en points est la simple différence de deux taux ; une évolution en pourcentage s\'obtient en divisant cet écart par le taux de départ. Écart : ' + p2 + ' − ' + p1 + ' = ' + nb(p2 - p1) + (abs(p2 - p1) < 2 ? ' point' : ' points') + '. Évolution : ' + nb(p2 - p1) + ' ÷ ' + p1 + ' = ' + nb(e / 100) + ', soit ' + evo(e) + '. Piège : ' + evo(p2 - p1) + ' confond les points et les pourcentages.'
  };
}

function n2PropProp(R){
  const p1 = R.pick([20, 25, 40, 50, 60, 75, 80]), p2 = R.pick([10, 20, 25, 30, 40, 50, 60, 75, 80]), ans = p1 * p2 / 100, ctx = R.int(0, 3);
  let q;
  if (ctx === 0) q = 'Dans une entreprise, ' + p1 + ' % des salariés sont des femmes, et ' + p2 + ' % de ces femmes sont cadres. Quel pourcentage de l\'ensemble des salariés sont des femmes cadres ?';
  else if (ctx === 1) q = 'Dans un magasin, ' + p1 + ' % des clients ont une carte de fidélité ; parmi eux, ' + p2 + ' % l\'utilisent chaque semaine. Quel pourcentage de l\'ensemble des clients utilise sa carte chaque semaine ?';
  else if (ctx === 2) q = 'Dans un lycée, ' + p1 + ' % des élèves sont demi-pensionnaires, et ' + p2 + ' % des demi-pensionnaires choisissent le menu végétarien. Quel pourcentage des élèves du lycée choisit le menu végétarien à la cantine ?';
  else q = 'Lors d\'une élection, ' + p1 + ' % des inscrits ont voté, et ' + p2 + ' % des votants ont choisi la liste A. Quel pourcentage des inscrits a voté pour la liste A ?';
  return {
    q, a: pct(ans), accept: null,
    choix: qcm(pct(ans), [p1 + p2 < 100 ? pct(p1 + p2) : null, p1 !== p2 ? pct(abs(p1 - p2)) : null, pct((p1 + p2) / 2), pct(p2)], k => { const x = ans + alt(k) * 5; return x > 0 && x < 100 ? pct(x) : null; }),
    expl: 'Une proportion d\'une proportion se calcule en multipliant les deux proportions. Ici ' + p2 + ' % de ' + p1 + ' %, c\'est ' + nb(p2 / 100) + ' × ' + nb(p1 / 100) + ' = ' + nb(ans / 100, 4) + ', soit ' + pct(ans) + '. Sur une base de 100 : ' + p1 + ' sont dans le premier groupe, et ' + p2 + ' % d\'entre eux font ' + nb(ans) + '. Piège : additionner ou soustraire les deux pourcentages n\'a pas de sens, car ils ne portent pas sur le même ensemble.'
  };
}

/* =========================== NIVEAU 3 =========================== */
function n3Aire(R){
  const t = R.pick([10, 20, 30, 40, 50, -10, -20, -30, -40, -50]), ctx = R.int(0, 3);
  const fig = ['Le côté d\'un carré', 'Le rayon d\'un disque', 'La longueur et la largeur d\'un rectangle', 'Le diamètre d\'une tarte'][ctx];
  const nom = ['du carré', 'du disque', 'du rectangle', 'de la tarte'][ctx];
  const verb = t > 0 ? (ctx === 2 ? 'augmentent toutes les deux' : 'augmente') : (ctx === 2 ? 'diminuent toutes les deux' : 'diminue');
  const c = (100 + t) / 100, g = (100 + t) * (100 + t) / 100 - 100;
  return {
    q: fig + ' ' + verb + ' de ' + abs(t) + ' %. Quelle est l\'évolution de l\'aire ' + nom + ' ?', a: evo(g), accept: null,
    choix: qcm(evo(g), [evo(2 * t), evo(t), evo((t > 0 ? 1 : -1) * (100 + t) * (100 + t) / 100)], k => evo(g + alt(k) * 2)),
    expl: 'Une aire est le produit de deux longueurs : si chaque longueur est multipliée par un coefficient k, l\'aire est multipliée par k². Ici k = ' + nb(c) + ' et k² = ' + nb(c) + ' × ' + nb(c) + ' = ' + nb(c * c, 4) + ', soit une évolution de ' + evo(g) + '. Piège : ' + evo(2 * t) + ' additionne deux fois le taux, en oubliant que les deux évolutions se multiplient.'
  };
}

function n3Marge(R){
  const P = R.pick([[25, 20], [100, 50], [60, 37.5], [150, 60], [300, 75], [400, 80]]), m = P[0], s = P[1];
  const pro = R.pick([['Un fleuriste', 'des bouquets'], ['Une libraire', 'des livres'], ['Un caviste', 'des bouteilles'], ['Une créatrice', 'des bijoux']]);
  if (R.int(0, 1) === 0){
    return {
      q: pro[0] + ' achète ' + pro[1] + ' et les revend ' + nb(m) + ' % plus cher que leur prix d\'achat. Quel pourcentage du prix de vente son bénéfice représente-t-il ?', a: pct(s), accept: null,
      choix: qcm(pct(s), [m, 100 - s, 100 - m, m / 2, s / 2].filter(v => v > 0 && v < 100).map(pct), k => { const x = s + alt(k) * 5; return x > 0 && x < 100 ? pct(x) : null; }),
      expl: 'Pars d\'un prix d\'achat de 100 €, calcule le bénéfice et le prix de vente en euros, puis rapporte le bénéfice au prix de vente. Achat 100 €, vente ' + eur(100 + m) + ', bénéfice ' + eur(m) + '. Part du prix de vente : ' + nb(m) + ' ÷ ' + nb(100 + m) + ' = ' + nb(s / 100, 3) + ', soit ' + pct(s) + '. Piège : ' + pct(m) + ' est le bénéfice rapporté au prix d\'achat, pas au prix de vente.'
    };
  }
  return {
    q: pro[0] + ' vend ' + pro[1] + ' ; sur chaque vente, son bénéfice représente ' + nb(s) + ' % du prix de vente. De quel pourcentage son prix de vente dépasse-t-il son prix d\'achat ?', a: pct(m), accept: null,
    choix: qcm(pct(m), [s, 100 - s, 2 * s, 100 + s].filter(v => v > 0).map(pct), k => { const x = m + alt(k) * 5; return x > 0 ? pct(x) : null; }),
    expl: 'Pars d\'un prix de vente de 100 €, calcule le bénéfice et le prix d\'achat en euros, puis rapporte le bénéfice au prix d\'achat. Vente 100 €, bénéfice ' + eur(s) + ', achat ' + eur(100 - s) + '. Hausse par rapport à l\'achat : ' + nb(s) + ' ÷ ' + nb(100 - s) + ' = ' + nb(m / 100) + ', soit ' + pct(m) + '. Piège : ' + pct(s) + ' est le bénéfice rapporté au prix de vente ; rapporté au prix d\'achat, plus petit, il fait un pourcentage plus grand.'
  };
}

function n3Pond(R){
  const s = tirer(() => {
    const p = R.pick([20, 25, 40, 60, 75, 80]), rA = R.pick([10, 20, 30, 40, 50, 60, 70, 80, 90]), rB = R.pick([10, 20, 30, 40, 50, 60, 70, 80, 90]);
    return abs(rA - rB) >= 20 ? {p, rA, rB} : null;
  }) || {p: 40, rA: 30, rB: 50};
  const {p, rA, rB} = s, ans = (p * rA + (100 - p) * rB) / 100, ctx = R.int(0, 2);
  let q;
  if (ctx === 0) q = 'Dans un lycée, ' + p + ' % des élèves sont en voie technologique. ' + rA + ' % des élèves de voie technologique déjeunent à la cantine, contre ' + rB + ' % des autres élèves. Quel pourcentage de l\'ensemble des élèves déjeune à la cantine ?';
  else if (ctx === 1) q = 'Une enseigne réalise ' + p + ' % de ses ventes en ligne et le reste en magasin. ' + rA + ' % des ventes en ligne donnent lieu à un avis client, contre ' + rB + ' % des ventes en magasin. Quel pourcentage de l\'ensemble des ventes donne lieu à un avis client ?';
  else q = 'Dans une ville, ' + p + ' % des habitants ont moins de 30 ans. ' + rA + ' % des moins de 30 ans prennent les transports en commun chaque jour, contre ' + rB + ' % des autres habitants. Quel pourcentage des habitants prend les transports en commun chaque jour ?';
  return {
    q, a: pct(ans), accept: null,
    choix: qcm(pct(ans), [pct((rA + rB) / 2), pct((p * rB + (100 - p) * rA) / 100), pct(p * rA / 100)], k => { const x = ans + alt(k) * 3; return x > 0 && x < 100 ? pct(x) : null; }),
    expl: 'Le pourcentage global est une moyenne des deux pourcentages, pondérée par la taille de chaque groupe. Sur une base de 100 : ' + p + ' × ' + nb(rA / 100) + ' = ' + nb(p * rA / 100) + ', et ' + (100 - p) + ' × ' + nb(rB / 100) + ' = ' + nb((100 - p) * rB / 100) + ' ; au total ' + nb(ans) + ' sur 100, soit ' + pct(ans) + '. Piège : la moyenne simple ' + pct((rA + rB) / 2) + ' oublie que les deux groupes n\'ont pas la même taille.'
  };
}

function n3Promo(R){
  /* [texte de l'offre, articles achetés, articles payés (en équivalent plein tarif), taux affiché ou null] */
  const O = R.pick([
    ['le 2e article à −50 %', 2, 1.5, 50], ['le 2e article à −40 %', 2, 1.6, 40], ['le 2e article à −60 %', 2, 1.4, 60], ['le 2e article à −30 %', 2, 1.7, 30], ['le 2e article à −70 %', 2, 1.3, 70], ['le 2e article à −80 %', 2, 1.2, 80],
    ['le 3e article à −60 %', 3, 2.4, 60], ['le 3e article à −30 %', 3, 2.7, 30], ['le 3e article à −90 %', 3, 2.1, 90], ['le 3e article à −75 %', 3, 2.25, 75], ['le 3e article à −45 %', 3, 2.55, 45],
    ['4 articles pour le prix de 3', 4, 3, null], ['5 articles pour le prix de 4', 5, 4, null], ['10 articles pour le prix de 8', 10, 8, null], ['8 articles pour le prix de 6', 8, 6, null], ['le 4e article offert', 4, 3, null], ['le 5e article offert', 5, 4, null]
  ]);
  const item = R.pick(['tee-shirts', 'pots de confiture', 'cahiers', 'paquets de café', 'bouteilles de jus de fruits']);
  const N = O[1], paye = O[2], red = (N - paye) / N * 100;
  const autres = O[3] !== null ? [O[3], O[3] / (N - 1), 100 - red] : [(N - paye) / paye * 100, paye / N * 100, (N - paye) * 10];
  return {
    q: 'Un magasin propose l\'offre « ' + O[0] + ' » sur des ' + item + ' de même prix. Un client en achète exactement ' + N + '. Quel pourcentage de réduction obtient-il sur le prix total ?', a: pct(red), accept: null,
    choix: qcm(pct(red), autres.filter(v => v > 0 && v < 100).map(pct), k => { const x = red + alt(k) * 5; return x > 0 && x < 100 ? pct(x) : null; }),
    expl: 'Prends un prix de 100 € par article, calcule ce que paie le client, puis compare l\'économie au prix total sans réduction. Sans réduction : ' + N + ' × 100 € = ' + eur(100 * N) + '. Avec l\'offre : ' + eur(100 * paye) + '. Économie : ' + eur(100 * (N - paye)) + ' sur ' + eur(100 * N) + ', soit ' + pct(red) + '. Piège : ' + (O[3] !== null ? 'la réduction de ' + O[3] + ' % ne porte que sur un article, pas sur tout l\'achat.' : 'rapporter l\'économie au prix payé (' + pct((N - paye) / paye * 100) + ') au lieu du prix total sans réduction.')
  };
}

function n3Dilu(R){
  const s = tirer(() => {
    const M = R.pick([100, 200, 300, 400, 500, 600, 800, 1000, 1200]);
    const p1 = R.pick([4, 5, 6, 8, 10, 12, 15, 16, 20, 24, 25, 30, 40]), p2 = R.pick([4, 5, 6, 8, 10, 12, 15, 16, 20, 24, 25, 30, 40, 50]);
    if (p1 === p2) return null;
    const sol = M * p1 / 100; if (!ent(sol)) return null;
    const T = sol * 100 / p2; if (!ent(T)) return null;
    const d = abs(T - M);
    if (d > 3000 || d < 10) return null;
    return {M, p1, p2, sol, T, d, ajout: p2 < p1};
  }) || {M: 300, p1: 20, p2: 15, sol: 60, T: 400, d: 100, ajout: true};
  const {M, p1, p2, sol, T, d, ajout} = s, ctx = R.int(0, 1), g = x => nb(x) + ' g';
  let q, matiere;
  if (ajout){
    matiere = ctx ? 'sel' : 'sucre';
    q = ctx ? 'Une saumure de ' + g(M) + ' contient ' + p1 + ' % de sel. On y ajoute de l\'eau pure jusqu\'à ce que le sel ne représente plus que ' + p2 + ' % de la masse. Quelle masse d\'eau a-t-on ajoutée ?'
            : 'Un sirop de ' + g(M) + ' contient ' + p1 + ' % de sucre. On ajoute de l\'eau jusqu\'à ce que le sucre ne représente plus que ' + p2 + ' % de la masse totale. Quelle masse d\'eau a-t-on ajoutée ?';
  } else {
    matiere = ctx ? 'sucre' : 'sel';
    q = ctx ? 'Un jus de ' + g(M) + ' contient ' + p1 + ' % de sucre. On le fait réduire à la casserole jusqu\'à ce que le sucre représente ' + p2 + ' % de la masse. Quelle masse d\'eau s\'est évaporée ?'
            : 'Une eau salée de ' + g(M) + ' contient ' + p1 + ' % de sel. On la fait chauffer : une partie de l\'eau s\'évapore, et le sel représente alors ' + p2 + ' % de la masse. Quelle masse d\'eau s\'est évaporée ?';
  }
  const autres = [T, M * abs(p1 - p2) / 100, M * abs(p1 - p2) / p1].filter(v => v > 0 && ent(v) && (ajout || v < M)).map(g);
  return {
    q, a: g(d), accept: null,
    choix: qcm(g(d), autres, k => { const x = d + alt(k) * 10; return x > 0 ? g(x) : null; }),
    expl: 'La masse de ' + matiere + ' ne change pas : calcule-la, puis cherche la masse totale dans laquelle elle représente le nouveau pourcentage. Masse de ' + matiere + ' : ' + p1 + ' % de ' + g(M) + ' = ' + g(sol) + '. Ces ' + g(sol) + ' doivent représenter ' + p2 + ' % du total, donc le total vaut ' + nb(sol) + ' ÷ ' + nb(p2 / 100) + ' = ' + g(T) + '. ' + (ajout ? 'On a ajouté ' + nb(T) + ' − ' + nb(M) : 'Il s\'est évaporé ' + nb(M) + ' − ' + nb(T)) + ' = ' + g(d) + '. Piège : ' + (T !== d ? g(T) + ' est la masse finale, pas la masse ' + (ajout ? 'ajoutée' : 'évaporée') + ' ; et ' : '') + 'l\'écart de ' + abs(p1 - p2) + (abs(p1 - p2) < 2 ? ' point' : ' points') + ' appliqué à ' + g(M) + ' (' + g(M * abs(p1 - p2) / 100) + ') ne veut rien dire, car le total change en même temps.'
  };
}

function n3Rep(R){
  const C = R.pick([[5, 2], [10, 2], [10, 3], [20, 2], [20, 3], [30, 2], [30, 3], [50, 2], [50, 3], [-5, 2], [-10, 2], [-10, 3], [-20, 2], [-20, 3], [-30, 2], [-30, 3], [-50, 2], [-50, 3]]);
  const t = C[0], n = C[1], c = (100 + t) / 100;
  const glob = m => (Math.pow(100 + t, m) / Math.pow(100, m - 1)) - 100;
  const g = glob(n), ctx = R.int(0, 2);
  let q;
  if (t > 0) q = t <= 10 ? ['Un placement rapporte ' + t + ' % d\'intérêts composés par an pendant ' + n + ' ans.', 'Le loyer d\'un appartement augmente de ' + t + ' % par an pendant ' + n + ' ans.', 'Le nombre d\'abonnés d\'une chaîne augmente de ' + t + ' % chaque mois pendant ' + n + ' mois.'][ctx]
                        : ['Le chiffre d\'affaires d\'une jeune entreprise augmente de ' + t + ' % par an pendant ' + n + ' ans.', 'Le nombre de visiteurs d\'un site augmente de ' + t + ' % chaque semaine pendant ' + n + ' semaines.', 'Le nombre d\'abonnés d\'une chaîne augmente de ' + t + ' % chaque mois pendant ' + n + ' mois.'][ctx];
  else q = t >= -30 ? ['Une voiture perd ' + (-t) + ' % de sa valeur chaque année pendant ' + n + ' ans.', 'Le nombre d\'abonnés d\'une chaîne baisse de ' + (-t) + ' % chaque mois pendant ' + n + ' mois.', 'Le prix d\'un modèle de téléphone baisse de ' + (-t) + ' % chaque année pendant ' + n + ' ans.'][ctx]
                    : ['La quantité d\'un médicament dans le sang diminue de ' + (-t) + ' % chaque heure pendant ' + n + ' heures.', 'Le nombre d\'abonnés d\'une chaîne baisse de ' + (-t) + ' % chaque mois pendant ' + n + ' mois.', 'La masse d\'un glaçon diminue de ' + (-t) + ' % chaque quart d\'heure pendant ' + n + ' quarts d\'heure.'][ctx];
  q += ' Quelle est l\'évolution globale sur toute la période ?';
  return {
    q, a: evo(g), accept: null,
    choix: qcm(evo(g), [n * t, glob(n - 1), glob(n + 1)].filter(v => v > -100 && dec2(v)).map(evo), k => { const v = g + alt(k) * 3; return v > -100 ? evo(v) : null; }),
    expl: 'Répéter la même évolution revient à multiplier plusieurs fois par le même coefficient, donc par une puissance de ce coefficient. Coefficient : ' + nb(c) + ' ; ' + nb(c) + (n === 2 ? '²' : '³') + ' = ' + nb(Math.pow(c, n), 4) + ', soit une évolution de ' + evo(g) + '. Piège : additionner les taux donne ' + evo(n * t) + (n * t <= -100 ? ', soit une disparition complète, ce qui est absurde' : '') + ', alors que chaque évolution s\'applique à une valeur qui a déjà changé.'
  };
}

function n3Produit(R){
  const a = R.pick([10, 20, 25, 30, 40, 50]), b = R.pick([10, 20, 25, 30, 40, 50]);
  const x = R.pick([1, -1]) * a, y = R.pick([1, -1]) * b, g = x + y + x * y / 100, ctx = R.int(0, 3);
  let q, prod;
  if (ctx === 0){ q = 'La longueur d\'un rectangle ' + verbe(x) + ' de ' + a + ' % et sa largeur ' + verbe(y) + ' de ' + b + ' %. Quelle est l\'évolution de l\'aire du rectangle ?'; prod = 'aire = longueur × largeur'; }
  else if (ctx === 1){ q = 'Le nombre de clients d\'un restaurant ' + verbe(x) + ' de ' + a + ' %, et le montant moyen dépensé par client ' + verbe(y) + ' de ' + b + ' %. Quelle est l\'évolution du chiffre d\'affaires du restaurant ?'; prod = 'chiffre d\'affaires = nombre de clients × montant moyen'; }
  else if (ctx === 2){ q = 'Une usine ' + (x > 0 ? 'augmente' : 'baisse') + ' le prix de vente de ses pièces de ' + a + ' % et vend ' + b + ' % de pièces ' + (y > 0 ? 'en plus' : 'en moins') + '. Quelle est l\'évolution de sa recette ?'; prod = 'recette = prix × quantité vendue'; }
  else { q = 'Le salaire horaire d\'un intérimaire ' + verbe(x) + ' de ' + a + ' % et son nombre d\'heures travaillées par mois ' + verbe(y) + ' de ' + b + ' %. Quelle est l\'évolution de sa paie mensuelle ?'; prod = 'paie = salaire horaire × nombre d\'heures'; }
  return {
    q, a: evo(g), accept: null,
    choix: qcm(evo(g), [evo(x + y), -g > -100 ? evo(-g) : null, x + y - x * y / 100 > -100 ? evo(x + y - x * y / 100) : null], k => { const v = g + alt(k); return v > -100 ? evo(v) : null; }),
    expl: 'La grandeur étudiée est le produit de deux grandeurs, donc son coefficient est le produit des deux coefficients. Ici ' + prod + ' : ' + nb(1 + x / 100) + ' × ' + nb(1 + y / 100) + ' = ' + nb(1 + g / 100, 4) + ', soit une évolution de ' + evo(g) + '. Piège : additionner les taux donne ' + evo(x + y) + ', ce qui oublie que la seconde évolution porte sur une valeur déjà modifiée.'
  };
}

/* =========================== NIVEAU 4 =========================== */
function n4Sech(R){
  const S = R.pick(SECHAGE), p1 = S[0], p2 = S[1], f = S[2];
  const M = tirer(() => { const m = R.pick([10, 20, 40, 50, 60, 80, 100, 120, 200, 500]); return dec1(m * f) ? m : null; }) || 100;
  const m = M * f, dry = M * (100 - p1) / 100, F = R.pick(FRUITS), X = F[0], kg = x => nb(x) + ' kg';
  const piegeTxt = ' Piège : passer de ' + p1 + ' % à ' + p2 + ' % d\'eau ne fait pas perdre ' + (p1 - p2) + ' % de la masse ; c\'est la part de matière sèche qui passe de ' + (100 - p1) + ' % à ' + (100 - p2) + ' %, donc la masse est divisée par ' + nb(1 / f) + '.';
  const meth = 'La matière sèche (tout sauf l\'eau) ne change pas pendant le séchage : calcule-la, puis cherche la masse totale dont elle représente la nouvelle part.';
  if (R.int(0, 2) < 2){
    return {
      q: 'On fait sécher ' + kg(M) + ' ' + de(X) + ' qui contiennent ' + p1 + ' % d\'eau. Après séchage, l\'eau ne représente plus que ' + p2 + ' % de leur masse. Quelle est alors la masse des ' + X + ' ?', a: kg(m), accept: null,
      choix: qcm(kg(m), [M * (100 - (p1 - p2)) / 100, dry, M * p2 / p1].filter(v => v > 0 && dec2(v)).map(kg), k => { const x = m + alt(k) * (m >= 10 ? 5 : 0.5); return x > 0 ? kg(x) : null; }),
      expl: meth + ' Matière sèche : ' + (100 - p1) + ' % de ' + kg(M) + ' = ' + kg(dry) + '. Après séchage, l\'eau fait ' + p2 + ' %, donc la matière sèche fait ' + (100 - p2) + ' % de la masse : masse = ' + nb(dry) + ' ÷ ' + nb((100 - p2) / 100) + ' = ' + kg(m) + '.' + piegeTxt
    };
  }
  const frais = accord(F[1], 'frais', 'fraîches'), seches = accord(F[1], 'séchés', 'séchées'), ils = accord(F[1], 'ils', 'elles');
  return {
    q: 'Après séchage, on obtient ' + kg(m) + ' ' + de(X) + ' ' + seches + ' qui contiennent encore ' + p2 + ' % d\'eau. ' + (F[1] === 'f' ? 'Fraîches' : 'Frais') + ', ' + ils + ' contenaient ' + p1 + ' % d\'eau. Quelle masse ' + de(X) + ' ' + frais + ' a-t-on mise à sécher ?', a: kg(M), accept: null,
    choix: qcm(kg(M), [m * (100 + (p1 - p2)) / 100, m * p1 / p2, m * (100 - p2) / 100].filter(v => v > 0 && dec2(v)).map(kg), k => { const x = M + alt(k) * (M >= 200 ? 50 : M >= 20 ? 5 : 1); return x > 0 ? kg(x) : null; }),
    expl: meth + ' Matière sèche : ' + (100 - p2) + ' % de ' + kg(m) + ' = ' + kg(m * (100 - p2) / 100) + '. Avant séchage, elle ne faisait que ' + (100 - p1) + ' % de la masse : masse fraîche = ' + nb(m * (100 - p2) / 100) + ' ÷ ' + nb((100 - p1) / 100) + ' = ' + kg(M) + '.' + piegeTxt
  };
}

function n4Partir(R){
  const ctx = R.int(0, 3), depart = ctx < 2;
  const s = tirer(() => {
    const N = R.pick(ctx === 1 ? [20, 40, 50, 60, 80, 100] : ctx === 3 ? [40, 50, 60, 80, 100, 120, 200] : [50, 80, 100, 120, 150, 200, 300, 400, 500]);
    const p1 = R.pick([10, 20, 25, 40, 50, 60, 75, 80, 90, 95, 96, 98, 99]), p2 = R.pick([10, 20, 25, 40, 50, 60, 75, 80, 90, 95, 96, 98]);
    if (depart ? p2 >= p1 : p2 <= p1) return null;
    const X = N * p1 / 100, O = N - X;
    if (!ent(X) || O <= 0 || X <= 0) return null;
    const T = O * 100 / (100 - p2);
    if (!ent(T)) return null;
    const d = abs(N - T);
    if (d === 0 || T > 6 * N) return null;
    return {N, p1, p2, X, O, T, d};
  }) || (depart ? {N: 100, p1: 90, p2: 80, X: 90, O: 10, T: 50, d: 50} : {N: 100, p1: 20, p2: 50, X: 20, O: 80, T: 160, d: 60});
  const {N, p1, p2, X, O, T, d} = s;
  let q, autresNom;
  if (ctx === 0){ q = 'Dans un amphithéâtre, il y a ' + nb(N) + ' personnes, dont ' + p1 + ' % d\'étudiants de première année. Combien d\'étudiants de première année doivent sortir (personne d\'autre ne bouge) pour qu\'ils ne représentent plus que ' + p2 + ' % des personnes présentes ?'; autresNom = 'autres personnes'; }
  else if (ctx === 1){ q = 'Une corbeille contient ' + nb(N) + ' fruits, dont ' + p1 + ' % de pommes. Combien de pommes faut-il retirer pour que les pommes ne représentent plus que ' + p2 + ' % des fruits de la corbeille ?'; autresNom = 'autres fruits'; }
  else if (ctx === 2){ q = 'Une association compte ' + nb(N) + ' membres, dont ' + p1 + ' % de lycéens. Combien de nouveaux membres, tous lycéens, faut-il accueillir pour que les lycéens représentent ' + p2 + ' % des membres ?'; autresNom = 'membres non lycéens'; }
  else { q = 'Un parking contient ' + nb(N) + ' voitures, dont ' + p1 + ' % de voitures électriques. Combien de voitures électriques doivent encore arriver, sans qu\'aucune autre voiture n\'entre ni ne sorte, pour que les électriques représentent ' + p2 + ' % des voitures ?'; autresNom = 'voitures non électriques'; }
  const points = N * abs(p1 - p2) / 100;
  return {
    q, a: nb(d), accept: null,
    choix: qcm(nb(d), [points, T, O, X].filter(v => v > 0 && ent(v)).map(v => nb(v)), k => { const x = d + alt(k) * (d >= 20 ? 5 : 1); return x > 0 ? nb(x) : null; }),
    expl: 'Le nombre de ceux qui ne bougent pas reste fixe : calcule-le, puis trouve le nouveau total dans lequel ils représentent la nouvelle part. Il y a ' + nb(O) + ' ' + autresNom + ', soit ' + (100 - p1) + ' % de ' + nb(N) + '. Ces ' + nb(O) + ' doivent représenter ' + (100 - p2) + ' % du nouveau total : ' + nb(O) + ' ÷ ' + nb((100 - p2) / 100) + ' = ' + nb(T) + '. Il faut donc ' + (depart ? 'en retirer ' + nb(N) + ' − ' + nb(T) : 'en ajouter ' + nb(T) + ' − ' + nb(N)) + ' = ' + nb(d) + '. Piège : ' + nb(points) + ', c\'est ' + abs(p1 - p2) + ' % du total de départ, mais le total change en même temps.'
  };
}

function n4Manq(R){
  const s = tirer(() => {
    const a = R.pick([10, 20, 25, 50, 60, 100, -10, -20, -25, -40, -50]);
    const g = R.pick([-40, -30, -28, -25, -20, -16, -12, -10, -4, 4, 8, 10, 12, 20, 26, 35, 40, 50, 80]);
    if (g === a) return null;
    const t2 = (100 + g) * 100 / (100 + a) - 100;
    if (!dec1(t2) || abs(t2) < 1e-9 || t2 <= -100 || t2 > 200) return null;
    return {a, g, t2: Math.round(t2 * 10) / 10};
  }) || {a: 25, g: -10, t2: -28};
  const {a, g, t2} = s, ctx = R.int(0, 2);
  let q;
  if (ctx === 0) q = 'Un prix ' + verbe(a) + ' de ' + abs(a) + ' %, puis subit une seconde évolution. Au total, il a ' + (g > 0 ? 'augmenté' : 'baissé') + ' de ' + abs(g) + ' %. Quelle a été la seconde évolution ?';
  else if (ctx === 1) q = 'Le chiffre d\'affaires d\'une entreprise ' + verbe(a) + ' de ' + abs(a) + ' % la première année. Sur les deux années, il ' + (g > 0 ? 'augmente' : 'baisse') + ' de ' + abs(g) + ' % au total. Quelle a été son évolution la deuxième année ?';
  else q = 'La population d\'une commune ' + verbe(a) + ' de ' + abs(a) + ' % en dix ans, puis évolue encore la décennie suivante. Sur les vingt ans, elle a ' + (g > 0 ? 'augmenté' : 'baissé') + ' de ' + abs(g) + ' %. Quelle a été son évolution pendant la seconde décennie ?';
  const c1 = (100 + a) / 100, G = (100 + g) / 100;
  return {
    q, a: evo(t2), accept: null,
    choix: qcm(evo(t2), [g - a, -a, g].filter(v => v > -100).map(evo), k => { const v = t2 + alt(k) * 4; return v > -100 ? evo(v) : null; }),
    expl: 'Le coefficient global est le produit des deux coefficients : divise le coefficient global par le premier pour obtenir le second. Coefficient global ' + nb(G) + ', premier coefficient ' + nb(c1) + ' ; ' + nb(G) + ' ÷ ' + nb(c1) + ' = ' + nb(1 + t2 / 100, 4) + (DIV[100 + a] ? ' (' + DIV[100 + a] + ')' : '') + ', soit ' + evo(t2) + '. Vérification : ' + nb(c1) + ' × ' + nb(1 + t2 / 100, 4) + ' = ' + nb(G) + '. Piège : soustraire les taux donne ' + evo(g - a) + (g - a <= -100 ? ', une baisse impossible' : '') + ', alors que les coefficients se multiplient.'
  };
}

function n4Inverse(R){
  const ctx = R.int(0, 3);
  const P = R.pick(ctx === 1 ? [[25, -20], [60, -37.5], [100, -50], [-20, 25], [-50, 100], [-37.5, 60]] : [[25, -20], [100, -50], [60, -37.5], [150, -60], [300, -75], [-20, 25], [-50, 100], [-37.5, 60], [-60, 150], [-75, 300]]);
  const x = P[0], y = P[1], cx = (100 + x) / 100;
  let q, lien;
  if (ctx === 0){ q = 'Le prix du kilo de café ' + verbe(x) + ' de ' + nb(abs(x)) + ' %. Avec le même budget, quelle est l\'évolution de la quantité de café que l\'on peut acheter ?'; lien = 'prix × quantité = budget, qui ne change pas'; }
  else if (ctx === 1){ q = 'Sur le même trajet, un livreur ' + (x > 0 ? 'augmente' : 'réduit') + ' sa vitesse moyenne de ' + nb(abs(x)) + ' %. Quelle est l\'évolution de la durée de son trajet ?'; lien = 'vitesse × durée = distance, qui ne change pas'; }
  else if (ctx === 2){ q = 'Le nombre de pages qu\'une imprimante imprime par minute ' + verbe(x) + ' de ' + nb(abs(x)) + ' %. Quelle est l\'évolution du temps nécessaire pour imprimer un même document ?'; lien = 'cadence × temps = nombre de pages, qui ne change pas'; }
  else { q = 'Le débit d\'un robinet ' + verbe(x) + ' de ' + nb(abs(x)) + ' %. Quelle est l\'évolution du temps nécessaire pour remplir la même cuve ?'; lien = 'débit × temps = volume de la cuve, qui ne change pas'; }
  const autres = (x > 0 ? [-x, -x / 2, -(x - x * x / 100)] : [-x, -x / 2, -x * (1 - x / 100)]).filter(v => v >= -100 && abs(v) > 1e-9 && dec2(v)).map(evo);
  return {
    q, a: evo(y), accept: null,
    choix: qcm(evo(y), autres, k => { const v = y + alt(k) * 5; return v > -100 && abs(v) > 1e-9 ? evo(v) : null; }),
    expl: 'Quand le produit de deux grandeurs reste constant, le coefficient de l\'une est l\'inverse du coefficient de l\'autre. Ici ' + lien + '. Le coefficient vaut ' + coefTxt(cx) + ', son inverse vaut ' + coefTxt(1 / cx) + ', soit une évolution de ' + evo(y) + '. Vérification : ' + nb(cx, 3) + ' × ' + nb(1 / cx, 3) + ' = 1. Piège : ' + evo(-x) + ' suppose que les pourcentages se compensent, ce qui est faux' + (x >= 100 ? ' (une durée ou une quantité ne peut pas baisser de 100 % ou plus)' : '') + '.'
  };
}

function n4Egales(R){
  const s = tirer(() => {
    const k = R.pick([105, 110, 120, 125, 130, 140, 150, 200, 95, 90, 80, 75, 70, 60, 50]);
    const ctx = k > 100 ? R.pick([0, 2]) : R.pick([1, 3]);
    if (ctx === 2 && k > 130) return null;
    const P = R.pick(ctx === 1 ? [400, 800, 1600, 2000, 2500, 4000, 10000] : [100, 200, 400, 500, 800, 1000, 1600, 2000, 2500, 4000]);
    const F = P * k * k / 10000;
    return ent(F) ? {k, ctx, P, F} : null;
  }) || {k: 110, ctx: 0, P: 400, F: 484};
  const {k, ctx, P, F} = s, ans = abs(k - 100), G = abs(k * k / 100 - 100), hausse = k > 100;
  let q;
  if (ctx === 0) q = 'Un prix passe de ' + eur(P) + ' à ' + eur(F) + ' après deux hausses successives du même pourcentage. Quel est ce pourcentage ?';
  else if (ctx === 1) q = 'La population d\'un village passe de ' + nb(P) + ' à ' + nb(F) + ' habitants en deux ans, en baissant chaque année du même pourcentage. Quel est ce pourcentage de baisse annuel ?';
  else if (ctx === 2) q = 'Un capital de ' + eur(P) + ', placé à intérêts composés, devient ' + eur(F) + ' au bout de deux ans. Quel est le taux d\'intérêt annuel ?';
  else q = 'Le cours d\'une action passe de ' + eur(P) + ' à ' + eur(F) + ' après deux baisses successives du même pourcentage. Quel est ce pourcentage ?';
  return {
    q, a: pct(ans), accept: null,
    choix: qcm(pct(ans), [G / 2, G, k].filter(v => v > 0 && dec2(v)).map(pct), j => { const x = ans + alt(j); return x > 0 ? pct(x) : null; }),
    expl: 'Deux évolutions identiques de coefficient c donnent un coefficient global c² : calcule le coefficient global, puis cherche le nombre dont il est le carré. Coefficient global : ' + nb(F) + ' ÷ ' + nb(P) + ' = ' + nb(k * k / 10000, 4) + '. Or ' + nb(k / 100) + '² = ' + nb(k * k / 10000, 4) + ', donc chaque évolution multiplie par ' + nb(k / 100) + ', soit une ' + (hausse ? 'hausse' : 'baisse') + ' de ' + pct(ans) + '. Piège : diviser l\'évolution globale (' + pct(G) + ') par deux donne ' + nb(G / 2, 3) + ' %, ce qui oublie que les coefficients se multiplient' + (hausse || k === ans ? '' : ' ; et ' + pct(k) + ' est ce qui reste après chaque baisse, pas le pourcentage de baisse') + '.'
  };
}

function n4Bayes(R){
  const B = R.pick(BAYES), ctx = B[0], p = B[1], rA = B[2], rB = B[3], ans = B[4];
  /* [effectif, groupe A, groupe B, « dont … », nom complet de la propriété, part cherchée] */
  const lab = [['élèves', 'filles', 'garçons', 'internes', 'internes', 'la part des filles'], ['pièces', 'pièces de la machine A', 'pièces de la machine B', 'défectueuses', 'pièces défectueuses', 'la part de la machine A'], ['salariés', 'salariés du siège', 'autres salariés', 'cyclistes', 'cyclistes', 'la part du siège']][ctx];
  let q;
  if (ctx === 0) q = 'Dans un lycée, ' + p + ' % des élèves sont des filles. ' + rA + ' % des filles et ' + rB + ' % des garçons sont internes. Parmi les internes, quel est le pourcentage de filles ?';
  else if (ctx === 1) q = 'Une usine fabrique ' + p + ' % de ses pièces sur la machine A et le reste sur la machine B. ' + rA + ' % des pièces de A et ' + rB + ' % des pièces de B sont défectueuses. Parmi les pièces défectueuses, quel pourcentage vient de la machine A ?';
  else q = 'Dans une entreprise, ' + p + ' % des salariés travaillent au siège. ' + rA + ' % des salariés du siège et ' + rB + ' % des autres salariés viennent travailler à vélo. Parmi les salariés qui viennent à vélo, quel pourcentage travaille au siège ?';
  const nA = 100 * p, nB = 100 * (100 - p), hA = p * rA, hB = (100 - p) * rB;
  return {
    q, a: pct(ans), accept: null,
    choix: qcm(pct(ans), [p * rA / 100, rA, p, 100 * rA / (rA + rB)].filter(v => v > 0 && v < 100 && dec2(v)).map(pct), k => { const x = ans + alt(k) * 5; return x > 0 && x < 100 ? pct(x) : null; }),
    expl: 'Raisonne sur un effectif concret de 10 000 ' + lab[0] + ' : compte ceux qui ont la propriété dans chaque groupe, puis calcule la part du premier groupe parmi eux. Il y a ' + nb(nA) + ' ' + lab[1] + ', dont ' + nb(hA) + ' ' + lab[3] + ', et ' + nb(nB) + ' ' + lab[2] + ', dont ' + nb(hB) + ' ' + lab[3] + '. Parmi les ' + nb(hA + hB) + ' ' + lab[4] + ', ' + lab[5] + ' vaut ' + nb(hA) + ' ÷ ' + nb(hA + hB) + ' = ' + pct(ans) + '. Piège : ' + pct(rA) + ' est la part des ' + lab[4] + ' parmi les ' + lab[1] + ', c\'est la question à l\'envers.'
  };
}

/* =========================== NIVEAU 5 =========================== */
function n5Ratio(R){
  const T = R.pick(RAPPORTS), p = T[0], q2 = T[1], r = T[2], ctx = R.int(0, 3);
  const L = [['cadres', 'non-cadres', 'le salaire moyen'], ['foyers aisés', 'autres foyers', 'le revenu moyen'], ['clients fidèles', 'autres clients', 'la dépense moyenne'], ['membres premium', 'autres membres', 'la cotisation moyenne']][ctx];
  let q;
  if (ctx === 0) q = 'Dans une entreprise, les cadres représentent ' + p + ' % des salariés et perçoivent ' + q2 + ' % de la masse salariale (la somme de tous les salaires). Par combien faut-il multiplier le salaire moyen d\'un non-cadre pour obtenir le salaire moyen d\'un cadre ?';
  else if (ctx === 1) q = 'Dans un pays, les ' + p + ' % des foyers les plus aisés perçoivent ' + q2 + ' % du revenu total. Par combien faut-il multiplier le revenu moyen d\'un autre foyer pour obtenir le revenu moyen d\'un foyer aisé ?';
  else if (ctx === 2) q = 'Dans un magasin, les clients fidèles représentent ' + p + ' % des clients et réalisent ' + q2 + ' % du chiffre d\'affaires. Par combien faut-il multiplier la dépense moyenne d\'un autre client pour obtenir celle d\'un client fidèle ?';
  else q = 'Dans un club de sport, les membres premium représentent ' + p + ' % des membres et apportent ' + q2 + ' % des cotisations. Par combien faut-il multiplier la cotisation moyenne d\'un autre membre pour obtenir celle d\'un membre premium ?';
  return {
    q, a: nb(r), accept: null,
    choix: qcm(nb(r), [q2 / p, (100 - p) / (100 - q2), q2 / (100 - q2)].filter(v => v > 1 && dec2(v)).map(v => nb(v)), k => { const x = r + alt(k) * 0.5; return x > 1 ? nb(x) : null; }),
    expl: 'Prends un groupe de 100 et un total de 100 à partager : calcule la moyenne de chaque groupe, puis divise l\'une par l\'autre. Les ' + p + ' ' + L[0] + ' se partagent ' + q2 + ', soit ' + q2 + '/' + p + ' chacun ; les ' + (100 - p) + ' ' + L[1] + ' se partagent ' + (100 - q2) + ', soit ' + (100 - q2) + '/' + (100 - p) + ' chacun. Rapport : (' + q2 + '/' + p + ') × (' + (100 - p) + '/' + (100 - q2) + ') = ' + nb(r) + '. Piège : ' + q2 + ' ÷ ' + p + ' = ' + nb(q2 / p, 4) + ' compare ' + L[2] + ' des ' + L[0] + ' à la moyenne de tout le monde, pas à celle des ' + L[1] + '.'
  };
}

function n5Melange(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2);
    const V = R.pick(ctx === 2 ? [20, 30, 40, 50, 60, 80, 100, 200] : [2, 3, 4, 5, 6, 8, 10, 12, 15, 20]);
    const c1 = R.pick([5, 10, 15, 20, 25, 30, 40, 50, 60]);
    const c2 = ctx === 0 ? 100 : R.pick([40, 50, 60, 70, 75, 80, 90]);
    const c3 = R.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 75, 80]);
    if (!(c1 < c3 && c3 < c2)) return null;
    const x = V * (c3 - c1) / (c2 - c3);
    if (!ent(x) || x <= 0 || x > 8 * V) return null;
    return {ctx, V, c1, c2, c3, x};
  }) || {ctx: 1, V: 10, c1: 20, c2: 50, c3: 30, x: 5};
  const {ctx, V, c1, c2, c3, x} = s, u = ctx === 2 ? ' g' : ' L', w = v => nb(v) + u;
  let q, pur;
  if (ctx === 0){ q = 'Un nectar de ' + w(V) + ' contient ' + c1 + ' % de jus de fruits. Combien de litres de pur jus (100 % de jus) faut-il y ajouter pour que la boisson contienne ' + c3 + ' % de jus ?'; pur = 'jus'; }
  else if (ctx === 1){ q = 'On dispose de ' + w(V) + ' d\'une solution contenant ' + c1 + ' % d\'alcool. Combien de litres d\'une solution à ' + c2 + ' % d\'alcool faut-il y ajouter pour obtenir un mélange à ' + c3 + ' % ?'; pur = 'alcool'; }
  else { q = 'Un orfèvre dispose de ' + w(V) + ' d\'un alliage contenant ' + c1 + ' % d\'or. Combien de grammes d\'un alliage à ' + c2 + ' % d\'or doit-il y fondre pour obtenir un alliage à ' + c3 + ' % d\'or ?'; pur = 'or'; }
  return {
    q, a: w(x), accept: null,
    choix: qcm(w(x), [V * (c3 - c1) / 100, V, V * (c2 - c3) / (c3 - c1), V * (c3 - c1) / c3].filter(v => v > 0 && dec1(v)).map(w), k => { const v = x + alt(k) * (x >= 10 ? 5 : 1); return v > 0 ? w(v) : null; }),
    expl: 'Dans un mélange, les quantités de produit pur s\'additionnent : écris la quantité ' + de(pur) + ' en fonction de la quantité x ajoutée, puis impose le pourcentage final. ' + pur.charAt(0).toUpperCase() + pur.slice(1) + ' : ' + nb(V * c1 / 100) + ' + ' + (c2 === 100 ? 'x' : nb(c2 / 100) + ' × x') + ' ; total : ' + nb(V) + ' + x. Équation : ' + nb(V * c1 / 100) + ' + ' + (c2 === 100 ? 'x' : nb(c2 / 100) + ' × x') + ' = ' + nb(c3 / 100) + ' × (' + nb(V) + ' + x), d\'où ' + nb((c2 - c3) / 100) + ' × x = ' + nb(V * (c3 - c1) / 100) + ' et x = ' + w(x) + '. Raccourci (règle des écarts) : x ÷ ' + nb(V) + ' = (' + c3 + ' − ' + c1 + ') ÷ (' + c2 + ' − ' + c3 + '). Piège : ' + w(V * (c3 - c1) / 100) + ' ne tient compte que de l\'écart de ' + (c3 - c1) + ' points, pas de l\'augmentation du volume total.'
  };
}

function n5Evap(R){
  const E = R.pick(EVAP), p1 = E[0], p2 = E[1], f = E[2], F = R.pick(FRUITS), X = F[0];
  const d = 100 - p1, T2 = d * 100 / (100 - p2), W2 = T2 - d;
  const frais = accord(F[1], 'frais', 'fraîches'), ils = accord(F[1], 'ils', 'elles');
  return {
    q: 'Des ' + X + ' ' + frais + ' contiennent ' + p1 + ' % d\'eau. On les fait sécher jusqu\'à ce que l\'eau ne représente plus que ' + p2 + ' % de leur masse. Quel pourcentage de l\'eau qu\'' + ils + ' contenaient au départ s\'est évaporé ?', a: pct(f), accept: null,
    choix: qcm(pct(f), [p1 - p2, 100 - T2, (p1 - p2) / p1 * 100].filter(v => v > 0 && v < 100 && dec2(v)).map(pct), k => { const x = f + alt(k) * 5; return x > 0 && x < 100 ? pct(x) : null; }),
    expl: 'Raisonne sur 100 kg de produit frais : la matière sèche ne change pas, ce qui donne la masse finale, puis compare la masse d\'eau avant et après. Sur 100 kg : ' + p1 + ' kg d\'eau et ' + d + ' kg de matière sèche. À la fin, ces ' + d + ' kg font ' + (100 - p2) + ' % de la masse, qui vaut donc ' + nb(T2) + ' kg, dont ' + nb(W2) + ' kg d\'eau. Eau évaporée : ' + p1 + ' − ' + nb(W2) + ' = ' + nb(p1 - W2) + ' kg sur ' + p1 + ' kg, soit ' + pct(f) + '. Piège : ' + pct(100 - T2) + ' est la part de la masse totale perdue, pas la part de l\'eau ; et ' + pct(p1 - p2) + ' n\'est qu\'un écart en points.'
  };
}

function n5XX(R){
  const Y = R.pick([[1, 10], [4, 20], [9, 30], [16, 40], [25, 50], [36, 60], [49, 70], [2.25, 15], [6.25, 25], [12.25, 35], [0.25, 5], [20.25, 45], [0.64, 8], [1.44, 12], [0.81, 9]]);
  const y = Y[0], x = Y[1], hb = R.int(0, 1) === 1, ctx = R.int(0, 2);
  let q;
  if (ctx === 0) q = 'Le prix d\'un article ' + (hb ? 'augmente de x %, puis baisse de x %' : 'baisse de x %, puis augmente de x %') + '. Au final, il a baissé de ' + nb(y) + ' % par rapport à son prix de départ. Quelle est la valeur de x ?';
  else if (ctx === 1) q = 'Le cours d\'une action ' + (hb ? 'monte de x % un jour, puis baisse de x % le lendemain' : 'baisse de x % un jour, puis remonte de x % le lendemain') + '. Sur les deux jours, l\'action a perdu ' + nb(y) + ' % de sa valeur. Que vaut x ?';
  else q = 'Un loyer ' + (hb ? 'augmente de x % une année, puis diminue de x % l\'année suivante' : 'diminue de x % une année, puis augmente de x % l\'année suivante') + '. Au bout des deux ans, il a diminué de ' + nb(y) + ' %. Que vaut x ?';
  const rac = Math.sqrt(y);
  return {
    q, a: nb(x), accept: null,
    choix: qcm(nb(x), [rac, y, y / 2, 2 * y, 5 * y].filter(v => v > 0 && dec2(v) && v < 100).map(v => nb(v)), k => { const v = x + alt(k) * 5; return v > 0 && v < 100 ? nb(v) : null; }),
    expl: 'Traduis les deux évolutions en coefficients : (1 + x/100) × (1 − x/100) = 1 − (x/100)², puis compare au coefficient global. Le coefficient global vaut 1 − ' + nb(y / 100, 4) + ' = ' + nb(1 - y / 100, 4) + ', donc (x/100)² = ' + nb(y / 100, 4) + ', d\'où x/100 = ' + nb(x / 100) + ' et x = ' + nb(x) + '. Vérification : ' + nb(1 + x / 100) + ' × ' + nb(1 - x / 100) + ' = ' + nb(1 - y / 100, 4) + '. Piège : ' + nb(rac) + ' vient de √' + nb(y) + ' sans le facteur 100 : c\'est (x/100)² qui vaut ' + nb(y / 100, 4) + ', pas x² qui vaut ' + nb(y) + '.'
  };
}

function n5Double(R){
  const t = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]), ctx = R.int(0, 3), c = 1 + t / 100;
  let best = 1;
  for (let n = 1; n <= 80; n++) if (abs(Math.pow(c, n) - 2) < abs(Math.pow(c, best) - 2)) best = n;
  const unite = ctx === 3 ? 'mois' : 'ans';
  let q;
  if (ctx === 0) q = 'Un capital est placé à ' + t + ' % par an, à intérêts composés. Au bout d\'environ combien d\'années aura-t-il doublé ?';
  else if (ctx === 1) q = 'La population d\'une ville augmente de ' + t + ' % par an. Au bout d\'environ combien d\'années aura-t-elle doublé ?';
  else if (ctx === 2) q = 'Les prix augmentent de ' + t + ' % par an. Au bout d\'environ combien d\'années auront-ils doublé ?';
  else q = 'Le nombre d\'utilisateurs d\'une application augmente de ' + t + ' % par mois. Au bout d\'environ combien de mois aura-t-il doublé ?';
  const u = n => nb(n) + ' ' + unite, simple = Math.round(100 / t);
  return {
    q, a: u(best), accept: null,
    choix: qcm(u(best), [u(simple), u(2 * best), u(Math.round(best / 2))], k => { const v = best + alt(k) * 4; return v > 0 ? u(v) : null; }),
    expl: 'Utilise la règle de 70 : avec une hausse de t % par période, une quantité double en environ 70 ÷ t périodes. Ici 70 ÷ ' + t + ' ≈ ' + nb(70 / t, 1) + ', donc environ ' + u(best) + '. Contrôle : ' + nb(c) + ' à la puissance ' + best + ' vaut environ ' + nb(Math.pow(c, best), 2) + '. Piège : ' + u(simple) + ' correspond à des intérêts simples (on ajouterait chaque fois ' + t + ' % du montant de départ), alors qu\'ici les hausses se composent et vont plus vite.'
  };
}

function n5Ecart(R){
  const E = R.pick(ECARTS), p = E[0], a = E[1], b = E[2], X = E[3], ctx = R.int(0, 3);
  const v = s => s > 0 ? 'augmente' : 'baisse';
  let q, A, B;
  if (ctx === 0){ q = 'Un modèle de vélo A coûtait ' + p + ' % de plus qu\'un modèle B. Ensuite, le prix de A ' + v(a) + ' de ' + abs(a) + ' % et celui de B ' + v(b) + ' de ' + abs(b) + ' %. De combien de pour cent le prix de A dépasse-t-il maintenant celui de B ?'; A = 'le prix de A'; B = 'le prix de B'; }
  else if (ctx === 1){ q = 'Le salaire de Léa dépassait de ' + p + ' % celui de Hugo. Puis le salaire de Léa ' + v(a) + ' de ' + abs(a) + ' % et celui de Hugo ' + v(b) + ' de ' + abs(b) + ' %. De combien de pour cent le salaire de Léa dépasse-t-il maintenant celui de Hugo ?'; A = 'le salaire de Léa'; B = 'le salaire de Hugo'; }
  else if (ctx === 2){ q = 'La ville A comptait ' + p + ' % d\'habitants de plus que la ville B. En dix ans, la population de A ' + v(a) + ' de ' + abs(a) + ' % et celle de B ' + v(b) + ' de ' + abs(b) + ' %. De combien de pour cent la population de A dépasse-t-elle maintenant celle de B ?'; A = 'la population de A'; B = 'la population de B'; }
  else { q = 'Le chiffre d\'affaires de l\'entreprise A dépassait de ' + p + ' % celui de l\'entreprise B. Cette année, celui de A ' + v(a) + ' de ' + abs(a) + ' % et celui de B ' + v(b) + ' de ' + abs(b) + ' %. De combien de pour cent le chiffre d\'affaires de A dépasse-t-il maintenant celui de B ?'; A = 'le chiffre d\'affaires de A'; B = 'le chiffre d\'affaires de B'; }
  const cA = (100 + a) / 100, cB = (100 + b) / 100, r0 = (100 + p) / 100, r1 = 1 + X / 100;
  const add = p + a - b, mul = (100 + p) * (100 + a) * (100 + b) / 10000 - 100, gap = p * (100 + a) / (100 + b);
  const autres = [add, mul, gap].filter(w => w > 0 && dec2(w)).map(pct);
  const A1 = (100 + p) * cA, B1 = 100 * cB;
  return {
    q, a: pct(X), accept: null,
    choix: qcm(pct(X), autres, k => { const w = X + alt(k) * 5; return w > 0 ? pct(w) : null; }),
    expl: 'Travaille sur le rapport des deux grandeurs : il est multiplié par le coefficient de la première et divisé par le coefficient de la seconde. Au départ, le rapport vaut ' + nb(r0) + '. Il devient ' + nb(r0) + ' × ' + nb(cA) + ' ÷ ' + nb(cB) + ' = ' + nb(r1, 4) + ', soit un dépassement de ' + pct(X) + '. Avec des nombres : si ' + B + ' valait 100, ' + A + ' valait ' + nb(100 + p) + ' ; ensuite ' + B + ' vaut ' + nb(B1) + ' et ' + A + ' vaut ' + nb(A1) + ', et ' + nb(A1) + ' ÷ ' + nb(B1) + ' = ' + nb(r1, 4) + '. Piège : ' + pct(add) + ' (' + p + (a > 0 ? ' + ' : ' − ') + abs(a) + (b > 0 ? ' − ' : ' + ') + abs(b) + ') additionne des pourcentages qui ne portent pas sur la même base' + (mul > 0 && dec2(mul) ? ' ; ' + pct(mul) + ' multiplie par le coefficient de la seconde grandeur au lieu de diviser' : '') + (gap > 0 && dec2(gap) ? ' ; ' + pct(gap) + ' applique les deux évolutions au seul écart de ' + p + ' %, alors qu\'elles portent sur les grandeurs entières' : '') + '.'
  };
}

/* ---------- répartition par niveau ---------- */
const NIVEAUX = [
  [n1Part, n1Appliquer, n1Coef, n1Taux, n1Prop],
  [n2Succ, n2Tva, n2Init, n2Recip, n2Points, n2PropProp],
  [n3Aire, n3Produit, n3Marge, n3Pond, n3Promo, n3Dilu, n3Rep],
  [n4Sech, n4Partir, n4Manq, n4Inverse, n4Egales, n4Bayes],
  [n5Ratio, n5Melange, n5Evap, n5XX, n5Double, n5Ecart]
];
function valide(ex){
  if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return false;
  return ex.choix.filter(c => norm(c) === norm(ex.a)).length === 1;
}
function secours(){
  return {
    q: 'Un article coûte 64 €. Son prix augmente de 25 %. Quel est son nouveau prix ?', a: '80 €', accept: null,
    choix: ['80 €', '89 €', '48 €', '16 €'],
    expl: 'Une hausse de 25 % revient à multiplier par le coefficient 1,25. 64 € × 1,25 = 80 €. Piège : ajouter 25 € au lieu de 25 % donne 89 €.'
  };
}

A.push({
  id: 'alb-01-pourcentages',
  phase: 'albert',
  ordre: 1,
  theme: 'calcul',
  titre: 'Pourcentages, coefficients multiplicateurs, proportions',
  objectif: 'Calculer, enchaîner et inverser des évolutions en pourcentage, et raisonner sur des proportions, de tête et sans calculatrice.',
  lecon:
`<p class="lede">Au test d'Albert School, les pourcentages arrivent rarement seuls : on te demande d'enchaîner deux évolutions, de remonter à un prix de départ, de comparer des proportions ou de repérer ce qui ne change pas. Un seul outil règle presque tout : <mark>le coefficient multiplicateur</mark>.</p>
<h2>Ce que le test attend</h2>
<p>Des questions courtes, sans calculatrice, où l'énoncé paraît simple mais où un réflexe naïf mène droit à un mauvais choix, souvent présent parmi les quatre réponses : additionner deux pourcentages, se tromper de base, confondre points et pourcentages. Les premières questions demandent une application directe. Les plus difficiles cachent une quantité qui reste fixe (la matière sèche d'un fruit, les personnes qui ne bougent pas) ou un pourcentage de pourcentage.</p>
<h2>Les prérequis, en deux minutes</h2>
<p>Prendre t % d'une quantité, c'est la multiplier par t/100. Un pourcentage est aussi une fraction : connais ce tableau par cœur.</p>
<table class="tbl"><tr><th>Pourcentage</th><th>Fraction</th><th>Décimal</th></tr>
<tr><td>50 %</td><td>1/2</td><td>0,5</td></tr>
<tr><td>25 %</td><td>1/4</td><td>0,25</td></tr>
<tr><td>75 %</td><td>3/4</td><td>0,75</td></tr>
<tr><td>20 %</td><td>1/5</td><td>0,2</td></tr>
<tr><td>12,5 %</td><td>1/8</td><td>0,125</td></tr>
<tr><td>10 %</td><td>1/10</td><td>0,1</td></tr>
<tr><td>5 %</td><td>1/20</td><td>0,05</td></tr>
<tr><td>33,3 %</td><td>environ 1/3</td><td>0,333…</td></tr></table>
<div class="formule"><p>Hausse de t % : × (1 + t/100) · Baisse de t % : × (1 − t/100)</p><p>Taux d'évolution = (arrivée − départ) ÷ départ</p></div>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je repère la base :</strong> un pourcentage est toujours « de quelque chose ». Un taux d'évolution se calcule par rapport à la valeur de départ, la TVA par rapport au prix hors taxes.</p>
<p><strong>2. Je traduis chaque évolution en coefficient :</strong> +30 % donne × 1,3 ; −15 % donne × 0,85.</p>
<p><strong>3. J'enchaîne en multipliant, je remonte en divisant :</strong> le coefficient global est le produit des coefficients ; pour retrouver une valeur de départ, je divise la valeur finale par le coefficient.</p>
<p><strong>4. Si une proportion change, je cherche ce qui ne change pas :</strong> la masse de sel quand on ajoute de l'eau, la matière sèche quand un fruit sèche, l'effectif du groupe qui ne bouge pas.</p>
<p><strong>5. Je contrôle avec 100 :</strong> en cas de doute, je prends 100 € ou 100 personnes et je fais le calcul pour de vrai.</p>
</div>
<h2>Exemples résolus</h2>
<h3>1. Un pourcentage de tête</h3>
<p>35 % de 240 ? 10 % de 240 font 24, donc 30 % font 72 ; 5 % font 12 ; au total 72 + 12 = 84.</p>
<h3>2. Le prix hors taxes</h3>
<p>Un casque coûte 90 € TTC, avec 20 % de TVA. Le TTC vaut HT × 1,2, donc HT = 90 ÷ 1,2. Diviser par 1,2, c'est diviser par 6 puis multiplier par 5 : 90 ÷ 6 = 15, et 15 × 5 = 75 €. Le calcul 90 × 0,8 = 72 € est faux : 72 × 1,2 = 86,40 €, pas 90 €.</p>
<h3>3. Enchaîner et compenser</h3>
<p>Un prix augmente de 25 % puis baisse de 20 % : 1,25 × 0,8 = 1, il revient exactement à son point de départ. À l'inverse, après une baisse de 20 %, il faut une hausse de 25 % pour revenir, car 1 ÷ 0,8 = 1,25.</p>
<h3>4. La quantité qui ne change pas (niveau du test)</h3>
<p>On fait sécher 30 kg de champignons à 90 % d'eau jusqu'à ce qu'ils n'en contiennent plus que 80 %. La matière sèche vaut 10 % de 30 kg, soit 3 kg, et elle ne bouge pas. À la fin, elle représente 20 % de la masse : la masse vaut 3 ÷ 0,2 = 15 kg. Les champignons ont perdu la moitié de leur masse, alors que la part d'eau n'a baissé que de 10 points.</p>
<h2>Réflexes sans calculatrice</h2>
<p>Passe par 10 % et 1 % : il suffit de décaler la virgule. Et t % de N, c'est aussi N % de t : 8 % de 25, c'est 25 % de 8, soit 2.</p>
<p>Diviser par 1,25 revient à multiplier par 0,8 ; diviser par 0,8 revient à multiplier par 1,25 ; diviser par 0,75 revient à multiplier par 4/3 ; diviser par 1,2 revient à multiplier par 5/6.</p>
<p>Si une longueur est multipliée par k, une aire est multipliée par k² : +10 % sur le côté d'un carré donne +21 % sur son aire.</p>
<p>Si un produit reste fixe (budget = prix × quantité, distance = vitesse × durée), les coefficients sont inverses : quand le prix monte de 25 %, la quantité achetée baisse de 20 %, car 1 ÷ 1,25 = 0,8.</p>
<p>Pour comparer deux grandeurs qui évoluent toutes les deux, suis leur rapport : il est multiplié par le coefficient de la première et divisé par celui de la seconde.</p>
<p>Règle de 70 : avec une hausse de t % par an, une quantité double en environ 70 ÷ t ans (10 ans à 7 %).</p>
<p>Pour une question du type « parmi les … », compte sur un effectif concret, par exemple 10 000 personnes.</p>
<p>Utilise les choix : multiplie chaque réponse proposée par le coefficient et regarde laquelle redonne la valeur de l'énoncé.</p>
<table class="tbl"><tr><th>Baisse</th><th>Hausse qui compense</th></tr>
<tr><td>−10 %</td><td>environ +11,1 %</td></tr>
<tr><td>−20 %</td><td>+25 %</td></tr>
<tr><td>−25 %</td><td>environ +33,3 %</td></tr>
<tr><td>−50 %</td><td>+100 %</td></tr>
<tr><td>−75 %</td><td>+300 %</td></tr></table>
<div class="box astuce"><p class="box-t">Astuce</p><p>Transforme chaque pourcentage en coefficient multiplicateur : multiplie pour enchaîner, divise pour remonter, et quand une proportion change, cherche la quantité qui ne bouge pas.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Les pourcentages successifs ne s'additionnent pas : +20 % puis −20 % donnent −4 %, pas 0 %. Une baisse de 20 % ne se compense pas par une hausse de 20 %. Le prix HT n'est pas le prix TTC × 0,8. Passer de 20 % à 25 %, c'est +5 points mais +25 %. Enfin, « 50 % de plus » ne veut pas dire « 50 % du total ».</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Coefficient = 1 + t/100, avec t négatif pour une baisse. Coefficient global = produit des coefficients ; taux global = coefficient global − 1. Valeur de départ = valeur finale ÷ coefficient. Avant tout calcul, demande-toi : « pourcentage de quoi ? ».</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(NIVEAUX[n - 1])(R);
      if (valide(ex)) return ex;
    } catch (e) { /* jamais d'exception vers l'appelant */ }
    return secours();
  }
});

})();
