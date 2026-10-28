# Mon dossier · Mode Parcoursup de l'app « Terminale STMG »

Mini-app autonome qui vit dans `dossier/` : ce que le jury lira, trimestre après trimestre.
Tout fonctionne hors ligne, sans dépendance, sans build. Les notes restent dans `localStorage['stmg-dossier']`
du téléphone ; rien ne part ailleurs que chez le fournisseur IA choisi par l'élève, avec sa clé, sur un geste explicite.

## Crochets dans les fichiers générés (à reporter dans les sources du Mac)

`index.html` est régénéré par le script de build : le crochet tient en un bloc, avant `</body>`, à recopier tel quel.

```html
<!-- Mode Parcoursup : début -->
<script defer src="dossier/cadre.js"></script>
<!-- Mode Parcoursup : fin -->
```

`sw.js` racine : **aucune modification nécessaire**. Le service worker racine met `dossier/cadre.js` et `dossier/cadre.css`
en cache à leur première demande (branche « le reste : cache d'abord ») ; la mini-app a son propre service worker
(`dossier/sw.js`, préfixe de cache `dsp-`, portée `/dossier/`) qui prend la main sur l'iframe dès sa première ouverture.

Facultatif (sauvegarde générale de l'app) : ajouter le jeton `'stmg-dossier'` à `CLES_SAUVEGARDE` dans les sources
pour que « Sauvegarde » emporte aussi le dossier. En attendant, Réglages → « Exporter mon dossier (JSON) » le fait.

Entrée NOUVEAUTES pour `nouveautes.py` : `dossier/nouveaute.json`.

## Ce que fait `cadre.js` depuis l'app

- insère la carte d'accueil `section#dossier-carte` avant `#agenda` (masquée pendant une recherche) et le bouton
  `#mode-dossier` après `#mode-maths` (visible à partir de 480 px ; sur iPhone l'entrée est la carte) ;
- ouvre le cadre plein écran `#dossier-cadre` (iframe `./dossier/?embed=1`, z-index 92) sur `#dossier` et
  `#dossier/<écran>` ; refuse d'ouvrir si une séance, un cours ou le cadre Maths est ouvert ; pose
  `html.dossier-ouvert` et `html.sommet-ouvert` (la page devient inerte, la pastille de séance se cache) ;
  Échap, « Fermer » et le retour du téléphone referment ; le focus revient à l'ouvreur ;
- envoie à la mini-app l'index des fiches et la faiblesse par fiche (`DATA` + `stmg-quiz-stats`) ;
- lit seulement `localStorage['stmg-dossier'].resume` pour la carte ; n'écrit jamais rien.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `dossier.css`, `manifest.webmanifest`, `sw.js`, icônes | coque de la mini-app (tête, corps, pied), jetons de l'app, thème clair et sombre du système, impression |
| `calc.js` | calculs purs, testables sous Node (`require('./calc.js')`) |
| `formations.js`, `jalons.js` | gabarits des vœux et calendrier 2026-2027, chaque fait daté et sourcé |
| `pdf-texte.js`, `bulletin-parse.js` | lecture d'un bulletin PDF du lycée sans dépendance (briques testées sur le bulletin réel) |
| `etat.js` | état local, migration, export/import, lecture seule des clés de l'app |
| `ia.js` | lecture d'un bulletin photographié (vision Groq) et relecture d'un texte, avec la clé `stmg-cle-groq` / `mzs-cle-groq` |
| `modele.js` | état dérivé (référence, trajectoire, vœux, priorités, coach hebdomadaire, résumé pour la carte) |
| `ui.js` | création de nœuds, champs, pilules, confirmation inline, feuille `<dialog>`, toasts, aria-live |
| `vue-*.js` | les sept écrans et l'écran de vérification des imports |
| `app.js` | routage par hash, mode embarqué (messages `dsp` / `stmg`), thème |
| `cadre.js`, `cadre.css` | côté app STMG (voir ci-dessus) |

## Coefficients

Table par défaut : coefficients réels du bulletin de Terminale STMG GF relevés sur ÉcoleDirecte le 26/10/2026
(droit-éco 16, MSDGN 12, GF 4, philo 4, HG 3, maths 3, anglais 3, espagnol 3, EPS 3, EMC 1, total 52) et du
bulletin de Première (T3 2025-2026 : français 5, droit-éco 8, management 8, SGN 8, HG 3, maths 3, anglais 3,
espagnol 3, EPS 3, EMC 1, total 45). Un import PDF ou photo qui indique des coefficients les remplace ; chaque valeur
reste modifiable dans Réglages.

## Retrait

Supprimer le dossier `dossier/` et le bloc « Mode Parcoursup » de `index.html`. Les données restent dans
`localStorage['stmg-dossier']` jusqu'à « Effacer mon dossier » (ou suppression des données du site).

## Tests

- Banc Node des calculs : `node banc-calc.js` (hors dépôt, dans le dossier de tests) : moyennes pondérées, écarts,
  priorités, chemin le plus court, T2 requis, préparation, coach, lecture IA, bac.
- Scénarios Playwright (hors dépôt) : injection dans l'app, ouverture et fermeture, refus croisé, liens sortants,
  saisie, estimations, import du PDF réel, vision simulée, simulateur, textes, calendrier, export/import, impression,
  sombre, mouvement réduit, 390 px et 1 280 px, hors ligne.
