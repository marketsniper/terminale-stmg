/* ===== Maths · Objectif Albert School : alb-06 · Dénombrement : principe multiplicatif, complémentaire, ordre =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS.
   Toutes les réponses sont CALCULÉES par le code (formules de comptage) ; les banques de mots ne fixent que les énoncés.
   Sous-types par niveau :
     N1 : choix successifs (menus, tenues, itinéraires), codes avec répétition, rangements et podiums sans répétition,
          choix exclusifs « soit… soit » (addition).
     N2 : « au moins un » par le complémentaire, paires avec ou sans ordre, nombres de 3 chiffres sous contrainte
          (0 en tête), formules qui mêlent « et » et « ou ».
     N3 : anagrammes avec une lettre double, « au moins deux identiques », trios sans ordre, diagonales,
          places imposées (côte à côte, extrémités), nombres contenant au moins un chiffre donné.
     N4 : anagrammes à plusieurs lettres répétées, chiffres strictement croissants ou décroissants, chemins sur un
          quadrillage, équipes avec « au moins une », « jamais côte à côte », paiements avec des pièces, couples.
     N5 : anagrammes sous contrainte (voyelles), chemins avec passage obligé ou interdit, rectangles et carrés d'un
          quadrillage, somme des chiffres imposée, triangles et points alignés, « au moins un de chaque », bureaux.
   N'utilise que R.int, R.pick, R.shuffle. Niveau inconnu : borné. gen ne lève jamais d'exception.
   Vérification indépendante : verifs/alb-06-denombrement-verif.js (relit l'énoncé, force brute). */
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
const F = ' ';
const QM = F + '?';

/* ---------- outils de comptage ---------- */
function fact(n){ let p = 1; for (let i = 2; i <= n; i++) p *= i; return p; }
function arr(n, k){ let p = 1; for (let i = 0; i < k; i++) p *= (n - i); return p; }          // n × (n − 1) × … (k facteurs)
function comb(n, k){ return (k < 0 || k > n) ? 0 : arr(n, k) / fact(k); }
function puis(m, k){ let p = 1; for (let i = 0; i < k; i++) p *= m; return p; }
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const somme = l => l.reduce((s, x) => s + x, 0);
const produit = l => l.reduce((s, x) => s * x, 1);
const facteurs = (n, k) => range(0, k - 1).map(i => nb(n - i)).join(' × ');
const factTxt = n => n <= 1 ? '1' : facteurs(n, n);
const repete = (m, k) => range(1, k).map(() => nb(m)).join(' × ');
const listeEt = l => l.length < 2 ? String(l[0]) : l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1];
const pl = (k, sg, p) => k > 1 ? p : sg;
/* « (8 × 7 × 6) ÷ (3 × 2 × 1) » : nombre de groupes de k parmi n, écrit pour le calcul à la main. */
const combTxt = (n, k) => k <= 1 ? nb(n) : '(' + facteurs(n, k) + ') ÷ (' + factTxt(k) + ')';

const PRENOMS = [{n: 'Inès', g: 'f'}, {n: 'Léo', g: 'm'}, {n: 'Sarah', g: 'f'}, {n: 'Yanis', g: 'm'}, {n: 'Chloé', g: 'f'},
  {n: 'Hugo', g: 'm'}, {n: 'Lina', g: 'f'}, {n: 'Noah', g: 'm'}, {n: 'Jade', g: 'f'}, {n: 'Malik', g: 'm'},
  {n: 'Emma', g: 'f'}, {n: 'Adam', g: 'm'}, {n: 'Maya', g: 'f'}, {n: 'Sami', g: 'm'}];
const pr = p => p.g === 'f' ? 'elle' : 'il';
const deuxNoms = R => { const t = R.shuffle(PRENOMS); return [t[0], t[1], t[2]]; };
/* « de Léo », « d'Inès » : élision devant une voyelle ou un h muet. */
const de = nom => (/^[AEIOUÉH]/.test(nom) ? 'd\'' : 'de ') + nom;
/* Accords pour deux personnes nommées : deux filles, ou au moins un garçon. */
const duo = (a, b) => (a.g === 'f' && b.g === 'f')
  ? {ils: 'elles', un: 'l\'une avec l\'autre', aucun: 'aucune des deux', tous: 'toutes les deux', voisins: 'voisines', seul: 'une seule des deux'}
  : {ils: 'ils', un: 'l\'un avec l\'autre', aucun: 'aucun des deux', tous: 'tous les deux', voisins: 'voisins', seul: 'un seul des deux'};

/* Choix numériques : bonne réponse, distracteurs [valeur, piège nommé], puis voisins (pas donné) jusqu'à 4 choix.
   Le texte d'un piège n'est ajouté à l'explication que si sa valeur figure parmi les choix (2 au plus). */
function sortie(q, bonne, pieges, expl, pas){
  pas = pas || 1;
  const ok = (pieges || []).filter(p => p && typeof p[0] === 'number' && isFinite(p[0]) && Math.round(p[0]) === p[0] && p[0] >= 1 && p[0] !== bonne);
  const choix = qcm(nb(bonne), ok.map(p => nb(p[0])), k => { const v = bonne + (k % 2 ? (k + 1) / 2 : -k / 2) * pas; return v >= 1 ? nb(v) : null; });
  const txt = [], dits = new Set();
  ok.forEach(p => { const s = nb(p[0]); if (p[1] && choix.indexOf(s) > 0 && !dits.has(s) && txt.length < 2){ dits.add(s); txt.push(p[1](s)); } });
  return {q: q, a: nb(bonne), accept: null, choix: choix, expl: expl + (txt.length ? ' ' + txt.join(' ') : '')};
}
function multiplicites(mot){ const c = {}; mot.split('').forEach(ch => { c[ch] = (c[ch] || 0) + 1; }); return c; }
const MOTS_NB = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept'];

/* ================= NIVEAU 1 : découverte ================= */
function n1produit(R){
  const ctx = R.int(0, 4), f = [R.int(2, 6), R.int(2, 6), R.int(2, 5)];
  let q, dernier;
  if (ctx === 0){
    q = 'Un restaurant propose ' + f[0] + ' entrées, ' + f[1] + ' plats et ' + f[2] + ' desserts. Un menu complet comprend une entrée, un plat et un dessert. Combien de menus complets différents peut-on composer' + QM;
    dernier = 'le dessert';
  } else if (ctx === 1){
    const p = R.pick(PRENOMS);
    q = p.n + ' possède ' + f[0] + ' t-shirts, ' + f[1] + ' pantalons et ' + f[2] + ' paires de baskets. Une tenue se compose d\'un t-shirt, d\'un pantalon et d\'une paire de baskets. Combien de tenues différentes ' + p.n + ' peut-' + pr(p) + ' composer' + QM;
    dernier = 'les baskets';
  } else if (ctx === 2){
    q = 'Une sandwicherie propose ' + f[0] + ' sortes de pain, ' + f[1] + ' garnitures et ' + f[2] + ' sauces. Un sandwich se compose d\'un pain, d\'une garniture et d\'une sauce. Combien de sandwichs différents peut-on commander' + QM;
    dernier = 'la sauce';
  } else if (ctx === 3){
    q = 'Pour aller du village A au village D, on passe d\'abord par B, puis par C. Il existe ' + f[0] + ' chemins de A à B, ' + f[1] + ' chemins de B à C et ' + f[2] + ' chemins de C à D. Combien d\'itinéraires différents mènent de A à D' + QM;
    dernier = 'l\'étape de C à D';
  } else {
    q = 'Un glacier propose ' + f[0] + ' parfums, ' + f[1] + ' sortes de cornets et ' + f[2] + ' nappages. Une glace se compose d\'un parfum, d\'un cornet et d\'un nappage. Combien de glaces différentes peut-on commander' + QM;
    dernier = 'le nappage';
  }
  const P = produit(f);
  return sortie(q, P, [
    [somme(f), s => 'Piège : ' + s + ' additionne les nombres de choix ; quand on choisit une chose ET une autre, on multiplie.'],
    [f[0] * f[1], s => 'Piège : ' + s + ' oublie le dernier choix (' + dernier + ').']
  ], 'On fait trois choix successifs, indépendants les uns des autres : on multiplie les nombres de choix. Chacun des ' + f[0] + ' premiers choix se combine avec chacun des ' + f[1] + ' deuxièmes, soit ' + f[0] + ' × ' + f[1] + ' = ' + (f[0] * f[1]) + ' débuts possibles, et chaque début se complète de ' + f[2] + ' façons : ' + f[0] + ' × ' + f[1] + ' × ' + f[2] + ' = ' + nb(P) + '.', Math.min(f[0], f[1], f[2]));
}

function n1puissance(R){
  const ctx = R.int(0, 5), places = ['molettes', 'molettes', 'questions', 'bandes', 'lancers', 'lettres'][ctx];
  let m, k, q;
  if (ctx === 0){
    [m, k] = R.pick([[3, 2], [3, 3], [3, 4], [4, 2], [4, 3], [4, 4], [5, 2], [5, 3], [6, 2], [6, 3]]);
    q = 'Un cadenas possède ' + k + ' molettes. Chaque molette porte les chiffres de 1 à ' + m + '. Un code est formé en choisissant un chiffre sur chaque molette. Combien de codes différents peut-on former' + QM;
  } else if (ctx === 1){
    m = 10; k = R.int(2, 4);
    q = 'Un cadenas possède ' + k + ' molettes, chacune portant les dix chiffres de 0 à 9. Un code est formé en choisissant un chiffre sur chaque molette. Combien de codes différents peut-on former' + QM;
  } else if (ctx === 2){
    [m, k] = R.pick([[2, 3], [2, 4], [2, 5], [3, 3], [3, 4], [3, 5], [4, 3], [4, 4]]);
    q = 'Un questionnaire comporte ' + k + ' questions. Pour chacune, on coche une seule réponse parmi ' + m + ' proposées. De combien de façons différentes peut-on remplir ce questionnaire' + QM;
  } else if (ctx === 3){
    [m, k] = R.pick([[3, 2], [3, 3], [4, 2], [4, 3], [5, 2], [5, 3], [6, 2], [6, 3]]);
    q = 'On colorie un drapeau formé de ' + k + ' bandes verticales. Chaque bande reçoit une couleur choisie parmi ' + m + ', et plusieurs bandes peuvent avoir la même couleur. Combien de drapeaux différents peut-on obtenir' + QM;
  } else if (ctx === 4){
    m = 2; k = R.int(3, 8);
    q = 'On lance une pièce ' + k + ' fois de suite et on note, dans l\'ordre, la suite des résultats (pile ou face). Combien de suites différentes peut-on obtenir' + QM;
  } else {
    [m, k] = R.pick([[3, 3], [3, 4], [4, 2], [4, 3], [4, 4], [5, 2], [5, 3]]);
    q = 'Un code secret de ' + k + ' lettres s\'écrit avec les lettres ' + listeEt('ABCDEF'.slice(0, m).split('')) + '. Une même lettre peut être utilisée plusieurs fois. Combien de codes différents peut-on écrire' + QM;
  }
  const P = puis(m, k);
  return sortie(q, P, [
    [m * k, s => 'Piège : ' + s + ' multiplie le nombre de choix par le nombre de ' + places + ' ; il faut multiplier ' + m + ' par lui-même ' + k + ' fois.'],
    [k <= m ? arr(m, k) : null, s => 'Piège : ' + s + ' interdit les répétitions, alors que l\'énoncé les autorise.'],
    [puis(k, m) <= 100000 ? puis(k, m) : null, s => 'Piège : ' + s + ' inverse les rôles : c\'est le nombre de choix (' + m + ') qu\'on multiplie par lui-même, autant de fois qu\'il y a de ' + places + ' (' + k + ').'],
    [puis(m, k - 1), s => 'Piège : ' + s + ' oublie un' + (places === 'lancers' ? '' : 'e') + ' des ' + places + '.']
  ], 'Chaque place se remplit indépendamment des autres et les répétitions sont permises : on multiplie le nombre de choix par lui-même, une fois par place. Il y a ' + k + ' ' + places + ' et ' + m + ' choix pour chacun' + (places === 'lancers' ? '' : 'e') + ' : ' + repete(m, k) + ' = ' + nb(P) + '.', Math.max(1, Math.round(P / 10)));
}

function n1ordre(R){
  const ctx = R.int(0, 4);
  let n, k, q, quoi;
  if (ctx === 0){
    n = R.int(4, 9); k = 3; quoi = 'un même coureur à occuper plusieurs marches du podium';
    q = n + ' coureurs disputent une course, sans ex aequo possible. Un podium indique qui finit 1er, 2e et 3e. Combien de podiums différents sont possibles' + QM;
  } else if (ctx === 1){
    n = R.int(5, 12); k = 2; quoi = 'une même personne à occuper les deux postes';
    q = 'Un club de ' + n + ' membres élit un président et un trésorier, qui doivent être deux personnes différentes. Combien de duos (président, trésorier) sont possibles' + QM;
  } else if (ctx === 2){
    n = R.int(3, 5); k = n;
    q = 'De combien de façons différentes peut-on ranger ' + n + ' livres différents côte à côte sur une étagère' + QM;
  } else if (ctx === 3){
    n = R.int(3, 5); k = n;
    q = 'Un groupe de ' + n + ' amis fait la queue devant un cinéma. De combien de façons différentes peuvent-ils se placer dans la file' + QM;
  } else {
    n = R.int(4, 7); k = R.int(2, 3); quoi = 'un même chiffre à revenir';
    const ch = R.shuffle(range(1, 9)).slice(0, n).sort((x, y) => x - y);
    q = 'Avec les chiffres ' + listeEt(ch) + ', combien de nombres de ' + k + ' chiffres peut-on écrire si chaque chiffre est utilisé au plus une fois' + QM;
  }
  const P = arr(n, k);
  if (k === n){
    return sortie(q, P, [
      [n * (n + 1) / 2, s => 'Piège : ' + s + ' additionne ' + range(1, n).join(' + ') + ' au lieu de multiplier.'],
      [puis(n, n), s => 'Piège : ' + s + ' autorise un même élément à occuper plusieurs places.'],
      [fact(n - 1), s => 'Piège : ' + s + ' oublie un facteur dans le produit.'],
      [n * n, s => 'Piège : ' + s + ' multiplie le nombre d\'éléments par le nombre de places.']
    ], 'On remplit les places une par une, avec un choix de moins à chaque place, car ce qui est déjà placé n\'est plus disponible. Première place : ' + n + ' choix, deuxième : ' + (n - 1) + ', et ainsi de suite jusqu\'à 1 : ' + factTxt(n) + ' = ' + nb(P) + '.', Math.max(1, n - 1));
  }
  return sortie(q, P, [
    [puis(n, k), s => 'Piège : ' + s + ' autorise ' + quoi + '.'],
    [P / fact(k), s => 'Piège : ' + s + ' ne tient pas compte de l\'ordre ; ici, les places sont différentes.'],
    [n * k, s => 'Piège : ' + s + ' multiplie le nombre de candidats par le nombre de places.'],
    [somme(range(0, k - 1).map(i => n - i)), s => 'Piège : ' + s + ' additionne les choix au lieu de les multiplier.']
  ], 'On remplit les places dans l\'ordre, et ce qui est déjà choisi n\'est plus disponible : un choix de moins à chaque nouvelle place. ' + (k === 2 ? 'Première place : ' + n + ' choix, deuxième : ' + (n - 1) + '. ' : 'Première place : ' + n + ' choix, deuxième : ' + (n - 1) + ', troisième : ' + (n - 2) + '. ') + 'Total : ' + facteurs(n, k) + ' = ' + nb(P) + '.', Math.max(1, n - 2));
}

function n1ou(R){
  const ctx = R.int(0, 2), p = R.pick(PRENOMS);
  let t, q;
  if (ctx === 0){
    t = [R.int(3, 9), R.int(3, 9)];
    q = 'Pour son goûter, ' + p.n + ' prend soit un fruit, soit un gâteau, mais pas les deux. Il y a ' + t[0] + ' fruits et ' + t[1] + ' gâteaux différents. Combien de goûters différents ' + p.n + ' peut-' + pr(p) + ' choisir' + QM;
  } else if (ctx === 1){
    t = [R.int(3, 9), R.int(2, 8), R.int(2, 6)];
    q = 'Ce soir, ' + p.n + ' regarde un seul programme : soit l\'un des ' + t[0] + ' films, soit l\'une des ' + t[1] + ' séries, soit l\'un des ' + t[2] + ' documentaires proposés. Combien de choix ' + p.n + ' a-t-' + pr(p) + QM;
  } else {
    t = [R.int(3, 9), R.int(2, 8)];
    q = 'Pour aller de la ville A à la ville B, on peut prendre l\'un des ' + t[0] + ' trains directs ou l\'un des ' + t[1] + ' cars directs. De combien de façons peut-on faire ce trajet' + QM;
  }
  const S = somme(t);
  return sortie(q, S, [
    [produit(t), s => 'Piège : ' + s + ' multiplie, comme si l\'on prenait une chose de chaque sorte ; « soit… soit » veut dire qu\'on additionne.'],
    [Math.max.apply(null, t), s => 'Piège : ' + s + ' ne garde qu\'une seule catégorie.']
  ], 'Les choix s\'excluent : on prend une seule chose, dans une catégorie OU dans une autre, donc on additionne les nombres de choix. ' + t.join(' + ') + ' = ' + S + '.', 1);
}

/* ================= NIVEAU 2 : maîtrise ================= */
function n2auMoinsUn(R){
  const ctx = R.int(0, 3);
  let m, k, g, q, cible, plusieurs;
  if (ctx === 0){
    m = 10; g = 1; k = R.int(2, 3);
    const d = R.int(0, 9), z = '0'.repeat(k), n9 = '9'.repeat(k), ticket = R.int(0, 1) === 1;
    q = (ticket ? 'Les tickets d\'une tombola portent tous les numéros de ' + z + ' à ' + n9 + ', toujours écrits avec ' + k + ' chiffres. Combien de tickets'
      : 'Un cadenas possède ' + k + ' molettes, chacune portant les chiffres de 0 à 9 : les codes vont de ' + z + ' à ' + n9 + '. Combien de codes')
      + ' comportent au moins un chiffre ' + d + QM;
    cible = 'chiffre ' + d; plusieurs = 'plusieurs ' + d;
  } else if (ctx === 1){
    m = 6; g = 1; k = R.int(2, 3);
    const s = R.int(1, 6);
    q = 'On lance ' + (k === 2 ? 'un dé rouge et un dé bleu' : 'un dé rouge, un dé bleu et un dé vert') + ', tous à six faces, et on note les résultats couleur par couleur. Combien de résultats comportent au moins un ' + s + QM;
    cible = s; plusieurs = 'plusieurs ' + s;
  } else if (ctx === 2){
    m = R.int(4, 6); k = R.int(2, 3);
    const L = 'ABCDEF'.slice(0, m).split(''), v = m >= 5 ? 2 : 1, cons = R.int(0, 2) === 0;
    g = cons ? m - v : v;
    q = 'Avec les lettres ' + listeEt(L) + ', on écrit des « mots » de ' + k + ' lettres, ayant un sens ou non ; une même lettre peut revenir plusieurs fois. Combien de ces mots contiennent au moins une ' + (cons ? 'consonne' : 'voyelle') + QM;
    cible = cons ? 'consonne' : 'voyelle'; plusieurs = 'plusieurs ' + (cons ? 'consonnes' : 'voyelles');
  } else {
    m = R.int(4, 6); g = 1; k = R.int(2, 3);
    const t = R.int(1, m);
    q = 'Un cadenas possède ' + k + ' molettes portant chacune les chiffres de 1 à ' + m + '. Combien de codes comportent au moins un chiffre ' + t + QM;
    cible = 'chiffre ' + t; plusieurs = 'plusieurs ' + t;
  }
  const b = m - g, T = puis(m, k), B = puis(b, k), ans = T - B;
  const fem = cible === 'voyelle' || cible === 'consonne', un = fem ? 'une' : 'un', O = k * g * puis(m, k - 1);
  return sortie(q, ans, [
    [k * g * puis(b, k - 1), s => 'Piège : ' + s + ' compte seulement les cas avec exactement ' + un + ' ' + cible + ' ; « au moins ' + un + ' » compte aussi ceux qui en ont plusieurs.'],
    [B, s => 'Piège : ' + s + ' compte les cas SANS ' + cible + ' ; il faut les retirer du total.'],
    [O < T ? O : null, s => 'Piège : ' + s + ' compte plusieurs fois les cas qui contiennent ' + plusieurs + '.'],
    [T, s => 'Piège : ' + s + ' compte tous les cas, sans tenir compte de la condition.']
  ], 'Il est plus simple de compter le contraire, les cas sans aucun' + (fem ? 'e ' : ' ') + cible + ', puis de les retirer du total. Total : ' + repete(m, k) + ' = ' + nb(T) + '. Sans ' + cible + ', chaque place n\'a plus que ' + b + ' choix : ' + repete(b, k) + ' = ' + nb(B) + '. Donc ' + nb(T) + ' − ' + nb(B) + ' = ' + nb(ans) + '.', 1);
}

function n2paires(R){
  const ctx = R.int(0, 5);
  let n, q, ordre = false, raison = '', soiMeme = '';
  if (ctx === 0){
    n = R.int(5, 15);
    q = 'On place ' + n + ' points sur un cercle. Combien de segments différents ont pour extrémités deux de ces points' + QM;
  } else if (ctx === 1){
    n = R.int(6, 30);
    q = 'Un professeur choisit 2 élèves parmi les ' + n + ' de sa classe pour représenter la classe ; les deux élèves ont le même rôle. Combien de duos différents peut-il former' + QM;
  } else if (ctx === 2){
    n = R.int(5, 16);
    q = 'Un glacier propose ' + n + ' parfums. Une coupe contient deux boules de parfums différents, et l\'ordre des boules ne compte pas. Combien de coupes différentes peut-on commander' + QM;
  } else if (ctx === 3){
    n = R.int(6, 30); ordre = true;
    raison = 'délégué et suppléant sont deux rôles différents'; soiMeme = 'donne les deux rôles au même élève';
    q = 'Dans une classe de ' + n + ' élèves, on élit un délégué et un suppléant, deux élèves différents. Combien de résultats différents sont possibles' + QM;
  } else if (ctx === 4){
    n = R.int(4, 12); ordre = true;
    raison = 'la carte de A vers B et celle de B vers A sont deux cartes différentes'; soiMeme = 'fait comme si chacun s\'envoyait aussi une carte';
    q = 'Pour la nouvelle année, ' + n + ' amis s\'envoient des cartes : chacun envoie une carte à chacun des autres. Combien de cartes sont envoyées en tout' + QM;
  } else {
    n = R.int(5, 16); ordre = true;
    raison = 'la boule du bas et celle du haut ne jouent pas le même rôle'; soiMeme = 'autorise deux boules du même parfum';
    q = 'Un glacier propose ' + n + ' parfums. Sur un cornet, on empile deux boules de parfums différents, et l\'on distingue la boule du bas de celle du haut. Combien de cornets différents peut-on commander' + QM;
  }
  if (ordre){
    const P = n * (n - 1);
    return sortie(q, P, [
      [P / 2, s => 'Piège : ' + s + ' fait comme si l\'ordre ne comptait pas ; or ' + raison + '.'],
      [n * n, s => 'Piège : ' + s + ' ' + soiMeme + '.'],
      [n * (n + 1), null]
    ], 'Ici l\'ordre compte : on remplit deux places différentes, avec un choix de moins pour la seconde. ' + n + ' × ' + (n - 1) + ' = ' + nb(P) + '.', n - 1);
  }
  const P = n * (n - 1) / 2;
  return sortie(q, P, [
    [n * (n - 1), s => 'Piège : ' + s + ' compte chaque paire deux fois (A avec B, puis B avec A).'],
    [n * (n + 1) / 2, s => 'Piège : ' + s + ' revient à additionner 1 + 2 + … + ' + n + ' ; la bonne somme s\'arrête à ' + (n - 1) + '.'],
    [n * n, s => 'Piège : ' + s + ' associe chacun à tout le monde, lui compris, et compte chaque paire deux fois.']
  ], 'Chaque élément s\'associe à chacun des autres, mais chaque paire est alors comptée deux fois : on divise par 2. Chacun des ' + n + ' s\'associe aux ' + (n - 1) + ' autres : ' + n + ' × ' + (n - 1) + ' = ' + nb(n * (n - 1)) + ', et ' + nb(n * (n - 1)) + ' ÷ 2 = ' + nb(P) + '.', 1);
}

const CLASSIQUES2 = [
  {q: 'Combien de nombres de 3 chiffres ont leurs trois chiffres tous différents' + QM, a: 648,
    e: 'On remplit les trois places en commençant par la plus contrainte, le premier chiffre, qui ne peut pas être 0. Premier chiffre : 9 choix (1 à 9). Deuxième : 9 choix (0 redevient possible, mais pas le premier chiffre). Troisième : 8 choix. 9 × 9 × 8 = 648.',
    p: [[720, s => 'Piège : ' + s + ' = 10 × 9 × 8 compte aussi les écritures qui commencent par 0.'], [504, s => 'Piège : ' + s + ' = 9 × 8 × 7 interdit le 0 partout, alors qu\'il est permis en deuxième et en troisième position.'], [900, s => 'Piège : ' + s + ' est le nombre de tous les nombres de 3 chiffres.']]},
  {q: 'Combien de nombres de 3 chiffres ne contiennent aucun chiffre 0' + QM, a: 729,
    e: 'On remplit les trois places une par une : chacune n\'accepte que les chiffres de 1 à 9. Il y a 9 choix pour chaque place : 9 × 9 × 9 = 729.',
    p: [[810, s => 'Piège : ' + s + ' ne retire que les nombres qui finissent par 0 ; le 0 peut aussi être au milieu.'], [900, s => 'Piège : ' + s + ' est le nombre de tous les nombres de 3 chiffres.'], [648, s => 'Piège : ' + s + ' compte les nombres aux chiffres tous différents.']]},
  {q: 'Combien de nombres de 3 chiffres sont pairs' + QM, a: 450,
    e: 'On remplit les places en commençant par les plus contraintes : le premier chiffre (pas 0) et le dernier (pair). Premier chiffre : 9 choix. Deuxième : 10 choix. Dernier : 5 choix (0, 2, 4, 6, 8). 9 × 10 × 5 = 450.',
    p: [[500, s => 'Piège : ' + s + ' = 10 × 10 × 5 compte aussi les écritures qui commencent par 0.'], [405, s => 'Piège : ' + s + ' = 9 × 9 × 5 interdit le 0 au milieu, alors qu\'il y est permis.'], [449, s => 'Piège : ' + s + ' oublie un nombre : de 100 à 998, il y a (998 − 100) ÷ 2 + 1 nombres pairs.']]},
  {q: 'Combien de nombres de 3 chiffres n\'ont que des chiffres pairs' + QM, a: 100,
    e: 'On remplit les places en commençant par le premier chiffre, qui doit être pair mais pas 0. Premier chiffre : 4 choix (2, 4, 6, 8). Deuxième et troisième : 5 choix chacun (0, 2, 4, 6, 8). 4 × 5 × 5 = 100.',
    p: [[125, s => 'Piège : ' + s + ' = 5 × 5 × 5 laisse le 0 en tête.'], [64, s => 'Piège : ' + s + ' = 4 × 4 × 4 interdit le 0 partout, alors qu\'il est permis après le premier chiffre.'], [60, s => 'Piège : ' + s + ' = 5 × 4 × 3 interdit les répétitions.']]},
  {q: 'Combien de nombres de 3 chiffres n\'ont que des chiffres impairs' + QM, a: 125,
    e: 'On remplit les trois places une par une : chacune accepte les chiffres impairs 1, 3, 5, 7, 9, et aucun d\'eux n\'est 0. 5 choix par place : 5 × 5 × 5 = 125.',
    p: [[100, s => 'Piège : ' + s + ' retire un choix au premier chiffre, alors qu\'aucun chiffre impair n\'est 0.'], [60, s => 'Piège : ' + s + ' = 5 × 4 × 3 interdit les répétitions.'], [15, s => 'Piège : ' + s + ' = 5 × 3 multiplie le nombre de choix par le nombre de places.']]},
  {q: 'Un palindrome se lit de la même façon de gauche à droite et de droite à gauche, comme 383. Combien de nombres de 3 chiffres sont des palindromes' + QM, a: 90,
    e: 'On choisit librement les chiffres qui ne sont pas imposés, ici le premier et celui du milieu, car le dernier est obligatoirement égal au premier. Premier chiffre : 9 choix (pas 0). Milieu : 10 choix. Dernier : imposé. 9 × 10 = 90.',
    p: [[100, s => 'Piège : ' + s + ' laisse le 0 en tête, comme dans 030.'], [900, s => 'Piège : ' + s + ' laisse le dernier chiffre libre, alors qu\'il doit être égal au premier.'], [81, s => 'Piège : ' + s + ' interdit le 0 au milieu, alors qu\'il y est permis.']]},
  {q: 'Un palindrome se lit de la même façon de gauche à droite et de droite à gauche, comme 2552. Combien de nombres de 4 chiffres sont des palindromes' + QM, a: 90,
    e: 'On choisit librement les deux premiers chiffres ; les deux derniers sont alors imposés, car ils répètent les deux premiers à l\'envers. Premier chiffre : 9 choix (pas 0). Deuxième : 10 choix. 9 × 10 = 90.',
    p: [[900, s => 'Piège : ' + s + ' laisse un chiffre libre de trop.'], [100, s => 'Piège : ' + s + ' laisse le 0 en tête.'], [9000, s => 'Piège : ' + s + ' est le nombre de tous les nombres de 4 chiffres.']]},
  {q: 'Combien de nombres de 4 chiffres commencent et finissent par le même chiffre' + QM, a: 900,
    e: 'On remplit d\'abord le premier chiffre, le plus contraint, puis les deux du milieu ; le dernier est imposé, égal au premier. Premier : 9 choix (pas 0). Deuxième et troisième : 10 choix chacun. Dernier : imposé. 9 × 10 × 10 = 900.',
    p: [[1000, s => 'Piège : ' + s + ' laisse le 0 en tête.'], [90, s => 'Piège : ' + s + ' bloque aussi un chiffre du milieu.'], [9000, s => 'Piège : ' + s + ' est le nombre de tous les nombres de 4 chiffres.']]},
  {q: 'Combien de nombres de 3 chiffres sont des multiples de 5' + QM, a: 180,
    e: 'On remplit les places en commençant par les plus contraintes : le premier chiffre (pas 0) et le dernier (0 ou 5, pour un multiple de 5). Premier : 9 choix. Milieu : 10 choix. Dernier : 2 choix. 9 × 10 × 2 = 180.',
    p: [[200, s => 'Piège : ' + s + ' = 10 × 10 × 2 laisse le 0 en tête.'], [90, s => 'Piège : ' + s + ' oublie les nombres qui finissent par 0.'], [179, s => 'Piège : ' + s + ' oublie un nombre : de 100 à 995, il y a (995 − 100) ÷ 5 + 1 multiples de 5.']]}
];

function n2chiffres(R){
  const r = R.int(1, 10);
  if (r >= 8){
    const C = R.pick(CLASSIQUES2);
    return sortie(C.q, C.a, C.p, C.e, 1);
  }
  const rep = r <= 4, s = rep ? R.int(3, 5) : R.int(4, 6), avec0 = R.int(1, 10) <= 6;
  const S = R.shuffle(range(1, 9)).slice(0, avec0 ? s - 1 : s);
  if (avec0) S.push(0);
  S.sort((x, y) => x - y);
  if (rep){
    const q = 'Combien de nombres de 3 chiffres peut-on écrire en utilisant uniquement les chiffres ' + listeEt(S) + ' ? Un même chiffre peut être utilisé plusieurs fois.';
    const p1 = avec0 ? s - 1 : s, ans = p1 * s * s;
    return sortie(q.replace(' ?', QM), ans, avec0 ? [
      [s * s * s, s2 => 'Piège : ' + s2 + ' compte aussi les écritures qui commencent par 0, qui ne sont pas des nombres de 3 chiffres.'],
      [(s - 1) * (s - 1) * (s - 1), s2 => 'Piège : ' + s2 + ' interdit le 0 partout, alors qu\'il est permis en deuxième et en troisième position.'],
      [arr(s, 3) - arr(s - 1, 2), s2 => 'Piège : ' + s2 + ' interdit les répétitions, alors que l\'énoncé les autorise.']
    ] : [
      [arr(s, 3), s2 => 'Piège : ' + s2 + ' interdit les répétitions, alors que l\'énoncé les autorise.'],
      [3 * s, s2 => 'Piège : ' + s2 + ' multiplie le nombre de chiffres permis par le nombre de places.'],
      [s * s, s2 => 'Piège : ' + s2 + ' oublie une des trois places.']
    ], 'On remplit les trois places en commençant par la plus contrainte, le premier chiffre, qui ne peut pas être 0. ' + (avec0
      ? 'Premier chiffre : ' + (s - 1) + ' choix (tous sauf 0). Deuxième et troisième : ' + s + ' choix chacun, répétitions permises. ' + (s - 1) + ' × ' + s + ' × ' + s + ' = ' + nb(ans) + '.'
      : 'Aucun 0 ici : chaque place a ' + s + ' choix, répétitions permises. ' + s + ' × ' + s + ' × ' + s + ' = ' + nb(ans) + '.'), 1);
  }
  const q = 'Combien de nombres de 3 chiffres peut-on écrire avec les chiffres ' + listeEt(S) + ', si chaque chiffre est utilisé au plus une fois' + QM;
  const ans = avec0 ? (s - 1) * (s - 1) * (s - 2) : arr(s, 3);
  return sortie(q, ans, avec0 ? [
    [arr(s, 3), s2 => 'Piège : ' + s2 + ' compte aussi les écritures qui commencent par 0.'],
    [arr(s - 1, 3), s2 => 'Piège : ' + s2 + ' interdit le 0 partout, alors qu\'il est permis en deuxième et en troisième position.'],
    [(s - 1) * s * s, s2 => 'Piège : ' + s2 + ' autorise les répétitions, alors que l\'énoncé les interdit.']
  ] : [
    [s * s * s, s2 => 'Piège : ' + s2 + ' autorise les répétitions, alors que l\'énoncé les interdit.'],
    [comb(s, 3), s2 => 'Piège : ' + s2 + ' ne tient pas compte de l\'ordre ; 123 et 321 sont deux nombres différents.'],
    [3 * s, s2 => 'Piège : ' + s2 + ' multiplie le nombre de chiffres permis par le nombre de places.']
  ], 'On remplit les places en commençant par le premier chiffre, qui ne peut pas être 0, et un chiffre déjà utilisé n\'est plus disponible ensuite. ' + (avec0
    ? 'Premier chiffre : ' + (s - 1) + ' choix (tous sauf 0). Deuxième : encore ' + (s - 1) + ' choix (le 0 redevient possible, mais le premier chiffre est pris). Troisième : ' + (s - 2) + ' choix. ' + (s - 1) + ' × ' + (s - 1) + ' × ' + (s - 2) + ' = ' + nb(ans) + '.'
    : 'Aucun 0 ici. Premier chiffre : ' + s + ' choix, deuxième : ' + (s - 1) + ', troisième : ' + (s - 2) + '. ' + facteurs(s, 3) + ' = ' + nb(ans) + '.'), 1);
}

function n2ouEt(R){
  const ctx = R.int(0, 2);
  if (ctx === 0){
    const e = R.int(2, 6), p = R.int(2, 6), d = R.int(2, 6), ans = e * p + p * d;
    const q = 'Une cantine propose ' + e + ' entrées, ' + p + ' plats et ' + d + ' desserts. Chaque élève prend soit une entrée et un plat, soit un plat et un dessert. Combien de repas différents sont possibles' + QM;
    return sortie(q, ans, [
      [e * p * d, s => 'Piège : ' + s + ' compte les repas entrée + plat + dessert, qui ne sont pas proposés.'],
      [e + p + d, s => 'Piège : ' + s + ' additionne tout ; à l\'intérieur d\'une formule, on multiplie.'],
      [e * p, s => 'Piège : ' + s + ' oublie la formule plat + dessert.'],
      [p * d, s => 'Piège : ' + s + ' oublie la formule entrée + plat.']
    ], 'Les deux formules s\'excluent, donc on additionne leurs nombres de repas ; à l\'intérieur de chaque formule, on multiplie. Entrée et plat : ' + e + ' × ' + p + ' = ' + (e * p) + '. Plat et dessert : ' + p + ' × ' + d + ' = ' + (p * d) + '. Total : ' + (e * p) + ' + ' + (p * d) + ' = ' + nb(ans) + '.', 1);
  }
  if (ctx === 1){
    const P = R.pick(PRENOMS.filter(x => x.g === 'f'));
    const r = R.int(2, 5), j = R.int(2, 4), h = R.int(2, 5), c = R.int(2, 4), ans = (r + j * h) * c;
    const q = P.n + ' a ' + r + ' robes, ' + j + ' jupes, ' + h + ' hauts et ' + c + ' paires de chaussures. Elle met soit une robe, soit une jupe avec un haut, et dans les deux cas une paire de chaussures. Combien de tenues différentes peut-elle composer' + QM;
    return sortie(q, ans, [
      [r * j * h * c, s => 'Piège : ' + s + ' multiplie tout, comme si elle portait une robe ET une jupe.'],
      [(r + j + h) * c, s => 'Piège : ' + s + ' additionne jupes et hauts, alors qu\'elle les porte ensemble.'],
      [r + j * h * c, s => 'Piège : ' + s + ' oublie les chaussures avec la robe.'],
      [r + j * h, s => 'Piège : ' + s + ' oublie les chaussures.']
    ], 'On additionne les cas qui s\'excluent (robe OU jupe et haut) et on multiplie les choix qui s\'enchaînent (haut ET chaussures). Haut du corps : ' + r + ' robes, ou ' + j + ' × ' + h + ' = ' + (j * h) + ' ensembles jupe et haut, soit ' + r + ' + ' + (j * h) + ' = ' + (r + j * h) + ' possibilités. Avec les chaussures : ' + (r + j * h) + ' × ' + c + ' = ' + nb(ans) + '.', 1);
  }
  const a = R.int(2, 5), b = R.int(2, 5), c = R.int(2, 5), d = R.int(2, 5), ans = a * b + c * d;
  const q = 'Pour aller de A à C, on passe soit par B, soit par D. Il y a ' + a + ' routes de A à B et ' + b + ' routes de B à C ; il y a ' + c + ' routes de A à D et ' + d + ' routes de D à C. Combien d\'itinéraires différents mènent de A à C' + QM;
  return sortie(q, ans, [
    [a * b * c * d, s => 'Piège : ' + s + ' multiplie les deux itinéraires, comme si l\'on passait par B ET par D.'],
    [a + b + c + d, s => 'Piège : ' + s + ' additionne tout ; le long d\'un même itinéraire, on multiplie.'],
    [(a + c) * (b + d), s => 'Piège : ' + s + ' permet de partir vers B puis d\'arriver depuis D.']
  ], 'Passer par B ou passer par D sont deux cas qui s\'excluent : on additionne ; dans chaque cas, les deux étapes s\'enchaînent : on multiplie. Par B : ' + a + ' × ' + b + ' = ' + (a * b) + '. Par D : ' + c + ' × ' + d + ' = ' + (c * d) + '. Total : ' + (a * b) + ' + ' + (c * d) + ' = ' + nb(ans) + '.', 1);
}

/* ================= NIVEAU 3 : niveau des exemples officiels ================= */
const MOTS3 = ['TASSE', 'BALLE', 'POMME', 'FILLE', 'VILLE', 'PATTE', 'BOSSE', 'MASSE', 'COLLE', 'PIZZA', 'NAPPE', 'TATOU', 'PAPOTE',
  'GRILLE', 'BALLON', 'SALADE', 'TOMATE', 'CERISE', 'MOMENT', 'CANARD', 'BOBINE', 'PARADE', 'JARDIN', 'MAISON', 'PRINCE'];
const MOTS4 = ['KAYAK', 'CACAO', 'MAMAN', 'SELLE', 'TERRE', 'ANANAS', 'BAOBAB', 'ACACIA', 'BANANE', 'PAPAYE', 'LETTRE', 'PIERRE',
  'BONBON', 'COUCOU', 'COCOTTE', 'BARBARE', 'ENTENTE', 'ASSIS', 'NAGEUSE'];
const enonceAnag = W => 'Combien de « mots » différents, ayant un sens ou non, peut-on écrire en utilisant toutes les lettres du mot ' + W + ', chacune autant de fois qu\'elle y figure' + QM + ' Le mot ' + W + ' lui-même compte.';

function n3anag(R){
  const W = R.pick(MOTS3), n = W.length, M = multiplicites(W), reps = Object.keys(M).filter(c => M[c] > 1);
  const N = fact(n), div = produit(reps.map(c => fact(M[c]))), ans = N / div;
  const q = enonceAnag(W);
  const methode = 'On range les lettres comme si elles étaient toutes différentes, puis on divise par le nombre de façons d\'échanger entre elles les lettres identiques, qui ne changent pas le mot.';
  if (!reps.length){
    return sortie(q, ans, [
      [N - 1, s => 'Piège : ' + s + ' oublie de compter le mot ' + W + ' lui-même.'],
      [N / 2, s => 'Piège : ' + s + ' divise par 2, alors qu\'aucune lettre n\'est répétée.'],
      [n * (n + 1) / 2, s => 'Piège : ' + s + ' additionne ' + range(1, n).join(' + ') + ' au lieu de multiplier.'],
      [fact(n - 1), s => 'Piège : ' + s + ' oublie un facteur dans le produit.']
    ], methode + ' Les ' + n + ' lettres de ' + W + ' sont toutes différentes : aucune division. ' + factTxt(n) + ' = ' + nb(ans) + '.', 1);
  }
  const L = reps[0];
  return sortie(q, ans, [
    [N, s => 'Piège : ' + s + ' compte deux fois chaque mot, car échanger les deux ' + L + ' ne change rien.'],
    [ans - 1, s => 'Piège : ' + s + ' oublie de compter le mot ' + W + ' lui-même.'],
    [fact(n - 1), s => 'Piège : ' + s + ' oublie un facteur dans le produit.']
  ], methode + ' ' + W + ' a ' + n + ' lettres, dont deux ' + L + '. Avec ' + n + ' lettres toutes différentes, on aurait ' + factTxt(n) + ' = ' + nb(N) + ' rangements. Échanger les deux ' + L + ' ne change rien : chaque mot est compté 2 fois. ' + nb(N) + ' ÷ 2 = ' + nb(ans) + '.', 1);
}

function n3auMoinsDeux(R){
  const ctx = R.int(0, 4);
  if (ctx === 0){
    const q = 'Combien de nombres de 3 chiffres ont au moins deux chiffres identiques (comme 552 ou 707)' + QM;
    return sortie(q, 252, [
      [648, s => 'Piège : ' + s + ' compte les nombres aux chiffres tous différents : c\'est le contraire, qu\'il faut retirer du total.'],
      [243, s => 'Piège : ' + s + ' oublie les nombres aux trois chiffres égaux, comme 444.'],
      [280, s => 'Piège : ' + s + ' compte les écritures de 000 à 999, y compris celles qui commencent par 0.'],
      [891, s => 'Piège : ' + s + ' ne retire que les nombres aux trois chiffres égaux.']
    ], 'On compte le contraire, les nombres aux trois chiffres tous différents, et on le retire du total. Total : 900 nombres, de 100 à 999. Tous différents : 9 × 9 × 8 = 648 (premier chiffre sans 0). Donc 900 − 648 = 252.', 1);
  }
  if (ctx === 1){
    const ticket = R.int(0, 1) === 1;
    const q = (ticket ? 'Les tickets d\'une tombola portent tous les numéros de 000 à 999, toujours écrits avec 3 chiffres. Combien de tickets' : 'Un cadenas possède 3 molettes portant chacune les chiffres de 0 à 9 : les codes vont de 000 à 999. Combien de codes') + ' ont au moins deux chiffres identiques' + QM;
    return sortie(q, 280, [
      [720, s => 'Piège : ' + s + ' compte les cas aux chiffres tous différents : c\'est le contraire, qu\'il faut retirer du total.'],
      [270, s => 'Piège : ' + s + ' oublie les cas aux trois chiffres égaux, comme 000 ou 777.'],
      [252, s => 'Piège : ' + s + ' ne compte que les numéros de 100 à 999 ; ici, le 0 est permis en tête.'],
      [990, s => 'Piège : ' + s + ' ne retire que les cas aux trois chiffres égaux.']
    ], 'On compte le contraire, les cas aux trois chiffres tous différents, et on le retire du total. Total : 10 × 10 × 10 = 1 000. Tous différents : 10 × 9 × 8 = 720. Donc 1 000 − 720 = 280.', 1);
  }
  let m, k, q, T, D, quoi;
  if (ctx === 2){
    [m, k] = R.pick([[4, 3], [5, 3], [6, 3], [4, 4], [5, 4]]);
    q = 'Un cadenas possède ' + k + ' molettes portant chacune les chiffres de 1 à ' + m + '. Combien de codes ont au moins deux chiffres identiques' + QM;
    quoi = 'chiffres';
  } else if (ctx === 3){
    m = 6; k = 3;
    q = 'On lance un dé rouge, un dé bleu et un dé vert, à six faces, et on note les trois résultats couleur par couleur. Combien de résultats comportent au moins deux dés qui montrent la même valeur' + QM;
    quoi = 'valeurs';
  } else {
    m = 7; k = 3;
    const t = deuxNoms(R);
    q = t[0].n + ', ' + t[1].n + ' et ' + t[2].n + ' notent ' + (t.every(x => x.g === 'f') ? 'chacune' : 'chacun') + ' le jour de la semaine de leur naissance. Combien de listes (jour ' + de(t[0].n) + ', jour ' + de(t[1].n) + ', jour ' + de(t[2].n) + ') comportent au moins deux jours identiques' + QM;
    quoi = 'jours';
  }
  T = puis(m, k); D = arr(m, k);
  const ans = T - D;
  return sortie(q, ans, [
    [D, s => 'Piège : ' + s + ' compte les cas aux ' + quoi + ' tous différents : c\'est le contraire, qu\'il faut retirer du total.'],
    [k === 3 ? ans - m : null, s => 'Piège : ' + s + ' oublie les cas aux trois ' + quoi + ' égaux.'],
    [T - m, s => 'Piège : ' + s + ' ne retire que les cas aux ' + quoi + ' tous égaux.']
  ], 'On compte le contraire, les cas aux ' + quoi + ' tous différents, et on le retire du total. Total : ' + repete(m, k) + ' = ' + nb(T) + '. Tous différents : ' + facteurs(m, k) + ' = ' + nb(D) + '. Donc ' + nb(T) + ' − ' + nb(D) + ' = ' + nb(ans) + '.', 1);
}

function n3trios(R){
  const ctx = R.int(0, 3);
  if (ctx === 3){
    const croissant = R.int(0, 1) === 0;
    if (croissant){
      const q = 'Combien de nombres de 2 chiffres ont un chiffre des dizaines strictement plus petit que celui des unités (comme 37)' + QM;
      return sortie(q, 36, [
        [45, s => 'Piège : ' + s + ' accepte le 0, qui serait alors en tête, comme dans 05.'],
        [72, s => 'Piège : ' + s + ' compte les deux ordres de chaque paire de chiffres ; un seul est croissant.'],
        [81, s => 'Piège : ' + s + ' = 9 × 9 ne tient pas compte de la condition.']
      ], 'On choisit deux chiffres différents, puis on remarque qu\'un seul ordre convient, le croissant. Le 0 ne peut pas servir : rangé en croissant, il serait en tête. On choisit donc 2 chiffres parmi 1 à 9 : 9 × 8 ÷ 2 = 36 paires, et chaque paire donne exactement un nombre.', 1);
    }
    const q = 'Combien de nombres de 2 chiffres ont un chiffre des dizaines strictement plus grand que celui des unités (comme 72)' + QM;
    return sortie(q, 45, [
      [36, s => 'Piège : ' + s + ' oublie les nombres qui finissent par 0, comme 50.'],
      [90, s => 'Piège : ' + s + ' compte les deux ordres de chaque paire de chiffres ; un seul est décroissant.'],
      [81, s => 'Piège : ' + s + ' = 9 × 9 ne tient pas compte de la condition.']
    ], 'On choisit deux chiffres différents, puis on remarque qu\'un seul ordre convient, le décroissant. Le 0 peut servir : rangé en décroissant, il se retrouve à la fin, jamais en tête. On choisit donc 2 chiffres parmi les 10 : 10 × 9 ÷ 2 = 45 paires, et chaque paire donne exactement un nombre.', 1);
  }
  let n, q;
  if (ctx === 0){
    n = R.int(5, 10);
    q = 'Une pizzeria propose ' + n + ' garnitures. Pour composer une pizza, on choisit 3 garnitures différentes ; l\'ordre des garnitures ne compte pas. Combien de pizzas différentes peut-on composer' + QM;
  } else if (ctx === 1){
    n = R.int(5, 10);
    q = 'On place ' + n + ' points sur un cercle. Combien de triangles ont leurs trois sommets parmi ces points' + QM;
  } else {
    n = R.int(5, 12);
    q = 'Un entraîneur choisit 3 joueurs parmi ' + n + ' pour former une équipe, sans rôle particulier. Combien d\'équipes différentes peut-il former' + QM;
  }
  const O = arr(n, 3), ans = O / 6;
  return sortie(q, ans, [
    [O, s => 'Piège : ' + s + ' compte chaque trio 6 fois, une fois pour chaque ordre.'],
    [O / 3, s => 'Piège : ' + s + ' divise par 3 au lieu de 6 : trois objets se rangent de 3 × 2 × 1 = 6 façons.'],
    [O / 2, s => 'Piège : ' + s + ' divise par 2, comme pour une paire ; un trio se range de 6 façons.'],
    [n * (n - 1) / 2, s => 'Piège : ' + s + ' compte des paires, pas des trios.']
  ], 'On compte d\'abord les choix dans l\'ordre, puis on divise par le nombre d\'ordres d\'un même trio, qui vaut 3 × 2 × 1 = 6. Choix ordonnés : ' + facteurs(n, 3) + ' = ' + nb(O) + '. Chaque trio y apparaît 6 fois : ' + nb(O) + ' ÷ 6 = ' + nb(ans) + '.', 1);
}

function n3diag(R){
  const diag = n => n * (n - 3) / 2;
  if (R.int(0, 2) < 2){
    const n = R.int(5, 12), ans = diag(n);
    const q = 'Une diagonale d\'un polygone relie deux sommets qui ne sont pas voisins. Combien de diagonales possède un polygone convexe à ' + n + ' côtés' + QM;
    return sortie(q, ans, [
      [n * (n - 1) / 2, s => 'Piège : ' + s + ' compte tous les segments entre deux sommets, y compris les ' + n + ' côtés.'],
      [n * (n - 3), s => 'Piège : ' + s + ' compte chaque diagonale deux fois, une fois depuis chacune de ses extrémités.'],
      [n * (n - 2) / 2, s => 'Piège : ' + s + ' fait partir ' + (n - 2) + ' diagonales de chaque sommet ; il n\'y en a que ' + (n - 3) + '.'],
      [n - 3, s => 'Piège : ' + s + ' est le nombre de diagonales issues d\'un seul sommet.']
    ], 'De chaque sommet partent des diagonales vers tous les sommets sauf lui-même et ses deux voisins, puis on divise par 2 car chaque diagonale a deux extrémités. Chaque sommet : ' + n + ' − 3 = ' + (n - 3) + ' diagonales. ' + n + ' × ' + (n - 3) + ' ÷ 2 = ' + nb(ans) + '.', 1);
  }
  const n = R.int(5, 12), D = diag(n);
  const q = 'Une diagonale d\'un polygone relie deux sommets qui ne sont pas voisins. Un polygone convexe possède ' + D + ' diagonales. Combien a-t-il de côtés' + QM;
  const pg = v => [v, s => 'Piège : un polygone à ' + s + ' côtés aurait ' + diag(v) + ' diagonales, pas ' + D + '.'];
  return sortie(q, n, [pg(n + 1), pg(n - 1), pg(n + 2)],
    'Un polygone à n côtés a n × (n − 3) ÷ 2 diagonales : on cherche n tel que ce nombre soit égal à ' + D + '. Il faut n × (n − 3) = ' + (2 * D) + ', et ' + n + ' × ' + (n - 3) + ' = ' + (2 * D) + '. Le polygone a donc ' + n + ' côtés.', 1);
}

function n3cote(R){
  const ctx = R.int(0, 3), n = R.int(4, 6), t = deuxNoms(R), X = t[0].n, Y = t[1].n;
  if (ctx === 0){
    const ans = 2 * fact(n - 1);
    const q = n + ' amis, dont ' + X + ' et ' + Y + ', s\'assoient sur un banc de ' + n + ' places. ' + X + ' et ' + Y + ' veulent être côte à côte. Combien de placements différents sont possibles' + QM;
    return sortie(q, ans, [
      [fact(n - 1), s => 'Piège : ' + s + ' oublie que ' + X + ' et ' + Y + ' peuvent échanger leurs places dans le bloc.'],
      [fact(n), s => 'Piège : ' + s + ' ne tient pas compte de la contrainte.'],
      [2 * (n - 1), s => 'Piège : ' + s + ' compte seulement où placer le duo et dans quel ordre, sans ranger les autres amis.']
    ], 'On colle ' + X + ' et ' + Y + ' en un seul bloc, on range ce bloc avec les autres, puis on multiplie par le nombre d\'ordres à l\'intérieur du bloc. Le bloc et les ' + (n - 2) + ' autres font ' + (n - 1) + ' éléments à ranger : ' + factTxt(n - 1) + ' = ' + nb(fact(n - 1)) + '. Dans le bloc, 2 ordres : 2 × ' + nb(fact(n - 1)) + ' = ' + nb(ans) + '.', 2);
  }
  if (ctx === 1){
    const ans = 2 * fact(n - 1);
    const q = 'On range ' + n + ' livres différents, dont un dictionnaire, côte à côte sur une étagère. Le dictionnaire doit être à l\'une des deux extrémités. Combien de rangements différents sont possibles' + QM;
    return sortie(q, ans, [
      [fact(n - 1), s => 'Piège : ' + s + ' oublie l\'une des deux extrémités.'],
      [fact(n), s => 'Piège : ' + s + ' ne tient pas compte de la contrainte.'],
      [fact(n) - ans, s => 'Piège : ' + s + ' compte les rangements où le dictionnaire n\'est PAS à une extrémité.']
    ], 'On place d\'abord l\'élément contraint, puis on range les autres librement. Le dictionnaire a 2 places possibles (à gauche ou à droite). Les ' + (n - 1) + ' autres livres se rangent ensuite de ' + factTxt(n - 1) + ' = ' + nb(fact(n - 1)) + ' façons. 2 × ' + nb(fact(n - 1)) + ' = ' + nb(ans) + '.', 2);
  }
  if (ctx === 2){
    const ans = (n - 1) * fact(n - 1);
    const q = n + ' personnes, dont ' + X + ', font la queue à un guichet. ' + X + ' refuse d\'être en première position. Combien d\'ordres différents sont possibles pour la file' + QM;
    return sortie(q, ans, [
      [fact(n - 1), s => 'Piège : ' + s + ' compte les files où ' + X + ' est en tête : c\'est le contraire.'],
      [fact(n), s => 'Piège : ' + s + ' ne tient pas compte de la contrainte.'],
      [fact(n) - 1, s => 'Piège : ' + s + ' ne retire qu\'une seule file, alors que ' + X + ' en tête laisse ' + factTxt(n - 1) + ' rangements des autres.']
    ], 'On remplit d\'abord la place contrainte, la première, puis les autres librement. Première place : ' + (n - 1) + ' choix (tout le monde sauf ' + X + '). Les ' + (n - 1) + ' personnes restantes se rangent ensuite de ' + factTxt(n - 1) + ' = ' + nb(fact(n - 1)) + ' façons. ' + (n - 1) + ' × ' + nb(fact(n - 1)) + ' = ' + nb(ans) + '.', n - 1);
  }
  const ans = 2 * fact(n - 2);
  const q = 'Pour une photo, ' + n + ' amis, dont ' + X + ' et ' + Y + ', se placent en ligne. ' + X + ' et ' + Y + ' veulent être aux deux bouts de la ligne. Combien de placements différents sont possibles' + QM;
  return sortie(q, ans, [
    [fact(n - 2), s => 'Piège : ' + s + ' oublie que ' + X + ' et ' + Y + ' peuvent échanger leurs bouts.'],
    [2 * fact(n - 1), s => 'Piège : ' + s + ' ne bloque qu\'un seul des deux bouts.'],
    [fact(n), s => 'Piège : ' + s + ' ne tient pas compte de la contrainte.']
  ], 'On place d\'abord ' + X + ' et ' + Y + ' aux bouts, puis les autres au milieu. ' + X + ' et ' + Y + ' : 2 façons (' + X + ' à gauche ou à droite). Les ' + (n - 2) + ' autres : ' + factTxt(n - 2) + ' = ' + nb(fact(n - 2)) + ' façons. 2 × ' + nb(fact(n - 2)) + ' = ' + nb(ans) + '.', 2);
}

function n3unChiffre(R){
  const k = R.int(1, 10) <= 2 ? 4 : R.int(2, 3), lo = puis(10, k - 1), hi = puis(10, k) - 1;
  if (R.int(0, 2) < 2){
    const d = R.int(1, 10) <= 2 ? 0 : R.int(1, 9), T = 9 * lo;
    const q = 'Combien de nombres de ' + k + ' chiffres (de ' + nb(lo) + ' à ' + nb(hi) + ') contiennent au moins un chiffre ' + d + QM;
    const codes = puis(10, k) - puis(9, k);
    if (d === 0){
      const S = puis(9, k), ans = T - S;
      return sortie(q, ans, [
        [codes, s => 'Piège : ' + s + ' compte les écritures de ' + '0'.repeat(k) + ' à ' + '9'.repeat(k) + ' ; un nombre de ' + k + ' chiffres ne commence pas par 0.'],
        [(k - 1) * puis(9, k - 1), s => 'Piège : ' + s + ' compte seulement les nombres qui ont exactement un 0.'],
        [k >= 3 ? (k - 1) * 9 * puis(10, k - 2) : null, s => 'Piège : ' + s + ' compte plusieurs fois les nombres qui ont plusieurs 0.']
      ], 'On compte le contraire, les nombres sans aucun 0, puis on les retire des ' + nb(T) + ' nombres de ' + nb(lo) + ' à ' + nb(hi) + '. Sans 0 : 9 choix (1 à 9) pour chacune des ' + k + ' places, soit ' + repete(9, k) + ' = ' + nb(S) + '. Donc ' + nb(T) + ' − ' + nb(S) + ' = ' + nb(ans) + '.', 1);
    }
    const S = 8 * puis(9, k - 1), ans = T - S;
    return sortie(q, ans, [
      [codes, s => 'Piège : ' + s + ' compte les écritures de ' + '0'.repeat(k) + ' à ' + '9'.repeat(k) + ' ; un nombre de ' + k + ' chiffres ne commence pas par 0.'],
      [T - puis(9, k), s => 'Piège : ' + s + ' laisse 9 choix au premier chiffre ; or il ne peut être ni 0 ni ' + d + ', il reste 8 choix.'],
      [puis(9, k - 1) + (k - 1) * 8 * puis(9, k - 2), s => 'Piège : ' + s + ' compte seulement les nombres qui ont exactement un ' + d + '.'],
      [k * lo, s => 'Piège : ' + s + ' compte plusieurs fois les nombres qui ont plusieurs ' + d + '.']
    ], 'On compte le contraire, les nombres sans aucun ' + d + ', en commençant par le premier chiffre, qui ne peut être ni 0 ni ' + d + '. Sans ' + d + ' : 8 choix pour le premier chiffre, puis 9 choix (tout sauf ' + d + ') pour chacun des ' + (k - 1) + ' autres, soit 8 × ' + repete(9, k - 1) + ' = ' + nb(S) + '. Il y a ' + nb(T) + ' nombres de ' + nb(lo) + ' à ' + nb(hi) + ', donc ' + nb(T) + ' − ' + nb(S) + ' = ' + nb(ans) + '.', 1);
  }
  const d = R.int(1, 9), S = puis(9, k), ans = puis(10, k) - S;
  const q = 'Combien de nombres entiers de 1 à ' + nb(hi) + ' s\'écrivent avec au moins un chiffre ' + d + QM;
  return sortie(q, ans, [
    [9 * lo - 8 * puis(9, k - 1), s => 'Piège : ' + s + ' ne compte que les nombres de ' + k + ' chiffres ; les plus petits comptent aussi.'],
    [hi - S, s => 'Piège : ' + s + ' retire ' + nb(S) + ' de ' + nb(hi) + ' ; mais les ' + nb(S) + ' écritures sans ' + d + ' comprennent ' + '0'.repeat(k) + ', qui n\'est pas dans la liste.'],
    [k * puis(9, k - 1), s => 'Piège : ' + s + ' compte seulement les nombres qui ont exactement un ' + d + '.'],
    [k * lo, s => 'Piège : ' + s + ' compte plusieurs fois les nombres qui ont plusieurs ' + d + '.']
  ], 'On écrit chaque nombre avec ' + k + ' chiffres (7 devient ' + '0'.repeat(k - 1) + '7) et on compte le contraire, les écritures sans ' + d + '. De ' + '0'.repeat(k) + ' à ' + '9'.repeat(k) + ', il y a ' + nb(puis(10, k)) + ' écritures, dont ' + repete(9, k) + ' = ' + nb(S) + ' sans ' + d + '. Donc ' + nb(puis(10, k)) + ' − ' + nb(S) + ' = ' + nb(ans) + ' écritures contiennent un ' + d + ', et ' + '0'.repeat(k) + ' n\'en fait pas partie : la réponse est ' + nb(ans) + '.', 1);
}

/* ================= NIVEAU 4 : plus dur que les exemples officiels ================= */
function n4anag(R){
  const W = R.pick(MOTS4), n = W.length, M = multiplicites(W);
  const reps = Object.keys(M).filter(c => M[c] > 1).sort((x, y) => M[y] - M[x]);
  const N = fact(n), div = produit(reps.map(c => fact(M[c]))), ans = N / div;
  const desc = reps.map(c => MOTS_NB[M[c]] + ' ' + c).join(', ');
  const divTxt = reps.map(c => M[c] === 2 ? '2 pour les ' + c : factTxt(M[c]) + ' = ' + fact(M[c]) + ' pour les ' + c).join(', ');
  const L0 = reps[0];
  const simple = reps.some(c => M[c] > 2) ? N / produit(reps.map(c => M[c])) : null;
  return sortie(enonceAnag(W), ans, [
    [N, s => 'Piège : ' + s + ' oublie que des lettres identiques échangées donnent le même mot.'],
    [simple, s => 'Piège : ' + s + ' divise par le nombre de lettres identiques au lieu du nombre de façons de les ranger (par exemple 3 × 2 × 1 = 6 pour trois lettres).'],
    [N / fact(M[L0]), s => 'Piège : ' + s + ' ne divise que pour les ' + L0 + ' ; il faut aussi diviser pour les autres lettres répétées.'],
    [ans - 1, s => 'Piège : ' + s + ' oublie de compter le mot ' + W + ' lui-même.']
  ], 'On range les lettres comme si elles étaient toutes différentes, puis on divise par le nombre d\'ordres de chaque groupe de lettres identiques. ' + W + ' a ' + n + ' lettres, avec ' + desc + '. Rangements de ' + n + ' lettres différentes : ' + factTxt(n) + ' = ' + nb(N) + '. On divise par ' + divTxt + ', soit par ' + div + ' : ' + nb(N) + ' ÷ ' + div + ' = ' + nb(ans) + '.', 1);
}

function n4croissants(R){
  if (R.int(0, 2) < 2){
    const k = R.int(3, 4), crois = R.int(0, 1) === 0, N = crois ? 9 : 10, ans = comb(N, k);
    let ex;
    if (crois) ex = R.shuffle(range(1, 9)).slice(0, k).sort((x, y) => x - y);
    else { ex = R.shuffle(range(0, 9)).slice(0, k).sort((x, y) => y - x); }
    const sens = crois ? 'croissants' : 'décroissants';
    const q = 'Combien de nombres de ' + k + ' chiffres ont des chiffres strictement ' + sens + ' de gauche à droite (comme ' + ex.join('') + ')' + QM;
    return sortie(q, ans, [
      [arr(N, k), s => 'Piège : ' + s + ' compte tous les ordres des chiffres choisis ; un seul est ' + (crois ? 'croissant' : 'décroissant') + ', il faut diviser par ' + fact(k) + '.'],
      [arr(N, k) / k, s => 'Piège : ' + s + ' divise par ' + k + ' au lieu de ' + factTxt(k) + ' = ' + fact(k) + '.'],
      crois ? [comb(10, k), s => 'Piège : ' + s + ' accepte le 0, qui serait alors en tête.'] : [comb(9, k), s => 'Piège : ' + s + ' oublie que 0 peut terminer un nombre décroissant, comme 520.']
    ], 'Choisir les chiffres suffit : une fois choisis, un seul ordre est ' + (crois ? 'croissant' : 'décroissant') + '. On compte donc les groupes de ' + k + ' chiffres différents, en divisant les choix ordonnés par le nombre d\'ordres, ' + fact(k) + '. ' + (crois ? 'Le 0 ne peut pas servir : rangé en croissant, il serait en tête. On choisit ' + k + ' chiffres parmi 1 à 9 : ' : 'Le 0 peut servir : rangé en décroissant, il se retrouve à la fin. On choisit ' + k + ' chiffres parmi les 10 : ') + combTxt(N, k) + ' = ' + nb(arr(N, k)) + ' ÷ ' + fact(k) + ' = ' + nb(ans) + '.', 1);
  }
  const m = R.int(5, 9), k = R.int(2, 4), ans = comb(m, k);
  const ex = R.shuffle(range(1, m)).slice(0, k).sort((x, y) => x - y);
  const q = 'Un code de ' + k + ' chiffres utilise les chiffres de 1 à ' + m + ', et ses chiffres doivent être strictement croissants de gauche à droite (comme ' + ex.join('') + '). Combien de codes sont possibles' + QM;
  return sortie(q, ans, [
    [arr(m, k), s => 'Piège : ' + s + ' compte tous les ordres des chiffres choisis ; un seul est croissant, il faut diviser par ' + fact(k) + '.'],
    [k > 2 ? arr(m, k) / k : null, s => 'Piège : ' + s + ' divise par ' + k + ' au lieu de ' + factTxt(k) + ' = ' + fact(k) + '.'],
    [puis(m, k), s => 'Piège : ' + s + ' ne tient pas compte de la condition.'],
    [comb(m, k - 1), s => 'Piège : ' + s + ' choisit un chiffre de moins.']
  ], 'Choisir les chiffres suffit : une fois choisis, un seul ordre est croissant. On compte donc les groupes de ' + k + ' chiffres différents parmi ' + m + ', en divisant les choix ordonnés par le nombre d\'ordres, ' + fact(k) + '. ' + combTxt(m, k) + ' = ' + nb(arr(m, k)) + ' ÷ ' + fact(k) + ' = ' + nb(ans) + '.', 1);
}

function cheminTxt(p, q){
  const mn = Math.min(p, q);
  return 'parmi les ' + (p + q) + ' pas, on choisit les ' + mn + ' qui vont ' + (mn === p ? 'à droite' : 'en haut') + ' : ' + combTxt(p + q, mn) + ' = ' + nb(comb(p + q, mn));
}
function n4chemins(R){
  const [p, q] = R.pick([[2, 2], [2, 3], [3, 2], [2, 4], [4, 2], [3, 3], [2, 5], [5, 2], [3, 4], [4, 3], [4, 4], [3, 5], [5, 3], [2, 6], [6, 2]]);
  const ans = comb(p + q, p), ctx = R.int(0, 2);
  let txt, droite = 'à droite', haut = 'en haut';
  if (ctx === 0){
    txt = 'Un quadrillage compte ' + p + ' carreaux en largeur et ' + q + ' carreaux en hauteur. Une fourmi part du coin en bas à gauche et veut atteindre le coin en haut à droite en marchant sur les lignes du quadrillage, uniquement vers la droite ou vers le haut. Combien de chemins différents peut-elle suivre' + QM;
  } else if (ctx === 1){
    const P = R.pick(PRENOMS);
    txt = 'Dans une ville aux rues en damier, l\'école ' + de(P.n) + ' se trouve ' + p + ' pâtés de maisons à l\'est et ' + q + ' pâtés de maisons au nord de chez ' + (P.g === 'f' ? 'elle' : 'lui') + '. ' + P.n + ' suit les rues et ne marche que vers l\'est ou vers le nord. Combien de trajets différents peut-' + pr(P) + ' emprunter' + QM;
    droite = 'vers l\'est'; haut = 'vers le nord';
  } else {
    txt = 'Combien de « mots » différents de ' + (p + q) + ' lettres peut-on écrire avec ' + p + ' lettres D et ' + q + ' lettres H (par exemple ' + 'D'.repeat(p) + 'H'.repeat(q) + ')' + QM;
  }
  const expl = ctx === 2
    ? 'C\'est une anagramme avec des lettres répétées : il suffit de choisir les places des lettres D, les autres reçoivent H. ' + 'Parmi les ' + (p + q) + ' places, on choisit les ' + Math.min(p, q) + ' places des ' + (Math.min(p, q) === p ? 'D' : 'H') + ' : ' + combTxt(p + q, Math.min(p, q)) + ' = ' + nb(ans) + '.'
    : 'Un trajet est une suite de ' + p + ' pas ' + droite + ' et ' + q + ' pas ' + haut + ' : il suffit de choisir lesquels des ' + (p + q) + ' pas vont ' + droite + '. ' + 'C\'est comme compter les mots formés de ' + p + ' lettres D et ' + q + ' lettres H : ' + cheminTxt(p, q) + '.';
  return sortie(txt, ans, [
    [p * q, s => 'Piège : ' + s + (ctx === 2 ? ' multiplie les deux nombres de lettres.' : ' compte les carreaux, pas les chemins.')],
    [puis(2, p + q), s => 'Piège : ' + s + (ctx === 2 ? ' laisse deux choix à chaque lettre, sans imposer ' + p + ' lettres D et ' + q + ' lettres H.' : ' laisse deux choix à chaque pas, sans imposer ' + p + ' pas d\'un côté et ' + q + ' de l\'autre.')],
    [(p + 1) * (q + 1), s => 'Piège : ' + s + ' compte les points du quadrillage, pas les chemins.'],
    [fact(p + q) / fact(p), s => 'Piège : ' + s + ' ne divise que pour une seule des deux directions.']
  ], expl, 1);
}

function n4comite(R){
  const filles = R.int(0, 1) === 0;
  let a = R.int(2, 4), b = R.int(3, 6);
  while (a + b > 9) b--;
  const g = filles ? b : a, f = filles ? a : b;
  const cible = filles ? 'fille' : 'garçon', une = filles ? 'une' : 'un', autres = filles ? 'garçons' : 'filles';
  const N = a + b, T = comb(N, 3), Z = comb(b, 3);
  const exact = R.int(0, 3) === 0;
  const intro = 'Un club compte ' + g + ' garçons et ' + f + ' filles. On choisit 3 de ces personnes pour former une équipe, sans rôle particulier. ';
  if (exact){
    const ans = a * comb(b, 2);
    const q = intro + 'Combien d\'équipes comptent exactement ' + une + ' ' + cible + QM;
    return sortie(q, ans, [
      [T - Z, s => 'Piège : ' + s + ' compte les équipes avec au moins ' + une + ' ' + cible + ', pas exactement ' + une + '.'],
      [a * b * (b - 1), s => 'Piège : ' + s + ' range les deux ' + autres + ' dans un ordre ; il faut diviser par 2.'],
      [a + comb(b, 2), s => 'Piège : ' + s + ' additionne les deux choix au lieu de les multiplier.']
    ], 'On choisit ' + (filles ? 'la fille' : 'le garçon') + ', puis les deux autres membres parmi les ' + autres + ', sans ordre, et on multiplie. ' + (filles ? 'La fille' : 'Le garçon') + ' : ' + a + ' choix. Deux ' + autres + ' parmi ' + b + ' : ' + b + ' × ' + (b - 1) + ' ÷ 2 = ' + comb(b, 2) + '. ' + a + ' × ' + comb(b, 2) + ' = ' + nb(ans) + '.', 1);
  }
  const ans = T - Z;
  const q = intro + 'Combien d\'équipes comptent au moins ' + une + ' ' + cible + QM;
  return sortie(q, ans, [
    [a * comb(N - 1, 2), s => 'Piège : ' + s + ' choisit d\'abord « ' + (filles ? 'la' : 'le') + ' » ' + cible + ', puis deux autres personnes : une équipe qui en compte deux est alors comptée deux fois.'],
    [a * comb(b, 2), s => 'Piège : ' + s + ' compte seulement les équipes avec exactement ' + une + ' ' + cible + '.'],
    [T, s => 'Piège : ' + s + ' oublie de retirer les équipes sans ' + cible + '.']
  ], 'On compte toutes les équipes, puis on retire celles qui n\'ont aucun' + (filles ? 'e fille' : ' garçon') + '. Toutes : ' + combTxt(N, 3) + ' = ' + nb(T) + '. Sans ' + cible + ' (3 ' + autres + ' parmi ' + b + ') : ' + combTxt(b, 3) + ' = ' + nb(Z) + '. ' + nb(T) + ' − ' + nb(Z) + ' = ' + nb(ans) + '.', 1);
}

function n4pasCote(R){
  const n = R.int(4, 6), t = deuxNoms(R), X = t[0].n, Y = t[1].n, ctx = R.int(0, 2), d = duo(t[0], t[1]);
  const T = fact(n), C = 2 * fact(n - 1), ans = T - C;
  const q = ctx === 0
    ? n + ' amis, dont ' + X + ' et ' + Y + ', s\'assoient sur ' + n + ' chaises alignées. ' + X + ' et ' + Y + ' refusent d\'être côte à côte. Combien de placements différents sont possibles' + QM
    : ctx === 1
      ? 'Pour une photo de classe, ' + n + ' élèves, dont ' + X + ' et ' + Y + ', se placent en ligne. ' + X + ' et ' + Y + ' ne doivent pas être ' + d.voisins + '. Combien de placements différents sont possibles' + QM
      : n + ' coureurs, dont ' + X + ' et ' + Y + ', se placent sur ' + n + ' couloirs voisins numérotés. ' + X + ' et ' + Y + ' ne doivent pas occuper deux couloirs voisins. Combien de répartitions différentes sont possibles' + QM;
  return sortie(q, ans, [
    [C, s => 'Piège : ' + s + ' compte les placements où ' + X + ' et ' + Y + ' SONT ' + d.voisins + '.'],
    [T - fact(n - 1), s => 'Piège : ' + s + ' ne retire qu\'un ordre du duo ; ' + X + ' puis ' + Y + ', ou ' + Y + ' puis ' + X + ', ce sont deux placements différents.'],
    [T, s => 'Piège : ' + s + ' ne tient pas compte de la contrainte.']
  ], 'On compte tous les placements, puis on retire ceux où ' + X + ' et ' + Y + ' sont ' + d.voisins + '. Tous : ' + factTxt(n) + ' = ' + nb(T) + '. ' + (d.voisins === 'voisins' ? 'Voisins' : 'Voisines') + ' : on colle ' + X + ' et ' + Y + ' en un bloc, ce qui fait ' + (n - 1) + ' éléments à ranger, soit ' + nb(fact(n - 1)) + ' rangements, fois 2 pour l\'ordre dans le bloc : ' + nb(C) + '. ' + nb(T) + ' − ' + nb(C) + ' = ' + nb(ans) + '.', 2);
}

function n4monnaie(R){
  const cfg = R.pick([
    {v: [10, 20, 50], S: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150], u: 'centimes', piece: x => 'pièces de ' + x + ' centimes'},
    {v: [5, 10, 20], S: [25, 30, 35, 40, 45, 50, 55, 60], u: 'centimes', piece: x => 'pièces de ' + x + ' centimes'},
    {v: [1, 2, 5], S: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], u: 'euros', piece: x => x === 5 ? 'billets de 5 €' : 'pièces de ' + x + ' €'}
  ]);
  const S = R.pick(cfg.S), [p, m, g] = cfg.v;
  let ans = 0, tous = 0;
  const lignes = [];
  for (let c = 0; c * g <= S; c++){
    const reste = S - c * g, nbm = Math.floor(reste / m) + 1;
    ans += nbm;
    for (let b = 1; b * m < reste; b++) if ((reste - b * m) % p === 0 && c >= 1) tous++;
    const uu = cfg.u === 'euros' ? ' €' : ' c', moy = (nbm - 1 > 1 ? 'pièces de ' : 'pièce de ') + m + uu;
    const suite = reste === 0 ? 'il ne reste rien à payer' : nbm === 1 ? 'il reste ' + reste + uu + ', payé uniquement en pièces de ' + p + uu : 'il reste ' + reste + uu + ', et l\'on met de 0 à ' + (nbm - 1) + ' ' + moy;
    lignes.push(c + ' ' + (cfg.u === 'euros' ? 'billet' + (c > 1 ? 's' : '') + ' de ' + g + ' €' : 'pièce' + (c > 1 ? 's' : '') + ' de ' + g + ' c') + ' : ' + suite + ', soit ' + nbm + ' ' + pl(nbm, 'façon', 'façons'));
  }
  const sorte = cfg.u === 'euros' ? 'pièces de 1 € et de 2 € et des billets de 5 €' : 'pièces de ' + p + ', ' + m + ' et ' + g + ' centimes';
  const q = 'De combien de façons différentes peut-on payer exactement ' + S + ' ' + cfg.u + ' avec des ' + sorte + '' + QM + ' On dispose d\'autant de pièces' + (cfg.u === 'euros' ? ' et de billets' : '') + ' que nécessaire, on peut ne pas utiliser une sorte, et l\'ordre ne compte pas.';
  return sortie(q, ans, [
    [ans - 1, s => 'Piège : ' + s + ' oublie un cas ; en classant les paiements par nombre de ' + (cfg.u === 'euros' ? 'billets' : 'grosses pièces') + ', on n\'en oublie aucun.'],
    [tous, s => 'Piège : ' + s + ' ne compte que les paiements qui utilisent les trois sortes à la fois.'],
    [ans + 1, null]
  ], 'On classe les paiements selon le nombre de ' + (cfg.u === 'euros' ? 'billets de 5 €' : 'pièces de ' + g + ' centimes') + ', puis, dans chaque cas, selon le nombre de ' + (cfg.u === 'euros' ? 'pièces de 2 €' : 'pièces de ' + m + ' centimes') + ' ; les plus petites pièces complètent. ' + lignes.map(l => 'Avec ' + l + '.').join(' ') + ' Total : ' + lignes.map(l => l.replace(/.* soit (\d+) façons?$/, '$1')).join(' + ') + ' = ' + ans + '.', 1);
}

function n4couples(R){
  const n = R.int(3, 8), ans = 2 * n * (n - 1), P = 2 * n;
  const q = n + ' couples se retrouvent pour un dîner. Chaque personne serre une fois la main de chacune des autres, sauf de la personne avec qui elle est en couple. Combien de poignées de main sont échangées' + QM;
  return sortie(q, ans, [
    [comb(P, 2), s => 'Piège : ' + s + ' oublie de retirer les ' + n + ' couples.'],
    [2 * ans, s => 'Piège : ' + s + ' compte chaque poignée de main deux fois, une fois pour chacune des deux personnes.'],
    [comb(P, 2) - P, s => 'Piège : ' + s + ' retire ' + P + ' paires au lieu des ' + n + ' couples.']
  ], 'On compte toutes les paires de personnes, puis on retire les paires qui forment un couple. Il y a ' + P + ' personnes : ' + P + ' × ' + (P - 1) + ' ÷ 2 = ' + nb(comb(P, 2)) + ' paires. On retire les ' + n + ' couples : ' + nb(comb(P, 2)) + ' − ' + n + ' = ' + nb(ans) + '.', 2);
}

/* ================= NIVEAU 5 : haut du test adaptatif ================= */
const MOTS5 = ['CHIEN', 'LAPIN', 'ROUTE', 'PIANO', 'MOTIF', 'SUCRE', 'TIGRE', 'JARDIN', 'CAMION', 'POULET', 'PLANTE', 'BRIQUE',
  'CITRON', 'DRAGON', 'VOLCAN', 'CHEMIN', 'MONDE', 'FRUIT', 'SALON', 'NUAGE', 'PLUME', 'TRAIN', 'PORTE', 'MARDI', 'LUNDI', 'DOUCHE', 'PIGEON'];
const VOY = 'AEIOU';

function n5anag(R){
  const W = R.pick(MOTS5), n = W.length, L = W.split('');
  const V = L.filter(c => VOY.indexOf(c) >= 0), v = V.length, c = n - v;
  const kinds = ['VC', 'boutsC', 'enBloc', 'separees', 'avant'].filter(t =>
    (t !== 'boutsC' || c >= 2) && (t !== 'enBloc' || v >= 2) && (t !== 'separees' || (v >= 2 && v <= c + 1)));
  const t = R.pick(kinds), N = fact(n);
  const intro = 'On écrit tous les « mots », ayant un sens ou non, formés avec les ' + n + ' lettres du mot ' + W + ', chacune utilisée une fois. ';
  const voyTxt = 'Les voyelles de ' + W + ' sont ' + listeEt(V) + '. ';
  if (t === 'VC'){
    const ans = v * c * fact(n - 2);
    return sortie(intro + voyTxt + 'Combien de ces mots commencent par une voyelle et finissent par une consonne' + QM, ans, [
      [v * fact(n - 1), s => 'Piège : ' + s + ' ne contrôle que la première lettre.'],
      [v * c, s => 'Piège : ' + s + ' oublie de ranger les lettres du milieu.'],
      [(v + c) * fact(n - 2), s => 'Piège : ' + s + ' additionne les choix des deux bouts au lieu de les multiplier.'],
      [N - ans, s => 'Piège : ' + s + ' compte les mots qui ne vérifient pas la condition.']
    ], 'On remplit d\'abord les deux places contraintes, la première et la dernière, puis on range les lettres du milieu. Première lettre : ' + v + ' voyelles possibles. Dernière : ' + c + ' consonnes possibles. Milieu : ' + factTxt(n - 2) + ' = ' + nb(fact(n - 2)) + ' rangements. ' + v + ' × ' + c + ' × ' + nb(fact(n - 2)) + ' = ' + nb(ans) + '.', 1);
  }
  if (t === 'boutsC'){
    const ans = c * (c - 1) * fact(n - 2);
    return sortie(intro + voyTxt + 'Combien de ces mots commencent et finissent par une consonne' + QM, ans, [
      [c * c * fact(n - 2), s => 'Piège : ' + s + ' met la même consonne aux deux bouts, alors que chaque lettre ne sert qu\'une fois.'],
      [c * (c - 1), s => 'Piège : ' + s + ' oublie de ranger les lettres du milieu.'],
      [c * fact(n - 1), s => 'Piège : ' + s + ' ne contrôle que la première lettre.']
    ], 'On place d\'abord les deux bouts, puis on range les lettres du milieu. Il y a ' + c + ' consonnes. Première lettre : ' + c + ' choix ; dernière : ' + (c - 1) + ' choix ; milieu : ' + factTxt(n - 2) + ' = ' + nb(fact(n - 2)) + ' rangements. ' + c + ' × ' + (c - 1) + ' × ' + nb(fact(n - 2)) + ' = ' + nb(ans) + '.', 1);
  }
  if (t === 'enBloc'){
    const ans = fact(c + 1) * fact(v);
    return sortie(intro + voyTxt + 'Combien de ces mots ont toutes leurs voyelles côte à côte' + QM, ans, [
      [fact(c + 1), s => 'Piège : ' + s + ' oublie l\'ordre des voyelles à l\'intérieur du bloc.'],
      [fact(c) * fact(v), s => 'Piège : ' + s + ' oublie que le bloc de voyelles peut se placer à différents endroits.'],
      [N - ans, s => 'Piège : ' + s + ' compte les mots où les voyelles ne sont pas toutes collées.']
    ], 'On colle les voyelles en un seul bloc, on range ce bloc avec les consonnes, puis on range les voyelles à l\'intérieur du bloc. Le bloc et les ' + c + ' consonnes font ' + (c + 1) + ' éléments : ' + factTxt(c + 1) + ' = ' + nb(fact(c + 1)) + '. Ordres dans le bloc : ' + factTxt(v) + ' = ' + fact(v) + '. ' + nb(fact(c + 1)) + ' × ' + fact(v) + ' = ' + nb(ans) + '.', 1);
  }
  if (t === 'separees'){
    const ans = fact(c) * arr(c + 1, v);
    return sortie(intro + voyTxt + 'Combien de ces mots n\'ont jamais deux voyelles côte à côte' + QM, ans, [
      [N - fact(c + 1) * fact(v), s => 'Piège : ' + s + ' retire seulement les mots où toutes les voyelles sont collées ; il faut aussi retirer ceux où deux voyelles seulement se touchent.'],
      [fact(c) * comb(c + 1, v), s => 'Piège : ' + s + ' oublie l\'ordre des voyelles.'],
      [fact(c + 1) * fact(v), s => 'Piège : ' + s + ' compte les mots où les voyelles sont toutes collées.'],
      [arr(c + 1, v), s => 'Piège : ' + s + ' oublie de ranger les consonnes.']
    ], 'On range d\'abord les consonnes, puis on glisse les voyelles dans les espaces entre elles et aux deux bouts, au plus une voyelle par espace. Consonnes : ' + factTxt(c) + ' = ' + nb(fact(c)) + '. Il y a ' + (c + 1) + ' espaces ; on y place les ' + v + ' voyelles, dans l\'ordre : ' + facteurs(c + 1, v) + ' = ' + nb(arr(c + 1, v)) + '. ' + nb(fact(c)) + ' × ' + nb(arr(c + 1, v)) + ' = ' + nb(ans) + '.', 1);
  }
  const pair = R.shuffle(L).slice(0, 2), ans = N / 2;
  return sortie(intro + 'Combien de ces mots ont la lettre ' + pair[0] + ' placée avant la lettre ' + pair[1] + ' (pas forcément juste avant)' + QM, ans, [
    [N, s => 'Piège : ' + s + ' compte aussi les mots où ' + pair[1] + ' est avant ' + pair[0] + '.'],
    [fact(n - 1), s => 'Piège : ' + s + ' colle ' + pair[0] + ' juste avant ' + pair[1] + ', ce que l\'énoncé n\'impose pas.'],
    [2 * fact(n - 1), s => 'Piège : ' + s + ' compte les mots où ' + pair[0] + ' et ' + pair[1] + ' sont voisins.']
  ], 'Pas besoin de compter cas par cas : en échangeant ' + pair[0] + ' et ' + pair[1] + ', on associe chaque mot à un autre, donc ' + pair[0] + ' est avant ' + pair[1] + ' dans exactement la moitié des mots. Tous les mots : ' + factTxt(n) + ' = ' + nb(N) + '. La moitié : ' + nb(N) + ' ÷ 2 = ' + nb(ans) + '.', 1);
}

function n5chemins(R){
  const [p, q] = R.pick([[3, 3], [3, 4], [4, 3], [4, 4], [3, 5], [5, 3], [2, 4], [4, 2], [2, 5], [5, 2], [2, 3], [3, 2]]);
  const a = R.int(1, p - 1), b = R.int(1, q - 1);
  const T = comb(p + q, p), C1 = comb(a + b, a), C2 = comb(p - a + q - b, p - a), X = C1 * C2;
  const base = 'Sur un quadrillage, on va du point (0 ; 0) au point (' + p + ' ; ' + q + ') par pas d\'une unité, uniquement vers la droite ou vers le haut. ';
  const d1 = 'Du départ à (' + a + ' ; ' + b + ') : ' + a + ' ' + pl(a, 'pas', 'pas') + ' à droite et ' + b + ' en haut, soit ' + C1 + ' chemins. De (' + a + ' ; ' + b + ') à l\'arrivée : ' + (p - a) + ' à droite et ' + (q - b) + ' en haut, soit ' + C2 + ' chemins.';
  if (R.int(0, 1) === 0){
    return sortie(base + 'Combien de ces chemins passent par le point (' + a + ' ; ' + b + ')' + QM, X, [
      [C1 + C2, s => 'Piège : ' + s + ' additionne les deux morceaux ; chaque début se combine avec chaque fin, on multiplie.'],
      [T, s => 'Piège : ' + s + ' compte tous les chemins, sans la contrainte.'],
      [T - X, s => 'Piège : ' + s + ' compte les chemins qui évitent le point.']
    ], 'Un chemin qui passe par le point se coupe en deux morceaux indépendants, du départ au point puis du point à l\'arrivée, et l\'on multiplie leurs nombres. Pour chaque morceau, on choisit les places des pas à droite parmi tous ses pas. ' + d1 + ' ' + C1 + ' × ' + C2 + ' = ' + nb(X) + '.', 1);
  }
  const ans = T - X;
  return sortie(base + 'Le point (' + a + ' ; ' + b + ') est bloqué par un chantier. Combien de chemins évitent ce point' + QM, ans, [
    [X, s => 'Piège : ' + s + ' compte les chemins qui passent par le point bloqué.'],
    [T - 1, s => 'Piège : ' + s + ' ne retire qu\'un seul chemin, alors que beaucoup passent par ce point.'],
    [T, s => 'Piège : ' + s + ' ne tient pas compte du chantier.'],
    [T - C1 - C2, s => 'Piège : ' + s + ' retire la somme des deux morceaux au lieu de leur produit.']
  ], 'On compte tous les chemins, puis on retire ceux qui passent par le point bloqué. Tous : ' + p + ' pas à droite et ' + q + ' en haut, ' + cheminTxt(p, q) + '. ' + d1 + ' Par le point : ' + C1 + ' × ' + C2 + ' = ' + X + '. ' + nb(T) + ' − ' + nb(X) + ' = ' + nb(ans) + '.', 1);
}

function n5rect(R){
  if (R.int(0, 1) === 0){
    const m = R.int(2, 5), n = R.int(2, 5), X = comb(m + 1, 2), Y = comb(n + 1, 2), ans = X * Y;
    const q = 'Un grand rectangle est découpé en carreaux identiques : ' + m + ' carreaux en largeur et ' + n + ' carreaux en hauteur. Combien de rectangles de toutes tailles, dont les côtés suivent les lignes du quadrillage, peut-on y compter' + QM + ' Les carrés et le grand rectangle lui-même comptent.';
    return sortie(q, ans, [
      [m * n, s => 'Piège : ' + s + ' ne compte que les petits carreaux.'],
      [comb(m, 2) * comb(n, 2), s => 'Piège : ' + s + ' choisit deux traits parmi ' + m + ' et parmi ' + n + ' ; mais il y a ' + (m + 1) + ' traits verticaux et ' + (n + 1) + ' traits horizontaux.'],
      [X + Y, s => 'Piège : ' + s + ' additionne les choix de traits au lieu de les multiplier.']
    ], 'Un rectangle est déterminé par deux traits verticaux et deux traits horizontaux du quadrillage : on compte les paires de traits dans chaque sens, puis on multiplie. Traits verticaux : ' + (m + 1) + ', donc ' + (m + 1) + ' × ' + m + ' ÷ 2 = ' + X + ' paires. Traits horizontaux : ' + (n + 1) + ', donc ' + (n + 1) + ' × ' + n + ' ÷ 2 = ' + Y + ' paires. ' + X + ' × ' + Y + ' = ' + nb(ans) + '.', 1);
  }
  let m = R.int(2, 6), n = R.int(2, 6);
  if (m > n){ const t = m; m = n; n = t; }
  const termes = range(1, m).map(s => (m - s + 1) * (n - s + 1)), ans = somme(termes);
  const q = (m === n ? 'Un carré est découpé en ' + m + ' × ' + n + ' petits carreaux identiques.' : 'Un rectangle est découpé en carreaux identiques : ' + n + ' carreaux en largeur et ' + m + ' carreaux en hauteur.') + ' Combien de carrés de toutes tailles, dont les côtés suivent les lignes du quadrillage, peut-on y compter' + QM;
  return sortie(q, ans, [
    [m * n, s => 'Piège : ' + s + ' ne compte que les petits carreaux.'],
    [ans - termes[termes.length - 1], s => 'Piège : ' + s + ' oublie les plus grands carrés.'],
    [comb(m + 1, 2) * comb(n + 1, 2), s => 'Piège : ' + s + ' compte tous les rectangles, pas seulement les carrés.'],
    [m * n + 1, s => 'Piège : ' + s + ' ne compte que les petits carreaux et le grand contour.']
  ], 'On compte les carrés taille par taille : un carré de côté s (en carreaux) peut glisser sur ' + n + ' − s + 1 positions en largeur et ' + m + ' − s + 1 en hauteur. ' + range(1, m).map(s => 'Côté ' + s + ' : ' + (n - s + 1) + ' × ' + (m - s + 1) + ' = ' + termes[s - 1] + '.').join(' ') + ' Total : ' + termes.join(' + ') + ' = ' + nb(ans) + '.', 1);
}

function n5somme(R){
  const quatre = R.int(0, 3) === 0;
  const cnt2 = t => (t < 0 || t > 18) ? 0 : (t <= 9 ? t + 1 : 19 - t);
  const cnt3 = t => { let s = 0; for (let x = 0; x <= Math.min(9, t); x++) s += cnt2(t - x); return s; };
  if (quatre){
    const S = R.int(2, 5);
    const termes = range(1, S).map(a => cnt3(S - a)), ans = somme(termes);
    let multi = 0; for (let a = 9; a >= 0; a--) for (let b = a; b >= 0; b--) for (let c = b; c >= 0; c--) for (let d = c; d >= 0; d--) if (a + b + c + d === S) multi++;
    const ex = S + '000';
    const q = 'Combien de nombres de 4 chiffres ont une somme des chiffres égale à ' + S + ' (comme ' + ex + ')' + QM;
    return sortie(q, ans, [
      [cnt3(S) + ans, s => 'Piège : ' + s + ' compte aussi les écritures qui commencent par 0, qui ne sont pas des nombres de 4 chiffres.'],
      [multi, s => 'Piège : ' + s + ' compte les groupes de chiffres sans tenir compte de leur ordre, alors que deux ordres différents donnent deux nombres différents.'],
      [ans - 1, s => 'Piège : ' + s + ' oublie un cas.']
    ], 'On classe les nombres selon leur premier chiffre, qui vaut au moins 1, puis on compte les façons de compléter avec les trois autres chiffres. Trois chiffres de somme t se choisissent de (t + 1) + t + … + 1 façons (le premier des trois vaut 0, 1, …, t, puis deux chiffres de somme donnée). ' + range(1, S).map(a => 'Premier chiffre ' + a + ' : somme ' + (S - a) + ' pour les trois autres, ' + termes[a - 1] + ' ' + pl(termes[a - 1], 'façon', 'façons') + '.').join(' ') + ' Total : ' + termes.join(' + ') + ' = ' + nb(ans) + '.', 1);
  }
  const S = R.int(3, 11);
  const amax = Math.min(9, S), termes = range(1, amax).map(a => cnt2(S - a)), ans = somme(termes);
  let multi = 0; for (let a = 9; a >= 0; a--) for (let b = a; b >= 0; b--) for (let c = b; c >= 0; c--) if (a + b + c === S) multi++;
  const naif = somme(range(1, amax).map(a => S - a + 1));
  const ex = S <= 9 ? S + '00' : '9' + (S - 9) + '0';
  const q = 'Combien de nombres de 3 chiffres ont une somme des chiffres égale à ' + S + ' (comme ' + ex + ')' + QM;
  return sortie(q, ans, [
    [cnt2(S) + ans, s => 'Piège : ' + s + ' compte aussi les écritures qui commencent par 0, qui ne sont pas des nombres de 3 chiffres.'],
    [S >= 10 ? naif : null, s => 'Piège : ' + s + ' oublie qu\'un chiffre ne dépasse jamais 9 : deux chiffres de somme 10 ou plus ont moins de choix.'],
    [multi, s => 'Piège : ' + s + ' compte les groupes de chiffres sans tenir compte de leur ordre, alors que deux ordres différents donnent deux nombres différents.'],
    [ans - 1, s => 'Piège : ' + s + ' oublie un cas.']
  ], 'On classe les nombres selon leur premier chiffre, qui vaut au moins 1, puis on compte les façons de compléter avec deux chiffres. Deux chiffres de somme t se choisissent de t + 1 façons si t vaut au plus 9 (0 + t, 1 + (t − 1), …), et de 19 − t façons si t vaut 10 ou plus, car un chiffre ne dépasse pas 9. ' + range(1, amax).map(a => 'Premier chiffre ' + a + ' : ' + termes[a - 1] + '.').join(' ') + ' Total : ' + termes.join(' + ') + ' = ' + nb(ans) + '.', 1);
}

function n5triangles(R){
  if (R.int(0, 1) === 0){
    let p = R.int(2, 6), q = R.int(2, 6);
    if (p + q < 5) q = 3;
    const Y = comb(p, 2) * q, Z = comb(q, 2) * p, ans = Y + Z;
    const txt = 'Sur une droite d, on marque ' + p + ' points ; sur une droite d′ parallèle à d, on marque ' + q + ' points. Combien de triangles ont leurs trois sommets parmi ces ' + (p + q) + ' points' + QM;
    return sortie(txt, ans, [
      [comb(p + q, 3), s => 'Piège : ' + s + ' oublie que trois points d\'une même droite ne forment pas de triangle.'],
      [2 * ans, s => 'Piège : ' + s + ' compte chaque triangle deux fois.'],
      [Y, s => 'Piège : ' + s + ' oublie les triangles qui ont deux sommets sur d′.'],
      [Z, s => 'Piège : ' + s + ' oublie les triangles qui ont deux sommets sur d.']
    ], 'Un triangle ne peut pas avoir ses trois sommets sur une même droite : il a deux sommets sur une droite et le troisième sur l\'autre, et l\'on additionne ces deux cas. Deux sommets sur d : ' + p + ' × ' + (p - 1) + ' ÷ 2 = ' + comb(p, 2) + ' paires, fois ' + q + ' choix sur d′, soit ' + Y + '. Deux sommets sur d′ : ' + q + ' × ' + (q - 1) + ' ÷ 2 = ' + comb(q, 2) + ' paires, fois ' + p + ' choix sur d, soit ' + Z + '. Total : ' + Y + ' + ' + Z + ' = ' + nb(ans) + '.', 1);
  }
  const n = R.int(7, 10), k = R.int(4, 5), T = comb(n, 3), Al = comb(k, 3), ans = T - Al;
  const txt = 'On marque ' + n + ' points dans le plan. Parmi eux, ' + k + ' sont sur une même droite, et aucune autre droite ne passe par trois de ces points. Combien de triangles ont leurs trois sommets parmi ces ' + n + ' points' + QM;
  return sortie(txt, ans, [
    [T, s => 'Piège : ' + s + ' oublie que trois points alignés ne forment pas de triangle.'],
    [T - 1, s => 'Piège : ' + s + ' ne retire qu\'un seul trio aligné ; il y en a ' + Al + '.'],
    [T - k, s => 'Piège : ' + s + ' retire ' + k + ' trios, au lieu du nombre de trios pris parmi les ' + k + ' points alignés.'],
    [T - comb(k, 2), s => 'Piège : ' + s + ' retire des paires de points alignés au lieu des trios.']
  ], 'On compte tous les trios de points, puis on retire ceux qui sont alignés, car ils ne forment pas de triangle. Tous les trios : ' + combTxt(n, 3) + ' = ' + nb(T) + '. Trios alignés, pris parmi les ' + k + ' points de la droite : ' + combTxt(k, 3) + ' = ' + Al + '. ' + nb(T) + ' − ' + Al + ' = ' + nb(ans) + '.', 1);
}

function n5chaque(R){
  const ctx = R.int(0, 3);
  if (ctx === 0){
    const k = R.int(3, 4), T = puis(10, k), P = puis(5, k), ans = T - 2 * P;
    const z = '0'.repeat(k), n9 = '9'.repeat(k);
    const q = 'Un code de ' + k + ' chiffres va de ' + z + ' à ' + n9 + '. Combien de codes contiennent au moins un chiffre pair et au moins un chiffre impair' + QM;
    return sortie(q, ans, [
      [T - P, s => 'Piège : ' + s + ' ne retire que les codes sans chiffre pair ; il faut aussi retirer les codes sans chiffre impair.'],
      [2 * P, s => 'Piège : ' + s + ' compte les codes à retirer, pas ceux qui restent.'],
      [P, s => 'Piège : ' + s + ' ne compte que les codes formés uniquement de chiffres pairs.']
    ], 'On compte le contraire, les codes qui n\'ont que des chiffres pairs ou que des chiffres impairs, et on les retire du total. Total : ' + nb(T) + '. Que des pairs : ' + repete(5, k) + ' = ' + nb(P) + ' ; que des impairs : ' + nb(P) + ' aussi, et ces deux cas ne se chevauchent pas. ' + nb(T) + ' − 2 × ' + nb(P) + ' = ' + nb(ans) + '.', 1);
  }
  if (ctx === 1){
    const m = R.int(5, 10), t = R.shuffle(range(m === 10 ? 0 : 1, m === 10 ? 9 : m)), a = t[0], b = t[1], ans = 6 * (m - 2) + 6;
    const q = m === 10
      ? 'Combien de codes de 3 chiffres, de 000 à 999, contiennent au moins un chiffre ' + a + ' et au moins un chiffre ' + b + QM
      : 'Un cadenas possède 3 molettes portant chacune les chiffres de 1 à ' + m + '. Combien de codes contiennent au moins un chiffre ' + a + ' et au moins un chiffre ' + b + QM;
    return sortie(q, ans, [
      [puis(m, 3) - puis(m - 1, 3), s => 'Piège : ' + s + ' compte les codes qui contiennent au moins un ' + a + ', sans s\'occuper du ' + b + '.'],
      [6 * m, s => 'Piège : ' + s + ' place le ' + a + ' (3 places), puis le ' + b + ' (2 places), puis un chiffre quelconque : un code comme ' + a + a + b + ' est alors compté deux fois.'],
      [6 * (m - 2), s => 'Piège : ' + s + ' oublie les codes où ' + a + ' ou ' + b + ' apparaît deux fois.']
    ], 'On classe les codes selon le troisième chiffre qui accompagne ' + a + ' et ' + b + ', sans compter deux fois le même code. Cas 1 : ' + a + ', ' + b + ' et un autre chiffre (' + (m - 2) + ' choix), rangés de 3 × 2 × 1 = 6 façons : ' + (m - 2) + ' × 6 = ' + (6 * (m - 2)) + '. Cas 2 : deux ' + a + ' et un ' + b + ' : 3 places pour le ' + b + ', soit 3 codes. Cas 3 : un ' + a + ' et deux ' + b + ' : 3 codes. Total : ' + (6 * (m - 2)) + ' + 3 + 3 = ' + ans + '.', 1);
  }
  const k = R.int(3, 6), T = puis(3, k), U = 3 * puis(2, k), ans = T - U + 3;
  let q, rien, tout;
  if (ctx === 2){
    const t = deuxNoms(R);
    q = 'On distribue ' + k + ' cadeaux, tous différents, à trois enfants : ' + t[0].n + ', ' + t[1].n + ' et ' + t[2].n + '. Chaque enfant doit recevoir au moins un cadeau. De combien de façons peut-on faire cette distribution' + QM;
    rien = 'un enfant donné n\'a rien'; tout = 'un seul enfant reçoit tout';
  } else {
    q = 'Combien de « mots » de ' + k + ' lettres, écrits uniquement avec les lettres A, B et C, contiennent chacune de ces trois lettres au moins une fois' + QM;
    rien = 'une lettre donnée est absente'; tout = 'le mot n\'utilise qu\'une seule lettre';
  }
  return sortie(q, ans, [
    [T - U, s => 'Piège : ' + s + ' retire deux fois les cas où ' + tout + ' ; il faut les rajouter.'],
    [T - 3, s => 'Piège : ' + s + ' ne retire que les cas où ' + tout + '.'],
    [T, s => 'Piège : ' + s + ' ne tient pas compte de la condition.']
  ], 'On compte tous les cas, puis on retire ceux où ' + rien + ', sans retirer deux fois les mêmes. Tous : ' + repete(3, k) + ' = ' + nb(T) + ' (3 choix pour chaque ' + (ctx === 2 ? 'cadeau' : 'lettre') + '). Cas où ' + rien + ' : ' + repete(2, k) + ' = ' + puis(2, k) + ', et il y a 3 ' + (ctx === 2 ? 'enfants' : 'lettres') + ', soit ' + nb(U) + '. Mais les 3 cas où ' + tout + ' ont été retirés deux fois : on les rajoute. ' + nb(T) + ' − ' + nb(U) + ' + 3 = ' + nb(ans) + '.', 1);
}

function n5bureau(R){
  const ctx = R.int(0, 2), t = deuxNoms(R), X = t[0].n, Y = t[1].n, d = duo(t[0], t[1]);
  const n = ctx === 2 ? R.int(6, 9) : R.int(5, 9), T = arr(n, 3);
  const intro = 'Un club de ' + n + ' membres, dont ' + X + ' et ' + Y + ', élit un bureau : un président, un secrétaire et un trésorier, trois personnes différentes. ';
  if (ctx === 0){
    const B = 6 * (n - 2), ans = T - B;
    return sortie(intro + X + ' et ' + Y + ' refusent de siéger ensemble dans ce bureau. Combien de bureaux différents sont possibles' + QM, ans, [
      [T - (n - 2), s => 'Piège : ' + s + ' ne retire qu\'un bureau par troisième membre ; ' + X + ' et ' + Y + ' peuvent occuper deux des trois postes de 6 façons.'],
      [T - 3 * (n - 2), s => 'Piège : ' + s + ' oublie que ' + X + ' et ' + Y + ' peuvent échanger leurs deux postes.'],
      [B, s => 'Piège : ' + s + ' compte les bureaux où ' + d.ils + ' siègent ensemble.']
    ], 'On compte tous les bureaux, puis on retire ceux où ' + X + ' et ' + Y + ' siègent ' + d.tous + '. Tous : ' + facteurs(n, 3) + ' = ' + nb(T) + '. Avec ' + X + ' et ' + Y + ' : poste ' + de(X) + ' (3 choix), poste ' + de(Y) + ' (2 choix), puis le troisième membre parmi les ' + (n - 2) + ' autres : 3 × 2 × ' + (n - 2) + ' = ' + B + '. ' + nb(T) + ' − ' + B + ' = ' + nb(ans) + '.', 1);
  }
  if (ctx === 1){
    const ans = 3 * (n - 1) * (n - 2);
    return sortie(intro + X + ' doit obligatoirement faire partie du bureau. Combien de bureaux différents sont possibles' + QM, ans, [
      [(n - 1) * (n - 2), s => 'Piège : ' + s + ' place ' + X + ' seulement à la présidence.'],
      [3 * comb(n - 1, 2), s => 'Piège : ' + s + ' oublie que les deux autres postes sont différents.'],
      [arr(n - 1, 3), s => 'Piège : ' + s + ' compte les bureaux sans ' + X + '.']
    ], 'On place d\'abord ' + X + ', puis on remplit les deux autres postes dans l\'ordre. Poste ' + de(X) + ' : 3 choix. Les deux autres postes : ' + (n - 1) + ' × ' + (n - 2) + ' = ' + ((n - 1) * (n - 2)) + '. 3 × ' + ((n - 1) * (n - 2)) + ' = ' + nb(ans) + '.', 1);
  }
  const B = 6 * (n - 2), Cc = arr(n - 2, 3), ans = B + Cc;
  return sortie(intro + X + ' et ' + Y + ' ne veulent siéger que ' + d.un + ' : soit ' + d.ils + ' sont ' + d.tous + ' dans le bureau, soit ' + d.aucun + ' n\'y est. Combien de bureaux différents sont possibles' + QM, ans, [
    [B, s => 'Piège : ' + s + ' oublie les bureaux où ' + d.aucun + ' ne siège.'],
    [Cc, s => 'Piège : ' + s + ' oublie les bureaux où ' + d.ils + ' siègent ' + d.tous + '.'],
    [T - B, s => 'Piège : ' + s + ' compte les bureaux où ' + d.ils + ' ne siègent pas ensemble, y compris ceux où ' + d.seul + ' siège.'],
    [(n - 2) + Cc, s => 'Piège : ' + s + ' oublie que ' + X + ' et ' + Y + ' peuvent se répartir deux des trois postes de 6 façons.']
  ], 'On sépare les deux cas, qui s\'excluent, et on additionne. Les deux siègent : poste ' + de(X) + ' (3 choix), poste ' + de(Y) + ' (2 choix), troisième membre parmi ' + (n - 2) + ' : 3 × 2 × ' + (n - 2) + ' = ' + B + '. ' + (d.aucun === 'aucune des deux' ? 'Aucune' : 'Aucun') + ' ne siège : ' + facteurs(n - 2, 3) + ' = ' + nb(Cc) + '. ' + B + ' + ' + nb(Cc) + ' = ' + nb(ans) + '.', 1);
}

/* ---------- tirage pondéré d'un sous-type ---------- */
function tirer(R, table){
  const tot = somme(table.map(t => t[0]));
  let x = R.int(1, tot);
  for (let i = 0; i < table.length; i++){ x -= table[i][0]; if (x <= 0) return table[i][1](R); }
  return table[0][1](R);
}
const TABLES = {
  1: [[6, n1produit], [5, n1puissance], [6, n1ordre], [3, n1ou]],
  2: [[6, n2auMoinsUn], [5, n2paires], [5, n2chiffres], [4, n2ouEt]],
  3: [[4, n3anag], [4, n3auMoinsDeux], [4, n3trios], [3, n3diag], [3, n3cote], [2, n3unChiffre]],
  4: [[4, n4anag], [3, n4croissants], [4, n4chemins], [3, n4comite], [2, n4pasCote], [2, n4monnaie], [2, n4couples]],
  5: [[3, n5anag], [3, n5chemins], [2, n5rect], [2, n5somme], [2, n5triangles], [3, n5chaque], [2, n5bureau]]
};
function secours(){
  return {q: 'Un restaurant propose 3 entrées, 4 plats et 2 desserts. Un menu complet comprend une entrée, un plat et un dessert. Combien de menus complets différents peut-on composer' + QM,
    a: '24', accept: null, choix: ['24', '9', '12', '26'],
    expl: 'On fait trois choix successifs, indépendants les uns des autres : on multiplie les nombres de choix. 3 × 4 × 2 = 24. Piège : 9 additionne les nombres de choix au lieu de les multiplier.'};
}

A.push({
  id: 'alb-06-denombrement',
  phase: 'albert',
  ordre: 6,
  theme: 'denombrement',
  titre: 'Dénombrement : principe multiplicatif, complémentaire, ordre',
  objectif: 'Compter sans tout écrire des menus, des codes, des mots, des équipes ou des chemins : multiplier les choix qui s\'enchaînent, additionner les cas qui s\'excluent, diviser quand l\'ordre ne compte pas, et passer par le contraire pour « au moins un ».',
  lecon:
`<p class="lede">Combien de codes, de menus, de mots, d'équipes ou de chemins ? Au test, ces questions se règlent sans rien énumérer, avec <mark>quatre gestes</mark> : multiplier, additionner, diviser par le nombre d'ordres, et retirer le contraire.</p>
<h2>Ce que le test demande</h2>
<p>On te décrit une situation où l'on fait des choix (un plat, un chiffre, une place dans une file, des membres d'une équipe) et on te demande le nombre de résultats possibles. Les nombres sont choisis pour se calculer à la main. La difficulté n'est pas le calcul : c'est de reconnaître la bonne opération. Plus haut dans le test arrivent les lettres répétées, les « au moins un », les places imposées et les chemins sur un quadrillage.</p>
<h2>Ce qu'il faut savoir avant</h2>
<p>Le produit 1 × 2 × 3 × … × n compte les façons de ranger n objets différents en ligne : n choix pour la première place, n − 1 pour la deuxième, et ainsi de suite. On le note <mark>n!</mark> (on lit « factorielle n »). Par exemple 4! = 4 × 3 × 2 × 1 = 24.</p>
<p>Le nombre de paires que l'on peut former avec n objets vaut n × (n − 1) ÷ 2 : chacun s'associe aux n − 1 autres, mais chaque paire est comptée deux fois.</p>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je dessine des cases :</strong> une case par choix, et sous chacune le nombre de choix possibles.</p>
<p><strong>2. Je commence par la case la plus contrainte :</strong> le premier chiffre d'un nombre (jamais 0), une place imposée, une lettre obligatoire.</p>
<p><strong>3. Je multiplie ou j'additionne :</strong> des choix qui s'enchaînent (une entrée ET un plat) se multiplient ; des cas qui s'excluent (un train OU un car) s'additionnent.</p>
<p><strong>4. Je vérifie si l'ordre compte :</strong> s'il ne compte pas, je divise par le nombre d'ordres d'un même groupe : 2 pour une paire, 6 pour un trio, 24 pour un groupe de 4.</p>
<p><strong>5. « Au moins un » :</strong> je compte le contraire (« aucun ») et je le retire du total.</p>
</div>
<div class="formule"><p>avec répétition : m × m × … × m ; sans répétition : n × (n − 1) × (n − 2) × … ; sans ordre : on divise par le nombre d'ordres</p></div>
<h2>Exemples résolus</h2>
<h3>Exemple 1 : une crêperie</h3>
<p>4 galettes, 3 boissons et 5 crêpes sucrées ; une formule comprend une de chaque. Les choix s'enchaînent : 4 × 3 × 5 = <strong>60 formules</strong>. Additionner (4 + 3 + 5 = 12) serait faux.</p>
<h3>Exemple 2 : deux élèves parmi 25</h3>
<p>Un délégué et un suppléant : les rôles sont différents, l'ordre compte, 25 × 24 = <strong>600</strong>. Deux représentants de même rôle : chaque duo a été compté deux fois, 600 ÷ 2 = <strong>300</strong>.</p>
<h3>Exemple 3 : au moins un 4</h3>
<p>Combien de codes de 000 à 999 contiennent au moins un 4 ? Le contraire est plus simple : sans aucun 4, chaque chiffre a 9 choix, soit 9 × 9 × 9 = 729 codes. Il reste 1 000 − 729 = <strong>271 codes</strong>. Le calcul direct 3 × 100 = 300 compte plusieurs fois les codes comme 404 ou 444.</p>
<h3>Exemple 4 : niveau du test, les anagrammes de RADAR</h3>
<p>Avec 5 lettres toutes différentes, on aurait 5! = 120 mots. Mais échanger les deux R ne change rien, ni échanger les deux A : chaque mot est compté 2 × 2 = 4 fois. Réponse : 120 ÷ 4 = <strong>30 mots</strong>.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl"><tr><th>n</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
<tr><td>n!</td><td>6</td><td>24</td><td>120</td><td>720</td><td>5 040</td></tr>
<tr><td>paires n × (n − 1) ÷ 2</td><td>3</td><td>6</td><td>10</td><td>15</td><td>21</td></tr></table>
<p>À connaître : 9² = 81, 9³ = 729, 5³ = 125, 6³ = 216, 2<sup>10</sup> = 1 024. Simplifie avant de multiplier : 10 × 9 × 8 ÷ 6 = 10 × 12 = 120. Contrôle l'ordre de grandeur : un nombre de choix « sans ordre » est toujours plus petit que le même « avec ordre ».</p>
<h2>Pour aller plus loin</h2>
<p><strong>Choisir suffit.</strong> Un nombre de 3 chiffres strictement croissants (comme 258) est fixé dès qu'on a choisi ses chiffres : on compte des trios parmi 1 à 9 (le 0 serait en tête), 9 × 8 × 7 ÷ 6 = 84.</p>
<p><strong>Chemins.</strong> Sur un quadrillage, aller de 3 carreaux vers la droite et de 2 vers le haut, sans jamais reculer, c'est écrire un mot avec 3 lettres D et 2 lettres H : 5! ÷ (3! × 2!) = 10 chemins.</p>
<p><strong>Places imposées.</strong> Deux personnes côte à côte : on les colle en un bloc, puis on multiplie par 2 pour l'ordre dans le bloc. Jamais côte à côte : total moins côte à côte.</p>
<p><strong>Deux « au moins ».</strong> Total, moins les cas sans A, moins les cas sans B, plus les cas sans A ni B, retirés deux fois.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Dessine une case par choix, remplis d'abord la plus contrainte, multiplie les choix qui s'enchaînent, divise par le nombre d'ordres si l'ordre ne compte pas, et passe par le contraire pour « au moins un ».</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Additionner des choix qui s'enchaînent. Laisser un 0 en tête d'un nombre. Oublier si l'ordre compte, ou diviser par 3 au lieu de 6 pour un trio. Compter chaque paire deux fois. Confondre « au moins un » et « exactement un ». Oublier les lettres répétées d'une anagramme. Retirer deux fois les mêmes cas.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>ET : on multiplie. OU : on additionne. Ordre sans importance : on divise par le nombre d'ordres (2, 6, 24). Lettres identiques : on divise par leurs rangements. Au moins un = total − aucun.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const e = tirer(R, TABLES[n]);
      if (!e || typeof e.q !== 'string' || !Array.isArray(e.choix) || e.choix.length !== 4) return secours();
      return e;
    } catch (err){
      return secours();
    }
  }
});

})();
