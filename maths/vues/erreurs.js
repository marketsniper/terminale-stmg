/* ===== Maths · De zéro au sommet : le cahier d'erreurs (PRODUCT-SPEC M10, DESIGN-SPEC §6.19 et §7.8) =====
   Script classique : portée globale partagée (ordre de chargement dans index.html).
   Ce fichier ne déclare au premier niveau que : vErreurs.
   Tout le reste est préfixé _err (propriété exclusive de ce fichier) ou posé sur window sans déclaration. */
'use strict';

/* ============================================================
   0. État de l'écran (conservé d'un rendu à l'autre)
   ============================================================ */
let _errFiltres = ['toutes'];          // multi-sélection : 'toutes' | 'jour' | id de type | 'nonclassee'
let _errGroupe = 'jour';               // 'jour' | 'skill'

/* ============================================================
   1. Petits utilitaires
   ============================================================ */
function _errSkill(sid){ try { return (window.SKILLS || []).find(s => s.id === sid) || null; } catch(e){ return null; } }
function _errTitre(sid){ const s = _errSkill(sid); return s ? s.titre : 'compétence archivée'; }
function _errType(id){ try { return TYPES_ERR.find(t => t.id === id) || null; } catch(e){ return null; } }

/* Minuit d'aujourd'hui, en millisecondes : sert à compter des jours entiers. */
function _errMinuit(){ const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }

/* Échéance d'une erreur, avec le repli de migration (M10 : due = ts + 1 j, ou 3 j si déjà réussie une fois). */
function _errDue(e){ return e.due || (e.ts + (e.redo ? 3 : 1) * JOUR); }

/* Nombre de jours entiers entre aujourd'hui et l'échéance (0 = aujourd'hui, 1 = demain). */
function _errDansJours(e){ return Math.round((_errDue(e) - _errMinuit()) / JOUR); }

const _errJours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const _errMois = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/* « jeudi » dans la semaine qui vient, « le 12 oct. » au-delà. */
function _errQuandTexte(ts){
  const d = new Date(ts), n = Math.round((ts - _errMinuit()) / JOUR);
  if (n <= 0) return "aujourd'hui";
  if (n === 1) return 'demain';
  if (n <= 7) return _errJours[d.getDay()];
  return 'le ' + d.getDate() + ' ' + _errMois[d.getMonth()];
}

/* Ancienneté : « aujourd'hui », « hier », « il y a 3 j ». */
function _errDepuisTexte(ts){
  const n = Math.round((_errMinuit() - new Date(ts).setHours(0, 0, 0, 0)) / JOUR);
  if (n <= 0) return "aujourd'hui";
  if (n === 1) return 'hier';
  return 'il y a ' + n + ' j';
}

/* Ligne d'échéance affichée dans la carte (M10). */
function _errEcheanceTexte(e){
  const n = _errDansJours(e);
  const quand = n <= 0 ? "aujourd'hui" : n === 1 ? 'demain' : _errQuandTexte(_errDue(e));
  if ((e.redo || 0) >= 1) return 'réussie 1 fois · revoir ' + (n <= 0 ? "aujourd'hui" : quand);
  return 'à refaire ' + quand;
}

/* Titre du groupe de jour : « Aujourd'hui », « Hier », « Il y a 3 jours ». */
function _errGroupeTitre(ts){
  const n = Math.round((_errMinuit() - new Date(ts).setHours(0, 0, 0, 0)) / JOUR);
  if (n <= 0) return "Aujourd'hui";
  if (n === 1) return 'Hier';
  if (n < 7) return 'Il y a ' + n + ' jours';
  if (n < 14) return 'La semaine dernière';
  return 'Plus tôt';
}

/* ============================================================
   2. Échéancier (M10) : les erreurs dues, et la réparation
   Ces deux fonctions appartiennent au cahier ; elles sont
   exposées sur window pour la séance, sans déclaration lexicale.
   ============================================================ */
/* Les erreurs à refaire aujourd'hui, complétées par les plus anciennes jamais réussies. */
function _errDues(max){
  const n = max || 4, now = Date.now();
  const dues = S.erreurs.filter(e => _errDue(e) <= now).sort((a, b) => _errDue(a) - _errDue(b));
  const liste = dues.slice(0, n);
  if (liste.length < n){
    S.erreurs.filter(e => !(e.redo > 0) && liste.indexOf(e) < 0)
      .sort((a, b) => a.ts - b.ts)
      .slice(0, n - liste.length)
      .forEach(e => liste.push(e));
  }
  return liste;
}

/* Résultat d'une reprise. Retourne {etat, texte} : 'reparee', 'attente', 'tot', 'echec'. */
function _errReparer(e, ok){
  const now = Date.now();
  if (!ok){
    e.redo = 0; e.due = now + JOUR; save();
    return {etat: 'echec', texte: 'On la remet à demain. Elle revient jusqu\'à ce qu\'elle soit à toi.'};
  }
  if (!(e.redo > 0)){
    e.redo = 1; e.okAt = now; e.due = now + 3 * JOUR; save();
    return {etat: 'attente', texte: 'Première réussite. On la revoit dans 3 jours pour être sûr.'};
  }
  if (now - (e.okAt || 0) >= 2 * JOUR){
    const i = S.erreurs.indexOf(e);
    if (i >= 0) S.erreurs.splice(i, 1);
    S.reparees.push({sid: e.sid, q: e.q, type: e.type || '', ts: now});
    if (S.reparees.length > 50) S.reparees = S.reparees.slice(-50);
    S.compteurs.reparees = (S.compteurs.reparees || 0) + 1;
    save();
    try { emettre('erreur-reparee', {sid: e.sid, type: e.type || ''}); } catch(x){}
    try { verifierSucces({type: 'erreur-reparee'}); } catch(x){}
    const nom = e.type ? window.nomType(e.type).toLowerCase() : '';
    return {etat: 'reparee', texte: 'Erreur' + (nom ? ' de ' + nom : '') + ' réparée. ' +
            fv(S.compteurs.reparees) + ' réparées au total.'};
  }
  e.due = (e.okAt || now) + 3 * JOUR; save();
  return {etat: 'tot', texte: 'Réussie, mais trop tôt pour être sûre : on la revoit dans 3 jours.'};
}

if (typeof window.erreursDues !== 'function') window.erreursDues = _errDues;
if (typeof window.reparer !== 'function') window.reparer = _errReparer;

/* ============================================================
   3. Diagnostic sur 30 jours (M10)
   ============================================================ */
function _errDiagnostic(){
  const depuis30 = Date.now() - 30 * JOUR;
  const tout = S.erreurs.filter(e => e.ts >= depuis30)
    .concat((S.reparees || []).filter(r => r.ts >= depuis30));
  const total = tout.length;
  if (total < 5) return null;
  const compte = {};
  tout.forEach(e => { if (e.type) compte[e.type] = (compte[e.type] || 0) + 1; });
  const cles = Object.keys(compte);
  if (!cles.length) return null;
  cles.sort((a, b) => compte[b] - compte[a]);
  const id = cles[0], n = compte[id], t = _errType(id);
  if (!t) return null;
  const pct = Math.round(100 * n / total);
  return t.nom + ' : ' + pct + ' % de tes erreurs (' + n + ' sur ' + total + '). Ta règle : ' + t.conseil;
}

/* ============================================================
   4. Filtres
   ============================================================ */
function _errCompteurs(){
  const now = Date.now();
  const c = {toutes: S.erreurs.length, jour: 0, nonclassee: 0};
  TYPES_ERR.forEach(t => { c[t.id] = 0; });
  S.erreurs.forEach(e => {
    if (_errDue(e) <= now) c.jour++;
    if (e.type && c[e.type] !== undefined) c[e.type]++;
    if (!e.type) c.nonclassee++;
  });
  return c;
}
function _errPasse(e){
  if (_errFiltres.indexOf('toutes') >= 0) return true;
  const now = Date.now();
  return _errFiltres.some(f => {
    if (f === 'jour') return _errDue(e) <= now;
    if (f === 'nonclassee') return !e.type;
    return e.type === f;
  });
}
function _errListe(){
  return S.erreurs.filter(_errPasse).sort((a, b) => _errDue(a) - _errDue(b) || a.ts - b.ts);
}

/* ============================================================
   5. Rendu d'une entrée (DESIGN-SPEC §6.19)
   ============================================================ */
function _errCarte(e, i){
  const now = Date.now();
  const due = _errDue(e) <= now;
  const t = _errType(e.type);
  const pastille = t
    ? '<span class="chip" data-tone="' + t.tone + '">' + esc(t.nom) + '</span>'
    : '<button class="err-type" type="button" data-tone="muted" data-classer="' + i + '">non classée</button>';
  const donnee = (e.given === undefined || e.given === null || e.given === '') ? '' : String(e.given);
  return '<article class="err" data-i="' + i + '"' + (e.type ? ' data-type="' + esc(e.type) + '"' : '') +
    (due ? ' data-due="today"' : '') + '>' +
    '<p class="q">' + esc(e.q) + '</p>' +
    '<p class="rep">' + (donnee ? '<s class="num">' + esc(donnee) + '</s>' : '') +
      '<b class="num">' + esc(e.a) + '</b></p>' +
    '<p class="meta small muted">' + pastille +
      '<span>' + esc(_errTitre(e.sid)) + '</span>' +
      '<span>' + esc(_errDepuisTexte(e.ts)) + '</span>' +
      '<span class="due">' + esc(_errEcheanceTexte(e)) + '</span></p>' +
    '<div class="row">' +
      '<button class="btn sm" type="button" data-refaire="' + i + '">Refaire</button>' +
      (_errSkill(e.sid) ? '<button class="btn sm btn-ghost" type="button" data-lecon="' + i + '">' +
        ic('book-open') + 'La leçon</button>' : '') +
      '<button class="btn-icon" type="button" data-retirer="' + i + '" aria-label="Retirer cette erreur du cahier">' +
        ic('trash', 'ic-20') + '</button>' +
    '</div></article>';
}

/* ============================================================
   6. La vue
   ============================================================ */
function vErreurs(){
  const cible = app();
  if (!cible) return;
  setCtx('outil');
  cible.dataset.density = 'outil';

  if (!S.erreurs.length && !(S.reparees || []).length){
    cible.className = 'view view-erreurs';
    cible.innerHTML = '<h1>Le cahier</h1>' + vide({
      illus: 'il-vide',
      titre: 'Aucune erreur en attente.',
      texte: "C'est ici que les progrès se fabriquent : chaque erreur revient jusqu'à être réparée.",
      action: {label: 'Lancer une séance', fn: () => nav('seance')}
    });
    return;
  }

  const c = _errCompteurs();
  const liste = _errListe();
  const diag = _errDiagnostic();
  const semaine = (S.reparees || []).filter(r => r.ts >= Date.now() - 7 * JOUR).length;
  const dominant = (function(){
    let id = '', n = 0;
    TYPES_ERR.forEach(t => { if (c[t.id] > n){ n = c[t.id]; id = t.nom; } });
    return n ? id : 'à classer';
  })();

  /* chips de filtre : Toutes, À refaire aujourd'hui, les 5 types, non classée */
  const chip = (cle, nom, compte) =>
    '<button class="err-type" type="button" data-f="' + cle + '"' +
    (cle !== 'toutes' && cle !== 'jour' && cle !== 'nonclassee' ? ' data-tone="' + (_errType(cle) || {}).tone + '"' : '') +
    ' aria-pressed="' + (_errFiltres.indexOf(cle) >= 0 ? 'true' : 'false') + '">' +
    esc(nom) + (compte != null ? '<span class="num">' + compte + '</span>' : '') + '</button>';

  let chips = chip('toutes', 'Toutes', c.toutes) + chip('jour', 'À refaire aujourd\'hui', c.jour);
  TYPES_ERR.forEach(t => { if (c[t.id]) chips += chip(t.id, t.nom, c[t.id]); });
  if (c.nonclassee) chips += chip('nonclassee', 'Non classées', c.nonclassee);

  /* groupes */
  let corps = '';
  if (!liste.length){
    corps = '<p class="small muted">Aucune erreur ne correspond à ce filtre.</p>';
  } else if (_errGroupe === 'skill'){
    const parSkill = {};
    liste.forEach(e => { (parSkill[e.sid] = parSkill[e.sid] || []).push(e); });
    Object.keys(parSkill).forEach(sid => {
      corps += '<section class="err-group"><p class="overline">' + esc(_errTitre(sid)) + '</p>' +
        parSkill[sid].map(e => _errCarte(e, S.erreurs.indexOf(e))).join('') + '</section>';
    });
  } else {
    let titre = '';
    liste.forEach(e => {
      const g = _errGroupeTitre(e.ts);
      if (g !== titre){
        if (titre) corps += '</section>';
        titre = g;
        corps += '<section class="err-group"><p class="overline">' + esc(g) + '</p>';
      }
      corps += _errCarte(e, S.erreurs.indexOf(e));
    });
    if (titre) corps += '</section>';
  }

  const rep = (S.reparees || []).slice().reverse();
  const pied = rep.length
    ? '<details class="err-repares"><summary>Réparées (' + fv(S.compteurs.reparees || rep.length) + ')</summary>' +
      rep.slice(0, 30).map(r => '<article class="err" data-done>' +
        '<p class="q">' + esc(r.q) + '</p>' +
        '<p class="meta small muted"><span>' + esc(_errTitre(r.sid)) + '</span>' +
        '<span>' + esc(_errDepuisTexte(r.ts)) + '</span></p></article>').join('') +
      '</details>'
    : '';

  const aRefaire = Math.min(5, liste.length);

  cible.className = 'view view-erreurs';
  cible.innerHTML =
    '<h1>Le cahier</h1>' +
    '<div class="figures">' +
      '<div class="figure"><b>' + fv(c.toutes) + '</b><span class="k">En attente</span></div>' +
      '<div class="figure"><b>' + fv(semaine) + '</b><span class="k">Réparées · 7 j</span></div>' +
      '<div class="figure"><b>' + esc(dominant) + '</b><span class="k">Type dominant</span></div>' +
    '</div>' +
    (diag ? '<p class="coach-msg">' + esc(diag) + '</p>' : '') +
    '<div class="err-types filtre" role="group" aria-label="Filtrer le cahier">' + chips + '</div>' +
    '<div class="segment" role="radiogroup" aria-label="Regrouper les erreurs">' +
      '<label><input type="radio" name="err-grp" value="jour"' + (_errGroupe === 'jour' ? ' checked' : '') + '><span>Par jour</span></label>' +
      '<label><input type="radio" name="err-grp" value="skill"' + (_errGroupe === 'skill' ? ' checked' : '') + '><span>Par compétence</span></label>' +
    '</div>' +
    (aRefaire ? '<button class="btn-primary" type="button" id="err-go"><span>Refaire ' + aRefaire +
      (aRefaire > 1 ? ' erreurs' : ' erreur') + '</span><span class="ic-wrap">' + ic('arrow-right') + '</span></button>' : '') +
    '<div id="err-liste">' + corps + '</div>' +
    '<div class="row"><button class="btn btn-ghost" type="button" id="err-add">' + ic('plus') +
      'Ajouter une erreur</button></div>' +
    pied;

  _errBrancher(liste);
}

/* ============================================================
   7. Écouteurs de la vue
   ============================================================ */
function _errBrancher(liste){
  const zone = app();
  if (!zone) return;

  zone.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
    snd.click();
    const f = b.dataset.f;
    if (f === 'toutes') _errFiltres = ['toutes'];
    else {
      _errFiltres = _errFiltres.filter(x => x !== 'toutes');
      const i = _errFiltres.indexOf(f);
      if (i >= 0) _errFiltres.splice(i, 1); else _errFiltres.push(f);
      if (!_errFiltres.length) _errFiltres = ['toutes'];
    }
    vErreurs();
  }));

  zone.querySelectorAll('input[name="err-grp"]').forEach(r => r.addEventListener('change', () => {
    _errGroupe = r.value; snd.click(); vErreurs();
  }));

  zone.querySelectorAll('[data-lecon]').forEach(b => b.addEventListener('click', () => {
    const e = S.erreurs[Number(b.dataset.lecon)];
    if (e) nav('skill', {id: e.sid});
  }));

  zone.querySelectorAll('[data-classer]').forEach(b => b.addEventListener('click', () => {
    const e = S.erreurs[Number(b.dataset.classer)];
    if (e) _errFeuilleType(e);
  }));

  zone.querySelectorAll('[data-retirer]').forEach(b => b.addEventListener('click', () => {
    const e = S.erreurs[Number(b.dataset.retirer)];
    if (!e) return;
    confirmer('Retirer cette erreur ?', 'Elle sortira du cahier sans compter comme réparée.',
              {valider: 'Retirer', danger: true}).then(oui => {
      if (!oui) return;
      const i = S.erreurs.indexOf(e);
      if (i >= 0) S.erreurs.splice(i, 1);
      save();
      toast('Erreur retirée du cahier.', {tone: 'info', icon: 'trash'});
      vErreurs();
    });
  }));

  zone.querySelectorAll('[data-refaire]').forEach(b => b.addEventListener('click', () => {
    const e = S.erreurs[Number(b.dataset.refaire)];
    if (e) _errParcours([e]);
  }));

  const go = document.getElementById('err-go');
  if (go) go.addEventListener('click', () => { snd.click(); _errParcours(liste.slice(0, 5)); });

  const add = document.getElementById('err-add');
  if (add) add.addEventListener('click', () => { snd.click(); _errFeuilleAjout(); });
}

/* ============================================================
   8. Classer une erreur restée sans type
   ============================================================ */
function _errFeuilleType(e){
  const contenu = '<div class="err-types">' + TYPES_ERR.map(t =>
    '<button class="err-type" type="button" data-tone="' + t.tone + '" data-t="' + t.id + '">' + esc(t.nom) + '</button>'
  ).join('') + '</div>';
  ouvrirFeuille({
    titre: 'Que s\'est-il passé ?',
    texte: 'Je m\'en sers pour te coacher. Aucune de ces réponses ne compte contre toi.',
    contenu: contenu,
    boutons: [{label: 'Plus tard'}],
    apres(dlg){
      dlg.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => {
        e.type = b.dataset.t;
        noteType(e.type);
        save();
        fermerFeuille(0);
        after(60, () => { vErreurs(); toast('Classée : ' + window.nomType(e.type) + '.', {tone: 'ok', icon: 'check-circle'}); });
      }));
    }
  });
}

/* ============================================================
   9. Ajouter une erreur faite sur papier
   ============================================================ */
function _errFeuilleAjout(){
  let opts = '';
  try {
    const f = frontier();
    opts = (window.SKILLS || []).map(s =>
      '<option value="' + esc(s.id) + '"' + (f && f.id === s.id ? ' selected' : '') + '>' + esc(s.titre) + '</option>').join('');
  } catch(e){}
  const contenu =
    '<label class="field"><span class="label">L\'énoncé</span>' +
      '<textarea id="err-a-q" rows="3" placeholder="Calcule : (−3) × (−4)"></textarea></label>' +
    '<label class="field"><span class="label">La réponse attendue</span>' +
      '<input class="input" id="err-a-a" type="text" inputmode="text" autocomplete="off" spellcheck="false"></label>' +
    '<label class="field"><span class="label">La compétence</span>' +
      '<select class="input" id="err-a-s">' + opts + '</select></label>' +
    '<p class="label">Le type d\'erreur</p>' +
    '<div class="err-types" id="err-a-t">' + TYPES_ERR.map(t =>
      '<button class="err-type" type="button" data-tone="' + t.tone + '" data-t="' + t.id + '" aria-pressed="false">' +
      esc(t.nom) + '</button>').join('') + '</div>';

  let champQ = null, champA = null, champS = null, type = '';
  ouvrirFeuille({
    titre: 'Ajouter une erreur',
    texte: 'Pour une erreur faite sur papier. Elle reviendra comme les autres.',
    contenu: contenu,
    boutons: [{label: 'Annuler'}, {label: 'Ajouter au cahier', style: 'primaire'}],
    apres(dlg){
      champQ = dlg.querySelector('#err-a-q');
      champA = dlg.querySelector('#err-a-a');
      champS = dlg.querySelector('#err-a-s');
      dlg.querySelectorAll('#err-a-t [data-t]').forEach(b => b.addEventListener('click', () => {
        type = b.dataset.t;
        dlg.querySelectorAll('#err-a-t [data-t]').forEach(x =>
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      }));
      if (champQ) champQ.focus();
    }
  }).then(i => {
    if (i !== 1) return;
    const q = champQ ? champQ.value.trim() : '';
    const a = champA ? champA.value.trim() : '';
    if (!q || !a){ toast('Il manque l\'énoncé ou la réponse attendue.', {tone: 'ko', icon: 'warning'}); return; }
    S.erreurs.unshift({sid: champS ? champS.value : '', q: q, a: a, given: '', expl: '', choix: null,
                       ts: Date.now(), redo: 0, type: type, due: Date.now() + JOUR, okAt: 0, reprise: 0});
    if (S.erreurs.length > 120) S.erreurs.pop();
    if (type) noteType(type);
    save();
    toast('Ajoutée au cahier. Elle revient demain.', {tone: 'ok', icon: 'book-bookmark'});
    vErreurs();
  });
}

/* ============================================================
   10. Refaire une série d'erreurs
   ============================================================ */
function _errParcours(file){
  if (!file || !file.length) return;
  const cible = app();
  const now = Date.now();
  const total = file.length;
  let i = 0, justes = 0, reparees = 0, fini = false;

  window.vueCourante.enCours = true;
  window.vueCourante.garde = () => fini;
  setCtx('parcours', {title: 'Cahier', count: '1 / ' + total});

  cible.className = 'view view-erreurs';
  cible.innerHTML = '<div id="err-zone"></div>';
  const zone = document.getElementById('err-zone');

  function suivant(){
    if (i >= total){ conclure(); return; }
    const e = file[i];
    const libre = _errDue(e) > now;
    setCtx('parcours', {title: 'Cahier', count: (i + 1) + ' / ' + total});
    zone.innerHTML = libre
      ? '<p class="small muted">Entraînement libre : ne compte pas pour la réparation.</p>'
      : '';
    const hote = document.createElement('div');
    zone.appendChild(hote);
    askQuestion(hote, {
      ex: {q: e.q, a: e.a, accept: null, choix: e.choix || null, expl: e.expl || ''},
      skillId: e.sid,
      tag: 'Cahier · ' + _errTitre(e.sid),
      tagCourt: _errTitre(e.sid),
      overline: 'À réparer',
      count: (i + 1) + ' / ' + total,
      chrono: false, indices: false, reprise: false, sansType: true, serie: false
    }, r => {
      logAnswer(r.ok, r.ms);
      if (r.ok) justes++;
      if (!libre){
        const res = _errReparer(e, r.ok);
        if (res.etat === 'reparee'){
          reparees++;
          celebrer(2, {texte: res.texte, tone: 'ok', icon: 'wrench'});
        } else if (res.etat === 'tot'){
          toast(res.texte, {tone: 'glacier', icon: 'clock-countdown'});
        }
      }
      i++;
      suivant();
    });
  }

  function conclure(){
    fini = true;
    window.vueCourante.enCours = false;
    window.vueCourante.garde = null;
    setCtx('outil');
    try { snd.win(total ? justes / total : 1); } catch(e){}
    zone.innerHTML =
      '<div class="fin-card" data-kind="serie">' +
        '<p class="overline">Cahier</p>' +
        '<h2>' + justes + ' sur ' + total + '</h2>' +
        '<div class="figures"><div class="figure"><b>' + fv(reparees) + '</b><span class="k">Réparées</span></div>' +
        '<div class="figure"><b>' + fv(S.erreurs.length) + '</b><span class="k">En attente</span></div></div>' +
        '<p class="msg">' + (reparees
          ? 'Elles sortent du cahier. C\'est le meilleur travail de la journée.'
          : 'Les autres reviendront : c\'est comme ça qu\'elles finissent par tenir.') + '</p>' +
        '<div class="next-row"><button class="btn-primary" type="button" id="err-fin">' +
          '<span>Revenir au cahier</span><span class="ic-wrap">' + ic('arrow-right') + '</span></button></div>' +
      '</div>';
    const b = document.getElementById('err-fin');
    if (b) b.addEventListener('click', () => { snd.click(); vErreurs(); });
  }

  suivant();
}
