/* ===== Mon dossier Parcoursup · les dates qui figent l'histoire (année 2026-2027) =====
   `date: 'dates.x'` : lire la date saisie dans les réglages du lycée, sinon `defaut` avec le badge « à confirmer ».
   `verifie: true` : date lue dans un document officiel daté ; `extrapole: true` : à confirmer. */
(function (racine) {
  'use strict';
  const JALONS = [
    { id: 'conseil-t1', date: 'dates.conseilT1', defaut: '2026-11-27', titre: 'Conseil de classe du T1', change: 'ton bulletin de T1 est arrêté, le premier des deux que les écoles verront.', source: 'Lycée (date indiquée dans l’app)', verifie: true, fenetre: 'T1' },
    { id: 'reforme-decisions', date: '2026-11-30', titre: 'Décisions sur la réforme de Parcoursup', change: 'lettre de motivation « justifiée », traitements automatisés affichés ; relis les règles début décembre.', source: 'franceinfo, 26/10/2026', extrapole: true },
    { id: 'albert-test', date: '2026-12-15', titre: 'Test Albert School (repère conseillé)', change: 'candidature directe, hors Parcoursup ; aucune date officielle publiée par l’école.', lien: '#sommet/albert', source: 'Module Objectif Albert de l’app maths', extrapole: true, voeu: 'albert', action: true },
    { id: 'parcoursup-ouverture', date: '2026-12-17', titre: 'Ouverture de la carte des formations 2027', change: 'relis la fiche de chaque vœu (places, grille, pièces demandées).', verifie: true, action: true, source: 'Calendrier Parcoursup 2027 (PDF du 20/10/2026)',
      taches: [{ id: 'essca-ponderations', t: 'ESSCA : pondérations ACCÈS 2027' }, { id: 'bremontier-fiche', t: 'Brémontier : places et grille 2027' }, { id: 'but-lettres', t: 'BUT GEA et TC : lettre demandée ?' }, { id: 'kedge-sesame', t: 'KEDGE : présence dans SESAME 2027 et coefficients' }] },
    { id: 'voeux-debut', date: '2027-01-18', titre: 'Début de la formulation des vœux', change: 'jusqu’à 10 vœux, non classés.', verifie: true, source: 'Calendrier Parcoursup 2027', action: true },
    { id: 'conseil-t2', date: 'dates.conseilT2', defaut: null, titre: 'Conseil de classe du T2', change: 'dernier bulletin vu par les écoles ; ton professeur principal rédige ensuite la fiche Avenir.', source: 'lycée', extrapole: true, fenetre: 'T2' },
    { id: 'voeux-fin', date: '2027-03-11', titre: 'Fin de la formulation des vœux', change: 'après cette date, plus aucun vœu ne peut être ajouté.', verifie: true, source: 'Calendrier Parcoursup 2027', action: true },
    { id: 'remontee-bulletins', date: 'dates.remonteeBulletins', defaut: '2027-03-26', titre: 'Remontée des bulletins par le lycée', change: 'vérifie tes bulletins dans « Ma scolarité » dès leur affichage et signale toute erreur au lycée.', extrapole: true, source: 'Extrapolé du calendrier 2026 (26/03/2026)', action: true },
    { id: 'confirmation', date: '2027-04-01', titre: 'Confirmation des vœux, textes figés', change: 'lettres, activités et vœux ne bougent plus après 23 h 59.', verifie: true, source: 'Calendrier Parcoursup 2027', action: true },
    { id: 'fiche-avenir', date: 'dates.ficheAvenir', defaut: '2027-04-02', titre: 'Fiche Avenir finalisée par le lycée', change: 'tu ne la verras qu’à partir du 1er juin 2027.', extrapole: true, source: 'Extrapolé du calendrier 2026 (03/04/2026)' },
    { id: 'sesame-ecrits', date: '2027-04-07', titre: 'Écrits SESAME (à distance)', verifie: true, source: 'concours-sesame.net, 20/10/2026', voeu: 'kedge', action: true },
    { id: 'acces-admissibilite', date: '2027-04-16', titre: 'Admissibilité ACCÈS', change: 'résultat de l’examen de ton dossier Parcoursup par les écoles du concours.', verifie: true, source: 'concours-acces.com, calendrier du concours ACCÈS 2027', voeu: 'essca' },
    { id: 'sesame-admissibilite', date: '2027-04-22', titre: 'Admissibilité SESAME', verifie: true, source: 'L’Étudiant', voeu: 'kedge' },
    { id: 'acces-oraux', date: '2027-04-23', fin: '2027-05-07', titre: 'Oraux ACCÈS', verifie: true, source: 'concours-acces.com, calendrier du concours ACCÈS 2027', voeu: 'essca', action: true },
    { id: 'sesame-oraux', date: '2027-04-24', fin: '2027-05-15', titre: 'Oraux SESAME', verifie: true, source: 'concours-sesame.net', voeu: 'kedge', action: true },
    { id: 'reponses', date: '2027-06-01', titre: 'Premières réponses des formations', change: 'la fiche Avenir devient visible dans ton dossier.', verifie: true, source: 'Calendrier Parcoursup 2027' },
    { id: 'bac-philo', date: '2027-06-14', titre: 'Bac : philosophie', source: 'Diplomeo (non vérifié au BO)', extrapole: true },
    { id: 'bac-spes', date: '2027-06-16', fin: '2027-06-18', titre: 'Bac : épreuves de spécialité', extrapole: true, source: 'Diplomeo' },
    { id: 'grand-oral', date: '2027-06-21', fin: '2027-07-02', titre: 'Grand oral', extrapole: true, source: 'Diplomeo' },
    { id: 'bac-resultats', date: '2027-07-06', titre: 'Résultats du bac', extrapole: true, source: 'Diplomeo' },
    { id: 'phase-complementaire', date: '2027-09-09', titre: 'Fin de la phase complémentaire', verifie: true, source: 'Calendrier Parcoursup 2027' }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = JALONS;
  racine.DOSSIER_JALONS = JALONS;
})(typeof window !== 'undefined' ? window : globalThis);
