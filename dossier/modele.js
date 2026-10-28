/* ===== Mon dossier Parcoursup · état dérivé (calculs appliqués à l'état local et aux signaux de l'app) ===== */
'use strict';
window.DOSSIER_MODELE = (function () {
  const C = window.DOSSIER_CALC, E = window.DOSSIER_ETAT, F = window.DOSSIER_FORMATIONS;
  let horloge = null;                       // date forcée (tests) : window.DOSSIER_MODELE.horloge = '2026-10-27'
  function aujourdhui() { return C.dateDe(horloge || new Date()); }

  function periodeEnCours(S) {
    const auj = aujourdhui();
    const passe = function (d) { const x = C.dateDe(d); return x && x <= auj; };
    if (S.periodes['T-T2'] && S.periodes['T-T2'].cloture) return null;
    if ((S.periodes['T-T1'] && S.periodes['T-T1'].cloture) || passe(S.dates.conseilT1)) return 'T-T2';
    return 'T-T1';
  }
  /* clôture automatique quand la date du conseil est passée */
  function clotureAuto(S) {
    const auj = aujourdhui(); let modif = false;
    [['T-T1', 'conseilT1'], ['T-T2', 'conseilT2']].forEach(function (x) {
      const p = S.periodes[x[0]], d = C.dateDe(S.dates[x[1]]);
      if (p && !p.cloture && d && d <= auj && C.nbLignes(p) > 0) { p.cloture = true; p.clotureAuto = true; modif = true; }
    });
    return modif;
  }
  function finNotes(S, code) {
    const d = S.dates;
    if (code === 'T-T1') return d.finNotesT1 || (d.conseilT1 ? C.iso(new Date(C.dateDe(d.conseilT1).getTime() - 7 * 86400000)) : null);
    if (code === 'T-T2') return d.finNotesT2 || (d.conseilT2 ? C.iso(new Date(C.dateDe(d.conseilT2).getTime() - 7 * 86400000)) : null);
    return null;
  }
  function lienReviser(matiere, sig) {
    const f = C.ficheFaible(matiere, sig.fiches, sig.fichesDone);
    if (!f) return '';
    if (matiere === 'maths') return '#maths';
    return '#' + f.id;
  }
  function nomVoeu(v) { const f = E.formationDe(v); return f ? f.court : v.id; }

  function calculer() {
    const S = E.S, auj = aujourdhui();
    if (clotureAuto(S)) E.sauver();
    const coefs = S.coefs, P = S.periodes;
    const ref = C.reference(P, coefs, S.objectifT2);
    const traj = C.trajectoire(P, coefs, S.objectifT2);
    const vj = C.vueJury(P, coefs, S.objectifT2);
    const sig = E.signaux(auj);
    const enCours = periodeEnCours(S);
    /* période simulée (« Ce trimestre ») : le trimestre de Terminale en cours, s'il a des notes. Jamais un trimestre figé
       ni une période de Première (un objectif se fixe sur ce qui peut encore bouger). */
    const codeSimul = enCours && C.nbLignes(P[enCours]) ? enCours : null;
    /* base des priorités (coach, « remonte d'abord ») : le trimestre en cours, sinon la dernière période saisie */
    const codeRef = codeSimul || ['T-T2', 'T-T1', '1-T3', '1-T2', '1-T1'].find(function (k) { return C.nbLignes(P[k]); }) || null;
    const periodeRef = codeRef ? P[codeRef] : null;
    const limite = enCours ? finNotes(S, enCours) : null;
    const evals = C.evaluationsAvant(sig.echeances, limite, auj);
    const dsPar = C.dsParMatiere(evals);
    const voeux = E.voeuxTries().map(function (v) {
      const f = E.formationDe(v);
      const Ev = f.canal === 'direct' ? null : C.ecart(f.cible, ref.valeur);
      return { v: v, f: f, E: Ev, feu: f.canal === 'direct' ? 'gris' : C.feu(Ev) };
    });
    const premier = voeux.find(function (x) { return x.f.canal !== 'direct' && typeof x.f.cible === 'number'; }) || null;
    const prios = periodeRef ? C.priorites(periodeRef, codeRef, coefs, premier ? premier.f : null, sig, dsPar) : null;
    const ordreVoeux = voeux.slice().sort(function (a, b) {
      if (a.E == null && b.E == null) return (a.v.ordre || 0) - (b.v.ordre || 0);
      if (a.E == null) return 1; if (b.E == null) return -1;
      return a.E - b.E;
    });
    const jalons = E.jalons(auj);
    const prochain = jalons.find(function (j) { return j.date && !j.fait && j.jours != null && j.jours >= 0; }) || null;
    const completion = C.completion(S, auj, F.parId);
    const coachS = coachSemaine(S, { prios: prios, E: premier ? premier.E : null, dsParMatiere: dsPar, sig: sig, jalons: jalons });
    return { S: S, auj: auj, coefs: coefs, ref: ref, traj: traj, vj: vj, sig: sig, enCours: enCours, codeRef: codeRef, periodeRef: periodeRef, codeSimul: codeSimul, limite: limite, evals: evals, dsPar: dsPar,
      voeux: voeux, ordreVoeux: ordreVoeux, premier: premier, prios: prios, jalons: jalons, prochain: prochain, completion: completion, coach: coachS };
  }

  /* coach : clé semaine ISO, régénéré le lundi ou si les entrées changent, en gardant les cases cochées */
  function hashEntrees(S, sig) {
    const parts = [];
    C.PERIODES.forEach(function (k) { const p = S.periodes[k]; if (p) parts.push(k + ':' + Object.keys(p.lignes).filter(function (id) { return C.note(p.lignes[id] && p.lignes[id].moy) != null; }).map(function (id) { return id + '=' + p.lignes[id].moy; }).join(',')); });
    S.voeux.forEach(function (v) { parts.push(v.id + ':' + v.cible + ':' + v.lettreDemandee); });
    const T = S.textes; Object.keys(T.activites).forEach(function (k) { parts.push(k + ':' + (T.activites[k].txt || '').length); });
    Object.keys(T.lettres).forEach(function (k) { parts.push('l' + k + ':' + (T.lettres[k].txt || '').length); });
    parts.push('alb:' + (T.albert.lm.txt || '').length);
    parts.push('ech:' + sig.echeances.filter(function (i) { return !i.done; }).map(function (i) { return i.id; }).join(','));
    parts.push('fd:' + sig.fichesDone.length, 'dates:' + JSON.stringify(S.dates));
    return C.hashTexte(parts.join('|'));
  }
  function coachSemaine(S, ctx) {
    const auj = aujourdhui(), cle = C.semaineISO(auj), h = hashEntrees(S, ctx.sig);
    let sem = S.semaines[cle];
    if (!sem || sem.hash !== h) {
      const actions = C.coach({ dossier: S, aujourdhui: auj, prios: ctx.prios, E: ctx.E, dsParMatiere: ctx.dsParMatiere, fiches: ctx.sig.fiches, fichesDone: ctx.sig.fichesDone, jalons: ctx.jalons, lienReviser: function (m) { return lienReviser(m, ctx.sig); }, nomVoeu: nomVoeu });
      const anciennes = (sem && sem.actions) || [];
      actions.forEach(function (a) { const o = anciennes.find(function (x) { return x.id === a.id; }); a.fait = o && o.fait ? o.fait : null; });
      sem = { genereLe: E.maintenant(), hash: h, actions: actions };
      S.semaines[cle] = sem;
      /* on ne garde que 8 semaines */
      Object.keys(S.semaines).sort().slice(0, -8).forEach(function (k) { delete S.semaines[k]; });
      E.sauver();
    }
    const prec = (function () { const d = new Date(auj); d.setDate(d.getDate() - 7); return S.semaines[C.semaineISO(d)]; })();
    return { cle: cle, actions: sem.actions, lundi: C.lundiDe(auj), precedente: prec ? { faites: prec.actions.filter(function (a) { return a.fait; }).length, total: prec.actions.length } : null };
  }
  function cocher(cle, i, oui) {
    const sem = E.S.semaines[cle]; if (!sem || !sem.actions[i]) return;
    sem.actions[i].fait = oui ? E.maintenant() : null;
    E.sauver();
  }

  /* titre narratif et résumé pour la carte d'accueil de l'app STMG */
  function resume(M) {
    const S = M.S, nb = C.PERIODES.filter(function (k) { return C.nbLignes(S.periodes[k]) > 0; }).length;
    const prem = M.premier;
    let titre = '', etat = 'vide';
    const t1 = S.periodes['T-T1'], t2 = S.periodes['T-T2'];
    if (!nb) titre = 'Ton dossier commence ici. Saisis ton dernier bulletin de Première : deux minutes, ou photographie-le.';
    else if (t2 && t2.cloture && C.nbLignes(t2)) { etat = 'fige'; titre = 'Ton dossier est figé : ' + C.fmt(M.vj.mJury) + ' de moyenne de Terminale. Place aux textes et aux oraux.'; }
    else if (t1 && t1.cloture && C.nbLignes(t1)) {
      etat = 't2';
      const m1 = C.moyennes(t1, 'T-T1', S.coefs).mp;
      if (prem) {
        const r = C.t2Requis(t1, S.coefs, prem.f.cible);
        if (r && r.atteinte) titre = 'T1 : ' + C.fmt(m1) + ' de moyenne pondérée. Garde ce niveau au T2 et ta moyenne de Terminale restera au-dessus de ' + C.fmt(prem.f.cible) + ' pour ' + prem.f.court + '.';
        else if (r && r.t2 > 20) titre = 'T1 : ' + C.fmt(m1) + ' de moyenne pondérée. ' + C.fmt(prem.f.cible) + ' pour ' + prem.f.court + ' demanderait plus de 20 au T2 : vise ' + C.fmt(prem.f.cibleSecurite != null ? prem.f.cibleSecurite : prem.f.cible - 1) + ' et soigne tes textes.';
        else titre = 'T1 : ' + C.fmt(m1) + ' de moyenne pondérée. Il te faut ' + C.fmt(r ? r.t2 : null) + ' au T2 pour afficher ' + C.fmt(prem.f.cible) + ' à ' + prem.f.court + '.';
      }
      else titre = 'T1 : ' + C.fmt(m1) + ' de moyenne pondérée. Choisis un vœu pour connaître la cible du T2.';
    } else if (M.prochain && M.prochain.id === 'conseil-t1' || (M.enCours === 'T-T1' && S.dates.conseilT1 && C.joursAvant(S.dates.conseilT1, M.auj) >= 0)) {
      etat = 'encours';
      const j = C.joursAvant(S.dates.conseilT1, M.auj);
      titre = j === 0 ? 'Le conseil de classe du T1, c’est aujourd’hui.' : 'Il te reste ' + C.pluriel(j, 'jour', 'jours') + (M.evals.length ? ' et ' + C.pluriel(M.evals.length, 'évaluation', 'évaluations') : '') + ' avant le conseil de classe du ' + C.fmtDate(S.dates.conseilT1, 'jm') + '.';
    } else { etat = 'encours'; titre = M.ref.valeur != null ? C.fmt(M.ref.valeur) + ' de moyenne pondérée ' + M.ref.libelle + '.' : 'Continue : chaque bulletin saisi précise ce que le jury lira.'; }
    const action = M.coach.actions.find(function (a) { return !a.fait; }) || M.coach.actions[0] || null;
    return { etat: etat, titre: titre, mp: M.ref.valeur, mpLibelle: M.ref.libelle, ecart: prem ? prem.E : null, ecartVoeu: prem ? prem.f.court : null, feu: prem ? prem.feu : 'gris',
      jalon: M.prochain ? { titre: M.prochain.titre, date: M.prochain.date } : null, completion: M.completion.pct, action: action ? action.txt : '', objectif: S.objectifT1 || S.objectifT2 ? true : false, coefsOk: true, le: E.maintenant() };
  }
  C.pluriel = function (n, un, plus) { return n + '\u00a0' + (n > 1 ? plus : un); };
  return { get horloge() { return horloge; }, set horloge(v) { horloge = v; }, aujourdhui: aujourdhui, calculer: calculer, periodeEnCours: periodeEnCours, finNotes: finNotes, cocher: cocher, resume: resume, lienReviser: lienReviser, nomVoeu: nomVoeu };
})();
