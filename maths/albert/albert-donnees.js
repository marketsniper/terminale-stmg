/* ===== Maths · Objectif Albert School : données vérifiées et banques de l'entretien =====
   Fichier de contenu : une IIFE, rien au premier niveau. Exporte window.ALBERT_INFOS, window.ALBERT_ENTRETIEN
   et window.NOUVEAUTES. Chargé dans index.html après les compétences, avant core/base.js et les vues.

   RÈGLE : tout fait sur l'école vit ICI et seulement ici, relié à une source (src) et à une date de vérification.
   Les vues l'affichent via esc() ; une URL n'est rendue en lien que si elle commence par https://.
   Un fait sans source s'affiche avec la pastille « à confirmer ». Un fait dont les sources divergent, ou qui
   reste à vérifier, porte un champ aConfirmer (texte affiché à côté de la pastille). Ne rien ajouter sans
   source vérifiée, et garder les formulations prudentes. */
(function(){
'use strict';

const VU = '2026-10-20';
/* Webinaire de candidature suivi en direct le 28 octobre 2026 (diaporama relevé sur captures d'écran). */
const VU2 = '2026-10-28';
/* Espace fine insécable pour les milliers (comme fv() dans core/base.js, chargé après ce fichier). */
const M = ' ';

window.ALBERT_INFOS = {
  verifieLe: VU2,

  /* Sources : id stable, titre affiché, url (https uniquement), date de consultation. */
  sources: [
    {id: 'faq',        titre: 'Albert School · FAQ', url: 'https://www.albertschool.com/fr/faq/', vu: VU},
    {id: 'kit',        titre: 'Albert School · guide pour candidater au Bachelor', url: 'https://www.albertschool.com/guide-pour-candidater-bachelor/', vu: VU},
    {id: 'programme',  titre: 'Albert School · page du programme Bachelor', url: 'https://www.albertschool.com/fr/programs/bachelor-business-data/', vu: VU},
    {id: 'frais',      titre: 'Albert School · FAQ des frais de scolarité', url: 'https://www.albertschool.com/fr/faq/fees/', vu: VU},
    {id: 'evenements', titre: 'Albert School · événements', url: 'https://www.albertschool.com/fr/events/', vu: VU},
    {id: 'portail',    titre: 'Espace candidat (consignes affichées après connexion)', url: 'https://admission.albertschool.com', vu: VU},
    {id: 'parcoursup', titre: 'Parcoursup · fiche de la formation', url: 'https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=52797&typeBac=0&originePc=0', vu: VU},
    {id: 'calpsup',    titre: 'L\'Étudiant · calendrier Parcoursup 2027', url: 'https://www.letudiant.fr/etudes/parcoursup/on-connait-le-calendrier-de-parcoursup-2027.html', vu: VU},
    {id: 'licence',    titre: 'Albert School · actualité sur le grade de licence', url: 'https://www.albertschool.com/fr/blog/bachelor-science-engineering-mines-paris-albert-school-grade-de-licence-recognition/', vu: VU},
    {id: 'flashcards', titre: 'Albert School · fiches du guide de candidature (2026)', url: 'https://www.albertschool.com/fr/guidance-kit/flashcards/', vu: VU},
    {id: 'webinaire',  titre: 'Albert School · webinaire « Kit de candidature Bachelor & International BBA » (diaporama)', url: '', vu: VU2}
  ],

  /* Faits sur l'école. id stable (référencé par les vues), t : titre court, v : texte,
     src : id de source ou liste d'ids, aConfirmer (facultatif) : pourquoi ce point reste à vérifier. */
  ecole: [
    {id: 'eligibilite', t: 'Éligibilité selon ta filière et tes spécialités', src: ['flashcards', 'parcoursup'],
     v: 'Les sources ne concordent pas : une fiche officielle de 2026 indique que la spécialité mathématiques est exigée ; d\'autres sources, dont la fiche Parcoursup, n\'en font pas une condition.',
     aConfirmer: 'Fais confirmer par écrit à l\'école que ta filière et tes spécialités sont acceptées, avant ta seule tentative au test.'},
    {id: 'fil-eau', t: 'Admission au fil de l\'eau', src: ['kit', 'programme', 'webinaire'],
     v: 'Les candidatures sont étudiées au fil de l\'eau, jusqu\'à ce que les places soient pourvues. Les places de chaque campus sont attribuées dans l\'ordre d\'arrivée des dossiers : « plus vous candidatez tôt, plus vos chances sont élevées ».'},
    {id: 'janvier', t: 'À partir de janvier', src: ['kit', 'webinaire'],
     v: 'Le test est mis à jour : il devient plus difficile, et la sélectivité augmente.'},
    {id: 'tentative', t: 'Une seule tentative', src: ['portail', 'faq', 'webinaire'],
     v: 'Le test ne peut être ni mis en pause ni repassé. En cas d\'échec, on recandidate l\'année suivante. Le résultat est partagé avec chaque programme demandé.'},
    {id: 'format', t: 'Format du test', src: ['portail', 'faq', 'webinaire'],
     v: '40 minutes, QCM. Les mauvaises réponses ne pénalisent pas ; chaque bonne réponse rend la question suivante plus difficile et mieux notée.'},
    {id: 'conditions', t: 'Conditions de passage', src: 'portail',
     v: 'Sur ordinateur, stylo et papier à portée de main. Calculatrice, outils d\'IA, recherches et aide d\'une autre personne interdits. Caméra, micro et partage d\'écran demandés. Il faut rester sur la page, et il est impossible de revenir à une question précédente. Arrêt automatique à 40 minutes.'},
    {id: 'langue', t: 'Langue des questions', src: ['portail', 'webinaire'],
     v: 'Les questions s\'affichent en français ou en anglais, selon la langue choisie sur le portail.'},
    {id: 'moment', t: 'Quand passer le test', src: ['portail', 'webinaire'],
     v: 'Le test se passe une fois le dossier complet, juste après l\'envoi ou bien plus tard : ne le lance qu\'une fois ta préparation terminée.'},
    {id: 'verrou', t: 'Documents verrouillés après l\'envoi', src: 'portail',
     v: 'Une fois envoyés, les documents obligatoires ne peuvent plus être ajoutés, modifiés ni supprimés. Les documents facultatifs restent modifiables.'},
    {id: 'pieces', t: 'Pièces du dossier', src: ['kit', 'portail'],
     v: 'Pièce d\'identité ; au moins tes deux derniers relevés de notes ; CV d\'une page ; lettre de motivation de 300 à 400 mots en 4 paragraphes. Fichiers PDF, JPG ou PNG de 2 Mo maximum.'},
    {id: 'video-ia', t: 'Conversation vidéo avec un agent IA', src: 'portail',
     v: 'Selon le programme, une conversation vidéo avec un agent IA peut suivre le test (enregistrée et transmise au jury).',
     aConfirmer: 'Dépend du programme : vérifie dans ton espace candidat.'},
    {id: 'entretien', t: 'Entretien', src: ['portail', 'kit', 'webinaire'],
     v: 'En cas d\'admissibilité : environ 30 minutes, en visio ou sur un campus, langue au choix. On y parle de ton parcours, de tes motivations et de certaines des questions les plus difficiles de ton test, pour vérifier ton raisonnement (espace candidat). Le guide de candidature décrit 3 temps (présentation, brainteaser d\'estimation à voix haute, motivation) et, à Paris, 2/3 en français et 1/3 en anglais.',
     aConfirmer: 'Le webinaire du 28 octobre confirme pour le Bachelor : deux tiers en français, un tiers en anglais (International BBA : 100 % anglais, niveau B2+). L\'espace candidat parle de langue au choix : prépare-toi en anglais de toute façon.'},
    {id: 'decision', t: 'Délai de décision', src: ['kit', 'portail', 'webinaire'],
     v: 'Environ 20 jours en moyenne entre le dépôt et la décision (guide de candidature) ; au plus tard 30 jours après la dernière étape (espace candidat).'},
    {id: 'admis', t: 'En cas d\'admission', src: ['faq', 'portail'],
     v: 'Place réservée 10 jours ; acompte de 3' + M + '000 € ; contrat avec 14 jours de rétractation, au-delà les arrhes risquent d\'être perdues : lis le contrat avant de signer.',
     aConfirmer: 'Les sources parlent d\'acompte puis d\'arrhes, deux régimes différents : fais-toi confirmer les conditions par écrit.'},
    {id: 'bourses', t: 'Bourses', src: ['faq', 'frais'],
     v: 'À demander entre l\'admission et l\'inscription, pas à un autre moment. Jusqu\'à 50 % des frais ; Talent Scholarships jusqu\'à 6' + M + '000 € par an.'},
    {id: 'frais', t: 'Frais affichés', src: 'frais',
     v: '14' + M + '900 € par an (UE) pour le Bachelor à Paris et à Marseille.'},
    {id: 'selectivite', t: 'Sélectivité', src: 'faq',
     v: 'Moins de 10 % des candidatures acceptées, d\'après la FAQ consultée le 20 octobre 2026 (année de référence non précisée).'},
    {id: 'scores', t: 'SAT, ACT ou TOLC', src: 'programme',
     v: 'Un bon score SAT, ACT ou TOLC peut remplacer le test de mathématiques en ligne (seuil non publié).'},
    {id: 'parcoursup', t: 'Avec ou sans Parcoursup', src: ['parcoursup', 'webinaire'],
     v: 'Tu peux candidater directement sur le site de l\'école, en parallèle de Parcoursup (webinaire du 28 octobre). En 2026, le Bachelor était aussi sur Parcoursup via Mines Paris – PSL (Paris, 40 places, 667 vœux).',
     aConfirmer: 'Reconduction en 2027 à vérifier à partir du 17 décembre 2026.'},
    {id: 'licence', t: 'Grade de licence et diplôme conjoint avec Mines Paris', src: ['licence', 'webinaire'],
     v: 'Grade de licence depuis le 1ᵉʳ septembre 2026. Le webinaire du 28 octobre présente le Bachelor Business, Data & AI comme un Bac+3 grade de licence, diplôme conjoint avec Mines Paris – PSL, sur un campus au choix parmi les cinq.',
     aConfirmer: 'L\'actualité officielle cite le site de Paris : confirmation écrite pour Marseille demandée à l\'école.'},
    {id: 'ecole-bref', t: 'L\'école en bref', src: 'webinaire',
     v: 'Créée en 2022. 5 campus : Paris, Marseille, Milan, Genève et Madrid. 4 piliers : mathématiques, business, data & IA, humanités. 8 Business Deep Dives par an (un défi réel posé par une entreprise partenaire). 2 stages intégrés au cursus. Plus de 45 nationalités.'},
    {id: 'programmes', t: 'Deux programmes, un même socle', src: 'webinaire',
     v: 'Bachelor Business, Data & AI : 3 ans, un campus au choix, langue selon le campus (français, anglais, italien ou espagnol). International BBA : 3 ans, trois campus (un par année), 100 % en anglais. Année de césure au choix : un semestre dans une université partenaire, le double diplôme avec l\'EDHEC, ou des stages. Ensuite : le Master Albert School avec Mines Paris – PSL, ou INSEAD, London Business School, Polytechnique, HEC Paris. Diplômes délivrés avec Mines Paris – PSL, présentée comme n° 1 des universités françaises et top 34 mondial (QS 2027).'},
    {id: 'differenciant', t: 'Ce qui fait la différence dans le dossier', src: 'webinaire',
     v: 'Obligatoire : bulletins de Première et de Terminale (si disponibles), CV d\'une page, lettre de motivation. Un dossier incomplet n\'est pas évalué. Optionnel mais différenciant : certifications (SAT, tests de langue), projets personnels (site, e-commerce, association), distinctions, concours, olympiades.'},
    {id: 'cv', t: 'Le CV : cinq règles', src: 'webinaire',
     v: 'Une page. État civil sobre : nom, ville, e-mail professionnel, téléphone, pas de photo ; LinkedIn est un vrai plus. La formation en premier. L\'expérience au sens large (jobs, stages, bénévolat, tutorat) avec des verbes d\'action et des chiffres. Extrascolaire et leadership : la durée de l\'engagement compte plus que le nombre de lignes. Compétences et langues : niveaux explicites, trois soft skills au maximum, honnêteté. Conseil du jury : « Adoptez une approche data-driven : quantifiez vos résultats, votre temps d\'engagement et vos responsabilités. »'},
    {id: 'lettre', t: 'La lettre en quatre paragraphes', src: 'webinaire',
     v: 'Une page, 300 à 400 mots. 1. Pourquoi toi : ce qui t\'a amené à candidater (le jury évalue une candidature réfléchie, pas opportuniste). 2. Tes expériences : deux ou trois réalisations, chacune avec son résultat (aller au bout, mesurer). 3. Pourquoi Albert : le socle Business, Data & AI, les Business Deep Dives, le campus visé (le sérieux de ta recherche). 4. La suite : ton projet après le Bachelor et ce que tu apporteras à la promotion (la cohérence). Astuce : viens aux événements de l\'école et mentionne-les.'},
    {id: 'avant-entretien', t: 'Avant l\'entretien : quatre cases à cocher', src: 'webinaire',
     v: 'Ta cible : le programme et le campus précis, et connaître le jury. Tes estimations : t\'être entraîné à deux ou trois brainteasers à voix haute. Tes motivations : ce qui te différencie et la valeur que tu apporteras. Ta curiosité : suivre l\'actualité de la data et de l\'IA (entreprises, innovations, enjeux).'},
    {id: 'guide-test', t: 'S\'entraîner au test', src: 'webinaire',
     v: 'Entraînement et exemples de questions dans le guide en ligne de l\'école. Trois exemples présentés, sans calculatrice : la moyenne de deux nombres est 4042 et l\'un vaut 1042 (l\'autre vaut 7042) ; probabilité d\'un valet ou d\'un roi dans 52 cartes (2/13) ; trois vendredis d\'un mois tombent un jour pair, quel jour est le 21 (mercredi).'},
    {id: 'brainteaser', t: 'Le brainteaser : cinq réflexes', src: 'webinaire',
     v: 'Pense à voix haute. Énonce tes hypothèses. Arrondis pour simplifier. Montre ton raisonnement étape par étape. Ne cherche pas à impressionner. Ce n\'est pas la réponse qui compte, c\'est la méthode.'}
  ],

  /* Réglages du test blanc : c'est la spécification produit, appuyée sur les faits « format » et « conditions ».
     questions : nombre officiel s'il est un jour vérifié ; null = on enchaîne jusqu'à la fin du temps. */
  test: {minutes: 40, questions: null, qcm: 4, malus: false, calculatrice: false, retourArriere: false,
         pause: false, adaptatif: true, uneTentative: true, src: ['portail', 'faq'],
         /* Écran « Prêt ? » du test blanc : le jour J en bref (reformulation des faits « format » et « conditions »). */
         jourJ: ['Chaque bonne réponse rend la question suivante plus difficile et mieux notée ; une erreur ne retire aucun point.',
                 'Une question à la fois, sans retour en arrière : relis l\'énoncé et ta réponse avant de valider.',
                 'Sur ordinateur, caméra, micro et partage d\'écran activés ; arrêt automatique à 40 minutes.'],
         materiel: 'sur ordinateur, avec caméra et micro'},

  entretien: {minutes: 30, environ: true, anglais: true, src: 'portail'},

  /* Calendrier : date 'AAAA-MM-JJ' (fin facultative pour une période ; approx: 'mois' quand seul le mois est publié :
     affiché « janv. » sans compte à rebours). cible : date proposée par défaut
     pour le compte à rebours. conseil : recommandation de préparation, pas une règle de l'école. */
  calendrier: [
    {id: 'webinaire-fr', date: '2026-11-03', t: 'Webinaire en français, 18 h', src: 'evenements'},
    {id: 'jpo-marseille-virtuelle', date: '2026-11-11', t: 'Portes ouvertes virtuelles, Marseille', src: 'evenements'},
    {id: 'jpo-paris', date: '2026-11-14', t: 'Portes ouvertes, Paris, 10 h 30', src: 'evenements'},
    {id: 'limite-mois', date: '2026-11-15', t: '« Date limite » affichée dans l\'espace candidat pour le dépôt de ce mois', src: 'portail',
     note: 'Affichage mensuel : une nouvelle date apparaît chaque mois.'},
    {id: 'jpo-marseille', date: '2026-11-28', t: 'Portes ouvertes, Marseille', src: 'evenements'},
    {id: 'objectif-test', date: '2026-12-15', t: 'Objectif : test passé au plus tard', cible: true, conseil: true,
     note: 'C\'est un conseil de préparation, pas une règle de l\'école : avant la mise à jour de janvier, et tôt dans l\'ordre d\'arrivée des dossiers.'},
    {id: 'carte-psup', date: '2026-12-17', t: 'Carte Parcoursup 2027 en ligne', src: 'calpsup'},
    {id: 'test-janvier', date: '2027-01-01', approx: 'mois', t: 'Test mis à jour et plus difficile', src: 'kit',
     note: 'Date exacte non précisée : « à partir de janvier ».'},
    {id: 'voeux-psup', date: '2027-01-18', fin: '2027-03-11', t: 'Vœux Parcoursup', src: 'calpsup'},
    {id: 'confirmation-psup', date: '2027-04-01', t: 'Confirmation des vœux Parcoursup', src: 'calpsup'},
    {id: 'reponses-psup', date: '2027-06-01', t: 'Premières réponses Parcoursup', src: 'calpsup'}
  ],

  /* Checklist du dossier : ids STABLES, clés de S.albert.checklist. */
  dossier: [
    {id: 'eligibilite', t: 'Éligibilité de ta filière et de tes spécialités confirmée par écrit par l\'école, avant le vrai test'},
    {id: 'identite',  t: 'Pièce d\'identité scannée'},
    {id: 'bulletins', t: 'Deux derniers bulletins de Première (puis T1 de Terminale en document supplémentaire)'},
    {id: 'cv',        t: 'CV d\'une page'},
    {id: 'lettre',    t: 'Lettre de 300 à 400 mots, 4 paragraphes, citant un événement de l\'école'},
    {id: 'relu',      t: 'Tout relu avant l\'envoi (documents obligatoires verrouillés ensuite)'},
    {id: 'webinaire', t: 'Webinaire ou portes ouvertes suivis'},
    {id: 'questions', t: 'E-mail à admission@albertschool.com (contrat, acompte, Parcoursup)'},
    {id: 'budget',    t: 'Budget validé avec la famille (14' + M + '900 €/an + logement)'},
    {id: 'bourse',    t: 'Justificatifs prêts pour la demande de bourse (avis d\'imposition)'},
    {id: 'materiel',  t: 'Ordinateur, webcam, micro, pièce calme testés pour le jour J'},
    {id: 'cv-chiffres', t: 'CV chiffré : chaque expérience avec un résultat mesurable, LinkedIn à jour, pas de photo'},
    {id: 'projets',   t: 'Projets personnels ajoutés au dossier (documents facultatifs) : sites, agents IA, clients accompagnés'},
    {id: 'brainteasers', t: 'Deux ou trois brainteasers d\'estimation faits à voix haute avant l\'entretien'},
    {id: 'actu-ia',   t: 'Deux actualités récentes de la data et de l\'IA prêtes à expliquer'}
  ]
};

/* ============================================================
   Banques de l'oral (vues/albert-oral.js). Elles seront enrichies : garder ce format.
   - motivation[] : {id:'mot-NN', q, attendus:[…], pieges:[…]}
   - estimation[] : {id:'est-NN', q, unite, ordre:[min, max] (fourchette jugée juste, en unités),
                     hypotheses:[…] (découpage modèle, chiffré), corrige, ref (d'où vient l'ordre de grandeur)}
     La correction locale lit le nombre final de l'élève et mesure l'écart en puissances de 10 à [min, max].
   - anglais[]    : {id:'en-NN', q (en anglais), attendus:[…] (en français), aide:[…] (tournures utiles)}
   - relances     : {accueil, motivation, estimation, anglais, cloture} : listes de relances du jury local
                    (motivation[0] sert de relance fixe aux réponses trop courtes).
   - pitch        : {formats:[{id, t, sec, consigne, aConfirmer?}], checklist:[{id, t}]}
   - criteres     : libellés des 6 critères de l'évaluation (ids fixes : schéma de l'évaluation IA).
   - autoEval     : auto-évaluation du mode local, par critère : {id, items:[…]}.
   Aucune affirmation sur l'école ici : les faits restent dans ALBERT_INFOS.
   ============================================================ */
window.ALBERT_ENTRETIEN = {
  version: 1,

  motivation: [
    {id: 'mot-01', q: 'Présentez-vous en une minute.',
     attendus: ['Un fil conducteur : d\'où tu viens, ce qui t\'anime, où tu vas.',
                'Un fait concret et vérifiable : un projet, une responsabilité, un résultat chiffré.',
                'Le lien avec un bachelor business et data, en une phrase.'],
     pieges: ['Réciter ton CV ligne par ligne.', 'Dépasser une minute trente.', 'Commencer par « Alors, euh… je m\'appelle ».']},
    {id: 'mot-02', q: 'Pourquoi voulez-vous rejoindre cette école plutôt qu\'une école de commerce classique ?',
     attendus: ['Ce qui te plaît dans le mélange business, data et mathématiques.',
                'Un élément précis que tu as vu toi-même : un cours du programme, un événement, un échange avec un étudiant.',
                'Ce que tu y feras, pas seulement ce que l\'école t\'apportera.'],
     pieges: ['Des compliments vagues (« école prestigieuse », « bonne réputation »).',
              'Des chiffres sur l\'école que tu n\'as pas vérifiés.', 'Dénigrer les autres écoles.']},
    {id: 'mot-03', q: 'Pourquoi la data ? Qu\'est-ce qui vous attire dans ce domaine ?',
     attendus: ['Un déclic personnel : un tableau de bord, une statistique qui t\'a surpris, un projet.',
                'Une idée juste de ce qu\'on fait avec des données : décider, prévoir, mesurer.',
                'La conscience que les maths sont l\'outil central, et la preuve que tu t\'y prépares.'],
     pieges: ['« Parce que c\'est l\'avenir », sans exemple.', 'Confondre la data avec l\'informatique pure.',
              'Annoncer un métier que tu ne sais pas décrire.']},
    {id: 'mot-04', q: 'Parlez-moi d\'un projet dont vous êtes fier ou fière.',
     attendus: ['Situation, ton rôle précis, tes actions, le résultat.', 'Au moins un chiffre : budget, nombre de personnes, résultat obtenu.',
                'Ce que tu ferais différemment aujourd\'hui.'],
     pieges: ['Dire « on » tout le temps : le jury veut savoir ce que toi, tu as fait.', 'Un projet sans résultat ni apprentissage.',
              'Enjoliver : le jury relance sur les détails.']},
    {id: 'mot-05', q: 'En quoi votre parcours au lycée vous prépare-t-il à un bachelor exigeant en mathématiques ?',
     attendus: ['Ce que ta filière et tes spécialités t\'ont apporté de concret.',
                'Ce que tu fais pour progresser en maths : entraînement régulier, tests blancs, progression mesurée.',
                'Une preuve : une note, une progression, une compétence travaillée.'],
     pieges: ['T\'excuser de ta filière.', 'Dire que les maths « ce n\'est pas ton truc ».', 'Promettre sans montrer de travail réel.']},
    {id: 'mot-06', q: 'Où vous voyez-vous dans cinq ans ?',
     attendus: ['Une direction claire, même provisoire : un métier, un secteur, un type d\'entreprise.',
                'Un lien logique avec le programme.', 'De l\'ouverture : tu sais que ton projet peut évoluer.'],
     pieges: ['« Je ne sais pas encore. »', 'Un rêve sans étapes.', 'Un discours appris par cœur.']},
    {id: 'mot-07', q: 'Quelle est votre plus grande faiblesse ?',
     attendus: ['Une vraie faiblesse, pas une qualité déguisée.', 'Ce que tu fais concrètement pour progresser.', 'Un signe de progrès mesurable.'],
     pieges: ['« Je suis trop perfectionniste. »', 'Une faiblesse rédhibitoire pour le programme, sans plan d\'action.', 'Te dévaloriser longuement.']},
    {id: 'mot-08', q: 'Parlez-moi d\'un échec ou d\'une difficulté, et de ce que vous en avez tiré.',
     attendus: ['Un échec réel, avec un enjeu.', 'Ta part de responsabilité, sans détour.', 'La leçon tirée, et la preuve que tu l\'as appliquée ensuite.'],
     pieges: ['Rejeter la faute sur les autres.', 'Choisir un échec sans enjeu.', 'Oublier la leçon tirée.']},
    {id: 'mot-09', q: 'Quelle actualité économique ou technologique vous a marqué récemment ?',
     attendus: ['Un fait précis et récent, que tu peux expliquer simplement.', 'Ton analyse : causes, conséquences, chiffres clés.',
                'Un lien avec la data ou la prise de décision.'],
     pieges: ['Un sujet que tu ne maîtrises pas : le jury creuse.', 'Une opinion sans argument.', 'Une actualité vieille de plusieurs années.']},
    {id: 'mot-10', q: 'Racontez une expérience de travail en équipe.',
     attendus: ['Ton rôle exact dans l\'équipe.', 'Une difficulté (désaccord, retard) et la façon dont vous l\'avez réglée.', 'Le résultat obtenu ensemble.'],
     pieges: ['Te présenter comme la seule personne qui travaillait.', 'Ne parler que de l\'ambiance.', 'Aucun exemple concret.']},
    {id: 'mot-11', q: 'Quelles démarches avez-vous faites pour connaître l\'école et le programme ?',
     attendus: ['Des démarches concrètes : site, webinaire, portes ouvertes, échange avec un étudiant.',
                'Un élément précis retenu lors de ces échanges.', 'Ce que cela a confirmé ou changé dans ton choix.'],
     pieges: ['Tout tirer des réseaux sociaux.', 'Citer un événement auquel tu n\'as pas assisté.', 'Réciter la plaquette.']},
    {id: 'mot-12', q: 'Pourquoi devrions-nous vous choisir ?',
     attendus: ['Trois atouts, chacun appuyé par une preuve.', 'Ce que tu apporteras aux autres étudiants.', 'De la conviction, sans arrogance.'],
     pieges: ['« Parce que j\'ai la motivation », sans preuve.', 'Te comparer aux autres candidats.', 'Une liste de qualités sans exemple.']},
    {id: 'mot-13', q: 'Avez-vous des questions pour le jury ?',
     attendus: ['Une ou deux questions préparées, précises, dont la réponse n\'est pas sur le site.',
                'Une question qui montre ton projet : stages, projets, vie associative.'],
     pieges: ['« Non, pas de question. »', 'Une question dont la réponse est dans la FAQ.', 'Commencer par les vacances.']}
  ],

  estimation: [
    {id: 'est-00', q: 'Combien de bébés naissent en France chaque année ?', unite: 'naissances par an', ordre: [4e5, 1.2e6],
     hypotheses: ['Environ 67 millions d\'habitants.',
                  'Environ un quart a entre 20 et 40 ans : environ 16 millions.',
                  'La moitié sont des femmes : environ 8 millions.',
                  'Environ 10 % d\'entre elles ont un enfant dans l\'année.'],
     corrige: '8 millions × 10 % = 800' + M + '000 naissances par an : le bon ordre de grandeur. Exemple travaillé présenté au webinaire de candidature.',
     ref: 'INSEE : environ 660' + M + '000 naissances en France en 2024.'},
    {id: 'est-01', q: 'Combien de baguettes de pain sont vendues chaque jour en France ?', unite: 'baguettes par jour', ordre: [8e6, 3e7],
     hypotheses: ['Environ 68 millions d\'habitants, soit environ 30 millions de foyers.',
                  'En moyenne une demi-baguette par foyer et par jour : beaucoup en achètent une, certains deux, d\'autres aucune.',
                  'La restauration et les cantines ajoutent environ 10 %.'],
     corrige: '30 millions de foyers × 0,5 = 15 millions, plus 10 % pour la restauration : de l\'ordre de 15 à 20 millions de baguettes par jour. Contrôle : sur un an, cela fait 5 à 7 milliards.',
     ref: 'Ordre de grandeur largement repris lors de l\'inscription de la baguette au patrimoine de l\'UNESCO (2022) : environ 6 milliards de baguettes par an, soit environ 16 millions par jour. Population : INSEE.'},
    {id: 'est-02', q: 'Combien de balles de tennis faut-il pour remplir une salle de classe ?', unite: 'balles', ordre: [3e5, 1.5e6],
     hypotheses: ['Une salle de 8 m × 7 m × 3 m, soit environ 170 m³.',
                  'Une balle de tennis mesure environ 6,7 cm de diamètre : rangée en cubes, elle occupe environ 300 cm³, soit 0,000' + M + '3 m³.',
                  'On ne retire pas les tables : elles prennent peu de place.'],
     corrige: '170 ÷ 0,000' + M + '3 ≈ 570' + M + '000 balles rangées en cubes ; en les tassant un peu mieux, environ 700' + M + '000. Réponse : de l\'ordre de 500' + M + '000 à 1 million.',
     ref: 'Pas de statistique : calcul géométrique (diamètre réglementaire d\'une balle : environ 6,5 à 6,9 cm).'},
    {id: 'est-03', q: 'Combien d\'entrées au cinéma sont vendues en France en un an ?', unite: 'entrées par an', ordre: [1e8, 3e8],
     hypotheses: ['Environ 68 millions d\'habitants.', 'Un peu plus de la moitié va au cinéma au moins une fois par an.',
                  'Ceux qui y vont y vont en moyenne 4 à 5 fois.'],
     corrige: '68 millions × 0,6 × 4,5 ≈ 180 millions d\'entrées par an.',
     ref: 'CNC : environ 180 millions d\'entrées en 2023 comme en 2024.'},
    {id: 'est-04', q: 'Combien de bébés naissent en France en un an ?', unite: 'naissances par an', ordre: [5e5, 9e5],
     hypotheses: ['Environ 68 millions d\'habitants et une espérance de vie d\'environ 80 ans.',
                  'Si la population était stable, chaque année « remplacerait » 1/80 de la population.',
                  'La fécondité baisse : on retire environ 15 %.'],
     corrige: '68 millions ÷ 80 ≈ 850' + M + '000, moins 15 % : environ 700' + M + '000 naissances par an.',
     ref: 'INSEE (bilan démographique 2024) : environ 660' + M + '000 naissances en 2024.'},
    {id: 'est-05', q: 'Combien de voitures particulières circulent en France ?', unite: 'voitures', ordre: [2.5e7, 5e7],
     hypotheses: ['Environ 30 millions de foyers.', 'Plus de 8 foyers sur 10 ont au moins une voiture, et environ un tiers en ont deux.',
                  'On ajoute les voitures d\'entreprise et de location : environ 10 %.'],
     corrige: '30 millions × (0,85 + 0,35) ≈ 36 millions, plus 10 % : un peu moins de 40 millions de voitures.',
     ref: 'Ministère de la Transition écologique (SDES) : près de 39 millions de voitures particulières en circulation au 1ᵉʳ janvier 2024.'},
    {id: 'est-06', q: 'Combien de litres d\'eau un foyer de 4 personnes consomme-t-il à la maison en un an ?', unite: 'litres par an', ordre: [1e5, 3e5],
     hypotheses: ['Une douche de 5 minutes à 10 litres par minute : 50 litres par personne et par jour.',
                  'Les toilettes : 5 passages à 6 litres, soit 30 litres.', 'Cuisine, vaisselle, linge, ménage : environ 50 litres.',
                  '4 personnes, 365 jours.'],
     corrige: '130 litres × 4 personnes × 365 jours ≈ 190' + M + '000 litres, soit environ 190 m³ par an.',
     ref: 'Souvent cité par les services de l\'eau : de l\'ordre de 150 litres par personne et par jour.'},
    {id: 'est-07', q: 'Combien de candidats passent le baccalauréat chaque année en France ?', unite: 'candidats', ordre: [5e5, 1e6],
     hypotheses: ['Une génération compte environ 800' + M + '000 jeunes (naissances d\'il y a 18 ans).',
                  'Environ 85 % d\'une génération se présente à un bac, toutes voies confondues.'],
     corrige: '800' + M + '000 × 0,85 ≈ 700' + M + '000 candidats par an.',
     ref: 'Ministère de l\'Éducation nationale : de l\'ordre de 700' + M + '000 candidats par session, toutes voies confondues.'},
    {id: 'est-08', q: 'Combien de trains circulent chaque jour en France ?', unite: 'trains par jour', ordre: [5e3, 3e4],
     hypotheses: ['Trains régionaux : une douzaine de régions, environ 700 trains par région et par jour.',
                  'Trains de banlieue en Île-de-France : environ 5' + M + '000 par jour.', 'Grandes lignes : environ 1' + M + '000 par jour.',
                  'Fret : environ 1' + M + '000 par jour.'],
     corrige: '8' + M + '000 + 5' + M + '000 + 1' + M + '000 + 1' + M + '000 ≈ 15' + M + '000 trains par jour.',
     ref: 'SNCF : environ 15' + M + '000 trains par jour sur le réseau ferré national.'},
    {id: 'est-09', q: 'Combien de voyages sont effectués chaque jour dans le métro parisien ?', unite: 'voyages par jour', ordre: [3e6, 7e6],
     hypotheses: ['Environ 12 millions d\'habitants en Île-de-France, dont 2 millions à Paris.',
                  'Un jour de semaine, environ 2 habitants sur 10 de la région prennent le métro.', 'Chacun fait en moyenne 2 voyages.'],
     corrige: '12 millions × 0,2 × 2 ≈ 5 millions de voyages par jour de semaine.',
     ref: 'RATP : de l\'ordre de 4 à 5 millions de voyages par jour ouvré.'},
    {id: 'est-10', q: 'Quel est le chiffre d\'affaires annuel d\'un café de quartier à Paris ?', unite: 'euros par an', ordre: [1.5e5, 1e6],
     hypotheses: ['Environ 300 clients par jour, du café du matin au déjeuner.', 'Un ticket moyen de 5 €.', 'Environ 330 jours d\'ouverture par an.'],
     corrige: '300 × 5 € × 330 ≈ 500' + M + '000 € par an.',
     ref: 'Pas de chiffre officiel : la correction porte sur la démarche. Une fourchette de 150' + M + '000 € à 1 million d\'euros est cohérente.'},
    {id: 'est-11', q: 'Combien de smartphones sont utilisés en France ?', unite: 'smartphones', ordre: [4e7, 8e7],
     hypotheses: ['Environ 68 millions d\'habitants, dont environ 58 millions de 12 ans et plus.',
                  'Près de 9 personnes sur 10 de 12 ans et plus ont un smartphone.', 'Environ 10 % ont en plus un téléphone professionnel.'],
     corrige: '58 millions × 0,9 ≈ 52 millions, plus 10 % : environ 57 millions de smartphones.',
     ref: 'Baromètre du numérique (Arcep, Arcom, CGE) : près de 9 personnes sur 10 de 12 ans et plus ont un smartphone.'}
  ],

  anglais: [
    {id: 'en-01', q: 'Tell me about yourself.',
     attendus: ['Trois à cinq phrases : parcours, centres d\'intérêt, objectif.', 'Un détail concret que tu peux développer.'],
     aide: ['I am currently in my final year of high school…', 'I have always been interested in…', 'My goal is to…']},
    {id: 'en-02', q: 'Why do you want to study business and data?',
     attendus: ['Une raison personnelle, puis un exemple.', 'Le mot « data » employé correctement : decisions, trends, insights.'],
     aide: ['What fascinates me is…', 'For example, when I…', 'Data helps companies make better decisions.']},
    {id: 'en-03', q: 'Describe a challenge you have faced and how you dealt with it.',
     attendus: ['Le prétérit pour raconter : I faced, I decided, it worked.', 'La leçon tirée, en une phrase.'],
     aide: ['Last year, I had to…', 'At first, it was difficult because…', 'In the end, I learned that…']},
    {id: 'en-04', q: 'Which company do you admire, and why?',
     attendus: ['Une entreprise que tu connais vraiment.', 'Deux raisons précises : produit, stratégie, usage des données.'],
     aide: ['I really admire… because…', 'Their strategy is…', 'They use data to…']},
    {id: 'en-05', q: 'How do you think artificial intelligence will change the job market?',
     attendus: ['Un avis nuancé : des métiers changent, d\'autres apparaissent.', 'Un exemple concret.'],
     aide: ['On the one hand…', 'On the other hand…', 'In my opinion…']},
    {id: 'en-06', q: 'Tell me about a project you are proud of.',
     attendus: ['Ton rôle précis et le résultat.', 'Un chiffre, même simple.'],
     aide: ['I was in charge of…', 'We managed to…', 'I am proud of it because…']},
    {id: 'en-07', q: 'What do you like to do in your free time?',
     attendus: ['Une activité, ce qu\'elle t\'apporte, un détail vivant.', 'Une phrase qui relie l\'activité à une qualité utile.'],
     aide: ['In my free time, I…', 'It has taught me…', 'I have been doing it for… years.']},
    {id: 'en-08', q: 'Where do you see yourself in five years?',
     attendus: ['Le futur : I would like to, I hope to, I plan to.', 'Une direction claire, même provisoire.'],
     aide: ['In five years, I would like to…', 'I hope to work in…', 'Ideally, I would…']},
    {id: 'en-09', q: 'Describe a time when you worked in a team.',
     attendus: ['Ton rôle, une difficulté, le résultat.', 'Des connecteurs : first, then, finally.'],
     aide: ['We had to…', 'My role was to…', 'We solved the problem by…']},
    {id: 'en-10', q: 'What would you bring to your class?',
     attendus: ['Deux qualités, chacune avec une preuve.', 'Ce que tu apporteras aux autres, pas seulement à toi.'],
     aide: ['I would bring…', 'For instance…', 'I enjoy helping others to…']},
    {id: 'en-11', q: 'If you could launch a start-up tomorrow, what would it be?',
     attendus: ['Le conditionnel : it would, I would.', 'Le problème résolu, le client visé, comment gagner de l\'argent.'],
     aide: ['I would create…', 'It would help people who…', 'We would make money by…']},
    {id: 'en-12', q: 'What is a recent piece of news that caught your attention?',
     attendus: ['Un fait précis, expliqué simplement.', 'Ton avis, avec une raison.'],
     aide: ['Recently, I read that…', 'It caught my attention because…', 'I think it shows that…']}
  ],

  relances: {
    accueil:    ['Pouvez-vous préciser ce qui vous a conduit vers ce programme ?', 'Qu\'est-ce qui vous définit le mieux, en un mot, et pourquoi ?'],
    motivation: ['Pouvez-vous donner un exemple concret ?', 'Qu\'avez-vous appris de cette expérience ?',
                 'En quoi cela vous prépare-t-il à ce programme ?', 'Qu\'est-ce qui vous distingue des autres candidats sur ce point ?'],
    estimation: ['Quelles hypothèses posez-vous ?', 'Pouvez-vous découper le problème en étapes ?',
                 'Quelle hypothèse est la plus fragile, et comment la vérifieriez-vous ?', 'Vérifiez l\'ordre de grandeur : votre résultat est-il plausible ?'],
    anglais:    ['Could you give me a concrete example?', 'Why is that important to you?', 'Can you tell me a bit more about that?'],
    cloture:    ['Avez-vous des questions pour le jury ?']
  },

  pitch: {
    formats: [
      {id: 'presente-toi', t: 'Présente-toi', sec: 60,
       consigne: 'Ton parcours, ce qui t\'anime, pourquoi ce programme : une minute, pas plus.'},
      {id: 'video-ia', t: 'Conversation vidéo avec un agent IA', sec: 90, aConfirmer: true,
       consigne: 'Une réponse face caméra à une question de motivation, sans notes. Ce format dépend du programme : vérifie dans ton espace candidat.'}
    ],
    checklist: [
      {id: 'regard',    t: 'J\'ai regardé la caméra, pas mes notes.'},
      {id: 'structure', t: 'Mon pitch a un début, un milieu et une fin nets.'},
      {id: 'concret',   t: 'J\'ai cité au moins un fait concret : projet, chiffre, responsabilité.'},
      {id: 'lien',      t: 'J\'ai relié mon parcours au programme.'},
      {id: 'temps',     t: 'J\'ai tenu dans le temps, sans finir en courant.'},
      {id: 'voix',      t: 'J\'ai parlé assez fort et assez lentement, sans « euh » à répétition.'}
    ]
  },

  criteres: [
    {id: 'presentation', t: 'Présentation'},
    {id: 'motivation',   t: 'Motivation'},
    {id: 'estimation',   t: 'Estimation'},
    {id: 'anglais',      t: 'Anglais'},
    {id: 'posture',      t: 'Posture'},
    {id: 'ecole',        t: 'Connaissance de l\'école'}
  ],

  autoEval: [
    {id: 'presentation', items: ['J\'ai présenté mon parcours en une minute environ.', 'J\'ai cité un fait concret : projet, responsabilité, résultat.']},
    {id: 'motivation',   items: ['J\'ai donné au moins un exemple vécu.', 'J\'ai relié mon projet au programme.']},
    {id: 'posture',      items: ['J\'ai vouvoyé et gardé un ton posé.', 'J\'ai répondu à la question posée, sans détour.']},
    {id: 'ecole',        items: ['J\'ai cité un élément précis de l\'école, vérifié par moi-même.', 'Je n\'ai avancé aucun chiffre sur l\'école sans l\'avoir vérifié.']}
  ]
};

/* Nouveautés de la version (Réglages, « Nouveautés ») : 3 au plus. */
window.NOUVEAUTES = Object.assign(window.NOUVEAUTES || {}, {
  '2.2.0': [
    'Objectif Albert School : tout le webinaire de candidature du 28 octobre (école, programmes, CV, lettre, test, entretien), chaque point sourcé.',
    'Le diplôme conjoint avec Mines Paris annoncé sur les cinq campus, Marseille compris (confirmation écrite demandée).',
    'Nouvel exercice d\'estimation (les naissances en France) et quatre nouvelles cases dans la checklist du dossier.'
  ],
  '2.1.0': [
    'Objectif Albert School : une piste de compétences, un test blanc adaptatif de 40 minutes et ton état de préparation.',
    'Un entretien blanc, avec un jury IA si tu as une clé, sinon un jury local.',
    'Le calendrier, la checklist du dossier et des informations vérifiées, chacune avec sa source.'
  ]
});
})();
