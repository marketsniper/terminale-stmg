/* ===== Mon dossier Parcoursup · coque, routage, mode embarqué =====
   Ouverte seule (/dossier/) ou dans le cadre « Dossier » de l'app STMG (iframe de même origine, ./dossier/?embed=1).
   Messages échangés (même origine uniquement) :
     dossier vers STMG : {source:'dsp', type:'pret'|'theme'|'fermer'|'aller'|'etat', theme, couleur, hash}
     STMG vers dossier : {source:'stmg', type:'aller'|'contexte', vue, param, fiches} */
'use strict';
(function () {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h;
  const EMBED = document.documentElement.dataset.embed === '1';
  const VUES = [['tableau', 'Tableau de bord', 'Ce que le jury lira'], ['bulletins', 'Bulletins', 'Mes bulletins'], ['jury', 'Jury', 'Ce que la commission verra'], ['simulateur', 'Et si', 'Et si tu remontais d’un point ?'], ['histoire', 'Mon histoire', 'Mon histoire'], ['calendrier', 'Calendrier', 'Les dates qui figent l’histoire'], ['reglages', 'Réglages', 'Réglages']];
  const RE = /^#?([a-z]+)?(?:\/([^/]*))?(?:\/([^/]*))?$/;
  const app = { vue: null, param: '', sub: '', corps: null, pied: null, piedZone: null, titre: null, nav: null, enAttente: false };

  if (EMBED) { try { history.pushState = function (e, t, u) { return history.replaceState(e, t, u); }; } catch (e) { } }
  function versParent(type, extra) {
    if (!EMBED) return;
    const msg = Object.assign({ source: 'dsp', type: type, theme: themeActuel(), couleur: couleurFond() }, extra || {});
    try { window.parent.postMessage(msg, location.origin); } catch (e) { }
  }
  function themeActuel() { const t = document.documentElement.dataset.theme; if (t === 'light' || t === 'dark') return t; try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { return 'light'; } }
  function couleurFond() { return themeActuel() === 'dark' ? '#12161C' : '#EDF0F4'; }
  function poserTheme() { const m = document.getElementById('meta-theme'); if (m) m.setAttribute('content', couleurFond()); versParent('theme'); }

  /* ---- routage ---- */
  function lireHash(hh) {
    const m = RE.exec(hh || location.hash || '') || [];
    const vue = VUES.some(function (v) { return v[0] === m[1]; }) ? m[1] : 'tableau';
    return { vue: vue, param: decodeURIComponent(m[2] || ''), sub: decodeURIComponent(m[3] || '') };
  }
  function nav(vue, param, sub, remplace) {
    const hh = '#' + vue + (param ? '/' + encodeURIComponent(param) : '') + (sub ? '/' + encodeURIComponent(sub) : '');
    if (location.hash === hh) { rendre(); return; }
    if (EMBED || remplace) { try { history.replaceState(history.state, '', location.pathname + location.search + hh); } catch (e) { } rendre(); }
    else location.hash = hh;
  }
  function rendre() {
    E.relire();                     // une saisie faite dans un autre onglet passe avant l'état en mémoire
    app.enAttente = false;
    const r = lireHash();
    const changeVue = r.vue !== app.vue;
    app.vue = r.vue; app.param = r.param; app.sub = r.sub;
    const def = VUES.find(function (v) { return v[0] === r.vue; });
    app.titre.textContent = U.typo(def[2]);
    document.title = def[2] + ' · Mon dossier';
    Array.prototype.forEach.call(app.nav.querySelectorAll('button'), function (b) {
      const actif = b.dataset.id === r.vue;
      b.classList.toggle('do-actif', actif);
      if (actif) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      if (actif) U.montrer(b);
    });
    E.S.vu.dernierEcran = r.vue;
    U.vider(app.corps); U.vider(app.pied);
    app.main.className = 'do-corps do-vue-' + r.vue;
    const V = window.DOSSIER_VUES && window.DOSSIER_VUES[r.vue];
    try { if (V) V(app.corps, app.pied, r.param, r.sub); } catch (e) { U.vider(app.corps); U.vider(app.pied); app.corps.appendChild(U.vide('Cet écran n’a pas pu s’afficher.', 'Tes données sont intactes. Ouvre Réglages pour exporter ton dossier, puis réessaie.', U.bouton('Réglages', function () { nav('reglages'); }, 'do-btn-sec'))); try { console.error(e); } catch (x) { } }
    app.piedZone.hidden = !app.pied.firstChild;
    app.pied.classList.toggle('do-pied-seul', app.pied.children.length === 1);
    if (changeVue) { app.main.scrollTop = 0; try { app.titre.focus({ preventScroll: true }); } catch (e) { } }
    publierResume();
  }
  /* résumé lu par la carte d'accueil de l'app STMG : écrit seulement s'il a changé */
  function publierResume() {
    try { const m = M.calculer(); if (E.resume(M.resume(m))) E.sauver(); } catch (e) { }
  }
  /* lien vers l'app STMG (fiche, matière, maths, DS blanc) : en mode embarqué on demande au cadre de se fermer puis d'y aller */
  function versHote(hash) {
    if (EMBED) { versParent('aller', { hash: hash }); return; }
    location.href = '../' + hash;
  }
  function fermer() { if (EMBED) versParent('fermer'); else if (history.length > 1) history.back(); else location.href = '../'; }

  /* ---- coque ---- */
  function construire() {
    app.main = document.getElementById('do-corps');
    app.corps = document.getElementById('do-corps-in');
    app.pied = document.getElementById('do-pied');
    app.titre = document.getElementById('do-titre');
    app.nav = document.getElementById('do-nav');
    app.piedZone = document.querySelector('.do-pied');
    const fermerBtn = document.getElementById('do-fermer');
    fermerBtn.addEventListener('click', U.garde(fermer));
    if (!EMBED) { fermerBtn.textContent = 'STMG'; fermerBtn.setAttribute('aria-label', 'Revenir à l’app STMG'); }
    VUES.forEach(function (v) {
      /* navigation entre écrans (chaque écran a sa propre adresse) : boutons ordinaires, l'écran courant porte aria-current */
      const b = h('button.do-nav-b', { type: 'button', dataset: { id: v[0] }, text: v[1] });
      b.addEventListener('click', function () { nav(v[0]); });
      app.nav.appendChild(b);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (document.querySelector('dialog[open]')) return;
      const conf = document.querySelector('.do-confirm'); if (conf) { conf.remove(); return; }
      if (EMBED) { e.preventDefault(); fermer(); }
    });
    window.addEventListener('hashchange', rendre);
    E.surChangement(function (err, raison) {
      if (raison === 'autre-onglet') { U.toast('Ton dossier a été modifié dans une autre fenêtre : il est à jour ici aussi. Refais ta dernière modification si besoin.', 6000); setTimeout(rendre, 0); return; }
      if (err) U.toast('Mémoire du téléphone pleine : exporte ton dossier puis libère de la place', 5000);
    });
    /* autre onglet : on relit et on redessine (tout de suite si l'écran est visible, sinon au retour) */
    window.addEventListener('storage', function (e) {
      if (e.key && e.key !== E.K && !/^(stmg-(echeances|ds-hist|fiches-done|quiz-stats|seances|cle-groq)|mzs-(state|cle-groq))$/.test(e.key)) return;
      if (document.hidden) app.enAttente = true; else rendre();
    });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) rendre(); });
    window.addEventListener('focus', function () { if (app.enAttente || E.relire()) rendre(); });
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', poserTheme); } catch (e) { }
    window.addEventListener('afterprint', function () { document.body.classList.remove('do-impression', 'do-impression-releve', 'do-impression-page'); });
    if (EMBED) {
      window.addEventListener('message', function (e) {
        if (e.origin !== location.origin || e.source !== window.parent) return;
        const d = e.data; if (!d || d.source !== 'stmg') return;
        if (d.type === 'aller') { app.vue = null; nav(VUES.some(function (v) { return v[0] === d.vue; }) ? d.vue : 'tableau', d.param || '', d.sub || '', true); try { app.titre.focus({ preventScroll: true }); } catch (x) { } }
        else if (d.type === 'contexte') { E.contexteHote(d); rendre(); }
      });
    }
  }
  function imprimer(mode) {
    document.body.classList.add('do-impression', 'do-impression-' + mode);
    setTimeout(function () { try { window.print(); } catch (e) { } setTimeout(function () { document.body.classList.remove('do-impression', 'do-impression-releve', 'do-impression-page'); }, 1500); }, 60);
  }
  function demarrer() {
    E.charger();
    construire();
    poserTheme();
    const demande = new URLSearchParams(location.search);
    if (!location.hash && demande.get('vue')) nav(demande.get('vue'), demande.get('param') || '', '', true);
    else if (!location.hash && E.S.vu.dernierEcran && E.S.vu.dernierEcran !== 'tableau' && !EMBED) nav(E.S.vu.dernierEcran, '', '', true);
    else rendre();
    if (E.corrompu) U.toast('Ton dossier précédent était illisible : une copie a été gardée, tu repars d’un dossier vide.', 6000);
    if (!E.S.vu.onboarding) { E.S.vu.onboarding = true; E.sauver(); }
    versParent('pret');
    try { if (demande.get('embed') === '1') history.replaceState(history.state, '', location.pathname + '?embed=1' + location.hash); } catch (e) { }
    if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('./sw.js').catch(function () { }); } catch (e) { } }
  }
  window.DOSSIER = { nav: nav, rendre: rendre, versHote: versHote, fermer: fermer, imprimer: imprimer, EMBED: EMBED, get vue() { return app.vue; }, lireHash: lireHash, publierResume: publierResume };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
