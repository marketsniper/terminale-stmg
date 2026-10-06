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
    _seanceValiderJour(i, plan.length);    // 5 minutes écoulées sans presque répondre : la journée n'est pas validée
    save();

    const poses = Math.max(1, i);
    const p = ok / poses;
    const serie = streak();
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
        '<p class="small muted">' + Math.round(p * 100) + ' % de précision.</p>' +
        (serie >= 7 ? '<p class="record">' + ic('flame', 'ic-20') + serie + ' jours de cordée</p>' : '') +
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

const _mdDSMaxChap = 4;            // chapitres au plus dans un même DS

/* Prérequis déclarés de chaque chapitre : ce qui le porte vraiment en mathématiques, jamais ses
   voisins de liste. Une suite arithmétique u(n) = u(0) + n × r est une fonction affine de n, une
   suite géométrique repose sur les puissances et les coefficients multiplicateurs, etc.
   Un chapitre absent de la table n'a aucun prérequis. */
const _mdPre = {
  'p1-02-addition-soustraction':   ['p1-01-nombres'],
  'p1-04-multiplication-posee':    ['p1-03-tables', 'p1-02-addition-soustraction'],
  'p1-05-division-posee':          ['p1-03-tables', 'p1-04-multiplication-posee'],
  'p1-06-priorites':               ['p1-03-tables', 'p1-02-addition-soustraction'],
  'p1-07-relatifs':                ['p1-02-addition-soustraction'],
  'p1-08-decimaux':                ['p1-01-nombres', 'p1-04-multiplication-posee'],
  'p1-09-fractions-sens':          ['p1-05-division-posee', 'p1-03-tables'],
  'p1-10-proportionnalite':        ['p1-09-fractions-sens', 'p1-08-decimaux'],
  'p2-01-relatifs-multiplication': ['p1-07-relatifs', 'p1-03-tables'],
  'p2-02-fractions-somme':         ['p1-09-fractions-sens', 'p1-03-tables'],
  'p2-03-fractions-produit':       ['p1-09-fractions-sens', 'p2-02-fractions-somme'],
  'p2-04-puissances':              ['p1-03-tables', 'p2-01-relatifs-multiplication'],
  'p2-05-racines':                 ['p2-04-puissances', 'p1-03-tables'],
  'p2-06-calcul-litteral':         ['p2-01-relatifs-multiplication', 'p1-06-priorites'],
  'p2-07-equations':               ['p2-06-calcul-litteral', 'p2-01-relatifs-multiplication'],
  'p2-08-pourcentages':            ['p1-10-proportionnalite', 'p1-08-decimaux'],
  'p2-09-statistiques':            ['p1-08-decimaux', 'p1-05-division-posee'],
  'p2-10-problemes':               ['p1-10-proportionnalite', 'p2-08-pourcentages'],
  'p3-01-identites':               ['p2-06-calcul-litteral', 'p2-04-puissances'],
  'p3-02-factorisation':           ['p3-01-identites', 'p2-06-calcul-litteral'],
  'p3-03-inequations':             ['p2-07-equations', 'p2-01-relatifs-multiplication'],
  'p3-04-fonctions':               ['p2-06-calcul-litteral', 'p2-07-equations'],
  'p3-05-droites':                 ['p3-04-fonctions', 'p2-07-equations'],
  'p3-06-evolutions':              ['p2-08-pourcentages', 'p1-08-decimaux'],
  'p3-07-probabilites':            ['p1-09-fractions-sens', 'p2-02-fractions-somme'],
  'p3-08-quartiles':               ['p2-09-statistiques'],
  'p3-09-systemes':                ['p2-07-equations', 'p3-05-droites'],
  'p4-01-second-degre':            ['p3-02-factorisation', 'p2-05-racines'],
  'p4-02-nombre-derive':           ['p3-05-droites', 'p3-04-fonctions'],
  'p4-03-derivees':                ['p4-02-nombre-derive', 'p2-04-puissances'],
  'p4-04-variations':              ['p4-03-derivees', 'p3-03-inequations'],
  'p4-05-suites-arithmetiques':    ['p3-05-droites', 'p2-07-equations'],
  'p4-06-suites-geometriques':     ['p2-04-puissances', 'p3-06-evolutions'],
  'p4-07-taux-indices':            ['p3-06-evolutions', 'p2-08-pourcentages'],
  'p4-08-probas-conditionnelles':  ['p3-07-probabilites', 'p2-03-fractions-produit'],
  'p4-09-automatismes':            ['p3-06-evolutions', 'p2-07-equations'],
  'p5-01-degre3':                  ['p4-03-derivees', 'p4-04-variations'],
  'p5-02-suites-applications':     ['p4-05-suites-arithmetiques', 'p4-06-suites-geometriques'],
  'p5-03-probas-totales':          ['p4-08-probas-conditionnelles', 'p3-07-probabilites'],
  'p5-04-stats-deux-variables':    ['p3-05-droites', 'p2-09-statistiques'],
  'p5-05-suites-logiques':         ['p1-03-tables', 'p2-04-puissances'],
  'p5-06-vitesses':                ['p1-10-proportionnalite', 'p1-08-decimaux'],
  'p5-07-calcul-rapide':           ['p1-03-tables', 'p1-06-priorites'],
  'p5-08-problemes-qcm':           ['p2-10-problemes', 'p2-08-pourcentages'],
  'p7-01-automatismes-bac':        ['p4-09-automatismes', 'p3-06-evolutions'],
  'p7-02-revision-analyse':        ['p4-03-derivees', 'p4-05-suites-arithmetiques'],
  'p7-03-revision-probas':         ['p4-08-probas-conditionnelles', 'p2-09-statistiques']
};

/* Les prérequis d'un sujet (deux au plus) : le premier de chaque chapitre choisi, puis les
   suivants, sans jamais reprendre un chapitre du sujet lui-même. */
function _mdPrereq(cibles){
  const liste = Array.isArray(cibles) ? cibles : [cibles];
  const pris = [];
  for (let rang = 0; rang < 3 && pris.length < 2; rang++){
    liste.forEach(c => {
      const id = c ? (_mdPre[c.id] || [])[rang] : null;
      const s = id ? SKILLS.find(x => x.id === id) : null;
      if (s && pris.length < 2 && pris.indexOf(s) < 0 && liste.indexOf(s) < 0) pris.push(s);
    });
  }
  return pris;
}
/* Part des prérequis dans un sujet de N questions : 20 %, au moins une question par prérequis. */
function _mdNbPre(pre, N){ return pre.length ? Math.max(pre.length, Math.round(N * .2)) : 0; }

/* Composition d'un DS : les prérequis en ouverture, puis le ou les chapitres du niveau Découverte
   au niveau Expert (30 %, 40 %, 30 %), à parts égales entre les chapitres choisis.
   Retourne [{skill, level, pre}] dans l'ordre du sujet. */
function _mdSujet(cibles, N, avecPre){
  const pre = avecPre === false ? [] : _mdPrereq(cibles);
  const nPre = _mdNbPre(pre, N), nCible = N - nPre;
  const ouverture = [];
  for (let k = 0; k < nPre; k++) ouverture.push({skill: pre[k % pre.length], level: 2, pre: true});
  const suite = R.shuffle(ouverture);
  const n1 = Math.round(nCible * .3), n3 = Math.round(nCible * .3);
  let tour = R.int(0, cibles.length - 1);
  [[1, n1], [2, nCible - n1 - n3], [3, n3]].forEach(part => {
    const bloc = [];
    for (let k = 0; k < part[1]; k++) bloc.push({skill: cibles[tour++ % cibles.length], level: part[0], pre: false});
    R.shuffle(bloc).forEach(x => suite.push(x));
  });
  return suite;
}
/* « A, B et C » */
function _mdListe(l){ return l.length > 1 ? l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1] : (l[0] || ''); }
/* Texte comparable : sans accents, en minuscules. */
function _mdNorm(s){ return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }

/* Dernière correction de DS affichée : le retour depuis « Revoir la leçon » la rouvre,
   au lieu de retomber sur le choix du chapitre. */
let _mdRevoir = null;

/* params.skill : un ou plusieurs identifiants de chapitre (séparés par des virgules) présélectionnés,
   params.q : texte de recherche. Tous deux viennent de l'URL ./?go=ds&skill=<id> (app.js). */
function vDS(params){
  const par = params || {};
  if (par.retour && _mdRevoir){ _mdRevoir(); return; }
  _mdRevoir = null;
  setCtx('outil');
  app().dataset.density = 'outil';

  /* Tout le programme est proposé, même plus haut que le sentier : un contrôle n'attend pas la règle
     des 90 %. Cette règle reste entière sur le sentier : un chapitre pas encore ouvert n'y gagne
     ni altitude ni verrou (voir lancerDS). */
  const demandes = String(par.skill || '').split(',').map(x => x.trim()).filter(Boolean);
  let choisis = demandes.map(id => SKILLS.find(s => s.id === id))
    .filter((s, k, l) => s && l.indexOf(s) === k).slice(0, _mdDSMaxChap);
  const requete = String(par.q || '') || demandes.filter(id => !SKILLS.some(s => s.id === id)).join(' ');

  const phases = [];
  SKILLS.forEach(s => { if (phases.indexOf(s.phase) < 0) phases.push(s.phase); });
  const frontiere = (typeof frontier === 'function') ? frontier() : null;
  const ouverte = p => choisis.length ? choisis.some(s => s.phase === p)
    : frontiere ? frontiere.phase === p : p === phases[0];

  const groupes = phases.map(p => {
    const liste = SKILLS.filter(s => s.phase === p);
    const nom = (PHASES[p] || {}).nom || ('Phase ' + p);
    return '<details class="phase" data-phase="' + p + '"' + (ouverte(p) ? ' open' : '') + '>' +
      '<summary class="phase-head"><h2>' + esc(nom) + '</h2>' +
      '<span class="etat small muted" data-nb="' + liste.length + '">' + liste.length + ' chapitres</span>' +
      ic('caret-right', 'ic-20 caret') + '</summary>' +
      '<div class="skills" role="group" aria-label="Chapitres de ' + esc(nom) + '">' +
      liste.map(s => {
        const m = niveauMaitrise(s.id);
        const on = choisis.indexOf(s) >= 0;
        return '<button class="skill' + (on ? ' frontier' : '') + '" type="button" data-ds="' + esc(s.id) +
          '" data-mots="' + esc(_mdNorm(s.titre + ' ' + (s.objectif || '') + ' ' + nom)) +
          '" aria-pressed="' + (on ? 'true' : 'false') + '">' +
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
      '<blockquote class="coach-msg"><p id="md-coach"></p></blockquote>' +
      '<section class="field"><label class="label" for="md-cherche">Chapitres</label>' +
        '<input class="input" id="md-cherche" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search"' +
          ' placeholder="Chercher : suites, dérivées…" value="' + esc(requete) + '">' +
        '<p class="small muted" id="md-rien" hidden>Aucun chapitre ne correspond. Essaie un autre mot.</p>' +
        '<div class="ds-liste">' + groupes + '</div></section>' +
      '<section class="field"><span class="label">Longueur</span>' +
        '<div class="segment" role="radiogroup" aria-label="Longueur du DS">' + seg + '</div>' +
        '<label class="switch"><input type="checkbox" role="switch" id="md-pre" checked>' +
          '<span class="track"><span class="thumb"></span></span>' +
          '<span class="switch-t">Prérequis en ouverture</span></label></section>' +
      '<section class="card card-muted" id="md-choix">' +
        '<p class="overline">Sujet préparé</p>' +
        '<p class="small ink-2" id="md-resume" aria-live="polite"></p>' +
        '<p class="small muted" id="md-hors" hidden>Plus haut que ton sentier : ce DS t\'entraîne pour le contrôle, sans altitude ni verrou. Le sentier garde sa règle des 90 %.</p>' +
      '</section>' +
      '<div class="row ds-cta"><button class="btn-primary lg" type="button" id="md-go" disabled>' +
        '<span>Lancer le DS</span><span class="meta num" id="md-go-n"></span>' +
        '<span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
    '</section>';

  const boutons = Array.prototype.slice.call(document.querySelectorAll('[data-ds]'));
  const longueur = () => { const c = document.querySelector('input[name="md-n"]:checked'); return c ? Number(c.value) : 20; };
  const avecPre = () => { const c = $('md-pre'); return !c || c.checked; };

  /* Le sujet annoncé est exactement celui que lancerDS fabriquera. */
  function maj(){
    boutons.forEach(b => {
      const on = choisis.some(s => s.id === b.dataset.ds);
      b.classList.toggle('frontier', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const N = longueur();
    const pre = avecPre() ? _mdPrereq(choisis) : [];
    const nPre = _mdNbPre(pre, N);
    const resume = $('md-resume'), hors = $('md-hors'), go = $('md-go'), meta = $('md-go-n'), coach = $('md-coach');
    /* le coach et les en-têtes de phase disent toujours où en est le choix, même liste repliée */
    if (coach) coach.textContent = choisis.length
      ? 'Sujet prêt : ' + _mdListe(choisis.map(s => s.titre)) + '. Lance le DS, ou ajoute un chapitre.'
      : 'Choisis le ou les chapitres du contrôle, même plus haut que ton sentier. Je prépare le sujet, du plus simple au plus exigeant.';
    document.querySelectorAll('.ds-liste details.phase').forEach(d => {
      const e = d.querySelector('.phase-head .etat'), k = choisis.filter(s => String(s.phase) === d.dataset.phase).length;
      if (e) e.textContent = k ? k + (k > 1 ? ' choisis' : ' choisi') : e.dataset.nb + ' chapitres';
    });
    if (resume) resume.textContent = !choisis.length
      ? 'Touche le ou les chapitres du contrôle : ' + _mdDSMaxChap + ' au plus.'
      : _mdListe(choisis.map(s => s.titre)) + ' : ' + (N - nPre) + ' questions, du niveau Découverte au niveau Expert.' +
        (nPre ? ' En ouverture, ' + nPre + ' questions de prérequis : ' + _mdListe(pre.map(s => s.titre)) + '.'
              : avecPre() ? ' Aucun prérequis à revoir pour ce sujet.' : '');
    if (hors) hors.hidden = !choisis.some(s => !phaseUnlocked(s.phase));
    if (go) go.disabled = !choisis.length;
    if (meta) meta.textContent = choisis.length ? N + ' questions' : '';
  }

  boutons.forEach(b => b.addEventListener('click', () => {
    snd.click();
    const s = SKILLS.find(x => x.id === b.dataset.ds);
    if (!s) return;
    if (choisis.indexOf(s) >= 0) choisis = choisis.filter(x => x !== s);
    else if (choisis.length >= _mdDSMaxChap){
      toast('Quatre chapitres au plus par DS. Retire-en un pour en ajouter un autre.', {tone: 'info', icon: 'info'});
      return;
    } else choisis.push(s);
    maj();
  }));
  document.querySelectorAll('input[name="md-n"]').forEach(r => r.addEventListener('change', maj));
  const sw = $('md-pre');
  if (sw) sw.addEventListener('change', maj);

  /* Recherche : chaque mot doit se retrouver dans le titre, l'objectif ou le niveau du chapitre. */
  const champ = $('md-cherche');
  function filtrer(){
    const mots = _mdNorm(champ.value).split(/\s+/).filter(Boolean);
    let total = 0;
    document.querySelectorAll('.ds-liste details.phase').forEach(d => {
      let n = 0;
      d.querySelectorAll('[data-ds]').forEach(b => {
        const vu = mots.every(m => b.dataset.mots.indexOf(m) >= 0);
        b.hidden = !vu;
        if (vu) n++;
      });
      d.hidden = !n;
      d.open = mots.length ? n > 0 : ouverte(Number(d.dataset.phase));
      total += n;
    });
    const rien = $('md-rien');
    if (rien) rien.hidden = total > 0;
  }
  if (champ){
    champ.addEventListener('input', filtrer);
    if (champ.value) filtrer();
  }

  $('md-go').addEventListener('click', () => {
    if (!choisis.length) return;
    snd.click();
    lancerDS(choisis.map(s => s.id), {n: longueur(), pre: avecPre()});
  });
  maj();
}

/* ---------- le DS : correction différée, puis bilan ---------- */
/* ids : un identifiant de chapitre ou un tableau · opts : {n: 10 | 20 | 30, pre: false pour un sujet sans prérequis}. */
function lancerDS(ids, opts){
  const o = opts || {};
  const cibles = (Array.isArray(ids) ? ids : [ids]).map(id => SKILLS.find(s => s.id === id))
    .filter((s, k, l) => s && l.indexOf(s) === k).slice(0, _mdDSMaxChap);
  if (!cibles.length){ nav('ds'); return; }
  const N = _mdDSDurees.indexOf(o.n) >= 0 ? o.n : 20;
  const sujet = _mdSujet(cibles, N, o.pre);
  const suite = sujet.map(x => x.skill);
  const titre = _mdListe(cibles.map(s => s.titre));
  const titreCourt = cibles.length > 1 ? 'DS en vue' : 'DS · ' + cibles[0].titre;      // en-tête étroit sur iPhone

  const rep = new Array(N).fill(null);
  /* un même énoncé ne tombe pas deux fois dans le sujet */
  const vus = {};
  const exos = sujet.map(x => {
    let ex = genFor(x.skill, x.level);
    for (let t = 0; t < 8 && vus[ex.q]; t++) ex = genFor(x.skill, x.level);
    vus[ex.q] = true;
    return ex;
  });
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
    setCtx('parcours', {title: titreCourt, count: (i + 1) + ' / ' + N});
    const zone = $('md-zone');
    if (!zone) return;
    zone.innerHTML = '';
    const hote = document.createElement('div');
    zone.appendChild(hote);
    const sk = suite[i], t0 = performance.now();
    askQuestion(hote, {
      ex: exos[i], skill: sk, skillId: sk.id,
      tag: sk.titre, overline: sujet[i].pre ? 'Prérequis' : 'Le chapitre',
      lvl: sujet[i].pre ? null : sujet[i].level,
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
    let ok = 0, msTotal = 0, horsSentier = false;
    const details = [];
    for (let k = 0; k < N; k++){
      const sk = suite[k], ex = exos[k], donnee = rep[k] || '';
      const juste = donnee !== '' && isRight(donnee, ex);
      if (juste) ok++;
      msTotal += temps[k] || 0;
      const c = parSkill[sk.id] || (parSkill[sk.id] = {ok: 0, n: 0, titre: sk.titre});
      c.n++; if (juste) c.ok++;
      logAnswer(juste, temps[k] || 0);
      /* L'altitude se gagne, la maîtrise ne se perd jamais ici. Un chapitre plus haut que le sentier
         n'est pas enregistré : ni mètres ni verrou, la règle des 90 % reste entière. */
      if (phaseUnlocked(sk.phase)) record(sk.id, juste);
      else horsSentier = true;
      if (!juste){
        _mdCahier(sk, ex, donnee, '');
        details.push({k: k, sk: sk, ex: ex, donnee: donnee});
      }
    }
    _seanceValiderJour(rep.filter(v => v).length, N);    // une copie presque vide ne valide pas la journée
    save();

    const p = ok / N;
    const minutes = Math.max(1, Math.round(msTotal / 60000));
    /* compétences qui ont flanché : rien n'est retiré sans le dire, un bouton le propose */
    const flanchent = Object.keys(parSkill).filter(sid => {
      const c = parSkill[sid];
      return c.n >= 2 && c.ok / c.n < _mdDSSeuil && st(sid).mastered && !st(sid).fragile;
    });

    const verdict = p >= .85 ? 'Solide sur ce qui est tombé ici. Avant le contrôle, rédige aussi un exercice complet sur papier.'
                  : p >= .7 ? 'C\'est solide. Refais une série sur les points qui ont glissé.'
                  : 'Reprends la leçon avant le contrôle : il reste de la marge.';

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

    let rappelFait = false;
    /* L'affichage est rejouable : le retour depuis « Revoir la leçon » rouvre cette correction. */
    const afficher = () => {
    setCtx('plein');
    app().dataset.density = 'lecture';
    app().innerHTML =
      '<section class="fin-card" data-kind="serie">' +
        '<p class="overline">DS · ' + esc(cibles.length > 1 ? cibles.length + ' chapitres' : titre) + '</p>' +
        '<h2 class="display-l">' + ok + ' / ' + N + '</h2>' +
        '<p class="small muted">' + Math.round(p * 100) + ' % de précision.</p>' +
        '<div class="figures display">' +
          '<div class="figure"><b class="num">' + ok + '</b><span class="overline">justes</span></div>' +
          '<div class="figure"><b class="num">' + (N - ok) + '</b><span class="overline">à revoir</span></div>' +
          '<div class="figure"><b class="num">' + minutes + ' min</b><span class="overline">temps</span></div>' +
        '</div>' +
        '<blockquote class="coach-msg"><p>' + esc(verdict) + '</p></blockquote>' +
        (horsSentier ? '<p class="small muted">Chapitre plus haut que ton sentier : entraînement compté dans ta journée, sans altitude ni verrou.</p>' : '') +
        (flanchent.length
          ? '<p class="msg">' + esc((flanchent.length > 1 ? flanchent.length + ' compétences ont glissé : ' : 'Une compétence a glissé : ') +
              flanchent.map(sid => parSkill[sid].titre).join(', ') + '. Rien ne change tant que tu ne le demandes pas.') + '</p>' +
            '<div class="row"><button class="btn" type="button" id="md-rappel"' + (rappelFait ? ' disabled' : '') + '>' +
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
    $('md-refaire').addEventListener('click', () => { snd.click(); nav('ds', {skill: cibles.map(s => s.id).join(',')}); });
    $('md-cahier').addEventListener('click', () => { snd.click(); nav('erreurs'); });
    const btnRappel = $('md-rappel');
    if (btnRappel) btnRappel.addEventListener('click', () => {
      snd.click();
      flanchent.forEach(sid => { const x = st(sid); x.fragile = true; x.due = Date.now(); });
      save();
      rappelFait = true;
      btnRappel.disabled = true;
      toast(flanchent.length + (flanchent.length > 1 ? ' compétences reviennent en rappel demain.' : ' compétence revient en rappel demain.'),
            {tone: 'glacier', icon: 'arrows-clockwise'});
    });
    document.querySelectorAll('[data-revoir]').forEach(b =>
      b.addEventListener('click', () => { snd.click(); nav('skill', {id: b.dataset.revoir}); }));
    $('md-fini').focus();
    };
    afficher();
    _mdRevoir = afficher;

    celebrer(p >= .85 ? 3 : 2, {texte: 'DS terminé · ' + ok + ' sur ' + N + '.', icon: 'pencil-line'});
    try { (window.verifierJalons ? verifierJalons() : []).forEach(x => celebrer(x.niveau, {texte: x.texte})); } catch(e){}
    try { verifierSucces({type: 'serie-fin', ok: ok, n: N}).forEach(s => celebrer(3, {texte: 'Succès : ' + s.nom + '.', icon: s.ic})); } catch(e){}
    try { majCrete(); majAnneauJour(); } catch(e){}
    annoncer('DS terminé. ' + ok + ' sur ' + N + '.');
  }

  poser();
}
