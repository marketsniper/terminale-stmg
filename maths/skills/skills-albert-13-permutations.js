/* ===== Maths · Objectif Albert School : alb-13 · Permutations : échanges de voisins et inversions =====
   Piste séparée window.ALBERT_SKILLS (jamais SKILLS). Une IIFE, aucun symbole de premier niveau.
   Idée centrale : le nombre minimal d'échanges de deux voisins = le nombre de paires mal rangées (inversions).
   Toutes les réponses sont CALCULÉES (comptage d'inversions) ; les banques de mots ne fixent que les énoncés.
   N'utilise que R.int, R.pick, R.shuffle. Niveau inconnu : borné. gen ne lève jamais d'exception.
   Tour 2 : corrections du jugement r1 (piège des paquets retournés, parité, tableau des rangements, calibrage 3/4/5,
   mots à lettres répétées, jetons vers une cible, parité depuis un départ non rangé, moyennes variées). */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (recopiées de la référence alb-01) ---------- */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
function qcm(bonne, autres, voisin){
  const vus = new Set([norm(bonne)]), ch = [bonne];
  const ajouter = c => { if (ch.length < 4 && c != null && c !== '' && !vus.has(norm(c))){ vus.add(norm(c)); ch.push(String(c)); } };
  autres.forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 60; k++) ajouter(voisin(k));
  return ch;
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));

/* ---------- outils sur les permutations ---------- */
const C2 = n => n * (n - 1) / 2;
const suite = t => t.join(', ');
const range = n => { const t = []; for (let i = 1; i <= n; i++) t.push(i); return t; };
const ord = (k, g) => k === 1 ? (g === 'm' ? '1er' : '1re') : k + 'e';
const pl = (n, mot) => nb(n) + ' ' + mot + (n > 1 ? 's' : '');
const pairesMalR = j => pl(j, 'paire') + ' mal rangée' + (j > 1 ? 's' : '');
function inv(t){ let c = 0; for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) if (t[i] > t[j]) c++; return c; }
function petitsADroite(t){ return t.map((x, i) => { let c = 0; for (let j = i + 1; j < t.length; j++) if (t[j] < x) c++; return c; }); }
function descentes(t){ let c = 0; for (let i = 0; i + 1 < t.length; i++) if (t[i] > t[i + 1]) c++; return c; }
function malPlaces(t){ let c = 0; t.forEach((x, i) => { if (x !== i + 1) c++; }); return c; }
/* Minimum d'échanges QUELCONQUES (pas forcément voisins) : n − nombre de cycles. Sert de distracteur. */
function quelconques(t){
  const vu = t.map(() => false); let cyc = 0;
  for (let i = 0; i < t.length; i++){ if (!vu[i]){ cyc++; let j = i; while (j >= 0 && j < t.length && !vu[j]){ vu[j] = true; j = t[j] - 1; } } }
  return t.length - cyc;
}
/* Place (1 à n) de chaque lettre du mot de départ dans le mot d'arrivée ; la k-ième occurrence d'une lettre va sur la k-ième. */
function rangs(dep, arr){
  const pris = {};
  return dep.split('').map(c => { const k = pris[c] || 0; pris[c] = k + 1; let v = 0; for (let i = 0; i < arr.length; i++) if (arr[i] === c){ if (v === k) return i + 1; v++; } return 0; });
}
/* Appariement croisé (la première occurrence va sur la dernière) : erreur classique, sert de distracteur. */
function rangsCroises(dep, arr){
  const tot = {}, pris = {};
  dep.split('').forEach(c => { tot[c] = (tot[c] || 0) + 1; });
  return dep.split('').map(c => { const k = tot[c] - 1 - (pris[c] || 0); pris[c] = (pris[c] || 0) + 1; let v = 0; for (let i = 0; i < arr.length; i++) if (arr[i] === c){ if (v === k) return i + 1; v++; } return 0; });
}
/* Places groupées par lettre dans le mot d'arrivée : « T = 1, E = 2 et 5, R = 3 et 4, S = 6 ». */
function placesGroupees(T){
  const ordre = [], pos = {};
  T.split('').forEach((c, i) => { if (!pos[c]){ pos[c] = []; ordre.push(c); } pos[c].push(i + 1); });
  return ordre.map(c => c + ' = ' + (pos[c].length > 1 ? pos[c].slice(0, -1).join(', ') + ' et ' + pos[c][pos[c].length - 1] : pos[c][0])).join(', ');
}
/* Permutation de 1..n avec exactement k paires mal rangées : k échanges de voisins qui en créent chacun une. */
function permK(n, k, R){
  const t = range(n); k = Math.max(0, Math.min(C2(n), k));
  for (let s = 0; s < k; s++){
    const montees = []; for (let i = 0; i + 1 < n; i++) if (t[i] < t[i + 1]) montees.push(i);
    if (!montees.length) break;
    const i = R.pick(montees), x = t[i]; t[i] = t[i + 1]; t[i + 1] = x;
  }
  return t;
}
/* Détail « plus petits à droite » pour l'explication. */
function detail(t){ const d = petitsADroite(t); return {fleches: t.map((x, i) => x + ' → ' + d[i]).join(' ; '), somme: d.join(' + ')}; }
const somme = l => l.reduce((s, x) => s + x, 0);
const plusTerm = l => l.length > 1 ? l.join(' + ') + ' = ' + nb(somme(l)) : nb(somme(l));

/* ---------- pièges nommés (texte de l'explication quand le distracteur est proposé) ---------- */
const P = {
  voisins: v => 'Piège : ne regarder que les voisins mal rangés donne ' + v + ' ; il faut compter toutes les paires, même éloignées.',
  sens: v => 'Piège : ' + v + ' est le nombre de paires déjà bien rangées, c\'est compter dans le mauvais sens.',
  quelc: v => 'Piège : ' + v + ' serait le minimum si l\'on pouvait échanger deux éléments quelconques ; ici, seuls deux voisins s\'échangent.',
  malplaces: v => 'Piège : ' + v + ' est le nombre d\'éléments mal placés, ce n\'est pas un nombre d\'échanges.',
  plus1: v => 'Piège : ' + v + ' revient à compter les places au lieu des pas entre les places.',
  somme: v => 'Piège : ' + v + ' compte les objets qui bougent, pas les échanges.',
  tout: v => 'Piège : ' + v + ' correspondrait à une file entièrement retournée ; ici, chaque groupe garde son ordre.',
  toutPaquets: v => 'Piège : ' + v + ' correspondrait à une file entièrement retournée ; ici, les paquets restent dans le bon ordre entre eux, seul l\'intérieur de chaque paquet est retourné.',
  double: v => 'Piège : ' + v + ' compte chaque croisement deux fois, une fois pour chacun des deux objets.',
  oubli2: v => 'Piège : ' + v + ' oublie de diviser par deux et compte chaque paire deux fois.',
  nplus1: v => 'Piège : ' + v + ' additionne un terme de trop dans la somme.',
  deuxd: v => 'Piège : ' + v + ' fait voyager les deux séparément, alors que l\'échange où ils se croisent compte pour les deux.',
  croise: v => 'Piège : ' + v + ' fait se croiser deux lettres identiques, ce qui ajoute des échanges inutiles.',
  croiseJetons: v => 'Piège : ' + v + ' fait se croiser deux jetons de même couleur, ce qui ajoute des échanges inutiles.'
};
/* Choix numériques : bonne réponse, distracteurs [valeur, piège éventuel], voisins ±1, ±2… (toujours ≥ 1). */
function sortie(q, bonne, pieges, expl){
  const ok = pieges.filter(p => p && typeof p[0] === 'number' && isFinite(p[0]) && Math.round(p[0]) === p[0] && p[0] >= 1 && p[0] !== bonne);
  const choix = qcm(nb(bonne), ok.map(p => nb(p[0])), k => { const v = bonne + (k % 2 ? (k + 1) / 2 : -k / 2); return v >= 1 ? nb(v) : null; });
  const txt = [], dits = new Set();
  ok.forEach(p => { const s = nb(p[0]); if (p[1] && choix.indexOf(s) > 0 && !dits.has(s) && txt.length < 2){ dits.add(s); txt.push(p[1](s)); } });
  return {q: q, a: nb(bonne), accept: null, choix: choix, expl: expl + (txt.length ? ' ' + txt.join(' ') : '')};
}

/* ---------- banques (énoncés seulement : les réponses sont recalculées) ---------- */
const PRENOMS_F = ['Inès', 'Sarah', 'Chloé', 'Lina', 'Jade', 'Emma', 'Léa', 'Maya'];
const PRENOMS_M = ['Léo', 'Yanis', 'Hugo', 'Noah', 'Adam', 'Malik', 'Tom', 'Sami'];
const ELEVES = ['Ali', 'Bilal', 'Chloé', 'Dina', 'Elsa', 'Farid', 'Gaël', 'Hana'];
const MOTS_COURTS = [['SEL', 'LES'], ['ARC', 'CAR'], ['SAC', 'CAS'], ['PAS', 'SPA'], ['AMI', 'MAI'], ['NUE', 'UNE'], ['RAT', 'ART'], ['SON', 'NOS'],
  ['ROSE', 'OSER'], ['MARE', 'ARME'], ['PIRE', 'PRIE'], ['CRUE', 'CURE'], ['LOIN', 'LION'], ['CIRE', 'CRIE'], ['TIRE', 'RITE'], ['TIRE', 'TRIE'],
  ['RAME', 'AMER'], ['RAME', 'MARE'], ['TRIO', 'ROTI'], ['RIVE', 'VIRE'], ['GARE', 'RAGE']];
const MOTS_MOYENS = [['PORT', 'TROP'], ['SOIR', 'ROIS'], ['NIER', 'RIEN'], ['LIME', 'MIEL'], ['CHIEN', 'NICHE'], ['CRIME', 'MERCI'], ['AIMER', 'MARIE'],
  ['RANCE', 'NACRE'], ['SPORT', 'PORTS'], ['PRISE', 'SPIRE'], ['TRACE', 'CARTE'], ['TALON', 'TONAL'], ['PARTI', 'TAPIR'], ['SUCRE', 'CURES'],
  ['TRIPE', 'PITRE'], ['LOUPE', 'POULE'], ['OUTRE', 'TROUE'], ['CORDE', 'CREDO'], ['PORTE', 'OPTER'], ['POINT', 'PITON'], ['ROUTE', 'OUTRE'],
  ['ROUTE', 'TROUE'], ['LIMACE', 'MALICE'], ['PIRATE', 'PARTIE'], ['ORANGE', 'ONAGRE'], ['MANIER', 'MARINE'], ['MANIER', 'ANIMER'],
  ['PRINCE', 'PINCER'], ['RIVAGE', 'VIRAGE'], ['POINTS', 'PITONS']];
const MOTS_LONGS = [['MARCHE', 'CHARME'], ['PIRATE', 'PATRIE'], ['ORGANE', 'ONAGRE'], ['ARGENT', 'GRENAT'], ['ANIMER', 'MARINE'], ['ROMAIN', 'MANOIR'],
  ['TABLES', 'STABLE'], ['PASTEL', 'PLATES'], ['PASTEL', 'PALETS'], ['CHIENS', 'NICHES'], ['TRACES', 'CARTES'], ['CRIMES', 'MERCIS'],
  ['LOUPES', 'POULES'], ['TRIPES', 'PITRES'], ['CRAINTE', 'CERTAIN'], ['ROTULE', 'LOUTRE'], ['CHANTER', 'TRANCHE'], ['ESPOIR', 'POIRES'],
  ['ESPOIR', 'PROIES'], ['NAVIRE', 'RAVINE'], ['ROMAINS', 'MANOIRS'], ['SORTIE', 'TOISER'], ['SOUPLE', 'POULES'], ['SOUPLE', 'LOUPES'],
  ['MARIONS', 'MANOIRS'], ['PIRATES', 'PATRIES'], ['CAUSER', 'SAUCER'], ['OCEAN', 'CANOE']];
/* Anagrammes avec des lettres répétées (couverture du piège « appariement des lettres identiques »). Réponses recalculées. */
const MOTS_REPETES = [['ELEVE', 'LEVEE'], ['SELLE', 'ELLES'], ['ESSOR', 'ROSES'], ['LASSE', 'SALES'], ['MESSE', 'SEMES'], ['TISSE', 'SITES'],
  ['MISES', 'SEMIS'], ['ENTRE', 'RENTE'], ['ENTRE', 'TERNE'], ['RENTE', 'TERNE'], ['MARRE', 'ARMER'], ['VERRE', 'REVER'],
  ['RESTER', 'TERRES'], ['ENTRER', 'RENTRE'], ['ELEVER', 'RELEVE'], ['TRESSE', 'RESTES'], ['NETTES', 'TENTES'], ['ESSAIS', 'ASSISE'],
  ['RENTES', 'TERNES'], ['ARRETES', 'RESTERA'], ['ENTERRE', 'RENTREE'], ['ENTERRES', 'RENTREES'], ['PRESENTE', 'SERPENTE'],
  ['TERRASSE', 'TRESSERA'], ['CARESSE', 'CESSERA'], ['SERRENT', 'RENTRES']];
/* Mots à lettres toutes distinctes, pour déplacer un bloc de lettres (même structure que l'exemple officiel, autres mots). */
const ROT_COURTS = ['JARDIN', 'CAMION', 'POULET', 'BOUGIE', 'FLACON', 'BRIQUE', 'PLANTE', 'BALCON', 'CITRON', 'CLIENT', 'VOLCAN', 'DRAGON',
  'CHEMIN', 'DOUCHE', 'PLONGE', 'BOUCLE', 'CHAISE', 'GUIDON', 'VIRAGE', 'BLOUSE', 'PIGEON', 'TRAINS', 'CHAMPS', 'TIGRE', 'POCHE',
  'PLUME', 'SUCRE', 'BLANC', 'SALON', 'NUAGE', 'PIANO', 'LAPIN', 'FRUIT', 'MONDE'];
const ROT_LONGS = ['GUITARE', 'FROMAGE', 'BRIOCHE', 'CLAVIERS', 'PROVINCE', 'CHAMPIONS', 'TRAMPOLINE', 'JOURNAL', 'DAUPHIN', 'CAMPING',
  'CLAFOUTIS', 'HARICOTS', 'MOUSTACHE', 'PLONGEUR', 'VOITURE', 'MONTAGE', 'POTAGER', 'COMPLET', 'DOMINER', 'FAUCHER', 'MARQUISE', 'POUDRES'];
/* Mots avec des lettres répétées, à ranger dans l'ordre alphabétique (niveau 4). */
const REPETES = ['SALADE', 'TOMATE', 'PAPILLON', 'CHOCOLAT', 'CARAMEL', 'TARTINE', 'PANTALON', 'CASQUETTE', 'LUNETTES', 'POMMIER', 'ORANGER',
  'BANQUETTE', 'CHAUSSON', 'NOISETTE', 'ALLUMETTE', 'ARROSOIR', 'CROISSANT', 'MARMOTTE', 'SAUCISSE', 'CARTABLE', 'TROUSSE', 'CHAPEAU', 'PARASOL',
  'PISCINE', 'SARDINES', 'POISSON', 'CAPUCHE', 'RAQUETTE', 'CAMEMBERT', 'MANDARINE', 'COQUILLE', 'ARTICHAUT', 'BOUSSOLE', 'PASSOIRE'];
const ALPHA5 = ['CHIEN', 'TRAIN', 'PLUME', 'LIVRE', 'POCHE', 'MONDE', 'SUCRE', 'TIGRE', 'ROUGE', 'BLANC', 'POINT', 'SALON', 'CRAIE', 'FLEUR',
  'VOILE', 'NUAGE', 'GLACE', 'PLAGE', 'LOUPE', 'CANOT', 'JOUER', 'DANSE', 'FORME', 'PIANO', 'SINGE', 'LAPIN', 'CHAMP', 'PRUNE', 'MERCI',
  'FRUIT', 'SPORT', 'VAGUE', 'LITRE', 'PORTE', 'TOMBE'];
const ALPHA6 = ['JARDIN', 'CAMION', 'POULET', 'BOUGIE', 'FLACON', 'BRIQUE', 'PLANTE', 'MOUCHE', 'BALCON', 'CITRON', 'PRINCE', 'CLIENT',
  'VOLCAN', 'DRAGON', 'ORANGE', 'CHEMIN', 'DOUCHE', 'CIRQUE', 'PLONGE', 'BOUCLE', 'LAPINS', 'CHAISE', 'GUIDON', 'VIRAGE', 'BLOUSE', 'PIGEON',
  'JOUETS', 'MARCHE', 'TRAINS', 'FLEURS', 'CHAMPS'];
const ENVERS = {4: ['PORT', 'LION', 'MIEL'], 5: ['CHIEN', 'TRAIN', 'PLUME', 'SUCRE'], 6: ['JARDIN', 'CAMION', 'PLANTE', 'CITRON'],
  7: ['GUITARE', 'FROMAGE', 'BRIOCHE'], 8: ['CLAVIERS', 'PROVINCE'], 9: ['CHAMPIONS', 'CLAFOUTIS', 'MOUSTACHE'], 10: ['TRAMPOLINE'], 11: ['COMPLAINTES', 'PRODUCTIVES']};
const distinctes = w => new Set(w.split('')).size === w.length;
const trie = w => w.split('').sort().join('');
/* paires orientées (départ, arrivée) dont le nombre d'inversions tombe dans [lo, hi] */
function paires(banque, lo, hi){
  const l = [];
  banque.forEach(p => [[p[0], p[1]], [p[1], p[0]]].forEach(x => { if (distinctes(x[0]) && trie(x[0]) === trie(x[1])){ const k = inv(rangs(x[0], x[1])); if (k >= lo && k <= hi) l.push(x); } }));
  return l;
}
/* même chose pour les mots à lettres répétées, avec un prédicat sur (longueur, nombre d'échanges) */
function pairesRep(pred){
  const l = [];
  MOTS_REPETES.forEach(p => [[p[0], p[1]], [p[1], p[0]]].forEach(x => { if (!distinctes(x[0]) && trie(x[0]) === trie(x[1])){ const k = inv(rangs(x[0], x[1])); if (pred(x[0].length, k)) l.push(x); } }));
  return l;
}
const MOTS_TOUS = MOTS_MOYENS.concat(MOTS_LONGS);
const P_COURTS = paires(MOTS_COURTS, 1, 3), P_MOYENS = paires(MOTS_TOUS, 3, 6), P_LONGS = paires(MOTS_TOUS, 7, 13);
const REP_N4 = pairesRep((L, k) => (L >= 6 && k >= 5 && k <= 8) || (L === 5 && k >= 7));
const REP_N5 = pairesRep((L, k) => k >= 9 || (L >= 8 && k >= 6));
const REP_N3 = pairesRep((L, k) => L <= 6 && k >= 2 && k <= 5 && !(L >= 6 && k >= 5));
const alphaListe = (l, lo, hi) => l.filter(w => distinctes(w) && inv(rangs(w, trie(w))) >= lo && inv(rangs(w, trie(w))) <= hi);
const A5 = alphaListe(ALPHA5, 3, 7), A6 = alphaListe(ALPHA6, 6, 13);
const R_COURTS = ROT_COURTS.filter(distinctes), R_LONGS = ROT_LONGS.filter(distinctes), R_SIX = R_COURTS.filter(w => w.length >= 6);
const A_REP = REPETES.filter(w => !distinctes(w) && inv(rangs(w, trie(w))) >= 8 && inv(rangs(w, trie(w))) <= 16);

/* ---------- explications communes ---------- */
function explTri(t){
  const d = detail(t);
  return 'On compte, pour chaque nombre, combien de nombres plus petits sont placés à sa droite : c\'est le nombre de paires mal rangées, et chaque échange de voisins en corrige une seule. Ici : ' + d.fleches + '. Total : ' + d.somme + ' = ' + pl(inv(t), 'échange') + '.';
}
function explMots(S, T, t){
  const d = detail(t);
  return 'On remplace chaque lettre du mot de départ par sa place dans le mot d\'arrivée, puis on compte les paires mal rangées. Dans ' + T + ', les places sont ' +
    T.split('').map((c, i) => c + ' = ' + (i + 1)).join(', ') + '. ' + S + ' devient donc ' + suite(t) + '. Plus petits à droite de chaque nombre : ' + d.fleches + '. Total : ' + d.somme + ' = ' + pl(inv(t), 'échange') + '.';
}
const piegesTri = (t, k) => [[descentes(t), P.voisins], [C2(t.length) - k, P.sens], [quelconques(t), P.quelc], [malPlaces(t), P.malplaces]];

/* =====================================================
   Sous-types
   ===================================================== */

/* Un seul élément se déplace : |P − Q| échanges. */
function deplacement(R){
  const N = R.int(6, 12), ctx = R.int(1, 3);
  if (ctx === 1){
    const P0 = R.int(4, N), Q = R.int(1, P0 - 2), d = P0 - Q, nom = R.pick(PRENOMS_F);
    const q = 'Dans une file d\'attente de ' + N + ' personnes, ' + nom + ' est à la ' + ord(P0, 'f') + ' place. Elle veut arriver à la ' + ord(Q, 'f') +
      ' place. À chaque échange, elle prend la place de la personne juste devant elle, qui recule d\'une place. Combien d\'échanges lui faut-il ?';
    const expl = 'Chaque échange la fait avancer d\'une seule place : on compte les places à remonter, c\'est une simple différence. De la ' + ord(P0, 'f') + ' à la ' + ord(Q, 'f') + ' place : ' + P0 + ' − ' + Q + ' = ' + pl(d, 'échange') + '.';
    return sortie(q, d, [[d + 1, P.plus1], [Q > 1 ? P0 - 1 : null, v => 'Piège : ' + v + ' échanges l\'amèneraient en tête de la file.'], [d - 1]], expl);
  }
  if (ctx === 2){
    const P0 = R.int(1, N - 3), d = N - P0;
    const q = 'Sur une étagère, ' + N + ' livres sont alignés. Le livre placé en ' + ord(P0, 'f') + ' position en partant de la gauche doit aller tout à droite, en ' + N +
      'e position, sans changer l\'ordre des autres livres. On ne peut qu\'échanger deux livres voisins. Combien d\'échanges faut-il ?';
    const expl = 'Le livre avance d\'une place à chaque échange : on compte les places qu\'il doit franchir, pas les places elles-mêmes. De la ' + ord(P0, 'f') + ' à la ' + N + 'e position : ' + N + ' − ' + P0 + ' = ' + pl(d, 'échange') + '.';
    return sortie(q, d, [[d + 1, P.plus1], [d - 1], [P0 > 1 ? P0 - 1 : null, v => 'Piège : ' + v + ' est le nombre de livres à sa gauche, pas à sa droite.']], expl);
  }
  const P0 = R.int(4, N), Q = R.int(1, P0 - 2), d = P0 - Q, nom = R.pick(PRENOMS_M);
  const q = 'Dans une course, ' + nom + ' est ' + ord(P0, 'm') + ' sur ' + N + ' coureurs. Chaque fois qu\'il double le coureur juste devant lui, ils échangent leurs places. Combien de fois doit-il doubler pour finir ' + ord(Q, 'm') + ' ?';
  const expl = 'Chaque dépassement le fait gagner une seule place : on compte les places à gagner, c\'est une simple différence. De ' + ord(P0, 'm') + ' à ' + ord(Q, 'm') + ' : ' + P0 + ' − ' + Q + ' = ' + pl(d, 'dépassement') + '.';
  return sortie(q, d, [[d + 1, P.plus1], [Q > 1 ? P0 - 1 : null, v => 'Piège : ' + v + ' dépassements l\'amèneraient à la 1re place.'], [d - 1]], expl);
}

/* Trier des nombres donnés. */
function enonceTri(t, R){
  const n = t.length, s = suite(t), cible = suite(range(n)), c = R.int(1, 4);
  if (c === 1) return 'Des cartes numérotées de 1 à ' + n + ' sont posées en ligne dans l\'ordre ' + s + '. On veut les remettre dans l\'ordre ' + cible + ' en échangeant à chaque fois deux cartes voisines. Combien d\'échanges faut-il au minimum ?';
  if (c === 2) return 'Les ' + n + ' tomes d\'une saga sont rangés sur une étagère dans l\'ordre ' + s + ', de gauche à droite. Pour les ranger dans l\'ordre ' + cible + ', on ne peut qu\'échanger deux tomes voisins. Combien d\'échanges faut-il au minimum ?';
  if (c === 3) return 'Dans une classe, ' + n + ' élèves sont numérotés de 1 (le plus petit) à ' + n + ' (le plus grand). Ils sont alignés dans l\'ordre ' + s + '. Pour les ranger du plus petit au plus grand, on fait échanger à chaque fois deux élèves voisins. Combien d\'échanges faut-il au minimum ?';
  return 'Des coureurs portent des dossards numérotés de 1 à ' + n + '. Ils roulent en file dans l\'ordre ' + s + '. Chaque dépassement échange deux coureurs voisins. Combien de dépassements faut-il au minimum pour que la file soit dans l\'ordre ' + cible + ' ?';
}
function triCartes(R, n, lo, hi){
  const t = permK(n, R.int(lo, Math.min(hi, C2(n))), R), k = inv(t);
  return sortie(enonceTri(t, R), k, piegesTri(t, k), explTri(t));
}

/* Compter les paires mal rangées (définition donnée). */
function pairesMal(R){
  const n = R.pick([4, 5]), t = permK(n, R.int(2, C2(n) - 2), R), k = inv(t), d = detail(t);
  const q = 'Dans la suite ' + suite(t) + ', une paire de nombres est « mal rangée » quand le plus grand des deux est écrit avant le plus petit (ils ne sont pas forcément voisins). Combien de paires mal rangées cette suite contient-elle ?';
  const expl = 'On prend les nombres un par un, de gauche à droite, et on compte les nombres plus petits écrits après chacun d\'eux. Ici : ' + d.fleches + '. Total : ' + d.somme + ' = ' + k + ' paire' + (k > 1 ? 's' : '') + ' mal rangée' + (k > 1 ? 's' : '') + '.';
  return sortie(q, k, [[C2(n) - k, P.sens], [descentes(t), P.voisins], [k + 1], [k - 1]], expl);
}

/* Passer d'un mot à un autre (lettres toutes distinctes). */
function enonceMots(S, T, R){
  return R.int(0, 1)
    ? 'Pour passer du mot ' + S + ' au mot ' + T + ', on échange à chaque fois deux lettres voisines. Combien d\'échanges faut-il au minimum ?'
    : 'Jeu de lettres : on part de ' + S + ' et on veut obtenir ' + T + '. Chaque coup échange deux lettres voisines. Combien de coups faut-il au minimum ?';
}
function mots(R, liste){
  const p = R.pick(liste), S = p[0], T = p[1], t = rangs(S, T), k = inv(t);
  return sortie(enonceMots(S, T, R), k, piegesTri(t, k), explMots(S, T, t));
}

/* Passer d'un mot à un autre avec des lettres répétées : la k-ième occurrence va sur la k-ième (niveaux 3, 4, 5). */
function motsRepetes(R, liste){
  const p = R.pick(liste), S = p[0], T = p[1], t = rangs(S, T), k = inv(t), L = S.length, d = detail(t);
  const croise = inv(rangsCroises(S, T));
  let mal = 0; for (let i = 0; i < L; i++) if (S[i] !== T[i]) mal++;
  const rep = [...new Set(S.split('').filter((c, i) => S.indexOf(c) !== i))].join(', ');
  const expl = 'Quand une lettre est répétée, la première du mot de départ va sur la première du mot d\'arrivée, la deuxième sur la deuxième, et ainsi de suite : deux lettres identiques ne se croisent jamais. Dans ' + T + ', les places sont ' +
    placesGroupees(T) + '. ' + S + ' devient donc ' + suite(t) + ' (lettres répétées : ' + rep + '). Plus petits à droite de chaque nombre : ' + d.fleches + '. Total : ' + d.somme + ' = ' + pl(k, 'échange') + '.';
  return sortie(enonceMots(S, T, R), k, [[croise, P.croise], [descentes(t), P.voisins], [mal, P.malplaces], [C2(L) - k, P.sens]], expl);
}

/* Ranger les lettres d'un mot dans l'ordre alphabétique. */
function alpha(R, liste){
  const W = R.pick(liste), T = trie(W), t = rangs(W, T), k = inv(t);
  const q = 'On veut ranger les lettres du mot ' + W + ' dans l\'ordre alphabétique, ' + T + ', en échangeant à chaque fois deux lettres voisines. Combien d\'échanges faut-il au minimum ?';
  return sortie(q, k, piegesTri(t, k), explMots(W, T, t));
}

/* Un bloc de lettres passe devant le reste du mot : p × q (structure de l'exemple officiel, avec d'autres mots). */
function rotationMot(R, liste, guide){
  const W = R.pick(liste), L = W.length, k = R.int(2, L - 2), T = W.slice(L - k) + W.slice(0, L - k);
  const B1 = W.slice(0, L - k), B2 = W.slice(L - k), ans = k * (L - k);
  const q = guide
    ? 'On écrit le mot ' + W + '. On veut faire passer ses ' + k + ' dernières lettres devant les autres, sans changer l\'ordre à l\'intérieur de chaque bloc, pour obtenir ' + T + '. En échangeant à chaque fois deux lettres voisines, combien d\'échanges faut-il au minimum ?'
    : (R.int(0, 1)
      ? 'Combien d\'échanges de deux lettres voisines faut-il au minimum pour passer de ' + W + ' à ' + T + ' ?'
      : 'Jeu de lettres : on part de ' + W + ' et on veut obtenir ' + T + '. Chaque coup échange deux lettres voisines. Combien de coups faut-il au minimum ?');
  const expl = 'On repère deux blocs qui changent de place en gardant leur ordre interne : seules comptent les paires formées d\'une lettre de chaque bloc. ' +
    W + ' se coupe en ' + B1 + ' (' + (L - k) + ' lettres) et ' + B2 + ' (' + k + ' lettres), et ' + T + ' est ' + B2 + ' suivi de ' + B1 + '. Chacune des ' + k + ' lettres de ' + B2 +
    ' doit passer devant chacune des ' + (L - k) + ' lettres de ' + B1 + ' : ' + k + ' × ' + (L - k) + ' = ' + ans + ' échanges. Avec la numérotation, ' + W + ' devient ' + suite(rangs(W, T)) +
    ' : chacun des ' + (L - k) + ' premiers nombres a ' + k + ' nombres plus petits à sa droite.';
  return sortie(q, ans, [[L, P.somme], [C2(L), P.tout], [2 * ans, P.double], [ans - 1]], expl);
}

/* Niveau 4 : lettres répétées, rangées dans l'ordre alphabétique. Deux lettres identiques ne se croisent jamais. */
function alphaRepete(R){
  const W = R.pick(A_REP), T = trie(W), t = rangs(W, T), k = inv(t), L = W.length;
  const par = W.split('').map((c, i) => { let y = 0; for (let j = i + 1; j < L; j++) if (W[j] < c) y++; return y; });
  const croise = inv(rangsCroises(W, T));
  let desc = 0; for (let i = 0; i + 1 < L; i++) if (W[i] > W[i + 1]) desc++;
  let mal = 0; for (let i = 0; i < L; i++) if (W[i] !== T[i]) mal++;
  const rep = [...new Set(W.split('').filter((c, i) => W.indexOf(c) !== i))].join(', ');
  const q = 'On veut ranger les lettres du mot ' + W + ' dans l\'ordre alphabétique, ' + T + ', en échangeant à chaque fois deux lettres voisines. Combien d\'échanges faut-il au minimum ?';
  const expl = 'Deux lettres identiques n\'ont jamais besoin de se croiser : pour chaque lettre, on compte les lettres placées à sa droite qui viennent strictement avant elle dans l\'alphabet. Ici (lettres répétées : ' + rep + ') : ' +
    W.split('').map((c, i) => c + ' → ' + par[i]).join(' ; ') + '. Total : ' + plusTerm(par.filter(x => x > 0)) + ' échanges.';
  return sortie(q, k, [[croise, P.croise], [desc, P.voisins], [mal, P.malplaces]], expl);
}

/* Niveau 4 : file presque entièrement retournée. Un échange à distance 2 (3 paires bien rangées, dont une non voisine), puis 0 à 2 échanges de voisins. */
function presqueEnvers(R){
  const n = R.int(8, 12);
  let t = null;
  for (let e = 0; e < 60 && !t; e++){
    const x = range(n).reverse(), i = R.int(0, n - 3), vus = [i, i + 1, i + 2];
    { const y = x[i]; x[i] = x[i + 2]; x[i + 2] = y; }
    const extra = R.int(0, 2);
    for (let s = 0; s < extra; s++){
      const j = R.int(0, n - 2);
      if (!vus.every(v => v < j || v > j + 1)) continue;
      vus.push(j, j + 1); const y = x[j]; x[j] = x[j + 1]; x[j + 1] = y;
    }
    const bons = C2(n) - inv(x);
    if (bons >= 3 && bons <= 5) t = x;
  }
  if (!t){ t = range(n).reverse(); const y = t[0]; t[0] = t[2]; t[2] = y; }
  const k = inv(t), bons = C2(n) - k, liste = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (t[i] < t[j]) liste.push('(' + t[i] + ', ' + t[j] + ')');
  const expl = 'Presque tout est mal rangé : il est plus rapide de compter les paires bien rangées (un nombre écrit avant un plus grand, voisins ou non) et de les retirer du nombre total de paires, n × (n − 1) ÷ 2. ' +
    'Paires bien rangées : ' + liste.join(', ') + ', soit ' + bons + '. Nombre total de paires : ' + calculC2(n) + '. Échanges : ' + nb(C2(n)) + ' − ' + bons + ' = ' + nb(k) + '.';
  const montees = n - 1 - descentes(t);
  return sortie(enonceTri(t, R), k, [[C2(n), v => 'Piège : ' + v + ' correspondrait à une file entièrement retournée ; il faut retirer les paires déjà bien rangées.'],
    [C2(n) - montees, v => 'Piège : ' + v + ' ne retire que les voisins bien rangés ; il faut retirer toutes les paires bien rangées, même éloignées.'],
    [C2(n) + bons, v => 'Piège : ' + v + ' ajoute les paires bien rangées au lieu de les retirer.'], [C2(n) - 2 * bons]], expl);
}

/* Deux groupes qui s'échangent : p × q. force = 3 impose le contexte « suites de nombres » (les blocs ne sont pas annoncés). */
function blocs(R, lo, hi, force){
  const p = R.int(lo, hi), q0 = R.int(lo, hi), ctx = force || R.int(1, 4), n = p + q0;
  let q, eA, eB;
  if (ctx === 1){
    q = 'Sur une étagère, ' + p + ' romans sont rangés à gauche de ' + q0 + ' bandes dessinées. On veut que les bandes dessinées passent à gauche des romans, sans changer l\'ordre des romans entre eux ni celui des bandes dessinées entre elles. On ne peut qu\'échanger deux livres voisins. Combien d\'échanges faut-il au minimum ?';
    eA = 'romans'; eB = 'bandes dessinées';
  } else if (ctx === 2){
    q = 'Un train compte ' + p + ' wagons de voyageurs suivis de ' + q0 + ' wagons de marchandises. Au dépôt, on ne peut qu\'échanger deux wagons voisins. Combien d\'échanges faut-il au minimum pour mettre les wagons de marchandises devant, chaque groupe gardant son ordre ?';
    eA = 'wagons de voyageurs'; eB = 'wagons de marchandises';
  } else if (ctx === 3){
    const dep = range(n), arr = range(n).slice(p).concat(range(p));
    q = 'Combien d\'échanges de deux nombres voisins faut-il au minimum pour passer de ' + suite(dep) + ' à ' + suite(arr) + ' ?';
    eA = 'nombres de 1 à ' + p; eB = 'nombres de ' + (p + 1) + ' à ' + n;
  } else {
    q = 'Dans une file d\'attente, ' + p + ' adultes sont devant ' + q0 + ' enfants. On fait passer les enfants devant les adultes, sans changer l\'ordre à l\'intérieur de chaque groupe, en échangeant à chaque fois deux personnes voisines. Combien d\'échanges faut-il au minimum ?';
    eA = 'adultes'; eB = 'enfants';
  }
  const ans = p * q0;
  const expl = 'Chaque groupe garde son ordre interne : seuls comptent les croisements entre un élément du premier groupe et un élément du second, et chaque échange de voisins en réalise un seul. ' + (ctx === 1 ? 'Chacune' : 'Chacun') + ' des ' +
    q0 + ' ' + eB + ' doit passer devant chacun des ' + p + ' ' + eA + ' : ' + q0 + ' × ' + p + ' = ' + pl(ans, 'échange') + '.';
  return sortie(q, ans, [[p + q0, P.somme], [C2(n), P.tout], [2 * ans, P.double]], expl);
}

/* Retournement complet de n éléments : n(n − 1) ÷ 2. ctxs = contextes autorisés. */
function calculC2(n){ return n % 2 === 0 ? n + ' × ' + (n - 1) + ' ÷ 2 = ' + (n / 2) + ' × ' + (n - 1) + ' = ' + nb(C2(n)) : n + ' × ' + (n - 1) + ' ÷ 2 = ' + n + ' × ' + ((n - 1) / 2) + ' = ' + nb(C2(n)); }
function renverse(R, lo, hi, ctxs){
  const n = R.int(lo, hi);
  let ctx = R.pick(ctxs || [1, 2, 3, 4]), q;
  if (ctx === 3 && !ENVERS[n]) ctx = ctxs ? ctxs.filter(c => c !== 3)[0] || 1 : 1;
  if (ctx === 1) q = 'Dans une classe, ' + n + ' enfants sont alignés du plus petit au plus grand. On veut les ranger du plus grand au plus petit en échangeant à chaque fois deux enfants voisins. Combien d\'échanges faut-il au minimum ?';
  else if (ctx === 2) q = 'Les ' + n + ' tomes d\'une collection sont rangés dans l\'ordre ' + suite(range(n)) + '. Combien d\'échanges de deux tomes voisins faut-il au minimum pour les ranger dans l\'ordre inverse, ' + suite(range(n).reverse()) + ' ?';
  else if (ctx === 3){ const W = R.pick(ENVERS[n]); q = 'En échangeant à chaque fois deux lettres voisines, combien d\'échanges faut-il au minimum pour écrire le mot ' + W + ' à l\'envers, c\'est-à-dire ' + W.split('').reverse().join('') + ' ?'; }
  else q = 'Dans une course, ' + n + ' coureurs roulent en file indienne. À l\'arrivée, leur ordre est exactement inversé : le dernier est premier, l\'avant-dernier deuxième, et ainsi de suite. Chaque dépassement échange deux coureurs voisins. Combien de dépassements y a-t-il eu au minimum ?';
  const ans = C2(n);
  const expl = 'Dans un retournement complet, chaque paire d\'éléments doit se croiser exactement une fois, et un échange de voisins ne fait se croiser qu\'une seule paire : on compte les paires. Le premier élément croise les ' + (n - 1) + ' autres, le deuxième ' + (n - 2) + ' nouveaux, et ainsi de suite : ' + (n <= 6 ? range(n - 1).join(' + ') : '1 + 2 + … + ' + (n - 1)) + ' = ' + calculC2(n) + '.';
  return sortie(q, ans, [[n * (n - 1), P.oubli2], [n * (n + 1) / 2, P.nplus1], [Math.floor(n / 2), P.quelc], [n - 1]], expl);
}
function renverseGrand(R){
  const n = R.pick([20, 25, 30, 40, 50, 60, 80, 100]), ctx = R.int(1, 3);
  let q;
  if (ctx === 1) q = 'Une file de ' + n + ' personnes doit être entièrement retournée : la dernière devient la première, l\'avant-dernière la deuxième, et ainsi de suite. On ne peut qu\'échanger deux personnes voisines. Combien d\'échanges faut-il au minimum ?';
  else if (ctx === 2) q = 'Dans une course, ' + n + ' coureurs roulent en file indienne. À l\'arrivée, leur ordre est exactement inversé. Chaque dépassement échange deux coureurs voisins. Combien de dépassements y a-t-il eu au minimum ?';
  else q = 'Une bibliothécaire doit ranger dans l\'ordre inverse les ' + n + ' volumes d\'une encyclopédie, alignés du volume 1 au volume ' + n + '. Elle ne peut qu\'échanger deux volumes voisins. Combien d\'échanges doit-elle faire au minimum ?';
  const ans = C2(n);
  const expl = 'Dans un retournement complet, chaque paire doit se croiser exactement une fois, et un échange de voisins ne fait se croiser qu\'une seule paire : on compte les paires. Nombre de paires : n(n − 1) ÷ 2 avec n = ' + n + ', soit ' + calculC2(n) + '.';
  return sortie(q, ans, [[n * (n - 1), P.oubli2], [n * (n + 1) / 2, P.nplus1], [n * n / 2, v => 'Piège : ' + v + ' vient de n² ÷ 2, une approximation ; il faut n(n − 1) ÷ 2.'], [n - 1]], expl);
}

/* Niveau 4 : trois groupes réordonnés. */
const GROUPES = [
  {debut: 'Sur une étagère, on trouve de gauche à droite ', noms: ['romans', 'bandes dessinées', 'dictionnaires'], fin: 'On ne peut qu\'échanger deux livres voisins.'},
  {debut: 'Un train compte, de l\'avant vers l\'arrière, ', noms: ['wagons de voyageurs', 'wagons de marchandises', 'wagons de bois'], fin: 'Au dépôt, on ne peut qu\'échanger deux wagons voisins.'},
  {debut: 'Dans une file d\'attente, on trouve de l\'avant vers l\'arrière ', noms: ['adultes', 'enfants', 'adolescents'], fin: 'On ne peut qu\'échanger deux personnes voisines.'}
];
function troisGroupes(R){
  const G = R.pick(GROUPES), t = [R.int(2, 6), R.int(2, 6), R.int(2, 6)], cible = R.pick([[1, 2, 0], [2, 0, 1], [2, 1, 0]]);
  const q = G.debut + t[0] + ' ' + G.noms[0] + ', puis ' + t[1] + ' ' + G.noms[1] + ', puis ' + t[2] + ' ' + G.noms[2] + '. On veut obtenir l\'ordre : ' +
    cible.map(i => G.noms[i]).join(', puis ') + ', chaque groupe gardant son ordre interne. ' + G.fin + ' Combien d\'échanges faut-il au minimum ?';
  const termes = [], lignes = [];
  for (let u = 0; u < 3; u++) for (let v = u + 1; v < 3; v++) if (cible.indexOf(v) < cible.indexOf(u)){ termes.push(t[u] * t[v]); lignes.push(G.noms[u] + ' et ' + G.noms[v] + ' : ' + t[u] + ' × ' + t[v] + ' = ' + t[u] * t[v]); }
  const ans = somme(termes), tous = t[0] * t[1] + t[0] * t[2] + t[1] * t[2];
  const expl = 'Deux éléments d\'un même groupe ne se croisent jamais : pour chaque paire de groupes qui change d\'ordre, on multiplie leurs effectifs, puis on additionne. Ici : ' + lignes.join(' ; ') + '. Total : ' + plusTerm(termes) + ' échanges.';
  return sortie(q, ans, [[tous, v => 'Piège : ' + v + ' compte aussi une paire de groupes qui garde le même ordre.'], [t[0] + t[1] + t[2], P.somme], [C2(t[0] + t[1] + t[2]), P.tout], [ans - Math.min.apply(null, termes)]], expl);
}

/* Niveau 3 : jetons de deux couleurs, tous les blancs à gauche (objets identiques). */
function jetons2(R){
  const L = R.int(8, 10), w = R.int(3, L - 3), ctx = R.int(0, 1);
  const X = ctx ? 'F' : 'B', Y = ctx ? 'G' : 'N';
  const base = []; for (let i = 0; i < L; i++) base.push(i < w ? X : Y);
  const compte = s => { let c = 0, y = 0; s.forEach(c0 => { if (c0 === Y) y++; else c += y; }); return c; };
  let s = null;
  for (let e = 0; e < 60 && !s; e++){ const x = R.shuffle(base), k = compte(x); if (k >= 5 && k <= w * (L - w) - 3) s = x; }
  if (!s){ s = []; for (let i = 0; i < L; i++) s.push(i % 2 ? X : Y); }
  const k = compte(s), gauche = []; let y = 0; s.forEach(c0 => { if (c0 === Y) y++; else gauche.push(y); });
  let q;
  if (ctx) q = 'Dans un rang, des filles (F) et des garçons (G) sont placés ainsi, de gauche à droite : ' + s.join(' ') + '. On veut toutes les filles à gauche de tous les garçons, en échangeant à chaque fois deux enfants voisins. Combien d\'échanges faut-il au minimum ?';
  else q = 'Une rangée de jetons blancs (B) et noirs (N) se présente ainsi, de gauche à droite : ' + s.join(' ') + '. On veut tous les jetons blancs à gauche de tous les noirs, en échangeant à chaque fois deux jetons voisins. Combien d\'échanges faut-il au minimum ?';
  const objX = ctx ? 'fille' : 'jeton blanc', objY = ctx ? 'garçons' : 'noirs';
  const nX = s.filter(c0 => c0 === X).length, mal = s.slice(0, nX).filter(c0 => c0 === Y).length;
  const expl = 'Deux objets identiques n\'ont jamais besoin de se croiser : il suffit que chaque ' + objX + ' passe devant chacun des ' + objY + ' placés à sa gauche. ' +
    'Nombre de ' + objY + ' à gauche de chaque ' + objX + ', de gauche à droite : ' + gauche.join(', ') + '. Total : ' + plusTerm(gauche) + ' échanges.';
  return sortie(q, k, [[mal, P.quelc], [nX * (L - nX) - k, P.sens], [nX * (L - nX), v => 'Piège : ' + v + ' compte toutes les paires de deux couleurs différentes, même celles déjà dans le bon ordre.']], expl);
}

/* Niveaux 4 et 5 : jetons de 2 ou 3 couleurs vers une disposition cible NON triée. Le k-ième jeton d'une couleur va sur le k-ième. */
function jetonsCible(R, nc){
  let base = [];
  if (nc === 2){ const L = R.int(8, 10), w = R.int(3, L - 3); for (let i = 0; i < L; i++) base.push(i < w ? 'B' : 'N'); }
  else { const a = R.int(2, 4), b = R.int(2, 4), c = Math.max(2, R.int(8, 9) - a - b); for (let i = 0; i < a; i++) base.push('R'); for (let i = 0; i < b; i++) base.push('V'); for (let i = 0; i < c; i++) base.push('B'); }
  const L = base.length, lo = nc === 2 ? 5 : 8, hi = nc === 2 ? 12 : 16;
  let src = null, dst = null;
  for (let e = 0; e < 80 && !src; e++){
    const x = R.shuffle(base), y = R.shuffle(base), kk = inv(rangs(x.join(''), y.join('')));
    if (kk >= lo && kk <= hi){ src = x; dst = y; }
  }
  if (!src){ src = base.slice().reverse(); dst = base.slice(); }
  const S = src.join(''), T = dst.join(''), t = rangs(S, T), k = inv(t), d = detail(t);
  const croise = inv(rangsCroises(S, T));
  let mal = 0; for (let i = 0; i < L; i++) if (S[i] !== T[i]) mal++;
  const legende = nc === 2 ? 'jetons blancs (B) et noirs (N)' : 'jetons rouges (R), verts (V) et bleus (B)';
  const q = 'Une rangée de ' + legende + ' se présente ainsi, de gauche à droite : ' + src.join(' ') + '. On veut obtenir la disposition ' + dst.join(' ') + ', en échangeant à chaque fois deux jetons voisins. Combien d\'échanges faut-il au minimum ?';
  let expl;
  if (nc === 2){
    const pB = [], qB = []; src.forEach((c, i) => { if (c === 'B') pB.push(i + 1); }); dst.forEach((c, i) => { if (c === 'B') qB.push(i + 1); });
    const ecarts = pB.map((p, i) => Math.abs(p - qB[i]));
    expl = 'Les jetons blancs ne se croisent jamais : le premier blanc du départ va à la place du premier blanc de l\'arrivée, le deuxième au deuxième, et ainsi de suite, et chaque blanc fait autant d\'échanges que l\'écart entre ses deux places. ' +
      'Places des blancs au départ : ' + pB.join(', ') + ' ; à l\'arrivée : ' + qB.join(', ') + '. Écarts : ' + plusTerm(ecarts) + ' échanges. Vérification par la numérotation : ' + src.join(' ') + ' devient ' + suite(t) + ', qui contient ' + pairesMalR(k) + '.';
    if (somme(ecarts) !== k) expl = 'Deux jetons de même couleur ne se croisent jamais : ' + explMotsRep(src.join(' '), dst.join(' '), T, t, d, k);
  } else expl = 'Deux jetons de même couleur ne se croisent jamais : ' + explMotsRep(src.join(' '), dst.join(' '), T, t, d, k);
  return sortie(q, k, [[croise, P.croiseJetons], [mal, P.malplaces], [Math.floor(mal / 2), v => 'Piège : ' + v + ' suppose que chaque échange met deux jetons à leur place définitive.'], [C2(L) - k]], expl);
}
function explMotsRep(S, Tesp, T, t, d, k){
  return 'le premier de chaque couleur au départ va à la place du premier de cette couleur à l\'arrivée, et ainsi de suite. On remplace chaque jeton de départ par la place qu\'il doit occuper à l\'arrivée (dans ' + Tesp + ' : ' + placesGroupees(T) + '), puis on compte les paires mal rangées. ' +
    S + ' devient ' + suite(t) + '. Plus petits à droite de chaque nombre : ' + d.fleches + '. Total : ' + d.somme + ' = ' + pl(k, 'échange') + '.';
}

/* Niveau 4 : échanger deux éléments non voisins : 2d − 1. */
function echangeDeux(R){
  const n = R.int(6, 15), ctx = R.int(1, 3);
  let i, j, q;
  if (ctx === 3){ i = 1; j = n; q = 'Les ' + n + ' cartes d\'une rangée sont numérotées de 1 à ' + n + ', dans l\'ordre. On veut échanger la première et la dernière carte, toutes les autres retrouvant leur place à la fin. On ne peut qu\'échanger deux cartes voisines. Combien d\'échanges faut-il au minimum ?'; }
  else {
    i = R.int(1, n - 3); j = R.int(i + 3, n);
    if (ctx === 1) q = 'Dans une file de ' + n + ' personnes, on veut échanger les places de la personne en ' + ord(i, 'f') + ' position et de celle en ' + ord(j, 'f') + ' position ; toutes les autres doivent retrouver leur place à la fin. On ne peut qu\'échanger deux personnes voisines. Combien d\'échanges faut-il au minimum ?';
    else q = 'Sur une étagère de ' + n + ' livres, on veut intervertir le ' + ord(i, 'm') + ' et le ' + ord(j, 'm') + ' livre en partant de la gauche, les autres livres retrouvant leur place à la fin. On ne peut qu\'échanger deux livres voisins. Combien d\'échanges faut-il au minimum ?';
  }
  const d = j - i, ans = 2 * d - 1;
  const expl = 'Les deux éléments doivent franchir tous ceux qui sont entre eux, et ils ne se croisent qu\'une seule fois. Le premier avance de ' + d + ' places (' + d + ' échanges, dont celui où il croise le second), puis le second recule de ' + (d - 1) +
    ' places. Total : ' + d + ' + ' + (d - 1) + ' = ' + ans + ' échanges. Vérification par les paires mal rangées : chacun des deux en forme une avec chacun des ' + (d - 1) + ' éléments du milieu, plus celle qu\'ils forment entre eux : 2 × ' + (d - 1) + ' + 1 = ' + ans + '.';
  return sortie(q, ans, [[2 * d, P.deuxd], [1, P.quelc], [d], [2 * d + 1]], expl);
}

/* Niveaux 4 et 5 : un groupe passe devant (pairs, impairs, multiples de 3). */
function groupeDevant(n, mode){
  const devant = range(n).filter(x => mode === 'pairs' ? x % 2 === 0 : mode === 'impairs' ? x % 2 === 1 : x % 3 === 0);
  const derriere = range(n).filter(x => devant.indexOf(x) < 0);
  const cible = devant.concat(derriere);
  const parElt = devant.map(x => derriere.filter(y => y < x).length);
  return {cible: cible, devant: devant, derriere: derriere, parElt: parElt, ans: inv(cible)};
}
function nomMode(mode){ return mode === 'pairs' ? ['les nombres pairs', 'les impairs'] : mode === 'impairs' ? ['les nombres impairs', 'les pairs'] : ['les multiples de 3', 'les autres nombres']; }
function explGroupe(g, mode){
  const noms = nomMode(mode), lst = g.devant.map((x, i) => x + ' → ' + g.parElt[i]).filter((x, i) => g.parElt[i] > 0);
  return 'Les nombres d\'un même groupe gardent leur ordre : on compte seulement, pour chaque nombre du groupe placé devant, combien de nombres de l\'autre groupe plus petits que lui il doit dépasser. Pour ' + noms[0] + ' : ' +
    (lst.length ? lst.join(' ; ') : 'aucun') + '. Total : ' + plusTerm(g.parElt.filter(x => x > 0)) + ' échanges.';
}
function piegesGroupe(g){
  const croises = g.devant.length * g.derriere.length;
  return [[croises - g.ans, P.sens], [g.devant.length, P.somme], [C2(g.cible.length), P.tout]];
}
function pairsImpairs(R){
  const mode = R.pick(['pairs', 'impairs', 'mult3']), n = mode === 'mult3' ? R.int(9, 12) : R.int(8, 12), g = groupeDevant(n, mode), noms = nomMode(mode);
  const q = 'Les nombres de 1 à ' + n + ' sont écrits dans l\'ordre croissant. On veut écrire d\'abord ' + noms[0] + ', puis ' + noms[1] + ', chaque groupe restant dans l\'ordre croissant : ' + suite(g.cible) +
    '. On ne peut qu\'échanger deux nombres voisins. Combien d\'échanges faut-il au minimum ?';
  return sortie(q, g.ans, piegesGroupe(g), explGroupe(g, mode));
}

/* Niveau 4 : voisins contre échanges quelconques. */
function voisinsQuelconques(R){
  const n = R.int(6, 12), ctx = R.int(0, 1), h = Math.floor(n / 2), ans = C2(n) - h;
  const A1 = ctx ? 'Hugo' : 'Léo', B1 = ctx ? 'Jade' : 'Lina';
  const q = ctx
    ? 'Pour inverser l\'ordre de ' + n + ' livres alignés, ' + A1 + ' n\'échange que deux livres voisins à la fois ; ' + B1 + ', elle, peut échanger deux livres quelconques. Chacun utilise le moins d\'échanges possible. Combien d\'échanges ' + A1 + ' fait-il de plus que ' + B1 + ' ?'
    : 'Pour inverser l\'ordre de ' + n + ' cartes alignées, ' + A1 + ' n\'échange que deux cartes voisines à la fois ; ' + B1 + ', elle, peut échanger deux cartes quelconques. Chacun utilise le moins d\'échanges possible. Combien d\'échanges ' + A1 + ' fait-il de plus que ' + B1 + ' ?';
  const expl = 'Avec des voisins, chaque paire doit se croiser une fois ; avec des échanges quelconques, on échange les deux éléments des extrémités, puis les deux suivants, et ainsi de suite. ' +
    A1 + ' : ' + calculC2(n) + ' échanges. ' + B1 + ' : ' + h + ' échanges' + (n % 2 ? ' (l\'élément du milieu ne bouge pas)' : '') + '. Différence : ' + nb(C2(n)) + ' − ' + h + ' = ' + nb(ans) + '.';
  return sortie(q, ans, [[C2(n), v => 'Piège : ' + v + ' est le nombre d\'échanges de ' + A1 + ' seul ; il faut retirer ceux de ' + B1 + '.'],
    [n % 2 ? C2(n) - (n + 1) / 2 : null, v => 'Piège : ' + v + ' fait bouger l\'élément du milieu, qui reste en place.'],
    [n * (n - 1) - h, P.oubli2], [C2(n) - (n - 1), v => 'Piège : ' + v + ' suppose que ' + B1 + ' fait ' + (n - 1) + ' échanges, alors qu\'un échange quelconque place deux éléments d\'un coup.']], expl);
}

/* Niveau 5 : combien de rangements demandent exactement k échanges (tableau des effectifs par nombre de paires mal rangées). */
function toutesPerms(n){
  const res = [];
  const rec = (pref, reste) => { if (!reste.length){ res.push(pref); return; } reste.forEach((x, i) => rec(pref.concat([x]), reste.slice(0, i).concat(reste.slice(i + 1)))); };
  rec([], range(n));
  return res;
}
/* Effectifs des rangements de 1..n selon leur nombre de paires mal rangées (tableau construit ligne par ligne). */
function tableMahon(n){
  let ligne = [1];
  const lignes = {1: ligne};
  for (let m = 2; m <= n; m++){
    const nv = [];
    for (let k = 0; k <= C2(m); k++){ let s = 0; for (let j = 0; j <= m - 1; j++) if (k - j >= 0 && k - j < ligne.length) s += ligne[k - j]; nv.push(s); }
    ligne = nv; lignes[m] = nv;
  }
  return lignes;
}
const MAHON = tableMahon(6);
function binom(n, k){ if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }
const mah = (n, k) => (k >= 0 && k < MAHON[n].length) ? MAHON[n][k] : 0;
/* Termes de la ligne n − 1 qui s'additionnent pour donner la case k de la ligne n (dans l'ordre k, k − 1, …). */
function termesCase(n, k){ const l = []; for (let j = 0; j <= Math.min(k, n - 1); j++) if (k - j < MAHON[n - 1].length) l.push(MAHON[n - 1][k - j]); return l; }
/* Explication commune : construction du tableau, puis la case demandée. */
function explTable(n, k){
  const lignes = 'Avec 2 nombres : 1, 1. Avec 3 nombres : 1, 2, 2, 1. Avec 4 nombres : 1, 3, 5, 6, 5, 3, 1' + (n === 5 ? '. Avec 5 nombres : ' + MAHON[5].join(', ') : '') + '.';
  return 'Quand on place le plus grand nombre, ' + n + ', parmi les ' + (n - 1) + ' autres déjà rangés, il crée autant de paires mal rangées que de nombres à sa droite, de 0 à ' + (n - 1) +
    ' : la case k de la ligne ' + n + ' est la somme des cases k, k − 1, …, k − ' + (n - 1) + ' de la ligne ' + (n - 1) + ' (on ignore celles qui n\'existent pas). ' + lignes +
    ' Case « ' + k + ' » de la ligne ' + n + ' : ' + plusTerm(termesCase(n, k)) + '.';
}
function mahonian(R){
  const n = R.pick([4, 5, 5]), auPlus = R.int(0, 3) === 0;
  const k = auPlus ? R.int(2, 3) : (n === 4 ? R.int(2, 4) : R.pick([2, 3, 4, 5, 7, 8]));
  const ctx = R.int(1, 3);
  const cumul = j => { let s = 0; for (let i = 0; i <= j; i++) s += mah(n, i); return s; };
  const ans = auPlus ? cumul(k) : mah(n, k);
  const s = suite(range(n)), nom = n === 4 ? 'Quatre' : 'Cinq';
  const cond = auPlus ? 'est-il au plus ' + k : 'vaut-il exactement ' + k;
  let q;
  if (ctx === 1) q = 'On range les cartes ' + s + ' en ligne, dans un ordre quelconque. Pour combien de ces rangements le nombre minimal d\'échanges de deux cartes voisines pour revenir à l\'ordre ' + s + ' ' + cond + ' ?';
  else if (ctx === 2) q = 'Combien de suites formées des nombres ' + s + ', chacun écrit une seule fois, contiennent ' + (auPlus ? 'au plus ' : 'exactement ') + k + ' paires mal rangées, c\'est-à-dire des paires où un nombre est écrit avant un nombre plus petit ?';
  else q = nom + ' coureurs portent les dossards ' + s + '. Pour combien d\'ordres d\'arrivée possibles le nombre minimal d\'échanges de deux coureurs voisins pour passer de l\'ordre ' + s + ' à cet ordre d\'arrivée ' + cond + ' ?';
  if (auPlus) q += ctx === 2 ? ' La suite ' + s + ' elle-même compte, avec 0 paire mal rangée.' : ' L\'ordre ' + s + ' lui-même compte, avec 0 échange.';
  const kk = (!auPlus && k > C2(n) / 2) ? C2(n) - k : k;
  const sym = kk !== k ? ' Par symétrie (lire un rangement à l\'envers transforme k paires mal rangées en ' + C2(n) + ' − k), il y en a autant avec ' + k + ' qu\'avec ' + kk + '.' : '';
  const liste = toutesPerms(n).filter(t => inv(t) === k).map(t => t.join(''));
  const fin = auPlus
    ? ' Au plus ' + k + ' : ' + range(k + 1).map(j => mah(n, j - 1)).join(' + ') + ' = ' + ans + '.'
    : (liste.length <= 9 ? ' Ce sont : ' + liste.join(', ') + '.' : '') + ' Il y en a ' + ans + '.';
  const expl = 'Le nombre minimal d\'échanges est le nombre de paires mal rangées : on dresse le tableau des effectifs par nombre de paires mal rangées, ligne par ligne, en ajoutant les nombres un à un.' + sym + ' ' +
    explTable(n, kk) + fin;
  const pieges = auPlus
    ? [[mah(n, k), v => 'Piège : ' + v + ' ne compte que les cas à exactement ' + k + ', il faut aussi ceux à ' + range(k).map(j => j - 1).join(', ') + '.'], [ans - 1, v => 'Piège : ' + v + ' oublie la suite déjà rangée, qui compte avec 0.'], [cumul(k + 1)]]
    : [[mah(n, k - 1), v => 'Piège : ' + v + ' est l\'effectif pour ' + pairesMalR(k - 1) + ' : décalage d\'une case dans le tableau.'],
       [mah(n, k + 1), v => 'Piège : ' + v + ' est l\'effectif pour ' + pairesMalR(k + 1) + ' : décalage d\'une case dans le tableau.'],
       [binom(n - 1, kk)], [n - 1]];
  return sortie(q, ans, pieges, expl);
}

/* Niveau 5 : combien de suites différentes après EXACTEMENT k échanges ? (parité + tableau). */
function atteignables(R){
  const cas = R.pick([[4, 2], [4, 3], [4, 4], [5, 2], [5, 3], [5, 4], [6, 2]]), n = cas[0], k = cas[1], ctx = R.int(1, 3);
  const s = suite(range(n));
  const js = []; for (let j = k; j >= 0; j -= 2) js.unshift(j);
  const ans = somme(js.map(j => mah(n, j)));
  const objets = ctx === 1 ? ['la suite ' + s, 'deux nombres voisins', 'suites'] : ctx === 2 ? ['cartes posées dans l\'ordre ' + s, 'deux cartes voisines', 'rangements'] : ['jetons numérotés alignés dans l\'ordre ' + s, 'deux jetons voisins', 'rangements'];
  const q = 'On part de ' + objets[0] + '. On fait exactement ' + k + ' échanges de ' + objets[1] + ', l\'un après l\'autre ; un échange peut défaire un échange précédent. Combien de ' + objets[2] + ' différents peut-on obtenir à la fin ?';
  const qq = ctx === 1 ? q.replace('différents', 'différentes') : q;
  let tous = 0; for (let j = 0; j <= k; j++) tous += mah(n, j);
  const tableau = n <= 5
    ? 'Avec ' + n + ' nombres, les effectifs pour 0, 1, 2, … paires mal rangées sont ' + MAHON[n].join(', ') + '. '
    : 'Avec 6 nombres, on déduit le début de la ligne 6 du début de la ligne 5 (1, 4, 9, 15, …) en additionnant jusqu\'à 6 cases : ' + range(k + 1).map(j => plusTerm(termesCase(6, j - 1))).join(' ; ') + '. Les effectifs pour 0, 1, …, ' + k + ' paires mal rangées sont donc ' + range(k + 1).map(j => mah(6, j - 1)).join(', ') + '. ';
  const expl = 'En partant de la suite rangée, chaque échange de voisins fait monter ou descendre d\'une unité le nombre de paires mal rangées : après exactement ' + k + ' échanges, on obtient exactement les rangements dont le nombre de paires mal rangées ne dépasse pas ' + k + ' et a la même parité que ' + k + '. ' +
    'Ils sont tous atteignables : on fait les échanges utiles, puis on gaspille les échanges restants par paires (un échange et son inverse). ' + tableau +
    'Ici, on garde les rangements à ' + js.join(' ou ') + ' paires mal rangées : ' + plusTerm(js.map(j => mah(n, j))) + '.';
  const pw = Math.pow(n - 1, k);
  return sortie(qq, ans, [[tous, v => 'Piège : ' + v + ' oublie la parité et compte aussi des rangements impossibles.'], [mah(n, k), v => 'Piège : ' + v + ' oublie les rangements atteints en gaspillant des échanges.'],
    [pw !== tous ? pw : null, v => 'Piège : ' + v + ' compte les suites d\'échanges possibles, pas les résultats différents.']], expl);
}

/* Niveau 5 : moyennes (symétrie rangement / rangement lu à l'envers, ou place uniforme de la carte 1). */
function moyenne(R){
  const v = R.int(1, 3);
  if (v === 1){
    const n = R.int(5, 10), ctx = R.int(1, 3), ans = C2(n) / 2;
    let q;
    if (ctx === 1) q = 'On mélange au hasard ' + n + ' cartes numérotées de 1 à ' + n + ' et on les pose en ligne ; tous les rangements ont la même chance. On note le nombre minimal d\'échanges de deux cartes voisines qu\'il faut pour les remettre dans l\'ordre croissant. En moyenne sur tous les rangements possibles, combien vaut ce nombre ?';
    else if (ctx === 2) q = 'Une course réunit ' + n + ' coureurs portant les dossards de 1 à ' + n + ', et tous les ordres d\'arrivée sont également possibles. On note le nombre minimal d\'échanges de deux coureurs voisins qu\'il faut pour passer de l\'ordre d\'arrivée à l\'ordre des dossards. En moyenne sur tous les ordres d\'arrivée possibles, combien vaut ce nombre ?';
    else q = n + ' élèves de tailles toutes différentes se placent en rang au hasard ; tous les ordres ont la même chance. On note le nombre minimal d\'échanges de deux élèves voisins qu\'il faut pour les ranger du plus petit au plus grand. En moyenne sur tous les ordres possibles, combien vaut ce nombre ?';
    const expl = 'On associe chaque rangement au rangement lu à l\'envers : une paire est mal rangée dans exactement l\'un des deux. Les deux rangements d\'un même couple totalisent donc toutes les paires, soit ' + calculC2(n) +
      ', et chaque couple a pour moyenne la moitié de ce total. Moyenne : ' + nb(C2(n)) + ' ÷ 2 = ' + nb(ans) + ' échanges, soit n × (n − 1) ÷ 4.';
    const ch = qcm(nb(ans), [nb(C2(n)), nb(n * (n + 1) / 4), nb((n - 1) / 2), nb(n / 2)], k => { const x = ans + (k % 2 ? (k + 1) / 2 : -k / 2); return x > 0 ? nb(x) : null; });
    const txt = [];
    if (ch.indexOf(nb(C2(n))) > 0) txt.push('Piège : ' + nb(C2(n)) + ' est le maximum, atteint seulement quand tout est retourné, pas la moyenne.');
    if (ch.indexOf(nb((n - 1) / 2)) > 0) txt.push('Piège : ' + nb((n - 1) / 2) + ' est la moyenne pour le seul premier de la file (nombre de plus petits à sa droite) ; il faut additionner sur toutes les places.');
    return {q: q, a: nb(ans), accept: null, choix: ch, expl: expl + (txt.length ? ' ' + txt.slice(0, 2).join(' ') : '')};
  }
  if (v === 2){
    const w = R.int(3, 6), m = R.int(3, 6), L = w + m, ans = w * m / 2, ctx = R.int(0, 1);
    const q = ctx
      ? 'On aligne au hasard ' + w + ' jetons blancs et ' + m + ' jetons noirs ; toutes les dispositions ont la même chance. On note le nombre minimal d\'échanges de deux jetons voisins qu\'il faut pour mettre tous les blancs à gauche de tous les noirs. En moyenne sur toutes les dispositions possibles, combien vaut ce nombre ?'
      : 'Dans un rang formé au hasard de ' + w + ' filles et ' + m + ' garçons, toutes les dispositions ont la même chance. On note le nombre minimal d\'échanges de deux enfants voisins qu\'il faut pour mettre toutes les filles à gauche de tous les garçons. En moyenne sur toutes les dispositions possibles, combien vaut ce nombre ?';
    const expl = 'Deux objets identiques ne se croisent jamais : seules comptent les paires formées d\'un élément de chaque groupe, et on associe chaque disposition à la disposition lue à l\'envers, où chaque paire change d\'ordre. Il y a ' + w + ' × ' + m + ' = ' + w * m +
      ' paires mixtes ; une telle paire est mal rangée dans exactement l\'une des deux dispositions d\'un couple, donc la moyenne du couple est la moitié de ' + w * m + '. Moyenne : ' + w * m + ' ÷ 2 = ' + nb(ans) + ' échanges.';
    const ch = qcm(nb(ans), [nb(w * m), nb(C2(L) / 2), nb(L / 2), nb(w * m / 4)], k => { const x = ans + (k % 2 ? (k + 1) / 2 : -k / 2); return x > 0 ? nb(x) : null; });
    const txt = [];
    if (ch.indexOf(nb(w * m)) > 0) txt.push('Piège : ' + nb(w * m) + ' est le maximum, atteint seulement quand ' + (ctx ? 'tous les noirs sont à gauche' : 'tous les garçons sont à gauche') + ', pas la moyenne.');
    if (ch.indexOf(nb(C2(L) / 2)) > 0) txt.push('Piège : ' + nb(C2(L) / 2) + ' traite les ' + L + ' ' + (ctx ? 'jetons' : 'enfants') + ' comme s\'ils étaient tous différents ; deux ' + (ctx ? 'jetons de même couleur' : 'filles, ou deux garçons,') + ' ne comptent jamais.');
    return {q: q, a: nb(ans), accept: null, choix: ch, expl: expl + (txt.length ? ' ' + txt.slice(0, 2).join(' ') : '')};
  }
  const n = R.int(6, 10), ans = (n - 1) / 2, ctx = R.int(0, 1);
  const q = ctx
    ? 'On mélange au hasard ' + n + ' cartes numérotées de 1 à ' + n + ' et on les pose en ligne ; tous les rangements ont la même chance. On note le nombre de cartes placées avant la carte 1, c\'est-à-dire le nombre minimal d\'échanges de deux cartes voisines pour amener la carte 1 en tête. En moyenne sur tous les rangements possibles, combien vaut ce nombre ?'
    : 'Une course réunit ' + n + ' coureurs portant les dossards de 1 à ' + n + ', et tous les ordres d\'arrivée sont également possibles. On note le nombre de coureurs arrivés avant le dossard 1, c\'est-à-dire le nombre minimal d\'échanges de deux coureurs voisins pour amener le dossard 1 en tête. En moyenne sur tous les ordres d\'arrivée possibles, combien vaut ce nombre ?';
  const expl = 'La carte 1 a autant de chances d\'occuper chacune des ' + n + ' places : le nombre d\'éléments avant elle vaut 0, 1, …, ' + (n - 1) + ', chaque valeur ayant la même chance. Moyenne : (0 + 1 + … + ' + (n - 1) + ') ÷ ' + n + ' = ' + nb(C2(n)) + ' ÷ ' + n + ' = ' + nb(ans) + ', soit (n − 1) ÷ 2.';
  const ch = qcm(nb(ans), [nb(n / 2), nb(C2(n) / 2), nb(n - 1), nb((n + 1) / 2)], k => { const x = ans + (k % 2 ? (k + 1) / 2 : -k / 2); return x > 0 ? nb(x) : null; });
  const txt = [];
  if (ch.indexOf(nb(n / 2)) > 0) txt.push('Piège : ' + nb(n / 2) + ' est la moyenne des places 1 à ' + n + ' ; il faut la moyenne des nombres d\'éléments qui précèdent, de 0 à ' + (n - 1) + '.');
  if (ch.indexOf(nb(C2(n) / 2)) > 0) txt.push('Piège : ' + nb(C2(n) / 2) + ' est la moyenne de toutes les paires mal rangées, pas seulement de celles qui contiennent la carte 1.');
  return {q: q, a: nb(ans), accept: null, choix: ch, expl: expl + (txt.length ? ' ' + txt.slice(0, 2).join(' ') : '')};
}

/* Niveau 5 : parité. En partant de la suite rangée, après exactement k échanges, le nombre de paires mal rangées a la parité de k et ne dépasse pas k. */
function parite(R){
  const n = R.pick([5, 6]), k = n === 5 ? R.int(4, 7) : R.int(5, 7);
  const bon = R.pick([k, k - 2]);
  const mauvaisPar = R.shuffle([k - 1, k + 1, k - 3].filter(x => x >= 1 && x <= C2(n))).slice(0, 2);
  const valeurs = [bon, mauvaisPar[0], mauvaisPar[1], k + 2];
  const noms = R.shuffle(ELEVES).slice(0, 4);
  const items = R.shuffle(valeurs.map((v, i) => ({v: v, t: permK(n, v, R), bon: i === 0}))).map((x, i) => ({v: x.v, t: x.t, bon: x.bon, nom: noms[i]}));
  const gagnant = items.filter(x => x.bon)[0];
  const q = 'On part de la suite ' + suite(range(n)) + '. Quatre élèves font chacun exactement ' + k + ' échanges de deux nombres voisins (un échange peut défaire un échange précédent). Ils annoncent la suite obtenue :\n' +
    items.map(x => '- ' + x.nom + ' : ' + suite(x.t)).join('\n') + '\nUn seul élève a pu obtenir la suite annoncée. Lequel ?';
  const verdict = x => x.nom + ' : ' + pairesMalR(inv(x.t)) + ', ' +
    ((inv(x.t) - k) % 2 !== 0 ? 'impossible (pas la même parité que ' + k + ')' : inv(x.t) > k ? 'impossible (plus de ' + k + ')' : 'possible');
  const seul = ['Chloé', 'Dina', 'Elsa', 'Hana'].indexOf(gagnant.nom) >= 0 ? 'Seule ' : 'Seul ';
  const fin = gagnant.v === k ? seul + gagnant.nom + ' a pu y arriver, avec ' + k + ' échanges tous utiles.' : seul + gagnant.nom + ' a pu y arriver : ' + pl(gagnant.v, 'échange') + ' utile' + (gagnant.v > 1 ? 's' : '') + ', puis un échange aussitôt défait par l\'échange suivant, soit ' + gagnant.v + ' + 2 = ' + k + ' échanges.';
  const expl = 'En partant de la suite rangée, chaque échange de voisins fait monter ou descendre d\'une unité le nombre de paires mal rangées : à la fin, ce nombre a la même parité que le nombre d\'échanges et ne peut pas le dépasser. ' +
    items.map(verdict).join(' ; ') + '. ' + fin + ' Piège : vérifier seulement que le nombre de paires ne dépasse pas ' + k + ', sans regarder la parité.';
  const choix = qcm(gagnant.nom, items.filter(x => !x.bon).map(x => x.nom), () => null);
  return {q: q, a: gagnant.nom, accept: null, choix: choix, expl: expl};
}

/* Niveau 5 : parité en partant d'une suite NON rangée : on compte le nombre minimal d'échanges entre le départ et chaque suite annoncée (comme pour un mot). */
function pariteDepart(R){
  const n = 5, k = R.int(3, 5);
  const S = permK(n, R.int(2, 5), R);
  const bon = R.pick([k, k - 2]);
  const mauvaisPar = R.shuffle([k - 1, k + 1, k - 3].filter(x => x >= 1 && x <= C2(n))).slice(0, 2);
  const valeurs = [bon, mauvaisPar[0], mauvaisPar[1], k + 2];
  const noms = R.shuffle(ELEVES).slice(0, 4);
  /* suite à distance v de S : T[i] = S[σ(i) − 1] avec σ à v paires mal rangées ; la numérotation de S par ses places dans T a alors v paires mal rangées */
  const fabrique = v => { const sg = permK(n, v, R); return sg.map(x => S[x - 1]); };
  const items = R.shuffle(valeurs.map((v, i) => ({v: v, t: fabrique(v), bon: i === 0}))).map((x, i) => ({v: x.v, t: x.t, bon: x.bon, nom: noms[i]}));
  const gagnant = items.filter(x => x.bon)[0];
  const q = 'On part de la suite ' + suite(S) + '. Quatre élèves font chacun exactement ' + k + ' échanges de deux nombres voisins (un échange peut défaire un échange précédent). Ils annoncent la suite obtenue :\n' +
    items.map(x => '- ' + x.nom + ' : ' + suite(x.t)).join('\n') + '\nUn seul élève a pu obtenir la suite annoncée. Lequel ?';
  const numer = x => rangs(S.join(''), x.t.join(''));
  const verdict = x => { const d = inv(numer(x)); return x.nom + ' (' + suite(S) + ' devient ' + suite(numer(x)) + ') : ' + pairesMalR(d) + ', ' +
    ((d - k) % 2 !== 0 ? 'impossible (pas la même parité que ' + k + ')' : d > k ? 'impossible (plus de ' + k + ')' : 'possible'); };
  const seul = ['Chloé', 'Dina', 'Elsa', 'Hana'].indexOf(gagnant.nom) >= 0 ? 'Seule ' : 'Seul ';
  const fin = gagnant.v === k ? seul + gagnant.nom + ' a pu y arriver, avec ' + k + ' échanges tous utiles.' : seul + gagnant.nom + ' a pu y arriver : ' + pl(gagnant.v, 'échange') + ' utile' + (gagnant.v > 1 ? 's' : '') + ', puis un échange aussitôt défait par l\'échange suivant, soit ' + gagnant.v + ' + 2 = ' + k + ' échanges.';
  const expl = 'Le départ n\'est pas rangé : pour chaque suite annoncée, on compte le nombre minimal d\'échanges depuis le départ comme pour un mot (chaque nombre du départ est remplacé par sa place dans la suite annoncée, puis on compte les paires mal rangées) ; après exactement ' + k + ' échanges, ce nombre a la parité de ' + k + ' et ne dépasse pas ' + k + '. ' +
    items.map(verdict).join(' ; ') + '. ' + fin + ' Raccourci : la parité du nombre d\'échanges entre deux suites est celle de la somme de leurs nombres de paires mal rangées par rapport à l\'ordre croissant. Piège : compter les paires mal rangées par rapport à 1, 2, 3, 4, 5 au lieu de la suite de départ.';
  const choix = qcm(gagnant.nom, items.filter(x => !x.bon).map(x => x.nom), () => null);
  return {q: q, a: gagnant.nom, accept: null, choix: choix, expl: expl};
}

/* Niveau 5 : grandes structures décrites en entier ou en abrégé. */
function abrege(t, debut, fin){ return t.length <= 12 ? suite(t) : suite(t.slice(0, debut)) + ', …, ' + suite(t.slice(t.length - fin)); }
function structures(R, force){
  const st = force || R.pick([1, 2, 4]);
  if (st === 1){
    const m = R.int(5, 10), N = 2 * m, t = [];
    for (let i = 1; i <= m; i++) t.push(i, m + i);
    const ans = C2(m), parts = range(m).map(i => m - i);
    const q = 'Un paquet de ' + N + ' cartes numérotées de 1 à ' + N + ' est mélangé en intercalant parfaitement ses deux moitiés : ' + abrege(t, 6, 2) + '. Combien d\'échanges de deux cartes voisines faut-il au minimum pour le remettre dans l\'ordre croissant ?';
    const expl = 'On compte, pour chaque carte, les cartes plus petites placées à sa droite : seules les cartes de la deuxième moitié en ont. La carte ' + (m + 1) + ' précède les ' + (m - 1) + ' cartes de 2 à ' + m + ', la carte ' + (m + 2) + ' en précède ' + (m - 2) +
      ', et ainsi de suite jusqu\'à la carte ' + N + ' qui n\'en précède aucune. Total : ' + parts.filter(x => x > 0).join(' + ') + ' = ' + ans + ' échanges.';
    return sortie(q, ans, [[C2(m + 1), P.nplus1], [m * m], [C2(N), P.tout], [m]], expl);
  }
  if (st === 2 || st === 3){
    const b = R.int(3, 5), s = st === 2 ? R.int(2, 4) : R.int(3, 5), N = b * s, t = [];
    if (st === 2){ for (let p = b - 1; p >= 0; p--) for (let i = 1; i <= s; i++) t.push(p * s + i); }
    else { for (let p = 0; p < b; p++) for (let i = s; i >= 1; i--) t.push(p * s + i); }
    const disp = abrege(t, 2 * s, s);
    if (st === 2){
      const ans = C2(b) * s * s;
      const q = 'Les cartes numérotées de 1 à ' + N + ' forment ' + b + ' paquets de ' + s + ' cartes consécutives. On pose les paquets dans l\'ordre inverse, chaque paquet restant dans l\'ordre croissant : ' + disp + '. Combien d\'échanges de deux cartes voisines faut-il au minimum pour revenir à l\'ordre croissant ?';
      const expl = 'Deux cartes d\'un même paquet sont déjà dans le bon ordre : seules les paires de cartes de deux paquets différents sont mal rangées. Il y a ' + b + ' × ' + (b - 1) + ' ÷ 2 = ' + C2(b) + ' paires de paquets, et chacune donne ' + s + ' × ' + s + ' = ' + s * s + ' paires mal rangées. Total : ' + C2(b) + ' × ' + s * s + ' = ' + ans + ' échanges.';
      return sortie(q, ans, [[C2(N), P.tout], [C2(b) * s, v => 'Piège : ' + v + ' ne compte que ' + s + ' paires par couple de paquets, au lieu de ' + s + ' × ' + s + '.'], [b * s * s], [C2(b)]], expl);
    }
    const ans = b * C2(s);
    const q = 'Les cartes numérotées de 1 à ' + N + ' forment ' + b + ' paquets de ' + s + ' cartes consécutives. On retourne chaque paquet sur place, sans changer l\'ordre des paquets : ' + disp + '. Combien d\'échanges de deux cartes voisines faut-il au minimum pour revenir à l\'ordre croissant ?';
    const expl = 'Les paquets sont dans le bon ordre entre eux : seules les paires à l\'intérieur d\'un même paquet sont mal rangées. Un paquet retourné de ' + s + ' cartes en contient ' + s + ' × ' + (s - 1) + ' ÷ 2 = ' + C2(s) + ', et il y a ' + b + ' paquets : ' + b + ' × ' + C2(s) + ' = ' + ans + ' échanges.';
    return sortie(q, ans, [[C2(N), P.toutPaquets], [C2(b) * s * s, v => 'Piège : ' + v + ' correspondrait à des paquets posés dans l\'ordre inverse, chacun restant croissant.'], [b * s * (s + 1) / 2, P.nplus1], [b * s, P.somme]], expl);
  }
  const mode = R.pick(['pairs', 'impairs', 'mult3']), n = mode === 'mult3' ? R.int(15, 24) : R.int(14, 24), g = groupeDevant(n, mode), noms = nomMode(mode);
  const q = 'Les nombres de 1 à ' + n + ' sont écrits dans l\'ordre croissant. On veut écrire d\'abord tous ' + noms[0] + ', puis tous ' + noms[1] + ', chaque groupe restant dans l\'ordre croissant : ' +
    suite(g.devant.slice(0, 3)) + ', …, ' + g.devant[g.devant.length - 1] + ', ' + suite(g.derriere.slice(0, 2)) + ', …, ' + g.derriere[g.derriere.length - 1] + '. On ne peut qu\'échanger deux nombres voisins. Combien d\'échanges faut-il au minimum ?';
  const m = g.devant.length;
  return sortie(q, g.ans, piegesGroupe(g).concat([[m * m]]), explGroupe(g, mode));
}

/* Niveau 4 : jetons de trois couleurs, à trier par couleur. */
function jetons3(R){
  const a = R.int(2, 4), b = R.int(2, 4), c = Math.max(2, R.int(8, 9) - a - b), rang = {R: 0, V: 1, B: 2};
  const base = []; for (let i = 0; i < a; i++) base.push('R'); for (let i = 0; i < b; i++) base.push('V'); for (let i = 0; i < c; i++) base.push('B');
  const L = base.length, total = a * b + a * c + b * c;
  const compte = s => { let x = 0; for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (rang[s[i]] > rang[s[j]]) x++; return x; };
  let s = null;
  for (let e = 0; e < 60 && !s; e++){ const x = R.shuffle(base), k = compte(x); if (k >= 8 && k <= total - 4) s = x; }
  if (!s) s = base.slice(a).concat(base.slice(0, a));
  const k = compte(s), par = s.map((x, i) => { let y = 0; for (let j = i + 1; j < L; j++) if (rang[s[j]] < rang[x]) y++; return y; });
  const mal = s.filter((x, i) => x !== base[i]).length;
  let bv = 0; for (let i = 0; i < L; i++) for (let j = i + 1; j < L; j++) if (s[i] === 'B' && s[j] === 'V') bv++;
  const q = 'Une rangée de jetons rouges (R), verts (V) et bleus (B) se présente ainsi, de gauche à droite : ' + s.join(' ') + '. On veut tous les rouges à gauche, puis tous les verts, puis tous les bleus à droite, en échangeant à chaque fois deux jetons voisins. Combien d\'échanges faut-il au minimum ?';
  const expl = 'Deux jetons de même couleur n\'ont jamais besoin de se croiser : on compte seulement les paires de deux couleurs différentes rangées dans le mauvais ordre. Pour chaque jeton, on compte les jetons placés à sa droite qui doivent finir à sa gauche : ' +
    s.map((x, i) => x + ' → ' + par[i]).join(' ; ') + '. Total : ' + plusTerm(par.filter(x => x > 0)) + ' échanges.';
  return sortie(q, k, [[total - k, P.sens], [mal, P.malplaces], [bv > 0 ? k - bv : null, v => 'Piège : ' + v + ' oublie les paires bleu puis vert, mal rangées elles aussi.']], expl);
}

/* ---------- répartition par niveau ---------- */
function n1(R){ const st = R.int(1, 4); return st === 1 ? deplacement(R) : st === 2 ? triCartes(R, R.pick([3, 4, 4]), 1, 4) : st === 3 ? pairesMal(R) : mots(R, P_COURTS); }
function n2(R){ const st = R.int(1, 5); return st === 1 ? triCartes(R, 5, 3, 8) : st === 2 ? blocs(R, 2, 4) : st === 3 ? renverse(R, 4, 7) : st === 4 ? (R.int(0, 1) ? mots(R, P_MOYENS) : alpha(R, A5)) : rotationMot(R, R_COURTS, true); }
function n3(R){
  const st = R.int(1, 8);
  return st === 1 ? mots(R, P_LONGS) : st === 2 ? triCartes(R, R.pick([6, 7]), 6, 13) : st === 3 ? blocs(R, 3, 6, 3)
    : st === 4 ? (R.int(0, 1) ? renverse(R, 9, 12, [1, 3, 3, 4]) : renverseGrand(R)) : st === 5 ? alpha(R, A6)
    : st === 6 ? rotationMot(R, R.int(0, 1) ? R_LONGS : R_SIX, false) : st === 7 ? jetons2(R) : motsRepetes(R, REP_N3);
}
function n4(R){
  const st = R.int(1, 10);
  return st === 1 ? troisGroupes(R) : st === 2 ? jetonsCible(R, 2) : st === 3 ? echangeDeux(R) : st === 4 ? pairsImpairs(R) : st === 5 ? voisinsQuelconques(R)
    : st === 6 ? structures(R, 3) : st === 7 ? alphaRepete(R) : st === 8 ? presqueEnvers(R) : st === 9 ? jetons3(R) : motsRepetes(R, REP_N4);
}
function n5(R){
  const st = R.int(1, 8);
  return st === 1 ? mahonian(R) : st === 2 ? parite(R) : st === 3 ? pariteDepart(R) : st === 4 ? structures(R) : st === 5 ? atteignables(R)
    : st === 6 ? moyenne(R) : st === 7 ? jetonsCible(R, 3) : motsRepetes(R, REP_N5);
}
function secours(){
  return {q: 'Combien d\'échanges de deux nombres voisins faut-il au minimum pour passer de la suite 3, 1, 2 à la suite 1, 2, 3 ?', a: '2', accept: null, choix: ['2', '1', '3', '4'],
    expl: 'On compte les paires mal rangées, c\'est-à-dire un nombre placé avant un plus petit. Ici (3, 1) et (3, 2) : 2 échanges.'};
}

/* =====================================================
   alb-13 · Permutations : échanges de voisins et inversions
   ===================================================== */
A.push({
  id: 'alb-13-permutations',
  phase: 'albert',
  ordre: 13,
  theme: 'denombrement',
  titre: 'Permutations : échanges de voisins et inversions',
  objectif: 'Trouver sans tâtonner le nombre minimal d\'échanges de deux voisins pour passer d\'un ordre à un autre, en comptant les paires mal rangées.',
  lecon:
`<p class="lede">Au test, on te montre une file dans le désordre (les lettres d'un mot, des cartes, des coureurs) et on te demande combien d'<mark>échanges de deux voisins</mark> il faut, au minimum, pour obtenir un ordre donné. Tâtonner est long et risqué : une méthode de comptage sûre tient en une ligne de brouillon.</p>
<h2>Ce que le test demande</h2>
<p>Un seul geste est permis : échanger deux éléments <strong>côte à côte</strong>, et on cherche le nombre <strong>minimal</strong> d'échanges. Le cas typique : passer d'un mot à un autre écrit avec les mêmes lettres. Plus haut dans le test : des blocs qui changent de place, une file retournée, des objets identiques (jetons, lettres répétées), ou une question sur tous les rangements possibles.</p>
<h2>Ce qu'il faut savoir avant</h2>
<p>Une <mark>paire mal rangée</mark> (on dit aussi une inversion) est formée de deux éléments, voisins ou non, dont le plus grand est placé avant le plus petit. Dans 3, 1, 2, il y en a deux : (3, 1) et (3, 2).</p>
<p>Échanger deux voisins ne change l'ordre que de ces deux-là : un échange corrige donc au plus une paire mal rangée. Et tant que la file n'est pas rangée, il existe deux voisins mal rangés, qu'on peut échanger pour corriger une paire. D'où la règle :</p>
<div class="formule"><p>nombre minimal d'échanges de voisins = nombre de paires mal rangées</p></div>
<p>Tu auras aussi besoin du nombre total de paires parmi n éléments : 1 + 2 + … + (n − 1) = n × (n − 1) ÷ 2. Par exemple, 1 + 2 + 3 + 4 + 5 = 6 × 5 ÷ 2 = 15.</p>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je numérote :</strong> chaque élément de départ reçoit sa place dans l'ordre d'arrivée. Avec des nombres à trier, c'est déjà fait.</p>
<p><strong>2. Je compte :</strong> pour chaque nombre, de gauche à droite, combien de nombres plus petits sont à sa droite.</p>
<p><strong>3. J'additionne :</strong> le total est le nombre minimal d'échanges de voisins.</p>
<p><strong>4. Je cherche un raccourci :</strong> deux blocs de p et q éléments qui s'échangent en gardant leur ordre interne, c'est p × q ; une file de n éléments entièrement retournée, c'est n × (n − 1) ÷ 2 ; une file presque retournée, c'est n × (n − 1) ÷ 2 moins les paires bien rangées.</p>
</div>
<h2>Exemples résolus</h2>
<h3>Exemple 1 : trier 4, 1, 3, 2</h3>
<p>4 a trois nombres plus petits à sa droite (1, 3 et 2) ; 1 n'en a aucun ; 3 en a un (2) ; 2 n'en a aucun. Total : 3 + 0 + 1 + 0 = <strong>4 échanges</strong>.</p>
<h3>Exemple 2 : passer de NAGER à RANGE</h3>
<p>Dans RANGE, les places sont R = 1, A = 2, N = 3, G = 4, E = 5. Lettre par lettre, NAGER devient 3, 2, 4, 5, 1. Plus petits à droite : 3 en a deux, 2 en a un, 4 en a un, 5 en a un, 1 aucun. Total : 2 + 1 + 1 + 1 = <strong>5 échanges</strong>.</p>
<h3>Exemple 3 : passer de CRAYON à ONCRAY</h3>
<p>Le bloc ON passe devant le bloc CRAY, et chaque bloc garde son ordre. Deux lettres d'un même bloc ne se croisent jamais : chacune des 2 lettres de ON doit seulement croiser chacune des 4 lettres de CRAY. Total : 2 × 4 = <strong>8 échanges</strong>.</p>
<h3>Exemple 4 : niveau du test, DANGER devient GRANDE</h3>
<p>Dans GRANDE : G = 1, R = 2, A = 3, N = 4, D = 5, E = 6. DANGER devient 5, 3, 4, 1, 6, 2. Plus petits à droite : 5 en a quatre (3, 4, 1, 2) ; 3 en a deux (1, 2) ; 4 en a deux (1, 2) ; 1 aucun ; 6 en a un (2) ; 2 aucun. Total : 4 + 2 + 2 + 0 + 1 + 0 = <strong>9 échanges</strong>.</p>
<h3>Exemple 5 : objets identiques, B N N B B N B</h3>
<p>On veut tous les B à gauche. Deux B ne se croisent jamais : pour chaque B, on compte les N placés à sa gauche. Premier B : 0 ; deuxième B : 2 ; troisième B : 2 ; quatrième B : 3. Total : 0 + 2 + 2 + 3 = <strong>7 échanges</strong>. Même idée pour un mot à lettres répétées : le premier E du départ va sur le premier E de l'arrivée, le deuxième sur le deuxième.</p>
<h3>Exemple 6 : file presque retournée, 8, 7, 5, 6, 4, 3, 2, 1</h3>
<p>Presque tout est à l'envers : on compte les paires bien rangées (un nombre écrit avant un plus grand, voisins ou non). Ici une seule, (5, 6). On la retire du total des paires, 8 × 7 ÷ 2 = 28 : 28 − 1 = <strong>27 échanges</strong>.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl"><tr><th>n éléments</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>20</th></tr>
<tr><td>tout retourner</td><td>6</td><td>10</td><td>15</td><td>21</td><td>28</td><td>36</td><td>45</td><td>190</td></tr></table>
<p>Au brouillon, note sous chaque nombre combien de plus petits il a à sa droite. Contrôle l'ordre de grandeur : jamais plus que n × (n − 1) ÷ 2. Pour un grand n, simplifie avant de multiplier : 50 × 49 ÷ 2 = 25 × 49 = 1 225.</p>
<p><strong>Deux éléments à intervertir</strong>, aux places i et j avec d = j − i (par exemple le 2e et le 5e : d = 3), les autres retrouvant leur place : 2d − 1 échanges, ici 5, car ils ne se croisent qu'une fois. Si l'énoncé autorise l'échange de deux éléments <strong>quelconques</strong>, tout change : retourner n éléments ne demande que n ÷ 2 échanges, arrondi en dessous.</p>
<h2>Pour aller plus loin</h2>
<p><strong>Parité.</strong> En partant de la file rangée (0 paire mal rangée), chaque échange de voisins fait monter ou descendre d'exactement une unité le nombre de paires mal rangées. Après exactement k échanges, ce nombre ne dépasse donc pas k et a la même parité que k. Si le départ n'est pas rangé, applique la même règle au nombre minimal d'échanges entre le départ et l'arrivée, compté comme pour un mot.</p>
<p><strong>Compter les rangements.</strong> Combien de rangements de 1, 2, …, n ont exactement k paires mal rangées ? On construit un tableau ligne par ligne. Quand on insère le plus grand nombre n parmi les n − 1 autres déjà rangés, il crée autant de paires mal rangées que de nombres placés à sa droite : 0, 1, …, n − 1. La règle : la case k de la ligne n est la somme des cases k, k − 1, …, k − (n − 1) de la ligne n − 1 (on ignore les cases qui n'existent pas).</p>
<table class="tbl"><tr><th>paires mal rangées</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr>
<tr><td>ligne 3 (3 nombres)</td><td>1</td><td>2</td><td>2</td><td>1</td><td></td><td></td><td></td></tr>
<tr><td>ligne 4 (4 nombres)</td><td>1</td><td>3</td><td>5</td><td>6</td><td>5</td><td>3</td><td>1</td></tr>
<tr><td>ligne 5 (début)</td><td>1</td><td>4</td><td>9</td><td>15</td><td>20</td><td>22</td><td>…</td></tr></table>
<p>Ligne 4 à partir de la ligne 3 (jusqu'à 4 cases) : 1 ; 2 + 1 = 3 ; 2 + 2 + 1 = 5 ; 1 + 2 + 2 + 1 = 6 ; puis 5, 3, 1 par symétrie. Ligne 5 à partir de la ligne 4 (jusqu'à 5 cases) : case 3 = 6 + 5 + 3 + 1 = 15 ; case 4 = 5 + 6 + 5 + 3 + 1 = 20 ; case 5 = 3 + 5 + 6 + 5 + 3 = 22. Chaque ligne est symétrique.</p>
<p><strong>Moyenne.</strong> Un rangement et le même lu à l'envers se partagent toutes les paires : en moyenne sur tous les rangements, il y a n × (n − 1) ÷ 4 paires mal rangées. Avec deux couleurs (p blancs, q noirs), la moyenne est p × q ÷ 2.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Remplace chaque élément par sa place dans l'ordre voulu, puis additionne, pour chaque nombre, combien de nombres plus petits sont à sa droite : c'est le nombre minimal d'échanges de voisins.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Ne compter que les voisins mal rangés : il faut toutes les paires, même éloignées. Compter dans le mauvais sens, c'est-à-dire les paires bien rangées. Confondre avec des échanges quelconques, qui demandent beaucoup moins de coups. Simuler au hasard au lieu de compter. Faire se croiser deux lettres ou deux jetons identiques : le premier E va sur le premier E, jamais sur le dernier. Pour deux blocs, répondre p + q au lieu de p × q. Oublier de diviser par 2 dans n × (n − 1) ÷ 2.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Minimum d'échanges de voisins = nombre de paires mal rangées. Deux blocs de p et q éléments : p × q. Tout retourner (n éléments) : n × (n − 1) ÷ 2. Deux objets identiques ne se croisent jamais. En partant de l'ordre rangé, après exactement k échanges, le nombre de paires mal rangées a la parité de k et ne dépasse pas k.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      if (n === 1) return n1(R);
      if (n === 2) return n2(R);
      if (n === 3) return n3(R);
      if (n === 4) return n4(R);
      return n5(R);
    } catch (e){
      return secours();
    }
  }
});

})();
