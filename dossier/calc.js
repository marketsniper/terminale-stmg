/* ===== Mon dossier Parcoursup · calculs =====
   Fonctions pures : aucun accès au DOM ni à localStorage. Testables sous Node (module.exports) et dans le
   navigateur (window.DOSSIER_CALC). Conventions : calculs en flottant, arrondi à l'affichage seulement ;
   une matière sans note est exclue du dénominateur ; toute note est bornée à [0, 20]. */
(function (racine) {
  'use strict';

  /* ---------- 1. Matières et coefficients ----------
     Coefficients RÉELS du bulletin de Terminale STMG GF (relevé EcoleDirecte du 26/10/2026, total 52) et du
     bulletin de 1re STMG (PDF du T3 2025-2026, total 45). Ils restent modifiables par l'élève (Réglages) et
     sont remplacés par ceux lus dans un import (PDF, photo) quand ils existent. */
  const TABLE_TLE = { 'droit-eco': 16, management: 12, gf: 4, philo: 4, hg: 3, maths: 3, anglais: 3, espagnol: 3, eps: 3, emc: 1 };
  const TABLE_1RE = { francais: 5, 'droit-eco': 8, management: 8, sdgn: 8, hg: 3, maths: 3, anglais: 3, espagnol: 3, eps: 3, emc: 1 };
  const ORDRE_TLE = ['droit-eco', 'management', 'gf', 'philo', 'hg', 'maths', 'anglais', 'espagnol', 'eps', 'emc', 'engagement'];
  const ORDRE_1RE = ['francais', 'droit-eco', 'management', 'sdgn', 'hg', 'maths', 'anglais', 'espagnol', 'eps', 'emc', 'engagement'];
  const MATIERES = {
    'droit-eco': { nom: 'Droit et économie', court: 'Droit-éco', couleur: '#8C3A5E', sections: ['droit', 'eco', 'droit1', 'eco1'], tle: 'droit-eco' },
    management:  { nom: 'Management, sciences de gestion et numérique', court: 'MSDGN', nom1re: 'Management', court1re: 'Management', couleur: '#3454D1', sections: ['management', 'mgmt', 'mgmt1'], tle: 'management' },
    gf:          { nom: 'Gestion et finance', court: 'GF', couleur: '#0E8A6D', sections: ['gf', 'sdgn'], tle: 'gf' },
    sdgn:        { nom: 'Sciences de gestion et numérique', court: 'SGN', couleur: '#0E8A6D', sections: ['sdgn'], tle: 'gf' },
    philo:       { nom: 'Philosophie', court: 'Philo', couleur: '#6C4FC2', sections: ['philo'], tle: 'philo' },
    hg:          { nom: 'Histoire-géographie', court: 'HG', couleur: '#2C7FA8', sections: ['hg'], tle: 'hg' },
    maths:       { nom: 'Mathématiques', court: 'Maths', couleur: '#C2447A', sections: ['maths'], tle: 'maths' },
    anglais:     { nom: 'Anglais LVA + ETLV', court: 'Anglais', couleur: '#B23A32', sections: ['anglais'], tle: 'anglais' },
    espagnol:    { nom: 'Espagnol LVB', court: 'Espagnol', couleur: '#B08C1E', sections: ['espagnol'], tle: 'espagnol' },
    eps:         { nom: 'EPS', court: 'EPS', couleur: '#4A5568', sections: [], tle: 'eps' },
    emc:         { nom: 'Enseignement moral et civique', court: 'EMC', couleur: '#5B7C99', sections: ['emc'], tle: 'emc' },
    francais:    { nom: 'Français', court: 'Français', couleur: '#B23A32', sections: [], tle: null },
    engagement:  { nom: 'Engagement lycéen', court: 'Engagement', couleur: '#4A5568', sections: [], tle: 'engagement', sansCoef: true }
  };
  /* Sur le bulletin de Terminale STMG GF, MSDGN (12) et Gestion et finance (4) sont deux sous-matières d'UNE ligne
     « MSDGN Gestion et finance » au coefficient 16, dont la moyenne est celle des sous-matières notées (ÉcoleDirecte :
     15,54 le 26/10/2026 avec la seule sous-matière MSDGN notée). Les coefficients effectifs reproduisent ce calcul. */
  const GROUPES = { Tle: [{ id: 'msdgn-gf', nom: 'MSDGN Gestion et finance', membres: ['management', 'gf'] }], '1re': [] };
  const PERIODES = ['1-T1', '1-T2', '1-T3', 'T-T1', 'T-T2', 'T-T3'];
  const LIBELLES = { '1-T1': '1re T1', '1-T2': '1re T2', '1-T3': '1re T3', 'T-T1': 'Tle T1', 'T-T2': 'Tle T2', 'T-T3': 'Tle T3' };
  const TRANSMISES = ['1-T1', '1-T2', '1-T3', 'T-T1', 'T-T2'];

  function niveau(code) { return code.charAt(0) === '1' ? '1re' : 'Tle'; }
  function tableDe(code, coefs) {
    const c = coefs || {};
    return niveau(code) === '1re' ? Object.assign({}, TABLE_1RE, c.premiere || {}) : Object.assign({}, TABLE_TLE, c.tle || {});
  }
  function ordreDe(code) { return niveau(code) === '1re' ? ORDRE_1RE : ORDRE_TLE; }
  /* nom selon le niveau : la ligne `management` s'appelle « Management » sur le bulletin de Première */
  function nomDe(id, ligne, code) { const m = MATIERES[id]; return (ligne && ligne.nom) || (m && code && niveau(code) === '1re' && m.nom1re) || (m && m.nom) || id; }
  function courtDe(id, ligne, code) { const m = MATIERES[id]; return (ligne && ligne.court) || (ligne && ligne.nom) || (m && code && niveau(code) === '1re' && m.court1re) || (m && m.court) || id; }
  function couleurDe(id) { return (MATIERES[id] && MATIERES[id].couleur) || '#4A5568'; }
  function coefDe(ligne, id, table) {
    if (ligne && typeof ligne.coef === 'number' && isFinite(ligne.coef)) return Math.max(0, ligne.coef);
    if (MATIERES[id] && MATIERES[id].sansCoef) return 0;
    const t = table || {};
    return typeof t[id] === 'number' ? t[id] : 0;
  }
  function note(x) { return (typeof x === 'number' && isFinite(x)) ? Math.max(0, Math.min(20, x)) : null; }
  function lignesDe(periode) { return (periode && periode.lignes && typeof periode.lignes === 'object') ? periode.lignes : {}; }
  /* Coefficients effectifs d'une période : pour chaque ligne notée (champ `champ`, « moy » par défaut) de coefficient > 0,
     son poids dans la moyenne pondérée. Hors groupe, c'est le coefficient. Dans un groupe (MSDGN Gestion et finance),
     le coefficient du groupe est réparti entre les seules sous-matières notées, au prorata de leurs coefficients.
     Une seule convention partout : moyennes, levier, priorités, chemin, simulateur, vue jury. */
  function poids(code, lignes, coefs, champ) {
    const table = tableDe(code, coefs), L = lignes || {}, k = champ || 'moy';
    const nominal = {}, eff = {}; let total = 0;
    idsOrdonnes(code, L).forEach(function (id) { const c = coefDe(L[id], id, table); nominal[id] = c; total += c; });
    const dansGroupe = {};
    (GROUPES[niveau(code)] || []).forEach(function (g) {
      const membres = g.membres.filter(function (id) { return nominal[id] > 0; });
      membres.forEach(function (id) { dansGroupe[id] = true; });
      const notes = membres.filter(function (id) { return note(L[id] && L[id][k]) != null; });
      if (!notes.length) return;
      const cg = membres.reduce(function (s, id) { return s + nominal[id]; }, 0), cn = notes.reduce(function (s, id) { return s + nominal[id]; }, 0);
      notes.forEach(function (id) { eff[id] = nominal[id] * cg / cn; });
    });
    Object.keys(nominal).forEach(function (id) { if (!dansGroupe[id] && nominal[id] > 0 && note(L[id] && L[id][k]) != null) eff[id] = nominal[id]; });
    let somme = 0; Object.keys(eff).forEach(function (id) { somme += eff[id]; });
    return { eff: eff, nominal: nominal, total: total, somme: somme };
  }
  function groupeDe(id, code) { return (GROUPES[niveau(code)] || []).find(function (g) { return g.membres.indexOf(id) !== -1; }) || null; }
  /* « MSDGN Gestion et finance » lu comme une seule ligne (PDF, photo) */
  function estLigneGroupe(libelle) { const t = sansAccent(libelle); return /(msdgn|management)/.test(t) && /gestion.*finance/.test(t); }
  function idsOrdonnes(code, lignes) {
    const base = ordreDe(code).slice();
    Object.keys(lignes || {}).forEach(function (id) { if (base.indexOf(id) === -1) base.push(id); });
    return base;
  }

  /* ---------- 2. Nombres à la française ---------- */
  function fmt(n, dec) {
    if (n == null || !isFinite(n)) return '-';
    const d = dec == null ? 1 : dec;
    const s = Math.abs(n).toFixed(d).replace('.', ',');
    return (n < 0 && Number(Math.abs(n).toFixed(d)) !== 0 ? '−' : '') + s;
  }
  function fmtDelta(n, dec) {
    if (n == null || !isFinite(n)) return '-';
    const d = dec == null ? 1 : dec;
    const v = Number(n.toFixed(d));
    if (v === 0) return '0' + (d ? ',' + '0'.repeat(d) : '');
    return (v > 0 ? '+' : '−') + Math.abs(v).toFixed(d).replace('.', ',');
  }
  function fmtEntier(n) { return n == null ? '-' : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); }
  function fmtPct(x) { return fmtEntier(Math.round(x * 100)) + '\u00a0%'; }
  const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const JOURS_C = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  function dateDe(iso) {
    if (iso instanceof Date) return new Date(iso.getFullYear(), iso.getMonth(), iso.getDate(), 12);
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null;
  }
  function iso(d) { d = dateDe(d); return d ? d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') : ''; }
  function fmtDate(isoD, style) {
    const d = dateDe(isoD); if (!d) return 'à confirmer';
    if (style === 'court') return JOURS_C[d.getDay()] + ' ' + d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS_C[d.getMonth()] + ' ' + d.getFullYear();
    if (style === 'jm') return d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()];
    if (style === 'num') return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    return JOURS[d.getDay()] + ' ' + d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function joursAvant(isoD, aujourdhui) {
    const a = dateDe(isoD), b = dateDe(aujourdhui || new Date());
    if (!a || !b) return null;
    return Math.round((a - b) / 86400000);   // midi à midi : 23 ou 25 h au changement d'heure, d'où l'arrondi
  }
  function semaineISO(d) {
    d = dateDe(d || new Date()); if (!d) return '';
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const jour = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - jour);
    const an = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const n = Math.ceil(((t - an) / 86400000 + 1) / 7);
    return t.getUTCFullYear() + '-W' + String(n).padStart(2, '0');
  }
  function lundiDe(d) { d = dateDe(d || new Date()); const j = (d.getDay() + 6) % 7; d.setDate(d.getDate() - j); return d; }

  /* ---------- 3. Moyennes d'une période ---------- */
  function moyennes(periode, code, coefs) {
    const lignes = lignesDe(periode);
    const pm = poids(code, lignes, coefs, 'moy'), pc = poids(code, lignes, coefs, 'classe');
    let sp = 0, spc = 0, ss = 0, n = 0, ssc = 0, nc = 0;
    const total = pm.total, sc = pm.somme, scc = pc.somme;
    idsOrdonnes(code, lignes).forEach(function (id) {
      const l = lignes[id] || null;
      const m = l ? note(l.moy) : null, k = l ? note(l.classe) : null;
      if (m != null) { ss += m; n++; if (pm.eff[id]) sp += pm.eff[id] * m; }
      if (k != null) { ssc += k; nc++; if (pc.eff[id]) spc += pc.eff[id] * k; }
    });
    const mp = sc ? sp / sc : null, mpc = scc ? spc / scc : null;
    return {
      mp: mp, ms: n ? ss / n : null, mpClasse: mpc, msClasse: nc ? ssc / nc : null,
      sommeCoef: sc, sommeCoefTotal: total, sommeCoefClasse: scc, nb: n, nbClasse: nc,
      ecart: (mp != null && mpc != null) ? mp - mpc : null, complet: Math.abs(sc - total) < 1e-9 && total > 0, coefs: pm.eff
    };
  }
  function position(ligne) {
    const m = note(ligne && ligne.moy), k = note(ligne && ligne.classe), mn = note(ligne && ligne.min), mx = note(ligne && ligne.max);
    const e = (m != null && k != null) ? m - k : null;
    let ton = 'neutre';
    if (e != null) ton = e >= 1 ? 'vert' : e < -3 ? 'rouge' : e < -1 ? 'orange' : 'neutre';
    const pos = (m != null && mn != null && mx != null && mx > mn) ? Math.max(0, Math.min(1, (m - mn) / (mx - mn))) : null;
    return { ecart: e, ton: ton, pos: pos };
  }
  function nbLignes(periode) { const l = lignesDe(periode); return Object.keys(l).filter(function (id) { return note(l[id] && l[id].moy) != null; }).length; }

  /* ---------- 4. Vue jury, trajectoire ---------- */
  function projection(t1, objectifT2) {
    const o = objectifT2 || {}, out = {};
    Object.keys(t1 || {}).forEach(function (id) {
      const m = note(t1[id] && t1[id].moy); if (m == null) return;
      out[id] = (typeof o[id] === 'number') ? note(o[id]) : m;
    });
    return out;
  }
  function vueJury(periodes, coefs, objectifT2) {
    const P = periodes || {}, table = tableDe('T-T1', coefs);
    const t1 = lignesDe(P['T-T1']), t2 = lignesDe(P['T-T2']);
    const proj = projection(t1, objectifT2);
    const lignes = {}; let projete = false, nbT1 = 0, nbT2 = 0;
    ORDRE_TLE.concat(Object.keys(t1), Object.keys(t2)).filter(function (id, i, a) { return a.indexOf(id) === i; }).forEach(function (id) {
      const a = note(t1[id] && t1[id].moy), b = note(t2[id] && t2[id].moy);
      const c = coefDe(t2[id] || t1[id], id, table);
      let moy = null, p = false;
      if (a != null && b != null) moy = (a + b) / 2;
      else if (a != null) { moy = (a + (proj[id] != null ? proj[id] : a)) / 2; p = true; }
      else if (b != null) moy = b;
      if (a != null) nbT1++; if (b != null) nbT2++;
      /* moyennes de Première par matière (toutes périodes saisies) */
      let s1 = 0, n1 = 0;
      ['1-T1', '1-T2', '1-T3'].forEach(function (k) {
        const l = lignesDe(P[k]);
        Object.keys(l).forEach(function (j) {
          if ((MATIERES[j] && MATIERES[j].tle) !== id && j !== id) return;
          const v = note(l[j].moy); if (v != null) { s1 += v; n1++; }
        });
      });
      const m1 = n1 ? s1 / n1 : null;
      const tend = (a != null && m1 != null) ? a - m1 : null;
      lignes[id] = { t1: a, t2: b, proj: p ? proj[id] : null, moy: moy, projete: p, coef: c, m1re: m1, tendance: tend,
        fleche: tend == null ? '' : tend >= 0.3 ? '▲' : tend <= -0.3 ? '▼' : '=' };
    });
    /* moyenne de Terminale vue par les écoles : mêmes coefficients effectifs que le bulletin */
    const pseudo = {}; Object.keys(lignes).forEach(function (id) { if (lignes[id].moy != null) pseudo[id] = { moy: lignes[id].moy, coef: (t2[id] || t1[id] || {}).coef }; });
    const pj = poids('T-T1', pseudo, coefs, 'moy');
    let sp = 0; Object.keys(pj.eff).forEach(function (id) { sp += pj.eff[id] * pseudo[id].moy; if (lignes[id].projete) projete = true; });
    const sc = pj.somme;
    const dessus = Object.keys(lignes).filter(function (id) { return lignes[id].tendance != null && lignes[id].tendance > 0; }).length;
    const compares = Object.keys(lignes).filter(function (id) { return lignes[id].tendance != null; }).length;
    return { lignes: lignes, mJury: sc ? sp / sc : null, projete: projete, nbT1: nbT1, nbT2: nbT2, sommeCoef: sc, dessus: dessus, compares: compares };
  }
  function trajectoire(periodes, coefs, objectifT2) {
    const P = periodes || {}, serie = [];
    ['1-T1', '1-T2', '1-T3', 'T-T1'].forEach(function (code) {
      const m = moyennes(P[code], code, coefs);
      serie.push({ code: code, libelle: LIBELLES[code], mp: m.mp, saisie: m.mp != null, projete: false, partiel: m.mp != null && !m.complet });
    });
    const m2 = moyennes(P['T-T2'], 'T-T2', coefs);
    if (m2.mp != null) serie.push({ code: 'T-T2', libelle: LIBELLES['T-T2'], mp: m2.mp, saisie: true, projete: false, partiel: !m2.complet });
    else {
      const t1 = lignesDe(P['T-T1']);
      if (Object.keys(t1).length) {
        const proj = projection(t1, objectifT2), pseudo = {};
        Object.keys(proj).forEach(function (id) { pseudo[id] = { moy: proj[id], coef: t1[id] && t1[id].coef }; });
        const mp2 = moyennes({ lignes: pseudo }, 'T-T2', coefs).mp;
        serie.push({ code: 'T-T2', libelle: LIBELLES['T-T2'], mp: mp2, saisie: false, projete: true, partiel: false });
      } else serie.push({ code: 'T-T2', libelle: LIBELLES['T-T2'], mp: null, saisie: false, projete: false, partiel: false });
    }
    const saisis = serie.filter(function (p) { return p.saisie; });
    let dynamique = null, delta = null, record = false;
    if (saisis.length >= 2) {
      delta = saisis[saisis.length - 1].mp - saisis[0].mp;
      dynamique = delta >= 0.3 ? 'hausse' : delta <= -0.3 ? 'baisse' : 'stable';
      record = saisis.every(function (p) { return p.mp <= saisis[saisis.length - 1].mp; });
    }
    return { serie: serie, saisis: saisis.length, dynamique: dynamique, delta: delta, record: record };
  }
  /* Moyenne de référence pour les écarts : vue jury dès qu'une période de Terminale est clôturée, sinon le T1 en cours,
     sinon la dernière période de Première saisie. */
  function reference(periodes, coefs, objectifT2) {
    const P = periodes || {};
    const tleClose = ['T-T1', 'T-T2'].some(function (k) { return P[k] && P[k].cloture && nbLignes(P[k]); });
    if (tleClose) { const vj = vueJury(P, coefs, objectifT2); if (vj.mJury != null) return { valeur: vj.mJury, base: 'jury', code: 'T-T2', libelle: vj.projete ? 'sur ta Terminale (T2 projeté)' : 'sur ta Terminale (T1 + T2)' }; }
    for (const k of ['T-T2', 'T-T1']) { const m = moyennes(P[k], k, coefs); if (m.mp != null) return { valeur: m.mp, base: 'encours', code: k, libelle: 'sur ton ' + LIBELLES[k].slice(4) + ' en cours' }; }
    for (const k of ['1-T3', '1-T2', '1-T1']) { const m = moyennes(P[k], k, coefs); if (m.mp != null) return { valeur: m.mp, base: 'premiere', code: k, libelle: 'sur ta Première (' + LIBELLES[k] + ')' }; }
    return { valeur: null, base: null, code: null, libelle: '' };
  }

  /* ---------- 5. Estimation depuis les DS blancs ---------- */
  function estimation(dsHist, matiere) {
    const secs = (MATIERES[matiere] && MATIERES[matiere].sections) || [];
    const ds = (Array.isArray(dsHist) ? dsHist : []).filter(function (d) {
      return d && secs.indexOf(d.sec) !== -1 && ['ds', 'blanc', 'court'].indexOf(d.format) !== -1;
    }).map(function (d) {
      let n = note(d.note20);
      if (n == null && typeof d.note === 'number' && d.format === 'court') n = note(d.note * 2);
      return { date: d.date || '', n: n };
    }).filter(function (d) { return d.n != null; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }).slice(-3);
    if (!ds.length) return null;
    const v = ds.map(function (d) { return d.n; }).sort(function (a, b) { return a - b; });
    const med = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
    return { valeur: Math.round(med * 2) / 2, nb: ds.length };
  }

  /* ---------- 6. Écarts, feux, mentions, leviers ---------- */
  function ecart(cible, m) { return (typeof cible === 'number' && m != null) ? cible - m : null; }
  function feu(E) { if (E == null) return 'gris'; return E <= 0 ? 'vert' : E <= 1.5 ? 'orange' : 'rouge'; }
  function zoneMention(mp) { if (mp == null) return ''; return mp >= 16 ? 'zone très bien' : mp >= 14 ? 'zone bien' : mp >= 12 ? 'zone assez bien' : 'sous 12'; }
  /* Convention unique (spécification § 6.8) : +δ dans la matière i = coef_i × δ / Σcoef, avec les coefficients effectifs des
     seules matières notées de la période (celles qui composent la moyenne affichée). */
  function levier(code, coefs, lignes) {
    const p = poids(code, lignes || {}, coefs, 'moy'), out = {};
    Object.keys(p.eff).forEach(function (id) { out[id] = p.eff[id] / p.somme; });
    return { parPoint: out, sommeCoef: p.somme, coefs: p.eff };
  }

  /* ---------- 7. Priorités, chemin le plus court, T2 requis ---------- */
  function priorites(periode, code, coefs, voeu, signaux, dsAvantCloture) {
    const lignes = lignesDe(periode), S = signaux || {};
    const regardees = (voeu && voeu.matieresRegardees) || [];
    const dsPar = dsAvantCloture || {};
    const pw = poids(code, lignes, coefs, 'moy'), somme = pw.somme; const items = [];
    idsOrdonnes(code, lignes).forEach(function (id) {
      const l = lignes[id], c = pw.eff[id] || 0, m = note(l && l.moy);
      if (c <= 0 || m == null) return;
      const mx = note(l && l.max);
      const marge = Math.min(3, Math.max(0, (mx != null ? mx : 17) - m));
      const faib = (S.faiblesses && typeof S.faiblesses[id] === 'number') ? S.faiblesses[id] : 0.5;
      const cle = regardees.indexOf(id) !== -1 ? 1.25 : 1;
      const urg = dsPar[id] ? 1.25 : 1;
      const P = (c / somme) * marge * (1 + 0.5 * faib) * cle * urg;
      items.push({ id: id, P: P, coef: c, moy: m, max: mx, marge: marge, faiblesse: faib, cle: cle, urgence: urg, ds: dsPar[id] || null, levier: c / somme });
    });
    items.sort(function (a, b) { return b.P - a.P; });
    return { items: items, sommeCoef: somme };
  }
  /* Phrase « +X en matière = +Y » pour un écart E (points de moyenne à rattraper) */
  function gainPour(item, E, sommeCoef) {
    let X = E != null && E > 0 ? Math.ceil(E * sommeCoef / item.coef * 2) / 2 : 1;
    X = Math.max(0.5, Math.min(item.marge > 0 ? Math.max(0.5, Math.ceil(item.marge * 2) / 2) : 0.5, X));
    return { X: X, Y: item.coef * X / sommeCoef };
  }
  function chemin(periode, code, coefs, cible, prios) {
    const m = moyennes(periode, code, coefs);
    if (m.mp == null || typeof cible !== 'number') return null;
    let manque = Math.max(0, cible - m.mp) * m.sommeCoef;
    const alloc = {}; const pr = prios || priorites(periode, code, coefs, null, null, null);
    const items = pr.items.map(function (i) { return Object.assign({}, i, { reste: Math.min(2, i.marge) }); });
    let tour = true;
    while (manque > 1e-9 && tour) {
      tour = false;
      for (const i of items) {
        if (manque <= 1e-9) break;
        if (i.reste >= 0.5) { alloc[i.id] = (alloc[i.id] || 0) + 0.5; i.reste -= 0.5; manque -= i.coef * 0.5; tour = true; }
      }
    }
    const liste = Object.keys(alloc).map(function (id) { return { id: id, delta: alloc[id] }; }).sort(function (a, b) { return b.delta - a.delta; });
    let sp = 0; liste.forEach(function (x) { const it = items.find(function (i) { return i.id === x.id; }); sp += it.coef * x.delta; });
    return { liste: liste, atteint: manque <= 1e-9, manque: Math.max(0, manque), pointsPonderes: Math.max(0, cible - m.mp) * m.sommeCoef, resultat: m.mp + sp / m.sommeCoef, mp: m.mp, cible: cible };
  }
  function t2Requis(periodeT1, coefs, cible, prios) {
    const m = moyennes(periodeT1, 'T-T1', coefs);
    if (m.mp == null || typeof cible !== 'number') return null;
    const T2 = 2 * cible - m.mp;
    const pr = prios || priorites(periodeT1, 'T-T1', coefs, null, null, null);
    const sommeP = pr.items.reduce(function (s, i) { return s + i.P; }, 0);
    const restant = (T2 - m.mp) * m.sommeCoef;
    const lignes = pr.items.map(function (i) {
      const part = sommeP > 0 ? i.P / sommeP : 1 / pr.items.length;
      let v = i.moy + (restant * part) / i.coef;
      v = Math.max(i.moy, Math.max(0, Math.min(20, Math.round(v * 2) / 2)));   // jamais de baisse conseillée
      const plafond = Math.max(i.moy + 2, i.max != null ? i.max : 0);
      return { id: i.id, t1: i.moy, t2: v, realiste: v <= plafond + 1e-9, coef: i.coef };
    });
    const impossible = T2 > 20 || (lignes.length > 0 && lignes.every(function (l) { return !l.realiste; }));
    return { t2: T2, mpT1: m.mp, lignes: lignes, impossible: impossible, atteinte: T2 <= m.mp + 1e-9, pointsPonderes: Math.max(0, restant) };
  }

  /* ---------- 8. Jauges de préparation d'un vœu ---------- */
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function preparation(formation, dossier, signaux, E) {
    const S = signaux || {}, D = dossier || {}, T = D.textes || {};
    const grille = formation && formation.grille;
    const resultats = E == null ? 0 : clamp(1 - Math.max(0, E) / 3, 0, 1);
    const regardees = (formation && formation.matieresRegardees) || ORDRE_TLE.filter(function (id) { return TABLE_TLE[id]; });
    let tot = 0, ok = 0;
    regardees.forEach(function (id) { const f = S.fichesParMatiere && S.fichesParMatiere[id]; if (f) { tot += f.total; ok += f.faites; } });
    const partFiches = tot ? ok / tot : (S.fichesTotal ? (S.fichesFaites || 0) / S.fichesTotal : 0);
    const dsMoy = S.dsMoyenne != null ? Math.min(1, S.dsMoyenne / 20 * 1.25) : 0;
    const jours = Math.min(1, (S.joursSeance || 0) / 8);
    const methode = 0.5 * partFiches + 0.3 * dsMoy + 0.2 * jours;
    let nbApp = 0, nbPos = 0;
    Object.keys(D.periodes || {}).forEach(function (k) {
      const l = lignesDe(D.periodes[k]);
      Object.keys(l).forEach(function (id) {
        const x = l[id]; if (!x || !x.app || !String(x.app).trim()) return;
        nbApp++;
        if (x.avis === 'positive') nbPos++;
        else if (!x.avis) { const mc = motsCles(x.app); if (mc.positifs.length > mc.negatifs.length) nbPos++; }
      });
    });
    const savoirEtre = nbApp ? nbPos / nbApp : 0.6;
    let motivation = 1;
    if (formation && formation.lettreDemandee) {
      const lt = T.lettres && T.lettres[formation.id] && T.lettres[formation.id].txt || '';
      const n = compteur(lt, 1500).caracteres;
      motivation = n >= 600 ? Math.min(1, n / 1200) : n > 0 ? 0.5 : 0;
    }
    const act = T.activites || {};
    const rubriques = ['pro', 'citoyen', 'monde', 'sport'].filter(function (k) { return act[k] && act[k].txt && act[k].txt.trim(); }).length;
    const cm = T.citemoi || {};
    const citemoiOk = ['heuresSemaine', 'prospects', 'devis', 'clients'].some(function (k) { return typeof cm[k] === 'number'; }) ? 1 : 0;
    const coch = Math.min(1, (S.actionsCochees || 0) / 6);
    const engagement = 0.5 * (rubriques / 4) + 0.25 * citemoiOk + 0.25 * coch;
    const piliers = { resultats: resultats, methode: methode, savoirEtre: savoirEtre, motivation: motivation, engagement: engagement };
    let indice = null;
    if (grille) { indice = 0; Object.keys(piliers).forEach(function (k) { indice += (grille[k] || 0) / 100 * piliers[k]; }); }
    return { piliers: piliers, indice: indice, details: { partFiches: partFiches, fichesOk: ok, fichesTot: tot, dsMoyenne: S.dsMoyenne, joursSeance: S.joursSeance || 0, nbApp: nbApp, nbPos: nbPos, rubriques: rubriques, citemoiOk: !!citemoiOk, cochees: S.actionsCochees || 0 } };
  }

  /* ---------- 9. Textes ---------- */
  function compteur(txt, max) {
    const t = String(txt || '').normalize('NFC').replace(/\r\n?/g, '\n');
    const c = Array.from(t).length;
    const mots = t.trim() ? t.trim().split(/\s+/).length : 0;
    const M = max || 1500;
    return { caracteres: c, mots: mots, max: M, etat: c > M ? 'rouge' : c >= M - 100 ? 'orange' : 'neutre', reste: M - c };
  }
  function compteurMots(txt, min, max) {
    const c = compteur(txt, 1e9);
    return { mots: c.mots, caracteres: c.caracteres, etat: (c.mots > 0 && (c.mots < min || c.mots > max)) ? 'orange' : 'neutre' };
  }
  const POSITIFS = ['serieux', 'serieuse', 'regulier', 'reguliere', 'investi', 'investie', 'investissement', 'autonome', 'participe', 'participation', 'rigoureux', 'rigoureuse', 'motive', 'motivee', 'motivation', 'excellent', 'excellente', 'tres bon', 'tres bonne', 'solide', 'solides', 'progresse', 'progres', 'efforts', 'curieux', 'curieuse', 'volontaire', 'bravo', 'felicitations', 'satisfaisant', 'satisfaisante', 'implique', 'impliquee', 'pertinent', 'pertinente', 'actif', 'active'];
  const NEGATIFS = ['bavard', 'bavarde', 'insuffisant', 'insuffisante', 'insuffisants', 'passif', 'passive', 'irregulier', 'irreguliere', 'fragile', 'fragiles', 'manque', 'doit', 'doivent', 'trop', 'absences', 'absence', 'disperse', 'dispersee', 'superficiel', 'superficielle', 'attention', 'canaliser'];
  function sansAccent(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  /* Mots positifs et négatifs d'une appréciation, sans IA. Les mots sont rendus tels qu'écrits (accents compris).
     « pas », « peu », « jamais »… dans les trois mots qui précèdent inversent le sens ; « manque de sérieux » est
     rendu comme une seule expression négative. */
  function motsCles(app) {
    const orig = String(app || '').toLowerCase().replace(/[’']/g, ' ').split(/[^a-z0-9à-ÿœæç]+/).filter(Boolean);
    const mots = orig.map(sansAccent);
    const positifs = [], negatifs = [];
    const estPos = function (i) { const deux = mots[i] + ' ' + (mots[i + 1] || ''); return POSITIFS.indexOf(deux) !== -1 ? 2 : POSITIFS.indexOf(mots[i]) !== -1 ? 1 : 0; };
    const manqueDe = function (i) { return i >= 2 && /^manqu/.test(mots[i - 2]) && (mots[i - 1] === 'de' || mots[i - 1] === 'd'); };
    const negation = function (i) { for (let k = i - 1; k >= Math.max(0, i - 3); k--) if (['pas', 'peu', 'jamais', 'sans', 'ni', 'aucun', 'aucune'].indexOf(mots[k]) !== -1) return k; return -1; };
    const ajoute = function (liste, t) { if (liste.indexOf(t) === -1) liste.push(t); };
    for (let i = 0; i < mots.length; i++) {
      const lp = estPos(i);
      if (lp) {
        const t = orig.slice(i, i + lp).join(' ');
        if (manqueDe(i)) ajoute(negatifs, orig.slice(i - 2, i + lp).join(' '));
        else if (negation(i) >= 0) ajoute(negatifs, orig.slice(negation(i), i + lp).join(' '));
        else ajoute(positifs, t);
        i += lp - 1; continue;
      }
      if (NEGATIFS.indexOf(mots[i]) !== -1) {
        if (/^manqu/.test(mots[i]) && (mots[i + 1] === 'de' || mots[i + 1] === 'd') && estPos(i + 2)) continue;   // traité avec le mot suivant
        if (negation(i) >= 0) ajoute(positifs, orig.slice(negation(i), i + 1).join(' ')); else ajoute(negatifs, orig[i]);
      }
    }
    return { positifs: positifs, negatifs: negatifs };
  }

  /* ---------- 10. Progrès entre deux périodes ---------- */
  function progres(periode, code, precedente, codePrec, coefs, serieMp) {
    if (nbLignes(periode) < 4 || nbLignes(precedente) < 4) return null;
    const a = moyennes(periode, code, coefs), b = moyennes(precedente, codePrec, coefs);
    if (a.mp == null || b.mp == null) return null;
    const dessus = function (p) { const l = lignesDe(p); return Object.keys(l).filter(function (id) { const x = l[id]; return note(x.moy) != null && note(x.classe) != null && x.moy > x.classe; }).length; };
    const d1 = dessus(periode), d0 = dessus(precedente);
    const record = (serieMp || []).every(function (v) { return v == null || v <= a.mp + 1e-9; });
    return { delta: a.mp - b.mp, dessus: d1, variation: d1 - d0, record: record, comparables: true };
  }

  /* ---------- 11. Échéances de l'app ---------- */
  function matiereDeChapitre(chap) {
    const s = String(chap || '').split('-')[0];
    for (const id in MATIERES) if (MATIERES[id].sections.indexOf(s) !== -1) return id;
    return null;
  }
  function evaluationsAvant(items, dateLimite, aujourdhui) {
    const lim = dateDe(dateLimite), auj = dateDe(aujourdhui || new Date());
    const out = [];
    (Array.isArray(items) ? items : []).forEach(function (it) {
      if (!it || it.done || ['ds', 'controle', 'devoir_note'].indexOf(it.kind) === -1) return;
      const d = dateDe(it.due); if (!d) return;
      if (auj && d < auj) return;
      if (lim && d > lim) return;
      const chap = Array.isArray(it.chapitre) && it.chapitre.length ? it.chapitre[0] : '';
      out.push({ id: it.id, titre: it.title || it.titre || 'Évaluation', due: iso(d), time: it.time || '', matiere: matiereDeChapitre(chap) || matiereDeLibelle(it.matiere), chapitre: chap, kind: it.kind });
    });
    out.sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : 0; });
    return out;
  }
  function matiereDeLibelle(l) {
    const t = sansAccent(l);
    if (!t) return null;
    if (/droit|econom/.test(t)) return 'droit-eco';
    if (/management|msdgn/.test(t)) return 'management';
    if (/gestion.*finance|gest.*fin|^gf$/.test(t)) return 'gf';
    if (/philo/.test(t)) return 'philo';
    if (/histoire|geo/.test(t)) return 'hg';
    if (/math/.test(t)) return 'maths';
    if (/anglais|etlv|lva/.test(t)) return 'anglais';
    if (/espagnol|lvb/.test(t)) return 'espagnol';
    if (/emc|moral|civique/.test(t)) return 'emc';
    if (/eps|sport/.test(t)) return 'eps';
    if (/francais/.test(t)) return 'francais';
    if (/sciences de gestion|sdgn|sgn/.test(t)) return 'sdgn';
    return null;
  }
  function dsParMatiere(evals) { const o = {}; evals.forEach(function (e) { if (e.matiere && !o[e.matiere]) o[e.matiere] = e; }); return o; }

  /* ---------- 12. Fiches ---------- */
  function ficheFaible(matiere, fiches, fichesDone) {
    const secs = (MATIERES[matiere] && MATIERES[matiere].sections) || [];
    const done = Array.isArray(fichesDone) ? fichesDone : [];
    const cand = (Array.isArray(fiches) ? fiches : []).filter(function (f) { return f && secs.indexOf(f.sec) !== -1 && done.indexOf(f.id) === -1; });
    if (!cand.length) return secs.length ? { id: secs[0], section: true } : null;
    const vus = cand.filter(function (f) { return (f.vu || 0) >= 3 && typeof f.faiblesse === 'number'; }).sort(function (a, b) { return b.faiblesse - a.faiblesse; });
    return vus[0] || cand[0];
  }
  function fichesParMatiere(fiches, fichesDone) {
    const done = Array.isArray(fichesDone) ? fichesDone : [], out = {};
    const doneSet = {}; done.forEach(function (id) { doneSet[id] = true; });
    (Array.isArray(fiches) ? fiches : []).forEach(function (f) {
      const m = matiereDeChapitre(f.sec || f.id); if (!m) return;
      const o = out[m] || (out[m] = { total: 0, faites: 0, faiblesse: 0, nFaib: 0 });
      o.total++; if (doneSet[f.id]) o.faites++;
      if (typeof f.faiblesse === 'number' && (f.vu || 0) >= 1) { o.faiblesse += f.faiblesse; o.nFaib++; }
    });
    Object.keys(out).forEach(function (m) { const o = out[m]; o.faiblesseMoy = o.nFaib ? o.faiblesse / o.nFaib : 0.5; });
    return out;
  }

  /* ---------- 13. Jauge « dossier complété » ---------- */
  function completion(dossier, aujourdhui, formations) {
    const D = dossier || {}, P = D.periodes || {}, auj = dateDe(aujourdhui || new Date());
    const dues = ['1-T1', '1-T2', '1-T3'];
    const passe = function (d) { const x = dateDe(d); return x && auj && x <= auj; };
    if (passe(D.dates && D.dates.conseilT1)) dues.push('T-T1');
    if (passe(D.dates && D.dates.conseilT2)) dues.push('T-T2');
    const faites = dues.filter(function (k) { return P[k] && nbLignes(P[k]) >= 4; }).length;
    const act = (D.textes && D.textes.activites) || {};
    const rub = ['pro', 'citoyen', 'monde', 'sport'].filter(function (k) { return act[k] && act[k].txt && act[k].txt.trim(); }).length;
    const F = formations || {};
    const voeux = (D.voeux || []).filter(function (v) { const f = F[v.preset]; return !(f && f.canal === 'direct') && !(v.canal === 'direct'); });
    const avecCible = voeux.filter(function (v) { return typeof v.cible === 'number'; }).length;
    const direct = function (v) { const f = F[v.preset]; return (f && f.canal === 'direct') || v.canal === 'direct'; };
    const lettres = (D.voeux || []).filter(function (v) { return v.lettreDemandee; });
    /* lettre Parcoursup : au moins 1 000 caractères ; lettre d'une candidature directe (Albert) : textes.albert.lm, au moins 300 mots */
    const lettresOk = lettres.filter(function (v) {
      if (direct(v)) { const t = D.textes && D.textes.albert && D.textes.albert.lm; return !!(t && compteur(t.txt, 1e9).mots >= 300); }
      const t = D.textes && D.textes.lettres && D.textes.lettres[v.id]; return !!(t && compteur(t.txt, 1500).caracteres >= 1000);
    }).length;
    const dates = ['conseilT1', 'finNotesT1', 'conseilT2', 'finNotesT2'].filter(function (k) { return D.dates && D.dates[k]; }).length;
    const rien = !PERIODES.some(function (k) { return nbLignes(P[k]) > 0; });
    /* dossier vide : la jauge reste à 0 (spécification § 4.1, état 1) ; les vœux préremplis et la date fournie par l'app ne comptent pas encore */
    const pct = rien ? 0 : (dues.length ? faites / dues.length : 0) * 40 + (rub / 4) * 20 + (voeux.length ? avecCible / voeux.length : 0) * 15 + (lettres.length ? lettresOk / lettres.length : 1) * 15 + (dates / 4) * 10;
    return { pct: Math.round(pct), periodes: faites, periodesDues: dues.length, rubriques: rub, voeuxCible: avecCible, voeux: voeux.length, lettres: lettresOk, lettresDemandees: lettres.length, dates: dates };
  }

  /* ---------- 14. Coach hebdomadaire ---------- */
  function articleDe(id) {
    const m = MATIERES[id]; if (!m) return id;
    if (id === 'maths') return 'les maths';
    const c = /^[A-Z]{2,}$/.test(m.court) ? m.court : m.court.toLowerCase();
    return (/^[aeiouhé]/i.test(c) ? 'l’' : 'le ') + c;
  }
  function hashTexte(s) { let h = 2166136261; const t = String(s); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }
  function coach(ctx) {
    const D = ctx.dossier || {}, P = D.periodes || {}, auj = dateDe(ctx.aujourdhui || new Date());
    const actions = [];
    const periodes = PERIODES.filter(function (k) { return nbLignes(P[k]) > 0; });
    if (!periodes.length) {
      actions.push({ id: 'saisie-1re', txt: 'Saisis tes bulletins de Première : deux minutes, ou photographie-les.', lien: '#bulletins/1-T3', action: 'Saisir' });
      return actions;
    }
    const dates = D.dates || {};
    if (!dates.conseilT2 && auj && auj >= dateDe('2026-12-01')) actions.push({ id: 'date-conseilT2', txt: 'Demande la date du conseil de classe du T2 et saisis-la : un compte à rebours faux est pire que rien.', lien: '#reglages', action: 'Saisir' });
    else if (!dates.finNotesT1 && dates.conseilT1 && auj && auj < dateDe(dates.conseilT1)) actions.push({ id: 'date-finNotesT1', txt: 'Demande la date de fin des notes du T1 et saisis-la : tu sauras combien d’évaluations comptent encore.', lien: '#reglages', action: 'Saisir' });
    const pr = ctx.prios;
    if (pr && pr.items.length) {
      const i = pr.items[0], g = gainPour(i, ctx.E, pr.sommeCoef);
      const ds = ctx.dsParMatiere && ctx.dsParMatiere[i.id];
      /* même convention que le simulateur : coefficient effectif / somme des coefficients des matières notées */
      const nomM = MATIERES[i.id] ? articleDe(i.id) : i.id;
      let txt = 'Remonte ' + nomM + ' : +1 point = ' + fmtDelta(i.coef / pr.sommeCoef, 2) + ' sur ta moyenne';
      txt += ds ? ', DS le ' + fmtDate(ds.due, 'jm') + '.' : '.';
      actions.push({ id: 'ds-' + i.id, txt: txt, lien: ctx.lienReviser ? ctx.lienReviser(i.id) : '', action: 'Réviser', matiere: i.id });
    }
    const T = D.textes || {}, act = T.activites || {};
    const vide = function (k) { return !(act[k] && act[k].txt && act[k].txt.trim()); };
    const cibleTexte = dates.conseilT2 || dates.conseilT1;
    const rubriques = [['pro', 'Expérience professionnelle'], ['citoyen', 'Engagement citoyen'], ['monde', 'Ouverture au monde'], ['sport', 'Sport et culture']];
    const r = rubriques.find(function (x) { return vide(x[0]); });
    /* lettres Parcoursup demandées ; la lettre et le CV d'Albert School sont facultatifs selon sa FAQ : jamais prioritaires */
    const lettreVide = (D.voeux || []).find(function (v) { return v.lettreDemandee && v.preset !== 'albert' && v.canal !== 'direct' && !(T.lettres && T.lettres[v.id] && T.lettres[v.id].txt && T.lettres[v.id].txt.trim()); });
    if (r) actions.push({ id: 'texte-' + r[0], txt: 'Rédige la rubrique ' + r[1] + (r[0] === 'pro' ? ' (Citemoi)' : '') + (cibleTexte ? ' avant le ' + fmtDate(cibleTexte, 'jm') + '.' : '.'), lien: '#histoire/activites/' + r[0], action: 'Écrire' });
    else if (lettreVide) actions.push({ id: 'texte-lettre-' + lettreVide.id, txt: 'Rédige la lettre de motivation pour ' + (ctx.nomVoeu ? ctx.nomVoeu(lettreVide) : lettreVide.id) + ' avant le 1er avril.', lien: '#histoire/lettres/' + lettreVide.id, action: 'Écrire' });
    if (actions.length < 3 && pr && pr.items.length && ctx.fiches) {
      const i = pr.items[0], secs = (MATIERES[i.id] && MATIERES[i.id].sections) || [];
      const done = ctx.fichesDone || [];
      const cand = ctx.fiches.filter(function (f) { return secs.indexOf(f.sec) !== -1 && done.indexOf(f.id) === -1; })
        .sort(function (a, b) { return (b.faiblesse || 0) - (a.faiblesse || 0); }).slice(0, 2);
      cand.forEach(function (f) { if (actions.length < 3) actions.push({ id: 'fiche-' + f.id, txt: 'Révise la fiche ' + (f.num ? f.num + ' ' : '') + '« ' + f.titre + ' », pas encore maîtrisée : une séance de 20 minutes.', lien: '#' + f.id, action: 'Ouvrir', hote: true }); });
    }
    if (actions.length < 3 && ctx.jalons) {
      ctx.jalons.forEach(function (j) {
        if (actions.length >= 3 || !j.date) return;
        const n = joursAvant(j.date, auj);
        if (n == null || n < 0 || n > 14 || !j.taches || !j.taches.length) return;
        const reste = j.taches.filter(function (t) { return !t.fait; });
        if (reste.length) actions.push({ id: 'jalon-' + j.id, txt: 'Prépare « ' + j.titre + ' » dans ' + n + ' jour' + (n > 1 ? 's' : '') + ' : ' + reste.length + ' point' + (reste.length > 1 ? 's' : '') + ' à relire.', lien: '#calendrier/' + j.id, action: 'Voir' });
      });
    }
    return actions.slice(0, 3);
  }

  /* ---------- 15. Lecture d'un bulletin (PDF, photo) : mappage des libellés ---------- */
  function mapperLibelle(libelle, niv, synonymes) {
    const t = sansAccent(libelle).replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!t) return null;
    const S = synonymes || {};
    if (S[t]) return S[t];
    if (/vie de classe|vie scolaire/.test(t)) return 'ignore';
    if (/engagement/.test(t)) return 'engagement';
    if (/philo/.test(t)) return 'philo';
    if (/moral|civique|^emc$|\bemc\b/.test(t)) return 'emc';
    if (/histoire|geograph|\bhg\b/.test(t)) return 'hg';
    if (/math/.test(t)) return 'maths';
    if (/anglais|etlv|\blva\b/.test(t)) return 'anglais';
    if (/espagnol|\blvb\b/.test(t)) return 'espagnol';
    if (/\beps\b|sportive|physique/.test(t)) return 'eps';
    if (/francais/.test(t)) return 'francais';
    if (/droit/.test(t)) return 'droit-eco';
    if (/economie/.test(t)) return 'droit-eco';
    if (/management|msdgn/.test(t)) return 'management';
    if (/gestion.*finance|gest.*fin|\bgf\b/.test(t)) return 'gf';
    if (/sciences de gestion|\bsdgn\b|\bsgn\b/.test(t)) return niv === '1re' ? 'sdgn' : 'management';
    return null;
  }
  function validerLecture(json, niv, synonymes, effectifConnu) {
    const out = { periode: null, lignes: [], erreurs: [] };
    const J = (json && typeof json === 'object') ? json : {};
    /* « T1 », « 1er trimestre », « 2026-2027 T1 » : jamais le chiffre d'une année */
    const p = String(J.periode || '').toUpperCase().replace(/\d{4}(\s*-\s*\d{4})?/g, ' ').replace(/\s/g, '');
    const mp = /(?:^|[^0-9A-Z])T([123])(?![0-9])/.exec(' ' + p) || /(?:^|[^0-9])([123])(?:ER|E|EME|ÈME)?TRIM/.exec(p) || /TRIM\D{0,6}([123])(?![0-9])/.exec(p) || /^([123])$/.exec(p);
    if (mp) out.periode = (niv === '1re' ? '1-' : 'T-') + 'T' + mp[1];
    /* nombre lu : virgule ou point, « /20 » toléré ; « 12,5 (?) » = chiffre douteux, gardé mais signalé */
    const douteux = function (v) { return typeof v === 'string' && /\(\s*\?\s*\)/.test(v); };
    const num = function (v) {
      if (v == null || v === '') return null;
      if (typeof v === 'number') return isFinite(v) ? v : null;
      const m = /^\s*(\d{1,2})(?:[,.](\d{1,2}))?\s*(?:\/\s*20)?\s*(?:\(\s*\?\s*\))?\s*$/.exec(String(v));
      return m ? parseFloat(m[1] + '.' + (m[2] || '0')) : NaN;
    };
    const lignes = Array.isArray(J.lignes) ? J.lignes : Array.isArray(J.matieres) ? J.matieres : [];
    lignes.forEach(function (l) {
      if (!l || typeof l !== 'object') return;
      const lib = l.matiere || l.nom || l.libelle || '';
      const id = mapperLibelle(lib, niv, synonymes);
      if (id === 'ignore') return;
      const L = { libelle: String(lib), id: id, problemes: [] };
      [['moy', l.moy != null ? l.moy : l.moyenne != null ? l.moyenne : l.moyenne_eleve], ['classe', l.classe != null ? l.classe : l.moyenne_classe], ['min', l.min != null ? l.min : l.moyenne_min], ['max', l.max != null ? l.max : l.moyenne_max]].forEach(function (c) {
        const v = num(c[1]);
        const nomC = { moy: 'moyenne', classe: 'moyenne de classe', min: 'min', max: 'max' }[c[0]];
        if (v == null) L[c[0]] = null;
        else if (isNaN(v)) { L[c[0]] = null; L.problemes.push(nomC + ' illisible'); }
        else if (v < 0 || v > 20) { L[c[0]] = null; L.problemes.push(nomC + ' hors de 0 à 20'); }
        else { L[c[0]] = v; if (douteux(c[1])) L.problemes.push(nomC + ' douteuse, à vérifier'); }
      });
      let rang = null, eff = null;
      const rs = String(l.rang != null ? l.rang : '');
      const mr = /^\s*(\d{1,3})\s*(?:\/\s*(\d{1,3}))?\s*$/.exec(rs);
      if (mr) { rang = +mr[1]; if (mr[2]) eff = +mr[2]; }
      const e2 = num(l.effectif); if (e2 && !isNaN(e2)) eff = e2;
      if (eff == null && effectifConnu) eff = effectifConnu;
      if (rang != null && eff != null && rang > eff) { L.problemes.push('rang supérieur à l’effectif'); rang = null; }
      L.rang = rang; L.effectif = eff;
      const coef = num(l.coef); L.coef = (coef != null && !isNaN(coef) && coef >= 0 && coef <= 30) ? coef : null;
      L.app = String(l.appreciation || l.app || '').trim().slice(0, 600);
      if (!id) L.problemes.push('matière non reconnue');
      L.groupe = niv !== '1re' && estLigneGroupe(lib);
      L.ok = L.problemes.length === 0;
      out.lignes.push(L);
    });
    if (!out.lignes.length) out.erreurs.push('Aucune ligne de matière lue.');
    return out;
  }

  /* ---------- 16. Bac : points déjà acquis (repères, pas une prédiction) ----------
     Épreuves anticipées de la session 2027 (mémento DGESCO 2025) : français écrit 5, oral 5, maths anticipée 2 ; total bac 100 coefficients. */
  function bacAcquis(anticipees) {
    const A = anticipees || {};
    const items = [['frEcrit', 5], ['frOral', 5], ['maths', 2]];
    let pts = 0, coefs = 0;
    items.forEach(function (x) { const v = note(A[x[0]]); if (v != null) { pts += v * x[1]; coefs += x[1]; } });
    if (!coefs) return null;
    const reste = 100 - coefs;
    const seuil = function (m) { return (m * 100 - pts) / reste; };
    return { points: pts, coefs: coefs, reste: reste, seuils: { passable: seuil(10), ab: seuil(12), b: seuil(14), tb: seuil(16) } };
  }

  /* ---------- 17. Divers ---------- */
  function sommeGrille(g) { return ['resultats', 'methode', 'savoirEtre', 'motivation', 'engagement'].reduce(function (s, k) { return s + (Number(g && g[k]) || 0); }, 0); }
  function brouillonCitemoi(c) {
    const C = c || {}; const ph = [];
    const num = function (k) { return typeof C[k] === 'number' && C[k] > 0; };
    if (C.depuis) {
      let d = String(C.depuis); const m = /^(\d{4})-(\d{2})$/.exec(d); if (m) d = MOIS[+m[2] - 1] + ' ' + m[1];
      ph.push('Depuis ' + d + ', je développe Citemoi' + (C.pitch ? ', ' + String(C.pitch).trim().replace(/\.$/, '') : '') + '.');
    } else if (C.pitch) ph.push('Je développe Citemoi, ' + String(C.pitch).trim().replace(/\.$/, '') + '.');
    if (num('heuresSemaine')) ph.push('J’y consacre environ ' + C.heuresSemaine + ' heure' + (C.heuresSemaine > 1 ? 's' : '') + ' par semaine.');
    const faits = [];
    if (num('prospects')) faits.push('contacté ' + C.prospects + ' entreprises locales');
    if (num('devis')) faits.push('envoyé ' + C.devis + ' devis');
    if (num('clients')) faits.push('signé ' + C.clients + ' client' + (C.clients > 1 ? 's' : ''));
    if (faits.length) ph.push('J’ai ' + (faits.length > 1 ? faits.slice(0, -1).join(', ') + ' et ' + faits[faits.length - 1] : faits[0]) + '.');
    if (C.outils && String(C.outils).trim()) ph.push('J’utilise ' + String(C.outils).trim().replace(/\.$/, '') + '.');
    const comp = Array.isArray(C.competences) ? C.competences.filter(Boolean) : [];
    if (comp.length) ph.push('J’ai appris à ' + (comp.length > 1 ? comp.slice(0, -1).join(', ') + ' et ' + comp[comp.length - 1] : comp[0]) + '.');
    const liens = Array.isArray(C.liens) ? C.liens.filter(Boolean) : [];
    if (liens.length) ph.push('Ce projet rejoint mes cours de ' + (liens.length > 1 ? liens.slice(0, -1).join(', ') + ' et ' + liens[liens.length - 1] : liens[0]) + '.');
    if (!ph.length) return '';
    return ph.join(' ') + '\n\nCe que j’en retire : ';
  }

  const API = {
    TABLE_TLE: TABLE_TLE, TABLE_1RE: TABLE_1RE, ORDRE_TLE: ORDRE_TLE, ORDRE_1RE: ORDRE_1RE, MATIERES: MATIERES, PERIODES: PERIODES, LIBELLES: LIBELLES, TRANSMISES: TRANSMISES,
    niveau: niveau, tableDe: tableDe, ordreDe: ordreDe, nomDe: nomDe, courtDe: courtDe, couleurDe: couleurDe, coefDe: coefDe, note: note, idsOrdonnes: idsOrdonnes, lignesDe: lignesDe, nbLignes: nbLignes,
    fmt: fmt, fmtDelta: fmtDelta, fmtEntier: fmtEntier, fmtPct: fmtPct, fmtDate: fmtDate, dateDe: dateDe, iso: iso, joursAvant: joursAvant, semaineISO: semaineISO, lundiDe: lundiDe, MOIS: MOIS, MOIS_C: MOIS_C,
    moyennes: moyennes, position: position, projection: projection, vueJury: vueJury, trajectoire: trajectoire, reference: reference, estimation: estimation,
    ecart: ecart, feu: feu, zoneMention: zoneMention, levier: levier, priorites: priorites, gainPour: gainPour, chemin: chemin, t2Requis: t2Requis, preparation: preparation,
    compteur: compteur, compteurMots: compteurMots, motsCles: motsCles, sansAccent: sansAccent, progres: progres,
    matiereDeChapitre: matiereDeChapitre, matiereDeLibelle: matiereDeLibelle, evaluationsAvant: evaluationsAvant, dsParMatiere: dsParMatiere, ficheFaible: ficheFaible, fichesParMatiere: fichesParMatiere,
    completion: completion, coach: coach, poids: poids, groupeDe: groupeDe, estLigneGroupe: estLigneGroupe, GROUPES: GROUPES, articleDe: articleDe, hashTexte: hashTexte, mapperLibelle: mapperLibelle, validerLecture: validerLecture, bacAcquis: bacAcquis, sommeGrille: sommeGrille, brouillonCitemoi: brouillonCitemoi
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  racine.DOSSIER_CALC = API;
})(typeof window !== 'undefined' ? window : globalThis);
