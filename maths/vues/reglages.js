/* ===== Maths · De zéro au sommet : Réglages (PRODUCT-SPEC M12, M13, DESIGN-SPEC §7.16) =====
   Script classique : portée globale partagée (ordre de chargement dans index.html).
   Ce fichier ne déclare au premier niveau que : vReglages.
   Tout le reste est préfixé _reg, ou posé sur window sans déclaration lexicale. */
'use strict';

/* ============================================================
   0. Invite d'installation (Chrome, Edge, Android)
   Captée une seule fois, même si core/installation.js arrive un jour.
   ============================================================ */
if (!window.__regBipPose){
  window.__regBipPose = true;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.PROMPT_INSTALL = e; });
}

/* ============================================================
   1. Petits utilitaires
   ============================================================ */
function _regLire(k){ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } }
function _regEcrire(k, v){ try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch(e){} }
function _regInstallee(){
  try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch(e){ return false; }
}
function _regIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Mac/.test(navigator.platform) && navigator.maxTouchPoints > 1); }
function _regSafari(){ return /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent); }
function _regGrossier(){ try { return matchMedia('(pointer: coarse)').matches; } catch(e){ return false; } }

/* Altitude d'un état venu d'un fichier : même formule que core/pedagogie.js, sans toucher à S. */
function _regAltitudeDe(etat){
  try {
    let t = 0;
    (window.SKILLS || []).forEach(sk => {
      const s = (etat.skills || {})[sk.id];
      if (!s) return;
      const m = window.mSkill(sk.id);
      t += (s.mastered || s.provisoire) ? m : Math.min(2 * (s.ok || 0), Math.floor(m / 2));
    });
    return Math.round(t);
  } catch(e){ return 0; }
}
function _regAcquises(etat){
  try { return (window.SKILLS || []).filter(sk => ((etat.skills || {})[sk.id] || {}).mastered).length; } catch(e){ return 0; }
}

/* ============================================================
   2. Fabriques de lignes (DESIGN-SPEC §6.24 et §7.16)
   ============================================================ */
function _regSec(id, titre, corps){
  return '<section class="set-sec" id="' + id + '">' +
    '<h2>' + esc(titre) + '<span class="chip" data-tone="ok" data-ok hidden role="status">Enregistré</span></h2>' +
    corps + '</section>';
}
function _regRow(label, sous, controle){
  return '<div class="set-row"><div><span class="label">' + esc(label) + '</span>' +
    (sous ? '<span class="small">' + esc(sous) + '</span>' : '') + '</div>' + controle + '</div>';
}
function _regSegment(nom, options, valeur, aria){
  return '<div class="segment" role="radiogroup" aria-label="' + esc(aria || nom) + '">' +
    options.map(o => '<label><input type="radio" name="' + nom + '" value="' + esc(o[0]) + '"' +
      (String(o[0]) === String(valeur) ? ' checked' : '') + '><span>' + esc(o[1]) +
      (o[2] ? '<b class="num">' + esc(o[2]) + '</b>' : '') + '</span></label>').join('') + '</div>';
}
function _regSwitch(id, texte, coche){
  return '<label class="switch"><input type="checkbox" role="switch" id="' + id + '"' + (coche ? ' checked' : '') +
    '><span class="track"><span class="thumb"></span></span><span class="switch-t sr-only">' + esc(texte) + '</span></label>';
}
function _regChampCle(id, label, valeur, aide){
  return '<label class="field"><span class="label">' + esc(label) + '</span>' +
    '<span class="row"><input class="input" id="' + id + '" type="password" value="' + esc(valeur) +
    '" autocomplete="off" spellcheck="false" placeholder="Colle ta clé ici">' +
    '<button class="btn-icon" type="button" data-oeil="' + id + '" aria-label="Afficher la clé">' + ic('eye', 'ic-20') + '</button></span>' +
    (aide ? '<span class="small muted">' + esc(aide) + '</span>' : '') + '</label>';
}

/* Chip « Enregistré » 1 200 ms en tête de section. */
function _regOk(secId){
  const c = document.querySelector('#' + secId + ' [data-ok]');
  if (!c) return;
  c.hidden = false;
  after(1200, () => { c.hidden = true; });
}

/* Icône du bouton de thème de l'en-tête, resynchronisée après un changement ici. */
function _regMajIconeTheme(){
  const b = document.getElementById('btn-theme');
  if (!b) return;
  let t = 'auto';
  try { t = (S.prefs && S.prefs.theme) || 'auto'; } catch(e){}
  const sombre = themeActuel() === 'dark';
  const u = b.querySelector('use');
  if (u) u.setAttribute('href', sombre ? '#i-moon' : '#i-sun');
  b.setAttribute('aria-label', t === 'auto' ? 'Thème : automatique' : t === 'dark' ? 'Thème : Nuit' : 'Thème : Aube');
}

/* ============================================================
   3. La vue
   ============================================================ */
function vReglages(params){
  const p = params || {}, cible = app();
  if (!cible) return;
  setCtx('outil');
  cible.dataset.density = 'outil';
  cible.className = 'view view-reglages';

  const pr = S.profil, pf = S.prefs;
  const auj = todayKey();
  const jc = joursAvant(pr.concours), jb = joursAvant(pr.bac);
  const verrouille = (window.SKILLS || []).some(s => { const x = st(s.id); return x.mastered && !x.provisoire; });
  const vibre = ('vibrate' in navigator);
  const installee = _regInstallee();

  /* 1. Profil */
  const profil =
    '<label class="field"><span class="label">Ton prénom</span>' +
      '<input class="input" id="reg-prenom" type="text" maxlength="24" autocomplete="given-name" value="' +
      esc(pr.prenom || '') + '" placeholder="Ilan"></label>' +
    _regRow('Objectif du jour', 'Le nombre de bonnes réponses qui remplit l\'anneau.',
      _regSegment('reg-obj', [[10, 'Balade', '10'], [25, 'Marche', '25'], [50, 'Ascension', '50']], pr.objectif, 'Objectif du jour')) +
    _regRow('Date du concours', jc === null ? '' : (jc < 0 ? 'Concours passé' : 'Dans ' + fv(jc) + ' jours'),
      '<input class="input" id="reg-concours" type="date" min="' + auj + '" max="2028-12-31" value="' + esc(pr.concours || '') + '">') +
    _regRow('Date du bac', jb === null ? '' : (jb < 0 ? 'Bac passé' : 'Dans ' + fv(jb) + ' jours'),
      '<input class="input" id="reg-bac" type="date" min="' + auj + '" max="2028-12-31" value="' + esc(pr.bac || '') + '">');

  /* 2. Apparence */
  const apparence =
    _regRow('Thème', 'Aube le jour, Nuit le soir.',
      _regSegment('reg-theme', [['auto', 'Auto'], ['light', 'Aube'], ['dark', 'Nuit']], pf.theme || 'auto', 'Thème')) +
    _regRow('Animations', 'Réduites : tout devient instantané.',
      _regSegment('reg-anim', [['auto', 'Auto'], ['reduit', 'Réduites']], pf.animations || 'auto', 'Animations')) +
    (_regGrossier() ? '' : _regRow('Raccourcis clavier visibles', 'Les pastilles sous les réponses.',
      _regSwitch('reg-kbd', 'Raccourcis clavier visibles', pf.raccourcis !== false)));

  /* 3. Sons et retours */
  const sons =
    _regRow('Sons', 'Discrets : seulement les moments qui comptent.',
      _regSegment('reg-son', [['off', 'Coupés'], ['discret', 'Discrets'], ['complet', 'Complets']], pf.son || 'discret', 'Sons')) +
    '<div class="row"><button class="btn sm" type="button" id="reg-ecouter">' + ic('speaker-high') + 'Écouter</button></div>' +
    (vibre
      ? _regRow('Vibrations', 'Une pulsation courte aux moments clés.', _regSwitch('reg-vib', 'Vibrations', pf.haptique !== false))
      : _regRow('Vibrations', 'Non disponible sur iPhone.', '<span class="small muted">Indisponible</span>'));

  /* 4. Séance */
  const seance =
    _regRow('Indices dans les exercices', 'Trois paliers, du coup de pouce à la méthode.',
      _regSwitch('reg-indices', 'Indices dans les exercices', pf.indices !== false)) +
    _regRow('Astuces de calcul mental', 'Auto : elles s\'effacent dès que la famille est fiable.',
      _regSegment('reg-cmi', [['auto', 'Auto'], ['oui', 'Toujours'], ['non', 'Jamais']], pf.cmIndices || 'auto', 'Astuces de calcul mental')) +
    _regRow('Bouton Le Prof', 'Le bouton rond pendant les exercices et les leçons.',
      _regSwitch('reg-prof', 'Bouton Le Prof', pf.prof !== false));

  /* 5. Données */
  const donnees =
    '<div id="sync-etat">' + etatSyncHTML() + '</div>' +
    '<div class="row">' +
      '<button class="btn" type="button" id="reg-export">' + ic('download-simple') + 'Exporter ma progression</button>' +
      '<button class="btn" type="button" id="reg-import">' + ic('upload-simple') + 'Importer une sauvegarde</button>' +
    '</div>' +
    '<input type="file" id="reg-fichier" accept="application/json,.json" hidden>' +
    '<details><summary>Sauvegarde automatique GitHub (avancé)</summary>' +
      '<p class="small muted">Une copie chiffrée par ton compte, dans un Gist secret. Utile si tu changes d\'appareil.</p>' +
      _regChampCle('reg-tok', 'Jeton GitHub', '', 'Un jeton personnel avec la seule permission « gist ». Il reste sur cet appareil.') +
      '<div class="row">' +
        '<button class="btn sm" type="button" id="reg-gh-on">Activer la sauvegarde</button>' +
        '<button class="btn sm" type="button" id="reg-gh-push">Envoyer maintenant</button>' +
        '<button class="btn sm" type="button" id="reg-gh-pull">Récupérer ma sauvegarde</button>' +
        '<button class="btn sm btn-ghost" type="button" id="reg-gh-off">Désactiver</button>' +
      '</div>' +
    '</details>' +
    '<div class="row">' +
      '<button class="btn" type="button" id="reg-bilan"' + (verrouille ? ' disabled' : '') + '>' +
        ic('mountains') + 'Refaire le bilan d\'altitude</button>' +
    '</div>' +
    (verrouille ? '<p class="small muted">Ton parcours est engagé : le bilan ne remplace plus tes verrous.</p>' : '') +
    '<div class="row"><button class="btn btn-danger" type="button" id="reg-raz">' + ic('trash') +
      'Réinitialiser l\'application</button></div>';

  /* 6. Le Prof */
  const pref = _regLire('mzs-ia-pref') || 'local';
  const prof =
    _regChampCle('reg-groq', 'Clé Groq', _regLire('mzs-cle-groq'), '') +
    _regChampCle('reg-claude', 'Clé Claude', _regLire('mzs-cle-api'), '') +
    _regRow('Moteur', 'Local : hors ligne, toujours disponible.',
      _regSegment('reg-moteur', [['local', 'Local'], ['groq', 'Groq'], ['claude', 'Claude']], pref, 'Moteur du Prof')) +
    _regRow('Recherche web', 'Le Prof peut aller vérifier une définition en ligne.',
      _regSwitch('reg-web', 'Recherche web', _regLire('mzs-web') === '1')) +
    '<div class="row"><button class="btn sm" type="button" id="reg-test-cle">' + ic('key') + 'Tester la clé</button></div>' +
    '<p class="small muted">Groq est gratuit et sans carte bancaire. Les clés restent sur cet appareil.</p>';

  /* 7. À propos */
  const depuisLe = S.debut ? new Date(S.debut).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) : '';
  const apropos =
    '<p class="small muted">Version ' + esc(window.APP_VERSION || '2.0.0') +
      (depuisLe ? ' · première ouverture le ' + esc(depuisLe) : '') + '</p>' +
    '<div class="row">' +
      '<button class="btn btn-ghost" type="button" id="reg-maj">' + ic('arrows-clockwise') + 'Vérifier les mises à jour</button>' +
      '<button class="btn btn-ghost" type="button" id="reg-news">' + ic('info') + 'Nouveautés</button>' +
      '<button class="btn btn-ghost" type="button" id="reg-methode">' + ic('book-open') + 'Comment ça marche</button>' +
      '<button class="btn btn-ghost" type="button" id="reg-onb">' + ic('footprints') + 'Revoir le premier pas</button>' +
      '<button class="btn btn-ghost" type="button" id="reg-install"' + (installee ? ' disabled' : '') + '>' +
        ic('plus-square') + (installee ? 'Installée' : 'Installer sur l\'écran d\'accueil') + '</button>' +
      '<button class="btn btn-ghost" type="button" id="reg-demo">' + ic('projector-screen') + 'Mode présentation</button>' +
    '</div>';

  cible.innerHTML =
    '<h1>Réglages</h1>' +
    _regSec('set-profil', 'Profil', profil) +
    _regSec('set-apparence', 'Apparence', apparence) +
    _regSec('set-sons', 'Sons et retours', sons) +
    _regSec('set-seance', 'La séance', seance) +
    _regSec('set-donnees', 'Tes données', donnees) +
    _regSec('set-prof', 'Le Prof', prof) +
    _regSec('set-apropos', 'À propos', apropos);

  _regBrancher();

  /* Ancre demandée par l'appelant (#cloud, chip de mode du Prof). */
  const ancre = p.section === 'donnees' ? 'set-donnees' : p.section === 'prof' ? 'set-prof' : p.section ? 'set-' + p.section : '';
  if (ancre){
    const el = document.getElementById(ancre);
    if (el) after(60, () => { try { el.scrollIntoView({block: 'start', behavior: 'smooth'}); } catch(e){} });
  }
}

/* ============================================================
   4. Écouteurs
   ============================================================ */
function _regBrancher(){
  const zone = app();
  const el = id => document.getElementById(id);
  const sur = (id, ev, fn) => { const n = el(id); if (n) n.addEventListener(ev, fn); };

  /* --- œil des champs de clé --- */
  zone.querySelectorAll('[data-oeil]').forEach(b => b.addEventListener('click', () => {
    const champ = el(b.dataset.oeil);
    if (!champ) return;
    const cache = champ.type === 'password';
    champ.type = cache ? 'text' : 'password';
    b.setAttribute('aria-label', cache ? 'Masquer la clé' : 'Afficher la clé');
    const u = b.querySelector('use');
    if (u) u.setAttribute('href', cache ? '#i-eye-slash' : '#i-eye');
  }));

  /* --- 1. Profil --- */
  sur('reg-prenom', 'change', e => { S.profil.prenom = e.target.value.trim().slice(0, 24); save(); _regOk('set-profil'); });
  zone.querySelectorAll('input[name="reg-obj"]').forEach(r => r.addEventListener('change', () => {
    window.choisirObjectif(Number(r.value));
    majAnneauJour();
    _regOk('set-profil');
    toast('Objectif du jour : ' + r.value + ' bonnes réponses.', {tone: 'gold', icon: 'target'});
  }));
  sur('reg-concours', 'change', e => { S.profil.concours = e.target.value; save(); _regOk('set-profil'); vReglages(); });
  sur('reg-bac', 'change', e => { S.profil.bac = e.target.value; save(); _regOk('set-profil'); vReglages(); });

  /* --- 2. Apparence --- */
  zone.querySelectorAll('input[name="reg-theme"]').forEach(r => r.addEventListener('change', () => {
    setTheme(r.value); _regMajIconeTheme(); _regOk('set-apparence');
  }));
  zone.querySelectorAll('input[name="reg-anim"]').forEach(r => r.addEventListener('change', () => {
    S.prefs.animations = r.value;
    if (r.value === 'reduit') document.documentElement.dataset.motion = 'reduit';
    else delete document.documentElement.dataset.motion;
    _regEcrire('mzs-motion', r.value === 'reduit' ? 'reduit' : '');
    try { window.majReduce(); } catch(e){}
    save(); _regOk('set-apparence');
  }));
  sur('reg-kbd', 'change', e => {
    S.prefs.raccourcis = e.target.checked;
    document.documentElement.dataset.kbd = e.target.checked ? '1' : '0';
    save(); _regOk('set-apparence');
  });

  /* --- 3. Sons --- */
  zone.querySelectorAll('input[name="reg-son"]').forEach(r => r.addEventListener('change', () => {
    S.prefs.son = r.value; save();
    if (r.value !== 'off') snd.pop();
    const b = document.getElementById('btn-sound');
    if (b){
      b.setAttribute('aria-pressed', r.value === 'off' ? 'false' : 'true');
      b.setAttribute('aria-label', r.value === 'off' ? 'Sons coupés' : 'Sons activés');
      const u = b.querySelector('use');
      if (u) u.setAttribute('href', r.value === 'off' ? '#i-speaker-slash' : '#i-speaker-high');
    }
    _regOk('set-sons');
  }));
  sur('reg-ecouter', 'click', () => { try { snd.arpege(3); } catch(e){} });
  sur('reg-vib', 'change', e => { S.prefs.haptique = e.target.checked; save(); if (e.target.checked) vibrer(20); _regOk('set-sons'); });

  /* --- 4. Séance --- */
  sur('reg-indices', 'change', e => { S.prefs.indices = e.target.checked; save(); _regOk('set-seance'); });
  zone.querySelectorAll('input[name="reg-cmi"]').forEach(r => r.addEventListener('change', () => {
    S.prefs.cmIndices = r.value; save(); _regOk('set-seance');
  }));
  sur('reg-prof', 'change', e => {
    S.prefs.prof = e.target.checked; save();
    const f = document.getElementById('assist-fab');
    if (f && !e.target.checked) f.hidden = true;
    _regOk('set-seance');
  });

  /* --- 5. Données --- */
  sur('reg-export', 'click', _regExporter);
  sur('reg-import', 'click', () => { const f = el('reg-fichier'); if (f) f.click(); });
  sur('reg-fichier', 'change', e => {
    const f = e.target.files && e.target.files[0];
    if (f) _regImporter(f);
    e.target.value = '';
  });
  sur('reg-gh-on', 'click', _regGhActiver);
  sur('reg-gh-push', 'click', () => {
    if (!_regLire('mzs-gh-token')){ toast('Ajoute d\'abord ton jeton GitHub.', {tone: 'info', icon: 'key'}); return; }
    save.flush();
    nuageEnvoyer().then(() => { majCloud(); toast('Sauvegarde envoyée.', {tone: 'ok', icon: 'cloud-check'}); })
      .catch(err => toast(err.message || 'Envoi impossible.', {tone: 'ko', icon: 'cloud-slash'}));
  });
  sur('reg-gh-pull', 'click', _regGhRecuperer);
  sur('reg-gh-off', 'click', () => {
    confirmer('Désactiver la sauvegarde GitHub ?', 'Ta progression reste sur cet appareil. Le Gist n\'est pas supprimé.',
              {valider: 'Désactiver', danger: true}).then(oui => {
      if (!oui) return;
      ghSet(K_TOKEN, ''); ghSet(K_GIST, ''); majCloud(); vReglages({section: 'donnees'});
      toast('Sauvegarde GitHub désactivée.', {tone: 'info', icon: 'cloud'});
    });
  });
  sur('reg-bilan', 'click', () => {
    confirmer('Refaire le bilan d\'altitude ?', '20 questions au plus, sans leçon ni indice. Tes compétences déjà verrouillées ne bougent pas.',
              {valider: 'Commencer le bilan'}).then(oui => { if (oui) nav('bilan'); });
  });
  sur('reg-raz', 'click', _regReinitialiser);

  /* --- 6. Le Prof --- */
  const cle = (id, k) => sur(id, 'change', e => { _regEcrire(k, e.target.value.trim()); _regOk('set-prof'); });
  cle('reg-groq', 'mzs-cle-groq');
  cle('reg-claude', 'mzs-cle-api');
  zone.querySelectorAll('input[name="reg-moteur"]').forEach(r => r.addEventListener('change', () => {
    _regEcrire('mzs-ia-pref', r.value); _regOk('set-prof');
  }));
  sur('reg-web', 'change', e => { _regEcrire('mzs-web', e.target.checked ? '1' : '0'); _regOk('set-prof'); });
  sur('reg-test-cle', 'click', _regTesterCle);

  /* --- 7. À propos --- */
  sur('reg-maj', 'click', () => {
    if (!('serviceWorker' in navigator)){ toast('Cette version se met à jour au rechargement.', {tone: 'info'}); return; }
    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg){ toast('Cette version se met à jour au rechargement.', {tone: 'info'}); return; }
      return reg.update().then(() => {
        toast(reg.waiting ? 'Nouvelle version prête.' : 'Tu es déjà à jour.',
              {tone: reg.waiting ? 'glacier' : 'ok', icon: reg.waiting ? 'arrows-clockwise' : 'check-circle'});
      });
    }).catch(() => toast('Vérification impossible hors ligne.', {tone: 'info', icon: 'wifi-slash'}));
  });
  sur('reg-news', 'click', _regNouveautes);
  sur('reg-methode', 'click', () => nav('methode'));
  sur('reg-onb', 'click', () => nav('onboarding'));
  sur('reg-install', 'click', _regInstaller);
  sur('reg-demo', 'click', () => {
    if (typeof window.entrerPresentation === 'function'){ window.entrerPresentation(); return; }
    toast('Le mode présentation arrive dans une prochaine version.', {tone: 'info', icon: 'projector-screen'});
  });
}

/* ============================================================
   5. Export et import par fichier (M12)
   ============================================================ */
function _regExporter(){
  save.flush();
  const nom = 'maths-sommet-' + todayKey() + '.json';
  const texte = exportEtat();
  const blob = new Blob([texte], {type: 'application/json'});
  const fichier = (typeof File === 'function') ? new File([blob], nom, {type: 'application/json'}) : null;
  if (fichier && navigator.canShare && navigator.canShare({files: [fichier]})){
    navigator.share({files: [fichier], title: 'Ma progression'}).catch(() => {});
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nom;
  document.body.appendChild(a);
  a.click();
  after(1000, () => { a.remove(); URL.revokeObjectURL(url); });
  toast('Fichier enregistré : ' + nom, {tone: 'ok', icon: 'download-simple'});
}

function _regImporter(fichier){
  const lecteur = new FileReader();
  lecteur.onerror = () => toast("Ce fichier n'est pas une sauvegarde de l'app.", {tone: 'ko', icon: 'warning'});
  lecteur.onload = () => {
    let d = null;
    try { d = JSON.parse(String(lecteur.result)); } catch(e){}
    const brut = d && (d.etat || (d.skills ? d : null));
    if (!brut || (d.app && d.app !== 'mzs')){
      toast("Ce fichier n'est pas une sauvegarde de l'app.", {tone: 'ko', icon: 'warning'});
      return;
    }
    const altA = altitude(), acqA = masteredCount();
    const altB = _regAltitudeDe(brut), acqB = _regAcquises(brut);
    ouvrirFeuille({
      classe: 'sheet-import',
      titre: 'Remplacer ta progression ?',
      texte: 'Celle de cet appareil sera écrasée par celle du fichier.',
      contenu: '<div class="figures">' +
        '<div class="figure"><b>' + nf(altA, 'm') + '</b><span class="k">Ici · ' + acqA + ' acquises</span></div>' +
        '<div class="figure"><b>' + nf(altB, 'm') + '</b><span class="k">Fichier · ' + acqB + ' acquises</span></div></div>',
      boutons: [{label: 'Annuler'}, {label: 'Remplacer', style: 'danger'}]
    }).then(i => {
      if (i !== 1) return;
      try {
        importEtat(d);
        try { window.marquerJalonsPasses(); } catch(e){}
        try { bivouacs(); } catch(e){}
        majCrete(); majAnneauJour(); majCloud();
        toast('Progression importée : ' + nf(altitude(), 'm') + '.', {tone: 'ok', icon: 'upload-simple'});
        nav('accueil', {remplace: true});
      } catch(err){
        toast(err.message || "Ce fichier n'est pas une sauvegarde de l'app.", {tone: 'ko', icon: 'warning'});
      }
    });
  };
  lecteur.readAsText(fichier);
}

/* ============================================================
   6. GitHub (option avancée)
   ============================================================ */
function _regGhActiver(){
  const champ = document.getElementById('reg-tok');
  const jeton = champ ? champ.value.trim() : '';
  if (!jeton){ toast('Colle ton jeton GitHub dans le champ.', {tone: 'info', icon: 'key'}); return; }
  ghSet(K_TOKEN, jeton);
  const b = document.getElementById('reg-gh-on');
  if (b) b.setAttribute('aria-busy', 'true');
  gh('/user').then(u => {
    save.flush();
    return nuageEnvoyer().then(() => {
      toast('Connecté : ' + (u.login || 'compte GitHub') + '. Sauvegarde active.', {tone: 'ok', icon: 'cloud-check'});
      majCloud();
      if (champ) champ.value = '';
      vReglages({section: 'donnees'});
    });
  }).catch(err => {
    ghSet(K_TOKEN, '');
    majCloud();
    if (b) b.removeAttribute('aria-busy');
    toast(err.message || 'Jeton refusé.', {tone: 'ko', icon: 'cloud-slash'});
  });
}

function _regGhRecuperer(){
  if (!_regLire('mzs-gh-token')){ toast('Ajoute d\'abord ton jeton GitHub.', {tone: 'info', icon: 'key'}); return; }
  nuageRecuperer().then(d => {
    const brut = d && (d.etat || (d.skills ? d : null));
    if (!brut){ toast('Aucune sauvegarde trouvée sur ce compte.', {tone: 'info', icon: 'cloud'}); return; }
    const altA = altitude(), altB = _regAltitudeDe(brut);
    return ouvrirFeuille({
      classe: 'sheet-import',
      titre: 'Récupérer la sauvegarde ?',
      texte: 'La progression de cet appareil sera remplacée.',
      contenu: '<div class="figures">' +
        '<div class="figure"><b>' + nf(altA, 'm') + '</b><span class="k">Ici</span></div>' +
        '<div class="figure"><b>' + nf(altB, 'm') + '</b><span class="k">GitHub</span></div></div>',
      boutons: [{label: 'Annuler'}, {label: 'Remplacer', style: 'danger'}]
    }).then(i => {
      if (i !== 1) return;
      importEtat(d);
      try { window.marquerJalonsPasses(); } catch(e){}
      majCrete(); majAnneauJour();
      toast('Progression récupérée : ' + nf(altitude(), 'm') + '.', {tone: 'ok', icon: 'cloud-check'});
      nav('accueil', {remplace: true});
    });
  }).catch(err => toast(err.message || 'Récupération impossible.', {tone: 'ko', icon: 'cloud-slash'}));
}

/* ============================================================
   7. Réinitialisation à double validation
   ============================================================ */
function _regReinitialiser(){
  let champ = null;
  ouvrirFeuille({
    titre: 'Tout effacer ?',
    texte: 'Ta progression, tes erreurs et tes réglages seront effacés sur cet appareil. Exporte d\'abord si tu hésites.',
    contenu: '<label class="field"><span class="label">Tape EFFACER pour confirmer</span>' +
             '<input class="input" id="reg-raz-txt" type="text" autocomplete="off" spellcheck="false" data-focus></label>',
    boutons: [{label: 'Annuler'}, {label: 'Tout effacer', style: 'danger'}],
    apres(dlg){ champ = dlg.querySelector('#reg-raz-txt'); }
  }).then(i => {
    if (i !== 1) return;
    if (!champ || champ.value.trim().toUpperCase() !== 'EFFACER'){
      toast('Rien n\'a été effacé : le mot ne correspond pas.', {tone: 'info', icon: 'info'});
      return;
    }
    try {
      localStorage.removeItem('mzs-state');
      localStorage.removeItem('mzs-theme');
      localStorage.removeItem('mzs-motion');
      indexedDB.deleteDatabase('mzs');
    } catch(e){}
    location.reload();
  });
}

/* ============================================================
   8. Tester la clé du Prof (M12)
   ============================================================ */
function _regTesterCle(){
  const moteur = _regLire('mzs-ia-pref') || 'local';
  const b = document.getElementById('reg-test-cle');
  if (moteur === 'local'){ toast('Le moteur local répond toujours, sans clé.', {tone: 'ok', icon: 'check-circle'}); return; }
  const cle = moteur === 'groq' ? _regLire('mzs-cle-groq') : _regLire('mzs-cle-api');
  if (!cle){ toast('Aucune clé enregistrée pour ce moteur.', {tone: 'info', icon: 'key'}); return; }
  if (b) b.setAttribute('aria-busy', 'true');
  const t0 = performance.now();
  const req = moteur === 'groq'
    ? fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + cle},
        body: JSON.stringify({model: 'openai/gpt-oss-120b', max_completion_tokens: 5,
                              messages: [{role: 'user', content: '2+2'}]})
      })
    : fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'content-type': 'application/json', 'x-api-key': cle,
                  'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'},
        body: JSON.stringify({model: 'claude-opus-5', max_tokens: 5, messages: [{role: 'user', content: '2+2'}]})
      });
  req.then(r => {
    if (b) b.removeAttribute('aria-busy');
    const s = ((performance.now() - t0) / 1000);
    const nom = moteur === 'groq' ? 'Groq' : 'Claude';
    if (r.ok) toast(nom + ' répond en ' + fv(s, 1) + ' s.', {tone: 'ok', icon: 'check-circle'});
    else toast(nom + ' a refusé : code ' + r.status + '.', {tone: 'ko', icon: 'warning'});
  }).catch(() => {
    if (b) b.removeAttribute('aria-busy');
    toast('Pas de réponse. Vérifie ta connexion.', {tone: 'ko', icon: 'wifi-slash'});
  });
}

/* ============================================================
   9. Installation guidée et nouveautés (M12)
   ============================================================ */
function _regInstaller(){
  if (_regInstallee()){ toast('L\'app est déjà installée.', {tone: 'ok', icon: 'check-circle'}); return; }
  const invite = window.PROMPT_INSTALL;
  if (invite && typeof invite.prompt === 'function'){
    invite.prompt();
    Promise.resolve(invite.userChoice).then(() => { window.PROMPT_INSTALL = null; }).catch(() => {});
    return;
  }
  const ipad = /iPad/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform) && !_regIOS());
  const etapes = _regIOS()
    ? [['export', ipad ? 'Touche Partager, en haut à droite de Safari.' : 'Touche Partager en bas de Safari.'],
       ['plus-square', 'Choisis « Sur l\'écran d\'accueil ».'],
       ['check', 'Touche Ajouter. L\'app s\'ouvre ensuite en plein écran, même sans connexion.']]
    : _regSafari()
      ? [['export', 'Ouvre le menu Fichier de Safari.'],
         ['plus-square', 'Choisis « Ajouter au Dock ».'],
         ['check', 'L\'app s\'ouvre ensuite dans sa propre fenêtre, même sans connexion.']]
      : [['export', 'Ouvre le menu de ton navigateur.'],
         ['plus-square', 'Choisis « Installer l\'application ».'],
         ['check', 'L\'app s\'ouvre ensuite en plein écran, même sans connexion.']];
  ouvrirFeuille({
    classe: 'sheet-install',
    titre: 'Mettre l\'app sur ton écran',
    texte: 'Trois gestes, une fois pour toutes.',
    contenu: '<ol class="install-steps">' + etapes.map(e =>
      '<li>' + ic(e[0]) + '<span>' + esc(e[1]) + '</span></li>').join('') + '</ol>',
    boutons: [{label: 'Compris'}]
  });
}

function _regNouveautes(){
  const v = window.APP_VERSION || '2.0.0';
  const liste = (window.NOUVEAUTES && window.NOUVEAUTES[v]) || [
    'La montagne remplace les points : chaque bonne réponse te fait monter.',
    'Le cahier d\'erreurs sait quand te reposer une question.',
    'Réglages, sauvegarde et clés vivent enfin au même endroit.'
  ];
  ouvrirFeuille({
    classe: 'sheet-nouveautes',
    titre: 'Nouveautés ' + v,
    contenu: '<ul class="lecon">' + liste.slice(0, 3).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>',
    boutons: [{label: 'Compris'}]
  }).then(() => { S.meta.versionVue = v; save(); });
}
