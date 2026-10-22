/* ===== Maths · Objectif Albert School : alb-04 · Ordres de grandeur, encadrements et comparaisons =====
   Fichier frère de skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS (aucun symbole global).
   gen(level, R) rend un QCM { q, a, accept: null, choix: [4], expl } ; n'utilise que R.int, R.pick, R.shuffle.
   Niveaux : 1 découverte (1 min), 2 maîtrise, 3 niveau des exemples officiels, 4 au-dessus, 5 haut du test adaptatif.
   Toutes les réponses sont CALCULÉES (aucune banque d'énigmes fixes). Les questions « le plus proche de » proposent
   des choix séparés d'un facteur 10 (ou √10) : la bonne réponse est la plus proche en écart ET en rapport.
   Typographie : milliers séparés par U+202F ; les années (2012 à 2040) restent collées ; exposants en chiffres
   Unicode (2³⁰, 10⁻³). */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (privées à ce fichier) ---------- */
/* Même normalisation que normStr (core/pedagogie.js:13). */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
function grp(ip){ return ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
/* Nombre à la française : d décimales au plus (2 par défaut), virgule, U+202F pour les milliers, vrai signe moins. */
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + grp(p[0]) + (p[1] ? ',' + p[1] : '');
}
const ent = x => nb(x, 0);
/* Décimal exact m × 10^e (m entier) : aucune erreur d'arrondi. */
function dec(m, e){
  const neg = m < 0; let s = String(Math.abs(m)), ip, fp = '';
  if (e >= 0) ip = s + '0'.repeat(e);
  else { const k = -e; s = s.padStart(k + 1, '0'); ip = s.slice(0, s.length - k); fp = s.slice(s.length - k).replace(/0+$/, ''); }
  ip = ip.replace(/^0+(?=\d)/, '');
  return (neg ? '−' : '') + grp(ip) + (fp ? ',' + fp : '');
}
function pgcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a || 1; }
/* Valeur numérique d'un choix, comme le banc (pour refuser 0,5 et 1/2 ensemble). */
function val(s){ const m = /^([+-]?\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/.exec(norm(s)); return m ? (m[2] ? +m[1] / +m[2] : +m[1]) : null; }
/* QCM : la bonne réponse, puis les distracteurs pédagogiques, puis des voisins jusqu'à 4 choix distincts
   (distincts au sens de normStr ET par la valeur). */
function qcm(bonne, autres, voisin){
  const ch = [], vs = [], ns = new Set();
  const ajouter = c => {
    if (ch.length >= 4 || c == null) return;
    c = String(c);
    if (!c.trim() || /NaN|Infinity|undefined|null/.test(c)) return;
    const n = norm(c), v = val(c);
    if (ns.has(n) || (v !== null && vs.some(w => Math.abs(w - v) < 1e-9))) return;
    ns.add(n); if (v !== null) vs.push(v); ch.push(c);
  };
  ajouter(bonne);
  (autres || []).forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 200; k++) ajouter(voisin ? voisin(k) : null);
  return ch;
}
const pm = k => (k % 2 ? 1 : -1) * Math.ceil(k / 2);              // 1, −1, 2, −2, 3…
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));
const ex = (q, a, choix, expl) => ({ q, a, accept: null, choix, expl });
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function sup(n){ return (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map(c => SUP[+c]).join(''); }
const pw = (b, e) => String(b) + sup(e);                           // 2³⁰
const p10 = k => '10' + sup(k);                                    // 10⁷, 10⁻³
/* m × 10^k en écriture scientifique (m : chaîne ou nombre ; « 10⁷ » quand m = 1). */
function sci(m, k){
  const ms = typeof m === 'string' ? m : nb(m, 2);
  if (k === 0) return ms;
  return (ms === '1' ? '' : ms + ' × ') + p10(k);
}
/* Arrondi à un chiffre significatif : v ≈ m × 10^k, m entier de 1 à 9. */
function arr1(v){
  let k = Math.floor(Math.log10(v));
  if (v / Math.pow(10, k) >= 10) k++;
  if (v / Math.pow(10, k) < 1) k--;
  let m = Math.round(v / Math.pow(10, k));
  if (m === 10){ m = 1; k++; }
  return { m, k };
}
/* Mantisse et exposant : v = M × 10^K avec 1 ≤ M < 10. */
function mant(v){
  let K = Math.floor(Math.log10(v));
  if (v / Math.pow(10, K) >= 10) K++;
  if (v / Math.pow(10, K) < 1) K--;
  return { M: v / Math.pow(10, K), K };
}
/* Arrondi à deux chiffres significatifs (7 746 → 7 700 ; 4,47 → 4,5). */
const ro2 = x => { const k = Math.floor(Math.log10(x)) - 1, f = Math.pow(10, k); return k >= 0 ? Math.round(x / f) * f : Math.round(x / f) / Math.round(1 / f); };
const isqrt = n => { let a = Math.floor(Math.sqrt(n)); while (a * a > n) a--; while ((a + 1) * (a + 1) <= n) a++; return a; };
const nchif = n => String(Math.round(Math.abs(n))).length;          // chiffres d'un entier « petit »
/* Nombre de chiffres de 2^n par 2¹⁰ = 1 024 ≈ 10³ : 2^n = 2^r × 1,024^q × 10^(3q). */
function ch2(n){
  const q = Math.floor(n / 10), r = n % 10, X = Math.pow(2, r) * Math.pow(1.024, q);
  return { q, r, X, D: 3 * q + Math.floor(Math.log10(X)) + 1 };
}
/* Écriture « 2³⁷ = 2⁷ × (2¹⁰)³ » pour les explications. */
function paquets2(n){
  const q = Math.floor(n / 10), r = n % 10;
  return pw(2, n) + ' = ' + (r ? (r === 1 ? '2' : pw(2, r)) + ' × ' : '') + (q === 1 ? pw(2, 10) : '(2¹⁰)' + sup(q));
}
const liste = t => t.slice(0, -1).join(' ; ') + ' et ' + t[t.length - 1];   // « a ; b ; c et d »
/* Choix « puissances de 10 » autour de l'exposant k : k − 1, k, k + 1 et k + 2 (ou k − 2). */
function expoVoisins(R, k, kmin){
  const l = [k - 1, k + 1];
  l.push(k - 2 >= kmin && R.int(0, 1) ? k - 2 : k + 2);
  return l.filter(j => j >= kmin);
}

/* =====================================================
   NIVEAU 1 · découverte
   ===================================================== */

/* 1a · Un produit est le plus proche de quelle puissance de 10 ? */
function n1Produit(R){
  let a = 49, b = 2010, Ar = 50, Br = 2000, v = a * b, k = 5, m = 1;
  for (let t = 0; t < 200; t++){
    const A0 = R.pick([2, 3, 4, 5, 6, 7, 8, 9]) * Math.pow(10, R.int(1, 2));
    const B0 = R.pick([2, 3, 4, 5, 6, 8]) * Math.pow(10, R.int(2, 3));
    const a0 = A0 + (A0 < 100 ? R.pick([-3, -2, -1, 1, 2, 3]) : R.pick([-4, -3, -2, -1, 1, 2, 3, 4]) * R.pick([1, 2]));
    const b0 = B0 + R.pick([-1, 1]) * R.pick([1, 2, 3, 5]) * (B0 >= 1000 ? 10 : 1);
    const v0 = a0 * b0, r1 = arr1(v0), r0 = v0 / (r1.m * Math.pow(10, r1.k));
    if (r0 < 0.75 || r0 > 1.34 || arr1(A0 * B0).m !== r1.m) continue;
    a = a0; b = b0; Ar = A0; Br = B0; v = v0; k = r1.k; m = r1.m; break;
  }
  const forme = R.int(1, 3), u = forme === 2 ? ' €' : '', f = j => ent(m * Math.pow(10, j)) + u;
  const q = forme === 1 ? 'Parmi ces nombres, lequel est le plus proche de ' + ent(a) + ' × ' + ent(b) + ' ?'
    : forme === 2 ? 'Un magasin vend ' + ent(a) + ' articles à ' + ent(b) + ' € pièce. Parmi ces montants, lequel est le plus proche de la recette totale ?'
    : 'Une salle de spectacle de ' + ent(b) + ' places affiche complet pendant ' + ent(a) + ' soirs. Parmi ces nombres, lequel est le plus proche du nombre total de spectateurs ?';
  const autres = expoVoisins(R, k, 1).map(f);
  return ex(q, f(k), qcm(f(k), autres, j => f(k + 2 + j)),
    'On arrondit chaque facteur à un nombre rond, on multiplie les chiffres non nuls puis on compte les zéros. ' + ent(a) + ' ≈ ' + ent(Ar) + ' et ' + ent(b) + ' ≈ ' + ent(Br) + ', donc le produit vaut environ ' + ent(Ar) + ' × ' + ent(Br) + ' = ' + ent(Ar * Br) + ' (valeur exacte : ' + ent(v) + '). Le choix le plus proche est ' + f(k) + '. Piège : un zéro oublié ou en trop donne ' + f(k - 1) + ' ou ' + f(k + 1) + '.');
}

/* 1b · Un quotient est le plus proche de… */
function n1Quotient(R){
  const forme = R.int(1, 3);
  let N = 8012, d = 39, d0 = 40, N0 = 8000, m = 2, j = 2;
  for (let t = 0; t < 200; t++){
    const dd0 = forme === 3 ? R.pick([40, 50, 60, 80]) : R.pick([20, 30, 40, 50, 60, 80]);
    const mm = R.pick([2, 3, 4, 5, 6, 8]), jj = forme === 3 ? 1 : R.int(1, 3);
    const NN0 = mm * Math.pow(10, jj) * dd0, dd = dd0 + R.pick([-2, -1, 1, 2]);
    const NN = NN0 + R.pick([-1, 1]) * R.int(1, 9) * Math.pow(10, Math.max(0, nchif(NN0) - 3));
    const r = (NN / dd) / (mm * Math.pow(10, jj));
    if (r < 0.75 || r > 1.33) continue;
    N = NN; d = dd; d0 = dd0; N0 = NN0; m = mm; j = jj; break;
  }
  const u = forme === 2 ? ' €' : forme === 3 ? ' h' : '', f = i => ent(m * Math.pow(10, i)) + u;
  const q = forme === 1 ? 'Parmi ces nombres, lequel est le plus proche de ' + ent(N) + ' ÷ ' + d + ' ?'
    : forme === 2 ? 'Une prime de ' + ent(N) + ' € est partagée équitablement entre ' + d + ' salariés. Parmi ces montants, lequel est le plus proche de la part de chacun ?'
    : 'Un camion parcourt ' + ent(N) + ' km à la vitesse moyenne de ' + d + ' km/h. Parmi ces durées, laquelle est la plus proche de la durée du trajet ?';
  const autres = expoVoisins(R, j, 0).map(f);
  return ex(q, f(j), qcm(f(j), autres, i => f(j + 2 + i)),
    'On remplace le diviseur et le dividende par des nombres ronds qui se divisent facilement, puis on compte les zéros. ' + ent(N) + ' ≈ ' + ent(N0) + ' et ' + d + ' ≈ ' + d0 + ', donc le quotient vaut environ ' + ent(N0) + ' ÷ ' + d0 + ' = ' + ent(N0 / d0) + ' (valeur exacte : environ ' + nb(N / d, 1) + '). Le choix le plus proche est ' + f(j) + '. Piège : un zéro de trop ou en moins donne ' + f(j + 1) + ' ou ' + f(j - 1) + '.');
}

/* 1c · Comparer des décimaux et des fractions simples. */
const POOL1 = (function(){
  const p = [];
  [2, 3, 4, 5, 8, 10, 20, 25].forEach(d => { for (let n = 1; n < d * 1.5; n++) if (pgcd(n, d) === 1 && n !== d) p.push({ n, d, t: n + '/' + d, dec: false, l: 0 }); });
  for (let t = 1; t < 1500; t++){
    const l = t % 100 === 0 ? 1 : t % 10 === 0 ? 2 : 3;
    if (l === 3 && [125, 375, 625, 875, 505, 605, 705, 305, 45, 55, 65, 1125, 1025].indexOf(t) < 0) continue;
    if (t % 1000 === 0) continue;
    const g = pgcd(t, 1000);
    p.push({ n: t / g, d: 1000 / g, t: dec(t, -3), dec: true, l });
  }
  return p;
})();
const cmp = (x, y) => x.n * y.d - y.n * x.d;
function n1Comparer(R){
  const v = R.int(1, 4);
  for (let t = 0; t < 400; t++){
    const c = R.int(15, 120) / 100, prox = POOL1.filter(e => Math.abs(e.n / e.d - c) <= 0.2);
    const pick = R.shuffle(prox).slice(0, 12), S = [];
    pick.forEach(e => { if (S.length < 4 && S.every(s => cmp(s, e) !== 0)) S.push(e); });
    if (S.length < 4 || S.every(e => e.dec) || S.every(e => !e.dec)) continue;
    if (!S.some(e => e.dec && e.l >= 2)) continue;
    const txt = liste(S.map(e => e.t)), tri = S.slice().sort(cmp);
    const decs = tri.map(e => (e.dec ? e.t : e.t + ' ≈ ' + nb(e.n / e.d, 3))).join(' ; ');
    if (v <= 2){
      const max = v === 1, rep = max ? tri[3] : tri[0];
      const longs = S.filter(e => e.dec).sort((x, y) => y.l - x.l);
      if (max && longs[0] === rep) continue;
      const q = (max ? 'Quel est le plus grand des nombres ' : 'Quel est le plus petit des nombres ') + txt + ' ?';
      return ex(q, rep.t, qcm(rep.t, S.map(e => e.t)),
        'On écrit tous les nombres en décimal avec le même nombre de chiffres après la virgule, puis on compare chiffre par chiffre. Dans l\'ordre croissant : ' + decs + '. Le plus ' + (max ? 'grand' : 'petit') + ' est donc ' + rep.t + '. Piège : un décimal qui a plus de chiffres après la virgule n\'est pas forcément plus grand (0,45 < 0,5).');
    }
    if (v === 3){
      const B = R.pick([[1, 4, 1, 3], [1, 3, 1, 2], [1, 2, 2, 3], [2, 3, 3, 4], [3, 4, 4, 5], [1, 5, 1, 4], [2, 5, 1, 2], [3, 5, 2, 3], [1, 2, 3, 5], [3, 4, 1, 1]]);
      const lo = { n: B[0], d: B[1] }, hi = { n: B[2], d: B[3] };
      const dedans = S.filter(e => cmp(e, lo) > 0 && cmp(e, hi) < 0);
      if (dedans.length !== 1 || S.some(e => cmp(e, lo) === 0 || cmp(e, hi) === 0)) continue;
      const bt = x => (x.d === 1 ? String(x.n) : x.n + '/' + x.d), rep = dedans[0];
      const q = 'Parmi les nombres ' + txt + ', lequel est compris entre ' + bt(lo) + ' et ' + bt(hi) + ' ?';
      return ex(q, rep.t, qcm(rep.t, S.map(e => e.t)),
        'On écrit les bornes et les nombres en décimal, puis on regarde lequel tombe strictement entre les deux bornes. ' + bt(lo) + ' ≈ ' + nb(lo.n / lo.d, 3) + ' et ' + bt(hi) + ' ≈ ' + nb(hi.n / hi.d, 3) + ' ; les nombres : ' + decs + '. Seul ' + rep.t + ' est entre les deux.');
    }
    const cible = R.pick([{ n: 1, d: 2, t: '1/2' }, { n: 1, d: 1, t: '1' }]);
    if (S.some(e => cmp(e, cible) === 0)) continue;
    const dist = e => ({ n: Math.abs(e.n * cible.d - cible.n * e.d), d: e.d * cible.d });
    const parD = S.slice().sort((x, y) => cmp(dist(x), dist(y)));
    if (cmp(dist(parD[0]), dist(parD[1])) === 0 || dist(parD[1]).n / dist(parD[1]).d - dist(parD[0]).n / dist(parD[0]).d < 0.01) continue;
    const rep = parD[0];
    const q = 'Parmi les nombres ' + txt + ', lequel est le plus proche de ' + cible.t + ' ?';
    return ex(q, rep.t, qcm(rep.t, S.map(e => e.t)),
      'On calcule l\'écart entre chaque nombre et ' + cible.t + ' (la différence, sans tenir compte du signe), puis on garde le plus petit écart. Écarts : ' + parD.map(e => e.t + ' → ' + nb(dist(e).n / dist(e).d, 3)).join(' ; ') + '. Le plus proche est ' + rep.t + '. Piège : un nombre peut être proche en étant au-dessus ou au-dessous de ' + cible.t + '.');
  }
  return ex('Quel est le plus grand des nombres 0,7 ; 2/3 ; 0,65 et 5/8 ?', '0,7', ['0,7', '2/3', '0,65', '5/8'],
    'On écrit tous les nombres en décimal avec le même nombre de chiffres après la virgule, puis on compare. 5/8 = 0,625 ; 0,65 ; 2/3 ≈ 0,667 ; 0,7. Le plus grand est 0,7.');
}

/* 1d · Grands nombres : milliards, millions, puissances de 10. */
function n1Grands(R){
  const v = R.int(1, 3);
  if (v === 1){
    const k = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 25, 40]), rep = ent(k * 1000);
    const q = R.int(0, 1) ? 'Combien de millions y a-t-il dans ' + k + ' milliards ?'
      : 'Le budget annuel d\'une région est de ' + k + ' milliards d\'euros. Combien de millions d\'euros cela représente-t-il ?';
    return ex(q, rep, qcm(rep, [ent(k * 100), ent(k * 10000), ent(k * 1e6)], j => ent(k * 1000 * Math.pow(10, j + 1))),
      'On retient qu\'un milliard vaut mille millions : 10⁹ = 10³ × 10⁶. Donc ' + k + ' milliards = ' + k + ' × 1 000 millions = ' + rep + ' millions. Piège : croire qu\'un milliard vaut un million de millions donne ' + ent(k * 1e6) + ' ; c\'est un billion.');
  }
  if (v === 2){
    for (let t = 0; t < 100; t++){
      const K = R.pick([2, 3, 4, 6, 8, 9, 12, 15, 18, 24, 30, 36]), P = R.pick([2, 3, 4, 5, 6, 8, 10, 12]) * 1000;
      if ((K * 1e6) % P) continue;
      const s = K * 1e6 / P, f = x => ent(x) + ' €';
      if (s < 100) continue;
      const q = 'Une somme de ' + K + ' millions d\'euros est partagée équitablement entre ' + ent(P) + ' personnes. Combien reçoit chacune ?';
      return ex(q, f(s), qcm(f(s), [f(s * 10), f(s / 10), f(s * 1000)], j => f(s + 100 * pm(j))),
        'On écrit les deux nombres avec des puissances de 10 et on divise séparément les chiffres et les puissances. ' + K + ' millions = ' + K + ' × 10⁶ et ' + ent(P) + ' = ' + (P / 1000) + ' × 10³, donc chacun reçoit ' + K + ' ÷ ' + (P / 1000) + ' × 10³ = ' + f(s) + '. Piège : se tromper d\'un zéro donne ' + f(s * 10) + ' ou ' + f(s / 10) + '.');
    }
  }
  const m = R.int(0, 1) ? R.int(2, 9) : R.pick([12, 15, 25, 36, 45, 64, 75, 99]), p = R.int(3, 12), d = String(m).length + p;
  const q = 'Combien de chiffres faut-il pour écrire en entier le nombre ' + m + ' × ' + p10(p) + ' ?';
  return ex(q, String(d), qcm(String(d), [String(d - 1), String(d + 1), String(m + p)], j => String(d + pm(j) * 2)),
    'Multiplier par 10' + sup(p) + ', c\'est écrire ' + p + ' zéros à droite du nombre. ' + m + ' × ' + p10(p) + ' s\'écrit ' + m + ' suivi de ' + p + ' zéros : ' + String(m).length + ' + ' + p + ' = ' + d + ' chiffres. Piège : compter seulement les zéros donne ' + p + (String(m).length === 1 ? '' : ' (ou ' + (p + 1) + ')') + '.');
}

/* =====================================================
   NIVEAU 2 · maîtrise
   ===================================================== */

/* 2a · Nombre de chiffres de 2^n (11 ≤ n ≤ 49) grâce à 2¹⁰ ≈ 10³. */
function n2Chiffres2(R){
  const n = R.int(11, 49), c = ch2(n), D = c.D, forme = R.int(1, 3);
  const det = 'On fait des paquets de dix facteurs 2, car 2¹⁰ = 1 024 est à peine plus grand que 10³. ' + paquets2(n) + ', et chaque 2¹⁰ vaut environ 10³, donc ' + pw(2, n) + ' ≈ ' + (c.r ? Math.pow(2, c.r) + ' × ' : '') + p10(3 * c.q) + '. Comme 1 024 dépasse un peu 1 000, on a plus précisément ' + pw(2, n) + ' ≈ ' + nb(c.X, 1) + ' × ' + p10(3 * c.q) + ' : ' + nchif(Math.floor(c.X)) + ' chiffre' + (nchif(Math.floor(c.X)) > 1 ? 's' : '') + ' devant ' + (3 * c.q) + ' rangs, soit ' + D + ' chiffres.';
  if (forme === 3){
    const f = j => 'entre ' + p10(j - 1) + ' et ' + p10(j);
    const q = 'Entre quelles puissances de 10 consécutives se trouve le nombre ' + pw(2, n) + ' ?';
    return ex(q, f(D), qcm(f(D), [f(D - 1), f(D + 1), f(D - 2)], j => f(D + 2 + j)),
      det + ' Un nombre de ' + D + ' chiffres est compris entre ' + p10(D - 1) + ' et ' + p10(D) + '. Piège : oublier que 1 024 dépasse 1 000, ou croire que 10' + sup(D - 1) + ' a ' + (D - 1) + ' chiffres (il en a ' + D + ').');
  }
  const q = forme === 1 ? 'Combien de chiffres a le nombre ' + pw(2, n) + ' quand on l\'écrit en entier ?'
    : 'Une cellule se divise en deux toutes les heures. Au bout de ' + n + ' heures, une seule cellule en a donné ' + pw(2, n) + '. Combien de chiffres a ce nombre ?';
  return ex(q, String(D), qcm(String(D), [String(D - 1), String(D + 1), String(n)], j => String(D + 2 * pm(j))),
    det + ' Piège : confondre l\'exposant ' + n + ' avec le nombre de chiffres, ou ne compter que les ' + (3 * c.q) + ' zéros de ' + p10(3 * c.q) + '.');
}

/* Expressions en x, rangées par exposant p (x^p). Valeurs tests pour l'explication. */
const XP = [
  { t: 'x³', p: 3, a: '1/64', b: '64' }, { t: 'x²', p: 2, a: '1/16', b: '16' }, { t: 'x', p: 1, a: '1/4', b: '4' },
  { t: '√x', p: 0.5, a: '1/2', b: '2' }, { t: '1/x', p: -1, a: '4', b: '1/4' }, { t: '1/x²', p: -2, a: '16', b: '1/16' }
];
/* 2b · Si 0 < x < 1 (ou x > 1), lequel est le plus grand, le plus petit ? */
function n2Puissances(R){
  const S = R.shuffle(XP).slice(0, 4), petit = R.int(0, 2) > 0, max = R.int(0, 1) === 1;
  /* 0 < x < 1 : plus p est petit, plus x^p est grand. x > 1 : l'inverse. */
  const tri = S.slice().sort((u, w) => (petit ? w.p - u.p : u.p - w.p));         // croissant
  const rep = max ? tri[3] : tri[0];
  const inter = petit ? '0 < x < 1' : 'x > 1', test = petit ? '1/4' : '4';
  const q = 'On sait que ' + inter + '. Quel est le plus ' + (max ? 'grand' : 'petit') + ' des nombres ' + liste(S.map(e => e.t)) + ' ?';
  return ex(q, rep.t, qcm(rep.t, S.map(e => e.t)),
    'On remplace x par une valeur simple de l\'intervalle, par exemple x = ' + test + ', et on calcule chaque nombre. Avec x = ' + test + ' : ' + tri.map(e => e.t + ' = ' + (petit ? e.a : e.b)).join(' ; ') + ' (ordre croissant). Le plus ' + (max ? 'grand' : 'petit') + ' est donc ' + rep.t + '. ' + (petit ? 'Piège : pour un nombre entre 0 et 1, le carré est PLUS PETIT que le nombre et la racine est plus grande.' : 'Piège : pour x > 1, l\'inverse 1/x est plus petit que 1, et 1/x² encore plus petit.'));
}

/* 2c · Encadrer √N entre deux entiers consécutifs. */
function n2Racine(R){
  let N = R.int(20, 999); while (isqrt(N) * isqrt(N) === N) N = R.int(20, 999);
  const a = isqrt(N), h = Math.floor(N / 2), f = j => 'entre ' + j + ' et ' + (j + 1);
  const q = R.int(0, 1) ? 'Entre quels entiers consécutifs se trouve √' + N + ' ?'
    : 'Un carré a une aire de ' + N + ' cm². Entre quels entiers consécutifs se trouve la longueur de son côté, en cm ?';
  return ex(q, f(a), qcm(f(a), [f(a - 1), f(a + 1), f(h)], j => f(a + 1 + j)),
    'On cherche les deux carrés parfaits qui entourent le nombre sous la racine. ' + a + '² = ' + (a * a) + ' et ' + (a + 1) + '² = ' + ((a + 1) * (a + 1)) + ', donc ' + (a * a) + ' < ' + N + ' < ' + ((a + 1) * (a + 1)) + ' et ' + a + ' < √' + N + ' < ' + (a + 1) + '. Piège : la racine carrée n\'est pas la moitié (' + N + ' ÷ 2 ≈ ' + h + ').');
}

/* 2d · La plus grande (ou la plus petite) de quatre fractions proches. */
function n2Fractions(R){
  const max = R.int(0, 2) > 0;
  for (let t = 0; t < 500; t++){
    const lo = R.int(30, 75) / 100, S = [];
    for (let s = 0; s < 60 && S.length < 4; s++){
      const d = R.int(5, 19), n = R.int(1, d - 1), v = n / d;
      if (pgcd(n, d) !== 1 || v < lo || v > lo + 0.12) continue;
      if (S.some(e => Math.abs(e.n / e.d - v) < 0.004 || e.d === d)) continue;
      S.push({ n, d, t: n + '/' + d });
    }
    if (S.length < 4) continue;
    const tri = S.slice().sort(cmp), rep = max ? tri[3] : tri[0];
    const parN = S.slice().sort((u, w) => u.n - w.n), parD = S.slice().sort((u, w) => u.d - w.d);
    if (max && (rep === parN[3] || rep === parD[3])) continue;
    if (!max && (rep === parN[0] || rep === parD[0])) continue;
    const q = 'Quelle est la plus ' + (max ? 'grande' : 'petite') + ' des fractions ' + liste(S.map(e => e.t)) + ' ?';
    return ex(q, rep.t, qcm(rep.t, S.map(e => e.t)),
      'On compare des fractions par les produits en croix (a/b < c/d quand a × d < c × b) ou en les écrivant en décimal avec trois chiffres après la virgule. Dans l\'ordre croissant : ' + tri.map(e => e.t + ' ≈ ' + nb(e.n / e.d, 3)).join(' ; ') + '. La plus ' + (max ? 'grande' : 'petite') + ' est ' + rep.t + '. Piège : la fraction qui a le plus ' + (max ? 'grand' : 'petit') + ' numérateur ou dénominateur n\'est pas forcément la plus ' + (max ? 'grande' : 'petite') + '.');
  }
  return ex('Quelle est la plus grande des fractions 7/9 ; 4/5 ; 11/14 et 9/12 ?', '4/5', ['4/5', '7/9', '11/14', '9/12'],
    'On compare des fractions par les produits en croix ou en décimal. 9/12 = 0,75 ; 7/9 ≈ 0,778 ; 11/14 ≈ 0,786 ; 4/5 = 0,8. La plus grande est 4/5.');
}

/* 2e · Décimaux et puissances de 10 : 0,0021 × 39 000 est le plus proche de… */
function n2Decimaux(R){
  for (let t = 0; t < 300; t++){
    let a = R.int(11, 99); if (a % 10 === 0) a++;
    let b = R.int(11, 99); if (b % 10 === 0) b++;
    const div = R.int(0, 2) === 0, p = R.int(2, 5), qq = div ? R.int(2, 7 - p + 2) : R.int(2, 5);
    const x = a * Math.pow(10, -p), y = b * Math.pow(10, qq), v = div ? y / x : x * y;
    const r1 = arr1(v), r = v / (r1.m * Math.pow(10, r1.k));
    if (r < 0.75 || r > 1.34 || r1.k > 11 || r1.k < -4) continue;
    const ax = arr1(x), ay = arr1(y), app = div ? ay.m / ax.m : ax.m * ay.m, kap = div ? ay.k - ax.k : ax.k + ay.k;
    const X = dec(a, -p), Y = ent(y), f = j => dec(r1.m, j);
    const q = 'Parmi ces nombres, lequel est le plus proche de ' + (div ? Y + ' ÷ ' + X : (R.int(0, 1) ? X + ' × ' + Y : Y + ' × ' + X)) + ' ?';
    const autres = [r1.k - 1, r1.k + 1, R.int(0, 1) ? r1.k - 2 : r1.k + 2].map(f);
    return ex(q, f(r1.k), qcm(f(r1.k), autres, j => f(r1.k + 2 + j)),
      'On arrondit chaque nombre à un seul chiffre non nul suivi ou précédé de zéros, puis on traite à part les chiffres et les puissances de 10. ' + X + ' ≈ ' + sci(ax.m, ax.k) + ' et ' + Y + ' ≈ ' + sci(ay.m, ay.k) + ', donc le ' + (div ? 'quotient' : 'produit') + ' vaut environ ' + nb(app, 2) + ' × ' + p10(kap) + ' (valeur exacte : environ ' + sci(nb(mant(v).M, 2), mant(v).K) + '). Le choix le plus proche est ' + f(r1.k) + '. Piège : un décalage de virgule donne ' + f(r1.k - 1) + ' ou ' + f(r1.k + 1) + (div ? ' ; et diviser par un nombre plus petit que 1 AGRANDIT le résultat.' : '.'));
  }
  return ex('Parmi ces nombres, lequel est le plus proche de 0,0021 × 39 000 ?', '80', ['80', '8', '800', '0,8'],
    'On arrondit chaque nombre à un seul chiffre non nul. 0,0021 ≈ 2 × 10⁻³ et 39 000 ≈ 4 × 10⁴, donc le produit vaut environ 8 × 10¹ = 80.');
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels
   ===================================================== */

/* 3a · Comparer des puissances en les ramenant au même exposant (2⁶⁰, 3⁴⁵, 5³⁰, 7¹⁵). */
const FORMES3 = [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 1], [3, 2], [3, 3], [5, 1], [5, 2], [6, 1], [6, 2], [7, 1], [10, 1], [11, 1]];
function n3MemeExposant(R){
  const max = R.int(0, 2) > 0;
  for (let t = 0; t < 500; t++){
    const k = R.pick([4, 5, 6, 8, 10, 12, 15, 20]), S = [];
    R.shuffle(FORMES3).forEach(f => { if (S.length < 4 && S.every(s => s[0] !== f[0] && Math.pow(s[0], s[1]) !== Math.pow(f[0], f[1]))) S.push(f); });
    if (S.length < 4 || S.some(f => f[1] * k > 100) || S.filter(f => f[1] >= 2).length < 2) continue;
    const V = f => Math.pow(f[0], f[1]), tri = S.slice().sort((u, w) => V(u) - V(w)), rep = max ? tri[3] : tri[0];
    const E = S.map(f => f[1]), B = S.map(f => f[0]);
    const eM = Math.max.apply(null, E), em = Math.min.apply(null, E), bM = Math.max.apply(null, B), bm = Math.min.apply(null, B);
    if (max && (rep[0] === bM || (rep[1] === eM && E.filter(e => e === eM).length === 1))) continue;
    if (!max && (rep[0] === bm || (rep[1] === em && E.filter(e => e === em).length === 1))) continue;
    const T = f => pw(f[0], f[1] * k), txt = S.map(T);
    const det = tri.map(f => f[1] === 1 ? T(f) : T(f) + ' = (' + pw(f[0], f[1]) + ')' + sup(k) + ' = ' + V(f) + sup(k)).join(' ; ');
    const q = 'Quel est le plus ' + (max ? 'grand' : 'petit') + ' des nombres ' + liste(txt) + ' ?';
    return ex(q, T(rep), qcm(T(rep), txt),
      'On écrit tous les nombres avec le même exposant ' + k + ' (tous les exposants sont des multiples de ' + k + '), puis on compare les nombres entre parenthèses. Dans l\'ordre croissant : ' + det + '. Le plus ' + (max ? 'grand' : 'petit') + ' est donc ' + T(rep) + ' = ' + V(rep) + sup(k) + '. Piège : ni le plus ' + (max ? 'grand' : 'petit') + ' exposant ni la plus ' + (max ? 'grande' : 'petite') + ' base ne suffisent pour conclure.');
  }
  return ex('Quel est le plus grand des nombres 2⁶⁰ ; 3⁴⁵ ; 5³⁰ et 7¹⁵ ?', '3⁴⁵', ['3⁴⁵', '2⁶⁰', '5³⁰', '7¹⁵'],
    'On écrit tous les nombres avec le même exposant 15. 7¹⁵ ; 2⁶⁰ = 16¹⁵ ; 5³⁰ = 25¹⁵ ; 3⁴⁵ = 27¹⁵. Le plus grand est 3⁴⁵.');
}

/* 3b · √N pour un grand N : regrouper les zéros par deux. */
function n3RacineGrand(R){
  let N = 50000;
  for (let t = 0; t < 100; t++){
    const d = R.pick([2, 3, 5, 6, 7, 8, 12, 15, 20, 24, 30, 40, 50, 60, 80]), N0 = d * Math.pow(10, R.int(2, 7));
    if (N0 < 2000 || N0 > 1e9 || isqrt(N0) * isqrt(N0) === N0) continue;
    N = N0; break;
  }
  const ro = ro2;
  const s = ro(Math.sqrt(N)), forme = R.int(0, 1), u = forme ? ' m' : '', f = x => nb(x, 1) + u;
  const T = Math.floor(Math.floor(Math.log10(N) + 1e-9) / 2), c = N / Math.pow(10, 2 * T), sc = Math.round(Math.sqrt(c) * 100) / 100;
  const autres = [ro(Math.sqrt(N / 10)), ro(Math.sqrt(N * 10)), ro(Math.sqrt(R.int(0, 1) ? N / 100 : N * 100))].map(f);
  const q = forme ? 'Un terrain carré a une aire de ' + ent(N) + ' m². Parmi ces longueurs, laquelle est la plus proche de la longueur de son côté ?'
    : 'Parmi ces nombres, lequel est le plus proche de √' + ent(N) + ' ?';
  return ex(q, f(s), qcm(f(s), autres, j => f(s * (j + 3))),
    'On écrit le nombre sous la racine comme un petit nombre multiplié par une puissance de 10 PAIRE (100, 10 000, 1 000 000…), car √(a × 10 000) = √a × 100. ' + ent(N) + ' = ' + nb(c, 2) + ' × ' + p10(2 * T) + ', donc √' + ent(N) + ' = √' + nb(c, 2) + ' × ' + p10(T) + ' ≈ ' + nb(sc, 2) + ' × ' + ent(Math.pow(10, T)) + ' (car ' + nb(sc, 2) + '² ≈ ' + nb(c, 2) + '), soit environ ' + f(s) + '. Piège : grouper les zéros par un au lieu de deux donne une réponse fausse d\'un facteur √10 ≈ 3,16, comme ' + autres[0] + ' ou ' + autres[1] + '.');
}

/* 3c · Estimations en contexte (Fermi) : on écrit tout en puissances de 10. */
const DUREES = {
  'une heure': { s: 3600, d: '3 600 secondes' },
  'une journée': { s: 86400, d: '24 × 3 600 = 86 400 secondes' },
  'une semaine': { s: 604800, d: '7 × 86 400 ≈ 600 000 secondes' },
  'un mois de 30 jours': { s: 2592000, d: '30 × 86 400 ≈ 2,6 millions de secondes' },
  'une année': { s: 31536000, d: '365 × 86 400 ≈ 3,2 × 10⁷ secondes' },
  'un siècle': { s: 3153600000, d: '100 × 3,15 × 10⁷ ≈ 3,2 × 10⁹ secondes' }
};
function n3Fermi(R){
  for (let t = 0; t < 200; t++){
    const c = R.int(1, 6);
    let q, v, det;
    if (c === 1){
      const r = R.pick([60, 65, 70, 72, 75, 80]), D = R.pick(['une journée', 'une semaine', 'une année', 'une vie de 80 ans']);
      const mn = D === 'une vie de 80 ans' ? 80 * 365 * 1440 : DUREES[D].s / 60;
      q = 'Un cœur bat environ ' + r + ' fois par minute. Environ combien de fois bat-il en ' + D + ' ?';
      v = r * mn;
      det = r + ' × 60 minutes × 24 heures' + (D === 'une semaine' ? ' × 7 jours' : D === 'une année' ? ' × 365 jours' : D === 'une vie de 80 ans' ? ' × 365 jours × 80 ans' : '');
    } else if (c === 2){
      const D = R.pick(['une journée', 'une semaine', 'un mois de 30 jours', 'une année', 'un siècle']);
      q = 'Environ combien de secondes y a-t-il dans ' + D + ' ?'; v = DUREES[D].s; det = DUREES[D].d;
    } else if (c === 3){
      const S = R.pick([2, 3, 4, 5, 10]), D = R.pick(['une journée', 'une semaine', 'une année']);
      q = 'Un robinet qui fuit perd une goutte toutes les ' + S + ' secondes. Environ combien de gouttes perd-il en ' + D + ' ?';
      v = DUREES[D].s / S; det = 'nombre de secondes ÷ ' + S + ', avec ' + D + ' = ' + DUREES[D].d;
    } else if (c === 4){
      const P = R.pick([4000, 5000, 6000, 8000, 10000, 12000]), Y = R.pick([5, 10, 20, 30, 50, 70]);
      q = 'Une personne fait en moyenne ' + ent(P) + ' pas par jour. Environ combien de pas fait-elle en ' + Y + ' ans ?';
      v = P * 365 * Y; det = ent(P) + ' × 365 jours × ' + Y + ' ans';
    } else if (c === 5){
      const P = R.pick([150, 200, 250, 300, 400]), M = R.pick([250, 300, 400, 500]), B = R.pick([2000, 5000, 8000, 20000, 50000]);
      q = 'Un livre compte en moyenne ' + P + ' pages de ' + M + ' mots. Environ combien de mots contient une bibliothèque de ' + ent(B) + ' livres ?';
      v = P * M * B; det = P + ' × ' + M + ' × ' + ent(B);
    } else {
      const V = R.pick([3, 5, 8, 12, 20, 40]), D = R.pick(['une heure', 'une journée', 'une semaine', 'une année']);
      q = 'Un site reçoit en moyenne ' + V + ' visites par seconde. Environ combien de visites reçoit-il en ' + D + ' ?';
      v = V * DUREES[D].s; det = V + ' × nombre de secondes, avec ' + D + ' = ' + DUREES[D].d;
    }
    const r1 = arr1(v), rr = v / (r1.m * Math.pow(10, r1.k));
    if (rr < 0.7 || rr > 1.4 || r1.k < 2) continue;
    const f = j => sci(r1.m, j), mv = mant(v);
    const autres = expoVoisins(R, r1.k, 1).map(f);
    return ex(q, f(r1.k), qcm(f(r1.k), autres, j => f(r1.k + 2 + j)),
      'On arrondit chaque nombre et on l\'écrit avec une puissance de 10, puis on multiplie les chiffres d\'un côté et les puissances de 10 de l\'autre. Calcul : ' + det + ', soit environ ' + sci(nb(mv.M, 1), mv.K) + '. Le choix le plus proche est ' + f(r1.k) + '. Repères utiles : une journée ≈ 10⁵ secondes, une année ≈ 3 × 10⁷ secondes. Piège : oublier un facteur (les 60 minutes d\'une heure, les 24 heures d\'une journée) décale la réponse d\'au moins une puissance de 10.');
  }
  return ex('Environ combien de secondes y a-t-il dans une année ?', '3 × 10⁷', ['3 × 10⁷', '3 × 10⁶', '3 × 10⁸', '3 × 10⁵'],
    'On multiplie 365 jours par 86 400 secondes. 365 × 86 400 ≈ 3,2 × 10⁷.');
}

/* 3d · Nombres négatifs : −1 < x < 0 ou x < −1. Ordre croissant de chaque cas (prouvé dans la leçon). */
const XN = { x: ['−1/2', '−2'], 'x²': ['1/4', '4'], 'x³': ['−1/8', '−8'], '1/x': ['−2', '−1/2'], '−x': ['1/2', '2'], '1/x²': ['4', '1/4'] };
const ORDRE_N = [['1/x', 'x', 'x³', 'x²', '−x', '1/x²'], ['x³', 'x', '1/x', '1/x²', '−x', 'x²']];
function n3Negatifs(R){
  const cas = R.int(0, 1), max = R.int(0, 1) === 1;
  const S = R.shuffle(Object.keys(XN)).slice(0, 4), tri = ORDRE_N[cas].filter(e => S.indexOf(e) >= 0), rep = max ? tri[3] : tri[0];
  const inter = cas === 0 ? '−1 < x < 0' : 'x < −1', test = cas === 0 ? '−1/2' : '−2';
  const q = 'On sait que ' + inter + '. Quel est le plus ' + (max ? 'grand' : 'petit') + ' des nombres ' + liste(S) + ' ?';
  return ex(q, rep, qcm(rep, S),
    'On remplace x par une valeur simple de l\'intervalle, par exemple x = ' + test + ', en faisant très attention aux signes. Avec x = ' + test + ' : ' + tri.map(e => e + ' = ' + XN[e][cas]).join(' ; ') + ' (ordre croissant). Le plus ' + (max ? 'grand' : 'petit') + ' est donc ' + rep + '. Piège : un carré est toujours positif, un cube garde le signe de x, et parmi deux négatifs le plus grand est celui qui est le plus proche de 0 (' + (cas === 0 ? '−1/8 > −1/2' : '−1/2 > −2') + ').');
}

/* 3e · Fractions voisines et produits équilibrés (2025/2026, 2026 × 2028 contre 2027²). */
function n3Voisines(R){
  const v = R.int(1, 3), max = R.int(0, 1) === 1;
  if (v === 1){
    const Y = R.int(2014, 2030), inv = R.int(0, 2) === 0;
    const ns = R.shuffle([0, 1, 2, 3, 4, 5, 6].map(i => Y + i)).slice(0, 4);
    const T = n => (inv ? (n + 1) + '/' + n : n + '/' + (n + 1)), txt = ns.map(T);
    const tri = ns.slice().sort((a, b) => a - b), rep = T(max !== inv ? tri[3] : tri[0]);
    const q = 'Quel est le plus ' + (max ? 'grand' : 'petit') + ' des nombres ' + liste(txt) + ' ?';
    return ex(q, rep, qcm(rep, txt),
      (inv ? 'On écrit chaque fraction sous la forme 1 + 1/n, car (n + 1)/n = 1 + 1/n : plus n est grand, plus la fraction est petite.'
        : 'On regarde l\'écart à 1 : 1 − n/(n + 1) = 1/(n + 1), donc plus n est grand, plus la fraction est proche de 1 et plus elle est grande.') + ' La plus ' + (max ? 'grande' : 'petite') + ' est donc ' + rep + '. Piège : ces fractions ne sont pas égales, même si elles valent toutes presque 1.');
  }
  if (v === 2){
    for (let t = 0; t < 100; t++){
      const Y = R.int(2014, 2032), c = [];
      for (let i = 0; i < 5; i++){ c.push({ t: (Y + i) + '/' + (Y + i + 1), e: Y + i + 1 }); c.push({ t: (Y + i + 1) + '/' + (Y + i), e: Y + i }); }
      const S = R.shuffle(c).slice(0, 4), parE = S.slice().sort((a, b) => b.e - a.e);
      if (parE[0].e === parE[1].e) continue;
      if (S.filter(s => s.t.split('/')[0] < s.t.split('/')[1]).length !== 2) continue;
      const rep = parE[0].t, txt = S.map(s => s.t);
      const q = 'Parmi les nombres ' + liste(txt) + ', lequel est le plus proche de 1 ?';
      return ex(q, rep, qcm(rep, txt),
        'On calcule l\'écart de chaque fraction à 1 : 1 − n/(n + 1) = 1/(n + 1) et (n + 1)/n − 1 = 1/n, donc l\'écart vaut toujours 1 divisé par le dénominateur. Écarts : ' + S.map(s => s.t + ' → 1/' + s.e).join(' ; ') + '. Le plus petit écart correspond au plus grand dénominateur : ' + rep + '. Piège : une fraction plus grande que 1 peut être plus proche de 1 qu\'une fraction plus petite que 1.');
    }
  }
  const c = R.int(2017, 2035), ds = R.shuffle([0, 1, 2, 3, 4, 5]).slice(0, 4);
  const T = d => (d === 0 ? pw(c, 2) : (c - d) + ' × ' + (c + d)), txt = ds.map(T);
  const tri = ds.slice().sort((a, b) => b - a), rep = T(max ? tri[3] : tri[0]);
  const q = 'Quel est le plus ' + (max ? 'grand' : 'petit') + ' des nombres ' + liste(txt) + ' ?';
  return ex(q, rep, qcm(rep, txt),
    'On écrit chaque produit avec l\'identité (a − d)(a + d) = a² − d², autour du nombre du milieu ' + c + '. Ainsi ' + tri.filter(d => d > 0).map(d => T(d) + ' = ' + c + '² − ' + (d * d)).join(' ; ') + (ds.indexOf(0) >= 0 ? ', alors que ' + pw(c, 2) + ' ne perd rien' : '') + '. Le plus ' + (max ? 'grand' : 'petit') + ' est celui où l\'on retire le ' + (max ? 'moins' : 'plus') + ' : ' + rep + '. Piège : les sommes des deux facteurs sont toutes égales (' + (2 * c) + '), mais pas les produits ; plus les facteurs sont proches, plus le produit est grand.');
}

/* 3f · 2^a × 5^b : nombre de chiffres et nombre de zéros à la fin. */
function n3DeuxCinq(R){
  let a = R.int(6, 30), b = R.int(6, 30);
  while (a === b || Math.abs(a - b) > 6) { a = R.int(6, 30); b = R.int(6, 30); }
  const m = Math.min(a, b), d = Math.abs(a - b), reste = a > b ? Math.pow(2, d) : Math.pow(5, d), rt = a > b ? pw(2, d) : pw(5, d);
  const D = m + nchif(reste), E = pw(2, a) + ' × ' + pw(5, b);
  const det = 'On associe chaque facteur 2 à un facteur 5 pour former des 10, car 2 × 5 = 10. ' + E + ' = ' + rt + ' × (2 × 5)' + sup(m) + ' = ' + ent(reste) + ' × ' + p10(m) + '.';
  if (R.int(0, 1)){
    const q = 'Combien de chiffres a le nombre ' + E + ' quand on l\'écrit en entier ?';
    return ex(q, String(D), qcm(String(D), [String(m), String(a + b), String(Math.max(a, b)), String(D + 1)], j => String(D + pm(j))),
      det + ' C\'est ' + ent(reste) + ' (' + nchif(reste) + ' chiffre' + (nchif(reste) > 1 ? 's' : '') + ') suivi de ' + m + ' zéros : ' + D + ' chiffres. Piège : oublier les chiffres de ' + ent(reste) + ' donne ' + m + ' ; additionner les exposants donne ' + (a + b) + '.');
  }
  const q = 'Par combien de zéros se termine le nombre ' + E + ' ?';
  return ex(q, String(m), qcm(String(m), [String(Math.max(a, b)), String(a + b), String(m + 1)], j => String(m + pm(j))),
    det + ' ' + ent(reste) + ' ne se termine pas par 0 (il ne contient que des facteurs ' + (a > b ? '2' : '5') + '), donc le nombre se termine par exactement ' + m + ' zéros. Piège : chaque zéro demande un 2 ET un 5 ; le plus petit exposant décide, pas le plus grand (' + Math.max(a, b) + ') ni la somme (' + (a + b) + ').');
}

/* =====================================================
   NIVEAU 4 · plus dur que les exemples officiels
   ===================================================== */

/* 4a · Puissances aux bases « presque égales » une fois ramenées au même exposant (256 contre 243…). */
const GROUPES4 = [
  [[2, 7], [5, 3], [11, 2], [10, 2]],     // 128, 125, 121, 100
  [[2, 8], [3, 5], [15, 2], [6, 3]],      // 256, 243, 225, 216
  [[2, 10], [10, 3], [31, 2], [3, 6]],    // 1 024, 1 000, 961, 729
  [[3, 3], [5, 2], [2, 5], [6, 2]],       // 27, 25, 32, 36
  [[5, 4], [2, 9], [3, 6], [7, 3]],       // 625, 512, 729, 343
  [[3, 2], [2, 3], [10, 1], [7, 1]]       // 9, 8, 10, 7
];
const REECR = { 2: [[4, 2], [8, 3], [16, 4], [32, 5]], 3: [[9, 2], [27, 3]], 5: [[25, 2]], 6: [[36, 2]] };
function n4Ancres(R){
  const max = R.int(0, 2) > 0;
  for (let t = 0; t < 500; t++){
    const G = R.pick(GROUPES4), k = R.int(3, 10);
    if (G.some(f => f[1] * k > 120)) continue;
    /* forme affichée : [base, exposant intérieur] avec base^exposant = valeur d'ancre, exposant affiché = intérieur × k */
    const S = G.map(f => {
      let b = f[0], e = f[1];
      const opts = (REECR[b] || []).filter(o => e % o[1] === 0);
      if (opts.length && R.int(0, 2) > 0){ const o = R.pick(opts); b = o[0]; e = e / o[1]; }
      return { b, e, v: Math.pow(f[0], f[1]), t: pw(b, e * k) };
    });
    const tri = S.slice().sort((u, w) => u.v - w.v), rep = max ? tri[3] : tri[0];
    const E = S.map(s => s.e), B = S.map(s => s.b), eX = max ? Math.max.apply(null, E) : Math.min.apply(null, E), bX = max ? Math.max.apply(null, B) : Math.min.apply(null, B);
    if (rep.b === bX || (rep.e === eX && E.filter(e => e === eX).length === 1)) continue;
    const txt = R.shuffle(S).map(s => s.t);
    const det = tri.map(s => (s.e === 1 ? s.t : s.t + ' = (' + pw(s.b, s.e) + ')' + sup(k) + ' = ' + ent(s.v) + sup(k))).join(' ; ');
    const q = 'Quel est le plus ' + (max ? 'grand' : 'petit') + ' des nombres ' + liste(txt) + ' ?';
    return ex(q, rep.t, qcm(rep.t, txt),
      'Tous les exposants sont des multiples de ' + k + ' : on écrit chaque nombre sous la forme (…)' + sup(k) + ' et on compare les nombres entre parenthèses, qu\'on calcule exactement car ils sont proches. Dans l\'ordre croissant : ' + det + '. Le plus ' + (max ? 'grand' : 'petit') + ' est donc ' + rep.t + '. Piège : se fier au plus ' + (max ? 'grand' : 'petit') + ' exposant ou à la plus ' + (max ? 'grande' : 'petite') + ' base.');
  }
  return ex('Quel est le plus grand des nombres 2⁴⁰ ; 3²⁵ ; 15¹⁰ et 6¹⁵ ?', '2⁴⁰', ['2⁴⁰', '3²⁵', '15¹⁰', '6¹⁵'],
    'Tous les exposants sont des multiples de 5. 2⁴⁰ = 256⁵ ; 3²⁵ = 243⁵ ; 15¹⁰ = 225⁵ ; 6¹⁵ = 216⁵. Le plus grand est 2⁴⁰.');
}

/* 4b · Racines : sommes de même total, différences de racines voisines. */
const carre = n => isqrt(n) * isqrt(n) === n;
function n4Racines(R){
  const max = R.int(0, 1) === 1;
  if (R.int(0, 1)){
    for (let t = 0; t < 200; t++){
      const S = R.int(11, 30), as = [];
      for (let a = 2; 2 * a < S; a++) if (!carre(a) && !carre(S - a)) as.push(a);
      if (as.length < 4) continue;
      const P = R.shuffle(as).slice(0, 4), T = a => '√' + a + ' + √' + (S - a), txt = P.map(T);
      const tri = P.slice().sort((a, b) => a * (S - a) - b * (S - b)), rep = T(max ? tri[3] : tri[0]);
      const q = 'Quel est le plus ' + (max ? 'grand' : 'petit') + ' des nombres ' + liste(txt) + ' ?';
      return ex(q, rep, qcm(rep, txt),
        'Les nombres sous les racines ont toujours la même somme ' + S + ', donc on compare les carrés : (√a + √b)² = a + b + 2√(ab) = ' + S + ' + 2√(ab), et tout se joue sur le produit ab. Produits : ' + tri.map(a => a + ' × ' + (S - a) + ' = ' + (a * (S - a))).join(' ; ') + '. Le plus ' + (max ? 'grand' : 'petit') + ' produit donne le plus ' + (max ? 'grand' : 'petit') + ' nombre : ' + rep + '. Piège : √a + √b n\'est pas √(a + b), sinon tous ces nombres seraient égaux à √' + S + '.');
    }
  }
  const d = R.pick([1, 1, 2, 3]), ns = [];
  while (ns.length < 4){ const n = R.int(2, 99); if (!carre(n) && !carre(n + d) && ns.indexOf(n) < 0) ns.push(n); }
  const T = n => '√' + (n + d) + ' − √' + n, txt = ns.map(T), tri = ns.slice().sort((a, b) => b - a), rep = T(max ? tri[3] : tri[0]);
  const q = 'Quel est le plus ' + (max ? 'grand' : 'petit') + ' des nombres ' + liste(txt) + ' ?';
  return ex(q, rep, qcm(rep, txt),
    'On multiplie et on divise par la somme des deux racines : √(n + ' + d + ') − √n = ' + d + ' ÷ (√(n + ' + d + ') + √n). Le numérateur vaut toujours ' + d + ' : plus les racines sont grandes, plus le dénominateur est grand et plus la différence est petite. La différence la plus ' + (max ? 'grande' : 'petite') + ' est donc celle des plus ' + (max ? 'petits' : 'grands') + ' nombres : ' + rep + '. Piège : croire que toutes ces différences valent ' + (d === 1 ? '1' : d) + ' (ou se valent) parce que les nombres sous les racines diffèrent toujours de ' + d + '.');
}

/* 4c · Nombre de chiffres de 5^n, ou de c × 2^a × 5^b. */
function n4Chiffres5(R){
  const v = R.int(1, 3);
  if (v <= 2){
    const n = R.int(8, 40), D2 = ch2(n).D, D5 = n + 1 - D2;
    const q = v === 1 ? 'Combien de chiffres a le nombre ' + pw(5, n) + ' quand on l\'écrit en entier ?'
      : 'Le nombre ' + pw(2, n) + ' s\'écrit avec ' + D2 + ' chiffres. Combien de chiffres a le nombre ' + pw(5, n) + ' ?';
    return ex(q, String(D5), qcm(String(D5), [String(D5 - 1), String(D2), String(D5 + 1)], j => String(D5 + 2 * pm(j))),
      'On utilise ' + pw(2, n) + ' × ' + pw(5, n) + ' = ' + p10(n) + ', donc ' + pw(5, n) + ' = ' + p10(n) + ' ÷ ' + pw(2, n) + '. ' + (v === 1 ? 'D\'abord, ' + pw(2, n) + ' a ' + D2 + ' chiffres, car ' + paquets2(n) + ' ≈ ' + nb(ch2(n).X, 1) + ' × ' + p10(3 * ch2(n).q) + '. ' : '') + 'Comme ' + pw(2, n) + ' a ' + D2 + ' chiffres, ' + p10(D2 - 1) + ' < ' + pw(2, n) + ' < ' + p10(D2) + ', donc ' + p10(n - D2) + ' < ' + pw(5, n) + ' < ' + p10(n - D2 + 1) + ' : ' + pw(5, n) + ' a ' + n + ' − ' + D2 + ' + 1 = ' + D5 + ' chiffres. Piège : oublier le « + 1 » donne ' + (D5 - 1) + ' ; donner le nombre de chiffres de ' + pw(2, n) + ' donne ' + D2 + '.');
  }
  let a = R.int(8, 30), b = R.int(8, 30);
  while (a === b || Math.abs(a - b) > 5) { a = R.int(8, 30); b = R.int(8, 30); }
  const c = R.pick([3, 7, 9, 11, 13]), m = Math.min(a, b), d = Math.abs(a - b), rest = a > b ? Math.pow(2, d) : Math.pow(5, d);
  const D = m + nchif(c * rest), sans = m + nchif(rest), E = c + ' × ' + pw(2, a) + ' × ' + pw(5, b);
  const q = 'Combien de chiffres a le nombre ' + E + ' quand on l\'écrit en entier ?';
  return ex(q, String(D), qcm(String(D), [String(sans), String(m), String(D + 1), String(D - 1)], j => String(D + 2 * pm(j))),
    'On forme des 10 avec les paires 2 × 5, puis on calcule à part le petit nombre qui reste. ' + E + ' = ' + c + ' × ' + (a > b ? pw(2, d) : pw(5, d)) + ' × ' + p10(m) + ' = ' + ent(c * rest) + ' × ' + p10(m) + ', soit ' + nchif(c * rest) + ' chiffres suivis de ' + m + ' zéros : ' + D + ' chiffres.' + (sans !== D ? ' Piège : oublier le facteur ' + c + ' donne ' + sans + '.' : ' Piège : ne compter que les zéros donne ' + m + '.'));
}

/* 4d · Encadrer √a + √b entre deux entiers consécutifs. */
function n4SommeRacines(R){
  for (let t = 0; t < 500; t++){
    const a = R.int(2, 60), b = R.int(a + 1, 99);
    if (carre(a) || carre(b)) continue;
    const la = isqrt(100 * a), lb = isqrt(100 * b), L = la + lb, m = Math.floor(L / 10);
    if (L + 2 > 10 * (m + 1)) continue;
    const s = Math.sqrt(a) + Math.sqrt(b), fs = s - Math.floor(s);
    if (fs < 0.1 || fs > 0.9) continue;
    const g = isqrt(a + b), f = j => 'entre ' + j + ' et ' + (j + 1);
    const enc = (n, l) => dec(l, -1) + '² = ' + dec(l * l, -2) + ' < ' + n + ' < ' + dec((l + 1) * (l + 1), -2) + ' = ' + dec(l + 1, -1) + '²';
    const q = R.int(0, 1) ? 'Entre quels entiers consécutifs se trouve le nombre √' + a + ' + √' + b + ' ?'
      : 'Un randonneur parcourt √' + a + ' km, puis √' + b + ' km. Entre quels entiers consécutifs se trouve la distance totale, en km ?';
    return ex(q, f(m), qcm(f(m), [f(g), f(m - 1), f(m + 1)], j => f(m + 1 + j)),
      'On encadre chaque racine au dixième près en cherchant les carrés de décimaux qui l\'entourent, puis on additionne les encadrements. ' + enc(a, la) + ' et ' + enc(b, lb) + ', donc ' + dec(L, -1) + ' < √' + a + ' + √' + b + ' < ' + dec(L + 2, -1) + ' : le nombre est ' + f(m) + '. Piège : √' + a + ' + √' + b + ' n\'est pas √' + (a + b) + ' ≈ ' + nb(Math.sqrt(a + b), 1) + ', qui est ' + f(g) + '.');
  }
  return ex('Entre quels entiers consécutifs se trouve le nombre √10 + √30 ?', 'entre 8 et 9', ['entre 8 et 9', 'entre 6 et 7', 'entre 7 et 8', 'entre 9 et 10'],
    'On encadre chaque racine au dixième près. 3,1 < √10 < 3,2 et 5,4 < √30 < 5,5, donc 8,5 < √10 + √30 < 8,7.');
}

/* 4e · Écriture scientifique : (3,9 × 10⁻³) × (2,1 × 10⁸) ÷ (4,1 × 10⁻²) est le plus proche de… */
function n4Sci(R){
  for (let t = 0; t < 300; t++){
    const mk = () => { let x = R.int(11, 99); if (x % 10 === 0) x++; return x; };
    const a = mk(), b = mk(), c = mk(), p = R.int(-6, 9), qq = R.int(-6, 9), r = R.int(-6, 6);
    if (p === 0 || qq === 0 || r === 0) continue;
    const E = p + qq - r, mm = a * b / (c * 10), r1 = arr1(mm), rr = mm / (r1.m * Math.pow(10, r1.k));
    if (rr < 0.75 || rr > 1.34) continue;
    const K = r1.k + E;
    if (K < -6 || K > 12 || Math.abs(K) < 2) continue;
    const Ka = r1.k + p + qq + r;                                  // erreur de signe sur l'exposant du diviseur
    const f = j => sci(r1.m, j);
    const q = 'Parmi ces nombres, lequel est le plus proche de (' + dec(a, -1) + ' × ' + p10(p) + ') × (' + dec(b, -1) + ' × ' + p10(qq) + ') ÷ (' + dec(c, -1) + ' × ' + p10(r) + ') ?';
    const P2 = ro2(a * b / 100);
    const sg = x => (x < 0 ? '(' + nb(x, 0) + ')' : String(x));
    return ex(q, f(K), qcm(f(K), [f(Ka), f(K - 1), f(K + 1)], j => f(K + 2 + j)),
      'On sépare les mantisses et les puissances de 10 : on arrondit les mantisses, on ajoute les exposants des facteurs et on retranche celui du diviseur. Mantisses : ' + dec(a, -1) + ' × ' + dec(b, -1) + ' ≈ ' + nb(P2, 1) + ', puis ' + nb(P2, 1) + ' ÷ ' + dec(c, -1) + ' ≈ ' + nb(P2 / (c / 10), 1) + '. Puissances : ' + p10(p) + ' × ' + p10(qq) + ' ÷ ' + p10(r) + ' = 10 exposant (' + nb(p, 0) + ' + ' + sg(qq) + ' − ' + sg(r) + ') = ' + p10(E) + '. Le résultat vaut environ ' + sci(nb(mant(mm * Math.pow(10, E)).M, 1), K) + ', donc le plus proche est ' + f(K) + '. Piège : diviser par ' + p10(r) + ' revient à multiplier par ' + p10(-r) + ' ; ajouter l\'exposant du diviseur au lieu de le retrancher donne ' + f(Ka) + '.');
  }
  return ex('Parmi ces nombres, lequel est le plus proche de (3,9 × 10⁻³) × (2,1 × 10⁸) ÷ (4,1 × 10⁻²) ?', '2 × 10⁷', ['2 × 10⁷', '2 × 10³', '2 × 10⁶', '2 × 10⁸'],
    'On sépare les mantisses et les puissances de 10. 4 × 2 ÷ 4 = 2 et 10⁻³ × 10⁸ ÷ 10⁻² = 10⁷.');
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif
   ===================================================== */

/* 5a · Racines d'indices différents : √, ∛, ∜, ⁶√. On compare les puissances 12es. */
const RAD = { 2: '√', 3: '∛', 4: '∜', 6: '⁶√' };
function n5Radicaux(R){
  const max = R.int(0, 1) === 1;
  for (let t = 0; t < 1000; t++){
    const v = R.int(125, 230) / 100, S = [];
    for (const i of R.shuffle([2, 3, 4, 6])){
      const b = Math.round(Math.pow(v, i)) + R.int(-1, 1);
      const rac = Math.round(Math.pow(b, 1 / i));
      if (b < 2 || Math.pow(rac, i) === b) break;
      S.push({ i, b, P: Math.pow(b, 12 / i), t: RAD[i] + b });
    }
    if (S.length < 4) continue;
    const Ps = S.map(s => s.P);
    if (new Set(Ps).size < 4 || Math.max.apply(null, Ps) / Math.min.apply(null, Ps) > 1.8) continue;
    const tri = S.slice().sort((u, w) => u.P - w.P), rep = max ? tri[3] : tri[0];
    const bX = max ? Math.max.apply(null, S.map(s => s.b)) : Math.min.apply(null, S.map(s => s.b));
    if (rep.b === bX) continue;
    const txt = S.map(s => s.t), ex12 = { 2: 6, 3: 4, 4: 3, 6: 2 };
    const q = 'Quel est le plus ' + (max ? 'grand' : 'petit') + ' des nombres ' + liste(txt) + ' ?';
    return ex(q, rep.t, qcm(rep.t, txt),
      'On élève tous les nombres à la puissance 12, multiple commun des indices 2, 3, 4 et 6 : cela fait disparaître les racines sans changer l\'ordre, car tous les nombres sont positifs. Ainsi (√b)¹² = b⁶, (∛b)¹² = b⁴, (∜b)¹² = b³ et (⁶√b)¹² = b². Dans l\'ordre croissant : ' + tri.map(s => '(' + s.t + ')¹² = ' + pw(s.b, ex12[s.i]) + ' = ' + ent(s.P)).join(' ; ') + '. Le plus ' + (max ? 'grand' : 'petit') + ' est donc ' + rep.t + '. Piège : comparer seulement les nombres sous les racines ; ' + S.filter(s => s.b === bX)[0].t + ' a le plus ' + (max ? 'grand' : 'petit') + ' nombre sous sa racine, mais pas la plus ' + (max ? 'grande' : 'petite') + ' valeur, car l\'indice de la racine compte autant.');
  }
  return ex('Quel est le plus grand des nombres √3 ; ∛5 ; ∜8 et ⁶√30 ?', '⁶√30', ['⁶√30', '√3', '∛5', '∜8'],
    'On élève tous les nombres à la puissance 12. 3⁶ = 729 ; 5⁴ = 625 ; 8³ = 512 ; 30² = 900. Le plus grand est ⁶√30.');
}

/* 5b · Nombre de chiffres de très grandes puissances : 2^n (n ≥ 60), 5^n, produits de 4, 8, 16, 25, 125. */
function n5Chiffres(R){
  const v = R.int(1, 3);
  if (v === 1 || v === 2){
    let n = R.int(60, 130); while (n % 10 === 3) n = R.int(60, 130);
    const c = ch2(n), D2 = c.D, r2 = Math.pow(2, c.r);
    const base = 'On fait des paquets de dix facteurs 2 : 2¹⁰ = 1 024 = 1,024 × 10³, donc ' + paquets2(n) + ' = ' + (c.r ? r2 + ' × ' : '') + '1,024' + sup(c.q) + ' × ' + p10(3 * c.q) + '. Or 1,024' + sup(c.q) + ' est compris entre 1 et 1,4 (il vaut environ ' + nb(Math.pow(1.024, c.q), 2) + '), donc ' + (c.r ? r2 + ' × 1,024' + sup(c.q) + ' est entre ' + r2 + ' et ' + nb(r2 * 1.4, 1) : 'ce facteur') + ' : il a ' + nchif(r2) + ' chiffre' + (nchif(r2) > 1 ? 's' : '') + ' avant la virgule. Ainsi ' + pw(2, n) + ' a ' + nchif(r2) + ' + ' + (3 * c.q) + ' = ' + D2 + ' chiffres.';
    if (v === 1){
      const q = 'Combien de chiffres a le nombre ' + pw(2, n) + ' quand on l\'écrit en entier ?';
      return ex(q, String(D2), qcm(String(D2), [String(D2 - 1), String(D2 + 1), String(Math.round(n / 3))], j => String(D2 + 2 * pm(j))),
        base + ' Piège : remplacer 2³ = 8 par 10 est trop grossier et donne environ ' + Math.round(n / 3) + ' ; mal compter les rangs donne ' + (D2 - 1) + ' ou ' + (D2 + 1) + '.');
    }
    const D5 = n + 1 - D2;
    const q = 'Combien de chiffres a le nombre ' + pw(5, n) + ' quand on l\'écrit en entier ?';
    return ex(q, String(D5), qcm(String(D5), [String(D5 - 1), String(D2), String(D5 + 1)], j => String(D5 + 2 * pm(j))),
      'On passe par ' + pw(2, n) + ', car ' + pw(2, n) + ' × ' + pw(5, n) + ' = ' + p10(n) + '. ' + base + ' Donc ' + p10(D2 - 1) + ' < ' + pw(2, n) + ' < ' + p10(D2) + ' et ' + pw(5, n) + ' = ' + p10(n) + ' ÷ ' + pw(2, n) + ' est entre ' + p10(n - D2) + ' et ' + p10(n - D2 + 1) + ' : il a ' + n + ' − ' + D2 + ' + 1 = ' + D5 + ' chiffres. Piège : oublier le « + 1 » donne ' + (D5 - 1) + ' ; répondre le nombre de chiffres de ' + pw(2, n) + ' donne ' + D2 + '.');
  }
  for (let t = 0; t < 300; t++){
    const A2 = R.int(12, 40), B5 = R.int(12, 40), d = Math.abs(A2 - B5);
    if (d < 1 || d > 6) continue;
    const o2 = [[2, 1], [4, 2], [8, 3], [16, 4]].filter(o => A2 % o[1] === 0), o5 = [[5, 1], [25, 2], [125, 3]].filter(o => B5 % o[1] === 0);
    const f2 = R.pick(o2), f5 = R.pick(o5);
    if (f2[0] === 2 && f5[0] === 5) continue;
    const c = R.pick([1, 1, 3, 7, 9]), m = Math.min(A2, B5), rest = A2 > B5 ? Math.pow(2, d) : Math.pow(5, d);
    const D = m + nchif(c * rest), T2 = pw(f2[0], A2 / f2[1]), T5 = pw(f5[0], B5 / f5[1]);
    const fact = R.int(0, 1) ? [T2, T5] : [T5, T2], E = (c > 1 ? c + ' × ' : '') + fact.join(' × ');
    const naif = Math.min(A2 / f2[1], B5 / f5[1]) + nchif(c * rest);
    const q = 'Combien de chiffres a le nombre ' + E + ' quand on l\'écrit en entier ?';
    return ex(q, String(D), qcm(String(D), [String(naif), String(D - 1), String(D + 1), String(m)], j => String(D + 2 * pm(j))),
      'On réécrit tout en puissances de 2 et de 5 (4 = 2², 8 = 2³, 16 = 2⁴, 25 = 5², 125 = 5³), puis on forme des 10 avec les paires 2 × 5. ' + T2 + ' = ' + pw(2, A2) + ' et ' + T5 + ' = ' + pw(5, B5) + ', donc le nombre vaut ' + (c > 1 ? c + ' × ' : '') + (A2 > B5 ? pw(2, d) : pw(5, d)) + ' × ' + p10(m) + ' = ' + ent(c * rest) + ' × ' + p10(m) + ' : ' + nchif(c * rest) + ' chiffres suivis de ' + m + ' zéros, soit ' + D + ' chiffres. Piège : garder les exposants affichés sans réécrire les bases ' + f2[0] + ' et ' + f5[0] + (naif !== D ? ' mène à ' + naif + '.' : '.'));
  }
  return ex('Combien de chiffres a le nombre 8¹⁰ × 25¹⁴ quand on l\'écrit en entier ?', '29', ['29', '28', '30', '11'],
    'On réécrit tout en puissances de 2 et de 5. 8¹⁰ = 2³⁰ et 25¹⁴ = 5²⁸, donc le nombre vaut 2² × 10²⁸ = 4 × 10²⁸ : 29 chiffres.');
}

/* 5c · Ordre de grandeur précis de 2^n : il faut corriger l'approximation 2¹⁰ ≈ 10³. */
function n5Mantisse(R){
  for (let t = 0; t < 500; t++){
    const n = R.int(40, 100), q = Math.floor(n / 10), r = n % 10, v = Math.pow(2, n), mv = mant(v), m = Math.round(mv.M);
    if (r === 0 || m > 9 || Math.abs(mv.M - m) > 0.3) continue;
    const lin = mant(Math.pow(2, r) * (1 + 0.024 * q) * Math.pow(10, 3 * q));
    if (lin.K !== mv.K || Math.round(lin.M) !== m || Math.abs(lin.M - m) > 0.35) continue;
    const nv = mant(Math.pow(2, r) * Math.pow(10, 3 * q)), m0 = Math.round(nv.M) === 10 ? 1 : Math.round(nv.M), K0 = Math.round(nv.M) === 10 ? nv.K + 1 : nv.K;
    const f = (x, j) => sci(x, j), bonne = f(m, mv.K);
    const piege = (m0 !== m || K0 !== mv.K) ? f(m0, K0) : f(m > 1 ? m - 1 : m + 1, mv.K);
    const forme = R.int(0, 1);
    const qs = forme ? 'Parmi ces nombres, lequel est le plus proche de ' + pw(2, n) + ' ?'
      : 'Une quantité double à chaque étape en partant de 1. Après ' + n + ' étapes, elle vaut ' + pw(2, n) + '. Parmi ces nombres, lequel est le plus proche de cette valeur ?';
    return ex(qs, bonne, qcm(bonne, [piege, f(m, mv.K - 1), f(m, mv.K + 1)], j => f(m, mv.K + 1 + j)),
      'On écrit ' + paquets2(n) + ' = ' + (r ? Math.pow(2, r) + ' × ' : '') + '1,024' + sup(q) + ' × ' + p10(3 * q) + ', puis on estime 1,024' + sup(q) + ' ≈ 1 + ' + q + ' × 0,024 (un peu plus en réalité). On trouve 1,024' + sup(q) + ' ≈ ' + nb(Math.pow(1.024, q), 2) + ', donc ' + pw(2, n) + ' ≈ ' + (r ? Math.pow(2, r) + ' × ' : '') + nb(Math.pow(1.024, q), 2) + ' × ' + p10(3 * q) + ' ≈ ' + sci(nb(mv.M, 2), mv.K) + '. Le plus proche est ' + bonne + '.' + (m0 !== m || K0 !== mv.K ? ' Piège : remplacer chaque 2¹⁰ par 10³ sans correction donne environ ' + f(m0, K0) + ', car l\'erreur de 2,4 % se répète ' + q + ' fois.' : ' Piège : un rang de trop ou de moins dans la puissance de 10.'));
  }
  return ex('Parmi ces nombres, lequel est le plus proche de 2⁶⁵ ?', '4 × 10¹⁹', ['4 × 10¹⁹', '3 × 10¹⁹', '4 × 10¹⁸', '4 × 10²⁰'],
    'On écrit 2⁶⁵ = 32 × 1,024⁶ × 10¹⁸ ≈ 32 × 1,15 × 10¹⁸ ≈ 3,7 × 10¹⁹.');
}

/* =====================================================
   Aiguillage par niveau et compétence
   ===================================================== */
const GENS = {
  1: [n1Produit, n1Quotient, n1Comparer, n1Grands],
  2: [n2Chiffres2, n2Puissances, n2Racine, n2Fractions, n2Decimaux],
  3: [n3MemeExposant, n3RacineGrand, n3Fermi, n3Negatifs, n3Voisines, n3DeuxCinq],
  4: [n4Ancres, n4Racines, n4Chiffres5, n4SommeRacines, n4Sci],
  5: [n5Radicaux, n5Chiffres, n5Mantisse]
};
const SECOURS = () => ex('Parmi ces nombres, lequel est le plus proche de 51 × 1 980 ?', '100 000', ['100 000', '10 000', '1 000 000', '1 000'],
  'On arrondit chaque facteur à un nombre rond, puis on compte les zéros. 51 ≈ 50 et 1 980 ≈ 2 000, donc le produit vaut environ 100 000 (valeur exacte : 100 980).');

A.push({
  id: 'alb-04-ordres-grandeur',
  phase: 'albert',
  ordre: 4,
  theme: 'calcul',
  titre: 'Ordres de grandeur, encadrements et comparaisons',
  objectif: 'Estimer un calcul, encadrer une racine, compter les chiffres d\'une grande puissance et comparer fractions, puissances et racines, sans calculatrice.',
  lecon:
`<p class="lede">Au test, beaucoup de questions ne demandent pas un résultat exact mais <mark>le bon ordre de grandeur</mark> ou le plus grand de plusieurs nombres. Avec quatre réponses proposées, une estimation bien menée suffit presque toujours, et elle va beaucoup plus vite qu'un calcul posé.</p>
<h2>Ce que le test te demande</h2>
<p>Trois familles de questions reviennent. D'abord les estimations : un produit, un quotient ou une situation concrète (battements de cœur en un an, mots dans une bibliothèque) dont il faut trouver la valeur la plus proche parmi des réponses séparées par un facteur 10. Ensuite les encadrements : entre quels entiers se trouve √700 ou √10 + √30, combien de chiffres a 2⁴⁵ ou 5³⁰. Enfin les comparaisons : la plus grande de quatre fractions, de quatre puissances comme 2⁶⁰ et 3⁴⁵, ou de quatre expressions en x quand on sait seulement que 0 &lt; x &lt; 1. Les mauvaises réponses correspondent à des erreurs précises : un zéro oublié, un carré cru plus grand que le nombre, l'exposant le plus grand pris pour le nombre le plus grand.</p>
<h2>Les prérequis, en version courte</h2>
<ul>
<li>Les puissances de 10 : 10⁶ = un million, 10⁹ = un milliard ; 10<sup>a</sup> × 10<sup>b</sup> = 10<sup>a+b</sup> et 10<sup>a</sup> ÷ 10<sup>b</sup> = 10<sup>a−b</sup>.</li>
<li>Un nombre qui s'écrit avec D chiffres est compris entre 10<sup>D−1</sup> et 10<sup>D</sup> (10³ = 1 000 a 4 chiffres).</li>
<li>2¹⁰ = 1 024, à peine plus que 10³. Et 2 × 5 = 10, donc 2<sup>n</sup> × 5<sup>n</sup> = 10<sup>n</sup>.</li>
<li>Les carrés jusqu'à 20² = 400 et quelques racines : √2 ≈ 1,41 ; √3 ≈ 1,73 ; √5 ≈ 2,24 ; √10 ≈ 3,16.</li>
<li>(a<sup>n</sup>)<sup>k</sup> = a<sup>nk</sup> : par exemple 2⁶⁰ = (2⁴)¹⁵ = 16¹⁵.</li>
</ul>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. J'arrondis :</strong> je garde un ou deux chiffres non nuls par nombre et j'écris le reste en puissance de 10 (0,0021 ≈ 2 × 10⁻³ ; 39 000 ≈ 4 × 10⁴).</p>
<p><strong>2. Je sépare :</strong> je calcule les chiffres d'un côté, les puissances de 10 de l'autre, puis je recolle.</p>
<p><strong>3. Pour comparer, je ramène au même format :</strong> même dénominateur ou décimal pour les fractions, même exposant pour les puissances, même puissance 12 pour des racines d'indices différents, valeur test simple (x = 1/4, x = −1/2) pour les expressions en x.</p>
<p><strong>4. J'élimine :</strong> les réponses d'un mauvais ordre de grandeur tombent tout de suite ; je vérifie la dernière hésitation par un calcul exact.</p>
</div>
<table class="tbl">
<tr><th>Situation</th><th>Ordre croissant</th></tr>
<tr><td>0 &lt; x &lt; 1</td><td>x³ &lt; x² &lt; x &lt; √x &lt; 1/x &lt; 1/x²</td></tr>
<tr><td>x &gt; 1</td><td>1/x² &lt; 1/x &lt; √x &lt; x &lt; x² &lt; x³</td></tr>
<tr><td>−1 &lt; x &lt; 0</td><td>1/x &lt; x &lt; x³ &lt; x² &lt; −x &lt; 1/x²</td></tr>
<tr><td>x &lt; −1</td><td>x³ &lt; x &lt; 1/x &lt; 1/x² &lt; −x &lt; x²</td></tr>
</table>
<h2>Exemples résolus</h2>
<h3>1. Découverte : 51 × 1 980</h3>
<p>51 ≈ 50 et 1 980 ≈ 2 000, donc le produit vaut environ 50 × 2 000 = <mark>100 000</mark>. Parmi 10 000, 100 000 et 1 000 000, il n'y a aucune hésitation.</p>
<h3>2. Maîtrise : combien de chiffres a 2³⁴ ?</h3>
<p>2³⁴ = 2⁴ × (2¹⁰)³ ≈ 16 × 10⁹, un peu plus en réalité (environ 17 × 10⁹). C'est 17 suivi de 9 rangs : <mark>11 chiffres</mark>. Le piège serait de répondre 34, ou 10 en oubliant les deux chiffres de 16.</p>
<h3>3. Niveau du test : le plus grand de 2⁶⁰, 3⁴⁵, 5³⁰ et 7¹⁵</h3>
<p>Tous les exposants sont des multiples de 15 : 2⁶⁰ = 16¹⁵, 3⁴⁵ = 27¹⁵, 5³⁰ = 25¹⁵ et 7¹⁵. On compare 16, 27, 25 et 7 : le plus grand est <mark>3⁴⁵</mark>. Ni le plus grand exposant (60) ni la plus grande base (7) ne donnaient la réponse.</p>
<h3>4. Plus difficile : entre quels entiers se trouve √10 + √30 ?</h3>
<p>3,1² = 9,61 &lt; 10 &lt; 10,24 = 3,2², donc 3,1 &lt; √10 &lt; 3,2. De même 5,4² = 29,16 &lt; 30 &lt; 30,25 = 5,5². En additionnant, 8,5 &lt; √10 + √30 &lt; 8,7 : le nombre est <mark>entre 8 et 9</mark>. Attention, √10 + √30 n'est pas √40 ≈ 6,3.</p>
<h2>Les réflexes sans calculatrice</h2>
<ul>
<li>Une journée ≈ 86 400 s ≈ 10⁵ s ; une année ≈ 3 × 10⁷ s ≈ 5 × 10⁵ minutes.</li>
<li>√(a × 10 000) = √a × 100 : on groupe les zéros par deux. √50 000 = √5 × 100 ≈ 224, pas 71.</li>
<li>Pour 2<sup>n</sup>, fais des paquets de dix : 2<sup>n</sup> = 2<sup>r</sup> × (2<sup>10</sup>)<sup>q</sup> ≈ 2<sup>r</sup> × 10<sup>3q</sup>, puis corrige de 2,4 % par paquet si la précision compte.</li>
<li>Pour 5<sup>n</sup>, passe par 2<sup>n</sup> : si 2<sup>n</sup> a D chiffres, 5<sup>n</sup> en a n − D + 1.</li>
<li>Pour 2<sup>a</sup> × 5<sup>b</sup>, forme les 10 : 2¹² × 5¹⁰ = 4 × 10¹⁰, soit 11 chiffres et 10 zéros à la fin.</li>
<li>(c − d)(c + d) = c² − d² : de deux produits de même somme, le plus équilibré est le plus grand. Même idée pour √a + √b.</li>
<li>Diviser par un nombre plus petit que 1 agrandit le résultat.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Arrondis chaque nombre à un chiffre suivi d'une puissance de 10 pour estimer, et ramène les nombres à comparer à un même format (même exposant, même dénominateur, valeur test) avant de trancher.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Un zéro oublié ou en trop ; croire qu'un carré est toujours plus grand que le nombre (faux entre 0 et 1) ; oublier qu'un nombre négatif au cube reste négatif ; confondre le nombre de chiffres avec l'exposant ; juger une puissance sur son seul exposant ; écrire √a + √b = √(a + b) ; grouper les zéros par un au lieu de deux sous une racine.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>2¹⁰ ≈ 10³ et 2 × 5 = 10. Un nombre de D chiffres est entre 10<sup>D−1</sup> et 10<sup>D</sup>. Pour comparer des puissances, cherche un exposant commun. Entre 0 et 1, plus l'exposant est grand, plus le nombre est petit.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const e = R.pick(GENS[n])(R);
      if (e && typeof e.q === 'string' && typeof e.a === 'string' && Array.isArray(e.choix) && e.choix.length === 4) return e;
    } catch (err) { /* jamais d'exception vers l'appelant */ }
    return SECOURS();
  }
});

})();
