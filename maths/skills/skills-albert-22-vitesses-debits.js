/* ===== Maths · Objectif Albert School : alb-22 · Vitesses, débits et travail en commun =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS.
   gen(level, R) : niveaux 1 à 5 (bornés), n'utilise que R.int, R.pick, R.shuffle, ne lève jamais d'exception.
   Chaque énoncé est construit à partir de la solution tirée au hasard : la réponse est toujours calculée.
   Sous-types :
   N1 vitesse moyenne (durée en h et min), distance parcourue, durée d'un trajet, débits, conversion km/h et m/s ;
   N2 aller-retour à deux vitesses, deux tronçons de durées différentes, rapprochement face à face,
      débits cumulés ou fuite, allure (minutes au kilomètre) ;
   N3 deux robinets ou deux personnes ensemble, remplissage avec vidange, retrouver le temps d'un seul,
      poursuite (heure ou lieu du rattrapage), vitesse du retour pour une moyenne visée, règle de trois composée ;
   N4 trois ensemble, l'un commence seul ou part avant la fin, tapis roulant et escalator, bateau et courant
      (ou avion et vent), train et tunnel ou pont, chien entre deux marcheurs, départs décalés face à face,
      trois tronçons de même longueur ;
   N5 retard et avance, croisement puis arrivées (moyenne géométrique), trois paires de travailleurs,
      marches d'un escalator, second tour pour une moyenne visée (parfois impossible), trains qui se croisent
      ou se dépassent, deux robinets et une vidange sur une cuve déjà entamée. */
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
const pgcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a; };
const ppcm = (a, b) => a / pgcd(a, b) * b;
const ent = v => typeof v === 'number' && isFinite(v) && Math.abs(v - Math.round(v)) < 1e-9;
const dec = (v, k) => ent(v * Math.pow(10, k));                 // au plus k décimales
const sg = k => (k % 2 ? 1 : -1) * Math.ceil(k / 2);             // 1, −1, 2, −2, …
const pasV = v => v >= 100 ? 10 : v >= 40 ? 5 : v >= 15 ? 2 : 1;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* Formats des réponses. */
function dur(m){ m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h ? h + ' h' + (r ? ' ' + r + ' min' : '') : r + ' min'; }
function durS(s){ s = Math.round(s); const m = Math.floor(s / 60), r = s % 60; return m ? m + ' min' + (r ? ' ' + r + ' s' : '') : r + ' s'; }
function heure(m){ m = ((Math.round(m) % 1440) + 1440) % 1440; const h = Math.floor(m / 60), r = m % 60; return h + ' h' + (r ? ' ' + (r < 10 ? '0' : '') + r : ''); }
const kmh = v => nb(v) + ' km/h';
const mps = v => nb(v) + ' m/s';
const km = v => nb(v) + ' km';
const metres = v => nb(v, 0) + ' m';
const litres = v => nb(v) + ' L';
const lmin = v => nb(v) + ' L/min';
const jours = v => nb(v, 1) + (v < 2 ? ' jour' : ' jours');
const marches = v => nb(v, 0) + ' marches';
/* Fraction simplifiée en texte : « 2/3 », « 4 ». */
const frac = (n, d) => { const g = pgcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; };
/* Durée en minutes écrite en heures : « 1,5 », « 0,75 » ou « 4/3 ». */
const enH = m => dec(m / 60, 2) ? nb(m / 60) : frac(m, 60);
/* Conversion d'une durée pour l'explication : « 1 h 30 min = 90 min = 1,5 h ». */
const conv = t => t % 60 === 0 ? dur(t) : (t > 60 ? dur(t) + ' = ' + t + ' min = ' : t + ' min = ') + enH(t) + ' h';
/* Somme de fractions unitaires ±1/d, détaillée : « 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2 ». */
function somme(termes){
  const L = termes.reduce((l, t) => ppcm(l, t[1]), 1);
  let N = 0; const p1 = [], p2 = [];
  termes.forEach((t, i) => {
    const k = L / t[1]; N += t[0] * k;
    const s = i ? (t[0] > 0 ? ' + ' : ' − ') : (t[0] < 0 ? '−' : '');
    p1.push(s + '1/' + t[1]); p2.push(s + k + '/' + L);
  });
  let txt = p1.join('');
  if (termes.some(t => t[1] !== L)) txt += ' = ' + p2.join('');
  txt += ' = ' + N + '/' + L;
  const g = pgcd(N, L) || 1;
  if (g > 1) txt += ' = ' + frac(N, L);
  return { txt, n: N / g, d: L / g };
}
/* Inverse d'une fraction n/d en texte : la durée correspondant à ce rythme. */
const inv = s => s.n === 1 ? String(s.d) : s.d + '/' + s.n;
const pl = (s, mot) => mot + (s.d / s.n >= 2 ? 's' : '');
/* Durée en minutes écrite « 4/3 h, soit 1 h 20 min », ou « 2 h » si elle tombe juste. */
const hs = m => m % 60 === 0 ? dur(m) : enH(m) + ' h, soit ' + dur(m);
/* Durée tirée d'un rythme s (fraction du travail par unité u) : « 4 h » ou « 12/5 heures, soit 2 h 24 min ». */
const tps = (s, u, T) => s.n === 1 ? dur(T) : inv(s) + ' ' + pl(s, u) + ', soit ' + dur(T);
const accord = (l, mot) => mot + (l.every(p => p.f) ? 'e' : '');

/* QCM : la bonne réponse, les distracteurs pédagogiques (valeurs > 0 validées par ok), puis des voisins.
   bonne ou un distracteur peut être un texte (« C'est impossible »), ajouté tel quel. */
function Q(q, bonne, autres, fmt, voisin, expl, ok){
  const f = v => typeof v === 'string' ? v : fmt(v);
  const valide = v => typeof v === 'string' || (typeof v === 'number' && isFinite(v) && v > 0 && (!ok || ok(v)));
  const ch = [f(bonne)], vus = new Set([norm(ch[0])]);
  const aj = v => { if (ch.length < 4 && v != null && valide(v)){ const s = f(v); if (!vus.has(norm(s))){ vus.add(norm(s)); ch.push(s); } } };
  autres.forEach(aj);
  for (let k = 1; ch.length < 4 && k < 400; k++) aj(voisin(k));
  return { q, a: ch[0], accept: null, choix: ch, expl };
}

/* ---------- personnages et décors ---------- */
/* Aucun prénom ne commence par une voyelle : « de Léa », « que Tom » se disent sans élision. */
const FILLES = ['Léa', 'Rose', 'Jade', 'Nour', 'Lina', 'Clara', 'Zoé', 'Sarah', 'Chloé', 'Maya', 'Camille', 'Manon', 'Lou', 'Sofia'];
const GARCONS = ['Tom', 'Jules', 'Sami', 'Lucas', 'Yanis', 'Malik', 'Noé', 'Rayan', 'Léo', 'Bilal', 'Théo', 'Karim', 'Nathan', 'Maël'];
function gens(R, n){
  return R.shuffle(FILLES.concat(GARCONS)).slice(0, n).map(x => {
    const f = FILLES.indexOf(x) >= 0;
    return { nom: x, f, il: f ? 'elle' : 'il', e: f ? 'e' : '' };
  });
}
const ils = (...l) => l.every(p => p.f) ? 'elles' : 'ils';
const lun = (a, b) => a.f && b.f ? 'l\'une' : 'l\'un';
const VEH = [
  { n: 'Une voiture', il: 'elle', vb: 'roule', v: [48, 60, 72, 80, 84, 90, 96, 100, 120] },
  { n: 'Un cycliste', il: 'il', vb: 'roule', v: [12, 15, 16, 18, 20, 24, 30] },
  { n: 'Un train', il: 'il', vb: 'roule', v: [120, 144, 160, 180, 200, 240, 300] },
  { n: 'Une coureuse', il: 'elle', vb: 'court', v: [8, 9, 10, 12, 15] },
  { n: 'Un bateau', il: 'il', vb: 'navigue', v: [12, 18, 20, 24, 30, 36] },
  { n: 'Un scooter', il: 'il', vb: 'roule', v: [30, 36, 40, 45, 48] }
];
const DEST = ['à la plage', 'chez sa grand-mère', 'au lac', 'à la montagne', 'chez un ami', 'à son club de sport'];
const DEST2 = ['la plage', 'la gare', 'la ville voisine', 'la base nautique', 'la piscine'];
const LIEUX = [['le lycée', 'du lycée'], ['la gare', 'de la gare'], ['la mairie', 'de la mairie'], ['le stade', 'du stade'], ['le camping', 'du camping']];
const VILLES = [['Valbourg', 'Montclar'], ['Bellerive', 'Rocheval'], ['Pradelles', 'Lormont'], ['Villebois', 'Castelnau'], ['Fontbrune', 'Mirande']];
/* Un véhicule, une vitesse de sa liste et une durée qui donnent une distance entière. */
function tirerVT(R, durees){
  for (let i = 0; i < 80; i++){
    const vh = R.pick(VEH), v = R.pick(vh.v), t = R.pick(durees);
    if ((v * t) % 60 === 0) return { vh, v, t, d: v * t / 60 };
  }
  return { vh: VEH[0], v: 60, t: 90, d: 90 };
}

/* =====================================================
   NIVEAU 1 · découverte
   ===================================================== */

/* 1a · Vitesse moyenne à partir d'une distance et d'une durée en h et min. */
function s1a(R){
  const { vh, v, t, d } = tirerVT(R, [20, 30, 40, 45, 75, 80, 90, 100, 105, 135, 150]);
  const h = Math.floor(t / 60), mm = t % 60, lu = h + mm / 100;
  const q = R.int(0, 1) ? `${vh.n} parcourt ${nb(d)} km en ${dur(t)}. Quelle est sa vitesse moyenne ?`
                        : `${vh.n} met ${dur(t)} pour parcourir ${nb(d)} km. Quelle est sa vitesse moyenne, en km/h ?`;
  const autres = [];
  if (h && mm) autres.push(d / lu, d / h);
  autres.push(d / t, d * t / 60);
  let expl = `Divise la distance par la durée exprimée en heures, jamais en minutes. ${conv(t)}, donc v = ${nb(d)} × 60 ÷ ${t} = ${nb(v)} km/h.`;
  expl += h && mm ? ` Piège : ${dur(t)} ne vaut pas ${nb(lu)} h, et diviser par ${h} seulement oublie les minutes.`
                  : ` Piège : ${nb(d)} ÷ ${t} donne des kilomètres par minute, pas par heure.`;
  return Q(q, v, autres, kmh, k => v + sg(k) * pasV(v), expl, x => dec(x, 2));
}

/* 1b · Distance parcourue. */
function s1b(R){
  const { vh, v, t, d } = tirerVT(R, [20, 30, 40, 45, 75, 80, 90, 100, 105, 135, 150]);
  const h = Math.floor(t / 60), mm = t % 60, lu = h + mm / 100;
  const q = `${vh.n} ${vh.vb} à ${v} km/h de moyenne pendant ${dur(t)}. Quelle distance parcourt-${vh.il} ?`;
  const autres = [v * lu, v * t, v * 60 / t];
  if (h && mm) autres.push(v * h);
  const expl = `Multiplie la vitesse par la durée convertie en heures. ${conv(t)}, donc d = ${v} × ${t} ÷ 60 = ${nb(d)} km. Piège : ${dur(t)} ne vaut pas ${nb(lu)} h, et multiplier ${v} par ${t} oublie de convertir les minutes en heures.`;
  return Q(q, d, autres, km, k => d + sg(k) * pasV(d), expl, x => dec(x, 2));
}

/* 1c · Durée d'un trajet, résultat à convertir en h et min. */
function s1c(R){
  const { vh, v, t, d } = tirerVT(R, [20, 30, 40, 45, 75, 80, 90, 105, 135, 150]);
  const q = `${vh.n} ${vh.vb} à ${v} km/h de moyenne. Combien de temps lui faut-il pour parcourir ${nb(d)} km ?`;
  const hd = t / 60, fl = Math.floor(hd), fr = hd - fl, autres = [];
  let piege;
  if (dec(hd, 2) && fr > 1e-9){
    const c = Math.round(fr * 100), lu = fl * 60 + c;
    autres.push(lu);
    piege = `Piège : ${nb(hd)} h ne veut pas dire ${fl ? fl + ' h ' + c + ' min' : c + ' min'}, car ${nb(fr)} h = ${nb(fr)} × 60 = ${Math.round(fr * 60)} min.`;
  } else piege = `Piège : diviser la vitesse par la distance (${v} ÷ ${nb(d)}) renverse le calcul.`;
  autres.push(60 * v / d, t + 60);
  const expl = `Divise la distance par la vitesse : tu obtiens des heures, que tu convertis ensuite en minutes. t = ${nb(d)} ÷ ${v} = ${enH(t)} h, soit ${enH(t)} × 60 = ${t} min${t >= 60 ? ', c\'est-à-dire ' + dur(t) : ''}. ` + piege;
  return Q(q, t, autres, dur, k => t + sg(k) * (t % 15 ? 10 : 15), expl, x => ent(x));
}

/* 1d · Débits : litres écoulés, durée de vidange, débit d'un tuyau. */
function s1d(R){
  const mode = R.int(0, 2);
  if (mode === 0){
    const r = R.pick([4, 5, 6, 8, 10, 12, 15, 20]), t = R.pick([70, 75, 80, 90, 100, 105, 110, 135, 150]);
    const h = Math.floor(t / 60), mm = t % 60, V = r * t;
    const q = `Un robinet débite ${r} litres par minute. Combien de litres coulent en ${dur(t)} ?`;
    const expl = `Convertis d'abord la durée en minutes, puis multiplie par le débit. ${dur(t)} = ${h} × 60 + ${mm} = ${t} min, donc ${r} × ${t} = ${nb(V)} L. Piège : ${dur(t)} ne fait pas ${h * 100 + mm} min, et multiplier ${r} par ${enH(t)} (des heures) mélange les unités.`;
    return Q(q, V, [r * (h * 100 + mm), r * h * 60, r * t / 60], litres, k => V + sg(k) * 10 * r, expl, x => dec(x, 2));
  }
  if (mode === 1){
    let r = 8, t = 270;
    for (let i = 0; i < 80; i++){
      const r0 = R.pick([4, 6, 8, 10, 12, 16, 20, 24, 30, 40]), t0 = R.pick([90, 105, 135, 150, 165, 195, 210, 225, 270, 330, 390, 450]);
      if ((r0 * t0) % 60 === 0){ r = r0; t = t0; break; }
    }
    const V = r * t / 60, hd = t / 60, fl = Math.floor(hd), fr = hd - fl, c = Math.round(fr * 100);
    const q = `Une pompe vide un bassin de ${nb(V)} m³ à raison de ${r} m³ par heure. Combien de temps lui faut-il pour le vider ?`;
    const expl = `Divise le volume par le débit : tu obtiens des heures, puis tu convertis la partie décimale en minutes. ${nb(V)} ÷ ${r} = ${nb(hd)} h, et ${nb(fr)} h = ${nb(fr)} × 60 = ${Math.round(fr * 60)} min : il faut ${dur(t)}. Piège : lire ${nb(hd)} h comme ${fl} h ${c} min, ou oublier la partie décimale.`;
    return Q(q, t, [fl * 60 + c, fl * 60], dur, k => t + sg(k) * 15, expl, x => ent(x));
  }
  const r = R.pick([3, 4, 5, 6, 8, 10, 12, 15, 20]), t = R.pick([70, 75, 80, 90, 100, 105, 110, 135, 150]);
  const h = Math.floor(t / 60), mm = t % 60, V = r * t;
  const q = `Un tuyau remplit une cuve de ${nb(V)} litres en ${dur(t)}. Quel est son débit, en litres par minute ?`;
  const expl = `Divise le volume par la durée exprimée en minutes. ${dur(t)} = ${t} min, donc ${nb(V)} ÷ ${t} = ${r} L/min. Piège : ${dur(t)} ne fait pas ${h * 100 + mm} min, et diviser par ${h} oublie les minutes.`;
  return Q(q, r, [V / (h * 100 + mm), V / h, V * 60 / t], lmin, k => r + sg(k), expl, x => dec(x, 2));
}

/* 1e · Conversion km/h et m/s. */
const CONV = [[2.5, 9], [5, 18], [7.5, 27], [10, 36], [12.5, 45], [15, 54], [20, 72], [25, 90], [30, 108], [35, 126], [40, 144], [50, 180], [60, 216], [80, 288], [100, 360]];
function mobile(R, u){
  return R.pick(u <= 7.5 ? ['Un coureur', 'Une trottinette', 'Une joggeuse'] : u <= 15 ? ['Un cycliste', 'Un cheval au galop', 'Un scooter']
    : u <= 30 ? ['Une voiture', 'Une moto', 'Un guépard'] : u <= 40 ? ['Une voiture', 'Une moto'] : ['Un TGV', 'Un train', 'Un avion au décollage']);
}
function s1e(R){
  const c = R.pick(CONV), u = c[0], v = c[1], qui = mobile(R, u);
  const debut = 'Pour passer des km/h aux m/s, on divise par 3,6 ; dans l\'autre sens, on multiplie par 3,6. En effet, 1 km/h, c\'est 1 000 m parcourus en 3 600 s. ';
  if (R.int(0, 1)){
    const q = `${qui} se déplace à ${v} km/h. Quelle est sa vitesse en mètres par seconde ?`;
    const expl = debut + `${v} ÷ 3,6 = ${nb(u)} m/s. Vérification : ${nb(u)} × 3,6 = ${v}. Piège : multiplier par 3,6 au lieu de diviser donne ${nb(v * 3.6)} m/s, une vitesse bien trop grande.`;
    return Q(q, u, [v * 3.6, v * 1000 / 60, v / 60, v / 10], mps, k => u + sg(k) * (u < 10 ? 0.5 : 5), expl, x => dec(x, 2));
  }
  const q = `${qui} se déplace à ${nb(u)} m/s. Quelle est sa vitesse en km/h ?`;
  const expl = debut + `${nb(u)} × 3,6 = ${v} km/h. Piège : diviser par 3,6 donne une vitesse trop petite, et multiplier par 60 ne convertit que les secondes en minutes.`;
  return Q(q, v, [u / 3.6, u * 60, u * 36, u * 10], kmh, k => v + sg(k) * 9, expl, x => dec(x, 2));
}

/* =====================================================
   NIVEAU 2 · maîtrise
   ===================================================== */

/* 2a · Deux trajets de même longueur à deux vitesses : la moyenne n'est pas la moyenne des vitesses. */
function s2a(R){
  const ctx = R.int(0, 2), p = gens(R, 1)[0];
  const L = [[30, 40, 45, 50, 60, 70, 72, 75, 80, 84, 90, 100, 105, 120, 140, 150],
             [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24, 30, 36, 40, 45, 48, 60],
             [6, 8, 9, 10, 12, 15, 18, 20, 24]][ctx];
  let v1 = 0, v2 = 0;
  for (let i = 0; i < 400; i++){
    const a = R.pick(L), b = R.pick(L);
    if (a !== b && (2 * a * b) % (a + b) === 0 && (ctx !== 1 || (a < b && a <= 20))){ v1 = a; v2 = b; break; }
  }
  if (!v1){ if (ctx === 0){ v1 = 60; v2 = 40; } else if (ctx === 1){ v1 = 12; v2 = 36; } else { v1 = 10; v2 = 15; } }
  const vm = 2 * v1 * v2 / (v1 + v2), moy = (v1 + v2) / 2, d = ppcm(v1, v2), T = d / v1 + d / v2;
  const q = ctx === 0 ? `${p.nom} va ${R.pick(DEST)} en voiture à ${v1} km/h de moyenne, puis revient par la même route à ${v2} km/h. Quelle est sa vitesse moyenne sur l'aller-retour ?`
          : ctx === 1 ? `${p.nom} monte un col à vélo à ${v1} km/h de moyenne, puis redescend par la même route à ${v2} km/h. Quelle est sa vitesse moyenne sur l'ensemble du parcours ?`
          : `${p.nom} court la première moitié d'un parcours à ${v1} km/h, puis la seconde moitié à ${v2} km/h. Quelle est sa vitesse moyenne sur tout le parcours ?`;
  const expl = `Choisis une distance commode, calcule le temps total, puis divise la distance totale par ce temps total. Prenons ${nb(d)} km pour ${ctx === 2 ? 'chaque moitié' : 'chaque sens'}, un multiple de ${v1} et de ${v2} : il faut ${d / v1} h à ${v1} km/h et ${d / v2} h à ${v2} km/h, soit ${nb(2 * d)} km en ${T} h. Vitesse moyenne : ${nb(2 * d)} ÷ ${T} = ${nb(vm)} km/h. Piège : la moyenne des deux vitesses, ${nb(moy)} km/h, est fausse, car on passe plus de temps à la vitesse la plus lente.`;
  const autres = [moy], g = Math.sqrt(v1 * v2);
  if (ent(g)) autres.push(g);
  return Q(q, vm, autres, kmh, k => vm + sg(k) * pasV(vm), expl, x => dec(x, 1));
}

/* 2b · Deux tronçons de durées différentes. */
function s2b(R){
  const mode = R.int(0, 1), DT = [30, 45, 60, 90, 120, 150, 180];
  let vh, v1, v2, t1, t2, ok = false;
  for (let i = 0; i < 400 && !ok; i++){
    vh = R.pick(VEH); v1 = R.pick(vh.v); v2 = R.pick(vh.v); t1 = R.pick(DT); t2 = R.pick(DT);
    ok = v1 !== v2 && t1 !== t2 && (v1 * t1) % 60 === 0 && (v2 * t2) % 60 === 0 && (v1 * t1 + v2 * t2) % (t1 + t2) === 0;
  }
  if (!ok){ vh = VEH[0]; v1 = 90; t1 = 120; v2 = 60; t2 = 60; }
  const d1 = v1 * t1 / 60, d2 = v2 * t2 / 60, vm = (v1 * t1 + v2 * t2) / (t1 + t2), moy = (v1 + v2) / 2;
  const q = mode === 0
    ? `${vh.n} ${vh.vb} pendant ${dur(t1)} à ${v1} km/h, puis pendant ${dur(t2)} à ${v2} km/h. Quelle est sa vitesse moyenne sur l'ensemble du trajet ?`
    : `${vh.n} parcourt ${nb(d1)} km en ${dur(t1)}, puis ${nb(d2)} km en ${dur(t2)}. Quelle est sa vitesse moyenne sur l'ensemble du trajet ?`;
  const expl = `Calcule la distance totale et la durée totale, puis divise l'une par l'autre. `
    + (mode === 0 ? `Distances : ${v1} × ${enH(t1)} = ${nb(d1)} km et ${v2} × ${enH(t2)} = ${nb(d2)} km. ` : '')
    + `Au total : ${nb(d1 + d2)} km en ${dur(t1 + t2)}${(t1 + t2) % 60 ? ', soit ' + enH(t1 + t2) + ' h' : ''}. Vitesse moyenne : ${nb(d1 + d2)} ÷ ${enH(t1 + t2)} = ${nb(vm)} km/h. Piège : la moyenne des deux vitesses, ${nb(moy)} km/h, oublie que les deux parties ne durent pas le même temps.`;
  return Q(q, vm, [moy, (d1 + d2) / 2, (v1 * t2 + v2 * t1) / (t1 + t2)], kmh, k => vm + sg(k) * pasV(vm), expl, x => dec(x, 1));
}

/* 2c · Rapprochement face à face : quand, ou où, se croisent-ils ? */
function s2c(R){
  const mode = R.int(0, 2);
  if (mode < 2){
    const VT = [60, 70, 80, 90, 100, 110, 120, 130, 140, 150], TT = [45, 60, 75, 80, 90, 100, 120, 150, 180];
    let v1, v2, T, ok = false;
    for (let i = 0; i < 400 && !ok; i++){
      v1 = R.pick(VT); v2 = R.pick(VT); T = R.pick(TT);
      ok = v1 < v2 && ((v1 + v2) * T) % 60 === 0 && (mode === 0 || (v1 * T) % 60 === 0);
    }
    if (!ok){ v1 = 70; v2 = 80; T = 120; }
    const D = (v1 + v2) * T / 60, veh = R.pick(['trains', 'cars', 'camions']);
    const ordre = R.int(0, 1) ? [v1, v2] : [v2, v1];
    const base = `Deux villes sont distantes de ${nb(D)} km. Deux ${veh} partent au même moment, l'un de chaque ville, et roulent l'un vers l'autre, l'un à ${ordre[0]} km/h et l'autre à ${ordre[1]} km/h.`;
    const e0 = `Quand deux mobiles vont l'un vers l'autre, leurs vitesses s'additionnent : c'est la vitesse de rapprochement. Ici ${v1} + ${v2} = ${v1 + v2} km/h : l'écart diminue de ${v1 + v2} km chaque heure. Temps : ${nb(D)} ÷ ${v1 + v2} = ${hs(T)}.`;
    if (mode === 0)
      return Q(base + ' Au bout de combien de temps se croisent-ils ?', T, [D * 60 / (v2 - v1), 2 * T, D * 60 / v2, D * 60 / v1], dur, k => T + sg(k) * 15,
        e0 + ' Piège : soustraire les vitesses ne sert que si les deux roulent dans le même sens.', x => ent(x));
    const x1 = v1 * T / 60;
    return Q(base + ' À quelle distance de la ville de départ du plus lent se croisent-ils ?', x1, [D / 2, v2 * T / 60], km, k => x1 + sg(k) * 10,
      e0 + ` Pendant ce temps, le plus lent parcourt ${v1} × ${enH(T)} = ${nb(x1)} km. Piège : ils ne se croisent pas au milieu, car le plus rapide fait plus de chemin.`, x => dec(x, 1));
  }
  const [p1, p2] = gens(R, 2);
  let w1, w2, T, ok = false;
  for (let i = 0; i < 200 && !ok; i++){
    w1 = R.pick([3, 4, 5, 6]); w2 = R.pick([3, 4, 5, 6]); T = R.pick([30, 40, 45, 60, 75, 80, 90, 120]);
    ok = w1 !== w2 && dec((w1 + w2) * T / 60, 1);
  }
  if (!ok){ w1 = 4; w2 = 5; T = 40; }
  const D = (w1 + w2) * T / 60, I = ils(p1, p2);
  const q = `${p1.nom} et ${p2.nom} habitent à ${nb(D)} km de distance. ${cap(I)} partent à pied au même moment, ${lun(p1, p2)} vers l'autre, ${p1.nom} à ${w1} km/h et ${p2.nom} à ${w2} km/h. Au bout de combien de temps se rencontrent-${I} ?`;
  const expl = `Quand deux personnes marchent l'une vers l'autre, leurs vitesses s'additionnent : c'est la vitesse de rapprochement. Ici ${w1} + ${w2} = ${w1 + w2} km/h. Temps : ${nb(D)} ÷ ${w1 + w2} = ${hs(T)}. Piège : prendre la moyenne des deux vitesses revient à faire marcher une seule personne, et double le temps.`;
  return Q(q, T, [w1 !== w2 ? D * 60 / Math.abs(w1 - w2) : null, 2 * T, D * 60 / Math.max(w1, w2)], dur, k => T + sg(k) * 10, expl, x => ent(x));
}

/* 2d · Débits cumulés, débit avec fuite, deux personnes au travail. */
function s2d(R){
  const mode = R.int(0, 2);
  if (mode === 0){
    let a, b, T, ok = false;
    for (let i = 0; i < 200 && !ok; i++){ a = R.pick([8, 10, 12, 15, 16, 18, 20, 25, 30]); b = R.pick([2, 3, 4, 5, 6]); T = R.pick([10, 12, 15, 20, 24, 25, 30, 40, 45, 50, 60]); ok = b < a; }
    if (!ok){ a = 12; b = 4; T = 30; }
    const V = (a - b) * T;
    const q = `Une cuve vide de ${nb(V)} litres se remplit grâce à un robinet qui débite ${a} litres par minute, mais une fuite en laisse échapper ${b} litres par minute. Combien de temps faut-il pour remplir la cuve ?`;
    const expl = `Calcule le débit réel, ce qui entre moins ce qui sort, puis divise le volume par ce débit. Débit réel : ${a} − ${b} = ${a - b} L/min. Temps : ${nb(V)} ÷ ${a - b} = ${T} min${T >= 60 ? ', soit ' + dur(T) : ''}. Piège : ajouter le débit de la fuite au lieu de le retrancher, ou l'oublier.`;
    return Q(q, T, [V / (a + b), V / a, V / b], dur, k => T + sg(k) * 5, expl, x => ent(x));
  }
  if (mode === 1){
    let a, b, T, ok = false;
    for (let i = 0; i < 200 && !ok; i++){ a = R.pick([4, 5, 6, 7, 8, 9, 10, 12, 15]); b = R.pick([3, 4, 5, 6, 8, 10]); T = R.pick([10, 12, 15, 20, 24, 25, 30, 40]); ok = a !== b; }
    if (!ok){ a = 7; b = 5; T = 25; }
    const V = (a + b) * T;
    const q = `Deux robinets débitent l'un ${a} litres par minute, l'autre ${b} litres par minute. Ouverts ensemble, en combien de temps remplissent-ils un bassin vide de ${nb(V)} litres ?`;
    const expl = `Quand deux robinets coulent ensemble, leurs débits s'additionnent. ${a} + ${b} = ${a + b} L/min, donc ${nb(V)} ÷ ${a + b} = ${T} min. Piège : faire la moyenne des deux durées séparées ne tient pas compte du fait que les deux robinets coulent en même temps.`;
    return Q(q, T, [V / Math.abs(a - b), V / a, V / b, (V / a + V / b) / 2], dur, k => T + sg(k) * 5, expl, x => ent(x));
  }
  const [p1, p2] = gens(R, 2), job = R.pick([['range', 'livres', 'ranger'], ['emballe', 'colis', 'emballer'], ['étiquette', 'bocaux', 'étiqueter'], ['plie', 'flyers', 'plier']]);
  let a, b, T, ok = false;
  for (let i = 0; i < 300 && !ok; i++){
    a = R.pick([20, 25, 30, 40, 45, 50, 60, 80, 90, 120]); b = R.pick([20, 25, 30, 40, 45, 50, 60, 80, 90, 120]); T = R.pick([45, 75, 90, 105, 135, 150, 210, 270]);
    ok = ((a + b) * T) % 60 === 0;
  }
  if (!ok){ a = 40; b = 60; T = 150; }
  const N = (a + b) * T / 60, hd = T / 60, fl = Math.floor(hd), fr = hd - fl, c = Math.round(fr * 100);
  const q = `${p1.nom} ${job[0]} ${a} ${job[1]} par heure, et ${p2.nom} en ${job[0]} ${b} par heure. Ensemble, combien de temps leur faut-il pour en ${job[2]} ${nb(N)} ?`;
  const lu = dec(hd, 2) && fr > 1e-9 ? fl * 60 + c : null;
  const expl = `Additionne ce que les deux font en une heure, puis divise la quantité totale par ce rythme commun. Ensemble : ${a} + ${b} = ${a + b} ${job[1]} par heure. Temps : ${nb(N)} ÷ ${a + b} = ${hs(T)}.`
    + (lu ? ` Piège : ${nb(hd)} h ne s'écrit pas ${fl ? fl + ' h ' + c + ' min' : c + ' min'}, car ${nb(fr)} h = ${Math.round(fr * 60)} min.` : ' Piège : il ne faut pas faire la moyenne des deux rythmes, mais les additionner.');
  return Q(q, T, [lu, N * 60 / a, N * 60 / b, a !== b ? N * 60 / Math.abs(a - b) : null], dur, k => T + sg(k) * 15, expl, x => ent(x));
}

/* 2e · Allure : minutes au kilomètre et vitesse. */
const ALLURES = [[120, 30], [144, 25], [150, 24], [180, 20], [200, 18], [225, 16], [240, 15], [300, 12], [360, 10], [400, 9], [450, 8], [480, 7.5]];
function s2e(R){
  const p = gens(R, 1)[0];
  if (R.int(0, 1)){
    const al = R.pick(ALLURES), s = al[0], v = al[1], m = Math.floor(s / 60), r = s % 60;
    const q = `${p.nom} court un kilomètre en ${durS(s)}. Quelle est sa vitesse moyenne, en km/h ?`;
    const autres = r ? [60 / m, 60 / (m + r / 100)] : [m, 100 / m];
    const expl = `Calcule combien de kilomètres seraient parcourus en une heure, c'est-à-dire en soixante minutes. ${durS(s)} = ${s} s pour 1 km ; une heure dure 3 600 s, donc ${p.il} parcourrait 3 600 ÷ ${s} = ${nb(v)} km en une heure : ${nb(v)} km/h.`
      + (r ? ` Piège : ${durS(s)} ne vaut pas ${m},${r} min ; et ignorer les ${r} s fausse le résultat.` : ` Piège : le nombre de minutes au kilomètre n'est pas une vitesse en km/h.`);
    return Q(q, v, autres, kmh, k => v + sg(k), expl, x => dec(x, 2));
  }
  let v, k, ts, ok = false;
  for (let i = 0; i < 200 && !ok; i++){ v = R.pick([10, 12, 15, 16, 18, 20, 24, 25, 30, 36, 40, 45]); k = R.pick([1, 2, 3, 4, 5]); ts = 3600 * k / v; ok = ent(ts) && ts >= 60 && ts <= 1800; }
  if (!ok){ v = 24; k = 1; ts = 150; }
  const tm = ts / 60, fl = Math.floor(tm), fr = tm - fl, c = Math.round(fr * 100);
  const lu = dec(tm, 2) && fr > 1e-9 ? fl * 60 + c : null;
  const q = v <= 16 ? `${p.nom} court à ${v} km/h de moyenne. Combien de temps lui faut-il pour parcourir ${k} km ?`
                    : `${p.nom} roule à vélo à ${v} km/h de moyenne. Combien de temps lui faut-il pour parcourir ${k} km ?`;
  const expl = `Cherche d'abord le temps pour un kilomètre en divisant une heure par la vitesse, puis multiplie par la distance. Une heure dure 3 600 s, donc 1 km prend 3 600 ÷ ${v} = ${3600 / v} s.`
    + (k > 1 ? ` Pour ${k} km : ${k} × ${3600 / v} = ${nb(ts)} s, soit ${durS(ts)}.` : ` Soit ${durS(ts)}.`)
    + (lu ? ` Piège : ${nb(tm)} min ne s'écrit pas ${fl} min ${c} s, car ${nb(fr)} min = ${Math.round(fr * 60)} s.` : ` Piège : diviser ${v} par 60 donne des kilomètres par minute, pas une durée.`);
  return Q(q, ts, [lu, 6000 * k / v, 3600 / (v * k)], durS, kk => ts + sg(kk) * 30, expl, x => ent(x));
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels
   ===================================================== */

const H_ENS = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30];
const M_ENS = [10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 90];

/* 3a · Deux robinets, deux machines ou deux personnes ensemble. */
function s3a(R){
  const [p1, p2] = gens(R, 2), ctx = R.int(0, 3), enMin = ctx === 1 || ctx === 3, L = enMin ? M_ENS : H_ENS, k = enMin ? 1 : 60;
  let a, b, ok = false;
  for (let i = 0; i < 400 && !ok; i++){ a = R.pick(L); b = R.pick(L); ok = a !== b && ent(k * a * b / (a + b)) && (!enMin || a * b / (a + b) >= 5); }
  if (!ok){ a = enMin ? 30 : 3; b = enMin ? 60 : 6; }
  const A_ = k * a, B_ = k * b, T = A_ * B_ / (A_ + B_), da = dur(A_), db = dur(B_);
  let q;
  if (ctx === 0) q = `Un premier robinet remplit une cuve en ${da}, un second robinet la remplit en ${db}. Si on ouvre les deux robinets en même temps, combien de temps faut-il pour remplir la cuve vide ?`;
  else if (ctx === 1) q = `Une imprimante imprime un lot de brochures en ${da}, une autre imprime le même lot en ${db}. En se partageant le travail, combien de temps mettent-elles pour imprimer ce lot ?`;
  else if (ctx === 2) q = `Seul${p1.e}, ${p1.nom} repeint une clôture en ${da}. Seul${p2.e}, ${p2.nom} la repeint en ${db}. En travaillant ensemble, ${accord([p1, p2], 'chacun')} à son rythme, combien de temps mettent-${ils(p1, p2)} pour la repeindre ?`;
  else q = `${p1.nom} tond une pelouse en ${da} avec sa tondeuse, ${p2.nom} tond la même pelouse en ${db} avec la sienne. Ensemble, ${accord([p1, p2], 'chacun')} avec sa tondeuse, combien de temps leur faut-il pour la tondre ?`;
  const u = enMin ? 'minute' : 'heure', s = somme([[1, a], [1, b]]);
  const expl = `Raisonne en fraction du travail faite en une ${u} : ces fractions s'additionnent, les durées non. En une ${u}, l'un fait 1/${a} du travail et l'autre 1/${b}. Ensemble : ${s.txt} du travail par ${u}. Il faut donc ${tps(s, u, T)}. Piège : la moyenne des durées ou leur somme n'a pas de sens ; à deux, on va forcément plus vite que le plus rapide seul.`;
  return Q(q, T, [(A_ + B_) / 2, A_ + B_, (A_ + B_) / 4, Math.min(A_, B_) / 2, Math.abs(A_ - B_)], dur, kk => T + sg(kk) * (enMin ? 2 : 15), expl, x => ent(x));
}

/* 3b · Remplissage malgré une vidange ouverte. */
function s3b(R){
  const ctx = R.int(0, 2), enMin = ctx === 1, k = enMin ? 1 : 60;
  const L = enMin ? [6, 8, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60] : [2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
  let a, b, ok = false;
  for (let i = 0; i < 400 && !ok; i++){ a = R.pick(L); b = R.pick(L); ok = a < b && ent(k * a * b / (b - a)) && a * b / (b - a) <= (enMin ? 180 : 40); }
  if (!ok){ a = enMin ? 10 : 4; b = enMin ? 15 : 6; }
  const A_ = k * a, B_ = k * b, T = A_ * B_ / (B_ - A_), da = dur(A_), db = dur(B_);
  const q = ctx === 0 ? `Un robinet remplit un bassin en ${da}. Ouverte, la bonde de vidange vide le bassin plein en ${db}. Le bassin est vide ; on ouvre le robinet en oubliant de fermer la bonde. Combien de temps faut-il pour remplir le bassin ?`
          : ctx === 1 ? `Un robinet remplit une baignoire en ${da}. Le siphon, resté ouvert, vide la baignoire pleine en ${db}. On ouvre le robinet sans fermer le siphon. En combien de temps la baignoire vide sera-t-elle pleine ?`
          : `Une pompe remplit un réservoir en ${da}, mais une fuite viderait le réservoir plein en ${db}. Le réservoir est vide au départ. Combien de temps faut-il à la pompe pour le remplir malgré la fuite ?`;
  const u = enMin ? 'minute' : 'heure', s = somme([[1, a], [-1, b]]);
  const expl = `Raisonne en fraction remplie par ${u} : ce qui entre moins ce qui sort. En une ${u}, l'arrivée remplit 1/${a} et la sortie vide 1/${b}. Bilan : ${s.txt} par ${u}. Il faut donc ${tps(s, u, T)}. Piège : additionner les deux fractions ferait travailler la sortie dans le même sens que l'arrivée ; le résultat doit être plus long que ${da}.`;
  return Q(q, T, [A_ * B_ / (A_ + B_), B_ - A_, (A_ + B_) / 2, A_ + B_], dur, kk => T + sg(kk) * (enMin ? 5 : 30), expl, x => ent(x));
}

/* 3c · Retrouver le temps d'un seul à partir du temps à deux. */
function s3c(R){
  const [p1, p2] = gens(R, 2), ctx = R.int(0, 2), enMin = ctx === 2, k = enMin ? 1 : 60;
  const LA = enMin ? [10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60] : [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30];
  const LT = enMin ? [6, 8, 9, 10, 12, 15, 18, 20, 24, 30] : [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 20];
  let a, T, ok = false;
  for (let i = 0; i < 400 && !ok; i++){
    a = R.pick(LA); T = R.pick(LT);
    if (a <= T) continue;
    const B = a * T / (a - T);
    ok = ent(k * B) && B !== a && B <= (enMin ? 180 : 60);
  }
  if (!ok){ a = enMin ? 30 : 6; T = enMin ? 20 : 4; }
  const A_ = k * a, T_ = k * T, B_ = A_ * T_ / (A_ - T_);
  const q = ctx === 0 ? `À deux, ${p1.nom} et ${p2.nom} repeignent une clôture en ${dur(T_)}. Seul${p1.e}, ${p1.nom} mettrait ${dur(A_)}. Combien de temps mettrait ${p2.nom}, seul${p2.e} ?`
          : ctx === 1 ? `Deux robinets ouverts ensemble remplissent une cuve en ${dur(T_)}. Le premier, seul, la remplit en ${dur(A_)}. En combien de temps le second, seul, remplit-il la cuve ?`
          : `Deux imprimantes travaillant ensemble impriment un rapport en ${dur(T_)}. La première, seule, met ${dur(A_)}. Combien de temps mettrait la seconde, seule ?`;
  const u = enMin ? 'minute' : 'heure', s = somme([[1, T], [-1, a]]);
  const X = ctx === 0 ? p1.nom + ' seul' + p1.e : ctx === 1 ? 'le premier robinet seul' : 'la première imprimante seule';
  const Y = ctx === 0 ? p2.nom : ctx === 1 ? 'Le second robinet' : 'La seconde imprimante';
  const expl = `Pars des fractions de travail par ${u} : le rythme commun moins le rythme connu donne le rythme cherché. Ensemble : 1/${T} du travail par ${u} ; ${X} : 1/${a}. ${Y} fait donc ${s.txt} par ${u}, et il lui faut ${tps(s, u, B_)}. Vérification : 1/${a} + ${frac(s.n, s.d)} = 1/${T}. Piège : la différence des durées ne donne pas le bon résultat.`;
  return Q(q, B_, [A_ - T_, A_ + T_, A_ * T_ / (A_ + T_), 2 * T_], dur, kk => B_ + sg(kk) * (enMin ? 5 : 30), expl, x => ent(x));
}

/* 3d · Poursuite : à quelle heure, ou à quelle distance, le plus rapide rattrape-t-il le plus lent ? */
const POURSUITE = [
  { lent: 'à vélo', vl: 'roule', v1: [15, 16, 18, 20, 24], rapide: 'en voiture', v2: [45, 48, 50, 60, 72, 80, 90] },
  { lent: 'à pied', vl: 'marche', v1: [4, 5, 6], rapide: 'à vélo', v2: [12, 15, 16, 18, 20] },
  { lent: 'en camion', vl: 'roule', v1: [60, 70, 72, 75, 80], rapide: 'en voiture', v2: [90, 96, 100, 105, 110, 120] }
];
function s3d(R){
  const [p1, p2] = gens(R, 2), mode = R.int(0, 1), lieu = R.pick(LIEUX);
  let P, v1, v2, D, tc, ok = false;
  for (let i = 0; i < 500 && !ok; i++){
    P = R.pick(POURSUITE); v1 = R.pick(P.v1); v2 = R.pick(P.v2); D = R.pick([20, 30, 40, 45, 60, 90]);
    tc = v1 * D / (v2 - v1);
    ok = v2 > v1 && ent(tc) && tc >= 5 && tc <= 240 && dec(v2 * tc / 60, 1) && dec(v1 * D / 60, 1);
  }
  if (!ok){ P = POURSUITE[0]; v1 = 20; v2 = 60; D = 60; tc = 30; }
  const h0 = R.pick([420, 450, 480, 495, 540, 600, 810, 840]), av = v1 * D / 60, dist = v2 * tc / 60;
  const base = `${p1.nom} quitte ${lieu[0]} à ${heure(h0)}, ${P.lent}, et ${P.vl} à ${v1} km/h. ${p2.nom} quitte le même endroit à ${heure(h0 + D)}, ${P.rapide}, et roule à ${v2} km/h, sur la même route et dans le même sens.`;
  const expl = `Calcule l'avance prise par le plus lent, puis divise-la par la différence des vitesses : c'est la vitesse à laquelle l'écart se réduit. Quand ${p2.nom} part, ${p1.nom} est en route depuis ${dur(D)} : son avance vaut ${v1} × ${enH(D)} = ${nb(av)} km. L'écart se réduit de ${v2} − ${v1} = ${v2 - v1} km par heure, donc il faut ${nb(av)} ÷ ${v2 - v1} = ${hs(tc)}.`;
  if (mode === 0)
    return Q(base + ` À quelle heure ${p2.nom} rattrape-t-${p2.il} ${p1.nom} ?`, h0 + D + tc, [h0 + D + v1 * D / (v1 + v2), h0 + tc, h0 + D + v1 * D / v2], heure, k => h0 + D + tc + sg(k) * 10,
      expl + ` ${p2.nom} rattrape ${p1.nom} à ${heure(h0 + D)} + ${dur(tc)} = ${heure(h0 + D + tc)}. Piège : additionner les vitesses ne sert que si les deux vont l'un vers l'autre, et le temps de poursuite se compte à partir du second départ.`,
      x => ent(x) && x > h0 + D);
  return Q(base + ` À quelle distance ${lieu[1]} ${p2.nom} rattrape-t-${p2.il} ${p1.nom} ?`, dist, [av, v1 * tc / 60, v2 * (D + tc) / 60], km, k => dist + sg(k) * pasV(dist),
    expl + ` Pendant ce temps, ${p2.nom} parcourt ${v2} × ${enH(tc)} = ${nb(dist)} km. Piège : l'avance de départ (${nb(av)} km) n'est pas la distance du rattrapage.`, x => dec(x, 1));
}

/* 3e · Vitesse du retour pour atteindre une moyenne visée. */
function s3e(R){
  const p = gens(R, 1)[0], ctx = R.int(0, 2);
  const C = [
    { m: 'en voiture', v1: [30, 40, 45, 50, 60, 70, 75, 80, 90], vm: [36, 40, 45, 48, 50, 56, 60, 63, 70, 72, 75, 80, 84, 90, 96, 100, 105, 120], max: 150, sec: [30, 40] },
    { m: 'à vélo', v1: [10, 12, 15, 16, 18, 20, 24], vm: [12, 14, 15, 16, 18, 20, 21, 24, 28, 30, 32], max: 60, sec: [12, 16] },
    { m: 'en courant', v1: [6, 8, 9, 10, 12], vm: [7, 8, 9, 10, 12, 14, 15], max: 20, sec: [6, 8] }
  ][ctx];
  let v1, vm, v2, ok = false;
  for (let i = 0; i < 500 && !ok; i++){
    v1 = R.pick(C.v1); vm = R.pick(C.vm);
    if (vm <= v1 || vm >= 2 * v1) continue;
    v2 = v1 * vm / (2 * v1 - vm);
    ok = ent(v2) && v2 <= C.max;
  }
  if (!ok){ v1 = C.sec[0]; vm = C.sec[1]; v2 = v1 * vm / (2 * v1 - vm); }
  const d = ppcm(v1, vm / pgcd(vm, 2)), ta = d / v1, tt = 2 * d / vm, tr = tt - ta;
  const q = `${p.nom} fait l'aller jusqu'à ${R.pick(DEST2)} ${C.m}, à ${v1} km/h de moyenne. À quelle vitesse moyenne doit-${p.il} faire le retour, par le même chemin, pour que sa vitesse moyenne sur l'aller-retour soit de ${vm} km/h ?`;
  const expl = `Prends une distance commode, puis compare le temps total permis au temps déjà passé à l'aller. Avec ${nb(d)} km dans chaque sens : l'aller prend ${ta} h ; pour une moyenne de ${vm} km/h, les ${nb(2 * d)} km doivent prendre ${tt} h en tout. Il reste ${tr} h pour le retour : ${nb(d)} ÷ ${tr} = ${nb(v2)} km/h. Piège : ${nb(2 * vm - v1)} km/h donnerait ${vm} comme moyenne des deux vitesses, mais la vitesse moyenne se calcule avec le temps total.`;
  return Q(q, v2, [2 * vm - v1, 2 * vm, v1 + vm], kmh, k => v2 + sg(k) * pasV(v2), expl, x => dec(x, 1));
}

/* 3f · Règle de trois composée : plus de machines, plus de travail. */
const RT = [
  { pl: 'imprimantes identiques', court: 'imprimantes', vb: 'impriment', inf: 'imprimer', obj: 'pages', objS: 'page', u: 'min', c: [10, 12, 15, 20, 25, 30], t: [4, 5, 6, 8, 10, 12, 15, 20], une: 'une seule imprimante', vbs: 'imprime' },
  { pl: 'peintres', court: 'peintres', vb: 'repeignent', inf: 'repeindre', obj: 'salles de classe', objS: 'salle de classe', u: 'j', c: [0.5, 0.25, 0.2], t: [2, 3, 4, 5, 6, 8, 10, 12, 15], une: 'un seul peintre', vbs: 'repeint' },
  { pl: 'robots identiques', court: 'robots', vb: 'préparent', inf: 'préparer', obj: 'colis', objS: 'colis', u: 'min', c: [2, 3, 4, 5, 6], t: [5, 6, 8, 10, 12, 15, 20, 30], une: 'un seul robot', vbs: 'prépare' },
  { pl: 'moissonneuses identiques', court: 'moissonneuses', vb: 'récoltent', inf: 'récolter', obj: 'hectares', objS: 'hectare', u: 'h', c: [2, 3, 4, 5], t: [2, 3, 4, 5, 6, 8, 10], une: 'une seule moissonneuse', vbs: 'récolte' }
];
const UNIT = { min: ['minute', 'une seule minute'], h: ['heure', 'une seule heure'], j: ['jour', 'un seul jour'] };
function s3f(R){
  let C, c, n1, n2, t1, t2, P1, P2, ok = false;
  for (let i = 0; i < 500 && !ok; i++){
    C = R.pick(RT); c = R.pick(C.c); n1 = R.int(2, 8); n2 = R.int(2, 8); t1 = R.pick(C.t); t2 = R.pick(C.t);
    P1 = c * n1 * t1; P2 = c * n2 * t2;
    ok = n1 !== n2 && t1 !== t2 && ent(P1) && ent(P2) && Math.round(P1) !== Math.round(P2) && P1 >= 2 && P2 >= 2;
  }
  if (!ok){ C = RT[0]; c = 15; n1 = 4; t1 = 10; n2 = 6; t2 = 20; P1 = 600; P2 = 1800; }
  P1 = Math.round(P1); P2 = Math.round(P2);
  const f = C.u === 'min' ? (x => dur(x)) : C.u === 'h' ? (x => dur(60 * x)) : jours;
  const U = UNIT[C.u], okT = x => C.u === 'h' ? ent(60 * x) : C.u === 'j' ? dec(x, 1) : ent(x);
  const q = `${n1} ${C.pl} ${C.vb} ${nb(P1)} ${C.obj} en ${f(t1)}. Au même rythme, combien de temps faut-il à ${n2} de ces ${C.court} pour ${C.inf} ${nb(P2)} ${C.obj} ?`;
  const r2 = n2 * c;
  const expl = `Ramène tout au travail d'${C.une} pendant ${U[1]} : c'est le rythme de base. Ainsi, ${C.une.replace(' seule ', ' ').replace(' seul ', ' ')} ${C.vbs} ${nb(P1)} ÷ (${n1} × ${t1}) = ${nb(c)} ${c < 2 ? C.objS : C.obj} par ${U[0]}. Les ${n2} ${C.court} en ${C.vb} donc ${nb(r2)} par ${U[0]}, et il faut ${nb(P2)} ÷ ${nb(r2)} = ${C.u === 'min' ? t2 + ' min' + (t2 >= 60 ? ', soit ' + dur(t2) : '') : C.u === 'h' ? t2 + ' h' : jours(t2)}. Piège : plus il y a de ${C.court}, moins il faut de temps ; multiplier par ${n2}/${n1} au lieu de ${n1}/${n2} inverse la proportion.`;
  return Q(q, t2, [t1 * (P2 / P1) * (n2 / n1), t1 * P2 / P1, t1 * n1 / n2], f, k => t2 + sg(k) * Math.max(1, Math.round(t2 / 5)), expl, okT);
}

/* =====================================================
   NIVEAU 4 · plus difficile que les exemples officiels
   ===================================================== */

/* 4a · Trois robinets, trois personnes ou trois machines ensemble. */
function s4a(R){
  const ctx = R.int(0, 2), enMin = ctx === 2, k = enMin ? 1 : 60;
  const L = enMin ? [10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 90] : [2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60];
  let a, b, c, T, ok = false;
  for (let i = 0; i < 600 && !ok; i++){
    a = R.pick(L); b = R.pick(L); c = R.pick(L);
    if (!(a < b && b < c)) continue;
    T = k * a * b * c / (a * b + b * c + a * c);
    ok = ent(T) && T >= (enMin ? 4 : 30);
  }
  if (!ok){ if (enMin){ a = 10; b = 15; c = 30; } else { a = 6; b = 10; c = 15; } T = k * a * b * c / (a * b + b * c + a * c); }
  const o = R.shuffle([a, b, c]), [p1, p2, p3] = gens(R, 3);
  const q = ctx === 0 ? `Trois robinets remplissent chacun, seuls, la même cuve : le premier en ${dur(k * o[0])}, le deuxième en ${dur(k * o[1])}, le troisième en ${dur(k * o[2])}. En combien de temps remplissent-ils la cuve vide s'ils coulent tous les trois ensemble ?`
          : ctx === 1 ? `Pour ranger le gymnase, ${p1.nom} mettrait seul${p1.e} ${dur(k * o[0])}, ${p2.nom} seul${p2.e} ${dur(k * o[1])} et ${p3.nom} seul${p3.e} ${dur(k * o[2])}. Combien de temps mettent-${ils(p1, p2, p3)} à trois, ${accord([p1, p2, p3], 'chacun')} gardant son rythme ?`
          : `Trois imprimantes impriment chacune, seule, le même document : la première en ${dur(o[0])}, la deuxième en ${dur(o[1])}, la troisième en ${dur(o[2])}. En se partageant le travail, combien de temps mettent-elles ?`;
  const u = enMin ? 'minute' : 'heure', s = somme([[1, o[0]], [1, o[1]], [1, o[2]]]), A_ = k * a, B_ = k * b, C_ = k * c;
  const expl = `Additionne les fractions du travail faites en une ${u} par chacun, puis prends l'inverse du total. En une ${u} : ${s.txt} du travail. Il faut donc ${tps(s, u, T)}. Piège : diviser la durée moyenne par trois suppose que les trois vont au même rythme, et à trois on va plus vite qu'à deux.`;
  return Q(q, T, [(A_ + B_ + C_) / 9, (A_ + B_ + C_) / 3, A_ * B_ / (A_ + B_), A_ / 3], dur, kk => T + sg(kk) * (enMin ? 1 : 10), expl, x => ent(x));
}

/* 4b · L'un commence seul puis l'autre le rejoint, ou l'un part avant la fin. */
function s4b(R){
  const [p1, p2] = gens(R, 2), mode = R.int(0, 2);
  if (mode < 2){
    let a, b, k, ok = false;
    for (let i = 0; i < 400 && !ok; i++){
      a = R.pick([3, 4, 5, 6, 8, 9, 10, 12]); b = R.pick([2, 3, 4, 5, 6, 8, 12]); k = R.pick([1, 2, 3]);
      ok = k < a && a !== b && ent(60 * (a - k) * b / (a + b));
    }
    if (!ok){ a = 6; b = 3; k = 1; }
    const ph = 60 * (a - k) * b / (a + b), T = 60 * k + ph, ens = 60 * a * b / (a + b);
    const q = mode === 0
      ? `Un premier robinet remplit une cuve en ${dur(60 * a)}, un second en ${dur(60 * b)}. On ouvre d'abord le premier seul pendant ${dur(60 * k)}, puis on ouvre aussi le second. Combien de temps faut-il en tout, depuis l'ouverture du premier, pour remplir la cuve vide ?`
      : `${p1.nom} commence seul${p1.e} à ranger la réserve, un travail qu'${p1.il} ferait seul${p1.e} en ${dur(60 * a)}. Au bout de ${dur(60 * k)}, ${p2.nom}, qui ferait seul${p2.e} ce travail en ${dur(60 * b)}, vient l'aider. Combien de temps dure le rangement en tout ?`;
    const s = somme([[1, a], [1, b]]), reste = frac(a - k, a), qui = mode === 0 ? 'le premier robinet' : p1.nom;
    const expl = `Calcule d'abord la part du travail faite pendant la période en solo, puis le temps qu'il faut à deux pour finir le reste. En ${dur(60 * k)}, ${qui} fait ${frac(k, a)} du travail ; il reste ${reste}. À deux : ${s.txt} du travail par heure. Pour le reste : ${reste} ÷ ${frac(s.n, s.d)} = ${hs(ph)}. Total : ${dur(60 * k)} + ${dur(ph)} = ${dur(T)}. Piège : ajouter ${dur(60 * k)} au temps qu'il faudrait à deux depuis le début${ent(ens) ? ' (' + dur(ens) + ')' : ''} oublie que ${qui} a déjà fait une partie du travail.`;
    return Q(q, T, [60 * k + ens, ens, ph], dur, kk => T + sg(kk) * 10, expl, x => ent(x));
  }
  let a, b, k, F, ok = false;
  for (let i = 0; i < 400 && !ok; i++){
    a = R.pick([4, 5, 6, 8, 9, 10, 12]); b = R.pick([3, 4, 5, 6, 8, 10, 12]); k = R.pick([1, 2]);
    F = 1 - k / a - k / b;
    ok = a !== b && F > 1e-9 && ent(60 * k * a / b);
  }
  if (!ok){ a = 6; b = 3; k = 1; F = 1 - k / a - k / b; }
  const tA = 60 * (a - k) - 60 * k * a / b, T = 60 * k + tA;
  const q = `${p1.nom} et ${p2.nom} commencent ensemble à repeindre un mur. Seul${p1.e}, ${p1.nom} mettrait ${dur(60 * a)} ; seul${p2.e}, ${p2.nom} mettrait ${dur(60 * b)}. Au bout de ${dur(60 * k)}, ${p2.nom} doit partir et ${p1.nom} termine seul${p1.e}. Combien de temps a duré le travail en tout ?`;
  const s = somme([[1, a], [1, b]]), fait = frac(k * s.n, s.d), reste = frac(s.d - k * s.n, s.d);
  const expl = `Calcule la part faite à deux, puis le temps nécessaire pour finir le reste en solo. À deux : ${s.txt} du travail par heure ; en ${dur(60 * k)}, ils en font ${fait}. Il reste ${reste}, que ${p1.nom} fait seul${p1.e} à raison de 1/${a} par heure : ${reste} × ${a} = ${hs(tA)}. Total : ${dur(60 * k)} + ${dur(tA)} = ${dur(T)}. Piège : faire finir le travail par ${p2.nom} au lieu de ${p1.nom}, ou compter comme si le travail se faisait à deux jusqu'au bout.`;
  return Q(q, T, [60 * a * b / (a + b), 60 * a, 60 * k + 60 * b * F], dur, kk => T + sg(kk) * 10, expl, x => ent(x));
}

/* 4c · Tapis roulant et escalator. */
const S4 = [20, 24, 30, 36, 40, 45, 60, 72, 80, 90, 120, 180];
function s4c(R){
  const p = gens(R, 1)[0], mode = R.int(0, 2);
  let a, b, T, ok = false;
  for (let i = 0; i < 500 && !ok; i++){
    a = R.pick(S4); b = R.pick(S4);
    if (mode === 0){ T = a * b / (a + b); ok = a !== b && ent(T); }
    else { T = a * b / (b - a); ok = a < b && ent(T) && T <= 300; }
  }
  if (!ok){ if (mode === 0){ a = 60; b = 40; T = 24; } else { a = 40; b = 60; T = 120; } }
  if (mode === 0){
    const q = `Dans un aéroport, ${p.nom} met ${durS(a)} pour longer un tapis roulant en marchant à côté. Immobile sur le tapis en marche, ${p.il} met ${durS(b)}. Combien de temps met-${p.il} en marchant sur le tapis en marche, à son pas habituel ?`;
    const s = somme([[1, a], [1, b]]);
    const expl = `Raisonne en fraction de la longueur parcourue chaque seconde : dans le sens du tapis, les vitesses s'additionnent. En une seconde, la marche fait 1/${a} de la longueur et le tapis 1/${b}. Ensemble : ${s.txt} par seconde, il faut donc ${T < 60 ? durS(T) : T + ' s, soit ' + durS(T)}. Piège : la moyenne des deux durées est absurde, car en marchant sur le tapis on va plus vite que chacun des deux seuls.`;
    return Q(q, T, [(a + b) / 2, a + b, a * b / Math.abs(b - a), Math.abs(a - b)], durS, k => T + sg(k) * 2, expl, x => ent(x));
  }
  const s = somme([[1, a], [-1, b]]);
  if (mode === 1){
    const q = `En marchant sur un tapis roulant en marche, ${p.nom} le parcourt en ${durS(a)}. Immobile sur ce tapis, ${p.il} le parcourt en ${durS(b)}. Combien de temps mettrait-${p.il} pour parcourir la même longueur en marchant à côté du tapis, à son pas habituel ?`;
    const expl = `Raisonne en fraction de la longueur parcourue chaque seconde : la marche seule est la différence entre la marche sur le tapis et le tapis seul. Marche et tapis ensemble : 1/${a} par seconde ; tapis seul : 1/${b}. Marche seule : ${s.txt} par seconde, soit ${durS(T)} pour toute la longueur. Piège : la différence des durées ne veut rien dire, il faut soustraire les fractions.`;
    return Q(q, T, [a * b / (a + b), b - a, a + b, (a + b) / 2], durS, k => T + sg(k) * 5, expl, x => ent(x));
  }
  const q = `Un escalator qui descend amène une personne immobile du haut en bas en ${durS(b)}. Si l'escalator était à l'arrêt, ${p.nom} le monterait à pied en ${durS(a)}. Combien de temps lui faut-il pour le monter à pied, à ce même pas, pendant qu'il descend ?`;
  const expl = `Raisonne en fraction de la longueur parcourue chaque seconde : à contre-sens, la vitesse de l'escalator se retranche de celle de la marche. Montée à pied : 1/${a} par seconde ; l'escalator ramène 1/${b} par seconde. Bilan : ${s.txt} par seconde, soit ${durS(T)}. Piège : additionner les deux fractions reviendrait à monter sur un escalator qui monte.`;
  return Q(q, T, [a * b / (a + b), b - a, a + b, (a + b) / 2], durS, k => T + sg(k) * 5, expl, x => ent(x));
}

/* 4d · Bateau et courant, avion et vent. */
function s4d(R){
  const mode = R.int(0, 2);
  if (mode === 0){
    let vb, vc, d, ok = false;
    for (let i = 0; i < 500 && !ok; i++){
      vb = R.int(8, 30); vc = R.int(1, 6); d = R.pick([12, 15, 18, 20, 24, 30, 36, 40, 45, 48, 60, 72, 80, 90, 96, 120]);
      ok = 2 * vc < vb && ent(60 * d / (vb + vc)) && ent(60 * d / (vb - vc)) && d / (vb - vc) <= 8 && d / (vb + vc) >= 0.5;
    }
    if (!ok){ vb = 15; vc = 3; d = 36; }
    const t1 = 60 * d / (vb + vc), t2 = 60 * d / (vb - vc), askC = R.int(0, 1) === 1;
    const q = `Un bateau descend une rivière sur ${d} km en ${dur(t1)}, puis remonte ces ${d} km en ${dur(t2)}. Sa vitesse en eau calme et celle du courant restent constantes. Quelle est la vitesse ${askC ? 'du courant' : 'du bateau en eau calme'} ?`;
    let expl = `En descendant, la vitesse du courant s'ajoute à celle du bateau ; en remontant, elle se retranche. Descente : ${d} ÷ ${enH(t1)} = ${vb + vc} km/h ; montée : ${d} ÷ ${enH(t2)} = ${vb - vc} km/h. Ainsi bateau + courant = ${vb + vc} et bateau − courant = ${vb - vc}. `;
    expl += askC ? `La différence vaut deux fois le courant : (${vb + vc} − ${vb - vc}) ÷ 2 = ${vc} km/h. Piège : ${2 * vc} km/h est le double du courant, on oublie souvent de diviser par deux.`
                 : `La somme vaut deux fois la vitesse du bateau : (${vb + vc} + ${vb - vc}) ÷ 2 = ${vb} km/h. Piège : ${vb + vc} km/h est la vitesse à la descente, aidée par le courant.`;
    return askC ? Q(q, vc, [2 * vc, vb, vb - vc], kmh, k => vc + sg(k), expl, x => dec(x, 1))
                : Q(q, vb, [vb + vc, vb - vc, 2 * vb, vc], kmh, k => vb + sg(k), expl, x => dec(x, 1));
  }
  const avion = mode === 2;
  let vb, vc, d, ok = false;
  for (let i = 0; i < 500 && !ok; i++){
    if (avion){ vb = R.pick([150, 180, 200, 210, 240, 250, 300]); vc = R.pick([20, 25, 30, 40, 50, 60]); d = R.pick([100, 120, 150, 180, 200, 240, 270, 300, 360, 450, 600]); }
    else { vb = R.int(10, 30); vc = R.int(2, 8); d = R.pick([12, 15, 18, 20, 21, 24, 30, 36, 40, 42, 45, 48, 60, 72]); }
    ok = 2 * vc < vb && ent(60 * d / (vb + vc)) && ent(60 * d / (vb - vc)) && d / (vb - vc) <= 8;
  }
  if (!ok){ if (avion){ vb = 250; vc = 50; d = 300; } else { vb = 15; vc = 3; d = 36; } }
  const ta = 60 * d / (vb + vc), tr = 60 * d / (vb - vc), T = ta + tr;
  const q = avion
    ? `Un petit avion vole à ${vb} km/h quand il n'y a pas de vent. Un jour de vent constant à ${vc} km/h, il parcourt ${d} km avec le vent dans le dos, puis revient à son point de départ face au vent. Combien de temps dure l'aller-retour ?`
    : `Un bateau avance à ${vb} km/h en eau calme. Sur une rivière dont le courant vaut ${vc} km/h, il descend ${d} km, puis remonte jusqu'à son point de départ. Combien de temps dure l'aller-retour ?`;
  const mot = avion ? 'vent' : 'courant', s2 = 120 * d / vb;
  const expl = `Calcule séparément l'aller et le retour, car le ${mot} aide dans un sens et freine dans l'autre. Aller : ${d} ÷ (${vb} + ${vc}) = ${d} ÷ ${vb + vc} = ${enH(ta)} h ; retour : ${d} ÷ (${vb} − ${vc}) = ${d} ÷ ${vb - vc} = ${enH(tr)} h. Total : ${dur(ta)} + ${dur(tr)} = ${dur(T)}. Piège : croire que le ${mot} se compense ${ent(s2) ? 'donne ' + dur(s2) : 'fausse le résultat'} ; en réalité, on passe plus de temps à lutter contre lui.`;
  return Q(q, T, [s2, 120 * d / (vb + vc), 120 * d / (vb - vc)], dur, k => T + sg(k) * 10, expl, x => ent(x));
}

/* 4e · Train, tunnel, poteau et pont. */
const VT4 = [36, 54, 72, 90, 108, 144, 180, 216];
function s4e(R){
  if (R.int(0, 1)){
    let v, u, L, T, t, ok = false;
    for (let i = 0; i < 500 && !ok; i++){
      v = R.pick(VT4); u = v * 10 / 36; L = R.pick([100, 120, 150, 180, 200, 240, 250, 300, 400]);
      T = R.pick([300, 400, 500, 600, 800, 900, 1000, 1200, 1500, 1800, 2000, 2400]); t = (L + T) / u;
      ok = ent(t) && T > L && t <= 300;
    }
    if (!ok){ v = 72; u = 20; L = 200; T = 1000; t = 60; }
    const q = `Un train de ${L} m de long roule à ${v} km/h. Combien de temps s'écoule-t-il entre l'instant où l'avant du train entre dans un tunnel de ${nb(T, 0)} m et celui où l'arrière du train en sort ?`;
    const t0 = T / u;
    const expl = `Pour sortir entièrement, l'arrière du train doit parcourir la longueur du tunnel plus celle du train, et il faut une vitesse en mètres par seconde. ${v} km/h = ${v} ÷ 3,6 = ${u} m/s. Distance à parcourir : ${nb(T, 0)} + ${L} = ${nb(T + L, 0)} m. Temps : ${nb(T + L, 0)} ÷ ${u} = ${t} s${t >= 60 ? ', soit ' + durS(t) : ''}. Piège : oublier la longueur du train ${ent(t0) ? 'donne ' + durS(t0) : 'donne un temps trop court'}.`;
    return Q(q, t, [t0, (T - L) / u, (L + T) / (u * 3.6)], durS, k => t + sg(k) * 5, expl, x => ent(x));
  }
  let u, s, T, ok = false;
  for (let i = 0; i < 300 && !ok; i++){ u = R.pick([10, 15, 20, 25, 30]); s = R.pick([6, 8, 10, 12, 15, 20]); T = R.pick([300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500]); ok = T % u === 0; }
  if (!ok){ u = 20; s = 10; T = 600; }
  const L = u * s, t = s + T / u;
  const q = `Un train roulant à vitesse constante met ${s} s pour passer entièrement devant un poteau, et ${t} s pour franchir entièrement un pont de ${nb(T, 0)} m, de l'entrée de l'avant à la sortie de l'arrière. Quelle est la longueur du train ?`;
  const expl = `Devant le poteau, le train ne parcourt que sa propre longueur ; sur le pont, il parcourt sa longueur plus celle du pont : la différence des durées correspond au pont seul. Le pont seul prend ${t} − ${s} = ${t - s} s, donc la vitesse vaut ${nb(T, 0)} ÷ ${t - s} = ${u} m/s. Longueur du train : ${u} × ${s} = ${L} m. Piège : la règle de trois ${nb(T, 0)} × ${s} ÷ ${t} oublie que le train doit aussi parcourir sa propre longueur.`;
  return Q(q, L, [T * s / t, L + T, Math.abs(T - L), u * t], metres, k => L + sg(k) * 20, expl, x => ent(x));
}

/* 4f · Le chien qui court entre deux marcheurs. */
function s4f(R){
  const [p1, p2] = gens(R, 2);
  let w1, w2, Th, vd, D, dist, ok = false;
  for (let i = 0; i < 300 && !ok; i++){
    w1 = R.pick([3, 4, 5, 6]); w2 = R.pick([3, 4, 5, 6]); Th = R.pick([30, 45, 60, 90, 120]); vd = R.pick([15, 16, 18, 20, 24]);
    D = (w1 + w2) * Th / 60; dist = vd * Th / 60;
    ok = dec(D, 1) && dec(dist, 1);
  }
  if (!ok){ w1 = 4; w2 = 5; Th = 60; vd = 15; D = 9; dist = 15; }
  const l = lun(p1, p2);
  const q = `${p1.nom} et ${p2.nom} sont à ${nb(D)} km ${l} de l'autre et marchent ${l} vers l'autre, ${p1.nom} à ${w1} km/h et ${p2.nom} à ${w2} km/h. Au départ, le chien de ${p1.nom} s'élance vers ${p2.nom} à ${vd} km/h ; arrivé auprès de ${p2.nom}, il fait demi-tour vers ${p1.nom}, et ainsi de suite, jusqu'à ce que les deux marcheurs se rejoignent. Quelle distance totale le chien a-t-il parcourue ?`;
  const expl = `Ne suis pas les allers-retours du chien : cherche plutôt pendant combien de temps il court. Les marcheurs se rapprochent à ${w1} + ${w2} = ${w1 + w2} km/h, donc ils se rejoignent au bout de ${nb(D)} ÷ ${w1 + w2} = ${enH(Th)} h. Le chien court pendant tout ce temps : ${vd} × ${enH(Th)} = ${nb(dist)} km. Piège : le chien court plus vite que les deux marcheurs ne se rapprochent, il parcourt donc plus que les ${nb(D)} km qui les séparaient.`;
  return Q(q, dist, [D, 2 * dist, dist / 2, D * vd / (vd + w2)], km, k => dist + sg(k) * 2, expl, x => dec(x, 2));
}

/* 4g · Deux départs décalés, face à face : à quelle heure se croisent-ils ? */
function s4g(R){
  let v1, v2, De, Tc, D, ok = false;
  for (let i = 0; i < 500 && !ok; i++){
    v1 = R.pick([50, 60, 70, 75, 80, 90, 100, 120]); v2 = R.pick([50, 60, 70, 75, 80, 90, 100, 120]);
    De = R.pick([30, 45, 60, 90, 120]); Tc = R.pick([30, 45, 60, 75, 90, 105, 120, 150]);
    D = (v1 * (De + Tc) + v2 * Tc) / 60;
    ok = ent(D) && ent(v1 * De / 60);
  }
  if (!ok){ v1 = 70; v2 = 90; De = 60; Tc = 60; D = 230; }
  const V = R.shuffle(R.pick(VILLES)), h1 = R.pick([420, 450, 480, 510, 540, 600, 780, 840]), a1 = v1 * De / 60;
  const q = `Les villes de ${V[0]} et de ${V[1]} sont distantes de ${D} km par la route. Un car part de ${V[0]} à ${heure(h1)} en direction de ${V[1]}, et roule à ${v1} km/h. Un autre car part de ${V[1]} à ${heure(h1 + De)} en direction de ${V[0]}, par la même route, et roule à ${v2} km/h. À quelle heure les deux cars se croisent-ils ?`;
  const expl = `Traite d'abord la période où un seul car roule, puis utilise la vitesse de rapprochement. De ${heure(h1)} à ${heure(h1 + De)}, le premier car parcourt ${v1} × ${enH(De)} = ${a1} km ; il reste ${D - a1} km entre les deux cars. Ensuite, ils se rapprochent à ${v1} + ${v2} = ${v1 + v2} km/h : ${D - a1} ÷ ${v1 + v2} = ${hs(Tc)}. Ils se croisent à ${heure(h1 + De)} + ${dur(Tc)} = ${heure(h1 + De + Tc)}. Piège : diviser directement ${D} par ${v1 + v2} oublie que le premier car a roulé seul pendant ${dur(De)}.`;
  return Q(q, h1 + De + Tc, [h1 + 60 * D / (v1 + v2), h1 + De + 60 * D / (v1 + v2), h1 + Tc], heure, k => h1 + De + Tc + sg(k) * 15, expl, x => ent(x) && x > h1);
}

/* 4h · Trois tronçons de même longueur à trois vitesses. */
function s4h(R){
  const p = gens(R, 1)[0], ctx = R.int(0, 1);
  const L = ctx === 0 ? [30, 40, 45, 50, 60, 72, 75, 80, 90, 100, 120] : [6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60];
  let a, b, c, vm, ok = false;
  for (let i = 0; i < 800 && !ok; i++){
    a = R.pick(L); b = R.pick(L); c = R.pick(L);
    if (a === b || b === c || a === c) continue;
    vm = 3 * a * b * c / (a * b + b * c + a * c);
    ok = ent(vm);
  }
  if (!ok){ if (ctx === 0){ a = 40; b = 60; c = 120; } else { a = 10; b = 15; c = 30; } vm = 3 * a * b * c / (a * b + b * c + a * c); }
  const q = ctx === 0
    ? `${p.nom} fait un trajet en voiture en trois parties de même longueur : la première à ${a} km/h, la deuxième à ${b} km/h et la troisième à ${c} km/h. Quelle est sa vitesse moyenne sur l'ensemble du trajet ?`
    : `${p.nom} fait à vélo le tour d'un parcours triangulaire dont les trois côtés ont la même longueur : ${p.il} roule à ${a} km/h sur le premier côté, à ${b} km/h sur le deuxième et à ${c} km/h sur le troisième. Quelle est sa vitesse moyenne sur le tour complet ?`;
  const d = ppcm(ppcm(a, b), c), T = d / a + d / b + d / c, moy = (a + b + c) / 3;
  const expl = `Choisis une longueur commode pour chaque partie, multiple des trois vitesses, puis divise la distance totale par le temps total. Avec ${nb(d)} km par partie : ${d / a} h + ${d / b} h + ${d / c} h = ${T} h pour ${nb(3 * d)} km. Vitesse moyenne : ${nb(3 * d)} ÷ ${T} = ${nb(vm)} km/h. Piège : la moyenne des trois vitesses (${dec(moy, 2) ? nb(moy) : 'environ ' + nb(moy, 1)} km/h) donne trop de poids aux parties rapides, où l'on passe peu de temps.`;
  const med = [a, b, c].sort((x, y) => x - y)[1];
  return Q(q, vm, [moy, med, 2 * a * c / (a + c)], kmh, k => vm + sg(k) * pasV(vm), expl, x => dec(x, 1));
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif
   ===================================================== */

/* 5a · Retard à une vitesse, avance à une autre. */
function s5a(R){
  const p = gens(R, 1)[0], mode = R.int(0, 2);
  let v1, v2, r, r1, d, t1, T, v, ok = false;
  for (let i = 0; i < 800 && !ok; i++){
    v1 = R.pick([30, 40, 45, 48, 50, 60, 72, 75, 80, 90]); v2 = R.pick([40, 45, 50, 60, 72, 75, 80, 90, 100, 120]);
    r = R.pick([10, 12, 15, 18, 20, 24, 30, 36, 40]);
    if (v2 <= v1 || v1 * v2 / (v2 - v1) > 600) continue;     // 1/v1 − 1/v2 garde un dénominateur raisonnable
    d = r * v1 * v2 / (60 * (v2 - v1));
    if (!ent(d) || d < 20 || d > 300) continue;
    t1 = 60 * d / v1;
    if (!ent(t1)) continue;
    const parts = [r / 2, r / 3, 2 * r / 3, r / 4, 3 * r / 4, r / 5, 2 * r / 5].filter(x => ent(x));
    r1 = R.pick(parts); T = t1 - r1; v = 60 * d / T;
    ok = T >= 20 && ent(60 * d / v2) && (mode !== 1 || ent(v));
  }
  if (!ok){ v1 = 60; v2 = 90; r = 20; d = 60; t1 = 60; r1 = 10; T = 50; v = 72; }
  const r2 = r - r1, t2 = 60 * d / v2, f = frac(v2 - v1, v1 * v2);
  const base = `En roulant à ${v1} km/h de moyenne, ${p.nom} arrive à son rendez-vous avec ${r1} minutes de retard. En roulant à ${v2} km/h de moyenne, ${p.il} arrive avec ${r2} minutes d'avance.`;
  const e0 = `L'écart entre les deux durées de trajet vaut le retard plus l'avance : écris cette différence en fonction de la distance. L'écart vaut ${r1} + ${r2} = ${r} min, soit ${enH(r)} h. Avec d la distance en km : d/${v1} − d/${v2} = ${enH(r)}, c'est-à-dire d × ${f} = ${enH(r)}, donc d = ${nb(d)} km.`;
  if (mode === 0)
    return Q(base + ` Quelle distance ${p.nom} doit-${p.il} parcourir ?`, d, [d * r1 / r, d * r2 / r, r * (v2 - v1) / 60, 2 * d], km, k => d + sg(k) * pasV(d),
      e0 + ` Vérification : ${dur(t1)} à ${v1} km/h et ${dur(t2)} à ${v2} km/h, soit ${r} min d'écart. Piège : n'utiliser que le retard, ou que l'avance, au lieu de l'écart total donne une distance trop petite.`, x => dec(x, 1));
  if (mode === 1)
    return Q(base + ` À quelle vitesse moyenne ${p.nom} doit-${p.il} rouler pour arriver exactement à l'heure ?`, v, [(v1 + v2) / 2, 2 * v1 * v2 / (v1 + v2)], kmh, k => v + sg(k) * pasV(v),
      e0 + ` À ${v1} km/h, le trajet dure ${dur(t1)} ; pour arriver pile, il doit durer ${r1} min de moins, soit ${dur(T)}. Vitesse : ${nb(d)} ÷ ${enH(T)} = ${nb(v)} km/h. Piège : la moyenne des deux vitesses, ${nb((v1 + v2) / 2)} km/h, ne convient pas.`, x => dec(x, 1));
  return Q(base + ` De combien de temps ${p.nom} dispose-t-${p.il} pour faire le trajet ?`, T, [t1, t2, (t1 + t2) / 2], dur, k => T + sg(k) * 5,
    e0 + ` À ${v1} km/h, le trajet dure ${dur(t1)} ; ${p.il} dispose donc de ${dur(t1)} − ${r1} min = ${dur(T)}. Vérification : à ${v2} km/h, le trajet dure ${dur(t2)}, soit ${r2} min de moins. Piège : la durée du trajet à l'une des deux vitesses n'est pas la durée disponible.`, x => ent(x));
}

/* 5b · Ils se croisent, puis arrivent : la durée avant le croisement est la moyenne géométrique. */
function s5b(R){
  const [p1, p2] = gens(R, 2), enHeures = R.int(0, 1) === 1, mode = R.int(0, 1), k = enHeures ? 60 : 1;
  let t1, t2, t, ok = false;
  for (let i = 0; i < 600 && !ok; i++){
    if (enHeures){ t1 = R.int(1, 8); t2 = R.int(2, 9); } else { t1 = R.int(6, 50); t2 = R.int(8, 90); }
    t = Math.sqrt(t1 * t2);
    ok = t1 < t2 && ent(t) && t2 <= 9 * t1;
  }
  if (!ok){ if (enHeures){ t1 = 4; t2 = 9; t = 6; } else { t1 = 16; t2 = 36; t = 24; } }
  const V = R.shuffle(R.pick(VILLES)), I = ils(p1, p2), u = enHeures ? 'h' : 'min';
  const q = `${p1.nom} part de ${V[0]} vers ${V[1]} et, au même instant, ${p2.nom} part de ${V[1]} vers ${V[0]} par la même route ; chacun roule à vitesse constante. ${cap(I)} se croisent, puis ${p1.nom} arrive à ${V[1]} ${dur(k * t1)} après le croisement, et ${p2.nom} arrive à ${V[0]} ${dur(k * t2)} après le croisement. `
    + (mode === 0 ? 'Combien de temps s\'est-il écoulé entre le départ et le croisement ?' : `Combien de temps a duré le trajet complet de ${p1.nom} ?`);
  const juste = mode === 0 ? k * t : k * (t + t1);
  let expl = `Écris deux rapports de vitesses : la distance faite par l'un avant le croisement est faite par l'autre après. Note t la durée avant le croisement, en ${u === 'h' ? 'heures' : 'minutes'}. ${p2.nom} fait en t le morceau que ${p1.nom} fait ensuite en ${dur(k * t1)} ; ${p1.nom} fait en t le morceau que ${p2.nom} fait ensuite en ${dur(k * t2)}. Le rapport de la vitesse de ${p1.nom} à celle de ${p2.nom} vaut donc à la fois t/${t1} et ${t2}/t, d'où t² = ${t1} × ${t2} = ${nb(t1 * t2)} et t = ${t}, soit ${dur(k * t)}.`;
  if (mode === 1) expl += ` Le trajet complet de ${p1.nom} dure ${dur(k * t)} + ${dur(k * t1)} = ${dur(k * (t + t1))}.`;
  expl += ' Piège : la moyenne des deux durées ne convient pas ; c\'est la racine carrée de leur produit.';
  const autres = mode === 0 ? [k * (t1 + t2) / 2, k * (t2 - t1), k * (t1 + t2)] : [k * (t1 + (t1 + t2) / 2), k * t2, k * (t1 + t2), k * (t + t2)];
  return Q(q, juste, autres, dur, kk => juste + sg(kk) * (enHeures ? 30 : 2), expl, x => ent(x));
}

/* 5c · Trois paires de travailleurs (ou de robinets) : on additionne les trois égalités. */
function s5c(R){
  const ctx = R.int(0, 1), mode = R.int(0, 1);
  const L = [4, 5, 6, 8, 9, 10, 12, 14, 15, 18, 20, 21, 24, 28, 30, 35, 36, 40, 42, 45, 60];
  let p, q, r, M, S, res, ok = false;
  for (let i = 0; i < 1500 && !ok; i++){
    p = R.pick(L); q = R.pick(L); r = R.pick(L);
    if (p === q || q === r || p === r) continue;
    M = ppcm(ppcm(p, q), r); S = M / p + M / q + M / r;
    if (M > 180) continue;                       // dénominateur commun calculable de tête
    const nA = S - 2 * M / q, nB = S - 2 * M / r, nC = S - 2 * M / p;
    if (nA <= 0 || nB <= 0 || nC <= 0) continue;
    res = mode === 0 ? 2 * M / S : 2 * M / nA;
    ok = (ctx === 0 ? ent(res) : ent(60 * res)) && res <= 200;
  }
  if (!ok){ p = 12; q = 15; r = 20; M = 60; S = 12; res = mode === 0 ? 10 : 30; }
  const [p1, p2, p3] = gens(R, 3), nA = S - 2 * M / q;
  const fmt = ctx === 0 ? jours : dur, kk = ctx === 0 ? 1 : 60;
  const u = ctx === 0 ? 'jour' : 'heure', D = x => ctx === 0 ? jours(x) : dur(60 * x);
  let enonce;
  if (ctx === 0){
    enonce = `Ensemble, ${p1.nom} et ${p2.nom} repeignent un appartement en ${p} jours ; ${p2.nom} et ${p3.nom}, en ${q} jours ; ${p1.nom} et ${p3.nom}, en ${r} jours. Chacun travaille toujours au même rythme. `
      + (mode === 0 ? `En combien de jours les trois ensemble repeignent-${ils(p1, p2, p3)} cet appartement ?` : `En combien de jours ${p1.nom}, seul${p1.e}, repeindrait-${p1.il} cet appartement ?`);
  } else {
    enonce = `Ouverts ensemble, le robinet rouge et le robinet bleu remplissent une cuve en ${dur(60 * p)} ; le bleu et le vert, en ${dur(60 * q)} ; le rouge et le vert, en ${dur(60 * r)}. `
      + (mode === 0 ? 'En combien de temps les trois robinets ouverts ensemble remplissent-ils la cuve ?' : 'En combien de temps le robinet rouge, seul, remplit-il la cuve ?');
  }
  const qui = ctx === 0 ? 'personne' : 'robinet', s = somme([[1, p], [1, q], [1, r]]);
  const paire = ctx === 0 ? `de ${p2.nom} et ${p3.nom}` : 'du bleu et du vert', seul = ctx === 0 ? `${p1.nom} seul${p1.e}` : 'le rouge seul';
  let expl = `Additionne les trois égalités de rythme : chaque ${qui} y apparaît deux fois. En un${ctx === 0 ? '' : 'e'} ${u}, les trois paires font ${s.txt} du travail, ce qui compte chaque ${qui} deux fois. Les trois ensemble font donc la moitié, ${frac(S, 2 * M)} du travail par ${u}${mode === 0 ? ', et il leur faut ' + D(2 * M / S) : ''}.`;
  if (mode === 1) expl += ` Pour ${seul}, on retire le rythme ${paire} : ${frac(S, 2 * M)} − 1/${q} = ${frac(nA, 2 * M)} par ${u}, donc ${D(2 * M / nA)}.`;
  expl += ' Piège : oublier de diviser la somme par deux revient à compter chaque ' + qui + ' deux fois, et donne un temps deux fois trop court.';
  const autres = mode === 0 ? [M / S, (p + q + r) / 3, (p + q + r) / 6] : [S - M / q > 0 ? M / (S - M / q) : null, 2 * M / S, 2 * p, 2 * r];
  const okv = ctx === 0 ? (x => dec(x, 1)) : (x => ent(x));
  return Q(enonce, kk * res, autres.map(x => x == null ? null : kk * x), fmt, k2 => kk * res + sg(k2) * (ctx === 0 ? 2 : 30), expl, okv);
}

/* 5d · Les marches d'un escalator. */
function s5d(R){
  if (R.int(0, 1)){
    const p = gens(R, 1)[0];
    let b, c, s, N, ok = false;
    for (let i = 0; i < 500 && !ok; i++){
      b = R.pick([20, 24, 30, 36, 40, 45, 48, 60, 72, 90]); c = R.pick([8, 10, 12, 15, 16, 18, 20, 24, 30, 36, 40, 45, 48, 60]); s = R.int(8, 40);
      N = s * b / (b - c);
      ok = c < b && ent(N) && N <= 150 && N > s;
    }
    if (!ok){ b = 30; c = 20; s = 20; N = 60; }
    const q = `Immobile sur un escalator qui monte, ${p.nom} arrive en haut en ${b} s. Un autre jour, ${p.il} monte à pied sur ce même escalator en marche : ${p.il} arrive en haut en ${c} s, après avoir gravi ${s} marches. Combien de marches l'escalator compte-t-il entre le bas et le haut ?`;
    const expl = `Sépare la part de l'escalator et celle des jambes : pendant la montée à pied, l'escalator fait sa part du trajet et les marches gravies font le reste. En ${c} s, l'escalator seul fait ${frac(c, b)} du trajet ; il reste ${frac(b - c, b)} du trajet, qui correspond aux ${s} marches gravies. L'escalator compte donc ${s} ÷ ${frac(b - c, b)} = ${N} marches. Piège : les ${s} marches gravies ne sont qu'une partie du trajet, puisque l'escalator avançait en même temps.`;
    return Q(q, N, [s * b / c, s * c / (b - c), s + b - c, s], marches, k => N + sg(k) * 2, expl, x => ent(x));
  }
  const [p1, p2] = gens(R, 2);
  let s1, k, rN, rD, N, s2, ok = false;
  for (let i = 0; i < 600 && !ok; i++){
    s1 = R.int(10, 40); k = R.pick([2, 3]); const rr = R.pick([[1, 2], [1, 1], [3, 2], [2, 1], [3, 1]]); rN = rr[0]; rD = rr[1];
    N = s1 * (rD + rN) / rD; s2 = N * k * rD / (k * rD + rN);
    ok = ent(N) && ent(s2) && ent(s2 / k) && s2 > s1 && s2 < N && N <= 150;
  }
  if (!ok){ s1 = 20; k = 2; rN = 3; rD = 1; N = 80; s2 = 32; }
  const x = rN / rD, m = s2 / k;
  const q = `${p1.nom} monte à pied un escalator qui monte, et gravit ${s1} marches avant d'arriver en haut. ${p2.nom}, qui enchaîne les marches ${k === 2 ? 'deux' : 'trois'} fois plus vite que ${p1.nom}, en gravit ${s2} sur le même escalator. Combien de marches l'escalator compte-t-il entre le bas et le haut ?`;
  const expl = `Compare les durées : celui qui marche plus vite reste moins longtemps sur l'escalator, qui l'aide donc moins. Pendant que ${p1.nom} gravit une marche, l'escalator avance de x marches. Pour ${p1.nom} : N = ${s1} + ${s1}x. ${p2.nom} gravit ${s2} marches dans le temps où ${p1.nom} en gravirait ${m} : N = ${s2} + ${m}x. Donc ${s1} + ${s1}x = ${s2} + ${m}x, soit ${s1 - m}x = ${s2 - s1}, d'où x = ${nb(x)} et N = ${s1} + ${s1} × ${nb(x)} = ${N} marches. Piège : additionner les deux nombres de marches ne correspond à rien.`;
  return Q(q, N, [s1 + s2, k * s1, 2 * s2 - s1, s2 + m], marches, kk => N + sg(kk) * 2, expl, x2 => ent(x2));
}

/* 5e · Second tour pour une moyenne visée : parfois impossible. */
const IMPOSSIBLE = 'C\'est impossible';
function s5e(R){
  const p = gens(R, 1)[0], ctx = R.int(0, 1), imp = R.int(0, 2) === 0;
  const V1 = ctx === 0 ? [60, 80, 90, 100, 120, 150] : [10, 12, 15, 16, 18, 20, 24];
  let v1, vm, v2 = 0, ok = false;
  if (imp){ v1 = R.pick(V1); vm = R.int(0, 2) ? 2 * v1 : 2 * v1 + (ctx === 0 ? 20 : 4); ok = true; }
  else {
    for (let i = 0; i < 600 && !ok; i++){
      v1 = R.pick(V1);
      vm = R.pick(ctx === 0 ? [90, 100, 105, 108, 112, 120, 140, 144, 150, 160, 168, 180, 200, 210, 225, 240] : [15, 16, 18, 20, 21, 24, 27, 28, 30, 32, 36, 40]);
      if (vm <= 1.4 * v1 || vm >= 2 * v1) continue;
      v2 = v1 * vm / (2 * v1 - vm);
      ok = ent(v2) && v2 <= (ctx === 0 ? 400 : 72);
    }
    if (!ok){ if (ctx === 0){ v1 = 60; vm = 100; } else { v1 = 12; vm = 18; } v2 = v1 * vm / (2 * v1 - vm); }
  }
  const q = ctx === 0
    ? `Un pilote doit faire deux tours d'un circuit. Il boucle le premier tour à ${v1} km/h de moyenne. À quelle vitesse moyenne doit-il boucler le second tour pour que sa vitesse moyenne sur les deux tours soit de ${vm} km/h ?`
    : `${p.nom} fait deux fois le tour d'un lac à vélo. Pendant le premier tour, ${p.il} roule à ${v1} km/h de moyenne. À quelle vitesse moyenne doit-${p.il} faire le second tour pour obtenir ${vm} km/h de moyenne sur les deux tours ?`;
  const debut = 'Compare le temps total permis par la moyenne visée au temps déjà utilisé pour le premier tour. ';
  if (imp){
    const exact = vm === 2 * v1;
    const expl = debut + `Prenons un tour de ${v1} km : le premier tour a déjà pris 1 h. Pour faire les ${2 * v1} km à ${vm} km/h de moyenne, il faudrait ${exact ? '1 h en tout' : frac(2 * v1, vm) + ' h en tout, moins que cette heure'} : il ne reste ${exact ? 'aucun temps' : 'qu\'un temps négatif'} pour le second tour. C'est impossible, même en allant infiniment vite. Piège : ${nb(2 * vm - v1)} km/h semble convenir si l'on fait la moyenne des deux vitesses, mais cette moyenne ne tient pas compte du temps.`;
    return Q(q, IMPOSSIBLE, [2 * vm - v1, 2 * vm, vm + v1], kmh, k => 2 * vm - v1 + sg(k) * pasV(vm), expl, x => dec(x, 1));
  }
  const d = ppcm(v1, vm / pgcd(vm, 2)), ta = d / v1, tt = 2 * d / vm, tr = tt - ta;
  const expl = debut + `Prenons un tour de ${nb(d)} km : le premier tour prend ${ta} h ; à ${vm} km/h de moyenne, les deux tours (${nb(2 * d)} km) doivent prendre ${tt} h. Il reste ${tr} h pour ${nb(d)} km : ${nb(d)} ÷ ${tr} = ${nb(v2)} km/h. Piège : ${nb(2 * vm - v1)} km/h ferait ${vm} comme moyenne des deux vitesses, mais la vitesse moyenne se calcule avec le temps total.`;
  return Q(q, v2, [IMPOSSIBLE, 2 * vm - v1, 2 * vm], kmh, k => v2 + sg(k) * pasV(v2), expl, x => dec(x, 1));
}

/* 5f · Deux trains qui se croisent ou se dépassent. */
const VT5 = [36, 54, 72, 90, 108, 126, 144, 162, 180, 216];
function s5f(R){
  const mode = R.int(0, 1), LL = [100, 120, 150, 180, 200, 240, 250, 300, 350, 400];
  let v1, v2, L1, L2, u1, u2, t, ok = false;
  for (let i = 0; i < 600 && !ok; i++){
    v1 = R.pick(VT5); v2 = R.pick(VT5); L1 = R.pick(LL); L2 = R.pick(LL);
    u1 = v1 * 10 / 36; u2 = v2 * 10 / 36;
    const rel = mode === 0 ? u1 + u2 : u1 - u2;
    if (rel <= 0) continue;
    t = (L1 + L2) / rel;
    ok = ent(t) && t >= 4 && t <= 180 && L1 !== L2 && v1 !== v2;
  }
  if (!ok){ v1 = 90; v2 = 54; L1 = 150; L2 = 250; u1 = 25; u2 = 15; t = mode === 0 ? 10 : 40; }
  const LT = L1 + L2;
  if (mode === 0){
    const q = `Deux trains roulent en sens contraires sur deux voies parallèles. Le premier, long de ${L1} m, roule à ${v1} km/h ; le second, long de ${L2} m, roule à ${v2} km/h. Combien de temps s'écoule-t-il entre l'instant où les deux locomotives se croisent et celui où les deux derniers wagons se séparent ?`;
    const expl = `Place-toi dans l'un des trains : l'autre semble défiler à la somme des deux vitesses, et il doit défiler sur la somme des deux longueurs. ${v1} km/h = ${u1} m/s et ${v2} km/h = ${u2} m/s, donc la vitesse relative vaut ${u1} + ${u2} = ${u1 + u2} m/s. Longueur à défiler : ${L1} + ${L2} = ${LT} m. Temps : ${LT} ÷ ${u1 + u2} = ${t} s${t >= 60 ? ', soit ' + durS(t) : ''}. Piège : soustraire les vitesses ne vaut que pour deux trains qui roulent dans le même sens.`;
    return Q(q, t, [u1 > u2 ? LT / (u1 - u2) : u2 > u1 ? LT / (u2 - u1) : null, LT / u1, Math.max(L1, L2) / (u1 + u2), 2 * t], durS, k => t + sg(k), expl, x => ent(x));
  }
  const q = `Sur deux voies parallèles, un train de ${L1} m roulant à ${v1} km/h rattrape un train de ${L2} m qui roule dans le même sens à ${v2} km/h. Combien de temps dure le dépassement, de l'instant où l'avant du premier arrive à hauteur de l'arrière du second à celui où son arrière dépasse l'avant du second ?`;
  const expl = `Place-toi dans le train rattrapé : l'autre semble avancer à la différence des deux vitesses, et doit parcourir la somme des deux longueurs. ${v1} km/h = ${u1} m/s et ${v2} km/h = ${u2} m/s, donc la vitesse relative vaut ${u1} − ${u2} = ${u1 - u2} m/s. Longueur à parcourir : ${L1} + ${L2} = ${LT} m. Temps : ${LT} ÷ ${u1 - u2} = ${t} s${t >= 60 ? ', soit ' + durS(t) : ''}. Piège : additionner les vitesses ne vaut que pour deux trains qui se croisent.`;
  return Q(q, t, [LT / (u1 + u2), LT / u1, L1 / (u1 - u2), L2 / (u1 - u2)], durS, k => t + sg(k) * 5, expl, x => ent(x));
}

/* 5h · Deux robinets et une vidange sur une cuve déjà entamée. */
const ETATS = [[0, 1, 'vide'], [1, 4, 'remplie au quart'], [1, 3, 'remplie au tiers'], [1, 2, 'à moitié pleine']];
function s5h(R){
  let a, b, c, E, M, n, T, ok = false;
  for (let i = 0; i < 1000 && !ok; i++){
    a = R.pick([2, 3, 4, 5, 6, 8, 10, 12]); b = R.pick([2, 3, 4, 5, 6, 8, 10, 12]); c = R.pick([3, 4, 5, 6, 8, 10, 12, 15, 20, 24]); E = R.pick(ETATS);
    if (a === b || c === a || c === b) continue;
    M = ppcm(ppcm(a, b), c); n = M / a + M / b - M / c;
    if (n <= 0) continue;
    T = 60 * (E[1] - E[0]) * M / (E[1] * n);
    ok = ent(T) && T <= 1440;
  }
  if (!ok){ a = 3; b = 6; c = 4; E = ETATS[1]; M = 12; n = 3; T = 180; }
  const q = `Une cuve est ${E[2]}. Seul, un premier robinet la remplirait entièrement en ${dur(60 * a)} ; seul, un second robinet la remplirait en ${dur(60 * b)}. La vidange, ouverte, viderait la cuve pleine en ${dur(60 * c)}. On ouvre en même temps les deux robinets et la vidange. Combien de temps faut-il pour que la cuve soit pleine ?`;
  const s = somme([[1, a], [1, b], [-1, c]]), reste = frac(E[1] - E[0], E[1]), rate = frac(s.n, s.d);
  const expl = `Fais le bilan par heure, ce qu'apportent les robinets moins ce qu'enlève la vidange, puis divise ce qui reste à remplir par ce bilan. Par heure : ${s.txt} de la cuve. ` + (E[0] ? `La cuve étant ${E[2]}, il reste ${reste} à remplir` : 'La cuve est vide : il faut la remplir entièrement') + `, donc ${reste} ÷ ${rate} = ${hs(T)}. Piège : la vidange se retranche, et le remplissage déjà fait réduit le travail restant.`;
  const restN = (E[1] - E[0]) / E[1];
  return Q(q, T, [60 * M / n, 60 * restN * M / (M / a + M / b), 60 * restN * M / (M / a + M / b + M / c)], dur, k => T + sg(k) * 15, expl, x => ent(x));
}

/* ---------- répartition par niveau ---------- */
const TYPES = {
  1: [s1a, s1b, s1c, s1d, s1e],
  2: [s2a, s2b, s2c, s2d, s2e],
  3: [s3a, s3b, s3c, s3d, s3e, s3f],
  4: [s4a, s4b, s4c, s4d, s4e, s4f, s4g, s4h],
  5: [s5a, s5b, s5c, s5d, s5e, s5f, s5h]
};
const SECOURS = () => ({
  q: 'Un train parcourt 150 km en 1 h 30 min. Quelle est sa vitesse moyenne ?',
  a: '100 km/h', accept: null, choix: ['100 km/h', '150 km/h', '225 km/h', '90 km/h'],
  expl: 'Divise la distance par la durée exprimée en heures, jamais en minutes. 1 h 30 min = 90 min = 1,5 h, donc v = 150 × 60 ÷ 90 = 100 km/h. Piège : diviser par 1 seulement oublie les minutes, et multiplier par 1,5 au lieu de diviser donne 225 km/h.'
});

/* =====================================================
   alb-22 · la compétence
   ===================================================== */
A.push({
  id: 'alb-22-vitesses-debits',
  phase: 'albert',
  ordre: 22,
  theme: 'calcul',
  titre: 'Vitesses, débits et travail en commun',
  objectif: 'Calculer une vitesse moyenne, un temps de rencontre ou de rattrapage et la durée d\'un travail à plusieurs, sans calculatrice, en déjouant les pièges des unités et des moyennes.',
  lecon:
`<p class="lede">Une voiture, un robinet, deux peintres : derrière ces histoires se cache une seule relation, <mark>quantité = rythme × temps</mark>. La distance est une quantité et la vitesse un rythme ; le volume d'eau est une quantité et le débit un rythme. Le test aime surtout les pièges cachés dans les unités et dans les moyennes.</p>
<h2>Ce que le test te demande</h2>
<p>Sur ce thème, le test d'Albert School propose des situations courtes : calculer une vitesse moyenne, trouver quand deux véhicules se croisent ou se rattrapent, dire en combien de temps deux robinets remplissent une cuve ou deux personnes finissent un travail. Les questions faciles se règlent avec une seule formule. Les plus difficiles cachent un piège (la vitesse moyenne n'est pas la moyenne des vitesses) ou demandent une idée : raisonner en fraction du travail faite par heure, ou se placer dans l'un des deux trains. Pas de calculatrice : les nombres sont choisis pour se calculer de tête.</p>
<h2>Les prérequis, en bref</h2>
<div class="formule"><p>d = v × t, donc v = d ÷ t et t = d ÷ v</p></div>
<p>Une vitesse en km/h demande un temps en <strong>heures</strong>. Convertis toujours les minutes :</p>
<table class="tbl">
<thead><tr><th>Minutes</th><th>15</th><th>20</th><th>30</th><th>40</th><th>45</th><th>72</th><th>90</th></tr></thead>
<tbody><tr><th>Heures</th><td>0,25</td><td>1/3</td><td>0,5</td><td>2/3</td><td>0,75</td><td>1,2</td><td>1,5</td></tr></tbody>
</table>
<p>Pour passer des km/h aux m/s, divise par 3,6 (72 km/h = 20 m/s) ; dans l'autre sens, multiplie par 3,6. Un débit se manie comme une vitesse : volume = débit × temps.</p>
<h2>La méthode en 4 étapes</h2>
<div class="etapes">
<p><strong>1. J'identifie la quantité et le rythme :</strong> distance et vitesse, volume et débit, travail et fraction du travail faite par heure.</p>
<p><strong>2. J'harmonise les unités :</strong> des heures avec des km/h, des secondes avec des m/s, des minutes avec des L/min.</p>
<p><strong>3. Je choisis la bonne idée :</strong> les totaux pour une moyenne, la somme ou la différence des vitesses pour deux mobiles, la somme des fractions pour un travail en commun.</p>
<p><strong>4. Je vérifie l'ordre de grandeur :</strong> à deux, on va plus vite que le plus rapide seul ; une vitesse moyenne est comprise entre la plus petite et la plus grande vitesse.</p>
</div>
<h2>Les trois idées clés</h2>
<p><strong>Vitesse moyenne = distance totale ÷ temps total.</strong> Ce n'est jamais la moyenne des vitesses, sauf si les durées sont égales.</p>
<p><strong>Deux mobiles :</strong> s'ils vont l'un vers l'autre, l'écart diminue à la <mark>somme</mark> des vitesses ; si l'un poursuit l'autre, l'écart diminue à la <mark>différence</mark> des vitesses.</p>
<p><strong>Travail en commun :</strong> si un robinet remplit une cuve en 3 h, il en remplit 1/3 par heure. Les fractions par heure s'additionnent (une vidange se retranche), et le temps cherché est l'inverse du total.</p>
<h2>Exemples résolus</h2>
<h3>1. Une vitesse moyenne simple</h3>
<p>« Un train parcourt 150 km en 1 h 30 min. » 1 h 30 min = 1,5 h, et 150 ÷ 1,5 = 100 km/h. Attention : 1 h 30 ne vaut pas 1,3 h.</p>
<h3>2. L'aller-retour</h3>
<p>« Aller à 60 km/h, retour par la même route à 40 km/h. Vitesse moyenne ? » Prends une distance commode, multiple de 60 et de 40 : 120 km. L'aller prend 2 h, le retour 3 h : 240 km en 5 h, soit 48 km/h, et non 50 km/h.</p>
<h3>3. Les deux robinets</h3>
<p>« Un robinet remplit une cuve en 3 h, un autre en 6 h. En combien de temps ensemble ? » Par heure : 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2 de la cuve. Il faut donc 2 h. Contrôle : 2 h, c'est moins que 3 h, le temps du plus rapide seul.</p>
<h3>4. Les deux trains</h3>
<p>« Deux villes sont à 300 km l'une de l'autre. Deux trains partent en même temps l'un vers l'autre, à 70 et 80 km/h. Quand se croisent-ils ? » L'écart diminue de 70 + 80 = 150 km par heure : 300 ÷ 150 = 2 h.</p>
<h3>5. La poursuite</h3>
<p>« Un cycliste part à 9 h à 20 km/h. Une voiture part du même endroit à 10 h, à 60 km/h. Quand le rattrape-t-elle ? » À 10 h, le cycliste a 20 km d'avance. L'écart fond de 60 − 20 = 40 km par heure : 20 ÷ 40 = 0,5 h. La voiture le rattrape à 10 h 30.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl">
<thead><tr><th>Situation</th><th>Réflexe</th></tr></thead>
<tbody>
<tr><td>Durée en h et min</td><td>convertir en heures : 1 h 20 min = 4/3 h ; diviser par 4/3, c'est multiplier par 3/4</td></tr>
<tr><td>Résultat décimal en heures</td><td>0,1 h = 6 min ; 0,25 h = 15 min ; 0,75 h = 45 min</td></tr>
<tr><td>Deux trajets de même longueur</td><td>prendre une distance multiple des deux vitesses</td></tr>
<tr><td>Deux durées a et b, travail en commun</td><td>temps = a × b ÷ (a + b) ; avec une vidange, a × b ÷ (b − a)</td></tr>
<tr><td>Train, tunnel, pont</td><td>distance = longueur du tunnel + longueur du train</td></tr>
<tr><td>Bateau et courant</td><td>descente = bateau + courant ; montée = bateau − courant</td></tr>
</tbody>
</table>
<div class="box astuce"><p class="box-t">Astuce</p><p>Écris quantité = rythme × temps avec des unités cohérentes : pour une moyenne, divise les totaux ; pour deux mobiles, additionne ou soustrais les vitesses ; pour un travail en commun, additionne les fractions faites par heure.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>La vitesse moyenne n'est pas la moyenne des vitesses : 60 et 40 km/h donnent 48 km/h, pas 50. En travail commun, les durées ne se moyennent pas : 3 h et 6 h ne font ni 4 h 30 ni 9 h, mais 2 h. Enfin, 1,5 h vaut 1 h 30 min, pas 1 h 50 min, et un train qui traverse un tunnel parcourt aussi sa propre longueur.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>d = v × t, avec des heures pour des km/h. Vitesse moyenne = distance totale ÷ temps total. Face à face : somme des vitesses ; poursuite : différence. Travail en commun : on additionne les fractions faites par heure, puis on inverse.</p></div>`,
  gen(level, R){
    const n = niv(level);
    try {
      const ex = R.pick(TYPES[n])(R);
      if (ex && typeof ex.q === 'string' && typeof ex.a === 'string' && Array.isArray(ex.choix) && ex.choix.length === 4) return ex;
    } catch(e){ /* repli ci-dessous */ }
    return SECOURS();
  }
});

})();
