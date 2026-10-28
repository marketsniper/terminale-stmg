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
    const ch = h('p.do-chiffre' + (prochain.jours <= 7 ? '.do-j7' : prochain.jours <= 14 ? '.do-j14' : ''));
    if (prochain.jours === 0) ch.appendChild(h('b', { text: 'C\u2019est aujourd\u2019hui.' })); else { ch.appendChild(h('b', { text: String(prochain.jours) })); ch.appendChild(h('span', { text: prochain.jours > 1 ? ' jours' : ' jour' })); }
    b.appendChild(ch);
    b.appendChild(h('p.do-jalon-titre', { text: prochain.titre + ' \u00b7 ' + C.fmtDate(prochain.date) }));
    corps.appendChild(b);
  }
  corps.appendChild(h('p.do-aide', { text: 'Fenêtres T1 et T2 : tes notes dans ces fenêtres sont celles que les écoles verront. Les dates « à confirmer » viennent du calendrier 2026 ou de la presse ; relis-les le 17 décembre.' }));
  let mois = '';
  const liste = h('ol.do-jalons');
  jalons.forEach(function (j) {
    const mk = j.date ? j.date.slice(0, 7) : 'zz';
    if (mk !== mois) { mois = mk; const d = C.dateDe(j.date); liste.appendChild(h('li.do-mois', { text: d ? C.MOIS[d.getMonth()].charAt(0).toUpperCase() + C.MOIS[d.getMonth()].slice(1) + ' ' + d.getFullYear() : 'Sans date' })); }
    const passe = j.jours != null && j.jours < 0;
    const li = h('li.do-jalon-l' + (passe ? '.do-passe' : '') + (j.fait ? '.do-fait' : '') + (j.fenetre ? '.do-fenetre' : ''), { id: 'do-j-' + j.id });
    const tete = h('div.do-jalon-tete');
    tete.appendChild(h('span.do-jalon-date', { text: j.date ? C.fmtDate(j.date, 'court') + (j.fin ? ' \u2192 ' + C.fmtDate(j.fin, 'court') : '') : 'date à saisir' }));
    tete.appendChild(h('span.do-jalon-nom', { text: j.titre }));
    if (j.perso) tete.appendChild(U.badge('ajouté par toi', 'ok'));
    else if (j.saisie) tete.appendChild(U.badge('saisi', 'ok'));
    else if (j.verifie && !j.aConfirmer) tete.appendChild(U.badge('vérifié', 'ok'));
    else tete.appendChild(U.badge('à confirmer', 'attente'));
    if (!passe && j.jours != null) tete.appendChild(h('span.do-jalon-j', { text: j.jours === 0 ? 'aujourd\u2019hui' : 'J\u2212' + j.jours }));
    li.appendChild(tete);
    if (j.change) li.appendChild(h('p.do-texte', 'Ce que ça change : ' + j.change));
    if (j.source && !j.perso) li.appendChild(h('p.do-source', { text: 'Source : ' + j.source }));
    if (j.id === 'conseil-t1' || j.id === 'conseil-t2') {
      const ev = C.evaluationsAvant(m.sig.echeances, M.finNotes(S, j.id === 'conseil-t1' ? 'T-T1' : 'T-T2'), m.auj);
      if (ev.length) { const p = h('p.do-texte', 'DS d\u2019ici là : '); ev.forEach(function (e, i) { if (i) p.appendChild(document.createTextNode(' \u00b7 ')); const b = h('button.do-puce', { type: 'button', text: (e.matiere ? C.courtDe(e.matiere) : e.titre) + ' ' + C.fmtDate(e.due, 'jm'), onclick: function () { if (e.chapitre) A.versHote('#' + e.chapitre); } }); p.appendChild(b); }); li.appendChild(p); }
    }
    if (j.taches.length) {
      const ul = h('ul.do-taches');
      j.taches.forEach(function (t) {
        const id = 'do-t-' + j.id + '-' + t.id;
        const cb = h('input', { type: 'checkbox', id: id, checked: t.fait });
        cb.addEventListener('change', function () { const e = S.jalons.etat[j.id] || (S.jalons.etat[j.id] = { fait: null, taches: {} }); e.taches = e.taches || {}; e.taches[t.id] = cb.checked; E.sauver(); });
        ul.appendChild(h('li', h('label.do-case', cb, h('span', { text: t.t }))));
      });
      li.appendChild(ul);
    }
    const acts = h('div.do-acts.do-acts-mini');
    if (j.cleDate) {
      const inp = h('input.do-texte', { type: 'date', 'aria-label': 'Date : ' + j.titre, value: S.dates[j.cleDate] || '' });
      inp.addEventListener('change', function () { S.dates[j.cleDate] = inp.value || null; E.sauver(); A.rendre(); });
      acts.appendChild(h('label.do-champ.do-champ-inline', h('span.do-champ-l', { text: j.manque ? 'À saisir' : 'Modifier la date' }), inp));
    }
    if (j.lien) acts.appendChild(h('button.do-lien-btn', { type: 'button', text: 'Ouvrir dans l\u2019app \u203a', onclick: function () { A.versHote(j.lien); } }));
    if (!passe || !j.fait) {
      const id = 'do-f-' + j.id;
      const cb = h('input', { type: 'checkbox', id: id, checked: !!j.fait });
      cb.addEventListener('change', function () {
        if (j.perso) { const p = S.jalons.perso.find(function (x) { return x.id === j.id; }); if (p) p.fait = cb.checked ? E.maintenant() : null; }
        else { const e = S.jalons.etat[j.id] || (S.jalons.etat[j.id] = { fait: null, taches: {} }); e.fait = cb.checked ? E.maintenant() : null; }
        E.sauver(); li.classList.toggle('do-fait', cb.checked); U.annoncer(cb.checked ? 'Jalon fait' : 'Jalon à faire');
      });
      acts.appendChild(h('label.do-case', cb, h('span', { text: 'Je l\u2019ai fait' })));
    }
    if (j.perso) acts.appendChild(h('button.do-lien-btn', { type: 'button', text: 'Retirer', onclick: function () { U.confirmer(li, 'Retirer ce jalon ?', function () { S.jalons.perso = S.jalons.perso.filter(function (x) { return x.id !== j.id; }); E.sauver(); A.rendre(); }, 'Oui, retirer', 'Annuler'); } }));
    li.appendChild(acts);
    liste.appendChild(li);
  });
  corps.appendChild(liste);
  if (param) setTimeout(function () { const el = document.getElementById('do-j-' + param); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('do-vise'); } }, 50);

  pied.appendChild(U.bouton('Ajouter au calendrier (.ics)', function () { U.telecharger('mon-dossier-parcoursup.ics', ics(jalons), 'text/calendar'); U.toast('Fichier .ics prêt : ouvre-le pour l\u2019ajouter à ton calendrier.'); }, 'do-btn-sec'));
  pied.appendChild(U.bouton('Ajouter un jalon', ajouter, 'do-btn-prim'));

  function ics(js) {
    const esc = function (s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); };
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const l = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Terminale STMG//Mon dossier Parcoursup//FR', 'CALSCALE:GREGORIAN'];
    js.forEach(function (j) {
      if (!j.date) return;
      const d = j.date.replace(/-/g, ''), fin = j.fin ? j.fin : j.date;
      const f2 = C.dateDe(fin); f2.setDate(f2.getDate() + 1);
      l.push('BEGIN:VEVENT', 'UID:stmg-dossier-' + j.id + '@terminale-stmg', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + C.iso(f2).replace(/-/g, ''), 'SUMMARY:' + esc(j.titre), 'DESCRIPTION:' + esc((j.change || '') + (j.aConfirmer ? ' (date à confirmer)' : '')), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(j.titre), 'TRIGGER;VALUE=DATE-TIME:' + d.slice(0, 8).replace(/^(\d{4})(\d{2})(\d{2})$/, function (x, a, b, c) { const t = new Date(+a, +b - 1, +c - 1, 18); return t.getFullYear() + String(t.getMonth() + 1).padStart(2, '0') + String(t.getDate()).padStart(2, '0') + 'T180000'; }), 'END:VALARM', 'END:VEVENT');
    });
    l.push('END:VCALENDAR');
    return l.join('\r\n') + '\r\n';
  }
  function ajouter() {
    const z = h('div');
    const titre = U.champTexte('Titre', '', function () { }, { placeholder: 'JPO IUT de Bordeaux' });
    const date = h('input.do-texte', { type: 'date', 'aria-label': 'Date' });
    const change = U.champTexte('Ce que ça change', '', function () { }, { multi: true, rows: 2, placeholder: 'Je repars avec des questions pour la lettre.' });
    z.appendChild(titre.el); z.appendChild(h('label.do-champ', h('span.do-champ-l', { text: 'Date' }), date)); z.appendChild(change.el);
    const err = h('p.do-err', { 'aria-live': 'polite' }); z.appendChild(err);
    z.appendChild(h('div.do-acts.do-acts-pied', U.bouton('Ajouter', function () {
      const t = titre.input.value.trim(); if (!t) { err.textContent = 'Donne un titre.'; return; } if (!date.value) { err.textContent = 'Choisis une date.'; return; }
      S.jalons.perso.push({ id: 'j-moi-' + Date.now().toString(36), date: date.value, titre: t, change: change.input.value.trim(), fait: null });
      E.sauver(); fe.fermer(); A.rendre(); U.annoncer('Jalon ajouté');
    }, 'do-btn-prim'), U.bouton('Annuler', function () { fe.fermer(); }, 'do-btn-sec')));
    const fe = U.feuille('Ajouter un jalon', z);
  }
};
