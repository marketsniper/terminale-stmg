/* ===== Mon dossier Parcoursup · petits outils d'interface ===== */
'use strict';
window.DOSSIER_UI = (function () {
  const C = window.DOSSIER_CALC;
  /* Typographie française de tout texte affiché (contrainte du projet) : espace insécable avant « : » et « % »,
     espace fine insécable avant « ; ! ? » et à l'intérieur des guillemets, pas de séparateur « · » ni de « / » en début
     de ligne. Appliquée par h() à chaque texte, et par toast() et annoncer(). Les valeurs des champs ne sont jamais
     modifiées. */
  function typo(s) {
    if (s == null) return s;
    return String(s)
      .replace(/ ([:%])/g, '\u00a0$1')
      .replace(/ ([;!?»])/g, '\u202f$1')
      .replace(/« /g, '«\u202f')
      .replace(/ ([·/→]) /g, '\u00a0$1 ')
      .replace(/(\d) (\d{3})(?!\d)/g, '$1\u202f$2');           // « 1 500 » ne se coupe pas
  }
  /* h('div.classe#id', {attrs}, ...enfants) : création de nœuds sans innerHTML */
  function h(sel, attrs) {
    const parts = String(sel).split(/(?=[.#])/);
    const el = document.createElement(parts[0] || 'div');
    parts.slice(1).forEach(function (p) { if (p[0] === '.') el.classList.add(p.slice(1)); else if (p[0] === '#') el.id = p.slice(1); });
    let i = 2;
    if (attrs && typeof attrs === 'object' && !(attrs instanceof Node) && !Array.isArray(attrs)) {
      Object.keys(attrs).forEach(function (k) {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className += (el.className ? ' ' : '') + v;
        else if (k === 'style') el.style.cssText = v;
        else if (k === 'text') el.textContent = typo(v);
        else if (k === 'html') el.innerHTML = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      });
    } else i = 1;
    for (; i < arguments.length; i++) ajouter(el, arguments[i]);
    return el;
  }
  function ajouter(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { ajouter(el, x); }); return; }
    el.appendChild(c instanceof Node ? c : document.createTextNode(typo(String(c))));
  }
  function vider(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
  function debounce(fn, ms) { let t = 0; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }

  /* zone aria-live */
  let sr = null, srT = 0;
  function annoncer(msg) {
    if (!sr) sr = document.querySelector('.do-sr');
    if (!sr) return;
    sr.textContent = '';
    clearTimeout(srT);
    srT = setTimeout(function () { sr.textContent = typo(msg); }, 50);
  }
  /* toast discret (2 s) */
  let toastT = 0;
  function toast(msg, duree) {
    let zone = document.getElementById('do-toasts');
    if (!zone) { zone = h('div#do-toasts'); document.body.appendChild(zone); }
    vider(zone);
    const t = h('div.do-toast', { role: 'status', text: msg });   // h() applique la typographie
    zone.appendChild(t);
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.add('do-toast-fin'); setTimeout(function () { t.remove(); }, 250); }, duree || 2200);
    return t;
  }
  /* confirmation inline : jamais de confirm() natif */
  function confirmer(hote, texte, surOui, libOui, libNon) {
    const ancien = hote.querySelector(':scope > .do-confirm'); if (ancien) ancien.remove();
    const oui = h('button.do-btn.do-btn-danger', { type: 'button', text: libOui || 'Oui' });
    const non = h('button.do-btn', { type: 'button', text: libNon || 'Annuler' });
    const box = h('div.do-confirm', { role: 'group' }, h('p', { text: texte }), h('div.do-confirm-acts', oui, non));
    const fermer = function (focus) { box.remove(); if (focus && focus.focus) focus.focus(); };
    const ouvreur = document.activeElement;
    non.addEventListener('click', function () { fermer(ouvreur); });
    oui.addEventListener('click', function () { fermer(null); surOui(); });
    hote.appendChild(box);
    oui.focus();
    return box;
  }
  /* anti double-tape (400 ms) */
  /* amène un élément d'une rangée défilante (navigation, pilules) dans la partie visible, sans faire défiler la page */
  function montrer(el) {
    const rang = el && el.parentNode; if (!rang) return;
    const go = function () {
      if (rang.scrollWidth <= rang.clientWidth + 1) return;
      const cible = el.offsetLeft - (rang.clientWidth - el.offsetWidth) / 2;
      try { rang.scrollTo({ left: Math.max(0, cible), behavior: reduit() ? 'auto' : 'smooth' }); } catch (e) { rang.scrollLeft = Math.max(0, cible); }
    };
    if (rang.isConnected && rang.clientWidth) go(); else requestAnimationFrame(go);
  }
  function garde(fn) { let t = 0; return function () { const n = Date.now(); if (n - t < 400) return; t = n; return fn.apply(this, arguments); }; }

  /* champ numérique sur 20 : virgule ou point, bornes */
  function lireNote(s) {
    const t = String(s == null ? '' : s).trim().replace(',', '.');
    if (!t) return { vide: true, valeur: null };
    if (!/^\d{1,2}(\.\d{0,2})?$/.test(t)) return { vide: false, valeur: null, erreur: 'Entre 0 et 20' };
    const v = parseFloat(t);
    if (!(v >= 0 && v <= 20)) return { vide: false, valeur: null, erreur: 'Entre 0 et 20' };
    return { vide: false, valeur: Math.round(v * 100) / 100 };
  }
  /* affichage d'une note dans un champ : la précision saisie est conservée (14,63 reste 14,63 ; 14,5 reste 14,5) */
  function texteNote(v, dec) {
    const d = dec != null ? dec : (Math.abs(Math.round(v * 10) - v * 10) < 1e-6 ? 1 : 2);
    return C.fmt(v, d).replace('−', '-');
  }
  function champNote(opts) {
    const inp = h('input.do-note', { type: 'text', inputmode: 'decimal', autocomplete: 'off', enterkeyhint: opts.enter || 'next', 'aria-label': opts.aria || opts.label, placeholder: opts.placeholder || '', value: opts.valeur != null ? texteNote(opts.valeur, opts.dec) : '' });
    if (opts.estime) { inp.placeholder = '≈ ' + C.fmt(opts.estime); inp.classList.add('do-estime'); }
    const err = h('span.do-err', { 'aria-live': 'polite' });
    const wrap = h('label.do-champ', h('span.do-champ-l', { text: opts.label }), inp, err);
    const valider = function () {
      const r = lireNote(inp.value);
      if (r.erreur) { wrap.classList.add('do-ko'); err.textContent = r.erreur; return; }
      wrap.classList.remove('do-ko'); err.textContent = '';
      if (opts.surValeur) opts.surValeur(r.vide ? null : r.valeur, inp);
    };
    inp.addEventListener('input', valider);
    inp.addEventListener('blur', function () { const r = lireNote(inp.value); if (!r.erreur && !r.vide) inp.value = texteNote(r.valeur, opts.dec); });
    if (opts.enter !== 'done') inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (opts.suivant) opts.suivant(inp); } });
    return { el: wrap, input: inp };
  }
  function champTexte(label, valeur, surValeur, opts) {
    const o = opts || {};
    const inp = h(o.multi ? 'textarea.do-texte' : 'input.do-texte', { type: o.type || 'text', inputmode: o.inputmode, placeholder: o.placeholder || '', 'aria-label': label, rows: o.rows || 2, autocomplete: 'off' });
    if (o.multi) inp.value = valeur || ''; else inp.value = valeur == null ? '' : valeur;
    inp.addEventListener('input', debounce(function () { surValeur(inp.value, inp); }, o.delai || 300));
    return { el: h('label.do-champ', h('span.do-champ-l', { text: label }), inp, o.aide ? h('span.do-aide', { text: o.aide }) : null), input: inp };
  }
  const ETATS = { vide: 'vide', partiel: 'partiel', complet: 'complet', vert: 'dans la cible', orange: 'proche de la cible', rouge: 'loin de la cible', gris: 'sans cible' };
  function pilules(opts) {
    const nav = h('div.do-pilules', { role: opts.role || 'group', 'aria-label': opts.label });
    opts.items.forEach(function (it) {
      const b = h('button.do-pilule', { type: 'button', text: it.texte, 'aria-pressed': opts.role ? null : String(it.id === opts.actif), role: opts.role ? 'tab' : null, 'aria-selected': opts.role ? String(it.id === opts.actif) : null, dataset: { id: it.id }, disabled: it.desactive, title: it.titre });
      if (it.id === opts.actif) b.classList.add('do-actif');
      if (it.etat) { b.appendChild(h('span.do-pastille.do-pastille-' + it.etat, { 'aria-hidden': 'true' })); b.appendChild(h('span.do-sr', { text: ', ' + (ETATS[it.etat] || it.etat) })); }
      if (it.badge) b.appendChild(h('span.do-badge-mini', { text: it.badge }));
      b.addEventListener('click', function () { opts.surChoix(it.id, b); });
      nav.appendChild(b);
    });
    const actif = nav.querySelector('.do-actif'); if (actif) requestAnimationFrame(function () { montrer(actif); });
    return nav;
  }
  function kicker(t, couleur) { return h('p.do-kicker', { text: t, style: couleur ? '--acc:' + couleur : null }); }
  function badge(t, ton) { return h('span.do-badge' + (ton ? '.do-badge-' + ton : ''), { text: t }); }
  function bouton(texte, surClic, cls) { return h('button.do-btn' + (cls ? '.' + cls.split(' ').join('.') : ''), { type: 'button', text: texte, onclick: garde(surClic) }); }
  function vide(titre, texte, action) { return h('div.do-vide', h('p.do-vide-t', { text: titre }), texte ? h('p', { text: texte }) : null, action || null); }
  function feuPoint(f) { return h('span.do-feu.do-feu-' + f, { 'aria-hidden': 'true' }); }
  function nomFeu(f) { return { vert: 'dans la cible', orange: 'proche de la cible', rouge: 'loin de la cible', gris: 'sans cible' }[f] || ''; }
  function telecharger(nom, contenu, type) {
    const blob = new Blob([contenu], { type: type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: nom });
    document.body.appendChild(a); a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 1500);
  }
  function copier(texte) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(texte);
    return new Promise(function (res, rej) {
      const ta = h('textarea', { style: 'position:fixed;opacity:0', 'aria-hidden': 'true' }); ta.value = texte; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); res(); } catch (e) { rej(e); } ta.remove();
    });
  }
  function enLigne() { return navigator.onLine !== false; }
  function reduit() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  /* <dialog> natif : focus et inert gérés par le navigateur */
  function feuille(titre, corps, opts) {
    const o = opts || {};
    const dlg = h('dialog.do-feuille', { 'aria-labelledby': 'do-feuille-titre' });
    const fermerBtn = h('button.do-btn.do-btn-pilule', { type: 'button', text: 'Fermer', 'aria-label': 'Fermer ' + titre });
    dlg.appendChild(h('div.do-feuille-tete', h('h2#do-feuille-titre', { text: titre }), fermerBtn));
    const z = h('div.do-feuille-corps'); ajouter(z, corps); dlg.appendChild(z);
    /* boutons d'action toujours visibles en bas de la feuille */
    if (o.pied) { dlg.classList.add('do-feuille-a-pied'); dlg.appendChild(h('div.do-feuille-pied', o.pied)); }
    const fermer = function () { try { dlg.close(); } catch (e) { } };
    fermerBtn.addEventListener('click', fermer);
    dlg.addEventListener('click', function (e) { if (e.target === dlg && !o.fixe) fermer(); });
    dlg.addEventListener('close', function () { dlg.remove(); if (o.surFermeture) o.surFermeture(); });
    document.body.appendChild(dlg);
    try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); }
    const f = dlg.querySelector('input, textarea, select, button:not(.do-btn-pilule)'); if (f && o.focus !== false) setTimeout(function () { f.focus(); }, 30);
    return { el: dlg, fermer: fermer };
  }
  function pluriel(n, un, plus) { return n + '\u00a0' + (n > 1 ? plus : un); }
  return { typo: typo, montrer: montrer, h: h, ajouter: ajouter, vider: vider, debounce: debounce, annoncer: annoncer, toast: toast, confirmer: confirmer, garde: garde, lireNote: lireNote, champNote: champNote, champTexte: champTexte, pilules: pilules, kicker: kicker, badge: badge, bouton: bouton, vide: vide, feuPoint: feuPoint, nomFeu: nomFeu, telecharger: telecharger, copier: copier, enLigne: enLigne, reduit: reduit, feuille: feuille, pluriel: pluriel };
})();
