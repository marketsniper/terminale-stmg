/* ===== Maths · De zéro au sommet : 5 minutes et DS en vue =====
   DESIGN-SPEC §7.11 (5 minutes) et §7.12 (DS) · PRODUCT-SPEC M3, M5, M9, M11.
   Ce fichier déclare : vMicro, vDS, lancerDS. Tout le reste est préfixé _md.
   Script classique : portée globale partagée (ordre de chargement dans index.html). */
'use strict';

/* ---------- constantes ---------- */
const _mdMicroMs = 5 * 60000;      // 5 minutes
const _mdMicroMax = 10;            // 10 questions au maximum
const _mdDSDurees = [10, 20, 30];  // longueurs proposées pour le DS
const _mdDSSeuil = 0.6;            // sous 60 % sur une compétence, on propose le rappel

/* ---------- utilitaires propres à ce fichier ---------- */
function _mdHorloge(ms){
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function _mdJour(ts){
  try { return new Date(ts).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}); }
  catch(e){ return ''; }
}
/* Niveau de départ d'une compétence, d'après ses dix dernières réponses. */
function _mdNiveau(id){
  const t = tauxRecent(id);
  if (t === null) return 1;
  if (t < .5) return 1;
  if (t < .8) return 2;
  return 3;
}
/* Entrée du cahier d'erreurs, au format v2. */
/* Réponse attendue mise au format français : jamais sur une fraction ou un littéral. */
function _mdVal(v){
  const s = String(v == null ? '' : v);
  return /^\s*-?[\d.,\s\u202f\u2212]+\s*$/.test(s) ? fv(s) : s;
}
function _mdCahier(skill, ex, donnee, type){
  try {
    const ts = Date.now();
    S.erreurs.unshift({sid: skill.id, q: ex.q, a: ex.a, given: donnee || '', expl: ex.expl || '',
                       choix: ex.choix || null, ts: ts, redo: 0, reprise: 0,
                       type: type || '', due: ts + JOUR, okAt: 0});
    if (S.erreurs.length > 120) S.erreurs.pop();
  } catch(e){}
}

/* ============================================================
   1. « 5 minutes » (DESIGN-SPEC §7.11)
   Aucun écran d'accueil : la première carte se pose tout de suite.
   Le titre dit enfin la vérité : c'est bien un parcours de 5 minutes,
   qui mêle les rappels dus, la compétence de frontière et deux calculs.
   ============================================================ */
function _mdPlanMicro(){
  const plan = [];
  const due = (typeof dueReviews === 'function' ? dueReviews() : []).slice(0, 3);
  const f = (typeof frontier === 'function') ? frontier() : null;

  const fams = [];
  if (window.CM_FAMS && CM_FAMS.length){
    const a = cmPick();
    if (a) fams.push(a);
    let b = cmPick(), garde = 0;
    while (b && a && b.id === a.id && garde++ < 8) b = cmPick();
    if (b && (!a || b.id !== a.id)) fams.push(b);
  }

  if (fams[0]) plan.push({type: 'cm', fam: fams[0]});
  due.forEach(s => plan.push({type: 'rev', skill: s}));
  if (fams[1]) plan.push({type: 'cm', fam: fams[1]});
  if (f) while (plan.length < _mdMicroMax) plan.push({type: 'skill', skill: f});
  return {plan: plan.slice(0, _mdMicroMax), due: due, frontiere: f};
}

function vMicro(){
  const {plan, due, frontiere} = _mdPlanMicro();

  if (!plan.length){
    setCtx('outil');
    app().innerHTML = '<section class="view"><h1>5 minutes</h1>' +
      vide({icone: 'moon', titre: 'Rien à revoir aujourd\'hui.',
            texte: 'La montagne est calme. Lance une séance complète quand tu veux.',
            action: {label: 'Ouvrir le sentier', fn: () => nav('programme')}}) + '</section>';
    return;
  }

  const t0 = Date.now();
  const revScore = {};                 // id : {ok, n, titre, retard}
  const cmScore = {ok: 0, n: 0};
  let i = 0, ok = 0, fini = false, niveau = frontiere ? _mdNiveau(frontiere.id) : 1, suite = 0;

  window.vueCourante.enCours = true;
  window.vueCourante.garde = () => fini;

  /* les rappels du jour alimentent le deuxième anneau */
  try { const j = jToday(); if (j.revTot == null && due.length) j.revTot = due.length; } catch(e){}

  setCtx('parcours', {title: '5 minutes', count: _mdHorloge(_mdMicroMs)});
  app().dataset.density = 'outil';
  app().innerHTML = '<section class="view"><div id="md-zone"></div></section>';

  every(250, () => {
    if (fini) return;
    const reste = _mdMicroMs - (Date.now() - t0);
    const c = $('head-count');
    if (c) c.textContent = _mdHorloge(reste);
    if (reste <= 0) terminer(true);
  });

  function poser(){
    if (fini) return;
    if (i >= plan.length){ terminer(false); return; }
    const item = plan[i];
    const zone = $('md-zone');
    if (!zone) return;
    zone.innerHTML = '';
    const hote = document.createElement('div');
    zone.appendChild(hote);

    if (item.type === 'cm'){
      const fam = item.fam, ex = fam.gen(R);
      const cible = (typeof window.cible === 'function') ? window.cible(fam.id) * 1000 : 5000;
      askQuestion(hote, {
        ex: ex, famId: fam.id, tag: fam.nom || fam.titre || fam.id,
        overline: 'Calcul mental', count: (i + 1) + ' / ' + plan.length,
        chrono: true, cibleMs: cible, indices: false, reprise: false, sansType: true, serie: false, prof: false
      }, r => {
        if (fini) return;
        cmRecord(fam.id, r.ok, r.ms, r.aide >= 1);
        logAnswer(r.ok, r.ms);
        cmScore.n++; if (r.ok){ cmScore.ok++; ok++; }
        i++; poser();
      });
      return;
    }

    const skill = item.skill;
    const rappel = item.type === 'rev';
    const niv = rappel ? 2 : niveau;
    askQuestion(hote, {
      ex: genFor(skill, niv), skill: skill, skillId: skill.id,
      tag: skill.titre, overline: rappel ? 'Rappel' : 'Ta prochaine marche',
      lvl: niv, count: (i + 1) + ' / ' + plan.length,
      chrono: true, indices: !rappel, reprise: false, sansType: true, revision: rappel, serie: false, prof: false
    }, r => {
      if (fini) return;
      logAnswer(r.ok, r.ms);
      if (r.ok) ok++;
      if (rappel){
        const c = revScore[skill.id] || (revScore[skill.id] = {ok: 0, n: 0, titre: skill.titre, retard: 0});
        c.n++; if (r.ok) c.ok++;
        const x = st(skill.id);
        c.retard = x.due ? Math.max(0, Math.round((Date.now() - x.due) / JOUR)) : 0;
      } else {
        record(skill.id, r.ok);
        if (r.ok){ suite++; if (suite >= 3 && niveau < 3){ niveau++; suite = 0; } }
        else { suite = 0; if (niveau > 1) niveau--; }
      }
      if (!r.ok) _mdCahier(skill, r.ex, r.given, r.type);
      i++; poser();
    });
  }

  function terminer(tempsEcoule){
    if (fini) return;
    fini = true;
    window.vueCourante.enCours = false;
    window.vueCourante.garde = null;

    /* rappels : espacement mis à jour, la série du jour est préservée */
    const j = jToday();
    Object.keys(revScore).forEach(id => {
      const c = revScore[id];
      reviewResult(id, c.ok, c.n, {mode: c.retard >= 7 ? 'retard' : ''});
      j.rev = (j.rev || 0) + 1;
    });
    j.seance = true;
    save();

    const poses = Math.max(1, i);
    const p = ok / poses;
    const serie = streak();
    const emoji = p >= .9 ? '<span class="emoji" aria-hidden="true">🎉</span> '
                : p >= .7 ? '<span class="emoji" aria-hidden="true">💪</span> ' : '';
    const lignes = [];
    if (Object.keys(revScore).length) lignes.push(Object.keys(revScore).length + ' rappel' + (Object.keys(revScore).length > 1 ? 's' : '') + ' remis à jour.');
    if (cmScore.n) lignes.push('Calcul mental : ' + cmScore.ok + ' sur ' + cmScore.n + '.');
    lignes.push(serie > 1 ? 'Série préservée : ' + serie + ' jours de cordée.' : 'Premier jour de cordée.');

    setCtx('plein');
    app().dataset.density = 'lecture';
    app().innerHTML =
      '<section class="fin-card" data-kind="serie">' +
        '<p class="overline">5 minutes' + (tempsEcoule ? ' · temps écoulé' : '') + ' · ' + esc(_mdJour(Date.now())) + '</p>' +
        '<h2 class="display-l">' + ok + ' / ' + poses + '</h2>' +
        '<p class="small muted">' + emoji + Math.round(p * 100) + ' % de précision.</p>' +
        (serie >= 7 ? '<p class="record">' + ic('flame', 'ic-20') +
           '<span class="emoji" aria-hidden="true">🔥</span> ' + serie + ' jours de cordée</p>' : '') +
        '<p class="msg">' + esc(lignes.join(' ')) + '</p>' +
        '<div class="next-row"><button class="btn-primary lg" type="button" id="md-home">' +
          '<span>Revenir à Aujourd\'hui</span><span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
        '<div class="row"><button class="btn btn-ghost" type="button" id="md-plus">' +
          ic('mountains', 'ic-20') + 'Enchaîner une séance</button></div>' +
      '</section>';

    $('md-home').addEventListener('click', () => { snd.click(); nav('accueil'); });
    $('md-plus').addEventListener('click', () => { snd.click(); nav('seance'); });
    $('md-home').focus();

    celebrer(2, {texte: '5 minutes tenues. ' + ok + ' sur ' + poses + '.', icon: 'timer'});
    try { (window.verifierJalons ? verifierJalons() : []).forEach(x => celebrer(x.niveau, {texte: x.texte})); } catch(e){}
    try { verifierSucces({type: 'serie-fin', ok: ok, n: poses}).forEach(s => celebrer(3, {texte: 'Succès : ' + s.nom + '.', icon: s.ic})); } catch(e){}
    try { majCrete(); majAnneauJour(); } catch(e){}
    annoncer('Cinq minutes terminées. ' + ok + ' sur ' + poses + '.');
  }

  poser();
}

/* ============================================================
   2. « DS en vue » (DESIGN-SPEC §7.12)
   ============================================================ */

/* Prérequis d'un chapitre : ce qui le porte vraiment, pas ses deux voisins de liste.
   On garde les compétences déjà travaillées qui alimentent le chapitre, en
   privilégiant celles qui sont fragiles, en retard de rappel ou en dessous de 70 %. */
function _mdPrereq(cible){
  const maintenant = Date.now();
  const rang = s => s.phase * 1000 + (s.ordre || 0);
  const rc = rang(cible);
  const candidats = SKILLS.filter(s => s.id !== cible.id && rang(s) < rc && phaseUnlocked(s.phase) && st(s.id).n > 0);

  const note = s => {
    const x = st(s.id);
    let n = 0;
    if (x.fragile) n += 5;
    if (x.due && x.due <= maintenant) n += 3;
    const t = tauxRecent(s.id);
    if (t !== null && t < .7) n += 4;
    if (x.mastered) n += 1;
    if (s.phase === cible.phase) n += 3;                    // même chapitre de programme
    else if (s.phase === cible.phase - 1) n += 1;
    const ecart = (rc - rang(s)) / 1000;                    // distance en « chapitres »
    n += Math.max(0, 3 - ecart);                            // la proximité départage
    return n;
  };
  const trie = candidats.slice().sort((a, b) => note(b) - note(a) || rang(b) - rang(a));
  const choisis = trie.slice(0, 2);

  /* pas assez de matière travaillée : on complète par les compétences acquises juste avant */
  if (choisis.length < 2){
    SKILLS.filter(s => s.id !== cible.id && rang(s) < rc && phaseUnlocked(s.phase))
      .sort((a, b) => rang(b) - rang(a))
      .forEach(s => { if (choisis.length < 2 && !choisis.some(x => x.id === s.id)) choisis.push(s); });
  }
  return choisis;
}

function vDS(){
  setCtx('outil');
  app().dataset.density = 'outil';

  const ouverts = SKILLS.filter(s => phaseUnlocked(s.phase));
  if (!ouverts.length){
    app().innerHTML = '<section class="view"><h1>DS en vue</h1>' +
      vide({icone: 'lock-simple', titre: 'Aucun chapitre ouvert pour l\'instant.',
            texte: 'Commence le sentier : les chapitres s\'ouvrent au fur et à mesure.',
            action: {label: 'Ouvrir le sentier', fn: () => nav('programme')}}) + '</section>';
    return;
  }

  /* chapitres regroupés par phase : une section repliable par niveau de programme */
  const phases = [];
  ouverts.forEach(s => { if (phases.indexOf(s.phase) < 0) phases.push(s.phase); });
  const frontiere = (typeof frontier === 'function') ? frontier() : null;

  const groupes = phases.map(p => {
    const liste = ouverts.filter(s => s.phase === p);
    const ouvert = frontiere ? (frontiere.phase === p) : (p === phases[phases.length - 1]);
    return '<details class="phase" data-phase="' + p + '"' + (ouvert ? ' open' : '') + '>' +
      '<summary class="phase-head"><h2>' + esc((PHASES[p] || {}).nom || ('Phase ' + p)) + '</h2>' +
      '<span class="etat small muted">' + liste.length + ' chapitres</span>' +
      ic('caret-right', 'ic-20 caret') + '</summary>' +
      '<div class="skills" role="group" aria-label="Chapitres de ' + esc((PHASES[p] || {}).nom || ('phase ' + p)) + '">' +
      liste.map(s => {
        const m = niveauMaitrise(s.id);
        return '<button class="skill" type="button" data-ds="' + esc(s.id) + '" aria-pressed="false">' +
          '<span class="node" aria-hidden="true"></span>' +
          '<span class="num">' + s.phase + '.' + (s.ordre || 0) + '</span>' +
          '<span class="t">' + esc(s.titre) + '</span>' +
          '<span class="etat"><span class="chip" data-tone="' + (m.cle === 'verrouille' || m.cle === 'consolide' ? 'ok' : m.fragile ? 'warn' : m.cle === 'encours' ? 'gold' : 'muted') +
          '">' + esc(m.libelle) + '</span></span></button>';
      }).join('') + '</div></details>';
  }).join('');

  const seg = _mdDSDurees.map((n, k) =>
    '<label><input type="radio" name="md-n" value="' + n + '"' + (k === 1 ? ' checked' : '') + '>' +
    '<span>' + n + '<b class="num">' + Math.round(n * .8) + ' min</b></span></label>').join('');

  app().innerHTML =
    '<section class="view">' +
      '<p class="overline">Épreuves · préparation ciblée</p>' +
      '<h1>DS en vue</h1>' +
      '<blockquote class="coach-msg"><p>Choisis le chapitre du contrôle. Je fabrique le sujet avec ce chapitre et les deux compétences qui le portent.</p></blockquote>' +
      '<section class="field"><span class="label">Chapitre</span>' + groupes + '</section>' +
      '<section class="card card-muted" id="md-choix" hidden>' +
        '<p class="overline">Sujet préparé</p>' +
        '<p class="small ink-2" id="md-resume"></p>' +
      '</section>' +
      '<section class="field"><span class="label">Longueur</span>' +
        '<div class="segment" role="radiogroup" aria-label="Longueur du DS">' + seg + '</div></section>' +
      '<div class="row"><button class="btn-primary lg" type="button" id="md-go" disabled>' +
        '<span>Lancer le DS</span><span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
    '</section>';

  let choisi = null;
  const boutons = Array.prototype.slice.call(document.querySelectorAll('[data-ds]'));
  boutons.forEach(b => b.addEventListener('click', () => {
    snd.click();
    choisi = b.dataset.ds;
    boutons.forEach(x => { const on = x === b; x.classList.toggle('frontier', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    const cible = SKILLS.find(s => s.id === choisi);
    const pre = _mdPrereq(cible);
    const encart = $('md-choix'), resume = $('md-resume');
    if (encart && resume){
      encart.hidden = false;
      resume.textContent = cible.titre + (pre.length
        ? ', avec ' + pre.map(s => s.titre).join(' et ') + '.'
        : ', seul : rien d\'autre n\'est encore travaillé en amont.');
    }
    const go = $('md-go');
    if (go) go.disabled = false;
  }));

  $('md-go').addEventListener('click', () => {
    if (!choisi) return;
    snd.click();
    const c = document.querySelector('input[name="md-n"]:checked');
    lancerDS(choisi, {n: c ? Number(c.value) : 20});
  });
}

/* ---------- le DS : correction différée, puis bilan ---------- */
function lancerDS(id, opts){
  const o = opts || {};
  const cible = SKILLS.find(s => s.id === id);
  if (!cible){ nav('ds'); return; }
  const N = _mdDSDurees.indexOf(o.n) >= 0 ? o.n : 20;
  const pre = _mdPrereq(cible);

  /* composition : environ 60 % le chapitre, le reste ses prérequis */
  const lot = [];
  const nCible = pre.length ? Math.round(N * .6) : N;
  for (let k = 0; k < nCible; k++) lot.push(cible);
  for (let k = lot.length; k < N; k++) lot.push(pre[(k - nCible) % pre.length]);
  const suite = R.shuffle(lot);

  const rep = new Array(N).fill(null);
  const exos = suite.map(s => genFor(s, 2));
  const temps = new Array(N).fill(0);
  let i = 0, fini = false;

  window.vueCourante.enCours = true;
  window.vueCourante.garde = () => fini;

  app().dataset.density = 'outil';
  app().innerHTML = '<section class="view"><div id="md-zone"></div></section>';

  function poser(){
    if (fini) return;
    if (i >= N){ corriger(); return; }
    if (window.vueCourante.v !== 'ds') return;          // la correction reste dans sa vue
    setCtx('parcours', {title: 'DS · ' + cible.titre, count: (i + 1) + ' / ' + N});
    const zone = $('md-zone');
    if (!zone) return;
    zone.innerHTML = '';
    const hote = document.createElement('div');
    zone.appendChild(hote);
    const sk = suite[i], t0 = performance.now();
    askQuestion(hote, {
      ex: exos[i], skill: sk, skillId: sk.id,
      tag: sk.titre, overline: sk.id === cible.id ? 'Le chapitre' : 'Prérequis',
      count: (i + 1) + ' / ' + N,
      differe: true, chrono: false, indices: false, reprise: false, sansType: true, serie: false, prof: false
    }, r => {
      if (fini) return;
      rep[i] = r.given || '';
      temps[i] = Math.round(performance.now() - t0);
      i++;
      poser();
    });
  }

  function corriger(){
    if (fini) return;
    fini = true;
    window.vueCourante.enCours = false;
    window.vueCourante.garde = null;

    const parSkill = {};
    let ok = 0, msTotal = 0;
    const details = [];
    for (let k = 0; k < N; k++){
      const sk = suite[k], ex = exos[k], donnee = rep[k] || '';
      const juste = donnee !== '' && isRight(donnee, ex);
      if (juste) ok++;
      msTotal += temps[k] || 0;
      const c = parSkill[sk.id] || (parSkill[sk.id] = {ok: 0, n: 0, titre: sk.titre});
      c.n++; if (juste) c.ok++;
      logAnswer(juste, temps[k] || 0);
      record(sk.id, juste);                       // l'altitude se gagne, la maîtrise ne se perd jamais ici
      if (!juste){
        _mdCahier(sk, ex, donnee, '');
        details.push({k: k, sk: sk, ex: ex, donnee: donnee});
      }
    }
    jToday().seance = true;
    save();

    const p = ok / N;
    const minutes = Math.max(1, Math.round(msTotal / 60000));
    /* compétences qui ont flanché : rien n'est retiré sans le dire, un bouton le propose */
    const flanchent = Object.keys(parSkill).filter(sid => {
      const c = parSkill[sid];
      return c.n >= 2 && c.ok / c.n < _mdDSSeuil && st(sid).mastered && !st(sid).fragile;
    });

    const verdict = p >= .85 ? 'Tu es prêt pour ce contrôle.'
                  : p >= .7 ? 'C\'est solide. Refais une série sur les points qui ont glissé.'
                  : 'Reprends la leçon avant le contrôle : il reste de la marge.';
    const emoji = p >= .9 ? '<span class="emoji" aria-hidden="true">🎉</span> '
                : p >= .7 ? '<span class="emoji" aria-hidden="true">💪</span> ' : '';

    /* correction regroupée par compétence */
    let corr = '';
    Object.keys(parSkill).forEach(sid => {
      const dedans = details.filter(d => d.sk.id === sid);
      if (!dedans.length) return;
      const c = parSkill[sid];
      corr += '<section class="err-group"><p class="overline">' + esc(c.titre) + ' · ' + c.ok + ' / ' + c.n + '</p>' +
        dedans.map(d =>
          '<article class="err ko" data-k="' + d.k + '">' +
            '<p class="q">' + esc(d.ex.q) + '</p>' +
            '<p class="rep">' + (d.donnee ? '<s class="num">' + esc(d.donnee) + '</s>' : '<span class="small muted">sans réponse</span>') +
              '<b class="num">' + esc(_mdVal(d.ex.a)) + '</b></p>' +
            (d.ex.expl ? '<p class="meta small muted">' + esc(d.ex.expl) + '</p>' : '') +
            '<div class="row"><button class="btn sm" type="button" data-revoir="' + esc(sid) + '">' +
              ic('book-open', 'ic-20') + 'Revoir la leçon</button></div>' +
          '</article>').join('') + '</section>';
    });

    setCtx('plein');
    app().dataset.density = 'lecture';
    app().innerHTML =
      '<section class="fin-card" data-kind="serie">' +
        '<p class="overline">DS · ' + esc(cible.titre) + '</p>' +
        '<h2 class="display-l">' + ok + ' / ' + N + '</h2>' +
        '<p class="small muted">' + emoji + Math.round(p * 100) + ' % de précision.</p>' +
        '<div class="figures display">' +
          '<div class="figure"><b class="num">' + ok + '</b><span class="overline">justes</span></div>' +
          '<div class="figure"><b class="num">' + (N - ok) + '</b><span class="overline">à revoir</span></div>' +
          '<div class="figure"><b class="num">' + minutes + ' min</b><span class="overline">temps</span></div>' +
        '</div>' +
        '<blockquote class="coach-msg"><p>' + esc(verdict) + '</p></blockquote>' +
        (flanchent.length
          ? '<p class="msg">' + esc((flanchent.length > 1 ? flanchent.length + ' compétences ont glissé : ' : 'Une compétence a glissé : ') +
              flanchent.map(sid => parSkill[sid].titre).join(', ') + '. Rien ne change tant que tu ne le demandes pas.') + '</p>' +
            '<div class="row"><button class="btn" type="button" id="md-rappel">' +
              ic('arrows-clockwise', 'ic-20') + 'Remettre en rappel</button></div>'
          : '') +
        '<div class="next-row"><button class="btn-primary lg" type="button" id="md-fini">' +
          '<span>Revenir à Aujourd\'hui</span><span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
        '<div class="row">' +
          '<button class="btn" type="button" id="md-refaire">' + ic('arrow-counter-clockwise', 'ic-20') + 'Refaire un DS</button>' +
          '<button class="btn btn-ghost" type="button" id="md-cahier">' + ic('book-bookmark', 'ic-20') + 'Ouvrir le cahier</button>' +
        '</div>' +
      '</section>' +
      (corr ? '<section class="view"><p class="overline">Correction par compétence</p>' + corr + '</section>' : '');

    $('md-fini').addEventListener('click', () => { snd.click(); nav('accueil'); });
    $('md-refaire').addEventListener('click', () => { snd.click(); nav('ds'); });
    $('md-cahier').addEventListener('click', () => { snd.click(); nav('erreurs'); });
    const btnRappel = $('md-rappel');
    if (btnRappel) btnRappel.addEventListener('click', () => {
      snd.click();
      flanchent.forEach(sid => { const x = st(sid); x.fragile = true; x.due = Date.now(); });
      save();
      btnRappel.disabled = true;
      toast(flanchent.length + (flanchent.length > 1 ? ' compétences reviennent en rappel demain.' : ' compétence revient en rappel demain.'),
            {tone: 'glacier', icon: 'arrows-clockwise'});
    });
    document.querySelectorAll('[data-revoir]').forEach(b =>
      b.addEventListener('click', () => { snd.click(); nav('skill', {id: b.dataset.revoir}); }));
    $('md-fini').focus();

    celebrer(p >= .85 ? 3 : 2, {texte: 'DS terminé · ' + ok + ' sur ' + N + '.', icon: 'pencil-line'});
    try { (window.verifierJalons ? verifierJalons() : []).forEach(x => celebrer(x.niveau, {texte: x.texte})); } catch(e){}
    try { verifierSucces({type: 'serie-fin', ok: ok, n: N}).forEach(s => celebrer(3, {texte: 'Succès : ' + s.nom + '.', icon: s.ic})); } catch(e){}
    try { majCrete(); majAnneauJour(); } catch(e){}
    annoncer('DS terminé. ' + ok + ' sur ' + N + '.');
  }

  poser();
}
