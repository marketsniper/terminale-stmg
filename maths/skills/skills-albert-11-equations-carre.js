/* ===== Maths · Objectif Albert School : alb-11 · Équations x² = k, produit nul, facteur commun =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UNE compétence dans window.ALBERT_SKILLS.
   gen(level, R) : niveaux 1 à 5 (bornés), n'utilise que R.int, R.pick, R.shuffle, ne lève jamais d'exception.
   Chaque énoncé est construit à partir des solutions tirées au hasard : la réponse est toujours calculée.
   Sous-types (tour 2, après le jugement du tour 1) :
   N1 isoler x² (solution positive, négative, « lequel est solution »), nombre de solutions de x² = k,
      produit nul à deux facteurs du premier degré, ensemble des solutions de x² = k, (kx)² = c contre kx² = c ;
   N2 nombre égal à une fraction ou un multiple de son carré, nombre de solutions d'un produit (sans doublon),
      (x + p)² = k (le cas impossible demande d'isoler le carré), problèmes concrets (rectangle, chute, carré
      allongé, deux évolutions égales, aire décimale), somme, produit ou écart des deux solutions opposées ;
   N3 facteur commun caché (x + p)² = kx + kp, comptage avec solution commune ou cube, deux évolutions
      de même taux (capital, cours, taux global), tester les choix (produit égal à un nombre non nul),
      aire d'un carré qui augmente ou diminue, (x + p)² = (x + q)² (premier cas impossible),
      calcul mental (n − d)(n + d) + d² ;
   N4 (x + p)² = (kx + q)², x² − a² et facteur commun (solution double fréquente), bicarrées simples,
      hausse puis baisse du même taux, Pythagore, (x² − ax)² = b²x² (A² = B² puis facteur x²),
      comptage des entiers k pour lesquels une équation a un nombre donné de solutions,
      grands carrés cachés, (x + p)³ = k²(x + p) ;
   N5 (x² − a)² = b² avec discussion, facteur commun x² − a² et troisième facteur, taux à trois étapes,
      (x² − a²)² = k²(x ± a)², facteur commun de degré 3, (x² + 2hx + c)² = m² par la forme (x + h)²,
      paramètre k et forme canonique (nombre de solutions de x² + 2hx + k = 0). */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales ---------- */
/* Même normalisation que normStr (core/pedagogie.js), chargé après ce fichier. */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
/* Nombre à la française : virgule, U+202F pour les milliers, vrai signe moins. */
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));
const ent = v => typeof v === 'number' && isFinite(v) && Math.abs(v - Math.round(v)) < 1e-9;
const sg = n => nb(n, 0);
const pc = v => nb(v, 2) + ' %';
/* Valeur exacte : entier, sinon fraction irréductible (dénominateur ≤ 400), sinon décimal. */
function V(v){
  if (ent(v)) return sg(Math.round(v));
  for (let q = 2; q <= 400; q++){ const p = v * q; if (Math.abs(p - Math.round(p)) < 1e-9) return (v < 0 ? '−' : '') + Math.abs(Math.round(p)) + '/' + q; }
  return nb(v, 2);
}
/* Nombre entre parenthèses s'il est négatif : (−3)². */
const pn = v => v < 0 ? '(' + V(v) + ')' : V(v);
/* Ensemble de solutions : « aucune solution », « 5 seulement », « −3 et 3 », « −4, 0 et 4 ». */
function ens(vals){
  const u = [];
  vals.slice().sort((a, b) => a - b).forEach(v => { if (!u.some(w => Math.abs(w - v) < 1e-9)) u.push(v); });
  if (!u.length) return 'aucune solution';
  if (u.length === 1) return V(u[0]) + ' seulement';
  return u.slice(0, -1).map(V).join(', ') + ' et ' + V(u[u.length - 1]);
}
/* Polynôme écrit proprement : [[3,'x²'],[-5,'x'],[2,'']] → « 3x² − 5x + 2 ». */
function poly(terms){
  let s = '';
  terms.forEach(t => {
    const c = t[0], v = t[1];
    if (!c) return;
    const abs = Math.abs(c), corps = (abs === 1 && v) ? v : nb(abs, 0) + v;
    if (!s) s = (c < 0 ? '−' : '') + corps;
    else s += (c < 0 ? ' − ' : ' + ') + corps;
  });
  return s || '0';
}
/* kx + p ; parenthèse ; coefficient devant une parenthèse (1 → rien, −1 → « − »). */
const lin = (p, k) => poly([[k == null ? 1 : k, 'x'], [p, '']]);
const par = (p, k) => '(' + lin(p, k) + ')';
const cf = c => c === 1 ? '' : c === -1 ? '−' : sg(c);
const carre = p => p === 0 ? 'x²' : par(p) + '²';
/* Écriture « + 3 » ou « − 3 » d'un terme ajouté. */
const plus = v => (v < 0 ? ' − ' : ' + ') + V(Math.abs(v));

/* QCM : la bonne réponse, les distracteurs pédagogiques, puis des voisins jusqu'à 4 choix distincts. */
function qcm(bonne, autres, voisin){
  const vus = new Set([norm(bonne)]), ch = [bonne];
  const ajouter = c => { if (ch.length < 4 && c != null && c !== '' && !vus.has(norm(c))){ vus.add(norm(c)); ch.push(String(c)); } };
  autres.forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 120; k++) ajouter(voisin(k));
  return ch;
}
/* Réponse numérique : distracteurs en valeurs, filtrés par ok, voisins de pas « pas ». */
function Qv(q, bonne, autres, fmt, pas, expl, ok){
  const valide = v => typeof v === 'number' && isFinite(v) && Math.abs(v - bonne) > 1e-9 && (!ok || ok(v));
  const ch = qcm(fmt(bonne), autres.filter(valide).map(fmt), k => {
    const v = bonne + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * pas;
    return valide(v) ? fmt(v) : null;
  });
  return { q, a: fmt(bonne), accept: null, choix: ch, expl };
}
/* Réponse « ensemble de solutions ». */
function Qs(q, sol, autres, expl){
  const a = ens(sol);
  const ch = qcm(a, autres, k => sol.length ? ens(sol.map(r => r + (k % 2 ? 1 : -1) * Math.ceil(k / 2))) : ens([k]));
  return { q, a, accept: null, choix: ch, expl };
}
/* Réponse « nombre de solutions » : pref d'abord (pièges), puis le reste de 0 à 4 au hasard. */
function Qn(q, n, R, pref, expl, liste){
  const tous = liste || ['0', '1', '2', '3', '4'];
  const ch = qcm(String(n), (pref || []).concat(R.shuffle(tous)), () => null);
  return { q, a: String(n), accept: null, choix: ch, expl };
}
/* Racines distinctes d'une liste de facteurs. */
function distinctes(fs){
  const u = [];
  fs.forEach(f => f.r.forEach(v => { if (!u.some(w => Math.abs(w - v) < 1e-9)) u.push(v); }));
  return u.sort((a, b) => a - b);
}
const nbSol = n => n === 0 ? 'aucune solution' : n === 1 ? 'une seule solution' : n + ' solutions différentes';
/* Entier non nul (et hors liste) entre a et b, sans boucle infinie. */
function tire(R, a, b, interdits){
  for (let t = 0; t < 60; t++){ const v = R.int(a, b); if (v !== 0 && (!interdits || interdits.indexOf(v) < 0)) return v; }
  for (let v = 1; v <= Math.max(Math.abs(a), Math.abs(b)) + 30; v++) if (!interdits || interdits.indexOf(v) < 0) return v;
  return 1;
}

const MUL = { 2: 'double', 3: 'triple', 4: 'quadruple', 5: 'quintuple' };
const FRAC = { 2: 'à la moitié', 3: 'au tiers', 4: 'au quart', 5: 'au cinquième', 6: 'au sixième', 7: 'au septième', 8: 'au huitième', 9: 'au neuvième', 10: 'au dixième', 11: 'au onzième', 12: 'au douzième' };
const NONCARRES = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17, 18, 20, 30];

/* Facteurs d'un produit : texte, racines, phrase d'explication. */
const FAC = {
  diff: a => ({ s: 'x² − ' + (a * a), r: [-a, a], t: `x² − ${a * a} = 0 donne x² = ${a * a}, soit x = ${a} ou x = −${a}`, k: 'diff' }),
  nc: p => ({ s: 'x² − ' + p, r: [-Math.sqrt(p), Math.sqrt(p)], t: `x² − ${p} = 0 donne x = √${p} ou x = −√${p}`, k: 'diff' }),
  pos: c => ({ s: 'x² + ' + c, r: [], t: `x² + ${c} = 0 donne x² = −${c}, impossible car un carré n'est jamais négatif`, k: 'pos' }),
  lin: b => ({ s: lin(b), r: [-b], t: `${lin(b)} = 0 donne x = ${V(-b)}`, k: 'lin' }),
  x: () => ({ s: 'x', r: [0], t: 'x = 0 donne la solution 0', k: 'x' }),
  quad: c => ({ s: poly([[1, 'x²'], [-c, 'x']]), r: [0, c], t: `${poly([[1, 'x²'], [-c, 'x']])} = x${par(-c)} vaut zéro pour x = 0 ou x = ${V(c)}`, k: 'quad' })
};
const prod = fs => fs.map(f => f.s === 'x' ? 'x' : '(' + f.s + ')').join('') + ' = 0';

/* Équation a x² + b = c de solutions ±x0. */
function eqCarre(R){
  const a = R.pick([1, 1, 2, 2, 3, 3, 4, 5]), x0 = R.int(2, a === 1 ? 12 : 9), k = x0 * x0;
  const lo = Math.min(20, a * k - 2);
  let b = R.int(-lo, 20);
  if (a === 2 && x0 === 3 && b === -3) b = -5;           // jamais l'énoncé officiel
  const c = a * k + b;
  return { a, b, c, x0, k, eq: poly([[a, 'x²'], [b, '']]) + ' = ' + sg(c) };
}
function isoler(e){
  let t = '';
  if (e.b > 0) t += `On retire ${e.b} des deux côtés : ${cf(e.a)}x² = ${e.c - e.b}. `;
  else if (e.b < 0) t += `On ajoute ${-e.b} des deux côtés : ${cf(e.a)}x² = ${e.c - e.b}. `;
  if (e.a !== 1) t += `On divise par ${e.a} : x² = ${e.k}. `;
  return t;
}

/* =====================================================
   NIVEAU 1 · découverte
   ===================================================== */

/* 1a · Isoler x² : solution positive, négative, ou la seule proposée. */
function s1a(R){
  const e = eqCarre(R), x0 = e.x0, k = e.k, v = R.pick([0, 0, 1, 1, 2]);
  /* le signe de la réponse dépend de l'équation seule : même énoncé, même réponse */
  const s = v === 2 ? -1 : v === 1 ? ((e.a + e.c) % 3 === 0 ? -1 : 1) : 1, rep = s * x0;
  const q = v === 0 ? `Quelle est la solution positive de l'équation ${e.eq} ?`
    : v === 2 ? `Quelle est la solution négative de l'équation ${e.eq} ?`
    : `Parmi les nombres suivants, un seul est solution de l'équation ${e.eq}. Lequel ?`;
  const sd = () => v === 1 ? R.pick([1, -1]) : s;
  const autres = [sd() * k];
  if (k % 2 === 0) autres.push(sd() * k / 2);
  if (e.b !== 0){ const k2 = (e.c + e.b) / e.a; if (ent(k2) && k2 > 0 && ent(Math.sqrt(k2))) autres.push(sd() * Math.sqrt(k2)); }
  if (e.a > 1 && ent(Math.sqrt(e.a * k))) autres.push(sd() * Math.sqrt(e.a * k));
  autres.push(sd() * (x0 + 1));
  const r2 = rep < 0 ? `(${V(rep)})²` : `${V(rep)}²`, bs = e.b > 0 ? ` + ${e.b}` : e.b < 0 ? ` − ${-e.b}` : '';
  let expl = `Isole x² en défaisant les opérations, puis prends la racine carrée sans oublier son opposé. ${isoler(e)}Comme ${x0}² = ${k} et (−${x0})² = ${k}, les solutions sont ${x0} et −${x0}. `;
  expl += v === 0 ? `La solution positive est ${x0}. ` : v === 2 ? `La solution négative est −${x0}. ` : `Seul ${V(rep)} figure parmi les choix : son opposé ${V(-rep)} n'est pas proposé. `;
  expl += (e.a === 1 && e.b === 0) ? `Vérification : ${r2} = ${k}. ` : `Vérification : ${e.a === 1 ? '' : e.a + ' × '}${r2}${bs} = ${e.a === 1 ? '' : e.a + ' × '}${k}${bs} = ${e.c}. `;
  expl += v === 2 ? `Piège : oublier la solution négative, alors que (−${x0})² vaut aussi ${k}.`
    : `Piège : ${k} est la valeur de x², pas celle de x` + (k % 2 === 0 ? ` ; et x² = ${k} ne donne pas x = ${k / 2} : le carré n'est pas le double.` : '.');
  return Qv(q, rep, autres, V, 1, expl, w => ent(w) && w !== 0 && Math.abs(w) !== x0 && (v === 1 || Math.sign(w) === s));
}

/* 1b · Nombre de solutions de x² = k (k positif carré ou non, nul, négatif). */
function s1b(R){
  const cas = R.pick(['carre', 'carre', 'noncarre', 'zero', 'neg', 'neg']);
  const m = R.int(1, 15);
  const k = cas === 'carre' ? m * m : cas === 'noncarre' ? R.pick(NONCARRES) : cas === 'zero' ? 0 : -R.int(1, 30);
  let f = R.int(0, 4), eq, etape = '';
  const p = R.int(1, 20);
  if (f === 4 && p - k < 0) f = 0;
  if (f === 0) eq = `x² = ${sg(k)}`;
  else if (f === 1){ eq = `x² + ${p} = ${sg(k + p)}`; etape = `On retire ${p} des deux côtés : x² = ${sg(k)}. `; }
  else if (f === 2){ eq = `x² − ${p} = ${sg(k - p)}`; etape = `On ajoute ${p} des deux côtés : x² = ${sg(k)}. `; }
  else if (f === 3){ const a = R.pick([2, 3, 5]), p2 = R.int(1, 12); eq = `${a}x² + ${p2} = ${sg(a * k + p2)}`; etape = `On retire ${p2}, puis on divise par ${a} : x² = ${sg(k)}. `; }
  else { const r = p - k; eq = `${p} − x² = ${r}`; etape = r === 0 ? `On ajoute x² des deux côtés : x² = ${p}. ` : `On ajoute x² et on retire ${r} des deux côtés : x² = ${p} − ${r} = ${sg(k)}. `; }
  const n = k > 0 ? 2 : k === 0 ? 1 : 0;
  let expl = 'Isole x², puis regarde le signe du nombre obtenu : un carré n\'est jamais négatif. ' + etape;
  if (cas === 'carre') expl += `Comme ${k} est positif, il y a deux solutions : ${m} et −${m}. Piège : oublier la solution négative, alors que (−${m})² vaut aussi ${k}.`;
  else if (cas === 'noncarre'){ const fl = Math.floor(Math.sqrt(k)); expl += `Comme ${k} est positif, il y a deux solutions : √${k} et −√${k}. Piège : ${k} n'est pas un carré parfait, mais √${k} existe bien : c'est un nombre réel compris entre ${fl} et ${fl + 1}.`; }
  else if (cas === 'zero') expl += 'x² = 0 a une seule solution, x = 0 : 0 et son opposé sont le même nombre. Piège : compter deux solutions.';
  else {
    const r = Math.sqrt(-k), rr = ent(r) ? String(r) : '√' + (-k);
    expl += `Un carré est toujours positif ou égal à 0, donc x² = ${sg(k)} n'a aucune solution réelle. Piège : répondre ${rr} et −${rr} ; leurs carrés valent ${-k}, pas ${sg(k)}.`;
  }
  return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, n, R, [], expl, ['0', '1', '2', 'une infinité']);
}

/* 1c · Produit nul : deux facteurs du premier degré. */
function s1c(R){
  const f = R.pick([0, 0, 1, 2]);
  const intro = 'Un produit vaut zéro si et seulement si l\'un de ses facteurs vaut zéro : annule chaque facteur, un par un. ';
  if (f === 0){
    let r1 = 3, r2 = -5;
    for (let t = 0; t < 100; t++){ const u = R.int(-12, 12), w = R.int(-12, 12); if (u && w && u !== w && u !== -w){ r1 = u; r2 = w; break; } }
    const eq = `${par(-r1)}${par(-r2)} = 0`;
    const z = r1 < 0 ? r1 : r2 < 0 ? r2 : r1;
    const expl = intro + `${lin(-r1)} = 0 donne x = ${V(r1)} ; ${lin(-r2)} = 0 donne x = ${V(r2)}. Les solutions sont donc ${ens([r1, r2])}. Piège : ${lin(-z)} = 0 donne x = ${V(z)}, pas ${V(-z)} : le nombre change de signe en passant de l'autre côté.`;
    return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [r1, r2], [ens([-r1, -r2]), ens([r1, -r2]), ens([-r1, r2])], expl);
  }
  if (f === 1){
    const c = R.pick([1, 1, 2, 3]), p = tire(R, -12, 12);
    const eq = `${cf(c)}x${par(p)} = 0`;
    const expl = intro + `${c === 1 ? 'Le facteur x vaut zéro pour x = 0' : c + 'x = 0 donne x = 0'} ; ${lin(p)} = 0 donne x = ${V(-p)}. Les solutions sont ${ens([0, -p])}. Piège : ne pas oublier la solution 0, qui vient du facteur ${c === 1 ? 'x' : c + 'x'}.`;
    return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [0, -p], [ens([-p]), ens([0, p]), ens([-p, p])], expl);
  }
  const k = R.pick([2, 3, 4, 5]), r = tire(R, -6, 6);
  const p = tire(R, -12, 12, [r, -r]);
  const eq = R.int(0, 1) ? `${par(-k * r, k)}${par(p)} = 0` : `${par(p)}${par(-k * r, k)} = 0`;
  const expl = intro + `${lin(-k * r, k)} = 0 donne ${k}x = ${sg(k * r)}, donc x = ${V(r)} ; ${lin(p)} = 0 donne x = ${V(-p)}. Les solutions sont ${ens([r, -p])}. Piège : ${k}x = ${sg(k * r)} donne x = ${V(r)}, pas ${sg(k * r)} : il faut encore diviser par ${k}.`;
  return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [r, -p], [ens([k * r, -p]), ens([-r, p]), ens([r, p])], expl);
}

/* 1d · Ensemble des solutions de x² = K (positif, négatif ou nul). */
function s1d(R){
  const cas = R.pick(['pos', 'pos', 'pos', 'neg', 'zero']);
  const intro = 'Isole x², puis regarde le nombre obtenu : s\'il est positif, il y a deux solutions opposées ; s\'il vaut zéro, une seule ; s\'il est négatif, aucune. ';
  if (cas === 'pos'){
    const m = R.int(2, 15), K = m * m, f = R.int(0, 3);
    let eq, etape = '';
    const extra = [];
    if (f === 0) eq = `x² = ${K}`;
    else if (f === 1){ eq = `x² − ${K} = 0`; etape = `On ajoute ${K} des deux côtés : x² = ${K}. `; }
    else if (f === 2){
      const a = K <= 100 ? R.pick([2, 3, 4, 5]) : 2;
      eq = `${a}x² = ${a * K}`; etape = `On divise par ${a} : x² = ${K}. `;
      if (ent(Math.sqrt(a * K))) extra.push(ens([-Math.sqrt(a * K), Math.sqrt(a * K)]));
    }
    else { const p = R.int(1, 20); eq = `x² + ${p} = ${K + p}`; etape = `On retire ${p} des deux côtés : x² = ${K}. `; }
    const expl = intro + etape + `${m}² = ${K} et (−${m})² = ${K}, donc les solutions sont −${m} et ${m}. Piège : « ${m} seulement » oublie la solution négative, et ${nb(K / 2)} vient d'une confusion entre le carré et le double.`;
    return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [-m, m], [ens([m]), `−${nb(K / 2)} et ${nb(K / 2)}`].concat(extra, [ens([-K, K])]), expl);
  }
  if (cas === 'neg'){
    const m = R.int(2, 12), K = m * m, f = R.int(0, 2), p = R.int(1, 20);
    let eq, etape = '';
    if (f === 0){ eq = `x² + ${K} = 0`; etape = `On retire ${K} des deux côtés : x² = −${K}. `; }
    else if (f === 1) eq = `x² = −${K}`;
    else { eq = `x² + ${K + p} = ${p}`; etape = `On retire ${K + p} des deux côtés : x² = ${p} − ${K + p} = −${K}. `; }
    const expl = intro + etape + `Un carré n'est jamais négatif : aucun nombre n'a pour carré −${K}. Piège : (−${m})² vaut ${K}, pas −${K}.`;
    return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [], [ens([-m, m]), ens([-m]), ens([m])], expl);
  }
  const a = R.pick([2, 3, 5, 7]), p = R.int(2, 20), f = R.int(0, 1), w = f ? a : p;
  const eq = f ? `${a}x² = 0` : `x² + ${p} = ${p}`;
  const etape = f ? `On divise par ${a} : x² = 0. ` : `On retire ${p} des deux côtés : x² = 0. `;
  const expl = intro + etape + 'Seul 0 a pour carré 0 : il y a une seule solution, x = 0. Piège : répondre « aucune solution », alors que 0 convient.';
  return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [0], ['aucune solution', ens([-w, w]), ens([w])], expl);
}

/* 1e · (kx)² = c : le coefficient est lui aussi élevé au carré, à ne pas confondre avec kx² = c. */
function s1e(R){
  const k = R.pick([2, 3, 4, 5]), x0 = R.int(2, 9), c = k * k * x0 * x0, v = R.int(0, 2);
  const intro = 'Développe d\'abord le carré du produit, (kx)² = k² × x², puis isole x² et prends la racine carrée sans oublier son opposé. ';
  const corps = `(${k}x)² = ${k}² × x² = ${k * k}x². L'équation devient ${k * k}x² = ${nb(c, 0)}, donc x² = ${nb(c, 0)} ÷ ${k * k} = ${x0 * x0}, et x = ${x0} ou x = −${x0}. `;
  const piege = `Piège : (${k}x)² n'est pas ${k}x². Oublier le coefficient donne x² = ${nb(c, 0)}, donc ${k * x0} ; diviser par ${k} au lieu de ${k * k} donne x² = ${nb(c / k, 0)}.`;
  const eq = `(${k}x)² = ${nb(c, 0)}`;
  if (v === 2) return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [-x0, x0], [ens([x0]), ens([-k * x0, k * x0]), ens([-x0 * x0, x0 * x0])], intro + corps + `Les solutions sont ${ens([-x0, x0])}. ` + piege);
  const s = v === 0 ? 1 : -1;
  const q = v === 0 ? `Quelle est la solution positive de l'équation ${eq} ?` : `Quelle est la solution négative de l'équation ${eq} ?`;
  return Qv(q, s * x0, [s * k * x0, s * c / k, s * 2 * x0, s * k * k * x0], V, 1, intro + corps + `La solution ${v === 0 ? 'positive' : 'négative'} est ${V(s * x0)}. ` + piege, w => ent(w) && Math.sign(w) === s);
}

/* =====================================================
   NIVEAU 2 · maîtrise
   ===================================================== */

/* 2a · Un nombre égal à une fraction ou à un multiple de son carré. */
function s2a(R){
  const v = R.int(0, 3), k = v === 2 ? R.pick([2, 3, 5, 6, 7, 8, 9, 10, 11, 12]) : R.int(2, 12);   // jamais « 4 fois son carré » (énoncé Kangourou)
  const intro = 'Traduis la phrase par une équation, passe tout du même côté et factorise par x : ne divise jamais par x, qui pourrait valoir zéro. ';
  const sonK = MUL[k] ? 'au ' + MUL[k] + ' de ce nombre' : 'à ' + k + ' fois ce nombre';
  if (v === 0){
    const q = `Un nombre non nul est égal ${FRAC[k]} de son carré. Quel est ce nombre ?`;
    const expl = intro + `Avec x le nombre : x = x² ÷ ${k}, donc x² = ${k}x, soit x² − ${k}x = 0, c'est-à-dire x(x − ${k}) = 0. Donc x = 0 ou x = ${k}. Le nombre n'est pas nul : c'est ${k}. Vérification : ${k}² ÷ ${k} = ${k * k} ÷ ${k} = ${k}. Piège : 1/${k} est la solution de l'équation inverse x = ${k}x².`;
    return Qv(q, k, [1 / k, k * k, -k], V, 1, expl, w => w !== 0);
  }
  if (v === 1){
    const q = `Le carré d'un nombre non nul est égal ${sonK}. Quel est ce nombre ?`;
    const rac = ent(Math.sqrt(k)) ? V(Math.sqrt(k)) : '√' + k;
    const expl = intro + `Avec x le nombre : x² = ${k}x, soit x² − ${k}x = 0, c'est-à-dire x(x − ${k}) = 0. Donc x = 0 ou x = ${k}. Le nombre n'est pas nul : c'est ${k}. Vérification : ${k}² = ${k * k} = ${k} × ${k}. Piège : ${rac} résout x² = ${k}, une autre équation.`;
    return { q, a: V(k), accept: null, choix: qcm(V(k), [rac, V(k * k), V(-k), V(1 / k)], j => V(k + j)), expl };
  }
  if (v === 2){
    const q = `Un nombre non nul est égal ${MUL[k] ? 'au ' + MUL[k] + ' de' : 'à ' + k + ' fois'} son carré. Quel est ce nombre ?`;
    const expl = intro + `Avec x le nombre : x = ${k}x², soit ${k}x² − x = 0, c'est-à-dire x(${k}x − 1) = 0. Donc x = 0 ou ${k}x = 1, soit x = 1/${k}. Le nombre n'est pas nul : c'est 1/${k}. Vérification : ${k} × (1/${k})² = ${k} × 1/${k * k} = 1/${k}. Piège : ${k} est la réponse de la phrase inverse (le carré égal à ${k} fois le nombre).`;
    return { q, a: V(1 / k), accept: null, choix: qcm(V(1 / k), [V(k), V(-1 / k), V(1 / (k * k)), V(2 / k)], j => '1/' + (k + j)), expl };
  }
  const q = `Le carré d'un nombre est égal ${sonK}. Quelles sont toutes les valeurs possibles de ce nombre ?`;
  const expl = intro + `Avec x le nombre : x² = ${k}x, soit x² − ${k}x = 0, c'est-à-dire x(x − ${k}) = 0. Donc x = 0 ou x = ${k}, et les deux conviennent : 0² = ${k} × 0 et ${k}² = ${k} × ${k}. Piège : diviser par x fait perdre la solution 0.`;
  return Qs(q, [0, k], [ens([k]), ens([-k, k]), ens([0, 1 / k])], expl);
}

/* 2b · Nombre de solutions d'un produit, sans solution commune. */
function s2b(R){
  const f = R.pick(['A', 'A', 'B', 'C', 'D', 'E', 'F']);
  const a = R.int(2, 9), b = tire(R, -9, 9, [a, -a]);
  let fs, pref;
  if (f === 'A'){ fs = R.int(0, 3) === 0 ? [FAC.x(), FAC.diff(a)] : R.shuffle([FAC.diff(a), FAC.lin(b)]); pref = ['2']; }
  else if (f === 'B'){ fs = R.shuffle([FAC.pos(R.int(1, 20)), FAC.lin(b)]); pref = ['2', '3']; }
  else if (f === 'C'){
    const c = tire(R, 2, 9, [a]);
    fs = R.shuffle([FAC.diff(a), R.int(0, 2) === 0 ? FAC.nc(R.pick(NONCARRES)) : FAC.diff(c)]); pref = ['2'];
  }
  else if (f === 'D'){ fs = R.shuffle([FAC.pos(R.int(1, 20)), FAC.diff(a)]); pref = ['4', '3']; }
  else if (f === 'E'){ fs = R.shuffle([FAC.nc(R.pick(NONCARRES)), FAC.lin(b)]); pref = ['1']; }
  else { const c1 = R.int(1, 20), c2 = tire(R, 1, 20, [c1]); fs = [FAC.pos(c1), FAC.pos(c2)]; pref = ['2', '4']; }
  const n = distinctes(fs).length;
  const piege = fs.some(x => x.k === 'pos')
    ? 'Piège : un facteur comme x² + c, avec c positif, ne vaut jamais zéro et n\'apporte aucune solution.'
    : 'Piège : chaque facteur x² − c, avec c positif, apporte deux solutions, la positive et la négative.';
  const expl = 'Un produit vaut zéro si l\'un de ses facteurs vaut zéro : résous chaque facteur séparément, puis compte les solutions différentes. '
    + fs.map(x => x.t).join(' ; ') + `. Au total : ${nbSol(n)}. ` + piege;
  return Qn(`Combien de solutions réelles a l'équation ${prod(fs)} ?`, n, R, pref, expl);
}

/* 2c · (x + p)² = K : deux solutions, ou aucune. */
function s2c(R){
  const p = tire(R, -9, 9), m = R.int(2, 10), K = m * m, neg = R.int(0, 9) === 0, f = R.int(0, 2);
  const intro = 'Isole le carré, puis regarde le signe : un carré égal à un nombre positif donne deux possibilités (la racine ou son opposé), un carré égal à un nombre négatif n\'en donne aucune. ';
  if (!neg){
    let eq, etape = '';
    if (f === 0) eq = `${carre(p)} = ${K}`;
    else if (f === 1){ eq = `${carre(p)} − ${K} = 0`; etape = `On ajoute ${K} : ${carre(p)} = ${K}. `; }
    else { const c = R.pick([2, 3]); eq = `${c}${par(p)}² = ${c * K}`; etape = `On divise par ${c} : ${carre(p)} = ${K}. `; }
    const r1 = -p + m, r2 = -p - m;
    const expl = intro + etape + `Donc ${lin(p)} = ${m} ou ${lin(p)} = −${m}, c'est-à-dire x = ${V(r1)} ou x = ${V(r2)}. Les solutions sont ${ens([r1, r2])}. Piège : ne garder que ${lin(p)} = ${m} fait perdre la solution ${V(r2)}.`;
    return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [r1, r2], [ens([r1]), ens([p - m, p + m]), ens([-p - K, -p + K])], expl);
  }
  /* cas impossible : le plus souvent, il faut d'abord isoler le carré (c(x + p)² + A = B avec A > B) */
  const f2 = R.pick([0, 1, 2, 2, 2]), c = R.pick([1, 2, 3]), B = R.int(1, 9), A = B + c * K;
  const eq = f2 === 0 ? `${carre(p)} = −${K}` : f2 === 1 ? `${carre(p)} + ${K} = 0` : `${cf(c)}${par(p)}² + ${A} = ${B}`;
  const etape = f2 === 0 ? '' : f2 === 1 ? `On retire ${K} : ${carre(p)} = −${K}. ` : `On retire ${A} des deux côtés : ${cf(c)}${par(p)}² = ${B} − ${A} = −${c * K}. ` + (c === 1 ? '' : `On divise par ${c} : ${carre(p)} = −${K}. `);
  const expl = intro + etape + `Un carré n'est jamais négatif : ${carre(p)} ne peut pas valoir −${K}. Il n'y a aucune solution. Piège : écrire ${lin(p)} = ${m} ou ${lin(p)} = −${m} revient à résoudre ${carre(p)} = ${K}, une autre équation` + (f2 === 2 ? ` ; et ${B} − ${A} est bien négatif, il ne faut pas inverser la soustraction.` : '.');
  return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [], [ens([-p + m, -p - m]), ens([-p + m]), ens([p - m, p + m])], expl);
}

/* 2d · Problèmes concrets qui mènent à x² = k. */
function s2d(R){
  const v = R.int(0, 4);
  if (v === 0){
    const k = R.pick([2, 3, 4, 5]);
    let l = R.int(2, 12); if (k * l * l > 600) l = R.int(2, 8);
    const u = R.pick(['cm', 'm']), A2 = k * l * l, fmt = w => nb(w, 2) + ' ' + u;
    const q = `Un rectangle a une longueur égale au ${MUL[k]} de sa largeur et une aire de ${nb(A2, 0)} ${u}². Quelle est sa largeur ?`;
    const expl = `Appelle x la largeur, écris l'aire en fonction de x, puis résous une équation du type x² = nombre. Longueur : ${k}x ; aire : x × ${k}x = ${k}x². Donc ${k}x² = ${nb(A2, 0)}, x² = ${l * l} et x = ${l} (une longueur est positive). Vérification : ${l} × ${k * l} = ${nb(A2, 0)}. Piège : ${l * l} est la valeur de x², et ${k * l} ${u} est la longueur, pas la largeur.`;
    return Qv(q, l, [l * l, k * l, l * l / 2], fmt, 1, expl, w => w > 0);
  }
  if (v === 1){
    const t = R.int(2, 9), d = 5 * t * t, fmt = w => nb(w, 2) + ' s';
    const q = `Lâchée sans élan, une bille parcourt 5t² mètres en t secondes. Combien de secondes met-elle pour descendre de ${d} m ?`;
    const expl = `Remplace la distance par sa valeur, isole t², puis prends la racine carrée positive (un temps est positif). 5t² = ${d}, donc t² = ${d} ÷ 5 = ${t * t}, et t = ${t} s. Vérification : 5 × ${t}² = 5 × ${t * t} = ${d}. Piège : ${t * t} est la valeur de t², pas celle de t.`;
    return Qv(q, t, [t * t, d / 10, 2 * t], fmt, 1, expl, w => w > 0);
  }
  if (v === 2){
    const d = R.int(1, 6), m = R.int(d + 2, 20), x = m - d, A2 = m * m, fmt = w => nb(w, 2) + ' cm';
    const q = `On allonge de ${d} cm chaque côté d'un carré. Le nouveau carré a une aire de ${A2} cm². Quelle était la longueur du côté de départ ?`;
    const expl = `Appelle x le côté de départ : le nouveau côté vaut x + ${d}, et son carré est l'aire donnée. (x + ${d})² = ${A2}, donc x + ${d} = ${m} (une longueur est positive, −${m} est exclu). Donc x = ${m} − ${d} = ${x} cm. Vérification : ${m}² = ${A2}. Piège : ${m} cm est le côté du nouveau carré, pas celui du carré de départ.`;
    return Qv(q, x, [m, m + d], fmt, 1, expl, w => w > 0);
  }
  if (v === 3){
    const t = R.pick([10, 20, 30, 40, 50]), h = R.int(0, 1) === 1, c = h ? 100 + t : 100 - t, C = c * c;
    const g = h ? C / 100 - 100 : 100 - C / 100;
    const q = h ? `Après deux hausses successives de même pourcentage, un prix a été multiplié par ${nb(C / 10000, 4)}. Quel est ce pourcentage ?`
      : `Après deux baisses successives de même pourcentage, un prix a été multiplié par ${nb(C / 10000, 4)}. Quel est ce pourcentage de baisse ?`;
    const expl = `Deux évolutions de même pourcentage multiplient deux fois par le même coefficient : cherche le nombre positif dont le carré vaut le coefficient global. On cherche c tel que c² = ${nb(C / 10000, 4)} : c = ${nb(c / 100)}, car ${nb(c / 100)} × ${nb(c / 100)} = ${nb(C / 10000, 4)}. Un coefficient de ${nb(c / 100)} correspond à ${h ? 'une hausse' : 'une baisse'} de ${t} %. Piège : ${nb(g)} % ÷ 2 = ${nb(g / 2)} % est faux, car des pourcentages successifs ne s'additionnent pas ; et ${c} % confond le coefficient et le taux.`;
    return Qv(q, t, [g / 2, g, c], pc, 5, expl, w => w > 0 && w < 200);
  }
  const n = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 25, 35]), s = n / 10, A2 = n * n / 100, fmt = w => nb(w, 4) + ' m';
  const q = `Un carré a une aire de ${nb(A2, 4)} m². Quelle est la longueur de son côté ?`;
  const expl = `Le côté c vérifie c² = aire : cherche le nombre positif dont le carré vaut l'aire, en comptant les décimales. ${nb(s)}² = ${nb(A2, 4)}, car ${n}² = ${n * n} et un nombre à une décimale a un carré à deux décimales. Le côté mesure donc ${nb(s)} m. Piège : ${nb(s / 10, 4)} a deux décimales, son carré en aurait quatre ; et ${nb(A2 / 2, 4)} vient d'une confusion entre le carré et le double.`;
  return Qv(q, s, [s / 10, A2 / 2, s * 10], fmt, 0.1, expl, w => w > 0);
}

/* 2e · Somme, produit ou écart des deux solutions opposées. */
function s2e(R){
  const e = eqCarre(R), x0 = e.x0, k = e.k, v = R.int(0, 2);
  const intro = `Résous d'abord l'équation : les deux solutions d'une équation du type x² = nombre positif sont opposées. ${isoler(e)}Donc x = ${x0} ou x = −${x0}. `;
  if (v === 0){
    const expl = intro + `Produit : ${x0} × (−${x0}) = −${k}. Piège : oublier le signe moins ; le produit de deux nombres de signes contraires est négatif.`;
    return Qv(`Quel est le produit des deux solutions de l'équation ${e.eq} ?`, -k, [k, 0, -x0], V, 1, expl);
  }
  if (v === 1){
    const expl = intro + `Somme : ${x0} + (−${x0}) = 0. Deux nombres opposés ont toujours une somme égale à 0. Piège : additionner ${x0} et ${x0} en oubliant le signe de la seconde solution.`;
    return Qv(`Quelle est la somme des deux solutions de l'équation ${e.eq} ?`, 0, [2 * x0, x0, k], V, 1, expl);
  }
  const expl = intro + `Écart : ${x0} − (−${x0}) = ${x0} + ${x0} = ${2 * x0}. Piège : répondre ${x0}, qui est l'écart entre une solution et 0.`;
  return Qv(`Quel est l'écart entre la plus grande et la plus petite solution de l'équation ${e.eq} ?`, 2 * x0, [x0, 0, k], V, 1, expl, w => w >= 0);
}

/* =====================================================
   NIVEAU 3 · niveau des exemples officiels
   ===================================================== */

/* 3a · Facteur commun caché : (x + p)² = k(x + p), souvent développé à droite. */
function s3a(R){
  let p = -2, k = 4;
  for (let t = 0; t < 100; t++){ const u = R.int(-9, 9), w = R.int(-9, 9); if (u && w && Math.abs(u * w) <= 60){ p = u; k = w; break; } }
  const intro = 'Repère le facteur commun aux deux membres, passe tout du même côté et factorise : ne divise jamais par une expression qui peut valoir zéro. ';
  const question = R.pick(['set', 'set', 'count', 'sum']);
  if (question === 'count' && R.int(0, 2) === 0){
    const q2 = tire(R, -9, 9, [p]);
    const eq = `${carre(p)} = ${par(p)}${par(q2)}`;
    const expl = intro + `On passe tout à gauche : ${carre(p)} − ${par(p)}${par(q2)} = 0, soit ${par(p)}[${par(p)} − ${par(q2)}] = 0. Or ${par(p)} − ${par(q2)} = ${sg(p - q2)}, un nombre qui ne vaut pas zéro. Il reste ${par(p)} × ${pn(p - q2)} = 0, donc x = ${V(-p)} : une seule solution. Piège : diviser par ${par(p)} donne ${lin(p)} = ${lin(q2)}, impossible, et fait croire à tort qu'il n'y a aucune solution.`;
    return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, 1, R, ['0', '2'], expl, ['0', '1', '2', '3']);
  }
  const r1 = -p, r2 = -p + k;
  const disp = R.int(0, 3), a = disp === 3 ? R.pick([2, 3]) : 1;
  const L = a === 1 ? carre(p) : `${a}${par(p)}²`;
  const cache = poly([[a * k, 'x'], [a * k * p, '']]), cache1 = poly([[k, 'x'], [k * p, '']]), visible = k === 1 ? lin(p) : `${cf(k)}${par(p)}`;
  const eq = disp === 0 ? `${L} = ${cache}` : disp === 1 ? `${L} = ${visible}` : disp === 2 ? `${cache} = ${L}` : `${L} = ${cache}`;
  let expl = intro;
  if (a !== 1) expl += `On divise d'abord les deux membres par ${a}, un nombre qui ne vaut pas zéro : ${carre(p)} = ${cache1}. `;
  if (disp !== 1) expl += `On remarque que ${cache1} = ${visible}. `;
  const second = p - k === 0 ? `x${par(p)}` : `${par(p)}${par(p - k)}`;
  expl += `L'équation devient ${carre(p)} ${k > 0 ? '−' : '+'} ${cf(Math.abs(k))}${par(p)} = 0, soit ${par(p)}[${lin(p)} ${k > 0 ? '−' : '+'} ${Math.abs(k)}] = 0, c'est-à-dire ${second} = 0. Donc x = ${V(r1)} ou x = ${V(r2)}. `;
  const piege = `Piège : diviser les deux membres par ${par(p)} fait perdre la solution ${V(r1)}.`;
  if (question === 'set')
    return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [r1, r2], [ens([r2]), ens([p, p - k]), ens([r1, -p - k]), ens([r1])], expl + piege);
  if (question === 'count')
    return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, 2, R, ['1', '0'], expl + 'Il y a 2 solutions. ' + piege, ['0', '1', '2', '3']);
  return Qv(`Quelle est la somme des solutions de l'équation ${eq} ?`, r1 + r2, [r2, r1, -p - k + r1, -(r1 + r2)], V, 1, expl + `Somme : ${V(r1)} + ${pn(r2)} = ${V(r1 + r2)}. ` + piege);
}

/* 3b · Compter les solutions : solution commune à deux facteurs, cubes, phrases. */
function s3b(R){
  const f = R.pick(['A', 'A', 'B', 'C', 'C', 'D']);
  const intro = 'Passe tout du même côté, factorise au maximum, puis compte les valeurs différentes qui annulent un facteur. ';
  if (f === 'A'){
    const a = R.int(2, 9), coinc = R.int(0, 1) === 1, b = coinc ? R.pick([a, -a]) : tire(R, -9, 9, [a, -a]);
    const fs = R.shuffle([FAC.diff(a), FAC.lin(b)]), sol = distinctes(fs), n = sol.length;
    const expl = intro + fs.map(x => x.t).join(' ; ') + '. ' + (coinc
      ? `La valeur ${V(-b)} est trouvée deux fois, elle ne compte qu'une fois : il y a donc 2 solutions, ${ens(sol)}. Piège : additionner 2 + 1 = 3 sans voir la solution commune.`
      : `Les trois valeurs sont différentes : 3 solutions. Piège : oublier la solution négative de x² = ${a * a}.`);
    return Qn(`Combien de solutions réelles a l'équation ${prod(fs)} ?`, n, R, coinc ? ['3', '1'] : ['2', '4'], expl);
  }
  if (f === 'B'){
    const d = R.int(2, 9), coinc = R.int(0, 1) === 1, c = coinc ? R.pick([d, -d]) : tire(R, -9, 9, [d, -d, 1, -1]);
    const fs = R.shuffle([FAC.quad(c), FAC.diff(d)]), sol = distinctes(fs), n = sol.length;
    const expl = intro + fs.map(x => x.t).join(' ; ') + `. Valeurs différentes : ${sol.map(V).join(' ; ')}, soit ${n} solutions. ` + (coinc
      ? `Piège : compter 2 + 2 = 4 alors que ${V(c)} est commune aux deux facteurs.`
      : 'Piège : oublier la solution 0 du facteur qui contient x en facteur commun.');
    return Qn(`Combien de solutions réelles a l'équation ${prod(fs)} ?`, n, R, coinc ? ['4', '2'] : ['3', '2'], expl);
  }
  if (f === 'C'){
    const cas = R.pick(['carre', 'carre', 'nc', 'neg']), m = R.int(2, 9);
    const k = cas === 'carre' ? m * m : cas === 'nc' ? R.pick(NONCARRES) : -R.int(1, 20);
    const eq = R.int(0, 1) ? `x³ = ${poly([[k, 'x']])}` : `x³ ${k > 0 ? '−' : '+'} ${poly([[Math.abs(k), 'x']])} = 0`;
    const fact = `x(x² ${k > 0 ? '− ' + k : '+ ' + (-k)}) = 0`;
    let expl = intro + `L'équation s'écrit ${fact} : soit x = 0, soit x² = ${sg(k)}`;
    let n;
    if (k > 0){
      n = 3;
      expl += (cas === 'carre' ? `, donc x = ${m} ou x = −${m}` : `, donc x = √${k} ou x = −√${k}`) + '. Il y a 3 solutions. Piège : diviser par x fait perdre la solution 0.';
    } else {
      n = 1;
      expl += `, impossible car un carré n'est jamais négatif. Il y a une seule solution : 0. Piège : diviser par x conduit à x² = ${sg(k)} et fait croire qu'il n'y a aucune solution, alors que 0 convient.`;
    }
    return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, n, R, k > 0 ? ['2'] : ['0', '3'], expl);
  }
  const k = R.int(2, 12);
  const P = [
    { t: 'sont égaux à leur cube', n: 3, e: 'x = x³ s\'écrit x³ − x = 0, soit x(x² − 1) = 0 : x = 0, x = 1 ou x = −1.' },
    { t: 'sont égaux à leur carré', n: 2, e: 'x = x² s\'écrit x² − x = 0, soit x(x − 1) = 0 : x = 0 ou x = 1.' },
    { t: 'sont égaux à l\'opposé de leur cube', n: 1, e: 'x = −x³ s\'écrit x³ + x = 0, soit x(x² + 1) = 0 : seul x = 0 convient, car x² = −1 est impossible.' },
    { t: 'ont un cube égal à leur carré', n: 2, e: 'x³ = x² s\'écrit x³ − x² = 0, soit x²(x − 1) = 0 : x = 0 ou x = 1.' },
    { t: 'ont un carré égal à leur opposé', n: 2, e: 'x² = −x s\'écrit x² + x = 0, soit x(x + 1) = 0 : x = 0 ou x = −1.' },
    { t: `sont égaux ${MUL[k] ? 'au ' + MUL[k] + ' de' : 'à ' + k + ' fois'} leur cube`, n: 3, e: `x = ${k}x³ s'écrit x(${k}x² − 1) = 0 : x = 0, ou x² = 1/${k}, qui donne deux solutions opposées.` },
    { t: `sont égaux ${FRAC[k]} de leur carré`, n: 2, e: `x = x² ÷ ${k} s'écrit x² − ${k}x = 0, soit x(x − ${k}) = 0 : x = 0 ou x = ${k}.` }
  ];
  const c = R.pick(P);
  const expl = intro + c.e + ` Il y a donc ${nbSol(c.n)}. Piège : diviser par x fait perdre la solution 0.`;
  return Qn(`Combien de nombres réels ${c.t} ?`, c.n, R, [String(c.n - 1)], expl);
}

/* 3c · Deux évolutions successives de même taux. */
const CAPITAUX = [1000, 2000, 2500, 4000, 5000, 8000, 10000, 20000, 40000, 50000];
const COURS = [100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000];
function s3c(R){
  const t = R.pick([10, 20, 30, 40, 50]), v = R.int(0, 3), h = v < 2, c = h ? 100 + t : 100 - t, C = c * c;
  const g = h ? C / 100 - 100 : 100 - C / 100, G = nb(C / 10000, 4), cc = nb(c / 100);
  let q, debut;
  if (v === 0){
    const K = R.pick(CAPITAUX), F = K * C / 10000, F1 = K * c / 100;
    q = R.pick([
      `Un capital de ${nb(K, 0)} € est placé pendant deux ans à intérêts composés, au même taux chaque année. Au bout des deux ans, il vaut ${nb(F, 0)} €. Quel est ce taux annuel ?`,
      `Le prix d'un appartement passe de ${nb(K * 20, 0)} € à ${nb(F * 20, 0)} € en deux ans, avec le même pourcentage de hausse chaque année. Quel est ce pourcentage ?`
    ]);
    const K2 = /appartement/.test(q) ? K * 20 : K;
    debut = `Coefficient global : ${nb(K2 * C / 10000, 0)} ÷ ${nb(K2, 0)} = ${G}. On cherche c positif tel que c² = ${G} : c = ${cc}, car ${cc} × ${cc} = ${G}. Ce coefficient correspond à une hausse de ${t} %. Vérification : ${nb(K2, 0)} × ${cc} = ${nb(K2 * c / 100, 0)}, puis ${nb(K2 * c / 100, 0)} × ${cc} = ${nb(K2 * C / 10000, 0)}. `;
    void F1;
  } else if (v === 1){
    const suj = R.pick(['Le chiffre d\'affaires d\'une entreprise', 'Le nombre d\'abonnés d\'une plateforme', 'Le prix d\'un ticket de métro', 'La population d\'une ville', 'Le budget publicitaire d\'une marque']);
    q = `${suj} a augmenté de ${nb(g)} % en deux ans, avec le même pourcentage de hausse chaque année. Quel est ce pourcentage annuel ?`;
    debut = `Une hausse de ${nb(g)} % correspond au coefficient global ${G}. On cherche c positif tel que c² = ${G} : c = ${cc}, car ${cc} × ${cc} = ${G}. Ce coefficient correspond à une hausse de ${t} % par an. `;
  } else if (v === 2){
    const P = R.pick(COURS), F = P * C / 10000;
    const objet = R.pick(['Une action', 'Une cryptomonnaie', 'Un vélo d\'occasion', 'Une console']);
    q = `${objet} passe de ${nb(P, 0)} € à ${nb(F, 0)} € après deux baisses successives de même pourcentage. Quel est ce pourcentage de baisse ?`;
    debut = `Coefficient global : ${nb(F, 0)} ÷ ${nb(P, 0)} = ${G}. On cherche c positif tel que c² = ${G} : c = ${cc}, car ${cc} × ${cc} = ${G}. Ce coefficient correspond à une baisse de ${t} %. Vérification : ${nb(P, 0)} × ${cc} = ${nb(P * c / 100, 0)}, puis ${nb(P * c / 100, 0)} × ${cc} = ${nb(F, 0)}. `;
  } else {
    const suj = R.pick(['Le nombre de lecteurs d\'un magazine', 'Le volume des ventes de disques d\'un label', 'Le stock d\'un entrepôt', 'La consommation d\'eau d\'une usine']);
    q = `${suj} a baissé de ${nb(g)} % en deux ans, avec le même pourcentage de baisse chaque année. Quel est ce pourcentage annuel ?`;
    debut = `Une baisse de ${nb(g)} % correspond au coefficient global ${G}. On cherche c positif tel que c² = ${G} : c = ${cc}, car ${cc} × ${cc} = ${G}. Ce coefficient correspond à une baisse de ${t} % par an. `;
  }
  const expl = 'Deux évolutions successives de même pourcentage multiplient deux fois par le même coefficient : calcule le coefficient global, puis cherche le nombre positif dont le carré vaut ce coefficient. '
    + debut + `Piège : ${nb(g)} % ÷ 2 = ${nb(g / 2)} % est faux, car des pourcentages successifs ne s'additionnent pas ; et ${c} % confond le coefficient et le taux.`;
  return Qv(q, t, [g / 2, g, c], pc, 5, expl, w => w > 0 && w < 200);
}

/* 3d · Tester les choix : un produit égal à un nombre non nul. */
function s3d(R){
  let r1 = 3, r2 = -7;
  for (let t = 0; t < 100; t++){ const u = R.int(-9, 9), w = R.int(-9, 9); if (u && w && u !== w && u !== -w){ r1 = u; r2 = w; break; } }
  const p = -(r1 + r2), qq = -r1 * r2;                       // x² + p x = qq
  const f = R.int(0, 3);
  let eq, aa = 0, bb = 0, cc = 0;
  if (f === 0) eq = `x${par(p)} = ${sg(qq)}`;
  else if (f === 1) eq = `${poly([[1, 'x²'], [p, 'x']])} = ${sg(qq)}`;
  else if (f === 2) eq = `x² = ${qq > 0 ? poly([[qq, ''], [-p, 'x']]) : poly([[-p, 'x'], [qq, '']])}`;
  else {
    for (let t = 0; t < 60; t++){ const u = R.int(-6, 6), w = p - u, c = u * w + qq; if (u && w && u !== w && c){ aa = u; bb = w; cc = c; break; } }
    if (!aa){ aa = p === 1 ? 2 : 1; bb = p - aa; cc = aa * bb + qq; }
    if (!bb || !cc){ eq = `x${par(p)} = ${sg(qq)}`; aa = 0; }
    else eq = `${par(aa)}${par(bb)} = ${sg(cc)}`;
  }
  const g = f === 3 && aa ? 3 : f === 3 ? 0 : f;
  const P = x => x * x + p * x - qq, estSol = x => P(x) === 0;
  const rep = Math.abs(qq) % 2 === 0 ? Math.max(r1, r2) : Math.min(r1, r2), autre = rep === r1 ? r2 : r1;
  const pool = g === 0 ? [qq, qq - p, -rep, -p, -autre] : g === 3 ? [cc - aa, cc - bb, -aa, -bb, -rep, -autre] : [qq, -rep, -autre, qq - p];
  const autres = [];
  pool.forEach(x => { if (ent(x) && x !== rep && !estSol(x) && Math.abs(x) <= 99 && autres.indexOf(x) < 0) autres.push(x); });
  const calc = x => {
    if (g === 0) return `${pn(x)} × (${V(x)}${plus(p)}) = ${pn(x)} × ${pn(x + p)} = ${sg(x * (x + p))}`;
    const fois = Math.abs(p) === 1 ? (p > 0 ? ' + ' : ' − ') + pn(x) : plus(p) + ' × ' + pn(x);
    const fois2 = Math.abs(p) === 1 ? (p < 0 ? ' + ' : ' − ') + pn(x) : plus(-p) + ' × ' + pn(x);
    if (g === 1) return `${pn(x)}²${fois} = ${sg(x * x)}${plus(p * x)} = ${sg(x * x + p * x)}`;
    if (g === 2) return qq > 0 ? `${pn(x)}² = ${sg(x * x)} et ${sg(qq)}${fois2} = ${sg(qq - p * x)}` : `${pn(x)}² = ${sg(x * x)} et ${sg(-p)} × ${pn(x)}${plus(qq)} = ${sg(qq - p * x)}`;
    return `(${V(x)}${plus(aa)})(${V(x)}${plus(bb)}) = ${pn(x + aa)} × ${pn(x + bb)} = ${sg((x + aa) * (x + bb))}`;
  };
  const d = autres[0];
  let expl = 'Quand le second membre ne vaut pas zéro, la règle du produit nul ne s\'applique pas : remplace x par chaque choix et garde celui qui vérifie l\'égalité. ';
  expl += `Avec x = ${V(rep)} : ${calc(rep)}, l'égalité est vraie. `;
  if (d != null) expl += `Avec x = ${V(d)} : ${calc(d)}, l'égalité est fausse. `;
  expl += `Pour aller plus loin : l'équation équivaut à ${poly([[1, 'x²'], [p, 'x'], [-qq, '']])} = 0, soit ${par(-r1)}${par(-r2)} = 0 ; ses solutions sont ${ens([r1, r2])}, et ${V(autre)} n'est pas proposé. `;
  expl += g === 0 ? `Piège : écrire x = ${sg(qq)} ou ${lin(p)} = ${sg(qq)} est faux, la règle du produit nul ne marche que pour un produit égal à 0.`
    : g === 3 ? `Piège : écrire ${lin(aa)} = ${sg(cc)} ou ${lin(bb)} = ${sg(cc)} est faux, la règle du produit nul ne marche que pour un produit égal à 0.`
    : 'Piège : changer le signe d\'une solution ; vérifie toujours le choix retenu dans l\'équation de départ.';
  return Qv(`Parmi les nombres suivants, un seul est solution de l'équation ${eq}. Lequel ?`, rep, autres, V, 1, expl, x => !estSol(x));
}

/* 3e · Aire d'un carré qui augmente ou diminue d'une quantité donnée. */
function s3e(R){
  const d = R.int(1, 6), gr = R.int(0, 2) > 0;
  const x = gr ? R.int(2, 15) : R.int(d + 1, d + 14);
  const D = gr ? 2 * d * x + d * d : 2 * d * x - d * d, fmt = w => nb(w, 2) + ' cm';
  const q = gr ? `On augmente de ${d} cm le côté d'un carré : son aire augmente alors de ${D} cm². Quel est le côté du carré de départ ?`
    : `On diminue de ${d} cm le côté d'un carré : son aire diminue alors de ${D} cm². Quel est le côté du carré de départ ?`;
  let expl = 'Écris l\'aire avant et après en fonction du côté x, puis fais la différence : les x² s\'éliminent et il reste une équation du premier degré. ';
  if (gr) expl += `Aire avant : x². Aire après : (x + ${d})² = x² + ${2 * d}x + ${d * d}. Différence : ${2 * d}x + ${d * d} = ${D}, donc ${2 * d}x = ${D - d * d} et x = ${x} cm. Vérification : ${x + d}² − ${x}² = ${(x + d) * (x + d)} − ${x * x} = ${D}. Piège : (x + ${d})² n'est pas x² + ${d * d} ; il ne faut pas oublier le double produit ${2 * d}x.`;
  else expl += `Aire avant : x². Aire après : (x − ${d})² = x² − ${2 * d}x + ${d * d}. Différence : x² − (x − ${d})² = ${2 * d}x − ${d * d} = ${D}, donc ${2 * d}x = ${D + d * d} et x = ${x} cm. Vérification : ${x}² − ${x - d}² = ${x * x} − ${(x - d) * (x - d)} = ${D}. Piège : (x − ${d})² n'est pas x² − ${d * d} ; il ne faut pas oublier le double produit ${2 * d}x.`;
  const autres = gr ? [(D - d * d) / d, D / (2 * d), x + d] : [(D + d * d) / d, D / (2 * d), x - d];
  return Qv(q, x, autres, fmt, 1, expl, w => w > 0 && ent(w * 100));
}

/* 3f · Deux carrés égaux, (x + p)² = (x + q)² : le premier cas est impossible, le second est du premier degré. */
function s3f(R){
  const intro = 'Deux carrés sont égaux exactement quand les nombres élevés au carré sont égaux ou opposés : A² = B² équivaut à A = B ou A = −B. ';
  let p = 5, q = -3;
  for (let t = 0; t < 100; t++){ const u = R.int(-12, 12), w = R.int(-12, 12); if (u !== w && (u + w) % 2 === 0 && (u || w)){ p = u; q = w; break; } }
  const r = -(p + q) / 2, eq = `${carre(p)} = ${carre(q)}`, opp = q === 0 ? '−x' : '−' + par(q);
  const expl = intro + `Premier cas : ${lin(p)} = ${lin(q)} est impossible (on obtiendrait ${sg(p)} = ${sg(q)}). Second cas : ${lin(p)} = ${opp}, soit 2x = ${sg(-p - q)}, donc x = ${V(r)}. Une seule solution. Vérification : ${pn(r + p)}² = ${(r + p) * (r + p)} et ${pn(r + q)}² = ${(r + q) * (r + q)}. Piège : s'arrêter au premier cas et conclure qu'il n'y a aucune solution, ou croire qu'une équation avec des carrés a toujours deux solutions.`;
  const qt = R.pick(['set', 'set', 'count', 'val']);
  if (qt === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, 1, R, ['0', '2'], expl, ['0', '1', '2', 'une infinité']);
  if (qt === 'val') return Qv(`Quelle est la solution de l'équation ${eq} ?`, r, [-r, -p, -q, p + q], V, 1, expl);
  const aut = ['aucune solution', ens([-p, -q])];
  if (r !== 0){ aut.push(ens([-r])); aut.push(ens([r, -r])); } else aut.push(ens([-p, p]));
  return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [r], aut, expl);
}

/* 3g · Calcul mental : (n − d)(n + d) + d² = n². Les choix encadrent n de près : il faut reconnaître n². */
function s3g(R){
  const n = R.int(0, 2) === 0 ? R.pick([20, 30, 40, 50, 60, 70, 80, 90, 100]) : R.int(12, 99), d = R.pick([3, 4, 5]), v = R.int(0, 1);
  const eq = v ? `x² − ${d * d} = ${n - d} × ${n + d}` : `x² = ${n - d} × ${n + d} + ${d * d}`;
  const expl = `Reconnais un produit de deux nombres placés à égale distance d'un même entier : c'est une différence de deux carrés. ${n - d} × ${n + d} = (${n} − ${d})(${n} + ${d}) = ${n}² − ${d}² = ${nb(n * n, 0)} − ${d * d}. Donc x² = ${nb(n * n, 0)}, et x = ${n}. Piège : poser la multiplication est long et risqué ; et ${n - d} × ${n + d} vaut ${n}² − ${d * d}, pas ${n}² : il faut bien ajouter ${d * d} avant de prendre la racine.`;
  return Qv(`Quelle est la solution positive de l'équation ${eq} ?`, n, [n - 1, n + 1, n + 2], V, 1, expl, w => w > 0);
}

/* =====================================================
   NIVEAU 4 · au-dessus des exemples officiels
   ===================================================== */

/* 4a · Deux carrés égaux : (x + p)² = (kx + q)² ou (x + p)² = m²(x + q)², deux cas utiles. */
function s4a(R){
  const intro = 'Deux carrés sont égaux exactement quand les nombres élevés au carré sont égaux ou opposés : A² = B² équivaut à A = B ou A = −B. ';
  const f = R.pick([2, 2, 3]);
  const k = R.pick([2, 3]);
  let r1 = 4, r2 = -2, p = 0, q = 0, ok = false;
  for (let t = 0; t < 300 && !ok; t++){
    r1 = R.int(-9, 9); r2 = R.int(-9, 9);
    if (r1 === r2) continue;
    const P2 = (k - 1) * r1 - (k + 1) * r2, Q2 = -(k + 1) * r2 - (k - 1) * r1;   // 2p et 2q' (q' = terme constant de kx + q')
    if (P2 % 2 || Q2 % 2) continue;
    p = P2 / 2; q = Q2 / 2;
    if (Math.abs(p) > 15 || Math.abs(q) > 15 || !q) continue;
    if (f === 3 && q % k) continue;
    ok = true;
  }
  if (!ok){ r1 = 4; r2 = -2; p = (k === 2 ? 5 : 6); q = (k === 2 ? 1 : 2); r1 = (p - q) / (k - 1); r2 = -(p + q) / (k + 1); if (f === 3 && q % k){ q = k; r1 = (p - q) / (k - 1); r2 = -(p + q) / (k + 1); } }
  const droite = f === 2 ? `(${lin(q, k)})²` : `${k * k}${par(q / k)}²`;
  const eq = `${carre(p)} = ${droite}`;
  let expl = intro;
  if (f === 3) expl += `D'abord, ${k * k}${par(q / k)}² = (${k}${par(q / k)})² = (${lin(q, k)})². `;
  expl += `Premier cas : ${lin(p)} = ${lin(q, k)}, soit ${cf(k - 1)}x = ${sg(p - q)}${k - 1 === 1 ? '' : ', donc x = ' + V(r1)}. Second cas : ${lin(p)} = −(${lin(q, k)}), soit ${k + 1}x = ${sg(-p - q)}, donc x = ${V(r2)}. `;
  const piege = 'Piège : ne traiter que le premier cas fait perdre une solution.';
  if (R.int(0, 1)) return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [r1, r2], [ens([r1]), ens([-r1, -r2]), ens([r2]), ens([r1, -r2])], expl + `Les solutions sont ${ens([r1, r2])}. ` + piege);
  return Qv(`Quelle est la somme des solutions de l'équation ${eq} ?`, r1 + r2, [r1, -(r1 + r2), r1 - r2, r2], V, 1, expl + `Somme : ${V(r1)} + ${pn(r2)} = ${V(r1 + r2)}. ` + piege);
}

/* 4b · x² − a² et un facteur commun avec l'autre membre. */
function s4b(R){
  const intro = 'Factorise la différence de deux carrés pour faire apparaître un facteur commun aux deux membres, puis passe tout du même côté et utilise le produit nul. ';
  const a = R.int(2, 9), s = R.pick([1, -1]), z = s * a, f = R.pick([1, 1, 1, 2, 3]);
  const fz = par(-z), fo = par(z);                                     // (x − z) et (x + z)
  if (f === 1){
    const coinc = R.int(0, 1) === 0;
    const k = coinc ? 2 * z : tire(R, -9, 9, [2 * z]);
    const r2 = k - z, sol = coinc ? [z] : [z, r2];
    const droite = R.int(0, 1) ? poly([[k, 'x'], [-k * z, '']]) : k === 1 ? lin(-z) : `${cf(k)}${fz}`;
    const eq = `x² − ${a * a} = ${droite}`;
    const reste = lin(z - k);
    let expl = intro + `x² − ${a * a} = ${fz}${fo}` + (droite.indexOf('(') < 0 && k !== 1 ? ` et ${droite} = ${cf(k)}${fz}` : '') + `. L'équation devient ${fz}${fo} ${k > 0 ? '−' : '+'} ${cf(Math.abs(k))}${fz} = 0, soit ${fz}[${lin(z)}${plus(-k)}] = 0, c'est-à-dire ${reste === 'x' ? 'x' + fz : fz + '(' + reste + ')'} = 0. `;
    const fin = coinc ? `Les deux facteurs sont égaux : seule x = ${V(z)} convient, il y a une seule solution. ` : `Donc x = ${V(z)} ou x = ${V(r2)}. `;
    const pg = coinc ? 'Piège : compter deux solutions alors que les deux facteurs donnent la même valeur.' : `Piège : diviser par ${fz} fait perdre la solution ${V(z)}.`;
    expl += fin;
    const question = R.pick(['set', 'count', 'count', 'sum', 'sum']);
    if (question === 'set') return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, sol, [ens([r2 === z ? -z : r2]), ens([-z, r2]), ens([z, -r2]), ens([-z, z])], expl + pg);
    if (question === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, sol.length, R, coinc ? ['2', '0'] : ['1', '3'], expl + pg, ['0', '1', '2', '3']);
    const S = sol.reduce((u, w) => u + w, 0);
    return Qv(`Quelle est la somme des solutions de l'équation ${eq} ?`, S, [r2, z + r2 === S ? -S : z + r2, -S, k + z], V, 1, expl + (coinc ? `La somme vaut donc ${V(S)}. ` : `Somme : ${V(z)} + ${pn(r2)} = ${V(S)}. `) + pg);
  }
  if (f === 2){
    const eq = `${carre(-z)} = x² − ${a * a}`;
    const expl = intro + `x² − ${a * a} = ${fz}${fo}. L'équation devient ${carre(-z)} − ${fz}${fo} = 0, soit ${fz}[${par(-z)} − ${par(z)}] = 0. Or ${par(-z)} − ${par(z)} = ${sg(-2 * z)}, donc ${fz} × ${pn(-2 * z)} = 0 : seule x = ${V(z)} convient. Piège : croire que l'égalité est vraie pour tout x, alors que ${carre(-z)} = x²${plus(-2 * z)}x + ${a * a} n'est pas x² − ${a * a}.`;
    if (R.int(0, 1)) return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, 1, R, ['une infinité', '2'], expl, ['0', '1', '2', 'une infinité']);
    return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [z], [ens([-z, z]), ens([-z]), 'aucune solution'], expl);
  }
  const eq = `${carre(-z)} = ${a * a} − x²`;
  const corps = intro + `${a * a} − x² = −(x² − ${a * a}) = −${fz}${fo}. L'équation devient ${carre(-z)} + ${fz}${fo} = 0, soit ${fz}[${par(-z)} + ${par(z)}] = 0, c'est-à-dire ${fz} × 2x = 0. Donc x = ${V(z)} ou x = 0. `;
  const pg = `Piège : diviser par ${fz} fait perdre la solution ${V(z)}.`;
  const question = R.pick(['set', 'count', 'sum']);
  if (question === 'set') return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [0, z], [ens([0]), ens([-z, z]), ens([z]), ens([0, -z])], corps + pg);
  if (question === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, 2, R, ['1', '0'], corps + pg, ['0', '1', '2', '3']);
  return Qv(`Quelle est la somme des solutions de l'équation ${eq} ?`, z, [0, -z, 2 * z], V, 1, corps + `Somme : 0 + ${pn(z)} = ${V(z)}. ` + pg);
}

/* 4c · Équations bicarrées simples : poser X = x², ou factoriser par x². */
function s4c(R){
  if (R.int(0, 1)){
    let u = 3, v = 1;
    for (let t = 0; t < 60; t++){ const a1 = R.int(2, 9), b1 = R.int(1, 8); if (b1 < a1 && (a1 - b1) % 2 === 0 && (a1 * a1 + b1 * b1) / 2 <= 60 && (a1 * a1 - b1 * b1) / 2 <= 20){ u = a1; v = b1; break; } }
    const a = (u * u + v * v) / 2, b = (u * u - v * v) / 2;
    const eq = R.int(0, 1) ? `(x² − ${a})² = ${b * b}` : `(x² − ${a})² − ${b * b} = 0`;
    const expl = `Pose X = x², résous l'équation en X, puis reviens à x : chaque valeur strictement positive de X donne deux valeurs de x. (X − ${a})² = ${b * b} donne X − ${a} = ${b} ou X − ${a} = −${b}, soit x² = ${u * u} ou x² = ${v * v}. Donc x = ±${u} ou x = ±${v} : quatre solutions, −${u}, −${v}, ${v} et ${u}. `;
    const qt = R.pick(['max', 'count', 'minpos']);
    if (qt === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, 4, R, ['2', '3'], expl + 'Piège : s\'arrêter à x² = ' + (u * u) + ' ou oublier les solutions négatives.');
    if (qt === 'max') return Qv(`Quelle est la plus grande solution de l'équation ${eq} ?`, u, [u * u, v, b, a], V, 1, expl + `La plus grande est ${u}. Piège : ${u * u} est la valeur de x², pas celle de x.`, w => w > 0 && w !== v);
    return Qv(`Quelle est la plus petite solution positive de l'équation ${eq} ?`, v, [v * v, u, b, -v], V, 1, expl + `La plus petite positive est ${v}. Piège : −${v} est négative, et ${v * v} est la valeur de x².`, w => w !== u && w !== -u && w !== -v);
  }
  const cas = R.pick(['carre', 'carre', 'nc', 'neg']), m = R.int(2, 9);
  const k = cas === 'carre' ? m * m : cas === 'nc' ? R.pick(NONCARRES) : -R.int(1, 20);
  const eq = R.int(0, 1) ? `x⁴ = ${poly([[k, 'x²']])}` : `x⁴ ${k > 0 ? '−' : '+'} ${poly([[Math.abs(k), 'x²']])} = 0`;
  let expl = `Factorise par x² au lieu de diviser par x², puis applique la règle du produit nul. L'équation s'écrit x²(x² ${k > 0 ? '− ' + k : '+ ' + (-k)}) = 0 : soit x² = 0, donc x = 0 ; soit x² = ${sg(k)}`;
  let n;
  if (k > 0){ n = 3; expl += (cas === 'carre' ? `, donc x = ${m} ou x = −${m}` : `, donc x = √${k} ou x = −√${k}`) + '. Il y a 3 solutions. Piège : diviser par x² fait perdre la solution 0, et x² = 0 ne donne qu\'une solution, pas deux.'; }
  else { n = 1; expl += ', impossible car un carré n\'est jamais négatif. Seule x = 0 convient : une seule solution. Piège : diviser par x² fait conclure à tort qu\'il n\'y a aucune solution.'; }
  return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, n, R, k > 0 ? ['2', '4'] : ['0', '2'], expl);
}

/* 4d · Hausse puis baisse du même taux : (1 + t)(1 − t) = 1 − t². */
const PRIX4 = [100, 200, 250, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500, 5000];
function s4d(R){
  const t = R.pick([10, 20, 30, 40, 50]), L = t * t / 100, ordre = R.int(0, 1), v = R.int(0, 1);
  const deux = ordre ? 'baisse d\'un certain pourcentage, puis augmente du même pourcentage' : 'augmente d\'un certain pourcentage, puis baisse du même pourcentage';
  const coef = nb(1 - L / 100, 4);
  let q, debut;
  if (v === 0){
    const suj = R.pick(['Un prix', 'Le cours d\'une action', 'Le chiffre d\'affaires d\'un magasin', 'Le nombre de visiteurs d\'un site', 'Le loyer d\'un local']);
    q = `${suj} ${deux}. Au total, il a baissé de ${nb(L)} %. Quel est ce pourcentage ?`;
    debut = `Une baisse globale de ${nb(L)} % correspond au coefficient ${coef}. `;
  } else {
    const liste = PRIX4.filter(P => (P * L) % 100 === 0), P = R.pick(liste.length ? liste : [1000]), F = P - P * L / 100;
    q = `Un article coûte ${nb(P, 0)} €. Son prix ${deux} : il coûte alors ${nb(F, 0)} €. Quel est ce pourcentage ?`;
    debut = `Coefficient global : ${nb(F, 0)} ÷ ${nb(P, 0)} = ${coef}. `;
  }
  const expl = 'Écris les deux coefficients multiplicateurs : leur produit est de la forme (1 + t)(1 − t) = 1 − t², une différence de deux carrés. '
    + debut + `Donc 1 − t² = ${coef}, t² = ${nb(L / 100, 4)} et t = ${nb(t / 100)} (t est positif), soit ${t} %. Vérification : ${nb(1 + t / 100)} × ${nb(1 - t / 100)} = ${coef}. Piège : ${nb(L)} % ÷ 2 = ${nb(L / 2)} % est faux ; une hausse et une baisse de même taux ne se compensent jamais, et la perte vaut t × t.`;
  return Qv(q, t, [L / 2, L, Math.sqrt(L)], pc, 5, expl, w => w > 0 && w < 100);
}

/* 4e · Différence de deux carrés : x² + b² = c², Pythagore. */
const TRIPLETS = [];
for (let h = 5; h <= 100; h++) for (let p = 3; p < h; p++){ const q2 = h * h - p * p, q = Math.round(Math.sqrt(q2)); if (q * q === q2 && q >= 3 && p <= 25) TRIPLETS.push([p, q, h]); }
function s4e(R){
  const tr = R.pick(TRIPLETS), x = tr[0], b = tr[1], c = tr[2], v = R.int(0, 3);
  const unite = v === 2 ? ' cm' : v === 3 ? ' dm' : '', fmt = w => V(w) + unite;
  let q;
  if (v === 0) q = `Quelle est la solution positive de l'équation x² + ${b}² = ${c}² ?`;
  else if (v === 1) q = `Quelle est la solution positive de l'équation x² = ${c}² − ${b}² ?`;
  else if (v === 2) q = x < b ? `Un rectangle a une diagonale de ${c} cm et une longueur de ${b} cm. Quelle est sa largeur ?`
    : `Un rectangle a une diagonale de ${c} cm et une largeur de ${b} cm. Quelle est sa longueur ?`;
  else q = `Une échelle de ${c} dm est appuyée contre un mur vertical, son pied posé sur le sol horizontal à ${b} dm du mur. À quelle hauteur touche-t-elle le mur ?`;
  const debut = v >= 2 ? `Le théorème de Pythagore donne x² + ${b}² = ${c}². ` : '';
  const expl = `Isole x², puis calcule la différence de deux carrés avec a² − b² = (a − b)(a + b), bien plus rapide que de calculer chaque carré. ${debut}x² = ${c}² − ${b}² = (${c} − ${b})(${c} + ${b}) = ${c - b} × ${c + b} = ${x * x}, donc x = ${x}${unite} (on garde la valeur positive). Piège : la racine de ${c}² − ${b}² n'est pas ${c} − ${b} = ${c - b} ; et ${x + 1}² = ${(x + 1) * (x + 1)}, pas ${x * x}.`;
  /* distracteurs tous plus petits que c, comme la bonne réponse : aucun encadrement ne les élimine */
  return Qv(q, x, [c - b, x + 1, x - 1, x + 2], fmt, 1, expl, w => w > 0 && w < c);
}

/* 4g · (x² − ax)² = b²x² : A² = B², puis chaque cas se factorise par x (jamais de division par x²). */
function s4g(R){
  const a = tire(R, -9, 9), b = R.int(1, 6), coinc = Math.abs(a) === b;
  const Atxt = poly([[1, 'x²'], [-a, 'x']]), Btxt = (b === 1 ? '' : b) + 'x', B2 = (b === 1 ? '' : b * b) + 'x²', disp = R.int(0, 3);
  const eq = disp === 0 ? `(${Atxt})² = ${B2}` : disp === 1 ? `(${Atxt})² − ${B2} = 0` : disp === 2 ? `x²${par(-a)}² = ${B2}` : `(${Atxt})² = ${b === 1 ? 'x²' : '(' + Btxt + ')²'}`;
  const intro = 'Reconnais deux carrés égaux, A² = B², puis écris A = B ou A = −B et factorise chaque équation par x au lieu de diviser. ';
  const casTexte = s => s === 0 ? `x² = 0, donc x = 0` : `${poly([[1, 'x²'], [-s, 'x']])} = 0, soit x${par(-s)} = 0, donc x = 0 ou x = ${V(s)}`;
  const s1 = a + b, s2 = a - b, sol = distinctes([{ r: [0, s1] }, { r: [0, s2] }]), n = sol.length;
  let corps = intro;
  if (disp === 2) corps += `À gauche, x²${par(-a)}² = [x${par(-a)}]² = (${Atxt})². `;
  if (disp !== 3 && b !== 1) corps += `À droite, ${B2} = (${Btxt})². `;
  corps += `Premier cas : ${Atxt} = ${Btxt}, soit ${casTexte(s1)}. Second cas : ${Atxt} = −${Btxt}, soit ${casTexte(s2)}. `;
  corps += coinc ? `La valeur 0 est obtenue dans les deux cas et ne compte qu'une fois : les solutions sont ${ens(sol)}, soit 2 solutions. ` : `Les solutions sont ${ens(sol)}, soit 3 solutions. `;
  const pg = `Piège : diviser par x² donne ${par(-a)}² = ${b * b} et fait perdre la solution 0 ; ne traiter que le premier cas fait perdre une solution.`;
  const qt = R.pick(coinc ? ['count', 'count', 'max', 'set'] : ['count', 'count', 'max', 'prod', 'set']);
  if (qt === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, n, R, coinc ? ['3', '4'] : ['2', '4'], corps + pg);
  if (qt === 'max'){
    const M = Math.max.apply(null, sol);
    return Qv(`Quelle est la plus grande solution de l'équation ${eq} ?`, M, [s1, s2, a, b, 2 * a, a * a], V, 1, corps + `La plus grande est ${V(M)}. ` + pg);
  }
  if (qt === 'prod'){
    const P = s1 * s2;
    return Qv(`Quel est le produit des solutions autres que 0 de l'équation ${eq} ?`, P, [-P, a * a + b * b, 2 * a, a * b, a * a], V, 1, corps + `Produit des solutions autres que 0 : ${pn(s1)} × ${pn(s2)} = ${V(P)} (c'est a² − b² avec a = ${V(a)} et b = ${b}). ` + pg, w => w !== 0);
  }
  return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, sol, [ens([s1, s2]), ens([0, s1]), ens([0, -s1, -s2]), ens([0, s1, b - a])], corps + pg);
}

/* 4h · Paramètre : pour combien d'entiers k l'équation a-t-elle un nombre donné de solutions ? */
const PLAGES4H = [[-10, 10], [-8, 8], [-12, 12], [-6, 6], [-20, 20], [-5, 15], [-15, 5], [-9, 9], [-7, 7], [-4, 16]];
function formes4h(R){
  const c = tire(R, -6, 6), p = tire(R, -9, 9), C = c * c;
  return [
    { eq: 'x²(x² − k) = 0', n: k => k > 0 ? 3 : 1,
      cas: 'x²(x² − k) = 0 donne x = 0 (le facteur x²) et x² = k. Si k est strictement positif, x² = k apporte deux solutions opposées : 3 solutions en tout. Si k = 0, x² = 0 redonne 0 : une seule solution. Si k est négatif, x² = k est impossible : une seule solution, 0. ',
      pg: 'Piège : compter k = 0 parmi les valeurs qui donnent 3 solutions, alors que x² = 0 n\'ajoute rien.' },
    { eq: 'x(x² − k) = 0', n: k => k > 0 ? 3 : 1,
      cas: 'x(x² − k) = 0 donne x = 0 et x² = k. Si k est strictement positif : 3 solutions (0, √k et −√k). Si k = 0 : une seule solution, 0. Si k est négatif : x² = k est impossible, une seule solution. ',
      pg: 'Piège : compter k = 0, qui ne donne qu\'une solution, ou oublier que k = 1 convient (√1 = 1).' },
    { eq: `(x² − k)${par(c)} = 0`, n: k => k > 0 ? (k === C ? 2 : 3) : k === 0 ? 2 : 1,
      cas: `(x² − k)${par(c)} = 0 donne x = ${V(-c)} et x² = k. Si k est négatif : une seule solution, ${V(-c)}. Si k = 0 : deux solutions, 0 et ${V(-c)}. Si k est strictement positif : √k et −√k s'ajoutent, soit 3 solutions, sauf si k = ${C}, car alors ${V(-c)} est déjà l'une des deux et il ne reste que 2 solutions. `,
      pg: `Piège : oublier le cas k = ${C}, où une solution est comptée deux fois, ou compter k = 0 comme s'il donnait 3 solutions.` },
    { eq: `(x² + k)${par(c)} = 0`, n: k => k < 0 ? (-k === C ? 2 : 3) : k === 0 ? 2 : 1,
      cas: `(x² + k)${par(c)} = 0 donne x = ${V(-c)} et x² = −k. Si k est strictement positif : x² = −k est impossible, une seule solution. Si k = 0 : deux solutions, 0 et ${V(-c)}. Si k est négatif : x² = −k apporte deux solutions opposées, soit 3 en tout, sauf si k = −${C}, car alors ${V(-c)} est déjà l'une des deux : 2 solutions seulement. `,
      pg: `Piège : lire x² + k comme x² − k et inverser les signes, ou oublier le cas k = −${C}.` },
    { eq: 'x² − kx = 0', n: k => k !== 0 ? 2 : 1,
      cas: 'x² − kx = x(x − k) = 0 donne x = 0 ou x = k : deux solutions si k n\'est pas nul, une seule si k = 0 (les deux valeurs sont confondues). ',
      pg: 'Piège : oublier le cas k = 0, ou diviser par x et ne voir que la solution k.' },
    { eq: `${carre(p)} = k`, n: k => k > 0 ? 2 : k === 0 ? 1 : 0,
      cas: `${carre(p)} = k a deux solutions si k est strictement positif (${lin(p)} = √k ou −√k), une seule si k = 0 (x = ${V(-p)}), aucune si k est négatif. `,
      pg: 'Piège : compter k = 0 avec les valeurs qui donnent deux solutions, ou croire qu\'il faut que k soit un carré parfait.' },
    { eq: '(x² − k)² = 0', n: k => k > 0 ? 2 : k === 0 ? 1 : 0,
      cas: '(x² − k)² = 0 équivaut à x² − k = 0, c\'est-à-dire x² = k : deux solutions si k est strictement positif, une seule si k = 0, aucune si k est négatif. ',
      pg: 'Piège : croire que le carré double le nombre de solutions, ou compter k = 0 avec les valeurs qui en donnent deux.' }
  ];
}
function decrireK(S){
  if (S.length === 1) return `la seule valeur ${V(S[0])}`;
  const lo = S[0], hi = S[S.length - 1], plein = hi - lo + 1;
  if (S.length === plein) return `les entiers de ${V(lo)} à ${V(hi)}`;
  if (S.length === plein - 1){ let e = lo; for (let k = lo; k <= hi; k++) if (S.indexOf(k) < 0){ e = k; break; } return `les entiers de ${V(lo)} à ${V(hi)} sauf ${V(e)}`; }
  return S.map(V).join(', ');
}
function s4h(R){
  const F = R.pick(formes4h(R)), pl = R.pick(PLAGES4H), lo = pl[0], hi = pl[1], taille = hi - lo + 1;
  /* cible : un nombre exact de solutions, « au moins une » ou « aucune », avec un comptage ni vide ni plein */
  const cibles = [];
  [0, 1, 2, 3].forEach(N => cibles.push({ t: N, test: k => F.n(k) === N }));
  cibles.push({ t: 'aumoins', test: k => F.n(k) >= 1 });
  const bons = cibles.map(cb => { const S = []; for (let k = lo; k <= hi; k++) if (cb.test(k)) S.push(k); return { cb, S }; }).filter(o => o.S.length >= 1 && o.S.length <= taille - 1);
  if (!bons.length) return s4g(R);
  const { cb, S } = R.pick(bons), cnt = S.length;
  const quoi = cb.t === 'aumoins' ? 'a-t-elle au moins une solution réelle' : cb.t === 0 ? 'n\'a-t-elle aucune solution réelle' : cb.t === 1 ? 'a-t-elle une seule solution réelle' : `a-t-elle exactement ${cb.t} solutions réelles`;
  const q = `Pour combien d'entiers k compris entre ${V(lo)} et ${V(hi)} l'équation ${F.eq} ${quoi} ?`;
  const expl = 'Trouve d\'abord, selon le signe ou la valeur de k, combien de solutions l\'équation possède, puis compte les entiers k de l\'intervalle qui conviennent. ' + F.cas
    + `Dans l'intervalle de ${V(lo)} à ${V(hi)}, les valeurs de k qui conviennent sont ${decrireK(S)} : ${cnt} valeur${cnt > 1 ? 's' : ''}. ` + F.pg;
  return Qv(q, cnt, [cnt + 1, cnt - 1, taille, cnt + 2, hi, 2 * cnt], V, 1, expl, w => w >= 0 && w <= taille);
}

/* 4i · Grands carrés cachés : (n − d)(n + d) + d², m² + 2m + 1, somme des impairs. Choix serrés autour de n. */
function s4i(R){
  const v = R.int(0, 3);
  if (v === 0 || v === 3){
    const rond = R.int(0, 2) === 0, n = rond ? R.pick([1000, 1500, 2000, 2500, 3000]) : R.int(1001, 2099), d = rond ? R.int(3, 7) : R.pick([3, 4, 5]);
    const eq = v === 0 ? `x² = ${nb(n - d, 0)} × ${nb(n + d, 0)} + ${d * d}` : `x² − ${d * d} = ${nb(n - d, 0)} × ${nb(n + d, 0)}`;
    const expl = `Reconnais un produit de deux nombres qui encadrent le même entier à égale distance : c'est une différence de deux carrés. ${nb(n - d, 0)} × ${nb(n + d, 0)} = (${nb(n, 0)} − ${d})(${nb(n, 0)} + ${d}) = ${nb(n, 0)}² − ${d * d}. Donc x² = ${nb(n, 0)}², et la solution positive est ${nb(n, 0)}. Piège : poser la multiplication à la main, ou se tromper d'une unité sur le nombre du milieu, qui est la moyenne des deux facteurs.`;
    return Qv(`Quelle est la solution positive de l'équation ${eq} ?`, n, [n - 1, n + 1, n + 2], V, 1, expl, w => w > 0);
  }
  if (v === 1){
    const m = R.int(0, 1) ? R.pick([19, 29, 39, 49, 59, 69, 79, 89, 99, 199, 299, 999]) : R.int(21, 98), up = R.int(0, 2) > 0;
    const eq = up ? `x² = ${m}² + ${2 * m + 1}` : `x² = ${m}² − ${2 * m - 1}`, rep = up ? m + 1 : m - 1;
    const expl = up
      ? `Reconnais le développement du carré du nombre suivant : (m + 1)² = m² + 2m + 1. Ici ${2 * m + 1} = 2 × ${m} + 1, donc x² = ${m}² + 2 × ${m} + 1 = (${m} + 1)² = ${m + 1}². La solution positive est ${m + 1}. Piège : répondre ${m}, en oubliant ce qui est ajouté à ${m}², ou ${m + 2}, alors que (${m} + 2)² = ${m}² + 4 × ${m} + 4.`
      : `Reconnais le développement du carré du nombre précédent : (m − 1)² = m² − 2m + 1. Ici ${2 * m - 1} = 2 × ${m} − 1, donc x² = ${m}² − 2 × ${m} + 1 = (${m} − 1)² = ${m - 1}². La solution positive est ${m - 1}. Piège : répondre ${m}, en oubliant ce qui est retiré à ${m}², ou ${m - 2}, alors que (${m} − 2)² = ${m}² − 4 × ${m} + 4.`;
    return Qv(`Quelle est la solution positive de l'équation ${eq} ?`, rep, [m, up ? m + 2 : m - 2, up ? m + 3 : m - 3], V, 1, expl, w => w > 0);
  }
  const n = R.int(8, 30), last = 2 * n - 1;
  const expl = `La somme des premiers nombres impairs est toujours un carré parfait : 1 = 1², 1 + 3 = 2², 1 + 3 + 5 = 3², et ainsi de suite. De 1 à ${last}, il y a (${last} + 1) ÷ 2 = ${n} nombres impairs, donc la somme vaut ${n}² = ${n * n}, et x = ${n}. Piège : ${last} est le dernier terme, pas le nombre de termes.`;
  return Qv(`Quelle est la solution positive de l'équation x² = 1 + 3 + 5 + … + ${last} ?`, n, [last, n - 1, n + 1], V, 1, expl, w => w > 0);
}

/* 4j · (x + p)³ = k²(x + p) : mettre (x + p) en facteur au lieu de diviser par lui. */
function s4j(R){
  const p = tire(R, -9, 9), k = R.int(1, 7);
  const intro = 'Ne divise jamais par une expression qui contient x : passe tout du même côté et mets en facteur ce qui est commun aux deux membres. ';
  const eq = `${par(p)}³ = ${k === 1 ? lin(p) : k * k + par(p)}`;
  const sol = [-p, -p + k, -p - k];
  const corps = intro + `${par(p)}³ − ${k === 1 ? '' : k * k}${par(p)} = ${par(p)}[${carre(p)} − ${k * k}] = 0. Soit ${lin(p)} = 0, donc x = ${V(-p)} ; soit ${carre(p)} = ${k * k}, donc ${lin(p)} = ${k} ou ${lin(p)} = −${k}, c'est-à-dire x = ${V(-p + k)} ou x = ${V(-p - k)}. Il y a 3 solutions. `;
  const pg = `Piège : diviser par ${par(p)} fait perdre la solution ${V(-p)}.`;
  const qt = R.pick(['count', 'count', 'set', 'sum', 'sum']);
  if (qt === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, 3, R, ['2', '1'], corps + pg, ['0', '1', '2', '3']);
  if (qt === 'set') return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, sol, [ens([-p + k, -p - k]), ens([-p, -p + k]), ens([p, p + k, p - k])], corps + pg);
  return Qv(`Quelle est la somme des solutions de l'équation ${eq} ?`, -3 * p, [-2 * p, -p, 3 * p, -3 * p + k], V, 1, corps + `Somme : ${sol.map(pn).join(' + ')} = ${V(-3 * p)}. ` + pg);
}

/* =====================================================
   NIVEAU 5 · haut du test adaptatif
   ===================================================== */

/* 5a · (x² − a)² = b² ou (x² + c)² = b² : discuter selon le signe de X = x². */
function s5a(R){
  const cas = R.pick(['quatre', 'quatre', 'trois', 'deux1', 'deux2', 'un', 'zero']);
  const intro = 'Pose X = x², résous d\'abord l\'équation en X, puis compte les valeurs de x : deux si X est strictement positif, une seule si X vaut zéro, aucune si X est négatif. ';
  const compte = X => X > 0 ? 2 : X === 0 ? 1 : 0;
  const decrire = X => X > 0 ? (ent(Math.sqrt(X)) ? `x² = ${X} donne x = ±${Math.sqrt(X)}` : `x² = ${X} donne x = ±√${X}`) : X === 0 ? 'x² = 0 donne x = 0' : `x² = ${sg(X)} est impossible`;
  if (cas === 'quatre'){
    let u = 4, v = 2;
    for (let t = 0; t < 60; t++){ const a1 = R.int(2, 9), b1 = R.int(1, 8); if (b1 < a1 && (a1 - b1) % 2 === 0 && (a1 * a1 + b1 * b1) / 2 <= 60 && (a1 * a1 - b1 * b1) / 2 <= 25){ u = a1; v = b1; break; } }
    const a = (u * u + v * v) / 2, b = (u * u - v * v) / 2, eq = `(x² − ${a})² = ${b * b}`;
    const base = intro + `x² − ${a} = ${b} ou x² − ${a} = −${b}, soit x² = ${u * u} ou x² = ${v * v}. Les solutions sont −${u}, −${v}, ${v} et ${u}. `;
    const qt = R.pick(['count', 'prod', 'sq']);
    if (qt === 'prod') return Qv(`Quel est le produit des solutions de l'équation ${eq} ?`, u * u * v * v, [-u * u * v * v, 0, u * v], V, 1,
      base + `Produit : (−${u}) × ${u} × (−${v}) × ${v} = ${u * u} × ${v * v} = ${u * u * v * v} (deux signes moins, le produit est positif). Piège : ${u * v} ne tient compte que des solutions positives.`);
    if (qt === 'sq') return Qv(`Quelle est la somme des carrés des solutions de l'équation ${eq} ?`, 2 * (u * u + v * v), [u * u + v * v, 0, 2 * (u + v)], V, 1,
      base + `Chaque valeur de x² est atteinte deux fois : la somme des carrés vaut 2 × ${u * u} + 2 × ${v * v} = ${2 * (u * u + v * v)}. Piège : ${u * u + v * v} oublie que chaque valeur de x² vient de deux solutions opposées.`);
    return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, 4, R, ['2', '3'], base + 'Il y a 4 solutions. Piège : oublier les solutions négatives.');
  }
  let a, b, sgn, eq;
  if (cas === 'trois'){ a = R.int(2, 20); b = a; sgn = -1; }
  else if (cas === 'deux1'){ a = R.int(1, 12); b = R.int(a + 1, a + 8); sgn = -1; }
  else if (cas === 'deux2'){ a = R.int(1, 10); b = R.int(a + 1, a + 8); sgn = 1; }
  else if (cas === 'un'){ a = R.int(1, 15); b = a; sgn = 1; }
  else { a = R.int(3, 20); b = R.int(1, a - 1); sgn = 1; }
  eq = R.int(0, 1) ? `(x² ${sgn < 0 ? '−' : '+'} ${a})² = ${b * b}` : `(x² ${sgn < 0 ? '−' : '+'} ${a})² − ${b * b} = 0`;
  const X1 = -sgn * a + b, X2 = -sgn * a - b, n = compte(X1) + compte(X2);
  const expl = intro + `x² ${sgn < 0 ? '−' : '+'} ${a} = ${b} ou x² ${sgn < 0 ? '−' : '+'} ${a} = −${b}, soit x² = ${sg(X1)} ou x² = ${sg(X2)}. ${decrire(X1)} ; ${decrire(X2)}. Au total : ${nbSol(n)}. `
    + (n === 3 ? 'Piège : compter quatre solutions alors que x² = 0 n\'en donne qu\'une.'
      : n === 1 ? 'Piège : compter deux solutions pour x² = 0, ou garder une valeur négative de x².'
      : n === 0 ? 'Piège : oublier de vérifier le signe des valeurs trouvées pour x².'
      : 'Piège : compter quatre solutions sans vérifier que l\'une des valeurs de x² est négative.');
  return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, n, R, [n === 4 ? '2' : '4'], expl);
}

/* 5b · Facteur commun x² − a², avec un troisième facteur. */
function s5b(R){
  const a = R.int(2, 9), coinc = R.int(0, 2) === 0, d = R.int(0, 2);
  const intro = 'Ne simplifie pas par le facteur commun : passe tout du même côté, mets ce facteur en évidence, puis applique la règle du produit nul. ';
  const r = coinc ? R.pick([a, -a]) : tire(R, -9, 9, [a, -a]);
  let eq, etape, sx = null;
  if (d === 0 || d === 2){
    const m = R.pick([2, 3, 4, 5].filter(v => v !== r)), pp = m - r;   // x + pp − m = x − r, et pp ne vaut jamais 0
    const droite = d === 0 ? poly([[m, 'x²'], [-m * a * a, '']]) : `${par(-a)}${par(m * a, m)}`;
    eq = `(x² − ${a * a})${par(pp)} = ${droite}`;
    sx = -(pp + m);
    etape = (d === 0 ? `${droite} = ${m}(x² − ${a * a})` : `${droite} = ${m}${par(-a)}${par(a)} = ${m}(x² − ${a * a})`)
      + `. L'équation s'écrit (x² − ${a * a})${par(pp)} − ${m}(x² − ${a * a}) = 0, soit (x² − ${a * a})(${lin(pp)} − ${m}) = 0, c'est-à-dire (x² − ${a * a})${par(-r)} = 0. `;
  } else {
    const k = R.pick([2, 3, -1]), qd = tire(R, -9, 9, [(1 - k) * r]), pp = qd - (1 - k) * r;   // (1 − k)x = q − p, pp non nul
    eq = `(x² − ${a * a})${par(pp)} = (x² − ${a * a})${par(qd, k)}`;
    etape = `L'équation s'écrit (x² − ${a * a})[${par(pp)} − ${par(qd, k)}] = 0, soit (x² − ${a * a})(${lin(pp - qd, 1 - k)}) = 0. `;
  }
  const sol = distinctes([{ r: [-a, a] }, { r: [r] }]), n = sol.length;
  let expl = intro + etape + `x² − ${a * a} = 0 donne x = ${a} ou x = −${a} ; l'autre facteur donne x = ${V(r)}. ` + (coinc ? `La valeur ${V(r)} apparaît deux fois : il y a 2 solutions. ` : 'Les trois valeurs sont différentes : 3 solutions. ');
  const piege = `Piège : diviser par x² − ${a * a} ne laisse que x = ${V(r)} et fait perdre ${coinc ? 'une solution' : 'deux solutions'}.`;
  const qt = R.pick(['count', 'count', 'prod', 'prod', 'set']);
  if (qt === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, n, R, ['1', coinc ? '3' : '2'], expl + piege);
  if (qt === 'set'){
    const aut = coinc ? [ens([r]), ens([-r])] : [ens([r]), ens([a, r]), ens([-a, a, -r]), ens([-a, a])];
    if (sx !== null) aut.push(ens([-a, a, sx]));
    return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, sol, aut, expl + piege);
  }
  const P = sol.reduce((u, w) => u * w, 1);
  return Qv(`Quel est le produit des solutions de l'équation ${eq} ?`, P, [r, -P, a * a * r === P ? -a * a * r : a * a * r, -a * a], V, 1, expl + `Produit : ${sol.map(pn).join(' × ')} = ${V(P)}. ` + piege, w => w !== 0);
}

/* 5c · Taux à trois étapes : deux évolutions égales et une évolution connue. */
const COMBOS5 = [];
[10, 20, 30, 40, 50].forEach(t => [1, -1].forEach(dir => [25, -20, 50, -50, 100, -25, 20, -10, 10].forEach(e => {
  const c2 = Math.pow(100 + dir * t, 2), G = c2 * (100 + e);
  /* on écarte les cas où le raisonnement additif (faux) tomberait juste par hasard */
  if (G % 10000 === 0){ const gp = G / 10000 - 100; if (gp !== 0 && gp > -100 && gp <= 200 && Math.abs(gp - e) / 2 !== t) COMBOS5.push({ t, dir, e, gp }); }
})));
function s5c(R){
  const c = R.pick(COMBOS5), t = c.t, dir = c.dir, e = c.e, gp = c.gp, avant = R.int(0, 1) === 1;
  const ev = e > 0 ? `une hausse de ${e} %` : `une baisse de ${-e} %`, deux = dir > 0 ? 'hausses' : 'baisses', un = dir > 0 ? 'hausse' : 'baisse';
  const obj = R.pick(['Un prix', 'Le cours d\'une action', 'Le chiffre d\'affaires d\'une boutique', 'Le nombre d\'abonnés d\'un podcast']);
  const q = avant
    ? `${obj} subit d'abord ${ev}, puis deux ${deux} successives de même pourcentage. Au total, il a ${gp > 0 ? 'augmenté' : 'baissé'} de ${Math.abs(gp)} %. Quel est le pourcentage de chaque ${un} ?`
    : `${obj} subit deux ${deux} successives de même pourcentage, puis ${ev}. Au total, il a ${gp > 0 ? 'augmenté' : 'baissé'} de ${Math.abs(gp)} %. Quel est le pourcentage de chaque ${un} ?`;
  const ce = nb((100 + e) / 100), cg = nb((100 + gp) / 100), c2 = nb(Math.pow(100 + dir * t, 2) / 10000, 4), cc = nb((100 + dir * t) / 100);
  const inv = { 25: 'diviser par 1,25 revient à multiplier par 0,8', '-20': 'diviser par 0,8 revient à multiplier par 1,25', 50: 'diviser par 1,5 revient à prendre les deux tiers', '-50': 'diviser par 0,5 revient à multiplier par 2', 100: 'diviser par 2 revient à prendre la moitié', '-25': 'diviser par 0,75 revient à multiplier par 4 puis diviser par 3', 20: 'diviser par 1,2 revient à multiplier par 5 puis diviser par 6', '-10': 'diviser par 0,9 revient à multiplier par 10 puis diviser par 9', 10: 'diviser par 1,1 revient à multiplier par 10 puis diviser par 11' }[e];
  const g2 = Math.abs(Math.pow(100 + dir * t, 2) / 100 - 100), add = Math.abs(gp - e) / 2;
  const expl = 'Traduis chaque évolution par un coefficient multiplicateur : le produit des coefficients donne le coefficient global, d\'où une équation du type c² = nombre. '
    + `Avec c le coefficient de chaque ${un} : c² × ${ce} = ${cg}, donc c² = ${cg} ÷ ${ce} = ${c2} (${inv}). Le nombre positif dont le carré vaut ${c2} est ${cc}, soit une ${un} de ${t} %. Vérification : ${cc} × ${cc} × ${ce} = ${c2} × ${ce} = ${cg}. Piège : les pourcentages ne s'additionnent pas ; partager ${Math.abs(gp - e)} points en deux donne ${nb(add)} %, ce qui est faux.`;
  return Qv(q, t, [add, g2 / 2, g2], pc, 5, expl, w => w > 0 && w < 200);
}

/* 5d · (x² − a²)² = k²(x ± a)² : le carré commun (x ± a)². */
function s5d(R){
  const a = R.int(2, 9), s = R.pick([1, -1]), z = s * a, coinc = R.int(0, 2) === 0;
  const k = coinc ? 2 * a : tire(R, 1, 9, [2 * a]);
  const intro = 'Factorise la différence de deux carrés à gauche : le carré du membre de droite apparaît alors des deux côtés ; mets-le en facteur au lieu de diviser par lui. ';
  const fz = par(z), fo = par(-z);                                     // (x + z) au carré à droite, (x − z) l'autre facteur
  const eq = `(x² − ${a * a})² = ${k === 1 ? '' : k * k}${fz}²`;
  const sol = distinctes([{ r: [-z] }, { r: [z + k, z - k] }]), n = sol.length;
  const expl = intro + `x² − ${a * a} = ${fo}${fz}, donc (x² − ${a * a})² = ${fo}²${fz}². L'équation s'écrit ${fz}²[${fo}² − ${k * k}] = 0. Soit ${lin(z)} = 0, donc x = ${V(-z)} ; soit ${fo}² = ${k * k}, donc ${lin(-z)} = ${k} ou ${lin(-z)} = −${k}, c'est-à-dire x = ${V(z + k)} ou x = ${V(z - k)}. `
    + (coinc ? `La valeur ${V(-z)} apparaît deux fois : il y a 2 solutions, ${ens(sol)}. ` : `Il y a 3 solutions : ${ens(sol)}. `);
  const piege = `Piège : diviser par ${fz}² fait perdre la solution ${V(-z)}.`;
  const qt = R.pick(['count', 'count', 'sum', 'sum', 'set']);
  if (qt === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, n, R, [coinc ? '3' : '2', '4'], expl + piege);
  const S = sol.reduce((u, w) => u + w, 0);
  if (qt === 'sum') return Qv(`Quelle est la somme des solutions de l'équation ${eq} ?`, S, [2 * z, S - z, -S, z + k], V, 1, expl + `Somme : ${sol.map(pn).join(' + ')} = ${V(S)}. ` + piege);
  return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, sol, [ens([z + k, z - k]), ens([-z, z + k]), ens([z, -z - k, -z + k]), ens([-z, z])], expl + piege);
}

/* 5f · Facteur commun de degré trois : ne jamais diviser par une parenthèse. */
function s5f(R){
  const f = R.pick([1, 3]);
  const intro = 'Ne divise jamais par une expression qui contient x : passe tout du même côté et mets en facteur ce qui est commun aux deux membres. ';
  if (f === 1){
    const p = tire(R, -9, 9), q = tire(R, -9, 9, [p]);
    const eq = `${carre(p)}${par(q)} = ${par(p)}${carre(q)}`;
    const corps = intro + `${carre(p)}${par(q)} − ${par(p)}${carre(q)} = ${par(p)}${par(q)}[${par(p)} − ${par(q)}] = ${par(p)}${par(q)} × ${pn(p - q)}. Comme ${sg(p - q)} ne vaut pas zéro, il reste ${par(p)}${par(q)} = 0 : x = ${V(-p)} ou x = ${V(-q)}. `;
    const pg = `Piège : diviser des deux côtés par ${par(p)}${par(q)} donne ${lin(p)} = ${lin(q)}, impossible, et fait croire qu'il n'y a aucune solution.`;
    const qt = R.pick(['count', 'count', 'sum', 'sum', 'set']);
    if (qt === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, 2, R, ['0', '3'], corps + pg, ['0', '1', '2', '3']);
    if (qt === 'set') return Qs(`Quelles sont les solutions de l'équation ${eq} ?`, [-p, -q], ['aucune solution', ens([p, q]), ens([-p]), ens([-q])], corps + pg);
    return Qv(`Quelle est la somme des solutions de l'équation ${eq} ?`, -p - q, [p + q, -p, -q, 0], V, 1, corps + `Somme : ${V(-p)} + ${pn(-q)} = ${V(-p - q)}. ` + pg);
  }
  const p = tire(R, -9, 9), k = R.int(1, 7), coinc = R.int(0, 2) === 0;
  /* q jamais nul : « (x + 5)²(x) » serait illisible */
  const q = coinc ? R.pick([p + k, p - k].filter(v => v !== 0)) : tire(R, -9, 9, [p + k, p - k]);
  const eq = `${carre(p)}${par(q)} = ${k === 1 ? lin(q) : k * k + par(q)}`;
  const sol = distinctes([{ r: [-q] }, { r: [-p + k, -p - k] }]), n = sol.length;
  const corps = intro + `${carre(p)}${par(q)} − ${k === 1 ? '' : k * k}${par(q)} = ${par(q)}[${carre(p)} − ${k * k}] = 0. Soit x = ${V(-q)} ; soit ${carre(p)} = ${k * k}, donc x = ${V(-p + k)} ou x = ${V(-p - k)}. `
    + (coinc ? `La valeur ${V(-q)} apparaît deux fois : il y a 2 solutions. ` : 'Les trois valeurs sont différentes : 3 solutions. ');
  const pg = `Piège : diviser par ${par(q)} fait perdre la solution ${V(-q)}${coinc ? ', et compter 3 solutions oublie la valeur commune' : ''}.`;
  if (R.int(0, 1)) return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, n, R, [coinc ? '3' : '2', '1'], corps + pg, ['0', '1', '2', '3', '4']);
  const S = sol.reduce((u, w) => u + w, 0);
  return Qv(`Quelle est la somme des solutions de l'équation ${eq} ?`, S, [-2 * p, S + q, -S, S - q === S ? S + 1 : S - q], V, 1, corps + `Somme : ${sol.map(pn).join(' + ')} = ${V(S)}. ` + pg);
}

/* 5g · (x² + 2hx + c)² = m² : deux cas, puis la forme (x + h)² = nombre pour chacun. */
function s5g(R){
  const h = tire(R, -6, 6), form = R.pick(['nul', 'nul', 'prod', 'prod', 'tri']);
  let p = h, q = h, c0 = 0;
  if (form !== 'nul'){ const d = tire(R, -5, 5, [h, -h]); p = h + d; q = h - d; c0 = p * q; }   // p + q = 2h, p et q non nuls
  const D = h * h - c0;                                                          // x² + 2hx + c0 = (x + h)² − D, D ≥ 1
  /* m : un tiers des fois D + m est un carré parfait (premier cas à solutions entières), un tiers m ≤ D
     (le second cas donne encore des solutions : 3 ou 4 en tout), un tiers au hasard */
  const L = [];
  for (let M = Math.floor(Math.sqrt(D)) + 1; M * M - D <= 30; M++) L.push(M * M - D);
  const tir = R.int(0, 2);
  const m = (tir === 0 && L.length) ? R.pick(L) : tir === 1 ? R.int(1, Math.min(30, D)) : R.int(1, 30);
  const U1 = D + m, U2 = D - m, isSq = u => u > 0 && ent(Math.sqrt(u));
  const sq1 = isSq(U1), sq2 = isSq(U2), r1 = Math.round(Math.sqrt(U1)), r2 = U2 > 0 ? Math.round(Math.sqrt(U2)) : 0;
  const n = 2 + (U2 > 0 ? 2 : U2 === 0 ? 1 : 0), S = -2 * h - (U2 > 0 ? 2 * h : U2 === 0 ? h : 0);
  const Qtxt = poly([[1, 'x²'], [2 * h, 'x'], [c0, '']]), M2 = m * m;
  let eq, pre = '';
  if (form === 'nul'){
    const w = R.int(0, 2);
    eq = w === 0 ? `(${Qtxt})² = ${M2}` : w === 1 ? `x²${par(2 * h)}² = ${M2}` : `(x${par(2 * h)})² = ${M2}`;
    if (w === 1) pre = `À gauche, x²${par(2 * h)}² = [x${par(2 * h)}]² = (${Qtxt})². `;
    if (w === 2) pre = `À gauche, x${par(2 * h)} = ${Qtxt}. `;
  } else if (form === 'prod'){
    eq = R.int(0, 1) ? `${carre(p)}${carre(q)} = ${M2}` : `[${par(p)}${par(q)}]² = ${M2}`;
    pre = `À gauche, ${carre(p)}${carre(q)} = [${par(p)}${par(q)}]², et ${par(p)}${par(q)} = ${Qtxt}. `;
  } else eq = R.int(0, 1) ? `(${Qtxt})² = ${M2}` : `(${Qtxt})² − ${M2} = 0`;
  const intro = 'Prends la racine carrée des deux membres, ce qui donne deux équations, puis écris chacune sous la forme (x + h)² = nombre, sans discriminant. ';
  let corps = intro + pre + `Un carré vaut ${M2} quand le nombre élevé au carré vaut ${m} ou −${m} : ${Qtxt} = ${m} ou ${Qtxt} = −${m}. Or ${carre(h)} = ${poly([[1, 'x²'], [2 * h, 'x'], [h * h, '']])}, donc ${Qtxt} = ${carre(h)} − ${D}. `;
  corps += `Premier cas : ${carre(h)} − ${D} = ${m}, soit ${carre(h)} = ${U1}` + (sq1 ? `, donc ${lin(h)} = ${r1} ou ${lin(h)} = −${r1}, c'est-à-dire x = ${V(-h + r1)} ou x = ${V(-h - r1)}. ` : `, donc x = ${V(-h)} + √${U1} ou x = ${V(-h)} − √${U1} : deux solutions, car ${U1} est positif sans être un carré parfait. `);
  corps += `Second cas : ${carre(h)} − ${D} = −${m}, soit ${carre(h)} = ${sg(U2)}` + (U2 > 0 ? (sq2 ? `, donc x = ${V(-h + r2)} ou x = ${V(-h - r2)}. ` : `, donc x = ${V(-h)} + √${U2} ou x = ${V(-h)} − √${U2} : deux solutions de plus. `) : U2 === 0 ? `, donc ${lin(h)} = 0 : une seule solution de plus, x = ${V(-h)}. ` : ', impossible car un carré n\'est jamais négatif : aucune solution de plus. ');
  corps += `Au total : ${nbSol(n)}. `;
  const pg = 'Piège : ne traiter qu\'un seul des deux cas ; compter deux solutions pour un carré nul ; ou ne pas remarquer qu\'un cas est impossible.';
  const types = ['count', 'count', 'count', 'sum', 'sum'];
  if (sq1) types.push('max');
  if (sq1 && sq2) types.push('prod');
  const qt = R.pick(types);
  if (qt === 'count') return Qn(`Combien de solutions réelles a l'équation ${eq} ?`, n, R, [n === 4 ? '2' : '4', n === 3 ? '2' : '3'], corps + pg);
  if (qt === 'sum'){
    const som = U2 > 0 ? `Somme : dans chaque cas, les deux solutions ${V(-h)} + r et ${V(-h)} − r ont pour somme ${V(-2 * h)}, donc la somme vaut ${V(-2 * h)} + ${pn(-2 * h)} = ${V(S)}. `
      : U2 === 0 ? `Somme : ${V(-2 * h)} (les deux solutions du premier cas) + ${pn(-h)} = ${V(S)}. `
      : `Somme : les deux solutions ${V(-h)} + r et ${V(-h)} − r ont pour somme ${V(S)}, les racines s'éliminent. `;
    return Qv(`Quelle est la somme des solutions de l'équation ${eq} ?`, S, [-S, -h, -2 * h, -4 * h, 0, h], V, 1, corps + som + pg);
  }
  if (qt === 'max') return Qv(`Quelle est la plus grande solution de l'équation ${eq} ?`, -h + r1, [r1, h + r1, -h - r1, m, U1], V, 1, corps + `La plus grande solution est ${V(-h + r1)}. ` + pg);
  const P = (c0 - m) * (c0 + m), s4 = [-h + r1, -h - r1, -h + r2, -h - r2];
  return Qv(`Quel est le produit des solutions de l'équation ${eq} ?`, P, [-P, m * m, c0 * c0, 2 * c0, S], V, 1, corps + `Produit : ${s4.map(pn).join(' × ')} = ${pn(c0 - m)} × ${pn(c0 + m)} = ${V(P)}. ` + pg, w => w !== 0);
}

/* 5h · Paramètre et forme canonique : x² + 2hx + k = 0 a deux, une ou zéro solution selon k. */
function s5h(R){
  const h = tire(R, -6, 6), H = h * h, Qtxt = poly([[1, 'x²'], [2 * h, 'x']]), eq = `${Qtxt} + k = 0`;
  const intro = 'Mets le début x² + 2hx sous la forme (x + h)² − h², puis discute le signe du nombre obtenu dans le second membre : positif, nul ou négatif. ';
  const corps = intro + `${Qtxt} + k = ${carre(h)} − ${H} + k, donc l'équation s'écrit ${carre(h)} = ${H} − k. Il y a deux solutions si ${H} − k est strictement positif, c'est-à-dire si k ≤ ${H - 1} (k entier) ; une seule si k = ${H} ; aucune si k ≥ ${H + 1}. `;
  const v = R.pick(['count2', 'count2', 'count0', 'un', 'maxk', 'mink0']);
  if (v === 'count2' || v === 'count0'){
    const lo = R.pick([-10, -5, 0, -3, -8]), hi = H + R.int(2, 12), cnt = v === 'count2' ? H - lo : hi - H;
    const quoi = v === 'count2' ? 'a-t-elle exactement 2 solutions réelles' : 'n\'a-t-elle aucune solution réelle';
    const q = `Pour combien d'entiers k compris entre ${V(lo)} et ${V(hi)} l'équation ${eq} ${quoi} ?`;
    const fin = v === 'count2'
      ? `Les entiers k de ${V(lo)} à ${V(hi)} tels que k ≤ ${H - 1} sont ceux de ${V(lo)} à ${H - 1} : il y en a ${cnt}. Piège : compter k = ${H}, qui ne donne qu'une solution, ou oublier les valeurs négatives de k.`
      : `Les entiers k de ${V(lo)} à ${V(hi)} tels que k ≥ ${H + 1} sont ceux de ${H + 1} à ${hi} : il y en a ${cnt}. Piège : compter k = ${H}, qui donne encore une solution, ou se tromper d'une unité dans le comptage.`;
    return Qv(q, cnt, [cnt + 1, cnt - 1, hi - lo + 1, H, cnt + 2], V, 1, corps + fin, w => w >= 0 && w <= hi - lo + 1);
  }
  if (v === 'un') return Qv(`Pour quelle valeur de k l'équation ${eq} a-t-elle une seule solution réelle ?`, H, [-H, 2 * h, -2 * h, h, 2 * H], V, 1, corps + `C'est donc k = ${H}, et la solution est alors x = ${V(-h)}. Piège : confondre ${H} avec ${V(2 * h)}, le coefficient de x, ou oublier le signe.`);
  if (v === 'maxk') return Qv(`Quelle est la plus grande valeur entière de k pour laquelle l'équation ${eq} a exactement 2 solutions réelles ?`, H - 1, [H, H + 1, 2 * Math.abs(h), Math.abs(h), -H], V, 1, corps + `La plus grande valeur entière de k est donc ${H - 1}. Piège : répondre ${H}, qui ne donne qu'une seule solution.`);
  return Qv(`Quelle est la plus petite valeur entière de k pour laquelle l'équation ${eq} n'a aucune solution réelle ?`, H + 1, [H, H - 1, 2 * Math.abs(h), -H, 2 * Math.abs(h) + 1], V, 1, corps + `La plus petite valeur entière de k est donc ${H + 1}. Piège : répondre ${H}, qui donne encore une solution.`);
}

const TYPES = {
  1: [s1a, s1a, s1b, s1b, s1c, s1c, s1d, s1d, s1e],
  2: [s2a, s2b, s2c, s2d, s2e],
  3: [s3a, s3b, s3c, s3d, s3e, s3f, s3g],
  4: [s4a, s4b, s4c, s4d, s4e, s4g, s4g, s4h, s4h, s4i, s4j],
  5: [s5a, s5b, s5c, s5d, s5f, s5g, s5g, s5g, s5h, s5h]
};
/* Carte de secours (jamais atteinte en pratique) : un QCM valide quoi qu'il arrive. */
const SECOURS = () => ({
  q: 'Quelle est la solution positive de l\'équation x² = 49 ?', a: '7', accept: null, choix: ['7', '49', '24,5', '14'],
  expl: 'Cherche le nombre positif dont le carré vaut le second membre. 7² = 49, donc la solution positive est 7. Piège : 24,5 vient d\'une confusion entre le carré et le double.'
});

A.push({
  id: 'alb-11-equations-carre',
  phase: 'albert',
  ordre: 11,
  theme: 'algebre',
  titre: 'Équations x² = k, produit nul, facteur commun',
  objectif: 'Résoudre de tête une équation avec un carré : isoler x², annuler un produit, factoriser au lieu de diviser, puis compter les solutions sans en oublier ni en compter deux fois.',
  lecon:
`<p class="lede">Beaucoup de questions du test cachent une équation où x apparaît <mark>au carré</mark>. Trois outils suffisent : la racine carrée sans oublier son opposé, la règle du produit nul et la mise en facteur. Pas besoin de discriminant.</p>
<h2>Ce que le test te demande</h2>
<p>On te donne une équation comme 3x² + 4 = 52, ou une phrase comme « un nombre non nul est égal au quart de son carré », et tu dois trouver une solution, compter les solutions ou calculer leur somme. Les pièges sont toujours les mêmes : la solution négative oubliée, la solution 0 perdue en divisant par x, une solution comptée deux fois. L'équation se cache parfois dans une situation concrète : deux hausses de même taux, l'aire d'un carré, la diagonale d'un rectangle. Tout se fait de tête ou au brouillon.</p>
<h2>Les prérequis, en bref</h2>
<p><strong>La racine carrée.</strong> Pour un nombre k positif, √k est le nombre positif dont le carré vaut k : √49 = 7. Connais les carrés de 1 à 25 par cœur, en particulier 11² = 121, 12² = 144, 13² = 169, 14² = 196, 15² = 225, 16² = 256 et 25² = 625.</p>
<table class="tbl">
<thead><tr><th>Équation x² = k</th><th>Solutions</th></tr></thead>
<tbody>
<tr><td>k &gt; 0, par exemple x² = 49</td><td>deux solutions opposées : 7 et −7</td></tr>
<tr><td>k = 0</td><td>une seule solution : 0</td></tr>
<tr><td>k &lt; 0, par exemple x² = −4</td><td>aucune solution, un carré n'est jamais négatif</td></tr>
</tbody>
</table>
<p><strong>Le produit nul.</strong> A × B = 0 si et seulement si A = 0 ou B = 0. Cette règle ne marche qu'avec 0 : x(x + 4) = 21 ne veut pas dire x = 21.</p>
<p><strong>Les carrés à développer.</strong> (a + b)² = a² + 2ab + b² et (a − b)² = a² − 2ab + b². Le terme 2ab s'appelle le double produit, et c'est lui qu'on oublie : (x + 4)² = x² + 8x + 16, pas x² + 16. Dans l'autre sens, x² + 6x + 9 se replie en (x + 3)².</p>
<p><strong>La mise en facteur.</strong> x² − 6x = x(x − 6), et a² − b² = (a − b)(a + b) donne x² − 9 = (x − 3)(x + 3). Dans un rectangle, Pythagore donne diagonale² = longueur² + largeur².</p>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. J'isole le carré :</strong> 3x² + 4 = 52 donne 3x² = 48, puis x² = 16.</p>
<p><strong>2. S'il reste x² = k :</strong> je regarde le signe de k, puis je prends √k et −√k.</p>
<p><strong>3. Sinon, je passe tout du même côté et je factorise :</strong> facteur commun ou a² − b². Je ne divise jamais par x, ni par une parenthèse qui contient x.</p>
<p><strong>4. J'annule chaque facteur et je compte les valeurs différentes :</strong> (x² − 16)(x + 4) = 0 donne 4, −4 et −4, soit 2 solutions et pas 3.</p>
<p><strong>5. En QCM, je vérifie :</strong> si l'équation ne se factorise pas vite, je remplace x par chaque choix.</p>
</div>
<h2>Exemples résolus</h2>
<h3>1. Isoler le carré</h3>
<p>5x² − 7 = 38. On ajoute 7 : 5x² = 45. On divise par 5 : x² = 9. Donc x = 3 ou x = −3. Si les choix proposent −3 mais pas 3, la réponse est −3.</p>
<h3>2. Le nombre égal au quart de son carré</h3>
<p>On écrit x = x² ÷ 4, soit x² = 4x. Surtout, ne divise pas par x : x² − 4x = 0, donc x(x − 4) = 0, d'où x = 0 ou x = 4. Le nombre est non nul : c'est 4.</p>
<h3>3. Le facteur commun caché</h3>
<p>(x − 3)² = 5x − 15. À droite, 5x − 15 = 5(x − 3). On passe tout à gauche : (x − 3)² − 5(x − 3) = 0, soit (x − 3)[(x − 3) − 5] = 0, donc (x − 3)(x − 8) = 0. Solutions : 3 et 8. Diviser par (x − 3) aurait fait perdre 3.</p>
<h3>4. Deux hausses de même taux</h3>
<p>Un prix passe de 2 500 € à 3 600 € après deux hausses de même taux. Le coefficient global vaut 3 600 ÷ 2 500 = 1,44. On cherche c positif avec c² = 1,44 : c = 1,2. Chaque hausse vaut donc +20 %, et non 44 % ÷ 2 = 22 %.</p>
<h3>5. Deux carrés égaux</h3>
<p>(x − 9)² = (x − 5)². Deux carrés sont égaux quand les nombres élevés au carré sont égaux ou opposés. Premier cas : x − 9 = x − 5, impossible (on aurait −9 = −5). Second cas : x − 9 = −(x − 5) = −x + 5, donc 2x = 14 et x = 7. Une seule solution, et non « aucune ».</p>
<h3>6. Poser X = x²</h3>
<p>(x² + 9)² = 36 donne x² + 9 = 6 ou x² + 9 = −6, soit x² = −3 ou x² = −15 : aucune solution, car un carré n'est jamais négatif. Vérifie toujours le signe de chaque valeur de X avant de compter.</p>
<h3>7. La forme (x + h)², sans discriminant</h3>
<p>(x² − 2x)² = 64 donne x² − 2x = 8 ou x² − 2x = −8. Or x² − 2x = (x − 1)² − 1. Premier cas : (x − 1)² = 9, soit x = 4 ou x = −2. Second cas : (x − 1)² = −7, impossible. Deux solutions, de somme 2.</p>
<h2>Réflexes sans calculatrice</h2>
<table class="tbl">
<thead><tr><th>Tu vois</th><th>Tu penses</th></tr></thead>
<tbody>
<tr><td>x² = 5x</td><td>x(x − 5) = 0, donc 0 et 5</td></tr>
<tr><td>x⁴ = 9x²</td><td>x²(x² − 9) = 0, donc 0, 3 et −3 : trois solutions</td></tr>
<tr><td>(x + 1)² = 9</td><td>x + 1 = 3 ou x + 1 = −3</td></tr>
<tr><td>A² = B²</td><td>A = B ou A = −B</td></tr>
<tr><td>(x² − 5)² = 16</td><td>pose X = x², puis X = 9 ou X = 1</td></tr>
<tr><td>x² + 6x + 5</td><td>(x + 3)² − 4</td></tr>
<tr><td>x² = 13² − 12²</td><td>(13 − 12)(13 + 12) = 25, donc 5</td></tr>
<tr><td>49 × 51</td><td>50² − 1² = 2 499</td></tr>
<tr><td>79² − 157</td><td>157 = 2 × 79 − 1, donc 79² − 2 × 79 + 1 = 78²</td></tr>
<tr><td>1 + 3 + 5 + … + 31</td><td>16 nombres impairs, donc 16² = 256</td></tr>
<tr><td>2,25 ou 0,09</td><td>1,5² et 0,3²</td></tr>
<tr><td>hausse puis baisse de t % (t en décimal : 20 % donne t = 0,2)</td><td>(1 + t)(1 − t) = 1 − t², par exemple 1,2 × 0,8 = 0,96</td></tr>
</tbody>
</table>
<div class="box astuce"><p class="box-t">Astuce</p><p>Isole le carré, ou passe tout du même côté et factorise, puis annule chaque facteur, sans jamais diviser par une expression qui contient x.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Oublier la solution négative. Perdre 0 en divisant par x. Croire que x² = 7 n'a pas de solution, alors que √7 existe. Compter deux fois la même solution. Appliquer le produit nul à un produit égal à 21. Confondre 2x² et (2x)². Écrire (x + 4)² = x² + 16 en oubliant le double produit. Diviser un taux global par deux.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>x² = k : deux solutions si k &gt; 0, une si k = 0, aucune si k &lt; 0. A × B = 0 équivaut à A = 0 ou B = 0. A² = B² équivaut à A = B ou A = −B. (a + b)² = a² + 2ab + b². On factorise, on ne divise pas.</p></div>`,
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
