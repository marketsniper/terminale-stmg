/* ===== Maths · De zéro au sommet : le sentier et la leçon =====
   vProgramme() : les 52 compétences en corde verticale à nœuds, par phase.
   vSkill()     : la page leçon, la progression vers les 90 %, la série de 10.
   DESIGN-SPEC §6.16, §6.18, §7.2, §7.3 · PRODUCT-SPEC M9.
   Script classique : portée globale partagée. Symboles propres : vProgramme, vSkill.
   Tout le reste est préfixé _prog (aucun risque de collision avec un autre module). */
'use strict';

/* ---------- constantes de la vue ---------- */
const _progSEGS = [
  {id: 'skills', nom: 'Compétences'},
  {id: 'papier', nom: 'Papier'},
  {id: 'tech',   nom: 'Techniques'}
];
/* Niveau de série choisi dans la feuille « Options » : 0 = automatique. */
let _progNiveau = 0;

/* ---------- petits utilitaires ---------- */
/* Nom court de la phase, sans la parenthèse de niveau scolaire. */
function _progNomPhase(p){ return String((PHASES[p] && PHASES[p].nom) || '').replace(/\s*\([^)]*\)\s*$/, ''); }
/* Titre de section : « Vers le Camp 2 · Collège complet ». */
function _progTitrePhase(p){
  const camp = (PHASES[p] && PHASES[p].camp) || '';
  return (camp === 'Sommet' ? 'Vers le Sommet' : 'Vers le ' + camp) + ' · ' + _progNomPhase(p);
}
/* Ce qu'il reste à faire pour verrouiller, en clair (DESIGN-SPEC §6.16). */
function _progReste(id){
  const s = st(id);
  if (s.mastered) return '';
  if (s.n < 12){ const r = 12 - s.n; return 'il te faut ' + fv(r) + (r > 1 ? ' réponses' : ' réponse'); }
  const justes = s.hist.slice(-10).reduce((a, b) => a + b, 0);
  const r = Math.max(0, 9 - justes);
  if (r === 0) return 'encore une bonne réponse';
  return 'encore ' + fv(r) + ' bonnes réponses';
}
/* Mètres acquis sur la compétence, sur le total qu'elle vaut. */
function _progMetres(id){
  const a = Math.round((window.metres ? window.metres(id) : 0));
  const b = Math.round((window.mSkill ? window.mSkill(id) : 0));
  return b ? fv(a) + ' / ' + nf(b, 'm') : '';
}
/* Ton de la pastille d'état (DESIGN-SPEC §6.11). */
function _progTon(nm){
  if (nm.provisoire) return 'gold';
  if (nm.fragile) return 'warn';
  if (nm.cle === 'consolide' || nm.cle === 'verrouille') return 'ok';
  if (nm.cle === 'encours') return 'gold';
  return 'muted';
}
/* Pastille d'état d'une compétence. */
function _progChip(id){
  const nm = niveauMaitrise(id);
  return '<span class="chip" data-tone="' + _progTon(nm) + '">' + esc(nm.libelle) + '</span>';
}
/* Crampons miniatures : les 10 dernières réponses, version colonne d'état. */
function _progCrampons(id){
  const h = st(id).hist.slice(-10);
  const cases = h.map(v => v ? 'ok' : 'ko');
  const reussies = cases.filter(c => c === 'ok').length;
  if (cases.length < 10) cases.push('cur');
  while (cases.length < 10) cases.push('');
  return '<span class="serie-bar crampons mini" role="img" aria-label="' +
    reussies + ' réussies sur les dix dernières">' +
    cases.map(c => '<i class="' + c + '"></i>').join('') + '</span>';
}
/* Date du prochain rappel espacé (PRODUCT-SPEC M9). */
function _progRappel(id){
  const s = st(id);
  if (!s.mastered || !s.due) return '';
  const j = Math.round((s.due - Date.now()) / JOUR);
  if (j <= 0) return 'Rappel à faire aujourd’hui';
  if (j === 1) return 'Prochain rappel : demain';
  return 'Prochain rappel : dans ' + fv(j) + ' jours';
}
/* Historique des rappels : « 2 j ✓ · 4 j ✓ · 8 j ✗ ». */
function _progHistoRappels(id){
  const rev = (st(id).rev || []).slice(-6);
  if (!rev.length) return '';
  return rev.map(r => {
    const ok = r.n ? (r.ok / r.n) >= .7 : false;
    return nf(r.int || 2, 'j') + ' ' + ic(ok ? 'check' : 'x');
  }).join(' · ');
}
/* Célèbre les jalons franchis depuis la dernière vérification. */
function _progJalons(){
  let neufs = [];
  try { neufs = (typeof window.verifierJalons === 'function') ? (window.verifierJalons() || []) : []; } catch(e){ neufs = []; }
  neufs.forEach(j => {
    if (j.niveau >= 5) celebrer(5, {kind: j.type === 'camp' ? 'camp' : 'jalon',
      overline: j.type === 'camp' ? 'Camp atteint' : 'Jalon franchi',
      titre: j.texte, alt: fv(altitude()), medaille: 'flag', bouton: 'Continuer'});
    else celebrer(j.niveau || 3, {texte: j.texte, tone: 'gold', icon: 'flag'});
  });
}
/* Succès obtenus à la lumière d'un événement. */
function _progSucces(evt){
  let neufs = [];
  try { neufs = verifierSucces(evt) || []; } catch(e){ neufs = []; }
  neufs.forEach(s => celebrer(3, {texte: 'Succès : ' + s.nom + '.', tone: 'gold', icon: s.ic || 'trophy'}));
}

/* ============================================================
   vProgramme : le sentier (DESIGN-SPEC §7.2)
   ============================================================ */
function vProgramme(p){
  const par = p || {};
  let seg = par.seg || (S.meta && S.meta.sentier) || 'skills';
  if (!_progSEGS.some(x => x.id === seg)) seg = 'skills';
  if (S.meta.sentier !== seg){ S.meta.sentier = seg; save(); }

  setCtx('outil');
  const hote = app();
  hote.dataset.density = 'outil';
  hote.innerHTML =
    '<div class="view">' +
      '<header>' +
        '<h1>Le sentier</h1>' +
        '<p class="small muted">7 camps · ' + fv(SKILLS.length) + ' compétences · règle des 90 %</p>' +
      '</header>' +
      '<div class="segment" id="seg-sentier" role="group" aria-label="Vue du sentier">' +
        _progSEGS.map(x =>
          '<label><input type="radio" name="seg-sentier" value="' + x.id + '"' +
          (x.id === seg ? ' checked' : '') + '><span>' + esc(x.nom) + '</span></label>').join('') +
      '</div>' +
      '<div id="sentier-zone"></div>' +
      '<p id="lock-help" class="sr-only">Cette phase s’ouvre quand la précédente est acquise. Sa leçon reste lisible.</p>' +
    '</div>';

  const zone = $('sentier-zone');
  zone.addEventListener('click', e => {
    const bt = e.target.closest ? e.target.closest('[data-id],[data-pap],[data-fam],[data-camp]') : null;
    if (!bt) return;
    snd.click();
    if (bt.dataset.camp){ if (typeof window.vBilanAltitude === 'function') nav('bilan', {phase: Number(bt.dataset.camp)}); return; }
    if (bt.dataset.pap){ nav('papierEx', {id: bt.dataset.pap}); return; }
    if (bt.dataset.fam){ nav('technique', {id: bt.dataset.fam}); return; }
    nav('skill', {id: bt.dataset.id});
  });

  $('seg-sentier').addEventListener('change', e => {
    const v = e.target && e.target.value;
    if (!v) return;
    snd.click();
    S.meta.sentier = v; save();
    _progZone(v);
  });

  _progZone(seg);
}

/* Remplit la zone selon le segment choisi. Papier et Techniques sont rendus
   par leur propre fichier (vues/papier.js, vues/calcul-mental.js). */
function _progZone(seg){
  const zone = $('sentier-zone');
  if (!zone) return;
  if (seg === 'papier'){
    if (typeof window.PAP_LISTE === 'function') window.PAP_LISTE(zone);
    else zone.innerHTML = vide({icone: 'pencil-line', titre: 'Le papier arrive.', texte: 'Reviens aux compétences en attendant.'});
    return;
  }
  if (seg === 'tech'){
    if (typeof window.TECH_GRILLE === 'function') window.TECH_GRILLE(zone);
    else zone.innerHTML = vide({icone: 'lightning', titre: 'Les techniques arrivent.', texte: 'Reviens aux compétences en attendant.'});
    return;
  }
  _progSentier(zone);
}

/* La corde des 52 compétences, phase par phase. */
function _progSentier(zone){
  const f = frontier();
  let html = '';

  /* 1. Continuer ici : la frontière, en tête. */
  if (f){
    html +=
      '<div class="card card-accent">' +
        '<p class="k k-gold">Continuer ici</p>' +
        '<h2>' + esc(f.titre) + '</h2>' +
        '<p class="small">' + esc(_progNomPhase(f.phase)) + ' · ' + esc(_progReste(f.id)) + '</p>' +
        crampons(st(f.id).hist, {}) +
        '<div class="row"><button class="btn-primary sm" type="button" data-id="' + esc(f.id) + '">' +
          '<span>Reprendre la compétence</span><span class="ic-wrap">' + ic('flag-banner', 'ic-20') + '</span>' +
        '</button></div>' +
      '</div>';
  } else {
    html += '<div class="card"><p class="k k-gold">Sommet</p><h2>Tout est acquis.</h2>' +
      '<p class="small muted">Il reste les rappels, les annales et le papier pour entretenir.</p></div>';
  }

  /* 2. Les sept phases. */
  const paps = window.PAPIERS_TRIES || [];
  for (let p = 1; p <= 7; p++){
    const liste = SKILLS.filter(s => s.phase === p);
    if (!liste.length) continue;
    const done = liste.filter(s => st(s.id).mastered).length;
    const ouverte = phaseUnlocked(p);
    const pct = Math.round(100 * done / liste.length);
    const courante = f ? f.phase : 7;
    const deplie = (p === courante) || (p === courante - 1);
    const neuves = liste.filter(s => st(s.id).n === 0).length;
    const testCamp = ouverte && neuves >= 4 && typeof window.vBilanAltitude === 'function';

    html +=
      '<details class="phase' + (ouverte ? '' : ' locked') + (done === liste.length ? ' done' : '') +
        '" data-phase="' + p + '" style="--tint:var(--tint-' + p + ')"' + (deplie ? ' open' : '') + '>' +
        '<summary class="phase-head">' +
          ringSVG({val: done, max: liste.length, taille: 20, texte: false,
                   libelle: fv(done) + ' compétences sur ' + fv(liste.length)}) +
          '<h2>' + esc(_progTitrePhase(p)) + '</h2>' +
          '<span class="etat num">' + fv(done) + ' / ' + fv(liste.length) + '</span>' +
          (testCamp ? '<button class="btn sm" type="button" data-camp="' + p + '">Passer le test</button>' : '') +
          ic('caret-right', 'caret') +
        '</summary>' +
        '<div class="pbar" style="--p:' + pct + '"><i></i></div>' +
        '<div class="skills">' +
          '<svg class="rope-line" aria-hidden="true" focusable="false"><line x1="11" y1="0" x2="11" y2="100%"/></svg>' +
          liste.map(s => _progLigne(s, f, ouverte)).join('') +
          paps.filter(x => x.phase === p).map((x, i) => _progLignePapier(x, i + 1)).join('') +
        '</div>' +
        (p >= 6 ? '<p class="small phase-note">Les derniers mètres sont les plus raides.</p>' : '') +
      '</details>';
  }
  zone.innerHTML = html;
}

/* Une ligne de compétence : nœud, numéro, titre, état, sous-ligne. */
function _progLigne(s, f, ouverte){
  const x = st(s.id), nm = niveauMaitrise(s.id);
  const estFront = !!(f && f.id === s.id);
  const bloquee = !ouverte && x.n === 0;

  const cls = ['skill'];
  if (x.mastered) cls.push('done');
  if (nm.cle === 'consolide') cls.push('consolide');
  if (x.provisoire) cls.push('provisoire');
  if (x.fragile) cls.push('fragile');
  if (estFront) cls.push('frontier');
  if (bloquee) cls.push('locked');

  let etat = '';
  if (bloquee) etat = ic('circle-dashed');
  else if (x.provisoire) etat = '<span class="chip" data-tone="gold">À confirmer</span>';
  else if (x.fragile) etat = ic('warning-circle');
  else if (nm.cle === 'consolide') etat = ic('seal-check');
  else if (x.mastered) etat = ic('lock-simple');
  else if (estFront || x.n > 0) etat = _progCrampons(s.id);

  const sub = estFront
    ? '<span class="sub small muted">' + esc(_progReste(s.id)) + ' · ' + _progMetres(s.id) + '</span>'
    : '';

  return '<button class="' + cls.join(' ') + '" type="button" data-id="' + esc(s.id) + '"' +
    (bloquee ? ' aria-describedby="lock-help"' : '') + '>' +
    '<span class="node" aria-hidden="true"></span>' +
    '<span class="num">' + fv(s.phase) + '.' + fv(s.ordre) + '</span>' +
    '<span class="t">' + esc(s.titre) + '</span>' +
    '<span class="etat">' + etat + '</span>' + sub +
  '</button>';
}

/* Un nœud carré : l'exercice papier de la phase. La durée n'usurpe plus le numéro. */
function _progLignePapier(x, n){
  const f = (S.papier || {})[x.id];
  const etat = f ? fv(Math.round(f.score * 100)) + ' %' : 'à faire';
  return '<button class="skill paper" type="button" data-pap="' + esc(x.id) + '">' +
    '<span class="node" aria-hidden="true"></span>' +
    '<span class="num">P.' + fv(n) + '</span>' +
    '<span class="t">Papier · ' + esc(x.titre) + '</span>' +
    '<span class="etat num">' + esc(etat) + '</span>' +
    '<span class="sub small muted">' + nf(x.duree, 'min') + ' sur feuille</span>' +
  '</button>';
}

/* ============================================================
   vSkill : la leçon (DESIGN-SPEC §6.18, §7.3)
   ============================================================ */
function vSkill(p){
  const id = (typeof p === 'string') ? p : (p && p.id);
  const skill = SKILLS.find(s => s.id === id);
  if (!skill){ nav('programme'); return; }

  const x = st(id), nm = niveauMaitrise(id), ouverte = phaseUnlocked(skill.phase);
  const camp = (PHASES[skill.phase] && PHASES[skill.phase].camp) || '';
  const rappel = _progRappel(id);
  const histo = _progHistoRappels(id);
  const reste = _progReste(id);
  const justes = x.hist.slice(-10).reduce((a, b) => a + b, 0);

  setCtx('lecon', {parent: 'programme', title: skill.titre});
  const hote = app();
  hote.dataset.density = 'lecture';

  hote.innerHTML =
  '<div class="view">' +
    '<div class="lecon-grid">' +
      '<nav class="toc" aria-label="Sommaire de la leçon"><ul></ul></nav>' +
      '<article class="lecon">' +
        '<header class="lecon-head">' +
          '<p class="overline">' + esc(camp) + ' · ' + esc(_progNomPhase(skill.phase)) + '</p>' +
          '<h1>' + esc(skill.titre) + '</h1>' +
          (skill.objectif ? '<p class="body-l ink-2">' + esc(skill.objectif) + '</p>' : '') +
          '<p class="lecon-state">' + _progChip(id) +
            (x.n > 0 ? _progCrampons(id) + '<span class="num">' + fv(justes) + ' / 10</span>' : '') +
            (reste ? '<span class="small muted">· ' + esc(reste) + '</span>' : '') +
          '</p>' +
          (rappel ? '<p class="small muted">' + ic('clock-countdown') + ' ' + esc(rappel) + '</p>' : '') +
          (histo ? '<p class="small muted">Rappels : ' + histo + '</p>' : '') +
          (x.lu ? '<p><button class="btn btn-ghost sm" type="button" id="btn-replier">Réduire la leçon</button></p>' : '') +
        '</header>' +
        '<div class="lecon-body">' + (skill.lecon || '<p class="muted">Leçon en préparation.</p>') + '</div>' +
        (ouverte
          ? '<div class="lecon-cta">' +
              '<button class="btn-primary lg" type="button" id="btn-exos">' +
                '<span>Aux exercices</span><span class="meta num">série de 10</span>' +
                '<span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span>' +
              '</button>' +
              '<button class="btn btn-ghost" type="button" id="btn-options">Choisir le niveau</button>' +
            '</div>'
          : '<div class="card card-muted">' +
              '<p class="k">Plus haut sur le sentier</p>' +
              '<h2>Cette phase n’est pas ouverte.</h2>' +
              '<p class="small muted">Elle s’ouvre quand la phase précédente est entièrement acquise. ' +
                'La leçon, elle, reste lisible autant que tu veux.</p>' +
              '<div class="row"><button class="btn" type="button" id="btn-front">Aller à la frontière</button></div>' +
            '</div>') +
      '</article>' +
    '</div>' +
  '</div>';

  const bRepl = $('btn-replier');
  if (bRepl) bRepl.addEventListener('click', () => {
    snd.click();
    const corps = document.querySelector('.lecon-body');
    if (!corps) return;
    const replie = corps.hasAttribute('data-collapsed');
    if (replie) corps.removeAttribute('data-collapsed'); else corps.setAttribute('data-collapsed', '');
    bRepl.textContent = replie ? 'Réduire la leçon' : 'Déplier la leçon';
  });

  const bFront = $('btn-front');
  if (bFront) bFront.addEventListener('click', () => {
    snd.click();
    const f = frontier();
    if (f) nav('skill', {id: f.id}); else nav('programme');
  });

  const bOpt = $('btn-options');
  if (bOpt) bOpt.addEventListener('click', () => { snd.click(); _progFeuilleNiveau(); });

  const bExos = $('btn-exos');
  if (bExos) bExos.addEventListener('click', () => {
    snd.click();
    if (!x.lu){ x.lu = true; save(); }      /* lu : seulement si la leçon a été ouverte puis quittée */
    _progSerie(skill);
  });

  _progRevelerCta();
  _progToc();
}

/* Le CTA collant apparaît après 40 % de défilement, ou tout de suite si la leçon tient. */
function _progRevelerCta(){
  const cta = document.querySelector('.lecon-cta');
  const corps = document.querySelector('.lecon-body');
  if (!cta || !corps) return;
  const montrer = () => { cta.setAttribute('data-shown', ''); };
  if (corps.getBoundingClientRect().height < innerHeight * .9 || !window.IntersectionObserver){ montrer(); return; }
  const kids = Array.from(corps.children);
  const marque = document.createElement('div');
  marque.setAttribute('aria-hidden', 'true');
  corps.insertBefore(marque, kids[Math.floor(kids.length * .4)] || null);
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)){ montrer(); io.disconnect(); } });
  io.observe(marque);
  surQuitter(() => io.disconnect());
}

/* Sommaire collant, desktop large seulement (≥ 1 080 px). */
function _progToc(){
  const nav_ = document.querySelector('.toc');
  const liste = document.querySelector('.toc ul');
  const corps = document.querySelector('.lecon-body');
  if (!nav_ || !liste || !corps) return;
  if (innerWidth < 1080){ nav_.hidden = true; return; }

  const cibles = Array.from(corps.querySelectorAll('.etapes > p > strong:first-child, p.box-t, h2, h3'));
  if (cibles.length < 3){ nav_.hidden = true; return; }
  const ancres = [];
  cibles.slice(0, 14).forEach((el, i) => {
    const cible = (el.tagName === 'STRONG') ? el.parentNode : el;
    const cle = 'toc-' + i;
    cible.id = cle;
    let t = (el.textContent || '').trim().replace(/[:.·]\s*$/, '');
    if (t.length > 38) t = t.slice(0, 36).trim() + '…';
    if (!t) return;
    ancres.push(cible);
    liste.insertAdjacentHTML('beforeend',
      '<li><a data-ancre="' + cle + '" tabindex="0">' + esc(t) + '</a></li>');
  });
  if (!ancres.length){ nav_.hidden = true; return; }

  const aller = a => {
    const el = document.getElementById(a.getAttribute('data-ancre'));
    if (el) el.scrollIntoView({block: 'start', behavior: 'smooth'});
  };
  liste.addEventListener('click', e => { const a = e.target.closest('[data-ancre]'); if (a) aller(a); });
  liste.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const a = e.target.closest('[data-ancre]');
    if (a){ e.preventDefault(); aller(a); }
  });

  if (!window.IntersectionObserver) return;
  const io = new IntersectionObserver(es => {
    es.forEach(en => {
      if (!en.isIntersecting) return;
      liste.querySelectorAll('[data-ancre]').forEach(a =>
        a.toggleAttribute('aria-current', a.getAttribute('data-ancre') === en.target.id));
    });
  }, {rootMargin: '-20% 0px -70% 0px'});
  ancres.forEach(el => io.observe(el));
  surQuitter(() => io.disconnect());
}

/* Feuille « Choisir le niveau » : jamais un select posé dans la page. */
function _progFeuilleNiveau(){
  const opts = [[0, 'Automatique'], [1, 'Découverte'], [2, 'Maîtrise'], [3, 'Expert']];
  const contenu = '<div class="stack">' + opts.map(o =>
    '<label class="switch"><input type="radio" name="niv-serie" value="' + o[0] + '"' +
    (_progNiveau === o[0] ? ' checked' : '') + '><span class="track"><span class="thumb"></span></span>' +
    '<span class="switch-t">' + o[1] + '</span></label>').join('') +
    '<p class="small muted">En automatique, le niveau monte après trois bonnes réponses d’affilée et redescend après une erreur.</p></div>';
  ouvrirFeuille({
    titre: 'Le niveau de la série',
    contenu: contenu,
    boutons: [{label: 'Annuler'}, {label: 'Garder ce niveau', style: 'primaire'}],
    apres(dlg){
      dlg.querySelectorAll('[name="niv-serie"]').forEach(r =>
        r.addEventListener('change', () => { _progNiveau = Number(r.value) || 0; }));
    }
  });
}

/* ============================================================
   La série de 10 : elle s'ouvre à la place de la leçon
   ============================================================ */
function _progSerie(skill){
  const n = 10;
  const tr = tauxRecent(skill.id);
  const auto = _progNiveau === 0;
  const lvl = auto ? ((tr !== null && tr >= .8) ? 2 : 1) : _progNiveau;

  setCtx('parcours', {title: skill.titre, count: '1 / ' + n});
  const hote = app();
  hote.dataset.density = 'lecture';
  hote.innerHTML =
    '<div class="view">' +
      '<div class="pbar" id="serie-p" style="--p:0"><i></i></div>' +
      '<div id="serie-zone"></div>' +
    '</div>';

  let fini = false, faites = 0;
  window.vueCourante.garde = () => fini;
  window.vueCourante.enCours = true;

  const off = ecouter('reponse', () => {
    faites++;
    const b = $('serie-p');
    if (b) b.style.setProperty('--p', String(Math.round(100 * Math.min(faites, n) / n)));
    const hc = document.getElementById('head-count');
    if (hc) hc.textContent = Math.min(faites + 1, n) + ' / ' + n;
  });
  surQuitter(off);

  runSerie($('serie-zone'), skill, n, {
    level: lvl, adapt: auto, mix: true,
    onMastered: () => { celebrer(4, {texte: 'Verrouillé à 90 %.'}); _progJalons(); }
  }, r => {
    fini = true;
    window.vueCourante.enCours = false;
    window.vueCourante.garde = null;
    _progFinSerie(skill, r.res);
  });
}

function _progFinSerie(skill, res){
  const okN = res.reduce((a, b) => a + b, 0);
  const total = res.length || 1;
  const taux = okN / total;
  const s = st(skill.id);
  const nm = niveauMaitrise(skill.id);

  _progJalons();
  _progSucces({type: 'serie-fin', n: total, ok: okN, deja: false});

  const msg = s.mastered && !s.fragile
    ? 'Compétence acquise. Elle reviendra en rappel pour rester en place.'
    : taux >= .8 ? 'Encore une série comme celle-ci et c’est verrouillé.'
    : taux >= .5 ? 'Ça progresse. Relis la leçon là où ça a coincé, puis on y retourne.'
    : 'Reprends la leçon tranquillement, puis une série en Découverte. C’est le chemin normal.';

  setCtx('lecon', {parent: 'programme', title: skill.titre});
  const zone = $('serie-zone');
  if (!zone) return;
  zone.innerHTML =
    '<div class="fin-card" data-kind="serie">' +
      '<p class="overline">Série terminée</p>' +
      '<h2>' + fv(okN) + ' sur ' + fv(total) + '</h2>' +
      crampons(s.hist, {courant: false}) +
      (s.mastered && !s.fragile ? '<p class="k k-gold">Verrouillé à 90 %</p>' : '') +
      '<p class="msg">' + esc(msg) + '</p>' +
      '<div class="figures">' +
        '<div class="figure"><b>' + esc(nm.libelle) + '</b><span class="k">État</span></div>' +
        '<div class="figure"><b>' + _progMetres(skill.id) + '</b><span class="k">Sur cette marche</span></div>' +
        '<div class="figure"><b>' + nf(altitude(), 'm') + '</b><span class="k">Altitude</span></div>' +
      '</div>' +
      '<div class="row">' +
        '<button class="btn-primary" type="button" id="fin-encore">Relancer une série</button>' +
        '<button class="btn" type="button" id="fin-retour">Revenir au sentier</button>' +
      '</div>' +
    '</div>';
  snd.win(taux);
  majCrete();
  majAnneauJour();
  $('fin-encore').addEventListener('click', () => { snd.click(); _progSerie(skill); });
  $('fin-retour').addEventListener('click', () => { snd.click(); nav('programme'); });
}
