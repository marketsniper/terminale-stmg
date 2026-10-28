/* ===== Mon dossier Parcoursup · formations visées (gabarits des vœux) =====
   Faits vérifiés le 27/10/2026 sur les fiches Parcoursup de la session 2026 et les rapports publics 2025.
   La carte des formations 2027 ouvre le 17/12/2026 : chaque fait porte `verifie` (date) ou `extrapole: true`.
   Aucun chiffre n'est inventé ; en cas de doute, la source est citée et le badge « à confirmer » s'affiche. */
(function (racine) {
  'use strict';
  const DATA = {
    relireLe: '2026-12-17',
    verifieLe: '2026-10-27',
    formations: [
      {
        id: 'bremontier', nom: 'CPGE ECT · Lycée Brémontier, Bordeaux', court: 'Brémontier', type: 'cpge', canal: 'parcoursup', concours: null,
        codeParcoursup: 4302, places: 48,
        grille: { resultats: 50, methode: 20, savoirEtre: 20, motivation: 5, engagement: 5 },
        importance: { resultats: 'Essentiel', methode: 'Essentiel', savoirEtre: 'Essentiel', motivation: 'Important', engagement: 'Complémentaire' },
        matieresRegardees: ['droit-eco', 'management', 'maths', 'philo', 'hg', 'anglais'],
        cibleDefaut: 14, cibleSecurite: 12, mentionDefaut: 'B', lettreDemandee: false,
        eliminatoires: ['fragilités dans les matières principales', 'manque d’investissement', 'langues autres que allemand, espagnol, anglais'],
        faits: [
          { t: '2025 : 624 candidats confirmés, 340 classés, 41 intégrés pour 48 places ; 100 % de bacs technologiques.', verifie: '2026-10-27', source: 'Rapport public Parcoursup 2025 (g_ta_cod=4302)' },
          { t: 'Mentions des admis 2025 : 17 % sans mention, 39 % assez bien, 34 % bien, 10 % très bien (83 % avec mention, 44 % bien ou très bien).', verifie: '2026-10-27', source: 'Rapport public Parcoursup 2025' },
          { t: 'Spécialité GF : 12 admis sur 41 (29 %) ; Mercatique 28 sur 41.', verifie: '2026-10-27', source: 'Rapport public Parcoursup 2025' },
          { t: 'Le poids des enseignements de spécialité est supérieur ; pré-classement algorithmique ; 20 % de boursiers.', verifie: '2026-10-27', source: 'Rapport public Parcoursup 2025' }
        ],
        liens: { fiche: 'https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=4302' }
      },
      {
        id: 'essca', nom: 'ESSCA Bordeaux · concours ACCÈS', court: 'ESSCA', type: 'ecole', canal: 'parcoursup', concours: 'acces',
        codeParcoursup: 26008, places: null,
        grille: null,
        grilleTexte: 'Pondérations 2027 du concours ACCÈS à paraître avant le 17 décembre 2026 : dossier Parcoursup (notes de Première et de Terminale, épreuves anticipées, fiche Avenir) puis oraux (entretien de motivation et QCM d’ouverture, coefficient 7 ; anglais, coefficient 4).',
        cibleDefaut: 13.5, cibleSecurite: 12, mentionDefaut: 'AB', lettreDemandee: true, lettreAConfirmer: true,
        faits: [
          { t: 'ACCÈS 2027 : plus d’écrits communs ; admissibilité sur le dossier Parcoursup (notes de 1re et Tle, français et maths anticipés, fiche Avenir), puis oraux.', verifie: '2026-10-27', source: 'Communiqué ACCÈS du 23/09/2026' },
          { t: 'Oraux ESSCA : entretien de motivation, collaboratif et QCM d’ouverture (1 h 30, coefficient 7) ; entretien en anglais (20 min, coefficient 4).', verifie: '2026-10-27', source: 'concours-acces.com, calendrier des oraux (page non datée)' },
          { t: '2025, bacs technologiques : 168 confirmés, 121 classés, 5 intégrés (3 sans mention, 2 bien).', verifie: '2026-10-27', source: 'Rapport public Parcoursup 2025 (g_ta_cod=26008)' },
          { t: 'Frais 2027 : 190 € (50 € boursiers).', verifie: '2026-10-27', source: 'concours-acces.com, modalités' }
        ],
        liens: { fiche: 'https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=26008', concours: 'https://www.concours-acces.com/' }
      },
      {
        id: 'kedge', nom: 'KEDGE EBP International · concours SESAME', court: 'KEDGE', type: 'ecole', canal: 'parcoursup', concours: 'sesame',
        codeParcoursup: 26295, places: 240,
        grille: { resultats: 25, methode: 35, savoirEtre: 15, motivation: 15, engagement: 10 },
        grilleNote: 'Grille de la fiche 2026 : résultats = écrits SESAME « Communiquer » + note de dossier ; méthode = épreuves « Comprendre » et « Analyser ».',
        cibleDefaut: 13, cibleSecurite: 12, mentionDefaut: 'AB', lettreDemandee: true, lettreAConfirmer: true,
        faits: [
          { t: 'Écrits SESAME à distance le mercredi 7 avril 2027 ; oraux du 24 avril au 15 mai ; 315 € (157,50 € boursiers).', verifie: '2026-10-27', source: 'concours-sesame.net, calendrier mis à jour le 20/10/2026' },
          { t: 'Note de dossier : seuls les points au-dessus de 10/20 comptent.', verifie: '2026-10-27', source: 'Fiche Parcoursup 2026 (g_ta_cod=26295)' },
          { t: '2025 : 183 intégrés ; bacs technologiques : 426 confirmés, 268 classés, 22 intégrés (45 % sans mention, 32 % AB, 23 % B).', verifie: '2026-10-27', source: 'Rapport public Parcoursup 2025' },
          { t: 'Coefficients SESAME 2027 pour KEDGE EBP : à vérifier sur concours-sesame.net (document « coefficients des épreuves »).', extrapole: true, source: 'concours-sesame.net' }
        ],
        liens: { fiche: 'https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=26295', concours: 'https://www.concours-sesame.net/' }
      },
      {
        id: 'but-gea', nom: 'BUT GEA · IUT de Bordeaux, Bastide', court: 'BUT GEA', type: 'but', canal: 'parcoursup', concours: null,
        codeParcoursup: 4463, places: 114,
        grille: { resultats: 25, methode: 20, savoirEtre: 25, motivation: 25, engagement: 5 },
        importance: { resultats: 'Très important', methode: 'Très important', savoirEtre: 'Très important', motivation: 'Très important', engagement: 'Complémentaire' },
        cibleDefaut: 13, cibleSecurite: 12, mentionDefaut: 'AB', lettreDemandee: false,
        faits: [
          { t: '2025 : 7 072 vœux, 114 intégrés ; groupe technologique : 60 places, 2 580 candidats, 60 intégrés.', verifie: '2026-10-27', source: 'Rapport public Parcoursup 2025 (g_ta_cod=4463)' },
          { t: 'Mentions des admis technologiques 2025 : 13 % sans mention, 43 % AB, 33 % B, 10 % TB.', verifie: '2026-10-27', source: 'Rapport public Parcoursup 2025' },
          { t: 'GF + droit-éco : 85 % des admis technologiques (51 sur 60). Objectif 52 % de bacs technologiques, 14 % de boursiers.', verifie: '2026-10-27', source: 'Fiche et rapport 2025' }
        ],
        liens: { fiche: 'https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=4463' }
      },
      {
        id: 'but-tc', nom: 'BUT Techniques de commercialisation · IUT de Bordeaux, Bastide', court: 'BUT TC', type: 'but', canal: 'parcoursup', concours: null,
        codeParcoursup: 4465, places: 168,
        grille: { resultats: 30, methode: 15, savoirEtre: 15, motivation: 35, engagement: 5 },
        importance: { resultats: 'Essentiel', methode: 'Essentiel', savoirEtre: 'Très important', motivation: 'Essentiel', engagement: 'Complémentaire' },
        matieresRegardees: ['droit-eco', 'management', 'gf', 'philo', 'hg', 'maths', 'anglais', 'emc'],
        cibleDefaut: 12.5, cibleSecurite: 11.5, mentionDefaut: 'AB', lettreDemandee: true, lettreUsage: 'lettre « élargie », critère essentiel',
        eliminatoires: ['non-respect des consignes de la lettre'],
        faits: [
          { t: 'Fiche 2026 : 168 places, 4 995 vœux confirmés.', verifie: '2026-10-27', source: 'Fiche Parcoursup 2026 (g_ta_cod=4465)' },
          { t: '2025 : 170 candidats admis, dont 54 % de bacs technologiques.', verifie: '2026-10-27', source: 'Fiche Parcoursup 2026, répartition des admis 2025' },
          { t: 'Résultats = note de français écrit du bac et moyennes T1-T2 ; méthode = orthographe et esprit critique ; motivation = lettre, 35 % de la grille.', verifie: '2026-10-27', source: 'Fiche Parcoursup 2026' }
        ],
        liens: { fiche: 'https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=4465' }
      },
      {
        id: 'albert', nom: 'Albert School · candidature directe', court: 'Albert', type: 'direct', canal: 'direct', concours: null,
        grille: null, grilleTexte: 'Hors Parcoursup : test de mathématiques en ligne (QCM de 45 minutes), relevés de notes obligatoires, CV et lettre facultatifs, puis entretien. Repère que tu t’es fixé dans Objectif Albert : passer le test avant le 15 décembre (aucune date officielle publiée).',
        cibleDefaut: null, lettreDemandee: false, lettreFacultative: true, lettreMots: [300, 400],
        jalon: '2026-12-15', lienApp: '#sommet/albert',
        faits: [
          { t: 'Candidature 2027 ouverte : test de maths en ligne (QCM, 45 minutes), relevés de notes obligatoires, CV et lettre facultatifs, entretien avec Albert School et MINES Paris-PSL.', verifie: '2026-10-27', source: 'FAQ Albert School « How to apply »' },
          { t: 'Aucune date de session de test publiée ; le 15 décembre 2026 est le repère conseillé dans le module Objectif Albert de l’app maths.', extrapole: true, source: 'Module Objectif Albert (app maths)' }
        ]
      },
      {
        id: 'licence-eco-gestion', actifParDefaut: false, nom: 'Licence Économie et gestion · Université de Bordeaux', court: 'Licence éco-gestion', type: 'licence', canal: 'parcoursup', concours: null,
        codeParcoursup: 4462, places: 680,
        grille: { resultats: 85, methode: 10, savoirEtre: 5, motivation: 0, engagement: 0 },
        cibleDefaut: 12, cibleSecurite: 11, mentionDefaut: 'AB', lettreDemandee: false,
        faits: [{ t: '2025 : 7 344 candidats, 670 intégrés ; attendu : mathématiques jusqu’en Terminale.', verifie: '2026-10-27', source: 'Fiche Parcoursup 2026 (g_ta_cod=4462)' }],
        liens: { fiche: 'https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=4462' }
      }
    ]
  };
  DATA.parId = {};
  DATA.formations.forEach(function (f) { DATA.parId[f.id] = f; });
  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
  racine.DOSSIER_FORMATIONS = DATA;
})(typeof window !== 'undefined' ? window : globalThis);
