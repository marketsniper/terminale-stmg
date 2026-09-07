/* ===== Maths · De zéro au sommet : épreuve blanche SESAME et ACCÈS =====
   DESIGN-SPEC §6.34 (bandeau et navigateur) et §7.13 · PRODUCT-SPEC S8, M3, M8.
   Ce fichier déclare : FORMATS, vEpreuve, runEpreuve. Tout le reste est préfixé _ep.
   Script classique : portée globale partagée (ordre de chargement dans index.html). */
'use strict';

/* ============================================================
   0. Formats de concours
   ============================================================ */
const FORMATS = {
  sesame: {cle: 'sesame', nom: 'SESAME', n: 20, min: 20, neg: 0, choix: 4},
  acces:  {cle: 'acces',  nom: 'ACCÈS',  n: 20, min: 20, neg: 0.25, choix: 4}
};

const _epPoolMin = 8;              // compétences travaillées nécessaires
const _epParSkill = 3;             // questions maximum par compétence
const _epAlerte = 60000;           // alerte à une minute

/* Espérance de points d'une réponse au hasard entre k choix (PRODUCT-SPEC S8). */
function _epEsperance(k, neg){
  if (!k) return 0;
  return 1 / k - ((k - 1) / k) * (neg || 0);
}
/* « 0,06 » : deux décimales, virgule française. */
function _epPts(x){ return fv(Math.round(x * 100) / 100, 2); }

/* Les trois lignes de stratégie propres au format. */
function _epRegles(F){
  if (F.neg > 0) return [
    'Une réponse fausse coûte ' + fv(F.neg, 2) + ' point. Une case vide ne coûte rien.',
    'Au hasard entre 4 choix : +' + _epPts(_epEsperance(4, F.neg)) + ' point en moyenne. En éliminant 1 choix : +' +
      _epPts(_epEsperance(3, F.neg)) + '. En éliminant 2 : +' + _epPts(_epEsperance(2, F.neg)) + '.',
    'Règle : passe seulement si tu ne peux rien éliminer et que le temps manque.'
  ];
  return [
    'Aucun point négatif sur ce format.',
    'Réponds à tout, toujours.',
    'Une case laissée vide est un point perdu à coup sûr.'
  ];
}

/* ---------- petits utilitaires ---------- */
function _epHorloge(ms){
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function _epJour(ts){
  try { return new Date(ts).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}); }
  catch(e){ return ''; }
}
/* Réponse attendue mise au format français : jamais sur une fraction ou un littéral. */
function _epVal(v){
  const s = String(v == null ? '' : v);
  return /^\s*-?[\d.,\s −]+\s*$/.test(s) ? fv(s) : s;
}
function _epPool(){
  return SKILLS.filter(s => { const x = st(s.id); return x.n > 0 || x.mastered; });
}
/* Les cinq derniers résultats, en pastilles datées. */
function _epBadges(){
  const derniers = (S.epreuves || []).slice(-5).reverse();
  if (!derniers.length) return '';
  return '<ul class="badges">' + derniers.map(e =>
    '<li class="badge"><span class="num">' + esc(fv(e.note, 1)) + ' / 20</span>' +
    '<span class="small muted">' + esc(e.fmt) + ' · ' + esc(_epJour(e.date)) + '</span></li>').join('') + '</ul>';
}

/* Tirage stratifié : 60 % haut du programme, 30 % milieu, 10 % fondations,
   au plus 3 questions par compétence (PRODUCT-SPEC S8). */
function _epTirage(pool, n){
  const seaux = [
    {phases: [4, 5, 6, 7], part: .6},
    {phases: [2, 3],       part: .3},
    {phases: [1],          part: .1}
  ];
  const vus = {}, sortie = [];
  const dispo = s => (vus[s.id] || 0) < _epParSkill;
  const prendre = liste => {
    const restants = liste.filter(dispo);
    if (!restants.length) return false;
    const s = R.pick(restants);
    vus[s.id] = (vus[s.id] || 0) + 1;
    sortie.push(s);
    return true;
  };
  seaux.forEach(seau => {
    const liste = pool.filter(s => seau.phases.indexOf(s.phase) >= 0);
    const quota = Math.round(n * seau.part);
    for (let k = 0; k < quota; k++) if (!prendre(liste)) break;
  });
  let garde = 0;
  while (sortie.length < n && garde++ < n * 40) if (!prendre(pool)) break;
  return R.shuffle(sortie).slice(0, n);
}

/* ============================================================
   1. Écran « Prêt ? » (DESIGN-SPEC §7.13)
   ============================================================ */
function vEpreuve(){
  const pool = _epPool();
  setCtx('outil');
  app().dataset.density = 'lecture';

  if (pool.length < _epPoolMin){
    app().innerHTML = '<section class="view"><h1>Épreuve blanche</h1>' +
      vide({icone: 'lock-simple',
            titre: 'L\'épreuve blanche a besoin de 8 compétences travaillées.',
            texte: 'Tu en as ' + pool.length + '. Continue le sentier, elle t\'attend.',
            action: {label: 'Continuer le programme', fn: () => nav('programme')}}) + '</section>';
    return;
  }

  let fmt = 'sesame';
  try { const der = (S.epreuves || []).slice(-1)[0]; if (der && der.fmt === FORMATS.acces.nom) fmt = 'acces'; } catch(e){}

  const badges = _epBadges();
  app().innerHTML =
    '<section class="view">' +
      '<p class="overline">Épreuves · conditions réelles</p>' +
      '<h1>Épreuve blanche</h1>' +
      '<div class="segment" role="radiogroup" aria-label="Format de concours">' +
        '<label><input type="radio" name="ep-fmt" value="sesame"' + (fmt === 'sesame' ? ' checked' : '') +
          '><span>SESAME<b class="num">sans malus</b></span></label>' +
        '<label><input type="radio" name="ep-fmt" value="acces"' + (fmt === 'acces' ? ' checked' : '') +
          '><span>ACCÈS<b class="num">malus 0,25</b></span></label>' +
      '</div>' +
      '<section class="card card-muted">' +
        '<h2>20 questions · 20 minutes</h2>' +
        '<p class="small muted">Correction à la fin. Pas d\'indice.</p>' +
        '<div class="lecon" id="ep-regles"></div>' +
      '</section>' +
      '<div class="row"><button class="btn-primary lg" type="button" id="ep-go">' +
        '<span>Commencer l\'épreuve</span><span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
      '<p class="small muted">Une fois lancée : pas de retour en arrière sur le chrono, et le temps ne s\'arrête qu\'à la pause.</p>' +
      (badges ? '<section><p class="overline">Tes cinq dernières épreuves</p>' + badges + '</section>' : '') +
    '</section>';

  const majRegles = () => {
    const c = document.querySelector('input[name="ep-fmt"]:checked');
    const F = FORMATS[(c && c.value) || 'sesame'] || FORMATS.sesame;
    const el = $('ep-regles');
    if (el) el.innerHTML = _epRegles(F).map(t => '<p>' + esc(t) + '</p>').join('');
  };
  document.querySelectorAll('input[name="ep-fmt"]').forEach(r =>
    r.addEventListener('change', () => { snd.click(); majRegles(); }));
  majRegles();

  $('ep-go').addEventListener('click', () => {
    snd.click();
    const c = document.querySelector('input[name="ep-fmt"]:checked');
    nav('epreuveRun', {fmt: (c && c.value) || 'sesame'});
  });
}

/* ============================================================
   2. L'épreuve (DESIGN-SPEC §6.34 et §7.13 · PRODUCT-SPEC S8)
   ============================================================ */
function runEpreuve(params){
  const cle = (typeof params === 'string') ? params : ((params && params.fmt) || 'sesame');
  const F = FORMATS[cle] || FORMATS.sesame;
  const pool = _epPool();

  if (pool.length < _epPoolMin){ vEpreuve(); return; }

  const suite = _epTirage(pool, F.n);
  const N = suite.length;
  const exos = suite.map(s => genFor(s, 2));
  const rep = new Array(N).fill(null);        // null : jamais ouverte · '' : vue et laissée vide
  const temps = new Array(N).fill(0);
  const marques = new Array(N).fill(false);
  const limite = F.min * 60000;
  const jalonsRythme = [5, 10, 15];
  const rythme = [];

  const revus = {};                            // questions déjà revisitées en seconde passe
  let index = 0, fini = false, enPause = false, alerte = false, prevenuRythme = false;
  let passeFinie = false, prevenuReprise = false;
  const t0 = Date.now();
  let pauseDepuis = 0, pauseTotal = 0, ecouleFin = 0;

  window.vueCourante.enCours = true;
  window.vueCourante.garde = () => fini;
  window.MODE_EXAMEN = true;
  surQuitter(() => {
    const c = $('crete'); if (c) c.classList.remove('alarm');
    window.MODE_EXAMEN = false;
  });

  const ecoule = () => (fini ? ecouleFin : (Date.now() - t0 - pauseTotal - (enPause ? Date.now() - pauseDepuis : 0)));
  const reste = () => Math.max(0, limite - ecoule());
  const repondues = () => rep.reduce((a, v) => a + (v ? 1 : 0), 0);
  /* écart de rythme : d = i − floor(écoulé / limite × n) */
  const ecart = () => repondues() - Math.floor(ecoule() / limite * N);

  setCtx('parcours', {title: 'Épreuve ' + F.nom, count: '1 / ' + N, pause: false});
  app().dataset.density = 'outil';

  /* ---------- compte à rebours avant le départ ---------- */
  /* Trois temps posés avec after() : aucune minuterie ne survit au départ. */
  function decompte(apres){
    app().innerHTML =
      '<section class="view"><section class="step-screen card" role="status">' +
        ic('hourglass', 'ic-48') +
        '<h2>Épreuve ' + esc(F.nom) + '</h2>' +
        '<p class="display-l" id="ep-dec">3</p>' +
        '<p class="small muted">20 questions, 20 minutes. Pas de retour en arrière.</p>' +
      '</section></section>';
    const pas = n => {
      const el = $('ep-dec');
      if (!el) return;
      el.textContent = n > 0 ? String(n) : 'Départ';
      snd.tic();
    };
    snd.tic();
    after(1000, () => { pas(2); after(1000, () => { pas(1); after(900, () => { pas(0); after(200, apres); }); }); });
  }

  /* ---------- coque de l'épreuve ---------- */
  const qnav = document.createElement('ol');
  qnav.className = 'q-nav';
  qnav.setAttribute('aria-label', 'Questions');
  qnav.innerHTML = suite.map((s, k) =>
    '<li><button class="q-nav-cell" type="button" data-k="' + k + '">' + (k + 1) + '</button></li>').join('');
  qnav.addEventListener('click', e => {
    const b = e.target && e.target.closest ? e.target.closest('.q-nav-cell') : null;
    if (!b || fini) return;
    snd.click();
    memoriser();
    revus[Number(b.dataset.k)] = true;
    poser(Number(b.dataset.k));
  });

  decompte(() => { if (!fini) demarrer(); });

  function demarrer(){
    if (window.vueCourante.v !== 'epreuveRun') return;
    app().innerHTML =
      '<section class="view">' +
        '<div class="chrono-bar" id="ep-bar">' +
          '<span class="num-l" id="ep-temps">' + _epHorloge(limite) + '</span>' +
          '<span class="num muted" id="ep-pos">Q 1 / ' + N + '</span>' +
          '<span class="chip rythme" id="ep-rythme" data-tone="ok">rythme 0</span>' +
          '<button class="btn-icon" id="btn-pause-ep" type="button" aria-label="Mettre l\'épreuve en pause">' +
            ic('pause', 'ic-24') + '</button>' +
          '<div class="pbar total" id="ep-pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100"' +
            ' aria-valuenow="0" aria-label="Questions répondues" style="--p:0"><i></i></div>' +
        '</div>' +
        '<div class="epreuve-grid" id="ep-grid"></div>' +
        '<div class="row">' +
          '<button class="btn" type="button" id="ep-mark" aria-pressed="false">' +
            ic('bookmark-simple', 'ic-20') + 'Marquer</button>' +
          '<button class="btn" type="button" id="ep-rendre">' +
            ic('paper-plane-right', 'ic-20') + 'Rendre ma copie</button>' +
        '</div>' +
      '</section>';

    $('btn-pause-ep').addEventListener('click', () => { snd.click(); pause(); });
    $('ep-mark').addEventListener('click', () => {
      snd.click();
      marques[index] = !marques[index];
      $('ep-mark').setAttribute('aria-pressed', marques[index] ? 'true' : 'false');
      majNav();
    });
    $('ep-rendre').addEventListener('click', () => { snd.click(); memoriser(); rendre(false); });

    every(250, tic);
    poser(0);
  }

  /* ---------- chrono, rythme, alerte ---------- */
  function tic(){
    if (fini) return;
    const r = reste();
    const el = $('ep-temps');
    if (el) el.textContent = _epHorloge(r);

    const min = Math.floor(ecoule() / 60000);
    while (jalonsRythme.length && min >= jalonsRythme[0]){ jalonsRythme.shift(); rythme.push(ecart()); }

    if (enPause) return;
    const d = ecart();
    const chip = $('ep-rythme');
    if (chip){
      chip.textContent = 'rythme ' + (d > 0 ? '+' + d : fv(d));
      chip.dataset.tone = d >= 0 ? 'ok' : d >= -2 ? 'muted' : 'ko';
    }
    if (d <= -3 && !prevenuRythme){
      prevenuRythme = true;
      toast('Passe les questions longues.', {tone: 'warn', icon: 'clock-countdown'});
    }
    if (r <= _epAlerte && !alerte){
      alerte = true;
      const bar = $('ep-bar'); if (bar) bar.classList.add('alarm');
      const cr = $('crete'); if (cr) cr.classList.add('alarm');
      toast('Une minute.', {tone: 'ko', icon: 'clock-countdown'});
      vibrer([20, 40, 20]);
    }
    if (r <= 0){ memoriser(); rendre(true); }
  }

  /* ---------- pause ---------- */
  function pause(){
    if (fini || enPause) return;
    enPause = true;
    pauseDepuis = Date.now();
    const ch = document.querySelector('#ep-grid .chrono');
    if (ch) ch.classList.add('fige');
    ouvrirFeuille({
      classe: 'pause', titre: 'Épreuve en pause',
      texte: 'Le chrono est arrêté. Il repart dès que tu reprends.',
      boutons: [{label: 'Rendre ma copie', style: 'danger'}, {label: 'Reprendre', style: 'primaire'}]
    }).then(i => {
      pauseTotal += Date.now() - pauseDepuis;
      enPause = false;
      if (ch) ch.classList.remove('fige');
      if (i === 0){ memoriser(); rendre(false); }
    });
  }

  /* ---------- navigateur ---------- */
  function majNav(){
    qnav.querySelectorAll('.q-nav-cell').forEach(b => {
      const k = Number(b.dataset.k);
      let etat = '', mot = 'sans réponse';
      if (k === index){ etat = 'current'; mot = 'en cours'; }
      else if (marques[k]){ etat = 'marked'; mot = 'marquée'; }
      else if (rep[k]){ etat = 'done'; mot = 'répondue'; }
      else if (rep[k] === ''){ etat = 'skipped'; mot = 'passée'; }
      if (etat) b.dataset.state = etat; else delete b.dataset.state;
      if (k === index) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      b.setAttribute('aria-label', 'Question ' + (k + 1) + ', ' + mot);
    });
    const p = Math.round(100 * repondues() / N);
    const bar = $('ep-pbar');
    if (bar){ bar.style.setProperty('--p', String(p)); bar.setAttribute('aria-valuenow', String(p)); }
    const pos = $('ep-pos');
    if (pos) pos.textContent = 'Q ' + (index + 1) + ' / ' + N;
    const m = $('ep-mark');
    if (m) m.setAttribute('aria-pressed', marques[index] ? 'true' : 'false');
  }

  /* Saisie en cours, récupérée avant tout saut ou toute fin de temps. */
  function memoriser(){
    const inp = document.querySelector('#ep-grid .q-card input');
    if (!inp || inp.disabled) return;
    const v = inp.value.trim();
    if (v) rep[index] = v;
    else if (rep[index] === null) rep[index] = '';
  }

  function poser(k){
    if (fini || window.vueCourante.v !== 'epreuveRun') return;
    index = Math.max(0, Math.min(N - 1, k));
    if (passeFinie) revus[index] = true;
    const grid = $('ep-grid');
    if (!grid) return;
    setCtx('parcours', {title: 'Épreuve ' + F.nom, count: (index + 1) + ' / ' + N});
    const sk = suite[index], tq = performance.now();
    askQuestion(grid, {
      ex: exos[index], skill: sk, skillId: sk.id,
      tag: sk.titre, count: (index + 1) + ' / ' + N,
      valeurRep: rep[index] || '',
      differe: true, chrono: false, indices: false, reprise: false,
      sansType: true, serie: false, prof: false, gain: false
    }, r => {
      if (fini) return;
      rep[index] = r.given || '';
      temps[index] = Math.round(performance.now() - tq);
      majNav();
      suivant();
    });
    /* le navigateur reprend sa place de premier enfant de la grille */
    grid.insertBefore(qnav, grid.firstChild);
    majNav();
  }

  function suivant(){
    if (index + 1 >= N) passeFinie = true;
    if (!passeFinie){ poser(index + 1); return; }
    /* seconde passe : les questions laissées de côté ou marquées, une seule fois chacune */
    let cible = -1;
    for (let k = 0; k < N; k++){
      if (revus[k]) continue;
      if (rep[k] === null || rep[k] === '' || marques[k]){ cible = k; break; }
    }
    if (cible >= 0){
      revus[cible] = true;
      if (!prevenuReprise){
        prevenuReprise = true;
        toast('Retour sur les questions laissées de côté.', {tone: 'glacier', icon: 'arrow-counter-clockwise'});
      }
      poser(cible);
      return;
    }
    rendre(false);
  }

  /* ---------- rendre la copie ---------- */
  function rendre(force){
    if (fini) return;
    const vides = rep.filter(v => !v).length;
    if (!force && vides > 0 && reste() > _epAlerte){
      ouvrirFeuille({
        titre: vides + (vides > 1 ? ' questions sans réponse.' : ' question sans réponse.'),
        texte: 'Rendre quand même ?',
        boutons: [{label: 'Continuer l\'épreuve'}, {label: 'Rendre ma copie', style: 'primaire'}]
      }).then(i => { if (i === 1) corriger(force); });
      return;
    }
    corriger(force);
  }

  /* ---------- correction, confinée à sa propre vue ---------- */
  function corriger(tempsEcoule){
    if (fini) return;
    if (window.vueCourante.v !== 'epreuveRun') return;      // jamais de correction dans l'écran d'un autre
    fini = true;
    ecouleFin = Math.min(limite, Date.now() - t0 - pauseTotal);
    window.vueCourante.enCours = false;
    window.vueCourante.garde = null;
    window.MODE_EXAMEN = false;
    const cr = $('crete'); if (cr) cr.classList.remove('alarm');

    /* mesures par question */
    const repondus = temps.filter((ms, k) => ms > 0 && rep[k]);
    const moyenne = repondus.length ? repondus.reduce((a, b) => a + b, 0) / repondus.length : 0;
    const parQ = [], parSkill = {}, fautes = [];
    let just = 0, faux = 0, vide = 0, nHasard = 0;

    for (let k = 0; k < N; k++){
      const sk = suite[k], ex = exos[k], donnee = rep[k] || '';
      const estVide = !donnee;
      const ok = !estVide && isRight(donnee, ex);
      const hasard = !ok && !estVide && moyenne > 0 && (temps[k] || 0) < .2 * moyenne;
      if (estVide) vide++; else if (ok) just++; else faux++;
      if (hasard) nHasard++;
      parQ.push({sid: sk.id, ok: ok, vide: estVide, ms: temps[k] || 0, hasard: hasard});
      const c = parSkill[sk.id] || (parSkill[sk.id] = {ok: 0, n: 0, titre: sk.titre, id: sk.id});
      c.n++; if (ok) c.ok++;
      logAnswer(ok, temps[k] || 0);
      if (!ok) fautes.push({k: k, sk: sk, ex: ex, donnee: donnee, vide: estVide});
    }
    while (jalonsRythme.length){ jalonsRythme.shift(); rythme.push(0); }

    const brut = just - faux * F.neg;
    const note = Math.max(0, Math.round(brut / N * 20 * 10) / 10);
    const minutes = Math.max(1, Math.round(ecouleFin / 60000));

    S.epreuves.push({date: Date.now(), fmt: F.nom, note: note, just: just, faux: faux, vide: vide,
                     n: N, parQ: parQ, hasard: nHasard, rythme: rythme});
    if (S.epreuves.length > 40) S.epreuves.shift();
    jToday().seance = true;
    save();

    /* ---- analyse de stratégie (PRODUCT-SPEC S8) ---- */
    const msgs = [];
    if (F.neg > 0){
      if (nHasard > 0)
        msgs.push('Au hasard : ' + nHasard + (nHasard > 1 ? ' questions' : ' question') + ' : ' +
                  fv(-nHasard * F.neg, 2) + ' point. Élimine un choix avant de cocher.');
      else if (vide > 0)
        msgs.push(vide + (vide > 1 ? ' cases laissées vides' : ' case laissée vide') +
                  '. Sur ce format, une case vide vaut mieux qu\'un coup de dé.');
      else msgs.push('Aucune réponse au hasard détectée. C\'est exactement la bonne conduite sur ACCÈS.');
    } else {
      msgs.push(vide > 0
        ? vide + (vide > 1 ? ' cases vides' : ' case vide') + ' : sans point négatif, chacune est un point perdu.'
        : 'Tu as répondu à tout. C\'est la bonne stratégie sur SESAME.');
    }
    const mi = rythme.length > 1 ? rythme[1] : (rythme[0] != null ? rythme[0] : 0);
    const finRythme = ecart();
    msgs.push(mi < 0
      ? 'Rythme : en retard de ' + Math.abs(mi) + (Math.abs(mi) > 1 ? ' questions' : ' question') + ' à mi-temps, ' +
        (finRythme >= 0 ? 'rattrapé à la fin.' : 'toujours en retard à la fin.')
      : 'Rythme : dans les temps à mi-temps, tu as tenu la cadence jusqu\'au bout.');

    const risque = _epRisque();
    if (risque.length)
      msgs.push('Compétences à risque en concours : ' +
                risque.map(r => r.titre + ' (' + r.ok + '/' + r.n + ')').join(', ') + '.');
    else msgs.push('Aucune compétence à risque sur tes trois dernières épreuves.');

    const pire = Object.keys(parSkill).map(id => parSkill[id])
      .filter(c => c.n >= 2).sort((a, b) => (a.ok / a.n) - (b.ok / b.n))[0] || null;

    /* ---- correction regroupée par compétence ---- */
    let corr = '';
    Object.keys(parSkill).forEach(id => {
      const dedans = fautes.filter(f => f.sk.id === id);
      if (!dedans.length) return;
      const c = parSkill[id];
      corr += '<section class="err-group"><p class="overline">' + esc(c.titre) + ' · ' + c.ok + ' / ' + c.n + '</p>' +
        dedans.map(f =>
          '<article class="err ko">' +
            '<p class="q">' + (f.k + 1) + '. ' + esc(f.ex.q) + '</p>' +
            '<p class="rep">' + (f.vide ? '<span class="small muted">sans réponse</span>' : '<s class="num">' + esc(f.donnee) + '</s>') +
              '<b class="num">' + esc(_epVal(f.ex.a)) + '</b></p>' +
            (f.ex.expl ? '<p class="meta small muted">' + esc(f.ex.expl) + '</p>' : '') +
            '<div class="row">' +
              '<button class="btn sm" type="button" data-ajout="' + f.k + '">' + ic('book-bookmark', 'ic-20') + 'Ajouter au cahier</button>' +
              '<button class="btn sm btn-ghost" type="button" data-lecon="' + esc(f.sk.id) + '">' + ic('book-open', 'ic-20') + 'La leçon</button>' +
            '</div>' +
          '</article>').join('') + '</section>';
    });

    const emoji = note >= 18 ? '<span class="emoji" aria-hidden="true">🎉</span> '
                : note >= 14 ? '<span class="emoji" aria-hidden="true">💪</span> ' : '';

    setCtx('plein');
    app().dataset.density = 'lecture';
    app().innerHTML =
      '<section class="fin-card" data-kind="serie">' +
        '<p class="overline">Épreuve ' + esc(F.nom) + (tempsEcoule ? ' · temps écoulé' : '') + ' · ' + esc(_epJour(Date.now())) + '</p>' +
        '<h2 class="display-l">' + esc(fv(note, 1)) + ' / 20</h2>' +
        '<p class="small muted">' + emoji + just + ' sur ' + N + ' en ' + minutes + ' min.</p>' +
        '<div class="figures display">' +
          '<div class="figure"><b class="num">' + just + '</b><span class="overline">justes</span></div>' +
          '<div class="figure"><b class="num">' + faux + '</b><span class="overline">fausses</span></div>' +
          '<div class="figure"><b class="num">' + vide + '</b><span class="overline">vides</span></div>' +
        '</div>' +
        msgs.slice(0, 3).map(t => '<blockquote class="coach-msg"><p>' + esc(t) + '</p></blockquote>').join('') +
        '<div class="next-row"><button class="btn-primary lg" type="button" id="ep-fini">' +
          '<span>Revenir à Aujourd\'hui</span><span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button></div>' +
        '<div class="row">' +
          (fautes.length ? '<button class="btn" type="button" id="ep-classer">' + ic('book-bookmark', 'ic-20') +
            'Classer mes ' + fautes.length + ' erreurs</button>' : '') +
          (pire ? '<button class="btn" type="button" id="ep-travailler">' + ic('path', 'ic-20') +
            'Travailler ' + esc(pire.titre) + '</button>' : '') +
        '</div>' +
      '</section>' +
      (corr ? '<section class="view"><p class="overline">Correction par compétence</p>' + corr + '</section>' : '');

    const ajoutes = {};
    const ajouter = k => {
      if (ajoutes[k]) return false;
      const f = fautes.find(x => x.k === k);
      if (!f) return false;
      ajoutes[k] = true;
      const ts = Date.now();
      S.erreurs.unshift({sid: f.sk.id, q: f.ex.q, a: f.ex.a, given: f.donnee, expl: f.ex.expl || '',
                         choix: f.ex.choix || null, ts: ts, redo: 0, reprise: 0,
                         type: '', due: ts + JOUR, okAt: 0});
      if (S.erreurs.length > 120) S.erreurs.pop();
      return true;
    };

    document.querySelectorAll('[data-ajout]').forEach(b => b.addEventListener('click', () => {
      snd.click();
      if (ajouter(Number(b.dataset.ajout))){
        save();
        b.disabled = true;
        b.innerHTML = ic('check', 'ic-20') + 'Dans le cahier';
        toast('Ajoutée au cahier. Elle reviendra demain.', {tone: 'ok', icon: 'book-bookmark'});
      }
    }));
    document.querySelectorAll('[data-lecon]').forEach(b =>
      b.addEventListener('click', () => { snd.click(); nav('skill', {id: b.dataset.lecon}); }));

    $('ep-fini').addEventListener('click', () => { snd.click(); nav('accueil'); });
    const bc = $('ep-classer');
    if (bc) bc.addEventListener('click', () => {
      snd.click();
      let n = 0;
      fautes.forEach(f => { if (ajouter(f.k)) n++; });
      save();
      if (n) toast(n + (n > 1 ? ' erreurs classées dans le cahier.' : ' erreur classée dans le cahier.'), {tone: 'ok', icon: 'book-bookmark'});
      nav('erreurs');
    });
    const bt = $('ep-travailler');
    if (bt && pire) bt.addEventListener('click', () => { snd.click(); nav('skill', {id: pire.id}); });
    $('ep-fini').focus();

    if (note >= 16) celebrer(3, {texte: 'Épreuve ' + F.nom + ' · ' + fv(note, 1) + ' sur 20.', icon: 'trophy'});
    else celebrer(2, {texte: 'Épreuve terminée · ' + fv(note, 1) + ' sur 20.', icon: 'hourglass'});
    try { (window.verifierJalons ? verifierJalons() : []).forEach(j => celebrer(j.niveau, {texte: j.texte})); } catch(e){}
    try { verifierSucces({type: 'epreuve-fin', note: note, n: N, ok: just}).forEach(s =>
      celebrer(3, {texte: 'Succès : ' + s.nom + '.', icon: s.ic})); } catch(e){}
    try { majCrete(); majAnneauJour(); } catch(e){}
    annoncer('Épreuve terminée. ' + fv(note, 1) + ' sur 20.');
  }
}

/* Compétences à risque : sur les 3 dernières épreuves, au moins 2 questions et moins de 60 %. */
function _epRisque(){
  const cumul = {};
  (S.epreuves || []).slice(-3).forEach(e => {
    (e.parQ || []).forEach(q => {
      if (!q || !q.sid) return;
      const c = cumul[q.sid] || (cumul[q.sid] = {ok: 0, n: 0});
      c.n++; if (q.ok) c.ok++;
    });
  });
  return Object.keys(cumul).map(id => {
    const sk = SKILLS.find(s => s.id === id);
    return sk ? {id: id, titre: sk.titre, ok: cumul[id].ok, n: cumul[id].n} : null;
  }).filter(x => x && x.n >= 2 && x.ok / x.n < .6)
    .sort((a, b) => (a.ok / a.n) - (b.ok / b.n))
    .slice(0, 3);
}
