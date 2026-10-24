/* ===== Maths · Objectif Albert School : alb-25 · Suites logiques de nombres et de lettres =====
   Compétence de la piste Albert (window.ALBERT_SKILLS), même contrat que alb-01-pourcentages.
   gen(level, R) rend un QCM : exactement 4 choix distincts au sens de normStr, dont a ; accept: null.
   Niveaux 1 à 3 : séries de la leçon. Niveaux 4 et 5 : paliers hauts du test blanc adaptatif.
   Sous-types : terme suivant, terme manquant, terme de rang éloigné, intrus ; nombres, lettres,
   groupes de lettres, fractions. Toutes les réponses sont calculées à partir des paramètres tirés. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (recopiées de la référence) ---------- */
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

/* ---------- aides propres aux suites ---------- */
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const mod26 = k => ((k - 1) % 26 + 26) % 26 + 1;                 // rang quelconque ramené entre 1 et 26
const lettre = k => ALPHA.charAt(mod26(k) - 1);
const dansAlpha = k => k >= 1 && k <= 26;
const ent = x => nb(x, 0);
const listeN = t => t.map(ent).join(' ; ');
const listeL = t => t.map(lettre).join(', ');
const ecarts = t => t.slice(1).map((x, i) => x - t[i]);
const ecartsTxt = t => listeN(ecarts(t));
const rangsTxt = t => t.map(k => lettre(k) + ' = ' + k).join(', ');
/* rang « déroulé » d'un alphabet circulaire : 28 s'écrit « B = 2 + 26 = 28 » */
const rangCirc = u => u > 26 ? lettre(u) + ' = ' + mod26(u) + ' + 26 = ' + u : lettre(u) + ' = ' + u;
const ordM = n => n === 1 ? '1er' : n + 'e';
const ordF = n => n === 1 ? '1re' : n + 'e';
const signe = x => x >= 0 ? '+ ' + ent(x) : '− ' + ent(-x);
const voisinsN = ans => k => ent(ans + (k % 2 ? (k + 1) / 2 : -k / 2));
const voisinsL = (ans, circ) => k => { const x = ans + (k % 2 ? (k + 1) / 2 : -k / 2); return circ ? lettre(x) : (dansAlpha(x) ? lettre(x) : null); };
const pgcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b){ const r = a % b; a = b; b = r; } return a; };
const QN = ['Quel nombre continue logiquement cette suite ?', 'Quel nombre vient ensuite dans cette suite logique ?', 'Complète cette suite logique :'];
const QL = ['Quelle lettre continue logiquement cette suite ?', 'Quelle lettre vient ensuite dans cette suite ?', 'Complète cette suite de lettres :'];
const CIRC = 'Ici, l\'alphabet est circulaire : après Z, on repart à A.';

/* =====================================================
   NIVEAU 1 · découverte (1 min)
   ===================================================== */
/* Écart constant, montant ou descendant. */
function n1Arith(R){
  const monte = R.int(0, 2) > 0;
  let t, r;
  if (monte){ r = R.int(2, 12); const a = R.int(1, 30); t = [0, 1, 2, 3, 4].map(i => a + i * r); }
  else { r = R.int(3, 9); const fin = R.int(r + 1, r + 30); t = [5, 4, 3, 2, 1].map(i => fin + i * r); }
  const s = monte ? r : -r, der = t[4], ans = der + s;
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(ans + s), ent(ans + 1), ent(ans - 1)], voisinsN(ans)),
    expl: 'Calcule l\'écart entre deux termes voisins : s\'il ne change pas, il suffit de le reporter une fois de plus. L\'écart vaut toujours ' + signe(s) + ' : on ' + (monte ? 'ajoute ' : 'retire ') + r + ' à chaque étape. Donc ' + ent(der) + ' ' + signe(s) + ' = ' + ent(ans) + '. Piège : ' + ent(ans + s) + ' est le terme d\'après, on a fait une étape de trop.'
  };
}
/* Multiplication ou division constante. */
function n1Geom(R){
  const mode = R.pick(['x2', 'x2', 'x3', 'x5', 'd2']);
  let t, ans, k;
  if (mode === 'x2'){ const a = R.int(1, 12); t = [1, 2, 4, 8, 16].map(m => a * m); ans = 32 * a; k = 2; }
  else if (mode === 'x3'){ const a = R.int(1, 5); t = [1, 3, 9, 27].map(m => a * m); ans = 81 * a; k = 3; }
  else if (mode === 'x5'){ const a = R.int(1, 3); t = [1, 5, 25, 125].map(m => a * m); ans = 625 * a; k = 5; }
  else { const f = R.int(1, 12); t = [32, 16, 8, 4, 2].map(m => f * m); ans = f; k = 2; }
  const n = t.length, der = t[n - 1], av = t[n - 2], div = mode === 'd2';
  const constant = 2 * der - av, saut = div ? ans / 2 : ans * k, addi = div ? der - 2 : der + k;
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(constant), ent(addi), nb(saut, 1)], voisinsN(ans)),
    expl: 'Regarde par quel nombre on passe d\'un terme au suivant : quand les écarts ' + (div ? 'fondent' : 'grandissent') + ' très vite, pense à une ' + (div ? 'division' : 'multiplication') + '. Ici, on ' + (div ? 'divise par 2' : 'multiplie par ' + k) + ' à chaque étape : ' + ent(der) + (div ? ' ÷ 2' : ' × ' + k) + ' = ' + ent(ans) + '. Piège : ' + ent(constant) + ' suppose un écart constant, or les écarts (' + ecartsTxt(t) + ') sont ' + (div ? 'divisés par 2' : 'multipliés par ' + k) + ' à chaque étape.'
  };
}
/* Lettres à pas constant. */
function n1Lettres(R){
  const p = R.int(2, 4), s = R.int(1, 26 - 4 * p);
  const t = [0, 1, 2, 3].map(i => s + i * p), ans = s + 4 * p;
  return {
    q: R.pick(QL) + '\n' + listeL(t) + ', ?',
    a: lettre(ans),
    choix: qcm(lettre(ans), [dansAlpha(ans + 1) ? lettre(ans + 1) : null, lettre(ans - 1), dansAlpha(ans + p) ? lettre(ans + p) : null], voisinsL(ans)),
    expl: 'Écris sous chaque lettre son rang dans l\'alphabet, puis cherche l\'écart entre deux rangs voisins. ' + rangsTxt(t) + ' : on avance de ' + p + ' à chaque fois. ' + t[3] + ' + ' + p + ' = ' + ans + ', et la ' + ordF(ans) + ' lettre est ' + lettre(ans) + '. Piège : une erreur d\'une case dans l\'alphabet arrive vite, appuie-toi sur les repères E = 5, J = 10, O = 15, T = 20.'
  };
}
/* Terme manquant dans une suite à écart constant. */
function n1Manquant(R){
  const a = R.int(1, 40), r = R.int(2, 15), i = R.int(1, 3);
  const t = [0, 1, 2, 3, 4].map(k => a + k * r), ans = t[i];
  const j = i === 1 ? 2 : 0;                       // deux termes voisins connus
  return {
    q: R.pick(['Quel nombre manque dans cette suite logique ?', 'Quel nombre faut-il écrire à la place du point d\'interrogation ?']) + '\n' + t.map((x, k) => k === i ? '?' : ent(x)).join(' ; '),
    a: ent(ans),
    choix: qcm(ent(ans), [ent(ans + 1), ent(ans - 1), ent(ans + 2)], voisinsN(ans)),
    expl: 'Trouve l\'écart grâce à deux termes voisins connus, puis vérifie-le de part et d\'autre du trou. De ' + ent(t[j]) + ' à ' + ent(t[j + 1]) + ', l\'écart vaut ' + r + '. Donc ? = ' + ent(t[i - 1]) + ' + ' + r + ' = ' + ent(ans) + ', et on vérifie : ' + ent(ans) + ' + ' + r + ' = ' + ent(t[i + 1]) + '.'
  };
}
/* Carrés consécutifs. */
function n1Carres(R){
  const k = R.int(1, 7), t = [0, 1, 2, 3, 4].map(i => (k + i) * (k + i)), m = k + 5, ans = m * m;
  const d = ecarts(t), der = t[4];
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(der + d[3]), ent(2 * m), ent(ans - 1)], voisinsN(ans)),
    expl: 'Compare les termes avec la liste des carrés, ou calcule les écarts entre termes voisins. Ici ' + t.map((x, i) => ent(x) + ' = ' + (k + i) + '²').join(', ') + ' : ce sont les carrés de ' + k + ' à ' + (k + 4) + '. Le suivant est ' + m + '² = ' + ans + '. Les écarts le confirment : ' + ecartsTxt(t) + ' augmentent de 2, l\'écart suivant vaut ' + (d[3] + 2) + '. Piège : ' + ent(der + d[3]) + ' reprend le dernier écart sans le faire augmenter, et ' + 2 * m + ' confond ' + m + '² avec 2 × ' + m + '.'
  };
}

/* =====================================================
   NIVEAU 2 · maîtrise (1 à 2 min)
   ===================================================== */
/* Écarts qui augmentent régulièrement (écarts des écarts constants). */
function n2Second(R){
  const u0 = R.int(1, 20), d0 = R.int(1, 6), e = R.int(1, 3);
  const t = [u0]; let d = d0;
  for (let i = 0; i < 4; i++){ t.push(t[i] + d); d += e; }
  const der = t[4], ans = der + d, dDer = d - e;
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(der + dDer), ent(ans + e), ent(ans + 1)], voisinsN(ans)),
    expl: 'Écris les écarts entre termes voisins, puis regarde comment ces écarts évoluent. Les écarts sont ' + ecartsTxt(t) + ' : ils augmentent de ' + e + ' à chaque fois. L\'écart suivant vaut ' + dDer + ' + ' + e + ' = ' + d + ', donc ' + ent(der) + ' + ' + d + ' = ' + ent(ans) + '. Piège : ' + ent(der + dDer) + ' reprend le dernier écart sans le faire augmenter.'
  };
}
/* Lettres : recul constant, ou pas qui augmente. */
function n2Lettres(R){
  if (R.int(0, 1) === 0){
    const p = R.int(2, 5), s = R.int(4 * p + 1, 26);
    const t = [0, 1, 2, 3].map(i => s - i * p), ans = s - 4 * p, sens = t[3] + p;
    return {
      q: R.pick(QL) + '\n' + listeL(t) + ', ?',
      a: lettre(ans),
      choix: qcm(lettre(ans), [lettre(ans + 1), dansAlpha(ans - 1) ? lettre(ans - 1) : null, dansAlpha(sens) ? lettre(sens) : null], voisinsL(ans)),
      expl: 'Écris sous chaque lettre son rang dans l\'alphabet, puis calcule les écarts en faisant attention au sens. ' + rangsTxt(t) + ' : on recule de ' + p + ' à chaque fois. ' + t[3] + ' − ' + p + ' = ' + ans + ', soit ' + lettre(ans) + '.' + (dansAlpha(sens) ? ' Piège : ' + lettre(sens) + ' avance au lieu de reculer.' : ' Piège : vérifie le sens, ici on remonte vers le début de l\'alphabet.')
    };
  }
  const d0 = R.int(1, 2), tot = d0 === 1 ? 15 : 20, s = R.int(1, 26 - tot);
  const t = [s]; let d = d0;
  for (let i = 0; i < 4; i++){ t.push(t[i] + d); d++; }
  const ans = t[4] + d, cst = t[4] + d - 1;
  return {
    q: R.pick(QL) + '\n' + listeL(t) + ', ?',
    a: lettre(ans),
    choix: qcm(lettre(ans), [lettre(cst), dansAlpha(ans + 1) ? lettre(ans + 1) : null, lettre(ans - 2)], voisinsL(ans)),
    expl: 'Écris sous chaque lettre son rang dans l\'alphabet, puis regarde comment évoluent les écarts entre rangs voisins. ' + rangsTxt(t) + ' : les écarts sont ' + ecartsTxt(t) + ', ils augmentent de 1. L\'écart suivant vaut ' + d + ', donc ' + t[4] + ' + ' + d + ' = ' + ans + ', soit ' + lettre(ans) + '. Piège : ' + lettre(cst) + ' garde le dernier écart sans le faire augmenter.'
  };
}
/* Deux suites à écart constant mêlées (rangs pairs et impairs). L = 8 ou 9 : chaque sous-suite montre au moins
   4 termes, sinon 3 termes comme 3 ; 5 ; 7 laissent croire aux nombres premiers (11) ou 2 ; 4 ; 6 à Fibonacci. */
function n2Entrelace(R){
  for (let essai = 0; essai < 100; essai++){
  const a = R.int(1, 15), r1 = R.int(2, 6), descend = R.int(0, 1) === 0;
  const r2 = descend ? -R.int(1, 5) : R.pick([1, 2, 3, 4, 5, 6, 7, 8].filter(x => x !== r1));
  const b = descend ? R.int(30, 60) : R.int(20, 50), L = R.pick([8, 9]);
  const terme = i => i % 2 === 0 ? a + (i / 2) * r1 : b + ((i - 1) / 2) * r2;
  /* zigzag net : toutes les valeurs de rang pair (réponse et pièges compris) au-dessus de celles de rang impair */
  const bas = [0, 2, 4, 6, 8, 10, 12].map(terme), haut = [1, 3, 5, 7, 9, 11].map(terme);
  if (Math.min(...haut) <= Math.max(...bas)) continue;
  const t = []; for (let i = 0; i < L; i++) t.push(terme(i));
  const ans = terme(L), autre = terme(L + 1), saut = terme(L + 2);
  const imp = t.filter((x, i) => i % 2 === 0), pai = t.filter((x, i) => i % 2 === 1);
  const cibleImpair = L % 2 === 0, rr = cibleImpair ? r1 : r2, base = cibleImpair ? imp[imp.length - 1] : pai[pai.length - 1];
  const mauvaisPas = base + (cibleImpair ? r2 : r1);                     // bonne sous-suite, mais pas de l'autre
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(autre), ent(saut), mauvaisPas > 0 ? ent(mauvaisPas) : null], voisinsN(ans)),
    expl: 'Quand la suite monte et descend en zigzag, sépare les termes de rang impair et ceux de rang pair : ce sont souvent deux suites mêlées. Rangs impairs : ' + listeN(imp) + ', on ajoute ' + r1 + '. Rangs pairs : ' + listeN(pai) + ', on ' + (r2 > 0 ? 'ajoute ' + r2 : 'retire ' + (-r2)) + '. Le terme cherché est le ' + ordM(L + 1) + ', de rang ' + (cibleImpair ? 'impair' : 'pair') + ' : ' + ent(base) + ' ' + signe(rr) + ' = ' + ent(ans) + '. Piège : ' + ent(autre) + ' continue l\'autre suite.'
  };
  }
  return n2Second(R);
}
/* Deux opérations qui alternent (+ a puis × b, etc.). */
function n2Alterne(R){
  const app = (o, x) => o.t === '+' ? x + o.v : o.t === '−' ? x - o.v : x * o.v;
  const txt = o => o.t + ' ' + o.v;
  for (let essai = 0; essai < 60; essai++){
    const forme = R.int(0, 3), b = R.pick([2, 3]);
    let ops, s;
    if (forme === 0){ s = R.int(1, 9); ops = [{t: '+', v: R.int(1, 9)}, {t: '×', v: b}]; }
    else if (forme === 1){ s = R.int(1, 9); ops = [{t: '×', v: b}, {t: '+', v: R.int(1, 9)}]; }
    else if (forme === 2){ s = R.int(2, 9); const amax = s * (b - 1) - 1; if (amax < 1) continue; ops = [{t: '×', v: b}, {t: '−', v: R.int(1, amax)}]; }
    else { s = R.int(3, 12); const amax = Math.floor((s * (b - 1) - 1) / (b + 1)); if (amax < 1) continue; ops = [{t: '−', v: R.int(1, amax)}, {t: '×', v: b}]; }
    const L = R.pick([5, 6]), t = [s];
    for (let i = 1; i < L; i++) t.push(app(ops[(i - 1) % 2], t[i - 1]));
    const jBon = (L - 1) % 2, jAutre = 1 - jBon, der = t[L - 1];
    const ans = app(ops[jBon], der);
    if (Math.max(ans, ...t) > 1000 || Math.min(...t) < 1) continue;
    /* étape × b indiscernable de + v (3 → 9 vaut × 3 et + 6) : la suite admettrait une autre lecture */
    const plus = ops.find(o => o.t === '+');
    if (plus && t.some(x => x * (b - 1) === plus.v)) continue;
    const etapes = t.slice(1).map((x, i) => ent(t[i]) + ' → ' + ent(x) + ' (' + txt(ops[i % 2]) + ')').join(', ');
    const meme = app(ops[jAutre], der);
    return {
      q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
      a: ent(ans),
      choix: qcm(ent(ans), [ent(meme), ent(app(ops[jAutre], ans)), ent(2 * der - t[L - 2])], voisinsN(ans)),
      expl: 'Note l\'opération qui fait passer d\'un terme au suivant, étape par étape : la règle peut alterner deux opérations. Ici : ' + etapes + '. On alterne ' + txt(ops[0]) + ' et ' + txt(ops[1]) + '. La dernière étape était ' + txt(ops[jAutre]) + ', la suivante est donc ' + txt(ops[jBon]) + ' : ' + ent(der) + ' ' + txt(ops[jBon]) + ' = ' + ent(ans) + '. Piège : ' + ent(meme) + ' applique deux fois de suite la même opération.'
    };
  }
  return n2Second(R);
}
/* Chaque terme est la somme des deux précédents. */
function n2Fibo(R){
  const u0 = R.int(1, 9), u1 = R.int(u0, 9);
  const t = [u0, u1]; while (t.length < 6) t.push(t[t.length - 1] + t[t.length - 2]);
  const ans = t[5] + t[4], cst = 2 * t[5] - t[4];
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(cst), ent(2 * t[5]), ent(ans + 1)], voisinsN(ans)),
    expl: 'Quand les écarts ne suivent pas de règle simple, regarde si chaque terme se calcule avec les deux termes qui le précèdent. Ici chaque terme est la somme des deux précédents : ' + t[0] + ' + ' + t[1] + ' = ' + t[2] + ', ' + t[1] + ' + ' + t[2] + ' = ' + t[3] + ', et ainsi de suite. Le suivant vaut ' + t[4] + ' + ' + t[5] + ' = ' + ans + '. Piège : ' + ent(cst) + ' répète le dernier écart, qui n\'est pas constant ici (' + ecartsTxt(t) + ').'
  };
}
/* Terme de rang N d'une suite à écart constant (piège du − 1). */
function n2Rang(R){
  const a = R.int(1, 20), r = R.int(2, 9), N = R.pick([10, 12, 15, 20, 21, 25, 30, 40, 50, 100]);
  const t = [0, 1, 2, 3].map(i => a + i * r), ans = a + (N - 1) * r;
  return {
    q: 'Voici le début d\'une suite logique :\n' + listeN(t) + ' ; …\nQuel est son ' + ordM(N) + ' terme ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(a + N * r), ent(N * r), ent(a + (N - 2) * r)], voisinsN(ans)),
    expl: 'Pour aller loin dans une suite à écart constant, compte les sauts : entre le premier terme et le terme cherché, il y a un saut de moins que le rang. L\'écart vaut ' + r + ' et du 1er au ' + N + 'e terme, il y a ' + (N - 1) + ' sauts. Le ' + N + 'e terme vaut donc ' + a + ' + ' + (N - 1) + ' × ' + r + ' = ' + a + ' + ' + ent((N - 1) * r) + ' = ' + ent(ans) + '. Piège : ' + ent(a + N * r) + ' compte ' + N + ' sauts au lieu de ' + (N - 1) + '.'
  };
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels (2 à 3 min)
   ===================================================== */
/* Écarts qui doublent, triplent, ou qui sont des carrés. */
function n3EcartsGeo(R){
  const mode = R.pick(['x2', 'x2', 'x3', 'carres']), u0 = R.int(1, 20);
  let d, k = 1;
  if (mode === 'x2'){ let d0 = R.int(1, 3); if (d0 === u0) d0 = d0 === 3 ? 1 : d0 + 1; d = [1, 2, 4, 8, 16].map(m => m * d0); }
  else if (mode === 'x3'){ let d0 = R.int(1, 2); if (d0 === 2 * u0) d0 = 1; d = [1, 3, 9, 27, 81].map(m => m * d0); }
  else { k = R.int(1, 4); d = [0, 1, 2, 3, 4].map(i => (k + i) * (k + i)); }
  const t = [u0]; for (let i = 0; i < 4; i++) t.push(t[i] + d[i]);
  const der = t[4], ans = der + d[4], deux = der + d[3] + (d[3] - d[2]), cst = der + d[3];
  const regle = mode === 'carres' ? 'ce sont les carrés ' + [0, 1, 2, 3].map(i => (k + i) + '²').join(', ') + ', donc l\'écart suivant vaut ' + (k + 4) + '² = ' + d[4]
    : 'chaque écart est le ' + (mode === 'x2' ? 'double' : 'triple') + ' du précédent, donc l\'écart suivant vaut ' + d[3] + ' × ' + (mode === 'x2' ? 2 : 3) + ' = ' + d[4];
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(deux), ent(cst), mode === 'x2' ? ent(2 * der) : ent(ans + 1)], voisinsN(ans)),
    expl: 'Écris les écarts entre termes voisins, puis cherche comment on passe d\'un écart au suivant : il ne s\'agit pas toujours d\'ajouter la même quantité. Les écarts sont ' + ecartsTxt(t) + ' : ' + regle + '. Le suivant vaut ' + ent(der) + ' + ' + ent(d[4]) + ' = ' + ent(ans) + '. Piège : ' + ent(deux) + ' fait augmenter les écarts d\'une quantité fixe (' + (d[3] - d[2]) + '), ce qui ne marche pas ici.'
  };
}
/* Chaque terme = k × le précédent + c. */
function n3Kc(R){
  for (let essai = 0; essai < 60; essai++){
    const k = R.pick([2, 2, 3]), c = R.pick([-3, -2, -1, 1, 2, 3]);
    const u0 = k === 2 ? R.int(1, 12) : R.int(1, 4);
    const t = [u0]; for (let i = 0; i < 4; i++) t.push(k * t[i] + c);
    const ans = k * t[4] + c;
    if (t[1] <= t[0] || ans > 1500) continue;
    const d = ecarts(t), deux = t[4] + d[3] + (d[3] - d[2]);
    const etapes = t.slice(1).map((x, i) => k + ' × ' + ent(t[i]) + ' ' + signe(c) + ' = ' + ent(x)).join(' ; ');
    return {
      q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
      a: ent(ans),
      choix: qcm(ent(ans), [ent(k * t[4]), ent(k * t[4] - c), ent(deux)], voisinsN(ans)),
      expl: 'Quand les termes grandissent de plus en plus vite, compare chaque terme au double ou au triple du précédent : l\'écart avec ce produit est souvent une petite constante. Ici : ' + etapes + '. Chaque terme est ' + (k === 2 ? 'le double' : 'le triple') + ' du précédent ' + (c > 0 ? 'plus ' : 'moins ') + Math.abs(c) + '. Le suivant vaut ' + k + ' × ' + ent(t[4]) + ' ' + signe(c) + ' = ' + ent(ans) + '. Piège : ' + ent(k * t[4]) + ' oublie le ' + signe(c) + '.'
    };
  }
  return n3EcartsGeo(R);
}
/* Garde-fous communs (terme manquant, intrus) : la suite suit-elle une règle simple ? Polynôme de degré 3 au plus,
   u(n+1) = k × u(n) + c, ou u(n+2) = α × u(n+1) + β × u(n) + c avec α et β entiers de −3 à 3. */
function suitRegleSimple(u){
  const n = u.length, d = ecarts(u), d2 = ecarts(d), d3 = ecarts(d2);
  if (d2.every(x => x === d2[0]) || d3.every(x => x === d3[0])) return true;
  if (u[1] !== u[0]){ const k = (u[2] - u[1]) / (u[1] - u[0]), c = u[1] - k * u[0]; let ok = true; for (let i = 1; i + 1 < n; i++) if (Math.abs(k * u[i] + c - u[i + 1]) > 1e-9) ok = false; if (ok) return true; }
  for (let al = -3; al <= 3; al++) for (let be = -3; be <= 3; be++){
    if (!al && !be) continue;
    const c = u[2] - al * u[1] - be * u[0]; let ok = true;
    for (let i = 2; i + 1 < n && ok; i++) if (al * u[i] + be * u[i - 1] + c !== u[i + 1]) ok = false;
    if (ok) return true;
  }
  return false;
}
function autreIntrusPossible(s, p){
  const lo = Math.min(...s) - 60, hi = Math.max(...s) + 60;
  for (let j = 0; j < s.length; j++){
    if (j === p) continue;
    const u = s.slice();
    for (let v = lo; v <= hi; v++){ if (v === s[j]) continue; u[j] = v; if (suitRegleSimple(u)) return true; }
  }
  return suitRegleSimple(s);
}
/* Terme manquant : aucune AUTRE valeur du trou ne doit rendre la suite régulière (4 ; 6 ; 12 ; ? ; 36 ; 54 admet 22,
   écarts + 2, + 6, + 10, mais aussi 18 : deux suites × 3 mêlées). */
function autreValeurTrou(t, i){
  const lo = Math.min(...t) - 60, hi = Math.max(...t) + 60, u = t.slice();
  for (let v = lo; v <= hi; v++){ if (v === t[i]) continue; u[i] = v; if (suitRegleSimple(u)) return true; }
  return false;
}
/* Terme manquant dans une suite dont les écarts augmentent régulièrement. */
function n3Manquant(R){
  let u0, d0, e, i, t, essai = 0;
  do {
    u0 = R.int(1, 20); d0 = R.int(1, 6); e = R.int(1, 4); i = R.int(1, 4);
    t = [u0]; let d = d0;
    for (let k = 0; k < 5; k++){ t.push(t[k] + d); d += e; }
  } while (autreValeurTrou(t, i) && ++essai < 100);
  if (essai >= 100) return n2Second(R);
  const ans = t[i], moy = (t[i - 1] + t[i + 1]) / 2, moyOk = e % 2 === 0;
  return {
    q: R.pick(['Quel nombre manque dans cette suite logique ?', 'Quel nombre faut-il écrire à la place du point d\'interrogation ?']) + '\n' + t.map((x, k) => k === i ? '?' : ent(x)).join(' ; '),
    a: ent(ans),
    choix: qcm(ent(ans), [moyOk ? ent(moy) : ent(ans + e), ent(ans - e), ent(ans + 1)], voisinsN(ans)),
    expl: 'Écris les écarts entre les termes connus qui se suivent, trouve leur règle, puis complète le trou pour qu\'elle marche des deux côtés. La suite complète est ' + listeN(t) + ' : ses écarts ' + ecartsTxt(t) + ' augmentent de ' + e + '. Le terme manquant vaut donc ' + ent(t[i - 1]) + ' + ' + ent(t[i] - t[i - 1]) + ' = ' + ent(ans) + ', et on vérifie : ' + ent(ans) + ' + ' + ent(t[i + 1] - t[i]) + ' = ' + ent(t[i + 1]) + '.' + (moyOk ? ' Piège : ' + ent(moy) + ' est la moyenne des deux voisins, elle ne convient que si l\'écart est constant.' : ' Piège : ici l\'écart n\'est pas constant, on ne peut pas prendre la moyenne des deux voisins.')
  };
}
/* Deux suites de lettres mêlées, souvent en sens contraires. L = 8 ou 9 : 4 lettres visibles au moins dans chaque
   sous-suite (avec A, B, C seulement, certains continueraient par E en pensant à Fibonacci 1, 2, 3, 5). */
function n3LettresEntrelacees(R){
  let a, b, L, inv, terme, t, essai = 0;
  do {
    a = R.int(1, 3); b = R.int(1, 3); L = R.pick([8, 9]); inv = R.int(0, 1) === 1;
    const s1 = R.int(1, 26 - 5 * a), s2 = R.int(1 + 5 * b, 26);
    const av = j => s1 + j * a, re = j => s2 - j * b;
    terme = i => (i % 2 === 0) !== inv ? av(Math.floor(i / 2)) : re(Math.floor(i / 2));
    t = []; for (let i = 0; i <= L + 1; i++) t.push(terme(i));
  } while (new Set(t).size < t.length && ++essai < 200);
  t = t.slice(0, L);
  const ans = terme(L), autre = terme(L + 1);
  const imp = t.filter((x, i) => i % 2 === 0), pai = t.filter((x, i) => i % 2 === 1);
  const descr = (sub, i0) => { const avance = (i0 % 2 === 0) !== inv; return rangsTxt(sub) + ', on ' + (avance ? 'avance de ' + a : 'recule de ' + b); };
  const cible = L % 2 === 0 ? 'impair' : 'pair', avCible = (L % 2 === 0) !== inv;
  const prec = terme(L - 2);
  return {
    q: R.pick(QL) + '\n' + listeL(t) + ', ?',
    a: lettre(ans),
    choix: qcm(lettre(ans), [lettre(autre), dansAlpha(ans + 1) ? lettre(ans + 1) : null, dansAlpha(ans - 1) ? lettre(ans - 1) : null], voisinsL(ans)),
    expl: 'Écris à part les lettres de rang impair (1re, 3e, 5e…) et celles de rang pair, puis traduis-les en rangs dans l\'alphabet : ce sont deux suites mêlées. Rangs impairs : ' + descr(imp, 0) + '. Rangs pairs : ' + descr(pai, 1) + '. La ' + ordF(L + 1) + ' lettre est de rang ' + cible + ' : ' + prec + (avCible ? ' + ' + a : ' − ' + b) + ' = ' + ans + ', soit ' + lettre(ans) + '. Piège : ' + lettre(autre) + ' continue l\'autre suite.'
  };
}
/* Cubes décalés, ou carrés des nombres impairs. */
function n3Puissances(R){
  if (R.int(0, 1) === 0){
    const k = R.int(0, 2), c = k === 0 ? R.int(0, 2) : R.int(-2, 2);
    const f = n => (n + k) * (n + k) * (n + k) + c;
    const t = [1, 2, 3, 4, 5].map(f), ans = f(6), d = ecarts(t), deux = t[4] + d[3] + (d[3] - d[2]), m = 6 + k;
    const forme = n => (n + k) + '³' + (c ? ' ' + signe(c) : '');
    return {
      q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
      a: ent(ans),
      choix: qcm(ent(ans), [ent(deux), ent(t[4] + d[3]), c ? ent(m * m * m) : ent((m + 1) * (m + 1) * (m + 1))], voisinsN(ans)),
      expl: 'Compare chaque terme avec le cube le plus proche : un décalage constant se repère vite. Les cubes à connaître sont 1 ; 8 ; 27 ; 64 ; 125 ; 216 ; 343 ; 512. Ici ' + t.map((x, i) => ent(x) + ' = ' + forme(i + 1)).join(', ') + '. Le suivant vaut ' + forme(6) + ' = ' + ent(ans) + '. Piège : ' + ent(deux) + ' suppose que les écarts (' + ecartsTxt(t) + ') augmentent toujours de ' + (d[3] - d[2]) + ', alors qu\'ils augmentent de ' + listeN(ecarts(d)) + '.'
    };
  }
  const k = R.int(0, 2), c = R.int(-1, 1), o = 2 * k + 1;
  const f = i => (o + 2 * i) * (o + 2 * i) + c;
  const t = [0, 1, 2, 3, 4].map(f), ans = f(5), d = ecarts(t), m = o + 10;
  const forme = i => (o + 2 * i) + '²' + (c ? ' ' + signe(c) : '');
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(t[4] + d[3]), ent((m - 1) * (m - 1) + c), ent(ans + 2)], voisinsN(ans)),
    expl: 'Compare chaque terme avec le carré le plus proche, ou étudie les écarts et leurs variations. Les carrés à connaître sont 1 ; 4 ; 9 ; 16 ; 25 ; 36 ; 49 ; 64 ; 81 ; 100 ; 121 ; 144 ; 169. Ici ' + t.map((x, i) => ent(x) + ' = ' + forme(i)).join(', ') + ' : on prend les carrés des nombres impairs à la suite. Le suivant vaut ' + forme(5) + ' = ' + ent(ans) + '. Les écarts le confirment : ' + ecartsTxt(t) + ' augmentent de 8, l\'écart suivant vaut ' + (d[3] + 8) + '. Piège : ' + ent((m - 1) * (m - 1) + c) + ' prend le carré de ' + (m - 1) + ', qui est pair.'
  };
}
/* Groupes de deux lettres : chaque position suit sa propre règle. */
const DEC = [[0, -1], [-1, 0], [1, 1], [-1, -1], [0, 2], [2, 0], [1, -1], [-1, 1], [0, -2], [-2, 0]];
function n3Groupes(R){
  const pas = [-3, -2, -1, 1, 2, 3], a = R.pick(pas), b = R.pick(pas);
  const s1 = a > 0 ? R.int(1, 26 - 4 * a) : R.int(1 - 4 * a, 26), s2 = b > 0 ? R.int(1, 26 - 4 * b) : R.int(1 - 4 * b, 26);
  const g = (x, y) => (dansAlpha(x) && dansAlpha(y)) ? lettre(x) + lettre(y) : null;
  const t1 = [0, 1, 2, 3].map(i => s1 + i * a), t2 = [0, 1, 2, 3].map(i => s2 + i * b);
  const x = s1 + 4 * a, y = s2 + 4 * b, ans = g(x, y);
  const sens = (p) => p > 0 ? 'on avance de ' + p : 'on recule de ' + (-p);
  return {
    q: R.pick(['Quel groupe de lettres continue logiquement cette suite ?', 'Complète cette suite de groupes de lettres :']) + '\n' + t1.map((u, i) => g(u, t2[i])).join(', ') + ', ?',
    a: ans,
    choix: qcm(ans, [g(x, y + 1), g(x + 1, y), g(x, y - 2 * b)], k => { const o = DEC[k % DEC.length]; return g(x + o[0], y + o[1]); }),
    expl: 'Étudie séparément la 1re lettre et la 2e lettre de chaque groupe, en les traduisant en rangs dans l\'alphabet. 1res lettres : ' + rangsTxt(t1) + ', ' + sens(a) + ', donc ' + lettre(x) + ' (' + x + '). 2es lettres : ' + rangsTxt(t2) + ', ' + sens(b) + ', donc ' + lettre(y) + ' (' + y + '). Le groupe suivant est ' + ans + '. Piège : chaque position a sa propre règle, et l\'une peut avancer pendant que l\'autre recule.'
  };
}

/* =====================================================
   NIVEAU 4 · plus dur que les exemples officiels (3 min)
   ===================================================== */
/* L'intrus : un seul terme casse la règle. 7 termes, intrus jamais au bord (il fausse alors deux écarts voisins).
   Garde-fou : aucune autre position ne doit pouvoir passer pour l'intrus, c'est-à-dire qu'en remplaçant un AUTRE
   terme par n'importe quelle valeur, la suite ne doit suivre aucune règle simple (polynôme de degré 3 au plus,
   u(n+1) = k × u(n) + c, u(n+2) = α × u(n+1) + β × u(n) + c avec de petits entiers). Sinon on retire. */
function n4Intrus(R){
  for (let essai = 0; essai < 200; essai++){
    const regle = R.pick(['arith', 'second', 'second', 'geo', 'kc']), L = 7;
    let t = [], desc;
    if (regle === 'arith'){ const a = R.int(2, 30), r = R.int(3, 12); for (let i = 0; i < L; i++) t.push(a + i * r); desc = 'les écarts valent tous ' + r + ' : on ajoute ' + r + ' à chaque étape'; }
    else if (regle === 'second'){ const u0 = R.int(1, 15), d0 = R.int(1, 5), e = R.int(1, 3); let d = d0; t.push(u0); for (let i = 0; i < L - 1; i++){ t.push(t[i] + d); d += e; } desc = 'les écarts ' + ecartsTxt(t) + ' augmentent de ' + e + ' à chaque étape'; }
    else if (regle === 'geo'){ const a = R.int(1, 6); for (let i = 0; i < L; i++) t.push(a * Math.pow(2, i)); desc = 'on multiplie par 2 à chaque étape'; }
    else { const c = R.pick([-1, 1, 2, 3]), u0 = R.int(2, 5); t.push(u0); for (let i = 0; i < L - 1; i++) t.push(2 * t[i] + c); desc = 'chaque terme est le double du précédent ' + (c > 0 ? 'plus ' : 'moins ') + Math.abs(c); }
    const p = R.int(1, L - 2), delta = R.pick([-3, -2, -1, 1, 2, 3]), faux = t[p] + delta;
    if (faux <= t[p - 1] || faux >= t[p + 1] || t.indexOf(faux) >= 0) continue;
    const s = t.slice(); s[p] = faux;
    if (autreIntrusPossible(s, p)) continue;
    const loin = [0, 1, 2, 3, 4, 5, 6].filter(i => Math.abs(i - p) > 1);
    const autres = [p - 1, p + 1, R.pick(loin)];
    return {
      q: R.pick(['Dans cette suite, un seul nombre ne respecte pas la règle suivie par les autres. Lequel ?', 'Un nombre s\'est glissé par erreur dans cette suite logique : il ne suit pas la règle. Lequel ?']) + '\n' + listeN(s),
      a: ent(faux),
      choix: qcm(ent(faux), autres.map(i => ent(s[i])), k => ent(s[loin[k % loin.length]])),
      expl: 'Trouve la règle grâce aux termes qui s\'enchaînent sans accroc, puis contrôle chaque terme un par un. La règle : ' + desc + '. La suite correcte serait ' + listeN(t) + '. Le ' + ordM(p + 1) + ' terme devrait valoir ' + ent(t[p]) + ', pas ' + ent(faux) + ' : c\'est l\'intrus. Piège : un terme faux fausse deux écarts à la fois, celui qui le précède et celui qui le suit ; ' + ent(s[p - 1]) + ' et ' + ent(s[p + 1]) + ' sont justes, c\'est ' + ent(faux) + ', le terme commun aux deux écarts anormaux, qu\'il faut accuser.'
    };
  }
  return n2Second(R);
}
/* Il faut descendre jusqu'aux écarts des écarts des écarts. */
function n4Cubique(R){
  const u0 = R.int(1, 10), d0 = R.int(1, 3), s0 = R.int(1, 3), f = R.int(1, 2);
  const t = [u0]; let d = d0, s = s0;
  for (let i = 0; i < 5; i++){ t.push(t[i] + d); d += s; s += f; }
  const ans = t[5] + d, d1 = ecarts(t), d2 = ecarts(d1);
  const deux = t[5] + d1[4] + d2[3], cst = t[5] + d1[4];
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(deux), ent(cst), ent(ans + 1)], voisinsN(ans)),
    expl: 'Calcule les écarts, puis les écarts des écarts, et recommence jusqu\'à obtenir une ligne constante. Écarts : ' + listeN(d1) + '. Écarts des écarts : ' + listeN(d2) + '. Ligne suivante : ' + listeN(ecarts(d2)) + ', constante. On remonte : l\'écart des écarts suivant vaut ' + d2[3] + ' + ' + f + ' = ' + (d2[3] + f) + ', l\'écart suivant vaut ' + d1[4] + ' + ' + (d2[3] + f) + ' = ' + d + ', donc ' + ent(t[5]) + ' + ' + d + ' = ' + ent(ans) + '. Piège : ' + ent(deux) + ' s\'arrête aux écarts des écarts, alors qu\'ils ne sont pas constants.'
  };
}
/* Fractions : numérateurs et dénominateurs suivent chacun leur règle. */
function n4Fractions(R){
  const fr = f => f[0] + '/' + f[1];
  const cle = f => { const g = pgcd(f[0], f[1]); return (f[0] / g) + '/' + (f[1] / g); };
  for (let essai = 0; essai < 100; essai++){
    const mode = R.pick(['x2+', '+x2', '++', '+−']);
    let num, den, regleN, regleD, piege, piegeTxt, autres;
    if (mode === 'x2+'){
      const n0 = R.int(1, 3), d0 = R.int(2, 9), kD = R.int(1, 4);
      num = i => n0 * Math.pow(2, i); den = i => d0 + i * kD; regleN = 'on multiplie par 2'; regleD = 'on ajoute ' + kD;
      piege = [2 * num(3) - num(2), den(4)]; piegeTxt = ' ajoute aux numérateurs un écart constant (' + (num(3) - num(2)) + ') au lieu de les multiplier par 2';
      autres = [[num(4), den(4) + kD], [piege[0], den(4) + kD]];
    } else if (mode === '+x2'){
      const n0 = R.int(1, 6), kN = R.int(1, 3), d0 = R.pick([3, 5, 7]);
      num = i => n0 + i * kN; den = i => d0 * Math.pow(2, i); regleN = 'on ajoute ' + kN; regleD = 'on multiplie par 2';
      piege = [2 * num(3), den(4)]; piegeTxt = ' multiplie les numérateurs par 2, comme les dénominateurs, au lieu de leur ajouter ' + kN;
      autres = [[num(4), 2 * den(3) - den(2)], [piege[0], 2 * den(3) - den(2)]];
    } else if (mode === '++'){
      const n0 = R.int(1, 6), kN = R.int(1, 4), d0 = R.int(2, 12), kD = R.int(1, 5);
      if (kN === kD) continue;
      num = i => n0 + i * kN; den = i => d0 + i * kD; regleN = 'on ajoute ' + kN; regleD = 'on ajoute ' + kD;
      piege = [num(3) + kD, den(3) + kN]; piegeTxt = ' échange les deux pas : on ajoute ' + kN + ' en haut et ' + kD + ' en bas, pas l\'inverse';
      autres = [[num(4), den(4) + kD], [num(4) + kN, den(4)]];
    } else {
      const n0 = R.int(1, 5), kN = R.int(1, 3), kD = R.int(2, 5), d0 = R.int(4 * kD + 2, 4 * kD + 12);
      num = i => n0 + i * kN; den = i => d0 - i * kD; regleN = 'on ajoute ' + kN; regleD = 'on retire ' + kD;
      piege = [num(4), den(3) + kD]; piegeTxt = ' fait monter les dénominateurs alors qu\'ils descendent de ' + kD + ' à chaque étape';
      autres = [[num(4) + kN, den(4)], [num(4), den(4) - kD]];
    }
    let ok = true;
    for (let i = 0; i < 5; i++) if (den(i) < 2 || num(i) < 1 || pgcd(num(i), den(i)) !== 1 || num(i) === den(i)) ok = false;
    if (!ok) continue;
    const ans = [num(4), den(4)];
    const vus = new Set([cle(ans)]), ch = [fr(ans)];
    /* pas de distracteur qui vaut un entier (6/2, 7/7) : il sauterait aux yeux */
    const aj = f => { if (ch.length < 4 && f[0] > 0 && f[1] > 1 && f[0] % f[1] !== 0 && !vus.has(cle(f))){ vus.add(cle(f)); ch.push(fr(f)); } };
    aj(piege);
    if (ch.length < 2) continue;                       // le piège nommé dans l'explication doit figurer parmi les choix
    autres.concat([[ans[0], ans[1] + 1], [ans[0] + 1, ans[1]], [ans[0], ans[1] - 1], [ans[0] - 1, ans[1]], [ans[0] + 2, ans[1] + 2]]).forEach(aj);
    if (ch.length < 4) continue;
    return {
      q: R.pick(['Quelle fraction continue logiquement cette suite ?', 'Quelle fraction vient ensuite dans cette suite ?']) + '\n' + [0, 1, 2, 3].map(i => num(i) + '/' + den(i)).join(' ; ') + ' ; ?',
      a: fr(ans),
      choix: ch,
      expl: 'Étudie séparément les numérateurs et les dénominateurs : chacun suit sa propre règle. Numérateurs : ' + listeN([0, 1, 2, 3].map(num)) + ', ' + regleN + ', donc ' + ans[0] + '. Dénominateurs : ' + listeN([0, 1, 2, 3].map(den)) + ', ' + regleD + ', donc ' + ans[1] + '. La fraction suivante est ' + fr(ans) + '. Piège : ' + fr(piege) + piegeTxt + '. Inutile de calculer la valeur des fractions : cela brouille les deux règles.'
    };
  }
  return n3Kc(R);
}
/* Alphabet circulaire, pas constant. */
function n4LettresCirc(R){
  for (let essai = 0; essai < 100; essai++){
    const avance = R.int(0, 2) > 0, p = avance ? R.int(4, 9) : R.int(3, 8), s = R.int(1, 26);
    const u = [0, 1, 2, 3, 4].map(i => s + (avance ? i * p : -i * p));
    if (avance ? u[4] <= 26 : (u[4] >= 1 || u[4] < -25)) continue;
    const v = avance ? u : u.map(x => x + 26);    // rangs déroulés, tous entre 1 et 52
    const ans = v[4], dir = avance ? p : -p;
    return {
      q: CIRC + ' ' + R.pick(QL) + '\n' + v.slice(0, 4).map(lettre).join(', ') + ', ?',
      a: lettre(ans),
      choix: qcm(lettre(ans), [lettre(ans + 1), lettre(ans - 1), lettre(ans + dir)], voisinsL(ans, true)),
      expl: 'Écris le rang de chaque lettre en ajoutant 26 à chaque nouveau tour d\'alphabet, pour que les rangs se suivent sans coupure. ' + v.slice(0, 4).map(rangCirc).join(', ') + ' : on ' + (avance ? 'avance' : 'recule') + ' de ' + p + ' à chaque fois. ' + v[3] + (avance ? ' + ' : ' − ') + p + ' = ' + ans + (ans > 26 ? ', et ' + ans + ' − 26 = ' + (ans - 26) : '') + ' : c\'est ' + lettre(ans) + '. Piège : au passage de Z à A, on compte facilement une case de trop ou de moins ; ' + lettre(ans + 1) + ' et ' + lettre(ans - 1) + ' viennent de cette erreur.'
    };
  }
  return n2Lettres(R);
}
/* Écarts qui forment une liste connue : nombres premiers ou Fibonacci. */
function n4EcartsNommes(R){
  const u0 = R.int(1, 20), premiers = R.int(0, 2) > 0;
  let d, suiv, nom;
  if (premiers){ const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29], i0 = R.int(0, 3); d = P.slice(i0, i0 + 5); suiv = P[i0 + 5]; nom = 'les nombres premiers à la suite'; }
  else { const F = [1, 1, 2, 3, 5, 8, 13, 21, 34], j0 = R.int(0, 2); d = F.slice(j0, j0 + 5); suiv = F[j0 + 5]; nom = 'les nombres de Fibonacci : chaque écart est la somme des deux écarts précédents'; }
  const t = [u0]; for (let i = 0; i < 5; i++) t.push(t[i] + d[i]);
  const ans = t[5] + suiv, deux = t[5] + d[4] + (d[4] - d[3]), cst = t[5] + d[4];
  /* nombres premiers : le piège prend le nombre impair suivant qui N'EST PAS premier (après 11 ou 13 : 15) */
  const estPremier = x => { if (x < 2) return false; for (let q = 2; q * q <= x; q++) if (x % q === 0) return false; return true; };
  let impair = d[4] + 2; while (estPremier(impair)) impair += 2;
  const leurre = premiers ? t[5] + impair : t[5] + 2 * d[4];
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(leurre), ent(deux), ent(cst)], voisinsN(ans)),
    expl: 'Écris les écarts entre termes voisins et demande-toi s\'ils forment une liste connue : carrés, nombres premiers, Fibonacci. Les écarts sont ' + listeN(d) + ' : ce sont ' + nom + '. L\'écart suivant vaut ' + suiv + ', donc ' + ent(t[5]) + ' + ' + suiv + ' = ' + ent(ans) + '. Piège : ' + (premiers ? ent(leurre) + ' prend l\'écart ' + impair + ', qui n\'est pas premier : après ' + d[4] + ', le nombre premier suivant est ' + suiv : ent(leurre) + ' double le dernier écart au lieu d\'additionner les deux derniers') + '.'
  };
}
/* Terme de rang N quand le terme dépend simplement de son rang n (n², n³, n(n+1)…). */
function n4RangFormule(R){
  const c = R.int(-1, 3);
  const formes = [
    {f: n => n * n + c, txt: 'n²' + (c ? ' ' + signe(c) : ''), calc: N => N + '² ' + (c ? signe(c) : '') },
    {f: n => n * (n + 1), txt: 'n × (n + 1)', calc: N => N + ' × ' + (N + 1)},
    {f: n => n * (n + 1) / 2, txt: 'n × (n + 1) ÷ 2', calc: N => N + ' × ' + (N + 1) + ' ÷ 2'},
    {f: n => 2 * n * n, txt: '2 × n²', calc: N => '2 × ' + N + '²'},
    {f: n => n * n * n, txt: 'n³', calc: N => N + '³', cube: true}
  ];
  const F = R.pick(formes), N = F.cube ? R.int(6, 12) : R.int(10, 30);
  const t = [1, 2, 3, 4, 5].map(F.f), ans = F.f(N), lin = t[4] + (N - 5) * (t[4] - t[3]);
  return {
    q: 'Voici le début d\'une suite logique :\n' + listeN(t) + ' ; …\nQuel est son ' + ordM(N) + ' terme ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(F.f(N - 1)), ent(F.f(N + 1)), ent(lin)], voisinsN(ans)),
    expl: 'Cherche une formule qui donne directement le terme à partir de son rang n, en comparant avec n², n³ ou n × (n + 1). Ici le terme de rang n vaut ' + F.txt + ' : ' + [1, 2, 3].map(n => 'rang ' + n + ' → ' + ent(F.f(n))).join(', ') + ', et ainsi de suite. Pour n = ' + N + ' : ' + F.calc(N).trim() + ' = ' + ent(ans) + '. Piège : ' + ent(F.f(N - 1)) + ' et ' + ent(F.f(N + 1)) + ' viennent d\'un décalage d\'un rang, et ' + ent(lin) + ' prolonge le dernier écart comme s\'il restait constant.'
  };
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif (3 à 4 min)
   ===================================================== */
/* Rang éloigné d'une suite dont les écarts forment une suite arithmétique. */
function n5Rang2(R){
  const a = R.int(1, 9), d = R.int(1, 5), e = R.pick([1, 2]), N = R.int(12, 30);
  const f = n => a + d * (n - 1) + e * (n - 1) * (n - 2) / 2;
  const t = [1, 2, 3, 4, 5].map(f), ans = f(N), lin = t[4] + (N - 5) * (t[4] - t[3]);
  const dl = d + (N - 2) * e, S = (N - 1) * (d + dl) / 2;
  return {
    q: 'Voici le début d\'une suite logique :\n' + listeN(t) + ' ; …\nQuel est son ' + ordM(N) + ' terme ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(f(N - 1)), ent(f(N + 1)), ent(lin)], voisinsN(ans)),
    expl: 'Un terme lointain vaut le premier terme plus la somme de tous les écarts qui y mènent ; quand ces écarts sont à pas constant, leur somme vaut nombre d\'écarts × (premier + dernier) ÷ 2. Les écarts sont ' + ecartsTxt(t) + ' : ils augmentent de ' + e + '. Du 1er au ' + N + 'e terme, il y a ' + (N - 1) + ' écarts ; le premier vaut ' + d + ', le dernier vaut ' + d + ' + ' + (N - 2) + ' × ' + e + ' = ' + dl + '. Leur somme vaut ' + (N - 1) + ' × (' + d + ' + ' + dl + ') ÷ 2 = ' + ent(S) + '. Le ' + N + 'e terme vaut donc ' + a + ' + ' + ent(S) + ' = ' + ent(ans) + '. Piège : ' + ent(lin) + ' prolonge le dernier écart comme s\'il restait constant, et ' + ent(f(N + 1)) + ' compte un écart de trop.'
  };
}
/* Multiplicateur qui augmente d'une unité à chaque étape, avec une petite correction. */
const MULT = [];
for (let a = 1; a <= 4; a++) for (let k0 = 1; k0 <= 2; k0++) for (let c = -2; c <= 2; c++){
  const t = [a]; for (let i = 0; i < 5; i++) t.push(t[i] * (k0 + i) + c);
  let ok = true; for (let i = 1; i < 6; i++) if (t[i] <= t[i - 1]) ok = false;
  if (ok && t[5] <= 3000) MULT.push({a, k0, c, t});
}
function n5MultVar(R){
  const P = R.pick(MULT), t = P.t.slice(0, 5), ans = P.t[5], k0 = P.k0, c = P.c;
  const cTxt = c ? ' ' + signe(c) : '';
  const etapes = t.slice(1).map((x, i) => ent(t[i]) + ' × ' + (k0 + i) + cTxt + ' = ' + ent(x)).join(' ; ');
  const fige = t[4] * (k0 + 3) + c, oubli = t[4] * (k0 + 4), saut = t[4] * (k0 + 5) + c;
  const d = ecarts(t), deux = t[4] + d[3] + (d[3] - d[2]);
  return {
    q: R.pick(QN) + '\n' + listeN(t) + ' ; ?',
    a: ent(ans),
    choix: qcm(ent(ans), [ent(fige), c ? ent(oubli) : ent(saut), ent(deux)], voisinsN(ans)),
    expl: 'Quand les termes explosent, compare chaque terme au précédent multiplié par 1, 2, 3… : le multiplicateur peut augmenter d\'une unité à chaque étape, avec une petite correction constante. Ici : ' + etapes + '. L\'étape suivante est × ' + (k0 + 4) + cTxt + ' : ' + ent(t[4]) + ' × ' + (k0 + 4) + cTxt + ' = ' + ent(ans) + '. Piège : ' + ent(fige) + ' garde le multiplicateur ' + (k0 + 3) + ' au lieu de passer à ' + (k0 + 4) + '.'
  };
}
/* Motif en miroir (ABCDCBABC…), lettre de rang éloigné. */
function n5Miroir(R){
  const m = R.int(3, 6), s = R.int(1, 27 - m), P = 2 * (m - 1);
  const motif = []; for (let i = 0; i < m; i++) motif.push(s + i); for (let i = m - 2; i >= 1; i--) motif.push(s + i);
  const vu = []; for (let i = 0; i < P + m; i++) vu.push(motif[i % P]);
  const N = R.int(40, 400), r = N % P, ans = motif[(N - 1) % P];
  const faux = motif.concat([s]), errPer = faux[(N - 1) % (P + 1)];       // motif compté avec une lettre de trop
  const qq = Math.floor(N / P);
  /* compléments : d'abord les autres lettres du motif (les plus proches de la réponse), une lettre voisine seulement
     si le motif n'en a que 3 ; une lettre absente de la suite s'éliminerait d'un coup d'œil */
  const proches = []; for (let x = s; x < s + m; x++) proches.push(x);
  proches.sort((x, y) => Math.abs(x - ans) - Math.abs(y - ans) || x - y); proches.push(s + m, s - 1);
  return {
    q: 'Voici une suite de lettres qui suit un motif régulier :\n' + listeL(vu) + ', …\nQuelle est la ' + ordF(N) + ' lettre de cette suite ?',
    a: lettre(ans),
    choix: qcm(lettre(ans), [lettre(motif[N % P]), lettre(motif[(N - 2 + P) % P]), lettre(errPer)], k => { const x = proches[k - 1]; return x != null && dansAlpha(x) ? lettre(x) : null; }),
    expl: 'Écris le motif qui se répète, compte exactement sa longueur, puis utilise le reste de la division du rang par cette longueur. Le motif ' + motif.map(lettre).join('') + ' (' + P + ' lettres) se répète : la lettre ' + lettre(s) + ' n\'y figure qu\'une fois. ' + N + ' = ' + P + ' × ' + qq + ' + ' + r + (r ? ', donc la ' + N + 'e lettre est la ' + ordF(r) + ' du motif : ' + lettre(ans) + '.' : ' : le reste est nul, donc la ' + N + 'e lettre est la dernière du motif : ' + lettre(ans) + '.') + ' Piège : le motif ne compte pas ' + (P + 1) + ' lettres ; en écrivant ' + faux.map(lettre).join('') + ', on compte deux fois la lettre ' + lettre(s) + ' à chaque tour.'
  };
}
/* Blocs : chaque nombre (ou lettre) écrit k fois, ou 2k − 1 fois ; terme de rang éloigné. */
function n5Blocs(R){
  const v = R.pick(['k', 'k', 'lettres', 'impairs']);
  const T = k => k * (k + 1) / 2;
  if (v === 'impairs'){
    const N = R.int(30, 400); let k = 1; while (k * k < N) k++;
    let kt = 1; while (T(kt) < N) kt++;
    const vu = []; for (let j = 1; j <= 4; j++) for (let i = 0; i < 2 * j - 1; i++) vu.push(j);
    return {
      q: 'Voici le début d\'une suite logique :\n' + listeN(vu) + ' ; …\nQuel est son ' + ordM(N) + ' terme ?',
      a: ent(k),
      choix: qcm(ent(k), [ent(k - 1), ent(k + 1), ent(kt)], voisinsN(k)),
      expl: 'Compte combien de termes sont écrits à la fin de chaque bloc de nombres identiques : c\'est une somme de nombres impairs consécutifs, qui donne toujours un carré. Le bloc des 1 a 1 terme, celui des 2 en a 3, celui des 3 en a 5 : après le bloc des k, on a écrit 1 + 3 + … + (2k − 1) = k² termes. Ici ' + (k - 1) + '² = ' + (k - 1) * (k - 1) + ' et ' + k + '² = ' + k * k + '. Comme ' + (k - 1) * (k - 1) + ' < ' + N + ' ≤ ' + k * k + ', le ' + N + 'e terme est dans le bloc des ' + k + '. Piège : ' + (k - 1) + ' ou ' + (k + 1) + ' vient d\'une erreur d\'un bloc à la frontière.'
    };
  }
  const lettres = v === 'lettres', N = R.int(30, 300); let k = 1; while (T(k) < N) k++;
  let ks = 1; while (ks * ks < N) ks++;
  const vu = []; for (let j = 1; j <= 4; j++) for (let i = 0; i < j; i++) vu.push(j);
  const f = lettres ? lettre : ent;
  return {
    q: 'Voici le début d\'une suite logique :\n' + (lettres ? listeL(vu) + ', …\nQuelle est sa ' + ordF(N) + ' lettre ?' : listeN(vu) + ' ; …\nQuel est son ' + ordM(N) + ' terme ?'),
    a: f(k),
    choix: qcm(f(k), [f(k - 1), f(k + 1), f(ks)], lettres ? voisinsL(k) : voisinsN(k)),
    expl: 'Compte combien de termes sont écrits à la fin de chaque bloc identique : c\'est une somme de nombres entiers consécutifs. Le 1er bloc a 1 terme, le 2e en a 2, le 3e en a 3 : après le bloc numéro k, on a écrit 1 + 2 + … + k = k × (k + 1) ÷ 2 termes. Ici, après le bloc ' + (k - 1) + ' : ' + T(k - 1) + ' termes ; après le bloc ' + k + ' : ' + T(k) + ' termes. Comme ' + T(k - 1) + ' < ' + N + ' ≤ ' + T(k) + ', ' + (lettres ? 'la ' + N + 'e lettre est dans le bloc ' + k + ', celui de la ' + ordF(k) + ' lettre de l\'alphabet : ' + lettre(k) : 'le ' + N + 'e terme est dans le bloc des ' + k + ' : c\'est ' + k) + '. Piège : ' + f(k - 1) + ' ou ' + f(k + 1) + ' vient d\'une erreur d\'un bloc à la frontière.'
  };
}
/* Deux suites mêlées de natures différentes : multiplication d'un côté, écarts croissants de l'autre.
   Garde-fou : une sous-suite visible ne doit pas suivre aussi u(n+2) = α × u(n+1) + β × u(n) (petits entiers) avec un
   autre terme suivant ; sinon 2 ; 3 ; 5 ; 8 se lirait « écarts 1, 2, 3 » (12) comme Fibonacci (13), et 5 ; 7 ; 10 ; 14
   comme « double du terme d'avant-hier » (20 au lieu de 19). */
function autreRecurrence(u, vrai){
  for (let al = -3; al <= 3; al++) for (let be = -3; be <= 3; be++){
    if (!al && !be) continue;
    let ok = true;
    for (let i = 2; i < u.length; i++) if (al * u[i - 1] + be * u[i - 2] !== u[i]) ok = false;
    if (ok && al * u[u.length - 1] + be * u[u.length - 2] !== vrai) return true;
  }
  return false;
}
function n5EntrelaceMixte(R){
  for (let essai = 0; essai < 100; essai++){
  const q = R.pick([2, 2, 3]), a = q === 2 ? R.int(1, 5) : R.int(1, 3);
  const b = R.int(1, 15), d = R.int(1, 5), e = R.int(1, 3), geoImpair = R.int(0, 1) === 0;
  const geo = j => a * Math.pow(q, j), sec = j => b + d * j + e * j * (j - 1) / 2;
  const terme = i => ((i % 2 === 0) === geoImpair) ? geo(Math.floor(i / 2)) : sec(Math.floor(i / 2));
  const t = []; for (let i = 0; i < 8; i++) t.push(terme(i));
  const dixieme = R.int(0, 1) === 1, rangC = dixieme ? 10 : 9, ans = terme(rangC - 1);
  const cGeo = ((rangC - 1) % 2 === 0) === geoImpair;
  const autre = terme(rangC % 2 === 0 ? rangC - 2 : rangC);                       // terme de l'autre suite, rang voisin
  if (autre === ans) continue;                                                     // le piège nommé ne doit pas être la réponse
  if (autreRecurrence([0, 1, 2, 3].map(sec), sec(4)) || autreRecurrence([0, 1, 2, 3].map(geo), geo(4))) continue;
  /* zigzag visible (au moins deux descentes) : sinon la suite entière se lit autrement (1 ; 1 ; 2 ; 3 ; 4 ; 6 ; 8 ; 10) */
  if (t.filter((x, i) => i > 0 && x < t[i - 1]).length < 2) continue;
  const sub = j => t.filter((x, i) => i % 2 === j);
  const ss = sec(3) + (sec(3) - sec(2)), gg = geo(3) + (geo(3) - geo(2));      // le dernier écart reporté tel quel
  const descGeo = 'on multiplie par ' + q, descSec = 'les écarts ' + listeN(ecarts([0, 1, 2, 3].map(sec))) + ' augmentent de ' + e;
  const piege2 = cGeo ? gg : ss, choix = qcm(ent(ans), [ent(autre), ent(piege2), ent(ans + 1)], voisinsN(ans));
  const dit2 = piege2 !== ans && piege2 !== autre && choix.indexOf(ent(piege2)) >= 0
    ? ' Et ' + ent(piege2) + (cGeo ? ' ajoute le dernier écart (' + ent(geo(3) - geo(2)) + ') au lieu de multiplier par ' + q : ' garde le dernier écart (' + (sec(3) - sec(2)) + ') sans le faire augmenter') + '.' : '';
  return {
    q: 'Voici le début d\'une suite logique :\n' + listeN(t) + ' ; …\n' + (dixieme ? 'Quel est son 10e terme ?' : 'Quel nombre vient ensuite ?'),
    a: ent(ans),
    choix: choix,
    expl: 'Sépare les termes de rang impair et ceux de rang pair, puis cherche la règle de chacune des deux suites : elles peuvent être de natures différentes. Rangs impairs : ' + listeN(sub(0)) + ', ' + (geoImpair ? descGeo : descSec) + '. Rangs pairs : ' + listeN(sub(1)) + ', ' + (geoImpair ? descSec : descGeo) + '. Le ' + rangC + 'e terme est de rang ' + (rangC % 2 ? 'impair' : 'pair') + ' : ' + (cGeo ? ent(geo(3)) + ' × ' + q : ent(sec(3)) + ' + ' + (sec(4) - sec(3))) + ' = ' + ent(ans) + '. Piège : ' + ent(autre) + ' appartient à l\'autre suite.' + dit2
  };
  }
  return n4Cubique(R);
}
/* Alphabet circulaire, écarts qui augmentent. */
function n5LettresCirc2(R){
  for (let essai = 0; essai < 100; essai++){
    const e = R.pick([1, 1, 2]), d0 = e === 1 ? R.int(1, 4) : R.int(1, 2), s = R.int(1, 26);
    const u = [s]; let d = d0;
    for (let i = 0; i < 6; i++){ u.push(u[i] + d); d += e; }
    if (u[6] <= 26 || u[6] > 52) continue;
    const ans = u[6], dl = u[6] - u[5], cst = u[5] + (u[5] - u[4]);
    return {
      q: CIRC + ' ' + R.pick(QL) + '\n' + u.slice(0, 6).map(lettre).join(', ') + ', ?',
      a: lettre(ans),
      choix: qcm(lettre(ans), [lettre(cst), lettre(ans + 1), lettre(ans - 1)], voisinsL(ans, true)),
      expl: 'Écris le rang de chaque lettre en ajoutant 26 à chaque nouveau tour d\'alphabet, puis étudie les écarts et leur évolution. ' + u.slice(0, 6).map(rangCirc).join(', ') + ' : les écarts ' + listeN(ecarts(u.slice(0, 6))) + ' augmentent de ' + e + '. L\'écart suivant vaut ' + dl + ' : ' + u[5] + ' + ' + dl + ' = ' + ans + ', et ' + ans + ' − 26 = ' + (ans - 26) + ' : c\'est ' + lettre(ans) + '. Piège : ' + lettre(cst) + ' garde le dernier écart sans le faire augmenter.'
    };
  }
  return n4LettresCirc(R);
}

const TYPES = {
  1: [n1Arith, n1Geom, n1Lettres, n1Manquant, n1Carres],
  2: [n2Second, n2Lettres, n2Entrelace, n2Alterne, n2Fibo, n2Rang],
  3: [n3EcartsGeo, n3Kc, n3Manquant, n3LettresEntrelacees, n3Puissances, n3Groupes],
  4: [n4Intrus, n4Cubique, n4Fractions, n4LettresCirc, n4EcartsNommes, n4RangFormule],
  5: [n5Rang2, n5MultVar, n5Miroir, n5Blocs, n5EntrelaceMixte, n5LettresCirc2]
};
/* Carte de secours (ne devrait jamais servir) : un QCM valide, jamais d'exception. */
const SECOURS = {q: 'Quel nombre continue logiquement cette suite ?\n4 ; 9 ; 14 ; 19 ; 24 ; ?', a: '29', accept: null, choix: ['29', '34', '28', '30'],
  expl: 'Calcule l\'écart entre deux termes voisins : s\'il ne change pas, il suffit de le reporter une fois de plus. On ajoute 5 à chaque étape : 24 + 5 = 29.'};
const valide = ex => ex && typeof ex.q === 'string' && typeof ex.a === 'string' && typeof ex.expl === 'string' && Array.isArray(ex.choix) && ex.choix.length === 4
  && new Set(ex.choix.map(norm)).size === 4 && ex.choix.some(c => norm(c) === norm(ex.a)) && !/NaN|undefined|Infinity|null/.test(ex.q + ex.a + ex.choix.join(' ') + ex.expl);

A.push({
  id: 'alb-25-suites-logiques',
  phase: 'albert',
  ordre: 25,
  theme: 'suites',
  titre: 'Suites logiques de nombres et de lettres',
  objectif: 'Trouver la règle cachée d\'une suite de nombres ou de lettres (écarts, multiplications, suites mêlées) et s\'en servir pour donner le terme suivant, un terme manquant, un terme lointain ou l\'intrus.',
  lecon:
`<p class="lede">Une suite logique est une liste de nombres ou de lettres fabriquée avec une <mark>règle cachée</mark>. On te montre quelques termes : à toi de trouver la règle, de la vérifier sur tous les termes, puis de t'en servir. Aucune formule à réciter : il faut observer avec méthode.</p>
<h2>Ce que le test te demande</h2>
<p>La fiche Parcoursup du test d'Albert School cite la logique et les suites. Aucun exemple officiel ne montre de suite de lettres, mais c'est un grand classique des tests de raisonnement, et il se prépare vite. Attends-toi à quatre formats : trouver le <strong>terme suivant</strong> (4 ; 9 ; 14 ; 19 ; ?), retrouver un <strong>terme manquant</strong> au milieu de la suite, calculer un <strong>terme lointain</strong> (le 50e terme, la 200e lettre) et repérer l'<strong>intrus</strong>, le seul terme qui casse la règle. Les nombres restent petits : tout se fait au brouillon, sans calculatrice. Les questions faciles se règlent en une minute ; les plus dures cachent deux règles à la fois.</p>
<h2>Les prérequis</h2>
<p>Le rang des lettres dans l'alphabet. Retiens les repères E = 5, J = 10, O = 15, T = 20, Z = 26 : tu retrouves n'importe quelle lettre en comptant une ou deux cases.</p>
<table class="tbl">
<tr><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th><th>K</th><th>L</th><th>M</th></tr>
<tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td></tr>
<tr><th>N</th><th>O</th><th>P</th><th>Q</th><th>R</th><th>S</th><th>T</th><th>U</th><th>V</th><th>W</th><th>X</th><th>Y</th><th>Z</th></tr>
<tr><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td></tr>
</table>
<p>Les listes à reconnaître d'un coup d'œil :</p>
<table class="tbl">
<tr><th>Carrés</th><td>1 ; 4 ; 9 ; 16 ; 25 ; 36 ; 49 ; 64 ; 81 ; 100 ; 121 ; 144</td></tr>
<tr><th>Cubes</th><td>1 ; 8 ; 27 ; 64 ; 125 ; 216 ; 343 ; 512</td></tr>
<tr><th>Puissances de 2</th><td>1 ; 2 ; 4 ; 8 ; 16 ; 32 ; 64 ; 128 ; 256 ; 512 ; 1 024</td></tr>
<tr><th>Nombres premiers</th><td>2 ; 3 ; 5 ; 7 ; 11 ; 13 ; 17 ; 19 ; 23 ; 29 ; 31</td></tr>
<tr><th>Fibonacci</th><td>1 ; 1 ; 2 ; 3 ; 5 ; 8 ; 13 ; 21 ; 34 ; 55 (chaque terme est la somme des deux précédents)</td></tr>
<tr><th>Triangulaires</th><td>1 ; 3 ; 6 ; 10 ; 15 ; 21 ; 28 ; 36 (on ajoute 2, puis 3, puis 4…)</td></tr>
</table>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je traduis.</strong> Des lettres ? Je les remplace par leurs rangs. Si l'alphabet est circulaire, j'ajoute 26 après chaque passage de Z à A. Des fractions ? Je sépare numérateurs et dénominateurs. Des groupes de lettres ? Je traite chaque position à part.</p>
<p><strong>2. J'écris les écarts</strong> entre termes voisins, en petit sous la suite. S'ils sont tous égaux, c'est fini : je reporte l'écart.</p>
<p><strong>3. Si les écarts changent, j'écris les écarts des écarts.</strong> Une ligne constante donne la règle. Sinon, je regarde si les écarts doublent ou s'ils forment une liste connue (carrés, nombres premiers, Fibonacci).</p>
<p><strong>4. Si les termes grandissent très vite, je teste les multiplications :</strong> × 2, × 3, puis « double plus 1 », « triple moins 2 », ou un multiplicateur qui augmente (× 2, × 3, × 4…).</p>
<p><strong>5. Si la suite fait des zigzags, je sépare</strong> les termes de rang impair (1er, 3e, 5e…) et ceux de rang pair : ce sont souvent deux suites mêlées.</p>
<p><strong>6. Je vérifie ma règle sur tous les termes</strong> avant de répondre, pas seulement sur les deux premiers.</p>
</div>
<h2>Exemples résolus</h2>
<h3>Exemple 1 : D, H, L, P, ?</h3>
<p>D = 4, H = 8, L = 12, P = 16 : on avance de 4. 16 + 4 = 20, et la 20e lettre est T.</p>
<h3>Exemple 2 : 3 ; 6 ; 11 ; 18 ; 27 ; ?</h3>
<p>Écarts : 3 ; 5 ; 7 ; 9. Ils augmentent de 2, donc l'écart suivant vaut 11 et la réponse est 27 + 11 = 38. Tu pouvais aussi reconnaître les carrés plus 2 : 6² + 2 = 38. Deux chemins, même réponse : c'est bon signe.</p>
<h3>Exemple 3 : 3 ; 5 ; 9 ; 17 ; 33 ; ?</h3>
<p>Écarts : 2 ; 4 ; 8 ; 16. Les écarts des écarts (2 ; 4 ; 8) ne sont pas constants, mais chaque écart double. L'écart suivant vaut 32, donc 33 + 32 = 65. Autre lecture, même réponse : chaque terme est le double du précédent moins 1, et 2 × 33 − 1 = 65. Le choix 49 est le piège de celui qui garde le dernier écart, 16, au lieu de le doubler.</p>
<h3>Exemple 4 : 3 ; 40 ; 7 ; 37 ; 11 ; 34 ; 15 ; 31 ; ?</h3>
<p>La suite monte puis descend : je sépare. Rangs impairs : 3 ; 7 ; 11 ; 15, on ajoute 4. Rangs pairs : 40 ; 37 ; 34 ; 31, on retire 3. Le terme cherché est le 9e, de rang impair : 15 + 4 = 19. Le choix 28 continue la mauvaise suite.</p>
<h2>Les réflexes sans calculatrice</h2>
<ul>
<li><strong>Écris tout.</strong> La ligne des écarts sous la suite fait gagner du temps et évite les erreurs de tête.</li>
<li><strong>Terme lointain.</strong> Avec un écart constant, compte les sauts : du 1er au 40e terme, il y en a 39, pas 40. Pour 5 ; 8 ; 11 ; 14…, le 40e terme vaut 5 + 39 × 3 = 122, et 125 est le piège. Avec un motif qui se répète, divise le rang par la longueur du motif et regarde le reste ; un reste nul désigne la dernière lettre du motif.</li>
<li><strong>Intrus.</strong> Un terme faux fausse deux écarts voisins, celui d'avant et celui d'après : l'intrus est le terme commun à ces deux écarts.</li>
<li><strong>Profite du QCM.</strong> Si tu hésites entre deux règles, teste chaque choix proposé : un seul prolonge la suite en respectant tous les termes.</li>
</ul>
<div class="formule"><p>terme de rang N = 1er terme + (N − 1) × écart</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Traduis les lettres en rangs, écris les écarts puis les écarts des écarts, et si rien n'apparaît, teste une multiplication ou sépare les rangs pairs et impairs.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Une règle qui marche sur deux termes ne prouve rien : vérifie-la sur toute la suite. Attention aussi à l'erreur d'une case dans l'alphabet, au passage de Z à A, au « − 1 » de la formule du terme de rang N, et à la sous-suite que tu prolonges quand deux suites sont mêlées.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Écarts constants : on ajoute. Écarts qui changent : on regarde les écarts des écarts ou une liste connue. Termes qui explosent : on multiplie. Zigzag : deux suites mêlées. Lettres : on passe par les rangs. Et on vérifie toujours la règle sur tous les termes.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(TYPES[n])(R);
      if (valide(ex)) return {q: ex.q, a: ex.a, accept: null, choix: ex.choix.slice(), expl: ex.expl};
    } catch (e) { /* jamais d'exception : carte de secours */ }
    return {q: SECOURS.q, a: SECOURS.a, accept: null, choix: SECOURS.choix.slice(), expl: SECOURS.expl};
  }
});

})();
