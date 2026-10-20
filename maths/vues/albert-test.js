/* ===== Maths · Objectif Albert School : test blanc adaptatif =====
   40 min, QCM à 4 choix, une seule bonne réponse, aucun point négatif, sans calculatrice, sans pause, sans retour arrière,
   sans « Je ne sais pas ». Palier 1 à 5 : départ 2, +1 après chaque bonne réponse, −1 après une erreur.
   Questions tirées de window.ALBERT_SKILLS en alternant les compétences.
   Script classique : portée globale partagée. Ce fichier déclare : vAlbertTest, runAlbertTest.
   Tout le reste est préfixé _alt ; passerelle : window.albertCloreTest. Jamais record() : ni altitude, ni verrou. */
'use strict';

/* Réglages : la durée et le nombre de questions viennent des infos vérifiées (ALBERT_INFOS.test) quand elles existent.
   nMax null : on enchaîne les questions jusqu'à la fin du temps. */
function _altCfg(){
  const t = (window.ALBERT_INFOS && window.ALBERT_INFOS.test) || {};
  return {min: Number(t.minutes) || 40, nMax: Number(t.questions) || null, paliers: 5, depart: 2};
}
function _altHorloge(ms){ const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function _altJour(ts){ try { return new Date(ts).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}); } catch(e){ return ''; } }
function _altPool(){ return (window.ALBERT_SKILLS || []).filter(s => s && s.id && typeof s.gen === 'function'); }
function _altSkill(id){ return _altPool().find(s => s.id === id) || null; }
/* Niveau estimé : moyenne des paliers des 10 dernières réponses, sur 5. */
function _altNiveau(parQ){
  const l = parQ.slice(-10);
  return l.length ? Math.round(10 * l.reduce((a, q) => a + q.p, 0) / l.length) / 10 : 0;
}
/* Points pondérés : chaque bonne réponse rapporte son palier (« mieux notée » quand la difficulté monte).
   Indicateur de l'app : le barème officiel n'est pas publié. */
function _altPoints(parQ){ return parQ.reduce((a, q) => a + (q.ok ? q.p : 0), 0); }
/* Les 3 questions de plus haut palier : celles que le jury peut reposer. À palier égal, les justes d'abord, puis les plus tardives. */
function _altJury(parQ){
  return parQ.map((q, k) => ({k: k, q: q})).filter(x => x.q && x.q.q)
    .sort((a, b) => (b.q.p - a.q.p) || ((b.q.ok ? 1 : 0) - (a.q.ok ? 1 : 0)) || (b.k - a.k)).slice(0, 3)
    .map(x => ({sid: x.q.sid, p: x.q.p, ok: !!x.q.ok, q: x.q.q, a: x.q.a, given: x.q.given || '', expl: x.q.expl || ''}));
}
function _altPhrases(t){ return String(t || '').split(/[.!?…]+(?:\s|$)/).filter(s => s.trim().length > 2).length; }
/* Dernière correction affichée : le retour par l'historique la rouvre au lieu de lancer un test neuf. */
let _altRevoir = null;

/* Une question valable : QCM à 4 choix distincts (au sens de normStr) contenant a, énoncé jamais vu dans ce test.
   La compétence tirée passe en fin de file : les compétences alternent. Si le palier visé est épuisé
   (piste encore courte), on essaie les paliers voisins : le palier enregistré est celui de la question posée. */
function _altTirer(file, palier, vus){
  const essais = Math.max(file.length * 4, 24);
  const ordre = [palier, palier - 1, palier + 1, palier - 2, palier + 2].filter(p => p >= 1 && p <= 5);
  for (const p of ordre){
    for (let k = 0; k < essais; k++){
      const sk = file[k % file.length];
      const ex = genFor(sk, p);
      const c = Array.isArray(ex.choix) ? ex.choix : [];
      const n = c.map(normStr);
      if (c.length !== 4 || new Set(n).size !== 4 || n.indexOf(normStr(ex.a)) < 0 || vus[ex.q]) continue;
      vus[ex.q] = true;
      file.push(file.splice(file.indexOf(sk), 1)[0]);
      return {sk: sk, ex: ex, p: p};
    }
  }
  return null;
}

/* Résumé d'un test pour l'historique (S.albert.tests, 40 au plus). parQ minimal : pas de texte dans S,
   sauf les 3 questions du jury (rejouables depuis l'écran « Prêt ? »). */
function _altResume(e, o){
  const parQ = e.parQ || [], n = parQ.length;
  return {id: e.id, date: o.date, duree: o.duree, n: n, ok: parQ.filter(q => q.ok).length, vides: o.vides || 0, depart: e.depart,
    palierMax: n ? Math.max.apply(null, parQ.map(q => q.p)) : 0, palierFin: e.palier, niveau: _altNiveau(parQ), points: _altPoints(parQ),
    parQ: parQ.map(q => ({sid: q.sid, p: q.p, ok: q.ok, ms: q.ms})), jury: _altJury(parQ), sorties: e.sorties || 0,
    tempsEcoule: !!o.tempsEcoule, interrompu: !!o.interrompu};
}

/* Test resté ouvert (rechargement, app tuée en arrière-plan) dont le temps est écoulé : on l'archive, marqué interrompu. */
function _altClore(){
  const A = S.albert, e = A && A.enCours;
  if (!e || (e.limite && e.limite > Date.now())) return false;
  if (e.parQ && e.parQ.length){
    A.tests.push(_altResume(e, {date: e.limite || Date.now(), duree: _altCfg().min * 60000, tempsEcoule: true, interrompu: true}));
    if (A.tests.length > 40) A.tests.shift();
  }
  A.enCours = null;
  save();
  return true;
}
window.albertCloreTest = _altClore;      // le hub (vues/albert.js) l'appelle aussi

/* ---------- historique : courbe du niveau (barres CSS) et tableau ---------- */
function _altCourbe(tests){
  if (!tests.length) return '';
  const resume = tests.map(t => fv(t.niveau, 1)).join(' ; ');
  return '<figure class="alt-courbe">' +
    '<figcaption class="small muted">Niveau estimé sur 5, test par test, le plus récent à droite. Dernier : <b class="num">' +
      esc(fv(tests[tests.length - 1].niveau, 1)) + '</b>. Pointillé : repère 3,5.' + (tests.some(t => t.interrompu) ? ' Barre grise : test interrompu.' : '') + '</figcaption>' +
    '<div class="alt-courbe-plot" role="img" aria-label="Niveau des ' + tests.length + ' derniers tests : ' + esc(resume) + '.">' +
      '<span class="alt-courbe-repere" aria-hidden="true"></span>' +
      tests.map(t => '<span class="alt-courbe-bar"' + (t.interrompu ? ' data-interrompu' : '') + ' style="--h:' + Math.round(100 * Math.max(0, Math.min(5, Number(t.niveau) || 0)) / 5) + '"' +
        ' title="' + esc(_altJour(t.date) + ' · niveau ' + fv(t.niveau, 1) + ' sur 5 · ' + t.ok + ' / ' + t.n) + '"></span>').join('') +
    '</div></figure>';
}
function _altTableau(tests){
  if (!tests.length) return '';
  return '<details class="alt-histo"><summary>Historique complet (' + tests.length + (tests.length > 1 ? ' tests' : ' test') + ')</summary>' +
    '<div class="tblwrap"><table class="tbl"><thead><tr><th>Date</th><th>Justes</th><th>Points</th><th>Niveau</th><th>Palier max</th></tr></thead><tbody>' +
    tests.slice().reverse().map(t => '<tr><td>' + esc(_altJour(t.date)) + (t.interrompu ? ' <span class="small muted">interrompu</span>' : '') + '</td>' +
      '<td class="num">' + t.ok + ' / ' + t.n + '</td><td class="num">' + (t.points != null ? t.points : '–') + '</td>' +
      '<td class="num">' + esc(fv(t.niveau, 1)) + '</td><td class="num">' + (t.palierMax || '–') + '</td></tr>').join('') +
    '</tbody></table></div></details>';
}

/* ---------- « Le jury peut te les reposer » : raisonnement en 3 phrases, puis l'explication à comparer ---------- */
function _altJuryHtml(test){
  const l = (test && Array.isArray(test.jury)) ? test.jury : [];
  if (!l.length) return '';
  const N = S.albert.notes || {};
  return '<section class="coach-sec alt-jury"><p class="overline">Le jury peut te les reposer</p>' +
    '<p class="small muted">À l\'entretien, le jury peut revenir sur certaines des questions les plus difficiles de ton test pour vérifier ton raisonnement. ' +
      'Voici les 3 de plus haut palier : explique ta démarche en 3 phrases, à voix haute puis par écrit, avant de comparer.</p>' +
    l.map((j, i) => {
      const cle = 'jury-' + test.id + '-' + i, txt = N[cle] || '', sk = _altSkill(j.sid);
      return '<article class="card card-muted alt-jq">' +
        '<p class="overline">Palier ' + j.p + ' · ' + esc(sk ? sk.titre : 'compétence') + ' · ' + (j.ok ? 'juste' : 'à revoir') + '</p>' +
        '<p class="alt-enonce">' + esc(j.q) + '</p>' +
        '<p class="small">Bonne réponse : <b class="num">' + esc(j.a) + '</b>' + (j.given && !j.ok ? ' · ta réponse : <span class="num">' + esc(j.given) + '</span>' : '') + '</p>' +
        '<label class="field"><span class="label">Ton raisonnement en 3 phrases</span>' +
          '<textarea class="input alb-txt" rows="4" maxlength="2000" data-jury="' + esc(cle) + '">' + esc(txt) + '</textarea></label>' +
        '<div class="row"><span class="small muted" data-jury-n="' + i + '">' + _altPhrases(txt) + ' phrase(s)</span>' +
          '<button class="btn sm" type="button" data-jury-cmp="' + i + '"' + (txt.trim().length >= 20 ? '' : ' disabled') + '>Comparer avec la correction</button></div>' +
        '<div class="box astuce" data-jury-expl="' + i + '"' + (txt.trim().length >= 20 ? '' : ' hidden') + '><p class="box-t">L\'explication de la correction</p>' +
          '<p>' + esc(j.expl || 'Pas d\'explication pour cette question.') + '</p></div>' +
      '</article>';
    }).join('') + '</section>';
}
function _altBrancherJury(racine){
  racine.querySelectorAll('[data-jury]').forEach(t => {
    const art = t.closest('.alt-jq'), n = art.querySelector('[data-jury-n]'), b = art.querySelector('[data-jury-cmp]');
    t.addEventListener('input', () => {
      const v = t.value.slice(0, 2000);
      if (v.trim()) S.albert.notes[t.dataset.jury] = v; else delete S.albert.notes[t.dataset.jury];
      save();
      if (n) n.textContent = _altPhrases(v) + ' phrase(s)';
      if (b) b.disabled = v.trim().length < 20;
    });
  });
  racine.querySelectorAll('[data-jury-cmp]').forEach(b => b.addEventListener('click', () => {
    snd.click();
    const box = racine.querySelector('[data-jury-expl="' + b.dataset.juryCmp + '"]');
    if (box){ box.hidden = false; try { box.scrollIntoView({block: 'nearest', behavior: 'smooth'}); } catch(e){} }
  }));
}

/* ============================================================
   1. Écran « Prêt ? » et historique
   ============================================================ */
function vAlbertTest(){
  const cible = app();
  if (!cible) return;
  _altClore();
  setCtx('outil');
  cible.dataset.density = 'outil';
  const C = _altCfg(), pool = _altPool(), A = S.albert, e = A.enCours && A.enCours.limite > Date.now() ? A.enCours : null;
  if (!pool.length){
    cible.innerHTML = '<section class="view view-albert"><h1>Test blanc Albert</h1>' + vide({icone: 'hourglass',
      titre: 'Le test arrive avec les premières compétences de la piste.', action: {label: 'Revenir au hub', fn: () => nav('albert')}}) + '</section>';
    return;
  }
  const tests = (A.tests || []).slice(-40), der = tests[tests.length - 1];
  const fait = id => (typeof window.albertFaitHtml === 'function' ? window.albertFaitHtml(id) : '');
  const conditions = ['Feuille et stylo à portée de main.', 'Pas de calculatrice, ni téléphone, ni IA, ni aide.',
                      C.min + ' minutes devant moi, au calme.', 'Je ne quitte pas cet onglet pendant le test.'];
  cible.innerHTML =
    '<div class="view view-albert">' +
      '<header><p class="overline">Objectif Albert · conditions réelles</p><h1>Test blanc</h1></header>' +
      '<section class="card card-muted">' +
        '<h2>' + (C.nMax ? C.nMax + ' questions · ' : '') + C.min + ' minutes · QCM à 4 choix</h2>' +
        '<ul class="alt-regles">' +
          '<li>Une seule bonne réponse par question. Aucun point négatif : réponds à tout.</li>' +
          '<li>Chaque bonne réponse fait monter la difficulté et rapporte plus ; une erreur la fait redescendre d\'un cran. Départ au palier ' + C.depart + ' sur ' + C.paliers + '.</li>' +
          '<li>Pas de pause, pas de retour en arrière : un clic vaut réponse définitive.</li>' +
          '<li>Pas de calculatrice : les calculs se font de tête ou sur ta feuille.</li>' +
          '<li>Arrêt automatique à ' + C.min + ' minutes' + (C.nMax ? '' : ' : les questions s\'enchaînent jusque-là') + '. La question affichée à ce moment compte comme vide.</li>' +
        '</ul>' +
      '</section>' +
      (e ? '<p class="small muted">Un test est en cours : le chrono a continué de tourner, comme en conditions réelles.</p>'
         : '<section class="coach-sec"><p class="overline">Prêt ?</p><div class="crit">' + conditions.map((c, i) =>
             '<label class="crit-l"><input type="checkbox" data-alt-cond="' + i + '"><span>' + esc(c) + '</span></label>').join('') + '</div>' +
           '<p class="small muted" id="alt-go-aide">Coche les quatre conditions pour commencer.</p></section>') +
      '<div class="row"><button class="btn-primary lg" type="button" id="alt-go"' + (e ? '' : ' disabled') + '><span>' +
        (e ? 'Reprendre le test · ' + esc(_altHorloge(e.limite - Date.now())) : 'Commencer le test') +
        '</span><span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
      '<details class="alb-plus"><summary>Le vrai test, d\'après les sources</summary>' + fait('format') + fait('conditions') + fait('tentative') + fait('moment') + fait('langue') + '</details>' +
      (tests.length ? '<section class="coach-sec"><p class="overline">Tes tests blancs</p>' + _altCourbe(tests) +
        '<ul class="badges">' + tests.slice(-5).reverse().map(t => '<li class="badge"><span class="num">' + t.ok + ' / ' + t.n + '</span>' +
          '<span class="small muted">niveau ' + esc(fv(t.niveau, 1)) + ' · ' + esc(_altJour(t.date)) + (t.interrompu ? ' · interrompu' : '') + '</span></li>').join('') + '</ul>' +
        _altTableau(tests) + '</section>' : '') +
      (der ? _altJuryHtml(der) : '') +
    '</div>';

  const go = $('alt-go'), cases = Array.from(cible.querySelectorAll('[data-alt-cond]'));
  cases.forEach(c => c.addEventListener('change', () => {
    const tout = cases.every(x => x.checked);
    go.disabled = !tout;
    const aide = $('alt-go-aide'); if (aide) aide.textContent = tout ? 'Tout est prêt. Le chrono démarre après le décompte.' : 'Coche les quatre conditions pour commencer.';
  }));
  go.addEventListener('click', () => { if (go.disabled) return; snd.click(); nav('albertRun', e ? {reprise: true} : {}); });
  _altBrancherJury(cible);
}

/* ============================================================
   2. Le test
   ============================================================ */
function runAlbertTest(params){
  const p = params || {};
  if (p.retour){ if (_altRevoir) _altRevoir(); else vAlbertTest(); return; }   // jamais de test relancé par l'historique
  _altRevoir = null;
  _altClore();
  const C = _altCfg(), pool = _altPool();
  if (!pool.length){ vAlbertTest(); return; }
  const reprise = p.reprise && S.albert.enCours ? S.albert.enCours : null;
  const etat = reprise || {id: 'alt-' + Date.now().toString(36), debut: 0, limite: 0, palier: C.depart, depart: C.depart, parQ: [], sorties: 0};
  const file = R.shuffle(pool), vus = {};
  etat.parQ.forEach(q => { vus[q.q] = true; });
  let fini = false, alerte5 = false, alerte1 = false, courant = null, tq = 0;

  window.vueCourante.enCours = true;
  window.vueCourante.garde = () => fini;
  window.MODE_EXAMEN = true;
  /* « Ne quitte pas l'onglet » : comme le jour J, on compte les sorties (le chrono, lui, continue). */
  const surVisibilite = () => {
    if (fini || !etat.debut) return;
    if (document.visibilityState === 'hidden'){ etat.sorties = (etat.sorties || 0) + 1; save(); }
    else toast('Tu as quitté l\'onglet : le jour J, reste sur la page du test.', {tone: 'warn', icon: 'warning'});
  };
  document.addEventListener('visibilitychange', surVisibilite);
  surQuitter(() => {
    document.removeEventListener('visibilitychange', surVisibilite);
    const c = $('crete'); if (c) c.classList.remove('alarm');
    window.MODE_EXAMEN = false;
    if (!fini && S.albert.enCours === etat){ S.albert.enCours = null; save(); }   // abandon volontaire : copie non corrigée
  });

  const reste = () => Math.max(0, etat.limite - Date.now());
  setCtx('parcours', {title: 'Test Albert', count: 'Q ' + (etat.parQ.length + 1), pause: false});
  app().dataset.density = 'outil';

  function decompte(apres){
    app().innerHTML =
      '<section class="view"><section class="step-screen card" role="status">' + ic('hourglass', 'ic-48') +
        '<h2>Test blanc Albert</h2><p class="display-l" id="alt-dec">3</p>' +
        '<p class="small muted">' + C.min + ' minutes. Pas de pause, pas de retour en arrière.</p></section></section>';
    const pas = n => { const el = $('alt-dec'); if (el){ el.textContent = n > 0 ? String(n) : 'Départ'; snd.tic(); } };
    snd.tic();
    after(1000, () => { pas(2); after(1000, () => { pas(1); after(900, () => { pas(0); after(200, apres); }); }); });
  }

  function demarrer(){
    if (fini || window.vueCourante.v !== 'albertRun') return;
    if (!etat.debut){ etat.debut = Date.now(); etat.limite = etat.debut + C.min * 60000; }   // t0 APRÈS le décompte
    S.albert.enCours = etat; save();
    app().innerHTML =
      '<section class="view">' +
        '<div class="chrono-bar" id="alt-bar">' +
          '<span class="num-l" id="alt-temps">' + _altHorloge(reste()) + '</span>' +
          '<span class="num muted" id="alt-pos"></span>' +
          '<div class="pbar total" id="alt-pbar" role="progressbar" aria-label="Temps écoulé" style="--p:0"><i></i></div>' +
        '</div>' +
        '<div id="alt-zone"></div>' +
      '</section>';
    every(250, tic);
    tic();
    poser();
  }

  function tic(){
    if (fini) return;
    const r = reste();
    const el = $('alt-temps'); if (el) el.textContent = _altHorloge(r);
    const pb = $('alt-pbar'); if (pb) pb.style.setProperty('--p', String(Math.round(100 - 100 * r / (C.min * 60000))));
    if (r <= 300000 && !alerte5){ alerte5 = true; toast('Plus que 5 minutes.', {tone: 'warn', icon: 'clock-countdown'}); }
    if (r <= 60000 && !alerte1){
      alerte1 = true;
      const b = $('alt-bar'); if (b) b.classList.add('alarm');
      const c = $('crete'); if (c) c.classList.add('alarm');
      toast('Une minute.', {tone: 'ko', icon: 'clock-countdown'});
      vibrer([20, 40, 20]);
    }
    if (r <= 0) corriger(true);
  }

  function poser(){
    if (fini || window.vueCourante.v !== 'albertRun') return;
    if (C.nMax && etat.parQ.length >= C.nMax){ corriger(false); return; }
    courant = _altTirer(file, etat.palier, vus);
    if (!courant){ corriger(false); return; }
    const i = etat.parQ.length + 1;
    setCtx('parcours', {title: 'Test Albert', count: C.nMax ? i + ' / ' + C.nMax : 'Q ' + i, pause: false});
    const pos = $('alt-pos'); if (pos) pos.textContent = 'Question ' + i;
    tq = performance.now();
    askQuestion($('alt-zone'), {
      ex: courant.ex, skill: courant.sk, skillId: courant.sk.id, tag: courant.sk.titre,
      differe: true, chrono: false, indices: false, reprise: false, sansType: true, serie: false, prof: false, gain: false
    }, r => {
      if (fini) return;
      const ok = !!r.ok, ex = courant.ex;
      etat.parQ.push({sid: courant.sk.id, p: courant.p, ok: ok, ms: Math.round(performance.now() - tq),
                      q: ex.q, a: ex.a, given: r.given || '', expl: ex.expl || '', choix: ex.choix});
      etat.palier = ok ? Math.min(C.paliers, courant.p + 1) : Math.max(1, courant.p - 1);
      courant = null;
      save();                                  // etat est S.albert.enCours : la reprise après rechargement le relit
      poser();                                 // SYNCHRONE : la carte suivante remplace la précédente
    });
  }

  function corriger(tempsEcoule){
    if (fini) return;
    if (window.vueCourante.v !== 'albertRun') return;          // jamais de correction dans l'écran d'un autre
    fini = true;
    window.vueCourante.enCours = false;
    window.vueCourante.garde = null;
    window.MODE_EXAMEN = false;
    const c = $('crete'); if (c) c.classList.remove('alarm');

    const parQ = etat.parQ, n = parQ.length;
    const vide = tempsEcoule && courant ? {sid: courant.sk.id, p: courant.p, q: courant.ex.q, a: courant.ex.a, expl: courant.ex.expl || '', choix: courant.ex.choix} : null;
    const duree = Math.min(C.min * 60000, Date.now() - etat.debut);
    parQ.forEach(q => logAnswer(q.ok, q.ms));
    const res = _altResume(etat, {date: Date.now(), duree: duree, vides: vide ? 1 : 0, tempsEcoule: tempsEcoule, interrompu: false});
    S.albert.tests.push(res);
    if (S.albert.tests.length > 40) S.albert.tests.shift();
    S.albert.enCours = null;
    window.validerJour(n, C.nMax || 20);
    save(); save.flush();

    const ok = res.ok, msParQ = n ? Math.round(duree / n / 1000) : 0;
    const msgs = [];
    msgs.push(n ? 'Rythme : ' + n + (n > 1 ? ' réponses' : ' réponse') + ' en ' + Math.max(1, Math.round(duree / 60000)) + ' min, soit environ ' + msParQ + ' s par question.' : 'Aucune réponse donnée.');
    if (res.sorties) msgs.push('Tu as quitté l\'onglet ' + res.sorties + ' fois : le jour J, il faut rester sur la page du test.');
    else if (tempsEcoule && vide) msgs.push('Le temps est tombé pendant une question : sans point négatif, mieux vaut répondre au jugé dans la dernière minute.');
    if (res.palierMax >= 5) msgs.push('Tu as atteint le palier 5. Le jury peut revenir sur ces questions : prépare ton raisonnement ci-dessous.');
    const ajoutes = {};
    const items = parQ.map((q, k) => Object.assign({k: k}, q)).concat(vide ? [Object.assign({k: n, vide: true, ok: false, given: ''}, vide)] : []);

    const afficher = () => {
      setCtx('plein');
      app().dataset.density = 'lecture';
      app().innerHTML =
        '<section class="fin-card" data-kind="serie">' +
          '<p class="overline">Test blanc Albert' + (tempsEcoule ? ' · temps écoulé' : '') + ' · ' + esc(_altJour(Date.now())) + '</p>' +
          '<h2 class="display-l">' + ok + ' / ' + n + '</h2>' +
          '<p class="small muted">bonnes réponses sur ' + n + (n > 1 ? ' répondues' : ' répondue') + (vide ? ', plus une question sans réponse' : '') + '.</p>' +
          '<div class="figures display">' +
            '<div class="figure"><b class="num">' + res.points + '</b><span class="overline">points pondérés</span></div>' +
            '<div class="figure"><b class="num">' + esc(fv(res.niveau, 1)) + '</b><span class="overline">niveau / 5</span></div>' +
            '<div class="figure"><b class="num">' + res.palierMax + '</b><span class="overline">palier max</span></div>' +
          '</div>' +
          '<p class="small muted">Points pondérés : chaque bonne réponse rapporte son palier (1 à 5). C\'est un indicateur de l\'app : le barème officiel n\'est pas publié.</p>' +
          msgs.slice(0, 3).map(t => '<blockquote class="coach-msg"><p>' + esc(t) + '</p></blockquote>').join('') +
          '<div class="next-row"><button class="btn-primary lg" type="button" id="alt-fini"><span>Revenir au hub Albert</span>' +
            '<span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
        '</section>' +
        '<div class="view view-albert">' +
          _altJuryHtml(res) +
          (items.length ? '<section class="coach-sec alt-corr"><p class="overline">Correction, question par question</p>' + items.map(f => {
            const sk = _altSkill(f.sid);
            return '<article class="err alt-q' + (f.ok ? '' : ' ko') + '">' +
              '<p class="meta small"><span class="chip" data-tone="' + (f.ok ? 'ok' : f.vide ? 'muted' : 'ko') + '">' + (f.ok ? 'Juste' : f.vide ? 'Sans réponse' : 'Erreur') + '</span>' +
                '<span class="num">Palier ' + f.p + '</span><span>' + esc(sk ? sk.titre : f.sid) + '</span></p>' +
              '<p class="q">' + (f.k + 1) + '. ' + esc(f.q) + '</p>' +
              '<p class="rep">' + (f.ok
                ? '<span class="small muted">Ta réponse</span><b class="num">' + esc(f.a) + '</b>'
                : '<span class="small muted">Ta réponse</span>' + (f.vide ? '<span class="small muted">aucune</span>' : '<s class="num">' + esc(f.given) + '</s>') +
                  '<span class="small muted">Bonne réponse</span><b class="num">' + esc(f.a) + '</b>') + '</p>' +
              (f.expl ? '<p class="small ink-2">' + esc(f.expl) + '</p>' : '') +
              '<div class="row">' + (f.ok ? '' : '<button class="btn sm" type="button" data-ajout="' + f.k + '">' + ic('book-bookmark', 'ic-20') + 'Ajouter au cahier</button>') +
              (sk ? '<button class="btn sm btn-ghost" type="button" data-lecon="' + esc(f.sid) + '">' + ic('book-open', 'ic-20') + 'La leçon</button>' : '') +
              '</div></article>';
          }).join('') + '</section>' : '') +
        '</div>';
      document.querySelectorAll('[data-ajout]').forEach(b => {
        const k = Number(b.dataset.ajout), dedans = () => { b.disabled = true; b.innerHTML = ic('check', 'ic-20') + 'Dans le cahier'; };
        if (ajoutes[k]) dedans();
        b.addEventListener('click', () => {
          const f = items.find(x => x.k === k);
          if (!f || ajoutes[k]) return;
          snd.click(); ajoutes[k] = true;
          const ts = Date.now();
          S.erreurs.unshift({sid: f.sid, q: f.q, a: f.a, given: f.given || '', expl: f.expl || '', choix: f.choix || null,
                             ts: ts, redo: 0, reprise: 0, type: '', due: ts + JOUR, okAt: 0});
          if (S.erreurs.length > 120) S.erreurs.pop();
          save(); dedans();
          toast('Ajoutée au cahier. Elle reviendra demain.', {tone: 'ok', icon: 'book-bookmark'});
        });
      });
      document.querySelectorAll('[data-lecon]').forEach(b =>
        b.addEventListener('click', () => { snd.click(); nav('albertLecon', {id: b.dataset.lecon}); }));
      _altBrancherJury(app());
      $('alt-fini').addEventListener('click', () => { snd.click(); nav('albert'); });
      $('alt-fini').focus();
    };
    afficher();
    _altRevoir = afficher;
    celebrer(2, {texte: 'Test blanc terminé · ' + ok + ' sur ' + n + '.', icon: 'hourglass'});
    try { majCrete(); majAnneauJour(); } catch(e){}
    annoncer('Test blanc terminé. ' + ok + ' sur ' + n + '. ' + res.points + ' points pondérés. Niveau ' + fv(res.niveau, 1) + ' sur 5.');
  }

  if (reprise && etat.debut) demarrer(); else decompte(demarrer);
}
