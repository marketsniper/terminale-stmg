/* ===== Maths · De zéro au sommet : la séance guidée =====
   DESIGN-SPEC §6.13 (corde), §6.14 (transition d'étape), §6.15 (carte de fin), §6.36 (carte
   partageable), §7.4. PRODUCT-SPEC M7 (plan, rappels, transitions, fin rituelle, records),
   M5 (camps), M6 (reprise après absence), S6 (carte au canvas).
   Script classique : ce fichier ne déclare que vSeance ; ses autres symboles sont préfixés
   _seance et ne sortent que par window (planSeance, partagerCarte). */
'use strict';

/* ============================================================
   0. Petits utilitaires internes
   ============================================================ */

function _seanceReduit(){
  try {
    if (document.documentElement.dataset.motion === 'reduit') return true;
    if (typeof REDUCE !== 'undefined' && REDUCE) return true;
  } catch(e){}
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function _seanceSon(nom, arg){ try { if (window.snd && typeof snd[nom] === 'function') snd[nom](arg); } catch(e){} }

/* Les erreurs qui doivent revenir aujourd'hui (M10). Le cahier peut fournir sa propre version. */
function _seanceErreursDues(max){
  if (typeof window.erreursDues === 'function'){
    try { return window.erreursDues().slice(0, max); } catch(e){}
  }
  const now = Date.now();
  const liste = (S.erreurs || []).slice();
  const dues = liste.filter(e => (e.due || 0) <= now).sort((a, b) => (a.due || 0) - (b.due || 0));
  const reste = liste.filter(e => dues.indexOf(e) < 0 && !(e.redo > 0)).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  return dues.concat(reste).slice(0, max);
}

/* Échéancier d'une erreur reprise (M10). Retourne 'reparee', 'tot' ou 'revoir'. */
function _seanceReparer(e, ok){
  if (typeof window.reparer === 'function'){
    try { return window.reparer(e, ok); } catch(x){}
  }
  const now = Date.now();
  if (!ok){ e.redo = 0; e.due = now + JOUR; save(); return 'revoir'; }
  if (!e.redo){ e.redo = 1; e.okAt = now; e.due = now + 3 * JOUR; save(); return 'reprise'; }
  if (now - (e.okAt || 0) >= 2 * JOUR){
    S.erreurs = S.erreurs.filter(x => x !== e);
    S.reparees.push({sid: e.sid, q: e.q, type: e.type || '', ts: now});
    S.compteurs.reparees = (S.compteurs.reparees || 0) + 1;
    save();
    try { emettre('erreur-reparee', {sid: e.sid}); } catch(x){}
    return 'reparee';
  }
  e.due = (e.okAt || now) + 3 * JOUR;
  save();
  return 'tot';
}

/* ============================================================
   1. planSeance : le plan annoncé (PRODUCT-SPEC M7)
   ============================================================ */

/* Retourne {mode, etapes:[{cle, t, n, min, ic, ...}], min, total}.
   Aucune écriture d'état : l'accueil l'appelle pour annoncer la durée. */
function _seancePlan(mode){
  const m = mode || 'normale';
  const etapes = [];
  const due = dueReviews();
  const f = frontier();
  const s = f ? st(f.id) : null;

  if (m === 'reprise'){
    const rev = due.slice(0, 6);
    etapes.push({cle: 'echauffement', t: 'Échauffement', n: 8, min: 2, ic: 'timer'});
    if (rev.length) etapes.push({cle: 'rappels', t: 'Rappels', n: rev.length, min: 1 + rev.length, ic: 'arrows-clockwise', skills: rev, parSkill: 2, level: 1});
  } else if (m === 'bonus'){
    if (f) etapes.push({cle: 'skill', t: f.titre, n: 10, min: 12, ic: 'flag-banner', skill: f, lecon: !s.lu && s.n === 0});
    const errs = _seanceErreursDues(4);
    if (errs.length) etapes.push({cle: 'erreurs', t: 'Erreurs', n: errs.length, min: 3, ic: 'book-bookmark', erreurs: errs});
  } else {
    const rev = due.slice(0, 4);
    etapes.push({cle: 'echauffement', t: 'Échauffement', n: 12, min: 2, ic: 'timer'});
    if (rev.length) etapes.push({cle: 'rappels', t: 'Rappels', n: rev.length, min: 1 + rev.length, ic: 'arrows-clockwise', skills: rev, parSkill: 3, level: 2});
    if (f) etapes.push({cle: 'skill', t: f.titre, n: 10, min: 15, ic: 'flag-banner', skill: f, lecon: !s.lu || s.n === 0});
    const errs = _seanceErreursDues(4);
    if (errs.length) etapes.push({cle: 'erreurs', t: 'Erreurs', n: errs.length, min: 3, ic: 'book-bookmark', erreurs: errs});
  }
  const total = etapes.reduce((a, e) =>
    a + (e.cle === 'rappels' ? e.n * (e.parSkill || 3) : e.n), 0);
  const min = Math.max(5, etapes.reduce((a, e) => a + e.min, 0));
  return {mode: m, etapes: etapes, min: min, total: total, resteRappels: Math.max(0, due.length - (m === 'reprise' ? 6 : 4))};
}
window.planSeance = _seancePlan;

/* ============================================================
   2. La corde et la barre de progression (DESIGN-SPEC §6.13)
   ============================================================ */

function _seanceCorde(plan, idx, faits, total){
  const li = plan.etapes.map((e, i) => {
    const cls = i < idx ? 'step done' : i === idx ? 'step cur' : 'step';
    const mesure = e.cle === 'rappels' ? (e.n + ' × ' + (e.parSkill || 3)) : (e.n + ' q');
    return '<li class="' + cls + '"' + (i === idx ? ' aria-current="step"' : '') + '>' +
      '<span class="node">' + (i < idx ? ic('check') : '') + '</span>' +
      '<span class="step-t">' + esc(e.t) + '</span>' +
      '<span class="step-m num">' + esc(mesure) + '</span></li>';
  }).join('');
  const p = total ? Math.round(100 * faits / total) : 0;
  return '<ol class="steps rope" aria-label="Étapes de la séance">' + li + '</ol>' +
    '<div class="pbar total" role="progressbar" aria-valuenow="' + faits + '" aria-valuemin="0" aria-valuemax="' +
    total + '" aria-valuetext="' + faits + ' questions sur ' + total + '" style="--p:' + p + '"><i></i></div>';
}

/* ============================================================
   3. Écran de transition d'étape (DESIGN-SPEC §6.14)
   ============================================================ */

/* Affiché 1 200 ms, non bloquant : un tap n'importe où saute. */
function _seanceTransition(box, o, apres){
  const c = o || {};
  box.innerHTML =
    '<section class="step-screen card" role="status">' +
      '<svg class="ic ic-48" aria-hidden="true" focusable="false"><use href="#i-' + (c.icone || 'check-draw') + '"/></svg>' +
      '<h2>' + esc(c.titre || '') + '</h2>' +
      (c.chiffre ? '<p class="num-l num">' + esc(c.chiffre) +
        (c.detail ? ' <span class="small muted">· ' + esc(c.detail) + '</span>' : '') + '</p>' : '') +
      (c.recall ? '<p class="recall num">' + ic('clock-countdown') + esc(c.recall) + '</p>' : '') +
      (c.sous ? '<p class="small muted">' + esc(c.sous) + '</p>' : '') +
    '</section>';
  annoncer((c.titre || '') + ' ' + (c.chiffre || '') + ' ' + (c.sous || ''));
  _seanceSon('tic');
  let passe = false;
  const suite = () => {
    if (passe) return;
    passe = true;
    document.removeEventListener('pointerdown', suite);
    apres();
  };
  document.addEventListener('pointerdown', suite);
  surQuitter(() => document.removeEventListener('pointerdown', suite));
  after(_seanceReduit() ? 500 : 1200, suite);
}

/* ============================================================
   4. vSeance (DESIGN-SPEC §7.4)
   ============================================================ */

function vSeance(params){
  const p = params || {};
  const j = jToday();
  let mode = p.mode;
  if (!mode){
    const abs = (typeof window.joursDepuisActivite === 'function') ? window.joursDepuisActivite() : 0;
    mode = j.seance ? 'bonus' : (abs >= 3 && masteredCount() > 0) ? 'reprise' : 'normale';
  }
  const plan = _seancePlan(mode);

  if (!plan.etapes.length){
    app().innerHTML = '<div class="view">' + vide({
      icone: 'mountains', titre: 'Rien à faire pour aujourd\'hui.',
      texte: 'Toutes tes compétences sont acquises et tes rappels sont à jour. Reviens demain.',
      action: {label: 'Retour à Aujourd\'hui', fn: () => nav('accueil')}
    }) + '</div>';
    return;
  }
  if (mode === 'reprise') j.abs = true;

  const bilan = {mode: mode, t0: Date.now(), etapes: [], res: [], m0: altitude(),
                 verrous: [], rappels: [], reparees: 0, revoir: 0};
  let idx = 0, faits = 0;

  setCtx('parcours', {title: 'Séance du jour', count: '0 / ' + plan.total, pause: true});
  window.vueCourante.enCours = true;
  window.vueCourante.garde = () => false;      // toute sortie passe par la feuille du routeur

  /* Charpente : la corde, la barre, la zone de contenu. */
  function cadre(){
    app().innerHTML =
      '<div class="view">' +
        '<p class="overline">Séance du jour · ' + nf(plan.min, 'min') + '</p>' +
        '<div id="corde">' + _seanceCorde(plan, idx, faits, plan.total) + '</div>' +
        '<div id="coach-seance"></div>' +
        '<div id="zone"></div>' +
      '</div>';
  }
  function majCorde(){
    const c = document.getElementById('corde');
    if (c) c.innerHTML = _seanceCorde(plan, idx, faits, plan.total);
    setCtx('parcours', {title: 'Séance du jour', count: faits + ' / ' + plan.total, pause: true});
  }
  function pas(){
    faits++;
    majCorde();
  }
  /* Trois moments fixes pour la voix du coach : au départ, à mi-parcours, avant la fin. */
  function coach(texte){
    const c = document.getElementById('coach-seance');
    if (c && texte) c.innerHTML = '<div class="coach-msg"><p>' + esc(texte) + '</p></div>';
  }

  function suivante(){
    idx++;
    if (idx >= plan.etapes.length){ _seanceFin(plan, bilan); return; }
    cadre();
    if (idx === Math.floor(plan.etapes.length / 2)) coach('On garde le rythme. Chaque question compte double quand elle est calme.');
    lancer();
  }

  function lancer(){
    const e = plan.etapes[idx];
    const zone = document.getElementById('zone');
    if (e.cle === 'echauffement') _seanceEchauffement(zone, e, bilan, pas, suivante);
    else if (e.cle === 'rappels') _seanceRappels(zone, e, bilan, mode, pas, suivante);
    else if (e.cle === 'skill') _seanceCompetence(zone, e, bilan, pas, suivante);
    else if (e.cle === 'erreurs') _seanceErreurs(zone, e, bilan, pas, suivante);
    else suivante();
  }

  cadre();
  coach(mode === 'reprise'
    ? 'Reprise en douceur aujourd\'hui. Demain, nouvelle compétence.'
    : mode === 'bonus'
      ? 'Ta marche du jour est déjà faite. Ce qui suit est du rab.'
      : 'Voilà le plan. Je m\'occupe de l\'ordre, tu t\'occupes de répondre.');
  lancer();
}

/* ============================================================
   5. Étape 1 : l'échauffement de calcul mental
   ============================================================ */

function _seanceEchauffement(box, etape, bilan, pas, fini){
  const N = etape.n;
  let i = 0, ok = 0;
  const t0 = performance.now(), res = [];
  (function poser(){
    if (i >= N){
      const secs = Math.round((performance.now() - t0) / 1000);
      bilan.etapes.push({cle: 'echauffement', t: 'Échauffement', ic: 'timer', ok: ok, n: N, res: res});
      bilan.res = bilan.res.concat(res);
      _seanceTransition(box, {
        icone: ok === N ? 'check-draw' : 'timer',
        titre: 'Échauffement terminé',
        chiffre: ok + ' / ' + N,
        detail: (secs / N).toFixed(1).replace('.', ',') + ' s par réponse',
        sous: 'Ensuite : ' + _seanceProchaine()
      }, fini);
      return;
    }
    const fam = cmPick();
    if (!fam){ i = N; poser(); return; }
    let ex = null;
    try { ex = fam.gen(R); } catch(e){ ex = null; }
    if (!ex){ i++; poser(); return; }
    const hote = document.createElement('div');
    box.innerHTML = ''; box.appendChild(hote);
    const cibleS = (typeof window.cible === 'function') ? window.cible(fam.id) : 5;
    askQuestion(hote, {
      ex: ex, famId: fam.id, tag: fam.nom, hint: fam.astuce,
      chrono: true, cibleMs: cibleS * 1000, count: (i + 1) + ' / ' + N,
      serie: res.map(v => ({cls: v ? 'ok' : 'ko'})).concat([{cls: 'cur'}]),
      indices: false, reprise: false, sansType: true, gain: false
    }, r => {
      cmRecord(fam.id, r.ok, r.ms, r.aide > 0);
      logAnswer(r.ok, r.ms);
      res.push(r.ok ? 1 : 0);
      if (r.ok) ok++;
      i++; pas(); poser();
    });
  })();
}

/* Le nom de l'étape suivante, pour l'écran de transition. */
function _seanceProchaine(){
  const el = document.querySelector('.step.cur');
  const n = el && el.nextElementSibling;
  const t = n && n.querySelector('.step-t');
  const m = n && n.querySelector('.step-m');
  if (!t) return 'la carte de fin';
  return t.textContent + (m ? ' · ' + m.textContent : '');
}

/* ============================================================
   6. Étape 2 : les rappels espacés
   ============================================================ */

function _seanceRappels(box, etape, bilan, mode, pas, fini){
  const liste = etape.skills || [];
  let k = 0, totOk = 0, totN = 0;
  (function un(){
    if (k >= liste.length){
      bilan.totRappels = [totOk, totN];
      fini();
      return;
    }
    const sk = liste[k];
    const s = st(sk.id);
    const retard = s.due && (Date.now() - s.due) > 2 * (s.interval || 2) * JOUR;
    const niveau = mode === 'reprise' ? 1 : retard ? 1 : (etape.level || 2);
    /* Bandeau glissant au-dessus de la carte, entre deux compétences. */
    box.innerHTML = '<div class="rev-band">' + ic('arrows-clockwise') +
      '<span>Rappel · ' + esc(sk.titre) + '</span></div><div data-q></div>';
    const hote = box.querySelector('[data-q]');
    runSerie(hote, sk, etape.parSkill || 3, {
      level: niveau, adapt: false, recordSkill: false, reprise: false,
      revision: true, indices: false, sansType: true, chrono: true
    }, ({res}) => {
      const ok = res.reduce((a, b) => a + b, 0);
      totOk += ok; totN += res.length;
      for (let x = 0; x < res.length; x++) pas();
      bilan.res = bilan.res.concat(res);
      reviewResult(sk.id, ok, res.length, {mode: mode === 'reprise' ? 'reprise' : retard ? 'retard' : ''});
      try { const j = jToday(); j.rev = (j.rev || 0) + 1; save(); } catch(e){}
      const apres = st(sk.id);
      const dans = Math.max(1, Math.round(((apres.due || Date.now()) - Date.now()) / JOUR));
      bilan.rappels.push({titre: sk.titre, ok: ok, n: res.length, dans: dans});
      bilan.etapes.push({cle: 'rappel', t: sk.titre, ic: 'arrows-clockwise', ok: ok, n: res.length, dans: dans});
      /* Un provisoire du bilan d'altitude qui ne tient pas est repris proprement (M4). */
      const invalide = !apres.mastered && s.provisoire;
      if (invalide) celebrer(2, {
        texte: 'Le bilan avait été optimiste sur ' + sk.titre + '. On la reprend proprement.',
        tone: 'glacier', icon: 'arrow-counter-clockwise'});
      k++;
      _seanceTransition(box, {
        icone: ok >= res.length ? 'check-draw' : 'arrows-clockwise',
        titre: sk.titre,
        chiffre: ok + ' / ' + res.length,
        recall: ok / res.length >= .7
          ? 'Prochain rappel : dans ' + nf(dans, 'j')
          : 'On la reverra dans ' + nf(dans, 'j') + ', en niveau Découverte.'
      }, un);
    });
  })();
}

/* ============================================================
   7. Étape 3 : la compétence du jour, leçon puis série de 10
   ============================================================ */

function _seanceCompetence(box, etape, bilan, pas, fini){
  const sk = etape.skill;
  const s = st(sk.id);

  function serie(){
    const taux = tauxRecent(sk.id);
    let verrou = false;
    runSerie(box, sk, etape.n, {
      level: taux !== null && taux >= .8 ? 2 : 1,
      mix: true,
      onMastered(){
        verrou = true;
        bilan.verrous.push(sk.titre);
        celebrer(4, {texte: 'Verrouillé à 90 %. ' + sk.titre + ' : c\'est acquis.'});
      }
    }, ({res}) => {
      const ok = res.reduce((a, b) => a + b, 0);
      for (let x = 0; x < res.length; x++) pas();
      bilan.res = bilan.res.concat(res);
      bilan.etapes.push({cle: 'skill', t: sk.titre, ic: 'flag-banner', ok: ok, n: res.length, res: res});
      if (verrou) _seanceEncartVerrou(box, sk, () => _seanceTransition(box, {
        icone: 'flag-banner', titre: sk.titre, chiffre: ok + ' / ' + res.length,
        sous: 'Ensuite : ' + _seanceProchaine()}, fini));
      else _seanceTransition(box, {
        icone: ok >= res.length - 1 ? 'check-draw' : 'flag-banner',
        titre: sk.titre, chiffre: ok + ' / ' + res.length,
        sous: 'Ensuite : ' + _seanceProchaine()}, fini);
    });
  }

  if (!etape.lecon){ serie(); return; }

  /* La leçon d'une nouvelle compétence : l'essentiel d'abord, le reste sur demande. */
  const doc = document.createElement('div');
  doc.innerHTML = String(sk.lecon || '');
  const lede = doc.querySelector('.lede');
  const retenir = doc.querySelector('.box.retenir') || doc.querySelector('.box');
  const essentiel = (lede ? lede.outerHTML : '') + (retenir ? retenir.outerHTML : '');

  box.innerHTML =
    '<article class="lecon-head">' +
      '<p class="overline k-gold">Nouvelle compétence</p>' +
      '<h2>' + esc(sk.titre) + '</h2>' +
      (sk.objectif ? '<p class="body-l ink-2">' + esc(sk.objectif) + '</p>' : '') +
    '</article>' +
    '<div class="lecon">' + (essentiel || String(sk.lecon || '')) + '</div>' +
    (essentiel && sk.lecon
      ? '<div class="row"><button class="btn btn-ghost" type="button" data-plus>' + ic('book-open') +
        '<span>Lire la leçon complète</span></button></div>' +
        '<div class="lecon" data-complet hidden>' + String(sk.lecon) + '</div>'
      : '') +
    '<div class="next-row"><button class="btn-primary lg" type="button" data-go>' +
      '<span>Aux exercices</span><span class="meta num">série de ' + etape.n + '</span>' +
      '<span class="ic-wrap">' + ic('arrow-right') + '</span></button></div>';

  const plus = box.querySelector('[data-plus]');
  if (plus) plus.addEventListener('click', () => {
    _seanceSon('click');
    const c = box.querySelector('[data-complet]');
    if (c){ c.hidden = false; plus.hidden = true; }
  });
  box.querySelector('[data-go]').addEventListener('click', () => {
    _seanceSon('click');
    s.lu = true; save();
    serie();
  });
}

/* Encart de verrouillage (DESIGN-SPEC §6.15, data-kind="lock") : jamais plein écran. */
function _seanceEncartVerrou(box, sk, apres){
  const m = (typeof window.mSkill === 'function') ? Math.round(window.mSkill(sk.id)) : 0;
  box.innerHTML =
    '<section class="fin-card" data-kind="lock">' +
      '<span class="lock-ic">' +
        '<svg class="ic ic-48 ic-open" aria-hidden="true" focusable="false"><use href="#i-lock-simple-open"/></svg>' +
        '<svg class="ic ic-48 ic-shut" aria-hidden="true" focusable="false"><use href="#i-lock-simple"/></svg>' +
      '</span>' +
      ringSVG({val: 9, max: 10, taille: 48, texte: false, libelle: '9 réussies sur 10'}) +
      '<h2>Verrouillé à 90 %.</h2>' +
      '<p class="ink-2">' + esc(sk.titre) + ' : c\'est acquis.</p>' +
      '<p class="gain num">+ ' + nf(m, 'm') + '</p>' +
      '<div class="next-row"><button class="btn-primary" type="button" data-suite disabled>' +
        '<span>Continuer</span><span class="ic-wrap">' + ic('arrow-right') + '</span></button></div>' +
    '</section>';
  const carte = box.querySelector('.fin-card');
  const btn = box.querySelector('[data-suite]');
  after(_seanceReduit() ? 0 : 400, () => { if (carte) carte.setAttribute('data-locked', ''); });
  after(_seanceReduit() ? 0 : 600, () => { if (btn) btn.disabled = false; });
  if (btn) btn.addEventListener('click', () => { _seanceSon('click'); apres(); });
}

/* ============================================================
   8. Étape 4 : les erreurs à réparer
   ============================================================ */

function _seanceErreurs(box, etape, bilan, pas, fini){
  const errs = (etape.erreurs || []).slice();
  let i = 0, ok = 0, reparees = 0, revoir = 0;
  const res = [];
  (function un(){
    if (i >= errs.length){
      bilan.etapes.push({cle: 'erreurs', t: 'Erreurs', ic: 'book-bookmark', ok: ok, n: errs.length, res: res});
      bilan.res = bilan.res.concat(res);
      bilan.reparees = reparees; bilan.revoir = revoir;
      _seanceTransition(box, {
        icone: 'book-bookmark', titre: 'Cahier passé en revue',
        chiffre: ok + ' / ' + errs.length,
        sous: reparees
          ? nf(reparees) + (reparees > 1 ? ' erreurs réparées' : ' erreur réparée') +
            (revoir ? ', ' + nf(revoir) + (revoir > 1 ? ' reviennent' : ' revient') + ' demain.' : '.')
          : 'Elles reviendront jusqu\'à disparaître.'
      }, fini);
      return;
    }
    const e = errs[i];
    const hote = document.createElement('div');
    box.innerHTML = ''; box.appendChild(hote);
    askQuestion(hote, {
      ex: {q: e.q, a: e.a, accept: null, choix: e.choix, expl: e.expl || ''},
      tag: 'Cahier d\'erreurs', chrono: false, count: (i + 1) + ' / ' + errs.length,
      serie: res.map(v => ({cls: v ? 'ok' : 'ko'})).concat([{cls: 'cur'}]),
      indices: false, reprise: false, sansType: true, gain: false
    }, r => {
      logAnswer(r.ok, r.ms);
      res.push(r.ok ? 1 : 0);
      const etat = _seanceReparer(e, r.ok);
      if (r.ok){
        ok++;
        if (etat === 'reparee'){
          reparees++;
          celebrer(2, {texte: 'Erreur réparée. ' + nf(S.compteurs.reparees || 0) + ' au total.',
                       tone: 'ok', icon: 'wrench'});
        } else if (etat === 'tot'){
          celebrer(2, {texte: 'Réussie, mais trop tôt pour être sûre : on la revoit dans 3 jours.',
                       tone: 'glacier', icon: 'clock-countdown'});
          revoir++;
        }
      } else revoir++;
      i++; pas(); un();
    });
  })();
}

/* ============================================================
   9. Célébration de camp (PRODUCT-SPEC M5) : avant la carte de fin
   ============================================================ */

/* Enchaîne les jalons franchis. Les camps prennent l'écran, le reste passe en toast. */
function _seanceJalons(apres){
  let neufs = [];
  try { neufs = (typeof window.verifierJalons === 'function') ? window.verifierJalons() : []; } catch(e){}
  const camps = neufs.filter(x => x.type === 'camp' || (x.type === 'serie' && x.niveau >= 5));
  const petits = neufs.filter(x => camps.indexOf(x) < 0);
  petits.forEach(x => celebrer(x.niveau >= 3 ? 3 : 2, {texte: x.texte, tone: 'gold', icon: 'flag'}));
  let k = 0;
  (function un(){
    if (k >= camps.length){ apres(); return; }
    const jalon = camps[k++];
    _seanceEcranCamp(jalon, un);
  })();
}

function _seanceEcranCamp(jalon, apres){
  const alt = altitude();
  const phase = jalon.phase || 7;
  const hote = document.getElementById('fullscreens') || document.body;
  const dlg = document.createElement('dialog');
  dlg.className = 'fin-card';
  dlg.dataset.kind = 'camp';
  dlg.style.setProperty('--tint', 'var(--tint-' + Math.min(7, Math.max(1, phase)) + ')');
  dlg.setAttribute('aria-labelledby', 'camp-t');

  const morceaux = String(jalon.texte || '').split('. ');
  const titre = morceaux[0].replace(/\.$/, '');
  const sous = morceaux.slice(1).join('. ');
  const jours = Math.max(1, Math.round((Date.now() - (S.debut || Date.now())) / JOUR));
  let justes = 0;
  try { justes = (typeof window.reponsesJustes === 'function') ? window.reponsesJustes() : 0; } catch(e){}

  dlg.innerHTML =
    '<p class="overline k-gold">Camp atteint</p>' +
    '<h2 id="camp-t" class="display-l">' + esc(titre) + '</h2>' +
    (sous ? '<p class="ink-2">' + esc(sous) + '</p>' : '') +
    '<div class="montagne">' + montagneSVG({anime: true, alt: alt}) + '</div>' +
    '<div class="figures">' +
      '<div class="figure"><b class="num">' + nf(masteredCount()) + '</b><span class="overline">compétences</span></div>' +
      '<div class="figure"><b class="num">' + nf(jours) + '</b><span class="overline">jours</span></div>' +
      '<div class="figure"><b class="num">' + nf(justes) + '</b><span class="overline">réponses</span></div>' +
    '</div>' +
    '<div class="next-row"><button class="btn-primary lg" type="button" data-fermer>' +
      '<span>Continuer l\'ascension</span><span class="ic-wrap">' + ic('arrow-right') + '</span></button></div>' +
    '<div class="row"><button class="btn btn-ghost" type="button" data-carte>' + ic('share-network') +
      '<span>Carte du camp</span></button></div>';
  hote.appendChild(dlg);

  const fermer = () => {
    try { dlg.close(); } catch(e){}
    dlg.remove();
    apres();
  };
  dlg.querySelector('[data-fermer]').addEventListener('click', () => { _seanceSon('click'); fermer(); });
  const bc = dlg.querySelector('[data-carte]');
  if (bc) bc.addEventListener('click', () => { _seanceSon('click'); _seancePartagerCarte('camp', {titre: titre, alt: alt, phase: phase}); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); fermer(); });
  try { dlg.showModal(); } catch(e){ dlg.setAttribute('open', ''); }
  dlg.querySelector('[data-fermer]').focus();
  _seanceSon('arpege', 5); _seanceSon('plant');
  try { if (typeof vibrer === 'function') vibrer([30, 60, 30, 60, 60]); } catch(e){}
  if (!_seanceReduit()){ try { confetti(true); } catch(e){} }
  annoncer(titre + '. ' + sous);
}

/* ============================================================
   10. La fin rituelle en trois temps (DESIGN-SPEC §6.15, M7)
   ============================================================ */

/* Profil de la séance : une marche par question, haut = juste. */
function _seanceProfil(res){
  if (!res.length) return '';
  const W = 360, H = 80, pasX = W / res.length;
  let d = '', aire = 'M0,' + H;
  res.forEach((v, i) => {
    const y = v ? 18 : 62;
    const x0 = i * pasX, x1 = (i + 1) * pasX;
    d += (i === 0 ? 'M' + x0 + ',' + y.toFixed(1) : 'L' + x0.toFixed(1) + ',' + y.toFixed(1)) +
         'L' + x1.toFixed(1) + ',' + y.toFixed(1);
    aire += 'L' + x0.toFixed(1) + ',' + y.toFixed(1) + 'L' + x1.toFixed(1) + ',' + y.toFixed(1);
  });
  aire += 'L' + W + ',' + H + 'Z';
  return '<svg class="profile allow-motion" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true" focusable="false">' +
    '<path class="area" d="' + aire + '"/><path class="line" pathLength="1" d="' + d + '"/></svg>';
}

/* Le texte « Demain : … » (rappels dus à J+1 et frontière). */
function _seanceDemain(){
  const demain = Date.now() + JOUR;
  const rev = SKILLS.filter(s => { const x = st(s.id); return x.mastered && x.due && x.due <= demain; }).slice(0, 3);
  const f = frontier();
  const bouts = [];
  if (rev.length) bouts.push(nf(rev.length) + (rev.length > 1 ? ' rappels (' : ' rappel (') + rev.map(s => s.titre).join(', ') + ')');
  if (f) bouts.push((rev.length ? 'la suite de ' : 'ta compétence du jour : ') + f.titre);
  if (!bouts.length) return 'Demain : rien d\'urgent. Une séance bonus si tu veux avancer.';
  return 'Demain : ' + bouts.join(' et ') + '.';
}

/* Les records tombés, dans l'ordre où on les annonce. */
function _seanceRecords(bilan, precision, questions){
  const l = [];
  const rec = S.records || (S.records = {});
  if (questions >= 10 && precision > (rec.precision || 0)){
    rec.precision = precision;
    l.push('précision ' + nf(precision, '%'));
  }
  if (questions > (rec.seanceMax || 0)){
    rec.seanceMax = questions;
    l.push(nf(questions) + ' questions en une séance');
  }
  const justesJour = jToday().ok || 0;
  if (justesJour > (rec.questions || 0)){
    rec.questions = justesJour;
    l.push(nf(justesJour) + ' réponses justes dans la journée');
  }
  if (l.length) save();
  return l;
}

function _seanceFin(plan, bilan){
  const j = jToday();
  j.seance = true;
  save();

  const res = bilan.res;
  const questions = res.length;
  const justes = res.reduce((a, b) => a + b, 0);
  const precision = questions ? Math.round(100 * justes / questions) : 0;
  const minutes = Math.max(1, Math.round((Date.now() - bilan.t0) / 60000));
  const gain = Math.max(0, altitude() - bilan.m0);
  const records = _seanceRecords(bilan, precision, questions);

  try { emettre('seance-fin', bilan); } catch(e){}
  let succes = [];
  try { succes = verifierSucces({type: 'seance-fin', ok: justes, n: questions}); } catch(e){}

  /* Un camp franchi passe avant la carte de fin. */
  _seanceJalons(() => _seanceCarteFin(plan, bilan, {
    questions, justes, precision, minutes, gain, records, succes
  }));
}

function _seanceCarteFin(plan, bilan, k){
  setCtx('plein');
  window.vueCourante.enCours = false;
  window.vueCourante.garde = null;

  const date = new Date().toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'short'});
  const titre = k.precision >= 90 ? 'Belle marche.' : k.precision >= 70 ? 'Du terrain gagné.' : 'Tu es venu, c\'est l\'essentiel.';
  let humeur = '';
  if (k.precision >= 90) humeur = '<span class="emoji" aria-hidden="true">🎉</span> ' + nf(k.precision, '%') + ' de précision.';
  else if (k.precision >= 70) humeur = '<span class="emoji" aria-hidden="true">💪</span> ' + nf(k.precision, '%') + ' de précision.';
  else humeur = nf(k.precision, '%') + ' de précision. On consolide demain.';

  const lignes = bilan.etapes.map(e => {
    return '<li>' + ic(e.ic) + '<span>' + esc(e.t) + '</span>' +
      '<b class="num">' + e.ok + ' / ' + e.n + '</b>' +
      (e.dans ? '<span class="recall num">dans ' + nf(e.dans, 'j') + '</span>' : '<span></span>') + '</li>';
  }).join('');

  const prog = progresJour();
  const reste = Math.max(0, prog.obj - prog.ok);
  const carteDispo = typeof HTMLCanvasElement === 'function';

  app().innerHTML =
  '<section class="fin-card" data-kind="seance">' +
    '<p class="overline">Séance terminée · ' + esc(date) + '</p>' +
    '<h2 class="display-l">' + esc(titre) + '</h2>' +
    '<p class="small muted">' + humeur + '</p>' +
    _seanceProfil(bilan.res) +
    '<div class="figures display">' +
      '<div class="figure" style="--i:0"><b class="num">+ <span data-cpt="' + k.gain + '">0</span> m</b><span class="overline">altitude</span></div>' +
      '<div class="figure" style="--i:1"><b class="num"><span data-cpt="' + k.precision + '">0</span> %</b><span class="overline">précision</span></div>' +
      '<div class="figure" style="--i:2"><b class="num"><span data-cpt="' + k.minutes + '">0</span> min</b><span class="overline">temps</span></div>' +
    '</div>' +
    (lignes ? '<ul class="fin-lines">' + lignes + '</ul>' : '') +
    (k.records.length ? '<p class="record">' + ic('crown-simple') + 'Record personnel · ' + esc(k.records[0]) + '</p>' : '') +
    (k.succes && k.succes.length
      ? '<p class="record">' + ic('medal') + 'Succès débloqué · ' + esc(k.succes[0].nom) + '</p>' : '') +
    '<p class="msg">' + esc(_seanceDemain()) + '</p>' +
    (!prog.fait && reste ? '<p class="small muted">Encore ' + nf(reste) +
      (reste > 1 ? ' réponses' : ' réponse') + ' pour l\'objectif.</p>' : '') +
    '<div class="next-row"><button class="btn-primary lg" type="button" data-fin>' +
      '<span>' + (prog.fait ? 'Terminer la journée' : 'Séance bonus') + '</span>' +
      '<span class="ic-wrap">' + ic(prog.fait ? 'check' : 'play') + '</span></button></div>' +
    '<div class="row" data-secondaires hidden>' +
      (prog.fait ? '<button class="btn" type="button" data-bonus>' + ic('play') +
        '<span>Séance bonus</span><span class="meta num">15 min</span></button>' : '') +
      (plan.resteRappels ? '<button class="btn btn-ghost" type="button" data-rappels>' + ic('arrows-clockwise') +
        '<span>' + (plan.resteRappels <= 4
          ? 'Encore ' + nf(plan.resteRappels) + (plan.resteRappels > 1 ? ' rappels en attente' : ' rappel en attente')
          : 'Encore des rappels en attente') + '</span><span class="meta num">3 min</span></button>' : '') +
      (carteDispo ? '<button class="btn btn-ghost" type="button" data-carte>' + ic('share-network') +
        '<span>Carte de séance</span></button>' : '') +
    '</div>' +
  '</section>';

  const racine = app();
  /* Les trois chiffres comptent en 600 ms, à 120 ms d'écart. */
  racine.querySelectorAll('[data-cpt]').forEach((el, i) =>
    after(120 * i, () => compteur(el, 0, Number(el.dataset.cpt), 600)));
  /* Le bouton or reste seul 1 200 ms (M7, critère 3). */
  after(1200, () => { const r = racine.querySelector('[data-secondaires]'); if (r) r.hidden = false; });
  if (k.records.length){ _seanceSon('arpege', 4); }
  else _seanceSon('win', k.questions ? k.justes / k.questions : 0);

  const clic = (sel, fn) => racine.querySelectorAll(sel).forEach(b =>
    b.addEventListener('click', () => { _seanceSon('click'); fn(); }));
  clic('[data-fin]', () => { if (progresJour().fait) nav('accueil'); else nav('seance', {mode: 'bonus'}); });
  clic('[data-bonus]', () => nav('seance', {mode: 'bonus'}));
  clic('[data-rappels]', () => nav('accueil'));
  clic('[data-carte]', () => _seancePartagerCarte('seance', {
    alt: altitude(), gain: k.gain, precision: k.precision, questions: k.questions}));
  annoncer(titre + ' ' + k.precision + ' pour cent de précision. ' + _seanceDemain());
}

/* ============================================================
   11. Carte partageable au canvas (PRODUCT-SPEC S6, §6.36)
   ============================================================ */

/* Palette Nuit en valeurs littérales : la carte ne suit jamais le thème du lecteur. */
const _seancePal = {fond: '#0C1122', massif: '#121A2E', or: '#F2C45A', encre: '#EEF1F7', meta: '#8A95AB'};

function _seanceGenererCarte(type, data){
  const d = data || {};
  const W = 1080, H = 1350, K = 3;               // géométrie de montagneSVG × 3
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const P = _seancePal;
  const alt = typeof d.alt === 'number' ? d.alt : altitude();
  const sommet = (typeof SOMMET === 'number' && SOMMET) ? SOMMET : 4810;

  const police = (poids, taille, famille) => poids + ' ' + taille + 'px ' + famille;
  const DISP = '"Fraunces", Georgia, serif';
  const TEXT = '"Instrument Sans", system-ui, sans-serif';

  const peindre = () => {
    /* fond */
    ctx.fillStyle = P.fond; ctx.fillRect(0, 0, W, H);
    const rad = ctx.createRadialGradient(W / 2, 120, 40, W / 2, 120, W * .9);
    rad.addColorStop(0, 'rgba(242,196,90,.16)');
    rad.addColorStop(1, 'rgba(12,17,34,0)');
    ctx.fillStyle = rad; ctx.fillRect(0, 0, W, 700);

    /* massif : les trois plans, à l'échelle 3 */
    ctx.save(); ctx.scale(K, K);
    ['back', 'mid', 'front'].forEach((nom, i) => {
      const p = new Path2D(window.MASSIF_D ? window.MASSIF_D[nom] : '');
      ctx.fillStyle = i === 0 ? '#0F1830' : i === 1 ? '#121A2E' : '#161F36';
      ctx.fill(p);
    });
    /* sentier complet puis sentier parcouru */
    const sentier = new Path2D(window.SENTIER_D);
    ctx.strokeStyle = 'rgba(138,149,171,.5)';
    ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]);
    ctx.stroke(sentier);
    ctx.restore();

    const frac = Math.max(0, Math.min(1, alt / sommet));
    /* le trait parcouru, échantillonné le long du sentier */
    ctx.save();
    ctx.strokeStyle = P.or; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 120; i++){
      const q = window.sentierPoint(frac * i / 120);
      if (i === 0) ctx.moveTo(q.x * K, q.y * K); else ctx.lineTo(q.x * K, q.y * K);
    }
    ctx.stroke();
    ctx.restore();

    /* drapeaux des camps franchis */
    const camps = (typeof CAMPS !== 'undefined' && CAMPS) ? CAMPS : [];
    for (let p = 1; p <= 7; p++){
      let pose = false;
      try { pose = !!(S.jalons && S.jalons['camp-' + p]); } catch(e){}
      if (!pose) continue;
      const q = window.sentierPoint(camps[p] / sommet);
      const x = q.x * K, y = q.y * K;
      ctx.strokeStyle = P.encre; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 34); ctx.stroke();
      ctx.fillStyle = P.or;
      ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x + 26, y - 26); ctx.lineTo(x, y - 18); ctx.closePath(); ctx.fill();
    }
    /* le point du grimpeur */
    const g = window.sentierPoint(frac);
    ctx.fillStyle = P.or;
    ctx.beginPath(); ctx.arc(g.x * K, g.y * K, 18, 0, Math.PI * 2); ctx.fill();

    /* altitude */
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = P.or; ctx.font = police(500, 160, DISP);
    const txtAlt = fv(alt);
    ctx.fillText(txtAlt, W / 2, 700);
    ctx.fillStyle = P.meta; ctx.font = police(500, 40, TEXT);
    ctx.fillText('m sur ' + fv(sommet) + ' m', W / 2, 760);

    /* trois colonnes */
    const cols = type === 'camp'
      ? [['camp', d.titre || campDe(alt).nom], ['compétences', String(masteredCount())], ['jours', String(streak())]]
      : type === 'semaine'
        ? [['jours actifs', String(d.jours || 0)], ['réponses', fv(d.ok || 0)], ['mètres', fv(d.m || 0)]]
        : [['altitude', '+' + fv(d.gain || 0)], ['précision', (d.precision || 0) + ' %'], ['questions', String(d.questions || 0)]];
    cols.forEach((c, i) => {
      const x = W * (i + .5) / 3;
      ctx.fillStyle = P.meta; ctx.font = police(500, 36, TEXT);
      ctx.fillText(c[0], x, 890);
      ctx.fillStyle = P.encre; ctx.font = police(500, 88, DISP);
      ctx.fillText(String(c[1]), x, 970);
    });

    /* série et pastilles de la semaine */
    const sk = streak();
    ctx.fillStyle = P.encre; ctx.font = police(500, 44, TEXT);
    ctx.fillText(fv(sk) + (sk > 1 ? ' jours de cordée' : ' jour de cordée'), W / 2, 1090);
    const sem = _seanceSemaineCarte();
    sem.forEach((fait, i) => {
      const x = W / 2 - 7 * 28 + i * 56 + 28;
      ctx.beginPath(); ctx.arc(x, 1140, 16, 0, Math.PI * 2);
      ctx.fillStyle = fait ? P.or : 'rgba(138,149,171,.3)';
      ctx.fill();
    });

    /* pied de carte */
    ctx.fillStyle = P.meta; ctx.font = police(500, 34, TEXT);
    ctx.fillText('Maths · De zéro au sommet', W / 2, 1250);
    let prenom = '';
    try { prenom = (S.profil && S.profil.prenom || '').trim(); } catch(e){}
    ctx.fillText((prenom || 'Ascension en cours') + ' · ' + new Date().toLocaleDateString('fr-FR'), W / 2, 1300);
  };

  const pret = (document.fonts && document.fonts.load)
    ? Promise.all([document.fonts.load('500 160px Fraunces'), document.fonts.load('500 40px "Instrument Sans"')]).catch(() => {})
    : Promise.resolve();

  return pret.then(() => {
    peindre();
    return new Promise(res => {
      if (cv.toBlob) cv.toBlob(b => res(b), 'image/png');
      else res(null);
    });
  });
}
window.genererCarte = _seanceGenererCarte;

function _seanceSemaineCarte(){
  const auj = new Date(); auj.setHours(12, 0, 0, 0);
  const decal = (auj.getDay() + 6) % 7;
  const l = [];
  for (let i = 0; i < 7; i++){
    const d = new Date(auj); d.setDate(auj.getDate() - decal + i);
    let f = false;
    try { f = dayDone(todayKey(d)); } catch(e){}
    l.push(f);
  }
  return l;
}

/* Partage natif si l'appareil sait le faire, sinon une feuille d'aperçu. */
function _seancePartagerCarte(type, data){
  const texte = 'Maths · De zéro au sommet · ' + nf(altitude(), 'm') +
                ' · série ' + nf(streak(), 'j') +
                (data && data.gain ? ' · +' + nf(data.gain, 'm') + ' aujourd\'hui' : '');
  _seanceGenererCarte(type, data).then(blob => {
    if (!blob){ toast('La carte n\'a pas pu être dessinée.', {tone: 'ko', icon: 'warning'}); return; }
    try {
      if (typeof File === 'function' && navigator.canShare && navigator.share){
        const fichier = new File([blob], 'ascension.png', {type: 'image/png'});
        if (navigator.canShare({files: [fichier]})){
          navigator.share({files: [fichier], text: texte}).catch(() => {});
          return;
        }
      }
    } catch(e){}
    _seanceFeuilleCarte(blob, texte);
  }).catch(() => toast('La carte n\'a pas pu être dessinée.', {tone: 'ko', icon: 'warning'}));
}
window.partagerCarte = _seancePartagerCarte;

function _seanceFeuilleCarte(blob, texte){
  const url = URL.createObjectURL(blob);
  ouvrirFeuille({
    classe: 'sheet-carte', titre: 'Ta carte',
    contenu: '<div class="carte-preview"><img alt="Carte de ton ascension" src="' + url + '"></div>' +
             '<p class="small muted">Sur iPhone, appuie longuement sur l\'image pour l\'enregistrer.</p>',
    boutons: [{label: 'Copier le texte'}, {label: 'Enregistrer', style: 'primaire'}]
  }).then(i => {
    if (i === 0){
      try { navigator.clipboard.writeText(texte).then(() => toast('Texte copié.', {tone: 'ok', icon: 'copy'})); } catch(e){}
    } else if (i === 1){
      const a = document.createElement('a');
      a.href = url; a.download = 'ascension.png';
      document.body.appendChild(a); a.click(); a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });
}
