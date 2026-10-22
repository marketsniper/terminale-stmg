/* ===== Maths · Objectif Albert School : alb-19 · Parité et invariants =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS.
   Sous-types par niveau (tous calculés par le code, aucune banque d'énoncés fixes) :
     N1 : parité d'expressions littérales, élimination par la parité, compter les pairs/impairs, somme ou produit possible.
     N2 : pour quel n peut-on partager 1..n, somme de chaque groupe (ou impossible), a + b et a − b,
          dates paires d'un jour de la semaine, tableau où l'on écrit la somme.
     N3 : tableau « différence » (parité), jours de la semaine (trois dates de même parité), robot sur quadrillage,
          1 □ 2 □ … □ n, tableau « somme ± c ».
     N4 : sac de billes (probabilité 0 ou 1), poignées de main régulières, dominos sur damier troué,
          pièces à retourner (piège de parité ou impossible), tableau « différence » avec borne, événement tous les 3 ou 5 jours.
     N5 : jetons de trois couleurs (invariant de 3 en 3), nombre de résultats ± , invariant produit (a + b + ab),
          plus grande valeur / nombre de valeurs du tableau « différence », poignées de main de deux sortes
          (lequel est possible, ou combien de valeurs), pièces (cas durs : borne « au plus m fois » + parité).
   Règles mathématiques vérifiées par force brute avant écriture (voir verifs/alb-19-parite-invariants-verif.js). */
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
const par = x => ((x % 2) + 2) % 2;                       // 0 : pair, 1 : impair
const motP = x => (par(x) ? 'impair' : 'pair');
const motPf = x => (par(x) ? 'impaire' : 'paire');
const motPs = x => (par(x) ? 'impairs' : 'pairs');
const motPfs = x => (par(x) ? 'impaires' : 'paires');
const ou = l => (l.length < 2 ? String(l[0]) : l.slice(0, -1).join(', ') + ' ou ' + l[l.length - 1]);
const et = l => (l.length < 2 ? String(l[0]) : l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1]);
const IMP = "c'est impossible";
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const tri = l => l.slice().sort((x, y) => x - y);
const sup = n => String(n).replace(/\d/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]);
const T = n => n * (n + 1) / 2;
const md = (a, m) => ((a % m) + m) % m;
const pgcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a; };
const frac = (p, q) => { const g = pgcd(p, q) || 1; return (p / g) + '/' + (q / g); };
const pt = (x, y) => '(' + nb(x) + ' ; ' + nb(y) + ')';
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const choisir = (R, l, k) => R.shuffle(l).slice(0, k);
function mois(L, R){
  if (L === 28) return {intro: 'En février, une année non bissextile (28 jours)', nom: 'février'};
  if (L === 29) return {intro: 'En février, une année bissextile (29 jours)', nom: 'février'};
  const nom = R.pick(L === 30 ? ['avril', 'juin', 'septembre', 'novembre'] : ['janvier', 'mars', 'mai', 'juillet', 'août', 'octobre', 'décembre']);
  return {intro: 'En ' + nom + ' (' + L + ' jours)', nom};
}
const dateTxt = (x, nom) => 'le ' + (x === 1 ? '1er' : x) + ' ' + nom;
/* « Lequel des nombres … » : la liste est toujours dans l'énoncé, triée, pour que l'énoncé fixe la réponse. */
const listeNb = l => ou(tri(l).map(x => nb(x)));

/* =====================================================================
   NIVEAU 1
   ===================================================================== */

/* 1A · expression forcément paire ou impaire (arbres d'expressions, parité calculée) */
const V = i => ({t: 'v', i}), C = k => ({t: 'c', k});
const ADD = (x, y) => ({t: '+', x, y}), MUL = (x, y) => ({t: '×', x, y}), SQ = x => ({t: '²', x});
const EXPRS = [
  ADD(V(0), V(1)), MUL(V(0), V(1)), SQ(V(0)), SQ(V(1)), MUL(C(2), V(0)), MUL(C(2), V(1)),
  ADD(V(0), C(1)), ADD(V(1), C(1)), MUL(C(3), V(0)), MUL(C(3), V(1)), ADD(ADD(V(0), V(1)), C(1)),
  ADD(MUL(V(0), V(1)), C(1)), ADD(MUL(C(2), V(0)), V(1)), ADD(V(0), MUL(C(2), V(1))),
  ADD(SQ(V(0)), V(1)), ADD(V(0), SQ(V(1))), ADD(SQ(V(0)), SQ(V(1))), ADD(MUL(C(3), V(0)), V(1)),
  MUL(V(0), ADD(V(1), C(1))), MUL(ADD(V(0), C(1)), V(1)), ADD(MUL(C(2), V(0)), C(1)), ADD(MUL(C(2), V(1)), C(1)),
  SQ(ADD(V(0), V(1)))
];
function eTxt(e, nm){
  if (e.t === 'v') return nm[e.i];
  if (e.t === 'c') return String(e.k);
  if (e.t === '²') return (e.x.t === 'v' ? nm[e.x.i] : '(' + eTxt(e.x, nm) + ')') + '²';
  if (e.t === '+') return eTxt(e.x, nm) + ' + ' + eTxt(e.y, nm);
  if (e.x.t === 'c' && e.y.t === 'v') return e.x.k + nm[e.y.i];
  const f = s => (s.t === '+' ? '(' + eTxt(s, nm) + ')' : eTxt(s, nm));
  return f(e.x) + ' × ' + f(e.y);
}
function ePar(e, p){
  if (e.t === 'v') return p[e.i];
  if (e.t === 'c') return e.k % 2;
  if (e.t === '²') return ePar(e.x, p);
  if (e.t === '+') return (ePar(e.x, p) + ePar(e.y, p)) % 2;
  return ePar(e.x, p) * ePar(e.y, p);
}
function eEtapes(e, p, out){
  if (e.t === 'v' || e.t === 'c') return out;
  const d = s => (s.t === 'c' ? String(s.k) : motP(ePar(s, p)));
  if (e.t === '²'){ eEtapes(e.x, p, out); out.push(d(e.x) + ' × ' + d(e.x) + ' = ' + motP(ePar(e, p))); return out; }
  eEtapes(e.x, p, out); eEtapes(e.y, p, out);
  out.push(d(e.x) + (e.t === '+' ? ' + ' : ' × ') + d(e.y) + ' = ' + motP(ePar(e, p)));
  return out;
}
function g1expr(R){
  const nm = R.pick([['a', 'b'], ['m', 'n'], ['x', 'y'], ['p', 'k'], ['u', 'v']]);
  const p = R.pick([[0, 1], [1, 0], [1, 1], [0, 0]]), cible = R.int(0, 1);
  const bons = EXPRS.filter(e => ePar(e, p) === cible), mauvais = EXPRS.filter(e => ePar(e, p) !== cible);
  const b = R.pick(bons), m3 = choisir(R, mauvais, 3);
  const tx = e => eTxt(e, nm), det = e => eEtapes(e, p, []).join(', puis ');
  const liste = R.shuffle([b].concat(m3)).map(tx);
  return {
    q: 'Soit ' + nm[0] + ' un entier ' + motP(p[0]) + ' et ' + nm[1] + ' un entier ' + motP(p[1]) + '. Parmi les expressions ' + et(liste) + ', laquelle est forcément ' + motPf(cible) + ' ?',
    a: tx(b), accept: null,
    choix: [tx(b)].concat(m3.map(tx)),
    expl: "Remplace chaque lettre par sa parité et applique les règles : pair + impair = impair, impair + impair = pair, et un produit n'est impair que si tous ses facteurs sont impairs. "
      + 'Pour ' + tx(b) + ' : ' + det(b) + ', donc cette expression est forcément ' + motPf(cible) + '. '
      + 'Les trois autres sont forcément ' + motPfs(1 - cible) + ' : ' + m3.map(e => tx(e) + ' (' + det(e) + ')').join(' ; ') + '. '
      + "Piège : un produit qui contient un facteur pair est toujours pair, et un seul exemple chiffré ne prouve pas « forcément »."
  };
}

/* 1B · retrouver le bon résultat d'un calcul par sa parité */
function g1elim(R){
  const somme = R.int(0, 1) === 1;
  let termes, val;
  if (somme){ termes = []; const k = R.pick([4, 5, 6]); for (let i = 0; i < k; i++) termes.push(R.int(11, 98)); val = termes.reduce((s, x) => s + x, 0); }
  else { termes = R.shuffle([R.int(11, 29), R.int(11, 29), R.int(3, 9)]); val = termes.reduce((s, x) => s * x, 1); }
  const sym = somme ? ' + ' : ' × ';
  const d = choisir(R, [-5, -3, -1, 1, 3, 5], 3).map(x => val + x);
  const imp = termes.filter(x => par(x) === 1), pairs = termes.filter(x => par(x) === 0);
  let raison;
  if (somme) raison = imp.length === 0 ? "Aucun terme n'est impair, donc la somme est paire."
    : 'Il y a ' + imp.length + ' terme' + (imp.length > 1 ? 's' : '') + ' impair' + (imp.length > 1 ? 's' : '') + ' (' + et(imp) + '), un nombre ' + motP(imp.length) + ' de termes impairs, donc la somme est ' + motPf(val) + '.';
  else raison = pairs.length ? 'Le facteur ' + pairs[0] + ' est pair, donc le produit est pair.' : 'Les trois facteurs sont impairs, donc le produit est impair.';
  return {
    q: 'Quatre élèves ont calculé ' + termes.join(sym) + " de tête et ont trouvé quatre résultats différents. Sans poser l'opération, retrouve le bon résultat parmi les propositions.",
    a: nb(val), accept: null,
    choix: [nb(val)].concat(d.map(x => nb(x))),
    expl: (somme ? "Pas besoin de tout calculer : regarde la parité du résultat. Dans une somme, seuls les termes impairs comptent. "
                 : "Pas besoin de tout calculer : regarde la parité du résultat. Un produit est pair dès qu'un facteur est pair. ")
      + raison + ' Une seule proposition est ' + motPf(val) + ' : ' + nb(val) + ". Les trois autres sont " + motPfs(val + 1) + ', donc fausses (le calcul complet confirme ' + nb(val) + ').'
  };
}

/* 1C · compter les nombres pairs ou impairs d'une liste d'entiers consécutifs */
function g1compte(R){
  const ctx = R.int(0, 2), cible = R.int(0, 1);
  let A, B, q;
  if (ctx === 0){ A = R.int(1, 40); B = A + R.int(20, 120); q = 'Combien y a-t-il de nombres ' + motPs(cible) + ' de ' + A + ' à ' + B + ', ' + A + ' et ' + B + ' compris ?'; }
  else if (ctx === 1){ A = 1; B = R.int(60, 400); q = "Les pages d'un livre sont numérotées de 1 à " + B + '. Combien de pages portent un numéro ' + motP(cible) + ' ?'; }
  else { A = R.int(1, 30); B = A + R.int(25, 90); q = 'Dans un hôtel, les chambres sont numérotées de ' + A + ' à ' + B + ', sans aucun trou. Combien de chambres ont un numéro ' + motP(cible) + ' ?'; }
  let E = 0; for (let x = A; x <= B; x++) if (par(x) === cible) E++;
  const f = par(A) === cible ? A : A + 1, l = par(B) === cible ? B : B - 1, tot = B - A + 1;
  return {
    q, a: nb(E), accept: null,
    choix: qcm(nb(E), [nb(E - 1), nb(E + 1), nb(tot), nb(Math.floor((B - A) / 2))], k => nb(E + (k % 2 ? k + 1 : -k - 1))),
    expl: 'Repère le premier et le dernier nombre ' + motP(cible) + ' de la liste, puis compte de 2 en 2 avec (dernier − premier) ÷ 2 + 1. '
      + 'Ici le premier est ' + f + ' et le dernier ' + l + ' : (' + l + ' − ' + f + ') ÷ 2 + 1 = ' + ((l - f) / 2) + ' + 1 = ' + E + '. '
      + 'Piège : oublier le « + 1 » donne ' + (E - 1) + ', et ' + tot + ' est le nombre total d\'entiers de la liste, pas celui des nombres ' + motPs(cible) + '.'
  };
}

/* 1D · somme ou produit de nombres de parité connue : quel résultat est possible ? */
function g1possible(R){
  const pers = R.pick([['Hugo', 'il'], ['Inès', 'elle'], ['Sacha', 'il'], ['Jade', 'elle'], ['Malik', 'il'], ['Lou', 'elle']]);
  const addi = R.int(0, 2) > 0;
  let k, m, cible;
  if (addi){ k = R.int(2, 9); m = R.int(1, 5); cible = k % 2; }
  else { k = R.int(2, 5); m = R.int(0, 1); cible = m ? 0 : 1; }
  const a = R.pick(range(30, 99).filter(x => par(x) === cible));
  const d = choisir(R, range(30, 99).filter(x => par(x) !== cible), 3);
  const liste = [a].concat(d);
  const groupe = k + ' nombres impairs' + (m ? ' et ' + m + ' nombre' + (m > 1 ? 's pairs' : ' pair') : '');
  let temoin;
  if (addi){
    const r = a - (k - 1) - 2 * m, l = [];
    for (let i = 0; i < k - 1; i++) l.push(1); l.push(r); for (let i = 0; i < m; i++) l.push(2);
    temoin = l.join(' + ') + ' = ' + a;
  } else {
    const l = [a]; for (let i = 0; i < k - (m ? 0 : 1); i++) l.push(1);
    temoin = l.join(' × ') + ' = ' + a + (m ? ', avec ' + a + ' comme facteur pair' : '');
  }
  return {
    q: pers[0] + ' choisit ' + groupe + ' (des entiers positifs, pas forcément différents), puis ' + pers[1] + (addi ? ' les additionne' : ' les multiplie') + (k + m > 2 ? ' tous' : '') + '. Lequel des nombres ' + listeNb(liste) + ' peut être le résultat ?',
    a: String(a), accept: null,
    choix: liste.map(String),
    expl: (addi
      ? "Pour la parité d'une somme, seuls les termes impairs comptent. Ici il y a " + k + ' termes impairs, un nombre ' + motP(k) + ', donc la somme est ' + motPf(k) + ' ; les termes pairs ne changent rien. '
      : "Un produit est pair dès qu'un facteur est pair, et impair seulement si tous ses facteurs sont impairs. " + (m ? 'Ici il y a un facteur pair, donc le résultat est pair. ' : 'Ici tous les facteurs sont impairs, donc le résultat est impair. '))
      + 'Seul ' + a + ' est ' + motP(cible) + ' parmi les propositions, et on peut bien l\'obtenir : ' + temoin + '.'
      + (addi ? ' Piège : croire que des nombres impairs donnent toujours un résultat impair.' : '')
  };
}

/* =====================================================================
   NIVEAU 2
   ===================================================================== */
const CTX_PARTAGE = [
  {intro: n => 'On veut partager les entiers de 1 à ' + n + ' en deux groupes qui ont la même somme.', quoi: 'quelle est la somme de chaque groupe'},
  {intro: n => 'On a ' + n + ' cartes numérotées de 1 à ' + n + ", et on veut les distribuer toutes entre deux joueurs pour que les deux totaux soient égaux.", quoi: 'quel est le total de chaque joueur'},
  {intro: n => 'On dispose de ' + n + ' masses de 1 g, 2 g, 3 g, …, ' + n + " g (une seule de chaque), et on veut les poser toutes sur les deux plateaux d'une balance pour qu'elle soit en équilibre.", quoi: 'quelle est la masse en grammes sur chaque plateau'}
];
function constructionPartage(n){
  return n % 4 === 0
    ? 'on range les nombres par blocs de quatre consécutifs k, k + 1, k + 2, k + 3, et on met k et k + 3 d\'un côté, k + 1 et k + 2 de l\'autre'
    : "on met 1 et 2 d'un côté et 3 de l'autre, puis on range les nombres de 4 à " + n + " par blocs de quatre consécutifs k, k + 1, k + 2, k + 3 : k et k + 3 d'un côté, k + 1 et k + 2 de l'autre";
}

/* 2A · pour quel n peut-on partager 1..n en deux groupes de même somme ? */
function g2quel(R){
  const ans = R.pick(range(8, 40).filter(x => x % 4 === 0 || x % 4 === 3));
  const pool = range(ans - 6, ans + 6).filter(x => x >= 5 && (x % 4 === 1 || x % 4 === 2));
  const d1 = R.pick(pool.filter(x => x % 4 === 2));
  const d = [d1].concat(choisir(R, pool.filter(x => x !== d1), 2));
  const liste = tri([ans].concat(d));
  const c = R.int(0, 2);
  const q = c === 0
    ? 'On veut partager les entiers de 1 à n en deux groupes qui ont la même somme. Pour laquelle de ces valeurs de n est-ce possible : ' + ou(liste.map(x => 'n = ' + x)) + ' ?'
    : c === 1
      ? "On a des cartes numérotées de 1 à n (une par numéro) et on veut les distribuer toutes entre deux joueurs pour que les deux totaux soient égaux. Pour lequel de ces nombres de cartes est-ce possible : " + ou(liste) + ' ?'
      : "On dispose de masses de 1 g, 2 g, 3 g, …, jusqu'à n g (une seule de chaque) et on veut les poser toutes sur les deux plateaux d'une balance pour qu'elle soit en équilibre. Pour laquelle de ces valeurs de n est-ce possible : " + ou(liste) + ' ?';
  return {
    q, a: String(ans), accept: null,
    choix: liste.map(String),
    expl: 'Calcule la somme totale 1 + 2 + … + n = n × (n + 1) ÷ 2 : pour faire deux groupes égaux, elle doit être paire. '
      + liste.map(x => 'n = ' + x + ' donne ' + nb(T(x)) + ' (' + motPf(T(x)) + ')').join(' ; ') + '. '
      + 'Seul n = ' + ans + ' donne une somme paire, et le partage est alors réalisable : ' + constructionPartage(ans) + '. '
      + 'Piège : il ne suffit pas que n soit pair, puisque n = ' + d1 + ' donne une somme impaire.'
  };
}

/* 2B · somme de chaque groupe, ou impossible */
function g2somme(R){
  const n = R.int(7, 30), S = T(n), c = R.pick(CTX_PARTAGE);
  const q = c.intro(n) + ' Si c\'est possible, ' + c.quoi + ' ?';
  const calc = '1 + 2 + … + ' + n + ' = ' + n + ' × ' + (n + 1) + ' ÷ 2 = ' + nb(S);
  if (S % 2 === 0){
    const ans = nb(S / 2), err = [nb(S), IMP];
    if ((n * (n - 1)) % 4 === 0) err.push(nb(n * (n - 1) / 4));
    err.push(nb(S / 2 + n));
    return {
      q, a: ans, accept: null,
      choix: qcm(ans, err, k => nb(S / 2 + (k % 2 ? k : -k))),
      expl: "Calcule la somme totale, vérifie qu'elle est paire, puis coupe-la en deux. Ici " + calc + ', un nombre pair : chaque côté doit totaliser ' + nb(S) + ' ÷ 2 = ' + ans + '. '
        + "C'est réalisable : " + constructionPartage(n) + '. Piège : oublier de diviser par 2 donne ' + nb(S) + '.'
    };
  }
  return {
    q, a: IMP, accept: null,
    choix: qcm(IMP, [nb((S - 1) / 2), nb((S + 1) / 2), nb(S)], k => nb((S + 1) / 2 + k)),
    expl: "Calcule la somme totale, vérifie qu'elle est paire, puis coupe-la en deux. Ici " + calc + ', un nombre impair : on ne peut pas le couper en deux nombres entiers égaux, donc le partage est impossible. '
      + 'Piège : répondre ' + nb((S - 1) / 2) + ' ou ' + nb((S + 1) / 2) + ', ce qui ferait deux côtés de totaux différents.'
  };
}

/* 2C · a + b et a − b ont la même parité ; somme et produit */
function g2ab(R){
  const v = R.int(0, 3);
  if (v === 0){
    const S = R.int(60, 400), bonsV = range(Math.floor(S / 5), S - 1).filter(x => par(x) === par(S)), mauvV = range(Math.floor(S / 5), S - 1).filter(x => par(x) !== par(S));
    const a = R.pick(bonsV), d = choisir(R, mauvV, 3), liste = [a].concat(d);
    return {
      q: 'Deux entiers naturels a et b, avec a ≥ b, vérifient a + b = ' + nb(S) + '. Lequel des nombres ' + listeNb(liste) + ' peut être égal à a − b ?',
      a: nb(a), accept: null, choix: liste.map(x => nb(x)),
      expl: 'Compare a + b et a − b : ils diffèrent de 2b, un nombre pair, donc ils ont toujours la même parité. '
        + 'Ici a + b = ' + nb(S) + ' est ' + motP(S) + ', donc a − b est ' + motP(S) + ' : seul ' + nb(a) + ' convient, par exemple avec a = ' + nb((S + a) / 2) + ' et b = ' + nb((S - a) / 2) + '. '
        + 'Piège : croire que la parité de a − b n\'a rien à voir avec celle de a + b.'
    };
  }
  if (v === 1){
    const D = R.int(20, 200), bonsV = range(D + 2, D + 120).filter(x => par(x) === par(D)), mauvV = range(D + 1, D + 120).filter(x => par(x) !== par(D));
    const a = R.pick(bonsV), d = choisir(R, mauvV, 3), liste = [a].concat(d);
    return {
      q: 'Deux entiers naturels a et b vérifient a − b = ' + nb(D) + '. Lequel des nombres ' + listeNb(liste) + ' peut être égal à a + b ?',
      a: nb(a), accept: null, choix: liste.map(x => nb(x)),
      expl: 'Compare a − b et a + b : ils diffèrent de 2b, un nombre pair, donc ils ont toujours la même parité. '
        + 'Ici a − b = ' + nb(D) + ' est ' + motP(D) + ', donc a + b est ' + motP(D) + ' : seul ' + nb(a) + ' convient, par exemple avec a = ' + nb((a + D) / 2) + ' et b = ' + nb((a - D) / 2) + '. '
        + 'Piège : croire que la parité de a + b n\'a rien à voir avec celle de a − b.'
    };
  }
  const a = R.pick(range(20, 99).filter(x => par(x) === 0)), d = choisir(R, range(20, 99).filter(x => par(x) === 1), 3), liste = [a].concat(d);
  if (v === 2) return {
    q: 'Deux entiers naturels a et b ont un produit a × b impair. Lequel des nombres ' + listeNb(liste) + ' peut être égal à a + b ?',
    a: String(a), accept: null, choix: liste.map(String),
    expl: "Un produit n'est impair que si ses deux facteurs sont impairs : déduis-en la parité de a et de b, puis celle de a + b. Ici a et b sont impairs, donc a + b = impair + impair est pair. "
      + 'Seul ' + a + ' est pair, et il convient : par exemple a = 1 et b = ' + (a - 1) + ', dont le produit ' + (a - 1) + ' est bien impair. '
      + 'Piège : croire qu\'une somme de deux impairs est impaire.'
  };
  return {
    q: 'Deux entiers naturels a et b ont une somme a + b impaire. Lequel des nombres ' + listeNb(liste) + ' peut être égal à a × b ?',
    a: String(a), accept: null, choix: liste.map(String),
    expl: "Une somme n'est impaire que si l'un des nombres est pair et l'autre impair : déduis-en la parité du produit. Le produit a un facteur pair, donc il est pair. "
      + 'Seul ' + a + ' est pair, et il convient : par exemple a = ' + a + ' et b = 1, dont la somme ' + (a + 1) + ' est bien impaire. '
      + 'Piège : croire que le produit d\'un pair et d\'un impair est impair.'
  };
}

/* 2D · combien de [jour] du mois tombent à une date paire / impaire ? */
function g2jours(R){
  const L = R.pick([28, 29, 30, 30, 31, 31, 31]), M = mois(L, R), w1 = R.int(0, 6), W = R.int(0, 6), P = R.int(0, 1);
  const dates = range(1, L).filter(x => md(w1 + x - 1, 7) === W), bons = dates.filter(x => par(x) === P);
  const c = bons.length, tot = dates.length;
  return {
    q: M.intro + ', le 1er du mois tombe un ' + JOURS[w1] + '. Combien de ' + JOURS[W] + 's de ce mois tombent à une date ' + motPf(P) + ' ?',
    a: String(c), accept: null,
    choix: qcm(String(c), [String(tot), String(tot - c), String(c + 1), String(c - 1)], k => String(c + k + 1)),
    expl: 'Trouve la date du premier ' + JOURS[W] + ', puis avance de 7 en 7 : comme 7 est impair, les dates alternent entre paires et impaires. '
      + 'Le 1er est un ' + JOURS[w1] + ', donc le premier ' + JOURS[W] + ' tombe le ' + (dates[0] === 1 ? '1er' : dates[0]) + '. Les ' + JOURS[W] + 's sont les ' + et(dates) + '. '
      + 'Ceux qui tombent à une date ' + motPf(P) + ' : ' + (c ? et(bons) : 'aucun') + ', soit ' + c + '. Piège : compter tous les ' + JOURS[W] + 's (' + tot + ').'
  };
}

/* 2E · tableau : on remplace deux nombres par leur somme (la somme totale est invariante) */
function g2tableau(R){
  if (R.int(0, 1) === 0){
    const n = R.int(8, 40), S = T(n);
    return {
      q: 'On écrit au tableau les entiers de 1 à ' + n + ". À chaque étape, on efface deux nombres et on écrit à leur place leur somme. On s'arrête quand il ne reste qu'un seul nombre. Quel est ce nombre ?",
      a: nb(S), accept: null,
      choix: qcm(nb(S), [nb(n * (n - 1) / 2), nb(n * (n + 1)), nb(n * n)], k => nb(S + (k % 2 ? k : -k))),
      expl: "Cherche ce qui ne change pas : remplacer deux nombres par leur somme ne modifie pas le total des nombres écrits au tableau. "
        + 'Le dernier nombre est donc le total de départ : 1 + 2 + … + ' + n + ' = ' + n + ' × ' + (n + 1) + ' ÷ 2 = ' + nb(S) + '. '
        + 'Piège : ' + nb(n * (n - 1) / 2) + ' vient de la formule mal retenue n × (n − 1) ÷ 2.'
    };
  }
  const a0 = R.int(5, 20), b0 = a0 + R.int(8, 25), nT = b0 - a0 + 1, S = (a0 + b0) * nT / 2;
  return {
    q: 'On écrit au tableau tous les entiers de ' + a0 + ' à ' + b0 + ". À chaque étape, on efface deux nombres et on écrit à leur place leur somme. On s'arrête quand il ne reste qu'un seul nombre. Quel est ce nombre ?",
    a: nb(S), accept: null,
    // distracteurs entiers seulement : oubli de a0 (T(b0) − T(a0)), oubli du « + 1 » s'il donne un entier, 1 + … + b0, oubli du ÷ 2
    choix: qcm(nb(S), [nb(S - a0), ((a0 + b0) * (nT - 1)) % 2 ? null : nb((a0 + b0) * (nT - 1) / 2), nb(T(b0)), nb((a0 + b0) * nT)], k => nb(S + (k % 2 ? k : -k))),
    expl: "Cherche ce qui ne change pas : remplacer deux nombres par leur somme ne modifie pas le total des nombres écrits au tableau. "
      + 'Le dernier nombre est donc la somme de ' + a0 + ' à ' + b0 + ' : il y a ' + b0 + ' − ' + a0 + ' + 1 = ' + nT + ' nombres, et la somme vaut (premier + dernier) × nombre de termes ÷ 2 = '
      + (a0 + b0) + ' × ' + nT + ' ÷ 2 = ' + nb(S) + '. Piège : calculer (1 + … + ' + b0 + ') − (1 + … + ' + a0 + ') = ' + nb(S - a0) + ' oublie le nombre ' + a0
      + ', et 1 + 2 + … + ' + b0 + ' (' + nb(T(b0)) + ') compte des nombres qui ne sont pas au tableau.'
  };
}

/* =====================================================================
   NIVEAU 3
   ===================================================================== */
const CTX_DIFF = [
  {intro: n => 'On écrit au tableau les entiers de 1 à ' + n + '. À chaque étape, on efface deux nombres et on écrit à leur place leur différence (le plus grand moins le plus petit). Après ' + (n - 1) + " étapes, il ne reste qu'un seul nombre.",
   lequel: l => 'Lequel des nombres ' + listeNb(l) + ' peut-il être ?', sujet: 'ce dernier nombre'},
  {intro: n => 'On a ' + n + ' jetons numérotés de 1 à ' + n + '. À chaque étape, on retire deux jetons et on les remplace par un seul jeton qui porte la différence de leurs numéros (le plus grand moins le plus petit). Après ' + (n - 1) + " étapes, il ne reste qu'un seul jeton.",
   lequel: l => 'Lequel des numéros ' + listeNb(l) + ' peut-il porter ?', sujet: 'le numéro de ce dernier jeton'}
];

/* 3A · tableau « différence » : quel dernier nombre est possible ? (parité de la somme) */
function g3diff(R){
  const n = R.int(6, 12), S = T(n), p = S % 2;
  const a = R.pick(range(0, n).filter(x => par(x) === p));
  const mauv = range(0, n).filter(x => par(x) !== p);
  const d = mauv.indexOf(0) >= 0 && R.int(0, 1) ? [0].concat(choisir(R, mauv.filter(x => x !== 0), 2)) : choisir(R, mauv, 3);
  const liste = [a].concat(d);
  return {
    q: (cd => cd.intro(n) + ' ' + cd.lequel(liste))(R.pick(CTX_DIFF)),
    a: String(a), accept: null, choix: liste.map(String),
    expl: "Suis la parité de la somme des nombres : remplacer a et b par a − b enlève deux fois b au total, un nombre pair, donc la parité de la somme ne change jamais. "
      + 'Au départ, 1 + 2 + … + ' + n + ' = ' + S + ', qui est ' + motP(S) + ' : le dernier nombre est donc ' + motP(S) + '. '
      + 'Seul ' + a + ' est ' + motP(S) + ' parmi les propositions (les autres sont ' + motPs(S + 1) + '), et on peut effectivement finir sur ' + a + '. Piège : conclure après avoir essayé une seule façon de jouer.'
  };
}

/* 3B · jours de la semaine : trois dates de même parité fixent le calendrier */
const CAL3 = [{L: 29, P: 1, d: 1}, {L: 30, P: 0, d: 2}, {L: 30, P: 1, d: 1}, {L: 31, P: 0, d: 2}];
const CTX_SEM = [
  {phr: W => 'une chorale répète tous les ' + W + 's', nom: 'répétitions', der: 'la dernière répétition'},
  {phr: W => 'Léna a cours de piano tous les ' + W + 's', nom: 'cours', der: 'le dernier cours'},
  {phr: W => 'une association tient une permanence tous les ' + W + 's', nom: 'permanences', der: 'la dernière permanence'}
];
function g3semaine(R){
  const cb = R.pick(CAL3), M = mois(cb.L, R), W = R.int(0, 6), cx = R.pick(CTX_SEM);
  // vérification du caractère unique de la première date (force brute sur d = 1..7)
  const ok = range(1, 7).filter(d => range(0, 4).map(i => d + 7 * i).filter(x => x <= cb.L && par(x) === cb.P).length === 3);
  if (ok.length !== 1 || ok[0] !== cb.d) return null;
  const d = cb.d, dates = range(0, 4).map(i => d + 7 * i);
  const base = M.intro + ', ' + cx.phr(JOURS[W]) + '. Exactement trois de ces ' + cx.nom + ' tombent à une date ' + motPf(cb.P) + '. ';
  const raison = 'Les ' + JOURS[W] + 's sont espacés de 7 jours, un nombre impair : leurs dates alternent entre paires et impaires. '
    + 'Pour avoir trois dates ' + motPfs(cb.P) + ', il faut cinq ' + JOURS[W] + 's et que le premier soit à une date ' + motPf(cb.P) + ' : d, d + 7, d + 14, d + 21, d + 28, avec d + 28 ≤ ' + cb.L
    + ', donc d ≤ ' + (cb.L - 28) + '. La seule possibilité est d = ' + d + ' : les ' + JOURS[W] + 's tombent les ' + et(dates) + '. ';
  const t = R.int(0, 2);
  if (t === 2){
    const ans = d + 28, err = [d + 21, cb.L, cb.L - 1, d + 27, 3 - d + 28].filter(x => x !== ans && x >= 1 && x <= cb.L);
    return {
      q: base + 'Quelle est la date de ' + cx.der + ' du mois ?',
      a: String(ans), accept: null,
      choix: qcm(String(ans), err.map(String), k => String(ans - 1 - k)),
      expl: raison + "La dernière date est donc le " + ans + '. Piège : supposer seulement quatre ' + JOURS[W] + 's dans le mois.'
    };
  }
  // le 1er n'est demandé que s'il n'est pas lui-même un jour de répétition (sinon la réponse serait le jour de l'énoncé)
  const X = (t === 1 && d !== 1) ? 1 : R.pick(range(2, cb.L).filter(x => md(x - d, 7) !== 0));
  const w = md(W + X - d, 7), noms = [JOURS[w], JOURS[md(w + 1, 7)], JOURS[md(w - 1, 7)], JOURS[md(w + R.pick([2, 3, -2, -3]), 7)]];
  const ref = dates.filter(x => x <= X).pop(), jj = x => (x === 1 ? '1er' : String(x)), pl = x => x + ' jour' + (x > 1 ? 's' : '');
  const fin = dates.indexOf(X) >= 0 ? 'Le ' + jj(X) + ' est donc lui-même un ' + JOURS[W] + '.'
    : ref ? 'Le ' + ref + ' est un ' + JOURS[W] + ' et le ' + X + ' vient ' + pl(X - ref) + ' plus tard : c\'est un ' + JOURS[w] + '.'
          : 'Le ' + d + ' est un ' + JOURS[W] + ' et le ' + jj(X) + ' vient ' + pl(d - X) + ' plus tôt : c\'est un ' + JOURS[w] + '.';
  return {
    q: base + 'Quel jour de la semaine est ' + dateTxt(X, M.nom) + ' ?',
    a: JOURS[w], accept: null, choix: noms,
    expl: raison + fin + ' Piège : se tromper de premier ' + JOURS[W] + " décale la réponse d'un jour."
  };
}

/* 3C · robot sur un quadrillage : parité de x + y */
const CTX_ROBOT = [
  "Un robot part du point (0 ; 0) d'un quadrillage. À chaque seconde, il avance d'une case vers le haut, le bas, la gauche ou la droite.",
  "Un pion part de la case (0 ; 0) d'un grand quadrillage. À chaque coup, il passe sur une case voisine, en haut, en bas, à gauche ou à droite."
];
function g3robot(R){
  const v = R.int(0, 2), ci = R.int(0, 1), ctx = CTX_ROBOT[ci], u = ci ? 'coups' : 'secondes', u1 = ci ? 'coup' : 'seconde';
  const tire = (k, bon) => {
    for (let t = 0; t < 200; t++){
      const x = R.int(-9, 9), y = R.int(-9, 9), s = Math.abs(x) + Math.abs(y);
      if (s === 0 || s > k || s < k - 12) continue;
      if ((par(s) === par(k)) === bon) return [x, y];
    }
    return null;
  };
  if (v === 0){
    const k = R.int(7, 21), b = tire(k, true), dd = [];
    for (let t = 0; t < 60 && dd.length < 3; t++){ const c = tire(k, false); if (c && !dd.some(e => e[0] === c[0] && e[1] === c[1])) dd.push(c); }
    if (!b || dd.length < 3) return null;
    const liste = R.shuffle([b].concat(dd));
    const s = e => Math.abs(e[0]) + Math.abs(e[1]);
    return {
      q: ctx + ' Où peut-il se trouver après exactement ' + k + ' ' + u + ' : en ' + ou(liste.map(e => pt(e[0], e[1]))) + ' ?',
      a: pt(b[0], b[1]), accept: null, choix: [b].concat(dd).map(e => pt(e[0], e[1])),
      expl: 'Regarde la parité : à chaque ' + u1 + ', une seule coordonnée change de 1, donc |x| + |y| (le nombre minimal de pas pour arriver en (x ; y)) change toujours de parité comme le nombre de ' + u + '. '
        + 'Après ' + k + ' ' + u + ', il faut |x| + |y| ' + motP(k) + ' et au plus ' + k + '. '
        + liste.map(e => pt(e[0], e[1]) + ' donne ' + s(e)).join(' ; ') + '. Seul ' + pt(b[0], b[1]) + ' convient : on y va en ' + s(b) + ' ' + u + ' et on dépense les ' + (k - s(b)) + ' autres en allers-retours.'
    };
  }
  if (v === 1){
    const bonsV = range(12, 40).filter(x => par(x) === 0), a = R.pick(bonsV), d = choisir(R, range(11, 41).filter(x => par(x) === 1), 3), liste = [a].concat(d);
    return {
      q: ctx + ' Après un certain nombre de ' + u + ', il est revenu à son point de départ. Lequel de ces nombres de ' + u + ' est possible : ' + listeNb(liste) + ' ?',
      a: String(a), accept: null, choix: liste.map(String),
      expl: "Colorie le quadrillage comme un damier et regarde ce que chaque " + u1 + " fait à la couleur de la case. Chaque " + u1 + " fait changer de couleur, donc on ne retrouve la couleur de départ qu'après un nombre pair de " + u + '. '
        + 'Seul ' + a + ' est pair, et il convient (par exemple ' + (a / 2) + ' allers-retours entre deux cases voisines). Piège : croire qu\'on peut revenir en un nombre impair de ' + u + ' en faisant un détour.'
    };
  }
  const x = R.int(-6, 6), y = R.int(-6, 6), s = Math.abs(x) + Math.abs(y);
  if (s < 4) return null;
  const a = R.pick(range(s, s + 12).filter(t => par(t) === par(s)));
  const petit = R.pick(range(Math.max(1, s - 4), s - 1).filter(t => par(t) === par(s)).concat([s - 2]).filter(t => t >= 1));
  const mauv = choisir(R, range(s - 3, s + 13).filter(t => t >= 1 && par(t) !== par(s)), 2);
  if (!petit || petit >= s) return null;
  const liste = [a, petit].concat(mauv);
  return {
    q: ctx + ' À la fin, il se trouve en ' + pt(x, y) + '. Lequel de ces nombres de ' + u + ' est possible : ' + listeNb(liste) + ' ?',
    a: String(a), accept: null, choix: liste.map(String),
    expl: 'Deux contraintes : il faut au moins |x| + |y| ' + u + ' pour arriver, et ce nombre change de parité à chaque ' + u1 + '. '
      + 'Ici |' + nb(x) + '| + |' + nb(y) + '| = ' + s + ', donc il faut un nombre de ' + u + ' ' + motP(s) + ' et au moins égal à ' + s + '. '
      + 'Seul ' + a + ' convient. Piège : ' + petit + ' a la bonne parité mais il est trop petit pour arriver en ' + pt(x, y) + '.'
  };
}

/* 3D · 1 □ 2 □ 3 □ … □ n : résultat possible ? */
function temoinSignes(n, v){
  const S = T(n), x = (S - v) / 2;      // somme des nombres à faire précéder de −, choisis parmi 2..n
  for (let m = 0; m < (1 << (n - 1)); m++){
    let s = 0; for (let i = 2; i <= n; i++) if ((m >> (i - 2)) & 1) s += i;
    if (s === x){ let t = '1'; for (let i = 2; i <= n; i++) t += ((m >> (i - 2)) & 1 ? ' − ' : ' + ') + i; return t + ' = ' + nb(v); }
  }
  return null;
}
function g3signes(R){
  const n = R.int(6, 12), S = T(n), p = S % 2;
  const a = R.pick(range(-12, 12).filter(x => par(x) === p)), mauv = range(-12, 12).filter(x => par(x) !== p);
  const z = p ? 0 : 1, d = R.int(0, 1) ? [z].concat(choisir(R, mauv.filter(x => x !== z), 2)) : choisir(R, mauv, 3);
  const liste = [a].concat(d), tem = temoinSignes(n, a);
  if (!tem) return null;
  return {
    q: "Dans l'expression 1 □ 2 □ 3 □ … □ " + n + ', on remplace chaque □ par un signe + ou un signe −, puis on calcule. Lequel des résultats ' + listeNb(liste) + ' peut-on obtenir ?',
    a: nb(a), accept: null, choix: liste.map(x => nb(x)),
    expl: 'Compare avec le calcul où tous les signes sont des + : remplacer un + k par un − k enlève deux fois k, un nombre pair, donc le résultat a toujours la même parité que cette somme. '
      + 'Ici 1 + 2 + … + ' + n + ' = ' + S + ', qui est ' + motP(S) + ' : le résultat est ' + motP(S) + ', et seul ' + nb(a) + ' convient. Par exemple ' + tem + '.'
  };
}

/* 3E · tableau « somme ± c » : la valeur finale est fixée */
const OPS_SC = [{c: -1, t: 'leur somme diminuée de 1'}, {c: 1, t: 'leur somme augmentée de 1'}, {c: 2, t: 'leur somme augmentée de 2'}, {c: 3, t: 'leur somme augmentée de 3'}];
function g3sommec(R){
  const n = R.int(8, 25), S = T(n), o = R.pick(OPS_SC), F = S + o.c * (n - 1);
  return {
    q: 'On écrit au tableau les entiers de 1 à ' + n + '. À chaque étape, on efface deux nombres et on écrit à leur place ' + o.t + ". Quand il ne reste qu'un seul nombre, que vaut-il ?",
    a: nb(F), accept: null,
    choix: qcm(nb(F), [nb(S + o.c * n), nb(S), nb(S - o.c * (n - 1))], k => nb(F + (k % 2 ? k : -k))),
    expl: 'Suis le total des nombres écrits : à chaque étape il ' + (o.c < 0 ? 'baisse de ' + (-o.c) : 'augmente de ' + o.c) + ", et il y a exactement " + (n - 1) + ' étapes (on passe de ' + n + ' nombres à un seul, un de moins à chaque fois). '
      + 'Le total de départ vaut 1 + 2 + … + ' + n + ' = ' + nb(S) + ', donc le dernier nombre vaut ' + nb(S) + (o.c < 0 ? ' − ' : ' + ') + Math.abs(o.c) + ' × ' + (n - 1) + ' = ' + nb(F) + '. '
      + 'Piège : compter ' + n + ' étapes au lieu de ' + (n - 1) + ' donne ' + nb(S + o.c * n) + '.'
  };
}

/* =====================================================================
   NIVEAU 4
   ===================================================================== */

/* 4A · sac de billes : la parité d'une couleur décide de la dernière bille */
const COUL = [['blanches', 'noires', 'blanche', 'noire'], ['rouges', 'bleues', 'rouge', 'bleue'], ['vertes', 'jaunes', 'verte', 'jaune']];
function g4sac(R){
  const c = R.pick(COUL), n1 = R.int(6, 25), n2 = R.int(6, 25);
  if (n1 === n2) return null;
  const nU = R.int(0, 1), nV = 1 - nU;                 // U : remise si même couleur ; V : remise si couleurs différentes
  const cnt = [n1, n2], z = R.int(0, 1), tot = n1 + n2;
  const derniere = cnt[nV] % 2 === 1 ? nV : nU;         // la parité du nombre de billes V ne change jamais
  const ans = derniere === z ? '1' : '0', autre = ans === '1' ? '0' : '1';
  const prop = frac(cnt[z], tot);
  return {
    q: 'Un sac contient ' + n1 + ' billes ' + c[0] + ' et ' + n2 + ' billes ' + c[1] + ", et on a une réserve de billes des deux couleurs à côté. On tire deux billes au hasard. Si elles ont la même couleur, on remet dans le sac une bille " + c[2 + nU]
      + ' ; si elles sont de couleurs différentes, on remet une bille ' + c[2 + nV] + ". On recommence jusqu'à ce qu'il ne reste qu'une bille dans le sac. Quelle est la probabilité que cette dernière bille soit " + c[2 + z] + ' ?',
    a: ans, accept: null,
    choix: [ans, autre, prop, '1/2'],
    expl: 'Cherche ce qui ne change pas : suis la parité du nombre de billes ' + c[nV] + '. '
      + 'Deux ' + c[nV] + ' tirées : il y en a 2 de moins. Deux ' + c[nU] + ' : le nombre de ' + c[nV] + ' ne bouge pas. Une de chaque : on enlève une ' + c[2 + nV] + ' mais on en remet une. '
      + 'Le nombre de billes ' + c[nV] + ' change donc de 0 ou de 2 : sa parité ne change jamais. Au départ il y en a ' + cnt[nV] + ', un nombre ' + motP(cnt[nV]) + ', donc la dernière bille est '
      + (derniere === nV ? c[2 + nV] : c[2 + nU] + ' (il ne peut pas rester exactement une ' + c[2 + nV] + ')') + '. La probabilité cherchée vaut ' + ans + '. '
      + 'Piège : calculer la proportion ' + prop + ' ou répondre 1/2 : ici le hasard ne joue aucun rôle.'
  };
}

/* 4B · poignées de main régulières : n × k doit être pair */
function g4graphe(R){
  const v = R.int(0, 2);
  if (v === 0){
    const k = R.pick([3, 5, 7]), a = R.pick(range(k + 1, 24).filter(x => x % 2 === 0));
    const impairs = choisir(R, range(k + 2, 25).filter(x => x % 2 === 1 && x !== a), 2), petit = k - 1;
    const liste = [a, petit].concat(impairs);
    return {
      q: 'Dans un club, chaque membre a exactement ' + k + ' amis parmi les autres membres (une amitié est toujours réciproque). Combien de membres le club peut-il compter : ' + listeNb(liste) + ' ?',
      a: String(a), accept: null, choix: liste.map(String),
      expl: 'Compte les amitiés de deux façons : chaque amitié relie deux membres, donc le nombre de membres multiplié par le nombre d\'amis de chacun vaut le double du nombre d\'amitiés, il est pair. '
        + 'Ici ce produit vaut (nombre de membres) × ' + k + ', et comme ' + k + ' est impair, le nombre de membres doit être pair, et il faut au moins ' + (k + 1) + ' membres pour que chacun ait ' + k + ' amis. '
        + impairs.map(x => x + ' est impair').join(', ') + ', et ' + petit + ' est trop petit. Seul ' + a + ' convient : on peut placer les membres en cercle et relier chacun à ses voisins proches et à celui d\'en face.'
    };
  }
  if (v === 1){
    const n = R.pick(range(7, 21).filter(x => x % 2 === 1)), a = R.pick(range(2, n - 1).filter(x => x % 2 === 0));
    const impairs = choisir(R, range(3, n - 1).filter(x => x % 2 === 1), 2), grand = n + R.pick([1, 3]);
    const liste = [a, grand].concat(impairs);
    return {
      q: 'Un tournoi réunit ' + n + ' équipes. Chaque équipe doit jouer exactement k matchs, jamais deux fois contre la même équipe. Laquelle de ces valeurs de k est possible : ' + listeNb(liste) + ' ?',
      a: String(a), accept: null, choix: liste.map(String),
      expl: 'Compte les matchs de deux façons : chaque match concerne deux équipes, donc (nombre d\'équipes) × k est le double du nombre de matchs, il est pair. '
        + 'Ici ' + n + ' × k doit être pair ; comme ' + n + ' est impair, k doit être pair ; et k ne peut pas dépasser ' + (n - 1) + ', le nombre d\'adversaires. '
        + impairs.map(x => x + ' est impair').join(', ') + ', et ' + grand + ' dépasse ' + (n - 1) + '. Seul k = ' + a + ' convient.'
    };
  }
  const projets = [], vus = new Set();
  const ajoute = bon => {
    for (let t = 0; t < 100; t++){
      const n = R.int(5, 15), k = R.pick([3, 4, 5, 6, 7]);
      if (k >= n || vus.has(n + '-' + k)) continue;
      if (((n * k) % 2 === 0) !== bon) continue;
      vus.add(n + '-' + k); projets.push([n, k]); return true;
    }
    return false;
  };
  if (!ajoute(true) || !ajoute(false) || !ajoute(false) || !ajoute(false)) return null;
  const txt = e => e[0] + ' villes reliées chacune à ' + e[1] + ' autres';
  const b = projets[0];
  return {
    q: "On veut relier des villes par des routes directes, de sorte que chaque ville soit reliée à exactement le même nombre d'autres villes. Lequel de ces projets est réalisable : " + ou(R.shuffle(projets).map(txt)) + ' ?',
    a: txt(b), accept: null, choix: projets.map(txt),
    expl: 'Compte les bouts de routes : chaque route a deux bouts, donc (nombre de villes) × (routes par ville) est le double du nombre de routes, il doit être pair. '
      + projets.map(e => e[0] + ' × ' + e[1] + ' = ' + e[0] * e[1] + ' (' + motP(e[0] * e[1]) + ')').join(' ; ') + '. '
      + 'Seul le projet à ' + b[0] + ' villes et ' + b[1] + ' routes par ville donne un produit pair, et il est réalisable (villes en cercle, chacune reliée à ses voisines proches' + (b[1] % 2 ? ' et à celle d\'en face' : '') + ').'
  };
}

/* 4C · dominos sur un damier troué : coloriage */
const coul = c => (c ? 'claire' : 'foncée');                // (l ; c) foncée quand l + c est pair
function g4domino(R){
  if (R.int(0, 1) === 0){
    let m, n; do { m = R.int(4, 8); n = R.int(4, 8); } while ((m * n) % 2);
    const l0 = R.int(1, m), c0 = R.int(1, n), k0 = par(l0 + c0);
    const cases = []; for (let l = 1; l <= m; l++) for (let c = 1; c <= n; c++) if (!(l === l0 && c === c0)) cases.push([l, c]);
    const b = R.pick(cases.filter(e => par(e[0] + e[1]) !== k0)), d = choisir(R, cases.filter(e => par(e[0] + e[1]) === k0), 3);
    const liste = [b].concat(d), tx = e => pt(e[0], e[1]);
    return {
      q: 'On dispose d\'un damier de ' + m + ' lignes et ' + n + ' colonnes ; on note (l ; c) la case de la ligne l et de la colonne c. On enlève la case ' + tx([l0, c0])
        + ', puis une deuxième case, et on veut recouvrir toutes les cases restantes avec des dominos (chaque domino couvre exactement deux cases qui ont un côté commun). Quelle deuxième case peut-on enlever pour que ce soit possible : ' + ou(R.shuffle(liste).map(tx)) + ' ?',
      a: tx(b), accept: null, choix: liste.map(tx),
      expl: 'Colorie le damier comme un échiquier : la case (l ; c) est foncée quand l + c est pair, claire sinon. Un domino couvre toujours une case foncée et une case claire, donc il faut autant de cases des deux couleurs. '
        + 'Le damier en a ' + (m * n / 2) + ' de chaque, et la case ' + tx([l0, c0]) + ' est ' + coul(k0) + ' : il faut enlever une case ' + coul(1 - k0) + '. '
        + liste.map(e => tx(e) + ' : ' + e[0] + ' + ' + e[1] + ' = ' + (e[0] + e[1]) + ', ' + coul(par(e[0] + e[1]))).join(' ; ') + '. Seule ' + tx(b) + ' convient, et dans ce cas le pavage existe bien.'
    };
  }
  const dims = R.pick([[3, 5], [5, 3], [5, 5], [5, 7], [7, 5], [7, 7], [3, 7], [7, 3]]), m = dims[0], n = dims[1];
  const cases = []; for (let l = 1; l <= m; l++) for (let c = 1; c <= n; c++) cases.push([l, c]);
  const b = R.pick(cases.filter(e => par(e[0] + e[1]) === 0)), d = choisir(R, cases.filter(e => par(e[0] + e[1]) === 1), 3);
  const liste = [b].concat(d), tx = e => pt(e[0], e[1]), nf = (m * n + 1) / 2;
  return {
    q: 'On dispose d\'un damier de ' + m + ' lignes et ' + n + ' colonnes ; on note (l ; c) la case de la ligne l et de la colonne c. On enlève une seule case et on veut recouvrir toutes les autres avec des dominos (chaque domino couvre exactement deux cases qui ont un côté commun). Quelle case peut-on enlever pour que ce soit possible : '
      + ou(R.shuffle(liste).map(tx)) + ' ?',
    a: tx(b), accept: null, choix: liste.map(tx),
    expl: 'Colorie le damier comme un échiquier : la case (l ; c) est foncée quand l + c est pair, claire sinon. Un domino couvre toujours une case foncée et une case claire, donc il faut autant de cases des deux couleurs. '
      + 'Le damier compte ' + nf + ' cases foncées (les quatre coins en font partie) et ' + (nf - 1) + ' claires : il faut enlever une case foncée. '
      + liste.map(e => tx(e) + ' : ' + (e[0] + e[1]) + ', ' + coul(par(e[0] + e[1]))).join(' ; ') + '. Seule ' + tx(b) + ' convient, et dans ce cas le pavage existe bien.'
  };
}

/* 4D et 5F · pièces à retourner : nombre minimal de coups (BFS sur le nombre de pièces côté face) */
function minCoups(n, k){
  const d = new Array(n + 1).fill(-1), file = [0]; d[0] = 0;
  const pred = new Array(n + 1).fill(-1);
  while (file.length){
    const f = file.shift();
    for (let j = 0; j <= Math.min(k, f); j++){
      if (k - j > n - f) continue;
      const g = f - j + (k - j);
      if (d[g] < 0){ d[g] = d[f] + 1; pred[g] = f; file.push(g); }
    }
  }
  if (d[n] < 0) return {m: -1, chemin: []};
  const ch = []; for (let x = n; x >= 0; x = pred[x]){ ch.unshift(x); if (x === 0) break; }
  return {m: d[n], chemin: ch};
}
const CTX_PIECES = [
  {intro: (n, k) => n + ' pièces sont posées sur une table, toutes côté pile. À chaque coup, on retourne exactement ' + k + ' pièces, choisies comme on veut.',
   fin: 'Quel est le nombre minimal de coups pour que toutes les pièces soient côté face ?', bien: 'pièces côté face', obj: 'pièce'},
  {intro: (n, k) => n + ' lampes sont allumées. À chaque coup, on choisit exactement ' + k + " lampes et on change leur état (une lampe allumée s'éteint, une lampe éteinte s'allume).",
   fin: 'Quel est le nombre minimal de coups pour que toutes les lampes soient éteintes ?', bien: 'lampes éteintes', obj: 'lampe'},
  {intro: (n, k) => n + " gobelets sont posés à l'envers. À chaque coup, on retourne exactement " + k + ' gobelets, choisis comme on veut.',
   fin: "Quel est le nombre minimal de coups pour qu'ils soient tous à l'endroit ?", bien: "gobelets à l'endroit", obj: 'gobelet'}
];
/* Niveau 4 : seulement des cas où la réponse naïve (n ÷ k arrondi) est fausse, à cause de la parité
   (« piège de parité ») ou parce que c'est impossible. Les cas où n ÷ k arrondi suffit sont trop faciles pour ce niveau.
   Niveau 5 : cas où il faut en plus la borne « chaque objet change au plus m fois » (classement vérifié par BFS). */
const PIECES_SIMPLES = [[5, 3], [7, 5], [8, 3], [9, 5], [9, 7], [11, 3], [11, 7], [11, 9], [12, 5], [7, 4], [9, 4], [9, 6], [11, 4], [11, 6], [11, 8]];
const PIECES_DURES = [[6, 4], [6, 5], [8, 5], [8, 6], [8, 7], [10, 6], [10, 7], [10, 8], [10, 9], [12, 7], [12, 8], [12, 9], [12, 10], [12, 11]];
const plusGrandImpair = m => (m % 2 ? m : m - 1);
function gPieces(R, dures){
  const nk = R.pick(dures ? PIECES_DURES : PIECES_SIMPLES), n = nk[0], k = nk[1], cx = R.pick(CTX_PIECES);
  const r = minCoups(n, k), ce = Math.ceil(n / k);
  const q = cx.intro(n, k) + ' ' + cx.fin;
  if (r.m < 0){
    return {
      q, a: IMP, accept: null,
      choix: qcm(IMP, [String(ce), String(ce + 1), String(n)], j => String(ce + 1 + j)),
      expl: 'Suis la parité du nombre de ' + cx.bien + ' : regarde de combien ce nombre peut varier en un seul coup. '
        + 'Si un coup en change j dans un sens et ' + k + ' − j dans l\'autre, ce nombre varie de ' + k + ' − 2j, un nombre pair puisque ' + k + ' est pair. '
        + 'Il reste donc toujours pair (0 au départ) et ne peut jamais valoir ' + n + ', qui est impair : c\'est impossible. Piège : diviser ' + n + ' par ' + k + ' et arrondir.'
    };
  }
  const ans = String(r.m), chemin = 'le nombre de ' + cx.bien + ' peut passer par ' + r.chemin.join(', ');
  let expl;
  if (!dures){
    expl = 'Deux contraintes : une borne (un coup ne modifie qu\'un nombre limité d\'objets) et la parité du nombre de coups. Ici il faut au moins ' + n + ' ÷ ' + k + ' coups, arrondi au-dessus, soit ' + ce + '. '
      + (k % 2 ? 'Comme ' + k + ' est impair, chaque coup change la parité du nombre de ' + cx.bien + ' : après m coups, ce nombre a la parité de m, et il doit valoir ' + n + ', donc m doit être ' + motP(n) + '. '
               : 'Comme ' + k + ' est pair, le nombre de ' + cx.bien + ' reste pair, ce qui ne gêne pas puisque ' + n + ' est pair. ')
      + 'Le plus petit nombre de coups possible est donc ' + r.m + ', et il suffit : ' + chemin + '.'
      + (r.m !== ce ? ' Piège : répondre ' + ce + ' en oubliant la parité.' : '');
  } else {
    const lignes = [];
    for (let m = ce; m < r.m; m++){
      const tot = m * k;
      if ((tot - n) % 2) lignes.push(m + ' coups : ' + tot + ' retournements, ' + tot + ' − ' + n + ' est impair');
      else lignes.push(m + ' coups : ' + tot + ' retournements, mais chaque ' + cx.obj + ' change au plus ' + plusGrandImpair(m) + ' fois (un nombre impair, au plus ' + m + '), donc au plus ' + (n * plusGrandImpair(m)) + ' retournements');
    }
    const tot = r.m * k;
    expl = 'Compte le nombre total de retournements : chaque ' + cx.obj + ' doit changer un nombre impair de fois, et au plus autant de fois qu\'il y a de coups. '
      + 'En m coups, on fait m × ' + k + ' retournements. Il faut donc que m × ' + k + ' − ' + n + ' soit pair et que m × ' + k + ' ne dépasse pas ' + n + ' fois le plus grand nombre impair inférieur ou égal à m. '
      + (lignes.length ? lignes.join(' ; ') + '. ' : '')
      + 'Avec ' + r.m + ' coups : ' + tot + ' retournements, ' + tot + ' − ' + n + ' = ' + (tot - n) + ' est pair et ' + tot + ' ≤ ' + (n * plusGrandImpair(r.m)) + ' : ça marche, par exemple ' + chemin + '. '
      + 'Piège : s\'arrêter à ' + ce + ' coups, la borne ' + n + ' ÷ ' + k + ' arrondie.';
  }
  return {q, a: ans, accept: null, choix: qcm(ans, [String(ce), IMP, String(r.m + 1), String(r.m - 1), String(r.m + 2)].filter(x => x !== '0'), j => String(r.m + 2 + j)), expl};
}
const g4pieces = R => gPieces(R, false);
const g5pieces = R => gPieces(R, true);

/* 4E · tableau « différence » : parité ET borne */
function g4diff(R){
  const n = R.int(6, 12), S = T(n), p = S % 2;
  if (R.int(0, 2) === 0){
    const ans = p;
    return {
      q: (cd => cd.intro(n) + ' Quelle est la plus petite valeur possible pour ' + cd.sujet + ' ?')(R.pick(CTX_DIFF)),
      a: String(ans), accept: null, choix: ['0', '1', '2', '3'],
      expl: "Suis la parité de la somme des nombres : remplacer a et b par a − b enlève deux fois b au total, donc cette parité ne change jamais. "
        + 'Au départ la somme vaut ' + S + ', qui est ' + motP(S) + ', donc le dernier nombre est ' + motP(S) + ' : il vaut au moins ' + ans + '. '
        + 'Et cette valeur est bien atteignable, par exemple en formant des 1 avec des nombres consécutifs (4 − 3 = 1, 6 − 5 = 1…), puis en les annulant deux par deux (1 − 1 = 0). Piège : répondre 0 sans regarder la parité.'
    };
  }
  const a = R.pick(range(Math.ceil(n / 2), n).filter(x => par(x) === p));
  const trop = R.pick(range(n + 1, 2 * n).filter(x => par(x) === p && x !== S));
  const mauv = R.pick(range(0, n).filter(x => par(x) !== p));
  const liste = [a, S, trop, mauv];
  return {
    q: (cd => cd.intro(n) + ' ' + cd.lequel(liste))(R.pick(CTX_DIFF)),
    a: String(a), accept: null, choix: liste.map(String),
    expl: 'Utilise deux idées : la parité de la somme ne change jamais, et une différence de deux nombres ne dépasse jamais le plus grand des deux. '
      + 'Le dernier nombre est donc au plus ' + n + '. Au départ la somme vaut ' + S + ', ' + motP(S) + ' : le dernier nombre est ' + motP(S) + ' et au plus ' + n + '. '
      + mauv + ' a la mauvaise parité ; ' + trop + ' et ' + S + ' dépassent ' + n + '. Seul ' + a + ' convient. Piège : croire que la somme ' + S + ' se conserve.'
  };
}

/* 4F · un événement tous les 3 ou 5 jours : la parité des dates fixe la première date */
const PAS = [[3, 28, 0, 4], [3, 28, 1, 4], [3, 29, 0, 4], [3, 31, 1, 6], [5, 28, 0, 2], [5, 28, 1, 2], [5, 29, 0, 2], [5, 31, 1, 4]];
const CTX_PAS = [
  {phr: s => 'un marché a lieu tous les ' + s + ' jours', nom: 'jours de marché', prem: 'le premier jour de marché', der: 'le dernier jour de marché'},
  {phr: s => 'une pharmacie est de garde tous les ' + s + ' jours', nom: 'gardes', prem: 'la première garde', der: 'la dernière garde'},
  {phr: s => 'Tom va à la piscine tous les ' + s + ' jours', nom: 'séances', prem: 'la première séance', der: 'la dernière séance'}
];
function g4pas(R){
  const cb = R.pick(PAS), s = cb[0], L = cb[1], P = cb[2], k = cb[3], M = mois(L, R), cx = R.pick(CTX_PAS);
  const info = range(1, s).map(d => { const l = []; for (let x = d; x <= L; x += s) l.push(x); return {d, l, c: l.filter(x => par(x) === P).length}; });
  const ok = info.filter(e => e.c === k);
  if (ok.length !== 1) return null;
  const e = ok[0], t = R.int(0, 2);
  const base = M.intro + ', ' + cx.phr(s) + '. Ce mois-ci, exactement ' + k + ' ' + cx.nom + ' tombent à une date ' + motPf(P) + '. ';
  const raison = "L'écart entre deux dates consécutives est impair, donc les dates alternent entre paires et impaires. Essaie chaque premier jour possible, de 1 à " + s + ', et compte les dates ' + motPfs(P) + ' : '
    + info.map(f => 'en commençant le ' + f.d + ', ' + f.c).join(' ; ') + '. Seul un début le ' + e.d + ' donne exactement ' + k + ' dates ' + motPfs(P) + ' : ' + et(e.l) + '. ';
  if (t === 0) return {
    q: base + 'Quelle est la date de ' + cx.prem + ' du mois ?', a: String(e.d), accept: null,
    choix: qcm(String(e.d), info.filter(f => f.d !== e.d).map(f => String(f.d)).concat([String(s + 1)]), j => String(s + 1 + j)),
    expl: raison + 'La première date est donc le ' + e.d + '.'
  };
  const der = e.l[e.l.length - 1];
  if (t === 1) return {
    q: base + 'Quelle est la date de ' + cx.der + ' du mois ?', a: String(der), accept: null,
    choix: qcm(String(der), info.filter(f => f.d !== e.d).map(f => String(f.l[f.l.length - 1])).concat([String(L), String(der - s)]), j => String(der - j)),
    expl: raison + 'La dernière date est donc le ' + der + '.'
  };
  return {
    q: base + 'Combien de ' + cx.nom + ' y a-t-il en tout ce mois-ci ?', a: String(e.l.length), accept: null,
    choix: qcm(String(e.l.length), info.filter(f => f.d !== e.d).map(f => String(f.l.length)).concat([String(2 * k), String(k), String(Math.floor(L / s))]), j => String(e.l.length + j + 1)),
    expl: raison + 'Il y en a donc ' + e.l.length + ' en tout. Piège : doubler ' + k + ' sans vérifier si la première et la dernière date ont la même parité.'
  };
}

/* =====================================================================
   NIVEAU 5
   ===================================================================== */

/* 5A · trois couleurs : les écarts de 3 en 3 sont invariants */
const OBJ3 = [
  {nom: 'jetons', f: false, cou: ['rouges', 'verts', 'bleus']},
  {nom: 'billes', f: true, cou: ['rouges', 'vertes', 'bleues']},
  {nom: 'cubes', f: false, cou: ['jaunes', 'verts', 'bleus']}
];
function g5couleurs(R){
  const o = R.pick(OBJ3), c = [R.int(4, 20), R.int(4, 20), R.int(4, 20)];
  const cong = (i, j) => md(c[i] - c[j], 3) === 0;
  const paires = [[0, 1, 2], [1, 2, 0], [0, 2, 1]].filter(e => cong(e[0], e[1]));
  if (paires.length > 1) return null;                            // les trois congrus : plusieurs couleurs possibles, on évite
  const tous = o.f ? 'toutes' : 'tous';
  const opt = o.cou.map(x => 'oui, ' + tous + ' ' + x);
  const ans = paires.length ? opt[paires[0][2]] : 'non, ' + IMP;
  const ec = [[0, 1], [1, 2], [0, 2]].map(e => 'écart entre ' + o.cou[e[0]] + ' et ' + o.cou[e[1]] + ' : ' + Math.abs(c[e[0]] - c[e[1]]));
  return {
    q: 'Une boîte contient ' + c[0] + ' ' + o.nom + ' ' + o.cou[0] + ', ' + c[1] + ' ' + o.cou[1] + ' et ' + c[2] + ' ' + o.cou[2] + '. Un coup consiste à retirer deux ' + o.nom + ' de couleurs différentes et à ajouter deux ' + o.nom
      + ' de la troisième couleur. Après plusieurs coups, peut-on obtenir une boîte où ' + tous + ' les ' + o.nom + ' ont la même couleur ?',
    a: ans, accept: null, choix: opt.concat(['non, ' + IMP]),
    expl: 'Cherche un invariant en regardant les écarts entre deux couleurs : à chaque coup, une couleur gagne 2 et les deux autres perdent 1, donc chaque écart change de 0 ou de 3. Son reste dans la division par 3 ne change jamais. '
      + 'Pour finir avec une seule couleur, les deux autres doivent tomber à 0, donc leur écart doit être un multiple de 3 dès le départ. Ici : ' + ec.join(' ; ') + '. '
      + (paires.length ? 'Seul l\'écart entre ' + o.cou[paires[0][0]] + ' et ' + o.cou[paires[0][1]] + ' est un multiple de 3 : on ne peut finir qu\'avec des ' + o.nom + ' ' + o.cou[paires[0][2]] + ', et on vérifie que c\'est réalisable.'
                       : 'Aucun écart n\'est un multiple de 3 : c\'est impossible. Piège : croire qu\'en jouant assez longtemps on finit toujours par y arriver.')
  };
}

/* 5B · ±1 ±2 … ±n : combien de résultats ? */
function g5signes(R){
  const n = R.int(6, 20), S = T(n), deux = Math.pow(2, n);
  const base = 'On écrit les nombres 1, 2, 3, …, ' + n + ' et on place devant chacun d\'eux un signe + ou un signe −, puis on fait le calcul. ';
  const raison = 'Commence par trouver quels résultats sont possibles : la parité, puis les bornes. Changer le signe d\'un nombre k fait varier le résultat de 2k, donc tous les résultats ont la parité de 1 + 2 + … + ' + n + ' = ' + S
    + ', et ils vont de −' + S + ' à ' + S + '. Toutes ces valeurs sont atteignables, car en choisissant les nombres précédés de −, on peut obtenir n\'importe quelle somme de 0 à ' + S + '. ';
  if (R.int(0, 2) > 0) return {
    q: base + 'Combien de résultats différents peut-on obtenir ?', a: nb(S + 1), accept: null,
    choix: qcm(nb(S + 1), [nb(deux), nb(2 * S + 1), nb(S)], j => nb(S + 1 + 2 * j)),
    expl: raison + 'De −' + S + ' à ' + S + ' de 2 en 2, il y a ' + nb(S + 1) + ' valeurs. Piège : 2' + sup(n) + ' = ' + nb(deux) + ' compte les façons de placer les signes, pas les résultats différents ; ' + nb(2 * S + 1) + ' oublie la parité.'
  };
  const pos = S % 2 ? (S + 1) / 2 : S / 2;
  return {
    q: base + 'Combien de résultats strictement positifs différents peut-on obtenir ?', a: nb(pos), accept: null,
    choix: qcm(nb(pos), [nb(S), nb(S + 1), nb(deux / 2), nb(pos + 1)], j => nb(pos + 2 + j)),
    expl: raison + 'Les résultats strictement positifs sont ' + (S % 2 ? '1, 3, 5, …, ' + S : '2, 4, 6, …, ' + S) + ', soit ' + nb(pos) + ' valeurs. Piège : ' + nb(S) + ' oublie que seuls les nombres de la bonne parité sont atteignables.'
  };
}

/* 5C · invariant produit : a + b + ab ou ab − a − b + 2 */
function g5produit(R){
  const op = R.int(0, 1);
  let l;
  for (let t = 0; t < 50; t++){
    const k = R.int(4, 5);                 // au moins 4 nombres : le calcul direct devient long, l'invariant s'impose
    l = tri(choisir(R, op ? range(2, 9) : range(1, 9), k));
    const P = l.reduce((s, x) => s * (op ? x - 1 : x + 1), 1);
    if (P >= 20 && P <= 6000) break;
    l = null;
  }
  if (!l) return null;
  const sx = l.reduce((s, x) => s + x, 0), px = l.reduce((s, x) => s * x, 1);
  if (op === 0){
    const P = l.reduce((s, x) => s * (x + 1), 1), F = P - 1;
    return {
      q: 'Au tableau sont écrits les nombres ' + et(l) + '. À chaque étape, on efface deux nombres a et b et on écrit à leur place le nombre a + b + ab. Quand il ne reste qu\'un seul nombre, que vaut-il ?',
      a: nb(F), accept: null,
      choix: qcm(nb(F), [nb(P), nb(px + sx), nb(px - 1)], j => nb(F + (j % 2 ? j : -j) * 2)),
      expl: 'Cherche une forme factorisée : a + b + ab + 1 = (a + 1)(b + 1). Si on ajoute 1 à chaque nombre écrit, une étape remplace (a + 1) et (b + 1) par leur produit : le produit de tous les « nombre + 1 » ne change jamais. '
        + 'Au départ il vaut ' + l.map(x => x + 1).join(' × ') + ' = ' + nb(P) + ', donc le dernier nombre x vérifie x + 1 = ' + nb(P) + ', soit x = ' + nb(F) + '. Piège : oublier de retirer 1 à la fin donne ' + nb(P) + '.'
    };
  }
  const P = l.reduce((s, x) => s * (x - 1), 1), F = P + 1;
  return {
    q: 'Au tableau sont écrits les nombres ' + et(l) + '. À chaque étape, on efface deux nombres a et b et on écrit à leur place le nombre ab − a − b + 2. Quand il ne reste qu\'un seul nombre, que vaut-il ?',
    a: nb(F), accept: null,
    choix: qcm(nb(F), [nb(P), nb(px - sx + 2), nb(P + 2)], j => nb(F + (j % 2 ? j : -j) * 2)),
    expl: 'Cherche une forme factorisée : ab − a − b + 2 − 1 = (a − 1)(b − 1). Si on retire 1 à chaque nombre écrit, une étape remplace (a − 1) et (b − 1) par leur produit : le produit de tous les « nombre − 1 » ne change jamais. '
      + 'Au départ il vaut ' + l.map(x => x - 1).join(' × ') + ' = ' + nb(P) + ', donc le dernier nombre x vérifie x − 1 = ' + nb(P) + ', soit x = ' + nb(F) + '. Piège : oublier d\'ajouter 1 à la fin donne ' + nb(P) + '.'
  };
}

/* 5D · tableau « différence » : plus grande valeur, ou nombre de valeurs possibles */
function g5diff(R){
  const n = R.int(6, 12), S = T(n), p = S % 2;
  const raison = 'Utilise deux idées : la parité de la somme ne change jamais (remplacer a et b par a − b enlève deux fois b), et une différence ne dépasse jamais le plus grand des deux nombres. '
    + 'Le dernier nombre reste donc entre 0 et ' + n + '. Ici la somme de départ vaut ' + S + ', ' + motP(S) + ' : le dernier nombre est ' + motP(S) + ' et au plus ' + n + '. ';
  if (R.int(0, 1) === 0){
    const ans = par(n) === p ? n : n - 1, autre = ans === n ? n - 1 : n;
    return {
      q: (cd => cd.intro(n) + ' Quelle est la plus grande valeur possible pour ' + cd.sujet + ' ?')(R.pick(CTX_DIFF)),
      a: String(ans), accept: null,
      choix: qcm(String(ans), [String(autre), String(S), String(ans - 2), String(n + 1)], j => String(n + 1 + j)),
      expl: raison + 'La plus grande valeur candidate est ' + ans + ', et on l\'atteint : on met ' + n + ' de côté, on ramène les nombres de 1 à ' + (n - 1) + ' à un seul nombre égal à ' + (n - ans)
        + ' (en fabriquant des 1 avec des nombres consécutifs, puis en les annulant deux par deux), et on termine par ' + n + ' − ' + (n - ans) + ' = ' + ans + '. Piège : croire que la somme ' + S + ' se conserve.'
    };
  }
  const vals = range(0, n).filter(x => par(x) === p), c = vals.length;
  return {
    q: (cd => cd.intro(n) + ' Combien de valeurs différentes ' + cd.sujet + ' peut-il prendre ?')(R.pick(CTX_DIFF)),
    a: String(c), accept: null,
    choix: qcm(String(c), [String(n + 1), String(n), String(c + 1), String(c - 1)], j => String(c + 2 + j)),
    expl: raison + 'Toutes ces valeurs sont atteignables : ' + et(vals) + ', soit ' + c + ' valeurs. Piège : compter tous les entiers de 0 à ' + n + ' (' + (n + 1) + ') sans tenir compte de la parité.'
  };
}

/* 5E · poignées de main : le nombre de personnes de degré impair est pair */
function graphique(deg){                                          // Havel–Hakimi
  const d = deg.slice();
  for (;;){
    d.sort((x, y) => y - x);
    if (d[0] === 0) return true;
    const k = d.shift();
    if (k > d.length) return false;
    for (let i = 0; i < k; i++){ d[i]--; if (d[i] < 0) return false; }
  }
}
function g5mains(R){
  const N = R.int(11, 30), dI = R.pick([1, 3, 5]), dP = R.pick([2, 4, 6]), v = R.int(0, 2), deg = Math.min(dI, dP) + ' ou ' + Math.max(dI, dP);
  const okI = c => c >= 2 && c <= N - 2 && graphique(Array(c).fill(dI).concat(Array(N - c).fill(dP)));
  if (v === 2){
    // combien de valeurs possibles, avec au moins une personne de chaque sorte : il faut que TOUS les nombres pairs
    // de 2 à N − 1 soient réalisables (sinon la réponse demanderait plus que la parité) ; on le vérifie ici.
    const pairsC = range(1, N - 1).filter(c => c % 2 === 0);
    if (!pairsC.every(c => graphique(Array(c).fill(dI).concat(Array(N - c).fill(dP))))) return null;
    const cpt = pairsC.length, maxP = pairsC[pairsC.length - 1];
    const mot = dI > 1 ? 'mains' : 'main';
    return {
      q: 'Lors d\'une soirée, ' + N + ' personnes se rencontrent. À la fin, chacune a serré la main d\'exactement ' + deg + ' autres personnes, et les deux cas se produisent. Combien de valeurs différentes peut prendre le nombre de personnes ayant serré exactement ' + dI + ' ' + mot + ' ?',
      a: String(cpt), accept: null,
      choix: qcm(String(cpt), [String(N - 1), String(cpt + 1), String(N - 1 - cpt), String(cpt - 1)], j => String(cpt + 1 + j)),
      expl: 'Additionne les poignées de main de chaque personne : chaque poignée est comptée deux fois, donc ce total est pair. '
        + 'Les personnes à ' + dP + ' poignées apportent un total pair, donc les personnes qui ont serré ' + dI + ' ' + mot + ' (un nombre impair de poignées chacune) doivent être en nombre pair. '
        + 'Comme il y a au moins une personne de chaque sorte, ce nombre est pair et compris entre 1 et ' + (N - 1) + ' : 2, 4, …, ' + maxP + ', soit ' + cpt + ' valeurs, et chacune est réalisable. '
        + 'Piège : compter tous les nombres de 1 à ' + (N - 1) + ' (' + (N - 1) + ' valeurs) sans utiliser la parité.'
    };
  }
  const bonsI = range(2, N - 2).filter(c => c % 2 === 0 && okI(c));
  if (!bonsI.length) return null;
  const cI = R.pick(bonsI);
  if (v === 0){
    const d = choisir(R, range(1, N - 1).filter(c => c % 2 === 1), 3), liste = [cI].concat(d);
    return {
      q: 'Lors d\'une soirée, ' + N + ' personnes se rencontrent. À la fin, chacune a serré la main d\'exactement ' + deg + ' autres personnes. Lequel de ces nombres peut être le nombre de personnes ayant serré exactement ' + dI + ' main' + (dI > 1 ? 's' : '') + ' : ' + listeNb(liste) + ' ?',
      a: String(cI), accept: null, choix: liste.map(String),
      expl: 'Additionne les poignées de main de chaque personne : chaque poignée est comptée deux fois (une fois pour chacune des deux personnes), donc ce total est pair. '
        + 'Les personnes à ' + dP + ' poignées apportent un total pair, donc celles qui ont serré ' + dI + ' main' + (dI > 1 ? 's' : '') + ' (un nombre impair de poignées chacune) doivent être en nombre pair. Seul ' + cI + ' est pair, et cette répartition est bien réalisable. '
        + 'Piège : croire que tout nombre jusqu\'à ' + N + ' convient.'
    };
  }
  const cP = N - cI, d = choisir(R, range(1, N - 1).filter(c => par(c) !== par(N)), 3), liste = [cP].concat(d);
  return {
    q: 'Lors d\'une soirée, ' + N + ' personnes se rencontrent. À la fin, chacune a serré la main d\'exactement ' + deg + ' autres personnes. Lequel de ces nombres peut être le nombre de personnes ayant serré exactement ' + dP + ' mains : ' + listeNb(liste) + ' ?',
    a: String(cP), accept: null, choix: liste.map(String),
    expl: 'Additionne les poignées de main de chaque personne : chaque poignée est comptée deux fois, donc ce total est pair. Les personnes qui ont serré ' + dI + ' main' + (dI > 1 ? 's' : '') + ' (un nombre impair de poignées chacune) doivent donc être en nombre pair. '
      + 'Le nombre de personnes à ' + dP + ' poignées vaut ' + N + ' moins un nombre pair : il a la même parité que ' + N + ', il est ' + motP(N) + '. Seul ' + cP + ' convient, et cette répartition est bien réalisable. '
      + 'Piège : appliquer la règle « nombre pair » au mauvais groupe.'
  };
}

/* =====================================================================
   aiguillage
   ===================================================================== */
const TYPES = {
  1: [g1expr, g1elim, g1compte, g1possible],
  2: [g2quel, g2somme, g2ab, g2jours, g2tableau],
  3: [g3diff, g3semaine, g3robot, g3signes, g3sommec],
  4: [g4sac, g4graphe, g4domino, g4pieces, g4diff, g4pas],
  5: [g5couleurs, g5signes, g5produit, g5diff, g5mains, g5pieces]
};
function valide(ex){
  if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return false;
  const n = ex.choix.map(norm);
  return new Set(n).size === 4 && n.filter(x => x === norm(ex.a)).length === 1;
}
function secours(){
  return {
    q: 'Soit a un entier pair et b un entier impair. Parmi les expressions a + b, a × b, 2b et a², laquelle est forcément impaire ?',
    a: 'a + b', accept: null, choix: ['a + b', 'a × b', '2b', 'a²'],
    expl: 'Remplace chaque lettre par sa parité : pair + impair = impair, donc a + b est impaire. Les trois autres contiennent un facteur pair, donc elles sont paires.'
  };
}

A.push({
  id: 'alb-19-parite-invariants',
  phase: 'albert',
  ordre: 19,
  theme: 'arithmetique',
  titre: 'Parité et invariants',
  objectif: "Utiliser la parité et les quantités qui ne changent jamais pour éliminer des réponses et trancher « possible ou impossible » sans long calcul.",
  lecon:
`<p class="lede">Certaines questions du test ont l'air de demander un énorme calcul ou une longue suite d'essais. En réalité, elles se règlent en quelques lignes si tu regardes <mark>la parité</mark> (pair ou impair) ou si tu trouves <mark>un invariant</mark>, c'est-à-dire une quantité qui ne change jamais.</p>
<h2>Ce que le test demande</h2>
<p>Les questions prennent plusieurs formes : quelle expression est forcément impaire ; peut-on partager des nombres en deux groupes de même somme ; quel jour tombe une date quand trois mardis du mois sont pairs ; que peut valoir le dernier nombre quand on efface et réécrit des nombres au tableau ; peut-on paver un damier troué avec des dominos ; combien de coups pour retourner des pièces. Aucune formule de cours n'est demandée : le test vérifie que tu regardes ce qui se conserve avant de calculer.</p>
<h2>Les règles de parité</h2>
<table class="tbl"><tr><th></th><th>pair et pair</th><th>pair et impair</th><th>impair et impair</th></tr>
<tr><td>somme ou différence</td><td>pair</td><td>impair</td><td>pair</td></tr>
<tr><td>produit</td><td>pair</td><td>pair</td><td>impair</td></tr></table>
<p>Conséquences utiles : une somme est impaire seulement si elle contient un nombre impair de termes impairs ; un produit est impair seulement si tous ses facteurs sont impairs ; a + b et a − b ont toujours la même parité, car ils diffèrent de 2b ; enfin 1 + 2 + … + n = n × (n + 1) ÷ 2.</p>
<div class="formule"><p>1 + 2 + … + n = n × (n + 1) ÷ 2</p></div>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je remplace les nombres par leur parité :</strong> je ne garde que « pair » ou « impair », et dans une somme je ne compte que les termes impairs.</p>
<p><strong>2. Je cherche ce qui ne change pas :</strong> la somme des nombres, la parité de cette somme, la couleur d'une case sur un damier, l'écart entre deux quantités.</p>
<p><strong>3. Je compare le départ et l'arrivée :</strong> si la quantité qui se conserve n'a pas la même valeur (ou la même parité) à l'arrivée, c'est impossible ; sinon, j'élimine les choix qui ne la respectent pas.</p>
<p><strong>4. Je teste deux ou trois étapes à la main</strong> pour vérifier que mon invariant est le bon, sans jamais conclure sur un seul exemple.</p>
</div>
<h2>Exemples résolus</h2>
<h3>1. Une expression forcément impaire</h3>
<p>a est pair et b est impair. Le produit a × b est pair (un facteur pair suffit), 2b est pair, a² = a × a est pair, mais a + b = pair + impair est impair. C'est donc a + b.</p>
<h3>2. Deux groupes de même somme</h3>
<p>Peut-on partager les entiers de 1 à 14 en deux groupes de même somme ? La somme totale vaut 14 × 15 ÷ 2 = 105, un nombre impair : impossible de la couper en deux moitiés entières. Avec les entiers de 1 à 15, on obtient 120, qui est pair : chaque groupe totalise 60, et c'est réalisable. Remarque : 14 est pair, et pourtant c'est impossible ; c'est la somme qui compte.</p>
<h3>3. Le tableau qui rétrécit</h3>
<p>On écrit les entiers de 1 à 9. À chaque étape, on efface deux nombres et on écrit leur différence (le plus grand moins le plus petit). Le dernier nombre peut-il valoir 0 ? Remplacer a et b par a − b enlève 2b au total, un nombre pair : la parité de la somme ne change jamais. Au départ la somme vaut 45, impaire, donc le dernier nombre est impair : il ne peut pas valoir 0. En plus, une différence ne dépasse jamais le plus grand nombre, donc le dernier nombre vaut au plus 9.</p>
<h3>4. Les jours de la semaine, au niveau du test</h3>
<p>Dans un mois de 30 jours, une chorale répète tous les jeudis, et exactement trois répétitions tombent à une date impaire. Quel jour de la semaine est le 20 ? Les jeudis sont espacés de 7 jours, un nombre impair : leurs dates alternent impair, pair, impair… Pour avoir trois dates impaires, il faut cinq jeudis, le premier à une date impaire : d, d + 7, d + 14, d + 21, d + 28, avec d + 28 ≤ 30, donc d ≤ 2, et d impair donne d = 1. Les jeudis sont les 1, 8, 15, 22 et 29. Le 22 est un jeudi, donc le 20 est un mardi.</p>
<h2>Les réflexes sans calculatrice</h2>
<ul>
<li>Pour la parité d'une somme, compte seulement les termes impairs.</li>
<li>Pour 1 + 2 + … + n, divise d'abord par 2 le facteur pair : 24 × 25 ÷ 2 = 12 × 25 = 300.</li>
<li>Nombres pairs de a à b : (dernier pair − premier pair) ÷ 2 + 1.</li>
<li>Un pas impair (7 jours, 3 jours) fait alterner pair et impair ; un pas pair garde la même parité.</li>
<li>Sur un quadrillage ou un damier, colorie comme un échiquier : chaque pas fait changer de couleur, chaque domino couvre une case de chaque couleur.</li>
<li>Pour un nombre minimal de coups, cherche d'abord une borne (au moins tant de coups), puis la parité du nombre de coups.</li>
<li>Amitiés, matchs, poignées de main : quand tu additionnes les liens de chaque personne, chaque lien est compté deux fois, donc cette somme est paire.</li>
<li>Opération étrange comme a + b + ab : ajoute 1 et factorise, a + b + ab + 1 = (a + 1)(b + 1), donc le produit des « nombre + 1 » se conserve.</li>
<li>Dans le QCM, élimine d'abord les choix qui n'ont pas la bonne parité, puis ceux qui sont trop grands.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Avant de calculer, cherche ce qui ne change jamais (la somme, sa parité, une couleur, un écart) et compare sa valeur au départ et à l'arrivée.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Conclure à partir d'un seul exemple. Croire qu'il suffit que n soit pair pour partager 1, 2, …, n en deux groupes égaux : c'est la somme qui doit être paire. Oublier qu'un produit avec un facteur pair est pair, ou que a + b et a − b ont la même parité. Oublier le « + 1 » quand tu comptes de 2 en 2. Compter n étapes au lieu de n − 1 quand on passe de n nombres à un seul. Répondre 1/2 quand un invariant décide de tout.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Pair + pair = impair + impair = pair ; pair + impair = impair ; un produit est impair seulement si tous ses facteurs sont impairs. Un invariant est une quantité qui ne change pas : si sa valeur à l'arrivée diffère de sa valeur au départ, l'arrivée est impossible.</p></div>`,
  gen(level, R){
    const n = niv(level);
    const liste = TYPES[n];
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
