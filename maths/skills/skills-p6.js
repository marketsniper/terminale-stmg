(function(){

// ---------- Helpers communs de la phase 6 ----------
function n2(x){ return Math.round(x * 100) / 100; }
function pt(x){ return String(n2(x)); }
function fr(x){ return pt(x).replace("-", "−").replace(".", ","); }
// Construit 4 valeurs numériques distinctes : la bonne réponse + des distracteurs,
// complétés si besoin par des valeurs proches (boucles for bornées, jamais de while).
function quatre(a, cands){
  var out = [n2(a)];
  for (var i = 0; i < cands.length && out.length < 4; i++){
    var c = n2(cands[i]);
    if (out.indexOf(c) === -1) out.push(c);
  }
  for (var k = 1; out.length < 4 && k <= 60; k++){
    var c1 = n2(a + k);
    if (out.indexOf(c1) === -1) out.push(c1);
    if (out.length < 4){
      var c2 = n2(a - k);
      if (out.indexOf(c2) === -1) out.push(c2);
    }
  }
  return out;
}
function pcf(x){ return (x > 0 ? "+" : "") + fr(x) + " %"; }

// ====================================================================
// p6-01 — QCM blanc type ACCÈS
// ====================================================================
SKILLS.push({
  id: 'p6-01-blanc-acces',
  phase: 6,
  ordre: 1,
  titre: 'QCM blanc type ACCÈS',
  objectif: "Enchaîner calcul, logique et petits problèmes au format QCM du concours ACCÈS, en déjouant les distracteurs.",
  lecon: `<p class="lede">Le concours ACCÈS te propose un QCM chronométré qui mélange calcul mental, suites logiques et petits problèmes. Ici, tu t'entraînes en conditions réelles : questions variées, pièges compris.</p>
<p>À l'épreuve de raisonnement logique et mathématiques, chaque question offre plusieurs propositions, et une seule démarche gagnante : <mark>comprendre vite, calculer juste, reconnaître les pièges</mark>. Retiens bien ceci : les mauvaises réponses ne sont pas mises là au hasard. Le concepteur du sujet calcule d'avance le résultat que tu obtiens si tu commets une erreur classique… et il le place parmi les choix.</p>
<div class="etapes">
<p><b>Exemple entièrement détaillé.</b> Un article à 200 € augmente de 20 %, puis baisse de 10 %. Quelle est l'évolution globale ?</p>
<p><b>Étape 1</b> — Hausse de 20 % : 200 × 1,20 = 240 €.</p>
<p><b>Étape 2</b> — Baisse de 10 % : 240 × 0,90 = 216 €.</p>
<p><b>Étape 3</b> — De 200 à 216, la variation est de +16 €, soit 16 ÷ 200 = 0,08, donc <mark>+8 %</mark>.</p>
<p>Dans le QCM, tu trouveras presque toujours « +10 % » (le résultat de 20 − 10, l'erreur d'addition des pourcentages). Si tu vas trop vite, tu tombes exactement dans ce piège.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Un distracteur est le résultat d'une erreur classique. Retrouver « son » résultat parmi les propositions ne prouve donc rien : <mark>vérifie ton raisonnement, pas seulement la présence du nombre</mark>.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Avant de calculer, estime l'ordre de grandeur : 25 % de 240, c'est « un quart de 240 », donc autour de 60. Tu élimines déjà deux propositions. Et quand le calcul direct est long, teste les réponses proposées : partir d'une réponse et remonter l'énoncé est souvent plus rapide.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Les pourcentages ne s'additionnent jamais : +20 % puis −10 % ne font pas +10 %. On multiplie les coefficients : 1,20 × 0,90 = 1,08. C'est l'un des pièges préférés du concours.</p></div>`,
  gen(level, R){
    var t, ch, a;
    if (level === 1){
      t = R.int(1, 4);
      if (t === 1){
        var p = R.pick([5, 10, 15, 20, 25, 30, 50]);
        var N = R.pick([40, 60, 80, 120, 140, 160, 180, 200, 240, 300]);
        a = N * p / 100;
        ch = quatre(a, [N * p / 10, N - p, N * (100 - p) / 100]);
        return { q: "Combien vaut " + p + " % de " + N + " ?", a: pt(a), accept: null, choix: ch.map(pt),
          expl: p + " % de " + N + " = " + N + " × " + p + " ÷ 100 = " + pt(a) + "." };
      }
      if (t === 2){
        var u = R.int(2, 15), r = R.int(3, 9);
        a = u + 4 * r;
        ch = quatre(a, [a - 1, a + 1, a + r]);
        return { q: "Quel nombre continue la suite ?\n" + [u, u + r, u + 2 * r, u + 3 * r].join(" ; ") + " ; …",
          a: pt(a), accept: null, choix: ch.map(pt),
          expl: "On ajoute " + r + " à chaque étape : " + (u + 3 * r) + " + " + r + " = " + a + "." };
      }
      if (t === 3){
        var P = R.pick([60, 80, 120, 160, 200]);
        var pc = R.pick([10, 20, 25, 50]);
        var rem = P * pc / 100;
        a = P - rem;
        ch = quatre(a, [P - pc, rem]);
        return { q: "Un article coûte " + P + " €. Le magasin accorde une remise de " + pc + " %. Quel est le nouveau prix (en €) ?",
          a: pt(a), accept: null, choix: ch.map(pt),
          expl: "La remise vaut " + rem + " € (" + pc + " % de " + P + "), donc le prix devient " + P + " − " + rem + " = " + pt(a) + " €." };
      }
      var x = R.int(12, 19), y = R.pick([11, 12, 15, 21, 25]);
      a = x * y;
      ch = quatre(a, [x * (y + 1), (x + 1) * y, a - 10]);
      return { q: "Calcule de tête : " + x + " × " + y, a: pt(a), accept: null, choix: ch.map(pt),
        expl: x + " × " + y + " = " + x + " × " + (y - 1) + " + " + x + " = " + a + " (ou toute autre décomposition)." };
    }
    if (level === 2){
      t = R.int(1, 5);
      if (t === 1){
        var p2 = R.pick([10, 20, 25, 50]);
        var N2 = R.pick([60, 80, 120, 160, 200, 240]);
        var V2 = N2 * p2 / 100;
        ch = quatre(N2, [V2 * p2 / 100, V2 + p2, N2 / 2]);
        return { q: p2 + " % d'un nombre vaut " + V2 + ". Quel est ce nombre ?", a: pt(N2), accept: null, choix: ch.map(pt),
          expl: "Si " + p2 + " % du nombre vaut " + V2 + ", alors le nombre vaut " + V2 + " × 100 ÷ " + p2 + " = " + N2 + "." };
      }
      if (t === 2){
        var v = R.pick([60, 70, 80, 90, 100, 110]), tm = R.pick([2, 3, 4]);
        var d = v * tm;
        ch = quatre(v, [d - tm, v + 10, v - 10]);
        return { q: "Une voiture parcourt " + d + " km en " + tm + " heures. Quelle est sa vitesse moyenne (en km/h) ?",
          a: pt(v), accept: null, choix: ch.map(pt),
          expl: "Vitesse = distance ÷ temps = " + d + " ÷ " + tm + " = " + v + " km/h." };
      }
      if (t === 3){
        var u3 = R.pick([2, 3, 4, 5]), k3 = R.pick([2, 3]);
        var T2 = u3 * k3 * k3, T3 = T2 * k3;
        a = T3 * k3;
        ch = quatre(a, [2 * T3 - T2, a - k3, a + k3]);
        return { q: "Quel nombre continue la suite ?\n" + [u3, u3 * k3, T2, T3].join(" ; ") + " ; …",
          a: pt(a), accept: null, choix: ch.map(pt),
          expl: "Chaque terme est multiplié par " + k3 + " : " + T3 + " × " + k3 + " = " + a + "." };
      }
      if (t === 4){
        var m = R.int(10, 16), d1 = R.int(1, 3), d2 = R.int(1, 4);
        var notes = R.shuffle([m - d1, m + d1, m - d2, m + d2]);
        ch = quatre(m, [m - 1, m + 1, m + 2]);
        return { q: "Un candidat obtient les notes suivantes (sur 20) : " + notes.join(" ; ") + ". Quelle est sa moyenne ?",
          a: pt(m), accept: null, choix: ch.map(pt),
          expl: "Somme = " + (4 * m) + ", divisée par 4 notes : " + (4 * m) + " ÷ 4 = " + m + "." };
      }
      var f = R.pick([[3, 4], [2, 3], [3, 5], [2, 5], [5, 6]]);
      var B = f[1] * R.pick([12, 15, 20, 24, 30]);
      a = B * f[0] / f[1];
      ch = quatre(a, [B / f[1], B - a, a + f[0]]);
      return { q: "Combien valent les " + f[0] + "/" + f[1] + " de " + B + " ?", a: pt(a), accept: null, choix: ch.map(pt),
        expl: B + " ÷ " + f[1] + " = " + (B / f[1]) + ", puis × " + f[0] + " = " + pt(a) + "." };
    }
    t = R.int(1, 5);
    if (t === 1){
      var ph = R.pick([10, 20, 30, 40, 50]);
      var pb = R.pick([10, 20, 30, 40, 50].filter(function(z){ return z !== ph; }));
      var vg = ph - pb - ph * pb / 100;
      ch = quatre(vg, [ph - pb, -(ph - pb), ph - pb + ph * pb / 100]);
      return { q: "Le prix d'un article augmente de " + ph + " %, puis baisse de " + pb + " %. Quelle est l'évolution globale ?",
        a: pcf(vg), accept: null, choix: ch.map(pcf),
        expl: "On multiplie les coefficients : " + fr(1 + ph / 100) + " × " + fr(1 - pb / 100) + " = " + fr((1 + ph / 100) * (1 - pb / 100)) + ", soit " + pcf(vg) + ". Les pourcentages ne s'additionnent pas." };
    }
    if (t === 2){
      var p3 = R.pick([10, 20, 25, 50]);
      var P0 = R.pick([40, 60, 80, 120, 200]);
      var V3 = P0 * (100 + p3) / 100;
      ch = quatre(P0, [V3 * (100 - p3) / 100, V3 - p3]);
      return { q: "Après une hausse de " + p3 + " %, un article coûte " + V3 + " €. Quel était son prix avant la hausse (en €) ?",
        a: pt(P0), accept: null, choix: ch.map(pt),
        expl: "Hausse de " + p3 + " % = multiplication par " + fr(1 + p3 / 100) + ". Prix initial = " + V3 + " ÷ " + fr(1 + p3 / 100) + " = " + P0 + " €. Retirer " + p3 + " % du prix final est l'erreur classique." };
    }
    if (t === 3){
      var rt = R.pick([[2, 3], [1, 3], [3, 5], [1, 4], [3, 7]]);
      var unit = R.pick([50, 100, 200, 500]);
      var Bt = (rt[0] + rt[1]) * unit;
      a = rt[1] * unit;
      ch = quatre(a, [rt[0] * unit, Bt / 2, a + unit]);
      return { q: rt[0] === 1 ? Bt + " € sont partagés entre deux associés dans le ratio " + rt[0] + " : " + rt[1] + ". Combien reçoit celui qui a la plus grande part (en €) ?"
          : Bt + " € sont partagés entre deux associés dans le ratio " + rt[0] + " : " + rt[1] + ". Quelle est la part la plus élevée (en €) ?",
        a: pt(a), accept: null, choix: ch.map(pt),
        expl: "Il y a " + (rt[0] + rt[1]) + " parts égales de " + Bt + " ÷ " + (rt[0] + rt[1]) + " = " + unit + " €. La plus grande part vaut " + rt[1] + " × " + unit + " = " + a + " €." };
    }
    if (t === 4){
      var rob = R.pick([[3, 6], [2, 6], [4, 12], [6, 12], [10, 15], [2, 2], [4, 4], [5, 20]]);
      var x1 = rob[0], y1 = rob[1];
      a = 60 * x1 * y1 / (x1 + y1);
      ch = quatre(a, [60 * (x1 + y1) / 2, 60 * (x1 + y1), 60 * Math.min(x1, y1)]);
      return { q: "Un premier robinet remplit un bassin en " + x1 + " h, un second en " + y1 + " h. Ouverts ensemble, en combien de minutes remplissent-ils le bassin ?",
        a: pt(a), accept: null, choix: ch.map(pt),
        expl: "En 1 h, ils remplissent 1/" + x1 + " + 1/" + y1 + " du bassin. Le temps total vaut " + (x1 * y1) + " ÷ " + (x1 + y1) + " = " + fr(x1 * y1 / (x1 + y1)) + " h, soit " + pt(a) + " min." };
    }
    var e = R.int(2, 4), pl = R.int(3, 5), de = R.int(2, 4);
    a = e * pl * de;
    ch = quatre(a, [e + pl + de, e * pl + de, (e + pl) * de]);
    return { q: "Un restaurant propose " + e + " entrées, " + pl + " plats et " + de + " desserts. Combien de menus différents entrée-plat-dessert peut-on composer ?",
      a: pt(a), accept: null, choix: ch.map(pt),
      expl: "Principe multiplicatif : " + e + " × " + pl + " × " + de + " = " + a + " menus. On multiplie les choix, on ne les additionne pas." };
  }
});

// ====================================================================
// p6-02 — QCM blanc type SESAME
// ====================================================================
SKILLS.push({
  id: 'p6-02-blanc-sesame',
  phase: 6,
  ordre: 2,
  titre: 'QCM blanc type SESAME',
  objectif: "Résoudre les questions de logique numérique et de pourcentages du concours SESAME à partir de données décrites en texte.",
  lecon: `<p class="lede">Au concours SESAME, l'épreuve de raisonnement ne te donne presque jamais un calcul tout prêt : les données sont <mark>cachées dans un petit texte</mark>, et c'est à toi de les transformer en opérations.</p>
<p>La compétence clé n'est donc pas de calculer vite (les nombres sont volontairement simples), mais de <mark>traduire chaque phrase en opération</mark> sans te tromper de sens : « représente 25 % de » veut dire « × 0,25 », « est passé de 200 à 250 » cache une évolution, « parmi eux » annonce un pourcentage de pourcentage.</p>
<div class="etapes">
<p><b>Exemple entièrement détaillé.</b> « Une entreprise compte 240 salariés. 25 % travaillent au service commercial, et 50 % des commerciaux sont en télétravail. Combien de commerciaux sont en télétravail ? »</p>
<p><b>Étape 1</b> — Je repère les données : 240 salariés ; 25 % ; 50 % <em>des commerciaux</em> (et non de l'entreprise !).</p>
<p><b>Étape 2</b> — Commerciaux : 240 × 25 ÷ 100 = 60 personnes.</p>
<p><b>Étape 3</b> — Télétravail : 50 % de 60 = 60 × 50 ÷ 100 = <mark>30 personnes</mark>.</p>
<p><b>Vérification</b> — Ordre de grandeur : 30 sur 240, c'est cohérent. Le distracteur du QCM sera 120 (50 % de 240 : on a oublié que le second pourcentage porte sur les commerciaux) ou 180 (75 % de 240 : on a additionné les pourcentages).</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Un pourcentage n'a de sens qu'avec sa base. Demande-toi toujours : <mark>« pourcentage… de quoi ? »</mark>. Quand deux pourcentages s'enchaînent, le second s'applique au résultat du premier, jamais au total de départ.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Souligne mentalement les nombres et la question finale avant de calculer. Sur les suites logiques, écris les écarts entre les termes : le motif (+3, ×2, écarts croissants…) saute aux yeux en deux secondes.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Pour retrouver une valeur <em>avant</em> une baisse de 20 %, on divise par 0,80 : on n'ajoute surtout pas 20 % à la valeur finale. C'est le piège le plus rentable du concours… pour ceux qui le connaissent.</p></div>`,
  gen(level, R){
    var t, ch, a;
    if (level === 1){
      t = R.int(1, 3);
      if (t === 1){
        var pr = R.pick([[10, 50], [20, 50], [15, 60], [30, 120], [12, 48], [45, 180], [27, 90], [16, 80], [21, 70], [36, 120]]);
        var k = pr[0], N = pr[1];
        a = 100 * k / N;
        ch = quatre(a, [100 - a, k, a + 5]);
        return { q: "Sur " + N + " personnes interrogées, " + k + " préfèrent le produit A. Quel pourcentage cela représente-t-il ?",
          a: pt(a), accept: null, choix: ch.map(pt),
          expl: k + " ÷ " + N + " × 100 = " + pt(a) + " %. Attention à ne pas confondre l'effectif (" + k + ") et le pourcentage." };
      }
      if (t === 2){
        var u0 = R.int(3, 12), A = R.int(2, 5), Bb = A + R.int(2, 4);
        var terms = [u0, u0 + A, u0 + A + Bb, u0 + 2 * A + Bb];
        a = u0 + 2 * A + 2 * Bb;
        ch = quatre(a, [u0 + 3 * A + Bb, a - 1, a + 1]);
        return { q: "Quel nombre continue la suite ?\n" + terms.join(" ; ") + " ; …",
          a: pt(a), accept: null, choix: ch.map(pt),
          expl: "La suite alterne +" + A + " puis +" + Bb + ". Après +" + A + ", on ajoute " + Bb + " : " + terms[3] + " + " + Bb + " = " + a + "." };
      }
      var X = R.pick([100, 200, 300, 400, 500]);
      var pc = R.pick([10, 20, 25, 50]);
      var Y = X * (100 + pc) / 100;
      ch = quatre(pc, [Y - X, 100 * (Y - X) / Y, pc + 5]);
      return { q: "Le chiffre d'affaires d'une boutique est passé de " + X + " € à " + Y + " €. Quel est le pourcentage d'augmentation ?",
        a: pt(pc), accept: null, choix: ch.map(pt),
        expl: "Variation : " + (Y - X) + " €. En pourcentage du point de départ : " + (Y - X) + " ÷ " + X + " × 100 = " + pc + " %." };
    }
    if (level === 2){
      t = R.int(1, 4);
      if (t === 1){
        var C = R.pick([2000, 3000, 4000, 5000, 6000, 8000]);
        var p1 = R.pick([10, 20, 30, 40, 50]);
        var q1 = R.pick([10, 20, 30, 40, 60]);
        var enLigne = C * p1 / 100;
        a = enLigne * q1 / 100;
        ch = quatre(a, [enLigne, C * q1 / 100, C * (p1 + q1) / 100]);
        return { q: "Une entreprise réalise " + C + " € de chiffre d'affaires. Les ventes en ligne représentent " + p1 + " % du total, et " + q1 + " % des ventes en ligne proviennent du mobile. Quel montant (en €) provient du mobile ?",
          a: pt(a), accept: null, choix: ch.map(pt),
          expl: "En ligne : " + C + " × " + p1 + " ÷ 100 = " + enLigne + " €. Puis mobile : " + enLigne + " × " + q1 + " ÷ 100 = " + pt(a) + " €. Le second pourcentage porte sur les ventes en ligne, pas sur le total." };
      }
      if (t === 2){
        var u2 = R.int(2, 10), s = R.int(2, 4);
        var terms2 = [u2, u2 + s, u2 + 2 * s + 1, u2 + 3 * s + 3];
        a = u2 + 4 * s + 6;
        ch = quatre(a, [a - 1, a + 1, a - 3]);
        return { q: "Quel nombre continue la suite ?\n" + terms2.join(" ; ") + " ; …",
          a: pt(a), accept: null, choix: ch.map(pt),
          expl: "Les écarts augmentent de 1 à chaque fois : +" + s + ", +" + (s + 1) + ", +" + (s + 2) + ", donc +" + (s + 3) + " : " + terms2[3] + " + " + (s + 3) + " = " + a + "." };
      }
      if (t === 3){
        var PAIRS = [[12, 60, 20], [15, 50, 30], [9, 36, 25], [21, 60, 35], [18, 45, 40], [8, 40, 20], [24, 80, 30], [12, 48, 25], [30, 120, 25], [14, 70, 20]];
        var pA = R.pick(PAIRS);
        var pB = R.pick(PAIRS.filter(function(z){ return z[2] !== pA[2]; }));
        a = pA[2] > pB[2] ? "L'agence A" : "L'agence B";
        return { q: "Dans l'agence A, " + pA[0] + " dossiers sur " + pA[1] + " ont été acceptés. Dans l'agence B, " + pB[0] + " sur " + pB[1] + ". Quelle agence a le meilleur taux d'acceptation ?",
          a: a, accept: null,
          choix: ["L'agence A", "L'agence B", "Les deux taux sont égaux", "Impossible à comparer"],
          expl: "A : " + pA[0] + " ÷ " + pA[1] + " = " + pA[2] + " % ; B : " + pB[0] + " ÷ " + pB[1] + " = " + pB[2] + " %. On compare des taux, jamais des effectifs bruts." };
      }
      var mo = R.int(9, 15), dd = R.int(1, 2);
      var nE = mo - 3 * dd, nO = mo + dd;
      ch = quatre(mo, [(nE + nO) / 2, mo + 1, mo - 1]);
      return { q: "Un candidat obtient " + nE + "/20 à l'écrit (coefficient 1) et " + nO + "/20 à l'oral (coefficient 3). Quelle est sa moyenne pondérée ?",
        a: pt(mo), accept: null, choix: ch.map(pt),
        expl: "(" + nE + " × 1 + " + nO + " × 3) ÷ 4 = " + (nE + 3 * nO) + " ÷ 4 = " + mo + ". La moyenne simple " + fr((nE + nO) / 2) + " est le piège classique." };
    }
    t = R.int(1, 4);
    if (t === 1){
      var pb2 = R.pick([10, 20, 25, 50]);
      var V0 = R.pick([200, 400, 600, 800, 1200, 1600, 2000]);
      var Vf = V0 * (100 - pb2) / 100;
      ch = quatre(V0, [Vf * (100 + pb2) / 100, Vf + pb2]);
      return { q: "Après une baisse de " + pb2 + " %, les ventes annuelles s'élèvent à " + Vf + " unités. Combien valaient-elles avant la baisse ?",
        a: pt(V0), accept: null, choix: ch.map(pt),
        expl: "Baisser de " + pb2 + " % = multiplier par " + fr((100 - pb2) / 100) + ". Avant la baisse : " + Vf + " ÷ " + fr((100 - pb2) / 100) + " = " + V0 + ". Rajouter " + pb2 + " % à " + Vf + " donne " + fr(Vf * (100 + pb2) / 100) + " : c'est l'erreur piégée." };
    }
    if (t === 2){
      var t1 = R.int(2, 6), t2 = R.int(3, 9);
      var t3 = t1 + t2, t4 = t2 + t3;
      a = t3 + t4;
      ch = quatre(a, [t4 + t2, a - 1, a + 1]);
      return { q: "Dans cette suite, chaque terme est obtenu à partir des précédents :\n" + [t1, t2, t3, t4].join(" ; ") + " ; …\nQuel est le terme suivant ?",
        a: pt(a), accept: null, choix: ch.map(pt),
        expl: "Chaque terme est la somme des deux précédents : " + t3 + " + " + t4 + " = " + a + "." };
    }
    if (t === 3){
      var dl = R.pick([[8, 25, 2], [12, 25, 3], [16, 25, 4], [6, 50, 6], [10, 40, 10], [15, 40, 5], [8, 50, 8], [12, 50, 8], [18, 50, 12], [4, 50, 4]]);
      var L = dl[0], ps = dl[1], dz = dl[2];
      var S = L * ps / 100;
      a = 100 * S / (L + dz);
      ch = quatre(a, [ps, ps / 2, a + 5]);
      return { q: "Une cuve contient " + L + " litres d'un mélange composé à " + ps + " % de sirop. On ajoute " + dz + " litres d'eau pure. Quel est le nouveau pourcentage de sirop ?",
        a: pt(a), accept: null, choix: ch.map(pt),
        expl: "La quantité de sirop ne change pas : " + S + " L. Nouveau volume : " + (L + dz) + " L. Donc " + S + " ÷ " + (L + dz) + " × 100 = " + pt(a) + " %." };
    }
    var Tt = R.pick([200, 300, 400, 500, 600, 800]);
    var pv = R.pick([10, 20, 25, 40, 50]);
    var Nv = Tt * pv / 100;
    ch = quatre(Tt, [Nv * pv / 100, Nv + pv, 2 * Nv]);
    return { q: "Dans un salon professionnel, " + pv + " % des visiteurs ont signé un contrat, soit " + Nv + " personnes. Combien y avait-il de visiteurs en tout ?",
      a: pt(Tt), accept: null, choix: ch.map(pt),
      expl: "Si " + pv + " % du total vaut " + Nv + ", le total vaut " + Nv + " × 100 ÷ " + pv + " = " + Tt + " visiteurs." };
  }
});

// ====================================================================
// p6-03 — Stratégie de QCM
// ====================================================================
var DEC = [
  "Répondre : l'espérance de gain est positive",
  "Passer : l'espérance de gain est négative",
  "Indifférent : l'espérance de gain est nulle",
  "Impossible à dire sans voir la question"
];
function decide(ev){
  if (ev > 0.0001) return DEC[0];
  if (ev < -0.0001) return DEC[1];
  return DEC[2];
}
function concl(ev){
  if (ev > 0.0001) return "positive : il faut répondre";
  if (ev < -0.0001) return "négative : il vaut mieux passer";
  return "nulle : répondre ou passer revient au même";
}

SKILLS.push({
  id: 'p6-03-strategie',
  phase: 6,
  ordre: 3,
  titre: 'Stratégie de QCM',
  objectif: "Décider en quelques secondes s'il faut répondre ou passer, selon ta certitude et le barème.",
  lecon: `<p class="lede">À niveau égal en maths, ce qui sépare deux candidats au concours, c'est la stratégie : <mark>gérer son temps, connaître le barème, et savoir quand passer</mark>. Ça se calcule, et tu vas apprendre à le faire.</p>
<p><b>1. Le temps.</b> Calcule ton budget dès le début : une épreuve de 30 minutes pour 40 questions, c'est 45 secondes par question. Travaille en trois passages : d'abord les questions rapides et sûres (les points faciles), puis les questions moyennes, enfin ce qui reste. <mark>Une question bloquée plus d'une minute se marque et se saute</mark> : elle coûte le temps de deux questions faciles.</p>
<p><b>2. Les points négatifs.</b> Beaucoup de barèmes retirent des points en cas d'erreur. La bonne décision se calcule avec l'espérance de gain.</p>
<div class="etapes">
<p><b>Exemple entièrement détaillé.</b> Barème : +3 par bonne réponse, −1 par mauvaise, 0 si tu passes. Tu as éliminé 2 réponses sur 4 et tu hésites entre les 2 restantes.</p>
<p><b>Étape 1</b> — En répondant au hasard : 1 chance sur 2 de gagner +3, 1 chance sur 2 de perdre 1.</p>
<p><b>Étape 2</b> — Espérance = (3 − 1) ÷ 2 = <mark>+1 point</mark> en moyenne : tu dois répondre.</p>
<p><b>Étape 3</b> — Sans aucune élimination : espérance = (3 − 3 × 1) ÷ 4 = 0. Le hasard pur ne rapporte rien ici : ne perds pas de temps dessus.</p>
</div>
<table class="tbl"><tr><th>Situation (barème +3 / −1)</th><th>Espérance</th><th>Décision</th></tr>
<tr><td>Sûr de la réponse</td><td>+3</td><td>Réponds</td></tr>
<tr><td>Hésitation entre 2</td><td>(3 − 1) ÷ 2 = +1</td><td>Réponds</td></tr>
<tr><td>Hésitation entre 3</td><td>(3 − 2) ÷ 3 ≈ +0,33</td><td>Réponds</td></tr>
<tr><td>Aucune idée (4 possibles)</td><td>(3 − 3) ÷ 4 = 0</td><td>Neutre : passe, gagne du temps</td></tr></table>
<div class="box retenir"><p class="box-t">À retenir</p><p>Avec r réponses possibles restantes, un gain g et un malus p : <mark>espérance = (g − (r − 1) × p) ÷ r</mark>. Positive → réponds. Négative → passe. Chaque réponse éliminée fait grimper ton espérance.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Sans points négatifs, la règle est simple : <mark>on répond à tout</mark>, toujours, même au hasard. Une case vide est le seul vrai zéro garanti.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>« J'ai déjà passé 3 minutes dessus, je ne vais pas abandonner maintenant » : si, justement. Le temps déjà perdu ne reviendra pas ; seule compte la meilleure décision <em>maintenant</em>.</p></div>`,
  gen(level, R){
    var t, g, p, ev, ch;
    if (level === 1){
      t = R.pick([1, 2, 2]);
      if (t === 1){
        g = R.pick([1, 2, 3, 4]);
        var ph = R.pick([
          "Tu n'as aucune idée de la réponse.",
          "La question te paraît trop longue à résoudre dans le temps imparti."
        ]);
        ev = g / 4;
        return { q: "QCM à 4 propositions. Barème : +" + g + " par bonne réponse, 0 par mauvaise réponse, 0 si tu passes. " + ph + " Quelle est la meilleure décision ?",
          a: DEC[0], accept: null, choix: DEC.slice(),
          expl: "Sans points négatifs, une erreur ne coûte rien : on répond toujours, même au hasard. Espérance = " + g + " ÷ 4 = +" + fr(ev) + " point(s)." };
      }
      var c1 = R.pick([[3, 1], [1, 1], [4, 1], [3, 2], [2, 1], [4, 2], [6, 2], [5, 1], [2, 2]]);
      g = c1[0]; p = c1[1];
      ev = (g - 3 * p) / 4;
      var pre = R.pick(["Concours blanc ACCÈS.", "Concours blanc SESAME.", "Entraînement chronométré."]);
      return { q: pre + " QCM à 4 propositions. Barème : +" + g + " par bonne réponse, −" + p + " par mauvaise, 0 si tu passes. Tu n'as aucune certitude : les 4 réponses te semblent possibles. Que fais-tu ?",
        a: decide(ev), accept: null, choix: DEC.slice(),
        expl: "Au hasard : 1 chance sur 4 de gagner " + g + ", 3 sur 4 de perdre " + p + ". Espérance = (" + g + " − 3 × " + p + ") ÷ 4 = " + fr(ev) + ", donc " + concl(ev) + "." };
    }
    if (level === 2){
      t = R.pick([1, 1, 2]);
      if (t === 1){
        var kEl = R.pick([1, 2]);
        var r = 4 - kEl;
        var c2 = R.pick([[3, 1], [1, 1], [4, 2], [2, 1], [3, 2], [4, 1], [5, 2]]);
        g = c2[0]; p = c2[1];
        var num = g - (r - 1) * p;
        ev = num / r;
        return { q: "QCM à 4 propositions, barème +" + g + " / −" + p + " / 0 si tu passes. Tu élimines avec certitude " + kEl + " proposition" + (kEl > 1 ? "s" : "") + " et tu hésites totalement entre les " + r + " restantes. Que fais-tu ?",
          a: decide(ev), accept: null, choix: DEC.slice(),
          expl: "Parmi les " + r + " restantes : 1 chance sur " + r + " de gagner " + g + ", " + (r - 1) + " sur " + r + " de perdre " + p + ". Espérance = (" + g + " − " + (r - 1) + " × " + p + ") ÷ " + r + " : elle est " + concl(ev) + "." };
      }
      if (R.int(1, 2) === 1){
        var nQ = R.pick([12, 15, 20]), tM = R.pick([8, 10]);
        var bonne = "Traiter d'abord toutes les questions rapides où tu es presque sûr de toi";
        return { q: "Concours blanc : il te reste " + tM + " minutes pour " + nQ + " questions, toutes au même barème. Certaines te paraissent rapides, d'autres très longues. Quelle est la meilleure stratégie ?",
          a: bonne, accept: null,
          choix: [bonne,
            "Suivre l'ordre du sujet sans jamais sauter de question",
            "Commencer par les questions les plus longues pour t'en débarrasser",
            "Répondre au hasard à tout, tout de suite"],
          expl: "À barème égal, une question facile rapporte autant qu'une difficile. Engrange d'abord les points sûrs, puis reviens sur le reste s'il te reste du temps." };
      }
      var tB = R.pick([2, 3]);
      var bonne2 = "La marquer, passer à la suivante et y revenir s'il reste du temps";
      return { q: "Tu bloques depuis " + tB + " minutes sur une question qui vaut le même nombre de points que les autres. Que fais-tu ?",
        a: bonne2, accept: null,
        choix: [bonne2,
          "Rester dessus jusqu'à trouver, quel que soit le temps passé",
          "Répondre au hasard immédiatement malgré les points négatifs",
          "L'abandonner définitivement sans la noter"],
        expl: "Une question bloquée coûte le temps de deux ou trois questions faciles. Marque-la, avance, et reviens dessus à la fin avec un œil neuf." };
    }
    t = R.pick([1, 1, 2, 3]);
    if (t === 1){
      var r3 = R.pick([2, 4]);
      var c3 = r3 === 4
        ? R.pick([[3, 1], [4, 1], [1, 1], [3, 2], [4, 2], [5, 1]])
        : R.pick([[3, 1], [1, 1], [2, 1], [4, 2], [3, 2], [5, 2]]);
      g = c3[0]; p = c3[1];
      ev = (g - (r3 - 1) * p) / r3;
      var situ = r3 === 4
        ? "Tu n'as éliminé aucune proposition : les 4 restent possibles."
        : "Tu as éliminé 2 propositions sur 4 : il en reste 2, sans préférence.";
      ch = quatre(ev, [g / r3, (g - p) / r3, -p]);
      return { q: "Barème : +" + g + " par bonne réponse, −" + p + " par mauvaise, 0 si tu passes. " + situ + " Quelle est ton espérance de points si tu réponds au hasard ?",
        a: pt(ev), accept: null, choix: ch.map(pt),
        expl: "Espérance = (" + g + " − " + (r3 - 1) + " × " + p + ") ÷ " + r3 + " = " + fr(ev) + " point(s). C'est " + concl(ev) + "." };
    }
    if (t === 2){
      var tq = R.pick([[30, 40], [60, 80], [45, 30], [60, 120], [40, 20], [90, 60], [30, 60], [45, 90]]);
      var Tm = tq[0], Nq = tq[1];
      var sec = Tm * 60 / Nq;
      ch = quatre(sec, [Math.round(60 * Nq / Tm), sec + 15, sec - 15]);
      return { q: "Gestion du temps : l'épreuve dure " + Tm + " minutes et compte " + Nq + " questions. De combien de temps disposes-tu en moyenne par question (en secondes) ?",
        a: pt(sec), accept: null, choix: ch.map(pt),
        expl: Tm + " min = " + (Tm * 60) + " s ; " + (Tm * 60) + " ÷ " + Nq + " = " + sec + " s par question. Au double de ce temps sur une question, tu la marques et tu passes." };
    }
    var s1 = R.pick([20, 30, 40]);
    var bonne3 = "Répondre à la question A, et laisser la B sans réponse";
    return { q: "Fin d'épreuve : il reste 60 secondes et deux questions au même barème (avec points négatifs). La question A te demanderait environ " + s1 + " secondes et tu es sûr de la réponse. La question B exigerait plus de 2 minutes de calculs et tu n'as aucune piste. Que fais-tu ?",
      a: bonne3, accept: null,
      choix: [bonne3,
        "Tenter la question B d'abord, car elle a l'air plus valorisante",
        "Répondre au hasard aux deux questions",
        "Ne répondre à aucune des deux pour éviter tout risque"],
      expl: "La question A rapporte des points quasi certains en " + s1 + " s. Sur la B, répondre au hasard avec un malus donne une espérance négative : on sécurise A et on laisse B vide." };
  }
});

})();
