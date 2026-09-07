/* ===== Maths · De zéro au sommet : premier pas et bilan d'altitude =====
   DESIGN-SPEC §6.30 (onboarding), §7.17, §7.19. PRODUCT-SPEC M4.
   Script classique : ce fichier ne déclare que vOnboarding et vBilanAltitude ;
   ses autres symboles sont préfixés _onb. */
'use strict';

function _onbReduit(){
  try {
    if (document.documentElement.dataset.motion === 'reduit') return true;
    if (typeof REDUCE !== 'undefined' && REDUCE) return true;
  } catch(e){}
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function _onbSon(nom){ try { if (window.snd && typeof snd[nom] === 'function') snd[nom](); } catch(e){} }

/* ============================================================
   1. vOnboarding : quatre écrans plein cadre (PRODUCT-SPEC M4)
   ============================================================ */

function vOnboarding(){
  setCtx('plein');
  /* Un état déjà rempli (import, migration v1) : deux écrans de découverte, pas de bilan. */
  let dejaLa = false, alt = 0;
  try { alt = altitude(); dejaLa = masteredCount() > 0 || Object.keys(S.skills || {}).length > 0; } catch(e){}

  /* Choix en cours, écrits en une seule fois à la sortie. */
  const choix = {
    prenom: '', objectif: 25, son: true, auto: true, theme: 'light', depart: 'zero'
  };
  try {
    choix.prenom = (S.profil && S.profil.prenom) || '';
    choix.objectif = (S.profil && S.profil.objectif) || 25;
    choix.son = !(S.prefs && S.prefs.son === 'off');
    choix.auto = !(S.prefs && (S.prefs.theme === 'light' || S.prefs.theme === 'dark'));
    choix.theme = (S.prefs && S.prefs.theme === 'dark') ? 'dark' : 'light';
  } catch(e){}

  const dernier = dejaLa ? 3 : 4;
  let etape = 1;

  function pointes(){
    let h = '';
    for (let i = 1; i <= dernier; i++) h += '<li' + (i === etape ? ' class="on"' : '') + '></li>';
    return '<ol class="onb-dots" aria-hidden="true">' + h + '</ol>';
  }

  function rendre(){
    const hote = app();
    hote.innerHTML =
      '<section class="onb" data-step="' + etape + '" aria-label="Bienvenue">' +
        pointes() +
        (etape <= 2 ? '<button class="btn btn-ghost onb-skip" type="button" data-skip>Passer</button>' : '') +
        '<div class="onb-track"><article class="onb-p" data-panneau></article></div>' +
        '<div class="onb-actions" data-actions></div>' +
      '</section>';
    const panneau = hote.querySelector('[data-panneau]');
    const actions = hote.querySelector('[data-actions]');
    ({1: ecran1, 2: ecran2, 3: ecran3, 4: ecran4}[etape])(panneau, actions);
    const h2 = panneau.querySelector('h2');
    if (h2){ h2.tabIndex = -1; try { h2.focus({preventScroll: true}); } catch(e){} }
  }

  function bouton(actions, label, fn, icone){
    actions.innerHTML = '<button class="btn-primary lg" type="button" data-suivant>' +
      '<span>' + esc(label) + '</span><span class="ic-wrap">' + ic(icone || 'arrow-right') + '</span></button>';
    actions.querySelector('[data-suivant]').addEventListener('click', () => { _onbSon('click'); fn(); });
  }

  /* --- Écran 1 : la montagne --- */
  function ecran1(p, actions){
    p.innerHTML =
      '<svg class="illus" aria-hidden="true" focusable="false"><use href="#il-carnet"/></svg>' +
      '<h2 class="display-l">' + (dejaLa
        ? 'Ta progression est là : ' + esc(nf(alt, 'm')) + '.'
        : 'De la 6e au bac, une compétence à la fois.') + '</h2>' +
      '<p class="body-l ink-2">' + (dejaLa
        ? 'Deux écrans pour découvrir les nouveautés. Rien n\'est perdu.'
        : '52 compétences, 7 camps, 4 810 mètres. Chaque bonne réponse te fait monter.') + '</p>' +
      '<div class="montagne">' + montagneSVG({anime: true}) + '</div>';
    bouton(actions, 'Voir comment ça marche', () => { etape = 2; rendre(); });
  }

  /* --- Écran 2 : la règle des 90 % --- */
  function ecran2(p, actions){
    const cases = [];
    for (let i = 0; i < 10; i++) cases.push('<i data-c="' + i + '"></i>');
    p.innerHTML =
      '<div class="serie-bar crampons lg" role="img" aria-label="Neuf réponses justes sur dix">' + cases.join('') + '</div>' +
      '<span class="lock-ic" data-lock>' +
        '<svg class="ic ic-48 ic-open" aria-hidden="true" focusable="false"><use href="#i-lock-simple-open"/></svg>' +
        '<svg class="ic ic-48 ic-shut" aria-hidden="true" focusable="false"><use href="#i-lock-simple"/></svg>' +
      '</span>' +
      '<h2 class="display-l">La règle des 90 %.</h2>' +
      '<p class="body-l ink-2">Une compétence est acquise à 9 réponses sur 10. Pas avant. ' +
        'Ensuite, l\'app te la fait réviser à 2, 4, 8 puis 16 jours pour qu\'elle reste.</p>' +
      '<ul class="onb-plan">' +
        '<li>' + ic('timer') + '<span>Échauffement · 12 calculs <span class="num muted">2 min</span></span></li>' +
        '<li>' + ic('arrows-clockwise') + '<span>Rappels · ce qui revient <span class="num muted">5 min</span></span></li>' +
        '<li>' + ic('flag') + '<span>Nouvelle compétence · leçon puis 10 exercices <span class="num muted">15 min</span></span></li>' +
        '<li>' + ic('book-open') + '<span>Erreurs · on répare <span class="num muted">3 min</span></span></li>' +
      '</ul>' +
      '<p class="small muted">Une séance : 25 minutes environ.</p>';
    /* Neuf crampons se remplissent, le dixième reste vide, puis le cadenas se ferme. */
    const cs = p.querySelectorAll('[data-c]');
    if (_onbReduit()){
      for (let i = 0; i < 9; i++) cs[i].classList.add('ok');
      const l = p.querySelector('[data-lock]'); if (l) l.setAttribute('data-locked', '');
    } else {
      for (let i = 0; i < 9; i++) after(200 + i * 80, () => cs[i].classList.add('ok'));
      after(1100, () => { const l = p.querySelector('[data-lock]'); if (l) l.setAttribute('data-locked', ''); _onbSon('accord'); });
    }
    bouton(actions, 'Préparer ma cordée', () => { etape = 3; rendre(); });
  }

  /* --- Écran 3 : le profil --- */
  function ecran3(p, actions){
    const paliers = [[10, 'Balade', '10 réponses', '5 min'], [25, 'Marche', '25 réponses', '12 min'],
                     [50, 'Ascension', '50 réponses', '25 min']];
    p.innerHTML =
      '<h2 class="display-l">Ta cordée, à ta main.</h2>' +
      '<div class="onb-form">' +
        '<label class="field"><span class="label">Ton prénom (facultatif)</span>' +
          '<input id="onb-prenom" type="text" maxlength="24" autocomplete="given-name" autocorrect="off"' +
          ' spellcheck="false" placeholder="Ilan" value="' + esc(choix.prenom) + '"></label>' +
        '<div class="field"><span class="label" id="onb-obj-l">Ton objectif chaque jour</span>' +
          '<div class="segment" role="radiogroup" aria-labelledby="onb-obj-l">' +
            paliers.map(x => '<label><input type="radio" name="onb-obj" value="' + x[0] + '"' +
              (choix.objectif === x[0] ? ' checked' : '') + '><span>' + x[1] +
              '<b class="num">' + x[2] + '</b><span class="small muted">' + x[3] + '</span></span></label>').join('') +
          '</div></div>' +
        '<label class="switch"><span class="switch-t">Sons discrets</span>' +
          '<input type="checkbox" id="onb-son"' + (choix.son ? ' checked' : '') + '>' +
          '<span class="track"><span class="thumb"></span></span></label>' +
        '<label class="switch"><span class="switch-t">Suivre le thème de l\'appareil</span>' +
          '<input type="checkbox" id="onb-auto"' + (choix.auto ? ' checked' : '') + '>' +
          '<span class="track"><span class="thumb"></span></span></label>' +
        '<div class="segment-reveal"' + (choix.auto ? '' : ' data-open') + '><div>' +
          '<div class="segment" role="radiogroup" aria-label="Thème">' +
            '<label><input type="radio" name="onb-theme" value="light"' + (choix.theme === 'light' ? ' checked' : '') +
              '><span>Aube</span></label>' +
            '<label><input type="radio" name="onb-theme" value="dark"' + (choix.theme === 'dark' ? ' checked' : '') +
              '><span>Nuit</span></label>' +
          '</div></div></div>' +
        '<p class="small muted">Tu pourras tout changer dans Réglages.</p>' +
      '</div>';

    const reveal = p.querySelector('.segment-reveal');
    const auto = p.querySelector('#onb-auto');
    const majTheme = () => {
      choix.auto = auto.checked;
      if (choix.auto) reveal.removeAttribute('data-open'); else reveal.setAttribute('data-open', '');
      try { setTheme(choix.auto ? 'auto' : choix.theme); } catch(e){}
    };
    auto.addEventListener('change', majTheme);
    p.querySelectorAll('input[name="onb-theme"]').forEach(r => r.addEventListener('change', () => {
      choix.theme = r.value;
      try { setTheme(choix.theme); } catch(e){}
    }));
    p.querySelector('#onb-son').addEventListener('change', e => {
      choix.son = e.target.checked;
      if (choix.son){ try { S.prefs.son = 'discret'; } catch(x){} _onbSon('pop'); }
    });
    p.querySelectorAll('input[name="onb-obj"]').forEach(r => r.addEventListener('change', () => {
      choix.objectif = Number(r.value);
    }));

    bouton(actions, 'Continuer', () => {
      choix.prenom = (p.querySelector('#onb-prenom').value || '').trim();
      if (dejaLa) terminer('zero');
      else { etape = 4; rendre(); }
    });
  }

  /* --- Écran 4 : le point de départ --- */
  function ecran4(p, actions){
    const carte = (val, titre, sous) =>
      '<button class="card card-link" type="button" role="radio" data-depart="' + val + '"' +
      ' aria-checked="' + (choix.depart === val ? 'true' : 'false') + '">' +
      '<span class="label">' + esc(titre) + '</span>' +
      '<span class="small muted">' + esc(sous) + '</span></button>';
    let premiere = 'Lire, écrire, comparer les nombres';
    try { const f = SKILLS[0]; if (f) premiere = f.titre; } catch(e){}
    p.innerHTML =
      '<h2 class="display-l">Tu as déjà des bases ?</h2>' +
      '<div class="onb-choix" role="radiogroup" aria-label="Point de départ">' +
        carte('zero', 'Je repars de zéro', 'Première compétence : ' + premiere) +
        carte('bilan', 'Faire le bilan d\'altitude', '10 minutes, 20 questions au plus, sans leçon ni indice') +
      '</div>';
    const maj = () => {
      p.querySelectorAll('[data-depart]').forEach(b =>
        b.setAttribute('aria-checked', b.dataset.depart === choix.depart ? 'true' : 'false'));
      bouton(actions, choix.depart === 'bilan' ? 'Commencer le bilan' : 'Commencer ma première séance',
             () => terminer(choix.depart), choix.depart === 'bilan' ? 'compass' : 'play');
    };
    p.querySelectorAll('[data-depart]').forEach(b => b.addEventListener('click', () => {
      _onbSon('click'); choix.depart = b.dataset.depart; maj();
    }));
    maj();
  }

  /* Une seule écriture d'état à la sortie (M4). */
  function terminer(depart){
    try {
      S.profil.prenom = choix.prenom;
      S.profil.objectif = choix.objectif;
      const jour = jToday();
      if ((jour.ok || 0) < (jour.obj || choix.objectif)) jour.obj = choix.objectif;
      S.prefs.son = choix.son ? 'discret' : 'off';
      S.prefs.theme = choix.auto ? 'auto' : choix.theme;
      S.profil.onboardLe = Date.now();
      /* En branche « bilan », onboard n'est posé qu'à la fin du bilan (§7.17). */
      if (depart !== 'bilan') S.profil.onboard = true;
      save();
      save.flush();
    } catch(e){}
    try { setTheme(choix.auto ? 'auto' : choix.theme); } catch(e){}
    try { if (typeof window.marquerJalonsPasses === 'function') window.marquerJalonsPasses(); } catch(e){}
    nav(depart === 'bilan' ? 'bilan' : 'seance', {remplace: true});
  }

  rendre();

  /* « Passer » mène à l'écran 3, jamais à l'accueil. */
  app().addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-skip]');
    if (!b) return;
    _onbSon('click');
    etape = 3;
    rendre();
  });
}

/* ============================================================
   2. vBilanAltitude : le placement adaptatif (PRODUCT-SPEC M4)
   ============================================================ */

/* Quatre compétences distinctes par phase : la première, la dernière, deux au hasard. */
function _onbEchantillon(p, combien){
  const l = SKILLS.filter(s => s.phase === p);
  if (!l.length) return [];
  if (l.length <= combien) return l.slice();
  const choisies = [l[0], l[l.length - 1]];
  const reste = R.shuffle(l.slice(1, l.length - 1));
  for (let i = 0; choisies.length < combien && i < reste.length; i++) choisies.push(reste[i]);
  return choisies.sort((a, b) => a.ordre - b.ordre);
}

function vBilanAltitude(params){
  const p = params || {};
  const camp = (typeof p.phase === 'number') ? Math.max(1, Math.min(7, p.phase)) : null;
  const phases = camp ? [camp] : [1, 2, 3, 4, 5];
  const parPhase = camp ? 5 : 4;               // test de camp : 5 compétences × 4 questions
  const qParSkill = camp ? 4 : 1;
  const totalMax = camp ? 20 : phases.length * 4;

  intro();

  /* ---------- 1. l'intro ---------- */
  function intro(){
    setCtx('outil');
    app().innerHTML =
    '<div class="view">' +
      '<h1>' + (camp ? 'Test de camp' : 'Bilan d\'altitude') + '</h1>' +
      '<section class="card card-muted">' +
        '<p class="ink-2">' + (camp
          ? '20 questions sur ce camp, sans leçon ni indice. À 18 sur 20, tout le camp passe en validé provisoire.'
          : '10 minutes. 20 questions au plus, sans leçon ni indice. Chaque camp réussi à 3 sur 4 est validé ' +
            'provisoirement : tes révisions des prochains jours confirmeront.') + '</p>' +
      '</section>' +
      '<div class="next-row"><button class="btn-primary lg" type="button" data-go>' +
        '<span>' + (camp ? 'Commencer le test' : 'Commencer le bilan') + '</span>' +
        '<span class="meta num">' + totalMax + ' q</span>' +
        '<span class="ic-wrap">' + ic('play') + '</span></button></div>' +
      '<div class="row"><button class="btn btn-ghost" type="button" data-tard>Plus tard</button></div>' +
    '</div>';
    app().querySelector('[data-go]').addEventListener('click', () => { _onbSon('click'); questions(); });
    app().querySelector('[data-tard]').addEventListener('click', () => {
      _onbSon('click');
      let onboarde = true;
      try { onboarde = !!(S.profil && S.profil.onboard); } catch(e){}
      nav(onboarde ? 'accueil' : 'onboarding', {remplace: true});
    });
  }

  /* ---------- 2. les questions ---------- */
  function questions(){
    setCtx('parcours', {title: camp ? 'Test de camp' : 'Bilan d\'altitude',
                        count: '0 / ' + totalMax + (camp ? '' : ' au plus')});
    window.vueCourante.enCours = true;
    window.vueCourante.garde = () => false;
    window.MODE_EXAMEN = true;                 // aucune célébration, aucun toast pendant le bilan

    const journal = [];                        // {sid, ok, ms}
    const valides = [];                        // phases validées
    const marques = [];                        // crampons de la série en cours
    let iPhase = 0, posee = 0;

    app().innerHTML = '<div class="view"><div id="zone-bilan"></div></div>';
    const zone = document.getElementById('zone-bilan');

    (function phase(){
      if (iPhase >= phases.length){ conclure(valides, journal, posee); return; }
      const ph = phases[iPhase];
      const skills = _onbEchantillon(ph, parPhase);
      if (!skills.length){ iPhase++; phase(); return; }
      const seuil = camp ? 18 : Math.ceil(.75 * skills.length * qParSkill);
      let k = 0, ok = 0;
      const file = [];
      skills.forEach(sk => { for (let q = 0; q < qParSkill; q++) file.push(sk); });

      (function une(){
        if (k >= file.length){
          if (ok >= seuil){ valides.push({phase: ph, skills: skills, ok: ok, n: file.length}); iPhase++; phase(); }
          else { conclure(valides, journal, posee, {phase: ph, ok: ok, n: file.length, skills: skills}); }
          return;
        }
        const sk = file[k];
        const hote = document.createElement('div');
        zone.innerHTML = ''; zone.appendChild(hote);
        askQuestion(hote, {
          ex: genFor(sk, 2), skill: sk, skillId: sk.id,
          tag: (camp ? 'Test de camp · ' : 'Bilan · ') + (PHASES[ph] ? PHASES[ph].camp : 'Camp ' + ph),
          count: (posee + 1) + ' / ' + totalMax + (camp ? '' : ' au plus'),
          chrono: false, indices: false, reprise: false, sansType: true, skip: true,
          gain: false, prof: false, serie: marques.concat([{cls: 'cur'}])
        }, r => {
          journal.push({sid: sk.id, ok: r.ok, ms: r.ms});
          marques.push({cls: r.ok ? 'ok' : 'ko'});
          if (r.ok) ok++;
          k++; posee++;
          setCtx('parcours', {title: camp ? 'Test de camp' : 'Bilan d\'altitude',
                              count: posee + ' / ' + totalMax + (camp ? '' : ' au plus')});
          une();
        });
      })();
    })();
  }

  /* ---------- 3. l'effet sur l'état, puis l'écran de résultat ---------- */
  function conclure(valides, journal, posee, echouee){
    window.MODE_EXAMEN = false;
    window.vueCourante.enCours = false;
    window.vueCourante.garde = null;
    const now = Date.now();
    const interroges = {};
    journal.forEach(x => { if (interroges[x.sid] === undefined) interroges[x.sid] = x.ok; else interroges[x.sid] = interroges[x.sid] && x.ok; });

    /* Compétences validées provisoirement : 4 rappels par jour à partir de J+2. */
    let rang = 0;
    const validees = [];
    valides.forEach(v => {
      SKILLS.filter(s => s.phase === v.phase).forEach(sk => {
        const s = st(sk.id);
        s.mastered = true; s.provisoire = true; s.masteredAt = now;
        s.interval = 2; s.fragile = false; s.revOk = 0;
        s.hist = interroges[sk.id] === undefined ? [] : [interroges[sk.id] ? 1 : 0];
        s.n = 0; s.ok = 0;
        s.due = now + (2 + Math.floor(rang / 4)) * JOUR;
        rang++;
        validees.push(sk.id);
      });
      try { if (!S.jalons['camp-' + v.phase]) S.jalons['camp-' + v.phase] = now; } catch(e){}
    });
    /* Phase échouée : les compétences interrogées comptent normalement. */
    if (echouee) echouee.skills.forEach(sk => {
      if (interroges[sk.id] !== undefined && validees.indexOf(sk.id) < 0) record(sk.id, interroges[sk.id]);
    });

    try {
      S.bilan = {ts: now, q: journal, phase: valides.length ? valides[valides.length - 1].phase : 0, valides: validees};
      S.profil.bilanFait = true;
      S.profil.onboard = true;
      if (!S.profil.onboardLe) S.profil.onboardLe = now;
      save(); save.flush();
    } catch(e){}
    try { if (typeof window.marquerJalonsPasses === 'function') window.marquerJalonsPasses(); } catch(e){}

    resultat(valides, validees, journal, posee, echouee);
  }

  function resultat(valides, validees, journal, posee, echouee){
    setCtx('outil');
    const alt = altitude();
    const justes = journal.filter(x => x.ok).length;
    const camps = valides.length;
    let titre, message, bouton = 'Voir mon programme', route = 'programme';

    if (camp){
      const total = journal.length || 1;
      const note = Math.round(20 * justes / total);
      if (note >= 18){
        titre = 'Tu connais ce camp.';
        message = 'Tout le camp passe en validé provisoire. Les rappels des prochains jours le confirmeront.';
      } else if (note >= 14){
        titre = 'Presque.';
        message = 'Tu gardes les compétences réussies. Les autres t\'attendent sur le sentier.';
      } else {
        titre = 'Ce camp mérite d\'être parcouru.';
        message = 'Ta compétence du jour t\'attend, et rien ne sera de trop.';
      }
    } else if (!camps){
      titre = 'On part du camp de base.';
      const f = frontier();
      message = 'Et c\'est très bien : aucun trou derrière toi. Première compétence : ' +
                (f ? f.titre : 'Lire, écrire, comparer les nombres') + '.';
      bouton = 'Commencer ma première séance'; route = 'seance';
    } else {
      titre = 'Tu démarres à ' + nf(alt, 'm') + '.';
      const nomCamp = campDe(alt).nom;
      message = nomCamp + ' atteint. ' + nf(validees.length) +
                ' compétences validées provisoirement : elles reviendront en révision à partir ' +
                'd\'après-demain, 4 par jour.';
    }

    app().innerHTML =
    '<div class="view"><section class="fin-card" data-kind="serie">' +
      '<p class="overline k-gold">' + (camp ? 'Test de camp' : 'Bilan d\'altitude') + '</p>' +
      '<h2 class="display-l">' + esc(titre) + '</h2>' +
      '<div class="figures display">' +
        '<div class="figure" style="--i:0"><b class="num"><span data-cpt="' + alt + '">0</span> m</b>' +
          '<span class="overline">altitude</span></div>' +
        '<div class="figure" style="--i:1"><b class="num"><span data-cpt="' + camps + '">0</span></b>' +
          '<span class="overline">' + (camps > 1 ? 'camps validés' : 'camp validé') + '</span></div>' +
        '<div class="figure" style="--i:2"><b class="num"><span data-cpt="' + validees.length + '">0</span></b>' +
          '<span class="overline">compétences</span></div>' +
      '</div>' +
      '<p class="score num">' + justes + ' / ' + (journal.length || 0) + ' réponses justes</p>' +
      '<p class="msg">' + esc(message) + '</p>' +
      '<div class="next-row"><button class="btn-primary lg" type="button" data-suite>' +
        '<span>' + esc(bouton) + '</span><span class="ic-wrap">' + ic('arrow-right') + '</span></button></div>' +
    '</section></div>';

    app().querySelectorAll('[data-cpt]').forEach((el, i) =>
      after(120 * i, () => compteur(el, 0, Number(el.dataset.cpt), 600)));
    app().querySelector('[data-suite]').addEventListener('click', () => { _onbSon('click'); nav(route); });
    try { majCrete(alt); } catch(e){}
    _onbSon('arpege');
    annoncer(titre + ' ' + message);
  }
}
