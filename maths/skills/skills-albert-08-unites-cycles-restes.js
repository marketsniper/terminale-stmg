/* ===== Maths · Objectif Albert School : alb-08 · Chiffre des unités, cycles et restes =====
   Une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS (aucun symbole de premier niveau).
   gen(level, R) n'utilise que R.int, R.pick, R.shuffle ; niveau borné de 1 à 5 ; jamais d'exception.
   Toutes les réponses sont calculées par le code (cycles, blocs, restes). Vérification indépendante :
   contenu/verifs/alb-08-unites-cycles-restes-verif.js (force brute en BigInt, divisions posées, motifs déroulés). */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (recopiées de la référence alb-01) ---------- */
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
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(c => SUP[+c]).join('');
const pw = (b, n) => b + sup(n);                       // 7²³
const ord = k => k === 1 ? '1er' : k + 'e';
const deux = x => (x < 10 ? '0' : '') + x;              // deux derniers chiffres : 07
const somme = l => l.reduce((s, x) => s + x, 0);
const liste = l => l.join(', ');
const compte = (l, x) => l.filter(y => y === x).length;
/* Cycle des restes de a¹, a², a³… dans la division par m (a et m premiers entre eux, ou m = 10). */
function cycle(a, m){
  const l = [], x0 = a % m; let x = x0;
  do { l.push(x); x = (x * a) % m; } while (x !== x0 && l.length < 60);
  return l;
}
/* Rang n dans un cycle de longueur L : n = L × q + r ; r = 0 renvoie au DERNIER élément. */
function place(n, L){ const q = Math.floor(n / L), r = n % L; return {q, r, idx: r === 0 ? L - 1 : r - 1}; }
function phrase(n, L, nom){
  const p = place(n, L);
  return nb(n) + ' = ' + L + ' × ' + nb(p.q) + ' + ' + p.r + (p.r === 0
    ? ' : le reste est 0, on tombe donc sur le dernier ' + nom
    : ' : le reste ' + p.r + ' désigne le ' + ord(p.r) + ' ' + nom);
}
const piege0 = nom => ' Piège : un reste de 0 renvoie au dernier ' + nom + ', pas au premier.';
const pieges = l => { const v = l.filter(Boolean); return v.length ? ' Piège : ' + v.join(' ; et ') + '.' : ''; };
const vChiffre = bonne => k => String((+bonne + k) % 10);
const vReste = (bonne, m) => k => String((+bonne + k) % m);
const vNombre = bonne => k => { const v = bonne + (k % 2 ? 1 : -1) * Math.ceil(k / 2); return v >= 0 ? nb(v) : null; };
function mk(q, bonne, autres, voisin, expl){ return {q, a: bonne, accept: null, choix: qcm(bonne, autres, voisin), expl}; }
/* Écriture décimale de k/d : L chiffres après la virgule, par division posée. */
function decimales(k, d, L){ const out = []; let x = k % d; for (let i = 0; i < L; i++){ x *= 10; out.push(Math.floor(x / d)); x %= d; } return out; }
function periode(k, d){ let x = k % d, L = 0; const x0 = x; do { x = (x * 10) % d; L++; } while (x !== x0 && L < 100); return L; }
const sommePuiss = (b, N) => pw(b, 1) + ' + ' + pw(b, 2) + ' + ' + pw(b, 3) + ' + … + ' + pw(b, N);
/* Premières phrases des explications : elles servent d'indice (l'app y masque la réponse), donc elles décrivent
   la méthode SANS aucun chiffre, et sans syllabe de note, couleur ou majuscule qui pourrait être la réponse. */
const M_MOTIF = 'Écrire toute cette suite serait trop long : on divise le rang demandé par le nombre d\'éléments du motif, et le reste indique où l\'on tombe dans le motif.';
const M_CYCLE = 'On cherche le cycle des chiffres des unités des puissances, puis on divise l\'exposant par la longueur du cycle : le reste donne la place dans le cycle.';

/* ---------- données ---------- */
const COUL = ['rouge', 'verte', 'bleue', 'jaune', 'blanche', 'violette', 'orange', 'rose'];
const MOTS = ['JARDIN', 'CAHIER', 'VOYAGE', 'PLANTE', 'FROMAGE', 'COUSIN', 'NUAGE', 'CLIMAT', 'MOULIN', 'PIRATE', 'CAMION', 'TULIPE'];
const PRENOMS = ['Nina', 'Tom', 'Lina', 'Hugo', 'Sacha', 'Inès', 'Yanis', 'Léo'];
const NOTES = ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'];
const PERLES = [['blanche', 'blanches'], ['noire', 'noires'], ['rouge', 'rouges'], ['bleue', 'bleues'], ['verte', 'vertes'], ['jaune', 'jaunes'], ['grise', 'grises'], ['dorée', 'dorées']];
const COUL3 = [['rouge', 'rouges'], ['verte', 'vertes'], ['bleue', 'bleues'], ['jaune', 'jaunes'], ['blanche', 'blanches'], ['violette', 'violettes']];
const MOTS_REP = ['BANANA', 'ANANAS', 'KAYAK', 'RADAR', 'MAMAN', 'PAPAYE', 'COCOTTE', 'ABRACADABRA'];
const UC = [0, 1, 4, 9, 6, 5, 6, 9, 4, 1];   // unités de d² selon le dernier chiffre d
const UK = [0, 1, 8, 7, 4, 5, 6, 3, 2, 9];   // unités de d³
const U4 = [0, 1, 6, 1, 6, 5, 6, 1, 6, 1];   // unités de d⁴
/* Restes de aⁿ par m : cycles courts (niveau 3), cycles de 5 ou 6 (niveau 4). */
const P3 = [[2, 7], [4, 7], [9, 7], [11, 7], [2, 5], [3, 5], [7, 5], [8, 5], [12, 5], [13, 5], [4, 9], [7, 9], [2, 15], [3, 13], [5, 13], [8, 13]];
const P4 = [[2, 9], [5, 9], [3, 7], [5, 7], [10, 7], [3, 11], [4, 11], [5, 11], [9, 11], [4, 13], [10, 13], [2, 31]];
/* Sommes a¹ + … + aᴺ : un cycle complet de restes a une somme multiple de m. */
const P4S = [[2, 7], [4, 7], [2, 5], [3, 5], [2, 9], [3, 7], [5, 7], [3, 11], [4, 11], [5, 11], [9, 11], [2, 15], [4, 13]];
/* aᵏ = multiple de m ± 1 (niveau 5). */
const PM = [[2, 13, 6, -1], [2, 17, 4, -1], [2, 33, 5, -1], [2, 65, 6, -1], [3, 28, 3, -1], [3, 82, 4, -1], [5, 26, 2, -1], [5, 126, 3, -1],
  [6, 37, 2, -1], [7, 50, 2, -1], [4, 65, 3, -1], [10, 13, 3, -1], [10, 101, 2, -1], [9, 41, 2, -1], [11, 61, 2, -1],
  [2, 31, 5, 1], [2, 63, 6, 1], [3, 26, 3, 1], [3, 80, 4, 1], [5, 124, 3, 1], [4, 21, 3, 1], [10, 37, 3, 1]];
const FR3 = [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [1, 27], [2, 27], [4, 27], [5, 27], [7, 27], [8, 27],
  [1, 37], [2, 37], [3, 37], [4, 37], [5, 37], [6, 37], [7, 37], [8, 37], [9, 37]];
const FR4 = [[1, 13], [2, 13], [3, 13], [4, 13], [5, 13], [6, 13], [7, 13], [8, 13], [9, 13], [10, 13], [11, 13], [12, 13],
  [1, 41], [2, 41], [3, 41], [4, 41], [5, 41], [6, 41], [7, 41], [8, 41], [9, 41]];
const FR_SOM = [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [1, 13], [2, 13], [3, 13], [1, 27], [2, 27], [4, 27], [5, 27], [7, 27], [8, 27],
  [1, 37], [2, 37], [4, 37], [5, 37], [7, 37]];
const PAIRES5 = [[2, 3], [3, 7], [2, 8], [7, 8], [4, 6], [6, 9], [2, 4], [3, 4], [2, 9], [4, 7], [8, 9], [2, 6]];

/* =====================================================================
   Briques communes à plusieurs niveaux
   ===================================================================== */

/* Motif répété : élément de rang n (guirlande, mot, notes). */
function gMotif(R, nMin, nMax){
  const t = R.int(1, 3), n = R.int(nMin, nMax);
  let motif, q, extra, quoi;
  if (t === 1){
    motif = R.shuffle(COUL).slice(0, R.int(4, 6));
    extra = COUL.filter(c => motif.indexOf(c) < 0);
    q = 'Une guirlande lumineuse répète toujours les mêmes couleurs, dans cet ordre : ' + motif.join(', ') + ', puis elle recommence. De quelle couleur est la ' + nb(n) + 'e ampoule ?';
    quoi = c => 'une ampoule ' + c;
  } else if (t === 2){
    const mot = R.pick(MOTS);
    motif = mot.split('');
    extra = 'BKSUVWXZ'.split('').filter(c => motif.indexOf(c) < 0);
    q = R.pick(PRENOMS) + ' écrit le mot ' + mot + ' encore et encore, sans espace : ' + mot + mot + mot + '… Quelle est la ' + nb(n) + 'e lettre écrite ?';
    quoi = c => 'la lettre ' + c;
  } else {
    motif = NOTES.slice();
    extra = [];
    q = 'Une boîte à musique joue en boucle les notes ' + motif.join(', ') + ', toujours dans cet ordre. Quelle est la ' + nb(n) + 'e note jouée ?';
    quoi = c => 'la note ' + c;
  }
  const L = motif.length, p = place(n, L), bonne = motif[p.idx];
  const autres = [motif[(p.idx + 1) % L], motif[(p.idx + L - 1) % L], motif[0], motif[L - 1], motif[(p.idx + 2) % L]];
  const expl = M_MOTIF + ' Ici, le motif compte ' + L + ' éléments. '
    + phrase(n, L, 'élément du motif') + ', soit ' + quoi(bonne) + '.'
    + (p.r === 0 ? piege0('élément du motif') : ' Piège : se décaler d\'un rang. Vérifie sur un petit exemple : le rang ' + (L + 1) + ' redonne le 1er élément du motif.');
  return mk(q, bonne, autres, k => k < L ? motif[(p.idx + k) % L] : (extra.length ? extra[(k - L) % extra.length] : null), expl);
}

/* Chiffre des unités de B puissance n. */
function gPuissance(R, petit){
  const u = R.pick([2, 3, 4, 7, 8, 9]);
  const B = petit ? u : R.int(1, 99) * 10 + u, n = petit ? R.int(5, 60) : R.int(100, 3000);
  const cyc = cycle(u, 10), L = cyc.length, p = place(n, L), bonne = String(cyc[p.idx]);
  const faux = cyc[((n % 10 || 10) - 1) % L];          // dernier chiffre de l'exposant au lieu du reste
  const autres = [cyc[(p.idx + 1) % L], cyc[(p.idx + L - 1) % L], cyc[0], (u * n) % 10, u, faux].map(String);
  let expl;
  if (petit){
    expl = M_CYCLE + ' Le chiffre des unités des puissances de ' + u + ' suit un cycle de longueur ' + L + ' : ' + liste(cyc) + ', puis cela recommence. '
      + 'On divise l\'exposant par ' + L + ' : ' + phrase(n, L, 'terme du cycle') + '. Le chiffre des unités de ' + pw(B, n) + ' est donc ' + bonne + '.'
      + (p.r === 0 ? piege0('terme du cycle') : '')
      + ((u * n) % 10 !== +bonne ? ' Attention : ' + pw(B, n) + ' n\'est pas ' + u + ' × ' + n + '.' : '');
  } else {
    expl = 'Seul le chiffre des unités de la base compte : on cherche le cycle des unités de ses puissances, puis on divise l\'exposant par la longueur du cycle. '
      + 'Ici, ' + pw(B, n) + ' se termine comme ' + pw(u, n) + ', et les unités des puissances de ' + u + ' suivent le cycle ' + liste(cyc) + '. '
      + 'On divise l\'exposant par ' + L + (L === 4 ? ' (il suffit de diviser ses deux derniers chiffres par 4)' : ' (il suffit de savoir s\'il est pair ou impair)') + ' : '
      + phrase(n, L, 'terme du cycle') + '. Le chiffre des unités est donc ' + bonne + '.'
      + pieges([p.r === 0 ? 'un reste de 0 renvoie au dernier terme du cycle, pas au premier' : '',
        String(faux) !== bonne ? 'c\'est le reste de l\'exposant par ' + L + ' qui compte, pas son dernier chiffre' : '']);
  }
  return mk('Quel est le chiffre des unités de ' + pw(B, n) + ' ?', bonne, autres, vChiffre(bonne), expl);
}

/* Chiffre des unités de b¹ + b² + … + bᴺ. */
function gSommePuissUnites(R, nMin, nMax){
  const b = R.pick([2, 3, 7, 8, 4, 9]), N = R.int(nMin, nMax);
  const cyc = cycle(b, 10), L = cyc.length, S = somme(cyc), q = Math.floor(N / L), r = N % L;
  const reste = cyc.slice(0, r), P = somme(reste), bonne = String(P % 10);
  const autres = ['0', String(cyc[(N - 1) % L]), String(somme(cyc.slice(0, r + 1)) % 10), String((b * N) % 10), String(somme(cyc.slice(0, Math.max(0, r - 1))) % 10)];
  let fin;
  if (r === 0) fin = ', et il ne reste aucun terme. Le chiffre des unités est 0.';
  else if (r === 1) fin = ', puis il reste un terme, ' + pw(b, N) + ', d\'unité ' + reste[0] + '. Le chiffre des unités est ' + bonne + '. Piège : ne pas oublier le terme qui reste après les blocs complets.';
  else fin = ', puis il reste ' + r + ' termes (de ' + pw(b, N - r + 1) + ' à ' + pw(b, N) + '), d\'unités ' + liste(reste) + ', de somme ' + P + '. Le chiffre des unités est ' + bonne + '. Piège : ne pas oublier les termes qui restent après les blocs complets.';
  const expl = 'On regroupe les termes par blocs aussi longs que le cycle des chiffres des unités : chaque bloc complet a la même somme d\'unités, et il ne reste qu\'à ajouter les derniers termes. '
    + 'Ici, les unités des puissances de ' + b + ' suivent le cycle ' + liste(cyc) + ', de longueur ' + L + ' : un bloc complet donne ' + cyc.join(' + ') + ' = ' + S + ', qui se termine par 0 : les blocs complets ne comptent pas. '
    + nb(N) + ' = ' + L + ' × ' + nb(q) + ' + ' + r + ' : ' + nb(q) + ' blocs complets' + fin;
  return mk('Quel est le chiffre des unités de la somme ' + sommePuiss(b, N) + ' ?', bonne, autres, vChiffre(bonne), expl);
}

/* Reste de aⁿ dans la division par m, par le cycle des restes. */
function gRestePuissance(R, paires, nMin, nMax, reduire){
  const pr = R.pick(paires), m = pr[1], aR = pr[0] % m;
  let a = pr[0];
  if (reduire && R.int(0, 1) === 1) a = aR + m * R.int(Math.ceil((20 - aR) / m), Math.floor((999 - aR) / m));
  const n = R.int(nMin, nMax), cyc = cycle(a, m), L = cyc.length, p = place(n, L), bonne = String(cyc[p.idx]);
  const unites = terme(cycle(a % 10, 10), n);
  const autres = [cyc[(p.idx + 1) % L], cyc[(p.idx + L - 1) % L], unites < m ? unites : null, cyc[0], cyc[(p.idx + 2) % L], 0].map(x => x == null ? null : String(x));
  const etapes = [];
  for (let i = 0; i < L - 1; i++){
    const P = cyc[i] * aR;
    etapes.push(cyc[i] + ' × ' + aR + ' = ' + P + (P >= m ? ', reste ' + (P % m) : ''));
  }
  const expl = 'On cherche le cycle des restes des puissances en multipliant à chaque étape et en ne gardant que le reste, jusqu\'à ce que les restes se répètent, puis on divise l\'exposant par la longueur du cycle. '
    + (a >= m ? 'Comme ' + a + ' = ' + m + ' × ' + Math.floor(a / m) + ' + ' + aR + ', on peut remplacer ' + a + ' par ' + aR + '. ' : '')
    + 'Restes successifs : ' + aR + ' ; ' + etapes.join(' ; ') + '. Le cycle ' + liste(cyc) + ' a une longueur ' + L + '. '
    + phrase(n, L, 'terme du cycle') + ' : le reste de ' + pw(a, n) + ' dans la division par ' + m + ' est ' + bonne + '.'
    + pieges([p.r === 0 ? 'un reste de 0 renvoie au dernier terme du cycle, pas au premier' : '', 'ne pas confondre ce reste avec le chiffre des unités']);
  return mk('Quel est le reste de la division euclidienne de ' + pw(a, n) + ' par ' + m + ' ?', bonne, autres, vReste(bonne, m), expl);
}
function terme(cyc, n){ return cyc[(n - 1) % cyc.length]; }

/* n-ième chiffre après la virgule de k/d. */
function gDecimale(R, fractions, nMin, nMax){
  const fr = R.pick(fractions), k = fr[0], d = fr[1], L = periode(k, d), bloc = decimales(k, d, L), s = bloc.join('');
  const n = R.int(nMin, nMax), p = place(n, L), bonne = String(bloc[p.idx]);
  const autres = [bloc[(p.idx + 1) % L], bloc[(p.idx + L - 1) % L], bloc[0], bloc[L - 1], bloc[(p.idx + 2) % L]].map(String);
  const expl = 'On pose la division jusqu\'à retrouver un reste déjà vu : les chiffres après la virgule se répètent alors par blocs, et on divise le rang par la longueur du bloc. '
    + 'Ici, on trouve ' + k + '/' + d + ' = 0,' + s + ' ' + s + '… : le bloc ' + s + ' de ' + L + ' chiffres se répète sans fin. '
    + phrase(n, L, 'chiffre du bloc') + ' : c\'est ' + bonne + '.'
    + (p.r === 0 ? piege0('chiffre du bloc') : '');
  return mk('Quel est le ' + nb(n) + 'e chiffre après la virgule dans l\'écriture décimale de ' + k + '/' + d + ' ?', bonne, autres, vChiffre(bonne), expl);
}

/* Deux derniers chiffres de bⁿ. */
function gDeuxDerniers(R, bases, nMin, nMax){
  const b = R.pick(bases), n = R.int(nMin, nMax), cyc = cycle(b, 100), L = cyc.length, p = place(n, L), bonne = deux(cyc[p.idx]);
  const autres = [cyc[(p.idx + 1) % L], cyc[(p.idx + L - 1) % L], cyc[0], cyc[L - 1], cyc[(p.idx + 2) % L], cyc[(p.idx + L - 2) % L]].map(deux);
  let debut;
  if (L <= 10){
    const etapes = [];
    for (let i = 0; i < L - 1; i++){ const P = cyc[i] * b; etapes.push(deux(cyc[i]) + ' × ' + b + ' = ' + nb(P) + ', on garde ' + deux(P % 100)); }
    debut = 'Ici, on multiplie par ' + b + ' à chaque étape, jusqu\'à retomber sur 01 : à partir de là, tout recommence. '
      + etapes.join(' ; ') + '. Le cycle des deux derniers chiffres est ' + cyc.map(deux).join(', ') + ' (longueur ' + L + '). ';
  } else {
    debut = 'Ici, on cherche une puissance de ' + b + ' qui se termine par 01. '
      + '3⁵ = 243 se termine par 43, donc 3¹⁰ se termine comme 43² = 1 849, par 49, et 3²⁰ comme 49² = 2 401, par 01 : la période est 20. '
      + 'En multipliant par 3 à chaque fois, les deux derniers chiffres de 3¹ à 3²⁰ sont ' + cyc.map(deux).join(', ') + '. ';
  }
  const expl = 'On multiplie en ne gardant que les deux derniers chiffres à chaque étape, jusqu\'à ce que la fin du nombre se répète : on obtient un cycle, et on divise l\'exposant par sa longueur. '
    + debut + phrase(n, L, 'terme du cycle') + ' : les deux derniers chiffres de ' + pw(b, n) + ' sont ' + bonne + '.'
    + (p.r === 0 ? piege0('terme du cycle') : '');
  return mk('Quels sont les deux derniers chiffres de ' + pw(b, n) + ' ?', bonne, autres, k => deux((+bonne + 10 * k) % 100), expl);
}

/* =====================================================================
   Niveau 1 : découverte
   ===================================================================== */
function g1Produit(R){
  const trois = R.int(1, 3) === 1, U = [2, 3, 4, 6, 7, 8, 9], f = [];
  if (trois){ for (let i = 0; i < 3; i++) f.push(R.int(1, 9) * 10 + R.pick(U)); }
  else { const grand = R.int(1, 3) === 1; f.push((grand ? R.int(100, 999) : R.int(10, 99)) * 10 + R.pick(U)); f.push(R.int(10, 99) * 10 + R.pick(U)); }
  const u = f.map(x => x % 10), etapes = [];
  let p = u[0];
  for (let i = 1; i < u.length; i++){ const brut = p * u[i]; etapes.push(p + ' × ' + u[i] + ' = ' + brut + (brut >= 10 ? ', on garde ' + (brut % 10) : '')); p = brut % 10; }
  const bonne = String(p), brut12 = u[0] * u[1];
  const autres = [String(somme(u) % 10), String(Math.floor(brut12 / 10) % 10), String(u[u.length - 1]), trois ? String(brut12 % 10) : String(u[0])];
  const expl = 'Le chiffre des unités d\'un produit ne dépend que des chiffres des unités des facteurs : on les multiplie en ne gardant que l\'unité à chaque étape. '
    + 'Ici, les chiffres des unités sont ' + liste(u) + '. ' + etapes.join(' ; ') + '. Le chiffre des unités du produit est ' + bonne + '. '
    + 'Piège : il ne faut ni additionner les chiffres des unités, ni garder le chiffre des dizaines d\'un résultat intermédiaire.';
  return mk('Quel est le chiffre des unités du produit ' + f.map(x => nb(x)).join(' × ') + ' ?', bonne, autres, vChiffre(bonne), expl);
}
function g1Puissance(R){ return gPuissance(R, true); }
function g1Motif(R){ return gMotif(R, 20, 150); }
function g1Reste(R){
  let m, N, q, r;
  do { m = R.pick([6, 7, 8, 9, 12, 15, 24]); N = R.int(100, 999); q = Math.floor(N / m); r = N % m; } while (r < 2);
  const ctx = R.pick([
    ['On range ' + N + ' œufs dans des boîtes de ' + m + '. Une fois remplies toutes les boîtes possibles, combien d\'œufs reste-t-il ?', 'boîtes', 'œufs'],
    ['Un club de ' + N + ' coureurs forme des équipes de ' + m + '. Une fois formées toutes les équipes complètes possibles, combien de coureurs restent sans équipe ?', 'équipes', 'coureurs'],
    ['On distribue ' + N + ' cartes à ' + m + ' joueurs, une par une, en faisant des tours complets tant que c\'est possible. Combien de cartes reste-t-il à la fin ?', 'cartes par joueur', 'cartes'],
    ['Une imprimante assemble ' + N + ' feuilles en cahiers de ' + m + ' feuilles. Combien de feuilles restent une fois tous les cahiers complets terminés ?', 'cahiers', 'feuilles']
  ]);
  const bonne = String(r);
  const expl = 'On fait la division euclidienne : on cherche le plus grand multiple du diviseur qui ne dépasse pas le nombre total, et l\'écart entre les deux est le reste. '
    + m + ' × ' + q + ' = ' + (m * q) + ' et ' + N + ' − ' + (m * q) + ' = ' + r + ' : on obtient ' + q + ' ' + ctx[1] + ' et il reste ' + r + ' ' + ctx[2] + '. '
    + 'Piège : ' + q + ' est le quotient, pas le reste ; et un reste est toujours plus petit que ' + m + '.';
  return mk(ctx[0], bonne, [String(q), String(m - r), String(r + m)], vNombre(r), expl);
}

/* =====================================================================
   Niveau 2 : maîtrise
   ===================================================================== */
function g2Puissance(R){ return gPuissance(R, false); }
function g2SommePuiss(R){ return gSommePuissUnites(R, 10, 99); }
function detailPuiss(base, e){
  const cyc = cycle(base % 10, 10), L = cyc.length, p = place(e, L);
  return {u: cyc[p.idx], txt: 'pour ' + pw(base, e) + ', cycle ' + liste(cyc) + ' et ' + e + ' = ' + L + ' × ' + p.q + ' + ' + p.r + ', donc ' + cyc[p.idx]};
}
function g2DeuxPuiss(R){
  const base = () => { const u = R.pick([2, 3, 4, 7, 8, 9]); return R.int(1, 3) === 1 ? R.int(1, 9) * 10 + u : u; };
  const op = R.pick(['+', '×', '−']);
  let a = base(), b = base(), m, n;
  if (op === '−'){ if (a < b){ const t = a; a = b; b = t; } n = R.int(10, 60); m = R.int(n + 1, 99); }
  else { m = R.int(10, 99); n = R.int(10, 99); }
  const dA = detailPuiss(a, m), dB = detailPuiss(b, n), ua = dA.u, ub = dB.u;
  const dA1 = detailPuiss(a, m + 1).u, va = a % 10, vb = b % 10;
  let bonne, autres, comb, piege;
  if (op === '+'){
    bonne = String((ua + ub) % 10);
    autres = [String((ua * ub) % 10), String((dA1 + ub) % 10), String((va + vb) % 10)];
    comb = ua + ' + ' + ub + ' = ' + (ua + ub) + '.';
    piege = ' Piège : on additionne les deux chiffres des unités, on ne les multiplie pas.';
  } else if (op === '×'){
    bonne = String((ua * ub) % 10);
    autres = [String((ua + ub) % 10), String((dA1 * ub) % 10), String((va * vb) % 10)];
    comb = ua + ' × ' + ub + ' = ' + (ua * ub) + '.';
    piege = ' Piège : on multiplie les deux chiffres des unités, on ne les additionne pas.';
  } else {
    bonne = String((ua - ub + 10) % 10);
    autres = [String((ub - ua + 10) % 10), String((ua + ub) % 10), String((va - vb + 10) % 10), String((dA1 - ub + 10) % 10)];
    comb = ua >= ub ? ua + ' − ' + ub + ' = ' + (ua - ub) + '.' : ua + ' est plus petit que ' + ub + ' : on emprunte une dizaine, 1' + ua + ' − ' + ub + ' = ' + (10 + ua - ub) + '.';
    piege = ' Piège : ne pas faire la soustraction à l\'envers (' + ub + ' − ' + ua + ').';
  }
  const q = 'Quel est le chiffre des unités de ' + pw(a, m) + ' ' + op + ' ' + pw(b, n) + ' ?';
  const expl = 'On cherche séparément le chiffre des unités de chaque puissance grâce à son cycle, puis on combine ces deux chiffres. '
    + 'D\'abord ' + dA.txt + ' ; ensuite ' + dB.txt + '. On combine : ' + comb + ' Le chiffre des unités est ' + bonne + '.' + (op === '−' && ua >= ub ? '' : piege);
  return mk(q, bonne, autres, vChiffre(bonne), expl);
}
function g2ResteAffine(R){
  const m = R.pick([5, 6, 7, 8, 9, 11, 12]), f = R.int(1, 3);
  let a, b, r, autres;
  if (f === 1){ a = 1; r = R.int(1, m - 1); b = R.int(m + 1, 4 * m); }
  else if (f === 2){ a = R.int(2, 5); r = R.int(Math.ceil(m / a), m - 1); b = 0; }
  else { a = R.int(2, 5); r = R.int(1, m - 1); b = R.int(m, 2 * m); }
  const v = a * r + b, c = v % m, k = Math.floor(v / m), bonne = String(c);
  if (f === 1) autres = [b % m, r, (m - c) % m];
  else if (f === 2) autres = [r, (a + r) % m, (m - c) % m];
  else autres = [(a * r) % m, (r + b) % m, (a * (r + b)) % m, (a + r + b) % m];
  const expr = (a === 1 ? 'N' : a + 'N') + (b ? ' + ' + b : '');
  const interne = (a === 1 ? 'q' : a + 'q') + (k ? ' + ' + k : '');
  const expl = 'On remplace N par son reste, car seul le reste compte dans les sommes et les produits, puis on réduit le résultat obtenu. '
    + 'On écrit N = ' + m + 'q + ' + r + ' avec q entier. Alors ' + expr + ' = ' + (a * m) + 'q + ' + v + ' = ' + m + ' × ' + (k ? '(' + interne + ')' : interne) + ' + ' + c + '. '
    + 'Le reste est donc ' + c + '. Autrement dit, ' + expr + ' a le même reste que ' + (a === 1 ? r : a + ' × ' + r) + (b ? ' + ' + b : '') + ' = ' + v + ', et ' + v + ' = ' + m + ' × ' + k + ' + ' + c + '. '
    + 'Piège : ' + v + ' n\'est pas un reste possible, car un reste est toujours plus petit que ' + m + '.';
  return mk('Un entier N, divisé par ' + m + ', donne un reste de ' + r + '. Quel est le reste de la division de ' + expr + ' par ' + m + ' ?', bonne, autres.map(String), vReste(bonne, m), expl);
}
function g2Collier(R){
  const cs = R.shuffle(PERLES).slice(0, 4), k = cs.map(() => R.int(1, 3)), motif = [];
  cs.forEach((c, i) => { for (let j = 0; j < k[i]; j++) motif.push(c[0]); });
  const L = motif.length, n = R.int(300, 3000), p = place(n, L), bonne = motif[p.idx];
  const desc = cs.map((c, i) => k[i] + ' ' + (k[i] > 1 ? 'perles ' + c[1] : 'perle ' + c[0])).join(', ');
  let pos = 1;
  const segs = cs.map((c, i) => {
    const s = k[i] === 1 ? 'perle ' + pos + ' : ' + c[0] : 'perles ' + pos + (k[i] === 2 ? ' et ' : ' à ') + (pos + k[i] - 1) + ' : ' + c[1];
    pos += k[i];
    return s;
  });
  const expl = M_MOTIF + ' Ici, le motif compte ' + L + ' perles. '
    + phrase(n, L, 'élément du motif') + '. Dans le motif, ' + segs.join(' ; ') + '. La ' + nb(n) + 'e perle est donc ' + bonne + '.'
    + (p.r === 0 ? piege0('élément du motif') : '');
  return mk('Un collier répète toujours le même motif de perles, dans cet ordre : ' + desc + '. De quelle couleur est la ' + nb(n) + 'e perle ?',
    bonne, cs.map(c => c[0]), () => null, expl);
}
function g2Motif(R){ return R.int(0, 1) ? g2Collier(R) : gMotif(R, 300, 3000); }

/* =====================================================================
   Niveau 3 : niveau des exemples officiels
   ===================================================================== */
function g3SommeCarres(R){
  const cube = R.int(1, 3) === 1, T = cube ? UK : UC, Tautre = cube ? UC : UK, e = cube ? 3 : 2;
  let N; do { N = R.int(101, 2999); } while (N === 1004);
  const q = Math.floor(N / 10), r = N % 10, reste = [], resteAutre = [];
  for (let d = 1; d <= r; d++){ reste.push(T[d]); resteAutre.push(Tautre[d]); }
  const P = somme(reste), bloc = (q * 45) % 10, bonne = String((bloc + P) % 10);
  const autres = ['5', String(bloc), String(T[r]), String(P % 10), String((bloc + somme(resteAutre)) % 10)];
  const seq = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => T[d % 10]);
  let fin;
  if (r === 0) fin = 'Il ne reste aucun terme. ';
  else if (r === 1) fin = 'Il reste ' + pw(nb(N), e) + ', d\'unité ' + reste[0] + '. ';
  else fin = 'Il reste les ' + r + ' derniers termes, de ' + pw(nb(N - r + 1), e) + ' à ' + pw(nb(N), e) + ', d\'unités ' + liste(reste) + ', de somme ' + P + '. ';
  const expl = 'On regroupe les nombres par blocs de dix entiers consécutifs, dont les ' + (cube ? 'cubes' : 'carrés') + ' ont toujours la même somme de chiffres des unités, puis on ajoute les derniers termes. '
    + 'Dans chaque bloc, les chiffres des unités des ' + (cube ? 'cubes' : 'carrés') + ' sont ' + liste(seq) + ', de somme 45. '
    + nb(N) + ' = 10 × ' + q + ' + ' + r + ' : il y a ' + q + ' blocs complets, qui apportent ' + q + ' × 45 = ' + nb(q * 45) + ', donc un chiffre des unités égal à ' + bloc + '. '
    + fin + 'On additionne les unités : ' + bloc + ' + ' + P + ' = ' + (bloc + P) + ', le chiffre des unités est ' + bonne + '. '
    + 'Piège : ne garder que le chiffre des unités à chaque étape, sans oublier ni le nombre de blocs ni les termes restants.';
  return mk('Quel est le chiffre des unités de la somme ' + pw(1, e) + ' + ' + pw(2, e) + ' + ' + pw(3, e) + ' + … + ' + pw(nb(N), e) + ' ?', bonne, autres, vChiffre(bonne), expl);
}
function g3Reste(R){ return gRestePuissance(R, P3, 50, 3000, false); }
function g3Decimale(R){ return gDecimale(R, FR3, 20, 3000); }
function g3ResteCarre(R){
  const f = R.int(1, 3), m = R.pick([5, 6, 7, 8, 9, 11, 12, 13]);
  let q, v, c, autres, expl, rr;
  if (f === 1){
    do { rr = R.int(2, m - 1); } while (rr * rr < m);
    v = rr * rr; c = v % m;
    q = 'Un entier N, divisé par ' + m + ', donne un reste de ' + rr + '. Quel est le reste de la division de N² par ' + m + ' ?';
    autres = [(2 * rr) % m, rr, (m - c) % m, (c + 1) % m];
    expl = 'On remplace N par son reste, on élève ce reste au carré, puis on réduit le résultat dans la division. '
      + 'N² a le même reste dans la division par ' + m + ' que ' + rr + '² = ' + v + '. '
      + 'En effet, N = ' + m + 'q + ' + rr + ' donne N² = ' + (m * m) + 'q² + ' + (2 * m * rr) + 'q + ' + v + ', et seul ' + v + ' ne contient pas forcément le facteur ' + m + '. '
      + v + ' = ' + m + ' × ' + Math.floor(v / m) + ' + ' + c + ' : le reste est ' + c + '. '
      + 'Piège : ' + v + ' n\'est pas un reste possible (il faut un nombre plus petit que ' + m + '), et N² n\'est pas 2N.';
  } else if (f === 2){
    let r1, r2;
    do { r1 = R.int(2, m - 1); r2 = R.int(2, m - 1); } while (r1 * r2 < m || r1 === r2);
    v = r1 * r2; c = v % m;
    q = 'Deux entiers N et M, divisés par ' + m + ', donnent respectivement des restes de ' + r1 + ' et ' + r2 + '. Quel est le reste de la division de N × M par ' + m + ' ?';
    autres = [(r1 + r2) % m, (m - c) % m, r1, r2];
    expl = 'On remplace chaque nombre par son reste, on multiplie ces deux restes, puis on réduit le résultat dans la division. '
      + 'N × M a le même reste dans la division par ' + m + ' que ' + r1 + ' × ' + r2 + ' = ' + v + '. '
      + 'En effet, (' + m + 'q + ' + r1 + ') × (' + m + 'p + ' + r2 + ') se développe en termes qui contiennent tous le facteur ' + m + ', sauf ' + r1 + ' × ' + r2 + '. '
      + v + ' = ' + m + ' × ' + Math.floor(v / m) + ' + ' + c + ' : le reste est ' + c + '. '
      + 'Piège : on multiplie les restes, on ne les additionne pas, puis on réduit le résultat.';
  } else {
    do { rr = R.int(2, m - 1); } while (rr * rr * rr < m);
    v = rr * rr * rr; c = v % m;
    q = 'Un entier N, divisé par ' + m + ', donne un reste de ' + rr + '. Quel est le reste de la division de N³ par ' + m + ' ?';
    autres = [(3 * rr) % m, (rr * rr) % m, rr, (m - c) % m];
    expl = 'On remplace N par son reste, on élève ce reste au cube en réduisant au fur et à mesure, puis on lit le reste final. '
      + 'N³ a le même reste dans la division par ' + m + ' que ' + rr + '³ = ' + v + '. '
      + 'On peut réduire au fur et à mesure : ' + rr + '² = ' + (rr * rr) + ', de reste ' + ((rr * rr) % m) + ', puis ' + ((rr * rr) % m) + ' × ' + rr + ' = ' + (((rr * rr) % m) * rr) + ', de reste ' + c + '. '
      + 'Le reste est ' + c + '. Piège : N³ n\'est pas 3N, et il faut aller jusqu\'au cube, pas s\'arrêter au carré.';
  }
  const bonne = String(c);
  return mk(q, bonne, autres.map(String), vReste(bonne, m), expl);
}
function g3MotifCompte(R){
  const t = R.int(1, 2), N = R.int(50, 400);
  let motif, cible, q, unite, quoi;
  if (t === 1){
    const cs = R.shuffle(COUL3).slice(0, 3), L = R.int(4, 7);
    let idx;
    do { idx = []; for (let i = 0; i < L; i++) idx.push(R.int(0, 2)); } while (idx.indexOf(0) < 0 || idx.indexOf(1) < 0 || idx.indexOf(2) < 0);
    const ci = R.int(0, 2);
    motif = idx.map(i => cs[i][0]); cible = cs[ci][0];
    q = 'Une guirlande lumineuse répète toujours le même motif d\'ampoules : ' + motif.join(', ') + ', puis le motif recommence. Combien d\'ampoules ' + cs[ci][1] + ' y a-t-il parmi les ' + N + ' premières ?';
    unite = 'ampoules';
    quoi = c => c + ' ampoule' + (c > 1 ? 's ' + cs[ci][1] : ' ' + cible);
  } else {
    const mot = R.pick(MOTS_REP);
    motif = mot.split(''); cible = R.pick(motif);
    q = R.pick(PRENOMS) + ' écrit le mot ' + mot + ' encore et encore, sans espace : ' + mot + mot + '… Combien de lettres ' + cible + ' y a-t-il parmi les ' + N + ' premières lettres écrites ?';
    unite = 'lettres';
    quoi = c => c + ' lettre' + (c > 1 ? 's ' : ' ') + cible;
  }
  const L = motif.length, c = compte(motif, cible), qq = Math.floor(N / L), r = N % L, debut = motif.slice(0, r), pc = compte(debut, cible);
  const bonne = qq * c + pc;
  const autres = [qq * c, (qq + 1) * c, bonne + 1, bonne - 1, Math.round(N * c / L)].filter(x => x >= 0).map(x => nb(x));
  let fin;
  if (r === 0) fin = ', et il ne reste rien après';
  else if (r === 1) fin = ', puis le 1er élément du motif (' + debut[0] + ') en ajoute ' + pc;
  else fin = ', puis les ' + r + ' premiers éléments du motif (' + debut.join(', ') + ') en ajoutent ' + pc;
  const expl = 'On compte les motifs complets, on multiplie par le nombre d\'apparitions dans un motif, puis on ajoute le morceau de motif qui reste. '
    + 'Ici, chaque motif de ' + L + ' ' + unite + ' contient ' + quoi(c) + '. '
    + N + ' = ' + L + ' × ' + qq + ' + ' + r + ' : ' + qq + ' motifs complets donnent ' + qq + ' × ' + c + ' = ' + (qq * c) + fin + '. Total : ' + bonne + '. '
    + 'Piège : ne pas oublier le morceau de motif qui suit les blocs complets.';
  return mk(q, nb(bonne), autres, vNombre(bonne), expl);
}

/* =====================================================================
   Niveau 4 : plus dur que les exemples officiels
   ===================================================================== */
function g4Reste(R){ return gRestePuissance(R, P4, 100, 3000, true); }
function g4DeuxDerniers(R){ return gDeuxDerniers(R, [7, 43, 57, 93, 11, 21, 31], 50, 3000); }
function g4SommePuiss(R){
  if (R.int(1, 3) === 1) return gSommePuissUnites(R, 300, 3000);
  const pr = R.pick(P4S), a = pr[0], m = pr[1], N = R.int(300, 3000);
  const cyc = cycle(a, m), L = cyc.length, S = somme(cyc), q = Math.floor(N / L), r = N % L;
  const reste = cyc.slice(0, r), P = somme(reste), bonne = String(P % m);
  const autres = ['0', String(cyc[(N - 1) % L]), String(somme(cyc.slice(0, r + 1)) % m), String(somme(cyc.slice(0, Math.max(0, r - 1))) % m)];
  let fin;
  if (r === 0) fin = ' : il ne reste aucun terme, le reste est 0.';
  else {
    fin = ' : il reste ' + (r === 1 ? 'le terme ' + pw(a, N) + ', de reste ' + reste[0] : 'les ' + r + ' derniers termes, dont les restes sont ' + liste(reste) + ', de somme ' + P)
      + (P >= m ? ' = ' + m + ' × ' + Math.floor(P / m) + ' + ' + (P % m) : '') + '. Le reste est ' + bonne + '. Piège : ne pas oublier les termes qui restent après les blocs complets.';
  }
  const expl = 'On regroupe les termes par blocs aussi longs que le cycle des restes : la somme d\'un bloc complet est un multiple du diviseur, et il ne reste qu\'à traiter les derniers termes. '
    + 'Ici, les restes des puissances de ' + a + ' dans la division par ' + m + ' suivent le cycle ' + liste(cyc) + ', de longueur ' + L + ' : un bloc complet donne ' + cyc.join(' + ') + ' = ' + S + ' = ' + m + ' × ' + (S / m) + ', donc un reste 0 : les blocs complets ne comptent pas. '
    + nb(N) + ' = ' + L + ' × ' + nb(q) + ' + ' + r + fin;
  return mk('Quel est le reste de la division par ' + m + ' de la somme ' + sommePuiss(a, N) + ' ?', bonne, autres, vReste(bonne, m), expl);
}
function g4SommeCarres(R){
  const f = R.int(1, 4);
  let q, K, qq, r, restes = [], P, bloc, bonne, autres, expl, fin;
  if (f === 1){
    do { K = R.int(101, 2999); } while (K % 2 === 0);
    qq = Math.floor(K / 10); r = K % 10;
    for (let d = 1; d <= r; d += 2) restes.push(UC[d]);
    P = somme(restes); bloc = (qq * 25) % 10; bonne = String((bloc + P) % 10);
    q = 'Quel est le chiffre des unités de la somme 1² + 3² + 5² + … + ' + pw(nb(K), 2) + ' ?';
    autres = ['5', String(bloc), String(P % 10), String(UC[r]), String((qq * 45 + P) % 10)];
    expl = 'On regroupe les impairs par dizaines, car dans chaque dizaine leurs carrés ont toujours la même somme de chiffres des unités, puis on ajoute les derniers termes. '
      + 'Dans chaque dizaine (de 1 à 9, de 11 à 19, et ainsi de suite), les carrés des cinq impairs se terminent par 1, 9, 5, 9, 1, de somme 25. '
      + nb(K) + ' = 10 × ' + qq + ' + ' + r + ' : ' + qq + ' dizaines complètes apportent ' + qq + ' × 25 = ' + nb(qq * 25) + ', chiffre des unités ' + bloc + '. '
      + 'Il reste les impairs de ' + nb(10 * qq + 1) + ' à ' + nb(K) + ', dont les carrés se terminent par ' + liste(restes) + ', de somme ' + P + '. '
      + 'Total des unités : ' + bloc + ' + ' + P + ' = ' + (bloc + P) + ', le chiffre des unités est ' + bonne + '. Piège : une dizaine ne contient ici que 5 termes, pas 10.';
  } else if (f === 2){
    do { K = R.int(100, 3000); } while (K % 2 === 1);
    qq = Math.floor(K / 10); r = K % 10;
    for (let d = 2; d <= r; d += 2) restes.push(UC[d]);
    P = somme(restes); bonne = String(P % 10);
    q = 'Quel est le chiffre des unités de la somme 2² + 4² + 6² + … + ' + pw(nb(K), 2) + ' ?';
    autres = ['0', '5', String(UC[r]), String((P + 5) % 10), String((qq * 45 + P) % 10)];
    fin = r === 0 ? 'Il ne reste aucun terme. ' : 'Il reste les pairs de ' + nb(10 * qq + 2) + ' à ' + nb(K) + ', dont les carrés se terminent par ' + liste(restes) + ', de somme ' + P + '. ';
    expl = 'On regroupe les pairs par dizaines, car dans chaque dizaine leurs carrés ont toujours la même somme de chiffres des unités, puis on ajoute les derniers termes. '
      + 'Dans chaque dizaine (de 2 à 10, de 12 à 20, et ainsi de suite), les carrés des cinq pairs se terminent par 4, 6, 6, 4, 0, de somme 20 : chaque dizaine complète apporte un chiffre des unités 0. '
      + nb(K) + ' = 10 × ' + qq + ' + ' + r + ' : ' + qq + ' dizaines complètes, qui ne comptent pas. ' + fin
      + 'Le chiffre des unités est ' + bonne + '. Piège : ne pas oublier les termes qui restent après la dernière dizaine complète.';
  } else if (f === 3){
    do { K = R.int(101, 2999); } while (K === 1004);
    qq = Math.floor(K / 10); r = K % 10;
    for (let d = 1; d <= r; d++) restes.push(U4[d]);
    P = somme(restes); bloc = (qq * 33) % 10; bonne = String((bloc + P) % 10);
    q = 'Quel est le chiffre des unités de la somme 1⁴ + 2⁴ + 3⁴ + … + ' + pw(nb(K), 4) + ' ?';
    autres = ['3', String(bloc), String(P % 10), String(U4[r]), String((qq * 45 + P) % 10)];
    fin = r === 0 ? 'Il ne reste aucun terme. ' : (r === 1 ? 'Il reste ' + pw(nb(K), 4) + ', d\'unité 1. ' : 'Il reste les ' + r + ' derniers termes, d\'unités ' + liste(restes) + ', de somme ' + P + '. ');
    expl = 'On regroupe les nombres par blocs de dix entiers consécutifs, dont les puissances quatrièmes ont toujours la même somme de chiffres des unités, puis on ajoute les derniers termes. '
      + 'Dans chaque bloc, les puissances quatrièmes se terminent par 1, 6, 1, 6, 5, 6, 1, 6, 1, 0, de somme 33. '
      + nb(K) + ' = 10 × ' + qq + ' + ' + r + ' : ' + qq + ' blocs complets apportent ' + qq + ' × 33 = ' + nb(qq * 33) + ', chiffre des unités ' + bloc + '. ' + fin
      + 'Total des unités : ' + bloc + ' + ' + P + ' = ' + (bloc + P) + ', le chiffre des unités est ' + bonne + '. Piège : le bloc vaut ici 33, pas 45 comme pour les carrés.';
  } else {
    let Ad; do { Ad = R.int(11, 99); } while (Ad % 10 === 1);
    const B = R.int(Ad + 200, 2999), n = B - Ad + 1;
    qq = Math.floor(n / 10); r = n % 10;
    for (let x = B - r + 1; x <= B; x++) restes.push(UC[x % 10]);
    P = somme(restes); bloc = (qq * 45) % 10; bonne = String((bloc + P) % 10);
    q = 'Quel est le chiffre des unités de la somme ' + pw(Ad, 2) + ' + ' + pw(Ad + 1, 2) + ' + ' + pw(Ad + 2, 2) + ' + … + ' + pw(nb(B), 2) + ' ?';
    const P1 = []; for (let x = 10 * Math.floor(B / 10) + 1; x <= B; x++) P1.push(UC[x % 10]);
    autres = ['5', String(bloc), String(UC[B % 10]), String((Math.floor(B / 10) * 45 + somme(P1)) % 10), String(P % 10)];
    fin = r === 0 ? 'Il ne reste aucun terme. ' : 'Les ' + r + ' derniers termes, de ' + pw(nb(B - r + 1), 2) + ' à ' + pw(nb(B), 2) + ', se terminent par ' + liste(restes) + ', de somme ' + P + '. ';
    expl = 'On compte les termes, on les regroupe par blocs de dix entiers consécutifs, dont les carrés ont toujours la même somme de chiffres des unités, puis on ajoute les derniers termes. '
      + 'Dix entiers consécutifs ont toujours pour chiffres des unités 0, 1, 2, …, 9 dans un certain ordre : les unités de leurs carrés ont donc toujours pour somme 45. '
      + 'La somme compte ' + nb(B) + ' − ' + Ad + ' + 1 = ' + nb(n) + ' termes, soit ' + qq + ' blocs de 10 et ' + r + ' termes de plus. '
      + 'Les blocs apportent ' + qq + ' × 45 = ' + nb(qq * 45) + ', chiffre des unités ' + bloc + '. ' + fin
      + 'Total des unités : ' + bloc + ' + ' + P + ' = ' + (bloc + P) + ', le chiffre des unités est ' + bonne + '. Piège : la somme ne commence pas à 1² ; il faut compter les termes avec le « + 1 ».';
  }
  return mk(q, bonne, autres, vChiffre(bonne), expl);
}
function g4SommeDecimales(R){
  const fr = R.pick(FR_SOM), k = fr[0], d = fr[1], L = periode(k, d), bloc = decimales(k, d, L), s = bloc.join(''), S = somme(bloc);
  const N = R.int(20, 300), q = Math.floor(N / L), r = N % L, P = somme(bloc.slice(0, r)), bonne = q * S + P;
  const autres = [q * S, (q + 1) * S, q * S + somme(bloc.slice(0, r + 1)), q * S + somme(bloc.slice(0, Math.max(0, r - 1))), Math.round(N * S / L)].map(x => nb(x));
  let fin;
  if (r === 0) fin = ', et il ne reste aucun chiffre';
  else if (r === 1) fin = ', puis le 1er chiffre du bloc (' + bloc[0] + ') ajoute ' + P;
  else fin = ', puis les ' + r + ' premiers chiffres du bloc (' + liste(bloc.slice(0, r)) + ') ajoutent ' + P;
  const expl = 'On écrit le bloc de chiffres qui se répète, on additionne bloc par bloc, puis on ajoute les chiffres qui restent après le dernier bloc complet. '
    + 'En posant la division, ' + k + '/' + d + ' = 0,' + s + ' ' + s + '… : le bloc ' + s + ' compte ' + L + ' chiffres, de somme ' + bloc.join(' + ') + ' = ' + S + '. '
    + N + ' = ' + L + ' × ' + q + ' + ' + r + ' : ' + q + ' blocs complets donnent ' + q + ' × ' + S + ' = ' + nb(q * S) + fin + '. Total : ' + nb(bonne) + '. '
    + 'Piège : ne pas oublier les chiffres qui suivent le dernier bloc complet.';
  return mk('Quelle est la somme des ' + N + ' premiers chiffres après la virgule dans l\'écriture décimale de ' + k + '/' + d + ' ?', nb(bonne), autres, vNombre(bonne), expl);
}
function g4Decimale(R){ return gDecimale(R, FR4, 100, 3000); }
function g4Compte(R){
  const b = R.pick([2, 3, 7, 8, 4, 9]), cyc = cycle(b, 10), L = cyc.length, j = R.int(0, L - 1), d = cyc[j], N = R.int(100, 3000);
  const e0 = j + 1, last = N - (N - e0) % L, bonne = (last - e0) / L + 1;
  const autres = [Math.floor(N / L), Math.ceil(N / L), bonne + 1, bonne - 1, (last - e0) / L].map(x => nb(x));
  const expl = 'On repère grâce au cycle des chiffres des unités les exposants qui donnent ce chiffre : ils reviennent à intervalles réguliers, et il suffit de les compter. '
    + 'Ici, les chiffres des unités des puissances de ' + b + ' suivent le cycle ' + liste(cyc) + ' : le chiffre ' + d + ' revient tous les ' + L + ' exposants. '
    + 'Il apparaît pour les exposants ' + e0 + ', ' + (e0 + L) + ', ' + (e0 + 2 * L) + ', …, ' + nb(last) + ' (le plus grand qui ne dépasse pas ' + nb(N) + '). '
    + 'On compte ces exposants : (' + nb(last) + ' − ' + e0 + ') ÷ ' + L + ' + 1 = ' + nb(bonne) + '. '
    + 'Piège : le « + 1 », car on compte à la fois le premier et le dernier exposant.';
  return mk('Parmi les nombres ' + pw(b, 1) + ', ' + pw(b, 2) + ', ' + pw(b, 3) + ', …, ' + pw(b, N) + ', combien ont ' + d + ' pour chiffre des unités ?', nb(bonne), autres, vNombre(bonne), expl);
}

/* =====================================================================
   Niveau 5 : haut du test adaptatif
   ===================================================================== */
function g5Tour(R){
  const u = R.pick([2, 3, 7, 8]), b = R.int(1, 3) === 1 ? R.int(1, 9) * 10 + u : u, e = R.int(3, 15);
  let c; do { c = R.int(2, 30); } while (c === 10 || c === 20 || c === 30);
  const c4 = c % 4;
  let rN, pourquoi;
  if (c4 === 0){ rN = 0; pourquoi = c + ' est un multiple de 4, donc N = ' + pw(c, e) + ' aussi : son reste dans la division par 4 est 0.'; }
  else if (c4 === 1){ rN = 1; pourquoi = c + ' = 4 × ' + ((c - 1) / 4) + ' + 1 : toutes ses puissances ont un reste 1 dans la division par 4, donc N aussi.'; }
  else if (c4 === 2){ rN = 0; pourquoi = c + ' est pair, donc ' + pw(c, 2) + ' = ' + (c * c) + ' est un multiple de 4, et N = ' + pw(c, e) + ' aussi (l\'exposant ' + e + ' est au moins 2) : reste 0.'; }
  else { rN = e % 2 ? 3 : 1; pourquoi = c + ' = 4 × ' + ((c - 3) / 4) + ' + 3 : les restes de ses puissances par 4 alternent 3, 1, 3, 1… (car ' + pw(c, 2) + ' = ' + (c * c) + ' = 4 × ' + ((c * c - 1) / 4) + ' + 1). L\'exposant ' + e + ' est ' + (e % 2 ? 'impair' : 'pair') + ', donc N a pour reste ' + rN + '.'; }
  const cyc = cycle(u, 10), bonne = String(cyc[rN === 0 ? 3 : rN - 1]);
  const expl = 'Le chiffre des unités d\'une puissance ne dépend que de la place de l\'exposant dans le cycle : il suffit de connaître le reste de N dans la division par la longueur du cycle, sans calculer N. '
    + 'Ici, le chiffre des unités des puissances de ' + b + (b !== u ? ' (comme celles de ' + u + ')' : '') + ' suit le cycle ' + liste(cyc) + ', de longueur 4 : on cherche le reste de N dans la division par 4. '
    + pourquoi + ' ' + (rN === 0 ? 'Un reste de 0 renvoie au dernier terme du cycle' : 'Le reste ' + rN + ' désigne le ' + ord(rN) + ' terme du cycle') + ' : le chiffre des unités est ' + bonne + '. '
    + 'Piège : on n\'utilise ' + (c === e ? 'pas ' + c : 'ni ' + c + ' ni ' + e) + ' comme exposant, ni le dernier chiffre de N, seulement le reste de N par 4.';
  return mk('On pose N = ' + pw(c, e) + ', sans le calculer. Quel est le chiffre des unités de ' + b + ' élevé à la puissance N ?', bonne, cyc.map(String), vChiffre(bonne), expl);
}
function g5PlusMoinsUn(R){
  const t = R.pick(PM), a = t[0], m = t[1], k = t[2], s = t[3], n = R.int(100, 3000);
  const P = Math.pow(a, k), mult = (P - s) / m, q = Math.floor(n / k), r = n % k;
  const ar = Math.pow(a, r), u = ar % m, signe = s === 1 ? 1 : (q % 2 ? -1 : 1), c = signe === 1 ? u : (m - u) % m, bonne = String(c);
  const autres = [(m - c) % m, cycle(a, m)[n % cycle(a, m).length], cycle(a, m)[(n + cycle(a, m).length - 2) % cycle(a, m).length], 1, m - 1, 0].map(String);
  let expl = 'On cherche une petite puissance juste à côté d\'un multiple du diviseur (un de plus ou un de moins), puis on découpe l\'exposant en paquets de cette taille. '
    + 'Ici, ' + pw(a, k) + ' = ' + nb(P) + ' = ' + (mult === 1 ? m : m + ' × ' + mult) + (s > 0 ? ' + 1.' : ' − 1.')
    + ' Dans les restes par ' + m + ', ' + pw(a, k) + ' se comporte donc comme ' + (s > 0 ? '1' : '−1') + '. '
    + nb(n) + ' = ' + k + ' × ' + nb(q) + ' + ' + r + ', donc ' + pw(a, n) + ' = (' + pw(a, k) + ')' + sup(q) + (r ? ' × ' + pw(a, r) : '') + '. ';
  if (s > 0) expl += '(' + pw(a, k) + ')' + sup(q) + ' se comporte comme 1. ';
  else expl += 'Comme ' + nb(q) + ' est ' + (q % 2 ? 'impair' : 'pair') + ', (' + pw(a, k) + ')' + sup(q) + ' se comporte comme ' + (q % 2 ? '−1' : '1') + '. ';
  if (r === 0) expl += signe === 1 ? 'Le reste est donc 1.' : 'Le reste est donc celui de −1, c\'est-à-dire ' + m + ' − 1 = ' + (m - 1) + '.';
  else if (signe === 1) expl += 'Il reste ' + pw(a, r) + ' = ' + ar + (ar >= m ? ', dont le reste par ' + m + ' est ' + u : '') + ' : le reste est ' + c + '.';
  else expl += 'On obtient −' + pw(a, r) + (ar >= m ? ', qui a le même reste que −' + u : ' = −' + u) + ' : le reste est ' + m + ' − ' + u + ' = ' + c + '.';
  expl += s < 0 ? ' Piège : (−1) à une puissance impaire vaut −1, et un « reste » négatif −x se corrige en ' + m + ' − x.' : ' Piège : un reste est toujours compris entre 0 et ' + (m - 1) + '.';
  return mk('Quel est le reste de la division euclidienne de ' + pw(a, n) + ' par ' + m + ' ?', bonne, autres, vReste(bonne, m), expl);
}
function g5DeuxDerniers(R){ return gDeuxDerniers(R, [9, 19, 29, 3], 100, 3000); }
function g5Produit(R){
  const b = R.pick([2, 3, 7, 8]), N = R.int(10, 200), E = N * (N + 1) / 2, cyc = cycle(b, 10), p = place(E, 4), bonne = String(cyc[p.idx]);
  const expl = 'On additionne les exposants pour se ramener à une seule puissance, puis on utilise le cycle des chiffres des unités. '
    + 'Ce produit est égal à ' + b + ' élevé à la puissance 1 + 2 + 3 + … + ' + N + '. '
    + 'Cette somme des termes d\'une suite arithmétique vaut ' + N + ' × ' + (N + 1) + ' ÷ 2 = ' + nb(E) + '. '
    + 'Les unités des puissances de ' + b + ' suivent le cycle ' + liste(cyc) + ', et ' + phrase(E, 4, 'terme du cycle') + ' : le chiffre des unités est ' + bonne + '. '
    + 'Piège : prendre ' + N + ' comme exposant au lieu de la somme des exposants.';
  return mk('Quel est le chiffre des unités du produit ' + pw(b, 1) + ' × ' + pw(b, 2) + ' × ' + pw(b, 3) + ' × … × ' + pw(b, N) + ' ?', bonne, cyc.map(String), vChiffre(bonne), expl);
}
function g5Div5(R){
  let pr, S;
  do {
    pr = R.pick(PAIRES5); S = [];
    for (let s = 1; s <= 4; s++) if ((terme(cycle(pr[0], 10), s) + terme(cycle(pr[1], 10), s)) % 5 === 0) S.push(s);
  } while (!S.length);
  const a = pr[0], b = pr[1], N = R.int(50, 3000);
  const nbRes = s => N >= s ? Math.floor((N - s) / 4) + 1 : 0;
  const bonne = somme(S.map(nbRes));
  const table = [1, 2, 3, 4].map(s => { const x = terme(cycle(a, 10), s), y = terme(cycle(b, 10), s); return 'n = ' + s + ' : ' + x + ' + ' + y + ' = ' + (x + y); }).join(' ; ');
  let cond, comptage;
  const im = S.length === 2 && S[0] === 1 && S[1] === 3, pa = S.length === 2 && S[0] === 2 && S[1] === 4;
  if (im){ cond = 'n est impair'; comptage = 'Entre 1 et ' + nb(N) + ', il y a ' + nb(bonne) + ' entiers impairs.'; }
  else if (pa){ cond = 'n est pair'; comptage = 'Entre 1 et ' + nb(N) + ', il y a ' + nb(bonne) + ' entiers pairs.'; }
  else {
    cond = 'le reste de n dans la division par 4 vaut ' + S.map(s => s % 4).join(' ou ');
    comptage = S.map(s => { const last = N - (N - s) % 4; return 'les entiers ' + s + ', ' + (s + 4) + ', …, ' + nb(last) + ' sont au nombre de (' + nb(last) + ' − ' + s + ') ÷ 4 + 1 = ' + nb(nbRes(s)); }).join(' ; ') + '. Total : ' + nb(bonne) + '.';
    comptage = comptage.charAt(0).toUpperCase() + comptage.slice(1);
  }
  const autres = [Math.floor(N / 2), Math.ceil(N / 2), Math.floor(N / 4), Math.ceil(N / 4), bonne + 1, bonne - 1, Math.floor(N / 5)].map(x => nb(x));
  const expl = 'On regarde le chiffre des unités de la somme selon le reste de n dans la division par quatre, car les cycles des unités des puissances ont tous une longueur qui divise quatre. '
    + 'Pour ' + a + 'ⁿ + ' + b + 'ⁿ et n de 1 à 4 : ' + table + ', puis tout recommence. Le nombre est divisible par 5 (chiffre des unités 0 ou 5) exactement quand ' + cond + '. '
    + comptage + ' Piège : bien compter les deux bornes, et ne pas supposer qu\'un entier sur deux convient sans l\'avoir vérifié.';
  return mk('Pour combien d\'entiers n compris entre 1 et ' + nb(N) + ' (bornes incluses) le nombre ' + a + 'ⁿ + ' + b + 'ⁿ est-il divisible par 5 ?', nb(bonne), autres, vNombre(bonne), expl);
}

const GEN = {
  1: [g1Produit, g1Puissance, g1Motif, g1Reste],
  2: [g2Puissance, g2SommePuiss, g2DeuxPuiss, g2ResteAffine, g2Motif],
  3: [g3SommeCarres, g3Reste, g3Decimale, g3ResteCarre, g3MotifCompte],
  4: [g4Reste, g4DeuxDerniers, g4SommePuiss, g4SommeCarres, g4SommeDecimales, g4Decimale, g4Compte],
  5: [g5Tour, g5PlusMoinsUn, g5DeuxDerniers, g5Produit, g5Div5]
};
function secours(){
  return {q: 'Quel est le chiffre des unités de 3¹⁰ ?', a: '9', accept: null, choix: ['9', '3', '7', '1'],
    expl: M_CYCLE + ' Le chiffre des unités des puissances de 3 suit le cycle 3, 9, 7, 1. 10 = 4 × 2 + 2 : le reste 2 désigne le 2e terme du cycle, donc 9.'};
}

A.push({
  id: 'alb-08-unites-cycles-restes',
  phase: 'albert',
  ordre: 8,
  theme: 'arithmetique',
  titre: 'Chiffre des unités, cycles et restes',
  objectif: 'Trouver sans calculatrice le chiffre des unités ou le reste d\'un nombre gigantesque en repérant un cycle, puis en divisant le rang par la longueur de ce cycle.',
  lecon:
`<p class="lede">Au test, on te demande parfois le <mark>chiffre des unités</mark> d'un nombre gigantesque, le <mark>reste</mark> d'une division impossible à poser, ou le 2 026e élément d'un motif qui se répète. Aucun gros calcul n'est attendu : tout repose sur un <mark>cycle</mark> que tu repères en quelques lignes.</p>
<h3>Ce que le test demande</h3>
<p>Des questions courtes, sans calculatrice : chiffre des unités de 7<sup>2027</sup> ou d'une longue somme de carrés, reste de 2<sup>100</sup> par 7, 500e chiffre après la virgule de 3/7, couleur de la 1 000e perle d'un collier. La seule voie rapide est de trouver ce qui se répète.</p>
<h3>Les deux prérequis</h3>
<p><strong>La division euclidienne.</strong> Diviser n par p, c'est écrire n = p × q + r, avec un reste r compris entre 0 et p − 1. Exemple : 2 026 = 4 × 506 + 2. Le reste est toujours plus petit que le diviseur.</p>
<p><strong>Seules les unités comptent.</strong> Le chiffre des unités d'une somme ou d'un produit ne dépend que des chiffres des unités : 347 × 829 se termine comme 7 × 9 = 63, donc par 3. C'est pareil pour les restes : si N a un reste 4 dans la division par 7, alors 3N + 5 a le même reste que 3 × 4 + 5 = 17, c'est-à-dire 3.</p>
<div class="formule"><p>rang n = (longueur du cycle) × q + r : on prend le r-ième élément du cycle, et le DERNIER si r = 0</p></div>
<table class="tbl"><tr><th>Unités de la base</th><th>Unités des puissances 1, 2, 3, 4…</th><th>Longueur</th></tr>
<tr><td>2</td><td>2, 4, 8, 6</td><td>4</td></tr>
<tr><td>3</td><td>3, 9, 7, 1</td><td>4</td></tr>
<tr><td>7</td><td>7, 9, 3, 1</td><td>4</td></tr>
<tr><td>8</td><td>8, 4, 2, 6</td><td>4</td></tr>
<tr><td>4</td><td>4, 6</td><td>2</td></tr>
<tr><td>9</td><td>9, 1</td><td>2</td></tr>
<tr><td>0, 1, 5, 6</td><td>toujours le même chiffre</td><td>1</td></tr></table>
<h3>La méthode</h3>
<div class="etapes">
<p><strong>1. Je réduis :</strong> je ne garde que le chiffre des unités de la base, ou son reste dans la division demandée.</p>
<p><strong>2. Je cherche le cycle :</strong> j'écris les premiers termes jusqu'à ce que tout recommence. Pour des restes, je multiplie à chaque étape en ne gardant que le reste, jusqu'à retomber sur 1.</p>
<p><strong>3. Je me repère :</strong> je divise le rang par la longueur du cycle ; le reste donne la place. Un reste de 0 renvoie au dernier élément.</p>
<p><strong>4. Pour une longue somme :</strong> je calcule un bloc complet, je multiplie par le nombre de blocs, j'ajoute le morceau qui reste, en ne gardant que les unités.</p>
</div>
<h3>Exemples résolus</h3>
<p><strong>Exemple 1.</strong> Chiffre des unités de 8<sup>37</sup>. Cycle 8, 4, 2, 6, de longueur 4. 37 = 4 × 9 + 1 : le reste 1 désigne le 1er élément, donc <mark>8</mark>.</p>
<p><strong>Exemple 2.</strong> Chiffre des unités de 3<sup>1</sup> + 3<sup>2</sup> + … + 3<sup>42</sup>. Un bloc de 4 termes a pour unités 3 + 9 + 7 + 1 = 20 : il ne compte pas. 42 = 4 × 10 + 2 : il reste 3<sup>41</sup> et 3<sup>42</sup>, d'unités 3 et 9. 3 + 9 = 12, la réponse est <mark>2</mark>.</p>
<p><strong>Exemple 3.</strong> Chiffre des unités de 1² + 2² + … + 523². Dans tout bloc de 10 entiers consécutifs, les unités des carrés sont 1, 4, 9, 6, 5, 6, 9, 4, 1, 0, de somme 45. 523 = 10 × 52 + 3 : 52 blocs donnent 52 × 45 = 2 340, unités 0. Il reste 521², 522² et 523², d'unités 1, 4, 9, soit 14. La réponse est <mark>4</mark>.</p>
<p><strong>Exemple 4.</strong> Reste de 3<sup>99</sup> dans la division par 5. Restes successifs : 3 ; 3 × 3 = 9, reste 4 ; 4 × 3 = 12, reste 2 ; 2 × 3 = 6, reste 1. Cycle 3, 4, 2, 1. 99 = 4 × 24 + 3 : 3e élément, le reste est <mark>2</mark>.</p>
<p><strong>Même méthode pour les motifs et les décimales.</strong> Un collier répète 6 perles : la 100e est la 4e du motif, car 100 = 6 × 16 + 4. En posant la division, 2/7 = 0,285714 285714… : le bloc compte 6 chiffres, et 47 = 6 × 7 + 5, donc le 47e chiffre après la virgule est le 5e du bloc, <mark>1</mark>.</p>
<h3>Pour les questions les plus dures</h3>
<p><strong>La puissance qui vaut plus ou moins 1.</strong> Pour un reste par un grand nombre, cherche une puissance juste à côté d'un multiple. 2<sup>4</sup> = 16 = 17 − 1 : dans les restes par 17, 2<sup>4</sup> se comporte comme −1. Ainsi 2<sup>2027</sup> = (2<sup>4</sup>)<sup>506</sup> × 2<sup>3</sup> se comporte comme (−1)<sup>506</sup> × 8 = 8 : le reste est 8. Avec un nombre impair de paquets, on obtiendrait −8, c'est-à-dire un reste de 17 − 8 = 9.</p>
<p><strong>L'exposant géant.</strong> Pour le chiffre des unités de 3<sup>N</sup> avec N = 7<sup>9</sup>, il suffit du reste de N par 4. Or 7 = 4 + 3 et 7² = 49 = 4 × 12 + 1 : les restes des puissances de 7 par 4 alternent 3, 1, 3, 1… L'exposant 9 est impair, donc N a un reste 3, et 3<sup>N</sup> se termine comme 3<sup>3</sup> = 27, par 7.</p>
<h3>Réflexes sans calculatrice</h3>
<ul>
<li>Reste par 4 : regarde seulement les deux derniers chiffres (2 027 : 27 = 4 × 6 + 3, reste 3).</li>
<li>Deux derniers chiffres d'une puissance : multiplie en ne gardant que les deux derniers chiffres à chaque étape (7, 49, 43, 01 : période 4).</li>
<li>Dix entiers consécutifs ont toujours, dans un certain ordre, les dix chiffres des unités de 0 à 9.</li>
<li>Vérifie ton repérage sur un petit rang : avec un cycle de longueur 4, l'exposant 5 doit redonner le 1er élément.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Cherche le cycle (des chiffres des unités ou des restes), divise le rang par sa longueur et lis la place donnée par le reste, sachant qu'un reste de 0 renvoie au dernier élément du cycle.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Un reste de 0 désigne le dernier élément du cycle, pas le premier, et le cycle commence à l'exposant 1. Ne garde que le chiffre des unités à chaque étape : un bloc de somme 45 compte pour 5. N'oublie pas le morceau qui reste après les blocs complets. Ne confonds pas un reste par 7 avec un chiffre des unités, et 7<sup>23</sup> n'est pas 7 × 23. Inutile de chercher une formule de somme des carrés : les blocs de 10 suffisent.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Un nombre gigantesque cache toujours un cycle court. Chiffre des unités : cycle de longueur 1, 2 ou 4. Restes par m : on multiplie en ne gardant que le reste, jusqu'à retomber sur 1. Rang n = longueur × q + r : on prend le r-ième élément, et le dernier si r = 0.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(GEN[n])(R);
      if (ex && typeof ex.q === 'string' && typeof ex.a === 'string' && Array.isArray(ex.choix) && ex.choix.length === 4) return ex;
    } catch (e) { /* repli ci-dessous */ }
    return secours();
  }
});

})();
