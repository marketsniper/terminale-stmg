/* ===== Mon dossier Parcoursup · « Et si » : le poids d'un point, le T2 qu'il te faut ===== */
'use strict';
window.DOSSIER_VUES = window.DOSSIER_VUES || {};
window.DOSSIER_VUES.simulateur = function (corps, pied, param) {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h, A = window.DOSSIER;
  const m = M.calculer(), S = m.S;
  const onglet = param === 't2' ? 't2' : 'trimestre';
  const t1 = S.periodes['T-T1'];
  const aT1 = C.nbLignes(t1) > 0;
  corps.appendChild(U.pilules({ label: 'Onglets', items: [{ id: 'trimestre', texte: 'Ce trimestre' }, { id: 't2', texte: 'Le T2 qu’il te faut', desactive: !aT1, titre: aT1 ? null : 'Saisis ton bulletin de Tle T1 d’abord' }], actif: onglet, surChoix: function (id) { A.nav('simulateur', id, '', true); } }));
  /* période simulée : la période de référence (T1 en cours ou dernière saisie) */
  const code = m.codeRef, periode = m.periodeRef;
  if (!periode) {
    corps.appendChild(U.vide('Saisis ton bulletin de Tle T1 (ou prends les estimations) pour simuler.', 'Le simulateur lit tes vrais coefficients et te dit combien vaut un point dans chaque matière.', U.bouton('Mes bulletins', function () { A.nav('bulletins'); }, 'do-btn-prim')));
    return;
  }
  const table = C.tableDe(code, S.coefs), lignes = periode.lignes;
  const voeux = m.voeux.filter(function (x) { return x.f.canal !== 'direct' && typeof x.f.cible === 'number'; });
  let suivi = voeux.find(function (x) { return x.v.id === S.vu.voeuSimul; }) || voeux[0] || null;

  if (onglet === 't2') { ongletT2(); return; }

  /* ---- onglet « Ce trimestre » ---- */
  const base = C.moyennes(periode, code, S.coefs);
  const lev = C.levier(code, S.coefs, lignes);
  const deltas = {};
  const objExist = code === 'T-T1' ? S.objectifT1 : code === 'T-T2' ? S.objectifT2 : null;
  if (objExist) Object.keys(objExist).forEach(function (id) { const mo = C.note(lignes[id] && lignes[id].moy); if (mo != null && typeof objExist[id] === 'number') deltas[id] = Math.max(-3, Math.min(3, Math.round((objExist[id] - mo) * 2) / 2)); });
  const tete = h('div.do-bloc.do-simul-tete');
  const ligneM = h('p.do-simul-m');
  const feux = h('div.do-simul-feux');
  tete.appendChild(h('p.do-kicker', { text: 'Moyenne pondérée ' + m.ref.libelle }));
  tete.appendChild(ligneM); tete.appendChild(feux);
  if (voeux.length > 1) {
    const sel = h('select.do-select', { 'aria-label': 'Cible suivie' });
    voeux.forEach(function (x) { sel.appendChild(h('option', { value: x.v.id, text: x.f.court + ' ' + C.fmt(x.f.cible), selected: suivi && x.v.id === suivi.v.id })); });
    sel.addEventListener('change', function () { suivi = voeux.find(function (x) { return x.v.id === sel.value; }); S.vu.voeuSimul = sel.value; E.sauver(); maj(); });
    tete.appendChild(h('label.do-champ.do-champ-inline', h('span.do-champ-l', { text: 'Cible suivie' }), sel));
  }
  corps.appendChild(tete);
  const liste = h('div.do-lignes');
  const items = Object.keys(lev.parPoint).map(function (id) { return { id: id, coef: C.coefDe(lignes[id], id, table), moy: C.note(lignes[id].moy), max: C.note(lignes[id].max), lev: lev.parPoint[id] }; }).filter(function (i) { return i.moy != null; }).sort(function (a, b) { return b.lev - a.lev; });
  items.forEach(function (it) {
    const card = h('div.do-ligne-m.do-simul-l', { style: '--acc:' + C.couleurDe(it.id) });
    const k = h('p.do-kicker.do-kicker-acc', h('span', { text: C.nomDe(it.id) }), h('span.do-coef', { text: it.coef + ' / ' + lev.sommeCoef }));
    card.appendChild(k);
    const val = h('span.do-simul-val');
    const gain = h('b.do-simul-gain');
    const range = h('input.do-range', { type: 'range', min: '-3', max: '3', step: '0.5', value: String(deltas[it.id] || 0), 'aria-label': 'Variation en ' + C.nomDe(it.id) + ', de moins 3 à plus 3 points' });
    const moins = h('button.do-pm', { type: 'button', text: '−', 'aria-label': 'Moins 0,5 en ' + C.nomDe(it.id) });
    const plus = h('button.do-pm', { type: 'button', text: '+', 'aria-label': 'Plus 0,5 en ' + C.nomDe(it.id) });
    const pose = function (d) { d = Math.max(-3, Math.min(3, Math.round(d * 2) / 2)); deltas[it.id] = d; range.value = String(d); majLigne(); maj(); };
    moins.addEventListener('click', function () { pose((deltas[it.id] || 0) - 0.5); });
    plus.addEventListener('click', function () { pose((deltas[it.id] || 0) + 0.5); });
    range.addEventListener('input', function () { pose(parseFloat(range.value)); });
    card.appendChild(h('div.do-simul-r', val, h('div.do-curseur', moins, range, plus), gain));
    const note = h('p.do-aide');
    card.appendChild(note);
    function majLigne() {
      const d = deltas[it.id] || 0, nv = Math.max(0, Math.min(20, it.moy + d));
      val.textContent = ''; val.appendChild(h('span', { text: C.fmt(it.moy) + ' → ' })); val.appendChild(h('b', { text: C.fmt(nv) }));
      gain.textContent = C.fmtDelta(it.lev * (nv - it.moy), 2);
      gain.className = 'do-simul-gain ' + (nv - it.moy > 0 ? 'do-ton-vert' : nv - it.moy < 0 ? 'do-ton-rouge' : '');
      const dep = it.max != null && nv > it.max + 1e-9;
      card.classList.toggle('do-depasse', dep);
      note.textContent = '+1 point ici = ' + C.fmtDelta(it.lev, 2) + ' sur ta moyenne' + (it.max != null ? ' · plafond classe ' + C.fmt(it.max) : '') + (dep ? ' · au-dessus de la meilleure note de la classe' : '');
    }
    majLigne();
    card._maj = majLigne;
    liste.appendChild(card);
  });
  corps.appendChild(liste);
  const cheminZ = h('div.do-bloc.do-chemin');
  corps.appendChild(cheminZ);
  corps.appendChild(h('p.do-aide', { text: 'Ce sont les coefficients de ton bulletin : +1 en maths vaut ' + C.fmtDelta(lev.parPoint.maths || 0, 2) + ', +1 en droit-éco vaut ' + C.fmtDelta(lev.parPoint['droit-eco'] || 0, 2) + '.' }));
  const acts = h('div.do-acts');
  acts.appendChild(U.bouton('Remettre à zéro', function () { Object.keys(deltas).forEach(function (id) { deltas[id] = 0; }); Array.prototype.forEach.call(liste.children, function (c) { c.querySelector('input').value = '0'; c._maj(); }); maj(); U.annoncer('Simulation remise à zéro'); }, 'do-btn-sec'));
  acts.appendChild(U.bouton('Chemin le plus court', function () {
    if (!suivi) return;
    const ch = C.chemin(periode, code, S.coefs, suivi.f.cible, m.prios);
    Object.keys(deltas).forEach(function (id) { deltas[id] = 0; });
    if (ch) ch.liste.forEach(function (x) { deltas[x.id] = x.delta; });
    Array.prototype.forEach.call(liste.children, function (c) { const id = items[Array.prototype.indexOf.call(liste.children, c)].id; c.querySelector('input').value = String(deltas[id] || 0); c._maj(); });
    maj();
  }, 'do-btn-sec'));
  acts.appendChild(U.bouton('Enregistrer comme objectif', function () {
    const o = {}; items.forEach(function (it) { if (deltas[it.id]) o[it.id] = Math.round(Math.max(0, Math.min(20, it.moy + deltas[it.id])) * 100) / 100; });
    if (code === 'T-T1') S.objectifT1 = Object.keys(o).length ? o : null; else S.objectifT2 = Object.keys(o).length ? o : null;
    E.sauver(); U.toast(Object.keys(o).length ? 'Objectif enregistré : ' + C.fmt(simulee()) + ' visé.' : 'Objectif effacé.'); A.publierResume();
  }, 'do-btn-prim'));
  corps.appendChild(acts);
  const annonce = U.debounce(function (t) { U.annoncer(t); }, 600);
  function simulee() { let sp = 0; items.forEach(function (it) { const nv = Math.max(0, Math.min(20, it.moy + (deltas[it.id] || 0))); sp += it.coef * nv; }); return sp / lev.sommeCoef; }
  function maj() {
    const sim = simulee(), d = sim - base.mp;
    U.vider(ligneM);
    ligneM.appendChild(h('span', 'Aujourd’hui ', h('b', { text: C.fmt(base.mp) })));
    ligneM.appendChild(h('span', { text: ' → ' }));
    ligneM.appendChild(h('span', 'Simulé ', h('b.do-simul-sim', { text: C.fmt(sim) }), ' ', h('span.do-simul-d.' + (d > 0.005 ? 'do-ton-vert' : d < -0.005 ? 'do-ton-rouge' : 'do-ton-neutre'), { text: '(' + C.fmtDelta(d) + ')' })));
    U.vider(feux);
    voeux.forEach(function (x) { const Ev = x.f.cible - sim, fe = C.feu(Ev); feux.appendChild(h('span.do-feu-l', { 'aria-label': x.f.court + ' : ' + U.nomFeu(fe) }, U.feuPoint(fe), h('span', { text: x.f.court + ' ' + C.fmtDelta(-Ev) }))); });
    U.vider(cheminZ);
    if (suivi) {
      const ch = C.chemin(periode, code, S.coefs, suivi.f.cible, m.prios);
      if (ch && ch.pointsPonderes <= 0) cheminZ.appendChild(h('p.do-texte', { text: 'Tu es déjà à la cible ' + suivi.f.court + ' (' + C.fmt(suivi.f.cible) + ').' }));
      else if (ch && ch.atteint) cheminZ.appendChild(h('p.do-texte', 'Chemin le plus court vers ' + C.fmt(suivi.f.cible) + ' : ', h('b', { text: ch.liste.map(function (x) { return C.fmtDelta(x.delta) + ' en ' + C.courtDe(x.id).toLowerCase(); }).join(' et ') }), ' = ' + C.fmt(ch.resultat) + '.'));
      else if (ch) cheminZ.appendChild(h('p.do-texte', { text: 'Cette cible demande ' + C.fmtDelta(ch.pointsPonderes) + ' points pondérés : vise ' + C.fmt(suivi.f.cibleSecurite != null ? suivi.f.cibleSecurite : Math.floor(suivi.f.cible) - 1) + ' cette fois et confirme au T2.' }));
    }
    annonce('Moyenne simulée ' + C.fmt(sim));
  }
  maj();
  pied.appendChild(U.bouton('DS blanc', function () { A.versHote('__ds'); }, 'do-btn-sec'));
  pied.appendChild(U.bouton('Tableau de bord', function () { A.nav('tableau'); }, 'do-btn-prim'));

  /* ---- onglet « Le T2 qu'il te faut » ---- */
  function ongletT2() {
    if (!suivi) { corps.appendChild(U.vide('Choisis un vœu avec une cible pour calculer le T2 qu’il te faut.', '', U.bouton('Mes vœux', function () { A.nav('jury'); }, 'do-btn-prim'))); return; }
    const z = h('div.do-bloc');
    if (voeux.length > 1) {
      const sel = h('select.do-select', { 'aria-label': 'Cible suivie' });
      voeux.forEach(function (x) { sel.appendChild(h('option', { value: x.v.id, text: x.f.court + ' ' + C.fmt(x.f.cible), selected: x.v.id === suivi.v.id })); });
      sel.addEventListener('change', function () { S.vu.voeuSimul = sel.value; E.sauver(); A.rendre(); });
      z.appendChild(h('label.do-champ.do-champ-inline', h('span.do-champ-l', { text: 'Cible suivie' }), sel));
    }
    const pr = C.priorites(t1, 'T-T1', S.coefs, suivi.f, m.sig, m.dsPar);
    const r = C.t2Requis(t1, S.coefs, suivi.f.cible, pr);
    if (!r) { z.appendChild(h('p.do-texte', { text: 'Impossible de calculer : vérifie ton bulletin de T1.' })); corps.appendChild(z); return; }
    z.appendChild(h('p.do-gros', 'Pour afficher ', h('b', { text: C.fmt(suivi.f.cible) }), ' à ' + suivi.f.court + ' sur (T1 + T2) / 2, il te faut ', h('b', { text: C.fmt(Math.min(20, r.t2)) }), ' au T2 en moyenne pondérée' + (r.t2 > 20 ? ' (impossible : plus de 20)' : '') + '.'));
    if (r.t2 <= r.mpT1 + 1e-9) z.appendChild(h('p.do-texte', { text: 'Bonne nouvelle : garder ton niveau du T1 (' + C.fmt(r.mpT1) + ') suffit.' }));
    const table = h('table.do-tbl');
    table.appendChild(h('thead', h('tr', h('th', { text: 'Matière' }), h('th', { text: 'T1' }), h('th', { text: 'T2 visé' }), h('th', { text: '' }))));
    const tb = h('tbody');
    r.lignes.forEach(function (l) { tb.appendChild(h('tr', h('th', { scope: 'row', text: C.nomDe(l.id), style: '--acc:' + C.couleurDe(l.id) }), h('td', { text: C.fmt(l.t1) }), h('td', h('b', { text: C.fmt(l.t2) })), h('td', U.badge(l.realiste ? 'réaliste' : 'ambitieux', l.realiste ? 'ok' : 'attente')))); });
    table.appendChild(tb);
    z.appendChild(h('div.do-tblwrap', table));
    z.appendChild(h('p.do-aide', { text: 'Réparti selon tes leviers (coefficient, marge jusqu’au maximum de la classe, quiz, prochain DS). « Réaliste » : au plus deux points de plus qu’au T1, ou le maximum de la classe.' }));
    if (r.impossible) z.appendChild(h('p.do-texte.do-ton-orange', { text: 'Cette cible demande ' + C.fmtDelta(r.pointsPonderes) + ' points pondérés : vise ' + C.fmt(suivi.f.cibleSecurite != null ? suivi.f.cibleSecurite : Math.floor(suivi.f.cible) - 1) + ' cette fois et confirme au T2.' }));
    z.appendChild(h('p.do-aide', { text: 'Un point gagné au T2 ne compte que pour moitié dans la moyenne de Terminale vue par les écoles, puisqu’elle fait la moyenne de T1 et T2.' }));
    z.appendChild(U.bouton('Enregistrer comme objectif du T2', function () { const o = {}; r.lignes.forEach(function (l) { o[l.id] = l.t2; }); S.objectifT2 = o; E.sauver(); U.toast('Objectif du T2 enregistré : la trajectoire l’affiche en projeté.'); A.publierResume(); }, 'do-btn-sec'));
    corps.appendChild(z);
    pied.appendChild(U.bouton('Ce trimestre', function () { A.nav('simulateur', 'trimestre', '', true); }, 'do-btn-sec'));
    pied.appendChild(U.bouton('Tableau de bord', function () { A.nav('tableau'); }, 'do-btn-prim'));
  }
};
