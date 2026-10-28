/* ===== Mon dossier Parcoursup · import d'un bulletin (PDF du lycée sans IA, photo ou capture lue par l'IA) → vérification =====
   Rien n'est écrit avant « Enregistrer ». Chaque ligne écrite porte sa source ('pdf' ou 'photo').
   La photo ne part chez le fournisseur IA qu'après un accord explicite (bouton « Envoyer »). */
'use strict';
window.DOSSIER_IMPORT = (function () {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h, IA = window.DOSSIER_IA;
  const A = { nav: function () { return window.DOSSIER.nav.apply(null, arguments); }, rendre: function () { return window.DOSSIER.rendre(); } };   // app.js est chargé après ce fichier

  /* niveau d'un bulletin : la classe écrite (« 1ERE STMGA », « TSTMG GF », « T STMG 2 », « Terminale… ») puis le contenu
     (philosophie sans français : Terminale ; français : Première) */
  function niveauDe(r, codeDefaut) {
    const cl = C.sansAccent(r.periode.classe || r.meta.classe || '').toUpperCase().replace(/\s+/g, ' ').trim();
    if (r.periode.niveau === '1re' || /(^|\W)(1ERE|1RE|PREMIERE|1 ?STMG|1E\b)/.test(cl)) return '1re';
    if (r.periode.niveau === 'Tle' || /(^|\W)(TLE|TERM|TERMINALE|T ?STMG|T\d)/.test(cl)) return 'Tle';
    const codes = r.periode.disciplines.map(function (d) { return d.codeMatiere; });
    if (codes.indexOf('PHILO') !== -1 && codes.indexOf('FRANC') === -1) return 'Tle';
    if (codes.indexOf('FRANC') !== -1) return '1re';
    return C.niveau(codeDefaut);
  }

  /* PDF (export Charlemagne / Excel du lycée) → période structurée */
  async function depuisPdf(file, codeDefaut) {
    const t = U.toast('Lecture du PDF…', 60000);
    try {
      if (file.size > 25e6) throw new Error('Fichier trop lourd (25 Mo maximum).');
      const buf = await file.arrayBuffer();
      const debut = Date.now();
      const doc = await window.DOSSIER_PDF.pdfTexte(buf);
      if (doc.erreur === 'DECOMPRESSION') throw new Error('Ce navigateur ne sait pas encore lire ce PDF (iOS 16.4 ou plus récent requis). Utilise la photo, ou la saisie à la main.');
      if (!doc.pages.length) throw new Error('Aucun texte lisible dans ce PDF (document scanné ou polices particulières). Essaie la photo, ou la saisie à la main.');
      const r = window.DOSSIER_BULLETIN.parserBulletin(doc);
      if (!r.ok) throw new Error(r.erreur || 'Bulletin non reconnu.');
      t.remove();
      const niv = niveauDe(r, codeDefaut);
      const code = r.periode.code && /^A00([123])$/.test(r.periode.code) ? (niv === '1re' ? '1-' : 'T-') + 'T' + r.periode.code.slice(-1) : codeDefaut;
      const lignes = r.periode.disciplines.map(function (d) {
        const id = mapperCode(d.codeMatiere, niv) || C.mapperLibelle(d.libelleOriginal, niv, E.S.synonymes);
        return { libelle: d.libelleOriginal || d.libelle, reconnu: d.libelle, id: id === 'ignore' ? null : id, moy: C.note(d.moyenne), classe: C.note(d.moyenneClasse), min: null, max: null, rang: null, effectif: null, coef: typeof d.coef === 'number' ? d.coef : null, app: (d.appreciations || []).join(' ').slice(0, 600), problemes: [], ok: true, ignore: id === 'ignore', groupe: niv === 'Tle' && C.estLigneGroupe(d.libelleOriginal || d.libelle) };
      }).filter(function (l) { return !l.ignore; });
      lignes.forEach(function (l) { if (!l.id) { l.problemes.push('matière non reconnue'); l.ok = false; } });
      verifier({ source: 'pdf', code: code, niv: niv, lignes: lignes, duree: Date.now() - debut, meta: { moyGenerale: r.periode.moyenneGenerale, moyClasse: r.periode.moyenneClasse, moyRecalculee: r.periode.moyenneRecalculee, observationConseil: r.periode.observationConseil, mentionConseil: r.periode.mentionConseil, absences: absencesOk(r.periode.absences), classe: r.periode.classe, etablissement: r.meta.etablissement }, avertissements: r.avertissements || [] });
    } catch (e) {
      t.remove();
      U.toast(e && e.message ? e.message : 'Je n’ai pas réussi à lire ce PDF.', 6000);
    }
  }
  /* absences et retards lus en pied de bulletin : gardés seulement s'ils sont des nombres plausibles */
  function absencesOk(a) {
    if (!a || typeof a !== 'object') return null;
    const n = function (x) { return typeof x === 'number' && isFinite(x) && x >= 0 && x < 1000 ? Math.round(x) : null; };
    const o = { cours: n(a.cours), injustifiees: n(a.injustifiees), retards: n(a.retards) };
    return o.cours == null && o.retards == null ? null : o;
  }
  function mapperCode(code, niv) {
    const T = { FRANC: 'francais', EMC: 'emc', HGEO: 'hg', MATHS: 'maths', ANG: 'anglais', ESP: 'espagnol', EPS: 'eps', DRECO: 'droit-eco', MSDGN: 'management', SGN: niv === '1re' ? 'sdgn' : 'management', MANAG: 'management', GF: 'gf', PHILO: 'philo', ENGAG: 'engagement', VIE: 'ignore' };
    return T[code] || null;
  }

  /* photo → accord → JSON (IA) → vérification */
  let ctrl = null;
  function depuisPhoto(file, codeDefaut) {
    if (!IA.dispo()) return;
    const niv = C.niveau(codeDefaut);
    const zone = h('div');
    const apercu = h('img.do-apercu', { alt: 'Aperçu de l’image choisie' });
    try { apercu.src = URL.createObjectURL(file); apercu.onload = function () { URL.revokeObjectURL(apercu.src); }; } catch (e) { }
    zone.appendChild(apercu);
    zone.appendChild(h('p.do-ia', { text: 'Cette image va partir chez Groq, avec ta clé, pour être lue par une IA. Si elle montre ton nom, ta date de naissance ou ton adresse, recadre-la d’abord (ou masque-les), puis reviens. Rien n’est enregistré avant ta vérification.' }));
    const etat = h('p.do-texte', { 'aria-live': 'polite' });
    zone.appendChild(etat);
    const acts = h('div.do-acts.do-acts-pied');
    zone.appendChild(acts);
    let envoye = false;
    const f = U.feuille('Lire ce bulletin avec l’IA', zone, { fixe: true, surFermeture: function () { if (ctrl) ctrl.abort(); } });
    const envoyer = U.bouton('Envoyer et lire', async function () {
      if (envoye) return; envoye = true;
      U.vider(acts);
      acts.appendChild(U.bouton('Arrêter la lecture', function () { if (ctrl) ctrl.abort(); }, 'do-btn-sec'));
      etat.textContent = U.typo('Préparation de la photo…');
      ctrl = new AbortController();
      try {
        const json = await IA.lireBulletin(file, ctrl.signal, function (t) { etat.textContent = U.typo(t); });
        f.fermer();
        const v = C.validerLecture(json, niv, E.S.synonymes, E.S.profil.effectif);
        if (v.erreurs.length && !v.lignes.length) throw new Error(v.erreurs[0]);
        const code = v.periode && C.niveau(v.periode) === niv ? v.periode : codeDefaut;
        verifier({ source: 'photo', code: code, niv: niv, lignes: v.lignes.map(function (l) { return Object.assign(l, { reconnu: l.id ? C.nomDe(l.id, null, code) : '' }); }), meta: { moyGenerale: C.note(num(json.moyenneGenerale)), moyClasse: C.note(num(json.moyenneClasse)) }, avertissements: [] });
      } catch (e) {
        f.fermer();
        U.toast(IA.message(e), 6000);
      } finally { ctrl = null; }
    }, 'do-btn-prim');
    acts.appendChild(envoyer);
    acts.appendChild(U.bouton('Annuler', function () { f.fermer(); }, 'do-btn-sec'));
    setTimeout(function () { envoyer.focus(); }, 40);
  }
  function num(v) { if (v == null) return null; if (typeof v === 'number') return v; const m = /(\d{1,2})(?:[,.](\d{1,2}))?/.exec(String(v)); return m ? parseFloat(m[1] + '.' + (m[2] || '0')) : null; }

  /* ---- écran de vérification commun : une rangée par matière, en-têtes et pied collants ---- */
  function verifier(lecture) {
    const S = E.S;
    const zone = h('div.do-verif');
    const nbOk = lecture.lignes.filter(function (l) { return l.ok; }).length, nbKo = lecture.lignes.length - nbOk;
    /* synthèse : ce qui a été lu, d'un coup d'œil */
    const synth = h('div.do-verif-synth', { role: 'status' });
    const mRelue = lecture.meta.moyRecalculee != null ? lecture.meta.moyRecalculee : null;
    const retrouvee = lecture.meta.moyGenerale != null && mRelue != null && Math.abs(lecture.meta.moyGenerale - mRelue) <= 0.15;
    synth.appendChild(h('p.do-verif-synth-l', h('b', { text: U.pluriel(lecture.lignes.length, 'matière lue', 'matières lues') }),
      lecture.meta.moyGenerale != null ? [' · moyenne ', h('b', { text: C.fmt(lecture.meta.moyGenerale) }), retrouvee ? ' retrouvée' : ''] : null,
      ' · ', h('b.' + (nbKo ? 'do-ton-orange' : 'do-ton-vert'), { text: nbKo ? U.pluriel(nbKo, 'ligne à corriger', 'lignes à corriger') : 'aucune ligne à corriger' })));
    /* le reste du pied du bulletin, visible avant d'enregistrer */
    const piedLu = [];
    if (lecture.meta.moyClasse != null) piedLu.push(['Moyenne de classe ', h('b', { text: C.fmt(lecture.meta.moyClasse) })]);
    if (lecture.meta.mentionConseil) piedLu.push(['Conseil\u00a0de\u00a0classe : ', U.badge(lecture.meta.mentionConseil, 'ok')]);
    const ab = lecture.meta.absences;
    if (ab && ab.cours != null) piedLu.push(['Absences : ', h('b', { text: U.pluriel(ab.cours, 'cours', 'cours') }), ab.injustifiees ? ' (' + U.pluriel(ab.injustifiees, 'injustifiée', 'injustifiées') + ')' : '']);
    if (ab && ab.retards != null) piedLu.push(['Retards : ', h('b', { text: String(ab.retards) })]);
    if (piedLu.length) synth.appendChild(h('p.do-verif-synth-pied', piedLu.map(function (x, i) { return i ? [' · '].concat(x) : x; })));
    if (lecture.meta.observationConseil) synth.appendChild(h('details.do-plus.do-verif-obs', h('summary', { text: 'Observation du conseil de classe' }), h('p.do-aide', h('i', { text: lecture.meta.observationConseil }))));
    if (lecture.source === 'pdf') synth.appendChild(h('p.do-aide', U.badge('lu sans IA, sur ton téléphone', 'ok'), ' ', (lecture.meta.etablissement ? lecture.meta.etablissement + ' · ' : '') + (lecture.meta.classe ? 'classe ' + lecture.meta.classe : '')));
    else synth.appendChild(h('p.do-ia', { text: 'Lu par une IA : vérifie chaque chiffre, surtout les 6 et les 8 et la colonne moyenne de classe.' }));
    zone.appendChild(synth);
    lecture.avertissements.forEach(function (a) { zone.appendChild(h('p.do-ia', { text: a })); });

    /* période : les cinq bulletins transmis (un bulletin mal étiqueté par le lycée reste rangeable au bon endroit) */
    const selP = h('select.do-select', { 'aria-label': 'Période du bulletin' });
    C.TRANSMISES.forEach(function (c) { selP.appendChild(h('option', { value: c, text: C.LIBELLES[c] + (S.periodes[c] && C.nbLignes(S.periodes[c]) ? ' (déjà saisi, sera remplacé)' : ''), selected: c === lecture.code })); });
    zone.appendChild(h('label.do-champ.do-champ-periode', h('span.do-champ-l', { text: 'Ce bulletin est celui de' }), selP));
    const legende = h('p.do-aide', { text: nbKo ? 'Les lignes marquées d’un trait orange sont à vérifier : choisis la matière ou corrige le chiffre.' : 'Tout est reconnu. Relis les chiffres, puis enregistre.' });
    zone.appendChild(legende);

    const liste = h('div.do-verif-liste', { role: 'table', 'aria-label': 'Lignes lues sur le bulletin' });
    liste.appendChild(h('div.do-verif-entete', { role: 'row' }, h('span', { role: 'columnheader', text: 'Matière' }), h('span', { role: 'columnheader', text: 'Coef' }), h('span', { role: 'columnheader', text: 'Moi' }), h('span', { role: 'columnheader', text: 'Classe' })));
    const menu = function (sel, l, code) {
      U.vider(sel);
      sel.appendChild(h('option', { value: '', text: 'à corriger : choisis la matière' }));
      C.ordreDe(code).forEach(function (id) { sel.appendChild(h('option', { value: id, text: C.nomDe(id, null, code), selected: id === l.id })); });
      sel.appendChild(h('option', { value: '__libre', text: 'Autre (garder le libellé)' }));
      sel.appendChild(h('option', { value: '__ignorer', text: 'Ignorer cette ligne' }));
    };
    const etat = lecture.lignes.map(function (l) {
      const bloc = h('div.do-verif-l' + (l.ok ? '' : '.do-a-corriger'), { role: 'row' });
      const sel = h('select.do-select', { 'aria-label': 'Matière pour la ligne « ' + l.libelle + ' »' });
      menu(sel, l, lecture.code);
      const nomLu = C.sansAccent(l.libelle).replace(/[^a-z0-9]+/g, ' ').trim(), nomApp = C.sansAccent(l.id ? C.nomDe(l.id, null, lecture.code) : '').replace(/[^a-z0-9]+/g, ' ').trim();
      const cellM = h('div.do-verif-m', { role: 'cell' }, sel);
      if (!l.id || nomLu !== nomApp) cellM.appendChild(h('span.do-aide', { text: 'Lu sur le bulletin : « ' + (l.libelle || 'sans libellé') + ' »' }));
      if (l.groupe) cellM.appendChild(h('span.do-aide', { text: 'Ligne commune MSDGN et Gestion et finance : coefficient 16 réparti 12 et 4.' }));
      if (l.problemes.length) cellM.appendChild(h('span.do-err', { text: l.problemes.join(', ') }));
      const champ = function (val, label, dec) { return h('input.do-note.do-note-c', { type: 'text', inputmode: 'decimal', 'aria-label': label + ' : ' + l.libelle, value: val != null ? (dec ? C.fmt(val, 2).replace(/,?0+$/, '') : C.fmt(val, 0)) : '' }); };
      const coef = champ(l.coef, 'Coefficient', false), moi = champ(l.moy, 'Ma moyenne', true), cla = champ(l.classe, 'Moyenne de classe', true);
      bloc.appendChild(cellM);
      bloc.appendChild(h('div', { role: 'cell' }, coef)); bloc.appendChild(h('div', { role: 'cell' }, moi)); bloc.appendChild(h('div', { role: 'cell' }, cla));
      sel.addEventListener('change', function () { bloc.classList.toggle('do-a-corriger', !sel.value); });
      liste.appendChild(bloc);
      return { l: l, tr: bloc, sel: sel, coef: coef, moi: moi, cla: cla };
    });
    selP.addEventListener('change', function () { etat.forEach(function (x) { const v = x.sel.value; menu(x.sel, Object.assign({}, x.l, { id: v && v.indexOf('__') !== 0 ? v : x.l.id }), selP.value); if (v) x.sel.value = v; }); });
    zone.appendChild(liste);
    if (lecture.lignes.some(function (l) { return l.app; })) zone.appendChild(h('p.do-aide', { text: 'Les appréciations lues sont enregistrées avec chaque ligne ; tu les relis dans Bulletins, onglet de la période, « Détails ».' }));
    const erreur = h('p.do-err', { 'aria-live': 'polite' });
    zone.appendChild(erreur);

    const enreg = U.bouton('Enregistrer', function () {
      const code = selP.value, niv = C.niveau(code);
      const lignes = {}; let nb = 0;
      const cible = niv === '1re' ? S.coefs.premiere : S.coefs.tle;
      const coefsLus = {};
      for (const x of etat) {
        const id = x.sel.value;
        if (id === '__ignorer') continue;
        if (!id) { erreur.textContent = U.typo('Choisis une matière pour chaque ligne, ou ignore-la.'); x.sel.focus(); return; }
        const rm = U.lireNote(x.moi.value), rc = U.lireNote(x.cla.value);
        if (rm.erreur || rc.erreur) { erreur.textContent = U.typo('Entre 0 et 20 : ' + x.l.libelle); (rm.erreur ? x.moi : x.cla).focus(); return; }
        const coefV = x.coef.value.trim() ? parseFloat(x.coef.value.replace(',', '.')) : null;
        if (coefV != null && !(coefV >= 0 && coefV <= 30)) { erreur.textContent = U.typo('Coefficient invalide : ' + x.l.libelle); x.coef.focus(); return; }
        const cle = id === '__libre' ? 'libre-' + C.sansAccent(x.l.libelle).replace(/[^a-z0-9]+/g, '-').slice(0, 20) : id;
        const L = { source: lecture.source, maj: E.maintenant() };
        if (id === '__libre') L.nom = x.l.libelle;
        if (!rm.vide) { L.moy = rm.valeur; nb++; }
        if (!rc.vide) L.classe = rc.valeur;
        /* ligne commune « MSDGN Gestion et finance » : son coefficient est celui du groupe, réparti entre les sous-matières */
        const groupe = niv === 'Tle' && id === 'management' && x.l.groupe;
        if (coefV != null && !groupe) { L.coef = coefV; if (C.MATIERES[cle] && !C.MATIERES[cle].sansCoef) coefsLus[cle] = coefV; }
        if (coefV != null && groupe) { const t = C.tableDe('T-T1', S.coefs), cm = t.management || 12, cg = t.gf || 4; coefsLus.management = coefV * cm / (cm + cg); coefsLus.gf = coefV * cg / (cm + cg); }
        if (x.l.min != null) L.min = x.l.min; if (x.l.max != null) L.max = x.l.max;
        if (x.l.rang != null) L.rang = x.l.rang; if (x.l.effectif != null) L.effectif = x.l.effectif;
        if (x.l.app) L.app = x.l.app;
        /* synonyme mémorisé quand l'élève a corrigé la matière */
        if (id !== '__libre' && x.l.id !== id) { const t = C.sansAccent(x.l.libelle).replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); if (t) S.synonymes[t] = id; }
        lignes[cle] = L;
      }
      if (!nb) { erreur.textContent = 'Aucune moyenne à enregistrer.'; return; }
      const ancienne = S.periodes[code] || {};
      S.periodes[code] = { cloture: niv === '1re' ? true : !!ancienne.cloture, source: lecture.source, le: C.iso(M.aujourdhui()), lignes: lignes,
        moyGenerale: lecture.meta.moyGenerale != null ? lecture.meta.moyGenerale : null, moyClasse: lecture.meta.moyClasse != null ? lecture.meta.moyClasse : null,
        appPP: ancienne.appPP || '', observationConseil: lecture.meta.observationConseil || '', mentionConseil: lecture.meta.mentionConseil || '', absences: lecture.meta.absences || null };
      /* coefficients lus : ils priment sur la table par défaut (l'élève les voit et les modifie dans Réglages) */
      Object.keys(coefsLus).forEach(function (id) { cible[id] = coefsLus[id]; });
      if (Object.keys(coefsLus).length) { S.coefs.source = 'import'; S.coefs.lus = C.iso(M.aujourdhui()); }
      if (lecture.meta.etablissement && !S.profil.lycee) S.profil.lycee = lecture.meta.etablissement;
      if (!E.sauver()) { if (E.plein) erreur.textContent = U.typo('Mémoire du téléphone pleine : exporte ton dossier puis libère de la place'); else { feuille.fermer(); A.rendre(); } return; }
      feuille.fermer();
      U.annoncer('Bulletin enregistré');
      U.toast('Bulletin ' + C.LIBELLES[code] + ' enregistré : ' + nb + ' matières.');
      A.nav('bulletins', code, '', true);
    }, 'do-btn-prim');
    const annul = U.bouton('Annuler', function () { feuille.fermer(); }, 'do-btn-sec');
    const feuille = U.feuille('Vérifie ton bulletin', zone, { fixe: true, focus: false, pied: [enreg, annul] });
    setTimeout(function () { const prem = zone.querySelector('.do-a-corriger select') || selP; prem.focus(); }, 40);
  }
  return { depuisPdf: depuisPdf, depuisPhoto: depuisPhoto, verifier: verifier, niveauDe: niveauDe };
})();
