/* ===== Mon dossier Parcoursup · « Ce que la commission verra » : relevé transmis, grille, profil des admis, priorités, cibles ===== */
'use strict';
window.DOSSIER_VUES = window.DOSSIER_VUES || {};
window.DOSSIER_VUES.jury = function (corps, pied, param) {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, F = window.DOSSIER_FORMATIONS, h = U.h, A = window.DOSSIER;
  const m = M.calculer(), S = m.S;
  const nbPeriodes = C.PERIODES.filter(function (k) { return C.nbLignes(S.periodes[k]) > 0; }).length;
  let courant = m.voeux.find(function (x) { return x.v.id === param; }) || m.voeux[0] || null;
  if (courant) S.vu.voeuJury = courant.v.id;

  /* sélecteur de vœux */
  const items = m.voeux.map(function (x) { return { id: x.v.id, texte: x.f.court, etat: x.feu === 'gris' ? null : x.feu }; });
  items.push({ id: '__ajouter', texte: '+ Ajouter' });
  corps.appendChild(U.pilules({ label: 'Vœux', items: items, actif: courant ? courant.v.id : '', surChoix: function (id) { if (id === '__ajouter') ajouterVoeu(); else A.nav('jury', id, '', true); } }));
  if (!courant) { corps.appendChild(U.vide('Aucun vœu.', 'Ajoute tes formations pour voir ce que chaque commission lira.', U.bouton('Ajouter un vœu', ajouterVoeu, 'do-btn-prim'))); return; }
  const f = courant.f, v = courant.v;
  corps.appendChild(h('h3.do-h3', { text: f.nom }));
  if (f.preset || F.parId[v.preset]) corps.appendChild(h('p.do-aide', 'Fiche session 2026, vérifiée le 27/10/2026 · ', U.badge('à relire dès le 17/12/2026', 'attente'), f.liens && f.liens.fiche ? [' · ', h('a.do-lien', { href: f.liens.fiche, target: '_blank', rel: 'noopener', text: 'fiche Parcoursup' })] : null));

  /* ---- A. relevé transmis ---- */
  (function () {
    const b = h('section.do-bloc.do-releve', { 'aria-labelledby': 'do-rel-t' });
    b.appendChild(h('h3#do-rel-t.do-kicker', { text: 'Ton relevé tel qu’il sera transmis' }));
    b.appendChild(h('p.do-releve-id', { text: (S.profil.lycee || 'Lycée') + ' · ' + (S.profil.classe || 'Terminale STMG') + ' · bac 2027' }));
    if (!nbPeriodes) b.appendChild(h('p.do-texte.do-ton-rouge', { text: 'Voilà ce que la commission verrait aujourd’hui : rien. Commence par tes bulletins.' }));
    const auj = m.auj;
    const due = function (code) { if (code.charAt(0) === '1') return true; const d = code === 'T-T1' ? S.dates.conseilT1 : S.dates.conseilT2; const x = C.dateDe(d); return !!(x && x <= auj); };
    const table = h('table.do-tbl.do-tbl-releve');
    const tr0 = h('tr', h('th', { text: 'Matière' }));
    C.TRANSMISES.forEach(function (code) { tr0.appendChild(h('th', { text: C.LIBELLES[code] })); });
    table.appendChild(h('thead', tr0));
    const tb = h('tbody');
    const idsTle = C.ORDRE_TLE.filter(function (id) { return !C.MATIERES[id].sansCoef; });
    const ids1 = ['francais', 'sdgn'];
    idsTle.concat(ids1).forEach(function (id) {
      const tr = h('tr', h('th', { scope: 'row', text: C.courtDe(id), title: C.nomDe(id), 'aria-label': C.nomDe(id), style: '--acc:' + C.couleurDe(id) }));
      C.TRANSMISES.forEach(function (code) {
        const niv = C.niveau(code);
        let idP = id;
        if (niv === '1re') { if (id === 'gf') idP = null; if (id === 'philo') idP = null; } else { if (ids1.indexOf(id) !== -1) idP = null; }
        if (!idP) { tr.appendChild(h('td.do-na', { text: '·', 'aria-label': 'sans objet' })); return; }
        const p = S.periodes[code], l = p && p.lignes[idP];
        const moy = C.note(l && l.moy), cla = C.note(l && l.classe);
        if (moy == null) { const vide = due(code) && !(p && p.cloture === false && code === m.enCours); tr.appendChild(h('td' + (vide ? '.do-vide' : '.do-attente'), { text: vide ? 'vide' : '…', title: vide ? 'la commission verra une case vide' : 'période à venir' })); return; }
        const td = h('td', h('b', { text: C.fmt(moy) }), cla != null ? h('span.do-cla', { text: ' / ' + C.fmt(cla) }) : null);
        const det = [];
        if (l.min != null || l.max != null) det.push('min ' + C.fmt(l.min) + ', max ' + C.fmt(l.max));
        if (l.rang) det.push('rang ' + l.rang + (l.effectif ? ' / ' + l.effectif : ''));
        if (det.length) td.title = det.join(' · ');
        if (l.source === 'estimation') td.classList.add('do-estime');
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    const trM = h('tr.do-tr-moy', h('th', { scope: 'row', text: 'Moyenne pondérée' }));
    C.TRANSMISES.forEach(function (code) { const mo = C.moyennes(S.periodes[code], code, S.coefs); trM.appendChild(h('td', { text: mo.mp == null ? '' : C.fmt(mo.mp) })); });
    tb.appendChild(trM);
    table.appendChild(tb);
    b.appendChild(h('div.do-tblwrap', table));
    b.appendChild(h('p.do-aide', { text: 'Moi / classe. Les cases « vide » sont celles que la commission verrait vides aujourd’hui. Les appréciations de chaque professeur sont transmises avec le bulletin.' }));
    const an = S.anticipees;
    b.appendChild(h('p.do-texte', 'Anticipées : français écrit ', h('b', { text: C.fmt(an.frEcrit) }), ' · oral ', h('b', { text: C.fmt(an.frOral) }), ' · mathématiques ', h('b', { text: C.fmt(an.maths) })));
    if (m.vj.compares) b.appendChild(h('p.do-texte', { text: 'Ta moyenne de Terminale est au-dessus de ta Première dans ' + m.vj.dessus + ' matière' + (m.vj.dessus > 1 ? 's' : '') + ' sur ' + m.vj.compares + '.' }));
    b.appendChild(h('div.do-grise', h('p', { text: 'Fiche Avenir : rédigée par tes professeurs au T2 (méthode de travail, autonomie, capacité à s’investir, engagements). Tu ne la verras qu’à partir du 1er juin 2027.' })));
    const T = S.textes, rub = ['pro', 'citoyen', 'monde', 'sport'].filter(function (k) { return T.activites[k].txt.trim(); }).length;
    b.appendChild(h('p.do-texte', { text: 'Activités et centres d’intérêt : ' + rub + ' rubrique' + (rub > 1 ? 's' : '') + ' sur 4 rédigée' + (rub > 1 ? 's' : '') + '.' }));
    if (f.canal !== 'direct') {
      const lt = f.lettreDemandee ? C.compteur((T.lettres[v.id] || {}).txt, 1500).caracteres : null;
      b.appendChild(h('p.do-texte', { text: 'Lettre de motivation : ' + (f.lettreDemandee ? 'demandée par cette formation' + (f.lettreAConfirmer ? ' (à confirmer sur la fiche 2027)' : '') + ' · ' + C.fmtEntier(lt) + ' caractère' + (lt > 1 ? 's' : '') : 'non demandée') + '.' }));
      b.appendChild(h('p.do-aide', { text: 'Ce que cette formation ne verra pas : le T3 de Terminale, tes absences, tes notes de DS blancs. (Source : présentation Parcoursup 2026, éléments transmis.)' }));
    }
    corps.appendChild(b);
  })();

  /* ---- B. grille ---- */
  (function () {
    const b = h('section.do-bloc.do-grille', { 'aria-labelledby': 'do-gr-t' });
    b.appendChild(h('h3#do-gr-t.do-kicker', { text: 'Comment cette formation pèse ton dossier' }));
    if (!f.grille) {
      b.appendChild(h('p.do-texte', { text: f.grilleTexte || 'Grille non publiée.' }));
      if (f.canal === 'direct' && f.lienApp) b.appendChild(U.bouton('Objectif Albert', function () { A.versHote(f.lienApp); }, 'do-btn-sec'));
      corps.appendChild(b); return;
    }
    const prep = C.preparation(f, S, m.sig, courant.E);
    const d = prep.details;
    const expl = {
      resultats: [m.ref.valeur != null ? C.fmt(m.ref.valeur) + ' pour une cible de ' + C.fmt(f.cible) : 'aucune moyenne saisie', 'Prêt = 1 moins l’écart à la cible divisé par 3 : à 3 points de la cible, 0 %.'],
      methode: [(d.fichesTot ? C.fmtPct(d.partFiches) + ' de fiches maîtrisées' : d.fichesOk + ' fiches maîtrisées') + ', ' + d.joursSeance + ' jours avec une séance sur 14' + (d.dsMoyenne != null ? ', DS blancs à ' + C.fmt(d.dsMoyenne) : ''), 'Moitié fiches maîtrisées des matières regardées, 30 % moyenne des DS blancs, 20 % régularité des séances.'],
      savoirEtre: [d.nbApp ? d.nbPos + ' appréciation' + (d.nbPos > 1 ? 's' : '') + ' positive' + (d.nbPos > 1 ? 's' : '') + ' sur ' + d.nbApp : 'aucune appréciation saisie (60 % par défaut)', 'Part des appréciations positives (ton avis, sinon les mots du jury).'],
      motivation: [f.lettreDemandee ? (C.compteur((S.textes.lettres[v.id] || {}).txt, 1500).caracteres ? 'lettre en cours' : 'lettre non rédigée') : 'lettre non demandée', 'Lettre demandée : longueur sur 1 200 caractères ; sinon 100 %.'],
      engagement: [d.rubriques + ' rubrique' + (d.rubriques > 1 ? 's' : '') + ' sur 4' + (d.citemoiOk ? ', Citemoi décrit' : '') + (d.cochees ? ', ' + d.cochees + ' actions faites' : ''), 'Moitié rubriques Activités, un quart Citemoi chiffré, un quart actions du coach sur 4 semaines.']
    };
    [['resultats', 'Résultats'], ['methode', 'Méthode'], ['savoirEtre', 'Savoir-être'], ['motivation', 'Motivation'], ['engagement', 'Engagement']].forEach(function (k) {
      const pct = f.grille[k[0]] || 0, pret = prep.piliers[k[0]];
      const row = h('div.do-pilier');
      row.appendChild(h('div.do-pilier-l', h('b', { text: k[1] }), h('span', { text: pct + ' %' }), f.importance && f.importance[k[0]] ? h('span.do-aide', { text: f.importance[k[0]] }) : null));
      row.appendChild(h('div.do-barre.do-barre-grille', { role: 'img', 'aria-label': k[1] + ' : ' + pct + ' % de la grille' }, h('span', { style: 'width:' + pct + '%' })));
      const btn = h('button.do-lien-btn', { type: 'button', text: 'pourquoi', 'aria-expanded': 'false' });
      const exp = h('p.do-aide.do-pourquoi', { hidden: true, text: expl[k[0]][1] });
      btn.addEventListener('click', function () { exp.hidden = !exp.hidden; btn.setAttribute('aria-expanded', String(!exp.hidden)); });
      row.appendChild(h('div.do-pret', h('div.do-barre.do-barre-pret', { role: 'img', 'aria-label': 'prêt à ' + C.fmtPct(pret) }, h('span', { style: 'width:' + Math.round(pret * 100) + '%' })), h('span.do-pret-t', { text: 'prêt à ' + C.fmtPct(pret) + ' : ' + expl[k[0]][0] + ' ' }), btn, exp));
      b.appendChild(row);
    });
    if (f.grilleNote) b.appendChild(h('p.do-aide', { text: f.grilleNote }));
    b.appendChild(h('p.do-aide.do-note-pred', { text: 'Indicateur de préparation : montre où tu perds des points de grille. Ce n’est pas une prédiction.' }));
    corps.appendChild(b);
  })();

  /* ---- C. profil des admis ---- */
  (function () {
    if (!f.faits || !f.faits.length) return;
    const b = h('section.do-bloc', { 'aria-labelledby': 'do-adm-t' });
    b.appendChild(h('h3#do-adm-t.do-kicker', { text: 'Le profil des admis' }));
    f.faits.forEach(function (x) { b.appendChild(h('p.do-fait', x.t, ' ', x.verifie ? U.badge('vérifié le ' + C.fmtDate(x.verifie, 'num'), 'ok') : U.badge('à confirmer', 'attente'), h('span.do-source', { text: ' Source : ' + x.source }))); });
    if (f.eliminatoires && f.eliminatoires.length) b.appendChild(h('p.do-aide', { text: 'Points de vigilance cités par la formation : ' + f.eliminatoires.join(' ; ') + '.' }));
    corps.appendChild(b);
  })();

  /* ---- D. priorités ---- */
  (function () {
    if (f.canal === 'direct') return;
    const b = h('section.do-bloc', { 'aria-labelledby': 'do-pri-t' });
    b.appendChild(h('h3#do-pri-t.do-kicker', { text: 'Pour cette formation, remonte d’abord' }));
    if (!m.periodeRef) { b.appendChild(h('p.do-texte', { text: 'Saisis un bulletin pour voir tes priorités.' })); corps.appendChild(b); return; }
    const pr = C.priorites(m.periodeRef, m.codeRef, S.coefs, f, m.sig, m.dsPar);
    const ol = h('ol.do-prios');
    pr.items.slice(0, 3).forEach(function (it) {
      const g = C.gainPour(it, courant.E, pr.sommeCoef);
      const li = h('li', { style: '--acc:' + C.couleurDe(it.id) });
      li.appendChild(h('span.do-prio-t', h('b', { text: C.nomDe(it.id) }), ' : ' + C.fmtDelta(g.X) + ' = ' + C.fmtDelta(g.Y, 2) + ' sur ta moyenne' + (it.ds ? ' · DS le ' + C.fmtDate(it.ds.due, 'jm') : '')));
      const acts = h('span.do-prio-a');
      acts.appendChild(h('button.do-lien-btn', { type: 'button', text: 'Réviser ›', onclick: function () { A.versHote(M.lienReviser(it.id, m.sig) || '#' + (C.MATIERES[it.id].sections[0] || 'bac')); } }));
      acts.appendChild(h('a.do-lien-btn', { href: '#simulateur', text: 'Et si ›' }));
      li.appendChild(acts); ol.appendChild(li);
    });
    b.appendChild(ol);
    const btn = h('button.do-lien-btn', { type: 'button', text: 'Comment c’est calculé', 'aria-expanded': 'false' });
    const exp = h('p.do-aide', { hidden: true, text: 'Priorité calculée avec le coefficient, ta marge jusqu’à la meilleure note de la classe, tes quiz et le prochain DS.' });
    btn.addEventListener('click', function () { exp.hidden = !exp.hidden; btn.setAttribute('aria-expanded', String(!exp.hidden)); });
    b.appendChild(btn); b.appendChild(exp);
    corps.appendChild(b);
  })();

  /* ---- E. cible et statut ---- */
  (function () {
    const b = h('section.do-bloc', { 'aria-labelledby': 'do-cib-t' });
    b.appendChild(h('h3#do-cib-t.do-kicker', { text: 'Cible' }));
    const r = h('div.do-rangee');
    if (f.canal !== 'direct') {
      r.appendChild(U.champNote({ label: 'Cible de moyenne', valeur: typeof v.cible === 'number' ? v.cible : null, enter: 'done', surValeur: function (x) { v.cible = x; v.maj = E.maintenant(); E.sauver(); U.annoncer('Cible enregistrée'); } }).el);
      r.appendChild(h('div.do-champ', h('span.do-champ-l', { text: 'Mention visée' }), U.pilules({ label: 'Mention visée', items: [{ id: 'AB', texte: 'AB' }, { id: 'B', texte: 'B' }, { id: 'TB', texte: 'TB' }], actif: v.cibleMention || '', surChoix: function (id, btn) { v.cibleMention = id; E.sauver(); Array.prototype.forEach.call(btn.parentNode.children, function (x) { x.classList.toggle('do-actif', x === btn); x.setAttribute('aria-pressed', String(x === btn)); }); } })));
    }
    r.appendChild(h('div.do-champ', h('span.do-champ-l', { text: 'Statut' }), U.pilules({ label: 'Statut du vœu', items: [{ id: 'envisage', texte: 'envisagé' }, { id: 'formule', texte: 'formulé' }, { id: 'confirme', texte: 'confirmé' }], actif: v.statut || 'envisage', surChoix: function (id, btn) { v.statut = id; E.sauver(); Array.prototype.forEach.call(btn.parentNode.children, function (x) { x.classList.toggle('do-actif', x === btn); x.setAttribute('aria-pressed', String(x === btn)); }); } })));
    b.appendChild(r);
    if (f.canal !== 'direct') {
      const cb = h('input', { type: 'checkbox', id: 'do-lettre-dem', checked: !!v.lettreDemandee });
      cb.addEventListener('change', function () { v.lettreDemandee = cb.checked; if (cb.checked && !S.textes.lettres[v.id]) S.textes.lettres[v.id] = E.texteVide(); E.sauver(); });
      b.appendChild(h('label.do-case', cb, h('span', { text: 'Lettre de motivation demandée' + (f.lettreAConfirmer ? ' (à confirmer sur la fiche 2027)' : '') })));
    }
    b.appendChild(U.champTexte('Notes libres', v.notes || '', function (t) { v.notes = t; E.sauver(); }, { multi: true, rows: 2, placeholder: 'JPO, contacts, ce que tu as relevé sur la fiche 2027…', delai: 400 }).el);
    const ordre = h('div.do-acts');
    const idx = m.voeux.indexOf(courant);
    const bouger = function (dir) { const liste = E.voeuxTries(); const i = liste.indexOf(v), j = i + dir; if (j < 0 || j >= liste.length) return; liste.splice(i, 1); liste.splice(j, 0, v); liste.forEach(function (x, k) { x.ordre = k + 1; }); E.sauver(); A.nav('jury', v.id, '', true); };
    ordre.appendChild(U.bouton('Monter', function () { bouger(-1); }, 'do-btn-sec' + (idx === 0 ? ' do-btn-off' : '')));
    ordre.appendChild(U.bouton('Descendre', function () { bouger(1); }, 'do-btn-sec' + (idx === m.voeux.length - 1 ? ' do-btn-off' : '')));
    b.appendChild(ordre);
    const z = h('div.do-zone-danger');
    z.appendChild(U.bouton('Retirer ce vœu', function () { U.confirmer(z, 'Retirer ' + f.court + ' de tes vœux ? ' + (v.preset ? 'Ce gabarit ne reviendra pas tout seul.' : ''), function () { S.voeux = S.voeux.filter(function (x) { return x.id !== v.id; }); if (v.preset) S.vu.presetsRetires.push(v.preset); S.voeux.forEach(function (x, k) { x.ordre = k + 1; }); E.sauver(); A.nav('jury', '', '', true); }, 'Oui, retirer', 'Annuler'); }, 'do-btn-lien'));
    b.appendChild(z);
    corps.appendChild(b);
  })();

  pied.appendChild(U.bouton('Imprimer ce relevé', function () { window.DOSSIER_IMPRESSION.releve(); }, 'do-btn-sec'));
  pied.appendChild(U.bouton('Et si', function () { A.nav('simulateur'); }, 'do-btn-prim'));

  function ajouterVoeu() {
    const z = h('div');
    const nom = U.champTexte('Nom de la formation', '', function () { }, { placeholder: 'BTS Comptabilité gestion · Lycée X' });
    const court = U.champTexte('Nom court', '', function () { }, { placeholder: 'BTS CG' });
    z.appendChild(nom.el); z.appendChild(court.el);
    const type = h('select.do-select', { 'aria-label': 'Type' });
    [['cpge', 'CPGE'], ['ecole', 'École'], ['but', 'BUT'], ['bts', 'BTS'], ['licence', 'Licence'], ['direct', 'Hors Parcoursup']].forEach(function (t) { type.appendChild(h('option', { value: t[0], text: t[1] })); });
    const conc = h('select.do-select', { 'aria-label': 'Concours' });
    [['', 'Aucun concours'], ['acces', 'ACCÈS'], ['sesame', 'SESAME']].forEach(function (t) { conc.appendChild(h('option', { value: t[0], text: t[1] })); });
    z.appendChild(h('div.do-rangee', h('label.do-champ', h('span.do-champ-l', { text: 'Type' }), type), h('label.do-champ', h('span.do-champ-l', { text: 'Concours' }), conc)));
    z.appendChild(h('p.do-champ-l', { text: 'Grille de la fiche Parcoursup (en %, total 100)' }));
    const g = {}; const rg = h('div.do-rangee.do-rangee-5');
    [['resultats', 'Résultats'], ['methode', 'Méthode'], ['savoirEtre', 'Savoir-être'], ['motivation', 'Motivation'], ['engagement', 'Engagement']].forEach(function (k) { g[k[0]] = h('input.do-note', { type: 'text', inputmode: 'numeric', 'aria-label': k[1], placeholder: '0' }); rg.appendChild(h('label.do-champ', h('span.do-champ-l', { text: k[1] }), g[k[0]])); });
    z.appendChild(rg);
    let cible = null;
    z.appendChild(U.champNote({ label: 'Cible de moyenne', enter: 'done', surValeur: function (x) { cible = x; } }).el);
    const lettre = h('input', { type: 'checkbox', id: 'do-nv-lettre' });
    z.appendChild(h('label.do-case', lettre, h('span', { text: 'Lettre de motivation demandée' })));
    const err = h('p.do-err', { 'aria-live': 'polite' }); z.appendChild(err);
    z.appendChild(h('div.do-acts.do-acts-pied', U.bouton('Ajouter', function () {
      const n = nom.input.value.trim(); if (!n) { err.textContent = 'Donne un nom à la formation.'; nom.input.focus(); return; }
      let grille = null;
      const vals = {}; let somme = 0, renseigne = false;
      Object.keys(g).forEach(function (k) { const x = parseInt(g[k].value, 10); vals[k] = isNaN(x) ? 0 : x; if (g[k].value.trim()) renseigne = true; somme += vals[k]; });
      if (renseigne) { if (somme !== 100) { err.textContent = 'La grille doit totaliser 100 %.'; return; } grille = vals; }
      const id = 'v-' + Date.now().toString(36);
      S.voeux.push({ id: id, preset: null, nom: n, court: court.input.value.trim() || n.slice(0, 18), type: type.value, canal: type.value === 'direct' ? 'direct' : 'parcoursup', concours: conc.value || null, grille: grille, ordre: S.voeux.length + 1, statut: 'envisage', cible: cible, cibleMention: null, lettreDemandee: lettre.checked, notes: '', maj: E.maintenant() });
      if (lettre.checked) S.textes.lettres[id] = E.texteVide();
      E.sauver(); fe.fermer(); A.nav('jury', id, '', true);
    }, 'do-btn-prim'), U.bouton('Annuler', function () { fe.fermer(); }, 'do-btn-sec')));
    const fe = U.feuille('Ajouter un vœu', z);
  }
};
