/* ===== Mon dossier Parcoursup · « Mon histoire » : activités, lettres, Citemoi, mes faits ===== */
'use strict';
window.DOSSIER_VUES = window.DOSSIER_VUES || {};
window.DOSSIER_VUES.histoire = function (corps, pied, param, sub) {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h, A = window.DOSSIER, IA = window.DOSSIER_IA;
  const S = E.S, T = S.textes;
  const onglet = ['activites', 'lettres', 'citemoi', 'faits'].indexOf(param) !== -1 ? param : 'activites';
  corps.appendChild(U.pilules({ label: 'Onglets', items: [{ id: 'activites', texte: 'Activités' }, { id: 'lettres', texte: 'Lettres' }, { id: 'citemoi', texte: 'Citemoi' }, { id: 'faits', texte: 'Mes faits' }], actif: onglet, surChoix: function (id) { A.nav('histoire', id, '', true); } }));
  const RUBRIQUES = [
    ['pro', 'Expérience professionnelle', 'Stages, petits boulots, démarches (forums, journées portes ouvertes, rencontres). Précise depuis quand et à quelle fréquence.', ['Depuis {mois année}, je ', 'Chaque semaine, je consacre {n} heures à ', 'Ce que j’en retire : ']],
    ['citoyen', 'Engagement citoyen', 'Bénévolat, délégué, association, service civique, engagement lycéen (JPO, journées d’intégration).', ['Depuis {mois année}, je participe à ', 'Mon rôle : ', 'Ce que j’en retire : ']],
    ['monde', 'Ouverture au monde', 'Langues, séjours, échanges, lectures, projets personnels.', ['Je pratique {langue} depuis ', 'J’ai découvert ', 'Ce que j’en retire : ']],
    ['sport', 'Sport et culture', 'Sport (niveau, fréquence, compétition), musique, théâtre, dessin, jeux.', ['Je pratique {activité} depuis {année}, {n} fois par semaine. ', 'Mon meilleur souvenir : ', 'Ce que ça m’apprend : ']]
  ];
  const sauver = U.debounce(function () { E.sauver(); }, 400);

  /* ---- éditeur commun ---- */
  function editeur(opts) {
    const t = opts.texte;
    const card = h('article.do-bloc.do-editeur', { id: opts.id });
    const tete = h('div.do-editeur-tete');
    tete.appendChild(h('h3.do-kicker', { text: opts.titre }));
    const compte = h('span.do-compte', { 'aria-live': 'polite' });
    tete.appendChild(compte);
    card.appendChild(tete);
    if (opts.rappel) card.appendChild(h('p.do-aide', { text: opts.rappel }));
    const ta = h('textarea.do-texte.do-texte-long', { 'aria-label': opts.titre, rows: 6, placeholder: opts.placeholder || '', spellcheck: 'true' });
    ta.value = t.txt || '';
    card.appendChild(ta);
    const depasse = h('p.do-err', { 'aria-live': 'polite' });
    card.appendChild(depasse);
    let derniereVersion = t.txt || '';
    const pousserVersion = function () { if ((t.versions[t.versions.length - 1] || '') === derniereVersion) return; t.versions.push(derniereVersion); if (t.versions.length > 3) t.versions.shift(); };
    const annuler = h('button.do-lien-btn', { type: 'button', text: 'Annuler la dernière modification', hidden: true });
    let annulerT = 0;
    annuler.addEventListener('click', function () { const v = t.versions.pop(); if (v == null) return; ta.value = v; t.txt = v; t.maj = E.maintenant(); E.sauver(); majCompte(); annuler.hidden = true; U.annoncer('Modification annulée'); });
    const auto = function () { ta.style.height = 'auto'; ta.style.height = Math.min(600, Math.max(120, ta.scrollHeight + 4)) + 'px'; };
    ta.addEventListener('input', function () {
      if (!annulerT) pousserVersion();
      clearTimeout(annulerT); annulerT = setTimeout(function () { annulerT = 0; derniereVersion = ta.value; }, 30000);
      t.txt = ta.value; t.maj = E.maintenant(); sauver(); majCompte(); auto();
      annuler.hidden = !t.versions.length; clearTimeout(annuler._t); annuler._t = setTimeout(function () { annuler.hidden = true; }, 30000);
    });
    function majCompte() {
      if (opts.mots) { const c = C.compteurMots(ta.value, opts.mots[0], opts.mots[1]); compte.textContent = c.mots + ' mot' + (c.mots > 1 ? 's' : '') + ' (' + opts.mots[0] + ' à ' + opts.mots[1] + ')'; compte.className = 'do-compte do-compte-' + c.etat; depasse.textContent = ''; return; }
      const c = C.compteur(ta.value, 1500);
      compte.textContent = C.fmtEntier(c.caracteres) + ' / 1 500 caractères · ' + c.mots + ' mot' + (c.mots > 1 ? 's' : '');
      compte.className = 'do-compte do-compte-' + c.etat;
      depasse.textContent = c.etat === 'rouge' ? 'Parcoursup refusera au-delà de 1 500 caractères.' : '';
    }
    majCompte(); setTimeout(auto, 0);
    const acts = h('div.do-acts');
    acts.appendChild(U.bouton('Insérer un fait', function () { choisirFait(ta, function () { ta.dispatchEvent(new Event('input')); }); }, 'do-btn-sec'));
    acts.appendChild(U.bouton('Copier', function () { U.copier(ta.value).then(function () { U.toast('Copié'); U.annoncer('Copié'); }).catch(function () { U.toast('Impossible de copier ici : sélectionne le texte.'); }); }, 'do-btn-sec'));
    const ia = U.bouton(IA.enLigne() ? 'Relire avec l’IA' : 'Relire avec l’IA · hors ligne', function () { relire(ta.value, opts, card); }, 'do-btn-sec' + (IA.dispo() && IA.enLigne() ? '' : ' do-btn-off'));
    if (!IA.dispo()) ia.title = 'Ajoute ta clé IA dans les réglages IA de l’app';
    acts.appendChild(ia);
    card.appendChild(acts);
    if (opts.amorces) {
      const am = h('div.do-amorces');
      opts.amorces.forEach(function (a) { am.appendChild(h('button.do-amorce', { type: 'button', text: a, onclick: function () { inserer(ta, a); ta.dispatchEvent(new Event('input')); ta.focus(); } })); });
      card.appendChild(am);
    }
    card.appendChild(annuler);
    card.appendChild(h('p.do-aide', { text: (t.maj ? 'Modifié le ' + C.fmtDate(t.maj.slice(0, 10), 'jm') + ' · ' : '') + (opts.echeance || 'modifiable sur Parcoursup jusqu’au 1er avril 2027, 23 h 59') }));
    return card;
  }
  function inserer(ta, texte) {
    const a = ta.selectionStart, b = ta.selectionEnd, v = ta.value;
    const avant = v.slice(0, a), apres = v.slice(b);
    const sep = avant && !/\s$/.test(avant) ? ' ' : '';
    ta.value = avant + sep + texte + apres;
    const pos = (avant + sep + texte).length; ta.setSelectionRange(pos, pos);
  }
  function choisirFait(ta, apres) {
    const z = h('div');
    if (!T.faits.length) z.appendChild(h('p.do-texte', { text: 'Aucun fait enregistré. Ajoute-les dans l’onglet « Mes faits » ou remplis la fiche Citemoi.' }));
    const ul = h('ul.do-liste');
    T.faits.forEach(function (f) { ul.appendChild(h('li', h('button.do-ligne.do-btn-ligne', { type: 'button', onclick: function () { inserer(ta, f.texte); fe.fermer(); apres(); ta.focus(); } }, h('span', { text: f.texte }), h('span.do-aide', { text: f.date ? C.fmtDate(f.date, 'num') : '' })))); });
    z.appendChild(ul);
    const fe = U.feuille('Insérer un fait', z);
  }
  async function relire(texte, opts, card) {
    const ancien = card.querySelector('.do-ia-bloc'); if (ancien) ancien.remove();
    if (!IA.dispo()) { card.appendChild(h('div.do-ia-bloc', h('p.do-ia', { text: 'Pour la relecture, ajoute ta clé IA dans les réglages IA de l’app (accueil des exercices, bouton Réglages IA). Sans elle, relis ton texte avec le plan en 4 points.' }))); return; }
    if (!IA.enLigne()) { card.appendChild(h('div.do-ia-bloc', h('p.do-ia', { text: 'Hors ligne : la relecture sera possible une fois connecté.' }))); return; }
    if (!texte.trim()) { U.toast('Écris d’abord quelques lignes.'); return; }
    const bloc = h('div.do-ia-bloc', h('p.do-ia', { text: 'Ton texte part chez Groq avec ta clé, pour une relecture. N’y mets ni ton nom ni ton adresse.' }), h('p.do-texte', { 'aria-live': 'polite', text: 'Relecture en cours…' }));
    card.appendChild(bloc);
    try {
      const rem = await IA.relire(texte, opts.titre, opts.contexte || '');
      U.vider(bloc);
      bloc.appendChild(h('p.do-ia', { text: 'Produit par une IA : relecture, pas rédaction. Parcoursup rappelle que ton texte doit être le tien.' }));
      const ul = h('ul.do-remarques'); rem.forEach(function (r) { ul.appendChild(h('li', { text: r })); }); bloc.appendChild(ul);
      U.annoncer('Relecture reçue');
    } catch (e) { U.vider(bloc); bloc.appendChild(h('p.do-ia', { text: IA.message(e) })); }
  }

  /* ---- onglets ---- */
  if (onglet === 'activites') {
    if (!T.vuAvertissementPP) {
      const cb = h('input', { type: 'checkbox', id: 'do-pp-compris' });
      cb.addEventListener('change', function () { if (cb.checked) { T.vuAvertissementPP = true; E.sauver(); band.remove(); } });
      const band = h('div.do-encadre', h('p', { text: 'Nouveauté 2026 : avec ton accord, ton professeur principal peut lire cette rubrique pour rédiger ta fiche Avenir. Rédige-la avant le conseil de classe du T2. (Source : note Parcoursup « La fiche Avenir », mars 2026.)' }), h('label.do-case', cb, h('span', { text: 'Compris' })));
      corps.appendChild(band);
    }
    RUBRIQUES.forEach(function (r) { corps.appendChild(editeur({ id: 'do-rub-' + r[0], titre: r[1], texte: T.activites[r[0]], rappel: r[2], amorces: r[3], contexte: 'Rubrique « Activités et centres d’intérêt » de Parcoursup, 1 500 caractères, facultative mais lue par le professeur principal pour la fiche Avenir.' })); });
    if (sub) setTimeout(function () { const el = document.getElementById('do-rub-' + sub); if (el) { el.scrollIntoView({ block: 'start' }); const ta = el.querySelector('textarea'); if (ta) ta.focus({ preventScroll: true }); } }, 50);
  } else if (onglet === 'lettres') {
    corps.appendChild(h('div.do-encadre', h('p', { text: '1 500 caractères espaces compris. Sans date, sans en-tête, sans ton nom. Tu peux la modifier jusqu’au 1er avril 2027. Ton professeur principal peut la lire lors du conseil du T2.' }),
      h('details.do-plan', h('summary', { text: 'Plan en 4 points' }), h('ol', h('li', { text: 'Pourquoi cette formation (ce que tu y as vu : JPO, programme, débouchés)' }), h('li', { text: 'Ce que j’ai fait qui le prouve (faits chiffrés, Citemoi, stages)' }), h('li', { text: 'Mon projet (ce que je veux apprendre, où je me vois après)' }), h('li', { text: 'Ce que j’apporte (qualités montrées par des faits, pas déclarées)' })))));
    const voeux = E.voeuxTries().map(E.formationDe).filter(function (f) { return f.lettreDemandee; });
    if (!voeux.length) corps.appendChild(U.vide('Aucune lettre demandée.', 'Coche « Lettre de motivation demandée » sur un vœu dans l’écran Jury.'));
    voeux.forEach(function (f) {
      if (f.canal === 'direct') { corps.appendChild(editeur({ id: 'do-lettre-albert', titre: 'Lettre ' + f.court + ' (300 à 400 mots)', texte: T.albert.lm, mots: f.lettreMots || [300, 400], rappel: 'Candidature directe : lettre de 300 à 400 mots, avec le CV et deux relevés.', echeance: 'à envoyer avant le test, au plus tard le 15 décembre 2026', contexte: 'Lettre pour Albert School (école de commerce et data, candidature directe), 300 à 400 mots.' })); return; }
      if (!T.lettres[f.id]) T.lettres[f.id] = E.texteVide();
      corps.appendChild(editeur({ id: 'do-lettre-' + f.id, titre: 'Lettre ' + f.court, texte: T.lettres[f.id], rappel: (f.lettreUsage ? 'Usage annoncé : ' + f.lettreUsage + (f.grille && f.grille.motivation ? ', ' + f.grille.motivation + ' % de la grille' : '') + '.' : '') + (f.lettreAConfirmer ? ' Demande à confirmer sur la fiche 2027.' : ''), contexte: 'Lettre de motivation Parcoursup pour ' + f.nom + (f.grille ? ' (grille : résultats ' + f.grille.resultats + ' %, méthode ' + f.grille.methode + ' %, savoir-être ' + f.grille.savoirEtre + ' %, motivation ' + f.grille.motivation + ' %, engagement ' + f.grille.engagement + ' %)' : '') + '.' }));
    });
    corps.appendChild(h('p.do-aide', 'Ajouter une lettre pour un autre vœu : coche « Lettre de motivation demandée » dans ', h('a.do-lien', { href: '#jury', text: 'l’écran Jury' }), '.'));
    if (sub) setTimeout(function () { const el = document.getElementById('do-lettre-' + sub); if (el) { el.scrollIntoView({ block: 'start' }); const ta = el.querySelector('textarea'); if (ta) ta.focus({ preventScroll: true }); } }, 50);
  } else if (onglet === 'citemoi') citemoi();
  else faits();

  function citemoi() {
    const cm = T.citemoi;
    const b = h('section.do-bloc');
    b.appendChild(h('h3.do-kicker', { text: 'Citemoi · fiche structurée' }));
    b.appendChild(h('p.do-aide', { text: 'Ces chiffres nourrissent la rubrique Expérience professionnelle, tes lettres et la banque « Mes faits ». Rien n’est inventé : seuls les champs remplis sont utilisés.' }));
    const num = function (label, k, aide) { return U.champTexte(label, cm[k] == null ? '' : cm[k], function (v) { const n = parseInt(v, 10); cm[k] = isNaN(n) ? null : n; sauver(); }, { inputmode: 'numeric', aide: aide }).el; };
    b.appendChild(h('div.do-rangee', U.champTexte('Depuis', cm.depuis || '', function (v) { cm.depuis = v.trim(); sauver(); }, { type: 'month', placeholder: '2026-05' }).el, U.champTexte('En une phrase', cm.pitch || '', function (v) { cm.pitch = v.trim(); sauver(); }, { placeholder: 'agence de visibilité dans les IA pour les commerces locaux' }).el));
    b.appendChild(h('div.do-rangee.do-rangee-4', num('Heures par semaine', 'heuresSemaine'), num('Prospects contactés', 'prospects'), num('Devis envoyés', 'devis'), num('Clients signés', 'clients')));
    b.appendChild(U.champTexte('Outils', cm.outils || '', function (v) { cm.outils = v.trim(); sauver(); }, { placeholder: 'ChatGPT, Google Business, Canva' }).el);
    const comp = ['prospection', 'devis et facturation', 'relation client', 'outils numériques', 'organisation', 'communication'];
    const zc = h('div.do-cases', h('span.do-champ-l', { text: 'Compétences mobilisées' }));
    comp.forEach(function (c, i) { const cb = h('input', { type: 'checkbox', id: 'do-cm-c' + i, checked: cm.competences.indexOf(c) !== -1 }); cb.addEventListener('change', function () { cm.competences = comp.filter(function (x, j) { return document.getElementById('do-cm-c' + j).checked; }); sauver(); }); zc.appendChild(h('label.do-case', cb, h('span', { text: c }))); });
    b.appendChild(zc);
    const liens = ['GF (devis, marge, trésorerie)', 'MSDGN (stratégie, numérique)', 'droit (contrat, statut)'];
    const zl = h('div.do-cases', h('span.do-champ-l', { text: 'Lien avec mes cours' }));
    liens.forEach(function (c, i) { const cb = h('input', { type: 'checkbox', id: 'do-cm-l' + i, checked: cm.liens.indexOf(c) !== -1 }); cb.addEventListener('change', function () { cm.liens = liens.filter(function (x, j) { return document.getElementById('do-cm-l' + j).checked; }); sauver(); }); zl.appendChild(h('label.do-case', cb, h('span', { text: c }))); });
    b.appendChild(zl);
    const z = h('div');
    b.appendChild(h('div.do-acts', U.bouton('Composer un brouillon pour « Expérience professionnelle »', function () {
      const txt = C.brouillonCitemoi(cm);
      if (!txt) { U.toast('Remplis au moins un champ.'); return; }
      const faire = function () {
        T.activites.pro.versions.push(T.activites.pro.txt || ''); if (T.activites.pro.versions.length > 3) T.activites.pro.versions.shift();
        T.activites.pro.txt = txt; T.activites.pro.maj = E.maintenant();
        ajouterFaitsCitemoi(); E.sauver(); A.nav('histoire', 'activites', 'pro', true); U.toast('Brouillon placé dans Expérience professionnelle : termine-le toi-même.');
      };
      if (T.activites.pro.txt.trim()) U.confirmer(z, 'Remplacer le texte actuel de « Expérience professionnelle » ?', faire, 'Oui, remplacer', 'Annuler'); else faire();
    }, 'do-btn-prim'))); b.appendChild(z);
    corps.appendChild(b);
    function ajouterFaitsCitemoi() {
      const parts = [];
      if (typeof cm.prospects === 'number') parts.push(cm.prospects + ' prospects contactés');
      if (typeof cm.devis === 'number') parts.push(cm.devis + ' devis');
      if (typeof cm.clients === 'number') parts.push(cm.clients + ' client' + (cm.clients > 1 ? 's' : ''));
      if (!parts.length) return;
      const texte = 'Citemoi : ' + parts.join(', ') + (cm.depuis ? ' depuis ' + (function () { const m2 = /^(\d{4})-(\d{2})$/.exec(cm.depuis); return m2 ? C.MOIS[+m2[2] - 1] + ' ' + m2[1] : cm.depuis; })() : '');
      const existant = T.faits.find(function (f) { return f.id === 'f-citemoi'; });
      if (existant) { existant.texte = texte; existant.date = C.iso(M.aujourdhui()); } else T.faits.unshift({ id: 'f-citemoi', texte: texte, date: C.iso(M.aujourdhui()) });
    }
    pied.appendChild(U.bouton('Activités', function () { A.nav('histoire', 'activites', '', true); }, 'do-btn-sec'));
    pied.appendChild(U.bouton('Mes faits', function () { A.nav('histoire', 'faits', '', true); }, 'do-btn-prim'));
  }
  function faits() {
    const b = h('section.do-bloc');
    b.appendChild(h('h3.do-kicker', { text: 'Mes faits · courts, datés, chiffrés' }));
    b.appendChild(h('p.do-aide', { text: 'Un fait = une phrase avec un chiffre ou une date. Insère-les d’un tap dans n’importe quel texte.' }));
    const ul = h('ul.do-liste');
    const rendreListe = function () {
      U.vider(ul);
      if (!T.faits.length) { ul.appendChild(h('li.do-aide', { text: 'Exemples : « JPO IUT de Bordeaux, 7 février 2027 », « Stage de 3e chez … », « 40 prospects contactés depuis mai 2026 ».' })); return; }
      T.faits.forEach(function (f) {
        const li = h('li.do-fait-l');
        li.appendChild(h('span.do-fait-t', { text: f.texte }));
        li.appendChild(h('span.do-aide', { text: f.date ? C.fmtDate(f.date, 'num') : '' }));
        li.appendChild(h('button.do-btn.do-btn-x', { type: 'button', text: 'Retirer', 'aria-label': 'Retirer le fait : ' + f.texte, onclick: function () { T.faits = T.faits.filter(function (x) { return x.id !== f.id; }); E.sauver(); rendreListe(); } }));
        ul.appendChild(li);
      });
    };
    rendreListe();
    b.appendChild(ul);
    const texte = h('input.do-texte', { type: 'text', placeholder: 'JPO IUT de Bordeaux', 'aria-label': 'Texte du fait' });
    const date = h('input.do-texte', { type: 'date', 'aria-label': 'Date du fait' });
    b.appendChild(h('div.do-rangee', h('label.do-champ', h('span.do-champ-l', { text: 'Fait' }), texte), h('label.do-champ', h('span.do-champ-l', { text: 'Date' }), date)));
    b.appendChild(U.bouton('Ajouter un fait', function () { const t = texte.value.trim(); if (!t) { texte.focus(); return; } T.faits.unshift({ id: 'f-' + Date.now().toString(36), texte: t, date: date.value || '' }); E.sauver(); texte.value = ''; date.value = ''; rendreListe(); U.annoncer('Fait ajouté'); }, 'do-btn-sec'));
    corps.appendChild(b);
    pied.appendChild(U.bouton('Citemoi', function () { A.nav('histoire', 'citemoi', '', true); }, 'do-btn-sec'));
    pied.appendChild(U.bouton('Activités', function () { A.nav('histoire', 'activites', '', true); }, 'do-btn-prim'));
  }
  if (onglet === 'activites' || onglet === 'lettres') {
    pied.appendChild(U.bouton(onglet === 'activites' ? 'Lettres' : 'Activités', function () { A.nav('histoire', onglet === 'activites' ? 'lettres' : 'activites', '', true); }, 'do-btn-sec'));
    pied.appendChild(U.bouton('Tableau de bord', function () { A.nav('tableau'); }, 'do-btn-prim'));
  }
};
