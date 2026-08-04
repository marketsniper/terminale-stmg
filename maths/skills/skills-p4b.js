/* Phase 4 — Première STMG (fin) : compétences 4 à 9 */
(function(){

  // ---------- Helpers internes ----------
  var fr = function(x){ return String(x).replace('.', ','); };
  var r2 = function(x){ return Math.round(x * 100) / 100; };
  var pm = function(n){ return (n < 0 ? '− ' : '+ ') + Math.abs(n); };

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
            q: "Sur l'intervalle [" + a1 + " ; " + b1 + "], on sait que f'(x) " + (pos ? "> 0" : "< 0") + " pour tout x. Que peut-on dire de f sur cet intervalle ?",
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
            q: "On sait que f est " + (croiss ? "croissante" : "décroissante") + " sur [" + a2 + " ; " + b2 + "]. Quel est le signe de f'(x) sur cet intervalle ?",
            a: croiss ? "f'(x) ≥ 0" : "f'(x) ≤ 0",
            accept: null,
            choix: ["f'(x) ≥ 0", "f'(x) ≤ 0", "f'(x) = 0 partout", "On ne peut pas conclure"],
            expl: "C'est la règle dans l'autre sens : f " + (croiss ? "croissante" : "décroissante") + " correspond à une dérivée " + (croiss ? "positive ou nulle" : "négative ou nulle") + "."
          };
        }
        var c = R.int(-3, 4);
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
          var x0 = -b / 2;
          return {
            q: "On considère f(x) = x² " + pm(b) + "x " + pm(cc) + ". Calcule f'(x), puis la valeur de x pour laquelle f'(x) = 0.",
            a: String(x0),
            accept: ["x = " + x0],
            choix: null,
            expl: "f'(x) = 2x " + pm(b) + ". On résout 2x " + pm(b) + " = 0, ce qui donne x = " + x0 + "."
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
          expl: "On résout " + fp + " = 0 : x = " + x1 + ". C'est en cette valeur que f' s'annule."
        };
      }
      var mm = R.int(1, 5);
      var c3 = R.int(-6, 9);
      var t = R.int(1, 3);
      if(t === 1){
        var val = c3 - mm * mm;
        return {
          q: "Soit f(x) = x² − " + (2 * mm) + "x " + pm(c3) + ". Sa dérivée est f'(x) = 2x − " + (2 * mm) + ". Détermine la VALEUR du minimum de f.",
          a: String(val),
          accept: null,
          choix: null,
          expl: "f' s'annule en x = " + mm + " (signe − puis +, donc minimum). Le minimum vaut f(" + mm + ") = " + (mm * mm) + " − " + (2 * mm * mm) + " " + pm(c3) + " = " + val + "."
        };
      }
      if(t === 2){
        var val2 = mm * mm + c3;
        return {
          q: "Soit f(x) = −x² + " + (2 * mm) + "x " + pm(c3) + ". Sa dérivée est f'(x) = −2x + " + (2 * mm) + ". Détermine la VALEUR du maximum de f.",
          a: String(val2),
          accept: null,
          choix: null,
          expl: "f' s'annule en x = " + mm + " (signe + puis −, donc maximum). Le maximum vaut f(" + mm + ") = −" + (mm * mm) + " + " + (2 * mm * mm) + " " + pm(c3) + " = " + val2 + "."
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
    objectif: "Reconnaître une suite arithmétique, utiliser u(n) = u(0) + n × r et calculer n'importe quel terme.",
    lecon: `<p class="lede">Une suite arithmétique, c'est une suite où l'on <mark>ajoute toujours le même nombre</mark> pour passer d'un terme au suivant. Ce nombre s'appelle la <b>raison</b>, notée r.</p>
<p>Deux formules à connaître. La relation de proche en proche : u(n+1) = u(n) + r. Et surtout la <b>formule directe</b>, qui évite de calculer tous les termes un par un : <mark>u(n) = u(0) + n × r</mark>.</p>
<div class="etapes">
<p><b>Exemple complet (épargne).</b> Tu as 50 € dans une tirelire et tu ajoutes 20 € chaque mois. Le montant après n mois forme une suite arithmétique.</p>
<p><b>Étape 1.</b> J'identifie : premier terme u(0) = 50 et raison r = 20 (on ajoute toujours 20).</p>
<p><b>Étape 2.</b> De proche en proche : u(1) = 50 + 20 = 70, puis u(2) = 70 + 20 = 90. Ça marche, mais c'est long pour 12 mois !</p>
<p><b>Étape 3.</b> Formule directe : u(12) = u(0) + 12 × r = 50 + 12 × 20 = 50 + 240 = <b>290 €</b>. Un seul calcul.</p>
</div>
<p>Pour <b>reconnaître</b> une suite arithmétique : calcule les différences entre termes consécutifs. Si elles sont toutes égales, c'est gagné. Exemple : 7 ; 12 ; 17 ; 22 → différence toujours 5, arithmétique de raison 5. En revanche 2 ; 4 ; 8 ; 16 (différences 2, 4, 8) n'est pas arithmétique.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p><mark>u(n) = u(0) + n × r</mark>. La raison r peut être négative : la suite décroît alors à chaque étape (par exemple un stock qui perd 30 unités par semaine).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour trouver r quand on connaît deux termes éloignés : r = (u(n) − u(0)) ÷ n. C'est l'écart total divisé par le nombre de sauts.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Le n de la formule compte les sauts depuis u(0). Si l'énoncé démarre à u(1), la formule devient u(n) = u(1) + (n − 1) × r. Regarde toujours d'où part la suite !</p></div>`,
    gen(level, R){
      if(level === 1){
        var v = R.int(1, 3);
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
            q: "Voici les premiers termes d'une suite arithmétique : " + s + " ; " + (s + rr) + " ; " + (s + 2 * rr) + " ; … Quelle est sa raison ?",
            a: String(rr),
            accept: ["r = " + rr],
            choix: null,
            expl: "On passe d'un terme au suivant en ajoutant toujours " + rr + " : la raison est r = " + rr + "."
          };
        }
        return {
          q: "Suite arithmétique : " + s + " ; " + (s + rr) + " ; " + (s + 2 * rr) + " ; … Quel est le terme suivant ?",
          a: String(s + 3 * rr),
          accept: null,
          choix: null,
          expl: "La raison est " + rr + " (différence constante). Terme suivant : " + (s + 2 * rr) + " " + (rr < 0 ? "− " + (-rr) : "+ " + rr) + " = " + (s + 3 * rr) + "."
        };
      }
      if(level === 2){
        var w = R.int(1, 2);
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
          q: "u est une suite arithmétique de premier terme u(0) = " + u03 + " et de raison r = " + r3 + ". Calcule u(" + n3 + ").",
          a: String(u03 + n3 * r3),
          accept: null,
          choix: null,
          expl: "Formule directe : u(" + n3 + ") = u(0) + " + n3 + " × r = " + u03 + " + " + n3 + " × (" + r3 + ") = " + (u03 + n3 * r3) + "."
        };
      }
      var v3 = R.int(1, 3);
      if(v3 === 1){
        var rE = R.pick([2, 3, 5, 7, -2, -3, -4]);
        var nE = R.pick([10, 20, 25]);
        var u0E = R.int(-5, 10);
        var unE = u0E + nE * rE;
        return {
          q: "La suite u est arithmétique. On sait que u(0) = " + u0E + " et u(" + nE + ") = " + unE + ". Quelle est sa raison r ?",
          a: String(rE),
          accept: ["r = " + rE],
          choix: null,
          expl: "r = (u(" + nE + ") − u(0)) ÷ " + nE + " = (" + unE + " − " + u0E + ") ÷ " + nE + " = " + rE + "."
        };
      }
      if(v3 === 2){
        var rF = R.pick([2, 3, 4, 5, -2, -3]);
        var nF = R.pick([10, 15, 20]);
        var u0F = R.int(-8, 15);
        var unF = u0F + nF * rF;
        return {
          q: "u est arithmétique de raison r = " + rF + ", et u(" + nF + ") = " + unF + ". Calcule le premier terme u(0).",
          a: String(u0F),
          accept: null,
          choix: null,
          expl: "u(0) = u(" + nF + ") − " + nF + " × r = " + unF + " − " + nF + " × (" + rF + ") = " + u0F + "."
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
    objectif: "Utiliser u(n) = u(0) × qⁿ et faire le lien entre raison et évolutions en pourcentage répétées.",
    lecon: `<p class="lede">Une suite géométrique, c'est une suite où l'on <mark>multiplie toujours par le même nombre</mark> pour passer au terme suivant. Ce nombre est la <b>raison</b> q. C'est LA suite des placements, des hausses de prix et des évolutions en %.</p>
<p>Relation de proche en proche : u(n+1) = u(n) × q. Formule directe : <mark>u(n) = u(0) × q<sup>n</sup></mark>.</p>
<p>Le lien avec les pourcentages est essentiel en STMG : <mark>augmenter de 5 % chaque année, c'est multiplier par 1,05 chaque année</mark>. Les valeurs successives forment donc une suite géométrique de raison 1,05.</p>
<table class="tbl"><tr><th>Évolution répétée</th><th>Raison q</th></tr><tr><td>+ 5 % par an</td><td>1,05</td></tr><tr><td>+ 20 % par an</td><td>1,2</td></tr><tr><td>− 10 % par an</td><td>0,9</td></tr><tr><td>− 25 % par an</td><td>0,75</td></tr></table>
<div class="etapes">
<p><b>Exemple complet.</b> Tu places 1 000 € à 10 % par an. Que possèdes-tu après 3 ans ?</p>
<p><b>Étape 1.</b> Chaque année, le capital est multiplié par 1 + 10 ÷ 100 = 1,1. Donc u(0) = 1000 et q = 1,1.</p>
<p><b>Étape 2.</b> De proche en proche : u(1) = 1000 × 1,1 = 1100, puis u(2) = 1100 × 1,1 = 1210.</p>
<p><b>Étape 3.</b> Formule directe pour aller vite : u(3) = 1000 × 1,1³ = 1000 × 1,331 = <b>1 331 €</b>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p><mark>u(n) = u(0) × q<sup>n</sup></mark>. Si q &gt; 1, la suite croît (hausse répétée) ; si 0 &lt; q &lt; 1, elle décroît (baisse répétée). Pour trouver q : divise un terme par le précédent.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Évolution de t % répétée → raison q = 1 + t ÷ 100 pour une hausse, q = 1 − t ÷ 100 pour une baisse. Écris toujours cette conversion avant tout calcul.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Pour « + 5 % par an », la raison n'est ni 5 ni 0,05 : c'est <mark>1,05</mark>. Multiplier par 0,05, ce serait diviser le capital par 20 !</p></div>`,
    gen(level, R){
      if(level === 1){
        var v = R.int(1, 3);
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
        var w = R.int(1, 2);
        if(w === 1){
          var q3 = R.pick([2, 3, 10]);
          var n3, u04;
          if(q3 === 2){ n3 = R.int(3, 6); u04 = R.int(2, 7); }
          else if(q3 === 3){ n3 = R.int(2, 4); u04 = R.int(2, 5); }
          else { n3 = R.int(2, 3); u04 = R.int(2, 9); }
          var a3 = u04 * Math.pow(q3, n3);
          return {
            q: "u est géométrique avec u(0) = " + u04 + " et q = " + q3 + ". Calcule u(" + n3 + ") à l'aide de la formule u(n) = u(0) × q^n.",
            a: String(a3),
            accept: null,
            choix: null,
            expl: "u(" + n3 + ") = " + u04 + " × " + q3 + "^" + n3 + " = " + u04 + " × " + Math.pow(q3, n3) + " = " + a3 + "."
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
          expl: "u(" + n4 + ") = " + u05 + " × 0,5^" + n4 + " = " + u05 + " ÷ " + Math.pow(2, n4) + " = " + fr(a4) + "."
        };
      }
      var v3 = R.int(1, 4);
      if(v3 === 1){
        var t = R.pick([2, 5, 10, 20, 50]);
        var ok = String(r2(1 + t / 100));
        return {
          q: "Un prix augmente de " + t + " % chaque année. Les prix successifs forment une suite géométrique. Quelle est sa raison ?",
          a: ok,
          accept: null,
          choix: [ok, String(r2(t / 100)), String(r2(1 + t / 10)), String(t)],
          expl: "Augmenter de " + t + " % revient à multiplier par 1 + " + t + " ÷ 100 = " + fr(1 + t / 100) + " : c'est la raison de la suite."
        };
      }
      if(v3 === 2){
        var t2 = R.pick([5, 10, 20, 25, 40]);
        var ok2 = String(r2(1 - t2 / 100));
        return {
          q: "Un stock diminue de " + t2 + " % chaque mois. Les quantités successives forment une suite géométrique. Quelle est sa raison ?",
          a: ok2,
          accept: null,
          choix: [ok2, String(r2(t2 / 100)), String(r2(1 + t2 / 100)), "-" + String(r2(t2 / 100))],
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
          expl: "Chaque année on multiplie par " + fr(qc) + ". Valeur finale : " + C0 + " × " + fr(qc) + "^" + nc + " = " + fr(res) + " €."
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
        expl: "u(" + n6 + ") = " + u06 + " × 2^" + n6 + " = " + u06 + " × " + Math.pow(2, n6) + " = " + a6 + "."
      };
    }
  });

  // =====================================================================
  // p4-07 — Taux d'évolution et indices
  // =====================================================================
  SKILLS.push({
    id: 'p4-07-taux-indices',
    phase: 4,
    ordre: 7,
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
              expl: "t = (" + V2 + " − " + V + ") ÷ " + V + " = " + fr((V2 - V) / V) + ", soit " + t + " %."
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
          expl: "CM global = " + fr(c1) + " × " + fr(c2) + " = " + fr(cg) + ", soit " + (gl >= 0 ? "+" : "") + gl + " %. On multiplie les CM, on n'additionne jamais les %."
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
          expl: "CM réciproque = 1 ÷ " + fr(cmA) + " = " + fr(r2(1 / cmA)) + ", soit " + tR + " %. On inverse le coefficient, on ne prend pas l'opposé du taux."
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
          expl: "t = (" + i2 + " − " + i1 + ") ÷ " + i1 + " = " + fr(r2((i2 - i1) / i1)) + ", soit " + ti + " %. Les indices se manipulent comme des valeurs."
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
    { place: "Dans un lycée de 100 élèves", rA: "filles", rB: "garçons", cA: "demi-pensionnaires", unit: "élève" },
    { place: "Un magasin interroge 100 clients", rA: "femmes", rB: "hommes", cA: "abonnés à la newsletter", unit: "client" },
    { place: "Une entreprise compte 100 salariés", rA: "salariés à temps plein", rB: "salariés à temps partiel", cA: "formés au numérique", unit: "salarié" }
  ];
  var cellFor = function(total, R){
    if(total === 40) return 4 * R.int(2, 8);
    if(total === 50) return 5 * R.int(2, 8);
    return 6 * R.int(2, 8);
  };
  var descTab = function(ctx, F, a1, c1){
    return ctx.place + " :\n- " + F + " " + ctx.rA + ", dont " + a1 + " sont " + ctx.cA + "\n- " + (100 - F) + " " + ctx.rB + ", dont " + c1 + " sont " + ctx.cA + ".";
  };
  SKILLS.push({
    id: 'p4-08-probas-conditionnelles',
    phase: 4,
    ordre: 8,
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
            q: descTab(ctx, F, a1, c1) + "\nOn choisit un " + ctx.unit + " au hasard. Quelle est la probabilité que la personne choisie soit à la fois « " + ctx.rA + " » et « " + ctx.cA + " » ? (réponse décimale)",
            a: String(pa),
            accept: [a1 + "/100", String(pa).replace('.', ',')],
            choix: null,
            expl: "C'est P(A ∩ B) : la case (" + a1 + ") divisée par le total général (100), soit " + fr(pa) + "."
          };
        }
        var pc = r2((a1 + c1) / 100);
        return {
          q: descTab(ctx, F, a1, c1) + "\nOn choisit un " + ctx.unit + " au hasard. Quelle est la probabilité que la personne choisie soit « " + ctx.cA + " » ? (réponse décimale)",
          a: String(pc),
          accept: [(a1 + c1) + "/100", String(pc).replace('.', ',')],
          choix: null,
          expl: "Au total, " + a1 + " + " + c1 + " = " + (a1 + c1) + " personnes sont " + ctx.cA + " sur 100, soit une probabilité de " + fr(pc) + "."
        };
      }
      if(level === 2){
        var surA = R.pick([true, false]);
        var eff = surA ? F : (100 - F);
        var cell = surA ? a1 : c1;
        var grp = surA ? ctx.rA : ctx.rB;
        var pcond = r2(cell / eff);
        return {
          q: descTab(ctx, F, a1, c1) + "\nOn choisit une personne au hasard PARMI les " + grp + ". Quelle est la probabilité qu'elle soit « " + ctx.cA + " » ? (probabilité conditionnelle, réponse décimale)",
          a: String(pcond),
          accept: [cell + "/" + eff, String(pcond).replace('.', ',')],
          choix: null,
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
          expl: "P_A(B) = P(A ∩ B) ÷ P(A) = " + fr(pab) + " ÷ " + fr(k2 / 10) + " = " + fr(rep) + "."
        };
      }
      var k3 = R.int(2, 8), m3 = R.int(1, 9), j3 = R.int(1, 9);
      var tot = r2((k3 * m3 + (10 - k3) * j3) / 100);
      return {
        q: "Dans un lycée, " + (k3 * 10) + " % des élèves sont en STMG. Parmi les élèves de STMG, " + (m3 * 10) + " % font l'option théâtre ; parmi les autres élèves, " + (j3 * 10) + " % la font. On choisit un élève au hasard. Quelle est la probabilité qu'il fasse l'option théâtre ? (réponse décimale)",
        a: String(tot),
        accept: [String(tot).replace('.', ',')],
        choix: null,
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
    ordre: 9,
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
          return { q: "Résous : " + a2 + "x " + pm(b2) + " = " + (a2 * x0 + b2) + ".", a: String(x0), accept: ["x = " + x0], choix: null,
            expl: a2 + "x = " + (a2 * x0) + ", donc x = " + (a2 * x0) + " ÷ " + a2 + " = " + x0 + "." };
        }
        if(w === 4){
          var A = R.int(1, 4), B = R.int(-5, 8), xd = R.int(-3, 4);
          var fx = (A === 1 ? "x²" : A + "x²") + " " + pm(B) + "x";
          return { q: "Soit f(x) = " + fx + ". Calcule f'(" + xd + ").", a: String(2 * A * xd + B), accept: null, choix: null,
            expl: "f'(x) = " + (2 * A) + "x " + pm(B) + ", donc f'(" + xd + ") = " + (2 * A) + " × (" + xd + ") " + pm(B) + " = " + (2 * A * xd + B) + "." };
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
          expl: "t = (" + V2 + " − " + V + ") ÷ " + V + " = " + fr((V2 - V) / V) + ", soit " + t + " %." };
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
        return { q: "Résous : " + a3 + "x " + pm(b3) + " = " + c3 + "x " + pm(d3) + ".", a: String(x0), accept: ["x = " + x0], choix: null,
          expl: "On regroupe les x : " + (a3 - c3) + "x = " + (d3 - b3) + ", donc x = " + x0 + "." };
      }
      if(z === 4){
        var A4 = R.int(1, 3);
        var x4 = R.pick([-2, -1, 1, 2, 3]);
        return { q: "Soit f(x) = " + (A4 === 1 ? "" : A4) + "x³. Calcule f'(" + x4 + ").", a: String(3 * A4 * x4 * x4), accept: null, choix: null,
          expl: "f'(x) = " + (3 * A4) + "x², donc f'(" + x4 + ") = " + (3 * A4) + " × " + (x4 * x4) + " = " + (3 * A4 * x4 * x4) + "." };
      }
      if(z === 5){
        var u0 = R.int(2, 9), r5 = R.pick([3, 4, 5, 7]);
        return { q: "Suite arithmétique : u(0) = " + u0 + " et r = " + r5 + ". Calcule u(10) de tête.", a: String(u0 + 10 * r5), accept: null, choix: null,
          expl: "u(10) = " + u0 + " + 10 × " + r5 + " = " + u0 + " + " + (10 * r5) + " = " + (u0 + 10 * r5) + "." };
      }
      var rp = R.pick([[25, -20], [100, -50], [-50, 100], [-20, 25]]);
      return { q: "Après une évolution de " + (rp[0] > 0 ? "+" + rp[0] : rp[0]) + " %, quel taux (en %) ramène au prix initial ?", a: String(rp[1]), accept: [rp[1] + "%", rp[1] + " %"], choix: null,
        expl: "On inverse le coefficient : 1 ÷ " + fr(r2(1 + rp[0] / 100)) + " = " + fr(r2(1 / (1 + rp[0] / 100))) + ", soit " + rp[1] + " %." };
    }
  });

})();
