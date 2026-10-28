/* ===== Mon dossier Parcoursup · import d'un bulletin (PDF du lycée sans IA, photo lue par l'IA) → écran de vérification =====
   Rien n'est écrit avant « Enregistrer ». Chaque ligne écrite porte sa source ('pdf' ou 'photo'). */
'use strict';
window.DOSSIER_IMPORT = (function () {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h, IA = window.DOSSIER_IA;
  const A = { nav: function () { return window.DOSSIER.nav.apply(null, arguments); }, rendre: function () { return window.DOSSIER.rendre(); } };   // app.js est chargé après ce fichier

  /* PDF (export Charlemagne / Excel du lycée) → période structurée */
  async function depuisPdf(file, codeDefaut) {
    const t = U.toast('Lecture du PDF…', 60000);
    try {
      if (file.size > 25e6) throw new Error('Fichier trop lourd (25 Mo maximum).');
      const buf = await file.arrayBuffer();
      const doc = await window.DOSSIER_PDF.pdfTexte(buf);
      if (!doc.pages.length) throw new Error('Aucun texte lisible dans ce PDF (polices particulières ou document scanné). Essaie la photo, ou la saisie à la main.');
      const r = window.DOSSIER_BULLETIN.parserBulletin(doc);
      if (!r.ok) throw new Error(r.erreur || 'Bulletin non reconnu.');
      t.remove();
      const niv = r.periode.niveau === '1re' ? '1re' : r.periode.niveau === 'Tle' ? 'Tle' : C.niveau(codeDefaut);
      const code = r.periode.code && /^A00([123])$/.test(r.periode.code) ? (niv === '1re' ? '1-' : 'T-') + 'T' + r.periode.code.slice(-1) : codeDefaut;
      const lignes = r.periode.disciplines.map(function (d) {
        const id = mapperCode(d.codeMatiere, niv) || C.mapperLibelle(d.libelleOriginal, niv, E.S.synonymes);
        return { libelle: d.libelleOriginal || d.libelle, id: id === 'ignore' ? null : id, moy: C.note(d.moyenne), classe: C.note(d.moyenneClasse), min: null, max: null, rang: null, effectif: null, coef: typeof d.coef === 'number' ? d.coef : null, app: (d.appreciations || []).join(' ').slice(0, 600), problemes: [], ok: true, ignore: id === 'ignore' };
      }).filter(function (l) { return !l.ignore; });
      lignes.forEach(function (l) { if (!l.id) { l.problemes.push('matière non reconnue'); l.ok = false; } });
      verifier({ source: 'pdf', code: code, niv: niv, lignes: lignes, meta: { moyGenerale: r.periode.moyenneGenerale, moyClasse: r.periode.moyenneClasse, observationConseil: r.periode.observationConseil, mentionConseil: r.periode.mentionConseil, classe: r.periode.classe, etablissement: r.meta.etablissement, absences: r.periode.absences }, avertissements: r.avertissements || [], titre: 'PDF lu sans IA' });
    } catch (e) {
      t.remove();
      U.toast(e && e.message ? e.message : 'Je n’ai pas réussi à lire ce PDF.', 6000);
    }
  }
  function mapperCode(code, niv) {
    const T = { FRANC: 'francais', EMC: 'emc', HGEO: 'hg', MATHS: 'maths', ANG: 'anglais', ESP: 'espagnol', EPS: 'eps', DRECO: 'droit-eco', MSDGN: 'management', SGN: niv === '1re' ? 'sdgn' : 'management', MANAG: 'management', GF: 'gf', PHILO: 'philo', ENGAG: 'engagement', VIE: 'ignore' };
    return T[code] || null;
  }

  /* photo → JSON (IA) → vérification */
  let ctrl = null;
  async function depuisPhoto(file, codeDefaut) {
    if (!IA.dispo()) return;
    const niv = C.niveau(codeDefaut);
    let fin = null;
    const zone = h('div');
    zone.appendChild(h('p.do-ia', { text: 'Ta photo part chez Groq avec ta clé, pour être lue par une IA. Elle contient ton nom et celui de ton lycée : masque-les si tu ne veux pas qu’ils partent. Rien n’est enregistré avant ta vérification.' }));
    const etat = h('p.do-texte', { 'aria-live': 'polite', text: 'Préparation de la photo…' });
    zone.appendChild(etat);
    const stop = U.bouton('Arrêter la lecture', function () { if (ctrl) ctrl.abort(); }, 'do-btn-sec');
    zone.appendChild(h('div.do-acts', stop));
    const f = U.feuille('Lecture du bulletin', zone, { fixe: true, surFermeture: function () { if (ctrl) ctrl.abort(); } });
    ctrl = new AbortController();
    try {
      const json = await IA.lireBulletin(file, ctrl.signal, function (t) { etat.textContent = t; });
      f.fermer();
      const v = C.validerLecture(json, niv, E.S.synonymes, E.S.profil.effectif);
      if (v.erreurs.length && !v.lignes.length) throw new Error(v.erreurs[0]);
      const code = v.periode && C.niveau(v.periode) === niv ? v.periode : codeDefaut;
      verifier({ source: 'photo', code: code, niv: niv, lignes: v.lignes, meta: { moyGenerale: C.note(num(json.moyenneGenerale)), moyClasse: C.note(num(json.moyenneClasse)) }, avertissements: [], titre: 'Lu par une IA' });
    } catch (e) {
      f.fermer();
      U.toast(IA.message(e), 6000);
    } finally { ctrl = null; }
  }
  function num(v) { if (v == null) return null; if (typeof v === 'number') return v; const m = /(\d{1,2})(?:[,.](\d{1,2}))?/.exec(String(v)); return m ? parseFloat(m[1] + '.' + (m[2] || '0')) : null; }

  /* ---- écran de vérification commun ---- */
  function verifier(lecture) {
    const S = E.S;
    const zone = h('div.do-verif');
    if (lecture.source === 'photo') zone.appendChild(h('p.do-ia', { text: 'Lu par une IA : vérifie chaque chiffre, surtout les 6 et les 8 et la colonne moyenne de classe.' }));
    else zone.appendChild(h('p.do-aide', { text: 'Lu dans le PDF, sans IA. ' + (lecture.meta.etablissement ? lecture.meta.etablissement + ' · ' : '') + (lecture.meta.classe ? 'classe ' + lecture.meta.classe + '. ' : '') + 'Vérifie les lignes puis enregistre.' }));
    lecture.avertissements.forEach(function (a) { zone.appendChild(h('p.do-ia', { text: a })); });
    const codes = (lecture.niv === '1re' ? ['1-T1', '1-T2', '1-T3'] : ['T-T1', 'T-T2']);
    const selP = h('select.do-select', { 'aria-label': 'Période' });
    codes.forEach(function (c) { selP.appendChild(h('option', { value: c, text: C.LIBELLES[c] + (S.periodes[c] && C.nbLignes(S.periodes[c]) ? ' (déjà saisie, sera remplacée)' : ''), selected: c === lecture.code })); });
    zone.appendChild(h('label.do-champ', h('span.do-champ-l', { text: 'Période' }), selP));
    const liste = h('div.do-verif-liste');
    const ordre = C.ordreDe(lecture.code);
    const etat = lecture.lignes.map(function (l) {
      const bloc = h('div.do-verif-l' + (l.ok ? '' : '.do-a-corriger'));
      bloc.appendChild(h('span.do-lu', { text: l.libelle || '(sans libellé)' }));
      if (l.problemes.length) bloc.appendChild(h('span.do-err', { text: l.problemes.join(', ') }));
      const sel = h('select.do-select', { 'aria-label': 'Matière pour ' + l.libelle });
      sel.appendChild(h('option', { value: '', text: 'à corriger : choisis la matière' }));
      ordre.forEach(function (id) { sel.appendChild(h('option', { value: id, text: C.nomDe(id), selected: id === l.id })); });
      sel.appendChild(h('option', { value: '__libre', text: 'Autre (garder le libellé)' }));
      sel.appendChild(h('option', { value: '__ignorer', text: 'Ignorer cette ligne' }));
      const coef = h('input.do-note.do-note-c', { type: 'text', inputmode: 'decimal', 'aria-label': 'Coefficient', value: l.coef != null ? C.fmt(l.coef, 0) : '' });
      const moi = h('input.do-note.do-note-c' + (l.moy != null ? '.do-surligne' : ''), { type: 'text', inputmode: 'decimal', 'aria-label': 'Moyenne élève', value: l.moy != null ? C.fmt(l.moy, 2).replace(/,?0+$/, '') : '' });
      const cla = h('input.do-note.do-note-c', { type: 'text', inputmode: 'decimal', 'aria-label': 'Moyenne de classe', value: l.classe != null ? C.fmt(l.classe, 2).replace(/,?0+$/, '') : '' });
      const r = h('div.do-rangee');
      r.appendChild(h('label.do-champ.do-champ-sel', h('span.do-champ-l', { text: 'Matière' }), sel));
      r.appendChild(h('label.do-champ', h('span.do-champ-l', { text: 'Coef' }), coef));
      r.appendChild(h('label.do-champ', h('span.do-champ-l', { text: 'Moi' }), moi));
      r.appendChild(h('label.do-champ', h('span.do-champ-l', { text: 'Classe' }), cla));
      bloc.appendChild(r);
      sel.addEventListener('change', function () { bloc.classList.toggle('do-a-corriger', !sel.value); });
      liste.appendChild(bloc);
      return { l: l, tr: bloc, sel: sel, coef: coef, moi: moi, cla: cla };
    });
    zone.appendChild(liste);
    if (lecture.lignes.some(function (l) { return l.app; })) zone.appendChild(h('p.do-aide', { text: 'Les appréciations lues seront enregistrées avec chaque ligne ; tu pourras les relire dans Bulletins.' }));
    const erreur = h('p.do-err', { 'aria-live': 'polite' });
    zone.appendChild(erreur);
    const enreg = U.bouton('Enregistrer', function () {
      const code = selP.value;
      const lignes = {}; let nb = 0;
      for (const x of etat) {
        const id = x.sel.value;
        if (id === '__ignorer') continue;
        if (!id) { erreur.textContent = 'Choisis une matière pour chaque ligne, ou ignore-la.'; x.sel.focus(); return; }
        const rm = U.lireNote(x.moi.value), rc = U.lireNote(x.cla.value);
        if (rm.erreur || rc.erreur) { erreur.textContent = 'Entre 0 et 20 : ' + x.l.libelle; (rm.erreur ? x.moi : x.cla).focus(); return; }
        const coefV = x.coef.value.trim() ? parseFloat(x.coef.value.replace(',', '.')) : null;
        if (coefV != null && !(coefV >= 0 && coefV <= 30)) { erreur.textContent = 'Coefficient invalide : ' + x.l.libelle; x.coef.focus(); return; }
        const cle = id === '__libre' ? 'libre-' + C.sansAccent(x.l.libelle).replace(/[^a-z0-9]+/g, '-').slice(0, 20) : id;
        const L = { source: lecture.source, maj: E.maintenant() };
        if (id === '__libre') L.nom = x.l.libelle;
        if (!rm.vide) { L.moy = rm.valeur; nb++; }
        if (!rc.vide) L.classe = rc.valeur;
        if (coefV != null) L.coef = coefV;
        if (x.l.min != null) L.min = x.l.min; if (x.l.max != null) L.max = x.l.max;
        if (x.l.rang != null) L.rang = x.l.rang; if (x.l.effectif != null) L.effectif = x.l.effectif;
        if (x.l.app) L.app = x.l.app;
        /* synonyme mémorisé quand l'élève a corrigé la matière */
        if (id !== '__libre' && x.l.id !== id) { const t = C.sansAccent(x.l.libelle).replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); if (t) S.synonymes[t] = id; }
        lignes[cle] = L;
      }
      if (!nb) { erreur.textContent = 'Aucune moyenne à enregistrer.'; return; }
      const ancienne = S.periodes[code] || {};
      S.periodes[code] = { cloture: lecture.niv === '1re' ? true : !!ancienne.cloture, source: lecture.source, le: C.iso(M.aujourdhui()), lignes: lignes,
        moyGenerale: lecture.meta.moyGenerale != null ? lecture.meta.moyGenerale : null, moyClasse: lecture.meta.moyClasse != null ? lecture.meta.moyClasse : null,
        appPP: ancienne.appPP || '', observationConseil: lecture.meta.observationConseil || '', mentionConseil: lecture.meta.mentionConseil || '' };
      /* coefficients lus : ils priment sur la table par défaut (l'élève les voit dans Réglages) */
      const cible = lecture.niv === '1re' ? S.coefs.premiere : S.coefs.tle;
      Object.keys(lignes).forEach(function (id) { if (typeof lignes[id].coef === 'number' && C.MATIERES[id] && !C.MATIERES[id].sansCoef) cible[id] = lignes[id].coef; });
      if (Object.keys(lignes).some(function (id) { return typeof lignes[id].coef === 'number'; })) { S.coefs.source = 'import'; S.coefs.lus = C.iso(M.aujourdhui()); }
      if (lecture.meta.etablissement && !S.profil.lycee) S.profil.lycee = lecture.meta.etablissement;
      if (!E.sauver()) { erreur.textContent = 'Mémoire du téléphone pleine : exporte ton dossier puis libère de la place'; return; }
      feuille.fermer();
      U.annoncer('Bulletin enregistré');
      U.toast('Bulletin ' + C.LIBELLES[code] + ' enregistré : ' + nb + ' matières.');
      A.nav('bulletins', code, '', true);
    }, 'do-btn-prim');
    const annul = U.bouton('Annuler', function () { feuille.fermer(); }, 'do-btn-sec');
    zone.appendChild(h('div.do-acts.do-acts-pied', enreg, annul));
    const feuille = U.feuille('Vérifier le bulletin · ' + lecture.titre, zone, { fixe: true, focus: false });
    setTimeout(function () { const prem = zone.querySelector('.do-a-corriger select') || selP; prem.focus(); }, 40);
  }
  return { depuisPdf: depuisPdf, depuisPhoto: depuisPhoto, verifier: verifier };
})();
