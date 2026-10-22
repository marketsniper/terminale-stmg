/* ===== Maths · Objectif Albert School : alb-30 · Fonctions : second degré, variations, croissance =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS.
   gen(level, R) : niveaux 1 à 5 (bornés), n'utilise que R.int, R.pick, R.shuffle, ne lève jamais d'exception.
   Toutes les réponses sont CALCULÉES par le code (aucune banque d'énoncés fixes, sauf la petite liste
   des comparaisons de puissances, dont chaque seuil est recalculé par une boucle).
   Sous-types :
   N1 image d'un nombre (carré d'un négatif), point sur une courbe, comparer quatre images,
      croissance par doublement ou triplement, tarifs affines (parking, taxi, forfait) ;
   N2 sommet par −b/(2a) (abscisse, extremum, coordonnées), forme canonique (lecture, condition sur m),
      symétrie des racines (milieu, extremum d'une forme factorisée, deux images égales), signe d'un trinôme
      (nombre d'entiers, ensemble, position par rapport à l'axe), dérivée (nombre dérivé, extremum local,
      intervalle de croissance), seuil entre deux tarifs, comparer deux images avec un tableau de variations ;
   N3 recette maximale prix × quantité, enclos contre un mur ou double enclos, seuil exponentiel et algue qui
      double, offre qui double contre offre fixe (montant du jour), bénéfice maximal, paramètre par symétrie,
      commission par tranches, nombre de solutions de f(x) = k avec un tableau ;
   N4 nombre de valeurs de m donnant 0, 1 ou 2 solutions, nombre de k donnant exactement n solutions (tableau),
      croissances comparées (totaux cumulés, deux applications, 2ⁿ contre n³), recette avec élasticité ou
      bénéfice avec coût, tangente droite et parabole, produit maximal sous contrainte, tranches à l'envers,
      nombre de solutions de f(x) = k pour une cubique ;
   N5 nombre de k donnant trois solutions (ou une seule) pour une cubique, tableau à quatre morceaux,
      droites y = mx qui coupent une parabole, boîte de volume maximal, x²y maximal à somme fixée,
      comparaisons délicates de puissances, plus grand minimum d'une famille de paraboles.
   Vérification indépendante : verifs/alb-30-fonctions-variations-verif.js (relit l'énoncé, force brute). */
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

/* ---------- écriture ---------- */
const SUP = {'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'};
const sup = n => String(n).split('').map(c => SUP[c] || c).join('');
const par = x => (x < 0 ? '(' + nb(x) + ')' : nb(x));
const pt = (x, y) => '(' + nb(x) + ' ; ' + nb(y) + ')';
const eur = x => { const r = Math.round(x * 100) / 100; return (Number.isInteger(r) ? nb(r) : nb(r, 2).replace(/,(\d)$/, (m, c) => ',' + c + '0')) + ' €'; };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const NZ = l => l.filter(x => x !== 0);
const evalP = (cs, x) => cs.reduce((s, c) => s * x + c, 0);
const pw = (x, p) => (p === 2 ? '²' : p === 3 ? '³' : '');
/* Polynôme écrit à partir de ses coefficients (degré le plus haut d'abord) : 2x² − 3x + 1. */
function poly(cs){
  const d = cs.length - 1; let s = '';
  cs.forEach((c, i) => {
    if (!c) return;
    const p = d - i, ab = Math.abs(c);
    const m = p === 0 ? nb(ab) : (ab === 1 ? '' : nb(ab)) + 'x' + pw(0, p);
    s += s ? (c < 0 ? ' − ' : ' + ') + m : (c < 0 ? '−' : '') + m;
  });
  return s || '0';
}
/* Même polynôme avec x remplacé par une valeur : 2 × (−3)² − 5 × (−3) + 1. */
function subst(cs, X){
  const d = cs.length - 1; let s = '';
  cs.forEach((c, i) => {
    if (!c) return;
    const p = d - i, ab = Math.abs(c), xs = p === 0 ? '' : par(X) + pw(0, p);
    const m = p === 0 ? nb(ab) : (ab === 1 ? xs : nb(ab) + ' × ' + xs);
    s += s ? (c < 0 ? ' − ' : ' + ') + m : (c < 0 ? '−' : '') + m;
  });
  return s || '0';
}
function termes(cs, X){ const d = cs.length - 1, t = []; cs.forEach((c, i) => { if (c) t.push(c * Math.pow(X, d - i)); }); return t; }
const somme = t => (t.length ? t.map((v, i) => (i === 0 ? nb(v) : (v < 0 ? ' − ' : ' + ') + nb(Math.abs(v)))).join('') : '0');
const calcul = (F, cs, X) => F + '(' + nb(X) + ') = ' + subst(cs, X) + ' = ' + somme(termes(cs, X)) + ' = ' + nb(evalP(cs, X));
const fac = r => (r === 0 ? 'x' : '(x ' + (r > 0 ? '− ' + nb(r) : '+ ' + nb(-r)) + ')');
const coefTxt = a => (a === 1 ? '' : a === -1 ? '−' : nb(a));
function canon(a, h, k){ return coefTxt(a) + (h === 0 ? 'x²' : fac(h) + '²') + (k ? (k < 0 ? ' − ' : ' + ') + nb(Math.abs(k)) : ''); }
function factor2(a, r1, r2){
  if (r1 === 0) return coefTxt(a) + 'x' + fac(r2);
  if (r2 === 0) return coefTxt(a) + 'x' + fac(r1);
  return coefTxt(a) + fac(r1) + fac(r2);
}
const ivExt = (r1, r2) => ']−∞ ; ' + nb(r1) + '[ ∪ ]' + nb(r2) + ' ; +∞[';
const ivInt = (r1, r2) => ']' + nb(r1) + ' ; ' + nb(r2) + '[';

/* Choix et texte des pièges : on ne commente que les distracteurs effectivement retenus. */
function fin(a, l, o){
  o = o || {};
  const fmt = o.fmt || (x => (typeof x === 'number' ? nb(x) : String(x)));
  const pas = o.pas || 1, min = o.min == null ? -Infinity : o.min;
  const A0 = fmt(a);
  const ok = l.filter(x => x && x[0] != null && (typeof x[0] !== 'number' || (isFinite(x[0]) && x[0] >= min)) && norm(fmt(x[0])) !== norm(A0));
  const vois = o.voisin || (k => { if (typeof a !== 'number') return null; const v = a + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * pas; return v >= min ? fmt(v) : null; });
  const choix = qcm(A0, ok.map(x => fmt(x[0])), vois);
  const dans = new Set(choix.map(norm)), vus = new Set([norm(A0)]), t = [];
  ok.forEach(([v, s]) => { const z = norm(fmt(v)); if (dans.has(z) && !vus.has(z)){ vus.add(z); if (s) t.push(s); } });
  return {a: A0, choix, piege: t.length ? 'Piège : ' + t.join(' ; ') + '.' : ''};
}
const sortie = (q, f, expl) => ({q, a: f.a, accept: null, choix: f.choix, expl: (expl + ' ' + f.piege).trim()});

/* ---------- tableaux de variations ---------- */
function tableau(R, P){
  const xs = [R.int(-6, -2)], vs = [R.int(-4, 6)];
  let dir = R.pick([1, -1]);
  for (let i = 0; i < P; i++){ xs.push(xs[i] + R.int(2, 4)); vs.push(vs[i] + dir * R.int(3, 8)); dir = -dir; }
  return {xs, vs};
}
function tableTxt(T){
  const L = [], n = T.xs.length - 1;
  for (let i = 0; i < n; i++) L.push('- sur [' + nb(T.xs[i]) + ' ; ' + nb(T.xs[i + 1]) + '], f ' + (T.vs[i + 1] > T.vs[i] ? 'croît' : 'décroît') + ' de ' + nb(T.vs[i]) + ' à ' + nb(T.vs[i + 1]) + (i === n - 1 ? '.' : ' ;'));
  return L.join('\n');
}
const introT = T => 'Une fonction f est définie sur [' + nb(T.xs[0]) + ' ; ' + nb(T.xs[T.xs.length - 1]) + ']. Son tableau de variations se résume ainsi (sur chaque intervalle, f est strictement croissante ou strictement décroissante) :\n' + tableTxt(T);
/* Nombre de solutions de f(x) = k : un morceau atteint k si k est entre ses valeurs extrêmes ; une valeur prise
   à la jonction de deux morceaux ne compte qu'une fois. */
function nbSol(vs, k){
  let n = 0;
  for (let i = 0; i < vs.length - 1; i++){
    const lo = Math.min(vs[i], vs[i + 1]), hi = Math.max(vs[i], vs[i + 1]);
    if (k >= lo && k <= hi){ n++; if (i > 0 && k === vs[i]) n--; }
  }
  return n;
}
const nbSolNaif = (vs, k) => { let n = 0; for (let i = 0; i < vs.length - 1; i++) if (k >= Math.min(vs[i], vs[i + 1]) && k <= Math.max(vs[i], vs[i + 1])) n++; return n; };
const nbSolOuvert = (vs, k) => { let n = 0; for (let i = 0; i < vs.length - 1; i++) if (k > Math.min(vs[i], vs[i + 1]) && k < Math.max(vs[i], vs[i + 1])) n++; return n; };
const sol = n => n + ' solution' + (n > 1 ? 's' : '');
function plages(vs){
  const mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), out = [];
  let k0 = mn, c0 = nbSol(vs, mn);
  for (let k = mn + 1; k <= mx + 1; k++){
    const c = k <= mx ? nbSol(vs, k) : -1;
    if (c !== c0){ out.push((k0 === k - 1 ? 'pour k = ' + nb(k0) : 'pour k de ' + nb(k0) + ' à ' + nb(k - 1)) + ', ' + sol(c0)); k0 = k; c0 = c; }
  }
  return out.join(' ; ');
}

/* =====================================================================
   NIVEAU 1 : évaluer et comparer
   ===================================================================== */

/* 1A · image d'un nombre par un trinôme */
function g1image(R){
  const a = R.pick([1, 1, 2, 3, -1, -2]), b = R.pick(NZ(range(-7, 7))), c = R.int(-9, 9);
  const X = R.int(1, 10) <= 7 ? -R.int(1, 5) : R.int(2, 5);
  const cs = [a, b, c], v = evalP(cs, X), F = R.pick(['f', 'g', 'h']), E = poly(cs), k = R.int(0, 2);
  const q = k === 0 ? 'On considère la fonction ' + F + ' définie par ' + F + '(x) = ' + E + '. Combien vaut ' + F + '(' + nb(X) + ') ?'
    : k === 1 ? "Quelle est l'image de " + nb(X) + ' par la fonction ' + F + ' définie par ' + F + '(x) = ' + E + ' ?'
    : 'Soit la fonction ' + F + ' définie par ' + F + '(x) = ' + E + '. Que vaut ' + F + '(' + nb(X) + ') ?';
  const l = [];
  if (X < 0){ const w = -a * X * X + b * X + c; l.push([w, nb(w) + ' vient de ' + par(X) + '² calculé comme ' + nb(-X * X) + " : le carré d'un nombre négatif est positif"]); }
  if (Math.abs(a) >= 2){ const w = a * a * X * X + b * X + c; l.push([w, nb(w) + ' vient de (' + nb(a) + ' × ' + par(X) + ')² : ' + nb(a) + 'x² veut dire ' + nb(a) + ' × x², on élève au carré avant de multiplier']); }
  { const w = a * X * X - b * X + c; l.push([w, nb(w) + ' vient d\'une erreur de signe sur le terme en x, qui vaut ' + nb(b) + ' × ' + par(X) + ' = ' + nb(b * X)]); }
  { const w = 2 * a * X + b * X + c; l.push([w, nb(w) + ' vient de x² confondu avec 2x']); }
  const f = fin(v, l);
  return sortie(q, f, 'On remplace x par ' + par(X) + ' partout' + (X < 0 ? ', avec des parenthèses,' : '') + ' et on calcule le carré avant de multiplier. ' + calcul(F, cs, X) + '.');
}

/* 1B · lequel de ces points est sur la courbe ? */
function g1point(R){
  const a = R.pick([1, 1, -1, 2]), b = R.pick(NZ(range(-6, 6))), c = R.int(-6, 6);
  const cs = [a, b, c], f = x => evalP(cs, x), E = poly(cs);
  const xs = R.shuffle([-4, -3, -2, -1, 1, 2, 3, 4]).slice(0, 4);
  const pts = [[xs[0], f(xs[0]), '']];
  for (let i = 1; i < 4; i++){
    const x = xs[i], vrai = f(x), cand = [];
    if (x < 0) cand.push([-a * x * x + b * x + c, ' (cette ordonnée vient de ' + par(x) + '² calculé comme ' + nb(-x * x) + ')']);
    cand.push([a * x * x - b * x + c, ' (erreur de signe sur le terme en x)']);
    cand.push([vrai + R.pick([-3, -2, -1, 1, 2, 3]), '']);
    const ok = cand.filter(cc => cc[0] !== vrai);
    const ch = R.pick(ok);
    pts.push([x, ch[0], ch[1]]);
  }
  const k = R.int(0, 1), ordre = R.shuffle(pts), liste = ordre.slice(0, 3).map(p => pt(p[0], p[1])).join(', ') + ' et ' + pt(ordre[3][0], ordre[3][1]);
  const q = k === 0 ? 'Un seul des points ' + liste + ' appartient à la courbe représentative de la fonction f définie par f(x) = ' + E + '. Lequel ?'
    : "La courbe d'équation y = " + E + ' passe par un seul des points ' + liste + '. Lequel ?';
  const det = pts.map((p, i) => 'f(' + nb(p[0]) + ') = ' + subst(cs, p[0]) + ' = ' + nb(f(p[0])) + (i === 0 ? ', donc ' + pt(p[0], p[1]) + ' est bien sur la courbe' : ', et non ' + nb(p[1]) + ' : ' + pt(p[0], p[1]) + " n'est pas sur la courbe" + p[2]));
  return {q, a: pt(pts[0][0], pts[0][1]), accept: null, choix: pts.map(p => pt(p[0], p[1])),
    expl: "Un point (x ; y) est sur la courbe quand son ordonnée est l'image de son abscisse : on calcule l'image de chaque abscisse proposée et on la compare à l'ordonnée. " + R.shuffle(det).join(' ; ') + '.'};
}

/* 1C · comparer quatre images */
function g1compare(R){
  for (let essai = 0; essai < 60; essai++){
    const a = R.pick([1, -1]), h = R.pick(NZ(range(-4, 4))), k = R.int(-5, 5);
    const cs = [a, -2 * a * h, a * h * h + k], f = x => evalP(cs, x), E = poly(cs);
    const xs = R.shuffle(range(-6, 8)).slice(0, 4).sort((u, v) => u - v), vs = xs.map(f);
    if (new Set(vs).size < 4) continue;
    const grand = R.int(0, 1) === 1, best = grand ? Math.max.apply(null, vs) : Math.min.apply(null, vs), i = vs.indexOf(best);
    const lib = x => 'f(' + nb(x) + ')';
    const q = 'On considère la fonction f définie par f(x) = ' + E + '. Parmi ' + xs.slice(0, 3).map(lib).join(', ') + ' et ' + lib(xs[3]) + ', laquelle est la plus ' + (grand ? 'grande' : 'petite') + ' ?';
    const loin = (a > 0) === grand;
    return {q, a: lib(xs[i]), accept: null, choix: xs.map(lib),
      expl: 'On calcule les quatre images, puis on les compare ; on peut aussi utiliser la forme canonique et la distance à l\'axe de symétrie. '
        + xs.map((x, j) => lib(x) + ' = ' + nb(vs[j])).join(' ; ') + '. La plus ' + (grand ? 'grande' : 'petite') + ' est ' + lib(xs[i]) + ' = ' + nb(best) + '. '
        + 'Contrôle : f(x) = ' + canon(a, h, k) + ', donc f(x) est d\'autant plus ' + (a > 0 ? 'grand' : 'petit') + ' que x est loin de ' + nb(h) + ' ; ici on cherche le nombre le plus ' + (loin ? 'éloigné' : 'proche') + ' de ' + nb(h) + ', et non simplement le plus grand ou le plus petit nombre.'};
  }
  return g1image(R);
}

/* 1D · croissance par doublement ou triplement */
function g1croissance(R){
  const k = R.int(0, 2);
  let q, S0, f, n, etapes, fmt = nb;
  if (k === 0){
    f = 2; n = R.int(3, 6); S0 = R.pick([50, 100, 150, 200, 300, 500]); const H = R.int(7, 12);
    q = 'Une colonie de bactéries double toutes les heures. À ' + H + ' h, elle compte ' + nb(S0) + ' bactéries. Combien en comptera-t-elle à ' + (H + n) + ' h ?';
    etapes = 'De ' + H + ' h à ' + (H + n) + ' h, il y a ' + n + ' heures, donc ' + n + ' doublements';
  } else if (k === 1){
    f = 3; n = R.int(2, 4); S0 = R.pick([20, 50, 100, 200, 300, 400]); const d = R.int(0, 6 - n);
    q = "Le nombre de vues d'une vidéo triple chaque jour. " + cap(JOURS[d]) + ' soir, elle totalise ' + nb(S0) + ' vues. Combien en totalisera-t-elle ' + JOURS[d + n] + ' soir ?';
    etapes = 'Du ' + JOURS[d] + ' au ' + JOURS[d + n] + ', il y a ' + n + ' jours, donc ' + n + ' multiplications par 3';
  } else {
    f = 2; n = R.int(2, 5); S0 = R.pick([500, 1000, 1500, 2000, 3000]); const T = R.pick([5, 8, 10, 12]); fmt = eur;
    q = "La valeur d'une œuvre d'art double tous les " + T + " ans. Elle vaut aujourd'hui " + eur(S0) + '. Combien vaudra-t-elle dans ' + (n * T) + ' ans ?';
    etapes = 'En ' + (n * T) + ' ans, il y a ' + (n * T) + ' ÷ ' + T + ' = ' + n + ' périodes de ' + T + ' ans, donc ' + n + ' doublements';
  }
  const v = S0 * Math.pow(f, n);
  const l = [
    [S0 * Math.pow(f, n - 1), fmt(S0 * Math.pow(f, n - 1)) + ' compte une multiplication de moins que le nombre d\'étapes'],
    [S0 * f * n, fmt(S0 * f * n) + ' vient de ' + nb(S0) + ' × ' + f + ' × ' + n + ' : on ne multiplie pas par ' + f + ' × ' + n + ', mais par ' + f + sup(n)],
    [S0 + S0 * (f - 1) * n, fmt(S0 + S0 * (f - 1) * n) + ' suppose une croissance linéaire, où l\'on ajouterait chaque fois la même quantité'],
    [S0 * Math.pow(f, n + 1), fmt(S0 * Math.pow(f, n + 1)) + ' compte une multiplication de trop']
  ];
  const F = fin(v, l, {fmt, pas: S0});
  return sortie(q, F, (f === 2 ? 'Doubler' : 'Tripler') + ' à chaque étape revient à multiplier par ' + f + ' autant de fois qu\'il y a d\'étapes : on compte d\'abord les étapes. '
    + etapes + '. ' + nb(S0) + ' × ' + f + sup(n) + ' = ' + nb(S0) + ' × ' + nb(Math.pow(f, n)) + ' = ' + fmt(v) + '.');
}

/* 1E · tarifs affines */
function g1tarif(R){
  const k = R.int(0, 2);
  let q, v, l, expl;
  if (k === 0){
    const P = R.pick([2, 3, 4, 5]), Q = R.pick([1, 1.5, 2, 2.5]), N = R.int(3, 8); v = P + (N - 1) * Q;
    q = 'Un parking coûte ' + eur(P) + ' pour la première heure, puis ' + eur(Q) + ' par heure supplémentaire. Combien paie-t-on pour un stationnement de ' + N + ' heures ?';
    l = [[P + N * Q, eur(P + N * Q) + ' compte la première heure deux fois'], [N * P, eur(N * P) + ' fait payer toutes les heures au prix de la première'], [(N - 1) * Q, eur((N - 1) * Q) + ' oublie la première heure']];
    expl = 'On paie la première heure à part, puis chacune des heures suivantes : on compte d\'abord les heures supplémentaires. Il y a ' + N + ' − 1 = ' + (N - 1) + ' heures supplémentaires : ' + eur(P) + ' + ' + (N - 1) + ' × ' + eur(Q) + ' = ' + eur(v) + '.';
  } else if (k === 1){
    const P = R.pick([2, 3, 4, 5]), Q = R.pick([1.2, 1.5, 2]), D = R.pick([5, 8, 10, 12, 15, 20]); v = P + Q * D;
    q = 'Un taxi facture ' + eur(P) + ' de prise en charge, puis ' + eur(Q) + ' par kilomètre parcouru. Combien coûte une course de ' + D + ' km ?';
    l = [[Q * D, eur(Q * D) + ' oublie la prise en charge'], [(P + Q) * D, eur((P + Q) * D) + ' fait payer la prise en charge à chaque kilomètre'], [P + Q * (D - 1), eur(P + Q * (D - 1)) + ' oublie un kilomètre']];
    expl = 'Le prix est une fonction affine de la distance : prise en charge fixe + prix au kilomètre × nombre de kilomètres. ' + eur(P) + ' + ' + D + ' × ' + eur(Q) + ' = ' + eur(P) + ' + ' + eur(Q * D) + ' = ' + eur(v) + '.';
  } else {
    const F = R.pick([10, 15, 20, 25]), G = R.pick([5, 10, 20, 50]), Q = R.pick([1, 2, 3, 5]), C = G + R.int(2, 8); v = F + (C - G) * Q;
    q = 'Un forfait mobile coûte ' + eur(F) + ' par mois et comprend ' + G + ' Go ; chaque Go supplémentaire est facturé ' + eur(Q) + '. Combien paie-t-on un mois où l\'on a consommé ' + C + ' Go ?';
    l = [[F + C * Q, eur(F + C * Q) + ' facture les ' + C + ' Go en supplément, alors que ' + G + ' Go sont compris'], [C * Q, eur(C * Q) + ' oublie le prix du forfait'], [F + (C - G + 1) * Q, eur(F + (C - G + 1) * Q) + ' compte un Go supplémentaire de trop']];
    expl = 'Seuls les Go au-delà du forfait sont facturés en plus : on calcule d\'abord le dépassement. ' + C + ' − ' + G + ' = ' + (C - G) + ' Go en plus, donc ' + eur(F) + ' + ' + (C - G) + ' × ' + eur(Q) + ' = ' + eur(v) + '.';
  }
  return sortie(q, fin(v, l, {fmt: eur, pas: 1, min: 0}), expl);
}

/* =====================================================================
   NIVEAU 2 : sommet, signe, variations simples
   ===================================================================== */

/* 2A · sommet d'une parabole écrite sous forme développée */
function g2sommet(R){
  const a = R.pick([1, 1, -1, 2, -2, 3]), h = R.pick(NZ(range(-5, 5))), k = R.int(-9, 9);
  const b = -2 * a * h, c = a * h * h + k, cs = [a, b, c], f = x => evalP(cs, x), E = poly(cs);
  const ext = a > 0 ? 'minimum' : 'maximum', t = R.int(0, 2), v = R.int(0, 1);
  const debut = "L'abscisse du sommet d'une parabole y = ax² + bx + c vaut −b/(2a), là où la dérivée 2ax + b s'annule, et l'extremum est l'image de cette abscisse. "
    + 'Ici a = ' + nb(a) + ' et b = ' + nb(b) + ', donc −b/(2a) = ' + nb(-b) + ' ÷ ' + par(2 * a) + ' = ' + nb(h) + '. ';
  const sens = 'Comme a = ' + nb(a) + (a > 0 ? ' est positif, la parabole est tournée vers le haut : le sommet est un minimum.' : ' est négatif, la parabole est tournée vers le bas : le sommet est un maximum.');
  const img = calcul('f', cs, h) + '. ';
  let q, F;
  if (t === 0){
    q = v ? 'En quelle valeur de x la fonction f définie par f(x) = ' + E + ' atteint-elle son ' + ext + ' ?'
      : 'La fonction f définie par f(x) = ' + E + ' admet un ' + ext + '. Pour quelle valeur de x est-il atteint ?';
    F = fin(h, [[-h, nb(-h) + " vient d'une erreur de signe dans −b/(2a)"], [2 * h, nb(2 * h) + ' vient de −b/a : on a oublié le 2'],
      Math.abs(a) >= 2 ? [a * h, nb(a * h) + ' vient de −b/2 : on a oublié de diviser par a'] : null, [k, nb(k) + ' est la valeur du ' + ext + ", pas l'abscisse où il est atteint"]]);
    return sortie(q, F, debut + sens);
  }
  if (t === 1){
    q = v ? 'Quel est le ' + ext + ' de la fonction f définie par f(x) = ' + E + ' ?'
      : 'Quelle est la plus ' + (a > 0 ? 'petite' : 'grande') + ' valeur que peut prendre ' + E + ' lorsque x parcourt les nombres réels ?';
    F = fin(k, [[c, nb(c) + " est f(0), l'ordonnée à l'origine, pas le " + ext], [f(-h), nb(f(-h)) + ' est l\'image de ' + nb(-h) + ' : erreur de signe sur l\'abscisse du sommet'],
      [h, nb(h) + " est l'abscisse du sommet, pas la valeur du " + ext], k ? [-k, nb(-k) + ' : erreur de signe dans le calcul de f(' + nb(h) + ')'] : null]);
    return sortie(q, F, debut + img + sens);
  }
  q = "Quelles sont les coordonnées du sommet de la parabole d'équation y = " + E + ' ?';
  F = fin(pt(h, k), [[pt(-h, f(-h)), pt(-h, f(-h)) + " vient d'une erreur de signe dans −b/(2a)"], [pt(h, c), pt(h, c) + ' prend c comme ordonnée du sommet, alors que c = f(0)'],
    [pt(k, h), pt(k, h) + ' inverse abscisse et ordonnée'], [pt(2 * h, c), pt(2 * h, c) + ' vient de −b/a : on a oublié le 2']],
    {voisin: j => pt(h, k + (j % 2 ? 1 : -1) * Math.ceil(j / 2))});
  return sortie(q, F, debut + img + 'Le sommet est le point ' + pt(h, k) + '.');
}

/* 2B · forme canonique */
function g2canon(R){
  const a = R.pick([1, 2, 3, -1, -2, -3]), h = R.pick(NZ(range(-7, 7))), k = R.pick(NZ(range(-9, 9)));
  const C = canon(a, h, k), ext = a > 0 ? 'minimum' : 'maximum', t = R.int(0, 2);
  const lect = 'Dans la forme canonique a(x − α)² + β, le sommet de la parabole est le point (α ; β) : α est la valeur qui annule la parenthèse et β se lit directement. '
    + 'Ici ' + fac(h) + ' s\'annule pour x = ' + nb(h) + ', donc α = ' + nb(h) + ' et β = ' + nb(k) + '. ';
  const carre = 'Un carré est toujours positif ou nul et a = ' + nb(a) + (a > 0 ? ' est positif, donc f(x) ≥ ' : ' est négatif, donc f(x) ≤ ') + nb(k) + ', avec égalité pour x = ' + nb(h) + '.';
  let q, F;
  if (t === 0){
    q = 'La fonction f est définie par f(x) = ' + C + '. Quel est son ' + ext + ' ?';
    F = fin(k, [[h, nb(h) + " est l'abscisse du sommet, pas la valeur du " + ext], [a, nb(a) + ' est le coefficient a, qui donne seulement le sens de la parabole'],
      [-h, nb(-h) + ' mélange abscisse et erreur de signe'], [-k, nb(-k) + ' : erreur de signe sur β']]);
    return sortie(q, F, lect + carre + ' Le ' + ext + ' vaut donc ' + nb(k) + '.');
  }
  if (t === 1){
    q = 'La fonction f est définie par f(x) = ' + C + '. Pour quelle valeur de x atteint-elle son ' + ext + ' ?';
    F = fin(h, [[-h, 'la parenthèse ' + fac(h) + " s'annule pour x = " + nb(h) + ', pas pour x = ' + nb(-h)], [k, nb(k) + ' est la valeur du ' + ext + ", pas l'abscisse"],
      [a, nb(a) + ' est le coefficient a, qui donne seulement le sens de la parabole']]);
    return sortie(q, F, lect + carre);
  }
  const gt = a > 0 ? '>' : '<', lt = a > 0 ? '<' : '>', ge = a > 0 ? '≥' : '≤';
  const rep = 'm ' + gt + ' ' + nb(k);
  q = 'On considère la fonction f définie par f(x) = ' + C + ". Pour quelles valeurs du réel m l'équation f(x) = m admet-elle exactement deux solutions ?";
  F = fin(rep, [['m ' + lt + ' ' + nb(k), 'm ' + lt + ' ' + nb(k) + ' inverse le sens : la parabole est tournée vers le ' + (a > 0 ? 'haut' : 'bas')],
    ['m ' + ge + ' ' + nb(k), 'm ' + ge + ' ' + nb(k) + ' inclut m = ' + nb(k) + ', qui ne donne qu\'une solution, x = ' + nb(h)],
    ['m ' + gt + ' ' + nb(h), 'm ' + gt + ' ' + nb(h) + " confond l'abscisse et l'ordonnée du sommet"], ['m ' + gt + ' ' + nb(-k), 'm ' + gt + ' ' + nb(-k) + ' : erreur de signe sur β']]);
  return sortie(q, F, lect + 'La parabole est tournée vers le ' + (a > 0 ? 'haut' : 'bas') + '. La droite horizontale y = m la coupe en deux points quand elle passe strictement '
    + (a > 0 ? 'au-dessus' : 'au-dessous') + ' du sommet, en un seul point quand m = ' + nb(k) + ', et ne la rencontre pas sinon. Il faut donc ' + rep + '.');
}

/* 2C · symétrie : le sommet est au milieu des racines */
function g2racines(R){
  const t = R.int(0, 2);
  if (t === 0){
    const r1 = R.int(-8, 5), r2 = r1 + 2 * R.int(1, 6), m = (r1 + r2) / 2;
    const q = "Une parabole coupe l'axe des abscisses aux points d'abscisses " + nb(r1) + ' et ' + nb(r2) + ". Quelle est l'abscisse de son sommet ?";
    const F = fin(m, [[(r2 - r1) / 2, nb((r2 - r1) / 2) + " est la moitié de l'écart entre les racines, pas leur milieu"], [r1 + r2, nb(r1 + r2) + ' est la somme des racines : il fallait la diviser par 2'],
      [-m, nb(-m) + ' : erreur de signe'], [r2 - r1, nb(r2 - r1) + " est l'écart entre les racines"]]);
    return sortie(q, F, "Une parabole est symétrique par rapport à la droite verticale qui passe par son sommet, donc ses deux points d'intersection avec l'axe sont symétriques et l'abscisse du sommet est leur moyenne. ("
      + nb(r1) + ' + ' + par(r2) + ') ÷ 2 = ' + nb(r1 + r2) + ' ÷ 2 = ' + nb(m) + '.');
  }
  if (t === 1){
    const Ac = R.pick([1, -1, 2, -2]), r1 = R.int(-7, 4), r2 = r1 + 2 * R.int(1, 5), m = (r1 + r2) / 2, d = (r2 - r1) / 2, val = -Ac * d * d;
    const E = factor2(Ac, r1, r2), ext = Ac > 0 ? 'minimum' : 'maximum';
    const q = 'On considère la fonction f définie par f(x) = ' + E + '. Quel est le ' + ext + ' de f ?';
    const F = fin(val, [[Ac * r1 * r2, nb(Ac * r1 * r2) + " est f(0), pas l'extremum"], [m, nb(m) + " est l'abscisse du sommet, pas la valeur du " + ext],
      [-val, nb(-val) + ' : erreur de signe dans le produit'], [Ac * (r2 - r1), null]]);
    return sortie(q, F, "Le sommet est à mi-chemin entre les deux racines, et l'extremum est l'image de cette abscisse. Les racines sont " + nb(r1) + ' et ' + nb(r2)
      + ' (chaque facteur s\'annule), donc le sommet a pour abscisse (' + nb(r1) + ' + ' + par(r2) + ') ÷ 2 = ' + nb(m) + '. f(' + nb(m) + ') = ' + nb(Ac) + ' × ' + par(m - r1) + ' × ' + par(m - r2)
      + ' = ' + nb(val) + '. Comme le coefficient ' + nb(Ac) + ' est ' + (Ac > 0 ? 'positif, c\'est un minimum.' : 'négatif, c\'est un maximum.'));
  }
  const x1 = R.int(-7, 6), x2 = x1 + 2 * R.int(1, 6), V = R.int(-9, 12), m = (x1 + x2) / 2;
  const q = 'Une fonction f du second degré vérifie f(' + nb(x1) + ') = ' + nb(V) + ' et f(' + nb(x2) + ') = ' + nb(V) + '. En quelle valeur de x sa courbe atteint-elle son sommet ?';
  const F = fin(m, [[V, nb(V) + ' est la valeur commune des deux images, pas une abscisse'], [(x2 - x1) / 2, nb((x2 - x1) / 2) + " est la moitié de l'écart, pas le milieu"],
    [x1 + x2, nb(x1 + x2) + ' est la somme : il fallait la diviser par 2'], [x2 - x1, nb(x2 - x1) + " est l'écart entre les deux abscisses"]]);
  return sortie(q, F, "Deux points d'une parabole à la même hauteur sont symétriques par rapport à l'axe vertical qui passe par le sommet, donc l'abscisse du sommet est la moyenne de leurs abscisses. ("
    + nb(x1) + ' + ' + par(x2) + ') ÷ 2 = ' + nb(m) + '.');
}

/* 2D · signe d'un trinôme */
function g2signe(R){
  const t = R.int(0, 2);
  if (t === 0){
    const Ac = R.pick([1, 2, -1, -3]), r1 = R.int(-7, 4), r2 = r1 + R.int(2, 9), strict = R.int(0, 1) === 1, E = factor2(Ac, r1, r2);
    const rel = Ac > 0 ? (strict ? '< 0' : '≤ 0') : (strict ? '> 0' : '≥ 0');
    const ans = strict ? r2 - r1 - 1 : r2 - r1 + 1, autre = strict ? r2 - r1 + 1 : r2 - r1 - 1;
    const q = R.int(0, 1) ? 'Combien de nombres entiers x vérifient ' + E + ' ' + rel + ' ?' : 'On pose f(x) = ' + E + '. Combien de nombres entiers x vérifient f(x) ' + rel + ' ?';
    const lo = strict ? r1 + 1 : r1, hi = strict ? r2 - 1 : r2;
    const F = fin(ans, [[autre, nb(autre) + (strict ? ' compte aussi les racines, où le trinôme vaut 0' : ' oublie les racines, où le trinôme vaut 0 et convient')],
      ['une infinité', "« une infinité » inverse le signe : l'inégalité est vraie entre les racines, pas à l'extérieur"], [r2 - r1, nb(r2 - r1) + ' ne compte qu\'une seule des deux bornes']]);
    return sortie(q, F, 'Un trinôme a(x − x₁)(x − x₂) a le signe de a à l\'extérieur des racines et le signe contraire entre les racines. Ici les racines sont ' + nb(r1) + ' et ' + nb(r2)
      + ' et le coefficient ' + nb(Ac) + ' est ' + (Ac > 0 ? 'positif : le trinôme est négatif entre les racines.' : 'négatif : le trinôme est positif entre les racines.')
      + ' Les entiers qui conviennent vont de ' + nb(lo) + ' à ' + nb(hi) + (strict ? ' (racines exclues, car l\'inégalité est stricte)' : ' (racines incluses)') + ' : il y en a ' + nb(hi) + ' − ' + par(lo) + ' + 1 = ' + nb(ans) + '.');
  }
  if (t === 1){
    let r1, r2;
    do { r1 = R.int(-7, 5); r2 = r1 + R.int(2, 8); } while (r1 === 0 || r2 === 0 || r1 === -r2);
    const Ac = R.pick([1, -1, 2, -2]), pos = R.int(0, 1) === 1, E = factor2(Ac, r1, r2);
    const dehors = (Ac > 0) === pos, ans = dehors ? ivExt(r1, r2) : ivInt(r1, r2);
    const q = 'On considère la fonction f définie par f(x) = ' + E + '. Sur quel ensemble a-t-on f(x) ' + (pos ? '> 0' : '< 0') + ' ?';
    const F = fin(ans, [[dehors ? ivInt(r1, r2) : ivExt(r1, r2), dehors ? ivInt(r1, r2) + ' inverse les signes' : ivExt(r1, r2) + ' inverse les signes'],
      [dehors ? ivExt(-r2, -r1) : ivInt(-r2, -r1), 'les racines ne sont pas ' + nb(-r1) + ' et ' + nb(-r2) + ' : ' + fac(r1) + " s'annule pour x = " + nb(r1)],
      [dehors ? ivInt(-r2, -r1) : ivExt(-r2, -r1), null]]);
    return sortie(q, F, 'Un trinôme a(x − x₁)(x − x₂) a le signe de a à l\'extérieur des racines et le signe contraire entre les racines. Les racines sont ' + nb(r1) + ' et ' + nb(r2)
      + ' et le coefficient ' + nb(Ac) + ' est ' + (Ac > 0 ? 'positif' : 'négatif') + ', donc f(x) est ' + (Ac > 0 ? 'positif' : 'négatif') + ' à l\'extérieur des racines et '
      + (Ac > 0 ? 'négatif' : 'positif') + ' entre elles. On a f(x) ' + (pos ? '> 0' : '< 0') + ' sur ' + ans + '.');
  }
  const a = R.pick([1, 1, -1, 2]), h = R.pick(NZ(range(-5, 5))), k = R.int(-6, 6), cs = [a, -2 * a * h, a * h * h + k], E = poly(cs);
  const P = ['Elle est entièrement au-dessus de l\'axe', 'Elle est entièrement au-dessous de l\'axe', 'Elle touche l\'axe en un seul point', 'Elle coupe l\'axe en deux points'];
  const ans = k === 0 ? P[2] : (a > 0) === (k > 0) ? P[a > 0 ? 0 : 1] : P[3];
  const q = "Comment la parabole d'équation y = " + E + " est-elle placée par rapport à l'axe des abscisses ?";
  return {q, a: ans, accept: null, choix: P.slice(),
    expl: 'On cherche le sommet et le sens de la parabole : un sommet au-dessus de l\'axe avec une parabole tournée vers le haut ne touche jamais l\'axe, etc. Le sommet a pour abscisse −b/(2a) = '
      + nb(2 * a * h) + ' ÷ ' + par(2 * a) + ' = ' + nb(h) + ' et ' + calcul('f', cs, h) + ', donc y = ' + canon(a, h, k) + '. La parabole est tournée vers le ' + (a > 0 ? 'haut' : 'bas') + ' et son sommet est '
      + (k === 0 ? 'sur l\'axe : elle le touche en un seul point.' : (k > 0 ? 'au-dessus' : 'au-dessous') + ' de l\'axe : ' + ((a > 0) === (k > 0) ? 'elle ne le traverse jamais.' : 'elle le coupe en deux points.'))};
}

/* 2E · dérivée d'un polynôme */
function g2deriv(R){
  const t = R.int(0, 2);
  if (t === 0){
    const cs = [R.pick([1, 2, -1]), R.int(-5, 5), R.int(-9, 9), R.int(-9, 9)], X = R.pick([-3, -2, -1, 1, 2, 3]), E = poly(cs);
    const d = [3 * cs[0], 2 * cs[1], cs[2]], v = evalP(d, X);
    const q = R.int(0, 1) ? 'On considère la fonction f définie par f(x) = ' + E + ". Combien vaut f'(" + nb(X) + ') ?'
      : 'Quel est le nombre dérivé en x = ' + nb(X) + ' de la fonction f définie par f(x) = ' + E + ' ?';
    const F = fin(v, [[evalP(cs, X), nb(evalP(cs, X)) + " est f(" + nb(X) + "), pas f'(" + nb(X) + ')'], [evalP([cs[0], cs[1], cs[2]], X), nb(evalP([cs[0], cs[1], cs[2]], X)) + " oublie de multiplier par l'exposant : (x³)' = 3x² et (x²)' = 2x"],
      cs[3] ? [v + cs[3], nb(v + cs[3]) + ' garde la constante, alors que sa dérivée vaut 0'] : null]);
    return sortie(q, F, "On dérive terme à terme avec (x³)' = 3x², (x²)' = 2x, (x)' = 1 et une constante qui disparaît, puis on remplace x par " + par(X) + ". f'(x) = " + poly(d) + ', donc ' + calcul("f'", d, X) + '.');
  }
  if (t === 1){
    const r1 = R.int(-4, 3), r2 = r1 + R.int(1, 3), S = r1 + r2, P = r1 * r2, c = R.int(-5, 5);
    const cs = [2, -3 * S, 6 * P, c], E = poly(cs), maxi = R.int(0, 1) === 1, ans = maxi ? r1 : r2, autre = maxi ? r2 : r1;
    const facs = r1 === 0 ? 'x' + fac(r2) : r2 === 0 ? 'x' + fac(r1) : fac(r1) + fac(r2);
    const q = 'En quelle valeur de x la fonction f définie par f(x) = ' + E + ' admet-elle un ' + (maxi ? 'maximum' : 'minimum') + ' local ?';
    const F = fin(ans, [[autre, nb(autre) + ' est le ' + (maxi ? 'minimum' : 'maximum') + " local : f' y passe de " + (maxi ? '− à +' : '+ à −')], [-ans, nb(-ans) + ' : erreur de signe en lisant les racines de f\''],
      (S % 2 === 0) ? [S / 2, nb(S / 2) + " est le milieu des racines de f', pas une racine"] : null, [3 * S, null]]);
    return sortie(q, F, "On dérive, on factorise f'(x), puis on lit son signe : un maximum local est là où f' passe de + à −, un minimum local là où f' passe de − à +. f'(x) = "
      + poly([6, -6 * S, 6 * P]) + ' = 6' + facs + ". Ce trinôme est positif à l'extérieur des racines " + nb(r1) + ' et ' + nb(r2) + ' et négatif entre elles : f croît, puis décroît à partir de ' + nb(r1)
      + ' (maximum local), puis croît à nouveau à partir de ' + nb(r2) + ' (minimum local). Réponse : ' + nb(ans) + '.');
  }
  const p = R.pick([2, 3, 4, 5]), c = R.pick([0, 0, 1, -1, 2, 5]), cs = [1, 0, -3 * p * p, c], E = poly(cs), croit = R.int(0, 1) === 1;
  const ans = croit ? '[' + p + ' ; +∞[' : '[0 ; ' + p + ']';
  const q = 'Sur [0 ; +∞[, on considère la fonction f définie par f(x) = ' + E + '. Sur quel intervalle f est-elle ' + (croit ? 'croissante' : 'décroissante') + ' ?';
  const F = fin(ans, [[croit ? '[0 ; ' + p + ']' : '[' + p + ' ; +∞[', 'inversion des sens de variation'],
    [croit ? '[' + (p * p) + ' ; +∞[' : '[0 ; ' + (p * p) + ']', 'x² = ' + (p * p) + ' donne x = ' + p + ', pas ' + (p * p)],
    [croit ? '[√' + (3 * p * p) + ' ; +∞[' : '[0 ; √' + (3 * p * p) + ']', "√" + (3 * p * p) + " annule f(x)/x, pas f'(x) : on a cherché où f s'annule au lieu de sa dérivée"]]);
  return sortie(q, F, "Le sens de variation se lit sur le signe de la dérivée : on dérive, on cherche où f' s'annule, puis son signe. f'(x) = 3x² − " + (3 * p * p) + ' = 3(x² − ' + (p * p) + ') = 3(x − ' + p + ')(x + ' + p + "). Sur [0 ; +∞[, f'(x) est négatif avant "
    + p + ' et positif après : f décroît sur [0 ; ' + p + '] et croît sur [' + p + ' ; +∞[.');
}

/* 2F · seuil entre deux tarifs */
function g2seuil(R){
  const ecart = R.pick([1, 2, 3, 4, 5]), n = R.int(4, 20), F0 = n * ecart, u = R.int(2, 8), v = u + ecart, k = R.int(0, 2), egal = R.int(0, 1) === 1;
  const U = k === 0 ? ['séance', 'séances', 'de séances'] : k === 1 ? ['place', 'places', 'de places'] : ['heure', 'heures', "d'heures"];
  const txt = k === 0 ? 'Une salle de sport propose deux formules. Formule A : ' + eur(F0) + " d'abonnement par mois, puis " + eur(u) + ' par séance. Formule B : ' + eur(v) + ' par séance, sans abonnement.'
    : k === 1 ? 'Un cinéma propose une carte annuelle à ' + eur(F0) + ' qui fait payer la place ' + eur(u) + ' (formule A) ; sans carte, la place coûte ' + eur(v) + ' (formule B).'
    : "Un loueur de vélos propose deux formules. Formule A : " + eur(F0) + " de frais d'inscription, puis " + eur(u) + ' par heure. Formule B : ' + eur(v) + ' par heure, sans frais.';
  const q = txt + (egal ? ' Pour combien ' + U[2] + ' les deux formules coûtent-elles exactement le même prix ?' : ' À partir de combien ' + U[2] + ' la formule A devient-elle strictement moins chère que la formule B ?');
  const ans = egal ? n : n + 1;
  const l = [[egal ? n + 1 : n, egal ? null : 'pour ' + n + ' ' + U[1] + ', les deux formules coûtent le même prix : A n\'est pas encore strictement moins chère']];
  if (F0 % v === 0) l.push([F0 / v, nb(F0 / v) + ' vient de ' + nb(F0) + ' ÷ ' + nb(v) + " : il faut diviser par l'écart de prix par " + U[0] + ', pas par le prix de B']);
  if (F0 % u === 0) l.push([F0 / u, nb(F0 / u) + ' vient de ' + nb(F0) + ' ÷ ' + nb(u) + " : il faut diviser par l'écart de prix par " + U[0]]);
  l.push([n - 1, null]);
  return sortie(q, fin(ans, l, {min: 1}), "Chaque " + U[0] + ' coûte ' + eur(ecart) + " de moins avec A : il faut assez " + U[2] + ' pour rattraper le coût fixe, donc on divise le coût fixe par l\'écart de prix. '
    + nb(F0) + ' ÷ ' + nb(ecart) + ' = ' + n + ' : pour ' + n + ' ' + U[1] + ', A coûte ' + eur(F0) + ' + ' + n + ' × ' + eur(u) + ' = ' + eur(F0 + n * u) + ' et B coûte ' + n + ' × ' + eur(v) + ' = ' + eur(n * v)
    + (egal ? ', le même prix.' : ', le même prix ; dès ' + (n + 1) + ' ' + U[1] + ', A devient strictement moins chère.'));
}

/* 2G · comparer deux images grâce au tableau de variations */
function g2tableau(R){
  for (let essai = 0; essai < 80; essai++){
    const P = R.pick([2, 3]), T = tableau(R, P), cible = R.pick(['meme', 'meme', 'diff', 'indet']);
    const pts = [];
    for (let i = 0; i < P; i++) for (let x = T.xs[i] + 1; x < T.xs[i + 1]; x++) pts.push([x, i]);
    const sel = R.shuffle(pts).slice(0, 2).sort((u, v) => u[0] - v[0]);
    const a = sel[0][0], ia = sel[0][1], b = sel[1][0], ib = sel[1][1];
    const lo = i => Math.min(T.vs[i], T.vs[i + 1]), hi = i => Math.max(T.vs[i], T.vs[i + 1]);
    const morceau = i => '[' + nb(T.xs[i]) + ' ; ' + nb(T.xs[i + 1]) + ']';
    let type, rep, expl;
    const fa = 'f(' + nb(a) + ')', fb = 'f(' + nb(b) + ')';
    if (ia === ib){
      type = 'meme'; const cr = T.vs[ia + 1] > T.vs[ia]; rep = cr ? fa + ' < ' + fb : fa + ' > ' + fb;
      expl = nb(a) + ' et ' + nb(b) + ' sont tous les deux dans ' + morceau(ia) + ', où f est ' + (cr ? 'croissante : les images sont rangées dans le même ordre que les nombres' : 'décroissante : les images sont rangées dans l\'ordre contraire des nombres') + ', donc ' + rep + '.';
    } else {
      const ens = (i, x) => nb(x) + ' est dans ' + morceau(i) + ', où f prend des valeurs strictement comprises entre ' + nb(lo(i)) + ' et ' + nb(hi(i));
      if (hi(ia) <= lo(ib)){ type = 'diff'; rep = fa + ' < ' + fb; }
      else if (hi(ib) <= lo(ia)){ type = 'diff'; rep = fa + ' > ' + fb; }
      else { type = 'indet'; rep = 'On ne peut pas conclure'; }
      expl = ens(ia, a) + ' ; ' + ens(ib, b) + '. ' + (type === 'diff' ? 'Toutes les valeurs possibles de l\'une sont plus ' + (rep.indexOf('<') > 0 ? 'petites' : 'grandes') + ' que toutes celles de l\'autre, donc ' + rep + '.'
        : 'Ces deux plages de valeurs se chevauchent entre ' + nb(Math.max(lo(ia), lo(ib))) + ' et ' + nb(Math.min(hi(ia), hi(ib))) + ' : selon la forme exacte de la courbe, ' + fa + ' peut être plus grand ou plus petit que ' + fb + '. On ne peut pas conclure.');
    }
    if (type !== cible) continue;
    const ch = [fa + ' < ' + fb, fa + ' > ' + fb, fa + ' = ' + fb, 'On ne peut pas conclure'];
    return {q: introT(T) + '\nQue peut-on affirmer sur ' + fa + ' et ' + fb + ' ?', a: rep, accept: null, choix: ch,
      expl: "On repère le morceau du tableau où se trouve chaque nombre : dans un même morceau, le sens de variation suffit ; dans deux morceaux différents, on compare les valeurs que f peut prendre sur chacun. " + expl};
  }
  return g2sommet(R);
}

/* =====================================================================
   NIVEAU 3 : optimisation concrète et croissance exponentielle
   ===================================================================== */

/* 3A · recette maximale : prix × quantité */
function g3recette(R){
  const k = R.pick([2, 4, 5, 10, 20]);
  const ps = {2: [10, 15, 20, 25, 30, 40, 50], 4: [5, 10, 15, 20, 25], 5: [6, 8, 10, 12, 20], 10: [5, 8, 10, 12, 15, 20], 20: [4, 5, 6, 8, 10, 15]}[k];
  const p = R.pick(ps), N = 2 * k * p, Rm = k * p * p, ctx = R.int(0, 2), prix = R.int(0, 1) === 1;
  const debut = ctx === 0 ? "Lorsqu'un article est vendu p euros, un magasin en vend " + nb(N) + ' − ' + k + 'p par semaine (pour p compris entre 0 et ' + nb(N / k) + ').'
    : ctx === 1 ? 'Un organisateur estime que, si le billet de son concert coûte p euros, il en vendra ' + nb(N) + ' − ' + k + 'p (pour p compris entre 0 et ' + nb(N / k) + ').'
    : "Une application payante est téléchargée " + nb(N) + ' − ' + k + 'p fois par mois quand son prix est de p euros (pour p compris entre 0 et ' + nb(N / k) + ').';
  const q = debut + (prix ? ' Quel prix rend la recette maximale ?' : ' Quelle est la recette maximale, en euros ?');
  const F = prix
    ? fin(p, [[N / k, nb(N / k) + ' € est le prix qui annule les ventes : la recette y vaut 0'], [N / 2, nb(N / 2) + ' oublie le coefficient ' + k + ' dans −b/(2a)'], [p / 2, null]], {pas: Math.max(1, Math.round(p / 5)), min: 1})
    : fin(Rm, [[N * p, nb(N * p) + ' oublie que les ventes baissent quand le prix monte : à ' + nb(p) + ' €, on ne vend pas ' + nb(N) + ' unités'], [(N / 2) * (N / 2), nb((N / 2) * (N / 2)) + ' est le carré de la moitié de ' + nb(N) + ', sans rapport avec la recette'],
      [2 * Rm, null]], {pas: Math.max(10, Rm / 10), min: 1});
  return sortie(q, F, 'La recette vaut prix × quantité vendue : R(p) = p(' + nb(N) + ' − ' + k + 'p), une parabole tournée vers le bas dont le sommet est au milieu de ses deux racines. '
    + 'Les racines sont p = 0 et p = ' + nb(N) + ' ÷ ' + k + ' = ' + nb(N / k) + ', donc le maximum est atteint pour p = ' + nb(N / k) + ' ÷ 2 = ' + nb(p) + ' €. À ce prix, on vend ' + nb(N) + ' − ' + k + ' × ' + nb(p) + ' = ' + nb(N / 2)
    + ' unités et la recette vaut ' + nb(p) + ' × ' + nb(N / 2) + ' = ' + nb(Rm) + ' €.');
}

/* 3B · enclos contre un mur, ou double enclos */
function g3enclos(R){
  if (R.int(0, 1) === 0){
    const L = 4 * R.int(5, 30), x = L / 4, y = L / 2, Am = L * L / 8, aire = R.int(0, 2) > 0;
    const q = 'Avec ' + nb(L) + ' m de grillage, on clôture un enclos rectangulaire adossé à un long mur : le grillage ne borde que les trois autres côtés. '
      + (aire ? "Quelle est l'aire maximale de l'enclos, en m² ?" : "Pour que l'aire soit maximale, quelle doit être la longueur du côté parallèle au mur, en m ?");
    const l = aire ? [[L * L / 16, nb(L * L / 16) + ' est l\'aire d\'un carré de ' + nb(L) + ' m de tour : on a oublié que le mur remplace un côté'],
      [L % 3 === 0 ? (L / 3) * (L / 3) : null, nb((L / 3) * (L / 3)) + ' correspond à trois côtés égaux, qui ne donnent pas le maximum'],
      [L * L / 4, nb(L * L / 4) + ' ne compte qu\'une seule largeur au lieu de deux'], [L * L / 32, null]]
      : [[L / 4, nb(L / 4) + ' est la largeur, perpendiculaire au mur, pas la longueur'], [L % 3 === 0 ? L / 3 : null, nb(L / 3) + ' correspond à trois côtés égaux, qui ne donnent pas le maximum'],
      [L / 8, null], [3 * L / 4, null]];
    return sortie(q, fin(aire ? Am : y, l, {pas: aire ? Math.max(2, L) : 2, min: 1}),
      "On appelle x la largeur (les deux côtés perpendiculaires au mur) : la longueur vaut " + nb(L) + ' − 2x et l\'aire A(x) = x(' + nb(L) + ' − 2x) est une parabole tournée vers le bas, maximale au milieu de ses racines. '
      + 'Les racines sont 0 et ' + nb(L / 2) + ', donc x = ' + nb(x) + ' m, la longueur vaut ' + nb(L) + ' − 2 × ' + nb(x) + ' = ' + nb(y) + ' m et l\'aire ' + nb(x) + ' × ' + nb(y) + ' = ' + nb(Am) + ' m². Le côté parallèle au mur est le double de la largeur.');
  }
  const L = 12 * R.int(2, 12), x = L / 6, y = L / 4, Am = L * L / 24;
  const q = 'On dispose de ' + nb(L) + ' m de clôture pour construire deux enclos rectangulaires identiques côte à côte : ensemble, ils forment un grand rectangle coupé en deux par une cloison parallèle à deux de ses côtés. Toute la clôture, contour et cloison, est utilisée. Quelle est l\'aire totale maximale, en m² ?';
  const l = [[L * L / 16, nb(L * L / 16) + ' est l\'aire d\'un carré de ' + nb(L) + ' m de tour : on a oublié la cloison'], [L * L / 48, nb(L * L / 48) + ' est l\'aire d\'un seul des deux enclos'],
    [L % 5 === 0 ? (L / 5) * (L / 5) : null, nb((L / 5) * (L / 5)) + ' correspond à cinq segments égaux, qui ne donnent pas le maximum'], [L * L / 12, null]];
  return sortie(q, fin(Am, l, {pas: Math.max(2, L / 2), min: 1}),
    "On appelle x la longueur des trois segments parallèles à la cloison et y celle des deux autres : 3x + 2y = " + nb(L) + ', et l\'aire totale A = xy est une parabole en x dont on cherche le sommet. '
    + 'y = (' + nb(L) + ' − 3x) ÷ 2, donc A(x) = x(' + nb(L) + ' − 3x) ÷ 2, de racines 0 et ' + nb(L / 3) + ' : le maximum est en x = ' + nb(x) + ' m, avec y = ' + nb(y) + ' m et A = ' + nb(x) + ' × ' + nb(y) + ' = ' + nb(Am) + ' m².');
}

/* 3C · seuils de croissance exponentielle */
function g3expo(R){
  const t = R.int(0, 2);
  if (t === 2){
    const kk = R.pick([2, 3, 4]), J = R.pick({2: [12, 16, 20, 24, 28, 40], 3: [16, 24, 32, 40, 48], 4: [16, 32, 48]}[kk]), ans = J - kk;
    const frac = {2: 'le quart', 3: 'le huitième', 4: 'le seizième'}[kk], den = Math.pow(2, kk);
    const q = 'Une algue double sa surface chaque jour. Partie d\'une petite tache, elle met ' + J + ' jours à recouvrir entièrement un bassin. Au bout de combien de jours en recouvrait-elle ' + frac + ' ?';
    const F = fin(ans, [[J / den, nb(J / den) + ' applique la proportionnalité : la surface ne grandit pas de la même quantité chaque jour'],
      [J - den, nb(J - den) + ' retire ' + den + ' jours, alors qu\'un jour en arrière divise seulement la surface par 2'], [J / 2, nb(J / 2) + ' : la moitié du temps ne correspond pas à la moitié de la surface'], [ans - 1, null]]);
    return sortie(q, F, 'Remonter d\'un jour divise la surface par 2 : on compte combien de divisions par 2 séparent le bassin entier de la fraction demandée. ' + cap(frac) + ' vaut 1/' + den + ' = 1/2' + sup(kk) + ', soit '
      + kk + ' divisions par 2, donc ' + kk + ' jours avant le jour ' + J + ' : ' + J + ' − ' + kk + ' = ' + ans + '.');
  }
  const f = R.pick([2, 2, 3]);
  const T = f === 2 ? R.pick([100, 500, 1000, 5000, 10000, 100000, 1000000]) : R.pick([100, 500, 1000, 5000, 10000]);
  let S0 = 1, q;
  if (t === 0){
    q = 'Une quantité ' + (f === 2 ? 'double' : 'triple') + ' chaque semaine. Au bout de combien de semaines aura-t-elle été multipliée par plus de ' + nb(T) + ' pour la première fois ?';
  } else {
    S0 = R.pick([2, 4, 5, 10]);
    if (T / S0 < 20) S0 = 2;
    q = 'Une rumeur circule : le nombre de personnes au courant ' + (f === 2 ? 'double' : 'triple') + ' chaque jour. Au départ, ' + S0 + ' personnes sont au courant. Au bout de combien de jours plus de ' + nb(T) + ' personnes seront-elles au courant ?';
  }
  let n = 0, v = S0; while (v <= T){ v *= f; n++; }
  const l = [[n - 1, f + sup(n - 1) + ' × ' + S0 + ' = ' + nb(S0 * Math.pow(f, n - 1)) + ' ne dépasse pas encore ' + nb(T)], [n + 1, null]];
  if (T / S0 / f <= 2000 && Number.isInteger(T / S0 / f)) l.push([T / S0 / f, nb(T / S0 / f) + ' applique un raisonnement linéaire, comme si l\'on ajoutait la même quantité à chaque étape']);
  l.push([n + 2, null]);
  const etape = t === 0 ? 'semaine' : 'jour';
  return sortie(q, fin(n, l, {min: 1}), 'Après n ' + etape + 's, la quantité est multipliée par ' + f + 'ⁿ : on calcule les puissances de ' + f + ' jusqu\'à dépasser le seuil' + (f === 2 ? ', en se souvenant que 2¹⁰ = 1 024 ≈ mille' : '') + '. '
    + (S0 > 1 ? 'Il faut ' + S0 + ' × ' + f + 'ⁿ > ' + nb(T) + '. ' : 'Il faut ' + f + 'ⁿ > ' + nb(T) + '. ')
    + (S0 > 1 ? S0 + ' × ' : '') + f + sup(n - 1) + ' = ' + nb(S0 * Math.pow(f, n - 1)) + ', pas assez ; ' + (S0 > 1 ? S0 + ' × ' : '') + f + sup(n) + ' = ' + nb(S0 * Math.pow(f, n)) + ', qui dépasse : il faut ' + n + ' ' + etape + 's.');
}

/* 3D · offre qui double contre offre fixe : montant reçu dans la journée */
function g3offres(R){
  for (let e = 0; e < 40; e++){
    const s = R.pick([1, 2, 3, 5]), M = R.pick([20, 30, 50, 60, 100, 150, 200, 300, 500, 1000]);
    let n = 1; while (s * Math.pow(2, n - 1) <= M) n++;
    if (n < 4 || n > 14) continue;
    const q = 'Offre A : on reçoit ' + eur(M) + ' chaque jour. Offre B : on reçoit ' + eur(s) + ' le premier jour, puis chaque jour le double de la veille. À partir de quel jour le montant reçu dans la journée avec B dépasse-t-il le montant reçu avec A ?';
    const l = [[n - 1, 'au jour ' + (n - 1) + ', B donne seulement ' + eur(s * Math.pow(2, n - 2)) + ' : le jour n correspond à ' + s + ' × 2ⁿ⁻¹, pas à ' + s + ' × 2ⁿ'], [n + 1, null]];
    if (Number.isInteger(M / s / 2) && M / s / 2 !== n) l.push([M / s / 2, nb(M / s / 2) + ' applique un raisonnement proportionnel, qui ne vaut pas pour une suite qui double']);
    l.push([n - 2, null]);
    return sortie(q, fin(n, l, {min: 1}), 'Avec B, le montant du jour n vaut ' + s + ' × 2ⁿ⁻¹ (suite géométrique de raison 2) : on liste les montants jusqu\'à dépasser ' + eur(M) + '. '
      + cap(range(Math.max(1, n - 2), n).map(j => 'jour ' + j + ' : ' + eur(s * Math.pow(2, j - 1))).join(' ; ')) + '. Le premier jour où B donne plus de ' + eur(M) + ' est le jour ' + n + '.');
  }
  return g3expo(R);
}

/* 3E · bénéfice maximal */
function g3benef(R){
  for (let e = 0; e < 40; e++){
    const a = R.pick([1, 2, 5]), x0 = R.pick([10, 15, 20, 25, 30, 40, 50]), Bm = R.pick([100, 200, 300, 400, 500, 600, 800, 1000, 1200]);
    const c = a * x0 * x0 - Bm; if (c <= 0) continue;
    const cs = [-a, 2 * a * x0, -c], E = poly(cs), D = 2 * x0, objets = R.int(0, 1) === 1;
    const q = 'Une entreprise fabrique x objets par jour, avec x entre 0 et ' + D + '. Son bénéfice journalier, en euros, vaut B(x) = ' + E + '. '
      + (objets ? 'Combien d\'objets doit-elle fabriquer pour que son bénéfice soit maximal ?' : 'Quel est son bénéfice maximal, en euros ?');
    const F = objets ? fin(x0, [[2 * x0, nb(2 * x0) + ' vient de −b/a : on a oublié le 2'], [x0 % 2 === 0 ? x0 / 2 : null, null], [x0 + 5, null]], {pas: 5, min: 1})
      : fin(Bm, [[a * x0 * x0, nb(a * x0 * x0) + ' oublie de soustraire le coût fixe ' + nb(c)], [2 * a * x0 * x0 - c, nb(2 * a * x0 * x0 - c) + ' oublie le terme ' + poly([-a, 0, 0]).replace(/ /g, '')],
        [-c, nb(-c) + ' est B(0) = B(' + D + '), la valeur aux bornes']], {pas: 100});
    return sortie(q, F, 'B est une parabole tournée vers le bas : son maximum est atteint à l\'abscisse du sommet, −b/(2a), là où B\'(x) = ' + poly([-2 * a, 2 * a * x0]) + ' s\'annule. '
      + '−b/(2a) = ' + nb(-2 * a * x0) + ' ÷ ' + par(-2 * a) + ' = ' + nb(x0) + ' objets, et ' + calcul('B', cs, x0) + ' €.');
  }
  return g3recette(R);
}

/* 3F · retrouver un coefficient grâce à la symétrie */
function g3param(R){
  if (R.int(0, 1) === 0){
    const Ac = R.pick([1, 1, 2, -1]);
    let x1, x2; do { x1 = R.int(-6, 5); x2 = x1 + R.int(2, 8); } while (x1 + x2 === 0);
    const V = R.int(-8, 12), b = -Ac * (x1 + x2), m = (x1 + x2) / 2;
    const q = "La parabole d'équation y = " + coefTxt(Ac) + 'x² + bx + c passe par les points ' + pt(x1, V) + ' et ' + pt(x2, V) + '. Que vaut b ?';
    const F = fin(b, [[-b, nb(-b) + ' : erreur de signe dans −b/(2a)'], [Number.isInteger(m) ? m : null, nb(m) + " est l'abscisse du sommet, pas b"],
      [Number.isInteger(m) ? -m : null, null], [Ac !== 1 ? -(x1 + x2) : -2 * (x1 + x2), Ac !== 1 ? nb(-(x1 + x2)) + ' oublie le coefficient a = ' + nb(Ac) : null]]);
    return sortie(q, F, "Deux points de même ordonnée sont symétriques par rapport à l'axe de la parabole, dont l'abscisse vaut aussi −b/(2a) : on égale les deux expressions. "
      + "L'axe est en x = (" + nb(x1) + ' + ' + par(x2) + ') ÷ 2 = ' + nb(m) + ', donc −b/(2 × ' + par(Ac) + ') = ' + nb(m) + ', soit b = −2 × ' + par(Ac) + ' × ' + par(m) + ' = ' + nb(b) + '.');
  }
  const h = R.pick(NZ(range(-6, 6))), k = R.int(-9, 9), c = h * h + k;
  const q = "La parabole d'équation y = x² + bx + c a pour sommet le point " + pt(h, k) + '. Que vaut c ?';
  const F = fin(c, [[k, nb(k) + " : c est l'ordonnée du point d'abscisse 0, pas celle du sommet"], [k - h * h, nb(k - h * h) + ' : erreur de signe en développant (x − α)²'],
    [h * h - k, null], [h + k, null]]);
  return sortie(q, F, 'On écrit la forme canonique à partir du sommet, puis on développe : c est le terme constant. y = ' + canon(1, h, k) + ' = x² ' + (h > 0 ? '− ' : '+ ') + nb(Math.abs(2 * h)) + 'x + ' + nb(h * h)
    + (k ? (k < 0 ? ' − ' : ' + ') + nb(Math.abs(k)) : '') + ', donc c = ' + nb(h * h) + (k ? (k < 0 ? ' − ' : ' + ') + nb(Math.abs(k)) : '') + ' = ' + nb(c) + '.');
}

/* 3G · commission calculée par tranches */
function bareme(R){
  const A0 = R.pick([1000, 2000, 5000]), W = R.pick([2000, 3000, 4000, 5000]), B = A0 + W, t1 = R.pick([5, 10]), t2 = R.pick([20, 25, 30]);
  const txt = 'Une commerciale touche une commission calculée par tranches sur ses ventes du mois :\n- rien sur les ' + nb(A0) + ' premiers euros ;\n- ' + t1 + ' % sur la partie comprise entre '
    + nb(A0) + ' € et ' + nb(B) + ' € ;\n- ' + t2 + ' % sur la partie au-delà de ' + nb(B) + ' €.';
  return {A0, W, B, t1, t2, txt, com: X => t1 * (Math.min(X, B) - A0) / 100 + t2 * Math.max(0, X - B) / 100};
}
function g3tranches(R){
  const b = bareme(R), X = b.B + R.pick([1000, 2000, 3000, 4000, 5000]), v = b.com(X), c1 = b.t1 * b.W / 100, c2 = b.t2 * (X - b.B) / 100;
  const q = b.txt + '\nQuelle commission touche-t-elle pour ' + nb(X) + ' € de ventes ?';
  const F = fin(v, [[b.t2 * X / 100, eur(b.t2 * X / 100) + ' applique ' + b.t2 + ' % à toutes les ventes : chaque taux ne s\'applique qu\'à sa tranche'],
    [b.t2 * (X - b.A0) / 100, eur(b.t2 * (X - b.A0) / 100) + ' applique ' + b.t2 + ' % dès ' + nb(b.A0) + ' €'], [b.t1 * (X - b.A0) / 100, eur(b.t1 * (X - b.A0) / 100) + ' applique ' + b.t1 + ' % jusqu\'au bout'],
    [c2, eur(c2) + ' oublie la tranche à ' + b.t1 + ' %']], {fmt: eur, pas: 50, min: 1});
  return sortie(q, F, 'Chaque taux ne s\'applique qu\'à la partie des ventes qui tombe dans sa tranche : on découpe la somme, puis on additionne les commissions. '
    + 'Tranche à ' + b.t1 + ' % : ' + nb(b.B) + ' − ' + nb(b.A0) + ' = ' + nb(b.W) + ' €, soit ' + eur(c1) + '. Tranche à ' + b.t2 + ' % : ' + nb(X) + ' − ' + nb(b.B) + ' = ' + nb(X - b.B) + ' €, soit ' + eur(c2)
    + '. Total : ' + eur(c1) + ' + ' + eur(c2) + ' = ' + eur(v) + '.');
}

/* 3H · nombre de solutions de f(x) = k avec un tableau de variations */
function g3table(R){
  const T = tableau(R, 3), vs = T.vs, mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs);
  const k = R.int(1, 10) <= 4 ? R.pick(vs) : R.int(mn - 1, mx + 1), ans = nbSol(vs, k);
  const det = [];
  for (let i = 0; i < 3; i++){
    const lo = Math.min(vs[i], vs[i + 1]), hi = Math.max(vs[i], vs[i + 1]), m = '[' + nb(T.xs[i]) + ' ; ' + nb(T.xs[i + 1]) + ']';
    if (k < lo || k > hi) det.push('sur ' + m + ', f va de ' + nb(vs[i]) + ' à ' + nb(vs[i + 1]) + ' : aucune solution');
    else if (i > 0 && k === vs[i]) det.push('sur ' + m + ', la valeur ' + nb(k) + ' est atteinte en x = ' + nb(T.xs[i]) + ', déjà comptée');
    else det.push('sur ' + m + ', f va de ' + nb(vs[i]) + ' à ' + nb(vs[i + 1]) + ' : une solution' + (k === vs[i] || k === vs[i + 1] ? ' (en x = ' + nb(k === vs[i] ? T.xs[i] : T.xs[i + 1]) + ')' : ''));
  }
  const pieges = [];
  if (nbSolNaif(vs, k) !== ans) pieges.push('la valeur ' + nb(k) + ' est atteinte à la jonction de deux morceaux : ce point ne compte qu\'une fois');
  if (nbSolOuvert(vs, k) !== ans && (k === vs[0] || k === vs[3])) pieges.push('une valeur atteinte au bord du domaine compte aussi');
  return {q: introT(T) + "\nCombien de solutions l'équation f(x) = " + nb(k) + ' admet-elle ?', a: String(ans), accept: null, choix: ['0', '1', '2', '3'],
    expl: "On regarde chaque morceau du tableau : sur un morceau où f va de u à v, l'équation f(x) = k a une solution si k est compris entre u et v, aucune sinon, et une valeur prise à la jonction de deux morceaux ne compte qu'une fois. "
      + cap(det.join(' ; ')) + '. Total : ' + sol(ans) + '.' + (pieges.length ? ' Piège : ' + pieges.join(' ; ') + '.' : '')};
}

/* =====================================================================
   NIVEAU 4 : paramètres, nombre de solutions, croissances comparées
   ===================================================================== */

/* 4A · nombre de valeurs entières de m pour un nombre de solutions donné */
function g4parm(R){
  const h = R.int(2, 6), H = h * h, M = R.pick([20, 30, 40, 50].filter(x => x > H + 2)), t = R.int(0, 2);
  const cnt = (cond) => range(1, M).filter(cond).length;
  const E = 'x² − ' + (2 * h) + 'x + m = 0';
  let quoi, ans, l;
  if (t === 0){
    quoi = 'deux solutions distinctes'; ans = cnt(m => m < H);
    l = [[cnt(m => m <= H), nb(cnt(m => m <= H)) + ' compte aussi m = ' + H + ', qui ne donne qu\'une solution (double)'], [cnt(m => m < 4 * H), nb(cnt(m => m < 4 * H)) + ' vient de la condition ' + (4 * H) + ' − m > 0 : on a oublié le 4 de b² − 4ac'],
      [cnt(m => m < 2 * h), nb(cnt(m => m < 2 * h)) + ' compare m à ' + (2 * h) + ' au lieu de ' + H]];
  } else if (t === 1){
    quoi = 'aucune solution réelle'; ans = cnt(m => m > H);
    l = [[cnt(m => m >= H), nb(cnt(m => m >= H)) + ' compte aussi m = ' + H + ', qui donne une solution'], [cnt(m => m > 4 * H), nb(cnt(m => m > 4 * H)) + ' vient de la condition m > ' + (4 * H) + ' : on a oublié le 4 de b² − 4ac'],
      [cnt(m => m < H), nb(cnt(m => m < H)) + ' compte au contraire les valeurs qui donnent deux solutions']];
  } else {
    quoi = 'au moins une solution'; ans = cnt(m => m <= H);
    l = [[cnt(m => m < H), nb(cnt(m => m < H)) + ' oublie m = ' + H + ', qui donne une solution double'], [cnt(m => m <= 4 * H), nb(cnt(m => m <= 4 * H)) + ' vient de la condition m ≤ ' + (4 * H) + ' : on a oublié le 4 de b² − 4ac'],
      [cnt(m => m <= 2 * h), nb(cnt(m => m <= 2 * h)) + ' compare m à ' + (2 * h) + ' au lieu de ' + H]];
  }
  const q = "Pour combien d'entiers m compris entre 1 et " + M + " l'équation " + E + (t === 1 ? " n'admet-elle aucune solution réelle ?" : ' admet-elle ' + quoi + ' ?');
  return sortie(q, fin(ans, l, {min: 0}), "On met sous forme canonique pour voir le nombre de solutions sans calcul : x² − " + (2 * h) + 'x + m = (x − ' + h + ')² + m − ' + H + ', donc l\'équation revient à (x − ' + h + ')² = ' + H + ' − m. '
    + 'Elle a deux solutions si ' + H + ' − m > 0, une seule si m = ' + H + ', aucune si m > ' + H + '. Parmi les entiers de 1 à ' + M + ', ' + (t === 0 ? 'ceux de 1 à ' + (H - 1) : t === 1 ? 'ceux de ' + (H + 1) + ' à ' + M : 'ceux de 1 à ' + H) + ' conviennent : il y en a ' + ans + '.');
}

/* 4B et 5B · nombre de valeurs entières de k donnant exactement n solutions */
function gCompteK(R, P, nList){
  for (let e = 0; e < 60; e++){
    const T = tableau(R, P), vs = T.vs, mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), n = R.pick(nList);
    const ks = range(mn, mx).filter(k => nbSol(vs, k) === n);
    if (!ks.length || ks.length > 14) continue;
    const naif = range(mn, mx).filter(k => nbSolNaif(vs, k) === n).length, ouvert = range(mn, mx).filter(k => nbSolOuvert(vs, k) === n).length;
    const l = [[naif, nb(naif) + ' compte deux fois une valeur atteinte à la jonction de deux morceaux'], [ouvert, nb(ouvert) + ' oublie les valeurs atteintes aux bornes des morceaux'], [ks.length + 1, null], [ks.length - 1, null]];
    const q = introT(T) + "\nPour combien de valeurs entières de k l'équation f(x) = k admet-elle exactement " + n + ' solutions ?';
    return sortie(q, fin(ks.length, l, {min: 0}), "On fait monter une droite horizontale y = k et on compte, pour chaque valeur entière de k, les morceaux qu'elle rencontre, sans compter deux fois une valeur prise à une jonction. "
      + cap(plages(vs)) + '. Les valeurs qui donnent exactement ' + n + ' solutions sont ' + (ks.length === 1 ? 'k = ' + nb(ks[0]) : ks.slice(0, -1).map(k => nb(k)).join(', ') + ' et ' + nb(ks[ks.length - 1])) + ' : il y en a ' + ks.length + '.');
  }
  return P === 3 ? g4parm(R) : g5droite(R);
}
const g4table = R => gCompteK(R, 3, [2, 3]);

/* 4C · croissances comparées */
const PUISS4 = [[2, 'n²', n => n * n], [2, 'n³', n => n * n * n], [2, '100 × n', n => 100 * n], [2, nb(1000) + ' × n', n => 1000 * n]];
const PUISS5 = [[2, 'n⁴', n => n * n * n * n], [3, 'n⁴', n => n * n * n * n], [10, 'n¹⁰', n => Math.pow(n, 10)], [2, '100 × n²', n => 100 * n * n]];
function gPuiss(R, liste){
  const [b, txt, g] = R.pick(liste);
  let n = 2; while (!(Math.pow(b, n) > g(n))) n++;
  const gt = m => txt.replace(/n/g, String(m)).replace(/(\d)([²³⁴]|¹⁰)/, '$1$2');
  const cmp = m => { const x = Math.pow(b, m), y = g(m); return b + sup(m) + ' = ' + nb(x) + (x === y ? ' est égal à ' : x < y ? ' est inférieur à ' : ' est supérieur à ') + nb(y); };
  const l = [[n - 1, 'pour n = ' + (n - 1) + ', ' + cmp(n - 1)], [n + 1, null], [n - 2 >= 2 ? n - 2 : null, n - 2 >= 2 ? 'pour n = ' + (n - 2) + ', ' + cmp(n - 2) : null], [n + 2, null]];
  const q = 'Quel est le plus petit entier n ≥ 2 tel que ' + b + 'ⁿ > ' + txt + ' ?';
  const essais = cap(range(Math.max(2, n - 2), n).map(m => 'pour n = ' + m + ', ' + cmp(m)).join(' ; '));
  return sortie(q, fin(n, l, {min: 2}), 'On calcule les deux membres pour des valeurs successives de n et on s\'arrête à la première inégalité stricte vraie : une croissance exponentielle finit par l\'emporter, mais il faut vérifier les valeurs une par une. '
    + essais + '. Le plus petit entier qui convient est ' + n + '.');
}
function g4croiss(R){
  const t = R.int(0, 2);
  if (t === 2) return gPuiss(R, PUISS4);
  if (t === 0){
    const M = R.pick([10, 20, 30, 50, 100, 200, 300, 500, 1000]);
    let n = 1; while (Math.pow(2, n) - 1 <= M * n) n++;
    let j = 1; while (Math.pow(2, j - 1) <= M) j++;
    const q = 'Offre A : on reçoit ' + eur(M) + ' chaque jour. Offre B : on reçoit 1 € le premier jour, 2 € le deuxième, 4 € le troisième, et ainsi de suite en doublant chaque jour. Au bout de combien de jours le total reçu avec B dépasse-t-il pour la première fois le total reçu avec A ?';
    const F = fin(n, [[j, nb(j) + ' est le premier jour où le montant du jour de B dépasse celui de A, mais le total de B est encore en retard'], [n - 1, 'après ' + (n - 1) + ' jours, B totalise ' + nb(Math.pow(2, n - 1) - 1) + ' € contre ' + nb(M * (n - 1)) + ' € pour A'], [n + 1, null]], {min: 1});
    return sortie(q, F, 'Après n jours, A a rapporté ' + nb(M) + ' × n euros et B a rapporté 1 + 2 + 4 + … + 2ⁿ⁻¹ = 2ⁿ − 1 euros (somme d\'une suite géométrique) : on compare ces deux totaux pour des valeurs successives de n. '
      + 'Après ' + (n - 1) + ' jours : 2' + sup(n - 1) + ' − 1 = ' + nb(Math.pow(2, n - 1) - 1) + ' contre ' + nb(M * (n - 1)) + ' ; après ' + n + ' jours : 2' + sup(n) + ' − 1 = ' + nb(Math.pow(2, n) - 1) + ' contre ' + nb(M * n) + '. Réponse : ' + n + ' jours.');
  }
  for (let e = 0; e < 60; e++){
    const CB = R.pick([100, 200, 500, 1000]), CA = R.pick([2000, 5000, 10000, 20000]), d = R.pick([500, 1000, 2000, 5000]);
    let n = 0; while (CB * Math.pow(2, n) <= CA + d * n) n++;
    if (n < 3 || n > 11) continue;
    const q = "L'application A compte " + nb(CA) + ' utilisateurs et en gagne ' + nb(d) + ' de plus chaque mois. L\'application B compte ' + nb(CB) + ' utilisateurs, et ce nombre double chaque mois. Au bout de combien de mois B aura-t-elle plus d\'utilisateurs que A pour la première fois ?';
    const F = fin(n, [[n - 1, 'après ' + (n - 1) + ' mois, B compte ' + nb(CB * Math.pow(2, n - 1)) + ' utilisateurs contre ' + nb(CA + d * (n - 1)) + ' pour A'], [n + 1, null], [n + 2, null]], {min: 1});
    return sortie(q, F, 'Après n mois, A compte ' + nb(CA) + ' + ' + nb(d) + ' × n utilisateurs (croissance linéaire) et B compte ' + nb(CB) + ' × 2ⁿ (croissance exponentielle) : on compare mois par mois. '
      + cap(range(Math.max(1, n - 2), n).map(m => 'après ' + m + ' mois, A : ' + nb(CA + d * m) + ', B : ' + nb(CB * Math.pow(2, m))).join(' ; ')) + '. Réponse : ' + n + ' mois.');
  }
  return gPuiss(R, PUISS4);
}

/* 4D · recette avec élasticité, ou bénéfice avec coût unitaire */
function g4elast(R){
  if (R.int(0, 1) === 0){
    for (let e = 0; e < 60; e++){
      const P0 = R.pick([10, 15, 20, 25, 30, 40]), d = R.pick([2, 4, 5, 10, 20]), j = R.pick([-4, -3, -2, 2, 3, 4, 5, 6, 8, 10]);
      const T = P0 + 2 * j, N0 = d * T, p = P0 + j, ventes = d * (P0 + j), Rm = p * ventes, prix = R.int(0, 1) === 1;
      if (N0 > 1000 || p <= 0) continue;
      const q = 'Un théâtre vend ses places ' + eur(P0) + ' et en vend ' + nb(N0) + ' par soir. Chaque hausse de 1 € du prix lui fait perdre ' + d + ' spectateurs, et chaque baisse de 1 € lui en fait gagner ' + d + '. '
        + (prix ? 'Quel prix de la place rend la recette maximale ?' : 'Quelle recette maximale, en euros, peut-il obtenir ?');
      const F = prix ? fin(p, [[P0, eur(P0) + ' est le prix actuel, qui n\'est pas le meilleur'], [T, eur(T) + ' est le prix qui annule les ventes'], [j > 0 ? j : null, eur(j) + ' est la hausse de prix, pas le nouveau prix'],
        [Number.isInteger(T / 2) ? T / 2 : null, null]], {fmt: eur, min: 1})
        : fin(Rm, [[P0 * N0, nb(P0 * N0) + ' est la recette actuelle, sans changer le prix'], [T * N0 / 2, null], [Rm + d * j * j, null]], {pas: 50, min: 1});
      return sortie(q, F, 'On note x la variation du prix en euros : la recette vaut R(x) = (' + nb(P0) + ' + x)(' + nb(N0) + ' − ' + d + 'x), une parabole tournée vers le bas dont le sommet est au milieu des deux racines. '
        + 'Racines : x = −' + nb(P0) + ' et x = ' + nb(N0) + ' ÷ ' + d + ' = ' + nb(T) + ', donc le sommet est en x = (−' + nb(P0) + ' + ' + nb(T) + ') ÷ 2 = ' + nb(j) + '. Le prix vaut ' + nb(P0) + ' ' + (j < 0 ? '− ' + nb(-j) : '+ ' + nb(j)) + ' = ' + eur(p)
        + ', on vend ' + nb(ventes) + ' places et la recette vaut ' + nb(p) + ' × ' + nb(ventes) + ' = ' + nb(Rm) + ' €.');
    }
  }
  for (let e = 0; e < 60; e++){
    const k = R.pick([2, 4, 5, 10]), c = R.pick([4, 5, 6, 8, 10, 12, 15, 20]), g = R.pick([4, 6, 8, 10, 12, 16, 20]), T = c + g, N = k * T, p = (T + c) / 2;
    if (N > 800 || N < 60) continue;
    const q = 'Un artisan fabrique un objet qui lui coûte ' + eur(c) + '. S\'il le vend p euros, il en vend ' + nb(N) + ' − ' + k + 'p par mois (pour p compris entre ' + nb(c) + ' et ' + nb(T) + '). Quel prix de vente rend son bénéfice maximal ?';
    const F = fin(p, [[T / 2, eur(T / 2) + ' maximise la recette p(' + nb(N) + ' − ' + k + 'p) : on a oublié le coût de fabrication'], [T, eur(T) + ' est le prix qui annule les ventes'],
      [g / 2, eur(g / 2) + ' est la marge sur chaque objet, pas le prix'], [c, null]], {fmt: eur, min: 1});
    return sortie(q, F, 'Le bénéfice vaut marge par objet × nombre d\'objets : B(p) = (p − ' + nb(c) + ')(' + nb(N) + ' − ' + k + 'p), une parabole tournée vers le bas dont le sommet est au milieu des racines. '
      + 'Racines : p = ' + nb(c) + ' et p = ' + nb(N) + ' ÷ ' + k + ' = ' + nb(T) + ', donc le maximum est en p = (' + nb(c) + ' + ' + nb(T) + ') ÷ 2 = ' + eur(p) + '. Bénéfice : (' + nb(p) + ' − ' + nb(c) + ') × ' + nb(N - k * p) + ' = ' + nb((p - c) * (N - k * p)) + ' €.');
  }
  return g3recette(R);
}

/* 4E · droite tangente à une parabole */
function g4tangente(R){
  const s = R.int(1, 6);
  if (R.int(0, 1) === 0){
    const c = s * s;
    const q = "Pour quelle valeur strictement positive de m la droite d'équation y = mx est-elle tangente à la parabole d'équation y = x² + " + c + ' ?';
    const F = fin(2 * s, [[s, nb(s) + ' est √' + c + ', il faut encore multiplier par 2'], [c, null], [2 * c, null], [4 * s, null]], {min: 1});
    return sortie(q, F, "La droite est tangente quand l'équation x² + " + c + ' = mx a une seule solution, c\'est-à-dire quand x² − mx + ' + c + ' est un carré parfait (discriminant nul). '
      + 'x² − mx + ' + c + ' = (x − ' + s + ')² impose m = 2 × ' + s + ' = ' + (2 * s) + ' ; avec le discriminant : m² − 4 × ' + c + ' = 0, donc m² = ' + (4 * c) + ' et m = ' + (2 * s) + '. Le point de contact a pour abscisse ' + s + '.');
  }
  const q = "Pour quelle valeur de p la droite d'équation y = " + (2 * s) + 'x + p est-elle tangente à la parabole d\'équation y = x² ?';
  const F = fin(-s * s, [[s * s, nb(s * s) + ' : erreur de signe'], [-2 * s, null], [-s, null], [2 * s, null]]);
  return sortie(q, F, "La droite est tangente quand l'équation x² = " + (2 * s) + 'x + p a une seule solution, c\'est-à-dire quand x² − ' + (2 * s) + 'x − p est un carré parfait (discriminant nul). '
    + 'x² − ' + (2 * s) + 'x − p = (x − ' + s + ')² impose −p = ' + (s * s) + ', donc p = ' + nb(-s * s) + '. Contrôle : le point de contact est (' + s + ' ; ' + (s * s) + ') et ' + (2 * s) + ' × ' + s + ' − ' + (s * s) + ' = ' + (s * s) + '.');
}

/* 4F · produit maximal sous contrainte linéaire */
function g4produit(R){
  const gcd = (u, v) => (v ? gcd(v, u % v) : u);
  for (let e = 0; e < 60; e++){
    const a = R.pick([1, 2, 3, 4, 5]), b = R.pick([1, 2, 3, 4, 5]); if (a === b) continue;
    const lcm = a * b / gcd(a, b);
    if (R.int(0, 1) === 0){
      const S = 2 * lcm * R.int(2, 8); if (S > 120) continue;
      const x = S / (2 * a), y = S / (2 * b), v = x * y;
      const q = 'Deux nombres positifs x et y vérifient ' + (a === 1 ? '' : a) + 'x + ' + (b === 1 ? '' : b) + 'y = ' + S + '. Quelle est la plus grande valeur possible du produit xy ?';
      const F = fin(v, [[S * S / 4, nb(S * S / 4) + ' oublie les coefficients ' + a + ' et ' + b], [Number.isInteger(S / (a + b)) ? Math.pow(S / (a + b), 2) : null, nb(Math.pow(S / (a + b), 2)) + ' prend x = y, ce qui n\'est pas optimal ici'],
        [2 * v, null], [v / 2, null]], {pas: Math.max(1, Math.round(v / 10)), min: 1});
      return sortie(q, F, 'On exprime y en fonction de x, puis le produit devient une parabole en x dont on prend le sommet, au milieu des racines. y = (' + S + ' − ' + (a === 1 ? '' : a) + 'x) ÷ ' + b + ', donc xy = x(' + S + ' − ' + (a === 1 ? '' : a) + 'x) ÷ ' + b
        + ', de racines 0 et ' + nb(S / a) + ' : le maximum est en x = ' + nb(x) + ', avec y = ' + nb(y) + ' et xy = ' + nb(v) + '. À retenir : à l\'optimum, ' + (a === 1 ? '' : a) + 'x = ' + (b === 1 ? '' : b) + 'y = ' + (S / 2) + '.');
    }
    const S = 40 * lcm * R.int(2, 10); if (S > 6000) continue;
    const x = S / (4 * a), y = S / (4 * b), v = x * y;
    const q = 'Un fermier dispose de ' + nb(S) + ' € pour clôturer un champ rectangulaire. La clôture coûte ' + eur(a) + ' le mètre pour les deux côtés qui longent la route, et ' + eur(b) + ' le mètre pour les deux autres côtés. Quelle est la plus grande aire possible du champ, en m² ?';
    const F = fin(v, [[S * S / (4 * a * b), nb(S * S / (4 * a * b)) + ' oublie que chaque longueur est clôturée deux fois'], [Number.isInteger(S / (2 * (a + b))) ? Math.pow(S / (2 * (a + b)), 2) : null, nb(Math.pow(S / (2 * (a + b)), 2)) + ' suppose un champ carré, ce qui n\'est pas optimal ici'],
      [S * S / 16, nb(S * S / 16) + ' oublie les prix au mètre'], [2 * v, null]], {pas: Math.max(1, Math.round(v / 10)), min: 1});
    return sortie(q, F, 'On écrit le coût total en fonction des deux côtés x (le long de la route) et y, puis l\'aire xy devient une parabole en x dont on prend le sommet. 2 × ' + a + ' × x + 2 × ' + b + ' × y = ' + nb(S)
      + ', donc y = (' + nb(S) + ' − ' + (2 * a) + 'x) ÷ ' + (2 * b) + ' et l\'aire x(' + nb(S) + ' − ' + (2 * a) + 'x) ÷ ' + (2 * b) + ' a pour racines 0 et ' + nb(S / (2 * a)) + ' : le maximum est en x = ' + nb(x) + ' m, avec y = ' + nb(y) + ' m, soit ' + nb(v) + ' m².');
  }
  return g4tangente(R);
}

/* 4G · tranches à l'envers : retrouver les ventes à partir de la commission */
function g4tranchesInv(R){
  for (let e = 0; e < 60; e++){
    const b = bareme(R), X = b.B + R.pick([1000, 2000, 3000, 4000, 5000, 6000]), C = b.com(X), c1 = b.t1 * b.W / 100;
    const l = [];
    if (Number.isInteger(C * 100 / b.t2)) l.push([C * 100 / b.t2, nb(C * 100 / b.t2) + ' € applique ' + b.t2 + ' % à toutes les ventes']);
    if (Number.isInteger(C * 100 / b.t2)) l.push([b.B + C * 100 / b.t2, nb(b.B + C * 100 / b.t2) + ' € oublie la commission déjà gagnée dans la tranche à ' + b.t1 + ' %']);
    if (Number.isInteger(C * 100 / b.t1)) l.push([b.A0 + C * 100 / b.t1, nb(b.A0 + C * 100 / b.t1) + ' € applique ' + b.t1 + ' % au-delà de ' + nb(b.A0) + ' €']);
    l.push([X - 1000, null], [X + 1000, null]);
    const F = fin(X, l, {fmt: x => nb(x) + ' €', pas: 500, min: 1});
    const q = b.txt + '\nCe mois-ci, elle a touché ' + eur(C) + ' de commission. Quel était le montant de ses ventes ?';
    return sortie(q, F, 'On calcule d\'abord la commission maximale des premières tranches pour savoir dans quelle tranche on finit, puis on remonte dans la dernière tranche. La tranche à ' + b.t1 + ' % rapporte au plus '
      + b.t1 + ' % de ' + nb(b.W) + ' € = ' + eur(c1) + ', moins que ' + eur(C) + ' : on dépasse donc ' + nb(b.B) + ' €. Il reste ' + eur(C) + ' − ' + eur(c1) + ' = ' + eur(C - c1) + ' gagnés à ' + b.t2 + ' %, soit '
      + eur(C - c1) + ' ÷ ' + nb(b.t2 / 100) + ' = ' + nb(X - b.B) + ' € de ventes au-delà de ' + nb(b.B) + ' €. Ventes : ' + nb(b.B) + ' + ' + nb(X - b.B) + ' = ' + nb(X) + ' €.');
  }
  return g3tranches(R);
}

/* 4H · nombre de solutions de f(x) = k pour une cubique */
function g4cubique(R){
  const p = R.int(1, 3), c = R.int(-5, 5), cs = [1, 0, -3 * p * p, c], E = poly(cs), hautV = 2 * p * p * p + c, basV = -2 * p * p * p + c, t = R.int(0, 2);
  const k = t === 0 ? R.int(basV + 1, hautV - 1) : t === 1 ? R.pick([basV, hautV]) : R.pick([hautV + R.int(1, 6), basV - R.int(1, 6)]), ans = t === 0 ? 3 : t === 1 ? 2 : 1;
  const q = 'On considère la fonction f définie sur ℝ par f(x) = ' + E + ". Combien de solutions l'équation f(x) = " + nb(k) + ' admet-elle ?';
  return {q, a: String(ans), accept: null, choix: ['0', '1', '2', '3'],
    expl: "On étudie les variations de f avec sa dérivée, puis on compare " + nb(k) + " aux valeurs du maximum local et du minimum local. f'(x) = 3x² − " + (3 * p * p) + ' = 3(x + ' + p + ')(x − ' + p + ') : f croît jusqu\'à x = −' + p + ', décroît de −' + p + ' à ' + p + ', puis croît. '
      + 'f(−' + p + ') = ' + nb(hautV) + ' (maximum local) et f(' + p + ') = ' + nb(basV) + ' (minimum local). '
      + (ans === 3 ? nb(k) + ' est strictement entre ' + nb(basV) + ' et ' + nb(hautV) + ' : la courbe le traverse une fois sur chacun des trois morceaux, soit 3 solutions.'
        : ans === 2 ? nb(k) + ' est la valeur d\'un extremum local : la droite y = ' + nb(k) + ' touche la courbe au sommet et la coupe une autre fois, soit 2 solutions.'
        : nb(k) + ' est ' + (k > hautV ? 'plus grand que le maximum local' : 'plus petit que le minimum local') + ' : seul un des morceaux extrêmes l\'atteint, soit 1 solution.')
      + (ans !== 3 ? ' Piège : une équation de degré 3 n\'a pas toujours 3 solutions.' : '')};
}

/* =====================================================================
   NIVEAU 5 : très difficile, sans calculatrice
   ===================================================================== */

/* 5A · cubique : nombre de valeurs entières de k donnant trois solutions, ou une seule */
function g5cub3(R){
  const t = R.int(0, 2);
  if (t === 0){
    const p = R.int(1, 3), c = R.int(-4, 4), E = poly([1, 0, -3 * p * p, c]), H = 2 * p * p * p + c, B = -2 * p * p * p + c, ans = H - B - 1;
    const q = 'On considère f(x) = ' + E + ". Pour combien d'entiers k l'équation f(x) = k admet-elle exactement trois solutions ?";
    const F = fin(ans, [[ans + 2, nb(ans + 2) + ' compte aussi k = ' + nb(B) + ' et k = ' + nb(H) + ', qui ne donnent que deux solutions'], [ans + 1, null], [2 * p * p * p - 1, nb(2 * p * p * p - 1) + ' ne garde qu\'un côté'], [ans - 1, null]], {min: 0});
    return sortie(q, F, 'On trouve le maximum local et le minimum local avec la dérivée : l\'équation a trois solutions exactement quand k est strictement entre ces deux valeurs. f\'(x) = 3x² − ' + (3 * p * p) + ' = 3(x + ' + p + ')(x − ' + p + '), f(−' + p + ') = ' + nb(H)
      + ' et f(' + p + ') = ' + nb(B) + '. Les entiers strictement compris entre ' + nb(B) + ' et ' + nb(H) + ' sont au nombre de ' + nb(H) + ' − ' + par(B) + ' − 1 = ' + ans + '.');
  }
  if (t === 1){
    const r1 = R.int(-3, 2), d = R.pick([2, 3]), r2 = r1 + d, S = r1 + r2, P = r1 * r2, cs = [2, -3 * S, 6 * P, R.int(-3, 3)], E = poly(cs), H = evalP(cs, r1), B = evalP(cs, r2), ans = H - B - 1;
    const facs = r1 === 0 ? 'x' + fac(r2) : r2 === 0 ? 'x' + fac(r1) : fac(r1) + fac(r2);
    const q = 'On considère f(x) = ' + E + ". Pour combien d'entiers k l'équation f(x) = k admet-elle exactement trois solutions ?";
    const F = fin(ans, [[ans + 2, nb(ans + 2) + ' compte aussi les valeurs des extremums, qui ne donnent que deux solutions'], [ans + 1, null], [H - B, null], [ans - 1, null]], {min: 0});
    return sortie(q, F, 'On trouve le maximum local et le minimum local avec la dérivée : l\'équation a trois solutions exactement quand k est strictement entre ces deux valeurs. f\'(x) = ' + poly([6, -6 * S, 6 * P]) + ' = 6' + facs + ', donc f admet un maximum local en '
      + nb(r1) + ' et un minimum local en ' + nb(r2) + '. ' + calcul('f', cs, r1) + ' et ' + calcul('f', cs, r2) + '. Les entiers strictement compris entre ' + nb(B) + ' et ' + nb(H) + ' sont au nombre de ' + ans + '.');
  }
  const p = R.int(1, 3), H = 2 * p * p * p, Nn = R.pick([20, 30, 50, 60, 100].filter(x => x > H + 2)), ans = 2 * (Nn - H);
  const q = "Pour combien d'entiers k compris entre −" + Nn + ' et ' + Nn + " l'équation " + poly([1, 0, -3 * p * p, 0]) + ' = k admet-elle une seule solution ?';
  const F = fin(ans, [[ans - 2, nb(ans - 2) + ' compte k = ' + H + ' et k = −' + H + ', qui donnent deux solutions'], [Nn - H, nb(Nn - H) + ' oublie les valeurs négatives de k'], [2 * Nn + 1 - (2 * H - 1), nb(2 * Nn + 1 - (2 * H - 1)) + ' range les valeurs à deux solutions parmi celles à une solution'], [ans + 2, null]], {min: 0});
  return sortie(q, F, 'On trouve le maximum local et le minimum local avec la dérivée : une seule solution quand k est au-dessus du maximum local ou au-dessous du minimum local. Les extremums sont en x = −' + p + ' et x = ' + p + ', de valeurs ' + H + ' et −' + H
    + '. Il faut k > ' + H + ' ou k < −' + H + ' : de ' + (H + 1) + ' à ' + Nn + ', il y a ' + (Nn - H) + ' entiers, autant du côté négatif, soit ' + ans + '.');
}

/* 5B · tableau à quatre morceaux */
const g5table = R => gCompteK(R, 4, [2, 3, 4]);

/* 5C · droites y = mx (+ q) qui coupent une parabole */
function g5droite(R){
  const s = R.int(1, 4), Nn = R.pick([10, 12, 15, 20]), qq = R.pick([0, 0, 1, 2, -1, -3]), c = s * s + qq, deux = R.int(0, 2) > 0;
  const droite = 'y = mx' + (qq ? (qq > 0 ? ' + ' + qq : ' − ' + (-qq)) : '');
  const ans = deux ? 2 * (Nn - 2 * s) : 4 * s - 1;
  const q = "Pour combien d'entiers m compris entre −" + Nn + ' et ' + Nn + " la droite d'équation " + droite + ' ' + (deux ? 'coupe-t-elle' : 'ne rencontre-t-elle pas')
    + " la parabole d'équation y = " + poly([1, 0, c]) + (deux ? ' en deux points distincts' : '') + ' ?';
  const l = deux ? [[ans + 2, nb(ans + 2) + ' compte aussi m = ' + (2 * s) + ' et m = −' + (2 * s) + ', pour lesquels la droite est tangente'], [Nn - 2 * s, nb(Nn - 2 * s) + ' oublie les valeurs négatives de m'],
    [2 * (Nn - s), nb(2 * (Nn - s)) + ' vient de m² > ' + (s * s) + ' : on a oublié le 4 de b² − 4ac']]
    : [[4 * s + 1, nb(4 * s + 1) + ' compte aussi les deux droites tangentes, qui rencontrent la parabole'], [2 * s, nb(2 * s) + ' oublie les valeurs négatives de m'],
    [2 * s - 1, nb(2 * s - 1) + ' vient de m² < ' + (s * s) + ' : on a oublié le 4 de b² − 4ac']];
  return sortie(q, fin(ans, l, {min: 0}), "On écrit l'équation des abscisses des points communs et on regarde son discriminant : deux points s'il est positif, un point de contact s'il est nul, aucun s'il est négatif. "
    + poly([1, 0, c]) + ' = mx' + (qq ? (qq > 0 ? ' + ' + qq : ' − ' + (-qq)) : '') + ' donne x² − mx + ' + (s * s) + ' = 0, de discriminant m² − ' + (4 * s * s) + '. '
    + (deux ? 'Il est positif quand m > ' + (2 * s) + ' ou m < −' + (2 * s) + ' : de ' + (2 * s + 1) + ' à ' + Nn + ', il y a ' + (Nn - 2 * s) + ' entiers, autant du côté négatif, soit ' + ans + '.'
      : 'Il est négatif quand −' + (2 * s) + ' < m < ' + (2 * s) + ' : les entiers de −' + (2 * s - 1) + ' à ' + (2 * s - 1) + ', soit ' + ans + '.'));
}

/* 5D · boîte sans couvercle de volume maximal */
function g5boite(R){
  const L = R.pick([12, 18, 24, 30, 36, 42, 48, 60]), x = L / 6, V = x * (L - 2 * x) * (L - 2 * x), cote = R.int(0, 1) === 1;
  const Vx = u => u * (L - 2 * u) * (L - 2 * u);
  const q = 'Dans une plaque carrée en carton de ' + L + ' cm de côté, on découpe aux quatre coins un carré de x cm de côté, puis on replie les bords pour former une boîte sans couvercle. '
    + (cote ? 'Pour quelle valeur de x, en cm, le volume de la boîte est-il maximal ?' : 'Quel est le volume maximal de la boîte, en cm³ ?');
  const F = cote ? fin(x, [[L / 4, nb(L / 4) + ' est le milieu de 0 et ' + nb(L / 2) + ', mais la fonction volume n\'est pas symétrique'], [L / 3, nb(L / 3) + ' est la valeur qui fait un cube creux, pas le maximum'],
    [L / 2, nb(L / 2) + ' annule le volume'], [L / 12, null]], {min: 0.5})
    : fin(V, [[Vx(L / 4), nb(Vx(L / 4)) + ' est le volume pour x = ' + nb(L / 4) + ', milieu de 0 et ' + nb(L / 2) + ' : la fonction n\'est pas symétrique'], [Vx(L / 3), nb(Vx(L / 3)) + ' est le volume pour x = ' + nb(L / 3)],
      [Math.pow(L / 3, 3), null], [(L / 6) * L * L / 4, null]], {pas: Math.max(1, Math.round(V / 20)), min: 1});
  return sortie(q, F, 'Le volume vaut V(x) = x(' + L + ' − 2x)² pour x entre 0 et ' + nb(L / 2) + ' : on le dérive et on cherche où la dérivée s\'annule en passant de + à −. '
    + 'V\'(x) = (' + L + ' − 2x)² − 4x(' + L + ' − 2x) = (' + L + ' − 2x)(' + L + ' − 6x), qui s\'annule en x = ' + nb(L / 6) + ' (et en ' + nb(L / 2) + ', où le volume est nul) ; V croît avant ' + nb(L / 6) + ' et décroît après. '
    + 'Pour x = ' + nb(x) + ', le fond mesure ' + nb(L - 2 * x) + ' cm de côté et V = ' + nb(x) + ' × ' + nb(L - 2 * x) + '² = ' + nb(V) + ' cm³.');
}

/* 5E · x²y maximal à somme fixée */
function g5x2y(R){
  const S = 3 * R.int(2, 10), x = 2 * S / 3, y = S / 3, v = x * x * y;
  const q = R.int(0, 1) ? 'Deux nombres positifs x et y ont pour somme ' + S + '. Quelle est la plus grande valeur possible de x² × y ?'
    : 'On partage le nombre ' + S + ' en deux parts positives x et y. Quelle est la plus grande valeur possible du produit x²y ?';
  const F = fin(v, [[Math.pow(S / 2, 3), nb(Math.pow(S / 2, 3), 3) + ' prend x = y, ce qui n\'est pas optimal : x doit être le double de y'], [y * y * x, nb(y * y * x) + ' échange les rôles de x et y'],
    [S * S * S / 9, null], [v + S, null]], {fmt: u => nb(u, 3), pas: Math.max(1, Math.round(v / 20)), min: 1});
  return sortie(q, F, 'On remplace y par ' + S + ' − x et on étudie f(x) = x²(' + S + ' − x) = ' + S + 'x² − x³ sur [0 ; ' + S + '] avec sa dérivée. '
    + 'f\'(x) = ' + (2 * S) + 'x − 3x² = x(' + (2 * S) + ' − 3x), qui s\'annule en x = ' + nb(x) + ' en passant de + à − : maximum. Alors y = ' + nb(y) + ' et x²y = ' + nb(x) + '² × ' + nb(y) + ' = ' + nb(v) + '.');
}

/* 5F · comparaisons délicates de puissances */
const g5puiss = R => gPuiss(R, PUISS5);

/* 5G · le plus grand minimum d'une famille de paraboles */
function g5maxmin(R){
  const a = R.int(1, 6), b = R.pick(NZ(range(-9, 9))), ans = a * a + b;
  const E = 'x² − 2mx + ' + (2 * a) + 'm' + (b < 0 ? ' − ' + (-b) : ' + ' + b);
  const q = 'Pour chaque nombre réel m, on considère la fonction f définie par f(x) = ' + E + '. Son minimum dépend de m. Quelle est la plus grande valeur possible de ce minimum ?';
  const F = fin(ans, [[a, nb(a) + ' est la valeur de m qui convient, pas celle du minimum'], [b, nb(b) + ' est le minimum obtenu pour m = 0, qui n\'est pas le meilleur choix'],
    [-a * a + b, nb(-a * a + b) + ' : erreur de signe sur m²'], [4 * a * a + b, null]]);
  return sortie(q, F, 'Pour m fixé, le minimum de f est atteint au sommet x = m ; on obtient une nouvelle fonction de m, encore une parabole, dont on cherche cette fois le maximum. '
    + 'f(m) = m² − 2m² + ' + (2 * a) + 'm' + (b < 0 ? ' − ' + (-b) : ' + ' + b) + ' = −m² + ' + (2 * a) + 'm' + (b < 0 ? ' − ' + (-b) : ' + ' + b) + ', maximal en m = ' + (2 * a) + ' ÷ 2 = ' + a + '. Le plus grand minimum vaut −' + (a * a) + ' + ' + (2 * a * a) + (b < 0 ? ' − ' + (-b) : ' + ' + b) + ' = ' + nb(ans) + '.');
}

/* ---------- aiguillage ---------- */
const TYPES = {
  1: [g1image, g1point, g1compare, g1croissance, g1tarif],
  2: [g2sommet, g2canon, g2racines, g2signe, g2deriv, g2seuil, g2tableau],
  3: [g3recette, g3enclos, g3expo, g3offres, g3benef, g3param, g3tranches, g3table],
  4: [g4parm, g4table, g4croiss, g4elast, g4tangente, g4produit, g4tranchesInv, g4cubique],
  5: [g5cub3, g5table, g5droite, g5boite, g5x2y, g5puiss, g5maxmin]
};
function secours(){
  return {q: 'On considère la fonction f définie par f(x) = x² − 6x + 5. En quelle valeur de x f atteint-elle son minimum ?', a: '3', accept: null, choix: ['3', '−3', '6', '−4'],
    expl: "L'abscisse du sommet d'une parabole y = ax² + bx + c vaut −b/(2a). Ici −b/(2a) = 6 ÷ 2 = 3, et f(3) = 9 − 18 + 5 = −4 est le minimum. Piège : −4 est la valeur du minimum, pas l'abscisse."};
}

A.push({
  id: 'alb-30-fonctions-variations',
  phase: 'albert',
  ordre: 30,
  theme: 'fonctions',
  titre: 'Fonctions : second degré, variations, croissance',
  objectif: "Exploiter une fonction sans calculatrice : calculer une image, trouver le sommet d'une parabole, lire un signe ou un tableau de variations, optimiser une quantité concrète et comparer des croissances.",
  lecon:
`<p class="lede">Au test, les fonctions arrivent sous une forme très concrète : calculer une image, trouver le sommet d'une parabole, lire un tableau de variations, choisir le prix qui rapporte le plus, ou dire quand une quantité qui double dépasse une quantité qui augmente régulièrement. Tout se fait <mark>de tête ou au brouillon</mark>, avec quelques réflexes.</p>
<h2>Ce que le test te demande</h2>
<p>On ne te demande jamais de réciter un cours. On te donne une expression comme 2x² − 12x + 5, un petit tableau de variations ou une situation (un prix, un enclos, une offre qui double) et tu dois trouver un nombre : une image, un maximum, un nombre de solutions, un seuil. Les questions faciles se règlent par un calcul direct. Les plus difficiles cachent un paramètre (« pour combien de valeurs de m… ») ou demandent de compter avec soin les solutions de f(x) = k. Le bon réflexe est presque toujours le même : <mark>trouver le sommet</mark>, ou les points où la courbe change de sens.</p>
<h2>Les prérequis, en bref</h2>
<p><strong>L'image.</strong> Pour calculer f(−3), on remplace x par (−3) avec les parenthèses : (−3)² = 9, alors que −3² = −9. Et 2x² veut dire 2 × x², pas (2x)².</p>
<p><strong>Les trois écritures d'un trinôme.</strong> Chacune montre une information différente.</p>
<table class="tbl">
<thead><tr><th>Écriture</th><th>Exemple</th><th>Ce qu'on y lit</th></tr></thead>
<tbody>
<tr><td>développée ax² + bx + c</td><td>2x² − 12x + 5</td><td>f(0) = c ; sommet en x = −b/(2a) = 3</td></tr>
<tr><td>canonique a(x − α)² + β</td><td>2(x − 3)² − 13</td><td>sommet (3 ; −13) lu directement</td></tr>
<tr><td>factorisée a(x − x₁)(x − x₂)</td><td>2(x − 1)(x − 5)</td><td>racines 1 et 5 ; sommet au milieu, en x = 3</td></tr>
</tbody>
</table>
<p><strong>Le sens.</strong> Si a &gt; 0, la parabole est tournée vers le haut et son sommet est un minimum ; si a &lt; 0, elle est tournée vers le bas et c'est un maximum.</p>
<p><strong>Dériver un polynôme.</strong> (x³)' = 3x², (x²)' = 2x, (x)' = 1, une constante donne 0. Là où f' est positive, f croît ; là où f' est négative, f décroît.</p>
<p><strong>Les suites géométriques.</strong> Doubler n fois, c'est multiplier par 2ⁿ. Repère précieux : 2¹⁰ = 1 024, environ mille.</p>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je reconnais l'écriture</strong> et je choisis l'outil : −b/(2a), lecture directe ou milieu des racines.</p>
<p><strong>2. Pour un maximum ou un minimum,</strong> je trouve l'abscisse du sommet, puis je calcule son image.</p>
<p><strong>3. Pour un signe ou une position,</strong> je combine le sommet et le sens de la parabole. Avec la forme factorisée : signe de a à l'extérieur des racines, signe contraire entre elles.</p>
<p><strong>4. Pour des variations,</strong> je dérive, je factorise f' et je lis son signe.</p>
<p><strong>5. Pour f(x) = k,</strong> je fais monter une droite horizontale y = k et je compte les morceaux du tableau qu'elle rencontre, sans compter deux fois une valeur prise à une jonction.</p>
<p><strong>6. Pour un problème concret,</strong> je nomme x, j'écris la quantité comme un produit (prix × quantité, longueur × largeur), je reconnais une parabole et je prends son sommet.</p>
<p><strong>7. Pour comparer des croissances,</strong> je calcule les valeurs étape par étape jusqu'au dépassement.</p>
</div>
<h2>Exemples résolus</h2>
<h3>1. Une image piégée</h3>
<p>f(x) = 2x² − 5x + 1. f(−3) = 2 × (−3)² − 5 × (−3) + 1 = 18 + 15 + 1 = 34. Avec l'erreur (−3)² = −9, on trouverait −2.</p>
<h3>2. Le sommet</h3>
<p>f(x) = x² − 8x + 11. −b/(2a) = 8 ÷ 2 = 4, puis f(4) = 16 − 32 + 11 = −5. Comme a = 1 &gt; 0, le minimum de f vaut −5, atteint en x = 4.</p>
<h3>3. La recette maximale</h3>
<p>Au prix de p euros, on vend 400 − 8p objets. La recette vaut R(p) = p(400 − 8p). Ses racines sont 0 et 50, donc le maximum est au milieu : p = 25 €. On vend alors 400 − 200 = 200 objets, pour une recette de 25 × 200 = 5 000 €. Le piège serait de répondre 50 € : à ce prix, on ne vend plus rien.</p>
<h3>4. Combien de solutions ?</h3>
<p>f(x) = x³ − 12x. f'(x) = 3x² − 12 = 3(x + 2)(x − 2). f croît jusqu'à −2, où f(−2) = 16, décroît jusqu'à 2, où f(2) = −16, puis croît. L'équation f(x) = 10 a donc 3 solutions, f(x) = 16 en a 2, et f(x) = 20 n'en a qu'une. Les entiers k qui donnent 3 solutions vont de −15 à 15 : il y en a 31.</p>
<h3>5. Doubler contre ajouter</h3>
<p>Offre A : 100 € par jour. Offre B : 1 €, puis 2 €, 4 €… Le jour n, B donne 2ⁿ⁻¹ € : c'est au jour 8 (128 €) que le montant du jour dépasse 100 €. Mais les totaux sont 2ⁿ − 1 contre 100n : B ne passe devant qu'après 10 jours (1 023 € contre 1 000 €).</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl">
<thead><tr><th>Tu vois</th><th>Tu penses</th></tr></thead>
<tbody>
<tr><td>(−4)²</td><td>16, jamais −16</td></tr>
<tr><td>racines 2 et 8</td><td>sommet en x = 5</td></tr>
<tr><td>f(1) = f(7)</td><td>axe de symétrie x = 4</td></tr>
<tr><td>−3(x + 2)² + 5</td><td>maximum 5, atteint en x = −2</td></tr>
<tr><td>recette p(N − kp)</td><td>prix optimal au milieu de 0 et N/k</td></tr>
<tr><td>enclos contre un mur</td><td>longueur = 2 × largeur</td></tr>
<tr><td>x³ − 3p²x</td><td>extremums en −p et p, valeurs 2p³ et −2p³</td></tr>
<tr><td>2¹⁰, 2²⁰</td><td>environ mille, environ un million</td></tr>
</tbody>
</table>
<div class="box astuce"><p class="box-t">Astuce</p><p>Cherche d'abord le sommet de la parabole (−b/(2a), milieu des racines ou forme canonique) ou les points où la dérivée change de signe : presque toutes les questions se règlent à partir de là.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Calculer (−3)² comme −9. Oublier le 2 dans −b/(2a). Donner l'abscisse du sommet quand on demande la valeur du maximum, ou l'inverse. Répondre le prix qui annule les ventes au lieu du prix optimal. Compter deux fois une valeur atteinte à la jonction de deux morceaux d'un tableau. Confondre le montant d'un jour et le total cumulé. Croire qu'une équation de degré 3 a toujours trois solutions.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Sommet en x = −b/(2a), au milieu des racines. a &gt; 0 : minimum ; a &lt; 0 : maximum. f' &gt; 0 : f croît. Recette et aire à périmètre fixé sont des paraboles : l'optimum est au sommet. Une croissance qui multiplie finit toujours par dépasser une croissance qui ajoute.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(TYPES[n])(R);
      if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return secours();
      return ex;
    } catch (e){ return secours(); }
  }
});

})();
