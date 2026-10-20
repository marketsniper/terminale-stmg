/* ===== Maths · Objectif Albert School : hub, leçons et rappels de la piste =====
   Script classique : portée globale partagée. Ce fichier déclare : vAlbert, vAlbertLecon.
   Tout le reste est préfixé _alb ; passerelles par window : albertCarte, albertPreparation, albertDate, albertFaitHtml.
   La piste vit dans window.ALBERT_SKILLS, jamais dans SKILLS : ni altitude, ni camps, ni frontière, ni épreuve.
   Les faits sur l'école viennent UNIQUEMENT de window.ALBERT_INFOS (albert/albert-donnees.js), affichés via esc().
   S.albert est relu à chaque usage : migrer() peut remplacer S (import, récupération). */
'use strict';

/* Libellés des thèmes de la piste (champ theme des compétences). Un thème inconnu garde son nom, capitalisé. */
const _albTHEMES = {calcul: 'Calcul', logique: 'Logique', suites: 'Suites', stats: 'Statistiques', proba: 'Probabilités',
  fonctions: 'Fonctions', algebre: 'Algèbre', geometrie: 'Géométrie', donnees: 'Lecture de données', autres: 'Autres'};
/* Faits affichés d'emblée sur le hub ; les autres sont repliés sous « Toutes les infos ». */
const _albFAITS_CLES = ['format', 'conditions', 'tentative', 'moment', 'janvier', 'fil-eau'];

/* ---------- lectures sans effet de bord ---------- */
function _albA(){ return S.albert || {tests: [], entretiens: [], checklist: {}, notes: {}, bt: {}, enCours: null, dateCible: ''}; }
function _albSkills(){ return (window.ALBERT_SKILLS || []).filter(s => s && s.id).slice().sort((a, b) => (a.ordre || 0) - (b.ordre || 0)); }
function _albSkill(id){ return (window.ALBERT_SKILLS || []).find(s => s && s.id === id) || null; }
/* Fiche en lecture seule : st() créerait une entrée dans S.skills à la simple lecture. */
function _albFiche(id){ return S.skills[id] || {hist: [], n: 0, ok: 0, mastered: false, fragile: false, due: 0}; }
/* État affiché d'une compétence de la piste (niveauMaitrise crée la fiche : on ne l'appelle que si elle existe). */
function _albEtat(id){
  const x = S.skills[id];
  if (!x) return {libelle: 'Nouvelle', ton: 'muted'};
  const nm = niveauMaitrise(id);
  return {libelle: nm.libelle, ton: nm.provisoire ? 'gold' : nm.fragile ? 'warn' : x.mastered ? 'ok' : x.n ? 'glacier' : 'muted'};
}
function _albInfos(){ return window.ALBERT_INFOS || {}; }
function _albSource(id){ return (_albInfos().sources || []).find(s => s && s.id === id) || null; }
function _albSrcIds(x){ return !x || !x.src ? [] : (Array.isArray(x.src) ? x.src : [x.src]); }
function _albIso(iso){ return typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso); }
function _albJourFr(iso, o){
  if (!_albIso(iso)) return '';
  try { return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', o || {day: 'numeric', month: 'long', year: 'numeric'}); } catch(e){ return iso; }
}
function _albCourt(d){ try { return d.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}); } catch(e){ return ''; } }
function _albTheme(th){ const k = String(th || 'autres'); return _albTHEMES[k] || (k.charAt(0).toUpperCase() + k.slice(1)); }

/* ---------- sources et faits ---------- */
/* Sources d'un fait : liens https uniquement ; sans source (et hors conseil) : pastille « à confirmer ». */
function _albSourcesHtml(x){
  const morceaux = [];
  _albSrcIds(x).forEach(id => {
    const s = _albSource(id);
    if (!s) return;
    morceaux.push(/^https:\/\//.test(s.url || '')
      ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.titre || 'source') + '</a>'
      : esc(s.titre || id));
  });
  if (!morceaux.length) return (x && x.conseil) ? '' : '<span class="chip" data-tone="warn">à confirmer</span>';
  return '<span class="alb-src">Source' + (morceaux.length > 1 ? 's' : '') + ' : ' + morceaux.join(' · ') + '</span>';
}
/* Date de vérification d'un fait : la plus récente de ses sources, sinon celle du fichier. */
function _albVu(x){
  const vus = _albSrcIds(x).map(id => (_albSource(id) || {}).vu).filter(_albIso).sort();
  return vus.length ? vus[vus.length - 1] : (_albInfos().verifieLe || '');
}
function _albFaitHtml(f){
  if (!f || !f.t) return '';
  const vu = _albVu(f);
  return '<div class="box retenir alb-fait"><p class="box-t">' + esc(f.t) + '</p><p>' + esc(f.v || '') + '</p>' +
    (f.aConfirmer ? '<p class="alb-conf"><span class="chip" data-tone="warn">à confirmer</span> <span class="small">' + esc(f.aConfirmer) + '</span></p>' : '') +
    '<p class="small muted alb-meta">' + _albSourcesHtml(f) + (vu && _albSrcIds(f).length ? '<span>vérifié le ' + esc(_albJourFr(vu)) + '</span>' : '') + '</p></div>';
}
/* Un fait par son id, pour l'oral et le test (vues/albert-oral.js, vues/albert-test.js). */
window.albertFaitHtml = id => _albFaitHtml((_albInfos().ecole || []).find(f => f && f.id === id));

/* ---------- calendrier et compte à rebours ---------- */
/* Date cible : celle de l'élève, sinon la prochaine date du calendrier marquée cible. Midi : pas de piège de fuseau. */
function _albDate(){
  const A = _albA();
  if (_albIso(A.dateCible)) return new Date(A.dateCible + 'T12:00:00');
  const c = (_albInfos().calendrier || []).find(x => x && x.cible && _albIso(x.date) && joursAvant(new Date(x.date + 'T12:00:00')) >= 0);
  return c ? new Date(c.date + 'T12:00:00') : null;
}
window.albertDate = _albDate;
function _albCible(){ return (_albInfos().calendrier || []).find(x => x && x.cible && _albIso(x.date)) || null; }

/* Rappels de la piste dus aujourd'hui : calculés ici, jamais par dueReviews() (qui ne parcourt que SKILLS). */
function _albDus(){
  const now = Date.now();
  return _albSkills().filter(s => { const x = _albFiche(s.id); return x.mastered && (x.fragile || (x.due && x.due <= now)); })
    .sort((a, b) => { const A = _albFiche(a.id), B = _albFiche(b.id); return (B.fragile ? 1 : 0) - (A.fragile ? 1 : 0) || (A.due || 0) - (B.due || 0); });
}

/* ---------- état de préparation (indicateur de travail, pas une prédiction d'admission) ---------- */
function _albPreparation(){
  const A = _albA(), sk = _albSkills();
  const comp = sk.length ? sk.filter(s => { const x = _albFiche(s.id); return x.mastered && !x.fragile; }).length / sk.length : 0;
  const t = (A.tests || []).slice(-2), test = t.length ? t.reduce((a, x) => a + (Number(x.niveau) || 0), 0) / t.length / 5 : 0;
  const e = (A.entretiens || []).slice(-1)[0], oral = e && typeof e.note === 'number' ? Math.min(1, Math.max(0, e.note / 20)) : 0;
  const dos = (_albInfos().dossier || []), dossier = dos.length ? dos.filter(d => A.checklist && A.checklist[d.id]).length / dos.length : 0;
  const piliers = [['Compétences', comp, .4], ['Test blanc', test, .35], ['Entretien', oral, .15], ['Dossier', dossier, .1]];
  return {total: Math.round(100 * piliers.reduce((a, p) => a + p[1] * p[2], 0)), piliers: piliers};
}
window.albertPreparation = _albPreparation;

/* ---------- plan en 5 étapes ---------- */
function _albPlan(){
  const A = _albA(), sk = _albSkills(), now = Date.now(), tests = A.tests || [];
  const verr = sk.filter(s => { const x = _albFiche(s.id); return x.mastered && !x.fragile; }).length;
  const recents = tests.filter(t => t && now - (t.date || 0) <= 14 * JOUR), der = tests.slice(-1)[0];
  const dos = (_albInfos().dossier || []);
  const etapes = [
    {id: 'diag',    t: 'Diagnostic',   f: 0,   fait: tests.length >= 1},
    {id: 'piste',   t: 'Piste',        f: .6,  fait: sk.length > 0 && verr / sk.length >= .7},
    {id: 'tests',   t: 'Tests blancs', f: .85, fait: recents.length >= 2 && !!der && (Number(der.niveau) || 0) >= 3.5},
    {id: 'oral',    t: 'Entretien',    f: .9,  fait: (A.entretiens || []).length >= 2},
    {id: 'dossier', t: 'Dossier',      f: .95, fait: dos.length > 0 && dos.every(d => A.checklist && A.checklist[d.id])}
  ];
  const d = _albDate(), j = d ? joursAvant(d) : null;
  etapes.forEach(e => {
    if (j === null || j < 0) { e.vise = null; return; }
    const n = e.id === 'diag' ? Math.min(7, j) : Math.round(j * e.f);
    e.vise = new Date(now + n * JOUR);
  });
  return {etapes: etapes, cur: etapes.findIndex(e => !e.fait), verr: verr, total: sk.length};
}

/* Compétence à travailler : la plus ratée du dernier test parmi les non verrouillées, sinon la première de la piste. */
function _albVisee(){
  const sk = _albSkills().filter(s => { const x = _albFiche(s.id); return !x.mastered || x.fragile; });
  if (!sk.length) return null;
  const der = (_albA().tests || []).slice(-1)[0], ko = {};
  ((der && der.parQ) || []).forEach(q => { if (q && !q.ok) ko[q.sid] = (ko[q.sid] || 0) + 1; });
  const pire = sk.slice().sort((a, b) => (ko[b.id] || 0) - (ko[a.id] || 0))[0];
  return {skill: ko[pire.id] ? pire : sk[0], ko: ko[pire.id] || 0};
}

/* La prochaine action, calculée : une phrase et un bouton secondaire. */
function _albProchaine(){
  const A = _albA(), plan = _albPlan(), dus = _albDus();
  if (!(A.tests || []).length)
    return {t: 'Passe un premier test blanc en conditions réelles : il sert de diagnostic et oriente la suite du travail.', label: 'Préparer le test blanc', go: 'albertTest'};
  if (dus.length)
    return {t: 'Rappel du jour : « ' + dus[0].titre + ' ». Trois questions pour garder la compétence.', label: 'Faire le rappel', rappel: dus[0].id};
  if (!plan.etapes[1].fait){
    const v = _albVisee();
    if (v) return {t: v.ko ? 'Travaille « ' + v.skill.titre + ' » : ' + v.ko + (v.ko > 1 ? ' erreurs' : ' erreur') + ' dans ton dernier test blanc.'
                           : 'Prochaine compétence de la piste : « ' + v.skill.titre + ' ».',
                   label: 'Ouvrir la leçon', go: 'albertLecon', id: v.skill.id};
  }
  if (!plan.etapes[2].fait)
    return {t: 'Passe un test blanc cette semaine : deux tests en 14 jours, avec un niveau d\'au moins 3,5 sur 5 au dernier.', label: 'Préparer le test blanc', go: 'albertTest'};
  if (!plan.etapes[3].fait)
    return {t: 'Entraîne-toi à l\'oral : motivation, estimation, anglais, puis un entretien blanc.', label: 'Préparer l\'entretien', go: 'albertOral'};
  if (!plan.etapes[4].fait){
    const d = (_albInfos().dossier || []).find(x => !(A.checklist && A.checklist[x.id]));
    return {t: 'Dossier : ' + (d ? d.t : 'termine ta checklist') + '.', label: 'Voir le dossier', ancre: 'alb-dossier'};
  }
  return {t: 'Tout est en place. Garde le rythme : un test blanc par semaine et tes rappels jusqu\'au jour J.', label: null};
}

/* Carte d'entrée, partagée par l'accueil et le coach. data-v="albert" : l'accueil la branche tout seul (clic [data-v]). */
window.albertCarte = function(lieu){
  try {
    const d = _albDate(), j = d ? joursAvant(d) : null, p = _albPreparation();
    return '<section class="card alb-carte"' + (lieu === 'coach' ? ' data-bento="3"' : '') + '>' +
      '<p class="overline">Objectif Albert School</p>' +
      '<h2>' + (j !== null && j >= 0 ? 'J−' + fv(j) : 'Prépare ton admission') + '</h2>' +
      '<p class="small muted">Préparation ' + p.total + ' % · test blanc 40 min · entretien</p>' +
      '<div class="row"><button class="btn" type="button" data-v="albert" id="' + (lieu === 'coach' ? 'co-albert' : 'acc-albert') + '">' +
        ic('graduation-cap') + '<span>Ouvrir</span></button></div></section>';
  } catch(e){ return ''; }
};

/* ============================================================
   1. Le hub
   ============================================================ */
function vAlbert(){
  const cible = app();
  if (!cible) return;
  if (typeof window.albertCloreTest === 'function') window.albertCloreTest();   // test resté ouvert, temps écoulé
  setCtx('outil');
  cible.dataset.density = 'outil';
  const A = _albA(), I = _albInfos(), sk = _albSkills(), d = _albDate(), j = d ? joursAvant(d) : null;
  const prep = _albPreparation(), dus = _albDus(), plan = _albPlan(), suite = _albProchaine();
  const enCours = A.enCours && A.enCours.limite > Date.now() ? A.enCours : null;
  const dernier = (A.tests || []).slice(-1)[0], cibleCal = _albCible();
  const dos = I.dossier || [], fait = dos.filter(x => A.checklist && A.checklist[x.id]).length;
  const resteMs = enCours ? enCours.limite - Date.now() : 0;
  const horloge = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  /* 1. tête et carte principale */
  const tete =
    '<header><p class="overline">Objectif</p><h1>Albert School</h1></header>' +
    '<section class="card card-raised alb-tete">' +
      '<div class="figures duo">' +
        '<div class="figure"><b class="num">' + (j !== null && j >= 0 ? 'J−' + fv(j) : '–') + '</b><span class="k">' +
          (d ? (j !== null && j < 0 ? 'date passée : choisis-en une autre' : 'avant le ' + esc(d.toLocaleDateString('fr-FR', {day: 'numeric', month: 'long'}))) : 'date à choisir') + '</span></div>' +
        '<div class="figure"><b class="num">' + prep.total + ' %</b><span class="k">préparation</span></div>' +
        '<div class="figure"><b class="num">' + (dernier ? esc(fv(dernier.niveau, 1)) : '–') + '</b><span class="k">niveau du dernier test, sur 5</span></div>' +
        '<div class="figure"><b class="num">' + fv(plan.verr) + ' / ' + fv(plan.total) + '</b><span class="k">compétences verrouillées</span></div>' +
      '</div>' +
      '<label class="field"><span class="label">Date visée pour ton test' + (A.dateCible ? '' : (cibleCal ? ' (par défaut : ' + esc(_albJourFr(cibleCal.date, {day: 'numeric', month: 'long'})) + ', conseil)' : '')) + '</span>' +
        '<input class="input" id="alb-date" type="date" value="' + esc(A.dateCible || '') + '"></label>' +
      (A.dateCible && cibleCal ? '<div class="row"><button class="btn btn-ghost sm" type="button" id="alb-date-raz">Revenir à la date conseillée</button></div>' : '') +
      '<button class="btn-primary lg" type="button" id="alb-test"><span>' + (enCours ? 'Reprendre le test blanc' : 'Passer le test blanc') +
        '</span><span class="meta num">' + (enCours ? esc(horloge(resteMs)) : '40 min') + '</span><span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button>' +
      (dernier ? '<p class="small muted">Dernier test : ' + fv(dernier.ok) + ' / ' + fv(dernier.n) + ' · niveau ' + esc(fv(dernier.niveau, 1)) + ' sur 5' +
        (dernier.points != null ? ' · ' + fv(dernier.points) + ' points pondérés' : '') + '.</p>' : '') +
    '</section>';

  /* 2. prochaine étape */
  const blocSuite = '<section class="card card-accent alb-suite" aria-labelledby="alb-suite-t">' +
    '<p class="overline" id="alb-suite-t">Prochaine étape</p><p>' + esc(suite.t) + '</p>' +
    (suite.label ? '<div class="row"><button class="btn" type="button" id="alb-suite">' + ic('arrow-right') + '<span>' + esc(suite.label) + '</span></button></div>' : '') +
    '</section>';

  /* 3. plan en étapes */
  const blocPlan = '<section class="coach-sec"><p class="overline">Plan</p><ol class="steps alb-steps">' + plan.etapes.map((e, i) =>
    '<li class="step' + (e.fait ? ' done' : (i === plan.cur ? ' cur' : '')) + '"' + (i === plan.cur ? ' aria-current="step"' : '') + '>' +
      '<span class="node">' + ic('check') + '</span><span class="step-t">' + esc(e.t) + '</span>' +
      '<span class="step-m">' + (e.fait ? 'fait' : e.vise ? esc(_albCourt(e.vise)) : '') + '</span></li>').join('') + '</ol>' +
    '<p class="small muted">Diagnostic : un premier test. Piste : 70 % des compétences verrouillées. Tests blancs : deux en 14 jours, niveau 3,5 au dernier. ' +
      'Entretien : deux entretiens blancs. Dossier : checklist complète. Les dates visées découlent de ta date.</p></section>';

  /* 4. état de préparation */
  const blocPrep = '<section class="coach-sec"><p class="overline">État de préparation</p><div class="bars">' + prep.piliers.map(p =>
    '<div class="bar-row"><span class="lab">' + esc(p[0]) + '</span><div class="pbar" style="--p:' + Math.round(100 * p[1]) + '"><i></i></div>' +
    '<span class="val">' + Math.round(100 * p[1]) + ' %</span></div>').join('') + '</div>' +
    '<p class="small muted">Indicateur de travail, pas une prédiction d\'admission.</p></section>';

  /* 5. rappels espacés de la piste */
  const blocRappels = dus.length ? '<section class="coach-sec"><p class="overline">Rappels du jour</p><ul class="todo">' + dus.map(s =>
    '<li class="todo-l"><button class="todo-chk" type="button" data-alb-rappel="' + esc(s.id) + '" aria-label="Réviser ' + esc(s.titre) + '"></button>' +
    '<span class="todo-t">' + esc(s.titre) + (_albFiche(s.id).fragile ? ' <span class="chip" data-tone="warn">fragile</span>' : '') + '</span>' +
    '<span class="num">3 q.</span></li>').join('') + '</ul></section>' : '';

  /* 6. compétences de la piste, par thème */
  const groupes = {};
  sk.forEach(s => { const th = s.theme || 'autres'; (groupes[th] = groupes[th] || []).push(s); });
  const ordreTh = Object.keys(groupes).sort((a, b) => (groupes[a][0].ordre || 0) - (groupes[b][0].ordre || 0));
  const blocPiste = '<section class="coach-sec"><p class="overline">Compétences de la piste</p>' + (sk.length ? ordreTh.map(th => {
    const l = groupes[th], v = l.filter(s => { const x = _albFiche(s.id); return x.mastered && !x.fragile; }).length;
    return '<div class="alb-theme"><h3>' + esc(_albTheme(th)) + ' <span class="num small muted">' + fv(v) + ' / ' + fv(l.length) + '</span></h3><div class="alb-liste">' +
      l.map(s => { const e = _albEtat(s.id);
        return '<button class="card card-link alb-comp" type="button" data-alb-lecon="' + esc(s.id) + '">' +
          '<span class="label">' + esc(s.titre) + '</span><span class="chip" data-tone="' + e.ton + '">' + esc(e.libelle) + '</span></button>'; }).join('') +
      '</div></div>';
  }).join('') : vide({icone: 'target', titre: 'La piste arrive bientôt.', texte: 'Les compétences du test s\'afficheront ici.'})) + '</section>';

  /* 7. entretien */
  const der = (A.entretiens || []).slice(-1)[0];
  const blocOral = '<section class="coach-sec"><p class="overline">Entretien</p>' +
    '<p class="small muted">Motivation, estimation, anglais, pitch : entraîne-toi seul, puis passe un entretien blanc.' +
    (der ? ' Dernier entretien blanc : ' + esc(fv(der.note, 1)) + ' sur 20.' : '') + '</p>' +
    '<div class="row"><button class="btn" type="button" id="alb-oral">' + ic('question') + '<span>Préparer l\'entretien</span></button></div></section>';

  /* 8. dossier */
  const blocDossier = dos.length ? '<section class="coach-sec" id="alb-dossier"><p class="overline">Dossier · <span id="alb-dos-n" class="num">' + fv(fait) + ' / ' + fv(dos.length) + '</span></p><div class="crit">' +
    dos.map(x => '<label class="crit-l"><input type="checkbox" data-alb-check="' + esc(x.id) + '"' + (A.checklist && A.checklist[x.id] ? ' checked' : '') + '><span>' + esc(x.t) + '</span></label>').join('') +
    '</div></section>' : '';

  /* 9. calendrier : à venir d'abord, puis les dates passées, grisées */
  const cal = (I.calendrier || []).filter(c => c && _albIso(c.date)).map(c => {
    const jd = joursAvant(new Date(c.date + 'T12:00:00')), jf = joursAvant(new Date((_albIso(c.fin) ? c.fin : c.date) + 'T12:00:00'));
    return {c: c, jd: jd, passe: jf !== null && jf < 0, enCours: jd !== null && jd < 0 && jf !== null && jf >= 0};
  });
  const avenir = cal.filter(x => !x.passe).sort((a, b) => a.c.date < b.c.date ? -1 : 1);
  const passes = cal.filter(x => x.passe).sort((a, b) => a.c.date < b.c.date ? 1 : -1);
  const ligneCal = x => {
    const c = x.c, an = c.date.slice(0, 4);
    const quand = x.passe ? 'passé' : x.enCours ? 'en cours' : x.jd === 0 ? 'aujourd\'hui' : 'J−' + fv(x.jd);
    return '<li class="alb-cal-l"' + (x.passe ? ' data-passe' : '') + '>' +
      '<span class="alb-cal-d"><b class="num">' + esc(_albJourFr(c.date, {day: 'numeric', month: 'short'})) + '</b>' +
        (_albIso(c.fin) ? '<span class="small">au ' + esc(_albJourFr(c.fin, {day: 'numeric', month: 'short'})) + '</span>' : '') +
        '<span class="small num">' + esc(an) + '</span></span>' +
      '<div class="alb-cal-t"><p><span class="label">' + esc(c.t) + '</span> <span class="small muted num">' + esc(quand) + '</span></p>' +
        (c.note ? '<p class="small muted">' + esc(c.note) + '</p>' : '') +
        '<p class="small muted alb-meta">' + (c.cible ? '<span class="chip" data-tone="gold">date par défaut</span>' : '') +
          (c.conseil ? '<span class="chip" data-tone="glacier">conseil</span>' : '') + _albSourcesHtml(c) + '</p></div></li>';
  };
  const blocCal = cal.length ? '<section class="coach-sec"><p class="overline">Calendrier</p><ul class="alb-cal">' +
    avenir.map(ligneCal).join('') + passes.map(ligneCal).join('') + '</ul></section>' : '';

  /* 10. infos vérifiées */
  const faits = (I.ecole || []).filter(f => f && f.t);
  const cles = faits.filter(f => _albFAITS_CLES.indexOf(f.id) >= 0), autres = faits.filter(f => _albFAITS_CLES.indexOf(f.id) < 0);
  const nConf = faits.filter(f => f.aConfirmer || !_albSrcIds(f).length).length;
  const blocInfos = faits.length ? '<section class="coach-sec"><p class="overline">Infos vérifiées' + (I.verifieLe ? ' le ' + esc(_albJourFr(I.verifieLe)) : '') + '</p>' +
    (nConf ? '<p class="small muted">' + fv(nConf) + (nConf > 1 ? ' points restent' : ' point reste') + ' « à confirmer » : sources divergentes ou information à vérifier.</p>' : '') +
    cles.map(_albFaitHtml).join('') +
    (autres.length ? '<details class="alb-plus"><summary>Toutes les infos (' + fv(autres.length) + ' de plus)</summary>' + autres.map(_albFaitHtml).join('') + '</details>' : '') +
    '</section>' : '';

  cible.innerHTML = '<div class="view view-albert">' + tete + blocSuite + blocPlan + blocPrep + blocRappels + blocPiste + blocOral +
    blocDossier + blocCal + blocInfos + '</div>';

  /* ---------- branchements ---------- */
  const z = app();
  const clic = (sel, fn) => z.querySelectorAll(sel).forEach(b => b.addEventListener('click', ev => { try { snd.click(); } catch(x){} fn(b, ev); }));
  clic('#alb-test', () => nav(enCours ? 'albertRun' : 'albertTest', enCours ? {reprise: true} : {}));
  clic('#alb-oral', () => nav('albertOral'));
  clic('[data-alb-lecon]', b => nav('albertLecon', {id: b.dataset.albLecon}));
  clic('[data-alb-rappel]', b => _albRappel(b.dataset.albRappel));
  clic('#alb-suite', () => {
    if (suite.rappel) _albRappel(suite.rappel);
    else if (suite.ancre){ const el = $(suite.ancre); if (el) el.scrollIntoView({block: 'start', behavior: 'smooth'}); }
    else if (suite.go) nav(suite.go, suite.id ? {id: suite.id} : {});
  });
  clic('#alb-date-raz', () => { S.albert.dateCible = ''; save(); vAlbert(); });
  const champ = $('alb-date');
  if (champ) champ.addEventListener('change', () => {
    const v = champ.value || '';
    S.albert.dateCible = _albIso(v) ? v : '';
    save();
    vAlbert();
  });
  z.querySelectorAll('[data-alb-check]').forEach(c => c.addEventListener('change', () => {
    if (c.checked) S.albert.checklist[c.dataset.albCheck] = Date.now(); else delete S.albert.checklist[c.dataset.albCheck];
    save();
    const n = $('alb-dos-n'); if (n) n.textContent = fv(dos.filter(x => S.albert.checklist[x.id]).length) + ' / ' + fv(dos.length);
  }));
}

/* Rappel espacé d'une compétence de la piste : 3 questions, sans verrou ni mètre, puis reviewResult(). */
function _albRappel(id){
  const skill = _albSkill(id);
  if (!skill) return;
  setCtx('parcours', {title: 'Rappel · ' + skill.titre, count: '1 / 3'});
  app().dataset.density = 'outil';
  app().innerHTML = '<div class="view"><div id="alb-zone"></div></div>';
  let fini = false, faites = 0;
  window.vueCourante.garde = () => fini;
  window.vueCourante.enCours = true;
  surQuitter(ecouter('reponse', () => { faites++; const hc = $('head-count'); if (hc) hc.textContent = Math.min(faites + 1, 3) + ' / 3'; }));
  runSerie($('alb-zone'), skill, 3, {level: 2, adapt: false, mix: false, recordSkill: false, reprise: false, revision: true, indices: false}, r => {
    fini = true; window.vueCourante.garde = null; window.vueCourante.enCours = false;
    const ok = r.res.reduce((a, b) => a + b, 0);
    reviewResult(id, ok, r.res.length);
    toast(ok + ' sur ' + r.res.length + ' · ' + skill.titre, {tone: ok >= 2 ? 'ok' : 'warn', icon: 'clock-countdown'});
    vAlbert();
  });
}

/* ============================================================
   2. La leçon d'une compétence de la piste (squelette de vSkill, sans altitude ni phase)
   ============================================================ */
function vAlbertLecon(p){
  const id = (typeof p === 'string') ? p : (p && p.id);
  const skill = _albSkill(id);
  if (!skill){ nav('albert', {remplace: true}); return; }          // rechargement : les params sont perdus
  const x = _albFiche(id), e = _albEtat(id);
  const justes = (x.hist || []).slice(-10).reduce((a, b) => a + b, 0);
  const manque = Math.max(1, 9 - justes);
  const reste = x.mastered ? '' : (x.n < 12 ? 'Il te faut encore ' + fv(12 - x.n) + (12 - x.n > 1 ? ' réponses' : ' réponse') + ', dont 9 justes sur les 10 dernières.'
                                            : 'Encore ' + fv(manque) + (manque > 1 ? ' bonnes réponses' : ' bonne réponse') + ' sur les 10 dernières pour verrouiller.');
  setCtx('lecon', {parent: 'albert', title: skill.titre});
  const hote = app();
  hote.dataset.density = 'lecture';
  hote.innerHTML =
    '<div class="view alb-lecon"><div class="lecon-grid">' +
      '<nav class="toc" aria-label="Sommaire de la leçon" hidden><ul></ul></nav>' +
      '<article class="lecon">' +
        '<header class="lecon-head">' +
          '<p class="overline">Objectif Albert · ' + esc(_albTheme(skill.theme)) + '</p><h1>' + esc(skill.titre) + '</h1>' +
          (skill.objectif ? '<p class="body-l ink-2">' + esc(skill.objectif) + '</p>' : '') +
          '<p class="lecon-state"><span class="chip" data-tone="' + e.ton + '">' + esc(e.libelle) + '</span>' +
            (x.n ? crampons(x.hist, {courant: false}) + '<span class="num">' + fv(justes) + ' / 10</span>' : '') +
            (reste ? '<span class="small muted lecon-reste">' + esc(reste) + '</span>' : '') + '</p>' +
        '</header>' +
        '<div class="lecon-body">' + (skill.lecon || '<p class="muted">Leçon en préparation.</p>') + '</div>' +
        '<div class="lecon-cta" data-shown>' +
          '<button class="btn-primary lg" type="button" id="alb-exos"><span>Aux exercices</span><span class="meta num">série de 10</span>' +
            '<span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button>' +
        '</div>' +
      '</article></div></div>';
  window.espacesInsecables(document.querySelector('.lecon-body'));
  _albToc();
  $('alb-exos').addEventListener('click', () => {
    snd.click();
    const f = st(id); if (!f.lu){ f.lu = true; save(); }
    _albSerie(skill);
  });
}

/* Sommaire collant, desktop large seulement (≥ 1 080 px) : copie locale de la logique de la leçon du Sentier. */
function _albToc(){
  const nav_ = document.querySelector('.alb-lecon .toc'), liste = nav_ && nav_.querySelector('ul'), corps = document.querySelector('.alb-lecon .lecon-body');
  if (!nav_ || !liste || !corps || innerWidth < 1080) return;
  const cibles = Array.from(corps.querySelectorAll('.etapes > p > strong:first-child, p.box-t, h2, h3')).slice(0, 14);
  if (cibles.length < 3) return;
  cibles.forEach((el, i) => {
    const c = el.tagName === 'STRONG' ? el.parentNode : el;
    c.id = 'alb-toc-' + i;
    let t = (el.textContent || '').trim().replace(/[:.·]\s*$/, '');
    if (t.length > 38) t = t.slice(0, 36).trim() + '…';
    if (t) liste.insertAdjacentHTML('beforeend', '<li><a data-ancre="alb-toc-' + i + '" tabindex="0">' + esc(t) + '</a></li>');
  });
  nav_.hidden = false;
  const aller = a => { const el = document.getElementById(a.getAttribute('data-ancre')); if (el) el.scrollIntoView({block: 'start', behavior: 'smooth'}); };
  liste.addEventListener('click', ev => { const a = ev.target.closest('[data-ancre]'); if (a) aller(a); });
  liste.addEventListener('keydown', ev => { if (ev.key !== 'Enter' && ev.key !== ' ') return; const a = ev.target.closest('[data-ancre]'); if (a){ ev.preventDefault(); aller(a); } });
}

/* La série de 10 : même route, comme la série du Sentier. Jamais de « +N m » : hors SKILLS, une compétence vaut 0 m. */
function _albSerie(skill){
  const n = 10, tr = S.skills[skill.id] ? tauxRecent(skill.id) : null;
  setCtx('parcours', {title: skill.titre, count: '1 / ' + n});
  app().dataset.density = 'outil';
  app().innerHTML = '<div class="view"><div class="pbar" id="alb-p" style="--p:0"><i></i></div><div id="alb-zone"></div></div>';
  let fini = false, faites = 0;
  window.vueCourante.garde = () => fini;
  window.vueCourante.enCours = true;
  surQuitter(ecouter('reponse', () => {
    faites++;
    const b = $('alb-p'); if (b) b.style.setProperty('--p', String(Math.round(100 * Math.min(faites, n) / n)));
    const hc = $('head-count'); if (hc) hc.textContent = Math.min(faites + 1, n) + ' / ' + n;
  }));
  runSerie($('alb-zone'), skill, n, {
    level: (tr !== null && tr >= .8) ? 2 : 1, adapt: true, mix: false,
    onMastered: () => celebrer(4, {texte: 'Verrouillé à 90 %.'})
  }, r => {
    fini = true; window.vueCourante.enCours = false; window.vueCourante.garde = null;
    const ok = r.res.reduce((a, b) => a + b, 0), x = _albFiche(skill.id);
    setCtx('lecon', {parent: 'albert', title: skill.titre});
    const zone = $('alb-zone'); if (!zone) return;
    const pb = $('alb-p'); if (pb) pb.remove();
    zone.innerHTML = '<div class="fin-card" data-kind="serie"><p class="overline">Série terminée · Objectif Albert</p>' +
      '<h2>' + fv(ok) + ' sur ' + fv(r.res.length) + '</h2>' + crampons(x.hist, {courant: false}) +
      (x.mastered ? '<p class="k k-gold">Verrouillé à 90 %</p>' : '<p class="small muted">Verrou : 12 réponses, dont 9 justes sur les 10 dernières.</p>') +
      '<div class="row"><button class="btn-primary" type="button" id="alb-encore">Relancer une série</button>' +
      '<button class="btn" type="button" id="alb-retour">Revenir au hub</button></div></div>';
    try { snd.win(ok / (r.res.length || 1)); majAnneauJour(); } catch(e){}
    $('alb-encore').addEventListener('click', () => { snd.click(); _albSerie(skill); });
    $('alb-retour').addEventListener('click', () => { snd.click(); nav('albert'); });
    annoncer('Série terminée : ' + ok + ' sur ' + r.res.length + '.');
  });
}
