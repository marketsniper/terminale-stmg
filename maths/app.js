/* ===== Maths · De zéro au sommet — amorçage, en-tête, clavier, palette =====
   Script classique : portée globale partagée (ordre de chargement dans index.html). */
'use strict';

/* ------------------------------------------------------------
   Passerelle du Prof (assistant.js) vers le routeur
   ------------------------------------------------------------ */
window.ASSIST_GO = function(quoi, id){
  try { snd.click(); } catch(e){}
  if (quoi === 'skill') nav('skill', {id});
  else nav('techniques', {ouvrir: id});
};

/* ------------------------------------------------------------
   En-tête : marque, crête, anneau du jour, nuage, thème, son, Prof, réglages
   ------------------------------------------------------------ */
function initHead(){
  const el = id => document.getElementById(id);
  const clic = (n, fn) => { if (n) n.addEventListener('click', e => { e.preventDefault(); try { snd.click(); } catch(x){} fn(e); }); };

  creteSVG();
  majAnneauJour();

  /* navigation : marque, onglets bas, onglets desktop */
  document.querySelectorAll('.tabbar [data-v], .topnav [data-v], #brand').forEach(a =>
    clic(a, () => nav(a.dataset.v || 'accueil')));

  clic(el('btn-back'), () => {
    if (history.length > 1 && history.state) history.back();
    else nav('programme');
  });
  clic(el('btn-quit'), () => quitterParcours());
  clic(el('btn-pause'), () => ouvrirFeuille({
    classe: 'pause', titre: 'Séance en pause',
    texte: 'Le chrono est arrêté. Reprends quand tu veux.',
    boutons: [{label: 'Quitter', style: 'danger', fn: () => quitterParcours()}, {label: 'Reprendre', style: 'primaire'}]
  }));

  clic(el('cloud'), () => nav('reglages', {section: 'donnees'}));
  clic(el('btn-settings'), () => nav('reglages'));
  clic(el('ring-day'), () => _appFeuilleObjectif());

  /* thème : Aube → Nuit → Auto */
  const btnTheme = el('btn-theme');
  const majTheme = () => {
    let t = 'auto';
    try { t = (typeof themeActuel === 'function') ? themeActuel() : ((S.prefs && S.prefs.theme) || 'auto'); } catch(e){}
    const sombre = (t === 'dark') || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    const u = btnTheme && btnTheme.querySelector('use');
    if (u) u.setAttribute('href', sombre ? '#i-moon' : '#i-sun');
    if (btnTheme) btnTheme.setAttribute('aria-label',
      t === 'auto' ? 'Thème : automatique' : t === 'dark' ? 'Thème : Nuit' : 'Thème : Aube');
  };
  clic(btnTheme, e => {
    let t = 'auto';
    try { t = (typeof themeActuel === 'function') ? themeActuel() : ((S.prefs && S.prefs.theme) || 'auto'); } catch(x){}
    const suivant = t === 'light' ? 'dark' : t === 'dark' ? 'auto' : 'light';
    try {
      if (typeof sunrise === 'function' && e && e.clientX != null) sunrise(e.clientX, e.clientY, () => setTheme(suivant));
      else setTheme(suivant);
    } catch(x){}
    majTheme();
  });
  majTheme();
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', majTheme); } catch(e){}

  /* sons : coupés ↔ dernière valeur non nulle */
  const btnSon = el('btn-sound');
  let dernierSon = 'discret';
  const majSon = () => {
    let v = 'discret';
    try { v = (S.prefs && S.prefs.son) || 'discret'; } catch(e){}
    if (v !== 'off') dernierSon = v;
    if (!btnSon) return;
    btnSon.setAttribute('aria-pressed', v === 'off' ? 'false' : 'true');
    btnSon.setAttribute('aria-label', v === 'off' ? 'Sons coupés' : 'Sons activés');
    const u = btnSon.querySelector('use');
    if (u) u.setAttribute('href', v === 'off' ? '#i-speaker-slash' : '#i-speaker-high');
  };
  clic(btnSon, () => {
    try {
      S.prefs.son = (S.prefs.son === 'off') ? dernierSon : 'off';
      save();
      if (S.prefs.son !== 'off') snd.pop();
    } catch(e){}
    majSon();
  });
  majSon();

  /* Le Prof */
  const ouvrirProf = () => {
    if (typeof window.ASSIST_OUVRIR === 'function') window.ASSIST_OUVRIR();
    else { const f = el('assist-fab'); if (f && !f.hidden) f.click(); }
  };
  clic(el('btn-prof-top'), ouvrirProf);

  /* pastille réseau et état de la sauvegarde */
  pastilleReseau();
  addEventListener('online', pastilleReseau);
  addEventListener('offline', pastilleReseau);
  try { if (typeof majCloud === 'function') majCloud(); } catch(e){}

  /* appui long 500 ms sur la marque : palette sur iPhone */
  const brand = el('brand');
  if (brand){
    let tm = null;
    const stop = () => { if (tm){ clearTimeout(tm); tm = null; } };
    brand.addEventListener('touchstart', () => { tm = setTimeout(() => { tm = null; palette(); }, 500); }, {passive: true});
    brand.addEventListener('touchend', stop, {passive: true});
    brand.addEventListener('touchmove', stop, {passive: true});
  }
}

/* Feuille « Objectif du jour » (3 paliers, DESIGN-SPEC §6.8) */
function _appFeuilleObjectif(){
  let actuel = 25;
  try { actuel = (S.profil && S.profil.objectif) || 25; } catch(e){}
  const ligne = (v, nom, min) =>
    '<label><input type="radio" name="obj" value="' + v + '"' + (actuel === v ? ' checked' : '') +
    '><span>' + nom + '<b class="num">' + v + '</b><span class="small muted">' + min + ' min</span></span></label>';
  ouvrirFeuille({
    classe: 'sheet-objectif', titre: 'Objectif du jour',
    texte: 'Le nombre de bonnes réponses qui remplit l\'anneau.',
    contenu: '<div class="segment" role="radiogroup" aria-label="Objectif du jour">' +
             ligne(10, 'Balade', 5) + ligne(25, 'Marche', 12) + ligne(50, 'Ascension', 25) + '</div>',
    boutons: [{label: 'Annuler'}, {label: 'Choisir', style: 'primaire'}],
    apres(dlg){ dlg._appChoix = () => { const c = dlg.querySelector('input[name="obj"]:checked'); return c ? Number(c.value) : actuel; };
                dlg.querySelectorAll('input[name="obj"]').forEach(i => i.addEventListener('change', () => { dlg._appVal = Number(i.value); })); }
  }).then(i => {
    if (i !== 1) return;
    const c = document.querySelector('input[name="obj"]:checked');
    const v = c ? Number(c.value) : actuel;
    try { S.profil.objectif = v; const j = jToday(); j.obj = v; save(); } catch(e){}
    majAnneauJour();
    toast('Objectif du jour : ' + v + ' bonnes réponses.', {tone: 'gold', icon: 'target'});
  });
}

/* ------------------------------------------------------------
   Raccourcis clavier (PRODUCT-SPEC S3)
   ------------------------------------------------------------ */
let _appAccord = 0;
function raccourcis(){
  addEventListener('keydown', e => {
    if (e.repeat && e.key !== 'Escape') return;
    const cible = e.target;
    const champ = cible && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA' || cible.tagName === 'SELECT' || cible.isContentEditable);
    const dialogueOuvert = !!document.querySelector('dialog[open]');
    const meta = e.metaKey || e.ctrlKey;

    if (meta && e.key.toLowerCase() === 'k'){ e.preventDefault(); palette(); return; }
    if (meta && e.key.toLowerCase() === 'j'){ e.preventDefault(); if (typeof window.ASSIST_OUVRIR === 'function') window.ASSIST_OUVRIR(); return; }
    if (meta && e.key === ','){ e.preventDefault(); nav('reglages'); return; }

    if (e.key === 'Escape'){
      if (dialogueOuvert){ return; }                        // le <dialog> gère lui-même (cancel → bouton secondaire)
      if (document.body.dataset.ctx === 'parcours'){ e.preventDefault(); quitterParcours(); return; }
      if (document.body.dataset.ctx === 'lecon'){ e.preventDefault(); nav('programme'); return; }
      return;
    }
    if (e.key === 'Enter' && !meta){
      if (cible && (cible.tagName === 'BUTTON' || cible.tagName === 'A')) return;   // le clic natif suffit
      const q = window.question;
      if (q && !dialogueOuvert){
        if (q.repondu && q.repondu()){ e.preventDefault(); q.continuer(); }
        else if (champ){ /* le formulaire s'en charge */ }
        else { e.preventDefault(); q.valider(); }
      }
      return;
    }
    if (champ || dialogueOuvert || meta || e.altKey) return;

    const q = window.question;
    if (q && !q.repondu()){
      let idx = -1;
      if (/^Digit[1-4]$/.test(e.code)) idx = Number(e.code.slice(5)) - 1;
      else if (/^Numpad[1-4]$/.test(e.code)) idx = Number(e.code.slice(6)) - 1;
      else if (/^Key[A-D]$/.test(e.code)) idx = e.code.charCodeAt(3) - 65;
      if (idx >= 0){ e.preventDefault(); q.choisir(idx); return; }
    }
    if (_appAccord && /^Key[APCE]$/.test(e.code)){
      e.preventDefault();
      _appAccord = 0;
      nav({A: 'accueil', P: 'programme', C: 'erreurs', E: 'coach'}[e.code.slice(3)]);
      return;
    }
    if (e.code === 'KeyG'){ _appAccord = 1; setTimeout(() => { _appAccord = 0; }, 800); return; }
    if (e.code === 'KeyT'){ e.preventDefault(); const b = document.getElementById('btn-theme'); if (b) b.click(); return; }
    if (e.code === 'KeyS'){ e.preventDefault(); const b = document.getElementById('btn-sound'); if (b) b.click(); return; }
    if (e.key === '?'){ e.preventDefault(); _appAide(); return; }
    if (/^Digit[1-4]$/.test(e.code)){
      e.preventDefault();
      nav(['accueil', 'programme', 'erreurs', 'coach'][Number(e.code.slice(5)) - 1]);
    }
  });
}

function _appAide(){
  const l = [['↵', 'Valider puis continuer'], ['1 à 4', 'Choisir une réponse'], ['Échap', 'Fermer, ou quitter le parcours'],
             ['⌘K', 'Palette de recherche'], ['⌘J', 'Le Prof'], ['⌘,', 'Réglages'],
             ['T', 'Changer de thème'], ['S', 'Couper ou remettre les sons'], ['G puis A P C E', 'Aller à un onglet']];
  ouvrirFeuille({
    classe: 'sheet-aide', titre: 'Raccourcis clavier',
    contenu: '<dl class="kbd-list">' + l.map(x => '<div><dt><kbd>' + x[0] + '</kbd></dt><dd>' + x[1] + '</dd></div>').join('') + '</dl>',
    boutons: [{label: 'Fermer'}]
  });
}

/* ------------------------------------------------------------
   Palette ⌘K (PRODUCT-SPEC S3)
   ------------------------------------------------------------ */
function palette(){
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const items = [];
  const push = (groupe, label, sous, fn) => items.push({groupe, label, sous: sous || '', fn, idx: norm(label + ' ' + (sous || ''))});

  push('Actions', 'Lancer la séance du jour', '', () => nav('seance'));
  push('Actions', '5 minutes chrono', '', () => nav('micro'));
  push('Actions', 'Calcul mental', '', () => nav('cm'));
  push('Actions', 'Épreuve blanche', '', () => nav('epreuve'));
  push('Actions', 'Cahier d\'erreurs', '', () => nav('erreurs'));
  push('Actions', 'Réglages', '', () => nav('reglages'));
  push('Actions', 'Comment ça marche', '', () => nav('methode'));
  try { (window.SKILLS || []).forEach(s => push('Compétences', s.titre, 'Phase ' + s.phase, () => nav('skill', {id: s.id}))); } catch(e){}
  try { (window.CM_FAMS || []).forEach(f => push('Techniques', f.nom || f.titre || f.id, f.cat || '', () => nav('techniques', {ouvrir: f.id}))); } catch(e){}
  try { (S.erreurs || []).slice(0, 5).forEach(er => push('Erreurs', er.q.split('\n')[0].slice(0, 60), '', () => nav('erreurs'))); } catch(e){}

  const rendu = q => {
    const mots = norm(q).split(/\s+/).filter(Boolean);
    const gardes = items.filter(it => mots.every(m => it.idx.indexOf(m) >= 0));
    const groupes = ['Actions', 'Compétences', 'Techniques', 'Erreurs'];
    let h = '', k = 0;
    groupes.forEach(g => {
      const l = gardes.filter(it => it.groupe === g).slice(0, 8);
      if (!l.length) return;
      h += '<p class="k">' + g + '</p><ul class="pal-list" role="listbox">';
      l.forEach(it => { it._k = k; h += '<li><button class="pal-item" type="button" role="option" aria-selected="false" data-k="' + (k++) + '">' +
        '<span>' + esc(it.label) + '</span>' + (it.sous ? '<span class="small muted">' + esc(it.sous) + '</span>' : '') + '</button></li>'; });
      h += '</ul>';
    });
    return h || '<p class="small muted">Rien ne correspond.</p>';
  };

  ouvrirFeuille({
    classe: 'palette', aria: 'Palette de recherche',
    contenu: '<input class="input pal-input" type="search" data-focus autocomplete="off" spellcheck="false"' +
             ' aria-label="Rechercher une compétence, une technique ou une action" placeholder="Rechercher…">' +
             '<div class="pal-res">' + rendu('') + '</div>',
    boutons: [{label: 'Fermer'}],
    apres(dlg){
      const champ = dlg.querySelector('.pal-input'), res = dlg.querySelector('.pal-res');
      let sel = 0;
      const marquer = () => {
        const b = res.querySelectorAll('.pal-item');
        b.forEach((x, i) => { x.classList.toggle('cur', i === sel); x.setAttribute('aria-selected', i === sel ? 'true' : 'false'); });
        if (b[sel]) b[sel].scrollIntoView({block: 'nearest'});
      };
      const lancer = i => {
        const b = res.querySelectorAll('.pal-item')[i];
        if (!b) return;
        const it = items.find(x => x._k === Number(b.dataset.k));
        fermerFeuille(0);
        if (it) setTimeout(it.fn, 0);
      };
      res.addEventListener('click', e => { const b = e.target.closest('.pal-item'); if (b) lancer(Array.from(res.querySelectorAll('.pal-item')).indexOf(b)); });
      champ.addEventListener('input', () => { res.innerHTML = rendu(champ.value); sel = 0; marquer(); });
      champ.addEventListener('keydown', e => {
        const n = res.querySelectorAll('.pal-item').length;
        if (e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(n - 1, sel + 1); marquer(); }
        else if (e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(0, sel - 1); marquer(); }
        else if (e.key === 'Enter'){ e.preventDefault(); lancer(sel); }
      });
      marquer();
    }
  });
}

/* ------------------------------------------------------------
   Mise à jour du service worker (PRODUCT-SPEC M12)
   ------------------------------------------------------------ */
let _appMajProposee = false, _appRecharge = false;
function _appProposerMaj(reg){
  if (_appMajProposee) return;
  if (window.vueCourante && window.vueCourante.enCours){
    ecouter('vue', function une(p){ if (p && p.v === 'accueil'){ window.off('vue', une); _appProposerMaj(reg); } });
    return;
  }
  _appMajProposee = true;
  toast('Nouvelle version prête.', {tone: 'glacier', icon: 'arrows-clockwise',
    action: {label: 'Recharger', fn(){
      if (reg && reg.waiting) reg.waiting.postMessage({type: 'SKIP_WAITING'});
      else location.reload();
    }}});
}
window.surveillerMaj = function(reg){
  if (!reg) return;
  if (reg.waiting && navigator.serviceWorker.controller) _appProposerMaj(reg);
  reg.addEventListener('updatefound', () => {
    const sw = reg.installing;
    if (!sw) return;
    sw.addEventListener('statechange', () => {
      if (sw.state === 'installed' && navigator.serviceWorker.controller) _appProposerMaj(reg);
    });
  });
  let derniere = Date.now();
  addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - derniere < 3600000) return;
    derniere = Date.now();
    try { reg.update(); } catch(e){}
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (_appRecharge) return;
    _appRecharge = true;
    location.reload();
  });
};

/* ------------------------------------------------------------
   Amorçage
   ------------------------------------------------------------ */
async function initApp(){
  try { await chargerSprite(); } catch(e){}
  try { if (typeof migrer === 'function') migrer(); } catch(e){}
  try { if (typeof initTheme === 'function') initTheme(); } catch(e){}
  initHead();
  raccourcis();

  const params = new URLSearchParams(location.search);
  const go = {seance: 'seance', cm: 'cm', erreurs: 'erreurs'}[params.get('go') || ''] || null;

  let onboarde = false;
  try { onboarde = !!((S.profil && S.profil.onboard) || S.onboard); } catch(e){}
  if (!onboarde && typeof window.vOnboarding === 'function') nav('onboarding', {remplace: true});
  else nav(go || routeDepuisHash() || 'accueil', {remplace: true});

  /* filets de sécurité de la sauvegarde */
  try { demanderPersistance(); } catch(e){}
  try {
    recupererSiVide().then(src => {
      if (!src) return;
      try { if (typeof migrer === 'function') migrer(); } catch(e){}
      nav('accueil', {remplace: true});
      toast('Progression restaurée depuis ' + (src === 'nuage' ? 'ta sauvegarde GitHub' : 'la copie de secours locale') + '.',
            {tone: 'ok', icon: 'cloud-check', ms: 6000});
    });
  } catch(e){}

  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden'){ try { lancerSync(); } catch(e){} } });
  addEventListener('pagehide', () => { try { lancerSync(); } catch(e){} });
}

let _appErreurVue = false;
addEventListener('error', () => {
  if (_appErreurVue) return;
  _appErreurVue = true;
  try {
    toast('Une erreur est survenue. Ta progression est sauvegardée.',
          {tone: 'ko', icon: 'warning', action: {label: 'Recharger', fn(){ location.reload(); }}});
  } catch(e){}
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
