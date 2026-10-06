/* ============================================================
   Phase 3 — Seconde
   papier-b.js — 5 devoirs sur papier :
   aire et factorisation, coût affine et seuil de rentabilité,
   évolutions successives et réciproque, système 2×2 de prix,
   probabilités sur un tableau d'effectifs.
   ============================================================ */
(function(){

  /* ============================================================
     1. pap-3-01 — Développer, factoriser, calculer une aire
     ============================================================ */
  PAPIERS.push({
    id: 'pap-3-01',
    phase: 3,
    titre: 'La plaque découpée',
    duree: 10,
    skills: ['p3-01-identites', 'p3-02-factorisation'],
    enonce: `<p>Un atelier fabrique des plateaux. Il part d'une plaque carrée de côté <i>x</i> centimètres (avec <i>x</i> &gt; 4) et retire, dans un coin, un carré de 4 cm de côté pour loger un pied. On note A(<i>x</i>) l'aire, en cm<sup>2</sup>, de la plaque après découpe.</p>
<ol>
<li>Montrer que A(<i>x</i>) = <i>x</i><sup>2</sup> − 16.</li>
<li>Factoriser A(<i>x</i>) à l'aide d'une identité remarquable.</li>
<li>Calculer A(14) en utilisant la forme factorisée. Indiquer ensuite, en une phrase, laquelle des deux formes est la plus rapide pour ce calcul et pourquoi.</li>
<li>La matière première coûte 0,04 € par cm<sup>2</sup>. Calculer le coût de matière d'un plateau de côté 14 cm, puis conclure par une phrase.</li>
</ol>`,
    corrige: `<div class="etapes">
<p><b>Question 1.</b> La plaque de départ est un carré de côté <i>x</i> cm : son aire vaut <i>x</i> × <i>x</i> = <i>x</i><sup>2</sup> cm<sup>2</sup>.</p>
<p>Le carré retiré a pour côté 4 cm : son aire vaut 4 × 4 = 16 cm<sup>2</sup>.</p>
<p>L'aire restante est la différence des deux aires : A(<i>x</i>) = <i>x</i><sup>2</sup> − 16. <b>C'est bien la forme annoncée.</b></p>
</div>
<div class="etapes">
<p><b>Question 2.</b> On reconnaît une différence de deux carrés, car 16 = 4<sup>2</sup> :</p>
<p>A(<i>x</i>) = <i>x</i><sup>2</sup> − 4<sup>2</sup>.</p>
<p>Or, pour tous nombres <i>a</i> et <i>b</i> : <i>a</i><sup>2</sup> − <i>b</i><sup>2</sup> = (<i>a</i> − <i>b</i>)(<i>a</i> + <i>b</i>).</p>
<p>Avec <i>a</i> = <i>x</i> et <i>b</i> = 4 : <b>A(<i>x</i>) = (<i>x</i> − 4)(<i>x</i> + 4)</b>.</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> On remplace <i>x</i> par 14 dans la forme factorisée :</p>
<p>A(14) = (14 − 4) × (14 + 4)</p>
<p>A(14) = 10 × 18</p>
<p>A(14) = <b>180 cm<sup>2</sup></b>.</p>
<p>La forme factorisée est la plus rapide : elle ne demande qu'une soustraction, une addition et une multiplication, alors que la forme développée oblige à calculer d'abord 14<sup>2</sup> = 196, puis 196 − 16 = 180.</p>
</div>
<div class="etapes">
<p><b>Question 4.</b> Le coût est proportionnel à l'aire : coût = aire × prix au cm<sup>2</sup>.</p>
<p>Coût = 180 × 0,04</p>
<p>Coût = <b>7,20 €</b>.</p>
<p><b>Conclusion :</b> un plateau découpé dans une plaque de 14 cm de côté revient à 7,20 € de matière première.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Écrire A(<i>x</i>) = (<i>x</i> − 4)<sup>2</sup>. C'est faux : (<i>x</i> − 4)<sup>2</sup> = <i>x</i><sup>2</sup> − 8<i>x</i> + 16, ce qui n'est pas <i>x</i><sup>2</sup> − 16. La différence de deux carrés se factorise avec deux parenthèses <b>différentes</b> : (<i>x</i> − 4)(<i>x</i> + 4). En cas de doute, redéveloppe pour vérifier.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Que l'aire soit posée comme une différence (grand carré moins petit carré) avant tout calcul, que l'identité <i>a</i><sup>2</sup> − <i>b</i><sup>2</sup> = (<i>a</i> − <i>b</i>)(<i>a</i> + <i>b</i>) soit citée, que chaque valeur numérique apparaisse avec son unité (cm<sup>2</sup> puis €), et que la dernière ligne soit une phrase, pas un nombre isolé.</p></div>`,
    criteres: [
      "J'ai écrit l'aire comme une différence : aire du grand carré moins aire du petit carré.",
      "J'ai cité l'identité a² − b² = (a − b)(a + b) avant de factoriser.",
      "J'ai trouvé A(x) = (x − 4)(x + 4) et A(14) = 180 cm².",
      "J'ai trouvé un coût de 7,20 € en écrivant le calcul 180 × 0,04.",
      "J'ai terminé par une phrase de conclusion avec les unités."
    ]
  });

  /* ============================================================
     2. pap-3-02 — Fonction affine, coût et seuil de rentabilité
     ============================================================ */
  PAPIERS.push({
    id: 'pap-3-02',
    phase: 3,
    titre: 'Le seuil de rentabilité de l\'atelier',
    duree: 12,
    skills: ['p3-05-droites', 'p3-03-inequations'],
    enonce: `<p>Un atelier fabrique des lampes artisanales. Chaque mois, il supporte 450 € de charges fixes (loyer, assurance) auxquelles s'ajoute un coût de 12 € par lampe fabriquée. Chaque lampe est vendue 30 €. On note <i>q</i> le nombre de lampes fabriquées et vendues dans le mois.</p>
<ol>
<li>Exprimer le coût total C(<i>q</i>) en fonction de <i>q</i>. Préciser le coefficient directeur et l'ordonnée à l'origine de cette fonction affine, et expliquer ce que chacun représente pour l'atelier.</li>
<li>Calculer C(40), puis le coût moyen d'une lampe lorsque l'atelier en fabrique 40.</li>
<li>Exprimer la recette R(<i>q</i>), puis résoudre l'inéquation R(<i>q</i>) ≥ C(<i>q</i>).</li>
<li>À partir de combien de lampes vendues l'atelier réalise-t-il un bénéfice strictement positif ? Justifier et conclure par une phrase.</li>
</ol>`,
    corrige: `<div class="etapes">
<p><b>Question 1.</b> Le coût se compose d'une partie fixe et d'une partie proportionnelle au nombre de lampes :</p>
<p>C(<i>q</i>) = 450 + 12<i>q</i>, soit <b>C(<i>q</i>) = 12<i>q</i> + 450</b>.</p>
<p>C'est une fonction affine de coefficient directeur 12 et d'ordonnée à l'origine 450.</p>
<p><b>Interprétation :</b> le coefficient directeur 12 est le coût variable d'<b>une lampe supplémentaire</b> (chaque lampe en plus coûte 12 €). L'ordonnée à l'origine 450 est le montant des charges fixes, payé même si aucune lampe n'est fabriquée : C(0) = 450 €.</p>
</div>
<div class="etapes">
<p><b>Question 2.</b> On remplace <i>q</i> par 40 :</p>
<p>C(40) = 12 × 40 + 450</p>
<p>C(40) = 480 + 450</p>
<p>C(40) = <b>930 €</b>.</p>
<p>Coût moyen d'une lampe = coût total ÷ nombre de lampes = 930 ÷ 40 = <b>23,25 €</b>.</p>
<p>Pour 40 lampes, chaque lampe revient en moyenne à 23,25 €, ce qui est inférieur au prix de vente de 30 €.</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> Chaque lampe est vendue 30 €, donc la recette est proportionnelle au nombre de lampes : R(<i>q</i>) = 30<i>q</i>.</p>
<p>On résout : 30<i>q</i> ≥ 12<i>q</i> + 450</p>
<p>30<i>q</i> − 12<i>q</i> ≥ 450 (on retire 12<i>q</i> aux deux membres)</p>
<p>18<i>q</i> ≥ 450</p>
<p><i>q</i> ≥ 450 ÷ 18 (on divise par 18, qui est positif : le sens de l'inégalité ne change pas)</p>
<p><b><i>q</i> ≥ 25</b>.</p>
</div>
<div class="etapes">
<p><b>Question 4.</b> Vérifions le cas limite <i>q</i> = 25 :</p>
<p>R(25) = 30 × 25 = 750 € et C(25) = 12 × 25 + 450 = 300 + 450 = 750 €.</p>
<p>Pour 25 lampes, recette et coût sont égaux : le bénéfice est nul. C'est le <b>seuil de rentabilité</b>.</p>
<p>Pour 26 lampes : R(26) = 780 € et C(26) = 312 + 450 = 762 €, soit un bénéfice de 780 − 762 = <b>18 €</b>.</p>
<p><b>Conclusion :</b> l'atelier couvre exactement ses coûts à partir de 25 lampes vendues, et ne réalise un bénéfice strictement positif qu'à partir de 26 lampes vendues dans le mois.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Répondre « à partir de 25 lampes il y a un bénéfice ». À 25 lampes, le bénéfice est <b>nul</b> : l'atelier rentre juste dans ses frais. L'inéquation R(<i>q</i>) ≥ C(<i>q</i>) donne le seuil <b>à partir duquel on n'est plus en perte</b> ; le bénéfice strictement positif commence à la valeur suivante. Autre faute fréquente : diviser 450 par 30 (le prix) au lieu de 18 (la marge par lampe).</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Que C(<i>q</i>) et R(<i>q</i>) soient écrites explicitement avant tout calcul, que le coefficient directeur et l'ordonnée à l'origine soient <b>traduits en français d'entreprise</b> (coût variable unitaire, charges fixes), que chaque étape de l'inéquation soit posée sur une ligne avec la justification du passage, et que la conclusion distingue clairement « ne plus être en perte » de « faire du bénéfice ».</p></div>`,
    criteres: [
      "J'ai écrit C(q) = 12q + 450 et R(q) = 30q avant de calculer quoi que ce soit.",
      "J'ai expliqué que 12 est le coût par lampe et 450 les charges fixes.",
      "J'ai trouvé C(40) = 930 € et un coût moyen de 23,25 € par lampe.",
      "J'ai résolu l'inéquation ligne par ligne et trouvé q ≥ 25.",
      "J'ai conclu par une phrase précisant que le bénéfice est nul à 25 lampes et positif à partir de 26."
    ]
  });

  /* ============================================================
     3. pap-3-03 — Évolutions successives et évolution réciproque
     ============================================================ */
  PAPIERS.push({
    id: 'pap-3-03',
    phase: 3,
    titre: 'Le chiffre d\'affaires de la boutique',
    duree: 12,
    skills: ['p3-06-evolutions'],
    enonce: `<p>Une boutique a réalisé un chiffre d'affaires de 80 000 € en 2024. En 2025, son chiffre d'affaires augmente de 25 %. En 2026, il baisse de 20 %.</p>
<ol>
<li>Calculer le chiffre d'affaires de 2025, puis celui de 2026. Écrire à chaque fois le coefficient multiplicateur utilisé.</li>
<li>Calculer le coefficient multiplicateur global sur les deux années et en déduire l'évolution globale, en pourcentage, entre 2024 et 2026.</li>
<li>Un employé affirme : « une hausse de 25 % suivie d'une baisse de 20 %, cela fait tout de même + 5 % sur deux ans ». Expliquer, calcul à l'appui, pourquoi ce raisonnement est faux.</li>
<li>En 2027, le chiffre d'affaires baisse encore de 20 %. Quel pourcentage de hausse faudrait-il en 2028 pour retrouver exactement le chiffre d'affaires de 2026 ? Justifier, puis conclure par une phrase.</li>
</ol>`,
    corrige: `<div class="etapes">
<p><b>Question 1.</b> Une hausse de 25 % correspond au coefficient multiplicateur CM = 1 + 25/100 = 1,25.</p>
<p>CA 2025 = 80 000 × 1,25 = <b>100 000 €</b>.</p>
<p>Une baisse de 20 % correspond au coefficient multiplicateur CM = 1 − 20/100 = 0,80.</p>
<p>CA 2026 = 100 000 × 0,80 = <b>80 000 €</b>.</p>
</div>
<div class="etapes">
<p><b>Question 2.</b> Pour des évolutions successives, on <b>multiplie</b> les coefficients multiplicateurs :</p>
<p>CM global = 1,25 × 0,80</p>
<p>CM global = <b>1</b>.</p>
<p>Un coefficient multiplicateur égal à 1 signifie qu'il n'y a aucune variation : l'évolution globale entre 2024 et 2026 est de <b>0 %</b>.</p>
<p>On le vérifie sur les valeurs : le chiffre d'affaires vaut 80 000 € en 2024 et 80 000 € en 2026.</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> L'employé <b>additionne</b> les pourcentages : + 25 − 20 = + 5. Or les pourcentages d'évolution ne s'additionnent pas, car ils ne portent pas sur la même base.</p>
<p>La hausse de 25 % s'applique à 80 000 € : elle rapporte 80 000 × 0,25 = 20 000 €.</p>
<p>La baisse de 20 % s'applique à 100 000 € (le chiffre d'affaires déjà augmenté) : elle retire 100 000 × 0,20 = 20 000 €.</p>
<p>Les deux montants se compensent exactement, d'où un CM global de 1,25 × 0,80 = 1, soit 0 % et non + 5 %.</p>
<p><b>L'employé a donc tort :</b> le chiffre d'affaires de 2026 est identique à celui de 2024, il n'a pas progressé de 5 %.</p>
</div>
<div class="etapes">
<p><b>Question 4.</b> CA 2027 = 80 000 × 0,80 = 64 000 €.</p>
<p>Pour revenir de 64 000 € à 80 000 €, on cherche le coefficient multiplicateur réciproque, c'est-à-dire celui qui annule la baisse de 20 % :</p>
<p>CM réciproque = 1 ÷ 0,80 = <b>1,25</b>.</p>
<p>Un coefficient de 1,25 correspond à une hausse de 25 %, car 1,25 = 1 + 25/100.</p>
<p>Vérification : 64 000 × 1,25 = 80 000 €. C'est bien le chiffre d'affaires de 2026.</p>
<p><b>Conclusion :</b> après une baisse de 20 %, il faut une hausse de 25 % (et non de 20 %) pour retrouver le niveau de départ.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Croire qu'une baisse de 20 % s'annule avec une hausse de 20 %. C'est faux : 0,80 × 1,20 = 0,96, soit une perte finale de 4 %. La hausse se calcule sur un montant <b>plus petit</b>, elle doit donc être d'un pourcentage <b>plus grand</b>. L'autre faute fréquente est d'additionner les pourcentages successifs au lieu de multiplier les coefficients.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Que chaque coefficient multiplicateur soit écrit et justifié (1 + <i>t</i>/100 ou 1 − <i>t</i>/100) <b>avant</b> la multiplication, que le CM global apparaisse comme un produit et non comme une somme de pourcentages, que la lecture « CM = 1,25 donc + 25 % » soit explicitée, et qu'une vérification numérique accompagne la dernière réponse.</p></div>`,
    criteres: [
      "J'ai écrit les coefficients multiplicateurs 1,25 et 0,80 avant de faire les multiplications.",
      "J'ai trouvé 100 000 € en 2025 et 80 000 € en 2026.",
      "J'ai calculé le coefficient global par un produit (1,25 × 0,80 = 1) et conclu à une évolution de 0 %.",
      "J'ai montré par un calcul que l'employé a tort, en comparant les bases 80 000 € et 100 000 €.",
      "J'ai trouvé une hausse nécessaire de 25 % et vérifié 64 000 × 1,25 = 80 000."
    ]
  });

  /* ============================================================
     4. pap-3-04 — Système 2×2 issu d'un problème de prix
     ============================================================ */
  PAPIERS.push({
    id: 'pap-3-04',
    phase: 3,
    titre: 'Les deux commandes de fournitures',
    duree: 12,
    skills: ['p3-09-systemes'],
    enonce: `<p>Le service administratif d'une entreprise commande des cartouches d'encre et des ramettes de papier, toujours aux mêmes prix unitaires.</p>
<ul>
<li>Une première commande de 3 cartouches et 4 ramettes a coûté 66 €.</li>
<li>Une seconde commande de 5 cartouches et 2 ramettes a coûté 75 €.</li>
</ul>
<ol>
<li>En précisant clairement ce que désignent les inconnues <i>x</i> et <i>y</i>, traduire la situation par un système de deux équations à deux inconnues.</li>
<li>Résoudre ce système par la méthode de ton choix, en détaillant les étapes.</li>
<li>Vérifier le couple obtenu dans les deux équations du système.</li>
<li>Le service dispose d'un budget de 90 € et souhaite commander 4 cartouches et 6 ramettes. Ce budget est-il suffisant ? Justifier par un calcul et conclure par une phrase.</li>
</ol>`,
    corrige: `<div class="etapes">
<p><b>Question 1.</b> On note <i>x</i> le prix, en euros, d'une cartouche d'encre et <i>y</i> le prix, en euros, d'une ramette de papier.</p>
<p>Première commande : 3<i>x</i> + 4<i>y</i> = 66.</p>
<p>Seconde commande : 5<i>x</i> + 2<i>y</i> = 75.</p>
<p>La situation se traduit par le système : <b>3<i>x</i> + 4<i>y</i> = 66 et 5<i>x</i> + 2<i>y</i> = 75</b>.</p>
</div>
<div class="etapes">
<p><b>Question 2.</b> Méthode par combinaison : on élimine <i>y</i>.</p>
<p>On multiplie la seconde équation par 2 : 5<i>x</i> × 2 + 2<i>y</i> × 2 = 75 × 2, soit 10<i>x</i> + 4<i>y</i> = 150.</p>
<p>Les deux équations ont maintenant le même terme 4<i>y</i>. On soustrait la première à la nouvelle :</p>
<p>(10<i>x</i> + 4<i>y</i>) − (3<i>x</i> + 4<i>y</i>) = 150 − 66</p>
<p>7<i>x</i> = 84</p>
<p><i>x</i> = 84 ÷ 7 = <b>12</b>.</p>
<p>On remplace <i>x</i> par 12 dans la première équation : 3 × 12 + 4<i>y</i> = 66.</p>
<p>36 + 4<i>y</i> = 66</p>
<p>4<i>y</i> = 66 − 36 = 30</p>
<p><i>y</i> = 30 ÷ 4 = <b>7,50</b>.</p>
<p>Le système admet pour unique solution le couple (12 ; 7,5) : une cartouche coûte <b>12 €</b> et une ramette <b>7,50 €</b>.</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> Vérification dans la première équation : 3 × 12 + 4 × 7,5 = 36 + 30 = 66. ✔</p>
<p>Vérification dans la seconde équation : 5 × 12 + 2 × 7,5 = 60 + 15 = 75. ✔</p>
<p>Les deux égalités sont vraies : le couple trouvé est bien la solution du système.</p>
</div>
<div class="etapes">
<p><b>Question 4.</b> Montant de la commande envisagée :</p>
<p>4 cartouches : 4 × 12 = 48 €.</p>
<p>6 ramettes : 6 × 7,50 = 45 €.</p>
<p>Total = 48 + 45 = <b>93 €</b>.</p>
<p>Or 93 &gt; 90, et 93 − 90 = 3.</p>
<p><b>Conclusion :</b> le budget de 90 € n'est pas suffisant, il manque 3 € pour passer cette commande.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Oublier de multiplier <b>tout</b> le second membre lors de la combinaison : écrire 10<i>x</i> + 4<i>y</i> = 75 au lieu de 150. Quand on multiplie une équation par un nombre, on multiplie les <b>trois</b> termes. Deuxième faute très fréquente : trouver <i>x</i> et s'arrêter là, sans calculer <i>y</i> ni répondre à la question posée.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Une phrase de définition des inconnues avec leur unité (« <i>x</i> désigne le prix en euros d'une cartouche ») : sans elle, le système ne vaut aucun point. Ensuite, chaque ligne de calcul posée avec le motif de la transformation, la vérification effectivement écrite, et une conclusion qui répond à la question du budget par une phrase, avec l'écart chiffré.</p></div>`,
    criteres: [
      "J'ai défini x et y par une phrase avec l'unité avant d'écrire le système.",
      "J'ai écrit correctement les deux équations 3x + 4y = 66 et 5x + 2y = 75.",
      "J'ai détaillé la méthode d'élimination et trouvé x = 12 et y = 7,50.",
      "J'ai écrit la vérification dans les deux équations (66 et 75 retrouvés).",
      "J'ai trouvé 93 € et conclu par une phrase indiquant qu'il manque 3 €."
    ]
  });

  /* ============================================================
     5. pap-3-05 — Probabilités sur un tableau d'effectifs
     ============================================================ */
  PAPIERS.push({
    id: 'pap-3-05',
    phase: 3,
    titre: 'Les paniers de la boutique',
    duree: 12,
    skills: ['p3-07-probabilites'],
    enonce: `<p>Un gérant étudie les 200 clients venus dans sa boutique un samedi. Il les classe selon le moyen de paiement (carte bancaire ou espèces) et selon le montant du panier (moins de 50 € ou 50 € et plus). Il a commencé ce tableau d'effectifs :</p>
<table class="tbl">
<thead><tr><th></th><th>Carte</th><th>Espèces</th><th>Total</th></tr></thead>
<tbody>
<tr><th>Panier de moins de 50 €</th><td></td><td></td><td></td></tr>
<tr><th>Panier de 50 € et plus</th><td>66</td><td></td><td>80</td></tr>
<tr><th>Total</th><td>120</td><td></td><td>200</td></tr>
</tbody>
</table>
<p>On choisit un client au hasard parmi les 200 ; chaque client a la même probabilité d'être choisi. On note A l'événement « le client paie par carte » et B l'événement « son panier est de 50 € et plus ».</p>
<ol>
<li>Recopier et compléter le tableau d'effectifs.</li>
<li>Calculer P(A) et P(B). Donner chaque résultat sous forme de fraction simplifiée puis en écriture décimale.</li>
<li>Calculer P(A et B), puis P(A ou B). Expliquer en une phrase pourquoi P(A ou B) n'est pas égal à P(A) + P(B).</li>
<li>Le gérant affirme : « plus de 8 clients sur 10 qui dépensent au moins 50 € paient par carte ». A-t-il raison ? Justifier par un calcul et conclure par une phrase.</li>
</ol>`,
    corrige: `<div class="etapes">
<p><b>Question 1.</b> On complète case par case, en utilisant les totaux.</p>
<p>Espèces pour les paniers de 50 € et plus : 80 − 66 = 14.</p>
<p>Total des paniers de moins de 50 € : 200 − 80 = 120.</p>
<p>Carte pour les paniers de moins de 50 € : 120 − 66 = 54.</p>
<p>Total des paiements en espèces : 200 − 120 = 80.</p>
<p>Espèces pour les paniers de moins de 50 € : 120 − 54 = 66 (ou 80 − 14 = 66, ce qui confirme le tableau).</p>
<p>Tableau complété : moins de 50 € → 54 carte, 66 espèces, total 120 ; 50 € et plus → 66 carte, 14 espèces, total 80 ; totaux → 120 carte, 80 espèces, 200 clients.</p>
</div>
<div class="etapes">
<p><b>Question 2.</b> Il y a équiprobabilité, donc chaque probabilité est le quotient de l'effectif favorable par l'effectif total.</p>
<p>P(A) = 120/200 = 3/5 = <b>0,6</b>.</p>
<p>P(B) = 80/200 = 2/5 = <b>0,4</b>.</p>
<p>Ainsi, 60 % des clients paient par carte et 40 % ont un panier d'au moins 50 €.</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> L'événement « A et B » réunit les clients qui paient par carte <b>et</b> dont le panier atteint 50 € : ils sont 66 (case commune du tableau).</p>
<p>P(A et B) = 66/200 = 33/100 = <b>0,33</b>.</p>
<p>Pour « A ou B », on utilise la formule P(A ou B) = P(A) + P(B) − P(A et B) :</p>
<p>P(A ou B) = 0,6 + 0,4 − 0,33</p>
<p>P(A ou B) = <b>0,67</b> (soit 134/200, ce que l'on retrouve en comptant 54 + 66 + 14 = 134 clients).</p>
<p>P(A ou B) n'est pas égal à P(A) + P(B) parce que les 66 clients qui vérifient les deux conditions à la fois seraient comptés deux fois : il faut donc retrancher une fois P(A et B).</p>
</div>
<div class="etapes">
<p><b>Question 4.</b> Le gérant parle uniquement des clients dont le panier atteint 50 € : ils sont 80, et 66 d'entre eux paient par carte.</p>
<p>Proportion = 66/80</p>
<p>Proportion = 0,825, soit <b>82,5 %</b>.</p>
<p>Or 82,5 % &gt; 80 %, c'est-à-dire plus de 8 clients sur 10.</p>
<p><b>Conclusion :</b> le gérant a raison ; parmi les clients dépensant au moins 50 €, 82,5 % règlent par carte bancaire.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>À la question 4, diviser 66 par 200 (0,33) au lieu de 66 par 80. Quand un énoncé dit « <b>parmi</b> les clients qui… », le dénominateur change : ce n'est plus l'effectif total, mais l'effectif du groupe dont on parle. Autre faute très répandue : écrire P(A ou B) = 0,6 + 0,4 = 1, ce qui reviendrait à dire que tout client paie par carte ou dépense 50 €, alors que 66 clients paient en espèces moins de 50 €.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Un tableau recopié en entier et complété (les cases calculées rapportent des points), la phrase d'équiprobabilité justifiant le quotient effectif favorable / effectif total, chaque probabilité donnée sous forme de fraction <b>et</b> de décimal, la formule P(A ou B) = P(A) + P(B) − P(A et B) écrite avant application, et une conclusion qui reprend l'affirmation du gérant pour la valider ou la rejeter.</p></div>`,
    criteres: [
      "J'ai recopié le tableau complet et trouvé 54, 66, 14 et 80 dans les cases manquantes.",
      "J'ai justifié que chaque probabilité s'obtient par effectif favorable ÷ 200 (équiprobabilité).",
      "J'ai trouvé P(A) = 0,6, P(B) = 0,4 et P(A et B) = 0,33.",
      "J'ai écrit la formule P(A ou B) = P(A) + P(B) − P(A et B) avant de trouver 0,67.",
      "J'ai calculé 66/80 = 82,5 % et conclu par une phrase répondant à l'affirmation du gérant."
    ]
  });

})();
