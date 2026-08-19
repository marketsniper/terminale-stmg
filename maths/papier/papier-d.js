// ============================================================
// DEVOIRS SUR PAPIER — série D
// Phase 5 (terminale) : pap-5-01 → pap-5-03
// Phase 7 (bac)       : pap-7-01 → pap-7-03
// ============================================================
(function(){

// =====================================================
// pap-5-01 — Étude complète d'une fonction de bénéfice
// =====================================================
PAPIERS.push({
  id: 'pap-5-01',
  phase: 5,
  titre: 'Le bénéfice de l\'atelier de sacs',
  duree: 20,
  skills: ['p5-01-degre3'],
  enonce: `<p>Un atelier fabrique des sacs en toile. Lorsqu'il produit et vend <em>x</em> centaines de sacs, son bénéfice mensuel, exprimé en milliers d'euros, est donné par :</p>
<div class="formule"><p>B(x) = −x<sup>3</sup> + 3x<sup>2</sup> + 24x − 28, pour x compris entre 0 et 8.</p></div>
<p>L'atelier ne peut pas produire plus de 800 sacs par mois.</p>
<ol>
<li>Calculer B(0) et B(2). Interpréter la valeur de B(0) dans le contexte de l'atelier.</li>
<li>Montrer que, pour tout x de l'intervalle [0 ; 8], B'(x) = −3(x − 4)(x + 2).</li>
<li>Étudier le signe de B'(x) sur [0 ; 8], puis dresser le tableau de variations de B.</li>
<li>En déduire le nombre de sacs à produire pour que le bénéfice soit maximal, et donner ce bénéfice en euros. Le directeur affirme : « plus on produit, plus on gagne ». Répondez-lui par une phrase en vous appuyant sur B(4) et B(8).</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>Question 1.</strong></p>
<p>B(0) = −0<sup>3</sup> + 3 × 0<sup>2</sup> + 24 × 0 − 28 = <strong>−28</strong>.</p>
<p>B(2) = −2<sup>3</sup> + 3 × 2<sup>2</sup> + 24 × 2 − 28 = −8 + 12 + 48 − 28 = <strong>24</strong>.</p>
<p>Interprétation : si l'atelier ne produit aucun sac, il perd 28 000 € par mois. Cette perte correspond aux charges fixes (loyer, salaires, machines), qui existent même sans production. Pour 200 sacs, le bénéfice est de 24 000 €.</p>
<p><strong>Question 2.</strong></p>
<p>Je dérive terme à terme : la dérivée de −x<sup>3</sup> est −3x<sup>2</sup>, celle de 3x<sup>2</sup> est 6x, celle de 24x est 24, et la constante −28 disparaît.</p>
<p>Donc B'(x) = −3x<sup>2</sup> + 6x + 24.</p>
<p>Je développe la forme proposée pour vérifier l'égalité :</p>
<p>−3(x − 4)(x + 2) = −3(x<sup>2</sup> + 2x − 4x − 8) = −3(x<sup>2</sup> − 2x − 8) = −3x<sup>2</sup> + 6x + 24.</p>
<p>Les deux expressions sont identiques, donc <strong>B'(x) = −3(x − 4)(x + 2)</strong> sur [0 ; 8].</p>
<p><strong>Question 3.</strong></p>
<p>Sur [0 ; 8], x + 2 est toujours strictement positif (car x ≥ 0 donc x + 2 ≥ 2).</p>
<p>Le signe de B'(x) ne dépend donc que de −3(x − 4), c'est-à-dire du signe de x − 4 changé.</p>
<p>• Si 0 ≤ x &lt; 4 : x − 4 &lt; 0, donc (x − 4)(x + 2) &lt; 0, donc B'(x) &gt; 0.</p>
<p>• Si x = 4 : B'(4) = 0.</p>
<p>• Si 4 &lt; x ≤ 8 : x − 4 &gt; 0, donc (x − 4)(x + 2) &gt; 0, donc B'(x) &lt; 0.</p>
<p>Tableau de variations de B sur [0 ; 8] :</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>x</th><th>0</th><th>4</th><th>8</th></tr></thead>
<tbody>
<tr><td>signe de B'(x)</td><td colspan="2">+ &nbsp; 0</td><td>−</td></tr>
<tr><td>variations de B</td><td>−28 ↗</td><td>52</td><td>↘ −156</td></tr>
</tbody>
</table></div>
<p>Valeurs utilisées : B(4) = −64 + 48 + 96 − 28 = 52 et B(8) = −512 + 192 + 192 − 28 = −156.</p>
<p><strong>Question 4.</strong></p>
<p>D'après le tableau, B est croissante sur [0 ; 4] puis décroissante sur [4 ; 8] : elle atteint donc son maximum en x = 4.</p>
<p>x = 4 correspond à 4 centaines de sacs, soit <strong>400 sacs</strong>, et B(4) = 52, soit un bénéfice maximal de <strong>52 000 €</strong> par mois.</p>
<p>Réponse au directeur : « Non, produire davantage ne fait pas toujours gagner davantage. Le bénéfice est maximal pour 400 sacs, où il atteint 52 000 €. Si l'atelier passe à 800 sacs, le bénéfice devient B(8) = −156, c'est-à-dire une perte de 156 000 € par mois. Au-delà de 400 sacs, le bénéfice diminue. »</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Oublier le signe « moins » en dérivant −x<sup>3</sup> (on écrit 3x<sup>2</sup> au lieu de −3x<sup>2</sup>) : tout le tableau de variations est alors inversé. Autre faute très fréquente : donner comme bénéfice maximal la valeur de la dérivée, B'(4) = 0, au lieu de B(4) = 52. La dérivée sert à trouver <em>où</em> se situe le maximum, la fonction donne <em>combien</em> il vaut.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Un développement écrit pour la question 2 (on ne vérifie pas une égalité « à vue »), une justification du signe de B'(x) qui s'appuie sur le signe de chaque facteur, un tableau de variations avec les valeurs 52 et −156 aux bonnes places, et une dernière réponse rédigée en phrase, avec l'unité (euros) et le nombre réel de sacs (400, pas 4).</p></div>`,
  criteres: [
    "J'ai calculé B(0) = −28 et B(2) = 24, et j'ai interprété B(0) comme les charges fixes de l'atelier",
    "J'ai écrit B'(x) = −3x² + 6x + 24 puis développé −3(x − 4)(x + 2) pour prouver l'égalité",
    "J'ai justifié le signe de B'(x) en disant que x + 2 > 0 sur [0 ; 8]",
    "J'ai dressé un tableau de variations contenant B(4) = 52 et B(8) = −156",
    "J'ai conclu par une phrase donnant 400 sacs et 52 000 €, et j'ai répondu au directeur en citant B(8)"
  ]
});

// =====================================================
// pap-5-02 — Seuil atteint par une suite géométrique
// =====================================================
PAPIERS.push({
  id: 'pap-5-02',
  phase: 5,
  titre: 'Quand faut-il revendre la machine ?',
  duree: 12,
  skills: ['p5-02-suites-applications'],
  enonce: `<p>Une imprimerie achète une machine neuve 25 000 €. Chaque année, sa valeur diminue de 20 % par rapport à l'année précédente. On note V<sub>n</sub> la valeur de la machine, en euros, au bout de n années, avec V<sub>0</sub> = 25 000.</p>
<ol>
<li>Calculer V<sub>1</sub> et V<sub>2</sub>. Justifier que la suite (V<sub>n</sub>) est géométrique et préciser sa raison.</li>
<li>Exprimer V<sub>n</sub> en fonction de n.</li>
<li>Le comptable revend la machine dès que sa valeur devient inférieure à 10 000 €. Au bout de combien d'années la machine sera-t-elle revendue ? Justifier en présentant les calculs des valeurs successives.</li>
<li>Un collègue affirme : « après 5 baisses de 20 %, la machine ne vaut plus rien, puisque 5 × 20 = 100 % ». Expliquer, en une ou deux phrases et en vous appuyant sur vos calculs, pourquoi ce raisonnement est faux.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>Question 1.</strong></p>
<p>Baisser de 20 %, c'est multiplier par le coefficient multiplicateur 1 − 20/100 = <strong>0,8</strong>.</p>
<p>V<sub>1</sub> = 25 000 × 0,8 = <strong>20 000 €</strong>.</p>
<p>V<sub>2</sub> = 20 000 × 0,8 = <strong>16 000 €</strong>.</p>
<p>Justification : chaque année, on passe d'un terme au suivant en multipliant toujours par le même nombre 0,8. Donc (V<sub>n</sub>) est une suite <strong>géométrique de raison q = 0,8</strong> et de premier terme V<sub>0</sub> = 25 000.</p>
<p><strong>Question 2.</strong></p>
<p>Pour une suite géométrique de premier terme V<sub>0</sub> et de raison q, on a V<sub>n</sub> = V<sub>0</sub> × q<sup>n</sup>.</p>
<p>Donc <strong>V<sub>n</sub> = 25 000 × 0,8<sup>n</sup></strong>.</p>
<p><strong>Question 3.</strong></p>
<p>Je calcule les termes successifs jusqu'à passer sous 10 000 € :</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>n</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr></thead>
<tbody><tr><td>V<sub>n</sub> (en €)</td><td>25 000</td><td>20 000</td><td>16 000</td><td>12 800</td><td>10 240</td><td>8 192</td></tr></tbody>
</table></div>
<p>Détail des deux derniers calculs : V<sub>4</sub> = 12 800 × 0,8 = 10 240 et V<sub>5</sub> = 10 240 × 0,8 = 8 192.</p>
<p>V<sub>4</sub> = 10 240 € est encore supérieur à 10 000 €, alors que V<sub>5</sub> = 8 192 € est inférieur à 10 000 €.</p>
<p>Conclusion : la machine sera revendue <strong>au bout de 5 ans</strong>, c'est-à-dire lorsque sa valeur tombe à 8 192 €.</p>
<p><strong>Question 4.</strong></p>
<p>Les pourcentages d'évolution ne s'additionnent pas : on multiplie les coefficients multiplicateurs.</p>
<p>Sur 5 ans, le coefficient global vaut 0,8<sup>5</sup> = 0,32768, soit environ 0,33.</p>
<p>Il reste donc 8 192 €, c'est-à-dire 8 192 ÷ 25 000 = 0,32768 ≈ 32,77 % de la valeur d'achat : la baisse globale est d'environ <strong>67,23 %</strong>, et non de 100 %.</p>
<p>Phrase de conclusion : « Le collègue a tort : chaque baisse de 20 % s'applique à une valeur de plus en plus petite, donc la machine vaut encore 8 192 € au bout de 5 ans, soit près d'un tiers de son prix d'achat. »</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Écrire V<sub>n</sub> = 25 000 − 20n, ou calculer 25 000 × 0,2 pour trouver la nouvelle valeur. 0,2 est ce que l'on <em>perd</em>, 0,8 est ce qu'il <em>reste</em>. Autre confusion fréquente : répondre « 4 ans » parce que V<sub>4</sub> est la première valeur affichée proche de 10 000 — il faut la valeur strictement inférieure au seuil, donc V<sub>5</sub>.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Le coefficient multiplicateur 0,8 écrit explicitement, la phrase de justification « on multiplie toujours par le même nombre, donc la suite est géométrique de raison 0,8 », la formule V<sub>n</sub> = V<sub>0</sub> × q<sup>n</sup> appliquée, et surtout l'encadrement du seuil : V<sub>4</sub> ≥ 10 000 et V<sub>5</sub> &lt; 10 000. Une réponse au seuil sans montrer les deux termes qui encadrent perd des points.</p></div>`,
  criteres: [
    "J'ai écrit le coefficient multiplicateur 0,8 avant de faire le moindre calcul",
    "J'ai justifié par une phrase que la suite est géométrique de raison 0,8",
    "J'ai écrit la formule Vn = 25 000 × 0,8^n",
    "J'ai montré les deux valeurs qui encadrent le seuil : V4 = 10 240 € et V5 = 8 192 €, et j'ai répondu 5 ans",
    "J'ai expliqué au collègue, par une phrase, qu'on multiplie les coefficients au lieu d'additionner les pourcentages"
  ]
});

// =====================================================
// pap-5-03 — Probabilités totales sur un arbre
// =====================================================
PAPIERS.push({
  id: 'pap-5-03',
  phase: 5,
  titre: 'Deux fournisseurs, une pièce défectueuse',
  duree: 15,
  skills: ['p5-03-probas-totales'],
  enonce: `<p>Une entreprise de montage achète ses pièces auprès de deux fournisseurs. Le fournisseur A livre 75 % des pièces, le fournisseur B livre le reste. On sait que 2 % des pièces livrées par A sont défectueuses, contre 6 % des pièces livrées par B.</p>
<p>On prélève une pièce au hasard dans le stock. On note :</p>
<p>• A l'événement « la pièce vient du fournisseur A » ; • B l'événement « la pièce vient du fournisseur B » ; • D l'événement « la pièce est défectueuse ».</p>
<ol>
<li>Construire l'arbre pondéré décrivant cette situation.</li>
<li>Calculer la probabilité que la pièce prélevée vienne de B et soit défectueuse.</li>
<li>Montrer que la probabilité qu'une pièce prélevée au hasard soit défectueuse est égale à 0,03.</li>
<li>La pièce prélevée est défectueuse. Calculer la probabilité qu'elle vienne du fournisseur B, puis interpréter ce résultat en une phrase destinée au responsable des achats.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>Question 1.</strong></p>
<p>L'arbre comporte deux niveaux : d'abord le fournisseur, ensuite l'état de la pièce.</p>
<div class="formule"><p>1<sup>er</sup> niveau : A (0,75) et B (0,25)<br>
depuis A : D (0,02) et non-D (0,98)<br>
depuis B : D (0,06) et non-D (0,94)</p></div>
<p>P(B) = 1 − 0,75 = 0,25, car A et B forment une partition (une pièce vient soit de A, soit de B).</p>
<p>Sur chaque paire de branches, la somme des probabilités vaut bien 1 : 0,75 + 0,25 = 1 ; 0,02 + 0,98 = 1 ; 0,06 + 0,94 = 1.</p>
<p><strong>Question 2.</strong></p>
<p>On suit le chemin B puis D, donc on multiplie les probabilités rencontrées :</p>
<p>P(B ∩ D) = P(B) × P<sub>B</sub>(D) = 0,25 × 0,06 = <strong>0,015</strong>.</p>
<p>Phrase : il y a 1,5 % de chances que la pièce prélevée vienne de B et soit défectueuse.</p>
<p><strong>Question 3.</strong></p>
<p>Les événements A et B forment une partition de l'univers, j'applique donc la formule des probabilités totales :</p>
<p>P(D) = P(A ∩ D) + P(B ∩ D).</p>
<p>P(A ∩ D) = P(A) × P<sub>A</sub>(D) = 0,75 × 0,02 = 0,015.</p>
<p>P(B ∩ D) = 0,015 (question 2).</p>
<p>Donc P(D) = 0,015 + 0,015 = <strong>0,03</strong>.</p>
<p>Phrase : 3 % des pièces du stock sont défectueuses.</p>
<p><strong>Question 4.</strong></p>
<p>On cherche une probabilité conditionnelle « sachant D » :</p>
<p>P<sub>D</sub>(B) = P(B ∩ D) ÷ P(D) = 0,015 ÷ 0,03 = <strong>0,5</strong>.</p>
<p>Interprétation : « Lorsqu'une pièce est défectueuse, elle a une chance sur deux de provenir du fournisseur B, alors que B ne livre qu'un quart des pièces. B est donc responsable de la moitié des défauts avec seulement 25 % des livraisons : c'est ce fournisseur qu'il faut renégocier ou contrôler en priorité. »</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Additionner les taux de défaut (2 % + 6 % = 8 %) au lieu de les pondérer par la part de chaque fournisseur. Autre confusion majeure : écrire P<sub>D</sub>(B) = 0,06. Attention au sens de la lecture : P<sub>B</sub>(D) = 0,06 signifie « parmi les pièces de B, 6 % sont défectueuses », alors que P<sub>D</sub>(B) = 0,5 signifie « parmi les pièces défectueuses, la moitié vient de B ». Ce ne sont pas les mêmes populations de départ.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Un arbre propre avec les six probabilités écrites sur les branches, les formules posées avant les calculs (P(B ∩ D) = P(B) × P<sub>B</sub>(D), puis P(D) = P(A ∩ D) + P(B ∩ D)), le nom de la formule des probabilités totales cité, et une interprétation finale qui compare 0,5 à la part réelle de B (0,25). C'est cette comparaison qui rapporte le point d'interprétation.</p></div>`,
  criteres: [
    "J'ai construit l'arbre avec 0,75 et 0,25 au premier niveau, puis 0,02 et 0,06 au second",
    "J'ai écrit P(B ∩ D) = P(B) × PB(D) avant de calculer, et trouvé 0,015",
    "J'ai utilisé la formule des probabilités totales P(D) = P(A ∩ D) + P(B ∩ D) et trouvé 0,03",
    "J'ai trouvé PD(B) = 0,015 ÷ 0,03 = 0,5",
    "J'ai interprété par une phrase comparant les 50 % de défauts imputables à B à ses 25 % de livraisons"
  ]
});

// =====================================================
// pap-7-01 — Ajustement affine, prévision et évolution
// =====================================================
PAPIERS.push({
  id: 'pap-7-01',
  phase: 7,
  titre: 'Prévoir le chiffre d\'affaires de 2030',
  duree: 15,
  skills: ['p7-01-automatismes-bac', 'p7-03-revision-probas', 'p5-04-stats-deux-variables'],
  enonce: `<p>Le tableau ci-dessous donne le chiffre d'affaires annuel d'une PME, en milliers d'euros, de 2020 à 2025. On note x<sub>i</sub> le rang de l'année (x<sub>i</sub> = 0 pour 2020) et y<sub>i</sub> le chiffre d'affaires correspondant.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Année</th><th>2020</th><th>2021</th><th>2022</th><th>2023</th><th>2024</th><th>2025</th></tr></thead>
<tbody>
<tr><td>Rang x<sub>i</sub></td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
<tr><td>CA y<sub>i</sub> (milliers d'€)</td><td>120</td><td>134</td><td>146</td><td>160</td><td>178</td><td>186</td></tr>
</tbody>
</table></div>
<p>On admet que la droite d'ajustement affine de y en x, obtenue par la méthode des moindres carrés, a pour équation y = 13,6x + 120.</p>
<ol>
<li>Calculer le taux d'évolution global du chiffre d'affaires entre 2020 et 2025.</li>
<li>Calculer les coordonnées du point moyen G du nuage de points, puis vérifier par le calcul que G appartient à la droite d'ajustement.</li>
<li>À l'aide de cet ajustement, estimer le chiffre d'affaires de l'entreprise en 2028.</li>
<li>La direction s'est fixé pour objectif de dépasser 250 000 € de chiffre d'affaires en 2030. Cet objectif sera-t-il atteint selon ce modèle ? Justifier, puis indiquer en une phrase une limite de cette prévision.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>Question 1.</strong></p>
<p>Taux d'évolution = (valeur d'arrivée − valeur de départ) ÷ valeur de départ.</p>
<p>t = (186 − 120) ÷ 120 = 66 ÷ 120 = 0,55.</p>
<p>Le chiffre d'affaires a augmenté de <strong>55 %</strong> entre 2020 et 2025.</p>
<p><strong>Question 2.</strong></p>
<p>Abscisse du point moyen : x̄ = (0 + 1 + 2 + 3 + 4 + 5) ÷ 6 = 15 ÷ 6 = <strong>2,5</strong>.</p>
<p>Ordonnée du point moyen : ȳ = (120 + 134 + 146 + 160 + 178 + 186) ÷ 6 = 924 ÷ 6 = <strong>154</strong>.</p>
<p>Donc G(2,5 ; 154).</p>
<p>Vérification : pour x = 2,5, la droite donne y = 13,6 × 2,5 + 120 = 34 + 120 = 154.</p>
<p>On obtient exactement l'ordonnée de G, donc <strong>G appartient bien à la droite d'ajustement</strong> (c'est une propriété de la droite des moindres carrés : elle passe toujours par le point moyen).</p>
<p><strong>Question 3.</strong></p>
<p>L'année 2028 correspond au rang x = 2028 − 2020 = <strong>8</strong>.</p>
<p>y = 13,6 × 8 + 120 = 108,8 + 120 = 228,8.</p>
<p>Le chiffre d'affaires estimé en 2028 est de 228,8 milliers d'euros, soit environ <strong>228 800 €</strong>.</p>
<p><strong>Question 4.</strong></p>
<p>L'année 2030 correspond au rang x = 2030 − 2020 = 10.</p>
<p>y = 13,6 × 10 + 120 = 136 + 120 = 256.</p>
<p>Le modèle prévoit un chiffre d'affaires de 256 milliers d'euros, soit <strong>256 000 €</strong>.</p>
<p>Comme 256 000 &gt; 250 000, l'objectif serait atteint : « Selon cet ajustement affine, le chiffre d'affaires de 2030 atteindrait 256 000 €, l'objectif de 250 000 € serait donc dépassé. »</p>
<p>Limite du modèle : il s'agit d'une extrapolation à 5 ans au-delà des données connues ; elle suppose que la croissance reste linéaire, ce qui n'est pas garanti (concurrence, crise, saturation du marché). La prévision doit donc être prise avec prudence.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Remplacer x par 2028 au lieu du rang 8 : on obtient alors un chiffre d'affaires absurde de plus de 27 000 milliers d'euros. Deuxième faute très fréquente : diviser par la valeur d'arrivée pour le taux d'évolution (66 ÷ 186), ce qui donne 35,5 % au lieu de 55 %. On divise toujours par la valeur de <em>départ</em>.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Le calcul du rang écrit explicitement (2028 − 2020 = 8), les moyennes posées avec leur somme, la vérification numérique pour G (et non une simple affirmation), et une réponse finale en phrase avec la comparaison chiffrée 256 000 &gt; 250 000. Le point sur la limite du modèle s'obtient en employant le mot « extrapolation » ou en disant que la tendance observée peut ne pas se poursuivre.</p></div>`,
  criteres: [
    "J'ai calculé le taux d'évolution en divisant par la valeur de départ et trouvé +55 %",
    "J'ai trouvé G(2,5 ; 154) en posant les deux moyennes",
    "J'ai vérifié par le calcul 13,6 × 2,5 + 120 = 154 que G est sur la droite",
    "J'ai utilisé le rang x = 8 pour 2028 et x = 10 pour 2030 (et non l'année elle-même)",
    "J'ai conclu par une phrase comparant 256 000 € à l'objectif de 250 000 € et évoqué la limite de l'extrapolation"
  ]
});

// =====================================================
// pap-7-02 — Synthèse : fonction + suite (format bac)
// =====================================================
PAPIERS.push({
  id: 'pap-7-02',
  phase: 7,
  titre: 'Location de vélos : deux parties, un même problème',
  duree: 20,
  skills: ['p7-02-revision-analyse'],
  enonce: `<p>Une petite entreprise propose des vélos en location par abonnement mensuel. Au-delà d'un certain nombre d'abonnés, elle doit louer des vélos supplémentaires et un local plus grand, ce qui fait chuter son résultat.</p>
<p><strong>Partie A.</strong> Lorsque l'entreprise compte x abonnés (avec 0 ≤ x ≤ 60), son bénéfice mensuel, en euros, est donné par :</p>
<div class="formule"><p>B(x) = −x<sup>2</sup> + 60x − 500.</p></div>
<ol>
<li>Calculer B'(x), étudier son signe sur [0 ; 60] et dresser le tableau de variations de B. En déduire le nombre d'abonnés qui rend le bénéfice maximal, ainsi que ce bénéfice.</li>
<li>Vérifier que B(10) = 0 et B(50) = 0. En déduire, en vous appuyant sur les variations de B, l'ensemble des nombres d'abonnés pour lesquels l'entreprise réalise un bénéfice positif.</li>
</ol>
<p><strong>Partie B.</strong> En janvier, l'entreprise compte 30 abonnés. Grâce à sa campagne de communication, ce nombre augmente de 10 % chaque mois. On note u<sub>n</sub> le nombre d'abonnés au bout de n mois, avec u<sub>0</sub> = 30.</p>
<ol start="3">
<li>Justifier que (u<sub>n</sub>) est une suite géométrique, préciser sa raison, exprimer u<sub>n</sub> en fonction de n et calculer u<sub>4</sub> arrondi à l'unité.</li>
<li>Déterminer au bout de combien de mois le nombre d'abonnés dépassera 50, et préciser le mois correspondant. Expliquer ensuite au gérant, en deux phrases s'appuyant sur la partie A, pourquoi cette croissance est une mauvaise nouvelle.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>Question 1.</strong></p>
<p>Je dérive : la dérivée de −x<sup>2</sup> est −2x, celle de 60x est 60, la constante −500 disparaît.</p>
<p>B'(x) = −2x + 60.</p>
<p>Signe : B'(x) &gt; 0 équivaut à −2x + 60 &gt; 0, soit 60 &gt; 2x, soit x &lt; 30.</p>
<p>Donc B'(x) &gt; 0 sur [0 ; 30[, B'(30) = 0, et B'(x) &lt; 0 sur ]30 ; 60].</p>
<p>Valeurs utiles : B(0) = −500 ; B(30) = −900 + 1 800 − 500 = 400 ; B(60) = −3 600 + 3 600 − 500 = −500.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>x</th><th>0</th><th>30</th><th>60</th></tr></thead>
<tbody>
<tr><td>signe de B'(x)</td><td colspan="2">+ &nbsp; 0</td><td>−</td></tr>
<tr><td>variations de B</td><td>−500 ↗</td><td>400</td><td>↘ −500</td></tr>
</tbody>
</table></div>
<p>Conclusion : le bénéfice est maximal pour <strong>30 abonnés</strong> et vaut alors <strong>400 €</strong> par mois.</p>
<p><strong>Question 2.</strong></p>
<p>B(10) = −10<sup>2</sup> + 60 × 10 − 500 = −100 + 600 − 500 = <strong>0</strong>.</p>
<p>B(50) = −50<sup>2</sup> + 60 × 50 − 500 = −2 500 + 3 000 − 500 = <strong>0</strong>.</p>
<p>Raisonnement : B est croissante sur [0 ; 30]. Comme B(10) = 0, on a B(x) &lt; 0 avant 10 et B(x) &gt; 0 entre 10 et 30. B est décroissante sur [30 ; 60] et B(50) = 0, donc B(x) &gt; 0 entre 30 et 50, puis B(x) &lt; 0 après 50.</p>
<p>Conclusion : l'entreprise est bénéficiaire lorsque le nombre d'abonnés est compris entre <strong>10 et 50</strong> (bénéfice nul aux deux bornes).</p>
<p><strong>Question 3.</strong></p>
<p>Augmenter de 10 %, c'est multiplier par 1 + 10/100 = <strong>1,1</strong>.</p>
<p>On passe donc d'un mois au suivant en multipliant toujours par le même nombre : (u<sub>n</sub>) est <strong>géométrique de raison q = 1,1</strong>, de premier terme u<sub>0</sub> = 30.</p>
<p>u<sub>n</sub> = 30 × 1,1<sup>n</sup>.</p>
<p>u<sub>4</sub> = 30 × 1,1<sup>4</sup> = 30 × 1,4641 = 43,923, soit environ <strong>44 abonnés</strong>.</p>
<p><strong>Question 4.</strong></p>
<p>Je calcule les termes successifs (arrondis au centième) :</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>n</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr></thead>
<tbody><tr><td>u<sub>n</sub></td><td>30</td><td>33</td><td>36,3</td><td>39,93</td><td>43,92</td><td>48,32</td><td>53,15</td></tr></tbody>
</table></div>
<p>u<sub>5</sub> ≈ 48,32 &lt; 50 et u<sub>6</sub> ≈ 53,15 &gt; 50.</p>
<p>Le nombre d'abonnés dépasse donc 50 <strong>au bout de 6 mois</strong>. Comme le mois 0 est janvier, il s'agit du mois de <strong>juillet</strong>.</p>
<p>Explication au gérant : « D'après la partie A, l'entreprise n'est bénéficiaire que si elle compte entre 10 et 50 abonnés. En juillet, elle dépassera 50 abonnés : son bénéfice deviendra donc négatif, car les coûts supplémentaires de vélos et de local dépasseront les recettes. Il faudra soit augmenter le prix de l'abonnement, soit revoir le modèle avant l'été. »</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Calculer u<sub>6</sub> = 30 × 1,1 × 6 (on additionne six hausses) au lieu de 30 × 1,1<sup>6</sup>. Et dans la partie A, croire que « bénéfice positif » signifie « fonction croissante » : la fonction décroît déjà entre 30 et 50 abonnés alors que le bénéfice y reste positif. Variations et signe sont deux questions différentes.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Un tableau de variations complet avec B(30) = 400, les deux vérifications numériques B(10) = 0 et B(50) = 0 posées entièrement, l'encadrement du seuil (u<sub>5</sub> &lt; 50 &lt; u<sub>6</sub>) et surtout la dernière phrase qui relie les deux parties : c'est là que se joue le point de synthèse, celui que la plupart des candidats oublient parce qu'ils traitent les parties comme deux exercices séparés.</p></div>`,
  criteres: [
    "J'ai écrit B'(x) = −2x + 60 et justifié son signe par une inéquation",
    "J'ai trouvé un bénéfice maximal de 400 € pour 30 abonnés, avec un tableau de variations",
    "J'ai calculé B(10) et B(50) en entier et conclu que le bénéfice est positif entre 10 et 50 abonnés",
    "J'ai écrit un = 30 × 1,1^n et encadré le seuil avec u5 ≈ 48,32 et u6 ≈ 53,15",
    "J'ai rédigé une conclusion qui relie la partie B à la partie A en citant le seuil de 50 abonnés"
  ]
});

// =====================================================
// pap-7-03 — Synthèse : arbre, probabilités totales et évolution
// =====================================================
PAPIERS.push({
  id: 'pap-7-03',
  phase: 7,
  titre: 'Carte de fidélité et achats en ligne',
  duree: 18,
  skills: ['p7-03-revision-probas', 'p7-01-automatismes-bac'],
  enonce: `<p>Une enseigne de sport étudie le comportement de ses clients. On sait que 60 % d'entre eux possèdent la carte de fidélité. Parmi les clients qui possèdent la carte, 45 % ont déjà acheté en ligne ; parmi ceux qui ne la possèdent pas, seuls 20 % l'ont fait.</p>
<p>On interroge un client au hasard. On note F l'événement « le client possède la carte de fidélité » et L l'événement « le client a déjà acheté en ligne ».</p>
<ol>
<li>Construire l'arbre pondéré de la situation, puis calculer P(F ∩ L) et interpréter ce résultat par une phrase.</li>
<li>Montrer que la probabilité qu'un client ait déjà acheté en ligne est égale à 0,35.</li>
<li>L'enseigne compte 4 000 clients. Combien d'entre eux ont déjà acheté en ligne ? L'objectif du responsable est d'atteindre 1 750 clients acheteurs en ligne : quel taux d'évolution cela représente-t-il ?</li>
<li>Le client interrogé a déjà acheté en ligne. Calculer la probabilité qu'il possède la carte de fidélité (arrondir au centième). Comparer ce résultat à P(F) et rédiger la conclusion que le responsable marketing peut en tirer.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><strong>Question 1.</strong></p>
<p>P(F) = 0,6, donc P(non-F) = 1 − 0,6 = 0,4. Les données de l'énoncé sont des probabilités conditionnelles : P<sub>F</sub>(L) = 0,45 et P<sub>non-F</sub>(L) = 0,20.</p>
<div class="formule"><p>1<sup>er</sup> niveau : F (0,6) et non-F (0,4)<br>
depuis F : L (0,45) et non-L (0,55)<br>
depuis non-F : L (0,20) et non-L (0,80)</p></div>
<p>P(F ∩ L) = P(F) × P<sub>F</sub>(L) = 0,6 × 0,45 = <strong>0,27</strong>.</p>
<p>Interprétation : 27 % des clients de l'enseigne possèdent la carte de fidélité <em>et</em> ont déjà acheté en ligne.</p>
<p><strong>Question 2.</strong></p>
<p>F et non-F forment une partition de l'univers, j'applique la formule des probabilités totales :</p>
<p>P(L) = P(F ∩ L) + P(non-F ∩ L).</p>
<p>P(non-F ∩ L) = P(non-F) × P<sub>non-F</sub>(L) = 0,4 × 0,20 = 0,08.</p>
<p>Donc P(L) = 0,27 + 0,08 = <strong>0,35</strong>.</p>
<p>Phrase : 35 % des clients ont déjà acheté en ligne.</p>
<p><strong>Question 3.</strong></p>
<p>Nombre de clients acheteurs en ligne : 4 000 × 0,35 = <strong>1 400 clients</strong>.</p>
<p>Taux d'évolution pour passer de 1 400 à 1 750 :</p>
<p>t = (1 750 − 1 400) ÷ 1 400 = 350 ÷ 1 400 = 0,25.</p>
<p>L'objectif correspond à une hausse de <strong>25 %</strong> du nombre de clients acheteurs en ligne.</p>
<p><strong>Question 4.</strong></p>
<p>On cherche la probabilité de F sachant L :</p>
<p>P<sub>L</sub>(F) = P(F ∩ L) ÷ P(L) = 0,27 ÷ 0,35 ≈ <strong>0,77</strong>.</p>
<p>Comparaison : dans l'ensemble de la clientèle, 60 % des clients ont la carte (P(F) = 0,6) ; mais parmi les seuls acheteurs en ligne, ils sont environ 77 %.</p>
<p>Conclusion pour le responsable marketing : « Les porteurs de la carte de fidélité sont nettement surreprésentés parmi les acheteurs en ligne : 77 % contre 60 % dans l'ensemble de la clientèle. Développer les ventes en ligne passe donc en priorité par le recrutement de nouveaux porteurs de carte. »</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Confondre P<sub>L</sub>(F) et P<sub>F</sub>(L). L'énoncé donne P<sub>F</sub>(L) = 0,45 (parmi les porteurs de carte, 45 % achètent en ligne) ; la question 4 demande l'inverse, P<sub>L</sub>(F) ≈ 0,77 (parmi les acheteurs en ligne, 77 % ont la carte). Autre faute : calculer le taux d'évolution en divisant 350 par 1 750, ce qui donne 20 % au lieu de 25 %.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Un arbre complet avec les probabilités manquantes calculées (0,4 ; 0,55 ; 0,80), la formule des probabilités totales citée puis appliquée, la formule P<sub>L</sub>(F) = P(F ∩ L) ÷ P(L) posée avant le calcul, et une conclusion qui compare explicitement 0,77 à 0,60. Une réponse qui donne 0,77 sans le comparer à P(F) perd le point d'interprétation.</p></div>`,
  criteres: [
    "J'ai complété l'arbre avec P(non-F) = 0,4 et les branches manquantes 0,55 et 0,80",
    "J'ai calculé P(F ∩ L) = 0,6 × 0,45 = 0,27 et je l'ai interprété par une phrase",
    "J'ai appliqué la formule des probabilités totales pour obtenir P(L) = 0,35",
    "J'ai trouvé 1 400 clients acheteurs en ligne et un taux d'évolution de +25 %",
    "J'ai posé PL(F) = P(F ∩ L) ÷ P(L) ≈ 0,77 et conclu en comparant ce résultat à P(F) = 0,6"
  ]
});

})();
