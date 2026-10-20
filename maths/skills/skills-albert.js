/* ===== Maths · Objectif Albert School : piste de compétences (hors Sentier) =====
   Catalogue SÉPARÉ : window.ALBERT_SKILLS (jamais SKILLS). Ids « alb-NN-slug », jamais « p1- » à « p7- ».
   Chaque gen(level, R) rend un QCM : exactement 4 choix distincts au sens de normStr, dont a ; accept: null.
   Niveaux 1 à 3 : séries de la leçon (runSerie). Niveaux 4 et 5 : paliers hauts du test blanc adaptatif.
   Script classique dans une IIFE : aucun symbole de premier niveau. Banc : node banc.js <maths> 3000 ALBERT_SKILLS

   Ce fichier ne porte que la compétence de référence (alb-01-pourcentages). Le reste de la piste vit dans
   des fichiers frères skills/skills-albert-*.js, sur le même modèle :
     (function(){ 'use strict'; const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []); A.push({…}); })();
   Chacun est déclaré dans index.html APRÈS celui-ci et AVANT core/base.js (donc avant les vues), et ajouté
   à ASSETS dans sw.js. Champs : id, phase:'albert', ordre (tri du hub), theme (regroupement du hub et
   alternance du test : 'calcul', 'logique', 'suites', 'stats', 'fonctions', 'proba'…), titre, objectif,
   lecon (HTML, avec une .box.astuce), gen(level, R). Le hub groupe par theme et trie par ordre. */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (privées à ce fichier) ---------- */
/* Même normalisation que normStr (core/pedagogie.js:13), chargé APRÈS ce fichier : on la recopie. */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
/* Nombre à la française : d décimales au plus (2 par défaut), virgule, U+202F pour les milliers, vrai signe moins. */
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
const eur = x => nb(x) + ' €';
/* Évolution signée : +12 %, −4 %, 0 %. */
const evo = x => (Math.round(x * 100) / 100 > 0 ? '+' : '') + nb(x) + ' %';
/* QCM : la bonne réponse, puis les distracteurs pédagogiques, puis des voisins jusqu'à 4 choix distincts. */
function qcm(bonne, autres, voisin){
  const vus = new Set([norm(bonne)]), ch = [bonne];
  const ajouter = c => { if (ch.length < 4 && c != null && c !== '' && !vus.has(norm(c))){ vus.add(norm(c)); ch.push(String(c)); } };
  autres.forEach(ajouter);
  for (let k = 1; ch.length < 4 && k < 60; k++) ajouter(voisin(k));
  return ch;
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));   // niveau inconnu : borné, jamais d'exception

/* =====================================================
   alb-01 · Pourcentages et évolutions, sans calculatrice
   ===================================================== */
A.push({
  id: 'alb-01-pourcentages',
  phase: 'albert',                 // jamais un entier 1 à 7 : la piste n'entre ni dans l'altitude ni dans les camps
  ordre: 1,
  theme: 'calcul',
  titre: 'Pourcentages et évolutions',
  objectif: 'Appliquer, enchaîner et inverser une évolution en pourcentage, de tête, en moins d\'une minute.',
  lecon:
`<p class="lede">Une évolution de t % revient toujours à <mark>multiplier par un coefficient</mark> : 1 + t/100 pour une hausse, 1 − t/100 pour une baisse. Tout le reste en découle.</p>
<div class="formule"><p>valeur finale = valeur initiale × (1 + t/100)</p></div>
<div class="etapes">
<p><strong>1. Je traduis en coefficient :</strong> +20 % donne × 1,2 ; −15 % donne × 0,85.</p>
<p><strong>2. J'enchaîne en multipliant :</strong> +20 % puis −20 % donne × 1,2 × 0,8 = × 0,96, soit −4 %.</p>
<p><strong>3. Je remonte en divisant :</strong> après +25 %, 150 € vient de 150 ÷ 1,25 = 120 €.</p>
</div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Écris le coefficient multiplicateur avant tout calcul : une hausse de t % multiplie par 1 + t/100, une baisse de t % multiplie par 1 − t/100.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Les pourcentages ne s'additionnent pas : +10 % puis +10 % font +21 %, pas +20 %. Et −20 % ne se compense pas par +20 %.</p></div>
<table class="tbl"><tr><th>Baisse</th><th>Hausse qui compense</th></tr>
<tr><td>−20 %</td><td>+25 %</td></tr><tr><td>−25 %</td><td>+33,33 %</td></tr><tr><td>−50 %</td><td>+100 %</td></tr></table>
<div class="box retenir"><p class="box-t">À retenir</p><p>Coefficient global = produit des coefficients. Taux global = coefficient global − 1.</p></div>`,
  gen(level, R){
    const n = niv(level);
    if (n === 1){
      const P = R.pick([20, 40, 50, 80, 120, 200, 250, 400]), t = R.pick([10, 20, 25, 50]), hausse = R.int(0, 1) === 1;
      const f = P * (hausse ? 1 + t / 100 : 1 - t / 100);
      return {
        q: 'Un article coûte ' + eur(P) + '. Son prix ' + (hausse ? 'augmente' : 'baisse') + ' de ' + t + ' %. Quel est le nouveau prix ?',
        a: eur(f), accept: null,
        choix: qcm(eur(f), [eur(hausse ? P + t : P - t), eur(P * (hausse ? 1 - t / 100 : 1 + t / 100)), eur(P * t / 100)], k => eur(f + (k % 2 ? k : -k) * 5)),
        expl: 'On multiplie par le coefficient ' + nb(hausse ? 1 + t / 100 : 1 - t / 100) + '. ' + eur(P) + ' × ' + nb(hausse ? 1 + t / 100 : 1 - t / 100) + ' = ' + eur(f) + '.'
      };
    }
    if (n === 2){
      const a = R.pick([10, 20, 25, 50]), b = R.pick([10, 20, 25, 50]);
      const g = ((1 + a / 100) * (1 - b / 100) - 1) * 100;
      return {
        q: 'Un prix augmente de ' + a + ' %, puis baisse de ' + b + ' %. Quelle est son évolution globale ?',
        a: evo(g), accept: null,
        choix: qcm(evo(g), [evo(a - b), evo(-g), evo(g / 2)], k => evo(g + (k % 2 ? k : -k))),
        expl: 'On multiplie les coefficients : ' + nb(1 + a / 100) + ' × ' + nb(1 - b / 100) + ' = ' + nb(1 + g / 100) + '. Le taux global vaut ' + evo(g) + '.'
      };
    }
    if (n === 3){
      const t = R.pick([20, 25, 50]), I = R.pick([40, 80, 120, 160, 200, 240]), F = I * (1 + t / 100);
      return {
        q: 'Après une hausse de ' + t + ' %, un prix vaut ' + eur(F) + '. Quel était le prix avant la hausse ?',
        a: eur(I), accept: null,
        choix: qcm(eur(I), [eur(F * (1 - t / 100)), eur(F - t), eur(F / (1 - t / 100))], k => eur(I + (k % 2 ? k : -k) * 4)),
        expl: 'On remonte en divisant par le coefficient. ' + eur(F) + ' ÷ ' + nb(1 + t / 100) + ' = ' + eur(I) + '.'
      };
    }
    if (n === 4){
      const c = [R.pick([1.1, 1.2, 1.5]), R.pick([0.9, 0.8, 0.5]), R.pick([1.1, 0.9, 1.2, 0.8])];
      const g = (c[0] * c[1] * c[2] - 1) * 100, txt = c.map(k => evo((k - 1) * 100)).join(', puis ');
      return {
        q: 'Une quantité évolue de ' + txt + '. Quelle est son évolution globale ?',
        a: evo(g), accept: null,
        choix: qcm(evo(g), [evo(c.reduce((s, k) => s + (k - 1) * 100, 0)), evo(-g), evo(g + 10)], k => evo(g + (k % 2 ? k : -k) * 2)),
        expl: 'Coefficient global : ' + c.map(k => nb(k)).join(' × ') + ' = ' + nb(1 + g / 100, 4) + '. Le taux global vaut ' + evo(g) + '.'
      };
    }
    const t = R.pick([20, 50, 60, 75, 80]), h = (1 / (1 - t / 100) - 1) * 100;
    return {
      q: 'Un prix baisse de ' + t + ' %. De quel pourcentage doit-il augmenter pour revenir à sa valeur de départ ?',
      a: evo(h), accept: null,
      choix: qcm(evo(h), [evo(t), evo(t / 2), evo(100 - t)], k => evo(h + (k % 2 ? k : -k) * 5)),
      expl: 'Il faut multiplier par 1 ÷ ' + nb(1 - t / 100) + ' = ' + nb(1 + h / 100) + '. La hausse nécessaire vaut ' + evo(h) + '.'
    };
  }
});

})();
