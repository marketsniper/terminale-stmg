/* ===== Maths · Objectif Albert School : alb-29-visuel-2d =====
   Visuel 2D décrit en texte : pliages et découpes, plis d'une bande, ficelles coupées, tracés d'un seul trait,
   grilles pliées ou tournées, déplacements et aires sur quadrillage, diagonale d'un rectangle quadrillé,
   carrés penchés, parcours minimal d'un grillage.
   Une IIFE qui pousse UN objet dans window.ALBERT_SKILLS. QCM à 4 choix, accept: null, texte brut dans q/choix/expl.
   Réponses calculées par le code ; vérifiées par simulation (pliages pixel par pixel, parcours exhaustifs,
   énumération des carrés) dans verifs/alb-29-visuel-2d-verif.js.
   N1 : trous après pliages, épaisseurs, parties d'une bande, tracé d'un seul trait (points impairs comptés), grille pliée en son milieu.
   N2 : marques de pli, feuille pliée dans les deux sens, ficelle coupée une fois, tracé d'un seul trait (points nommés),
        horloge vue dans un miroir, retour au départ sur un quadrillage, grille pliée hors du milieu, en diagonale ou tournée d'un demi-tour.
   N3 : demi-disque sur le dernier pli, nombre minimal de traits d'une figure, quart de tour et piles de cases,
        distance à vol d'oiseau, diagonale d'un rectangle (côtés premiers entre eux), ficelle pliée coupée plusieurs fois, aire d'un tracé en L.
   N4 : découpe au coin de deux plis, diagonale d'un rectangle (avec pgcd), traits d'un quadrillage, spirale, aire d'un tracé en escalier,
        quart de tour puis pliage.
   N5 : carrés penchés sur une grille de points, plis en creux ou en bosse, parcours minimal d'un grillage, découpes combinées. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales ---------- */
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
  for (let k = 1; ch.length < 4 && k < 80; k++) ajouter(voisin(k));
  return ch;
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));
const e = x => nb(x, 0);
const QM = ' ?';
const pw = k => Math.pow(2, k);
const MOT = {1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix'};
const mot = n => MOT[n] || e(n);
const LET = 'ABCDEFGHIJ';
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const vois = (ans, min) => k => { const v = ans + (k % 2 ? (k + 1) / 2 : -k / 2); return v >= (min == null ? 1 : min) ? e(v) : null; };
const ordi = d => d === 1 ? '1re' : d + 'e';
function pgcd(a, b){ while (b){ const t = a % b; a = b; b = t; } return a; }
function listeFr(t){ return t.length < 2 ? t.join('') : t.slice(0, -1).join(', ') + ' et ' + t[t.length - 1]; }
const doubl = k => { const t = [1]; for (let i = 1; i <= k; i++) t.push(pw(i)); return t.map(e).join(' → '); };
/* Choix + notes « Piège » pour les distracteurs effectivement affichés ; src (facultatif) = la case de départ, jamais proposée. */
function Q(q, bonne, pieges, voisin, expl, src){
  const ok = c => (src != null && c != null && norm(c) === norm(src)) ? null : c;
  if (src != null){ pieges = pieges.map(p => [ok(p[0]), p[1]]); const v0 = voisin; voisin = k => ok(v0(k)); }
  const choix = qcm(bonne, pieges.map(p => p[0]), voisin);
  const vus = new Set([norm(bonne)]), notes = [];
  pieges.forEach(p => {
    if (p[0] == null) return;
    const k = norm(p[0]);
    if (vus.has(k) || !choix.some(c => norm(c) === k)) return;
    vus.add(k); notes.push('Piège : ' + p[0] + ', ' + p[1] + '.');
  });
  return {q, a: bonne, accept: null, choix, expl: expl + (notes.length ? ' ' + notes.join(' ') : '')};
}

/* ---------- vocabulaire des pliages ---------- */
const SUP = [['une feuille de papier', 'la feuille', 'elle'], ['une serviette en papier', 'la serviette', 'elle'], ['une feuille de papier calque', 'la feuille', 'elle'],
  ['un carré de papier de soie', 'le carré de papier', 'il'], ['une page de journal', 'la page', 'elle']];
const OUTIL = ['une perforatrice', 'un poinçon', 'une grosse aiguille'];
function enDeux(R, k){
  if (k === 1) return 'en deux';
  return R.pick([
    'en deux, ' + mot(k) + ' fois de suite',
    k === 2 ? 'en deux, puis encore en deux' : 'en deux, puis encore en deux, et ainsi de suite, ' + mot(k) + ' fois en tout'
  ]);
}
/* Pliages décrits : G = bord gauche sur bord droit, D = droit sur gauche (plis verticaux) ; H = haut sur bas, B = bas sur haut (plis horizontaux). */
const PLI = {G: 'on rabat le bord gauche sur le bord droit', D: 'on rabat le bord droit sur le bord gauche',
  H: 'on rabat le bord du haut sur le bord du bas', B: 'on rabat le bord du bas sur le bord du haut'};
const axe = f => (f === 'G' || f === 'D') ? 'V' : 'H';
const ORD = i => i === 1 ? '1er' : i + 'e';
function listePlis(s){ return s.map((f, i) => '- ' + ORD(i + 1) + ' pliage : ' + PLI[f] + (i === s.length - 1 ? '.' : ' ;')).join('\n'); }
/* mode 'deux' : au moins un pli dans chaque sens ; 'fin' : les deux derniers plis sont perpendiculaires. */
function tirePlis(R, k, mode){
  for (let t = 0; t < 200; t++){
    const s = []; for (let i = 0; i < k; i++) s.push(R.pick(['G', 'D', 'H', 'B']));
    const a = s.filter(f => axe(f) === 'V').length;
    if (mode === 'deux' && (a === 0 || a === k)) continue;
    if (mode === 'fin' && axe(s[k - 1]) === axe(s[k - 2])) continue;
    return s;
  }
  const s = []; for (let i = 0; i < k; i++) s.push(i % 2 ? 'H' : 'G');
  return s;
}
const introPlis = (k, s) => 'On plie une feuille rectangulaire ' + mot(k) + ' fois de suite, à chaque fois en deux :\n' + listePlis(s) + '\n';

/* ---------- grilles ---------- */
const cs = (c, r) => LET[c - 1] + r;
function introGrille(C, L){
  return 'Une grille de ' + C + ' colonnes et ' + L + ' lignes est dessinée sur une feuille : colonnes A à ' + LET[C - 1] +
    ' de gauche à droite, lignes 1 à ' + L + ' de haut en bas (la case B3 est dans la colonne B et la ligne 3). ';
}
const dansG = (p, C, L) => p[0] >= 1 && p[0] <= C && p[1] >= 1 && p[1] <= L;
const csP = (p, C, L) => (p && dansG(p, C, L)) ? cs(p[0], p[1]) : null;
const rotH = (p, n) => [n + 1 - p[1], p[0]];        // quart de tour, sens des aiguilles d'une montre
const rotA = (p, n) => [p[1], n + 1 - p[0]];        // quart de tour, sens inverse
const demi = (p, C, L) => [C + 1 - p[0], L + 1 - p[1]];
function voisCase(p, C, L){
  return k => { const d = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [0, 2], [-2, 0], [0, -2]][(k - 1) % 12];
    return csP([p[0] + d[0], p[1] + d[1]], C, L); };
}

/* ---------- tracés d'un seul trait ---------- */
const CTX_T = [
  {intro: 'Un dessin d\'un seul tenant', pt: 'point', pts: 'points', tr: 'trait', trs: 'traits', g: 'des traits se terminent ou se rejoignent',
    act: 'Peut-on le reproduire d\'un seul trait, sans lever le crayon et sans repasser sur un trait déjà tracé'},
  {intro: 'Un réseau de chemins d\'un seul tenant', pt: 'carrefour', pts: 'carrefours', tr: 'chemin', trs: 'chemins', g: 'des chemins se terminent ou se rejoignent',
    act: 'Peut-on faire une seule promenade qui emprunte chaque chemin exactement une fois'},
  {intro: 'Un plan de pistes cyclables d\'un seul tenant', pt: 'croisement', pts: 'croisements', tr: 'piste', trs: 'pistes', g: 'des pistes se terminent ou se rejoignent',
    act: 'Un cycliste peut-il faire une seule balade qui emprunte chaque piste exactement une fois'}
];
function groupeDeg(c, nbp, d){
  const qui = nbp === 1 ? 'un ' + c.pt : e(nbp) + ' ' + c.pts;
  return qui + (d === 1 ? ' où aboutit un seul ' + c.tr : ' où arrivent ' + d + ' ' + c.trs);
}

/* =====================================================  NIVEAU 1  ===================================================== */
function n1Trous(R){
  const k = R.int(2, 4), p = R.int(1, 3), s = R.pick(SUP), N = pw(k), ans = p * N;
  const q = 'On plie ' + s[0] + ' ' + enDeux(R, k) + '. Avec ' + R.pick(OUTIL) + ', on fait ' + (p === 1 ? 'un trou qui traverse' : mot(p) + ' trous qui traversent') +
    ' toutes les épaisseurs, loin des bords et des plis. On déplie ' + s[1] + '. Combien de trous compte-t-' + s[2] + QM;
  const expl = 'Chaque pliage en deux double le nombre d\'épaisseurs, et un trou fait dans le paquet traverse toutes les épaisseurs. Épaisseurs : ' + doubl(k) +
    ', soit ' + N + ' après ' + mot(k) + ' pliages. ' + (p === 1 ? 'Le trou devient donc ' + N + ' trous sur la feuille dépliée.' : 'Chaque trou devient ' + N + ' trous : ' + p + ' × ' + N + ' = ' + ans + ' trous.');
  return Q(q, e(ans), [
    [e(p * 2 * k), 'c\'est ajouter deux épaisseurs à chaque pliage, alors que chaque pliage les double'],
    [e(p * k), 'c\'est compter un trou par pliage'],
    [e(p * pw(k - 1)), 'c\'est oublier un des pliages'],
    [e(p * pw(k + 1)), 'c\'est doubler une fois de trop']
  ], vois(ans), expl);
}

function n1Epaisseur(R){
  const v = R.int(0, 2), mm = c => nb(c / 100) + ' mm';
  if (v === 0){
    const tc = R.pick([5, 10, 20]), k = R.int(3, 6), N = pw(k);
    const q = 'Une feuille de papier a une épaisseur de ' + mm(tc) + '. On la plie ' + enDeux(R, k) + '. Sans tenir compte de l\'écrasement du papier, quelle est l\'épaisseur du paquet obtenu' + QM;
    const expl = 'Chaque pliage en deux double le nombre d\'épaisseurs : on multiplie par 2 à chaque pliage, puis par l\'épaisseur d\'une feuille. Épaisseurs : ' + doubl(k) +
      ', soit ' + N + ' épaisseurs. Épaisseur du paquet : ' + N + ' × ' + mm(tc) + ' = ' + mm(tc * N) + '.';
    return Q(q, mm(tc * N), [
      [mm(tc * 2 * k), 'c\'est ajouter deux épaisseurs à chaque pliage au lieu de les doubler'],
      [mm(tc * k), 'c\'est multiplier l\'épaisseur par le nombre de pliages'],
      [mm(tc * pw(k - 1)), 'c\'est oublier un des pliages'],
      [mm(tc * pw(k + 1)), 'c\'est doubler une fois de trop']
    ], j => { const c = tc * (N + (j % 2 ? (j + 1) / 2 : -j / 2) * 2); return c > 0 ? mm(c) : null; }, expl);
  }
  if (v === 1){
    const N = R.pick([6, 10, 12, 20, 25, 30, 40, 50, 60, 100, 120, 200, 250, 500, 1000]);
    let k = 0; while (pw(k) < N && k < 40) k++;
    const q = R.pick(['On plie une feuille de papier en deux, puis encore en deux, et ainsi de suite.', 'On plie et on replie une feuille de papier, à chaque fois en deux.']) +
      ' Combien de pliages faut-il au minimum pour obtenir un paquet d\'au moins ' + e(N) + ' épaisseurs' + QM;
    const expl = 'Chaque pliage double le nombre d\'épaisseurs : on écrit les puissances de 2 jusqu\'à atteindre ou dépasser ' + e(N) + '. ' + doubl(k) + ' : après ' + mot(k - 1) +
      ' pliages, on n\'a que ' + e(pw(k - 1)) + ' épaisseurs ; après ' + mot(k) + ' pliages, on en a ' + e(pw(k)) + '. Il faut donc ' + k + ' pliages.';
    return Q(q, e(k), [
      [N <= 100 && N % 2 === 0 ? e(N / 2) : null, 'c\'est croire que chaque pliage ajoute deux épaisseurs, alors qu\'il les double'],
      [e(k - 1), 'avec ' + (k - 1) + ' pliages, on n\'a que ' + e(pw(k - 1)) + ' épaisseurs'],
      [e(k + 1), 'c\'est un pliage de trop : ' + k + ' pliages donnent déjà ' + e(pw(k)) + ' épaisseurs']
    ], vois(k), expl);
  }
  const tc = R.pick([10, 20]);
  const T = R.pick([[1, 'mm', 100], [2, 'mm', 200], [5, 'mm', 500], [1, 'cm', 1000], [2, 'cm', 2000], [5, 'cm', 5000], [10, 'cm', 10000]]);
  const need = Math.ceil(T[2] / tc); let k = 0; while (pw(k) < need && k < 40) k++;
  let kF = null;
  if (T[1] === 'cm'){ const n2 = Math.ceil(T[0] * 10000 / tc); kF = 0; while (pw(kF) < n2 && kF < 40) kF++; }
  const q = 'Une feuille de papier a une épaisseur de ' + mm(tc) + '. On la plie en deux, puis encore en deux, et ainsi de suite. Combien de pliages faut-il au minimum pour que le paquet atteigne au moins ' +
    T[0] + ' ' + T[1] + ' d\'épaisseur' + QM;
  const expl = 'On cherche d\'abord combien d\'épaisseurs il faut, puis la première puissance de 2 qui suffit. ' + (T[1] === 'cm' ? T[0] + ' cm = ' + e(T[0] * 10) + ' mm, et ' : '') +
    e(T[2] / 100) + ' mm ÷ ' + mm(tc) + ' = ' + e(T[2] / tc) + ' épaisseurs au moins. ' + doubl(k) + ' : ' + mot(k - 1) + ' pliages ne donnent que ' + e(pw(k - 1)) + ' épaisseurs, ' + mot(k) +
    ' pliages en donnent ' + e(pw(k)) + ', soit ' + mm(tc * pw(k)) + '. Il faut donc ' + k + ' pliages.';
  return Q(q, e(k), [
    [kF != null ? e(kF) : null, 'c\'est convertir 1 cm en 100 mm au lieu de 10 mm'],
    [e(k - 1), 'avec ' + (k - 1) + ' pliages, le paquet ne mesure que ' + mm(tc * pw(k - 1))],
    [e(k + 1), 'c\'est un pliage de trop']
  ], vois(k), expl);
}

function n1Bande(R){
  const k = R.int(2, 4), N = pw(k);
  const plie = 'On la plie en deux en ramenant un bout sur l\'autre, puis encore en deux' + (k > 2 ? ', et ainsi de suite, ' + mot(k) + ' fois en tout' : '') + '. ';
  if (R.int(0, 1)){
    const u = R.int(2, 9), L = u * N, cm = x => nb(x) + ' cm';
    const cmP = x => (Math.abs(x * 10 - Math.round(x * 10)) < 1e-9 && x > 0) ? cm(x) : null;
    const q = 'Une bande de papier mesure ' + L + ' cm de long. ' + plie + 'On la déplie : les marques de pli partagent la bande en parties égales. Combien mesure chaque partie' + QM;
    const expl = 'Chaque pliage en deux double le nombre de parties égales : on compte les parties, puis on partage la longueur. Parties : ' + doubl(k) + ', soit ' + N +
      ' parties. Chaque partie mesure ' + L + ' ÷ ' + N + ' = ' + u + ' cm.';
    return Q(q, cm(u), [
      [cmP(L / (2 * k)), 'c\'est diviser par 2 × ' + k + ' au lieu de diviser ' + mot(k) + ' fois par 2'],
      [cmP(L / k), 'c\'est diviser par le nombre de pliages'],
      [cmP(L / pw(k - 1)), 'c\'est oublier un des pliages'],
      [cmP(L / (N - 1)), 'c\'est diviser par le nombre de plis : il y a une partie de plus que de plis']
    ], j => cmP(u + (j % 2 ? (j + 1) / 2 : -j / 2)), expl);
  }
  const b = R.pick(['Une bande de papier', 'Un ruban de papier', 'Une longue bandelette de papier']);
  const q = b + ' est posé' + (b.startsWith('Un ') ? '' : 'e') + ' à plat. ' + plie.replace('On la plie', b.startsWith('Un ') ? 'On le plie' : 'On la plie') +
    'On ' + (b.startsWith('Un ') ? 'le' : 'la') + ' déplie. En combien de parties égales les marques de pli ' + (b.startsWith('Un ') ? 'le' : 'la') + ' partagent-elles' + QM;
  const expl = 'Chaque pliage en deux double le nombre de parties égales. Parties : ' + doubl(k) + ', soit ' + N + ' parties après ' + mot(k) + ' pliages.';
  return Q(q, e(N), [
    [e(N - 1), 'c\'est le nombre de plis : il y a toujours une partie de plus que de plis'],
    [e(2 * k), 'c\'est ajouter deux parties à chaque pliage au lieu de doubler'],
    [e(k + 1), 'c\'est compter un seul pli par pliage'],
    [e(2 * N), 'c\'est doubler une fois de trop']
  ], vois(N), expl);
}

function n1Trait(R){
  const c = R.pick(CTX_T);
  for (let t = 0; t < 400; t++){
    const o = R.pick([0, 2, 2, 4, 4, 6]);
    const cnt = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    for (let i = 0; i < o; i++) cnt[R.pick([1, 3, 3, 5])]++;
    cnt[2] = R.int(0, 4); cnt[4] = R.int(0, 3);
    const degs = [1, 2, 3, 4, 5].filter(d => cnt[d] > 0);
    const n = degs.reduce((s, d) => s + cnt[d], 0), sum = degs.reduce((s, d) => s + d * cnt[d], 0), mx = Math.max.apply(null, degs);
    if (cnt[2] + cnt[4] === 0 || n < 3 || sum > 24 || sum < 2 * (n - 1) || 2 * mx > sum) continue;
    const evens = [2, 4].filter(d => cnt[d] > 0), dX = R.pick(evens);
    if (cnt[dX] === n) continue;
    const parts = R.shuffle(degs).map(d => groupeDeg(c, cnt[d], d));
    const q = c.intro + ' compte en tout ' + n + ' ' + c.pts + ' où ' + c.g + ' : ' + listeFr(parts) + '. ' + c.act + QM;
    const C0 = 'Oui, en partant de n\'importe quel ' + c.pt;
    const C2 = 'Oui, mais seulement en partant d\'un ' + c.pt + ' où arrive un nombre impair de ' + c.trs;
    const CX = 'Oui, mais seulement en partant d\'un ' + c.pt + ' où arrivent ' + dX + ' ' + c.trs;
    const CN = 'Non, c\'est impossible';
    const bonne = o === 0 ? C0 : (o === 2 ? C2 : CN);
    const impairs = [1, 3, 5].filter(d => cnt[d] > 0).map(d => groupeDeg(c, cnt[d], d));
    let expl = 'On compte les ' + c.pts + ' où arrive un nombre impair de ' + c.trs + ' : un parcours d\'un seul trait n\'est possible que s\'il y en a 0 ou 2. En un ' + c.pt +
      ' de passage, on arrive puis on repart, donc les ' + c.trs + ' y vont par paires ; seuls le départ et l\'arrivée peuvent avoir un nombre impair de ' + c.trs + '. ';
    if (o === 0) expl += 'Ici, aucun ' + c.pt + ' n\'a un nombre impair de ' + c.trs + ' : c\'est possible en partant de n\'importe quel ' + c.pt + ', et on revient au point de départ. Piège : rien n\'oblige à partir d\'un ' + c.pt + ' particulier.';
    else if (o === 2) expl += 'Ici, il y en a exactement 2 (' + listeFr(impairs) + ') : c\'est possible, à condition de partir de l\'un des deux, et on finit à l\'autre. Piège : en partant d\'un ' + c.pt + ' où arrivent ' + dX + ' ' + c.trs + ', on resterait bloqué avant la fin.';
    else expl += 'Ici, il y en a ' + o + ' (' + listeFr(impairs) + ') : c\'est plus de 2, donc c\'est impossible ; il faudrait au moins ' + (o / 2) + ' parcours séparés. Piège : partir d\'un ' + c.pt + ' impair ne suffit pas quand il y en a plus de deux.';
    return {q, a: bonne, accept: null, choix: [C0, C2, CX, CN], expl};
  }
  return secours();
}

function n1Grille(R){
  const C = R.pick([4, 6, 8]), L = R.pick([4, 6, 8]), vert = R.int(0, 1) === 1;
  const c = R.int(1, C), r = R.int(1, L), p = [c, r];
  let img, txt, expl;
  if (vert){
    img = [C + 1 - c, r];
    txt = 'le long du trait vertical qui sépare les colonnes ' + LET[C / 2 - 1] + ' et ' + LET[C / 2] + ' (le milieu de la grille)';
    const d = c <= C / 2 ? C / 2 + 1 - c : c - C / 2, cote = c <= C / 2 ? ['à gauche', 'à droite'] : ['à droite', 'à gauche'];
    expl = 'Un pliage est une symétrie : la case et son image sont à la même distance du pli, de part et d\'autre, et un pli vertical ne change pas la ligne. La colonne ' + LET[c - 1] + ' est la ' + ordi(d) +
      ' colonne ' + cote[0] + ' du pli ; elle vient sur la ' + ordi(d) + ' colonne ' + cote[1] + ' du pli, la colonne ' + LET[img[0] - 1] + '. La ligne ' + r + ' ne change pas : la case ' + cs(c, r) + ' vient sur ' + cs(img[0], img[1]) + '.';
  } else {
    img = [c, L + 1 - r];
    txt = 'le long du trait horizontal qui sépare les lignes ' + (L / 2) + ' et ' + (L / 2 + 1) + ' (le milieu de la grille)';
    const d = r <= L / 2 ? L / 2 + 1 - r : r - L / 2, cote = r <= L / 2 ? ['au-dessus', 'au-dessous'] : ['au-dessous', 'au-dessus'];
    expl = 'Un pliage est une symétrie : la case et son image sont à la même distance du pli, de part et d\'autre, et un pli horizontal ne change pas la colonne. La ligne ' + r + ' est la ' + ordi(d) +
      ' ligne ' + cote[0] + ' du pli ; elle vient sur la ' + ordi(d) + ' ligne ' + cote[1] + ' du pli, la ligne ' + img[1] + '. La colonne ' + LET[c - 1] + ' ne change pas : la case ' + cs(c, r) + ' vient sur ' + cs(img[0], img[1]) + '.';
  }
  const q = introGrille(C, L) + 'On plie la feuille en deux ' + txt + '. Après ce pliage, quelle case se retrouve exactement superposée à la case ' + cs(c, r) + QM;
  const autre = vert ? [c, L + 1 - r] : [C + 1 - c, r];
  return Q(q, cs(img[0], img[1]), [
    [csP(demi(p, C, L), C, L), 'c\'est changer aussi la ' + (vert ? 'ligne' : 'colonne') + ', alors que ce pli ne la change pas'],
    [csP(autre, C, L), 'c\'est plier le long du trait ' + (vert ? 'horizontal' : 'vertical') + ' du milieu'],
    [csP(vert ? [img[0] + (c <= C / 2 ? -1 : 1), r] : [c, img[1] + (r <= L / 2 ? -1 : 1)], C, L), 'c\'est se tromper d\'une ' + (vert ? 'colonne' : 'ligne') + ' : la case et son image sont à la même distance du pli'],
    [csP(vert ? [(c + C / 2 - 1) % C + 1, r] : [c, (r + L / 2 - 1) % L + 1], C, L), 'c\'est faire glisser la moitié de la grille au lieu de la retourner']
  ], voisCase(img, C, L), expl, cs(c, r));
}

/* =====================================================  NIVEAU 2  ===================================================== */
const BANDE = [['une bande de papier', 'la'], ['un long ruban de papier', 'le'], ['une bandelette de papier calque', 'la'], ['une bande de papier kraft', 'la']];
function n2Plis(R){
  const k = R.int(2, 5), N = pw(k), b = R.pick(BANDE), v = R.int(0, 2);
  const deb = 'On plie ' + b[0] + ' en deux, ' + mot(k) + ' fois de suite, toujours dans le même sens (tous les plis sont parallèles), puis on ' + b[1] + ' déplie. ';
  if (v < 2){
    const q = deb + (v === 0 ? 'Combien de marques de pli voit-on' + QM : 'Combien de plis compte-t-on en tout' + QM);
    const expl = 'Chaque pliage double le nombre de parties, et les plis sont les frontières entre parties voisines : il y a toujours un pli de moins que de parties. Parties : ' + doubl(k) +
      ', soit ' + N + ' parties, donc ' + N + ' − 1 = ' + (N - 1) + ' plis. Autre façon : le 1er pliage fait 1 pli, le 2e en fait 2, le 3e en fait 4, et ainsi de suite ; ' +
      Array.from({length: k}, (x, i) => pw(i)).join(' + ') + ' = ' + (N - 1) + '.';
    return Q(q, e(N - 1), [
      [e(N), 'c\'est le nombre de parties : il y a une partie de plus que de plis'],
      [e(k), 'c\'est un pli par pliage, alors que chaque pliage plie toutes les épaisseurs à la fois'],
      [e(N / 2), 'c\'est seulement le nombre de plis faits au dernier pliage'],
      [e(2 * N - 1), 'c\'est doubler une fois de trop']
    ], vois(N - 1), expl);
  }
  const q = deb + 'On découpe ensuite la bande le long de toutes les marques de pli. Combien de morceaux obtient-on' + QM;
  const expl = 'Chaque pliage double le nombre de parties délimitées par les plis, et chaque partie devient un morceau. Parties : ' + doubl(k) + ', soit ' + N + ' morceaux (pour ' + (N - 1) + ' plis).';
  return Q(q, e(N), [
    [e(N - 1), 'c\'est le nombre de plis : il y a un morceau de plus que de coupes'],
    [e(N + 1), 'c\'est compter un morceau de trop'],
    [e(2 * k), 'c\'est ajouter deux morceaux par pliage au lieu de doubler'],
    [e(k + 1), 'c\'est compter un seul pli par pliage']
  ], vois(N), expl);
}

function n2Feuille(R){
  const k = R.int(2, 4), s = tirePlis(R, k, 'deux'), a = s.filter(f => axe(f) === 'V').length, b = k - a;
  const v = R.int(0, 2), deb = introPlis(k, s) + 'Puis on déplie la feuille. ';
  const colTxt = mot(a) + ' pliage' + (a > 1 ? 's' : '') + ' rabat' + (a > 1 ? 'tent' : '') + ' un bord gauche ou droit', ranTxt = mot(b) + ' pliage' + (b > 1 ? 's' : '') + ' rabat' + (b > 1 ? 'tent' : '') + ' un bord du haut ou du bas';
  if (v === 0){
    const q = deb + 'Les marques de pli partagent la feuille en petits rectangles identiques. Combien y en a-t-il' + QM;
    const expl = 'Les plis verticaux et les plis horizontaux découpent la feuille indépendamment : on compte les colonnes, puis les rangées, et on multiplie. Ici ' + colTxt + ', ce qui fait des plis verticaux et ' +
      pw(a) + ' colonnes ; ' + ranTxt + ', ce qui fait des plis horizontaux et ' + pw(b) + ' rangées. ' + pw(a) + ' × ' + pw(b) + ' = ' + pw(k) + ' petits rectangles (chaque pliage double le nombre de morceaux).';
    return Q(q, e(pw(k)), [
      [e(pw(a) + pw(b)), 'c\'est additionner les colonnes et les rangées au lieu de les multiplier'],
      [e(pw(a) - 1 + pw(b) - 1), 'c\'est le nombre de lignes de pli, pas le nombre de rectangles'],
      [e(2 * k), 'c\'est ajouter deux morceaux par pliage au lieu de doubler'],
      [e(pw(k + 1)), 'c\'est doubler une fois de trop']
    ], vois(pw(k)), expl);
  }
  if (v === 1){
    const ans = pw(a) - 1 + pw(b) - 1;
    const q = deb + 'Combien de lignes de pli (des traits droits qui traversent toute la feuille) voit-on' + QM;
    const expl = 'On compte séparément les plis verticaux et les plis horizontaux : dans chaque sens, il y a une ligne de pli de moins que de bandes. Ici ' + colTxt + ' : ' + pw(a) + ' colonnes, donc ' + (pw(a) - 1) +
      ' ligne' + (pw(a) - 1 > 1 ? 's' : '') + ' verticale' + (pw(a) - 1 > 1 ? 's' : '') + '. ' + cap(ranTxt) + ' : ' + pw(b) + ' rangées, donc ' + (pw(b) - 1) + ' ligne' + (pw(b) - 1 > 1 ? 's' : '') + ' horizontale' + (pw(b) - 1 > 1 ? 's' : '') +
      '. Total : ' + (pw(a) - 1) + ' + ' + (pw(b) - 1) + ' = ' + ans + '.';
    return Q(q, e(ans), [
      [e(pw(k) - 1), 'c\'est faire comme si tous les plis étaient parallèles'],
      [e(pw(k)), 'c\'est le nombre de petits rectangles'],
      [e((pw(a) - 1) * (pw(b) - 1)), 'c\'est multiplier les lignes des deux sens au lieu de les additionner'],
      [e(k), 'c\'est une ligne par pliage, alors que chaque pliage plie toutes les épaisseurs']
    ], vois(ans), expl);
  }
  const u = R.int(2, 8), w = R.int(2, 8), W = u * pw(a), H = w * pw(b);
  const dims = (x, y) => (x > 0 && y > 0) ? nb(x) + ' cm de large et ' + nb(y) + ' cm de haut' : null;
  const q = deb + 'La feuille mesure ' + W + ' cm de large et ' + H + ' cm de haut. Les marques de pli la partagent en petits rectangles identiques. Quelles sont leurs dimensions' + QM;
  const expl = 'Un pliage qui rabat un bord gauche ou droit coupe la largeur en deux ; un pliage qui rabat le haut ou le bas coupe la hauteur en deux. Ici ' + colTxt + ' : largeur ' + W + ' ÷ ' + pw(a) + ' = ' + u +
    ' cm. ' + cap(ranTxt) + ' : hauteur ' + H + ' ÷ ' + pw(b) + ' = ' + w + ' cm.';
  return Q(q, dims(u, w), [
    [dims(W / pw(b), H / pw(a)), 'c\'est confondre les deux sens : rabattre le bord gauche sur le bord droit partage la largeur'],
    [dims(W / pw(k), H / pw(k)), 'c\'est diviser les deux côtés à chaque pliage'],
    [dims(W / pw(a), H), 'c\'est oublier les plis horizontaux'],
    [dims(W, H / pw(b)), 'c\'est oublier les plis verticaux']
  ], j => dims(u + (j % 2 ? (j + 1) / 2 : 0), w + (j % 2 ? 0 : -j / 2)), expl);
}

const FIL = [['une ficelle', 'la ficelle'], ['un lacet', 'le lacet'], ['un fil de laine', 'le fil'], ['une corde', 'la corde'], ['un ruban', 'le ruban']];
function n2Ficelle(R){
  const k = R.int(1, 4), f = R.pick(FIL), N = pw(k), ans = N + 1;
  const q = 'On plie ' + f[0] + ' ' + enDeux(R, k) + '. On coupe le paquet obtenu d\'un seul coup de ciseaux, à un endroit qui n\'est pas un pli. Combien de morceaux obtient-on' + QM;
  const expl = 'On compte les brins du paquet, puis les points de coupe sur ' + f[1] + ' dépliée : un fil coupé en n endroits donne n + 1 morceaux. Le paquet a ' + doubl(k).split(' → ').pop() +
    ' brins ; le coup de ciseaux coupe chaque brin une fois, ce qui fait ' + N + ' points de coupe. ' + N + ' points de coupe donnent ' + N + ' + 1 = ' + ans + ' morceaux.';
  return Q(q, e(ans), [
    [e(N), 'c\'est oublier qu\'un fil coupé en ' + N + ' endroits donne un morceau de plus'],
    [e(2 * N), 'c\'est compter deux morceaux par brin coupé'],
    [e(2 * k + 1), 'c\'est ajouter deux brins par pliage au lieu de doubler'],
    [e(N - 1), 'c\'est compter un morceau de moins que de brins']
  ], vois(ans), expl);
}

function n2Euler(R){
  for (let t = 0; t < 400; t++){
    const n = R.int(5, 7), o = R.pick([0, 2, 2, 4]);
    const idx = R.shuffle(Array.from({length: n}, (x, i) => i)), deg = new Array(n);
    for (let i = 0; i < n; i++) deg[idx[i]] = i < o ? R.pick([1, 3, 3, 5]) : R.pick([2, 2, 4, 4, 6]);
    const sum = deg.reduce((s, x) => s + x, 0), mx = Math.max.apply(null, deg);
    if (sum > 24 || sum < 2 * (n - 1) || 2 * mx > sum) continue;
    const nom = i => LET[i], odd = [], even = [];
    deg.forEach((d, i) => (d % 2 ? odd : even).push(i));
    const parDeg = l => l.slice().sort((x, y) => deg[y] - deg[x] || x - y);
    const T = 'C\'est possible, quel que soit le point de départ';
    const P = (x, y) => 'C\'est possible, mais seulement en partant de ' + nom(Math.min(x, y)) + ' ou de ' + nom(Math.max(x, y));
    const S = z => 'C\'est possible, mais seulement en partant de ' + nom(z);
    const N = 'C\'est impossible';
    let bonne, autres, fin;
    const detail = l => listeFr(l.map(i => nom(i) + ' (' + deg[i] + ')'));
    if (o === 0){
      const top = parDeg(even); bonne = T; autres = [P(top[0], top[1]), S(top[0]), N];
      fin = 'Ici, aucun point n\'a un nombre impair de traits : on peut partir de n\'importe quel point, et on revient au point de départ. Piège : partir de ' + nom(top[0]) + ', qui a le plus de traits, n\'est pas obligatoire.';
    } else if (o === 2){
      const z = parDeg(even)[0]; bonne = P(odd[0], odd[1]); autres = [T, S(z), N];
      fin = 'Ici, seuls ' + detail(odd) + ' ont un nombre impair de traits : il faut partir de l\'un des deux, et on finit à l\'autre. Piège : en partant de ' + nom(z) + ', qui a un nombre pair de traits, on reste bloqué avant la fin.';
    } else {
      const top = parDeg(odd), z = parDeg(Array.from({length: n}, (x, i) => i))[0]; bonne = N; autres = [P(top[0], top[1]), T, S(z)];
      fin = 'Ici, ' + detail(parDeg(odd)) + ' ont un nombre impair de traits : c\'est plus de 2, donc c\'est impossible (il faudrait au moins 2 traits séparés). Piège : partir d\'un point impair ne suffit pas quand il y en a plus de deux.';
    }
    const q = 'Pour chaque point d\'un dessin d\'un seul tenant, on a compté les traits qui en partent :\n' + deg.map((d, i) => '- ' + nom(i) + ' : ' + d + ' trait' + (d > 1 ? 's' : '')).join('\n') +
      '\nOn veut reproduire ce dessin d\'un seul trait, sans lever le crayon et sans repasser sur un trait. Que peut-on dire' + QM;
    const expl = 'On repère les points d\'où part un nombre impair de traits : un tracé d\'un seul trait n\'est possible que s\'il y en a 0 ou 2. En un point de passage, on arrive puis on repart, donc les traits y vont par paires ; seuls le départ et l\'arrivée peuvent avoir un nombre impair de traits. ' + fin;
    return {q, a: bonne, accept: null, choix: [bonne].concat(autres), expl};
  }
  return secours();
}

const PRENOMS = [['Léa', 'elle'], ['Hugo', 'lui'], ['Inès', 'elle'], ['Malik', 'lui'], ['Chloé', 'elle'], ['Nathan', 'lui'], ['Sarah', 'elle'], ['Yanis', 'lui'], ['Emma', 'elle'], ['Lucas', 'lui']];
const hm = (h, m) => ((h % 12) === 0 ? 12 : h % 12) + ' h ' + (m < 10 ? '0' : '') + m;
function n2Miroir(R){
  const h = R.int(1, 11), m = 5 * R.int(1, 11), p = R.pick(PRENOMS);
  const tot = 720 - (60 * h + m), ans = hm(Math.floor(tot / 60), tot % 60);
  const q = p[0] + ' regarde dans un miroir l\'horloge à aiguilles accrochée au mur derrière ' + p[1] + '. Dans le miroir, les aiguilles semblent indiquer ' + hm(h, m) + '. Quelle heure est-il en réalité' + QM;
  const expl = 'Un miroir vertical échange la gauche et la droite du cadran : une aiguille qui paraît être à une certaine distance après le 12 est en réalité à la même distance avant le 12. L\'heure réelle et l\'heure vue dans le miroir ont donc pour somme 12 h. 12 h − ' +
    hm(h, m) + ' = ' + ans + '. Vérification : ' + hm(h, m) + ' + ' + ans + ' = 12 h.';
  return Q(q, ans, [
    [hm(12 - h, m), 'c\'est retourner la petite aiguille sans retourner la grande'],
    [hm(h, 60 - m), 'c\'est retourner la grande aiguille sans retourner la petite'],
    [hm(12 - h, 60 - m), 'c\'est retourner chaque aiguille séparément en oubliant que la petite aiguille avance entre deux heures'],
    [hm(11 - h, m), 'c\'est oublier de retourner les minutes']
  ], j => { const t = ((tot + (j % 2 ? 1 : -1) * 5 * Math.ceil(j / 2)) % 720 + 720) % 720; return hm(Math.floor(t / 60), t % 60); }, expl);
}

const NOMD = {N: 'le nord', E: 'l\'est', S: 'le sud', O: 'l\'ouest'};
const VECD = {N: [0, 1], E: [1, 0], S: [0, -1], O: [-1, 0]};
function n2Retour(R){
  const ctx = R.pick([['Sur un quadrillage, un robot part d\'une case et fait, dans l\'ordre : ', 'pas', 'Combien de pas lui faut-il, au minimum, pour revenir à sa case de départ, en se déplaçant seulement vers le nord, le sud, l\'est ou l\'ouest' + QM],
    ['Dans une ville aux rues quadrillées, un livreur part d\'un carrefour et parcourt, dans l\'ordre : ', 'rues', 'Combien de rues doit-il parcourir, au minimum, pour revenir à son point de départ' + QM],
    ['Sur un plateau quadrillé, on déplace un pion, dans l\'ordre, de : ', 'cases', 'Combien de cases, au minimum, le pion doit-il parcourir pour revenir à sa case de départ, en se déplaçant seulement vers le nord, le sud, l\'est ou l\'ouest' + QM]]);
  for (let t = 0; t < 300; t++){
    const nm = R.int(4, 5), mv = []; let prev = null;
    for (let i = 0; i < nm; i++){ const d = R.pick(['N', 'E', 'S', 'O'].filter(x => x !== prev)); mv.push([d, R.int(1, 9)]); prev = d; }
    let x = 0, y = 0, tot = 0;
    mv.forEach(m => { x += VECD[m[0]][0] * m[1]; y += VECD[m[0]][1] * m[1]; tot += m[1]; });
    const ans = Math.abs(x) + Math.abs(y);
    if (x === 0 || y === 0 || tot - ans < 4 || Math.abs(x) === Math.abs(y)) continue;
    const txt = mv.map((m, i) => m[1] + (i === 0 ? ' ' + ctx[1] : '') + ' vers ' + NOMD[m[0]]);
    const q = ctx[0] + listeFr(txt) + '. ' + ctx[2];
    const sN = mv.filter(m => m[0] === 'N').map(m => m[1]), sS = mv.filter(m => m[0] === 'S').map(m => m[1]);
    const sE = mv.filter(m => m[0] === 'E').map(m => m[1]), sO = mv.filter(m => m[0] === 'O').map(m => m[1]);
    const som = l => l.length ? l.reduce((s, v) => s + v, 0) : 0, ecr = l => l.length > 1 ? l.join(' + ') + ' = ' + som(l) : l.length ? String(l[0]) : '0 (aucun déplacement)';
    const expl = 'On fait le bilan dans chaque direction : nord moins sud, puis est moins ouest ; le plus court retour suit ces deux écarts. Nord : ' + ecr(sN) + ', sud : ' + ecr(sS) +
      ', donc un écart de ' + Math.abs(y) + ' vers ' + (y > 0 ? 'le nord' : 'le sud') + '. Est : ' + ecr(sE) + ', ouest : ' + ecr(sO) + ', donc un écart de ' + Math.abs(x) +
      ' vers ' + (x > 0 ? 'l\'est' : 'l\'ouest') + '. Retour minimal : ' + Math.abs(x) + ' + ' + Math.abs(y) + ' = ' + ans + '.';
    return Q(q, e(ans), [
      [e(tot), 'c\'est la longueur de tout le trajet déjà fait'],
      [e(Math.abs(x)), 'c\'est oublier l\'écart nord-sud'],
      [e(Math.abs(y)), 'c\'est oublier l\'écart est-ouest'],
      [e(Math.abs(Math.abs(x) - Math.abs(y))), 'c\'est soustraire les deux écarts au lieu de les additionner']
    ], vois(ans), expl);
  }
  return secours();
}

function n2Grille(R){
  const v = R.int(0, 2);
  if (v === 0){
    /* la dimension pliée vaut 6 ou 8 (avec 4, le seul trait possible hors des bords serait le milieu) ; aucune boucle de tirage */
    const vert = R.int(0, 1) === 1, C = vert ? R.pick([6, 8]) : R.pick([4, 6, 8]), L = vert ? R.pick([4, 6, 8]) : R.pick([6, 8]), T = vert ? C : L;
    let j = R.int(2, T - 3); if (j >= T / 2) j++;          // j parcourt 2 à T − 2 en sautant T / 2
    for (let t = 0; t < 100; t++){
      const c = R.int(1, C), r = R.int(1, L), x = vert ? c : r, ix = 2 * j + 1 - x;
      if (ix < 1 || ix > T) continue;
      const img = vert ? [ix, r] : [c, ix];
      const txt = vert ? 'le long du trait vertical qui sépare les colonnes ' + LET[j - 1] + ' et ' + LET[j] : 'le long du trait horizontal qui sépare les lignes ' + j + ' et ' + (j + 1);
      const d = x <= j ? j + 1 - x : x - j;
      const unite = vert ? 'colonne' : 'ligne', cote = vert ? (x <= j ? ['à gauche', 'à droite'] : ['à droite', 'à gauche']) : (x <= j ? ['au-dessus', 'au-dessous'] : ['au-dessous', 'au-dessus']);
      const q = introGrille(C, L) + 'On plie la feuille ' + txt + ' (ce n\'est pas le milieu de la grille). Après ce pliage, quelle case se retrouve exactement superposée à la case ' + cs(c, r) + QM;
      const expl = 'Un pliage est une symétrie : on compte de combien de ' + unite + 's la case est éloignée du pli, puis on reporte la même distance de l\'autre côté. ' + 'La ' + unite + ' ' + (vert ? LET[c - 1] : r) + ' est la ' + ordi(d) + ' ' + unite + ' ' + cote[0] +
        ' du pli ; son image est la ' + ordi(d) + ' ' + unite + ' ' + cote[1] + ' du pli, la ' + unite + ' ' + (vert ? LET[ix - 1] : ix) + '. La ' + (vert ? 'ligne' : 'colonne') + ' ne change pas : ' + cs(c, r) + ' vient sur ' + cs(img[0], img[1]) + '.';
      const milieu = vert ? [C + 1 - c, r] : [c, L + 1 - r];
      return Q(q, cs(img[0], img[1]), [
        [csP(milieu, C, L), 'c\'est plier au milieu de la grille, pas le long du trait indiqué'],
        [csP(vert ? [ix + (x <= j ? -1 : 1), r] : [c, ix + (x <= j ? -1 : 1)], C, L), 'c\'est se tromper d\'une ' + unite + ' : la case et son image sont à la même distance du pli'],
        [csP(vert ? [ix, L + 1 - r] : [C + 1 - c, ix], C, L), 'c\'est changer aussi la ' + (vert ? 'ligne' : 'colonne') + ', alors que ce pli ne la change pas']
      ], voisCase(img, C, L), expl, cs(c, r));
    }
    return secours();
  }
  if (v === 1){
    const n = R.int(5, 8), prin = R.int(0, 1) === 1;
    let c = R.int(1, n), r = R.int(1, n);
    const surDiag = () => prin ? c === r : c + r === n + 1;
    for (let g = 0; g < 40 && surDiag(); g++){ c = R.int(1, n); r = R.int(1, n); }
    if (surDiag()) c = c % n + 1;                           // repli déterministe : on décale la colonne d'un rang
    const img = prin ? [r, c] : [n + 1 - r, n + 1 - c];
    const q = introGrille(n, n) + 'On plie la feuille le long de la diagonale de la grille qui va du coin ' + (prin ? 'en haut à gauche au coin en bas à droite' : 'en haut à droite au coin en bas à gauche') +
      '. Après ce pliage, quelle case se retrouve exactement superposée à la case ' + cs(c, r) + QM;
    const expl = prin
      ? 'Le pli le long de cette diagonale échange les lignes et les colonnes : la case de la colonne numéro c et de la ligne r vient sur la case de la colonne numéro r et de la ligne c. ' + cs(c, r) + ' est dans la ' + ordi(c) + ' colonne et la ligne ' + r + ' ; elle vient dans la ' + ordi(r) + ' colonne (' + LET[r - 1] + ') et la ligne ' + c + ' : ' + cs(img[0], img[1]) + '.'
      : 'Le pli le long de cette diagonale échange « la ' + ordi(1) + ' colonne en partant de la gauche » et « la ' + ordi(1) + ' ligne en partant du bas », et ainsi de suite. ' + cs(c, r) + ' est dans la ' + ordi(c) + ' colonne en partant de la gauche et la ' + ordi(r) + ' ligne en partant du haut ; elle vient dans la ' + ordi(c) +
        ' ligne en partant du bas (la ligne ' + img[1] + ') et la ' + ordi(r) + ' colonne en partant de la droite (la colonne ' + LET[img[0] - 1] + ') : ' + cs(img[0], img[1]) + '.';
    return Q(q, cs(img[0], img[1]), [
      [csP(prin ? [n + 1 - r, n + 1 - c] : [r, c], n, n), 'c\'est plier le long de l\'autre diagonale'],
      [csP(demi([c, r], n, n), n, n), 'c\'est faire un demi-tour au lieu d\'un pliage'],
      [csP([n + 1 - c, r], n, n), 'c\'est plier le long du trait vertical du milieu'],
      [csP([c, n + 1 - r], n, n), 'c\'est plier le long du trait horizontal du milieu']
    ], voisCase(img, n, n), expl, cs(c, r));
  }
  const C = R.int(4, 7), L = R.int(4, 7);
  let c = R.int(1, C), r = R.int(1, L);
  if (2 * c === C + 1 && 2 * r === L + 1) c = c % C + 1;   // jamais la case centrale (elle ne bougerait pas) ; repli déterministe
  const img = demi([c, r], C, L);
  const q = introGrille(C, L) + 'Un jeton est posé sur la case ' + cs(c, r) + '. On fait faire un demi-tour à la feuille autour du centre de la grille ; le jeton tourne avec elle. Les noms des cases ne sont pas écrits sur la feuille : après le demi-tour, on nomme à nouveau les cases d\'après leur position, vue par une personne qui n\'a pas bougé (A1 est toujours la case en haut à gauche). Sur quelle case se trouve alors le jeton' + QM;
  const expl = 'Un demi-tour échange la gauche et la droite, et aussi le haut et le bas : la ' + ordi(c) + ' colonne en partant de la gauche devient la ' + ordi(c) + ' en partant de la droite, et la ' + ordi(r) + ' ligne en partant du haut devient la ' + ordi(r) +
    ' en partant du bas. Colonne : ' + C + ' + 1 − ' + c + ' = ' + img[0] + ' (' + LET[img[0] - 1] + ') ; ligne : ' + L + ' + 1 − ' + r + ' = ' + img[1] + '. Le jeton est en ' + cs(img[0], img[1]) + '.';
  return Q(q, cs(img[0], img[1]), [
    [csP([C + 1 - c, r], C, L), 'c\'est changer seulement la colonne : un demi-tour retourne aussi le haut et le bas'],
    [csP([c, L + 1 - r], C, L), 'c\'est changer seulement la ligne'],
    [C === L ? csP(rotH([c, r], C), C, L) : null, 'c\'est un quart de tour, pas un demi-tour'],
    [csP([C - c, L - r], C, L), 'c\'est se tromper d\'un rang en comptant depuis l\'autre bord']
  ], voisCase(img, C, L), expl, cs(c, r));
}

/* =====================================================  NIVEAU 3  ===================================================== */
function n3Encoche(R){
  const k = R.int(2, 4), s = tirePlis(R, k, null), N = pw(k), ans = N / 2;
  const q = introPlis(k, s) + 'Sur le bord du paquet formé par le dernier pli, loin des coins, on découpe un petit demi-disque. On déplie complètement la feuille. Combien de trous voit-on' + QM;
  const expl = 'Une découpe faite sur un pli se retrouve des deux côtés de ce pli : une fois le pli ouvert, les deux morceaux forment un seul trou. Après ' + mot(k) + ' pliages, le paquet a ' + N +
    ' épaisseurs ; le dernier pli les relie deux par deux, et chaque paire donne un disque entier (deux demi-disques collés). ' + N + ' ÷ 2 = ' + ans + ' trou' + (ans > 1 ? 's' : '') + '.';
  return Q(q, e(ans), [
    [e(N), 'c\'est compter un trou par épaisseur, alors que les deux demi-disques de part et d\'autre du pli forment un seul trou'],
    [e(N / 4), 'c\'est regrouper les épaisseurs par quatre, comme pour une découpe au coin de deux plis'],
    [e(k), 'c\'est compter un trou par pliage'],
    [e(N + 1), 'c\'est ajouter un trou au compte des épaisseurs']
  ], vois(ans), expl);
}

function n3Traits(R){
  for (let t = 0; t < 400; t++){
    const n = R.int(5, 6), cible = R.pick([0, 2, 4, 4, 6]), ed = new Set();
    const key = (a, b) => a < b ? a + ',' + b : b + ',' + a;
    const ord = R.shuffle(Array.from({length: n}, (x, i) => i));
    for (let i = 1; i < n; i++) ed.add(key(ord[i], ord[R.int(0, i - 1)]));
    const m = R.int(n + 1, Math.min(10, n * (n - 1) / 2));
    for (let g = 0; ed.size < m && g < 200; g++){ const a = R.int(0, n - 1), b = R.int(0, n - 1); if (a !== b) ed.add(key(a, b)); }
    const deg = new Array(n).fill(0), lst = [];
    ed.forEach(k => { const p = k.split(',').map(Number); deg[p[0]]++; deg[p[1]]++; lst.push(LET[p[0]] + LET[p[1]]); });
    const odd = deg.map((d, i) => i).filter(i => deg[i] % 2);
    if (odd.length !== cible || deg.some(d => d === 0)) continue;
    lst.sort();
    const o = odd.length, ans = Math.max(1, o / 2);
    const q = 'Une figure est formée exactement des segments suivants : ' + listeFr(lst) + '. On veut la dessiner sans passer deux fois sur un même segment ; on a le droit de lever le crayon. En combien de traits continus (chacun sans lever le crayon), au minimum, peut-on la dessiner' + QM;
    const expl = 'On compte, pour chaque point, le nombre de segments qui y arrivent : chaque trait continu a un début et une fin, et seuls ces bouts peuvent avoir un nombre impair de segments. ' +
      'Segments par point : ' + deg.map((d, i) => LET[i] + ' : ' + d).join(', ') + '. ' +
      (o === 0 ? 'Aucun point n\'a un nombre impair de segments : un seul trait suffit, qui revient à son point de départ.'
        : o === 2 ? 'Seuls ' + listeFr(odd.map(i => LET[i])) + ' ont un nombre impair de segments : un seul trait suffit, de l\'un à l\'autre.'
          : 'Les points ' + listeFr(odd.map(i => LET[i])) + ' ont un nombre impair de segments, soit ' + o + ' points. Chaque trait n\'a que 2 bouts, donc il faut au moins ' + o + ' ÷ 2 = ' + ans + ' traits, et on peut y arriver.');
    return Q(q, e(ans), [
      [o >= 2 ? e(o) : null, 'c\'est le nombre de points impairs ; chaque trait a deux bouts, donc on divise par 2'],
      [e(ans + 1), 'c\'est un trait de trop'],
      [ans !== 1 ? e(1) : e(2), ans !== 1 ? 'c\'est croire que la figure se dessine d\'un seul trait, alors qu\'elle a ' + o + ' points impairs' : 'c\'est oublier qu\'avec 0 ou 2 points impairs, un seul trait suffit'],
      [e(lst.length), 'c\'est compter un trait par segment']
    ], vois(ans), expl);
  }
  return secours();
}

function n3Grille(R){
  if (R.int(0, 2) > 0){
    const n = R.int(4, 6), horaire = R.int(0, 1) === 1;
    let c = R.int(1, n), r = R.int(1, n);
    if (2 * c === n + 1 && 2 * r === n + 1) c = c % n + 1;   // jamais la case centrale ; repli déterministe
    const p = [c, r], img = horaire ? rotH(p, n) : rotA(p, n), autre = horaire ? rotA(p, n) : rotH(p, n);
    const q = introGrille(n, n) + 'Un jeton est posé sur la case ' + cs(c, r) + '. On fait tourner la feuille d\'un quart de tour dans le sens ' + (horaire ? 'des aiguilles d\'une montre' : 'inverse des aiguilles d\'une montre') +
      ' autour du centre de la grille ; le jeton tourne avec elle. Les noms des cases ne sont pas écrits sur la feuille : après la rotation, on nomme à nouveau les cases d\'après leur position, vue par une personne qui n\'a pas bougé (A1 est toujours la case en haut à gauche). Sur quelle case se trouve alors le jeton' + QM;
    const expl = horaire
      ? 'Dans un quart de tour dans le sens des aiguilles d\'une montre, le haut part à droite et la gauche part en haut : la ligne de la case devient sa colonne comptée depuis la droite, et sa colonne devient sa ligne comptée depuis le haut. ' +
        cs(c, r) + ' est dans la ligne ' + r + ' : elle arrive dans la ' + ordi(r) + ' colonne en partant de la droite, la colonne ' + LET[img[0] - 1] + '. Elle est dans la ' + ordi(c) + ' colonne en partant de la gauche : elle arrive dans la ligne ' + c + '. Le jeton est en ' + cs(img[0], img[1]) + '.'
      : 'Dans un quart de tour dans le sens inverse des aiguilles d\'une montre, le haut part à gauche et la gauche part en bas : la ligne de la case devient sa colonne comptée depuis la gauche, et sa colonne devient sa ligne comptée depuis le bas. ' +
        cs(c, r) + ' est dans la ligne ' + r + ' : elle arrive dans la colonne ' + LET[img[0] - 1] + ' (la ' + ordi(r) + ' en partant de la gauche). Elle est dans la ' + ordi(c) + ' colonne en partant de la gauche : elle arrive dans la ' + ordi(c) + ' ligne en partant du bas, la ligne ' + img[1] + '. Le jeton est en ' + cs(img[0], img[1]) + '.';
    return Q(q, cs(img[0], img[1]), [
      [csP(autre, n, n), 'c\'est tourner dans l\'autre sens'],
      [csP(demi(p, n, n), n, n), 'c\'est un demi-tour, pas un quart de tour'],
      [csP([r, c], n, n), 'c\'est échanger la ligne et la colonne sans tenir compte du sens : c\'est un pliage le long d\'une diagonale, pas une rotation'],
      [csP([n + 1 - r, n + 1 - c], n, n), 'c\'est un pliage le long de l\'autre diagonale']
    ], voisCase(img, n, n), expl, cs(c, r));
  }
  const C = R.pick([4, 6, 8]), L = R.pick([4, 6, 8]);
  const c = R.int(1, C), r = R.int(1, L), p = [c, r], img = demi(p, C, L), m1 = [C + 1 - c, r], m2 = [c, L + 1 - r];
  const q = introGrille(C, L) + 'On plie la feuille en deux le long du trait vertical du milieu de la grille, puis on plie le paquet en deux le long du trait horizontal du milieu : les cases se retrouvent empilées par quatre. Quelle case est dans la même pile que la case ' + cs(c, r) + ', sans être ni dans la même ligne ni dans la même colonne qu\'elle' + QM;
  const expl = 'On suit les deux pliages l\'un après l\'autre : le pli vertical du milieu change la colonne c en ' + C + ' + 1 − c sans changer la ligne, et le pli horizontal du milieu change la ligne r en ' + L + ' + 1 − r sans changer la colonne. La pile de ' + cs(c, r) + ' contient donc ' +
    listeFr([cs(c, r), cs(m1[0], m1[1]), cs(m2[0], m2[1]), cs(img[0], img[1])]) + '. Seule ' + cs(img[0], img[1]) + ' n\'est ni dans la même ligne ni dans la même colonne que ' + cs(c, r) + '.';
  return Q(q, cs(img[0], img[1]), [
    [cs(m1[0], m1[1]), 'elle est bien dans la pile, mais dans la même ligne que ' + cs(c, r)],
    [csP([C - c, L - r], C, L), 'c\'est se tromper d\'un rang : la case et son image sont à la même distance de chaque pli'],
    [csP([C + 2 - c, L + 2 - r], C, L), 'c\'est se tromper d\'un rang dans l\'autre sens'],
    [cs(m2[0], m2[1]), 'elle est bien dans la pile, mais dans la même colonne que ' + cs(c, r)]
  ], voisCase(img, C, L), expl, cs(c, r));
}

const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]];
/* Diagonale d'un rectangle quadrillé : deux habillages. D = le nom du trait, J = un trait du quadrillage, X = un croisement. */
function ctxDiag(R, n, m){
  if (R.int(0, 1)) return {q: 'Sur une feuille quadrillée, on dessine un ' + (n === m ? 'carré de ' + n + ' carreaux de côté' : 'rectangle de ' + n + ' carreaux de large et ' + m + ' carreaux de haut') +
    ', puis on trace une de ses diagonales. Combien de carreaux la diagonale traverse-t-elle, en passant par leur intérieur' + QM, D: 'la diagonale', J: 'trait du quadrillage', Js: 'traits', X: 'croisement du quadrillage', Xs: 'croisements du quadrillage'};
  return {q: 'Un sol est carrelé de carreaux carrés identiques. On tend une ficelle bien droite entre deux coins opposés d\'un ' + (n === m ? 'carré de ' + n + ' carreaux de côté' : 'rectangle de ' + n + ' carreaux de large et ' + m + ' carreaux de haut') +
    ' formé de carreaux entiers. Au-dessus de combien de carreaux la ficelle passe-t-elle, en survolant leur intérieur' + QM, D: 'la ficelle', J: 'joint du carrelage', Js: 'joints', X: 'croisement de joints', Xs: 'croisements de joints'};
}
function n3Vol(R){
  const t = R.pick(TRIPLES), sw = R.int(0, 1) === 1, ax = sw ? t[1] : t[0], ay = sw ? t[0] : t[1];
  const sx = R.pick([1, -1]), sy = R.pick([1, -1]), ctx = R.pick([['Un drone part de sa base et enchaîne quatre vols en ligne droite : ', 'km', 'sa base', 'Il'], ['Un bateau quitte le port et enchaîne quatre trajets en ligne droite : ', 'km', 'le port', 'Il'], ['Dans un grand entrepôt, un robot part de sa borne de recharge et enchaîne quatre déplacements en ligne droite : ', 'm', 'sa borne', 'Il']]);
  const a1 = R.int(ay + 1, ay + 9), b1 = R.int(ax + 1, ax + 9);
  const dV = sy > 0 ? ['N', 'S'] : ['S', 'N'], dH = sx > 0 ? ['E', 'O'] : ['O', 'E'];
  const V = [[dV[0], a1], [dV[1], a1 - ay]], H = [[dH[0], b1], [dH[1], b1 - ax]];
  const mv = R.int(0, 1) ? [V[0], H[0], V[1], H[1]] : [H[0], V[0], H[1], V[1]];
  const tot = 2 * a1 - ay + 2 * b1 - ax, u = ctx[1];
  const q = ctx[0] + listeFr(mv.map(m => m[1] + ' ' + u + ' vers ' + NOMD[m[0]])) + ', dans cet ordre. À quelle distance de ' + ctx[2] + ' se trouve-t-' + ctx[3].toLowerCase() + ' alors, à vol d\'oiseau' + QM;
  const expl = 'On fait le bilan nord-sud et est-ouest, puis on applique le théorème de Pythagore au triangle rectangle formé par ces deux écarts. Nord-sud : ' + a1 + ' − ' + (a1 - ay) + ' = ' + ay + ' ' + u + ' vers ' + NOMD[dV[0]] +
    '. Est-ouest : ' + b1 + ' − ' + (b1 - ax) + ' = ' + ax + ' ' + u + ' vers ' + NOMD[dH[0]] + '. Distance : √(' + ax + '² + ' + ay + '²) = √(' + (ax * ax) + ' + ' + (ay * ay) + ') = √' + (t[2] * t[2]) + ' = ' + t[2] + ' ' + u + '.';
  const L = x => x > 0 ? e(x) + ' ' + u : null;
  return Q(q, L(t[2]), [
    [L(ax + ay), 'c\'est le chemin en suivant les directions nord-sud et est-ouest, pas la ligne droite'],
    [L(tot), 'c\'est la longueur de tout le trajet'],
    [L(t[2] * t[2]), 'c\'est oublier la racine carrée : ' + ax + '² + ' + ay + '² = ' + (t[2] * t[2]) + ' est le carré de la distance'],
    [L(Math.max(ax, ay)), 'c\'est le plus grand des deux écarts seulement']
  ], k => L(t[2] + (k % 2 ? (k + 1) / 2 : -k / 2)), expl);
}

function n3Diag(R){
  let m = R.int(2, 11), n = R.int(m + 1, 13);
  for (let g = 0; g < 40 && pgcd(m, n) !== 1; g++){ m = R.int(2, 11); n = R.int(m + 1, 13); }
  if (pgcd(m, n) !== 1) n = m + 1;                          // repli déterministe : deux entiers consécutifs sont premiers entre eux
  const ans = m + n - 1, c = ctxDiag(R, n, m);
  const expl = 'Chaque fois que ' + c.D + ' franchit un ' + c.J + ', elle entre dans un nouveau carreau : on compte les ' + c.Js + ' franchis, puis on ajoute le carreau de départ. Elle franchit les ' + (n - 1) + ' ' + c.Js + ' verticaux intérieurs et les ' + (m - 1) +
    ' ' + c.Js + ' horizontaux intérieurs. Comme ' + m + ' et ' + n + ' n\'ont aucun diviseur commun autre que 1, elle ne passe par aucun ' + c.X + ' : elle ne franchit jamais deux ' + c.Js + ' à la fois. Total : 1 + ' + (n - 1) + ' + ' + (m - 1) + ' = ' + ans + ' carreaux.';
  return Q(c.q, e(ans), [
    [e(m + n), 'c\'est ajouter la largeur et la hauteur : le carreau de départ est compté deux fois'],
    [e(m + n - 2), 'c\'est oublier le carreau de départ'],
    [e(n), 'c\'est croire que ' + c.D + ' traverse un seul carreau par colonne'],
    [e(m * n), 'c\'est le nombre total de carreaux du rectangle']
  ], vois(ans), expl);
}

function n3Ficelle(R){
  const f = R.pick(FIL), v = R.int(0, 3);
  let m, c, plie;
  if (v === 0){ const k = R.int(1, 3); m = pw(k); c = R.int(2, 3); plie = 'On plie ' + f[0] + ' ' + enDeux(R, k) + '.'; }
  else if (v === 1){ m = 3; c = R.int(1, 3); plie = 'On plie ' + f[0] + ' en trois, en accordéon (en forme de Z) : on obtient un paquet de trois brins de même longueur.'; }
  else if (v === 2){ m = 6; c = R.int(1, 2); plie = 'On plie ' + f[0] + ' en trois, en accordéon (en forme de Z), puis on plie le paquet obtenu en deux.'; }
  else { m = 4; c = R.int(1, 3); plie = 'On plie ' + f[0] + ' en quatre, en accordéon (en forme de W) : on obtient un paquet de quatre brins de même longueur.'; }
  const ans = c * m + 1;
  const q = plie + ' On donne ' + (c === 1 ? 'un coup' : mot(c) + ' coups') + ' de ciseaux dans le paquet, ' + (c === 1 ? 'à un endroit qui n\'est pas un pli' : 'à des endroits différents et jamais sur un pli') + '. Combien de morceaux obtient-on' + QM;
  const expl = 'On compte les points de coupe sur ' + f[1] + ' dépliée : chaque coup de ciseaux coupe chaque brin du paquet une fois, et un fil coupé en n endroits donne n + 1 morceaux. Le paquet a ' + m + ' brins' + (v === 2 ? ' (3 brins pliés en deux)' : '') + ', donc ' + c + ' coup' + (c > 1 ? 's' : '') + ' de ciseaux font ' + c + ' × ' + m + ' = ' + (c * m) +
    ' points de coupe. ' + (c * m) + ' points de coupe donnent ' + (c * m) + ' + 1 = ' + ans + ' morceaux.';
  return Q(q, e(ans), [
    [e(c * m), 'c\'est oublier le morceau en plus : un fil coupé en ' + (c * m) + ' endroits donne ' + ans + ' morceaux'],
    [e(c * m + c), 'c\'est ajouter un morceau par coup de ciseaux au lieu d\'un seul en tout'],
    [e((c + 1) * m), 'c\'est compter ' + (c + 1) + ' morceaux par brin'],
    [e(c + m), 'c\'est additionner les coups et les brins']
  ], vois(ans), expl);
}

/* Tracé fermé en escalier : colonnes [largeur, hauteur], posées côte à côte sur une même base. */
const VDIR = {D: [1, 0], H: [0, 1], G: [-1, 0], B: [0, -1]}, NDIR = {D: 'la droite', H: 'le haut', G: 'la gauche', B: 'le bas'};
const SYM = [[1, 0, 0, 1], [0, -1, 1, 0], [-1, 0, 0, -1], [0, 1, -1, 0], [-1, 0, 0, 1], [1, 0, 0, -1], [0, 1, 1, 0], [0, -1, -1, 0]];
function nomVec(v){ return Object.keys(VDIR).find(k => VDIR[k][0] === v[0] && VDIR[k][1] === v[1]); }
function traceEscalier(R, cols){
  const W = cols.reduce((s, c) => s + c[0], 0), mv = [['D', W]];
  const nc = cols.length; mv.push(['H', cols[nc - 1][1]]);
  for (let i = nc - 1; i >= 0; i--){
    mv.push(['G', cols[i][0]]);
    if (i > 0){ const dh = cols[i - 1][1] - cols[i][1]; mv.push([dh > 0 ? 'H' : 'B', Math.abs(dh)]); }
  }
  mv.push(['B', cols[0][1]]);
  const S = R.pick(SYM), inv = R.int(0, 1) === 1;
  let res = mv.map(m => { const v = VDIR[m[0]]; return [nomVec([S[0] * v[0] + S[1] * v[1], S[2] * v[0] + S[3] * v[1]]), m[1]]; });
  if (inv) res = res.reverse().map(m => [nomVec([-VDIR[m[0]][0], -VDIR[m[0]][1]]), m[1]]);
  const dec = R.int(0, res.length - 1);
  return res.slice(dec).concat(res.slice(0, dec));
}
function aireTrace(R, nc){
  for (let t = 0; t < 200; t++){
    const cols = []; for (let i = 0; i < nc; i++) cols.push([R.int(2, 6), R.int(2, 8)]);
    if (cols.some((c, i) => i > 0 && c[1] === cols[i - 1][1])) continue;
    const mv = traceEscalier(R, cols), W = cols.reduce((s, c) => s + c[0], 0), Hm = Math.max.apply(null, cols.map(c => c[1]));
    const aire = cols.reduce((s, c) => s + c[0] * c[1], 0), per = mv.reduce((s, m) => s + m[1], 0);
    if (aire > 99 || per === aire) continue;
    const q = 'Sur une feuille quadrillée, on part d\'un coin de carreau et on trace, en suivant les lignes du quadrillage : ' + listeFr(mv.map((m, i) => m[1] + (i === 0 ? (m[1] > 1 ? ' carreaux' : ' carreau') : '') + ' vers ' + NDIR[m[0]])) +
      '. On est alors revenu au point de départ. Quelle est l\'aire de la figure fermée ainsi dessinée, en nombre de carreaux' + QM;
    const expl = 'On dessine le tracé au brouillon, puis on découpe la figure en rectangles dont on additionne les aires. Ici la figure se découpe en ' + mot(nc) + ' rectangles accolés : ' +
      listeFr(cols.map(c => c[0] + ' × ' + c[1] + ' = ' + (c[0] * c[1]))) + '. Aire : ' + cols.map(c => c[0] * c[1]).join(' + ') + ' = ' + aire + ' carreaux.';
    const lo = cols.reduce((m, c) => Math.min(m, c[1]), 99), hautes = cols.filter(c => c[1] > lo);
    const dbl = nc === 2 ? W * lo + hautes[0][0] * hautes[0][1] : null;
    return Q(q, e(aire), [
      [e(W * Hm), 'c\'est l\'aire du rectangle qui entoure la figure, sans retirer ce qui manque'],
      [e(per), 'c\'est la longueur du tracé (le périmètre), pas l\'aire'],
      [dbl != null ? e(dbl) : null, 'c\'est compter deux fois le morceau commun aux deux rectangles']
    ], vois(aire), expl);
  }
  return secours();
}
const n3Aire = R => aireTrace(R, 2);

/* =====================================================  NIVEAU 4  ===================================================== */
function n4Coin(R){
  if (R.int(0, 2) > 0){
    const k = R.int(2, 4), s = tirePlis(R, k, 'fin'), N = pw(k), ans = N / 4, forme = R.pick(['petit carré', 'petit quart de disque']);
    const q = introPlis(k, s) + 'Au coin du paquet où se rejoignent les deux derniers plis, on découpe un ' + forme + '. On déplie complètement la feuille. Combien de trous voit-on' + QM;
    const expl = 'Une découpe faite au coin de deux plis se retrouve de part et d\'autre de chacun de ces deux plis : une fois dépliés, quatre morceaux se rejoignent pour former un seul trou. Après ' + mot(k) +
      ' pliages, le paquet a ' + N + ' épaisseurs ; les deux derniers plis les regroupent par quatre autour du coin. ' + N + ' ÷ 4 = ' + ans + ' trou' + (ans > 1 ? 's' : '') + (k === 2 ? ', au centre de la feuille.' : '.');
    return Q(q, e(ans), [
      [e(N), 'c\'est compter un trou par épaisseur'],
      [e(N / 2), 'c\'est ne regrouper les épaisseurs que deux par deux, comme pour une découpe sur un seul pli'],
      [e(0), 'c\'est croire qu\'une découpe au bord du paquet ne fait qu\'une encoche : ici, les deux bords du coin sont des plis'],
      [e(4), 'c\'est compter un trou par morceau découpé']
    ], vois(ans, 0), expl);
  }
  const k = R.int(2, 3), s = tirePlis(R, k, null), N = pw(k), ans = N + N / 2;
  const q = introPlis(k, s) + 'On perce un trou au milieu du paquet, loin des bords, puis on découpe un petit demi-disque sur le bord formé par le dernier pli, loin des coins. On déplie complètement la feuille. Combien de trous voit-on' + QM;
  const expl = 'On traite chaque découpe à part : un trou loin des bords est répété dans chaque épaisseur, mais un demi-disque sur un pli s\'assemble avec celui d\'en face pour faire un seul trou. Après ' + mot(k) + ' pliages, il y a ' + N +
    ' épaisseurs. Trou du milieu : ' + N + ' trous. Demi-disque sur le dernier pli : ' + N + ' ÷ 2 = ' + (N / 2) + ' trous. Total : ' + N + ' + ' + (N / 2) + ' = ' + ans + '.';
  return Q(q, e(ans), [
    [e(2 * N), 'c\'est compter ' + N + ' trous pour chaque découpe, sans voir que les demi-disques se recollent deux par deux'],
    [e(N + N / 4), 'c\'est regrouper les demi-disques par quatre au lieu de deux'],
    [e(N), 'c\'est oublier les trous faits par le demi-disque'],
    [e(N + 1), 'c\'est croire que le demi-disque ne fait qu\'un seul trou']
  ], vois(ans), expl);
}

function n4Diag(R){
  if (R.int(0, 6) === 0){
    const n = R.int(5, 20), c = ctxDiag(R, n, n);
    const expl = 'On compte les ' + c.Js + ' franchis par ' + c.D + ', sans oublier qu\'un passage par un ' + c.X + ' ne fait entrer que dans un seul nouveau carreau. La diagonale d\'un carré passe exactement par les ' + c.Xs + ', d\'un coin de carreau au coin opposé : elle traverse un carreau par colonne, en diagonale. Elle traverse donc ' + n + ' carreaux.';
    return Q(c.q, e(n), [
      [e(2 * n - 1), 'c\'est compter tous les ' + c.Js + ' franchis comme s\'ils l\'étaient un par un, alors que ' + c.D + ' passe par les ' + c.Xs],
      [e(2 * n), 'c\'est ajouter la largeur et la hauteur'],
      [e(n * n), 'c\'est le nombre total de carreaux'],
      [e(n - 1), 'c\'est oublier un carreau']
    ], vois(n), expl);
  }
  let g = R.int(2, 6), a = R.int(1, 6), b = R.int(a + 1, 7);
  for (let t = 0; t < 60 && (pgcd(a, b) !== 1 || g * b > 42); t++){ g = R.int(2, 6); a = R.int(1, 6); b = R.int(a + 1, 7); }
  if (pgcd(a, b) !== 1 || g * b > 42){ g = 2; a = 2; b = 3; }   // repli déterministe
  const m = g * a, n = g * b, ans = m + n - g, c = ctxDiag(R, n, m);
  const expl = 'On compte les ' + c.Js + ' franchis par ' + c.D + ', puis on retire les passages par un ' + c.X + ', où elle franchit deux ' + c.Js + ' à la fois mais n\'entre que dans un seul nouveau carreau. Le plus grand diviseur commun de ' + m + ' et ' + n + ' est ' + g +
    ' : ' + c.D + ' refait ' + g + ' fois le même motif, sur des rectangles de ' + b + ' × ' + a + ', et passe par ' + (g - 1) + ' ' + (g > 2 ? c.Xs : c.X) + ' intérieur' + (g > 2 ? 's' : '') + '. Total : 1 + ' + (n - 1) + ' + ' + (m - 1) + ' − ' + (g - 1) + ' = ' + ans + '. Autre façon : ' + g +
    ' blocs de ' + b + ' × ' + a + ', chacun traversé sur ' + b + ' + ' + a + ' − 1 = ' + (a + b - 1) + ' carreaux : ' + g + ' × ' + (a + b - 1) + ' = ' + ans + '.';
  return Q(c.q, e(ans), [
    [e(m + n - 1), 'c\'est oublier que ' + c.D + ' passe par ' + (g - 1) + ' ' + (g > 2 ? c.Xs : c.X)],
    [e(m + n), 'c\'est ajouter la largeur et la hauteur'],
    [e(m + n - g - 2), 'c\'est retirer aussi les deux coins du rectangle, qui ne sont pas des ' + c.Xs + ' intérieurs'],
    [e(n), 'c\'est croire que ' + c.D + ' traverse un seul carreau par colonne']
  ], vois(ans), expl);
}

function n4Quad(R){
  const m = R.int(1, 6), n = R.int(Math.max(m, 4 - m), 7);   // m + n ≥ 4 sans boucle de tirage
  const K = 2 * (m - 1) + 2 * (n - 1), ans = K / 2, sw = R.int(0, 1) === 1, larg = sw ? m : n, haut = sw ? n : m;
  const ctx = R.pick([
    'On veut dessiner un quadrillage de ' + larg + ' carreaux de large sur ' + haut + ' carreau' + (haut > 1 ? 'x' : '') + ' de haut (le contour et tous les traits intérieurs), sans passer deux fois sur un même segment ; on a le droit de lever le crayon. Combien de traits continus faut-il, au minimum' + QM,
    'On veut dessiner un quadrillage de ' + larg + ' carreaux de large sur ' + haut + ' carreau' + (haut > 1 ? 'x' : '') + ' de haut (le contour et tous les traits intérieurs), sans passer deux fois sur un même segment. Combien de fois, au minimum, faut-il poser la pointe du crayon sur la feuille pour commencer un trait' + QM,
    'Un artiste réalise en fil de fer un grillage en forme de quadrillage de ' + larg + ' carreaux de large sur ' + haut + ' carreau' + (haut > 1 ? 'x' : '') + ' de haut (le contour et tous les traits intérieurs). Chaque fil suit un chemin continu le long des traits, en tournant si besoin aux croisements, et deux fils ne passent jamais au même endroit. Combien de fils lui faut-il, au minimum' + QM
  ]);
  const expl = 'On compte les croisements où arrive un nombre impair de segments : un trait continu ne peut avoir de bout qu\'à ses deux extrémités, et il faut un bout en chacun de ces croisements. Les coins ont 2 segments et les croisements intérieurs en ont 4 ; les croisements des bords, hors coins, en ont 3. Il y en a 2 × ' + (larg - 1) + ' + 2 × ' + (haut - 1) + ' = ' + K +
    '. Chaque trait a 2 bouts, donc il en faut au moins ' + K + ' ÷ 2 = ' + ans + ', et on peut y arriver.';
  return Q(ctx, e(ans), [
    [e(K), 'c\'est le nombre de croisements impairs : chaque trait en relie deux, donc on divise par 2'],
    [e(ans + 1), 'c\'est un trait de trop'],
    [e(m * n), 'c\'est compter un trait par carreau'],
    [e(m + n), 'c\'est compter un trait par rangée et par colonne de carreaux']
  ], vois(ans), expl);
}

const D4 = ['N', 'E', 'S', 'O'], V4 = [[0, 1], [1, 0], [0, -1], [-1, 0]];
function n4Spirale(R){
  const d0 = R.int(0, 3), droite = R.int(0, 1) === 1, s = R.pick([1, 1, 2]), N = R.int(9, 26);
  const dir = (j, dr) => ((d0 + (dr ? j : -j)) % 4 + 4) % 4;
  const pos = (t, dr) => { let x = 0, y = 0; for (let j = 0; j < t; j++){ const v = V4[dir(j, dr)]; x += v[0] * s * (j + 1); y += v[1] * s * (j + 1); } return [x, y]; };
  const txt = p => {
    const ex = p[0] ? e(Math.abs(p[0])) + ' cm ' + (p[0] > 0 ? 'à l\'est' : 'à l\'ouest') : '', ny = p[1] ? e(Math.abs(p[1])) + ' cm ' + (p[1] > 0 ? 'au nord' : 'au sud') : '';
    return (ex && ny ? ex + ' et ' + ny : (ex || ny || 'au point')) + ' de O';
  };
  const cote = droite ? 'droite' : 'gauche', P = pos(N, droite);
  const q = 'Une fourmi part d\'un point O et marche ' + s + ' cm vers ' + NOMD[D4[d0]] + '. Puis elle tourne à ' + cote + ' et marche ' + (2 * s) + ' cm, puis elle tourne encore à ' + cote + ' et marche ' + (3 * s) +
    ' cm, et ainsi de suite : à chaque fois, elle tourne à ' + cote + ' et marche ' + s + ' cm de plus que la fois précédente. Elle s\'arrête à la fin du segment de ' + (N * s) + ' cm. Où se trouve-t-elle alors' + QM;
  const q4 = Math.floor(N / 4), r = N % 4, op = i => D4[(dir(i, droite) + 2) % 4];
  let expl = 'On regroupe les segments par paquets de quatre : dans chaque paquet, le 1er et le 3e segment sont de sens contraires, le 3e étant plus long de ' + (2 * s) + ' cm, et de même pour le 2e et le 4e. Chaque paquet complet déplace donc la fourmi de ' + (2 * s) + ' cm vers ' + NOMD[op(0)] +
    ' et de ' + (2 * s) + ' cm vers ' + NOMD[op(1)] + '. Ici ' + N + ' = 4 × ' + q4 + (r ? ' + ' + r : '') + ' : après ' + (4 * q4) + ' segments, elle est à ' + txt(pos(4 * q4, droite)) + '.';
  for (let j = 4 * q4; j < N; j++) expl += ' Le segment de ' + (s * (j + 1)) + ' cm vers ' + NOMD[D4[dir(j, droite)]] + ' l\'amène à ' + txt(pos(j + 1, droite)) + '.';
  if (!r) expl += ' Elle s\'arrête là.';
  return Q(q, txt(P), [
    [txt(pos(N, !droite)), 'c\'est tourner à ' + (droite ? 'gauche' : 'droite') + ' au lieu de tourner à ' + cote],
    [txt(pos(N - 1, droite)), 'c\'est s\'arrêter un segment trop tôt'],
    [txt(pos(N + 1, droite)), 'c\'est faire un segment de trop'],
    [txt([-P[0], -P[1]]), 'c\'est inverser les directions']
  ], j => txt([P[0] + (j % 2 ? s * Math.ceil(j / 2) : 0), P[1] + (j % 2 ? 0 : s * j / 2)]), expl);
}
const n4Aire = R => aireTrace(R, R.int(3, 4));

function n4Grille(R){
  const n = R.pick([4, 6]), horaire = R.int(0, 1) === 1, vert = R.int(0, 1) === 1;
  const rot = x => horaire ? rotH(x, n) : rotA(x, n), rotI = x => horaire ? rotA(x, n) : rotH(x, n);
  const pli = x => vert ? [n + 1 - x[0], x[1]] : [x[0], n + 1 - x[1]];
  /* rotation puis pliage = symétrie par rapport à une diagonale : on évite les cases de cette diagonale, qui reviendraient sur elles-mêmes */
  let c = R.int(1, n), r = R.int(1, n);
  const fixe = () => { const i = pli(rot([c, r])); return i[0] === c && i[1] === r; };
  for (let g = 0; g < 40 && fixe(); g++){ c = R.int(1, n); r = R.int(1, n); }
  if (fixe()) c = c % n + 1;                                // repli déterministe : la case voisine n'est pas sur la diagonale
  const p = [c, r], p1 = rot(p), img = pli(p1);
  const q = introGrille(n, n) + 'Un point est dessiné dans la case ' + cs(c, r) + '. On fait tourner la feuille d\'un quart de tour dans le sens ' + (horaire ? 'des aiguilles d\'une montre' : 'inverse des aiguilles d\'une montre') +
    ' autour du centre de la grille, puis on la plie en deux le long du trait ' + (vert ? 'vertical' : 'horizontal') + ' du milieu (' + (vert ? 'vertical' : 'horizontal') + ' pour une personne qui n\'a pas bougé). Les noms ne sont pas écrits sur la feuille : on nomme les cases d\'après leur position vue par cette personne (A1 reste la case en haut à gauche). Quelle case se retrouve exactement superposée à celle du point' + QM;
  const expl = 'On fait les deux étapes dans l\'ordre de l\'énoncé, en suivant la case du point. Le quart de tour ' + (horaire ? 'dans le sens des aiguilles d\'une montre envoie la ligne r dans la r-ième colonne en partant de la droite et la colonne c dans la ligne c' : 'dans le sens inverse envoie la ligne r dans la r-ième colonne en partant de la gauche et la c-ième colonne dans la c-ième ligne en partant du bas') +
    ' : ' + cs(c, r) + ' arrive en ' + cs(p1[0], p1[1]) + '. Le pli ' + (vert ? 'vertical du milieu change la colonne c en ' + n + ' + 1 − c' : 'horizontal du milieu change la ligne r en ' + n + ' + 1 − r') + ' : ' + cs(p1[0], p1[1]) + ' vient sur ' + cs(img[0], img[1]) + '.';
  return Q(q, cs(img[0], img[1]), [
    [cs(p1[0], p1[1]), 'c\'est oublier le pliage'],
    [cs(pli(p)[0], pli(p)[1]), 'c\'est oublier la rotation'],
    [cs(rot(pli(p))[0], rot(pli(p))[1]), 'c\'est faire les deux étapes dans le mauvais ordre'],
    [cs(pli(rotI(p))[0], pli(rotI(p))[1]), 'c\'est tourner dans le mauvais sens']
  ], voisCase(img, n, n), expl, cs(c, r));
}

/* =====================================================  NIVEAU 5  ===================================================== */
function n5Carres(R){
  const PQ = [[3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [4, 4], [4, 5], [4, 6], [4, 7], [5, 5], [5, 6], [5, 7], [6, 6]];
  const t = R.pick(PQ), p = t[0], qq = t[1], penche = R.int(0, 2) === 0;
  let tot = 0, droits = 0; const det = [];
  for (let s = 1; s < p; s++){ const pos = (p - s) * (qq - s); tot += s * pos; droits += pos; det.push([s, pos]); }
  const pen = tot - droits, unit = (p - 1) * (qq - 1), petitsP = (p - 2) * (qq - 2);
  const cx = R.pick([
    ['On a dessiné ' + (p * qq) + ' points en quadrillage régulier : ' + p + ' rangées de ' + qq + ' points, deux points voisins étant à 1 cm l\'un de l\'autre. ', 'ces points'],
    ['Sur une planche, ' + (p * qq) + ' clous sont plantés en quadrillage régulier : ' + p + ' rangées de ' + qq + ' clous, deux clous voisins étant à 1 cm l\'un de l\'autre. ', 'ces clous'],
    ['Une plaque de métal est percée de ' + (p * qq) + ' petits trous en quadrillage régulier : ' + p + ' rangées de ' + qq + ' trous, deux trous voisins étant à 1 cm l\'un de l\'autre. ', 'ces trous'],
    ['Sur un panneau en liège, ' + (p * qq) + ' punaises sont plantées en quadrillage régulier : ' + p + ' rangées de ' + qq + ' punaises, deux punaises voisines étant à 1 cm l\'une de l\'autre. ', 'ces punaises']
  ]), intro = cx[0];
  const qs = penche
    ? 'Combien de carrés penchés (dont les côtés ne sont pas parallèles aux bords) ont leurs quatre sommets parmi ' + cx[1] + QM
    : 'Combien de carrés ont leurs quatre sommets parmi ' + cx[1] + QM + ' Les carrés penchés comptent aussi.';
  const lignes = det.map(d => 'côté ' + d[0] + ' : ' + d[1] + ' position' + (d[1] > 1 ? 's' : '') + (penche ? ' × ' + (d[0] - 1) : ' × ' + d[0]));
  const expl = 'On range chaque carré dans le plus petit carré droit (à côtés parallèles aux bords) qui le contient : un carré droit de côté s contient exactement s carrés dont les sommets sont sur ses côtés, lui-même et ' +
    's − 1 carrés penchés. On compte donc les carrés droits de chaque taille, puis on multiplie par ' + (penche ? 's − 1' : 's') + '. Un carré droit de côté s se place de (' + (qq - 1) + ' − s + 1) × (' + (p - 1) + ' − s + 1) façons : ' +
    lignes.join(' ; ') + '. Total : ' + det.map(d => (penche ? (d[0] - 1) : d[0]) * d[1]).join(' + ') + ' = ' + (penche ? pen : tot) + '.';
  if (penche) return Q(intro + qs, e(pen), [
    [e(tot), 'c\'est compter aussi les carrés droits'],
    [e(petitsP), 'c\'est ne compter que les petits carrés penchés, dont le côté est la diagonale d\'un carreau'],
    [e(droits), 'c\'est le nombre de carrés droits']
  ], vois(pen), expl);
  return Q(intro + qs, e(tot), [
    [e(droits), 'c\'est oublier les carrés penchés'],
    [e(unit), 'c\'est ne compter que les petits carrés de côté 1'],
    [e(droits + petitsP), 'c\'est oublier les grands carrés penchés']
  ], vois(tot), expl);
}

function n5Creux(R){
  const n = R.int(3, 7), creux = pw(n - 1), bosses = pw(n - 1) - 1, tot = pw(n) - 1, sens = R.int(0, 1) === 1, demande = R.int(0, 1) === 1 ? 'creux' : 'bosses';
  const bd = R.pick(['une longue bande de papier', 'un long ruban de papier', 'une longue bande de papier calque', 'une longue bandelette de papier kraft']), le = bd.startsWith('un ') ? 'le' : 'la';
  const b1 = sens ? 'droit' : 'gauche', b2 = sens ? 'gauche' : 'droit', surf = R.pick(['sur une table', 'sur un bureau', 'sur un comptoir']);
  const q = 'On pose ' + bd + ' bien à plat ' + surf + '. On soulève son bout ' + b1 + ' et on le pose sur son bout ' + b2 + ', puis on aplatit : ' + le + ' voilà plié' + (le === 'la' ? 'e' : '') + ' en deux. On recommence avec le paquet obtenu, exactement de la même façon (bout ' + b1 + ' posé sur le bout ' + b2 + '), jusqu\'à avoir plié ' + mot(n) +
    ' fois en tout. Puis on déplie entièrement et on ' + le + ' repose à plat comme au départ, sans ' + le + ' retourner. Chaque pli forme soit un creux (en forme de V), soit une bosse (en forme de V à l\'envers). Combien de plis forment ' + (demande === 'creux' ? 'un creux' : 'une bosse') + QM;
  const parPli = Array.from({length: n}, (x, j) => j === 0 ? [1, 0] : [pw(j - 1), pw(j - 1)]);
  const expl = 'On suit, pliage après pliage, les épaisseurs à l\'endroit et les épaisseurs retournées : un pli fait dans une épaisseur à l\'endroit est un creux, un pli fait dans une épaisseur retournée devient une bosse quand on remet la bande à l\'endroit. ' +
    'Le 1er pliage fait 1 pli, un creux, et retourne une moitié de la bande. Ensuite, le paquet a toujours autant d\'épaisseurs à l\'endroit que d\'épaisseurs retournées : le pliage numéro j fait 2 puissance (j − 1) plis, moitié creux, moitié bosses. ' +
    'Creux : ' + parPli.map(x => x[0]).join(' + ') + ' = ' + creux + ' ; bosses : ' + parPli.map(x => x[1]).join(' + ') + ' = ' + bosses + ' ; en tout ' + tot + ' plis.';
  const ans = demande === 'creux' ? creux : bosses;
  return Q(q, e(ans), [
    [e(demande === 'creux' ? bosses : creux), 'c\'est le nombre de ' + (demande === 'creux' ? 'bosses' : 'creux')],
    [e(tot), 'c\'est le nombre total de plis'],
    [e(pw(n - 2)), 'c\'est ne compter que les ' + demande + (demande === 'creux' ? ' faits' : ' faites') + ' au dernier pliage'],
    [e(n), 'c\'est compter un pli par pliage']
  ], vois(ans), expl);
}

/* Parcours minimal d'un grillage m × n (postier chinois) : appariement minimal des nœuds impairs (programmation dynamique sur les sous-ensembles). */
const PARC = {};
function parcours(m, n){
  const cle = m + ',' + n;
  if (PARC[cle]) return PARC[cle];
  const odd = [];
  for (let y = 0; y <= m; y++) for (let x = 0; x <= n; x++){
    const d = (x > 0) + (x < n) + (y > 0) + (y < m);
    if (d % 2) odd.push([x, y]);
  }
  const K = odd.length, dist = (i, j) => Math.abs(odd[i][0] - odd[j][0]) + Math.abs(odd[i][1] - odd[j][1]);
  const memo = new Map();
  function f(mask){
    if (mask === 0) return [0, []];
    if (memo.has(mask)) return memo.get(mask);
    let i = 0; while (!(mask & (1 << i))) i++;
    let best = [Infinity, []];
    for (let j = i + 1; j < K; j++) if (mask & (1 << j)){
      const r = f(mask & ~(1 << i) & ~(1 << j)), c = r[0] + dist(i, j);
      if (c < best[0]) best = [c, [[i, j]].concat(r[1])];
    }
    memo.set(mask, best); return best;
  }
  const full = (1 << K) - 1, ferme = f(full);
  let ouvert = [Infinity, [], null];
  for (let i = 0; i < K; i++) for (let j = i + 1; j < K; j++){
    const r = f(full & ~(1 << i) & ~(1 << j));
    if (r[0] < ouvert[0]) ouvert = [r[0], r[1], [i, j]];
  }
  const E = m * (n + 1) + n * (m + 1);
  return (PARC[cle] = {E, K, odd, dist, ferme, ouvert});
}
function n5Parcours(R){
  const S = [[1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 2], [2, 3], [2, 4], [2, 5], [3, 3], [1, 2]];
  const t = R.pick(S), ferme = (t[0] === 1 && t[1] === 2) ? true : R.int(0, 1) === 1;   // 2 × 1 ouvert : rien à repasser, réponse = longueur du grillage (exclu)
  const m = t[0], n = t[1], u = R.pick([1, 1, 2, 5]), P = parcours(m, n), sol = ferme ? P.ferme : P.ouvert, ans = P.E + sol[0], autre = P.E + (ferme ? P.ouvert[0] : P.ferme[0]);
  const mob = R.pick([['Une fourmi', 'elle'], ['Un robot de nettoyage', 'il'], ['Un escargot', 'il']]);
  const pt = i => '(' + P.odd[i][0] + ' ; ' + P.odd[i][1] + ')', L = x => e(u * x) + ' m';
  const q = 'Un grillage a la forme d\'un quadrillage de ' + n + ' carreaux de large sur ' + m + ' carreau' + (m > 1 ? 'x' : '') + ' de haut (le contour et tous les traits intérieurs) ; chaque côté de carreau mesure ' + u + ' m. ' + mob[0] + ' veut parcourir tous les segments du grillage, chacun au moins une fois. ' +
    cap(mob[1]) + ' a le droit de repasser sur un segment' + (ferme ? ', mais ' + mob[1] + ' doit revenir à son point de départ.' : ', et ' + mob[1] + ' choisit librement son point de départ et son point d\'arrivée.') + ' Quelle est la longueur minimale de son trajet' + QM;
  const paires = sol[1].map(pr => 'entre ' + pt(pr[0]) + ' et ' + pt(pr[1]) + ' (' + L(P.dist(pr[0], pr[1])) + ')');
  const expl = 'On repère les croisements où arrivent 3 segments, puis on les relie deux à deux par des segments parcourus deux fois' + (ferme ? '' : ', sauf deux croisements qui servent de départ et d\'arrivée') + ', en cherchant les liaisons les plus courtes. ' +
    'En effet, à chaque passage, on arrive par un segment et on repart par un autre : en un croisement qui n\'est ni le départ ni l\'arrivée, le nombre de passages sur ses segments doit être pair. ' +
    'Repérons les croisements par (x ; y), de (0 ; 0) en bas à gauche à (' + n + ' ; ' + m + ') en haut à droite. Le grillage compte ' + P.E + ' segments de ' + u + ' m, soit ' + L(P.E) + '. Les croisements à 3 segments sont ceux des bords, hors coins : ' + listeFr(P.odd.map((x, i) => pt(i))) + ', soit ' + P.K + '. ' +
    (ferme ? '' : 'On part de ' + pt(sol[2][0]) + ' et on arrive en ' + pt(sol[2][1]) + '. ') + (sol[1].length ? 'On repasse ' + listeFr(paires) + ', soit ' + L(sol[0]) + ' de plus. ' : 'Il n\'y a rien à repasser. ') +
    'Longueur minimale : ' + L(P.E) + ' + ' + L(sol[0]) + ' = ' + L(ans) + '.';
  const naif = P.E + (ferme ? P.K / 2 : (P.K - 2) / 2);
  return Q(q, L(ans), [
    [L(P.E), 'c\'est la longueur du grillage : on ne peut pas le parcourir sans repasser, car il a ' + P.K + ' croisements où arrivent 3 segments'],
    [L(autre), ferme ? 'c\'est la longueur d\'un trajet qui ne revient pas au départ' : 'c\'est la longueur d\'un trajet qui revient au départ'],
    [L(naif), 'c\'est supposer que chaque liaison entre deux croisements à 3 segments ne mesure qu\'un seul segment'],
    [L(P.E + P.K), 'c\'est repasser un segment par croisement à 3 segments']
  ], k => e(u * ans + (k % 2 ? (k + 1) / 2 : -k / 2)) + ' m', expl);
}

function n5Trous(R){
  const k = R.int(3, 5), s = tirePlis(R, k, 'fin'), N = pw(k);
  const types = R.pick([['M', 'E'], ['M', 'C'], ['E', 'C'], ['M', 'E', 'C'], ['M', 'E', 'C']]);
  const TXT = {M: 'on perce un trou au milieu, loin des bords', E: 'on découpe un petit demi-disque sur le bord formé par le dernier pli, loin des coins', C: 'on découpe un petit carré au coin où se rejoignent les deux derniers plis'};
  const VAL = {M: N, E: N / 2, C: N / 4}, NOM = {M: 'trou du milieu', E: 'demi-disque sur le dernier pli', C: 'carré au coin des deux derniers plis'};
  const ans = types.reduce((t, x) => t + VAL[x], 0);
  const q = introPlis(k, s) + 'Puis, dans le paquet :\n' + types.map((x, i) => '- ' + TXT[x] + (i === types.length - 1 ? '.' : ' ;')).join('\n') + '\nOn déplie complètement la feuille. Combien de trous voit-on' + QM;
  const expl = 'Une découpe se répète dans chaque épaisseur, puis on regarde combien de morceaux se recollent pour former un même trou : 1 au milieu, 2 sur un pli, 4 au coin de deux plis. Après ' + mot(k) + ' pliages, il y a ' + N + ' épaisseurs. ' +
    types.map(x => cap(NOM[x]) + ' : ' + (x === 'M' ? N + ' trous' : N + ' ÷ ' + (x === 'E' ? 2 : 4) + ' = ' + VAL[x] + ' trous')).join('. ') + '. Total : ' + types.map(x => VAL[x]).join(' + ') + ' = ' + ans + '.';
  const sansRecol = types.length * N;
  const coinComme = types.reduce((t, x) => t + (x === 'C' ? N / 2 : VAL[x]), 0);
  const demiEntier = types.reduce((t, x) => t + (x === 'E' ? N : VAL[x]), 0);
  return Q(q, e(ans), [
    [e(sansRecol), 'c\'est compter un trou par épaisseur pour chaque découpe, sans voir que les morceaux se recollent'],
    [types.indexOf('C') >= 0 ? e(coinComme) : null, 'c\'est traiter le coin de deux plis comme un simple pli'],
    [types.indexOf('E') >= 0 ? e(demiEntier) : null, 'c\'est oublier que les demi-disques se recollent deux par deux'],
    [e(ans + N / 4), 'c\'est compter un groupe de trous de trop']
  ], vois(ans), expl);
}

/* ---------- repli (jamais d'exception) ---------- */
function secours(){
  return {q: 'On plie une feuille de papier en deux, trois fois de suite. Avec une perforatrice, on fait un trou qui traverse toutes les épaisseurs, loin des bords et des plis. On déplie la feuille. Combien de trous compte-t-elle' + QM,
    a: '8', accept: null, choix: ['8', '6', '3', '16'],
    expl: 'Chaque pliage en deux double le nombre d\'épaisseurs, et un trou fait dans le paquet traverse toutes les épaisseurs. Épaisseurs : 1 → 2 → 4 → 8. Le trou devient donc 8 trous. Piège : 6, c\'est ajouter deux épaisseurs à chaque pliage au lieu de les doubler.'};
}

const GEN = {
  1: [n1Trous, n1Epaisseur, n1Bande, n1Trait, n1Grille],
  2: [n2Plis, n2Feuille, n2Ficelle, n2Euler, n2Miroir, n2Retour, n2Grille],
  3: [n3Encoche, n3Traits, n3Grille, n3Vol, n3Diag, n3Ficelle, n3Aire],
  4: [n4Coin, n4Diag, n4Quad, n4Spirale, n4Aire, n4Grille],
  5: [n5Carres, n5Creux, n5Parcours, n5Trous]
};

A.push({
  id: 'alb-29-visuel-2d',
  phase: 'albert',
  ordre: 29,
  theme: 'geometrie',
  titre: 'Visuel 2D décrit en texte : pliages, tracés, grilles',
  objectif: 'Se représenter une figure décrite seulement par des mots (feuille pliée et découpée, bande ou ficelle pliée, dessin d\'un seul trait, grille pliée ou tournée, trajet sur un quadrillage) et compter juste sans calculatrice, en comptant les épaisseurs, les points impairs ou les cases.',
  lecon:
`<p class="lede">Au test, il n'y a pas de dessin : la figure est <mark>décrite par des mots</mark>. On plie une feuille et on la perce, on plie une bande et on compte ses plis, on veut tracer un dessin sans lever le crayon, on plie ou on fait tourner une grille de cases, on suit un trajet sur un quadrillage. Le calcul est toujours petit ; ce qui compte, c'est de traduire la description en un comptage sûr.</p>
<h3>Ce que le test demande</h3>
<p>Ces questions sont assez rares, mais elles se réussissent en une ou deux minutes si l'on connaît trois ou quatre réflexes. On te demande un nombre de trous, de plis, de morceaux, de traits, une case d'arrivée, une distance ou une aire. Plus on monte en niveau, plus il faut voir ce qui <strong>se recolle</strong> (une découpe sur un pli) ou ce qui <strong>se compense</strong> (des déplacements opposés).</p>
<h3>Les prérequis</h3>
<p>Un pliage est une <strong>symétrie</strong> : le pli est l'axe, et un point et son image sont à la même distance du pli. Les puissances de 2 doivent venir toutes seules :</p>
<table class="tbl"><tr><th>pliages</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr>
<tr><td>épaisseurs (2<sup>k</sup>)</td><td>2</td><td>4</td><td>8</td><td>16</td><td>32</td><td>64</td></tr>
<tr><td>plis d'une bande (2<sup>k</sup> − 1)</td><td>1</td><td>3</td><td>7</td><td>15</td><td>31</td><td>63</td></tr></table>
<p>Dans un dessin, on regarde chaque point où des traits se rejoignent et on compte combien de traits y arrivent. Un point est <strong>impair</strong> s'il en arrive 1, 3, 5…</p>
<h3>La méthode</h3>
<div class="etapes">
<p><strong>1. Je fais un petit schéma.</strong> Une feuille de brouillon pliée pour de vrai, ou trois traits, suffisent souvent à voir la situation.</p>
<p><strong>2. Pliages : je compte les épaisseurs.</strong> Chaque pli les double. Un trou loin des bords traverse toutes les épaisseurs.</p>
<p><strong>3. Je repère ce qui se recolle.</strong> Une découpe sur un pli s'assemble avec celle d'en face (2 morceaux pour 1 trou) ; au coin de deux plis, 4 morceaux font 1 trou.</p>
<p><strong>4. Tracés : je compte les points impairs.</strong> D'un seul trait si et seulement s'il y en a 0 ou 2 ; sinon il faut (nombre de points impairs) ÷ 2 traits.</p>
<p><strong>5. Grilles et trajets : je travaille avec des numéros.</strong> Colonne et ligne pour une case, bilan nord-sud et est-ouest pour un trajet.</p>
</div>
<h3>Exemples résolus</h3>
<p><strong>Exemple 1.</strong> Une feuille est pliée en deux trois fois, puis percée d'un trou loin des bords. Épaisseurs : 2, 4, 8. La feuille dépliée a 8 trous.</p>
<p><strong>Exemple 2.</strong> Une bande est pliée en deux quatre fois dans le même sens, puis dépliée. Elle est partagée en 16 parties, et les plis sont les frontières entre parties : 16 − 1 = 15 plis. Une ficelle pliée de la même façon puis coupée d'un coup de ciseaux est coupée en 16 endroits : 16 + 1 = 17 morceaux.</p>
<p><strong>Exemple 3.</strong> Dans un dessin, il part 3 traits de A, 2 de B, 4 de C, 3 de D et 2 de E. Seuls A et D sont impairs : on peut le tracer d'un seul trait, à condition de partir de A ou de D. S'il y avait 4 points impairs, il faudrait 2 traits.</p>
<p><strong>Exemple 4 (niveau du test).</strong> On plie une feuille trois fois en deux, puis on découpe un demi-disque sur le bord formé par le dernier pli. Le paquet a 8 épaisseurs, que le dernier pli relie deux par deux : chaque paire donne un seul disque. Il y a 8 ÷ 2 = 4 trous. Au coin de deux plis, on diviserait par 4.</p>
<p><strong>Exemple 5.</strong> La diagonale d'un rectangle de 10 carreaux sur 6 franchit 9 traits verticaux et 5 horizontaux, et entre à chaque fois dans un nouveau carreau, sauf aux croisements du quadrillage où elle franchit deux traits d'un coup. pgcd(10, 6) = 2, donc elle passe par 1 croisement : 1 + 9 + 5 − 1 = 14 carreaux.</p>
<h3>Les réflexes sans calculatrice</h3>
<p>Fil ou bande coupés : n points de coupe donnent n + 1 morceaux ; le nombre de points de coupe vaut (nombre de brins) × (nombre de coups de ciseaux).</p>
<p>Grille pliée au milieu : dans une grille de C colonnes, la colonne c vient sur la colonne C + 1 − c ; la ligne ne bouge pas. Un quart de tour échange lignes et colonnes ; un demi-tour retourne les deux.</p>
<p>Trajet : fais le bilan nord moins sud et est moins ouest. Retour par le quadrillage : on additionne les deux écarts ; à vol d'oiseau : Pythagore (3, 4, 5 ; 6, 8, 10 ; 5, 12, 13).</p>
<p>Horloge dans un miroir : l'heure vue et l'heure réelle font 12 h à elles deux.</p>
<p>Aire d'un tracé fermé : dessine-le, puis découpe-le en rectangles.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Traduis la description en un comptage : épaisseurs (×2 par pli) et morceaux qui se recollent pour un pliage, points impairs pour un tracé, numéros de colonne et de ligne pour une grille.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Ajouter 2 à chaque pli au lieu de doubler. Confondre le nombre de plis et le nombre de parties (il y a une partie de plus). Oublier qu'une découpe sur un pli ne fait qu'un trou pour deux épaisseurs. Croire qu'on peut tracer d'un seul trait en partant du point « le plus chargé » : seuls comptent les points impairs. Se tromper d'une case en reportant une distance de l'autre côté d'un pli.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>k pliages en deux : 2<sup>k</sup> épaisseurs, 2<sup>k</sup> − 1 plis sur une bande, 2<sup>k</sup> + 1 morceaux pour une ficelle coupée une fois. Découpe sur un pli : ÷ 2 ; au coin de deux plis : ÷ 4. Un seul trait : 0 ou 2 points impairs ; sinon (points impairs) ÷ 2 traits. Diagonale d'un rectangle de m sur n carreaux : m + n − pgcd(m, n) carreaux.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      for (let essai = 0; essai < 6; essai++){
        const ex = R.pick(GEN[n])(R);
        if (ex && typeof ex.q === 'string' && typeof ex.a === 'string' && Array.isArray(ex.choix) && ex.choix.length === 4) return ex;
      }
    } catch(err){ /* repli ci-dessous */ }
    return secours();
  }
});

})();
