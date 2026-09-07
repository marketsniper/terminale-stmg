/* ===== Maths · De zéro au sommet : état persistant (schéma v2), migration, sauvegarde à trois niveaux =====
   Script classique : portée globale partagée avec les autres modules (ordre de chargement dans index.html).
   Ce fichier déclare : K, SCHEMA, defState, S, save, st, migrer, exportEtat, importEtat, majCloud
   et tout le bloc de sauvegarde (persistance, miroir IndexedDB, Gist GitHub). */
'use strict';

/* ---------- clé de stockage et version du schéma ---------- */
const K = 'mzs-state';
const SCHEMA = 2;

/* État par défaut : le modèle complet du PRODUCT-SPEC §7.1. */
function defState(){ return {
  v: SCHEMA,                              // version du schéma
  debut: Date.now(),                      // premier lancement (ms)
  vuLe: 0,                                // dernier passage (ms), sert au retour après absence
  skills: {},                             // id de compétence : voir st()
  erreurs: [],                            // 120 maximum
  reparees: [],                           // 50 maximum : {sid, q, type, ts}
  journal: {},                            // 'AAAA-MM-JJ' : {a, ok, cm, seance, ms, obj, rev, revTot, cmMs, m, abs}
  cm: { fam: {}, best: null },            // fam[fid] = {n, ok, t:[]} ; best = {ok, n, secs, med}
  tests: [],                              // 60 maximum : {date, ok, n}
  epreuves: [],                           // 40 maximum : {date, fmt, note, just, faux, vide, n, parQ, hasard, rythme}
  papier: {},                             // id : {score, n, tot, ts, min, due, hist, check}
  typErr: {},                             // type d'erreur : compteur
  bilan: null,                            // bilan d'altitude : {ts, q, phase, valides}
  profil: { prenom: '', objectif: 25, onboard: false, onboardLe: 0, bilanFait: false,
            concours: '2027-04-10', bac: '2027-06-14' },
  prefs:  { theme: 'auto', son: 'discret', haptique: true, animations: 'auto',
            indices: true, cmIndices: 'auto', raccourcis: true, prof: true },
  meta:   { versionVue: '', installVue: 0, installRefus: 0, majIgnoree: '',
            tipType: false, profHello: false, sentier: 'skills' },
  serie:  { bivouacs: 0, gagnes: 0, utilises: [], dernierGain: '', dernierMsg: '' },
  jalons: {},                             // id : horodatage (irréversible)
  succes: {},                             // id : horodatage
  records: { precision: 0, questions: 0, cmSecs: null, seanceMax: 0, serieMax: 0 },
  compteurs: { reparees: 0 },
  bilans: {},                             // 'AAAA-Www' : bilan hebdomadaire
  cdj: {}                                 // 'AAAA-MM-JJ' : calcul du jour, 400 maximum
}; }

/* État courant. Toujours lu par référence : ne jamais le remplacer sans passer par migrer(). */
let S = defState();
/* Fusionne un état brut avec les valeurs par défaut. Un état sans champ v est un état v1 : on le marque comme tel. */
function _etatAdopter(brut){
  const e = Object.assign(defState(), brut || {});
  if (!brut || !brut.v) e.v = 1;
  return e;
}
try { const raw = localStorage.getItem(K); if (raw) S = _etatAdopter(JSON.parse(raw)); } catch(e){}

/* L'assistant (assistant.js) lit window.S : lecture seule, l'écriture lève en mode strict. */
try { Object.defineProperty(window, 'S', {get: () => S, configurable: true}); } catch(e){}

/* Fiche d'une compétence, créée à la volée avec tous ses champs v2. */
function st(id){ return S.skills[id] || (S.skills[id] = {
  hist: [], n: 0, ok: 0, mastered: false, fragile: false, due: 0, interval: 0, lu: false,
  masteredAt: 0, provisoire: false, revOk: 0, aides: 0, rev: []
}); }

/* ---------- écriture débouncée : une seule écriture par salve de 300 ms ---------- */
let _etatTimer = null, _etatSale = false;
/* Applique les plafonds du modèle avant chaque écriture. */
function _etatPurger(){
  if (S.erreurs.length > 120) S.erreurs = S.erreurs.slice(-120);
  if (S.reparees.length > 50) S.reparees = S.reparees.slice(-50);
  if (S.tests.length > 60) S.tests = S.tests.slice(-60);
  if (S.epreuves.length > 40) S.epreuves = S.epreuves.slice(-40);
  Object.values(S.skills).forEach(s => { if (s.rev && s.rev.length > 12) s.rev = s.rev.slice(-12); });
  const cles = Object.keys(S.cdj);
  if (cles.length > 400) cles.sort().slice(0, cles.length - 400).forEach(k => { delete S.cdj[k]; });
}
/* Écriture réelle dans localStorage, puis planification de la sauvegarde en ligne. */
function _etatEcrire(){
  _etatSale = false;
  try { _etatPurger(); } catch(e){}
  try { localStorage.setItem(K, JSON.stringify(S)); } catch(e){}
  try { planifierSync(); } catch(e){}
}
/* Demande d'enregistrement : regroupée sur 300 ms pour ne plus écrire cinq fois par réponse. */
function save(){
  _etatSale = true;
  if (_etatTimer) return;
  _etatTimer = setTimeout(() => { _etatTimer = null; _etatEcrire(); }, 300);
}
/* Force l'écriture immédiate (fermeture d'onglet, import, export). */
save.flush = function(){
  if (_etatTimer){ clearTimeout(_etatTimer); _etatTimer = null; }
  if (_etatSale) _etatEcrire();
};
try {
  addEventListener('pagehide', () => { S.vuLe = Date.now(); _etatSale = true; save.flush(); });
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden'){ S.vuLe = Date.now(); _etatSale = true; save.flush(); } });
} catch(e){}

/* ---------- migration v1 vers v2 ----------
   Idempotente : deux appels de suite donnent exactement le même état.
   Appelée juste après la lecture de localStorage, après importEtat() et après recupererSiVide(). */
function migrer(etat){
  if (etat && etat !== S) S = etat;                       // on adopte l'état fourni (import, présentation)
  const dejaV2 = (S.v || 1) >= SCHEMA;                    // lu AVANT de compléter les clés manquantes
  const D = defState();
  // 1. clés de premier niveau et sous-objets manquants : on ne touche jamais un champ présent
  Object.keys(D).forEach(k => { if (k === 'v') return; if (S[k] === undefined || S[k] === null && D[k] !== null) S[k] = D[k]; });
  ['profil', 'prefs', 'meta', 'serie', 'records', 'compteurs', 'cm'].forEach(k => { S[k] = Object.assign({}, D[k], S[k] || {}); });
  if (!S.cm.fam) S.cm.fam = {};
  if (S.cm.best && S.cm.best.med === undefined) S.cm.best.med = null;
  if (S.cm.best && S.cm.best.n == null) S.cm.best.n = 20;  // le record v1 était toujours un sprint de 20
  ['erreurs', 'reparees', 'tests', 'epreuves'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
  ['journal', 'skills', 'papier', 'typErr', 'jalons', 'succes', 'bilans', 'cdj'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
  if (!Array.isArray(S.serie.utilises)) S.serie.utilises = [];

  if (dejaV2){ S.v = SCHEMA; return S; }

  // 2. son v1 (booléen) vers prefs.son (trois états)
  if (typeof S.son === 'boolean'){ S.prefs.son = S.son ? 'discret' : 'off'; delete S.son; }
  // 3. compétences : champs v2 complétés sans rien perdre
  Object.entries(S.skills).forEach(([id, s]) => {
    const d = st(id); Object.keys(d).forEach(k => { if (s[k] === undefined) s[k] = d[k]; });
    if (!Array.isArray(s.hist)) s.hist = [];
    if (!Array.isArray(s.rev)) s.rev = [];
    if (s.mastered && !s.masteredAt) s.masteredAt = S.debut;
    if (s.mastered && s.interval && !s.revOk) s.revOk = Math.max(0, Math.round(Math.log2(s.interval / 2)));
    if (s.ok > s.n) s.ok = s.n;
  });
  // 4. erreurs : échéancier du cahier
  S.erreurs.forEach(e => {
    if (e.due == null) e.due = (e.ts || Date.now()) + (e.redo ? 3 : 1) * JOUR;
    if (e.okAt == null) e.okAt = 0;
    if (e.reprise == null) e.reprise = 0;
    if (e.redo == null) e.redo = 0;
  });
  // 5. calcul mental, papier, épreuves
  Object.values(S.cm.fam).forEach(f => { if (!Array.isArray(f.t)) f.t = []; });
  Object.values(S.papier).forEach(p => {
    if (p.due == null) p.due = (p.ts || Date.now()) + 2 * JOUR;
    if (!Array.isArray(p.hist)) p.hist = [{score: p.score, ts: p.ts}];
    if (p.check === undefined) p.check = null;
  });
  S.epreuves.forEach(e => { if (!Array.isArray(e.parQ)) e.parQ = []; if (e.hasard == null) e.hasard = 0; if (!Array.isArray(e.rythme)) e.rythme = []; });
  // 6. journal : les jours v1 gardent l'ancienne règle (aucun champ obj ajouté a posteriori)
  Object.values(S.journal).forEach(j => {
    ['rev', 'cmMs', 'm'].forEach(k => { if (j[k] == null) j[k] = 0; });
    if (j.revTot === undefined) j.revTot = null;
    if (j.abs === undefined) j.abs = false;
  });

  // 7. la suite dépend de core/pedagogie.js, chargé après ce fichier : on la reporte si besoin
  if (typeof streak !== 'function'){ setTimeout(() => { try { migrer(); } catch(e){} }, 0); return S; }

  const sk = streak();
  S.serie.bivouacs = Math.min(2, Math.floor(sk / 7));
  S.serie.gagnes = S.serie.bivouacs;
  if (typeof streakMax === 'function') S.records.serieMax = Math.max(S.records.serieMax || 0, streakMax());
  // 8. onboarding : un état déjà utilisé le reverra une fois, en version courte
  S.profil.onboard = false;
  S.v = SCHEMA;
  if (typeof marquerJalonsPasses === 'function') marquerJalonsPasses();     // jalons déjà franchis, sans célébration
  if (typeof verifierSucces === 'function') { try { verifierSucces({type: 'migration'}); } catch(e){} }
  save();
  return S;
}

/* ============================================================
   PERSISTANCE : trois niveaux pour ne rien perdre
   1. stockage persistant demandé au navigateur (anti-nettoyage automatique)
   2. copie miroir en IndexedDB (survit à certains effacements)
   3. sauvegarde automatique dans un Gist GitHub secret (survit à tout)
   ============================================================ */
const K_TOKEN = 'mzs-gh-token', K_GIST = 'mzs-gh-gist', K_SYNC = 'mzs-sync-le';
const GIST_FICHIER = 'maths-de-zero-au-sommet.json';
const GIST_MARQUE = 'Sauvegarde · Maths De zéro au sommet';

/* --- 1. stockage persistant --- */
let persistOK = null;
/* Demande au navigateur de ne pas effacer le stockage de l'app. */
async function demanderPersistance(){
  try {
    if (!navigator.storage || !navigator.storage.persist) return null;
    persistOK = await navigator.storage.persisted();
    if (!persistOK) persistOK = await navigator.storage.persist();
    return persistOK;
  } catch(e){ return null; }
}

/* --- 2. miroir IndexedDB --- */
/* IndexedDB peut ne jamais répondre (base verrouillée, navigation privée) : on ne l'attend jamais indéfiniment. */
function avecDelai(p, ms, defaut){
  return Promise.race([p, new Promise(r => setTimeout(() => r(defaut), ms))]);
}
/* Ouvre (ou crée) la base miroir. */
function idb(){
  return new Promise((res, rej) => {
    const r = indexedDB.open('mzs', 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('kv')) r.result.createObjectStore('kv'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
/* Écrit l'export complet dans le miroir. */
async function idbEcrire(v){
  let db = null;
  try { db = await idb();
    await new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(v, 'etat'); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  } catch(e){} finally { if (db) try { db.close(); } catch(e){} }
}
/* Relit le miroir. */
async function idbLire(){
  let db = null;
  try { db = await idb();
    return await new Promise((res, rej) => { const tx = db.transaction('kv', 'readonly');
      const q = tx.objectStore('kv').get('etat'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  } catch(e){ return null; } finally { if (db) try { db.close(); } catch(e){} }
}

/* --- 3. Gist GitHub --- */
const ghToken = () => { try { return localStorage.getItem(K_TOKEN) || ''; } catch(e){ return ''; } };
const gistId  = () => { try { return localStorage.getItem(K_GIST) || ''; } catch(e){ return ''; } };
/* Écrit ou efface une clé GitHub dans localStorage (jamais dans S : le Gist ne doit pas contenir le jeton). */
function ghSet(k, v){ try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch(e){} }

/* Appel authentifié à l'API GitHub, avec messages d'erreur en français. */
async function gh(url, opt){
  const r = await fetch('https://api.github.com' + url, Object.assign({
    headers: {'authorization': 'Bearer ' + ghToken(), 'accept': 'application/vnd.github+json', 'content-type': 'application/json'}
  }, opt || {}));
  if (!r.ok){
    let m = ''; try { m = (await r.json()).message || ''; } catch(e){}
    throw new Error(r.status === 401 ? 'Jeton refusé. Vérifie-le.'
      : r.status === 403 ? "Le jeton n'a pas la permission « gist »."
      : r.status === 404 ? 'Sauvegarde introuvable.'
      : 'GitHub ' + r.status + (m ? ' : ' + m : ''));
  }
  return r.json();
}
/* Retrouve (ou mémorise) l'identifiant du Gist de sauvegarde. */
async function trouverGist(){
  if (gistId()) return gistId();
  const l = await gh('/gists?per_page=100');
  const g = l.find(x => x.description === GIST_MARQUE || (x.files && x.files[GIST_FICHIER]));
  if (g){ ghSet(K_GIST, g.id); return g.id; }
  return '';
}
/* Envoie l'état complet dans le Gist secret. */
async function nuageEnvoyer(){
  if (!ghToken()) return null;
  const corps = {description: GIST_MARQUE, files: {}};
  corps.files[GIST_FICHIER] = {content: exportEtat()};
  let id = await trouverGist();
  if (id){
    try { await gh('/gists/' + id, {method: 'PATCH', body: JSON.stringify(corps)}); }
    catch(e){ if (!/introuvable/.test(e.message)) throw e; ghSet(K_GIST, ''); id = ''; }
  }
  if (!id){
    corps.public = false;
    const g = await gh('/gists', {method: 'POST', body: JSON.stringify(corps)});
    ghSet(K_GIST, g.id);
  }
  ghSet(K_SYNC, String(Date.now()));
  return true;
}
/* Récupère l'état depuis le Gist secret. */
async function nuageRecuperer(){
  if (!ghToken()) return null;
  const id = await trouverGist();
  if (!id) return null;
  const g = await gh('/gists/' + id);
  const f = g.files && g.files[GIST_FICHIER];
  if (!f) return null;
  const txt = f.truncated && f.raw_url ? await (await fetch(f.raw_url)).text() : f.content;
  try { return JSON.parse(txt); } catch(e){ return null; }
}

/* --- déclenchement automatique, sans y penser --- */
let syncTimer = null, syncEnCours = false, dernierEchec = '';
/* Miroir immédiat, envoi en ligne 20 s après la dernière modification. */
function planifierSync(){
  avecDelai(idbEcrire(exportEtat()), 5000, null);
  majCloud();
  if (!ghToken()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(lancerSync, 20000);
}
/* Envoie la sauvegarde en ligne si le réseau et le jeton le permettent. */
async function lancerSync(){
  if (syncEnCours || !ghToken() || navigator.onLine === false) return;
  syncEnCours = true;
  try { await nuageEnvoyer(); dernierEchec = ''; }
  catch(e){ dernierEchec = e.message || String(e); }
  finally { syncEnCours = false; majCloud(); }
}
/* Met à jour l'icône nuage de l'en-tête et la ligne d'état des réglages. */
function majCloud(){
  const b = document.getElementById('cloud');
  if (b){
    const le = +lire0(K_SYNC);
    const etat = !ghToken() ? ['cloud', 'Sauvegarde locale seulement. Toucher pour configurer.']
      : dernierEchec ? ['cloud-slash', 'Sauvegarde GitHub en erreur : ' + dernierEchec]
      : ['cloud-check', 'Sauvegarde GitHub à jour, ' + depuis(le)];
    const u = b.querySelector('use');
    if (u) u.setAttribute('href', '#i-' + etat[0]);
    b.setAttribute('aria-label', etat[1]);
    b.dataset.etat = etat[0];
  }
  const el = document.getElementById('sync-etat');
  if (el) el.innerHTML = etatSyncHTML();
}
/* Durée écoulée en français, sans tiret cadratin. */
function depuis(ts){
  if (!ts) return 'jamais';
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return 'il y a ' + m + ' min';
  const h = Math.round(m / 60);
  if (h < 24) return 'il y a ' + h + ' h';
  return 'il y a ' + Math.round(h / 24) + ' j';
}
/* Ligne d'état de la sauvegarde, affichée dans les Réglages. */
function etatSyncHTML(){
  const le = +lire0(K_SYNC);
  if (!ghToken()) return '<p class="small muted">Sauvegarde locale uniquement. Ta progression n\'existe que sur cet appareil.</p>';
  if (dernierEchec) return '<p class="small" style="color:var(--ko-text)">Dernière sauvegarde en ligne bloquée : ' + esc(dernierEchec) + '</p>';
  return '<p class="small" style="color:var(--ok-text)">Sauvegarde GitHub active. Dernière : <strong>' + esc(depuis(le)) + '</strong>.</p>';
}
/* Lecture tolérante d'une clé localStorage. */
function lire0(k){ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } }

/* ---------- export et import ---------- */
/* Fichier de sauvegarde : {v, app, etat}. */
function exportEtat(){ return JSON.stringify({v: SCHEMA, app: 'mzs', etat: S}); }
/* Remplace l'état courant par celui d'un fichier de sauvegarde. Retourne true, ou lève un message lisible. */
function importEtat(txt){
  let d = null;
  try { d = typeof txt === 'string' ? JSON.parse(txt) : txt; } catch(e){ throw new Error("Ce fichier n'est pas une sauvegarde de l'app."); }
  const brut = d && (d.etat || (d.skills ? d : null));
  if (!brut || d.app && d.app !== 'mzs') throw new Error("Ce fichier n'est pas une sauvegarde de l'app.");
  migrer(_etatAdopter(brut));
  if (typeof marquerJalonsPasses === 'function') marquerJalonsPasses();
  save(); save.flush();
  return true;
}

/* --- récupération au démarrage si l'appareil a tout effacé --- */
/* Un état est vide s'il ne contient aucune compétence travaillée. */
function estVide(e){ return !e || !e.skills || Object.keys(e.skills).length === 0; }
/* Restaure depuis le miroir puis depuis le Gist, seulement si l'état local est vide. */
async function recupererSiVide(){
  if (!estVide(S)) return null;
  const local = await avecDelai(idbLire(), 3000, null);
  if (local){
    try { const o = JSON.parse(local); if (!estVide(o.etat || o)){ migrer(_etatAdopter(o.etat || o)); if (typeof marquerJalonsPasses === 'function') marquerJalonsPasses(); save(); return 'miroir'; } } catch(e){}
  }
  try { const d = await nuageRecuperer(); if (d && !estVide(d.etat || d)){ migrer(_etatAdopter(d.etat || d)); if (typeof marquerJalonsPasses === 'function') marquerJalonsPasses(); save(); return 'nuage'; } } catch(e){}
  return null;
}

/* ---------- migration au chargement ---------- */
/* Instant de la dernière visite, lu avant que pagehide ne l'écrase (retour après absence, M6). */
window.VU_LE = S.vuLe || 0;
migrer();
/* Alias de compatibilité : l'ancien nom de majCloud, sans déclaration lexicale. */
window.majPastille = majCloud;
