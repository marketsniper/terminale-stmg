// ============================================================
// PHASE 5 — Terminale + concours (SESAME / ACCÈS)
// 8 skills : degré 3, suites en contexte, probabilités totales,
// stats à deux variables, puis 4 skills « spécial concours ».
// ============================================================
(function(){

function fr(n){ return String(n).replace(".", ","); }
function r2(x){ return Math.round(x*100)/100; }

// ------------------------------------------------------------
// p5-01 — Fonctions polynômes de degré 3
// ------------------------------------------------------------
SKILLS.push({
  id: 'p5-01-degre3',
  phase: 5,
  ordre: 1,
  titre: 'Fonctions polynômes de degré 3',
  objectif: "Dériver un polynôme de degré 3, lire ses variations et compter les solutions de f(x) = k.",
  lecon: `<p class="lede">Une fonction du type f(x) = x<sup>3</sup> + … a une courbe en « S » : elle peut monter, redescendre, puis remonter. Pour tout savoir sur elle (où elle monte, où elle descend, combien de fois elle coupe une droite), un seul outil suffit : <mark>la dérivée</mark>.</p>
<p>Les règles de dérivation à connaître : la dérivée de x<sup>3</sup> est 3x<sup>2</sup>, celle de x<sup>2</sup> est 2x, celle de kx est k, et une constante seule disparaît (sa dérivée est nulle).</p>
<div class="formule"><p>Si f(x) = ax<sup>3</sup> + bx<sup>2</sup> + cx + d, alors f'(x) = 3ax<sup>2</sup> + 2bx + c.</p></div>
<p>Déroulons un exemple complet avec f(x) = x<sup>3</sup> − 3x + 1 :</p>
<div class="etapes">
<p><strong>1. Je dérive :</strong> f'(x) = 3x<sup>2</sup> − 3.</p>
<p><strong>2. Je cherche où f' s'annule :</strong> 3x<sup>2</sup> − 3 = 3(x − 1)(x + 1), qui s'annule en x = −1 et x = 1.</p>
<p><strong>3. Signe de f' :</strong> positive à l'extérieur des racines, négative entre les deux. Donc f monte jusqu'à x = −1, descend entre −1 et 1, puis remonte.</p>
<p><strong>4. Extremums locaux :</strong> maximum local en x = −1 : f(−1) = −1 + 3 + 1 = 3. Minimum local en x = 1 : f(1) = 1 − 3 + 1 = −1.</p>
<p><strong>5. Nombre de solutions de f(x) = k :</strong> imagine une droite horizontale à la hauteur k. Elle coupe la courbe <mark>3 fois si k est strictement entre −1 et 3</mark>, 2 fois si k = −1 ou k = 3, et 1 seule fois sinon.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Le signe de f' donne les variations de f. Un maximum local apparaît là où f' passe de + à −, un minimum local là où elle passe de − à +.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour compter les solutions de f(x) = k, pas besoin de tracer la courbe : compare simplement k au minimum local et au maximum local.</p></div>`,
  gen(level, R){
    if (level === 1){
      var t = R.pick(['deriv', 'cube', 'derivnum']);
      if (t === 'deriv'){
        var b = R.int(2,5), c = R.int(1,9);
        var bon = "3x² + " + (2*b) + "x";
        return {
          q: "f(x) = x³ + " + b + "x² + " + c + "\nQuelle est la dérivée f'(x) ?",
          a: bon,
          accept: null,
          choix: [bon, "3x² + " + b + "x", "x² + " + (2*b) + "x", "3x² + " + (2*b) + "x + " + c],
          expl: "(x³)' donne 3x², (" + b + "x²)' donne " + (2*b) + "x, et la constante " + c + " disparaît."
        };
      }
      if (t === 'cube'){
        var n = R.int(2,5);
        return {
          q: "f(x) = x³. Calcule f(" + n + ").",
          a: String(n*n*n),
          accept: null,
          choix: null,
          expl: n + "³ = " + n + " × " + n + " × " + n + " = " + (n*n*n) + "."
        };
      }
      var n2 = R.int(2,6);
      return {
        q: "f(x) = x³, donc f'(x) = 3x².\nCalcule f'(" + n2 + ").",
        a: String(3*n2*n2),
        accept: null,
        choix: null,
        expl: "f'(" + n2 + ") = 3 × " + n2 + "² = 3 × " + (n2*n2) + " = " + (3*n2*n2) + "."
      };
    }
    if (level === 2){
      var t2 = R.pick(['sens', 'maxloc', 'derivfull']);
      if (t2 === 'derivfull'){
        var A = R.int(2,3), B = R.int(2,4), C = R.int(2,5), D = R.int(1,9);
        var bon3 = (3*A) + "x² + " + (2*B) + "x + " + C;
        return {
          q: "f(x) = " + A + "x³ + " + B + "x² + " + C + "x + " + D + "\nQuelle est la dérivée f'(x) ?",
          a: bon3,
          accept: null,
          choix: [bon3, A + "x² + " + B + "x + " + C, (3*A) + "x² + " + (2*B) + "x", (3*A) + "x³ + " + (2*B) + "x² + " + C + "x"],
          expl: "Terme à terme : " + A + "x³ donne " + (3*A) + "x², " + B + "x² donne " + (2*B) + "x, " + C + "x donne " + C + ", et " + D + " disparaît."
        };
      }
      var aa = R.int(1,3);
      var cc = R.int(1,6);
      var k3 = 3*aa*aa;
      var head = "f(x) = x³ − " + k3 + "x + " + cc + ". On sait que f'(x) = 3x² − " + k3 + " = 3(x − " + aa + ")(x + " + aa + ").";
      if (t2 === 'sens'){
        var bon2 = "[−" + aa + " ; " + aa + "]";
        return {
          q: head + "\nSur quel intervalle f est-elle décroissante ?",
          a: bon2,
          accept: null,
          choix: [bon2, "]−∞ ; −" + aa + "]", "[" + aa + " ; +∞[", "]−∞ ; +∞["],
          expl: "f'(x) est négative entre ses racines −" + aa + " et " + aa + " : f décroît sur [−" + aa + " ; " + aa + "]."
        };
      }
      return {
        q: head + "\nEn quelle valeur de x la fonction f admet-elle un maximum local ?",
        a: "-" + aa,
        accept: null,
        choix: null,
        expl: "f' passe du signe + au signe − en x = −" + aa + " : c'est le maximum local (le minimum local est en x = " + aa + ")."
      };
    }
    // level 3
    var aa3 = R.int(1,2), cc3 = R.int(-3,3);
    var k33 = 3*aa3*aa3;
    var cube = aa3*aa3*aa3;
    var M = 2*cube + cc3;
    var m = -2*cube + cc3;
    var cTxt = cc3 === 0 ? "" : (cc3 > 0 ? " + " + cc3 : " − " + (-cc3));
    var ftxt = "f(x) = x³ − " + k33 + "x" + cTxt;
    var t3 = R.pick(['nbsol', 'nbsol', 'valmax']);
    if (t3 === 'valmax'){
      return {
        q: ftxt + "\nSon maximum local est atteint en x = −" + aa3 + ".\nCalcule la valeur de ce maximum : f(−" + aa3 + ").",
        a: String(M),
        accept: null,
        choix: null,
        expl: "f(−" + aa3 + ") = (−" + aa3 + ")³ − " + k33 + " × (−" + aa3 + ")" + cTxt + " = −" + cube + " + " + (3*cube) + cTxt + " = " + M + "."
      };
    }
    var sc = R.pick(['haut', 'bas', 'entre', 'egalM', 'egalm']);
    var k, nb;
    if (sc === 'haut'){ k = M + R.int(1,4); nb = '1'; }
    else if (sc === 'bas'){ k = m - R.int(1,4); nb = '1'; }
    else if (sc === 'entre'){ k = m + R.int(1, M - m - 1); nb = '3'; }
    else if (sc === 'egalM'){ k = M; nb = '2'; }
    else { k = m; nb = '2'; }
    return {
      q: ftxt + "\nMaximum local : " + M + " (en x = −" + aa3 + "). Minimum local : " + m + " (en x = " + aa3 + ").\nCombien de solutions possède l'équation f(x) = " + k + " ?",
      a: nb,
      accept: null,
      choix: ['0', '1', '2', '3'],
      expl: "La droite horizontale y = k coupe la courbe 3 fois si k est strictement entre " + m + " et " + M + ", 2 fois si k est égal à l'un des deux, 1 fois sinon. Ici k = " + k + " → " + nb + " solution(s)."
    };
  }
});

// ------------------------------------------------------------
// p5-02 — Suites en contexte
// ------------------------------------------------------------
SKILLS.push({
  id: 'p5-02-suites-applications',
  phase: 5,
  ordre: 2,
  titre: 'Suites en contexte',
  objectif: "Modéliser placements et dépréciations par une suite, calculer un terme et répondre aux questions de seuil.",
  lecon: `<p class="lede">Placements, voitures qui perdent de la valeur, loyers qui augmentent… derrière presque tous les problèmes d'argent se cache une suite. La seule vraie question à se poser : est-ce qu'on <mark>ajoute</mark> toujours le même nombre, ou est-ce qu'on <mark>multiplie</mark> toujours par le même nombre ?</p>
<div class="etapes">
<p><strong>1. On ajoute le même montant</strong> (+50 € chaque année) → suite <strong>arithmétique</strong> : valeur après n années = départ + n × 50.</p>
<p><strong>2. On applique le même pourcentage</strong> (+10 % chaque année) → suite <strong>géométrique</strong> : chaque année on multiplie par 1,1, donc valeur = départ × 1,1<sup>n</sup>.</p>
</div>
<p>Exemple complet : 2 000 € placés à 10 % par an (intérêts composés).</p>
<div class="etapes">
<p>Année 0 : 2 000 €.</p>
<p>Année 1 : 2 000 × 1,1 = 2 200 €.</p>
<p>Année 2 : 2 200 × 1,1 = 2 420 €.</p>
<p>Année 3 : 2 420 × 1,1 = 2 662 €.</p>
<p><strong>Question seuil :</strong> « au bout de combien d'années dépasse-t-on 2 600 € ? » On lit le tableau : <mark>au bout de 3 ans</mark>.</p>
</div>
<div class="formule"><p>Augmenter de t % = multiplier par (1 + t/100). Diminuer de t % = multiplier par (1 − t/100). Exemple : perdre 10 % = × 0,9.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Une machine qui perd 10 % par an ne perd pas 10 % de son prix de départ chaque année : elle perd 10 % de sa valeur de <strong>l'année précédente</strong>. C'est une multiplication par 0,9, répétée.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>On ajoute → arithmétique. On multiplie → géométrique. Un pourcentage répété, c'est toujours géométrique.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour les questions « au bout de combien d'années… », avance simplement année par année en notant les valeurs : c'est rapide, sûr, et c'est exactement ce qu'on attend de toi.</p></div>`,
  gen(level, R){
    if (level === 1){
      var t = R.pick(['nature-arith', 'nature-geo', 'terme-arith']);
      if (t === 'nature-arith'){
        var m = R.pick([20, 50, 100, 200]);
        var bon = "arithmétique de raison " + m;
        return {
          q: "Chaque année, Emma dépose " + m + " € de plus sur son livret (sans intérêts).\nLa suite des montants du livret est une suite :",
          a: bon,
          accept: null,
          choix: [bon, "géométrique de raison " + m, "géométrique de raison 1,05", "arithmétique de raison 1,05"],
          expl: "On ajoute toujours le même montant (+" + m + " €) : c'est une suite arithmétique de raison " + m + "."
        };
      }
      if (t === 'nature-geo'){
        var hausse = R.pick([true, false]);
        if (hausse){
          var tx = R.pick([5, 10]);
          var rr = tx === 5 ? "1,05" : "1,1";
          var bon2 = "géométrique de raison " + rr;
          return {
            q: "Un capital augmente de " + tx + " % chaque année.\nLa suite des valeurs du capital est une suite :",
            a: bon2,
            accept: null,
            choix: [bon2, "arithmétique de raison " + tx, "géométrique de raison " + tx, "arithmétique de raison " + rr],
            expl: "+" + tx + " % = × " + rr + " : on multiplie chaque année par le même nombre, donc suite géométrique de raison " + rr + "."
          };
        }
        var tb = R.pick([10, 20]);
        var rb = tb === 10 ? "0,9" : "0,8";
        var rbFaux = tb === 10 ? "1,1" : "1,2";
        var bon3 = "géométrique de raison " + rb;
        return {
          q: "Une machine perd " + tb + " % de sa valeur chaque année.\nLa suite des valeurs de la machine est une suite :",
          a: bon3,
          accept: null,
          choix: [bon3, "géométrique de raison " + rbFaux, "arithmétique de raison −" + tb, "géométrique de raison 0," + (tb/10)],
          expl: "Perdre " + tb + " %, c'est multiplier par 1 − " + fr(tb/100) + " = " + rb + " : suite géométrique de raison " + rb + "."
        };
      }
      var C = R.pick([500, 800, 1000, 1200]);
      var mm = R.pick([20, 50, 100]);
      var n = R.int(2,6);
      return {
        q: "Léo place " + C + " € (sans intérêts) et ajoute " + mm + " € à la fin de chaque année.\nQuelle somme (en €) possède-t-il au bout de " + n + " années ?",
        a: String(C + n*mm),
        accept: null,
        choix: null,
        expl: C + " + " + n + " × " + mm + " = " + C + " + " + (n*mm) + " = " + (C + n*mm) + " €."
      };
    }
    if (level === 2){
      var t2 = R.pick(['geo-pos', 'geo-neg', 'formule']);
      if (t2 === 'geo-pos'){
        var tx2 = R.pick([5, 10]);
        var n2 = tx2 === 5 ? 2 : R.pick([2, 3]);
        var C2 = R.pick([500, 1000, 2000]);
        var f0 = 1 + tx2/100;
        var v = r2(C2 * Math.pow(f0, n2));
        return {
          q: "Un capital de " + C2 + " € est placé à " + tx2 + " % par an (intérêts composés).\nQuelle est sa valeur (en €) au bout de " + n2 + " années ?",
          a: String(v),
          accept: null,
          choix: null,
          expl: "Chaque année on multiplie par " + fr(f0) + ", " + n2 + " fois de suite : " + C2 + " × " + fr(f0) + (n2 === 3 ? " × " + fr(f0) + " × " + fr(f0) : " × " + fr(f0)) + " = " + fr(v) + " €."
        };
      }
      if (t2 === 'geo-neg'){
        var C3 = R.pick([10000, 15000, 20000]);
        var n3 = R.pick([2, 3]);
        var v3 = r2(C3 * Math.pow(0.9, n3));
        return {
          q: "Une voiture achetée " + C3 + " € perd 10 % de sa valeur chaque année.\nQuelle est sa valeur (en €) au bout de " + n3 + " ans ?",
          a: String(v3),
          accept: null,
          choix: null,
          expl: "Perdre 10 % = × 0,9 chaque année : " + C3 + " × 0,9" + (n3 === 2 ? " × 0,9" : " × 0,9 × 0,9") + " = " + fr(v3) + " €."
        };
      }
      var C4 = R.pick([200, 300, 400]);
      var m4 = R.pick([15, 25, 40]);
      var n4 = R.int(6,12);
      return {
        q: "Le nombre d'abonnés d'une salle de sport est modélisé par u(n) = " + C4 + " + " + m4 + "n, où n est le nombre d'années écoulées.\nCalcule u(" + n4 + ").",
        a: String(C4 + m4*n4),
        accept: null,
        choix: null,
        expl: "u(" + n4 + ") = " + C4 + " + " + m4 + " × " + n4 + " = " + C4 + " + " + (m4*n4) + " = " + (C4 + m4*n4) + "."
      };
    }
    // level 3
    var t3 = R.pick(['seuil-geo', 'seuil-dep', 'seuil-arith']);
    if (t3 === 'seuil-geo'){
      var S = R.pick([1300, 1500, 1600, 1750, 1900, 2100]);
      var nb = 0, val = 1000;
      while (val < S && nb < 60){ val = val * 1.1; nb++; }
      return {
        q: "On place 1000 € à 10 % par an (intérêts composés).\nAu bout de combien d'années le capital dépasse-t-il " + S + " € ?",
        a: String(nb),
        accept: null,
        choix: null,
        expl: "On multiplie par 1,1 année après année : au bout de " + nb + " ans le capital vaut environ " + fr(r2(val)) + " €, ce qui dépasse " + S + " € pour la première fois."
      };
    }
    if (t3 === 'seuil-dep'){
      var C5 = R.pick([10000, 20000]);
      var tp = R.pick([20, 30]);
      var fac = 1 - tp/100;
      var demi = C5/2;
      var nb2 = 0, val2 = C5;
      while (val2 > demi && nb2 < 60){ val2 = val2 * fac; nb2++; }
      return {
        q: "Un matériel acheté " + C5 + " € perd " + tp + " % de sa valeur chaque année.\nAu bout de combien d'années sa valeur passe-t-elle sous " + demi + " € (la moitié) ?",
        a: String(nb2),
        accept: null,
        choix: null,
        expl: "Chaque année on multiplie par " + fr(fac) + " : au bout de " + nb2 + " ans la valeur est d'environ " + fr(r2(val2)) + " €, sous la barre des " + demi + " €."
      };
    }
    var C6 = R.pick([100, 200, 300]);
    var m6 = R.pick([20, 25, 50]);
    var kk = R.int(4,9);
    var S6 = C6 + m6*kk - R.int(1, m6 - 1);
    var nb3 = 0, val3 = C6;
    while (val3 < S6 && nb3 < 60){ val3 = val3 + m6; nb3++; }
    return {
      q: "Une cagnotte contient " + C6 + " € et on y ajoute " + m6 + " € chaque semaine.\nAu bout de combien de semaines dépasse-t-elle " + S6 + " € ?",
      a: String(nb3),
      accept: null,
      choix: null,
      expl: "Il manque " + (S6 - C6) + " € et (" + S6 + " − " + C6 + ") ÷ " + m6 + " = " + fr(r2((S6 - C6)/m6)) + " : on arrondit à l'entier au-dessus, soit " + nb3 + " semaines."
    };
  }
});

// ------------------------------------------------------------
// p5-03 — Probabilités totales
// ------------------------------------------------------------
SKILLS.push({
  id: 'p5-03-probas-totales',
  phase: 5,
  ordre: 3,
  titre: 'Probabilités totales',
  objectif: "Lire un arbre à deux niveaux et appliquer la formule des probabilités totales sur des situations concrètes.",
  lecon: `<p class="lede">Un arbre de probabilités, c'est un GPS : chaque chemin raconte une histoire complète. Et il n'y a que deux règles de circulation : on <mark>multiplie le long d'un chemin</mark>, et on <mark>additionne les chemins</mark> qui mènent au même résultat.</p>
<p>Au premier niveau, on écrit P(A) et P(Ā) (l'événement contraire) : leur somme fait 1. Au deuxième niveau, on écrit des probabilités conditionnelles : P_A(B) se lit « probabilité de B <strong>sachant</strong> A », c'est-à-dire quand on est déjà sur la branche A.</p>
<p>Exemple complet : dans une entreprise, 60 % des salariés sont des femmes. 30 % des femmes et 20 % des hommes viennent à vélo. Quelle est la probabilité qu'un salarié pris au hasard vienne à vélo ?</p>
<div class="etapes">
<p><strong>1. Chemin « femme puis vélo » :</strong> 0,6 × 0,3 = 0,18.</p>
<p><strong>2. Chemin « homme puis vélo » :</strong> 0,4 × 0,2 = 0,08.</p>
<p><strong>3. On additionne les deux chemins qui mènent à « vélo » :</strong> 0,18 + 0,08 = <mark>0,26</mark>, soit 26 %.</p>
</div>
<div class="formule"><p>Probabilités totales : P(B) = P(A) × P_A(B) + P(Ā) × P_Ā(B)</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Ne confonds pas P_A(B) (« sachant qu'on est sur la branche A ») et P(A ∩ B) (« les deux à la fois »). Sur l'arbre, P_A(B) est écrit <strong>sur</strong> la branche ; P(A ∩ B) se calcule <strong>au bout</strong> du chemin, par multiplication.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Le long d'un chemin : on multiplie. Entre les chemins qui donnent le même événement : on additionne. Et les branches qui partent d'un même nœud s'additionnent toujours à 1.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Avant tout calcul, vérifie ton arbre : chaque paire de branches doit sommer à 1. Cette vérification de cinq secondes évite la moitié des erreurs.</p></div>`,
  gen(level, R){
    if (level === 1){
      var t = R.pick(['branche', 'complement', 'lecture']);
      if (t === 'branche'){
        var pi = R.int(2,8), qi = R.int(1,9);
        var prod = pi*qi;
        return {
          q: "Dans un arbre de probabilités : P(A) = 0," + pi + " et P_A(B) = 0," + qi + ".\nCalcule P(A ∩ B).",
          a: String(prod/100),
          accept: null,
          choix: null,
          expl: "On multiplie le long du chemin : 0," + pi + " × 0," + qi + " = " + fr(prod/100) + "."
        };
      }
      if (t === 'complement'){
        var p2 = R.int(1,9);
        return {
          q: "On sait que P(A) = 0," + p2 + ".\nQue vaut P(Ā), la probabilité de l'événement contraire ?",
          a: String((10 - p2)/10),
          accept: null,
          choix: null,
          expl: "P(Ā) = 1 − P(A) = 1 − 0," + p2 + " = " + fr((10 - p2)/10) + "."
        };
      }
      var q3 = R.int(2,8);
      var bon = "P_A(B), la probabilité de B sachant A";
      return {
        q: "Sur un arbre, le nombre 0," + q3 + " est écrit sur la branche qui va de A vers B (deuxième niveau).\nQue représente ce nombre ?",
        a: bon,
        accept: null,
        choix: [bon, "P(B)", "P(A ∩ B)", "P(A)"],
        expl: "Une branche du deuxième niveau porte toujours une probabilité conditionnelle : ici P_A(B). Pour obtenir P(A ∩ B), il faudrait multiplier par P(A)."
      };
    }
    if (level === 2){
      var t2 = R.pick(['totale', 'totale', 'formule']);
      if (t2 === 'formule'){
        var bonF = "P(A) × P_A(B) + P(Ā) × P_Ā(B)";
        return {
          q: "Dans un arbre à deux niveaux, quelle formule donne P(B) (formule des probabilités totales) ?",
          a: bonF,
          accept: null,
          choix: [bonF, "P(A) + P(B)", "P(A) × P(B)", "P_A(B) + P_Ā(B)"],
          expl: "On multiplie le long des deux chemins qui mènent à B, puis on additionne : P(B) = P(A)×P_A(B) + P(Ā)×P_Ā(B)."
        };
      }
      var pi2 = R.int(2,8);
      var q1 = R.int(1,9);
      var q2b = R.int(1,9);
      if (q2b === q1){ q2b = (q1 % 9) + 1; }
      var num = pi2*q1 + (10 - pi2)*q2b;
      var ctx = R.pick([
        "P(A) = 0," + pi2 + ", P_A(B) = 0," + q1 + " et P_Ā(B) = 0," + q2b + ".\nCalcule P(B) avec la formule des probabilités totales.",
        "Dans un club, la probabilité qu'un membre soit inscrit au tennis est 0," + pi2 + ". S'il est inscrit, il participe au tournoi avec la probabilité 0," + q1 + " ; sinon, avec la probabilité 0," + q2b + ".\nQuelle est la probabilité qu'un membre participe au tournoi ?"
      ]);
      return {
        q: ctx,
        a: String(num/100),
        accept: null,
        choix: null,
        expl: "P(B) = 0," + pi2 + " × 0," + q1 + " + 0," + (10 - pi2) + " × 0," + q2b + " = " + fr(pi2*q1/100) + " + " + fr((10 - pi2)*q2b/100) + " = " + fr(num/100) + "."
      };
    }
    // level 3
    var t3 = R.pick(['contexte', 'contexte', 'inverse']);
    if (t3 === 'inverse'){
      var qi3 = R.int(2,9), pi3 = R.int(2,8);
      var inter = pi3*qi3/100;
      return {
        q: "On sait que P(A) = 0," + pi3 + " et P(A ∩ B) = " + fr(inter) + ".\nCalcule P_A(B).",
        a: String(qi3/10),
        accept: null,
        choix: null,
        expl: "P_A(B) = P(A ∩ B) ÷ P(A) = " + fr(inter) + " ÷ 0," + pi3 + " = " + fr(qi3/10) + "."
      };
    }
    var pi4 = R.int(2,8);
    var qa = 5*R.int(1,9);
    var qb = 5*R.int(1,9);
    if (qb === qa){ qb = qa + 5; }
    var res = r2((pi4*qa + (10 - pi4)*qb)/10);
    var story = R.pick([
      "Dans une entreprise, " + (pi4*10) + " % des salariés sont des femmes. " + qa + " % des femmes et " + qb + " % des hommes viennent à vélo.\nQuel pourcentage des salariés vient à vélo ? (réponds en %)",
      "Un magasin reçoit " + (pi4*10) + " % de ses articles du fournisseur A et le reste du fournisseur B. " + qa + " % des articles de A et " + qb + " % de ceux de B ont un défaut.\nQuel pourcentage du total a un défaut ? (réponds en %)",
      "Dans un lycée, " + (pi4*10) + " % des élèves sont internes. " + qa + " % des internes et " + qb + " % des externes font du sport le mercredi.\nQuel pourcentage des élèves fait du sport le mercredi ? (réponds en %)"
    ]);
    return {
      q: story,
      a: String(res),
      accept: null,
      choix: null,
      expl: "Probabilités totales : 0," + pi4 + " × " + qa + " % + 0," + (10 - pi4) + " × " + qb + " % = " + fr(r2(pi4*qa/10)) + " % + " + fr(r2((10 - pi4)*qb/10)) + " % = " + fr(res) + " %."
    };
  }
});

// ------------------------------------------------------------
// p5-04 — Statistiques à deux variables
// ------------------------------------------------------------
SKILLS.push({
  id: 'p5-04-stats-deux-variables',
  phase: 5,
  ordre: 4,
  titre: 'Statistiques à deux variables',
  objectif: "Calculer un point moyen, utiliser une droite d'ajustement donnée et distinguer interpolation et extrapolation.",
  lecon: `<p class="lede">Quand on relève deux mesures à la fois (température et ventes, mois et chiffre d'affaires…), on obtient un nuage de points. Deux outils le résument : le <mark>point moyen</mark> et la <mark>droite d'ajustement</mark>.</p>
<div class="etapes">
<p><strong>1. Le point moyen G</strong> a pour coordonnées (x̄ ; ȳ) : la moyenne des x et la moyenne des y. Exemple : x = 10 ; 12 ; 14 ; 16 → x̄ = 52 ÷ 4 = 13. y = 20 ; 26 ; 32 ; 38 → ȳ = 116 ÷ 4 = 29. Donc G(13 ; 29).</p>
<p><strong>2. La droite d'ajustement</strong> est donnée dans l'énoncé, sous la forme y = ax + b. Elle « résume » le nuage : pour prévoir y, tu remplaces x par sa valeur. Avec y = 2x + 5, la prévision pour x = 20 est y = 2 × 20 + 5 = 45.</p>
<p><strong>3. Dans l'autre sens :</strong> pour quel x obtient-on y = 65 ? On isole x : x = (65 − 5) ÷ 2 = 30.</p>
</div>
<p>Dernier point, très demandé en QCM : si le x utilisé est <strong>dans la plage des données</strong> observées, c'est une <mark>interpolation</mark>, plutôt fiable. S'il est <strong>en dehors</strong> (souvent : dans le futur), c'est une <mark>extrapolation</mark> : une simple tendance, à prendre avec prudence.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>G(x̄ ; ȳ). Prévision : je remplace x dans y = ax + b. Interpolation = à l'intérieur des données = fiable ; extrapolation = à l'extérieur = prudence.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour retrouver x connaissant y, fais toujours les deux mêmes gestes, dans cet ordre : « moins b », puis « divisé par a ».</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Le point moyen se calcule avec toutes les valeurs, pas seulement la première et la dernière.</p></div>`,
  gen(level, R){
    if (level === 1){
      var t = R.pick(['moyx', 'moyy', 'pointG']);
      if (t === 'pointG'){
        var mx0 = R.int(6,14);
        var my0 = mx0 + R.int(2,6);
        var bonG = "(" + mx0 + " ; " + my0 + ")";
        return {
          q: "Pour une série de 4 points, on a calculé x̄ = " + mx0 + " et ȳ = " + my0 + ".\nQuelles sont les coordonnées du point moyen G ?",
          a: bonG,
          accept: null,
          choix: [bonG, "(" + my0 + " ; " + mx0 + ")", "(" + (4*mx0) + " ; " + (4*my0) + ")", "(" + mx0 + " ; " + mx0 + ")"],
          expl: "Le point moyen est G(x̄ ; ȳ) : l'abscisse est la moyenne des x, l'ordonnée la moyenne des y."
        };
      }
      var offs = R.pick([[-3,-1,1,3], [-2,-1,1,2], [-4,-1,2,3], [-5,-2,3,4]]);
      var mo = t === 'moyx' ? R.int(6,14) : R.int(10,20);
      var vals = R.shuffle(offs).map(function(o){ return mo + o; });
      var nomVar = t === 'moyx' ? "x" : "y";
      var nomMoy = t === 'moyx' ? "x̄" : "ȳ";
      return {
        q: "Voici les valeurs de " + nomVar + " relevées : " + vals.join(" ; ") + ".\nCalcule la moyenne " + nomMoy + ".",
        a: String(mo),
        accept: null,
        choix: null,
        expl: "(" + vals.join(" + ") + ") ÷ 4 = " + (4*mo) + " ÷ 4 = " + mo + "."
      };
    }
    if (level === 2){
      var aA = R.pick([2, 3, 4, 5, 1.5, 2.5]);
      var bB = R.int(2,20);
      var x0 = (aA === 1.5 || aA === 2.5) ? 2*R.int(2,8) : R.int(3,12);
      var y0 = r2(aA*x0 + bB);
      var eq = "y = " + fr(aA) + "x + " + bB;
      var ctx = R.pick([
        "Les ventes de glaces (en dizaines) selon la température x (en °C) sont ajustées par la droite " + eq + ".\nEstime y pour x = " + x0 + " °C.",
        "Le chiffre d'affaires (en milliers d'€) du mois de rang x est ajusté par la droite " + eq + ".\nEstime y pour x = " + x0 + ".",
        "Un nuage de points est ajusté par la droite " + eq + ".\nCalcule la valeur de y prévue pour x = " + x0 + "."
      ]);
      return {
        q: ctx,
        a: String(y0),
        accept: null,
        choix: null,
        expl: "On remplace x : y = " + fr(aA) + " × " + x0 + " + " + bB + " = " + fr(r2(aA*x0)) + " + " + bB + " = " + fr(y0) + "."
      };
    }
    // level 3
    var t3 = R.pick(['inverse', 'extrapolQCM', 'pente-neg']);
    if (t3 === 'extrapolQCM'){
      var xmin = R.int(1,3);
      var xmax = xmin + R.int(8,12);
      var xq = xmax + R.int(10,30);
      var bonE = "une extrapolation : le résultat est à prendre avec prudence";
      return {
        q: "Les données observées vont de x = " + xmin + " à x = " + xmax + ". On utilise la droite d'ajustement pour prévoir y en x = " + xq + ".\nComment appelle-t-on cette démarche ?",
        a: bonE,
        accept: null,
        choix: [bonE, "une interpolation : le résultat est très fiable", "une extrapolation : le résultat est exact", "une interpolation : c'est impossible à calculer"],
        expl: "x = " + xq + " est en dehors de la plage observée [" + xmin + " ; " + xmax + "] : c'est une extrapolation, une tendance à prendre avec prudence."
      };
    }
    if (t3 === 'pente-neg'){
      var aN = R.pick([2, 3, 5]);
      var xN = R.int(4,10);
      var bN = aN*xN + R.int(10,40);
      return {
        q: "La valeur d'un matériel (en centaines d'€) suit l'ajustement y = " + bN + " − " + aN + "x, où x est son âge en années.\nEstime y pour x = " + xN + ".",
        a: String(bN - aN*xN),
        accept: null,
        choix: null,
        expl: "y = " + bN + " − " + aN + " × " + xN + " = " + bN + " − " + (aN*xN) + " = " + (bN - aN*xN) + "."
      };
    }
    var aI = R.pick([2, 4, 5]);
    var xI = R.int(5,20);
    var bI = R.int(1,15);
    var yT = aI*xI + bI;
    return {
      q: "L'ajustement d'un nuage de points est y = " + aI + "x + " + bI + ".\nPour quelle valeur de x la droite prévoit-elle y = " + yT + " ?",
      a: String(xI),
      accept: null,
      choix: null,
      expl: "On isole x : x = (" + yT + " − " + bI + ") ÷ " + aI + " = " + (yT - bI) + " ÷ " + aI + " = " + xI + "."
    };
  }
});

// ------------------------------------------------------------
// p5-05 — Concours : suites logiques
// ------------------------------------------------------------
SKILLS.push({
  id: 'p5-05-suites-logiques',
  phase: 5,
  ordre: 5,
  titre: 'Concours : suites logiques',
  objectif: "Trouver le terme suivant d'une suite logique en déroulant la checklist des motifs classiques du concours.",
  lecon: `<p class="lede">Aux concours SESAME et ACCÈS, on te montre 4 ou 5 nombres et on te demande le suivant. Il n'y a aucune magie : il y a une <mark>checklist</mark>, toujours la même, à dérouler en 20 secondes.</p>
<div class="etapes">
<p><strong>1. Calcule les écarts</strong> entre les termes. S'ils sont constants (+4, +4, +4…), c'est une suite arithmétique : ajoute encore une fois l'écart.</p>
<p><strong>2. Les écarts grandissent régulièrement ?</strong> (+3, +4, +5…) : la suite « accélère » d'un cran à chaque pas.</p>
<p><strong>3. Essaie les quotients :</strong> chaque terme est-il le double, le triple, la moitié du précédent ? (× 2, × 3, ÷ 2…)</p>
<p><strong>4. Ça zigzague ?</strong> Pense à une alternance (+7 puis −2, +7 puis −2…) ou à deux suites <strong>imbriquées</strong> : un terme sur deux appartient à une suite, l'autre terme sur deux à une autre.</p>
<p><strong>5. Pense aux célébrités :</strong> les carrés 1, 4, 9, 16, 25, 36… les cubes 1, 8, 27, 64, 125… et les suites du type « × 2 + 1 » : 1, 3, 7, 15, 31…</p>
</div>
<p>Exemple complet : 2 ; 5 ; 10 ; 17 ; 26 ; ? Les écarts sont 3, 5, 7, 9 : ils augmentent de 2 à chaque fois. Le prochain écart est donc 11, et la réponse est 26 + 11 = <mark>37</mark>.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Écarts d'abord, quotients ensuite, alternance et suites célèbres en dernier. Cette checklist couvre la grande majorité des questions de concours.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Apprends par cœur les carrés jusqu'à 15<sup>2</sup> = 225 et les cubes jusqu'à 5<sup>3</sup> = 125 : tu les reconnaîtras au premier coup d'œil.</p></div>`,
  gen(level, R){
    function enonce(terms){
      return "Trouve le nombre qui remplace le point d'interrogation :\n" + terms.join(" ; ") + " ; ?";
    }
    if (level === 1){
      var t = R.pick(['arith', 'geo', 'arith-dec']);
      if (t === 'arith'){
        var s = R.int(1,9), rr = R.int(2,9);
        return {
          q: enonce([s, s + rr, s + 2*rr, s + 3*rr]),
          a: String(s + 4*rr),
          accept: null,
          choix: null,
          expl: "On ajoute " + rr + " à chaque pas : " + (s + 3*rr) + " + " + rr + " = " + (s + 4*rr) + "."
        };
      }
      if (t === 'geo'){
        var s2 = R.int(2,5), q2 = R.pick([2, 3]);
        return {
          q: enonce([s2, s2*q2, s2*q2*q2, s2*q2*q2*q2]),
          a: String(s2*q2*q2*q2*q2),
          accept: null,
          choix: null,
          expl: "Chaque terme est multiplié par " + q2 + " : " + (s2*q2*q2*q2) + " × " + q2 + " = " + (s2*q2*q2*q2*q2) + "."
        };
      }
      var s3 = R.int(40,90), r3 = R.int(3,9);
      return {
        q: enonce([s3, s3 - r3, s3 - 2*r3, s3 - 3*r3]),
        a: String(s3 - 4*r3),
        accept: null,
        choix: null,
        expl: "On retire " + r3 + " à chaque pas : " + (s3 - 3*r3) + " − " + r3 + " = " + (s3 - 4*r3) + "."
      };
    }
    if (level === 2){
      var t2 = R.pick(['diff', 'carres', 'alterne', 'geo-dec']);
      if (t2 === 'diff'){
        var s4 = R.int(1,10), d = R.int(1,4);
        var arr = [s4], v = s4;
        for (var i = 0; i < 4; i++){ v = v + d + i; arr.push(v); }
        return {
          q: enonce(arr),
          a: String(v + d + 4),
          accept: null,
          choix: null,
          expl: "Les écarts augmentent de 1 à chaque pas : +" + d + ", +" + (d+1) + ", +" + (d+2) + ", +" + (d+3) + "… le suivant est +" + (d+4) + ", donc " + v + " + " + (d+4) + " = " + (v + d + 4) + "."
        };
      }
      if (t2 === 'carres'){
        var k = R.int(1,3);
        var arr2 = [k*k, (k+1)*(k+1), (k+2)*(k+2), (k+3)*(k+3)];
        return {
          q: enonce(arr2),
          a: String((k+4)*(k+4)),
          accept: null,
          choix: null,
          expl: "Ce sont les carrés : " + k + "², " + (k+1) + "², " + (k+2) + "², " + (k+3) + "²… le suivant est " + (k+4) + "² = " + ((k+4)*(k+4)) + "."
        };
      }
      if (t2 === 'alterne'){
        var ap = R.int(4,9), bm = R.int(1, ap - 1), s5 = R.int(5,15);
        var t0 = s5, t1 = s5 + ap, tt2 = t1 - bm, tt3 = tt2 + ap, tt4 = tt3 - bm;
        return {
          q: enonce([t0, t1, tt2, tt3, tt4]),
          a: String(tt4 + ap),
          accept: null,
          choix: null,
          expl: "On alterne +" + ap + " puis −" + bm + ". Après un −" + bm + ", c'est un +" + ap + " : " + tt4 + " + " + ap + " = " + (tt4 + ap) + "."
        };
      }
      var m = R.int(3,9);
      return {
        q: enonce([m*16, m*8, m*4, m*2]),
        a: String(m),
        accept: null,
        choix: null,
        expl: "Chaque terme est divisé par 2 : " + (m*2) + " ÷ 2 = " + m + "."
      };
    }
    // level 3
    var t3 = R.pick(['double1', 'inter', 'cubes', 'carres-plus']);
    if (t3 === 'double1'){
      var plus = R.pick([1, -1]);
      var s6 = plus === 1 ? R.pick([1, 2, 3]) : R.pick([3, 4, 5]);
      var arr3 = [], v3 = s6;
      for (var j = 0; j < 5; j++){ arr3.push(v3); v3 = 2*v3 + plus; }
      return {
        q: enonce(arr3),
        a: String(v3),
        accept: null,
        choix: null,
        expl: "Chaque terme = le double du précédent " + (plus === 1 ? "+ 1" : "− 1") + " : " + arr3[4] + " × 2 " + (plus === 1 ? "+ 1" : "− 1") + " = " + v3 + "."
      };
    }
    if (t3 === 'inter'){
      var sA = R.int(2,6), rA = R.int(1,3);
      var sB = 10*R.int(2,5), rB = 10*R.int(1,3);
      var arr4 = [sA, sB, sA + rA, sB + rB, sA + 2*rA];
      return {
        q: enonce(arr4),
        a: String(sB + 2*rB),
        accept: null,
        choix: null,
        expl: "Deux suites imbriquées : un terme sur deux fait " + sA + ", " + (sA+rA) + ", " + (sA+2*rA) + "… et l'autre fait " + sB + ", " + (sB+rB) + "… Le suivant est " + (sB+rB) + " + " + rB + " = " + (sB + 2*rB) + "."
      };
    }
    if (t3 === 'cubes'){
      var k2 = R.pick([1, 2]);
      var arr5 = [k2*k2*k2, (k2+1)*(k2+1)*(k2+1), (k2+2)*(k2+2)*(k2+2), (k2+3)*(k2+3)*(k2+3)];
      var rep = (k2+4)*(k2+4)*(k2+4);
      return {
        q: enonce(arr5),
        a: String(rep),
        accept: null,
        choix: null,
        expl: "Ce sont les cubes : " + k2 + "³, " + (k2+1) + "³, " + (k2+2) + "³, " + (k2+3) + "³… le suivant est " + (k2+4) + "³ = " + rep + "."
      };
    }
    var k3 = R.int(1,3), c3 = R.int(1,4);
    var arr6 = [k3*k3 + c3, (k3+1)*(k3+1) + c3, (k3+2)*(k3+2) + c3, (k3+3)*(k3+3) + c3];
    return {
      q: enonce(arr6),
      a: String((k3+4)*(k3+4) + c3),
      accept: null,
      choix: null,
      expl: "Ce sont les carrés augmentés de " + c3 + " : " + k3 + "² + " + c3 + ", " + (k3+1) + "² + " + c3 + "… le suivant est " + (k3+4) + "² + " + c3 + " = " + ((k3+4)*(k3+4) + c3) + "."
    };
  }
});

// ------------------------------------------------------------
// p5-06 — Concours : vitesses et débits
// ------------------------------------------------------------
SKILLS.push({
  id: 'p5-06-vitesses',
  phase: 5,
  ordre: 6,
  titre: 'Concours : vitesses et débits',
  objectif: "Manier d = v × t, convertir heures et minutes sans se tromper et déjouer les pièges de vitesse moyenne.",
  lecon: `<p class="lede">Une seule formule à connaître : <mark>d = v × t</mark> (distance = vitesse × temps). Tout le reste, ce sont des conversions… et des pièges que les concours adorent.</p>
<div class="formule"><p>d = v × t &nbsp;&nbsp;|&nbsp;&nbsp; v = d ÷ t &nbsp;&nbsp;|&nbsp;&nbsp; t = d ÷ v</p></div>
<p>Le point qui fait tout rater : les minutes. Une vitesse en km/h exige un temps en <strong>heures</strong>. Conversions à connaître par cœur :</p>
<table class="tbl"><tr><th>Minutes</th><td>15</td><td>30</td><td>45</td><td>90</td></tr><tr><th>Heures</th><td>0,25</td><td>0,5</td><td>0,75</td><td>1,5</td></tr></table>
<p>Exemple complet : combien de temps pour parcourir 90 km à 60 km/h ?</p>
<div class="etapes">
<p><strong>1.</strong> t = d ÷ v = 90 ÷ 60 = 1,5 h.</p>
<p><strong>2.</strong> Conversion : 1,5 h = 1 h 30 min (et surtout pas « 1 h 50 » !).</p>
</div>
<p>Les débits fonctionnent exactement pareil : volume = débit × temps. Un robinet à 30 L/min remplit 120 L en 120 ÷ 30 = 4 min.</p>
<div class="box piege"><p class="box-t">Piège n°1 du concours</p><p>La vitesse moyenne d'un aller-retour n'est <strong>pas</strong> la moyenne des deux vitesses. Aller à 60 km/h et retour à 30 km/h sur 60 km : aller 1 h, retour 2 h → 120 km en 3 h = <mark>40 km/h</mark> (et non 45).</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>1 h 30 = 1,5 h. Vitesse moyenne = distance totale ÷ temps total, toujours.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Travaille en heures décimales du début à la fin du calcul, et ne repasse en minutes qu'à la toute dernière ligne.</p></div>`,
  gen(level, R){
    if (level === 1){
      var t = R.pick(['dist', 'vit', 'conv']);
      if (t === 'dist'){
        var v = 10*R.int(4,12);
        var th = R.pick([2, 3, 1.5]);
        return {
          q: "Une voiture roule à " + v + " km/h pendant " + fr(th) + " h.\nQuelle distance parcourt-elle (en km) ?",
          a: String(v*th),
          accept: null,
          choix: null,
          expl: "d = v × t = " + v + " × " + fr(th) + " = " + (v*th) + " km."
        };
      }
      if (t === 'vit'){
        var v2 = 10*R.int(3,11);
        var t2h = R.pick([2, 3, 4]);
        return {
          q: "Un train parcourt " + (v2*t2h) + " km en " + t2h + " heures.\nQuelle est sa vitesse moyenne (en km/h) ?",
          a: String(v2),
          accept: null,
          choix: null,
          expl: "v = d ÷ t = " + (v2*t2h) + " ÷ " + t2h + " = " + v2 + " km/h."
        };
      }
      var sens = R.pick(['min-h', 'h-min']);
      if (sens === 'min-h'){
        var p = R.pick([[30, '0.5'], [45, '0.75'], [90, '1.5'], [15, '0.25'], [150, '2.5']]);
        return {
          q: "Convertis " + p[0] + " min en heures (écris un nombre décimal).",
          a: p[1],
          accept: null,
          choix: null,
          expl: p[0] + " ÷ 60 = " + fr(p[1]) + " h."
        };
      }
      var p2 = R.pick([[1.5, 90], [0.75, 45], [2.5, 150], [0.25, 15]]);
      return {
        q: "Convertis " + fr(p2[0]) + " h en minutes.",
        a: String(p2[1]),
        accept: null,
        choix: null,
        expl: fr(p2[0]) + " × 60 = " + p2[1] + " min."
      };
    }
    if (level === 2){
      var t2 = R.pick(['dist-min', 'temps', 'debit', 'debit2']);
      if (t2 === 'dist-min'){
        var v3 = 4*R.int(10,30);
        var tm = R.pick([15, 30, 45]);
        var d3 = v3*tm/60;
        return {
          q: "Un scooter roule à " + v3 + " km/h pendant " + tm + " min.\nQuelle distance parcourt-il (en km) ?",
          a: String(d3),
          accept: null,
          choix: null,
          expl: tm + " min = " + fr(tm/60) + " h, donc d = " + v3 + " × " + fr(tm/60) + " = " + d3 + " km."
        };
      }
      if (t2 === 'temps'){
        var v4 = 4*R.int(10,25);
        var tm2 = R.pick([15, 30, 45, 90]);
        var d4 = v4*tm2/60;
        return {
          q: "Un automobiliste parcourt " + d4 + " km à " + v4 + " km/h.\nCombien de temps met-il, en minutes ?",
          a: String(tm2),
          accept: null,
          choix: null,
          expl: "t = " + d4 + " ÷ " + v4 + " = " + fr(tm2/60) + " h, soit " + tm2 + " min."
        };
      }
      var D = R.int(5,30);
      var tf = R.int(4,12);
      var V = D*tf;
      if (t2 === 'debit'){
        return {
          q: "Un robinet remplit une cuve de " + V + " L en " + tf + " min.\nQuel est son débit (en L/min) ?",
          a: String(D),
          accept: null,
          choix: null,
          expl: "Débit = volume ÷ temps = " + V + " ÷ " + tf + " = " + D + " L/min."
        };
      }
      return {
        q: "Un robinet a un débit de " + D + " L/min.\nCombien de minutes lui faut-il pour remplir une cuve de " + V + " L ?",
        a: String(tf),
        accept: null,
        choix: null,
        expl: "Temps = volume ÷ débit = " + V + " ÷ " + D + " = " + tf + " min."
      };
    }
    // level 3
    var t3 = R.pick(['moyharm', 'robinets', 'croisement']);
    if (t3 === 'moyharm'){
      var p3 = R.pick([[30,60,40], [40,60,48], [20,30,24], [60,120,80], [40,120,60], [20,60,30]]);
      var bon = String(p3[2]);
      return {
        q: "Ali fait l'aller à " + p3[0] + " km/h et le retour (même trajet) à " + p3[1] + " km/h.\nQuelle est sa vitesse moyenne sur l'aller-retour (en km/h) ?",
        a: bon,
        accept: null,
        choix: [bon, String((p3[0]+p3[1])/2), String(p3[0]), String(p3[1])],
        expl: "Piège : ce n'est pas la moyenne des vitesses ! Vitesse moyenne = distance totale ÷ temps total = 2 × " + p3[0] + " × " + p3[1] + " ÷ (" + p3[0] + " + " + p3[1] + ") = " + p3[2] + " km/h."
      };
    }
    if (t3 === 'robinets'){
      var p4 = R.pick([[3,6,2], [4,4,2], [6,12,4], [4,12,3], [2,2,1], [6,3,2]]);
      return {
        q: "Un premier robinet remplit un bassin en " + p4[0] + " h, un second en " + p4[1] + " h.\nEn combien d'heures le remplissent-ils s'ils coulent ensemble ?",
        a: String(p4[2]),
        accept: null,
        choix: null,
        expl: "En 1 h, ils remplissent 1/" + p4[0] + " + 1/" + p4[1] + " du bassin ; en inversant cette fraction, on trouve " + p4[2] + " h."
      };
    }
    var v5 = 10*R.int(4,7);
    var v6 = 10*R.int(5,9);
    var tc = R.int(1,3);
    var dc = (v5 + v6)*tc;
    return {
      q: "Deux villes sont distantes de " + dc + " km. Deux voitures partent en même temps l'une vers l'autre, à " + v5 + " km/h et " + v6 + " km/h.\nAu bout de combien d'heures se croisent-elles ?",
      a: String(tc),
      accept: null,
      choix: null,
      expl: "Elles se rapprochent de " + v5 + " + " + v6 + " = " + (v5 + v6) + " km/h. Temps = " + dc + " ÷ " + (v5 + v6) + " = " + tc + " h."
    };
  }
});

// ------------------------------------------------------------
// p5-07 — Concours : calcul astucieux
// ------------------------------------------------------------
SKILLS.push({
  id: 'p5-07-calcul-rapide',
  phase: 5,
  ordre: 7,
  titre: 'Concours : calcul astucieux',
  objectif: "Calculer de tête, vite et juste : multiplications malignes, compléments, pourcentages et comparaisons.",
  lecon: `<p class="lede">Aux concours, la calculatrice est interdite et le chrono tourne. Le bon candidat ne calcule pas plus vite que les autres : il calcule <mark>plus malin</mark>.</p>
<p>Les transformations magiques à connaître :</p>
<table class="tbl">
<tr><th>× 5</th><td>× 10 puis ÷ 2</td><td>46 × 5 = 460 ÷ 2 = 230</td></tr>
<tr><th>× 25</th><td>× 100 puis ÷ 4</td><td>36 × 25 = 3600 ÷ 4 = 900</td></tr>
<tr><th>× 11</th><td>écarte les chiffres, somme au milieu</td><td>34 × 11 = 3 [3+4] 4 = 374</td></tr>
<tr><th>× 99</th><td>× 100 puis − le nombre</td><td>23 × 99 = 2300 − 23 = 2277</td></tr>
<tr><th>× 101</th><td>× 100 puis + le nombre</td><td>47 × 101 = 4700 + 47 = 4747</td></tr>
</table>
<p>Les pourcentages se traduisent en fractions : 25 % = 1/4, 75 % = 3/4, 20 % = 1/5, 50 % = la moitié. Et 10 % s'obtient en décalant la virgule : 10 % de 340 = 34.</p>
<div class="etapes">
<p><strong>Exemple chronométré — 15 % de 80 :</strong></p>
<p>10 % de 80 = 8.</p>
<p>5 % = la moitié de 10 %, soit 4.</p>
<p>15 % = 8 + 4 = <mark>12</mark>. Trois secondes, zéro calcul posé.</p>
</div>
<p>Pour comparer des fractions et des pourcentages, convertis tout en nombres décimaux : 3/4 = 0,75 est plus grand que 72 % = 0,72.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>× 5, × 25, × 11, × 99, × 101 : jamais posés, toujours transformés. Un pourcentage est une fraction déguisée.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Complément à 100 en un regard : les chiffres somment à 9, sauf le dernier qui somme à 10. Exemple : 100 − 63 = 37 (6 + 3 = 9 pour les dizaines, 3 + 7 = 10 pour les unités).</p></div>`,
  gen(level, R){
    if (level === 1){
      var t = R.pick(['comp100', 'comp1000', 'x11', 'pct10', 'x5']);
      if (t === 'comp100'){
        var n = R.int(11,89);
        return {
          q: "Complément : combien manque-t-il à " + n + " pour faire 100 ?",
          a: String(100 - n),
          accept: null,
          choix: null,
          expl: "100 − " + n + " = " + (100 - n) + " (les dizaines somment à 9, les unités à 10)."
        };
      }
      if (t === 'comp1000'){
        var n2 = R.int(105,895);
        return {
          q: "Complément : combien manque-t-il à " + n2 + " pour faire 1000 ?",
          a: String(1000 - n2),
          accept: null,
          choix: null,
          expl: "1000 − " + n2 + " = " + (1000 - n2) + " : chaque chiffre complète à 9, le dernier à 10."
        };
      }
      if (t === 'x11'){
        var d1 = R.int(1,7);
        var u = R.int(0, 9 - d1);
        var n3 = 10*d1 + u;
        return {
          q: "Calcule de tête : " + n3 + " × 11",
          a: String(n3*11),
          accept: null,
          choix: null,
          expl: "On écarte " + d1 + " et " + u + " et on place leur somme " + (d1 + u) + " au milieu : " + (n3*11) + "."
        };
      }
      if (t === 'pct10'){
        var n4 = 10*R.int(3,60);
        return {
          q: "Calcule de tête : 10 % de " + n4,
          a: String(n4/10),
          accept: null,
          choix: null,
          expl: "10 %, c'est diviser par 10 (décaler la virgule) : " + (n4/10) + "."
        };
      }
      var n5 = R.int(12,48);
      return {
        q: "Calcule de tête : " + n5 + " × 5",
        a: String(n5*5),
        accept: null,
        choix: null,
        expl: "× 5 = × 10 puis ÷ 2 : " + (n5*10) + " ÷ 2 = " + (n5*5) + "."
      };
    }
    if (level === 2){
      var t2 = R.pick(['x25', 'x99', 'pct', 'compQCM']);
      if (t2 === 'x25'){
        var n6 = 4*R.int(3,12);
        return {
          q: "Calcule de tête : " + n6 + " × 25",
          a: String(n6*25),
          accept: null,
          choix: null,
          expl: "× 25 = × 100 puis ÷ 4 : " + (n6*100) + " ÷ 4 = " + (n6*25) + "."
        };
      }
      if (t2 === 'x99'){
        var n7 = R.int(12,45);
        return {
          q: "Calcule de tête : " + n7 + " × 99",
          a: String(n7*99),
          accept: null,
          choix: null,
          expl: "× 99 = × 100 − le nombre : " + (n7*100) + " − " + n7 + " = " + (n7*99) + "."
        };
      }
      if (t2 === 'pct'){
        var pc = R.pick([25, 75, 15, 20]);
        var base, rep, ast;
        if (pc === 25){ base = 4*R.int(6,30); rep = base/4; ast = "25 % = un quart : " + base + " ÷ 4 = " + rep + "."; }
        else if (pc === 75){ base = 4*R.int(6,30); rep = 3*base/4; ast = "75 % = trois quarts : " + (base/4) + " × 3 = " + rep + "."; }
        else if (pc === 15){ base = 20*R.int(2,12); rep = 3*base/20; ast = "15 % = 10 % + 5 % : " + (base/10) + " + " + (base/20) + " = " + rep + "."; }
        else { base = 5*R.int(6,40); rep = base/5; ast = "20 % = un cinquième : " + base + " ÷ 5 = " + rep + "."; }
        return {
          q: "Calcule de tête : " + pc + " % de " + base,
          a: String(rep),
          accept: null,
          choix: null,
          expl: ast
        };
      }
      var sets2 = [
        { opts: ['3/4', '70 %', '0,72', '0,68'], a: '3/4', e: "3/4 = 0,75 ; 70 % = 0,7 ; face à 0,72 et 0,68, le plus grand est 0,75." },
        { opts: ['45 %', '2/5', '0,42', '1/4'], a: '45 %', e: "2/5 = 0,4 ; 1/4 = 0,25 ; 45 % = 0,45 : c'est le plus grand." },
        { opts: ['0,8', '3/5', '65 %', '0,72'], a: '0,8', e: "3/5 = 0,6 ; 65 % = 0,65 ; 0,8 reste le plus grand." },
        { opts: ['1/2', '35 %', '0,45', '0,38'], a: '1/2', e: "1/2 = 0,5 ; 35 % = 0,35 : 0,5 est le plus grand." }
      ];
      var st = R.pick(sets2);
      return {
        q: "Laquelle de ces valeurs est la plus grande ?",
        a: st.a,
        accept: null,
        choix: st.opts.slice(),
        expl: st.e
      };
    }
    // level 3
    var t3 = R.pick(['x101', 'x11c', 'frac', 'compQCM3', 'estim']);
    if (t3 === 'x101'){
      var n8 = R.int(23,89);
      return {
        q: "Calcule de tête : " + n8 + " × 101",
        a: String(n8*101),
        accept: null,
        choix: null,
        expl: "× 101 = × 100 + le nombre : " + (n8*100) + " + " + n8 + " = " + (n8*101) + "."
      };
    }
    if (t3 === 'x11c'){
      var d2 = R.int(3,9);
      var u2 = R.int(10 - d2, 9);
      var n9 = 10*d2 + u2;
      return {
        q: "Calcule de tête : " + n9 + " × 11",
        a: String(n9*11),
        accept: null,
        choix: null,
        expl: "On écarte " + d2 + " et " + u2 + " et on place " + (d2 + u2) + " au milieu ; comme il dépasse 9, on ajoute la retenue au chiffre de gauche : " + (n9*11) + "."
      };
    }
    if (t3 === 'frac'){
      if (R.pick([true, false])){
        var N = 4*R.int(5,20);
        return {
          q: "Calcule de tête : les 2/3 des 3/4 de " + N,
          a: String(N/2),
          accept: null,
          choix: null,
          expl: "3/4 de " + N + " = " + (3*N/4) + ", puis 2/3 de " + (3*N/4) + " = " + (N/2) + ". Astuce : 2/3 × 3/4 = 1/2, c'est simplement la moitié de " + N + " !"
        };
      }
      var N2 = 6*R.int(4,15);
      return {
        q: "Calcule de tête : la moitié du tiers de " + N2,
        a: String(N2/6),
        accept: null,
        choix: null,
        expl: "Le tiers de " + N2 + " = " + (N2/3) + " ; la moitié de " + (N2/3) + " = " + (N2/6) + "."
      };
    }
    if (t3 === 'compQCM3'){
      var sets3 = [
        { opts: ['5/8', '0,6', '62 %', '0,615'], a: '5/8', e: "5/8 = 0,625 ; 62 % = 0,62 ; face à 0,6 et 0,615, le plus grand est 5/8." },
        { opts: ['0,67', '2/3', '66 %', '0,665'], a: '0,67', e: "2/3 ≈ 0,667 ; 66 % = 0,66 ; 0,665 : le plus grand est bien 0,67." },
        { opts: ['7/9', '0,75', '76 %', '0,7'], a: '7/9', e: "7/9 ≈ 0,778, davantage que 76 % = 0,76 et que 0,75." },
        { opts: ['0,55', '5/9', '54 %', '1/2'], a: '5/9', e: "5/9 ≈ 0,556, davantage que 0,55, 54 % = 0,54 et 1/2 = 0,5." }
      ];
      var st3 = R.pick(sets3);
      return {
        q: "Laquelle de ces valeurs est la plus grande ?",
        a: st3.a,
        accept: null,
        choix: st3.opts.slice(),
        expl: st3.e
      };
    }
    var items = [
      { op: "49 × 21", a: '1000', d: ['800', '1200', '1500'], e: "49 × 21 ≈ 50 × 20 = 1000 (valeur exacte : 1029)." },
      { op: "302 × 19", a: '6000', d: ['5000', '7000', '4000'], e: "302 × 19 ≈ 300 × 20 = 6000 (valeur exacte : 5738)." },
      { op: "61 × 39", a: '2400', d: ['1800', '2000', '3000'], e: "61 × 39 ≈ 60 × 40 = 2400 (valeur exacte : 2379)." },
      { op: "9,8 × 5,1", a: '50', d: ['45', '55', '60'], e: "9,8 × 5,1 ≈ 10 × 5 = 50 (valeur exacte : 49,98)." },
      { op: "498 + 297", a: '800', d: ['700', '750', '900'], e: "498 + 297 ≈ 500 + 300 = 800 (valeur exacte : 795)." }
    ];
    var it = R.pick(items);
    return {
      q: "Sans poser le calcul, choisis la meilleure estimation de :\n" + it.op,
      a: it.a,
      accept: null,
      choix: [it.a].concat(it.d),
      expl: it.e
    };
  }
});

// ------------------------------------------------------------
// p5-08 — Concours : mini-problèmes
// ------------------------------------------------------------
SKILLS.push({
  id: 'p5-08-problemes-qcm',
  phase: 5,
  ordre: 8,
  titre: 'Concours : mini-problèmes',
  objectif: "Résoudre les mini-problèmes typiques des concours : âges, partages, mélanges et pourcentages en cascade.",
  lecon: `<p class="lede">Un mini-problème de concours se résout avec 4 réflexes, toujours les mêmes : <mark>nommer</mark> l'inconnue, <mark>traduire</mark> la phrase en calcul, <mark>résoudre</mark>, <mark>vérifier</mark>.</p>
<p>Exemple complet (le grand classique des âges) : un père a le triple de l'âge de son fils, qui a 10 ans. Dans combien d'années aura-t-il le double ?</p>
<div class="etapes">
<p><strong>1. Nommer :</strong> t = le nombre d'années cherché. Le père a 30 ans aujourd'hui.</p>
<p><strong>2. Traduire :</strong> dans t années, père = 30 + t et fils = 10 + t ; on veut 30 + t = 2 × (10 + t).</p>
<p><strong>3. Résoudre :</strong> 30 + t = 20 + 2t, donc t = 10.</p>
<p><strong>4. Vérifier :</strong> dans 10 ans, le père aura 40 ans et le fils 20. C'est bien le double.</p>
</div>
<p>Les autres grands classiques :</p>
<p><strong>Partages :</strong> « le 2e a le double du 1er, le 3e le triple » → parts x, 2x et 3x, donc 6x = le total.</p>
<p><strong>Mélanges :</strong> la concentration finale est une moyenne <strong>pondérée</strong> par les volumes : 2 L à 10 % + 1 L à 16 % → (2 × 10 + 1 × 16) ÷ 3 = 12 %.</p>
<p><strong>Pourcentages en cascade :</strong> +10 % puis −10 % ne ramène pas au départ : × 1,1 × 0,9 = × 0,99, il manque 1 %.</p>
<div class="box piege"><p class="box-t">Piège</p><p>Les pourcentages ne s'additionnent jamais : +20 % puis +10 %, c'est × 1,2 × 1,1 = × 1,32, soit +32 % (et non +30 %).</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Nommer, traduire, résoudre, vérifier. Une phrase de l'énoncé = une équation.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>En QCM, tu peux aussi tester les réponses proposées dans l'énoncé (commence par une valeur du milieu) : c'est souvent plus rapide que de poser l'équation.</p></div>`,
  gen(level, R){
    if (level === 1){
      var t = R.pick(['partage', 'ages', 'solde']);
      if (t === 'partage'){
        var x = R.int(5,20);
        var S = 6*x;
        return {
          q: "Trois amis se partagent " + S + " € : le deuxième reçoit le double du premier et le troisième le triple du premier.\nCombien reçoit le premier (en €) ?",
          a: String(x),
          accept: null,
          choix: [String(x), String(2*x), String(3*x), String(6*x)],
          expl: "Parts : x + 2x + 3x = 6x = " + S + ", donc x = " + S + " ÷ 6 = " + x + " €."
        };
      }
      if (t === 'ages'){
        var f = R.int(6,15);
        var nn = R.int(3,10);
        var rep = 3*f + nn;
        return {
          q: "Léa a " + f + " ans et son père a trois fois son âge.\nQuel âge aura son père dans " + nn + " ans ?",
          a: String(rep),
          accept: null,
          choix: [String(rep), String(3*(f + nn)), String(3*f), String(f + nn)],
          expl: "Le père a " + (3*f) + " ans aujourd'hui ; dans " + nn + " ans : " + rep + " ans. (Piège : on ne triple pas l'âge futur de Léa.)"
        };
      }
      var P = 10*R.int(4,15);
      if (P === 100){ P = 110; }
      var ts = R.pick([10, 20, 30]);
      var fin = P*(100 - ts)/100;
      return {
        q: "Un article coûte " + P + " € ; il est soldé à −" + ts + " %.\nQuel est le prix soldé (en €) ?",
        a: String(fin),
        accept: null,
        choix: [String(fin), String(P - ts), String(P*ts/100), String(P)],
        expl: "La remise vaut " + ts + " % de " + P + " € = " + (P*ts/100) + " €, donc le prix soldé est " + P + " − " + (P*ts/100) + " = " + fin + " €."
      };
    }
    if (level === 2){
      var t2 = R.pick(['cascade', 'melange', 'ages2', 'partage2']);
      if (t2 === 'cascade'){
        var P2 = 100*R.int(1,4);
        var tc = R.pick([10, 20]);
        var fin2 = P2/100*(100 + tc)*(100 - tc)/100;
        return {
          q: "Un prix de " + P2 + " € augmente de " + tc + " %, puis baisse de " + tc + " %.\nQuel est le prix final (en €) ?",
          a: String(fin2),
          accept: null,
          choix: [String(fin2), String(P2), String(P2*(100 - tc)/100), String(P2*(100 + tc)/100)],
          expl: "× " + fr(1 + tc/100) + " puis × " + fr(1 - tc/100) + " : on obtient " + fin2 + " €. On ne retombe pas sur " + P2 + " €, car la baisse s'applique à un prix plus élevé."
        };
      }
      if (t2 === 'melange'){
        var p1 = 2*R.int(3,10);
        var p2m = p1 + 2*R.int(2,8);
        var vlt = R.int(2,6);
        var moy = (p1 + p2m)/2;
        return {
          q: "On mélange " + vlt + " L de jus à " + p1 + " % de sucre avec " + vlt + " L de jus à " + p2m + " % de sucre.\nQuel est le pourcentage de sucre du mélange ?",
          a: String(moy),
          accept: null,
          choix: [String(moy), String(p1 + p2m), String(p1), String(p2m)],
          expl: "Volumes égaux → moyenne simple : (" + p1 + " + " + p2m + ") ÷ 2 = " + moy + " %. (On n'additionne jamais des pourcentages de sucre !)"
        };
      }
      if (t2 === 'ages2'){
        var s2 = R.pick([6, 7, 8, 9, 10, 11, 12]);
        return {
          q: "Aujourd'hui, un père a le triple de l'âge de son fils, qui a " + s2 + " ans.\nDans combien d'années le père aura-t-il exactement le double de l'âge de son fils ?",
          a: String(s2),
          accept: null,
          choix: [String(s2), String(2*s2), String(3*s2), String(s2 + 5)],
          expl: "Père : " + (3*s2) + " ans. On cherche t tel que " + (3*s2) + " + t = 2 × (" + s2 + " + t), d'où t = " + s2 + ". Vérifie : père " + (4*s2) + " ans, fils " + (2*s2) + " ans."
        };
      }
      var lo = R.int(20,60);
      var dd = 2*R.int(3,9);
      var S2 = 2*lo + dd;
      return {
        q: "Paul et Léo se partagent " + S2 + " €. Paul reçoit " + dd + " € de plus que Léo.\nCombien reçoit Léo (en €) ?",
        a: String(lo),
        accept: null,
        choix: [String(lo), String(lo + dd), String(S2/2), String(2*lo)],
        expl: "Léo = (total − écart) ÷ 2 = (" + S2 + " − " + dd + ") ÷ 2 = " + lo + " € ; Paul reçoit " + (lo + dd) + " €."
      };
    }
    // level 3
    var t3 = R.pick(['cascade2', 'melange2', 'ages3', 'retour']);
    if (t3 === 'cascade2'){
      var P3 = 100*R.int(1,4);
      var pr = R.pick([[10,20], [20,10], [10,30], [30,10], [20,20]]);
      var fA = pr[0], fB = pr[1];
      var fin3 = P3/100*(100 + fA)*(100 + fB)/100;
      var add = P3/100*(100 + fA + fB);
      var ch;
      if (fA === fB){
        ch = [String(fin3), String(add), String(P3*(100 + fA)/100), String(P3)];
      } else {
        ch = [String(fin3), String(add), String(P3*(100 + fA)/100), String(P3*(100 + fB)/100)];
      }
      return {
        q: "Un loyer de " + P3 + " € augmente de " + fA + " %, puis de " + fB + " %.\nQuel est le loyer final (en €) ?",
        a: String(fin3),
        accept: null,
        choix: ch,
        expl: "× " + fr(1 + fA/100) + " puis × " + fr(1 + fB/100) + " = × " + fr((100 + fA)*(100 + fB)/10000) + ", soit " + fin3 + " €. On n'additionne pas les pourcentages !"
      };
    }
    if (t3 === 'melange2'){
      var q1m = R.int(10,30);
      var kk2 = 2*R.int(1,3);
      var sg = R.pick([1, -1]);
      var q2m = q1m + sg*3*kk2;
      if (q2m < 2){ sg = 1; q2m = q1m + 3*kk2; }
      var correct = q1m + sg*kk2;
      var simple = q1m + sg*3*kk2/2;
      var vv = R.int(1,4);
      return {
        q: "On mélange " + (2*vv) + " L de sirop à " + q1m + " % de sucre avec " + vv + " L de sirop à " + q2m + " % de sucre.\nQuel est le pourcentage de sucre du mélange ?",
        a: String(correct),
        accept: null,
        choix: [String(correct), String(simple), String(q1m), String(q2m)],
        expl: "Moyenne pondérée par les volumes : (2 × " + q1m + " + 1 × " + q2m + ") ÷ 3 = " + correct + " %. La moyenne simple (" + simple + " %) est le piège : il y a deux fois plus du premier sirop."
      };
    }
    if (t3 === 'ages3'){
      var cad = R.int(8,20);
      var dd3 = 2*R.int(1,3);
      var S3 = 2*cad + dd3;
      return {
        q: "La somme des âges de deux frères est " + S3 + " ans, et l'aîné a " + dd3 + " ans de plus que le cadet.\nQuel est l'âge de l'aîné ?",
        a: String(cad + dd3),
        accept: null,
        choix: [String(cad + dd3), String(cad), String(S3/2), String(2*cad)],
        expl: "Aîné = (somme + écart) ÷ 2 = (" + S3 + " + " + dd3 + ") ÷ 2 = " + (cad + dd3) + " ans ; le cadet a " + cad + " ans."
      };
    }
    var itR = R.pick([
      { t: 20, a: '25', d: ['20', '30', '15'] },
      { t: 50, a: '100', d: ['50', '150', '75'] }
    ]);
    return {
      q: "Un prix baisse de " + itR.t + " %.\nDe quel pourcentage doit-il ensuite augmenter pour revenir à sa valeur de départ ? (réponds en %)",
      a: itR.a,
      accept: null,
      choix: [itR.a].concat(itR.d),
      expl: "Sur 100 € : il reste " + (100 - itR.t) + " € après la baisse. Pour regagner " + itR.t + " € en partant de " + (100 - itR.t) + " €, il faut " + itR.t + "/" + (100 - itR.t) + " = " + itR.a + " %. La hausse se calcule sur le prix réduit, pas sur le prix initial."
    };
  }
});

})();
