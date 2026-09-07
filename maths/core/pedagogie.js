/* ===== Maths · De zéro au sommet : pédagogie =====
   Règle des 90 %, révisions espacées, altitude, camps, jalons, objectif du jour, série et bivouacs,
   calcul mental, typologie des erreurs, succès et messages du coach.
   Script classique : portée globale partagée avec les autres modules.
   Symboles supplémentaires (hors table de propriété) : préfixe _ped, avec un alias sur window. */
'use strict';

/* ---------- réponses : normalisation ---------- */
/* Met une réponse sous forme comparable : sans espaces, en minuscules, virgule en point. */
function normStr(s){ return String(s).trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
/* Convertit une saisie en nombre, en acceptant les fractions « 3/4 ». */
function parseVal(s){
  s = normStr(s);
  const fr = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fr) { const d = parseFloat(fr[2]); return d === 0 ? NaN : parseFloat(fr[1]) / d; }
  const n = parseFloat(s);
  return /^-?\d+(\.\d+)?$/.test(s) ? n : NaN;
}
/* Une réponse est juste si elle correspond au texte attendu ou à sa valeur numérique. */
function isRight(input, ex){
  const cands = [ex.a].concat(ex.accept || []);
  const ni = normStr(input);
  if (cands.some(c => normStr(c) === ni)) return true;
  const vi = parseVal(input);
  if (!isNaN(vi)) return cands.some(c => { const v = parseVal(c); return !isNaN(v) && Math.abs(v - vi) < 1e-9; });
  return false;
}

/* ---------- camps et mètres ---------- */
/* Altitude cumulée atteinte à la fin de chaque phase (PRODUCT-SPEC §8.2). */
const CAMPS = [0, 800, 1600, 2400, 3200, 3900, 4300, 4810];
/* Nom du camp atteint en fin de phase p. */
const _pedCampNoms = ['Camp de base', 'Camp 1', 'Camp 2', 'Camp 3', 'Camp 4', 'Camp 5', 'Camp 6', 'Sommet'];

/* Camp courant pour une altitude donnée, et distance jusqu'au suivant. */
function campDe(alt){
  alt = Math.max(0, alt || 0);
  let i = 0;
  for (let p = 1; p < CAMPS.length; p++) if (alt >= CAMPS[p]) i = p;
  const suivant = i + 1 < CAMPS.length ? CAMPS[i + 1] : null;
  return {
    index: i, nom: _pedCampNoms[i], alt: CAMPS[i],
    suivant: suivant, suivantNom: suivant === null ? null : _pedCampNoms[i + 1],
    restant: suivant === null ? 0 : suivant - Math.round(alt)
  };
}

/* Nombre de compétences d'une phase. */
function _pedNbPhase(p){ return SKILLS.filter(s => s.phase === p).length; }
/* Mètres que vaut une compétence : la tranche de sa phase divisée par le nombre de compétences. */
function _pedMSkill(id){
  const sk = SKILLS.find(x => x.id === id);
  if (!sk) return 0;
  const n = _pedNbPhase(sk.phase);
  return n ? (CAMPS[sk.phase] - CAMPS[sk.phase - 1]) / n : 0;
}
/* Mètres acquis sur une compétence : 2 m par bonne réponse jusqu'à la moitié, le reste au verrouillage. */
function _pedMetres(id){
  const s = st(id), m = _pedMSkill(id);
  if (s.mastered || s.provisoire) return m;
  return Math.min(2 * (s.ok || 0), Math.floor(m / 2));
}
window.mSkill = _pedMSkill;
window.metres = _pedMetres;

/* ---------- maîtrise, verrous, révisions ---------- */
const _pedSeuils = {last: 10, ok: 9, min: 12};
/* Mètres gagnés par la toute dernière réponse enregistrée (pour le « +2 m » flottant). */
let _pedDernierGain = 0;
window.metresGagnes = () => _pedDernierGain;

/* Enregistre une réponse sur une compétence. Retourne 'mastered' au moment du verrouillage. */
function record(id, ok){
  const s = st(id);
  const avant = _pedMetres(id);
  s.hist.push(ok ? 1 : 0); if (s.hist.length > 20) s.hist.shift();
  s.n++; if (ok) s.ok++;
  let verrou = null;
  const last = s.hist.slice(-_pedSeuils.last);
  if (!s.mastered && s.n >= _pedSeuils.min && last.length >= _pedSeuils.last && last.reduce((a, b) => a + b, 0) >= _pedSeuils.ok){
    s.mastered = true; s.masteredAt = Date.now(); s.provisoire = false;
    s.interval = 2; s.due = Date.now() + 2 * JOUR; s.fragile = false;
    verrou = 'mastered';
  }
  if (s.fragile && !verrou){ const l3 = s.hist.slice(-3); if (l3.length === 3 && l3.every(x => x)) s.fragile = false; }
  _pedDernierGain = Math.max(0, _pedMetres(id) - avant);
  if (_pedDernierGain) gagnerAltitude(_pedDernierGain, verrou ? 'verrou' : 'reponse');
  save();
  return verrou;
}
/* Taux de réussite sur les 10 dernières réponses, ou null si la compétence est neuve. */
function tauxRecent(id){ const h = st(id).hist.slice(-_pedSeuils.last); return h.length ? h.reduce((a, b) => a + b, 0) / h.length : null; }
/* Une phase est ouverte quand toutes les compétences de la précédente sont acquises. */
function phaseUnlocked(p){ if (p === 1) return true; const prev = SKILLS.filter(s => s.phase === p - 1); return prev.length > 0 && prev.every(s => st(s.id).mastered); }
/* Prochaine compétence à travailler : la première non acquise d'une phase ouverte. */
function frontier(){ return SKILLS.find(s => !st(s.id).mastered && phaseUnlocked(s.phase)) || null; }
/* Compétences à réviser aujourd'hui : les fragiles d'abord, puis le plus grand retard. */
function dueReviews(){
  const now = Date.now();
  return SKILLS.filter(s => { const x = st(s.id); return x.mastered && (x.fragile || (x.due && x.due <= now)); })
    .sort((a, b) => { const A = st(a.id), B = st(b.id); return (B.fragile ? 1 : 0) - (A.fragile ? 1 : 0) || (A.due || 0) - (B.due || 0); });
}
/* Résultat d'un rappel : espacement doublé si 70 % de réussite, sinon la compétence redevient fragile.
   opts.mode vaut 'reprise' (retour après absence) ou 'retard' (rappel très en retard). */
function reviewResult(id, okCount, total, opts){
  const s = st(id), now = Date.now(), mode = (opts && opts.mode) || '';
  const taux = total ? okCount / total : 0;
  if (mode === 'reprise'){
    if (taux >= 1){ s.due = now + (s.interval || 2) * JOUR; }
    else if (taux > 0){ s.due = now + 2 * JOUR; }
    else { s.fragile = true; s.interval = 2; s.revOk = 0; s.due = now + 2 * JOUR; }
  } else if (mode === 'retard' && taux >= .7){
    s.due = now + (s.interval || 2) * JOUR; s.fragile = false;
  } else if (taux >= .7){
    s.interval = Math.min((s.interval || 2) * 2, 60);
    s.revOk = (s.revOk || 0) + 1;
    s.due = now + s.interval * JOUR; s.fragile = false;
  } else {
    s.fragile = true; s.interval = 2; s.revOk = 0; s.due = now + 2 * JOUR;
    if (s.provisoire){ s.provisoire = false; s.mastered = false; }   // seule perte d'altitude possible
  }
  s.rev = s.rev || [];
  s.rev.push({ts: now, ok: okCount, n: total, int: s.interval || 2});
  if (s.rev.length > 12) s.rev = s.rev.slice(-12);
  save();
  return s;
}
/* Nombre de compétences acquises. */
function masteredCount(){ return SKILLS.filter(s => st(s.id).mastered).length; }
/* Altitude totale, en mètres, somme des mètres de chaque compétence. */
function altitude(){ return Math.round(SKILLS.reduce((a, s) => a + _pedMetres(s.id), 0)); }
/* Crédite des mètres au journal du jour. Retourne les mètres réellement crédités. */
function gagnerAltitude(n, raison){
  n = Math.max(0, Math.round(n || 0));
  if (!n) return 0;
  const j = jToday();
  j.m = (j.m || 0) + n;
  save();
  return n;
}

/* Les quatre états de maîtrise, plus les nuances « À confirmer », « Fragile » et « Plus haut ». */
function niveauMaitrise(id){
  const s = st(id), sk = SKILLS.find(x => x.id === id);
  let cle = 'nouveau', nom = 'Nouvelle', icone = '';
  if (s.mastered && (s.revOk || 0) >= 3 && (s.interval || 0) >= 16){ cle = 'consolide'; nom = 'Consolidée'; icone = 'seal-check'; }
  else if (s.mastered){ cle = 'verrouille'; nom = 'Verrouillée'; icone = 'lock-simple'; }
  else if (s.n >= 6){ cle = 'encours'; nom = 'En cours'; icone = 'arrows-clockwise'; }
  else if (s.n > 0){ cle = 'repere'; nom = 'Repérée'; icone = ''; }
  if (!s.n && sk && !phaseUnlocked(sk.phase)){ cle = 'plus-haut'; nom = 'Plus haut'; icone = 'circle-dashed'; }
  const last = s.hist.slice(-_pedSeuils.last);
  const justes = last.reduce((a, b) => a + b, 0);
  const reste = s.mastered ? 0 : Math.max(_pedSeuils.min - s.n, _pedSeuils.ok - justes, 0);
  let libelle = nom;
  if (s.provisoire) libelle = 'À confirmer';
  else if (s.fragile) libelle = 'Fragile';
  return {cle: cle, nom: nom, libelle: libelle, icone: s.fragile && !s.provisoire ? 'warning-circle' : icone,
          fragile: !!s.fragile, provisoire: !!s.provisoire, reste: reste, taux: tauxRecent(id)};
}

/* ---------- journal, objectif du jour, série ---------- */
/* Nom du palier d'objectif. */
function _pedNomPalier(n){ return n <= 10 ? 'Balade' : n <= 25 ? 'Marche' : 'Ascension'; }
window.nomPalier = _pedNomPalier;

/* Journal du jour, créé avec l'objectif en vigueur. */
function jToday(){
  const k = todayKey();
  return S.journal[k] || (S.journal[k] = {a:0, ok:0, cm:0, seance:false, ms:0,
    obj: (S.profil && S.profil.objectif) || 25, rev:0, revTot:null, cmMs:0, m:0, abs:false});
}
/* Enregistre une réponse dans le journal du jour. */
function logAnswer(ok, ms){ const j = jToday(); j.a++; if (ok) j.ok++; if (ms) j.ms = (j.ms || 0) + ms; save(); }
/* Compte une erreur d'un type donné (signe, calcul, méthode, lecture, étourderie). */
function noteType(type){ if (!type) return; S.typErr = S.typErr || {}; S.typErr[type] = (S.typErr[type] || 0) + 1; save(); }
/* Une journée est validée par une séance ou par l'objectif de réponses justes (règle v1 pour les jours anciens). */
function dayDone(k){ const j = S.journal[k]; return !!j && (j.seance || (j.obj ? j.ok >= j.obj : j.a >= 15)); }

/* Objectif du jour : nombre visé et nom du palier. */
function objectifJour(){
  const j = S.journal[todayKey()];
  const n = (j && j.obj) || (S.profil && S.profil.objectif) || 25;
  return {n: n, nom: _pedNomPalier(n)};
}
/* Avancement des trois anneaux du jour : réponses justes, rappels faits, minutes de calcul mental. */
function progresJour(){
  const j = jToday(), o = objectifJour();
  const rev = j.rev || 0, revTot = j.revTot;
  const cmMs = j.cmMs || 0;
  return {
    ok: j.ok || 0, obj: o.n, palier: o.nom,
    p1: o.n ? Math.min(1, (j.ok || 0) / o.n) : 0,
    rev: rev, revTot: revTot,
    p2: revTot ? Math.min(1, rev / revTot) : null,
    cmMs: cmMs, p3: Math.min(1, cmMs / 180000),
    m: j.m || 0, seance: !!j.seance,
    fait: dayDone(todayKey()),
    depasse: o.n ? (j.ok || 0) > o.n : false,
    trois: (o.n ? (j.ok || 0) >= o.n : false) && (revTot ? rev >= revTot : false) && cmMs >= 180000
  };
}
/* Change l'objectif du jour sans jamais dévalider une journée déjà gagnée. */
function _pedChoisirObjectif(n){
  S.profil.objectif = n;
  const j = jToday();
  if ((j.ok || 0) < (j.obj || n)) j.obj = n;
  save();
  return j.obj;
}
window.choisirObjectif = _pedChoisirObjectif;

/* Série de jours : un jour compte s'il est validé ou couvert par un bivouac. */
function streak(){
  let n = 0; const d = new Date();
  const util = (S.serie && S.serie.utilises) || [];
  if (dayDone(todayKey(d))) n++;
  for (let i = 1; i < 400; i++){
    d.setDate(d.getDate() - 1);
    const k = todayKey(d);
    if (dayDone(k) || util.indexOf(k) >= 0) n++; else break;
  }
  return n;
}
/* Plus longue série jamais tenue, calculée sur tout le journal. */
function _pedStreakMax(){
  const util = (S.serie && S.serie.utilises) || [];
  const cles = Object.keys(S.journal).sort();
  if (!cles.length) return 0;
  let max = 0, cour = 0;
  const d = new Date(cles[0] + 'T12:00:00');
  const fin = new Date(); fin.setHours(12, 0, 0, 0);
  let garde = 0;
  while (d <= fin && garde++ < 4000){
    const k = todayKey(d);
    if (dayDone(k) || util.indexOf(k) >= 0){ cour++; if (cour > max) max = cour; } else cour = 0;
    d.setDate(d.getDate() + 1);
  }
  return Math.max(max, S.records ? (S.records.serieMax || 0) : 0);
}
window.streakMax = _pedStreakMax;

/* Jours écoulés depuis la dernière journée avec au moins une réponse. */
function _pedJoursDepuisActivite(){
  const cles = Object.keys(S.journal).filter(k => { const j = S.journal[k]; return j && (j.a > 0 || j.seance); }).sort();
  if (!cles.length) return 0;
  const der = new Date(cles[cles.length - 1] + 'T12:00:00');
  const auj = new Date(); auj.setHours(12, 0, 0, 0);
  return Math.max(0, Math.round((auj - der) / JOUR));
}
window.joursDepuisActivite = _pedJoursDepuisActivite;

/* Consomme les bivouacs pour les jours manqués, puis crédite ceux gagnés.
   Retourne {stock, gagnes, utilises, nouveaux, couverts}. La série pardonne, elle ne punit jamais. */
function bivouacs(){
  const ser = S.serie;
  const cles = Object.keys(S.journal).filter(k => { const j = S.journal[k]; return j && (j.a > 0 || j.seance); }).sort();
  const couverts = [];
  if (cles.length){
    const debut = cles[0];
    const d = new Date(); d.setDate(d.getDate() - 1);
    let garde = 0;
    while (garde++ < 400){
      const k = todayKey(d);
      if (k < debut) break;
      if (dayDone(k) || ser.utilises.indexOf(k) >= 0){ d.setDate(d.getDate() - 1); continue; }
      if (ser.bivouacs > 0){
        ser.bivouacs--; ser.utilises.push(k); couverts.push(k);
        if (ser.utilises.length > 60) ser.utilises = ser.utilises.slice(-60);
        d.setDate(d.getDate() - 1); continue;
      }
      break;
    }
  }
  const dus = Math.floor(streak() / 7);
  let nouveaux = 0;
  if (dus > (ser.gagnes || 0)){
    nouveaux = dus - ser.gagnes;
    ser.gagnes = dus;
    ser.bivouacs = Math.min(2, (ser.bivouacs || 0) + nouveaux);
    ser.dernierGain = todayKey();
  } else if (dus < (ser.gagnes || 0)) ser.gagnes = dus;
  const max = _pedStreakMax();
  if (max > (S.records.serieMax || 0)) S.records.serieMax = max;
  if (couverts.length || nouveaux) save();
  return {stock: ser.bivouacs, gagnes: ser.gagnes, utilises: ser.utilises.slice(), nouveaux: nouveaux, couverts: couverts};
}
window.verifierSerie = bivouacs;

/* ---------- calcul mental ---------- */
const CM_FAMS = window.CM_FAMS || [];
const CM_CATS = [...new Set(CM_FAMS.map(f => f.cat))];

/* Médiane des dix derniers temps mesurés sur une famille, en millisecondes (null si moins de 5 mesures). */
function _pedMed(fid){
  const f = S.cm.fam[fid];
  if (!f || !f.t || f.t.length < 5) return null;
  const t = f.t.slice(-10).sort((a, b) => a - b);
  const m = t.length >> 1;
  return t.length % 2 ? t[m] : Math.round((t[m - 1] + t[m]) / 2);
}
/* Objectif de vitesse personnel sur une famille, en secondes (5 s tant qu'il n'y a pas 5 mesures). */
function _pedCible(fid){
  const m = _pedMed(fid);
  if (m === null) return 5;
  return Math.round(Math.min(6, Math.max(2.5, (m / 1000) * .85)) * 10) / 10;
}
/* État d'une famille de calcul mental (M11). */
function _pedEtatFam(fid){
  const f = S.cm.fam[fid] || {n:0, ok:0, t:[]};
  const med = _pedMed(fid), medS = med === null ? null : med / 1000;
  if (!f.n || f.n < 5) return {cle:'decouvrir', nom:'À découvrir', med:med};
  const dix = (f.t || []).length;
  const taux = f.ok / f.n;
  if (dix >= 10 && taux >= .9 && medS !== null && medS <= 4) return {cle:'automatise', nom:'Automatisé', med:med};
  if (taux < .7 || (medS !== null && medS > 8)) return {cle:'apprentissage', nom:'En apprentissage', med:med};
  if (taux >= .85 && medS !== null && medS <= 6) return {cle:'fiable', nom:'Fiable', med:med};
  return {cle:'progres', nom:'En progrès', med:med};
}
window.med = _pedMed; window.cible = _pedCible; window.etatFam = _pedEtatFam;

/* Choisit la prochaine famille : les moins sûres et les plus lentes reviennent plus souvent. */
function cmPick(){
  if (!CM_FAMS.length) return null;
  const poids = CM_FAMS.map(f => {
    const s = S.cm.fam[f.id] || {n:0, ok:0};
    if (_pedEtatFam(f.id).cle === 'automatise') return .15;
    const err = s.n ? 1 - s.ok / s.n : .5;
    const m = _pedMed(f.id);
    const lent = m === null ? 0 : Math.max(0, (m / 1000 - 4) / 8);
    return .25 + err + lent;
  });
  let tot = poids.reduce((a, b) => a + b, 0), r = Math.random() * tot;
  for (let i = 0; i < CM_FAMS.length; i++){ r -= poids[i]; if (r <= 0) return CM_FAMS[i]; }
  return CM_FAMS[0];
}
/* Enregistre une réponse de calcul mental. Les temps aidés ou supérieurs à 30 s ne comptent pas. */
function cmRecord(fid, ok, ms, aide){
  const s = S.cm.fam[fid] || (S.cm.fam[fid] = {n:0, ok:0, t:[]});
  if (!s.t) s.t = [];
  s.n++; if (ok) s.ok++;
  if (ok && !aide && ms > 0 && ms <= 30000){ s.t.push(Math.round(ms)); if (s.t.length > 20) s.t = s.t.slice(-20); }
  const j = jToday();
  j.cm++; if (ms > 0) j.cmMs = (j.cmMs || 0) + Math.min(ms, 30000);
  save();
  return s;
}

/* ---------- typologie des erreurs ---------- */
/* Les cinq familles d'erreurs. Le ton colore le point de la pastille, il n'y a plus d'emoji. */
const TYPES_ERR = [
  {id:'signe',      nom:'Signe',      tone:'ko',      conseil:"Détermine le signe à part, puis les nombres. Deux gestes séparés."},
  {id:'calcul',     nom:'Calcul',     tone:'gold',    conseil:"Ce sont les automatismes : reprends le calcul mental chronométré chaque jour."},
  {id:'methode',    nom:'Méthode',    tone:'glacier', conseil:"Relis la leçon et la technique, puis refais une série en niveau Découverte."},
  {id:'lecture',    nom:'Lecture',    tone:'warn',    conseil:"Relis l'énoncé deux fois et souligne ce qu'on te demande vraiment."},
  {id:'etourderie', nom:'Étourderie', tone:'muted',   conseil:"Tu savais faire. Ralentis de deux secondes avant de valider."}
];
window.nomType = id => (TYPES_ERR.find(x => x.id === id) || {}).nom || 'non classée';

/* ---------- jalons ---------- */
/* Total de réponses justes depuis le début. */
function _pedReponsesJustes(){ return Object.values(S.journal).reduce((a, j) => a + ((j && j.ok) || 0), 0); }
window.reponsesJustes = _pedReponsesJustes;

/* Les jalons de l'ascension. Un id présent dans S.jalons n'est jamais rejoué. */
const JALONS = [
  {id:'premier-verrou', type:'verrou', niveau:4, texte:"Verrouillé à 90 %. C'est acquis."},
  {id:'camp-1', type:'camp', phase:1, niveau:5, texte:'Camp 1 · 800 m. Les fondations sont posées.'},
  {id:'camp-2', type:'camp', phase:2, niveau:5, texte:'Camp 2 · 1 600 m. Tu as quitté la forêt.'},
  {id:'camp-3', type:'camp', phase:3, niveau:5, texte:'Camp 3 · 2 400 m. La roche commence.'},
  {id:'camp-4', type:'camp', phase:4, niveau:5, texte:'Camp 4 · 3 200 m. Premier glacier.'},
  {id:'camp-5', type:'camp', phase:5, niveau:5, texte:"Camp 5 · 3 900 m. Le névé. L'air se raréfie."},
  {id:'camp-6', type:'camp', phase:6, niveau:5, texte:'Camp 6 · 4 300 m. Assaut final.'},
  {id:'camp-7', type:'camp', phase:7, niveau:5, texte:'Sommet · 4 810 m. Tu es en haut.'},
  {id:'alt-500',  type:'alt', seuil:500,  niveau:3, texte:'500 m. Premier palier.'},
  {id:'alt-1000', type:'alt', seuil:1000, niveau:3, texte:'1 000 m. Un kilomètre de dénivelé.'},
  {id:'alt-2000', type:'alt', seuil:2000, niveau:3, texte:'2 000 m. La moitié du chemin est derrière.'},
  {id:'alt-3000', type:'alt', seuil:3000, niveau:3, texte:"3 000 m. L'air change."},
  {id:'alt-4000', type:'alt', seuil:4000, niveau:3, texte:'4 000 m. Le sommet est en vue.'},
  {id:'serie-7',   type:'serie', seuil:7,   niveau:3, texte:'7 jours de cordée. Bivouac gagné.'},
  {id:'serie-14',  type:'serie', seuil:14,  niveau:3, texte:'14 jours. Deux semaines sans lâcher.'},
  {id:'serie-30',  type:'serie', seuil:30,  niveau:5, texte:'30 jours. Un mois sans lâcher.'},
  {id:'serie-60',  type:'serie', seuil:60,  niveau:5, texte:'60 jours.'},
  {id:'serie-100', type:'serie', seuil:100, niveau:5, texte:'100 jours de cordée.'},
  {id:'rep-100',  type:'rep', seuil:100,  niveau:2, texte:'100 réponses justes.'},
  {id:'rep-500',  type:'rep', seuil:500,  niveau:2, texte:'500 réponses justes.'},
  {id:'rep-1000', type:'rep', seuil:1000, niveau:2, texte:'1 000 réponses justes.'},
  {id:'rep-2500', type:'rep', seuil:2500, niveau:2, texte:'2 500 réponses justes.'},
  {id:'rep-5000', type:'rep', seuil:5000, niveau:2, texte:'5 000 réponses justes.'}
];
/* Ce jalon est-il atteint maintenant ? */
function _pedJalonAtteint(j){
  if (j.type === 'camp'){ const l = SKILLS.filter(s => s.phase === j.phase); return l.length > 0 && l.every(s => st(s.id).mastered); }
  if (j.type === 'alt') return altitude() >= j.seuil;
  if (j.type === 'serie') return streak() >= j.seuil;
  if (j.type === 'rep') return _pedReponsesJustes() >= j.seuil;
  if (j.type === 'verrou') return masteredCount() > 0;
  return false;
}
/* Marque comme déjà vus tous les jalons franchis, sans aucune célébration (migration, import, restauration). */
function _pedJalonsPasses(){
  const ts = S.debut || Date.now();
  JALONS.forEach(j => { if (!S.jalons[j.id] && _pedJalonAtteint(j)) S.jalons[j.id] = ts; });
  return S.jalons;
}
/* Jalons franchis à l'instant : les marque et les retourne, à charge pour core/ui.js de les célébrer. */
function _pedJalonsNouveaux(){
  const neufs = [];
  JALONS.forEach(j => { if (!S.jalons[j.id] && _pedJalonAtteint(j)){ S.jalons[j.id] = Date.now(); neufs.push(j); } });
  if (neufs.length) save();
  return neufs.sort((a, b) => b.niveau - a.niveau);
}
window.marquerJalonsPasses = _pedJalonsPasses;
window.verifierJalons = _pedJalonsNouveaux;

/* ---------- succès ---------- */
/* Les 22 succès. Chaque condition est mesurable et ne dépend jamais de quelqu'un d'autre.
   ctx est l'événement en cours ({type, ...}) : certaines conditions ne sont vraies qu'à cet instant. */
const SUCCES = [
  {id:'premiers-pas',   nom:'Premiers pas',  ic:'footprints',        cond: c => c.type === 'seance-fin'},
  {id:'premier-verrou', nom:'Premier verrou', ic:'lock-key',         cond: () => masteredCount() >= 1},
  {id:'camp-1', nom:'Camp 1', ic:'flag',       cond: () => !!S.jalons['camp-1']},
  {id:'camp-2', nom:'Camp 2', ic:'flag',       cond: () => !!S.jalons['camp-2']},
  {id:'camp-3', nom:'Camp 3', ic:'flag',       cond: () => !!S.jalons['camp-3']},
  {id:'camp-4', nom:'Camp 4', ic:'flag-banner', cond: () => !!S.jalons['camp-4']},
  {id:'camp-5', nom:'Camp 5', ic:'flag-banner', cond: () => !!S.jalons['camp-5']},
  {id:'camp-6', nom:'Camp 6', ic:'flag-banner', cond: () => !!S.jalons['camp-6']},
  {id:'sommet',         nom:'Sommet',        ic:'mountains',         cond: () => !!S.jalons['camp-7']},
  {id:'semaine-pleine', nom:'Semaine pleine', ic:'calendar-check',   cond: () => streak() >= 7},
  {id:'quinzaine',      nom:'Quinzaine',     ic:'calendar-dots',     cond: () => streak() >= 14},
  {id:'mois-de-cordee', nom:'Mois de cordée', ic:'medal',            cond: () => streak() >= 30},
  {id:'cent',           nom:'Centurion',     ic:'target',            cond: () => _pedReponsesJustes() >= 100},
  {id:'mille',          nom:'Millier',       ic:'stack',             cond: () => _pedReponsesJustes() >= 1000},
  {id:'sans-faute',     nom:'Sans faute',    ic:'check-circle',      cond: c => c.type === 'serie-fin' && c.n >= 10 && c.ok === c.n && !c.deja},
  {id:'eclair',         nom:'Éclair',        ic:'lightning',         cond: c => c.type === 'cm-fin' && c.n >= 20 && c.ok >= 18 && c.med && c.med <= 4000},
  {id:'reparateur',     nom:'Réparateur',    ic:'wrench',            cond: () => (S.compteurs.reparees || 0) >= 10},
  {id:'chirurgien',     nom:'Chirurgien',    ic:'first-aid',         cond: () => (S.compteurs.reparees || 0) >= 25},
  {id:'semaine-validee', nom:'Semaine validée', ic:'seal-check',     cond: c => c.type === 'test-fin' && c.n && c.ok / c.n >= .9},
  {id:'mention',        nom:'Mention',       ic:'graduation-cap',    cond: c => c.type === 'epreuve-fin' && c.note >= 16},
  {id:'copie-propre',   nom:'Copie propre',  ic:'pencil-line',       cond: c => c.type === 'papier-fin' && c.score >= 1},
  {id:'trois-anneaux',  nom:'Trois anneaux', ic:'circles-three',     cond: () => progresJour().trois},
  {id:'bivouac',        nom:'Bivouac',       ic:'tent',              cond: () => (S.serie.utilises || []).length >= 1},
  {id:'retour',         nom:'Retour',        ic:'arrow-u-up-left',   cond: c => c.type === 'seance-fin' && !!jToday().abs && _pedJoursDepuisActivite() >= 7},
  {id:'sept-calculs',   nom:'Sept calculs',  ic:'sun',               cond: () => _pedCdjConsecutifs() >= 7}
];
/* Nombre de calculs du jour réussis d'affilée (succès « Sept calculs »). */
function _pedCdjConsecutifs(){
  const cles = Object.keys(S.cdj || {}).sort();
  let n = 0; const d = new Date();
  for (let i = 0; i < 40; i++){ const k = todayKey(d); if (cles.indexOf(k) >= 0) n++; else if (i > 0) break; d.setDate(d.getDate() - 1); }
  return n;
}
/* Vérifie les succès à la lumière d'un événement. Retourne ceux qui viennent d'être obtenus. */
function verifierSucces(evt){
  const c = evt || {type: ''};
  const neufs = [];
  SUCCES.forEach(s => {
    if (S.succes[s.id]) return;
    let ok = false;
    try { ok = !!s.cond(c); } catch(e){ ok = false; }
    if (ok){ S.succes[s.id] = Date.now(); neufs.push(s); }
  });
  if (neufs.length && c.type !== 'migration') save();
  return neufs;
}

/* ---------- coach : messages courts, voix de guide de cordée ----------
   Deux phrases maximum, 200 caractères maximum, aucun emoji, aucun tiret cadratin, jamais de reproche. */
function coachMessages(){
  const msgs = [];
  const pousse = (t, p, extra) => { if (t.length <= 200) msgs.push(Object.assign({t: t, p: p}, extra || {})); };
  const sk = streak(), f = frontier(), due = dueReviews(), alt = altitude(), acquises = masteredCount();
  const abs = _pedJoursDepuisActivite();
  const camp = campDe(alt);
  const weak = SKILLS.filter(s => { const t = tauxRecent(s.id); return t !== null && t < .5 && st(s.id).n >= 6 && !st(s.id).mastered; });
  const prog = progresJour();

  if (acquises === 0 && (!f || st(f.id).n === 0))
    pousse("Bienvenue au camp de base. On part de tout en bas pour ne laisser aucun trou derrière nous.", 10);

  if (abs >= 7 && acquises > 0)
    pousse("Content de te revoir. Tout est encore là : " + fv(alt) + " m et " + acquises + " compétences, on reprend en douceur.", 10);
  else if (abs >= 3 && acquises > 0)
    pousse("Content de te revoir. La montagne n'a pas bougé : tu es toujours à " + fv(alt) + " m.", 9);

  if (due.length >= 4)
    pousse(fv(due.length) + " compétences attendent leur rappel. On révise avant d'apprendre du neuf : c'est ce qui grave.", 9);
  else if (due.length)
    pousse("Un rappel t'attend : " + due[0].titre + ". Trois questions suffisent pour le garder au chaud.", 6);

  if (weak.length)
    pousse("« " + weak[0].titre + " » résiste en ce moment. Relis la leçon calmement, puis refais une série en Découverte.", 8);

  if (sk >= 3)
    pousse(fv(sk) + " jours d'affilée. La régularité fait plus de chemin que le talent.", 5);

  if (sk === 0 && Object.keys(S.journal).length > 0 && abs < 3)
    pousse("Rien encore aujourd'hui, et ce n'est pas grave. Vingt minutes suffisent : je m'occupe du menu.", 7);

  if (!prog.fait && prog.obj)
    pousse("Il te reste " + fv(Math.max(0, prog.obj - prog.ok)) + " réponses justes pour la " + prog.palier.toLowerCase() + " du jour.", 4);

  const fam = Object.entries(S.cm.fam).filter(([, v]) => v.n >= 8).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)[0];
  if (fam && fam[1].ok / fam[1].n < .7){
    const fo = CM_FAMS.find(x => x.id === fam[0]) || {};
    pousse("En calcul mental, « " + (fo.nom || fam[0]) + " » demande encore du travail. Relis la technique, puis fais un sprint dédié.", 6, {tech: fam[0]});
  }

  if (new Date().getDay() === 0 && acquises >= 3)
    pousse("C'est dimanche : le test de la semaine t'attend. Vingt questions pour réactiver tout ce que tu sais déjà.", 8);

  if (alt > 0 && camp.suivant)
    pousse("Tu es à " + fv(alt) + " m. Encore " + fv(camp.restant) + " m avant le " + camp.suivantNom + ".", 3);

  if (f)
    pousse("Ta prochaine marche : « " + f.titre + " », en " + PHASES[f.phase].nom + ". C'est elle qui ouvre la suite.", 4);

  if (!f && SKILLS.length)
    pousse("Sommet atteint. Toutes les compétences sont acquises : maintenant on entretient, avec les rappels et les annales.", 10);

  msgs.sort((a, b) => b.p - a.p);
  return msgs;
}
