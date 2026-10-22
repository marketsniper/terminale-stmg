/* ===== Maths · Objectif Albert School : alb-28 · Espace : cubes peints, dés, volumes =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS.
   gen(level, R) : niveaux 1 à 5 (bornés), n'utilise que R.int, R.pick, R.shuffle, ne lève jamais d'exception.
   Toutes les réponses sont calculées par le code (formules de position, tables construites au chargement).
   Sous-types :
   N1 dé (face opposée), cube (volume, aire totale, longueur des arêtes, nombre d'arêtes, de sommets, de faces),
      effet d'un agrandissement sur le volume (k³), nombre de petits cubes d'un pavé ou d'un cube, coins peints ;
   N2 cube peint n ≤ 6 (deux faces, une face, aucune), dé posé (faces visibles, faces cachées, faces voisines),
      remplir une boîte de cubes (unités, litres), plus grand cube constructible (reste, cubes manquants),
      aire d'une barre ou d'une tour de cubes, aire ou volume (peinture contre masse) ;
   N3 cube peint n de 4 à 10 (dont « au moins »), cube peint à l'envers (on donne un nombre, on retrouve la taille),
      tour de dés (faces visibles, cachées, dessus retrouvé), niveau d'eau qui monte, patron en croix,
      aire après retrait d'un petit cube, assemblage en L, plaque, probabilité de tirer un petit cube peint ;
   N4 cube peint sur une partie de ses faces (5 faces, 4 côtés, 3 faces en coin, 2 faces voisines, 2 opposées),
      dé qui bascule (3 quarts de tour), tunnels 1 × 1, patron quelconque décrit ligne par ligne,
      cube posé dans un coin (petits cubes visibles ou cachés), pavé peint (aucune face, deux faces),
      bloc de dés (plus petite somme visible) ;
   N5 pavé peint (une face, au moins une), cube peint à partir d'un rapport entre catégories, fourmi sur un pavé
      ou un cube (plus court chemin, Pythagore), tunnels larges (inclusion-exclusion), bloc de dés (minimum ou
      maximum), dé qui bascule (4 ou 5 quarts de tour), pavé posé sur la table et peint sauf dessous. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales ---------- */
/* Même normalisation que normStr (core/pedagogie.js), chargé après ce fichier. */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
/* Nombre à la française : d décimales au plus (2 par défaut), virgule, U+202F pour les milliers, vrai signe moins. */
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));
const sg = k => (k % 2 ? 1 : -1) * Math.ceil(k / 2);              // 1, −1, 2, −2, …
const pgcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a; };
const frac = (n, d) => { const g = pgcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; };
const ent = v => typeof v === 'number' && isFinite(v) && Math.abs(v - Math.round(v)) < 1e-9;
const c3 = x => x * x * x;
const NOMBRE = {2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six'};
const fois = r => r === 2 ? 'deux fois' : r === 3 ? 'trois fois' : r + ' fois';
const unite = s => v => nb(v) + ' ' + s;
const entier = v => nb(v);
/* Somme lisible « a × 6 + b × 3 + c × 1 » sans les termes nuls. */
const somme = L => L.filter(t => t[0] > 0).map(t => t[0] + ' × ' + t[1]).join(' + ');
/* Racine simplifiée : 125 → « 5√5 », 100 → « 10 », 5 → « √5 ». */
function rac(N){
  for (let k = Math.floor(Math.sqrt(N)); k >= 1; k--) if (N % (k * k) === 0){
    const b = N / (k * k);
    return b === 1 ? String(k) : (k === 1 ? '' : String(k)) + '√' + b;
  }
  return '√' + N;
}

/* Racine écrite puis simplifiée si possible : « √520 = 2√130 », « √457 ». */
const R2 = N => { const r = rac(N); return r === '√' + N ? r : '√' + N + ' = ' + r; };

/* QCM : la bonne réponse, les distracteurs pédagogiques, puis des voisins jusqu'à 4 choix distincts.
   Un distracteur texte est ajouté tel quel ; un nombre doit passer ok (par défaut : entier positif ou nul). */
function Q(q, bonne, autres, fmt, voisin, expl, ok){
  const f = v => typeof v === 'string' ? v : fmt(v);
  const test = ok || (v => ent(v) && v >= 0);
  const valide = v => typeof v === 'string' ? v.length > 0 : (typeof v === 'number' && isFinite(v) && test(v));
  const ch = [f(bonne)], vus = new Set([norm(ch[0])]);
  const aj = v => { if (ch.length < 4 && v != null && valide(v)){ const s = f(v); if (!vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); } } };
  autres.forEach(aj);
  for (let k = 1; ch.length < 4 && k < 400; k++) aj(voisin(k));
  return { q, a: ch[0], accept: null, choix: ch, expl };
}
/* Faces d'un dé : entier de 1 à 6, différent de « exclu ». */
const okFace = exclu => v => ent(v) && v >= 1 && v <= 6 && v !== exclu;
/* Trois faces deux à deux voisines d'un dé (une de chaque paire opposée), dans un ordre au hasard. */
function troisFaces(R){ return R.shuffle([[1, 6], [2, 5], [3, 4]]).map(p => R.pick(p)); }

/* =====================================================
   Cubes peints : formules de position (m = n − 2)
   ===================================================== */
const PEINT = [
  n => `On assemble ${nb(c3(n))} petits cubes blancs identiques pour former un grand cube de ${n} × ${n} × ${n}. On peint en rouge toute la surface extérieure du grand cube, puis on le démonte.`,
  n => `Un grand cube de ${n} × ${n} × ${n}, fait de petits cubes de bois identiques, est plongé entièrement dans un pot de peinture, puis démonté.`,
  n => `Un bloc de bois cubique de ${n} cm d'arête est peint sur ses six faces, puis découpé en ${nb(c3(n))} petits cubes de 1 cm d'arête.`
];
const QP = {
  3: 'Combien de petits cubes ont exactement trois faces peintes ?',
  2: 'Combien de petits cubes ont exactement deux faces peintes ?',
  1: 'Combien de petits cubes ont exactement une face peinte ?',
  0: 'Combien de petits cubes n\'ont aucune face peinte ?',
  u1: 'Combien de petits cubes ont au moins une face peinte ?',
  u2: 'Combien de petits cubes ont au moins deux faces peintes ?'
};
function nPeint(n, k){
  const m = n - 2;
  return k === 3 ? 8 : k === 2 ? 12 * m : k === 1 ? 6 * m * m : k === 0 ? c3(m) : k === 'u1' ? c3(n) - c3(m) : 8 + 12 * m;
}
function sPeint(R, n, k){
  const m = n - 2, ans = nPeint(n, k), N = c3(n);
  const q = R.pick(PEINT)(n) + ' ' + QP[k];
  let d, expl;
  if (k === 3){
    d = [6, 12, 4, 24];
    expl = `Un petit cube a trois faces peintes seulement s'il se trouve à un coin du grand cube. Un cube a 8 sommets, donc 8 petits cubes ont trois faces peintes, quelle que soit la taille du grand cube. Piège : 6 est le nombre de faces d'un cube et 12 son nombre d'arêtes.`;
  } else if (k === 2){
    d = [12 * n, 12 * (n - 1), 12 * m + 8, 6 * m];
    expl = `Un petit cube a exactement deux faces peintes quand il se trouve sur une arête du grand cube, sans être à un coin. Chaque arête porte ${n} petits cubes, dont 2 coins qui ont trois faces peintes : il en reste ${n} − 2 = ${m}. Le cube a 12 arêtes, donc 12 × ${m} = ${nb(ans)}. Piège : 12 × ${n} = ${nb(12 * n)} compte aussi les coins (et chaque coin trois fois), et 12 × ${m} + 8 = ${nb(12 * m + 8)} ajoute les coins, qui ont trois faces peintes.`;
  } else if (k === 1){
    d = [6 * n * n, 6 * (n - 1) * (n - 1), m * m, 4 * m * m];
    expl = `Un petit cube a exactement une face peinte quand il se trouve sur une face du grand cube sans toucher d'arête. Sur chaque face, on retire le contour : il reste un carré de ${m} × ${m} = ${m * m} petits cubes. Le cube a 6 faces, donc 6 × ${m * m} = ${nb(ans)}. Piège : 6 × ${n}² = ${nb(6 * n * n)} compte tous les carrés de la surface, y compris ceux des arêtes et des coins.`;
  } else if (k === 0){
    d = [c3(n - 1), m * m, N - 6 * n * n, 6 * m * m, N - 8];
    expl = `Les petits cubes sans peinture forment un cube intérieur, obtenu en retirant une couche de petits cubes sous chacune des six faces. Son arête mesure ${n} − 2 = ${m} (une couche en moins de chaque côté), donc il contient ${m} × ${m} × ${m} = ${nb(ans)} petit${ans > 1 ? 's' : ''} cube${ans > 1 ? 's' : ''}. Piège : (${n} − 1)³ = ${nb(c3(n - 1))} ne retire la couche que d'un seul côté.`;
  } else if (k === 'u1'){
    d = [6 * n * n, N - c3(n - 1), 6 * m * m + 12 * m];
    expl = `Le plus rapide est de compter le contraire : les petits cubes sans aucune peinture forment un cube intérieur. Son arête mesure ${n} − 2 = ${m}, donc il contient ${m}³ = ${nb(c3(m))} petit${m > 1 ? 's' : ''} cube${m > 1 ? 's' : ''}. Il y a ${n}³ = ${nb(N)} petits cubes en tout, donc ${nb(N)} − ${nb(c3(m))} = ${nb(ans)} ont au moins une face peinte. Piège : 6 × ${n}² = ${nb(6 * n * n)} compte des carrés de surface, et les petits cubes des arêtes et des coins y sont comptés plusieurs fois ; ${nb(6 * m * m + 12 * m)} oublie les 8 coins.`;
  } else {
    d = [12 * n, 12 * m, 12 * (n - 1) + 8];
    expl = `Un petit cube a au moins deux faces peintes quand il se trouve sur une arête du grand cube, coins compris. Il y a 8 coins (trois faces peintes) et 12 arêtes qui portent chacune ${n} − 2 = ${m} petits cubes à deux faces : 8 + 12 × ${m} = ${nb(ans)}. Piège : 12 × ${n} = ${nb(12 * n)} compte chaque coin trois fois, et 12 × ${m} = ${nb(12 * m)} oublie les coins.`;
  }
  return Q(q, ans, d, entier, i => ans + sg(i) * (ans > 20 ? 2 : 1), expl, v => ent(v) && v > 0 && v <= N);
}

/* =====================================================
   NIVEAU 1 · découverte
   ===================================================== */

/* 1a · Dé : face opposée. */
function s1de(R){
  const k = R.int(1, 6), o = 7 - k;
  const q = R.pick([
    `Sur un dé ordinaire à six faces, quel nombre est écrit sur la face opposée à celle du ${k} ?`,
    `Un dé ordinaire est posé sur une table et sa face du dessus montre ${k}. Quel nombre est écrit sur la face posée contre la table ?`,
    `Tu tiens un dé ordinaire devant toi : la face tournée vers toi montre ${k}. Quel nombre est écrit sur la face de derrière ?`,
    `Un dé ordinaire est posé sur une table. La face cachée, contre la table, porte le ${k}. Quel nombre lit-on sur le dessus ?`
  ]);
  const six = 6 - k >= 1 && 6 - k !== k;
  const expl = `Sur un dé ordinaire, deux faces opposées ont toujours une somme égale à 7. Les paires opposées sont 1 et 6, 2 et 5, 3 et 4 : la face opposée au ${k} porte donc 7 − ${k} = ${o}.` + (six ? ` Piège : ${6 - k} vient d'une somme de 6 au lieu de 7.` : '');
  return Q(q, o, [6 - k, 8 - k, k + 1, k - 1], entier, i => ((o - 1 + i) % 6) + 1, expl, okFace(k));
}

/* 1b · Cube : volume, aire totale, longueur des arêtes, structure. */
function s1cube(R){
  const w = R.int(0, 6);
  if (w === 6){
    const t = R.pick([
      ['d\'arêtes', 12, [8, 6, 24], `Pour compter les arêtes d'un cube, compte celles du carré du dessus, celles du carré du dessous, puis les arêtes verticales qui les relient. Cela fait 4 + 4 + 4 = 12. Piège : 8 est le nombre de sommets et 6 celui des faces.`],
      ['de sommets', 8, [6, 12, 4], `Pour compter les sommets d'un cube, compte les coins du carré du dessus puis ceux du carré du dessous. Cela fait 4 + 4 = 8. Piège : 12 est le nombre d'arêtes et 6 celui des faces.`],
      ['de faces', 6, [4, 8, 12], `Pour compter les faces d'un cube, pense à un dé : chaque face porte un nombre différent. Ces nombres vont de 1 à 6, donc un cube a 6 faces. Piège : 8 est le nombre de sommets et 12 celui des arêtes.`]
    ]);
    return Q(`Combien ${t[0]} possède un cube ?`, t[1], t[2], entier, i => t[1] + sg(i), t[3], v => ent(v) && v > 0);
  }
  /* pas d'arête 6 : 6³ = 6 × 6², le volume et l'aire totale auraient la même valeur */
  const a = R.pick([2, 3, 4, 5, 7, 8, 9, 10]), u = R.pick(['cm', 'cm', 'm', 'dm']);
  const objet = R.pick([`Un cube a des arêtes de ${a} ${u}.`, `Une boîte cubique mesure ${a} ${u} de côté.`, `Un bloc de pierre cubique a une arête de ${a} ${u}.`]);
  if (w <= 2){
    const ans = c3(a);
    const expl = `Le volume d'un cube s'obtient en multipliant son arête trois fois par elle-même. Ici ${a} × ${a} × ${a} = ${nb(ans)} ${u}³. Piège : ${a} × ${a} = ${a * a} donne l'aire d'une seule face, 6 × ${a}² = ${nb(6 * a * a)} l'aire totale, et 3 × ${a} n'a pas de sens pour un volume.`;
    return Q(`${objet} Quel est son volume ?`, ans, [a * a, 6 * a * a, 3 * a], unite(u + '³'), i => ans + sg(i) * a, expl, v => ent(v) && v > 0);
  }
  if (w <= 4){
    const ans = 6 * a * a;
    const expl = `L'aire totale d'un cube est la somme des aires de ses 6 faces carrées, toutes identiques. Une face mesure ${a} × ${a} = ${a * a} ${u}², donc l'aire totale vaut 6 × ${a * a} = ${nb(ans)} ${u}². Piège : ${a * a} ${u}² est l'aire d'une seule face, 4 × ${a * a} = ${4 * a * a} oublie le dessus et le dessous, et ${nb(c3(a))} est le volume.`;
    return Q(`${objet} Quelle est l'aire totale de ses six faces ?`, ans, [a * a, 4 * a * a, c3(a)], unite(u + '²'), i => ans + sg(i) * a, expl, v => ent(v) && v > 0);
  }
  const ans = 12 * a;
  const q = R.pick([
    `On fabrique le squelette d'un cube de ${a} ${u} d'arête avec des baguettes, une baguette par arête. Quelle longueur totale de baguettes faut-il ?`,
    `Quelle est la somme des longueurs de toutes les arêtes d'un cube de ${a} ${u} d'arête ?`
  ]);
  const expl = `Un cube a 12 arêtes, toutes de même longueur : on multiplie la longueur d'une arête par 12. Ici 12 × ${a} = ${ans} ${u}. Piège : 8 × ${a} = ${8 * a} confond arêtes et sommets, et 6 × ${a} = ${6 * a} confond arêtes et faces.`;
  return Q(q, ans, [8 * a, 6 * a, 4 * a], unite(u), i => ans + sg(i) * a, expl, v => ent(v) && v > 0);
}

/* 1c · Agrandissement : volume × k³. */
function s1k(R){
  const k = R.pick([2, 2, 3, 3, 4, 5, 10]), w = R.int(0, 4);
  const verbe = k === 2 ? 'On double' : k === 3 ? 'On triple' : 'On multiplie par ' + k;
  const q = [
    `${verbe} la longueur de l'arête d'un cube. Par combien son volume est-il multiplié ?`,
    `Une boîte en forme de pavé est agrandie : sa longueur, sa largeur et sa hauteur sont toutes multipliées par ${k}. Par combien son volume est-il multiplié ?`,
    `Un dé géant est ${k} fois plus long, ${k} fois plus large et ${k} fois plus haut qu'un dé ordinaire. Combien de dés ordinaires faudrait-il pour occuper le même volume que lui ?`,
    `On divise par ${k} la longueur de l'arête d'un cube. Par combien son volume est-il divisé ?`,
    `Deux aquariums ont exactement la même forme, mais toutes les dimensions du grand sont ${k} fois plus grandes que celles du petit. Combien de fois le grand contient-il plus d'eau que le petit ?`
  ][w];
  const ans = c3(k);
  const expl = `Quand toutes les longueurs d'un solide sont multipliées (ou divisées) par un même nombre, son volume est multiplié (ou divisé) par le cube de ce nombre, car un volume se calcule avec trois longueurs. Ici ${k} × ${k} × ${k} = ${nb(ans)}. Piège : ${k * k} est l'effet sur une aire (deux longueurs) et ${k} l'effet sur une longueur.`;
  return Q(q, ans, [k, k * k, 3 * k], entier, i => ans + sg(i) * k, expl, v => ent(v) && v > 1);
}

/* 1d · Compter des petits cubes : pavé, cube, coins peints. */
function s1pc(R){
  const w = R.int(0, 2);
  if (w === 0){
    let a, b, c;
    do { a = R.int(2, 6); b = R.int(2, 6); c = R.int(2, 5); } while (a === b && b === c);
    const ans = a * b * c;
    const q = R.pick([
      `On empile des petits cubes de 1 cm d'arête pour former un pavé plein de ${a} cm de long, ${b} cm de large et ${c} cm de haut. Combien de petits cubes faut-il ?`,
      `Une boîte de sucres contient des morceaux cubiques bien rangés : ${a} dans la longueur, ${b} dans la largeur, sur ${c} couches. Combien de morceaux contient-elle ?`
    ]);
    const expl = `On compte les petits cubes d'une couche (longueur × largeur), puis on multiplie par le nombre de couches. Une couche contient ${a} × ${b} = ${a * b} petits cubes, et il y a ${c} couches : ${a * b} × ${c} = ${ans}. Piège : ${a + b + c} additionne les dimensions au lieu de les multiplier, et ${a * b} ne compte qu'une seule couche.`;
    return Q(q, ans, [a + b + c, a * b, 2 * (a * b + b * c + a * c)], entier, i => ans + sg(i) * c, expl, v => ent(v) && v > 0);
  }
  if (w === 1){
    const n = R.pick([2, 3, 4, 5, 6, 10]), ans = c3(n);
    const q = R.pick([
      `Un grand cube de ${n} cm d'arête est formé de petits cubes de 1 cm d'arête. Combien de petits cubes contient-il ?`,
      `Combien de petits cubes identiques faut-il pour construire un grand cube plein de ${n} × ${n} × ${n} ?`
    ]);
    const expl = `Un grand cube plein se compte couche par couche : chaque couche est un carré de petits cubes, et il y a autant de couches que de petits cubes sur une arête. Une couche contient ${n} × ${n} = ${n * n} petits cubes, et il y a ${n} couches : ${n * n} × ${n} = ${nb(ans)}. Piège : ${n * n} ne compte qu'une couche, et ${nb(6 * n * n)} compte les carrés visibles sur les six faces.`;
    return Q(q, ans, [n * n, 6 * n * n, 3 * n], entier, i => ans + sg(i) * n, expl, v => ent(v) && v > 0);
  }
  return sPeint(R, R.int(3, 10), 3);
}

/* =====================================================
   NIVEAU 2 · maîtrise
   ===================================================== */

/* 2a · Cube peint, petites tailles. */
function s2peint(R){
  const c = R.pick([[3, 2], [4, 2], [5, 2], [6, 2], [3, 0], [4, 0], [5, 0], [3, 1], [4, 1]]);
  return sPeint(R, c[0], c[1]);
}

/* 2b · Dé posé : faces visibles, faces cachées, faces voisines. */
function s2vis(R){
  const w = R.int(0, 2);
  if (w === 0){
    const t = R.int(1, 6), b = 7 - t, ans = 14 + t;
    const q = R.pick([
      `Un dé ordinaire est posé sur une table. On voit sa face du dessus, qui montre ${t}, et ses quatre faces de côté. Quelle est la somme des nombres écrits sur ces cinq faces visibles ?`,
      `Un dé ordinaire posé sur une table montre ${t} sur le dessus. En tournant autour de la table, on voit toutes ses faces sauf celle du dessous. Quelle est la somme des nombres de ces faces ?`
    ]);
    const expl = `La somme des six faces d'un dé vaut 1 + 2 + 3 + 4 + 5 + 6 = 21 : il suffit d'en retirer la face cachée contre la table. Cette face est opposée au dessus, donc elle porte 7 − ${t} = ${b}. Somme visible : 21 − ${b} = ${ans}. Piège : 21 − ${t} = ${21 - t} retire la face du dessus, qui est pourtant visible.`;
    return Q(q, ans, [21 - t, 21, 14, 7 + t], entier, i => ans + sg(i), expl, v => ent(v) && v > 0 && v <= 21);
  }
  if (w === 1){
    const [t, f, d] = troisFaces(R), S = t + f + d, ans = 21 - S;
    const q = `Sur une table, un dé ordinaire montre ${t} sur le dessus, ${f} sur la face tournée vers toi et ${d} sur la face de droite. Quelle est la somme des nombres écrits sur les trois faces que tu ne vois pas ?`;
    const expl = `Chaque face cachée est opposée à une face visible, et sur un dé deux faces opposées ont toujours la même somme. Cette somme vaut 7, donc les faces cachées portent 7 − ${t} = ${7 - t}, 7 − ${f} = ${7 - f} et 7 − ${d} = ${7 - d}, soit ${7 - t} + ${7 - f} + ${7 - d} = ${ans}. On peut aussi faire 21 − ${S} = ${ans}. Piège : ${S} est la somme des faces visibles, et ${18 - S} vient d'une somme de 6 au lieu de 7 pour deux faces opposées.`;
    return Q(q, ans, [S, 18 - S, 21], entier, i => ans + sg(i), expl, v => ent(v) && v > 0 && v <= 21);
  }
  const k = R.int(1, 6);
  const q = R.pick([
    `Sur un dé ordinaire, quatre faces touchent la face du ${k} (elles ont une arête commune avec elle). Quelle est la somme des nombres écrits sur ces quatre faces ?`,
    `Un dé ordinaire est posé sur une table avec le ${k} sur le dessus. Quelle est la somme des nombres écrits sur ses quatre faces de côté ?`
  ]);
  const expl = `Les quatre faces qui touchent une face sont toutes les faces du dé sauf elle-même et sa face opposée. On retire donc de 21 la face du ${k} et la face opposée, qui font 7 ensemble : 21 − 7 = 14, quel que soit le nombre de départ. Piège : 21 − ${k} = ${21 - k} oublie de retirer aussi la face opposée.`;
  return Q(q, 14, [21 - k, 14 + k, 21], entier, i => 14 + sg(i), expl, v => ent(v) && v > 0 && v <= 21);
}

/* 2c · Remplir : cubes dans un pavé, cubes dans un cube (conversions), litres. */
function s2rempl(R){
  const w = R.int(0, 2);
  if (w === 0){
    const a = R.pick([2, 3, 4, 5, 10]);
    let p, q2, r;
    do { p = R.int(1, 5); q2 = R.int(1, 5); r = R.int(2, 4); } while (p * q2 * r < 6 || (p === q2 && q2 === r));
    const L = p * a, l = q2 * a, h = r * a, V = L * l * h, ans = p * q2 * r;
    const q = `Combien de cubes de ${a} cm d'arête faut-il pour remplir exactement une boîte en forme de pavé de ${L} cm de long, ${l} cm de large et ${h} cm de haut ?`;
    const expl = `On compte combien de cubes tiennent dans chaque direction, puis on multiplie les trois nombres. En longueur ${L} ÷ ${a} = ${p}, en largeur ${l} ÷ ${a} = ${q2}, en hauteur ${h} ÷ ${a} = ${r} : il faut ${p} × ${q2} × ${r} = ${ans} cubes. Piège : ${nb(V)} ÷ ${a} = ${nb(V / a)} divise le volume de la boîte par l'arête d'un cube au lieu de le diviser par son volume, ${a}³ = ${nb(c3(a))} ; et ${p * q2} ne remplit qu'une couche.`;
    return Q(q, ans, [V / a, p * q2, V / (a * a), p + q2 + r], entier, i => ans + sg(i), expl, v => ent(v) && v > 0);
  }
  if (w === 1){
    const c = R.pick([[100, '1 m', 10], [100, '1 m', 20], [100, '1 m', 25], [100, '1 m', 50], [200, '2 m', 20], [200, '2 m', 25], [200, '2 m', 40], [200, '2 m', 50], [60, '60 cm', 20], [80, '80 cm', 20], [90, '90 cm', 30], [120, '1,2 m', 20], [150, '1,5 m', 50], [150, '1,5 m', 30]]);
    const E = c[0], a = c[2], m = E / a, ans = c3(m);
    const q = `Combien de petits cubes de ${a} cm d'arête faut-il pour remplir une caisse cubique de ${c[1]} d'arête ?`;
    const conv = c[1] === E + ' cm' ? '' : `${c[1]} = ${E} cm, et `;
    const expl = `On compte d'abord combien de petits cubes tiennent le long d'une arête, puis on élève ce nombre au cube (longueur, largeur et hauteur). ${conv.charAt(0).toUpperCase() + conv.slice(1)}${E} ÷ ${a} = ${m} : il faut ${m} × ${m} × ${m} = ${nb(ans)} petits cubes. Piège : ${m} ne remplit qu'une rangée et ${m * m} une seule couche.`;
    return Q(q, ans, [m, m * m, 3 * m], entier, i => ans + sg(i) * m, expl, v => ent(v) && v > 0);
  }
  const cube = R.int(0, 1) === 0;
  let dims;
  if (cube){ const c = R.pick([10, 20, 30, 40, 50, 60, 80, 100]); dims = [c, c, c]; }
  else { do { dims = [R.pick([20, 30, 40, 50, 60, 80, 100]), R.pick([20, 30, 40, 50]), R.pick([20, 30, 40, 50])]; } while (dims[0] * dims[1] * dims[2] > 1000000 || dims[1] > dims[0]); }
  const dm = dims.map(x => x / 10), ans = dm[0] * dm[1] * dm[2];
  const q = cube
    ? `Un aquarium cubique mesure ${dims[0]} cm d'arête (mesure intérieure). Combien de litres d'eau peut-il contenir au maximum ?`
    : `Un aquarium en forme de pavé mesure ${dims[0]} cm de long, ${dims[1]} cm de large et ${dims[2]} cm de haut (mesures intérieures). Combien de litres d'eau peut-il contenir au maximum ?`;
  const cm3 = dims[0] * dims[1] * dims[2];
  const expl = `Un litre est le volume d'un cube de 1 dm d'arête, c'est-à-dire de 10 cm : on convertit les longueurs en décimètres avant de les multiplier. ${dims.map((x, i) => i === 1 && cube ? null : x + ' cm = ' + nb(x / 10) + ' dm').filter(x => x).filter((x, i, t) => t.indexOf(x) === i).join(', ')} : ${dm.map(x => nb(x)).join(' × ')} = ${nb(ans)} dm³, soit ${nb(ans)} L. Piège : ${nb(cm3)} cm³ ne font pas ${nb(cm3 / 100)} L, car 1 L = 1 000 cm³.`;
  return Q(q, ans, [ans * 10, ans / 10, ans * 1000], unite('L'), i => ans + sg(i) * (ans >= 20 ? 5 : 1), expl, v => v > 0 && ent(v * 100));
}

/* 2d · Plus grand cube plein : reste, cubes manquants. */
function s2plus(R){
  const n = R.int(2, 9), N = R.int(c3(n) + 1, c3(n + 1) - 1), w = R.int(0, 1);
  const cubes = 'Les cubes à connaître sont 8, 27, 64, 125, 216, 343, 512, 729 et 1 000.';
  if (w === 0){
    const ans = N - c3(n);
    const q = R.pick([
      `On dispose de ${nb(N)} petits cubes identiques. On construit avec eux le plus grand cube plein possible. Combien de petits cubes restent inutilisés ?`,
      `Avec ${nb(N)} morceaux de sucre cubiques, on forme le plus grand cube plein possible. Combien de morceaux reste-t-il ?`
    ]);
    const expl = `On cherche le plus grand cube plein possible, c'est-à-dire le plus grand nombre n tel que n × n × n ne dépasse pas le nombre de petits cubes disponibles. ${cubes} Ici ${n}³ = ${nb(c3(n))} ne dépasse pas ${nb(N)}, mais ${n + 1}³ = ${nb(c3(n + 1))} le dépasse : on construit un cube de ${n} × ${n} × ${n}. Il reste ${nb(N)} − ${nb(c3(n))} = ${nb(ans)} petits cubes. Piège : ${nb(c3(n + 1) - N)} est le nombre de cubes qui manquent pour le cube suivant, pas le nombre de cubes qui restent.`;
    return Q(q, ans, [c3(n + 1) - N, N - c3(n - 1), N - n * n], entier, i => ans + sg(i), expl, v => ent(v) && v > 0);
  }
  const ans = c3(n + 1) - N;
  const q = `Lina a ${nb(N)} petits cubes. Elle veut construire un cube plein en utilisant tous ses petits cubes. Combien de petits cubes doit-elle ajouter, au minimum ?`;
  const expl = `Pour utiliser tous les petits cubes, on cherche le premier cube n × n × n qui dépasse le nombre de petits cubes disponibles. ${cubes} Ici ${n}³ = ${nb(c3(n))} est trop petit (il ne les utilise pas tous) et ${n + 1}³ = ${nb(c3(n + 1))} convient : il faut ajouter ${nb(c3(n + 1))} − ${nb(N)} = ${nb(ans)} petits cubes. Piège : ${nb(N - c3(n))} est le nombre de cubes qui resteraient avec le cube de ${n} × ${n} × ${n}, pas le nombre de cubes à ajouter.`;
  return Q(q, ans, [N - c3(n), c3(n + 2) - N, c3(n + 1) - c3(n)], entier, i => ans + sg(i), expl, v => ent(v) && v > 0);
}

/* 2e · Aire d'une barre (ou d'une tour) de cubes collés. */
function s2barre(R){
  const k = R.int(2, 12), a = R.pick([1, 1, 2, 3]), f = a * a, tour = R.int(0, 2) === 0;
  const unit = `${a} cm d'arête`;
  if (!tour){
    const ans = (4 * k + 2) * f;
    const q = `On colle ${k} cubes de ${unit} face contre face pour former une barre droite. Quelle est l'aire totale de la surface extérieure de la barre, faces des deux bouts et dessous compris ?`;
    const expl = `Chaque contact entre deux cubes cache deux faces, une de chaque cube. Les ${k} cubes ont 6 × ${k} = ${6 * k} faces et il y a ${k - 1} contact${k > 2 ? 's' : ''}, qui cache${k > 2 ? 'nt' : ''} 2 × ${k - 1} = ${2 * (k - 1)} faces. Il reste ${6 * k} − ${2 * (k - 1)} = ${4 * k + 2} faces visibles, de ${f} cm² chacune : ${nb(ans)} cm². Piège : ${nb(6 * k * f)} cm² oublie les faces collées, et ${nb((5 * k + 1) * f)} cm² ne retire qu'une face par contact.`;
    return Q(q, ans, [6 * k * f, (5 * k + 1) * f, 4 * k * f, a > 1 ? (4 * k + 2) * a : null], unite('cm²'), i => ans + sg(i) * f, expl, v => ent(v) && v > 0);
  }
  const ans = (4 * k + 1) * f;
  const q = `On empile ${k} cubes de ${unit} pour former une tour posée sur une table. Quelle est l'aire totale des faces visibles de la tour (le dessous, posé sur la table, ne se voit pas) ?`;
  const expl = `La tour montre quatre faces de côté par cube, plus le dessus du cube du haut ; le dessous et les faces collées sont cachés. Cela fait 4 × ${k} + 1 = ${4 * k + 1} faces de ${f} cm² chacune : ${nb(ans)} cm². Piège : ${nb((4 * k + 2) * f)} cm² compte aussi le dessous, posé sur la table, et ${nb(6 * k * f)} cm² compte toutes les faces, même collées.`;
  return Q(q, ans, [(4 * k + 2) * f, 6 * k * f, 4 * k * f, a > 1 ? (4 * k + 1) * a : null], unite('cm²'), i => ans + sg(i) * f, expl, v => ent(v) && v > 0);
}

/* 2f · Aire ou volume ? (peinture, papier, vernis contre masse, sable, contenance) */
const AV = [
  { aire: true, p: [2, 3, 4, 5], u: 'pots', q: (p, k) => `Il faut ${p} pots de peinture pour peindre toutes les faces d'une caisse cubique. Combien de pots faut-il pour peindre de la même façon une caisse cubique dont l'arête est ${k} fois plus longue ?` },
  { aire: true, p: [2, 3, 4], u: 'feuilles', q: (p, k) => `Pour emballer un cadeau cubique sans chevauchement, il faut ${p} feuilles de papier. Combien de feuilles faut-il pour emballer de la même façon un cadeau cubique dont l'arête est ${k} fois plus longue ?` },
  { aire: true, p: [10, 15, 20], u: 'mL', q: (p, k) => `On vernit toutes les faces d'un dé en bois avec ${p} mL de vernis. Combien de vernis faut-il pour un dé de même forme ${k} fois plus long, plus large et plus haut ?` },
  { aire: false, p: [50, 80, 100, 125, 200], u: 'g', q: (p, k) => `Un cube en bois pèse ${p} g. Combien pèse un cube du même bois dont l'arête est ${k} fois plus longue ?` },
  { aire: false, p: [2, 3, 5, 8], u: 'kg', q: (p, k) => `Le sable qui remplit une caisse cubique pèse ${p} kg. Combien pèse le sable qui remplit une caisse cubique ${k} fois plus longue, plus large et plus haute ?` },
  { aire: false, p: [2, 5, 8, 10], u: 'L', q: (p, k) => `Un réservoir cubique contient ${p} L quand il est plein. Combien contient un réservoir cubique plein dont l'arête est ${k} fois plus longue ?` }
];
function s2av(R){
  const c = R.pick(AV), k = R.pick([2, 2, 3]), p = R.pick(c.p);
  const ans = c.aire ? k * k * p : c3(k) * p, autre = c.aire ? c3(k) * p : k * k * p;
  const expl = c.aire
    ? `La quantité nécessaire est proportionnelle à la surface à couvrir, et une aire est multipliée par le carré du coefficient des longueurs. Les longueurs sont multipliées par ${k}, donc l'aire est multipliée par ${k} × ${k} = ${k * k} : ${p} × ${k * k} = ${nb(ans)} ${c.u}. Piège : ${nb(autre)} confond aire et volume (× ${c3(k)}), et ${nb(k * p)} oublie qu'une aire dépend de deux longueurs.`
    : `Une masse ou une contenance est proportionnelle au volume, et un volume est multiplié par le cube du coefficient des longueurs. Les longueurs sont multipliées par ${k}, donc le volume est multiplié par ${k} × ${k} × ${k} = ${c3(k)} : ${p} × ${c3(k)} = ${nb(ans)} ${c.u}. Piège : ${nb(autre)} confond volume et aire (× ${k * k}), et ${nb(k * p)} oublie qu'un volume dépend de trois longueurs.`;
  return Q(c.q(p, k), ans, [autre, k * p], unite(c.u), i => ans + sg(i) * p, expl, v => ent(v) && v > 0);
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels
   ===================================================== */

/* 3a · Cube peint, tailles moyennes, « au moins ». */
function s3peint(R){
  const c = R.pick([[5, 0], [6, 0], [7, 0], [8, 0], [5, 1], [6, 1], [7, 1], [8, 1], [7, 2], [8, 2], [9, 2], [10, 2], [4, 'u1'], [5, 'u1'], [6, 'u1'], [7, 'u1'], [6, 'u2'], [8, 'u2'], [10, 'u2']]);
  return sPeint(R, c[0], c[1]);
}

/* 3b · Cube peint à l'envers : un nombre donné, on retrouve la taille. */
const PEINT_X = [
  'Un grand cube, formé de petits cubes identiques, est peint sur toute sa surface extérieure, puis démonté.',
  'On peint toutes les faces extérieures d\'un grand cube construit avec des petits cubes identiques, puis on le démonte.'
];
function s3inv(R){
  const w = R.int(0, 3), ctx = R.pick(PEINT_X);
  if (w === 0){
    const m = R.int(2, 6), n = m + 2, ans = 6 * m * m;
    const q = `${ctx} On compte ${nb(c3(m))} petits cubes sans aucune face peinte. ${QP[1]}`;
    const expl = `On remonte du nombre donné à la taille du grand cube : les petits cubes sans peinture forment un cube intérieur, dont l'arête vaut celle du grand cube moins 2. Ici ${nb(c3(m))} = ${m} × ${m} × ${m} : le cube intérieur a ${m} petits cubes d'arête, et le grand cube ${n}. Ceux qui ont une seule face peinte forment, sur chacune des 6 faces, un carré de ${m} × ${m} : 6 × ${m * m} = ${nb(ans)}.` + (m >= 3 ? ` Piège : prendre ${m} pour l'arête du grand cube donne 6 × ${m - 2}² = ${6 * (m - 2) * (m - 2)}.` : ` Piège : 6 × ${n}² = ${6 * n * n} compte tous les carrés de la surface.`);
    return Q(q, ans, [m >= 3 ? 6 * (m - 2) * (m - 2) : null, 6 * n * n, 12 * m], entier, i => ans + sg(i) * 6, expl, v => ent(v) && v > 0);
  }
  if (w === 1){
    const m = R.int(2, 7), n = m + 2, ans = c3(m);
    const q = `${ctx} On compte ${12 * m} petits cubes avec exactement deux faces peintes. ${QP[0]}`;
    const expl = `On remonte du nombre donné à la taille du grand cube : les petits cubes à deux faces peintes se répartissent également sur les 12 arêtes, coins exclus. ${12 * m} ÷ 12 = ${m} par arête, donc chaque arête porte ${m} + 2 = ${n} petits cubes. Les petits cubes sans peinture forment le cube intérieur de ${m} × ${m} × ${m} = ${nb(ans)}. Piège : ${n}³ = ${nb(c3(n))} compte tous les petits cubes, peints ou non, et ${m * m} n'est qu'une couche du cube intérieur.`;
    return Q(q, ans, [c3(n), m * m, 6 * m * m], entier, i => ans + sg(i) * 2, expl, v => ent(v) && v > 0);
  }
  if (w === 2){
    const m = R.int(1, 6), n = m + 2, ans = c3(n);
    const q = `${ctx} On compte ${6 * m * m} petits cubes avec exactement une face peinte. Combien de petits cubes formaient le grand cube ?`;
    const expl = `On remonte du nombre donné à la taille du grand cube : les petits cubes à une seule face peinte se répartissent également sur les 6 faces. ${6 * m * m} ÷ 6 = ${m * m} = ${m} × ${m} par face, donc chaque arête porte ${m} + 2 = ${n} petits cubes (un coin à chaque bout). Le grand cube compte ${n} × ${n} × ${n} = ${nb(ans)} petits cubes. Piège : ${nb(c3(m + 1))} ajoute 1 au lieu de 2, et ${nb(c3(m))} oublie les deux couches extérieures.`;
    return Q(q, ans, [c3(m + 1), c3(m), c3(n) - c3(m)], entier, i => ans + sg(i) * 3, expl, v => ent(v) && v > 0);
  }
  const m = R.int(2, 6), n = m + 2, ans = c3(n);
  const q = `${ctx} On compte ${nb(c3(m))} petits cubes sans aucune face peinte. Combien de petits cubes formaient le grand cube ?`;
  const expl = `On remonte du nombre donné à la taille du grand cube : les petits cubes sans peinture forment un cube intérieur, entouré d'une couche peinte de chaque côté. ${nb(c3(m))} = ${m}³, donc le cube intérieur a ${m} petits cubes d'arête et le grand cube ${m} + 2 = ${n}. Total : ${n} × ${n} × ${n} = ${nb(ans)}. Piège : ${nb(c3(m + 1))} n'ajoute la couche que d'un côté.`;
  return Q(q, ans, [c3(m + 1), c3(m) + 6 * m * m, c3(n) - c3(m)], entier, i => ans + sg(i) * 4, expl, v => ent(v) && v > 0);
}

/* 3c · Tour de dés : faces visibles, faces cachées, dessus retrouvé. */
function s3tour(R){
  const k = R.int(2, 6), t = R.int(1, 6), w = R.int(0, 2);
  const deb = `On empile ${k} dés ordinaires pour former une tour posée sur une table.`;
  const cache = 'On ne voit ni la face posée sur la table, ni les faces collées entre deux dés.';
  if (w === 0){
    const ans = 14 * k + t;
    const q = `${deb} Le dessus de la tour montre ${t}. ${cache} Quelle est la somme des nombres de toutes les faces visibles ?`;
    const expl = `Sur chaque dé, les quatre faces de côté forment deux paires de faces opposées, donc leur somme ne dépend pas de la façon dont le dé est tourné. Elle vaut toujours 7 + 7 = 14 : les ${k} dés montrent donc ${k} × 14 = ${14 * k} sur leurs côtés, et on ajoute le dessus de la tour : ${14 * k} + ${t} = ${ans}. Piège : ${21 * k - 7 + t} ne retire que la face posée sur la table et oublie les faces collées entre deux dés.`;
    return Q(q, ans, [21 * k - 7 + t, 14 * k + 7 - t, 14 * k, 21 * k - t], entier, i => ans + sg(i), expl, v => ent(v) && v > 0);
  }
  if (w === 1){
    const ans = 7 * k - t;
    const q = `${deb} Le dessus de la tour montre ${t}. Quelle est la somme des nombres de toutes les faces cachées, c'est-à-dire la face posée sur la table et les faces collées entre deux dés ?`;
    const expl = `Les faces cachées vont par paires de faces opposées : chaque dé, sauf celui du haut, cache son dessus et son dessous. Les ${k - 1} dé${k > 2 ? 's' : ''} du bas cache${k > 2 ? 'nt' : ''} donc ${k - 1} × 7 = ${7 * (k - 1)}. Le dé du haut ne cache que son dessous, opposé au ${t} : 7 − ${t} = ${7 - t}. Total : ${7 * (k - 1)} + ${7 - t} = ${ans}. Piège : ${7 * k} oublie que le dessus de la tour est visible.`;
    return Q(q, ans, [7 * k, 7 * (k - 1) + t, 7 * k + t, 7 * (k - 1)], entier, i => ans + sg(i), expl, v => ent(v) && v > 0);
  }
  const S = 14 * k + t;
  const q = `${deb} ${cache} La somme des nombres de toutes les faces visibles vaut ${S}. Quel nombre montre le dessus de la tour ?`;
  const expl = `Sur chaque dé, les quatre faces de côté forment deux paires de faces opposées, donc leur somme ne dépend pas de la façon dont le dé est tourné. Elle vaut toujours 7 + 7 = 14 : les ${k} dés montrent donc ${k} × 14 = ${14 * k} sur leurs côtés, et le reste vient du dessus : ${S} − ${14 * k} = ${t}. Piège : ${7 - t} est la face du dessous du dé du haut, opposée au dessus.`;
  return Q(q, t, [7 - t, (S - 21 * k + 7 >= 1 && S - 21 * k + 7 <= 6) ? S - 21 * k + 7 : null, t + 1, t - 1], entier, i => ((t - 1 + i) % 6) + 1, expl, okFace(0));
}

/* 3d · Niveau d'eau qui monte quand on plonge des cubes. */
const EAU = (function(){
  const L = [], D = [20, 25, 30, 40, 50, 60, 80, 100];
  for (const Lg of D) for (const lg of D) if (lg <= Lg) for (const a of [4, 5, 6, 8, 10, 12, 15, 20]){
    if (2 * a > lg) continue;
    const h10 = c3(a) * 10 / (Lg * lg);
    if (!ent(h10) || h10 < 1 || h10 > 80) continue;
    L.push([Lg, lg, a, h10 / 10]);
  }
  return L;
})();
const EAUN = (function(){
  const L = [], D = [20, 25, 30, 40, 50, 60, 80, 100];
  for (const Lg of D) for (const lg of D) if (lg <= Lg) for (const a of [5, 10, 20]) for (let H = 1; H <= 6; H++){
    if (2 * a > lg) continue;
    const N = H * Lg * lg / c3(a);
    if (ent(N) && N >= 2 && N <= 30) L.push([Lg, lg, a, H, N]);
  }
  return L;
})();
function s3eau(R){
  const recip = R.pick(['Un aquarium', 'Un bac en verre', 'Un récipient']);
  if (R.int(0, 2) > 0){
    const [L, l, a, h] = R.pick(EAU), V = c3(a), S = L * l;
    const q = `${recip} a un fond rectangulaire de ${L} cm sur ${l} cm et contient de l'eau. On y plonge un cube plein de ${a} cm d'arête, qui coule au fond et se retrouve entièrement sous l'eau. De combien le niveau de l'eau monte-t-il ?`;
    const expl = `Le cube chasse un volume d'eau égal à son propre volume, et ce volume se répartit sur toute la surface du fond. Volume du cube : ${a} × ${a} × ${a} = ${nb(V)} cm³. Surface du fond : ${L} × ${l} = ${nb(S)} cm². Le niveau monte de ${nb(V)} ÷ ${nb(S)} = ${nb(h, 1)} cm. ` + (a === h * 10
      ? `Piège : ${a} cm reviendrait à croire que l'eau monte de la hauteur du cube (c'est aussi une erreur de virgule), et ${nb(h / 10, 2)} cm vient d'une erreur de virgule dans l'autre sens.`
      : `Piège : ${a} cm reviendrait à croire que l'eau monte de la hauteur du cube, et ${nb(h * 10, 1)} cm ou ${nb(h / 10, 2)} cm viennent d'une erreur de virgule.`);
    return Q(q, h, [h * 10, h / 10, a, 2 * h], v => nb(v, 2) + ' cm', i => h + sg(i) * 0.5, expl, v => v > 0 && ent(v * 100));
  }
  const [L, l, a, H, N] = R.pick(EAUN), V = c3(a), S = L * l;
  const q = `${recip} a un fond rectangulaire de ${L} cm sur ${l} cm et contient de l'eau. Combien de cubes pleins de ${a} cm d'arête faut-il y plonger (entièrement sous l'eau) pour que le niveau monte de ${H} cm ?`;
  const expl = `Le volume d'eau à faire monter doit être égal au volume total des cubes plongés. Il faut faire monter ${L} × ${l} × ${H} = ${nb(S * H)} cm³ d'eau, et chaque cube en déplace ${a} × ${a} × ${a} = ${nb(V)} cm³ : ${nb(S * H)} ÷ ${nb(V)} = ${N} cubes. Piège : ${nb(S * H / (a * a))} divise par l'aire d'une face (${a * a} cm²) au lieu du volume du cube.`;
  return Q(q, N, [S * H / (a * a), 2 * N, N / 2], entier, i => N + sg(i), expl, v => ent(v) && v > 0);
}

/* 3e · Patron en croix (bande de quatre carrés et deux rabats). */
function s3patron(R){
  const i = R.int(1, 4), j = R.int(1, 4), C = ['A', 'B', 'C', 'D'];
  const X = R.pick(['A', 'B', 'C', 'D', 'E', 'F']);
  const OPP = {A: 'C', C: 'A', B: 'D', D: 'B', E: 'F', F: 'E'}, Y = OPP[X];
  const q = `On dessine un patron de cube : quatre carrés A, B, C et D placés les uns sous les autres, dans cet ordre de haut en bas, puis un carré E collé à gauche de ${C[i - 1]} et un carré F collé à droite de ${C[j - 1]}. Une fois le patron plié en cube, quelle face est opposée à la face ${X} ?`;
  /* distracteurs : le carré le plus éloigné sur le dessin, puis ses voisins sur le dessin */
  const loin = {A: 'D', D: 'A', B: 'D', C: 'A', E: 'F', F: 'E'};
  const voisins = {A: ['B', 'D'], B: ['A', 'C'], C: ['B', 'D'], D: ['C', 'A'], E: [C[i - 1]], F: [C[j - 1]]};
  const d = [loin[X], ...voisins[X], 'E', 'F', 'A', 'B', 'C', 'D'].filter(x => x !== X && x !== Y);
  const piege = (X === 'A' || X === 'D')
    ? ` Piège : ${X === 'A' ? 'D' : 'A'}, le carré le plus éloigné sur le dessin, n'est pas l'opposé : une fois la bande enroulée, A et D se touchent.`
    : (X === 'E' || X === 'F')
      ? ` Piège : ${X} touche ${X === 'E' ? C[i - 1] : C[j - 1]} sur le dessin, et une face qui en touche une autre ne peut pas lui être opposée.`
      : ` Piège : deux carrés qui se touchent sur le patron sont voisins sur le cube, jamais opposés.`;
  const expl = `La bande de quatre carrés s'enroule autour du cube : deux carrés de la bande séparés par un seul carré sont opposés, et les deux carrés collés de part et d'autre de la bande ferment le cube des deux côtés. Ici A est opposée à C, B à D, et E à F, où qu'ils soient collés le long de la bande. La face opposée à ${X} est donc ${Y}.` + piege;
  return Q(q, Y, d, String, () => null, expl);
}

/* 3f · Aire : retrait d'un petit cube, assemblage en L, plaque. */
function s3aire(R){
  const w = R.int(0, 2);
  if (w === 0){
    const n = R.int(3, 5), e = R.pick([1, 1, 2]), f = e * e, pos = R.int(0, 2);
    const ou = ['à un coin du grand cube', 'sur une arête du grand cube, mais pas à un coin', 'sur une face du grand cube, mais pas sur une arête'][pos];
    const vus = [3, 2, 1][pos], neuf = 6 - vus, delta = neuf - vus, base = 6 * n * n, ans = (base + delta) * f;
    const q = `Un grand cube de ${n} × ${n} × ${n} est formé de petits cubes de ${e} cm d'arête collés entre eux. On retire un seul petit cube, situé ${ou}. Quelle est l'aire totale de la surface du solide obtenu ?`;
    const expl = `Retirer un petit cube enlève les carrés de surface qu'il montrait, mais découvre ses autres faces, qui deviennent visibles au fond du trou. Au départ, l'aire vaut 6 × ${n}² = ${base} carrés de ${f} cm². Le petit cube retiré montrait ${vus} face${vus > 1 ? 's' : ''} et en découvre ${neuf} : l'aire ${delta === 0 ? 'ne change pas' : 'gagne ' + delta + ' carrés'}, soit ${base + delta} carrés de ${f} cm², c'est-à-dire ${nb(ans)} cm². Piège : ${nb((base - vus) * f)} cm² enlève les faces retirées sans compter celles qui apparaissent.`;
    return Q(q, ans, [(base - vus) * f, base * f === ans ? (base + 3) * f : base * f, (base + neuf) * f, e > 1 ? base + delta : null], unite('cm²'), i => ans + sg(i) * f, expl, v => ent(v) && v > 0);
  }
  if (w === 1){
    const p = R.int(2, 6), r = R.int(2, 6), k = p + r - 1, ans = 4 * k + 2;
    const q = `On colle des cubes de 1 cm d'arête face contre face pour former un L posé à plat : une rangée de ${p} cubes, et une seconde rangée de ${r} cubes, perpendiculaire, qui partage avec la première le cube du coin. Quelle est l'aire totale de la surface du L, dessous compris ?`;
    const expl = `Chaque contact entre deux cubes cache deux faces ; la forme de l'assemblage ne compte pas, seul compte le nombre de contacts. Le L compte ${p} + ${r} − 1 = ${k} cubes (le coin est partagé) et ${k - 1} contacts. Il reste 6 × ${k} − 2 × ${k - 1} = ${ans} faces visibles de 1 cm² : ${ans} cm². Piège : ${6 * k} cm² oublie les faces collées, et ${4 * (p + r) + 2} cm² compte deux fois le cube du coin.`;
    return Q(q, ans, [6 * k, 4 * (p + r) + 2, 5 * k + 1, 4 * k], unite('cm²'), i => ans + sg(i) * 2, expl, v => ent(v) && v > 0);
  }
  let a, b;
  do { a = R.int(2, 8); b = R.int(2, 8); } while (a > b || a * b < 6);
  const ans = 2 * a * b + 2 * (a + b);
  const q = `On pose ${a * b} cubes de 1 cm d'arête à plat, côte à côte, et on les colle pour former une plaque rectangulaire de ${a} cm sur ${b} cm, épaisse de 1 cm. Quelle est l'aire totale de la surface de la plaque, dessous compris ?`;
  const expl = `Une plaque d'une seule épaisseur se voit par le dessus, par le dessous et par son tour. Dessus et dessous : 2 × ${a} × ${b} = ${2 * a * b} cm². Tour : son périmètre, ${2 * (a + b)} cm, sur 1 cm de haut, soit ${2 * (a + b)} cm². Total : ${ans} cm². Piège : ${6 * a * b} cm² compte les six faces de chaque cube, même collées, et ${2 * a * b} cm² oublie le tour.`;
  return Q(q, ans, [6 * a * b, 2 * a * b, a * b + 2 * (a + b), 2 * a * b + 4 * (a + b)], unite('cm²'), i => ans + sg(i) * 2, expl, v => ent(v) && v > 0);
}

/* 3g · Probabilité de tirer un petit cube peint. */
const PROBA_Q = {
  3: 'qu\'il ait exactement trois faces peintes', 2: 'qu\'il ait exactement deux faces peintes',
  1: 'qu\'il ait exactement une face peinte', 0: 'qu\'il n\'ait aucune face peinte', u1: 'qu\'il ait au moins une face peinte'
};
function s3proba(R){
  const n = R.int(3, 5), k = R.pick([3, 2, 2, 1, 1, 0, 'u1']), m = n - 2, N = c3(n), cnt = nPeint(n, k);
  const ans = frac(cnt, N);
  const q = `${R.pick(PEINT)(n)} On choisit un des petits cubes au hasard. Quelle est la probabilité ${PROBA_Q[k]} ?`;
  const raison = {
    3: 'Ceux qui ont trois faces peintes sont les 8 coins.',
    2: `Ceux qui ont exactement deux faces peintes sont sur les 12 arêtes, coins exclus : 12 × ${m} = ${cnt}.`,
    1: `Ceux qui ont exactement une face peinte forment, sur chacune des 6 faces, un carré de ${m} × ${m} : 6 × ${m * m} = ${cnt}.`,
    0: `Ceux qui n'ont aucune face peinte forment le cube intérieur de ${m} × ${m} × ${m} = ${cnt}.`,
    u1: `Ceux qui ont au moins une face peinte sont tous sauf le cube intérieur de ${m}³ = ${c3(m)} : ${N} − ${c3(m)} = ${cnt}.`
  }[k];
  const brut = cnt + '/' + N, simpl = brut === ans ? '' : ' = ' + ans;
  const expl = `Tous les petits cubes ont la même chance d'être choisis : la probabilité est le nombre de petits cubes favorables divisé par le nombre total de petits cubes. Il y a ${n}³ = ${N} petits cubes. ${raison} Probabilité : ${brut}${simpl}. Piège : diviser par ${6 * n * n}, le nombre de carrés de la surface, au lieu du nombre de petits cubes.`;
  const F = (a, b) => (a > 0 && a < b) ? frac(a, b) : null;
  const faux = {3: [F(6, N), F(12, N)], 2: [F(12 * n, N), F(12 * (n - 1), N)], 1: [F(6 * n * n, N), F(m * m, N)], 0: [F(c3(n - 1), N), F(m * m, N)], u1: [F(c3(n - 1), N), F(N - c3(n - 1), N)]}[k];
  return Q(q, ans, [F(cnt, 6 * n * n), ...faux, F(nPeint(n, k === 1 ? 2 : 1), N)], String, i => F(cnt + i * (i % 2 ? 1 : -1), N) || F(cnt + i, N), expl);
}

/* =====================================================
   NIVEAU 4 · au-dessus des exemples officiels
   ===================================================== */

/* 4a · Cube peint sur une partie de ses faces. */
const PART = {
  A: { txt: n => `Un grand cube de ${n} × ${n} × ${n}, formé de petits cubes identiques, est posé sur une table. On peint le dessus et les quatre faces de côté, mais pas le dessous, puis on démonte le cube.`,
    v: n => ({0: (n - 2) * (n - 2) * (n - 1), 1: (n - 2) * (n - 2) + 4 * (n - 2) * (n - 1), 2: 4 * (n - 2) + 4 * (n - 1)}),
    d: n => { const m = n - 2; return {0: [c3(m), m * m * n, c3(n - 1)], 1: [5 * m * m, 6 * m * m, m * m + 4 * (n - 1) * (n - 1)], 2: [12 * m, 8 * m, 4 * m + 4 * n]}; } },
  B: { txt: n => `Un grand cube de ${n} × ${n} × ${n}, formé de petits cubes identiques, est posé sur une table. On peint seulement ses quatre faces de côté (ni le dessus, ni le dessous), puis on le démonte.`,
    v: n => ({0: (n - 2) * (n - 2) * n, 1: 4 * (n - 2) * n, 2: 4 * n}),
    d: n => { const m = n - 2; return {0: [c3(m), m * m * (n - 1), m * n * n], 1: [4 * m * m, 6 * m * m, 4 * n * n], 2: [4 * m, 12 * m, 4 * (n - 1)]}; } },
  D: { txt: n => `Un grand cube de ${n} × ${n} × ${n}, formé de petits cubes identiques, est posé sur le sol dans le coin d'une pièce, collé contre les deux murs. On peint les trois faces qui restent visibles (le dessus et les deux côtés libres), puis on le démonte.`,
    v: n => ({0: c3(n - 1), 1: 3 * (n - 1) * (n - 1), 2: 3 * (n - 1)}),
    d: n => { const m = n - 2; return {0: [c3(m), (n - 1) * (n - 1) * n, c3(n) - 3 * n * n], 1: [3 * n * n, 3 * m * m, 6 * m * m], 2: [3 * n, 3 * m, 12 * m]}; } },
  E: { txt: n => `Un grand cube de ${n} × ${n} × ${n}, formé de petits cubes identiques, est posé sur une table. On peint seulement deux faces qui ont une arête commune, le dessus et la face avant, puis on le démonte.`,
    v: n => ({0: n * (n - 1) * (n - 1), 1: 2 * n * (n - 1), 2: n}),
    d: n => { const m = n - 2; return {0: [c3(m), n * m * m, c3(n - 1)], 1: [2 * n * n, 2 * m * m, 6 * m * m], 2: [m, 12 * m, 2 * n]}; } },
  C: { txt: n => `Un grand cube de ${n} × ${n} × ${n}, formé de petits cubes identiques, est posé sur une table. On peint seulement deux faces opposées, le dessus et le dessous, puis on le démonte.`,
    v: n => ({0: n * n * (n - 2), 1: 2 * n * n}),
    d: n => { const m = n - 2; return {0: [c3(m), n * m * m, n * n * (n - 1)], 1: [2 * m * m, 6 * m * m, n * n]}; } }
};
function explPart(c, n, k, ans){
  const m = n - 2, n1 = n - 1;
  const T = {
    A: {
      0: `Les petits cubes sans peinture forment un pavé : on retire une couche sous le dessus et une couche derrière chacune des quatre faces de côté, mais aucune en dessous, puisque le dessous n'est pas peint. Ce pavé mesure ${m} × ${m} × ${n1} = ${nb(ans)}. Piège : ${m}³ = ${nb(c3(m))} applique la formule du cube peint sur ses six faces.`,
      1: `Un petit cube a une seule face peinte s'il touche une seule face peinte : on compte face par face en retirant les bords qui touchent une autre face peinte. Sur le dessus, on retire tout le contour : ${m} × ${m} = ${m * m}. Sur chaque face de côté, on retire les deux colonnes des bords et la rangée du haut, mais on garde la rangée du bas, car le dessous n'est pas peint : ${m} × ${n1} = ${m * n1}. Total : ${m * m} + 4 × ${m * n1} = ${nb(ans)}. Piège : 5 × ${m}² = ${nb(5 * m * m)} retire aussi la rangée du bas des faces de côté.`,
      2: `Un petit cube a exactement deux faces peintes s'il est sur une arête commune à deux faces peintes, sans toucher une troisième face peinte. Les 4 arêtes du dessus en donnent ${m} chacune (coins retirés). Les 4 arêtes verticales en donnent ${n1} chacune : on retire le coin du haut, qui a trois faces peintes, mais pas celui du bas, qui n'en a que deux. Les arêtes du bas ne comptent pas : leurs petits cubes ne touchent qu'une face peinte. Total : 4 × ${m} + 4 × ${n1} = ${nb(ans)}. Piège : 12 × ${m} = ${nb(12 * m)} est la formule du cube peint sur ses six faces.`
    },
    B: {
      0: `Les petits cubes sans peinture forment un pavé : on retire une couche derrière chacune des quatre faces de côté, mais rien en haut ni en bas, qui ne sont pas peints. Ce pavé mesure ${m} × ${m} × ${n} = ${nb(ans)}. Piège : ${m}³ = ${nb(c3(m))} retire aussi une couche en haut et en bas.`,
      1: `Un petit cube a une seule face peinte s'il est sur une face de côté sans être sur une arête verticale. Sur chaque face de côté, on retire les deux colonnes des bords, mais on garde toutes les rangées, car le dessus et le dessous ne sont pas peints : ${m} × ${n} = ${m * n}. Avec 4 faces : 4 × ${m * n} = ${nb(ans)}. Piège : 4 × ${m}² = ${nb(4 * m * m)} retire aussi les rangées du haut et du bas.`,
      2: `Un petit cube a deux faces peintes s'il est sur une arête où deux faces peintes se rencontrent : seules les 4 arêtes verticales conviennent. Chacune compte ${n} petits cubes, et aucun n'a trois faces peintes, puisque le dessus et le dessous ne sont pas peints. Total : 4 × ${n} = ${nb(ans)}. Piège : 4 × ${m} = ${4 * m} retire les coins par habitude, alors qu'ici ils n'ont que deux faces peintes.`
    },
    D: {
      0: `Les petits cubes sans peinture forment un cube : on retire une seule couche sous chacune des trois faces peintes, et rien du côté des murs ni du sol. Son arête mesure ${n} − 1 = ${n1}, donc ${n1} × ${n1} × ${n1} = ${nb(ans)}. Piège : ${m}³ = ${nb(c3(m))} retire une couche des deux côtés, comme si les six faces étaient peintes.`,
      1: `Un petit cube a une seule face peinte s'il est sur une face peinte sans être sur une arête commune avec une autre face peinte. Sur chaque face peinte, on retire la rangée et la colonne qui touchent les deux autres faces peintes ; les bords contre un mur ou le sol restent. Il reste ${n1} × ${n1} = ${n1 * n1} petits cubes par face, donc 3 × ${n1 * n1} = ${nb(ans)}. Piège : 6 × ${m}² = ${nb(6 * m * m)} est la formule du cube peint sur ses six faces.`,
      2: `Un petit cube a deux faces peintes s'il est sur une des trois arêtes communes à deux faces peintes, sans être au coin où les trois faces se rejoignent. Chacune de ces 3 arêtes porte ${n} petits cubes, dont ce coin : ${n} − 1 = ${n1} par arête, donc 3 × ${n1} = ${nb(ans)}. Piège : 3 × ${n} = ${3 * n} compte le coin commun, qui a trois faces peintes.`
    },
    E: {
      0: `Les petits cubes sans peinture forment un pavé : on retire une couche sous le dessus et une couche derrière la face avant, et rien ailleurs. Ce pavé mesure ${n} × ${n1} × ${n1} = ${nb(ans)}. Piège : ${m}³ = ${nb(c3(m))} applique la formule du cube peint sur ses six faces.`,
      1: `Un petit cube a une seule face peinte s'il est sur une des deux faces peintes sans être sur leur arête commune. Chaque face peinte compte ${n} × ${n} = ${n * n} petits cubes, dont ${n} sur l'arête commune : il en reste ${n * n} − ${n} = ${n * n1} par face, donc 2 × ${n * n1} = ${nb(ans)}. Piège : 2 × ${n}² = ${nb(2 * n * n)} compte l'arête commune avec les faces à une couleur.`,
      2: `Seuls les petits cubes de l'arête commune aux deux faces peintes touchent deux faces peintes. Cette arête porte ${n} petits cubes, et ses deux bouts ne touchent aucune autre face peinte, donc ${nb(ans)} petits cubes ont deux faces peintes. Piège : ${m} retire les coins par habitude, alors qu'ici ils n'ont que deux faces peintes.`
    },
    C: {
      0: `Les petits cubes sans peinture forment un pavé : on retire la couche du dessus et celle du dessous, et rien sur les côtés. Ce pavé mesure ${n} × ${n} × ${m} = ${nb(ans)}. Piège : ${m}³ = ${nb(c3(m))} retire aussi des couches sur les côtés, qui ne sont pas peints.`,
      1: `Les deux faces peintes sont opposées : aucun petit cube ne peut toucher les deux à la fois, donc tous les petits cubes de ces deux faces ont exactement une face peinte. Chaque face compte ${n} × ${n} = ${n * n} petits cubes, donc 2 × ${n * n} = ${nb(ans)}. Piège : 2 × ${m}² = ${nb(2 * m * m)} retire le contour par habitude, alors qu'ici le contour n'a qu'une face peinte.`
    }
  };
  return T[c][k];
}
function sPart(R, c, n, k){
  const P = PART[c], ans = P.v(n)[k], N = c3(n);
  const q = P.txt(n) + ' ' + QP[k];
  return Q(q, ans, P.d(n)[k], entier, i => ans + sg(i) * 2, explPart(c, n, k, ans), v => ent(v) && v > 0 && v <= N);
}
function s4partiel(R){
  const c = R.pick(['A', 'A', 'B', 'D', 'D', 'E', 'C']), n = R.int(3, 7);
  return sPart(R, c, n, c === 'C' ? R.int(0, 1) : R.int(0, 2));
}

/* 4b et 5f · Dé qui bascule. État : dessus T, avant F (tourné vers toi), droite D. */
const MV = {
  d: { t: 'vers la droite', def: 'basculer vers la droite pose sur la table la face qui était à droite', f: s => ({T: 7 - s.D, F: s.F, D: s.T}),
    regle: 'vers la droite, l\'ancienne face de gauche (7 moins la droite) monte sur le dessus et l\'ancien dessus passe à droite' },
  g: { t: 'vers la gauche', def: 'basculer vers la gauche pose sur la table la face qui était à gauche', f: s => ({T: s.D, F: s.F, D: 7 - s.T}),
    regle: 'vers la gauche, l\'ancienne face de droite monte sur le dessus et l\'ancien dessous (7 moins le dessus) passe à droite' },
  v: { t: 'vers toi', def: 'basculer vers toi pose sur la table la face qui était tournée vers toi', f: s => ({T: 7 - s.F, F: s.T, D: s.D}),
    regle: 'vers toi, l\'ancienne face de derrière (7 moins l\'avant) monte sur le dessus et l\'ancien dessus passe devant' },
  l: { t: 'loin de toi', def: 'basculer loin de toi pose sur la table la face qui était derrière', f: s => ({T: s.F, F: 7 - s.T, D: s.D}),
    regle: 'loin de toi, l\'ancienne face avant monte sur le dessus et l\'ancien dessous (7 moins le dessus) passe devant' }
};
const INV = {d: 'g', g: 'd', v: 'l', l: 'v'};
const rouler = (s, L) => L.reduce((e, x) => MV[x].f(e), s);
function sRoule(R, nMv, demande){
  const [T, F, D] = troisFaces(R), s0 = {T, F, D};
  const h = R.pick(['d', 'g']), p = R.pick(['v', 'l']);
  let L;
  do { L = []; for (let i = 0; i < nMv; i++) L.push(R.pick([h, p])); } while (L.every(x => x === L[0]));
  const types = [h, p].filter(x => L.indexOf(x) >= 0);
  const fin = rouler(s0, L), inv = rouler(s0, L.map(x => INV[x])), avant = rouler(s0, L.slice(0, -1));
  const lit = e => demande === 'T' ? e.T : demande === 'F' ? e.F : 7 - e.T;
  const ans = lit(fin);
  const qFin = {T: 'Quel nombre lit-on maintenant sur le dessus ?', F: 'Quel nombre lit-on maintenant sur la face tournée vers toi ?', B: 'Quel nombre est maintenant sur la face posée contre la table ?'}[demande];
  const q = `Un dé ordinaire est posé sur une table : le dessus montre ${T}, la face tournée vers toi montre ${F} et la face de droite montre ${D}. On le fait basculer ${nMv} fois d'un quart de tour sur une arête du bas : ${L.map(x => MV[x].t).join(', puis ')}. (${types.map(x => MV[x].def).join(' ; ').replace(/^b/, 'B')}.) ${qFin}`;
  let e = s0;
  const etapes = [`Départ : dessus ${T}, avant ${F}, droite ${D}.`];
  L.forEach(x => { e = MV[x].f(e); etapes.push(`Après « ${MV[x].t} » : dessus ${e.T}, avant ${e.F}, droite ${e.D}.`); });
  const nom = {T: 'sur le dessus', F: 'sur la face tournée vers toi', B: 'sur la face posée contre la table (7 moins le dessus)'}[demande];
  const pi = lit(inv) !== ans ? ` Piège : basculer chaque fois dans le mauvais sens donne ${lit(inv)}.` : '';
  const expl = `On suit le dé basculement après basculement en notant trois faces, le dessus, l'avant (tourné vers toi) et la droite ; les trois autres s'en déduisent, car deux faces opposées font 7. Règles : ${types.map(x => MV[x].regle).join(' ; ')}. ${etapes.join(' ')} On lit donc ${ans} ${nom}.` + pi;
  const autres = demande === 'T' ? [lit(inv), lit(avant), 7 - ans, T] : demande === 'F' ? [lit(inv), fin.T, 7 - ans, F] : [lit(inv), fin.T, lit(avant), 7 - T];
  return Q(q, ans, autres, entier, i => ((ans - 1 + i) % 6) + 1, expl, okFace(0));
}
function s4roule(R){ return sRoule(R, 3, 'T'); }
function s5roule(R){ return sRoule(R, R.int(4, 5), R.pick(['T', 'T', 'F', 'B'])); }

/* 4c · Tunnels 1 × 1 par le centre. */
function s4tunnel(R){
  const n = R.pick([3, 5, 5, 7, 9]), dirs = R.int(0, 2) ? 3 : 2, N = c3(n);
  const ret = dirs === 3 ? 3 * n - 2 : 2 * n - 1, ans = N - ret;
  const sens = dirs === 3 ? 'trois tunnels droits, un de l\'avant vers l\'arrière, un de gauche à droite et un de haut en bas' : 'deux tunnels droits, un de l\'avant vers l\'arrière et un de gauche à droite';
  const q = `Un grand cube de ${n} × ${n} × ${n} est formé de ${nb(N)} petits cubes. On perce ${sens}. Chaque tunnel a la largeur d'un petit cube, traverse le grand cube de part en part et passe par son petit cube central. Combien de petits cubes reste-t-il ?`;
  const expl = `Chaque tunnel retire une rangée complète de petits cubes, mais tous les tunnels passent par le même petit cube central, qu'il ne faut retirer qu'une fois. Chaque tunnel compte ${n} petits cubes ; dans ${dirs} × ${n} = ${dirs * n}, le cube central est compté ${dirs} fois : on retire donc ${dirs * n} − ${dirs - 1} = ${ret} petits cubes, et il en reste ${nb(N)} − ${ret} = ${nb(ans)}. Piège : ${nb(N - dirs * n)} retire plusieurs fois le cube central, et ${ret} est le nombre de cubes retirés, pas celui qui reste.`;
  return Q(q, ans, [N - dirs * n, ret, N - dirs * (n - 1)], entier, i => ans + sg(i), expl, v => ent(v) && v > 0);
}

/* 4d · Patron quelconque, décrit ligne par ligne (11 patrons, toutes positions). */
const ROULE = {   // état [dessous, dessus, nord, sud, est, ouest] après avoir roulé d'une case
  E: s => [s[4], s[5], s[2], s[3], s[1], s[0]],
  O: s => [s[5], s[4], s[2], s[3], s[0], s[1]],
  N: s => [s[2], s[3], s[1], s[0], s[4], s[5]],
  S: s => [s[3], s[2], s[0], s[1], s[4], s[5]]
};
function plier(cells){
  const key = (r, c) => r + ',' + c, idx = new Map(cells.map((p, i) => [key(p[0], p[1]), i]));
  const face = cells.map(() => -1), etat = cells.map(() => null);
  face[0] = 0; etat[0] = [0, 1, 2, 3, 4, 5];
  const pile = [0], DIR = [['E', 0, 1], ['O', 0, -1], ['N', -1, 0], ['S', 1, 0]];
  while (pile.length){
    const i = pile.pop(), r = cells[i][0], c = cells[i][1];
    for (const [d, dr, dc] of DIR){
      const j = idx.get(key(r + dr, c + dc));
      if (j === undefined) continue;
      const e = ROULE[d](etat[i]);
      if (face[j] === -1){ face[j] = e[0]; etat[j] = e; pile.push(j); }
      else if (face[j] !== e[0]) return null;
    }
  }
  return new Set(face).size === 6 ? face : null;
}
const PATRONS = (function(){
  const norme = P => { const r0 = Math.min(...P.map(p => p[0])), c0 = Math.min(...P.map(p => p[1])); return P.map(p => [p[0] - r0, p[1] - c0]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  const cle = P => P.map(p => p.join(',')).join(';');
  let niveau = new Map([['0,0', [[0, 0]]]]);
  for (let t = 2; t <= 6; t++){
    const suiv = new Map();
    niveau.forEach(P => {
      const occ = new Set(P.map(p => p.join(',')));
      P.forEach(p => [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(d => {
        const np = [p[0] + d[0], p[1] + d[1]];
        if (occ.has(np.join(','))) return;
        const Pn = norme(P.concat([np])), k = cle(Pn);
        if (!suiv.has(k)) suiv.set(k, Pn);
      }));
    });
    niveau = suiv;
  }
  const L = [];
  niveau.forEach(P => { const f = plier(P); if (f) L.push({cells: P, face: f}); });
  return L;
})();
const LET = ['A', 'B', 'C', 'D', 'E', 'F'];
/* Justification d'une paire opposée : deux carrés collés de part et d'autre d'une même bande droite. */
function bande(cells, i, j){
  const has = (r, c) => cells.some(p => p[0] === r && p[1] === c);
  const nomme = L => L.map(p => LET[cells.findIndex(x => x[0] === p[0] && x[1] === p[1])]);
  for (const [a, b] of [[i, j], [j, i]]){
    const [ra, ca] = cells[a], [rb, cb] = cells[b];
    if (cb - ca === 2){                                        // bande verticale en colonne ca + 1
      const c = ca + 1, r1 = Math.min(ra, rb), r2 = Math.max(ra, rb);
      let ok = true; const L = [];
      for (let r = r1; r <= r2; r++){ if (!has(r, c)){ ok = false; break; } L.push([r, c]); }
      if (ok) return nomme(L);
    }
    if (rb - ra === 2){                                        // bande horizontale en ligne ra + 1
      const r = ra + 1, c1 = Math.min(ca, cb), c2 = Math.max(ca, cb);
      let ok = true; const L = [];
      for (let c = c1; c <= c2; c++){ if (!has(r, c)){ ok = false; break; } L.push([r, c]); }
      if (ok) return nomme(L);
    }
  }
  return null;
}
function s4patron(R){
  const P = R.pick(PATRONS), cells = P.cells, face = P.face;
  const x = R.int(0, 5), y = face.indexOf(face[x] ^ 1);
  const nR = cells[cells.length - 1][0] + 1;
  const lignes = [];
  for (let r = 0; r < nR; r++){
    const L = cells.map((p, i) => [p, i]).filter(t => t[0][0] === r).map(t => `${LET[t[1]]} en colonne ${t[0][1] + 1}`);
    lignes.push(`- ligne ${r + 1}${r === 0 ? ' (en haut)' : r === nR - 1 ? ' (en bas)' : ''} : ${L.join(', ')}`);
  }
  const q = `Sur un quadrillage, on a dessiné le patron d'un cube : six carrés notés de A à F. Les lignes sont numérotées de haut en bas et les colonnes de gauche à droite.\n${lignes.join('\n')}\nUne fois le patron plié en cube, quelle face est opposée à la face ${LET[x]} ?`;
  const paires = [];
  for (let i = 0; i < 6; i++){ const j = face.indexOf(face[i] ^ 1); if (i < j) paires.push(LET[i] + ' et ' + LET[j]); }
  const b = bande(cells, x, y);
  const pourquoi = b
    ? (b.length === 1 ? `${LET[x]} et ${LET[y]} sont aux deux bouts d'une rangée de trois carrés alignés (${LET[x]}, ${b[0]}, ${LET[y]}) : en pliant, ${b[0]} forme une face et ses deux voisins se replient face à face.`
                      : `${LET[x]} et ${LET[y]} sont collés de part et d'autre de la bande droite ${b.join(', ')}, l'un d'un côté, l'autre de l'autre : quand la bande s'enroule, ils ferment le cube des deux côtés opposés.`)
    : `En pliant pas à pas à partir de ${LET[x]}, on voit que ${LET[y]} vient se placer en face.`;
  const dist = (i, j) => Math.abs(cells[i][0] - cells[j][0]) + Math.abs(cells[i][1] - cells[j][1]);
  const autres = [0, 1, 2, 3, 4, 5].filter(i => i !== x && i !== y).sort((i, j) => dist(x, j) - dist(x, i));
  /* piège : le carré le plus éloigné sur le dessin, seulement s'il n'est pas la bonne réponse */
  const dMax = Math.max(...[0, 1, 2, 3, 4, 5].filter(i => i !== x).map(i => dist(x, i)));
  const loins = autres.filter(i => dist(x, i) === dMax);
  const piege = dist(x, y) === dMax || !loins.length
    ? `Piège : deux carrés qui se touchent sur le patron ne sont jamais opposés, et la distance sur le dessin ne suffit pas : repère la bande.`
    : `Piège : ${LET[loins[0]]}, ${loins.length > 1 ? 'un des carrés les plus éloignés' : 'le carré le plus éloigné'} de ${LET[x]} sur le dessin, n'est pas la face opposée ; et deux carrés qui se touchent sur le patron ne le sont jamais.`;
  const expl = `Repère les rangées droites de carrés : deux carrés sont opposés s'ils sont aux deux bouts d'une rangée de trois carrés alignés, ou plus généralement s'ils sont collés de part et d'autre d'une même bande droite, l'un d'un côté et l'autre de l'autre. Dessine le patron sur ta feuille : ${pourquoi} Les trois paires de faces opposées sont ${paires.join(', ')}. La face opposée à ${LET[x]} est donc ${LET[y]}. ${piege}`;
  return Q(q, LET[y], autres.map(i => LET[i]), String, () => null, expl);
}

/* 4e · Cube posé dans un coin : petits cubes visibles ou cachés. */
function s4coin(R){
  const n = R.int(3, 10), w = R.int(0, 2), N = c3(n), cache = c3(n - 1);
  if (w <= 1){
    const ans = N - cache;
    const q = w === 0
      ? `Un grand cube de ${n} × ${n} × ${n}, formé de petits cubes, est posé sur le sol dans le coin d'une pièce, collé contre les deux murs. Combien de petits cubes touchent le sol ou au moins un des deux murs ?`
      : `Un grand cube de ${n} × ${n} × ${n} est formé de petits cubes. On le regarde de façon à voir trois de ses faces : le dessus, l'avant et la droite. Combien de petits cubes voit-on, au moins en partie ?`;
    const expl = `Le plus simple est de compter le contraire : les petits cubes ${w === 0 ? 'qui ne touchent ni le sol ni les murs' : 'invisibles'} forment un cube plus petit, avec une couche de moins, dans le coin opposé. Son arête vaut ${n} − 1 = ${n - 1}, et il y en a ${n - 1}³ = ${nb(cache)}, donc ${nb(N)} − ${nb(cache)} = ${nb(ans)}. Piège : 3 × ${n}² = ${nb(3 * n * n)} compte deux fois les petits cubes des arêtes communes et trois fois celui du coin commun.`;
    return Q(q, ans, [3 * n * n, 3 * n * n - 3 * n, N - c3(n - 2), cache], entier, i => ans + sg(i) * 2, expl, v => ent(v) && v > 0 && v <= N);
  }
  const ans = cache;
  const q = `Un grand cube de ${n} × ${n} × ${n}, formé de petits cubes, est posé sur le sol dans le coin d'une pièce, collé contre les deux murs. Combien de petits cubes ne touchent ni le sol ni aucun des deux murs ?`;
  const expl = `On retire une seule couche de petits cubes du côté du sol et du côté de chaque mur : ce qui reste est un cube dont l'arête a perdu 1. Il mesure ${n - 1} × ${n - 1} × ${n - 1} = ${nb(ans)}. Piège : (${n} − 2)³ = ${nb(c3(n - 2))} retire une couche des deux côtés, comme pour un cube peint sur ses six faces.`;
  return Q(q, ans, [c3(n - 2), N - 3 * n * n > 0 ? N - 3 * n * n : null, N - ans, (n - 1) * (n - 1) * n], entier, i => ans + sg(i) * 2, expl, v => ent(v) && v > 0 && v <= N);
}

/* 4f et 5a · Pavé peint. */
function pave(R){
  let a, b, c;
  do { a = R.int(3, 8); b = R.int(3, 8); c = R.int(3, 8); } while (a === b && b === c || a > b || b > c);
  return R.shuffle([a, b, c]);
}
const PAVE = [
  (a, b, c) => `Un pavé de ${a} × ${b} × ${c} est formé de ${nb(a * b * c)} petits cubes identiques. On peint toute sa surface extérieure, puis on le démonte.`,
  (a, b, c) => `On empile ${nb(a * b * c)} petits cubes de bois pour former un pavé de ${a} petits cubes de long, ${b} de large et ${c} de haut. On le plonge entièrement dans la peinture, puis on le démonte.`
];
function s4box(R){
  const [a, b, c] = pave(R), k = R.int(0, 1) ? 2 : 0, N = a * b * c;
  const q = R.pick(PAVE)(a, b, c) + ' ' + QP[k];
  if (k === 0){
    const ans = (a - 2) * (b - 2) * (c - 2);
    const expl = `Les petits cubes sans peinture forment un pavé intérieur, obtenu en retirant une couche sous chacune des six faces. Chaque dimension perd 2 : il mesure ${a - 2} × ${b - 2} × ${c - 2} = ${nb(ans)}. Piège : ${a - 1} × ${b - 1} × ${c - 1} = ${nb((a - 1) * (b - 1) * (c - 1))} ne retire la couche que d'un côté.`;
    return Q(q, ans, [(a - 1) * (b - 1) * (c - 1), N - 2 * (a * b + b * c + a * c) > 0 ? N - 2 * (a * b + b * c + a * c) : null, (a - 2) * (b - 2) * c], entier, i => ans + sg(i) * 2, expl, v => ent(v) && v > 0 && v <= N);
  }
  const ans = 4 * ((a - 2) + (b - 2) + (c - 2));
  const expl = `Un petit cube a exactement deux faces peintes s'il est sur une arête du pavé, sans être à un coin. Le pavé a 4 arêtes de ${a} petits cubes, 4 de ${b} et 4 de ${c} ; sans les deux coins, chacune perd 2. Total : 4 × ${a - 2} + 4 × ${b - 2} + 4 × ${c - 2} = ${ans}. Piège : 4 × (${a} + ${b} + ${c}) = ${4 * (a + b + c)} compte aussi les coins, et 2 × ${(a - 2) + (b - 2) + (c - 2)} = ${2 * (a + b + c - 6)} oublie que chaque longueur d'arête existe en 4 exemplaires.`;
  return Q(q, ans, [4 * (a + b + c), 2 * (a + b + c - 6), 4 * (a + b + c) - 8], entier, i => ans + sg(i) * 4, expl, v => ent(v) && v > 0 && v <= N);
}
function s5box(R){
  const [a, b, c] = pave(R), N = a * b * c;
  const ab = (a - 2) * (b - 2), ac = (a - 2) * (c - 2), bc = (b - 2) * (c - 2), surf = 2 * (a * b + a * c + b * c);
  if (R.int(0, 2)){
    const q = R.pick(PAVE)(a, b, c) + ' ' + QP[1];
    const ans = 2 * (ab + ac + bc);
    const expl = `Un petit cube a exactement une face peinte s'il est sur une face du pavé sans toucher d'arête : sur chaque face, on retire le contour, et chaque sorte de face existe en deux exemplaires. Faces de ${a} × ${b} : 2 × ${a - 2} × ${b - 2} = ${2 * ab}. Faces de ${a} × ${c} : 2 × ${a - 2} × ${c - 2} = ${2 * ac}. Faces de ${b} × ${c} : 2 × ${b - 2} × ${c - 2} = ${2 * bc}. Total : ${nb(ans)}. Piège : ${nb(ans / 2)} oublie que chaque sorte de face existe en deux exemplaires` + (surf < N ? `, et ${nb(surf)} compte tous les carrés de la surface.` : '.');
    return Q(q, ans, [ans / 2, surf < N ? surf : null, 2 * ((a - 1) * (b - 1) + (a - 1) * (c - 1) + (b - 1) * (c - 1))], entier, i => ans + sg(i) * 2, expl, v => ent(v) && v > 0 && v <= N);
  }
  const q = R.pick(PAVE)(a, b, c) + ' ' + QP.u1;
  const inner = (a - 2) * (b - 2) * (c - 2), ans = N - inner;
  const expl = `Le plus rapide est de compter le contraire : les petits cubes sans aucune peinture forment le pavé intérieur. Chaque dimension a perdu 2 : il mesure ${a - 2} × ${b - 2} × ${c - 2} = ${nb(inner)}, et le pavé entier contient ${a} × ${b} × ${c} = ${nb(N)} petits cubes : ${nb(N)} − ${nb(inner)} = ${nb(ans)} ont au moins une face peinte. Piège : ` + (surf < N ? `${nb(surf)} compte des carrés de surface, et les petits cubes des arêtes y sont comptés plusieurs fois.` : `compter les carrés de la surface (${nb(surf)}) compterait plusieurs fois les petits cubes des arêtes.`);
  return Q(q, ans, [surf < N ? surf : null, N - (a - 1) * (b - 1) * (c - 1), inner], entier, i => ans + sg(i) * 2, expl, v => ent(v) && v > 0 && v <= N);
}

/* 4g et 5e · Bloc de dés posé sur une table : plus petite (ou plus grande) somme visible. */
function blocDes(a, b, c){
  let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
  for (let x = 1; x <= a; x++) for (let y = 1; y <= b; y++) for (let z = 1; z <= c; z++){
    const v = (z === c ? 1 : 0) + (x === 1 || x === a ? 1 : 0) + (y === 1 || y === b ? 1 : 0);
    if (v === 0) n0++; else if (v === 1) n1++; else if (v === 2) n2++; else n3++;
  }
  return {n0, n1, n2, n3, S: n1 + 2 * n2 + 3 * n3};
}
function sDes(R, dims, max){
  const [a, b, c] = dims, N = a * b * c, B = blocDes(a, b, c);
  const ans = max ? 6 * B.n1 + 11 * B.n2 + 15 * B.n3 : B.n1 + 3 * B.n2 + 6 * B.n3;
  const q = `On assemble ${N} dés ordinaires (deux faces opposées font toujours 7) en un bloc de ${a} dés de long, ${b} dés de large et ${c} dé${c > 1 ? 's' : ''} de haut, posé sur une table. On additionne les points de toutes les faces visibles : le dessus du bloc et ses quatre côtés. En tournant chaque dé comme on veut, quelle est la ${max ? 'plus grande' : 'plus petite'} somme possible ?`;
  const cache = B.n0 ? ` Les ${B.n0} autres dés sont entièrement cachés.` : '';
  const parts = [[B.n3, 'trois faces'], [B.n2, 'deux faces'], [B.n1, 'une seule face']].filter(t => t[0] > 0).map(t => `${t[0]} dé${t[0] > 1 ? 's' : ''} montre${t[0] > 1 ? 'nt' : ''} ${t[1]}`);
  const desc = 'Ici ' + (parts.length > 1 ? parts.slice(0, -1).join(', ') + ' et ' + parts[parts.length - 1] : parts[0]) + '.';
  const tot = max ? somme([[B.n3, 15], [B.n2, 11], [B.n1, 6]]) : somme([[B.n3, 6], [B.n2, 3], [B.n1, 1]]);
  const expl = max
    ? `Chaque dé se tourne indépendamment des autres : on place les plus grands nombres sur ses faces visibles, en sachant que les faces visibles d'un même dé se touchent et ne sont donc jamais opposées. Un dé dont on voit une face montre au mieux 6 ; deux faces, au mieux 6 + 5 = 11 ; trois faces (un coin du dessus), au mieux 6 + 5 + 4 = 15. ${desc}${cache} Total : ${tot} = ${nb(ans)}. Piège : ${nb(6 * B.S)} suppose un 6 sur chaque face visible, impossible sur deux faces voisines d'un même dé.`
    : `Chaque dé se tourne indépendamment des autres : on place les plus petits nombres sur ses faces visibles, en sachant que les faces visibles d'un même dé se touchent et ne sont donc jamais opposées. Un dé dont on voit une face montre au mieux 1 ; deux faces, au mieux 1 + 2 = 3 ; trois faces (un coin du dessus), au mieux 1 + 2 + 3 = 6. ${desc}${cache} Total : ${tot} = ${nb(ans)}. Piège : ${nb(B.S)} suppose un 1 sur chaque face visible, impossible sur deux faces voisines d'un même dé.`;
  const autres = max ? [6 * B.S, 6 * B.n1 + 11 * (B.n2 + B.n3)] : [B.S, B.n1 + 3 * (B.n2 + B.n3)];
  return Q(q, ans, autres, entier, i => ans + sg(i) * 2, expl, v => ent(v) && v > 0);
}
function s4des(R){
  const d = R.pick([[2, 2, 1], [2, 3, 1], [3, 2, 1], [2, 2, 2], [3, 3, 1], [2, 4, 1]]);
  return sDes(R, d, false);
}
function s5des(R){
  const d = R.pick([[3, 3, 2], [2, 3, 2], [3, 3, 3], [2, 2, 3], [3, 4, 1], [3, 4, 2], [4, 4, 1], [2, 4, 2], [2, 2, 2], [3, 3, 1]]);
  return sDes(R, d, R.int(0, 2) === 0);
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif
   ===================================================== */

/* 5b · Cube peint : un rapport entre deux catégories donne la taille. */
const CAT = {0: 'de petits cubes sans aucune face peinte', 1: 'de petits cubes avec exactement une face peinte', 2: 'de petits cubes avec exactement deux faces peintes', 3: 'de petits cubes avec trois faces peintes'};
const FORM = {0: 'm³', 1: '6 × m²', 2: '12 × m', 3: '8'};
const cntM = (k, m) => k === 0 ? c3(m) : k === 1 ? 6 * m * m : k === 2 ? 12 * m : 8;
const RAPPORTS = (function(){
  const L = [];
  for (const [x, y] of [[1, 0], [0, 1], [1, 2], [0, 2], [2, 3], [0, 3], [1, 3]]) for (const r of [1, 2, 3, 4, 5, 6, 8, 9, 12, 15, 27, 48, 64]){
    const sol = [];
    for (let m = 1; m <= 12; m++) if (cntM(x, m) === r * cntM(y, m)) sol.push(m);
    if (sol.length === 1 && sol[0] >= 2) L.push([x, y, r, sol[0]]);
  }
  return L;
})();
function s5ratio(R){
  const [x, y, r, m] = R.pick(RAPPORTS), n = m + 2;
  const rel = r === 1 ? `il y a autant ${CAT[x]} que ${CAT[y]}` : `il y a ${fois(r)} plus ${CAT[x]} que ${CAT[y]}`;
  const asks = ['n'];
  if (n <= 10) asks.push('N');
  if (x !== 2 && y !== 2) asks.push('c2');
  if (x !== 0 && y !== 0 && m <= 8) asks.push('c0');
  const ask = R.pick(asks);
  const qa = {n: 'Combien de petits cubes y a-t-il le long d\'une arête du grand cube ?', N: 'Combien de petits cubes forment le grand cube ?', c2: QP[2], c0: QP[0]}[ask];
  const ans = {n: n, N: c3(n), c2: 12 * m, c0: c3(m)}[ask];
  /* « toutes les sortes sont présentes » exclut le cube 2 × 2 × 2, où 0 = r × 0 vérifierait la condition. */
  const q = `${R.pick(PEINT_X)} On constate que toutes les sortes de petits cubes sont présentes (trois, deux, une ou aucune face peinte), et qu'${rel}. ${qa}`;
  const eq = `${FORM[x]} = ${r === 1 ? '' : r + ' × '}${FORM[y]}`;
  const fin = {n: '', N: `Le grand cube a ${n} petits cubes par arête, soit ${n} × ${n} × ${n} = ${nb(c3(n))} petits cubes.`, c2: `Il y a donc 12 × ${m} = ${12 * m} petits cubes à deux faces peintes.`, c0: `Il y a donc ${m} × ${m} × ${m} = ${nb(c3(m))} petits cubes sans peinture.`}[ask];
  const piege = {n: `Piège : ${m} oublie les deux coins de chaque arête.`, N: `Piège : ${nb(c3(m))} oublie les deux coins de chaque arête (on a pris n = m).`, c2: `Piège : 12 × ${n} = ${12 * n} compte aussi les coins.`, c0: `Piège : ${nb(c3(n))} compte tous les petits cubes.`}[ask];
  const expl = `On appelle m le nombre de petits cubes d'une arête qui ne sont pas des coins, puis on écrit chaque catégorie en fonction de m. Il y a 8 coins, 12 × m petits cubes à deux faces, 6 × m² à une face et m³ sans peinture. La condition s'écrit ${eq}, et le seul entier qui convient est m = ${m} (vérification : ${nb(cntM(x, m))} = ${r === 1 ? '' : r + ' × '}${nb(cntM(y, m))}). Chaque arête porte donc ${m} + 2 = ${n} petits cubes.${fin ? ' ' + fin : ''} ${piege}`;
  const autres = {n: [m, m + 1, n + 1, n + 2], N: [c3(m), c3(m + 1), c3(n + 1)], c2: [12 * n, 12 * (m + 1), 6 * m], c0: [c3(n), c3(m + 1), m * m]}[ask];
  return Q(q, ans, autres, entier, i => ans + sg(i) * (ask === 'n' ? 1 : 4), expl, v => ent(v) && v > 0);
}

/* 5c · Fourmi : plus court chemin sur la surface d'un pavé ou d'un cube. */
const FOURMI = (function(){
  const L = [];
  for (let s = 2; s <= 24; s++) for (let r = 2; r <= 24; r++){
    const d = Math.round(Math.sqrt(s * s + r * r));
    if (d * d !== s * s + r * r) continue;
    for (let p = 1; 2 * p <= s; p++){
      const q = s - p;
      if (q >= r) continue;
      L.push([p, q, r, d]);
    }
  }
  return L;
})();
function s5fourmi(R){
  if (R.int(0, 3) === 0){
    const a = R.pick([2, 3, 4, 5, 6, 10, 12]);
    const q = `Une fourmi se trouve à un sommet d'un cube plein de ${a} cm d'arête. Elle veut rejoindre le sommet opposé (le plus éloigné) en marchant uniquement sur les faces du cube. Quelle est la longueur du plus court chemin possible ?`;
    const ans = rac(5 * a * a) + ' cm';
    const expl = `On déplie les deux faces que traverse la fourmi pour les mettre à plat : le plus court chemin devient alors un segment, dont on calcule la longueur avec le théorème de Pythagore. Deux faces voisines dépliées forment un rectangle de ${2 * a} cm sur ${a} cm, et le chemin en est la diagonale : √(${2 * a}² + ${a}²) = √${5 * a * a} = ${ans}. Piège : ${rac(3 * a * a)} cm est la grande diagonale du cube, qui passe à l'intérieur ; la fourmi ne peut pas la suivre. Et ${a} + ${rac(2 * a * a)} cm (une diagonale de face puis une arête) est plus long, comme ${3 * a} cm (trois arêtes).`;
    return Q(q, ans, [rac(3 * a * a) + ' cm', a + ' + ' + rac(2 * a * a) + ' cm', 3 * a + ' cm', 2 * a + ' cm'], String, () => null, expl);
  }
  const [p, q2, r, d] = R.pick(FOURMI), dims = R.shuffle([p, q2, r]);
  const q = `Une fourmi se trouve à un sommet d'une boîte fermée en forme de pavé de ${dims[0]} cm × ${dims[1]} cm × ${dims[2]} cm. Elle veut rejoindre le sommet opposé (le plus éloigné) en marchant uniquement sur la surface de la boîte. Quelle est la longueur du plus court chemin possible ?`;
  const u2 = (p + r) * (p + r) + q2 * q2, u3 = (q2 + r) * (q2 + r) + p * p, diag = p * p + q2 * q2 + r * r;
  const expl = `On déplie les deux faces que traverse la fourmi pour les mettre à plat : le plus court chemin devient alors un segment, dont on calcule la longueur avec le théorème de Pythagore. Il y a trois dépliages possibles ; le meilleur met bout à bout les deux plus petites dimensions : un rectangle de ${p} + ${q2} = ${p + q2} cm sur ${r} cm, de diagonale √(${p + q2}² + ${r}²) = √${(p + q2) * (p + q2) + r * r} = ${d} cm. ${u2 === u3 ? `Les deux autres dépliages donnent tous les deux ${R2(u2)} cm, plus long.` : `Les deux autres dépliages donnent ${R2(u2)} cm et ${R2(u3)} cm, plus longs.`} Piège : ${R2(diag)} cm est la grande diagonale de la boîte, qui passe à l'intérieur ; la fourmi ne peut pas la suivre. Et ${p + q2 + r} cm (le long des arêtes) est plus long.`;
  return Q(q, d + ' cm', [rac(diag) + ' cm', p + q2 + r + ' cm', rac(u2) + ' cm', rac(u3) + ' cm'], String, () => null, expl);
}

/* 5d · Tunnels larges : inclusion-exclusion. */
function s5tunnel(R){
  const w = R.pick([1, 2, 3, 3]), n = R.pick({1: [7, 9, 11], 2: [4, 6, 8], 3: [5, 7, 9]}[w]), dirs = R.int(0, 3) ? 3 : 2, N = c3(n);
  const T = w * w * n, B = c3(w), ret = dirs * T - (dirs - 1) * B, ans = N - ret;
  const sens = dirs === 3 ? 'trois tunnels droits, dans les trois directions (de l\'avant vers l\'arrière, de gauche à droite et de haut en bas)' : 'deux tunnels droits, l\'un de l\'avant vers l\'arrière et l\'autre de gauche à droite';
  const sec = w === 1 ? 'de la largeur d\'un petit cube' : `de section carrée ${w} × ${w} (${w} petits cubes de large et ${w} de haut)`;
  const q = `Un grand cube de ${n} × ${n} × ${n} est formé de ${nb(N)} petits cubes. On perce ${sens}, ${sec}. Chaque tunnel traverse le grand cube de part en part et il est bien centré sur les deux faces qu'il relie. Combien de petits cubes reste-t-il ?`;
  const expl = `On compte les petits cubes retirés tunnel par tunnel, puis on corrige la partie commune, comptée plusieurs fois. Chaque tunnel contient ${w} × ${w} × ${n} = ${T} petits cubes. Les tunnels se croisent tous dans le même bloc central de ${w} × ${w} × ${w} = ${B} petit${B > 1 ? 's' : ''} cube${B > 1 ? 's' : ''}, compté ${dirs} fois au lieu d'une : on retire ${dirs} × ${T} − ${dirs - 1} × ${B} = ${ret} petits cubes. Il reste ${nb(N)} − ${ret} = ${nb(ans)}. Piège : ${nb(N - dirs * T)} oublie que le bloc central est compté plusieurs fois` + (dirs === 3 ? `, et ${nb(N - dirs * T + 3 * B)} enlève trop de croisements (il faut le compter une fois, pas zéro).` : '.');
  return Q(q, ans, [N - dirs * T, dirs === 3 ? N - dirs * T + 3 * B : N - dirs * T + 2 * B, ret], entier, i => ans + sg(i) * w, expl, v => ent(v) && v > 0);
}

/* 5g · Pavé posé sur la table, peint partout sauf dessous. */
function s5partiel(R){
  let a, b, c;
  do { a = R.int(3, 8); b = R.int(3, 8); c = R.int(3, 7); } while (a === b && b === c);
  const k = R.pick([0, 1, 1, 2]), N = a * b * c;
  const q = `Un pavé formé de ${nb(N)} petits cubes mesure ${a} petits cubes de long, ${b} de large et ${c} de haut. Il est posé sur une table, et on peint le dessus et les quatre faces de côté, mais pas le dessous, puis on le démonte. ${QP[k]}`;
  let ans, d, expl;
  const a2 = a - 2, b2 = b - 2, c1 = c - 1;
  if (k === 0){
    ans = a2 * b2 * c1;
    d = [a2 * b2 * (c - 2), (a - 1) * (b - 1) * c1, a2 * b2 * c];
    expl = `Les petits cubes sans peinture forment un pavé : on retire une couche derrière chaque face de côté et sous le dessus, mais aucune en dessous, puisque le dessous n'est pas peint. Ce pavé mesure ${a2} × ${b2} × ${c1} = ${nb(ans)}. Piège : ${a2} × ${b2} × ${c - 2} = ${nb(a2 * b2 * (c - 2))} retire aussi la couche du bas.`;
  } else if (k === 1){
    ans = a2 * b2 + 2 * a2 * c1 + 2 * b2 * c1;
    d = [a2 * b2 + 2 * a2 * (c - 2) + 2 * b2 * (c - 2), 2 * (a2 * b2 + a2 * (c - 2) + b2 * (c - 2)), a2 * b2 + a2 * c1 + b2 * c1];
    expl = `Un petit cube a une seule face peinte s'il touche une seule face peinte : sur chaque face peinte, on retire les bords communs avec une autre face peinte, mais on garde la rangée du bas, car le dessous n'est pas peint. Dessus : ${a2} × ${b2} = ${a2 * b2}. Les deux faces de côté de ${a} × ${c} : 2 × ${a2} × ${c1} = ${2 * a2 * c1}. Les deux faces de côté de ${b} × ${c} : 2 × ${b2} × ${c1} = ${2 * b2 * c1}. Total : ${nb(ans)}. Piège : ${nb(d[0])} retire aussi la rangée du bas des faces de côté, et ${nb(d[1])} est la réponse pour un pavé peint sur ses six faces.`;
  } else {
    ans = 2 * a2 + 2 * b2 + 4 * c1;
    d = [4 * (a2 + b2 + (c - 2)), 2 * a2 + 2 * b2 + 4 * (c - 2), 2 * a2 + 2 * b2 + 4 * c];
    expl = `Un petit cube a exactement deux faces peintes s'il est sur une arête commune à deux faces peintes, sans toucher une troisième face peinte. Arêtes du dessus : 2 × ${a2} + 2 × ${b2} = ${2 * a2 + 2 * b2} (coins retirés). Arêtes verticales : 4 × ${c1} = ${4 * c1}, car on retire le coin du haut (trois faces peintes) mais pas celui du bas (deux faces peintes seulement). Les arêtes du bas ne comptent pas : leurs petits cubes ne touchent qu'une face peinte. Total : ${nb(ans)}. Piège : ${nb(d[0])} est la réponse pour un pavé peint sur ses six faces.`;
  }
  return Q(q, ans, d, entier, i => ans + sg(i) * 2, expl, v => ent(v) && v > 0 && v <= N);
}

/* ---------- répartition par niveau ---------- */
const NIV = {
  1: [s1de, s1de, s1cube, s1k, s1pc],
  2: [s2peint, s2peint, s2vis, s2rempl, s2plus, s2barre, s2av],
  3: [s3peint, s3peint, s3inv, s3tour, s3eau, s3patron, s3aire, s3proba],
  4: [s4partiel, s4partiel, s4roule, s4tunnel, s4patron, s4coin, s4box, s4des],
  5: [s5box, s5ratio, s5fourmi, s5tunnel, s5des, s5roule, s5partiel]
};
/* Repli, jamais utilisé en pratique : une question simple et juste. */
function secours(){
  return { q: 'Sur un dé ordinaire à six faces, quel nombre est écrit sur la face opposée à celle du 2 ?', a: '5', accept: null, choix: ['5', '4', '3', '6'],
    expl: 'Sur un dé ordinaire, deux faces opposées ont toujours une somme égale à 7. La face opposée au 2 porte donc 7 − 2 = 5. Piège : 4 vient d\'une somme de 6 au lieu de 7.' };
}

A.push({
  id: 'alb-28-cubes-espace',
  phase: 'albert',
  ordre: 28,
  theme: 'geometrie',
  titre: 'Espace : cubes peints, dés, volumes',
  objectif: 'Compter sans dessin compliqué les petits cubes d\'un grand cube peint, raisonner sur les faces d\'un dé, plier un patron et passer des longueurs aux aires et aux volumes.',
  lecon:
`<p class="lede">Les questions d'espace du test se règlent presque toutes <mark>sans dessin en perspective</mark> : on classe les petits cubes selon leur position (coin, arête, face, intérieur), on se souvient que deux faces opposées d'un dé font 7, et on sait qu'un volume est multiplié par k³ quand les longueurs sont multipliées par k.</p>
<h2>Ce que le test te demande</h2>
<p>Ce type de question vient des concours de logique comme le Kangourou : un grand cube fait de petits cubes est peint puis démonté, et l'on te demande combien de petits cubes ont une, deux ou trois faces peintes ; un dé est posé, empilé ou basculé, et il faut retrouver une face cachée ; un patron doit être plié en pensée ; une boîte doit être remplie de cubes. Tout se fait sur papier, sans calculatrice, avec de petits nombres. Ce qui compte, c'est de compter avec méthode, sans oublier ni compter deux fois.</p>
<h2>Les prérequis, en bref</h2>
<table class="tbl">
<thead><tr><th>Objet</th><th>À savoir</th></tr></thead>
<tbody>
<tr><td>Cube</td><td>6 faces, 12 arêtes, 8 sommets</td></tr>
<tr><td>Cube d'arête a</td><td>volume a × a × a = a³ ; aire totale 6 × a²</td></tr>
<tr><td>Pavé</td><td>volume longueur × largeur × hauteur</td></tr>
<tr><td>Dé ordinaire</td><td>faces opposées : 1 et 6, 2 et 5, 3 et 4 (somme 7) ; total des six faces : 21</td></tr>
<tr><td>Contenance</td><td>1 L = 1 dm³ = 1 000 cm³</td></tr>
</tbody>
</table>
<div class="formule"><p>longueurs × k, donc aires × k² et volumes × k³</p></div>
<h2>La méthode en 4 étapes</h2>
<div class="etapes">
<p><strong>1. Je classe chaque petit cube par sa position :</strong> coin, arête (sans les coins), face (sans les arêtes) ou intérieur.</p>
<p><strong>2. Je compte chaque catégorie avec n − 2 :</strong> une arête de n petits cubes en a n − 2 qui ne sont pas des coins.</p>
<p><strong>3. Pour un dé, je raisonne par paires opposées :</strong> une face cachée vaut 7 moins la face visible opposée.</p>
<p><strong>4. Je vérifie avec le total :</strong> 8 + 12(n − 2) + 6(n − 2)² + (n − 2)³ doit redonner n³.</p>
</div>
<table class="tbl">
<thead><tr><th>Position</th><th>Faces peintes</th><th>Nombre</th><th>n = 4</th><th>n = 5</th></tr></thead>
<tbody>
<tr><td>Coin</td><td>3</td><td>8</td><td>8</td><td>8</td></tr>
<tr><td>Arête sans les coins</td><td>2</td><td>12 × (n − 2)</td><td>24</td><td>36</td></tr>
<tr><td>Face sans les arêtes</td><td>1</td><td>6 × (n − 2)²</td><td>24</td><td>54</td></tr>
<tr><td>Intérieur</td><td>0</td><td>(n − 2)³</td><td>8</td><td>27</td></tr>
</tbody>
</table>
<h2>Exemples résolus</h2>
<h3>1. La face cachée d'un dé</h3>
<p>Un dé posé sur la table montre 2 sur le dessus. Le dessous est la face opposée : 7 − 2 = 5. Si l'on demande la somme des cinq faces visibles, on retire ce 5 du total : 21 − 5 = 16.</p>
<h3>2. Cube 4 × 4 × 4 peint : deux faces peintes</h3>
<p>Un petit cube a deux faces peintes s'il est sur une arête, sans être un coin. Chaque arête porte 4 petits cubes, dont 2 coins : il en reste 2. Avec 12 arêtes : 12 × 2 = 24.</p>
<h3>3. Cube 5 × 5 × 5 peint : aucune face, puis une seule</h3>
<p>Les cubes sans peinture forment le cube intérieur : on retire une couche de chaque côté, donc son arête vaut 5 − 2 = 3, et il contient 3³ = 27 petits cubes. Ceux qui ont une seule face peinte forment sur chaque face un carré de 3 × 3 = 9, donc 6 × 9 = 54. Vérification : 8 + 36 + 54 + 27 = 125 = 5³.</p>
<h3>4. Une tour de trois dés</h3>
<p>Trois dés sont empilés sur une table, le dessus montre 4. Sur chaque dé, les quatre faces de côté forment deux paires opposées, donc valent 14. Les faces visibles font 3 × 14 + 4 = 46, sans même savoir comment les dés sont tournés.</p>
<h3>5. Un patron</h3>
<p>Quatre carrés A, B, C, D en colonne, plus E et F collés de chaque côté : la colonne s'enroule autour du cube. A est opposée à C, B à D, et E à F. Règle générale : deux carrés séparés par un seul carré dans une rangée droite sont opposés.</p>
<h2>Réflexes sans calculatrice</h2>
<p>Connais les cubes de 1 à 10 : 1, 8, 27, 64, 125, 216, 343, 512, 729, 1 000. Quand on demande « au moins une face peinte », compte le contraire : n³ − (n − 2)³. Quand un petit cube est retiré d'un coin, l'aire totale ne change pas : il cache 3 carrés et en découvre 3. Pour une boîte à remplir, divise chaque dimension par l'arête du petit cube, puis multiplie les trois résultats. Pour un plus court chemin sur une boîte, déplie deux faces et utilise Pythagore. Et pense au QCM : la réponse juste doit vérifier le total des catégories.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Classe chaque petit cube selon sa position (coin, arête, face, intérieur) en comptant avec n − 2, et pour un dé, raisonne par paires de faces opposées qui font 7.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Compter les coins avec les arêtes (12 × n au lieu de 12 × (n − 2)) ; retirer une seule couche au lieu de deux pour l'intérieur ((n − 1)³ au lieu de (n − 2)³) ; confondre aire et volume (la peinture suit k², la masse suit k³) ; croire que deux carrés éloignés sur un patron sont forcément opposés ; oublier les faces collées entre deux dés ou deux cubes.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Cube peint de côté n : 8 coins à trois faces, 12(n − 2) à deux faces, 6(n − 2)² à une face, (n − 2)³ sans peinture. Dé : faces opposées de somme 7, quatre faces de côté de somme 14. Longueurs × k : aires × k², volumes × k³.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(NIV[n])(R);
      return ex && ex.choix && ex.choix.length === 4 ? ex : secours();
    } catch (e){
      return secours();
    }
  }
});

})();
