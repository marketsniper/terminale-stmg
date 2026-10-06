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
   Mode embarqué : l'app tourne dans le cadre « Maths » de l'app STMG
   (iframe de même origine, ./maths/?embed=1 ; drapeau data-embed posé par index.html).
   Ouverte seule (/maths/, ancienne app installée), rien de ce bloc ne s'exécute.
   Messages échangés, même origine uniquement :
     maths vers STMG : {source:'mzs', type:'pret' | 'theme' | 'fermer', theme, couleur}
     STMG vers maths : {source:'stmg', type:'aller', go:'ds', skill:'<id de compétence>'}
   ------------------------------------------------------------ */
const _appEmbarque = document.documentElement.dataset.embed === '1';

/* Un seul historique : celui de l'app STMG. Le retour du téléphone referme le mode Maths ;
   à l'intérieur, on circule avec les onglets et les boutons Retour et Quitter de l'en-tête. */
if (_appEmbarque){
  try { history.pushState = function(etat, titre, url){ return history.replaceState(etat, titre, url); }; } catch(e){}
}

function _appVersStmg(type){
  if (!_appEmbarque) return;
  let theme = 'light', couleur = '';
  try { theme = themeActuel(); } catch(e){}
  try { couleur = document.getElementById('meta-theme').getAttribute('content') || ''; } catch(e){}
  try { window.parent.postMessage({source: 'mzs', type: type, theme: theme, couleur: couleur}, location.origin); } catch(e){}
}

/* Retour vers l'app STMG : la progression est écrite avant, la carte d'entrée la relit aussitôt. */
function _appRetourStmg(){
  try { save.flush(); } catch(e){}
  _appVersStmg('fermer');
}

/* « DS en vue » ouvert sur un chapitre (lien « S'entraîner sur ce chapitre » des fiches STMG,
   ou ?go=ds&skill=<id>). Traitement minimal : on ouvre l'écran, puis on choisit le chapitre s'il y figure.
   Chapitre encore fermé sur le sentier : on le dit, et on propose sa leçon, qui se lit déjà. */
function _appAllerDS(skill){
  const id = String(skill || '');
  let ancien = null;
  /* on laisse finir la transition de vue en cours : l'interrompre lève une erreur dans le navigateur */
  let fin = null;
  try { fin = _rtVT && _rtVT.finished; } catch(e){}
  return Promise.resolve(fin).catch(() => {}).then(() => {
    ancien = document.getElementById('md-go');          // écran « DS en vue » déjà affiché : on attend le nouveau
    return nav('ds', {skill: id, remplace: true});
  }).then(ok => {
    if (ok === false || !id) return;
    let essais = 0;
    const viser = () => {
      if (currentView !== 'ds') return;
      const go = document.getElementById('md-go');
      if ((!go || go === ancien) && essais++ < 30){ setTimeout(viser, 50); return; }   // pas encore rendu
      const b = Array.prototype.find.call(document.querySelectorAll('[data-ds]'), x => x.dataset.ds === id);
      if (b){
        const d = b.closest('details'); if (d) d.open = true;
        if (b.getAttribute('aria-pressed') !== 'true') b.click();
        try { b.scrollIntoView({block: 'center'}); } catch(e){}
        return;
      }
      if (!document.querySelector('[data-ds]')) return;   // aucun chapitre ouvert : l'écran le dit déjà
      if ((window.SKILLS || []).some(s => s.id === id))
        toast('Ce chapitre n\'est pas encore ouvert sur ton sentier.',
              {tone: 'glacier', icon: 'lock-simple', action: {label: 'Lire la leçon', fn(){ nav('skill', {id: id}); }}});
      else toast('Choisis le chapitre de ton contrôle dans la liste.', {tone: 'glacier'});
    };
    viser();
  });
}

function _appInitEmbarque(){
  if (!_appEmbarque) return;
  const b = document.getElementById('btn-stmg');
  if (b) b.hidden = false;
  const brand = document.getElementById('brand');
  if (brand){ brand.textContent = 'Maths'; brand.setAttribute('aria-label', 'Maths, De zéro au sommet : Aujourd\'hui'); }

  /* tout élément [data-stmg] ramène à l'app STMG (bouton de l'en-tête, bouton posé sur l'onboarding) */
  document.addEventListener('click', e => {
    const c = e.target && e.target.closest ? e.target.closest('[data-stmg]') : null;
    if (!c) return;
    e.preventDefault();
    try { snd.click(); } catch(x){}
    _appRetourStmg();
  });

  /* l'onboarding recouvre l'en-tête : il reçoit son propre retour, reposé à chaque écran */
  const hote = document.getElementById('app');
  const poser = () => {
    const onb = hote && hote.querySelector('.onb');
    if (!onb || onb.querySelector('.onb-stmg')) return;
    const r = document.createElement('button');
    r.type = 'button'; r.className = 'btn btn-ghost onb-stmg'; r.setAttribute('data-stmg', '');
    r.setAttribute('aria-label', 'Revenir à l\'app STMG');
    r.innerHTML = ic('caret-left', 'ic-20') + '<span>STMG</span>';
    onb.appendChild(r);
  };
  try { new MutationObserver(poser).observe(hote, {childList: true}); } catch(e){}
  poser();

  /* le thème change (bouton, Réglages, système) : la barre d'état du téléphone appartient au parent */
  try {
    new MutationObserver(() => _appVersStmg('theme'))
      .observe(document.getElementById('meta-theme'), {attributes: true, attributeFilter: ['content']});
  } catch(e){}

  /* ordres de l'app STMG */
  addEventListener('message', e => {
    if (e.origin !== location.origin || e.source !== window.parent) return;
    const d = e.data;
    if (!d || d.source !== 'stmg') return;
    if (d.type === 'aller' && d.go === 'ds'){
      let onboarde = false;
      try { onboarde = !!((S.profil && S.profil.onboard) || S.onboard); } catch(x){}
      if (onboarde) _appAllerDS(d.skill);
    }
  });

  /* Premier écran affiché (bus « vue » du routeur) : l'app STMG est prévenue, puis la demande de l'adresse
     (./?embed=1&go=ds&skill=<id>, lien « S'entraîner sur ce chapitre ») est servie et retirée de l'adresse :
     un rechargement de l'app ne rouvre pas le DS. Si initApp a déjà ouvert « DS en vue » lui-même, rien à faire. */
  const demande = new URLSearchParams(location.search);
  const finEcoute = ecouter('vue', p => {
    finEcoute();
    _appVersStmg('pret');
    try { history.replaceState(history.state, '', location.pathname + '?embed=1' + location.hash); } catch(e){}
    if (demande.get('go') !== 'ds' || !p || p.v === 'onboarding' || p.v === 'ds') return;
    _appAllerDS(demande.get('skill'));
  });
}
/* app.js est chargé en « defer » : le document est déjà lu, et initApp (fin de ce fichier) n'a pas encore tourné. */
if (_appEmbarque) _appInitEmbarque();

/* Carte d'entrée de l'app STMG (même origine) : elle calcule l'altitude sans charger cette app. On lui laisse
   le nombre de compétences par phase (clé 'mzsa-nb'), pour qu'elle reste juste quand le catalogue grandit. */
try {
  const nbPhases = JSON.stringify([1, 2, 3, 4, 5, 6, 7].map(p => (window.SKILLS || []).filter(s => s.phase === p).length));
  if (localStorage.getItem('mzsa-nb') !== nbPhases) localStorage.setItem('mzsa-nb', nbPhases);
} catch(e){}

/* Liens internes à un écran (sommaire de « La méthode », « Aller au contenu ») : on défile jusqu'à la cible
   sans changer l'adresse. Sinon le routeur prend ce changement d'adresse pour un retour en arrière et renvoie
   à Aujourd'hui ; et, embarquée, l'app empilerait une entrée dans l'historique de l'app STMG. */
document.addEventListener('click', e => {
  const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
  const id = a ? a.getAttribute('href').slice(1) : '';
  const cible = id ? document.getElementById(id) : null;
  if (!cible || e.defaultPrevented) return;
  e.preventDefault();
  const tete = document.getElementById('head');
  const haut = Math.max(0, cible.getBoundingClientRect().top + scrollY - (tete ? tete.getBoundingClientRect().height : 0) - 12);
  try { scrollTo({top: haut}); } catch(x){ scrollTo(0, haut); }
  if (!cible.hasAttribute('tabindex')) cible.tabIndex = -1;
  try { cible.focus({preventScroll: true}); } catch(x){}
});

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
    if (_appEmbarque) nav((_uiCtx && _uiCtx.parent) || 'programme');
    else if (history.length > 1 && history.state) history.back();
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
    const suivant = (typeof themeSuivant === 'function') ? themeSuivant() : (t === 'light' ? 'dark' : t === 'dark' ? 'auto' : 'light');
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
  let choisi = actuel;            // retenu à chaque changement : la feuille est retirée du DOM avant la suite
  const ligne = (v, nom, min) =>
    '<label><input type="radio" name="obj" value="' + v + '"' + (actuel === v ? ' checked' : '') +
    '><span>' + nom + '<b class="num">' + v + '</b><span class="small muted">' + min + ' min</span></span></label>';
  ouvrirFeuille({
    classe: 'sheet-objectif', titre: 'Objectif du jour',
    texte: 'Le nombre de bonnes réponses qui remplit l\'anneau.',
    contenu: '<div class="segment" role="radiogroup" aria-label="Objectif du jour">' +
             ligne(10, 'Balade', 5) + ligne(25, 'Marche', 12) + ligne(50, 'Ascension', 25) + '</div>',
    boutons: [{label: 'Annuler'}, {label: 'Choisir', style: 'primaire'}],
    apres(dlg){ dlg.querySelectorAll('input[name="obj"]').forEach(i => i.addEventListener('change', () => { if (i.checked) choisi = Number(i.value); })); }
  }).then(i => {
    if (i !== 1) return;
    const v = choisi;
    let duJour = v;               // choisirObjectif ne dévalide jamais une journée déjà gagnée
    try { duJour = window.choisirObjectif(v); } catch(e){}
    majAnneauJour();
    /* l'accueil affiche aussi l'objectif (« sur 25 réponses ») : on le redessine, sauf pendant un rappel en cours */
    try { const vc = window.vueCourante; if (vc && vc.v === 'accueil' && !vc.garde && document.body.dataset.ctx === 'home') nav('accueil', {remplace: true}); } catch(e){}
    toast(duJour === v ? 'Objectif du jour : ' + v + ' bonnes réponses.'
                       : 'Journée déjà gagnée. À partir de demain : ' + v + ' bonnes réponses.', {tone: 'gold', icon: 'target'});
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
    items.forEach(it => { it._k = -1; });       // sinon un numéro d'un rendu précédent lançait la mauvaise action
    let h = '', k = 0;
    groupes.forEach(g => {
      const l = gardes.filter(it => it.groupe === g).slice(0, 8);
      if (!l.length) return;
      h += '<li class="k pal-titre" role="presentation">' + g + '</li>';
      l.forEach(it => { it._k = k; h += '<li role="presentation"><button class="pal-item" type="button" role="option" aria-selected="false" data-k="' + (k++) + '">' +
        '<span>' + esc(it.label) + '</span>' + (it.sous ? '<span class="pal-grp">' + esc(it.sous) + '</span>' : '') + '</button></li>'; });
    });
    /* une seule liste défilante : plusieurs listes empilées s'écrasaient les unes les autres */
    return h ? '<ul class="pal-list" role="listbox" aria-label="Résultats">' + h + '</ul>' : '<p class="small muted">Rien ne correspond.</p>';
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
let _appMajProposee = false, _appRecharge = false, _appMajDemandee = false;
/* « Recharger » : la version en attente prend la main, puis la page se recharge une seule fois. */
function _appAppliquerMaj(reg){
  _appMajDemandee = true;
  const recharger = () => { if (_appRecharge) return; _appRecharge = true; location.reload(); };
  if (reg && reg.waiting){
    try { reg.waiting.postMessage({type: 'SKIP_WAITING'}); } catch(e){}
    setTimeout(recharger, 4000);                          // filet : si la prise de contrôle n'est jamais signalée
  } else recharger();
}
function _appProposerMaj(reg){
  if (_appMajProposee) return;
  if (window.vueCourante && window.vueCourante.enCours){
    ecouter('vue', function une(p){ if (p && p.v === 'accueil'){ window.off('vue', une); _appProposerMaj(reg); } });
    return;
  }
  _appMajProposee = true;
  toast('Nouvelle version prête.', {tone: 'glacier', icon: 'arrows-clockwise',
    action: {label: 'Recharger', fn(){ _appAppliquerMaj(reg); }}});
}
/* Pour les Réglages (« Vérifier les mises à jour ») : repropose le rechargement même si le toast a déjà été fermé. */
window.proposerMaj = function(reg){ _appMajProposee = false; _appProposerMaj(reg); };
window.surveillerMaj = function(reg){
  if (!reg) return;
  /* reg.active : une version précédente de CE service worker tourne déjà. Sans elle, c'est une première
     installation (même si un autre service worker du domaine contrôle la page) : rien à annoncer. */
  if (reg.waiting && reg.active) _appProposerMaj(reg);
  reg.addEventListener('updatefound', () => {
    const sw = reg.installing;
    if (!sw) return;
    sw.addEventListener('statechange', () => {
      if (sw.state === 'installed' && reg.active && reg.waiting) _appProposerMaj(reg);
    });
  });
  let derniere = Date.now();
  addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - derniere < 3600000) return;
    derniere = Date.now();
    try { reg.update(); } catch(e){}
  });
  /* On ne recharge que pour une mise à jour : demandée ici (« Recharger »), ou appliquée depuis une autre fenêtre
     (même script qu'avant). La prise de contrôle de la toute première installation ne recharge plus la page :
     elle renvoyait l'onboarding à l'écran 1. */
  let controleur = navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : '';
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const c = navigator.serviceWorker.controller, url = c ? c.scriptURL : '';
    const maj = _appMajDemandee || (!!controleur && controleur === url);
    controleur = url;
    if (!maj || _appRecharge) return;
    _appRecharge = true;
    location.reload();
  });
};

/* ------------------------------------------------------------
   Amorçage
   ------------------------------------------------------------ */
async function initApp(){
  /* Filet de sécurité : si l'état local est vide, on relit la copie de secours AVANT tout rendu
     (quelques millisecondes en temps normal, 1,5 s d'attente au plus si elle tarde à répondre). */
  let recup = null, source = null;
  try { recup = recupererSiVide().catch(() => null); } catch(e){}
  try {
    const r = await Promise.all([chargerSprite().catch(() => null), recup ? avecDelai(recup, 1500, 'tard') : null]);
    source = r[1];
  } catch(e){}
  try { if (typeof migrer === 'function') migrer(); } catch(e){}
  try { if (typeof initTheme === 'function') initTheme(); } catch(e){}
  initHead();
  raccourcis();

  const params = new URLSearchParams(location.search);
  const go = {seance: 'seance', cm: 'cm', erreurs: 'erreurs', ds: 'ds'}[params.get('go') || ''] || null;
  /* ./?go=ds&skill=<id de compétence> (ou &q=<mot>) : « DS en vue » ouvert sur ce chapitre (lien depuis l'app STMG). */
  const goParams = go === 'ds' ? {remplace: true, skill: params.get('skill') || '', q: params.get('q') || ''} : {remplace: true};

  let onboarde = false;
  try { onboarde = !!((S.profil && S.profil.onboard) || S.onboard); } catch(e){}
  /* Un contrôle n'attend pas : ./?go=ds ouvre « DS en vue » même avant l'accueil de bienvenue,
     qui se présentera au lancement suivant (rien n'est posé dans le profil ici). */
  if (!onboarde && go !== 'ds' && typeof window.vOnboarding === 'function') nav('onboarding', {remplace: true});
  else {
    /* le raccourci est consommé : sans lui dans l'adresse, un rechargement rend l'écran courant, pas le raccourci */
    if (go){ try { history.replaceState(history.state, '', location.pathname + location.hash); } catch(e){} }
    nav(go || routeDepuisHash() || 'accueil', goParams);
  }

  /* filets de sécurité de la sauvegarde */
  try { demanderPersistance(); } catch(e){}
  const restauree = src => toast('Progression restaurée depuis ' + (src === 'nuage' ? 'ta sauvegarde GitHub' : 'la copie de secours locale') + '.',
                                {tone: 'ok', icon: 'cloud-check', ms: 6000});
  if (source === 'tard'){
    /* la copie tarde à répondre : l'app a démarré sans elle, on rattrape si l'état est toujours vide */
    recup.then(src => {
      if (!src) return;
      try { if (typeof migrer === 'function') migrer(); } catch(e){}
      try { if (typeof initTheme === 'function') initTheme(); } catch(e){}
      try { majCrete(); majAnneauJour(); } catch(e){}
      nav('accueil', {remplace: true});
      restauree(src);
    });
  } else if (source) restauree(source);

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
