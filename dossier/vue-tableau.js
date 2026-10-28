/* ===== Mon dossier Parcoursup · tableau de bord « Ce que le jury lira » ===== */
'use strict';
window.DOSSIER_VUES = window.DOSSIER_VUES || {};
window.DOSSIER_VUES.tableau = function (corps, pied) {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h, A = window.DOSSIER;
  const m = M.calculer(), S = m.S;
  const nbPeriodes = C.PERIODES.filter(function (k) { return C.nbLignes(S.periodes[k]) > 0; }).length;

  /* ---- premier lancement : accueil ---- */
  if (!nbPeriodes) {
    const b = h('section.do-bloc.do-accueil', { 'aria-labelledby': 'do-acc-t' });
    b.appendChild(h('h2#do-acc-t.do-accueil-t', { text: 'Commence par ton bulletin de Première' }));
    b.appendChild(h('p.do-texte', { text: 'Importe le PDF que le lycée t’a donné : il est lu sur ton téléphone, sans réseau et sans IA. Tu vérifies, tu enregistres, et tout le reste se calcule.' }));
    b.appendChild(h('div.do-acts', U.bouton('Importer le PDF', function () {
      A.nav('bulletins', '1-T3', '', true);
      const f = document.querySelector('.do-vue-bulletins input[type=file][accept*="pdf"]'); if (f) f.click();
    }, 'do-btn-prim'), h('a.do-lien', { href: '#bulletins/1-T3', text: 'Saisir à la main' })));
    corps.appendChild(b);
  }

  /* ---- bloc 1 : prochain jalon ---- */
  (function () {
    const b = h('section.do-bloc.do-jalon', { 'aria-labelledby': 'do-jalon-t' });
    b.appendChild(h('h3#do-jalon-t.do-kicker', { text: 'Prochain jalon' }));
    const j = m.prochain;
    if (!j) { b.appendChild(h('p.do-gros', { text: 'Aucun jalon à venir.' })); corps.appendChild(b); return; }
    const n = j.jours;
    const ligne = h('div.do-jalon-l1');
    const chiffre = h('p.do-chiffre', { 'aria-live': 'off' });
    if (n === 0) chiffre.appendChild(h('b', { text: 'C’est aujourd’hui.' }));
    else { chiffre.appendChild(h('b', { text: String(n) })); chiffre.appendChild(h('span', { text: n > 1 ? ' jours' : ' jour' })); }
    if (n <= 7) chiffre.classList.add('do-j7'); else if (n <= 14) chiffre.classList.add('do-j14');
    ligne.appendChild(chiffre);
    ligne.appendChild(h('p.do-jalon-titre', j.titre + ' · ' + C.fmtDate(j.date), j.aConfirmer ? [' ', U.badge('à confirmer', 'attente')] : null));
    b.appendChild(ligne);
    if (j.id === 'conseil-t1' || j.id === 'conseil-t2') {
      const ev = m.evals.length;
      b.appendChild(h('p.do-texte', { text: ev ? U.pluriel(ev, 'évaluation', 'évaluations') + ' d’ici là ' + (ev > 1 ? 'peuvent' : 'peut') + ' encore bouger ta moyenne.' : 'Aucune évaluation prévue au planning d’ici là : ta moyenne tient à ce qui est déjà fait.' }));
    } else if (j.change) b.appendChild(h('p.do-texte', { text: j.change }));
    if (j.id === 'conseil-t2' && !S.dates.conseilT2) b.appendChild(h('p.do-texte', 'Date du conseil de classe à confirmer avec ton lycée. ', h('a.do-lien', { href: '#reglages', text: 'Saisir la date' })));
    if (!S.dates.conseilT2 && j.id !== 'conseil-t1' && m.enCours === 'T-T2') b.appendChild(h('p.do-texte', 'Le conseil du T1 est passé : saisis ton bulletin dès que tu l’as, et ', h('a.do-lien', { href: '#reglages', text: 'la date du conseil du T2' }), '.'));
    corps.appendChild(b);
  })();

  /* ---- bloc 2 : trajectoire ---- */
  (function () {
    const b = h('section.do-bloc.do-traj', { 'aria-labelledby': 'do-traj-t' });
    b.appendChild(h('h3#do-traj-t.do-kicker', { text: 'Ta trajectoire · moyenne pondérée' }));
    const t = m.traj;
    if (t.saisis < 2) { b.appendChild(h('p.do-texte', { text: 'Saisis au moins deux périodes pour voir ta trajectoire.' })); corps.appendChild(b); return; }
    const cible = m.premier ? m.premier.f.cible : null;
    b.appendChild(graphe(t.serie, cible, m.premier ? m.premier.f.court : ''));
    let ph = cible != null ? 'Pointillés verts : ta cible pour ' + m.premier.f.court + ' (' + C.fmt(cible) + '). ' : '';
    if (t.dynamique === 'hausse') ph += 'En hausse depuis la Première : ' + C.fmtDelta(t.delta) + '.';
    else if (t.dynamique === 'baisse') ph += 'En baisse : ' + C.fmtDelta(t.delta) + '. Les commissions lisent la dynamique : le T1 et le T2 de Terminale peuvent la retourner.';
    else ph += 'Stable depuis la Première (' + (Math.abs(t.delta) < 0.05 ? 'aucun écart' : C.fmtDelta(t.delta)) + ').';
    if (t.record) ph += ' Ta dernière période saisie est la meilleure jusqu’ici.';
    b.appendChild(h('p.do-texte', { text: ph }));
    corps.appendChild(b);
  })();
  function graphe(serie, cible, nomCible) {
    const g = h('div.do-graphe', { role: 'img', 'aria-label': 'Trajectoire : ' + serie.map(function (p) { return p.libelle + ' ' + (p.mp == null ? 'vide' : C.fmt(p.mp) + (p.projete ? ' projeté' : '')); }).join(', ') + (cible ? ' ; cible ' + C.fmt(cible) : '') });
    const MIN = 8, MAX = 18, y = function (v) { return 100 - (Math.max(MIN, Math.min(MAX, v)) - MIN) / (MAX - MIN) * 100; };
    const n = serie.length, x = function (i) { return (i + 0.5) / n * 100; };
    [10, 12, 14, 16, 18].forEach(function (v) { g.appendChild(h('div.do-graphe-ligne', { style: 'top:' + y(v) + '%', 'aria-hidden': 'true' }, h('span', { text: String(v) }))); });
    if (cible != null) g.appendChild(h('div.do-graphe-cible', { style: 'top:' + y(cible) + '%', 'aria-hidden': 'true' }, h('span', { text: 'cible ' + C.fmt(cible) })));
    let prev = null;
    serie.forEach(function (p, i) {
      const etiquette = function () { const l = h('div.do-pt-l', { style: 'left:' + x(i) + '%' }, p.libelle); if (p.projete) l.appendChild(h('i', { text: 'projeté' })); else if (p.code === m.enCours && p.mp != null) l.appendChild(h('i', { text: 'en cours' })); return l; };
      if (p.mp == null) { g.appendChild(etiquette()); prev = null; return; }
      const px = x(i), py = y(p.mp);
      if (prev) {
        const dx = px - prev.x, dy = py - prev.y;
        const seg = h('div.do-seg' + (p.projete ? '.do-seg-proj' : ''), { style: 'left:' + prev.x + '%;top:' + prev.y + '%;--dx:' + dx + ';--dy:' + dy });
        g.appendChild(seg);
      }
      g.appendChild(h('div.do-pt' + (p.projete ? '.do-pt-proj' : '') + (p.partiel ? '.do-pt-partiel' : ''), { style: 'left:' + px + '%;top:' + py + '%' }, h('b', { text: (p.projete ? '≈ ' : '') + C.fmt(p.mp) })));
      g.appendChild(etiquette());
      prev = { x: px, y: py };
    });
    /* les segments sont tracés par rotation : l'angle dépend des dimensions réelles, calculées après insertion */
    requestAnimationFrame(function () {
      const W = g.clientWidth, H = g.clientHeight;   // les points sont placés en % de la boîte : même repère pour les segments
      Array.prototype.forEach.call(g.querySelectorAll('.do-seg'), function (s) {
        const dx = parseFloat(s.style.getPropertyValue('--dx')) / 100 * W, dy = parseFloat(s.style.getPropertyValue('--dy')) / 100 * H;
        s.style.width = Math.sqrt(dx * dx + dy * dy) + 'px';
        s.style.transform = 'rotate(' + Math.atan2(dy, dx) * 180 / Math.PI + 'deg)';
      });
    });
    return g;
  }

  /* ---- bloc 3 : vœux ---- */
  (function () {
    const b = h('section.do-bloc.do-voeux', { 'aria-labelledby': 'do-voeux-t' });
    b.appendChild(h('h3#do-voeux-t.do-kicker', { text: 'Tes vœux' }));
    if (!m.voeux.length) { b.appendChild(U.vide('Aucun vœu.', 'Ajoute tes formations pour voir l’écart.', U.bouton('Mes vœux', function () { A.nav('jury'); }, 'do-btn-sec'))); corps.appendChild(b); return; }
    const ul = h('ul.do-liste');
    m.ordreVoeux.forEach(function (x) {
      const li = h('li');
      const a = h('a.do-ligne.do-voeu', { href: '#jury/' + encodeURIComponent(x.v.id), 'aria-label': x.f.court + ' : ' + U.nomFeu(x.feu) });
      a.appendChild(U.feuPoint(x.feu));
      a.appendChild(h('span.do-voeu-nom', { text: x.f.court }));
      if (x.f.canal === 'direct') a.appendChild(h('span.do-voeu-cible', { text: 'hors Parcoursup' }));
      else if (typeof x.f.cible !== 'number') a.appendChild(h('span.do-voeu-cible', { text: 'choisis une cible' }));
      else { a.appendChild(h('span.do-voeu-cible', { text: 'cible ' + C.fmt(x.f.cible) })); a.appendChild(x.E == null ? h('span.do-voeu-ecart.do-ton-gris', { text: 'à calculer' }) : h('b.do-voeu-ecart.do-ton-' + x.feu, { text: C.fmtDelta(-x.E) })); }
      a.appendChild(h('span.do-chevron', { 'aria-hidden': 'true', text: '›' }));
      li.appendChild(a); ul.appendChild(li);
    });
    b.appendChild(ul);
    if (m.ref.valeur != null) b.appendChild(h('p.do-aide', { text: 'Écarts calculés ' + m.ref.libelle + ' (' + C.fmt(m.ref.valeur) + ').' }));
    else b.appendChild(h('p.do-aide', { text: 'Les écarts apparaîtront dès ton premier bulletin saisi.' }));
    corps.appendChild(b);
  })();

  /* ---- bloc 4 : cette semaine ---- */
  (function () {
    const b = h('section.do-bloc.do-coach', { 'aria-labelledby': 'do-coach-t' });
    b.appendChild(h('h3#do-coach-t.do-kicker', { text: 'Cette semaine · 3 actions, pas plus' }));
    const ul = h('ul.do-liste.do-actions');
    m.coach.actions.forEach(function (a, i) {
      const id = 'do-act-' + i;
      const cb = h('input', { type: 'checkbox', id: id, checked: !!a.fait });
      cb.addEventListener('change', function () { M.cocher(m.coach.cle, i, cb.checked); li.classList.toggle('do-fait', cb.checked); U.annoncer(cb.checked ? 'Action faite' : 'Action à faire'); A.publierResume(); });
      const li = h('li.do-action' + (a.fait ? '.do-fait' : ''), h('label', { for: id }, cb, h('span', { text: a.txt })));
      if (a.lien) {
        const l = h('a.do-lien-act', { href: a.lien, text: a.action || 'Ouvrir' });
        if (a.hote || /^#(sommet|[a-z0-9]+-[0-9]+$|droit$|eco$|management$|gf$|philo$|hg$|maths$|anglais$|espagnol$|emc$)/.test(a.lien) && !/^#(tableau|bulletins|jury|simulateur|histoire|calendrier|reglages)/.test(a.lien)) l.addEventListener('click', function (e) { e.preventDefault(); A.versHote(a.lien); });
        li.appendChild(l);
      }
      ul.appendChild(li);
    });
    b.appendChild(ul);
    const sem = 'Semaine du ' + C.fmtDate(m.coach.lundi, 'jm');
    b.appendChild(h('p.do-aide', { text: sem + (m.coach.precedente ? ' · ' + m.coach.precedente.faites + ' action' + (m.coach.precedente.faites > 1 ? 's' : '') + ' faite' + (m.coach.precedente.faites > 1 ? 's' : '') + ' sur ' + m.coach.precedente.total + ' la semaine dernière' : '') }));
    corps.appendChild(b);
  })();

  /* ---- bloc 5 : ton histoire ---- */
  (function () {
    const b = h('section.do-bloc.do-histoire', { 'aria-labelledby': 'do-hist-t' });
    b.appendChild(h('h3#do-hist-t.do-kicker', { text: 'Ton histoire · ce que tu écris toi-même' }));
    const ul = h('ul.do-liste');
    const T = S.textes;
    const ligne = function (nom, txt, href, note, mots) {
      const c = C.compteur(txt, 1500);
      const a = h('a.do-ligne.do-hist-l', { href: href });
      a.appendChild(h('span.do-hist-nom', { text: nom }));
      const part = mots ? Math.min(100, c.mots / mots * 100) : Math.min(100, c.caracteres / 15);
      const barre = h('span.do-mini-barre', { 'aria-hidden': 'true' }, h('span', { style: 'width:' + part + '%' }));
      a.appendChild(barre);
      a.appendChild(h('span.do-hist-n', { text: mots ? (c.mots ? c.mots + ' / ' + mots + ' mots' : (note || 'vide')) : c.caracteres ? C.fmtEntier(c.caracteres) + ' / 1 500' : (note || 'vide') }));
      return h('li', a);
    };
    [['pro', 'Expérience professionnelle'], ['citoyen', 'Engagement citoyen'], ['monde', 'Ouverture au monde'], ['sport', 'Sport et culture']].forEach(function (r) { ul.appendChild(ligne(r[1], T.activites[r[0]].txt, '#histoire/activites/' + r[0])); });
    m.voeux.filter(function (x) { return x.f.lettreDemandee && x.f.canal !== 'direct'; }).forEach(function (x) { ul.appendChild(ligne('Lettre ' + x.f.court, (T.lettres[x.v.id] || {}).txt || '', '#histoire/lettres/' + encodeURIComponent(x.v.id), 'demandée, vide')); });
    if (m.voeux.some(function (x) { return x.f.canal === 'direct'; })) ul.appendChild(ligne('Lettre Albert School', T.albert.lm.txt, '#histoire/lettres/albert', 'facultative, vide', 400));
    b.appendChild(ul);
    b.appendChild(h('p.do-aide', { text: 'Ton professeur principal peut lire ces rubriques pour la fiche Avenir : finis-les avant le conseil du T2.' }));
    corps.appendChild(b);
  })();

  /* ---- bloc 6 : ce que l'app sait de toi ---- */
  (function () {
    const b = h('section.do-bloc.do-signaux', { 'aria-labelledby': 'do-sig-t' });
    b.appendChild(h('h3#do-sig-t.do-kicker', { text: 'Ce que l’app sait de toi' }));
    const s = m.sig;
    const rien = !s.fichesDone.length && s.dsMoyenne == null && !s.joursSeance;
    if (rien) { b.appendChild(h('p.do-texte', { text: 'Rien encore : les fiches, les séances et les DS blancs de l’app nourriront cette ligne.' })); corps.appendChild(b); return; }
    const g = h('div.do-gstats');
    const stat = function (val, leg) { g.appendChild(h('div.do-gstat', h('b', { text: val }), h('span', { text: leg }))); };
    stat(s.fichesTotal ? C.fmtPct(s.fichesFaites / s.fichesTotal) : String(s.fichesFaites), s.fichesTotal ? 'des fiches maîtrisées' : (s.fichesFaites > 1 ? 'fiches maîtrisées' : 'fiche maîtrisée'));
    stat(s.joursSeance + ' / 14', 'jours avec une séance');
    stat(s.dsMoyenne != null ? C.fmt(s.dsMoyenne) : '-', 'moyenne des DS blancs');
    b.appendChild(g);
    b.appendChild(h('p.do-aide', { text: 'Ces trois signaux alimentent le pilier « méthode » de l’écran Jury. Ils ne sont jamais transmis aux formations.' }));
    corps.appendChild(b);
  })();

  pied.appendChild(U.bouton(nbPeriodes ? 'Saisir un bulletin' : 'Commencer', function () { A.nav('bulletins'); }, 'do-btn-prim'));
  pied.appendChild(U.bouton('Et si', function () { A.nav('simulateur'); }, 'do-btn-sec'));
  U.annoncer('Dossier mis à jour');
};
