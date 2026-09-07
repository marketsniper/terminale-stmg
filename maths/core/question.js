/* ===== Maths · De zéro au sommet — carte question et séries =====
   askQuestion (DESIGN-SPEC §6.12 · PRODUCT-SPEC M8), genFor, runSerie,
   crampons, touchesRapides.
   Script classique : portée globale partagée (ordre de chargement dans index.html). */
'use strict';

let qSeq = 0;

/* ------------------------------------------------------------
   Utilitaires internes (préfixés : ils n'appartiennent qu'à ce fichier)
   ------------------------------------------------------------ */
const _qNiveaux = {1: 'Découverte', 2: 'Maîtrise', 3: 'Expert'};
const _qJustes = ['Exact.', 'Oui.', 'Juste.', 'Propre.'];

function _qEsc(s){ return (typeof esc === 'function') ? esc(s) : String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function _qIc(nom, taille){ return '<svg class="ic ic-' + (taille || 20) + '" aria-hidden="true" focusable="false"><use href="#i-' + nom + '"/></svg>'; }
function _qFv(v){ try { return (typeof fv === 'function') ? fv(v) : String(v); } catch(e){ return String(v); } }
function _qSon(nom, arg){ try { if (window.snd && typeof snd[nom] === 'function') snd[nom](arg); } catch(e){} }
function _qSt(id){ try { return id ? st(id) : null; } catch(e){ return null; } }
function _qPrefs(){ try { return (typeof S !== 'undefined' && S.prefs) || {}; } catch(e){ return {}; } }
function _qReduit(){
  if (document.documentElement.dataset.motion === 'reduit') return true;
  try { if (typeof REDUCE !== 'undefined' && REDUCE) return true; } catch(e){}
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Opérateurs typographiques : × − ÷ dans l'énoncé quand ce sont bien des opérateurs.
   Le « / » n'est jamais touché quand la réponse attendue est une fraction. */
function _qMath(html, ex){
  let s = html;
  s = s.replace(/(\d)\s*[x*]\s*(\d)/g, '$1 × $2');
  s = s.replace(/(\d)\s*-\s*(\d)/g, '$1 − $2');
  const aFraction = ex && typeof ex.a === 'string' && ex.a.indexOf('/') >= 0;
  if (!aFraction) s = s.replace(/(\d)\s*\/\s*(\d)/g, '$1 ÷ $2');
  return s;
}

/* Pseudo-listes « - » du contenu converties en <ul class="q-list">. */
function _qEnonce(texte, ex){
  const lignes = String(texte == null ? '' : texte).split('\n');
  let html = '', tampon = [], liste = [];
  const viderTampon = () => { if (tampon.length){ html += _qMath(_qEsc(tampon.join('\n')), ex) + '\n'; tampon = []; } };
  const viderListe = () => {
    if (liste.length){
      html += '<ul class="q-list">' + liste.map(x => '<li>' + _qMath(_qEsc(x), ex) + '</li>').join('') + '</ul>';
      liste = [];
    }
  };
  lignes.forEach(l => {
    const m = /^\s*[-–]\s+(.*)$/.exec(l);
    if (m){ viderTampon(); liste.push(m[1]); }
    else { viderListe(); tampon.push(l); }
  });
  viderListe(); viderTampon();
  /* fractions annoncées aux lecteurs d'écran (PRODUCT-SPEC M14) */
  html = html.replace(/(^|[\s(>])(\d{1,3})\/(\d{1,3})(?=$|[\s).,<])/g,
    (t, av, a, b) => av + '<span role="math" aria-label="' + a + ' sur ' + b + '">' + a + '/' + b + '</span>');
  return html.replace(/\n+$/, '');
}

/* inputmode : « decimal » quand la réponse attendue n'est faite que de chiffres,
   virgule, point et signe ; « text » sinon (fractions, littéral). C'est ce détail
   qui rendait la saisie pénible sur iPhone. */
function _qInputmode(ex){
  const morceaux = [ex.a].concat(Array.isArray(ex.accept) ? ex.accept : (ex.accept ? [ex.accept] : []));
  const numerique = morceaux.every(v => v == null || /^[\s\d.,+\-−]*$/.test(String(v)));
  return numerique ? 'decimal' : 'text';
}

/* Première étape d'une explication : première phrase, la réponse masquée. */
function _qPremiereEtape(ex){
  const t = String((ex && ex.expl) || '').trim();
  if (!t) return '';
  let phrase = t;
  const i = t.indexOf('. ');
  if (i >= 24) phrase = t.slice(0, i + 1);
  if (ex.a) phrase = phrase.split(String(ex.a)).join('…');
  return phrase;
}

/* Astuce de la leçon (palier 1). */
function _qAstuce(opts){
  if (opts.indice1) return opts.indice1;
  const ex = opts.ex;
  if (ex && Array.isArray(ex.indices) && ex.indices[0]) return ex.indices[0];
  const skill = opts.skill || (opts.skillId && window.SKILLS ? SKILLS.find(s => s.id === opts.skillId) : null);
  if (skill){
    if (skill._astuce) return skill._astuce;
    const src = String(skill.lecon || '');
    if (src){
      const d = document.createElement('div');
      d.innerHTML = src;
      const boite = d.querySelector('.box.astuce p:not(.box-t)') || d.querySelector('.box p:not(.box-t)');
      if (boite && boite.textContent.trim()){ skill._astuce = boite.textContent.trim(); return skill._astuce; }
    }
  }
  return 'Relis l\'énoncé et note ce qu\'on te demande.';
}

/* ------------------------------------------------------------
   Crampons : les 10 dernières réponses de la compétence (§6.12)
   ------------------------------------------------------------ */
function crampons(source, o){
  const c = o || {};
  let cases = [];
  if (Array.isArray(source) && source.length && typeof source[0] === 'object'){
    cases = source.slice(-10);
  } else {
    const h = Array.isArray(source) ? source.slice(-10) : [];
    cases = h.map(v => ({cls: v ? 'ok' : 'ko'}));
  }
  if (c.courant !== false && cases.length < 10) cases.push({cls: 'cur'});
  while (cases.length < 10) cases.push({cls: ''});
  const reussies = cases.filter(x => x.cls === 'ok').length;
  const total = cases.filter(x => x.cls === 'ok' || x.cls === 'ko').length;
  const libelle = c.libelle || (reussies + ' réussies sur les ' + (total || 10) + ' dernières');
  const reste = Math.max(0, 9 - reussies);
  return '<div class="serie-bar crampons" role="progressbar" aria-valuenow="' + reussies +
    '" aria-valuemin="0" aria-valuemax="10" aria-valuetext="' + _qEsc(libelle) + '"' +
    ' title="' + _qEsc(libelle + (c.titreSuite === false ? '' : ' · encore ' + reste)) + '">' +
    cases.map(x => '<i class="' + (x.cls || '') + '"></i>').join('') + '</div>';
}

/* ------------------------------------------------------------
   Barre de touches rapides (44 px, écrans tactiles)
   ------------------------------------------------------------ */
function touchesRapides(){
  const touches = ['−', '/', ',', 'x', '²', '%', '√'];
  return '<div class="quickkeys" aria-label="Touches rapides">' +
    touches.map(k => '<button type="button" data-k="' + _qEsc(k) + '" aria-label="Insérer ' + _qEsc(k) + '">' + _qEsc(k) + '</button>').join('') +
    '</div>';
}

/* ------------------------------------------------------------
   Générateur d'exercice, tolérant aux pannes de contenu
   ------------------------------------------------------------ */
function genFor(skill, level){
  try {
    const ex = skill.gen(level, R);
    if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string') throw 0;
    return ex;
  } catch(e){
    return {q: 'Cet exercice n\'est pas disponible. Passe au suivant.', a: '0', accept: null, choix: null, expl: ''};
  }
}

/* ============================================================
   askQuestion : la carte question (DESIGN-SPEC §6.12)
   opts : {ex, tag, overline, lvl, count, chrono, skillId, famId, skill,
           hint, indices, indice1, reprise, variante, skip, differe,
           cibleMs, sansType, prof, serie, recall, gain, valeurRep, _var}
   cb   : {ok, ms, given, ex, type, aide, variante, skipped}
   ============================================================ */
function askQuestion(box, opts, cb){
  const o = opts || {}, ex = o.ex, myId = ++qSeq;
  const varianteN = o._var || 0;
  const modeQcm = !!(ex && ex.choix && ex.choix.length);
  const differe = !!o.differe;
  const avecChrono = o.chrono !== false && !differe;
  const stSkill = _qSt(o.skillId);
  const prefs = _qPrefs();

  /* indices : jamais en évaluation, jamais quand la compétence est déjà à 80 % */
  let indicesOk = o.indices !== false && prefs.indices !== false && !differe && !varianteN;
  if (indicesOk && o.skillId){
    try { const t = tauxRecent(o.skillId); if (t !== null && t >= 0.8) indicesOk = false; } catch(e){}
  }

  const cramponsHtml = o.serie === false ? ''
    : crampons(o.serie || (stSkill ? stSkill.hist : []), {libelle: o.cramponsLibelle});

  const inputmode = modeQcm ? '' : _qInputmode(ex);
  const lettres = 'ABCD';
  const choix = modeQcm ? R.shuffle(ex.choix).slice(0, 4) : [];

  box.innerHTML =
  '<article class="exo-card q-card" data-mode="' + (modeQcm ? 'qcm' : 'input') + '" aria-labelledby="q-' + myId + '">' +
    (o.overline ? '<p class="k">' + _qEsc(o.overline) + '</p>' : '') +
    '<header class="exo-top q-head">' +
      (o.tag ? '<span class="tag' + (o.mix ? ' mix' : '') + '">' + _qEsc(o.tag) + '</span>' : '') +
      (o.lvl ? '<span class="lvl label">niv. ' + _qEsc(_qNiveaux[o.lvl] || o.lvl) + '</span>' : '') +
      (avecChrono ? '<span class="chrono num" data-ch>0,0 s</span>' : '') +
      (o.count ? '<span class="count num">' + _qEsc(o.count) + '</span>' : '') +
    '</header>' +
    cramponsHtml +
    '<p class="qtext" id="q-' + myId + '">' + _qEnonce(ex.q, ex) + '</p>' +
    (o.hint ? '<p class="hint-line">' + _qIc('lightbulb', 20) + '<span>' + _qEsc(o.hint) + '</span></p>' : '') +
    (o.cibleMs ? '<p class="goal small muted">Objectif sur cette famille : ' + _qEsc((o.cibleMs / 1000).toFixed(1).replace('.', ',')) + ' s</p>' : '') +
    '<div class="q-zone" data-zone>' +
      (modeQcm
        ? '<div class="opts" role="group" aria-label="Réponses">' + choix.map((c, i) =>
            '<button class="opt" type="button" data-c="' + _qEsc(c) + '"><span class="letter num">' + lettres[i] +
            '</span><span class="opt-txt">' + _qEsc(c) + '</span><kbd>' + (i + 1) + '</kbd></button>').join('') + '</div>'
        : '<form class="answer-row" autocomplete="off">' +
            '<button class="btn btn-ghost q-hint" type="button" data-hint' + (indicesOk ? '' : ' hidden') + '>' +
              _qIc('lightbulb', 20) + '<span>Indice</span></button>' +
            '<input type="text" inputmode="' + inputmode + '" enterkeyhint="done" autocorrect="off" spellcheck="false" placeholder="Ta réponse" aria-label="Réponse">' +
            '<button class="btn-primary sm" type="submit" data-role="validate"><span>' + (differe ? 'Suivante' : 'Valider') +
              '</span><span class="ic-wrap">' + _qIc(differe ? 'arrow-right' : 'check', 20) + '</span></button>' +
          '</form>') +
      '<div class="q-hints" data-hints hidden></div>' +
      (o.skip ? '<button class="btn btn-ghost q-skip" type="button" data-skip>Je ne sais pas</button>' : '') +
      (modeQcm ? '' : touchesRapides()) +
    '</div>' +
    '<div class="q-fb" data-fb></div>' +
  '</article>';

  const carte = box.querySelector('.q-card');
  const zone = box.querySelector('[data-zone]');
  const fb = box.querySelector('[data-fb]');
  const t0 = performance.now();
  let aide = 0, typeErr = '', repondu = false, chEl = box.querySelector('[data-ch]');

  window.ASSIST_CTX = {ex: ex, skillId: o.skillId || null, famId: o.famId || null, level: o.lvl || null,
                       aide: 0, repondu: false, juste: false, donnee: '', variante: varianteN};

  /* ---------- chrono (registre de minuteries : plus de chrono fantôme) ---------- */
  if (avecChrono && chEl){
    every(100, () => {
      if (repondu || qSeq !== myId) return;
      const s = (performance.now() - t0) / 1000;
      chEl.textContent = s.toFixed(1).replace('.', ',') + ' s';
      chEl.classList.toggle('warn', s >= 4 && s < 8);
      chEl.classList.toggle('late', s >= 8);
    });
  }

  /* ---------- indices progressifs (PRODUCT-SPEC M8) ---------- */
  const btnIndice = box.querySelector('[data-hint]');
  const boiteIndices = box.querySelector('[data-hints]');
  function poserIndice(){
    if (repondu || aide >= 3) return;
    aide++;
    let titre = '', texte = '';
    if (aide === 1){ titre = 'Indice 1 · La méthode'; texte = _qAstuce(o); }
    else if (aide === 2){
      titre = 'Indice 2 · La première étape';
      texte = (ex.indices && ex.indices[1]) || _qPremiereEtape(ex);
      if (!texte){ texte = 'Cet exercice n\'a pas d\'étape intermédiaire.'; }
      if (modeQcm){
        const mauvais = Array.from(zone.querySelectorAll('.opt')).filter(b => normStr(b.dataset.c) !== normStr(ex.a));
        if (mauvais.length) mauvais[0].classList.add('dim');
      }
      try { if (stSkill) stSkill.aides = (stSkill.aides || 0) + 1; } catch(e){}
    } else {
      titre = 'Indice 3 · La réponse';
      texte = _qFv(ex.a) + (ex.expl ? ' · ' + ex.expl : '');
      typeErr = 'methode';
    }
    boiteIndices.hidden = false;
    boiteIndices.insertAdjacentHTML('beforeend',
      '<p class="hint-line">' + _qIc('lightbulb', 20) + '<span><b>' + _qEsc(titre) + '</b> ' + _qEsc(texte) + '</span></p>');
    if (window.ASSIST_CTX) window.ASSIST_CTX.aide = aide;
    if (aide >= 3){ btnIndice.disabled = true; btnIndice.querySelector('span').textContent = 'Indice 3 sur 3'; }
    else btnIndice.querySelector('span').textContent = 'Indice ' + (aide + 1) + ' sur 3';
    _qSon('click');
  }
  if (btnIndice) btnIndice.addEventListener('click', poserIndice);

  /* ---------- rendu du verdict : l'explication d'abord ---------- */
  function finish(ok, donnee, saute){
    if (repondu || qSeq !== myId) return;
    repondu = true;
    const dt = performance.now() - t0;
    if (chEl){ chEl.classList.remove('warn', 'late'); if (dt < 4000) chEl.classList.add('ok'); }
    if (window.ASSIST_CTX && window.ASSIST_CTX.ex === ex)
      Object.assign(window.ASSIST_CTX, {repondu: true, juste: ok, donnee: donnee, aide: aide});

    /* mode différé (épreuve) : aucune correction ici */
    if (differe){ terminer({ok, ms: dt, given: donnee, ex, type: '', aide, variante: varianteN, skipped: !!saute}); return; }

    carte.dataset.state = ok ? 'ok' : 'ko';
    if (ok) celebrer(1); else celebrer(0);

    const recall = _qRecall(o);
    const tempsHtml = (o.cibleMs && avecChrono)
      ? '<p class="q-time num' + (dt <= o.cibleMs ? ' ok' : '') + '">' + (dt / 1000).toFixed(1).replace('.', ',') +
        ' s <span class="muted">· objectif ' + (o.cibleMs / 1000).toFixed(1).replace('.', ',') + ' s</span></p>' +
        (dt > 2 * o.cibleMs && ok ? '<p class="small muted">Juste, mais la technique est à relire.</p>' : '')
      : '';

    fb.innerHTML =
      (ex.expl ? '<div class="explain"><div>' + _qEnonce(ex.expl, ex) + '</div></div>' : '') +
      '<p class="verdict ' + (ok ? 'ok' : 'ko') + '">' +
        _qIc(ok ? 'check-draw' : 'x-draw', 24) +
        (ok
          ? '<span>' + _qEsc(varianteN ? 'Repris. On continue.' : R.pick(_qJustes)) + '</span><span class="answer num">' + _qEsc(_qFv(ex.a)) + '</span>'
          : '<span>Réponse attendue : <b class="answer num">' + _qEsc(_qFv(ex.a)) + '</b></span>' +
            (donnee ? '<span class="given small muted">Ta réponse : ' + _qEsc(donnee) + '</span>' : '')) +
      '</p>' +
      tempsHtml +
      (aide >= 2 ? '<p class="q-aide small muted">Avec indice : compte pour la séance, pas pour le verrou.</p>' : '') +
      (recall ? '<p class="recall num">' + _qIc('clock-countdown', 16) + 'Prochain rappel : dans ' + recall + ' j</p>' : '') +
      (!ok && !o.sansType && !varianteN
        ? '<p class="err-q overline">Ce qui s\'est passé</p><div class="err-types" role="group" aria-label="Type d\'erreur">' +
          (typeof TYPES_ERR !== 'undefined' ? TYPES_ERR : []).map(x =>
            '<button class="err-type" type="button" data-t="' + _qEsc(x.id) + '" data-tone="' + _qEsc(x.tone || 'muted') +
            '" aria-pressed="' + (typeErr === x.id ? 'true' : 'false') + '">' + _qEsc(x.nom) + '</button>').join('') +
          '</div>' +
          (_qAstuceType() ? '<p class="small muted">Je m\'en sers pour te coacher.</p>' : '')
        : '') +
      (!ok && o.prof !== false && prefs.prof !== false && !varianteN
        ? '<div class="q-prof assist-chips"><button class="assist-chip btn sm" type="button" data-chip="etape">Explique l\'étape</button>' +
          '<button class="assist-chip btn sm" type="button" data-chip="pourquoi">Pourquoi ma réponse est fausse</button>' +
          '<button class="assist-chip btn sm" type="button" data-chip="regle">La règle</button></div>'
        : '') +
      '<div class="next-row"></div>';

    /* chips de typologie */
    fb.querySelectorAll('.err-type').forEach(b => b.addEventListener('click', () => {
      _qSon('click');
      const deja = b.getAttribute('aria-pressed') === 'true';
      typeErr = deja ? '' : b.dataset.t;
      fb.querySelectorAll('.err-type').forEach(x => {
        const on = !deja && x === b;
        x.classList.toggle('sel', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }));
    fb.querySelectorAll('[data-chip]').forEach(b => b.addEventListener('click', () => {
      _qSon('click');
      if (typeof window.ASSIST_CHIP === 'function') window.ASSIST_CHIP(b.dataset.chip, window.ASSIST_CTX);
      else if (typeof window.ASSIST_OUVRIR === 'function') window.ASSIST_OUVRIR(b.dataset.chip);
    }));

    /* le bouton primaire est un objet unique : Valider devient Continuer */
    const rangee = fb.querySelector('.next-row');
    const peutReprendre = !ok && !varianteN && o.reprise !== false && typeof o.variante === 'function';
    if (peutReprendre){
      rangee.insertAdjacentHTML('afterbegin',
        '<button class="btn btn-ghost" type="button" data-continue>Continuer</button>');
      rangee.querySelector('[data-continue]').addEventListener('click', () =>
        terminer({ok, ms: dt, given: donnee, ex, type: typeErr, aide, variante: 0, skipped: !!saute}));
    }
    const primaire = _qPrimaire(box, rangee);
    _qRole(primaire, peutReprendre ? 'retry' : 'continue',
           peutReprendre ? 'Réessayer' : 'Continuer',
           peutReprendre ? 'arrow-counter-clockwise' : 'arrow-right');
    primaire.disabled = false;
    primaire.onclick = () => {
      _qSon('click');
      if (peutReprendre){ _qVariante(); return; }
      terminer({ok, ms: dt, given: donnee, ex, type: typeErr, aide, variante: varianteN, skipped: !!saute});
    };
    try { primaire.focus({preventScroll: true}); primaire.scrollIntoView({block: 'nearest'}); } catch(e){ primaire.focus(); }

    /* gain d'altitude, crête et anneau du jour */
    if (ok && aide < 3 && o.gain !== false){
      carte.insertAdjacentHTML('beforeend', '<span class="gain num" aria-hidden="true">+2 m</span>');
      try { majCrete(); } catch(e){}
    }
    try { majAnneauJour(); } catch(e){}

    /* annonce lecteur d'écran : jamais de toast pour un verdict */
    annoncer(ok
      ? R.pick(_qJustes) + (o.count ? ' ' + String(o.count).replace('/', 'sur') + '.' : '')
      : 'Réponse attendue : ' + _qFv(ex.a) + '.' + (ex.expl ? ' ' + ex.expl : ''));
  }

  /* une variante à chaud, jusqu'à deux fois (boucle de reprise M8) */
  function _qVariante(){
    let nouvel = null;
    try { nouvel = o.variante(); } catch(e){ nouvel = null; }
    if (!nouvel){ terminer({ok: false, ms: 0, given: '', ex, type: typeErr, aide, variante: 0}); return; }
    const suite = Object.assign({}, o, {
      ex: nouvel, _var: varianteN + 1, indices: false, sansType: true, reprise: varianteN + 1 < 2,
      tag: 'Variante · ' + (o.tagCourt || o.tag || ''), overline: null, hint: null, serie: false
    });
    askQuestion(box, suite, r => {
      if (r.ok){ terminer({ok: false, ms: r.ms, given: r.given, ex, type: typeErr || 'etourderie', aide, variante: suite._var}); return; }
      if (suite._var >= 2){
        toast('On y reviendra dans le cahier, avec une reprise à froid.', {tone: 'info', icon: 'book-bookmark'});
        terminer({ok: false, ms: r.ms, given: r.given, ex, type: typeErr || 'methode', aide, variante: 0});
      }
      /* sinon la carte a déjà relancé une variante d'elle-même */
    });
  }

  function terminer(r){
    window.question = null;
    if (varianteN && typeof cb === 'function'){ cb(r); return; }
    try { if (typeof emettre === 'function') emettre('reponse', {ok: r.ok, skillId: o.skillId || null, famId: o.famId || null,
                                                                 ms: r.ms, aide: r.aide, variante: r.variante, mix: !!o.mix}); } catch(e){}
    if (typeof cb === 'function') cb(r);
    try { if (typeof save === 'function') save(); } catch(e){}      // une seule sauvegarde par réponse (M1)
  }

  /* ---------- saisie ---------- */
  if (modeQcm){
    zone.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      if (repondu) return;
      const val = b.dataset.c, ok = normStr(val) === normStr(ex.a);
      zone.querySelectorAll('.opt').forEach(x => {
        x.disabled = true; x.tabIndex = -1;
        if (normStr(x.dataset.c) === normStr(ex.a)) x.classList.add('good');
        else if (x === b) x.classList.add('bad');
      });
      finish(ok, val);
    }));
  } else {
    const form = zone.querySelector('form');
    const inp = zone.querySelector('input');
    if (o.valeurRep) inp.value = o.valeurRep;
    const valider = () => {
      if (repondu || qSeq !== myId) return;
      const v = inp.value.trim();
      if (!v && !differe){ inp.focus(); return; }
      inp.disabled = true;
      const p = form.querySelector('[data-role]'); if (p) p.disabled = true;
      if (btnIndice) btnIndice.disabled = true;
      finish(differe ? false : isRight(v, ex), v);
    };
    form.addEventListener('submit', e => { e.preventDefault(); valider(); });
    /* touches rapides : insertion au curseur, le focus reste dans le champ */
    zone.querySelectorAll('.quickkeys button').forEach(b => b.addEventListener('click', e => {
      e.preventDefault();
      if (inp.disabled) return;
      const k = b.dataset.k, d = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
      const f = inp.selectionEnd == null ? d : inp.selectionEnd;
      inp.value = inp.value.slice(0, d) + k + inp.value.slice(f);
      const pos = d + k.length;
      inp.focus();
      try { inp.setSelectionRange(pos, pos); } catch(e2){}
    }));
    after(0, () => { if (qSeq === myId && !repondu) inp.focus(); });
  }
  const btnSkip = box.querySelector('[data-skip]');
  if (btnSkip) btnSkip.addEventListener('click', () => { if (!repondu) finish(false, '', true); });

  /* passerelle clavier (PRODUCT-SPEC S3) */
  window.question = {
    valider(){ const f = zone.querySelector('form'); if (f && !repondu) f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', {cancelable: true})); },
    continuer(){ const p = box.querySelector('.next-row [data-role]'); if (p) p.click(); },
    choisir(i){ const b = zone.querySelectorAll('.opt')[i]; if (b && !b.disabled) b.click(); },
    indice(){ if (btnIndice && !btnIndice.disabled && !btnIndice.hidden) btnIndice.click(); },
    repondu(){ return repondu; }
  };
}

/* Le bouton primaire de la carte : celui de la saisie est déplacé dans la rangée
   « suivant » ; en QCM il est créé là. Jamais deux boutons qui se remplacent. */
function _qPrimaire(box, rangee){
  let b = box.querySelector('.answer-row [data-role]');
  if (b){ rangee.appendChild(b); b.type = 'button'; return b; }
  b = document.createElement('button');
  b.className = 'btn-primary';
  b.type = 'button';
  rangee.appendChild(b);
  return b;
}
function _qRole(btn, role, label, icone){
  btn.dataset.role = role;
  btn.innerHTML = '<span>' + _qEsc(label) + '</span><span class="ic-wrap">' + _qIc(icone, 20) + '</span>';
}
/* « Je m'en sers pour te coacher. » une seule fois. */
function _qAstuceType(){
  try {
    if (typeof S === 'undefined' || !S.meta) return false;
    if (S.meta.tipType) return false;
    S.meta.tipType = true;
    return true;
  } catch(e){ return false; }
}
/* Prochain rappel, en jours, quand la question fait partie d'une révision. */
function _qRecall(o){
  if (!o.revision || !o.skillId) return 0;
  const s = _qSt(o.skillId);
  if (!s) return 0;
  const j = Math.round((s.due - Date.now()) / JOUR);
  return j > 0 ? j : (s.interval || 0);
}

/* ============================================================
   runSerie : n questions sur une compétence, niveau adaptatif,
   entrelacement optionnel et reprise différée (PRODUCT-SPEC M8)
   ============================================================ */
function _qVoisins(skill){
  if (!skill || !window.SKILLS) return [];
  return SKILLS.filter(s => {
    if (s.id === skill.id || s.phase !== skill.phase) return false;
    const d = _qSt(s.id);
    return d && d.mastered && !d.fragile && !d.provisoire;
  }).sort((a, b) => (_qSt(b.id).masteredAt || 0) - (_qSt(a.id).masteredAt || 0)).slice(0, 3);
}

function runSerie(box, skill, n, opts, done){
  const o = opts || {};
  const res = [], marques = [], reprises = [];
  let level = o.level || 1, okStreak = 0, i = 0, okMix = 0, nMix = 0;
  const startLevel = level;

  const voisins = (o.mix && n >= 6) ? _qVoisins(skill) : [];
  const posMix = (voisins.length && (_qSt(skill.id) || {}).n >= 12)
    ? [Math.floor(n * 0.35), Math.floor(n * 0.75)] : [];

  function poser(){
    if (i >= n){ phaseReprise(); return; }
    const melange = posMix.indexOf(i) >= 0;
    const cible = melange ? R.pick(voisins) : skill;
    const niv = melange ? 2 : level;
    const ex = genFor(cible, niv);
    box.innerHTML = '';
    const hote = document.createElement('div');
    box.appendChild(hote);
    const stCible = _qSt(cible.id);
    askQuestion(hote, {
      ex, skill: cible, skillId: cible.id,
      tag: (melange ? 'Mélange · ' : '') + cible.titre,
      tagCourt: cible.titre,
      overline: melange ? 'Question mêlée' : null,
      mix: melange,
      lvl: niv,
      chrono: o.chrono !== false,
      count: (i + 1) + ' / ' + n,
      serie: melange ? marques.concat([{cls: 'cur'}]) : (stCible ? stCible.hist : []),
      indices: o.indices,
      reprise: o.reprise,
      sansType: o.sansType,
      revision: o.revision,
      prof: o.prof,
      variante: (o.reprise === false || melange) ? null : (() => genFor(cible, niv))
    }, r => {
      marques.push({cls: r.ok ? 'ok' : 'ko'});
      if (melange){
        nMix++; if (r.ok) okMix++;
        if (o.recordSkill !== false) record(cible.id, r.ok);
        logAnswer(r.ok, r.ms);
      } else {
        res.push(r.ok ? 1 : 0);
        logAnswer(r.ok, r.ms);
        noteType(r.type);
        if (o.recordSkill !== false && r.aide < 2){
          const evt = record(skill.id, r.ok);
          if (evt === 'mastered' && o.onMastered) o.onMastered();
        }
        if (!r.ok){
          _qPushErreur(cible, r);
          if (!r.variante) reprises.push({skill: cible, level: niv});
          okStreak = 0;
          if (level > startLevel) level--;
        } else {
          okStreak++;
          if (okStreak >= 3 && level < 3 && o.adapt !== false){ level++; okStreak = 0; }
        }
      }
      if (melange && !r.ok) _qPushErreur(cible, r);
      i++;
      poser();
    });
  }

  /* reprise différée : les ratés non repris repassent une fois avant la fin */
  let repriseFaite = false;
  function phaseReprise(){
    if (repriseFaite || !reprises.length || o.reprise === false){ conclure(); return; }
    repriseFaite = true;
    const file = reprises.slice(0, 3);
    toast('Reprise · ' + file.length + (file.length > 1 ? ' questions à refaire' : ' question à refaire') + ' avant de conclure.',
          {tone: 'glacier', icon: 'arrow-counter-clockwise'});
    let k = 0;
    (function suite(){
      if (k >= file.length){ conclure(); return; }
      const c = file[k++];
      const hote = document.createElement('div');
      box.innerHTML = ''; box.appendChild(hote);
      askQuestion(hote, {
        ex: genFor(c.skill, c.level), skill: c.skill, skillId: c.skill.id,
        tag: 'Reprise · ' + c.skill.titre, tagCourt: c.skill.titre, lvl: c.level,
        chrono: o.chrono !== false, count: k + ' / ' + file.length,
        indices: false, reprise: false, sansType: true, serie: false
      }, r => { logAnswer(r.ok, r.ms); suite(); });
    })();
  }

  function conclure(){
    if (nMix) toast(res.filter(Boolean).length + '/' + res.length + ' sur ' + skill.titre + ' · ' +
                    okMix + '/' + nMix + ' sur les questions mêlées.', {tone: 'info'});
    try { emettre('serie-fin', {skillId: skill.id, res}); } catch(e){}
    done({res, level, mix: {ok: okMix, n: nMix}});
  }

  poser();
}

/* Entrée au cahier d'erreurs (jamais de save() ici : askQuestion sauvegarde une fois). */
function _qPushErreur(skill, r){
  try {
    S.erreurs.unshift({sid: skill.id, q: r.ex.q, a: r.ex.a, given: r.given, expl: r.ex.expl || '',
                       choix: r.ex.choix || null, ts: Date.now(), redo: 0,
                       type: r.type || (r.variante ? 'etourderie' : ''), reprise: r.variante || 0});
    if (S.erreurs.length > 120) S.erreurs.pop();
  } catch(e){}
}
