/* ===== Maths · De zéro au sommet : le mode papier =====
   PAPIERS_TRIES : les 22 exercices rédigés, triés par phase.
   vPapier()     : le segment « Papier » du Sentier (DESIGN-SPEC §7.14).
   vPapierEx()   : un exercice, chrono, pause, corrigé, auto-évaluation calibrée (§7.15).
   Script classique : portée globale partagée. Symboles propres : PAPIERS_TRIES,
   vPapier, vPapierEx. Tout le reste est préfixé _pap. */
'use strict';

const PAPIERS_TRIES = (window.PAPIERS || []).slice()
  .sort((a, b) => (a.phase - b.phase) || String(a.id).localeCompare(String(b.id)));
/* Alias sans déclaration lexicale : vues/programme.js intercale les nœuds carrés. */
window.PAPIERS_TRIES = PAPIERS_TRIES;

/* ---------- utilitaires ---------- */
/* Nom court de la phase, sans la parenthèse de niveau scolaire. */
function _papNomPhase(p){ return String((PHASES[p] && PHASES[p].nom) || '').replace(/\s*\([^)]*\)\s*$/, ''); }
/* Fiche enregistrée d'un exercice. */
function _papFiche(id){ return (S.papier || {})[id] || null; }
/* Échéance du re-test, en clair. */
function _papDue(f){
  if (!f || !f.due) return '';
  const j = Math.round((f.due - Date.now()) / JOUR);
  if (j <= 0) return 'à refaire aujourd’hui';
  if (j === 1) return 'à refaire demain';
  return 'à refaire dans ' + fv(j) + ' jours';
}
/* Les exercices dont le re-test est arrivé à échéance. */
function _papDus(){
  const now = Date.now();
  return PAPIERS_TRIES.filter(x => { const f = _papFiche(x.id); return f && f.due && f.due <= now; });
}
/* Chrono « 12:40 ». */
function _papChrono(ms){
  const s = Math.max(0, Math.round(ms / 1000));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

/* ============================================================
   vPapier : le segment « Papier » du Sentier
   ============================================================ */
function vPapier(p){
  const par = (typeof p === 'string') ? {} : (p || {});
  vProgramme(Object.assign({}, par, {seg: 'papier'}));
}

/* Liste des 22 exercices, appelée par vProgramme(). */
window.PAP_LISTE = function(zone){
  if (!PAPIERS_TRIES.length){
    zone.innerHTML = vide({icone: 'pencil-line', titre: 'Aucun exercice rédigé.',
                           texte: 'Les sujets sur feuille arrivent avec la prochaine mise à jour.'});
    return;
  }
  const dus = _papDus();
  let html =
    '<p class="small muted">Une feuille, un stylo, le temps indiqué. Tu rédiges à la main, ' +
    'puis tu compares au corrigé et tu coches ce que tu as réellement écrit. ' +
    'C’est la rédaction qu’on note le jour J.</p>';

  if (dus.length){
    const d = dus[0];
    html +=
      '<div class="card card-accent">' +
        '<p class="k k-gold">Re-test programmé</p>' +
        '<h2>' + esc(d.titre) + '</h2>' +
        '<p class="small">' + nf(d.duree, 'min') + ' sur feuille' +
          (dus.length > 1 ? ' · et ' + fv(dus.length - 1) + ' autre' + (dus.length > 2 ? 's' : '') : '') + '</p>' +
        '<div class="row"><button class="btn-primary sm" type="button" data-pap="' + esc(d.id) + '">' +
          '<span>Reprendre cet exercice</span><span class="ic-wrap">' + ic('pencil-line', 'ic-20') + '</span>' +
        '</button></div>' +
      '</div>';
  }

  for (let p = 1; p <= 7; p++){
    const lot = PAPIERS_TRIES.filter(x => x.phase === p);
    if (!lot.length) continue;
    const faits = lot.filter(x => { const f = _papFiche(x.id); return f && f.score >= .8; }).length;
    html +=
      '<details class="phase" data-phase="' + p + '" style="--tint:var(--tint-' + p + ')" open>' +
        '<summary class="phase-head">' +
          ringSVG({val: faits, max: lot.length, taille: 20, texte: false,
                   libelle: fv(faits) + ' exercices sur ' + fv(lot.length)}) +
          '<h2>Papier · ' + esc(_papNomPhase(p)) + '</h2>' +
          '<span class="etat num">' + fv(faits) + ' / ' + fv(lot.length) + '</span>' +
          ic('caret-right', 'caret') +
        '</summary>' +
        '<div class="skills">' +
          '<svg class="rope-line" aria-hidden="true" focusable="false"><line x1="11" y1="0" x2="11" y2="100%"/></svg>' +
          lot.map((x, i) => _papLigne(x, i + 1)).join('') +
        '</div>' +
      '</details>';
  }
  zone.innerHTML = html;
};

/* Une ligne d'exercice : nœud carré, numéro P.n, titre, score, durée et échéance. */
function _papLigne(x, n){
  const f = _papFiche(x.id);
  const cls = ['skill', 'paper'];
  if (f && f.score >= .8) cls.push('done');
  const due = _papDue(f);
  const etat = f ? fv(Math.round(f.score * 100)) + ' %' : 'à faire';
  return '<button class="' + cls.join(' ') + '" type="button" data-pap="' + esc(x.id) + '">' +
    '<span class="node" aria-hidden="true"></span>' +
    '<span class="num">P.' + fv(n) + '</span>' +
    '<span class="t">' + esc(x.titre) + '</span>' +
    '<span class="etat num">' + esc(etat) + '</span>' +
    '<span class="sub small muted">' + nf(x.duree, 'min') + ' sur feuille' + (due ? ' · ' + esc(due) : '') + '</span>' +
  '</button>';
}

/* ============================================================
   vPapierEx : un exercice rédigé (DESIGN-SPEC §7.15)
   ============================================================ */
function vPapierEx(p){
  const id = (typeof p === 'string') ? p : (p && p.id);
  const x = PAPIERS_TRIES.find(e => e.id === id);
  if (!x){ nav('papier'); return; }

  const f = _papFiche(x.id);
  setCtx('parcours', {title: 'Papier · ' + x.titre, count: '00:00'});
  const hote = app();
  hote.dataset.density = 'lecture';

  hote.innerHTML =
  '<div class="view">' +
    '<header>' +
      '<p class="overline">Exercice rédigé · ' + nf(x.duree, 'min') + '</p>' +
      '<h1>' + esc(x.titre) + '</h1>' +
      (f ? '<p class="small muted">Déjà fait le ' + esc(new Date(f.ts).toLocaleDateString('fr-FR')) +
           ' · ' + fv(Math.round(f.score * 100)) + ' %</p>' : '') +
    '</header>' +
    '<article class="lecon">' + (x.enonce || '<p class="muted">Énoncé indisponible.</p>') + '</article>' +
    '<div class="row" id="pap-actions">' +
      '<button class="btn-primary lg" type="button" id="pap-corr">' +
        '<span>Voir le corrigé</span><span class="meta num" id="pap-ch">00:00</span>' +
        '<span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button>' +
      '<button class="btn btn-ghost" type="button" id="pap-pause">' + ic('pause', 'ic-20') + '<span>Mettre en pause</span></button>' +
    '</div>' +
    '<p class="small muted">Rédige comme pour un correcteur : une phrase de méthode, le calcul posé, une phrase de conclusion.</p>' +
    '<div id="pap-z"></div>' +
  '</div>';

  /* ---------- chrono : une seule minuterie, tenue par le registre du cœur ---------- */
  let base = Date.now(), acc = 0, enPause = false, arrete = false;
  const ecoule = () => acc + (enPause || arrete ? 0 : Date.now() - base);
  const majChrono = () => {
    const t = _papChrono(ecoule());
    const a = $('pap-ch'); if (a) a.textContent = t;
    const b = document.getElementById('head-count'); if (b) b.textContent = t;
  };
  every(1000, majChrono);
  majChrono();

  window.vueCourante.garde = () => arrete;
  window.vueCourante.enCours = true;

  $('pap-pause').addEventListener('click', () => {
    if (arrete) return;
    snd.click();
    acc += Date.now() - base;
    enPause = true;
    majChrono();
    ouvrirFeuille({
      titre: 'Exercice en pause',
      texte: 'Le chrono est arrêté. Reprends quand tu veux, ta feuille t’attend.',
      boutons: [{label: 'Reprendre', style: 'primaire'}]
    }).then(() => { base = Date.now(); enPause = false; majChrono(); });
  });

  $('pap-corr').addEventListener('click', () => {
    snd.click();
    if (!enPause) acc += Date.now() - base;
    arrete = true;
    window.vueCourante.enCours = false;
    window.vueCourante.garde = null;
    majChrono();
    _papCorrige(x, Math.max(1, Math.round(acc / 60000)));
  });
}

/* Corrigé, puis auto-évaluation critère par critère. */
function _papCorrige(x, minutes){
  const crit = Array.isArray(x.criteres) ? x.criteres : [];
  const z = $('pap-z');
  if (!z) return;

  const actions = $('pap-actions'); if (actions) actions.hidden = true;

  z.innerHTML =
    '<article class="lecon">' +
      '<h2>La rédaction modèle</h2>' +
      (x.corrige || '<p class="muted">Corrigé indisponible.</p>') +
    '</article>' +
    '<div class="card card-muted">' +
      '<p class="k">Auto-évaluation</p>' +
      '<h2>Coche ce que tu as écrit.</h2>' +
      '<p class="small muted">Un critère se coche seulement si la phrase ou le calcul est bien sur ta feuille. ' +
        'À moitié fait, il ne compte pas : c’est ce qui rend la note utile.</p>' +
      '<div class="crit">' + crit.map((c, i) =>
        '<label class="crit-l"><input type="checkbox" data-c="' + i + '"><span>' + esc(c) + '</span></label>').join('') +
      '</div>' +
      '<div class="row"><button class="btn-primary" type="button" id="pap-ok">' +
        '<span>Valider mon auto-évaluation</span><span class="ic-wrap">' + ic('check', 'ic-20') + '</span></button></div>' +
    '</div>';
  try { z.scrollIntoView({block: 'start'}); } catch(e){}

  $('pap-ok').addEventListener('click', () => {
    snd.click();
    const cases = Array.from(z.querySelectorAll('input[data-c]'));
    const coches = cases.filter(i => i.checked).map(i => Number(i.dataset.c));
    const tot = cases.length || 1;
    const n = coches.length;
    /* Calibrage : tout coché en moins de la moitié du temps prévu, on redemande. */
    if (n === tot && minutes < Math.max(3, x.duree / 2)){
      confirmer('Tout est coché, et vite.',
        'Relis le corrigé ligne à ligne. Un critère à moitié rédigé ne se coche pas. Tu confirmes ton évaluation ?',
        {valider: 'Je confirme', annuler: 'Je relis'})
        .then(ok => { if (ok) _papEnregistrer(x, n, tot, coches, minutes); });
      return;
    }
    _papEnregistrer(x, n, tot, coches, minutes);
  });
}

/* Enregistre le résultat, programme le re-test, affiche la carte de fin. */
function _papEnregistrer(x, n, tot, coches, minutes){
  const score = tot ? n / tot : 0;
  const ancienne = _papFiche(x.id);
  const hist = ((ancienne && ancienne.hist) || []).concat([{ts: Date.now(), score: score, min: minutes}]).slice(-8);
  const jours = score >= .8 ? 21 : score >= .5 ? 7 : 3;

  S.papier = S.papier || {};
  S.papier[x.id] = {score: score, n: n, tot: tot, ts: Date.now(), min: minutes,
                    due: Date.now() + jours * JOUR, hist: hist, check: coches};
  const j = jToday();
  if (score >= .5) j.seance = true;
  save();

  try { verifierSucces({type: 'papier-fin', score: score}); } catch(e){}
  snd.win(score);
  if (score >= .8) celebrer(3, {texte: 'Copie propre. C’est ce qu’attend un correcteur.', tone: 'gold', icon: 'pencil-line'});

  const msg = score >= .8
    ? 'Rédaction solide. Le raisonnement se lit sans effort.'
    : score >= .5 ? 'La méthode est là, la rédaction manque encore de rigueur.'
    : 'Reprends la leçon, puis refais cet exercice à froid. La rédaction se travaille comme le calcul.';

  setCtx('outil');
  const z = $('pap-z');
  z.innerHTML =
    '<div class="fin-card" data-kind="serie">' +
      '<p class="overline">Copie évaluée</p>' +
      '<h2>' + fv(n) + ' critères sur ' + fv(tot) + '</h2>' +
      '<p class="msg">' + esc(msg) + '</p>' +
      '<div class="figures">' +
        '<div class="figure"><b>' + fv(Math.round(score * 100)) + ' %</b><span class="k">Rédaction</span></div>' +
        '<div class="figure"><b>' + nf(minutes, 'min') + '</b><span class="k">Temps passé</span></div>' +
        '<div class="figure"><b>' + nf(jours, 'j') + '</b><span class="k">Prochain re-test</span></div>' +
      '</div>' +
      '<div class="row">' +
        '<button class="btn-primary" type="button" id="pap-fin">Terminer</button>' +
        '<button class="btn" type="button" id="pap-later">Refaire plus tard</button>' +
      '</div>' +
    '</div>';
  try { z.scrollIntoView({block: 'start'}); } catch(e){}

  $('pap-fin').addEventListener('click', () => { snd.click(); nav('papier'); });
  $('pap-later').addEventListener('click', () => {
    snd.click();
    S.papier[x.id].due = Date.now() + 3 * JOUR;
    save();
    toast('Re-test programmé dans 3 jours. Il attendra dans le Sentier.', {tone: 'glacier', icon: 'clock-countdown'});
    nav('papier');
  });
}
