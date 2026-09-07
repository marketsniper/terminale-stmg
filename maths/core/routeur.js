/* ===== Maths · De zéro au sommet — routeur =====
   Table de vues extensible, transitions d'écran, historique, garde de sortie,
   démontage systématique des minuteries. (DESIGN-SPEC §5.5 · PRODUCT-SPEC M3)
   Script classique : portée globale partagée (ordre de chargement dans index.html). */
'use strict';

function app(){ return document.getElementById('app'); }

let currentView = 'accueil';

/* Table extensible : route → nom de la fonction de vue (résolue au moment du rendu,
   les vues sont chargées après ce fichier) ou fonction directe. */
const VUES = {
  accueil:    'vAccueil',
  programme:  'vProgramme',
  skill:      'vSkill',
  seance:     'vSeance',
  cm:         'vCalculMental',
  techniques: 'vTechniques',
  technique:  'vTechnique',
  test:       'vTest',
  micro:      'vMicro',
  ds:         'vDS',
  epreuve:    'vEpreuve',
  epreuveRun: 'runEpreuve',
  papier:     'vPapier',
  papierEx:   'vPapierEx',
  erreurs:    'vErreurs',
  coach:      'vCoach',
  reglages:   'vReglages',
  methode:    'vMethode',
  regles:     'vRegles',
  onboarding: 'vOnboarding',
  bilan:      'vBilanAltitude'
};

/* Onglet parent de chaque route (pour aria-current). */
const _rtParent = {
  skill:'programme', papier:'programme', papierEx:'programme', techniques:'programme', technique:'programme',
  cm:'accueil', seance:'accueil', micro:'accueil',
  test:'coach', ds:'coach', epreuve:'coach', epreuveRun:'coach', methode:'coach', regles:'coach',
  reglages:null, bilan:null, onboarding:null
};

/* Routes qu'un rechargement ne doit jamais restaurer (un parcours ne reprend pas à froid). */
const _rtVolatiles = ['seance', 'epreuveRun', 'bilan', 'onboarding', 'ds', 'micro'];

/* État de la vue courante : une vue pose sa garde et son drapeau « parcours en cours ».
   Propriété de window (jamais de déclaration lexicale) pour rester accessible partout. */
window.vueCourante = {v: 'accueil', garde: null, enCours: false};

let _rtVT = null;          // transition de vue en cours
let _rtRendu = false;      // au moins un rendu effectué (retire le squelette statique)

/* Nettoyeurs de vue : écouteurs globaux, observateurs, contrôleurs d'abandon.
   Vidés par teardown() (core/ui.js). */
function surQuitter(fn){ if (typeof fn === 'function') _uiNettoyeurs.push(fn); }

function _rtFn(v){
  const cible = VUES[v];
  if (typeof cible === 'function') return cible;
  if (typeof cible === 'string' && typeof window[cible] === 'function') return window[cible];
  return null;
}

function joursAvant(date){
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  const a = new Date(); a.setHours(0, 0, 0, 0);
  const b = new Date(d); b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / JOUR);
}

/* Lecture du hash au démarrage : rend la route si elle est restaurable. */
window.routeDepuisHash = function(){
  const h = (location.hash || '').replace(/^#/, '');
  if (!h) return null;
  const v = h.split('?')[0];
  if (!VUES[v]) return null;
  if (_rtVolatiles.indexOf(v) >= 0) return null;
  return v;
};

async function nav(v, params){
  const p = params || {};
  /* 1. garde de sortie du parcours en cours */
  const vc = window.vueCourante;
  if (vc && typeof vc.garde === 'function' && !vc.garde()){
    const i = await ouvrirFeuille({
      titre: 'Quitter la séance ?',
      texte: 'Ton étape en cours est perdue, les réponses déjà données sont gardées.',
      boutons: [{label: 'Rester'}, {label: 'Quitter', style: 'danger'}]
    });
    if (i !== 1) return false;
  }

  /* 2. démontage : minuteries, nettoyeurs, contexte du Prof, contexte de page */
  teardown();
  window.vueCourante = {v: v, garde: null, enCours: false};
  currentView = v;

  const rendre = () => {
    const cible = app();
    const fn = _rtFn(v) || _rtFn('accueil');
    if (!cible) return;
    cible.dataset.density = 'lecture';
    try {
      if (fn) fn(p);
      else cible.innerHTML = vide({icone: 'compass', titre: 'Écran indisponible.', texte: 'Reviens à Aujourd\'hui, tout est là.'});
    } catch(e){
      console.error('[nav]', v, e);
      cible.innerHTML = vide({icone: 'warning', titre: 'Cet écran n\'a pas pu s\'afficher.',
                              texte: 'Ta progression est sauvegardée. Reviens à Aujourd\'hui.'});
    }
    _rtRendu = true;
    const sk = document.getElementById('skeleton'); if (sk) sk.remove();
    const lent = document.getElementById('demarrage-lent'); if (lent) lent.hidden = true;
    syncNav(_rtParent[v] !== undefined ? (_rtParent[v] || v) : v);
    try { scrollTo({top: 0, behavior: 'instant'}); } catch(e){ scrollTo(0, 0); }
    const h = document.querySelector('#app h1');
    if (h){ h.tabIndex = -1; try { h.focus({preventScroll: true}); } catch(e){} }
  };

  /* 3. historique */
  if (!p.remplace){
    try { history.pushState({v: v, params: p}, '', '#' + v); } catch(e){}
  } else {
    try { history.replaceState({v: v, params: p}, '', '#' + v); } catch(e){}
  }

  /* 4. transition de vue */
  const reduit = (document.documentElement.dataset.motion === 'reduit') ||
                 (typeof REDUCE !== 'undefined' && REDUCE) ||
                 matchMedia('(prefers-reduced-motion: reduce)').matches;
  _uiPauseToast = true;
  if (reduit || !document.startViewTransition){
    rendre();
    _uiPauseToast = false;
    _uiToastSuivant();
  } else {
    if (_rtVT && _rtVT.skipTransition) { try { _rtVT.skipTransition(); } catch(e){} }
    _rtVT = document.startViewTransition(rendre);
    _rtVT.finished.catch(() => {}).then(() => { _rtVT = null; _uiPauseToast = false; _uiToastSuivant(); });
  }
  emettre('vue', {v: v, params: p});
  return true;
}

/* Sortie d'un parcours par le bouton « Quitter » de l'en-tête : passe par la garde. */
function quitterParcours(){ return nav('accueil'); }

/* Bouton retour du navigateur / geste iOS. */
addEventListener('popstate', e => {
  const s = e.state;
  const v = (s && s.v) || window.routeDepuisHash() || 'accueil';
  const avant = currentView;
  const params = Object.assign({}, (s && s.params) || {}, {remplace: true});
  Promise.resolve(nav(v, params)).then(ok => {
    if (ok === false){
      /* garde refusée : on rejoue l'état courant pour ne pas quitter l'écran */
      try { history.pushState({v: avant, params: {}}, '', '#' + avant); } catch(e2){}
    }
  });
});
