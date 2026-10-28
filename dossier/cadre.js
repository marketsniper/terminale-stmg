/* ===== Mode Parcoursup « Mon dossier » : crochet côté app STMG =====
   Chargé par UNE ligne dans index.html (<script defer src="dossier/cadre.js">), tout le reste vit dans dossier/.
   Ce script, depuis l'extérieur de l'IIFE de l'app, ajoute :
     - la carte d'accueil #dossier-carte (avant #agenda) et le bouton de mode #mode-dossier (après #mode-maths) ;
     - le cadre plein écran #dossier-cadre (iframe ./dossier/?embed=1, même origine), piloté par l'adresse :
         …/#dossier                      ouvre le dossier (tableau de bord)
         …/#dossier/<vue>[/<param>]      l'ouvre sur un écran (bulletins, jury, simulateur, histoire, calendrier, reglages)
       Ouvrir pousse une entrée d'historique : le retour du téléphone referme le mode (séquence copiée du mode Maths).
   Messages (même origine uniquement) :
     dossier vers ici : {source:'dsp', type:'pret'|'theme'|'fermer'|'aller', theme, couleur, hash}
     ici vers dossier : {source:'stmg', type:'aller'|'contexte', vue, param, fiches}
   Lecture seule de localStorage['stmg-dossier'] (résumé écrit par la mini-app) : jamais d'écriture ici. */
(function () {
  'use strict';
  const RE = /^#dossier(?:\/([a-z]+))?(?:\/([^/]*))?(?:\/([^/]*))?$/;
  const FOND = { light: '#EDF0F4', dark: '#12161C' };
  const AUTRES = ['seance-ouverte', 'cours-ouvert', 'cj-visio-ouverte'];
  const d = { cadre: null, frame: null, ouvert: false, pret: false, pousse: false, avant: '', attente: null, metas: [], focus: null, garde: 0, filet: 0, apres: null, sommetDeja: false };
  const $ = function (id) { return document.getElementById(id); };
  const html = document.documentElement;

  /* ---- feuille de style ---- */
  if (!document.querySelector('link[href$="dossier/cadre.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'dossier/cadre.css'; document.head.appendChild(l); }

  /* ---- lecture du résumé (écrit par la mini-app à chaque sauvegarde) ---- */
  function lire() { try { const s = JSON.parse(localStorage.getItem('stmg-dossier') || 'null'); return s && typeof s === 'object' && !Array.isArray(s) ? s : null; } catch (e) { return null; } }
  function fmt(n) { if (n == null || !isFinite(n)) return '-'; return Math.abs(n).toFixed(1).replace('.', ',').replace(/^/, n < 0 && Math.abs(n) >= 0.05 ? '−' : ''); }
  function fmtDelta(n) { if (n == null || !isFinite(n)) return '-'; const v = Math.round(n * 10) / 10; return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', ','); }
  function jours(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); if (!m) return null; const a = new Date(+m[1], +m[2] - 1, +m[3], 12), b = new Date(); b.setHours(12, 0, 0, 0); return Math.ceil((a - b) / 86400000); }
  function el(tag, cls, txt) { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  /* ---- carte d'accueil ---- */
  function carte() {
    let c = $('dossier-carte');
    if (!c) {
      const anc = $('agenda'); if (!anc) return;
      c = el('section', 'agenda dossier-carte'); c.id = 'dossier-carte'; c.setAttribute('aria-label', 'Mon dossier Parcoursup');
      anc.parentNode.insertBefore(c, anc);
      c.addEventListener('click', function (e) { if (e.target.closest('button, a')) return; ouvrirPar(); });
    }
    const s = lire(), r = s && s.resume;
    /* un dossier qui contient déjà des bulletins mais pas encore de résumé (fichier importé, ancienne version) : on invite à l'ouvrir */
    const aDesNotes = !!(s && s.periodes && Object.keys(s.periodes).some(function (k) { const p = s.periodes[k]; return p && p.lignes && Object.keys(p.lignes).length; }));
    c.textContent = '';
    c.appendChild(el('p', 'dc-kicker', 'Mon dossier Parcoursup · ce que le jury lira'));
    const h3 = el('h3', null, r && r.titre ? r.titre : aDesNotes ? 'Ton dossier contient déjà des bulletins : ouvre-le pour voir ce que le jury lira.' : 'Ton dossier commence ici. Saisis ton dernier bulletin de Première : deux minutes, ou photographie-le.');
    c.appendChild(h3);
    const corps = el('div', 'dc-corps');
    const chiffres = el('div', 'dc-chiffres');
    const chiffre = function (val, leg, cls) { const b = el('div'); const v = el('b', cls || null, val); const l = el('span', null, leg); b.appendChild(v); b.appendChild(l); chiffres.appendChild(b); };
    chiffre(r && r.mp != null ? fmt(r.mp) : '-', 'moyenne pondérée');
    if (r && r.ecart != null) chiffre(fmtDelta(-r.ecart), 'écart ' + (r.ecartVoeu || 'cible'), 'dc-' + (r.feu || 'gris'));
    else chiffre('-', r ? 'choisis un vœu' : 'écart cible');
    const n = r && r.jalon ? jours(r.jalon.date) : null;
    chiffre(n == null ? '-' : n === 0 ? 'Aujourd’hui' : 'J−' + n, r && r.jalon ? r.jalon.titre.replace(/^Conseil de classe du /, 'conseil de classe ') : 'conseil de classe', n != null && n <= 7 ? 'dc-j7' : n != null && n <= 14 ? 'dc-j14' : null);
    corps.appendChild(chiffres);
    const pct = r ? Math.max(0, Math.min(100, r.completion || 0)) : 0;
    const barre = el('div', 'dc-barre'); barre.setAttribute('role', 'img'); barre.setAttribute('aria-label', 'Dossier complété à ' + pct + ' %');
    const rempli = el('span'); rempli.style.width = pct + '%'; barre.appendChild(rempli); corps.appendChild(barre);
    corps.appendChild(el('p', 'dc-texte', 'Dossier complété ' + pct + ' %' + (r && r.action ? ' · Cette semaine : ' + r.action : '')));
    c.appendChild(corps);
    const go = el('button', 'dc-go', (r && r.etat !== 'vide') || (!r && aDesNotes) ? 'Ouvrir mon dossier' : 'Commencer'); go.type = 'button'; go.id = 'dossier-go';
    go.addEventListener('click', ouvrirPar);
    c.appendChild(go);
    const champ = $('search'); if (champ) c.hidden = !!champ.value.trim();
  }
  function ouvrirPar() { location.hash = '#dossier'; }

  /* ---- bouton de mode ---- */
  (function () {
    const m = $('mode-maths'); if (!m || $('mode-dossier')) return;
    const b = el('button', null, 'Dossier'); b.id = 'mode-dossier'; b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', 'false');
    b.addEventListener('click', ouvrirPar);
    m.insertAdjacentElement('afterend', b);
  })();

  /* ---- index des fiches et faiblesse par fiche (DATA + stmg-quiz-stats), envoyés à la mini-app ---- */
  function contexte() {
    const fiches = [];
    let stats = {}; try { stats = JSON.parse(localStorage.getItem('stmg-quiz-stats') || '{}') || {}; } catch (e) { stats = {}; }
    const parChap = {};
    try {
      if (typeof DATA !== 'undefined' && Array.isArray(DATA)) DATA.forEach(function (m) { (m.questions || []).forEach(function (q) { const s = stats[q.id]; if (!s || !s.vu) return; const o = parChap[q.chap] || (parChap[q.chap] = { vu: 0, bon: 0 }); o.vu += s.vu; o.bon += s.bon || 0; }); });
    } catch (e) { }
    document.querySelectorAll('section.matiere').forEach(function (sec) {
      sec.querySelectorAll('details.fiche').forEach(function (f) {
        const num = f.querySelector('.f-num'), tit = f.querySelector('.f-title'), s = parChap[f.id];
        fiches.push({ id: f.id, sec: sec.id, num: num ? num.textContent.trim() : '', titre: tit ? tit.textContent.trim() : f.id, faiblesse: s ? 1 - s.bon / s.vu : null, vu: s ? s.vu : 0 });
      });
    });
    return { source: 'stmg', type: 'contexte', fiches: fiches };
  }
  function envoyerContexte() { if (!d.frame || !d.pret) return; try { d.frame.contentWindow.postMessage(contexte(), location.origin); } catch (e) { } }

  /* ---- cadre ---- */
  function theme() { try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { return 'light'; } }
  function couleurs(t, couleur) {
    if (!d.cadre) return;
    d.cadre.dataset.theme = t === 'dark' ? 'dark' : 'light';
    if (!d.ouvert) return;
    const c = /^#[0-9a-f]{6}$/i.test(couleur || '') ? couleur : FOND[d.cadre.dataset.theme];
    d.metas.forEach(function (m) { m[0].setAttribute('content', c); });
  }
  function marges() {
    if (!d.cadre || !d.frame || !d.pret) return;
    let v = [0, 0, 0, 0];
    try {
      const doc = d.frame.contentDocument, t = doc.createElement('div');
      t.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
      doc.body.appendChild(t);
      const cs = d.frame.contentWindow.getComputedStyle(t);
      v = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(function (x) { return parseFloat(x) || 0; });
      t.remove();
    } catch (e) { }
    ['haut', 'droite', 'bas', 'gauche'].forEach(function (n, i) { d.cadre.style.setProperty('--dossier-' + n, v[i] + 'px'); });
  }
  function adresse(vue, param, sub) { return './dossier/?embed=1' + (vue ? '#' + vue + (param ? '/' + encodeURIComponent(param) : '') + (sub ? '/' + encodeURIComponent(sub) : '') : ''); }
  function charger(vue, param, sub) {
    if (d.frame) d.frame.remove();
    const f = document.createElement('iframe');
    f.title = 'Mon dossier Parcoursup'; f.src = adresse(vue, param, sub);
    d.frame = f; d.pret = false; d.attente = null;
    d.cadre.appendChild(f);
    const retour = d.cadre.querySelector('.dossier-retour'), lent = d.cadre.querySelector('.dossier-lent');
    retour.hidden = false; lent.hidden = true;
    clearTimeout(d.garde);
    d.garde = setTimeout(function () { if (!d.pret) lent.hidden = false; }, 7000);
  }
  function creer() {
    const c = el('div', 'dossier-cadre ferme'); c.id = 'dossier-cadre'; c.dataset.theme = theme();
    c.setAttribute('role', 'dialog'); c.setAttribute('aria-modal', 'true'); c.setAttribute('aria-label', 'Mon dossier Parcoursup');
    const retour = el('button', 'dossier-retour', '‹ STMG'); retour.type = 'button'; retour.setAttribute('aria-label', 'Fermer mon dossier et revenir à l’app STMG');
    retour.addEventListener('click', quitter);
    const lent = el('div', 'dossier-lent'); lent.hidden = true;
    lent.appendChild(el('p', null, 'Le dossier met du temps à s’ouvrir. Vérifie ta connexion, puis réessaie.'));
    const re = el('button', null, 'Réessayer'); re.type = 'button'; re.addEventListener('click', function () { charger(''); });
    lent.appendChild(re);
    const sr = el('div', 'dossier-sr'); sr.setAttribute('aria-live', 'polite');
    c.appendChild(retour); c.appendChild(lent); c.appendChild(sr);
    document.body.appendChild(c);
    d.cadre = c;
  }
  function aller(vue, param, sub) {
    if (!d.frame) return;
    if (!d.pret) { d.attente = { vue: vue, param: param, sub: sub }; return; }
    try { d.frame.contentWindow.postMessage({ source: 'stmg', type: 'aller', vue: vue || 'tableau', param: param || '', sub: sub || '' }, location.origin); } catch (e) { }
  }
  function annoncer(t) {
    let z = d.cadre && d.cadre.querySelector('.dossier-sr');
    if (!z) { z = $('dossier-sr-tmp'); if (!z) { z = el('div', 'dossier-sr'); z.id = 'dossier-sr-tmp'; z.setAttribute('aria-live', 'polite'); document.body.appendChild(z); } }
    z.textContent = ''; setTimeout(function () { z.textContent = t; }, 50);
  }
  function autreOuvert() { return AUTRES.some(function (k) { return html.classList.contains(k); }) || (html.classList.contains('sommet-ouvert') && !d.ouvert); }
  function ouvrir(vue, param, sub) {
    if (!d.cadre) creer();
    if (!d.frame) charger(vue, param, sub); else aller(vue, param, sub);
    if (d.ouvert) return;
    d.ouvert = true;
    d.focus = document.activeElement;
    d.metas = Array.prototype.map.call(document.querySelectorAll('meta[name="theme-color"]'), function (m) { return [m, m.getAttribute('content')]; });
    html.classList.add('dossier-ouvert', 'sommet-ouvert');   // sommet-ouvert : la page devient inerte pour les autres modules (pastille, séance), comme sous le cadre Maths
    const page = document.querySelector('.page'); if (page) page.inert = true;
    void d.cadre.offsetWidth;
    d.cadre.classList.remove('ferme');
    couleurs(theme());
    marges();
    try { d.frame.focus({ preventScroll: true }); } catch (e) { }
  }
  function fermer() {
    if (!d.ouvert) return;
    d.ouvert = false; d.pousse = false;
    clearTimeout(d.filet);
    d.cadre.classList.add('ferme');
    html.classList.remove('dossier-ouvert', 'sommet-ouvert');
    const page = document.querySelector('.page'); if (page) page.inert = AUTRES.some(function (k) { return html.classList.contains(k); });
    d.metas.forEach(function (m) { m[0].setAttribute('content', m[1]); }); d.metas = [];
    carte();
    let f = d.focus; d.focus = null;
    if (f && !document.contains(f) && f.id) f = $(f.id);          // la carte vient d'être redessinée : on retrouve le bouton par son id
    try { if (f && document.contains(f) && f.focus) f.focus({ preventScroll: true }); else if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { }
    const apres = d.apres; d.apres = null;
    if (apres) setTimeout(function () { executer(apres); }, 0);
  }
  function executer(hash) {
    if (hash === '__ds') { try { if (window.__stmgDS && window.__stmgDS.accueil) window.__stmgDS.accueil(); } catch (e) { } return; }
    if (/^#[a-z0-9/-]+$/i.test(hash)) location.hash = hash;
  }
  function quitter(apres) {
    if (!d.ouvert) return;
    if (typeof apres === 'string') d.apres = apres;
    const sansDiese = function () { try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) { } fermer(); };
    if (!d.pousse) { sansDiese(); return; }
    history.back();
    clearTimeout(d.filet);
    d.filet = setTimeout(function () { if (d.ouvert && RE.test(location.hash)) sansDiese(); }, 600);
  }
  function sync(e) {
    const m = RE.exec(location.hash);
    if (!m) { fermer(); return; }
    if (!d.ouvert && autreOuvert()) {
      try { history.replaceState(history.state, '', location.pathname + location.search); } catch (x) { }
      annoncer('Ferme d’abord l’écran ouvert, puis rouvre ton dossier.');
      return;
    }
    if (!d.ouvert) {
      let avant = '';
      if (e && e.oldURL) { const i = e.oldURL.indexOf('#'); avant = i === -1 ? '' : e.oldURL.slice(i); if (avant === '#') avant = ''; }
      d.avant = RE.test(avant) ? '' : avant;
      d.pousse = !!e;
    }
    let vue = m[1] || '', param = m[2] || '', sub = m[3] || '';
    try { param = decodeURIComponent(param); sub = decodeURIComponent(sub); } catch (x) { }
    ouvrir(vue, param, sub);
  }
  window.addEventListener('hashchange', sync);
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !d.frame || e.source !== d.frame.contentWindow) return;
    const m = e.data; if (!m || m.source !== 'dsp') return;
    if (m.type === 'pret') {
      d.pret = true; clearTimeout(d.garde);
      d.cadre.querySelector('.dossier-retour').hidden = true;
      d.cadre.querySelector('.dossier-lent').hidden = true;
      couleurs(m.theme, m.couleur); marges(); envoyerContexte();
      if (d.attente) { const a = d.attente; d.attente = null; aller(a.vue, a.param, a.sub); }
      if (d.ouvert) { try { d.frame.focus({ preventScroll: true }); } catch (x) { } }
    }
    else if (m.type === 'theme') couleurs(m.theme, m.couleur);
    else if (m.type === 'fermer') quitter();
    else if (m.type === 'aller') quitter(String(m.hash || ''));
  });
  window.addEventListener('resize', function () { if (d.ouvert) marges(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !d.ouvert) return;
    if (document.querySelector('#ia-modal, #sauve-modal, #ech-modal, #profil-modal')) return;
    e.preventDefault(); quitter();
  });
  window.addEventListener('storage', function (e) {
    if (e.key && e.key !== 'stmg-dossier' && !/^(stmg-(fiches-done|quiz-stats|echeances|ds-hist|seances))$/.test(e.key)) return;
    if (!d.ouvert) carte();
    if (e.key !== 'stmg-dossier') envoyerContexte();
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !d.ouvert) carte(); });
  (function () { const champ = $('search'); if (champ) champ.addEventListener('input', function () { const c = $('dossier-carte'); if (c) c.hidden = !!champ.value.trim(); }); })();

  window.__stmgDossier = { ouvrir: function (vue) { location.hash = '#dossier' + (vue ? '/' + vue : ''); }, fermer: quitter, etat: d, carte: carte, contexte: contexte };
  carte();
  sync(null);
})();
