/* ===== Maths · Objectif Albert School : alb-05 · Compter des entiers : intervalles, paires, multiples =====
   Piste séparée window.ALBERT_SKILLS (jamais SKILLS). Une IIFE, aucun symbole de premier niveau.
   Idée centrale : ramener chaque question à « combien d'entiers de tel nombre à tel nombre » et compter avec
   dernier − premier + 1 (ou (dernier − premier) ÷ pas + 1). Toutes les réponses sont CALCULÉES par le code.
   N'utilise que R.int, R.pick, R.shuffle. Niveau inconnu : borné. gen ne lève jamais d'exception.
   Sous-types : N1 intervalle, piquets sur une ligne, multiples de 1 à N, coupes ;
                N2 multiples ou pairs dans un intervalle, termes d'une liste, paires d'écart d, tour fermé, étages et horloge ;
                N3 paires à deux ou trois chiffres d'écart d, paires de somme S, multiples à trois chiffres, encadrement kn + c,
                   termes d'une liste dans un intervalle, rectangle clôturé, carrés dans un intervalle, départs de bus ;
                N4 multiples de a ou de b (PPCM), ni a ni b, chiffres pour numéroter, paires de pairs ou de multiples,
                   reste r dans la division par k, n² dans un intervalle ;
                N5 trois diviseurs, termes communs à deux listes, paires d'écart au moins d, ni carré ni cube,
                   nombre de pages à partir du nombre de chiffres, occurrences d'un chiffre, multiples de a mais pas de b. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (recopiées de la référence alb-01) ---------- */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
const F = ' ';
/* Entier à la française : vrai signe moins, U+202F pour les milliers. */
function nb(x){ const n = Math.round(x), neg = n < 0; return (neg ? '−' : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, F); }
function qcm(bonne, autres, voisin){
  const vus = new Set([norm(bonne)]), ch = [bonne];
  const ajouter = c => { if (ch.length < 4 && c != null && c !== '' && !vus.has(norm(c))){ vus.add(norm(c)); ch.push(String(c)); } };
  autres.forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 60; k++) ajouter(voisin(k));
  return ch;
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));

/* ---------- outils de comptage ---------- */
const QM = F + '?';
const fl = Math.floor;
const ceilDiv = (a, k) => -Math.floor(-a / k);
const pgcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a; };
const ppcm = (a, b) => a / pgcd(a, b) * b;
const M = (k, a, b) => fl(b / k) - fl((a - 1) / k);            // multiples de k de a à b (a ≥ 1)
const isqrt = n => { let r = Math.floor(Math.sqrt(n)); while (r * r > n) r--; while ((r + 1) * (r + 1) <= n) r++; return r; };
const icbrt = n => { let r = Math.floor(Math.cbrt(n)); while (r * r * r > n) r--; while ((r + 1) * (r + 1) * (r + 1) <= n) r++; return r; };
const ord = k => k === 1 ? '1er' : k + 'e';
const heure = mn => fl(mn / 60) + ' h ' + String(mn % 60).padStart(2, '0');
const duree = mn => fl(mn / 60) + ' h' + (mn % 60 ? ' ' + (mn % 60) + ' min' : '');
const debutListe = (u, r) => [0, 1, 2, 3].map(i => nb(u + i * r)).join(', ');

/* Choix numériques : bonne réponse, distracteurs [valeur, piège nommé éventuel], voisins ± pas (toujours ≥ 1).
   Le texte d'un piège n'est ajouté à l'explication que si son distracteur figure parmi les choix (2 au plus). */
function sortie(q, bonne, pieges, expl, opt){
  opt = opt || {};
  const u = opt.unite ? F + opt.unite : '', pas = opt.pas || 1;
  const fmt = v => nb(v) + u;
  const ok = pieges.filter(p => p && typeof p[0] === 'number' && isFinite(p[0]) && Math.round(p[0]) === p[0] && p[0] >= 1 && p[0] !== bonne);
  const choix = qcm(fmt(bonne), ok.map(p => fmt(p[0])), k => { const v = bonne + (k % 2 ? (k + 1) / 2 : -k / 2) * pas; return v >= 1 ? fmt(v) : null; });
  const txt = [], dits = new Set();
  ok.forEach(p => { const s = fmt(p[0]); if (p[1] && choix.indexOf(s) > 0 && !dits.has(s) && txt.length < 2){ dits.add(s); txt.push(p[1](s)); } });
  return {q: q, a: fmt(bonne), accept: null, choix: choix, expl: expl + (txt.length ? ' ' + txt.join(' ') : '')};
}
const P1 = v => 'Piège : ' + v + ' oublie le +1.';
const PORDRE = v => 'Piège : ' + v + ' compte chaque paire deux fois, une fois dans chaque ordre.';

/* =====================================================
   Niveau 1 : découverte
   ===================================================== */

/* Entiers consécutifs de a à b. */
function l1Intervalle(R){
  const c = R.int(1, 5);
  let a, b, q;
  if (c === 4){
    a = R.int(1, 14); b = R.int(a + 6, 31);
    q = 'Un festival a lieu du ' + (a === 1 ? '1er' : a) + ' au ' + b + ' ' + R.pick(['juillet', 'août', 'mars', 'mai', 'octobre', 'décembre']) + ', ces deux jours compris. Combien de jours dure-t-il' + QM;
  } else {
    a = R.int(12, 480); b = a + R.int(20, 130) - 1;
    if (c === 1) q = 'Combien y a-t-il de nombres entiers de ' + nb(a) + ' à ' + nb(b) + ', ces deux nombres compris' + QM;
    else if (c === 2) q = 'Tu lis un roman de la page ' + nb(a) + ' à la page ' + nb(b) + ', ces deux pages comprises. Combien de pages lis-tu' + QM;
    else if (c === 3) q = 'Une billetterie a vendu tous les billets numérotés de ' + nb(a) + ' à ' + nb(b) + ', les deux compris. Combien de billets a-t-elle vendus' + QM;
    else q = 'Dans un parking, les places portent tous les numéros de ' + nb(a) + ' à ' + nb(b) + ', sans en sauter aucun. Combien y a-t-il de places' + QM;
  }
  const n = b - a + 1;
  const expl = 'Pour compter des entiers qui se suivent, on calcule dernier − premier + 1. Ici : ' + nb(b) + ' − ' + nb(a) + ' + 1 = ' + nb(n) +
    '. Le +1 vient de ce que ' + nb(b) + ' − ' + nb(a) + ' = ' + nb(n - 1) + ' compte les écarts entre deux nombres voisins, et il y a toujours un nombre de plus que d\'écarts. Contrôle sur un petit cas : de 3 à 5, il y a 3, 4 et 5, soit 5 − 3 + 1 = 3 nombres.';
  return sortie(q, n, [
    [n - 1, v => 'Piège : ' + v + ' est la soustraction seule, sans le +1.'],
    [n - 2, v => 'Piège : ' + v + ' revient à exclure les deux bornes, alors que l\'énoncé les compte.'],
    [n + 1, v => 'Piège : ' + v + ' ajoute 2 au lieu de 1.']], expl);
}

/* Piquets sur une ligne (un à chaque bout), ou distance entre le premier et le dernier objet. */
function l1Piquets(R){
  const d = R.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]), c = R.int(1, 4);
  if (c === 4){
    const N = R.int(8, 30), D = (N - 1) * d;
    const q = 'Dans une rue droite, ' + N + ' lampadaires sont alignés, et deux lampadaires voisins sont à ' + d + ' m l\'un de l\'autre. Quelle distance sépare le premier lampadaire du dernier' + QM;
    const expl = 'Entre le premier et le dernier objet d\'une rangée, on compte les espaces, et il y a un espace de moins que d\'objets. ' + N + ' lampadaires laissent ' + (N - 1) +
      ' espaces de ' + d + ' m : ' + (N - 1) + ' × ' + d + ' = ' + nb(D) + ' m.';
    return sortie(q, D, [
      [N * d, v => 'Piège : ' + v + ' compte un espace par lampadaire, soit un espace de trop.'],
      [(N + 1) * d], [(N - 2) * d]], expl, {unite: 'm', pas: d});
  }
  const k = R.int(8, 40), L = k * d;
  let q;
  if (c === 1) q = 'Une clôture droite de ' + nb(L) + ' m porte un piquet tous les ' + d + ' m, avec un piquet à chaque extrémité. Combien de piquets compte-t-elle' + QM;
  else if (c === 2) q = 'Le long d\'une allée droite de ' + nb(L) + ' m, on plante un arbre tous les ' + d + ' m, avec un arbre à chaque bout de l\'allée. Combien d\'arbres plante-t-on' + QM;
  else q = 'Sur un sentier rectiligne de ' + nb(L) + ' m, on pose une borne au départ, une à l\'arrivée et une tous les ' + d + ' m entre les deux. Combien de bornes pose-t-on' + QM;
  const expl = 'Sur une ligne avec un objet à chaque bout, il y a un objet de plus que d\'espaces : on divise la longueur par l\'écart, puis on ajoute 1. ' +
    nb(L) + ' ÷ ' + d + ' = ' + k + ' espaces, donc ' + k + ' + 1 = ' + (k + 1) + '. Contrôle : 10 m avec un piquet tous les 5 m donne les piquets 0, 5 et 10, soit 3 piquets.';
  return sortie(q, k + 1, [
    [k, v => 'Piège : ' + v + ' est le nombre d\'espaces, il manque l\'objet du départ.'],
    [k - 1, v => 'Piège : ' + v + ' oublie les objets placés aux deux bouts.'],
    [k + 2]], expl);
}

/* Multiples de k de 1 à N. */
function l1Multiples(R){
  const k = R.int(3, 12), N = R.int(6 * k, 300), q0 = fl(N / k), c = R.int(1, 3);
  let q;
  if (c === 1) q = 'Combien y a-t-il de multiples de ' + k + ' parmi les entiers de 1 à ' + N + QM;
  else if (c === 2) q = 'Dans une salle de ' + N + ' places numérotées de 1 à ' + N + ', une place sur ' + k + ' est réservée : ce sont les places ' + k + ', ' + 2 * k + ', ' + 3 * k +
    ', et ainsi de suite. Combien de places sont réservées' + QM;
  else q = 'Un imprimeur numérote des affiches de 1 à ' + N + ' et colle une étiquette dorée sur chaque affiche dont le numéro est un multiple de ' + k + '. Combien d\'étiquettes colle-t-il' + QM;
  const expl = 'On cherche combien de fois le nombre tient dans la borne, c\'est-à-dire le plus grand facteur de sa table qui ne fait pas dépasser la borne. Ici ' +
    k + ' × ' + q0 + ' = ' + k * q0 + ' ne dépasse pas ' + N + ', mais ' + k + ' × ' + (q0 + 1) + ' = ' + k * (q0 + 1) + ' dépasse. Il y a donc ' + q0 + ' multiples, de ' + k + ' × 1 à ' + k + ' × ' + q0 + '.';
  return sortie(q, q0, [
    [q0 + 1, v => 'Piège : ' + v + (N % k ? ' arrondit la division au-dessus : le dernier multiple dépasserait ' + N + '.' : ' compte aussi 0, qui n\'est pas entre 1 et ' + N + '.')],
    [q0 - 1, v => 'Piège : ' + v + ' oublie le dernier multiple.'],
    [q0 + 2]], expl);
}

/* Coupes : n morceaux demandent n − 1 coupes. */
function l1Coupes(R){
  const c = R.int(1, 3), n = R.int(4, 12), t = R.int(2, 9);
  let q, u, p = 0;
  if (c === 1){ u = 'min'; q = 'Un menuisier coupe une planche en ' + n + ' morceaux. Chaque coupe lui prend ' + t + ' minutes. Combien de minutes lui faut-il en tout' + QM; }
  else if (c === 2){ u = 's'; q = 'Un boulanger coupe une baguette en ' + n + ' parts, à raison de ' + t + ' secondes par coupe. Combien de secondes lui faut-il en tout' + QM; }
  else { u = 's'; p = R.pick([5, 10, 15, 20, 25]); q = 'Une barre de métal de ' + nb(n * p) + ' cm est coupée en morceaux de ' + p + ' cm chacun. Chaque coupe prend ' + t + ' secondes. Combien de secondes faut-il en tout' + QM; }
  const ans = (n - 1) * t;
  const expl = 'Il faut une coupe de moins que de morceaux, car la dernière coupe sépare déjà les deux derniers morceaux. ' + (p ? nb(n * p) + ' ÷ ' + p + ' = ' + n + ' morceaux. ' : '') +
    n + ' morceaux demandent ' + (n - 1) + ' coupes, soit ' + (n - 1) + ' × ' + t + ' = ' + ans + (u === 'min' ? ' minutes' : ' secondes') + '. Contrôle : pour couper en 2 morceaux, une seule coupe suffit.';
  return sortie(q, ans, [
    [n * t, v => 'Piège : ' + v + ' compte une coupe par morceau, soit une coupe de trop.'],
    [(n + 1) * t], [(n - 2) * t]], expl, {unite: u, pas: t});
}

/* =====================================================
   Niveau 2 : maîtrise
   ===================================================== */

/* Multiples de k, ou nombres pairs ou impairs, dans un intervalle [a ; b]. */
function l2MultInter(R){
  const c = R.int(1, 3);
  if (c === 2){
    const pair = R.int(0, 1) === 1, a = R.int(11, 199), b = a + R.int(40, 300);
    const f = (a % 2 === 0) === pair ? a : a + 1, l = (b % 2 === 0) === pair ? b : b - 1, ans = (l - f) / 2 + 1, tot = b - a + 1;
    const q = 'Combien de nombres ' + (pair ? 'pairs' : 'impairs') + ' y a-t-il de ' + a + ' à ' + b + ', ces deux nombres compris' + QM;
    const expl = 'On repère le premier et le dernier nombre ' + (pair ? 'pair' : 'impair') + ' de l\'intervalle, puis on compte de 2 en 2 avec (dernier − premier) ÷ 2 + 1. Premier : ' + f +
      ' ; dernier : ' + l + '. (' + l + ' − ' + f + ') ÷ 2 + 1 = ' + (l - f) / 2 + ' + 1 = ' + ans + '.';
    const moitie = tot % 2 ? ((tot + 1) / 2 === ans ? (tot - 1) / 2 : (tot + 1) / 2) : null;
    return sortie(q, ans, [
      [(l - f) / 2, P1],
      [moitie, v => 'Piège : ' + v + ' coupe les ' + tot + ' nombres de l\'intervalle en deux du mauvais côté : quand leur nombre est impair, ce sont les bornes qui décident.'],
      [ans + 1]], expl);
  }
  const k = R.pick([3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 25]);
  let a = R.int(20, 300);
  if (R.int(1, 3) === 1) a = ceilDiv(a, k) * k;
  const b = a + R.int(6 * k, 30 * k);
  const i = ceilDiv(a, k), j = fl(b / k), ans = j - i + 1;
  const q = c === 1 ? 'Combien y a-t-il de multiples de ' + k + ' de ' + nb(a) + ' à ' + nb(b) + ', ces deux nombres compris' + QM
    : 'Lors d\'un concert, les billets vendus portent tous les numéros de ' + nb(a) + ' à ' + nb(b) + '. Chaque spectateur dont le numéro de billet est un multiple de ' + k +
      ' gagne un poster. Combien de posters sont gagnés' + QM;
  const expl = 'On repère le premier et le dernier multiple de l\'intervalle, puis on compte leurs facteurs dans la table, avec dernier facteur − premier facteur + 1. Le premier multiple de ' + k +
    ' à partir de ' + nb(a) + ' est ' + k + ' × ' + i + ' = ' + nb(k * i) + ' ; le dernier jusqu\'à ' + nb(b) + ' est ' + k + ' × ' + j + ' = ' + nb(k * j) + '. On compte les facteurs de ' + i + ' à ' + j + ' : ' +
    j + ' − ' + i + ' + 1 = ' + ans + '.';
  return sortie(q, ans, [
    [j - i, P1],
    [j, v => 'Piège : ' + v + ' compte aussi les multiples situés avant ' + nb(a) + '.'],
    [fl((b - a) / k), v => 'Piège : ' + v + ' divise la largeur de l\'intervalle par ' + k + ' sans regarder où tombent le premier et le dernier multiple.'],
    [ans + 1]], expl);
}

/* Nombre de termes d'une liste qui avance de r en r. */
function l2Suite(R){
  const c = R.int(1, 3);
  let u, r, n, q;
  if (c === 1){
    u = R.int(1, 30); r = R.int(2, 9); n = R.int(15, 60);
    q = 'Combien de nombres compte la liste ' + debutListe(u, r) + ', …, ' + nb(u + (n - 1) * r) + ', où l\'on ajoute ' + r + ' à chaque fois' + QM;
  } else if (c === 2){
    u = R.int(10, 20); r = R.pick([2, 3, 4]); n = R.int(8, 25);
    q = 'Dans un amphithéâtre, la première rangée compte ' + u + ' sièges et chaque rangée compte ' + r + ' sièges de plus que la précédente. La dernière rangée compte ' + (u + (n - 1) * r) +
      ' sièges. Combien y a-t-il de rangées' + QM;
  } else {
    u = R.int(2, 6); r = R.pick([2, 3, 4, 5]); n = R.int(6, 20);
    q = 'Sur le parcours d\'une course, le premier ravitaillement est au kilomètre ' + u + ', puis il y en a un tous les ' + r + ' km. Le dernier est au kilomètre ' + (u + (n - 1) * r) +
      '. Combien y a-t-il de ravitaillements' + QM;
  }
  const L = u + (n - 1) * r;
  const expl = 'On compte combien de fois on ajoute le pas pour aller du premier nombre au dernier, puis on ajoute 1 pour le premier lui-même. (' + nb(L) + ' − ' + u + ') ÷ ' + r + ' = ' + (n - 1) +
    ' ajouts, donc ' + (n - 1) + ' + 1 = ' + n + '. C\'est la formule des suites arithmétiques : le terme de rang n vaut premier terme + (n − 1) × raison.';
  return sortie(q, n, [
    [n - 1, v => 'Piège : ' + v + ' est le nombre d\'ajouts, il manque le premier terme.'],
    [fl(L / r), v => 'Piège : ' + v + ' divise le dernier nombre par le pas, sans tenir compte du point de départ.'],
    [n + 1]], expl);
}

/* Paires d'entiers d'un intervalle dont la différence vaut d. */
function l2Paires(R){
  const c = R.int(1, 3);
  let lo, hi, d, q;
  if (c === 3){
    lo = R.int(10, 60); hi = lo + R.int(30, 100); d = R.int(8, hi - lo - 6);
    q = 'Combien de paires de deux entiers compris entre ' + lo + ' et ' + hi + ' (bornes incluses) ont une différence égale à ' + d + QM + ' L\'ordre ne compte pas.';
  } else {
    lo = 1; hi = R.int(30, 120); d = R.int(8, hi - 8);
    q = c === 1 ? 'Combien de paires de deux entiers compris entre 1 et ' + hi + ' (bornes incluses) ont une différence égale à ' + d + QM + ' L\'ordre ne compte pas.'
      : 'Des cartes portent les nombres de 1 à ' + hi + ', une carte par nombre. Combien de paires de cartes peut-on former dont les deux nombres ont un écart égal à ' + d + QM +
        ' L\'ordre des deux cartes ne compte pas.';
  }
  const X = hi - d, ans = X - lo + 1;
  const expl = 'On appelle b le plus petit nombre de la paire, on exprime l\'autre en fonction de b, puis on cherche toutes les valeurs possibles de b. L\'autre vaut b + ' + d + '. Il faut b ≥ ' + lo +
    ' et b + ' + d + ' ≤ ' + hi + ', donc b ≤ ' + X + '. b va de ' + lo + ' à ' + X + ' : ' + X + ' − ' + lo + ' + 1 = ' + ans + ' paires. Première paire : ' + lo + ' et ' + (lo + d) + ' ; dernière : ' + X + ' et ' + hi + '.';
  return sortie(q, ans, [
    [ans - 1, P1],
    [2 * ans, PORDRE],
    [c === 3 ? X : null, v => 'Piège : ' + v + ' laisse b partir de 1, alors que les deux nombres doivent être au moins égaux à ' + lo + '.'],
    [ans + 1]], expl);
}

/* Tour fermé : autant d'objets que d'espaces. */
function l2Boucle(R){
  const c = R.int(1, 4);
  if (c === 4){
    const N = R.int(6, 16), dd = R.pick([40, 45, 50, 55, 60, 65, 70, 75, 80]), T = N * dd;
    const q = 'Autour d\'une table ronde, ' + N + ' chaises sont réparties régulièrement : deux chaises voisines sont à ' + dd + ' cm l\'une de l\'autre, en mesurant le long du bord. Quel est le tour de la table' + QM;
    const expl = 'Sur un tour fermé, il y a autant d\'espaces que d\'objets, car le dernier espace ramène au premier objet. ' + N + ' chaises donnent ' + N + ' espaces de ' + dd + ' cm : ' + N + ' × ' + dd + ' = ' + nb(T) + ' cm.';
    return sortie(q, T, [
      [(N - 1) * dd, v => 'Piège : ' + v + ' compte un espace de moins, comme sur une ligne droite ; ici le dernier espace referme le tour.'],
      [(N + 1) * dd]], expl, {unite: 'cm', pas: dd});
  }
  const d = R.pick([2, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50]), k = R.int(10, 60), P = k * d;
  let q;
  if (c === 1) q = 'Autour d\'un lac, un sentier fait une boucle de ' + nb(P) + ' m. On installe un banc tous les ' + d + ' m sur tout le tour, en commençant au point de départ. Combien de bancs installe-t-on' + QM;
  else if (c === 2) q = 'Une piste circulaire mesure ' + nb(P) + ' m de tour. On pose un plot tous les ' + d + ' m, tout autour de la piste. Combien de plots faut-il' + QM;
  else q = 'Autour d\'un rond-point de ' + nb(P) + ' m de tour, on plante un arbre tous les ' + d + ' m, régulièrement sur tout le tour. Combien d\'arbres plante-t-on' + QM;
  const expl = 'Sur un tour fermé, il n\'y a pas de +1 : le dernier espace ramène au point de départ, où se trouve déjà le premier objet. ' + nb(P) + ' ÷ ' + d + ' = ' + k + ' espaces, donc ' + k + ' objets.';
  return sortie(q, k, [
    [k + 1, v => 'Piège : ' + v + ' ajoute 1 comme sur une ligne droite ; l\'objet placé au bout du dernier espace tomberait sur le premier.'],
    [k - 1], [k + 2]], expl);
}

/* Étages franchis et coups d'horloge : on compte les intervalles, pas les numéros. */
function l2Etages(R){
  const c = R.int(1, 3);
  if (c === 3){
    const n = R.int(3, 6), t = R.int(1, 4), m = R.int(n + 3, 12), T = (n - 1) * t, ans = (m - 1) * t;
    const q = 'Une horloge sonne ' + n + ' coups en ' + T + ' secondes, du premier au dernier coup, et ses coups sont régulièrement espacés. À ce rythme, combien de secondes lui faut-il pour sonner ' + m + ' coups' + QM;
    const expl = 'Ce qui prend du temps, ce sont les intervalles entre deux coups, et il y a un intervalle de moins que de coups. ' + n + ' coups font ' + (n - 1) + ' intervalles en ' + T + ' s, soit ' + t +
      ' s par intervalle. ' + m + ' coups font ' + (m - 1) + ' intervalles : ' + (m - 1) + ' × ' + t + ' = ' + ans + ' s.';
    return sortie(q, ans, [
      [(m * T) % n === 0 ? m * T / n : null, v => 'Piège : ' + v + ' fait une proportion avec le nombre de coups, alors que ce sont les intervalles qui durent.'],
      [m * t, v => 'Piège : ' + v + ' compte un intervalle par coup, soit un de trop.'],
      [((m - 1) * T) % n === 0 ? (m - 1) * T / n : null]], expl, {unite: 's', pas: t});
  }
  const p = R.pick([1, 1, 2]), qq = p + R.int(2, 4), r = qq + R.int(3, 8);
  const t = c === 1 ? R.int(2, 6) : R.int(12, 22), T = (qq - p) * t, ans = (r - p) * t;
  const q = c === 1
    ? 'Un ascenseur met ' + T + ' secondes pour monter sans arrêt du ' + ord(p) + ' au ' + ord(qq) + ' étage. À la même vitesse, combien de secondes met-il pour monter sans arrêt du ' + ord(p) + ' au ' + ord(r) + ' étage' + QM
    : 'Pour monter du ' + ord(p) + ' au ' + ord(qq) + ' étage, ' + R.pick(['Inès', 'Hugo', 'Léa', 'Yanis', 'Sarah', 'Noah']) + ' gravit ' + T + ' marches. Tous les étages ont le même nombre de marches. Combien de marches faut-il gravir pour monter du ' + ord(p) + ' au ' + ord(r) + ' étage' + QM;
  const mot = c === 1 ? ' s' : ' marches';
  const expl = 'On raisonne sur le nombre d\'étages franchis, c\'est-à-dire la différence des numéros, et non sur les numéros eux-mêmes. Du ' + ord(p) + ' au ' + ord(qq) + ' étage, on franchit ' + qq + ' − ' + p + ' = ' + (qq - p) +
    ' étages, soit ' + T + ' ÷ ' + (qq - p) + ' = ' + t + mot + ' par étage. Du ' + ord(p) + ' au ' + ord(r) + ' étage, on franchit ' + (r - p) + ' étages : ' + (r - p) + ' × ' + t + ' = ' + ans + mot + '.';
  return sortie(q, ans, [
    [(T * r) % qq === 0 ? T * r / qq : null, v => 'Piège : ' + v + ' fait une proportion avec les numéros d\'étages, alors que seuls les étages franchis comptent.'],
    [(r - p + 1) * t, v => 'Piège : ' + v + ' compte les étages de départ et d\'arrivée au lieu des étages franchis.'],
    [(T * (r - p)) % (qq - p + 1) === 0 ? T * (r - p) / (qq - p + 1) : null]], expl, c === 1 ? {unite: 's', pas: t} : {pas: t});
}

/* =====================================================
   Niveau 3 : niveau des exemples officiels
   ===================================================== */

/* Paires de nombres à deux ou trois chiffres (ou d'années) dont la différence vaut d. */
function l3PairesDiff(R){
  const c = R.int(1, 4);
  let lo, hi, d, q, naif, txtNaif;
  if (c === 3){
    lo = 100; hi = 999; d = R.int(820, 885);
    q = 'Combien de paires de nombres à trois chiffres ont une différence égale à ' + d + QM + ' L\'ordre ne compte pas.';
    naif = 999 - d; txtNaif = v => 'Piège : ' + v + ' laisse le plus petit nombre partir de 1, alors qu\'il doit avoir trois chiffres.';
  } else if (c === 4){
    lo = 1901; hi = 2000; d = R.int(55, 90);
    q = 'Combien de paires de deux années choisies de 1901 à 2000 sont séparées d\'exactement ' + d + ' ans' + QM + ' L\'ordre ne compte pas.';
    naif = 101 - d; txtNaif = v => 'Piège : ' + v + ' part de 1900, qui n\'est pas dans la liste.';
  } else {
    lo = 10; hi = 99;
    do { d = R.int(45, 85); } while (d === 67);
    q = c === 1 ? 'Combien de paires de nombres à deux chiffres ont une différence égale à ' + d + QM + ' L\'ordre ne compte pas.'
      : 'Une urne contient les boules numérotées de 10 à 99, une boule par numéro. On tire deux boules en même temps. Combien de tirages différents donnent deux numéros dont l\'écart vaut exactement ' + d + QM;
    naif = 99 - d; txtNaif = v => 'Piège : ' + v + ' laisse le plus petit nombre partir de 1, alors qu\'il doit avoir deux chiffres.';
  }
  const X = hi - d, ans = X - lo + 1;
  const expl = 'On appelle b le plus petit des deux nombres, on exprime l\'autre en fonction de b, puis on traduit chaque condition en une inégalité sur b. L\'autre vaut b + ' + d + '. Il faut b ≥ ' + nb(lo) +
    ' et b + ' + d + ' ≤ ' + nb(hi) + ', donc b ≤ ' + nb(X) + '. b va de ' + nb(lo) + ' à ' + nb(X) + ' : ' + nb(X) + ' − ' + nb(lo) + ' + 1 = ' + ans + ' paires. Contrôle : la première paire est ' + nb(lo) + ' et ' + nb(lo + d) +
    ', la dernière ' + nb(X) + ' et ' + nb(hi) + '.';
  return sortie(q, ans, [
    [ans - 1, v => 'Piège : ' + v + ' oublie le +1 en comptant les valeurs de b.'],
    [naif, txtNaif],
    [2 * ans, PORDRE],
    [ans + 1]], expl);
}

/* Paires de deux nombres à deux chiffres différents dont la somme vaut S. */
function l3PairesSomme(R){
  const S = R.int(50, 185), lo = Math.max(10, S - 99), hi = fl((S - 1) / 2), ans = hi - lo + 1, c = R.int(1, 2);
  const q = c === 1 ? 'Combien de paires de deux nombres à deux chiffres, différents l\'un de l\'autre, ont une somme égale à ' + S + QM + ' L\'ordre ne compte pas.'
    : 'On veut écrire ' + S + ' comme la somme de deux nombres à deux chiffres différents. De combien de façons peut-on le faire, sans tenir compte de l\'ordre' + QM;
  const expl = 'On appelle b le plus petit des deux nombres, on exprime l\'autre en fonction de b, puis on traduit chaque condition en une inégalité sur b. L\'autre vaut ' + S + ' − b. ' +
    'b a deux chiffres : b ≥ 10. ' + (S > 109 ? 'L\'autre a deux chiffres : ' + S + ' − b ≤ 99, donc b ≥ ' + (S - 99) + '. ' : 'L\'autre reste à deux chiffres pour toutes ces valeurs, car ' + S + ' − 10 = ' + (S - 10) + ' ≤ 99. ') +
    'b est le plus petit : b < ' + S + ' − b, donc b < ' + (S % 2 ? S + ' ÷ 2' : S / 2) + ', soit b ≤ ' + hi + (S % 2 ? '' : ' (' + S / 2 + ' + ' + S / 2 + ' est exclu, les deux nombres doivent être différents)') +
    '. b va de ' + lo + ' à ' + hi + ' : ' + hi + ' − ' + lo + ' + 1 = ' + ans + ' paires.';
  return sortie(q, ans, [
    [S % 2 ? null : ans + 1, v => 'Piège : ' + v + ' compte aussi ' + S / 2 + ' + ' + S / 2 + ', alors que les deux nombres doivent être différents.'],
    [S > 109 ? hi - 10 + 1 : null, v => 'Piège : ' + v + ' oublie que l\'autre nombre ne doit pas dépasser 99.'],
    [2 * ans, PORDRE],
    [ans - 1, P1]], expl);
}

/* Multiples de k parmi les nombres à trois chiffres, ou entre deux milliers. */
function l3MultChiffres(R){
  const c = R.int(1, 3);
  let k, lo, hi, q;
  if (c === 2){
    k = R.pick([7, 9, 11, 12, 13, 15, 17, 25]); lo = 1000 * R.int(1, 3); hi = lo + 1000 * R.int(1, 2);
    q = 'Combien de multiples de ' + k + ' y a-t-il de ' + nb(lo) + ' à ' + nb(hi) + ', bornes comprises' + QM;
  } else {
    k = R.pick([7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 35, 45]); lo = 100; hi = 999;
    q = c === 1 ? 'Combien de nombres à trois chiffres sont des multiples de ' + k + QM
      : 'Une loterie numérote ses billets de 100 à 999. Un billet est gagnant si son numéro est un multiple de ' + k + '. Combien y a-t-il de billets gagnants' + QM;
  }
  const j = fl(hi / k), i0 = fl((lo - 1) / k), ans = j - i0;
  const expl = 'On compte les multiples depuis 1 jusqu\'à la borne du haut, puis on retire ceux qui sont plus petits que la borne du bas. Jusqu\'à ' + nb(hi) + ' : ' + k + ' × ' + j + ' = ' + nb(k * j) + ' ne dépasse pas, et ' +
    k + ' × ' + (j + 1) + ' = ' + nb(k * (j + 1)) + ' dépasse, donc ' + j + ' multiples. Jusqu\'à ' + nb(lo - 1) + ' : ' + k + ' × ' + i0 + ' = ' + nb(k * i0) + ', et ' + k + ' × ' + (i0 + 1) + ' = ' + nb(k * (i0 + 1)) +
    ' est déjà dans l\'intervalle, donc ' + i0 + ' multiples à retirer. Reste : ' + j + ' − ' + i0 + ' = ' + ans + '.';
  return sortie(q, ans, [
    [j, v => 'Piège : ' + v + ' compte aussi les multiples plus petits que ' + nb(lo) + '.'],
    [fl((hi - lo + 1) / k), v => 'Piège : ' + v + ' divise le nombre d\'entiers par ' + k + ' : c\'est une approximation, il faut regarder les bornes.'],
    [ans - 1, P1], [ans + 1]], expl);
}

/* Entiers n vérifiant un encadrement A ⋄ kn + c ⋄ B. */
function l3Encadrement(R){
  const k = R.int(2, 9), c = R.pick([0, 0, R.int(1, 9), -R.int(1, 9)]);
  const sL = R.int(0, 1) === 1, sU = R.int(0, 1) === 1;
  let A0 = R.int(10, 120), B0 = A0 + R.int(60, 360);
  if (R.int(0, 1)) A0 = A0 - ((A0 - c) % k + k) % k;
  if (R.int(0, 1)) B0 = B0 - ((B0 - c) % k + k) % k;
  const A1 = A0 - c, B1 = B0 - c;
  const cnt = (strL, strU) => { const lo = strL ? fl(A1 / k) + 1 : ceilDiv(A1, k), hi = strU ? ceilDiv(B1, k) - 1 : fl(B1 / k); return {lo: lo, hi: hi, n: hi - lo + 1}; };
  const v = cnt(sL, sU), ans = v.n;
  const expr = k + 'n' + (c > 0 ? ' + ' + c : c < 0 ? ' − ' + (-c) : '');
  const q = 'Combien d\'entiers n vérifient ' + A0 + (sL ? ' < ' : ' ≤ ') + expr + (sU ? ' < ' : ' ≤ ') + B0 + QM;
  const E = n => k * n + c;
  const expl = 'On isole n dans chaque inégalité, puis on compte les entiers entre le plus petit et le plus grand n qui conviennent. ' +
    (c ? 'On ' + (c > 0 ? 'retire ' + c : 'ajoute ' + (-c)) + ' dans les trois membres : ' + A1 + (sL ? ' < ' : ' ≤ ') + k + 'n' + (sU ? ' < ' : ' ≤ ') + B1 + '. ' : '') +
    'Le plus petit n possible est ' + v.lo + ' (' + expr.replace(/n/, ' × ' + v.lo) + ' = ' + E(v.lo) + ' convient, alors que ' + expr.replace(/n/, ' × ' + (v.lo - 1)) + ' = ' + E(v.lo - 1) + ' ne convient pas) ; le plus grand est ' + v.hi +
    ' (' + expr.replace(/n/, ' × ' + v.hi) + ' = ' + E(v.hi) + ' convient, alors que ' + expr.replace(/n/, ' × ' + (v.hi + 1)) + ' = ' + E(v.hi + 1) + ' ne convient pas). De ' + v.lo + ' à ' + v.hi + ' : ' +
    v.hi + ' − ' + v.lo + ' + 1 = ' + ans + ' entiers.';
  const cote = (strict, ou) => (strict ? 'traite l\'inégalité stricte de ' + ou + ' comme si la borne était permise' : 'exclut la borne de ' + ou + ', alors que l\'inégalité large la permet');
  return sortie(q, ans, [
    [cnt(!sL, sU).n, w => 'Piège : ' + w + ' ' + cote(sL, 'gauche') + '.'],
    [cnt(sL, !sU).n, w => 'Piège : ' + w + ' ' + cote(sU, 'droite') + '.'],
    [cnt(!sL, !sU).n, w => 'Piège : ' + w + ' se trompe sur les deux inégalités : regarde pour chaque borne si elle peut être atteinte.'],
    [fl((B0 - A0) / k), w => 'Piège : ' + w + ' divise la largeur de l\'intervalle par ' + k + ' sans chercher les valeurs extrêmes de n.'],
    [ans - 1, P1], [ans + 1]], expl);
}

/* Termes d'une liste de pas r compris entre a et b. */
function l3SuiteInter(R){
  const r = R.int(3, 9), u0 = R.int(1, 2 * r), c = R.int(1, 2);
  let a = R.int(60, 300), b = a + R.int(100, 500);
  if (R.int(1, 3) === 1) a = u0 + r * ceilDiv(a - u0, r);
  if (R.int(1, 3) === 1) b = u0 + r * fl((b - u0) / r);
  const m1 = ceilDiv(a - u0, r), m2 = fl((b - u0) / r), f = u0 + m1 * r, l = u0 + m2 * r, ans = m2 - m1 + 1;
  const q = c === 1 ? 'On écrit la liste ' + debutListe(u0, r) + ', … en ajoutant ' + r + ' à chaque fois. Combien de nombres de cette liste sont compris entre ' + a + ' et ' + b + ', bornes comprises' + QM
    : 'Un métronome émet un premier bip à la seconde ' + u0 + ', puis un bip toutes les ' + r + ' secondes. Combien de bips émet-il de la seconde ' + a + ' à la seconde ' + b + ', ces deux instants compris' + QM;
  const expl = 'Les nombres de la liste avancent de pas en pas : on cherche le premier et le dernier qui tombent dans l\'intervalle, puis on applique (dernier − premier) ÷ pas + 1. Le premier à partir de ' + a + ' est ' + f +
    ' (' + u0 + ' + ' + r + ' × ' + m1 + ') ; le dernier jusqu\'à ' + b + ' est ' + l + ' (' + u0 + ' + ' + r + ' × ' + m2 + '). (' + l + ' − ' + f + ') ÷ ' + r + ' + 1 = ' + (l - f) / r + ' + 1 = ' + ans + '.';
  return sortie(q, ans, [
    [fl((b - a) / r), v => 'Piège : ' + v + ' divise la largeur de l\'intervalle par le pas, sans chercher le premier et le dernier nombre de la liste.'],
    [ans - 1, P1], [ans + 1], [ans + 2]], expl);
}

/* Rectangle ou carré bordé d'objets, un à chaque coin. */
function l3Rect(R){
  const d = R.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]), c = R.int(1, 3);
  let x, y;
  if (c === 2){ x = y = R.int(5, 20); } else { x = R.int(6, 20); y = R.int(3, x - 1); }
  const L = x * d, l = y * d, P = 2 * (L + l), ans = 2 * (x + y), u = c === 3 ? 'cm' : 'm', obj = c === 3 ? 'perles' : 'piquets';
  let q;
  if (c === 1) q = 'Un terrain rectangulaire de ' + nb(L) + ' m sur ' + nb(l) + ' m est entouré d\'une clôture. Les piquets sont plantés tous les ' + d + ' m tout autour du terrain, avec un piquet à chaque coin. Combien y a-t-il de piquets' + QM;
  else if (c === 2) q = 'Un jardin carré de ' + nb(L) + ' m de côté est bordé de piquets plantés tous les ' + d + ' m, avec un piquet à chaque coin. Combien y a-t-il de piquets' + QM;
  else q = 'Un cadre photo rectangulaire de ' + L + ' cm sur ' + l + ' cm est décoré de perles posées sur son bord, une tous les ' + d + ' cm, avec une perle à chaque coin. Combien de perles faut-il' + QM;
  const expl = 'Le bord est un tour fermé : on divise le périmètre par l\'écart, sans ajouter 1. Périmètre : ' + (c === 2 ? '4 × ' + nb(L) : '2 × (' + nb(L) + ' + ' + nb(l) + ')') + ' = ' + nb(P) + ' ' + u + ' ; ' +
    nb(P) + ' ÷ ' + d + ' = ' + ans + ' ' + obj + '. Autre façon : chaque côté de ' + nb(L) + ' ' + u + ' porte ' + (x + 1) + ' ' + obj + ' coins compris' + (c === 2 ? '' : ', chaque côté de ' + nb(l) + ' ' + u + ' en porte ' + (y + 1)) +
    ', mais les 4 coins sont alors comptés deux fois : ' + (c === 2 ? '4 × ' + (x + 1) : '2 × ' + (x + 1) + ' + 2 × ' + (y + 1)) + ' − 4 = ' + ans + '.';
  return sortie(q, ans, [
    [ans + 4, v => 'Piège : ' + v + ' compte chaque côté avec ses deux bouts, si bien que les 4 coins sont comptés deux fois.'],
    [ans + 1, v => 'Piège : ' + v + ' ajoute 1 comme sur une ligne droite, alors que le tour est fermé.'],
    [x + y, v => 'Piège : ' + v + ' ne fait que la moitié du tour.'],
    [ans - 4, v => 'Piège : ' + v + ' oublie les 4 coins.']], expl);
}

/* Carrés parfaits dans un intervalle. */
function l3Carres(R){
  const c = R.int(1, 2);
  let a, b;
  if (c === 1){ a = R.pick([100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000]); b = R.pick([1500, 2000, 2500, 3000, 3500, 4000]); }
  else {
    const s1 = R.int(10, 30), s2 = R.int(s1 + 15, 63);
    a = s1 * s1 - (R.int(0, 1) ? 0 : R.int(1, 2 * s1 - 2)); b = s2 * s2 + (R.int(0, 1) ? 0 : R.int(1, 2 * s2));
  }
  const s1 = isqrt(a - 1) + 1, s2 = isqrt(b), ans = s2 - s1 + 1;
  const q = c === 1 ? 'Combien de carrés parfaits (1, 4, 9, 16, 25, …) sont compris entre ' + nb(a) + ' et ' + nb(b) + ', bornes comprises' + QM
    : 'Parmi les entiers de ' + nb(a) + ' à ' + nb(b) + ', bornes comprises, combien sont le carré d\'un nombre entier' + QM;
  const expl = 'On encadre chaque borne entre deux carrés consécutifs, pour trouver le plus petit et le plus grand entier dont le carré tombe dans l\'intervalle. ' + (s1 - 1) + '² = ' + nb((s1 - 1) * (s1 - 1)) + ' est trop petit et ' +
    s1 + '² = ' + nb(s1 * s1) + ' convient ; ' + s2 + '² = ' + nb(s2 * s2) + ' convient et ' + (s2 + 1) + '² = ' + nb((s2 + 1) * (s2 + 1)) + ' est trop grand. Les carrés cherchés sont ceux des entiers de ' + s1 + ' à ' + s2 + ' : ' +
    s2 + ' − ' + s1 + ' + 1 = ' + ans + '.';
  return sortie(q, ans, [
    [s2, v => 'Piège : ' + v + ' compte tous les carrés depuis 1, sans retirer ceux qui sont plus petits que ' + nb(a) + '.'],
    [ans - 1, P1], [ans + 1]], expl);
}

/* Départs réguliers entre une heure de début et une heure de fin, les deux comprises. */
function l3Bus(R){
  const m = R.pick([5, 6, 10, 12, 15, 20, 30]), c = R.int(1, 2);
  const debut = R.int(5, 8) * 60 + m * R.int(0, fl(59 / m));
  const n = R.int(fl(600 / m), fl(Math.min(960, 23 * 60 - debut) / m)), fin = debut + n * m, ans = n + 1;
  const q = c === 1 ? 'Un bus part du terminus toutes les ' + m + ' minutes. Le premier départ a lieu à ' + heure(debut) + ' et le dernier à ' + heure(fin) + '. Combien de départs y a-t-il en tout' + QM
    : 'Une navette part toutes les ' + m + ' minutes, de ' + heure(debut) + ' (premier départ) à ' + heure(fin) + ' (dernier départ). Combien de départs assure-t-elle' + QM;
  const expl = 'On calcule la durée entre le premier et le dernier départ, on la divise par l\'écart entre deux départs pour obtenir le nombre d\'intervalles, puis on ajoute 1. De ' + heure(debut) + ' à ' + heure(fin) +
    ', il s\'écoule ' + duree(n * m) + ', soit ' + nb(n * m) + ' minutes. ' + nb(n * m) + ' ÷ ' + m + ' = ' + n + ' intervalles, donc ' + n + ' + 1 = ' + ans + ' départs.';
  const H = (fin - debut) / 60, heuresRondes = debut % 60 === fin % 60 && 60 % m === 0;
  return sortie(q, ans, [
    [n, v => 'Piège : ' + v + ' est le nombre d\'intervalles, il manque le premier départ.'],
    [heuresRondes ? (H + 1) * 60 / m : null, v => 'Piège : ' + v + ' compte ' + (H + 1) + ' heures, comme s\'il y avait une heure par nombre de ' + fl(debut / 60) + ' à ' + fl(fin / 60) + ' ; il ne s\'écoule que ' + H + ' heures.'],
    [n + 2], [n - 1]], expl);
}

/* =====================================================
   Niveau 4 : plus dur que les exemples officiels
   ===================================================== */
const N_LISTE = [100, 120, 150, 180, 200, 240, 250, 300, 360, 400, 450, 500, 600, 720, 800, 900, 1000];

/* Multiples de a ou de b, avec a et b non premiers entre eux (piège du produit au lieu du PPCM). */
function l4Ou(R){
  const pr = R.pick([[4, 6], [6, 9], [6, 8], [4, 10], [6, 10], [10, 15], [8, 12], [9, 12], [12, 18], [6, 15], [4, 14], [10, 25]]);
  const sw = R.int(0, 1), a = sw ? pr[1] : pr[0], b = sw ? pr[0] : pr[1], m = ppcm(a, b);
  const N = R.pick(N_LISTE.filter(x => x >= 3 * m)), x = fl(N / a), y = fl(N / b), z = fl(N / m), ans = x + y - z, c = R.int(1, 2);
  const q = c === 1 ? 'Combien d\'entiers de 1 à ' + nb(N) + ' sont multiples de ' + a + ' ou de ' + b + ' (ou des deux)' + QM
    : 'Un magasin offre un cadeau à chaque client dont le numéro de passage est un multiple de ' + a + ' ou un multiple de ' + b + '. Les numéros vont de 1 à ' + nb(N) + ', et un client reçoit au plus un cadeau. Combien de cadeaux sont offerts' + QM;
  const expl = 'On additionne les multiples de chacun des deux nombres, puis on retire ceux qui ont été comptés deux fois, c\'est-à-dire les multiples communs, qui sont les multiples du PPCM. Multiples de ' + a + ' : ' + x +
    ' ; multiples de ' + b + ' : ' + y + '. Le plus petit multiple commun de ' + a + ' et ' + b + ' est ' + m + ' (et non ' + a + ' × ' + b + ' = ' + a * b + ') : il y a ' + z + ' multiples de ' + m + ' jusqu\'à ' + nb(N) +
    '. Total : ' + x + ' + ' + y + ' − ' + z + ' = ' + ans + '.';
  return sortie(q, ans, [
    [x + y, v => 'Piège : ' + v + ' compte deux fois les multiples communs.'],
    [x + y - fl(N / (a * b)), v => 'Piège : ' + v + ' retire les multiples de ' + a * b + ' (le produit) au lieu de ceux de ' + m + ' (le PPCM).'],
    [N - ans, v => 'Piège : ' + v + ' compte les nombres qui ne sont multiples ni de ' + a + ' ni de ' + b + '.'],
    [z, v => 'Piège : ' + v + ' ne compte que les multiples des deux à la fois.']], expl);
}

/* Entiers divisibles ni par a ni par b. */
function l4Ni(R){
  const pr = R.pick([[2, 3], [2, 5], [3, 5], [3, 4], [4, 5], [2, 7], [3, 7], [4, 6], [6, 9], [6, 8], [4, 10], [10, 15]]);
  const a = pr[0], b = pr[1], m = ppcm(a, b);
  const N = R.pick(N_LISTE.filter(t => t >= 3 * m)), x = fl(N / a), y = fl(N / b), z = fl(N / m), ou = x + y - z, ans = N - ou, c = R.int(1, 2);
  const q = c === 1 ? 'Combien d\'entiers de 1 à ' + nb(N) + ' ne sont divisibles ni par ' + a + ', ni par ' + b + QM
    : 'On écrit les entiers de 1 à ' + nb(N) + ', puis on barre tous les multiples de ' + a + ' et tous les multiples de ' + b + '. Combien de nombres restent non barrés' + QM;
  const expl = 'On compte d\'abord les nombres divisibles par l\'un ou l\'autre, en retirant les doublons (les multiples du PPCM), puis on les enlève du total. Multiples de ' + a + ' : ' + x + ' ; de ' + b + ' : ' + y +
    ' ; communs, c\'est-à-dire multiples de ' + m + ' : ' + z + '. Divisibles par ' + a + ' ou par ' + b + ' : ' + x + ' + ' + y + ' − ' + z + ' = ' + ou + '. Il reste ' + nb(N) + ' − ' + ou + ' = ' + nb(ans) + '.';
  return sortie(q, ans, [
    [N - x - y, v => 'Piège : ' + v + ' retire deux fois les multiples communs à ' + a + ' et ' + b + '.'],
    [ou, v => 'Piège : ' + v + ' compte les nombres divisibles (barrés) au lieu des autres.'],
    [m !== a * b ? N - (x + y - fl(N / (a * b))) : null, v => 'Piège : ' + v + ' utilise le produit ' + a * b + ' au lieu du PPCM ' + m + '.'],
    [ans - 1], [ans + 1]], expl);
}

/* Nombre de chiffres pour numéroter de 1 à P (P à trois chiffres). */
function l4Chiffres(R){
  const P = R.int(101, 999), ans = 9 + 180 + 3 * (P - 99), c = R.int(1, 3);
  let q;
  if (c === 1) q = 'Pour numéroter les pages d\'un livre de ' + P + ' pages, de 1 à ' + P + ', combien de chiffres faut-il écrire en tout' + QM + ' (La page 47 demande 2 chiffres.)';
  else if (c === 2) q = 'Un imprimeur compose les numéros des ' + P + ' pages d\'un livre, de 1 à ' + P + ', avec un caractère en plomb par chiffre. Combien de caractères lui faut-il en tout' + QM;
  else q = 'On numérote des casiers de 1 à ' + P + ' en collant un autocollant par chiffre : le casier 47 reçoit 2 autocollants. Combien d\'autocollants faut-il en tout' + QM;
  const expl = 'On sépare les numéros selon leur nombre de chiffres et on compte chaque groupe avec dernier − premier + 1. De 1 à 9 : 9 numéros × 1 chiffre = 9. De 10 à 99 : 90 numéros × 2 chiffres = 180. De 100 à ' + P + ' : ' +
    P + ' − 100 + 1 = ' + (P - 99) + ' numéros × 3 chiffres = ' + nb(3 * (P - 99)) + '. Total : 9 + 180 + ' + nb(3 * (P - 99)) + ' = ' + nb(ans) + '.';
  return sortie(q, ans, [
    [3 * P, v => 'Piège : ' + v + ' compte trois chiffres pour tous les numéros.'],
    [ans - 3, v => 'Piège : ' + v + ' oublie le +1 dans le nombre de numéros à trois chiffres.'],
    [ans + 18, v => 'Piège : ' + v + ' compte 99 numéros à deux chiffres au lieu de 90.'],
    [ans + 3]], expl);
}

/* Paires de nombres pairs, impairs, multiples de 3 ou de 5 à deux chiffres dont la différence vaut d. */
function l4PairesParite(R){
  const fam = R.pick([
    {mot: 'nombres pairs', un: 'pair', nom: 'nombre pair', first: 10, last: 98, s: 2, d: () => 2 * R.int(15, 40), dmot: 'pair'},
    {mot: 'nombres impairs', un: 'impair', nom: 'nombre impair', first: 11, last: 99, s: 2, d: () => 2 * R.int(15, 40), dmot: 'pair'},
    {mot: 'multiples de 3', un: 'multiple de 3', nom: 'multiple de 3', first: 12, last: 99, s: 3, d: () => 3 * R.int(10, 25), dmot: 'un multiple de 3'},
    {mot: 'multiples de 5', un: 'multiple de 5', nom: 'multiple de 5', first: 10, last: 95, s: 5, d: () => 5 * R.int(6, 13), dmot: 'un multiple de 5'}]);
  const d = fam.d(), X = fam.last - d, ans = (X - fam.first) / fam.s + 1;
  const q = 'Combien de paires de ' + fam.mot + ' à deux chiffres ont une différence égale à ' + d + QM + ' L\'ordre ne compte pas.';
  const expl = 'On appelle b le plus petit nombre de la paire, on exprime l\'autre en fonction de b, puis on liste les valeurs possibles de b, qui avancent de pas en pas. L\'autre vaut b + ' + d + ' ; comme ' + d + ' est ' + fam.dmot +
    ', b + ' + d + ' est ' + fam.un + ' dès que b l\'est. b est un ' + fam.nom + ' à deux chiffres, donc b ≥ ' + fam.first + ' ; et b + ' + d + ' ≤ ' + fam.last + ', donc b ≤ ' + X + '. b prend les valeurs ' + fam.first + ', ' +
    (fam.first + fam.s) + ', …, ' + X + ' : (' + X + ' − ' + fam.first + ') ÷ ' + fam.s + ' + 1 = ' + ans + ' paires.';
  return sortie(q, ans, [
    [90 - d, v => 'Piège : ' + v + ' compte toutes les paires de nombres à deux chiffres, sans la condition sur les ' + fam.mot + '.'],
    [ans - 1, P1],
    [2 * ans, PORDRE],
    [ans + 1]], expl);
}

/* Entiers d'un intervalle qui donnent un reste r dans la division par k. */
function l4Reste(R){
  const k = R.int(3, 12), r = R.int(1, k - 1), a = R.int(1, 150), b = a + R.int(150, 600), c = R.int(1, 2);
  const f = a + ((r - a % k) % k + k) % k, l = b - ((b % k - r) % k + k) % k, ans = (l - f) / k + 1;
  const q = c === 1 ? 'Combien d\'entiers de ' + a + ' à ' + b + ' (inclus) donnent un reste égal à ' + r + ' dans la division par ' + k + QM
    : 'Combien d\'entiers de ' + a + ' à ' + b + ' (inclus) peuvent s\'écrire ' + k + ' × q + ' + r + ', où q est un entier' + QM;
  const expl = 'Les nombres qui ont le même reste se suivent de diviseur en diviseur : on cherche le premier et le dernier dans l\'intervalle, puis on applique (dernier − premier) ÷ pas + 1. Le premier à partir de ' + a + ' est ' + f +
    ' = ' + k + ' × ' + (f - r) / k + ' + ' + r + ' ; le dernier jusqu\'à ' + b + ' est ' + l + ' = ' + k + ' × ' + (l - r) / k + ' + ' + r + '. (' + l + ' − ' + f + ') ÷ ' + k + ' + 1 = ' + (l - f) / k + ' + 1 = ' + ans + '.';
  return sortie(q, ans, [
    [M(k, a, b), v => 'Piège : ' + v + ' compte les multiples de ' + k + ' au lieu des nombres de reste ' + r + '.'],
    [fl((b - a) / k), v => 'Piège : ' + v + ' divise la largeur de l\'intervalle par ' + k + ' sans chercher le premier et le dernier nombre.'],
    [ans - 1, P1], [ans + 1]], expl);
}

/* Entiers n (positifs, ou positifs et négatifs) dont le carré est dans [A ; B]. */
function l4CarreEncadre(R){
  const A0 = R.pick([200, 300, 500, 600, 700, 800, 1000, 1200, 1500, 2000]), B0 = R.pick([3000, 4000, 5000, 6000, 7000, 8000, 9000].filter(x => x >= A0 + 1500));
  const s1 = isqrt(A0 - 1) + 1, s2 = isqrt(B0), pos = s2 - s1 + 1, c = R.int(1, 2);
  const q = c === 1 ? 'Combien d\'entiers positifs n vérifient ' + nb(A0) + ' ≤ n² ≤ ' + nb(B0) + QM
    : 'Combien d\'entiers n, positifs ou négatifs, vérifient ' + nb(A0) + ' ≤ n² ≤ ' + nb(B0) + QM;
  const expl = 'On encadre chaque borne entre deux carrés connus, pour trouver le plus petit et le plus grand entier positif qui conviennent. ' + (s1 - 1) + '² = ' + nb((s1 - 1) * (s1 - 1)) + ' est trop petit et ' + s1 + '² = ' +
    nb(s1 * s1) + ' convient ; ' + s2 + '² = ' + nb(s2 * s2) + ' convient et ' + (s2 + 1) + '² = ' + nb((s2 + 1) * (s2 + 1)) + ' est trop grand. Les entiers positifs vont de ' + s1 + ' à ' + s2 + ' : ' + s2 + ' − ' + s1 + ' + 1 = ' + pos + '.' +
    (c === 2 ? ' Chaque entier positif n a un opposé −n qui a le même carré : 2 × ' + pos + ' = ' + 2 * pos + ' entiers.' : '');
  if (c === 1) return sortie(q, pos, [
    [pos - 1, P1],
    [2 * pos, v => 'Piège : ' + v + ' compte aussi les entiers négatifs, exclus par l\'énoncé.'],
    [pos + 1], [pos - 2]], expl);
  return sortie(q, 2 * pos, [
    [pos, v => 'Piège : ' + v + ' oublie les entiers négatifs, dont le carré est le même.'],
    [2 * pos - 2, v => 'Piège : ' + v + ' oublie le +1 en comptant les entiers positifs.'],
    [2 * pos + 2], [2 * pos + 1]], expl);
}

/* =====================================================
   Niveau 5 : haut du test adaptatif
   ===================================================== */

/* Inclusion-exclusion avec trois diviseurs premiers entre eux deux à deux. */
function l5Trois(R){
  const t = R.pick([[2, 3, 5, 30, 4, 20], [2, 3, 7, 42, 5, 12], [2, 5, 7, 70, 2, 8], [3, 4, 5, 60, 2, 10]]);
  const a = t[0], b = t[1], c = t[2], N = t[3] * R.int(t[4], t[5]);
  const x = fl(N / a), y = fl(N / b), z = fl(N / c), xy = fl(N / (a * b)), xz = fl(N / (a * c)), yz = fl(N / (b * c)), xyz = fl(N / (a * b * c));
  const S1 = x + y + z, S2 = xy + xz + yz, ou = S1 - S2 + xyz, ni = N - ou, mode = R.int(1, 2);
  const q = mode === 1 ? 'Combien d\'entiers de 1 à ' + nb(N) + ' sont divisibles par ' + a + ', par ' + b + ' ou par ' + c + ' (par au moins l\'un des trois)' + QM
    : 'Combien d\'entiers de 1 à ' + nb(N) + ' ne sont divisibles ni par ' + a + ', ni par ' + b + ', ni par ' + c + QM;
  const expl = 'On additionne les multiples de chaque nombre, on retire ceux qui ont été comptés deux fois (multiples de deux des nombres), puis on rajoute ceux des trois à la fois, qu\'on vient de retirer une fois de trop. ' +
    'Multiples de ' + a + ', ' + b + ', ' + c + ' : ' + x + ' + ' + y + ' + ' + z + ' = ' + S1 + '. Ces trois nombres n\'ont deux à deux aucun diviseur commun, donc le PPCM de deux d\'entre eux est leur produit : multiples de ' +
    a * b + ', ' + a * c + ', ' + b * c + ' : ' + xy + ' + ' + xz + ' + ' + yz + ' = ' + S2 + '. Multiples de ' + a * b * c + ' : ' + xyz + '. Divisibles par au moins l\'un des trois : ' + S1 + ' − ' + S2 + ' + ' + xyz + ' = ' + ou + '.' +
    (mode === 2 ? ' Il reste ' + nb(N) + ' − ' + ou + ' = ' + ni + '.' : '');
  if (mode === 1) return sortie(q, ou, [
    [S1 - S2, v => 'Piège : ' + v + ' oublie de rajouter les multiples des trois nombres, retirés une fois de trop.'],
    [S1, v => 'Piège : ' + v + ' ne retire aucun doublon.'],
    [ni, v => 'Piège : ' + v + ' compte les nombres divisibles par aucun des trois.'],
    [ou - 1]], expl);
  return sortie(q, ni, [
    [N - (S1 - S2), v => 'Piège : ' + v + ' oublie de rajouter les multiples des trois nombres, retirés une fois de trop.'],
    [N - S1, v => 'Piège : ' + v + ' retire séparément les multiples de chacun, si bien que les nombres divisibles par deux d\'entre eux sont retirés plusieurs fois.'],
    [ou, v => 'Piège : ' + v + ' compte les nombres divisibles au lieu des autres.'],
    [ni + 1]], expl);
}

/* Nombres communs à deux listes de pas r1 et r2. */
function l5Communs(R){
  const pr = R.pick([[4, 6], [6, 9], [6, 8], [4, 10], [6, 10], [9, 12], [8, 12], [10, 15], [3, 5], [4, 7], [5, 7], [3, 8], [4, 9], [5, 6]]);
  const sw = R.int(0, 1), r1 = sw ? pr[1] : pr[0], r2 = sw ? pr[0] : pr[1], L = ppcm(r1, r2);
  const cc = R.int(5, 40), a0 = ((cc - 1) % r1) + 1 + r1 * R.int(0, 1), b0 = ((cc - 1) % r2) + 1 + r2 * R.int(0, 1);
  let f = Math.max(a0, b0);
  for (let s = 0; s < 2000 && !((f - a0) % r1 === 0 && (f - b0) % r2 === 0); s++) f++;
  const N = R.int(Math.max(150, f + 4 * L), Math.max(600, f + 8 * L)), ans = fl((N - f) / L) + 1, last = f + (ans - 1) * L;
  const q = 'La liste A commence par ' + debutListe(a0, r1) + ', … (on ajoute ' + r1 + ' à chaque fois) et la liste B par ' + debutListe(b0, r2) + ', … (on ajoute ' + r2 +
    ' à chaque fois). Combien de nombres inférieurs ou égaux à ' + N + ' figurent dans les deux listes' + QM;
  const expl = 'Un nombre commun aux deux listes le reste si l\'on avance d\'un multiple commun des deux pas : on cherche le premier nombre commun, puis on avance de PPCM en PPCM. En prolongeant les deux listes, le premier nombre commun est ' + f +
    '. Le plus petit multiple commun de ' + r1 + ' et ' + r2 + ' est ' + L + ' : les nombres communs sont ' + f + ', ' + (f + L) + ', ' + (f + 2 * L) + ', … jusqu\'à ' + last + ' (le suivant, ' + (last + L) + ', dépasse ' + N + '). (' +
    last + ' − ' + f + ') ÷ ' + L + ' + 1 = ' + (ans - 1) + ' + 1 = ' + ans + '.';
  return sortie(q, ans, [
    [L !== r1 * r2 ? fl((N - f) / (r1 * r2)) + 1 : null, v => 'Piège : ' + v + ' avance de ' + r1 + ' × ' + r2 + ' = ' + r1 * r2 + ' au lieu du PPCM ' + L + ', et oublie des nombres communs.'],
    [ans - 1, P1],
    [fl(N / L), v => 'Piège : ' + v + ' compte les multiples de ' + L + ', alors que les nombres communs ne sont pas des multiples de ' + L + '.'],
    [ans + 1]], expl);
}

/* Paires dont la différence vaut au moins d : somme 1 + 2 + … + k. */
function l5AuMoins(R){
  const c = R.int(1, 3);
  let lo, hi, k, q;
  if (c === 1){ lo = 10; hi = 99; k = R.int(6, 18); q = 'Combien de paires de nombres à deux chiffres ont une différence d\'au moins ' + (90 - k) + ' (c\'est-à-dire supérieure ou égale à ' + (90 - k) + ')' + QM + ' L\'ordre ne compte pas.'; }
  else if (c === 2){ lo = 100; hi = 999; k = R.int(6, 15); q = 'Combien de paires de nombres à trois chiffres ont une différence d\'au moins ' + (900 - k) + ' (c\'est-à-dire supérieure ou égale à ' + (900 - k) + ')' + QM + ' L\'ordre ne compte pas.'; }
  else { lo = 1; hi = R.int(40, 120); k = R.int(6, 16); q = 'On choisit deux entiers différents parmi les entiers de 1 à ' + hi + '. Combien de paires ont une différence d\'au moins ' + (hi - k) + QM + ' L\'ordre ne compte pas.'; }
  const d = hi - lo + 1 - k, ans = k * (k + 1) / 2;
  const expl = 'On classe les paires selon leur différence exacte, on compte chaque groupe comme d\'habitude, puis on additionne. Différence ' + d + ' : le plus petit nombre va de ' + lo + ' à ' + (hi - d) + ', soit ' + k + ' paires. Différence ' +
    (d + 1) + ' : ' + (k - 1) + ' paires. Et ainsi de suite jusqu\'à la différence ' + (hi - lo) + ' (' + lo + ' et ' + hi + ') : 1 paire. Total : ' + k + ' + ' + (k - 1) + ' + … + 1 = ' + k + ' × ' + (k + 1) + ' ÷ 2 = ' + ans + '.';
  return sortie(q, ans, [
    [k * (k - 1) / 2, v => 'Piège : ' + v + ' oublie le +1 sur le nombre de paires de différence ' + d + ', et toute la somme est décalée d\'un cran.'],
    [k * (k + 1), PORDRE],
    [k, v => 'Piège : ' + v + ' ne compte que les paires de différence exactement ' + d + '.'],
    [(k + 1) * (k + 2) / 2]], expl);
}

/* Ni carré ni cube (ou carré ou cube). */
function l5CarreCube(R){
  const N = R.pick([500, 600, 700, 750, 800, 900, 1000, 1200, 1500, 1800, 2000, 2400, 2500, 3000]);   // N ≥ 500 : trois doublons possibles (1, 64, 729) ; N < 4 096
  const s = isqrt(N), c = icbrt(N), sixL = [1, 64, 729].filter(v => v <= N), h = sixL.length, ou = s + c - h, ni = N - ou, mode = R.int(1, 2);
  const def = ' carrés parfaits (1, 4, 9, 16, …)', defc = ' cubes parfaits (1, 8, 27, 64, …)';
  const q = mode === 1 ? 'Combien d\'entiers de 1 à ' + nb(N) + ' ne sont ni des' + def + ', ni des' + defc + QM
    : 'Combien d\'entiers de 1 à ' + nb(N) + ' sont des' + def + ' ou des' + defc + QM;
  const expl = 'On compte les carrés, puis les cubes, et on retire les nombres comptés deux fois, qui sont à la fois des carrés et des cubes. Carrés : ' + s + '² = ' + nb(s * s) + ' ne dépasse pas ' + nb(N) + ' et ' + (s + 1) + '² = ' + nb((s + 1) * (s + 1)) +
    ' dépasse, donc ' + s + ' carrés. Cubes : ' + c + '³ = ' + nb(c * c * c) + ' ne dépasse pas et ' + (c + 1) + '³ = ' + nb((c + 1) * (c + 1) * (c + 1)) + ' dépasse, donc ' + c + ' cubes. À la fois carrés et cubes : ' + sixL.join(', ') +
    ' (1 = 1² = 1³' + (h > 1 ? ', 64 = 8² = 4³' : '') + (h > 2 ? ', 729 = 27² = 9³' : '') + '), soit ' + h + '. Carrés ou cubes : ' + s + ' + ' + c + ' − ' + h + ' = ' + ou + '.' + (mode === 1 ? ' Il reste ' + nb(N) + ' − ' + ou + ' = ' + nb(ni) + '.' : '');
  if (mode === 1) return sortie(q, ni, [
    [N - s - c, v => 'Piège : ' + v + ' retire deux fois les nombres qui sont à la fois carrés et cubes.'],
    [h > 1 ? N - s - c + 1 : null, v => 'Piège : ' + v + ' ne pense qu\'au nombre 1 comme nombre à la fois carré et cube.'],
    [ou, v => 'Piège : ' + v + ' compte les carrés et les cubes au lieu des autres nombres.'],
    [ni + 1]], expl);
  return sortie(q, ou, [
    [s + c, v => 'Piège : ' + v + ' compte deux fois les nombres à la fois carrés et cubes.'],
    [h > 1 ? s + c - 1 : null, v => 'Piège : ' + v + ' ne pense qu\'au nombre 1 comme nombre à la fois carré et cube.'],
    [N - ou, v => 'Piège : ' + v + ' compte les nombres qui ne sont ni carrés ni cubes.'],
    [ou + 1]], expl);
}

/* Du nombre de chiffres écrits au nombre de pages. */
function l5PagesInv(R){
  const P = R.int(120, 999), D = 3 * P - 108, Y = P - 99, c = R.int(1, 2);
  const q = c === 1 ? 'Pour numéroter les pages d\'un livre à partir de la page 1, on a écrit ' + nb(D) + ' chiffres en tout. Combien de pages compte ce livre' + QM
    : 'On numérote des casiers à partir de 1 en collant un autocollant par chiffre (le casier 47 en reçoit 2). On a utilisé ' + nb(D) + ' autocollants en tout. Combien y a-t-il de casiers' + QM;
  const expl = 'On retire d\'abord les chiffres utilisés par les numéros à un et à deux chiffres, puis on divise ce qui reste par 3. De 1 à 9 : 9 chiffres ; de 10 à 99 : 90 × 2 = 180 chiffres ; soit 189 chiffres pour les 99 premiers numéros. Il reste ' +
    nb(D) + ' − 189 = ' + nb(D - 189) + ' chiffres, soit ' + nb(D - 189) + ' ÷ 3 = ' + Y + ' numéros à trois chiffres : ce sont les numéros 100 à 99 + ' + Y + ' = ' + P + '. Contrôle : 9 + 180 + 3 × ' + Y + ' = ' + nb(D) + '.';
  return sortie(q, P, [
    [P + 1, v => 'Piège : ' + v + ' ajoute 100 au lieu de 99 : les ' + Y + ' numéros à trois chiffres vont de 100 à ' + P + '.'],
    [Y, v => 'Piège : ' + v + ' oublie les 99 premiers numéros.'],
    [fl(D / 3), v => 'Piège : ' + v + ' divise directement par 3, comme si tous les numéros avaient trois chiffres.'],
    [P - 1]], expl);
}

/* Nombre de fois qu'on écrit le chiffre c en écrivant les entiers de 1 à 100 × m. */
function l5Chiffre(R){
  const m = R.int(2, 9), c = R.int(1, 3) === 1 ? m : R.int(1, 9), N = 100 * m, H = c < m ? 100 : c === m ? 1 : 0, ans = 20 * m + H;
  const q = 'On écrit tous les entiers de 1 à ' + N + '. Combien de fois écrit-on le chiffre ' + c + ' en tout' + QM + ' (Dans ' + (11 * c) + ', il est écrit deux fois.)';
  const cent = c < m ? 'les 100 nombres de ' + c + '00 à ' + c + '99 l\'ont comme chiffre des centaines, soit 100 fois' : c === m ? 'seul ' + N + ' l\'a comme chiffre des centaines (on s\'arrête à ' + N + '), soit 1 fois'
    : 'aucun nombre jusqu\'à ' + N + ' n\'a ' + c + ' comme chiffre des centaines';
  const expl = 'On compte séparément le chiffre à la place des unités, à la place des dizaines et à la place des centaines, puis on additionne. Unités : une fois par dizaine, soit 10 fois par centaine, donc 10 × ' + m + ' = ' + 10 * m +
    ' fois. Dizaines : les nombres de ' + c + '0 à ' + c + '9 dans chaque centaine, soit 10 par centaine, donc ' + 10 * m + ' fois. Centaines : ' + cent + '. Total : ' + 10 * m + ' + ' + 10 * m + ' + ' + H + ' = ' + ans + '.';
  return sortie(q, ans, [
    [19 * m + H, v => 'Piège : ' + v + ' compte une seule fois les nombres comme ' + 11 * c + ', où le chiffre apparaît deux fois.'],
    [c === m ? 20 * m + 100 : null, v => 'Piège : ' + v + ' compte toute la centaine de ' + c + '00 à ' + c + '99, alors qu\'on s\'arrête à ' + N + '.'],
    [H ? 20 * m : null, v => 'Piège : ' + v + ' oublie le chiffre des centaines.'],
    [10 * m + H, v => 'Piège : ' + v + ' oublie le chiffre des dizaines.'],
    [ans + 1]], expl);
}

/* Multiples de a mais pas de b, parmi les nombres à trois chiffres ou de 1 à N. */
function l5MaisPas(R){
  const pr = R.pick([[4, 6], [6, 4], [4, 10], [10, 4], [6, 9], [9, 6], [6, 8], [8, 6], [8, 12], [12, 8], [10, 15], [15, 10], [6, 10], [10, 6], [4, 14], [12, 18], [9, 12], [12, 9], [6, 15], [15, 6]]);
  const a = pr[0], b = pr[1], m = ppcm(a, b), c = R.int(1, 2);
  const lo = c === 1 ? 100 : 1, hi = c === 1 ? 999 : R.pick(N_LISTE.filter(x => x >= 3 * m));
  const Ma = M(a, lo, hi), Mm = M(m, lo, hi), ans = Ma - Mm;
  const q = c === 1 ? 'Combien de nombres à trois chiffres sont multiples de ' + a + ', mais pas multiples de ' + b + QM
    : 'Combien d\'entiers de 1 à ' + nb(hi) + ' sont multiples de ' + a + ', mais pas multiples de ' + b + QM;
  const compte = k => c === 1 ? fl(999 / k) + ' − ' + fl(99 / k) + ' = ' + M(k, lo, hi) : String(M(k, lo, hi));
  const expl = 'On compte les multiples du premier nombre, puis on retire ceux qui sont aussi multiples du second, c\'est-à-dire les multiples du PPCM. Multiples de ' + a + (c === 1 ? ' à trois chiffres : ' : ' jusqu\'à ' + nb(hi) + ' : ') + compte(a) +
    (c === 1 ? ' (jusqu\'à 999, moins ceux jusqu\'à 99)' : '') + '. Un nombre est multiple de ' + a + ' et de ' + b + ' quand il est multiple de leur PPCM ' + m + ' (et non de ' + a + ' × ' + b + ' = ' + a * b + ') ; il y en a ' + compte(m) +
    '. Réponse : ' + Ma + ' − ' + Mm + ' = ' + ans + '.';
  return sortie(q, ans, [
    [Ma - M(a * b, lo, hi), v => 'Piège : ' + v + ' retire les multiples de ' + a * b + ' (le produit) au lieu de ceux de ' + m + ' (le PPCM).'],
    [Ma - M(b, lo, hi), v => 'Piège : ' + v + ' retire tous les multiples de ' + b + ', même ceux qui ne sont pas multiples de ' + a + '.'],
    [c === 1 ? fl(999 / a) - fl(999 / m) : null, v => 'Piège : ' + v + ' oublie d\'écarter les nombres à un ou deux chiffres.'],
    [ans - 1], [ans + 1]], expl);
}

const TYPES = {
  1: [l1Intervalle, l1Piquets, l1Multiples, l1Coupes],
  2: [l2MultInter, l2Suite, l2Paires, l2Boucle, l2Etages],
  3: [l3PairesDiff, l3PairesSomme, l3MultChiffres, l3Encadrement, l3SuiteInter, l3Rect, l3Carres, l3Bus],
  4: [l4Ou, l4Ni, l4Chiffres, l4PairesParite, l4Reste, l4CarreEncadre],
  5: [l5Trois, l5Communs, l5AuMoins, l5CarreCube, l5PagesInv, l5Chiffre, l5MaisPas]
};

A.push({
  id: 'alb-05-compter-intervalles',
  phase: 'albert',
  ordre: 5,
  theme: 'denombrement',
  titre: 'Compter des entiers : intervalles, paires, multiples',
  objectif: 'Compter sans les écrire les entiers d\'un intervalle, les piquets d\'une clôture, les paires d\'écart donné et les multiples d\'un nombre, sans jamais oublier le +1.',
  lecon:
`<p class="lede">Compter des nombres entiers sans les écrire un par un : des pages, des piquets, des paires, des multiples. Une seule formule fait presque tout le travail, à condition de ne pas oublier <mark>le +1</mark>.</p>
<h2>Ce que le test demande</h2>
<p>On te demande combien d'entiers vérifient une condition : être entre deux bornes, être multiple d'un nombre, former avec un autre une paire d'écart donné, être un piquet sur une clôture. Les nombres sont trop grands pour tout écrire : il faut ramener la question à « combien d'entiers de tel nombre à tel nombre ». Les choix proposés diffèrent souvent d'une seule unité : le piège est presque toujours un +1 oublié, ou ajouté à tort.</p>
<h2>Ce qu'il faut savoir avant</h2>
<div class="formule"><p>nombre d'entiers de a à b, a et b compris = b − a + 1</p></div>
<p>Pourquoi +1 ? b − a compte les <strong>écarts</strong> entre deux nombres voisins, et il y a toujours un nombre de plus que d'écarts. De 3 à 5 : 5 − 3 = 2 écarts, mais 3 nombres (3, 4 et 5).</p>
<p>Les nombres <strong>à deux chiffres</strong> vont de 10 à 99 : il y en a 99 − 10 + 1 = 90. À trois chiffres : de 100 à 999, soit 900.</p>
<p>Les <strong>multiples de k de 1 à N</strong> : on cherche combien de fois k tient dans N, en gardant la partie entière. De 1 à 100, il y a 14 multiples de 7, car 7 × 14 = 98 et 7 × 15 = 105 dépasse.</p>
<p>Le <strong>PPCM</strong> de deux nombres est leur plus petit multiple commun : PPCM(4 ; 6) = 12, et non 24. Un nombre est multiple de 4 et de 6 exactement quand il est multiple de 12.</p>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je nomme ce que je compte :</strong> le plus petit nombre b d'une paire, le facteur d'un multiple (7 × 15, 7 × 16…), le rang d'un terme.</p>
<p><strong>2. J'écris toutes les contraintes :</strong> chaque condition devient une inégalité sur cette inconnue, et j'en tire un intervalle « de … à … ».</p>
<p><strong>3. Je compte :</strong> dernier − premier + 1, ou (dernier − premier) ÷ pas + 1 quand les nombres avancent de pas en pas.</p>
<p><strong>4. Je contrôle :</strong> j'écris le premier et le dernier élément trouvés, ou je teste la formule sur un tout petit cas.</p>
</div>
<h2>Exemples résolus</h2>
<h3>Exemple 1 : les entiers de 37 à 112</h3>
<p>112 − 37 + 1 = <strong>76 entiers</strong>. Sans le +1, on trouve 75 : c'est le choix piège.</p>
<h3>Exemple 2 : une clôture droite de 100 m, un piquet tous les 4 m</h3>
<p>100 ÷ 4 = 25 espaces. Sur une ligne, il y a un piquet de plus que d'espaces : <strong>26 piquets</strong>. Sur un tour fermé (un lac de 100 m de tour), le dernier espace ramène au premier piquet : 25 piquets seulement.</p>
<h3>Exemple 3 : paires de nombres à deux chiffres dont la différence vaut 58</h3>
<p>J'appelle b le plus petit : l'autre vaut b + 58. Il faut b ≥ 10 et b + 58 ≤ 99, donc b ≤ 41. b va de 10 à 41 : 41 − 10 + 1 = <strong>32 paires</strong>. Contrôle : la première paire est 10 et 68, la dernière 41 et 99. Comme b est toujours le plus petit, chaque paire n'est comptée qu'une fois : 10 et 68, c'est la même paire que 68 et 10.</p>
<h3>Exemple 4 : entiers de 1 à 500 multiples de 4 ou de 6</h3>
<p>Multiples de 4 : 125. Multiples de 6 : 83, car 6 × 83 = 498. Les multiples de 12 sont comptés dans les deux groupes : il y en a 41, car 12 × 41 = 492. Réponse : 125 + 83 − 41 = <strong>167</strong>. Retirer les multiples de 24 (4 × 6) serait faux : 36 est multiple de 4 et de 6 sans être multiple de 24.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl">
<tr><th>Situation</th><th>Formule</th><th>Exemple</th></tr>
<tr><td>Entiers de a à b</td><td>b − a + 1</td><td>de 20 à 50 : 31</td></tr>
<tr><td>Liste qui avance de r en r</td><td>(dernier − premier) ÷ r + 1</td><td>5, 9, 13, …, 81 : 20</td></tr>
<tr><td>Ligne de longueur L, un objet tous les d, un à chaque bout</td><td>L ÷ d + 1</td><td>60 m, tous les 5 m : 13</td></tr>
<tr><td>Tour fermé de longueur L</td><td>L ÷ d</td><td>60 m de tour, tous les 5 m : 12</td></tr>
<tr><td>Couper en n morceaux</td><td>n − 1 coupes</td><td>8 morceaux : 7 coupes</td></tr>
<tr><td>Multiples de k de a à b</td><td>dernier facteur − premier facteur + 1</td><td>multiples de 7 de 100 à 300 : 7 × 15 = 105 et 7 × 42 = 294, donc 42 − 15 + 1 = 28</td></tr>
<tr><td>Multiples de a ou de b</td><td>multiples de a + multiples de b − multiples du PPCM</td><td>4 ou 6 jusqu'à 500 : 167</td></tr>
</table>
<p>Pour diviser sans calculatrice, encadre : 999 ÷ 13, c'est entre 70 (910) et 80 (1 040) ; 13 × 76 = 988 et 13 × 77 = 1 001 dépasse, donc 76 multiples de 13 jusqu'à 999. Pour les étages et les horloges, compte les intervalles, pas les numéros : du 1er au 4e étage, on franchit 3 étages, pas 4. « Ni a ni b », c'est le total moins les multiples de a ou de b. Avec trois nombres, on additionne, on retire les multiples communs à deux d'entre eux, puis on rajoute ceux communs aux trois.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Ramène la question à « combien d'entiers de tel nombre à tel nombre », puis compte avec dernier − premier + 1.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Oublier le +1 : le choix décalé d'une unité est presque toujours proposé. Mettre un +1 sur un tour fermé, où il n'y en a pas. Compter deux fois une même paire en changeant l'ordre. Retirer les multiples du produit a × b au lieu de ceux du PPCM. Oublier qu'un nombre « à deux chiffres » commence à 10, pas à 1. Compter les étages ou les coups d'horloge au lieu des intervalles. Lire « entre » sans vérifier si les bornes sont comprises.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>De a à b : b − a + 1 entiers. De pas en pas : (dernier − premier) ÷ pas + 1. Ligne : L ÷ d + 1 objets ; tour fermé : L ÷ d. Paires d'écart d : appelle b le plus petit et encadre b. Multiples de a ou de b : on additionne, puis on retire les multiples du PPCM.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try { return R.pick(TYPES[n])(R); }
    catch(e){ return l1Intervalle(R); }
  }
});

})();
