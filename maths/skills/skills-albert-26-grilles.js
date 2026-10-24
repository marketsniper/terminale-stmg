/* ===== Maths · Objectif Albert School : alb-26-grilles =====
   Grilles et placements de nombres : carrés magiques, figures à sommes égales, rangées à sommes glissantes, partages.
   Une IIFE qui pousse UN objet dans window.ALBERT_SKILLS. QCM à 4 choix, accept: null, texte brut dans q/choix/expl.
   Tables de faisabilité (triangles, carré, croix, partages) obtenues par force brute, puis vérifiées par
   verifs/alb-26-grilles-verif.js. */
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
const ent = x => (Number.isInteger(x) && x >= 1) ? e(x) : null;          // distracteur entier strictement positif, sinon rien
const vois = ans => k => { const v = ans + (k % 2 ? (k + 1) / 2 : -k / 2); return v >= 1 ? e(v) : null; };
const som = t => t.reduce((s, x) => s + x, 0);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const plage = (a, n) => { const t = []; for (let i = 0; i < n; i++) t.push(a + i); return t; };
const MOT = {2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 12: 'douze', 16: 'seize'};
const mot = n => MOT[n] || e(n);
function listeFr(t){ const s = t.map(e); return s.length < 2 ? s.join('') : s.slice(0, -1).join(', ') + ' et ' + s[s.length - 1]; }
function plus(t){ return t.map(e).join(' + '); }
/* Description d'une suite régulière de N nombres : « les neuf entiers de 4 à 12 » ou « les neuf nombres 3, 6, 9, …, 27 (de 3 en 3) ». */
function suiteTxt(a, d, N){
  if (d === 1) return 'les ' + mot(N) + ' entiers de ' + e(a) + ' à ' + e(a + N - 1);
  return 'les ' + mot(N) + ' nombres ' + e(a) + ', ' + e(a + d) + ', ' + e(a + 2 * d) + ', …, ' + e(a + (N - 1) * d) + ' (de ' + d + ' en ' + d + ')';
}

/* ---------- carré magique 3 × 3 ----------
   Cases numérotées 0 à 8 de gauche à droite et de haut en bas. Tout carré magique 3 × 3 s'écrit
   c − v | c + u + v | c − u  /  c − u + v | c | c + u − v  /  c + u | c − u − v | c + v. */
const LIGNES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const NOM_LIGNE = ['la ligne du haut', 'la ligne du milieu', 'la ligne du bas', 'la colonne de gauche', 'la colonne du milieu', 'la colonne de droite',
  'la diagonale qui part du coin en haut à gauche', 'la diagonale qui part du coin en haut à droite'];
const NOM_CASE = ['le coin en haut à gauche', 'la case du milieu en haut', 'le coin en haut à droite', 'la case du milieu à gauche', 'la case centrale',
  'la case du milieu à droite', 'le coin en bas à gauche', 'la case du milieu en bas', 'le coin en bas à droite'];
const OFF = [[0, -1], [1, 1], [-1, 0], [-1, 1], [0, 0], [1, -1], [1, 0], [-1, -1], [0, 1]];
const carre = (c, u, v) => OFF.map(o => c + o[0] * u + o[1] * v);
const opp = i => 8 - i;
const aCase = i => NOM_CASE[i].replace(/^le /, 'au ').replace(/^la /, 'à la ');
function carreAlea(R, cmin, cmax, umax){
  for (let t = 0; t < 400; t++){
    const c = R.int(cmin, cmax), u = R.int(1, umax) * R.pick([1, -1]), v = R.int(1, umax) * R.pick([1, -1]);
    const g = carre(c, u, v);
    if (new Set(g).size === 9 && Math.min.apply(null, g) >= 1 && Math.max.apply(null, g) <= 99) return g;
  }
  return [2, 9, 4, 7, 5, 3, 6, 1, 8];
}
/* Carré magique rempli par a, a + d, …, a + 8d (les 8 carrés possibles). */
function carreSuite(R, a, d){
  const p = R.pick([[d, 3 * d], [3 * d, d]]);
  return carre(a + 4 * d, p[0] * R.pick([1, -1]), p[1] * R.pick([1, -1]));
}
function grille(g, montre, cible){
  const lab = ['en haut', 'au milieu', 'en bas'];
  return [0, 1, 2].map(r => '- ' + lab[r] + ' : ' + [0, 1, 2].map(k => {
    const i = 3 * r + k; return i === cible ? 'x' : (montre.indexOf(i) >= 0 ? e(g[i]) : '?');
  }).join(' | ')).join('\n');
}
/* Déductions par complétion de lignes (une ligne à une seule case inconnue). t[i] = tour où la case i est connue. */
function deduire(connus, Sconnu){
  const t = new Array(9).fill(Infinity), via = new Array(9).fill(-1);
  connus.forEach(i => { t[i] = 0; });
  let tS = Sconnu ? 0 : Infinity, ligneS = -1;
  for (let r = 1; r <= 12; r++){
    const k = i => t[i] < r;
    let chg = false;
    if (tS === Infinity){
      const j = LIGNES.findIndex(L => L.every(k));
      if (j >= 0){ tS = r; ligneS = j; chg = true; }
    } else {
      LIGNES.forEach((L, j) => {
        const inc = L.filter(i => !k(i));
        if (inc.length === 1 && t[inc[0]] === Infinity){ t[inc[0]] = r; via[inc[0]] = j; chg = true; }
      });
    }
    if (!chg) break;
  }
  return {t, via, tS, ligneS};
}
function chaine(d, x){
  const out = [], vus = new Set();
  (function visite(i){
    if (vus.has(i) || d.t[i] === 0 || d.via[i] < 0) return;
    vus.add(i);
    LIGNES[d.via[i]].forEach(j => { if (j !== i) visite(j); });
    out.push(i);
  })(x);
  return out;
}
function etapesTxt(g, d, x, S){
  return chaine(d, x).map(i => {
    const o = LIGNES[d.via[i]].filter(j => j !== i);
    return 'Dans ' + NOM_LIGNE[d.via[i]] + ', ' + (i === x ? 'x' : NOM_CASE[i]) + ' vaut ' + e(S) + ' − ' + e(g[o[0]]) + ' − ' + e(g[o[1]]) + ' = ' + e(g[i]) + '.';
  }).join(' ');
}
function revele(R, x, base, taille, Sconnu, cible){
  const autres = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => i !== x && base.indexOf(i) < 0);
  for (let t = 0; t < 400; t++){
    const m = base.concat(R.shuffle(autres).slice(0, taille));
    const d = deduire(m, Sconnu);
    if (d.t[x] === cible) return {m, d};
  }
  return null;
}
const INTRO_CARRE = 'Dans ce carré magique 3 × 3, les trois lignes, les trois colonnes et les deux diagonales ont la même somme. Les « ? » sont des cases cachées.\n';

/* ---------- tables obtenues par force brute (nombres de base 1 à n ; un décalage s ajoute s à chaque nombre) ---------- */
const TRI3 = [[[1, 2, 3], 9], [[1, 3, 5], 10], [[2, 4, 6], 11], [[4, 5, 6], 12]];                       // triangle, 3 nombres par côté, 1 à 6
const TRI4 = [[[1, 2, 3], 17], [[1, 4, 7], 19], [[2, 3, 7], 19], [[1, 5, 9], 20], [[2, 5, 8], 20], [[3, 5, 7], 20],
  [[4, 5, 6], 20], [[3, 6, 9], 21], [[3, 7, 8], 21], [[7, 8, 9], 23]];                                   // triangle, 4 nombres par côté, 1 à 9
const CROIX = {3: [1, 3, 5], 4: [2, 4, 6], 5: [1, 3, 5, 7, 9]};                                            // case commune possible, nombres 1 à 2L − 1
const PART = {2: [7, 8, 11, 12, 15, 16, 19, 20], 3: [5, 6, 8, 9, 11, 12, 14, 15, 17, 18], 4: [7, 8, 15, 16]};  // 1 à n partageable en k groupes
const PART_CONSEC = [[2, 4], [2, 8], [2, 12], [3, 6], [3, 9], [3, 12], [4, 8], [4, 16]];                 // a à a + N − 1, tout a

/* Sommes de sous-ensembles atteignables. */
function sommesSous(nums){
  let s = new Set([0]);
  nums.forEach(x => { const n = new Set(s); s.forEach(v => n.add(v + x)); s = n; });
  return s;
}
/* Partage de nums en k groupes de somme t (retour arrière), ou null. */
function partager(nums, k, t){
  const s = nums.slice().sort((a, b) => b - a), g = []; for (let j = 0; j < k; j++) g.push([]);
  const b = new Array(k).fill(0);
  function rec(i){
    if (i === s.length) return true;
    const vus = new Set();
    for (let j = 0; j < k; j++){
      if (vus.has(b[j]) || b[j] + s[i] > t) continue;
      vus.add(b[j]); b[j] += s[i]; g[j].push(s[i]);
      if (rec(i + 1)) return true;
      b[j] -= s[i]; g[j].pop();
    }
    return false;
  }
  return rec(0) ? g : null;
}
function combinaisons(nums, m, t){   // un sous-ensemble de m nombres de somme t dont le reste se partage en deux groupes de t
  const res = [];
  (function rec(i, pris, s){
    if (res.length) return;
    if (pris.length === m){ if (s === t){ const reste = nums.filter(x => pris.indexOf(x) < 0), p = partager(reste, 2, t); if (p) res.push([pris.slice()].concat(p)); } return; }
    for (let j = i; j < nums.length; j++){ if (s + nums[j] <= t){ pris.push(nums[j]); rec(j + 1, pris, s + nums[j]); pris.pop(); } }
  })(0, [], 0);
  return res[0] || null;
}
const grp = t => '{' + t.slice().sort((a, b) => a - b).map(e).join(', ') + '}';

/* =====================================================  NIVEAU 1  ===================================================== */
function n1Constante(R){
  const t = R.int(1, 3);
  let n, N, a, d;
  if (t === 1){ n = 3; N = 9; d = 1; a = R.int(1, 30); }
  else if (t === 2){ n = 3; N = 9; d = R.pick([2, 3, 4, 5, 10]); a = R.pick([1, d, 2 * d, R.int(1, 9)]); }
  else { n = 4; N = 16; d = 1; a = R.int(1, 10); }
  const l = a + (N - 1) * d, T = N * (a + l) / 2, S = T / n, moy = T / N;
  const mots = n === 3 ? 'trois' : 'quatre';
  return {
    q: 'Un carré magique ' + n + ' × ' + n + ' est rempli avec ' + suiteTxt(a, d, N) + ', chacun une seule fois. Ses ' + mots + ' lignes, ses ' + mots +
       ' colonnes et ses deux diagonales ont toutes la même somme, appelée somme magique. Quelle est cette somme magique ?',
    a: e(S), accept: null,
    choix: qcm(e(S), [e(T), nb(moy, 1), e(2 * S)], vois(S)),
    expl: 'On calcule la somme de tous les nombres de la grille, puis on la partage entre les lignes, qui ne se chevauchent pas. ' +
      'Somme des ' + mot(N) + ' nombres : (premier + dernier) × nombre de termes ÷ 2 = (' + e(a) + ' + ' + e(l) + ') × ' + N + ' ÷ 2 = ' + e(T) + '. ' +
      'Les ' + mots + ' lignes se partagent ce total, donc chaque ligne vaut ' + e(T) + ' ÷ ' + n + ' = ' + e(S) + '. ' +
      'Piège : ' + e(T) + ' est la somme de toute la grille et ' + nb(moy, 1) + ' la moyenne d\'une case, pas la somme d\'une ligne ; oublier le ÷ 2 de la formule donne ' + e(2 * S) + '.'
  };
}

function n1Completer(R){
  const g = carreAlea(R, 5, 16, 9);
  const F = R.int(0, 7), horsF = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => LIGNES[F].indexOf(i) < 0);
  const x = R.pick(horsF);
  const M = R.pick([0, 1, 2, 3, 4, 5, 6, 7].filter(j => LIGNES[j].indexOf(x) >= 0));
  const pq = LIGNES[M].filter(i => i !== x), montre = LIGNES[F].slice();
  pq.forEach(i => { if (montre.indexOf(i) < 0) montre.push(i); });
  const S = som(LIGNES[F].map(i => g[i])), ans = g[x];
  const caches = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => i !== x && montre.indexOf(i) < 0);
  return {
    q: INTRO_CARRE + grille(g, montre, x) + '\nQuelle est la valeur de x ?',
    a: e(ans), accept: null,
    choix: qcm(e(ans), [ent(S - g[pq[0]]), ent(g[R.pick(caches)]), ent(S - g[pq[1]])], vois(ans)),
    expl: 'On lit la somme magique sur une ligne complète, puis on complète la ligne qui contient x. ' +
      cap(NOM_LIGNE[F]) + ' est complète : ' + plus(LIGNES[F].map(i => g[i])) + ' = ' + e(S) + ', c\'est la somme magique. ' +
      'Dans ' + NOM_LIGNE[M] + ', x vaut ' + e(S) + ' − ' + e(g[pq[0]]) + ' − ' + e(g[pq[1]]) + ' = ' + e(ans) + '. ' +
      'Piège : ne retirer qu\'une des deux cases connues donne ' + e(S - g[pq[0]]) + ' ; vérifie toujours que ta ligne fait bien ' + e(S) + '.'
  };
}

function n1Partage(R){
  let nums, desc, k, consec = R.int(0, 1) === 1;
  if (!consec){ k = R.pick([2, 2, 3, 3, 4]); const n = R.pick(PART[k]); nums = plage(1, n); desc = 'les entiers de 1 à ' + n; }
  else { const c = R.pick(PART_CONSEC); k = c[0]; nums = plage(R.int(2, 20), c[1]); desc = 'les ' + mot(c[1]) + ' entiers de ' + nums[0] + ' à ' + nums[nums.length - 1]; }
  const N = nums.length, T = som(nums), ans = T / k, f = nums[0], l = nums[N - 1];
  const calc = consec ? 'Somme : (premier + dernier) × nombre d\'entiers ÷ 2 = (' + e(f) + ' + ' + e(l) + ') × ' + N + ' ÷ 2 = ' + e(T) + '. '
                      : 'Somme : 1 + 2 + … + ' + N + ' = ' + N + ' × ' + (N + 1) + ' ÷ 2 = ' + e(T) + '. ';
  return {
    q: 'On répartit ' + desc + ' en ' + mot(k) + ' groupes, chaque entier dans un seul groupe, de sorte que les ' + mot(k) + ' groupes aient la même somme. Quelle est la somme de chaque groupe ?',
    a: e(ans), accept: null,
    choix: qcm(e(ans), [e(T), e(2 * ans), nb(T / N, 1)], vois(ans)),
    expl: 'On calcule la somme de tous les entiers, puis on la partage en parts égales. ' + calc +
      'Les ' + mot(k) + ' groupes se partagent ce total, donc chacun vaut ' + e(T) + ' ÷ ' + k + ' = ' + e(ans) + '. ' +
      'Piège : oublier le ÷ 2 dans le calcul de la somme donne le double, ' + e(2 * ans) + ' ; et ' + nb(T / N, 1) + ' n\'est que la moyenne des entiers.'
  };
}

function n1Tableau(R){
  const forme = R.pick([[3, 4], [4, 3], [3, 3], [2, 5], [5, 2], [4, 4], [3, 5], [5, 3]]), r = forme[0], c = forme[1];
  const tab = []; for (let i = 0; i < r; i++){ const l = []; for (let j = 0; j < c; j++) l.push(R.int(1, 12)); tab.push(l); }
  const L = tab.map(som), C = []; for (let j = 0; j < c; j++) C.push(som(tab.map(l => l[j])));
  const T = som(L);
  /* on cache la dernière colonne (ou la dernière ligne) ; la dimension cachée a au moins trois éléments */
  const colonne = c >= 3 && (r < 3 || R.int(0, 1) === 1);
  const conn = colonne ? C.slice(0, -1) : L.slice(0, -1), tous = colonne ? L : C, ans = colonne ? C[c - 1] : L[r - 1], K = som(conn);
  const nomT = colonne ? 'colonnes' : 'lignes', nomA = colonne ? 'lignes' : 'colonnes', nT = colonne ? c : r, nA = colonne ? r : c;
  const der = colonne ? 'la dernière colonne' : 'la dernière ligne';
  return {
    q: 'Un tableau de ' + mot(r) + ' lignes et ' + mot(c) + ' colonnes est rempli de nombres. Les sommes des ' + mot(nA) + ' ' + nomA + ' valent ' + listeFr(tous) +
       '. Les sommes des ' + mot(nT - 1) + ' premières ' + nomT + ' valent ' + listeFr(conn) + '. Quelle est la somme de ' + der + ' ?',
    a: e(ans), accept: null,
    choix: qcm(e(ans), [e(T), ent(Math.round(K / (nT - 1))), ent(ans + 10)], vois(ans)),
    expl: 'Le total du tableau se calcule de deux façons : avec les sommes des lignes ou avec celles des colonnes. ' +
      'Par les ' + nomA + ' : ' + plus(tous) + ' = ' + e(T) + '. Les ' + nomT + ' connues totalisent ' + plus(conn) + ' = ' + e(K) + '. ' +
      cap(der) + ' vaut donc ' + e(T) + ' − ' + e(K) + ' = ' + e(ans) + '. ' +
      'Piège : ' + e(T) + ' est le total de tout le tableau, pas celui d\'une seule ' + (colonne ? 'colonne' : 'ligne') + ' ; et rien n\'oblige les ' + nomT + ' à se ressembler, la moyenne ne sert à rien.'
  };
}

/* =====================================================  NIVEAU 2  ===================================================== */
function n2Carre(R){
  if (R.int(0, 1) === 1){
    /* somme magique tirée de l'ensemble des nombres, puis deux complétions */
    const d = R.pick([1, 1, 2, 3, 5]), a = R.int(1, 15), g = carreSuite(R, a, d), x = R.int(0, 8);
    const rv = revele(R, x, [], 3, true, 2);
    if (!rv) return null;
    const S = 3 * (a + 4 * d), T = 3 * S, l = a + 8 * d, ch = chaine(rv.d, x), y = ch[0];
    const ox = LIGNES[rv.d.via[x]].filter(j => j !== x);
    const caches = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => i !== x && i !== y && rv.m.indexOf(i) < 0);
    return {
      q: 'Ce carré magique 3 × 3 est rempli avec ' + suiteTxt(a, d, 9) + ', chacun une seule fois ; lignes, colonnes et diagonales ont la même somme. Les « ? » sont des cases cachées.\n' +
         grille(g, rv.m, x) + '\nQuelle est la valeur de x ?',
      a: e(g[x]), accept: null,
      choix: qcm(e(g[x]), [ent(g[y]), ent(S - g[ox[0]]), caches.length ? ent(g[R.pick(caches)]) : null], vois(g[x])),
      expl: 'On calcule la somme magique à partir du total des neuf nombres, puis on complète les lignes une à une jusqu\'à x. ' +
        'Total : (' + e(a) + ' + ' + e(l) + ') × 9 ÷ 2 = ' + e(T) + ', donc somme magique = ' + e(T) + ' ÷ 3 = ' + e(S) + '. ' + etapesTxt(g, rv.d, x, S) +
        ' Piège : s\'arrêter à la case intermédiaire (' + e(g[y]) + ') au lieu d\'aller jusqu\'à x.'
    };
  }
  /* somme magique lue sur une ligne complète, puis deux complétions */
  const g = carreAlea(R, 6, 20, 10), F = R.int(0, 7);
  const horsF = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => LIGNES[F].indexOf(i) < 0), x = R.pick(horsF);
  const rv = revele(R, x, LIGNES[F].slice(), 2, false, 3);
  if (!rv) return null;
  const S = som(LIGNES[F].map(i => g[i])), ch = chaine(rv.d, x), y = ch[0];
  const ox = LIGNES[rv.d.via[x]].filter(j => j !== x);
  const caches = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => i !== x && i !== y && rv.m.indexOf(i) < 0);
  return {
    q: INTRO_CARRE + grille(g, rv.m, x) + '\nQuelle est la valeur de x ?',
    a: e(g[x]), accept: null,
    choix: qcm(e(g[x]), [ent(g[y]), ent(S - g[ox[0]]), caches.length ? ent(g[R.pick(caches)]) : null], vois(g[x])),
    expl: 'On lit la somme magique sur une ligne complète, puis on complète les lignes une à une jusqu\'à x. ' +
      cap(NOM_LIGNE[F]) + ' est complète : ' + plus(LIGNES[F].map(i => g[i])) + ' = ' + e(S) + '. ' + etapesTxt(g, rv.d, x, S) +
      ' Piège : s\'arrêter à la case intermédiaire (' + e(g[y]) + ') au lieu d\'aller jusqu\'à x.'
  };
}

function introTri3(nums){
  return 'On place les six nombres ' + listeFr(nums) + ' sur un triangle : un nombre à chaque sommet et un nombre au milieu de chaque côté, chacun une seule fois. ' +
         'Sur chaque côté, la somme des trois nombres (les deux sommets et le milieu) est la même.';
}
function n2Triangle(R){
  const s = R.int(0, 19), base = R.pick(TRI3), V = base[0].map(x => x + s), S = base[1] + 3 * s, nums = plage(1 + s, 6), T = som(nums), SV = som(V);
  const cle = 'En additionnant les trois côtés, chaque milieu est compté une fois et chaque sommet deux fois : 3 × S = (somme des six nombres) + (somme des sommets). ';
  const t = R.int(1, 3);
  if (t === 1) return {
    q: introTri3(nums) + ' Les sommets portent ' + listeFr(V) + '. Quelle est la somme des nombres d\'un côté ?',
    a: e(S), accept: null,
    choix: qcm(e(S), [ent(T / 3), ent((T - SV) / 3), e(SV)], vois(S)),
    expl: 'On additionne les trois côtés d\'un coup en comptant combien de fois chaque nombre y apparaît. ' + cle +
      'Ici 3 × S = ' + e(T) + ' + ' + e(SV) + ' = ' + e(T + SV) + ', donc S = ' + e(S) + '. ' +
      'Piège : oublier que les sommets comptent deux fois donne ' + e(T) + ' ÷ 3 = ' + e(T / 3) + '.'
  };
  if (t === 2) return {
    q: introTri3(nums) + ' La somme de chaque côté vaut ' + e(S) + '. Quelle est la somme des trois nombres placés aux sommets ?',
    a: e(SV), accept: null,
    choix: qcm(e(SV), [e(3 * S), ent(T - S), e(S)], vois(SV)),
    expl: 'On additionne les trois côtés d\'un coup en comptant combien de fois chaque nombre y apparaît. ' + cle +
      'Ici 3 × ' + e(S) + ' = ' + e(3 * S) + ' = ' + e(T) + ' + (somme des sommets), donc la somme des sommets vaut ' + e(3 * S) + ' − ' + e(T) + ' = ' + e(SV) + '. ' +
      'Piège : ' + e(3 * S) + ' compte aussi les milieux ; il faut retirer la somme des six nombres.'
  };
  const o = R.shuffle(V), autres = nums.filter(x => V.indexOf(x) < 0);
  return {
    q: introTri3(nums) + ' La somme de chaque côté vaut ' + e(S) + ', et deux des sommets portent ' + e(o[0]) + ' et ' + e(o[1]) + '. Quel nombre est placé sur le troisième sommet ?',
    a: e(o[2]), accept: null,
    choix: qcm(e(o[2]), [ent(S - o[0] - o[1])].concat(R.shuffle(autres).map(e)), vois(o[2])),
    expl: 'On trouve d\'abord la somme des trois sommets en additionnant les trois côtés, puis on retire les deux sommets connus. ' + cle +
      'Ici la somme des sommets vaut 3 × ' + e(S) + ' − ' + e(T) + ' = ' + e(SV) + ', donc le troisième sommet porte ' + e(SV) + ' − ' + e(o[0]) + ' − ' + e(o[1]) + ' = ' + e(o[2]) + '. ' +
      'Piège : ' + e(S) + ' − ' + e(o[0]) + ' − ' + e(o[1]) + ' traite les deux sommets comme s\'ils étaient sur le même côté que le troisième, ce qui est faux.'
  };
}

function n2Ecart(R){
  for (let essai = 0; essai < 60; essai++){
    let nums, desc;
    if (R.int(0, 1) === 1){ const n = R.int(6, 16); nums = plage(1, n); desc = 'les entiers de 1 à ' + n; }
    else { const N = R.int(5, 9); nums = plage(R.int(2, 12), N); desc = 'les ' + mot(N) + ' entiers de ' + nums[0] + ' à ' + nums[N - 1]; }
    const T = som(nums), SS = sommesSous(nums), N = nums.length;
    const calc = nums[0] === 1 ? '1 + 2 + … + ' + N + ' = ' + N + ' × ' + (N + 1) + ' ÷ 2 = ' + e(T)
                               : '(' + e(nums[0]) + ' + ' + e(nums[N - 1]) + ') × ' + N + ' ÷ 2 = ' + e(T);
    if (R.int(0, 1) === 1){
      const B = [...SS].filter(b => 2 * b > T && 2 * b - T <= T / 2 && b < T);
      if (!B.length) continue;
      const big = R.pick(B), d = 2 * big - T, small = T - big, demandeGrand = R.int(0, 1) === 1, ans = demandeGrand ? big : small;
      return {
        q: 'On partage ' + desc + ' en deux groupes, chaque entier dans un seul groupe. La somme du premier groupe dépasse de ' + e(d) + ' celle du second. Quelle est la somme du ' + (demandeGrand ? 'premier' : 'second') + ' groupe ?',
        a: e(ans), accept: null,
        choix: qcm(e(ans), [e(demandeGrand ? small : big), ent(demandeGrand ? T / 2 + d : T / 2 - d), ent(T - d)], vois(ans)),
        expl: 'On part de la somme totale : les deux groupes totalisent ensemble la somme de tous les entiers, et leur écart est connu. ' +
          'Total : ' + calc + '. Si le second groupe vaut s, le premier vaut s + ' + e(d) + ', donc 2s + ' + e(d) + ' = ' + e(T) + ' et s = (' + e(T) + ' − ' + e(d) + ') ÷ 2 = ' + e(small) +
          ' ; le premier vaut ' + e(small) + ' + ' + e(d) + ' = ' + e(big) + '. ' +
          'Piège : prendre la moitié du total puis ' + (demandeGrand ? 'ajouter' : 'retirer') + ' l\'écart entier compte l\'écart deux fois ; c\'est la moitié de l\'écart qu\'il faut ' + (demandeGrand ? 'ajouter' : 'retirer') + '.'
      };
    }
    const r = R.pick([2, 3, 4]);
    if (T % (r + 1) || !SS.has(T / (r + 1))) continue;
    const part = T / (r + 1), big = r * part, demandeGrand = R.int(0, 1) === 1, ans = demandeGrand ? big : part;
    const rel = r === 2 ? 'le double de celle' : (r === 3 ? 'le triple de celle' : 'égale à quatre fois celle');
    return {
      q: 'On partage ' + desc + ' en deux groupes, chaque entier dans un seul groupe. La somme du premier groupe est ' + rel + ' du second. Quelle est la somme du ' + (demandeGrand ? 'premier' : 'second') + ' groupe ?',
      a: e(ans), accept: null,
      choix: qcm(e(ans), [e(demandeGrand ? part : big), ent(T / r), ent(T / 2)], vois(ans)),
      expl: 'On découpe le total en parts égales : le second groupe compte pour une part et le premier pour ' + mot(r) + ' parts. ' +
        'Total : ' + calc + ', soit ' + mot(r + 1) + ' parts. Une part vaut ' + e(T) + ' ÷ ' + (r + 1) + ' = ' + e(part) + ' : c\'est le second groupe, et le premier vaut ' + r + ' × ' + e(part) + ' = ' + e(big) + '. ' +
        'Piège : diviser le total par ' + r + ' au lieu de ' + (r + 1) + ' ; il y a ' + (r + 1) + ' parts en tout.'
    };
  }
  return null;
}

function n2Rangee(R){
  for (let t = 0; t < 100; t++){
    const N = R.int(10, 20), S = R.int(12, 30), p = R.int(1, S - 3), q = R.int(1, S - p - 1), r = S - p - q;
    if (new Set([p, q, r]).size < 3) continue;
    const m = R.pick([R.int(4, N), 3 * R.int(2, Math.floor(N / 3))]);
    const reste = m % 3, ans = [r, p, q][reste], val = [r, p, q];
    return {
      q: 'Dans une rangée de ' + N + ' cases numérotées de 1 à ' + N + ', on écrit un nombre dans chaque case. La somme de trois cases voisines est toujours égale à ' + S +
         '. La case 1 contient ' + p + ' et la case 2 contient ' + q + '. Que contient la case ' + m + ' ?',
      a: e(ans), accept: null,
      choix: qcm(e(ans), [e(val[(reste + 1) % 3]), e(val[(reste + 2) % 3]), ent(S - p)], vois(ans)),
      expl: 'Deux groupes de trois cases voisines qui se chevauchent ont deux cases en commun, donc la case qui sort est égale à la case qui entre : la rangée se répète toutes les trois cases. ' +
        'La case 3 vaut ' + S + ' − ' + p + ' − ' + q + ' = ' + r + ', et la rangée s\'écrit ' + p + ', ' + q + ', ' + r + ', ' + p + ', ' + q + ', ' + r + ', … ' +
        'Le numéro ' + m + ' = 3 × ' + Math.floor(m / 3) + (reste ? ' + ' + reste : '') + ' a le même reste que ' + (reste || 3) + ' dans la division par 3, donc la case ' + m + ' contient ' + ans + '. ' +
        'Piège : se tromper de reste ; une case dont le numéro est un multiple de 3 se comporte comme la case 3, pas comme la case 1.'
    };
  }
  return null;
}

/* =====================================================  NIVEAU 3  ===================================================== */
function n3Centre(R){
  const t = R.int(1, 4);
  if (t === 1){
    const d = R.pick([1, 2, 3, 4, 5, 10]), a = R.int(1, 20), c = a + 4 * d, l = a + 8 * d, T = 9 * c, S = 3 * c;
    return {
      q: 'Un carré magique 3 × 3 (lignes, colonnes et diagonales de même somme) est rempli avec ' + suiteTxt(a, d, 9) + ', chacun une seule fois. Quel nombre est forcément dans la case centrale ?',
      a: e(c), accept: null,
      choix: qcm(e(c), [e(S), e(a + 3 * d), e(a + 5 * d)], vois(c)),
      expl: 'On additionne les quatre lignes qui passent par le centre : elles couvrent toute la grille, et le centre y est compté quatre fois au lieu d\'une. ' +
        'Total des neuf nombres : (' + e(a) + ' + ' + e(l) + ') × 9 ÷ 2 = ' + e(T) + ', donc somme magique = ' + e(T) + ' ÷ 3 = ' + e(S) + '. ' +
        'La ligne du milieu, la colonne du milieu et les deux diagonales font 4 × ' + e(S) + ' = ' + e(4 * S) + ' = ' + e(T) + ' + 3 × centre, donc 3 × centre = ' + e(4 * S - T) + ' et le centre vaut ' + e(c) + ' (le tiers de la somme magique). ' +
        'Piège : la somme magique ' + e(S) + ' n\'est pas la case centrale.'
    };
  }
  if (t === 2){
    const c = R.int(4, 40), T = 9 * c;
    return {
      q: 'Dans un carré magique 3 × 3, les trois lignes, les trois colonnes et les deux diagonales ont la même somme. La somme des neuf nombres du carré vaut ' + e(T) + '. Quel nombre est dans la case centrale ?',
      a: e(c), accept: null,
      choix: qcm(e(c), [e(T / 3), ent(T / 4), ent(T / 8)], vois(c)),
      expl: 'On trouve la somme magique avec les trois lignes, puis on additionne les quatre lignes qui passent par le centre, où le centre est compté quatre fois. ' +
        'Somme magique : ' + e(T) + ' ÷ 3 = ' + e(T / 3) + '. Les quatre lignes par le centre font 4 × ' + e(T / 3) + ' = ' + e(4 * T / 3) + ' = ' + e(T) + ' + 3 × centre, donc 3 × centre = ' + e(T / 3) + ' et le centre vaut ' + e(c) + '. ' +
        'Piège : ' + e(T / 3) + ' est la somme d\'une ligne, pas le centre ; le centre vaut le neuvième du total.'
    };
  }
  const g = carreAlea(R, 5, 30, 12), c = g[4], S = 3 * c;
  if (t === 3){
    const i = R.pick([0, 1, 2, 3]), j = R.int(0, 1) ? i : opp(i), k = opp(j), a = g[j], ans = g[k];
    return {
      q: 'Dans un carré magique 3 × 3, la somme magique (commune aux lignes, aux colonnes et aux diagonales) vaut ' + e(S) + '. ' + cap(NOM_CASE[j]) + ' contient ' + e(a) + '. Que contient ' + NOM_CASE[k] + ' ?',
      a: e(ans), accept: null,
      choix: qcm(e(ans), [ent(S - a), e(c), ent(S - 2 * a)], vois(ans)),
      expl: 'Ces deux cases sont sur une même ligne qui passe par le centre, et le centre vaut toujours le tiers de la somme magique. ' +
        'Centre : ' + e(S) + ' ÷ 3 = ' + e(c) + '. La ligne qui relie les deux cases donne ' + e(a) + ' + ' + e(c) + ' + ? = ' + e(S) + ', donc la case cherchée vaut ' + e(S) + ' − ' + e(a) + ' − ' + e(c) + ' = ' + e(ans) + '. ' +
        'Piège : oublier le centre donne ' + e(S - a) + ' ; deux cases opposées par rapport au centre font toujours 2 × centre.'
    };
  }
  const coins = g[0] + g[2] + g[6] + g[8];
  return {
    q: 'Dans un carré magique 3 × 3, la somme magique (commune aux lignes, aux colonnes et aux diagonales) vaut ' + e(S) + '. Quelle est la somme des quatre nombres placés dans les coins ?',
    a: e(coins), accept: null,
    choix: qcm(e(coins), [e(2 * S), e(2 * S - c), e(S)], vois(coins)),
    expl: 'Les deux diagonales contiennent les quatre coins et deux fois le centre, et le centre vaut le tiers de la somme magique. ' +
      'Centre : ' + e(S) + ' ÷ 3 = ' + e(c) + '. Les deux diagonales font 2 × ' + e(S) + ' = ' + e(2 * S) + ' = (somme des coins) + 2 × ' + e(c) + ', donc la somme des coins vaut ' + e(2 * S) + ' − ' + e(2 * c) + ' = ' + e(coins) + '. ' +
      'Piège : oublier de retirer le centre, compté deux fois, donne ' + e(2 * S) + ' ; ne le retirer qu\'une fois donne ' + e(2 * S - c) + '.'
  };
}

function introTri4(nums){
  return 'On place les neuf nombres ' + (nums[0] === 1 ? 'de 1 à 9' : 'de ' + nums[0] + ' à ' + nums[8]) + ' autour d\'un triangle : un nombre à chaque sommet et deux nombres sur chaque côté, entre les deux sommets, chacun une seule fois. ' +
         'Chaque côté porte ainsi quatre nombres (ses deux sommets et les deux nombres entre eux), et les trois côtés ont la même somme.';
}
function n3Triangle4(R){
  const s = R.int(0, 11), base = R.pick(TRI4), V = base[0].map(x => x + s), S = base[1] + 4 * s, nums = plage(1 + s, 9), T = som(nums), SV = som(V);
  const cle = 'En additionnant les trois côtés, chaque nombre placé entre deux sommets compte une fois et chaque sommet deux fois : 3 × S = (somme des neuf nombres) + (somme des sommets). ';
  const tot = 'Somme des neuf nombres : (' + e(nums[0]) + ' + ' + e(nums[8]) + ') × 9 ÷ 2 = ' + e(T) + '. ';
  const t = R.int(1, 3);
  if (t === 1) return {
    q: introTri4(nums) + ' Les sommets portent ' + listeFr(V) + '. Quelle est la somme des quatre nombres d\'un côté ?',
    a: e(S), accept: null,
    choix: qcm(e(S), [e(T / 3), ent((T - SV) / 3), e(SV)], vois(S)),
    expl: 'On additionne les trois côtés d\'un coup en comptant combien de fois chaque nombre y apparaît. ' + cle + tot +
      'Ici 3 × S = ' + e(T) + ' + ' + e(SV) + ' = ' + e(T + SV) + ', donc S = ' + e(S) + '. ' +
      'Piège : oublier que les sommets comptent deux fois donne ' + e(T) + ' ÷ 3 = ' + e(T / 3) + '.'
  };
  if (t === 2) return {
    q: introTri4(nums) + ' La somme des quatre nombres de chaque côté vaut ' + e(S) + '. Quelle est la somme des trois nombres placés aux sommets ?',
    a: e(SV), accept: null,
    choix: qcm(e(SV), [e(3 * S), e(T / 3), e(S)], vois(SV)),
    expl: 'On additionne les trois côtés d\'un coup en comptant combien de fois chaque nombre y apparaît. ' + cle + tot +
      'Ici 3 × ' + e(S) + ' = ' + e(3 * S) + ', donc la somme des sommets vaut ' + e(3 * S) + ' − ' + e(T) + ' = ' + e(SV) + '. ' +
      'Piège : ' + e(3 * S) + ' compte aussi les six autres nombres ; il faut retirer la somme des neuf nombres.'
  };
  const o = R.shuffle(V), autres = nums.filter(x => V.indexOf(x) < 0);
  return {
    q: introTri4(nums) + ' La somme des quatre nombres de chaque côté vaut ' + e(S) + ', et deux des sommets portent ' + e(o[0]) + ' et ' + e(o[1]) + '. Quel nombre est placé sur le troisième sommet ?',
    a: e(o[2]), accept: null,
    choix: qcm(e(o[2]), R.shuffle(autres).map(e), vois(o[2])),
    expl: 'On trouve d\'abord la somme des trois sommets en additionnant les trois côtés, puis on retire les deux sommets connus. ' + cle + tot +
      'La somme des sommets vaut 3 × ' + e(S) + ' − ' + e(T) + ' = ' + e(SV) + ', donc le troisième sommet porte ' + e(SV) + ' − ' + e(o[0]) + ' − ' + e(o[1]) + ' = ' + e(o[2]) + '. ' +
      'Piège : chercher à remplir le triangle par essais ; le comptage donne le sommet sans connaître les autres cases.'
  };
}

function n3Rangee(R){
  for (let essai = 0; essai < 100; essai++){
    const k = R.pick([3, 4]), N = R.pick([30, 40, 50, 60, 80, 100]), S = k === 3 ? R.int(15, 30) : R.int(20, 40);
    const w = []; let reste = S;
    for (let i = 0; i < k - 1; i++){ const v = R.int(1, Math.max(1, reste - (k - 1 - i) - 1)); w.push(v); reste -= v; }
    w.push(reste);
    if (reste < 1 || new Set(w).size < k) continue;
    const res = R.shuffle(plage(0, k)), cible = res[k - 1];        // restes 0 à k − 1 ; le dernier est demandé
    const pos = r => { const lo = r === 0 ? 1 : 0; const q = R.int(lo, Math.floor((N - r) / k)); return q * k + r; };
    const donne = res.slice(0, k - 1).map(r => ({p: pos(r), v: w[(r + k - 1) % k]}));   // case n de reste r contient w[(r − 1) mod k]
    if (donne.some(o => o.p < 1)) continue;
    let m = pos(cible); if (m < N / 2) m = pos(cible);
    if (m < 1 || donne.some(o => o.p === m)) continue;
    const ans = w[(cible + k - 1) % k], vals = donne.map(o => o.v);
    const txt = donne.map(o => 'la case ' + o.p + ' contient ' + o.v);
    return {
      q: 'Dans une rangée de ' + N + ' cases numérotées de 1 à ' + N + ', on écrit un nombre dans chaque case. La somme de ' + mot(k) + ' cases voisines est toujours égale à ' + S + '. ' +
         cap(txt.slice(0, -1).join(', ') + ' et ' + txt[txt.length - 1]) + '. Que contient la case ' + m + ' ?',
      a: e(ans), accept: null,
      choix: qcm(e(ans), [e(vals[0]), e(vals[vals.length - 1]), k === 3 ? ent(S - vals[0]) : ent(S - vals[0] - vals[1])], vois(ans)),
      expl: 'Quand on décale un groupe de ' + mot(k) + ' cases voisines d\'un cran, la case qui sort et la case qui entre sont égales : la rangée se répète toutes les ' + mot(k) + ' cases. ' +
        'Deux cases dont les numéros ont le même reste dans la division par ' + k + ' contiennent donc le même nombre. Restes : ' +
        donne.concat([{p: m}]).map(o => o.p + ' → ' + (o.p % k)).join(', ') + '. ' +
        'Les cases ' + donne.map(o => o.p).join(', ') + ' et ' + m + ' ont des restes tous différents : elles jouent le rôle de ' + mot(k) + ' cases voisines, dont la somme vaut ' + S + '. ' +
        'La case ' + m + ' contient donc ' + S + ' − ' + vals.join(' − ') + ' = ' + ans + '. ' +
        'Piège : recopier l\'une des valeurs données, ou oublier d\'en retirer une ; seuls les restes comptent.'
    };
  }
  return null;
}

function introCroix(L, nums){
  return 'On dispose ' + mot(2 * L - 1) + ' cases en croix : une ligne de ' + mot(L) + ' cases et une colonne de ' + mot(L) + ' cases, qui ont une seule case en commun. ' +
         'On y place les nombres ' + (nums[0] === 1 ? 'de 1 à ' + nums[nums.length - 1] : 'de ' + nums[0] + ' à ' + nums[nums.length - 1]) + ', un par case. La ligne et la colonne ont la même somme.';
}
function n3Croix(R){
  const L = R.pick([3, 4, 5]), s = R.int(0, 14), nums = plage(1 + s, 2 * L - 1), T = som(nums), c = R.pick(CROIX[L]) + s, S = (T + c) / 2;
  const cle = 'En additionnant la ligne et la colonne, on obtient tous les nombres une fois, plus la case commune une seconde fois : 2 × S = (somme de tous les nombres) + (case commune). ';
  const tot = 'Somme de tous les nombres : ' + e(T) + '. ';
  if (R.int(0, 1) === 1) return {
    q: introCroix(L, nums) + ' La case commune contient ' + e(c) + '. Quelle est la somme des nombres de la ligne ?',
    a: e(S), accept: null,
    choix: qcm(e(S), [ent(T / 2), ent((T - c) / 2), e(T + c)], vois(S)),
    expl: 'On additionne la ligne et la colonne en comptant combien de fois chaque case y apparaît. ' + cle + tot +
      'Ici 2 × S = ' + e(T) + ' + ' + e(c) + ' = ' + e(T + c) + ', donc S = ' + e(S) + '. ' +
      'Piège : oublier que la case commune compte deux fois revient à partager ' + e(T) + ' en deux.'
  };
  const autres = nums.filter(x => x !== c);
  return {
    q: introCroix(L, nums) + ' La somme des nombres de la ligne vaut ' + e(S) + '. Quel nombre est dans la case commune ?',
    a: e(c), accept: null,
    choix: qcm(e(c), [ent(T - S), e(R.pick(autres)), e(R.pick(autres)), e(R.pick(autres))], vois(c)),
    expl: 'On additionne la ligne et la colonne en comptant combien de fois chaque case y apparaît. ' + cle + tot +
      'Ici 2 × ' + e(S) + ' = ' + e(2 * S) + ' = ' + e(T) + ' + case commune, donc la case commune contient ' + e(2 * S) + ' − ' + e(T) + ' = ' + e(c) + '. ' +
      (T - S !== c ? 'Piège : ' + e(T) + ' − ' + e(S) + ' = ' + e(T - S) + ' est la somme de la colonne sans sa case commune, pas la case commune.'
                   : 'Piège : partager le total en deux, comme si la case commune ne comptait qu\'une fois ; ici ' + e(T) + ' ÷ 2 ne tombe même pas juste.')
  };
}

/* =====================================================  NIVEAU 4  ===================================================== */
function n4Carre(R){
  for (let essai = 0; essai < 60; essai++){
    const g = carreAlea(R, 8, 25, 12), p = R.pick([0, 1, 2, 3]), pp = opp(p);
    const r = R.pick([0, 1, 2, 3, 5, 6, 7, 8].filter(i => i !== p && i !== pp));
    const connus = [p, pp, r], d = deduire(connus.concat([4]), true);
    let cand = [0, 1, 2, 3, 5, 6, 7, 8].filter(i => connus.indexOf(i) < 0 && d.t[i] === 2);
    if (!cand.length) cand = [0, 1, 2, 3, 5, 6, 7, 8].filter(i => connus.indexOf(i) < 0 && d.t[i] === 1 && i !== opp(r));
    if (!cand.length) continue;
    const x = R.pick(cand), c = g[4], S = 3 * c, ch = chaine(d, x);
    const inter = ch.filter(i => i !== x), caches = [0, 1, 2, 3, 5, 6, 7, 8].filter(i => i !== x && connus.indexOf(i) < 0 && inter.indexOf(i) < 0);
    return {
      q: 'Dans ce carré magique 3 × 3, les trois lignes, les trois colonnes et les deux diagonales ont la même somme. On ne connaît que trois cases ; les « ? » sont cachées.\n' +
         grille(g, connus, x) + '\nQuelle est la valeur de x ?',
      a: e(g[x]), accept: null,
      choix: qcm(e(g[x]), [inter.length ? ent(g[inter[0]]) : null, e(c), caches.length ? ent(g[R.pick(caches)]) : null, ent(S - g[r])], vois(g[x])),
      expl: 'Deux cases opposées par rapport au centre ont pour somme le double du centre : c\'est par là qu\'on démarre. ' +
        cap(NOM_CASE[p]) + ' et ' + NOM_CASE[pp] + (p % 2 ? ' sont opposées' : ' sont opposés') + ', donc le centre vaut (' + e(g[p]) + ' + ' + e(g[pp]) + ') ÷ 2 = ' + e(c) + ' et la somme magique vaut 3 × ' + e(c) + ' = ' + e(S) + '. ' +
        etapesTxt(g, d, x, S) + ' Piège : chercher une ligne complète qui n\'existe pas, ou prendre le centre (' + e(c) + ') pour la réponse.'
    };
  }
  return null;
}

function n4MaxMin(R){
  const max = R.int(0, 1) === 1, sup = max ? 'grande' : 'petite';
  if (R.int(0, 1) === 1){
    /* triangle, trois nombres par côté, nombres a à a + 5 */
    const s = R.int(0, 19), nums = plage(1 + s, 6), T = som(nums);
    const V = (max ? [4, 5, 6] : [1, 2, 3]).map(x => x + s), SV = som(V), S = (T + SV) / 3;
    const ex = (max ? [[4, 3, 5], [5, 1, 6], [6, 2, 4]] : [[1, 6, 2], [2, 4, 3], [3, 5, 1]]).map(l => l.map(x => x + s));
    const trois = max ? nums[3] + nums[4] + nums[5] : nums[0] + nums[1] + nums[2];
    return {
      q: introTri3(nums) + ' Quelle est la plus ' + sup + ' valeur possible de cette somme commune ?',
      a: e(S), accept: null,
      choix: qcm(e(S), [e(trois), ent(T / 3), e(max ? S + 1 : S - 1)], vois(S)),
      expl: 'On additionne les trois côtés : chaque sommet y est compté deux fois, donc la somme commune dépend seulement des nombres placés aux sommets. ' +
        '3 × S = ' + e(T) + ' + (somme des sommets). Pour rendre S le plus ' + (max ? 'grand' : 'petit') + ' possible, on met aux sommets les trois plus ' + (max ? 'grands' : 'petits') + ' nombres : ' +
        plus(V) + ' = ' + e(SV) + ', d\'où 3 × S = ' + e(T + SV) + ' et S = ' + e(S) + '. ' +
        'C\'est bien réalisable : ' + ex.map(l => plus(l)).join(', ') + ' font tous ' + e(S) + '. ' +
        'Piège : ' + e(trois) + ' est la somme des trois plus ' + (max ? 'grands' : 'petits') + ' nombres sur un seul côté ; les trois côtés doivent être égaux.'
    };
  }
  /* croix 4 + 4 avec case commune, nombres a à a + 6 : piège de parité */
  const s = R.int(0, 14), nums = plage(1 + s, 7), T = som(nums), c = (max ? 6 : 2) + s, S = (T + c) / 2;
  const ext = max ? nums[6] : nums[0], quatre = max ? nums[3] + nums[4] + nums[5] + nums[6] : nums[0] + nums[1] + nums[2] + nums[3];
  const bras = (max ? [[1, 3, 7], [2, 4, 5]] : [[1, 5, 7], [3, 4, 6]]).map(l => l.map(x => x + s));
  const faux = max ? (T + ext + 1) / 2 : (T + ext - 1) / 2;
  return {
    q: introCroix(4, nums) + ' Quelle est la plus ' + sup + ' valeur possible de la somme de la ligne ?',
    a: e(S), accept: null,
    choix: qcm(e(S), [e(faux), e(quatre), ent(Math.round(T / 2))], vois(S)),
    expl: 'On additionne la ligne et la colonne : tous les nombres y sont une fois, et la case commune une seconde fois, donc 2 × S = total + case commune, qui doit être pair. ' +
      'Total : ' + e(T) + ', ' + (T % 2 ? 'impair' : 'pair') + '. La case commune doit donc être ' + (T % 2 ? 'impaire' : 'paire') + ' : le plus ' + (max ? 'grand' : 'petit') + ' nombre, ' + e(ext) +
      ', ne convient pas (on aurait S = ' + nb((T + ext) / 2, 1) + ', pas entier). On prend ' + e(c) + ', d\'où 2 × S = ' + e(T + c) + ' et S = ' + e(S) + '. ' +
      'C\'est réalisable : case commune ' + e(c) + ', ligne ' + e(c) + ' + ' + plus(bras[0]) + ' et colonne ' + e(c) + ' + ' + plus(bras[1]) + ', qui font toutes deux ' + e(S) + '. ' +
      'Piège : arrondir ' + nb((T + ext) / 2, 1) + ' en ' + e(faux) + ', ou additionner les quatre plus ' + (max ? 'grands' : 'petits') + ' nombres (' + e(quatre) + ').'
  };
}

function n4RangeeTotal(R){
  for (let essai = 0; essai < 60; essai++){
    const k = R.pick([3, 4, 5]), m = R.int(4, 12), N = m * k + 1, S = k === 3 ? R.int(12, 30) : (k === 4 ? R.int(15, 36) : R.int(20, 40));
    const x1 = R.int(1, S - 2), T = m * S + x1;
    const choix = R.int(1, 3), j = choix === 1 ? 1 : (choix === 2 ? N : k * R.int(2, m - 1) + 1);
    const nom = j === 1 ? 'la première case' : (j === N ? 'la dernière case (la case ' + N + ')' : 'la case ' + j);
    const moy = Math.round(T / N);
    if (moy === x1) continue;                       // la moyenne ne doit pas donner la réponse par hasard
    const fin = j === 1 ? ''
      : (j === N ? ' De même, les cases 1 à ' + (N - 1) + ' forment ' + m + ' blocs, donc la dernière case vaut aussi ' + e(T) + ' − ' + e(m * S) + ' = ' + e(x1) + '.'
                 : ' La rangée se répète toutes les ' + mot(k) + ' cases et ' + j + ' = ' + k + ' × ' + ((j - 1) / k) + ' + 1 a le même reste que 1 dans la division par ' + k + ', donc la case ' + j + ' contient la même chose que la première.');
    return {
      q: 'Dans une rangée de ' + N + ' cases numérotées de 1 à ' + N + ', on écrit un nombre entier dans chaque case. La somme de ' + mot(k) + ' cases voisines vaut toujours ' + S +
         ', et la somme des ' + N + ' nombres vaut ' + e(T) + '. Que contient ' + nom + ' ?',
      a: e(x1), accept: null,
      choix: qcm(e(x1), [e(x1 + S), ent(moy), ent(S - x1)], vois(x1)),
      expl: 'On découpe la rangée en blocs de ' + mot(k) + ' cases voisines, dont chacun vaut la somme connue, et on regarde la case qui reste. ' +
        N + ' = ' + k + ' × ' + m + ' + 1 : les cases 2 à ' + N + ' forment ' + m + ' blocs de ' + mot(k) + ' cases voisines, de somme ' + m + ' × ' + S + ' = ' + e(m * S) + '. ' +
        'La première case vaut donc ' + e(T) + ' − ' + e(m * S) + ' = ' + e(x1) + '.' + fin +
        ' Piège : compter un bloc de trop ou de moins (on trouverait ' + e(x1 + S) + ' avec un bloc de moins) ; la moyenne ' + e(moy) + ' ne sert à rien.'
    };
  }
  return null;
}

function n4Effectif(R){
  const t = R.int(1, 3);
  if (t <= 2){
    const n = R.pick(PART[2]), nums = plage(1, n), T = som(nums), H = T / 2;
    let m = 0, cum = 0; while (cum < H){ m++; cum += n - m + 1; }
    const grands = plage(n - m + 2, m - 1).reverse(), dernier = H - som(grands), groupe = grands.concat([dernier]);
    const cumAvant = som(grands);
    const base = 'Total : 1 + 2 + … + ' + n + ' = ' + n + ' × ' + (n + 1) + ' ÷ 2 = ' + e(T) + ', donc chaque groupe vaut ' + e(H) + '. ' +
      'Avec les ' + mot(m - 1) + ' plus grands nombres, on n\'atteint que ' + plus(grands) + ' = ' + e(cumAvant) + ', moins que ' + e(H) + ' : un groupe a donc au moins ' + m + ' nombres. ' +
      'Et ' + m + ' suffisent : ' + grp(groupe) + ' fait ' + e(H) + ', les autres nombres font aussi ' + e(H) + '. ';
    if (t === 1) return {
      q: 'On partage les entiers de 1 à ' + n + ' en deux groupes de même somme. Quel est le plus petit nombre d\'entiers que peut contenir l\'un des deux groupes ?',
      a: e(m), accept: null,
      choix: qcm(e(m), [e(m - 1), e(m + 1), ent(n / 2)], vois(m)),
      expl: 'Pour qu\'un groupe ait peu d\'éléments, on le remplit avec les plus grands nombres et on regarde quand on atteint la moitié du total. ' + base +
        'Piège : croire que les deux groupes ont autant d\'éléments' + (n % 2 ? '' : ' (' + (n / 2) + ' chacun)') + ' ; seule la somme compte.'
    };
    return {
      q: 'On partage les entiers de 1 à ' + n + ' en deux groupes de même somme. Quel est le plus grand nombre d\'entiers que peut contenir l\'un des deux groupes ?',
      a: e(n - m), accept: null,
      choix: qcm(e(n - m), [e(n - m + 1), ent(n / 2), e(n - m - 1)], vois(n - m)),
      expl: 'Le groupe le plus fourni est celui qui reste quand l\'autre a le moins d\'éléments possible : on remplit l\'autre avec les plus grands nombres. ' + base +
        'Le groupe le plus fourni a donc au plus ' + n + ' − ' + m + ' = ' + e(n - m) + ' nombres, et l\'exemple montre que c\'est atteint. ' +
        'Piège : répondre ' + e(n - m + 1) + ' en oubliant que l\'autre groupe a besoin d\'au moins ' + m + ' nombres.'
    };
  }
  const n = R.pick([6, 8, 9, 11, 12, 14, 15]), nums = plage(1, n), T = som(nums), t3 = T / 3;
  let m = 0, cum = 0; while (cum < t3){ m++; cum += n - m + 1; }
  const p = combinaisons(nums, m, t3);
  if (!p) return null;
  const grands = plage(n - m + 2, m - 1).reverse();
  return {
    q: 'On partage les entiers de 1 à ' + n + ' en trois groupes de même somme. Quel est le plus petit nombre d\'entiers que peut contenir l\'un des trois groupes ?',
    a: e(m), accept: null,
    choix: qcm(e(m), [e(m - 1), e(m + 1), ent(n / 3)], vois(m)),
    expl: 'Pour qu\'un groupe ait peu d\'éléments, on le remplit avec les plus grands nombres et on regarde quand on atteint le tiers du total. ' +
      'Total : ' + n + ' × ' + (n + 1) + ' ÷ 2 = ' + e(T) + ', donc chaque groupe vaut ' + e(t3) + '. ' +
      (m > 1 ? 'Avec ' + (m - 1 === 1 ? 'le seul plus grand nombre' : 'les ' + mot(m - 1) + ' plus grands nombres') + ', on n\'atteint que ' + e(som(grands)) + ', moins que ' + e(t3) + ' : il faut au moins ' + m + ' nombres. ' : '') +
      'Et ' + m + ' suffisent : ' + p.map(grp).join(', ') + ' font chacun ' + e(t3) + '. ' +
      'Piège : croire que les groupes ont forcément autant d\'éléments ; seule la somme compte.'
  };
}

/* =====================================================  NIVEAU 5  ===================================================== */
function n5Algebre(R){
  for (let essai = 0; essai < 60; essai++){
    const g = carreAlea(R, 10, 30, 12), troisieme = R.pick([[1, 7], [3, 5]]);
    const rev = [R.pick([0, 8]), R.pick([2, 6]), R.pick(troisieme)];
    if (LIGNES.some(L => L.every(i => rev.indexOf(i) >= 0))) continue;
    const bords = troisieme[0] === 1 ? [0, 2] : [3, 5];               // lignes de bord entièrement couvertes (cases connues ou opposées)
    const info = bords.map(j => {
      const L = LIGNES[j], q = L.filter(i => rev.indexOf(i) < 0).length;
      return {j, L, q};
    }).sort((u, w) => u.q - w.q)[0];
    const m = g[4], S = 3 * m;
    let K = 0;
    const termes = info.L.map(i => {
      if (rev.indexOf(i) >= 0){ K += g[i]; return e(g[i]); }
      K -= g[opp(i)]; return '(2m − ' + e(g[opp(i)]) + ')';
    });
    const coef = 2 * info.q, lin = coef + 'm' + (K > 0 ? ' + ' + e(K) : (K < 0 ? ' − ' + e(-K) : ''));
    const resol = coef === 2 ? 'donc m = ' + e(m) : (coef === 4 ? 'donc m = ' + e(m) : 'donc 3m = ' + e(-K) + ' et m = ' + e(m));
    const opps = info.L.filter(i => rev.indexOf(i) < 0).map(i => cap(NOM_CASE[i]) + (i % 2 ? ' est opposée ' : ' est opposé ') + aCase(opp(i)) + ', donc ' + (i % 2 ? 'elle' : 'il') + ' vaut 2m − ' + e(g[opp(i)]) + '.');
    const cachees = [0, 1, 2, 3, 5, 6, 7, 8].filter(i => rev.indexOf(i) < 0);
    const somRev = som(rev.map(i => g[i]));
    if (somRev === S) continue;                     // additionner les cases connues ne doit pas tomber juste par hasard
    const demandeCentre = R.int(0, 1) === 1;
    const intro = 'Dans ce carré magique 3 × 3, les trois lignes, les trois colonnes et les deux diagonales ont la même somme. On ne connaît que trois cases ; les « ? » sont cachées.\n';
    const debut = 'Appelle m le centre : la somme magique vaut 3m et deux cases opposées par rapport au centre ont pour somme 2m ; cherche une ligne de bord où tout s\'écrit avec m. ';
    const corps = opps.join(' ') + ' ' + cap(NOM_LIGNE[info.j]) + ' donne : ' + termes.join(' + ') + ' = 3m, soit ' + lin + ' = 3m, ' + resol + '. ';
    if (demandeCentre) return {
      q: intro + grille(g, rev, 4) + '\nQuelle est la valeur de x ?',
      a: e(m), accept: null,
      choix: qcm(e(m), [e(S), ent(Math.round(somRev / 3)), ent(g[R.pick(cachees)])], vois(m)),
      expl: debut + corps + 'Le centre x vaut ' + e(m) + ' (la somme magique vaut ' + e(S) + '). ' +
        'Piège : prendre la moyenne des cases connues (' + nb(somRev / 3, 1) + ') ou la somme magique pour le centre.'
    };
    return {
      q: intro + grille(g, rev, -1) + '\nQuelle est la somme magique de ce carré ?',
      a: e(S), accept: null,
      choix: qcm(e(S), [e(m), e(somRev), e(2 * m)], vois(S)),
      expl: debut + corps + 'La somme magique vaut 3 × ' + e(m) + ' = ' + e(S) + '. ' +
        'Piège : additionner les trois cases connues (' + e(somRev) + ') alors qu\'elles ne forment pas une ligne, ou répondre le centre ' + e(m) + '.'
    };
  }
  return null;
}

function n5Perimetre(R){
  const max = R.int(0, 1) === 1, sup = max ? 'grande' : 'petite';
  if (R.int(0, 1) === 1){
    /* carré : 4 coins + 4 milieux, nombres a à a + 7 : 4S = total + coins, divisibilité par 4 */
    const s = R.int(0, 14), nums = plage(1 + s, 8), T = som(nums);
    const ext = max ? nums[4] + nums[5] + nums[6] + nums[7] : nums[0] + nums[1] + nums[2] + nums[3];
    const C = max ? 24 + 4 * s : 12 + 4 * s, S = (T + C) / 4;
    const coins = (max ? [3, 7, 6, 8] : [1, 3, 2, 6]).map(x => x + s), mil = (max ? [5, 2, 1, 4] : [8, 7, 4, 5]).map(x => x + s);
    const cotes = [0, 1, 2, 3].map(i => plus([coins[i], mil[i], coins[(i + 1) % 4]]));
    const faux = max ? Math.ceil((T + ext) / 4) : Math.floor((T + ext) / 4);
    const trois = max ? nums[5] + nums[6] + nums[7] : nums[0] + nums[1] + nums[2];
    return {
      q: 'On place les huit nombres ' + (s === 0 ? 'de 1 à 8' : 'de ' + nums[0] + ' à ' + nums[7]) + ' autour d\'un carré : un nombre à chaque coin et un nombre au milieu de chaque côté, chacun une seule fois. ' +
         'Chaque côté porte ainsi trois nombres (deux coins et un milieu), et les quatre côtés doivent avoir la même somme. Quelle est la plus ' + sup + ' valeur possible de cette somme ?',
      a: e(S), accept: null,
      choix: qcm(e(S), [e(faux), e(trois), ent(T / 4)], vois(S)),
      expl: 'On additionne les quatre côtés : chaque coin y est compté deux fois, donc 4 × S = total + (somme des coins), et ce nombre doit être un multiple de 4. ' +
        'Total : ' + e(T) + ', qui est un multiple de 4, donc la somme des coins doit aussi en être un. Avec les quatre plus ' + (max ? 'grands' : 'petits') + ' nombres aux coins, elle vaudrait ' + e(ext) +
        ', qui n\'est pas un multiple de 4 (S vaudrait ' + nb((T + ext) / 4, 1) + '). La valeur la plus ' + (max ? 'grande' : 'petite') + ' qui convient est ' + e(C) + ', d\'où 4 × S = ' + e(T + C) + ' et S = ' + e(S) + '. ' +
        'C\'est réalisable : côtés ' + cotes.join(', ') + ', qui font tous ' + e(S) + '. ' +
        'Piège : arrondir ' + nb((T + ext) / 4, 1) + ' en ' + e(faux) + ' ; une somme qui ne tombe pas juste est impossible.'
    };
  }
  /* triangle : 3 sommets + 2 nombres par côté, nombres a à a + 8 */
  const s = R.int(0, 11), nums = plage(1 + s, 9), T = som(nums);
  const V = (max ? [7, 8, 9] : [1, 2, 3]).map(x => x + s), SV = som(V), S = (T + SV) / 3;
  const cotes = (max ? [[7, 3, 5, 8], [8, 4, 2, 9], [9, 1, 6, 7]] : [[1, 6, 8, 2], [2, 7, 5, 3], [3, 4, 9, 1]]).map(l => plus(l.map(x => x + s)));
  const quatre = max ? nums[5] + nums[6] + nums[7] + nums[8] : nums[0] + nums[1] + nums[2] + nums[3];
  return {
    q: introTri4(nums) + ' Quelle est la plus ' + sup + ' valeur possible de cette somme commune ?',
    a: e(S), accept: null,
    choix: qcm(e(S), [e(quatre), e(T / 3), e(SV)], vois(S)),
    expl: 'On additionne les trois côtés : chaque sommet y est compté deux fois, donc la somme commune ne dépend que des sommets. ' +
      'Total : (' + e(nums[0]) + ' + ' + e(nums[8]) + ') × 9 ÷ 2 = ' + e(T) + ', et 3 × S = ' + e(T) + ' + (somme des sommets). ' +
      'Les sommets les plus ' + (max ? 'grands' : 'petits') + ' sont ' + listeFr(V) + ', de somme ' + e(SV) + ' : 3 × S = ' + e(T + SV) + ', qui se divise bien par 3, et S = ' + e(S) + '. ' +
      'C\'est réalisable : côtés ' + cotes.join(', ') + ', qui font tous ' + e(S) + '. ' +
      'Piège : ' + e(quatre) + ' met les quatre plus ' + (max ? 'grands' : 'petits') + ' nombres sur un seul côté, ce qui empêche les deux autres d\'être égaux ; ' + e(T / 3) + ' oublie que les sommets comptent deux fois.'
  };
}

function n5RangeeReste(R){
  for (let essai = 0; essai < 60; essai++){
    const k = R.pick([3, 4]), m = R.int(8, 20), N = m * k + k - 1, S = k === 3 ? R.int(12, 30) : R.int(16, 36);
    const w = []; let reste = S;
    for (let i = 0; i < k - 1; i++){ const v = R.int(1, Math.max(1, reste - (k - 1 - i) - 1)); w.push(v); reste -= v; }
    w.push(reste);
    if (reste < 1 || 2 * reste === S) continue;     // la somme des cases qui dépassent ne doit pas égaler la réponse
    const wk = w[k - 1], T = m * S + S - wk, j = k * R.int(2, m), debut = T - m * S;
    return {
      q: 'Dans une rangée de ' + N + ' cases numérotées de 1 à ' + N + ', on écrit un nombre entier dans chaque case. La somme de ' + mot(k) + ' cases voisines vaut toujours ' + S +
         ', et la somme des ' + N + ' nombres vaut ' + e(T) + '. Que contient la case ' + j + ' ?',
      a: e(wk), accept: null,
      choix: qcm(e(wk), [e(debut), ent(Math.round(T / N)), ent(Math.round(S / k))], vois(wk)),
      expl: 'La rangée se répète toutes les ' + mot(k) + ' cases ; on la découpe en blocs de ' + mot(k) + ' cases voisines et on regarde ce qui dépasse. ' +
        N + ' = ' + k + ' × ' + m + ' + ' + (k - 1) + ' : les cases 1 à ' + (k * m) + ' forment ' + m + ' blocs, de somme ' + m + ' × ' + S + ' = ' + e(m * S) + '. ' +
        'Les ' + mot(k - 1) + ' dernières cases valent donc ' + e(T) + ' − ' + e(m * S) + ' = ' + e(debut) + ', et elles répètent les cases 1 à ' + (k - 1) + '. ' +
        'Comme les cases 1 à ' + k + ' font ' + S + ', la case ' + k + ' vaut ' + S + ' − ' + e(debut) + ' = ' + e(wk) + '. Enfin ' + j + ' est un multiple de ' + k + ', comme ' + k + ', donc la case ' + j + ' contient ' + e(wk) + '. ' +
        'Piège : s\'arrêter à ' + e(debut) + ', qui est la somme des cases qui dépassent, pas la case demandée.'
    };
  }
  return null;
}

function n5Compter(R){
  if (R.int(0, 2) > 0){
    const N = R.int(10, 60);
    let ans = 0, m4 = 0, m3 = 0; for (let n = 1; n <= N; n++){ if (n % 4 === 0){ ans++; m4++; } if (n % 4 === 3){ ans++; m3++; } }
    return {
      q: 'Parmi les entiers n de 1 à ' + N + ' (1 et ' + N + ' compris), combien permettent de partager les entiers de 1 à n en deux groupes de même somme ?',
      a: e(ans), accept: null,
      choix: qcm(e(ans), [e(m4), e(Math.floor(N / 2)), e(m3)], vois(ans)),
      expl: 'Il faut d\'abord que la somme 1 + 2 + … + n = n × (n + 1) ÷ 2 soit paire, puis vérifier que cette condition suffit. ' +
        'Elle est paire exactement quand n × (n + 1) est un multiple de 4, c\'est-à-dire quand n ou n + 1 est un multiple de 4 (n = 3, 4, 7, 8, 11, 12, …). ' +
        'Elle suffit : si n est un multiple de 4, on range les nombres par blocs de quatre a, a + 1, a + 2, a + 3 et on met a et a + 3 d\'un côté, a + 1 et a + 2 de l\'autre ; ' +
        'si n + 1 est un multiple de 4, on met 1 et 2 face à 3, puis on traite les nombres de 4 à n par blocs de quatre. ' +
        'De 1 à ' + N + ', il y a ' + m4 + ' multiples de 4 et ' + m3 + ' entiers n dont le suivant est un multiple de 4, soit ' + ans + '. ' +
        'Piège : ne garder qu\'une des deux familles, en oubliant les cas comme n = 3 ou n = 7 (on trouve ' + m4 + '), ou les multiples de 4 eux-mêmes (on trouve ' + m3 + ')' +
        (Math.floor(N / 2) !== ans ? ' ; croire qu\'il suffit que n soit pair donne ' + Math.floor(N / 2) + '.' : '.')
    };
  }
  const N = R.int(10, 30);
  let ans = 0, m3 = 0, petits = 0;
  for (let n = 1; n <= N; n++){ if (n % 3 !== 1){ if (n >= 5) ans++; else if (n > 1) petits++; } if (n % 3 === 0) m3++; }
  return {
    q: 'Parmi les entiers n de 1 à ' + N + ' (1 et ' + N + ' compris), combien permettent de partager les entiers de 1 à n en trois groupes de même somme ?',
    a: e(ans), accept: null,
    choix: qcm(e(ans), [e(ans + petits), e(m3), e(ans - 1)], vois(ans)),
    expl: 'Il faut que la somme n × (n + 1) ÷ 2 soit divisible par 3 et que le plus grand nombre n ne dépasse pas le tiers de cette somme, puis vérifier que cela suffit. ' +
      'La somme est divisible par 3 quand n ou n + 1 est un multiple de 3. Les cas n = 2 (somme 3, il faudrait trois groupes de 1) et n = 3 (somme 6, groupes de 2, mais 3 est trop grand) échouent. ' +
      'À partir de 5, tout marche : {5}, {1, 4}, {2, 3} pour n = 5 ; {1, 6}, {2, 5}, {3, 4} pour n = 6 ; {4, 8}, {5, 7}, {1, 2, 3, 6} pour n = 8 ; {6, 9}, {7, 8}, {1, 2, 3, 4, 5} pour n = 9 ; ' +
      'et on passe de n à n + 6 en ajoutant les paires (n + 1, n + 6), (n + 2, n + 5), (n + 3, n + 4), une par groupe. ' +
      'On compte donc les n de 5 à ' + N + ' qui ne laissent pas le reste 1 dans la division par 3 : ' + ans + '. ' +
      'Piège : compter aussi n = 2 et n = 3, où la somme est divisible par 3 mais le partage impossible (on trouve ' + (ans + petits) + '), ou rejeter n = 5 alors que 5 peut former un groupe à lui seul (on trouve ' + (ans - 1) + ').'
  };
}

function n5Coins(R){
  const d = R.pick([1, 2, 3, 4, 5, 10]), a = R.int(1, 20), t = i => a + (i - 1) * d, max = R.int(0, 1) === 1;
  const ans = max ? t(8) : t(2);
  return {
    q: 'Un carré magique 3 × 3 (lignes, colonnes et diagonales de même somme) est rempli avec ' + suiteTxt(a, d, 9) + ', chacun une seule fois. ' +
       'Quel est le plus ' + (max ? 'grand' : 'petit') + ' de ces nombres qui peut se trouver dans un coin du carré ?',
    a: e(ans), accept: null,
    choix: qcm(e(ans), max ? [e(t(9)), e(t(7)), e(t(5))] : [e(t(1)), e(t(3)), e(t(5))], vois(ans)),
    expl: 'Ramène-toi au carré magique des entiers de un à neuf, dont tu connais la structure, puis cherche quels rangs peuvent occuper un coin. ' +
      'Range les nombres du 1er au 9e : comme ils sont régulièrement espacés, tout se passe comme avec 1, 2, …, 9, où la somme magique vaut 15, le centre 5 et deux cases opposées font 10. ' +
      'Un coin est sur trois lignes : sa ligne, sa colonne et sa diagonale. Si 1 était dans un coin, 9 serait en face, et sa ligne comme sa colonne demanderaient deux nombres de somme 14 sans 5 ni 9 : seule la paire 6 et 8 convient, impossible deux fois. ' +
      'De même, 3 dans un coin demanderait deux fois la paire 4 et 8 (somme 12 sans 5 ni 7). Donc 1, 3, 7 et 9 ne sont jamais dans un coin, et 5 est au centre : les coins portent 2, 4, 6 et 8, par exemple 2, 9, 4 / 7, 5, 3 / 6, 1, 8. ' +
      'Ici, le ' + (max ? '8e' : '2e') + ' nombre de la liste est ' + e(ans) + '. ' +
      'Piège : répondre ' + e(max ? t(9) : t(1)) + ', le plus ' + (max ? 'grand' : 'petit') + ' de tous, qui ne peut être qu\'au milieu d\'un bord.'
  };
}

/* ---------- secours (jamais d'exception) ---------- */
function secours(){
  return {
    q: 'Un carré magique 3 × 3 est rempli avec les neuf entiers de 1 à 9, chacun une seule fois. Ses trois lignes, ses trois colonnes et ses deux diagonales ont toutes la même somme. Quelle est cette somme ?',
    a: '15', accept: null, choix: ['15', '45', '5', '30'],
    expl: 'On calcule la somme de tous les nombres de la grille, puis on la partage entre les trois lignes. 1 + 2 + … + 9 = 9 × 10 ÷ 2 = 45, donc chaque ligne vaut 45 ÷ 3 = 15. Piège : 45 est la somme de toute la grille, et 5 la case centrale.'
  };
}

const GEN = {
  1: [n1Constante, n1Completer, n1Partage, n1Tableau],
  2: [n2Carre, n2Triangle, n2Ecart, n2Rangee],
  3: [n3Centre, n3Triangle4, n3Rangee, n3Croix],
  4: [n4Carre, n4MaxMin, n4RangeeTotal, n4Effectif],
  5: [n5Algebre, n5Perimetre, n5RangeeReste, n5Compter, n5Coins]
};

A.push({
  id: 'alb-26-grilles',
  phase: 'albert',
  ordre: 26,
  theme: 'logique',
  titre: 'Grilles et placements de nombres',
  objectif: 'Trouver une somme commune, une case cachée ou une valeur extrême dans un carré magique, une figure à sommes égales ou une rangée, en comptant au lieu de tâtonner.',
  lecon:
`<p class="lede">Dans ces questions, on place des nombres dans une grille ou sur une figure pour que plusieurs sommes soient égales : carré magique, triangle ou croix dont les côtés ont la même somme, rangée où des cases voisines ont toujours le même total. La clé : on ne cherche presque jamais le placement complet. On <mark>additionne toutes les sommes égales d'un coup</mark> et on compte combien de fois chaque case y apparaît.</p>
<h3>Ce que le test demande</h3>
<p>Au test, la grille risque d'être décrite seulement par du texte, ligne par ligne, avec des « ? » pour les cases cachées. On te demande la somme commune, la valeur d'une case, la plus grande somme possible, ou ce que contient une case lointaine d'une rangée. La même idée sert pour partager des entiers en groupes de même somme, ou pour compléter un tableau dont on connaît les sommes des lignes et des colonnes. Les essais au hasard prennent trop de temps : en deux ou trois minutes, il faut une idée de comptage.</p>
<h3>Les prérequis</h3>
<div class="formule"><p>1 + 2 + … + n = n × (n + 1) ÷ 2</p><p>somme de nombres régulièrement espacés = (premier + dernier) × nombre de termes ÷ 2</p></div>
<p>Exemples : 1 + 2 + … + 9 = 9 × 10 ÷ 2 = 45 ; 11 + 12 + … + 18 = (11 + 18) × 8 ÷ 2 = 116.</p>
<p>Un <strong>carré magique</strong> est une grille carrée dont toutes les lignes, toutes les colonnes et les deux diagonales ont la même somme, appelée <strong>somme magique</strong>. Pour un carré 3 × 3 :</p>
<table class="tbl">
<tr><th>Propriété</th><th>Pourquoi</th></tr>
<tr><td>somme magique S = total ÷ 3</td><td>les trois lignes se partagent toute la grille</td></tr>
<tr><td>centre = S ÷ 3</td><td>les quatre lignes qui passent par le centre font 4 × S = total + 3 × centre</td></tr>
<tr><td>deux cases opposées font 2 × centre</td><td>case + centre + case opposée = S = 3 × centre</td></tr>
</table>
<h3>La méthode</h3>
<div class="etapes">
<p><strong>1. Je calcule la somme totale</strong> des nombres à placer, avec la formule, jamais terme à terme.</p>
<p><strong>2. J'additionne toutes les sommes égales</strong> (lignes, côtés, branches) et je compte combien de fois chaque case est utilisée : une case commune à deux sommes compte deux fois.</p>
<p><strong>3. J'écris l'égalité</strong> : nombre de sommes × S = total + cases comptées en plus. J'en tire ce qu'on me demande.</p>
<p><strong>4. Je pars de la case la plus contrainte</strong> : une ligne où il ne manque qu'une case, le centre d'un carré magique, ou une case qui se répète dans une rangée.</p>
</div>
<h3>Exemples résolus</h3>
<p><strong>Exemple 1.</strong> Un carré magique 3 × 3 contient les nombres 2, 4, 6, …, 18. Total : (2 + 18) × 9 ÷ 2 = 90. Les trois lignes se partagent 90, donc la somme magique vaut 30.</p>
<p><strong>Exemple 2.</strong> On place 1, 2, 3, 4, 5 et 6 sur un triangle, un nombre par sommet et un au milieu de chaque côté ; les trois côtés ont la même somme S et les sommets portent 2, 4 et 6. En additionnant les trois côtés, chaque sommet est compté deux fois : 3 × S = 21 + (2 + 4 + 6) = 33, donc S = 11.</p>
<p><strong>Exemple 3.</strong> Dans une rangée de 20 cases, trois cases voisines font toujours 18 ; la case 1 contient 4 et la case 2 contient 9. Les groupes « cases 1, 2, 3 » et « cases 2, 3, 4 » ont la même somme, donc la case 4 est égale à la case 1 : la rangée se répète de 3 en 3. La case 3 vaut 18 − 4 − 9 = 5, et 15 est un multiple de 3 comme 3 : la case 15 contient 5.</p>
<p><strong>Exemple 4 (niveau du test).</strong> Dans un carré magique 3 × 3, le coin en haut à gauche vaut 6 et le coin en bas à droite vaut 14. Ces cases sont opposées : 6 + 14 = 2 × centre, donc le centre vaut 10 et la somme magique 30. Si la case du milieu en haut vaut 13, le coin en haut à droite vaut 30 − 6 − 13 = 11.</p>
<h3>Les réflexes sans calculatrice</h3>
<p>Pour une plus grande (ou plus petite) somme possible, mets les plus grands (ou plus petits) nombres sur les cases comptées deux fois, puis vérifie que la division tombe juste. Sinon, descends (ou monte) jusqu'à la première valeur qui marche, et cherche un exemple.</p>
<p>Dans une rangée où k cases voisines font toujours la même somme, seul compte le reste du numéro de la case dans la division par k.</p>
<p>Partages en groupes : chaque groupe vaut total ÷ nombre de groupes. Si un groupe dépasse l'autre de d, le plus petit vaut (total − d) ÷ 2 ; si l'un vaut le triple de l'autre, compte 4 parts. Pour qu'un groupe ait le moins de nombres possible, remplis-le avec les plus grands. Un partage est impossible si la division ne tombe pas juste.</p>
<p>Tableau : le total se calcule par les lignes ou par les colonnes ; la somme qui manque est la différence.</p>
<p>Avec les choix : une somme qui n'est pas entière, ou une valeur qui n'est pas dans la liste des nombres à placer, s'élimine tout de suite. Une case trouvée se vérifie sur une deuxième ligne.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Additionne toutes les sommes égales d'un coup et compte combien de fois chaque case y figure : nombre de sommes × S = total des nombres + cases comptées en plus.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Faire des essais au hasard : c'est long et tu n'es jamais sûr d'avoir tout essayé. Oublier qu'une case commune (sommet, centre, case partagée) compte deux fois : on trouve total ÷ nombre de sommes, trop petit. Prendre la somme magique pour le centre : le centre vaut S ÷ 3. Garder une somme qui ne tombe pas juste : elle est impossible.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Carré magique 3 × 3 : S = total ÷ 3, centre = S ÷ 3, deux cases opposées = 2 × centre. Figure à cases partagées : nombre de sommes × S = total + cases partagées. Rangée : elle se répète, avec une période égale au nombre de cases voisines. Partage en groupes de même somme : chaque groupe vaut total ÷ nombre de groupes.</p></div>`,
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
