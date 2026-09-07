/* ===== Maths · De zéro au sommet : le coach, la méthode (DESIGN-SPEC §6.20, §7.9, §7.21) =====
   Script classique : portée globale partagée (ordre de chargement dans index.html).
   Ce fichier déclare au premier niveau : serieVitesse, sparkVitesse, profilErreurs,
   heatmapSVG, courbeAltitude, vCoach, vRegles, vMethode. Tout le reste est préfixé _co. */
'use strict';

/* ============================================================
   0. État de l'écran
   ============================================================ */
let _coFmt = 'sesame';            // format d'épreuve choisi dans la section « Épreuves »
let _coTip = null;                // info-bulle de la heatmap

const _coMois = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
function _coDate(ts){ const d = new Date(ts); return d.getDate() + ' ' + _coMois[d.getMonth()]; }
function _coJour(d){ return todayKey(d); }
function _coMinuit(){ const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }

/* Conditions des 25 succès, en une phrase (PRODUCT-SPEC §8.4). */
const _coCond = {
  'premiers-pas': 'Termine ta première séance.',
  'premier-verrou': 'Verrouille une première compétence.',
  'camp-1': 'Termine les compétences du camp 1.',
  'camp-2': 'Termine les compétences du camp 2.',
  'camp-3': 'Termine les compétences du camp 3.',
  'camp-4': 'Termine les compétences du camp 4.',
  'camp-5': 'Termine les compétences du camp 5.',
  'camp-6': 'Termine les compétences du camp 6.',
  'sommet': 'Atteins le sommet : les 52 compétences.',
  'semaine-pleine': '7 jours de cordée.',
  'quinzaine': '14 jours de cordée.',
  'mois-de-cordee': '30 jours de cordée.',
  'cent': '100 réponses justes en tout.',
  'mille': '1 000 réponses justes en tout.',
  'sans-faute': 'Une série de 10 sans aucune faute.',
  'eclair': 'Un sprint à 18 sur 20, médiane sous 4 s.',
  'reparateur': '10 erreurs réparées.',
  'chirurgien': '25 erreurs réparées.',
  'semaine-validee': 'Un test de la semaine à 90 %.',
  'mention': 'Une épreuve blanche à 16 sur 20.',
  'copie-propre': 'Un exercice papier à tous les critères.',
  'trois-anneaux': 'Fermer les trois anneaux le même jour.',
  'bivouac': 'Un bivouac qui couvre un jour manqué.',
  'retour': 'Revenir après une semaine d\'absence.',
  'sept-calculs': '7 calculs du jour d\'affilée.'
};

/* ============================================================
   1. Vitesse de calcul mental (30 jours)
   ============================================================ */
/* Une mesure par jour : temps moyen d'une question de calcul mental, en millisecondes. */
function serieVitesse(){
  const out = [];
  for (let i = 29; i >= 0; i--){
    const d = new Date(); d.setDate(d.getDate() - i);
    const j = S.journal[_coJour(d)];
    if (j && j.cm > 0 && j.cmMs > 0) out.push({i: 29 - i, ms: j.cmMs / j.cm});
  }
  return out;
}

/* Sparkline : bande cible 0 à 4 s, moyenne glissante sur 7 points, points bruts. */
function sparkVitesse(){
  const pts = serieVitesse();
  if (pts.length < 3) return '';
  const MAX = 8000, X0 = 32, X1 = 356, Y0 = 6, Y1 = 74;
  const x = i => X0 + (i / 29) * (X1 - X0);
  const y = ms => Y1 - Math.max(0, Math.min(1, ms / MAX)) * (Y1 - Y0);
  const moy = pts.map((p, k) => {
    const tr = pts.slice(Math.max(0, k - 6), k + 1);
    return {i: p.i, ms: tr.reduce((a, b) => a + b.ms, 0) / tr.length};
  });
  const d = moy.map((p, k) => (k ? 'L' : 'M') + x(p.i).toFixed(1) + ',' + y(p.ms).toFixed(1)).join(' ');
  const bande = '<rect class="band" x="' + X0 + '" y="' + y(4000).toFixed(1) + '" width="' + (X1 - X0) +
                '" height="' + (Y1 - y(4000)).toFixed(1) + '" rx="2"/>';
  const axes = [2000, 4000, 6000].map(v =>
    '<text x="26" y="' + (y(v) + 3).toFixed(1) + '" text-anchor="end">' + (v / 1000) + ' s</text>').join('');
  const points = pts.map(p => '<circle class="pt" cx="' + x(p.i).toFixed(1) + '" cy="' + y(p.ms).toFixed(1) + '" r="2"/>').join('');
  const med = moy.length ? moy[moy.length - 1].ms / 1000 : 0;
  return '<svg class="spark" viewBox="0 0 360 80" role="img" aria-label="Vitesse de calcul mental sur 30 jours : ' +
    fv(med, 1) + ' secondes par question en moyenne">' + bande + axes + points +
    '<path class="avg" d="' + d + '"/></svg>';
}

/* ============================================================
   2. Profil d'erreurs (radar 5 axes)
   ============================================================ */
/* Comptage des types sur 30 jours (cahier en attente et cahier réparé). */
function _coTypes(){
  const depuis = Date.now() - 30 * JOUR;
  const tout = S.erreurs.filter(e => e.ts >= depuis).concat((S.reparees || []).filter(r => r.ts >= depuis));
  const c = {};
  TYPES_ERR.forEach(t => { c[t.id] = 0; });
  let types = 0;
  tout.forEach(e => { if (e.type && c[e.type] !== undefined){ c[e.type]++; types++; } });
  return {c: c, total: tout.length, types: types};
}

function profilErreurs(){
  const t = _coTypes();
  if (t.types < 5) return '';
  const cx = 80, cy = 80, R0 = 52;
  const max = Math.max.apply(null, TYPES_ERR.map(x => t.c[x.id])) || 1;
  const ang = i => (-90 + i * 72) * Math.PI / 180;
  const pt = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r];
  const grille = [1, .66, .33].map(f =>
    '<polygon class="grid" points="' + TYPES_ERR.map((_, i) => pt(i, R0 * f).map(v => v.toFixed(1)).join(',')).join(' ') + '"/>').join('');
  const axes = TYPES_ERR.map((_, i) => {
    const p = pt(i, R0);
    return '<line class="axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>';
  }).join('');
  const zone = '<polygon class="area" points="' + TYPES_ERR.map((x, i) =>
    pt(i, R0 * Math.max(.08, t.c[x.id] / max)).map(v => v.toFixed(1)).join(',')).join(' ') + '"/>';
  const points = TYPES_ERR.map((x, i) => {
    const p = pt(i, R0 * Math.max(.08, t.c[x.id] / max));
    return '<circle class="pt" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3"/>';
  }).join('');
  const etiq = TYPES_ERR.map((x, i) => {
    const p = pt(i, R0 + 16);
    const anc = Math.abs(p[0] - cx) < 6 ? 'middle' : (p[0] > cx ? 'start' : 'end');
    return '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4).toFixed(1) + '" text-anchor="' + anc + '">' + esc(x.nom) + '</text>';
  }).join('');
  return '<svg class="radar" viewBox="-20 -8 200 176" role="img" aria-label="Profil de tes erreurs sur 30 jours">' +
    grille + axes + zone + points + etiq + '</svg>';
}

/* Phrase du coach sous le radar. */
function _coPhraseErreurs(){
  const t = _coTypes();
  if (!t.types) return '';
  let id = '', n = 0;
  TYPES_ERR.forEach(x => { if (t.c[x.id] > n){ n = t.c[x.id]; id = x.id; } });
  const ty = TYPES_ERR.find(x => x.id === id);
  if (!ty) return '';
  return 'Ton erreur n° 1 : ' + ty.nom.toLowerCase() + ' (' + Math.round(100 * n / t.types) + ' %). ' + ty.conseil;
}

/* ============================================================
   3. Heatmap 12 semaines (S4)
   ============================================================ */
function heatmapSVG(){
  const lundi = new Date(); lundi.setHours(12, 0, 0, 0);
  lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7) - 7 * 11);
  const auj = _coJour(new Date());
  const util = (S.serie && S.serie.utilises) || [];
  const testsJours = {};
  (S.tests || []).forEach(t => { if (t && t.date) testsJours[String(t.date).slice(0, 10)] = 1; });

  const niveau = ok => ok >= 50 ? 4 : ok >= 25 ? 3 : ok >= 10 ? 2 : ok >= 1 ? 1 : 0;
  let cases = '', actifs = 0;
  for (let d = 0; d < 7; d++){
    for (let w = 0; w < 12; w++){
      const jour = new Date(lundi);
      jour.setDate(lundi.getDate() + w * 7 + d);
      const k = _coJour(jour);
      if (k > auj){ cases += '<span class="hm" aria-hidden="true"></span>'; continue; }
      const j = S.journal[k] || {};
      const ok = j.ok || 0;
      const lvl = niveau(ok);
      if (ok > 0) actifs++;
      const lib = jour.getDate() + ' ' + _coMois[jour.getMonth()] + ' · ' + fv(ok) + ' réponses justes';
      cases += '<button class="hm" type="button" data-lvl="' + lvl + '" data-d="' + k + '"' +
        (util.indexOf(k) >= 0 ? ' data-bivouac' : '') +
        (testsJours[k] ? ' data-test' : '') +
        (k === auj ? ' data-today' : '') +
        ' aria-label="' + esc(lib) + '" data-tip="' + esc(lib) + '"></button>';
    }
  }
  return '<div class="heatmap" role="img" aria-label="Assiduité sur 12 semaines : ' + actifs + ' jours actifs">' +
    cases + '</div>' +
    '<p class="heatmap-legende small muted"><span>Moins</span><i></i><i data-lvl="1"></i><i data-lvl="2"></i>' +
    '<i data-lvl="3"></i><i data-lvl="4"></i><span>Plus</span></p>';
}

/* ============================================================
   4. Courbe d'altitude (90 jours)
   ============================================================ */
function courbeAltitude(){
  const fin = _coMinuit() + JOUR - 1;
  const debut = fin - 89 * JOUR;
  const verrous = (window.SKILLS || []).map(s => ({at: st(s.id).masteredAt || 0, m: window.mSkill(s.id)}))
    .filter(v => v.at > 0).sort((a, b) => a.at - b.at);
  const serie = [];
  for (let i = 0; i < 90; i++){
    const t = debut + i * JOUR;
    let a = 0;
    verrous.forEach(v => { if (v.at <= t) a += v.m; });
    serie.push(a);
  }
  const reel = altitude();
  serie[89] = Math.max(serie[89], reel);

  const X0 = 34, X1 = 356, Y0 = 12, Y1 = 148;
  const x = i => X0 + (i / 89) * (X1 - X0);
  const y = a => Y1 - Math.max(0, Math.min(1, a / SOMMET)) * (Y1 - Y0);

  const lignes = CAMPS.slice(1).map((a, i) =>
    '<line class="camp-line" x1="' + X0 + '" y1="' + y(a).toFixed(1) + '" x2="' + X1 + '" y2="' + y(a).toFixed(1) + '"/>' +
    '<text x="0" y="' + (y(a) + 3).toFixed(1) + '">' + (i === 6 ? 'S' : 'C' + (i + 1)) + '</text>').join('');

  const d = serie.map((a, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(a).toFixed(1)).join(' ');
  const aire = '<path class="area" d="' + d + ' L' + X1 + ',' + Y1 + ' L' + X0 + ',' + Y1 + ' Z"/>';

  /* trajectoire cible : progression régulière du premier jour jusqu'au bac */
  let cible = '';
  const bac = S.profil && S.profil.bac ? new Date(S.profil.bac + 'T12:00:00').getTime() : DATE_BAC.getTime();
  const dep = S.debut || debut;
  if (bac > dep){
    const viser = t => SOMMET * Math.max(0, Math.min(1, (t - dep) / (bac - dep)));
    cible = '<path class="cible" d="M' + X0 + ',' + y(viser(debut)).toFixed(1) +
            ' L' + X1 + ',' + y(viser(fin)).toFixed(1) + '"/>';
  }

  const px = x(89).toFixed(1), py = y(serie[89]).toFixed(1);
  return '<svg class="altline" viewBox="0 0 360 160" role="img" aria-label="Altitude sur 90 jours : ' +
    nf(reel, 'm') + '">' + lignes + aire + cible +
    '<path class="line" d="' + d + '"/>' +
    '<circle class="pt" cx="' + px + '" cy="' + py + '" r="4"/>' +
    '<text class="cur" x="' + (Number(px) - 6) + '" y="' + (Number(py) - 10) + '" text-anchor="end">' +
    esc(nf(reel, 'm')) + " · aujourd'hui</text></svg>";
}

/* ============================================================
   5. Semaine ISO et bilan hebdomadaire (S4)
   ============================================================ */
function _coSemaineISO(d){
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const an = t.getUTCFullYear();
  const j1 = new Date(Date.UTC(an, 0, 1));
  const n = Math.ceil(((t - j1) / JOUR + 1) / 7);
  return {cle: an + '-W' + String(n).padStart(2, '0'), n: n, an: an};
}

/* Bilan d'une semaine : offset 0 = celle en cours, 1 = la précédente. */
function _coBilan(offset){
  const ref = new Date();
  ref.setDate(ref.getDate() - 7 * (offset || 0));
  const lundi = new Date(ref);
  lundi.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
  lundi.setHours(0, 0, 0, 0);
  const iso = _coSemaineISO(lundi);
  const b = {cle: iso.cle, n: iso.n, jours: 0, ok: 0, a: 0, m: 0, cmMs: 0, cm: 0, verrous: []};
  for (let i = 0; i < 7; i++){
    const d = new Date(lundi); d.setDate(lundi.getDate() + i);
    const k = _coJour(d);
    const j = S.journal[k];
    if (!j) continue;
    if (j.a > 0 || j.seance) b.jours++;
    b.ok += j.ok || 0; b.a += j.a || 0; b.m += j.m || 0;
    b.cmMs += j.cmMs || 0; b.cm += j.cm || 0;
  }
  const fin = lundi.getTime() + 7 * JOUR;
  (window.SKILLS || []).forEach(s => {
    const at = st(s.id).masteredAt || 0;
    if (at >= lundi.getTime() && at < fin) b.verrous.push(s.titre);
  });
  b.cmSecs = b.cm ? Math.round(b.cmMs / b.cm / 100) / 10 : null;
  return b;
}

/* Trois puces locales, calculées, jamais promises. */
function _coDebriefLocal(){
  const acquises = masteredCount();
  const conso = (window.SKILLS || []).filter(s => niveauMaitrise(s.id).cle === 'consolide').length;
  const f = frontier();
  const puces = [];
  puces.push('Parcours : ' + fv(acquises) + ' compétences verrouillées, ' + fv(conso) + ' consolidées' +
             (f ? ', en cours : ' + f.titre : '') + '.');
  const ph = _coPhraseErreurs();
  puces.push(ph || 'Erreurs : trop peu de données classées pour dégager une tendance.');
  let lent = null, lentMed = 0;
  (window.CM_FAMS || []).forEach(fam => {
    const m = window.med(fam.id);
    if (m !== null && m > lentMed){ lentMed = m; lent = fam; }
  });
  if (lent) puces.push('Calcul mental : « ' + (lent.nom || lent.id) + ' » à ' + fv(lentMed / 1000, 1) +
                       ' s, objectif ' + fv(window.cible(lent.id), 1) + ' s.');
  const due = dueReviews().length;
  puces.push('Aujourd\'hui : ' + (due ? fv(due) + ' rappels à traiter avant du neuf.'
                                      : 'aucun rappel dû, la voie est libre pour une nouvelle compétence.'));
  return puces.slice(0, 4);
}

/* ============================================================
   6. Médaillons (S5)
   ============================================================ */
function _coMedaille(s, obtenu){
  const date = obtenu ? _coDate(S.succes[s.id]) : '';
  const verso = obtenu ? '<span class="medal-back num">' + esc(date) + '</span>'
                       : '<span class="medal-back small">' + esc(_coCond[s.id] || '') + '</span>';
  const lib = obtenu ? s.nom + ', obtenu le ' + date : s.nom + ' : ' + (_coCond[s.id] || 'à débloquer');
  return '<li><button class="medal" type="button" data-state="' + (obtenu ? 'on' : 'off') +
    '" aria-pressed="false" aria-label="' + esc(lib) + '">' +
    '<span class="medal-face">' + ic(s.ic) + '</span>' + verso + '</button>' +
    '<span class="medal-t">' + esc(s.nom) + '</span></li>';
}

/* ============================================================
   7. La vue Coach
   ============================================================ */
function vCoach(){
  const cible = app();
  if (!cible) return;
  setCtx('outil');
  cible.dataset.density = 'outil';
  cible.className = 'view view-coach';

  const seances = Object.keys(S.journal).filter(k => S.journal[k] && S.journal[k].seance).length;
  if (seances < 3 && masteredCount() === 0){
    cible.className = 'view';
    cible.innerHTML = '<h1>Le coach</h1>' + vide({
      icone: 'compass',
      titre: 'Après 3 séances, ton profil apparaît ici.',
      texte: 'Il lui faut un peu de matière : ta vitesse, tes erreurs, tes jours travaillés.',
      action: {label: 'Commencer la séance', fn: () => nav('seance')}
    });
    return;
  }

  const prog = progresJour();
  const sk = streak();
  const acquises = masteredCount();
  const conso = (window.SKILLS || []).filter(s => niveauMaitrise(s.id).cle === 'consolide').length;
  const enCours = (window.SKILLS || []).filter(s => niveauMaitrise(s.id).cle === 'encours').length;
  const auto = (window.CM_FAMS || []).filter(f => window.etatFam(f.id).cle === 'automatise').length;
  const total = Object.values(S.journal).reduce((a, j) => a + ((j && j.a) || 0), 0);
  const justes = window.reponsesJustes();
  const jours = Object.keys(S.journal).filter(k => { const j = S.journal[k]; return j && (j.a > 0 || j.seance); }).length;
  const precision = total ? Math.round(100 * justes / total) : 0;
  const recordTest = (S.tests || []).reduce((m, t) => Math.max(m, t.n ? Math.round(100 * t.ok / t.n) : 0), 0);

  /* 2. triple anneau */
  const anneau =
    '<svg class="ring triple allow-motion" viewBox="0 0 48 48" width="120" height="120" role="img"' +
    ' aria-label="Anneaux du jour : ' + prog.ok + ' réponses sur ' + prog.obj + '">' +
    '<circle class="track" cx="24" cy="24" r="20" pathLength="100"/>' +
    '<circle class="val gold" cx="24" cy="24" r="20" pathLength="100" style="--p:' + Math.round(prog.p1 * 100) + '"/>' +
    '<circle class="track" cx="24" cy="24" r="15" pathLength="100"/>' +
    '<circle class="val glacier' + (prog.p2 === null ? ' vide' : '') + '" cx="24" cy="24" r="15" pathLength="100" style="--p:' +
      Math.round((prog.p2 || 0) * 100) + '"/>' +
    '<circle class="track" cx="24" cy="24" r="10" pathLength="100"/>' +
    '<circle class="val ok" cx="24" cy="24" r="10" pathLength="100" style="--p:' + Math.round(prog.p3 * 100) + '"/>' +
    '</svg>';
  const bloc2 =
    '<section class="coach-sec" data-bento="3"><p class="overline">Aujourd\'hui</p>' +
      '<div class="day-card">' +
        '<div class="ring-bloc">' + anneau +
          '<span class="ring-centre">' + fv(sk) + '</span><span class="overline">jours</span></div>' +
        '<div class="jour">' +
          '<ul class="ring-legende">' +
            '<li><i></i><span class="num">Réponses ' + prog.ok + ' / ' + prog.obj + '</span></li>' +
            '<li data-t="rev"><i></i><span class="num">Rappels ' + (prog.rev || 0) + ' / ' + (prog.revTot || 0) + '</span></li>' +
            '<li data-t="cm"><i></i><span class="num">Calcul ' + Math.round((prog.cmMs || 0) / 60000) + ' / 3 min</span></li>' +
          '</ul>' +
          '<button class="btn btn-ghost" type="button" id="co-obj">' + ic('target') + 'Objectif : ' + esc(prog.palier) + '</button>' +
        '</div>' +
      '</div>' +
    '</section>';

  /* 3. heatmap */
  const bloc3 = '<section class="coach-sec" data-bento="3"><p class="overline">Assiduité · 12 semaines</p>' +
    heatmapSVG() + '</section>';

  /* 4. altitude */
  const bloc4 = '<section class="coach-sec"><p class="overline">Altitude · 90 jours</p>' + courbeAltitude() + '</section>';

  /* 5. vitesse */
  const spark = sparkVitesse();
  const bloc5 = '<section class="coach-sec" data-bento="3"><p class="overline">Vitesse · 30 jours</p>' +
    (spark || '<p class="small muted">Trois jours de calcul mental suffisent pour tracer cette courbe.</p>') + '</section>';

  /* 6. chiffres */
  const bloc6 = '<section class="coach-sec"><p class="overline">Tes chiffres</p>' +
    '<div class="figures">' +
      '<div class="figure"><b>' + fv(justes) + '</b><span class="k">Réponses justes</span></div>' +
      '<div class="figure"><b>' + precision + ' %</b><span class="k">Précision</span></div>' +
      '<div class="figure"><b>' + fv(jours) + '</b><span class="k">Jours travaillés</span></div>' +
      '<div class="figure"><b>' + recordTest + ' %</b><span class="k">Record au test</span></div>' +
    '</div>' +
    '<p class="small ink-2">' + fv(conso) + ' consolidées · ' + fv(acquises) + ' verrouillées · ' + fv(enCours) + ' en cours</p>' +
    '<p class="small ink-2">' + fv(auto) + ' familles automatisées sur ' + fv((window.CM_FAMS || []).length) +
      ' · série la plus longue : ' + fv(window.streakMax()) + ' jours</p>' +
    '</section>';

  /* 7. erreurs */
  const radar = profilErreurs();
  const phrase = _coPhraseErreurs();
  const bloc7 = '<section class="coach-sec" data-bento="3"><p class="overline">Tes erreurs</p>' +
    (radar ? radar + (phrase ? '<p class="coach-msg">' + esc(phrase) + '</p>' : '')
           : '<p class="small muted">Cinq erreurs classées suffisent pour dessiner ton profil.</p>') +
    '<div class="row"><button class="btn btn-ghost" type="button" id="co-cahier">' + ic('book-bookmark') +
      'Ouvrir le cahier</button></div></section>';

  /* 8. succès */
  const obtenus = SUCCES.filter(s => S.succes[s.id]).sort((a, b) => S.succes[b.id] - S.succes[a.id]);
  const restants = SUCCES.filter(s => !S.succes[s.id]);
  const portee = restants.slice(0, 3);
  const autres = restants.slice(3);
  const bloc8 = '<section class="coach-sec"><p class="overline">Tes succès · ' + obtenus.length + ' sur ' + SUCCES.length + '</p>' +
    (obtenus.length ? '<ul class="medals">' + obtenus.map(s => _coMedaille(s, true)).join('') + '</ul>'
                    : '<p class="small muted">Le premier arrive à la fin de ta première séance.</p>') +
    (portee.length ? '<p class="overline">À portée</p><ul class="medals">' +
       portee.map(s => _coMedaille(s, false)).join('') + '</ul>' : '') +
    (autres.length ? '<details><summary>Voir les autres (' + autres.length + ')</summary><ul class="medals">' +
       autres.map(s => _coMedaille(s, false)).join('') + '</ul></details>' : '') +
    '</section>';

  /* 9. camps */
  const camps = [];
  for (let p = 1; p <= 7; p++){
    const ts = S.jalons['camp-' + p];
    if (ts) camps.push('<li class="badge">' + ic('flag') + '<span>' + esc(PHASES[p].camp) + '</span>' +
      '<span class="small muted">' + esc(_coDate(ts)) + '</span></li>');
  }
  [7, 14, 30, 60, 100].forEach(n => {
    const ts = S.jalons['serie-' + n];
    if (ts) camps.push('<li class="badge">' + ic('tent') + '<span class="num">' + n + ' j</span>' +
      '<span class="small muted">' + esc(_coDate(ts)) + '</span></li>');
  });
  const bloc9 = '<section class="coach-sec"><p class="overline">Camps et séries</p>' +
    (camps.length ? '<ul class="badges">' + camps.join('') + '</ul>'
                  : '<p class="small muted">Le camp 1 t\'attend à 800 m.</p>') + '</section>';

  /* 10. épreuves */
  const resultats = (S.epreuves || []).slice(-5).reverse().map(e =>
    '<li class="badge"><span class="num">' + fv(e.note, 1) + ' / 20</span>' +
    '<span class="small muted">' + esc(String(e.fmt || '').toUpperCase() || 'Épreuve') + ' · ' + esc(_coDate(e.date)) + '</span></li>').join('');
  const risque = _coRisque();
  const bloc10 = '<section class="coach-sec"><p class="overline">Épreuves</p>' +
    '<div class="segment" role="radiogroup" aria-label="Format d\'épreuve">' +
      '<label><input type="radio" name="co-fmt" value="sesame"' + (_coFmt === 'sesame' ? ' checked' : '') + '><span>SESAME</span></label>' +
      '<label><input type="radio" name="co-fmt" value="acces"' + (_coFmt === 'acces' ? ' checked' : '') + '><span>ACCÈS</span></label>' +
    '</div>' +
    '<button class="btn-primary" type="button" id="co-epreuve"><span>Passer l\'épreuve blanche</span>' +
      '<span class="meta">20 min</span><span class="ic-wrap">' + ic('arrow-right') + '</span></button>' +
    '<div class="row">' +
      '<button class="btn" type="button" id="co-ds">' + ic('pencil-line') + 'Préparer un DS</button>' +
      '<button class="btn" type="button" id="co-test">' + ic('calendar-check') + 'Test de la semaine</button>' +
    '</div>' +
    (resultats ? '<ul class="badges">' + resultats + '</ul>' : '') +
    (risque ? '<p class="coach-msg">' + esc(risque) + '</p>' : '') +
    '</section>';

  /* 11. bilan de la semaine */
  const b = _coBilan(0), bp = _coBilan(1);
  const evo = (bp.ok >= 10 && bp.ok) ? Math.round(100 * (b.ok - bp.ok) / bp.ok) : null;
  const puces = _coDebriefLocal();
  const aCle = !!(_coCle('mzs-cle-groq') || _coCle('mzs-cle-api'));
  const huit = [];
  for (let i = 1; i <= 8; i++){
    const w = _coBilan(i);
    if (w.jours) huit.push('<div class="figures"><div class="figure"><b>S' + w.n + '</b><span class="k">Semaine</span></div>' +
      '<div class="figure"><b>' + fv(w.ok) + '</b><span class="k">Justes</span></div>' +
      '<div class="figure"><b>' + fv(w.jours) + '</b><span class="k">Jours</span></div>' +
      '<div class="figure"><b>' + nf(w.m, 'm') + '</b><span class="k">Montée</span></div></div>');
  }
  const bloc11 = '<section class="coach-sec"><p class="overline">Bilan de la semaine</p>' +
    '<div class="card card-muted">' +
      '<p class="small ink-2">Semaine ' + b.n + ' · ' + fv(b.jours) + ' jours actifs · ' + fv(b.ok) + ' réponses justes' +
      (evo === null ? '' : ' (' + (evo >= 0 ? '+' : '') + fv(evo) + ' % contre la semaine ' + bp.n + ')') +
      ' · ' + nf(b.m, 'm') + (b.verrous.length ? ' · ' + fv(b.verrous.length) + ' compétences verrouillées' : '') +
      (b.cmSecs ? ' · calcul mental ' + fv(b.cmSecs, 1) + ' s' : '') + '</p>' +
      '<ul class="lecon">' + puces.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul>' +
    '</div>' +
    (aCle ? '<div class="row"><button class="btn" type="button" id="co-debrief">' + ic('graduation-cap') +
      'Débrief du Prof</button></div>'
          : '<p class="small muted">Ce bilan est calculé sur cet appareil. Ajoute une clé dans Réglages pour un débrief rédigé.</p>') +
    (huit.length ? '<details><summary>Les 8 dernières semaines</summary>' + huit.join('') + '</details>' : '') +
    '</section>';

  /* 12 et 13 */
  const jc = joursAvant((S.profil && S.profil.concours) || DATE_CONCOURS);
  const jb = joursAvant((S.profil && S.profil.bac) || DATE_BAC);
  const bloc12 = '<section class="coach-sec">' +
    '<div class="row">' +
      '<button class="btn btn-ghost" type="button" id="co-methode">' + ic('book-open') + 'Comment ça marche</button>' +
      '<button class="btn btn-ghost" type="button" id="co-demo">' + ic('projector-screen') + 'Mode présentation</button>' +
    '</div>' +
    '<p class="small muted">' + (jc !== null && jc >= 0 ? 'Concours dans ' + fv(jc) + ' jours' : 'Concours passé') +
      ' · ' + (jb !== null && jb >= 0 ? 'Bac dans ' + fv(jb) + ' jours' : 'Bac passé') + '</p></section>';

  cible.innerHTML = '<h1>Le coach</h1>' + bloc2 + bloc3 + bloc4 + bloc5 + bloc6 + bloc7 + bloc8 + bloc9 +
    bloc10 + bloc11 + bloc12;

  _coBrancher();
}

/* Clé du Prof, lue sans jamais la sortir de l'appareil. */
function _coCle(k){ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } }

/* Compétences à risque en concours : 3 dernières épreuves, au moins 2 questions, moins de 60 % (S8). */
function _coRisque(){
  const eps = (S.epreuves || []).slice(-3);
  const par = {};
  eps.forEach(e => (e.parQ || []).forEach(q => {
    if (!q || !q.sid) return;
    const c = par[q.sid] || (par[q.sid] = {n: 0, ok: 0});
    c.n++; if (q.ok) c.ok++;
  }));
  const faibles = Object.keys(par).filter(id => par[id].n >= 2 && par[id].ok / par[id].n < .6)
    .map(id => {
      const s = (window.SKILLS || []).find(x => x.id === id);
      return (s ? s.titre : 'compétence archivée') + ' (' + par[id].ok + '/' + par[id].n + ')';
    });
  if (!faibles.length) return '';
  return 'Compétences à risque en concours : ' + faibles.slice(0, 3).join(', ') + '.';
}

/* ============================================================
   8. Écouteurs du Coach
   ============================================================ */
function _coBrancher(){
  const zone = app();
  const el = id => document.getElementById(id);
  const sur = (id, fn) => { const n = el(id); if (n) n.addEventListener('click', () => { snd.click(); fn(); }); };

  sur('co-obj', () => { const r = document.getElementById('ring-day'); if (r) r.click(); });
  sur('co-cahier', () => nav('erreurs'));
  sur('co-methode', () => nav('methode'));
  sur('co-ds', () => nav('ds'));
  sur('co-test', () => nav('test'));
  sur('co-epreuve', () => nav('epreuve', {fmt: _coFmt}));
  sur('co-demo', () => {
    if (typeof window.entrerPresentation === 'function'){ window.entrerPresentation(); return; }
    toast('Le mode présentation arrive dans une prochaine version.', {tone: 'info', icon: 'projector-screen'});
  });
  sur('co-debrief', () => {
    if (typeof window.ASSIST_ASK === 'function'){
      window.ASSIST_ASK('Fais-moi le débrief de ma semaine : ce qui progresse, ce qui bloque, et une seule action pour demain.');
      return;
    }
    if (typeof window.ASSIST_OUVRIR === 'function'){ window.ASSIST_OUVRIR(); return; }
    toast('Le Prof n\'est pas disponible ici.', {tone: 'info', icon: 'graduation-cap'});
  });

  zone.querySelectorAll('input[name="co-fmt"]').forEach(r => r.addEventListener('change', () => { _coFmt = r.value; }));

  /* médaillons : retournement */
  zone.querySelectorAll('.medal').forEach(m => m.addEventListener('click', () => {
    const on = m.getAttribute('aria-pressed') === 'true';
    m.setAttribute('aria-pressed', on ? 'false' : 'true');
    try { snd.tic(); } catch(e){}
  }));

  /* heatmap : info-bulle */
  const fermerTip = () => { if (_coTip){ _coTip.remove(); _coTip = null; } };
  zone.querySelectorAll('.hm[data-tip]').forEach(c => c.addEventListener('click', () => {
    fermerTip();
    const t = document.createElement('div');
    t.className = 'tip small';
    t.setAttribute('role', 'status');
    t.textContent = c.dataset.tip;
    document.body.appendChild(t);
    const r = c.getBoundingClientRect();
    t.style.left = Math.round(r.left + scrollX - 60) + 'px';
    t.style.top = Math.round(r.top + scrollY - 40) + 'px';
    _coTip = t;
    after(2400, fermerTip);
  }));
  surQuitter(fermerTip);
}

/* ============================================================
   9. Règles : redirigées vers « Comment ça marche » (DESIGN-SPEC §7.10)
   ============================================================ */
function vRegles(){ nav('methode', {remplace: true}); }

/* ============================================================
   10. Comment ça marche (S2, DESIGN-SPEC §7.21)
   ============================================================ */
function _coFrise(){
  const jalons = [2, 4, 8, 16, 32, 60];
  const X0 = 24, X1 = 340, Y = 34;
  const f = frontier();
  let courant = 0;
  try {
    const s = (window.SKILLS || []).map(x => st(x.id)).filter(x => x.mastered && x.interval);
    courant = s.length ? s.sort((a, b) => b.interval - a.interval)[0].interval : 0;
  } catch(e){}
  const pts = jalons.map((j, i) => {
    const x = X0 + (i / (jalons.length - 1)) * (X1 - X0);
    const cur = j === courant;
    return '<circle class="pt' + (cur ? ' cur' : '') + '" cx="' + x.toFixed(1) + '" cy="' + Y + '" r="' + (cur ? 4 : 3) + '"/>' +
      '<text x="' + x.toFixed(1) + '" y="' + (Y + 20) + '" text-anchor="middle">J+' + j + '</text>';
  }).join('');
  return '<svg class="frise" viewBox="0 0 360 64" role="img" aria-label="Les rappels : 2, 4, 8, 16, 32 puis 60 jours">' +
    '<path class="rail" d="M' + X0 + ',' + Y + ' L' + X1 + ',' + Y + '"/>' + pts + '</svg>' +
    (f ? '' : '');
}

function vMethode(){
  const cible = app();
  if (!cible) return;
  setCtx('lecon', {parent: 'coach', title: 'Comment ça marche'});
  cible.dataset.density = 'lecture';
  cible.className = 'view view-methode';

  const vierge = !Object.keys(S.journal).length && masteredCount() === 0;
  const chez = t => vierge
    ? '<p class="card card-accent small">Après ta première séance, tes chiffres apparaîtront ici.</p>'
    : '<p class="card card-accent small">' + esc(t) + '</p>';

  const alt = altitude(), camp = campDe(alt), f = frontier();
  const dernierCamp = (function(){
    for (let p = 7; p >= 1; p--) if (S.jalons['camp-' + p]) return PHASES[p].camp + ' franchi le ' + _coDate(S.jalons['camp-' + p]);
    return 'aucun camp franchi pour l\'instant';
  })();
  const sf = f ? st(f.id) : null;
  const dixDerniers = sf ? sf.hist.slice(-10) : [];
  const justes10 = dixDerniers.reduce((a, b) => a + b, 0);
  const due = dueReviews().length;
  let semaine = 0;
  (window.SKILLS || []).forEach(s => { const x = st(s.id); if (x.mastered && x.due && x.due <= Date.now() + 7 * JOUR) semaine++; });
  const enAttente = S.erreurs.length;
  const t = _coTypes();
  let domNom = '', domN = 0;
  TYPES_ERR.forEach(x => { if (t.c[x.id] > domN){ domN = t.c[x.id]; domNom = x.nom.toLowerCase(); } });

  const sommaire = ['La montagne', 'La règle des 90 %', 'Les rappels', 'Le mélange', 'La séance', 'Les erreurs']
    .map((n, i) => '<a class="chip" href="#met-' + (i + 1) + '">' + esc(n) + '</a>').join('');

  const montagne = (typeof window.montagneSVG === 'function') ? window.montagneSVG() : '';

  const s1 = '<section class="coach-sec" id="met-1"><h2>La montagne</h2>' + montagne +
    '<div class="formule"><p>altitude = somme des mètres par compétence · +2 m par bonne réponse, le reste au verrou</p></div>' +
    '<p class="ink-2">52 compétences, 7 camps, ' + nf(SOMMET, 'm') + '. Rien ne se perd : ce qui est monté reste monté.</p>' +
    chez('Chez toi : ' + nf(alt, 'm') + ', ' + dernierCamp + (f ? ', prochaine compétence : ' + f.titre : '') + '.') + '</section>';

  const s2 = '<section class="coach-sec" id="met-2"><h2>La règle des 90 %</h2>' +
    (sf ? crampons(dixDerniers, {courant: false}) : '') +
    '<p class="ink-2">Une compétence est acquise à 9 réponses justes sur les 10 dernières, et pas avant. ' +
    'Douze réponses au minimum : une chance ne suffit pas.</p>' +
    chez(f ? 'Chez toi : « ' + f.titre + " » est à " + justes10 + ' sur 10, encore ' +
      Math.max(0, 9 - justes10) + ' bonnes réponses.' : 'Chez toi : toutes les compétences ouvertes sont verrouillées.') + '</section>';

  const s3 = '<section class="coach-sec" id="met-3"><h2>Les rappels espacés</h2>' + _coFrise() +
    '<p class="ink-2">Une compétence acquise revient à 2, 4, 8, 16, 32 puis 60 jours. ' +
    'Si elle résiste, l\'écart repart à 2 jours : c\'est l\'oubli qui décide, pas le calendrier.</p>' +
    chez('Chez toi : ' + fv(due) + ' rappels aujourd\'hui, ' + fv(semaine) + ' cette semaine.') + '</section>';

  const s4 = '<section class="coach-sec" id="met-4"><h2>On mélange une fois installé</h2>' +
    crampons([{cls: 'ok'}, {cls: 'ok'}, {cls: 'mix'}, {cls: 'ok'}, {cls: 'ko'}, {cls: 'ok'}, {cls: 'mix'}, {cls: 'ok'}],
             {courant: false, libelle: 'Deux questions mêlées dans une série'}) +
    '<p class="ink-2">À partir de douze réponses sur une compétence, des questions voisines viennent se glisser dans la série. ' +
    'Savoir faire quand on sait ce qui arrive n\'est pas savoir faire.</p>' +
    chez('Chez toi : les questions mêlées démarrent à 12 réponses sur une compétence.') + '</section>';

  const etapes = [['timer', 'Échauffement', '2 min'], ['arrows-clockwise', 'Rappels', '5 min'],
                  ['flag', 'Compétence', '15 min'], ['book-open', 'Erreurs', '3 min']];
  const s5 = '<section class="coach-sec" id="met-5"><h2>La séance</h2>' +
    '<ol class="steps">' + etapes.map((e, i) =>
      '<li class="step' + (i === 0 ? ' cur' : '') + '"><span class="node">' + ic(e[0]) + '</span>' +
      '<span class="step-t">' + esc(e[1]) + '</span><span class="step-m">' + esc(e[2]) + '</span></li>').join('') + '</ol>' +
    '<p class="ink-2">Quatre étapes, vingt-cinq minutes. On révise avant d\'apprendre, on répare avant de partir.</p>' +
    chez('Chez toi, demain : échauffement, ' + fv(Math.min(4, due)) + ' rappels' +
      (f ? ', ' + f.titre : '') + ', ' + fv(Math.min(4, enAttente)) + ' erreurs.') + '</section>';

  const s6 = '<section class="coach-sec" id="met-6"><h2>Les erreurs</h2>' +
    '<div class="row">' + TYPES_ERR.map(x => '<span class="chip" data-tone="' + x.tone + '">' + esc(x.nom) + '</span>').join('') + '</div>' +
    '<p class="ink-2">Chaque erreur est classée, puis reposée. Elle sort du cahier après deux réussites espacées de deux jours : ' +
    'une le jour même ne prouve rien.</p>' +
    chez('Chez toi : ' + fv(enAttente) + ' erreurs en attente' +
      (domN ? ', surtout de ' + domNom + ' (' + Math.round(100 * domN / Math.max(1, t.types)) + ' %)' : '') + '.') + '</section>';

  cible.innerHTML =
    '<h1>Comment ça marche</h1>' +
    '<div class="row toc-chips">' + sommaire + '</div>' +
    s1 + s2 + s3 + s4 + s5 + s6 +
    '<p class="small muted">Tout fonctionne hors ligne, sans compte, sans serveur. Tes données restent sur cet appareil.</p>' +
    '<div class="row"><button class="btn btn-ghost" type="button" id="met-retour">' + ic('arrow-left') +
      'Revenir au coach</button></div>';

  const b = document.getElementById('met-retour');
  if (b) b.addEventListener('click', () => { snd.click(); nav('coach'); });
}
