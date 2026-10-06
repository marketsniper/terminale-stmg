/* Devoirs sur papier — série A — phases 1 et 2 (fondations 6e–5e et collège 4e–3e) */
(function(){

/* ===== pap-1-01 — Proportionnalité et règle de trois ===== */
PAPIERS.push({
  id: 'pap-1-01',
  phase: 1,
  titre: "Le fournisseur de flacons",
  duree: 10,
  skills: ['p1-10-proportionnalite','p1-05-division-posee'],
  enonce: `<p>Une petite entreprise de cosmétiques, Bel'Arôme, achète des flacons vides chez un fournisseur. Le prix payé est proportionnel au nombre de flacons commandés : <strong>12 flacons coûtent 84 €</strong>.</p>
<ol>
<li>Calculer le prix d'un flacon. (Poser la division.)</li>
<li>La gérante commande 19 flacons. Quel montant devra-t-elle payer ?</li>
<li>Elle dispose d'un budget de 210 €. Combien de flacons au maximum peut-elle acheter avec cette somme ?</li>
<li>Le fournisseur lui propose un lot de 50 flacons pour 340 €. Ce lot est-il plus avantageux que le prix habituel ? Justifier par un calcul, puis répondre par une phrase.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>1.</strong> La situation est proportionnelle : je cherche le prix d'un seul flacon, c'est-à-dire le coefficient de proportionnalité.</p>
<p>84 ÷ 12 = 7</p>
<p>Un flacon coûte <strong>7 €</strong>.</p>
</div>
<div class="etapes">
<p><strong>2.</strong> Pour connaître le prix de 19 flacons, je multiplie le prix d'un flacon par 19 :</p>
<p>19 × 7 = 133</p>
<p>La gérante devra payer <strong>133 €</strong> pour 19 flacons.</p>
</div>
<div class="etapes">
<p><strong>3.</strong> Je cherche combien de fois 7 € tiennent dans 210 € :</p>
<p>210 ÷ 7 = 30</p>
<p>Avec un budget de 210 €, elle peut acheter <strong>30 flacons</strong>.</p>
</div>
<div class="etapes">
<p><strong>4.</strong> Pour comparer, je calcule ce que coûteraient 50 flacons au prix habituel :</p>
<p>50 × 7 = 350</p>
<p>Le lot est proposé à 340 €, or 340 &lt; 350.</p>
<p>Économie réalisée : 350 − 340 = 10</p>
<p><strong>Le lot de 50 flacons est plus avantageux : il fait économiser 10 € par rapport au prix habituel.</strong></p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Comparer directement 340 € à 84 € ou à 210 €, alors que ces prix ne portent pas sur le même nombre de flacons. Pour comparer deux offres, il faut toujours les ramener à la même quantité : soit le prix d'un flacon, soit le prix de 50 flacons dans les deux cas.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Que le coefficient (7 € par flacon) apparaisse clairement dès la question 1, que chaque calcul soit écrit en ligne avec son résultat et son unité, et que la question 4 se termine par une phrase de comparaison — pas seulement par un nombre posé au bout du brouillon.</p></div>`,
  criteres: [
    "J'ai calculé le prix d'un seul flacon (7 €) avant de répondre aux autres questions.",
    "J'ai trouvé 133 € à la question 2 et 30 flacons à la question 3.",
    "J'ai comparé le lot au prix habituel en calculant 50 × 7 = 350 €.",
    "J'ai conclu la question 4 par une phrase disant que le lot fait économiser 10 €.",
    "J'ai écrit l'unité (€ ou flacons) à côté de chacun de mes résultats."
  ]
});

/* ===== pap-1-02 — Priorités de calcul dans un problème concret ===== */
PAPIERS.push({
  id: 'pap-1-02',
  phase: 1,
  titre: "La journée du food-truck",
  duree: 10,
  skills: ['p1-06-priorites','p1-07-relatifs'],
  enonce: `<p>Karim tient un food-truck. Le lundi, il vend <strong>24 sandwichs à 6 €</strong> l'unité et <strong>15 boissons à 4 €</strong> l'unité. Dans la journée, il a payé <strong>45 €</strong> de matières premières et <strong>20 €</strong> de location d'emplacement.</p>
<ol>
<li>Écrire en une seule expression, sans la calculer, le résultat de la journée de lundi (recettes moins charges).</li>
<li>Calculer cette expression en respectant les priorités opératoires. Détailler chaque étape.</li>
<li>Un ami de Karim écrit : 24 × (6 + 15) × 4 = 2 016. Expliquer en une ou deux phrases pourquoi ce calcul ne correspond pas à la situation.</li>
<li>Le mardi, Karim ne vend que 6 sandwichs et 4 boissons, aux mêmes prix, et paie les mêmes charges. Calculer le résultat de cette journée, puis interpréter le signe du nombre obtenu.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>1.</strong> Le résultat est égal aux recettes moins les charges. Les recettes viennent des sandwichs et des boissons, les charges sont les matières premières et l'emplacement :</p>
<p>24 × 6 + 15 × 4 − 45 − 20</p>
<p>Aucune parenthèse n'est nécessaire : les multiplications sont prioritaires sur les additions et les soustractions.</p>
</div>
<div class="etapes">
<p><strong>2.</strong> Je calcule d'abord les deux multiplications :</p>
<p>24 × 6 = 144 (recette des sandwichs)</p>
<p>15 × 4 = 60 (recette des boissons)</p>
<p>L'expression devient : 144 + 60 − 45 − 20</p>
<p>Je termine de gauche à droite :</p>
<p>144 + 60 = 204</p>
<p>204 − 45 = 159</p>
<p>159 − 20 = 139</p>
<p><strong>Le résultat de la journée de lundi est de 139 €.</strong></p>
</div>
<div class="etapes">
<p><strong>3.</strong> Dans 24 × (6 + 15), la parenthèse additionne 6, qui est un prix en euros, et 15, qui est un nombre de boissons : ces deux nombres ne désignent pas la même grandeur, on ne peut pas les additionner. De plus, la parenthèse impose de faire cette addition avant les multiplications, alors que la situation demande justement de multiplier d'abord chaque quantité par son prix. Le calcul de l'ami ne traduit donc pas la journée de Karim.</p>
</div>
<div class="etapes">
<p><strong>4.</strong> Mardi, l'expression devient : 6 × 6 + 4 × 4 − 45 − 20</p>
<p>6 × 6 = 36 et 4 × 4 = 16</p>
<p>36 + 16 = 52 (recettes du mardi)</p>
<p>52 − 45 = 7</p>
<p>7 − 20 = −13</p>
<p><strong>Le résultat du mardi est de −13 €.</strong> Le nombre est négatif, donc les recettes (52 €) n'ont pas suffi à couvrir les charges (65 €) : Karim a perdu 13 € ce jour-là.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Calculer de gauche à droite sans regarder les opérations : 24 × 6 = 144, puis 144 + 15 = 159, puis 159 × 4 = 636. Les multiplications doivent être faites <em>toutes</em> avant les additions et les soustractions. Deuxième faute très fréquente à la question 4 : écrire 13 au lieu de −13 et annoncer un bénéfice alors qu'il s'agit d'une perte.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>L'expression complète écrite en entier avant le moindre calcul, puis une étape par ligne (jamais deux transformations dans la même ligne), et surtout une phrase finale qui interprète le signe du résultat en termes de bénéfice ou de perte.</p></div>`,
  criteres: [
    "J'ai écrit l'expression complète 24 × 6 + 15 × 4 − 45 − 20 avant de commencer à calculer.",
    "J'ai effectué les deux multiplications avant les additions et les soustractions.",
    "J'ai trouvé 139 € pour le lundi et −13 € pour le mardi.",
    "J'ai expliqué par une phrase pourquoi le calcul avec la parenthèse ne convient pas.",
    "J'ai interprété le signe négatif en écrivant que Karim a perdu 13 €."
  ]
});

/* ===== pap-1-03 — Fractions d'une quantité ===== */
PAPIERS.push({
  id: 'pap-1-03',
  phase: 1,
  titre: "Le budget de l'association",
  duree: 10,
  skills: ['p1-09-fractions-sens','p1-10-proportionnalite'],
  enonce: `<p>Le bureau d'une association étudiante dispose d'un budget annuel de <strong>1 800 €</strong>. Il décide de consacrer <strong>2/5</strong> de ce budget à la communication et <strong>3/10</strong> à l'achat de fournitures.</p>
<ol>
<li>Calculer le montant consacré à la communication.</li>
<li>Calculer le montant consacré aux fournitures.</li>
<li>Quelle somme reste-t-il ? Quelle fraction du budget total cette somme représente-t-elle ? Donner la fraction simplifiée.</li>
<li>Le trésorier affirme : « Il nous reste plus d'argent que ce que nous avons mis dans la communication. » A-t-il raison ? Justifier en comparant les deux fractions, puis conclure par une phrase.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>1.</strong> Prendre 2/5 d'une quantité, c'est la diviser par 5 puis multiplier par 2.</p>
<p>1 800 ÷ 5 = 360</p>
<p>360 × 2 = 720</p>
<p>La communication représente <strong>720 €</strong>.</p>
</div>
<div class="etapes">
<p><strong>2.</strong> De la même façon, pour 3/10 : je divise par 10 puis je multiplie par 3.</p>
<p>1 800 ÷ 10 = 180</p>
<p>180 × 3 = 540</p>
<p>Les fournitures représentent <strong>540 €</strong>.</p>
</div>
<div class="etapes">
<p><strong>3.</strong> Total déjà engagé : 720 + 540 = 1 260</p>
<p>Somme restante : 1 800 − 1 260 = 540</p>
<p>Cette somme représente la fraction 540/1800 du budget. Je simplifie en divisant le numérateur et le dénominateur par 180 :</p>
<p>540 ÷ 180 = 3 et 1 800 ÷ 180 = 10, donc 540/1800 = 3/10.</p>
<p>Il reste <strong>540 €</strong>, soit <strong>3/10</strong> du budget total.</p>
</div>
<div class="etapes">
<p><strong>4.</strong> Je compare le reste, 3/10, à la part de la communication, 2/5.</p>
<p>Je mets les deux fractions au même dénominateur : 2/5 = (2 × 2)/(5 × 2) = 4/10.</p>
<p>Or 3/10 &lt; 4/10, ce que confirment les montants : 540 € &lt; 720 €.</p>
<p><strong>Le trésorier a tort : il reste 540 €, soit moins que les 720 € consacrés à la communication.</strong></p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Deux fautes reviennent sans cesse. D'abord inverser l'ordre : diviser par 2 puis multiplier par 5 pour calculer 2/5 de 1 800 (on divise toujours par le dénominateur, on multiplie toujours par le numérateur). Ensuite comparer 3/10 et 2/5 en regardant seulement les numérateurs et conclure que 3/10 est plus grand parce que 3 &gt; 2 : sans le même dénominateur, cette comparaison n'a aucun sens.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Les deux étapes de chaque fraction visibles séparément (la division, puis la multiplication), la simplification de 540/1800 justifiée par le nombre qui divise (180), la mise au même dénominateur écrite noir sur blanc, et une conclusion qui répond explicitement au trésorier.</p></div>`,
  criteres: [
    "J'ai calculé 2/5 de 1 800 € en divisant d'abord par 5, puis en multipliant par 2.",
    "J'ai trouvé 720 € pour la communication et 540 € pour les fournitures.",
    "J'ai trouvé un reste de 540 €, soit la fraction 3/10 après simplification.",
    "J'ai mis les deux fractions au même dénominateur (3/10 et 4/10) avant de les comparer.",
    "J'ai conclu par une phrase indiquant que le trésorier a tort."
  ]
});

/* ===== pap-2-01 — Équation issue d'un problème ===== */
PAPIERS.push({
  id: 'pap-2-01',
  phase: 2,
  titre: "Deux formules pour la salle de sport",
  duree: 12,
  skills: ['p2-07-equations','p2-06-calcul-litteral'],
  enonce: `<p>Une salle de sport propose deux formules pour l'année :</p>
<ul>
<li><strong>Formule A</strong> : 40 € d'inscription, payés une seule fois, puis 8 € par séance.</li>
<li><strong>Formule B</strong> : aucune inscription, 12 € par séance.</li>
</ul>
<p>On note <em>x</em> le nombre de séances effectuées dans l'année.</p>
<ol>
<li>Exprimer en fonction de <em>x</em> le prix payé avec la formule A, puis le prix payé avec la formule B.</li>
<li>Résoudre l'équation 40 + 8<em>x</em> = 12<em>x</em>. Que représente la solution trouvée pour un adhérent de la salle ?</li>
<li>Un adhérent prévoit 15 séances. Calculer le prix des deux formules, indiquer celle qu'il doit choisir et l'économie réalisée.</li>
<li>Rédiger en deux phrases un conseil destiné aux nouveaux adhérents : dans quel cas choisir la formule A, dans quel cas choisir la formule B ?</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>1.</strong> Avec la formule A, l'adhérent paie une fois 40 €, puis 8 € pour chacune des <em>x</em> séances :</p>
<p>Prix A = 40 + 8<em>x</em></p>
<p>Avec la formule B, il paie seulement 12 € par séance :</p>
<p>Prix B = 12<em>x</em></p>
</div>
<div class="etapes">
<p><strong>2.</strong> Je résous l'équation 40 + 8<em>x</em> = 12<em>x</em>.</p>
<p>Je retranche 8<em>x</em> aux deux membres : 40 + 8<em>x</em> − 8<em>x</em> = 12<em>x</em> − 8<em>x</em></p>
<p>40 = 4<em>x</em></p>
<p>Je divise les deux membres par 4 : <em>x</em> = 40 ÷ 4 = 10</p>
<p>Vérification : A = 40 + 8 × 10 = 40 + 80 = 120 et B = 12 × 10 = 120. Les deux membres sont bien égaux.</p>
<p><strong>La solution est x = 10 : pour 10 séances dans l'année, les deux formules coûtent exactement le même prix, 120 €.</strong></p>
</div>
<div class="etapes">
<p><strong>3.</strong> Pour 15 séances :</p>
<p>Formule A : 40 + 8 × 15 = 40 + 120 = 160</p>
<p>Formule B : 12 × 15 = 180</p>
<p>Différence : 180 − 160 = 20</p>
<p><strong>Il doit choisir la formule A, qui lui coûte 160 € au lieu de 180 €, soit une économie de 20 €.</strong></p>
</div>
<div class="etapes">
<p><strong>4.</strong> Conseil rédigé :</p>
<p>« Si vous prévoyez moins de 10 séances dans l'année, choisissez la formule B : les 40 € d'inscription de la formule A ne seraient pas rentabilisés. Par exemple, pour 6 séances, A coûte 88 € contre 72 € pour B. »</p>
<p>« Si vous prévoyez plus de 10 séances, choisissez la formule A : chaque séance y coûte 4 € de moins, ce qui finit par compenser largement l'inscription. Pour exactement 10 séances, les deux formules reviennent au même. »</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Écrire le prix de la formule A sous la forme 40<em>x</em> + 8<em>x</em> : l'inscription est payée une seule fois, elle ne se multiplie pas par le nombre de séances. Autre faute fréquente : après 40 = 4<em>x</em>, écrire <em>x</em> = 4 au lieu de <em>x</em> = 10, en divisant dans le mauvais sens. La vérification en fin de résolution permet de repérer cette erreur immédiatement.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Une ligne d'équation par étape, chaque ligne commençant par le signe = aligné, l'opération effectuée annoncée avant d'être faite (« je retranche 8x aux deux membres »), la vérification écrite, puis une phrase qui traduit la valeur trouvée dans le contexte de l'énoncé. Un <em>x</em> = 10 sans interprétation ne vaut pas tous les points.</p></div>`,
  criteres: [
    "J'ai écrit les deux expressions 40 + 8x et 12x en utilisant la lettre x.",
    "J'ai regroupé les termes en x d'un côté et les nombres de l'autre pour résoudre l'équation.",
    "J'ai trouvé x = 10 et vérifié que les deux formules donnent bien 120 €.",
    "J'ai trouvé 160 € pour la formule A et 180 € pour la formule B, soit 20 € d'économie.",
    "J'ai rédigé un conseil qui distingue le cas de moins de 10 séances et celui de plus de 10 séances."
  ]
});

/* ===== pap-2-02 — Pourcentages et remises successives ===== */
PAPIERS.push({
  id: 'pap-2-02',
  phase: 2,
  titre: "Deux remises successives",
  duree: 10,
  skills: ['p2-08-pourcentages','p2-10-problemes'],
  enonce: `<p>Une boutique de prêt-à-porter vend une veste <strong>240 €</strong>. Pendant les soldes, le gérant applique une remise de <strong>15 %</strong>. Le dernier jour des soldes, il applique une <strong>seconde remise de 10 %</strong> sur le prix déjà soldé.</p>
<ol>
<li>Calculer le prix de la veste après la première remise. Faire apparaître le coefficient multiplicateur utilisé.</li>
<li>Calculer le prix de la veste après la seconde remise.</li>
<li>Calculer le pourcentage de remise globale entre le prix de départ et le prix final.</li>
<li>Un client affirme : « Deux remises de 15 % puis 10 %, cela fait 25 % de remise. » Rédiger une réponse argumentée expliquant pourquoi il se trompe.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>1.</strong> Baisser un prix de 15 %, c'est le multiplier par 1 − 0,15 = 0,85.</p>
<p>240 × 0,85 = 204</p>
<p><strong>Après la première remise, la veste coûte 204 €.</strong></p>
<p>(Contrôle : 240 × 15/100 = 36 et 240 − 36 = 204.)</p>
</div>
<div class="etapes">
<p><strong>2.</strong> La seconde remise de 10 % s'applique au prix déjà soldé, donc à 204 € et non à 240 €. Le coefficient est 1 − 0,10 = 0,90.</p>
<p>204 × 0,90 = 183,60</p>
<p><strong>Après la seconde remise, la veste coûte 183,60 €.</strong></p>
</div>
<div class="etapes">
<p><strong>3.</strong> Montant total de la remise : 240 − 183,60 = 56,40</p>
<p>Je compare cette remise au prix de départ : 56,40 ÷ 240 = 0,235</p>
<p>0,235 = 23,5/100, soit 23,5 %.</p>
<p>Autre méthode, plus rapide : le coefficient global vaut 0,85 × 0,90 = 0,765, et 1 − 0,765 = 0,235.</p>
<p><strong>La remise globale est de 23,5 %.</strong></p>
</div>
<div class="etapes">
<p><strong>4.</strong> Réponse rédigée :</p>
<p>« Les pourcentages de remise ne s'additionnent pas, parce qu'ils ne portent pas sur le même prix de référence. La première remise de 15 % s'applique aux 240 € de départ et vaut 36 €. La seconde remise de 10 % s'applique au prix déjà soldé de 204 € : elle ne vaut que 20,40 €, alors que 10 % de 240 € auraient valu 24 €. Au total, le client économise 56,40 €, soit 23,5 % du prix initial, et non 25 %. »</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Additionner les pourcentages (15 + 10 = 25) ou, ce qui revient au même, appliquer la seconde remise au prix de départ : 240 × 0,90 = 216 au lieu de 204 × 0,90. La deuxième remise porte toujours sur le prix obtenu après la première. Autre étourderie : écrire 183,6 sans la seconde décimale alors qu'il s'agit d'un prix en euros et centimes, 183,60 €.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Que le coefficient multiplicateur soit écrit avant chaque calcul (0,85 puis 0,90), qu'il soit justifié par 1 − 0,15 et 1 − 0,10, et qu'à la question 4 la réponse cite un calcul chiffré (20,40 € contre 24 €) plutôt qu'une simple affirmation du type « ça ne s'additionne pas ».</p></div>`,
  criteres: [
    "J'ai écrit le coefficient multiplicateur 0,85 avant de calculer le prix soldé.",
    "J'ai appliqué la seconde remise à 204 € et non à 240 €.",
    "J'ai trouvé 204 € après la première remise et 183,60 € après la seconde.",
    "J'ai trouvé 23,5 % de remise globale, en le justifiant par un calcul.",
    "J'ai rédigé une phrase expliquant que la seconde remise ne porte pas sur le prix de départ."
  ]
});

/* ===== pap-2-03 — Moyenne pondérée ===== */
PAPIERS.push({
  id: 'pap-2-03',
  phase: 2,
  titre: "La moyenne du bulletin",
  duree: 12,
  skills: ['p2-09-statistiques','p2-10-problemes'],
  enonce: `<p>Voici les moyennes trimestrielles d'un élève de terminale STMG, accompagnées des coefficients de l'examen.</p>
<table class="tbl">
<tr><th>Matière</th><th>Note</th><th>Coefficient</th></tr>
<tr><td>Gestion et finance</td><td>11</td><td>6</td></tr>
<tr><td>Management</td><td>12</td><td>5</td></tr>
<tr><td>Mathématiques</td><td>8</td><td>4</td></tr>
<tr><td>Français</td><td>13</td><td>3</td></tr>
<tr><td>Anglais</td><td>9</td><td>2</td></tr>
</table>
<ol>
<li>Calculer la moyenne pondérée de cet élève. Détailler le calcul.</li>
<li>Calculer la moyenne simple des cinq notes, sans tenir compte des coefficients, puis expliquer en une phrase pourquoi les deux résultats sont différents.</li>
<li>Quelle note aurait-il fallu obtenir en management (coefficient 5), toutes les autres notes restant inchangées, pour atteindre exactement 11 de moyenne pondérée ?</li>
<li>Le professeur principal affirme : « Gagner un point en anglais ferait plus progresser ta moyenne que gagner un point en gestion et finance. » A-t-il raison ? Justifier par un calcul et conclure par une phrase.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>1.</strong> Je multiplie chaque note par son coefficient :</p>
<p>11 × 6 = 66</p>
<p>12 × 5 = 60</p>
<p>8 × 4 = 32</p>
<p>13 × 3 = 39</p>
<p>9 × 2 = 18</p>
<p>Somme des produits : 66 + 60 + 32 + 39 + 18 = 215</p>
<p>Somme des coefficients : 6 + 5 + 4 + 3 + 2 = 20</p>
<p>Moyenne pondérée : 215 ÷ 20 = 10,75</p>
<p><strong>La moyenne pondérée de l'élève est 10,75.</strong></p>
</div>
<div class="etapes">
<p><strong>2.</strong> Moyenne simple des cinq notes :</p>
<p>11 + 12 + 8 + 13 + 9 = 53</p>
<p>53 ÷ 5 = 10,6</p>
<p><strong>La moyenne simple est 10,6.</strong></p>
<p>Les deux résultats diffèrent parce que les coefficients donnent plus d'importance à certaines matières : ici, les deux notes les plus fortement coefficientées (11 en gestion et finance, coefficient 6, et 12 en management, coefficient 5) sont supérieures à 10,6, ce qui tire la moyenne pondérée vers le haut.</p>
</div>
<div class="etapes">
<p><strong>3.</strong> Pour obtenir 11 de moyenne pondérée, la somme des produits doit valoir :</p>
<p>11 × 20 = 220</p>
<p>Sans le management, la somme des produits vaut : 215 − 60 = 155</p>
<p>Il faut donc que la note de management, multipliée par 5, apporte : 220 − 155 = 65</p>
<p>Note nécessaire : 65 ÷ 5 = 13</p>
<p>Vérification : 66 + 65 + 32 + 39 + 18 = 220 et 220 ÷ 20 = 11.</p>
<p><strong>Il aurait fallu 13 en management pour atteindre exactement 11 de moyenne.</strong></p>
</div>
<div class="etapes">
<p><strong>4.</strong> Un point de plus en anglais (coefficient 2) ajoute 2 à la somme des produits :</p>
<p>2 ÷ 20 = 0,1, donc la moyenne gagne 0,1 point.</p>
<p>Un point de plus en gestion et finance (coefficient 6) ajoute 6 à la somme des produits :</p>
<p>6 ÷ 20 = 0,3, donc la moyenne gagne 0,3 point.</p>
<p><strong>Le professeur principal a tort : un point gagné en gestion et finance fait progresser la moyenne trois fois plus qu'un point gagné en anglais, car son coefficient est trois fois plus élevé.</strong></p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Diviser par 5, le nombre de matières, au lieu de diviser par 20, la somme des coefficients. C'est l'erreur numéro un sur la moyenne pondérée, et elle donne ici 43 au lieu de 10,75 — un résultat impossible pour une note sur 20, ce qui doit alerter tout de suite. Seconde erreur : à la question 3, ajouter simplement la différence de moyenne à la note de management sans passer par la somme des produits.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Les cinq produits écrits un par un, les deux sommes clairement identifiées (215 et 20) avant la division, un résultat donné avec ses deux décimales, et surtout, aux questions 2 et 4, une justification qui parle des coefficients et pas seulement des nombres. Un tableau de calcul propre au brouillon, recopié en lignes sur la copie, fait gagner du temps et des points.</p></div>`,
  criteres: [
    "J'ai multiplié chaque note par son coefficient avant d'additionner.",
    "J'ai divisé par 20, la somme des coefficients, et non par 5.",
    "J'ai trouvé 10,75 de moyenne pondérée et 10,6 de moyenne simple.",
    "J'ai trouvé 13 comme note nécessaire en management, en passant par la somme des produits.",
    "J'ai justifié la question 4 par les calculs 0,1 point contre 0,3 point et conclu par une phrase."
  ]
});

})();
