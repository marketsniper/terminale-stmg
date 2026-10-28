/* ===== Mon dossier Parcoursup · réglages, sauvegarde, impression, coefficients ===== */
'use strict';
window.DOSSIER_VUES = window.DOSSIER_VUES || {};
window.DOSSIER_VUES.reglages = function (corps, pied) {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h, A = window.DOSSIER;
  const S = E.S;
  const sauver = U.debounce(function () { E.sauver(); }, 300);

  /* mon lycée */
  const b1 = h('section.do-bloc');
  b1.appendChild(h('h3.do-kicker', { text: 'Mon lycée' }));
  b1.appendChild(h('div.do-grille-2', U.champTexte('Prénom', S.profil.prenom, function (v) { S.profil.prenom = v.trim(); sauver(); }, { placeholder: 'facultatif' }).el, U.champTexte('Lycée', S.profil.lycee, function (v) { S.profil.lycee = v.trim(); sauver(); }, { placeholder: 'rempli par l’import du bulletin' }).el,
    U.champTexte('Classe', S.profil.classe, function (v) { S.profil.classe = v.trim(); sauver(); }).el, U.champTexte('Effectif de la classe', S.profil.effectif == null ? '' : S.profil.effectif, function (v) { const n = parseInt(v, 10); S.profil.effectif = isNaN(n) ? null : n; sauver(); }, { inputmode: 'numeric' }).el));
  b1.appendChild(h('div.do-champ', h('span.do-champ-l', { text: 'Boursier' }), U.pilules({ label: 'Boursier', items: [{ id: 'oui', texte: 'oui' }, { id: 'non', texte: 'non' }, { id: 'nsp', texte: 'je ne sais pas' }], actif: S.profil.boursier === true ? 'oui' : S.profil.boursier === false ? 'non' : 'nsp', surChoix: function (id, btn) { S.profil.boursier = id === 'oui' ? true : id === 'non' ? false : null; E.sauver(); Array.prototype.forEach.call(btn.parentNode.children, function (x) { x.classList.toggle('do-actif', x === btn); x.setAttribute('aria-pressed', String(x === btn)); }); } })));
  b1.appendChild(h('p.do-aide', { text: 'Les boursiers bénéficient de taux minimaux fixés par les recteurs dans chaque formation (présentation Parcoursup 2026).' }));
  corps.appendChild(b1);

  /* dates */
  const b2 = h('section.do-bloc');
  b2.appendChild(h('h3.do-kicker', { text: 'Dates de mon lycée' }));
  const champDate = function (label, k, aide) {
    const inp = h('input.do-texte', { type: 'date', 'aria-label': label, value: S.dates[k] || '' });
    inp.addEventListener('change', function () { S.dates[k] = inp.value || null; E.sauver(); U.annoncer('Date enregistrée'); A.publierResume(); });
    return h('label.do-champ', h('span.do-champ-l', { text: label }), inp, aide ? h('span.do-aide', { text: aide }) : null);
  };
  b2.appendChild(h('div.do-grille-2', champDate('Conseil de classe T1', 'conseilT1', 'Vendredi 27 novembre 2026 d’après l’app.'), champDate('Fin des notes T1', 'finNotesT1', 'Si tu ne la connais pas, on compte 7 jours avant le conseil.'),
    champDate('Conseil de classe T2', 'conseilT2', 'À demander au lycée (souvent mi-mars).'), champDate('Fin des notes T2', 'finNotesT2', 'Même règle : 7 jours avant le conseil.'),
    champDate('Rendez-vous avec ton professeur principal', 'rdvPP'), champDate('Remontée des bulletins', 'remonteeBulletins', 'Sinon le 26 mars 2027, extrapolé du calendrier 2026.')));
  b2.appendChild(h('p.do-aide', { text: 'Format des dates : jour, mois, année.' }));
  corps.appendChild(b2);

  /* coefficients */
  const b3 = h('section.do-bloc');
  b3.appendChild(h('h3.do-kicker', { text: 'Coefficients du bulletin' }));
  b3.appendChild(h('p.do-aide', { text: 'Terminale STMG GF, relevés sur ÉcoleDirecte le 26/10/2026 (total 52, dont la ligne MSDGN Gestion et finance à 16 : MSDGN 12 et GF 4) ; Première, lus sur le bulletin du T3 (total 45). Un import PDF ou photo qui indique des coefficients les remplace. Chaque valeur reste modifiable.' + (S.coefs.source === 'import' ? ' Derniers coefficients lus dans un import le ' + C.fmtDate(S.coefs.lus, 'num') + '.' : '') }));
  const grilleCoefs = function (niv) {
    const table = C.tableDe(niv === '1re' ? '1-T1' : 'T-T1', S.coefs), cible = niv === '1re' ? S.coefs.premiere : S.coefs.tle;
    const z = h('div.do-coefs');
    z.appendChild(h('p.do-champ-l', { text: niv === '1re' ? 'Première' : 'Terminale' }));
    const total = h('span.do-aide');
    const majTotal = function () { const t = C.tableDe(niv === '1re' ? '1-T1' : 'T-T1', S.coefs); let s = 0; Object.keys(t).forEach(function (k) { s += t[k]; }); total.textContent = 'total ' + C.fmt(s, 0); };
    const g = h('div.do-coefs-grille');
    Object.keys(table).forEach(function (id) {
      const inp = h('input.do-note.do-note-c', { type: 'text', inputmode: 'decimal', 'aria-label': 'Coefficient ' + C.nomDe(id, null, niv === '1re' ? '1-T1' : 'T-T1') + ' en ' + (niv === '1re' ? 'Première' : 'Terminale'), value: C.fmt(table[id], Math.round(table[id]) === table[id] ? 0 : 1) });
      inp.addEventListener('input', function () { const v = parseFloat(inp.value.replace(',', '.')); if (v >= 0 && v <= 30) { cible[id] = v; S.coefs.source = 'saisie'; sauver(); majTotal(); inp.classList.remove('do-ko'); } else inp.classList.add('do-ko'); });
      const code = niv === '1re' ? '1-T1' : 'T-T1';
      g.appendChild(h('label.do-coef-c', { style: '--acc:' + C.couleurDe(id), title: C.nomDe(id, null, code) }, h('span', { text: C.courtDe(id, null, code) }), inp));
    });
    z.appendChild(g); z.appendChild(total); majTotal();
    return z;
  };
  b3.appendChild(grilleCoefs('Tle'));
  b3.appendChild(grilleCoefs('1re'));
  b3.appendChild(U.bouton('Revenir aux coefficients relevés', function () { S.coefs.tle = {}; S.coefs.premiere = {}; S.coefs.source = 'defaut'; E.sauver(); A.rendre(); }, 'do-btn-sec'));
  corps.appendChild(b3);

  /* sauvegarde */
  const b4 = h('section.do-bloc');
  b4.appendChild(h('h3.do-kicker', { text: 'Sauvegarde' }));
  b4.appendChild(h('p.do-texte', { text: 'Tes notes ne quittent jamais ce téléphone. L’IA ne reçoit que ce que tu lui envoies en appuyant sur un bouton.' }));
  const fichier = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, 'aria-hidden': 'true', tabindex: '-1' });
  const zImp = h('div');
  fichier.addEventListener('change', function () {
    const f = fichier.files && fichier.files[0]; fichier.value = ''; if (!f) return;
    f.text().then(function (t) {
      let obj = null; try { obj = JSON.parse(t); } catch (e) { U.toast('Ce fichier n’est pas un JSON lisible.', 5000); return; }
      const err = E.valider(obj); if (err) { U.toast(err, 6000); return; }
      U.confirmer(zImp, 'Remplacer ton dossier actuel par ce fichier ?', function () { const e2 = E.importer(obj); if (e2) U.toast(e2, 6000); else { U.toast('Dossier importé.'); A.publierResume(); A.rendre(); } }, 'Oui, remplacer', 'Annuler');
    });
  });
  b4.appendChild(h('div.do-acts', U.bouton('Exporter mon dossier (JSON)', function () { U.telecharger('mon-dossier-parcoursup.json', JSON.stringify(E.exporter(), null, 1), 'application/json'); U.toast('Fichier exporté.'); }, 'do-btn-sec'), U.bouton('Importer un dossier', function () { fichier.click(); }, 'do-btn-sec'), fichier)); b4.appendChild(zImp);
  b4.appendChild(h('p.do-aide', { text: 'Le fichier contient tes notes et tes appréciations ; il n’inclut jamais ta clé IA. La sauvegarde générale de l’app STMG n’emporte pas encore ce dossier : garde ce fichier à part.' }));
  b4.appendChild(h('p.do-aide', { text: 'Sur iPhone, Safari peut effacer les données d’un site que tu n’as pas ouvert depuis 7 jours. Ajoute l’app à l’écran d’accueil, ou exporte ton dossier après chaque bulletin.' }));
  corps.appendChild(b4);

  /* impression */
  const b5 = h('section.do-bloc');
  b5.appendChild(h('h3.do-kicker', { text: 'Impression' }));
  const cb = h('input', { type: 'checkbox', id: 'do-masque-app', checked: !!S.vu.masquerAppreciations });
  cb.addEventListener('change', function () { S.vu.masquerAppreciations = cb.checked; E.sauver(); });
  b5.appendChild(h('div.do-acts', U.bouton('Imprimer mon dossier en une page', function () { window.DOSSIER_IMPRESSION.page(); }, 'do-btn-sec'), U.bouton('Imprimer le relevé', function () { window.DOSSIER_IMPRESSION.releve(); }, 'do-btn-sec')));
  b5.appendChild(h('label.do-case', cb, h('span', { text: 'masquer les appréciations' })));
  b5.appendChild(h('p.do-aide', { text: 'Une page : moyennes par période, trajectoire, vœux et écarts, trois actions de la semaine, prochains jalons. Utile pour un rendez-vous avec le professeur principal.' }));
  corps.appendChild(b5);

  /* IA */
  const b6 = h('section.do-bloc');
  b6.appendChild(h('h3.do-kicker', { text: 'IA' }));
  const dispo = window.DOSSIER_IA.dispo();
  b6.appendChild(h('p.do-texte', { text: dispo ? 'Clé IA trouvée dans l’app : lecture d’un bulletin photographié et relecture des textes disponibles (en ligne). Lectures : ' + (S.ia.lecturesBulletin || 0) + ', relectures : ' + (S.ia.relectures || 0) + '.' : 'Aucune clé IA : tout fonctionne sans elle (PDF, saisie, calculs, textes). Pour la photo et la relecture, ajoute ta clé dans les réglages IA de l’app (accueil des exercices, bouton Réglages IA).' }));
  corps.appendChild(b6);

  /* effacer */
  const b7 = h('section.do-bloc.do-zone-danger');
  b7.appendChild(h('h3.do-kicker', { text: 'Effacer' }));
  const z = h('div');
  b7.appendChild(U.bouton('Effacer mon dossier', function () { U.confirmer(z, 'Tout effacer ? Pense à exporter avant.', function () { E.effacer(); U.toast('Dossier effacé.'); A.nav('tableau'); }, 'Oui, effacer', 'Annuler'); }, 'do-btn-danger'));
  b7.appendChild(z);
  corps.appendChild(b7);
  corps.appendChild(h('p.do-aide', { text: 'Mon dossier · version 1 · faits vérifiés le 27/10/2026 · les chiffres officiels sont ceux du lycée.' }));

  pied.appendChild(U.bouton('Tableau de bord', function () { A.nav('tableau'); }, 'do-btn-prim'));
};

/* ===== impression : deux variantes, construites dans un conteneur dédié puis window.print() ===== */
window.DOSSIER_IMPRESSION = (function () {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h;
  function zone() { let z = document.getElementById('do-print'); if (!z) { z = h('div#do-print', { 'aria-hidden': 'true' }); document.body.appendChild(z); } U.vider(z); return z; }
  function entete(z, titre) {
    const S = E.S;
    z.appendChild(h('h1', { text: titre }));
    z.appendChild(h('p', { text: [S.profil.prenom, S.profil.lycee, S.profil.classe || 'Terminale STMG', 'bac 2027', C.fmtDate(M.aujourdhui(), 'num')].filter(Boolean).join(' · ') }));
  }
  function lancer(mode) { document.body.classList.add('do-impression', 'do-impression-' + mode); setTimeout(function () { try { window.print(); } catch (e) { } }, 80); }
  function releve() {
    const S = E.S, m = M.calculer(), z = zone();
    entete(z, 'Relevé tel qu’il sera transmis');
    const table = h('table.do-tbl');
    const tr0 = h('tr', h('th', { text: 'Matière' })); C.TRANSMISES.forEach(function (c) { tr0.appendChild(h('th', { text: C.LIBELLES[c] })); });
    table.appendChild(h('thead', tr0));
    const tb = h('tbody');
    const ids = C.ORDRE_TLE.filter(function (id) { return !C.MATIERES[id].sansCoef; }).concat(['francais', 'sdgn']);
    ids.forEach(function (id) {
      const tr = h('tr', h('th', { text: id === 'management' ? 'MSDGN (Management en Première)' : C.nomDe(id) }));
      C.TRANSMISES.forEach(function (c) { const l = S.periodes[c] && S.periodes[c].lignes[id]; const mo = C.note(l && l.moy); tr.appendChild(h('td', { text: mo == null ? '' : C.fmt(mo) + (C.note(l.classe) != null ? ' / ' + C.fmt(l.classe) : '') + (l.rang ? ' (' + l.rang + (l.effectif ? '/' + l.effectif : '') + ')' : '') })); });
      tb.appendChild(tr);
    });
    const trM = h('tr', h('th', { text: 'Moyenne pondérée' })); C.TRANSMISES.forEach(function (c) { const mo = C.moyennes(S.periodes[c], c, S.coefs); trM.appendChild(h('td', { text: mo.mp == null ? '' : C.fmt(mo.mp) })); }); tb.appendChild(trM);
    table.appendChild(tb); z.appendChild(table);
    z.appendChild(h('p', { text: 'Anticipées : français écrit ' + C.fmt(S.anticipees.frEcrit) + ', oral ' + C.fmt(S.anticipees.frOral) + ', mathématiques ' + C.fmt(S.anticipees.maths) + '.' }));
    if (!S.vu.masquerAppreciations) {
      C.TRANSMISES.forEach(function (c) { const p = S.periodes[c]; if (!p) return; const apps = Object.keys(p.lignes).filter(function (id) { return p.lignes[id].app; }); if (!apps.length) return; z.appendChild(h('h2', { text: 'Appréciations ' + C.LIBELLES[c] })); apps.forEach(function (id) { z.appendChild(h('p', h('b', { text: C.nomDe(id, p.lignes[id]) + ' : ' }), p.lignes[id].app)); }); });
    }
    const v = m.voeux.find(function (x) { return x.v.id === S.vu.voeuJury; }) || m.voeux[0];
    if (v) z.appendChild(h('p', { text: 'Vœu : ' + v.f.nom + (typeof v.f.cible === 'number' ? ' · cible ' + C.fmt(v.f.cible) + ' · écart ' + C.fmtDelta(v.E == null ? null : -v.E) : '') + (v.f.grille ? ' · grille : résultats ' + v.f.grille.resultats + ' %, méthode ' + v.f.grille.methode + ' %, savoir-être ' + v.f.grille.savoirEtre + ' %, motivation ' + v.f.grille.motivation + ' %, engagement ' + v.f.grille.engagement + ' %' : '') }));
    z.appendChild(h('p.do-print-pied', { text: 'Préparé avec l’app Terminale STMG le ' + C.fmtDate(M.aujourdhui(), 'num') + '. Les chiffres officiels sont ceux du lycée.' }));
    lancer('releve');
  }
  function page() {
    const S = E.S, m = M.calculer(), z = zone();
    entete(z, 'Mon dossier Parcoursup en une page');
    z.appendChild(h('h2', { text: 'Moyennes pondérées' }));
    z.appendChild(h('p', { text: m.traj.serie.map(function (p) { return p.libelle + ' : ' + (p.mp == null ? 'vide' : (p.projete ? '≈ ' : '') + C.fmt(p.mp)); }).join(' · ') + (m.traj.dynamique ? ' · ' + (m.traj.dynamique === 'hausse' ? 'en hausse ' : m.traj.dynamique === 'baisse' ? 'en baisse ' : 'stable ') + C.fmtDelta(m.traj.delta) : '') }));
    z.appendChild(h('h2', { text: 'Vœux' }));
    const ul = h('ul'); m.ordreVoeux.forEach(function (x) { ul.appendChild(h('li', { text: x.f.nom + (typeof x.f.cible === 'number' ? ' · cible ' + C.fmt(x.f.cible) + ' · écart ' + (x.E == null ? '-' : C.fmtDelta(-x.E)) + ' (' + U.nomFeu(x.feu) + ')' : ' · hors Parcoursup') })); }); z.appendChild(ul);
    z.appendChild(h('h2', { text: 'Cette semaine' }));
    const ol = h('ol'); m.coach.actions.forEach(function (a) { ol.appendChild(h('li', { text: (a.fait ? '[fait] ' : '[ ] ') + a.txt })); }); z.appendChild(ol);
    z.appendChild(h('h2', { text: 'Prochains jalons' }));
    const ul2 = h('ul'); m.jalons.filter(function (j) { return j.date && j.jours != null && j.jours >= 0; }).slice(0, 6).forEach(function (j) { ul2.appendChild(h('li', { text: C.fmtDate(j.date, 'num') + ' · ' + j.titre + (j.aConfirmer ? ' (à confirmer)' : '') })); }); z.appendChild(ul2);
    z.appendChild(h('p', { text: 'Dossier complété à ' + m.completion.pct + ' %.' }));
    z.appendChild(h('p.do-print-pied', { text: 'Préparé avec l’app Terminale STMG le ' + C.fmtDate(M.aujourdhui(), 'num') + '. Les chiffres officiels sont ceux du lycée.' }));
    lancer('page');
  }
  return { releve: releve, page: page };
})();
