/* ===== Maths · De zéro au sommet : accueil et montagne vivante =====
   DESIGN-SPEC §6.9 (hero), §6.29 (rappels du jour), §6.35 (cartes secondaires), §7.1.
   PRODUCT-SPEC M5 (altitude, camps, jalons), M6 (objectif, anneau triple, série, retour).
   Script classique : portée globale partagée. Ce fichier déclare montagneSVG et vAccueil ;
   tous ses autres symboles sont préfixés _acc et ne sortent que par window. */
'use strict';

/* ============================================================
   0. Géométrie du sentier (partagée avec la carte partageable)
   ============================================================ */

/* Le sentier en lacets du DESIGN-SPEC §6.9, dans le repère 0 0 360 220. */
const _accSentierD = 'M24,196 C60,180 40,160 80,150 S110,120 90,110 S150,90 140,80 S200,60 190,50 S250,40 240,30 S300,26 330,18';
window.SENTIER_D = _accSentierD;

/* Mesure le sentier hors écran : retourne le point à la fraction f (0 à 1). */
let _accMesure = null;
function _accSentier(){
  if (_accMesure && document.contains(_accMesure)) return _accMesure;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 360 220');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.style.opacity = '0';
  svg.style.pointerEvents = 'none';
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', _accSentierD);
  svg.appendChild(p);
  (document.body || document.documentElement).appendChild(svg);
  _accMesure = p;
  return p;
}
/* Point du sentier à la fraction f. Repli linéaire si la mesure SVG échoue. */
function _accPoint(f){
  const frac = Math.max(0, Math.min(1, f || 0));
  try {
    const p = _accSentier();
    const L = p.getTotalLength();
    if (L > 0){ const q = p.getPointAtLength(frac * L); return {x: q.x, y: q.y}; }
  } catch(e){}
  return {x: 24 + 306 * frac, y: 196 - 178 * frac};
}
window.sentierPoint = _accPoint;

/* Fraction d'altitude, bornée. */
function _accFrac(alt){
  const s = (typeof SOMMET === 'number' && SOMMET) ? SOMMET : 4810;
  return Math.max(0, Math.min(1, (alt || 0) / s));
}

/* ============================================================
   1. montagneSVG : le massif à deux plans, le sentier, les camps
   ============================================================ */

/* Les trois plans du massif, dessinés une fois pour toutes.
   Le plan arrière porte le sentier : sa crête passe au-dessus de chaque point du tracé
   et culmine sous le drapeau (330,18), pour qu'aucun camp ne flotte dans le ciel. */
const _accPlans = {
  back: 'M0,220 L0,150 L20,138 L34,144 L58,112 L70,118 L88,88 L102,92 L124,62 L136,70 L152,48 L168,54 L186,28 L204,34 L224,19 L244,22 L262,17 L284,19 L306,15 L332,13 L346,24 L360,32 L360,220 Z',
  mid:  'M0,220 L0,172 L28,154 L44,162 L84,126 L104,140 L128,124 L160,150 L196,112 L214,122 L246,96 L276,124 L296,114 L322,134 L344,120 L360,128 L360,220 Z',
  front:'M0,220 L0,202 L40,184 L66,192 L108,172 L150,190 L176,182 L214,198 L252,176 L280,186 L318,168 L344,178 L360,172 L360,220 Z'
};
/* La carte partageable (vues/seance.js) repeint ces mêmes plans au canvas. */
window.MASSIF_D = _accPlans;
/* Les versants à l'ombre du plan arrière : une facette sous chaque épaule, lumière venue de la gauche. */
const _accOmbres = 'M58,112 L70,118 L72,138 Z M88,88 L102,92 L104,120 Z M124,62 L136,70 L142,104 Z ' +
  'M152,48 L168,54 L172,84 Z M186,28 L204,34 L210,72 Z M224,19 L244,22 L246,56 Z ' +
  'M262,17 L284,19 L286,48 Z M332,13 L346,24 L360,32 L360,84 L346,60 Z';
/* La crête d'un plan : le même tracé, ouvert (ni socle ni bords verticaux). */
function _accCrete(d){ return d.replace(/^M0,220 L/, 'M').replace(/ L360,220 Z$/, ''); }

let _accMtSeq = 0;

/* Points du sentier, échantillonnés une fois : l'étiquette évite aussi le tracé. */
let _accEchant = null;
function _accSentierPts(){
  if (_accEchant) return _accEchant;
  const l = [];
  for (let i = 0; i <= 100; i++) l.push(_accPoint(i / 100));
  /* Le repli linéaire de _accPoint n'est pas mis en cache : la mesure SVG peut arriver plus tard. */
  let mesure = false;
  try { mesure = _accSentier().getTotalLength() > 0; } catch(e){}
  if (mesure) _accEchant = l;
  return l;
}

/* Place l'unique étiquette de la montagne (repère 0 0 360 220, corps en unités, 13 par défaut).
   Elle ne touche jamais un rond de camp, le grimpeur ni un drapeau, et reste dans le cadre.
   Retourne {x, y, ancre} relatifs au camp : ce sont les attributs du <text>. */
function _accPoserEtiquette(pt, texte, pts, grimpeur, drapeau, fait, corps){
  const k = corps || 13;
  const w = Math.ceil(String(texte).length * k * .54) + 2;    // largeur majorée
  const HAUT = k, BAS = k * .3;                                // boîte de la ligne, autour de la ligne de base
  const boites = [];
  pts.forEach((q, i) => {
    boites.push([q.x - 7, q.y - 7, q.x + 7, q.y + 7]);
    if (fait && fait[i]) boites.push([q.x - 2, q.y - 18, q.x + 10, q.y - 5]);
  });
  boites.push([grimpeur.x - 9, grimpeur.y - 9, grimpeur.x + 9, grimpeur.y + 9]);
  boites.push([drapeau.x - 2, drapeau.y - 18, drapeau.x + 14, drapeau.y]);
  const sentier = _accSentierPts();
  const borne = x0 => Math.max(8, Math.min(352 - w, x0));
  /* Coût d'un emplacement [x du bord gauche, y de la ligne de base] : hors cadre, obstacle touché, sentier couvert. */
  const cout = (x0, y) => {
    const b = [x0, y - HAUT, x0 + w, y + BAS];
    let c = 0;
    if (b[0] < 8 || b[2] > 352 || b[1] < 1 || b[3] > 217) c += 5000;
    boites.forEach(o => { if (b[0] < o[2] && o[0] < b[2] && b[1] < o[3] && o[1] < b[3]) c += 1000; });
    sentier.forEach(q => { if (q.x > b[0] && q.x < b[2] && q.y > b[1] && q.y < b[3]) c += 12; });
    return c;
  };
  /* Candidats, du plus naturel au moins naturel. */
  const milieuY = pt.y + k * .35, dessous = pt.y + 12 + k * .85, dessus = pt.y - 8 - BAS;
  const candidats = [
    [pt.x + 11, milieuY],
    [borne(pt.x + 9), dessous],
    [borne(pt.x - w / 2), dessous + 2],
    [borne(pt.x + 7 - w), dessous + 2],
    [pt.x - 11 - w, milieuY],
    [borne(pt.x - 9 - w), dessous],
    [borne(pt.x + 9), dessus],
    [borne(pt.x - 9 - w), dessus]
  ];
  let mieux = null;
  candidats.forEach((cd, rang) => {
    const c = cout(cd[0], cd[1]) + rang;
    if (!mieux || c < mieux.cout) mieux = {cout: c, x0: cd[0], y: cd[1]};
  });
  /* Aucun emplacement habituel n'est libre (grimpeur collé au camp, drapeaux voisins) :
     on balaie les alentours et on garde la place libre la plus proche du rond. */
  if (mieux.cout >= 1000){
    for (let y = pt.y - 44; y <= pt.y + 60; y += 4){
      for (let x0 = pt.x - w - 16; x0 <= pt.x + 16; x0 += 6){
        const dx = Math.max(x0 - pt.x, 0, pt.x - (x0 + w)), dy = Math.max(y - HAUT - pt.y, 0, pt.y - (y + BAS));
        const c = cout(x0, y) + 20 + 2 * Math.hypot(dx, dy);
        if (c < mieux.cout) mieux = {cout: c, x0: x0, y: y};
      }
    }
  }
  /* Ancrage du côté du camp : si la largeur réelle diffère de l'estimation, le texte s'écarte du rond. */
  const milieu = mieux.x0 + w / 2;
  if (milieu < pt.x - 12) return {x: mieux.x0 + w - 1 - pt.x, y: mieux.y - pt.y, ancre: 'end'};
  if (mieux.x0 <= pt.x - 8) return {x: milieu - pt.x, y: mieux.y - pt.y, ancre: 'middle'};
  return {x: mieux.x0 + 1 - pt.x, y: mieux.y - pt.y, ancre: 'start'};
}

/* Dans un cadre étroit (onboarding, écran de camp : 300 px), 13 unités font moins de 12 px à l'écran.
   Une fois la montagne insérée, le corps grandit jusqu'à 12 px réels et l'étiquette est reposée. */
function _accAjusterEtiquette(uid, poser){
  const svg = document.querySelector('[data-mt="' + uid + '"]');
  const t = svg && svg.querySelector('.camp.prochain text');
  if (!t) return;
  const large = svg.clientWidth || svg.getBoundingClientRect().width;
  if (!large) return;
  const corps = Math.min(16, Math.ceil(2 * 12 * 360 / large) / 2);
  if (corps <= 13) return;
  const pose = poser(corps);
  t.style.fontSize = corps + 'px';
  t.setAttribute('x', pose.x.toFixed(1));
  t.setAttribute('y', pose.y.toFixed(1));
  t.setAttribute('text-anchor', pose.ancre);
}

/* Rend le hero de l'ascension. Options :
   {anime:true} trace le sentier puis pose les camps ; {alt} force une altitude ;
   {compact:true} retire le repère de rythme (écran de camp, onboarding). */
function montagneSVG(o){
  const c = o || {};
  const uid = 'mt-' + (++_accMtSeq);
  const alt = (typeof c.alt === 'number') ? c.alt : (typeof altitude === 'function' ? altitude() : 0);
  const sommet = (typeof SOMMET === 'number' && SOMMET) ? SOMMET : 4810;
  const frac = _accFrac(alt);
  const camps = (typeof CAMPS !== 'undefined' && CAMPS) ? CAMPS : [0, 800, 1600, 2400, 3200, 3900, 4300, 4810];
  const noms = ['', 'Camp 1', 'Camp 2', 'Camp 3', 'Camp 4', 'Camp 5', 'Camp 6', 'Sommet'];

  const pts = [];
  for (let p = 1; p <= 7; p++) pts.push(_accPoint(camps[p] / sommet));
  const grimpeur = _accPoint(frac);
  const drapeau = _accPoint(1);

  /* Une seule étiquette : le prochain camp, celui que nomme la ligne « Camp 2 dans 308 m ».
     Les autres camps se lisent à leur rond ; le sommet garde son drapeau. */
  let prochain = camps.findIndex((a, i) => i >= 1 && alt < a);
  if (prochain < 1 || prochain > 7) prochain = 7;
  const fait = [];
  for (let p = 1; p <= 7; p++){
    let plante = false, fini = false;
    try { plante = !!(S.jalons && S.jalons['camp-' + p]); } catch(e){}
    try { const l = SKILLS.filter(s => s.phase === p); fini = l.length > 0 && l.every(s => st(s.id).mastered); } catch(e){}
    fait.push(plante || fini);
  }
  const libelles = [];
  for (let p = 1; p <= 7; p++) libelles.push(noms[p] + ' · ' + (typeof fv === 'function' ? fv(camps[p]) : camps[p]) + ' m');
  const poser = corps => _accPoserEtiquette(pts[prochain - 1], libelles[prochain - 1], pts, grimpeur, drapeau, fait, corps);
  const pose = poser(13);

  let gCamps = '';
  for (let p = 1; p <= 7; p++){
    const pt = pts[p - 1];
    const done = fait[p - 1];
    /* Le translate reste sur le <g class="camp"> ; l'animation ne touche que <g class="camp-in">,
       sinon la propriété CSS transform écrase l'attribut et empile les camps en (0,0). */
    gCamps += '<g class="camp' + (done ? ' done' : '') + (p === 7 ? ' sommet' : '') + (p === prochain ? ' prochain' : '') +
      '" data-phase="' + p + '"' +
      ' transform="translate(' + pt.x.toFixed(1) + ',' + pt.y.toFixed(1) + ')"' +
      (c.anime ? ' style="opacity:0"' : '') + '><g class="camp-in">' +
      '<title>' + esc(libelles[p - 1]) + '</title>' +
      '<circle r="5"/>' +
      (done ? '<g transform="translate(0,-6)"><g class="flag"><line x1="0" y1="0" x2="0" y2="-10"/><path d="M0,-10 L8,-7 L0,-4Z"/></g></g>' : '') +
      (p === prochain
        ? '<text x="' + pose.x.toFixed(1) + '" y="' + pose.y.toFixed(1) + '"' +
          (pose.ancre !== 'start' ? ' text-anchor="' + pose.ancre + '"' : '') + '>' + esc(libelles[p - 1]) + '</text>'
        : '') +
      '</g></g>';
  }

  const libelle = 'Progression : ' + (typeof fv === 'function' ? fv(alt) : alt) + ' mètres sur ' +
                  (typeof fv === 'function' ? fv(sommet) : sommet);

  /* Les plans : aplats sans contour qui se fondent vers le bas (brume de vallée) et sur les bords,
     une crête fine en chemin ouvert. Les identifiants des dégradés sont propres à chaque montagne. */
  const nomsPlans = ['back', 'mid', 'front'];
  const defs = '<defs>' +
    nomsPlans.map(n => '<linearGradient id="' + uid + '-' + n + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop class="mt-st-' + n + '" offset="0"/><stop class="mt-st-' + n + ' mt-st-bas" offset="1"/></linearGradient>').join('') +
    '<linearGradient id="' + uid + '-bords" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#000"/><stop offset=".08" stop-color="#fff"/>' +
      '<stop offset=".92" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
    '<mask id="' + uid + '-m" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="220">' +
      '<rect width="360" height="220" fill="url(#' + uid + '-bords)"/></mask>' +
    '</defs>';
  const massif = '<g class="mt-massif" mask="url(#' + uid + '-m)">' +
    nomsPlans.map(n =>
      '<path class="mt-' + n + '" style="fill:url(#' + uid + '-' + n + ')" d="' + _accPlans[n] + '"/>' +
      (n === 'back' ? '<path class="mt-ombre" d="' + _accOmbres + '"/>' : '') +
      '<path class="mt-crete" d="' + _accCrete(_accPlans[n]) + '"/>').join('') +
    '</g>';

  const html =
  '<svg viewBox="0 0 360 220" data-mt="' + uid + '" role="img" aria-label="' + esc(libelle) + '">' +
    defs + massif +
    '<path class="mt-trail" data-trail pathLength="100" d="' + _accSentierD + '"/>' +
    '<path class="mt-trail-done allow-motion" data-done pathLength="100" d="' + _accSentierD + '" style="--pos:0"/>' +
    '<g data-camps>' + gCamps + '</g>' +
    '<g class="climber" data-climber transform="translate(' + grimpeur.x.toFixed(1) + ',' + grimpeur.y.toFixed(1) + ')">' +
      '<circle class="halo" r="12"/><circle class="dot" r="6"/></g>' +
    '<g transform="translate(' + drapeau.x.toFixed(1) + ',' + drapeau.y.toFixed(1) + ')">' +
      '<g class="flag"><line x1="0" y1="0" x2="0" y2="-16"/><path d="M0,-16 L12,-12 L0,-8Z"/></g></g>' +
  '</svg>';

  /* La pose du trait et des camps se fait une fois le fragment inséré. */
  requestAnimationFrame(() => { _accAjusterEtiquette(uid, poser); _accAnimerMontagne(uid, frac, !!c.anime); });
  return html;
}

/* Trace le sentier parcouru et fait apparaître les camps. */
function _accAnimerMontagne(uid, frac, anime){
  const svg = document.querySelector('[data-mt="' + uid + '"]');
  if (!svg) return;
  const trace = svg.querySelector('[data-done]');
  const camps = Array.from(svg.querySelectorAll('.camp'));
  const reduit = _accReduit();

  if (!anime || reduit){
    if (trace) trace.style.setProperty('--pos', (frac * 100).toFixed(2));
    camps.forEach(g => { g.style.opacity = ''; });
    _accObserverHalo(svg);
    return;
  }
  /* Sentier tracé de 0 à l'altitude en 1 200 ms, puis les camps à 140 ms d'écart. */
  const t0 = performance.now(), duree = 1200;
  const pas = now => {
    const t = Math.min(1, (now - t0) / duree);
    const e = 1 - Math.pow(1 - t, 3);
    if (trace) trace.style.setProperty('--pos', (frac * 100 * e).toFixed(2));
    if (t < 1 && document.contains(svg)) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
  camps.forEach((g, i) => {
    /* L'échelle se pose sur .camp-in : son origine (0,0) est le centre du rond.
       Le <g class="camp"> garde son attribut transform="translate(x,y)" intact. */
    const dedans = g.querySelector('.camp-in');
    if (dedans){
      dedans.style.transformOrigin = '0px 0px';
      dedans.style.transform = 'scale(.6)';
    }
    after(120 + i * 140, () => {
      g.style.transition = 'opacity 240ms ease-out';
      g.style.opacity = '1';
      if (dedans){
        dedans.style.transition = 'transform 240ms ease-out';
        dedans.style.transform = 'scale(1)';
      }
    });
  });
  _accObserverHalo(svg);
}

/* Le halo du grimpeur ne pulse que si la montagne est à l'écran. */
function _accObserverHalo(svg){
  if (typeof IntersectionObserver !== 'function') return;
  const hote = svg.closest('.montagne') || svg;
  const io = new IntersectionObserver(es => {
    es.forEach(e => hote.style.setProperty('--halo-state', e.isIntersecting ? 'running' : 'paused'));
  }, {rootMargin: '80px'});
  io.observe(hote);
  if (typeof surQuitter === 'function') surQuitter(() => io.disconnect());
}

function _accReduit(){
  try {
    if (document.documentElement.dataset.motion === 'reduit') return true;
    if (typeof REDUCE !== 'undefined' && REDUCE) return true;
  } catch(e){}
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ============================================================
   2. Anneau triple du jour (DESIGN-SPEC §6.7, PRODUCT-SPEC M6)
   ============================================================ */

function _accAnneauTriple(prog){
  const pc = x => Math.max(0, Math.min(100, Math.round(100 * (x || 0))));
  /* Rappels sans objet : piste vide (plus de piste pleine à 40 % d'opacité). */
  const p1 = pc(prog.p1), p2 = prog.p2 === null ? 0 : pc(prog.p2), p3 = pc(prog.p3);
  /* À 0 %, aucun arc : la terminaison ronde du trait dessinerait une pastille isolée. */
  const piste = (r, cls, val, texte) =>
    '<g role="progressbar" aria-valuenow="' + val + '" aria-valuemin="0" aria-valuemax="100" aria-valuetext="' + esc(texte) + '">' +
      '<circle class="track" cx="24" cy="24" r="' + r + '" pathLength="100"/>' +
      (val > 0 ? '<circle class="val ' + cls + '" cx="24" cy="24" r="' + r + '" pathLength="100" style="--p:' + val + '"/>' : '') +
    '</g>';
  const classes = ['ring', 'triple', 'allow-motion'];
  if (prog.depasse) classes.push('over');
  /* Le chiffre du centre sort du SVG : il garde sa taille réelle (le viewBox 48 est agrandi 2,5 fois). */
  const centre = String(prog.ok);
  return '<div class="ring-wrap">' +
    '<svg class="' + classes.join(' ') + '" viewBox="0 0 48 48" width="120" height="120" aria-label="Anneaux du jour">' +
    piste(20, 'gold', p1, 'Réponses justes : ' + prog.ok + ' sur ' + prog.obj) +
    piste(15, 'glacier', p2,
          prog.revTot ? ('Rappels : ' + prog.rev + ' sur ' + prog.revTot) : 'Rien à revoir') +
    piste(10, 'ok', p3, 'Calcul mental : ' + Math.round(prog.cmMs / 60000) + ' minutes sur 3') +
    '</svg>' +
    '<span class="ring-centre" data-l="' + centre.length + '" aria-hidden="true">' + esc(centre) + '</span>' +
    '</div>';
}

/* ============================================================
   3. Semaine, série, bivouacs
   ============================================================ */

const _accJours = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/* Les sept jours de la semaine en cours, du lundi au dimanche. */
function _accSemaine(){
  const auj = new Date(); auj.setHours(12, 0, 0, 0);
  const decal = (auj.getDay() + 6) % 7;
  const lundi = new Date(auj); lundi.setDate(auj.getDate() - decal);
  const util = [];
  try { (S.serie.utilises || []).forEach(k => util.push(k)); } catch(e){}
  const cleAuj = todayKey();
  const l = [];
  for (let i = 0; i < 7; i++){
    const d = new Date(lundi); d.setDate(lundi.getDate() + i);
    const k = todayKey(d);
    let fait = false;
    try { fait = dayDone(k); } catch(e){}
    l.push({k: k, lettre: _accJours[i], fait: fait, tente: !fait && util.indexOf(k) >= 0,
            auj: k === cleAuj, futur: k > cleAuj});
  }
  return l;
}

function _accBlocSemaine(){
  const sem = _accSemaine();
  const sk = streak();
  let stock = 0;
  try { stock = (S.serie && S.serie.bivouacs) || 0; } catch(e){}
  const pastilles = sem.map(j => {
    const cls = [];
    if (j.fait) cls.push('done');
    if (j.tente) cls.push('tent');
    if (j.auj) cls.push('today');
    const lib = j.fait ? 'jour validé' : j.tente ? 'bivouac' : j.futur ? 'à venir' : 'sans séance';
    return '<li><i class="' + cls.join(' ') + '" title="' + esc(j.lettre + ' : ' + lib) + '">' +
           (j.tente ? ic('tent') : '') + '</i></li>';
  }).join('');
  const flamme = ic('flame');
  const tentes = [0, 1].map(i =>
    '<svg class="ic' + (i < stock ? '' : ' vide') + '" aria-hidden="true" focusable="false"><use href="#i-tent"/></svg>').join('');
  return '<div class="jour">' +
    '<ul class="week" aria-label="Les sept jours de la semaine">' + pastilles + '</ul>' +
    '<ul class="week-jours" aria-hidden="true">' + _accJours.map(l => '<li>' + l + '</li>').join('') + '</ul>' +
    '<p class="row">' +
      '<span class="streak">' + flamme + '<span class="num">' + nf(sk, sk > 1 ? 'jours' : 'jour') + '</span></span>' +
      '<span class="tents" role="img" aria-label="Bivouacs disponibles : ' + stock + ' sur 2">' + tentes + '</span>' +
    '</p></div>';
}

/* ============================================================
   4. Phrase de contexte (PRODUCT-SPEC M6, 12 mots maximum)
   ============================================================ */

function _accContextuel(prog, abs){
  let prenom = '';
  try { prenom = (S.profil && S.profil.prenom || '').trim(); } catch(e){}
  const bonjour = prenom ? 'Bonjour ' + prenom + '.' : 'Bonjour.';
  const alt = altitude(), acquises = masteredCount();
  const reste = Math.max(0, prog.obj - prog.ok);
  const palier = prog.palier.toLowerCase();
  const h = new Date().getHours();
  const sk = streak();

  /* Concours imminent : rien ne passe devant. */
  try {
    const d = (S.profil && S.profil.concours) ? new Date(S.profil.concours) : DATE_CONCOURS;
    const j = joursAvant(d);
    if (j !== null && j >= 0 && j <= 7)
      return 'Concours dans ' + nf(j, j > 1 ? 'jours' : 'jour') + '. Une épreuve blanche par jour, pas plus.';
  } catch(e){}

  let vide = true;
  try { vide = Object.keys(S.journal).length === 0 || (!prog.ok && !alt && !acquises); } catch(e){}
  if (vide) return 'Bienvenue au camp de base. Tout commence à 0 m.';

  if (abs >= 7) return nf(abs, 'jours') + '. Tout est encore là : ' + nf(alt, 'm') + ', ' + acquises + ' compétences.';
  if (abs >= 3) return "Content de te revoir. La montagne n'a pas bougé : " + nf(alt, 'm') + '.';

  /* Bivouac consommé hier. */
  try {
    const d = new Date(); d.setDate(d.getDate() - 1);
    const hier = todayKey(d);
    if ((S.serie.utilises || []).indexOf(hier) >= 0)
      return 'Bivouac utilisé hier. Ta série tient : ' + nf(sk, sk > 1 ? 'jours' : 'jour') + '.';
  } catch(e){}

  if (prog.trois) return 'Trois anneaux. Journée complète.';
  if (prog.fait) return jToday().guidee ? 'Marche du jour faite. Le reste est du bonus.'
    : 'Journée validée. Ta séance guidée t\'attend toujours.';
  if (!prog.ok && h < 12) return bonjour + ' ' + nf(prog.obj) + ' réponses te séparent de la ' + palier + ' du jour.';
  if (!prog.ok && h >= 18 && sk >= 3)
    return 'Bonsoir. Ta série de ' + nf(sk, 'jours') + ' attend ' + nf(reste) + ' réponses.';
  return 'Encore ' + nf(reste) + (reste > 1 ? ' réponses' : ' réponse') + ' pour la ' + palier + ' du jour.';
}

/* ============================================================
   5. Rappels du jour et histogramme des 7 prochains jours
   ============================================================ */

/* Depuis quand une compétence attend son rappel. */
function _accRetard(sk){
  const s = st(sk.id);
  if (s.fragile) return {txt: 'fragile', ordre: -1};
  const j = Math.floor((Date.now() - (s.due || Date.now())) / JOUR);
  if (j <= 0) return {txt: "aujourd'hui", ordre: 0};
  if (j === 1) return {txt: 'depuis hier', ordre: 1};
  return {txt: 'depuis ' + nf(j, 'jours'), ordre: j};
}

function _accTodo(due){
  if (!due.length){
    return '<section class="card"><h2>À réviser aujourd\'hui</h2>' +
      vide({icone: 'seal-check', titre: 'Rien à revoir aujourd\'hui.',
            texte: 'Tes rappels reviendront quand il le faudra. Avance sur ta compétence du jour.'}) + '</section>';
  }
  const visibles = due.slice(0, 5);
  const reste = due.length - visibles.length;
  const lignes = visibles.map(sk => {
    const r = _accRetard(sk);
    return '<li class="todo-l" data-rappel="' + esc(sk.id) + '">' +
      '<button class="todo-chk" type="button" data-go="' + esc(sk.id) + '" aria-label="Réviser ' + esc(sk.titre) + '">' +
        ic('check') + '</button>' +
      '<span class="todo-t">' + esc(sk.titre) + '</span>' +
      '<span class="num muted">' + esc(r.txt) + '</span></li>';
  }).join('');
  return '<section class="card"><h2>À réviser aujourd\'hui · <span class="num">' + due.length + '</span></h2>' +
    '<ul class="todo" aria-label="Rappels du jour">' + lignes + '</ul>' +
    (reste > 0 ? '<p class="todo-plus"><a href="#" data-v="programme">et ' + nf(reste) + ' autres</a></p>' : '') +
    _accHisto7() + '</section>';
}

/* Sept barres : les rappels attendus jour par jour. */
function _accHisto7(){
  const cases = [0, 0, 0, 0, 0, 0, 0];
  const jours = [];
  const base = new Date(); base.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++){
    const d = new Date(base); d.setDate(base.getDate() + i);
    jours.push(_accJours[(d.getDay() + 6) % 7]);
  }
  try {
    SKILLS.forEach(sk => {
      const s = st(sk.id);
      if (!s.mastered || !s.due) return;
      const i = Math.floor((s.due - base.getTime()) / JOUR);
      if (i >= 0 && i < 7) cases[i]++;
      else if (i < 0) cases[0]++;
    });
  } catch(e){}
  const total = cases.reduce((a, b) => a + b, 0);
  const barres = cases.map((n, i) =>
    '<i style="--n:' + Math.min(8, n) + '"' + (i === 0 ? ' data-today' : '') + '></i>').join('');
  return '<div class="histo7" role="img" aria-label="Rappels des sept prochains jours : ' +
    cases.join(', ') + '">' + barres + '</div>' +
    '<ul class="histo7-jours" aria-hidden="true">' + jours.map(l => '<li>' + l + '</li>').join('') + '</ul>' +
    '<p class="small muted">' + (total ? 'Rappels à venir.' : 'Semaine calme : 0 rappel prévu.') + '</p>';
}

/* Lance la révision de trois questions depuis la file, puis revient à l'accueil. */
function _accLancerRappel(id){
  const sk = SKILLS.find(s => s.id === id);
  if (!sk) return;
  const s = st(id);
  const retard = s.due && (Date.now() - s.due) > 2 * (s.interval || 2) * JOUR;
  setCtx('parcours', {title: 'Rappel : ' + sk.titre, count: '0 / 3'});
  let faites = 0;                       /* le compteur d'en-tête suit chaque réponse */
  surQuitter(ecouter('reponse', () => {
    const hc = document.getElementById('head-count');
    if (hc) hc.textContent = Math.min(++faites, 3) + ' / 3';
  }));
  window.vueCourante.enCours = true;
  window.vueCourante.garde = () => false;
  const zone = app();
  zone.innerHTML = '<div class="view"><div class="rev-band">' + ic('arrows-clockwise') +
    '<span>Rappel · ' + esc(sk.titre) + '</span></div><div id="zone-rappel"></div></div>';
  runSerie(document.getElementById('zone-rappel'), sk, 3,
    {level: retard ? 1 : 2, adapt: false, recordSkill: false, reprise: false, revision: true, indices: false},
    ({res}) => {
      const ok = res.reduce((a, b) => a + b, 0);
      reviewResult(id, ok, res.length, {mode: retard ? 'retard' : ''});
      try { const j = jToday(); j.rev = (j.rev || 0) + 1; save(); } catch(e){}
      const apres = st(id);
      const dans = Math.max(1, Math.round(((apres.due || Date.now()) - Date.now()) / JOUR));
      window.vueCourante.garde = null;
      window.vueCourante.enCours = false;
      celebrer(2, {texte: sk.titre + ' · ' + ok + ' sur ' + res.length + '. Prochain rappel dans ' + dans + ' j.',
                   tone: ok >= 2 ? 'ok' : 'glacier', icon: 'clock-countdown'});
      nav('accueil', {remplace: true});
    });
}

/* ============================================================
   6. Cartes secondaires (DESIGN-SPEC §6.35) : au plus une par jour
   ============================================================ */

function _accSecondaire(){
  /* 1. bilan de la semaine passée (S4) : rendu seulement s'il existe et n'a pas été vu. */
  try {
    const b = S.bilans || {};
    const cles = Object.keys(b).sort();
    const der = cles.length ? b[cles[cles.length - 1]] : null;
    if (der && !der.vu && new Date().getDay() === 1){
      return {cle: 'semaine', html:
        '<section class="card card-muted week-card">' +
          '<p class="overline">Ta semaine · <span class="num">' + esc(cles[cles.length - 1]) + '</span></p>' +
          '<div class="figures">' +
            '<div class="figure"><b class="num">' + nf(der.jours || 0) + '</b><span class="overline">jours actifs</span></div>' +
            '<div class="figure"><b class="num">' + nf(der.ok || 0) + '</b><span class="overline">réponses justes</span></div>' +
            '<div class="figure"><b class="num">' + nf(der.m || 0) + '</b><span class="overline">mètres</span></div>' +
          '</div>' +
          '<div class="row"><button class="btn sm" type="button" data-week-vu>Vu</button></div>' +
        '</section>'};
    }
  } catch(e){}

  /* 2. installation sur l'écran d'accueil (M12). */
  try {
    const autonome = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    const refus = (S.meta && S.meta.installRefus) || 0;
    const seances = Object.values(S.journal).filter(j => j && j.seance).length;
    if (!autonome && refus < 2 && seances >= 2){
      return {cle: 'install', html:
        '<section class="card card-muted install-card">' +
          '<h2>Mets l\'app sur ton écran d\'accueil.</h2>' +
          '<p class="ink-2">Plein écran, hors ligne, et un tap pour reprendre.</p>' +
          '<div class="row"><button class="btn" type="button" data-install>Voir comment</button>' +
          '<button class="btn btn-ghost" type="button" data-install-plus>Plus tard</button></div>' +
        '</section>'};
    }
  } catch(e){}

  /* 3. lien vers la méthode, les sept premiers jours. */
  try {
    const jours = Math.floor((Date.now() - (S.debut || Date.now())) / JOUR);
    if (jours <= 7)
      return {cle: 'methode', html: '<p><a class="lien-methode small" href="#" data-v="methode">' +
        ic('book-open') + '<span>La méthode</span></a></p>'};
  } catch(e){}
  return null;
}

/* Feuille « Comment installer » : trois gestes, aucun jargon. */
function _accFeuilleInstall(){
  const iphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const etapes = iphone
    ? ['Ouvre le menu Partager, en bas de Safari.', 'Choisis « Sur l\'écran d\'accueil ».', 'Valide : l\'icône rejoint tes applications.']
    : ['Ouvre le menu du navigateur.', 'Choisis « Installer l\'application » ou « Ajouter au Dock ».', 'Valide : l\'app s\'ouvre en plein écran.'];
  ouvrirFeuille({
    classe: 'sheet-install', titre: 'Installer l\'application',
    contenu: '<ol class="install-steps">' + etapes.map(t => '<li>' + esc(t) + '</li>').join('') + '</ol>',
    boutons: [{label: 'Fermer'}]
  });
}

/* ============================================================
   7. vAccueil (DESIGN-SPEC §7.1)
   ============================================================ */

function vAccueil(){
  /* La série pardonne : les bivouacs sont consommés avant le premier chiffre affiché. */
  try { if (typeof bivouacs === 'function') bivouacs(); } catch(e){}
  try { if (typeof window.marquerJalonsPasses === 'function' && !S.profil.onboard) window.marquerJalonsPasses(); } catch(e){}

  const j = jToday();
  const due = dueReviews();
  /* revTot est figé au premier affichage de l'accueil du jour (M6). */
  if (j.revTot === null || j.revTot === undefined){ j.revTot = due.length; save(); }

  const prog = progresJour();
  const alt = altitude();
  const camp = campDe(alt);
  const acquises = masteredCount();
  const f = frontier();
  const abs = (typeof window.joursDepuisActivite === 'function') ? window.joursDepuisActivite() : 0;
  const phase = f ? f.phase : 7;

  /* Le plan de la séance vient de vues/seance.js : une seule source de vérité. */
  let mode = 'normale';
  if (j.guidee) mode = 'bonus';        /* j.guidee : la séance guidée est faite (j.seance : jour validé) */
  else if (abs >= 3 && acquises > 0) mode = 'reprise';
  let plan = null;
  try { if (typeof window.planSeance === 'function') plan = window.planSeance(mode); } catch(e){}
  const minutes = plan ? plan.min : (mode === 'normale' ? 25 : 15);
  const detail = plan ? plan.etapes.map(e => e.t + (e.n ? ' ' + e.n : '')).join(' · ') : '';

  const libelle = mode === 'bonus' ? 'Séance bonus' : mode === 'reprise' ? 'Reprendre en douceur' : 'Commencer la séance';
  const classeBouton = mode === 'bonus' ? 'btn lg' : 'btn-primary lg';

  const sec = _accSecondaire();
  const dimanche = new Date().getDay() === 0;

  app().innerHTML =
  '<div class="view">' +
    /* 1. le hero */
    '<section class="hero" style="--tint:var(--tint-' + phase + ')">' +
      '<p class="overline">Ton ascension · ' + esc(camp.nom) + '</p>' +
      '<p class="display-xl alt-label" id="alt-label">' +
        '<span class="num-val">' + fv(alt) + '</span><span class="unit">m</span></p>' +
      '<p class="small muted">' +
        (camp.suivant ? esc(camp.suivantNom) + ' dans ' + nf(camp.restant, 'm') : 'Sommet atteint') +
        ' · ' + nf(acquises) + (acquises > 1 ? ' compétences verrouillées' : ' compétence verrouillée') + '</p>' +
      '<div class="montagne" id="montagne">' + montagneSVG() + '</div>' +
    '</section>' +

    /* 2. l'action principale, seule : visible sans défiler, juste sous le hero */
    '<div class="go-bloc">' +
    '<button class="' + classeBouton + '" type="button" id="go-seance">' +
      '<span>' + libelle + '</span><span class="meta num">' + nf(minutes, 'min') + '</span>' +
      '<span class="ic-wrap">' + ic('play') + '</span></button>' +
    (detail ? '<p class="small muted">' + esc(detail) + '</p>' : '') +
    (prog.fait && mode === 'bonus'
      ? '<p><span class="chip" data-tone="ok">Marche du jour faite.</span></p>' : '') +
    '</div>' +

    /* 3. la carte du jour */
    '<section class="card card-raised day-card">' +
      '<div class="ring-bloc">' + _accAnneauTriple(prog) +
        '<p class="overline">sur ' + prog.obj + ' réponses</p></div>' +
      _accBlocSemaine() +
    '</section>' +

    /* 4. la phrase du coach */
    '<div class="coach-msg"><p>' + esc(_accContextuel(prog, abs)) + '</p></div>' +

    /* 10. le test de la semaine, le dimanche */
    (dimanche && acquises >= 3
      ? '<section class="card"><h2>Test de la semaine</h2>' +
        '<p class="small muted">20 questions · 10 min. Il réactive ce que tu sais déjà.</p>' +
        '<div class="row"><button class="btn" type="button" data-v="test">' + ic('calendar-check') +
        '<span>Lancer le test</span></button></div></section>'
      : '') +

    /* 5. les rappels du jour */
    _accTodo(due) +

    /* 6. deux actions secondaires, pas une de plus */
    '<div class="row">' +
      '<button class="btn" type="button" data-v="micro">' + ic('timer') + '<span>5 minutes</span></button>' +
      '<button class="btn" type="button" data-v="cm">' + ic('calculator') + '<span>Calcul mental</span></button>' +
    '</div>' +

    /* 7 à 9 : au plus une carte secondaire par jour */
    (sec ? sec.html : '') +
  '</div>';

  /* ---------- branchements ---------- */
  const racine = app();
  const clic = (sel, fn) => racine.querySelectorAll(sel).forEach(b =>
    b.addEventListener('click', e => { e.preventDefault(); try { snd.click(); } catch(x){} fn(e, b); }));

  clic('#go-seance', () => nav('seance', {mode: mode}));
  clic('[data-v]', (e, b) => nav(b.dataset.v));
  clic('[data-go]', (e, b) => _accLancerRappel(b.dataset.go));
  clic('[data-install]', () => _accFeuilleInstall());
  clic('[data-install-plus]', () => {
    try { S.meta.installRefus = (S.meta.installRefus || 0) + 1; save(); } catch(x){}
    const c = racine.querySelector('.install-card'); if (c) c.hidden = true;
  });
  clic('[data-week-vu]', () => {
    try {
      const cles = Object.keys(S.bilans || {}).sort();
      if (cles.length){ S.bilans[cles[cles.length - 1]].vu = true; save(); }
    } catch(x){}
    const c = racine.querySelector('.week-card'); if (c) c.hidden = true;
  });

  /* L'anneau du jour de l'en-tête reprend la main. */
  setCtx('home');
  try { majCrete(alt); } catch(e){}

  /* L'altitude compte depuis la valeur précédemment vue (M5). */
  try {
    const el = racine.querySelector('#alt-label .num-val');
    const avant = Number(S.meta.altVue || 0);
    if (el && avant && avant !== alt) compteur(el, avant, alt, 800);
    S.meta.altVue = alt;
    save();
  } catch(e){}
}
