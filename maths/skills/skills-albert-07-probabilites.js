/* ===== Maths · Objectif Albert School : alb-07 · Probabilités simples (cartes, dés, urnes, informations inutiles) =====
   Script classique dans une IIFE : aucun symbole de premier niveau. Pousse UN objet dans window.ALBERT_SKILLS.
   gen(level, R) rend un QCM à 4 choix (fractions irréductibles), accept: null. Niveaux 1 à 5, niveau inconnu borné.
   Toutes les réponses sont CALCULÉES en fractions exactes (numérateur et dénominateur entiers), jamais en flottants. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (recopiées de la compétence de référence) ---------- */
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

/* ---------- fractions exactes ---------- */
function pgcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a || 1; }
function Q(n, d){ if (d < 0){ n = -n; d = -d; } const g = pgcd(n, d); return {n: n / g, d: d / g}; }
const UN = {n: 1, d: 1};
const mul = (x, y) => Q(x.n * y.n, x.d * y.d);
const add = (x, y) => Q(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => Q(x.n * y.d - y.n * x.d, x.d * y.d);
const dvd = (x, y) => Q(x.n * y.d, x.d * y.n);
const egal = (x, y) => x.n === y.n && x.d === y.d;
const fs = x => x.d === 1 ? nb(x.n) : nb(x.n) + '/' + nb(x.d);            // fraction irréductible
const f0 = (n, d) => nb(n) + '/' + nb(d);                                   // fraction telle quelle
const fq = (n, d) => { const r = Q(n, d); return (r.n === n && r.d === d) ? f0(n, d) : f0(n, d) + ' = ' + fs(r); };
const fx = x => fs(x);

/* Assemble la question : bonne réponse, distracteurs (erreurs typiques), puis voisins de même dénominateur. */
function fin(o){
  const bonne = fs(o.rep);
  const ok = x => x && x.d > 0 && x.d < 1000 && x.n > 0 && x.n < x.d;
  const autres = (o.dis || []).filter(ok).map(fs);
  let D = o.D || o.rep.d;
  D = D / pgcd(D, o.rep.d) * o.rep.d;
  while (D < 12) D *= 2;
  const N0 = o.rep.n * D / o.rep.d;
  const voisin = k => { const j = Math.ceil(k / 2), v = N0 + (k % 2 ? j : -j); return (v > 0 && v < D) ? fs(Q(v, D)) : null; };
  return {q: o.q, a: bonne, accept: null, choix: qcm(bonne, autres, voisin), expl: o.expl.replace(/\s+$/, '')};
}

/* ---------- petits outils ---------- */
const SUP = {2: '²', 3: '³', 4: '⁴', 5: '⁵'};
const PREM = n => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
const plage = (a, b) => { const t = []; for (let i = a; i <= b; i++) t.push(i); return t; };
const liste = t => t.length === 1 ? String(t[0]) : t.slice(0, -1).join(', ') + ' et ' + t[t.length - 1];
const pl = (n, s, p) => n + ' ' + (n > 1 ? p : s);
const cpl = (x, y) => '(' + x + ' ; ' + y + ')';
const COUL = [['rouge', 'rouges'], ['bleue', 'bleues'], ['verte', 'vertes'], ['jaune', 'jaunes'], ['noire', 'noires'], ['blanche', 'blanches']];
const JET = [['rouge', 'rouges'], ['bleu', 'bleus'], ['vert', 'verts'], ['jaune', 'jaunes'], ['noir', 'noirs'], ['blanc', 'blancs']];
const bl = (n, c) => n + (n > 1 ? ' boules ' + c[1] : ' boule ' + c[0]);
const jt = (n, c) => n + (n > 1 ? ' jetons ' + c[1] : ' jeton ' + c[0]);
const PRENOMS = [['Anna', 'Bilal'], ['Lina', 'Tom'], ['Chloé', 'Yanis'], ['Inès', 'Hugo'], ['Sarah', 'Mehdi'], ['Jade', 'Lucas'], ['Léa', 'Nolan']];
const qN = nom => (/^([AEIOUÉÈÂÎ]|Hugo)/.test(nom) ? 'qu\'' : 'que ') + nom;   // élision (Yanis : semi-voyelle, pas d'élision)
const elide = s => /^[aeiouyéèàâêîôû]/i.test(s) ? 'qu\'' + s : 'que ' + s;
const JEU = {
  52: {N: 52, pc: 13, autre: 32, court: 'un jeu de 52 cartes',
       desc: 'un jeu de 52 cartes (4 couleurs : cœur, carreau, trèfle et pique ; dans chaque couleur, 13 cartes : as, 2, 3, 4, 5, 6, 7, 8, 9, 10, valet, dame et roi)'},
  32: {N: 32, pc: 8, autre: 52, court: 'un jeu de 32 cartes (as, roi, dame, valet, 10, 9, 8 et 7 dans chacune des 4 couleurs)',
       desc: 'un jeu de 32 cartes (4 couleurs : cœur, carreau, trèfle et pique ; dans chaque couleur, 8 cartes : as, roi, dame, valet, 10, 9, 8 et 7)'}
};

/* Cartes : groupes « valeur » et « couleur », et nom des cartes communes (pour « A ou B »). */
const VAL = [{t: 'un as', v: 1, nom: 'as', le: 'l\'as', pl: 'as', m: 1}, {t: 'un roi', v: 1, nom: 'rois', le: 'le roi', pl: 'rois', m: 1}, {t: 'une dame', v: 1, nom: 'dames', le: 'la dame', pl: 'dames'},
  {t: 'un valet', v: 1, nom: 'valets', le: 'le valet', pl: 'valets', m: 1}, {t: 'une figure (valet, dame ou roi)', v: 3, nom: 'figures', le: '', pl: 'figures'},
  {t: 'un 10', v: 1, nom: 'cartes « 10 »', le: 'le 10', pl: 'cartes « 10 »'}, {t: 'un 7', v: 1, nom: 'cartes « 7 »', le: 'le 7', pl: 'cartes « 7 »'}];
const PLC = {'cœur': 'cœurs', 'carreau': 'carreaux', 'trèfle': 'trèfles', 'pique': 'piques'};
const COU = [{t: 'un cœur', s: 1, nom: 'cœurs', de: 'cœur'}, {t: 'un carreau', s: 1, nom: 'carreaux', de: 'carreau'}, {t: 'un trèfle', s: 1, nom: 'trèfles', de: 'trèfle'},
  {t: 'un pique', s: 1, nom: 'piques', de: 'pique'}, {t: 'une carte rouge', s: 2, nom: 'cartes rouges', adj: 'rouges', adjM: 'rouges'}, {t: 'une carte noire', s: 2, nom: 'cartes noires', adj: 'noires', adjM: 'noirs'}];
function communes(a, b){
  if (b.s === 1) return a.v === 1 ? a.le + ' de ' + b.de : 'les 3 figures de ' + b.de;
  return 'les ' + (2 * a.v) + ' ' + a.pl + ' ' + (a.m ? b.adjM : b.adj);
}

/* Événement sur UN dé à F faces : texte, faces favorables, justification, distracteurs, piège. */
function evDe(R, F, types){
  const faces = plage(1, F), t = R.pick(types || [1, 2, 3, 4, 5]);
  if (t === 1){
    const m = R.pick(F >= 10 ? [3, 4, 5] : [3, 4]), fav = faces.filter(x => x % m === 0);
    return {txt: 'un multiple de ' + m, fav, quoi: fav.length === 1 ? 'Le seul multiple de ' + m + ' entre 1 et ' + F + ' est ' + fav[0] : 'Les multiples de ' + m + ' entre 1 et ' + F + ' sont ' + liste(fav),
      dis: [Q(1, m), Q(fav.length + 1, F), Q(fav.length, F - fav.length)],
      piege: F % m ? 'Piège : ce n\'est pas « une chance sur ' + m + ' », car ' + F + ' n\'est pas un multiple de ' + m + '.' : ''};
  }
  if (t === 2){
    const k = R.int(2, F - 1), fav = faces.filter(x => x >= k);
    return {txt: 'un nombre supérieur ou égal à ' + k, fav, quoi: 'Les nombres de ' + k + ' à ' + F + ' conviennent : il y en a ' + F + ' − ' + k + ' + 1 = ' + fav.length,
      dis: [Q(F - k, F), Q(k - 1, F), Q(fav.length, F - fav.length)],
      piege: 'Piège : ' + k + ' lui-même compte, il y a donc ' + fav.length + ' faces favorables et non ' + (F - k) + '.'};
  }
  if (t === 3){
    const k = R.int(3, F), fav = faces.filter(x => x < k);
    return {txt: 'un nombre strictement inférieur à ' + k, fav, quoi: 'Les nombres de 1 à ' + (k - 1) + ' conviennent',
      dis: [Q(k, F), Q(F - k + 1, F), Q(k - 1, F - k + 1)],
      piege: 'Piège : « strictement inférieur à ' + k + ' » exclut ' + k + ' lui-même.'};
  }
  if (t === 4){
    const fav = faces.filter(PREM);
    return {txt: 'un nombre premier', fav, quoi: 'Les nombres premiers entre 1 et ' + F + ' sont ' + liste(fav),
      dis: [Q(fav.length + 1, F), Q(fav.length - 1, F), Q(fav.length, F - fav.length)],
      piege: 'Piège : 1 n\'est pas un nombre premier (il n\'a qu\'un seul diviseur), mais 2 en est un.'};
  }
  const cands = [12, 18, 20, 24, 30, 36, 40, 48].filter(N => { const c = faces.filter(x => N % x === 0).length; return c >= 2 && c <= F - 1; });
  const N = R.pick(cands), fav = faces.filter(x => N % x === 0), tous = plage(1, N).filter(x => N % x === 0);
  return {txt: 'un diviseur de ' + N, fav, quoi: 'Les diviseurs de ' + N + ' présents sur le dé sont ' + liste(fav),
    dis: [Q(fav.length - 1, F), Q(tous.length, F), Q(fav.length, F - fav.length)],
    piege: N > F ? 'Piège : 1 divise tous les entiers, et seuls les diviseurs de ' + N + ' inférieurs ou égaux à ' + F + ' sont sur le dé (il y en a ' + tous.length + ' en tout).'
                 : 'Piège : n\'oublie ni 1 ni ' + N + ' lui-même, qui sont aussi des diviseurs de ' + N + '.'};
}

/* ======================= NIVEAU 1 : découverte ======================= */
function n1De(R){
  const F = R.pick([6, 8, 10, 12, 20]), ev = evDe(R, F), c = ev.fav.length;
  return fin({
    q: 'On lance un dé équilibré à ' + F + ' faces, numérotées de 1 à ' + F + '. Quelle est la probabilité d\'obtenir ' + ev.txt + ' ?',
    rep: Q(c, F), dis: ev.dis, D: F,
    expl: 'Les ' + F + ' faces ont la même chance de sortir : on compte les faces favorables et on divise par le nombre total de faces. ' +
      ev.quoi + ', soit ' + pl(c, 'face favorable', 'faces favorables') + ' sur ' + F + '. La probabilité vaut ' + fq(c, F) + '. ' + ev.piege
  });
}

function n1Carte(R){
  const N = R.pick([52, 32]), J = JEU[N], pc = J.pc;
  const C = R.pick(['cœur', 'carreau', 'trèfle', 'pique']), Cs = PLC[C];
  const evs = [
    {t: 'un as', c: 4, w: 'Il y a 4 as, un par couleur', dis: [Q(1, N), Q(4, N - 4), Q(1, pc)], p: 'Piège : il n\'y a pas un seul as, mais un dans chaque couleur.'},
    {t: 'un roi', c: 4, w: 'Il y a 4 rois, un par couleur', dis: [Q(1, N), Q(4, N - 4), Q(1, pc)], p: 'Piège : il n\'y a pas un seul roi, mais un dans chaque couleur.'},
    {t: 'un 7', c: 4, w: 'Il y a 4 cartes « 7 », une par couleur', dis: [Q(1, N), Q(4, N - 4), Q(1, pc)], p: 'Piège : il y a un 7 dans chaque couleur.'},
    {t: 'une figure (valet, dame ou roi)', c: 12, w: 'Il y a 3 figures par couleur, donc 3 × 4 = 12 figures', dis: [Q(3, N), Q(4, N), Q(12, N - 12)], p: 'Piège : 3 figures par couleur, et 4 couleurs.'},
    {t: 'un roi rouge', c: 2, w: 'Les rois rouges sont le roi de cœur et le roi de carreau', dis: [Q(4, N), Q(1, N), Q(N / 2 + 2, N)], p: 'Piège : « roi rouge » veut dire roi ET rouge, il n\'y en a que 2.'},
    {t: 'un as noir', c: 2, w: 'Les as noirs sont l\'as de trèfle et l\'as de pique', dis: [Q(4, N), Q(1, N), Q(N / 2 + 2, N)], p: 'Piège : « as noir » veut dire as ET noir, il n\'y en a que 2.'},
    {t: 'la dame de ' + C, c: 1, w: 'Il n\'y a qu\'une seule dame de ' + C, dis: [Q(4, N), Q(pc, N), Q(1, pc)], p: 'Piège : on ne cherche ni toutes les dames, ni tous les ' + Cs + ', mais une carte précise.'},
    {t: 'une figure rouge', c: 6, w: 'Il y a 3 figures en cœur et 3 en carreau, soit 6', dis: [Q(12, N), Q(3, N), Q(N / 2 + 6, N)], p: 'Piège : seules les figures de cœur et de carreau conviennent.'},
    {t: 'un ' + C + ' qui n\'est pas une figure', c: pc - 3, w: 'Il y a ' + pc + ' ' + Cs + ', dont 3 figures, donc ' + pc + ' − 3 = ' + (pc - 3) + ' cartes', dis: [Q(pc, N), Q(pc - 3, N - pc), Q(N - 12, N)], p: 'Piège : il faut retirer les 3 figures des ' + pc + ' ' + Cs + '.'},
    {t: 'une carte qui n\'est pas une figure', c: N - 12, w: 'Il y a 12 figures, donc ' + N + ' − 12 = ' + (N - 12) + ' cartes qui n\'en sont pas', dis: [Q(12, N), Q(N - 3, N), Q(12, N - 12)], p: 'Piège : on cherche le contraire de « figure », pas « figure ».'},
    {t: 'une carte qui n\'est pas un ' + C, c: N - pc, w: 'Il y a ' + pc + ' ' + Cs + ', donc ' + N + ' − ' + pc + ' = ' + (N - pc) + ' autres cartes', dis: [Q(1, 4), Q(N - pc, N + pc), Q(pc - 1, pc)], p: 'Piège : on cherche le contraire de « ' + C + ' », pas « ' + C + ' ».'}
  ];
  /* « A ou B » sans carte commune. Jeu de 32 : deux valeurs (8 cartes). Jeu de 52 : une valeur ou une figure (16 cartes),
     pour ne jamais retomber sur la réponse 2/13 de l'exemple officiel « valet ou roi ». */
  if (N === 32){
    const pv = R.pick([['un as', 'un 10'], ['un as', 'un roi'], ['une dame', 'un 7'], ['un valet', 'un 10'], ['un as', 'une dame'], ['un 7', 'un 10'], ['une dame', 'un valet'], ['un roi', 'un 7']]);
    evs.push({t: pv[0] + ' ou ' + pv[1], c: 8, w: 'Il y a 4 cartes de chaque valeur et aucune carte n\'a les deux valeurs à la fois : 4 + 4 = 8 cartes', dis: [Q(2, N), Q(4, N), Q(8, N - 8)],
      p: 'Piège : ' + fs(Q(2, N)) + ' compte une seule carte par valeur, alors qu\'il y en a une dans chacune des 4 couleurs.'});
  } else {
    const xv = R.pick([['un as', '4 as'], ['un 10', '4 cartes « 10 »'], ['un 7', '4 cartes « 7 »']]);
    evs.push({t: xv[0] + ' ou une figure (valet, dame ou roi)', c: 16, w: 'Il y a ' + xv[1] + ' et 12 figures, et aucune carte n\'est les deux à la fois : 4 + 12 = 16 cartes', dis: [Q(7, N), Q(12, N), Q(4, N)],
      p: 'Piège : il y a 3 figures dans chacune des 4 couleurs, soit 12 figures ; ' + fs(Q(7, N)) + ' n\'en compte que 3.'});
  }
  const e = R.pick(evs);
  return fin({
    q: 'On tire une carte au hasard dans ' + J.desc + '. Quelle est la probabilité d\'obtenir ' + e.t + ' ?',
    rep: Q(e.c, N), dis: e.dis, D: N,
    expl: 'Les ' + N + ' cartes ont la même chance d\'être tirées : on compte les cartes favorables et on divise par ' + N + '. ' +
      e.w + '. La probabilité vaut ' + fq(e.c, N) + '. ' + e.p
  });
}

function n1Urne(R){
  const cs = R.shuffle(COUL).slice(0, 3);
  const n = [R.int(2, 8), R.int(2, 8), R.int(1, 6)];
  if (n[0] === n[1] && n[1] === n[2]) n[2] = n[2] === 1 ? 2 : n[2] - 1;
  const N = n[0] + n[1] + n[2];
  const t = R.int(1, 3), i = R.int(0, 2), j = (i + 1 + R.int(0, 1)) % 3;
  const intro = 'Une urne contient ' + bl(n[0], cs[0]) + ', ' + bl(n[1], cs[1]) + ' et ' + bl(n[2], cs[2]) + ', indiscernables au toucher. On tire une boule au hasard. ';
  const m1 = 'Toutes les boules ont la même chance d\'être tirées : on divise le nombre de boules favorables par le nombre total de boules. ';
  if (t === 1){
    const c = n[i];
    return fin({q: intro + 'Quelle est la probabilité qu\'elle soit ' + cs[i][0] + ' ?', rep: Q(c, N), D: N,
      dis: [Q(c, N - c), Q(1, 3), Q(N - c, N)],
      expl: m1 + 'Il y a ' + c + ' ' + (c > 1 ? 'boules ' + cs[i][1] : 'boule ' + cs[i][0]) + ' sur ' + N + ' boules en tout. La probabilité vaut ' + fq(c, N) +
        '. Piège : ' + f0(c, N - c) + ' compare les boules ' + cs[i][1] + ' aux autres boules ; une probabilité se calcule toujours sur le total.'});
  }
  if (t === 2){
    const c = N - n[i];
    return fin({q: intro + 'Quelle est la probabilité qu\'elle ne soit pas ' + cs[i][0] + ' ?', rep: Q(c, N), D: N,
      dis: [Q(n[i], N), Q(2, 3), Q(n[i], c)],
      expl: m1 + 'Les boules qui ne sont pas ' + cs[i][1] + ' sont au nombre de ' + N + ' − ' + n[i] + ' = ' + c + ' sur ' + N + '. La probabilité vaut ' + fq(c, N) +
        ', c\'est-à-dire 1 − ' + fs(Q(n[i], N)) + '. Piège : ' + fs(Q(n[i], N)) + ' est la probabilité qu\'elle soit ' + cs[i][0] + ', pas le contraire.'});
  }
  const c = n[i] + n[j];
  return fin({q: intro + 'Quelle est la probabilité qu\'elle soit ' + cs[i][0] + ' ou ' + cs[j][0] + ' ?', rep: Q(c, N), D: N,
    dis: [Q(2, 3), Q(n[i], N), Q(c, N - c)],
    expl: m1 + 'Une boule ne peut pas être de deux couleurs à la fois, donc on additionne : ' + n[i] + ' + ' + n[j] + ' = ' + c + ' boules favorables sur ' + N + '. La probabilité vaut ' + fq(c, N) +
      '. Piège : les couleurs n\'ont pas toutes le même nombre de boules, donc « 2 couleurs sur 3 » ne donne pas la probabilité.'});
}

function n1Contraire(R){
  if (R.int(0, 1) === 1){
    const N = R.pick([40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500]);
    const q0 = R.pick([4, 5, 8, 10, 20, 25, 40, 50].filter(q => N % q === 0 && q <= N / 2));
    const p0 = R.pick(plage(1, Math.max(1, Math.floor(q0 / 4))).filter(p => pgcd(p, q0) === 1));
    const g = N / q0 * p0;
    return fin({
      q: 'Pour une tombola, ' + nb(N) + ' tickets sont vendus, dont ' + nb(g) + ' tickets gagnants. Tu achètes un ticket au hasard. Quelle est la probabilité que ce ticket soit perdant ?',
      rep: Q(N - g, N), dis: [Q(g, N), Q(g, N - g)], D: q0,
      expl: 'On compte les tickets perdants et on divise par le nombre total de tickets. Il y a ' + nb(N) + ' − ' + nb(g) + ' = ' + nb(N - g) + ' tickets perdants sur ' + nb(N) +
        '. La probabilité vaut ' + fq(N - g, N) + ', c\'est-à-dire 1 − ' + fs(Q(g, N)) + '. Piège : ' + fs(Q(g, N)) + ' est la probabilité de gagner, pas celle de perdre.'
    });
  }
  const ctx = R.pick([
    ['qu\'il pleuve demain', 'qu\'il ne pleuve pas demain'],
    ['qu\'un client paie par carte', 'qu\'un client ne paie pas par carte'],
    ['qu\'un colis arrive en retard', 'qu\'un colis arrive à l\'heure'],
    ['qu\'un joueur réussisse son tir', 'qu\'il rate son tir'],
    ['qu\'un train soit complet', 'qu\'il ne soit pas complet'],
    ['qu\'un appel aboutisse', 'qu\'il n\'aboutisse pas']
  ]);
  const d = R.pick([5, 7, 8, 9, 11, 12, 13, 15, 16, 20]), ns = plage(1, d - 1).filter(x => pgcd(x, d) === 1), n = R.pick(ns);
  const p = Q(n, d);
  return fin({
    q: 'On estime que la probabilité ' + ctx[0] + ' est égale à ' + fs(p) + '. Quelle est la probabilité ' + ctx[1] + ' ?',
    rep: Q(d - n, d), dis: [p, Q(1, d), Q(n, d - n)], D: d,
    expl: 'Les deux événements sont contraires : leurs probabilités ont pour somme 1. La probabilité cherchée vaut 1 − ' + fs(p) + ' = ' + f0(d, d) + ' − ' + f0(n, d) + ' = ' + fs(Q(d - n, d)) +
      '. Piège : recopier ' + fs(p) + ', c\'est donner la probabilité de l\'événement de départ.'
  });
}

/* ======================= NIVEAU 2 : maîtrise ======================= */
function n2Union(R){
  const N = R.pick([52, 32]), J = JEU[N], pc = J.pc, a = R.pick(VAL), b = R.pick(COU);
  const nA = 4 * a.v, nB = b.s * pc, nAB = a.v * b.s, c = nA + nB - nAB, com = communes(a, b);
  return fin({
    q: 'On tire une carte au hasard dans ' + J.court + '. Quelle est la probabilité d\'obtenir ' + a.t + ' ou ' + b.t + ' ?',
    rep: Q(c, N), dis: [Q(nA + nB, N), Q(nAB, N), Q(nA + nB - 2 * nAB, N)], D: N,
    expl: 'On additionne les deux groupes de cartes, puis on retire les cartes qui sont dans les deux groupes, sinon elles sont comptées deux fois. ' +
      'Il y a ' + nA + ' ' + a.nom + ' et ' + nB + ' ' + b.nom + ' ; ' + com + (nAB > 1 ? ' sont dans les deux groupes' : ' est dans les deux groupes') + '. ' +
      'Cartes favorables : ' + nA + ' + ' + nB + ' − ' + nAB + ' = ' + c + '. La probabilité vaut ' + fq(c, N) + '. Piège : ' + f0(nA + nB, N) + ' compte deux fois ' + com + '.'
  });
}

function n2Tirages(R){
  const cs = R.shuffle(COUL).slice(0, 2), r = R.int(2, 6), b = R.int(2, 6), N = r + b;
  const avec = R.int(0, 1) === 1, t = R.int(1, 3);
  const intro = 'Une urne contient ' + bl(r, cs[0]) + ' et ' + bl(b, cs[1]) + '. ' + (avec
    ? 'On tire une boule au hasard, on note sa couleur et on la remet dans l\'urne, puis on tire une deuxième boule. '
    : 'On tire une boule au hasard et on la garde, puis on tire une deuxième boule parmi celles qui restent. ');
  const m1 = 'On multiplie les probabilités le long du chemin de l\'arbre : premier tirage, puis deuxième tirage. ';
  if (t <= 2){
    const k = t === 1 ? r : b, c = t === 1 ? cs[0] : cs[1];
    const A2 = Q(k * k, N * N), S2 = Q(k * (k - 1), N * (N - 1));
    return fin({q: intro + 'Quelle est la probabilité d\'obtenir deux boules ' + c[1] + ' ?', rep: avec ? A2 : S2, D: avec ? N * N : N * (N - 1),
      dis: [avec ? S2 : A2, Q(k, N), Q(2 * k, N), Q(k * (k - 1), N * N)],
      expl: m1 + (avec ? 'Avec remise, l\'urne est identique au second tirage : ' + f0(k, N) + ' × ' + f0(k, N) + ' = ' + fq(k * k, N * N)
                       : 'Sans remise, au second tirage il reste ' + (N - 1) + ' boules, dont ' + (k - 1) + ' ' + (k - 1 > 1 ? c[1] : c[0]) + ' : ' + f0(k, N) + ' × ' + f0(k - 1, N - 1) + ' = ' + fq(k * (k - 1), N * (N - 1))) +
        '. Piège : ' + (avec ? 'sans remise, on aurait obtenu ' + fs(S2) : 'avec remise, on aurait obtenu ' + fs(A2)) + ' ; lis bien si la boule est remise.'});
  }
  const A2 = Q(r * b, N * N), S2 = Q(r * b, N * (N - 1));
  return fin({q: intro + 'Quelle est la probabilité que la première boule soit ' + cs[0][0] + ' et la seconde ' + cs[1][0] + ' ?', rep: avec ? A2 : S2, D: avec ? N * N : N * (N - 1),
    dis: [avec ? S2 : A2, Q(2 * r * b, avec ? N * N : N * (N - 1)), add(Q(r, N), Q(b, N - (avec ? 0 : 1)))],
    expl: m1 + (avec ? 'Avec remise : ' + f0(r, N) + ' × ' + f0(b, N) + ' = ' + fq(r * b, N * N)
                     : 'Sans remise, après une boule ' + cs[0][0] + ' il reste ' + (N - 1) + ' boules, dont toujours ' + b + ' ' + (b > 1 ? cs[1][1] : cs[1][0]) + ' : ' + f0(r, N) + ' × ' + f0(b, N - 1) + ' = ' + fq(r * b, N * (N - 1))) +
      '. Piège : l\'ordre est imposé (' + cs[0][0] + ' d\'abord), il ne faut pas multiplier par 2 ; et on multiplie les probabilités, on ne les additionne pas.'});
}

function n2Indep(R){
  const t = R.int(1, 3);
  if (t === 1){
    const F = R.pick([6, 8, 10, 12]), ev = evDe(R, F, [1, 2, 3, 4]), c = ev.fav.length, cote = R.pick(['pile', 'face']);
    return fin({
      q: 'On lance une pièce équilibrée et un dé équilibré à ' + F + ' faces numérotées de 1 à ' + F + '. Quelle est la probabilité d\'obtenir ' + cote + ' avec la pièce et ' + ev.txt + ' avec le dé ?',
      rep: Q(c, 2 * F), dis: [add(Q(1, 2), Q(c, F)), Q(c, F), Q(c, F + 2), Q(1, 2 * F)], D: 2 * F,
      expl: 'La pièce et le dé sont indépendants : on multiplie la probabilité de la pièce par celle du dé. ' + ev.quoi + ', soit ' + pl(c, 'face', 'faces') + ' sur ' + F + '. ' +
        'P = 1/2 × ' + f0(c, F) + ' = ' + fq(c, 2 * F) + '. On le retrouve en comptant les 2 × ' + F + ' = ' + (2 * F) + ' issues (pièce, dé), dont ' + c + (c > 1 ? ' favorables. ' : ' favorable. ') +
        'Piège : il y a ' + (2 * F) + ' issues et non 2 + ' + F + ', et on multiplie les probabilités au lieu de les additionner.'
    });
  }
  if (t === 2){
    const e1 = evDe(R, 6, [1, 2, 3, 4]), e2 = evDe(R, 6, [1, 2, 3, 4]), c1 = e1.fav.length, c2 = e2.fav.length;
    return fin({
      q: 'On lance un dé rouge et un dé bleu, équilibrés, à 6 faces. Quelle est la probabilité que le dé rouge donne ' + e1.txt + ' et que le dé bleu donne ' + e2.txt + ' ?',
      rep: Q(c1 * c2, 36), dis: [add(Q(c1, 6), Q(c2, 6)), Q(c1 + c2, 36), Q(c1 * c2, 12)], D: 36,
      expl: 'Les deux dés sont indépendants : on multiplie la probabilité du dé rouge par celle du dé bleu. Dé rouge : ' + e1.quoi.charAt(0).toLowerCase() + e1.quoi.slice(1) + ', soit ' + f0(c1, 6) +
        '. Dé bleu : ' + e2.quoi.charAt(0).toLowerCase() + e2.quoi.slice(1) + ', soit ' + f0(c2, 6) + '. P = ' + f0(c1, 6) + ' × ' + f0(c2, 6) + ' = ' + fq(c1 * c2, 36) +
        '. Dans le tableau 6 × 6, cela fait ' + c1 + ' × ' + c2 + ' = ' + pl(c1 * c2, 'case', 'cases') + ' sur 36. Piège : « et » se traduit par une multiplication, pas une addition.'
    });
  }
  const deux = R.int(0, 1) === 1, intro = deux ? 'On lance deux pièces équilibrées.' : 'On lance trois pièces équilibrées.';
  const e = R.pick(deux ? [
    {t: 'obtenir deux piles', c: 1, w: 'Les 4 issues équiprobables sont PP, PF, FP et FF ; seule PP convient', dis: [Q(1, 3), Q(1, 2), Q(3, 4)], p: 'Piège : il y a 4 issues, pas 3 (« 0, 1 ou 2 piles » ne sont pas équiprobables).'},
    {t: 'obtenir exactement un pile', c: 2, w: 'Les 4 issues équiprobables sont PP, PF, FP et FF ; PF et FP conviennent', dis: [Q(1, 3), Q(1, 4), Q(3, 4)], p: 'Piège : PF et FP sont deux issues différentes ; 1/3 vient de l\'erreur « 0, 1 ou 2 piles ».'},
    {t: 'obtenir au moins un pile', c: 3, w: 'Les 4 issues équiprobables sont PP, PF, FP et FF ; seule FF ne convient pas', dis: [Q(2, 3), Q(1, 2), Q(1, 4)], p: 'Piège : « au moins un » inclut PP ; 2/3 vient de l\'erreur « 0, 1 ou 2 piles ».'},
    {t: 'obtenir deux côtés différents', c: 2, w: 'Les 4 issues équiprobables sont PP, PF, FP et FF ; PF et FP conviennent', dis: [Q(1, 3), Q(1, 4), Q(3, 4)], p: 'Piège : PF et FP sont deux issues différentes.'}
  ] : [
    {t: 'obtenir trois piles', c: 1, w: 'Les 8 issues équiprobables vont de PPP à FFF ; seule PPP convient', dis: [Q(1, 4), Q(1, 6), Q(3, 8)], p: 'Piège : il y a 2 × 2 × 2 = 8 issues, pas 4.'},
    {t: 'obtenir exactement deux piles', c: 3, w: 'Les 8 issues équiprobables vont de PPP à FFF ; PPF, PFP et FPP conviennent', dis: [Q(1, 4), Q(1, 8), Q(1, 2)], p: 'Piège : la face peut être en première, deuxième ou troisième position, ce qui fait 3 issues.'},
    {t: 'obtenir au moins un pile', c: 7, w: 'Les 8 issues équiprobables vont de PPP à FFF ; seule FFF ne convient pas', dis: [Q(3, 4), Q(1, 2), Q(3, 8)], p: 'Piège : passe par le contraire, « aucun pile » = FFF.'}
  ]);
  return fin({
    q: intro + ' Quelle est la probabilité d\'' + e.t + ' ?', rep: Q(e.c, deux ? 4 : 8), dis: e.dis, D: deux ? 4 : 8,
    expl: 'On écrit toutes les issues équiprobables (P pour pile, F pour face) et on compte celles qui conviennent. ' + e.w + '. La probabilité vaut ' + fq(e.c, deux ? 4 : 8) + '. ' + e.p
  });
}

function n2Inutile(R){
  const t = R.int(1, 3);
  if (t === 1){
    const cs = R.shuffle(JET).slice(0, 3), n = [R.int(2, 7), R.int(2, 7), R.int(2, 7)], N = n[0] + n[1] + n[2], k = R.int(2, 4), i = R.int(0, 2), c = n[i];
    return fin({
      q: 'Un sac contient ' + jt(n[0], cs[0]) + ', ' + jt(n[1], cs[1]) + ' et ' + jt(n[2], cs[2]) + '. On tire ' + k + ' jetons l\'un après l\'autre, sans remise, et on les aligne sur la table dans l\'ordre du tirage. Quelle est la probabilité que le premier jeton tiré soit ' + cs[i][0] + ' ?',
      rep: Q(c, N), dis: [Q(c * (c - 1), N * (N - 1)), Q(c, N - 1), Q(k * c, N), Q(c, N - c)], D: N,
      expl: 'Seul le premier tirage est concerné : les tirages suivants ont lieu après lui et ne changent rien à sa probabilité. Au premier tirage, le sac contient ' + c + ' jetons ' + cs[i][1] + ' sur ' + N + '. ' +
        'La probabilité vaut ' + fq(c, N) + '. Piège : la phrase sur les ' + k + ' tirages sans remise est une information inutile ; inutile de multiplier des fractions.'
    });
  }
  if (t === 2){
    const C = R.pick([
      {lieu: 'Dans une classe de ', tot: 'élèves', grp: 'filles', att: 'portent des lunettes', un: 'un élève', q1: 'que ce soit un garçon', q2: 'que cet élève porte des lunettes', autres: 'garçons'},
      {lieu: 'Dans une entreprise de ', tot: 'salariés', grp: 'cadres', att: 'télétravaillent', un: 'un salarié', q1: 'que ce salarié ne soit pas cadre', q2: 'que ce salarié télétravaille', autres: 'salariés non cadres'},
      {lieu: 'Dans un club de ', tot: 'adhérents', grp: 'mineurs', att: 'pratiquent aussi la natation', un: 'un adhérent', q1: 'que cet adhérent soit majeur', q2: 'que cet adhérent pratique la natation', autres: 'adhérents majeurs'}
    ]);
    const T = R.pick([20, 24, 25, 30, 32, 36, 40, 48, 50, 60]);
    const x = R.int(Math.round(T / 3), Math.round(2 * T / 3)), autres = T - x;          // x dans le groupe, autres hors du groupe
    const o = R.int(2, Math.max(2, Math.min(x - 1, Math.round(T / 4))));                  // membres du groupe ayant l'attribut (au moins 2 : pluriel)
    const l = o + R.int(1, autres - 1);                                                   // total ayant l'attribut, cohérent avec les effectifs
    const q1 = R.int(0, 1) === 1;
    const base = C.lieu + T + ' ' + C.tot + ', il y a ' + x + ' ' + C.grp + '. Au total, ' + l + ' ' + C.tot + ' ' + C.att + ', dont ' + o + ' ' + C.grp + '. On choisit ' + C.un + ' au hasard. Quelle est la probabilité ';
    if (q1){
      return fin({q: base + C.q1 + ' ?', rep: Q(T - x, T), dis: [Q(x, T), Q(l - o, T), Q(T - x - (l - o), T)], D: T,
        expl: 'On ne garde que les données utiles à la question : ici, seul le nombre ' + (/^[aeéi]/.test(C.autres) ? 'd\'' : 'de ') + C.autres + ' compte. Il y a ' + T + ' − ' + x + ' = ' + (T - x) + ' ' + C.autres + ' sur ' + T + '. ' +
          'La probabilité vaut ' + fq(T - x, T) + '. Piège : la phrase sur les ' + l + ' ' + C.tot + ' qui ' + C.att + ' est une information inutile pour cette question.'});
    }
    return fin({q: base + C.q2 + ' ?', rep: Q(l, T), dis: [Q(o, T), Q(o, x), Q(l - o, T)], D: T,
      expl: 'On ne garde que les données utiles à la question : ici, seul le nombre total ' + (/^[aeéi]/.test(C.tot) ? 'd\'' : 'de ') + C.tot + ' qui ' + C.att + ' compte. Ils sont ' + l + ' sur ' + T + '. ' +
        'La probabilité vaut ' + fq(l, T) + '. Piège : le nombre ' + (/^[aeéi]/.test(C.grp) ? 'd\'' : 'de ') + C.grp + ' ne sert à rien ici, et ' + o + ' n\'est qu\'une partie des ' + l + '.'});
  }
  const F = R.pick([4, 6, 8, 10, 12, 20]), n = R.int(2, 4), meme = R.int(0, 1) === 1;
  const v = R.int(1, F), res = [];
  for (let i = 0; i < n; i++) res.push(meme ? v : R.int(1, F));
  const w = meme ? v : R.pick(res);
  const rang = {3: 'troisième', 4: 'quatrième', 5: 'cinquième'}[n + 1];
  return fin({
    q: 'On lance ' + n + ' fois un dé équilibré à ' + F + ' faces, numérotées de 1 à ' + F + ', et on obtient successivement ' + liste(res) + '. On lance le dé une ' + rang + ' fois. Quelle est la probabilité d\'obtenir un ' + w + ' ?',
    rep: Q(1, F), dis: [Q(F - 1, F), Q(1, F * F), Q(meme ? n + 1 : res.filter(x => x === w).length + 1, F)], D: F,
    expl: 'Les lancers sont indépendants : le dé n\'a pas de mémoire, donc les résultats précédents ne changent rien. Au lancer suivant, chacune des ' + F + ' faces a toujours la même chance. ' +
      'La probabilité vaut 1/' + F + '. Piège : les résultats déjà obtenus sont une information inutile ; ils ne rendent le ' + w + ' ni plus probable, ni moins probable.'
  });
}

/* ======================= deux dés à 6 faces : énumération des 36 cases ======================= */
function cases2(f){ const t = []; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (f(x, y)) t.push([x, y]); return t; }
const CPT_S = s => 6 - Math.abs(s - 7);
function ev2(R){
  const t = R.int(1, 9);
  if (t === 1){ const s = R.int(3, 11); return {txt: 'la somme des deux nombres soit égale à ' + s, f: (x, y) => x + y === s, S: [s]}; }
  if (t === 2) return {txt: 'la somme des deux nombres soit un nombre premier', f: (x, y) => PREM(x + y), S: [2, 3, 5, 7, 11]};
  if (t === 3){ const m = R.pick([3, 4, 5]); return {txt: 'la somme des deux nombres soit un multiple de ' + m, f: (x, y) => (x + y) % m === 0, S: plage(2, 12).filter(s => s % m === 0)}; }
  if (t === 4){ const k = R.int(8, 11); return {txt: 'la somme des deux nombres soit supérieure ou égale à ' + k, f: (x, y) => x + y >= k, S: plage(k, 12)}; }
  if (t === 5){ const k = R.int(3, 6); return {txt: 'la somme des deux nombres soit inférieure ou égale à ' + k, f: (x, y) => x + y <= k, S: plage(2, k)}; }
  if (t === 6){
    return R.pick([
      {txt: 'le produit des deux nombres soit pair', f: (x, y) => x * y % 2 === 0, why: 'Le produit est impair seulement si les deux dés sont impairs : 3 × 3 = 9 cases. Il reste 36 − 9 = 27 cases', x: [Q(1, 2)]},
      {txt: 'le produit des deux nombres soit impair', f: (x, y) => x * y % 2 === 1, why: 'Le produit est impair seulement si les deux dés sont impairs (1, 3 ou 5) : 3 × 3 = 9 cases', x: [Q(1, 2)]},
      {txt: 'le produit des deux nombres soit un multiple de 3', f: (x, y) => x * y % 3 === 0, why: 'Le produit n\'est pas un multiple de 3 quand aucun dé ne montre 3 ou 6 : 4 × 4 = 16 cases. Il reste 36 − 16 = 20 cases', x: [Q(1, 3), Q(2, 3)]},
      (() => { const p = R.pick([4, 6, 8, 12, 18]); return {txt: 'le produit des deux nombres soit égal à ' + p, f: (x, y) => x * y === p}; })(),
      (() => { const p = R.pick([15, 18, 20, 24]); return {txt: 'le produit des deux nombres soit supérieur ou égal à ' + p, f: (x, y) => x * y >= p}; })()
    ]);
  }
  if (t === 7){ const d = R.int(1, 4); return {txt: 'l\'écart entre les deux nombres (le plus grand moins le plus petit) soit égal à ' + d, f: (x, y) => Math.abs(x - y) === d, x: [Q(1, 6)]}; }
  if (t === 8){ const k = R.int(2, 6); return {txt: 'le plus grand des deux nombres soit égal à ' + k, f: (x, y) => Math.max(x, y) === k, x: [Q(2 * k, 36), Q(1, 6)]}; }
  const k = R.int(1, 5); return {txt: 'le plus petit des deux nombres soit égal à ' + k, f: (x, y) => Math.min(x, y) === k, x: [Q(14 - 2 * k, 36), Q(1, 6)]};
}
/* Justification lisible du comptage des cases favorables. */
function detail2(e, fav){
  const c = fav.length;
  if (e.S && e.S.length > 1) return 'Cases par somme : ' + e.S.map(s => 'somme ' + s + ' : ' + CPT_S(s)).join(' ; ') + '. Total : ' + c + ' cases';
  if (c <= 12) return 'Cases favorables : ' + fav.map(p => cpl(p[0], p[1])).join(', ') + ', soit ' + c + ' cases';
  if (e.why) return e.why;
  const def = cases2((x, y) => !e.f(x, y));
  return 'On compte plutôt les cases défavorables : ' + def.map(p => cpl(p[0], p[1])).join(', ') + ', soit ' + def.length + ' cases. Il reste 36 − ' + def.length + ' = ' + c + ' cases';
}

/* ======================= NIVEAU 3 : niveau des exemples officiels ======================= */
function n3DeuxDes(R){
  const e = ev2(R), fav = cases2(e.f), c = fav.length, cu = fav.filter(p => p[0] <= p[1]).length;
  const dis = (e.x || []).slice();
  if (e.S) dis.unshift(Q(e.S.length, 11));
  dis.push(Q(cu, 36), Q(cu, 21), Q(36 - c, 36));
  const asym = fav.find(p => p[0] !== p[1]);
  const piege = e.S ? 'Piège : les 11 sommes possibles (de 2 à 12) ne sont pas équiprobables' + (asym ? ', et ' + cpl(asym[0], asym[1]) + ' et ' + cpl(asym[1], asym[0]) + ' sont deux cases différentes' : '') + '.'
    : (asym ? 'Piège : ' + cpl(asym[0], asym[1]) + ' et ' + cpl(asym[1], asym[0]) + ' sont deux cases différentes du tableau.' : 'Piège : il y a 36 cases, pas 21.');
  return fin({
    q: 'On lance deux dés équilibrés à 6 faces, un rouge et un bleu. Quelle est la probabilité que ' + e.txt + ' ?',
    rep: Q(c, 36), dis, D: 36,
    expl: 'On range les 36 issues équiprobables dans un tableau 6 × 6 (dé rouge, dé bleu) et on compte les cases favorables. ' + detail2(e, fav) + '. La probabilité vaut ' + fq(c, 36) + '. ' + piege
  });
}

function n3AuMoins(R){
  const t = R.int(1, 4);
  const m1 = 'Pour « au moins un », on passe par l\'événement contraire « aucun », plus simple à calculer, puis on retranche de 1. ';
  if (t === 1){
    const F = R.pick([4, 6, 8, 10, 12]), k = R.int(1, F);
    const rep = Q(2 * F - 1, F * F);
    return fin({q: 'On lance deux dés équilibrés à ' + F + ' faces, numérotées de 1 à ' + F + '. Quelle est la probabilité d\'obtenir au moins un ' + k + ' ?',
      rep, dis: [Q(2, F), Q(1, F * F), Q((F - 1) * (F - 1), F * F), Q(2 * F - 2, F * F)], D: F * F,
      expl: m1 + 'Aucun ' + k + ' : chaque dé a ' + (F - 1) + ' chances sur ' + F + ' de ne pas donner ' + k + ', donc ' + f0(F - 1, F) + ' × ' + f0(F - 1, F) + ' = ' + f0((F - 1) * (F - 1), F * F) +
        '. Au moins un ' + k + ' : 1 − ' + f0((F - 1) * (F - 1), F * F) + ' = ' + fq(2 * F - 1, F * F) + '. Piège : 1/' + F + ' + 1/' + F + ' compte deux fois le double ' + cpl(k, k) + ' ; et « exactement un » donnerait ' + fs(Q(2 * F - 2, F * F)) + '.'});
  }
  if (t === 2){
    const e = R.pick([{t: 'un nombre pair', c: 3}, {t: 'un multiple de 3', c: 2}, {t: 'un nombre supérieur ou égal à 5', c: 2}, {t: 'un nombre supérieur ou égal à 4', c: 3},
      {t: 'un nombre supérieur ou égal à 3', c: 4}, {t: 'un 1 ou un 2', c: 2}, {t: 'un nombre premier', c: 3}, {t: 'un diviseur de 10 (1, 2 ou 5)', c: 3}]);
    const p = Q(e.c, 6), np = sub(UN, p), rep = sub(UN, mul(np, np));
    return fin({q: 'On lance deux dés équilibrés à 6 faces. Quelle est la probabilité qu\'au moins un des deux dés donne ' + e.t + ' ?',
      rep, dis: [add(p, p), mul(p, p), mul(np, np), mul(Q(2, 1), mul(p, np))], D: 36,
      expl: m1 + 'Un dé ne donne pas ' + e.t + ' avec la probabilité ' + fs(np) + '. Aucun des deux : ' + fs(np) + ' × ' + fs(np) + ' = ' + fs(mul(np, np)) +
        '. Au moins un : 1 − ' + fs(mul(np, np)) + ' = ' + fs(rep) + '. Piège : additionner ' + fs(p) + ' + ' + fs(p) + ' compte deux fois les cas où les deux dés conviennent ; et ' + fs(mul(p, p)) + ' correspond à « les deux ».'});
  }
  if (t === 3){
    const cs = R.shuffle(COUL).slice(0, 2), n = R.int(2, 3);
    const N = n === 3 ? R.int(3, 6) : R.int(3, 10), r = R.int(1, N - 1), b = N - r;
    const nb3 = Math.pow(b, n), Nn = Math.pow(N, n), rep = Q(Nn - nb3, Nn);
    return fin({q: 'Une urne contient ' + bl(r, cs[0]) + ' et ' + bl(b, cs[1]) + '. On tire une boule, on note sa couleur et on la remet ; on fait ainsi ' + n + ' tirages. Quelle est la probabilité d\'obtenir au moins une boule ' + cs[0][0] + ' ?',
      rep, dis: [Q(n * r, N), Q(Math.pow(r, n), Nn), Q(r, N), Q(n * r * Math.pow(b, n - 1), Nn)], D: Nn,
      expl: m1 + 'Aucune boule ' + cs[0][0] + ' : à chaque tirage, la probabilité est ' + f0(b, N) + ', donc ' + (n === 2 ? f0(b, N) + ' × ' + f0(b, N) : f0(b, N) + ' × ' + f0(b, N) + ' × ' + f0(b, N)) + ' = ' + f0(nb3, Nn) +
        '. Au moins une : 1 − ' + f0(nb3, Nn) + ' = ' + fq(Nn - nb3, Nn) + '. Piège : on n\'additionne pas les probabilités des tirages (' + n + ' × ' + f0(r, N) + ' compte plusieurs fois les cas favorables).'});
  }
  const n = R.pick([4, 5]), pile = R.int(0, 1) === 1, tot = Math.pow(2, n);
  const am = pile ? 'au moins un pile' : 'au moins une face', auc = pile ? 'aucun pile' : 'aucune face', cote = pile ? 'pile' : 'face';
  return fin({q: 'On lance ' + n + ' pièces équilibrées. Quelle est la probabilité d\'obtenir ' + am + ' ?',
    rep: Q(tot - 1, tot), dis: [Q(n, n + 1), Q(1, 2), Q(n, tot), Q(1, tot)], D: tot,
    expl: m1 + 'Le contraire de « ' + am + ' » est « ' + auc + ' » : une seule issue sur 2' + SUP[n] + ' = ' + tot + '. La probabilité vaut 1 − 1/' + tot + ' = ' + fs(Q(tot - 1, tot)) +
      '. Piège : les ' + (n + 1) + ' résultats « 0, 1, …, ' + n + ' ' + cote + 's » ne sont pas équiprobables, donc ' + fs(Q(n, n + 1)) + ' est faux.'});
}

function n3SansRemise(R){
  const cs = R.shuffle(COUL).slice(0, 2), r = R.int(2, 7), b = R.int(2, 7), N = r + b, D = N * (N - 1);
  const simult = R.int(0, 1) === 1;
  const intro = 'Un sac contient ' + bl(r, cs[0]) + ' et ' + bl(b, cs[1]) + '. ' + (simult ? 'On prend au hasard deux boules en même temps. ' : 'On tire au hasard deux boules, l\'une après l\'autre et sans remise. ');
  const m1 = (simult ? 'Prendre deux boules en même temps revient à tirer sans remise : ' : 'Sans remise, ') + 'on multiplie le long des branches de l\'arbre, avec un dénominateur qui baisse de 1 au second tirage. ';
  const t = R.int(1, 3);
  if (t === 1){
    const c = r * (r - 1) + b * (b - 1);
    return fin({q: intro + 'Quelle est la probabilité que les deux boules soient de la même couleur ?', rep: Q(c, D), D,
      dis: [Q(r * r + b * b, N * N), Q(r * (r - 1), D), Q(1, 2), Q(2 * r * b, D)],
      expl: m1 + 'Deux ' + cs[0][1] + ' : ' + f0(r, N) + ' × ' + f0(r - 1, N - 1) + ' = ' + f0(r * (r - 1), D) + '. Deux ' + cs[1][1] + ' : ' + f0(b, N) + ' × ' + f0(b - 1, N - 1) + ' = ' + f0(b * (b - 1), D) +
        '. On additionne les deux chemins : ' + fq(c, D) + '. Piège : avec remise, on aurait ' + fs(Q(r * r + b * b, N * N)) + ' ; et il ne faut oublier aucune des deux couleurs.'});
  }
  if (t === 2){
    const c = 2 * r * b;
    return fin({q: intro + 'Quelle est la probabilité que les deux boules soient de couleurs différentes ?', rep: Q(c, D), D,
      dis: [Q(r * b, D), Q(2 * r * b, N * N), Q(1, 2), Q(r * (r - 1) + b * (b - 1), D)],
      expl: m1 + 'Une ' + cs[0][0] + ' puis une ' + cs[1][0] + ' : ' + f0(r, N) + ' × ' + f0(b, N - 1) + ' = ' + f0(r * b, D) + '. Une ' + cs[1][0] + ' puis une ' + cs[0][0] + ' : ' + f0(b, N) + ' × ' + f0(r, N - 1) + ' = ' + f0(r * b, D) +
        '. Total : ' + fq(c, D) + '. Piège : il y a deux ordres possibles ; oublier l\'un des deux chemins donne ' + fs(Q(r * b, D)) + '.'});
  }
  const c = D - b * (b - 1);
  return fin({q: intro + 'Quelle est la probabilité d\'obtenir au moins une boule ' + cs[0][0] + ' ?', rep: Q(c, D), D,
    dis: [Q(r * (r - 1), D), Q(2 * r * b, D), Q(N * N - b * b, N * N), Q(2 * r, N)],
    expl: m1 + 'Le plus court est le contraire « aucune boule ' + cs[0][0] + ' », c\'est-à-dire deux ' + cs[1][1] + ' : ' + f0(b, N) + ' × ' + f0(b - 1, N - 1) + ' = ' + fq(b * (b - 1), D) +
      '. Donc P = 1 − ' + fs(Q(b * (b - 1), D)) + ' = ' + fs(Q(c, D)) + '. Piège : « au moins une » compte aussi le cas de deux ' + cs[0][1] + ' ; « exactement une » donnerait ' + fs(Q(2 * r * b, D)) + '.'});
}

function n3Cartes(R){
  const N = R.pick([52, 32]), J = JEU[N], pc = J.pc;
  if (R.int(0, 1) === 1){
    const X = R.pick([{t: 'des as', c: 4}, {t: 'des rois', c: 4}, {t: 'des dames', c: 4}, {t: 'des cœurs', c: pc}, {t: 'des piques', c: pc},
      {t: 'des figures (valet, dame ou roi)', c: 12}, {t: 'des cartes rouges', c: N / 2}]);
    const c = X.c, D = N * (N - 1);
    return fin({q: 'On tire successivement deux cartes dans ' + J.court + ', sans remettre la première dans le jeu. Quelle est la probabilité que les deux cartes soient ' + X.t + ' ?',
      rep: Q(c * (c - 1), D), dis: [Q(c * c, N * N), Q(c * (c - 1), N * N), Q(c, N), Q(2 * c, N)], D,
      expl: 'On multiplie la probabilité du premier tirage par celle du second, en tenant compte de la carte déjà sortie. Premier tirage : ' + f0(c, N) + '. Second tirage : il reste ' + (N - 1) + ' cartes, dont ' + (c - 1) + ' qui conviennent, soit ' + f0(c - 1, N - 1) +
        '. P = ' + f0(c, N) + ' × ' + f0(c - 1, N - 1) + ' = ' + fq(c * (c - 1), D) + '. Réflexe : simplifie avant de multiplier (' + f0(c, N) + ' = ' + fs(Q(c, N)) + '). Piège : avec remise, on aurait ' + fs(Q(c * c, N * N)) + '.'});
  }
  const a = R.pick(VAL.slice(0, 5)), b = R.pick(COU);
  const k = R.int(3, 5), nA = 4 * a.v, nB = b.s * pc, nAB = a.v * b.s, c = nA + nB - nAB, com = communes(a, b);
  return fin({q: 'On tire ' + k + ' cartes l\'une après l\'autre, sans remise, dans ' + J.court + ', et on les pose face visible. Quelle est la probabilité que la première carte tirée soit ' + a.t + ' ou ' + b.t + ' ?',
    rep: Q(c, N), dis: [Q(nA + nB, N), Q(nAB, N), Q(c, N - 1), Q(k * c, N)], D: N,
    expl: 'Seule la première carte compte : on compte les cartes favorables parmi les ' + N + ', sans compter deux fois celles qui sont dans les deux groupes. ' +
      nA + ' ' + a.nom + ' + ' + nB + ' ' + b.nom + ' − ' + nAB + ' ' + (nAB > 1 ? 'cartes communes' : 'carte commune') + ' (' + com + ') = ' + c + ' cartes. La probabilité vaut ' + fq(c, N) +
      '. Pièges : les ' + k + ' tirages sans remise sont une information inutile, et ' + f0(nA + nB, N) + ' compte deux fois les cartes communes.'});
}

/* ======================= NIVEAU 4 : plus dur que les exemples officiels ======================= */
function n4Sachant(R){
  const Bs = [
    () => { const s = R.int(4, 10); return {txt: 'la somme des deux nombres vaut ' + s, f: (x, y) => x + y === s, d: (L) => 'Issues où la somme vaut ' + s + ' : ' + L.map(p => cpl(p[0], p[1])).join(', ') + ', soit ' + L.length + ' issues'}; },
    () => { const k = R.int(1, 6); return {txt: 'au moins un des deux dés montre un ' + k, f: (x, y) => x === k || y === k, d: () => 'Issues avec au moins un ' + k + ' : 6 avec le dé rouge sur ' + k + ', 6 avec le dé bleu sur ' + k + ', moins le double ' + cpl(k, k) + ' compté deux fois, soit 11 issues'}; },
    () => ({txt: 'les deux nombres sont différents', f: (x, y) => x !== y, d: () => 'Issues où les deux nombres sont différents : 36 − 6 doubles = 30 issues'}),
    () => ({txt: 'la somme des deux nombres est paire', f: (x, y) => (x + y) % 2 === 0, d: () => 'Issues où la somme est paire : deux nombres pairs (3 × 3 = 9) ou deux impairs (9), soit 18 issues'}),
    () => ({txt: 'le produit des deux nombres est pair', f: (x, y) => x * y % 2 === 0, d: () => 'Issues où le produit est pair : 36 − 9 (les deux dés impairs) = 27 issues'}),
    () => { const t = R.int(8, 10); return {txt: 'la somme des deux nombres est supérieure ou égale à ' + t, f: (x, y) => x + y >= t, d: (L) => 'Issues où la somme est au moins ' + t + ' : ' + plage(t, 12).map(s => 'somme ' + s + ' : ' + CPT_S(s)).join(' ; ') + ', soit ' + L.length + ' issues'}; }
  ];
  const As = [
    () => ({txt: 'ce soit un double', ind: 'les doubles', f: (x, y) => x === y}),
    () => { const k = R.int(1, 6); return {txt: 'au moins un des deux dés montre un ' + k, ind: 'les issues avec au moins un ' + k, f: (x, y) => x === k || y === k}; },
    () => { const s = R.int(5, 9); return {txt: 'la somme soit égale à ' + s, ind: 'les issues de somme ' + s, f: (x, y) => x + y === s}; },
    () => ({txt: 'les deux nombres soient pairs', ind: 'les issues où les deux nombres sont pairs', f: (x, y) => x % 2 === 0 && y % 2 === 0}),
    () => { const t = R.int(7, 11); return {txt: 'la somme soit supérieure ou égale à ' + t, ind: 'les issues de somme au moins ' + t, f: (x, y) => x + y >= t}; },
    () => { const p = R.pick([10, 12, 15, 20]); return {txt: 'le produit soit supérieur ou égal à ' + p, ind: 'les issues de produit au moins ' + p, f: (x, y) => x * y >= p}; },
    () => ({txt: 'le dé rouge montre un nombre plus grand que le dé bleu', ind: 'les issues où le dé rouge dépasse le dé bleu', f: (x, y) => x > y})
  ];
  let B, Ae, LB, LAB;
  for (let essai = 0; essai < 80; essai++){
    B = R.pick(Bs)(); Ae = R.pick(As)();
    LB = cases2(B.f); LAB = LB.filter(p => Ae.f(p[0], p[1]));
    if (LAB.length > 0 && LAB.length < LB.length && LAB.length <= 12) break;
    B = null;
  }
  if (!B){ B = Bs[0](); B = {txt: 'la somme des deux nombres vaut 8', f: (x, y) => x + y === 8, d: (L) => 'Issues où la somme vaut 8 : ' + L.map(p => cpl(p[0], p[1])).join(', ') + ', soit ' + L.length + ' issues'};
    Ae = As[0](); LB = cases2(B.f); LAB = LB.filter(p => Ae.f(p[0], p[1])); }
  const nB = LB.length, k = LAB.length, nA = cases2(Ae.f).length;
  return fin({
    q: 'On lance deux dés équilibrés à 6 faces, un rouge et un bleu, et on sait ' + elide(B.txt) + '. Quelle est alors la probabilité ' + elide(Ae.txt) + ' ?',
    rep: Q(k, nB), dis: [Q(k, 36), Q(nA, 36), Q(nB - k, nB), Q(k, nB + 1)], D: nB,
    expl: 'Sachant ' + elide(B.txt) + ', on ne garde que les issues où c\'est vrai : elles forment le nouvel univers, et on compte les issues favorables parmi elles. ' +
      B.d(LB) + '. Parmi elles, ' + Ae.ind + ' : ' + LAB.map(p => cpl(p[0], p[1])).join(', ') + ', soit ' + pl(k, 'issue', 'issues') + '. La probabilité vaut ' + fq(k, nB) +
      '. Piège : diviser par 36 donnerait ' + fs(Q(k, 36)) + ', la probabilité que les deux événements arrivent ensemble, et non la probabilité sachant l\'information.'
  });
}

function n4DeuxUrnes(R){
  if (R.int(0, 2) > 0){
    const cs = R.shuffle(COUL).slice(0, 2);
    const ch = R.pick([{t: 'On lance une pièce équilibrée : sur pile, on tire une boule dans l\'urne U1 ; sur face, dans l\'urne U2.', p: Q(1, 2), w: 'pile'},
      {t: 'On lance un dé équilibré à 6 faces : sur 1 ou 2, on tire une boule dans l\'urne U1 ; sinon, dans l\'urne U2.', p: Q(1, 3), w: '1 ou 2'},
      {t: 'On lance un dé équilibré à 6 faces : sur 6, on tire une boule dans l\'urne U1 ; sinon, dans l\'urne U2.', p: Q(1, 6), w: '6'},
      {t: 'On lance un dé équilibré à 6 faces : sur un nombre inférieur ou égal à 4, on tire une boule dans l\'urne U1 ; sinon, dans l\'urne U2.', p: Q(2, 3), w: '4 ou moins'}]);
    const p = ch.p, np = sub(UN, p);
    let a1 = 1, b1 = 1, a2 = 3, b2 = 1, rep = UN;
    for (let e = 0; e < 200; e++){
      a1 = R.int(1, 6); b1 = R.int(1, 6); a2 = R.int(1, 6); b2 = R.int(1, 6);
      const N1e = a1 + b1, N2e = a2 + b2;
      if (N1e === N2e || a1 * N2e === a2 * N1e) continue;
      rep = add(mul(p, Q(a1, N1e)), mul(np, Q(a2, N2e)));
      if (rep.d <= 60 && !egal(rep, Q(a1 + a2, N1e + N2e))) break;
    }
    const N1 = a1 + b1, N2 = a2 + b2, x1 = Q(a1, N1), x2 = Q(a2, N2);
    rep = add(mul(p, x1), mul(np, x2));
    return fin({
      q: 'L\'urne U1 contient ' + bl(a1, cs[0]) + ' et ' + bl(b1, cs[1]) + ' ; l\'urne U2 contient ' + bl(a2, cs[0]) + ' et ' + bl(b2, cs[1]) + '. ' + ch.t + ' Quelle est la probabilité de tirer une boule ' + cs[0][0] + ' ?',
      rep, dis: [Q(a1 + a2, N1 + N2), mul(Q(1, 2), add(x1, x2)), mul(p, x1), mul(x1, x2)], D: rep.d,
      expl: 'On fait un arbre : d\'abord le choix de l\'urne, puis la couleur ; on multiplie le long de chaque chemin et on additionne les chemins qui mènent à une boule ' + cs[0][0] + '. ' +
        'Chemin U1 : ' + fs(p) + ' × ' + f0(a1, N1) + ' = ' + fs(mul(p, x1)) + '. Chemin U2 : ' + fs(np) + ' × ' + f0(a2, N2) + ' = ' + fs(mul(np, x2)) + '. Total : ' + fs(mul(p, x1)) + ' + ' + fs(mul(np, x2)) + ' = ' + fs(rep) +
        '. Piège : réunir les deux urnes en une seule donnerait ' + fs(Q(a1 + a2, N1 + N2)) + ', ce qui est faux car les urnes n\'ont pas le même nombre de boules' + (egal(p, Q(1, 2)) ? '' : ' et ne sont pas choisies avec la même probabilité') + '.'
    });
  }
  const PP = R.pick([[Q(1, 4), 'le quart'], [Q(1, 3), 'le tiers'], [Q(2, 3), 'les deux tiers'], [Q(3, 4), 'les trois quarts'], [Q(2, 5), 'les deux cinquièmes'], [Q(3, 5), 'les trois cinquièmes']]), P = PP[0];
  let dA = R.pick([4, 5, 10, 20, 25]), dB = R.pick([4, 5, 10, 20, 25]);
  if (dA === dB) dB = dA === 10 ? 20 : 10;
  const np = sub(UN, P), rep = add(mul(P, Q(1, dA)), mul(np, Q(1, dB)));
  return fin({
    q: 'Une usine a deux ateliers. L\'atelier A fabrique ' + PP[1] + ' des pièces (soit ' + fs(P) + '), l\'atelier B le reste. Dans l\'atelier A, 1 pièce sur ' + dA + ' est défectueuse ; dans l\'atelier B, 1 pièce sur ' + dB + '. On prend une pièce au hasard dans toute la production. Quelle est la probabilité qu\'elle soit défectueuse ?',
    rep, dis: [mul(Q(1, 2), add(Q(1, dA), Q(1, dB))), add(Q(1, dA), Q(1, dB)), mul(P, Q(1, dA)), Q(2, dA + dB)], D: rep.d,
    expl: 'On fait un arbre : d\'abord l\'atelier, puis l\'état de la pièce ; on multiplie le long des chemins et on additionne les chemins « défectueuse ». ' +
      'Atelier A : ' + fs(P) + ' × 1/' + dA + ' = ' + fs(mul(P, Q(1, dA))) + '. Atelier B : ' + fs(np) + ' × 1/' + dB + ' = ' + fs(mul(np, Q(1, dB))) + '. Total : ' + fs(rep) +
      '. Piège : faire la moyenne simple de 1/' + dA + ' et 1/' + dB + ' oublie que les ateliers ne produisent pas la même quantité.'
  });
}

const CNK = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - i + 1) / i; return Math.round(r); };
function suites(n, f){ const t = []; for (let m = 0; m < (1 << n); m++){ let s = ''; for (let i = n - 1; i >= 0; i--) s += (m >> i) & 1 ? 'F' : 'P'; if (f(s.split('').filter(c => c === 'P').length)) t.push(s); } return t; }
function n4Pieces(R){
  const n = R.pick([4, 4, 5]), tot = 1 << n, deFois = R.int(0, 1) === 1;
  const intro = deFois ? 'On lance ' + n + ' fois de suite une pièce équilibrée.' : 'On lance ' + n + ' pièces équilibrées.';
  const evs = [];
  for (let k = 1; k < n; k++) evs.push({t: 'obtenir exactement ' + k + ' pile' + (k > 1 ? 's' : ''), f: p => p === k, c: CNK(n, k), dis: [Q(1, n + 1), Q(1, tot), Q(k, n)], pg: 'les ' + (n + 1) + ' nombres de piles possibles ne sont pas équiprobables'});
  for (let k = 2; k < n; k++){ let c = 0; for (let j = k; j <= n; j++) c += CNK(n, j); evs.push({t: 'obtenir au moins ' + k + ' piles', f: p => p >= k, c, parts: plage(k, n).map(j => j + ' pile' + (j > 1 ? 's' : '') + ' : ' + CNK(n, j)).join(' ; '), dis: [Q(CNK(n, k), tot), Q(n - k + 1, n + 1), Q(tot - c, tot)], pg: '« au moins ' + k + ' » compte aussi les issues avec plus de ' + k + ' piles'}); }
  if (n === 4){
    evs.push({t: 'obtenir autant de piles que de faces', f: p => p === 2, c: 6, dis: [Q(1, 2), Q(1, 5), Q(1, 16)], pg: 'l\'intuition « une chance sur deux » est fausse, et les 5 nombres de piles possibles ne sont pas équiprobables'});
    evs.push({t: 'obtenir plus de piles que de faces', f: p => p >= 3, c: 5, dis: [Q(1, 2), Q(2, 5), Q(1, 4)], pg: 'il y a aussi les cas d\'égalité (2 piles et 2 faces), donc ce n\'est pas une chance sur deux'});
  }
  evs.push({t: deFois ? 'que les ' + n + ' lancers ne donnent pas tous le même côté' : 'que les pièces ne tombent pas toutes du même côté', f: p => p > 0 && p < n, c: tot - 2, dis: [Q(1, 2), Q(tot - 1, tot), Q(2, tot)], pg: 'il y a deux issues « toutes pareilles » : tout pile et tout face'});
  const e = R.pick(evs), L = suites(n, e.f);
  const qtxt = e.t.indexOf('que ') === 0 ? e.t : 'd\'' + e.t;
  /* Justification sans dénombrement formel : liste directe, liste du contraire, ou symétrie pile/face. */
  const sym = n % 2 === 1 && 2 * L.length === tot;
  const det = L.length <= 10 ? 'Issues favorables : ' + L.join(', ') + ', soit ' + L.length
    : tot - L.length <= 10 ? 'Issues défavorables : ' + suites(n, p => !e.f(p)).join(', ') + ' ; il reste ' + tot + ' − ' + (tot - L.length) + ' = ' + L.length + ' issues favorables'
    : sym ? 'Comme ' + n + ' est impair, il ne peut pas y avoir autant de piles que de faces : soit les piles sont majoritaires, soit les faces, et ces deux cas sont symétriques. Ils se partagent donc les ' + tot + ' issues : ' + L.length + ' chacun'
    : 'Nombre d\'issues : ' + e.parts + ', soit ' + L.length + ' issues favorables';
  return fin({
    q: intro + ' Quelle est la probabilité ' + qtxt + ' ?', rep: Q(e.c, tot), dis: e.dis, D: tot,
    expl: 'Chaque issue est une suite de ' + n + ' lettres P (pile) ou F (face) : il y en a 2' + SUP[n] + ' = ' + tot + ', toutes équiprobables, et on compte celles qui conviennent. ' +
      det + '. La probabilité vaut ' + fq(e.c, tot) + '. Piège : ' + e.pg + '.'
  });
}

function n4Astuce(R){
  const t = R.int(1, 3);
  if (t === 1){
    const N = R.pick([52, 32]), J = JEU[N], pc = J.pc;
    const e = R.pick([
      {t: 'les deux cartes soient de la même couleur (deux cœurs, deux carreaux, deux trèfles ou deux piques)', c: pc - 1, w: 'il reste ' + (pc - 1) + ' cartes de la couleur de la première', dis: [Q(1, 4), Q(1, 16), Q(pc - 1, N)]},
      {t: 'les deux cartes aient la même valeur (deux rois, deux 7, etc.)', c: 3, w: 'il reste 3 cartes de la même valeur que la première', dis: [Q(4, N), Q(1, (N / 4) * (N / 4)), Q(3, N)]},
      {t: 'les deux cartes soient de la même teinte (toutes deux rouges ou toutes deux noires)', c: N / 2 - 1, w: 'il reste ' + (N / 2 - 1) + ' cartes de la même teinte que la première', dis: [Q(1, 2), Q(1, 4), Q(N / 2 - 1, N)]},
      {t: 'les deux cartes soient de couleurs différentes (par exemple un cœur et un pique)', c: 3 * pc, w: 'il reste ' + (3 * pc) + ' cartes d\'une autre couleur que la première', dis: [Q(3, 4), Q(1, 2), Q(3 * pc, N)]}
    ]);
    return fin({
      q: 'On tire au hasard deux cartes dans ' + J.court + ', l\'une après l\'autre et sans remise. Quelle est la probabilité que ' + e.t + ' ?',
      rep: Q(e.c, N - 1), dis: e.dis, D: N - 1,
      expl: 'La première carte peut être n\'importe laquelle : seule la seconde doit « suivre » la première, parmi les ' + (N - 1) + ' cartes restantes. Après la première carte, ' + e.w + '. ' +
        'La probabilité vaut ' + fq(e.c, N - 1) + '. Piège : le dénominateur est ' + (N - 1) + ' et non ' + N + ', car une carte est déjà sortie ; et inutile de passer par une longue somme de cas.'
    });
  }
  if (t === 2){
    const n = R.int(3, 12);
    return fin({
      q: 'Un tiroir contient ' + n + ' paires de chaussettes, toutes de couleurs différentes, soit ' + (2 * n) + ' chaussettes. Dans le noir, on en prend deux au hasard. Quelle est la probabilité qu\'elles forment une paire ?',
      rep: Q(1, 2 * n - 1), dis: [Q(1, n), Q(1, 2 * n), Q(1, n * n), Q(2, 2 * n - 1)], D: 2 * n - 1,
      expl: 'La première chaussette peut être n\'importe laquelle ; il faut ensuite que la seconde soit sa jumelle, parmi les chaussettes restantes. Il reste ' + (2 * n - 1) + ' chaussettes, dont une seule jumelle. ' +
        'La probabilité vaut 1/' + (2 * n - 1) + '. Piège : 1/' + n + ' raisonne sur les paires au lieu des chaussettes, et 1/' + (2 * n) + ' oublie que la première chaussette n\'est plus dans le tiroir.'
    });
  }
  const n = R.int(4, 12), rond = R.int(0, 1) === 1, [p1, p2] = R.pick(PRENOMS);
  if (rond){
    return fin({
      q: n + ' personnes, dont ' + p1 + ' et ' + p2 + ', s\'installent au hasard autour d\'une table ronde de ' + n + ' places. Quelle est la probabilité ' + qN(p1) + ' et ' + p2 + ' soient voisins ?',
      rep: Q(2, n - 1), dis: [Q(2, n), Q(1, n - 1), Q(1, n)], D: n - 1,
      expl: 'On place d\'abord ' + p1 + ', où qu\'elle soit : il reste alors ' + (n - 1) + ' places équiprobables pour ' + p2 + ', dont 2 à côté. ' +
        'La probabilité vaut ' + fq(2, n - 1) + '. Piège : autour d\'une table ronde, chaque place a exactement 2 voisines ; il ne faut pas oublier l\'une des deux.'
    });
  }
  return fin({
    q: n + ' personnes, dont ' + p1 + ' et ' + p2 + ', s\'assoient au hasard sur un banc de ' + n + ' places alignées. Quelle est la probabilité ' + qN(p1) + ' et ' + p2 + ' soient assis côte à côte ?',
    rep: Q(2, n), dis: [Q(2, n - 1), Q(1, n - 1), Q(1, n)], D: n,
    expl: 'On ne s\'intéresse qu\'aux deux places occupées par ' + p1 + ' et ' + p2 + ' : on compte les couples de places voisines parmi tous les couples de places. ' +
      'Il y a ' + n + ' × ' + (n - 1) + ' = ' + (n * (n - 1)) + ' façons équiprobables de leur attribuer deux places, et ' + (n - 1) + ' paires de places voisines, chacune dans 2 ordres, soit ' + (2 * (n - 1)) + ' cas favorables. ' +
      'La probabilité vaut ' + fq(2 * (n - 1), n * (n - 1)) + '. Piège : aux deux bouts du banc, on n\'a qu\'un seul voisin ; la formule de la table ronde, 2/' + (n - 1) + ', ne s\'applique pas.'
  });
}

function n4TroisDes(R){
  const F = R.pick([4, 6, 6]), T = F * F * F, k = R.int(1, F);
  const nd = F * (F - 1) * (F - 2);
  const evs = [
    {t: 'les trois nombres soient tous différents', c: nd, w: F + ' × ' + (F - 1) + ' × ' + (F - 2) + ' = ' + nd + ' issues (le deuxième dé évite le premier, le troisième évite les deux autres)',
      dis: [Q(T - nd, T), Q((F - 1) * (F - 2), T), Q(F - 2, F)], pg: 'le premier dé peut prendre n\'importe quelle valeur ; seuls le deuxième et le troisième sont contraints, d\'où ' + F + ' × ' + (F - 1) + ' × ' + (F - 2) + ' et non ' + (F - 1) + ' × ' + (F - 2)},
    {t: 'les trois nombres soient identiques', c: F, w: 'il y a ' + F + ' triples possibles : ' + plage(1, F).map(v => '(' + v + ' ; ' + v + ' ; ' + v + ')').join(', '),
      dis: [Q(1, T), Q(3, F * F), Q(1, F)], pg: 'il n\'y a pas un seul triple mais ' + F},
    {t: 'au moins un des trois dés donne un ' + k, c: T - (F - 1) * (F - 1) * (F - 1), w: 'contraire « aucun ' + k + ' » : ' + (F - 1) + ' × ' + (F - 1) + ' × ' + (F - 1) + ' = ' + Math.pow(F - 1, 3) + ' issues, donc ' + T + ' − ' + Math.pow(F - 1, 3) + ' = ' + (T - Math.pow(F - 1, 3)) + ' issues',
      dis: [Q(3, F), Q(Math.pow(F - 1, 3), T), Q(3 * (F - 1) * (F - 1), T)], pg: 'additionner 3 fois 1/' + F + ' compte plusieurs fois les issues avec deux ou trois ' + k},
    {t: 'exactement deux des trois nombres soient égaux', c: 3 * F * (F - 1), w: '3 choix pour le dé « différent », ' + F + ' valeurs pour la paire et ' + (F - 1) + ' pour l\'autre : 3 × ' + F + ' × ' + (F - 1) + ' = ' + (3 * F * (F - 1)) + ' issues',
      dis: [Q(F * (F - 1), T), Q(T - nd, T), Q(3, F)], pg: 'le dé différent peut être le premier, le deuxième ou le troisième (facteur 3)'}
  ];
  const sCands = [4, 5, 6].map(s => ({s, c: CPT3(F, s)})).concat([4, 5, 6].map(s => ({s: 3 * F + 3 - s, c: CPT3(F, s)})));
  const sc = R.pick(sCands);
  evs.push({t: 'la somme des trois nombres soit égale à ' + sc.s, c: sc.c, w: 'issues de somme ' + sc.s + ' : ' + LST3(F, sc.s) + ', soit ' + sc.c,
    dis: [Q(1, 3 * F - 2), Q(ceilU3(F, sc.s), T), Q(sc.c + 1, T)], pg: 'les ' + (3 * F - 2) + ' sommes possibles ne sont pas équiprobables, et l\'ordre des dés compte'});
  const e = R.pick(evs);
  return fin({
    q: 'On lance trois dés équilibrés à ' + F + ' faces, numérotées de 1 à ' + F + '. Quelle est la probabilité ' + elide(e.t) + ' ?',
    rep: Q(e.c, T), dis: e.dis, D: T,
    expl: 'Il y a ' + F + ' × ' + F + ' × ' + F + ' = ' + T + ' issues équiprobables (dé 1, dé 2, dé 3) : on compte celles qui conviennent. ' + e.w.charAt(0).toUpperCase() + e.w.slice(1) + '. ' +
      'La probabilité vaut ' + fq(e.c, T) + '. Piège : ' + e.pg + '.'
  });
}
function CPT3(F, s){ let c = 0; for (let a = 1; a <= F; a++) for (let b = 1; b <= F; b++){ const z = s - a - b; if (z >= 1 && z <= F) c++; } return c; }
function ceilU3(F, s){ let c = 0; for (let a = 1; a <= F; a++) for (let b = a; b <= F; b++){ const z = s - a - b; if (z >= b && z <= F) c++; } return c; }
function LST3(F, s){ const t = []; for (let a = 1; a <= F; a++) for (let b = a; b <= F; b++){ const z = s - a - b; if (z >= b && z <= F){ const n = (a === b && b === z) ? 1 : (a === b || b === z) ? 3 : 6; t.push('{' + a + ', ' + b + ', ' + z + '} dans ' + n + ' ordre' + (n > 1 ? 's' : '')); } } return t.join(' ; '); }

/* ======================= NIVEAU 5 : haut du test adaptatif ======================= */
function n5Bayes(R){
  const t = R.int(1, 3);
  if (t === 1){
    const n = R.int(1, 9), k = R.int(1, 3), p2 = 1 << k;
    const fois = ['', 'une fois : elle tombe sur pile', 'deux fois : elle tombe deux fois sur pile', 'trois fois : elle tombe trois fois sur pile'][k];
    const rep = Q(p2, p2 + n);
    return fin({
      q: 'Une boîte contient ' + n + ' pièce' + (n > 1 ? 's' : '') + ' équilibrée' + (n > 1 ? 's' : '') + ' et 1 pièce truquée qui a pile sur ses deux faces. On prend une pièce au hasard dans la boîte et on la lance ' + fois + '. Quelle est la probabilité que ce soit la pièce truquée ?',
      rep, dis: [Q(1, n + 1), Q(n, p2 + n), Q(p2 + n, p2 * (n + 1)), Q(1, 2)], D: rep.d,
      expl: 'On compare les deux façons d\'obtenir ce résultat, chacune pondérée par sa probabilité, puis on prend la part de la pièce truquée. ' +
        'Pièce truquée : 1/' + (n + 1) + ' × 1 = 1/' + (n + 1) + '. Pièce équilibrée : ' + f0(n, n + 1) + ' × 1/' + p2 + ' = ' + fs(Q(n, (n + 1) * p2)) + '. ' +
        'P = (1/' + (n + 1) + ') ÷ (1/' + (n + 1) + ' + ' + fs(Q(n, (n + 1) * p2)) + ') = ' + fs(rep) + '. En multipliant tout par ' + ((n + 1) * p2) + ' : ' + p2 + ' cas « truquée » contre ' + n + ' cas « équilibrée ». ' +
        'Piège : 1/' + (n + 1) + ' ignore le résultat des lancers, qui rend la pièce truquée plus probable.'
    });
  }
  if (t === 2){
    const a = R.int(1, 5), b = R.int(1, 5), c = R.int(0, 4);
    const cr = (n, s, p) => n + ' carte' + (n > 1 ? 's ' + p : ' ' + s);
    const rep = Q(2 * a, 2 * a + b);
    return fin({
      q: 'Une boîte contient ' + cr(a, 'rouge sur ses deux faces', 'rouges sur leurs deux faces') + ', ' + cr(b, 'rouge sur une face et blanche sur l\'autre', 'rouges sur une face et blanches sur l\'autre') +
        (c ? ' et ' + cr(c, 'blanche sur ses deux faces', 'blanches sur leurs deux faces') : '') + '. On tire une carte au hasard et on la pose sur la table sans regarder : la face visible est rouge. Quelle est la probabilité que la face cachée soit rouge aussi ?',
      rep, dis: [Q(a, a + b), Q(1, 2), Q(a, a + b + c), Q(2 * a, 2 * (a + b + c))], D: rep.d,
      expl: 'On raisonne sur les faces rouges, toutes équiprobables d\'être celle qu\'on voit, et non sur les cartes. ' +
        'Faces rouges : 2 par carte rouge-rouge et 1 par carte rouge-blanche, soit 2 × ' + a + ' + ' + b + ' = ' + (2 * a + b) + '. Parmi elles, les ' + (2 * a) + ' faces des cartes rouge-rouge ont un dos rouge. ' +
        'La probabilité vaut ' + fq(2 * a, 2 * a + b) + '. Piège : ' + fs(Q(a, a + b)) + ' compte les cartes au lieu des faces' + (c ? ' ; les cartes blanches-blanches sont une information inutile' : '') + '.'
    });
  }
  const cs = R.shuffle(COUL).slice(0, 2);
  let a1, b1, a2, b2;
  for (let e = 0; e < 60; e++){ a1 = R.int(1, 6); b1 = R.int(1, 6); a2 = R.int(1, 6); b2 = R.int(1, 6); if (a1 + b1 !== a2 + b2 && a1 * (a2 + b2) !== a2 * (a1 + b1)) break; }
  if (a1 + b1 === a2 + b2 || a1 * (a2 + b2) === a2 * (a1 + b1)){ a1 = 2; b1 = 1; a2 = 1; b2 = 3; }
  const N1 = a1 + b1, N2 = a2 + b2, x1 = Q(a1, N1), x2 = Q(a2, N2), pr = mul(Q(1, 2), add(x1, x2)), rep = dvd(mul(Q(1, 2), x1), pr);
  return fin({
    q: 'L\'urne U1 contient ' + bl(a1, cs[0]) + ' et ' + bl(b1, cs[1]) + ' ; l\'urne U2 contient ' + bl(a2, cs[0]) + ' et ' + bl(b2, cs[1]) + '. On choisit une urne à pile ou face, puis on y tire une boule : elle est ' + cs[0][0] + '. Quelle est la probabilité qu\'elle vienne de l\'urne U1 ?',
    rep, dis: [Q(a1, a1 + a2), x1, pr, Q(1, 2)], D: rep.d,
    expl: 'On calcule la probabilité de chaque chemin qui donne une boule ' + cs[0][0] + ', puis la part du chemin passant par U1. ' +
      'Chemin U1 : 1/2 × ' + f0(a1, N1) + ' = ' + fs(mul(Q(1, 2), x1)) + '. Chemin U2 : 1/2 × ' + f0(a2, N2) + ' = ' + fs(mul(Q(1, 2), x2)) + '. Total : ' + fs(pr) + '. ' +
      'P = ' + fs(mul(Q(1, 2), x1)) + ' ÷ ' + fs(pr) + ' = ' + fs(rep) + '. Piège : ' + fs(Q(a1, a1 + a2)) + ' compte les boules ' + cs[0][1] + ' comme si les deux urnes avaient le même nombre de boules.'
  });
}

function n5Duel(R){
  const [p1, p2] = R.pick(PRENOMS), t = R.int(1, 3);   // p1 : prénom féminin, p2 : prénom masculin
  const EVS = [
    {obj: 'une pièce équilibrée', g: 'pile', p: Q(1, 2)},
    {obj: 'un dé équilibré à 6 faces', g: 'un 6', p: Q(1, 6)},
    {obj: 'un dé équilibré à 6 faces', g: 'un 5 ou un 6', p: Q(1, 3)},
    {obj: 'un dé équilibré à 4 faces', g: 'un 4', p: Q(1, 4)},
    {obj: 'un dé équilibré à 8 faces', g: 'un 8', p: Q(1, 8)},
    {obj: 'un dé équilibré à 6 faces', g: 'un multiple de 3', p: Q(1, 3)}
  ];
  if (t === 1){
    const e = R.pick(EVS);
    let p = e.p, action = 'lancent à tour de rôle ' + e.obj, gain = e.g;
    if (R.int(0, 2) === 0){ const r = R.int(1, 4), b = R.int(1, 5); p = Q(r, r + b); action = 'tirent à tour de rôle une boule, avec remise, dans une urne contenant ' + bl(r, COUL[0]) + ' et ' + bl(b, COUL[1]); gain = 'une boule rouge'; }
    const np = sub(UN, p), x = dvd(p, sub(UN, mul(np, np))), second = R.int(0, 1) === 1, rep = second ? sub(UN, x) : x;
    const qui = second ? p2 : p1;
    return fin({
      q: p1 + ' et ' + p2 + ' ' + action + ', en commençant par ' + p1 + '. Le premier qui obtient ' + gain + ' gagne la partie. Quelle est la probabilité ' + qN(qui) + ' gagne ?',
      rep, dis: [Q(1, 2), second ? x : sub(UN, x), p, sub(UN, mul(np, np))], D: rep.d,
      expl: 'On note x la probabilité ' + qN(p1) + ' gagne et on regarde le premier tour : soit elle gagne tout de suite, soit les deux échouent et la partie recommence à l\'identique. ' +
        'x = ' + fs(p) + ' + ' + fs(np) + ' × ' + fs(np) + ' × x, donc x × (1 − ' + fs(mul(np, np)) + ') = ' + fs(p) + ', soit x = ' + fs(p) + ' ÷ ' + fs(sub(UN, mul(np, np))) + ' = ' + fs(x) + '. ' +
        (second ? 'La partie finit toujours, donc ' + p2 + ' gagne avec la probabilité 1 − ' + fs(x) + ' = ' + fs(rep) + '. ' : '') +
        'Piège : 1/2 oublie l\'avantage de commencer' + (egal(p, Q(1, 2)) ? '' : ', et ' + fs(p) + ' ne compte que le premier essai') + '.'
    });
  }
  if (t === 2){
    let eA = R.pick(EVS), eB = R.pick(EVS);
    for (let i = 0; i < 20 && egal(eA.p, eB.p); i++) eB = R.pick(EVS);
    if (egal(eA.p, eB.p)) eB = egal(eA.p, Q(1, 6)) ? EVS[0] : EVS[1];
    const pA = eA.p, pB = eB.p, rien = mul(sub(UN, pA), sub(UN, pB)), x = dvd(pA, sub(UN, rien)), second = R.int(0, 1) === 1, rep = second ? sub(UN, x) : x;
    const qui = second ? p2 : p1;
    return fin({
      q: p1 + ' et ' + p2 + ' jouent à tour de rôle, en commençant par ' + p1 + '. À son tour, ' + p1 + ' lance ' + eA.obj + ' et gagne si elle obtient ' + eA.g + ' ; ' + p2 + ' lance ' + eB.obj + ' et gagne s\'il obtient ' + eB.g + '. Le jeu s\'arrête dès que quelqu\'un gagne. Quelle est la probabilité ' + qN(qui) + ' gagne ?',
      rep, dis: [second ? dvd(pB, add(pA, pB)) : dvd(pA, add(pA, pB)), Q(1, 2), second ? x : sub(UN, x), second ? pB : pA], D: rep.d,
      expl: 'On note x la probabilité ' + qN(p1) + ' gagne et on regarde le premier tour : soit elle gagne tout de suite, soit les deux échouent et tout recommence. ' +
        'Les deux échouent avec la probabilité ' + fs(sub(UN, pA)) + ' × ' + fs(sub(UN, pB)) + ' = ' + fs(rien) + '. x = ' + fs(pA) + ' + ' + fs(rien) + ' × x, donc x = ' + fs(pA) + ' ÷ ' + fs(sub(UN, rien)) + ' = ' + fs(x) + '. ' +
        (second ? p2 + ' gagne donc avec la probabilité 1 − ' + fs(x) + ' = ' + fs(rep) + '. ' : '') +
        'Piège : partager « au prorata » des chances (' + fs(pA) + ' contre ' + fs(pB) + ') oublie qui commence.'
    });
  }
  const p3 = R.pick(['Zoé', 'Adam', 'Emma', 'Rayan']);
  const e = R.pick(EVS.slice(0, 4)), p = e.p, q = sub(UN, p), S = add(add(UN, q), mul(q, q)), rang = R.int(0, 2);
  const parts = [dvd(UN, S), dvd(q, S), dvd(mul(q, q), S)], rep = parts[rang], qui = [p1, p2, p3][rang];
  return fin({
    q: p1 + ', ' + p2 + ' et ' + p3 + ' lancent à tour de rôle ' + e.obj + ', dans cet ordre, en recommençant par ' + p1 + ' tant que personne n\'a gagné. Le premier qui obtient ' + e.g + ' gagne. Quelle est la probabilité ' + qN(qui) + ' gagne ?',
    rep, dis: [Q(1, 3), parts[(rang + 1) % 3], mul(p, rang === 0 ? UN : rang === 1 ? q : mul(q, q)), parts[(rang + 2) % 3]], D: rep.d,
    expl: 'Chaque joueur doit attendre que les précédents échouent : les chances des trois joueurs sont proportionnelles à 1, à la probabilité d\'un échec et à celle de deux échecs, et on partage 1 dans ce rapport. ' +
      'Échec : ' + fs(q) + ' ; deux échecs : ' + fs(mul(q, q)) + '. Total des poids : 1 + ' + fs(q) + ' + ' + fs(mul(q, q)) + ' = ' + fs(S) + '. ' +
      'Probabilités dans l\'ordre de jeu : ' + fs(parts[0]) + ', ' + fs(parts[1]) + ' et ' + fs(parts[2]) + '. Pour ' + qui + ' : ' + fs(rep) + '. Piège : 1/3 oublie l\'avantage de jouer tôt.'
  });
}

/* Trois personnes (ou dés) qui choisissent chacune parmi m possibilités : tous différents, ou au moins deux pareils (contraire). */
function coincid(R, auMoins){
  const C = R.pick([
    {t: 'Trois amis sont nés chacun un jour de la semaine pris au hasard (les 7 jours sont équiprobables et les naissances indépendantes).', m: 7, u: 'jour', obj: 'nés le même jour de la semaine', dif: 'nés trois jours de la semaine différents'},
    {t: 'Trois amis ont chacun leur anniversaire dans un mois pris au hasard (les 12 mois sont supposés équiprobables et indépendants).', m: 12, u: 'mois', obj: 'nés le même mois', dif: 'nés trois mois différents'},
    {t: 'Trois élèves choisissent chacun au hasard, sans se concerter, l\'un des 5 ateliers proposés.', m: 5, u: 'atelier', obj: 'dans le même atelier', dif: 'dans trois ateliers différents'},
    {t: 'Trois élèves choisissent chacun au hasard, sans se concerter, l\'un des 4 ateliers proposés.', m: 4, u: 'atelier', obj: 'dans le même atelier', dif: 'dans trois ateliers différents'},
    {t: 'On lance trois dés équilibrés à 8 faces.', m: 8, u: 'face', obj: 'égaux', dif: 'tous différents', de: 1},
    {t: 'On lance trois dés équilibrés à 10 faces.', m: 10, u: 'face', obj: 'égaux', dif: 'tous différents', de: 1},
    {t: 'Trois clients choisissent chacun au hasard l\'une des 6 caisses ouvertes d\'un magasin.', m: 6, u: 'caisse', obj: 'à la même caisse', dif: 'à trois caisses différentes'}
  ]);
  const m = C.m, T = m * m * m, nd = m * (m - 1) * (m - 2);
  const qtxt = C.de ? (auMoins ? 'qu\'au moins deux des trois nombres obtenus soient égaux' : 'que les trois nombres obtenus soient tous différents')
                    : (auMoins ? 'qu\'au moins deux d\'entre eux soient ' + C.obj : 'qu\'ils soient ' + C.dif);
  const pd = Q(nd, T), rep = auMoins ? sub(UN, pd) : pd;
  return fin({
    q: C.t + ' Quelle est la probabilité ' + qtxt + ' ?', rep,
    dis: auMoins ? [Q(3, m), Q(1, m), pd, Q(1, m * m)] : [Q(nd, 6 * T), sub(UN, Q(3, m)), sub(UN, pd), Q(m - 2, m)], D: T,
    expl: 'On calcule d\'abord la probabilité que les trois soient tous différents, en les prenant l\'un après l\'autre' + (auMoins ? ', puis on passe au contraire' : '') + '. ' +
      'Le premier est libre, le deuxième doit éviter le premier (' + f0(m - 1, m) + '), le troisième doit éviter les deux autres (' + f0(m - 2, m) + ') : ' + f0(m - 1, m) + ' × ' + f0(m - 2, m) + ' = ' + fq((m - 1) * (m - 2), m * m) + '. ' +
      (auMoins ? 'Au moins deux identiques : 1 − ' + fs(pd) + ' = ' + fs(rep) + '. Piège : ' + fs(Q(3, m)) + ' additionne les trois paires possibles comme si elles ne pouvaient pas coïncider.' :
                 'La probabilité vaut ' + fs(rep) + '. Piège : ' + fs(sub(UN, pd)) + ' est la probabilité du contraire (au moins deux pareils) ; et le deuxième comme le troisième sont contraints, il faut multiplier les deux fractions.')
  });
}
/* Plus grand / plus petit de trois dés. t = 1 : max = k ; 2 : max ≤ k ; 3 : min = k ; 4 : min ≥ k. */
function maxMin(R, t){
  const k = t === 2 ? R.int(2, 5) : R.int(2, 6);
  const c3 = x => x * x * x;
  if (t === 1){
    const c = c3(k) - c3(k - 1);
    return fin({q: 'On lance trois dés équilibrés à 6 faces. Quelle est la probabilité que le plus grand des trois nombres obtenus soit égal à ' + k + ' ?', rep: Q(c, 216),
      dis: [Q(1, 6), Q(c3(k), 216), Q(3 * (k - 1) * (k - 1), 216), Q(3 * k * k, 216)], D: 216,
      expl: 'Le plus grand vaut ' + k + ' quand tous les dés sont au plus ' + k + ', mais pas tous au plus ' + (k - 1) + ' : on fait une différence. ' +
        'Tous au plus ' + k + ' : ' + k + '³ = ' + c3(k) + ' issues. Tous au plus ' + (k - 1) + ' : ' + (k - 1) + '³ = ' + c3(k - 1) + ' issues. Différence : ' + c + ' issues sur 216. La probabilité vaut ' + fq(c, 216) +
        '. Piège : compter « un dé à ' + k + ', les deux autres en dessous » oublie les cas où plusieurs dés valent ' + k + '.'});
  }
  if (t === 2){
    return fin({q: 'On lance trois dés équilibrés à 6 faces. Quelle est la probabilité que le plus grand des trois nombres obtenus soit inférieur ou égal à ' + k + ' ?', rep: Q(c3(k), 216),
      dis: [Q(k, 6), Q(c3(k) - c3(k - 1), 216), Q(3 * k, 18), Q(k * k, 36)], D: 216,
      expl: 'Le plus grand est au plus ' + k + ' exactement quand chacun des trois dés est au plus ' + k + ' : on multiplie les trois probabilités. ' +
        'Chaque dé : ' + f0(k, 6) + '. Donc (' + f0(k, 6) + ')³ = ' + fq(c3(k), 216) + '. Piège : « au plus ' + k + ' » n\'est pas « égal à ' + k + ' », et il faut que les trois dés vérifient la condition.'});
  }
  const kk = R.int(1, 5), c = c3(7 - kk) - c3(6 - kk);
  if (t === 3){
    return fin({q: 'On lance trois dés équilibrés à 6 faces. Quelle est la probabilité que le plus petit des trois nombres obtenus soit égal à ' + kk + ' ?', rep: Q(c, 216),
      dis: [Q(1, 6), Q(c3(7 - kk), 216), Q(3 * (6 - kk) * (6 - kk), 216)], D: 216,
      expl: 'Le plus petit vaut ' + kk + ' quand tous les dés sont au moins ' + kk + ', mais pas tous au moins ' + (kk + 1) + ' : on fait une différence. ' +
        'Tous au moins ' + kk + ' : ' + (7 - kk) + '³ = ' + c3(7 - kk) + ' issues. Tous au moins ' + (kk + 1) + ' : ' + (6 - kk) + '³ = ' + c3(6 - kk) + ' issues. Différence : ' + c + ' issues sur 216. ' +
        'La probabilité vaut ' + fq(c, 216) + '. Piège : compter « un dé à ' + kk + ', les autres au-dessus » oublie les cas où plusieurs dés valent ' + kk + '.'});
  }
  const kj = R.int(2, 5), cc = c3(7 - kj);
  return fin({q: 'On lance trois dés équilibrés à 6 faces. Quelle est la probabilité que le plus petit des trois nombres obtenus soit supérieur ou égal à ' + kj + ' ?', rep: Q(cc, 216),
    dis: [Q(7 - kj, 6), Q(cc - c3(6 - kj), 216), Q(3 * (7 - kj), 18), Q((7 - kj) * (7 - kj), 36)], D: 216,
    expl: 'Le plus petit est au moins ' + kj + ' exactement quand chacun des trois dés est au moins ' + kj + ' : on multiplie les trois probabilités. ' +
      'Chaque dé : ' + f0(7 - kj, 6) + '. Donc (' + f0(7 - kj, 6) + ')³ = ' + fq(cc, 216) + '. Piège : il faut que les trois dés vérifient la condition, pas un seul.'});
}
/* Niveau 5 : deux étapes (contraire, ou différence de deux cubes). Niveau 4 : un seul produit. */
function n5Repet(R){ return R.int(0, 1) === 1 ? coincid(R, true) : maxMin(R, R.pick([1, 3])); }
function n4Produit(R){ return R.int(0, 1) === 1 ? coincid(R, false) : maxMin(R, R.pick([2, 4])); }

/* Trois tirages sans remise. t = 1 : au moins une (contraire, niveau 4) ; 2 et 3 : exactement deux / une (facteur 3) ; 4 : trois couleurs (facteur 6). */
function troisTirages(R, t){
  if (t === 4){
    const cs = R.shuffle(COUL).slice(0, 3), n = [R.int(1, 4), R.int(1, 4), R.int(1, 4)], N = n[0] + n[1] + n[2];
    if (N < 4) n[0] += 4 - N;
    const NN = n[0] + n[1] + n[2], D = NN * (NN - 1) * (NN - 2), c = 6 * n[0] * n[1] * n[2];
    return fin({
      q: 'Une urne contient ' + bl(n[0], cs[0]) + ', ' + bl(n[1], cs[1]) + ' et ' + bl(n[2], cs[2]) + '. On tire au hasard trois boules, l\'une après l\'autre et sans remise. Quelle est la probabilité d\'obtenir trois boules de trois couleurs différentes ?',
      rep: Q(c, D), dis: [Q(n[0] * n[1] * n[2], D), Q(6 * n[0] * n[1] * n[2], NN * NN * NN), Q(1, 3)], D,
      expl: 'On calcule un ordre précis des couleurs, puis on multiplie par le nombre d\'ordres possibles. ' +
        'Ordre ' + cs[0][0] + ', ' + cs[1][0] + ', ' + cs[2][0] + ' : ' + f0(n[0], NN) + ' × ' + f0(n[1], NN - 1) + ' × ' + f0(n[2], NN - 2) + ' = ' + f0(n[0] * n[1] * n[2], D) + '. ' +
        'Chacun des 3 × 2 × 1 = 6 ordres donne le même produit : 6 × ' + f0(n[0] * n[1] * n[2], D) + ' = ' + fq(c, D) + '. Piège : oublier les 6 ordres donne ' + fs(Q(n[0] * n[1] * n[2], D)) + '.'
    });
  }
  const cs = R.shuffle(COUL).slice(0, 2), r = R.int(2, 4), b = R.int(3, 5), N = r + b, D = N * (N - 1) * (N - 2);
  const intro = 'Une urne contient ' + bl(r, cs[0]) + ' et ' + bl(b, cs[1]) + '. On tire au hasard trois boules, l\'une après l\'autre et sans remise. ';
  if (t === 1){
    const c = D - b * (b - 1) * (b - 2);
    return fin({q: intro + 'Quelle est la probabilité d\'obtenir au moins une boule ' + cs[0][0] + ' ?', rep: Q(c, D),
      dis: [Q(3 * r, N), Q(N * N * N - b * b * b, N * N * N), Q(3 * r * b * (b - 1), D), Q(r, N)], D,
      expl: 'On passe par le contraire « aucune boule ' + cs[0][0] + ' », c\'est-à-dire trois boules ' + cs[1][1] + ', en multipliant le long de l\'arbre sans remise. ' +
        'Trois ' + cs[1][1] + ' : ' + f0(b, N) + ' × ' + f0(b - 1, N - 1) + ' × ' + f0(b - 2, N - 2) + ' = ' + fq(b * (b - 1) * (b - 2), D) + '. Au moins une ' + cs[0][0] + ' : 1 − ' + fs(Q(b * (b - 1) * (b - 2), D)) + ' = ' + fs(Q(c, D)) +
        '. Piège : additionner 3 fois ' + f0(r, N) + ' compte plusieurs fois les tirages avec deux ou trois boules ' + cs[0][1] + '.'});
  }
  const deux = t === 2, c = deux ? 3 * r * (r - 1) * b : 3 * r * b * (b - 1);
  const ex = deux ? f0(r, N) + ' × ' + f0(r - 1, N - 1) + ' × ' + f0(b, N - 2) : f0(r, N) + ' × ' + f0(b, N - 1) + ' × ' + f0(b - 1, N - 2);
  const un = deux ? r * (r - 1) * b : r * b * (b - 1);
  return fin({q: intro + 'Quelle est la probabilité d\'obtenir exactement ' + (deux ? 'deux boules ' + cs[0][1] : 'une boule ' + cs[0][0]) + ' ?', rep: Q(c, D),
    dis: [Q(un, D), deux ? Q(3 * r * r * b, N * N * N) : Q(3 * r * b * b, N * N * N), deux ? Q(D - b * (b - 1) * (b - 2) - r * b * (b - 1) * 3, D) : Q(D - b * (b - 1) * (b - 2), D)], D,
    expl: 'On calcule la probabilité d\'un ordre précis, puis on multiplie par le nombre de places possibles pour la boule ' + (deux ? cs[1][0] : cs[0][0]) + ' (3 places). ' +
      'Ordre ' + (deux ? cs[0][0] + ', ' + cs[0][0] + ', ' + cs[1][0] : cs[0][0] + ', ' + cs[1][0] + ', ' + cs[1][0]) + ' : ' + ex + ' = ' + f0(un, D) + '. Les autres ordres donnent le même produit. ' +
      'Total : 3 × ' + f0(un, D) + ' = ' + fq(c, D) + '. Piège : oublier le facteur 3 donne ' + fs(Q(un, D)) + ' ; « exactement » exclut ' + (deux ? 'les trois boules ' + cs[0][1] : 'deux ou trois boules ' + cs[0][1]) + '.'});
}

function n4TroisTirages(R){ return troisTirages(R, 1); }
function n5Trois(R){ return troisTirages(R, R.int(2, 4)); }

/* ======================= aiguillage ======================= */
const NIVEAUX = {
  1: [n1De, n1Carte, n1Urne, n1Contraire],
  2: [n2Union, n2Tirages, n2Indep, n2Inutile],
  3: [n3DeuxDes, n3AuMoins, n3SansRemise, n3Cartes],
  4: [n4Sachant, n4DeuxUrnes, n4Pieces, n4Astuce, n4TroisDes, n4Produit, n4TroisTirages],
  5: [n5Bayes, n5Duel, n5Repet, n5Trois]
};

A.push({
  id: 'alb-07-probabilites',
  phase: 'albert',
  ordre: 7,
  theme: 'proba',
  titre: 'Probabilités simples',
  objectif: 'Calculer de tête une probabilité sur des cartes, des dés, des pièces ou des urnes, en comptant sans doublon et en repérant les informations inutiles.',
  lecon:
`<p class="lede">Au test, une question de probabilités se règle presque toujours en <mark>comptant</mark> : cas favorables ÷ cas possibles. La difficulté n'est pas le calcul, c'est de compter juste, sans oubli ni doublon, et de repérer la phrase qui ne sert à rien.</p>
<h2>Ce que le test demande</h2>
<p>Tu as des situations courtes : un dé, deux dés, des pièces, une urne de boules, un jeu de cartes. On te demande une probabilité sous forme de fraction, à choisir parmi quatre. Les mauvaises réponses proposées correspondent aux erreurs classiques : carte comptée deux fois, oubli de « sans remise », confusion entre « exactement » et « au moins ». Parfois l'énoncé contient une information inutile, placée là pour te faire calculer autre chose que ce qui est demandé. Plus tu réussis, plus il faut enchaîner deux tirages, passer par le contraire ou raisonner « sachant que ».</p>
<h2>Les prérequis</h2>
<div class="formule"><p>P(A) = nombre de cas favorables ÷ nombre de cas possibles</p></div>
<p>Cette formule marche quand toutes les issues ont la même chance (dé équilibré, carte tirée au hasard). Une probabilité est toujours comprise entre 0 et 1.</p>
<table class="tbl"><tr><th>Jeu</th><th>Cartes par couleur</th><th>As</th><th>Figures</th><th>Cœurs</th><th>Rouges</th></tr>
<tr><td>52 cartes</td><td>13 (as, 2 à 10, valet, dame, roi)</td><td>4</td><td>12</td><td>13</td><td>26</td></tr>
<tr><td>32 cartes</td><td>8 (as, roi, dame, valet, 10, 9, 8, 7)</td><td>4</td><td>12</td><td>8</td><td>16</td></tr></table>
<p>Les 4 couleurs sont cœur et carreau (rouges), trèfle et pique (noires). Les figures sont valet, dame et roi.</p>
<p><strong>Contraire :</strong> P(non A) = 1 − P(A). <strong>« A ou B » :</strong> P(A) + P(B) − P(A et B), car les cas communs seraient comptés deux fois. <strong>Plusieurs tirages :</strong> on multiplie le long des branches de l'arbre.</p>
<p><strong>Deux dés :</strong> il y a 6 × 6 = 36 couples équiprobables (dé rouge, dé bleu). Nombre de couples pour chaque somme :</p>
<table class="tbl"><tr><th>Somme</th><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td></tr>
<tr><th>Couples</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>5</td><td>4</td><td>3</td><td>2</td><td>1</td></tr></table>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je souligne la question exacte :</strong> quel tirage (le premier ? les deux ?), quel événement (« exactement » ou « au moins » ?). Je barre les phrases qui ne servent pas.</p>
<p><strong>2. Je fixe l'univers :</strong> 6 faces, 36 cases pour deux dés, 52 ou 32 cartes, le nombre total de boules. Si l'énoncé dit « sachant que », l'univers se réduit aux seules issues compatibles.</p>
<p><strong>3. Je compte les cas favorables sans doublon :</strong> liste, tableau 6 × 6, ou contraire si c'est plus court.</p>
<p><strong>4. Pour plusieurs tirages, je multiplie :</strong> avec remise, l'urne ne change pas ; sans remise, le dénominateur baisse de 1 à chaque tirage.</p>
<p><strong>5. Je simplifie</strong> la fraction et je la compare aux choix.</p>
</div>
<h2>Exemples résolus</h2>
<h3>Exemple 1 : un dé à 10 faces</h3>
<p>Probabilité d'obtenir un multiple de 4 ? Les multiples de 4 entre 1 et 10 sont 4 et 8 : 2 faces sur 10, donc 2/10 = 1/5. Ce n'est pas « une chance sur 4 », car 10 n'est pas un multiple de 4.</p>
<h3>Exemple 2 : une carte dans un jeu de 32</h3>
<p>Probabilité d'obtenir une dame ou un trèfle ? 4 dames + 8 trèfles = 12, mais la dame de trèfle est comptée deux fois : 12 − 1 = 11 cartes. Réponse : 11/32.</p>
<h3>Exemple 3 : une urne, sans remise</h3>
<p>Une urne contient 3 boules rouges et 5 bleues ; on tire deux boules sans remise. Probabilité qu'elles soient de la même couleur ? Deux rouges : 3/8 × 2/7 = 6/56. Deux bleues : 5/8 × 4/7 = 20/56. Total : 26/56 = 13/28.</p>
<h3>Exemple 4 : deux dés et une phrase inutile</h3>
<p>On lance deux dés ; un ami note les résultats dans un carnet. Probabilité d'obtenir au moins un 6 ? Le carnet ne sert à rien. Contraire : aucun 6, soit 5/6 × 5/6 = 25/36. Donc 1 − 25/36 = 11/36. Le piège 1/6 + 1/6 = 12/36 compte deux fois le double (6 ; 6).</p>
<h3>Exemple 5 : « sachant que »</h3>
<p>On lance deux dés ; on sait que la somme vaut 9. Probabilité qu'un des dés montre un 6 ? Les issues de somme 9 sont (3 ; 6), (4 ; 5), (5 ; 4), (6 ; 3) : 4 issues, dont 2 avec un 6. Réponse : 2/4 = 1/2, et non 2/36.</p>
<h2>Réflexes sans calculatrice</h2>
<p>Simplifie avant de multiplier : 4/52 = 1/13, 12/52 = 3/13, 8/32 = 1/4. Écris les couples (3 ; 6) et (6 ; 3) séparément : ce sont deux cases du tableau. Dès que tu lis « au moins un », pense au contraire « aucun ». Vérifie l'ordre de grandeur : une probabilité supérieure à 1, ou plus grande que celle d'un événement plus large, signale une erreur. Prendre deux objets « en même temps » revient à tirer sans remise.</p>
<h3>Aux niveaux les plus durs</h3>
<p><strong>La première carte est libre :</strong> pour « deux cartes de la même couleur » tirées sans remise dans un jeu de 52, seule la seconde doit suivre la première, soit 12/51 = 4/17. <strong>« Au moins deux pareils » :</strong> calcule d'abord « tous différents » en prenant les personnes ou les dés un par un, puis passe au contraire. <strong>Un jeu qui recommence :</strong> si tu joues en premier et gagnes à ton tour avec la probabilité p, appelle x ta probabilité de gagner et écris x = p + (probabilité que tout le monde rate un tour) × x, puis résous.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Fixe l'univers, compte les cas favorables sans doublon (ou passe par le contraire), puis divise et simplifie.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Les classiques : compter deux fois les cartes communes (« roi ou cœur » fait 16 cartes, pas 17) ; confondre avec et sans remise ; additionner des probabilités qu'il fallait multiplier ; croire que les 11 sommes de deux dés sont équiprobables ; confondre « exactement » et « au moins » ; calculer avec une information inutile (les tirages suivants, les résultats passés d'un dé).</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Favorables ÷ possibles ; « ou » : on retire les cas communs ; « et » successifs : on multiplie ; « au moins un » : 1 − P(aucun) ; « sachant que » : on réduit l'univers.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      return R.pick(NIVEAUX[n])(R);
    } catch (e){
      const F = 6, k = R.int(2, 5);
      return fin({q: 'On lance un dé équilibré à 6 faces, numérotées de 1 à 6. Quelle est la probabilité d\'obtenir un nombre supérieur ou égal à ' + k + ' ?',
        rep: Q(F - k + 1, F), dis: [Q(F - k, F), Q(k - 1, F), Q(1, 2)], D: F,
        expl: 'Les 6 faces ont la même chance de sortir : on compte les faces favorables et on divise par 6. Les nombres de ' + k + ' à 6 conviennent, soit ' + (7 - k) + ' faces. La probabilité vaut ' + fq(7 - k, 6) + '.'});
    }
  }
});

})();
