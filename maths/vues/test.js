/* ===== Maths · De zéro au sommet : test de la semaine =====
   DESIGN-SPEC §7.7 (écran « Prêt ? », correction immédiate simplifiée, carte de fin)
   PRODUCT-SPEC M3 (garde de sortie, démontage), M5 (altitude), M9 (maîtrise).
   Ce fichier déclare : vTest. Tout le reste est préfixé _ts et n'appartient qu'à lui.
   Script classique : portée globale partagée (ordre de chargement dans index.html). */
'use strict';

/* ---------- constantes propres au test ---------- */
const _tsMax = 20;                 // questions au maximum
const _tsLimite = 10 * 60000;      // 10 minutes de chrono global
const _tsSeuilFragile = 0.6;       // sous 60 % sur une compétence, elle repasse en rappel

/* ---------- petits utilitaires (jamais partagés) ---------- */
/* « 9:05 » à partir d'un reste en millisecondes. */
function _tsHorloge(ms){
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
/* « 6 sept. » */
function _tsJour(ts){
  try { return new Date(ts).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}); }
  catch(e){ return ''; }
}
/* Nombre de jours travaillés depuis lundi (situe le test dans la semaine). */
function _tsJoursSemaine(){
  const d = new Date();
  const decal = (d.getDay() + 6) % 7;                 // lundi = 0
  let n = 0;
  for (let i = 0; i <= decal; i++){
    const j = new Date(); j.setDate(j.getDate() - (decal - i));
    const e = S.journal[todayKey(j)];
    if (e && (e.a > 0 || e.seance)) n++;
  }
  return n;
}
/* Entrée du cahier d'erreurs, au format v2. */
function _tsCahier(skill, r){
  try {
    const ts = Date.now();
    S.erreurs.unshift({sid: skill.id, q: r.ex.q, a: r.ex.a, given: r.given || '', expl: r.ex.expl || '',
                       choix: r.ex.choix || null, ts: ts, redo: 0, reprise: 0,
                       type: r.type || '', due: ts + JOUR, okAt: 0});
    if (S.erreurs.length > 120) S.erreurs.pop();
  } catch(e){}
}
/* Tirage : au plus 3 questions par compétence, les fragiles et les rappels dus reviennent plus souvent. */
function _tsTirage(pool, n){
  const maintenant = Date.now();
  const poids = s => {
    const x = st(s.id);
    let w = 1;
    if (x.mastered) w += 1.5;
    if (x.fragile) w += 2;
    if (x.due && x.due <= maintenant) w += 1;
    const t = tauxRecent(s.id);
    if (t !== null && t < .7) w += 1.5;
    return w;
  };
  const vus = {}, sortie = [];
  let garde = 0;
  while (sortie.length < n && garde++ < n * 40){
    const restants = pool.filter(s => (vus[s.id] || 0) < 3);
    if (!restants.length) break;
    let total = 0;
    restants.forEach(s => { total += poids(s); });
    let r = Math.random() * total, choisi = restants[restants.length - 1];
    for (const s of restants){ r -= poids(s); if (r <= 0){ choisi = s; break; } }
    vus[choisi.id] = (vus[choisi.id] || 0) + 1;
    sortie.push(choisi);
  }
  return R.shuffle(sortie);
}
/* Les cinq derniers résultats, en pastilles datées. */
function _tsBadges(){
  const derniers = (S.tests || []).slice(-5).reverse();
  if (!derniers.length) return '';
  return '<ul class="badges">' + derniers.map(t =>
    '<li class="badge"><span class="num">' + t.ok + ' / ' + t.n + '</span>' +
    '<span class="small muted">' + esc(_tsJour(t.date)) + '</span></li>').join('') + '</ul>';
}

/* ============================================================
   Écran « Prêt ? » (DESIGN-SPEC §7.7)
   ============================================================ */
function vTest(){
  const pool = SKILLS.filter(s => { const x = st(s.id); return x.n > 0 || x.mastered; });

  if (pool.length < 3){
    setCtx('outil');
    app().dataset.density = 'lecture';
    app().innerHTML = '<section class="view"><h1>Test de la semaine</h1>' +
      vide({icone: 'lock-simple',
            titre: 'Se débloque après 3 compétences acquises.',
            texte: 'Il t\'en reste ' + (3 - pool.length) + '.',
            action: {label: 'Continuer le programme', fn: () => nav('programme')}}) +
      '</section>';
    return;
  }

  setCtx('outil');
  const n = Math.min(_tsMax, pool.length * 3);
  const badges = _tsBadges();

  app().innerHTML =
    '<section class="view">' +
      '<p class="overline">Épreuves · une fois par semaine</p>' +
      '<h1>Test de la semaine</h1>' +
      '<section class="card">' +
        '<h2>' + n + ' questions, 10 minutes</h2>' +
        '<p class="small muted">Sans indice, sans chrono par question.</p>' +
        '<p class="small muted">Tout ce que tu as déjà travaillé peut tomber. Les compétences qui flanchent repassent en rappel.</p>' +
        '<div class="row"><button class="btn-primary lg" type="button" id="ts-go">' +
          '<span>Commencer le test</span><span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
      '</section>' +
      '<blockquote class="coach-msg"><p>Vingt questions pour réactiver tout ce que tu sais déjà. Vise 90 %, pas la perfection.</p></blockquote>' +
      (badges ? '<section><p class="overline">Tes cinq derniers tests</p>' + badges + '</section>' : '') +
    '</section>';

  $('ts-go').addEventListener('click', () => { snd.click(); _tsRun(pool, n); });
}

/* ============================================================
   Le test lui-même
   ============================================================ */
function _tsRun(pool, n){
  const picks = _tsTirage(pool, n);
  const N = picks.length;
  const parSkill = {};
  const t0 = Date.now();
  let i = 0, ok = 0, fini = false, tempsEcoule = false;

  window.vueCourante.enCours = true;
  window.vueCourante.garde = () => fini;
  window.MODE_EXAMEN = false;

  setCtx('parcours', {title: 'Test de la semaine', count: '1 / ' + N});
  app().dataset.density = 'outil';
  app().innerHTML =
    '<section class="view">' +
      '<div class="chrono-bar" id="ts-bar">' +
        '<span class="num-l" id="ts-temps">' + _tsHorloge(_tsLimite) + '</span>' +
        '<span class="num muted">sans indice</span>' +
        '<div class="pbar total" id="ts-pbar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"' +
          ' aria-label="Avancement du test" style="--p:0"><i></i></div>' +
      '</div>' +
      '<div id="ts-zone"></div>' +
    '</section>';

  const elTemps = $('ts-temps'), elBar = $('ts-bar'), elP = $('ts-pbar');
  let alerte = false;

  every(250, () => {
    if (fini) return;
    const reste = _tsLimite - (Date.now() - t0);
    if (elTemps) elTemps.textContent = _tsHorloge(reste);
    if (reste <= 60000 && !alerte){
      alerte = true;
      if (elBar) elBar.classList.add('alarm');
      toast('Une minute.', {tone: 'glacier', icon: 'clock-countdown'});
    }
    if (reste <= 0){ tempsEcoule = true; _tsFin(); }
  });

  function avance(){
    const p = Math.round(100 * i / N);
    if (elP){ elP.style.setProperty('--p', String(p)); elP.setAttribute('aria-valuenow', String(p)); }
  }

  function poser(){
    if (fini) return;
    if (i >= N){ _tsFin(); return; }
    const skill = picks[i];
    const zone = $('ts-zone');
    if (!zone) return;
    setCtx('parcours', {title: 'Test de la semaine', count: (i + 1) + ' / ' + N});
    zone.innerHTML = '';
    const hote = document.createElement('div');
    zone.appendChild(hote);
    askQuestion(hote, {
      ex: genFor(skill, 2), skill: skill, skillId: skill.id,
      tag: skill.titre, count: (i + 1) + ' / ' + N,
      chrono: false, indices: false, reprise: false, sansType: true, serie: false, prof: false
    }, r => {
      if (fini) return;
      logAnswer(r.ok, r.ms);
      if (r.ok) ok++;
      const c = parSkill[skill.id] || (parSkill[skill.id] = {ok: 0, n: 0, titre: skill.titre});
      c.n++; if (r.ok) c.ok++;
      record(skill.id, r.ok);
      if (!r.ok) _tsCahier(skill, r);
      i++;
      avance();
      poser();
    });
  }

  /* ---------- bilan ---------- */
  function _tsFin(){
    if (fini) return;
    fini = true;
    window.vueCourante.enCours = false;
    window.vueCourante.garde = null;
    teardownChrono();

    const poses = Math.max(1, i);
    const p = ok / poses;
    const minutes = Math.max(1, Math.round((Date.now() - t0) / 60000));
    const precedent = (S.tests || []).slice(-1)[0] || null;

    /* compétences qui flanchent : remises en rappel, et annoncées */
    const flanchent = [];
    Object.keys(parSkill).forEach(sid => {
      const c = parSkill[sid];
      if (c.n >= 2 && c.ok / c.n < _tsSeuilFragile){
        const x = st(sid);
        if (x.mastered && !x.fragile){ x.fragile = true; x.due = Date.now(); flanchent.push(c.titre); }
      }
    });

    S.tests.push({date: Date.now(), ok: ok, n: poses});
    if (S.tests.length > 60) S.tests.shift();
    const record0 = S.records.precision || 0;
    const pourcent = Math.round(p * 100);
    const nouveauRecord = poses >= 10 && pourcent > record0;
    if (nouveauRecord) S.records.precision = pourcent;
    jToday().seance = true;
    save();

    /* le bilan situe le résultat dans la semaine */
    const jours = _tsJoursSemaine();
    const lignes = [];
    lignes.push(jours > 1 ? jours + ' jours travaillés cette semaine.' : 'Premier jour travaillé de la semaine.');
    if (precedent) lignes.push('Test précédent : ' + precedent.ok + ' sur ' + precedent.n + ' le ' + _tsJour(precedent.date) + '.');
    if (flanchent.length) lignes.push((flanchent.length > 1 ? 'Ces compétences repassent en rappel : ' : 'Cette compétence repasse en rappel : ') + flanchent.slice(0, 3).join(', ') + '.');

    const coach = p >= .9
      ? 'Semaine validée. Tu tiens la règle des 90 %, on peut monter.'
      : p >= .7
        ? 'Bon test. Les compétences en dessous de 60 % reviennent en rappel dès demain.'
        : 'Le test a fait son travail : il montre exactement où appuyer cette semaine.';

    const emoji = p >= .9 ? '<span class="emoji" aria-hidden="true">🎉</span> '
                : p >= .7 ? '<span class="emoji" aria-hidden="true">💪</span> ' : '';

    setCtx('plein');
    app().dataset.density = 'lecture';
    app().innerHTML =
      '<section class="fin-card" data-kind="serie">' +
        '<p class="overline">Test de la semaine · ' + esc(_tsJour(Date.now())) + (tempsEcoule ? ' · temps écoulé' : '') + '</p>' +
        '<h2 class="display-l">' + ok + ' / ' + poses + '</h2>' +
        '<p class="small muted">' + emoji + pourcent + ' % de précision.</p>' +
        '<div class="figures display">' +
          '<div class="figure"><b class="num">' + ok + '</b><span class="overline">justes</span></div>' +
          '<div class="figure"><b class="num">' + pourcent + ' %</b><span class="overline">précision</span></div>' +
          '<div class="figure"><b class="num">' + minutes + ' min</b><span class="overline">temps</span></div>' +
        '</div>' +
        (nouveauRecord ? '<p class="record">' + ic('crown-simple', 'ic-20') +
          '<span class="emoji" aria-hidden="true">🏆</span> Record personnel · précision ' + pourcent + ' %</p>' : '') +
        '<p class="msg">' + esc(lignes.join(' ')) + '</p>' +
        '<blockquote class="coach-msg"><p>' + esc(coach) + '</p></blockquote>' +
        _tsBadges() +
        '<div class="next-row"><button class="btn-primary lg" type="button" id="ts-home">' +
          '<span>Revenir à Aujourd\'hui</span><span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
        '<div class="row">' +
          '<button class="btn" type="button" id="ts-cahier">' + ic('book-bookmark', 'ic-20') + 'Classer mes erreurs</button>' +
          '<button class="btn btn-ghost" type="button" id="ts-coach">' + ic('compass', 'ic-20') + 'Voir mon profil</button>' +
        '</div>' +
      '</section>';

    $('ts-home').addEventListener('click', () => { snd.click(); nav('accueil'); });
    $('ts-cahier').addEventListener('click', () => { snd.click(); nav('erreurs'); });
    $('ts-coach').addEventListener('click', () => { snd.click(); nav('coach'); });
    $('ts-home').focus();

    if (flanchent.length)
      toast(flanchent.length + (flanchent.length > 1 ? ' compétences repassent en rappel.' : ' compétence repasse en rappel.'),
            {tone: 'glacier', icon: 'arrows-clockwise'});
    if (p >= .9) celebrer(3, {texte: 'Semaine validée · ' + pourcent + ' %.', icon: 'seal-check'});
    else celebrer(2, {texte: ok + ' sur ' + poses + '. Le cahier a de quoi travailler.', icon: 'book-bookmark'});

    try { (window.verifierJalons ? verifierJalons() : []).forEach(j => celebrer(j.niveau, {texte: j.texte})); } catch(e){}
    try { verifierSucces({type: 'test-fin', ok: ok, n: poses}).forEach(s => celebrer(3, {texte: 'Succès : ' + s.nom + '.', icon: s.ic})); } catch(e){}
    try { majCrete(); majAnneauJour(); } catch(e){}
    annoncer('Test terminé. ' + ok + ' sur ' + poses + '.');
  }

  /* Le chrono vit dans le registre du cœur : rien à couper à la main, mais on
     évite qu'un dernier tic ne réécrive la carte de fin. */
  function teardownChrono(){ const b = $('ts-bar'); if (b) b.classList.remove('alarm'); }

  avance();
  poser();
}
