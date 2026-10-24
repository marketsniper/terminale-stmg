/* ===== Maths · Objectif Albert School : alb-14 · Calendriers, jours de la semaine, horloges =====
   Compétence de la piste Albert (catalogue séparé window.ALBERT_SKILLS), sur le modèle de skills-albert.js.
   gen(level, R) rend un QCM : 4 choix distincts au sens de normStr, dont a ; accept: null.
   Niveaux 1 à 3 : séries de la leçon. Niveaux 4 et 5 : paliers hauts du test blanc adaptatif.
   Toutes les dates citées avec une année sont réelles (jour de la semaine calculé, vérifié par le banc).
   Script classique dans une IIFE : aucun symbole de premier niveau. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides recopiées de la compétence de référence (privées à ce fichier) ---------- */
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
/* Tire jusqu'à ce que la condition soit remplie (borné : jamais de boucle infinie). */
function tirer(f, ok){ let v = f(); for (let i = 0; i < 500 && !ok(v); i++) v = f(); return v; }

/* ---------- calendrier ---------- */
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const LONG = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const m7 = x => ((x % 7) + 7) % 7;
const J = i => JOURS[m7(i)];
const Js = i => J(i) + 's';
const bis = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const nbj = (m, y) => (m === 1 && bis(y)) ? 29 : LONG[m];
/* Rang du jour dans l'année (0 pour le 1er janvier). */
function quantieme(y, m, d){ let n = d - 1; for (let k = 0; k < m; k++) n += nbj(k, y); return n; }
function depuis2000(y, m, d){ let n = 0; for (let a = 2000; a < y; a++) n += bis(a) ? 366 : 365; return n + quantieme(y, m, d); }
/* Jour de la semaine (0 = lundi) : le 1er janvier 2000 était un samedi. */
const jsem = (y, m, d) => m7(5 + depuis2000(y, m, d));
const dt = (d, m) => (d === 1 ? '1er' : String(d)) + ' ' + MOIS[((m % 12) + 12) % 12];
const ord = d => d === 1 ? '1er' : String(d);
const pl = (n, mot) => n + ' ' + mot + (n > 1 ? 's' : '');
const div7 = N => { const r = N % 7, k = (N - r) / 7; return nb(N, 0) + ' = 7 × ' + nb(k, 0) + (r ? ' + ' + r : ''); };
const avTxt = (s, X) => s ? 'on avance de ' + pl(s, 'jour') + " : c'est un " + J(X + s) : "on retombe sur le même jour de la semaine : c'est un " + J(X);
const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
const liste = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1];

/* ---------- heures et angles ---------- */
const z2 = x => (x < 10 ? '0' : '') + x;
const hm = t => { t = ((t % 1440) + 1440) % 1440; return Math.floor(t / 60) + ' h ' + z2(t % 60); };
const duree = t => { const h = Math.floor(t / 60), m = t % 60; return h ? h + ' h' + (m ? ' ' + z2(m) + ' min' : '') : m + ' min'; };
const deg = x => nb(x, 1) + '°';
const petit = a => { a = ((a % 360) + 360) % 360; return Math.min(a, 360 - a); };
const pgcd = (a, b) => b ? pgcd(b, a % b) : Math.abs(a);
const fr = (p, q) => { const g = pgcd(p, q) || 1; return q / g === 1 ? String(p / g) : (p / g) + '/' + (q / g); };
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = n => String(n).split('').map(c => SUP[+c]).join('');

/* ---------- fabrication des QCM ---------- */
const Q = (q, a, autres, voisin, expl) => ({ q, a, accept: null, choix: qcm(a, autres, voisin), expl });
const QJ = (q, bon, autres, expl) => Q(q, J(bon), autres.map(J), k => J(bon + (k % 2 ? (k + 1) / 2 : -k / 2)), expl);

/* =====================================================
   NIVEAU 1 · découverte
   ===================================================== */
function joursPlusMoins(R, recule){
  const X = R.int(0, 6), N = tirer(() => R.int(9, 100), v => v % 7 !== 0);
  const r = N % 7, k = (N - r) / 7, sj = r > 1 ? 's' : '';
  if (!recule){
    const q = R.pick([
      "Aujourd'hui, nous sommes un " + J(X) + '. Quel jour de la semaine serons-nous dans ' + N + ' jours ?',
      'Un colis est expédié un ' + J(X) + ' et livré exactement ' + N + ' jours plus tard. Quel jour de la semaine est-il livré ?',
      'Nora commence un défi sportif un ' + J(X) + '. Le défi se termine ' + N + ' jours plus tard. Quel jour de la semaine se termine-t-il ?'
    ]);
    return QJ(q, X + r, [X + r + 1, X + r - 1, X - r],
      'Le même jour de la semaine revient tous les 7 jours : seul compte le reste de la division de ' + N + ' par 7. ' + div7(N) + ' : après ' + k + ' semaines complètes, on est encore un ' + J(X) + ', puis on avance de ' + r + ' jour' + sj + ' : on tombe un ' + J(X + r) + '. Piège : le jour de départ ne compte pas ; le compter fait tomber un jour trop loin (' + J(X + r + 1) + ').');
  }
  const q = R.pick([
    "Aujourd'hui, nous sommes un " + J(X) + '. Quel jour de la semaine était-on il y a ' + N + ' jours ?',
    'Un film sort au cinéma un ' + J(X) + '. Sa bande-annonce avait été publiée ' + N + ' jours plus tôt. Quel jour de la semaine avait-elle été publiée ?',
    'Lina rend son exposé un ' + J(X) + ', ' + N + " jours après l'avoir commencé. Quel jour de la semaine l'avait-elle commencé ?"
  ]);
  return QJ(q, X - r, [X + r, X - r - 1, X - r + 1],
    'Pour remonter dans le temps, on recule seulement du reste de la division de ' + N + ' par 7, car le même jour revient tous les 7 jours. ' + div7(N) + ' : ' + k + " semaines plus tôt, c'était aussi un " + J(X) + ' ; on recule encore de ' + r + ' jour' + sj + ' et on tombe un ' + J(X - r) + '. Piège : ici on recule ; avancer de ' + r + ' jour' + sj + ' donnerait ' + J(X + r) + '.');
}

function memeMois(R){
  const m = R.int(0, 11), L = m === 1 ? 28 : LONG[m], X = R.int(0, 6);
  const dd = tirer(() => [R.int(1, L), R.int(1, L)], v => Math.abs(v[1] - v[0]) >= 8 && (v[1] - v[0]) % 7 !== 0);
  const d1 = dd[0], d2 = dd[1], e = d2 - d1, ae = Math.abs(e), r = ae % 7, apres = e > 0, bon = X + e;
  return QJ('Cette année, le ' + dt(d1, m) + ' tombe un ' + J(X) + '. Quel jour de la semaine ' + (apres ? 'sera' : 'était') + ' le ' + dt(d2, m) + ' ?',
    bon, [bon + 1, bon - 1, X - e],
    "Dans un même mois, on calcule l'écart entre les deux dates, puis on garde le reste de sa division par 7. Du " + ord(Math.min(d1, d2)) + ' au ' + Math.max(d1, d2) + ' ' + MOIS[m] + ', il y a ' + ae + ' jours ; ' + div7(ae) + ', donc on ' + (apres ? 'avance' : 'recule') + ' de ' + pl(r, 'jour') + ' à partir du ' + J(X) + " : c'est un " + J(bon) + '. Piège : ' + (apres ? 'reculer' : 'avancer') + ' au lieu ' + (apres ? "d'avancer" : 'de reculer') + ' donnerait ' + J(X - e) + '.');
}

function anglesSimples(R){
  const v = R.int(1, 3);
  if (v === 1){
    const h = R.int(1, 11), aff = R.int(0, 1) ? h : h + 12, s = Math.min(30 * h, 360 - 30 * h);
    const q = R.int(0, 1) ? 'Une horloge à aiguilles indique exactement ' + aff + ' h. Quel est le plus petit angle formé par ses deux aiguilles ?'
      : 'Il est exactement ' + aff + " h. Quel est le plus petit angle formé par les deux aiguilles d'une horloge ?";
    return Q(q, deg(s), [deg(360 - s), deg(s + 30), s > 30 ? deg(s - 30) : null], k => deg(s + 30 * (k + 1)),
      "On compte les intervalles d'une heure qui séparent les deux aiguilles, puis on multiplie par l'angle d'un intervalle. Le cadran est partagé en 12 : entre deux nombres voisins, il y a 360 ÷ 12 = 30°." + (aff > 12 ? ' Sur le cadran, ' + aff + ' h se lit ' + h + ' h.' : '') + ' À ' + h + ' h pile, la grande aiguille est sur le 12 et la petite sur le ' + h + ' : ' + (30 * h <= 180 ? h + ' × 30 = ' + s + '°.' : h + ' × 30 = ' + (30 * h) + '°, qui dépasse 180°, donc le plus petit angle vaut 360 − ' + (30 * h) + ' = ' + s + '°.') + ' Piège : on compte les intervalles entre les nombres, pas les nombres eux-mêmes, sinon on trouve 30° de trop.');
  }
  if (v === 2){
    const M = tirer(() => R.int(4, 59), x => x !== 30), s = 6 * M;
    const q = R.pick(["De quel angle tourne la grande aiguille d'une horloge (celle des minutes) en " + M + ' minutes ?', "Combien de degrés parcourt l'aiguille des minutes d'une horloge en " + M + ' minutes ?']);
    return Q(q, deg(s), [deg(M / 2), deg(5 * M)], k => deg(s + 6 * k),
      "En 60 minutes, l'aiguille des minutes fait un tour complet de 360°, donc elle tourne de 360 ÷ 60 = 6° par minute. En " + M + ' minutes : ' + M + ' × 6 = ' + s + "°. Piège : 0,5° par minute, c'est la vitesse de la petite aiguille, celle des heures.");
  }
  const d = R.int(2, 9), H1 = R.int(6, 23 - d), H2 = H1 + d, s = 30 * d;
  return Q("De quel angle tourne la petite aiguille d'une horloge (celle des heures) entre " + H1 + ' h et ' + H2 + ' h ?', deg(s), [deg(6 * d), deg(30 * (d + 1)), deg(30 * (d - 1))], k => deg(s + 15 * k),
    'La petite aiguille fait un tour de 360° en 12 heures, donc elle tourne de 360 ÷ 12 = 30° par heure. De ' + H1 + ' h à ' + H2 + " h, il s'écoule " + d + ' heures : ' + d + ' × 30 = ' + s + "°. Piège : 6°, c'est ce que parcourt la grande aiguille en une minute, pas la petite en une heure.");
}

function heuresDecimales(R){
  const c = R.pick([5, 10, 15, 20, 25, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]), h = R.int(1, 3), mn = c * 3 / 5, tot = 60 * h + mn;
  const dec = nb(h + c / 100);
  if (R.int(0, 1)){
    return Q('Un trajet dure ' + dec + ' h. Combien de temps est-ce en heures et minutes ?', duree(tot), [duree(60 * h + c), duree(100 * h + c)], k => duree(tot + (k % 2 ? 3 : -3) * Math.ceil(k / 2)),
      'Une heure compte 60 minutes et non 100 : on multiplie la partie décimale par 60. ' + nb(c / 100) + ' × 60 = ' + mn + ' min, donc ' + dec + ' h = ' + duree(tot) + '. Piège : ' + nb(c / 100) + ' h ne fait pas ' + c + ' min.');
  }
  const faux = nb(h + mn / 100) + ' h';
  return Q('Un trajet dure ' + duree(tot) + ". Combien d'heures cela fait-il, en écriture décimale ?", dec + ' h', [faux], k => nb(h + c / 100 + (k % 2 ? 0.05 : -0.05) * Math.ceil(k / 2)) + ' h',
    'Pour passer des minutes aux heures, on divise les minutes par 60. ' + mn + ' ÷ 60 = ' + nb(c / 100) + ', donc ' + duree(tot) + ' = ' + dec + ' h. Piège : écrire ' + faux + " revient à croire qu'une heure compte 100 minutes.");
}

function dureeJournee(R){
  const se = tirer(() => { const s = 60 * R.int(7, 18) + 5 * R.int(1, 11); return [s, s + 5 * R.int(13, 80)]; }, v => v[1] % 60 > 0 && v[1] % 60 < v[0] % 60 && v[1] < 1380);
  const s = se[0], e = se[1], hs = Math.floor(s / 60), ms = s % 60, he = Math.floor(e / 60), me = e % 60, ans = e - s, inv = 60 * (he - hs) + (ms - me);
  const q = R.pick([
    'Un examen commence à ' + hm(s) + ' et se termine à ' + hm(e) + '. Combien de temps dure-t-il ?',
    'Une randonnée part à ' + hm(s) + ' et revient à ' + hm(e) + ' le même jour. Combien de temps a-t-elle duré ?',
    'Un tournoi de jeux vidéo commence à ' + hm(s) + ' et se termine à ' + hm(e) + '. Combien de temps dure-t-il ?'
  ]);
  return Q(q, duree(ans), [duree(inv), duree(ans + 60)], k => duree(ans + (k % 2 ? 5 : -5) * Math.ceil(k / 2)),
    "On compte d'abord jusqu'à l'heure pile suivante, puis on ajoute le reste. De " + hm(s) + ' à ' + (hs + 1) + ' h : ' + (60 - ms) + ' min ; de ' + (hs + 1) + ' h à ' + hm(e) + ' : ' + duree(e - 60 * (hs + 1)) + '. Total : ' + duree(ans) + '. Piège : soustraire heures et minutes séparément, sans retenue, donne ' + duree(inv) + '.');
}

function niveau1(R){
  const t = R.int(1, 6);
  if (t === 1) return joursPlusMoins(R, false);
  if (t === 2) return joursPlusMoins(R, true);
  if (t === 3) return memeMois(R);
  if (t === 4) return anglesSimples(R);
  if (t === 5) return heuresDecimales(R);
  return dureeJournee(R);
}

/* =====================================================
   NIVEAU 2 · maîtrise
   ===================================================== */
function angleHM(R, libre){
  const H = libre ? R.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]) : R.int(1, 11);
  const M = libre ? tirer(() => R.int(1, 59), x => x % 10 !== 0) : 10 * R.int(1, 5);
  const h = H % 12, G = 6 * M, P = 30 * h + M / 2, D = Math.abs(P - G), s = Math.min(D, 360 - D);
  const f1 = petit(30 * h - 6 * M), f3 = petit(30 * (h + 1) - 6 * M);
  const q = R.pick(['Une horloge à aiguilles indique ' + H + ' h ' + z2(M) + '. Quel est le plus petit angle formé par ses deux aiguilles ?',
    'Il est ' + H + ' h ' + z2(M) + ". Quel est le plus petit angle formé par les deux aiguilles d'une montre ?"]);
  return Q(q, deg(s), [deg(f1), deg(360 - s), M >= 30 && f3 > 0 ? deg(f3) : null], k => deg(s + 5 * k),
    "On repère chaque aiguille par son angle depuis le 12, sans oublier que la petite aiguille avance aussi pendant les minutes, puis on prend l'écart. La grande tourne de 6° par minute ; la petite de 30° par heure plus 0,5° par minute." + (H > 12 ? ' Sur le cadran, ' + H + ' h se lit ' + h + ' h.' : '') + ' Grande aiguille : ' + M + ' × 6 = ' + G + '°. Petite aiguille : ' + h + ' × 30 + ' + M + ' × 0,5 = ' + deg(P) + '. Écart : ' + deg(D) + (D > 180 ? ', qui dépasse 180°, donc le plus petit angle vaut 360 − ' + nb(D, 1) + ' = ' + deg(s) + '.' : ', donc le plus petit angle vaut ' + deg(s) + '.') + (f1 !== s ? ' Piège : la petite aiguille avance pendant les ' + M + " minutes ; l'oublier donne " + deg(f1) + '.' : ''));
}

function moisSuivant(R){
  const deux = R.int(0, 2) === 0;
  const m = deux ? R.int(2, 11) : R.pick([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const d = R.int(1, 28), X = R.int(0, 6), L1 = LONG[m], L2 = LONG[(m + 1) % 12];
  const tot = deux ? L1 + L2 : L1, s = tot % 7, cible = (m + (deux ? 2 : 1)) % 12, suiv = m + (deux ? 2 : 1) > 11 ? ' suivant' : '';
  const q = 'Le ' + dt(d, m) + ' tombe un ' + J(X) + '. Quel jour de la semaine sera le ' + dt(d, cible) + suiv + ' ?';
  if (!deux){
    return QJ(q, X + s, [X, X + (L1 === 31 ? 2 : 3), X + s + 1],
      "Pour aller à la même date le mois suivant, on avance du nombre de jours du mois de départ ; seul compte son reste dans la division par 7. " + cap(MOIS[m]) + ' compte ' + L1 + ' jours = 4 semaines + ' + s + ' jours : on avance de ' + s + ' jours, du ' + J(X) + ' au ' + J(X + s) + '. Piège : un mois ne fait pas exactement 4 semaines ; seul un février de 28 jours les fait.');
  }
  return QJ(q, X + s, [X + s - 1, X + s + 1, X + L1 % 7],
    'Pour aller à la même date deux mois plus tard, on additionne les jours des deux mois traversés, puis on garde le reste de la division par 7. ' + cap(MOIS[m]) + ' (' + L1 + ' jours) et ' + MOIS[(m + 1) % 12] + ' (' + L2 + ' jours) font ' + tot + ' jours ; ' + div7(tot) + ' : on avance de ' + s + ' jours, du ' + J(X) + ' au ' + J(X + s) + ". Piège : ne compter qu'un seul mois donne " + J(X + L1 % 7) + '.');
}

function anneeSuivante(R, piege){
  let y, m, d, cas = 0;
  if (!piege){
    const v = tirer(() => { const y = R.int(2025, 2039), m = R.int(0, 11); return [y, m, R.int(1, LONG[m])]; }, v => depuis2000(v[0] + 1, v[1], v[2]) - depuis2000(v[0], v[1], v[2]) === 365);
    y = v[0]; m = v[1]; d = v[2];
  } else {
    cas = R.int(1, 4);
    y = (cas === 2 || cas === 3) ? R.pick([2028, 2032, 2036, 2040]) : R.pick([2027, 2031, 2035, 2039]);
    m = (cas === 1 || cas === 3) ? R.int(2, 11) : R.int(0, 1);
    d = R.int(1, LONG[m]);
  }
  const X = jsem(y, m, d), s = depuis2000(y + 1, m, d) - depuis2000(y, m, d) - 364, fz = m >= 2 ? y + 1 : y;
  const q = 'Le ' + dt(d, m) + ' ' + y + ' tombe un ' + J(X) + '. Quel jour de la semaine sera le ' + dt(d, m) + ' ' + (y + 1) + ' ?';
  let expl = "Entre une date et la même date l'année suivante, il y a 365 jours (52 semaines et 1 jour), ou 366 jours si un 29 février se trouve entre les deux (52 semaines et 2 jours). Le mois de février situé entre les deux dates est celui de " + fz + (bis(fz) ? ', qui est bissextile : le 29 février ' + fz + ' est traversé, donc 366 jours.' : ", qui n'est pas bissextile : 365 jours.") + ' On avance donc de ' + pl(s, 'jour') + ' : ' + J(X + s) + '.';
  if (cas === 3) expl += ' Piège : ' + y + ' est bissextile, mais son 29 février est déjà passé le ' + dt(d, m) + ' ' + y + '.';
  else if (cas === 4) expl += ' Piège : ' + (y + 1) + " est bissextile, mais son 29 février n'arrive qu'après le " + dt(d, m) + ' ' + (y + 1) + '.';
  else if (!piege) expl += " Piège : une année ne fait pas exactement 52 semaines, le jour change donc d'une année à l'autre.";
  else expl += " Piège : avancer d'un seul jour, c'est oublier le 29 février.";
  return QJ(q, X + s, [X + 3 - s, X, X - 1], expl);
}

function nuit(R){
  const se = tirer(() => [60 * R.int(20, 23) + R.int(1, 59), 60 * R.int(4, 8) + R.int(0, 58)], v => v[1] % 60 < v[0] % 60);
  const s = se[0], e = se[1], hs = Math.floor(s / 60), ms = s % 60, he = Math.floor(e / 60), me = e % 60, ans = 1440 - s + e;
  const q = R.pick([
    'Un train de nuit part à ' + hm(s) + ' et arrive le lendemain à ' + hm(e) + '. Combien de temps dure le trajet ?',
    "Maël s'endort à " + hm(s) + ' et se réveille le lendemain à ' + hm(e) + '. Combien de temps a-t-il dormi ?',
    'Un bus part à ' + hm(s) + ' et arrive à destination le lendemain à ' + hm(e) + '. Combien de temps dure le voyage ?'
  ]);
  return Q(q, duree(ans), [duree(s - e), duree(ans + 60), duree(60 * (24 - hs + he) + (ms - me))], k => duree(ans + 5 * k),
    "On coupe la durée en deux morceaux : jusqu'à minuit, puis de minuit à l'arrivée. De " + hm(s) + ' à minuit : ' + duree(1440 - s) + ' ; de minuit à ' + hm(e) + ' : ' + duree(e) + '. Total : ' + duree(ans) + '. Piège : la soustraction ' + hm(s) + ' − ' + hm(e) + ' donne ' + duree(s - e) + ", c'est-à-dire le temps passé dans la journée, pas pendant la nuit.");
}

function joursNuits(R){
  const m = R.pick([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), L = LONG[m], d1 = R.int(12, L), d2 = R.int(2, 20), m2 = (m + 1) % 12, suiv = m === 11 ? ' suivant' : '';
  if (R.int(0, 1)){
    const ans = L - d1 + 1 + d2;
    const q = R.pick(['Un stage commence le ' + dt(d1, m) + ' et se termine le ' + dt(d2, m2) + suiv + ', ces deux jours compris. Combien de jours dure-t-il ?',
      'Une exposition est ouverte du ' + dt(d1, m) + ' au ' + dt(d2, m2) + suiv + ', premier et dernier jours compris. Pendant combien de jours est-elle ouverte ?']);
    return Q(q, String(ans), [String(ans - 1), String(ans + 1), String(ans - 2)], k => String(ans + 2 + k),
      'On compte les jours restants dans le premier mois en incluant le jour de départ, puis on ajoute les jours du second mois. ' + cap(MOIS[m]) + ' compte ' + L + ' jours : du ' + d1 + ' au ' + L + ' ' + MOIS[m] + ', il y a ' + L + ' − ' + d1 + ' + 1 = ' + (L - d1 + 1) + ' jours ; on ajoute ' + d2 + ' jours en ' + MOIS[m2] + ' : ' + ans + ' jours. Piège : ' + L + ' − ' + d1 + ' oublie le premier jour et donne un total de ' + (ans - 1) + '.');
  }
  const ans = L - d1 + d2;
  return Q("Une famille arrive à l'hôtel le " + dt(d1, m) + ' et repart le ' + dt(d2, m2) + suiv + ". Combien de nuits passe-t-elle à l'hôtel ?", String(ans), [String(ans + 1), String(ans - 1), String(ans + 2)], k => String(ans - 1 - k),
    "Le nombre de nuits est l'écart entre les deux dates : chaque nuit relie un jour au lendemain. Du " + d1 + ' au ' + L + ' ' + MOIS[m] + ' : ' + L + ' − ' + d1 + ' = ' + (L - d1) + ' nuits ; puis ' + d2 + ' nuits jusqu\'au ' + dt(d2, m2) + ' : ' + ans + ' nuits. Piège : compter les jours, arrivée et départ compris, donne ' + (ans + 1) + ', un de trop.');
}

function horlogeJour(R){
  const av = R.int(0, 1) === 1, X = R.int(0, 6), d = R.int(2, 7), r = tirer(() => R.int(2, 8), v => v * (d + 1) < 60);
  const Y = X + d, off = r * d, sg = av ? 1 : -1, ans = hm(720 + sg * off);
  const q = 'Une horloge ' + (av ? 'avance' : 'retarde') + ' de ' + r + " minutes par jour. On la met à l'heure exacte un " + J(X) + ' à midi. Quelle heure affiche-t-elle le ' + J(Y) + ' suivant, à midi pile (heure exacte) ?';
  return Q(q, ans, [hm(720 + sg * r * (d + 1)), hm(720 - sg * off), hm(720 + sg * r * (d - 1))], k => hm(720 + sg * (off + k)),
    "On compte les jours écoulés, puis on multiplie par le décalage d'un jour. Du " + J(X) + ' midi au ' + J(Y) + ' midi suivant : ' + pl(d, 'jour') + '. Décalage : ' + d + ' × ' + r + ' = ' + off + ' min ' + (av ? "d'avance" : 'de retard') + " : l'horloge affiche " + ans + '. Piège : compter aussi le jour de départ donne ' + (d + 1) + ' jours au lieu de ' + d + '.');
}

function niveau2(R){
  const t = R.int(1, 6);
  if (t === 1) return angleHM(R, false);
  if (t === 2) return moisSuivant(R);
  if (t === 3) return anneeSuivante(R, false);
  if (t === 4) return nuit(R);
  if (t === 5) return joursNuits(R);
  return horlogeJour(R);
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels
   ===================================================== */
function parite(R){
  /* Le cas « vendredis à date paire » est celui de l'exemple officiel : on l'écarte pour rester original. */
  const pair = R.int(0, 1) === 1, X = pair ? R.pick([0, 1, 2, 3, 5, 6]) : R.int(0, 6), p1 = pair ? 2 : 1;
  const dates = [p1, p1 + 7, p1 + 14, p1 + 21, p1 + 28];
  const ctx = R.pick([
    ['Un marché se tient chaque ' + J(X) + ' sur la place du village.', 'de ces marchés ont lieu'],
    ["Le club d'échecs de Yanis se réunit tous les " + Js(X) + '.', 'de ces réunions ont lieu'],
    ['Sofia a un cours de danse chaque ' + J(X) + '.', 'de ces cours ont lieu']
  ]);
  const N = tirer(() => R.int(1, 30), v => dates.indexOf(v) < 0);
  const q = ctx[0] + ' Ce mois-ci' + (pair ? ',' : ', qui compte 30 jours,') + ' trois ' + ctx[1] + ' à une date ' + (pair ? 'paire' : 'impaire') + '. Quel jour de la semaine est le ' + ord(N) + ' de ce mois ?';
  const bon = X + (N - p1);
  let ref = p1; dates.forEach(t => { if (t <= N) ref = t; });
  const lst = pair ? '2, 9, 16, 23 et 30' : '1er, 8, 15, 22 et 29';
  const pos = N > ref ? 'Le ' + ord(N) + ' vient ' + pl(N - ref, 'jour') + ' après le ' + ord(ref) + ", qui est un " + J(X) + " : c'est un " + J(bon) + '.'
    : 'Le ' + ord(N) + ' est la veille du ' + ord(ref) + " : c'est un " + J(bon) + '.';
  return QJ(q, bon, [bon + 1, bon - 1, X - (N - p1)],
    'Un même jour de la semaine revient tous les 7 jours, donc ses dates alternent : paire, impaire, paire, et ainsi de suite.' +
    (pair ? ' Avec seulement quatre ' + Js(X) + " dans le mois, on n'aurait que deux dates paires : il y a donc cinq " + Js(X) + ', et le premier tombe à une date paire au plus tard le 3, c\'est-à-dire le 2.'
          : ' Avec seulement quatre ' + Js(X) + " dans le mois, on n'aurait que deux dates impaires : il y a donc cinq " + Js(X) + ', le premier à une date impaire ; dans un mois de 30 jours, il tombe au plus tard le 2, donc c\'est le 1er.') +
    ' Les ' + Js(X) + ' sont les ' + lst + '. ' + pos + ' Piège : placer le premier ' + J(X) + ' le ' + (pair ? '1er ou le 3' : '2') + " décale la réponse d'un jour.");
}

function quantiemeAn(R){
  const y = R.int(2025, 2040), X = jsem(y, 0, 1), Lan = bis(y) ? 366 : 365;
  const N = tirer(() => R.int(30, Lan), v => (v - 1) % 7 !== 0 && v % 7 !== 0);
  if (R.int(0, 1)){
    const s = (N - 1) % 7;
    return QJ('Le 1er janvier ' + y + ' est un ' + J(X) + '. Quel jour de la semaine sera le ' + N + "e jour de l'année " + y + ' ?', X + s, [X + N, X + s - 1, X - s],
      'Le ' + N + "e jour de l'année vient " + (N - 1) + ' jours après le 1er janvier : on garde le reste de la division de ' + (N - 1) + ' par 7. ' + div7(N - 1) + ' : ' + avTxt(s, X) + '. Piège : avancer de ' + N + ' jours, en confondant « le ' + N + 'e jour » et « ' + N + ' jours après le 1er janvier », donne ' + J(X + N) + '.');
  }
  const s = N % 7;
  return QJ('Le 1er janvier ' + y + ' est un ' + J(X) + '. Quel jour de la semaine sera-t-on ' + N + ' jours après le 1er janvier ' + y + ' ?', X + s, [X + N - 1, X + s + 1, X - s],
    'On avance de ' + N + ' jours depuis le 1er janvier : seul compte le reste de la division de ' + N + ' par 7. ' + div7(N) + ' : ' + avTxt(s, X) + '. Piège : ne confonds pas avec le ' + N + "e jour de l'année, qui n'est que " + (N - 1) + ' jours après le 1er janvier (on trouverait ' + J(X + N - 1) + ').');
}

function bissextilesCompte(R){
  const C = R.pick([1700, 1800, 1900, 2000, 2100, 2200, 2300]), y1 = C - R.int(9, 60), y2 = C + R.int(9, 60);
  let ans = 0, c4 = 0;
  for (let y = y1; y <= y2; y++){ if (y % 4 === 0) c4++; if (bis(y)) ans++; }
  const cNo = c4 - 1, A4 = Math.ceil(y1 / 4) * 4, B4 = Math.floor(y2 / 4) * 4;
  const q = R.pick(["Combien y a-t-il d'années bissextiles de " + y1 + ' à ' + y2 + ', ces deux années comprises ?',
    'Une entreprise a été créée le 1er janvier ' + y1 + ' et a fermé le 31 décembre ' + y2 + ". Combien d'années bissextiles a-t-elle connues ?"]);
  return Q(q, String(ans), [c4, cNo, Math.floor((y2 - y1) / 4), ans - 1, ans + 1].map(String), k => String(ans + 1 + k),
    "On compte les multiples de quatre de l'intervalle, puis on retire les années en 00 qui ne sont pas divisibles par quatre cents. " + 'Rappel : une année est bissextile si elle est divisible par 4, sauf les années en 00 qui ne sont pas divisibles par 400. Multiples de 4 de ' + y1 + ' à ' + y2 + ' : de ' + A4 + ' à ' + B4 + ', soit (' + B4 + ' − ' + A4 + ') ÷ 4 + 1 = ' + c4 + ' années. ' +
    (C % 400 === 0 ? C + ' est divisible par 400 : elle reste bissextile. Total : ' + ans + '. Piège : retirer ' + C + ' à tort donnerait ' + cNo + '.'
                   : C + " finit par 00 mais n'est pas divisible par 400 : elle n'est pas bissextile. Total : " + c4 + ' − 1 = ' + ans + '. Piège : appliquer seulement la règle « divisible par 4 » donne ' + c4 + '.'));
}

function versMars(R){
  const y = R.int(0, 1) ? R.pick([2028, 2032, 2036, 2040]) : R.pick([2025, 2026, 2027, 2029, 2030, 2031, 2033, 2034, 2035, 2037, 2038, 2039]);
  const m1 = R.int(0, 1), d1 = R.int(1, m1 === 1 ? 27 : 30), m2 = R.int(2, 3), d2 = R.int(1, LONG[m2]);
  const X = jsem(y, m1, d1), b = bis(y), parts = [nbj(m1, y) - d1];
  let mid = '';
  for (let k = m1 + 1; k < m2; k++){ parts.push(nbj(k, y)); mid += ', puis les ' + nbj(k, y) + ' jours de ' + MOIS[k]; }
  parts.push(d2);
  const T = parts.reduce((a, c) => a + c, 0), s = T % 7, fev = nbj(1, y);
  return QJ('Le ' + dt(d1, m1) + ' ' + y + ' est un ' + J(X) + '. Quel jour de la semaine sera le ' + dt(d2, m2) + ' ' + y + ' ?',
    X + s, [X + s + (b ? -1 : 1), X + s + 1, X + m7(T + 30 - fev), X - s],
    'On compte les jours entre les deux dates mois par mois, après avoir vérifié si ' + y + ' est bissextile. ' + y + (b ? ' est divisible par 4 : elle est bissextile et février compte 29 jours.' : " n'est pas divisible par 4 : février compte 28 jours.") +
    ' Il reste ' + pl(parts[0], 'jour') + ' en ' + MOIS[m1] + ' après le ' + ord(d1) + mid + ', puis ' + pl(d2, 'jour') + " jusqu'au " + dt(d2, m2) + ' : ' + parts.join(' + ') + ' = ' + T + ' jours. ' + div7(T) + ' : ' + avTxt(s, X) + '. Piège : ' +
    (b ? 'oublier le 29 février donne ' + J(X + s - 1) : "compter un 29 février qui n'existe pas donne " + J(X + s + 1)) + '.');
}

function horlogeHeure(R){
  const av = R.int(0, 1) === 1, r = R.pick([2, 3, 4, 5, 6, 10]), H0 = R.int(6, 12);
  const j = tirer(() => R.int(4, 18), v => (r * v) % 2 === 0), E = 30 * j, lag = r * j / 2, T = 60 * H0 + E, sg = av ? 1 : -1;
  const ans = hm(T + sg * lag), sansDemi = hm(T + sg * r * Math.floor(E / 60));
  return Q('Une horloge ' + (av ? 'avance' : 'retarde') + ' de ' + r + " minutes par heure. On la règle à l'heure exacte à " + H0 + ' h. Quelle heure affiche-t-elle quand il est exactement ' + hm(T) + ' ?',
    ans, [hm(T - sg * lag), sansDemi, hm(T + sg * r * (E / 60 + 1))], k => hm(T + sg * (lag + 5 * k)),
    'On calcule le temps réellement écoulé depuis le réglage, puis le décalage accumulé à raison de ' + r + ' minutes par heure. De ' + H0 + ' h à ' + hm(T) + ' : ' + duree(E) + (E % 60 ? ', soit ' + nb(E / 60, 1) + ' h' : '') + '. Décalage : ' + nb(E / 60, 1) + ' × ' + r + ' = ' + lag + ' min ' + (av ? "d'avance" : 'de retard') + " : l'horloge affiche " + ans + '.' +
    (E % 60 ? ' Piège : oublier la demi-heure donne ' + sansDemi + '.' : (av ? " Piège : une horloge qui avance affiche plus tard que l'heure exacte, pas plus tôt." : " Piège : une horloge qui retarde affiche plus tôt que l'heure exacte, pas plus tard.")));
}

function niveau3(R){
  const t = R.int(1, 8);
  if (t <= 2) return parite(R);
  if (t === 3) return quantiemeAn(R);
  if (t === 4) return bissextilesCompte(R);
  if (t === 5) return versMars(R);
  if (t === 6) return angleHM(R, true);
  if (t === 7) return horlogeHeure(R);
  return anneeSuivante(R, true);
}

/* =====================================================
   NIVEAU 4 · plus dur que les exemples officiels
   ===================================================== */
function quatreQuatre(R){
  const cas = R.int(1, 3);
  const m = cas === 3 ? R.pick([3, 5, 8, 10]) : R.pick([0, 2, 4, 6, 7, 9, 11]), L = LONG[m];
  const X = R.int(0, 6), Y = cas === 1 ? X + 4 : cas === 2 ? X + 2 : X + 1, S = cas === 1 ? X + 1 : X;
  const cite = R.int(0, 1) ? [X, Y] : [Y, X];
  const forme = R.int(1, 3), N = forme === 1 ? 1 : forme === 2 ? L : R.int(2, L - 1);
  const cible = 'le ' + ord(N) + ' ' + MOIS[m];
  const q = cas === 1
    ? 'En ' + MOIS[m] + ', une boulangerie est fermée tous les ' + Js(cite[0]) + ' et tous les ' + Js(cite[1]) + '. Ce mois-là, elle est restée fermée exactement 8 jours. Quel jour de la semaine était ' + cible + ' ?'
    : 'En ' + MOIS[m] + ', Hugo va à la piscine tous les ' + Js(cite[0]) + ' et tous les ' + Js(cite[1]) + '. Ce mois-là, il y est allé exactement 10 fois. Quel jour de la semaine était ' + cible + ' ?';
  const bon = S + N - 1, faux = cas === 1 ? [Y + 1, X, X + 2] : cas === 2 ? [X + 1, X - 1, Y] : [Y, X - 1, X + 2];
  let expl;
  if (cas === 1){
    expl = 'Dans un mois de 31 jours, chaque jour de la semaine apparaît 4 ou 5 fois, et exactement trois jours consécutifs apparaissent 5 fois : ceux du 1er, du 2 et du 3. ' + cap(MOIS[m]) + ' compte 31 jours. 8 fermetures, c\'est forcément 4 ' + Js(X) + ' et 4 ' + Js(Y) + ' (chacun apparaît au moins 4 fois). Les trois jours présents 5 fois évitent donc le ' + J(X) + ' et le ' + J(Y) + ' : du ' + J(X) + ' au ' + J(Y) + ', il y a exactement trois jours (' + J(X + 1) + ', ' + J(X + 2) + ', ' + J(X + 3) + "), alors que du " + J(Y) + ' au ' + J(X) + " il n'y en a que deux. Le 1er " + MOIS[m] + ' est donc un ' + J(S) + '.';
  } else if (cas === 2){
    expl = 'Dans un mois de 31 jours, chaque jour de la semaine apparaît 4 ou 5 fois, et exactement trois jours consécutifs apparaissent 5 fois : ceux du 1er, du 2 et du 3. ' + cap(MOIS[m]) + ' compte 31 jours. 10 séances, c\'est forcément 5 ' + Js(X) + ' et 5 ' + Js(Y) + '. Les trois jours consécutifs présents 5 fois contiennent donc le ' + J(X) + ' et le ' + J(Y) + ' : ce sont ' + J(X) + ', ' + J(X + 1) + ' et ' + J(X + 2) + '. Le 1er ' + MOIS[m] + ' est donc un ' + J(S) + '.';
  } else {
    expl = 'Dans un mois de 30 jours, chaque jour de la semaine apparaît 4 ou 5 fois, et exactement deux jours consécutifs apparaissent 5 fois : ceux du 1er et du 2. ' + cap(MOIS[m]) + ' compte 30 jours. 10 séances, c\'est forcément 5 ' + Js(X) + ' et 5 ' + Js(Y) + ' : ce sont les deux jours présents 5 fois, et le ' + J(X) + ' vient en premier. Le 1er ' + MOIS[m] + ' est donc un ' + J(S) + '.';
  }
  if (N > 1) expl += ' Le ' + N + ' vient ' + (N - 1) + ' jours après le 1er ; ' + (N - 1 >= 7 ? div7(N - 1) + ', donc ' : '') + avTxt((N - 1) % 7, S) + '.';
  return QJ(q, bon, faux.map(f => f + N - 1), expl);
}

function multiAnnees(R){
  const y = R.int(2025, 2034), n = R.int(3, 8), m = R.int(0, 11), d = R.int(1, LONG[m]);
  const X = jsem(y, m, d), tot = depuis2000(y + n, m, d) - depuis2000(y, m, d), s = tot % 7;
  const cnt = (a, b) => { const l = []; for (let z = a; z <= b; z++) if (bis(z)) l.push(z); return l; };
  const vrais = m >= 2 ? cnt(y + 1, y + n) : cnt(y, y + n - 1), faux = m >= 2 ? cnt(y, y + n - 1) : cnt(y + 1, y + n), Lv = vrais.length;
  const q = R.pick(['Un festival a lieu chaque année le ' + dt(d, m) + '. En ' + y + ', il tombe un ' + J(X) + '. Quel jour de la semaine tombera-t-il en ' + (y + n) + ' ?',
    'Le ' + dt(d, m) + ' ' + y + ' est un ' + J(X) + '. Quel jour de la semaine sera le ' + dt(d, m) + ' ' + (y + n) + ' ?']);
  return QJ(q, X + s, [X + n, X + n + faux.length, X + s + 1, X - s],
    "Chaque année écoulée décale la date d'un jour de la semaine (365 = 52 × 7 + 1), et chaque 29 février traversé ajoute un jour de plus. De " + y + ' à ' + (y + n) + ' : ' + n + ' ans, donc ' + n + ' jours de décalage. ' +
    (Lv ? (Lv > 1 ? '29 février traversés : ' : '29 février traversé : ') + liste(vrais.map(String)) + ', donc ' + Lv + ' de plus.' : "Aucun 29 février n'est traversé.") +
    ' Décalage total : ' + (n + Lv) + (n + Lv >= 7 ? ', soit ' + s + ' une fois la semaine complète retirée' : '') + ' : ' + avTxt(s, X) + '. Piège : pour une date ' +
    (m >= 2 ? 'après février, ce sont les 29 février de ' + (y + 1) + ' à ' + (y + n) + ' qui comptent' : 'de janvier ou février, ce sont les 29 février de ' + y + ' à ' + (y + n - 1) + ' qui comptent') + '.');
}

function depuisJanvier(R){
  const y = R.int(2025, 2040), X = jsem(y, 0, 1), m = R.int(4, 11), d = R.int(1, LONG[m]), b = bis(y);
  const diff = quantieme(y, m, d), s = diff % 7, decs = [];
  for (let k = 0; k < m; k++) decs.push(nbj(k, y) % 7);
  const sum = decs.reduce((a, c) => a + c, 0), W = X + sum;
  return QJ('Le 1er janvier ' + y + ' tombe un ' + J(X) + '. Quel jour de la semaine tombera le ' + dt(d, m) + ' ' + y + ' ?',
    X + s, [X + s + (b ? -1 : 1), X + s + 1, X + m7(30 * m + d - 1), X - s],
    'On avance mois par mois avec le reste de chaque mois dans la division par 7 : 31 jours décalent de 3, 30 jours de 2, février de 0 (ou de 1 s\'il a 29 jours). ' + y + (b ? ' est bissextile : février décale de 1.' : " n'est pas bissextile : février décale de 0.") +
    ' Du 1er janvier au 1er ' + MOIS[m] + ' : ' + decs.join(' + ') + ' = ' + sum + (sum >= 7 ? ', soit ' + m7(sum) + ' une fois les semaines retirées' : '') + ', donc le 1er ' + MOIS[m] + ' est un ' + J(W) + '.' +
    (d > 1 ? ' Le ' + d + ' vient ' + (d - 1) + ' jours plus tard' + (d - 1 >= 7 ? ' (' + div7(d - 1) + ')' : '') + ' : ' + avTxt((d - 1) % 7, W) + '.' : '') +
    ' Piège : ' + (b ? 'oublier le 29 février' : 'compter un 29 février qui n\'existe pas') + " décale la réponse d'un jour.");
}

function horlogeAffiche(R){
  const av = R.int(0, 1) === 1, H0 = R.int(6, 12);
  const rk = tirer(() => [R.pick(av ? [10, 12, 15, 20] : [2, 3, 4, 5, 6, 10, 12, 15]), R.int(3, 8)], v => av ? v[0] * v[1] >= 60 : v[0] * v[1] >= 12);
  const r = rk[0], k = rk[1];
  const sg = av ? 1 : -1, D = k * (60 + sg * r), disp = 60 * H0 + D, real = 60 * H0 + 60 * k, fh = Math.floor(D / 60);
  const ans = hm(real), e1 = hm(disp - sg * r * fh);
  return Q('Une horloge ' + (av ? 'avance' : 'retarde') + ' de ' + r + " minutes par heure. On la règle à l'heure exacte à " + H0 + ' h. Plus tard dans la journée, elle affiche ' + hm(disp) + '. Quelle heure est-il réellement ?',
    ans, [e1, hm(disp + sg * r * k), hm(disp - sg * r * (k + 1))], kk => hm(real + 5 * kk),
    "Il faut raisonner en heures réelles : pendant chaque heure réelle, cette horloge affiche " + (60 + sg * r) + ' minutes. Depuis le réglage, elle a affiché ' + duree(D) + ', soit ' + D + ' minutes. ' + D + ' ÷ ' + (60 + sg * r) + ' = ' + k + " : il s'est écoulé " + k + ' heures réelles. Il est donc ' + H0 + ' h + ' + k + ' h = ' + ans + '.' +
    (e1 !== ans ? ' Piège : calculer ' + (av ? "l'avance" : 'le retard') + ' à partir des ' + pl(fh, 'heure') + ' affichées donne ' + e1 + '.' : ''));
}

const UNE = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 30];
const PAIRES = [];
for (let a = 1; a <= 20; a++) for (let b = 1; b <= 20; b++){
  if (a === b || 720 % (a + b) || 720 % Math.abs(a - b)) continue;
  const v = [720 / (a + b), 720 / Math.abs(a - b), 1440 / (a + b), 720 / a];
  if (new Set(v).size === 4 && v.every(x => x === Math.round(x))) PAIRES.push([a, b]);
}
function horlogeJuste(R){
  if (R.int(0, 1) || !PAIRES.length){
    const x = R.pick(UNE), av = R.int(0, 1) === 1, ans = 720 / x;
    return Q('Une horloge à aiguilles ' + (av ? 'avance' : 'retarde') + ' de ' + x + " minutes par jour. On la met à l'heure aujourd'hui. Au bout de combien de jours affichera-t-elle de nouveau l'heure exacte pour la première fois ?",
      String(ans), [String(1440 / x), 60 % x === 0 ? String(60 / x) : null], k => String(ans + (k % 2 ? 10 : -10) * Math.ceil(k / 2)),
      'Une horloge à aiguilles redevient juste dès que son ' + (av ? 'avance cumulée' : 'retard cumulé') + " fait exactement un tour de cadran, c'est-à-dire douze heures. Or 12 h = 12 × 60 = 720 minutes. À " + x + ' minutes par jour : 720 ÷ ' + x + ' = ' + ans + ' jours. Piège : attendre un décalage de 24 h (1 440 min) donnerait ' + (1440 / x) + ' jours ; or le cadran ne compte que 12 heures.');
  }
  const ab = R.pick(PAIRES), a = ab[0], b = ab[1], ans = 720 / (a + b);
  return Q("Deux horloges à aiguilles sont mises à l'heure en même temps. La première avance de " + a + ' minutes par jour, la seconde retarde de ' + b + ' minutes par jour. Au bout de combien de jours afficheront-elles de nouveau la même heure pour la première fois ?',
    String(ans), [String(720 / Math.abs(a - b)), String(1440 / (a + b)), String(720 / a)], k => String(ans + k),
    "Chaque jour, les deux horloges s'éloignent l'une de l'autre de la somme de leurs décalages, et leurs aiguilles coïncident de nouveau quand cet écart atteint un tour de cadran, c'est-à-dire douze heures. Écart quotidien : " + a + ' + ' + b + ' = ' + (a + b) + ' minutes ; 12 h = 720 minutes ; 720 ÷ ' + (a + b) + ' = ' + ans + " jours. Piège : soustraire les décalages donnerait 720 ÷ " + Math.abs(a - b) + ' = ' + (720 / Math.abs(a - b)) + " jours ; or l'une avance et l'autre retarde, donc les écarts s'ajoutent.");
}

function superposition(R){
  const H = R.int(1, 11);
  return Q('À ' + H + " h pile, la grande aiguille d'une horloge est sur le 12. Au bout de combien de minutes rattrape-t-elle la petite aiguille pour la première fois ? (réponse en minutes)",
    fr(60 * H, 11), [String(5 * H), fr(65 * H, 12), fr(60 * H, 13)], k => fr(60 * H + 11 * k, 11),
    'La grande aiguille tourne de 6° par minute et la petite de 0,5° par minute : la grande rattrape la petite de 5,5° chaque minute. À ' + H + ' h pile, la petite aiguille a ' + H + ' × 30 = ' + (30 * H) + "° d'avance. Il faut donc " + (30 * H) + ' ÷ 5,5 = ' + (60 * H) + ' ÷ 11 = ' + fr(60 * H, 11) + ' minutes' + ((60 * H) % 11 ? ', soit environ ' + nb(60 * H / 11, 1) + ' min' : '') + '. Piège : répondre ' + (5 * H) + " min, c'est oublier que la petite aiguille avance pendant ce temps.");
}

function niveau4(R){
  const t = R.int(1, 6);
  if (t === 1) return quatreQuatre(R);
  if (t === 2) return multiAnnees(R);
  if (t === 3) return depuisJanvier(R);
  if (t === 4) return horlogeAffiche(R);
  if (t === 5) return horlogeJuste(R);
  return superposition(R);
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif
   ===================================================== */
function puissances(R){
  /* Bases dont le reste modulo 7 vaut 2 à 6 (cycles de 2, 3 ou 6) ; 8 et 15 (reste 1) seraient trop faciles pour ce niveau. */
  const a = R.pick([2, 3, 3, 4, 5, 5, 6, 9, 10, 10, 11, 12, 13, 16, 17, 19, 20]), n = R.pick([R.int(12, 99), R.int(100, 400), R.pick([2026, 2027, 2030])]);
  const X = R.int(0, 6), b = a % 7, c = [];
  let v = 1;
  for (let k = 1; k <= 6; k++){ v = (v * b) % 7; c.push(v); if (v === 1) break; }
  const p = c.length, r = c[(n - 1) % p], t = n % p;
  const intro = 'On cherche le reste de ' + a + sup(n) + ' dans la division par 7 : les restes des puissances successives reviennent en cycle.' + (a >= 7 ? ' ' + div7(a) + ', donc ' + a + sup(n) + ' a le même reste que ' + b + sup(n) + '.' : '');
  const corps = p === 1 ? ' ' + b + ' laisse le reste 1, donc toutes ses puissances aussi : le reste vaut 1.'
    : ' Les restes de ' + b + ', ' + b + '², ' + b + '³… dans la division par 7 sont ' + c.join(', ') + ', puis ils recommencent : un cycle de ' + p + '. ' + n + ' = ' + p + ' × ' + Math.floor(n / p) + (t ? ' + ' + t : '') + ', donc le reste vaut ' + r + '.';
  return QJ('Nous sommes un ' + J(X) + '. Quel jour de la semaine serons-nous dans ' + a + sup(n) + ' jours ?', X + r, [X + n % 7, X + (a * n) % 7, X + r + 1, X + r - 1],
    intro + corps + ' ' + cap(avTxt(r, X)) + '. Piège : ce n\'est pas l\'exposant ' + n + " qu'on divise par 7, c'est le nombre " + a + sup(n) + ' lui-même.');
}

function angleDroitPlat(R){
  const th = R.pick([90, 90, 180]);
  const H = tirer(() => R.int(1, 11), h => (60 * h - 2 * th) % 720 !== 0 && (60 * h + 2 * th) % 720 !== 0);
  const sols = [], sansH = [], add = [];
  for (let j = -1; j <= 2; j++) for (const sg of [-1, 1]){
    const p = 60 * H + sg * 2 * th + 720 * j; if (p > 0 && p < 1320 && sols.indexOf(p) < 0) sols.push(p);
    const q6 = 30 * H + sg * th + 360 * j; if (q6 > 0 && q6 < 720 && sansH.indexOf(q6) < 0) sansH.push(q6);
    const p13 = 60 * H + sg * 2 * th + 720 * j; if (p13 > 0 && p13 < 1560 && add.indexOf(p13) < 0) add.push(p13);
  }
  [sols, sansH, add].forEach(l => l.sort((x, y) => x - y));
  const o = sols.length >= 2 && R.int(0, 1) ? 2 : 1, p = sols[o - 1], G = p / 2;
  const nom = th === 90 ? 'un angle droit' : 'un angle plat (alignées, de part et d\'autre du centre)';
  const e1 = fr(sansH[o - 1], 6);
  return Q('Il est ' + H + " h pile. Au bout de combien de minutes les deux aiguilles d'une horloge formeront-elles " + nom + ' pour la ' + (o === 1 ? 'première' : 'deuxième') + ' fois ? (réponse en minutes)',
    fr(p, 11), [e1, sols.length > 1 ? fr(sols[o === 1 ? 1 : 0], 11) : null, fr(add[o - 1], 13), fr(2 * th, 11)], k => fr(p + 11 * k, 11),
    'La grande aiguille rattrape la petite de 6 − 0,5 = 5,5° par minute : on cherche de combien de degrés elle doit la rattraper pour que l\'écart vaille ' + (th === 90 ? 'un angle droit' : 'un angle plat') + ', puis on divise par 5,5. À ' + H + ' h pile, la petite aiguille a ' + (30 * H) + "° d'avance ; on veut un écart de " + th + '°. Cela arrive lorsque la grande aiguille a gagné ' + liste(sols.slice(0, 3).map(x => deg(x / 2))) + ' sur la petite. La ' + (o === 1 ? 'première' : 'deuxième') + ' fois correspond à ' + deg(G) + ', soit ' + nb(G, 1) + ' ÷ 5,5 = ' + fr(p, 11) + ' min (environ ' + nb(p / 11, 1) + ' min). Piège : en oubliant que la petite aiguille tourne, on trouverait ' + e1 + ' min.');
}

function plusDeQue(R){
  /* On écarte « plus de lundis que de mardis et plus de dimanches que de samedis » (énoncé connu de concours). */
  const L = R.int(2, 3), S = L === 2 ? R.int(0, 5) : R.int(0, 6), E = S + L - 1, Lm = 28 + L;
  const c1 = 'plus de ' + Js(E) + ' que de ' + Js(E + 1), c2 = 'plus de ' + Js(S) + ' que de ' + Js(S - 1);
  const cc = R.int(0, 1) ? [c1, c2] : [c2, c1];
  const intro = 'Dans un certain mois, il y a eu ' + cc[0] + ', et ' + cc[1] + '.';
  const base = 'Dans un mois, les jours de la semaine présents 5 fois se suivent et commencent par le jour du 1er ; leur nombre dépend de la longueur du mois. Il y en a un seul pour 29 jours, deux pour 30 jours, trois pour 31 jours. Il y a eu ' + c1 + ' : le ' + J(E) + ' est présent 5 fois mais pas le ' + J(E + 1) + ', donc le ' + J(E) + ' est le dernier de ces jours. Il y a eu ' + c2 + ' : le ' + J(S) + ' est le premier. Les jours présents 5 fois vont donc du ' + J(S) + ' au ' + J(E) + ' : ' + L + ' jours, ce qui donne un mois de ' + Lm + ' jours qui commence un ' + J(S) + '.';
  const forme = R.int(1, 4);
  if (forme === 1) return QJ(intro + ' Quel jour de la semaine était le 1er de ce mois ?', S, [E, S - 1, E + 1], base);
  if (forme === 2) return Q(intro + ' Combien de jours comptait ce mois ?', String(Lm), [28, 29, 30, 31].filter(x => x !== Lm).map(String), k => String(Lm + 3 + k), base);
  if (forme === 3) return QJ(intro + ' Quel jour de la semaine était le dernier jour de ce mois ?', E, [S, E + 1, S - 1], base + ' Son dernier jour, le ' + Lm + ', vient ' + (Lm - 1) + " jours après le 1er : c'est un " + J(E) + '.');
  const N = R.int(2, 27);
  return QJ(intro + ' Quel jour de la semaine était le ' + N + ' de ce mois ?', S + N - 1, [E + N - 1, S + N, S + N - 2],
    base + ' Le ' + N + ' vient ' + (N - 1) + ' jours après le 1er ; ' + (N - 1 >= 7 ? div7(N - 1) + ', donc ' : '') + avTxt((N - 1) % 7, S) + '.');
}

function memeJourAnnee(R){
  const v = R.int(1, 3), y = R.int(2025, 2040);
  let m = 0, d = 1;
  if (v === 2){ m = R.int(0, 11); d = R.int(m === 0 ? 2 : 1, LONG[m]); }
  const X = jsem(y, m, d), seq = [y + ' : ' + J(X)];
  let z = y + 1;
  for (; z < y + 60; z++){
    const w = jsem(z, m, d);
    if (v !== 3) seq.push(z + ' : ' + J(w));
    if (w === X && (v !== 3 || bis(z) === bis(y))) break;
  }
  const ans = z, hits = [];
  for (let t = y + 1; t <= ans; t++) if (jsem(t, 0, 1) === X) hits.push(t);
  const premier = hits[0];
  let q, expl;
  if (v === 3){
    q = 'Le 1er janvier ' + y + ' est un ' + J(X) + '. Quelle est la prochaine année dont le calendrier sera exactement le même que celui de ' + y + ' (même jour de la semaine pour chaque date) ?';
    expl = 'Deux années ont le même calendrier si leur 1er janvier tombe le même jour de la semaine et si elles sont toutes les deux bissextiles ou toutes les deux non bissextiles. ' + y + (bis(y) ? ' est bissextile.' : " n'est pas bissextile.") +
      " En avançant d'un jour après une année ordinaire et de deux après une année bissextile, le 1er janvier retombe un " + J(X) + ' en ' + liste(hits.map(String)) + '. La première de ces années qui est ' + (bis(y) ? '' : 'non ') + 'bissextile est ' + ans + '.' +
      (premier !== ans ? ' Piège : ' + premier + ' commence bien un ' + J(X) + ', mais ' + (bis(premier) ? 'elle est bissextile.' : "elle n'est pas bissextile.") : ' Piège : sans années bissextiles, on retrouverait le même 1er janvier au bout de 7 ans.');
  } else {
    q = v === 1 ? 'Le 1er janvier ' + y + ' est un ' + J(X) + '. Quelle est la prochaine année dont le 1er janvier sera aussi un ' + J(X) + ' ?'
      : 'Le ' + dt(d, m) + ' ' + y + ' est un ' + J(X) + '. En quelle année le ' + dt(d, m) + ' tombera-t-il de nouveau un ' + J(X) + ' pour la première fois ?';
    expl = "D'une année à la suivante, une même date avance d'un jour de la semaine, ou de deux si un 29 février est traversé : on avance année par année jusqu'à retomber sur le même jour. " + seq.join(', ') + '. Réponse : ' + ans + '. Piège : sans années bissextiles, on retrouverait le même jour au bout de 7 ans (' + (y + 7) + ') ; chaque 29 février traversé fait sauter un jour.';
  }
  return Q(q, String(ans), [v === 3 ? premier : null, y + 7, y + 28, ans + 1, ans - 1, y + 6].filter(t => t !== null && t > y).map(String), k => String(ans + 1 + k), expl);
}

function vendredi13(R){
  const y = R.int(2025, 2045), X = jsem(y, 0, 1), b = bis(y);
  const D = R.pick([13, 13, 1]);
  const W = D === 13 ? (R.int(0, 2) ? 4 : R.int(0, 6)) : tirer(() => R.int(0, 6), w => w !== X);
  const jourDe = (bx, dd) => { const t = []; let off = 0; for (let k = 0; k < 12; k++){ t.push(m7(X + off + dd - 1)); off += k === 1 ? (bx ? 29 : 28) : LONG[k]; } return t; };
  const vrai = jourDe(b, D), fauxB = jourDe(!b, D), un = jourDe(b, 1);
  const lib = D === 13 ? J(W) + ' 13' : null;
  const intro = 'On calcule le jour de la semaine du ' + (D === 13 ? '13' : '1er') + " de chaque mois, un mois après l'autre, en avançant chaque fois du reste de la longueur du mois dans la division par sept. Un mois de 31 jours décale de 3, un mois de 30 jours de 2, et février de 0 (ou de 1 en année bissextile). " + y + (b ? ' est bissextile.' : " n'est pas bissextile.") + (D === 13 ? ' Le 13 janvier vient 12 jours après le 1er, donc c\'est un ' + J(vrai[0]) + '.' : '');
  const pg = b ? ' Piège : oublier le 29 février fausse tous les mois à partir de mars.' : ' Piège : compter un 29 février qui n\'existe pas fausse tous les mois à partir de mars.';
  if (R.int(0, 1)){
    const n = vrai.filter(w => w === W).length, nB = fauxB.filter(w => w === W).length, nO = vrai.filter(w => w === m7(W - 1)).length;
    const mois = []; vrai.forEach((w, k) => { if (w === W) mois.push(MOIS[k]); });
    const q = "L'année " + y + ' commence un ' + J(X) + '. ' + (D === 13 ? 'Combien compte-t-elle de ' + Js(W) + ' 13 ?' : 'Combien de mois de cette année commencent un ' + J(W) + ' ?');
    return Q(q, String(n), [nB, nO, 0, 1, 2, 3, 4].map(String), k => String(n + 4 + k),
      intro + ' On obtient : ' + vrai.map((w, k) => MOIS[k] + ' ' + J(w)).join(', ') + '. Le ' + (D === 13 ? '13' : '1er') + ' tombe un ' + J(W) + ' ' + n + ' fois (' + liste(mois) + ').' + pg);
  }
  const ans = vrai.indexOf(W), eB = fauxB.indexOf(W), eO = vrai.indexOf(m7(W - 1)), eU = D === 13 ? un.indexOf(W) : -1;
  const q = "L'année " + y + ' commence un ' + J(X) + '. ' + (D === 13 ? 'Quel est le premier mois de cette année qui compte un ' + lib + ' ?' : 'Quel est le premier mois de cette année qui commence un ' + J(W) + ' ?');
  return Q(q, MOIS[ans], [eB, eO, eU].filter(i => i >= 0).map(i => MOIS[i]), k => MOIS[(ans + k) % 12],
    intro + ' On obtient : ' + vrai.slice(0, ans + 1).map((w, k) => MOIS[k] + ' ' + J(w)).join(', ') + '. Le premier mois qui convient est ' + MOIS[ans] + '.' + (ans >= 2 ? pg : ''));
}

/* Même date à un siècle (ou presque) d'écart : il faut compter les 29 février en appliquant la règle des années en 00
   (2100 et 1900 ne sont pas bissextiles, 2000 l'est). En avant, on traverse toujours 2100 ; en arrière, toujours 2000. */
function siecle(R){
  const fwd = R.int(0, 1) === 1, y = R.int(2025, 2040), m = R.int(0, 11), d = R.int(1, LONG[m]);
  const n = fwd ? R.pick([80, 90, 100, 110, 120]) : R.pick([50, 60, 75, 100, 110, 125, 150]);
  const y2 = fwd ? y + n : y - n, a = Math.min(y, y2), b = Math.max(y, y2), X = jsem(y, m, d);
  const lo = m >= 2 ? a + 1 : a, hi = m >= 2 ? b : b - 1;
  let L4 = 0; const exc = [], s400 = [];
  for (let z = lo; z <= hi; z++) if (z % 4 === 0){ L4++; if (!bis(z)) exc.push(z); else if (z % 100 === 0) s400.push(z); }
  const L = L4 - exc.length, tot = n + L, s = tot % 7, sg = fwd ? 1 : -1, bon = X + sg * s;
  const A4 = Math.ceil(lo / 4) * 4, B4 = Math.floor(hi / 4) * 4;
  const naif = X + sg * ((n + L4) % 7), sans400 = X + sg * ((tot - s400.length) % 7);
  const D1 = dt(d, m) + ' ' + y, D2 = dt(d, m) + ' ' + y2;
  const forme = R.int(0, 1);
  const q = fwd
    ? (forme ? 'Le ' + D1 + ' est un ' + J(X) + '. Quel jour de la semaine sera le ' + D2 + ' ?'
             : 'Une capsule temporelle est enterrée le ' + D1 + ', un ' + J(X) + '. Elle doit être ouverte le ' + D2 + '. Quel jour de la semaine sera-ce ?')
    : (forme ? 'Le ' + D1 + ' est un ' + J(X) + '. Quel jour de la semaine était le ' + D2 + ' ?'
             : 'Une école a été fondée le ' + D2 + '. Le ' + D1 + ', jour de son anniversaire, est un ' + J(X) + ". Quel jour de la semaine l'école a-t-elle été fondée ?");
  const pluriel = (l, un, plus) => l.length > 1 ? plus : un;
  let expl = "Chaque année décale une date d'un jour de la semaine (365 = 52 × 7 + 1) et chaque 29 février traversé ajoute un jour : on compte les années, puis les 29 février, en appliquant la règle des années en 00. " +
    'De ' + a + ' à ' + b + ' : ' + n + ' années, donc ' + n + ' jours de décalage. ' +
    (m >= 2 ? 'Pour une date après février, les 29 février traversés sont ceux des années ' + lo + ' à ' + hi
            : 'Pour une date de janvier ou de février, les 29 février traversés sont ceux des années ' + lo + ' à ' + hi) +
    ' divisibles par 4 : de ' + A4 + ' à ' + B4 + ', soit (' + B4 + ' − ' + A4 + ') ÷ 4 + 1 = ' + L4 + ' années';
  if (exc.length) expl += ', moins ' + liste(exc.map(String)) + ', ' + pluriel(exc, "qui n'est pas bissextile", 'qui ne sont pas bissextiles') + ' (divisible' + pluriel(exc, '', 's') + ' par 100 mais pas par 400)';
  if (s400.length) expl += ' ; ' + liste(s400.map(String)) + ', ' + pluriel(s400, 'divisible', 'divisibles') + ' par 400, ' + pluriel(s400, 'reste bissextile', 'restent bissextiles');
  expl += '. Cela fait ' + L + ' jours de plus. Décalage total : ' + n + ' + ' + L + ' = ' + tot + ' ; ' + div7(tot) + ' : ' + (s ? 'on ' + (fwd ? 'avance' : 'recule') + ' de ' + pl(s, 'jour') + ' à partir du ' + J(X) : 'on retombe sur le même jour de la semaine') + " : c'est un " + J(bon) + '. Piège : ' +
    (exc.length ? 'compter ' + liste(exc.map(String)) + ' comme ' + pluriel(exc, 'bissextile', 'bissextiles') + ' donne ' + J(naif)
                : 'retirer ' + liste(s400.map(String)) + ' à tort donne ' + J(sans400)) +
    (!fwd && s ? ' ; et ici on remonte dans le temps : avancer au lieu de reculer donnerait ' + J(X + s) : '') + '.';
  return QJ(q, bon, [naif, sans400, X - sg * s, X + sg * (n % 7)], expl);
}

function niveau5(R){
  const t = R.int(1, 6);
  if (t === 1) return puissances(R);
  if (t === 2) return angleDroitPlat(R);
  if (t === 3) return plusDeQue(R);
  if (t === 4) return memeJourAnnee(R);
  if (t === 5) return siecle(R);
  return vendredi13(R);
}

/* =====================================================
   alb-14 · Calendriers, jours de la semaine, horloges
   ===================================================== */
A.push({
  id: 'alb-14-calendriers-horloges',
  phase: 'albert',
  ordre: 14,
  theme: 'logique',
  titre: 'Calendriers, jours de la semaine, horloges',
  objectif: "Trouver un jour de la semaine, compter des jours et des années bissextiles, calculer l'angle des aiguilles et le décalage d'une horloge, sans calculatrice.",
  lecon:
`<p class="lede">Les questions de calendrier et d'horloge reposent sur deux idées simples : <mark>les jours de la semaine reviennent tous les 7 jours</mark>, et <mark>les aiguilles tournent à vitesse constante</mark>. Avec le reste de la division par 7 et trois vitesses à connaître, tu résous presque tout de tête.</p>
<h2>Ce que le test te demande</h2>
<p>Le test aime les petites énigmes de dates et d'heures : quel jour serons-nous dans 100 jours, quel jour tombe le 21 d'un mois dont on connaît quelques dates, quel angle font les aiguilles à une heure donnée, quelle heure affiche une horloge qui retarde. Aucune formule de cours n'est exigée : il faut compter juste et repérer le raccourci.</p>
<h2>Les prérequis</h2>
<table class="tbl"><tr><th>Durée</th><th>Nombre de jours</th><th>Décalage du jour de la semaine</th></tr>
<tr><td>Mois de 31 jours (janvier, mars, mai, juillet, août, octobre, décembre)</td><td>31 = 4 × 7 + 3</td><td>3 jours</td></tr>
<tr><td>Mois de 30 jours (avril, juin, septembre, novembre)</td><td>30 = 4 × 7 + 2</td><td>2 jours</td></tr>
<tr><td>Février</td><td>28 ou 29</td><td>0 ou 1 jour</td></tr>
<tr><td>Année ordinaire</td><td>365 = 52 × 7 + 1</td><td>1 jour</td></tr>
<tr><td>Année bissextile</td><td>366 = 52 × 7 + 2</td><td>2 jours</td></tr></table>
<p>Une année est <mark>bissextile</mark> si elle est divisible par 4, sauf les années en 00 qui ne sont pas divisibles par 400 : 2028 est bissextile, 1900 et 2100 ne le sont pas, 2000 l'est.</p>
<p>Sur une horloge, la grande aiguille fait un tour (360°) en 60 minutes : <strong>6° par minute</strong>. La petite fait un tour en 12 heures : <strong>30° par heure</strong>, soit <strong>0,5° par minute</strong>. Enfin, une heure compte 60 minutes et non 100 : 0,1 h = 6 min et 0,25 h = 15 min.</p>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je repère le décalage en jours :</strong> « dans N jours », écart entre deux dates, jours restants dans chaque mois traversé.</p>
<p><strong>2. Je garde le reste de la division par 7 :</strong> 100 = 7 × 14 + 2, donc dans 100 jours on avance de 2 jours de la semaine.</p>
<p><strong>3. Je vérifie les cas spéciaux :</strong> 29 février traversé ou non, jour de départ compté ou non, « le 100e jour » (99 jours après le 1er janvier) ou « dans 100 jours ».</p>
<p><strong>4. Pour une horloge :</strong> je place chaque aiguille en degrés depuis le 12, puis je fais la différence et je garde le plus petit angle.</p>
</div>
<div class="formule"><p>angle à h heures m minutes = |30 × h − 5,5 × m|, puis 360° moins ce nombre s'il dépasse 180°</p></div>
<h2>Exemples résolus</h2>
<h3>1. Dans 75 jours</h3>
<p>Nous sommes un jeudi. 75 = 7 × 10 + 5 : dans 70 jours, c'est encore jeudi, puis on avance de 5 jours. Réponse : mardi.</p>
<h3>2. L'angle à 8 h 20</h3>
<p>Grande aiguille : 20 × 6 = 120°. Petite aiguille : 8 × 30 + 20 × 0,5 = 250°. Écart : 250 − 120 = 130°, qui ne dépasse pas 180°. Réponse : 130°.</p>
<h3>3. Une année bissextile</h3>
<p>Le 1er janvier 2028 est un samedi : quel jour est le 1er mars 2028 ? 2028 est divisible par 4, donc février compte 29 jours. Entre les deux dates, il y a 31 + 29 = 60 jours, et 60 = 7 × 8 + 4. Samedi plus 4 jours : mercredi.</p>
<h3>4. Des dates qui alternent (niveau du test)</h3>
<p>Dans un mois de 30 jours, trois mercredis tombent à une date impaire : quel jour est le 12 ? Les dates d'un même jour alternent entre impaire et paire : pour en avoir trois impaires, il faut cinq mercredis, le premier à une date impaire. Dans un mois de 30 jours, le premier mercredi tombe au plus tard le 2 : c'est donc le 1er. Les mercredis sont les 1er, 8, 15, 22 et 29. Le 12 vient 4 jours après le 8 : c'est un dimanche.</p>
<h2>Pour viser les questions les plus difficiles</h2>
<p><strong>Les jours présents cinq fois.</strong> Dans un mois de 31 jours, les jours du 1er, du 2 et du 3 apparaissent cinq fois et les autres quatre fois (deux jours seulement pour 30 jours, un seul pour 29). Si un mois de 31 jours compte exactement quatre mardis et quatre samedis, les trois jours présents cinq fois se suivent en évitant mardi et samedi : ce sont mercredi, jeudi et vendredi, donc le 1er est un mercredi.</p>
<p><strong>Les aiguilles qui se rattrapent.</strong> La grande aiguille gagne 6 − 0,5 = 5,5° par minute sur la petite. À 4 h pile, la petite a 120° d'avance : la grande la rattrape au bout de 120 ÷ 5,5 = 240/11 minutes, un peu moins de 22 minutes.</p>
<p><strong>Sur un siècle.</strong> Compte les années, puis les 29 février traversés : n'oublie pas que 2100 n'est pas bissextile, alors que 2000 l'est.</p>
<h2>Réflexes sans calculatrice</h2>
<p>Connais les multiples de 7 : 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, puis 140, 350 et 700. Pour un grand nombre, retire un gros multiple de 7 : 1 000 = 700 + 280 + 20, et 20 = 14 + 6, donc le reste vaut 6. Pour une puissance, cherche quand le reste revient à 1 : 2³ = 8 = 7 + 1, donc les restes de 2, 4, 8, 16… se répètent : 2, 4, 1. Une horloge à aiguilles redevient juste quand son décalage atteint 12 heures, soit 720 minutes.</p>
<div class="box astuce"><p class="box-t">Astuce</p><p>Ramène tout décalage de jours au reste de sa division par 7, et place chaque aiguille en degrés depuis le 12 : 6° par minute pour la grande, 30° par heure plus 0,5° par minute pour la petite.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Ne compte pas le jour de départ quand tu avances de N jours. « Le 100e jour de l'année » n'est que 99 jours après le 1er janvier. Le 29 février ne compte que s'il se trouve vraiment entre les deux dates, et une année en 00 n'est bissextile que si elle est divisible par 400. La petite aiguille bouge pendant les minutes, et l'on demande en général le plus petit angle, qui ne dépasse jamais 180°. Enfin, 1,5 h = 1 h 30 min, et du 3 au 10 il y a 7 nuits mais 8 jours.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Jours : on raisonne avec le reste de la division par 7 (31 jours donnent +3, 30 jours +2, 365 jours +1, 366 jours +2). Un même jour de la semaine alterne dates paires et impaires. Dans un mois de 31 jours, les jours du 1er, du 2 et du 3 apparaissent cinq fois. Aiguilles : 6° par minute pour la grande, 0,5° par minute pour la petite, angle = |30h − 5,5m|.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = [null, niveau1, niveau2, niveau3, niveau4, niveau5][n](R);
      if (ex && typeof ex.q === 'string' && typeof ex.a === 'string' && Array.isArray(ex.choix) && ex.choix.length === 4) return ex;
    } catch (e) { /* repli ci-dessous : jamais d'exception vers l'appelant */ }
    return joursPlusMoins(R, false);
  }
});

})();
