/* Phase 4 — Première STMG (fin) : compétences 4 à 9 */
(function(){

  // ---------- Helpers internes ----------
  var fr = function(x){ return String(x).replace('.', ',').replace('-', '−'); };
  var r2 = function(x){ return Math.round(x * 100) / 100; };
  var pm = function(n){ return (n < 0 ? '− ' : '+ ') + Math.abs(n); };
  // Nombre relatif affiché avec le vrai signe moins ; entre parenthèses s'il est négatif.
  var sg = function(n){ return String(n).replace('-', '−'); };
  var pn = function(n){ return n < 0 ? '(' + sg(n) + ')' : String(n); };
  // Exposant en caractères Unicode (les énoncés sont du texte, pas du HTML).
  var SUPS = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
  var sup = function(n){ return String(n).split('').map(function(c){ return SUPS[c] || c; }).join(''); };

  // =====================================================================
  // p4-04 — Signe de f' et variations
  // =====================================================================
  SKILLS.push({
    id: 'p4-04-variations',
    phase: 4,
    ordre: 4,
    titre: "Signe de f' et variations",
    objectif: "Lire le signe de la dérivée pour en déduire les variations de f et repérer ses extremums.",
    lecon: `<p class="lede">La dérivée f′ est le détecteur de pente de la courbe de f : son <mark>signe</mark> te dit si la courbe monte ou descend. C'est l'outil numéro 1 pour étudier une fonction, au bac comme aux concours.</p>
<p>La règle tient en trois lignes. Sur un intervalle : si <mark>f′(x) &gt; 0, alors f est croissante</mark> ; si <mark>f′(x) &lt; 0, alors f est décroissante</mark> ; et si f′ s'annule <b>en changeant de signe</b>, f possède un extremum (un minimum ou un maximum) à cet endroit.</p>
<div class="etapes">
<p><b>Exemple complet.</b> Étudions f(x) = x² − 6x + 1.</p>
<p><b>Étape 1.</b> Je dérive : f′(x) = 2x − 6.</p>
<p><b>Étape 2.</b> Je cherche où f′ s'annule : 2x − 6 = 0 donne x = 3.</p>
<p><b>Étape 3.</b> Je détermine le signe : si x &lt; 3, alors 2x − 6 &lt; 0 (f′ négative) ; si x &gt; 3, alors 2x − 6 &gt; 0 (f′ positive).</p>
<p><b>Étape 4.</b> Je conclus : f est décroissante avant 3, croissante après. Elle passe donc par un <b>minimum</b> en x = 3, qui vaut f(3) = 9 − 18 + 1 = −8.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Signe de f′ → variations de f. <mark>f′ positive : f monte. f′ négative : f descend.</mark> Un extremum apparaît quand f′ s'annule en changeant de signe : − puis + donne un minimum, + puis − donne un maximum.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pense à un vélo : f′ est la pente de la route. Pente positive, tu montes ; pente négative, tu descends ; pente nulle avec changement de signe, tu es au sommet ou au creux.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Ne confonds pas le signe de f′(x) et le signe de f(x). Une fonction peut très bien être négative ET croissante : c'est f′ qui commande les variations, jamais f elle-même.</p></div>`,
    gen(level, R){
      if(level === 1){
        var v = R.int(1, 3);
        if(v === 1){
          var a1 = R.int(-4, 2), b1 = a1 + R.int(2, 6);
          var pos = R.pick([true, false]);
          return {
            q: "Sur l'intervalle [" + sg(a1) + " ; " + sg(b1) + "], on sait que f'(x) " + (pos ? "> 0" : "< 0") + " pour tout x. Que peut-on dire de f sur cet intervalle ?",
            a: pos ? "f est croissante" : "f est décroissante",
            accept: null,
            choix: ["f est croissante", "f est décroissante", "f est constante", "On ne peut pas conclure"],
            expl: "Le signe de f' donne le sens de variation de f : f' " + (pos ? "positive" : "négative") + " signifie que f est " + (pos ? "croissante" : "décroissante") + " sur l'intervalle."
          };
        }
        if(v === 2){
          var croiss = R.pick([true, false]);
          var a2 = R.int(-3, 1), b2 = a2 + R.int(2, 5);
          return {
            q: "On sait que f est " + (croiss ? "croissante" : "décroissante") + " sur [" + sg(a2) + " ; " + sg(b2) + "]. Quel est le signe de f'(x) sur cet intervalle ?",
            a: croiss ? "f'(x) ≥ 0" : "f'(x) ≤ 0",
            accept: null,
            choix: ["f'(x) ≥ 0", "f'(x) ≤ 0", "f'(x) = 0 partout", "On ne peut pas conclure"],
            expl: "C'est la règle dans l'autre sens : f " + (croiss ? "croissante" : "décroissante") + " correspond à une dérivée " + (croiss ? "positive ou nulle" : "négative ou nulle") + "."
          };
        }
        var c = sg(R.int(-3, 4));
        var minCase = R.pick([true, false]);
        return {
          q: "La dérivée f' s'annule en x = " + c + " en passant du signe " + (minCase ? "− au signe +" : "+ au signe −") + ". Que se passe-t-il pour f en x = " + c + " ?",
          a: minCase ? ("f admet un minimum en x = " + c) : ("f admet un maximum en x = " + c),
          accept: null,
          choix: ["f admet un minimum en x = " + c, "f admet un maximum en x = " + c, "f est constante autour de x = " + c, "f ne change pas de sens de variation"],
          expl: minCase ? "Signe − puis + : f descend puis remonte, elle passe donc par un minimum (un creux)." : "Signe + puis − : f monte puis redescend, elle passe donc par un maximum (un sommet)."
        };
      }
      if(level === 2){
        var w = R.int(1, 2);
        if(w === 1){
          var b = R.pick([-8, -6, -4, -2, 2, 4, 6, 8]);
          var cc = R.int(-5, 9);
          if(cc === 0) cc = 10;
          var x0 = -b / 2;
          return {
            q: "On considère f(x) = x² " + pm(b) + "x " + pm(cc) + ". Calcule f'(x), puis la valeur de x pour laquelle f'(x) = 0.",
            a: String(x0),
            accept: ["x = " + x0],
            choix: null,
            expl: "f'(x) = 2x " + pm(b) + ". On résout 2x " + pm(b) + " = 0, ce qui donne x = " + sg(x0) + "."
          };
        }
        var m = R.pick([2, 3, 4, 5]);
        var x1 = R.int(-4, 5);
        var p = -m * x1;
        var fp = p === 0 ? (m + "x") : (m + "x " + pm(p));
        return {
          q: "On donne directement f'(x) = " + fp + ". Pour quelle valeur de x a-t-on f'(x) = 0 ? (c'est là que f peut changer de variation)",
          a: String(x1),
          accept: ["x = " + x1],
          choix: null,
          expl: "On résout " + fp + " = 0 : x = " + sg(x1) + ". C'est en cette valeur que f' s'annule."
        };
      }
      var mm = R.int(1, 5);
      var c3 = R.int(-6, 9);
      if(c3 === 0) c3 = 10;
      var t = R.int(1, 3);
      if(t === 1){
        var val = c3 - mm * mm;
        return {
          q: "Soit f(x) = x² − " + (2 * mm) + "x " + pm(c3) + ". Sa dérivée est f'(x) = 2x − " + (2 * mm) + ". Détermine la VALEUR du minimum de f.",
          a: String(val),
          accept: null,
          choix: null,
          expl: "f' s'annule en x = " + mm + " (signe − puis +, donc minimum). Le minimum vaut f(" + mm + ") = " + (mm * mm) + " − " + (2 * mm * mm) + " " + pm(c3) + " = " + sg(val) + "."
        };
      }
      if(t === 2){
        var val2 = mm * mm + c3;
        return {
          q: "Soit f(x) = −x² + " + (2 * mm) + "x " + pm(c3) + ". Sa dérivée est f'(x) = −2x + " + (2 * mm) + ". Détermine la VALEUR du maximum de f.",
          a: String(val2),
          accept: null,
          choix: null,
          expl: "f' s'annule en x = " + mm + " (signe + puis −, donc maximum). Le maximum vaut f(" + mm + ") = −" + (mm * mm) + " + " + (2 * mm * mm) + " " + pm(c3) + " = " + sg(val2) + "."
        };
      }
      return {
        q: "Soit f(x) = x² − " + (2 * mm) + "x " + pm(c3) + ". En quelle valeur de x la fonction f atteint-elle son minimum ?",
        a: String(mm),
        accept: ["x = " + mm],
        choix: null,
        expl: "f'(x) = 2x − " + (2 * mm) + " s'annule pour x = " + mm + " en passant du − au + : le minimum est atteint en x = " + mm + "."
      };
    }
  });

  // =====================================================================
  // p4-05 — Les suites arithmétiques
  // =====================================================================
  SKILLS.push({
    id: 'p4-05-suites-arithmetiques',
    phase: 4,
    ordre: 5,
    titre: "Les suites arithmétiques",
    objectif: "Reconnaître une suite arithmétique, utiliser u(n) = u(0) + n × r (ou u(1) + (n − 1) × r) et donner son sens de variation.",
    lecon: `<p class="lede">Une suite arithmétique, c'est une suite où l'on <mark>ajoute toujours le même nombre</mark> pour passer d'un terme au suivant. Ce nombre s'appelle la <b>raison</b>, notée r.</p>
<p>Une question d'écriture d'abord : ici on note u(n), qui se lit « u de n ». C'est exactement le u<sub>n</sub> (« u indice n ») de ton cahier : u(0) = u<sub>0</sub>, u(7) = u<sub>7</sub>. Sur ta copie, garde l'écriture de ton professeur.</p>
<p>Deux formules à connaître. La relation de proche en proche, appelée <b>relation de récurrence</b> : u(n+1) = u(n) + r. Et surtout la <b>formule directe</b>, qui évite de calculer tous les termes un par un : <mark>u(n) = u(0) + n × r</mark>.</p>
<p>Attention au point de départ. Si la suite commence à u(1), il n'y a que n − 1 sauts pour arriver à u(n) : <mark>u(n) = u(1) + (n − 1) × r</mark>.</p>
<div class="formule"><p>Départ à u(0) : u(n) = u(0) + n × r<br>Départ à u(1) : u(n) = u(1) + (n − 1) × r</p></div>
<div class="etapes">
<p><b>Exemple complet (épargne).</b> Tu as 50 € dans une tirelire et tu ajoutes 20 € chaque mois. Le montant après n mois forme une suite arithmétique.</p>
<p><b>Étape 1.</b> J'identifie : premier terme u(0) = 50 et raison r = 20 (on ajoute toujours 20).</p>
<p><b>Étape 2.</b> De proche en proche : u(1) = 50 + 20 = 70, puis u(2) = 70 + 20 = 90. Ça marche, mais c'est long pour 12 mois !</p>
<p><b>Étape 3.</b> Formule directe : u(12) = u(0) + 12 × r = 50 + 12 × 20 = 50 + 240 = <b>290 €</b>. Un seul calcul.</p>
</div>
<p>Pour <b>reconnaître</b> une suite arithmétique : calcule les différences entre termes consécutifs. Si elles sont toutes égales, c'est gagné. Exemple : 7 ; 12 ; 17 ; 22 → différence toujours 5, arithmétique de raison 5. En revanche 2 ; 4 ; 8 ; 16 (différences 2, 4, 8) n'est pas arithmétique.</p>
<p><b>Sens de variation.</b> Il se lit sur le signe de la raison : si r &gt; 0 la suite est <b>croissante</b>, si r &lt; 0 elle est <b>décroissante</b>, si r = 0 elle est constante.</p>
<p><b>« Exprime u(n) en fonction de n ».</b> On te demande la formule directe, avec les nombres de l'énoncé. Avec u(0) = 50 et r = 20 : u(n) = 50 + 20n. Avec u(1) = 50 et r = 20 : u(n) = 50 + 20(n − 1).</p>
<p><b>Prouver qu'une suite est arithmétique.</b> Calcule u(n+1) − u(n). Si le résultat est un nombre fixe (sans n), c'est gagné, et ce nombre est la raison. Exemple : u(n) = 4n − 7 donne u(n+1) − u(n) = 4(n + 1) − 7 − (4n − 7) = 4.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p><mark>u(n) = u(0) + n × r</mark>, ou <mark>u(n) = u(1) + (n − 1) × r</mark> si la suite démarre à u(1). La raison r peut être négative : la suite décroît alors à chaque étape (par exemple un stock qui perd 30 unités par semaine). Pour additionner des termes, va voir la fiche « Sommes de suites ».</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour trouver r quand on connaît deux termes éloignés : r = (u(n) − u(0)) ÷ n. C'est l'écart total divisé par le nombre de sauts.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Le n de la formule compte les sauts depuis u(0). Si l'énoncé démarre à u(1), la formule devient u(n) = u(1) + (n − 1) × r. Regarde toujours d'où part la suite !</p></div>`,
    gen(level, R){
      var SENS = ["Elle est croissante", "Elle est décroissante", "Elle est constante", "On ne peut pas savoir"];
      if(level === 1){
        var v = R.int(1, 6);
        if(v === 6){
          // suite définie par récurrence : reconnaître la nature et la raison
          var u0r = R.int(2, 12), rr6 = R.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 8]);
          if(Math.abs(rr6) === u0r) u0r += 1;
          var bonN = "Arithmétique de raison " + sg(rr6);
          return {
            q: "La suite u est définie par u(0) = " + u0r + " et, pour tout entier n, u(n+1) = u(n) " + pm(rr6) + ". Quelle est sa nature ?",
            a: bonN,
            accept: null,
            choix: [bonN, "Géométrique de raison " + sg(rr6), "Arithmétique de raison " + u0r, "Ni arithmétique ni géométrique"],
            expl: "Pour passer d'un terme au suivant, on " + (rr6 > 0 ? "ajoute toujours " + rr6 : "retire toujours " + (-rr6)) + " : c'est la définition d'une suite arithmétique, de raison r = " + sg(rr6) + ". Le nombre " + u0r + " est le premier terme, pas la raison."
          };
        }
        if(v === 4){
          // sens de variation, lu sur le signe de la raison
          var rS = R.pick([-7, -5, -4, -3, -2, 2, 3, 4, 6, 9]);
          return {
            q: "Une suite arithmétique a pour raison r = " + sg(rS) + ". Quel est son sens de variation ?",
            a: rS > 0 ? SENS[0] : SENS[1],
            accept: null,
            choix: SENS.slice(),
            expl: "Le sens de variation d'une suite arithmétique se lit sur le signe de sa raison. Ici r = " + sg(rS) + " est " + (rS > 0 ? "positif : on ajoute à chaque étape, la suite est croissante." : "négatif : on retire à chaque étape, la suite est décroissante.")
          };
        }
        if(v === 5){
          // la suite commence à u(1) : n − 1 sauts
          var u1a = R.int(2, 15), r1a = R.int(2, 6), n1a = R.pick([3, 4]);
          return {
            q: "Une suite arithmétique commence à u(1) = " + u1a + " et a pour raison r = " + r1a + ". Calcule u(" + n1a + ").",
            a: String(u1a + (n1a - 1) * r1a),
            accept: null,
            choix: null,
            expl: "La suite démarre à u(1) : de u(1) à u(" + n1a + "), on fait " + (n1a - 1) + " sauts seulement. u(" + n1a + ") = u(1) + " + (n1a - 1) + " × r = " + u1a + " + " + (n1a - 1) + " × " + r1a + " = " + (u1a + (n1a - 1) * r1a) + "."
          };
        }
        if(v === 1){
          var u0 = R.int(2, 20), r = R.int(2, 9), n = R.pick([2, 3]);
          return {
            q: "Une suite arithmétique a pour premier terme u(0) = " + u0 + " et pour raison r = " + r + ". Calcule u(" + n + ").",
            a: String(u0 + n * r),
            accept: null,
            choix: null,
            expl: "u(" + n + ") = u(0) + " + n + " × r = " + u0 + " + " + n + " × " + r + " = " + (u0 + n * r) + "."
          };
        }
        var s = R.int(3, 15);
        var rr = R.pick([2, 3, 4, 5, -2, -3, -5]);
        if(v === 2){
          return {
            q: "Voici les premiers termes d'une suite arithmétique : " + s + " ; " + sg(s + rr) + " ; " + sg(s + 2 * rr) + " ; … Quelle est sa raison ?",
            a: String(rr),
            accept: ["r = " + rr],
            choix: null,
            expl: "La raison est la différence entre un terme et celui qui le précède. " + sg(s + rr) + " − " + s + " = " + sg(rr) + " : la raison est r = " + sg(rr) + "."
          };
        }
        return {
          q: "Suite arithmétique : " + s + " ; " + sg(s + rr) + " ; " + sg(s + 2 * rr) + " ; … Quel est le terme suivant ?",
          a: String(s + 3 * rr),
          accept: null,
          choix: null,
          expl: "La raison est " + sg(rr) + " (différence constante). Terme suivant : " + sg(s + 2 * rr) + " " + (rr < 0 ? "− " + (-rr) : "+ " + rr) + " = " + sg(s + 3 * rr) + "."
        };
      }
      if(level === 2){
        var w = R.int(1, 6);
        if(w === 6){
          // suite définie par récurrence : on reconnaît la nature, puis formule directe
          var u0g = R.int(-5, 15), rg = R.pick([-4, -3, -2, 2, 3, 4, 5, 6]), ng = R.pick([8, 10, 12, 15, 20]);
          var ag = u0g + ng * rg;
          return {
            q: "La suite u est définie par u(0) = " + sg(u0g) + " et, pour tout entier n, u(n+1) = u(n) " + pm(rg) + ". Calcule u(" + ng + ").",
            a: String(ag),
            accept: null,
            choix: null,
            expl: "On " + (rg > 0 ? "ajoute " + rg : "retire " + (-rg)) + " à chaque étape : la suite est arithmétique de raison r = " + sg(rg) + ". Inutile de calculer tous les termes : u(" + ng + ") = u(0) + " + ng + " × r = " + sg(u0g) + " + " + ng + " × " + pn(rg) + " = " + sg(ag) + "."
          };
        }
        if(w === 3){
          // formule directe quand la suite démarre à u(1)
          var u1b = R.int(-5, 12), r1b = R.pick([-4, -3, -2, 2, 3, 4, 5, 7]), n1b = R.pick([10, 12, 20, 25]);
          var a1b = u1b + (n1b - 1) * r1b;
          return {
            q: "u est une suite arithmétique de premier terme u(1) = " + sg(u1b) + " et de raison r = " + sg(r1b) + ". Calcule u(" + n1b + ").",
            a: String(a1b),
            accept: null,
            choix: null,
            expl: "La suite démarre à u(1), donc la formule est u(n) = u(1) + (n − 1) × r. u(" + n1b + ") = " + sg(u1b) + " + " + (n1b - 1) + " × " + pn(r1b) + " = " + sg(a1b) + "."
          };
        }
        if(w === 4){
          // « exprime u(n) en fonction de n »
          var u0e = R.int(2, 12), re = R.pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]);
          if(Math.abs(re) === u0e) u0e += 1;
          var fE = function(c, k){ return "u(n) = " + c + (k < 0 ? " − " + (-k) : " + " + k) + "n"; };
          var bonE = fE(u0e, re);
          return {
            q: "u est une suite arithmétique de premier terme u(0) = " + u0e + " et de raison r = " + sg(re) + ". Exprime u(n) en fonction de n.",
            a: bonE,
            accept: null,
            choix: [bonE, fE(Math.abs(re), re < 0 ? -u0e : u0e), "u(n) = " + u0e + " × " + pn(re) + "ⁿ", "u(n) = " + u0e + (re < 0 ? " − " + (-re) : " + " + re) + "(n − 1)"],
            expl: "Pour une suite arithmétique qui démarre à u(0), la formule directe est u(n) = u(0) + n × r. Ici " + bonE + "."
          };
        }
        if(w === 5){
          // sens de variation, lu sur la formule
          var a5 = R.int(5, 60), b5 = R.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 8]);
          return {
            q: "Pour tout entier n, u(n) = " + a5 + (b5 < 0 ? " − " + (-b5) : " + " + b5) + "n. Quel est le sens de variation de cette suite ?",
            a: b5 > 0 ? SENS[0] : SENS[1],
            accept: null,
            choix: SENS.slice(),
            expl: "On reconnaît u(n) = u(0) + n × r : la suite est arithmétique et le nombre devant n est sa raison. Ici r = " + sg(b5) + (b5 > 0 ? " > 0 : la suite est croissante." : " < 0 : la suite est décroissante.")
          };
        }
        if(w === 1){
          var u02 = R.pick([100, 150, 200, 250, 300]);
          var r2v = R.pick([10, 15, 20, 25, 30, 50]);
          var n2 = R.pick([6, 10, 12, 24]);
          var ctx = R.pick(["Tu places " + u02 + " € dans une tirelire, puis tu ajoutes " + r2v + " € chaque mois.", "Léa ouvre une cagnotte avec " + u02 + " €, puis y verse " + r2v + " € chaque mois."]);
          return {
            q: ctx + " Le montant après n mois est u(n) = " + u02 + " + " + r2v + "n. Quel est le montant (en €) après " + n2 + " mois ?",
            a: String(u02 + n2 * r2v),
            accept: [(u02 + n2 * r2v) + " €"],
            choix: null,
            expl: "u(" + n2 + ") = " + u02 + " + " + r2v + " × " + n2 + " = " + u02 + " + " + (r2v * n2) + " = " + (u02 + n2 * r2v) + " €."
          };
        }
        var u03 = R.int(-5, 12);
        var r3 = R.pick([-6, -4, -3, -2, 2, 3, 4, 5, 7]);
        var n3 = R.pick([10, 20, 30, 50]);
        return {
          q: "u est une suite arithmétique de premier terme u(0) = " + sg(u03) + " et de raison r = " + sg(r3) + ". Calcule u(" + n3 + ").",
          a: String(u03 + n3 * r3),
          accept: null,
          choix: null,
          expl: "Formule directe : u(" + n3 + ") = u(0) + " + n3 + " × r = " + sg(u03) + " + " + n3 + " × " + pn(r3) + " = " + sg(u03 + n3 * r3) + "."
        };
      }
      var v3 = R.int(1, 6);
      if(v3 === 4){
        // raison à partir de u(1) et u(n) : n − 1 sauts
        var r4 = R.pick([2, 3, 4, 5, -2, -3, -4]);
        var n4 = R.pick([11, 16, 21, 26]);
        var u14 = R.int(-5, 10);
        var un4 = u14 + (n4 - 1) * r4;
        return {
          q: "La suite u est arithmétique. On sait que u(1) = " + sg(u14) + " et u(" + n4 + ") = " + sg(un4) + ". Quelle est sa raison r ?",
          a: String(r4),
          accept: ["r = " + r4],
          choix: null,
          expl: "De u(1) à u(" + n4 + "), il y a " + (n4 - 1) + " sauts (et non " + n4 + "). r = (u(" + n4 + ") − u(1)) ÷ " + (n4 - 1) + " = (" + sg(un4) + " − " + pn(u14) + ") ÷ " + (n4 - 1) + " = " + sg(r4) + "."
        };
      }
      if(v3 === 5){
        // « exprime u(n) en fonction de n » quand la suite démarre à u(1)
        var u15 = R.int(3, 12), r5 = R.pick([2, 3, 4, 5, 6]);
        if(u15 === r5) u15 += 7;
        var bon5 = "u(n) = " + u15 + " + " + r5 + "(n − 1)";
        return {
          q: "u est une suite arithmétique de premier terme u(1) = " + u15 + " et de raison r = " + r5 + ". Exprime u(n) en fonction de n.",
          a: bon5,
          accept: null,
          choix: [bon5, "u(n) = " + u15 + " + " + r5 + "n", "u(n) = " + r5 + " + " + u15 + "(n − 1)", "u(n) = " + u15 + " × " + r5 + "ⁿ⁻¹"],
          expl: "La suite démarre à u(1) : pour aller de u(1) à u(n), on fait n − 1 sauts de r. Donc u(n) = u(1) + (n − 1) × r, soit " + bon5 + "."
        };
      }
      if(v3 === 6){
        // prouver la nature : u(n+1) − u(n) ne dépend pas de n
        var a6 = R.pick([2, 3, 4, 5, 7, -2, -3, -5]), b6 = R.int(-9, 12);
        var f6 = (a6 < 0 ? "−" + (-a6) : a6) + "n" + (b6 === 0 ? "" : (b6 < 0 ? " − " + (-b6) : " + " + b6));
        return {
          q: "Pour tout entier n, u(n) = " + f6 + ". Calcule u(n+1) − u(n). (Cette différence constante est la raison.)",
          a: String(a6),
          accept: ["r = " + a6],
          choix: null,
          expl: "On calcule u(n+1) − u(n) : les termes en n et la constante s'éliminent, il reste le nombre placé devant n. u(n+1) − u(n) = " + sg(a6) + " × (n + 1) − " + pn(a6) + " × n = " + sg(a6) + ". La différence ne dépend pas de n : la suite est arithmétique de raison " + sg(a6) + "."
        };
      }
      if(v3 === 1){
        var rE = R.pick([2, 3, 5, 7, -2, -3, -4]);
        var nE = R.pick([10, 20, 25]);
        var u0E = R.int(-5, 10);
        var unE = u0E + nE * rE;
        return {
          q: "La suite u est arithmétique. On sait que u(0) = " + sg(u0E) + " et u(" + nE + ") = " + sg(unE) + ". Quelle est sa raison r ?",
          a: String(rE),
          accept: ["r = " + rE],
          choix: null,
          expl: "r = (u(" + nE + ") − u(0)) ÷ " + nE + " = (" + sg(unE) + " − " + pn(u0E) + ") ÷ " + nE + " = " + sg(rE) + "."
        };
      }
      if(v3 === 2){
        var rF = R.pick([2, 3, 4, 5, -2, -3]);
        var nF = R.pick([10, 15, 20]);
        var u0F = R.int(-8, 15);
        var unF = u0F + nF * rF;
        return {
          q: "u est arithmétique de raison r = " + sg(rF) + ", et u(" + nF + ") = " + sg(unF) + ". Calcule le premier terme u(0).",
          a: String(u0F),
          accept: null,
          choix: null,
          expl: "u(0) = u(" + nF + ") − " + nF + " × r = " + sg(unF) + " − " + nF + " × " + pn(rF) + " = " + sg(u0F) + "."
        };
      }
      var sA = R.int(2, 9), rA = R.int(2, 6);
      var arith = sA + " ; " + (sA + rA) + " ; " + (sA + 2 * rA) + " ; " + (sA + 3 * rA);
      var g = R.int(2, 4);
      var geo = g + " ; " + (2 * g) + " ; " + (4 * g) + " ; " + (8 * g);
      var s2 = R.int(2, 7);
      var irr = s2 + " ; " + (s2 + 2) + " ; " + (s2 + 5) + " ; " + (s2 + 9);
      return {
        q: "Parmi ces quatre suites de nombres, laquelle est arithmétique ?",
        a: arith,
        accept: null,
        choix: [arith, geo, "1 ; 4 ; 9 ; 16", irr],
        expl: "Dans " + arith + ", la différence entre deux termes consécutifs vaut toujours " + rA + " : c'est une suite arithmétique de raison " + rA + ". Les autres n'ont pas une différence constante."
      };
    }
  });

  // =====================================================================
  // p4-06 — Les suites géométriques
  // =====================================================================
  SKILLS.push({
    id: 'p4-06-suites-geometriques',
    phase: 4,
    ordre: 6,
    titre: "Les suites géométriques",
    objectif: "Utiliser u(n) = u(0) × qⁿ (ou u(1) × qⁿ⁻¹), passer d'un taux à la raison et donner le sens de variation.",
    lecon: `<p class="lede">Une suite géométrique, c'est une suite où l'on <mark>multiplie toujours par le même nombre</mark> pour passer au terme suivant. Ce nombre est la <b>raison</b> q. C'est LA suite des placements, des hausses de prix et des évolutions en %.</p>
<p>Relation de proche en proche (la <b>relation de récurrence</b>) : u(n+1) = u(n) × q, qu'on écrit aussi u(n+1) = q × u(n). Formule directe : <mark>u(n) = u(0) × q<sup>n</sup></mark>.</p>
<p>Attention au point de départ. Si la suite commence à u(1), on ne multiplie que n − 1 fois pour arriver à u(n) : <mark>u(n) = u(1) × q<sup>n − 1</sup></mark>.</p>
<div class="formule"><p>Départ à u(0) : u(n) = u(0) × q<sup>n</sup><br>Départ à u(1) : u(n) = u(1) × q<sup>n − 1</sup></p></div>
<p>Le lien avec les pourcentages est essentiel en STMG : <mark>augmenter de 5 % chaque année, c'est multiplier par 1,05 chaque année</mark>. Les valeurs successives forment donc une suite géométrique de raison 1,05.</p>
<table class="tbl"><tr><th>Évolution répétée</th><th>Raison q</th></tr><tr><td>+ 5 % par an</td><td>1,05</td></tr><tr><td>+ 20 % par an</td><td>1,2</td></tr><tr><td>− 10 % par an</td><td>0,9</td></tr><tr><td>− 12 % par an</td><td>0,88</td></tr><tr><td>− 25 % par an</td><td>0,75</td></tr></table>
<div class="etapes">
<p><b>Exemple complet.</b> Tu places 1 000 € à 10 % par an. Que possèdes-tu après 3 ans ?</p>
<p><b>Étape 1.</b> Chaque année, le capital est multiplié par 1 + 10 ÷ 100 = 1,1. Donc u(0) = 1000 et q = 1,1.</p>
<p><b>Étape 2.</b> De proche en proche : u(1) = 1000 × 1,1 = 1100, puis u(2) = 1100 × 1,1 = 1210.</p>
<p><b>Étape 3.</b> Formule directe pour aller vite : u(3) = 1000 × 1,1³ = 1000 × 1,331 = <b>1 331 €</b>.</p>
</div>
<p><b>Sens de variation</b> (quand le premier terme est positif, ce qui est le cas des prix, des capitaux et des quantités) : si q &gt; 1 la suite est <b>croissante</b>, si 0 &lt; q &lt; 1 elle est <b>décroissante</b>, si q = 1 elle est constante. Avec un premier terme négatif, c'est l'inverse.</p>
<p><b>Prouver qu'une suite est géométrique.</b> Calcule u(n+1) ÷ u(n). Si le résultat est un nombre fixe (sans n), c'est la raison. Exemple : u(n) = 5 × 3<sup>n</sup> donne u(n+1) ÷ u(n) = 3.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p><mark>u(n) = u(0) × q<sup>n</sup></mark>, ou <mark>u(n) = u(1) × q<sup>n − 1</sup></mark> si la suite démarre à u(1). Quand le premier terme est positif : si q &gt; 1, la suite croît (hausse répétée) ; si 0 &lt; q &lt; 1, elle décroît (baisse répétée). Pour trouver q : divise un terme par le précédent. Pour additionner des termes, va voir la fiche « Sommes de suites ».</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Évolution de t % répétée → raison q = 1 + t ÷ 100 pour une hausse, q = 1 − t ÷ 100 pour une baisse (−12 % donne 0,88). Écris toujours cette conversion avant tout calcul.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Pour « + 5 % par an », la raison n'est ni 5 ni 0,05 : c'est <mark>1,05</mark>. Multiplier par 0,05, ce serait diviser le capital par 20 !</p></div>`,
    gen(level, R){
      var SENSG = ["Elle est croissante", "Elle est décroissante", "Elle est constante", "Elle change de sens à chaque terme"];
      if(level === 1){
        var v = R.int(1, 6);
        if(v === 6){
          // suite définie par récurrence : reconnaître la nature et la raison
          var u0r = R.int(2, 9), qr6 = R.pick([2, 3, 4, 5, 10]);
          if(u0r === qr6) u0r += 1;
          var bonN = "Géométrique de raison " + qr6;
          return {
            q: "La suite u est définie par u(0) = " + u0r + " et, pour tout entier n, u(n+1) = " + qr6 + " × u(n). Quelle est sa nature ?",
            a: bonN,
            accept: null,
            choix: [bonN, "Arithmétique de raison " + qr6, "Géométrique de raison " + u0r, "Ni arithmétique ni géométrique"],
            expl: "Pour passer d'un terme au suivant, on multiplie toujours par " + qr6 + " : c'est la définition d'une suite géométrique, de raison q = " + qr6 + ". Le nombre " + u0r + " est le premier terme, pas la raison."
          };
        }
        if(v === 4){
          // sens de variation : premier terme positif, on compare q à 1
          var qS = R.pick([0.5, 0.8, 0.9, 1.1, 1.5, 2, 3]), u0S = R.pick([2, 5, 10, 100]);
          return {
            q: "Une suite géométrique a pour premier terme u(0) = " + u0S + " et pour raison q = " + fr(qS) + ". Quel est son sens de variation ?",
            a: qS > 1 ? SENSG[0] : SENSG[1],
            accept: null,
            choix: SENSG.slice(),
            expl: "Le premier terme est positif : tout dépend de la place de q par rapport à 1. Ici q = " + fr(qS) + (qS > 1 ? " est plus grand que 1 : chaque terme est plus grand que le précédent, la suite est croissante." : " est entre 0 et 1 : chaque terme est plus petit que le précédent, la suite est décroissante.")
          };
        }
        if(v === 5){
          // la suite commence à u(1) : n − 1 multiplications
          var u1a = R.int(2, 9), q1a = R.pick([2, 3, 10]);
          return {
            q: "Une suite géométrique commence à u(1) = " + u1a + " et a pour raison q = " + q1a + ". Calcule u(3).",
            a: String(u1a * q1a * q1a),
            accept: null,
            choix: null,
            expl: "La suite démarre à u(1) : de u(1) à u(3), on multiplie 2 fois par q seulement. u(3) = u(1) × q² = " + u1a + " × " + (q1a * q1a) + " = " + (u1a * q1a * q1a) + "."
          };
        }
        if(v === 1){
          var u0 = R.int(2, 9), q = R.pick([2, 3, 5, 10]), n = R.pick([1, 2]);
          var a = u0 * Math.pow(q, n);
          return {
            q: "Une suite géométrique a pour premier terme u(0) = " + u0 + " et pour raison q = " + q + ". Calcule u(" + n + ").",
            a: String(a),
            accept: null,
            choix: null,
            expl: "On multiplie par " + q + " à chaque étape : u(" + n + ") = " + u0 + " × " + q + (n === 2 ? "²" : "") + " = " + a + "."
          };
        }
        if(v === 2){
          var u02 = R.int(2, 9), q2 = R.pick([2, 3, 4, 5, 10]);
          return {
            q: "Voici les premiers termes d'une suite géométrique : " + u02 + " ; " + (u02 * q2) + " ; " + (u02 * q2 * q2) + " ; … Quelle est sa raison ?",
            a: String(q2),
            accept: ["q = " + q2],
            choix: null,
            expl: "On divise un terme par le précédent : " + (u02 * q2) + " ÷ " + u02 + " = " + q2 + ". La raison est q = " + q2 + "."
          };
        }
        var u03 = R.pick([40, 64, 80, 120]);
        return {
          q: "Une suite géométrique a pour premier terme u(0) = " + u03 + " et pour raison q = 0,5. Calcule u(2).",
          a: String(u03 * 0.25),
          accept: null,
          choix: null,
          expl: "u(2) = " + u03 + " × 0,5 × 0,5 = " + u03 + " × 0,25 = " + (u03 * 0.25) + ". Multiplier deux fois par 0,5 revient à diviser par 4."
        };
      }
      if(level === 2){
        var w = R.int(1, 6);
        if(w === 6){
          // suite définie par récurrence, raison décimale (c'est l'écriture d'une évolution en %)
          var cq = R.pick([[1.1, 2], [1.1, 3], [1.2, 2], [0.9, 2], [0.5, 3], [1.05, 2], [0.8, 2]]);
          var u0q = R.pick([1000, 2000, 4000]);
          var pq = Math.round(Math.pow(cq[0], cq[1]) * 10000) / 10000;
          var aq = r2(u0q * pq);
          return {
            q: "La suite u est définie par u(0) = " + u0q + " et, pour tout entier n, u(n+1) = " + fr(cq[0]) + " × u(n). Calcule u(" + cq[1] + ").",
            a: String(aq),
            accept: [String(aq).replace('.', ',')],
            choix: null,
            expl: "On multiplie par " + fr(cq[0]) + " à chaque étape : la suite est géométrique de raison q = " + fr(cq[0]) + ". u(" + cq[1] + ") = u(0) × q" + sup(cq[1]) + " = " + u0q + " × " + fr(cq[0]) + sup(cq[1]) + " = " + u0q + " × " + fr(pq) + " = " + fr(aq) + "."
          };
        }
        if(w === 3){
          // formule directe quand la suite démarre à u(1)
          var q1b = R.pick([2, 3]);
          var n1b = q1b === 2 ? R.int(4, 7) : R.int(3, 5);
          var u1b = R.int(2, 6);
          var a1b = u1b * Math.pow(q1b, n1b - 1);
          return {
            q: "u est géométrique de premier terme u(1) = " + u1b + " et de raison q = " + q1b + ". Calcule u(" + n1b + ").",
            a: String(a1b),
            accept: null,
            choix: null,
            expl: "La suite démarre à u(1), donc la formule est u(n) = u(1) × qⁿ⁻¹. u(" + n1b + ") = " + u1b + " × " + q1b + sup(n1b - 1) + " = " + u1b + " × " + Math.pow(q1b, n1b - 1) + " = " + a1b + "."
          };
        }
        if(w === 4){
          // du taux à la raison (−12 % → 0,88)
          var hausseT = R.pick([true, false]);
          var tT = hausseT ? R.pick([2, 3, 4, 8, 12, 15, 30]) : R.pick([4, 8, 12, 15, 30, 35]);
          var qT = r2(hausseT ? 1 + tT / 100 : 1 - tT / 100);
          var sujetT = R.pick(["Le prix d'un abonnement", "La population d'une ville", "Le chiffre d'affaires d'une boutique", "La valeur d'un stock"]);
          return {
            q: sujetT + " " + (hausseT ? "augmente" : "baisse") + " de " + tT + " % chaque année. Les valeurs successives forment une suite géométrique. Quelle est sa raison q ? (réponse décimale)",
            a: String(qT),
            accept: null,
            choix: null,
            expl: (hausseT ? "Augmenter" : "Baisser") + " de t %, c'est multiplier par 1 " + (hausseT ? "+" : "−") + " t ÷ 100. Ici q = 1 " + (hausseT ? "+" : "−") + " " + tT + " ÷ 100 = " + fr(qT) + "."
          };
        }
        if(w === 5){
          // « exprime u(n) en fonction de n »
          var u0e = R.int(2, 9), qe = R.pick([2, 3, 5]);
          if(u0e === qe) u0e += 1;
          var bonE = "u(n) = " + u0e + " × " + qe + "ⁿ";
          return {
            q: "u est une suite géométrique de premier terme u(0) = " + u0e + " et de raison q = " + qe + ". Exprime u(n) en fonction de n.",
            a: bonE,
            accept: null,
            choix: [bonE, "u(n) = " + qe + " × " + u0e + "ⁿ", "u(n) = " + u0e + " + " + qe + "n", "u(n) = " + u0e + " × " + qe + "ⁿ⁻¹"],
            expl: "Pour une suite géométrique qui démarre à u(0), la formule directe est u(n) = u(0) × qⁿ. Ici " + bonE + "."
          };
        }
        if(w === 1){
          var q3 = R.pick([2, 3, 10]);
          var n3, u04;
          if(q3 === 2){ n3 = R.int(3, 6); u04 = R.int(2, 7); }
          else if(q3 === 3){ n3 = R.int(2, 4); u04 = R.int(2, 5); }
          else { n3 = R.int(2, 3); u04 = R.int(2, 9); }
          var a3 = u04 * Math.pow(q3, n3);
          return {
            q: "u est géométrique avec u(0) = " + u04 + " et q = " + q3 + ". Calcule u(" + n3 + ") à l'aide de la formule u(n) = u(0) × qⁿ.",
            a: String(a3),
            accept: null,
            choix: null,
            expl: "u(" + n3 + ") = " + u04 + " × " + q3 + sup(n3) + " = " + u04 + " × " + Math.pow(q3, n3) + " = " + a3 + "."
          };
        }
        var u05 = R.pick([80, 160, 240, 400]);
        var n4 = R.int(2, 4);
        var a4 = r2(u05 * Math.pow(0.5, n4));
        return {
          q: "u est géométrique avec u(0) = " + u05 + " et q = 0,5. Calcule u(" + n4 + ").",
          a: String(a4),
          accept: [String(a4).replace('.', ',')],
          choix: null,
          expl: "u(" + n4 + ") = " + u05 + " × 0,5" + sup(n4) + " = " + u05 + " ÷ " + Math.pow(2, n4) + " = " + fr(a4) + "."
        };
      }
      var v3 = R.int(1, 7);
      if(v3 === 5){
        // de la raison au taux
        var qR = R.pick([0.88, 0.75, 0.6, 0.97, 1.03, 1.12, 1.25, 1.4]);
        var tR = Math.round((qR - 1) * 100);
        var cR = Math.round(qR * 100);
        var bonR = (tR > 0 ? "+" : "−") + Math.abs(tR) + " %";
        return {
          q: "Une suite géométrique a pour raison q = " + fr(qR) + ". À quelle évolution en pourcentage correspond chaque étape ?",
          a: bonR,
          accept: null,
          choix: [bonR, (tR > 0 ? "−" : "+") + Math.abs(tR) + " %", (tR > 0 ? "+" : "−") + cR + " %", tR > 0 ? "+" + fr(qR) + " %" : "+" + cR + " %"],
          expl: "On compare la raison à 1, car q = 1 + t ÷ 100. Ici " + fr(qR) + " = 1 " + (tR > 0 ? "+" : "−") + " " + fr(r2(Math.abs(tR) / 100)) + ", soit une " + (tR > 0 ? "hausse" : "baisse") + " de " + Math.abs(tR) + " % à chaque étape."
        };
      }
      if(v3 === 6){
        // « exprime u(n) en fonction de n » en contexte, départ à u(1)
        var V1 = R.pick([500, 600, 800, 1200]), t6 = R.pick([2, 3, 5, 10]);
        var q6 = fr(r2(1 + t6 / 100));
        var bon6 = "u(n) = " + V1 + " × " + q6 + "ⁿ⁻¹";
        return {
          q: "Un loyer vaut " + V1 + " € la première année, puis augmente de " + t6 + " % par an. On note u(n) le loyer de la n-ième année, avec u(1) = " + V1 + ". Exprime u(n) en fonction de n.",
          a: bon6,
          accept: null,
          choix: [bon6, "u(n) = " + V1 + " × " + q6 + "ⁿ", "u(n) = " + V1 + " × " + fr(r2(t6 / 100)) + "ⁿ⁻¹", "u(n) = " + V1 + " + " + q6 + "(n − 1)"],
          expl: "Une hausse de " + t6 + " % par an donne une suite géométrique de raison " + q6 + ". Elle démarre à u(1) : de u(1) à u(n), on multiplie n − 1 fois, donc " + bon6 + "."
        };
      }
      if(v3 === 7){
        // prouver la nature : u(n+1) ÷ u(n) ne dépend pas de n
        var c7 = R.int(2, 9), q7 = R.pick([2, 3, 4, 5]);
        if(c7 === q7) c7 += 1;
        return {
          q: "Pour tout entier n, u(n) = " + c7 + " × " + q7 + "ⁿ. Calcule u(n+1) ÷ u(n). (Ce quotient constant est la raison.)",
          a: String(q7),
          accept: ["q = " + q7],
          choix: null,
          expl: "Pour prouver qu'une suite est géométrique, on divise un terme par le précédent. u(n+1) ÷ u(n) = (" + c7 + " × " + q7 + "ⁿ⁺¹) ÷ (" + c7 + " × " + q7 + "ⁿ) = " + q7 + ". Le quotient ne dépend pas de n : la suite est géométrique de raison " + q7 + "."
        };
      }
      if(v3 === 1){
        var t = R.pick([2, 5, 10, 20, 50]);
        var ok = fr(r2(1 + t / 100));
        return {
          q: "Un prix augmente de " + t + " % chaque année. Les prix successifs forment une suite géométrique. Quelle est sa raison ?",
          a: ok,
          accept: null,
          choix: [ok, fr(r2(t / 100)), fr(r2(1 + t / 10)), String(t)],
          expl: "Augmenter de " + t + " % revient à multiplier par 1 + " + t + " ÷ 100 = " + fr(1 + t / 100) + " : c'est la raison de la suite."
        };
      }
      if(v3 === 2){
        var t2 = R.pick([5, 10, 20, 25, 40]);
        var ok2 = fr(r2(1 - t2 / 100));
        return {
          q: "Un stock diminue de " + t2 + " % chaque mois. Les quantités successives forment une suite géométrique. Quelle est sa raison ?",
          a: ok2,
          accept: null,
          choix: [ok2, fr(r2(t2 / 100)), fr(r2(1 + t2 / 100)), fr(-r2(t2 / 100))],
          expl: "Diminuer de " + t2 + " % revient à multiplier par 1 − " + t2 + " ÷ 100 = " + fr(1 - t2 / 100) + " : c'est la raison."
        };
      }
      if(v3 === 3){
        var combo = R.pick([[1.1, 2], [1.1, 3], [1.2, 2], [1.2, 3], [0.9, 2], [0.9, 3], [1.05, 2], [0.8, 2], [0.8, 3]]);
        var qc = combo[0], nc = combo[1];
        var C0 = R.pick([500, 1000, 2000]);
        var pct = Math.round((qc - 1) * 100);
        var res = r2(C0 * Math.pow(qc, nc));
        return {
          q: "Un capital de " + C0 + " € " + (pct > 0 ? "augmente de " + pct : "diminue de " + (-pct)) + " % chaque année. Quelle est sa valeur (en €) après " + nc + " années ?",
          a: String(res),
          accept: [String(res).replace('.', ','), fr(res) + " €"],
          choix: null,
          expl: "Chaque année on multiplie par " + fr(qc) + ". Valeur finale : " + C0 + " × " + fr(qc) + sup(nc) + " = " + fr(res) + " €."
        };
      }
      var u06 = R.int(2, 5);
      var n6 = R.int(5, 7);
      var a6 = u06 * Math.pow(2, n6);
      return {
        q: "u est géométrique avec u(0) = " + u06 + " et q = 2. Calcule u(" + n6 + ").",
        a: String(a6),
        accept: null,
        choix: null,
        expl: "u(" + n6 + ") = " + u06 + " × 2" + sup(n6) + " = " + u06 + " × " + Math.pow(2, n6) + " = " + a6 + "."
      };
    }
  });

  // =====================================================================
  // p4-06b — Sommes de suites (placée juste après les deux fiches de suites)
  // =====================================================================
  SKILLS.push({
    id: 'p4-06b-sommes-suites',
    phase: 4,
    ordre: 7,
    titre: "Sommes de suites",
    objectif: "Compter les termes, calculer la somme des termes d'une suite arithmétique ou géométrique, et savoir si l'on demande un terme ou une somme.",
    lecon: `<p class="lede">Au contrôle, on ne te demande pas seulement <b>un</b> terme : on te demande souvent <mark>le total de plusieurs termes</mark>. Combien as-tu versé en tout sur 12 mois ? Combien de pièces produites en 5 ans ? C'est une somme de termes, et chaque type de suite a sa formule.</p>
<p>Rappel d'écriture : u(n) est le u<sub>n</sub> de ton cahier, et u(0) + u(1) + … + u(n) s'écrit aussi u<sub>0</sub> + u<sub>1</sub> + … + u<sub>n</sub>.</p>
<p><b>Première étape, toujours : compter les termes.</b> De u(0) à u(n), il y a <mark>n + 1 termes</mark> (et non n, car on compte aussi u(0)). De u(1) à u(n), il y en a n. En général, de u(p) à u(n), il y a <mark>n − p + 1 termes</mark>.</p>
<div class="formule"><p>Somme arithmétique = nombre de termes × (premier terme + dernier terme) ÷&nbsp;2</p></div>
<div class="etapes">
<p><b>Exemple complet (arithmétique).</b> u(0) = 5 et r = 3. Calcule S = u(0) + u(1) + … + u(10).</p>
<p><b>Étape 1.</b> Je compte : de u(0) à u(10), il y a 10 + 1 = 11 termes.</p>
<p><b>Étape 2.</b> Je calcule le dernier terme : u(10) = 5 + 10 × 3 = 35.</p>
<p><b>Étape 3.</b> J'applique la formule : S = 11 × (5 + 35) ÷&nbsp;2 = 11 × 40 ÷ 2 = <b>220</b>.</p>
</div>
<div class="formule"><p>Somme géométrique = premier terme × (1&nbsp;−&nbsp;q<sup>nombre&nbsp;de&nbsp;termes</sup>) ÷ (1&nbsp;−&nbsp;q)</p></div>
<div class="etapes">
<p><b>Exemple complet (géométrique).</b> u(0) = 3 et q = 2. Calcule S = u(0) + u(1) + … + u(4).</p>
<p><b>Étape 1.</b> Je compte : de u(0) à u(4), il y a 5 termes.</p>
<p><b>Étape 2.</b> J'applique la formule : S = 3 × (1 − 2<sup>5</sup>) ÷ (1 − 2) = 3 × (−31) ÷ (−1) = <b>93</b>.</p>
<p><b>Étape 3.</b> Je vérifie : 3 + 6 + 12 + 24 + 48 = 93. C'est bon.</p>
</div>
<p><b>Un terme ou une somme ?</b> Lis la question jusqu'au bout. «&nbsp;Combien verse-t-elle <b>le</b> 12<sup>e</sup> mois ?&nbsp;» demande un seul terme. «&nbsp;Combien a-t-elle versé <b>en tout</b> en 12 mois ?&nbsp;» demande la somme des 12 termes. Les mots qui annoncent une somme : en tout, au total, cumulé, sur l'ensemble de la période.</p>
<p>Les six formules du chapitre, à savoir retrouver sans hésiter :</p>
<table class="tbl"><tr><th>Situation</th><th>Formule</th></tr>
<tr><td>Arithmétique, départ à u(0)</td><td>u(n) = u(0) + n × r</td></tr>
<tr><td>Arithmétique, départ à u(1)</td><td>u(n) = u(1) + (n − 1) × r</td></tr>
<tr><td>Géométrique, départ à u(0)</td><td>u(n) = u(0) × q<sup>n</sup></td></tr>
<tr><td>Géométrique, départ à u(1)</td><td>u(n) = u(1) × q<sup>n − 1</sup></td></tr>
<tr><td>Somme arithmétique</td><td>nombre de termes × (1<sup>er</sup> terme + dernier terme) ÷&nbsp;2</td></tr>
<tr><td>Somme géométrique</td><td>1<sup>er</sup> terme × (1&nbsp;−&nbsp;q<sup>nombre&nbsp;de&nbsp;termes</sup>) ÷ (1&nbsp;−&nbsp;q)</td></tr></table>
<div class="box retenir"><p class="box-t">À retenir</p><p>Nombre de termes de u(p) à u(n) : <mark>n&nbsp;−&nbsp;p&nbsp;+&nbsp;1</mark>.<br>Somme arithmétique : <mark>nombre de termes × (1<sup>er</sup> + dernier) ÷&nbsp;2</mark>.<br>Somme géométrique : <mark>1<sup>er</sup> terme × (1&nbsp;−&nbsp;q<sup>nombre&nbsp;de&nbsp;termes</sup>) ÷ (1&nbsp;−&nbsp;q)</mark>.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Avant toute formule, écris trois choses : le premier terme de la somme, le dernier terme et le nombre de termes. De u(p) à u(n), il y a n − p + 1 termes.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>De u(0) à u(n), il y a n + 1 termes, pas n. Et dans la somme géométrique, l'exposant est le <b>nombre de termes</b>, pas le rang du dernier terme : pour u(0) + … + u(4), c'est q<sup>5</sup>.</p></div>`,
    gen(level, R){
      var CHX = ["Un seul terme de la suite", "La somme de plusieurs termes de la suite", "La raison de la suite", "Le nombre de termes"];
      // Écriture « u(p) + u(p+1) + … + u(n) »
      var pts = function(p, n){ return "u(" + p + ") + u(" + (p + 1) + ") + … + u(" + n + ")"; };
      var i;
      if(level === 1){
        var v = R.int(1, 3);
        if(v === 1){
          // compter les termes
          var p1 = R.pick([0, 0, 1, 1, R.int(2, 9)]);
          var n1 = p1 + R.int(6, 25);
          var nb1 = n1 - p1 + 1;
          return {
            q: "Combien de termes y a-t-il dans la somme " + pts(p1, n1) + " ?",
            a: String(nb1),
            accept: null,
            choix: null,
            expl: p1 === 0 ? "De u(0) à u(n), il y a n + 1 termes, car on compte aussi u(0). Ici " + n1 + " + 1 = " + nb1 + " termes."
              : (p1 === 1 ? "De u(1) à u(n), il y a n termes : on compte de 1 à n. Ici " + nb1 + " termes."
              : "De u(p) à u(n), il y a n − p + 1 termes : le + 1 compte le terme de départ. Ici " + n1 + " − " + p1 + " + 1 = " + nb1 + " termes.")
          };
        }
        if(v === 2){
          // somme de quelques termes donnés, avec la formule
          var f2 = R.int(1, 12), pas2 = R.int(2, 6), nb2 = R.pick([5, 6, 7]);
          var termes = [];
          for(i = 0; i < nb2; i++) termes.push(f2 + i * pas2);
          var l2 = termes[nb2 - 1], S2 = nb2 * (f2 + l2) / 2;
          return {
            q: "Voici " + nb2 + " termes consécutifs d'une suite arithmétique : " + termes.join(" ; ") + ". Calcule leur somme avec la formule : nombre de termes × (premier + dernier) ÷ 2.",
            a: String(S2),
            accept: null,
            choix: null,
            expl: "Il y a " + nb2 + " termes, le premier vaut " + f2 + " et le dernier " + l2 + ". Somme = " + nb2 + " × (" + f2 + " + " + l2 + ") ÷ 2 = " + nb2 + " × " + (f2 + l2) + " ÷ 2 = " + S2 + "."
          };
        }
        // un terme ou une somme ?
        var cx = R.pick([
          {s: "Chaque mois, Léa verse sur son livret 10 € de plus que le mois précédent.", t: "le montant de son versement du 12e mois", S: "le total de ses versements sur les 12 premiers mois"},
          {s: "Une usine produit chaque année 5 % de pièces de plus que l'année précédente.", t: "sa production de la 6e année", S: "sa production cumulée sur les 6 premières années"},
          {s: "Un coureur allonge sa sortie de 2 km chaque semaine.", t: "la distance courue la 8e semaine", S: "la distance totale courue en 8 semaines"},
          {s: "Un salaire annuel augmente de 300 € chaque année.", t: "le salaire de la 10e année", S: "le total des salaires gagnés en 10 ans"}
        ]);
        var veutSomme = R.pick([true, false]);
        return {
          q: cx.s + " On veut connaître " + (veutSomme ? cx.S : cx.t) + ". Que faut-il calculer ?",
          a: veutSomme ? CHX[1] : CHX[0],
          accept: null,
          choix: CHX.slice(),
          expl: veutSomme ? "« Total », « cumulé », « en tout » : on additionne toutes les étapes, c'est une somme de termes. Un seul terme ne donnerait que la valeur de la dernière étape."
            : "On demande la valeur d'une seule étape, celle d'un rang précis : c'est un terme de la suite. Une somme additionnerait toutes les étapes depuis le début."
        };
      }
      if(level === 2){
        var w = R.int(1, 6);
        if(w === 1){
          // somme arithmétique, départ à u(0) : n + 1 termes
          var a0 = R.int(1, 10), ra = R.int(2, 6), na = R.pick([9, 10, 19, 20]);
          var da = a0 + na * ra, Sa = (na + 1) * (a0 + da) / 2;
          return {
            q: "u est une suite arithmétique de premier terme u(0) = " + a0 + " et de raison r = " + ra + ". Calcule S = " + pts(0, na) + ".",
            a: String(Sa),
            accept: null,
            choix: null,
            expl: "De u(0) à u(" + na + "), il y a " + (na + 1) + " termes. Dernier terme : u(" + na + ") = " + a0 + " + " + na + " × " + ra + " = " + da + ". S = " + (na + 1) + " × (" + a0 + " + " + da + ") ÷ 2 = " + Sa + "."
          };
        }
        if(w === 2){
          // somme arithmétique, départ à u(1) : n termes
          var a1 = R.int(1, 12), rb = R.int(2, 6), nbb = R.pick([10, 12, 20]);
          var db = a1 + (nbb - 1) * rb, Sb = nbb * (a1 + db) / 2;
          return {
            q: "u est une suite arithmétique de premier terme u(1) = " + a1 + " et de raison r = " + rb + ". Calcule S = " + pts(1, nbb) + ".",
            a: String(Sb),
            accept: null,
            choix: null,
            expl: "De u(1) à u(" + nbb + "), il y a " + nbb + " termes. Dernier terme : u(" + nbb + ") = " + a1 + " + " + (nbb - 1) + " × " + rb + " = " + db + ". S = " + nbb + " × (" + a1 + " + " + db + ") ÷ 2 = " + Sb + "."
          };
        }
        if(w === 3){
          // 1 + 2 + … + n
          var nc = R.pick([10, 20, 30, 40, 50, 100]);
          var Sc = nc * (nc + 1) / 2;
          return {
            q: "Calcule la somme des entiers de 1 à " + nc + " : 1 + 2 + 3 + … + " + nc + ".",
            a: String(Sc),
            accept: null,
            choix: null,
            expl: "Ce sont " + nc + " termes d'une suite arithmétique de raison 1, du premier terme 1 au dernier terme " + nc + ". S = " + nc + " × (1 + " + nc + ") ÷ 2 = " + Sc + "."
          };
        }
        if(w === 4){
          // somme géométrique, départ à u(0) : n + 1 termes
          var qg = R.pick([2, 3]);
          var ng = qg === 2 ? R.int(3, 6) : R.int(2, 4);
          var g0 = R.int(1, 5);
          var pw = Math.pow(qg, ng + 1), Sg = g0 * (pw - 1) / (qg - 1);
          return {
            q: "u est une suite géométrique de premier terme u(0) = " + g0 + " et de raison q = " + qg + ". Calcule S = " + pts(0, ng) + ".",
            a: String(Sg),
            accept: null,
            choix: null,
            expl: "De u(0) à u(" + ng + "), il y a " + (ng + 1) + " termes : l'exposant de la formule est " + (ng + 1) + ". S = " + g0 + " × (1 − " + qg + sup(ng + 1) + ") ÷ (1 − " + qg + ") = " + g0 + " × (" + sg(1 - pw) + ") ÷ (" + sg(1 - qg) + ") = " + Sg + "."
          };
        }
        if(w === 5){
          // somme géométrique, départ à u(1) : n termes
          var nh = R.int(4, 7), h1 = R.int(1, 6);
          var pwh = Math.pow(2, nh), Sh = h1 * (pwh - 1);
          return {
            q: "u est une suite géométrique de premier terme u(1) = " + h1 + " et de raison q = 2. Calcule S = " + pts(1, nh) + ".",
            a: String(Sh),
            accept: null,
            choix: null,
            expl: "De u(1) à u(" + nh + "), il y a " + nh + " termes : l'exposant de la formule est " + nh + ". S = " + h1 + " × (1 − 2" + sup(nh) + ") ÷ (1 − 2) = " + h1 + " × (" + sg(1 - pwh) + ") ÷ (−1) = " + Sh + "."
          };
        }
        // total versé : somme arithmétique en contexte, départ au 1er mois
        var v1 = R.pick([30, 40, 50, 80, 100]), rv = R.pick([5, 10, 20]), nv = R.pick([6, 10, 12]);
        var dv = v1 + (nv - 1) * rv, Sv = nv * (v1 + dv) / 2;
        return {
          q: "Léa verse " + v1 + " € sur son livret le premier mois, puis chaque mois " + rv + " € de plus que le mois précédent. Combien a-t-elle versé en tout au bout de " + nv + " mois (en €) ?",
          a: String(Sv),
          accept: null,
          choix: null,
          expl: "« En tout » : on additionne les " + nv + " versements, c'est une somme de termes d'une suite arithmétique de raison " + rv + ". Dernier versement : " + v1 + " + " + (nv - 1) + " × " + rv + " = " + dv + " €. Total = " + nv + " × (" + v1 + " + " + dv + ") ÷ 2 = " + Sv + " €."
        };
      }
      var z = R.int(1, 5);
      if(z === 1){
        // somme géométrique en contexte, raison décimale
        var co = R.pick([[1.1, 3], [1.1, 4], [1.2, 3], [1.5, 3], [0.5, 3], [0.5, 4], [0.9, 3], [0.8, 3]]);
        var qz = co[0], nz = co[1], P0 = R.pick([1000, 2000, 5000, 10000]);
        var fac = Math.round((1 - Math.pow(qz, nz)) / (1 - qz) * 10000) / 10000;
        var Sz = r2(P0 * fac);
        var tz = Math.round(Math.abs(qz - 1) * 100);
        var liste = [];
        for(i = 0; i < nz; i++) liste.push(fr(r2(P0 * Math.pow(qz, i))));
        return {
          q: qz > 1 ? "Une entreprise vend " + P0 + " articles la première année, puis ses ventes augmentent de " + tz + " % par an. Combien d'articles vend-elle au total sur les " + nz + " premières années ?"
            : "Une mine fournit " + P0 + " tonnes de minerai la première année, puis sa production baisse de " + tz + " % par an. Combien de tonnes fournit-elle au total sur les " + nz + " premières années ?",
          a: String(Sz),
          accept: null,
          choix: null,
          expl: "« Au total » : c'est la somme de " + nz + " termes d'une suite géométrique de raison " + fr(qz) + ". S = " + P0 + " × (1 − " + fr(qz) + sup(nz) + ") ÷ (1 − " + fr(qz) + ") = " + P0 + " × " + fr(fac) + " = " + fr(Sz) + ". Vérification : " + liste.join(" + ") + " = " + fr(Sz) + "."
        };
      }
      if(z === 2){
        // un terme ou une somme ? (suite arithmétique, départ à la 1re année)
        var s1 = R.pick([18000, 20000, 24000]), rs = R.pick([300, 500, 600]), ns = R.pick([5, 8, 10]);
        var ds = s1 + (ns - 1) * rs, Ss = ns * (s1 + ds) / 2;
        var totS = R.pick([true, true, false]);
        return {
          q: "Un salarié gagne " + s1 + " € la première année, puis son salaire annuel augmente de " + rs + " € chaque année. " + (totS ? "Combien aura-t-il gagné au total sur les " + ns + " premières années (en €) ?" : "Quel est son salaire annuel la " + ns + "e année (en €) ?"),
          a: String(totS ? Ss : ds),
          accept: null,
          choix: null,
          expl: totS ? "« Au total » : on additionne les " + ns + " salaires, c'est une somme de termes. Salaire de la " + ns + "e année : " + s1 + " + " + (ns - 1) + " × " + rs + " = " + ds + " €. Total = " + ns + " × (" + s1 + " + " + ds + ") ÷ 2 = " + Ss + " €."
            : "On demande une seule année : c'est un terme, pas une somme. La suite démarre à la 1re année, donc u(" + ns + ") = " + s1 + " + " + (ns - 1) + " × " + rs + " = " + ds + " €."
        };
      }
      if(z === 3){
        // somme partielle, de u(p) à u(n) : n − p + 1 termes
        var ap = R.int(1, 9), rp = R.int(2, 5), pp = R.int(3, 6);
        var np = pp + R.pick([9, 10, 14, 15]);
        var up = ap + pp * rp, un = ap + np * rp, nbp = np - pp + 1, Sp = nbp * (up + un) / 2;
        return {
          q: "u est une suite arithmétique avec u(0) = " + ap + " et r = " + rp + ". Calcule S = " + pts(pp, np) + ".",
          a: String(Sp),
          accept: null,
          choix: null,
          expl: "De u(" + pp + ") à u(" + np + "), il y a " + np + " − " + pp + " + 1 = " + nbp + " termes. u(" + pp + ") = " + ap + " + " + pp + " × " + rp + " = " + up + " et u(" + np + ") = " + ap + " + " + np + " × " + rp + " = " + un + ". S = " + nbp + " × (" + up + " + " + un + ") ÷ 2 = " + Sp + "."
        };
      }
      if(z === 4){
        // total cumulé contre dernier terme (suite géométrique, départ au 1er jour)
        var qv = R.pick([2, 2, 3]);
        var nj = qv === 2 ? R.int(5, 8) : R.int(4, 5);
        var j1 = R.pick([50, 100, 200]);
        var dern = j1 * Math.pow(qv, nj - 1), Sj = j1 * (Math.pow(qv, nj) - 1) / (qv - 1);
        var totJ = R.pick([true, true, false]);
        return {
          q: "Une vidéo est vue " + j1 + " fois le premier jour, puis le nombre de vues " + (qv === 2 ? "double" : "triple") + " chaque jour. " + (totJ ? "Combien de vues compte-t-elle au total sur les " + nj + " premiers jours ?" : "Combien de vues fait-elle le " + nj + "e jour ?"),
          a: String(totJ ? Sj : dern),
          accept: null,
          choix: null,
          expl: totJ ? "« Au total » : c'est la somme de " + nj + " termes d'une suite géométrique de raison " + qv + ". S = " + j1 + " × (1 − " + qv + sup(nj) + ") ÷ (1 − " + qv + ") = " + j1 + " × (" + sg(1 - Math.pow(qv, nj)) + ") ÷ (" + sg(1 - qv) + ") = " + Sj + "."
            : "On demande un seul jour : c'est un terme, pas une somme. La suite démarre au jour 1, donc u(" + nj + ") = " + j1 + " × " + qv + sup(nj - 1) + " = " + j1 + " × " + Math.pow(qv, nj - 1) + " = " + dern + "."
        };
      }
      // somme d'entiers consécutifs, de p à n
      var pe = R.pick([5, 10, 12, 20]);
      var ne = pe + R.pick([10, 20, 30]);
      var nbe = ne - pe + 1, Se = nbe * (pe + ne) / 2;
      return {
        q: "Calcule la somme des entiers de " + pe + " à " + ne + " : " + pe + " + " + (pe + 1) + " + … + " + ne + ".",
        a: String(Se),
        accept: null,
        choix: null,
        expl: "De " + pe + " à " + ne + ", il y a " + ne + " − " + pe + " + 1 = " + nbe + " termes (suite arithmétique de raison 1). S = " + nbe + " × (" + pe + " + " + ne + ") ÷ 2 = " + Se + "."
      };
    }
  });

  // =====================================================================
  // p4-07 — Taux d'évolution et indices
  // =====================================================================
  SKILLS.push({
    id: 'p4-07-taux-indices',
    phase: 4,
    ordre: 8,
    titre: "Taux d'évolution et indices",
    objectif: "Calculer un taux global, un taux réciproque et manipuler les indices base 100 sans jamais additionner des pourcentages.",
    lecon: `<p class="lede">C'est LE chapitre roi de STMG : il tombe presque chaque année au bac. Tout repose sur une seule idée : <mark>chaque évolution en % se traduit par une multiplication</mark>, via le coefficient multiplicateur (CM).</p>
<p>Rappels : taux d'évolution t = (valeur d'arrivée − valeur de départ) ÷ valeur de départ, et <mark>CM = 1 + t ÷ 100</mark> (hausse) ou 1 − t ÷ 100 (baisse).</p>
<div class="etapes">
<p><b>Exemple complet (taux global).</b> Un prix augmente de 20 %, puis baisse de 10 %. Évolution globale ?</p>
<p><b>Étape 1.</b> Je convertis en CM : +20 % → ×1,2 et −10 % → ×0,9.</p>
<p><b>Étape 2.</b> Je multiplie les CM : 1,2 × 0,9 = 1,08.</p>
<p><b>Étape 3.</b> Je reconvertis : 1,08 = 1 + 0,08, soit <b>+8 %</b> au total (et surtout pas +10 %).</p>
</div>
<p><b>Taux réciproque</b> : quel taux annule une évolution ? On inverse le CM. Après +25 % (×1,25), il faut ×(1 ÷ 1,25) = ×0,8, c'est-à-dire <b>−20 %</b> pour revenir au prix initial.</p>
<p><b>Indices base 100</b> : on fixe l'indice 100 à une date de référence, puis indice = 100 × valeur ÷ valeur de référence. L'énorme avantage : l'indice se lit directement. Indice 115 → +15 % depuis la référence. Et entre deux dates, taux = (i₂ − i₁) ÷ i₁ : de l'indice 120 à l'indice 150, le taux vaut 30 ÷ 120 = +25 %.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p><mark>On n'additionne JAMAIS des pourcentages d'évolutions successives : on multiplie les coefficients multiplicateurs.</mark> Taux réciproque : CM inversé. Indice = 100 × CM depuis la date de base.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Réflexe unique : « % → CM, je calcule, CM → % ». Ce détour par le CM sécurise 100 % des questions du chapitre.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>+20 % puis −20 % ne ramène PAS au prix de départ : 1,2 × 0,8 = 0,96, soit −4 %. La baisse s'applique à un prix plus élevé, elle « pèse » donc plus lourd.</p></div>`,
    gen(level, R){
      if(level === 1){
        var v = R.int(1, 3);
        if(v === 1 || v === 3){
          var V = R.pick([40, 60, 80, 100, 120, 200]);
          var t = R.pick([-50, -25, -20, -10, 10, 20, 25, 50]);
          var V2 = V + V * t / 100;
          if(v === 1){
            return {
              q: "Le prix d'un article passe de " + V + " € à " + V2 + " €. Calcule le taux d'évolution en % (mets un signe − si c'est une baisse).",
              a: String(t),
              accept: [t + "%", t + " %", (t > 0 ? "+" + t : String(t))],
              choix: null,
              expl: "t = (" + V2 + " − " + V + ") ÷ " + V + " = " + fr((V2 - V) / V) + ", soit " + sg(t) + " %."
            };
          }
          return {
            q: "Un article coûte " + V + " €. Son prix " + (t > 0 ? "augmente de " + t : "baisse de " + (-t)) + " %. Quel est le nouveau prix (en €) ?",
            a: String(V2),
            accept: [V2 + " €"],
            choix: null,
            expl: "Nouveau prix = " + V + " × " + fr(1 + t / 100) + " = " + V2 + " €."
          };
        }
        var h = R.pick([true, false]);
        var t2 = R.pick([5, 10, 15, 20, 25, 30, 50]);
        var CM = r2(h ? 1 + t2 / 100 : 1 - t2 / 100);
        return {
          q: "Une " + (h ? "hausse" : "baisse") + " de " + t2 + " % correspond à quel coefficient multiplicateur ? (réponse décimale)",
          a: String(CM),
          accept: [String(CM).replace('.', ','), "×" + CM],
          choix: null,
          expl: "CM = 1 " + (h ? "+" : "−") + " " + t2 + " ÷ 100 = " + fr(CM) + "."
        };
      }
      if(level === 2){
        var p = R.pick([[10, 20, 32], [20, 50, 80], [-10, 20, 8], [50, -20, 20], [-20, -25, -40], [25, 20, 50], [10, -10, -1], [-50, 50, -25], [25, -20, 0], [-25, -20, -40], [100, -50, 0], [20, 30, 56]]);
        var t1 = p[0], t3 = p[1], gl = p[2];
        if(R.pick([true, false])){ var tmp = t1; t1 = t3; t3 = tmp; }
        var c1 = r2(1 + t1 / 100), c2 = r2(1 + t3 / 100), cg = r2(c1 * c2);
        return {
          q: "Un prix " + (t1 > 0 ? "augmente de " + t1 : "baisse de " + (-t1)) + " %, puis " + (t3 > 0 ? "augmente de " + t3 : "baisse de " + (-t3)) + " %. Quel est le taux d'évolution global en % ? (signe − si baisse)",
          a: String(gl),
          accept: [gl + "%", gl + " %", (gl > 0 ? "+" + gl : String(gl))],
          choix: null,
          expl: "CM global = " + fr(c1) + " × " + fr(c2) + " = " + fr(cg) + ", soit " + (gl >= 0 ? "+" : "−") + Math.abs(gl) + " %. On multiplie les CM, on n'additionne jamais les %."
        };
      }
      var w = R.int(1, 3);
      if(w === 1){
        var rp = R.pick([[25, -20], [-20, 25], [100, -50], [-50, 100], [150, -60], [-60, 150], [300, -75], [-75, 300], [400, -80], [-80, 400]]);
        var tA = rp[0], tR = rp[1];
        var cmA = r2(1 + tA / 100);
        return {
          q: "Un prix " + (tA > 0 ? "a augmenté de " + tA : "a baissé de " + (-tA)) + " %. Quel taux d'évolution (en %) le ramène exactement à sa valeur initiale ?",
          a: String(tR),
          accept: [tR + "%", tR + " %", (tR > 0 ? "+" + tR : String(tR))],
          choix: null,
          expl: "CM réciproque = 1 ÷ " + fr(cmA) + " = " + fr(r2(1 / cmA)) + ", soit " + sg(tR) + " %. On inverse le coefficient, on ne prend pas l'opposé du taux."
        };
      }
      if(w === 2){
        var ip = R.pick([[100, 120, 20], [100, 115, 15], [120, 150, 25], [80, 100, 25], [125, 100, -20], [150, 120, -20], [110, 132, 20], [200, 150, -25], [160, 200, 25], [125, 150, 20], [150, 180, 20], [100, 88, -12]]);
        var i1 = ip[0], i2 = ip[1], ti = ip[2];
        return {
          q: "L'indice du prix d'un produit (base 100 en 2020) vaut " + i1 + " en 2022 et " + i2 + " en 2024. Quel est le taux d'évolution du prix entre 2022 et 2024, en % ?",
          a: String(ti),
          accept: [ti + "%", ti + " %", (ti > 0 ? "+" + ti : String(ti))],
          choix: null,
          expl: "t = (" + i2 + " − " + i1 + ") ÷ " + i1 + " = " + fr(r2((i2 - i1) / i1)) + ", soit " + sg(ti) + " %. Les indices se manipulent comme des valeurs."
        };
      }
      var tt = R.pick([5, 12, 20, 25, 30, -10, -15, -25]);
      return {
        q: "L'indice d'un prix vaut 100 en 2020 (année de base). Entre 2020 et 2023, le prix " + (tt > 0 ? "a augmenté de " + tt : "a baissé de " + (-tt)) + " %. Quel est l'indice en 2023 ?",
        a: String(100 + tt),
        accept: null,
        choix: null,
        expl: "Indice 2023 = 100 × " + fr(1 + tt / 100) + " = " + (100 + tt) + ". Depuis l'année de base, l'indice se lit directement : 100 + taux."
      };
    }
  });

  // =====================================================================
  // p4-08 — Probabilités conditionnelles
  // =====================================================================
  var P8CTX = [
    { place: "Dans un lycée de 100 élèves", rA: "filles", rB: "garçons", dA: "sont demi-pensionnaires", dB: "sont demi-pensionnaires", unit: "élève", ce: "cet élève", units: "élèves", les2: "une fille demi-pensionnaire", un: "demi-pensionnaire", elle: "demi-pensionnaire" },
    { place: "Un magasin interroge 100 clients", rA: "femmes", rB: "hommes", dA: "sont abonnées à la newsletter", dB: "sont abonnés à la newsletter", unit: "client", ce: "ce client", units: "clients", les2: "une femme abonnée à la newsletter", un: "abonné à la newsletter", elle: "abonnée à la newsletter" },
    { place: "Une entreprise compte 100 salariés", rA: "salariés à temps plein", rB: "salariés à temps partiel", dA: "sont formés au numérique", dB: "sont formés au numérique", unit: "salarié", ce: "ce salarié", units: "salariés", les2: "un salarié à temps plein formé au numérique", un: "formé au numérique", elle: "formée au numérique" }
  ];
  var cellFor = function(total, R){
    if(total === 40) return 4 * R.int(2, 8);
    if(total === 50) return 5 * R.int(2, 8);
    return 6 * R.int(2, 8);
  };
  var descTab = function(ctx, F, a1, c1){
    return ctx.place + " :\n- " + F + " " + ctx.rA + ", dont " + a1 + " " + ctx.dA + "\n- " + (100 - F) + " " + ctx.rB + ", dont " + c1 + " " + ctx.dB + ".";
  };
  SKILLS.push({
    id: 'p4-08-probas-conditionnelles',
    phase: 4,
    ordre: 9,
    titre: "Probabilités conditionnelles",
    objectif: "Lire P(A ∩ B) et P_A(B) dans un tableau croisé, et multiplier le long des branches d'un arbre pondéré.",
    lecon: `<p class="lede">« Sachant que » : deux petits mots qui changent tout. Une probabilité conditionnelle, c'est une probabilité calculée <mark>en réduisant l'univers</mark> à un groupe précis. Notation : P<sub>A</sub>(B) = probabilité de B <b>sachant</b> A.</p>
<div class="etapes">
<p><b>Exemple complet (tableau).</b> Un lycée compte 100 élèves : 60 filles dont 24 demi-pensionnaires, et 40 garçons dont 26 demi-pensionnaires. On choisit un élève au hasard.</p>
<p><b>Étape 1.</b> P(F ∩ DP) = probabilité d'être une fille ET demi-pensionnaire. Je prends la case sur le total général : 24 ÷ 100 = <b>0,24</b>.</p>
<p><b>Étape 2.</b> P<sub>F</sub>(DP) = probabilité d'être demi-pensionnaire SACHANT que c'est une fille. L'univers se réduit aux 60 filles : 24 ÷ 60 = <b>0,4</b>.</p>
<p><b>Étape 3.</b> Je compare : même case 24, mais deux dénominateurs différents. C'est toute la différence entre ∩ et « sachant que ».</p>
</div>
<p>Avec un <b>arbre pondéré</b>, chaque branche porte une probabilité. La règle d'or : <mark>on multiplie le long d'un chemin</mark> : P(A ∩ B) = P(A) × P<sub>A</sub>(B). Par exemple, si 30 % des salariés sont cadres et que 60 % des cadres télétravaillent, alors P(cadre ∩ télétravail) = 0,3 × 0,6 = 0,18.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p><mark>P(A ∩ B) = case ÷ total général. P<sub>A</sub>(B) = case ÷ total de la ligne A.</mark> Et dans un arbre : P(A ∩ B) = P(A) × P<sub>A</sub>(B).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Repère qui vient après « sachant que » (ou « parmi les… ») : c'est LUI le dénominateur. « Parmi les filles » → on divise par l'effectif des filles.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Ne confonds jamais P(A ∩ B) et P<sub>A</sub>(B) : dans l'exemple, 0,24 et 0,4. Même numérateur, univers différent — et l'ordre compte aussi : P<sub>A</sub>(B) ≠ P<sub>B</sub>(A) en général.</p></div>`,
    gen(level, R){
      var ctx = R.pick(P8CTX);
      var F = R.pick([40, 50, 60]);
      var a1 = cellFor(F, R);
      var c1 = cellFor(100 - F, R);
      if(level === 1){
        var inter = R.pick([true, false]);
        if(inter){
          var pa = r2(a1 / 100);
          return {
            q: descTab(ctx, F, a1, c1) + "\nOn choisit un " + ctx.unit + " au hasard. Quelle est la probabilité que ce soit " + ctx.les2 + " ? (réponse décimale)",
            a: String(pa),
            accept: [a1 + "/100", String(pa).replace('.', ',')],
            choix: null,
            pct: true,
            expl: "C'est P(A ∩ B) : la case (" + a1 + ") divisée par le total général (100), soit " + fr(pa) + "."
          };
        }
        var pc = r2((a1 + c1) / 100);
        return {
          q: descTab(ctx, F, a1, c1) + "\nOn choisit un " + ctx.unit + " au hasard. Quelle est la probabilité que " + ctx.ce + " soit " + ctx.un + " ? (réponse décimale)",
          a: String(pc),
          accept: [(a1 + c1) + "/100", String(pc).replace('.', ',')],
          choix: null,
          pct: true,
          expl: "Au total, " + a1 + " + " + c1 + " = " + (a1 + c1) + " " + ctx.units + " sur 100 " + ctx.dB + ", soit une probabilité de " + fr(pc) + "."
        };
      }
      if(level === 2){
        var surA = R.pick([true, false]);
        var eff = surA ? F : (100 - F);
        var cell = surA ? a1 : c1;
        var grp = surA ? ctx.rA : ctx.rB;
        var pcond = r2(cell / eff);
        return {
          q: descTab(ctx, F, a1, c1) + "\nOn choisit une personne au hasard PARMI les " + grp + ". Quelle est la probabilité qu'elle soit " + ctx.elle + " ? (probabilité conditionnelle, réponse décimale)",
          a: String(pcond),
          accept: [cell + "/" + eff, String(pcond).replace('.', ',')],
          choix: null,
          pct: true,
          expl: "« Parmi les " + grp + " » : l'univers se réduit à " + eff + " personnes. P = " + cell + " ÷ " + eff + " = " + fr(pcond) + "."
        };
      }
      var v = R.int(1, 3);
      if(v === 1){
        var k = R.int(1, 9), m = R.int(1, 9);
        var prod = r2(k * m / 100);
        return {
          q: "Dans une entreprise, " + (k * 10) + " % des salariés sont des cadres. Parmi les cadres, " + (m * 10) + " % pratiquent le télétravail. On choisit un salarié au hasard. Quelle est la probabilité que ce soit un cadre qui télétravaille ? (réponse décimale)",
          a: String(prod),
          accept: [String(prod).replace('.', ',')],
          choix: null,
          pct: true,
          expl: "Sur l'arbre, on multiplie le long du chemin : P(C ∩ T) = " + fr(k / 10) + " × " + fr(m / 10) + " = " + fr(prod) + "."
        };
      }
      if(v === 2){
        var k2 = R.int(2, 8), m2 = R.int(1, 9);
        var pab = r2(k2 * m2 / 100);
        var rep = r2(m2 / 10);
        return {
          q: "On sait que P(A) = " + fr(k2 / 10) + " et P(A ∩ B) = " + fr(pab) + ". Calcule la probabilité conditionnelle P_A(B). (réponse décimale)",
          a: String(rep),
          accept: [String(rep).replace('.', ',')],
          choix: null,
          pct: true,
          expl: "P_A(B) = P(A ∩ B) ÷ P(A) = " + fr(pab) + " ÷ " + fr(k2 / 10) + " = " + fr(rep) + "."
        };
      }
      var k3 = R.int(2, 8), m3 = R.int(1, 9), j3 = R.int(1, 9);
      if(j3 === m3) j3 = (m3 % 9) + 1;
      var tot = r2((k3 * m3 + (10 - k3) * j3) / 100);
      return {
        q: "Dans un lycée, " + (k3 * 10) + " % des élèves sont en STMG. Parmi les élèves de STMG, " + (m3 * 10) + " % font l'option théâtre ; parmi les autres élèves, " + (j3 * 10) + " % la font. On choisit un élève au hasard. Quelle est la probabilité qu'il fasse l'option théâtre ? (réponse décimale)",
        a: String(tot),
        accept: [String(tot).replace('.', ',')],
        choix: null,
        pct: true,
        expl: "On additionne les deux chemins de l'arbre : " + fr(k3 / 10) + " × " + fr(m3 / 10) + " + " + fr((10 - k3) / 10) + " × " + fr(j3 / 10) + " = " + fr(tot) + "."
      };
    }
  });

  // =====================================================================
  // p4-09 — Automatismes de première
  // =====================================================================
  SKILLS.push({
    id: 'p4-09-automatismes',
    phase: 4,
    ordre: 10,
    titre: "Automatismes de première",
    objectif: "Répondre vite et juste, sans calculatrice, sur les réflexes de première : %, fractions, équations, dérivées, suites.",
    lecon: `<p class="lede">Au bac STMG comme aux concours SESAME et ACCÈS, une partie entière se joue <mark>sans calculatrice et contre la montre</mark>. Ici, on ne découvre rien : on transforme tout ce que tu sais en réflexes.</p>
<p>Les cinq familles à automatiser : les <b>pourcentages</b> (10 % = ÷10, 25 % = ÷4, hausse de t % = ×(1 + t ÷ 100)) ; les <b>fractions</b> (simplifier, prendre une fraction d'un nombre) ; les <b>équations</b> du type ax + b = c ; les <b>dérivées</b> usuelles (x² → 2x, x³ → 3x², une constante → 0) ; et les <b>suites</b> (u(n) = u(0) + n × r ou u(0) × qⁿ).</p>
<div class="etapes">
<p><b>Exemple complet (méthode des 10 %).</b> Calculer 30 % de 250 de tête.</p>
<p><b>Étape 1.</b> Je calcule d'abord 10 % : 250 ÷ 10 = 25.</p>
<p><b>Étape 2.</b> 30 % = 3 × 10 %, donc 3 × 25 = <b>75</b>.</p>
<p><b>Étape 3.</b> Je vérifie l'ordre de grandeur : 30 % c'est un peu moins du tiers de 250 (≈ 83). 75 est cohérent.</p>
</div>
<table class="tbl"><tr><th>Je vois…</th><th>Réflexe</th></tr><tr><td>+ 30 %</td><td>× 1,3</td></tr><tr><td>− 15 %</td><td>× 0,85</td></tr><tr><td>f(x) = x² + 7</td><td>f′(x) = 2x</td></tr><tr><td>3x = 21</td><td>x = 21 ÷ 3</td></tr><tr><td>suite +r répété</td><td>u(0) + n × r</td></tr></table>
<div class="box retenir"><p class="box-t">À retenir</p><p>Un automatisme = <mark>moins de 20 secondes, sans calculatrice</mark>. Si une question te prend une minute, retravaille la fiche correspondante : la vitesse vient de la méthode, pas du talent.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Toujours vérifier l'ordre de grandeur en 2 secondes : une baisse doit donner moins, 3/4 d'un nombre doit donner presque le nombre entier. Ça élimine 80 % des erreurs d'inattention.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Les deux erreurs classiques du chrono : additionner des % d'évolutions successives, et oublier que la dérivée d'une constante vaut 0.</p></div>`,
    gen(level, R){
      var t, N, x0;
      if(level === 1){
        var v = R.int(1, 6);
        if(v === 1){
          t = R.pick([10, 25, 50]);
          if(t === 10) N = R.pick([40, 70, 120, 250, 300]);
          else if(t === 25) N = R.pick([40, 80, 120, 200, 240]);
          else N = R.pick([30, 48, 60, 84, 120]);
          return { q: "Calcule de tête : " + t + " % de " + N + ".", a: String(N * t / 100), accept: null, choix: null,
            expl: t + " % de " + N + " = " + N + " × " + fr(t / 100) + " = " + (N * t / 100) + "." };
        }
        if(v === 2){
          var fp = R.pick([["6/8", "3/4"], ["10/15", "2/3"], ["4/12", "1/3"], ["9/12", "3/4"], ["8/20", "2/5"], ["6/9", "2/3"], ["15/20", "3/4"], ["12/16", "3/4"]]);
          return { q: "Simplifie au maximum la fraction " + fp[0] + ".", a: fp[1], accept: null, choix: null,
            expl: fp[0] + " = " + fp[1] + " après division du numérateur et du dénominateur par leur plus grand diviseur commun." };
        }
        if(v === 3){
          x0 = R.int(2, 12);
          var b1 = R.int(2, 15);
          return { q: "Résous de tête : x + " + b1 + " = " + (x0 + b1) + ".", a: String(x0), accept: ["x = " + x0], choix: null,
            expl: "x = " + (x0 + b1) + " − " + b1 + " = " + x0 + "." };
        }
        if(v === 4){
          var k1 = R.pick([2, 3, 5]);
          x0 = R.int(2, 12);
          return { q: "Résous de tête : " + k1 + "x = " + (k1 * x0) + ".", a: String(x0), accept: ["x = " + x0], choix: null,
            expl: "x = " + (k1 * x0) + " ÷ " + k1 + " = " + x0 + "." };
        }
        if(v === 5){
          var cst = R.int(1, 9);
          return { q: "Quelle est la dérivée de f(x) = x² + " + cst + " ?", a: "2x", accept: null,
            choix: ["2x", "2x + " + cst, "x", "x + " + cst],
            expl: "La dérivée de x² est 2x, et celle de la constante " + cst + " est 0. Donc f'(x) = 2x." };
        }
        var s = R.int(2, 15), r = R.pick([2, 3, 4, 5, 10]);
        return { q: "Suite arithmétique : " + s + " ; " + (s + r) + " ; " + (s + 2 * r) + " ; … Quel est le terme suivant ?", a: String(s + 3 * r), accept: null, choix: null,
          expl: "On ajoute toujours " + r + " : " + (s + 2 * r) + " + " + r + " = " + (s + 3 * r) + "." };
      }
      if(level === 2){
        var w = R.int(1, 6);
        if(w === 1){
          t = R.pick([5, 15, 20, 30]);
          N = R.pick([40, 60, 80, 140, 220, 300]);
          return { q: "Calcule de tête : " + t + " % de " + N + ".", a: String(N * t / 100), accept: null, choix: null,
            expl: "10 % de " + N + " = " + (N / 10) + ". Donc " + t + " % = " + (N * t / 100) + " (méthode des 10 %)." };
        }
        if(w === 2){
          var fq = R.pick([[3, 4, 60], [2, 3, 90], [3, 5, 45], [2, 5, 80], [3, 4, 120], [7, 10, 90], [4, 5, 60], [1, 3, 96], [5, 6, 42], [2, 3, 120]]);
          return { q: "Calcule : " + fq[0] + "/" + fq[1] + " de " + fq[2] + ".", a: String(fq[0] * fq[2] / fq[1]), accept: null, choix: null,
            expl: fq[2] + " ÷ " + fq[1] + " = " + (fq[2] / fq[1]) + ", puis × " + fq[0] + " = " + (fq[0] * fq[2] / fq[1]) + "." };
        }
        if(w === 3){
          x0 = R.int(-6, 10);
          var a2 = R.pick([2, 3, 4, 5, 7]);
          var b2 = R.int(-9, 12);
          if(b2 === 0) b2 = 13;
          return { q: "Résous : " + a2 + "x " + pm(b2) + " = " + sg(a2 * x0 + b2) + ".", a: String(x0), accept: ["x = " + x0], choix: null,
            expl: a2 + "x = " + sg(a2 * x0) + ", donc x = " + sg(a2 * x0) + " ÷ " + a2 + " = " + sg(x0) + "." };
        }
        if(w === 4){
          var A = R.int(1, 4), B = R.int(-5, 8), xd = R.int(-3, 4);
          var fx = (A === 1 ? "x²" : A + "x²") + (B === 0 ? "" : " " + (B < 0 ? "−" : "+") + " " + (Math.abs(B) === 1 ? "" : Math.abs(B)) + "x");
          var cstB = B === 0 ? "" : " " + pm(B);
          return { q: "Soit f(x) = " + fx + ". Calcule f'(" + sg(xd) + ").", a: String(2 * A * xd + B), accept: null, choix: null,
            expl: "f'(x) = " + (2 * A) + "x" + cstB + ", donc f'(" + sg(xd) + ") = " + (2 * A) + " × " + pn(xd) + cstB + " = " + sg(2 * A * xd + B) + "." };
        }
        if(w === 5){
          var g = R.int(2, 6), qg = R.pick([2, 3]);
          return { q: "Suite géométrique : " + g + " ; " + (g * qg) + " ; " + (g * qg * qg) + " ; … Quel est le terme suivant ?", a: String(g * qg * qg * qg), accept: null, choix: null,
            expl: "On multiplie toujours par " + qg + " : " + (g * qg * qg) + " × " + qg + " = " + (g * qg * qg * qg) + "." };
        }
        var V = R.pick([40, 60, 80, 100, 200]);
        t = R.pick([10, 20, 25, 50, -20, -25, -50]);
        var V2 = V + V * t / 100;
        return { q: "Le prix passe de " + V + " € à " + V2 + " €. Quel est le taux d'évolution en % ? (signe − si baisse)", a: String(t), accept: [t + "%", t + " %"], choix: null,
          expl: "t = (" + V2 + " − " + V + ") ÷ " + V + " = " + fr((V2 - V) / V) + ", soit " + sg(t) + " %." };
      }
      var z = R.int(1, 6);
      if(z === 1){
        N = R.pick([40, 60, 80, 120, 200]);
        t = R.pick([10, 20, 25, 30, 50]);
        var up = R.pick([true, false]);
        var res = up ? N + N * t / 100 : N - N * t / 100;
        return { q: "Un prix de " + N + " € " + (up ? "augmente" : "baisse") + " de " + t + " %. Quel est le nouveau prix (en €) ?", a: String(res), accept: [res + " €"], choix: null,
          expl: N + " × " + fr(up ? 1 + t / 100 : 1 - t / 100) + " = " + res + " €." };
      }
      if(z === 2){
        var fa = R.pick([["1/2", "1/4", "3/4", "0.75"], ["1/3", "1/6", "1/2", "0.5"], ["1/2", "1/3", "5/6", null], ["3/4", "1/8", "7/8", null], ["2/5", "1/5", "3/5", "0.6"], ["1/4", "1/2", "3/4", "0.75"]]);
        return { q: "Calcule : " + fa[0] + " + " + fa[1] + " (réponse en fraction irréductible).", a: fa[2], accept: fa[3] ? [fa[3], fa[3].replace('.', ',')] : null, choix: null,
          expl: "On met au même dénominateur avant d'additionner : " + fa[0] + " + " + fa[1] + " = " + fa[2] + "." };
      }
      if(z === 3){
        x0 = R.int(-5, 8);
        var a3 = R.pick([3, 4, 5, 7]);
        var c3 = R.pick([1, 2]);
        var b3 = R.int(-8, 10);
        var d3 = b3 + (a3 - c3) * x0;
        var gch3 = a3 + "x" + (b3 === 0 ? "" : " " + pm(b3));
        var drt3 = (c3 === 1 ? "x" : c3 + "x") + (d3 === 0 ? "" : " " + pm(d3));
        return { q: "Résous : " + gch3 + " = " + drt3 + ".", a: String(x0), accept: ["x = " + x0], choix: null,
          expl: "On regroupe les x à gauche et les nombres à droite : " + (a3 - c3 === 1 ? "" : (a3 - c3)) + "x = " + sg(d3 - b3) + (a3 - c3 === 1 ? "." : ", donc x = " + sg(x0) + ".") };
      }
      if(z === 4){
        var A4 = R.int(1, 3);
        var x4 = R.pick([-2, -1, 1, 2, 3]);
        return { q: "Soit f(x) = " + (A4 === 1 ? "" : A4) + "x³. Calcule f'(" + sg(x4) + ").", a: String(3 * A4 * x4 * x4), accept: null, choix: null,
          expl: "f'(x) = " + (3 * A4) + "x², donc f'(" + sg(x4) + ") = " + (3 * A4) + " × " + pn(x4) + "² = " + (3 * A4) + " × " + (x4 * x4) + " = " + (3 * A4 * x4 * x4) + "." };
      }
      if(z === 5){
        var u0 = R.int(2, 9), r5 = R.pick([3, 4, 5, 7]);
        return { q: "Suite arithmétique : u(0) = " + u0 + " et r = " + r5 + ". Calcule u(10) de tête.", a: String(u0 + 10 * r5), accept: null, choix: null,
          expl: "u(10) = " + u0 + " + 10 × " + r5 + " = " + u0 + " + " + (10 * r5) + " = " + (u0 + 10 * r5) + "." };
      }
      var rp = R.pick([[25, -20], [100, -50], [-50, 100], [-20, 25]]);
      return { q: "Après une évolution de " + (rp[0] > 0 ? "+" + rp[0] : sg(rp[0])) + " %, quel taux (en %) ramène au prix initial ?", a: String(rp[1]), accept: [rp[1] + "%", rp[1] + " %"], choix: null,
        expl: "On inverse le coefficient : 1 ÷ " + fr(r2(1 + rp[0] / 100)) + " = " + fr(r2(1 / (1 + rp[0] / 100))) + ", soit " + (rp[1] > 0 ? "+" + rp[1] : sg(rp[1])) + " %." };
    }
  });

})();
