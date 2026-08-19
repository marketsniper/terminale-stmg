(function(){

// ============================================================
// pap-4-01 — Second degré : bénéfice, racines, maximum
// ============================================================
PAPIERS.push({
  id: 'pap-4-01',
  phase: 4,
  titre: "Le bénéfice de l'atelier de coffrets",
  duree: 12,
  skills: ['p4-01-second-degre'],
  enonce: `<p>Un atelier fabrique et vend des coffrets cadeaux. Lorsqu'il vend x coffrets dans la journée, son bénéfice, exprimé en euros, est modélisé par la fonction B définie sur l'intervalle [0 ; 60] par :</p>
<div class="formule"><p>B(x) = −x² + 60x − 500</p></div>
<ol>
<li>Calculer B(15), puis interpréter ce résultat dans le contexte de l'exercice.</li>
<li>Résoudre l'équation B(x) = 0 en utilisant le discriminant. On détaillera le calcul de Δ.</li>
<li>En étudiant le signe de B(x), déterminer le nombre de coffrets que l'atelier doit vendre pour réaliser un bénéfice strictement positif. Justifier.</li>
<li>Déterminer le nombre de coffrets qui rend le bénéfice maximal, puis calculer ce bénéfice maximal. Conclure par une phrase.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><b>Question 1.</b> Je remplace x par 15 dans B(x) :</p>
<p>B(15) = −(15)² + 60 × 15 − 500 = −225 + 900 − 500 = <b>175</b>.</p>
<p>En vendant 15 coffrets dans la journée, l'atelier réalise un bénéfice de <b>175 €</b>.</p>
</div>
<div class="etapes">
<p><b>Question 2.</b> Je résous B(x) = 0, c'est-à-dire −x² + 60x − 500 = 0.</p>
<p>J'identifie les coefficients : a = −1, b = 60, c = −500.</p>
<p>Je calcule le discriminant : Δ = b² − 4ac = 60² − 4 × (−1) × (−500) = 3 600 − 2 000 = <b>1 600</b>.</p>
<p>Δ &gt; 0 : l'équation admet deux solutions distinctes. De plus √Δ = √1 600 = 40.</p>
<p>x<sub>1</sub> = (−b − √Δ) ÷ (2a) = (−60 − 40) ÷ (2 × (−1)) = (−100) ÷ (−2) = <b>50</b>.</p>
<p>x<sub>2</sub> = (−b + √Δ) ÷ (2a) = (−60 + 40) ÷ (−2) = (−20) ÷ (−2) = <b>10</b>.</p>
<p>Vérification : B(10) = −100 + 600 − 500 = 0. ✔</p>
<p>Les solutions de l'équation B(x) = 0 sont donc <b>10 et 50</b>. Ce sont les deux seuils où le bénéfice est nul.</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> Ici a = −1, donc a &lt; 0.</p>
<p>Règle du signe du trinôme : B(x) est du signe de a (donc négatif) à l'extérieur des racines, et du signe contraire (donc positif) entre les racines.</p>
<p>Tableau de signes : B(x) &lt; 0 sur [0 ; 10[, B(x) &gt; 0 sur ]10 ; 50[, B(x) &lt; 0 sur ]50 ; 60].</p>
<p>Comme x est un nombre entier de coffrets, B(x) &gt; 0 pour x compris entre 11 et 49.</p>
<p><b>L'atelier réalise un bénéfice strictement positif s'il vend entre 11 et 49 coffrets dans la journée.</b> En dessous de 11, les charges fixes ne sont pas couvertes ; au-delà de 49, la production coûte trop cher.</p>
</div>
<div class="etapes">
<p><b>Question 4.</b> Comme a = −1 &lt; 0, la parabole est tournée vers le bas : la fonction B admet un <b>maximum</b>, atteint au sommet d'abscisse :</p>
<p>α = −b ÷ (2a) = −60 ÷ (2 × (−1)) = −60 ÷ (−2) = <b>30</b>.</p>
<p>Je calcule le bénéfice correspondant : B(30) = −(30)² + 60 × 30 − 500 = −900 + 1 800 − 500 = <b>400</b>.</p>
<p><b>Le bénéfice est maximal pour 30 coffrets vendus ; il s'élève alors à 400 €.</b></p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Comme a est négatif, beaucoup d'élèves annoncent que le bénéfice est positif « à l'extérieur des racines » : c'est l'inverse. Autre faute très fréquente : oublier que 2a = −2 et diviser par +2, ce qui donne les racines −10 et −50, absurdes pour un nombre de coffrets. Un nombre de coffrets ne peut jamais être négatif : ce réflexe de contrôle vaut de l'or.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Le calcul de Δ écrit avec les valeurs numériques et les parenthèses autour des nombres négatifs, la phrase « Δ &gt; 0 donc deux solutions », les deux racines encadrées, un tableau de signes justifié par le signe de a, et surtout une phrase de conclusion en euros et en coffrets à chaque question. Un résultat nu, sans phrase, perd la moitié des points d'interprétation.</p></div>`,
  criteres: [
    "J'ai identifié a = −1, b = 60, c = −500 avant de calculer le discriminant.",
    "J'ai trouvé Δ = 1 600, puis les deux racines 10 et 50.",
    "J'ai justifié le signe de B(x) en utilisant le fait que a est négatif (positif entre les racines).",
    "J'ai trouvé un bénéfice maximal de 400 € pour 30 coffrets vendus.",
    "J'ai terminé chaque question par une phrase en français qui répond à la question posée, avec l'unité."
  ]
});

// ============================================================
// pap-4-02 — Dérivée, signe et tableau de variations d'un coût
// ============================================================
PAPIERS.push({
  id: 'pap-4-02',
  phase: 4,
  titre: "Le coût moyen d'une centaine d'affiches",
  duree: 12,
  skills: ['p4-03-derivees', 'p4-04-variations'],
  enonce: `<p>Une imprimerie produit chaque jour des affiches publicitaires. Lorsqu'elle produit x centaines d'affiches, le coût moyen de production d'une centaine d'affiches, exprimé en euros, est donné par la fonction C définie sur l'intervalle [1 ; 12] par :</p>
<div class="formule"><p>C(x) = x² − 14x + 74</p></div>
<ol>
<li>Calculer C′(x), la dérivée de la fonction C.</li>
<li>Étudier le signe de C′(x) sur [1 ; 12], puis dresser le tableau de variations de C. On calculera les valeurs de C aux bornes de l'intervalle et à l'extremum.</li>
<li>En déduire le nombre d'affiches que l'imprimerie doit produire pour que le coût moyen soit minimal, et préciser ce coût. Conclure par une phrase.</li>
<li>Le directeur affirme : « quelle que soit la production de la journée, une centaine d'affiches nous revient toujours à moins de 30 € ». Cette affirmation est-elle exacte ? Justifier à l'aide du tableau de variations.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><b>Question 1.</b> Je dérive terme par terme :</p>
<p>(x²)′ = 2x ; (−14x)′ = −14 ; (74)′ = 0.</p>
<p>Donc <b>C′(x) = 2x − 14</b>.</p>
</div>
<div class="etapes">
<p><b>Question 2.</b> Je cherche d'abord où la dérivée s'annule :</p>
<p>2x − 14 = 0 donne 2x = 14, soit x = <b>7</b> (qui appartient bien à [1 ; 12]).</p>
<p>C′ est une fonction affine de coefficient directeur 2 &gt; 0, donc elle est croissante : elle est négative avant 7 et positive après 7.</p>
<p>Plus précisément : si x &lt; 7 alors 2x &lt; 14 donc C′(x) &lt; 0 ; si x &gt; 7 alors 2x &gt; 14 donc C′(x) &gt; 0.</p>
<p>Je calcule les valeurs utiles : C(1) = 1 − 14 + 74 = 61 ; C(7) = 49 − 98 + 74 = 25 ; C(12) = 144 − 168 + 74 = 50.</p>
<p>Tableau de variations :</p>
<table class="tbl">
<tr><th>x</th><td>1</td><td></td><td>7</td><td></td><td>12</td></tr>
<tr><th>signe de C′(x)</th><td></td><td>−</td><td>0</td><td>+</td><td></td></tr>
<tr><th>variations de C</th><td>61</td><td>↘</td><td>25</td><td>↗</td><td>50</td></tr>
</table>
<p>La fonction C est donc décroissante sur [1 ; 7] puis croissante sur [7 ; 12].</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> La dérivée s'annule en x = 7 <b>en changeant de signe</b> (− puis +) : la fonction C admet donc un minimum en x = 7, et ce minimum vaut C(7) = 25.</p>
<p>Or x est exprimé en centaines d'affiches : x = 7 correspond à 700 affiches.</p>
<p><b>Le coût moyen est minimal lorsque l'imprimerie produit 700 affiches ; une centaine d'affiches lui revient alors à 25 €, ce qui est son coût le plus avantageux.</b></p>
</div>
<div class="etapes">
<p><b>Question 4.</b> L'affirmation est <b>fausse</b>.</p>
<p>Il suffit d'un contre-exemple : pour x = 1 (soit 100 affiches produites), C(1) = 61 €, ce qui est bien supérieur à 30 €.</p>
<p>Le tableau montre que 25 € est seulement le coût moyen <b>minimal</b> : il est atteint pour une production de 700 affiches, mais le coût moyen dépasse largement 30 € pour les petites productions (et remonte jusqu'à 50 € pour 1 200 affiches).</p>
<p><b>Le directeur a tort : le coût de 25 € par centaine est un minimum, pas une valeur permanente.</b></p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Écrire « C′(7) = 0 donc il y a un minimum » sans étudier le signe de C′ : c'est le changement de signe qui prouve l'extremum, et le correcteur l'exige. Autre confusion très répandue : mélanger le signe de C′ et le signe de C. Ici C(x) est toujours positif (c'est un coût), alors que C′(x) est négatif sur toute la première moitié de l'intervalle.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>La dérivée écrite proprement, l'équation C′(x) = 0 résolue avec ses étapes, un tableau de variations complet (ligne des x, ligne du signe de C′ avec le 0, ligne des flèches et les trois valeurs 61, 25 et 50), puis l'interprétation en langage d'entreprise : 700 affiches, 25 €. À la question 4, un contre-exemple chiffré vaut plus que n'importe quel commentaire.</p></div>`,
  criteres: [
    "J'ai dérivé correctement et écrit C′(x) = 2x − 14.",
    "J'ai résolu C′(x) = 0 et trouvé x = 7.",
    "J'ai dressé un tableau de variations complet avec la ligne du signe de C′ et les valeurs 61, 25 et 50.",
    "J'ai trouvé un coût moyen minimal de 25 € pour une production de 700 affiches.",
    "J'ai répondu à la question 4 en donnant un contre-exemple chiffré (par exemple C(1) = 61 €)."
  ]
});

// ============================================================
// pap-4-03 — Suites arithmétique et géométrique : deux épargnes
// ============================================================
PAPIERS.push({
  id: 'pap-4-03',
  phase: 4,
  titre: "Deux formules d'épargne",
  duree: 15,
  skills: ['p4-05-suites-arithmetiques', 'p4-06-suites-geometriques'],
  enonce: `<p>Le 1<sup>er</sup> janvier 2026, Sarah dépose 2 000 € sur un compte d'épargne. Sa banque lui propose deux offres, entre lesquelles elle doit choisir aujourd'hui :</p>
<p><b>Offre A</b> : la banque ajoute 120 € au capital chaque 1<sup>er</sup> janvier.<br>
<b>Offre B</b> : le capital augmente de 5 % chaque 1<sup>er</sup> janvier.</p>
<p>On note a(n) le capital, en euros, obtenu avec l'offre A au bout de n années, et b(n) le capital obtenu avec l'offre B au bout de n années. Ainsi a(0) = b(0) = 2 000.</p>
<ol>
<li>Calculer a(1), a(2), b(1) et b(2).</li>
<li>Préciser la nature de chacune des deux suites en indiquant sa raison, puis exprimer a(n) et b(n) en fonction de n.</li>
<li>Calculer a(5), b(5), a(10) et b(10). On arrondira au centime d'euro.</li>
<li>Sarah hésite entre un placement de 5 ans et un placement de 10 ans. Conseiller Sarah dans chacun des deux cas, en justifiant par une phrase.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><b>Question 1.</b> Offre A : on ajoute 120 € chaque année.</p>
<p>a(1) = 2 000 + 120 = <b>2 120 €</b> ; a(2) = 2 120 + 120 = <b>2 240 €</b>.</p>
<p>Offre B : augmenter de 5 %, c'est multiplier par 1 + 5 ÷ 100 = 1,05.</p>
<p>b(1) = 2 000 × 1,05 = <b>2 100 €</b> ; b(2) = 2 100 × 1,05 = <b>2 205 €</b>.</p>
</div>
<div class="etapes">
<p><b>Question 2.</b> On passe d'un terme au suivant en <b>ajoutant</b> toujours 120 : la suite (a(n)) est donc <b>arithmétique de raison r = 120</b> et de premier terme a(0) = 2 000.</p>
<p>Formule directe : <b>a(n) = 2 000 + 120n</b>.</p>
<p>On passe d'un terme au suivant en <b>multipliant</b> toujours par 1,05 : la suite (b(n)) est donc <b>géométrique de raison q = 1,05</b> et de premier terme b(0) = 2 000.</p>
<p>Formule directe : <b>b(n) = 2 000 × 1,05<sup>n</sup></b>.</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> Au bout de 5 ans :</p>
<p>a(5) = 2 000 + 120 × 5 = 2 000 + 600 = <b>2 600 €</b>.</p>
<p>b(5) = 2 000 × 1,05<sup>5</sup> = 2 000 × 1,2762… ≈ <b>2 552,56 €</b>.</p>
<p>Au bout de 10 ans :</p>
<p>a(10) = 2 000 + 120 × 10 = 2 000 + 1 200 = <b>3 200 €</b>.</p>
<p>b(10) = 2 000 × 1,05<sup>10</sup> = 2 000 × 1,6288… ≈ <b>3 257,79 €</b>.</p>
</div>
<div class="etapes">
<p><b>Question 4.</b> Je compare les deux capitaux pour chaque durée.</p>
<p>Sur 5 ans : 2 600 &gt; 2 552,56, l'écart en faveur de l'offre A est de 2 600 − 2 552,56 = 47,44 €.</p>
<p>Sur 10 ans : 3 257,79 &gt; 3 200, l'écart en faveur de l'offre B est de 3 257,79 − 3 200 = 57,79 €.</p>
<p><b>Conseil : si Sarah place son argent pendant 5 ans, elle a intérêt à choisir l'offre A, qui lui rapporte 47,44 € de plus. Si elle place son argent pendant 10 ans, elle doit choisir l'offre B, qui lui rapporte 57,79 € de plus.</b></p>
<p>C'est logique : l'offre A ajoute toujours la même somme, tandis que l'offre B rapporte 5 % d'un capital qui grossit chaque année. Elle démarre plus lentement, mais finit par dépasser l'offre A.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Deux fautes reviennent sans cesse. D'abord écrire b(n) = 2 000 × 0,05<sup>n</sup> : la raison d'une hausse de 5 % est 1,05, jamais 0,05. Ensuite calculer « 5 % de 2 000 = 100 € par an » et traiter l'offre B comme une suite arithmétique : les 5 % s'appliquent au capital de l'année en cours, qui augmente, pas au capital de départ.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Le mot « arithmétique » ou « géométrique » écrit noir sur blanc, accompagné de la raison et du premier terme : c'est la justification qui rapporte les points, pas seulement les valeurs numériques. Ensuite les deux formules explicites, les calculs arrondis correctement au centime, et une conclusion qui distingue clairement les deux durées. Une réponse du type « l'offre B est meilleure » sans distinguer 5 ans et 10 ans est comptée fausse.</p></div>`,
  criteres: [
    "J'ai trouvé a(1) = 2 120 €, a(2) = 2 240 €, b(1) = 2 100 € et b(2) = 2 205 €.",
    "J'ai écrit que (a(n)) est arithmétique de raison 120 et que (b(n)) est géométrique de raison 1,05.",
    "J'ai écrit les deux formules explicites a(n) = 2 000 + 120n et b(n) = 2 000 × 1,05 puissance n.",
    "J'ai trouvé b(5) ≈ 2 552,56 € et b(10) ≈ 3 257,79 €, arrondis au centime.",
    "J'ai conclu par une phrase qui conseille l'offre A sur 5 ans et l'offre B sur 10 ans."
  ]
});

// ============================================================
// pap-4-04 — Taux global, taux réciproque, indice base 100
// ============================================================
PAPIERS.push({
  id: 'pap-4-04',
  phase: 4,
  titre: "Le chiffre d'affaires de l'enseigne",
  duree: 12,
  skills: ['p4-07-taux-indices'],
  enonce: `<p>Une enseigne de prêt-à-porter a réalisé un chiffre d'affaires de 80 000 € au cours de l'année 2024. Son chiffre d'affaires a ensuite baissé de 12 % en 2025, puis augmenté de 25 % en 2026.</p>
<ol>
<li>Calculer le chiffre d'affaires de l'enseigne en 2025, puis celui de 2026.</li>
<li>Déterminer le taux d'évolution global du chiffre d'affaires entre 2024 et 2026. Le directeur affirme que « la hausse de 25 % a plus que compensé la baisse de 12 % » : que penser de cette phrase ?</li>
<li>Le directeur souhaite qu'en 2027 le chiffre d'affaires revienne exactement à son niveau de 2024. Déterminer le taux d'évolution nécessaire entre 2026 et 2027, arrondi à 0,01 %.</li>
<li>On choisit l'indice 100 pour le chiffre d'affaires de l'année 2024. Calculer l'indice du chiffre d'affaires de 2026, puis expliquer en une phrase le lien entre cet indice et la réponse à la question 2.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><b>Question 1.</b> Je traduis chaque évolution en coefficient multiplicateur (CM).</p>
<p>Baisse de 12 % : CM = 1 − 12 ÷ 100 = 0,88.</p>
<p>Chiffre d'affaires 2025 : 80 000 × 0,88 = <b>70 400 €</b>.</p>
<p>Hausse de 25 % : CM = 1 + 25 ÷ 100 = 1,25.</p>
<p>Chiffre d'affaires 2026 : 70 400 × 1,25 = <b>88 000 €</b>.</p>
</div>
<div class="etapes">
<p><b>Question 2.</b> Le coefficient multiplicateur global s'obtient en <b>multipliant</b> les deux coefficients :</p>
<p>CM global = 0,88 × 1,25 = <b>1,1</b>.</p>
<p>Je reconvertis en taux : 1,1 = 1 + 0,1, donc t = 0,1 = <b>+10 %</b>.</p>
<p>Vérification directe : (88 000 − 80 000) ÷ 80 000 = 8 000 ÷ 80 000 = 0,1, soit +10 %. ✔</p>
<p><b>Entre 2024 et 2026, le chiffre d'affaires de l'enseigne a augmenté de 10 %.</b> Le directeur a raison sur le fond — la hausse l'a bien emporté — mais attention : le résultat n'est pas 25 − 12 = 13 %. On n'additionne jamais des taux d'évolution successifs.</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> Je cherche le <b>taux réciproque</b> de la hausse globale de 10 %, c'est-à-dire le taux qui annule le CM 1,1.</p>
<p>Le coefficient cherché est CM = 1 ÷ 1,1 ≈ 0,9091.</p>
<p>Je reconvertis : 0,9091 = 1 − 0,0909, donc t ≈ −0,0909, soit environ <b>−9,09 %</b>.</p>
<p>Vérification : 88 000 × 0,9091 ≈ 80 000,8 ≈ 80 000 €. ✔</p>
<p><b>Pour retrouver en 2027 le chiffre d'affaires de 2024, l'enseigne devrait subir une baisse d'environ 9,09 %</b> — et non de 10 %, car la baisse s'applique à un chiffre d'affaires plus élevé.</p>
</div>
<div class="etapes">
<p><b>Question 4.</b> L'indice se calcule par : indice = 100 × valeur ÷ valeur de référence.</p>
<p>Indice 2026 = 100 × 88 000 ÷ 80 000 = 100 × 1,1 = <b>110</b>.</p>
<p><b>L'indice 110 se lit directement : le chiffre d'affaires a augmenté de 10 % entre 2024 et 2026</b>, ce qui confirme le taux global trouvé à la question 2. L'indice, c'est simplement le coefficient multiplicateur global écrit sur une base de 100.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Additionner les taux : −12 % puis +25 % ne donne pas +13 %. Deuxième piège, encore plus fréquent : croire que le taux réciproque d'une hausse de 10 % est une baisse de 10 %. Ce serait 1,1 × 0,9 = 0,99, soit −1 % au total : on ne retomberait pas sur le chiffre de départ.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Les coefficients multiplicateurs écrits <b>avant</b> tout calcul (0,88 et 1,25), la multiplication des CM clairement posée, la reconversion du CM en pourcentage, les arrondis respectés (0,01 % ici), et une phrase d'interprétation par question. Le chapitre des taux se joue entièrement sur cette discipline : pourcentage → CM, je calcule, CM → pourcentage.</p></div>`,
  criteres: [
    "J'ai écrit les coefficients multiplicateurs 0,88 et 1,25 avant de faire les calculs.",
    "J'ai trouvé 70 400 € pour 2025 et 88 000 € pour 2026.",
    "J'ai multiplié les coefficients (0,88 × 1,25 = 1,1) au lieu d'additionner les pourcentages, et conclu à +10 %.",
    "J'ai trouvé un taux réciproque d'environ −9,09 % en inversant le coefficient (1 ÷ 1,1).",
    "J'ai trouvé l'indice 110 et expliqué par une phrase qu'il correspond à une hausse de 10 %."
  ]
});

// ============================================================
// pap-4-05 — Probabilités conditionnelles : arbre pondéré
// ============================================================
PAPIERS.push({
  id: 'pap-4-05',
  phase: 4,
  titre: "Commandes en ligne et promotions",
  duree: 12,
  skills: ['p4-08-probas-conditionnelles'],
  enonce: `<p>Un site de vente en ligne étudie les commandes reçues au cours d'une journée. Il constate que 60 % des commandes sont passées depuis l'application mobile, les autres depuis le site internet. Parmi les commandes passées depuis l'application, 15 % contiennent au moins un article en promotion ; parmi celles passées depuis le site internet, 25 % contiennent au moins un article en promotion.</p>
<p>On choisit une commande au hasard et on note :<br>
A l'événement « la commande a été passée depuis l'application mobile » ;<br>
R l'événement « la commande contient au moins un article en promotion ».</p>
<ol>
<li>Construire un arbre pondéré décrivant cette situation.</li>
<li>Calculer P(A ∩ R), puis interpréter ce résultat par une phrase.</li>
<li>Montrer que P(R) = 0,19.</li>
<li>La commande choisie contient au moins un article en promotion. Quelle est la probabilité qu'elle ait été passée depuis l'application mobile ? Arrondir au centième et interpréter le résultat.</li>
</ol>`,
  corrige: `<div class="etapes">
<p><b>Question 1.</b> L'arbre comporte deux niveaux. Premier niveau, le support de commande :</p>
<p>branche A (application) pondérée par P(A) = 0,6 ; branche A&#772; (site internet) pondérée par P(A&#772;) = 1 − 0,6 = 0,4.</p>
<p>Deuxième niveau, la présence d'une promotion. À partir de A : branche R pondérée par P<sub>A</sub>(R) = 0,15 et branche R&#772; pondérée par 1 − 0,15 = 0,85. À partir de A&#772; : branche R pondérée par P<sub>A&#772;</sub>(R) = 0,25 et branche R&#772; pondérée par 0,75.</p>
<p>Contrôle indispensable : à chaque nœud, la somme des probabilités des branches issues de ce nœud vaut 1 (0,6 + 0,4 = 1 ; 0,15 + 0,85 = 1 ; 0,25 + 0,75 = 1). ✔</p>
</div>
<div class="etapes">
<p><b>Question 2.</b> Pour obtenir la probabilité d'un chemin, je multiplie le long des branches :</p>
<p>P(A ∩ R) = P(A) × P<sub>A</sub>(R) = 0,6 × 0,15 = <b>0,09</b>.</p>
<p><b>Autrement dit, 9 % des commandes de la journée sont à la fois passées depuis l'application mobile et contiennent au moins un article en promotion</b> (soit 9 commandes sur 100).</p>
</div>
<div class="etapes">
<p><b>Question 3.</b> L'événement R peut se produire de deux façons : la commande vient de l'application, ou elle vient du site internet. J'utilise la formule des probabilités totales :</p>
<p>P(R) = P(A ∩ R) + P(A&#772; ∩ R).</p>
<p>P(A&#772; ∩ R) = P(A&#772;) × P<sub>A&#772;</sub>(R) = 0,4 × 0,25 = 0,1.</p>
<p>Donc P(R) = 0,09 + 0,1 = <b>0,19</b>. C'est bien le résultat demandé.</p>
<p>19 % des commandes de la journée contiennent au moins un article en promotion.</p>
</div>
<div class="etapes">
<p><b>Question 4.</b> On sait que la commande contient une promotion : l'univers se réduit aux commandes de l'événement R. Je cherche donc P<sub>R</sub>(A).</p>
<p>P<sub>R</sub>(A) = P(A ∩ R) ÷ P(R) = 0,09 ÷ 0,19 ≈ <b>0,47</b>.</p>
<p><b>Parmi les commandes contenant au moins un article en promotion, environ 47 % ont été passées depuis l'application mobile.</b></p>
<p>Remarque utile : P<sub>R</sub>(A) ≈ 0,47 alors que P<sub>A</sub>(R) = 0,15. Ces deux probabilités ne répondent pas du tout à la même question.</p>
</div>
<div class="box piege"><p class="box-t">Erreur classique</p><p>Confondre P<sub>A</sub>(R) et P<sub>R</sub>(A), c'est-à-dire répondre 0,15 à la question 4. Le repère est toujours le même : ce qui vient après « sachant que » (ici : la commande contient une promotion) devient le <b>dénominateur</b>. Autre faute fréquente à la question 2 : additionner 0,6 + 0,15 au lieu de multiplier. Dans un arbre, on multiplie le long d'un chemin et on additionne seulement entre chemins différents.</p></div>
<div class="box astuce"><p class="box-t">Ce que le correcteur attend</p><p>Un arbre dessiné proprement, avec les quatre probabilités inscrites sur les branches et les événements nommés. Ensuite, chaque formule écrite <b>avant</b> son application numérique : P(A ∩ R) = P(A) × P<sub>A</sub>(R), puis P(R) = P(A ∩ R) + P(A&#772; ∩ R), puis P<sub>R</sub>(A) = P(A ∩ R) ÷ P(R). C'est cette ligne de formule qui rapporte les points, même si la calculatrice se trompe ensuite. Et chaque probabilité doit être traduite en phrase de pourcentage.</p></div>`,
  criteres: [
    "J'ai construit un arbre pondéré avec les probabilités 0,6 ; 0,4 ; 0,15 et 0,25 inscrites sur les branches.",
    "J'ai multiplié le long du chemin et trouvé P(A ∩ R) = 0,09.",
    "J'ai utilisé les probabilités totales et retrouvé P(R) = 0,09 + 0,1 = 0,19.",
    "J'ai écrit la formule P sachant R de A = P(A ∩ R) ÷ P(R) avant de calculer, et trouvé environ 0,47.",
    "J'ai interprété chaque probabilité par une phrase en pourcentage de commandes."
  ]
});

})();
