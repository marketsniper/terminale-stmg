/* ===== Maths · Objectif Albert School : alb-23 · Optimisation : plus grand ou plus petit possible =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS.
   Toutes les réponses sont CALCULÉES par le code (aucune banque d'énoncés fixes).
   Sous-types par niveau :
     N1 : deux entiers de somme fixée (produit maximal), rectangle de périmètre donné (aire maximale),
          chiffres à placer (plus petit avec un 0, plus grand pair, plus petit impair, plus grand multiple de 5),
          dés de somme donnée (plus petite ou plus grande valeur d'un dé), notes plafonnées (plus basse note possible).
     N2 : nombre minimal ou maximal de 6 parmi n dés, rectangle d'aire donnée (périmètre minimal),
          k entiers (différents ou non) de somme fixée (plus grand possible), achats (au moins un de chaque, lots),
          deux nombres de deux chiffres (somme maximale ou minimale, différence maximale),
          plus petit entier de somme des chiffres donnée.
     N3 : plus grand total impossible avec deux pièces (petites valeurs, listage), enclos contre un mur,
          trois entiers de somme fixée (produit ou volume maximal), notes toutes différentes (plus basse possible,
          plus haute possible pour la plus basse), pièces de trois sortes avec au moins une de chaque,
          formats à acheter pour couvrir un besoin au coût minimal.
     N4 : plus grand total impossible (valeurs moyennes) et nombre de totaux impossibles, produit maximal d'un
          découpage libre, k entiers différents (plus petit maximum, plus grand minimum), crêpes ou steaks
          à cuire (temps minimal), formats à acheter (plus de cas), plus petit entier à chiffres tous différents
          de somme donnée, produit maximal de dés de somme donnée.
     N5 : plus petite différence entre deux nombres de trois chiffres formés avec six chiffres, traversée d'un
          pont avec une lampe, plus grand entier à chiffres tous différents de somme donnée, produit maximal
          avec des termes tous différents, produit maximal d'un grand découpage, deux pièces de grandes valeurs.
   Vérification indépendante : verifs/alb-23-optimisation-verif.js (relit l'énoncé, force brute). */
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
const prod = l => l.reduce((s, x) => s * x, 1);
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const et = l => (l.length < 2 ? String(l[0]) : l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1]);
const MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fois = l => l.map(x => nb(x)).join(' × ');
const plus = l => l.map(x => nb(x)).join(' + ');
const asc = l => l.slice().sort((x, y) => x - y);
const eur = x => { const r = Math.round(x * 100) / 100; return (Number.isInteger(r) ? nb(r) : nb(r, 2).replace(/,(\d)$/, (m, c) => ',' + c + '0')) + ' €'; };
const pl = (n, sg, p) => (n > 1 ? p : sg);
/* Voisins de secours : a + pas, a − pas, a + 2 pas… (jamais sous le minimum). */
const vois = (a, pas, min, fmt) => k => { const v = a + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * pas; return v >= min ? fmt(v) : null; };
/* Choix et texte des pièges : on ne commente que les distracteurs effectivement retenus, jamais la bonne réponse. */
function fin(a, l, o){
  o = o || {};
  const fmt = o.fmt || nb, min = o.min == null ? 1 : o.min, pas = o.pas || 1;
  const ok = l.filter(x => x && x[0] != null && isFinite(x[0]) && x[0] >= min && norm(fmt(x[0])) !== norm(fmt(a)));
  const choix = qcm(fmt(a), ok.map(x => fmt(x[0])), vois(a, pas, min, fmt));
  const dans = new Set(choix.map(norm)), vus = new Set([norm(fmt(a))]), t = [];
  ok.forEach(([v, s]) => { const z = norm(fmt(v)); if (dans.has(z) && !vus.has(z)){ vus.add(z); if (s) t.push(s); } });
  return {choix, piege: t.length ? 'Piège : ' + t.join(' ; ') + '.' : ''};
}
const sortie = (q, a, f, expl, fmt) => ({q, a: (fmt || nb)(a), accept: null, choix: f.choix, expl: (expl + ' ' + f.piege).trim()});

/* =====================================================================
   NIVEAU 1
   ===================================================================== */

/* 1A · deux entiers de somme fixée : produit maximal */
function g1somme(R){
  const S = R.int(9, 27), h = Math.floor(S / 2), H = S - h, a = h * H, c = R.int(0, 2);
  const q = c === 0 ? 'Deux entiers strictement positifs ont pour somme ' + S + '. Quel est le plus grand produit possible de ces deux entiers ?'
    : c === 1 ? 'On partage ' + S + ' billes en deux tas non vides, puis on multiplie le nombre de billes du premier tas par le nombre de billes du second. Quel est le plus grand résultat possible ?'
    : 'Le nombre x est un entier compris entre 1 et ' + (S - 1) + '. Quelle est la plus grande valeur possible de x × (' + S + ' − x) ?';
  const essais = [[1, S - 1]];
  if (h - 3 >= 2) essais.push([h - 3, H + 3]);
  essais.push([h - 1, H + 1], [h, H]);
  const l = [];
  if (S % 2) l.push([S * S / 4, nb(S * S / 4) + ' vient de ' + nb(S / 2) + ' × ' + nb(S / 2) + ', mais ' + nb(S / 2) + " n'est pas un entier"]);
  l.push([S - 1, (S - 1) + ' vient de 1 × ' + (S - 1) + ' : les deux nombres les plus éloignés donnent au contraire le plus petit produit']);
  l.push([(h - 1) * (H + 1), ((h - 1) * (H + 1)) + ' vient de ' + (h - 1) + ' × ' + (H + 1) + ', mais on peut prendre des nombres encore plus proches']);
  const f = fin(a, l);
  return sortie(q, a, f,
    'Pour une somme fixée, le produit de deux nombres est le plus grand quand ces deux nombres sont le plus proches possible. '
    + (c === 2 ? 'Les deux facteurs x et ' + S + ' − x ont toujours pour somme ' + S + '. ' : '')
    + 'Quelques essais : ' + essais.map(p => p[0] + ' × ' + p[1] + ' = ' + p[0] * p[1]).join(' ; ') + '. '
    + (S % 2 === 0
      ? S + ' est pair : on prend deux nombres égaux, ' + h + ' et ' + h + ', et le produit vaut ' + h + ' × ' + h + ' = ' + a + '.'
      : S + ' est impair : deux entiers de somme ' + S + ' ne peuvent pas être égaux ; les plus proches sont ' + h + ' et ' + H + ', et le produit vaut ' + h + ' × ' + H + ' = ' + a + '.'));
}

/* 1B · rectangle à côtés entiers de périmètre donné : aire maximale */
function g1rect(R){
  const half = R.int(6, 25), P = 2 * half, h = Math.floor(half / 2), H = half - h, a = h * H, c = R.int(0, 2);
  const U = c === 0 ? 'cm' : 'm';
  const q = c === 0 ? 'Un rectangle a un périmètre de ' + P + ' cm, et ses côtés mesurent un nombre entier de centimètres. Quelle est sa plus grande aire possible, en cm² ?'
    : c === 1 ? 'Avec une corde de ' + P + " m, on délimite au sol un enclos rectangulaire dont les côtés mesurent un nombre entier de mètres. Toute la corde est utilisée. Quelle est la plus grande aire possible de l'enclos, en m² ?"
    : 'Un jardinier entoure un massif rectangulaire avec exactement ' + P + ' m de bordure. Les côtés du massif mesurent un nombre entier de mètres. Quelle est la plus grande aire possible du massif, en m² ?';
  const l = [];
  if (half % 2) l.push([P * P / 16, nb(P * P / 16) + ' suppose un carré de côté ' + nb(P / 4) + ' ' + U + ", qui n'est pas un nombre entier"]);
  l.push([half * half, nb(half * half) + ' oublie que longueur + largeur ne vaut que la moitié du périmètre']);
  l.push([half - 1, (half - 1) + ' correspond au rectangle 1 × ' + (half - 1) + ' : très allongé, il a au contraire la plus petite aire']);
  l.push([(h - 1) * (H + 1), ((h - 1) * (H + 1)) + ' correspond à ' + (h - 1) + ' × ' + (H + 1) + ' : les côtés ne sont pas les plus proches possible']);
  const f = fin(a, l);
  return sortie(q, a, f,
    "Le périmètre fixe la somme longueur + largeur ; à somme fixée, l'aire (le produit) est la plus grande quand les deux côtés sont le plus proches possible. "
    + 'Longueur + largeur = ' + P + ' ÷ 2 = ' + half + '. '
    + (half % 2 === 0
      ? 'On peut prendre un carré de côté ' + h + ' ' + U + ' : aire ' + h + ' × ' + h + ' = ' + a + ' ' + U + '². Par comparaison, ' + (h - 1) + ' × ' + (H + 1) + ' = ' + ((h - 1) * (H + 1)) + '.'
      : half + " est impair : il n'y a pas de carré à côtés entiers. Les côtés les plus proches sont " + h + ' et ' + H + ' ' + U + ", d'où une aire de " + h + ' × ' + H + ' = ' + a + ' ' + U + '².'));
}

/* 1C · placer des chiffres : plus petit (avec un 0), plus grand pair, plus petit impair, plus grand multiple de 5 */
function g1chiffres(R){
  const mode = R.pick(['petit0', 'pair', 'impair', 'mult5']);
  let d = null;
  for (let t = 0; t < 300 && !d; t++){
    let c;
    if (mode === 'petit0') c = [0].concat(R.shuffle(range(1, 9)).slice(0, 3));
    else if (mode === 'mult5') c = [5].concat(R.shuffle([1, 2, 3, 4, 6, 7, 8, 9]).slice(0, 3));
    else c = R.shuffle(range(mode === 'pair' ? 1 : 0, 9)).slice(0, 4);
    const mn = Math.min(...c), mx = Math.max(...c);
    if (mode === 'pair' && !(mn % 2 === 1 && c.some(x => x % 2 === 0))) continue;
    if (mode === 'impair' && !(mx % 2 === 0 && c.some(x => x % 2 === 1))) continue;
    if (mode === 'mult5' && !(mn < 5)) continue;
    d = c;
  }
  if (!d){ d = [0, 3, 5, 8]; }
  const up = asc(d), down = up.slice().reverse();
  const num = l => Number(l.join(''));
  const petitDevant = l => { const s = asc(l), i = s.findIndex(x => x > 0); return [s[i]].concat(s.filter((x, j) => j !== i)); };
  let a, l, expl, quoi;
  if (mode === 'petit0' || !d.length){
    quoi = 'le plus petit nombre possible';
    const best = petitDevant(up); a = num(best);
    l = [[num(up), nb(num(up)) + ' correspond à « ' + up.join('') + " » : un nombre qui commence par 0 n'a que trois chiffres"],
      [num(down), nb(num(down)) + ' est le plus grand nombre, pas le plus petit'],
      [num([best[0]].concat(best.slice(1).sort((x, y) => y - x))), nb(num([best[0]].concat(best.slice(1).sort((x, y) => y - x)))) + ' commence bien par ' + best[0] + ", mais ne range pas les chiffres suivants dans l'ordre croissant"],
      [num([up[2], 0, up[1], up[3]]), nb(num([up[2], 0, up[1], up[3]])) + ' ne commence pas par le plus petit chiffre non nul']];
    expl = 'Pour écrire le plus petit nombre, on range les chiffres du plus petit au plus grand, mais un nombre de quatre chiffres ne peut pas commencer par 0. '
      + 'On commence donc par le plus petit chiffre non nul, ' + best[0] + ", puis on écrit les autres dans l'ordre croissant, 0 en premier : " + nb(a) + '.';
  } else if (mode === 'pair'){
    quoi = 'le plus grand nombre pair possible';
    const ev = up.filter(x => x % 2 === 0), e = ev[0], E = ev[ev.length - 1];
    const best = down.filter(x => x !== e).concat([e]); a = num(best);
    const altE = down.filter(x => x !== E).concat([E]);
    l = [[num(down), nb(num(down)) + ' est le plus grand nombre, mais il finit par ' + down[3] + ' : il est impair'],
      ev.length > 1 ? [num(altE), nb(num(altE)) + ' garde ' + E + " pour les unités, alors qu'il vaut mieux placer ce chiffre devant et finir par " + e] : null,
      [num([best[1], best[0], best[2], best[3]]), nb(num([best[1], best[0], best[2], best[3]])) + ' ne range pas les premiers chiffres du plus grand au plus petit'],
      [num(petitDevant(up.filter(x => x !== e)).concat([e])), nb(num(petitDevant(up.filter(x => x !== e)).concat([e]))) + ' est le plus petit nombre pair, pas le plus grand']];
    expl = 'Un nombre pair finit par un chiffre pair ; devant, on place les autres chiffres du plus grand au plus petit. '
      + (ev.length > 1 ? 'Les chiffres pairs disponibles sont ' + et(ev) + ' : on garde le plus petit, ' + e + ', pour les unités, afin de laisser les plus grands chiffres devant. '
        : 'Le seul chiffre pair est ' + e + ' : il va aux unités. ')
      + 'On obtient ' + nb(a) + '.';
  } else if (mode === 'impair'){
    quoi = 'le plus petit nombre impair possible';
    const od = up.filter(x => x % 2 === 1), o = od[od.length - 1], o1 = od[0];
    const best = petitDevant(up.filter(x => x !== o)).concat([o]); a = num(best);
    const alt1 = petitDevant(up.filter(x => x !== o1)).concat([o1]);
    const pp = petitDevant(up);
    const mil = [best[0], best[2], best[1], best[3]];
    const gr = down.filter(x => x !== o1).concat([o1]);
    l = [[num(pp), nb(num(pp)) + ' est le plus petit nombre, mais il finit par ' + pp[3] + ' : il est pair'],
      od.length > 1 ? [num(alt1), nb(num(alt1)) + ' garde ' + o1 + " pour les unités, alors qu'il vaut mieux placer ce chiffre devant et finir par " + o] : null,
      [num(mil), nb(num(mil)) + " ne range pas les chiffres du milieu dans l'ordre croissant"],
      [num(gr), nb(num(gr)) + ' est le plus grand nombre impair, pas le plus petit']];
    expl = 'Un nombre impair finit par un chiffre impair ; devant, on place les autres chiffres du plus petit au plus grand, sans commencer par 0. '
      + (od.length > 1 ? 'Les chiffres impairs disponibles sont ' + et(od) + ' : on garde le plus grand, ' + o + ', pour les unités, afin de laisser les plus petits chiffres devant. '
        : 'Le seul chiffre impair est ' + o + ' : il va aux unités. ')
      + 'On obtient ' + nb(a) + '.';
  } else {
    quoi = 'le plus grand multiple de 5 possible';
    const best = down.filter(x => x !== 5).concat([5]); a = num(best);
    const sw = [best[1], best[0], best[2], 5], pt = up.filter(x => x !== 5).concat([5]);
    l = [[num(down), nb(num(down)) + ' est le plus grand nombre, mais il ne finit ni par 0 ni par 5'],
      [num(sw), nb(num(sw)) + ' ne range pas les premiers chiffres du plus grand au plus petit'],
      [num(pt), nb(num(pt)) + ' est le plus petit multiple de 5, pas le plus grand']];
    expl = "Un multiple de 5 finit par 0 ou par 5 ; ici il n'y a pas de 0, donc le nombre finit par 5. "
      + 'Devant, on range les trois autres chiffres du plus grand au plus petit : ' + nb(a) + '.';
  }
  const f = fin(a, l, {pas: 9});
  return sortie('Avec les chiffres ' + et(R.shuffle(d)) + ', utilisés chacun une seule fois, on écrit un nombre de quatre chiffres. Quel est ' + quoi + ' ?', a, f, expl);
}

/* 1D · dés de somme donnée : plus petite ou plus grande valeur d'un dé */
function g1des(R){
  const n = R.pick([2, 3, 3, 4]), mode = R.pick(['min', 'max']);
  let S, a, l, expl;
  if (mode === 'min'){
    S = R.int(6 * (n - 1) + 2, 6 * n - 1); a = S - 6 * (n - 1);
    const ex = range(1, n - 1).map(() => 6).concat([a]);
    l = [[1, "1 oublie que les autres dés ne dépassent pas 6"],
      [Math.floor(S / n), Math.floor(S / n) + " est à peu près la valeur moyenne d'un dé, pas la plus petite"],
      n >= 3 && S - 6 <= 6 ? [S - 6, (S - 6) + " ne met qu'un seul autre dé à 6 et oublie l'autre"] : null,
      [a + 1, '']];
    expl = "Pour qu'un dé affiche la plus petite valeur possible, " + (n === 2 ? "l'autre doit afficher" : 'les autres doivent afficher') + " la plus grande, c'est-à-dire 6. "
      + (n === 2 ? "L'autre dé fait au plus 6 ; " : 'Les ' + MOTS[n - 1] + ' autres dés font au plus ' + (n - 1) + ' × 6 = ' + 6 * (n - 1) + ' ; ')
      + 'ce dé vaut donc au moins ' + S + ' − ' + 6 * (n - 1) + ' = ' + a + ". C'est possible : " + plus(ex) + ' = ' + S + '.';
  } else {
    S = R.int(n + 1, n + 4); a = S - (n - 1);
    const ex = range(1, n - 1).map(() => 1).concat([a]);
    l = [[6, '6 est impossible : avec un 6, la somme dépasserait déjà ' + S],
      [Math.ceil(S / n), Math.ceil(S / n) + " est à peu près la valeur moyenne d'un dé, pas la plus grande"],
      [a - 1, ''],
      n >= 3 ? [S - 1, (S - 1) + " ne laisse qu'un point pour les autres dés, alors que chacun vaut au moins 1"] : null];
    expl = "Pour qu'un dé affiche la plus grande valeur possible, " + (n === 2 ? "l'autre doit afficher" : 'les autres doivent afficher') + " la plus petite, c'est-à-dire 1. "
      + (n === 2 ? "L'autre dé fait au moins 1 ; " : 'Les ' + MOTS[n - 1] + ' autres dés font au moins ' + (n - 1) + ' ; ')
      + 'ce dé vaut donc au plus ' + S + ' − ' + (n - 1) + ' = ' + a + ". C'est possible : " + plus(ex) + ' = ' + S + '.';
  }
  const f = fin(a, l);
  return sortie('On lance ' + MOTS[n] + ' dés à six faces, numérotées de 1 à 6. La somme des ' + MOTS[n] + ' résultats vaut ' + S + '. Quelle est la ' + (mode === 'min' ? 'plus petite' : 'plus grande') + " valeur que peut afficher l'un des dés ?", a, f, expl);
}

/* 1E · notes plafonnées : plus basse note possible */
function g1notes(R){
  const c = R.int(0, 1), V = c === 0 ? 20 : 10, k = R.pick([3, 4, 5]);
  const ms = range(1, V).filter(m => { const x = k * m - V * (k - 1); return x >= 1 && x <= V - 2; });
  const m = R.pick(ms), T = k * m, a = T - V * (k - 1);
  const q = c === 0
    ? 'Lina a eu ' + k + ' notes en maths ce trimestre, toutes entières et comprises entre 0 et 20. Sa moyenne est exactement ' + m + ". Quelle est la plus petite note qu'elle a pu avoir ?"
    : 'Un jeu se joue en ' + k + ' manches ; à chaque manche, on marque un nombre entier de points entre 0 et 10. Sami termine avec une moyenne de ' + m + " points par manche. Quel est le plus petit score qu'il a pu faire sur une manche ?";
  const l = [[m, m + ' est la moyenne : il faudrait que ' + (c === 0 ? 'toutes les notes soient égales' : 'tous les scores soient égaux')],
    [0, '0 oublie que les autres ' + (c === 0 ? 'notes' : 'scores') + ' ne peuvent pas dépasser ' + V],
    2 * m - V >= 0 ? [2 * m - V, (2 * m - V) + " ne compense qu'avec un seul " + (c === 0 ? '20' : '10') + ', alors que tous les autres peuvent valoir ' + V] : null,
    T - V <= V ? [T - V, (T - V) + " ne retire qu'une seule fois le maximum"] : null,
    [a + 1, '']];
  const f = fin(a, l, {min: 0});
  const ex = range(1, k - 1).map(() => V).concat([a]);
  const fem = c === 0;
  return sortie(q, a, f,
    (fem ? "Pour qu'une note soit la plus basse possible, toutes les autres doivent être les plus hautes possible. " : "Pour qu'un score soit le plus bas possible, tous les autres doivent être les plus hauts possible. ")
    + 'Le total vaut ' + k + ' × ' + m + ' = ' + T + '. Les ' + MOTS[k - 1] + ' autres valent au plus ' + V + ' ' + (fem ? 'chacune' : 'chacun') + ', soit ' + (k - 1) + ' × ' + V + ' = ' + V * (k - 1) + '. '
    + (fem ? 'La plus basse' : 'Le plus bas') + ' vaut donc au moins ' + T + ' − ' + V * (k - 1) + ' = ' + a + ". C'est possible : " + ex.join(', ') + ' ont pour somme ' + T + ', donc pour moyenne ' + m + '.');
}

/* =====================================================================
   NIVEAU 2
   ===================================================================== */

/* 2A · n dés de somme donnée : nombre minimal ou maximal de 6 */
function g2des6(R){
  const n = R.pick([3, 4, 5]), mode = R.pick(['min', 'max']);
  let S, a, l, expl;
  if (mode === 'min'){
    S = R.int(5 * n + 1, 6 * n - 1); a = S - 5 * n;
    const ex = range(1, a).map(() => 6).concat(range(1, n - a).map(() => 5));
    l = [[0, '0 est impossible : sans aucun 6, ' + MOTS[n] + ' dés font au plus ' + n + ' × 5 = ' + 5 * n],
      [Math.floor(S / 6), Math.floor(S / 6) + ' est le plus grand nombre de 6 possible, pas le plus petit'],
      [a + 1, ''], [n, '']];
    expl = 'Pour utiliser le moins de 6 possible, on donne aux autres dés la plus grande valeur permise après 6, c\'est-à-dire 5. '
      + 'Sans aucun 6, la somme vaut au plus ' + n + ' × 5 = ' + 5 * n + ', soit ' + a + ' de moins que ' + S + '. '
      + 'Remplacer un 5 par un 6 ajoute 1 : il faut au moins ' + a + ' ' + pl(a, 'dé', 'dés') + ' à 6. Exemple : ' + plus(ex) + ' = ' + S + '.';
    const f = fin(a, l, {min: 0});
    return sortie('On lance ' + MOTS[n] + ' dés à six faces, numérotées de 1 à 6, et la somme des résultats vaut ' + S + '. Combien de dés, au minimum, affichent un 6 ?', a, f, expl);
  }
  const kmax = s => { for (let k = n; k >= 0; k--){ const r = s - 6 * k, m = n - k; if (m === 0 ? r === 0 : (r >= m && r <= 5 * m)) return k; } return -1; };
  const Ss = range(n + 5, 6 * n - 2).filter(s => { const k = kmax(s); return k >= 1 && k <= n - 1; });
  S = R.pick(Ss); a = kmax(S);
  const ex = range(1, a).map(() => 6); let rest = S - 6 * a;
  for (let i = 0; i < n - a; i++){ const left = n - a - i - 1, v = Math.min(5, rest - left); ex.push(v); rest -= v; }
  l = [[Math.floor(S / 6), Math.floor(S / 6) + ' oublie que chacun des autres dés vaut au moins 1'],
    [n, n + ' est impossible : ' + MOTS[n] + ' six feraient ' + 6 * n],
    [a + 1, ''], [a - 1, '']];
  const k1 = a + 1, reste = n - k1;
  expl = 'Pour avoir le plus de 6 possible, les autres dés doivent afficher les plus petites valeurs possible. '
    + 'Chaque autre dé vaut au moins 1. Avec ' + k1 + ' dés à 6, on aurait déjà ' + 6 * k1 + (reste > 0 ? ', plus au moins ' + reste + ' pour ' + (reste > 1 ? 'les ' + MOTS[reste] + ' autres dés' : "l'autre dé") + ', soit ' + (6 * k1 + reste) : '') + ', ce qui dépasse ' + S + '. '
    + 'Avec ' + a + ' ' + pl(a, 'dé', 'dés') + ' à 6, il reste ' + (S - 6 * a) + ' pour ' + (n - a) + ' ' + pl(n - a, 'dé', 'dés') + ' : par exemple ' + plus(ex) + ' = ' + S + '.';
  const f = fin(a, l, {min: 0});
  return sortie('On lance ' + MOTS[n] + ' dés à six faces, numérotées de 1 à 6, et la somme des résultats vaut ' + S + '. Combien de dés, au maximum, affichent un 6 ?', a, f, expl);
}

/* 2B · rectangle d'aire donnée à côtés entiers : périmètre minimal */
const AIRES = [12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 70, 72, 80, 84, 90, 96, 100];
function g2rectAire(R){
  const Ar = R.pick(AIRES), c = R.int(0, 2), U = c === 1 ? 'm' : 'cm';
  const paires = range(1, Math.floor(Math.sqrt(Ar))).filter(d => Ar % d === 0).map(d => [d, Ar / d]);
  const best = paires[paires.length - 1], a = 2 * (best[0] + best[1]), sec = paires.length >= 2 ? paires[paires.length - 2] : null;
  const q = c === 0 ? 'Un rectangle a une aire de ' + Ar + ' cm², et ses côtés mesurent un nombre entier de centimètres. Quel est son plus petit périmètre possible, en cm ?'
    : c === 1 ? 'Un potager rectangulaire de ' + Ar + " m² a des côtés qui mesurent un nombre entier de mètres. On veut l'entourer d'une clôture. Quelle est la longueur minimale de clôture nécessaire, en mètres ?"
    : 'Avec ' + Ar + ' carreaux carrés de 1 cm de côté, on forme un rectangle plein, sans trou ni chevauchement. Quel est le plus petit périmètre possible de ce rectangle, en cm ?';
  const l = [[2 * (1 + Ar), nb(2 * (1 + Ar)) + ' correspond au rectangle 1 × ' + Ar + ' : c\'est au contraire le plus grand périmètre'],
    [best[0] + best[1], (best[0] + best[1]) + " oublie de doubler : c'est le demi-périmètre"],
    sec ? [2 * (sec[0] + sec[1]), 2 * (sec[0] + sec[1]) + ' correspond au rectangle ' + sec[0] + ' × ' + sec[1] + ", dont les côtés ne sont pas les plus proches"] : null];
  const f = fin(a, l, {pas: 2});
  return sortie(q, a, f,
    'À aire fixée, le périmètre est le plus petit quand le rectangle est le plus proche possible d\'un carré : on cherche deux diviseurs de l\'aire les plus proches l\'un de l\'autre. '
    + 'Rectangles possibles : ' + paires.map(p => p[0] + ' × ' + p[1]).join(', ') + '. '
    + (best[0] === best[1] ? 'Le carré ' + best[0] + ' × ' + best[1] + ' est possible' : 'Les côtés les plus proches sont ' + best[0] + ' et ' + best[1])
    + ", d'où un périmètre de 2 × (" + best[0] + ' + ' + best[1] + ') = ' + a + ' ' + U + '.');
}

/* 2C · k entiers de somme fixée (tous différents ou non) : plus grande valeur possible du plus grand */
function g2distinct(R){
  const k = R.pick([3, 4, 5, 6]), dist = R.int(0, 2) > 0, c = R.int(0, 2);
  const T0 = k * (k + 1) / 2, K2 = k * (k - 1) / 2, S = R.int(T0 + 4, Math.max(T0 + 25, 40));
  const a = dist ? S - K2 : S - (k - 1);
  let q;
  if (c === 0) q = cap(MOTS[k]) + ' entiers strictement positifs' + (dist ? ', tous différents,' : ' (pas forcément différents)') + ' ont pour somme ' + S + '. Quelle est la plus grande valeur possible du plus grand de ces entiers ?';
  else if (c === 1) q = 'On distribue ' + S + ' bonbons à ' + MOTS[k] + ' enfants ; chacun en reçoit au moins un' + (dist ? ', et deux enfants ne reçoivent jamais le même nombre de bonbons' : '') + ". Combien de bonbons, au maximum, peut recevoir l'enfant le mieux servi ?";
  else q = 'Les ' + MOTS[k] + " joueurs d'une équipe ont marqué " + S + ' points à eux tous ; chacun a marqué au moins un point' + (dist ? ', et deux joueurs n\'ont jamais marqué le même nombre de points' : '') + ". Combien de points, au maximum, a pu marquer le meilleur marqueur de l'équipe ?";
  let l, expl;
  if (dist){
    const petits = range(1, k - 1);
    l = [[S - (k - 1), (S - (k - 1)) + ' oublie que les nombres doivent être tous différents'],
      [S - T0, (S - T0) + ' retire 1 + 2 + … + ' + k + ' : un nombre de trop, le plus grand ne fait pas partie des petits'],
      [Math.floor(S / k), Math.floor(S / k) + " correspond à un partage presque égal, l'inverse de ce qu'on cherche"],
      [a - 1, '']];
    expl = 'Pour que le plus grand soit le plus grand possible, tous les autres doivent être les plus petits possible. '
      + 'Les ' + MOTS[k - 1] + ' autres, tous différents et au moins égaux à 1, valent au minimum ' + plus(petits) + ' = ' + K2 + '. '
      + 'Le plus grand vaut donc au plus ' + S + ' − ' + K2 + ' = ' + a + ", et c'est atteint : " + plus(petits.concat([a])) + ' = ' + S + '.';
  } else {
    const uns = range(1, k - 1).map(() => 1);
    l = [[S - K2, (S - K2) + " impose des nombres tous différents, ce que l'énoncé ne demande pas"],
      [S - k, (S - k) + ' retire un 1 de trop'],
      [Math.floor(S / k), Math.floor(S / k) + " correspond à un partage presque égal, l'inverse de ce qu'on cherche"],
      [S, S + ' oublie que chacun des autres vaut au moins 1']];
    expl = 'Pour que le plus grand soit le plus grand possible, tous les autres doivent être les plus petits possible. '
      + 'Les ' + MOTS[k - 1] + ' autres valent au moins 1 chacun, soit ' + (k - 1) + ' au total. '
      + 'Le plus grand vaut donc au plus ' + S + ' − ' + (k - 1) + ' = ' + a + ", et c'est atteint : " + plus(uns.concat([a])) + ' = ' + S + '.';
  }
  const f = fin(a, l);
  return sortie(q, a, f, expl);
}

/* 2D · achats : au moins un article de chaque sorte, ou prix à l'unité et lots */
const ACH2 = [
  {intro: (p1, p2) => 'Dans une papeterie, un cahier coûte ' + eur(p1) + ' et un classeur ' + eur(p2) + '.', qui: 'Lucas', veut: 'au moins un cahier et au moins un classeur', q: "Combien d'articles peut-il acheter au maximum ?", s1: 'cahier', p1: 'cahiers', s2: 'classeur', art: 'articles', chers: "d'articles chers"},
  {intro: (p1, p2) => 'Une boulangerie vend les croissants ' + eur(p1) + ' pièce et les sandwichs ' + eur(p2) + ' pièce.', qui: 'Nora', veut: 'au moins un croissant et au moins un sandwich', q: "Combien d'articles peut-elle acheter au maximum ?", s1: 'croissant', p1: 'croissants', s2: 'sandwich', art: 'articles', chers: "d'articles chers"},
  {intro: (p1, p2) => 'À la fête foraine, un tour de manège coûte ' + eur(p1) + ' et un tour de grande roue ' + eur(p2) + '.', qui: 'Yanis', veut: 'faire au moins un tour de manège et au moins un tour de grande roue', q: 'Combien de tours peut-il faire au maximum ?', s1: 'tour de manège', p1: 'tours de manège', s2: 'tour de grande roue', art: 'tours', chers: 'de tours chers'}
];
const LOT2 = [
  {txt: (u, L, m, B) => 'Un ticket de bus coûte ' + eur(u) + " à l'unité, ou " + eur(L) + ' le carnet de ' + m + ' tickets. Avec ' + eur(B) + ', combien de tickets peut-on avoir au maximum ?', o: 'tickets', lot: 'carnet', lots: 'carnets'},
  {txt: (u, L, m, B) => 'Une pâtisserie vend les macarons ' + eur(u) + ' pièce, ou ' + eur(L) + ' la boîte de ' + m + '. Avec ' + eur(B) + ', combien de macarons peut-on acheter au maximum ?', o: 'macarons', lot: 'boîte', lots: 'boîtes'},
  {txt: (u, L, m, B) => 'Au stand de tir, une partie coûte ' + eur(u) + ', ou ' + eur(L) + ' le lot de ' + m + ' parties. Avec ' + eur(B) + ', combien de parties peut-on jouer au maximum ?', o: 'parties', lot: 'lot', lots: 'lots'}
];
function g2achat(R){
  if (R.int(0, 1) === 0){
    const C = R.pick(ACH2), p1 = R.int(1, 4), p2 = R.int(p1 + 2, p1 + 6), B = R.int(p1 + p2 + 3 * p1, 40);
    const n1 = Math.floor((B - p2) / p1), a = 1 + n1, reste = B - p2 - n1 * p1;
    const l = [[Math.floor(B / p1), Math.floor(B / p1) + " oublie qu'il faut au moins un " + C.s2],
      [2 * Math.floor(B / (p1 + p2)), 2 * Math.floor(B / (p1 + p2)) + ' achète par paires (un ' + C.s1 + ' et un ' + C.s2 + ') : on paie trop ' + C.chers],
      [a - 1, ''], [a + 1, '']];
    const f = fin(a, l);
    return sortie(C.intro(p1, p2) + ' ' + C.qui + ' dispose de ' + eur(B) + ' et veut ' + C.veut + '. ' + C.q, a, f,
      'Pour avoir le plus ' + (C.art === 'tours' ? 'de tours' : "d'articles") + ' possible, on prend le moins possible ' + C.chers + ' : un seul ' + C.s2 + ", puisqu'il en faut au moins un. "
      + 'Après ce ' + C.s2 + ' (' + eur(p2) + '), il reste ' + eur(B - p2) + ', de quoi payer ' + n1 + ' ' + pl(n1, C.s1, C.p1) + ' (' + eur(n1 * p1) + ')'
      + (reste ? ", et il reste " + eur(reste) + ', pas assez pour un ' + C.s1 + ' de plus' : '') + '. Total : ' + n1 + ' + 1 = ' + a + ' ' + C.art + '.');
  }
  const C = R.pick(LOT2), u = R.int(1, 4), m = R.pick([3, 4, 5, 6, 10]);
  const L = m * u - R.int(1, Math.max(1, Math.floor(m * u / 3))), B = R.int(L + u, Math.min(60, 5 * L));
  let a = 0; for (let x = 0; x * L <= B; x++) a = Math.max(a, m * x + Math.floor((B - L * x) / u));
  const x = Math.floor(B / L), r = B - L * x, a2 = m * x + Math.floor(r / u);
  if (a2 !== a) return null;
  const alt = x >= 1 ? m * (x - 1) + Math.floor((r + L) / u) : null;
  const l = [[Math.floor(B / u), Math.floor(B / u) + " n'achète qu'à l'unité"],
    Math.floor(r / u) > 0 ? [m * x, m * x + " n'achète que des " + C.lots + ' et oublie de dépenser les ' + eur(r) + ' restants'] : null,
    [a - 1, ''], [a + 1, '']];
  const f = fin(a, l);
  return sortie(C.txt(u, L, m, B), a, f,
    "Le " + C.lot + " revient moins cher par article : on achète d'abord le plus de " + C.lots + " possible, puis on complète à l'unité avec la monnaie restante. "
    + x + ' ' + pl(x, C.lot, C.lots) + ' coûtent ' + eur(L * x) + ' et donnent ' + m * x + ' ' + C.o + ' ; il reste ' + eur(r) + ', soit ' + Math.floor(r / u) + " à l'unité. Total : " + a + '. '
    + (alt != null ? 'Avec un ' + C.lot + ' de moins, on aurait ' + m * (x - 1) + ' + ' + Math.floor((r + L) / u) + ' = ' + alt + (alt === a ? ', autant mais pas plus.' : ', moins bien.') : ''));
}

/* 2E · deux nombres de deux chiffres : somme maximale ou minimale, différence maximale */
function g2chiffres2(R){
  const d = R.shuffle(range(1, 9)).slice(0, 4), s = d.slice().sort((x, y) => y - x), [d1, d2, d3, d4] = s, mode = R.pick(['max', 'min', 'diff']);
  let a, l, expl, quoi;
  if (mode === 'max'){
    quoi = 'la plus grande somme possible de ces deux nombres';
    a = 10 * (d1 + d2) + d3 + d4;
    l = [[(10 * d1 + d2) + (10 * d3 + d4), ((10 * d1 + d2) + (10 * d3 + d4)) + ' rend le premier nombre le plus grand possible (' + d1 + d2 + '), mais gaspille ' + d2 + ' aux unités'],
      [10 * (d1 + d3) + d2 + d4, (10 * (d1 + d3) + d2 + d4) + ' place ' + d3 + ' aux dizaines au lieu de ' + d2]];
    expl = "Un chiffre des dizaines compte dix fois plus qu'un chiffre des unités : pour une grande somme, on place les deux plus grands chiffres aux dizaines. "
      + 'Dizaines : ' + d1 + ' et ' + d2 + ' ; unités : ' + d3 + ' et ' + d4 + '. Par exemple ' + (10 * d1 + d3) + ' + ' + (10 * d2 + d4) + ' = ' + a
      + " (la somme vaut 10 × (" + d1 + ' + ' + d2 + ') + ' + d3 + ' + ' + d4 + ", quel que soit l'ordre des unités).";
  } else if (mode === 'min'){
    quoi = 'la plus petite somme possible de ces deux nombres';
    a = 10 * (d3 + d4) + d1 + d2;
    l = [[(10 * d4 + d3) + (10 * d2 + d1), ((10 * d4 + d3) + (10 * d2 + d1)) + ' rend le premier nombre le plus petit possible (' + d4 + d3 + '), mais met ' + d2 + ' aux dizaines'],
      [10 * (d4 + d2) + d1 + d3, (10 * (d4 + d2) + d1 + d3) + ' place ' + d2 + ' aux dizaines au lieu de ' + d3]];
    expl = "Un chiffre des dizaines compte dix fois plus qu'un chiffre des unités : pour une petite somme, on place les deux plus petits chiffres aux dizaines. "
      + 'Dizaines : ' + d4 + ' et ' + d3 + ' ; unités : ' + d2 + ' et ' + d1 + '. Par exemple ' + (10 * d4 + d1) + ' + ' + (10 * d3 + d2) + ' = ' + a
      + " (la somme vaut 10 × (" + d4 + ' + ' + d3 + ') + ' + d2 + ' + ' + d1 + ", quel que soit l'ordre des unités).";
  } else {
    quoi = 'la plus grande différence possible entre ces deux nombres (le plus grand moins le plus petit)';
    a = (10 * d1 + d2) - (10 * d4 + d3);
    l = [[(10 * d1 + d2) - (10 * d3 + d4), ((10 * d1 + d2) - (10 * d3 + d4)) + ' retranche ' + d3 + d4 + ', alors que le plus petit nombre possible avec ces deux chiffres est ' + d4 + d3],
      [(10 * d1 + d3) - (10 * d4 + d2), ((10 * d1 + d3) - (10 * d4 + d2)) + ' met ' + d3 + ' aux unités du grand nombre au lieu de ' + d2],
      [(10 * d1 + d2) + (10 * d4 + d3), ((10 * d1 + d2) + (10 * d4 + d3)) + ' additionne au lieu de soustraire']];
    expl = 'Pour une différence la plus grande possible, le premier nombre doit être le plus grand possible et le second le plus petit possible, avec des chiffres différents. '
      + 'Le plus grand nombre possible est ' + d1 + d2 + ' ; avec les deux chiffres restants, le plus petit est ' + d4 + d3 + '. Différence : ' + d1 + d2 + ' − ' + d4 + d3 + ' = ' + a + '.';
  }
  const f = fin(a, l, {pas: 9});
  return sortie('Avec les chiffres ' + et(d) + ', utilisés chacun une seule fois, on écrit deux nombres de deux chiffres. Quelle est ' + quoi + ' ?', a, f, expl);
}

/* 2F · plus petit entier dont la somme des chiffres vaut S */
function g2sommeChiffres(R){
  const S = R.int(10, 35), q9 = Math.floor(S / 9), r = S % 9, c = R.int(0, 2);
  const aStr = (r ? String(r) : '') + '9'.repeat(q9), a = Number(aStr), nd = aStr.length;
  const l = [];
  if (r > 0) l.push([Number('9'.repeat(q9) + r), nb(Number('9'.repeat(q9) + r)) + ' met les 9 devant : mêmes chiffres, mais nombre plus grand']);
  if (r > 0) l.push([Number(String(r + 1) + '8' + '9'.repeat(q9 - 1)), nb(Number(String(r + 1) + '8' + '9'.repeat(q9 - 1))) + ' a le bon nombre de chiffres, mais un premier chiffre trop grand']);
  else l.push([Number('18' + '9'.repeat(q9 - 1)), nb(Number('18' + '9'.repeat(q9 - 1))) + ' a un chiffre de trop']);
  if (r >= 1) l.push([Number('1' + String(r - 1) + '9'.repeat(q9)), nb(Number('1' + String(r - 1) + '9'.repeat(q9))) + ' a un chiffre de trop : plus de chiffres, nombre plus grand']);
  else l.push([Number('90' + '9'.repeat(q9 - 1)), nb(Number('90' + '9'.repeat(q9 - 1))) + ' contient un 0 inutile : un chiffre de plus, nombre plus grand']);
  const f = fin(a, l, {pas: 9});
  let q;
  if (c === 0) q = 'Quel est le plus petit entier positif dont la somme des chiffres vaut ' + S + ' ?';
  else if (c === 1) q = 'Ilan cherche le plus petit nombre entier dont les chiffres, additionnés, donnent ' + S + '. Quel est ce nombre ?';
  else q = "On note s(n) la somme des chiffres d'un entier n ; par exemple, s(472) = 4 + 7 + 2 = 13. Quel est le plus petit entier n tel que s(n) = " + S + ' ?';
  return sortie(q, a, f,
    "Pour qu'un entier soit le plus petit possible, il lui faut d'abord le moins de chiffres possible, donc des chiffres les plus grands possible (des 9), puis le plus petit premier chiffre. "
    + 'Avec ' + (nd - 1) + ' ' + pl(nd - 1, 'chiffre', 'chiffres') + ', on atteint au plus ' + (nd - 1) + ' × 9 = ' + 9 * (nd - 1) + ', moins que ' + S + ' : il faut ' + nd + ' chiffres. '
    + (r ? 'On met ' + MOTS[q9] + ' ' + pl(q9, 'chiffre', 'chiffres') + ' 9 à la fin, ce qui fait ' + 9 * q9 + ', et le premier chiffre vaut ' + S + ' − ' + 9 * q9 + ' = ' + r + ' : ' + nb(a) + '.'
      : S + ' = ' + q9 + ' × 9 : le nombre ' + nb(a) + ' ne contient que des 9.'));
}

/* =====================================================================
   NIVEAU 3
   ===================================================================== */

/* Deux valeurs a et b : totaux impossibles (programmation dynamique) et écriture d'un total possible. */
function impossibles(a, b){
  const ok = [true];
  for (let n = 1; n <= a * b; n++) ok[n] = (n >= a && ok[n - a]) || (n >= b && ok[n - b]);
  return range(1, a * b).filter(n => !ok[n]);
}
function ecrit(n, a, b){
  for (let y = 0; y * b <= n; y++) if ((n - y * b) % a === 0){
    const x = (n - y * b) / a, t = [];
    if (x) t.push(x === 1 ? String(a) : x + ' × ' + a);
    if (y) t.push(y === 1 ? String(b) : y + ' × ' + b);
    return n + ' = ' + t.join(' + ');
  }
  return null;
}
const FCTX = [
  {txt: (a, b) => "Dans un pays imaginaire, il n'existe que des pièces de " + a + ' € et de ' + b + ' €, et on paie sans rendre la monnaie.',
    max: "Quel est le plus grand montant entier, en euros, qu'on ne peut pas payer exactement ?",
    cnt: 'Combien de montants entiers, en euros, ne peut-on pas payer exactement ?'},
  {txt: (a, b) => 'Une confiserie vend ses chocolats uniquement en boîtes de ' + a + ' et en boîtes de ' + b + ', sans jamais ouvrir une boîte.',
    max: "Quel est le plus grand nombre de chocolats qu'on ne peut pas acheter exactement ?",
    cnt: 'Combien de quantités de chocolats sont impossibles à acheter exactement ?'},
  {txt: (a, b) => 'À un jeu de fléchettes, chaque fléchette qui touche la cible rapporte ' + a + ' points ou ' + b + ' points.',
    max: 'Quel est le plus grand score total impossible à obtenir ?',
    cnt: 'Combien de scores totaux, strictement positifs, sont impossibles à obtenir ?'},
  {txt: (a, b) => 'Un bureau de poste ne vend que des timbres à ' + a + ' centimes et à ' + b + ' centimes.',
    max: "Quel est le plus grand affranchissement, en centimes, qu'on ne peut pas obtenir exactement avec ces timbres ?",
    cnt: "Combien d'affranchissements, en centimes, ne peut-on pas obtenir exactement avec ces timbres ?"}
];
function piegesFrob(a, b, F, imp){
  const p = v => { const e = ecrit(v, a, b); return e ? v + ' est possible : ' + e : ''; };
  return [[a * b, p(a * b)], [F + 1, p(F + 1)], [imp.length >= 2 ? imp[imp.length - 2] : null, imp.length >= 2 ? imp[imp.length - 2] + " est bien impossible, mais ce n'est pas le plus grand" : ''],
    [a * b - 1, p(a * b - 1)], [a + b, p(a + b)]];
}
function explFrobListe(a, b, F, imp){
  return 'Liste les totaux possibles dans l\'ordre : dès que ' + a + ' totaux consécutifs sont possibles, tous les suivants le sont aussi, en ajoutant ' + a + ' autant de fois que nécessaire. '
    + 'Totaux impossibles : ' + et(imp) + '. Ensuite ' + range(F + 1, F + a).map(n => ecrit(n, a, b)).join(', ') + ' : ' + a + ' totaux consécutifs sont possibles, donc tout total plus grand l\'est aussi. '
    + 'Le plus grand total impossible est ' + F + '. Pour deux valeurs sans diviseur commun, la formule ' + a + ' × ' + b + ' − ' + a + ' − ' + b + ' = ' + F + ' le confirme.';
}
function explFrobFormule(a, b, F){
  const essais = []; for (let y = 0; y * b <= F; y++) essais.push(F - y * b);
  return 'Avec deux valeurs sans diviseur commun, le plus grand total impossible vaut (produit des deux valeurs) − (somme des deux valeurs) ; vérifie ensuite que ce total est impossible et que les suivants sont possibles. '
    + a + ' × ' + b + ' − ' + a + ' − ' + b + ' = ' + F + '. '
    + F + ' est impossible : en retirant 0, 1, 2… fois ' + b + ', on obtient ' + et(essais) + ', et aucun de ces nombres n\'est un multiple de ' + a + '. '
    + 'En revanche, les ' + a + ' totaux suivants sont possibles : ' + range(F + 1, F + a).map(n => ecrit(n, a, b)).join(', ') + ' ; en ajoutant des ' + a + ', on obtient tous les totaux plus grands.';
}
function frobMax(R, paires, liste){
  const [a, b] = R.pick(paires), C = R.pick(FCTX), imp = impossibles(a, b), F = imp[imp.length - 1];
  const f = fin(F, piegesFrob(a, b, F, imp));
  return sortie(C.txt(a, b) + ' ' + C.max, F, f, liste ? explFrobListe(a, b, F, imp) : explFrobFormule(a, b, F));
}
function frobCompte(R, paires){
  const [a, b] = R.pick(paires), C = R.pick(FCTX), imp = impossibles(a, b), F = imp[imp.length - 1], n = imp.length;
  const l = [[F, F + " est le plus grand total impossible, pas le nombre de totaux impossibles"],
    [(a - 1) * (b - 1), ((a - 1) * (b - 1)) + ' oublie de diviser par 2'],
    [n + 1, ''], [n - 1, '']];
  const f = fin(n, l);
  return sortie(C.txt(a, b) + ' ' + C.cnt, n, f,
    "Repère d'abord le plus grand total impossible, puis liste tous les totaux impossibles en dessous et compte-les. "
    + 'Le plus grand total impossible vaut ' + a + ' × ' + b + ' − ' + a + ' − ' + b + ' = ' + F + ' ; au-delà, tout est possible. '
    + 'Totaux impossibles : ' + et(imp) + ', soit ' + n + ' totaux. '
    + 'Raccourci : pour deux valeurs sans diviseur commun, il y en a toujours (' + a + ' − 1) × (' + b + ' − 1) ÷ 2 = ' + n + ', car parmi deux totaux n et ' + F + ' − n, exactement un est possible.');
}
const FROB3 = [[3, 4], [3, 5], [3, 7], [3, 8], [4, 5], [4, 7], [5, 6], [3, 10], [3, 11]];
const FROB4 = [[4, 9], [5, 7], [5, 8], [5, 9], [6, 7], [4, 11], [3, 13], [3, 14], [7, 8], [4, 13]];
const CPT4 = [[3, 5], [3, 7], [4, 5], [3, 8], [4, 7], [5, 6], [3, 10], [3, 11], [4, 9]];
const FROB5 = [[7, 9], [6, 11], [8, 9], [5, 11], [7, 10], [5, 12], [7, 11], [5, 13], [6, 13], [9, 10]];
const CPT5 = [[5, 7], [5, 8], [6, 7], [5, 9], [4, 11], [7, 8], [4, 13], [6, 11]];

/* 3A · plus grand total impossible avec deux petites valeurs (listage) */
const g3frob = R => frobMax(R, FROB3, true);

/* 3B · enclos rectangulaire adossé à un mur : aire maximale */
function g3enclos(R){
  const L = R.int(16, 64), c = R.int(0, 2), f = x => x * (L - 2 * x);
  let best = 0, xs = [];
  for (let x = 1; 2 * x < L; x++){ const v = f(x); if (v > best){ best = v; xs = [x]; } else if (v === best) xs.push(x); }
  const a = best, x0 = xs[0], x3 = Math.round(L / 3);
  let q;
  if (c === 0) q = 'Un éleveur dispose de ' + L + ' m de grillage pour fermer un enclos rectangulaire adossé à un long mur : le mur forme un des côtés, et le grillage les trois autres. Les côtés mesurent un nombre entier de mètres et tout le grillage est utilisé. Quelle est la plus grande aire possible de l\'enclos, en m² ?';
  else if (c === 1) q = "Une terrasse rectangulaire est collée contre la façade d'une maison. On la borde sur ses trois autres côtés avec " + L + ' m de jardinières, toutes utilisées. Les côtés de la terrasse mesurent un nombre entier de mètres. Quelle est la plus grande aire possible de la terrasse, en m² ?';
  else q = 'Pour un stand, on délimite un rectangle contre un mur avec ' + L + " m de ruban posé sur les trois autres côtés (le mur n'a pas besoin de ruban). Les côtés mesurent un nombre entier de mètres et tout le ruban est utilisé. Quelle est la plus grande aire possible du stand, en m² ?";
  const exact = v => Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;
  const l = [exact(L * L / 16) ? [L * L / 16, nb(L * L / 16) + " est l'aire d'un carré de périmètre " + L + ' : mais le mur remplace un côté, il n\'y a que trois côtés à border'] : null,
    [f(x3), f(x3) + ' correspond à trois côtés presque égaux (' + x3 + ', ' + x3 + ' et ' + (L - 2 * x3) + ') : ce n\'est pas le meilleur choix'],
    L % 4 && exact(L * L / 8) ? [L * L / 8, nb(L * L / 8) + ' suppose une largeur de ' + nb(L / 4) + " m, qui n'est pas un nombre entier"] : null,
    [f(x0 - 1), '']];
  const fn = fin(a, l);
  const tab = range(Math.max(1, x0 - 2), x0 + 2).filter(x => 2 * x < L).map(x => 'x = ' + x + ' : ' + x + ' × ' + (L - 2 * x) + ' = ' + f(x));
  return sortie(q, a, fn,
    "Appelle x la largeur, c'est-à-dire chacun des deux côtés perpendiculaires au mur : le côté le long du mur mesure alors " + L + ' − 2x, et l\'aire vaut x × (' + L + ' − 2x) ; fais un petit tableau de valeurs. '
    + tab.join(' ; ') + '. '
    + "L'aire maximale vaut " + a + ' m², avec ' + x0 + ' m de large et ' + (L - 2 * x0) + ' m le long du mur'
    + (xs.length > 1 ? ' (ou ' + xs[1] + ' m sur ' + (L - 2 * xs[1]) + ' m)' : '') + '. Repère utile : le côté le long du mur vaut à peu près le double de la largeur.');
}

/* 3C · trois entiers de somme fixée : produit (ou volume) maximal */
function g3produit3(R){
  const S = R.int(10, 30), q = Math.floor(S / 3), r = S % 3, c = R.int(0, 2);
  const parts = r === 0 ? [q, q, q] : r === 1 ? [q + 1, q, q] : [q + 1, q + 1, q], a = prod(parts);
  const alts = [];
  for (let x = 1; x <= S; x++) for (let y = x; y <= S; y++){ const z = S - x - y; if (z < y) continue; if (z - x <= 4 && prod([x, y, z]) < a) alts.push([z, y, x]); }
  alts.sort((u, v) => prod(v) - prod(u));
  const sec = alts[0];
  let qq;
  if (c === 0) qq = 'Trois entiers strictement positifs ont pour somme ' + S + '. Quel est le plus grand produit possible de ces trois entiers ?';
  else if (c === 1) qq = 'Une boîte en forme de pavé droit a des arêtes de longueurs entières, en cm. Sa longueur, sa largeur et sa hauteur ont pour somme ' + S + ' cm. Quel est son plus grand volume possible, en cm³ ?';
  else qq = 'On partage ' + S + ' jetons en trois tas non vides, puis on multiplie entre eux les nombres de jetons des trois tas. Quel est le plus grand résultat possible ?';
  const l = [sec ? [prod(sec), nb(prod(sec)) + ' vient de ' + fois(sec) + ' : trois nombres moins proches les uns des autres'] : null,
    r !== 0 ? [q * q * q, nb(q * q * q) + ' vient de ' + q + ' × ' + q + ' × ' + q + ', mais ' + q + ' + ' + q + ' + ' + q + ' ne fait que ' + 3 * q + ', pas ' + S] : [(q - 1) * q * (q + 1), nb((q - 1) * q * (q + 1)) + ' vient de ' + (q - 1) + ' × ' + q + ' × ' + (q + 1) + ' : on peut prendre trois nombres égaux'],
    [Math.floor(S / 2) * Math.ceil(S / 2), nb(Math.floor(S / 2) * Math.ceil(S / 2)) + ' ne prend que deux nombres au lieu de trois']];
  const f = fin(a, l);
  return sortie(qq, a, f,
    'Pour une somme fixée, un produit est le plus grand quand les facteurs sont le plus proches possible les uns des autres. '
    + S + ' ÷ 3 = ' + (r ? q + ' reste ' + r : q) + ' : ' + (r === 0 ? 'on prend trois fois ' + q : 'on prend ' + et(parts)) + ', de somme ' + S + '. '
    + 'Produit : ' + fois(parts) + ' = ' + nb(a) + '.' + (sec ? ' Par comparaison, ' + fois(sec) + ' = ' + nb(prod(sec)) + '.' : ''));
}

/* 3D · notes toutes différentes : plus basse note possible, ou plus haute note possible pour la plus basse */
function g3notesDist(R){
  const k = R.pick([3, 4, 5]), mode = R.pick(['min', 'maxMin']), c = R.int(0, 1);
  const debut = c === 0
    ? cap(MOTS[k]) + ' élèves ont passé un contrôle noté sur 20 (notes entières de 0 à 20). Leurs notes sont toutes différentes, et leur moyenne vaut exactement '
    : 'Lors d\'un concours, ' + MOTS[k] + ' candidats ont reçu chacun une note entière entre 0 et 20, et deux candidats n\'ont jamais la même note. La moyenne des ' + MOTS[k] + ' notes vaut exactement ';
  if (mode === 'min'){
    const tops = range(20 - k + 2, 20).reverse(), top = sum(tops);
    const ms = range(1, 20).filter(m => { const x = k * m - top; return x >= 1 && x <= 20 - k + 1; });
    const m = R.pick(ms), T = k * m, a = T - top;
    const l = [T - 20 * (k - 1) >= 0 ? [T - 20 * (k - 1), (T - 20 * (k - 1)) + ' oublie que les notes sont toutes différentes : on ne peut pas mettre plusieurs 20'] : null,
      [m, m + ' est la moyenne, pas la plus basse note'], [a - 1, ''], [a + 1, '']];
    const f = fin(a, l, {min: 0});
    return sortie(debut + m + '. Quelle est la plus basse note possible ?', a, f,
      'Pour que la plus basse note soit la plus basse possible, les autres doivent être les plus hautes possible, sans être égales entre elles. '
      + 'Total des notes : ' + k + ' × ' + m + ' = ' + T + '. Les ' + MOTS[k - 1] + ' autres valent au plus ' + plus(tops) + ' = ' + top + '. '
      + 'La plus basse vaut donc au moins ' + T + ' − ' + top + ' = ' + a + ", et c'est possible : " + tops.concat([a]).join(', ') + ' (somme ' + T + ').');
  }
  const K2 = k * (k - 1) / 2;
  const ms = range(6, 15).filter(m => { const T = k * m, x = Math.floor((T - K2) / k), last = T - ((k - 1) * x + (k - 1) * (k - 2) / 2); return last <= 20 && last >= x + k - 1; });
  const m = R.pick(ms), T = k * m, a = Math.floor((T - K2) / k);
  const ex = range(a, a + k - 2); ex.push(T - sum(ex));
  const l = [[m, m + ' est la moyenne : il faudrait que toutes les notes soient égales, or elles sont différentes'],
    [m - (k - 1), (m - (k - 1)) + ' écarte trop les notes : les autres peuvent être juste au-dessus de la plus basse'],
    [a + 1, (a + 1) + ' est trop grand : ' + plus(range(a + 1, a + k)) + ' = ' + sum(range(a + 1, a + k)) + ' dépasse ' + T],
    [a - 1, '']];
  const f = fin(a, l, {min: 0});
  const borne = (T - K2) / k;
  return sortie(debut + m + '. Quelle est la plus haute note possible pour le moins bien noté ?', a, f,
    "Pour que la note la plus basse soit la plus haute possible, les autres notes doivent être juste au-dessus d'elle, serrées les unes contre les autres. "
    + 'Appelle x la plus basse : les autres valent au moins x + 1, x + 2, et ainsi de suite. Total : ' + k + ' × ' + m + ' = ' + T + '. Si la plus basse vaut x, le total vaut au moins x + (x + 1) + … + (x + ' + (k - 1) + ') = ' + k + 'x + ' + K2 + '. '
    + 'Il faut ' + k + 'x + ' + K2 + ' ≤ ' + T + ', donc x ≤ ' + nb(borne) + (Number.isInteger(borne) ? '' : ', soit x = ' + a + ' au mieux') + '. Exemple : ' + ex.join(', ') + ' (somme ' + T + ').');
}

/* 3E · pièces de trois sortes, au moins une de chaque : nombre minimal ou maximal de pièces */
const SYS = [{d: [5, 10, 20], cents: true}, {d: [10, 20, 50], cents: true}, {d: [1, 2, 5], cents: false}];
const argent = T => { const e = Math.floor(T / 100), c = T % 100; return c ? e + ',' + (c < 10 ? '0' : '') + c + ' €' : e + ' €'; };
function g3pieces(R){
  const s = R.pick(SYS), mode = R.pick(['min', 'max']), [d1, d2, d3] = s.d, D = d1 + d2 + d3;
  const T = s.cents ? d1 * R.int(Math.ceil(D / d1) + 6, Math.floor(300 / d1)) : R.int(D + 6, 40);
  const res = T - D;
  /* contrôle par énumération : (x1, x2, x3) ≥ 1 */
  let mn = Infinity, mx = -Infinity;
  for (let x3 = 1; x3 * d3 <= T; x3++) for (let x2 = 1; x2 * d2 + x3 * d3 <= T; x2++){ const r = T - x2 * d2 - x3 * d3; if (r >= d1 && r % d1 === 0){ const n = r / d1 + x2 + x3; mn = Math.min(mn, n); mx = Math.max(mx, n); } }
  const c3 = Math.floor(res / d3), r3 = res - c3 * d3, c2 = Math.floor(r3 / d2), c1 = (r3 - c2 * d2) / d1;
  const aMin = 3 + c1 + c2 + c3, aMax = 2 + (T - d2 - d3) / d1;
  if (aMin !== mn || aMax !== mx) return null;
  const u = s.cents ? ' centimes' : ' €', mon = v => (s.cents ? v + ' centimes' : v + ' €');
  const q = s.cents
    ? 'Tom doit payer exactement ' + argent(T) + ' avec des pièces de ' + d1 + ', ' + d2 + ' et ' + d3 + ' centimes, en utilisant au moins une pièce de chaque sorte. Combien de pièces doit-il utiliser, au ' + (mode === 'min' ? 'minimum' : 'maximum') + ' ?'
    : 'Inès doit payer exactement ' + T + ' € avec des pièces de 1 € et de 2 € et des billets de 5 €, en utilisant au moins une pièce de 1 €, une pièce de 2 € et un billet de 5 €. Combien de pièces et de billets doit-elle utiliser au total, au ' + (mode === 'min' ? 'minimum' : 'maximum') + ' ?';
  const nom = s.cents ? 'pièces' : 'pièces et billets';
  if (mode === 'min'){
    const g3 = Math.floor(T / d3), g2 = Math.floor((T - g3 * d3) / d2), g1 = (T - g3 * d3 - g2 * d2) / d1, glouton = g1 + g2 + g3;
    const l = [[glouton, glouton + " oublie la consigne « au moins une de chaque sorte »"],
      res % d2 === 0 ? [3 + res / d2, (3 + res / d2) + ' complète avec des pièces de ' + mon(d2) + ' au lieu des plus grosses'] : null,
      [Math.ceil(T / d3), Math.ceil(T / d3) + ' divise ' + (s.cents ? argent(T) : T + ' €') + ' par ' + mon(d3) + ' et arrondit, sans vérifier le paiement exact ni la consigne'],
      [aMin + 1, '']];
    const f = fin(aMin, l);
    const det = [c3 ? c3 + ' × ' + d3 : null, c2 ? c2 + ' × ' + d2 : null, c1 ? c1 + ' × ' + d1 : null].filter(Boolean);
    return sortie(q, aMin, f,
      "Pour utiliser le moins de " + nom + " possible, on pose d'abord une pièce de chaque sorte (c'est imposé), puis on complète avec les plus grosses valeurs possible. "
      + 'Une de chaque : ' + d1 + ' + ' + d2 + ' + ' + d3 + ' = ' + mon(D) + ' ; il reste ' + mon(res) + ' à payer'
      + (det.length ? ', soit ' + det.join(' + ') + ' (' + (c1 + c2 + c3) + ' de plus)' : '') + '. Total : 3 + ' + (c1 + c2 + c3) + ' = ' + aMin + '.');
  }
  const l = [[T / d1, (T / d1) + " n'utilise que des pièces de " + mon(d1) + ' : il en faut au moins une de chaque sorte'],
    [1 + (T - d3) / d1, (1 + (T - d3) / d1) + ' oublie la pièce de ' + mon(d2)], [aMax - 1, ''], [aMax + 1, '']];
  const f = fin(aMax, l);
  return sortie(q, aMax, f,
    "Pour utiliser le plus de " + nom + " possible, on ne prend qu'une seule des deux plus grosses valeurs (c'est le minimum imposé), puis on paie tout le reste avec la plus petite. "
    + d2 + ' + ' + d3 + ' = ' + mon(d2 + d3) + ' ; il reste ' + mon(T - d2 - d3) + ', soit ' + (T - d2 - d3) / d1 + ' × ' + d1 + '. Total : ' + (T - d2 - d3) / d1 + ' + 2 = ' + aMax + '.');
}

/* 3F et 4E · couvrir un besoin avec deux formats au coût minimal */
const LOTCTX = [
  {pairs: [[6, 10], [4, 6], [6, 9], [6, 15]], k: 1, intro: N => 'Pour un grand buffet, un traiteur a besoin d\'au moins ' + N + ' œufs.',
    offre: (p1, c1, p2, c2) => 'Le magasin vend les œufs en boîtes de ' + p1 + ' à ' + eur(c1) + ' et en boîtes de ' + p2 + ' à ' + eur(c2) + ', sans ouvrir les boîtes.',
    q: 'Quelle est la dépense minimale ?', u: 'œufs', G: ['grande boîte', 'grandes boîtes', true], P: ['petite boîte', 'petites boîtes', true]},
  {pairs: [[4, 7], [5, 9], [5, 8], [4, 9]], k: 10, intro: N => 'Un club doit emmener ' + N + ' personnes à un tournoi, conducteurs compris.',
    offre: (p1, c1, p2, c2) => 'Il peut louer des voitures de ' + p1 + ' places à ' + eur(c1) + ' et des minibus de ' + p2 + ' places à ' + eur(c2) + ' pour la journée.',
    q: 'Quel est le coût minimal de la location ?', u: 'places', G: ['minibus', 'minibus', false], P: ['voiture', 'voitures', true]},
  {pairs: [[4, 6], [6, 8], [4, 10], [6, 10]], k: 1, intro: N => 'Pour une fête, il faut au moins ' + N + " bouteilles d'eau.",
    offre: (p1, c1, p2, c2) => 'Le magasin vend des packs de ' + p1 + ' bouteilles à ' + eur(c1) + ' et des packs de ' + p2 + ' bouteilles à ' + eur(c2) + '.',
    q: 'Quelle est la dépense minimale ?', u: 'bouteilles', G: ['grand pack', 'grands packs', false], P: ['petit pack', 'petits packs', false]}
];
const qte = (n, F) => (n === 0 ? (F[2] ? 'aucune ' : 'aucun ') + F[0] : n + ' ' + (n > 1 ? F[1] : F[0]));
function lotsGen(R, lvl){
  for (let t = 0; t < 300; t++){
    const C = R.pick(LOTCTX), pr = R.pick(C.pairs), p1 = pr[0], p2 = pr[1];
    const c1 = R.int(2, 9), hi = Math.ceil(c1 * p2 / p1) - 1;
    if (hi <= c1) continue;
    const c2 = R.int(c1 + 1, hi);
    if (c2 * p1 >= c1 * p2) continue;
    const maxBig = lvl === 3 ? 3 : 5, N = R.int(p2 + 1, p2 * maxBig - 1), big = Math.ceil(N / p2), cands = [];
    for (let x2 = 0; x2 <= big; x2++){ const x1 = Math.max(0, Math.ceil((N - p2 * x2) / p1)); cands.push({x1, x2, cout: (x1 * c1 + x2 * c2) * C.k, n: x1 * p1 + x2 * p2}); }
    const best = Math.min(...cands.map(z => z.cout)), allBig = cands[big].cout, allSmall = cands[0].cout;
    if (!(best < allBig && best < allSmall)) continue;
    const z0 = cands.find(z => z.cout === best);
    const autres = cands.filter(z => z.cout > best).map(z => z.cout).sort((x, y) => x - y);
    const unit = N * c2 * C.k / p2;
    const l = [[allBig, eur(allBig) + " n'utilise que le format le moins cher à l'unité, et paie des " + C.u + ' inutiles'],
      [allSmall, eur(allSmall) + " n'utilise que le petit format"],
      Math.abs(unit - Math.round(unit)) > 1e-9 && Math.abs(unit * 100 - Math.round(unit * 100)) < 1e-9 ? [unit, eur(unit) + ' fait comme si on pouvait acheter les ' + C.u + " à l'unité au prix du grand format"] : null,
      autres.length ? [autres[0], ''] : null];
    const f = fin(best, l, {fmt: eur, pas: C.k});
    const q = C.intro(N) + ' ' + C.offre(p1, c1 * C.k, p2, c2 * C.k) + ' ' + C.q;
    return sortie(q, best, f,
      "Le grand format est moins cher à l'unité, mais il peut obliger à payer des " + C.u + ' inutiles : teste chaque nombre possible de grands formats, complète avec le minimum de petits, puis compare les coûts. '
      + cap(cands.map(z => qte(z.x2, C.G) + ' et ' + qte(z.x1, C.P) + ' : ' + z.n + ' ' + C.u + ' pour ' + eur(z.cout)).join(' ; ')) + '. '
      + 'Le moins cher : ' + qte(z0.x2, C.G) + ' et ' + qte(z0.x1, C.P) + ', soit ' + eur(best) + '.', eur);
  }
  return null;
}
const g3lots = R => lotsGen(R, 3);

/* =====================================================================
   NIVEAU 4
   ===================================================================== */

/* 4A · deux valeurs : plus grand total impossible (valeurs moyennes) ou nombre de totaux impossibles */
const g4frob = R => (R.int(0, 1) ? frobMax(R, FROB4, false) : frobCompte(R, CPT4));

/* 4B et 5E · découpage libre d'un entier : produit maximal (des 3, des 2 si besoin, jamais de 1) */
function decoupe3(S){
  const q = Math.floor(S / 3), r = S % 3;
  return r === 0 ? range(1, q).map(() => 3) : r === 1 ? range(1, q - 1).map(() => 3).concat([2, 2]) : range(1, q).map(() => 3).concat([2]);
}
function gPartition(R, lo, hi){
  const S = R.int(lo, hi), c = R.int(0, 2), parts = decoupe3(S), a = prod(parts), q3 = Math.floor(S / 3);
  const deux = S % 2 === 0 ? range(1, S / 2).map(() => 2) : range(1, (S - 3) / 2).map(() => 2).concat([3]);
  const t3 = [Math.ceil(S / 3), Math.round(S / 3), Math.floor(S / 3)];
  const l = [[prod(deux), nb(prod(deux)) + ' vient de morceaux de 2 : trois 2 (produit 8) valent moins que deux 3 (produit 9)'],
    S % 3 === 1 ? [Math.pow(3, q3), nb(Math.pow(3, q3)) + ' garde un morceau de 1, qui ne multiplie rien : mieux vaut remplacer 3 + 1 par 2 + 2'] : null,
    [prod(t3), nb(prod(t3)) + " ne coupe qu'en trois morceaux"],
    [Math.floor(S / 2) * Math.ceil(S / 2), nb(Math.floor(S / 2) * Math.ceil(S / 2)) + " ne coupe qu'en deux morceaux"]];
  const f = fin(a, l);
  let q;
  if (c === 0) q = 'On écrit ' + S + " comme une somme d'entiers strictement positifs (autant de termes qu'on veut), puis on calcule le produit de ces termes. Quel est le plus grand produit possible ?";
  else if (c === 1) q = 'On coupe une baguette de ' + S + " cm en morceaux dont les longueurs sont des nombres entiers de centimètres (autant de morceaux qu'on veut), puis on multiplie entre elles les longueurs des morceaux. Quel est le plus grand résultat possible ?";
  else q = 'Ilan répartit ' + S + " jetons en tas non vides, autant de tas qu'il veut, puis il multiplie entre eux les nombres de jetons des tas. Quel est le plus grand produit qu'il peut obtenir ?";
  return sortie(q, a, f,
    'Pour un produit le plus grand possible, on coupe en morceaux de 3, avec un ou deux morceaux de 2 si nécessaire, et jamais de morceau de 1. '
    + 'Pourquoi : un morceau de 4 ou plus se recoupe sans perte (4 = 2 + 2 donne 2 × 2 = 4, 5 = 2 + 3 donne 6), un 1 ne multiplie rien, et trois 2 (produit 8) valent moins que deux 3 (produit 9). '
    + (S % 3 === 1 ? 'Ici le reste de ' + S + ' ÷ 3 vaut 1 : on remplace 3 + 1 par 2 + 2. ' : '')
    + S + ' = ' + plus(parts) + ", d'où le produit " + fois(parts) + ' = ' + nb(a) + '.');
}
const g4partition = R => gPartition(R, 8, 16);

/* 4C · k entiers tous différents de somme fixée : plus petit maximum ou plus grand minimum */
function g4distinctBornes(R){
  const k = R.pick([3, 4, 5, 6, 7]), mode = R.pick(['minMax', 'maxMin']), c = R.int(0, 2);
  const T0 = k * (k + 1) / 2, K2 = k * (k - 1) / 2, S = R.int(T0 + 5, Math.min(120, T0 + 70));
  let a, ex, l, expl;
  if (mode === 'minMax'){
    a = Math.ceil((S + K2) / k);
    const e = k * a - K2 - S;
    ex = range(a - k + 1, a).map((x, i) => (i < e ? x - 1 : x));
    l = [[Math.ceil(S / k), Math.ceil(S / k) + ' correspond à un partage presque égal, impossible ici puisque les nombres sont tous différents'],
      [a - 1, (a - 1) + ' ne suffit pas : ' + plus(range(a - k, a - 1).reverse()) + ' = ' + (k * (a - 1) - K2) + ', moins que ' + S],
      [S - K2, (S - K2) + ' est la plus grande valeur possible du plus grand, pas la plus petite'],
      [a + 1, '']];
    const bq = (S + K2) / k;
    expl = 'Pour que le plus grand soit le plus petit possible, les autres nombres doivent être serrés juste en dessous de lui. '
      + 'Si le plus grand vaut M, les autres valent au plus M − 1, M − 2, et ainsi de suite. Avec un plus grand égal à M, la somme vaut au plus M + (M − 1) + … + (M − ' + (k - 1) + ') = ' + k + ' × M − ' + K2 + '. '
      + 'Il faut ' + k + ' × M − ' + K2 + ' ≥ ' + S + ', donc ' + k + ' × M ≥ ' + (S + K2) + ' et M ≥ ' + nb(bq) + (Number.isInteger(bq) ? '' : ', soit M = ' + a + ' au mieux') + '. '
      + 'Exemple : ' + plus(ex) + ' = ' + S + '.';
  } else {
    a = Math.floor((S - K2) / k);
    ex = range(a, a + k - 2); ex.push(S - sum(ex));
    l = [[Math.floor(S / k), Math.floor(S / k) + ' correspond à un partage presque égal, impossible ici puisque les nombres sont tous différents'],
      [a + 1, (a + 1) + ' est trop grand : ' + plus(range(a + 1, a + k)) + ' = ' + (k * (a + 1) + K2) + ' dépasse ' + S],
      [1, '1 est la plus petite valeur possible du plus petit, pas la plus grande'],
      [a - 1, '']];
    const bq = (S - K2) / k;
    expl = 'Pour que le plus petit soit le plus grand possible, les autres nombres doivent être serrés juste au-dessus de lui. '
      + 'Si le plus petit vaut m, les autres valent au moins m + 1, m + 2, et ainsi de suite. Avec un plus petit égal à m, la somme vaut au moins m + (m + 1) + … + (m + ' + (k - 1) + ') = ' + k + ' × m + ' + K2 + '. '
      + 'Il faut ' + k + ' × m + ' + K2 + ' ≤ ' + S + ', donc ' + k + ' × m ≤ ' + (S - K2) + ' et m ≤ ' + nb(bq) + (Number.isInteger(bq) ? '' : ', soit m = ' + a + ' au mieux') + '. '
      + 'Exemple : ' + plus(ex) + ' = ' + S + '.';
  }
  let q;
  if (c === 0) q = cap(MOTS[k]) + ' entiers strictement positifs, tous différents, ont pour somme ' + S + '. Quelle est la ' + (mode === 'minMax' ? 'plus petite valeur possible du plus grand' : 'plus grande valeur possible du plus petit') + ' de ces entiers ?';
  else if (c === 1) q = 'On range ' + S + ' livres sur ' + MOTS[k] + ' étagères : chaque étagère porte au moins un livre, et deux étagères ne portent jamais le même nombre de livres. '
    + (mode === 'minMax' ? "Combien de livres, au minimum, porte l'étagère la plus chargée ?" : "Combien de livres, au maximum, peut porter l'étagère la moins chargée ?");
  else q = cap(MOTS[k]) + ' amis ont cueilli ' + S + ' pommes à eux tous ; chacun en a cueilli au moins une, et deux amis n\'en ont jamais cueilli le même nombre. '
    + (mode === 'minMax' ? 'Combien de pommes, au minimum, a cueilli celui qui en a cueilli le plus ?' : 'Combien de pommes, au maximum, a pu cueillir celui qui en a cueilli le moins ?');
  const f = fin(a, l);
  return sortie(q, a, f, expl);
}

/* 4D · cuisson de crêpes ou de steaks : temps minimal */
const CUIS = [
  {outil: 'Une poêle', le: 'la poêle', pl: 'crêpes', sg: 'crêpe', f: true, v: 'cuire', side: 'face', sides: 'faces', sf: true},
  {outil: 'Un barbecue', le: 'le barbecue', pl: 'steaks', sg: 'steak', f: false, v: 'griller', side: 'côté', sides: 'côtés', sf: false},
  {outil: 'Une plancha', le: 'la plancha', pl: 'galettes', sg: 'galette', f: true, v: 'dorer', side: 'face', sides: 'faces', sf: true}
];
function g4grill(R){
  let c = 2, n = 3, t = 1;
  for (let k = 0; k < 100; k++){
    c = R.pick([2, 3, 4]); n = R.int(c + 1, 3 * c + 1); t = R.pick([1, 2, 3, 4, 5]);
    if (Math.ceil(2 * n / c) < 2 * Math.ceil(n / c)) break;
  }
  const O = R.pick(CUIS), tours = Math.ceil(2 * n / c), a = t * tours, fournees = 2 * t * Math.ceil(n / c);
  const q = O.outil + ' ne peut accueillir que ' + c + ' ' + O.pl + ' à la fois. Chaque ' + O.sg + ' doit ' + O.v + ' ' + t + ' min sur chaque ' + O.side
    + ", d'affilée, " + (O.sf ? 'une seule ' : 'un seul ') + O.side + ' à la fois. Retourner, poser ou retirer ' + (O.f ? 'une ' : 'un ') + O.sg + ' ne prend pas de temps. Quel est le temps minimal, en minutes, pour ' + O.v + ' complètement ' + n + ' ' + O.pl + ' ?';
  const l = [[fournees, fournees + ' cuit les ' + O.pl + ' par fournées complètes : des places restent vides pendant la dernière fournée'],
    [2 * t * n, (2 * t * n) + ' traite les ' + O.pl + ' ' + (O.f ? 'une par une' : 'un par un')],
    [a - t, (a - t) + ' est impossible : en ' + (tours - 1) + ' ' + pl(tours - 1, 'tournée', 'tournées') + ' de ' + t + ' min, on ne traite que ' + c * (tours - 1) + ' ' + O.sides + ' sur ' + 2 * n],
    [a + t, '']];
  const f = fin(a, l, {pas: t});
  const seq = [];
  for (let i = 1; i <= n; i++) seq.push(i + 'A');
  for (let i = 1; i <= n; i++) seq.push(i + 'B');
  const tr = []; for (let i = 0; i < seq.length; i += c) tr.push('tournée ' + (tr.length + 1) + ' : ' + seq.slice(i, i + c).join(', '));
  const prem = O.sf ? 'la première ' + O.side : 'le premier ' + O.side, sec = O.sf ? 'la seconde' : 'le second';
  return sortie(q, a, f,
    'Compte le nombre total de ' + O.sides + ' à ' + O.v + ', puis remplis ' + O.le + ' à chaque tournée de ' + t + ' min sans laisser de place vide. '
    + n + ' ' + O.pl + ' ont ' + 2 * n + ' ' + O.sides + ' ; à ' + c + ' par tournée, il faut au moins ' + 2 * n + ' ÷ ' + c + (2 * n % c ? ', arrondi au-dessus, soit ' : ' = ') + tours + ' tournées, donc ' + tours + ' × ' + t + ' = ' + a + ' min. '
    + "C'est réalisable : on traite d'abord " + prem + ' de chaque ' + O.sg + ', puis ' + sec + ', en complétant chaque tournée avec les ' + O.sides + ' suivantes'
    + (2 * n <= 12 ? ' (A pour ' + prem + ', B pour ' + sec + ') : ' + tr.join(' ; ') : '') + '. '
    + 'Par fournées complètes, il faudrait ' + Math.ceil(n / c) + ' fournées de 2 × ' + t + ' min, soit ' + fournees + ' min.');
}

const g4lots = R => lotsGen(R, 4);

/* Chiffres tous différents de somme donnée : faisabilité exacte et construction chiffre par chiffre. */
function faisable(libres, k, reste){
  if (k === 0) return reste === 0;
  if (reste < 0) return false;
  for (let i = 0; i < libres.length; i++) if (faisable(libres.slice(i + 1), k - 1, reste - libres[i])) return true;
  return false;
}
function construit(S, d, grand){
  const pris = new Set(), res = []; let reste = S;
  for (let i = 0; i < d; i++){
    const ordre = grand ? range(0, 9).reverse() : range(0, 9);
    let choix = null;
    for (const g of ordre){
      if (pris.has(g) || (i === 0 && g === 0 && d > 1)) continue;
      const libres = range(0, 9).filter(x => !pris.has(x) && x !== g);
      if (faisable(libres, d - i - 1, reste - g)){ choix = g; break; }
    }
    if (choix === null) return null;
    pris.add(choix); res.push(choix); reste -= choix;
  }
  return res;
}
const minChiffres = S => { for (let d = 1; d <= 10; d++){ const r = construit(S, d, false); if (r) return r; } return null; };
const maxChiffres = S => { for (let d = 10; d >= 1; d--){ const r = construit(S, d, true); if (r) return r; } return null; };
const numL = l => Number(l.join(''));
const top = k => sum(range(10 - k, 9));          // somme des k plus grands chiffres
const bas = k => k * (k - 1) / 2;                // 0 + 1 + … + (k − 1)

/* 4F · plus petit entier à chiffres tous différents de somme donnée */
function g4chiffresMin(R){
  const S = R.int(18, 40), c = R.int(0, 2), dg = minChiffres(S);
  if (!dg) return null;
  const a = numL(dg), d = dg.length, f0 = dg[0];
  const q9 = Math.floor(S / 9), r9 = S % 9, nonDist = Number((r9 ? String(r9) : '') + '9'.repeat(q9));
  const plusUn = construit(S, d + 1, false), rev = dg.slice().sort((x, y) => y - x);
  const sw = dg.slice(0, -2).concat([dg[d - 1], dg[d - 2]]);
  const l = [nonDist !== a ? [nonDist, nb(nonDist) + ' répète un chiffre : les chiffres doivent être tous différents'] : null,
    [numL(rev), nb(numL(rev)) + ' utilise les bons chiffres, mais rangés du plus grand au plus petit'],
    plusUn ? [numL(plusUn), nb(numL(plusUn)) + ' a un chiffre de trop : plus de chiffres, nombre plus grand'] : null,
    [numL(sw), '']];
  const fn = fin(a, l, {pas: 9});
  let q;
  if (c === 0) q = 'Quel est le plus petit entier positif dont les chiffres sont tous différents et ont pour somme ' + S + ' ?';
  else if (c === 1) q = 'Un code de coffre est un nombre entier, qui ne commence pas par 0, écrit avec des chiffres tous différents dont la somme vaut ' + S + '. Quel est le plus petit code possible ?';
  else q = 'On cherche le plus petit nombre entier écrit avec des chiffres tous différents, dont la somme des chiffres vaut ' + S + '. Quel est ce nombre ?';
  const libresF = range(0, 9).filter(x => x !== f0 - 1);
  const maxAutres = sum(libresF.slice(-(d - 1)));
  const just = f0 > 1 && S - (f0 - 1) > maxAutres
    ? 'avec ' + (f0 - 1) + ' en tête, les ' + MOTS[d - 1] + ' autres chiffres devraient faire ' + (S - f0 + 1) + ', plus que leur maximum ' + maxAutres
    : (f0 === 1 ? "c'est le plus petit premier chiffre possible" : "c'est le plus petit premier chiffre qui laisse une somme atteignable pour les autres");
  return sortie(q, a, fn,
    "Le plus petit nombre a d'abord le moins de chiffres possible, donc de grands chiffres ; ensuite on choisit, de gauche à droite, chaque chiffre le plus petit possible. "
    + 'Avec ' + (d - 1) + ' chiffres différents, on atteint au plus ' + plus(range(10 - (d - 1), 9).reverse()) + ' = ' + top(d - 1) + ', moins que ' + S + ' : il faut ' + d + ' chiffres. '
    + 'Premier chiffre : ' + f0 + ' (' + just + '). Les autres chiffres sont alors ' + et(dg.slice(1)) + ' (somme ' + (S - f0) + "), rangés dans l'ordre croissant : " + nb(a) + '.');
}

/* 4G · dés de somme donnée : produit maximal des résultats */
function g4desProduit(R){
  const n = R.pick([3, 4]), S = R.int(n + 3, 6 * n - 3), c = R.int(0, 1);
  const q0 = Math.floor(S / n), r = S % n, parts = range(1, n).map((x, i) => (i < r ? q0 + 1 : q0)), a = prod(parts);
  const glout = []; let rest = S;
  for (let i = 0; i < n; i++){ const v = Math.min(6, rest - (n - i - 1)); glout.push(v); rest -= v; }
  /* autres répartitions possibles, pour un distracteur « pas assez équilibré » */
  const vus = new Set(), alts = [];
  (function rec(i, mn, acc, s){ if (i === n){ if (s === S){ const p = prod(acc); if (p < a && !vus.has(p)){ vus.add(p); alts.push(acc.slice()); } } return; }
    for (let v = mn; v <= 6; v++){ acc.push(v); rec(i + 1, v, acc, s + v); acc.pop(); } })(0, 1, [], 0);
  alts.sort((u, v) => prod(v) - prod(u));
  const sec = alts[0];
  const six = parts[0] < 6 && S - 6 >= n - 1 ? [6].concat(range(1, n - 1).map((x, i) => Math.floor((S - 6) / (n - 1)) + (i < (S - 6) % (n - 1) ? 1 : 0))) : null;
  const l = [[prod(glout), nb(prod(glout)) + ' vient de ' + fois(glout) + ' : mettre le plus de 6 possible oblige à prendre de tout petits résultats'],
    sec ? [prod(sec), nb(prod(sec)) + ' vient de ' + fois(sec.slice().reverse()) + ', une répartition moins équilibrée'] : null,
    six && prod(six) < a ? [prod(six), nb(prod(six)) + ' vient de ' + fois(six) + ' : commencer par un 6 empêche d\'équilibrer'] : null,
    [a + parts[0], '']];
  const f = fin(a, l);
  const q = c === 0
    ? 'On lance ' + MOTS[n] + ' dés à six faces, numérotées de 1 à 6, et la somme des résultats vaut ' + S + '. Quel est le plus grand produit possible des ' + MOTS[n] + ' résultats ?'
    : 'Léa lance ' + MOTS[n] + ' dés à six faces, numérotées de 1 à 6. Elle obtient une somme de ' + S + '. Quelle est la plus grande valeur possible du produit de ses ' + MOTS[n] + ' résultats ?';
  return sortie(q, a, f,
    'À somme fixée, le produit est le plus grand quand les résultats sont le plus proches possible les uns des autres. '
    + S + ' ÷ ' + n + ' = ' + (r ? q0 + ' reste ' + r : q0) + ' : on prend ' + et(parts) + ' (somme ' + S + '), produit ' + fois(parts) + ' = ' + nb(a) + '. '
    + 'Par comparaison, ' + fois(glout) + ' = ' + nb(prod(glout)) + '.');
}

/* =====================================================================
   NIVEAU 5
   ===================================================================== */

/* 5A · six chiffres, deux nombres de trois chiffres : plus petite différence positive */
function g5diff6(R){
  const d = asc(R.shuffle(range(1, 9)).slice(0, 6)), c = R.int(0, 1);
  let g = 9; for (let i = 0; i < 5; i++) g = Math.min(g, d[i + 1] - d[i]);
  const cands = [];
  for (let i = 0; i < 5; i++) if (d[i + 1] - d[i] === g){
    const H = d[i + 1], h = d[i], r = d.filter(x => x !== H && x !== h);
    const big = 100 * H + 10 * r[0] + r[1], small = 100 * h + 10 * r[3] + r[2];
    cands.push({H, h, r, big, small, diff: big - small});
  }
  cands.sort((u, v) => u.diff - v.diff);
  const b = cands[0], a = b.diff, r = b.r;
  const errPetit = (100 * b.H + 10 * r[0] + r[1]) - (100 * b.h + 10 * r[2] + r[3]);
  const errGrand = (100 * b.H + 10 * r[1] + r[0]) - (100 * b.h + 10 * r[3] + r[2]);
  const l = [[errPetit, errPetit + ' : le petit nombre doit finir par ' + r[3] + r[2] + ', pas par ' + r[2] + r[3]],
    [errGrand, errGrand + ' : le grand nombre doit finir par ' + r[0] + r[1] + ', pas par ' + r[1] + r[0]],
    cands.length > 1 ? [cands[1].diff, cands[1].diff + ' vient de ' + cands[1].big + ' − ' + cands[1].small + " : une autre paire de chiffres des centaines, moins bonne"] : null,
    [a + 9, '']];
  const f = fin(a, l);
  const q = c === 0
    ? 'Avec les six chiffres ' + et(R.shuffle(d)) + ', utilisés chacun une seule fois, on écrit deux nombres de trois chiffres. Quelle est la plus petite différence positive possible entre ces deux nombres ?'
    : 'Six cartes portent les chiffres ' + et(R.shuffle(d)) + ". Avec ces six cartes, toutes utilisées une seule fois, on forme deux nombres de trois chiffres. Quel est le plus petit écart possible entre ces deux nombres ?";
  return sortie(q, a, f,
    'Pour que la différence soit petite, les chiffres des centaines doivent être les plus proches possible ; ensuite, le grand nombre doit finir le plus bas possible et le petit nombre finir le plus haut possible. '
    + 'Chiffres des centaines écartés de ' + g + ' : ' + cands.map(z => z.H + ' et ' + z.h).join(' ; ') + '. '
    + cap(cands.map(z => 'avec ' + z.H + ' et ' + z.h + ', ' + z.big + ' − ' + z.small + ' = ' + z.diff).join(' ; ')) + '. '
    + 'La plus petite différence est ' + a + ' (' + b.big + ' − ' + b.small + '). Un écart plus grand aux centaines ajoute au moins 100, ce que les deux derniers chiffres ne peuvent pas compenser.');
}

/* 5B · traversée d'un pont avec une lampe : temps minimal */
const PONT = [
  {txt: 'Quatre amis doivent traverser de nuit une passerelle étroite avec une seule lampe.', lieu: 'La passerelle'},
  {txt: 'Quatre spéléologues doivent franchir un tunnel étroit avec une seule lampe frontale.', lieu: 'Le tunnel'},
  {txt: 'Quatre randonneurs doivent traverser un vieux pont de corde, de nuit, avec une seule lampe.', lieu: 'Le pont'}
];
function g5pont(R){
  let t = [1, 2, 5, 10];
  for (let k = 0; k < 100; k++){
    const t1 = R.int(1, 3), t2 = R.int(t1 + 1, t1 + 4), t3 = R.int(t2 + 1, t2 + 6), t4 = R.int(t3 + 1, t3 + 8);
    t = [t1, t2, t3, t4];
    if (t.join() !== '1,2,5,10' && (t1 + 3 * t2 + t4) !== (2 * t1 + t2 + t3 + t4)) break;
  }
  const [t1, t2, t3, t4] = t, SA = t1 + 3 * t2 + t4, SB = 2 * t1 + t2 + t3 + t4, a = Math.min(SA, SB);
  const C = R.pick(PONT);
  const q = C.txt + ' ' + C.lieu + " supporte au plus deux personnes à la fois, toute traversée se fait avec la lampe, et à deux on avance au rythme du plus lent. Seuls, Ana met "
    + t1 + ' min, Bilal ' + t2 + ' min, Chloé ' + t3 + ' min et Dario ' + t4 + " min. Quel est le temps minimal, en minutes, pour que les quatre soient de l'autre côté ?";
  const l = [[Math.max(SA, SB), Math.max(SA, SB) + " est le temps de l'autre organisation, moins bonne ici"],
    [t1 + t2 + t3 + t4, (t1 + t2 + t3 + t4) + " oublie que quelqu'un doit rapporter la lampe"],
    [t1 + t2 + 2 * t3 + t4, (t1 + t2 + 2 * t3 + t4) + " fait passer les deux plus lents en premier : l'un d'eux doit ensuite revenir"],
    [a - 1, '']];
  const f = fin(a, l);
  return sortie(q, a, f,
    "Compare deux organisations : soit le plus rapide accompagne chacun et rapporte la lampe à chaque fois, soit les deux plus lents traversent ensemble, pour ne compter qu'une fois le temps du plus lent. "
    + 'Navette du plus rapide : Ana et Dario passent (' + t4 + '), Ana revient (' + t1 + '), Ana et Chloé passent (' + t3 + '), Ana revient (' + t1 + '), Ana et Bilal passent (' + t2 + ') : ' + plus([t4, t1, t3, t1, t2]) + ' = ' + SB + ' min. '
    + 'Les deux lents ensemble : Ana et Bilal passent (' + t2 + '), Ana revient (' + t1 + '), Chloé et Dario passent (' + t4 + '), Bilal revient (' + t2 + '), Ana et Bilal passent (' + t2 + ') : ' + plus([t2, t1, t4, t2, t2]) + ' = ' + SA + ' min. '
    + 'Le meilleur temps est ' + a + ' min ; on peut vérifier qu\'aucune autre organisation ne fait mieux.');
}

/* 5C · plus grand entier à chiffres tous différents de somme donnée */
function g5chiffresMax(R){
  const S = R.int(12, 44), c = R.int(0, 2), dg = maxChiffres(S);
  if (!dg) return null;
  const a = numL(dg), d = dg.length, f0 = dg[0];
  /* piège : les plus grands chiffres d'abord (9, 8, 7…), ce qui donne trop peu de chiffres */
  const gl = []; let s = 0;
  for (const x of [9, 8, 7, 6, 5, 4, 3, 2, 1]) if (s + x <= S){ gl.push(x); s += x; }
  const glouton = s === S ? numL(gl) : null;
  const petit = (() => { const u = asc(dg), i = u.findIndex(x => x > 0); return [u[i]].concat(u.filter((x, j) => j !== i)); })();
  const moinsUn = (() => { if (f0 < 1) return null; const lib = range(0, 9).filter(x => x !== f0 - 1); if (!faisable(lib, d - 1, S - (f0 - 1))) return null;
    const r2 = [f0 - 1], pris = new Set([f0 - 1]); let reste = S - f0 + 1;
    for (let i = 1; i < d; i++){ for (const g of range(0, 9).reverse()){ if (pris.has(g)) continue; const libres = range(0, 9).filter(x => !pris.has(x) && x !== g); if (faisable(libres, d - i - 1, reste - g)){ r2.push(g); pris.add(g); reste -= g; break; } } }
    return r2.length === d ? numL(r2) : null; })();
  const l = [glouton != null ? [glouton, nb(glouton) + ' prend les plus grands chiffres d\'abord, mais il a moins de chiffres, donc il est plus petit'] : null,
    [numL(petit), nb(numL(petit)) + ' utilise les bons chiffres, mais rangés dans l\'ordre croissant'],
    moinsUn != null ? [moinsUn, nb(moinsUn) + ' ne met pas le plus grand premier chiffre possible'] : null,
    [numL(dg.slice(0, -2).concat([dg[d - 1], dg[d - 2]])), '']];
  const fn = fin(a, l, {pas: 9});
  let q;
  if (c === 0) q = 'Quel est le plus grand entier dont les chiffres sont tous différents et ont pour somme ' + S + ' ?';
  else if (c === 1) q = 'On écrit un nombre entier avec des chiffres tous différents dont la somme vaut ' + S + '. Quel est le plus grand nombre possible ?';
  else q = 'Un code de coffre est un nombre entier écrit avec des chiffres tous différents, dont la somme des chiffres vaut ' + S + '. Quel est le plus grand code possible ?';
  let expl = "Un nombre est d'autant plus grand qu'il a de chiffres : on cherche d'abord le plus grand nombre de chiffres différents possible, en pensant aux plus petits chiffres (0, 1, 2…), puis on place en tête les plus grands chiffres possibles. "
    + '0 + 1 + … + ' + (d - 1) + ' = ' + bas(d) + ', qui ne dépasse pas ' + S + (d < 10 ? ", alors qu'avec " + (d + 1) + ' chiffres différents la somme vaut au moins ' + bas(d + 1) + ', plus que ' + S : '') + ' : le nombre a ' + d + ' chiffres. ';
  if (d === 9) expl += 'Les dix chiffres ont pour somme 45 ; il faut en écarter un seul, ' + (45 - S) + ', pour obtenir ' + S + '. On range les neuf autres du plus grand au plus petit : ' + nb(a) + '.';
  else {
    const lib = range(0, 9).filter(x => x !== f0 + 1), mn = sum(lib.slice(0, d - 1));
    expl += 'En tête, ' + f0 + (f0 < 9 && S - (f0 + 1) < mn ? ' : avec ' + (f0 + 1) + ', il ne resterait que ' + (S - f0 - 1) + ' pour ' + MOTS[d - 1] + ' chiffres différents, moins que leur minimum ' + mn : '')
      + '. Les chiffres suivants, choisis de la même façon, sont ' + et(dg.slice(1)) + ' : ' + nb(a) + '.';
  }
  return sortie(q, a, fn, expl);
}

/* 5D · somme de termes tous différents : produit maximal */
function partDist(S){
  let k = 2, tot = 2;
  while (tot + k + 1 <= S){ k++; tot += k; }
  const parts = range(2, k), r = S - tot;
  if (r === k){ for (let i = 0; i < parts.length; i++) parts[i]++; parts[parts.length - 1]++; }
  else for (let i = 0; i < r; i++) parts[parts.length - 1 - i]++;
  return {parts, k, tot, r};
}
function g5partDist(R){
  const S = R.int(10, 24), c = R.int(0, 2), P = partDist(S), parts = P.parts, a = prod(parts);
  const toutes = [];
  (function rec(rest, mn, acc){ if (rest === 0){ toutes.push(acc.slice()); return; } for (let x = mn; x <= rest; x++){ acc.push(x); rec(rest - x, x + 1, acc); acc.pop(); } })(S, 1, []);
  const prods = toutes.map(prod), mx = Math.max(...prods);
  if (mx !== a) return null;
  const autres = [...new Set(prods.filter(p => p < a))].sort((x, y) => y - x);
  const un = []; let s = 0; for (let x = 1; s + x <= S; x++){ un.push(x); s += x; } un[un.length - 1] += S - s;
  const deux = S % 2 ? [Math.floor(S / 2), Math.ceil(S / 2)] : [S / 2 - 1, S / 2 + 1];
  const l = [[prod(decoupe3(S)), nb(prod(decoupe3(S))) + ' répète des termes (' + plus(decoupe3(S)) + '), alors qu\'ils doivent être tous différents'],
    [prod(un), nb(prod(un)) + ' vient de ' + plus(un) + ' : commencer par 1 gaspille une unité, car un terme 1 ne multiplie rien'],
    [prod(deux), nb(prod(deux)) + " ne coupe qu'en deux termes"],
    autres.length ? [autres[0], ''] : null];
  const f = fin(a, l);
  let q;
  if (c === 0) q = 'On écrit ' + S + " comme une somme d'entiers strictement positifs tous différents (autant de termes qu'on veut), puis on multiplie ces termes. Quel est le plus grand produit possible ?";
  else if (c === 1) q = 'On coupe une règle de ' + S + " cm en morceaux dont les longueurs sont des nombres entiers de centimètres tous différents, puis on multiplie entre elles ces longueurs. Quel est le plus grand résultat possible ?";
  else q = 'On répartit ' + S + ' jetons en plusieurs tas non vides, sans que deux tas aient le même nombre de jetons, puis on multiplie entre eux les nombres de jetons des tas. Quel est le plus grand produit possible ?';
  const k = P.k, r = P.r;
  return sortie(q, a, f,
    'Pour un grand produit, on prend des termes petits mais tous différents et sans 1 : 2 + 3 + 4 + …, puis on répartit ce qui reste en augmentant de 1 les plus grands termes. '
    + plus(range(2, k)) + ' = ' + P.tot + (r ? ' ; il reste ' + r + ', ' + (r === k ? 'on ajoute 1 à chaque terme et encore 1 au plus grand' : 'on ajoute 1 ' + (r === 1 ? 'au plus grand terme' : 'aux ' + MOTS[r] + ' plus grands termes'))
      + '. On obtient ' + plus(parts) + ' = ' + S : ' : la somme tombe juste') + ', de produit ' + fois(parts) + ' = ' + nb(a) + '.');
}

/* 5E · découpage libre d'un grand entier */
const g5partition = R => gPartition(R, 15, 24);

/* 5F · deux valeurs plus grandes : plus grand total impossible ou nombre de totaux impossibles */
const g5frob = R => (R.int(0, 1) ? frobMax(R, FROB5, false) : frobCompte(R, CPT5));

/* =====================================================================
   Aiguillage, contrôle, secours
   ===================================================================== */
const TYPES = {
  1: [g1somme, g1rect, g1chiffres, g1des, g1notes],
  2: [g2des6, g2rectAire, g2distinct, g2achat, g2chiffres2, g2sommeChiffres],
  3: [g3frob, g3enclos, g3produit3, g3notesDist, g3pieces, g3lots],
  4: [g4frob, g4partition, g4distinctBornes, g4grill, g4lots, g4chiffresMin, g4desProduit],
  5: [g5diff6, g5pont, g5chiffresMax, g5partDist, g5partition, g5frob]
};
function valide(ex){
  if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return false;
  if (/NaN|undefined|Infinity|null/.test(ex.q + ex.a + ex.choix.join(' ') + ex.expl)) return false;
  const n = ex.choix.map(norm);
  return new Set(n).size === 4 && n.filter(x => x === norm(ex.a)).length === 1;
}
function secours(){
  return {
    q: 'Deux entiers strictement positifs ont pour somme 14. Quel est le plus grand produit possible de ces deux entiers ?',
    a: '49', accept: null, choix: ['49', '48', '13', '45'],
    expl: 'Pour une somme fixée, le produit de deux nombres est le plus grand quand ces deux nombres sont le plus proches possible. 14 = 7 + 7 et 7 × 7 = 49, alors que 6 × 8 = 48 et 1 × 13 = 13. Piège : 13 vient des deux nombres les plus éloignés, qui donnent au contraire le plus petit produit.'
  };
}

A.push({
  id: 'alb-23-optimisation',
  phase: 'albert',
  ordre: 23,
  theme: 'logique',
  titre: 'Optimisation : plus grand ou plus petit possible',
  objectif: "Trouver la plus grande ou la plus petite valeur permise par des contraintes (somme fixée, dés, chiffres, pièces, notes, achats) en cherchant une borne puis un exemple qui l'atteint.",
  lecon:
`<p class="lede">Beaucoup de questions se terminent par « au maximum », « au minimum », « le plus grand possible » ou « le plus petit possible ». On ne te demande pas une valeur précise, mais la <mark>meilleure valeur permise par les contraintes</mark>, et il faut être sûr qu'on ne peut pas faire mieux.</p>
<h2>Ce que le test demande</h2>
<p>On te donne une situation avec des nombres entiers et des contraintes : une somme fixée, un périmètre, des dés de 1 à 6, des notes sur 20, des pièces de deux valeurs, des chiffres à placer, des formats à acheter. La question porte sur la plus grande ou la plus petite valeur possible d'un produit, d'une aire, d'un nombre, d'un coût ou d'une durée. Aucune formule de cours n'est exigée : quelques essais bien choisis et deux lignes de raisonnement suffisent.</p>
<h2>Les prérequis</h2>
<ul>
<li>Aire d'un rectangle = longueur × largeur ; périmètre = 2 × (longueur + largeur), donc longueur + largeur = périmètre ÷ 2.</li>
<li>Les carrés jusqu'à 15 × 15 et les puissances de 3 : 3, 9, 27, 81, 243, 729.</li>
<li>Un nombre pair finit par 0, 2, 4, 6 ou 8 ; un multiple de 5 finit par 0 ou par 5.</li>
<li>« Entier strictement positif » veut dire 1, 2, 3… : 0 est exclu.</li>
</ul>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je repère ce qu'on optimise et les contraintes :</strong> nombres entiers ou non, tous différents ou non, valeurs plafonnées (un dé ne dépasse pas 6, une note pas 20), « au moins un de chaque ».</p>
<p><strong>2. Je trouve une borne :</strong> pour qu'un nombre soit le plus grand possible, je rends tous les autres les plus petits possible, et inversement. Pour un produit à somme fixée, j'équilibre.</p>
<p><strong>3. Je construis un exemple qui atteint la borne :</strong> sans exemple, la borne ne prouve rien.</p>
<p><strong>4. Je vérifie les contraintes</strong> (entiers, différents, plafonds) et je compare avec les choix proposés.</p>
</div>
<h2>Les principes qui reviennent</h2>
<table class="tbl">
<tr><th>Situation</th><th>Principe</th></tr>
<tr><td>Somme fixée, produit ou aire à rendre maximal</td><td>Rendre les nombres le plus proches possible (carré, parts égales)</td></tr>
<tr><td>Un nombre à rendre le plus grand, ou le plus petit</td><td>Pousser tous les autres à l'extrême opposé</td></tr>
<tr><td>Nombre à écrire avec des chiffres</td><td>D'abord le bon nombre de chiffres, puis les grands chiffres à gauche (ou les petits)</td></tr>
<tr><td>Produit maximal, nombre de termes libre</td><td>Des morceaux de 3, des 2 si besoin, jamais de 1</td></tr>
<tr><td>Totaux possibles avec deux valeurs a et b</td><td>Lister jusqu'à obtenir a totaux consécutifs</td></tr>
</table>
<div class="formule"><p>Somme S fixée : deux entiers de produit maximal valent S ÷ 2 et S ÷ 2, ou les deux entiers voisins si S est impair</p><p>Deux valeurs a et b sans diviseur commun : plus grand total impossible = a × b − a − b</p></div>
<h2>Exemples résolus</h2>
<h3>1. Un rectangle</h3>
<p>Un rectangle a des côtés entiers et un périmètre de 30 cm. Longueur + largeur = 15. Les côtés les plus proches sont 7 et 8 : l'aire maximale vaut 7 × 8 = <strong>56 cm²</strong>. Le choix 56,25 correspond à un carré de côté 7,5 : il est interdit, car 7,5 n'est pas entier.</p>
<h3>2. Des dés</h3>
<p>On lance cinq dés et la somme vaut 27. Combien de 6 au minimum ? Sans 6, cinq dés font au plus 5 × 5 = 25. Chaque 6 à la place d'un 5 ajoute 1 : il en faut au moins 2, par exemple 6 + 6 + 5 + 5 + 5 = 27. Réponse : <strong>2</strong>. Et au maximum ? Avec quatre 6, on a déjà 24, et le dernier dé vaut 3 : c'est possible. Cinq 6 feraient 30. Réponse : <strong>4</strong>.</p>
<h3>3. Des pièces de 4 € et de 7 €</h3>
<p>Quel est le plus grand montant qu'on ne peut pas payer exactement ? Montants possibles : 4, 7, 8, 11, 12, 14, 15, 16, puis 18, 19, 20, 21. Ces quatre montants se suivent : en ajoutant des pièces de 4, on obtient tous les suivants. Le plus grand impossible est <strong>17</strong>, et la formule donne bien 4 × 7 − 4 − 7 = 17.</p>
<h3>4. Au niveau du test : couper pour multiplier</h3>
<p>On écrit 14 comme une somme d'entiers strictement positifs, puis on multiplie les termes. Quel est le plus grand produit ? Un morceau de 4 ou plus se recoupe sans perte (5 = 2 + 3 et 2 × 3 = 6 &gt; 5), un 1 ne multiplie rien, et deux 3 battent trois 2 (9 &gt; 8). On prend donc des 3 : 14 = 3 + 3 + 3 + 3 + 2, et le produit vaut 81 × 2 = <strong>162</strong>.</p>
<h2>Les réflexes sans calculatrice</h2>
<ul>
<li>En QCM, pour un maximum, teste les choix du plus grand au plus petit : le premier qui est réellement atteignable est le bon. Pour un minimum, commence par le plus petit.</li>
<li>Un choix décimal (56,25) alors que les nombres doivent être entiers est presque toujours un piège.</li>
<li>Fais un petit tableau de valeurs autour de la valeur qui semble la meilleure : trois lignes suffisent.</li>
<li>« Au moins un de chaque » : pose d'abord un exemplaire de chaque, puis raisonne sur ce qui reste.</li>
<li>Pour des offres (lots, boîtes, véhicules), le format le moins cher à l'unité n'est pas toujours le meilleur : il ne faut pas payer de place inutile.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Trouve la borne en poussant les autres nombres à l'extrême opposé (ou en les équilibrant pour un produit), puis vérifie avec un exemple concret qu'elle est atteinte.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Donner une borne sans vérifier qu'un exemple l'atteint. Oublier une contrainte : nombres entiers (pas de 7,5), tous différents, dés de 1 à 6, notes plafonnées à 20, au moins un de chaque. Confondre le plus grand et le plus petit : 1 × 13 donne le plus petit produit de somme 14, pas le plus grand. Commencer un nombre par 0. Croire que le format le moins cher à l'unité suffit. Prendre a × b pour le plus grand montant impossible : a × b se paie toujours.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Optimiser, c'est une borne plus un exemple. Somme fixée : équilibrer pour rendre un produit maximal. Un nombre extrême : pousser les autres à l'extrême opposé. Produit maximal d'un découpage : des 3. Deux valeurs a et b sans diviseur commun : a × b − a − b est le plus grand total impossible.</p></div>`,
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
