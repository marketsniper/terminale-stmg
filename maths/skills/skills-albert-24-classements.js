/* ===== Maths · Objectif Albert School : alb-24 · Classements, ordres et tournois =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS.
   Toutes les réponses sont CALCULÉES par le code (aucune banque d'énoncés fixes) :
   les énigmes d'ordre partent d'un ordre caché, les indices sont tirés au hasard puis réduits au minimum,
   et l'unicité de la réponse est contrôlée par énumération de tous les ordres possibles.
   Sous-types par niveau :
     N1 : nombre de matchs (une rencontre par paire), rangs dans une file (avant + arrière, depuis la fin,
          derrière, entre deux), dépassements dans une course, points d'une équipe, chaîne de 4 comparaisons.
     N2 : aller-retour et nombre de journées, élimination directe (2^p joueurs), bilan d'une équipe à partir
          de ses points, chaîne de 5 comparaisons (k-ième), rangs croisés, ex aequo, « autant devant que derrière ».
     N3 : nombre de nuls (total ou classement complet), nombre d'équipes à partir du nombre de matchs,
          élimination avec exemptions, victoires toutes égales, poules + phase finale, dernière équipe (barème 2, 1, 0),
          files (total, milieu, k fois plus), énigme d'ordre à 5, frise avec écarts à 4.
     N4 : nombre d'équipes ou de nuls (aller-retour, nuls par équipe), élimination à k défaites,
          poules avec aller-retour ou petite finale, victoires toutes différentes, dernière équipe (barème 3, 1, 0
          et nombre de nuls donné), files qui se chevauchent, énigme d'ordre à 5 ou 6, frise à 5.
     N5 : score d'une équipe déduit (autant de victoires que de défaites), points qui garantissent la qualification,
          énigme d'ordre à 6 avec indices négatifs, frise à 6.
   Vérification indépendante : verifs/alb-24-classements-verif.js (relit l'énoncé, force brute). */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (copiées de la compétence de référence) ---------- */
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

/* ---------- aides propres à cette compétence ---------- */
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const sum = l => l.reduce((s, x) => s + x, 0);
const et = l => (l.length < 2 ? String(l[0]) : l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1]);
const MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
const Cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const pl = (k, sg, p) => (k > 1 ? p : sg);
const rg = k => (k === 1 ? '1re' : k + 'e');            // rang au féminin : la 1re place, la 3e position
const C2 = n => n * (n - 1) / 2;
const ptsTxt = v => nb(v) + ' ' + (v > 1 ? 'points' : 'point');
const fe = X => (X.f ? 'e' : '');
const il = X => (X.f ? 'elle' : 'il');
const lui = X => (X.f ? 'elle' : 'lui');
const le = X => (X.f ? 'la' : 'le');
const voy = w => /^[AEIOUÉÈ]/.test(w);
const que = X => (voy(X.n) ? 'qu\'' : 'que ') + X.n;
const de = X => (voy(X.n) ? 'd\'' : 'de ') + X.n;
const eux = (X, Y) => (X.f && Y.f ? 'elles' : 'eux');
const pow2 = n => { let p = 1; while (p < n) p *= 2; return p; };
const log2c = n => { let k = 0, p = 1; while (p < n) { p *= 2; k++; } return k; };

/* Prénoms (f = féminin) ; une énigme n'utilise que des initiales distinctes, pour un brouillon lisible. */
const NOMS = [['Léa', 1], ['Inès', 1], ['Jade', 1], ['Zoé', 1], ['Chloé', 1], ['Emma', 1], ['Sarah', 1], ['Nora', 1],
  ['Alice', 1], ['Maya', 1], ['Yasmine', 1], ['Ophélie', 1], ['Gabrielle', 1], ['Hugo', 0], ['Nathan', 0], ['Adam', 0],
  ['Malik', 0], ['Tom', 0], ['Yanis', 0], ['Rayan', 0], ['Enzo', 0], ['Bilal', 0], ['Lucas', 0], ['Karim', 0],
  ['Paul', 0], ['Victor', 0], ['Dylan', 0], ['Wassim', 0]].map(([n, f]) => ({n, f: f === 1}));
function noms(R, k){
  const vus = new Set(), r = [];
  for (const p of R.shuffle(NOMS)){ if (!vus.has(p.n[0])){ vus.add(p.n[0]); r.push(p); if (r.length === k) break; } }
  return r;
}
const VILLES = ['Brest', 'Lille', 'Metz', 'Nice', 'Lens', 'Reims', 'Nantes', 'Rennes', 'Lyon', 'Caen', 'Dijon', 'Tours',
  'Laval', 'Niort', 'Annecy', 'Rodez', 'Angers', 'Amiens'];
const BAREME3 = 'Une victoire rapporte 3 points, un match nul 1 point à chacune des deux équipes, une défaite 0 point.';
const BAREME2 = 'Une victoire rapporte 2 points, un match nul 1 point à chacune des deux équipes, une défaite 0 point.';

/* Choix numériques, avec le texte des pièges seulement pour les distracteurs réellement affichés.
   l : [[valeur, texte du piège ou null]] ; o : {min, max, fmt}. */
function fin(a, l, o){
  const opt = o || {}, lo = opt.min == null ? 1 : opt.min, hi = opt.max == null ? Infinity : opt.max, fmt = opt.fmt || (v => nb(v));
  const okv = v => v != null && isFinite(v) && Math.round(v) === v && v >= lo && v <= hi;
  const ok = l.filter(x => okv(x[0]) && x[0] !== a);
  const choix = qcm(fmt(a), ok.map(x => fmt(x[0])), k => { const v = a + (k % 2 ? (k + 1) / 2 : -k / 2); return okv(v) ? fmt(v) : null; });
  const dans = new Set(choix.map(norm)), vus = new Set([norm(fmt(a))]), t = [];
  ok.forEach(([v, s]) => { const z = norm(fmt(v)); if (dans.has(z) && !vus.has(z)){ vus.add(z); if (s) t.push(s); } });
  return {a: fmt(a), choix, piege: t.length ? 'Piège : ' + t.join(' ; ') + '.' : ''};
}
/* Choix parmi des noms : la bonne réponse puis les distracteurs dans l'ordre de préférence. */
function finNom(a, cands, pieges){
  const choix = qcm(a, cands, () => null), t = [];
  if (pieges) choix.slice(1).forEach(c => { if (pieges[c]) t.push(pieges[c]); });
  return {a, choix, piege: t.length ? 'Piège : ' + t.join(' ; ') + '.' : ''};
}
const sortie = (q, f, expl) => ({q, a: f.a, accept: null, choix: f.choix, expl: (expl + ' ' + f.piege).trim()});

function valide(ex){
  if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || typeof ex.expl !== 'string') return false;
  if (!Array.isArray(ex.choix) || ex.choix.length !== 4 || ex.choix.some(c => typeof c !== 'string' || !c.trim())) return false;
  const n = ex.choix.map(norm);
  if (new Set(n).size !== 4 || n.filter(x => x === norm(ex.a)).length !== 1) return false;
  if (/\d-\d/.test(ex.q) || /\d\.\d/.test(ex.q + ' ' + ex.choix.join(' '))) return false;
  if (/NaN|undefined|Infinity|null|\[object/.test(ex.q + ' ' + ex.expl + ' ' + ex.choix.join(' '))) return false;
  const val = s => { const m = /^([+-]?\d+(?:\.\d+)?)$/.exec(norm(s)); return m ? +m[1] : null; };
  const v = n.map(val).filter(x => x !== null);
  return new Set(v).size === v.length;
}

/* Tournoi aléatoire où chaque équipe rencontre une fois chacune des autres (barème W, 1, 0). */
function simule(R, n, W, pNul){
  const pts = new Array(n).fill(0); let d = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++){
    if (R.int(1, 100) <= pNul){ pts[i]++; pts[j]++; d++; }
    else if (R.int(0, 1) === 0) pts[i] += W; else pts[j] += W;
  }
  return {pts, d};
}

/* =====================================================================
   COMPARAISONS SIMPLES (chaînes) : niveaux 1 et 2
   ===================================================================== */
const CMP = {
  taille: {
    intro: n => Cap(MOTS[n]) + ' amis comparent leur taille ; aucun n\'a la même taille qu\'un autre.',
    haut: (X, Y) => X.n + ' est plus grand' + fe(X) + ' ' + que(Y) + '.',
    bas: (X, Y) => X.n + ' est plus petit' + fe(X) + ' ' + que(Y) + '.',
    qMax: 'Qui est la personne la plus grande ?', qMin: 'Qui est la personne la plus petite ?',
    qH: k => 'Si on les range de la plus grande à la plus petite, qui est en ' + rg(k) + ' position ?',
    qB: k => 'Si on les range de la plus petite à la plus grande, qui est en ' + rg(k) + ' position ?',
    sens: '« plus grand que »', frise: 'de la plus grande à la plus petite', sep: ' > '
  },
  age: {
    intro: n => Cap(MOTS[n]) + ' cousins comparent leur âge ; aucun n\'a le même âge qu\'un autre.',
    haut: (X, Y) => X.n + ' est plus âgé' + fe(X) + ' ' + que(Y) + '.',
    bas: (X, Y) => X.n + ' est plus jeune ' + que(Y) + '.',
    qMax: 'Qui est la personne la plus âgée ?', qMin: 'Qui est la personne la plus jeune ?',
    qH: k => 'Si on les range de la plus âgée à la plus jeune, qui est en ' + rg(k) + ' position ?',
    qB: k => 'Si on les range de la plus jeune à la plus âgée, qui est en ' + rg(k) + ' position ?',
    sens: '« plus âgé que »', frise: 'de la plus âgée à la plus jeune', sep: ' > '
  },
  note: {
    intro: n => Cap(MOTS[n]) + ' élèves comparent leur note à un devoir ; il n\'y a pas d\'égalité.',
    haut: (X, Y) => X.n + ' a eu une meilleure note ' + que(Y) + '.',
    bas: (X, Y) => X.n + ' a eu une moins bonne note ' + que(Y) + '.',
    qMax: 'Qui a eu la meilleure note ?', qMin: 'Qui a eu la moins bonne note ?',
    qH: k => 'Si on les classe de la meilleure note à la moins bonne, qui est en ' + rg(k) + ' position ?',
    qB: k => 'Si on les classe de la moins bonne note à la meilleure, qui est en ' + rg(k) + ' position ?',
    sens: '« meilleure note que »', frise: 'de la meilleure note à la moins bonne', sep: ' > '
  },
  course: {
    intro: n => Cap(MOTS[n]) + ' amis ont couru un cross, sans ex aequo.',
    haut: (X, Y) => X.n + ' est arrivé' + fe(X) + ' avant ' + Y.n + '.',
    bas: (X, Y) => X.n + ' est arrivé' + fe(X) + ' après ' + Y.n + '.',
    qMax: 'Qui est arrivé en premier ?', qMin: 'Qui est arrivé en dernier ?',
    qH: k => 'Qui a terminé à la ' + rg(k) + ' place ?',
    qB: k => 'En partant du dernier arrivé, qui est en ' + rg(k) + ' position ?',
    sens: '« arrivé avant »', frise: 'du premier arrivé au dernier', sep: ', '
  }
};
/* ordre[i] = personne en position i (0 = la plus grande, la plus âgée, la première arrivée…). */
function phrasesChaine(R, c, ordre, extra){
  const paires = [];
  for (let i = 0; i + 1 < ordre.length; i++) paires.push([ordre[i], ordre[i + 1]]);
  for (let t = 0; t < (extra || 0); t++){
    const i = R.int(0, ordre.length - 3), j = R.int(i + 2, ordre.length - 1);
    if (!paires.some(p => p[0] === ordre[i] && p[1] === ordre[j])) paires.push([ordre[i], ordre[j]]);
  }
  return R.shuffle(paires).map(([h, b]) => '- ' + (R.int(0, 1) === 0 ? c.haut(h, b) : c.bas(b, h)));
}

function g1chaine(R){
  const c = CMP[R.pick(Object.keys(CMP))], ordre = noms(R, 4), max = R.int(0, 1) === 0;
  const a = max ? ordre[0] : ordre[3], opp = max ? ordre[3] : ordre[0];
  const q = c.intro(4) + ' On sait que :\n' + phrasesChaine(R, c, ordre, 0).join('\n') + '\n' + (max ? c.qMax : c.qMin);
  const f = finNom(a.n, [opp.n, ordre[1].n, ordre[2].n], {[opp.n]: opp.n + ' est à l\'autre bout de la frise : relis bien la question'});
  return sortie(q, f, 'Récris chaque phrase dans le même sens, ' + c.sens + ', puis enchaîne les trois phrases sur une frise. Ordre ' + c.frise + ' : ' + ordre.map(p => p.n).join(c.sep) + '. La réponse est donc ' + a.n + '.');
}
function g2chaine(R){
  const c = CMP[R.pick(Object.keys(CMP))], ordre = noms(R, 5), k = R.pick([2, 3, 4]), haut = R.int(0, 2) > 0;
  const idx = haut ? k - 1 : 5 - k, a = ordre[idx];
  const miroir = ordre[4 - idx], cands = [];
  if (miroir !== a) cands.push(miroir.n);
  [idx - 1, idx + 1, idx - 2, idx + 2].forEach(i => { if (i >= 0 && i < 5) cands.push(ordre[i].n); });
  const q = c.intro(5) + ' On sait que :\n' + phrasesChaine(R, c, ordre, R.int(0, 1)).join('\n') + '\n' + (haut ? c.qH(k) : c.qB(k));
  const pieges = {}; if (miroir !== a) pieges[miroir.n] = miroir.n + ' est ' + rg(k) + ' en partant de l\'autre bout';
  const f = finNom(a.n, cands, pieges);
  return sortie(q, f, 'Récris chaque phrase dans le même sens, ' + c.sens + ', puis place les cinq personnes sur une frise. Ordre ' + c.frise + ' : ' + ordre.map(p => p.n).join(c.sep) + '. ' +
    (haut ? 'En ' + rg(k) + ' position' : 'En ' + rg(k) + ' position en partant de l\'autre bout') + ', on trouve ' + a.n + '.');
}

/* =====================================================================
   ÉNIGMES D'ORDRE (indices variés) : niveaux 3 à 5
   ===================================================================== */
const PERM = {};
function perms(n){
  if (PERM[n]) return PERM[n];
  const res = [], a = range(0, n - 1);
  (function rec(k){ if (k === n){ res.push(a.slice()); return; } for (let i = k; i < n; i++){ [a[k], a[i]] = [a[i], a[k]]; rec(k + 1); [a[k], a[i]] = [a[i], a[k]]; } })(0);
  return (PERM[n] = res);
}
/* p[x] = position (0 = premier) de la personne x. */
function teste(c, p, n){
  switch (c.t){
    case 'av': return p[c.x] < p[c.y];
    case 'ja': return p[c.y] === p[c.x] + 1;
    case 'pl': return p[c.x] === c.k;
    case 'np': return p[c.x] !== c.k;
    case 'nn': return p[c.x] !== 0 && p[c.x] !== n - 1;
    case 'en': return Math.abs(p[c.x] - p[c.y]) === c.j + 1;
    case 'co': return Math.abs(p[c.x] - p[c.y]) === 1;
    case 'pc': return Math.abs(p[c.x] - p[c.y]) !== 1;
  }
  return false;
}
function indiceAlea(R, H, n, types){
  const t = R.pick(types), x = R.int(0, n - 1), autres = range(0, n - 1).filter(y => y !== x);
  const parDist = f => { const l = autres.filter(y => f(Math.abs(H[y] - H[x]))); return l.length ? R.pick(l) : -1; };
  let y;
  switch (t){
    case 'av': y = R.pick(autres); return H[x] < H[y] ? {t, x, y} : {t, x: y, y: x};
    case 'ja': y = H.indexOf(H[x] + 1); return y < 0 ? null : {t, x, y};
    case 'pl': return {t, x, k: H[x]};
    case 'np': { let k = R.int(0, n - 2); if (k >= H[x]) k++; return {t, x, k}; }
    case 'nn': return (H[x] === 0 || H[x] === n - 1) ? null : {t, x};
    case 'en': y = parDist(d => d >= 2 && d <= 4); return y < 0 ? null : {t, x: Math.min(x, y), y: Math.max(x, y), j: Math.abs(H[y] - H[x]) - 1};
    case 'co': y = parDist(d => d === 1); return y < 0 ? null : {t, x: Math.min(x, y), y: Math.max(x, y)};
    case 'pc': y = parDist(d => d !== 1); return y < 0 ? null : {t, x: Math.min(x, y), y: Math.max(x, y)};
  }
  return null;
}
const cleIndice = c => [c.t, c.x, c.y, c.k, c.j].join('|');
const CTXO = {
  course: {
    intro: (n, note, liste) => Cap(MOTS[n]) + ' amis, ' + liste + ', ont couru un cross, sans ex aequo.' + (note ? ' « Avant » ne veut pas forcément dire « juste avant ».' : '') + ' On sait que :',
    av: (R, X, Y) => (R.int(0, 1) === 0 ? X.n + ' est arrivé' + fe(X) + ' avant ' + Y.n + '.' : Y.n + ' est arrivé' + fe(Y) + ' après ' + X.n + '.'),
    ja: (R, X, Y) => (R.int(0, 1) === 0 ? X.n + ' est arrivé' + fe(X) + ' juste avant ' + Y.n + '.' : Y.n + ' est arrivé' + fe(Y) + ' juste après ' + X.n + '.'),
    pl: (X, k) => X.n + ' a terminé à la ' + rg(k + 1) + ' place.',
    np: (X, k) => X.n + ' n\'a pas terminé à la ' + rg(k + 1) + ' place.',
    nn: X => X.n + ' n\'a terminé ni ' + (X.f ? 'première' : 'premier') + ' ni ' + (X.f ? 'dernière' : 'dernier') + '.',
    en: (X, Y, j) => 'Exactement ' + j + ' ' + (j > 1 ? 'coureurs sont arrivés' : 'coureur est arrivé') + ' entre ' + X.n + ' et ' + Y.n + '.',
    co: (X, Y) => X.n + ' et ' + Y.n + ' sont ' + (X.f && Y.f ? 'arrivées l\'une juste après l\'autre.' : 'arrivés l\'un juste après l\'autre.'),
    pc: (X, Y) => X.n + ' et ' + Y.n + ' ne sont pas ' + (X.f && Y.f ? 'arrivées l\'une juste après l\'autre.' : 'arrivés l\'un juste après l\'autre.'),
    qQui: k => 'Qui a terminé à la ' + rg(k + 1) + ' place ?',
    qOu: X => 'À quelle place ' + X.n + ' a-t-' + il(X) + ' terminé ?',
    ordre: 'ordre d\'arrivée', ordres: 'ordres d\'arrivée',
    repQui: (k, X) => 'la ' + rg(k + 1) + ' place revient à ' + X.n, repOu: (X, k) => X.n + ' a terminé à la ' + rg(k + 1) + ' place'
  },
  file: {
    intro: (n, note, liste) => Cap(MOTS[n]) + ' personnes, ' + liste + ', attendent les unes derrière les autres dans une file ; la 1re position est la tête de la file.' + (note ? ' « Devant » ne veut pas forcément dire « juste devant ».' : '') + ' On sait que :',
    av: (R, X, Y) => (R.int(0, 1) === 0 ? X.n + ' est devant ' + Y.n + '.' : Y.n + ' est derrière ' + X.n + '.'),
    ja: (R, X, Y) => (R.int(0, 1) === 0 ? X.n + ' est juste devant ' + Y.n + '.' : Y.n + ' est juste derrière ' + X.n + '.'),
    pl: (X, k) => X.n + ' est en ' + rg(k + 1) + ' position.',
    np: (X, k) => X.n + ' n\'est pas en ' + rg(k + 1) + ' position.',
    nn: X => X.n + ' n\'est ni en tête ni en dernière position.',
    en: (X, Y, j) => 'Il y a exactement ' + j + ' ' + pl(j, 'personne', 'personnes') + ' entre ' + X.n + ' et ' + Y.n + '.',
    co: (X, Y) => X.n + ' et ' + Y.n + ' sont ' + (X.f && Y.f ? 'l\'une juste derrière l\'autre.' : 'l\'un juste derrière l\'autre.'),
    pc: (X, Y) => X.n + ' et ' + Y.n + ' ne sont pas ' + (X.f && Y.f ? 'l\'une juste derrière l\'autre.' : 'l\'un juste derrière l\'autre.'),
    qQui: k => 'Qui est en ' + rg(k + 1) + ' position ?',
    qOu: X => 'En quelle position se trouve ' + X.n + ' ?',
    ordre: 'ordre de la file (de la tête à la fin)', ordres: 'ordres de la file',
    repQui: (k, X) => 'la ' + rg(k + 1) + ' position revient à ' + X.n, repOu: (X, k) => X.n + ' est en ' + rg(k + 1) + ' position'
  }
};
function rendu(R, c, ctx, N){
  switch (c.t){
    case 'av': return ctx.av(R, N[c.x], N[c.y]);
    case 'ja': return ctx.ja(R, N[c.x], N[c.y]);
    case 'pl': return ctx.pl(N[c.x], c.k);
    case 'np': return ctx.np(N[c.x], c.k);
    case 'nn': return ctx.nn(N[c.x]);
    case 'en': return R.int(0, 1) === 0 ? ctx.en(N[c.x], N[c.y], c.j) : ctx.en(N[c.y], N[c.x], c.j);
    case 'co': return R.int(0, 1) === 0 ? ctx.co(N[c.x], N[c.y]) : ctx.co(N[c.y], N[c.x]);
    case 'pc': return R.int(0, 1) === 0 ? ctx.pc(N[c.x], N[c.y]) : ctx.pc(N[c.y], N[c.x]);
  }
  return '';
}
/* cfg : {n, types, min, max, exige} ; renvoie null si l'énigme tirée ne convient pas (on retente). */
function enigme(R, cfg){
  const n = cfg.n, P = perms(n), H = R.shuffle(range(0, n - 1)), qui = R.int(0, 1) === 0, cible = R.int(0, n - 1);
  const val = p => (qui ? p.indexOf(cible) : p[cible]);
  const masque = c => P.map(p => teste(c, p, n));
  const unique = ok => { let v = null; for (let i = 0; i < P.length; i++) if (ok[i]){ const w = val(P[i]); if (v === null) v = w; else if (w !== v) return false; } return v !== null; };
  const et2 = (ms) => P.map((_, i) => ms.every(m => m[i]));
  const cl = [], ms = [], cles = new Set(); let ok = P.map(() => true);
  for (let essai = 0; essai < 120 && !unique(ok); essai++){
    const c = indiceAlea(R, H, n, cfg.types);
    if (!c || cles.has(cleIndice(c))) continue;
    if (c.t === 'pl' && (qui ? c.k === cible : c.x === cible)) continue;
    if ((c.t === 'pl' || c.t === 'np') && cl.filter(d => d.t === c.t).length >= 1) continue;   // une seule place donnée : sinon l'énigme devient une simple élimination
    if (c.t === 'nn' && cl.filter(d => d.t === 'nn').length >= 2) continue;
    const m = masque(c), nv = ok.map((b, i) => b && m[i]);
    if (nv.every((b, i) => b === ok[i])) continue;
    cl.push(c); ms.push(m); cles.add(cleIndice(c)); ok = nv;
  }
  if (!unique(ok)) return null;
  /* réduction : on retire tout indice inutile, dans un ordre aléatoire */
  let idx = R.shuffle(range(0, cl.length - 1));
  for (let i = 0; i < idx.length;){
    const reste = idx.filter((_, j) => j !== i);
    if (unique(et2(reste.map(k => ms[k])))) idx = reste; else i++;
  }
  if (idx.length < cfg.min || idx.length > cfg.max) return null;
  const indices = idx.map(k => cl[k]), masques = idx.map(k => ms[k]);
  if (cfg.exige && !indices.some(c => cfg.exige.indexOf(c.t) >= 0)) return null;
  const okF = et2(masques), sols = P.filter((_, i) => okF[i]), a = val(H);
  /* distracteurs : valeurs obtenues quand on oublie un indice */
  const freq = new Map();
  masques.forEach((_, j) => { const okj = et2(masques.filter((__, i) => i !== j)); P.forEach((p, i) => { if (okj[i]){ const w = val(p); if (w !== a) freq.set(w, (freq.get(w) || 0) + 1); } }); });
  const autres = R.shuffle(range(0, n - 1).filter(v => v !== a)).sort((u, v) => (freq.get(v) || 0) - (freq.get(u) || 0));
  const ctx = CTXO[cfg.ctx || R.pick(['course', 'file'])], N = noms(R, n);
  const note = indices.some(c => c.t === 'av') && cfg.types.indexOf('ja') >= 0;
  const liste = et(N.map(p => p.n).slice().sort((u, w) => u.localeCompare(w, 'fr')));
  const q = ctx.intro(n, note, liste) + '\n' + indices.map(c => '- ' + rendu(R, c, ctx, N)).join('\n') + '\n' + (qui ? ctx.qQui(cible) : ctx.qOu(N[cible]));
  const ordreTxt = p => range(0, n - 1).map(k => N[p.indexOf(k)].n).join(', ');
  const fmt = v => (qui ? N[v].n : rg(v + 1));
  const f = finNom(fmt(a), autres.map(fmt));
  const repTxt = qui ? ctx.repQui(cible, N[a]) : ctx.repOu(N[cible], a);
  const pres = t => indices.some(c => c.t === t);
  const forts = [pres('pl') && 'la place connue', (pres('ja') || pres('co')) && 'les « juste »', pres('en') && 'les « exactement … entre »', pres('nn') && 'les « ni … ni … »'].filter(Boolean);
  const debut = 'Reporte d\'abord sur une frise de ' + n + ' cases ' + (forts.length ? et(forts) : 'les phrases qui relient deux personnes') + ', puis élimine les cas qui contredisent les autres indices.';
  const fin2 = sols.length === 1 ? ' Le seul ' + ctx.ordre + ' qui respecte tous les indices est : ' + ordreTxt(sols[0]) + ' (vérifie chaque phrase une à une). Donc ' + repTxt + '.'
    : ' ' + Cap(MOTS[sols.length] || String(sols.length)) + ' ' + ctx.ordres + ' respectent tous les indices, par exemple ' + ordreTxt(sols[0]) + ' et ' + ordreTxt(sols[1]) + ', mais dans tous, ' + repTxt + '.';
  return sortie(q, f, debut + fin2);
}
const g3ordre = R => enigme(R, {n: 5, types: ['av', 'av', 'ja', 'pl', 'nn'], min: 3, max: 5});
function plusieurs(R, cfg, k){ for (let t = 0; t < k; t++){ const e = enigme(R, cfg); if (e) return e; } return null; }
const g4ordre = R => plusieurs(R, {n: R.pick([5, 6]), types: ['av', 'ja', 'pl', 'nn', 'en', 'co'], min: 4, max: 6, exige: ['en', 'co']}, 4);
const g5ordre = R => plusieurs(R, {n: 6, types: ['av', 'ja', 'nn', 'en', 'co', 'pc', 'np', 'pl'], min: 5, max: 7, exige: ['pc', 'np']}, 8);

/* =====================================================================
   FRISES AVEC ÉCARTS : niveaux 3 à 5
   ===================================================================== */
const FRI = {
  taille: {
    intro: n => Cap(MOTS[n]) + ' amis comparent leur taille :',
    cl: (X, Y, d, plus) => X.n + ' mesure ' + d + ' cm de ' + (plus ? 'plus' : 'moins') + ' ' + que(Y) + '.',
    u: v => nb(v) + ' cm',
    qMax: 'Qui est le plus grand ?', qMin: 'Qui est le plus petit ?',
    qRang: k => 'Si on les range du plus grand au plus petit, qui est en ' + rg(k) + ' position ?',
    qExt: 'Quel est l\'écart de taille entre le plus grand et le plus petit ?',
    qXY: (X, Y) => 'Quel est l\'écart de taille entre ' + X.n + ' et ' + Y.n + ' ?',
    qCombien: X => 'Combien de ces amis sont plus grands ' + que(X) + ' ?',
    ordre: 'Du plus grand au plus petit'
  },
  age: {
    intro: n => 'On compare l\'âge de ' + MOTS[n] + ' cousins :',
    cl: (X, Y, d, plus) => X.n + ' a ' + d + ' ' + pl(d, 'an', 'ans') + ' de ' + (plus ? 'plus' : 'moins') + ' ' + que(Y) + '.',
    u: v => nb(v) + ' ' + pl(v, 'an', 'ans'),
    qMax: 'Qui est le plus âgé ?', qMin: 'Qui est le plus jeune ?',
    qRang: k => 'Si on les range du plus âgé au plus jeune, qui est en ' + rg(k) + ' position ?',
    qExt: 'Quel est l\'écart d\'âge entre le plus âgé et le plus jeune ?',
    qXY: (X, Y) => 'Quel est l\'écart d\'âge entre ' + X.n + ' et ' + Y.n + ' ?',
    qCombien: X => 'Combien de ces cousins sont plus âgés ' + que(X) + ' ?',
    ordre: 'Du plus âgé au plus jeune'
  },
  argent: {
    intro: n => Cap(MOTS[n]) + ' amis comparent le contenu de leur tirelire :',
    cl: (X, Y, d, plus) => X.n + ' a ' + d + ' € de ' + (plus ? 'plus' : 'moins') + ' ' + que(Y) + '.',
    u: v => nb(v) + ' €',
    qMax: 'Qui a le plus d\'argent ?', qMin: 'Qui a le moins d\'argent ?',
    qRang: k => 'Si on les range de celui qui a le plus d\'argent à celui qui en a le moins, qui est en ' + rg(k) + ' position ?',
    qExt: 'Quel est l\'écart entre la plus grosse somme et la plus petite ?',
    qXY: (X, Y) => 'Quel est l\'écart entre les sommes ' + de(X) + ' et ' + de(Y) + ' ?',
    qCombien: X => 'Combien de ces amis ont plus d\'argent ' + que(X) + ' ?',
    ordre: 'De la plus grosse somme à la plus petite'
  },
  score: {
    intro: n => 'À la fin d\'une partie de fléchettes, ' + MOTS[n] + ' joueurs comparent leurs scores :',
    cl: (X, Y, d, plus) => X.n + ' a marqué ' + d + ' ' + pl(d, 'point', 'points') + ' de ' + (plus ? 'plus' : 'moins') + ' ' + que(Y) + '.',
    u: v => ptsTxt(v),
    qMax: 'Qui a le meilleur score ?', qMin: 'Qui a le moins bon score ?',
    qRang: k => 'Si on les classe du meilleur score au moins bon, qui est en ' + rg(k) + ' position ?',
    qExt: 'Quel est l\'écart entre le meilleur score et le moins bon ?',
    qXY: (X, Y) => 'Quel est l\'écart entre les scores ' + de(X) + ' et ' + de(Y) + ' ?',
    qCombien: X => 'Combien de joueurs ont marqué plus de points ' + que(X) + ' ?',
    ordre: 'Du meilleur score au moins bon'
  }
};
function frise(R, n, kinds){
  const c = FRI[R.pick(Object.keys(FRI))], N = noms(R, n), v = [0], par = [-1], ar = [];
  for (let i = 1; i < n; i++){
    let ok = false;
    for (let t = 0; t < 30 && !ok; t++){
      const j = R.int(0, i - 1), d = R.int(1, 9) * (R.int(0, 1) ? 1 : -1), w = v[j] + d;
      if (v.indexOf(w) < 0){ v.push(w); par.push(j); ar.push([i, j, d]); ok = true; }
    }
    if (!ok) return null;
  }
  const ordre = range(0, n - 1).sort((x, y) => v[y] - v[x]);   // du plus haut au plus bas
  const mn = v[ordre[n - 1]];
  const lignes = R.shuffle(ar).map(([i, j, d]) => '- ' + (R.int(0, 1) === 0 ? c.cl(N[i], N[j], Math.abs(d), d > 0) : c.cl(N[j], N[i], Math.abs(d), d < 0)));
  const placeTxt = 'En prenant ' + N[ordre[n - 1]].n + ' comme repère (0) : ' + ordre.slice().reverse().map(i => N[i].n + ' ' + (v[i] - mn)).join(', ') + '. ' + c.ordre + ' : ' + ordre.map(i => N[i].n).join(', ') + '.';
  const debut = 'Place chaque personne sur une frise graduée en partant de l\'une d\'elles, en reportant chaque écart dans le bon sens, puis lis les positions.';
  const kind = R.pick(kinds), intro = c.intro(n) + '\n' + lignes.join('\n') + '\n';
  /* chemin dans l'arbre des indices entre deux personnes */
  const chemin = (x, y) => {
    const anc = z => { const l = [z]; while (par[z] >= 0){ z = par[z]; l.push(z); } return l; };
    const ax = anc(x), ay = anc(y), com = ax.find(z => ay.indexOf(z) >= 0);
    const ar2 = [];
    for (let z = x; z !== com; z = par[z]) ar2.push(Math.abs(v[z] - v[par[z]]));
    for (let z = y; z !== com; z = par[z]) ar2.push(Math.abs(v[z] - v[par[z]]));
    return ar2;
  };
  if (kind === 'max' || kind === 'min'){
    const a = kind === 'max' ? ordre[0] : ordre[n - 1], b = kind === 'max' ? ordre[1] : ordre[n - 2];
    const f = finNom(N[a].n, [N[b].n].concat(R.shuffle(range(0, n - 1).filter(i => i !== a && i !== b)).map(i => N[i].n)));
    return sortie(intro + (kind === 'max' ? c.qMax : c.qMin), f, debut + ' ' + placeTxt + ' La réponse est ' + N[a].n + '.');
  }
  if (kind === 'rang'){
    const k = R.int(2, n - 1), a = ordre[k - 1];
    const cands = [ordre[n - k], ordre[k - 2], ordre[k]].filter(i => i !== a && i != null).concat(R.shuffle(ordre)).map(i => N[i].n);
    const pieges = {}; if (ordre[n - k] !== a) pieges[N[ordre[n - k]].n] = N[ordre[n - k]].n + ' est ' + rg(k) + ' en partant de l\'autre bout';
    const f = finNom(N[a].n, cands, pieges);
    return sortie(intro + c.qRang(k), f, debut + ' ' + placeTxt + ' En ' + rg(k) + ' position : ' + N[a].n + '.');
  }
  if (kind === 'ext'){
    const G = v[ordre[0]] - mn, S = sum(ar.map(x => Math.abs(x[2]))), D = Math.max.apply(null, ar.map(x => Math.abs(x[2])));
    const f = fin(G, [[S, c.u(S) + ' additionne tous les écarts sans tenir compte de leur sens'], [D, c.u(D) + ' est seulement le plus grand écart donné'], [G + 1, null], [G - 1, null]], {fmt: c.u});
    return sortie(intro + c.qExt, f, debut + ' ' + placeTxt + ' Écart : ' + (v[ordre[0]] - mn) + ' − 0 = ' + c.u(G) + '.');
  }
  if (kind === 'xy'){
    let x, y, ch;
    for (let t = 0; t < 30; t++){ x = R.int(0, n - 1); y = R.int(0, n - 1); if (x !== y){ ch = chemin(x, y); if (ch.length >= (n >= 6 ? 3 : 2)) break; } ch = null; }
    if (!ch) return null;
    const G = Math.abs(v[x] - v[y]), S = sum(ch);
    const f = fin(G, [[S, c.u(S) + ' additionne les écarts sans tenir compte de leur sens'], [G + 2, null], [G - 2, null], [G + 1, null]], {fmt: c.u});
    return sortie(intro + c.qXY(N[x], N[y]), f, debut + ' ' + placeTxt + ' Écart entre ' + N[x].n + ' et ' + N[y].n + ' : ' + Math.max(v[x] - mn, v[y] - mn) + ' − ' + Math.min(v[x] - mn, v[y] - mn) + ' = ' + c.u(G) + '.');
  }
  /* combien sont au-dessus de X */
  const x = ordre[R.int(1, n - 2)], cnt = ordre.indexOf(x);
  const f = fin(cnt, [[n - 1 - cnt, (n - 1 - cnt) + ' compte ceux qui sont en dessous'], [cnt + 1, (cnt + 1) + ' compte aussi ' + N[x].n], [cnt - 1, null]], {min: 0, max: n - 1});
  return sortie(intro + c.qCombien(N[x]), f, debut + ' ' + placeTxt + ' Au-dessus de ' + N[x].n + ' : ' + (cnt ? et(ordre.slice(0, cnt).map(i => N[i].n)) : 'personne') + ', soit ' + cnt + '.');
}
const g3frise = R => frise(R, 4, ['max', 'min', 'rang', 'ext']);
const g4frise = R => frise(R, 5, ['rang', 'ext', 'xy', 'xy']);
const g5frise = R => frise(R, 6, ['xy', 'xy', 'combien', 'rang', 'ext']);

/* =====================================================================
   NIVEAU 1
   ===================================================================== */
const RR_CTX = [
  {intro: n => 'Dans un championnat, ' + n + ' équipes s\'affrontent : chaque équipe rencontre une seule fois chacune des autres.', qTot: 'Combien de matchs sont joués au total ?', qUn: 'Combien de matchs chaque équipe joue-t-elle ?', quoi: 'matchs'},
  {intro: n => 'Lors d\'un tournoi d\'échecs, ' + n + ' joueurs s\'affrontent : chacun joue exactement une partie contre chacun des autres.', qTot: 'Combien de parties sont jouées au total ?', qUn: 'Combien de parties chaque joueur joue-t-il ?', quoi: 'parties'},
  {intro: n => 'À une réunion, ' + n + ' personnes se saluent : chacune serre une seule fois la main de chacune des autres.', qTot: 'Combien de poignées de main sont échangées au total ?', qUn: 'Combien de mains chaque personne serre-t-elle ?', quoi: 'poignées de main'},
  {intro: n => 'Dans un club, ' + n + ' joueuses de ping-pong organisent un tournoi où chacune affronte une seule fois chacune des autres.', qTot: 'Combien de matchs sont joués au total ?', qUn: 'Combien de matchs chaque joueuse dispute-t-elle ?', quoi: 'matchs'}
];
function g1matchs(R){
  const n = R.int(4, 12), M = C2(n), c = R.pick(RR_CTX);
  if (R.int(1, 5) === 1){
    const a = n - 1;
    const f = fin(a, [[n, n + ' compte aussi une rencontre avec soi-même, qui n\'existe pas'], [M, M + ' est le nombre total de ' + c.quoi + ', pas celui d\'un seul participant'], [n - 2, null]]);
    return sortie(c.intro(n) + ' ' + c.qUn, f, 'Un participant rencontre tous les autres, mais pas lui-même. Il y a ' + n + ' participants, donc chacun en rencontre ' + n + ' − 1 = ' + a + '.');
  }
  const f = fin(M, [[n * (n - 1), n * (n - 1) + ' oublie de diviser par 2 : chaque rencontre est alors comptée deux fois, une fois pour chacun des deux participants'],
    [n * (n + 1) / 2, n * (n + 1) / 2 + ' revient à calculer 1 + 2 + … + ' + n + ' au lieu de 1 + 2 + … + ' + (n - 1)],
    [n * n, n * n + ' fait jouer chaque participant contre lui-même'], [n - 1, (n - 1) + ' est le nombre de rencontres d\'un seul participant']]);
  return sortie(c.intro(n) + ' ' + c.qTot, f, 'Chaque participant rencontre tous les autres une fois, et chaque rencontre concerne deux participants : on calcule n × (n − 1), puis on divise par 2. Ici, chacun des ' + n + ' participants rencontre les ' + (n - 1) + ' autres : ' + n + ' × ' + (n - 1) + ' = ' + n * (n - 1) + ', et chaque rencontre a été comptée deux fois, donc ' + n * (n - 1) + ' ÷ 2 = ' + M + '.');
}
function g1rangs(R){
  const [X, Y] = noms(R, 2), v = R.int(1, 4);
  if (v === 1){
    const r = R.int(2, 20), s = R.int(2, 20), a = r + s - 1;
    const c = R.pick([
      {q: 'Dans une file d\'attente, ' + X.n + ' est ' + rg(r) + ' en partant de l\'avant et ' + rg(s) + ' en partant de l\'arrière. Combien de personnes compte la file ?', qui: X.n, u: 'personnes', av: 'devant ' + lui(X), ar: 'derrière ' + lui(X)},
      {q: 'Dans une rangée de cinéma entièrement occupée, ' + X.n + ' est assis' + fe(X) + ' à la ' + rg(r) + ' place en partant de la gauche et à la ' + rg(s) + ' place en partant de la droite. Combien de personnes sont assises dans cette rangée ?', qui: X.n, u: 'personnes', av: 'à sa gauche', ar: 'à sa droite'},
      {q: 'Au classement d\'un cross, sans ex aequo, ' + X.n + ' est ' + rg(r) + ' en partant du premier et ' + rg(s) + ' en partant du dernier. Combien de coureurs sont classés ?', qui: X.n, u: 'coureurs', av: 'devant ' + lui(X), ar: 'derrière ' + lui(X)},
      {q: 'Sur une étagère, un livre rouge est le ' + rg(r) + ' en partant de la gauche et le ' + rg(s) + ' en partant de la droite. Combien de livres y a-t-il sur l\'étagère ?', qui: 'le livre rouge', u: 'livres', av: 'à sa gauche', ar: 'à sa droite'}
    ]);
    const f = fin(a, [[r + s, (r + s) + ' compte ' + c.qui + ' deux fois (une fois dans chaque rang)'], [r + s - 2, (r + s - 2) + ' oublie ' + c.qui], [r + s + 1, null]]);
    return sortie(c.q, f, 'Les deux rangs comptent tous les deux ' + c.qui + ' : on les additionne puis on retire 1. Il y a ' + (r - 1) + ' ' + c.u + ' ' + c.av + ' et ' + (s - 1) + ' ' + c.ar + ', donc ' + (r - 1) + ' + ' + (s - 1) + ' + 1 = ' + a + '.');
  }
  if (v === 2){
    const N = R.int(15, 40), r = R.int(2, N - 3), a = N - r + 1;
    const f = fin(a, [[N - r, rg(N - r) + ' oublie de compter ' + X.n + ' ' + lui(X) + '-même'], [N - r + 2, null], [r, rg(r) + ' est son rang en partant du premier']], {fmt: rg});
    return sortie('Un classement compte ' + N + ' élèves, sans ex aequo. ' + X.n + ' est ' + rg(r) + '. Quel est son rang en partant du dernier ?', f,
      'Compte les élèves classés derrière ' + X.n + ', puis ajoute ' + X.n + '. Derrière ' + lui(X) + ' : ' + N + ' − ' + r + ' = ' + (N - r) + ' élèves, donc ' + X.n + ' est ' + rg(a) + ' en partant du dernier.');
  }
  if (v === 3){
    const N = R.int(12, 40), r = R.int(2, N - 2), a = N - r;
    const f = fin(a, [[N - r + 1, (N - r + 1) + ' compte aussi ' + X.n], [r - 1, (r - 1) + ' est le nombre de coureurs arrivés avant ' + lui(X)], [N - r - 1, null]]);
    return sortie('Dans une course de ' + N + ' coureurs, sans ex aequo, ' + X.n + ' termine ' + rg(r) + '. Combien de coureurs sont arrivés après ' + lui(X) + ' ?', f,
      'Retire du total les coureurs arrivés avant ' + X.n + ' et ' + X.n + ' ' + lui(X) + '-même. ' + N + ' − ' + (r - 1) + ' − 1 = ' + a + '.');
  }
  const r = R.int(2, 15), s = R.int(r + 3, r + 15), a = s - r - 1;
  const f = fin(a, [[s - r, (s - r) + ' est la différence des rangs : elle compte ' + Y.n + ' en plus'], [s - r + 1, (s - r + 1) + ' compte ' + X.n + ' et ' + Y.n], [s - r - 2, null]]);
  return sortie('Dans une file d\'attente, ' + X.n + ' est ' + rg(r) + ' et ' + Y.n + ' est ' + rg(s) + ' en partant de l\'avant. Combien de personnes se trouvent entre ' + X.n + ' et ' + Y.n + ' ?', f,
    'Les personnes situées entre les deux occupent les places strictement comprises entre ' + r + ' et ' + s + ' : on calcule la différence des rangs moins 1. ' + s + ' − ' + r + ' − 1 = ' + a + '.');
}
function g1depasse(R){
  const [X, Y] = noms(R, 2);
  if (R.int(0, 2) > 0){
    const r = R.int(8, 25), a = R.int(2, 6); let b = R.int(1, 5); if (b === a) b = a - 1;
    const p = r - a + b;
    const f = fin(p, [[r + a - b, rg(r + a - b) + ' inverse les deux effets'], [r - a - b, rg(r - a - b) + ' soustrait aussi les coureurs qui ' + le(X) + ' dépassent'], [r - a, rg(r - a) + ' oublie les coureurs qui ' + le(X) + ' dépassent']], {fmt: rg});
    return sortie('Dans une course, ' + X.n + ' est ' + rg(r) + '. ' + Cap(il(X)) + ' dépasse ' + a + ' coureurs, puis ' + b + ' ' + pl(b, 'coureur', 'coureurs') + ' ' + le(X) + ' ' + pl(b, 'dépasse', 'dépassent') + '. À quelle place est ' + X.n + ' maintenant ?', f,
      'Chaque coureur dépassé fait gagner une place (le rang diminue de 1) et chaque coureur qui te dépasse en fait perdre une (le rang augmente de 1). ' + r + ' − ' + a + ' + ' + b + ' = ' + p + ', donc ' + X.n + ' est ' + rg(p) + '.');
  }
  const k = R.int(2, 12);
  const f = fin(k, [[k - 1, rg(k - 1) + ' : en doublant ' + Y.n + ', on ne prend pas la place devant ' + lui(Y) + ', on prend la sienne'], [k + 1, rg(k + 1) + ' est la nouvelle place de ' + Y.n], [k - 2, null]], {fmt: rg});
  return sortie('Pendant un cross, ' + X.n + ' double ' + Y.n + ', qui était ' + rg(k) + '. À quelle place est ' + X.n + ' juste après ce dépassement ?', f,
    'Doubler quelqu\'un, c\'est prendre exactement sa place, et lui recule d\'une place. ' + X.n + ' prend la ' + rg(k) + ' place et ' + Y.n + ' passe ' + rg(k + 1) + '.');
}
function g1points(R){
  const W = R.pick([3, 3, 2]), v = R.int(2, 12), d = R.int(1, 8), l = R.int(0, 8), a = W * v + d;
  const f = fin(a, [[W * v, (W * v) + ' oublie les points des nuls'], [W * (v + d), (W * (v + d)) + ' compte les nuls comme des victoires'], [v + d + l, (v + d + l) + ' est le nombre de matchs joués, pas le nombre de points'], [W * v + 2 * d, (W * v + 2 * d) + ' donne 2 points par nul à l\'équipe : un nul distribue 2 points au total, mais 1 seul à chaque équipe']]);
  return sortie('Dans un championnat, une victoire rapporte ' + W + ' points, un match nul 1 point et une défaite 0 point. Une équipe termine la saison avec ' + v + ' victoires, ' + d + ' ' + pl(d, 'match nul', 'matchs nuls') + ' et ' + l + ' ' + pl(l, 'défaite', 'défaites') + '. Combien de points a-t-elle ?', f,
    'Multiplie le nombre de victoires par ' + W + ', ajoute 1 point par nul, et rien pour les défaites. ' + v + ' × ' + W + ' + ' + d + ' × 1 + ' + l + ' × 0 = ' + a + '.');
}

/* =====================================================================
   NIVEAU 2
   ===================================================================== */
function g2allerRetour(R){
  const v = R.int(1, 4);
  if (v <= 2){
    const n = R.int(6, 20), M = n * (n - 1);
    const qd = 'Un championnat réunit ' + n + ' équipes. Chaque équipe rencontre chacune des autres deux fois : une fois à domicile et une fois à l\'extérieur. ';
    if (v === 1){
      const f = fin(M, [[M / 2, (M / 2) + ' oublie les matchs retour'], [2 * M, (2 * M) + ' compte chaque match deux fois, une fois pour chaque équipe'], [n * n, (n * n) + ' fait jouer chaque équipe contre elle-même'], [2 * (n - 1), (2 * (n - 1)) + ' est le nombre de matchs d\'une seule équipe']]);
      return sortie(qd + 'Combien de matchs sont joués au total ?', f, 'Compte d\'abord les paires d\'équipes, n × (n − 1) ÷ 2, puis multiplie par 2 car chaque paire joue deux fois. ' + n + ' × ' + (n - 1) + ' ÷ 2 = ' + M / 2 + ' paires, et ' + M / 2 + ' × 2 = ' + M + ' matchs.');
    }
    const a = 2 * (n - 1);
    const f = fin(a, [[n - 1, (n - 1) + ' oublie les matchs retour'], [2 * n, (2 * n) + ' fait jouer l\'équipe contre elle-même'], [M, M + ' est le nombre total de matchs du championnat']]);
    return sortie(qd + 'Combien de matchs chaque équipe joue-t-elle dans la saison ?', f, 'Une équipe affronte toutes les autres, deux fois chacune. Il y a ' + (n - 1) + ' adversaires, donc ' + (n - 1) + ' × 2 = ' + a + ' matchs.');
  }
  const n = R.pick([6, 8, 10, 12, 14, 16, 18, 20]), ar = v === 4, a = ar ? 2 * (n - 1) : n - 1, M = ar ? n * (n - 1) : C2(n);
  const f = fin(a, [[n / 2, (n / 2) + ' est le nombre de matchs joués à chaque journée'], [M, M + ' est le nombre total de matchs'], [ar ? n - 1 : 2 * (n - 1), ar ? (n - 1) + ' oublie les matchs retour' : null], [n, null]]);
  return sortie('Un championnat réunit ' + n + ' équipes ; chaque équipe rencontre ' + (ar ? 'deux fois chacune des autres (aller et retour)' : 'une seule fois chacune des autres') + '. À chaque journée, chaque équipe joue exactement un match. Combien de journées faut-il pour disputer tout le championnat ?', f,
    'Une équipe joue un match par journée : il faut autant de journées que de matchs joués par une équipe. Chaque équipe a ' + (n - 1) + ' adversaires' + (ar ? ' à affronter deux fois, soit ' + a + ' matchs' : '') + ', donc ' + a + ' journées (on vérifie : ' + n / 2 + ' matchs par journée × ' + a + ' = ' + M + ' matchs).');
}
const ELIM = [
  {intro: n => 'Un tournoi de tennis à élimination directe réunit ' + n + ' joueurs : à chaque match, le perdant est éliminé.', qui: 'le vainqueur', qV: 'Combien de matchs le vainqueur a-t-il joués ?', p: 'joueurs', exempt: 'certains joueurs sont exemptés d\'un tour (ils passent au tour suivant sans jouer)'},
  {intro: n => 'Une coupe de football à élimination directe réunit ' + n + ' équipes : à chaque match, l\'équipe perdante est éliminée.', qui: 'le vainqueur', qV: 'Combien de matchs l\'équipe gagnante a-t-elle joués ?', p: 'équipes', exempt: 'certaines équipes sont exemptées d\'un tour (elles passent au tour suivant sans jouer)'},
  {intro: n => 'Un tournoi de badminton à élimination directe réunit ' + n + ' joueuses : à chaque match, la perdante est éliminée.', qui: 'la gagnante', qV: 'Combien de matchs la gagnante a-t-elle joués ?', p: 'joueuses', exempt: 'certaines joueuses sont exemptées d\'un tour (elles passent au tour suivant sans jouer)'}
];
function g2elim(R){
  const c = R.pick(ELIM), p = R.int(3, 7), n = Math.pow(2, p);
  if (R.int(0, 1) === 0){
    const a = n - 1;
    const f = fin(a, [[n / 2, (n / 2) + ' ne compte que le premier tour'], [p, p + ' est le nombre de tours, pas le nombre de matchs'], [n, n + ' compte un match de trop'], [C2(n), C2(n) + ' correspond à un championnat où chacun rencontre chacun']]);
    return sortie(c.intro(n) + ' Il n\'y a pas de match pour la 3e place. Combien de matchs faut-il jouer pour désigner ' + c.qui + ' ?', f,
      'Chaque match élimine exactement un participant, et tous doivent être éliminés sauf ' + c.qui + '. Il faut donc ' + n + ' − 1 = ' + a + ' matchs (on peut vérifier tour par tour : ' + range(1, p).map(k => n / Math.pow(2, k)).join(' + ') + ' = ' + a + ').');
  }
  const f = fin(p, [[p + 1, (p + 1) + ' compte un tour de trop'], [n / 2, (n / 2) + ' est le nombre de matchs du premier tour'], [n - 1, (n - 1) + ' est le nombre total de matchs du tournoi']]);
  const div = []; for (let k = n; k >= 1; k /= 2) div.push(k);
  return sortie(c.intro(n) + ' À chaque tour, les ' + c.p + ' encore en lice sont réparti' + (c.p === 'joueurs' ? 's' : 'es') + ' en matchs. ' + c.qV, f,
    'Le nombre de participants est divisé par 2 à chaque tour : compte les tours jusqu\'à ce qu\'il n\'en reste qu\'un. ' + div.join(' → ') + ' : ' + p + ' tours, et ' + c.qui + ' joue un match par tour, soit ' + p + ' matchs.');
}
function g2pointsInv(R){
  const m = R.int(8, 20), l = R.int(0, Math.floor(m / 3)), v = R.int(1, m - l - 1), d = m - l - v, P = 3 * v + d, askV = R.int(0, 1) === 0;
  const q = 'Dans un championnat, une victoire rapporte 3 points, un match nul 1 point et une défaite 0 point. Une équipe a joué ' + m + ' matchs, ' + (l === 0 ? 'n\'en a perdu aucun' : 'en a perdu ' + l) + ' et totalise ' + P + ' points. ' + (askV ? 'Combien de matchs a-t-elle gagnés ?' : 'Combien de matchs nuls a-t-elle faits ?');
  const expl = 'Imagine d\'abord que tous les matchs non perdus sont des nuls, puis compte ce que rapporte chaque victoire en plus. ' + (m - l) + ' matchs non perdus, tous nuls, rapporteraient ' + (m - l) + ' points. Il en manque ' + P + ' − ' + (m - l) + ' = ' + (P - (m - l)) + ', et chaque victoire à la place d\'un nul ajoute 2 points : ' + (P - (m - l)) + ' ÷ 2 = ' + v + ' ' + pl(v, 'victoire', 'victoires') + ', donc ' + (m - l) + ' − ' + v + ' = ' + d + ' ' + pl(d, 'nul', 'nuls') + '. Vérification : ' + v + ' × 3 + ' + d + ' = ' + P + '.';
  const f = askV
    ? fin(v, [[d, d + ' est le nombre de nuls'], [Math.floor(P / 3), Math.floor(P / 3) + ' suppose que presque tous les points viennent de victoires et oublie les nuls'], [2 * v, (2 * v) + ' oublie de diviser par 2']], {min: 0})
    : fin(d, [[v, v + ' est le nombre de victoires'], [d - v, (d - v) + ' compte 1 point de plus par victoire au lieu de 2'], [m - l - Math.floor(P / 3), null]], {min: 0});
  return sortie(q, f, expl);
}
function g2rangs(R){
  const [X, Y] = noms(R, 2), v = R.int(1, 3);
  if (v === 1){
    const N = R.int(18, 40), r = R.int(2, Math.floor(N / 2)), s = R.int(2, N - r - 3), a = N - s - r, pY = N - s + 1;
    const f = fin(a, [[a + 1, (a + 1) + ' calcule ' + pY + ' − ' + r + ' sans retirer 1 : on ne compte ni ' + X.n + ' ni ' + Y.n], [a - 1, (a - 1) + ' oublie le + 1 en convertissant le rang de ' + Y.n], [a + 2, null]]);
    return sortie('Dans une file de ' + N + ' personnes, ' + X.n + ' est ' + rg(r) + ' en partant de l\'avant et ' + Y.n + ' est ' + rg(s) + ' en partant de l\'arrière. Combien de personnes se trouvent entre ' + X.n + ' et ' + Y.n + ' ?', f,
      'Convertis d\'abord le rang de ' + Y.n + ' en rang à partir de l\'avant, puis compte les places strictement entre les deux. ' + Y.n + ' est ' + rg(pY) + ' en partant de l\'avant (' + N + ' − ' + s + ' + 1). Entre la ' + rg(r) + ' et la ' + rg(pY) + ' place : ' + pY + ' − ' + r + ' − 1 = ' + a + ' personnes.');
  }
  if (v === 2){
    const r = R.int(2, 15), k = R.int(2, 6), a = r + k;
    const f = fin(a, [[r + 1, rg(r + 1) + ' oublie que les ' + k + ' ex aequo occupent ' + k + ' places'], [r + k - 1, rg(r + k - 1) + ' oublie que le rang suit le nombre de candidats mieux notés'], [r + k + 1, null]], {fmt: rg});
    return sortie('Dans un concours, le rang d\'un candidat est égal à 1 plus le nombre de candidats qui ont une note strictement meilleure que la sienne. Exactement ' + k + ' candidats sont ex aequo à la ' + rg(r) + ' place. Quel est le rang du candidat dont la note vient juste en dessous de la leur ?', f,
      'Compte les candidats qui ont une meilleure note que lui : ceux classés avant les ex aequo, plus les ex aequo eux-mêmes. ' + (r - 1) + ' candidats devant les ex aequo, plus les ' + k + ' ex aequo : ' + (r - 1 + k) + ' candidats mieux notés, donc son rang est ' + (r - 1 + k) + ' + 1 = ' + a + '.');
  }
  const r = R.int(4, 30), a = 2 * r - 1;
  const f = fin(a, [[2 * r, (2 * r) + ' compte ' + X.n + ' deux fois'], [2 * r - 2, (2 * r - 2) + ' oublie ' + X.n], [2 * r + 1, null]]);
  return sortie('Dans une file d\'attente, ' + X.n + ' a autant de personnes devant ' + lui(X) + ' que derrière ' + lui(X) + '. ' + Cap(il(X)) + ' est ' + rg(r) + ' en partant de l\'avant. Combien de personnes compte la file ?', f,
    'Compte les personnes devant ' + X.n + ', autant derrière, puis ajoute ' + X.n + '. Devant : ' + (r - 1) + ' ; derrière : ' + (r - 1) + ' ; total : ' + (r - 1) + ' + ' + (r - 1) + ' + 1 = ' + a + '.');
}

/* =====================================================================
   NIVEAU 3
   ===================================================================== */
function g3nuls(R){
  const v = R.int(1, 3);
  if (v <= 2){
    const n = R.int(4, 8), M = C2(n), d = R.int(1, M - 1), T = 3 * M - d, askD = v === 1;
    const q = 'Dans un tournoi de ' + n + ' équipes, chaque équipe rencontre une seule fois chacune des autres. ' + BAREME3 + ' Au total, ' + T + ' points ont été distribués. ' + (askD ? 'Combien de matchs se sont terminés par un nul ?' : 'Combien de matchs ont eu un vainqueur ?');
    const base = 'Compte les points distribués par match : 3 pour un match gagné, 2 pour un nul, donc chaque nul fait perdre 1 point par rapport au maximum. Il y a ' + n + ' × ' + (n - 1) + ' ÷ 2 = ' + M + ' matchs, soit au plus ' + M + ' × 3 = ' + 3 * M + ' points. Il en manque ' + 3 * M + ' − ' + T + ' = ' + d + ' : il y a eu ' + d + ' ' + pl(d, 'nul', 'nuls');
    const f = askD
      ? fin(d, [[M - d, (M - d) + ' est le nombre de matchs gagnés'], [d % 2 === 0 ? d / 2 : null, (d / 2) + ' suppose qu\'un nul ne distribue qu\'1 point au total'], [d + 1, null]])
      : fin(M - d, [[d, d + ' est le nombre de nuls'], [M, M + ' est le nombre total de matchs'], [T % 3 === 0 ? T / 3 : null, (T / 3) + ' suppose que tous les points viennent de victoires']]);
    return sortie(q, f, base + (askD ? '.' : ', donc ' + M + ' − ' + d + ' = ' + (M - d) + ' matchs avec un vainqueur.'));
  }
  const n = R.pick([4, 5]), M = C2(n);
  let s = simule(R, n, 3, 30); for (let t = 0; t < 20 && s.d === 0; t++) s = simule(R, n, 3, 30);
  if (s.d === 0) return null;
  const V = R.shuffle(VILLES).slice(0, n), ord = range(0, n - 1).sort((x, y) => s.pts[y] - s.pts[x]);
  const T = sum(s.pts), d = 3 * M - T;
  const q = 'Un tournoi réunit ' + n + ' équipes : chaque équipe rencontre une seule fois chacune des autres. ' + BAREME3 + ' Classement final : ' + et(ord.map(i => V[i] + ' ' + ptsTxt(s.pts[i]))) + '. Combien de matchs se sont terminés par un nul ?';
  const f = fin(d, [[M - d, (M - d) + ' est le nombre de matchs gagnés'], [d % 2 === 0 ? d / 2 : null, (d / 2) + ' suppose qu\'un nul ne distribue qu\'1 point au total'], [d + 1, null], [d - 1, null]], {min: 0});
  return sortie(q, f, 'Additionne tous les points, puis compare au total qu\'on aurait sans aucun nul (3 points par match). Total : ' + ord.map(i => s.pts[i]).join(' + ') + ' = ' + T + '. Il y a ' + n + ' × ' + (n - 1) + ' ÷ 2 = ' + M + ' matchs, donc ' + 3 * M + ' points sans nul ; chaque nul en distribue 2, soit 1 de moins : ' + 3 * M + ' − ' + T + ' = ' + d + ' ' + pl(d, 'nul', 'nuls') + '.');
}
function g3inverse(R){
  const v = R.int(1, 3);
  if (v < 3){
    const n = R.int(6, 16), M = C2(n);
    const q = v === 1
      ? 'Lors d\'une soirée, chaque invité a serré une seule fois la main de chacun des autres invités. Il y a eu ' + M + ' poignées de main en tout. Combien d\'invités y avait-il ?'
      : 'Dans un championnat, chaque équipe rencontre une seule fois chacune des autres. ' + M + ' matchs ont été joués au total. Combien d\'équipes participent ?';
    let k2 = null; for (let k = 2; k < 40; k++) if (k * (k - 1) === M) k2 = k;
    const f = fin(n, [[n - 1, (n - 1) + ' est le plus petit des deux entiers consécutifs'], [k2, k2 + ' oublie la division par 2'], [n + 1, null]]);
    return sortie(q, f, 'Cherche n tel que n × (n − 1) ÷ 2 = ' + M + ', c\'est-à-dire deux entiers consécutifs dont le produit vaut 2 × ' + M + '. 2 × ' + M + ' = ' + 2 * M + ' = ' + n + ' × ' + (n - 1) + ', donc n = ' + n + '.');
  }
  const n = R.int(5, 12), M = n * (n - 1);
  let k2 = null; for (let k = 2; k < 40; k++) if (k * (k - 1) / 2 === M) k2 = k;
  const f = fin(n, [[n - 1, (n - 1) + ' est le plus petit des deux entiers consécutifs'], [k2, k2 + ' oublie que chaque paire joue deux fois'], [n + 1, null]]);
  return sortie('Dans un championnat, chaque équipe rencontre chacune des autres deux fois (match aller et match retour). ' + M + ' matchs ont été joués au total. Combien d\'équipes participent ?', f,
    'Avec l\'aller et le retour, n équipes jouent n × (n − 1) matchs : cherche deux entiers consécutifs dont le produit vaut ' + M + '. ' + M + ' = ' + n + ' × ' + (n - 1) + ', donc n = ' + n + '.');
}
function g3elim(R){
  if (R.int(0, 1) === 0){
    const c = R.pick(ELIM); let n = R.int(12, 100); while (pow2(n) === n) n++;
    const a = n - 1;
    const f = fin(a, [[Math.ceil(n / 2), Math.ceil(n / 2) + ' ne compte que le premier tour'], [pow2(n) - 1, (pow2(n) - 1) + ' fait comme s\'il y avait ' + pow2(n) + ' participants'], [n, n + ' compte un match de trop'], [log2c(n), log2c(n) + ' est le nombre de tours']]);
    return sortie(c.intro(n) + ' Comme ' + n + ' n\'est pas une puissance de 2, ' + c.exempt + '. Il n\'y a ni match nul ni match pour la 3e place. Combien de matchs faut-il jouer pour désigner ' + c.qui + ' ?', f,
      'Inutile de construire le tableau : chaque match élimine exactement un participant, et tous doivent être éliminés sauf ' + c.qui + '. Il faut éliminer ' + n + ' − 1 = ' + a + ' participants, donc ' + a + ' matchs, quelles que soient les exemptions.');
  }
  const n = R.pick([5, 7, 9, 11, 13, 15]), M = C2(n), a = (n - 1) / 2;
  const f = fin(a, [[n - 1, (n - 1) + ' est le nombre de matchs joués par chaque joueur'], [(n + 1) / 2, null], [M, M + ' est le nombre total de matchs']]);
  return sortie(n + ' joueurs disputent un tournoi de tennis de table où chacun affronte une seule fois chacun des autres, sans match nul. À la fin, tous les joueurs ont gagné le même nombre de matchs. Combien de matchs chaque joueur a-t-il gagnés ?', f,
    'Compte le nombre total de victoires : il y en a exactement une par match. ' + n + ' × ' + (n - 1) + ' ÷ 2 = ' + M + ' matchs, donc ' + M + ' victoires, partagées également entre ' + n + ' joueurs : ' + M + ' ÷ ' + n + ' = ' + a + '.');
}
function g3poules(R){
  let g, t, q2, txtQ;
  if (R.int(0, 1) === 0){ g = R.pick([2, 4, 8]); q2 = 2 * g; txtQ = 'Les deux premières de chaque poule'; }
  else { g = R.pick([4, 8]); q2 = g; txtQ = 'La première de chaque poule'; }
  t = R.int(3, 6);
  const P = g * C2(t), a = P + q2 - 1;
  const q = 'Une compétition de handball réunit ' + g * t + ' équipes réparties en ' + g + ' poules de ' + t + '. Dans chaque poule, chaque équipe affronte une seule fois chacune des autres. ' + txtQ + ' ' + (q2 === 2 * g ? 'disputent' : 'dispute') + ' ensuite une phase finale à élimination directe, sans match pour la 3e place. Combien de matchs sont joués en tout ?';
  const f = fin(a, [[P, P + ' oublie la phase finale'], [P + q2, (P + q2) + ' compte un match de trop dans la phase finale'], [P + q2 / 2, (P + q2 / 2) + ' ne compte que le premier tour de la phase finale'], [C2(g * t) + q2 - 1, (C2(g * t) + q2 - 1) + ' fait comme si toutes les équipes se rencontraient']]);
  return sortie(q, f, 'Compte séparément les matchs de poule (une rencontre par paire dans chaque poule) et ceux de la phase finale (un match par équipe éliminée). Une poule de ' + t + ' : ' + t + ' × ' + (t - 1) + ' ÷ 2 = ' + C2(t) + ' matchs, donc ' + g + ' × ' + C2(t) + ' = ' + P + '. Phase finale à ' + q2 + ' équipes : ' + q2 + ' − 1 = ' + (q2 - 1) + ' matchs. Total : ' + P + ' + ' + (q2 - 1) + ' = ' + a + '.');
}
function g3dernier(R){
  const n = R.pick([4, 5]), M = C2(n), s = simule(R, n, 2, 30), V = R.shuffle(VILLES).slice(0, n), z = n - 1;
  const autres = R.shuffle(range(0, n - 2)), S = sum(autres.map(i => s.pts[i])), a = s.pts[z];
  const q = 'Un tournoi réunit ' + n + ' équipes : chaque équipe rencontre une seule fois chacune des autres. ' + BAREME2 + ' À la fin, ' + et(autres.map(i => V[i] + ' a ' + ptsTxt(s.pts[i]))) + '. Combien de points a ' + V[z] + ' ?';
  const f = fin(a, [[3 * M - S, (3 * M - S) + ' compte 3 points par match'], [n - 1, (n - 1) + ' est seulement la moyenne par équipe'], [M - S, (M - S) + ' compte 1 point par match'], [a + 2, null]], {min: 0, max: 2 * (n - 1)});
  return sortie(q, f, 'Avec ce barème, chaque match distribue exactement 2 points, qu\'il soit gagné ou nul : le total ne dépend que du nombre de matchs. ' + n + ' × ' + (n - 1) + ' ÷ 2 = ' + M + ' matchs, donc ' + 2 * M + ' points en tout. Les autres équipes en ont ' + autres.map(i => s.pts[i]).join(' + ') + ' = ' + S + ', donc ' + V[z] + ' a ' + 2 * M + ' − ' + S + ' = ' + ptsTxt(a) + '.');
}
function g3file(R){
  const [X, Y] = noms(R, 2), v = R.int(1, 3);
  if (v === 1){
    const p = R.int(3, 15), q = R.int(3, 15), j = R.int(1, 8), a = p + j + q + 2;
    const f = fin(a, [[p + j + q, (p + j + q) + ' oublie de compter ' + X.n + ' et ' + Y.n], [p + j + q + 1, (p + j + q + 1) + ' ne compte qu\'une des deux personnes'], [p + q - j, (p + q - j) + ' correspond au cas où ' + Y.n + ' serait devant ' + X.n]]);
    return sortie('Dans une file d\'attente, ' + X.n + ' a ' + p + ' personnes devant ' + lui(X) + ' et ' + Y.n + ' a ' + q + ' personnes derrière ' + lui(Y) + '. ' + X.n + ' est devant ' + Y.n + ', et il y a exactement ' + j + ' ' + pl(j, 'personne', 'personnes') + ' entre ' + lui(X) + ' et ' + Y.n + '. Combien de personnes compte la file ?', f,
      'Dessine la file de la tête à la fin, groupe par groupe, sans oublier les deux personnes nommées. ' + p + ' personnes, ' + X.n + ', ' + j + ' ' + pl(j, 'personne', 'personnes') + ', ' + Y.n + ', ' + q + ' personnes : ' + p + ' + 1 + ' + j + ' + 1 + ' + q + ' = ' + a + '.');
  }
  if (v === 2){
    const m = R.int(5, 20), j = R.int(2, 6), r = m + j, a = 2 * m - 1;
    const f = fin(a, [[2 * r - 1, (2 * r - 1) + ' utilise le rang de ' + Y.n + ' au lieu de celui de ' + X.n], [2 * m, (2 * m) + ' compte ' + X.n + ' deux fois'], [2 * m - 2, (2 * m - 2) + ' oublie ' + X.n]]);
    return sortie('Dans une course, ' + X.n + ' a terminé avec autant de coureurs devant ' + lui(X) + ' que derrière ' + lui(X) + '. ' + Y.n + ' a terminé ' + j + ' places derrière ' + X.n + ', à la ' + rg(r) + ' place. Combien de coureurs ont pris part à la course ?', f,
      'Retrouve d\'abord le rang de ' + X.n + ', puis double le nombre de coureurs devant ' + lui(X) + ' et ajoute ' + X.n + '. ' + X.n + ' est ' + rg(m) + ' (' + r + ' − ' + j + '), avec ' + (m - 1) + ' coureurs devant et donc ' + (m - 1) + ' derrière : ' + (m - 1) + ' + ' + (m - 1) + ' + 1 = ' + a + '.');
  }
  const K = R.pick([2, 3]), r = R.int(3, 14), a = (r - 1) * (K + 1) + 1;
  const f = fin(a, [[(r - 1) * (K + 1), ((r - 1) * (K + 1)) + ' oublie ' + X.n], [r * (K + 1), (r * (K + 1)) + ' compte ' + X.n + ' parmi les coureurs de devant'], [(r - 1) * K + 1, ((r - 1) * K + 1) + ' oublie les coureurs de devant']]);
  return sortie('Dans une course, ' + X.n + ' a terminé ' + rg(r) + ', et il y a ' + (K === 2 ? 'deux' : 'trois') + ' fois plus de coureurs derrière ' + lui(X) + ' que devant ' + lui(X) + '. Combien de coureurs ont pris part à la course ?', f,
    'Compte les coureurs devant ' + X.n + ' (son rang moins 1), multiplie pour obtenir ceux de derrière, puis ajoute ' + X.n + '. Devant : ' + (r - 1) + ' ; derrière : ' + (r - 1) + ' × ' + K + ' = ' + (r - 1) * K + ' ; total : ' + (r - 1) + ' + ' + (r - 1) * K + ' + 1 = ' + a + '.');
}

/* =====================================================================
   NIVEAU 4
   ===================================================================== */
function g4nulsInv(R){
  const v = R.int(1, 3);
  if (v === 1){
    const n = R.int(6, 12), M = C2(n), d = R.int(1, Math.floor(M / 2)), T = 3 * M - d;
    const f = fin(n, [[M, M + ' est le nombre de matchs, pas le nombre d\'équipes'], [n - 1, null], [n + 1, null]]);
    return sortie('Dans un tournoi, chaque équipe rencontre une seule fois chacune des autres. ' + BAREME3 + ' Il y a eu ' + d + ' ' + pl(d, 'match nul', 'matchs nuls') + ' et ' + T + ' points distribués au total. Combien d\'équipes ont participé ?', f,
      'Retrouve d\'abord le nombre de matchs : chaque match distribue 3 points, sauf un nul qui en distribue 2. Avec ' + d + ' ' + pl(d, 'nul', 'nuls') + ', 3 × (nombre de matchs) = ' + T + ' + ' + d + ' = ' + (T + d) + ', donc ' + M + ' matchs. Puis n × (n − 1) ÷ 2 = ' + M + ' donne n × (n − 1) = ' + 2 * M + ' = ' + n + ' × ' + (n - 1) + ' : ' + n + ' équipes.');
  }
  if (v === 2){
    const n = R.int(4, 8), M = n * (n - 1), d = R.int(1, M - 1), T = 3 * M - d, Ms = C2(n);
    const f = fin(d, [[M - d, (M - d) + ' est le nombre de matchs gagnés'], [3 * Ms - T, (3 * Ms - T) + ' oublie les matchs retour'], [d + 1, null]]);
    return sortie('Dans un championnat de ' + n + ' équipes, chaque équipe rencontre chacune des autres deux fois (aller et retour). ' + BAREME3 + ' Au total, ' + T + ' points ont été distribués. Combien de matchs se sont terminés par un nul ?', f,
      'Calcule le total qu\'on aurait sans aucun nul, puis remarque que chaque nul distribue 1 point de moins (2 au lieu de 3). ' + n + ' × ' + (n - 1) + ' = ' + M + ' matchs (aller et retour), soit ' + 3 * M + ' points sans nul. ' + 3 * M + ' − ' + T + ' = ' + d + ' ' + pl(d, 'nul', 'nuls') + '.');
  }
  let n, k; do { n = R.int(5, 10); k = R.int(1, Math.min(4, n - 1)); } while ((n * k) % 2 !== 0);
  const M = C2(n), d = n * k / 2, a = 3 * M - d;
  const f = fin(a, [[3 * M - n * k, (3 * M - n * k) + ' compte chaque nul deux fois : un nul concerne deux équipes'], [3 * M, (3 * M) + ' oublie les nuls'], [3 * M - k, (3 * M - k) + ' ne compte les nuls que d\'une seule équipe']]);
  return sortie('Dans un tournoi de ' + n + ' équipes, chaque équipe rencontre une seule fois chacune des autres. ' + BAREME3 + ' À la fin, chaque équipe a fait exactement ' + k + ' ' + pl(k, 'match nul', 'matchs nuls') + '. Combien de points ont été distribués au total ?', f,
    'Compte les matchs nuls sans les compter deux fois (chaque nul concerne deux équipes), puis retire 1 point par nul au total maximal. ' + n + ' équipes × ' + k + ' ' + pl(k, 'nul', 'nuls') + ' = ' + n * k + ', mais chaque nul est compté par ses deux équipes : ' + d + ' ' + pl(d, 'nul', 'nuls') + '. ' + M + ' matchs, donc ' + 3 * M + ' − ' + d + ' = ' + a + ' points.');
}
function g4multiElim(R){
  const k = R.pick([2, 2, 3]), n = R.int(8, 40), j = R.int(0, k - 1), a = k * (n - 1) + j, jeu = R.pick(['babyfoot', 'tennis de table', 'fléchettes', 'échecs']);
  const q = 'Dans un tournoi de ' + jeu + ', ' + n + ' joueurs s\'affrontent en duels, sans match nul. Un joueur est éliminé dès qu\'il a perdu ' + k + ' matchs, et le tournoi s\'arrête quand il ne reste qu\'un joueur. Le vainqueur ' + (j === 0 ? 'n\'a perdu aucun match' : 'a perdu ' + j + ' ' + pl(j, 'match', 'matchs')) + '. Combien de matchs ont été joués ?';
  const f = fin(a, [[j > 0 ? k * (n - 1) : null, (k * (n - 1)) + ' oublie les défaites du vainqueur'], [k * n, (k * n) + ' donne aussi ' + k + ' défaites au vainqueur'], [n - 1, (n - 1) + ' raisonne comme une élimination directe'], [a + 1, null]]);
  return sortie(q, f, 'Compte les défaites plutôt que les matchs : chaque match produit exactement une défaite. Les ' + (n - 1) + ' joueurs éliminés ont perdu ' + k + ' matchs chacun, soit ' + k * (n - 1) + ' défaites, et le vainqueur en a ' + j + '. Total : ' + k * (n - 1) + ' + ' + j + ' = ' + a + ' matchs.');
}
function g4poules(R){
  const g = R.pick([2, 4, 8]), t = R.int(3, 6), q2 = 2 * g, ar = R.int(0, 1) === 1, pf = ar ? R.int(0, 1) === 1 : true;
  const P = g * C2(t) * (ar ? 2 : 1), F = q2 - 1 + (pf ? 1 : 0), a = P + F;
  const q = 'Un tournoi de futsal réunit ' + g * t + ' équipes réparties en ' + g + ' poules de ' + t + '. Dans chaque poule, chaque équipe affronte ' + (ar ? 'deux fois (aller et retour)' : 'une seule fois') + ' chacune des autres. Les deux premières de chaque poule disputent ensuite une phase finale à élimination directe' + (pf ? ', avec un match pour la 3e place' : ', sans match pour la 3e place') + '. Combien de matchs sont joués en tout ?';
  const pieges = [[P + q2 - 1 - (pf ? 0 : 1) === a ? null : P + q2 - 1, (P + q2 - 1) + ' oublie le match pour la 3e place'],
    [ar ? a - P / 2 : null, (a - P / 2) + ' oublie les matchs retour des poules'], [P + q2 + (pf ? 1 : 0), (P + q2 + (pf ? 1 : 0)) + ' compte un match de trop dans la phase finale'], [P, P + ' oublie la phase finale']];
  const f = fin(a, pieges);
  return sortie(q, f, 'Compte séparément les matchs de poule et ceux de la phase finale, où chaque match élimine une équipe' + (pf ? ', puis ajoute le match pour la 3e place' : '') + '. Une poule de ' + t + ' : ' + t + ' × ' + (t - 1) + ' ÷ 2 = ' + C2(t) + (ar ? ' paires, jouées deux fois : ' + 2 * C2(t) + ' matchs' : ' matchs') + ', donc ' + g + ' × ' + C2(t) * (ar ? 2 : 1) + ' = ' + P + '. Phase finale à ' + q2 + ' équipes : ' + (q2 - 1) + ' matchs' + (pf ? ', plus 1 pour la 3e place' : '') + '. Total : ' + P + ' + ' + F + ' = ' + a + '.');
}
function g4distinctes(R){
  const n = R.int(5, 9), k = R.int(2, n), a = n - k;
  const c = R.pick([
    {q: n + ' joueuses disputent un tournoi d\'échecs où chacune affronte une seule fois chacune des autres, et aucune partie ne se termine par un nul. À la fin, les ' + n + ' joueuses ont toutes gagné un nombre différent de parties. Combien de parties a gagnées la joueuse classée ' + rg(k) + ' ?', u: 'parties'},
    {q: n + ' équipes de volley disputent un tournoi où chacune affronte une seule fois chacune des autres (au volley, il n\'y a jamais de match nul). À la fin, les ' + n + ' équipes ont toutes gagné un nombre différent de matchs. Combien de matchs a gagnés l\'équipe classée ' + rg(k) + ' ?', u: 'matchs'}
  ]);
  const f = fin(a, [[n - k + 1, (n - k + 1) + ' oublie que la dernière peut avoir 0 victoire'], [(n - 1) % 2 === 0 ? (n - 1) / 2 : null, ((n - 1) / 2) + ' est la moyenne, valable si toutes avaient le même nombre de victoires'], [k - 1, (k - 1) + ' compte les classées devant au lieu des victoires'], [n - k - 1, null]], {min: 0});
  return sortie(c.q, f, 'Chaque participant gagne entre 0 et ' + (n - 1) + ' ' + c.u + ' : il n\'y a que ' + n + ' valeurs possibles pour ' + n + ' totaux tous différents. Les nombres de victoires sont donc exactement 0, 1, 2, …, ' + (n - 1) + ' (leur somme, ' + C2(n) + ', est bien le nombre de ' + c.u + '). Le premier en a ' + (n - 1) + ', le deuxième ' + (n - 2) + ', etc. : le ' + rg(k) + ' en a ' + (n - 1) + ' − ' + (k - 1) + ' = ' + a + '.');
}
function g4dernierNuls(R){
  const n = R.pick([4, 4, 5]), M = C2(n);
  let s = simule(R, n, 3, 30); for (let t = 0; t < 20 && s.d === 0; t++) s = simule(R, n, 3, 30);
  if (s.d === 0) return null;
  const V = R.shuffle(VILLES).slice(0, n), z = n - 1, autres = R.shuffle(range(0, n - 2)), S = sum(autres.map(i => s.pts[i])), a = s.pts[z], d = s.d;
  const q = 'Un tournoi réunit ' + n + ' équipes : chaque équipe rencontre une seule fois chacune des autres. ' + BAREME3 + ' Il y a eu ' + d + ' ' + pl(d, 'match nul', 'matchs nuls') + '. À la fin, ' + et(autres.map(i => V[i] + ' a ' + ptsTxt(s.pts[i]))) + '. Combien de points a ' + V[z] + ' ?';
  const f = fin(a, [[3 * M - S, (3 * M - S) + ' oublie les nuls'], [3 * M - 2 * d - S, (3 * M - 2 * d - S) + ' retire 2 points par nul au lieu de 1'], [a + 1, null], [a - 1, null]], {min: 0, max: 3 * (n - 1)});
  return sortie(q, f, 'Calcule le total des points distribués (3 par match gagné, 2 par match nul), puis retire les points des autres équipes. ' + M + ' matchs, dont ' + d + ' ' + pl(d, 'nul', 'nuls') + ' : 3 × ' + M + ' − ' + d + ' = ' + (3 * M - d) + ' points. Les autres équipes en ont ' + autres.map(i => s.pts[i]).join(' + ') + ' = ' + S + ', donc ' + V[z] + ' a ' + (3 * M - d) + ' − ' + S + ' = ' + ptsTxt(a) + '.');
}
function g4chevauche(R){
  const [X, Y] = noms(R, 2), j = R.int(1, 6), p = R.int(j + 2, j + 14), q = R.int(j + 2, j + 14), a = p + q - j;
  const f = fin(a, [[p + q + j + 2, (p + q + j + 2) + ' place ' + X.n + ' devant ' + Y.n + ', alors que c\'est l\'inverse : les deux groupes se chevauchent'], [p + q, (p + q) + ' oublie que ' + (j > 1 ? 'les ' + j + ' personnes du milieu sont comptées' : 'la personne du milieu est comptée') + ' deux fois'], [p + q - j + 2, (p + q - j + 2) + ' ajoute ' + X.n + ' et ' + Y.n + ', alors que ces deux personnes sont déjà comptées'], [p + q - 2 * j, null]]);
  return sortie('Dans une file d\'attente, ' + X.n + ' a ' + p + ' personnes devant ' + lui(X) + ' et ' + Y.n + ' a ' + q + ' personnes derrière ' + lui(Y) + '. ' + Y.n + ' est devant ' + X.n + ', et il y a exactement ' + j + ' ' + pl(j, 'personne', 'personnes') + ' entre ' + eux(X, Y) + '. Combien de personnes compte la file ?', f,
    'Dessine la file : comme ' + Y.n + ' est devant ' + X.n + ', les personnes devant ' + X.n + ' et celles derrière ' + Y.n + ' se chevauchent. Tout le monde est soit devant ' + X.n + ', soit derrière ' + Y.n + ', et ' + (j > 1 ? 'les ' + j + ' personnes situées entre ' + eux(X, Y) + ' sont' : 'la personne située entre ' + eux(X, Y) + ' est') + ' dans les deux groupes. ' + Y.n + ' est ' + rg(p - j) + ' (' + p + ' − ' + j + '), donc la file compte ' + (p - j) + ' + ' + q + ' = ' + a + ' personnes (ou ' + p + ' + ' + q + ' − ' + j + ').');
}

/* =====================================================================
   NIVEAU 5
   ===================================================================== */
/* Score d'une équipe déduit : 4 équipes, barème 3, 1, 0 ; aucune équipe connue n'a 3 points (décomposition unique). */
const DEC3 = p => { const r = []; for (let w = 0; w <= 3; w++) for (let d = 0; d + w <= 3; d++) if (3 * w + d === p) r.push([w, d, 3 - w - d]); return r; };
/* Toutes les issues des 6 matchs (3 possibilités chacun) où l'énigme se résout par le seul décompte
   « autant de victoires que de défaites » : aucune équipe connue à 3 points, écart d'au moins 2. */
let ISSUES5 = null;
function issues5(){
  if (ISSUES5) return ISSUES5;
  ISSUES5 = [];
  const P = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  for (let c = 0; c < 729; c++){
    let x = c; const pts = [0, 0, 0, 0];
    P.forEach(([i, j]) => { const r = x % 3; x = (x - r) / 3; if (r === 0) pts[i] += 3; else if (r === 1) pts[j] += 3; else { pts[i]++; pts[j]++; } });
    const dec = pts.slice(0, 3).map(DEC3);
    if (dec.some(t => t.length !== 1)) continue;
    const delta = sum(dec.map(t => t[0][2])) - sum(dec.map(t => t[0][0]));
    if (Math.abs(delta) >= 2) ISSUES5.push(pts);
  }
  return ISSUES5;
}
function g5score(R){
  const pts = R.pick(issues5());
  const dec = pts.slice(0, 3).map(DEC3);
  if (dec.some(x => x.length !== 1)) return null;
  const W = sum(dec.map(x => x[0][0])), L = sum(dec.map(x => x[0][2])), delta = L - W;
  if (Math.abs(delta) < 2) return null;
  const w = delta > 0 ? delta : 0, l = delta > 0 ? 0 : -delta, e = 3 - w - l, a = 3 * w + e;
  if (a !== pts[3]) return null;     // garde-fou : la déduction doit redonner le score simulé
  const V = R.shuffle(VILLES).slice(0, 4), ordre = R.shuffle([0, 1, 2]), S = pts[0] + pts[1] + pts[2];
  const mot = (k, sg, p) => k + ' ' + pl(k, sg, p);
  const decTxt = i => V[i] + ' : ' + ptsTxt(pts[i]) + ' = ' + mot(dec[i][0][0], 'victoire', 'victoires') + ', ' + mot(dec[i][0][1], 'nul', 'nuls') + ', ' + mot(dec[i][0][2], 'défaite', 'défaites');
  const q = 'Quatre équipes disputent un tournoi : chaque équipe rencontre une seule fois chacune des autres. ' + BAREME3 + ' À la fin, ' + et(ordre.map(i => V[i] + ' a ' + ptsTxt(pts[i]))) + '. Combien de points a ' + V[3] + ' ?';
  const autre = delta > 0 ? 3 - Math.abs(delta) : 2 * Math.abs(delta) + 3;
  const f = fin(a, [[18 - S, (18 - S) + ' suppose qu\'il n\'y a eu aucun nul'], [autre, autre + ' inverse victoires et défaites'], [a + 1, null], [a - 1, null]], {min: 0, max: 9});
  return sortie(q, f, 'Décompose chaque total en victoires, nuls et défaites (3 matchs par équipe), puis utilise le fait que tout le tournoi compte autant de victoires que de défaites. ' + ordre.map(decTxt).join(' ; ') + ' (à chaque fois, c\'est la seule décomposition possible en 3 matchs). Ces trois équipes cumulent ' + mot(W, 'victoire', 'victoires') + ' et ' + mot(L, 'défaite', 'défaites') + '. Chaque match gagné donne une victoire et une défaite, donc ' + V[3] + ' doit compter ' + Math.abs(delta) + ' ' + (delta > 0 ? 'victoires de plus que de défaites' : 'défaites de plus que de victoires') + '. En 3 matchs, la seule possibilité est ' + mot(w, 'victoire', 'victoires') + ', ' + mot(e, 'nul', 'nuls') + ' et ' + mot(l, 'défaite', 'défaites') + ', soit ' + ptsTxt(a) + '.');
}
/* Points qui garantissent la qualification : seuil = plus grand total que k + 1 équipes peuvent atteindre ensemble, plus 1.
   Combinaisons retenues : celles où ce seuil est un total réellement atteignable (contrôlé par force brute dans le vérificateur). */
const INT3 = {2: 'elles font match nul', 3: 'chacune gagne un match et en perd un', 4: 'chacune gagne un match, fait un nul et perd un match', 5: 'chacune gagne deux matchs et en perd deux', 6: 'chacune gagne deux matchs, fait un nul et en perd deux'};
const INT3P = {2: 1, 3: 3, 4: 4, 5: 6, 6: 7};
const GARANTIE = [];
[3, 2].forEach(W => [4, 5, 6].forEach(n => range(1, n - 1).forEach(k => { if (!(W === 3 && k === 1)) GARANTIE.push({W, n, k}); })));
function g5garantie(R){
  const {W, n, k} = R.pick(GARANTIE), g = k + 1, autres = n - g;
  const B = W * C2(g) + W * g * autres, P = Math.floor(B / g) + 1;
  const chacun = W * autres + (W === 2 ? k : INT3P[g]);
  if (chacun !== P - 1) return null;   // garde-fou : l'exemple doit atteindre exactement P − 1
  const c = R.pick([{eq: 'équipes', jeu: 'de handball'}, {eq: 'équipes', jeu: 'de football'}, {eq: 'équipes', jeu: 'de hockey'}]);
  const bar = W === 3 ? BAREME3 : BAREME2;
  const qual = k === 1 ? 'Seule la première est qualifiée' : 'Les ' + MOTS[k] + ' premières sont qualifiées';
  const q = 'Un tournoi ' + c.jeu + ' réunit ' + n + ' équipes : chaque équipe rencontre une seule fois chacune des autres. ' + bar + ' ' + qual + ', et en cas d\'égalité de points, un tirage au sort départage les équipes. Combien de points une équipe doit-elle obtenir, au minimum, pour être certaine d\'être qualifiée, quels que soient les autres résultats ?';
  const f = fin(P, [[P - 1, (P - 1) + ' ne suffit pas : ' + MOTS[g] + ' équipes peuvent finir à égalité avec ce total'], [W * (n - 1), (W * (n - 1)) + ' revient à exiger de gagner tous ses matchs'], [P + 1, null], [P - 2, null]], {max: W * (n - 1)});
  const interne = 'entre elles, ' + (W === 2 ? 'tous les matchs sont nuls' : INT3[g]);
  return sortie(q, f, 'Cherche le plus grand total que ' + MOTS[g] + ' équipes peuvent atteindre en même temps : une équipe n\'est éliminée que si ' + MOTS[k] + ' autre' + (k > 1 ? 's' : '') + ' au moins ' + (k > 1 ? 'ont' : 'a') + ' autant de points qu\'elle. Entre elles, ' + MOTS[g] + ' équipes jouent ' + C2(g) + ' ' + pl(C2(g), 'match', 'matchs') + ', qui distribuent au plus ' + W * C2(g) + ' points' + (autres > 0 ? ' ; contre ' + (autres > 1 ? 'les ' + autres + ' autres' : 'la dernière équipe') + ', elles jouent ' + g * autres + ' matchs qui rapportent au plus ' + W + ' points chacun, soit ' + W * g * autres + ' points' : '') + '. Ensemble, elles ont donc au plus ' + B + ' points. Si chacune en avait ' + P + ' ou plus, elles en auraient au moins ' + g + ' × ' + P + ' = ' + g * P + ' : impossible, donc ' + P + ' points suffisent. Avec ' + (P - 1) + ' points, ce n\'est pas sûr : ' + (autres > 0 ? 'si ' + MOTS[g] + ' équipes battent ' + (autres > 1 ? 'toutes les autres' : 'la dernière') + ' et si, ' + interne : 'si, ' + interne) + ', elles finissent toutes à ' + (P - 1) + ' points et le tirage au sort peut en éliminer une. La réponse est ' + P + '.');
}

/* =====================================================================
   Catalogue par niveau
   ===================================================================== */
const TYPES = {
  1: [g1matchs, g1matchs, g1rangs, g1depasse, g1points, g1chaine, g1chaine],
  2: [g2allerRetour, g2elim, g2pointsInv, g2chaine, g2chaine, g2rangs, g2rangs],
  3: [g3nuls, g3nuls, g3inverse, g3elim, g3poules, g3dernier, g3file, g3ordre, g3ordre, g3frise],
  4: [g4nulsInv, g4multiElim, g4poules, g4distinctes, g4dernierNuls, g4chevauche, g4ordre, g4ordre, g4frise],
  5: [g5score, g5score, g5garantie, g5garantie, g5ordre, g5ordre, g5frise]
};
function secours(){
  return {q: 'Dans un championnat, 6 équipes s\'affrontent : chaque équipe rencontre une seule fois chacune des autres. Combien de matchs sont joués au total ?',
    a: '15', accept: null, choix: ['15', '30', '36', '21'],
    expl: 'Chaque participant rencontre tous les autres une fois, et chaque rencontre concerne deux participants : on calcule n × (n − 1), puis on divise par 2. 6 × 5 = 30, et chaque match a été compté deux fois : 30 ÷ 2 = 15.'};
}

A.push({
  id: 'alb-24-classements',
  phase: 'albert',
  ordre: 24,
  theme: 'logique',
  titre: 'Classements, ordres et tournois',
  objectif: 'Reconstituer un classement à partir d\'indices, raisonner sur des rangs dans une file, et compter les matchs, les nuls et les points d\'un tournoi, sans calculatrice et avec un schéma.',
  lecon:
`<p class="lede">Classer des personnes à partir d'indices, compter les matchs d'un championnat, retrouver un rang ou le score d'une équipe : ces questions ne demandent aucune formule compliquée. Il faut surtout <mark>un schéma propre</mark> (une frise, un décompte) et <mark>un comptage honnête</mark> : chaque match concerne deux équipes, chaque match distribue un nombre connu de points.</p>
<h2>Ce que le test demande</h2>
<p>Trois familles de questions reviennent. Les <strong>ordres</strong> : qui est le troisième plus grand, qui a terminé deuxième, à partir de phrases comme « Léa est arrivée juste avant Tom ». Les <strong>rangs</strong> : une personne est 7e en partant de l'avant et 9e en partant de l'arrière, combien y a-t-il de personnes ? Les <strong>tournois</strong> : nombre de matchs, nombre de nuls, points d'une équipe, total qui garantit une qualification. Les nombres restent petits : tout se fait de tête ou avec quelques lignes de brouillon.</p>
<h2>Les prérequis</h2>
<ul>
<li>Une frise : une ligne sur laquelle tu places les personnes, de la plus grande à la plus petite, ou de la tête à la fin d'une file.</li>
<li>Quand n équipes se rencontrent toutes une fois, chacune joue n − 1 matchs, mais chaque match concerne deux équipes : il y a n × (n − 1) ÷ 2 matchs.</li>
<li>Avec le barème 3 points la victoire, 1 point le nul, 0 la défaite, un match gagné distribue 3 points et un match nul en distribue 2 (1 à chaque équipe).</li>
</ul>
<div class="formule"><p>Matchs quand chacun rencontre chacun une fois = n × (n − 1) ÷ 2</p><p>Rang en partant de l'avant + rang en partant de l'arrière = effectif + 1</p><p>Points distribués (barème 3, 1, 0) = 3 × nombre de matchs − nombre de nuls</p></div>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je traduis chaque phrase dans le même sens :</strong> « Tom est plus petit que Léa » devient « Léa &gt; Tom ». Pour une course, j'écris l'ordre d'arrivée de gauche à droite.</p>
<p><strong>2. Je commence par les indices les plus précis :</strong> une place connue, un « juste avant » (un bloc de deux), un « exactement deux personnes entre », puis seulement les « avant » et « après ».</p>
<p><strong>3. Pour un tournoi, je compte par match :</strong> combien de matchs, combien de points chaque match distribue, combien de victoires et de défaites (il y en a autant).</p>
<p><strong>4. Je vérifie :</strong> ma frise respecte toutes les phrases, mon total de points correspond à l'énoncé.</p>
</div>
<table class="tbl">
<tr><th>Situation</th><th>Calcul</th></tr>
<tr><td>n équipes, une rencontre par paire</td><td>n × (n − 1) ÷ 2 matchs</td></tr>
<tr><td>n équipes, matchs aller et retour</td><td>n × (n − 1) matchs</td></tr>
<tr><td>Élimination directe, n participants</td><td>n − 1 matchs (chaque match élimine une personne)</td></tr>
<tr><td>7e en partant de l'avant, 9e en partant de l'arrière</td><td>7 + 9 − 1 = 15 personnes</td></tr>
<tr><td>3 ex aequo à la 4e place</td><td>le suivant est 7e</td></tr>
</table>
<h2>Exemples résolus</h2>
<h3>1. Le nombre de matchs</h3>
<p>Neuf équipes se rencontrent toutes une fois. Chacune joue 8 matchs, 9 × 8 = 72, mais chaque match a été compté deux fois, une fois pour chaque équipe : <strong>36 matchs</strong>.</p>
<h3>2. Une chaîne de comparaisons</h3>
<p>Inès est plus grande que Malik, Jade est plus petite que Rayan, Malik est plus grand que Rayan, Jade est plus grande que Tom. Tout en « &gt; » : Inès &gt; Malik, Rayan &gt; Jade, Malik &gt; Rayan, Jade &gt; Tom. J'enchaîne : Inès &gt; Malik &gt; Rayan &gt; Jade &gt; Tom. Le troisième plus grand est <strong>Rayan</strong>.</p>
<h3>3. Les rangs dans une file</h3>
<p>Nora a 11 personnes devant elle, Karim a 6 personnes derrière lui, il y a 3 personnes entre eux et Nora est devant Karim. Je dessine : 11 personnes, Nora, 3 personnes, Karim, 6 personnes. Total : 11 + 1 + 3 + 1 + 6 = <strong>22</strong>. Si Karim était devant Nora, les deux groupes se chevaucheraient : tout le monde serait devant Nora ou derrière Karim, et les 3 du milieu compteraient deux fois, d'où 11 + 6 − 3 = 14.</p>
<h3>4. Au niveau du test : les matchs nuls</h3>
<p>Six équipes se rencontrent toutes une fois (3 points la victoire, 1 point à chacune pour un nul). Au total, 41 points ont été distribués. Il y a 6 × 5 ÷ 2 = 15 matchs, donc 45 points s'il n'y avait aucun nul. Un nul distribue 2 points au lieu de 3 : chaque nul coûte 1 point. 45 − 41 = 4, donc <strong>4 matchs nuls</strong>.</p>
<h2>Les réflexes sans calculatrice</h2>
<ul>
<li>Doubler le deuxième, c'est devenir deuxième, pas premier.</li>
<li>Pour retrouver n à partir d'un nombre de matchs, cherche deux entiers consécutifs dont le produit vaut le double : 28 matchs, 2 × 28 = 56 = 8 × 7, donc 8 équipes.</li>
<li>Avec le barème 2, 1, 0, chaque match distribue toujours 2 points : le total ne dépend pas des résultats.</li>
<li>Un tournoi compte autant de victoires que de défaites : c'est la clé pour retrouver le bilan d'une équipe inconnue.</li>
<li>Pour « être sûr d'être qualifié », imagine le pire : plusieurs équipes à égalité avec toi. Compte les points qu'un groupe d'équipes peut se partager au maximum.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Fais un schéma avant tout calcul : une frise pour un ordre ou une file, un décompte match par match pour un tournoi.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Compter deux fois chaque match (n × (n − 1) sans diviser par 2). Compter deux fois la personne dont on donne les deux rangs. Confondre « avant » et « juste avant ». Croire que des ex aequo ne décalent pas le rang suivant. Oublier qu'un nul donne 1 point à chacune des deux équipes. Supposer des totaux tous différents alors que l'égalité est permise.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>n × (n − 1) ÷ 2 matchs quand chacun rencontre chacun ; n − 1 matchs en élimination directe ; rang avant + rang arrière − 1 = effectif ; points distribués = 3 × matchs − nuls ; autant de victoires que de défaites.</p></div>`,
  gen(level, R){
    const n = niv(level), liste = TYPES[n];
    for (let t = 0; t < 60; t++){
      try {
        const ex = R.pick(liste)(R);
        if (valide(ex)) return ex;
      } catch (e) { /* on retente avec un autre tirage */ }
    }
    return secours();
  }
});

})();
