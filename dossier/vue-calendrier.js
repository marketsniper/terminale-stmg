/* ===== Mon dossier Parcoursup · « Les dates qui figent l'histoire » ===== */
'use strict';
window.DOSSIER_VUES = window.DOSSIER_VUES || {};
window.DOSSIER_VUES.calendrier = function (corps, pied, param) {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, U = window.DOSSIER_UI, M = window.DOSSIER_MODELE, h = U.h, A = window.DOSSIER;
  const m = M.calculer(), S = m.S;
  const jalons = m.jalons;
  const prochain = m.prochain;
  if (prochain) {
    const b = h('section.do-bloc.do-jalon');
    b.appendChild(h('h3.do-kicker', { text: 'Prochain jalon' }));
    const l1 = h('div.do-jalon-l1');
    const ch = h('p.do-chiffre' + (prochain.jours <= 7 ? '.do-j7' : prochain.jours <= 14 ? '.do-j14' : ''));
    if (prochain.jours === 0) ch.appendChild(h('b', { text: 'C’est aujourd’hui.' })); else { ch.appendChild(h('b', { text: String(prochain.jours) })); ch.appendChild(h('span', { text: prochain.jours > 1 ? ' jours' : ' jour' })); }
    l1.appendChild(ch);
    l1.appendChild(h('p.do-jalon-titre', { text: prochain.titre + ' · ' + C.fmtDate(prochain.date) }));
    b.appendChild(l1);
    corps.appendChild(b);
  }
  corps.appendChild(h('p.do-aide', { text: 'Les trimestres surlignés sont ceux que les écoles verront : chaque note compte jusqu’au conseil de classe. Les dates « à confirmer » viennent du calendrier 2026 ou de la presse ; relis-les le 17 décembre.' }));
  let mois = '';
  const liste = h('ol.do-jalons');
  const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  jalons.forEach(function (j) {
    const mk = j.date ? j.date.slice(0, 7) : 'zz';
    if (mk !== mois) { mois = mk; const d = C.dateDe(j.date); liste.appendChild(h('li.do-mois', { text: d ? C.MOIS[d.getMonth()].charAt(0).toUpperCase() + C.MOIS[d.getMonth()].slice(1) + ' ' + d.getFullYear() : 'Sans date' })); }
    const passe = j.jours != null && j.jours < 0;
    const li = h('li.do-jalon-l' + (passe ? '.do-passe' : '') + (j.fait ? '.do-fait' : '') + (j.fenetre ? '.do-fenetre' : ''), { id: 'do-j-' + j.id });
    /* colonne de gauche : la date, toujours à la même place */
    const d = C.dateDe(j.date);
    li.appendChild(h('div.do-jalon-quand', { 'aria-hidden': 'true' }, d ? [h('b', { text: String(d.getDate()) }), h('span', { text: C.MOIS_C[d.getMonth()] }), h('span', { text: JOURS[d.getDay()] })] : h('span', { text: 'date à saisir' })));
    const corpsJ = h('div.do-jalon-c');
    const tete = h('div.do-jalon-tete');
    tete.appendChild(h('span.do-sr', { text: j.date ? C.fmtDate(j.date) + (j.fin ? ' au ' + C.fmtDate(j.fin) : '') + ' : ' : 'Date à saisir : ' }));
    tete.appendChild(h('span.do-jalon-nom', { text: j.titre }));
    if (j.perso) tete.appendChild(U.badge('ajouté par toi', 'ok'));
    else if (j.saisie && j.verifie && S.dates[j.cleDate] === j.defaut) tete.appendChild(U.badge('vérifié, lu dans l’app', 'ok'));
    else if (j.saisie) tete.appendChild(U.badge('saisi par toi', 'ok'));
    else if (j.verifie && !j.aConfirmer) tete.appendChild(U.badge('vérifié', 'ok'));
    else tete.appendChild(U.badge('à confirmer', 'attente'));
    if (!passe && j.jours != null) tete.appendChild(h('span.do-jalon-j', { text: j.jours === 0 ? 'aujourd’hui' : 'J−' + j.jours }));
    corpsJ.appendChild(tete);
    if (j.fin) corpsJ.appendChild(h('p.do-aide', { text: 'jusqu’au ' + C.fmtDate(j.fin, 'court') }));
    if (j.change) corpsJ.appendChild(h('p.do-texte', 'Ce que ça change : ' + j.change));
    if (j.source && !j.perso) corpsJ.appendChild(h('p.do-source', { text: 'Source : ' + j.source }));
    if (j.id === 'conseil-t1' || j.id === 'conseil-t2') {
      const ev = C.evaluationsAvant(m.sig.echeances, M.finNotes(S, j.id === 'conseil-t1' ? 'T-T1' : 'T-T2'), m.auj);
      if (ev.length) { const p = h('p.do-texte.do-ds', 'DS d’ici là : '); ev.forEach(function (e) { p.appendChild(h('button.do-puce', { type: 'button', text: (e.matiere ? C.courtDe(e.matiere) : e.titre) + ' ' + C.fmtDate(e.due, 'jm'), onclick: function () { if (e.chapitre) A.versHote('#' + e.chapitre); } })); }); corpsJ.appendChild(p); }
    }
    if (j.taches.length) {
      const ul = h('ul.do-taches');
      j.taches.forEach(function (t) {
        const id = 'do-t-' + j.id + '-' + t.id;
        const cb = h('input', { type: 'checkbox', id: id, checked: t.fait });
        cb.addEventListener('change', function () { const e = S.jalons.etat[j.id] || (S.jalons.etat[j.id] = { fait: null, taches: {} }); e.taches = e.taches || {}; e.taches[t.id] = cb.checked; E.sauver(); });
        ul.appendChild(h('li', h('label.do-case', cb, h('span', { text: t.t }))));
      });
      corpsJ.appendChild(ul);
    }
    const acts = h('div.do-acts.do-acts-mini');
    if (j.lien) acts.appendChild(h('button.do-lien-btn', { type: 'button', text: 'Ouvrir dans l’app ›', onclick: function () { A.versHote(j.lien); } }));
    /* « Je l'ai fait » : seulement pour ce qui dépend de toi (pas pour un conseil de classe ou une publication) */
    const actionnable = j.perso || j.action || j.taches.length;
    if (actionnable && (!passe || !j.fait)) {
      const id = 'do-f-' + j.id;
      const cb = h('input', { type: 'checkbox', id: id, checked: !!j.fait });
      cb.addEventListener('change', function () {
        if (j.perso) { const p = S.jalons.perso.find(function (x) { return x.id === j.id; }); if (p) p.fait = cb.checked ? E.maintenant() : null; }
        else { const e = S.jalons.etat[j.id] || (S.jalons.etat[j.id] = { fait: null, taches: {} }); e.fait = cb.checked ? E.maintenant() : null; }
        E.sauver(); li.classList.toggle('do-fait', cb.checked); U.annoncer(cb.checked ? 'Jalon fait' : 'Jalon à faire');
      });
      acts.appendChild(h('label.do-case', cb, h('span', { text: 'Je l’ai fait' })));
    }
    if (j.perso) acts.appendChild(h('button.do-lien-btn', { type: 'button', text: 'Retirer', 'aria-label': 'Retirer le jalon ' + j.titre, onclick: function () { U.confirmer(li, 'Retirer ce jalon ?', function () { S.jalons.perso = S.jalons.perso.filter(function (x) { return x.id !== j.id; }); E.sauver(); A.rendre(); }, 'Oui, retirer', 'Annuler'); } }));
    if (acts.firstChild) corpsJ.appendChild(acts);
    /* date du lycée : champ replié derrière « Modifier la date » (ouvert d'office si elle manque) */
    if (j.cleDate) {
      const inp = h('input.do-texte', { type: 'date', 'aria-label': 'Date : ' + j.titre, value: S.dates[j.cleDate] || '' });
      inp.addEventListener('change', function () { S.dates[j.cleDate] = inp.value || null; E.sauver(); A.rendre(); });
      corpsJ.appendChild(h('details.do-plus.do-date-j', { open: !!j.manque }, h('summary', { text: j.manque ? 'Saisir la date' : 'Modifier la date' }), h('label.do-champ', h('span.do-champ-l', { text: 'Date donnée par ton lycée (jj/mm/aaaa)' }), inp)));
    }
    li.appendChild(corpsJ);
    liste.appendChild(li);
  });
  corps.appendChild(liste);
  if (param) setTimeout(function () { const el = document.getElementById('do-j-' + param); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('do-vise'); } }, 50);

  pied.appendChild(U.bouton('Exporter (.ics)', function () { U.telecharger('mon-dossier-parcoursup.ics', ics(jalons), 'text/calendar'); U.toast('Fichier .ics prêt : ouvre-le pour l’ajouter à ton calendrier.'); }, 'do-btn-sec'));
  pied.appendChild(U.bouton('Ajouter un jalon', ajouter, 'do-btn-prim'));

  /* un événement « journée entière » par jalon daté, rappel la veille à 18 h (6 h avant le début du jour, RFC 5545) */
  function ics(js) {
    const esc = function (s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); };
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const l = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Terminale STMG//Mon dossier Parcoursup//FR', 'CALSCALE:GREGORIAN'];
    js.forEach(function (j) {
      if (!j.date) return;
      const d = j.date.replace(/-/g, ''), fin = j.fin ? j.fin : j.date;
      const f2 = C.dateDe(fin); f2.setDate(f2.getDate() + 1);
      l.push('BEGIN:VEVENT', 'UID:stmg-dossier-' + j.id + '@terminale-stmg', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + C.iso(f2).replace(/-/g, ''), 'SUMMARY:' + esc(j.titre), 'DESCRIPTION:' + esc((j.change || '') + (j.aConfirmer ? ' (date à confirmer)' : '')), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(j.titre), 'TRIGGER:-PT6H', 'END:VALARM', 'END:VEVENT');
    });
    l.push('END:VCALENDAR');
    return l.join('\r\n') + '\r\n';
  }
  function ajouter() {
    const z = h('div');
    const titre = U.champTexte('Titre', '', function () { }, { placeholder: 'JPO IUT de Bordeaux' });
    const date = h('input.do-texte', { type: 'date', 'aria-label': 'Date' });
    const change = U.champTexte('Ce que ça change', '', function () { }, { multi: true, rows: 2, placeholder: 'Je repars avec des questions pour la lettre.' });
    z.appendChild(titre.el); z.appendChild(h('label.do-champ', h('span.do-champ-l', { text: 'Date (jj/mm/aaaa)' }), date)); z.appendChild(change.el);
    const err = h('p.do-err', { 'aria-live': 'polite' }); z.appendChild(err);
    const ok = U.bouton('Ajouter', function () {
      const t = titre.input.value.trim(); if (!t) { err.textContent = 'Donne un titre.'; titre.input.focus(); return; } if (!date.value) { err.textContent = 'Choisis une date.'; date.focus(); return; }
      S.jalons.perso.push({ id: 'j-moi-' + Date.now().toString(36), date: date.value, titre: t, change: change.input.value.trim(), fait: null });
      E.sauver(); fe.fermer(); A.rendre(); U.annoncer('Jalon ajouté');
    }, 'do-btn-prim');
    const fe = U.feuille('Ajouter un jalon', z, { pied: [ok, U.bouton('Annuler', function () { fe.fermer(); }, 'do-btn-sec')] });
  }
};
