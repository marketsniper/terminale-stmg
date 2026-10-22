/* ===== Maths · Objectif Albert School : alb-10 · Suites et récurrences =====
   Compétence de la piste Albert (window.ALBERT_SKILLS), même contrat que alb-01-pourcentages.
   gen(level, R) rend un QCM : exactement 4 choix distincts au sens de normStr, dont a ; accept: null.
   Niveaux 1 à 3 : séries de la leçon. Niveaux 4 et 5 : paliers hauts du test blanc adaptatif.
   Sous-types : terme de rang N (arithmétique, géométrique, affine, ordre 2), terme manquant à rebours,
   format de l'exemple officiel (deux termes non voisins d'une suite de type Fibonacci), suites périodiques
   (période 2, 3, 4, 6), sommes de termes, seuils, motifs dessinés. Toutes les réponses sont calculées. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (recopiées de la référence) ---------- */
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

/* ---------- aides propres aux suites ---------- */
const ent = x => nb(x, 0);
const par = x => x < 0 ? '(' + ent(x) + ')' : ent(x);                 // nombre négatif entre parenthèses dans un calcul
const signe = x => x >= 0 ? '+ ' + ent(x) : '− ' + ent(-x);          // « + 3 » ou « − 3 »
const vois = ans => k => ent(ans + (k % 2 ? (k + 1) / 2 : -k / 2));
const voisPos = ans => k => { const x = ans + (k % 2 ? (k + 1) / 2 : -k / 2); return x > 0 ? ent(x) : null; };
const T = n => n * (n + 1) / 2;                                        // 1 + 2 + … + n
const pour = s => 'pour tout entier n ≥ ' + s;
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(c => SUP.charAt(+c)).join('');
const pw = (q, n) => Math.pow(q, n);
const mk = (q, a, choix, expl) => ({q, a, accept: null, choix, expl});
/* Phrase « Piège : … » qui ne nomme que les distracteurs réellement présents parmi les choix. */
function pieges(ch, liste){
  const vus = new Set();
  const t = liste.filter(p => { if (p[0] == null || ch.indexOf(p[0]) <= 0 || vus.has(p[0])) return false; vus.add(p[0]); return true; }).map(p => p[1]);
  return t.length ? ' Piège : ' + t.join(' ') : '';
}
/* « 3 + 2c », « 6 + 3c », « c » : expression affine en l'inconnue. */
const expr = (c0, c1, x) => (c0 ? ent(c0) + ' + ' : '') + (c1 === 1 ? '' : c1) + x;

/* Fractions exactes (suites périodiques à termes fractionnaires). */
const pgcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b){ const r = a % b; a = b; b = r; } return a || 1; };
function fr(p, q){ if (q < 0){ p = -p; q = -q; } const g = pgcd(p, q); return {p: p / g, q: q / g}; }
const fsub = (x, y) => fr(x.p * y.q - y.p * x.q, x.q * y.q);
const fadd = (x, y) => fr(x.p * y.q + y.p * x.q, x.q * y.q);
const fmul = (x, y) => fr(x.p * y.p, x.q * y.q);
const fdiv = (x, y) => fr(x.p * y.q, x.q * y.p);
const UN = {p: 1, q: 1};
const fstr = f => f.q === 1 ? ent(f.p) : (f.p < 0 ? '−' : '') + Math.abs(f.p) + '/' + f.q;
const fpar = f => f.p < 0 ? '(' + fstr(f) + ')' : fstr(f);
const fvois = f => k => fstr(fr(f.p + (k % 2 ? (k + 1) / 2 : -k / 2) * f.q, f.q));
const fpar2 = f => (f.q !== 1 || f.p < 0) ? '(' + fstr(f) + ')' : fstr(f);      // opérande d'une division : (3/2), (−1)
/* « 2 026 = 6 × 337 + 4, donc u(2026) = u(4) » ou « 2 010 = 6 × 335 est un multiple de 6, donc u(2010) = u(6) ». */
function divTxt(N, p, idx){
  const r = N % p;
  return (r ? ent(N) + ' = ' + p + ' × ' + ent((N - r) / p) + ' + ' + r : ent(N) + ' = ' + p + ' × ' + ent(N / p) + ' est un multiple de ' + p) + ', donc u(' + N + ') = u(' + idx + ')';
}

/* =====================================================
   NIVEAU 1 · découverte (1 min)
   ===================================================== */
const CTX_A = [
  {u: 'jour', q: (a, r, N) => 'Le 1er jour de son programme, Inès fait ' + a + ' pompes. Chaque jour, elle en fait ' + r + ' de plus que la veille.\nCombien de pompes fait-elle le ' + N + 'e jour ?'},
  {u: 'jour', q: (a, r, N) => 'Le 1er jour, Malik lit ' + a + ' pages d\'un roman. Chaque jour, il lit ' + r + ' pages de plus que la veille.\nCombien de pages lit-il le ' + N + 'e jour ?'},
  {u: 'rang', q: (a, r, N) => 'Dans une salle de spectacle, le 1er rang compte ' + a + ' sièges, et chaque rang compte ' + r + ' sièges de plus que le précédent.\nCombien de sièges compte le ' + N + 'e rang ?'},
  {u: 'mois', q: (a, r, N) => 'Le 1er mois, Nora met ' + a + ' euros de côté. Chaque mois, elle met ' + r + ' euros de plus que le mois précédent.\nCombien d\'euros met-elle de côté le ' + N + 'e mois ?'}
];
/* Suite arithmétique définie par récurrence : terme de rang N (départ u(0), u(1) ou situation concrète). */
function n1Arith(R){
  const mode = R.pick(['u0', 'u0', 'u1', 'ctx']);
  if (mode === 'ctx'){
    const C = R.pick(CTX_A), a = R.int(5, 30), r = R.int(2, 6), N = R.int(10, 30), ans = a + (N - 1) * r;
    const ch = qcm(ent(ans), [ent(a + N * r), ent(N * r), ent(a + (N - 2) * r)], voisPos(ans));
    return mk(C.q(a, r, N), ent(ans), ch,
      'Compte les augmentations : du 1er au ' + N + 'e ' + C.u + ', on ajoute ' + r + ' seulement ' + (N - 1) + ' fois. ' +
      'Le ' + N + 'e ' + C.u + ' : ' + a + ' + ' + (N - 1) + ' × ' + r + ' = ' + a + ' + ' + ent((N - 1) * r) + ' = ' + ent(ans) + '.' +
      pieges(ch, [[ent(a + N * r), ent(a + N * r) + ' ajoute ' + r + ' une fois de trop (' + N + ' fois au lieu de ' + (N - 1) + ').'],
                  [ent(N * r), ent(N * r) + ' oublie la valeur du départ.'], [ent(a + (N - 2) * r), ent(a + (N - 2) * r) + ' n\'ajoute ' + r + ' que ' + (N - 2) + ' fois : une augmentation de moins.']]));
  }
  const s = mode === 'u0' ? 0 : 1;
  const a = R.int(1, 30), r = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, -2, -3, -4, -5, -6]), N = R.int(12, 50);
  const k = N - s, ans = a + k * r, op = r > 0 ? '+' : '−', ar = Math.abs(r);
  const d = s === 0 ? [ent(a + (N - 1) * r), ent(a + (N + 1) * r), ent(N * r)] : [ent(a + N * r), ent((N - 1) * r), ent(a + (N - 2) * r)];
  const ch = qcm(ent(ans), d, vois(ans));
  const pg = s === 0
    ? [[d[0], d[0] + ' ne compte que ' + (N - 1) + ' sauts, comme si la suite commençait à u(1).'], [d[1], d[1] + ' fait un saut de trop.'], [d[2], d[2] + ' oublie le premier terme u(0) = ' + ent(a) + '.']]
    : [[d[0], d[0] + ' compte ' + N + ' sauts, comme si la suite commençait à u(0).'], [d[1], d[1] + ' oublie le premier terme u(1) = ' + ent(a) + '.']];
  return mk('La suite u est définie par u(' + s + ') = ' + ent(a) + ' et, ' + pour(s) + ', u(n + 1) = u(n) ' + signe(r) + '.\nQue vaut u(' + N + ') ?',
    ent(ans), ch,
    'Compte les sauts entre le premier terme et le terme demandé : on applique la règle une fois par saut. ' +
    'De u(' + s + ') à u(' + N + '), on l\'applique ' + k + ' fois' + (s === 1 ? ' (et non ' + N + ' fois, car la suite commence à u(1))' : '') + '. ' +
    'Donc u(' + N + ') = ' + ent(a) + ' ' + op + ' ' + k + ' × ' + ar + ' = ' + ent(a) + ' ' + op + ' ' + ent(k * ar) + ' = ' + ent(ans) + '.' + pieges(ch, pg));
}
/* Récurrence affine u(n + 1) = k × u(n) + c : quelques termes de proche en proche. */
function n1Recur(R){
  for (let t = 0; t < 40; t++){
    const s = R.pick([0, 1]), k = R.pick([2, 2, 3]), c = R.pick([-3, -2, -1, 1, 2, 3, 4, 5]), a = R.int(1, 5);
    const steps = k === 2 ? R.pick([3, 4]) : 3, N = s + steps;
    const u = [a]; for (let i = 0; i <= steps; i++) u.push(k * u[i] + c);
    const ans = u[steps], prev = u[steps - 1], next = u[steps + 1];
    if (prev === ans || Math.abs(next) > 3000) continue;
    let w = a; for (let i = 0; i < steps; i++) w = k * (w + c);
    const calc = []; for (let i = 1; i <= steps; i++) calc.push('u(' + (s + i) + ') = ' + k + ' × ' + par(u[i - 1]) + ' ' + signe(c) + ' = ' + ent(u[i]));
    const ch = qcm(ent(ans), [ent(prev), ent(next), ent(w)], vois(ans));
    return mk('La suite u est définie par u(' + s + ') = ' + ent(a) + ' et, ' + pour(s) + ', u(n + 1) = ' + k + ' × u(n) ' + signe(c) + '.\nQue vaut u(' + N + ') ?',
      ent(ans), ch,
      'Applique la règle pas à pas à partir de u(' + s + ') : multiplie le terme précédent par ' + k + ', puis ' + (c > 0 ? 'ajoute ' : 'retire ') + Math.abs(c) + '. ' +
      calc.join(' ; ') + '.' +
      pieges(ch, [[ent(prev), ent(prev) + ' est u(' + (N - 1) + ') : il manque une étape.'],
                  [ent(next), ent(next) + ' est u(' + (N + 1) + ') : une étape de trop' + (s === 1 ? ', comme si la suite commençait à u(0).' : '.')],
                  [ent(w), ent(w) + ' vient de l\'ordre inversé : on a ' + (c > 0 ? 'ajouté ' : 'retiré ') + Math.abs(c) + ' avant de multiplier.']]));
  }
  return n1Arith(R);
}
/* Récurrence d'ordre 2 (deux termes de départ) : calcul de proche en proche. */
function n1Fibo(R){
  for (let t = 0; t < 40; t++){
    const regle = R.pick(['+', '+', '+2', '−']), s = R.pick([0, 1]);
    const a = R.int(1, 9), b = R.int(1, 9);
    const m = regle === '+' ? R.pick([5, 6]) : regle === '+2' ? R.pick([4, 5]) : R.pick([4, 5, 6]);
    const f = regle === '+' ? (x, y) => y + x : regle === '+2' ? (x, y) => y + 2 * x : (x, y) => y - x;
    const u = [a, b]; for (let i = 2; i <= m + 1; i++) u.push(f(u[i - 2], u[i - 1]));
    const ans = u[m], prev = u[m - 1], next = u[m + 1];
    if (prev === ans || next === ans) continue;
    let faux;
    if (regle === '+') faux = 2 * prev;
    else { const g = regle === '+2' ? (x, y) => 2 * y + x : (x, y) => x - y; const w = [a, b]; for (let i = 2; i <= m; i++) w.push(g(w[i - 2], w[i - 1])); faux = w[m]; }
    const txt = regle === '+' ? 'u(n + 2) = u(n + 1) + u(n)' : regle === '+2' ? 'u(n + 2) = u(n + 1) + 2 × u(n)' : 'u(n + 2) = u(n + 1) − u(n)';
    const calc = [];
    for (let i = 2; i <= m; i++){
      const x = u[i - 2], y = u[i - 1];
      calc.push('u(' + (s + i) + ') = ' + (regle === '+' ? ent(y) + ' + ' + par(x) : regle === '+2' ? ent(y) + ' + 2 × ' + par(x) : ent(y) + ' − ' + par(x)) + ' = ' + ent(u[i]));
    }
    const N = s + m;
    const ch = qcm(ent(ans), [ent(prev), ent(next), ent(faux)], vois(ans));
    const fauxTxt = regle === '+' ? ' double u(' + (N - 1) + ') au lieu d\'ajouter les deux termes précédents.'
      : regle === '+2' ? ' double le terme le plus récent au lieu du plus ancien.' : ' fait la soustraction dans le mauvais sens.';
    return mk('La suite u est définie par u(' + s + ') = ' + a + ', u(' + (s + 1) + ') = ' + b + ' et, ' + pour(s) + ', ' + txt + '.\nQue vaut u(' + N + ') ?',
      ent(ans), ch,
      'Calcule les termes un par un : chacun s\'obtient avec les deux termes qui le précèdent' +
      (regle === '+2' ? ', en doublant le plus ancien des deux' : regle === '−' ? ', en retirant le plus ancien du plus récent' : '') + '. ' +
      calc.join(' ; ') + '.' +
      pieges(ch, [[ent(prev), ent(prev) + ' est u(' + (N - 1) + ') : il manque une étape.'], [ent(next), ent(next) + ' est u(' + (N + 1) + ') : une étape de trop.'], [ent(faux), ent(faux) + fauxTxt]]));
  }
  return n1Arith(R);
}
/* Suite géométrique : terme de rang N, ou situation de doublement. */
function n1Geom(R){
  if (R.int(0, 2) === 0){
    const q = R.pick([2, 2, 3]), a = R.pick(q === 2 ? [1000, 2000, 3000, 5000] : [1000, 2000, 4000]);
    const h0 = R.int(7, 10), st = q === 2 ? R.int(3, 5) : R.int(2, 4), ans = a * pw(q, st);
    const d = [a * pw(q, st - 1), a * q * st, a * (1 + (q - 1) * st), a * pw(q, st + 1)].map(ent);
    const ch = qcm(ent(ans), d, k => ent(ans + k * a));
    return mk('À ' + h0 + ' h, une culture contient ' + ent(a) + ' bactéries. Leur nombre ' + (q === 2 ? 'double' : 'triple') + ' toutes les heures.\nCombien y a-t-il de bactéries à ' + (h0 + st) + ' h ?',
      ent(ans), ch,
      'Compte les heures écoulées, puis multiplie par ' + q + ' autant de fois. De ' + h0 + ' h à ' + (h0 + st) + ' h, il y a ' + st + ' heures, donc on multiplie ' + st + ' fois par ' + q + ', soit par ' + q + sup(st) + ' = ' + pw(q, st) + '. ' +
      ent(a) + ' × ' + pw(q, st) + ' = ' + ent(ans) + '.' +
      pieges(ch, [[d[0], d[0] + ' multiplie une fois de moins.'], [d[1], d[1] + ' multiplie par ' + q + ' × ' + st + ' au lieu de ' + q + sup(st) + '.'],
                  [d[2], d[2] + ' ajoute la même quantité chaque heure, comme une suite arithmétique.'], [d[3], d[3] + ' multiplie une fois de trop.']]));
  }
  const s = R.pick([0, 1]), q = R.pick([2, 2, 3]), a = R.int(1, 5), st = q === 2 ? R.int(4, 7) : R.int(3, 5), N = s + st, ans = a * pw(q, st);
  const d = [a * pw(q, st - 1), a * pw(q, st + 1), a * q * st, a + q * st].map(ent);
  const ch = qcm(ent(ans), d, voisPos(ans));
  return mk('La suite v est définie par v(' + s + ') = ' + a + ' et, ' + pour(s) + ', v(n + 1) = ' + q + ' × v(n).\nQue vaut v(' + N + ') ?',
    ent(ans), ch,
    'Chaque étape multiplie par ' + q + ' : compte les étapes de v(' + s + ') à v(' + N + '), puis multiplie v(' + s + ') par ' + q + ' autant de fois. Il y a ' + st + ' étapes, donc v(' + N + ') = ' + a + ' × ' + q + sup(st) + ' = ' + a + ' × ' + pw(q, st) + ' = ' + ent(ans) + '.' +
    pieges(ch, [[d[0], d[0] + ' fait une étape de moins' + (s === 1 ? ' : de v(1) à v(' + N + '), il y a ' + st + ' étapes, pas ' + (st - 1) + '.' : '.')],
                [d[1], d[1] + ' fait une étape de trop' + (s === 1 ? ', comme si la suite commençait à v(0).' : '.')],
                [d[2], d[2] + ' confond ' + q + sup(st) + ' avec ' + q + ' × ' + st + '.'], [d[3], d[3] + ' ajoute ' + q + ' à chaque étape au lieu de multiplier.']]));
}
/* Motif dessiné qui grandit d'une quantité constante. */
const MOTIFS1 = [
  {f1: 4, d: 3, g: 'm', o: 'allumettes', u: 'carré', us: 'carrés', partage: 'allumettes partagées', txt: 'Avec des allumettes, on construit une rangée de carrés accolés : deux carrés voisins partagent une allumette.'},
  {f1: 3, d: 2, g: 'm', o: 'allumettes', u: 'triangle', us: 'triangles', partage: 'allumettes partagées', txt: 'Avec des allumettes, on construit une rangée de triangles accolés, pointe en haut puis pointe en bas, en alternance : deux triangles voisins partagent une allumette.'},
  {f1: 5, d: 4, g: 'm', o: 'allumettes', u: 'pentagone', us: 'pentagones', partage: 'allumettes partagées', txt: 'Avec des allumettes, on construit une chaîne de pentagones : chaque nouveau pentagone partage un côté avec le précédent.'},
  {f1: 6, d: 5, g: 'm', o: 'allumettes', u: 'hexagone', us: 'hexagones', partage: 'allumettes partagées', txt: 'Avec des allumettes, on construit une rangée d\'hexagones : chaque nouvel hexagone partage un côté avec le précédent.'},
  {f1: 4, d: 2, g: 'f', o: 'personnes', u: 'table', us: 'tables', partage: 'côtés collés, où personne ne peut s\'asseoir', txt: 'Des tables carrées sont placées bout à bout en une seule rangée, et chaque côté libre accueille une personne.'},
  {f1: 6, d: 4, g: 'f', o: 'personnes', u: 'table', us: 'tables', partage: 'côtés collés, où personne ne peut s\'asseoir', txt: 'Des tables hexagonales sont placées bout à bout en une seule rangée, deux tables voisines se touchant par un côté, et chaque côté libre accueille une personne.'}
];
function n1Motif(R){
  const M = R.pick(MOTIFS1), N = R.int(10, 60), f2 = M.f1 + M.d, f3 = M.f1 + 2 * M.d, ans = M.f1 + (N - 1) * M.d;
  const q = M.o === 'allumettes'
    ? M.txt + ' Il faut ' + M.f1 + ' allumettes pour 1 ' + M.u + ', ' + f2 + ' pour 2 ' + M.us + ' et ' + f3 + ' pour 3 ' + M.us + '.\nCombien d\'allumettes faut-il pour ' + N + ' ' + M.us + ' ?'
    : M.txt + ' Avec 1 table, on place ' + M.f1 + ' personnes ; avec 2 tables, ' + f2 + ' personnes ; avec 3 tables, ' + f3 + ' personnes.\nCombien de personnes peut-on placer avec ' + N + ' tables ?';
  const d = [ent(M.f1 * N), ent(M.f1 + N * M.d), ent(M.d * N)];
  const ch = qcm(ent(ans), d, voisPos(ans));
  return mk(q, ent(ans), ch,
    'Regarde combien ' + (M.g === 'f' ? 'chaque nouvelle ' : 'chaque nouveau ') + M.u + ' ajoute : l\'écart entre deux figures voisines est constant. De ' + M.f1 + ' à ' + f2 + ' puis à ' + f3 + ', on ajoute ' + M.d + ' ' + M.o + ' à chaque fois. ' +
    'Pour ' + N + ' ' + M.us + ' : ' + M.f1 + ' + (' + N + ' − 1) × ' + M.d + ' = ' + M.f1 + ' + ' + ent((N - 1) * M.d) + ' = ' + ent(ans) + '.' +
    pieges(ch, [[d[0], d[0] + ' compte chaque ' + M.u + ' en entier, sans tenir compte des ' + M.partage + '.'],
                [d[1], d[1] + ' ajoute ' + M.d + ' une fois de trop : ' + (M.g === 'f' ? 'la 1re ' : 'le 1er ') + M.u + ' est déjà ' + (M.g === 'f' ? 'comptée' : 'compté') + ' dans les ' + M.f1 + ' du départ.'],
                [d[2], d[2] + ' compte ' + M.d + ' ' + M.o + ' par ' + M.u + ' : il manque les ' + (M.f1 - M.d) + ' de plus de la première figure (' + M.f1 + ' = ' + M.d + ' + ' + (M.f1 - M.d) + ').']]));
}

/* =====================================================
   NIVEAU 2 · maîtrise (1 à 2 min)
   ===================================================== */
/* Type Fibonacci : on connaît w(1) et un terme plus loin, w(2) est inconnu. */
function n2FiboSuivant(R){
  for (let t = 0; t < 40; t++){
    const g = R.pick([3, 4]), a = R.int(1, 9), b = R.int(1, 12);
    if (b === a) continue;
    const w = [0, a, b]; for (let i = 3; i <= 7; i++) w.push(w[i - 1] + w[i - 2]);
    const Y = w[1 + g], ans = w[2 + g];
    const ex = [null, [a, 0], [0, 1]]; for (let i = 3; i <= 1 + g; i++) ex.push([ex[i - 1][0] + ex[i - 2][0], ex[i - 1][1] + ex[i - 2][1]]);
    const lignes = []; for (let i = 3; i <= 1 + g; i++) lignes.push('w(' + i + ') = ' + expr(ex[i][0], ex[i][1], 'b'));
    const cb = ex[1 + g][1], c0 = ex[1 + g][0];
    const d = [ent(Y + a), ent(2 * Y), ent(Y + w[g - 1])];
    const ch = qcm(ent(ans), d, vois(ans));
    return mk('La suite w vérifie w(1) = ' + a + ' et, pour tout entier n ≥ 3, w(n) = w(n − 1) + w(n − 2). On sait aussi que w(' + (1 + g) + ') = ' + Y + '.\nQue vaut w(' + (2 + g) + ') ?',
      ent(ans), ch,
      'Appelle b le terme inconnu w(2) et écris les termes suivants en fonction de b, jusqu\'au terme connu. ' + lignes.join(' ; ') + '. ' +
      'Comme w(' + (1 + g) + ') = ' + Y + ' : ' + cb + 'b = ' + Y + ' − ' + c0 + ' = ' + (Y - c0) + ', donc b = ' + b + '. ' +
      'La suite commence par ' + w.slice(1, 2 + g).join(' ; ') + ', donc w(' + (2 + g) + ') = w(' + (1 + g) + ') + w(' + g + ') = ' + Y + ' + ' + w[g] + ' = ' + ans + '. Tu pouvais aussi tester les choix proposés.' +
      pieges(ch, [[d[0], d[0] + ' ajoute w(1) au lieu de w(' + g + ').'], [d[1], d[1] + ' double w(' + (1 + g) + ') au lieu d\'ajouter le terme précédent.'],
                  [d[2], d[2] + ' ajoute w(' + (g - 1) + '), qui n\'est pas le voisin de w(' + (1 + g) + ').']]));
  }
  return n1Fibo(R);
}
/* Type Fibonacci à rebours : deux termes voisins connus, on remonte. */
function n2Rebours(R){
  for (let t = 0; t < 40; t++){
    const k = R.int(5, 9), p = R.int(1, 12), q = R.int(1, 15);
    if (p === q) continue;
    const X = p + q, Y = p + 2 * q, ans = p;
    const d = [ent(q), ent(q - p), ent(-p), ent(X + Y)];
    const ch = qcm(ent(ans), d, vois(ans));
    const rel = R.pick(['pour tout entier n ≥ 0, u(n + 2) = u(n + 1) + u(n)', 'pour tout entier n ≥ 2, u(n) = u(n − 1) + u(n − 2)']);
    return mk('Une suite u vérifie, ' + rel + '. On sait que u(' + k + ') = ' + X + ' et u(' + (k + 1) + ') = ' + Y + '.\nQue vaut u(' + (k - 2) + ') ?',
      ent(ans), ch,
      'Lis la relation à l\'envers : un terme est égal au terme situé deux rangs plus loin moins celui situé un rang plus loin ; recule d\'un rang à la fois. ' +
      'u(' + (k - 1) + ') = u(' + (k + 1) + ') − u(' + k + ') = ' + Y + ' − ' + X + ' = ' + q + ', puis u(' + (k - 2) + ') = u(' + k + ') − u(' + (k - 1) + ') = ' + X + ' − ' + q + ' = ' + p + '. ' +
      'Vérification : ' + p + ' + ' + q + ' = ' + X + ' et ' + q + ' + ' + X + ' = ' + Y + '.' +
      pieges(ch, [[d[0], d[0] + ' est u(' + (k - 1) + ') : on s\'est arrêté un rang trop tôt.'], [d[1], d[1] + ' est u(' + (k - 3) + ') : un rang de trop.'],
                  [d[2], d[2] + ' vient d\'une soustraction dans le mauvais sens.'], [d[3], d[3] + ' avance au lieu de reculer.']]));
  }
  return n1Fibo(R);
}
/* Suite arithmétique connue par deux termes : raison, puis terme lointain. */
function n2ArithDeux(R){
  const i = R.int(1, 5), g = R.int(2, 6), j = i + g, r = R.pick([2, 3, 4, 5, 6, 7, 8, 9, -2, -3, -4, -5, -6]), u0 = R.int(1, 30);
  const X = u0 + i * r, Y = u0 + j * r;
  const loin = R.int(0, 3) > 0, c = loin ? j + R.int(5, 20) : 0, ans = X + (c - i) * r;
  const d = loin ? [ent(Y + (c - i) * r), ent(X + (c - i) * (Y - X)), ent(X + (c - i + 1) * r)] : [ent(X + i * r), ent(X - (i - 1) * r), ent(X - i * (Y - X))];
  const ch = qcm(ent(ans), d, vois(ans));
  const op = c > i ? (r > 0 ? '+' : '−') : (r > 0 ? '−' : '+'), nbs = Math.abs(c - i);
  return mk('La suite u est arithmétique. On sait que u(' + i + ') = ' + ent(X) + ' et u(' + j + ') = ' + ent(Y) + '.\nQue vaut u(' + c + ') ?',
    ent(ans), ch,
    'Trouve d\'abord la raison r en comptant les sauts entre les deux termes connus, puis compte les sauts jusqu\'au rang demandé. Entre u(' + i + ') et u(' + j + '), il y a ' + g + ' sauts de r. ' +
    g + ' × r = ' + ent(Y) + ' − ' + par(X) + ' = ' + ent(Y - X) + ', donc r = ' + ent(r) + '. ' +
    'De u(' + i + ') à u(' + c + '), il y a ' + nbs + ' sauts' + (c < i ? ' vers l\'arrière' : '') + ' : u(' + c + ') = ' + ent(X) + ' ' + op + ' ' + nbs + ' × ' + Math.abs(r) + ' = ' + ent(ans) + '.' +
    pieges(ch, loin
      ? [[d[0], d[0] + ' part de u(' + j + ') en comptant les sauts depuis u(' + i + ').'], [d[1], d[1] + ' prend ' + ent(Y - X) + ' pour la raison, sans diviser par ' + g + '.'], [d[2], d[2] + ' compte un saut de trop.']]
      : [[d[0], d[0] + ' avance au lieu de reculer.'], [d[1], d[1] + ' recule d\'un saut de moins.'], [d[2], d[2] + ' prend ' + ent(Y - X) + ' pour la raison, sans diviser par ' + g + '.']]));
}
/* Sommes classiques : 1 + … + n, impairs, pairs. */
function n2Somme(R){
  const v = R.pick(['n', 'n', 'pile', 'impairs', 'pairs']);
  if (v === 'n' || v === 'pile'){
    const n = R.pick([12, 15, 20, 24, 25, 30, 40, 50, 60, 80, 99, 100, 120, 150, 200]), ans = T(n);
    const d = [ent(n * (n - 1) / 2), n % 2 === 0 ? ent(n * n / 2) : ent(n * n), ent(n * (n + 1))];
    const ch = qcm(ent(ans), d, voisPos(ans));
    const q = v === 'n' ? 'Calcule 1 + 2 + 3 + … + ' + n + '.'
      : 'Une pile de rondins compte 1 rondin au sommet, 2 dans la rangée du dessous, 3 dans la suivante, et ainsi de suite jusqu\'à ' + n + ' rondins dans la rangée du bas.\nCombien de rondins compte la pile ?';
    return mk(q, ent(ans), ch,
      'Associe le premier et le dernier terme, le deuxième et l\'avant-dernier, etc. : chaque paire vaut ' + (n + 1) + ', d\'où la formule 1 + 2 + … + n = n × (n + 1) ÷ 2. ' +
      'Ici : ' + n + ' × ' + (n + 1) + ' ÷ 2 = ' + ent(n * (n + 1)) + ' ÷ 2 = ' + ent(ans) + '.' +
      pieges(ch, [[d[0], d[0] + ' utilise n × (n − 1) ÷ 2, qui s\'arrête à ' + (n - 1) + '.'], [d[1], d[1] + ' oublie le « + 1 » de la formule.'], [d[2], d[2] + ' oublie de diviser par 2.']]));
  }
  if (v === 'impairs'){
    const k = R.int(8, 40), L = 2 * k - 1, ans = k * k;
    const d = [ent((k - 1) * (k - 1)), ent((k + 1) * (k + 1)), ent(k * (k + 1))];
    const ch = qcm(ent(ans), d, voisPos(ans));
    return mk('Calcule 1 + 3 + 5 + … + ' + L + '.', ent(ans), ch,
      'Compte d\'abord les termes, puis utilise : la somme des k premiers nombres impairs vaut k². De 1 à ' + L + ', il y a (' + L + ' + 1) ÷ 2 = ' + k + ' nombres impairs, donc la somme vaut ' + k + '² = ' + ent(ans) + '. ' +
      'Vérifie la règle sur un petit cas : 1 + 3 + 5 = 9 = 3².' +
      pieges(ch, [[d[0], d[0] + ' compte ' + (k - 1) + ' termes au lieu de ' + k + '.'], [d[1], d[1] + ' compte ' + (k + 1) + ' termes au lieu de ' + k + '.'], [d[2], d[2] + ' confond avec la somme des nombres pairs.']]));
  }
  const k = R.int(8, 40), L = 2 * k, ans = k * (k + 1);
  const d = [ent(k * k), ent(k * (2 * k + 1)), ent((k + 1) * (k + 1))];
  const ch = qcm(ent(ans), d, voisPos(ans));
  return mk('Calcule 2 + 4 + 6 + … + ' + L + '.', ent(ans), ch,
    'Mets 2 en facteur : 2 + 4 + … + ' + L + ' = 2 × (1 + 2 + … + ' + k + '), puis utilise 1 + 2 + … + n = n × (n + 1) ÷ 2. ' +
    '1 + 2 + … + ' + k + ' = ' + k + ' × ' + (k + 1) + ' ÷ 2 = ' + ent(T(k)) + ', donc la somme vaut 2 × ' + ent(T(k)) + ' = ' + ent(ans) + '.' +
    pieges(ch, [[d[0], d[0] + ' confond avec la somme des nombres impairs.'], [d[1], d[1] + ' additionne tous les entiers de 1 à ' + L + ', pairs et impairs.']]));
}
/* Suite de période 2 : rang très grand. */
function n2Periode2(R){
  for (let t = 0; t < 40; t++){
    const s = R.pick([0, 1]), N = R.pick([R.int(2020, 2035), R.int(2020, 2035), R.int(50, 999)]), pair = (N - s) % 2 === 0;
    if (R.int(0, 2) > 0){
      const k = R.int(2, 15), a = R.int(1, 20), b = k - a;
      if (b === a || b === 0 || a === k) continue;
      const ans = pair ? a : b, autre = pair ? b : a;
      const d = [ent(autre), ent(k), ent(-ans)];
      const ch = qcm(ent(ans), d, vois(ans));
      return mk('La suite u est définie par u(' + s + ') = ' + a + ' et, ' + pour(s) + ', u(n + 1) = ' + k + ' − u(n).\nQue vaut u(' + N + ') ?',
        ent(ans), ch,
        'Calcule trois termes : la suite revient à son point de départ, il suffit alors de regarder la parité du rang. ' +
        'u(' + s + ') = ' + a + ', u(' + (s + 1) + ') = ' + k + ' − ' + a + ' = ' + ent(b) + ', u(' + (s + 2) + ') = ' + k + ' − ' + par(b) + ' = ' + a + '. ' +
        'La suite alterne : les rangs de même parité que ' + s + ' donnent ' + a + ', les autres donnent ' + ent(b) + '. ' + N + ' est ' + (N % 2 ? 'impair' : 'pair') + ', donc u(' + N + ') = ' + ent(ans) + '.' +
        pieges(ch, [[d[0], d[0] + ' se trompe de parité' + (s === 1 ? ' : la suite commence à u(1), donc les rangs impairs donnent ' + a + '.' : '.')], [d[1], d[1] + ' est le nombre de la règle, pas un terme de la suite.'],
                    [d[2], d[2] + ' est l\'opposé de la bonne réponse : erreur de signe.']]));
    }
    const a = R.int(2, 12), m = R.int(2, 12);
    if (a === m) continue;
    const c = a * m, ans = pair ? a : m, autre = pair ? m : a;
    const d = [ent(autre), ent(c), !pair && c - a !== m ? ent(c - a) : null];      // lecture « c − u(n) » : a, c − a, a…
    const ch = qcm(ent(ans), d, voisPos(ans));
    return mk('La suite u est définie par u(' + s + ') = ' + a + ' et, ' + pour(s) + ', u(n + 1) = ' + c + ' ÷ u(n).\nQue vaut u(' + N + ') ?',
      ent(ans), ch,
      'Calcule trois termes : la suite revient à son point de départ, il suffit alors de regarder la parité du rang. ' +
      'u(' + s + ') = ' + a + ', u(' + (s + 1) + ') = ' + c + ' ÷ ' + a + ' = ' + m + ', u(' + (s + 2) + ') = ' + c + ' ÷ ' + m + ' = ' + a + '. ' +
      'Les rangs de même parité que ' + s + ' donnent ' + a + ', les autres donnent ' + m + '. ' + N + ' est ' + (N % 2 ? 'impair' : 'pair') + ', donc u(' + N + ') = ' + ans + '.' +
      pieges(ch, [[d[0], d[0] + ' se trompe de parité' + (s === 1 ? ' : la suite commence à u(1), donc les rangs impairs donnent ' + a + '.' : '.')], [d[1], d[1] + ' est le nombre de la règle, pas un terme de la suite.'],
                  [d[2], d[2] + ' confond la division par u(n) avec une soustraction.']]));
  }
  return n2Somme(R);
}
/* Suite géométrique de raison positive connue par deux termes. */
function n2GeomDeux(R){
  const i = R.int(1, 4), q = R.pick([2, 2, 3]), X = R.int(1, 6), Y = X * q * q, s = R.pick([1, 1, 2, -1]);
  if (s === -1){
    const ans = X * q, d = [(X + Y) % 2 === 0 ? ent((X + Y) / 2) : null, ent(-ans), ent(Y - X), ent(q)];
    const ch = qcm(ent(ans), d, voisPos(ans));
    return mk('La suite v est géométrique et sa raison est positive. On sait que v(' + i + ') = ' + X + ' et v(' + (i + 2) + ') = ' + Y + '.\nQue vaut v(' + (i + 1) + ') ?',
      ent(ans), ch,
      'Entre deux termes séparés de deux rangs, on multiplie deux fois par la raison q : cherche q tel que q² soit le quotient des deux termes. ' +
      'q² = ' + Y + ' ÷ ' + X + ' = ' + (q * q) + ', et q est positive, donc q = ' + q + '. v(' + (i + 1) + ') = ' + X + ' × ' + q + ' = ' + ans + '. Vérification : ' + ans + ' × ' + q + ' = ' + Y + '.' +
      pieges(ch, [[d[0], d[0] + ' est la moyenne des deux termes : c\'est la réponse pour une suite arithmétique, pas géométrique.'], [d[1], d[1] + ' correspond à la raison négative −' + q + ', exclue par l\'énoncé.'],
                  [d[2], d[2] + ' est l\'écart entre les deux termes, pas un terme de la suite.'], [d[3], d[3] + ' est la raison, pas le terme demandé.']]));
  }
  const ans = Y * pw(q, s);
  const arith = (Y - X) % 2 === 0 ? Y + s * (Y - X) / 2 : Y + (Y - X);
  const d = [ent(Y * pw(q, 2 * s)), ent(arith), ent(Y * pw(q, s + 1))];
  const ch = qcm(ent(ans), d, voisPos(ans));
  return mk('La suite v est géométrique et sa raison est positive. On sait que v(' + i + ') = ' + X + ' et v(' + (i + 2) + ') = ' + Y + '.\nQue vaut v(' + (i + 2 + s) + ') ?',
    ent(ans), ch,
    'Entre deux termes séparés de deux rangs, on multiplie deux fois par la raison q : cherche q tel que q² soit le quotient des deux termes. ' +
    'q² = ' + Y + ' ÷ ' + X + ' = ' + (q * q) + ', et q est positive, donc q = ' + q + '. ' +
    (s === 1 ? 'v(' + (i + 3) + ') = ' + Y + ' × ' + q + ' = ' + ent(ans) + '.' : 'v(' + (i + 3) + ') = ' + Y + ' × ' + q + ' = ' + ent(Y * q) + ', puis v(' + (i + 4) + ') = ' + ent(Y * q) + ' × ' + q + ' = ' + ent(ans) + '.') +
    pieges(ch, [[d[0], d[0] + ' multiplie par q² = ' + (q * q) + ' à chaque rang au lieu de q = ' + q + '.'], [d[1], d[1] + ' prolonge un écart constant, comme pour une suite arithmétique.'], [d[2], d[2] + ' fait une multiplication de trop.']]));
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels (2 à 3 min)
   ===================================================== */
/* Format de l'exemple officiel : u(k) et u(k + 2) connus, relation de Fibonacci. */
function n3Officiel(R){
  for (let t = 0; t < 60; t++){
    const k = R.int(2, 8), X = R.int(2, 15), c = R.int(2, 20);
    if (c === X) continue;
    const Y = X + c;
    if (X === 6 && Y === 16) continue;                     // jamais les nombres de l'exemple officiel
    const v = R.pick(['A', 'A', 'B', 'C']);
    if (v === 'C' && c <= X) continue;
    const rel = R.pick(['u(n) = u(n − 1) + u(n − 2) pour tout entier n ≥ 3', 'u(n + 2) = u(n + 1) + u(n) pour tout entier n ≥ 1']);
    const debut = 'Une suite u vérifie ' + rel + '. On sait que u(' + k + ') = ' + X + ' et u(' + (k + 2) + ') = ' + Y + '.\n';
    const m1 = 'u(' + (k + 2) + ') = u(' + (k + 1) + ') + u(' + k + '), donc u(' + (k + 1) + ') = ' + Y + ' − ' + X + ' = ' + c + '. ';
    const tete = 'Utilise la relation à rebours pour trouver le terme qui manque entre les deux termes connus : aucun système n\'est nécessaire. ';
    if (v === 'A'){
      const ans = Y + c, d = [ent(X + Y), ent(2 * Y), (Y - X) % 2 === 0 ? ent(Y + (Y - X) / 2) : null, ent(3 * Y - X)];
      const ch = qcm(ent(ans), d, vois(ans));
      return mk(debut + 'Que vaut u(' + (k + 3) + ') ?', ent(ans), ch,
        tete + m1 + 'Puis u(' + (k + 3) + ') = u(' + (k + 2) + ') + u(' + (k + 1) + ') = ' + Y + ' + ' + c + ' = ' + ans + '.' +
        pieges(ch, [[d[0], d[0] + ' additionne u(' + k + ') et u(' + (k + 2) + '), qui ne sont pas voisins.'], [d[1], d[1] + ' double u(' + (k + 2) + ') au lieu d\'ajouter u(' + (k + 1) + ').'],
                    [d[2], d[2] + ' suppose un écart constant, comme si la suite était arithmétique.'], [d[3], d[3] + ' est u(' + (k + 4) + ') : un rang de trop.']]));
    }
    if (v === 'B'){
      const u3 = Y + c, ans = u3 + Y, d = [ent(u3), ent(u3 + c), ent(ans + u3)];
      const ch = qcm(ent(ans), d, vois(ans));
      return mk(debut + 'Que vaut u(' + (k + 4) + ') ?', ent(ans), ch,
        tete + m1 + 'Puis u(' + (k + 3) + ') = ' + Y + ' + ' + c + ' = ' + u3 + ' et u(' + (k + 4) + ') = u(' + (k + 3) + ') + u(' + (k + 2) + ') = ' + u3 + ' + ' + Y + ' = ' + ans + '.' +
        pieges(ch, [[d[0], d[0] + ' est u(' + (k + 3) + ') : un rang de moins.'], [d[1], d[1] + ' ajoute u(' + (k + 1) + ') au lieu de u(' + (k + 2) + ').'], [d[2], d[2] + ' est u(' + (k + 5) + ') : un rang de trop.']]));
    }
    const ans = c - X, d = [ent(c), ent(X - c), ent(2 * X - c)];
    const ch = qcm(ent(ans), d, vois(ans));
    return mk(debut + 'Que vaut u(' + (k - 1) + ') ?', ent(ans), ch,
      tete + m1 + 'Puis u(' + (k + 1) + ') = u(' + k + ') + u(' + (k - 1) + '), donc u(' + (k - 1) + ') = ' + c + ' − ' + X + ' = ' + ans + '. Vérification : ' + ans + ' + ' + X + ' = ' + c + ' et ' + X + ' + ' + c + ' = ' + Y + '.' +
      pieges(ch, [[d[0], d[0] + ' est u(' + (k + 1) + ') : ce n\'est pas le rang demandé.'], [d[1], d[1] + ' fait la soustraction dans le mauvais sens.'], [d[2], d[2] + ' est u(' + (k - 2) + ') : un rang de trop.']]));
  }
  return n2FiboSuivant(R);
}
/* Suite u(n + 2) = u(n + 1) − u(n) : période 6 (rang moyen au niveau 3, très grand au niveau 4). */
function periode6(R, grand){
  for (let t = 0; t < 60; t++){
    const a = R.int(-5, 9), b = R.int(-5, 9), c = [a, b, b - a, -a, -b, a - b];
    if (new Set(c).size < 6) continue;
    const s = R.pick([0, 1]);
    const N = grand ? R.pick([R.int(2000, 2100), R.int(2000, 2100), R.int(100, 999)]) : R.int(20, 99);
    const i = ((N - s) % 6 + 6) % 6, idx = s + i, ans = c[i];
    const rel = R.int(0, 1) ? pour(s) + ', u(n + 2) = u(n + 1) − u(n)' : pour(s + 1) + ', u(n + 1) = u(n) − u(n − 1)';
    const calc = []; let x = a, y = b;
    for (let j = 2; j <= 7; j++){ const z = y - x; calc.push('u(' + (s + j) + ') = ' + ent(y) + ' − ' + par(x) + ' = ' + ent(z)); x = y; y = z; }
    const d = [ent(c[(i + 1) % 6]), ent(c[(i + 5) % 6]), ent(c[(i + 3) % 6])];
    const ch = qcm(ent(ans), d, vois(ans));
    return mk('La suite u est définie par u(' + s + ') = ' + ent(a) + ', u(' + (s + 1) + ') = ' + ent(b) + ' et, ' + rel + '.\nQue vaut u(' + N + ') ?',
      ent(ans), ch,
      'Calcule les termes un par un jusqu\'à retrouver les deux valeurs de départ, côte à côte : à partir de là, la suite se répète. ' +
      calc.join(' ; ') + '. On retrouve ' + ent(a) + ' puis ' + ent(b) + ' : la suite est périodique de période 6. ' +
      divTxt(N, 6, idx) + ' = ' + ent(ans) + '.' +
      pieges(ch, [[d[0], d[0] + ' est le terme suivant dans le cycle : erreur d\'un rang en utilisant le reste.'], [d[1], d[1] + ' est le terme précédent dans le cycle : erreur d\'un rang.'],
                  [d[2], d[2] + ' est l\'opposé de la bonne réponse : erreur de signe avec les nombres négatifs.']]));
  }
  return n3Officiel(R);
}
function n3Periode6(R){ return periode6(R, false); }
/* Somme de termes en progression arithmétique. */
function n3SommeArith(R){
  for (let t = 0; t < 60; t++){
    const a = R.int(2, 15), r = R.int(2, 6), m = R.int(10, 40), L = a + (m - 1) * r;
    if ((m * (a + L)) % 2) continue;
    const S = m * (a + L) / 2, ctx = R.int(0, 2) === 0;
    const d = [((m - 1) * (a + L)) % 2 ? null : ent((m - 1) * (a + L) / 2), ((m + 1) * (a + L)) % 2 ? null : ent((m + 1) * (a + L) / 2), ent(m * (a + L)), ent(m * L)];
    const ch = qcm(ent(S), d, voisPos(S));
    const fin = 'S = ' + m + ' × (' + a + ' + ' + ent(L) + ') ÷ 2 = ' + m + ' × ' + ent(a + L) + ' ÷ 2 = ' + ent(S) + '.';
    const pg = [[d[0], d[0] + ' compte ' + (m - 1) + ' termes : il manque le « + 1 » dans le compte.'], [d[1], d[1] + ' compte un terme de trop.'], [d[2], d[2] + ' oublie de diviser par 2.'], [d[3], d[3] + ' fait comme si tous les termes valaient le dernier.']];
    if (ctx) return mk('Une salle de spectacle compte ' + m + ' rangées. La 1re rangée a ' + a + ' sièges, et chaque rangée a ' + r + ' sièges de plus que la précédente.\nCombien de sièges la salle compte-t-elle en tout ?',
      ent(S), ch,
      'Calcule le nombre de sièges de la dernière rangée, puis utilise : somme = nombre de termes × (premier + dernier) ÷ 2. ' +
      'La ' + m + 'e rangée a ' + a + ' + ' + (m - 1) + ' × ' + r + ' = ' + ent(L) + ' sièges. ' + fin.replace('S = ', 'Total : ') +
      pieges(ch, [[d[0], d[0] + ' compte une rangée de moins.'], [d[1], d[1] + ' compte une rangée de trop.'], [d[2], d[2] + ' oublie de diviser par 2.'], [d[3], d[3] + ' fait comme si toutes les rangées avaient ' + ent(L) + ' sièges.']]));
    return mk('Calcule la somme S = ' + a + ' + ' + (a + r) + ' + ' + (a + 2 * r) + ' + … + ' + ent(L) + '.', ent(S), ch,
      'Compte d\'abord les termes, puis utilise : somme = nombre de termes × (premier + dernier) ÷ 2. ' +
      'De ' + a + ' à ' + ent(L) + ' de ' + r + ' en ' + r + ' : (' + ent(L) + ' − ' + a + ') ÷ ' + r + ' + 1 = ' + ((L - a) / r) + ' + 1 = ' + m + ' termes. ' + fin + pieges(ch, pg));
  }
  return n2Somme(R);
}
/* Premier rang qui dépasse un seuil (suite arithmétique ou géométrique). */
function n3Rang(R){
  const s = R.pick([0, 1]);
  if (R.int(0, 2) > 0){
    const a = R.int(1, 20), r = R.int(3, 15), S = R.int(200, 2000), D = S - a, qq = Math.floor(D / r), n = s + qq + 1;
    const oubli = Math.floor(S / r) + 1 + s;
    const d = [String(n - 1), String(n + 1), String(oubli)];
    const ch = qcm(String(n), d, k => String(n + (k % 2 ? (k + 1) / 2 + 1 : -k / 2 - 1)));
    const un = 'u(' + (n - 1) + ') = ' + ent(a + (n - 1 - s) * r), deux = 'u(' + n + ') = ' + ent(a + (n - s) * r);
    return mk('La suite u est définie par u(' + s + ') = ' + a + ' et, ' + pour(s) + ', u(n + 1) = u(n) + ' + r + '.\nQuel est le plus petit entier n tel que u(n) > ' + ent(S) + ' ?',
      String(n), ch,
      'Écris u(n) en fonction de n, puis cherche le premier rang qui dépasse le seuil. ' +
      'u(n) = ' + a + ' + ' + r + ' × ' + (s ? '(n − 1)' : 'n') + ', et il faut ' + r + ' × ' + (s ? '(n − 1)' : 'n') + ' > ' + ent(S) + ' − ' + a + ' = ' + ent(D) + '. ' +
      r + ' × ' + qq + ' = ' + ent(r * qq) + ' ne dépasse pas ' + ent(D) + ', ' + r + ' × ' + (qq + 1) + ' = ' + ent(r * (qq + 1)) + ' le dépasse, donc ' + (s ? 'n − 1 = ' + (qq + 1) + ' et n = ' : 'n = ') + n + '. ' +
      'Vérification : ' + un + ' ne dépasse pas ' + ent(S) + ', ' + deux + ' le dépasse.' +
      pieges(ch, [[d[0], d[0] + ' est le dernier rang qui ne dépasse pas encore ' + ent(S) + '.'], [d[1], d[1] + ' va un rang trop loin.'], [d[2], d[2] + ' oublie le premier terme u(' + s + ') = ' + a + '.']]));
  }
  const q = R.pick([2, 3]), a = R.int(1, 7), S = R.int(100, 5000);
  const vals = [a]; while (vals[vals.length - 1] <= S) vals.push(vals[vals.length - 1] * q);
  const n = s + vals.length - 1;
  let no = 0; while (pw(q, no) <= S) no++;                 // oubli de v(s) : qⁿ > S
  const d = [String(n - 1), String(n + 1), String(s + no), String(n + 2)];
  const ch = qcm(String(n), d, k => String(n + (k % 2 ? (k + 1) / 2 + 2 : -k / 2 - 1)));
  return mk('La suite v est définie par v(' + s + ') = ' + a + ' et, ' + pour(s) + ', v(n + 1) = ' + q + ' × v(n).\nQuel est le plus petit entier n tel que v(n) > ' + ent(S) + ' ?',
    String(n), ch,
    'Calcule les termes un par un en multipliant par la raison, en notant bien le rang de chacun, jusqu\'à dépasser le seuil. ' +
    vals.map((x, j) => 'v(' + (s + j) + ') = ' + ent(x)).join(' ; ') + '. ' +
    'v(' + (n - 1) + ') = ' + ent(vals[vals.length - 2]) + ' ne dépasse pas ' + ent(S) + ', v(' + n + ') = ' + ent(vals[vals.length - 1]) + ' le dépasse.' +
    pieges(ch, [[d[0], d[0] + ' est le dernier rang qui ne dépasse pas encore ' + ent(S) + (s === 1 ? ', ou un rang mal compté parce que la suite commence à v(1).' : '.')], [d[1], d[1] + ' va un rang trop loin.'],
                [d[2], d[2] + ' compare seulement les puissances de ' + q + ' à ' + ent(S) + ', en oubliant le premier terme v(' + s + ') = ' + a + '.'], [d[3], d[3] + ' va deux rangs trop loin.']]));
}
/* Motif dessiné dont les écarts augmentent (croissance du second degré). */
const MOTIFS3 = [
  {f: n => n * (n + 1) / 2, a: 10, b: 40, q: N => 'On construit des escaliers avec des cubes : chaque marche est une colonne de cubes, de hauteur 1, 2, 3, et ainsi de suite. L\'escalier à 1 marche utilise 1 cube, celui à 2 marches 3 cubes, celui à 3 marches 6 cubes.\nCombien de cubes faut-il pour un escalier à ' + N + ' marches ?', m: 'tri'},
  {f: n => n * (n + 1) / 2, a: 10, b: 40, q: N => 'On empile des boîtes de conserve en pyramide plate : 1 boîte au sommet, et chaque rangée compte une boîte de plus que celle du dessus. Une pyramide de 1 étage compte 1 boîte, de 2 étages 3 boîtes, de 3 étages 6 boîtes.\nCombien de boîtes compte une pyramide de ' + N + ' étages ?', m: 'tri'},
  {f: n => 2 * n * (n + 1), a: 5, b: 15, q: N => 'Avec des allumettes, on construit des grilles carrées découpées en petits carrés. La grille 1 × 1 utilise 4 allumettes, la grille 2 × 2 en utilise 12, la grille 3 × 3 en utilise 24.\nCombien d\'allumettes faut-il pour la grille ' + N + ' × ' + N + ' ?', m: 'grille'},
  {f: n => 3 * n * (n + 1) / 2, a: 5, b: 12, q: N => 'Avec des allumettes, on construit un grand triangle équilatéral découpé en petits triangles dont chaque côté est une allumette. Le triangle de côté 1 utilise 3 allumettes, celui de côté 2 en utilise 9, celui de côté 3 en utilise 18.\nCombien d\'allumettes faut-il pour le triangle de côté ' + N + ' ?', m: 'triangle'}
];
function n3MotifQuad(R){
  const M = R.pick(MOTIFS3), N = R.int(M.a, M.b), ans = M.f(N), f1 = M.f(1), f2 = M.f(2);
  const lin = f1 + (N - 1) * (f2 - f1);
  const d = [ent(lin), ent(M.f(N - 1)), ent(M.f(N + 1))];
  const ch = qcm(ent(ans), d, voisPos(ans));
  let e;
  if (M.m === 'tri') e = 'Regarde les écarts : on ajoute 2, puis 3, puis 4… Ils augmentent, donc le total est une somme 1 + 2 + … + ' + N + '. ' +
    '1 + 2 + … + ' + N + ' = ' + N + ' × ' + (N + 1) + ' ÷ 2 = ' + ent(ans) + '.';
  else if (M.m === 'grille') e = 'Compte les allumettes par lignes droites plutôt que figure par figure. La grille ' + N + ' × ' + N + ' a ' + (N + 1) + ' lignes horizontales de ' + N + ' allumettes et ' + (N + 1) + ' lignes verticales de ' + N + ' allumettes : ' +
    '2 × ' + (N + 1) + ' × ' + N + ' = ' + ent(ans) + '. Vérification sur la grille 2 × 2 : 2 × 3 × 2 = 12.';
  else e = 'Compte les petits triangles pointe en haut : chaque allumette borde exactement l\'un d\'eux. Il y en a 1 + 2 + … + ' + N + ' = ' + ent(T(N)) + ', et chacun a 3 côtés : 3 × ' + ent(T(N)) + ' = ' + ent(ans) + '. Vérification sur le côté 2 : 3 × 3 = 9.';
  return mk(M.q(N), ent(ans), ch, e +
    pieges(ch, [[d[0], d[0] + ' prolonge l\'écart du début comme s\'il était constant, alors qu\'il augmente.'], [d[1], d[1] + ' correspond à la figure ' + (N - 1) + '.'], [d[2], d[2] + ' correspond à la figure ' + (N + 1) + '.']]));
}

/* =====================================================
   NIVEAU 4 · plus dur que les exemples officiels (3 min)
   ===================================================== */
function n4Periode6(R){ return periode6(R, true); }
/* Type Fibonacci : u(k) et u(k + 3) connus, deux termes inconnus entre eux. */
function n4FiboEcart3(R){
  for (let t = 0; t < 60; t++){
    const k = R.int(1, 7), X = R.int(2, 15), c = R.int(1, 20);
    if (c === X) continue;
    const Y = X + 2 * c, v = R.pick(['k+4', 'k+4', 'k+2', 'k+5']);
    const u = [X, c, X + c, Y]; for (let i = 4; i <= 6; i++) u.push(u[i - 1] + u[i - 2]);
    const debut = 'Une suite u vérifie u(n + 2) = u(n + 1) + u(n) pour tout entier n ≥ 1. On sait que u(' + k + ') = ' + X + ' et u(' + (k + 3) + ') = ' + Y + '.\n';
    const raison = 'Appelle c le terme inconnu qui suit le premier terme connu, exprime les termes suivants en fonction de c, puis utilise le second terme connu. ' +
      'Avec c = u(' + (k + 1) + ') : u(' + (k + 2) + ') = ' + X + ' + c et u(' + (k + 3) + ') = u(' + (k + 2) + ') + u(' + (k + 1) + ') = ' + X + ' + 2c. ' +
      'Donc ' + X + ' + 2c = ' + Y + ', 2c = ' + (Y - X) + ' et c = ' + c + '. La suite : ' + u.slice(0, 4).join(' ; ') + '. ';
    let ans, d, fin, pg;
    if (v === 'k+2'){
      ans = u[2]; d = [ent(c), (X + Y) % 2 === 0 ? ent((X + Y) / 2) : null, ent(Y - X)];
      fin = 'u(' + (k + 2) + ') = ' + X + ' + ' + c + ' = ' + ans + '.';
      pg = [[d[0], d[0] + ' est u(' + (k + 1) + '), pas u(' + (k + 2) + ').'], [d[1], d[1] + ' est la moyenne des deux termes connus : la suite n\'est pas arithmétique.'], [d[2], d[2] + ' oublie que u(' + (k + 3) + ') contient deux fois c.']];
    } else if (v === 'k+4'){
      ans = u[4]; d = [ent(X + Y), ent(2 * Y), (Y - X) % 3 === 0 ? ent(Y + (Y - X) / 3) : null, ent(u[5])];
      fin = 'u(' + (k + 4) + ') = u(' + (k + 3) + ') + u(' + (k + 2) + ') = ' + Y + ' + ' + u[2] + ' = ' + ans + '.';
      pg = [[d[0], d[0] + ' additionne u(' + k + ') et u(' + (k + 3) + '), qui ne sont pas voisins.'], [d[1], d[1] + ' vient de c = ' + (Y - X) + ' : on a oublié que u(' + (k + 3) + ') contient deux fois c.'],
            [d[2], d[2] + ' suppose un écart constant, comme si la suite était arithmétique.'], [d[3], d[3] + ' est u(' + (k + 5) + ') : un rang de trop.']];
    } else {
      ans = u[5]; d = [ent(u[4]), ent(u[6]), ent(X + 2 * Y)];
      fin = 'u(' + (k + 4) + ') = ' + Y + ' + ' + u[2] + ' = ' + u[4] + ', puis u(' + (k + 5) + ') = ' + u[4] + ' + ' + Y + ' = ' + ans + '.';
      pg = [[d[0], d[0] + ' est u(' + (k + 4) + ') : un rang de moins.'], [d[1], d[1] + ' est u(' + (k + 6) + ') : un rang de trop.']];
    }
    const ch = qcm(ent(ans), d, voisPos(ans));
    return mk(debut + 'Que vaut u(' + (v === 'k+2' ? k + 2 : v === 'k+4' ? k + 4 : k + 5) + ') ?', ent(ans), ch, raison + fin + pieges(ch, pg));
  }
  return n3Officiel(R);
}
/* Récurrence affine u(n + 1) = q × u(n) + t : l'écart au point fixe est multiplié par q. */
function n4Affine(R){
  for (let t0 = 0; t0 < 40; t0++){
    const q = R.pick([2, 2, 3]), l = R.pick([-9, -7, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const dd = q === 2 ? R.int(1, 3) : R.int(1, 2), N = q === 2 ? R.int(6, 10) : R.int(4, 6);
    if (dd * pw(q, N) > 3100) continue;
    const t = l * (1 - q), u0 = l + dd, ans = l + dd * pw(q, N);
    const d = [ent(l + dd * pw(q, N - 1)), ent(dd * pw(q, N)), Math.abs(u0 * pw(q, N)) < 100000 ? ent(u0 * pw(q, N)) : null, ent(l + dd * pw(q, N + 1))];
    if (d[1] === ent(ans) && d[2] === ent(ans)) continue;
    const ch = qcm(ent(ans), d, vois(ans));
    const ec = 'u(n) ' + signe(-l);
    return mk('La suite u est définie par u(0) = ' + ent(u0) + ' et, pour tout entier n ≥ 0, u(n + 1) = ' + q + ' × u(n) ' + signe(t) + '.\nQue vaut u(' + N + ') ?',
      ent(ans), ch,
      'Cherche le nombre que la règle ne change pas, puis suis l\'écart entre u(n) et ce nombre : il est multiplié par ' + q + ' à chaque étape. ' +
      q + ' × ' + par(l) + ' ' + signe(t) + ' = ' + ent(l) + ', donc ce nombre est ' + ent(l) + ', et ' + ec + ' est multiplié par ' + q + ' à chaque étape. ' +
      'Au départ, u(0) ' + signe(-l) + ' = ' + dd + ' ; après ' + N + ' étapes, u(' + N + ') ' + signe(-l) + ' = ' + dd + ' × ' + q + sup(N) + ' = ' + ent(dd * pw(q, N)) + '. ' +
      'Donc u(' + N + ') = ' + ent(dd * pw(q, N)) + ' ' + signe(l) + ' = ' + ent(ans) + '. Vérification : u(1) = ' + q + ' × ' + par(u0) + ' ' + signe(t) + ' = ' + ent(q * u0 + t) + ', et ' + ent(q * u0 + t) + ' ' + signe(-l) + ' = ' + (dd * q) + '.' +
      pieges(ch, [[d[0], d[0] + ' fait une étape de moins.'], [d[1], d[1] + ' oublie d\'ajouter ' + ent(l) + ' à la fin.'], [d[2], d[2] + ' ignore le « ' + signe(t) + ' » de la règle.'], [d[3], d[3] + ' fait une étape de trop.']]));
  }
  return n3Rang(R);
}
/* Sommes 1 + 2 + 3 + … ou 1 + 3 + 5 + … jusqu'à dépasser un seuil. */
function n4SeuilSomme(R){
  for (let t = 0; t < 60; t++){
    const v = R.pick(['tri', 'tri', 'impDernier', 'impNombre']);
    if (v === 'tri'){
      const S = R.int(300, 5000); let n = 1; while (T(n) <= S) n++;
      if (T(n - 1) === S) continue;
      const m = Math.floor(Math.sqrt(S)) + 1;
      const d = [String(n - 1), String(n + 1), String(m)];
      const ch = qcm(String(n), d, k => String(n + (k % 2 ? (k + 1) / 2 + 1 : -k / 2 - 1)));
      return mk('On additionne les entiers consécutifs 1 + 2 + 3 + 4 + … et on s\'arrête dès que la somme dépasse ' + ent(S) + '.\nQuel est le dernier entier ajouté ?',
        String(n), ch,
        'Utilise 1 + 2 + … + n = n × (n + 1) ÷ 2 : il faut que n × (n + 1) dépasse le double du seuil, donc n est proche de la racine carrée de ce double. ' +
        'Ici, 2 × ' + ent(S) + ' = ' + ent(2 * S) + '. ' +
        (n - 1) + ' × ' + n + ' = ' + ent((n - 1) * n) + ' ne suffit pas, ' + n + ' × ' + (n + 1) + ' = ' + ent(n * (n + 1)) + ' dépasse. ' +
        'La somme jusqu\'à ' + (n - 1) + ' vaut ' + ent(T(n - 1)) + ', celle jusqu\'à ' + n + ' vaut ' + ent(T(n)) + ' : le dernier entier ajouté est ' + n + '.' +
        pieges(ch, [[d[2], d[2] + ' vient de n × n > ' + ent(S) + ' : on a oublié la division par 2.'], [d[0], d[0] + ' donne une somme qui ne dépasse pas encore ' + ent(S) + '.'], [d[1], d[1] + ' ajoute un entier de trop.']]));
    }
    const S = R.int(200, 3000); let k = 1; while (k * k <= S) k++;
    if ((k - 1) * (k - 1) === S) continue;
    const base = 'La somme des k premiers nombres impairs vaut k² : cherche le premier carré qui dépasse le seuil. ' +
      (k - 1) + '² = ' + ent((k - 1) * (k - 1)) + ' ne dépasse pas ' + ent(S) + ', ' + k + '² = ' + ent(k * k) + ' le dépasse. On a donc additionné ' + k + ' nombres impairs';
    if (v === 'impDernier'){
      const ans = 2 * k - 1, d = [String(k), String(2 * k + 1), String(2 * k - 3)];
      const ch = qcm(String(ans), d, j => String(ans + (j % 2 ? 2 * ((j + 1) / 2) + 2 : -2 * (j / 2) - 2)));
      return mk('On additionne les nombres impairs 1 + 3 + 5 + 7 + … et on s\'arrête dès que la somme dépasse ' + ent(S) + '.\nQuel est le dernier nombre impair ajouté ?',
        String(ans), ch,
        base + ', et le ' + k + 'e nombre impair est 2 × ' + k + ' − 1 = ' + ans + '.' +
        pieges(ch, [[d[0], d[0] + ' est le nombre de termes, pas le dernier terme.'], [d[1], d[1] + ' est le nombre impair suivant : un terme de trop.'], [d[2], d[2] + ' donne une somme qui ne dépasse pas encore ' + ent(S) + '.']]));
    }
    const d = [String(2 * k - 1), String(k - 1), String(k + 1)];
    const ch = qcm(String(k), d, j => String(k + (j % 2 ? (j + 1) / 2 + 1 : -j / 2 - 1)));
    return mk('On additionne les nombres impairs 1 + 3 + 5 + 7 + … et on s\'arrête dès que la somme dépasse ' + ent(S) + '.\nCombien de nombres impairs a-t-on additionnés ?',
      String(k), ch,
      base + ' : le dernier est ' + (2 * k - 1) + ', et la somme vaut ' + ent(k * k) + '.' +
      pieges(ch, [[d[0], d[0] + ' est le dernier nombre ajouté, pas le nombre de termes.'], [d[1], d[1] + ' donne une somme qui ne dépasse pas encore ' + ent(S) + '.'], [d[2], d[2] + ' compte un terme de trop.']]));
  }
  return n2Somme(R);
}
/* Récurrence u(n + 1) = u(n) + (expression en n) : on additionne les ajouts. */
function n4Telescope(R){
  const v = R.pick(['impairs', 'n', '2n']), c = R.int(1, 20);
  if (v === 'impairs'){
    const N = R.int(12, 40), ans = c + N * N;
    const d = [ent(c + (N - 1) * (N - 1)), ent(c + (N + 1) * (N + 1)), ent(N * N)];
    const ch = qcm(ent(ans), d, voisPos(ans));
    return mk('La suite u est définie par u(0) = ' + c + ' et, pour tout entier n ≥ 0, u(n + 1) = u(n) + 2n + 1.\nQue vaut u(' + N + ') ?',
      ent(ans), ch,
      'Écris ce que la règle ajoute à chaque étape, puis additionne tous ces ajouts. De u(0) à u(' + N + '), on ajoute 1 (n = 0), puis 3, puis 5, … jusqu\'à 2 × ' + (N - 1) + ' + 1 = ' + (2 * N - 1) + ' (n = ' + (N - 1) + ') : ce sont les ' + N + ' premiers nombres impairs, dont la somme vaut ' + N + '² = ' + ent(N * N) + '. ' +
      'u(' + N + ') = ' + c + ' + ' + ent(N * N) + ' = ' + ent(ans) + '. Vérification : u(1) = ' + (c + 1) + ', u(2) = ' + (c + 4) + ', u(3) = ' + (c + 9) + '.' +
      pieges(ch, [[d[0], d[0] + ' s\'arrête un ajout trop tôt.'], [d[1], d[1] + ' fait un ajout de trop : le dernier ajout correspond à n = ' + (N - 1) + '.'], [d[2], d[2] + ' oublie le premier terme u(0) = ' + c + '.']]));
  }
  if (v === 'n'){
    const N = R.int(15, 60), ans = c + N * (N - 1) / 2;
    const d = [ent(c + N * (N + 1) / 2), ent(N * (N - 1) / 2), ent(c + (N - 1) * (N - 2) / 2)];
    const ch = qcm(ent(ans), d, voisPos(ans));
    return mk('La suite u est définie par u(1) = ' + c + ' et, pour tout entier n ≥ 1, u(n + 1) = u(n) + n.\nQue vaut u(' + N + ') ?',
      ent(ans), ch,
      'Écris ce que la règle ajoute à chaque étape, puis additionne tous ces ajouts. Pour passer de u(1) à u(' + N + '), on ajoute 1, puis 2, puis 3, … jusqu\'à ' + (N - 1) + ' : ' +
      '1 + 2 + … + ' + (N - 1) + ' = ' + (N - 1) + ' × ' + N + ' ÷ 2 = ' + ent(N * (N - 1) / 2) + '. u(' + N + ') = ' + c + ' + ' + ent(N * (N - 1) / 2) + ' = ' + ent(ans) + '. Vérification : u(2) = ' + (c + 1) + ', u(3) = ' + (c + 3) + ', u(4) = ' + (c + 6) + '.' +
      pieges(ch, [[d[0], d[0] + ' ajoute jusqu\'à ' + N + ' au lieu de ' + (N - 1) + ' : le dernier ajout se fait pour n = ' + (N - 1) + '.'], [d[1], d[1] + ' oublie le premier terme u(1) = ' + c + '.'], [d[2], d[2] + ' s\'arrête un ajout trop tôt.']]));
  }
  const N = R.int(12, 45), ans = c + N * (N - 1);
  const d = [ent(c + N * (N + 1)), ent(N * (N - 1)), ent(c + N * N)];
  const ch = qcm(ent(ans), d, voisPos(ans));
  return mk('La suite u est définie par u(0) = ' + c + ' et, pour tout entier n ≥ 0, u(n + 1) = u(n) + 2n.\nQue vaut u(' + N + ') ?',
    ent(ans), ch,
    'Écris ce que la règle ajoute à chaque étape, puis additionne tous ces ajouts. De u(0) à u(' + N + '), on ajoute 0, puis 2, puis 4, … jusqu\'à 2 × ' + (N - 1) + ' = ' + (2 * N - 2) + ' : ' +
    'cela fait 2 × (1 + 2 + … + ' + (N - 1) + ') = 2 × ' + ent(N * (N - 1) / 2) + ' = ' + ent(N * (N - 1)) + '. u(' + N + ') = ' + c + ' + ' + ent(N * (N - 1)) + ' = ' + ent(ans) + '. Vérification : u(1) = ' + c + ', u(2) = ' + (c + 2) + ', u(3) = ' + (c + 6) + '.' +
    pieges(ch, [[d[0], d[0] + ' fait un ajout de trop : le dernier ajout correspond à n = ' + (N - 1) + '.'], [d[1], d[1] + ' oublie le premier terme u(0) = ' + c + '.'], [d[2], d[2] + ' confond avec la somme des nombres impairs.']]));
}
/* Suites périodiques à termes fractionnaires (période 3 ou 4). */
function n4PeriodeFrac(R){
  for (let t = 0; t < 40; t++){
    const p3 = R.int(0, 1) === 0, s = R.pick([0, 1]), N = R.pick([R.int(20, 99), R.int(2000, 2100), R.int(100, 999)]);
    const x = R.pick(p3 ? [2, 3, 4, 5, -1, -2, -3] : [2, 3, 4, 5, 7, -2, -3, -4]);
    const f = p3 ? u => fdiv(UN, fsub(UN, u)) : u => fdiv(fsub(u, UN), fadd(u, UN));
    const c = [fr(x, 1)], calc = [];
    for (let j = 1; j <= (p3 ? 3 : 4); j++){
      const u = c[j - 1], v = f(u);
      calc.push('u(' + (s + j) + ') = ' + (p3 ? '1 ÷ (1 − ' + fpar(u) + ') = 1 ÷ ' + fpar2(fsub(UN, u))
        : '(' + fstr(u) + ' − 1) ÷ (' + fstr(u) + ' + 1) = ' + fpar2(fsub(u, UN)) + ' ÷ ' + fpar2(fadd(u, UN))) + ' = ' + fstr(v));
      c.push(v);
    }
    const p = p3 ? 3 : 4;
    if (!feqF(c[p], c[0])) continue;
    const i = ((N - s) % p + p) % p, idx = s + i, ans = c[i];
    const autres = []; for (let j = 1; j < p; j++) autres.push(fstr(c[(i + j) % p]));
    if (p3) autres.push(fstr(fr(-ans.p, ans.q)));
    const ch = qcm(fstr(ans), autres, fvois(ans));
    const rel = p3 ? 'u(n + 1) = 1 ÷ (1 − u(n))' : 'u(n + 1) = (u(n) − 1) ÷ (u(n) + 1)';
    return mk('La suite u est définie par u(' + s + ') = ' + ent(x) + ' et, ' + pour(s) + ', ' + rel + '.\nQue vaut u(' + N + ') ?',
      fstr(ans), ch,
      'Calcule les premiers termes avec des fractions jusqu\'à retomber sur u(' + s + ') : la suite est alors périodique. ' +
      calc.join(' ; ') + '. On retrouve ' + ent(x) + ' : la suite se répète tous les ' + p + ' termes. ' +
      divTxt(N, p, idx) + ' = ' + fstr(ans) + '.' +
      pieges(ch, [[fstr(c[(i + 1) % p]), fstr(c[(i + 1) % p]) + ' est le terme suivant dans le cycle : erreur d\'un rang en utilisant le reste.'],
                  [fstr(c[(i + p - 1) % p]), fstr(c[(i + p - 1) % p]) + ' est le terme précédent dans le cycle : erreur d\'un rang.']]));
  }
  return periode6(R, true);
}
const feqF = (x, y) => x.p === y.p && x.q === y.q;

/* =====================================================
   NIVEAU 5 · haut du test adaptatif (3 à 4 min)
   ===================================================== */
/* Somme d'un grand nombre de termes d'une suite de période 6. */
function n5SommePeriode6(R){
  for (let t = 0; t < 60; t++){
    const a = R.int(-6, 9), b = R.int(-6, 9), c = [a, b, b - a, -a, -b, a - b];
    if (new Set(c).size < 6) continue;
    const s = R.pick([0, 1]), N = R.pick([R.int(2000, 2100), R.int(2000, 2100), R.int(100, 999)]);
    const P = [0]; for (let j = 0; j < 6; j++) P.push(P[j] + c[j]);
    const cnt = N - s + 1, r = cnt % 6, qq = (cnt - r) / 6, ans = P[r];
    const uN = c[(N - s) % 6];
    const d = [ent(P[(r + 5) % 6]), ent(P[(r + 1) % 6]), ent(uN), ent(P[(r + 2) % 6])];
    if (new Set([ans, P[(r + 5) % 6], P[(r + 1) % 6]]).size < 3) continue;
    const ch = qcm(ent(ans), d, vois(ans));
    const rel = R.int(0, 1) ? pour(s) + ', u(n + 2) = u(n + 1) − u(n)' : pour(s + 1) + ', u(n + 1) = u(n) − u(n − 1)';
    const termes = c.map((x, j) => 'u(' + (s + j) + ') = ' + ent(x)).join(' ; ');
    const reste = r ? 'il reste les ' + r + ' premiers : ' + c.slice(0, r).map(par).join(' + ') + ' = ' + ent(ans) : 'il ne reste rien, la somme vaut 0';
    return mk('La suite u est définie par u(' + s + ') = ' + ent(a) + ', u(' + (s + 1) + ') = ' + ent(b) + ' et, ' + rel + '.\nQue vaut la somme u(' + s + ') + u(' + (s + 1) + ') + … + u(' + N + ') ?',
      ent(ans), ch,
      'Calcule les premiers termes : la suite se répète tous les six termes et la somme de six termes consécutifs vaut zéro, donc seuls les termes qui dépassent un nombre entier de périodes comptent. ' +
      termes + ', puis on retrouve ' + ent(a) + ' et ' + ent(b) + '. ' +
      'De u(' + s + ') à u(' + N + '), il y a ' + ent(cnt) + ' termes' + (s === 0 ? ' (on compte aussi u(0))' : '') + '. ' + ent(cnt) + ' = 6 × ' + ent(qq) + (r ? ' + ' + r : '') + ' : les blocs de 6 donnent 0, ' + reste + '.' +
      pieges(ch, [[d[0], d[0] + (s === 0 ? ' compte ' + ent(N) + ' termes au lieu de ' + ent(cnt) + ' : on a oublié u(0).' : ' oublie le dernier terme, u(' + N + ').')], [d[1], d[1] + ' compte un terme de trop.'], [d[2], d[2] + ' est u(' + N + ') : on a confondu le dernier terme et la somme.'], [d[3], d[3] + ' compte deux termes de trop.']]));
  }
  return periode6(R, true);
}
/* Type Fibonacci : u(i) et u(i + g) connus avec g = 4 ou 5. */
const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21];
function n5FiboLoin(R){
  for (let t = 0; t < 60; t++){
    const g = R.pick([4, 5]), i = R.int(1, 4), X = R.int(1, 9), c = R.int(1, 12);
    if (c === X) continue;
    const u = [X, c]; for (let j = 2; j <= g + 2; j++) u.push(u[j - 1] + u[j - 2]);
    const Y = u[g], ask = R.int(0, 2) > 0 ? g + 1 : 2, ans = u[ask];
    const lignes = []; for (let j = 2; j <= g; j++) lignes.push('u(' + (i + j) + ') = ' + expr(FIB[j - 1] * X, FIB[j], 'c'));
    const d = ask === g + 1 ? [ent(2 * Y), ent(X + Y), ent(u[g + 2]), (Y - X) % g === 0 ? ent(Y + (Y - X) / g) : null] : [ent(c), ent(u[3]), ent(Y - X)];
    const ch = qcm(ent(ans), d, voisPos(ans));
    const fin = ask === g + 1
      ? 'La suite : ' + u.slice(0, g + 1).join(' ; ') + ', donc u(' + (i + g + 1) + ') = ' + Y + ' + ' + u[g - 1] + ' = ' + ans + '.'
      : 'Donc u(' + (i + 2) + ') = ' + X + ' + ' + c + ' = ' + ans + '. Vérification : la suite ' + u.slice(0, g + 1).join(' ; ') + ' redonne bien ' + Y + '.';
    const pg = ask === g + 1
      ? [[d[0], d[0] + ' double u(' + (i + g) + ') au lieu d\'ajouter u(' + (i + g - 1) + ').'], [d[1], d[1] + ' additionne les deux termes connus, qui ne sont pas voisins.'], [d[2], d[2] + ' est u(' + (i + g + 2) + ') : un rang de trop.'], [d[3], d[3] + ' suppose un écart constant, comme si la suite était arithmétique.']]
      : [[d[0], d[0] + ' est u(' + (i + 1) + '), pas u(' + (i + 2) + ').'], [d[1], d[1] + ' est u(' + (i + 3) + ') : un rang de trop.']];
    return mk('Une suite u vérifie u(n + 2) = u(n + 1) + u(n) pour tout entier n ≥ 1. On sait que u(' + i + ') = ' + X + ' et u(' + (i + g) + ') = ' + Y + '.\nQue vaut u(' + (i + ask) + ') ?',
      ent(ans), ch,
      'Appelle c le terme inconnu qui suit le premier terme connu et écris chaque terme suivant en fonction de c, jusqu\'au second terme connu : tu obtiens une équation simple. ' +
      'Avec c = u(' + (i + 1) + ') : ' + lignes.join(' ; ') + '. Donc ' + expr(FIB[g - 1] * X, FIB[g], 'c') + ' = ' + Y + ', ' + FIB[g] + 'c = ' + (Y - FIB[g - 1] * X) + ' et c = ' + c + '. ' + fin + pieges(ch, pg));
  }
  return n4FiboEcart3(R);
}
/* Premier rang où u(n + 1) = q × u(n) + t dépasse un très grand seuil : il faut l'astuce, pas le calcul terme à terme. */
function n5SeuilAffine(R){
  for (let t0 = 0; t0 < 60; t0++){
    const q = R.pick([2, 2, 2, 3]), t = q === 2 ? R.int(1, 9) : R.pick([2, 4, 6, 8]), a = R.int(1, 9);
    const S = q === 2 ? R.pick([100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000]) : R.pick([10000, 50000, 100000, 500000, 1000000]);
    const sh = q === 2 ? t : t / 2, m = a + sh;                 // u(n) + sh = m × qⁿ
    let n = 0; while (m * pw(q, n) - sh <= S) n++;
    if (n < 2 || m * pw(q, n - 1) - sh === S) continue;
    let nn = 0; while (a * pw(q, nn) <= S) nn++;
    const d = [String(n - 1), String(n + 1), nn !== n ? String(nn) : String(n + 2)];
    const ch = qcm(String(n), d, k => String(n + (k % 2 ? (k + 1) / 2 + 2 : -k / 2 - 1)));
    const avant = m * pw(q, n - 1), apres = m * pw(q, n);
    return mk('La suite u est définie par u(0) = ' + a + ' et, pour tout entier n ≥ 0, u(n + 1) = ' + q + ' × u(n) + ' + t + '.\nQuel est le plus petit entier n tel que u(n) > ' + ent(S) + ' ?',
      String(n), ch,
      'Ajoute à chaque terme le nombre qui rend la suite géométrique, puis compare au seuil sans calculer tous les termes. ' +
      'Ici, u(n) + ' + sh + ' est multiplié par ' + q + ' à chaque étape, car u(n + 1) + ' + sh + ' = ' + q + ' × u(n) + ' + (t + sh) + ' = ' + q + ' × (u(n) + ' + sh + '). ' +
      'Comme u(0) + ' + sh + ' = ' + m + ', on a u(n) + ' + sh + ' = ' + m + ' × ' + q + 'ⁿ, et u(n) > ' + ent(S) + ' revient à ' + m + ' × ' + q + 'ⁿ > ' + ent(S + sh) + '. ' +
      (q === 2 ? 'Repère : 2¹⁰ = 1 024, à peu près 1 000. ' : '') +
      m + ' × ' + q + sup(n - 1) + ' = ' + m + ' × ' + ent(pw(q, n - 1)) + ' = ' + ent(avant) + ' ne dépasse pas ' + ent(S + sh) + ', ' +
      m + ' × ' + q + sup(n) + ' = ' + m + ' × ' + ent(pw(q, n)) + ' = ' + ent(apres) + ' le dépasse. Donc n = ' + n + ' : u(' + (n - 1) + ') = ' + ent(avant - sh) + ' et u(' + n + ') = ' + ent(apres - sh) + '. ' +
      'Calculer les termes un par un demanderait ' + n + ' étapes avec de grands nombres.' +
      pieges(ch, [[d[0], d[0] + ' est le dernier rang qui ne dépasse pas encore ' + ent(S) + '.'], [d[1], d[1] + ' va un rang trop loin.'],
                  [nn !== n ? d[2] : null, d[2] + ' vient du calcul ' + a + ' × ' + q + 'ⁿ, qui oublie le « + ' + t + ' » de la règle.'], [nn !== n ? null : d[2], d[2] + ' va deux rangs trop loin.']]));
  }
  return n4Affine(R);
}
/* u(n + 2) = u(n + 1) ÷ u(n) : période 6, terme ou produit. */
function n5PeriodeMult(R){
  for (let t = 0; t < 60; t++){
    const a = R.pick([2, 3, 4, 5, 6, 8, 10, 12]), b = R.pick([2, 3, 4, 5, 6, 8, 10, 12]);
    if (a === b) continue;
    const c = [fr(a, 1), fr(b, 1)]; const calc = [];
    for (let j = 2; j <= 7; j++){ const v = fdiv(c[j - 1], c[j - 2]); calc.push('u(' + (1 + j) + ') = ' + fpar2(c[j - 1]) + ' ÷ ' + fpar2(c[j - 2]) + ' = ' + fstr(v)); c.push(v); }
    const N = R.pick([R.int(2000, 2100), R.int(100, 999)]), prod = R.int(0, 1) === 1;
    const debut = 'La suite u est définie par u(1) = ' + a + ', u(2) = ' + b + ' et, pour tout entier n ≥ 1, u(n + 2) = u(n + 1) ÷ u(n).\n';
    const tete = 'Calcule les termes en fractions jusqu\'à retrouver les deux premiers termes côte à côte : la suite se répète alors. ' + calc.join(' ; ') + '. Période 6. ';
    if (!prod){
      const i = (N - 1) % 6, idx = 1 + i, ans = c[i];
      const ch = qcm(fstr(ans), [fstr(c[(i + 1) % 6]), fstr(c[(i + 5) % 6]), fstr(fdiv(UN, ans))], fvois(ans));
      return mk(debut + 'Que vaut u(' + N + ') ?', fstr(ans), ch,
        tete + divTxt(N, 6, idx) + ' = ' + fstr(ans) + '.' +
        pieges(ch, [[fstr(c[(i + 1) % 6]), fstr(c[(i + 1) % 6]) + ' est le terme suivant dans le cycle : erreur d\'un rang.'], [fstr(c[(i + 5) % 6]), fstr(c[(i + 5) % 6]) + ' est le terme précédent dans le cycle : erreur d\'un rang.'],
                    [fstr(fdiv(UN, ans)), fstr(fdiv(UN, ans)) + ' est l\'inverse : division faite dans le mauvais sens.']]));
    }
    const P = [UN]; for (let j = 0; j < 6; j++) P.push(fmul(P[j], c[j]));
    const r = N % 6, qq = (N - r) / 6, ans = P[r], uN = c[(N - 1) % 6];
    const d = [fstr(P[(r + 5) % 6]), fstr(P[(r + 1) % 6]), fstr(uN), fstr(P[(r + 2) % 6])];
    if (new Set([fstr(ans), d[0], d[1]]).size < 3) continue;
    const ch = qcm(fstr(ans), d, fvois(ans));
    const reste = r ? 'il reste les ' + r + ' premiers termes : ' + c.slice(0, r).map(fpar2).join(' × ') + ' = ' + fstr(ans) : 'il ne reste rien, le produit vaut 1';
    return mk(debut + 'Que vaut le produit u(1) × u(2) × … × u(' + N + ') ?', fstr(ans), ch,
      tete + 'Le produit de 6 termes consécutifs vaut 1 : ' + c.slice(0, 6).map(fpar2).join(' × ') + ' = 1. ' +
      ent(N) + ' = 6 × ' + ent(qq) + (r ? ' + ' + r : '') + ' : les blocs de 6 donnent 1, ' + reste + '.' +
      pieges(ch, [[d[0], d[0] + ' oublie le dernier terme, u(' + N + ').'], [d[1], d[1] + ' compte un terme de trop.'], [d[2], d[2] + ' est u(' + N + ') : on a confondu le dernier terme et le produit.'], [d[3], d[3] + ' compte deux termes de trop.']]));
  }
  return n5SommePeriode6(R);
}
/* 1 + 2 + … + n avec un nombre oublié ou compté deux fois. */
function n5NombreOublie(R){
  const n = R.int(30, 90), x = R.int(2, n - 1), oubli = R.int(0, 1) === 1;
  if (oubli){
    const S = T(n) - x, d = [ent(n - x), ent(n + 1 + x), ent(n)];
    const ch = qcm(ent(x), d, voisPos(x));
    return mk('Léa veut calculer 1 + 2 + 3 + … + n pour un certain entier n, mais elle oublie un des nombres en route. Elle obtient ' + ent(S) + '.\nQuel nombre a-t-elle oublié ?',
      ent(x), ch,
      'Encadre le résultat entre deux sommes consécutives des premiers entiers, calculées avec la formule du cours. Avec n × (n + 1) ÷ 2, on trouve ' +
      '1 + … + ' + (n - 1) + ' = ' + ent(T(n - 1)) + ' et 1 + … + ' + n + ' = ' + ent(T(n)) + ' : ' + ent(S) + ' est entre les deux. ' +
      'Comme ' + ent(S) + ' dépasse ' + ent(T(n - 1)) + ', Léa est allée au moins jusqu\'à ' + n + ' ; si elle était allée jusqu\'à ' + (n + 1) + ', le nombre oublié vaudrait ' + ent(T(n + 1)) + ' − ' + ent(S) + ' = ' + ent(T(n + 1) - S) + ', plus grand que ' + (n + 1) + ' : impossible. ' +
      'Elle est donc allée jusqu\'à ' + n + ', et le nombre oublié vaut ' + ent(T(n)) + ' − ' + ent(S) + ' = ' + x + '.' +
      pieges(ch, [[d[0], d[0] + ' calcule ' + ent(S) + ' − ' + ent(T(n - 1)) + ' : on a pris la mauvaise somme de référence.'], [d[1], d[1] + ' compare à la somme jusqu\'à ' + (n + 1) + ', qui est trop grande.'], [d[2], d[2] + ' est le dernier entier de la somme, pas le nombre oublié.']]));
  }
  const S = T(n) + x, d = [ent(n + 1 - x), ent(x + n), ent(n)];
  const ch = qcm(ent(x), d, voisPos(x));
  return mk('Hugo veut calculer 1 + 2 + 3 + … + n pour un certain entier n, mais il ajoute par erreur l\'un des nombres deux fois. Il obtient ' + ent(S) + '.\nQuel nombre a-t-il compté deux fois ?',
    ent(x), ch,
    'Encadre le résultat entre deux sommes consécutives des premiers entiers, calculées avec la formule du cours. Avec n × (n + 1) ÷ 2, on trouve ' +
    '1 + … + ' + n + ' = ' + ent(T(n)) + ' et 1 + … + ' + (n + 1) + ' = ' + ent(T(n + 1)) + ' : ' + ent(S) + ' est entre les deux. ' +
    'Hugo ne peut pas être allé jusqu\'à ' + (n + 1) + ' (la somme dépasserait déjà ' + ent(S) + '), ni s\'arrêter à ' + (n - 1) + ' (le nombre compté deux fois vaudrait ' + ent(S) + ' − ' + ent(T(n - 1)) + ' = ' + ent(S - T(n - 1)) + ', plus grand que ' + (n - 1) + '). ' +
    'Il est donc allé jusqu\'à ' + n + ', et le nombre compté deux fois vaut ' + ent(S) + ' − ' + ent(T(n)) + ' = ' + x + '.' +
    pieges(ch, [[d[0], d[0] + ' calcule ' + ent(T(n + 1)) + ' − ' + ent(S) + ', comme si un nombre avait été oublié.'], [d[1], d[1] + ' compare à la somme jusqu\'à ' + (n - 1) + ', trop petite.'], [d[2], d[2] + ' est le dernier entier de la somme.']]));
}

/* ---------- répartition par niveau ---------- */
const GENS = {
  1: [n1Arith, n1Recur, n1Fibo, n1Geom, n1Motif],
  2: [n2FiboSuivant, n2Rebours, n2ArithDeux, n2Somme, n2Periode2, n2GeomDeux],
  3: [n3Officiel, n3Officiel, n3Periode6, n3SommeArith, n3Rang, n3MotifQuad],
  4: [n4Periode6, n4FiboEcart3, n4Affine, n4SeuilSomme, n4Telescope, n4PeriodeFrac],
  5: [n5SommePeriode6, n5FiboLoin, n5SeuilAffine, n5PeriodeMult, n5NombreOublie]
};
/* Filet de sécurité : question fixe et juste si un générateur échouait. */
const SECOURS = () => mk('La suite u est définie par u(0) = 5 et, pour tout entier n ≥ 0, u(n + 1) = u(n) + 4.\nQue vaut u(30) ?', '125',
  ['125', '121', '129', '120'], 'Compte les sauts : de u(0) à u(30), on applique la règle 30 fois. Donc u(30) = 5 + 30 × 4 = 125. Piège : 121 ne compte que 29 sauts.');

A.push({
  id: 'alb-10-suites-recurrences',
  phase: 'albert',
  ordre: 10,
  theme: 'suites',
  titre: 'Suites et récurrences',
  objectif: 'Calculer un terme d\'une suite définie par une règle (arithmétique, géométrique, de type Fibonacci, périodique), retrouver un terme manquant à rebours et additionner des termes, sans calculatrice.',
  lecon:
`<p class="lede">Une suite est une liste de nombres u(0), u(1), u(2)… fabriquée par une <mark>règle de passage</mark> : chaque terme se calcule à partir du terme précédent, ou des deux précédents. Au test, on te donne la règle et quelques termes ; à toi de trouver un terme précis, parfois très loin, sans calculatrice.</p>
<h2>Ce que le test te demande</h2>
<p>La fiche Parcoursup du test d'Albert School cite les suites, et l'un des exemples officiels porte sur une suite où chaque terme est la somme des deux précédents : on connaît deux termes qui ne se suivent pas, et il faut trouver le terme d'après. Attends-toi à cinq formats : calculer un terme de proche en proche ; retrouver un terme manquant en lisant la règle à l'envers ; trouver un terme de rang énorme, comme u(2026), quand la suite se répète ; calculer une somme de termes ; prolonger un motif dessiné (allumettes, tables, escaliers). Rien à réciter : tout se fait au brouillon en deux ou trois minutes, à condition de choisir le bon raccourci.</p>
<h2>Les prérequis</h2>
<p>u(n) est le terme de rang n. « u(n + 1) = u(n) + 3 » veut dire : pour obtenir un terme, on ajoute 3 au précédent. « u(n + 2) = u(n + 1) + u(n) » veut dire : chaque terme est la somme des deux précédents, comme dans la suite de Fibonacci 1, 1, 2, 3, 5, 8, 13… Repère toujours le premier rang : u(0) ou u(1).</p>
<table class="tbl">
<tr><th>Suite</th><th>Règle</th><th>Terme de rang n</th></tr>
<tr><td>arithmétique de raison r</td><td>u(n + 1) = u(n) + r</td><td>u(n) = u(0) + n × r</td></tr>
<tr><td>géométrique de raison q</td><td>v(n + 1) = q × v(n)</td><td>v(n) = v(0) × q<sup>n</sup></td></tr>
</table>
<p>Si la suite commence à u(1), remplace n par n − 1 : u(n) = u(1) + (n − 1) × r. Deux sommes à connaître par cœur :</p>
<div class="formule"><p>1 + 2 + 3 + … + n = n × (n + 1) ÷ 2</p><p>1 + 3 + 5 + … + (2k − 1) = k²</p><p>somme de termes à écart constant = nombre de termes × (premier + dernier) ÷ 2</p></div>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je repère le départ et la règle.</strong> Quel est le premier rang ? La règle utilise-t-elle un terme précédent ou deux ?</p>
<p><strong>2. J'écris quelques termes en colonne,</strong> avec leur rang. Quatre à huit termes suffisent souvent pour voir ce qui se passe : écart constant, multiplication, retour au départ.</p>
<p><strong>3. Je cherche le raccourci.</strong> Écart constant : u(0) + n × r. Retour aux valeurs de départ après p termes : la suite est périodique, je divise le rang par p et je garde le reste. Deux termes connus séparés d'un trou : je lis la règle à l'envers pour boucher le trou.</p>
<p><strong>4. Si rien de court n'apparaît,</strong> j'appelle c le terme inconnu, j'écris les termes suivants en fonction de c et je résous l'équation. Ou je teste les réponses proposées.</p>
<p><strong>5. Je vérifie</strong> en recalculant un ou deux termes avec la règle.</p>
</div>
<h2>Exemples résolus</h2>
<h3>Exemple 1 : u(0) = 5 et u(n + 1) = u(n) + 4. Que vaut u(30) ?</h3>
<p>De u(0) à u(30), on ajoute 4 trente fois : u(30) = 5 + 30 × 4 = 125. Le choix 121 ne compte que 29 sauts.</p>
<h3>Exemple 2 : u(n + 2) = u(n + 1) + u(n), u(6) = 26 et u(7) = 42. Que vaut u(4) ?</h3>
<p>On recule : u(5) = u(7) − u(6) = 42 − 26 = 16, puis u(4) = u(6) − u(5) = 26 − 16 = 10. Vérification : 10 + 16 = 26 et 16 + 26 = 42.</p>
<h3>Exemple 3 : u(n) = u(n − 1) + u(n − 2) pour n ≥ 3, u(3) = 5 et u(5) = 17. Que vaut u(6) ?</h3>
<p>C'est le format de l'exemple officiel. Inutile de poser un système : u(5) = u(4) + u(3) donne u(4) = 17 − 5 = 12, puis u(6) = u(5) + u(4) = 17 + 12 = 29. Le choix 22 additionne u(3) et u(5), qui ne sont pas voisins.</p>
<h3>Exemple 4 : u(1) = 2, u(2) = 7 et u(n + 2) = u(n + 1) − u(n). Que vaut u(2026) ?</h3>
<p>En colonne : 2 ; 7 ; 5 ; −2 ; −7 ; −5 ; 2 ; 7. On retrouve 2 puis 7 : la suite se répète tous les 6 termes. 2026 = 6 × 337 + 4, donc u(2026) = u(4) = −2. Bonus : la somme de 6 termes consécutifs vaut 0, ce qui règle aussi les questions de somme.</p>
<h2>Les réflexes sans calculatrice</h2>
<ul>
<li><strong>Compte les sauts</strong> : de u(3) à u(20), il y a 17 sauts ; de u(1) à u(20), il y en a 19.</li>
<li><strong>Motif dessiné</strong> : écris le nombre d'objets des figures 1, 2 et 3, puis les écarts. Écart constant d : figure N = figure 1 + (N − 1) × d. Écarts qui augmentent de 1 : pense à 1 + 2 + … + N.</li>
<li><strong>Grand rang</strong> : pour diviser 2026 par 6, pars d'un multiple de 6 facile, comme 1 800 = 6 × 300, puis 2026 − 1 800 = 226 = 6 × 37 + 4.</li>
<li><strong>Règle du type u(n + 1) = 2 × u(n) − 3</strong> : cherche le nombre que la règle ne change pas (ici 3, car 2 × 3 − 3 = 3) ; l'écart entre u(n) et ce nombre double à chaque étape.</li>
<li><strong>QCM</strong> : une réponse proposée doit respecter la règle avec tous les termes donnés ; teste-la si tu bloques.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Écris quelques termes en colonne avec leur rang, lis la règle à l'envers pour combler un trou, et pour un rang lointain cherche un écart constant ou une période.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Le premier rang change le nombre de sauts : de u(1) à u(n), il y en a n − 1. Ne confonds pas le rang et la valeur. N'additionne jamais deux termes qui ne se suivent pas. Dans une somme, compte bien les termes : de 7 à 103 de 4 en 4, il y en a (103 − 7) ÷ 4 + 1 = 25. Dans une suite qui oscille, mets les négatifs entre parenthèses : 5 − (−4) = 9.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Arithmétique : u(n) = u(0) + n × r. Géométrique : v(n) = v(0) × q<sup>n</sup>. Type Fibonacci : la règle se lit dans les deux sens. Suite périodique : divise le rang par la période et garde le reste. Sommes : n × (n + 1) ÷ 2 et k².</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(GENS[n])(R);
      if (ex && typeof ex.q === 'string' && typeof ex.a === 'string' && Array.isArray(ex.choix) && ex.choix.length === 4) return ex;
    } catch (e) { /* filet ci-dessous */ }
    return SECOURS();
  }
});

})();
