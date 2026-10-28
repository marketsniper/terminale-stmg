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
  const voeux = m.voeux.filter(function (x) { return x.f.canal !== 'direct' && typeof x.f.cible === 'number'; });
  let suivi = voeux.find(function (x) { return x.v.id === S.vu.voeuSimul; }) || voeux[0] || null;
  const choixCible = function (surChange) {
    if (voeux.length < 2) return null;
    const sel = h('select.do-select', { 'aria-label': 'Cible suivie' });
    voeux.forEach(function (x) { sel.appendChild(h('option', { value: x.v.id, text: x.f.court + ' · cible ' + C.fmt(x.f.cible), selected: suivi && x.v.id === suivi.v.id })); });
    sel.addEventListener('change', function () { suivi = voeux.find(function (x) { return x.v.id === sel.value; }); S.vu.voeuSimul = sel.value; E.sauver(); surChange(); });
    return h('label.do-champ.do-champ-cible', h('span.do-champ-l', { text: 'Cible suivie' }), sel);
  };

  if (onglet === 't2') { ongletT2(); return; }

  /* ---- onglet « Ce trimestre » : uniquement un trimestre de Terminale encore ouvert ---- */
  const code = m.codeSimul, periode = code ? S.periodes[code] : null;
  if (!periode) {
    if (!m.enCours) corps.appendChild(U.vide('Ton dossier est figé : le T2 de Terminale est arrêté.', 'Le simulateur sert à préparer un trimestre encore ouvert. Place aux textes et aux oraux.', U.bouton('Mon histoire', function () { A.nav('histoire'); }, 'do-btn-prim')));
    else if (m.enCours === 'T-T2' && aT1) corps.appendChild(U.vide('Ton T2 commence : saisis tes premières moyennes (ou prends les estimations) pour le simuler.', 'En attendant, l’onglet « Le T2 qu’il te faut » part de ton T1.', U.bouton('Le T2 qu’il te faut', function () { A.nav('simulateur', 't2', '', true); }, 'do-btn-prim')));
    else corps.appendChild(U.vide('Saisis ton bulletin de Tle T1 (ou prends les estimations) pour simuler.', 'Le simulateur lit tes vrais coefficients et te dit combien vaut un point dans chaque matière.', U.bouton('Mes bulletins', function () { A.nav('bulletins', 'T-T1'); }, 'do-btn-prim')));
    pied.appendChild(U.bouton('Tableau de bord', function () { A.nav('tableau'); }, 'do-btn-sec'));
    return;
  }
  const lignes = periode.lignes;
  const base = C.moyennes(periode, code, S.coefs);
  const lev = C.levier(code, S.coefs, lignes);
  const deltas = {};
  const objExist = code === 'T-T1' ? S.objectifT1 : S.objectifT2;
  if (objExist) Object.keys(objExist).forEach(function (id) { const mo = C.note(lignes[id] && lignes[id].moy); if (mo != null && typeof objExist[id] === 'number') deltas[id] = Math.max(-3, Math.min(3, Math.round((objExist[id] - mo) * 2) / 2)); });
  const tete = h('div.do-bloc.do-simul-tete');
  const ligneM = h('p.do-simul-m');
  const feux = h('div.do-simul-feux');
  tete.appendChild(h('p.do-kicker', { text: 'Moyenne pondérée de ton ' + C.LIBELLES[code] + ' en cours' }));
  tete.appendChild(ligneM); tete.appendChild(feux);
  const cc = choixCible(function () { maj(); }); if (cc) tete.appendChild(cc);
  corps.appendChild(tete);
  const liste = h('div.do-lignes');
  const items = Object.keys(lev.parPoint).map(function (id) { return { id: id, coef: lev.coefs[id], moy: C.note(lignes[id].moy), max: C.note(lignes[id].max), lev: lev.parPoint[id] }; }).filter(function (i) { return i.moy != null; }).sort(function (a, b) { return b.lev - a.lev; });
  const fmtGain = function (g) { return Math.abs(g) < 0.005 ? '±0' : C.fmtDelta(g, 2); };
  items.forEach(function (it) {
    const nom = C.nomDe(it.id, null, code);
    const card = h('div.do-ligne-m.do-simul-l', { style: '--acc:' + C.couleurDe(it.id) });
    card.appendChild(h('p.do-kicker.do-kicker-acc', h('span', { text: nom }), h('span.do-coef', { text: 'coef ' + C.fmt(it.coef, Math.round(it.coef) === it.coef ? 0 : 1) })));
    const val = h('span.do-simul-val');
    const gain = h('b.do-simul-gain');
    const range = h('input.do-range', { type: 'range', min: '-3', max: '3', step: '0.5', value: String(deltas[it.id] || 0), 'aria-label': 'Variation en ' + nom + ', de moins 3 à plus 3 points' });
    const moins = h('button.do-pm', { type: 'button', text: '−', 'aria-label': 'Moins 0,5 en ' + nom });
    const plus = h('button.do-pm', { type: 'button', text: '+', 'aria-label': 'Plus 0,5 en ' + nom });
    /* bornes : ±3 points, et jamais sous 0 ni au-dessus de 20 */
    const bornes = function () { return [Math.max(-3, Math.ceil(-it.moy * 2) / 2), Math.min(3, Math.floor((20 - it.moy) * 2) / 2)]; };
    const pose = function (d) { const b = bornes(); d = Math.max(b[0], Math.min(b[1], Math.round(d * 2) / 2)); deltas[it.id] = d; range.value = String(d); majLigne(); maj(); };
    moins.addEventListener('click', function () { pose((deltas[it.id] || 0) - 0.5); });
    plus.addEventListener('click', function () { pose((deltas[it.id] || 0) + 0.5); });
    range.addEventListener('input', function () { pose(parseFloat(range.value)); });
    card.appendChild(h('div.do-simul-r', val, h('div.do-curseur', moins, range, plus), gain));
    const note = h('p.do-aide');
    card.appendChild(note);
    function majLigne() {
      const d = deltas[it.id] || 0, nv = Math.max(0, Math.min(20, it.moy + d)), b = bornes();
      val.textContent = ''; val.appendChild(h('span', { text: C.fmt(it.moy) + ' → ' })); val.appendChild(h('b', { text: C.fmt(nv) }));
      const g = it.lev * (nv - it.moy);
      gain.textContent = fmtGain(g);
      gain.className = 'do-simul-gain ' + (g > 0.005 ? 'do-ton-vert' : g < -0.005 ? 'do-ton-rouge' : 'do-ton-neutre');
      const dep = it.max != null && nv > it.max + 1e-9;
      card.classList.toggle('do-depasse', dep);
      /* remplissage depuis le centre (l'écart part de 0) */
      const p = (d + 3) / 6 * 100;
      range.style.setProperty('--de', Math.min(50, p) + '%'); range.style.setProperty('--a', Math.max(50, p) + '%');
      range.classList.toggle('do-range-neg', d < 0);
      range.setAttribute('aria-valuetext', (d === 0 ? 'sans changement' : (d > 0 ? 'plus ' : 'moins ') + C.fmt(Math.abs(d)) + ' point' + (Math.abs(d) > 1 ? 's' : '')) + ', ' + C.fmt(nv) + ' sur 20');
      plus.disabled = d >= b[1]; moins.disabled = d <= b[0];
      note.textContent = U.typo('+1 point ici = ' + C.fmtDelta(it.lev, 2) + ' sur ta moyenne' + (it.max != null ? ' · meilleure note de la classe ' + C.fmt(it.max) : '') + (dep ? ' · au-dessus de la meilleure note de la classe' : ''));
    }
    majLigne();
    card._maj = majLigne;
    liste.appendChild(card);
  });
  corps.appendChild(liste);
  const cheminZ = h('div.do-bloc.do-chemin');
  corps.appendChild(cheminZ);
  if (lev.parPoint.maths != null && lev.parPoint['droit-eco'] != null) corps.appendChild(h('p.do-aide', { text: 'Ce sont les coefficients de ton bulletin, sur les ' + C.fmt(lev.sommeCoef, 0) + ' coefficients des matières déjà notées : +1 en maths vaut ' + C.fmtDelta(lev.parPoint.maths, 2) + ', +1 en droit-éco vaut ' + C.fmtDelta(lev.parPoint['droit-eco'], 2) + '.' }));
  const acts = h('div.do-acts');
  const tout = function () { Array.prototype.forEach.call(liste.children, function (c, i) { c.querySelector('input').value = String(deltas[items[i].id] || 0); c._maj(); }); maj(); };
  acts.appendChild(U.bouton('Remettre à zéro', function () { Object.keys(deltas).forEach(function (id) { deltas[id] = 0; }); tout(); U.annoncer('Simulation remise à zéro'); }, 'do-btn-sec'));
  acts.appendChild(U.bouton('Chemin le plus court', function () {
    if (!suivi) return;
    const ch = C.chemin(periode, code, S.coefs, suivi.f.cible, m.prios);
    Object.keys(deltas).forEach(function (id) { deltas[id] = 0; });
    if (ch) ch.liste.forEach(function (x) { deltas[x.id] = x.delta; });
    tout();
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
    ligneM.appendChild(h('span', { 'aria-hidden': 'true', text: ' → ' }));
    ligneM.appendChild(h('span', 'Simulé ', h('b.do-simul-sim', { text: C.fmt(sim) }), ' ', h('span.do-simul-d.' + (d > 0.005 ? 'do-ton-vert' : d < -0.005 ? 'do-ton-rouge' : 'do-ton-neutre'), { text: Math.abs(d) < 0.05 ? '(aucun changement)' : '(' + C.fmtDelta(d) + ')' })));
    U.vider(feux);
    voeux.forEach(function (x) { const Ev = x.f.cible - sim, fe = C.feu(Ev); feux.appendChild(h('span.do-feu-l', U.feuPoint(fe), h('span', { text: x.f.court + ' ' + C.fmtDelta(-Ev) }), h('span.do-sr', { text: ', ' + U.nomFeu(fe) }))); });
    U.vider(cheminZ);
    if (suivi) {
      const ch = C.chemin(periode, code, S.coefs, suivi.f.cible, m.prios);
      if (ch && ch.pointsPonderes <= 0) cheminZ.appendChild(h('p.do-texte', { text: 'Tu es déjà à la cible ' + suivi.f.court + ' (' + C.fmt(suivi.f.cible) + ') sur ce trimestre. Garde ce niveau.' }));
      else if (ch && ch.atteint) cheminZ.appendChild(h('p.do-texte', 'Chemin le plus court vers ' + C.fmt(suivi.f.cible) + ' : ', h('b', { text: ch.liste.map(function (x) { return C.fmtDelta(x.delta) + ' en ' + C.courtDe(x.id, null, code).toLowerCase().replace(/^(msdgn|gf|hg|emc|eps)$/, function (s) { return s.toUpperCase(); }); }).join(' et ') }), ' = ' + C.fmt(ch.resultat) + '.'));
      else if (ch) cheminZ.appendChild(h('p.do-texte', { text: 'Cette cible demande ' + C.fmtDelta(ch.pointsPonderes) + ' points pondérés : vise ' + C.fmt(suivi.f.cibleSecurite != null ? suivi.f.cibleSecurite : Math.floor(suivi.f.cible) - 1) + ' cette fois et confirme au T2.' }));
    }
    annonce('Moyenne simulée ' + C.fmt(sim));
  }
  maj();
  if (aT1) pied.appendChild(U.bouton('DS blanc', function () { A.versHote('__ds'); }, 'do-btn-sec'));
  pied.appendChild(aT1 ? U.bouton('Le T2 qu’il te faut', function () { A.nav('simulateur', 't2', '', true); }, 'do-btn-prim') : U.bouton('DS blanc', function () { A.versHote('__ds'); }, 'do-btn-prim'));

  /* ---- onglet « Le T2 qu'il te faut » (part du T1, en cours ou arrêté) ---- */
  function ongletT2() {
    pied.appendChild(U.bouton('Ce trimestre', function () { A.nav('simulateur', 'trimestre', '', true); }, 'do-btn-sec'));
    pied.appendChild(U.bouton('Tableau de bord', function () { A.nav('tableau'); }, 'do-btn-prim'));
    if (!aT1) { corps.appendChild(U.vide('Saisis ton bulletin de Tle T1 d’abord.', 'Le T2 qu’il te faut se calcule à partir de ton T1.', U.bouton('Mes bulletins', function () { A.nav('bulletins', 'T-T1'); }, 'do-btn-prim'))); return; }
    if (!suivi) { corps.appendChild(U.vide('Choisis un vœu avec une cible pour calculer le T2 qu’il te faut.', '', U.bouton('Mes vœux', function () { A.nav('jury'); }, 'do-btn-prim'))); return; }
    const z = h('div.do-bloc');
    const cc2 = choixCible(function () { A.rendre(); }); if (cc2) z.appendChild(cc2);
    const pr = C.priorites(t1, 'T-T1', S.coefs, suivi.f, m.sig, m.dsPar);
    const r = C.t2Requis(t1, S.coefs, suivi.f.cible, pr);
    if (!r) { z.appendChild(h('p.do-texte', { text: 'Impossible de calculer : vérifie ton bulletin de T1.' })); corps.appendChild(z); return; }
    if (r.atteinte) {
      /* cible déjà tenue : jamais de tableau qui conseillerait de baisser ; on propose la marche suivante */
      z.appendChild(h('p.do-gros', 'Pour ' + suivi.f.court + ', ta moyenne de Terminale (moyenne du T1 et du T2) vise ', h('b', { text: C.fmt(suivi.f.cible) }), '. Avec ', h('b', { text: C.fmt(r.mpT1) }), ' au T1, garde ton niveau au T2 : c’est suffisant.'));
      const suivantes = voeux.filter(function (x) { return x.f.cible > suivi.f.cible + 1e-9; }).map(function (x) { return { nom: x.f.court + ' (' + C.fmt(x.f.cible) + ')', court: x.f.court, id: x.v.id, cible: x.f.cible }; });
      [[14, 'zone bien'], [16, 'zone très bien']].forEach(function (c) { if (c[0] > suivi.f.cible && c[0] > r.mpT1 && !suivantes.some(function (s) { return s.cible === c[0]; })) suivantes.push({ nom: c[1] + ' (' + C.fmt(c[0]) + ')', cible: c[0] }); });
      const s = suivantes.sort(function (a, b) { return a.cible - b.cible; })[0];
      if (s) {
        const r2 = C.t2Requis(t1, S.coefs, s.cible, pr);
        z.appendChild(h('p.do-texte', { text: 'Marche suivante : ' + s.nom + '. Il te faudrait ' + C.fmt(Math.min(20, r2.t2)) + ' au T2' + (r2.t2 > 20 ? ', hors de portée sur un seul trimestre' : r2.atteinte ? ' : c’est déjà acquis' : '') + '.' }));
        if (s.id) z.appendChild(U.bouton('Suivre ' + s.court, function () { S.vu.voeuSimul = s.id; E.sauver(); A.rendre(); }, 'do-btn-sec'));
      }
      z.appendChild(h('p.do-aide', { text: 'Un point gagné au T2 ne compte que pour moitié dans la moyenne de Terminale vue par les écoles, puisqu’elle fait la moyenne de T1 et T2.' }));
      corps.appendChild(z);
      return;
    }
    z.appendChild(h('p.do-gros', 'Pour une moyenne de Terminale de ', h('b', { text: C.fmt(suivi.f.cible) }), ' vue par ' + suivi.f.court + ' (moyenne du T1 et du T2), il te faut ', h('b', { text: C.fmt(Math.min(20, r.t2)) }), ' au T2 en moyenne pondérée' + (r.t2 > 20 ? ' (impossible : plus de 20)' : '') + '.'));
    const table = h('table.do-tbl');
    table.appendChild(h('thead', h('tr', h('th', { scope: 'col', text: 'Matière' }), h('th', { scope: 'col', text: 'T1' }), h('th', { scope: 'col', text: 'T2 visé' }), h('th', { scope: 'col' }, h('span.do-sr', { text: 'Faisabilité' })))));
    const tb = h('tbody');
    r.lignes.forEach(function (l) { const hausse = l.t2 > l.t1 + 1e-9; tb.appendChild(h('tr', h('th', { scope: 'row', text: C.nomDe(l.id, null, 'T-T1'), style: '--acc:' + C.couleurDe(l.id) }), h('td', { text: C.fmt(l.t1) }), h('td', h('b', { text: hausse ? C.fmt(l.t2) : 'garde ' + C.fmt(l.t1) })), h('td', U.badge(l.realiste ? 'réaliste' : 'ambitieux', l.realiste ? 'ok' : 'attente')))); });
    table.appendChild(tb);
    z.appendChild(h('div.do-tblwrap', table));
    z.appendChild(h('p.do-aide', { text: 'Réparti selon tes leviers (coefficient, marge jusqu’à la meilleure note de la classe, quiz, prochain DS). « Réaliste » : au plus deux points de plus qu’au T1, ou la meilleure note de la classe.' }));
    if (r.impossible) z.appendChild(h('p.do-texte.do-ton-orange', { text: 'Cette cible demande ' + C.fmtDelta(r.pointsPonderes) + ' points pondérés : vise ' + C.fmt(suivi.f.cibleSecurite != null ? suivi.f.cibleSecurite : Math.floor(suivi.f.cible) - 1) + ' cette fois et confirme au T2.' }));
    z.appendChild(h('p.do-aide', { text: 'Un point gagné au T2 ne compte que pour moitié dans la moyenne de Terminale vue par les écoles, puisqu’elle fait la moyenne de T1 et T2.' }));
    z.appendChild(U.bouton('Enregistrer comme objectif du T2', function () { const o = {}; r.lignes.forEach(function (l) { o[l.id] = l.t2; }); S.objectifT2 = o; E.sauver(); U.toast('Objectif du T2 enregistré : la trajectoire l’affiche en projeté.'); A.publierResume(); }, 'do-btn-sec'));
    corps.appendChild(z);
  }
};
