/* ===== Mon dossier Parcoursup · « Mes bulletins » : saisie, import, estimations ===== */
'use strict';
window.DOSSIER_VUES = window.DOSSIER_VUES || {};
window.DOSSIER_VUES.bulletins = function (corps, pied, param) {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h, A = window.DOSSIER, IA = window.DOSSIER_IA;
  const S = E.S;
  const nbTotal = C.PERIODES.filter(function (k) { return C.nbLignes(S.periodes[k]) > 0; }).length;
  const enCours = M.periodeEnCours(S);
  /* période présélectionnée : celle demandée, sinon la plus récente due non saisie, sinon la période en cours */
  let code = param && (C.PERIODES.indexOf(param) !== -1 || param === 'anticipees') ? param : (S.vu.periodeBulletins || null);
  if (!code) {
    const dues = ['1-T3', '1-T2', '1-T1'];
    code = dues.find(function (k) { return !C.nbLignes(S.periodes[k]); }) || enCours || 'T-T1';
    if (!nbTotal) code = '1-T3';
  }
  S.vu.periodeBulletins = code;

  const etatDe = function (k) {
    const p = S.periodes[k], n = C.nbLignes(p);
    if (!n) return 'vide';
    const table = C.tableDe(k, S.coefs), attendus = Object.keys(table).length;
    return n >= attendus - 1 ? 'complet' : 'partiel';
  };
  const items = C.PERIODES.map(function (k) {
    const it = { id: k, texte: C.LIBELLES[k], etat: etatDe(k) };
    if (k === 'T-T3') { it.desactive = true; it.titre = 'Jamais transmis aux formations en phase principale'; it.etat = null; }
    if (k === enCours && !(S.periodes[k] && S.periodes[k].cloture)) it.badge = 'en cours';
    return it;
  });
  items.splice(3, 0, { id: 'anticipees', texte: 'Anticipées', etat: (S.anticipees.frEcrit != null || S.anticipees.maths != null) ? 'complet' : 'vide' });
  corps.appendChild(U.pilules({ label: 'Périodes', items: items, actif: code, surChoix: function (id) { A.nav('bulletins', id, '', true); } }));
  if (!nbTotal) corps.appendChild(h('div.do-encadre', h('p', { text: 'Commence par le dernier bulletin que tu as sous la main. Les commissions verront les trois bulletins de Première et les deux premiers de Terminale, rien d’autre.' })));
  if (code === 'anticipees') { anticipees(); return; }

  const niv = C.niveau(code), table = C.tableDe(code, S.coefs);
  let p = S.periodes[code];
  const nouvelle = !p;
  if (!p) p = { cloture: false, source: 'saisie', le: null, lignes: {}, moyGenerale: null, moyClasse: null, appPP: '' };
  const estEnCours = code === enCours && !p.cloture;
  const ecrire = function () { if (nouvelle && !S.periodes[code] && Object.keys(p.lignes).length) { S.periodes[code] = p; p.le = p.le || C.iso(M.aujourdhui()); } if (S.periodes[code]) E.sauver(); };
  const sauverD = U.debounce(function () { ecrire(); majPied(); }, 300);

  /* ---- en-tête de période : import ---- */
  const tete = h('div.do-periode-tete');
  tete.appendChild(h('h3.do-h3', { text: 'Bulletin ' + C.LIBELLES[code] + (niv === '1re' ? ' · 1re STMG' : ' · Terminale STMG GF') }));
  const acts = h('div.do-acts');
  const fichierPdf = h('input', { type: 'file', accept: 'application/pdf,.pdf', hidden: true, 'aria-hidden': 'true', tabindex: '-1' });
  const fichierPhoto = h('input', { type: 'file', accept: 'image/*', capture: 'environment', hidden: true, 'aria-hidden': 'true', tabindex: '-1' });
  const btnPdf = U.bouton('Importer le PDF du bulletin', function () { fichierPdf.click(); }, 'do-btn-sec');
  const cle = IA.dispo();
  const btnPhoto = U.bouton('Photographier le bulletin', function () {
    if (!cle) { encart('Pour lire un bulletin en photo, ajoute ta clé IA dans les réglages IA de l’app (accueil des exercices, bouton Réglages IA). En attendant, le PDF du lycée s’importe sans IA, et la saisie à la main prend deux minutes.'); return; }
    if (!IA.enLigne()) { encart('Hors ligne : la lecture par l’IA sera possible une fois connecté.'); return; }
    fichierPhoto.click();
  }, cle ? 'do-btn-sec' : 'do-btn-sec do-btn-off');
  if (!cle) btnPhoto.setAttribute('aria-describedby', 'do-photo-aide');
  if (!IA.enLigne()) { btnPhoto.textContent = 'Photographier · hors ligne'; }
  acts.appendChild(btnPdf); acts.appendChild(btnPhoto); acts.appendChild(fichierPdf); acts.appendChild(fichierPhoto);
  tete.appendChild(acts);
  const zoneEncart = h('div');
  tete.appendChild(zoneEncart);
  tete.appendChild(h('p.do-aide#do-photo-aide', { text: 'Moyennes sur 20, virgule acceptée. Les champs vides ne comptent pas. Le PDF du lycée (ÉcoleDirecte, Pronote) se lit sans IA et sans réseau.' }));
  corps.appendChild(tete);
  function encart(texte) { U.vider(zoneEncart); zoneEncart.appendChild(h('div.do-encadre.do-encadre-info', h('p', { text: texte }))); }
  fichierPdf.addEventListener('change', function () { const f = fichierPdf.files && fichierPdf.files[0]; fichierPdf.value = ''; if (f) window.DOSSIER_IMPORT.depuisPdf(f, code); });
  fichierPhoto.addEventListener('change', function () { const f = fichierPhoto.files && fichierPhoto.files[0]; fichierPhoto.value = ''; if (f) window.DOSSIER_IMPORT.depuisPhoto(f, code); });
  if (p.source && p.source !== 'saisie' && !nouvelle) tete.appendChild(h('p.do-aide', { text: 'Lu depuis ' + (p.source === 'pdf' ? 'le PDF du lycée' : p.source === 'photo' ? 'une photo (IA)' : p.source) + (p.le ? ' le ' + C.fmtDate(p.le, 'num') : '') + '. Chaque valeur reste modifiable.' }));

  /* ---- état de la période ---- */
  const etatZ = h('div.do-periode-etat');
  if (niv === 'Tle' && code !== 'T-T3') {
    const id = 'do-cloture-' + code;
    const cb = h('input', { type: 'checkbox', id: id, checked: !!p.cloture });
    cb.addEventListener('change', function () { p.cloture = cb.checked; p.clotureAuto = false; ecrire(); A.rendre(); });
    etatZ.appendChild(h('label.do-case', cb, h('span', { text: 'J’ai reçu ce bulletin (période arrêtée par le conseil de classe)' })));
    if (p.clotureAuto) etatZ.appendChild(h('p.do-aide', { text: 'Période clôturée automatiquement : la date du conseil de classe est passée.' }));
  }
  if (estEnCours) etatZ.appendChild(h('p.do-aide', { text: 'Période en cours : tes moyennes bougent encore. Les estimations « ≈ » viennent de tes DS blancs dans l’app.' }));
  corps.appendChild(etatZ);

  /* ---- lignes ---- */
  const ids = C.idsOrdonnes(code, p.lignes);
  const liste = h('div.do-lignes');
  const champsMoi = [];
  ids.forEach(function (id) { liste.appendChild(carteLigne(id)); });
  corps.appendChild(liste);
  function carteLigne(id) {
    const l = p.lignes[id] || (p.lignes[id] = {});
    const meta = C.MATIERES[id] || {};
    const coef = C.coefDe(l, id, table);
    const card = h('article.do-ligne-m', { style: '--acc:' + C.couleurDe(id), 'aria-label': C.nomDe(id, l) });
    const k = h('p.do-kicker.do-kicker-acc');
    k.appendChild(h('span', { text: C.nomDe(id, l) }));
    k.appendChild(h('span.do-coef', { text: meta.sansCoef ? 'sans coefficient' : 'coef ' + C.fmt(coef, 0) }));
    if (l.source === 'estimation') k.appendChild(U.badge('estimé', 'attente'));
    if (l.source === 'photo') k.appendChild(U.badge('lu par l’IA', 'attente'));
    card.appendChild(k);
    if (id === 'espagnol' && niv === 'Tle') card.appendChild(h('p.do-aide', { text: 'Présent sur ÉcoleDirecte avec un coefficient 3 : vérifie-le sur ton bulletin officiel.' }));
    const est = estEnCours && C.note(l.moy) == null ? C.estimation(E.dsHist(), id) : null;
    const rangee = h('div.do-rangee');
    const moi = U.champNote({ label: 'Moi', valeur: C.note(l.moy), estime: est ? est.valeur : null, surValeur: function (v) { if (v == null) { delete l.moy; if (l.source === 'estimation') delete l.source; } else { l.moy = v; if (l.source === 'estimation' || l.source === 'photo') l.source = 'saisie'; } l.maj = E.maintenant(); nettoyer(id); sauverD(); majEcart(); }, suivant: function () { const i = champsMoi.indexOf(moi.input); const n = champsMoi[i + 1]; if (n) n.focus(); else moi.input.blur(); } });
    champsMoi.push(moi.input);
    const classe = U.champNote({ label: 'Classe', valeur: C.note(l.classe), surValeur: function (v) { if (v == null) delete l.classe; else l.classe = v; nettoyer(id); sauverD(); majEcart(); }, suivant: function () { moi.input.focus(); } });
    rangee.appendChild(moi.el); rangee.appendChild(classe.el);
    const ecartEl = h('span.do-ecart');
    rangee.appendChild(ecartEl);
    card.appendChild(rangee);
    function majEcart() {
      const pos = C.position(l);
      ecartEl.className = 'do-ecart do-ton-' + pos.ton;
      ecartEl.textContent = pos.ecart == null ? '' : 'écart ' + C.fmtDelta(pos.ecart);
    }
    majEcart();
    const det = h('details.do-plus');
    det.appendChild(h('summary', { text: 'plus (min, max, rang, appréciation)' }));
    const r2 = h('div.do-rangee');
    r2.appendChild(U.champNote({ label: 'Min', valeur: C.note(l.min), surValeur: function (v) { if (v == null) delete l.min; else l.min = v; nettoyer(id); sauverD(); } }).el);
    r2.appendChild(U.champNote({ label: 'Max', valeur: C.note(l.max), surValeur: function (v) { if (v == null) delete l.max; else l.max = v; nettoyer(id); sauverD(); } }).el);
    const rang = h('input.do-note', { type: 'text', inputmode: 'numeric', 'aria-label': 'Rang', value: l.rang || '' });
    const eff = h('input.do-note', { type: 'text', inputmode: 'numeric', 'aria-label': 'Effectif', value: l.effectif || S.profil.effectif || '' });
    const errR = h('span.do-err', { 'aria-live': 'polite' });
    const wrapR = h('label.do-champ.do-champ-rang', h('span.do-champ-l', { text: 'Rang' }), h('span.do-rang', rang, h('span', { text: '/' }), eff), errR);
    const lireRang = function () {
      const r = parseInt(rang.value, 10), e = parseInt(eff.value, 10);
      if (rang.value && (!(r >= 1) || (e && r > e))) { wrapR.classList.add('do-ko'); errR.textContent = e && r > e ? 'Rang supérieur à l’effectif' : 'Rang invalide'; return; }
      wrapR.classList.remove('do-ko'); errR.textContent = '';
      if (r >= 1) l.rang = r; else delete l.rang;
      if (e >= 1) { l.effectif = e; if (!S.profil.effectif) S.profil.effectif = e; } else delete l.effectif;
      nettoyer(id); sauverD();
    };
    rang.addEventListener('input', lireRang); eff.addEventListener('input', lireRang);
    r2.appendChild(wrapR);
    det.appendChild(r2);
    const app = U.champTexte('Appréciation', l.app || '', function (v) { if (v.trim()) l.app = v.trim(); else delete l.app; nettoyer(id); sauverD(); majMots(); }, { multi: true, rows: 2, delai: 400 });
    det.appendChild(app.el);
    const mots = h('p.do-mots');
    det.appendChild(mots);
    function majMots() {
      U.vider(mots);
      if (!l.app) return;
      const mc = C.motsCles(l.app);
      if (!mc.positifs.length && !mc.negatifs.length) return;
      mots.appendChild(h('span.do-mots-l', { text: 'Mots que le jury retiendra : ' }));
      mc.positifs.forEach(function (w) { mots.appendChild(h('mark.do-mot-pos', { text: w })); mots.appendChild(document.createTextNode(' ')); });
      mc.negatifs.forEach(function (w) { mots.appendChild(h('mark.do-mot-neg', { text: w })); mots.appendChild(document.createTextNode(' ')); });
    }
    majMots();
    const avis = h('div.do-avis', h('span.do-champ-l', { text: 'Ton avis sur cette appréciation' }));
    avis.appendChild(U.pilules({ label: 'Avis', items: [{ id: 'positive', texte: 'positive' }, { id: 'neutre', texte: 'neutre' }, { id: 'alerte', texte: 'alerte' }], actif: l.avis || '', surChoix: function (v, b) { l.avis = l.avis === v ? undefined : v; if (!l.avis) delete l.avis; Array.prototype.forEach.call(avis.querySelectorAll('.do-pilule'), function (x) { x.classList.toggle('do-actif', x.dataset.id === l.avis); x.setAttribute('aria-pressed', String(x.dataset.id === l.avis)); }); nettoyer(id); sauverD(); } }));
    det.appendChild(avis);
    const fiches = (meta.sections || []).length ? h('button.do-lien-btn', { type: 'button', text: 'Mes fiches ›', onclick: function () { A.versHote('#' + meta.sections[0]); } }) : null;
    if (fiches) det.appendChild(fiches);
    card.appendChild(det);
    /* appui long (500 ms) sur la carte → fiches de la matière */
    if (fiches) { let t = 0; card.addEventListener('touchstart', function (e) { if (e.target.closest('input, textarea, button, summary')) return; t = setTimeout(function () { A.versHote('#' + meta.sections[0]); }, 500); }, { passive: true }); ['touchend', 'touchmove', 'touchcancel'].forEach(function (ev) { card.addEventListener(ev, function () { clearTimeout(t); }, { passive: true }); }); }
    return card;
  }
  function nettoyer(id) { const l = p.lignes[id]; if (l && !Object.keys(l).some(function (k) { return k !== 'maj' && k !== 'source'; })) delete p.lignes[id]; }

  /* ajouter une ligne libre */
  const ajout = h('div.do-ajout');
  const nomLibre = h('input.do-texte', { type: 'text', placeholder: 'Autre matière (option, LV3…)', 'aria-label': 'Libellé de la matière à ajouter' });
  ajout.appendChild(nomLibre);
  ajout.appendChild(U.bouton('Ajouter une ligne', function () {
    const n = nomLibre.value.trim(); if (!n) { nomLibre.focus(); return; }
    const id = 'libre-' + C.sansAccent(n).replace(/[^a-z0-9]+/g, '-').slice(0, 20) + '-' + Date.now().toString(36).slice(-3);
    p.lignes[id] = { nom: n, coef: 0, maj: E.maintenant() }; ecrire(); nomLibre.value = '';
    liste.appendChild(carteLigne(id)); liste.lastChild.querySelector('input').focus();
  }, 'do-btn-sec'));
  corps.appendChild(ajout);

  /* estimations */
  if (estEnCours) {
    const ests = ids.filter(function (id) { return C.note((p.lignes[id] || {}).moy) == null && C.estimation(E.dsHist(), id); });
    if (ests.length) corps.appendChild(h('div.do-acts', U.bouton('Je prends les estimations', function () {
      ests.forEach(function (id) { const e = C.estimation(E.dsHist(), id); p.lignes[id] = Object.assign(p.lignes[id] || {}, { moy: e.valeur, source: 'estimation', maj: E.maintenant() }); });
      ecrire(); U.annoncer('Estimations prises'); A.rendre();
    }, 'do-btn-sec'), h('span.do-aide', { text: ests.length + ' estimation' + (ests.length > 1 ? 's' : '') + ' depuis tes DS blancs, marquée' + (ests.length > 1 ? 's' : '') + ' « estimé » jusqu’à ta saisie.' })));
  }

  /* ---- pied de période ---- */
  const piedP = h('div.do-periode-pied', { 'aria-live': 'polite' });
  corps.appendChild(piedP);
  function majPied() {
    U.vider(piedP);
    const mo = C.moyennes(p, code, S.coefs);
    if (mo.mp == null && mo.ms == null) { piedP.appendChild(h('p.do-aide', { text: 'Aucune moyenne saisie pour cette période.' })); return; }
    const l1 = h('p.do-moy');
    l1.appendChild(h('span', 'Moyenne pondérée ', h('b.do-mp', { text: C.fmt(mo.mp) })));
    l1.appendChild(h('span', ' · simple ', h('b', { text: C.fmt(mo.ms) })));
    if (mo.mpClasse != null) l1.appendChild(h('span', ' · classe ', h('b', { text: C.fmt(mo.mpClasse) })));
    if (!mo.complet) l1.appendChild(h('span.do-aide', { text: ' · sur ' + mo.sommeCoef + ' coefficients / ' + mo.sommeCoefTotal }));
    piedP.appendChild(l1);
    if (p.moyGenerale != null && mo.mp != null && Math.abs(p.moyGenerale - mo.mp) > 0.15) piedP.appendChild(h('p.do-aide', { text: 'Le bulletin indique ' + C.fmt(p.moyGenerale) + ' : vérifie les coefficients ou les moyennes.' }));
    const i = C.PERIODES.indexOf(code);
    const prec = i > 0 ? C.PERIODES.slice(0, i).reverse().find(function (k) { return C.nbLignes(S.periodes[k]) >= 4; }) : null;
    if (prec) {
      const serie = C.PERIODES.slice(0, i).map(function (k) { return C.moyennes(S.periodes[k], k, S.coefs).mp; });
      const pr = C.progres(p, code, S.periodes[prec], prec, S.coefs, serie);
      if (pr) piedP.appendChild(h('p.do-progres', { text: 'Depuis le bulletin ' + C.LIBELLES[prec] + ' : ' + C.fmtDelta(pr.delta) + ' · ' + pr.dessus + ' matière' + (pr.dessus > 1 ? 's' : '') + ' au-dessus de la classe (' + C.fmtDelta(pr.variation, 0) + ')' + (pr.record ? ' · meilleure période jusqu’ici' : '') }));
    }
    if (p.observationConseil) piedP.appendChild(h('p.do-aide', 'Conseil de classe : ', h('i', { text: p.observationConseil }), p.mentionConseil ? [' ', U.badge(p.mentionConseil, 'ok')] : null));
  }
  majPied();

  if (!nouvelle) {
    const z = h('div.do-zone-danger');
    const b = U.bouton('Supprimer cette période', function () { U.confirmer(z, 'Supprimer le bulletin ' + C.LIBELLES[code] + ' ?', function () { S.periodes[code] = null; E.sauver(); U.annoncer('Bulletin supprimé'); A.rendre(); }, 'Oui, supprimer', 'Annuler'); }, 'do-btn-lien');
    z.appendChild(b); corps.appendChild(z);
  }
  pied.appendChild(U.bouton('Tableau de bord', function () { A.nav('tableau'); }, 'do-btn-sec'));
  const suivante = C.TRANSMISES[C.TRANSMISES.indexOf(code) + 1];
  if (suivante && suivante !== 'T-T2' || (suivante === 'T-T2' && enCours === 'T-T2')) pied.appendChild(U.bouton('Période suivante', function () { A.nav('bulletins', suivante, '', true); }, 'do-btn-prim'));
  else pied.appendChild(U.bouton('Voir le jury', function () { A.nav('jury'); }, 'do-btn-prim'));

  function anticipees() {
    const z = h('div.do-bloc');
    z.appendChild(h('h3.do-h3', { text: 'Épreuves anticipées (fin de Première)' }));
    z.appendChild(h('p.do-texte', { text: 'Ces notes sont dans ton dossier Parcoursup, onglet baccalauréat. Elles comptent au bac (français écrit 5, oral 5, mathématiques 2) et les commissions les voient.' }));
    const r = h('div.do-rangee');
    const an = S.anticipees;
    const maj = function () { an.le = an.le || C.iso(M.aujourdhui()); E.sauver(); majBac(); };
    r.appendChild(U.champNote({ label: 'Français écrit', valeur: C.note(an.frEcrit), surValeur: function (v) { an.frEcrit = v; maj(); } }).el);
    r.appendChild(U.champNote({ label: 'Français oral', valeur: C.note(an.frOral), surValeur: function (v) { an.frOral = v; maj(); } }).el);
    r.appendChild(U.champNote({ label: 'Mathématiques (épreuve anticipée)', valeur: C.note(an.maths), enter: 'done', surValeur: function (v) { an.maths = v; maj(); } }).el);
    z.appendChild(r);
    z.appendChild(h('p.do-aide', { text: 'Épreuve anticipée de maths : 2 h, coefficient 2 au bac, première session en juin 2026 (source : service-public.gouv.fr, 13/06/2025).' }));
    const bac = h('div.do-encadre'); z.appendChild(bac);
    function majBac() {
      U.vider(bac);
      const b = C.bacAcquis(an); if (!b) { bac.hidden = true; return; }
      bac.hidden = false;
      bac.appendChild(h('p', { text: 'Points déjà acquis au bac : ' + C.fmtEntier(b.points) + ' sur ' + C.fmtEntier(b.coefs * 20) + ' (' + b.coefs + ' coefficients sur 100).' }));
      bac.appendChild(h('p.do-aide', { text: 'Pour les ' + b.reste + ' coefficients restants, il te faudrait en moyenne ' + C.fmt(b.seuils.passable, 2) + ' pour le bac, ' + C.fmt(b.seuils.ab, 2) + ' pour assez bien, ' + C.fmt(b.seuils.b, 2) + ' pour bien, ' + C.fmt(b.seuils.tb, 2) + ' pour très bien. Repère, pas une prédiction.' }));
    }
    majBac();
    corps.appendChild(z);
    pied.appendChild(U.bouton('Tableau de bord', function () { A.nav('tableau'); }, 'do-btn-sec'));
    pied.appendChild(U.bouton('Tle T1', function () { A.nav('bulletins', 'T-T1', '', true); }, 'do-btn-prim'));
  }
};
