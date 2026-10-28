(function () {
/* ===== Interprétation d'un bulletin scolaire (export Charlemagne/Excel) à partir des lignes positionnées de pdf-texte.js =====
   Entrée : {pages:[{fragments}]} ; sortie : une période au format du Mode Parcoursup (voir FAISABILITE_ECOLEDIRECTE.md §modèle).
   Robustesse : colonnes repérées par l'en-tête (Coef. / Elève / Classe / Notes / Appréciation), blocs rattachés au nom de
   discipline le plus proche verticalement (les appréciations débordent au-dessus et au-dessous du nom). */
'use strict';

const CODES = [
  [/^FRAN[CÇ]AIS/i, 'FRANC', 'Français'], [/MORAL.*CIVIQUE|^EMC$/i, 'EMC', 'Enseignement moral et civique'],
  [/^HISTOIRE/i, 'HGEO', 'Histoire-géographie'], [/^MATH/i, 'MATHS', 'Mathématiques'],
  [/^ANGLAIS/i, 'ANG', 'Anglais LVA + ETLV'], [/^ESPAGNOL/i, 'ESP', 'Espagnol LVB'], [/^ALLEMAND/i, 'ALL', 'Allemand LVB'], [/^ITALIEN/i, 'ITA', 'Italien LVB'],
  [/PHYSIQUE.*SPORT|^EPS$/i, 'EPS', 'EPS'], [/^DROIT/i, 'DRECO', 'Droit et économie'],
  [/^MANAGEMENT.*SCIENCES|^MSDGN/i, 'MSDGN', 'Management, sciences de gestion et numérique'],
  [/^SC\.? ?GESTION|^SCIENCES DE GESTION/i, 'SGN', 'Sciences de gestion et numérique'],
  [/^MANAGEMENT/i, 'MANAG', 'Management'], [/^GESTION.*FINANCE|^GEST.*FIN/i, 'GF', 'Gestion et finance'], [/^MERCATIQUE|^MARKETING/i, 'MERCA', 'Mercatique'],
  [/^RESSOURCES HUMAINES|^RHC/i, 'RHC', 'Ressources humaines et communication'], [/SYST.*INFORMATION|^SIG/i, 'SIG', 'Systèmes d\'information de gestion'],
  [/^PHILOSOPHIE/i, 'PHILO', 'Philosophie'], [/^ENGAGEMENT/i, 'ENGAG', 'Engagement lycéen'], [/^VIE DE CLASSE|^VIE SCOLAIRE/i, 'VIE', 'Vie de classe'],
];
function codeMatiere(libelle){
  const l = String(libelle || '').trim();
  for (const [re, code, nom] of CODES) if (re.test(l)) return {code, nom};
  return {code: l.toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 12) || 'AUTRE', nom: l};
}
const nombre = s => { const m = /^\s*(\d{1,2})(?:[,.](\d{1,2}))?\s*$/.exec(String(s)); return m ? parseFloat(m[1] + '.' + (m[2] || '0')) : null; };
const estMajuscule = t => /^[A-ZÀ-Ý0-9&.'’ \-+/()]+$/.test(t.trim()) && /[A-Z]/.test(t);
const estProf = t => /^(M\.|Mme|Mlle|M |Mr)\s/i.test(t.trim()) || /^(M\.|Mme)/.test(t.trim());

function pdfLignesLocal(page, tol){
  const f = page.fragments.slice().sort((a, b) => b.y - a.y || a.x - b.x); const lignes = [];
  for (const fr of f){ const l = lignes.length ? lignes[lignes.length - 1] : null; if (l && Math.abs(l.y - fr.y) <= tol) l.fragments.push(fr); else lignes.push({y: fr.y, fragments: [fr]}); }
  lignes.forEach(l => l.fragments.sort((a, b) => a.x - b.x)); return lignes;
}

function parserBulletin(doc){
  const avert = [];
  /* 1. toutes les lignes, pages concaténées (page 1 au-dessus de page 2 : on décale y) */
  let lignes = [], decal = 0;
  doc.pages.forEach(p => { const l = pdfLignesLocal(p, 2.5); const hMax = l.length ? l[0].y + 50 : 0; l.forEach(x => { x.y = x.y - decal; x.fragments.forEach(f => { f.yAbs = f.y; f.y = x.y; }); }); lignes.push(...l); decal += hMax + 100; });
  const texteDe = l => l.fragments.map(f => f.texte).join(' ').replace(/\s+/g, ' ').trim();

  /* 2. en-tête : colonnes */
  const ent = lignes.find(l => l.fragments.some(f => /^Coef/i.test(f.texte)) && l.fragments.some(f => /^El[eè]ve/i.test(f.texte)));
  if (!ent) return {ok: false, erreur: 'En-tête du tableau (Coef. / Elève / Classe / Notes) introuvable : ce PDF n\'est pas un bulletin reconnu.'};
  const xOf = re => { const f = ent.fragments.find(f => re.test(f.texte)); return f ? f.x : null; };
  const xCoef = xOf(/^Coef/i), xEleve = xOf(/^El[eè]ve/i), xClasse = xOf(/^Classe/i), xNotes = xOf(/^Notes/i);
  const apprLigne = lignes.find(l => l.fragments.some(f => /Appr[ée]ciation/i.test(f.texte)));
  const xAppr = (xNotes != null ? xNotes + 22 : (xClasse || 0) + 50);
  const col = x => x < (xCoef - 8) ? 'disc' : x < (xEleve - 2) ? 'coef' : x < (xClasse - 2) ? 'eleve' : x < (xNotes != null ? xNotes - 2 : xAppr) ? 'classe' : x < xAppr ? 'notes' : 'appr';

  /* 3. métadonnées */
  const tout = lignes.map(texteDe).join('\n');
  const meta = {};
  let m = /Classe\s*:\s*([^\n-]+?)\s*-\s*Bulletin du\s*(\d)\s*(?:er|ème|e|ème)?\s*(Trimestre|Semestre)/i.exec(tout);
  if (m){ meta.classe = m[1].trim(); meta.periodeNum = Number(m[2]); meta.periodeType = m[3].toLowerCase(); }
  m = /Ann[ée]e scolaire\s*:\s*(\d{4})\s*-\s*(\d{4})/i.exec(tout); if (m) meta.anneeScolaire = m[1] + '-' + m[2];
  m = /(1[EÈ]RE|PREMI[EÈ]RE|1RE)/i.exec(meta.classe || ''); if (m) meta.niveau = '1re';
  m = /(TLE|TERM|TERMINALE)/i.exec(meta.classe || ''); if (m) meta.niveau = 'Tle';
  m = /(2NDE|SECONDE)/i.exec(meta.classe || ''); if (m) meta.niveau = '2de';
  m = /N[ée]\(e\) le\s*:\s*([\d/]+)/i.exec(tout); if (m) meta.dateNaissance = m[1];
  m = /^([A-ZÀ-Ý' -]{3,})\s*$/m.exec(lignes.slice(0, 3).map(texteDe).join('\n')); if (m) meta.nomEleve = m[1].trim();
  m = /^(Lyc[ée]e.+?)(?:\s{2,}|\s+Ann[ée]e scolaire|$)/im.exec(tout); if (m) meta.etablissement = m[1].trim();

  /* 4. ancres = noms de disciplines (colonne disc, majuscules, hors en-tête et pied) */
  const exclus = /^(Discipline|Moyenne g[ée]n[ée]rale|Observations|Mention|Le Chef|Lyc[ée]e|RNE|\d|FIN BULLETIN)/i;
  const ancres = [];
  lignes.forEach((l, i) => {
    const f0 = l.fragments[0];
    if (!f0 || col(f0.x) !== 'disc') return;
    const t = f0.texte.trim();
    if (!estMajuscule(t) || exclus.test(t) || estProf(t)) return;
    if (meta.nomEleve && t === meta.nomEleve) return;
    if (/^\d/.test(t) || t.length < 3) return;
    const prev = ancres[ancres.length - 1];
    if (prev && Math.abs(prev.y - l.y) < 14){ prev.nom += ' ' + t; prev.y = (prev.y + l.y) / 2; return; }   // nom sur deux lignes
    ancres.push({nom: t, y: l.y, i});
  });
  /* la ligne « Moyenne générale » et le bloc d'observations ne sont pas des disciplines : on coupe la zone des ancres au pied */
  const yPied = (lignes.find(l => /^Moyenne g[ée]n[ée]rale/i.test(texteDe(l))) || {}).y;
  const disciplines = ancres.filter(a => yPied == null || a.y > yPied + 5).map(a => ({nom: a.nom, y: a.y, profs: [], coef: null, moyenne: null, moyenneClasse: null, nbNotes: null, nbNotesClasse: null, appr: []}));
  const plusProche = y => { let best = null, d = Infinity; for (const dsc of disciplines){ const dd = Math.abs(dsc.y - y); if (dd < d){ d = dd; best = dsc; } } return d <= 40 ? best : null; };

  /* 5. rattachement des autres fragments */
  for (const l of lignes){
    if (yPied != null && l.y <= yPied + 5) continue;
    const dsc = plusProche(l.y); if (!dsc) continue;
    for (const f of l.fragments){
      const c = col(f.x), t = f.texte.trim();
      if (c === 'disc'){
        if (estProf(t)) dsc.profs.push(...t.split(/\s+-\s+/).map(x => x.trim()).filter(Boolean));
        continue;
      }
      if (c === 'coef'){ const n = nombre(t); if (n != null) dsc.coef = n; continue; }
      if (c === 'eleve'){ const n = nombre(t); if (n != null) dsc.moyenne = n; continue; }
      if (c === 'classe'){ const n = nombre(t); if (n != null) dsc.moyenneClasse = n; continue; }
      if (c === 'notes'){ const mm = /^(\d+)\s*\/\s*(\d+)$/.exec(t); if (mm){ dsc.nbNotes = Number(mm[1]); dsc.nbNotesClasse = Number(mm[2]); } continue; }
      dsc.appr.push({y: l.y, t});
    }
  }

  /* 6. pied : moyenne générale, absences, observations, décision */
  const pied = {};
  const lMoy = lignes.find(l => /^Moyenne g[ée]n[ée]rale/i.test(texteDe(l)));
  if (lMoy){
    const nums = lMoy.fragments.filter(f => col(f.x) === 'eleve' || col(f.x) === 'classe').map(f => nombre(f.texte)).filter(n => n != null);
    pied.moyenneGenerale = nums[0] != null ? nums[0] : null; pied.moyenneClasse = nums[1] != null ? nums[1] : null;
    const abs = /Absences?\s*:\s*(\d+)\s*(?:cours|demi-journ[ée]es?|h)?\s*(?:\((\d+)\s*injustifi)?/i.exec(texteDe(lMoy));
    const ret = /Retards?\s*:\s*(\d+)/i.exec(texteDe(lMoy));
    pied.absences = {cours: abs ? Number(abs[1]) : null, injustifiees: abs && abs[2] != null ? Number(abs[2]) : (abs ? 0 : null), retards: ret ? Number(ret[1]) : null};
  }
  const iObs = lignes.findIndex(l => /^Observations du conseil/i.test(texteDe(l)));
  if (iObs >= 0){
    const obs = [];
    for (let k = iObs + 1; k < lignes.length; k++){
      const gauche = lignes[k].fragments.filter(f => col(f.x) === 'disc' || f.x < xCoef + 60).map(f => f.texte.trim()).join(' ');
      if (!gauche || /^(Mention|Le Chef|Admis|Redoublement|R[ée]orientation)/i.test(gauche)) continue;
      obs.push(gauche);
    }
    pied.observationConseil = obs.join(' ').replace(/\s+/g, ' ').trim();
    const mm = /(F[ée]licitations|Compliments|Encouragements|Avertissement(?: de travail| de conduite)?)/i.exec(pied.observationConseil);
    pied.mentionConseil = mm ? mm[1].charAt(0).toUpperCase() + mm[1].slice(1).toLowerCase() : '';
  }
  if (/Admis\(e\) en classe sup/i.test(tout)) pied.decision = 'Admis en classe supérieure';

  /* 7. sortie */
  const periodeCode = meta.periodeType === 'semestre' ? (meta.periodeNum === 1 ? 'S001' : 'S002') : ('A00' + (meta.periodeNum || 1));
  const out = {
    ok: true, source: 'pdf', meta,
    periode: {
      code: periodeCode, libelle: meta.periodeNum ? (meta.periodeNum + (meta.periodeNum === 1 ? 'er ' : 'e ') + (meta.periodeType === 'semestre' ? 'semestre' : 'trimestre')) : '',
      anneeScolaire: meta.anneeScolaire || '', niveau: meta.niveau || '', classe: meta.classe || '',
      moyenneGenerale: pied.moyenneGenerale != null ? pied.moyenneGenerale : null, moyenneClasse: pied.moyenneClasse != null ? pied.moyenneClasse : null,
      absences: pied.absences || null, observationConseil: pied.observationConseil || '', mentionConseil: pied.mentionConseil || '', decision: pied.decision || '',
      disciplines: disciplines.map(d => { const cm = codeMatiere(d.nom); return {
        codeMatiere: cm.code, libelle: cm.nom, libelleOriginal: d.nom, coef: d.coef, moyenne: d.moyenne, moyenneClasse: d.moyenneClasse,
        nbNotes: d.nbNotes, nbNotesClasse: d.nbNotesClasse, professeurs: d.profs,
        appreciations: [d.appr.sort((a, b) => b.y - a.y).map(a => a.t).join(' ').replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').replace(/\s*([!?:;])/g, ' $1').trim()].filter(Boolean) }; }),
    },
    avertissements: avert,
  };
  /* contrôles de cohérence */
  const avecCoef = out.periode.disciplines.filter(d => d.coef && d.moyenne != null);
  if (avecCoef.length){
    const sc = avecCoef.reduce((s, d) => s + d.coef, 0), sp = avecCoef.reduce((s, d) => s + d.coef * d.moyenne, 0);
    out.periode.moyenneRecalculee = Math.round(sp / sc * 100) / 100;
    if (out.periode.moyenneGenerale != null && Math.abs(out.periode.moyenneRecalculee - out.periode.moyenneGenerale) > 0.15)
      avert.push('La moyenne générale lue (' + out.periode.moyenneGenerale + ') ne correspond pas à la moyenne recalculée (' + out.periode.moyenneRecalculee + ') : vérifie les coefficients et les moyennes.');
  }
  out.periode.disciplines.forEach(d => { if (d.coef && d.moyenne == null) avert.push('Pas de moyenne lue pour ' + d.libelle + '.'); });
  return out;
}

if (typeof module !== 'undefined' && module.exports) module.exports = {parserBulletin: parserBulletin, codeMatiere: codeMatiere};
if (typeof window !== 'undefined') window.DOSSIER_BULLETIN = {parserBulletin: parserBulletin, codeMatiere: codeMatiere};
})();
