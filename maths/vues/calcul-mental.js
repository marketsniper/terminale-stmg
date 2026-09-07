/* ===== Maths · De zéro au sommet : calcul mental et techniques =====
   vCalculMental() : l'accueil du module et le sprint chronométré (PRODUCT-SPEC M11).
   vTechniques()   : le segment « Techniques » du Sentier, 25 médaillons d'opérateur.
   vTechnique(id)  : la page d'une technique, un seul bouton primaire.
   DESIGN-SPEC §6.11, §7.5, §7.6.
   Script classique : portée globale partagée. Symboles propres : vCalculMental,
   vTechniques, vTechnique. Tout le reste est préfixé _cm. */
'use strict';

/* Longueurs de sprint proposées (DESIGN-SPEC §7.5). */
const _cmTAILLES = [12, 25, 50];
let _cmN = 25;

/* ---------- utilitaires ---------- */
/* Médiane d'une liste de durées, en millisecondes. */
function _cmMediane(t){
  if (!t || !t.length) return null;
  const c = t.slice().sort((a, b) => a - b), m = c.length >> 1;
  return c.length % 2 ? c[m] : Math.round((c[m - 1] + c[m]) / 2);
}
/* Secondes affichées à la française : « 3,4 s ». */
function _cmSec(ms){ return ms === null || ms === undefined ? '' : nf(Math.round(ms / 100) / 10, 's', 1); }
/* Ton de la pastille d'une famille (DESIGN-SPEC §6.11). */
function _cmTon(cle){
  return cle === 'automatise' ? 'gold' : cle === 'fiable' ? 'ok'
       : cle === 'progres' ? 'glacier' : cle === 'apprentissage' ? 'warn' : 'muted';
}
/* Rang de tri : « à automatiser d'abord ». */
function _cmRang(cle){
  return cle === 'apprentissage' ? 0 : cle === 'progres' ? 1 : cle === 'decouvrir' ? 2 : cle === 'fiable' ? 3 : 4;
}
/* Familles triées du plus urgent au plus solide. */
function _cmTriees(){
  return CM_FAMS.slice().sort((a, b) => {
    const ea = window.etatFam(a.id), eb = window.etatFam(b.id);
    return _cmRang(ea.cle) - _cmRang(eb.cle) || a.nom.localeCompare(b.nom, 'fr');
  });
}
/* Réussite d'une famille, en pourcentage, ou null si jamais jouée. */
function _cmTaux(fid){
  const s = S.cm.fam[fid];
  return (s && s.n) ? Math.round(100 * s.ok / s.n) : null;
}
/* Résumé d'une famille : « Les bases · 78 % · 24 essais ». */
function _cmResume(f){
  const s = S.cm.fam[f.id], t = _cmTaux(f.id);
  return f.cat + (t === null ? ' · jamais jouée' : ' · ' + fv(t) + ' % · ' + fv(s.n) + ' essais');
}
/* L'astuce doit-elle rester visible pour cette famille ? (S.prefs.cmIndices) */
function _cmAstuceVisible(f){
  const mode = (S.prefs && S.prefs.cmIndices) || 'auto';
  if (mode === 'oui') return true;
  if (mode === 'non') return false;
  const cle = window.etatFam(f.id).cle;
  return cle === 'decouvrir' || cle === 'apprentissage';
}
/* La famille la plus faible : celle que le coach recommande. */
function _cmRecommandee(){
  const t = _cmTriees();
  return t.length ? t[0] : null;
}
/* Médaillon typographique d'une famille (remplace les 25 emojis). */
function _cmMedaille(f, lg){
  return '<span class="op-medal' + (lg ? ' lg' : '') + '" aria-hidden="true">' + esc(f.icone || '·') + '</span>';
}

/* ============================================================
   vCalculMental : accueil du module, puis sprint (DESIGN-SPEC §7.5)
   ============================================================ */
function vCalculMental(p){
  const par = (typeof p === 'string') ? {fam: p} : (p || {});
  if (par.run || par.fam){ _cmSprint(par.fam || null, Number(par.n) || _cmN); return; }

  setCtx('outil');
  const hote = app();
  hote.dataset.density = 'outil';

  const best = S.cm.best || null;
  const auto = CM_FAMS.filter(f => window.etatFam(f.id).cle === 'automatise').length;
  let n = 0, ok = 0;
  CM_FAMS.forEach(f => { const s = S.cm.fam[f.id]; if (s){ n += s.n || 0; ok += s.ok || 0; } });
  const prec = n ? Math.round(100 * ok / n) : null;

  hote.innerHTML =
  '<div class="view">' +
    '<header>' +
      '<h1>Calcul mental</h1>' +
      '<p class="small muted">' + fv(CM_FAMS.length) + ' familles · un objectif de vitesse par famille</p>' +
    '</header>' +
    '<div class="figures">' +
      '<div class="figure"><b>' + (best && best.med ? esc(_cmSec(best.med)) : '·') + '</b><span class="k">Meilleure médiane</span></div>' +
      '<div class="figure"><b>' + (prec === null ? '·' : fv(prec) + ' %') + '</b><span class="k">Précision</span></div>' +
      '<div class="figure"><b>' + fv(auto) + ' / ' + fv(CM_FAMS.length) + '</b><span class="k">Automatisées</span></div>' +
    '</div>' +
    '<div class="segment" id="seg-cm" role="group" aria-label="Longueur du sprint">' +
      _cmTAILLES.map(t =>
        '<label><input type="radio" name="seg-cm" value="' + t + '"' + (t === _cmN ? ' checked' : '') +
        '><span>' + fv(t) + '<b> questions</b></span></label>').join('') +
    '</div>' +
    '<div class="stack">' +
      '<button class="btn-primary lg" type="button" id="cm-go">' +
        '<span>Lancer le sprint</span><span class="meta num" id="cm-n">' + fv(_cmN) + '</span>' +
        '<span class="ic-wrap">' + ic('calculator', 'ic-20') + '</span></button>' +
      '<button class="btn btn-ghost" type="button" id="cm-tech">' + ic('lightning', 'ic-20') + '<span>Voir les techniques</span></button>' +
    '</div>' +
    '<p class="overline">Tes 25 familles</p>' +
    '<div class="skills" id="cm-fams">' +
      '<svg class="rope-line" aria-hidden="true" focusable="false"><line x1="11" y1="0" x2="11" y2="100%"/></svg>' +
      _cmTriees().map(_cmLigneFam).join('') +
    '</div>' +
  '</div>';

  $('seg-cm').addEventListener('change', e => {
    if (!e.target || !e.target.value) return;
    _cmN = Number(e.target.value) || 25;
    const m = $('cm-n'); if (m) m.textContent = fv(_cmN);
    snd.click();
  });
  $('cm-go').addEventListener('click', () => { snd.click(); nav('cm', {run: 1, n: _cmN}); });
  $('cm-tech').addEventListener('click', () => { snd.click(); nav('techniques'); });
  $('cm-fams').addEventListener('click', e => {
    const b = e.target.closest ? e.target.closest('[data-fam]') : null;
    if (!b) return;
    snd.click();
    nav('cm', {run: 1, fam: b.dataset.fam, n: 10});
  });
}

/* Une ligne de famille : médaillon, nom, pastille d'état, barre de réussite. */
function _cmLigneFam(f){
  const e = window.etatFam(f.id), t = _cmTaux(f.id);
  const cible = window.cible(f.id);
  return '<button class="skill' + (e.cle === 'automatise' ? ' done' : '') + '" type="button" data-fam="' + esc(f.id) + '">' +
    '<span class="node" aria-hidden="true"></span>' +
    _cmMedaille(f) +
    '<span class="t">' + esc(f.nom) + '</span>' +
    '<span class="etat"><span class="chip" data-tone="' + _cmTon(e.cle) + '">' + esc(e.nom) + '</span></span>' +
    '<span class="sub small muted">' +
      (t === null ? 'objectif ' + nf(cible, 's', 1) : fv(t) + ' % · médiane ' + (e.med === null ? 'à mesurer' : esc(_cmSec(e.med))) + ' · objectif ' + nf(cible, 's', 1)) +
    '</span>' +
    '<div class="pbar sub" style="--p:' + (t === null ? 0 : t) + '"><i></i></div>' +
  '</button>';
}

/* ============================================================
   Le sprint chronométré
   ============================================================ */
function _cmSprint(famId, n){
  const solo = famId ? CM_FAMS.find(f => f.id === famId) : null;
  if (famId && !solo){ nav('cm'); return; }
  const total = Math.max(1, n || _cmN);

  setCtx('parcours', {title: solo ? solo.nom : 'Sprint calcul mental', count: '1 / ' + total});
  const hote = app();
  hote.dataset.density = 'lecture';
  const modeAstuce = (S.prefs && S.prefs.cmIndices) || 'auto';

  hote.innerHTML =
  '<div class="view">' +
    '<div class="row">' +
      '<div id="cm-tete" class="row"></div>' +
      '<label class="switch"><input type="checkbox" id="cm-sw"' + (modeAstuce === 'non' ? '' : ' checked') + '>' +
        '<span class="track"><span class="thumb"></span></span><span class="switch-t">Astuce</span></label>' +
    '</div>' +
    '<div class="pbar" id="cm-p" style="--p:0"><i></i></div>' +
    '<div id="cm-zone"></div>' +
  '</div>';

  let i = 0, ok = 0, sous = 0, fini = false;
  const temps = [];
  window.vueCourante.garde = () => fini;
  window.vueCourante.enCours = true;

  $('cm-sw').addEventListener('change', e => {
    S.prefs.cmIndices = e.target.checked ? 'auto' : 'non';
    save();
    snd.click();
    toast(e.target.checked ? 'Astuce rétablie pour les familles fragiles.' : 'Astuce coupée. Tu calcules sans filet.',
          {tone: 'info', icon: 'lightbulb'});
  });

  (function poser(){
    if (i >= total){ fini = true; window.vueCourante.enCours = false; window.vueCourante.garde = null; _cmFin(solo, total, ok, sous, temps); return; }

    const fam = solo || cmPick();
    if (!fam){ fini = true; nav('cm'); return; }
    const cibleS = window.cible(fam.id);
    const cibleMs = Math.round(cibleS * 1000);
    const visible = _cmAstuceVisible(fam);
    const etat = window.etatFam(fam.id);

    const tete = $('cm-tete');
    if (tete) tete.innerHTML = _cmMedaille(fam) +
      '<span class="label">' + esc(fam.nom) + '</span>' +
      '<span class="chip" data-tone="' + _cmTon(etat.cle) + '">' + esc(etat.nom) + '</span>';

    const barre = $('cm-p');
    if (barre) barre.style.setProperty('--p', String(Math.round(100 * i / total)));
    const hc = document.getElementById('head-count');
    if (hc) hc.textContent = (i + 1) + ' / ' + total;

    const zone = $('cm-zone');
    zone.innerHTML = '';
    const boite = document.createElement('div');
    zone.appendChild(boite);

    askQuestion(boite, {
      ex: fam.gen(R),
      famId: fam.id,
      tag: fam.nom,
      chrono: true,
      cibleMs: cibleMs,
      count: (i + 1) + ' / ' + total,
      serie: false,
      sansType: true,
      prof: false,
      reprise: false,
      gain: false,
      hint: visible ? fam.astuce : '',
      indices: !visible,
      indice1: fam.astuce
    }, r => {
      const aide = r.aide > 0;
      cmRecord(fam.id, r.ok, r.ms, aide);
      logAnswer(r.ok, r.ms);
      if (r.ok){
        ok++;
        if (!aide && r.ms > 0 && r.ms <= 30000) temps.push(r.ms);
        if (r.ms <= cibleMs) sous++;
      }
      i++;
      poser();
    });
  })();
}

/* Fin de sprint : score, médiane, questions sous l'objectif, record de vitesse. */
function _cmFin(solo, total, ok, sous, temps){
  const med = _cmMediane(temps);
  const best = S.cm.best;
  let record = false;
  if (med !== null && (!best || !best.med || med < best.med)){
    record = !!(best && best.med);
    S.cm.best = {ok: ok, n: total, secs: Math.round(temps.reduce((a, b) => a + b, 0) / 1000), med: med};
    save();
  }
  try { verifierSucces({type: 'cm-fin', n: total, ok: ok, med: med}); } catch(e){}

  const taux = ok / total;
  setCtx('outil');
  const zone = $('cm-zone');
  if (!zone) return;
  zone.innerHTML =
    '<div class="fin-card" data-kind="serie">' +
      '<p class="overline">Sprint terminé</p>' +
      '<h2>' + fv(ok) + ' sur ' + fv(total) + '</h2>' +
      '<p class="msg">' +
        (med === null ? 'Pas assez de temps mesurés pour une médiane.' : 'Médiane ' + esc(_cmSec(med))) +
        ' · ' + fv(sous) + ' sous ton objectif</p>' +
      (record ? '<p class="record">' + ic('crown-simple', 'ic-20') + ' Record de vitesse</p>' : '') +
      '<div class="row">' +
        '<button class="btn-primary" type="button" id="cm-re">Relancer un sprint</button>' +
        '<button class="btn" type="button" id="cm-back">Revenir au calcul</button>' +
      '</div>' +
    '</div>';
  snd.win(taux);
  majAnneauJour();
  $('cm-re').addEventListener('click', () => {
    snd.click();
    nav('cm', {run: 1, fam: solo ? solo.id : null, n: total});
  });
  $('cm-back').addEventListener('click', () => { snd.click(); nav('cm'); });
}

/* ============================================================
   vTechniques : le segment « Techniques » du Sentier (DESIGN-SPEC §7.6)
   ============================================================ */
function vTechniques(p){
  const par = (typeof p === 'string') ? {} : (p || {});
  vProgramme(Object.assign({}, par, {seg: 'tech'}));
}

/* Grille des 25 médaillons, appelée par vProgramme(). */
window.TECH_GRILLE = function(zone){
  const reco = _cmRecommandee();
  const carte = (f, accent) => {
    const e = window.etatFam(f.id);
    return '<button class="card card-link' + (accent ? ' card-accent' : '') + '" type="button" data-fam="' + esc(f.id) + '">' +
      (accent ? '<span class="k k-gold">Recommandée pour toi</span>' : '') +
      _cmMedaille(f, true) +
      '<b>' + esc(f.nom) + '</b>' +
      '<span class="small">' + esc(_cmResume(f)) + '</span>' +
      '<span class="chip" data-tone="' + _cmTon(e.cle) + '">' + esc(e.nom) + '</span>' +
    '</button>';
  };
  const reste = _cmTriees().filter(f => !reco || f.id !== reco.id);
  zone.innerHTML =
    '<p class="small muted">Une méthode par type de calcul. Elles servent aussi d’indice pendant les sprints.</p>' +
    '<div class="tech-grid">' + (reco ? carte(reco, true) : '') + reste.map(f => carte(f, false)).join('') + '</div>';
};

/* ============================================================
   vTechnique : la page d'une technique
   ============================================================ */
function vTechnique(p){
  const id = (typeof p === 'string') ? p : (p && p.id);
  const fam = CM_FAMS.find(f => f.id === id);
  if (!fam){ nav('techniques'); return; }

  const e = window.etatFam(fam.id);
  const cible = window.cible(fam.id);
  const t = _cmTaux(fam.id);

  setCtx('lecon', {parent: 'programme', title: fam.nom});
  const hote = app();
  hote.dataset.density = 'lecture';
  hote.innerHTML =
  '<div class="view">' +
    '<article class="lecon">' +
      '<header class="lecon-head">' +
        '<p class="overline">Technique · ' + esc(fam.cat) + '</p>' +
        '<h1>' + _cmMedaille(fam, true) + ' ' + esc(fam.nom) + '</h1>' +
        '<p class="body-l ink-2">' + esc(fam.astuce) + '</p>' +
        '<p class="lecon-state">' +
          '<span class="chip" data-tone="' + _cmTon(e.cle) + '">' + esc(e.nom) + '</span>' +
          '<span class="small muted">Objectif ' + nf(cible, 's', 1) +
          (e.med === null ? '' : ' · médiane ' + esc(_cmSec(e.med))) +
          (t === null ? '' : ' · ' + fv(t) + ' % de réussite') + '</span>' +
        '</p>' +
      '</header>' +
      '<div class="lecon-body">' + (fam.methode || '<p class="muted">Méthode en préparation.</p>') + '</div>' +
      '<div class="lecon-cta">' +
        '<button class="btn-primary lg" type="button" id="tech-go">' +
          '<span>Lancer un sprint dédié</span><span class="meta num">10</span>' +
          '<span class="ic-wrap">' + ic('arrow-right', 'ic-20') + '</span></button>' +
      '</div>' +
    '</article>' +
  '</div>';

  $('tech-go').addEventListener('click', () => { snd.click(); nav('cm', {run: 1, fam: fam.id, n: 10}); });
  if (typeof _progRevelerCta === 'function') _progRevelerCta();
}
