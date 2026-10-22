/* ===== Maths · Objectif Albert School : alb-03 · Moyennes : toujours repasser par les sommes =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS.
   gen(level, R) rend un QCM { q, a, accept: null, choix: [4 chaînes], expl } ; niveaux bornés à 1..5.
   Sous-types :
     N1 valeur manquante, deux nombres, ajout d'une valeur, moyenne par les écarts
     N2 valeur retirée, deux groupes, note à viser, deux grands nombres, coefficients, nombres régulièrement espacés
     N3 élément commun (5 nombres), erreur de saisie, grands nombres par les écarts, effectif d'un groupe,
        entier effacé (n connu), arrivée ou départ d'une personne, entiers consécutifs
     N4 élément commun (7, 9 ou 10 nombres), moyennes deux à deux, deux scénarios (effectif), plus grand possible
        (médiane), effectif total, part d'un groupe en %, écart entre extrêmes
     N5 entier effacé (n inconnu), nombre de valeurs par les extrêmes, deux scénarios (moyenne actuelle),
        médiane et moyenne : plus petit ou plus grand possible */
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
const abs = Math.abs;
const alt = k => (k % 2 ? 1 : -1) * Math.ceil(k / 2);
const ent = x => isFinite(x) && abs(x - Math.round(x)) < 1e-9;
const dec1 = x => isFinite(x) && abs(x * 10 - Math.round(x * 10)) < 1e-7;
const dec2 = x => isFinite(x) && abs(x * 100 - Math.round(x * 100)) < 1e-6;
const somme = arr => arr.reduce((s, x) => s + x, 0);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function gcd(a, b){ a = abs(a); b = abs(b); while (b){ const t = a % b; a = b; b = t; } return a; }
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
function tirer(f, essais){ for (let i = 0; i < (essais || 400); i++){ const v = f(); if (v) return v; } return null; }
const present = (choix, s) => choix.some(c => norm(c) === norm(s));
const dans = (v, arr) => arr.some(x => abs(x - v) < 1e-9);
/* « 95, 130 et 112 » */
function liste(arr, u){ const t = arr.map(x => (typeof x === 'string' ? x : nb(x)) + (u || '')); return t.length === 1 ? t[0] : t.slice(0, -1).join(', ') + ' et ' + t[t.length - 1]; }
const plus = arr => arr.map(x => nb(x)).join(' + ');
const ecart = e => e === 0 ? '0' : (e > 0 ? '+' : '−') + nb(abs(e));
/* Montant en euros : deux décimales dès qu'il y a des centimes (48,50 €). */
const eur2 = x => { const t = nb(x); return (/,\d$/.test(t) ? t + '0' : t) + ' €'; };
/* Pièges : chaque entrée commence par le texte exact d'un choix. On ne garde que les choix présents, jamais la bonne
   réponse (un distracteur peut coïncider avec elle et avoir été écarté), et une seule explication par choix. */
function piegeTxt(choix, bonne, liste){
  const vus = new Set([norm(bonne)]), out = [];
  (liste || []).forEach(t => {
    const c = choix.filter(ch => String(t).indexOf(ch + ' ') === 0).sort((x, y) => y.length - x.length)[0];
    if (!c || vus.has(norm(c))) return;
    vus.add(norm(c)); out.push(t);
  });
  return out.length ? ' Piège : ' + out.join(' ; ') + '.' : '';
}
/* « −2 + 3 + 1 − 3 + 6 » */
function chaine(es){ let s = (es[0] < 0 ? '−' : '') + nb(abs(es[0])); for (let i = 1; i < es.length; i++) s += (es[i] < 0 ? ' − ' : ' + ') + nb(abs(es[i])); return s; }
const MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const mot = n => MOTS[n] || nb(n);
const PRENOMS = [['Lina', 'elle'], ['Tom', 'il'], ['Inès', 'elle'], ['Sami', 'il'], ['Maé', 'elle'], ['Yanis', 'il'], ['Zoé', 'elle'], ['Hugo', 'il'], ['Nora', 'elle'], ['Léo', 'il'], ['Jade', 'elle'], ['Adam', 'il']];
const si = pr => pr === 'il' ? 's\'il' : 'si elle';
const pts = x => nb(x) + (x >= 2 ? ' points' : ' point');

/* ---------- table précalculée : entiers de 1 à n, un entier effacé, moyenne des restants (niveau 5) ---------- */
/* On garde les cas où la moyenne est une fraction de dénominateur au moins 3, obtenue par un seul couple (n, k). */
const EFFACE = (function(){
  const compte = new Map(), cand = [];
  for (let n = 3; n <= 140; n++){
    const S = n * (n + 1) / 2;
    for (let k = 1; k <= n; k++){
      const num = S - k, den = n - 1, g = gcd(num, den), cle = (num / g) + '/' + (den / g);
      compte.set(cle, (compte.get(cle) || 0) + 1);
      if (n >= 15 && n <= 60) cand.push([n, k, num / g, den / g]);
    }
  }
  /* on écarte aussi les cas où le nombre effacé se lirait dans l'écriture de la moyenne (numérateur, dénominateur, partie entière) */
  return cand.filter(c => { const E = Math.floor(c[2] / c[3]), rr = c[2] - E * c[3]; return c[3] >= 3 && c[3] <= 30 && compte.get(c[2] + '/' + c[3]) === 1 && [rr, c[3], E, c[2], c[0]].indexOf(c[1]) < 0; });
})();

/* =========================== NIVEAU 1 =========================== */

function n1Manquant(R){
  const s = tirer(() => {
    const n = R.pick([3, 3, 4]), ctx = R.int(0, 3), vals = [];
    let m, lo, hi;
    if (ctx === 1){ m = R.int(9, 15); lo = 0; hi = 20; for (let i = 0; i < n - 1; i++) vals.push(R.int(Math.max(4, m - 6), Math.min(19, m + 6))); }
    else if (ctx === 2){ m = R.int(6, 16) * 5; lo = 1; hi = 200; for (let i = 0; i < n - 1; i++) vals.push(m + R.int(-15, 15)); }
    else if (ctx === 3){ m = R.int(8, 24); lo = 1; hi = 40; for (let i = 0; i < n - 1; i++) vals.push(m + R.int(-5, 5)); }
    else { m = R.int(4, 30) * 5; lo = 1; hi = 400; for (let i = 0; i < n - 1; i++) vals.push(m + R.int(-35, 35)); }
    const X = n * m - somme(vals);
    if (X < lo || X > hi || X === m || vals.indexOf(X) >= 0 || vals.some(v => v <= 0)) return null;
    return {n, ctx, m, vals, X, lo, hi};
  }) || {n: 3, ctx: 0, m: 120, vals: [95, 130], X: 135, lo: 1, hi: 400};
  const {n, ctx, m, vals, X, lo, hi} = s, T = n * m, S = somme(vals), D = S - (n - 1) * m;
  const P = R.pick(PRENOMS), u = x => nb(x) + (ctx === 3 ? ' °C' : '');
  let q;
  if (ctx === 0) q = 'La moyenne de ' + mot(n) + ' nombres vaut ' + nb(m) + '. ' + cap(mot(n - 1)) + ' d\'entre eux valent ' + liste(vals) + '. Combien vaut le nombre restant ?';
  else if (ctx === 1) q = P[0] + ' a eu ' + mot(n) + ' notes en gestion ce trimestre, et sa moyenne est de ' + m + ' sur 20. ' + cap(P[1]) + ' se souvient de ' + mot(n - 1) + ' d\'entre elles : ' + liste(vals) + '. Quelle est la note qui manque ?';
  else if (ctx === 2) q = 'Un food truck a servi en moyenne ' + m + ' repas par jour pendant ' + mot(n) + ' jours. Les ' + mot(n - 1) + ' premiers jours, il en a servi ' + liste(vals) + '. Combien de repas a-t-il servis le dernier jour ?';
  else q = 'Sur ' + mot(n) + ' jours, la température moyenne à midi a été de ' + m + ' °C. Les ' + mot(n - 1) + ' premiers jours, il faisait ' + liste(vals, ' °C') + '. Quelle température faisait-il le dernier jour ?';
  const ok = x => x >= lo && x <= hi, signe = 2 * m - X;
  /* troisième distracteur : pour des notes ou des températures, multiplier par n − 1 au lieu de n donne une valeur plausible ;
     pour de plus grands nombres, on prend plutôt l'erreur de retenue de 10 dans la soustraction */
  const petit = ctx === 1 || ctx === 3, d3 = petit ? X - m : (R.int(0, 1) ? X + 10 : X - 10);
  const choix = qcm(u(X), [u(m), ok(signe) ? u(signe) : null, ok(d3) ? u(d3) : null],
    k => { const v = X + alt(k) * (petit ? 1 : 5); return ok(v) ? u(v) : null; });
  const pieges = [u(m) + ' est la moyenne elle-même, pas la valeur cherchée', u(signe) + ' vient d\'une erreur de signe sur l\'écart',
    u(d3) + (petit ? ' vient de ' + (n - 1) + ' × ' + nb(m) + ' au lieu de ' + n + ' × ' + nb(m) + ' : il y a bien ' + mot(n) + ' valeurs en tout' : ' vient d\'une erreur de retenue dans la soustraction')];
  return {
    q, a: u(X), accept: null, choix,
    expl: 'Transforme la moyenne en somme : la somme de toutes les valeurs vaut effectif × moyenne. Ici, la somme des ' + mot(n) + ' valeurs vaut ' + n + ' × ' + nb(m) + ' = ' + nb(T) + '. Les valeurs connues totalisent ' + plus(vals) + ' = ' + nb(S) + '. Il manque donc ' + nb(T) + ' − ' + nb(S) + ' = ' + u(X) + '. Autre chemin, avec les écarts à la moyenne : les valeurs connues sont à ' + liste(vals.map(v => ecart(v - m))) + ' de ' + nb(m) + ', soit ' + ecart(D) + ' au total. Les écarts se compensent toujours, donc la valeur cherchée est à ' + ecart(-D) + ' de la moyenne : ' + u(X) + '.', _p: pieges
  };
}

function n1Deux(R){
  const s = tirer(() => {
    const ctx = R.int(0, 3);
    let m, x;
    if (ctx === 0){ m = R.int(15, 99); x = R.int(5, 2 * m - 5); }
    else if (ctx === 1){ m = R.int(8, 30); x = m + R.int(1, Math.min(7, m - 2)); }
    else if (ctx === 2){ m = R.int(4, 25); x = R.int(2, 2 * m - 2); }
    else { m = R.int(55, 95); x = m + R.int(-20, 20); }
    const Y = 2 * m - x;
    if (Y <= 0 || Y === x || x === m) return null;
    return {ctx, m, x, Y};
  }) || {ctx: 0, m: 35, x: 22, Y: 48};
  const {ctx, m, x, Y} = s, u = v => nb(v) + (ctx === 1 ? (v >= 2 ? ' ans' : ' an') : ctx === 2 ? ' kg' : '');
  let q;
  if (ctx === 0) q = 'La moyenne de deux nombres vaut ' + m + '. L\'un d\'eux vaut ' + x + '. Combien vaut l\'autre ?';
  else if (ctx === 1) q = 'Deux sœurs ont en moyenne ' + m + ' ans. L\'aînée a ' + x + ' ans. Quel âge a la cadette ?';
  else if (ctx === 2) q = 'Deux valises pèsent en moyenne ' + m + ' kg. La première pèse ' + x + ' kg. Combien pèse la seconde ?';
  else q = 'Sur deux matchs, une équipe de basket a marqué en moyenne ' + m + ' points. Elle en a marqué ' + x + ' au premier match. Combien en a-t-elle marqué au second ?';
  const e = abs(x - m), inv = 2 * x - m;
  const choix = qcm(u(Y), [u(e), u(m), inv > 0 ? u(inv) : null, u(2 * m)], k => { const v = Y + alt(k); return v > 0 ? u(v) : null; });
  const pieges = [];
  if (present(choix, u(e))) pieges.push(u(e) + ' n\'est que l\'écart entre le nombre connu et la moyenne');
  if (present(choix, u(m))) pieges.push(u(m) + ' est la moyenne elle-même');
  if (inv > 0 && present(choix, u(inv))) pieges.push(u(inv) + ' inverse les rôles de la moyenne et du nombre connu');
  if (present(choix, u(2 * m))) pieges.push(u(2 * m) + ' est la somme des deux, pas le second');
  return {
    q, a: u(Y), accept: null, choix,
    expl: 'Deux nombres ont pour somme deux fois leur moyenne : calcule cette somme, puis retire le nombre connu. La somme vaut 2 × ' + m + ' = ' + (2 * m) + ', donc l\'autre vaut ' + (2 * m) + ' − ' + x + ' = ' + u(Y) + '. Autre façon de voir : ' + x + ' est ' + e + ' ' + (x > m ? 'au-dessus' : 'au-dessous') + ' de la moyenne, donc l\'autre est ' + e + ' ' + (x > m ? 'au-dessous' : 'au-dessus') + '. Vérification : (' + x + ' + ' + Y + ') ÷ 2 = ' + m + '.', _p: pieges
  };
}

function n1Ajout(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2), n = R.pick([2, 3, 4, 5, 7, 9]), d = R.pick([-3, -2, -1, 1, 2, 3]);
    const m = ctx === 0 ? R.int(10, 60) : ctx === 1 ? R.int(8, 14) : R.int(18, 30);
    const x = m + (n + 1) * d;
    if (x <= 0) return null;
    if (ctx === 1 && x > 20) return null;
    if (ctx === 2 && (x < 15 || x > 45)) return null;
    return {ctx, n, m, d, x, M: m + d};
  }) || {ctx: 0, n: 4, m: 25, d: 3, x: 40, M: 28};
  const {ctx, n, m, x, M} = s, P = R.pick(PRENOMS), u = v => nb(v) + (ctx === 2 ? ' ans' : '');
  let q;
  if (ctx === 0) q = 'La moyenne de ' + mot(n) + ' nombres vaut ' + m + '. On ajoute le nombre ' + x + '. Quelle est la moyenne des ' + mot(n + 1) + ' nombres ?';
  else if (ctx === 1) q = P[0] + ' a ' + mot(n) + ' notes, de moyenne ' + m + '. ' + cap(P[1]) + ' obtient ' + x + ' au devoir suivant. Quelle est sa nouvelle moyenne ?';
  else q = 'Un groupe de ' + mot(n) + ' amis a un âge moyen de ' + m + ' ans. Un ami de ' + x + ' ans les rejoint. Quel est maintenant l\'âge moyen du groupe ?';
  const mm = (m + x) / 2, oubli = (n * m + x) / n;
  const choix = qcm(u(M), [u(mm), dec2(oubli) ? u(oubli) : null], k => { const v = M + alt(k); return v > 0 ? u(v) : null; });
  const pieges = [];
  if (present(choix, u(mm))) pieges.push(u(mm) + ' fait la moyenne de ' + m + ' et de ' + x + ', comme si la nouvelle valeur pesait autant que toutes les anciennes réunies');
  if (dec2(oubli) && present(choix, u(oubli))) pieges.push(u(oubli) + ' divise par ' + n + ' au lieu de ' + (n + 1) + ' : l\'effectif a augmenté');
  return {
    q, a: u(M), accept: null, choix,
    expl: 'Repasse par les sommes : calcule la somme des anciennes valeurs, ajoute la nouvelle, puis divise par le nouvel effectif. Ancienne somme : ' + n + ' × ' + m + ' = ' + (n * m) + '. Nouvelle somme : ' + (n * m) + ' + ' + x + ' = ' + (n * m + x) + '. Il y a maintenant ' + (n + 1) + ' valeurs, donc la moyenne vaut ' + (n * m + x) + ' ÷ ' + (n + 1) + ' = ' + u(M) + '. Contrôle : ' + x + ' est ' + (x > m ? 'au-dessus' : 'au-dessous') + ' de l\'ancienne moyenne ' + m + ', donc la nouvelle moyenne est ' + (x > m ? 'plus grande' : 'plus petite') + ' que ' + m + ', sans aller jusqu\'à ' + x + '.', _p: pieges
  };
}

function n1Ecarts(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2), k = R.pick([4, 5]);
    const ref = ctx === 0 ? R.pick([50, 100, 200, 500, 1000, 2000]) : ctx === 1 ? R.pick([250, 500, 1000]) : R.pick([100, 150, 200, 300]);
    const es = []; for (let i = 0; i < k; i++) es.push(R.int(-9, 9));
    if (new Set(es).size !== k) return null;
    const D = somme(es);
    if (D === 0 || D % k !== 0 || es.every(e => e >= 0) || es.every(e => e <= 0)) return null;
    if (es.indexOf(D / k) >= 0) return null;   // la moyenne ne doit pas être l'une des valeurs de la liste
    return {ctx, k, ref, es, D, d: D / k};
  }) || {ctx: 0, k: 5, ref: 100, es: [-2, 3, 1, -3, 6], D: 5, d: 1};
  const {ctx, k, ref, es, D, d} = s, vals = es.map(e => ref + e), M = ref + d;
  const u = v => nb(v) + (ctx === 1 ? ' g' : '');
  let q;
  if (ctx === 0) q = 'Quelle est la moyenne des nombres ' + liste(vals) + ' ?';
  else if (ctx === 1) q = cap(mot(k)) + ' paquets de café pèsent ' + liste(vals) + ' grammes. Quelle est leur masse moyenne ?';
  else q = 'Un cinéma a accueilli ' + liste(vals) + ' spectateurs lors de ses ' + mot(k) + ' dernières séances. Combien de spectateurs a-t-il accueillis en moyenne par séance ?';
  const choix = qcm(u(M), [u(ref), u(ref + D), u(ref - d)], j => u(M + alt(j)));
  const pieges = [];
  if (present(choix, u(ref + D))) pieges.push(u(ref + D) + ' ajoute la somme des écarts sans la diviser par ' + k);
  if (present(choix, u(ref - d))) pieges.push(u(ref - d) + ' se trompe de signe sur l\'écart moyen');
  if (present(choix, u(ref))) pieges.push(u(ref) + ' est seulement la valeur de référence');
  return {
    q, a: u(M), accept: null, choix,
    expl: 'Choisis une valeur ronde de référence et fais la moyenne des écarts à cette valeur : c\'est plus rapide que de tout additionner. Avec ' + nb(ref) + ' comme référence, les écarts sont ' + liste(es.map(ecart)) + '. Leur somme vaut ' + chaine(es) + ' = ' + ecart(D) + ', et leur moyenne ' + ecart(D) + ' ÷ ' + k + ' = ' + ecart(d) + '. La moyenne vaut donc ' + nb(ref) + (d > 0 ? ' + ' : ' − ') + abs(d) + ' = ' + u(M) + '. Contrôle : la somme des ' + mot(k) + ' valeurs vaut ' + nb(somme(vals)) + ', et ' + nb(somme(vals)) + ' ÷ ' + k + ' = ' + nb(M) + '.', _p: pieges
  };
}

/* =========================== NIVEAU 2 =========================== */

function n2Retrait(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2), n = R.pick([5, 6, 9, 11]);
    let m, r;
    if (ctx === 0){ m = R.int(9, 14); r = R.int(2, 20); }
    else if (ctx === 1){ m = R.int(21, 29); r = R.int(17, 38); }
    else { m = R.int(10, 60); r = R.int(1, 99); }
    const mp = (n * m - r) / (n - 1);
    if (r === m || !dec2(mp) || mp <= 0) return null;
    if (dans(r, [n, n - 1, mp])) return null;
    return {ctx, n, m, r, mp};
  }) || {ctx: 2, n: 6, m: 12, r: 15, mp: 11.4};
  const {ctx, n, m, r, mp} = s, u = v => nb(v) + (ctx === 1 ? ' ans' : '');
  let q;
  if (ctx === 0) q = 'La moyenne de ' + mot(n) + ' notes vaut ' + m + '. Le professeur annule l\'une de ces notes, et la moyenne des ' + mot(n - 1) + ' notes restantes devient ' + nb(mp) + '. Quelle note a été annulée ?';
  else if (ctx === 1) q = 'Les ' + mot(n) + ' joueurs d\'une équipe ont un âge moyen de ' + m + ' ans. L\'un d\'eux quitte l\'équipe, et l\'âge moyen des ' + mot(n - 1) + ' autres devient ' + nb(mp) + ' ans. Quel âge a le joueur qui est parti ?';
  else q = cap(mot(n)) + ' nombres ont pour moyenne ' + m + '. On en retire un, et la moyenne des ' + mot(n - 1) + ' nombres restants devient ' + nb(mp) + '. Quel nombre a-t-on retiré ?';
  /* n × (écart des moyennes) : plausible pour des notes ou des nombres, absurde pour un âge, donc écarté dans ce contexte */
  const oubli = n * abs(m - mp), sens = 2 * m - r, max = ctx === 0 ? 20 : 999, lo = ctx === 1 ? 16 : 0, okv = v => v > lo && v <= max;
  const choix = qcm(u(r), [ctx !== 1 && oubli > 0 && dec2(oubli) ? u(oubli) : null, okv(sens) ? u(sens) : null, u(m)], k => { const v = r + alt(k); return okv(v) ? u(v) : null; });
  const pieges = [];
  if (present(choix, u(oubli))) pieges.push(u(oubli) + ' vient de ' + n + ' × (' + nb(Math.max(m, mp)) + ' − ' + nb(Math.min(m, mp)) + '), comme si l\'effectif ne changeait pas');
  if (sens > 0 && present(choix, u(sens))) pieges.push(u(sens) + ' se trompe de sens : la moyenne ' + (mp < m ? 'baisse, donc la valeur retirée était au-dessus' : 'monte, donc la valeur retirée était au-dessous') + ' de ' + m);
  if (present(choix, u(m))) pieges.push(u(m) + ' est l\'ancienne moyenne : retirer une valeur égale à la moyenne ne la changerait pas');
  return {
    q, a: u(r), accept: null, choix,
    expl: 'Transforme les deux moyennes en sommes, chacune avec son propre effectif : la différence des deux sommes est la valeur retirée. Avant : ' + n + ' × ' + m + ' = ' + (n * m) + '. Après : ' + (n - 1) + ' × ' + nb(mp) + ' = ' + nb((n - 1) * mp) + '. La valeur retirée vaut ' + (n * m) + ' − ' + nb((n - 1) * mp) + ' = ' + u(r) + '. Vérification : (' + (n * m) + ' − ' + r + ') ÷ ' + (n - 1) + ' = ' + nb(mp) + '.', _p: pieges
  };
}

function n2Groupes(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2);
    let n1, n2, m1, m2;
    if (ctx === 1){ n1 = R.int(2, 8) * 10; n2 = R.int(2, 8) * 10; m1 = R.int(4, 16) * 5; m2 = R.int(4, 16) * 5; }
    else { n1 = R.int(5, 24); n2 = R.int(5, 24); m1 = R.int(6, 16); m2 = R.int(6, 16); }
    if (n1 === n2 || abs(m1 - m2) < 2 || (ctx !== 1 && n1 + n2 > 36)) return null;
    const M = (n1 * m1 + n2 * m2) / (n1 + n2);
    if (!dec1(M)) return null;
    if (dans(M, [n1, n2])) return null;
    return {ctx, n1, n2, m1, m2, M};
  }) || {ctx: 0, n1: 20, n2: 10, m1: 13, m2: 10, M: 12};
  const {ctx, n1, n2, m1, m2, M} = s, u = ctx === 1 ? eur2 : (v => nb(v));
  let q;
  if (ctx === 0) q = 'Une classe compte ' + n1 + ' filles et ' + n2 + ' garçons. À un contrôle, les filles ont obtenu ' + m1 + ' de moyenne et les garçons ' + m2 + '. Quelle est la moyenne de la classe ?';
  else if (ctx === 1) q = 'Samedi, une boutique a encaissé ' + n1 + ' tickets de caisse d\'un montant moyen de ' + m1 + ' € le matin, et ' + n2 + ' tickets d\'un montant moyen de ' + m2 + ' € l\'après-midi. Quel est le montant moyen d\'un ticket sur la journée ?';
  else q = 'Deux groupes passent le même examen : ' + n1 + ' étudiants avec une moyenne de ' + m1 + ', et ' + n2 + ' étudiants avec une moyenne de ' + m2 + '. Quelle est la moyenne de l\'ensemble des étudiants ?';
  const mm = (m1 + m2) / 2, inv = (n2 * m1 + n1 * m2) / (n1 + n2), N = n1 + n2, S = n1 * m1 + n2 * m2;
  const choix = qcm(u(M), [u(mm), dec2(inv) ? u(inv) : null], k => u(M + alt(k) * (ctx === 1 ? 1 : 0.5)));
  const pieges = [];
  if (present(choix, u(mm))) pieges.push(u(mm) + ' est la moyenne des deux moyennes : elle donne le même poids aux deux groupes, alors qu\'ils n\'ont pas le même effectif');
  if (dec2(inv) && present(choix, u(inv))) pieges.push(u(inv) + ' échange les effectifs des deux groupes');
  const gros = n1 > n2 ? m1 : m2;
  return {
    q, a: u(M), accept: null, choix,
    expl: 'La moyenne de deux groupes se calcule avec les sommes : somme totale ÷ effectif total. Premier groupe : ' + n1 + ' × ' + m1 + ' = ' + nb(n1 * m1) + '. Second groupe : ' + n2 + ' × ' + m2 + ' = ' + nb(n2 * m2) + '. Somme totale : ' + nb(S) + ', effectif total : ' + N + '. Moyenne : ' + nb(S) + ' ÷ ' + N + ' = ' + u(M) + '. Contrôle : le groupe le plus nombreux pèse plus, donc la moyenne est plus proche de ' + gros + '.', _p: pieges
  };
}

function n2Viser(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2), k = R.pick([3, 4, 5, 6, 7, 9]);
    let m, M;
    if (ctx === 0){ m = R.int(16, 28) / 2; if (!ent(m * k)) return null; M = Math.floor(m) + R.int(1, 2); }
    else if (ctx === 1){ m = R.int(20, 30); M = m + R.int(1, 3); }
    else { m = R.int(5, 15); M = m + R.int(1, 3); }
    const x = (k + 1) * M - k * m;
    if (!ent(x) || x <= 0 || x === M || (ctx === 0 && x > 20)) return null;
    if (dans(x, [k, m])) return null;
    return {ctx, k, m, M, x};
  }) || {ctx: 0, k: 4, m: 11, M: 12, x: 16};
  const {ctx, k, m, M, x} = s, P = R.pick(PRENOMS);
  let q;
  if (ctx === 0) q = P[0] + ' a obtenu ' + mot(k) + ' notes, avec une moyenne de ' + nb(m) + '. Quelle note doit-' + P[1] + ' obtenir au prochain devoir pour que sa moyenne passe à ' + M + ' ?';
  else if (ctx === 1) q = 'Lors des ' + mot(k) + ' premiers matchs de la saison, une équipe de handball a marqué en moyenne ' + m + ' buts. Combien de buts doit-elle marquer au match suivant pour que sa moyenne passe à ' + M + ' buts par match ?';
  else q = 'Un vendeur a vendu en moyenne ' + m + ' téléphones par jour pendant ' + mot(k) + ' jours. Combien doit-il en vendre le jour suivant pour que sa moyenne atteigne ' + M + ' téléphones par jour ?';
  const une = 2 * M - m, retard = k * (M - m), max = ctx === 0 ? 20 : 999;
  const ok = v => dec2(v) && v > 0 && v <= max;
  const choix = qcm(nb(x), [ok(une) ? nb(une) : null, nb(M), ok(retard) ? nb(retard) : null], j => { const v = x + alt(j); return v > 0 && v <= max ? nb(v) : null; });
  const pieges = [nb(une) + ' ne rattrape le retard qu\'une seule fois, comme s\'il n\'y avait qu\'une valeur avant', nb(M) + ' ne suffit pas : la moyenne se rapprocherait de ' + M + ' sans l\'atteindre', nb(retard) + ' est seulement le retard accumulé sur les ' + mot(k) + ' valeurs déjà obtenues : il faut l\'ajouter à ' + M];
  return {
    q, a: nb(x), accept: null, choix,
    expl: 'Calcule la somme qu\'il faudra atteindre avec le nouvel effectif, puis retire la somme déjà obtenue. Somme actuelle : ' + k + ' × ' + nb(m) + ' = ' + nb(k * m) + '. Pour une moyenne de ' + M + ' sur ' + (k + 1) + ' valeurs, il faut une somme de ' + (k + 1) + ' × ' + M + ' = ' + ((k + 1) * M) + '. Il manque ' + ((k + 1) * M) + ' − ' + nb(k * m) + ' = ' + nb(x) + '. Autre lecture : la nouvelle valeur doit valoir ' + M + ' et en plus combler un retard de ' + nb(M - m) + ' sur chacune des ' + mot(k) + ' valeurs déjà obtenues, soit ' + M + ' + ' + k + ' × ' + nb(M - m) + ' = ' + nb(x) + '.', _p: pieges
  };
}

function n2Grands(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2), st = R.int(0, 1);
    let m, x;
    if (st === 0){ const t = R.int(1, 999), a = R.int(2, 5), b = R.int(1, 9); if (b === a || 2 * a - b < 1 || 2 * a - b > 9) return null; m = 1000 * a + t; x = 1000 * b + t; }
    else { m = R.int(2000, 6000); x = R.int(1000, 9000); }
    const Y = 2 * m - x;
    if (Y < 1000 || Y > 9999 || Y === x || x === m || abs(Y - x) < 200 || m === 4042) return null;
    return {ctx, m, x, Y};
  }) || {ctx: 0, m: 3518, x: 1975, Y: 5061};
  const {ctx, m, x, Y} = s, u = ctx === 2 ? eur : (v => nb(v));
  let q;
  if (ctx === 0) q = 'Deux nombres ont pour moyenne ' + nb(m) + '. L\'un d\'eux vaut ' + nb(x) + '. Combien vaut l\'autre ?';
  else if (ctx === 1) q = 'Deux villages comptent en moyenne ' + nb(m) + ' habitants. Le premier en compte ' + nb(x) + '. Combien d\'habitants compte le second ?';
  else q = 'Deux scooters d\'occasion coûtent en moyenne ' + nb(m) + ' €. Le premier coûte ' + nb(x) + ' €. Combien coûte le second ?';
  const rond = Math.round(Y / 1000) * 1000, ret = Y + 1000 <= 9999 ? Y + 1000 : Y - 1000, e = abs(m - x);
  const cands = R.shuffle([u(m), rond !== Y ? u(rond) : null, u(ret), u(e)]);
  const choix = qcm(u(Y), cands, k => u(Y + alt(k) * 100));
  const pieges = [];
  if (present(choix, u(m))) pieges.push(u(m) + ' est la moyenne elle-même');
  if (rond !== Y && present(choix, u(rond))) pieges.push(u(rond) + ' est un nombre rond qui ressemble à la réponse, mais ne redonne pas la bonne moyenne');
  if (present(choix, u(ret))) pieges.push(u(ret) + ' vient d\'une erreur de retenue sur les milliers');
  if (present(choix, u(e))) pieges.push(u(e) + ' n\'est que l\'écart entre ' + nb(x) + ' et la moyenne');
  return {
    q, a: u(Y), accept: null, choix,
    expl: 'Deux nombres ont pour somme deux fois leur moyenne : double la moyenne, puis retire le nombre connu. 2 × ' + nb(m) + ' = ' + nb(2 * m) + ', puis ' + nb(2 * m) + ' − ' + nb(x) + ' = ' + u(Y) + '. Contrôle par les écarts : ' + nb(x) + ' est ' + nb(e) + ' ' + (x < m ? 'au-dessous' : 'au-dessus') + ' de la moyenne, donc l\'autre est ' + nb(e) + ' ' + (x < m ? 'au-dessus' : 'au-dessous') + ' : ' + nb(m) + (x < m ? ' + ' : ' − ') + nb(e) + ' = ' + nb(Y) + '.', _p: pieges
  };
}

const MATIERES = [['gestion', 'économie', 'anglais'], ['mathématiques', 'droit', 'histoire'], ['management', 'espagnol', 'philosophie']];
function n2Coef(R){
  const s = tirer(() => {
    const notes = [R.int(5, 19), R.int(5, 19), R.int(5, 19)], co = [R.int(1, 4), R.int(1, 4), R.int(1, 4)];
    if (co[0] === co[1] && co[1] === co[2]) return null;
    const C = somme(co), P = notes[0] * co[0] + notes[1] * co[1] + notes[2] * co[2], W = P / C, U = somme(notes) / 3;
    if (!dec1(W) || abs(W - U) < 0.2) return null;
    if (dans(W, notes)) return null;
    return {notes, co, C, P, W, U};
  }) || {notes: [14, 8, 11], co: [3, 1, 2], C: 6, P: 72, W: 12, U: 11};
  const {notes, co, C, P, W, U} = s, ctx = R.int(0, 1), Pr = R.pick(PRENOMS), mat = R.pick(MATIERES);
  let q;
  if (ctx === 0) q = Pr[0] + ' a obtenu ' + notes[0] + ' en ' + mat[0] + ' (coefficient ' + co[0] + '), ' + notes[1] + ' en ' + mat[1] + ' (coefficient ' + co[1] + ') et ' + notes[2] + ' en ' + mat[2] + ' (coefficient ' + co[2] + '). Quelle est sa moyenne ?';
  else q = 'Un concours comporte trois épreuves : un écrit de coefficient ' + co[0] + ', un oral de coefficient ' + co[1] + ' et un dossier de coefficient ' + co[2] + '. Un candidat obtient ' + notes[0] + ' à l\'écrit, ' + notes[1] + ' à l\'oral et ' + notes[2] + ' au dossier. Quelle est sa moyenne au concours ?';
  const parTrois = P / 3, oubli = co[2] !== 1 ? (P - (co[2] - 1) * notes[2]) / (C - co[2] + 1) : null;
  const choix = qcm(nb(W), [dec2(U) ? nb(U) : null, dec2(parTrois) && parTrois <= 20 ? nb(parTrois) : null, oubli !== null && dec2(oubli) ? nb(oubli) : null], k => { const v = W + alt(k) * 0.5; return v > 0 && v <= 20 ? nb(v) : null; });
  const pieges = [];
  if (dec2(U) && present(choix, nb(U))) pieges.push(nb(U) + ' est la moyenne sans les coefficients');
  if (dec2(parTrois) && present(choix, nb(parTrois))) pieges.push(nb(parTrois) + ' divise par le nombre de notes au lieu de la somme des coefficients');
  if (oubli !== null && present(choix, nb(oubli))) pieges.push(nb(oubli) + ' oublie le coefficient de la dernière épreuve');
  return {
    q, a: nb(W), accept: null, choix,
    expl: 'Dans une moyenne pondérée, chaque note compte autant de fois que son coefficient : additionne les produits note × coefficient, puis divise par la somme des coefficients. Produits : ' + notes.map((n, i) => n + ' × ' + co[i] + ' = ' + (n * co[i])).join(', ') + '. Total : ' + P + ' points pour ' + C + ' coefficients. Moyenne : ' + P + ' ÷ ' + C + ' = ' + nb(W) + '.', _p: pieges
  };
}

function n2Reguliere(R){
  const ctx = R.int(0, 3);
  let q, A0, B0, pas, M, autres, detail;
  if (ctx <= 2){
    const s = tirer(() => {
      let a, b, p;
      if (ctx === 0){ p = 1; a = R.int(10, 90); b = a + R.int(10, 80); }
      else if (ctx === 1){ p = 2; a = 2 * R.int(5, 40); b = a + 2 * R.int(5, 40); }
      else { p = R.pick([3, 5, 7, 9, 11]); a = p * R.int(2, 15); b = a + p * R.int(5, 25); }
      return {a, b, p};
    }) || {a: 37, b: 85, p: 1};
    A0 = s.a; B0 = s.b; pas = s.p; M = (A0 + B0) / 2;
    if (ctx === 0) q = 'Quelle est la moyenne de tous les entiers de ' + nb(A0) + ' à ' + nb(B0) + ' ?';
    else if (ctx === 1) q = 'Quelle est la moyenne de tous les nombres pairs de ' + nb(A0) + ' à ' + nb(B0) + ' ?';
    else q = 'Quelle est la moyenne de tous les multiples de ' + pas + ' de ' + nb(A0) + ' à ' + nb(B0) + ' ?';
    autres = [[(B0 - A0) / 2, 'prend la moitié de l\'écart entre le premier et le dernier, au lieu de la moitié de leur somme'], [(A0 + B0 + pas) / 2, 'décale le dernier terme d\'un cran'], [B0 / 2, 'oublie le premier nombre']];
    detail = 'Le premier vaut ' + nb(A0) + ', le dernier ' + nb(B0) + ' : la moyenne vaut (' + nb(A0) + ' + ' + nb(B0) + ') ÷ 2 = ' + nb(M) + '.';
  } else {
    const u0 = R.int(1, 20), r = R.int(2, 9), N = R.int(8, 30), last = u0 + (N - 1) * r;
    M = (u0 + last) / 2; A0 = u0; B0 = last;
    q = 'Une suite arithmétique a pour premier terme ' + u0 + ' et pour raison ' + r + '. Quelle est la moyenne de ses ' + N + ' premiers termes ?';
    autres = [[u0 + N * r / 2, 'calcule le dernier terme avec ' + N + ' raisons au lieu de ' + (N - 1)], [last, 'est le dernier terme, pas la moyenne'], [(N - 1) * r / 2, 'oublie d\'ajouter le premier terme']];
    detail = 'Le dernier des ' + N + ' termes vaut ' + u0 + ' + ' + (N - 1) + ' × ' + r + ' = ' + last + ' (on ajoute ' + (N - 1) + ' fois la raison, pas ' + N + '). La moyenne vaut (' + u0 + ' + ' + last + ') ÷ 2 = ' + nb(M) + '.';
  }
  const choix = qcm(nb(M), autres.map(c => c[0] > 0 && dec2(c[0]) ? nb(c[0]) : null), k => nb(M + alt(k)));
  const pieges = autres.filter(c => c[0] > 0 && dec2(c[0]) && present(choix, nb(c[0]))).map(c => nb(c[0]) + ' ' + c[1]);
  return {
    q, a: nb(M), accept: null, choix,
    expl: 'Pour des nombres régulièrement espacés, la moyenne est celle du premier et du dernier : (premier + dernier) ÷ 2, car les nombres se répartissent par paires symétriques autour du milieu. ' + detail, _p: pieges
  };
}

/* =========================== NIVEAU 3 =========================== */

function n3Commun5(R){
  const s = tirer(() => {
    const ctx = R.int(0, 1), m = ctx === 1 ? R.int(8, 40) : R.int(10, 60), a = m + R.int(-8, 8), b = m + R.int(-8, 8);
    if (a === b || a + b === 2 * m || a === m || b === m) return null;
    const x3 = 3 * a + 3 * b - 5 * m;
    if (x3 <= 0 || 3 * a - x3 < 2 || 3 * b - x3 < 2) return null;
    /* valeurs vraisemblables : l'élément du milieu et les deux paires extrêmes restent du même ordre que la moyenne */
    const pA = (3 * a - x3) / 2, pB = (3 * b - x3) / 2;
    if (x3 < 0.4 * m || x3 > 1.8 * m || pA < 0.4 * m || pB < 0.4 * m || pA > 1.8 * m || pB > 1.8 * m) return null;
    if (dans(x3, [a, b, m])) return null;
    return {ctx, m, a, b, x3};
  }) || {ctx: 0, m: 20, a: 16, b: 25, x3: 23};
  const {ctx, m, a, b, x3} = s;
  let q;
  if (ctx === 0) q = 'Cinq nombres ont pour moyenne ' + m + '. Les trois premiers ont pour moyenne ' + a + ', et les trois derniers ont pour moyenne ' + b + '. Que vaut le troisième nombre ?';
  else q = 'Du lundi au vendredi, une librairie a vendu en moyenne ' + m + ' livres par jour. Du lundi au mercredi, la moyenne a été de ' + a + ' livres par jour, et du mercredi au vendredi de ' + b + ' livres par jour. Combien de livres a-t-elle vendus le mercredi ?';
  const moy = a + b - m, mil = (a + b) / 2;
  const choix = qcm(nb(x3), [moy > 0 ? nb(moy) : null, dec2(mil) ? nb(mil) : null, nb(m)], k => { const v = x3 + alt(k); return v > 0 ? nb(v) : null; });
  const pieges = [];
  if (moy > 0 && present(choix, nb(moy))) pieges.push(nb(moy) + ' fait le même calcul avec les moyennes au lieu des sommes, ce qui est faux car les groupes n\'ont pas le même effectif');
  if (present(choix, nb(mil))) pieges.push(nb(mil) + ' est la moyenne des deux moyennes, qui ne dit rien de l\'élément commun');
  if (present(choix, nb(m))) pieges.push(nb(m) + ' est la moyenne générale');
  const el = ctx === 0 ? 'le troisième nombre' : 'le mercredi';
  return {
    q, a: nb(x3), accept: null, choix,
    expl: 'Transforme les trois moyennes en sommes : l\'élément du milieu appartient aux deux groupes de trois, donc il est compté deux fois quand on additionne leurs sommes. Les trois premiers totalisent 3 × ' + a + ' = ' + (3 * a) + ', les trois derniers 3 × ' + b + ' = ' + (3 * b) + ', et les cinq 5 × ' + m + ' = ' + (5 * m) + '. ' + cap(String(3 * a)) + ' + ' + (3 * b) + ' = ' + (3 * a + 3 * b) + ' compte les cinq valeurs plus une seconde fois ' + el + ', donc ' + el + ' vaut ' + (3 * a + 3 * b) + ' − ' + (5 * m) + ' = ' + x3 + '.', _p: pieges
  };
}

function n3Correction(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2), n = R.pick([10, 20, 25, 40, 50]);
    let m, x, y;
    if (ctx === 0){ m = R.int(16, 28) / 2; x = R.int(2, 19); y = x + R.pick([-1, 1]) * R.int(3, 10); if (y < 0 || y > 20) return null; }
    else if (ctx === 1){ m = R.int(10, 25); x = R.int(8, 35); y = x + R.pick([-1, 1]) * R.int(3, 19); if (y < 5 || y > 40) return null; }
    else { m = R.int(5, 30); x = R.int(3, 40); y = x + R.pick([-1, 1]) * R.int(3, 30); if (y < 1 || y > 60) return null; }
    const M = m + (x - y) / n;
    if (!dec2(M) || M <= 0) return null;
    return {ctx, n, m, x, y, M};
  }) || {ctx: 0, n: 20, m: 11, x: 17, y: 7, M: 11.5};
  const {ctx, n, m, x, y, M} = s, u = v => nb(v) + (ctx === 1 ? ' °C' : ctx === 2 ? ' kg' : '');
  let q;
  if (ctx === 0) q = 'Un professeur calcule la moyenne des ' + n + ' notes d\'un devoir et trouve ' + nb(m) + '. Il s\'aperçoit ensuite qu\'il a saisi ' + y + ' au lieu de ' + x + ' pour l\'une des copies. Quelle est la vraie moyenne ?';
  else if (ctx === 1) q = 'Sur ' + n + ' jours, la température moyenne relevée est de ' + nb(m) + ' °C. On découvre qu\'une température de ' + x + ' °C avait été notée ' + y + ' °C. Quelle est la vraie température moyenne ?';
  else q = 'La masse moyenne de ' + n + ' colis est de ' + nb(m) + ' kg. On s\'aperçoit qu\'un colis de ' + x + ' kg avait été enregistré à ' + y + ' kg. Quelle est la vraie masse moyenne ?';
  const d = x - y, sansDiv = m + d, sens = m - d / n, nm1 = m + d / (n - 1);
  const choix = qcm(u(M), [sansDiv > 0 ? u(sansDiv) : null, sens > 0 ? u(sens) : null, dec2(nm1) ? u(nm1) : null], k => { const v = M + alt(k) * 0.1; return v > 0 ? u(v) : null; });
  const pieges = [];
  if (sansDiv > 0 && present(choix, u(sansDiv))) pieges.push(u(sansDiv) + ' reporte toute l\'erreur sur la moyenne sans la partager entre les ' + n + ' valeurs');
  if (sens > 0 && present(choix, u(sens))) pieges.push(u(sens) + ' corrige dans le mauvais sens : la vraie valeur est ' + (d > 0 ? 'plus grande' : 'plus petite') + ', donc la vraie moyenne aussi');
  if (dec2(nm1) && present(choix, u(nm1))) pieges.push(u(nm1) + ' divise par ' + (n - 1) + ' alors que l\'effectif n\'a pas changé');
  return {
    q, a: u(M), accept: null, choix,
    expl: 'Une erreur sur une seule valeur décale la somme de l\'écart entre la bonne et la mauvaise valeur : corrige la somme, puis divise par l\'effectif, qui ne change pas. Somme calculée : ' + n + ' × ' + nb(m) + ' = ' + nb(n * m) + '. Il faut ' + (d > 0 ? 'ajouter ' : 'retirer ') + abs(d) + ' : la vraie somme vaut ' + nb(n * m + d) + '. Vraie moyenne : ' + nb(n * m + d) + ' ÷ ' + n + ' = ' + u(M) + '. Raccourci : la moyenne bouge de ' + abs(d) + ' ÷ ' + n + ' = ' + nb(abs(d) / n, 3) + '.', _p: pieges
  };
}

function n3Grands(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2), k = ctx === 2 ? 4 : 3;
    const M = ctx === 1 ? R.int(800, 2500) : R.int(1200, 9000);
    const es = []; for (let i = 0; i < k - 1; i++) es.push(R.int(-90, 90));
    const D = somme(es);
    if (D === 0 || es.indexOf(0) >= 0 || new Set(es).size < es.length || abs(D) < 5) return null;
    const vals = es.map(e => M + e), X = M - D;
    if (vals.indexOf(X) >= 0) return null;
    return {ctx, k, M, es, vals, D, X};
  }) || {ctx: 0, k: 3, M: 2027, es: [-28, 23], vals: [1999, 2050], D: -5, X: 2032};
  const {ctx, k, M, es, vals, D, X} = s;
  let q;
  if (ctx === 0) q = 'Trois nombres ont pour moyenne ' + nb(M) + '. Deux d\'entre eux valent ' + liste(vals) + '. Quel est le troisième ?';
  else if (ctx === 1) q = 'Trois entreprises emploient en moyenne ' + nb(M) + ' salariés. Les deux premières en emploient ' + liste(vals) + '. Combien de salariés emploie la troisième ?';
  else q = 'La moyenne de quatre nombres vaut ' + nb(M) + '. Trois d\'entre eux valent ' + liste(vals) + '. Quel est le quatrième ?';
  const signe = M + D, ret = R.int(0, 1) ? X + 100 : X - 100;
  const choix = qcm(nb(X), [nb(M), nb(signe), nb(ret)], j => nb(X + alt(j) * 10));
  const pieges = [];
  if (present(choix, nb(signe))) pieges.push(nb(signe) + ' ajoute l\'écart total au lieu de le compenser');
  if (present(choix, nb(M))) pieges.push(nb(M) + ' est la moyenne elle-même');
  if (present(choix, nb(ret))) pieges.push(nb(ret) + ' vient d\'une erreur de retenue sur les centaines');
  return {
    q, a: nb(X), accept: null, choix,
    expl: 'Prends la moyenne comme référence et calcule les écarts : leur total doit valoir 0, ce qui donne l\'écart du nombre manquant. Écarts des nombres connus : ' + liste(es.map(ecart)) + ', au total ' + ecart(D) + '. Le nombre manquant doit compenser avec un écart de ' + ecart(-D) + ' : il vaut ' + nb(M) + (D < 0 ? ' + ' : ' − ') + abs(D) + ' = ' + nb(X) + '. Par les sommes : ' + k + ' × ' + nb(M) + ' = ' + nb(k * M) + ', et ' + nb(k * M) + ' − ' + nb(somme(vals)) + ' = ' + nb(X) + '.', _p: pieges
  };
}

function n3Effectif(R){
  const s = tirer(() => {
    const ctx = R.int(0, 1);
    let N, a, b, f, c;
    if (ctx === 0){ N = R.int(20, 35); a = R.int(10, 16); b = R.int(6, a - 2); f = R.int(3, N - 3); c = (f * a + (N - f) * b) / N; if (!dec1(c)) return null; }
    else { N = R.pick([30, 40, 50, 60]); a = R.int(10, 24); b = R.int(a + 3, 36); f = R.int(1, N / 5 - 1) * 5; c = (f * a + (N - f) * b) / N; if (!ent(c)) return null; }
    if (2 * f === N || c === a || c === b) return null;
    if (dans(f, [N, a, b, c])) return null;
    return {ctx, N, a, b, f, c};
  }) || {ctx: 0, N: 25, a: 14, b: 9, f: 15, c: 12};
  const {ctx, N, a, b, f, c} = s, u = v => nb(v) + (ctx === 1 ? ' kg' : '');
  let q;
  if (ctx === 0) q = 'Dans une classe de ' + N + ' élèves, les filles ont obtenu ' + a + ' de moyenne à un contrôle, les garçons ' + b + ', et la classe entière ' + nb(c) + '. Combien y a-t-il de filles dans la classe ?';
  else q = 'Un torréfacteur mélange un café à ' + a + ' € le kilo et un café à ' + b + ' € le kilo. Il obtient ' + N + ' kg de mélange qui revient à ' + c + ' € le kilo. Combien de kilos de café à ' + a + ' € a-t-il utilisés ?';
  const pas = ctx === 1 ? 5 : 1;
  const choix = qcm(u(f), [u(N - f), ent(N / 2) ? u(N / 2) : null], k => { const v = f + alt(k) * pas; return v > 0 && v < N ? u(v) : null; });
  const pieges = [];
  if (present(choix, u(N - f))) pieges.push(u(N - f) + (ctx === 0 ? ' est le nombre de garçons' : ' est la quantité de l\'autre café'));
  if (ent(N / 2) && present(choix, u(N / 2))) pieges.push(u(N / 2) + ' supposerait que la moyenne tombe pile au milieu de ' + a + ' et ' + b);
  const nom = ctx === 0 ? 'chaque fille' : 'chaque kilo à ' + a + ' €', autre = ctx === 0 ? 'un garçon' : 'un kilo à ' + b + ' €';
  return {
    q, a: u(f), accept: null, choix,
    expl: 'Écris que la somme totale est la somme des deux groupes, puis résous l\'équation obtenue. Avec x ' + (ctx === 0 ? 'filles' : 'kilos à ' + a + ' €') + ' : ' + a + ' × x + ' + b + ' × (' + N + ' − x) = ' + N + ' × ' + nb(c) + ' = ' + nb(N * c) + '. Plus vite, avec les écarts : ' + nom + ' est à ' + nb(abs(a - c)) + ' de la moyenne ' + nb(c) + ' et ' + autre + ' à ' + nb(abs(b - c)) + ' ; les écarts se compensent, donc x × ' + nb(abs(a - c)) + ' = (' + N + ' − x) × ' + nb(abs(b - c)) + '. On trouve x = ' + N + ' × ' + nb(abs(b - c)) + ' ÷ ' + abs(a - b) + ' = ' + f + '. Vérification : ' + a + ' × ' + f + ' + ' + b + ' × ' + (N - f) + ' = ' + nb(a * f + b * (N - f)) + ', et ' + nb(a * f + b * (N - f)) + ' ÷ ' + N + ' = ' + nb(c) + '.', _p: pieges
  };
}

function n3Efface(R){
  const s = tirer(() => {
    const n = R.pick([11, 21, 26, 41, 51]), S = n * (n + 1) / 2, k = R.int(1, n), M = (S - k) / (n - 1);
    if (!dec2(M) || 2 * k === n + 1 || k === 1 || k >= n - 1) return null;   // pas de réponse lisible dans l'énoncé
    return {n, S, k, M};
  }) || {n: 21, S: 231, k: 9, M: 11.1};
  const {n, S, k, M} = s, sym = n + 1 - k, mil = (n + 1) / 2;
  const q = 'On écrit au tableau tous les entiers de 1 à ' + n + '. On en efface un, et la moyenne des ' + (n - 1) + ' nombres restants vaut ' + nb(M) + '. Quel nombre a été effacé ?';
  const choix = qcm(nb(k), [nb(sym), ent(mil) ? nb(mil) : null], j => { const v = k + alt(j); return v >= 1 && v <= n ? nb(v) : null; });
  const pieges = [];
  if (present(choix, nb(sym))) pieges.push(nb(sym) + ' est le nombre symétrique, qui aurait déplacé la moyenne dans l\'autre sens');
  if (ent(mil) && present(choix, nb(mil))) pieges.push('effacer ' + nb(mil) + ', le nombre du milieu, laisserait la moyenne à ' + nb(mil));
  return {
    q, a: nb(k), accept: null, choix,
    expl: 'Calcule la somme de tous les entiers avec 1 + 2 + … + n = n × (n + 1) ÷ 2, puis la somme des nombres restants (effectif × moyenne) : la différence est le nombre effacé. Ici 1 + 2 + … + ' + n + ' = ' + n + ' × ' + (n + 1) + ' ÷ 2 = ' + nb(S) + '. Les ' + (n - 1) + ' nombres restants totalisent ' + (n - 1) + ' × ' + nb(M) + ' = ' + nb(S - k) + '. Le nombre effacé vaut ' + nb(S) + ' − ' + nb(S - k) + ' = ' + k + '. Contrôle : la moyenne de 1 à ' + n + ' vaut ' + nb(mil) + ' ; elle ' + (M > mil ? 'a monté, donc on a effacé un petit nombre' : 'a baissé, donc on a effacé un grand nombre') + '.', _p: pieges
  };
}

function n3Arrivee(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2), n = R.int(4, 14);
    let m, d, x;
    if (ctx === 0){ m = R.int(20, 40); d = R.pick([1, 2]); x = m + d + n * d; if (x > 80) return null; }
    else if (ctx === 1){ m = R.int(22, 30); d = R.pick([0.5, 1]); x = m + d - n * d; if (x < 16 || !ent(x)) return null; }
    else { m = R.int(9, 13); d = R.pick([0.5, 1]); x = m + d + n * d; if (x > 20 || !ent(x)) return null; }
    if (dans(n, [m, x, m + d])) return null;
    return {ctx, n, m, d, x, M: m + d};
  }) || {ctx: 0, n: 10, m: 30, d: 2, x: 52, M: 32};
  const {ctx, n, m, d, x, M} = s, P = R.pick(PRENOMS);
  let q, autres, expl2;
  if (ctx === 1){
    q = 'Dans une équipe de rugby, l\'âge moyen des joueurs est de ' + m + ' ans. Un joueur de ' + x + ' ans quitte l\'équipe, et l\'âge moyen des joueurs restants passe à ' + nb(M) + ' ans. Combien de joueurs l\'équipe comptait-elle avant son départ ?';
    autres = [[n - 1, 'est le nombre de joueurs restants'], [n + 1, 'compte un joueur de trop'], [M - x, 'oublie de diviser par la hausse de la moyenne']];
    expl2 = 'Avec n joueurs au départ : n × ' + m + ' − ' + x + ' = (n − 1) × ' + nb(M) + '. Raccourci : le joueur parti avait ' + nb(M - x) + ' ans de moins que la moyenne des joueurs restants. S\'il revenait, ce manque se répartirait sur les n joueurs et ferait baisser la moyenne de ' + nb(d) + ' : n = ' + nb(M - x) + ' ÷ ' + nb(d) + ' = ' + n + '. Vérification : ' + n + ' × ' + m + ' − ' + x + ' = ' + (n * m - x) + ' et ' + (n - 1) + ' × ' + nb(M) + ' = ' + nb((n - 1) * M) + '.';
  } else {
    if (ctx === 0) q = 'Un groupe de randonneurs a un âge moyen de ' + m + ' ans. Une personne de ' + x + ' ans rejoint le groupe, et l\'âge moyen passe à ' + M + ' ans. Combien de personnes le groupe comptait-il avant son arrivée ?';
    else q = P[0] + ' a une moyenne de ' + m + '. ' + cap(P[1]) + ' obtient ' + x + ' au devoir suivant, et sa moyenne passe à ' + nb(M) + '. Combien de notes avait-' + P[1] + ' avant ce devoir ?';
    autres = [[n + 1, 'compte aussi la nouvelle valeur'], [x - M, 'oublie de diviser par la hausse de la moyenne'], [n - 1, 'retire une valeur de trop']];
    expl2 = 'Avec n valeurs au départ : n × ' + m + ' + ' + x + ' = (n + 1) × ' + nb(M) + '. Raccourci : la nouvelle valeur dépasse la nouvelle moyenne de ' + x + ' − ' + nb(M) + ' = ' + nb(x - M) + ', et cet excédent est partagé entre les n anciennes valeurs pour relever chacune de ' + nb(d) + ' : n = ' + nb(x - M) + ' ÷ ' + nb(d) + ' = ' + n + '. Vérification : ' + n + ' × ' + m + ' + ' + x + ' = ' + (n * m + x) + ' et ' + (n + 1) + ' × ' + nb(M) + ' = ' + nb((n + 1) * M) + '.';
  }
  const ok = v => ent(v) && v > 0;
  const choix = qcm(nb(n), autres.map(c => ok(c[0]) ? nb(c[0]) : null), j => { const v = n + alt(j); return v > 0 ? nb(v) : null; });
  const pieges = autres.filter(c => ok(c[0]) && present(choix, nb(c[0]))).map(c => nb(c[0]) + ' ' + c[1]);
  return {
    q, a: nb(n), accept: null, choix,
    expl: 'Appelle n l\'effectif de départ et écris l\'égalité des sommes, avant et après le changement : chaque somme vaut effectif × moyenne. ' + expl2, _p: pieges
  };
}

function n3Consecutifs(R){
  const ctx = R.int(0, 2);
  let q, rep, autres, detail;
  if (ctx === 0){
    const n = R.pick([7, 9, 11, 15, 21, 25, 31]), M = R.int(20, 2100), h = (n - 1) / 2, L = M + h;
    q = 'La moyenne de ' + n + ' entiers consécutifs vaut ' + nb(M) + '. Quel est le plus grand de ces entiers ?';
    rep = L;
    autres = [[M + n, 'ajoute ' + n + ' à la moyenne au lieu de la moitié de l\'écart'], [L + 1, 'compte un entier de trop au-dessus de la moyenne'], [M + n - 1, 'part de la moyenne comme si c\'était le plus petit']];
    detail = 'Il y a ' + n + ' entiers : la moyenne est celui du milieu, avec ' + h + ' entiers au-dessous et ' + h + ' au-dessus. Le plus grand vaut ' + nb(M) + ' + ' + h + ' = ' + nb(L) + '.';
  } else if (ctx === 1){
    const n = R.pick([10, 12, 20, 30, 40]), a = R.int(10, 900), M = a + (n - 1) / 2;
    q = 'La moyenne de ' + n + ' entiers consécutifs vaut ' + nb(M) + '. Quel est le plus petit de ces entiers ?';
    rep = a;
    autres = [[a - 1, 'retire ' + (n / 2) + ' à la moyenne puis arrondit vers le bas, alors qu\'il faut retirer ' + nb((n - 1) / 2)], [a + n - 1, 'est le plus grand, pas le plus petit'], [a + 1, 'retire un entier de trop']];
    detail = 'Avec ' + n + ' entiers, il n\'y a pas d\'entier au milieu : la moyenne ' + nb(M) + ' est à mi-chemin entre le ' + (n / 2) + 'e et le ' + (n / 2 + 1) + 'e. Du plus petit au plus grand, il y a ' + (n - 1) + ' pas de 1, et la moyenne est au milieu : le plus petit vaut ' + nb(M) + ' − ' + nb((n - 1) / 2) + ' = ' + nb(a) + '.';
  } else {
    const n = R.pick([5, 7, 9, 11, 15, 25]), mo = R.int(15, 300), S = n * mo, h = (n - 1) / 2, a = mo - h;
    q = 'La somme de ' + n + ' entiers consécutifs vaut ' + nb(S) + '. Quel est le plus petit de ces entiers ?';
    rep = a;
    autres = [[mo, 'est la moyenne, c\'est-à-dire l\'entier du milieu'], [a - 1, 'retire un entier de trop'], [mo - n, 'retire ' + n + ' à la moyenne au lieu de ' + h]];
    detail = 'Leur moyenne vaut ' + nb(S) + ' ÷ ' + n + ' = ' + nb(mo) + ' : c\'est l\'entier du milieu, avec ' + h + ' entiers de chaque côté. Le plus petit vaut ' + nb(mo) + ' − ' + h + ' = ' + nb(a) + '.';
  }
  const choix = qcm(nb(rep), autres.map(c => c[0] > 0 ? nb(c[0]) : null), j => nb(rep + alt(j) * 2));
  const pieges = autres.filter(c => c[0] > 0 && present(choix, nb(c[0]))).map(c => nb(c[0]) + ' ' + c[1]);
  return {
    q, a: nb(rep), accept: null, choix,
    expl: 'Des entiers consécutifs sont répartis symétriquement autour de leur moyenne : il y en a autant au-dessus qu\'au-dessous. ' + detail, _p: pieges
  };
}

/* =========================== NIVEAU 4 =========================== */

function n4Commun(R){
  const s = tirer(() => {
    const v = R.int(0, 3);
    const N = v <= 1 ? 7 : v === 2 ? 9 : 10, g = v <= 1 ? 4 : v === 2 ? 5 : 6, ov = 2 * g - N;
    const m = v === 1 ? R.int(100, 400) : R.int(10, 60), sp = v === 1 ? 40 : 9;
    const a = m + R.int(-sp, sp), b = m + R.int(-sp, sp);
    if (a === b || a + b === 2 * m || a === m || b === m) return null;
    const X = g * a + g * b - N * m, rep = X / ov;
    if (X <= 0 || !dec1(rep) || g * a - X < g - ov || g * b - X < g - ov) return null;
    /* valeurs vraisemblables : l'élément commun et les autres jours restent du même ordre que la moyenne */
    const autresA = (g * a - X) / (g - ov), autresB = (g * b - X) / (g - ov);
    if (rep < 0.4 * m || rep > 1.8 * m || autresA < 0.4 * m || autresB < 0.4 * m || autresA > 1.8 * m || autresB > 1.8 * m) return null;
    if (dans(rep, [a, b, m])) return null;
    return {v, N, g, ov, m, a, b, X, rep};
  }) || {v: 0, N: 7, g: 4, ov: 1, m: 30, a: 26, b: 35, X: 34, rep: 34};
  const {v, N, g, ov, m, a, b, X, rep} = s;
  let q, el;
  if (v === 0){ q = 'Sept nombres ont pour moyenne ' + m + '. Les quatre premiers ont pour moyenne ' + a + ', et les quatre derniers ont pour moyenne ' + b + '. Que vaut le quatrième nombre ?'; el = 'le quatrième nombre'; }
  else if (v === 1){ q = 'Une semaine, du lundi au dimanche, un musée a accueilli en moyenne ' + m + ' visiteurs par jour. Du lundi au jeudi, la moyenne a été de ' + a + ' visiteurs par jour, et du jeudi au dimanche de ' + b + ' visiteurs par jour. Combien de visiteurs le musée a-t-il accueillis le jeudi ?'; el = 'le jeudi'; }
  else if (v === 2){ q = 'Neuf nombres ont pour moyenne ' + m + '. Les cinq premiers ont pour moyenne ' + a + ', et les cinq derniers ont pour moyenne ' + b + '. Que vaut le cinquième nombre ?'; el = 'le cinquième nombre'; }
  else { q = 'Dix nombres ont pour moyenne ' + m + '. Les six premiers ont pour moyenne ' + a + ', et les six derniers ont pour moyenne ' + b + '. Quelle est la moyenne du cinquième et du sixième nombre ?'; el = 'la somme du cinquième et du sixième nombre'; }
  const moy = a + b - m, mil = (a + b) / 2;
  const autres = [[moy, 'fait le calcul avec les moyennes au lieu des sommes'], [mil, 'est la moyenne des deux moyennes'], [m, 'est la moyenne générale']];
  if (ov === 2) autres.unshift([X, 'est la somme des deux nombres du milieu : il reste à diviser par 2']);
  const ok = w => w > 0 && dec2(w);
  const choix = qcm(nb(rep), autres.map(c => ok(c[0]) ? nb(c[0]) : null), j => nb(rep + alt(j) * (v === 1 ? 2 : 1)));
  const pieges = autres.filter(c => ok(c[0]) && present(choix, nb(c[0]))).map(c => nb(c[0]) + ' ' + c[1]);
  return {
    q, a: nb(rep), accept: null, choix,
    expl: 'Transforme les trois moyennes en sommes : ce qui appartient aux deux groupes est compté deux fois quand on additionne leurs sommes, et la somme totale permet de le retirer. Sommes : ' + g + ' × ' + a + ' = ' + nb(g * a) + ', ' + g + ' × ' + b + ' = ' + nb(g * b) + ', et ' + N + ' × ' + m + ' = ' + nb(N * m) + '. ' + cap(nb(g * a)) + ' + ' + nb(g * b) + ' = ' + nb(g * a + g * b) + ' compte toutes les valeurs, plus une seconde fois ' + el + ' : ' + el + ' vaut ' + nb(g * a + g * b) + ' − ' + nb(N * m) + ' = ' + nb(X) + '.' + (ov === 2 ? ' Leur moyenne vaut ' + nb(X) + ' ÷ 2 = ' + nb(rep) + '.' : ''), _p: pieges
  };
}

function n4Paires(R){
  const s = tirer(() => {
    const ctx = R.int(0, 2);
    let lo, hi;
    if (ctx === 1){ lo = 40; hi = 90; } else if (ctx === 2){ lo = 15; hi = 60; } else { lo = 2; hi = 60; }
    const a = R.int(lo, hi), b = R.int(lo, hi), c = R.int(lo, hi);
    if ((a - b) % 2 || (b - c) % 2) return null;
    if (new Set([a, b, c]).size < 3) return null;
    const p = (a + b) / 2, qq = (b + c) / 2, r = (a + c) / 2;
    if (new Set([p, qq, r]).size < 3) return null;
    const cible = R.int(0, 2);
    if (dans([a, b, c][cible], [p, qq, r])) return null;
    return {ctx, vals: [a, b, c], p, qq, r, cible};
  }) || {ctx: 0, vals: [8, 12, 16], p: 10, qq: 14, r: 12, cible: 1};
  const {ctx, vals, p, qq, r, cible} = s, u = v => nb(v) + (ctx === 1 ? ' kg' : '');
  const NOMS = ctx === 0 ? ['a', 'b', 'c'] : ctx === 1 ? ['Ana', 'Ben', 'Chloé'] : ['A', 'B', 'C'];
  const nom = NOMS[cible], rep = vals[cible];
  let q;
  if (ctx === 0) q = 'Trois nombres a, b et c sont tels que : la moyenne de a et b vaut ' + p + ', la moyenne de b et c vaut ' + qq + ', et la moyenne de a et c vaut ' + r + '. Que vaut ' + nom + ' ?';
  else if (ctx === 1) q = 'Ana et Ben pèsent en moyenne ' + p + ' kg, Ben et Chloé ' + qq + ' kg, Ana et Chloé ' + r + ' kg. Combien pèse ' + nom + ' ?';
  else q = 'Lors d\'un tournoi, les équipes A et B ont marqué en moyenne ' + p + ' points, les équipes B et C ' + qq + ' points, et les équipes A et C ' + r + ' points. Combien de points l\'équipe ' + nom + ' a-t-elle marqués ?';
  const T = p + qq + r, sansLui = [qq, r, p][cible];  // moyenne de la paire qui ne contient pas la cible
  const avecLui = T - sansLui, tiers = T / 3, voisin = vals[(cible + 1) % 3];
  const autres = [[avecLui, 'oublie que la moyenne de deux nombres est la moitié de leur somme'], [tiers, 'est la moyenne des trois, pas la valeur cherchée'], [voisin, 'est la valeur de ' + NOMS[(cible + 1) % 3]]];
  const ok = w => w > 0 && dec2(w);
  const choix = qcm(u(rep), autres.map(c => ok(c[0]) ? u(c[0]) : null), j => { const v = rep + alt(j); return v > 0 ? u(v) : null; });
  const pieges = autres.filter(c => ok(c[0]) && present(choix, u(c[0]))).map(c => u(c[0]) + ' ' + c[1]);
  const paires = ctx === 0 ? ['a + b', 'b + c', 'a + c'] : ctx === 1 ? ['Ana + Ben', 'Ben + Chloé', 'Ana + Chloé'] : ['A + B', 'B + C', 'A + C'];
  return {
    q, a: u(rep), accept: null, choix,
    expl: 'Transforme chaque moyenne en somme, puis additionne les trois sommes : chaque valeur y apparaît exactement deux fois. Sommes : ' + paires[0] + ' = ' + (2 * p) + ', ' + paires[1] + ' = ' + (2 * qq) + ', ' + paires[2] + ' = ' + (2 * r) + '. Leur total, ' + (2 * T) + ', compte chaque valeur deux fois, donc le total des trois vaut ' + (2 * T) + ' ÷ 2 = ' + T + '. Pour ' + nom + ', retire de ce total la somme des deux autres : ' + T + ' − ' + (2 * sansLui) + ' = ' + nb(rep) + '. Vérification : les trois valeurs sont ' + liste(vals) + '.', _p: pieges
  };
}

function n4Scenarios(R){
  const s = tirer(() => {
    const ctx = R.int(0, 1), n = R.int(2, 9);
    let m, x1, x2;
    if (ctx === 0){ m = R.int(16, 28) / 2; x1 = R.int(12, 20); x2 = R.int(0, x1 - 4); }
    else { m = R.int(110, 170); x1 = R.int(15, 25) * 10; x2 = R.int(6, 14) * 10; }
    const S = n * m;
    if (!ent(S)) return null;
    const M1 = (S + x1) / (n + 1), M2 = (S + x2) / (n + 1);
    if (ctx === 0 ? !(dec1(M1) && dec1(M2)) : !(ent(M1) && ent(M2))) return null;
    if (dans(n, [x1, x2, M1, M2])) return null;
    return {ctx, n, m, x1, x2, M1, M2};
  }) || {ctx: 0, n: 5, m: 12, x1: 18, x2: 6, M1: 13, M2: 11};
  const {ctx, n, x1, x2, M1, M2} = s, P = R.pick(PRENOMS);
  let q;
  if (ctx === 0) q = 'Si ' + P[0] + ' obtient ' + x1 + ' au prochain devoir, sa moyenne passera à ' + nb(M1) + ' ; ' + si(P[1]) + ' obtient ' + x2 + ', elle passera à ' + nb(M2) + '. Combien de notes ' + P[0] + ' a-t-' + P[1] + ' déjà obtenues ?';
  else q = 'Si ' + P[0] + ' marque ' + x1 + ' points à sa prochaine partie de bowling, sa moyenne par partie passera à ' + M1 + ' ; ' + si(P[1]) + ' n\'en marque que ' + x2 + ', elle passera à ' + M2 + '. Combien de parties ' + P[0] + ' a-t-' + P[1] + ' déjà jouées ?';
  const dx = x1 - x2, dM = M1 - M2;
  const autres = [[n + 1, 'compte aussi la prochaine ' + (ctx === 0 ? 'note' : 'partie')], [dx, 'est l\'écart entre les deux scénarios, il reste à le diviser'], [n - 1, 'retire une unité de trop']];
  const choix = qcm(nb(n), autres.map(c => c[0] > 0 ? nb(c[0]) : null), j => { const v = n + alt(j); return v > 0 ? nb(v) : null; });
  const pieges = autres.filter(c => c[0] > 0 && present(choix, nb(c[0]))).map(c => nb(c[0]) + ' ' + c[1]);
  const S = (n + 1) * M1 - x1;
  return {
    q, a: nb(n), accept: null, choix,
    expl: 'Compare les deux scénarios : seule la prochaine valeur change, et cette différence se répartit sur le nouvel effectif total. Entre les deux scénarios, la somme change de ' + x1 + ' − ' + x2 + ' = ' + dx + ' et la moyenne de ' + nb(M1) + ' − ' + nb(M2) + ' = ' + nb(dM) + '. Comme moyenne = somme ÷ effectif, l\'effectif après la prochaine ' + (ctx === 0 ? 'note' : 'partie') + ' vaut ' + dx + ' ÷ ' + nb(dM) + ' = ' + (n + 1) + '. Il y en a donc déjà ' + n + '. Vérification : la somme actuelle vaut ' + (n + 1) + ' × ' + nb(M1) + ' − ' + x1 + ' = ' + nb(S) + ', et (' + nb(S) + ' + ' + x2 + ') ÷ ' + (n + 1) + ' = ' + nb(M2) + '.', _p: pieges
  };
}

function n4MedianeMax(R){
  const s = tirer(() => {
    const ctx = R.int(0, 1), d = R.int(5, 20), m = R.int(d - 2, d + 15), T = 5 * m, L = T - 2 * d - 4;
    if (L < d + 2) return null;
    return {ctx, d, m, T, L};
  }) || {ctx: 0, d: 15, m: 20, T: 100, L: 66};
  const {ctx, d, m, T, L} = s, u = v => nb(v) + (ctx === 1 ? ' kg' : '');
  let q;
  if (ctx === 0) q = 'Cinq entiers strictement positifs, tous différents, ont pour moyenne ' + m + ' et pour médiane ' + d + '. Quelle est la plus grande valeur possible du plus grand de ces entiers ?';
  else q = 'Cinq colis ont des masses toutes différentes, chacune égale à un nombre entier de kilogrammes, au moins 1 kg. Leur masse moyenne est de ' + m + ' kg et leur masse médiane de ' + d + ' kg. Quelle est la plus grande masse possible pour le colis le plus lourd ?';
  const autres = [[L + 1, 'prend le quatrième égal à la médiane, alors que les valeurs sont toutes différentes'], [L + 2, 'prend 0 parmi les plus petites valeurs, alors qu\'elles sont strictement positives'], [L + d + 1, 'oublie la valeur située entre la médiane et le maximum']];
  const choix = qcm(u(L), autres.map(c => u(c[0])), j => u(L - j));
  const pieges = autres.filter(c => present(choix, u(c[0]))).map(c => u(c[0]) + ' ' + c[1]);
  return {
    q, a: u(L), accept: null, choix,
    expl: 'Pour rendre la plus grande valeur aussi grande que possible, rends les quatre autres aussi petites que possible en respectant toutes les contraintes, puis repasse par la somme. La somme vaut 5 × ' + m + ' = ' + T + '. Rangées dans l\'ordre, la troisième valeur est la médiane, ' + d + '. Les deux plus petites, différentes et strictement positives, valent au moins 1 et 2. La quatrième doit dépasser ' + d + ' : au moins ' + (d + 1) + '. La plus grande vaut donc au plus ' + T + ' − 1 − 2 − ' + d + ' − ' + (d + 1) + ' = ' + nb(L) + ', et ce maximum est atteint avec 1, 2, ' + d + ', ' + (d + 1) + ' et ' + L + ' (somme ' + T + ').', _p: pieges
  };
}

function n4Effectif(R){
  const s = tirer(() => {
    const ctx = R.int(0, 1);
    let k, a, b, m;
    if (ctx === 0){ k = R.int(2, 8); a = R.int(14, 18); b = R.int(7, 11); m = R.int(2 * b + 1, 2 * a - 1) / 2; }
    else { k = R.int(2, 6); a = R.int(30, 50) * 100; b = R.int(16, 24) * 100; m = b + R.int(1, 10) * 100; if (m >= a) return null; }
    const n = k * (a - b) / (m - b);
    if (!ent(n) || n <= k + 1 || n > 45 || m <= b || m >= a) return null;
    if (dans(n, [k, a, b, m])) return null;
    return {ctx, k, a, b, m, n};
  }) || {ctx: 0, k: 6, a: 17, b: 10, m: 12, n: 21};
  const {ctx, k, a, b, m, n} = s, u = ctx === 1 ? eur : (v => nb(v));
  let q;
  if (ctx === 0) q = 'Dans une classe, la moyenne à un contrôle est de ' + nb(m) + '. Les ' + k + ' meilleurs élèves ont une moyenne de ' + a + ', et les autres une moyenne de ' + b + '. Combien d\'élèves compte la classe ?';
  else q = 'Dans une PME, le salaire moyen est de ' + eur(m) + '. Les ' + k + ' cadres gagnent en moyenne ' + eur(a) + ', et les autres salariés ' + eur(b) + '. Combien de salariés compte la PME ?';
  const autres_ = n - k, faux = k * (a - b) / (a - m);
  const autres = [[autres_, 'ne compte que les ' + (ctx === 0 ? 'autres élèves' : 'autres salariés')], [faux, 'divise par le mauvais écart'], [n + 1, 'compte un de trop']];
  const ok = w => ent(w) && w > 0;
  const choix = qcm(nb(n), autres.map(c => ok(c[0]) ? nb(c[0]) : null), j => { const v = n + alt(j); return v > 0 ? nb(v) : null; });
  const pieges = autres.filter(c => ok(c[0]) && present(choix, nb(c[0]))).map(c => nb(c[0]) + ' ' + c[1]);
  return {
    q, a: nb(n), accept: null, choix,
    expl: 'Écris que les écarts à la moyenne générale se compensent : l\'excédent total du premier groupe est exactement le déficit total du second. Les ' + k + ' du premier groupe sont chacun ' + u(a - m) + ' au-dessus de ' + u(m) + ', soit ' + u(k * (a - m)) + ' en tout. Les autres sont chacun ' + u(m - b) + ' au-dessous, donc ils sont ' + u(k * (a - m)) + ' ÷ ' + u(m - b) + ' = ' + (n - k) + '. Effectif total : ' + k + ' + ' + (n - k) + ' = ' + n + '. Vérification par les sommes : ' + k + ' × ' + u(a) + ' + ' + (n - k) + ' × ' + u(b) + ' = ' + u(k * a + (n - k) * b) + ', et ' + n + ' × ' + u(m) + ' = ' + u(n * m) + '.', _p: pieges
  };
}

function n4Part(R){
  const s = tirer(() => {
    const ctx = R.int(0, 1), p = R.pick([20, 25, 40, 60, 75, 80]);
    let f, o;   // f : moyenne du groupe dont on demande la part, o : l'autre groupe
    if (ctx === 0){ f = R.int(18, 32) * 100; o = R.int(18, 32) * 100; if (abs(f - o) < 200) return null; }
    else { f = R.int(8, 17); o = R.int(6, 14); if (abs(f - o) < 2) return null; }
    const c = (p * f + (100 - p) * o) / 100;
    if (!dec2(c)) return null;
    return {ctx, p, f, o, c};
  }) || {ctx: 0, p: 75, f: 2000, o: 2400, c: 2100};
  const {ctx, p, f, o, c} = s, u = ctx === 0 ? eur : (v => nb(v));
  let q;
  if (ctx === 0) q = 'Dans une entreprise, le salaire moyen des hommes est de ' + eur(o) + ', celui des femmes de ' + eur(f) + ', et celui de l\'ensemble des salariés de ' + eur(c) + '. Quel pourcentage des salariés sont des femmes ?';
  else q = 'À un concours blanc, les candidats internes ont obtenu ' + f + ' de moyenne, les externes ' + o + ', et l\'ensemble des candidats ' + nb(c) + '. Quel pourcentage des candidats sont internes ?';
  const rapport = 100 * p / (100 - p);
  const autres = [[100 - p, 'est la part de l\'autre groupe'], [rapport, 'est le rapport entre les effectifs des deux groupes, pas la part dans le total'], [50, 'supposerait que la moyenne globale tombe au milieu']];
  const ok = w => w > 0 && w < 100 && dec2(w);
  const choix = qcm(pct(p), autres.map(x => ok(x[0]) ? pct(x[0]) : null), j => { const v = p + alt(j) * 5; return v > 0 && v < 100 ? pct(v) : null; });
  const pieges = autres.filter(x => ok(x[0]) && present(choix, pct(x[0]))).map(x => pct(x[0]) + ' ' + x[1]);
  const grp = ctx === 0 ? ['femme', 'homme'] : ['interne', 'externe'];
  return {
    q, a: pct(p), accept: null, choix,
    expl: 'Raisonne sur 100 personnes et utilise les écarts à la moyenne globale : ils se compensent. Chaque ' + grp[0] + ' est à ' + u(abs(f - c)) + ' de la moyenne globale ' + u(c) + ', chaque ' + grp[1] + ' à ' + u(abs(o - c)) + '. Avec x ' + grp[0] + 's sur 100 : x × ' + nb(abs(f - c)) + ' = (100 − x) × ' + nb(abs(o - c)) + ', donc x = 100 × ' + nb(abs(o - c)) + ' ÷ ' + nb(abs(f - o)) + ' = ' + p + '. Vérification par les sommes : ' + p + ' × ' + nb(f) + ' + ' + (100 - p) + ' × ' + nb(o) + ' = ' + nb(100 * c) + ', soit une moyenne de ' + nb(c) + '.', _p: pieges
  };
}

function n4Extremes(R){
  const s = tirer(() => {
    const ctx = R.int(0, 1), n = R.int(5, 15);
    let m2, dm;
    if (ctx === 0){ m2 = R.int(10, 60); dm = R.pick([0.5, 1, 2, 3, 4, 5]); }
    else { m2 = R.int(16, 26) / 2; dm = R.pick([0.5, 1, 1.5]); }
    const E = (n - 1) * dm;
    if (!ent(E) || (ctx === 1 && (E > 16 || E < 4))) return null;
    if (dans(E, [n, n - 1, m2 + dm, m2])) return null;
    return {ctx, n, m1: m2 + dm, m2, dm, E};
  }) || {ctx: 0, n: 12, m1: 48, m2: 45, dm: 3, E: 33};
  const {ctx, n, m1, m2, dm, E} = s;
  let q;
  if (ctx === 0) q = 'On dispose de ' + n + ' nombres. Si on retire le plus petit, la moyenne des ' + (n - 1) + ' nombres restants vaut ' + nb(m1) + ' ; si on retire plutôt le plus grand, la moyenne des ' + (n - 1) + ' restants vaut ' + nb(m2) + '. Quel est l\'écart entre le plus grand et le plus petit de ces nombres ?';
  else q = 'Un groupe compte ' + n + ' élèves. Sans la plus mauvaise note, la moyenne du groupe serait de ' + nb(m1) + ' ; sans la meilleure note, elle serait de ' + nb(m2) + '. Combien de points séparent la meilleure note de la plus mauvaise ?';
  const autres = [[dm, 'est seulement l\'écart entre les deux moyennes'], [n * dm, 'multiplie par ' + n + ' au lieu de ' + (n - 1) + ', le nombre de valeurs restantes'], [(n - 2) * dm, 'multiplie par ' + (n - 2) + ' au lieu de ' + (n - 1)]];
  const ok = w => w > 0 && dec2(w);
  const choix = qcm(nb(E), autres.map(c => ok(c[0]) ? nb(c[0]) : null), j => nb(E + alt(j)));
  const pieges = autres.filter(c => ok(c[0]) && present(choix, nb(c[0]))).map(c => nb(c[0]) + ' ' + c[1]);
  return {
    q, a: nb(E), accept: null, choix,
    expl: 'Appelle S la somme de toutes les valeurs : le plus petit vaut S moins la somme des autres valeurs, et de même pour le plus grand. Ici, plus petit = S − ' + (n - 1) + ' × ' + nb(m1) + ' = S − ' + nb((n - 1) * m1) + '. Plus grand = S − ' + (n - 1) + ' × ' + nb(m2) + ' = S − ' + nb((n - 1) * m2) + '. Leur écart vaut ' + nb((n - 1) * m1) + ' − ' + nb((n - 1) * m2) + ' = ' + (n - 1) + ' × ' + nb(dm) + ' = ' + nb(E) + ' : S disparaît, inutile de la connaître.', _p: pieges
  };
}

/* =========================== NIVEAU 5 =========================== */

function n5Efface(R){
  const c = R.pick(EFFACE) || [69, 7, 602, 17];
  const n = c[0], k = c[1], p = c[2], qd = c[3], E = Math.floor(p / qd), rr = p - E * qd, S = n * (n + 1) / 2;
  const lo = Math.ceil((2 * p - 2 * qd) / qd), hi = Math.floor(2 * p / qd), P = R.pick(PRENOMS);
  const q = P[0] + ' écrit au tableau tous les entiers de 1 jusqu\'à un certain nombre. ' + cap(P[1]) + ' en efface un. La moyenne des nombres restants vaut ' + p + '/' + qd + ', c\'est-à-dire ' + E + ' + ' + rr + '/' + qd + '. Quel nombre a été effacé ?';
  const autres = [[n + 1 - k, 'est le nombre symétrique de la bonne réponse'], [rr, 'reprend le numérateur de ' + rr + '/' + qd + ', sans calcul'], [n, 'est le plus grand entier écrit, pas le nombre effacé']];
  const ok = w => ent(w) && w >= 1 && w <= n;
  const choix = qcm(nb(k), autres.map(x => ok(x[0]) ? nb(x[0]) : null), j => { const v = k + alt(j); return v >= 1 && v <= n ? nb(v) : null; });
  const pieges = autres.filter(x => ok(x[0]) && present(choix, nb(x[0]))).map(x => nb(x[0]) + ' ' + x[1]);
  const cands = []; for (let v = lo; v <= hi; v++) cands.push(v);
  return {
    q, a: nb(k), accept: null, choix,
    expl: 'Encadre d\'abord le nombre n d\'entiers écrits grâce à la moyenne, puis utilise le dénominateur : (n − 1) × moyenne est une somme d\'entiers, donc un entier. Si on efface 1, la moyenne des restants vaut (n + 2) ÷ 2 ; si on efface n, elle vaut n ÷ 2. La moyenne vaut environ ' + nb(p / qd, 2) + ', donc n est compris entre ' + nb(2 * p / qd - 2, 2) + ' et ' + nb(2 * p / qd, 2) + ' : n vaut ' + liste(cands, '').replace(' et ', ' ou ') + '. Pour que (n − 1) × ' + p + '/' + qd + ' soit entier, n − 1 doit être un multiple de ' + qd + ' : seul n = ' + n + ' convient, car ' + (n - 1) + ' = ' + ((n - 1) / qd) + ' × ' + qd + '. Alors 1 + 2 + … + ' + n + ' = ' + n + ' × ' + (n + 1) + ' ÷ 2 = ' + nb(S) + ', et les ' + (n - 1) + ' nombres restants totalisent ' + (n - 1) + ' × ' + p + '/' + qd + ' = ' + ((n - 1) / qd) + ' × ' + p + ' = ' + nb(S - k) + '. Le nombre effacé vaut ' + nb(S) + ' − ' + nb(S - k) + ' = ' + k + '.', _p: pieges
  };
}

function n5Combien(R){
  const s = tirer(() => {
    const ctx = R.int(0, 1);
    let a, b, n;
    if (ctx === 0){ a = R.pick([1, 2, 3, 4]); b = R.pick([1, 2, 3, 4]); n = R.int(5, 16); }
    else { a = R.pick([0.5, 1]); b = R.pick([0.5, 1, 1.5]); n = R.int(5, 14); }
    const E = (n - 1) * (a + b);
    if (!ent(E) || (ctx === 1 && E > 20)) return null;
    /* il faut que les valeurs intermédiaires puissent rester entre le plus petit et le plus grand */
    if ((a - b) / (n - 2) > b + 1e-9 || (b - a) / (n - 2) > a + 1e-9) return null;
    if (dans(n, [a, b, E])) return null;
    return {ctx, a, b, n, E};
  }) || {ctx: 0, a: 2, b: 1, n: 16, E: 45};
  const {ctx, a, b, n, E} = s;
  let q;
  if (ctx === 0) q = 'On dispose de plusieurs nombres. Si on retire le plus grand, leur moyenne baisse de ' + nb(a) + ' ; si on retire plutôt le plus petit, leur moyenne augmente de ' + nb(b) + '. L\'écart entre le plus grand et le plus petit vaut ' + E + '. Combien y a-t-il de nombres ?';
  else q = 'Dans un groupe de TD, si on retire la meilleure note, la moyenne du groupe baisse de ' + pts(a) + ' ; si on retire plutôt la plus mauvaise, elle augmente de ' + pts(b) + '. La meilleure et la plus mauvaise note sont séparées de ' + E + ' points. Combien d\'étudiants compte le groupe ?';
  const un = E / Math.max(a, b) + 1;
  const autres = [[n - 1, 'est le nombre de valeurs restantes après un retrait, pas le nombre total'], [un, 'ne tient compte que d\'un seul des deux retraits'], [n + 1, 'compte une valeur de trop']];
  const ok = w => ent(w) && w > 1;
  const choix = qcm(nb(n), autres.map(x => ok(x[0]) ? nb(x[0]) : null), j => { const v = n + alt(j); return v > 1 ? nb(v) : null; });
  const pieges = autres.filter(x => ok(x[0]) && present(choix, nb(x[0]))).map(x => nb(x[0]) + ' ' + x[1]);
  return {
    q, a: nb(n), accept: null, choix,
    expl: 'Appelle n le nombre de valeurs et m leur moyenne, puis exprime le plus grand et le plus petit à l\'aide des sommes. Sans le plus grand, les n − 1 autres totalisent (n − 1) × (m − ' + nb(a) + '), donc le plus grand vaut n × m − (n − 1) × (m − ' + nb(a) + ') = m + (n − 1) × ' + nb(a) + '. De même, le plus petit vaut m − (n − 1) × ' + nb(b) + '. Leur écart vaut (n − 1) × (' + nb(a) + ' + ' + nb(b) + ') = (n − 1) × ' + nb(a + b) + '. Il vaut ' + E + ', donc n − 1 = ' + E + ' ÷ ' + nb(a + b) + ' = ' + (n - 1) + ' et n = ' + n + '.', _p: pieges
  };
}

function n5Actuelle(R){
  const s = tirer(() => {
    const ctx = R.int(0, 1), n = R.int(3, 9);
    let m, x1, x2;
    if (ctx === 0){ m = R.int(14, 30) / 2; x1 = R.int(12, 20); x2 = R.int(0, x1 - 4); }
    else { m = R.int(110, 170); x1 = R.int(15, 25) * 10; x2 = R.int(6, 14) * 10; }
    const S = n * m;
    if (!ent(S)) return null;
    const M1 = (S + x1) / (n + 1), M2 = (S + x2) / (n + 1);
    if (ctx === 0 ? !(dec1(M1) && dec1(M2)) : !(ent(M1) && ent(M2))) return null;
    if (abs((x1 + x2) / 2 - m) < 1e-9) return null;
    /* si une valeur de scénario égale la moyenne actuelle, la réponse se lirait dans l'énoncé */
    if (dans(m, [x1, x2, M1, M2])) return null;
    if (abs(x1 - m) < 1e-9 || abs(x2 - m) < 1e-9) return null;
    return {ctx, n, m, x1, x2, M1, M2, S};
  }) || {ctx: 1, n: 5, m: 142, x1: 190, x2: 130, M1: 150, M2: 140, S: 710};
  const {ctx, n, m, x1, x2, M1, M2, S} = s, P = R.pick(PRENOMS);
  let q;
  if (ctx === 0) q = 'Si ' + P[0] + ' obtient ' + x1 + ' au prochain devoir, sa moyenne passera à ' + nb(M1) + ' ; ' + si(P[1]) + ' obtient ' + x2 + ', elle passera à ' + nb(M2) + '. Quelle est sa moyenne actuelle ?';
  else q = 'Si ' + P[0] + ' marque ' + x1 + ' points à sa prochaine partie de bowling, sa moyenne par partie passera à ' + M1 + ' ; ' + si(P[1]) + ' n\'en marque que ' + x2 + ', elle passera à ' + M2 + '. Quelle est sa moyenne actuelle ?';
  const mm = (M1 + M2) / 2, mauvais = S / (n + 1);
  const autres = [[mm, 'fait la moyenne des deux scénarios, ce qui revient à imaginer une prochaine valeur de ' + nb((x1 + x2) / 2)], [mauvais, 'divise la somme actuelle par ' + (n + 1) + ' au lieu de ' + n]];
  const ok = w => w > 0 && dec2(w);
  const choix = qcm(nb(m), autres.map(x => ok(x[0]) ? nb(x[0]) : null), j => { const v = m + alt(j) * (ctx === 0 ? 0.5 : 2); return v > 0 ? nb(v) : null; });
  const pieges = autres.filter(x => ok(x[0]) && present(choix, nb(x[0]))).map(x => nb(x[0]) + ' ' + x[1]);
  return {
    q, a: nb(m), accept: null, choix,
    expl: 'Compare d\'abord les deux scénarios pour trouver l\'effectif, puis repasse par la somme actuelle. Entre les deux scénarios, seule la prochaine valeur change, de ' + x1 + ' − ' + x2 + ' = ' + (x1 - x2) + ', et la moyenne change de ' + nb(M1) + ' − ' + nb(M2) + ' = ' + nb(M1 - M2) + '. Comme moyenne = somme ÷ effectif, l\'effectif après la prochaine valeur vaut ' + (x1 - x2) + ' ÷ ' + nb(M1 - M2) + ' = ' + (n + 1) + ' : il y a déjà ' + n + ' valeurs. Somme actuelle : ' + (n + 1) + ' × ' + nb(M1) + ' − ' + x1 + ' = ' + nb(S) + '. Moyenne actuelle : ' + nb(S) + ' ÷ ' + n + ' = ' + nb(m) + '. Vérification avec l\'autre scénario : (' + nb(S) + ' + ' + x2 + ') ÷ ' + (n + 1) + ' = ' + nb(M2) + '.', _p: pieges
  };
}

/* Exemple qui atteint le plus petit maximum : on part de la configuration la plus « haute » et on redescend. */
function exempleMin(N, d, L, T){
  const h = (N - 1) / 2, bas = [], haut = [];
  for (let i = h; i >= 1; i--) bas.push(d - i);
  for (let i = h - 1; i >= 1; i--) haut.push(L - i);
  let e = somme(bas) + d + somme(haut) + L - T;
  for (let i = 0; i < h && e > 0; i++){ const r = Math.min(e, bas[i] - (i + 1)); bas[i] -= r; e -= r; }
  for (let i = 0; i < h - 1 && e > 0; i++){ const r = Math.min(e, haut[i] - (d + 1 + i)); haut[i] -= r; e -= r; }
  return e === 0 ? bas.concat([d], haut, [L]) : null;
}
function n5Mediane(R){
  const s = tirer(() => {
    const v = R.int(0, 2), N = v === 0 ? 5 : 7, h = (N - 1) / 2;
    const d = R.int(h + 2, 20), m = d + R.int(1, 12), T = N * m;
    const Lmax = T - h * d - h * h, K = (h + 1) * d - h * h, Lmin = Math.max(d + h, Math.ceil((T - K) / h));
    if (Lmin > Lmax || Lmin <= d + h) return null;
    const ex = v === 1 ? null : exempleMin(N, d, Lmin, T);
    if (v !== 1 && !ex) return null;
    return {v, N, h, d, m, T, Lmax, K, Lmin, ex};
  }) || {v: 0, N: 5, h: 2, d: 15, m: 20, T: 100, Lmax: 66, K: 41, Lmin: 30, ex: [12, 14, 15, 29, 30]};
  const {v, N, h, d, m, T, Lmax, K, Lmin, ex} = s, mots = N === 5 ? 'Cinq' : 'Sept';
  const base = mots + ' entiers strictement positifs, tous différents, ont pour moyenne ' + m + ' et pour médiane ' + d + '. ';
  if (v === 1){
    const q = base + 'Quelle est la plus grande valeur possible du plus grand de ces entiers ?';
    const autres = [[Lmax + h, 'prend 0 parmi les plus petites valeurs, alors qu\'elles sont strictement positives'], [Lmax + h * h - h, 'oublie que les valeurs sont toutes différentes'], [Lmax + (h - 1) * d + (h - 1) * h / 2, 'oublie les valeurs situées entre la médiane et le maximum']];
    const choix = qcm(nb(Lmax), autres.map(x => nb(x[0])), j => nb(Lmax - j));
    const pieges = autres.filter(x => present(choix, nb(x[0]))).map(x => nb(x[0]) + ' ' + x[1]);
    return {
      q, a: nb(Lmax), accept: null, choix,
      expl: 'Pour rendre le plus grand aussi grand que possible, rends les six autres aussi petits que possible en respectant toutes les contraintes, puis repasse par la somme. La somme vaut 7 × ' + m + ' = ' + T + '. Rangés dans l\'ordre, le quatrième est la médiane, ' + d + '. Les trois plus petits valent au moins 1, 2 et 3 ; les deux suivants, au-dessus de la médiane, au moins ' + (d + 1) + ' et ' + (d + 2) + '. Le plus grand vaut donc au plus ' + T + ' − 6 − ' + d + ' − ' + (2 * d + 3) + ' = ' + Lmax + ', atteint avec 1, 2, 3, ' + d + ', ' + (d + 1) + ', ' + (d + 2) + ' et ' + Lmax + '.', _p: pieges
    };
  }
  const q = base + 'Quelle est la plus petite valeur possible du plus grand de ces entiers ?';
  const sansDiff = Math.ceil((T - (h + 1) * d) / h);
  const autres = [[Lmax, 'est la plus grande valeur possible du maximum, pas la plus petite'], [m, 'est la moyenne : le plus grand la dépasse forcément'], [sansDiff, 'oublie que les valeurs sont toutes différentes']];
  const choix = qcm(nb(Lmin), autres.map(x => x[0] > 0 ? nb(x[0]) : null), j => nb(Lmin + alt(j)));
  const pieges = autres.filter(x => present(choix, nb(x[0]))).map(x => nb(x[0]) + ' ' + x[1]);
  const basTxt = []; for (let i = 1; i <= h; i++) basTxt.push(nb(d - i));
  const hautTxt = []; for (let i = h - 1; i >= 1; i--) hautTxt.push('(L − ' + i + ')');
  return {
    q, a: nb(Lmin), accept: null, choix,
    expl: 'Pour que le plus grand soit le plus petit possible, rends tous les autres aussi grands que possible, puis repasse par la somme. Appelle L le plus grand. La somme vaut ' + N + ' × ' + m + ' = ' + T + '. Sous la médiane ' + d + ', les ' + mot(h) + ' valeurs valent au plus ' + liste(basTxt) + ' ; entre la médiane et L, ' + (h === 2 ? 'l\'autre valeur vaut au plus L − 1' : 'les deux autres valent au plus L − 2 et L − 1') + '. La somme vaut donc au plus ' + basTxt.join(' + ') + ' + ' + d + ' + ' + hautTxt.join(' + ') + ' + L = ' + K + ' + ' + h + ' × L. Il faut ' + K + ' + ' + h + ' × L ≥ ' + T + ', soit L ≥ ' + (T - K) + ' ÷ ' + h + (ent((T - K) / h) ? ' = ' + Lmin + '.' : ' ≈ ' + nb((T - K) / h, 2) + ', donc L ≥ ' + Lmin + ' puisque L est entier.') + ' Ce minimum est atteint, par exemple avec ' + liste(ex) + ' (somme ' + T + ').', _p: pieges
  };
}

/* ---------- répartition par niveau ---------- */
const NIVEAUX = [
  [n1Manquant, n1Deux, n1Ajout, n1Ecarts],
  [n2Retrait, n2Groupes, n2Viser, n2Grands, n2Coef, n2Reguliere],
  [n3Commun5, n3Correction, n3Grands, n3Effectif, n3Efface, n3Arrivee, n3Consecutifs],
  [n4Commun, n4Paires, n4Scenarios, n4MedianeMax, n4Effectif, n4Part, n4Extremes],
  [n5Efface, n5Combien, n5Actuelle, n5Mediane]
];
function valide(ex){
  if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return false;
  if (new Set(ex.choix.map(norm)).size !== 4) return false;
  return ex.choix.filter(c => norm(c) === norm(ex.a)).length === 1;
}
function secours(){
  return {
    q: 'La moyenne de trois nombres vaut 120. Deux d\'entre eux valent 95 et 130. Combien vaut le nombre restant ?', a: '135', accept: null,
    choix: ['135', '120', '105', '15'],
    expl: 'Transforme la moyenne en somme : la somme des trois nombres vaut 3 × 120 = 360. Les deux nombres connus font 95 + 130 = 225, donc le troisième vaut 360 − 225 = 135. Piège : 120 est la moyenne elle-même, et 105 vient d\'une erreur de signe sur l\'écart.'
  };
}

A.push({
  id: 'alb-03-moyennes',
  phase: 'albert',
  ordre: 3,
  theme: 'stats',
  titre: 'Moyennes : toujours repasser par les sommes',
  objectif: 'Retrouver une valeur manquante, retirée ou commune, une moyenne de groupes ou un effectif, en transformant chaque moyenne en somme, de tête et sans calculatrice.',
  lecon:
`<p class="lede">Au test, les questions de moyenne paraissent simples, mais leur réponse se cache presque toujours dans une <mark>somme</mark>. Un seul réflexe suffit : transformer chaque moyenne en somme, calculer sur les sommes, et ne diviser qu'à la fin.</p>
<h2>Ce que le test demande</h2>
<p>On te donne une ou plusieurs moyennes et on te demande une valeur cachée : le nombre qui manque, la note qui a été retirée, la moyenne d'une classe formée de deux groupes, le nombre commun à deux groupes qui se chevauchent, ou même l'effectif. Les nombres sont choisis pour se calculer à la main, parfois grands (des milliers) pour t'obliger à être soigneux. Parmi les quatre choix, tu trouveras presque toujours la moyenne elle-même et le résultat d'une erreur classique, comme la moyenne des moyennes.</p>
<h2>Les prérequis</h2>
<p>La moyenne d'une série, c'est la somme des valeurs divisée par leur nombre, l'effectif. On retourne la formule : la somme vaut effectif × moyenne. Trois notes de moyenne 12 totalisent 36 points, quelles que soient ces notes.</p>
<div class="formule"><p>moyenne = somme ÷ effectif, donc somme = effectif × moyenne</p><p>moyenne pondérée = (somme des notes × coefficients) ÷ (somme des coefficients)</p></div>
<p>Deux autres outils servent souvent. Les écarts à la moyenne se compensent : leur total vaut toujours 0. Et pour des nombres régulièrement espacés (entiers consécutifs, nombres pairs, termes d'une suite arithmétique), la moyenne est celle du premier et du dernier : (premier + dernier) ÷ 2. En particulier, 1 + 2 + … + n = n × (n + 1) ÷ 2. Enfin, la médiane est la valeur du milieu d'une série rangée dans l'ordre : ne la confonds pas avec la moyenne.</p>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je transforme chaque moyenne en somme :</strong> somme = effectif × moyenne, avec l'effectif propre à chaque groupe.</p>
<p><strong>2. J'écris ce que je cherche avec ces sommes :</strong> valeur retirée = somme avant − somme après ; élément commun à deux groupes = somme du groupe 1 + somme du groupe 2 − somme totale.</p>
<p><strong>3. Je ne divise qu'à la fin,</strong> et par le bon effectif : celui qui reste après un retrait, celui du groupe entier après une fusion.</p>
<p><strong>4. Je vérifie</strong> en recalculant la moyenne avec ma réponse. En QCM, c'est rapide et ça déjoue les pièges.</p>
</div>
<h2>Exemples résolus</h2>
<h3>1. Le nombre qui manque</h3>
<p>La moyenne de trois nombres vaut 120 ; deux d'entre eux valent 95 et 130. La somme des trois vaut 3 × 120 = 360. Les deux connus font 225, donc le troisième vaut 360 − 225 = 135. Avec les écarts : 95 est à −25 de la moyenne et 130 à +10, total −15 ; le troisième compense avec +15, soit 135.</p>
<h3>2. Deux grands nombres</h3>
<p>La moyenne de deux nombres vaut 3 518 ; l'un vaut 1 975. Leur somme vaut 2 × 3 518 = 7 036, donc l'autre vaut 7 036 − 1 975 = 5 061. Ne coche ni 3 518, la moyenne elle-même, ni un nombre rond comme 5 000 : vérifie que (1 975 + 5 061) ÷ 2 = 3 518.</p>
<h3>3. Une valeur retirée</h3>
<p>Six notes ont pour moyenne 12. On en retire une, et la moyenne des cinq autres devient 11,4. Avant : 6 × 12 = 72 points. Après : 5 × 11,4 = 57 points. La note retirée vaut 72 − 57 = 15. La moyenne a baissé : il était logique de retirer une note au-dessus de 12.</p>
<h3>4. Deux groupes qui se chevauchent</h3>
<p>Sept nombres ont pour moyenne 30 ; les quatre premiers ont pour moyenne 26 et les quatre derniers 35. Le quatrième nombre appartient aux deux groupes. Sommes : 4 × 26 = 104, 4 × 35 = 140 et 7 × 30 = 210. En additionnant 104 et 140, on compte les sept nombres plus une seconde fois le quatrième : il vaut 244 − 210 = 34. C'est le niveau des questions difficiles du test.</p>
<h2>Réflexes sans calculatrice</h2>
<p>Pour la moyenne de nombres proches les uns des autres, choisis une valeur ronde de référence et fais la moyenne des écarts : la moyenne de 98, 103, 101, 97 et 106 vaut 100 + (−2 + 3 + 1 − 3 + 6) ÷ 5 = 100 + 1 = 101.</p>
<p>Pour doubler un grand nombre, double morceau par morceau : 2 × 3 518 = 6 000 + 1 000 + 36 = 7 036.</p>
<p>Une moyenne est toujours comprise entre la plus petite et la plus grande valeur, et la moyenne de deux groupes est plus proche de celle du groupe le plus nombreux : de quoi éliminer des choix d'un coup d'œil.</p>
<p>Quand tu ajoutes une valeur, compare-la à la moyenne : au-dessus, la moyenne monte ; au-dessous, elle baisse. Quand tu en retires une, c'est l'inverse.</p>
<table class="tbl"><tr><th>Situation</th><th>Calcul</th></tr>
<tr><td>Valeur manquante</td><td>effectif × moyenne − somme des valeurs connues</td></tr>
<tr><td>Valeur retirée</td><td>somme avant − somme après</td></tr>
<tr><td>Élément commun</td><td>somme du groupe 1 + somme du groupe 2 − somme totale</td></tr>
<tr><td>Deux groupes réunis</td><td>(n1 × m1 + n2 × m2) ÷ (n1 + n2)</td></tr></table>
<div class="box astuce"><p class="box-t">Astuce</p><p>Transforme chaque moyenne en somme (somme = effectif × moyenne), raisonne sur les sommes, et ne divise qu'à la fin par le bon effectif.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Ne fais jamais la moyenne de deux moyennes quand les effectifs sont différents : 20 filles à 13 de moyenne et 10 garçons à 10 donnent (260 + 100) ÷ 30 = 12, pas 11,5. Après un retrait, l'effectif change : divise par le nouvel effectif. Ne réponds pas la moyenne elle-même, souvent glissée parmi les choix. Méfie-toi des choix décalés d'une unité ou d'un millier, signe d'une erreur de retenue. Et ne confonds pas moyenne et médiane.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Somme = effectif × moyenne. Valeur retirée = somme avant − somme après. Élément commun = somme du groupe 1 + somme du groupe 2 − somme totale. Moyenne de deux groupes = somme totale ÷ effectif total. Les écarts à la moyenne se compensent.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(NIVEAUX[n - 1])(R);
      if (ex && typeof ex.expl === 'string'){ ex.expl += piegeTxt(ex.choix || [], ex.a, ex._p); delete ex._p; }
      if (valide(ex)) return ex;
    } catch (e) { /* jamais d'exception vers l'appelant */ }
    return secours();
  }
});

})();
