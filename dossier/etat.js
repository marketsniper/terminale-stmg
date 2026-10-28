/* ===== Mon dossier Parcoursup · état local =====
   Une seule clé écrite : localStorage['stmg-dossier'] (et 'stmg-dossier-abime' une fois, si la clé est corrompue).
   Lecture seule des clés de l'app STMG (échéances, DS blancs, fiches, séances, quiz) et de la clé IA.
   Jamais d'image, jamais de clé IA dans l'état ni dans un export. */
'use strict';
window.DOSSIER_ETAT = (function () {
  const C = window.DOSSIER_CALC, F = window.DOSSIER_FORMATIONS;
  const K = 'stmg-dossier', K_ABIME = 'stmg-dossier-abime', VERSION = 1;
  const LS = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lireJSON = function (k, d) { const v = LS(k); if (v == null) return d; try { const j = JSON.parse(v); return j == null ? d : j; } catch (e) { return d; } };
  const maintenant = function () { return new Date().toISOString(); };

  function texteVide() { return { txt: '', maj: null, versions: [] }; }
  function defaut() {
    return {
      version: VERSION, cree: maintenant(), maj: maintenant(),
      profil: { prenom: '', lycee: 'Lycée Bel-Orme, Bordeaux', classe: 'Tle STMG GF', effectif: null, boursier: null },
      coefs: { source: 'defaut', lus: '2026-10-26', tle: {}, premiere: {} },
      dates: { conseilT1: '2026-11-27', finNotesT1: null, conseilT2: null, finNotesT2: null, remonteeBulletins: null, ficheAvenir: null, rdvPP: null },
      periodes: { '1-T1': null, '1-T2': null, '1-T3': null, 'T-T1': null, 'T-T2': null, 'T-T3': null },
      anticipees: { frEcrit: null, frOral: null, maths: null, le: null },
      voeux: [], objectifT1: null, objectifT2: null,
      textes: {
        activites: { pro: texteVide(), citoyen: texteVide(), monde: texteVide(), sport: texteVide() },
        lettres: {}, albert: { lm: texteVide(), cv: texteVide() },
        citemoi: { depuis: '', pitch: '', heuresSemaine: null, prospects: null, devis: null, clients: null, outils: '', competences: [], liens: [] },
        faits: [], vuAvertissementPP: false
      },
      jalons: { perso: [], etat: {} },
      semaines: {}, synonymes: {}, ia: { lecturesBulletin: 0, relectures: 0 },
      hote: { fiches: [], le: null },
      vu: { onboarding: false, dernierEcran: 'tableau', presetsRetires: [] },
      resume: null
    };
  }
  function objet(x) { return (x && typeof x === 'object' && !Array.isArray(x)) ? x : null; }
  function fusion(base, src) {
    Object.keys(src || {}).forEach(function (k) {
      if (objet(base[k]) && objet(src[k])) fusion(base[k], src[k]);
      else if (src[k] !== undefined) base[k] = src[k];
    });
    return base;
  }
  function normaliser(d) {
    const s = fusion(defaut(), d);
    if (!objet(s.periodes)) s.periodes = defaut().periodes;
    C.PERIODES.forEach(function (k) { if (s.periodes[k] !== null && !objet(s.periodes[k])) s.periodes[k] = null; if (s.periodes[k] && !objet(s.periodes[k].lignes)) s.periodes[k].lignes = {}; });
    if (!Array.isArray(s.voeux)) s.voeux = [];
    if (!Array.isArray(s.textes.faits)) s.textes.faits = [];
    if (!Array.isArray(s.jalons.perso)) s.jalons.perso = [];
    if (!Array.isArray(s.hote.fiches)) s.hote.fiches = [];
    if (!Array.isArray(s.vu.presetsRetires)) s.vu.presetsRetires = [];
    ['pro', 'citoyen', 'monde', 'sport'].forEach(function (k) { if (!objet(s.textes.activites[k])) s.textes.activites[k] = texteVide(); });
    s.version = VERSION;
    return s;
  }
  function semerVoeux(s) {
    const presents = {}; s.voeux.forEach(function (v) { presents[v.preset || v.id] = true; });
    F.formations.forEach(function (f, i) {
      if (f.actifParDefaut === false || presents[f.id] || s.vu.presetsRetires.indexOf(f.id) !== -1) return;
      s.voeux.push({ id: f.id, preset: f.id, ordre: s.voeux.length + 1, statut: 'envisage', cible: f.cibleDefaut, cibleMention: f.mentionDefaut || null, lettreDemandee: !!f.lettreDemandee, notes: '', maj: maintenant() });
    });
    s.voeux.sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); }).forEach(function (v, i) { v.ordre = i + 1; });
  }

  let S = null, corrompu = false;
  function charger() {
    const brut = LS(K);
    let d = null;
    if (brut != null) {
      try { d = JSON.parse(brut); } catch (e) { d = null; }
      if (!objet(d)) { corrompu = true; try { if (LS(K_ABIME) == null) localStorage.setItem(K_ABIME, brut); } catch (e) { } d = null; }
    }
    S = normaliser(d || {});
    if (!d) semerVoeux(S); else if (!S.voeux.length && !S.vu.presetsRetires.length) semerVoeux(S);
    return S;
  }
  const ecouteurs = [];
  function surChangement(fn) { ecouteurs.push(fn); }
  let plein = false;
  function sauver() {
    if (!S) return false;
    S.maj = maintenant();
    try {
      localStorage.setItem(K, JSON.stringify(S));
      plein = false;
      ecouteurs.forEach(function (fn) { try { fn(); } catch (e) { } });
      return true;
    } catch (e) {
      plein = true;
      ecouteurs.forEach(function (fn) { try { fn(e); } catch (x) { } });
      return false;
    }
  }
  function effacer() {
    try { localStorage.removeItem(K); } catch (e) { }
    S = normaliser({}); semerVoeux(S);
    return sauver();
  }
  function exporter() { return { app: 'stmg-dossier', version: VERSION, exporteLe: maintenant(), donnees: JSON.parse(JSON.stringify(S)) }; }
  function valider(obj) {
    if (!objet(obj) || obj.app !== 'stmg-dossier') return 'Ce fichier n’est pas un dossier exporté par cette app.';
    if (typeof obj.version !== 'number' || obj.version > VERSION) return 'Ce fichier vient d’une version plus récente de l’app.';
    const d = obj.donnees;
    if (!objet(d) || !objet(d.periodes) || !Array.isArray(d.voeux)) return 'Le contenu du fichier est incomplet.';
    return '';
  }
  function importer(obj) {
    const err = valider(obj); if (err) return err;
    S = normaliser(JSON.parse(JSON.stringify(obj.donnees)));
    return sauver() ? '' : 'Mémoire du téléphone pleine : exporte ton dossier puis libère de la place';
  }

  /* ---- lecture seule de l'app STMG ---- */
  function cleIA() { return LS('stmg-cle-groq') || LS('mzs-cle-groq') || ''; }
  function echeances() { const e = lireJSON('stmg-echeances', null); return (e && Array.isArray(e.items)) ? e.items : []; }
  function dsHist() { const h = lireJSON('stmg-ds-hist', null); return Array.isArray(h) ? h : []; }
  function fichesDone() { const f = lireJSON('stmg-fiches-done', null); return Array.isArray(f) ? f : []; }
  function seances() { const s = lireJSON('stmg-seances', null); return Array.isArray(s) ? s : []; }
  function joursSeance14(auj) {
    const lim = new Date(auj || new Date()); lim.setDate(lim.getDate() - 14);
    const jours = {};
    seances().forEach(function (s) { const d = s && (s.fin || s.debut); if (!d) return; const t = new Date(d); if (isNaN(t) || t < lim) return; jours[C.iso(t)] = true; });
    return Object.keys(jours).length;
  }
  function dsMoyenne() {
    const notes = dsHist().filter(function (d) { return d && ['ds', 'blanc'].indexOf(d.format) !== -1 && typeof d.note20 === 'number'; }).map(function (d) { return d.note20; });
    return notes.length ? notes.reduce(function (a, b) { return a + b; }, 0) / notes.length : null;
  }
  function actionsCochees(auj) {
    const lim = new Date(auj || new Date()); lim.setDate(lim.getDate() - 28);
    let n = 0;
    Object.keys(S.semaines || {}).forEach(function (k) { (S.semaines[k].actions || []).forEach(function (a) { if (a.fait && new Date(a.fait) >= lim) n++; }); });
    return n;
  }
  function signaux(auj) {
    const fiches = S.hote.fiches, done = fichesDone();
    const pm = C.fichesParMatiere(fiches, done);
    const faib = {}; Object.keys(pm).forEach(function (m) { faib[m] = pm[m].faiblesseMoy; });
    return {
      fiches: fiches, fichesDone: done, fichesParMatiere: pm, faiblesses: faib,
      fichesTotal: fiches.length || null, fichesFaites: fiches.length ? fiches.filter(function (f) { return done.indexOf(f.id) !== -1; }).length : done.length,
      dsMoyenne: dsMoyenne(), dsHist: dsHist(), joursSeance: joursSeance14(auj), actionsCochees: actionsCochees(auj), echeances: echeances()
    };
  }
  function contexteHote(ctx) {
    if (!ctx || !Array.isArray(ctx.fiches)) return;
    S.hote.fiches = ctx.fiches.slice(0, 400).map(function (f) { return { id: String(f.id || '').slice(0, 40), sec: String(f.sec || '').slice(0, 20), num: String(f.num || '').slice(0, 12), titre: String(f.titre || '').slice(0, 70), faiblesse: typeof f.faiblesse === 'number' ? f.faiblesse : null, vu: f.vu || 0 }; });
    S.hote.le = maintenant();
    sauver();
  }

  /* ---- vœux et formations ---- */
  function formationDe(v) {
    if (!v) return null;
    const p = v.preset && F.parId[v.preset];
    const f = Object.assign({}, p || {}, { id: v.id });
    if (!p) { f.nom = v.nom || 'Vœu'; f.court = v.court || v.nom || 'Vœu'; f.type = v.type || 'ecole'; f.canal = v.canal || 'parcoursup'; f.concours = v.concours || null; f.grille = v.grille || null; f.faits = []; f.liens = {}; }
    f.lettreDemandee = !!v.lettreDemandee;
    f.cible = typeof v.cible === 'number' ? v.cible : null;
    f.cibleSecurite = typeof v.cibleSecurite === 'number' ? v.cibleSecurite : (p ? p.cibleSecurite : null);
    f.voeu = v;
    return f;
  }
  function voeuxTries() { return S.voeux.slice().sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); }); }
  function voeuParId(id) { return S.voeux.find(function (v) { return v.id === id; }) || null; }

  /* ---- jalons ---- */
  function jalons(auj) {
    const liste = window.DOSSIER_JALONS.map(function (j) {
      const o = Object.assign({}, j);
      let aConfirmer = !!j.extrapole;
      if (typeof j.date === 'string' && j.date.indexOf('dates.') === 0) {
        const k = j.date.slice(6), v = S.dates[k];
        if (v) { o.date = v; o.saisie = true; aConfirmer = false; } else { o.date = j.defaut; o.manque = !j.defaut; aConfirmer = true; }
        o.cleDate = k;
      }
      const e = S.jalons.etat[j.id] || {};
      o.fait = e.fait || null;
      o.aConfirmer = aConfirmer;
      o.taches = (j.taches || []).map(function (t) { return { id: t.id, t: t.t, fait: !!(e.taches && e.taches[t.id]) }; });
      o.jours = o.date ? C.joursAvant(o.date, auj) : null;
      return o;
    });
    S.jalons.perso.forEach(function (p) { liste.push({ id: p.id, date: p.date, titre: p.titre, change: p.change || '', perso: true, fait: p.fait || null, taches: [], jours: p.date ? C.joursAvant(p.date, auj) : null, aConfirmer: false, source: 'toi' }); });
    liste.sort(function (a, b) { if (!a.date) return 1; if (!b.date) return -1; return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    return liste;
  }
  function prochainJalon(auj) { return jalons(auj).find(function (j) { return j.date && !j.fait && j.jours != null && j.jours >= 0; }) || null; }

  /* ---- résumé pour la carte d'accueil de l'app STMG (lu sans charger cette app) ---- */
  function resume(r) { S.resume = r; }

  return { K: K, VERSION: VERSION, charger: charger, sauver: sauver, effacer: effacer, exporter: exporter, importer: importer, valider: valider, get S() { return S; }, get corrompu() { return corrompu; }, get plein() { return plein; },
    surChangement: surChangement, cleIA: cleIA, echeances: echeances, dsHist: dsHist, fichesDone: fichesDone, signaux: signaux, contexteHote: contexteHote,
    formationDe: formationDe, voeuxTries: voeuxTries, voeuParId: voeuParId, jalons: jalons, prochainJalon: prochainJalon, resume: resume, texteVide: texteVide, maintenant: maintenant };
})();
