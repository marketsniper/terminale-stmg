/* ===== Maths · Objectif Albert School : alb-21 · Principe des tiroirs et raisonnement du pire des cas =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS.
   Toutes les réponses sont CALCULÉES par le code (aucune banque d'énoncés fixes).
   Sous-types par niveau :
     N1 : paire de même couleur (n + 1), « deux pareils » sur des catégories (jours, mois, dé, pièce…),
          au moins un objet d'une couleur précise, répartition simple (N ÷ n arrondi au-dessus).
     N2 : k de la même couleur, k personnes ou lancers identiques, k d'une couleur précise,
          un de chaque couleur ou deux couleurs différentes, jeux de cartes (32 ou 52), répartition par mois, jours, lettres.
     N3 : k de la même couleur avec une petite couleur, 3 ou 4 couleurs différentes, k de chaque couleur,
          paires de gants, plus long tirage qui évite le résultat, nombres (consécutifs, somme N + 1, chiffre des unités).
     N4 : seuils différents par couleur ou couleur qui ne compte pas, p paires de chaussettes, dés (sommes, écarts…),
          critères croisés (initiales, mois × jour), somme donnée parmi 1..N, restes (différence multiple de m,
          chiffre des unités k fois), nombre de couleurs à retrouver, grands nombres, gants dépareillés.
     N5 : somme des chiffres avec tiroirs de tailles différentes, double / divise / différence d (chaînes),
          somme multiple de m (restes complémentaires), paires de couleurs toutes différentes,
          deux exigences à la fois, dés (produits, paires sans ordre, somme de trois dés).
   Vérification indépendante : verifs/alb-21-tiroirs-verif.js (relit l'énoncé, force brute). */
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
const sum = l => l.reduce((s, x) => s + x, 0);
const et = l => (l.length < 2 ? String(l[0]) : l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1]);
const MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
const ORD = ['', 'première', 'deuxième', 'troisième', 'quatrième', 'cinquième', 'sixième', 'septième'];
const mot = (k, f) => (k === 1 ? (f ? 'une' : 'un') : (k <= 10 ? MOTS[k] : nb(k)));
const plur = (k, sg, pl) => (k > 1 ? pl : sg);
const tt = f => (f ? 'toutes' : 'tous');
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const desc = l => l.slice().sort((x, y) => y - x);
const chiffres = x => String(x).split('').reduce((s, c) => s + Number(c), 0);
const chaineTxt = c => (c.length <= 4 ? c.join(', ') : c[0] + ', ' + c[1] + ', …, ' + c[c.length - 1]);
/* Liste d'entiers croissants en clair : suites d'au moins 3 nombres écrites « les entiers de a à b ». */
function plages(l){
  const runs = []; let i = 0;
  while (i < l.length){ let j = i; while (j + 1 < l.length && l[j + 1] === l[j] + 1) j++; runs.push([l[i], l[j]]); i = j + 1; }
  const parts = [];
  runs.forEach(([x, y]) => { if (y - x >= 2) parts.push('les entiers de ' + x + ' à ' + y); else for (let v = x; v <= y; v++) parts.push(String(v)); });
  return et(parts);
}
/* Voisins de secours : a + 1, a − 1, a + 2, a − 2… (jamais en dessous de 1). */
const vois = a => k => { const v = a + (k % 2 ? (k + 1) / 2 : -k / 2); return v >= 1 ? nb(v) : null; };
/* Choix et texte des pièges : on ne commente que les distracteurs effectivement présents, jamais la bonne réponse. */
function fin(a, l){
  const ok = l.filter(x => x[0] != null && isFinite(x[0]) && x[0] > 0);
  const choix = qcm(nb(a), ok.map(x => nb(x[0])), vois(a));
  const dans = new Set(choix.map(norm)), vus = new Set([norm(nb(a))]), t = [];
  ok.forEach(([v, s]) => { const z = norm(nb(v)); if (dans.has(z) && !vus.has(z)){ vus.add(z); if (s) t.push(s); } });
  return {choix, piege: t.length ? 'Piège : ' + t.join(' ; ') + '.' : ''};
}
const sortie = (q, a, f, expl) => ({q, a: nb(a), accept: null, choix: f.choix, expl: (expl + ' ' + f.piege).trim()});

/* ---------- couleurs et objets ---------- */
const COUL = [
  {ms: 'rouge', fs: 'rouge', mp: 'rouges', fp: 'rouges'},
  {ms: 'bleu', fs: 'bleue', mp: 'bleus', fp: 'bleues'},
  {ms: 'vert', fs: 'verte', mp: 'verts', fp: 'vertes'},
  {ms: 'jaune', fs: 'jaune', mp: 'jaunes', fp: 'jaunes'},
  {ms: 'noir', fs: 'noire', mp: 'noirs', fp: 'noires'},
  {ms: 'blanc', fs: 'blanche', mp: 'blancs', fp: 'blanches'},
  {ms: 'violet', fs: 'violette', mp: 'violets', fp: 'violettes'},
  {ms: 'rose', fs: 'rose', mp: 'roses', fp: 'roses'}
];
const adj = (c, f, pl) => c[(f ? 'f' : 'm') + (pl ? 'p' : 's')];
const OBJ = [
  {pl: 'chaussettes', sg: 'chaussette', f: true, intro: 'Dans un tiroir, il y a', v: 'prendre', v3: 'prend', mode: 'dans le noir'},
  {pl: 'boules', sg: 'boule', f: true, intro: 'Un sac opaque contient', v: 'tirer', v3: 'tire', mode: 'sans regarder'},
  {pl: 'billes', sg: 'bille', f: true, intro: 'Une boîte fermée contient', v: 'sortir', v3: 'sort', mode: 'sans regarder'},
  {pl: 'bonbons', sg: 'bonbon', f: false, intro: 'Un bocal opaque contient', v: 'prendre', v3: 'prend', mode: 'les yeux fermés'},
  {pl: 'jetons', sg: 'jeton', f: false, intro: 'Une urne contient', v: 'tirer', v3: 'tire', mode: 'sans regarder'},
  {pl: 'crayons', sg: 'crayon', f: false, intro: 'Une trousse contient', v: 'sortir', v3: 'sort', mode: 'sans regarder'},
  {pl: 'perles', sg: 'perle', f: true, intro: 'Un sachet contient', v: 'prendre', v3: 'prend', mode: 'sans regarder'},
  {pl: 'cubes', sg: 'cube', f: false, intro: 'Un carton contient', v: 'sortir', v3: 'sort', mode: 'sans regarder'}
];
const un = o => (o.f ? 'une' : 'un');
const deN = w => (/^[aeiouyéèêàâh]/i.test(w) ? "d'" : 'de ') + w;
const qQue = (c, f) => (c === 1 ? (f ? "qu'une" : "qu'un") : 'que ' + c);
const autresCoul = n => (n === 2 ? "de l'autre couleur" : 'des autres couleurs');
const autresDonnent = n => (n === 2 ? "L'autre couleur donne " : 'Les autres couleurs donnent ');
/* Sac : n couleurs ; distinct = effectifs tous différents. */
function sac(R, n, lo, hi, distinct, o){
  const obj = o || R.pick(OBJ), cols = R.shuffle(COUL).slice(0, n);
  const cs = distinct ? R.shuffle(range(lo, hi)).slice(0, n) : cols.map(() => R.int(lo, hi));
  return {o: obj, cols, cs};
}
const compo = s => et(s.cols.map((c, i) => nb(s.cs[i]) + (i === 0 ? ' ' + plur(s.cs[i], s.o.sg, s.o.pl) : '') + ' ' + adj(c, s.o.f, s.cs[i] > 1)));
const qSac = (s, cond) => s.o.intro + ' ' + compo(s) + '. Combien de ' + s.o.pl + ' faut-il ' + s.o.v + ' au minimum, ' + s.o.mode + ", pour être sûr d'avoir " + cond + ' ?';
const lotc = (o, c, k) => nb(k) + ' ' + adj(c, o.f, k > 1);
const colP = (o, c) => adj(c, o.f, true);
/* Met en tête une couleur dont l'effectif dépasse 1 (pour que « 1 boule jaune » ne soit jamais en premier). */
function premierGros(s){
  const i = s.cs.findIndex(c => c > 1);
  if (i > 0){ [s.cs[0], s.cs[i]] = [s.cs[i], s.cs[0]]; [s.cols[0], s.cols[i]] = [s.cols[i], s.cols[0]]; }
  return s;
}

/* ---------- catégories « tiroirs » ---------- */
const GENS = [{n: 'personnes', f: true}, {n: 'élèves', f: false}, {n: 'invités', f: false}, {n: 'joueuses', f: true}, {n: 'salariés', f: false}, {n: 'spectatrices', f: true}];
const prem = f => (f ? 'premières' : 'premiers');
function catPers(R, k, pred, b, tir){
  const g = R.pick(GENS);
  return {q: 'Combien ' + deN(g.n) + ' faut-il réunir au minimum pour être sûr que ' + MOTS[k] + " d'entre " + (g.f ? 'elles' : 'eux') + ' ' + pred(g.f) + ' ?', b, tir, obj: g.n, f: g.f};
}
const CATS = {
  jour: (R, k) => catPers(R, k, f => 'sont ' + (f ? 'nées' : 'nés') + ' le même jour de la semaine', 7, 'les 7 jours de la semaine'),
  mois: (R, k) => catPers(R, k, f => 'sont ' + (f ? 'nées' : 'nés') + ' le même mois', 12, 'les 12 mois'),
  saison: (R, k) => catPers(R, k, f => 'sont ' + (f ? 'nées' : 'nés') + ' la même saison (printemps, été, automne ou hiver)', 4, 'les 4 saisons'),
  lettre: (R, k) => catPers(R, k, () => 'ont un prénom qui commence par la même lettre (26 lettres possibles)', 26, 'les 26 lettres'),
  de: (R, k) => ({q: "On lance plusieurs fois un dé à six faces. Combien de lancers faut-il au minimum pour être sûr d'obtenir " + MOTS[k] + ' fois le même numéro ?', b: 6, tir: 'les 6 numéros du dé', obj: 'lancers', f: false}),
  piece: (R, k) => ({q: "On lance plusieurs fois une pièce de monnaie. Combien de lancers faut-il au minimum pour être sûr d'obtenir " + MOTS[k] + ' fois le même côté (pile ou face) ?', b: 2, tir: 'les 2 côtés, pile et face', obj: 'lancers', f: false}),
  unites: (R, k) => ({q: "Combien d'entiers différents faut-il choisir au minimum pour être sûr que " + MOTS[k] + " d'entre eux ont le même chiffre des unités ?", b: 10, tir: 'les 10 chiffres des unités possibles (0, 1, 2, …, 9)', obj: 'entiers choisis', f: false}),
  cartes: (R, k) => ({q: 'Un jeu de 52 cartes compte 4 couleurs (cœur, carreau, pique, trèfle) de 13 cartes chacune. On tire des cartes sans les regarder. Combien de cartes faut-il tirer au minimum pour être sûr d\'en avoir ' + MOTS[k] + ' de la même couleur ?', b: 4, tir: 'les 4 couleurs (cœur, carreau, pique, trèfle)', obj: 'cartes', f: true}),
  notes: (R, k) => ({q: 'Un professeur corrige des copies notées sur 20, avec des notes entières de 0 à 20. Combien de copies doit-il corriger au minimum pour être sûr que ' + MOTS[k] + " d'entre elles ont la même note ?", b: 21, tir: 'les 21 notes possibles (de 0 à 20)', obj: 'copies', f: true, note: true})
};

/* =====================================================================
   NIVEAU 1
   ===================================================================== */

/* 1A · une paire de même couleur : nombre de couleurs + 1 */
function g1paire(R){
  const n = R.pick([2, 2, 3, 3, 4]), s = sac(R, n, 5, 12), o = s.o, a = n + 1, cmax = Math.max(...s.cs);
  const f = fin(a, [
    [2, '2 est le cas chanceux, pas le cas sûr'],
    [n, n + ' oublie le « + 1 » : ' + n + ' ' + o.pl + ' peuvent encore être de ' + n + ' couleurs différentes'],
    [cmax + 1, nb(cmax + 1) + " répond à une autre question (être sûr d'avoir deux couleurs différentes)"],
    [sum(s.cs), nb(sum(s.cs)) + ' est le nombre total de ' + o.pl + ', bien plus que nécessaire']
  ]);
  return sortie(qSac(s, 'deux ' + o.pl + ' de la même couleur'), a, f,
    'Imagine le pire des cas : le plus de ' + o.pl + ' possible sans en avoir deux de la même couleur, puis ajoute 1. '
    + "Il n'y a que " + n + ' couleurs : tu peux tomber sur ' + et(s.cols.map(c => un(o) + ' ' + adj(c, o.f, false))) + ', soit ' + n + ' ' + o.pl + ' de couleurs toutes différentes. '
    + 'Au tirage suivant, la couleur obtenue est forcément déjà sortie : tu as ta paire. Il faut donc ' + n + ' + 1 = ' + a + ' ' + o.pl + '. '
    + 'Les quantités de chaque couleur ne changent rien ici : seul compte le nombre de couleurs.');
}

/* 1B · « deux pareils » sur des catégories : nombre de tiroirs + 1 */
function g1cat(R){
  const c = CATS[R.pick(['jour', 'mois', 'saison', 'lettre', 'de', 'piece', 'unites', 'cartes'])](R, 2), b = c.b, a = b + 1;
  const f = fin(a, [
    [b, nb(b) + ' ne suffit pas, car ' + nb(b) + ' ' + c.obj + ' peuvent occuper ' + nb(b) + ' tiroirs différents'],
    [2 * b, nb(2 * b) + " place deux éléments dans chaque tiroir, c'est bien plus que nécessaire"],
    [b + 2, ''], [2 * b + 1, '']
  ]);
  return sortie(c.q, a, f,
    "Compte les « tiroirs », c'est-à-dire les résultats possibles, puis ajoute 1. "
    + 'Ici, les tiroirs sont ' + c.tir + '. Dans le pire des cas, les ' + nb(b) + ' ' + prem(c.f) + ' ' + c.obj + ' occupent ' + nb(b) + ' tiroirs différents. '
    + 'Avec un de plus, deux tombent forcément dans le même tiroir : il faut ' + nb(b) + ' + 1 = ' + nb(a) + '.');
}

/* 1C · au moins un objet d'une couleur précise : toutes les autres + 1 */
function g1une(R){
  const n = R.pick([2, 3, 3, 4]), s = sac(R, n, 2, 9), o = s.o, t = R.int(0, n - 1), c = s.cols[t];
  const autres = sum(s.cs) - s.cs[t], a = autres + 1;
  const lst = s.cols.map((x, i) => (i === t ? null : lotc(o, x, s.cs[i]))).filter(Boolean);
  const f = fin(a, [
    [1, '1 est le cas chanceux'],
    [s.cs[t] + 1, nb(s.cs[t] + 1) + ' part du nombre de ' + o.pl + ' ' + colP(o, c) + ", alors que ce sont les autres qui peuvent sortir d'abord"],
    [autres, nb(autres) + ' oublie le « + 1 »'],
    [n + 1, nb(n + 1) + ' répond à « deux ' + o.pl + ' de la même couleur »']
  ]);
  return sortie(qSac(s, 'au moins ' + un(o) + ' ' + o.sg + ' ' + adj(c, o.f, false)), a, f,
    'Pire des cas : ' + tt(o.f) + ' les ' + o.pl + ' ' + autresCoul(n) + " sortent d'abord, puis ajoute 1. "
    + autresDonnent(n) + et(lst) + ', soit ' + nb(autres) + ' ' + o.pl + ' sans ' + o.sg + ' ' + adj(c, o.f, false) + '. '
    + 'Une fois ' + (o.f ? 'celles-ci sorties' : 'ceux-ci sortis') + ', il ne reste que des ' + o.pl + ' ' + colP(o, c) + ' : il faut ' + nb(autres) + ' + 1 = ' + nb(a) + '.');
}

/* 1D et 2F · répartition : la boîte la plus remplie en contient au moins N ÷ n arrondi au-dessus */
const REP = [
  {intro: (N, n) => 'On range ' + nb(N) + ' livres sur ' + nb(n) + ' étagères.', q: "Quel est le plus petit nombre de livres que peut porter l'étagère la plus chargée ?", o: 'livres', bs: 'étagère', bp: 'étagères', f: true},
  {intro: (N, n) => 'On répartit ' + nb(N) + ' billes dans ' + nb(n) + ' boîtes.', q: 'Quel est le plus petit nombre de billes que peut contenir la boîte la plus remplie ?', o: 'billes', bs: 'boîte', bp: 'boîtes', f: true},
  {intro: (N, n) => nb(N) + ' élèves se répartissent dans ' + nb(n) + ' salles.', q: "Quel est le plus petit nombre d'élèves que peut accueillir la salle la plus remplie ?", o: 'élèves', bs: 'salle', bp: 'salles', f: true},
  {intro: (N, n) => nb(N) + ' pigeons rentrent dans ' + nb(n) + ' nichoirs.', q: 'Quel est le plus petit nombre de pigeons que peut abriter le nichoir le plus occupé ?', o: 'pigeons', bs: 'nichoir', bp: 'nichoirs', f: false},
  {intro: (N, n) => 'Un facteur distribue ' + nb(N) + ' lettres dans ' + nb(n) + ' boîtes aux lettres.', q: 'Quel est le plus petit nombre de lettres que peut recevoir la boîte la mieux servie ?', o: 'lettres', bs: 'boîte aux lettres', bp: 'boîtes aux lettres', f: true},
  {intro: (N, n) => 'On colle ' + nb(N) + ' photos dans ' + nb(n) + ' albums.', q: "Quel est le plus petit nombre de photos que peut contenir l'album le plus rempli ?", o: 'photos', bs: 'album', bp: 'albums', f: false}
];
function explRepart(N, n, o, bs, bp, f){
  const q = Math.floor(N / n), r = N % n;
  const meth = 'Répartis les ' + o + " le plus équitablement possible : c'est la répartition où la plus remplie l'est le moins. ";
  if (r === 0) return meth + nb(N) + ' = ' + nb(n) + ' × ' + nb(q) + ' : on peut mettre exactement ' + nb(q) + ' ' + o + ' dans chaque ' + bs + ', et on ne peut pas faire moins, car ' + nb(n) + ' × ' + nb(q - 1) + ' = ' + nb(n * (q - 1)) + ', moins que ' + nb(N) + '. La réponse est ' + nb(q) + '.';
  return meth + nb(N) + ' = ' + nb(n) + ' × ' + nb(q) + ' + ' + nb(r) + ' : avec ' + nb(q) + ' ' + o + ' dans chaque ' + bs + ", on n'en place que " + nb(n * q) + ' ; il en reste ' + nb(r) + ', donc au moins ' + (f ? 'une' : 'un') + ' ' + bs + ' en reçoit ' + nb(q + 1) + '. '
    + 'Et ' + nb(q + 1) + ' suffit : on en met ' + nb(q + 1) + ' dans ' + nb(r) + ' ' + (r > 1 ? bp : bs) + ' et ' + nb(q) + ' dans les autres. La réponse est ' + nb(q + 1) + '.';
}
function g1repart(R){
  const n = R.int(3, 7), N = R.pick([n * R.int(2, 6), R.int(2 * n + 1, 6 * n), R.int(2 * n + 1, 6 * n)]), c = R.pick(REP);
  const q = Math.floor(N / n), r = N % n, a = Math.ceil(N / n);
  const f = fin(a, [
    [r ? q : null, nb(q) + " arrondit à l'inférieur : il reste des " + c.o + ' à placer'],
    [r ? null : q + 1, nb(q + 1) + ' ajoute 1 par réflexe alors que la division tombe juste'],
    [r, nb(r) + " est le reste de la division, pas la réponse"],
    [n, nb(n) + ' est le nombre ' + deN(c.bp)],
    [a + 1, '']
  ]);
  return sortie(c.intro(N, n) + ' ' + c.q, a, f, explRepart(N, n, c.o, c.bs, c.bp, c.f));
}

/* =====================================================================
   NIVEAU 2
   ===================================================================== */

/* 2A · k de la même couleur (toutes les couleurs en ont assez) : n(k − 1) + 1 */
function g2meme(R){
  const n = R.pick([2, 3, 3, 4]), k = R.pick([3, 3, 4, 4, 5]), s = sac(R, n, k, k + 8), o = s.o;
  const m = n * (k - 1), a = m + 1;
  const f = fin(a, [
    [n * k, nb(n * k) + ' revient à exiger ' + k + ' ' + o.pl + ' de chaque couleur'],
    [m, nb(m) + ' oublie le « + 1 »'],
    [k, k + ' est le cas chanceux'],
    [n * k + 1, ''], [n + k, '']
  ]);
  return sortie(qSac(s, mot(k, o.f) + ' ' + o.pl + ' de la même couleur'), a, f,
    'Pire des cas : prends le plus de ' + o.pl + ' possible sans en avoir ' + k + " de la même couleur, c'est-à-dire " + (k - 1) + ' de chaque couleur, puis ajoute 1. '
    + 'Chaque couleur en contient au moins ' + (k - 1) + ', donc tu peux tirer ' + et(s.cols.map(c => lotc(o, c, k - 1))) + ' : ' + n + ' × ' + (k - 1) + ' = ' + m + ' ' + o.pl + ' sans en avoir ' + k + ' de la même couleur. '
    + 'Au tirage suivant, la couleur obtenue passe forcément à ' + k + ' : il faut ' + m + ' + 1 = ' + a + ' ' + o.pl + '.');
}

/* 2B · k personnes, lancers ou cartes dans le même tiroir : b(k − 1) + 1 */
function g2cat(R){
  const cle = R.pick(['jour', 'mois', 'saison', 'lettre', 'de', 'piece', 'unites', 'cartes', 'notes']);
  const k = cle === 'notes' ? R.pick([2, 3]) : cle === 'lettre' ? 3 : cle === 'piece' ? R.pick([3, 4, 5, 6]) : R.pick([3, 4, 5]);
  const c = CATS[cle](R, k), b = c.b, m = b * (k - 1), a = m + 1;
  const f = fin(a, [
    [c.note ? 20 * (k - 1) + 1 : null, nb(20 * (k - 1) + 1) + ' oublie la note 0 : de 0 à 20, il y a 21 notes possibles, pas 20'],
    [b * k, nb(b * k) + ' supposerait ' + k + ' éléments dans chaque tiroir'],
    [m, nb(m) + ' oublie le « + 1 »'],
    [b + k, ''], [b * k + 1, '']
  ]);
  return sortie(c.q, a, f,
    'Compte les tiroirs, mets-en ' + (k - 1) + ' dans chacun sans atteindre ' + k + ', puis ajoute 1. '
    + 'Ici, les tiroirs sont ' + c.tir + '. Dans le pire des cas, ' + (k === 2 ? 'les ' + nb(b) + ' ' + prem(c.f) + ' ' + c.obj + ' occupent ' + nb(b) + ' tiroirs différents, sans deux dans le même tiroir. ' : 'chaque tiroir reçoit ' + (k - 1) + ' ' + c.obj + ', soit ' + nb(b) + ' × ' + (k - 1) + ' = ' + nb(m) + ' sans en avoir ' + k + ' dans le même tiroir. ')
    + 'Avec un de plus, un tiroir en reçoit forcément ' + k + ' : il faut ' + nb(m) + ' + 1 = ' + nb(a) + '.');
}

/* 2C · au moins k objets d'une couleur précise : toutes les autres + k */
function g2prec(R){
  const n = R.pick([2, 3, 3, 4]), k = R.pick([2, 3, 3, 4, 5]), s = sac(R, n, 2, 12), o = s.o, t = R.int(0, n - 1);
  if (s.cs[t] < k + 1) s.cs[t] = k + 1 + R.int(0, 6);
  const c = s.cols[t], autres = sum(s.cs) - s.cs[t], a = autres + k, cA = colP(o, c);
  const lst = s.cols.map((x, i) => (i === t ? null : lotc(o, x, s.cs[i]))).filter(Boolean);
  const f = fin(a, [
    [autres + 1, nb(autres + 1) + " ne garantit qu'" + un(o) + ' seul' + (o.f ? 'e' : '') + ' ' + o.sg + ' ' + adj(c, o.f, false)],
    [n * (k - 1) + 1, nb(n * (k - 1) + 1) + ' répond à « ' + k + ' ' + o.pl + ' de la même couleur », pas forcément ' + cA],
    [k, k + ' est le cas chanceux'],
    [autres + k - 1, nb(autres + k - 1) + ' ne donne que ' + (k - 1) + ' ' + plur(k - 1, adj(c, o.f, false), cA) + ' dans le pire des cas'],
    [s.cs[t] + k, '']
  ]);
  return sortie(qSac(s, 'au moins ' + mot(k, o.f) + ' ' + o.pl + ' ' + cA), a, f,
    'Pire des cas : ' + tt(o.f) + ' les ' + o.pl + ' ' + autresCoul(n) + " sortent d'abord, puis il faut encore " + k + ' ' + o.pl + ' ' + cA + '. '
    + autresDonnent(n) + et(lst) + ', soit ' + nb(autres) + ' ' + o.pl + '. Une fois ' + (o.f ? 'celles-ci sorties' : 'ceux-ci sortis') + ', chaque tirage donne ' + un(o) + ' ' + o.sg + ' ' + adj(c, o.f, false) + ' : il faut ' + nb(autres) + ' + ' + k + ' = ' + nb(a) + ' ' + o.pl + '.');
}

/* 2D · au moins un objet de chaque couleur : total − plus petite couleur + 1 */
function g2chaque(R){
  const n = R.pick([2, 3, 3, 4]), s = sac(R, n, 2, 12, true), o = s.o, tot = sum(s.cs);
  const cmin = Math.min(...s.cs), cmax = Math.max(...s.cs), im = s.cs.indexOf(cmin), cm = s.cols[im];
  if (n >= 3 && R.int(0, 1)){
    const cM = s.cols[s.cs.indexOf(cmax)], a2 = cmax + 1, petite = cmin + 1;
    const f2 = fin(a2, [
      [2, '2 est le cas chanceux'],
      [petite, nb(petite) + " part de la couleur la moins nombreuse : ce n'est pas le pire des cas"],
      [tot - cmin + 1, nb(tot - cmin + 1) + ' répondrait à « au moins ' + un(o) + ' ' + o.sg + ' de chaque couleur »'],
      [cmax, nb(cmax) + ' oublie le « + 1 »']
    ]);
    return sortie(qSac(s, 'deux ' + o.pl + ' de couleurs différentes'), a2, f2,
      "Pire des cas : tu tires d'abord " + tt(o.f) + ' les ' + o.pl + ' de la couleur la plus nombreuse, puis ajoute 1. '
      + 'La couleur la plus nombreuse est celle des ' + o.pl + ' ' + colP(o, cM) + ' (' + cmax + ') : tu peux les tirer ' + tt(o.f) + ' sans avoir deux couleurs différentes. '
      + 'Au tirage suivant, une autre couleur apparaît forcément : il faut ' + cmax + ' + 1 = ' + a2 + ' ' + o.pl + '.');
  }
  const a = tot - cmin + 1;
  const f = fin(a, [
    [n, nb(n) + ' est le cas chanceux (' + un(o) + ' de chaque couleur dès le début)'],
    [tot - cmax + 1, nb(tot - cmax + 1) + " correspond au cas où la couleur la plus nombreuse sort en dernier : ce n'est pas le pire des cas"],
    [tot - cmin, nb(tot - cmin) + ' oublie le « + 1 »'],
    [n + 1, '']
  ]);
  return sortie(qSac(s, 'au moins ' + un(o) + ' ' + o.sg + ' de chaque couleur'), a, f,
    "Pire des cas : tu vides d'abord toutes les couleurs sauf la moins nombreuse, puis ajoute 1. "
    + 'La couleur la moins nombreuse est celle des ' + o.pl + ' ' + colP(o, cm) + ' (' + cmin + '). Dans le pire des cas, ' + tt(o.f) + " les autres sortent d'abord : " + nb(tot - cmin) + ' ' + o.pl + ' sans ' + o.sg + ' ' + adj(cm, o.f, false) + '. '
    + 'Au tirage suivant, il ne reste que des ' + o.pl + ' ' + colP(o, cm) + ' : il faut ' + nb(tot - cmin) + ' + 1 = ' + nb(a) + '.');
}

/* 2E · jeux de cartes (32 ou 52) */
function g2cartes(R){
  const d = R.pick([32, 52]), s = d / 4;
  const deck = d === 52
    ? "Un jeu de 52 cartes compte 4 couleurs (cœur, carreau, pique, trèfle) de 13 cartes chacune : l'as, les cartes de 2 à 10, le valet, la dame et le roi."
    : 'Un jeu de 32 cartes compte 4 couleurs (cœur, carreau, pique, trèfle) de 8 cartes chacune : 7, 8, 9, 10, valet, dame, roi et as.';
  const debut = deck + ' On tire des cartes sans les regarder. Combien de cartes faut-il tirer au minimum pour être sûr d\'avoir ';
  const t = R.int(1, 8);
  if (t === 1){
    const a = 5, f = fin(a, [[4, '4 oublie le « + 1 »'], [s + 1, nb(s + 1) + ' confond les couleurs avec les hauteurs'], [2, '2 est le cas chanceux'], [3, '']]);
    return sortie(debut + 'deux cartes de la même couleur (cœur, carreau, pique ou trèfle) ?', a, f,
      'Les tiroirs sont les 4 couleurs : dans le pire des cas, une carte de chaque couleur, puis ajoute 1. Les 4 premières cartes peuvent être un cœur, un carreau, un pique et un trèfle. La cinquième a forcément une couleur déjà sortie : il faut 4 + 1 = 5 cartes.');
  }
  if (t === 2){
    const k = R.pick([1, 2, 3]), a = d - s + k;
    const f = fin(a, [[k > 1 ? d - s + 1 : null, nb(d - s + 1) + " ne garantit qu'un seul cœur"], [k, k + ' est le cas chanceux'], [s + k, nb(s + k) + ' part des ' + s + ' cœurs au lieu des autres cartes'], [d - s + k - 1, nb(d - s + k - 1) + ' oublie la dernière carte'], [4 * (k - 1) + 1, '']]);
    return sortie(debut + (k === 1 ? 'au moins un cœur ?' : 'au moins ' + MOTS[k] + ' cœurs ?'), a, f,
      "Pire des cas : toutes les cartes qui ne sont pas des cœurs sortent d'abord, puis il faut encore " + (k === 1 ? 'un cœur' : k + ' cœurs') + '. '
      + 'Il y a ' + d + ' − ' + s + ' = ' + (d - s) + ' cartes qui ne sont pas des cœurs. Une fois sorties, chaque carte est un cœur : il faut ' + (d - s) + ' + ' + k + ' = ' + a + ' cartes.');
  }
  if (t === 3){
    const a = 3 * s + 1;
    const f = fin(a, [[4, '4 est le cas chanceux'], [5, '5 répond à « deux cartes de la même couleur »'], [3 * s, nb(3 * s) + ' oublie le « + 1 »'], [2 * s + 1, nb(2 * s + 1) + ' ne vide que deux couleurs']]);
    return sortie(debut + 'au moins une carte de chaque couleur ?', a, f,
      "Pire des cas : trois couleurs entières sortent d'abord, puis ajoute 1. Les 3 × " + s + ' = ' + (3 * s) + ' cartes de trois couleurs (par exemple tous les cœurs, carreaux et piques) peuvent sortir sans un seul trèfle. La carte suivante est forcément de la quatrième couleur : il faut ' + (3 * s) + ' + 1 = ' + a + ' cartes.');
  }
  if (t === 4){
    const a = s + 1;
    const f = fin(a, [[s, nb(s) + ' oublie le « + 1 »'], [5, '5 répond à « deux cartes de la même couleur »'], [2 * s + 1, ''], [s + 2, '']]);
    return sortie(debut + 'deux cartes de la même hauteur (par exemple deux rois) ?', a, f,
      'Les tiroirs sont les hauteurs : compte-les, puis ajoute 1. Il y a ' + s + ' hauteurs (' + (d === 52 ? "de l'as au roi" : 'du 7 à l\'as') + '). Dans le pire des cas, les ' + s + ' premières cartes ont toutes des hauteurs différentes. La suivante en répète forcément une : il faut ' + s + ' + 1 = ' + a + ' cartes.');
  }
  if (t === 5){
    const a = d - 3;
    const f = fin(a, [[d - 4, nb(d - 4) + ' oublie le « + 1 »'], [5, '5 compte les 4 as plus 1, comme si les as sortaient en premier'], [2, ''], [s + 1, '']]);
    return sortie(debut + 'au moins un as ?', a, f,
      "Pire des cas : toutes les cartes qui ne sont pas des as sortent d'abord, puis ajoute 1. Il y a 4 as, donc " + d + ' − 4 = ' + (d - 4) + ' autres cartes. Une fois sorties, il ne reste que des as : il faut ' + (d - 4) + ' + 1 = ' + a + ' cartes.');
  }
  if (t === 6){
    const a = d - 11;
    const f = fin(a, [[d - 12, nb(d - 12) + ' oublie le « + 1 »'], [13, '13 compte les 12 figures plus 1, comme si elles sortaient en premier'], [4, ''], [d - 3, nb(d - 3) + ' ne compte que les rois comme figures']]);
    return sortie(debut + 'au moins une figure (un valet, une dame ou un roi) ?', a, f,
      "Pire des cas : toutes les cartes qui ne sont pas des figures sortent d'abord, puis ajoute 1. Il y a 3 × 4 = 12 figures, donc " + d + ' − 12 = ' + (d - 12) + ' autres cartes. Il faut ' + (d - 12) + ' + 1 = ' + a + ' cartes.');
  }
  if (t === 7){
    const a = d / 2 + 1;
    const f = fin(a, [[d / 2, nb(d / 2) + ' oublie le « + 1 »'], [2, '2 est le cas chanceux'], [3, '3 répond à « deux cartes de la même couleur, rouge ou noire »'], [s + 1, '']]);
    return sortie(debut.replace(' On tire', ' Les cœurs et les carreaux sont rouges, les piques et les trèfles sont noirs. On tire') + 'au moins une carte rouge ?', a, f,
      "Pire des cas : toutes les cartes noires sortent d'abord, puis ajoute 1. Il y a " + (d / 2) + ' cartes noires (piques et trèfles). Une fois sorties, il ne reste que des rouges : il faut ' + (d / 2) + ' + 1 = ' + a + ' cartes.');
  }
  const k = R.pick([3, 4]), a = 4 * (k - 1) + 1;
  const f = fin(a, [[4 * k, nb(4 * k) + ' exigerait ' + k + ' cartes de chaque couleur'], [4 * (k - 1), nb(4 * (k - 1)) + ' oublie le « + 1 »'], [k, k + ' est le cas chanceux'], [4 * k + 1, '']]);
  return sortie(debut + MOTS[k] + ' cartes de la même couleur (cœur, carreau, pique ou trèfle) ?', a, f,
    'Les tiroirs sont les 4 couleurs : dans le pire des cas, ' + (k - 1) + ' cartes de chaque couleur, puis ajoute 1. Cela fait 4 × ' + (k - 1) + ' = ' + (4 * (k - 1)) + ' cartes sans en avoir ' + k + ' de la même couleur. La suivante fait monter une couleur à ' + k + ' : il faut ' + (4 * (k - 1)) + ' + 1 = ' + a + ' cartes.');
}

/* 2F · répartition selon une catégorie (mois, jours, lettres, saisons) */
const GROUPES = [
  {b: 12, txt: 'selon leur mois de naissance', tir: 'les 12 mois'},
  {b: 7, txt: 'selon le jour de la semaine de leur naissance', tir: 'les 7 jours de la semaine'},
  {b: 26, txt: 'selon la première lettre de leur prénom (26 lettres possibles)', tir: 'les 26 lettres'},
  {b: 4, txt: 'selon leur saison de naissance', tir: 'les 4 saisons'}
];
const LIEUX = [
  {i: N => 'Un lycée compte ' + nb(N) + ' élèves.', o: "d'élèves", p: 'élèves'},
  {i: N => 'Une entreprise emploie ' + nb(N) + ' salariés.', o: 'de salariés', p: 'salariés'},
  {i: N => 'Un club de sport compte ' + nb(N) + ' adhérents.', o: "d'adhérents", p: 'adhérents'},
  {i: N => 'Un festival accueille ' + nb(N) + ' bénévoles.', o: 'de bénévoles', p: 'bénévoles'}
];
function g2repart(R){
  const g = R.pick(GROUPES), l = R.pick(LIEUX), b = g.b;
  const N = R.int(0, 4) === 0 ? b * R.int(5, 30) : R.int(5 * b + 1, 30 * b), q = Math.floor(N / b), r = N % b, a = Math.ceil(N / b);
  const f = fin(a, [
    [r ? Math.round(N / b * 10) / 10 : null, nb(N / b, 1) + " n'est pas un nombre de personnes : il faut arrondir, et vers le haut"],
    [r ? q : null, nb(q) + " arrondit à l'inférieur"],
    [r ? null : q + 1, nb(q + 1) + ' ajoute 1 par réflexe alors que la division tombe juste'],
    [r, nb(r) + ' est le reste de la division, pas la réponse'],
    [a + 1, '']
  ]);
  return sortie(l.i(N) + ' On les regroupe ' + g.txt + '. Quel est le plus petit nombre ' + l.o + ' que peut compter le groupe le plus nombreux ?', a, f,
    'Divise le nombre de personnes par le nombre de groupes possibles, puis arrondis à l\'entier supérieur si la division ne tombe pas juste. Les groupes sont ' + g.tir + '. '
    + (r === 0
      ? nb(N) + ' = ' + b + ' × ' + nb(q) + ' : on peut mettre exactement ' + nb(q) + ' ' + l.p + ' dans chaque groupe ; et le groupe le plus nombreux ne peut pas en compter moins, sinon il y aurait au plus ' + b + ' × ' + nb(q - 1) + ' = ' + nb(b * (q - 1)) + ' personnes. La réponse est ' + nb(q) + '.'
      : nb(N) + ' = ' + b + ' × ' + nb(q) + ' + ' + nb(r) + ' : avec ' + nb(q) + ' ' + l.p + " par groupe, on n'en place que " + nb(b * q) + ' ; il en reste ' + nb(r) + ', donc un groupe en compte au moins ' + nb(q + 1) + ', et une répartition presque égale atteint exactement ' + nb(q + 1) + '. La réponse est ' + nb(a) + '.'));
}

/* =====================================================================
   NIVEAU 3
   ===================================================================== */

/* 3A · k de la même couleur quand une couleur en contient trop peu : Σ min(c, k − 1) + 1 */
function g3cap(R){
  const k = R.pick([3, 4, 4, 5]), n = R.pick([3, 3, 4]), s = sac(R, n, k, k + 7), o = s.o;
  const petit = R.int(0, 3) > 0;
  if (petit) s.cs[n - 1] = R.int(1, k - 2);
  premierGros(s);
  const mins = s.cs.map(c => Math.min(c, k - 1)), S = sum(mins), a = S + 1;
  const ip = s.cs.findIndex(c => c < k - 1);
  const f = fin(a, [
    [ip >= 0 ? n * (k - 1) + 1 : null, ip >= 0 ? nb(n * (k - 1) + 1) + " suppose qu'on peut prendre " + (k - 1) + ' ' + colP(o, s.cols[ip]) + ", or il n'y en a " + qQue(s.cs[ip], o.f) : ''],
    [n * k, nb(n * k) + ' exigerait ' + k + ' ' + o.pl + ' de chaque couleur'],
    [S, nb(S) + ' oublie le « + 1 »'],
    [k, k + ' est le cas chanceux'],
    [n * (k - 1), '']
  ]);
  return sortie(qSac(s, mot(k, o.f) + ' ' + o.pl + ' de la même couleur'), a, f,
    'Pire des cas : de chaque couleur, prends le plus possible sans atteindre ' + k + ' (' + (k - 1) + ', ou toute la couleur si elle en contient moins), puis ajoute 1. '
    + 'Ici : ' + et(s.cols.map((c, i) => lotc(o, c, mins[i]) + (s.cs[i] < k - 1 ? " (il n'y en a pas plus)" : ''))) + ', soit ' + S + ' ' + o.pl + ' sans en avoir ' + k + ' de la même couleur. '
    + 'Au tirage suivant, ' + (o.f ? 'la ' + o.sg + ' tirée' : 'le ' + o.sg + ' tiré') + " vient d'une couleur qui en a déjà " + (k - 1) + ' : il faut ' + S + ' + 1 = ' + a + ' ' + o.pl + '.');
}

/* 3B · au moins m couleurs différentes (m ≥ 3) : somme des (m − 1) plus grandes couleurs + 1 */
function g3diff(R){
  const n = R.pick([4, 4, 5]), m = n === 4 ? 3 : R.pick([3, 4]), s = sac(R, n, 2, 12, true), o = s.o;
  const d = desc(s.cs), top = d.slice(0, m - 1), S = sum(top), a = S + 1, tot = sum(s.cs);
  const nomDe = v => colP(o, s.cols[s.cs.indexOf(v)]);
  const petites = sum(desc(s.cs).reverse().slice(0, m - 1)) + 1;
  const f = fin(a, [
    [m, m + ' est le cas chanceux'],
    [petites, nb(petites) + " vide d'abord les couleurs les moins nombreuses : ce n'est pas le pire des cas"],
    [d[0] + 1, nb(d[0] + 1) + " ne bloque qu'une couleur, alors qu'on peut en vider " + (m - 1)],
    [tot - Math.min(...s.cs) + 1, nb(tot - Math.min(...s.cs) + 1) + ' répondrait à « au moins ' + un(o) + ' ' + o.sg + ' de chaque couleur »'],
    [S, nb(S) + ' oublie le « + 1 »']
  ]);
  return sortie(qSac(s, 'des ' + o.pl + " d'au moins " + MOTS[m] + ' couleurs différentes'), a, f,
    "Pire des cas : tu tires d'abord " + tt(o.f) + ' les ' + o.pl + ' des ' + MOTS[m - 1] + ' couleurs les plus nombreuses, puis ajoute 1. '
    + 'Ce sont ' + et(top.map(v => 'les ' + nomDe(v) + ' (' + v + ')')) + ' : tu peux tirer ces ' + top.join(' + ') + ' = ' + S + ' ' + o.pl + ' en ne voyant que ' + MOTS[m - 1] + ' couleurs. '
    + 'Au tirage suivant, une nouvelle couleur apparaît forcément : il faut ' + S + ' + 1 = ' + a + ' ' + o.pl + '.');
}

/* 3C · au moins k objets de chaque couleur : total − plus petite couleur + k */
function g3chaque(R){
  const n = R.pick([2, 3, 3, 4]), k = R.pick([2, 3]), s = sac(R, n, k + 1, 12, true), o = s.o, tot = sum(s.cs);
  const cmin = Math.min(...s.cs), cmax = Math.max(...s.cs), cm = s.cols[s.cs.indexOf(cmin)], X = tot - cmin + k - 1, a = X + 1;
  const f = fin(a, [
    [n * k, nb(n * k) + ' suppose un tirage parfaitement réparti'],
    [tot - cmax + k, nb(tot - cmax + k) + " bloque la couleur la plus nombreuse, ce n'est pas le pire des cas"],
    [tot - cmin + 1, nb(tot - cmin + 1) + " ne garantit qu'" + un(o) + ' ' + o.sg + ' ' + adj(cm, o.f, false)],
    [X, nb(X) + ' oublie le « + 1 »']
  ]);
  return sortie(qSac(s, 'au moins ' + mot(k, o.f) + ' ' + o.pl + ' de chaque couleur'), a, f,
    'Pire des cas : la couleur la moins nombreuse reste bloquée sous ' + k + ' le plus longtemps possible ; tu tires toutes les autres, plus ' + (k - 1) + ' de celle-là, puis ajoute 1. '
    + 'La moins nombreuse est celle des ' + o.pl + ' ' + colP(o, cm) + ' (' + cmin + '). Pire tirage : les ' + (tot - cmin) + ' autres ' + o.pl + ' et ' + lotc(o, cm, k - 1) + ', soit ' + X + ' ' + o.pl + ' sans avoir ' + k + ' ' + colP(o, cm) + '. '
    + 'Au tirage suivant, il ne reste que des ' + colP(o, cm) + ' : il faut ' + X + ' + 1 = ' + a + '.');
}

/* 3D · paires de gants (un gauche et un droit de la même couleur) : total des paires + 1 */
const GCOUL = ['noirs', 'gris', 'blancs', 'bleus', 'rouges', 'verts', 'beiges'];
function g3gants(R){
  const n = R.pick([2, 2, 3]), cols = R.shuffle(GCOUL).slice(0, n), p = R.shuffle(range(3, 9)).slice(0, n), S = sum(p), a = S + 1;
  const f = fin(a, [
    [n + 1, nb(n + 1) + " serait la réponse pour des chaussettes, qui n'ont ni gauche ni droite"],
    [2 * n + 1, nb(2 * n + 1) + ' garantit seulement deux gants de même couleur et du même côté'],
    [S, nb(S) + ' oublie le « + 1 »'],
    [Math.max(...p) + 1, '']
  ]);
  return sortie('Une armoire contient ' + et(cols.map((c, i) => p[i] + ' paires de gants ' + c)) + ', tous mélangés. Dans le noir, on ne distingue ni la couleur ni le gant gauche du gant droit. '
    + "Combien de gants faut-il prendre au minimum pour être sûr d'avoir une paire utilisable, c'est-à-dire un gant gauche et un gant droit de la même couleur ?", a, f,
    "Pire des cas : on ne tire qu'un seul côté de chaque couleur (par exemple tous les gants gauches), puis ajoute 1. "
    + 'Tous les gants gauches, ce sont ' + et(cols.map((c, i) => p[i] + ' ' + c)) + ', soit ' + S + ' gants, et aucune paire utilisable. '
    + "Réciproquement, tant qu'il n'y a pas de paire, chaque couleur ne fournit qu'un seul côté, donc au plus autant de gants que de paires de cette couleur : au plus " + S + ' gants en tout. '
    + 'Il faut donc ' + S + ' + 1 = ' + a + ' gants.');
}

/* 3E · le plus long tirage qui évite le résultat (pire des cas sans le « + 1 ») */
function g3sans(R){
  const t = R.int(1, 3), n = R.pick([3, 3, 4]), o = R.pick(OBJ);
  let s, cond, a, det, autre;
  if (t === 1){
    const k = R.pick([3, 4]);
    s = sac(R, n, k, k + 6, false, o);
    if (R.int(0, 1)) s.cs[n - 1] = R.int(1, k - 2);
    premierGros(s);
    const mins = s.cs.map(c => Math.min(c, k - 1));
    a = sum(mins); cond = mot(k, o.f) + ' ' + o.pl + ' de la même couleur';
    autre = [n * (k - 1), nb(n * (k - 1)) + ' compte ' + (k - 1) + ' de chaque couleur, même quand une couleur en a moins'];
    det = 'De chaque couleur, on prend ' + (k - 1) + ', ou toute la couleur si elle en a moins : ' + et(s.cols.map((c, i) => lotc(o, c, mins[i]))) + ', soit ' + a + ' ' + o.pl + '.';
  } else if (t === 2){
    s = sac(R, n, 2, 12, true, o);
    const cmin = Math.min(...s.cs), cm = s.cols[s.cs.indexOf(cmin)];
    a = sum(s.cs) - cmin; cond = 'au moins ' + un(o) + ' ' + o.sg + ' de chaque couleur';
    autre = [sum(s.cs) - Math.max(...s.cs), nb(sum(s.cs) - Math.max(...s.cs)) + ' met de côté la couleur la plus nombreuse au lieu de la moins nombreuse'];
    det = 'On garde de côté la couleur la moins nombreuse (les ' + colP(o, cm) + ') et on tire toutes les autres : ' + a + ' ' + o.pl + '.';
  } else {
    const k = R.pick([2, 3, 4]); s = sac(R, n, 2, 11, false, o);
    const i = R.int(0, n - 1); if (s.cs[i] < k + 1) s.cs[i] = k + 1 + R.int(0, 5);
    const c = s.cols[i], autres = sum(s.cs) - s.cs[i];
    a = autres + k - 1; cond = 'au moins ' + mot(k, o.f) + ' ' + o.pl + ' ' + colP(o, c);
    autre = [autres, nb(autres) + ' oublie les ' + (k - 1) + ' ' + plur(k - 1, adj(c, o.f, false), colP(o, c)) + ' que l\'on peut encore tirer'];
    det = 'On tire ' + tt(o.f) + ' les ' + o.pl + ' des autres couleurs (' + autres + '), puis ' + (k - 1) + ' ' + plur(k - 1, adj(c, o.f, false), colP(o, c)) + ' seulement : ' + autres + ' + ' + (k - 1) + ' = ' + a + '.';
  }
  const f = fin(a, [
    [a + 1, nb(a + 1) + ' est le nombre qui garantit le résultat : un de plus que le plus long tirage qui l\'évite'],
    autre, [a - 1, ''], [a + 2, '']
  ]);
  return sortie(s.o.intro + ' ' + compo(s) + '. On ' + o.v3 + ' des ' + o.pl + ' ' + (o.f ? 'une à une' : 'un à un') + ', ' + o.mode + '. Combien peut-on en ' + o.v + ' au maximum sans avoir encore ' + cond + ' ?', a, f,
    "Construis directement le plus long tirage qui évite ce qu'on cherche : c'est le pire des cas, sans le « + 1 ». " + det + ' La réponse est ' + a + '.');
}

/* 3F · nombres : consécutifs, somme N + 1, même chiffre des unités */
function g3nombres(R){
  const t = R.int(1, 3);
  if (t === 3){
    const N = R.int(20, 60), a = 11;
    const f = fin(a, [[10, '10 oublie le « + 1 »'], [Math.ceil(N / 2) + 1, nb(Math.ceil(N / 2) + 1) + ' confond avec la règle des nombres consécutifs'], [20, '']]);
    return sortie('Parmi les entiers de 1 à ' + N + ", combien faut-il en choisir au minimum pour être sûr que deux des nombres choisis ont le même chiffre des unités ?", a, f,
      'Les tiroirs sont les chiffres des unités possibles : compte-les, puis ajoute 1. Il y en a 10 (0, 1, 2, …, 9), et chacun est représenté de 1 à ' + N + '. Pire des cas : 10 nombres aux chiffres des unités tous différents, par exemple les entiers de 1 à 10. Le suivant répète forcément un chiffre des unités : il faut 10 + 1 = 11.');
  }
  const N = R.int(10, 40), h = Math.ceil(N / 2), a = h + 1;
  const f = fin(a, [[h, nb(h) + ' oublie le « + 1 »'], [Math.floor(N / 2) + 2 === a ? null : Math.floor(N / 2) + 2, ''], [h + 2, ''], [2, '2 est le cas chanceux']]);
  if (t === 1){
    const dernierImpair = N % 2 ? N : N - 1;
    return sortie('Parmi les entiers de 1 à ' + N + ', combien faut-il en choisir au minimum pour être sûr que deux des nombres choisis sont consécutifs (comme 7 et 8) ?', a, f,
      'Range les nombres dans des tiroirs de deux nombres consécutifs, (1, 2), (3, 4), et ainsi de suite, puis prends un nombre par tiroir et ajoute 1. '
      + (N % 2 === 0 ? 'Il y a ' + h + ' tiroirs, de (1, 2) à (' + (N - 1) + ', ' + N + ').' : 'Il y a ' + ((N - 1) / 2) + ' tiroirs de deux nombres, de (1, 2) à (' + (N - 2) + ', ' + (N - 1) + '), plus le nombre ' + N + ' seul : ' + h + ' tiroirs.')
      + ' Pire des cas : les nombres impairs 1, 3, 5, …, ' + dernierImpair + ', soit ' + h + ' nombres dont aucun n\'est consécutif à un autre. Avec un nombre de plus, deux sont dans le même tiroir, donc consécutifs : il faut ' + h + ' + 1 = ' + a + '.');
  }
  return sortie('Parmi les entiers de 1 à ' + N + ', combien faut-il en choisir au minimum pour être sûr que deux des nombres choisis ont une somme égale à ' + (N + 1) + ' ?', a, f,
    'Range les nombres par couples de somme ' + (N + 1) + ' : (1, ' + N + '), (2, ' + (N - 1) + '), et ainsi de suite, puis prends un nombre par couple et ajoute 1. '
    + (N % 2 === 0 ? 'Il y a ' + h + ' couples, le dernier étant (' + (N / 2) + ', ' + (N / 2 + 1) + ').' : 'Il y a ' + ((N - 1) / 2) + ' couples, et le nombre ' + ((N + 1) / 2) + ' reste seul (il ne peut pas s\'ajouter à lui-même) : ' + h + ' tiroirs.')
    + ' Pire des cas : un nombre par tiroir, soit ' + h + ' nombres sans somme ' + (N + 1) + '. Avec un de plus, un couple est complet : il faut ' + h + ' + 1 = ' + a + '.');
}

/* =====================================================================
   NIVEAU 4
   ===================================================================== */

/* 4A · seuils différents selon la couleur, ou couleur qui ne compte pas */
function g4seuils(R){
  if (R.int(0, 1)){
    const o = R.pick(OBJ), cols = R.shuffle(COUL).slice(0, 3), ks = R.shuffle([2, 3, 4, 5]).slice(0, 3);
    const cs = ks.map(k => R.int(k, k + 6));
    const j = R.int(0, 2); if (R.int(0, 1) && ks[j] >= 3) cs[j] = R.int(1, ks[j] - 2);
    const s = premierGros({o, cols, cs});
    const kk = s.cols.map(c => ks[cols.indexOf(c)]);
    if (!s.cs.some((c, i) => c >= kk[i])) return null;
    const mins = s.cs.map((c, i) => Math.min(c, kk[i] - 1)), S = sum(mins), a = S + 1, Sk = sum(kk);
    const ip = s.cs.findIndex((c, i) => c < kk[i] - 1);
    const cond = s.cols.map((c, i) => 'au moins ' + mot(kk[i], o.f) + (i === 0 ? ' ' + o.pl : '') + ' ' + colP(o, c)).join(', ou ');
    const f = fin(a, [
      [Sk, nb(Sk) + ' additionne les seuils, sans passer par le pire des cas'],
      [ip >= 0 ? Sk - 3 + 1 : null, ip >= 0 ? nb(Sk - 2) + " suppose qu'on peut prendre " + (kk[ip] - 1) + ' ' + colP(o, s.cols[ip]) + ", or il n'y en a " + qQue(s.cs[ip], o.f) : ''],
      [3 * (Math.max(...kk) - 1) + 1, nb(3 * (Math.max(...kk) - 1) + 1) + ' applique le plus grand seuil à toutes les couleurs'],
      [S, nb(S) + ' oublie le « + 1 »'],
      [Math.min(...kk), '']
    ]);
    return sortie(qSac(s, cond), a, f,
      'Pire des cas : de chaque couleur, prends le plus possible sans atteindre son seuil (le seuil moins 1, ou toute la couleur si elle en a moins), puis ajoute 1. '
      + 'Ici : ' + et(s.cols.map((c, i) => lotc(o, c, mins[i]) + ' (seuil ' + kk[i] + ')')) + ', soit ' + S + ' ' + o.pl + ' sans aucun seuil atteint. '
      + 'Au tirage suivant, une couleur atteint forcément son seuil : il faut ' + S + ' + 1 = ' + a + '.');
  }
  const o = R.pick(OBJ), k = R.pick([2, 3, 4]), s = sac(R, 4, k, k + 6, false, o), x = 3;
  s.cs[x] = R.int(3, 12);
  if (k >= 3 && R.int(0, 2) === 0) s.cs[R.int(1, 2)] = R.int(1, k - 2);   /* jamais en tête de liste ; la couleur exclue reste la dernière */
  const ex = s.cols[3], e = s.cs[3], inc = [0, 1, 2], mins = inc.map(i => Math.min(s.cs[i], k - 1)), S = sum(mins), a = e + S + 1;
  if (!inc.some(i => s.cs[i] >= k)) return null;
  const ip = inc.find(i => s.cs[i] < k - 1);
  const cond = mot(k, o.f) + ' ' + o.pl + ' de la même couleur parmi les ' + colP(o, s.cols[0]) + ', les ' + colP(o, s.cols[1]) + ' et les ' + colP(o, s.cols[2]) + ' (les ' + o.pl + ' ' + colP(o, ex) + ' ne comptent pas)';
  const f = fin(a, [
    [S + 1, nb(S + 1) + ' oublie que les ' + colP(o, ex) + ' peuvent ' + tt(o.f) + ' sortir avant'],
    [4 * (k - 1) + 1, nb(4 * (k - 1) + 1) + ' traite les ' + colP(o, ex) + ' comme une couleur qui compte'],
    [ip != null ? e + 3 * (k - 1) + 1 : null, ip != null ? nb(e + 3 * (k - 1) + 1) + " suppose qu'on peut prendre " + (k - 1) + ' ' + colP(o, s.cols[ip]) + ", or il n'y en a " + qQue(s.cs[ip], o.f) : ''],
    [a - 1, nb(a - 1) + ' oublie le « + 1 »']
  ]);
  return sortie(qSac(s, cond), a, f,
    'Pire des cas : les ' + o.pl + ' qui ne comptent pas sortent ' + tt(o.f) + " d'abord, puis " + (k - 1) + ' de chaque couleur qui compte (ou toute la couleur si elle en a moins), et enfin ajoute 1. '
    + 'Ici : les ' + e + ' ' + colP(o, ex) + ', puis ' + et(inc.map(i => lotc(o, s.cols[i], mins[i]))) + ', soit ' + e + ' + ' + S + ' = ' + (e + S) + ' ' + o.pl + ' sans en avoir ' + k + ' de la même couleur qui compte. '
    + 'Au tirage suivant, une couleur qui compte passe forcément à ' + k + ' : il faut ' + (e + S) + ' + 1 = ' + a + '.');
}

/* 4B · p paires de chaussettes (pas forcément de couleurs différentes) : 2p + n − 1 */
function g4paires(R){
  const o = OBJ[0], n = R.pick([2, 3, 3, 4]), p = R.pick([2, 3, 4]), s = sac(R, n, 2 * p, 2 * p + 7, false, o);
  const a = 2 * p + n - 1;
  const f = fin(a, [
    [p * (n + 1), nb(p * (n + 1)) + ' répète ' + p + " fois le raisonnement d'une paire, mais les chaussettes déjà tirées servent aux paires suivantes"],
    [n * (2 * p - 1) + 1, nb(n * (2 * p - 1) + 1) + ' répond à « ' + (2 * p) + ' chaussettes de la même couleur »'],
    [a - 1, nb(a - 1) + ' oublie le « + 1 »'],
    [2 * p, nb(2 * p) + ' est le cas chanceux'],
    [2 * p + 1, '']
  ]);
  return sortie(o.intro + ' ' + compo(s) + '. Une paire est formée de deux chaussettes de la même couleur, et deux paires peuvent être de la même couleur. '
    + "Combien de chaussettes faut-il prendre au minimum, dans le noir, pour être sûr d'avoir " + MOTS[p] + ' paires ?', a, f,
    'Pire des cas : le plus de chaussettes possible avec seulement ' + (p - 1) + ' paire' + (p > 2 ? 's' : '') + ' ; pour cela, chaque couleur garde une chaussette seule. Puis ajoute 1. '
    + 'Une chaussette seule de chaque couleur, cela fait ' + n + ' chaussettes et aucune paire. On peut y ajouter ' + (p - 1) + ' paire' + (p > 2 ? 's complètes' : ' complète') + ', soit ' + (2 * (p - 1)) + ' chaussettes : en tout ' + n + ' + ' + (2 * (p - 1)) + ' = ' + (a - 1) + ' chaussettes et seulement ' + (p - 1) + ' paire' + (p > 2 ? 's' : '') + '. '
    + 'Au tirage suivant, la chaussette complète forcément une chaussette seule : il faut ' + (a - 1) + ' + 1 = ' + a + '. '
    + 'Vérification : parmi ' + a + ' chaussettes, au plus ' + n + ' restent seules (une par couleur) ; les autres, au moins ' + (a - n) + ', vont par deux, donc il y en a au moins ' + (2 * p) + ', soit ' + p + ' paires.');
}

/* 4C et 5F · dés : les tiroirs sont les valeurs possibles du résultat noté */
function valeursDes(code){
  const v = new Set(), F = [1, 2, 3, 4, 5, 6];
  F.forEach(x => F.forEach(y => {
    if (code === 'somme2') v.add(x + y);
    else if (code === 'ecart') v.add(Math.abs(x - y));
    else if (code === 'max') v.add(Math.max(x, y));
    else if (code === 'produit') v.add(x * y);
    else if (code === 'paire') v.add(Math.min(x, y) * 10 + Math.max(x, y));
    else if (code === 'somme3') F.forEach(z => v.add(x + y + z));
  }));
  return v.size;
}
const DES = {
  somme2: {txt: 'On lance deux dés à six faces et on note la somme des deux numéros.', m: 'la même somme', d: 'La somme va de 2 (1 + 1) à 12 (6 + 6) : 11 valeurs possibles.', faux: [[12, 'compte une somme 1, impossible avec deux dés'], [36, 'compte les 36 tirages au lieu des sommes']]},
  ecart: {txt: "On lance deux dés à six faces et on note l'écart entre les deux numéros (le plus grand moins le plus petit, 0 s'ils sont égaux).", m: 'le même écart', d: "L'écart va de 0 (deux numéros égaux) à 5 (1 et 6) : 6 valeurs possibles.", faux: [[5, "oublie l'écart 0"], [36, 'compte les 36 tirages au lieu des écarts']]},
  max: {txt: 'On lance deux dés à six faces et on note le plus grand des deux numéros (ou ce numéro s\'ils sont égaux).', m: 'le même plus grand numéro', d: 'Le plus grand numéro va de 1 à 6 : 6 valeurs possibles.', faux: [[36, 'compte les 36 tirages au lieu des valeurs'], [12, 'confond avec les sommes']]},
  somme3: {txt: 'On lance trois dés à six faces et on note la somme des trois numéros.', m: 'la même somme', d: 'La somme va de 3 (1 + 1 + 1) à 18 (6 + 6 + 6) : 16 valeurs possibles.', faux: [[18, 'suppose des sommes de 1 à 18, mais 1 et 2 sont impossibles avec trois dés'], [216, 'compte les 216 tirages au lieu des sommes']]},
  produit: {txt: 'On lance deux dés à six faces et on note le produit des deux numéros.', m: 'le même produit', d: 'Les produits possibles sont 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 25, 30 et 36 : 18 valeurs (7, 11, 13, 14 et bien d\'autres sont impossibles).', faux: [[21, 'compte les paires de numéros, alors que 2 × 6 et 3 × 4 donnent le même produit'], [36, 'compte les 36 tirages, ou suppose que tous les produits de 1 à 36 sont possibles']]},
  paire: {txt: 'On lance deux dés à six faces et on note la paire de numéros obtenue, sans tenir compte de l\'ordre (2 et 5 donne la même paire que 5 et 2).', m: 'la même paire', d: 'Il y a 6 doubles (1 et 1, …, 6 et 6) et 15 paires de numéros différents : 21 valeurs possibles.', faux: [[36, 'compte 2 et 5 puis 5 et 2 comme deux tiroirs différents'], [15, 'oublie les 6 doubles']]}
};
function des(R, codes){
  const [code, ks] = R.pick(codes), D = DES[code], V = valeursDes(code), k = R.pick(ks), m = V * (k - 1), a = m + 1;
  const pieges = D.faux.map(([w, t]) => [w * (k - 1) + 1, nb(w * (k - 1) + 1) + ' ' + t]);
  const f = fin(a, pieges.concat([[m, nb(m) + ' oublie le « + 1 »'], [V * k, nb(V * k) + ' supposerait ' + k + ' fois chaque valeur'], [V * k + 1, '']]));
  return sortie(D.txt + ' On recommence plusieurs fois. Combien de lancers faut-il au minimum pour être sûr d\'obtenir ' + MOTS[k] + ' fois ' + D.m + ' ?', a, f,
    'Les tiroirs sont les valeurs possibles du résultat noté, pas les lancers : compte-les, puis applique le pire des cas (' + (k - 1) + ' fois chaque valeur) et ajoute 1. '
    + D.d + ' Pire des cas : chaque valeur sort ' + (k - 1) + ' fois, soit ' + V + ' × ' + (k - 1) + ' = ' + m + ' lancers sans obtenir ' + k + ' fois la même. '
    + 'Au lancer suivant, une valeur sort pour la ' + ORD[k] + ' fois : il faut ' + m + ' + 1 = ' + a + ' lancers.');
}
const g4des = R => des(R, [['somme2', [2, 3, 4]], ['somme2', [2, 3, 4]], ['ecart', [3, 4]], ['max', [3, 4]], ['somme3', [2, 3]]]);

/* 4D · critères croisés : nombre de tiroirs = produit des possibilités */
function g4croise(R){
  const g = R.pick(GENS), ne = g.f ? 'nées' : 'nés', pr = g.f ? 'elles' : 'eux';
  const C = [
    {b1: 26, b2: 26, ks: [2], q: k => 'ont les mêmes initiales (la première lettre du prénom et la première lettre du nom, avec 26 lettres possibles pour chacune)', ex: '26 lettres pour le prénom × 26 pour le nom'},
    {b1: 12, b2: 7, ks: [2, 3], q: k => 'sont ' + ne + " le même mois et le même jour de la semaine (par exemple un mardi de mars, l'année ne compte pas)", ex: '12 mois × 7 jours de la semaine'},
    {b1: 4, b2: 7, ks: [2, 3, 4], q: k => 'sont ' + ne + ' la même saison et le même jour de la semaine (par exemple un samedi d\'hiver)', ex: '4 saisons × 7 jours de la semaine'},
    {b1: 26, b2: 12, ks: [2], q: k => 'ont un prénom qui commence par la même lettre et sont ' + ne + ' le même mois (26 lettres possibles)', ex: '26 lettres × 12 mois'},
    {b1: 10, b2: 10, ks: [2, 3], tel: true, ex: '10 chiffres possibles pour l\'avant-dernier × 10 pour le dernier'}
  ];
  const c = R.pick(C), k = R.pick(c.ks), P = c.b1 * c.b2, m = P * (k - 1), a = m + 1;
  const q = c.tel
    ? 'Combien de numéros de téléphone faut-il rassembler au minimum pour être sûr que ' + MOTS[k] + " d'entre eux se terminent par les deux mêmes chiffres, dans le même ordre ?"
    : 'Combien ' + deN(g.n) + ' faut-il réunir au minimum pour être sûr que ' + MOTS[k] + " d'entre " + pr + ' ' + c.q(k) + ' ?';
  const f = fin(a, [
    [(c.b1 + c.b2) * (k - 1) + 1, nb((c.b1 + c.b2) * (k - 1) + 1) + ' additionne les possibilités au lieu de compter les combinaisons'],
    [m, nb(m) + ' oublie le « + 1 »'],
    [Math.max(c.b1, c.b2) * (k - 1) + 1, nb(Math.max(c.b1, c.b2) * (k - 1) + 1) + " ne tient compte que d'un seul critère"],
    [P * k + 1, '']
  ]);
  return sortie(q, a, f,
    "Un tiroir, c'est une combinaison des deux critères : multiplie les nombres de possibilités, puis applique le pire des cas et ajoute 1. "
    + 'Il y a ' + c.ex + ' = ' + nb(P) + ' tiroirs. Pire des cas : ' + (k === 2 ? 'un par tiroir, soit ' + nb(m) + ' sans deux dans le même tiroir. ' : (k - 1) + ' par tiroir, soit ' + nb(P) + ' × ' + (k - 1) + ' = ' + nb(m) + ' sans en avoir ' + k + ' dans le même tiroir. ')
    + 'Avec un de plus, un tiroir en contient forcément ' + k + ' : il faut ' + nb(m) + ' + 1 = ' + nb(a) + '.');
}

/* 4E · deux nombres de somme S parmi 1..N : couples + nombres sans partenaire + 1 */
function infosSomme(N, S){
  const couples = [], seuls = [];
  for (let x = 1; x <= N; x++){ const y = S - x; if (y > x && y <= N) couples.push([x, y]); else if (!(y < x && y >= 1)) seuls.push(x); }
  return {couples, seuls};
}
function g4somme(R){
  const N = R.int(10, 24);
  let S = R.int(7, 2 * N - 3);
  if (S === N + 1) S = N + R.pick([3, 5]);
  const {couples, seuls} = infosSomme(N, S), P = couples.length, L = seuls.length, a = P + L + 1;
  if (P < 2) return null;
  const milieu = S % 2 === 0 && S / 2 <= N;
  const f = fin(a, [
    [P + 1, nb(P + 1) + ' oublie les nombres sans partenaire'],
    [Math.ceil(N / 2) + 1, nb(Math.ceil(N / 2) + 1) + ' applique la règle de la somme ' + (N + 1) + ', qui ne vaut pas ici'],
    [a - 1, nb(a - 1) + ' oublie le « + 1 »'],
    [a + 1, '']
  ]);
  return sortie('Parmi les entiers de 1 à ' + N + ', combien faut-il en choisir au minimum pour être sûr que deux des nombres choisis ont une somme égale à ' + S + ' ?', a, f,
    'Fais des tiroirs : chaque couple de nombres de somme ' + S + ' forme un tiroir, et chaque nombre sans partenaire forme un tiroir à lui seul ; puis prends un nombre par tiroir et ajoute 1. '
    + 'Couples : ' + (P <= 4 ? et(couples.map(c => '(' + c.join(', ') + ')')) : '(' + couples[0].join(', ') + '), (' + couples[1].join(', ') + '), …, (' + couples[P - 1].join(', ') + ')') + ', soit ' + P + ' couples. '
    + 'Nombres sans partenaire : ' + plages(seuls) + ', soit ' + L + ' nombre' + (L > 1 ? 's' : '') + (milieu ? ' (' + (S / 2) + " ne peut pas s'ajouter à lui-même)" : '') + '. '
    + 'Pire des cas : un nombre de chaque couple et tous les nombres sans partenaire, soit ' + P + ' + ' + L + ' = ' + (P + L) + ' nombres sans somme ' + S + '. '
    + 'Le suivant complète forcément un couple : il faut ' + (P + L) + ' + 1 = ' + a + '.');
}

/* 4F · restes : différence multiple de m (m + 1), ou k nombres de même chiffre des unités */
function g4reste(R){
  if (R.int(0, 1)){
    const m = R.int(3, 12), N = R.int(2 * m, Math.min(6 * m, 80)), a = m + 1;
    const f = fin(a, [[m, nb(m) + ' oublie le « + 1 »'], [Math.ceil(N / m) + 1, nb(Math.ceil(N / m) + 1) + ' confond le nombre de tiroirs avec le nombre de nombres par tiroir'], [Math.ceil(N / 2) + 1, ''], [m + 2, '']]);
    return sortie('Parmi les entiers de 1 à ' + N + ', combien faut-il en choisir au minimum pour être sûr que deux des nombres choisis ont une différence multiple de ' + m + ' ?', a, f,
      'Range les nombres selon leur reste dans la division par ' + m + ' : deux nombres qui ont le même reste ont une différence multiple de ' + m + ' ; puis applique le principe des tiroirs. '
      + 'Il y a ' + m + ' restes possibles (de 0 à ' + (m - 1) + '), tous représentés de 1 à ' + N + '. Pire des cas : ' + m + ' nombres de restes tous différents, par exemple les entiers de 1 à ' + m + ' : leurs différences vont de 1 à ' + (m - 1) + ', aucune n\'est multiple de ' + m + '. '
      + 'Avec un nombre de plus, deux ont le même reste : il faut ' + m + ' + 1 = ' + a + '.');
  }
  const k = R.pick([3, 4, 5]), N = R.int(10 * (k - 1) + 1, 10 * k + 9), a = 10 * (k - 1) + 1;
  const f = fin(a, [[10 * k, nb(10 * k) + ' exigerait ' + k + ' nombres par chiffre des unités'], [10 * (k - 1), nb(10 * (k - 1)) + ' oublie le « + 1 »'], [9 * (k - 1) + 1, nb(9 * (k - 1) + 1) + ' oublie le chiffre des unités 0'], [Math.ceil(N / 10) + 1, '']]);
  return sortie('Parmi les entiers de 1 à ' + N + ', combien faut-il en choisir au minimum pour être sûr que ' + MOTS[k] + ' des nombres choisis ont le même chiffre des unités ?', a, f,
    'Les tiroirs sont les 10 chiffres des unités ; vérifie que chacun contient au moins ' + (k - 1) + ' nombres, puis applique le pire des cas. '
    + 'De 1 à ' + N + ', chaque chiffre des unités apparaît au moins ' + Math.floor(N / 10) + ' fois (le 0 par exemple : ' + et(range(1, Math.floor(N / 10)).map(x => 10 * x)) + ')' + (Math.floor(N / 10) > k - 1 ? ', donc au moins ' + (k - 1) + ' fois' : '') + '. '
    + 'Pire des cas : ' + (k - 1) + ' nombres par chiffre, soit 10 × ' + (k - 1) + ' = ' + (10 * (k - 1)) + ' nombres sans ' + k + ' de même chiffre des unités. Il faut ' + (10 * (k - 1)) + ' + 1 = ' + a + '.');
}

/* 4G · retrouver le nombre de couleurs à partir de la garantie */
function g4couleurs(R){
  const o = R.pick([OBJ[1], OBJ[2], OBJ[4], OBJ[6]]), n = R.int(3, 8), k = R.int(2, 5), M = n * (k - 1) + 1;
  const f = fin(n, [
    [Math.round(M / k), nb(Math.round(M / k)) + ' divise ' + M + ' par ' + k + ' sans passer par le pire des cas'],
    [n + 1, ''], [n - 1, ''], [M - 1, '']
  ]);
  return sortie(o.intro + ' des ' + o.pl + ' de plusieurs couleurs, au moins 10 de chaque couleur. En ' + (o.v === 'tirer' ? 'tirant' : o.v === 'sortir' ? 'sortant' : 'prenant') + ' ' + M + ' ' + o.pl + ' ' + o.mode + ", on est toujours sûr d'en avoir " + MOTS[k] + ' de la même couleur, mais avec ' + (M - 1) + ' ' + o.pl + ", ce n'est pas toujours le cas. Combien y a-t-il de couleurs ?", n, f,
    'Avec n couleurs et assez de ' + o.pl + ' de chacune, le pire des cas demande n × (k − 1) + 1 ' + o.pl + ' pour en avoir k de la même couleur : écris cette équation et résous-la. '
    + 'Ici n × ' + (k - 1) + ' + 1 = ' + M + ', donc n × ' + (k - 1) + ' = ' + (M - 1) + ' et n = ' + n + '. '
    + 'Vérification : avec ' + n + ' couleurs, ' + (M - 1) + ' ' + o.pl + ' peuvent se répartir en ' + (k - 1) + ' par couleur, sans en avoir ' + k + ' de la même couleur, alors que ' + M + ' suffisent toujours.');
}

/* 4H · grands nombres : plus grand nombre garanti dans un même tiroir */
function g4grands(R){
  const t = R.int(1, 4);
  let b, N, intro, qq, tir;
  if (t === 1){
    b = 200000; N = b * R.int(3, 15) + R.pick([0, 0, 20000, 50000, 100000, 150000]);
    intro = 'Une ville compte ' + nb(N) + ' habitants, et chacun a moins de 200 000 cheveux.'.replace('200 000', nb(200000));
    qq = "Quel est le plus grand nombre m tel que l'on soit sûr qu'au moins m habitants ont exactement le même nombre de cheveux ?";
    tir = 'les nombres de cheveux possibles, de 0 à ' + nb(199999) + ', soit ' + nb(b) + ' tiroirs';
  } else if (t === 2){
    b = 366; N = b * R.pick([10, 20, 25, 30, 50, 100]) + R.pick([0, R.int(1, 365), R.int(1, 365), R.int(1, 365)]);
    intro = 'Un stade accueille ' + nb(N) + ' spectateurs. On compte 366 dates d\'anniversaire possibles, 29 février compris.';
    qq = "Quel est le plus grand nombre m tel que l'on soit sûr qu'au moins m spectateurs ont la même date d'anniversaire ?";
    tir = 'les 366 dates possibles';
  } else if (t === 3){
    b = 10000; N = b * R.int(20, 400) + R.pick([0, 0, 500 * R.int(1, 19)]);
    intro = 'Une banque compte ' + nb(N) + ' clients, et chacun a un code secret de 4 chiffres (de 0000 à 9999).';
    qq = "Quel est le plus grand nombre m tel que l'on soit sûr qu'au moins m clients ont le même code ?";
    tir = 'les codes possibles, de 0000 à 9999, soit ' + nb(b) + ' tiroirs';
  } else {
    b = 676; N = b * R.int(2, 9) + R.pick([0, R.int(1, 675), R.int(1, 675)]);
    intro = 'Une école compte ' + nb(N) + " étudiants. Les initiales d'un étudiant sont la première lettre de son prénom et celle de son nom, avec 26 lettres possibles pour chacune.";
    qq = "Quel est le plus grand nombre m tel que l'on soit sûr qu'au moins m étudiants ont les mêmes initiales ?";
    tir = 'les couples d\'initiales, 26 × 26 = 676 tiroirs';
  }
  const q = Math.floor(N / b), r = N % b, a = Math.ceil(N / b);
  const f = fin(a, [
    [r ? q : null, nb(q) + " arrondit à l'inférieur"],
    [r ? null : q + 1, nb(q + 1) + ' ajoute 1 par réflexe alors que la division tombe juste'],
    [t === 2 ? Math.ceil(N / 365) : null, nb(Math.ceil(N / 365)) + ' oublie le 29 février'],
    [t === 4 ? Math.ceil(N / 52) : null, nb(Math.ceil(N / 52)) + ' additionne 26 + 26 au lieu de multiplier'],
    [a + 1, ''], [a + 2, '']
  ]);
  return sortie(intro + ' ' + qq, a, f,
    "Divise le nombre de personnes par le nombre de tiroirs et arrondis à l'entier supérieur, sauf si la division tombe juste : c'est la plus petite taille possible du tiroir le plus rempli. "
    + 'Les tiroirs sont ' + tir + '. '
    + (r === 0
      ? nb(N) + ' = ' + nb(b) + ' × ' + nb(q) + ' exactement : on peut avoir exactement ' + nb(q) + ' personnes par tiroir, donc on ne peut pas garantir plus de ' + nb(q) + ' ; et un tiroir en contient forcément au moins ' + nb(q) + ', sinon il y aurait au plus ' + nb(b) + ' × ' + nb(q - 1) + ' = ' + nb(b * (q - 1)) + ' personnes. La réponse est ' + nb(q) + '.'
      : nb(b) + ' × ' + nb(q) + ' = ' + nb(b * q) + ' et ' + nb(b) + ' × ' + nb(q + 1) + ' = ' + nb(b * (q + 1)) + ' : ' + nb(N) + ' est entre les deux. Avec ' + nb(q) + " personnes par tiroir, on n'en place que " + nb(b * q) + ' ; il en reste, donc un tiroir en contient au moins ' + nb(q + 1) + ", et on peut répartir sans jamais dépasser " + nb(q + 1) + '. La réponse est ' + nb(a) + '.'));
}

/* 4I · gants dépareillés : pour chaque couleur, le côté le plus nombreux, puis + 1 */
function g4gants(R){
  const n = R.pick([2, 3, 3]), cols = R.shuffle(GCOUL).slice(0, n);
  const L = cols.map(() => R.int(2, 8)), D = cols.map(() => R.int(2, 8));
  if (L.every((x, i) => x === D[i])) D[0] = D[0] === 8 ? 3 : D[0] + 1;
  const mx = L.map((x, i) => Math.max(x, D[i])), S = sum(mx), a = S + 1, SL = sum(L), SD = sum(D), Smin = sum(L.map((x, i) => Math.min(x, D[i])));
  const f = fin(a, [
    [SL + 1, nb(SL + 1) + " ne prend que des gants gauches : ce n'est pas le pire des cas"],
    [SD + 1, nb(SD + 1) + " ne prend que des gants droits : ce n'est pas le pire des cas"],
    [Smin + 1, nb(Smin + 1) + " garde le côté le moins nombreux, c'est l'inverse du pire des cas"],
    [n + 1, nb(n + 1) + ' raisonne comme pour des chaussettes'],
    [S, nb(S) + ' oublie le « + 1 »']
  ]);
  const cote = i => (L[i] > D[i] ? 'les ' + L[i] + ' gauches' : L[i] < D[i] ? 'les ' + D[i] + ' droits' : 'les ' + L[i] + ' gauches ou les ' + D[i] + ' droits');
  return sortie("Un bac d'objets trouvés contient des gants dépareillés : " + et(cols.map((c, i) => 'des gants ' + c + ' (' + L[i] + ' gauches et ' + D[i] + ' droits)')) + '. Dans le noir, on ne distingue ni la couleur ni le côté. '
    + "Combien de gants faut-il prendre au minimum pour être sûr d'avoir une paire utilisable, c'est-à-dire un gant gauche et un gant droit de la même couleur ?", a, f,
    "Sans paire utilisable, chaque couleur ne fournit qu'un seul côté : dans le pire des cas, prends pour chaque couleur tout le côté le plus nombreux, additionne, puis ajoute 1. "
    + 'Ici : ' + et(cols.map((c, i) => cote(i) + ' ' + c)) + ', soit ' + mx.join(' + ') + ' = ' + S + ' gants sans paire utilisable. '
    + 'Au tirage suivant, le gant complète forcément une paire : il faut ' + S + ' + 1 = ' + a + ' gants.');
}

/* =====================================================================
   NIVEAU 5
   ===================================================================== */

/* 5A · même somme des chiffres : tiroirs de tailles différentes */
function g5capa(R){
  const deux = R.int(0, 2) === 0, lo = deux ? 10 : 1, hi = deux ? 99 : R.int(25, 99), k = deux ? R.pick([3, 4]) : R.pick([2, 3, 3, 4]);
  const cap = {};
  for (let x = lo; x <= hi; x++){ const sm = chiffres(x); (cap[sm] = cap[sm] || []).push(x); }
  const cles = Object.keys(cap).map(Number).sort((x, y) => x - y), B = cles.length;
  if (!cles.some(sm => cap[sm].length >= k)) return null;
  const petits = cles.filter(sm => cap[sm].length < k - 1);
  if (k >= 3 && !petits.length) return null;
  const S = sum(cles.map(sm => Math.min(cap[sm].length, k - 1))), a = S + 1;
  const smin = cles[0], smax = cles[B - 1];
  if (smax - smin + 1 !== B) return null;
  const ex = R.int(Math.max(lo, 10), hi), exTxt = ex + ' est ' + String(ex).split('').join(' + ') + ' = ' + chiffres(ex);
  const debut = (deux ? 'Parmi les nombres à deux chiffres (de 10 à 99)' : 'Parmi les entiers de 1 à ' + hi) + ', combien faut-il en choisir au minimum pour être sûr que ' + MOTS[k] + ' des nombres choisis ont la même somme des chiffres (par exemple, la somme des chiffres de ' + exTxt + ') ?';
  const plage = 'De ' + lo + ' à ' + hi + ', la somme des chiffres va de ' + smin + ' à ' + smax + ' (pour ' + cap[smax].join(' et ') + '), et toutes les valeurs entre les deux sont atteintes : ' + B + ' tiroirs.';
  if (k === 2){
    const f = fin(a, [[19, '19 suppose que toutes les sommes de 1 à 18 sont possibles'], [B, nb(B) + ' oublie le « + 1 »'], [B + 2, ''], [Math.ceil((hi - lo + 1) / 10) + 1, '']]);
    return sortie(debut, a, f, 'Les tiroirs sont les sommes de chiffres possibles : compte-les, puis ajoute 1. ' + plage + ' Pire des cas : un nombre par somme, soit ' + B + ' nombres de sommes toutes différentes. Il faut ' + B + ' + 1 = ' + a + '.');
  }
  const desc5 = petits.map(sm => 'somme ' + sm + ' (' + (cap[sm].length === 1 ? cap[sm][0] + ' seulement' : et(cap[sm])) + ')');
  const sp = sum(petits.map(sm => cap[sm].length)), autres = B - petits.length;
  const f = fin(a, [
    [B * (k - 1) + 1, nb(B * (k - 1) + 1) + ' oublie que certains tiroirs contiennent moins de ' + (k - 1) + ' nombres'],
    [S, nb(S) + ' oublie le « + 1 »'],
    [18 * (k - 1) + 1, nb(18 * (k - 1) + 1) + ' suppose 18 sommes possibles, chacune bien remplie'],
    [B * k, '']
  ]);
  return sortie(debut, a, f,
    'Les tiroirs sont les sommes de chiffres possibles, mais certains tiroirs contiennent peu de nombres : dans chaque tiroir, prends le plus possible sans atteindre ' + k + ' (' + (k - 1) + ', ou tout le tiroir s\'il en a moins), puis ajoute 1. '
    + plage + ' Tiroirs qui contiennent moins de ' + (k - 1) + ' nombres : ' + et(desc5) + ', soit ' + sp + ' nombre' + (sp > 1 ? 's' : '') + ' en tout. Les ' + autres + ' autres tiroirs en fournissent ' + (k - 1) + ' chacun. '
    + 'Pire des cas : ' + autres + ' × ' + (k - 1) + ' + ' + sp + ' = ' + S + ' nombres sans ' + k + ' de même somme. Il faut ' + S + ' + 1 = ' + a + '.');
}

/* 5B · double, divise, différence d : chaînes et « un sur deux » */
function chainesDouble(N){ const c = []; for (let m = 1; m <= N; m += 2){ const l = []; for (let x = m; x <= N; x *= 2) l.push(x); c.push(l); } return c; }
function chainesDiff(N, d){ const c = []; for (let r = 1; r <= d; r++){ const l = []; for (let x = r; x <= N; x += d) l.push(x); c.push(l); } return c; }
const garde = l => l.filter((_, i) => i % 2 === 0);
function g5double(R){
  const t = R.int(1, 3);
  if (t === 1){
    const N = R.int(10, 24), ch = chainesDouble(N), S = sum(ch.map(l => Math.ceil(l.length / 2))), a = S + 1;
    const longues = ch.filter(l => l.length >= 2), seules = ch.filter(l => l.length === 1).map(l => l[0]);
    const f = fin(a, [
      [ch.length + 1, nb(ch.length + 1) + " ne garde qu'un nombre par chaîne, alors qu'on peut en garder plusieurs non voisins"],
      [S, nb(S) + ' oublie le « + 1 »'],
      [Math.floor(N / 2) + 1, ''], [a + 1, '']
    ]);
    return sortie('Parmi les entiers de 1 à ' + N + ", combien faut-il en choisir au minimum pour être sûr que l'un des nombres choisis est le double d'un autre ?", a, f,
      'Range les nombres en chaînes où chaque nombre est le double du précédent, en partant d\'un nombre impair ; dans une chaîne, on ne peut pas garder deux voisins, donc au mieux un nombre sur deux. Puis ajoute 1. '
      + 'Chaînes : ' + longues.map(l => l.join(', ') + ' (on garde ' + et(garde(l)) + ')').join(' ; ') + '. Les impairs ' + et(seules) + ' sont seuls dans leur chaîne et peuvent tous être gardés. '
      + 'Pire des cas : ' + S + " nombres sans qu'aucun soit le double d'un autre. Il faut " + S + ' + 1 = ' + a + '.');
  }
  if (t === 2){
    const N = R.int(10, 30), h = Math.ceil(N / 2), a = h + 1, dbl = sum(chainesDouble(N).map(l => Math.ceil(l.length / 2))) + 1;
    let premiers = 0; for (let x = 2; x <= N; x++){ let p = true; for (let y = 2; y * y <= x; y++) if (x % y === 0) p = false; if (p) premiers++; }
    const ch3 = []; for (let x = 3; x <= N; x *= 2) ch3.push(x);
    const f = fin(a, [
      [h, nb(h) + ' oublie le « + 1 »'],
      [premiers + 1, nb(premiers + 1) + " ne garde que les nombres premiers, mais ce n'est pas le pire des cas"],
      [dbl, nb(dbl) + " répond à « l'un est le double de l'autre », une condition plus forte"],
      [a + 1, '']
    ]);
    return sortie('Parmi les entiers de 1 à ' + N + ', combien faut-il en choisir au minimum pour être sûr que deux des nombres choisis sont tels que l\'un divise l\'autre ?', a, f,
      'Écris chaque nombre comme un nombre impair multiplié par 1, 2, 4, 8… : deux nombres qui ont la même partie impaire se divisent, donc les tiroirs sont les nombres impairs. '
      + 'De 1 à ' + N + ', il y a ' + h + ' nombres impairs, donc ' + h + ' tiroirs (par exemple ' + et(ch3) + ' sont dans le tiroir de 3). '
      + 'Pire des cas : les ' + h + ' nombres de ' + (Math.floor(N / 2) + 1) + ' à ' + N + ' ; aucun ne divise un autre, car le double du plus petit dépasse déjà ' + N + '. '
      + 'Avec un nombre de plus, deux sont dans le même tiroir : il faut ' + h + ' + 1 = ' + a + '.');
  }
  const d = R.int(2, 5), N = R.int(12, 30), ch = chainesDiff(N, d), S = sum(ch.map(l => Math.ceil(l.length / 2))), a = S + 1;
  const f = fin(a, [
    [d + 1, nb(d + 1) + ' répond à « une différence multiple de ' + d + ' »'],
    [Math.ceil(N / 2) + 1, nb(Math.ceil(N / 2) + 1) + ' applique la règle des nombres consécutifs, valable seulement pour une différence de 1'],
    [S, nb(S) + ' oublie le « + 1 »'],
    [a + 1, '']
  ]);
  return sortie('Parmi les entiers de 1 à ' + N + ', combien faut-il en choisir au minimum pour être sûr que deux des nombres choisis ont une différence égale à ' + d + ' ?', a, f,
    'Range les nombres en chaînes de ' + d + ' en ' + d + ' ; dans une chaîne, deux voisins ont une différence de ' + d + ', donc on garde au mieux un nombre sur deux. Puis ajoute 1. '
    + 'Chaînes : ' + ch.map(l => chaineTxt(l) + ' (' + l.length + ' nombre' + (l.length > 1 ? 's' : '') + ', ' + Math.ceil(l.length / 2) + ' gardé' + (Math.ceil(l.length / 2) > 1 ? 's' : '') + ')').join(' ; ') + '. '
    + 'Pire des cas : ' + ch.map(l => Math.ceil(l.length / 2)).join(' + ') + ' = ' + S + ' nombres sans différence ' + d + '. Il faut ' + S + ' + 1 = ' + a + '.');
}

/* 5C · somme multiple de m : restes complémentaires */
function g5multiple(R){
  const m = R.int(4, 10), N = R.int(2 * m + 1, Math.min(50, 6 * m));
  const cnt = range(0, m - 1).map(r => range(1, N).filter(x => x % m === r).length);
  const couples = []; for (let r = 1; r < m - r; r++) couples.push([r, m - r]);
  const pair = m % 2 === 0, base = sum(couples.map(([r, s]) => Math.max(cnt[r], cnt[s]))), extra = 1 + (pair ? 1 : 0), S = base + extra, a = S + 1;
  const f = fin(a, [
    [m + 1, nb(m + 1) + ' répond à « une différence multiple de ' + m + ' », un autre problème'],
    [base + 1, nb(base + 1) + " oublie qu'on peut ajouter un multiple de " + m + (pair ? ' et un nombre de reste ' + (m / 2) : '')],
    [S, nb(S) + ' oublie le « + 1 »'],
    [Math.ceil(N / 2) + 1, '']
  ]);
  return sortie('Parmi les entiers de 1 à ' + N + ', combien faut-il en choisir au minimum pour être sûr que deux des nombres choisis ont une somme multiple de ' + m + ' ?', a, f,
    'Classe les nombres selon leur reste dans la division par ' + m + ' : la somme de deux nombres est multiple de ' + m + ' quand leurs restes font ' + m + ' ensemble (r et ' + m + ' − r), ou quand ils sont tous deux nuls' + (pair ? ' ou tous deux égaux à ' + (m / 2) : '') + ' ; dans chaque couple de restes, garde le plus fourni, plus un seul multiple de ' + m + (pair ? ' et un seul nombre de reste ' + (m / 2) : '') + '. Puis ajoute 1. '
    + 'De 1 à ' + N + ' : ' + couples.map(([r, s]) => 'restes ' + r + ' et ' + s + ' : ' + cnt[r] + ' et ' + cnt[s] + ' nombres, on garde ' + Math.max(cnt[r], cnt[s])).join(' ; ') + '. '
    + 'Pire des cas : ' + base + ' + ' + extra + ' = ' + S + ' nombres sans somme multiple de ' + m + ' (on ajoute un multiple de ' + m + (pair ? ' et un nombre de reste ' + (m / 2) : '') + '). Il faut ' + S + ' + 1 = ' + a + '.');
}

/* 5D · p paires de couleurs toutes différentes */
function g5paires(R){
  const o = OBJ[0], p = R.pick([2, 3, 3]), n = p === 2 ? 4 : R.pick([4, 5]), s = sac(R, n, 3, 12, true, o);
  const d = desc(s.cs), top = d.slice(0, p - 1), St = sum(top), X = St + (n - p + 1), a = X + 1;
  const nomDe = v => colP(o, s.cols[s.cs.indexOf(v)]);
  const f = fin(a, [
    [2 * p + n - 1, nb(2 * p + n - 1) + ' répond à « ' + p + ' paires », sans exiger des couleurs différentes'],
    [p * (n + 1), nb(p * (n + 1)) + ' répète ' + p + " fois le raisonnement d'une paire"],
    [X, nb(X) + ' oublie le « + 1 »'],
    [sum(d.slice(-(p - 1))) + (n - p + 1) + 1, nb(sum(d.slice(-(p - 1))) + (n - p + 1) + 1) + ' bloque les couleurs les moins nombreuses au lieu des plus nombreuses']
  ]);
  return sortie(o.intro + ' ' + compo(s) + '. Une paire est formée de deux chaussettes de la même couleur. '
    + "Combien de chaussettes faut-il prendre au minimum, dans le noir, pour être sûr d'avoir " + MOTS[p] + ' paires de couleurs ' + (p > 2 ? 'toutes ' : '') + 'différentes ?', a, f,
    'Pire des cas : les paires ne viennent que de ' + (p === 2 ? 'la couleur la plus nombreuse' : 'deux couleurs, les plus nombreuses') + ', et les autres couleurs ne donnent qu\'une chaussette chacune ; puis ajoute 1. '
    + (p === 2 ? 'Toutes les ' + nomDe(top[0]) + ' (' + top[0] + ')' : 'Toutes les ' + nomDe(top[0]) + ' et toutes les ' + nomDe(top[1]) + ' (' + top.join(' + ') + ' = ' + St + ')')
    + ', plus une chaussette de chacune des ' + (n - p + 1) + ' autres couleurs : ' + St + ' + ' + (n - p + 1) + ' = ' + X + ' chaussettes avec seulement ' + (p - 1) + ' couleur' + (p > 2 ? 's' : '') + ' en paire. '
    + 'Au tirage suivant, la chaussette tombe sur une couleur qui a déjà une chaussette seule : une nouvelle couleur forme une paire. Il faut ' + X + ' + 1 = ' + a + '.');
}

/* 5E · deux exigences à la fois : au moins a d'une couleur ET au moins b d'une autre */
function g5conj(R){
  const n = R.pick([3, 4]), o = R.pick(OBJ.slice(1)), ka = R.int(2, 4), kb = R.int(2, 4);
  const s = sac(R, n, 2, 10, false, o);
  s.cs[0] = R.int(ka + 1, 12); s.cs[1] = R.int(kb + 1, 12);
  const tot = sum(s.cs), autres = tot - s.cs[0] - s.cs[1];
  const X1 = tot - s.cs[0] + ka - 1, X2 = tot - s.cs[1] + kb - 1, X = Math.max(X1, X2), a = X + 1;
  const c1 = colP(o, s.cols[0]), c2 = colP(o, s.cols[1]);
  const f = fin(a, [
    [autres + ka + kb, nb(autres + ka + kb) + ' suppose que les ' + c1 + ' et les ' + c2 + " sortent dans l'ordre qui t'arrange"],
    [Math.min(X1, X2) + 1, nb(Math.min(X1, X2) + 1) + ' ne regarde que le scénario le plus court'],
    [X, nb(X) + ' oublie le « + 1 »'],
    [ka + kb, nb(ka + kb) + ' est le cas chanceux']
  ]);
  return sortie(qSac(s, 'au moins ' + mot(ka, o.f) + ' ' + o.pl + ' ' + c1 + ' et au moins ' + mot(kb, o.f) + ' ' + c2), a, f,
    'Pire des cas : une des deux exigences reste bloquée le plus longtemps possible ; calcule les deux scénarios, garde le plus long, puis ajoute 1. '
    + 'Scénario 1, il manque des ' + c1 + ' : tu tires toutes les autres (' + (tot - s.cs[0]) + ') et seulement ' + (ka - 1) + ' ' + plur(ka - 1, adj(s.cols[0], o.f, false), c1) + ', soit ' + X1 + '. '
    + 'Scénario 2, il manque des ' + c2 + ' : ' + (tot - s.cs[1]) + ' + ' + (kb - 1) + ' = ' + X2 + '. '
    + 'Le pire est ' + X + ' ' + o.pl + ' sans les deux exigences réunies. Il faut ' + X + ' + 1 = ' + a + '.');
}

/* 5F · dés difficiles */
const g5des = R => des(R, [['somme3', [3, 4]], ['produit', [2, 3]], ['produit', [2, 3]], ['paire', [2, 3]], ['paire', [2, 3]]]);

/* =====================================================================
   Aiguillage, contrôle, secours
   ===================================================================== */
const TYPES = {
  1: [g1paire, g1cat, g1une, g1repart],
  2: [g2meme, g2cat, g2prec, g2chaque, g2cartes, g2repart],
  3: [g3cap, g3diff, g3chaque, g3gants, g3sans, g3nombres],
  4: [g4seuils, g4paires, g4des, g4croise, g4somme, g4reste, g4couleurs, g4grands, g4gants],
  5: [g5capa, g5double, g5multiple, g5paires, g5conj, g5des]
};
function valide(ex){
  if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return false;
  if (/NaN|undefined|Infinity/.test(ex.q + ex.a + ex.choix.join(' ') + ex.expl)) return false;
  const n = ex.choix.map(norm);
  return new Set(n).size === 4 && n.filter(x => x === norm(ex.a)).length === 1;
}
function secours(){
  return {
    q: "Dans un tiroir, il y a 8 chaussettes noires et 8 chaussettes blanches. Combien de chaussettes faut-il prendre au minimum, dans le noir, pour être sûr d'avoir deux chaussettes de la même couleur ?",
    a: '3', accept: null, choix: ['3', '2', '9', '16'],
    expl: 'Imagine le pire des cas : le plus de chaussettes possible sans paire, puis ajoute 1. Une noire et une blanche ne font pas de paire ; la troisième a forcément la couleur de l\'une des deux : il faut 3 chaussettes. Piège : 2 est le cas chanceux ; 9 répond à « deux couleurs différentes ».'
  };
}

A.push({
  id: 'alb-21-tiroirs',
  phase: 'albert',
  ordre: 21,
  theme: 'logique',
  titre: 'Principe des tiroirs et raisonnement du pire des cas',
  objectif: "Trouver le plus petit nombre d'objets qui garantit un résultat (une paire, une couleur, un anniversaire commun, une somme) en construisant le pire des cas, puis en ajoutant 1.",
  lecon:
`<p class="lede">Certaines questions commencent par « combien faut-il en prendre, au minimum, pour être sûr de… ». On ne te demande pas une probabilité mais une <mark>certitude</mark> : il faut te placer dans le <mark>pire des cas</mark>, celui où le hasard t'empêche le plus longtemps possible d'obtenir ce que tu veux.</p>
<h2>Ce que le test demande</h2>
<p>Chaussettes dans le noir, boules dans un sac, cartes, dates de naissance, nombres choisis dans une liste : la question porte toujours sur le plus petit nombre qui <strong>garantit</strong> un résultat (une paire de même couleur, trois personnes nées le même mois, deux nombres de somme donnée). Une variante demande l'inverse : on répartit beaucoup d'objets dans des boîtes, combien en contient au moins la plus remplie ? Aucune formule de cours n'est exigée : quelques lignes de raisonnement et une addition suffisent.</p>
<h2>Le principe des tiroirs</h2>
<p>Si tu ranges 5 chaussettes dans 4 tiroirs, un tiroir en contient forcément au moins 2. Plus généralement, avec n tiroirs, tu peux mettre k − 1 objets dans chacun sans jamais en avoir k ensemble ; un objet de plus, et un tiroir en contient k. Les « tiroirs » sont les cas possibles : les couleurs, les mois, les faces d'un dé, les sommes possibles de deux dés, les restes d'une division.</p>
<div class="formule"><p>n tiroirs : n × (k − 1) + 1 objets garantissent k objets dans un même tiroir</p><p>N objets dans n tiroirs : le plus rempli en contient au moins N ÷ n, arrondi à l'entier supérieur</p></div>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je repère les tiroirs :</strong> quelles sont les catégories possibles, et combien d'objets chacune contient-elle au maximum ?</p>
<p><strong>2. Je construis le pire des cas :</strong> le plus d'objets possible <strong>sans</strong> obtenir ce qu'on veut, en respectant les quantités disponibles (impossible de tirer 3 boules jaunes s'il n'y en a que 2).</p>
<p><strong>3. J'ajoute 1 :</strong> l'objet suivant provoque forcément le résultat voulu.</p>
<p><strong>4. Je contrôle :</strong> la réponse moins 1 doit correspondre à un tirage réellement possible qui échoue.</p>
</div>
<table class="tbl">
<tr><th>On veut être sûr d'avoir…</th><th>Pire des cas, puis + 1</th></tr>
<tr><td>k objets de la même couleur</td><td>k − 1 de chaque couleur (ou toute la couleur si elle en a moins)</td></tr>
<tr><td>k objets d'une couleur précise</td><td>toutes les autres couleurs, puis k objets (au lieu de + 1)</td></tr>
<tr><td>au moins un objet de chaque couleur</td><td>tout, sauf la couleur la moins nombreuse</td></tr>
<tr><td>deux couleurs différentes</td><td>toute la couleur la plus nombreuse</td></tr>
<tr><td>une paire de gants (un gauche, un droit)</td><td>un seul côté pour chaque couleur</td></tr>
</table>
<h2>Exemples résolus</h2>
<h3>1. Les chaussettes</h3>
<p>Un tiroir contient 8 chaussettes noires et 8 blanches. Dans le noir, combien en prendre pour être sûr d'avoir une paire de même couleur ? Pire des cas : une noire et une blanche. La troisième est forcément noire ou blanche : <strong>3</strong>. Les quantités (8 et 8) ne servent à rien.</p>
<h3>2. Les anniversaires</h3>
<p>Combien d'élèves faut-il pour être sûr que quatre sont nés le même mois ? Il y a 12 tiroirs, les mois. Pire des cas : 3 élèves par mois, soit 12 × 3 = 36 élèves sans quatre nés le même mois. Le suivant fait monter un mois à 4 : <strong>37</strong>.</p>
<h3>3. Le sac avec une petite couleur</h3>
<p>Un sac contient 9 boules rouges, 7 bleues et 2 jaunes. Pour être sûr d'en avoir 4 de la même couleur : pire des cas, 3 rouges, 3 bleues et les 2 jaunes (pas 3, il n'y en a que 2), soit 8 boules ; il en faut <strong>9</strong>. Pour être sûr d'avoir 3 bleues : les 9 rouges et les 2 jaunes peuvent sortir d'abord, puis il faut 3 bleues : 9 + 2 + 3 = <strong>14</strong>.</p>
<h3>4. Au niveau du test : des nombres dans des tiroirs</h3>
<p>Parmi les entiers de 1 à 16, combien faut-il en choisir pour être sûr que deux d'entre eux ont pour somme 20 ? Les tiroirs sont les couples de somme 20 : (4, 16), (5, 15), (6, 14), (7, 13), (8, 12), (9, 11), soit 6 tiroirs. Les nombres 1, 2, 3 et 10 n'ont pas de partenaire (10 + 10 utilise deux fois le même nombre) : ce sont 4 tiroirs d'un seul nombre. Pire des cas : un nombre par tiroir, soit 6 + 4 = 10 nombres sans somme 20. Il en faut <strong>11</strong>.</p>
<h2>Les réflexes sans calculatrice</h2>
<ul>
<li>Le nombre demandé (2 pour une paire, 3 pour « trois boules ») n'est presque jamais la réponse : c'est le cas chanceux.</li>
<li>Méfie-toi du choix qui vaut un de moins que ta réponse : c'est l'oubli du « + 1 ».</li>
<li>Vérifie qu'une couleur contient assez d'objets avant d'en compter k − 1.</li>
<li>Pour une couleur précise, toutes les autres peuvent sortir avant.</li>
<li>Pour des dés, les tiroirs sont les valeurs possibles (11 sommes, de 2 à 12), pas les 36 tirages.</li>
<li>Pour une répartition, divise puis arrondis au-dessus, sauf si la division tombe juste : avec 1 000 élèves et 366 dates, 2 × 366 = 732 est inférieur à 1 000, donc au moins 3 élèves ont la même date d'anniversaire.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Construis le pire tirage possible, celui qui évite le plus longtemps ce que tu cherches, puis ajoute 1.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Répondre le nombre demandé (2 pour une paire) : c'est le cas chanceux. Oublier le « + 1 ». Oublier une couleur, ou supposer qu'une petite couleur fournit k − 1 objets alors qu'elle en a moins. Raisonner sur un cas moyen au lieu du pire. Pour une couleur précise, oublier que toutes les autres peuvent sortir avant. Pour des gants, raisonner comme pour des chaussettes. Pour une répartition, arrondir à l'inférieur.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Être sûr, c'est résister au pire des cas. Réponse = (plus grand nombre d'objets sans le résultat voulu) + 1. Avec n tiroirs, n × (k − 1) + 1 objets garantissent k objets dans un même tiroir.</p></div>`,
  gen(level, R){
    const n = niv(level), liste = TYPES[n];
    for (let t = 0; t < 40; t++){
      try {
        const ex = R.pick(liste)(R);
        if (valide(ex)) return ex;
      } catch (e) { /* on retente avec un autre tirage */ }
    }
    return secours();
  }
});

})();
