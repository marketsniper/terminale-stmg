/* ===== Techniques de calcul mental — méthodes + générateurs ===== */
/* Chaque famille : {id, nom, icone, cat, astuce, methode(HTML), gen(R) -> {q,a,expl,choix?,accept?}} */
(function(){

function tipMult(a, b){
  if (a === 9 || b === 9){ const n = a === 9 ? b : a; return n + ' × 9 = ' + n + ' × 10 − ' + n + ' = ' + (n * 10) + ' − ' + n + ' = ' + (a * b) + '.'; }
  if (a === 11 || b === 11){ const n = a === 11 ? b : a; return n + ' × 11 : ' + n + ' × 10 + ' + n + ' = ' + (n * 10) + ' + ' + n + ' = ' + (a * b) + '.'; }
  if (a === 5 || b === 5){ const n = a === 5 ? b : a; return n + ' × 5 = (moitié de ' + n + ') × 10 = ' + (n / 2) + ' × 10 = ' + (a * b) + '.'; }
  if (b % 2 === 0) return a + ' × ' + (b / 2) + ' = ' + (a * b / 2) + ', on double → ' + (a * b) + '.';
  if (a % 2 === 0) return b + ' × ' + (a / 2) + ' = ' + (a * b / 2) + ', on double → ' + (a * b) + '.';
  return a + ' × ' + (b - 1) + ' = ' + (a * (b - 1)) + ', puis + ' + a + ' → ' + (a * b) + '.';
}

window.CM_FAMS = [

/* ============ BASES ============ */
{
  id: 'tables', nom: 'Tables ×', icone: '✖️', cat: 'Les bases',
  astuce: "Passe par une table facile : ×10, ×5, ou le double d'un résultat connu.",
  methode: `<p class="lede">Les tables ne se récitent pas : elles se <mark>reconstruisent en une seconde</mark> à partir de trois ancrages — ×10, ×5 et le double.</p>
<div class="etapes">
<p><strong>Ancrage ×10</strong> — tu ajoutes un zéro. 7 × 10 = 70.</p>
<p><strong>×9 = ×10 moins une fois.</strong> 7 × 9 = 70 − 7 = 63.</p>
<p><strong>×5 = moitié puis ×10.</strong> 8 × 5 : moitié de 8 = 4 → 40.</p>
<p><strong>×4 = double du double.</strong> 7 × 4 : 7 → 14 → 28.</p>
<p><strong>×8 = double du double du double.</strong> 7 → 14 → 28 → 56.</p>
<p><strong>×6 = ×5 + une fois.</strong> 7 × 6 = 35 + 7 = 42.</p>
<p><strong>×7</strong>, le plus dur : ×5 + ×2. 7 × 7 = 35 + 14 = 49.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Avec ×10, ×5 et le doublement, tu reconstruis <mark>toute</mark> la table en moins de 2 secondes. Et 7 × 8 = 56, c'est le seul qu'il faut apprendre par cœur (« 5-6-7-8 »).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>La multiplication est commutative : 3 × 9 et 9 × 3, c'est pareil. Choisis toujours le sens qui t'arrange.</p></div>`,
  gen(R){ const a = R.int(3, 12), b = R.int(3, 12); return {q: a + ' × ' + b, a: String(a * b), expl: tipMult(a, b)}; }
},
{
  id: 'tables-inv', nom: 'Tables ÷', icone: '➗', cat: 'Les bases',
  astuce: "Ne divise pas : demande-toi « combien de fois ? » et remonte la table.",
  methode: `<p class="lede">Une division des tables n'est pas un calcul : c'est une <mark>question de multiplication à l'envers</mark>.</p>
<p>Devant 56 ÷ 7, ne cherche pas à « diviser ». Demande-toi : <strong>7 fois combien font 56 ?</strong> Ton cerveau connaît déjà la réponse par la table de 7.</p>
<div class="etapes">
<p><strong>63 ÷ 9</strong> → « 9 fois combien font 63 ? » → 9 × 7 = 63 → <mark>7</mark>.</p>
<p><strong>Si ça ne vient pas</strong>, encadre : 9 × 5 = 45 (trop petit), 9 × 10 = 90 (trop grand) → la réponse est entre 5 et 10. Puis 9 × 7 = 63. ✓</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Diviser, c'est chercher le facteur manquant. Multiplication et division sont <mark>la même opération</mark> vue des deux côtés.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie toujours en multipliant : si tu réponds 8 à 56 ÷ 7, contrôle 7 × 8 = 56. Une seconde, zéro erreur.</p></div>`,
  gen(R){ const a = R.int(3, 12), b = R.int(3, 12); return {q: (a * b) + ' ÷ ' + a, a: String(b), expl: '« ' + a + ' fois combien font ' + (a * b) + ' ? » → ' + a + ' × ' + b + ' = ' + (a * b) + '.'}; }
},
{
  id: 'add', nom: 'Additions', icone: '➕', cat: 'Les bases',
  astuce: "Arrondis à la dizaine, puis compense : 68 + 48 → 68 + 50 − 2.",
  methode: `<p class="lede">On n'additionne jamais « en colonnes » dans sa tête. On <mark>arrondit, puis on compense</mark>.</p>
<div class="etapes">
<p><strong>68 + 48</strong></p>
<p>1. J'arrondis le second : 48 devient 50 (j'ai ajouté 2 de trop).</p>
<p>2. Je calcule le facile : 68 + 50 = 118.</p>
<p>3. Je rends les 2 en trop : 118 − 2 = <mark>116</mark>.</p>
</div>
<p>Deuxième technique, encore plus rapide pour les grands nombres : <strong>additionner par tranches, de gauche à droite</strong>. 347 + 285 : les centaines 300 + 200 = 500, les dizaines 40 + 80 = 120 → 620, les unités 7 + 5 = 12 → 632. Contrairement au calcul posé, on part de la gauche : c'est plus naturel à l'oral.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Arrondir + compenser, ou additionner de gauche à droite. Jamais « en colonnes » de tête : c'est là qu'on perd des retenues.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Cherche les paires qui font 10 ou 100 : dans 37 + 45 + 63, repère 37 + 63 = 100 d'abord, puis + 45 = 145.</p></div>`,
  gen(R){
    const a = R.int(23, 89), b = R.int(23, 89);
    const rb = Math.round(b / 10) * 10, d = rb - b;
    const expl = d === 0
      ? a + ' + ' + b + ' : ' + b + ' est rond, direct → ' + (a + b) + '.'
      : a + ' + ' + rb + ' = ' + (a + rb) + ', puis ' + (d > 0 ? '− ' + d : '+ ' + (-d)) + ' → ' + (a + b) + '.';
    return {q: a + ' + ' + b, a: String(a + b), expl};
  }
},
{
  id: 'sub', nom: 'Soustractions', icone: '➖', cat: 'Les bases',
  astuce: "Arrondis ce que tu enlèves : 83 − 47 → 83 − 50 + 3.",
  methode: `<p class="lede">Deux techniques, selon les nombres : <mark>arrondir-compenser</mark> ou <mark>avancer</mark>.</p>
<div class="etapes">
<p><strong>Technique 1 — arrondir ce qu'on enlève. 83 − 47</strong></p>
<p>1. J'enlève 50 au lieu de 47 : 83 − 50 = 33.</p>
<p>2. J'ai enlevé 3 de trop, je les rends : 33 + 3 = <mark>36</mark>.</p>
<p><strong>Technique 2 — avancer (le rendu de monnaie). 200 − 137</strong></p>
<p>De 137, j'avance : +3 → 140, +60 → 200. Total avancé : <mark>63</mark>.</p>
</div>
<div class="box piege"><p class="box-t">Piège</p><p>Quand tu arrondis le nombre que tu <strong>enlèves</strong>, la compensation part dans le sens inverse : arrondi au-dessus → on rajoute. C'est l'erreur n°1, prends 2 secondes pour te le dire.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Petits écarts → arrondir-compenser. Grands écarts ou nombres ronds (100, 1000) → avancer par paliers.</p></div>`,
  gen(R){
    const a = R.int(52, 99), b = R.int(13, a - 12);
    const rb = Math.round(b / 10) * 10, d = rb - b;
    const expl = d === 0
      ? a + ' − ' + b + ' : direct → ' + (a - b) + '.'
      : a + ' − ' + rb + ' = ' + (a - rb) + ', ' + (d > 0 ? "j'ai enlevé " + d + ' de trop → + ' + d : 'il manque ' + (-d) + ' → − ' + (-d)) + ' → ' + (a - b) + '.';
    return {q: a + ' − ' + b, a: String(a - b), expl};
  }
},
{
  id: 'compl', nom: 'Compléments', icone: '🎯', cat: 'Les bases',
  astuce: "Vers 100 : les dizaines vont à 9, les unités à 10.",
  methode: `<p class="lede">Le complément à 100 ou à 1000 se lit <mark>sans calculer</mark>, chiffre par chiffre.</p>
<div class="etapes">
<p><strong>Complément à 100 de 37</strong></p>
<p>Chiffre des dizaines (3) → ce qui manque pour 9 : <strong>6</strong>.</p>
<p>Chiffre des unités (7) → ce qui manque pour 10 : <strong>3</strong>.</p>
<p>Réponse : <mark>63</mark>. (Vérification : 37 + 63 = 100 ✓)</p>
<p><strong>Complément à 1000 de 486</strong> : 4→5 (pour 9), 8→1 (pour 9), 6→4 (pour 10) → <mark>514</mark>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>« Tous les chiffres à 9, <mark>sauf le dernier qui va à 10</mark> ». Cette règle marche à 100, 1000, 10 000…</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>C'est le calcul du rendu de monnaie — et c'est aussi la clé des soustractions rapides et des pourcentages de réduction (« −37 % de remise, il reste 63 % »).</p></div>`,
  gen(R){
    if (Math.random() < .65){ const a = R.int(12, 89); return {q: a + ' + ? = 100', a: String(100 - a), expl: 'Dizaines : ' + Math.floor(a / 10) + ' → 9 donne ' + (9 - Math.floor(a / 10)) + '. Unités : ' + (a % 10) + ' → 10 donne ' + (10 - a % 10) + '. Réponse ' + (100 - a) + '.'}; }
    const a = R.int(112, 889); return {q: a + ' + ? = 1000', a: String(1000 - a), expl: 'Chiffres à 9 puis le dernier à 10 : ' + a + ' + ' + (1000 - a) + ' = 1000.'};
  }
},
{
  id: 'doubles', nom: 'Doubles et moitiés', icone: '🔁', cat: 'Les bases',
  astuce: "Coupe le nombre en tranches : double de 47 = 80 + 14.",
  methode: `<p class="lede">Doubler et couper en deux sont les <mark>deux gestes les plus rentables</mark> du calcul mental : ils servent partout (×4, ×8, ÷4, ×5, ×25, pourcentages).</p>
<div class="etapes">
<p><strong>Double de 47</strong> : double de 40 = 80, double de 7 = 14 → <mark>94</mark>.</p>
<p><strong>Moitié de 86</strong> : moitié de 80 = 40, moitié de 6 = 3 → <mark>43</mark>.</p>
<p><strong>Moitié d'un nombre impair de dizaines — 74</strong> : je prends 60 + 14 → 30 + 7 = <mark>37</mark>.</p>
</div>
<p>Enchaîner ces gestes remplace des multiplications entières : <strong>×4 = doubler deux fois</strong> (23 → 46 → 92), <strong>×8 = doubler trois fois</strong>, <strong>÷4 = couper deux fois</strong> (92 → 46 → 23).</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Découpe toujours le nombre en tranches faciles (dizaines + unités), traite chaque tranche, recolle. Ne double jamais « en bloc ».</p></div>`,
  gen(R){
    if (Math.random() < .5){ const a = R.int(13, 240);
      const d = Math.floor(a / 10) * 10;
      return {q: 'Le double de ' + a, a: String(2 * a), expl: 'Double de ' + d + ' = ' + (2 * d) + ', double de ' + (a - d) + ' = ' + (2 * (a - d)) + ' → ' + (2 * a) + '.'}; }
    const h = R.int(7, 130), a = h * 2;
    return {q: 'La moitié de ' + a, a: String(h), expl: 'Je coupe : moitié de ' + (a - a % 10) + ' = ' + ((a - a % 10) / 2) + ', moitié de ' + (a % 10) + ' = ' + ((a % 10) / 2) + ' → ' + h + '.'};
  }
},
{
  id: 'x10', nom: '× et ÷ par 10, 100', icone: '🔟', cat: 'Les bases',
  astuce: "La virgule glisse : autant de rangs que de zéros.",
  methode: `<p class="lede">Multiplier ou diviser par 10, 100, 1000, c'est <mark>faire glisser la virgule</mark>, jamais « ajouter un zéro ».</p>
<div class="etapes">
<p><strong>× 10</strong> → la virgule glisse d'un rang <strong>vers la droite</strong> : 3,7 × 10 = 37.</p>
<p><strong>× 100</strong> → deux rangs à droite : 3,7 × 100 = 370.</p>
<p><strong>÷ 10</strong> → un rang <strong>vers la gauche</strong> : 45 ÷ 10 = 4,5.</p>
<p><strong>÷ 100</strong> → deux rangs à gauche : 45 ÷ 100 = 0,45.</p>
</div>
<div class="box piege"><p class="box-t">Piège</p><p>« Ajouter un zéro » est faux avec les décimaux : 3,7 × 10 ne fait pas 3,70 ! Pense toujours <mark>déplacement de la virgule</mark>.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Nombre de zéros = nombre de rangs. × → droite (ça grandit), ÷ → gauche (ça rapetisse).</p></div>`,
  gen(R){
    const p = R.pick([10, 100, 1000]), z = String(p).length - 1;
    if (Math.random() < .5){
      const dec = R.pick([true, false]);
      const a = dec ? R.int(15, 99) / 10 : R.int(3, 99);
      const res = +(a * p).toFixed(2);
      return {q: String(a).replace('.', ',') + ' × ' + p, a: String(res), expl: 'La virgule glisse de ' + z + ' rang' + (z > 1 ? 's' : '') + ' vers la droite → ' + String(res).replace('.', ',') + '.'};
    }
    const a = R.int(3, 99) * p, res = +(a / p).toFixed(3);
    return {q: a + ' ÷ ' + p, a: String(res), expl: 'La virgule glisse de ' + z + ' rang' + (z > 1 ? 's' : '') + ' vers la gauche → ' + String(res).replace('.', ',') + '.'};
  }
},
{
  id: 'relatifs', nom: 'Signes éclair', icone: '±', cat: 'Les bases',
  astuce: "Signes identiques → +, signes différents → −.",
  methode: `<p class="lede">Aux concours, une erreur de signe coûte autant qu'une erreur de calcul. La règle tient en <mark>une phrase</mark>.</p>
<div class="formule">Même signe → résultat positif · Signes différents → résultat négatif</div>
<div class="etapes">
<p>(−7) × (−4) = <strong>+28</strong> — deux « − » : positif.</p>
<p>(−7) × 4 = <strong>−28</strong> — signes différents : négatif.</p>
<p>(−36) ÷ (−9) = <strong>+4</strong> — même règle pour la division.</p>
</div>
<p><strong>Astuce du comptage</strong> : dans un produit, compte les signes « − ». Nombre <mark>pair</mark> de « − » → résultat positif ; nombre <mark>impair</mark> → négatif. (−2) × (−3) × (−5) : trois « − », impair → −30.</p>
<div class="box piege"><p class="box-t">Piège</p><p>Ne confonds pas avec l'addition ! (−7) + (−4) = −11 (on cumule les dettes), alors que (−7) × (−4) = +28. Multiplication et addition n'ont pas la même règle.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Détermine le <mark>signe d'abord</mark>, calcule les nombres ensuite. Deux gestes séparés, zéro confusion.</p></div>`,
  gen(R){
    const a = R.int(2, 12) * R.pick([1, -1]), b = R.int(2, 12) * R.pick([1, -1]);
    if (Math.random() < .5){
      const q = '(' + a + ') × (' + b + ')';
      return {q: q.replace(/\(([0-9]+)\)/g, '$1'), a: String(a * b), expl: (a * b > 0 ? 'Signes identiques → positif. ' : 'Signes différents → négatif. ') + Math.abs(a) + ' × ' + Math.abs(b) + ' = ' + Math.abs(a * b) + '.'};
    }
    const p = a * b;
    return {q: '(' + p + ') ÷ (' + a + ')', a: String(b), expl: (b > 0 ? 'Signes identiques → positif. ' : 'Signes différents → négatif. ') + Math.abs(p) + ' ÷ ' + Math.abs(a) + ' = ' + Math.abs(b) + '.'};
  }
},

/* ============ MULTIPLICATION ============ */
{
  id: 'x11', nom: 'Multiplier par 11', icone: '⚡', cat: 'Multiplication',
  astuce: "×11 : écarte les chiffres et glisse leur somme au milieu.",
  methode: `<p class="lede">La plus spectaculaire des techniques : <mark>×11 se fait sans calculer</mark>.</p>
<div class="etapes">
<p><strong>23 × 11</strong></p>
<p>1. J'écarte les deux chiffres : <strong>2 _ 3</strong>.</p>
<p>2. Je glisse leur somme au milieu : 2 + 3 = 5 → <mark>253</mark>.</p>
<p><strong>Cas avec retenue — 78 × 11</strong></p>
<p>7 + 8 = 15, ça dépasse 9 : j'écris le 5 au milieu et je reporte le 1 sur le chiffre de gauche : 7 + 1 = 8 → <mark>858</mark>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Si la somme des deux chiffres dépasse 9, la retenue monte au chiffre de gauche. Sinon, on la pose telle quelle.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>La version universelle, qui marche toujours : ×11 = ×10 + une fois. 47 × 11 = 470 + 47 = 517.</p></div>`,
  gen(R){
    const n = R.int(12, 89), d = Math.floor(n / 10), u = n % 10, s = d + u;
    const expl = s < 10
      ? 'J\'écarte ' + d + ' _ ' + u + ' et je glisse ' + d + ' + ' + u + ' = ' + s + ' au milieu → ' + (n * 11) + '.'
      : d + ' + ' + u + ' = ' + s + ' : le ' + (s % 10) + ' va au milieu, la retenue 1 monte (' + d + ' + 1 = ' + (d + 1) + ') → ' + (n * 11) + '.';
    return {q: n + ' × 11', a: String(n * 11), expl};
  }
},
{
  id: 'x5', nom: '× 5, × 50, × 25', icone: '🖐️', cat: 'Multiplication',
  astuce: "×5 = moitié puis ×10 · ×25 = ÷4 puis ×100.",
  methode: `<p class="lede">5, 25 et 50 sont des <mark>morceaux de 100</mark> : on passe toujours par une division puis un décalage.</p>
<div class="formule">×5 = ÷2 puis ×10 · ×50 = ÷2 puis ×100 · ×25 = ÷4 puis ×100</div>
<div class="etapes">
<p><strong>46 × 5</strong> : moitié de 46 = 23, ×10 → <mark>230</mark>.</p>
<p><strong>36 × 50</strong> : moitié de 36 = 18, ×100 → <mark>1 800</mark>.</p>
<p><strong>32 × 25</strong> : 32 ÷ 4 = 8, ×100 → <mark>800</mark>.</p>
</div>
<p>Pourquoi ça marche : 5 = 10 ÷ 2, donc multiplier par 5 c'est multiplier par 10 puis couper en deux. Idem 25 = 100 ÷ 4.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Ne pose jamais une multiplication par 5, 25 ou 50 : <mark>coupe d'abord, décale ensuite</mark>. C'est instantané.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Ça marche aussi à l'envers : ÷5 = ×2 puis ÷10 (340 ÷ 5 = 680 ÷ 10 = 68).</p></div>`,
  gen(R){
    const t = R.int(1, 3);
    if (t === 1){ const n = R.int(12, 98) * 2 / 2 * 2; const m = R.int(11, 49) * 2; return {q: m + ' × 5', a: String(m * 5), expl: 'Moitié de ' + m + ' = ' + (m / 2) + ', puis ×10 → ' + (m * 5) + '.'}; }
    if (t === 2){ const m = R.int(11, 49) * 2; return {q: m + ' × 50', a: String(m * 50), expl: 'Moitié de ' + m + ' = ' + (m / 2) + ', puis ×100 → ' + (m * 50) + '.'}; }
    const m = R.int(3, 24) * 4; return {q: m + ' × 25', a: String(m * 25), expl: m + ' ÷ 4 = ' + (m / 4) + ', puis ×100 → ' + (m * 25) + '.'};
  }
},
{
  id: 'x9', nom: '× 9, × 99', icone: '9️⃣', cat: 'Multiplication',
  astuce: "×9 = ×10 puis j'enlève une fois le nombre.",
  methode: `<p class="lede">Les nombres « juste en dessous d'un nombre rond » se calculent <mark>par excès puis retrait</mark>.</p>
<div class="formule">×9 = ×10 − 1 fois · ×99 = ×100 − 1 fois · ×19 = ×20 − 1 fois</div>
<div class="etapes">
<p><strong>37 × 9</strong> : 37 × 10 = 370, puis − 37 → <mark>333</mark>.</p>
<p><strong>46 × 99</strong> : 46 × 100 = 4 600, puis − 46 → <mark>4 554</mark>.</p>
<p><strong>23 × 19</strong> : 23 × 20 = 460, puis − 23 → <mark>437</mark>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Dès qu'un facteur finit par 8 ou 9, <mark>monte au nombre rond du dessus et retire</mark>. C'est presque toujours plus rapide que de poser l'opération.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Même logique par le bas : ×21 = ×20 + une fois. Le réflexe à installer : « quel nombre rond est juste à côté ? »</p></div>`,
  gen(R){
    const t = R.int(1, 3), n = R.int(13, 89);
    if (t === 1) return {q: n + ' × 9', a: String(n * 9), expl: n + ' × 10 = ' + (n * 10) + ', puis − ' + n + ' → ' + (n * 9) + '.'};
    if (t === 2) return {q: n + ' × 99', a: String(n * 99), expl: n + ' × 100 = ' + (n * 100) + ', puis − ' + n + ' → ' + (n * 99) + '.'};
    const m = R.int(12, 49); return {q: m + ' × 19', a: String(m * 19), expl: m + ' × 20 = ' + (m * 20) + ', puis − ' + m + ' → ' + (m * 19) + '.'};
  }
},
{
  id: 'mult2c', nom: 'Multiplier à 2 chiffres', icone: '🧩', cat: 'Multiplication',
  astuce: "Découpe le second nombre : 14 × 23 = 14×20 + 14×3.",
  methode: `<p class="lede">Une multiplication à deux chiffres se fait de tête en la <mark>découpant en deux morceaux faciles</mark>. C'est la distributivité.</p>
<div class="etapes">
<p><strong>14 × 23</strong></p>
<p>1. Je découpe 23 en 20 + 3.</p>
<p>2. 14 × 20 = 280 (14 × 2 = 28, puis ×10).</p>
<p>3. 14 × 3 = 42.</p>
<p>4. J'additionne : 280 + 42 = <mark>322</mark>.</p>
</div>
<p><strong>Règle d'or : découpe toujours le nombre qui donne les calculs les plus simples</strong>, et garde l'autre entier. Pour 48 × 12, découpe le 12 : 48 × 10 = 480, 48 × 2 = 96 → 576.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Découper en dizaines + unités transforme une multiplication difficile en deux multiplications de table. Additionne à la fin, jamais avant.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Répète le résultat intermédiaire à voix basse (« 280… 280 plus 42 ») : c'est ce qui évite de le perdre en route.</p></div>`,
  gen(R){
    const a = R.int(12, 29), b = R.int(12, 49);
    const d = Math.floor(b / 10) * 10, u = b % 10;
    return {q: a + ' × ' + b, a: String(a * b),
      expl: a + ' × ' + d + ' = ' + (a * d) + ', ' + a + ' × ' + u + ' = ' + (a * u) + ' → ' + (a * d) + ' + ' + (a * u) + ' = ' + (a * b) + '.'};
  }
},
{
  id: 'carres', nom: 'Carrés express', icone: '⬛', cat: 'Multiplication',
  astuce: "Carré finissant par 5 : n×(n+1) puis « 25 » collé derrière.",
  methode: `<p class="lede">Les carrés reviennent sans arrêt (aires, second degré, statistiques). Deux techniques suffisent.</p>
<div class="etapes">
<p><strong>Carré d'un nombre finissant par 5 — 35²</strong></p>
<p>1. Je prends le chiffre de devant : 3.</p>
<p>2. Je le multiplie par le suivant : 3 × 4 = 12.</p>
<p>3. Je colle « 25 » derrière → <mark>1225</mark>. (65² : 6 × 7 = 42 → 4225)</p>
<p><strong>Autres carrés — 23²</strong> : je découpe. 23 × 20 = 460, 23 × 3 = 69 → <mark>529</mark>.</p>
</div>
<p>À connaître par cœur, ils tombent tout le temps : 11²=121, 12²=144, 13²=169, 14²=196, 15²=225, 16²=256, 20²=400, 25²=625.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Finissant par 5 → n × (n+1) suivi de 25. Sinon → découpage en dizaines + unités.</p></div>`,
  gen(R){
    if (Math.random() < .5){ const n = R.int(1, 9), v = n * 10 + 5;
      return {q: v + '²', a: String(v * v), expl: n + ' × ' + (n + 1) + ' = ' + (n * (n + 1)) + ', puis « 25 » collé → ' + (v * v) + '.'}; }
    const v = R.int(11, 29), d = Math.floor(v / 10) * 10, u = v % 10;
    return {q: v + '²', a: String(v * v), expl: v + ' × ' + d + ' = ' + (v * d) + ', ' + v + ' × ' + u + ' = ' + (v * u) + ' → ' + (v * v) + '.'};
  }
},
{
  id: 'base', nom: 'Autour d\'un nombre rond', icone: '🎪', cat: 'Multiplication',
  astuce: "51 × 49 = 50² − 1² = 2 499. Repère le centre !",
  methode: `<p class="lede">Quand deux nombres sont <mark>à égale distance d'un nombre rond</mark>, leur produit se calcule en une seconde grâce à une identité remarquable.</p>
<div class="formule">(a − b)(a + b) = a² − b²</div>
<div class="etapes">
<p><strong>51 × 49</strong> — les deux entourent 50, à distance 1.</p>
<p>Produit = 50² − 1² = 2 500 − 1 = <mark>2 499</mark>.</p>
<p><strong>43 × 37</strong> — centre 40, distance 3 : 40² − 3² = 1 600 − 9 = <mark>1 591</mark>.</p>
<p><strong>98 × 102</strong> — centre 100, distance 2 : 10 000 − 4 = <mark>9 996</mark>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Cherche le <mark>milieu</mark> des deux nombres. S'il est rond, tu tiens ta technique : centre² − écart².</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Cette identité est au programme de seconde (identités remarquables). La maîtriser en calcul mental te la rendra évidente en algèbre.</p></div>`,
  gen(R){
    const c = R.pick([20, 30, 40, 50, 60, 70, 100]), k = R.int(1, Math.min(6, c / 10 + 1));
    return {q: (c - k) + ' × ' + (c + k), a: String(c * c - k * k),
      expl: 'Centre ' + c + ', écart ' + k + ' : ' + c + '² − ' + k + '² = ' + (c * c) + ' − ' + (k * k) + ' = ' + (c * c - k * k) + '.'};
  }
},

/* ============ DIVISION ============ */
{
  id: 'div-astuce', nom: 'Divisions rapides', icone: '🪓', cat: 'Division',
  astuce: "÷5 = ×2 puis ÷10 · ÷4 = couper deux fois · ÷25 = ×4 puis ÷100.",
  methode: `<p class="lede">On ne pose presque jamais une division mentale : on la <mark>transforme en multiplication facile</mark>.</p>
<div class="formule">÷5 = ×2 ÷10 · ÷50 = ×2 ÷100 · ÷25 = ×4 ÷100 · ÷4 = ÷2 ÷2 · ÷8 = ÷2 ÷2 ÷2</div>
<div class="etapes">
<p><strong>340 ÷ 5</strong> : ×2 → 680, ÷10 → <mark>68</mark>.</p>
<p><strong>1 800 ÷ 25</strong> : ×4 → 7 200, ÷100 → <mark>72</mark>.</p>
<p><strong>184 ÷ 4</strong> : moitié → 92, moitié → <mark>46</mark>.</p>
<p><strong>216 ÷ 8</strong> : 108 → 54 → <mark>27</mark>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Diviser par 5, 25 ou 50, c'est multiplier (par 2 ou 4) puis décaler la virgule. Diviser par 4 ou 8, c'est couper en deux plusieurs fois.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Autre réflexe : simplifie avant de calculer. 480 ÷ 15 = 96 ÷ 3 = 32 (j'ai divisé les deux par 5).</p></div>`,
  gen(R){
    const t = R.int(1, 4);
    if (t === 1){ const n = R.int(12, 99) * 5; return {q: n + ' ÷ 5', a: String(n / 5), expl: n + ' × 2 = ' + (n * 2) + ', puis ÷10 → ' + (n / 5) + '.'}; }
    if (t === 2){ const n = R.int(3, 40) * 25; return {q: n + ' ÷ 25', a: String(n / 25), expl: n + ' × 4 = ' + (n * 4) + ', puis ÷100 → ' + (n / 25) + '.'}; }
    if (t === 3){ const n = R.int(11, 60) * 4; return {q: n + ' ÷ 4', a: String(n / 4), expl: 'Moitié : ' + (n / 2) + ', encore moitié : ' + (n / 4) + '.'}; }
    const n = R.int(6, 40) * 8; return {q: n + ' ÷ 8', a: String(n / 8), expl: 'Trois moitiés : ' + (n / 2) + ' → ' + (n / 4) + ' → ' + (n / 8) + '.'};
  }
},
{
  id: 'divisibilite', nom: 'Critères de divisibilité', icone: '🔍', cat: 'Division',
  astuce: "Par 3 : la somme des chiffres est dans la table de 3.",
  methode: `<p class="lede">Savoir <mark>en un coup d'œil</mark> si une division tombe juste : indispensable pour simplifier les fractions et repérer la bonne réponse d'un QCM.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Divisible par…</th><th>Critère</th><th>Exemple</th></tr></thead>
<tbody>
<tr><td>2</td><td>finit par 0, 2, 4, 6, 8</td><td>354 ✓</td></tr>
<tr><td>3</td><td>somme des chiffres divisible par 3</td><td>354 → 3+5+4 = 12 ✓</td></tr>
<tr><td>4</td><td>les deux derniers chiffres forment un multiple de 4</td><td>1 316 → 16 ✓</td></tr>
<tr><td>5</td><td>finit par 0 ou 5</td><td>245 ✓</td></tr>
<tr><td>9</td><td>somme des chiffres divisible par 9</td><td>531 → 9 ✓</td></tr>
<tr><td>10</td><td>finit par 0</td><td>720 ✓</td></tr>
</tbody></table></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Les deux plus utiles : <mark>3 et 9 par la somme des chiffres</mark>. Ils te disent instantanément si une fraction se simplifie.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Divisible par 6 = divisible par 2 <strong>et</strong> par 3. Par 15 = par 3 et par 5. On combine les critères.</p></div>`,
  gen(R){
    const critere = (n, d) => d === 3 || d === 9
      ? 'Somme des chiffres de ' + n + ' : ' + String(n).split('').reduce((s, c) => s + (+c), 0) + ', divisible par ' + d + ' ✓'
      : d === 4 ? 'Les deux derniers chiffres de ' + n + ' forment un multiple de 4 ✓'
      : d === 8 ? n + ' se coupe trois fois en deux ✓'
      : d === 6 ? n + ' est pair ET la somme de ses chiffres est divisible par 3 ✓'
      : d === 5 ? n + ' finit par 0 ou 5 ✓' : n + ' finit par 0 ✓';
    if (Math.random() < .5){
      const d = R.pick([3, 4, 9, 5]);
      const good = R.int(12, 110) * d;
      const bads = [];
      let guard = 0;
      while (bads.length < 3 && guard++ < 400){
        const c = R.int(100, 999);
        if (c % d !== 0 && !bads.includes(c) && c !== good) bads.push(c);
      }
      while (bads.length < 3) bads.push(good + 1 + bads.length * (d + 1));
      return {q: 'Lequel de ces nombres est divisible par ' + d + ' ?', a: String(good), choix: [String(good)].concat(bads.map(String)), expl: critere(good, d)};
    }
    const cands = [3, 4, 5, 9, 6, 10, 8];
    let n = 0, good = 0, bads = [], guard = 0;
    while (guard++ < 400){
      good = R.pick(cands);
      n = good * R.int(11, 99);
      bads = cands.filter(c => c !== good && n % c !== 0);
      if (bads.length >= 3) break;
    }
    if (bads.length < 3){ n = 3 * R.int(11, 33); good = 3; bads = [4, 5, 10].filter(c => n % c !== 0); while (bads.length < 3) bads.push(8); }
    bads = R.shuffle(bads).slice(0, 3);
    return {q: 'Par lequel de ces nombres ' + n + ' est-il divisible ?', a: String(good), choix: [String(good)].concat(bads.map(String)), expl: critere(n, good)};
  }
},

/* ============ POURCENTAGES & PROPORTIONS ============ */
{
  id: 'pct', nom: 'Pourcentages de tête', icone: '％', cat: 'Pourcentages',
  astuce: "Calcule 10 % (÷10), puis déduis tout le reste.",
  methode: `<p class="lede">Toute la technique des pourcentages tient dans un seul geste : <mark>calculer 10 %, puis en déduire le reste</mark>.</p>
<div class="etapes">
<p><strong>10 %</strong> = ÷10. 10 % de 240 = 24.</p>
<p><strong>20 %</strong> = deux fois 10 % → 48.</p>
<p><strong>30 %</strong> = trois fois 10 % → 72.</p>
<p><strong>5 %</strong> = moitié de 10 % → 12.</p>
<p><strong>15 %</strong> = 10 % + 5 % → 24 + 12 = 36. <em>(le calcul du pourboire !)</em></p>
<p><strong>1 %</strong> = ÷100 → 2,4.</p>
</div>
<p>Deux autres réflexes : <strong>50 % = la moitié</strong>, <strong>25 % = le quart</strong>. Et pour une remise, pense au complément : « −30 % » signifie <mark>« il reste 70 % »</mark>, donc un article à 240 € coûte 0,7 × 240 = 168 €.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>10 % est ton unité de base. Tous les autres pourcentages s'en déduisent par doublement, moitié ou addition.</p></div>`,
  gen(R){
    const p = R.pick([10, 20, 25, 5, 50, 30, 15]);
    const base = R.pick([40, 60, 80, 120, 160, 200, 240, 300, 400, 500, 640]);
    const res = base * p / 100;
    const expl = p === 50 ? 'La moitié de ' + base + ' → ' + res + '.'
      : p === 25 ? 'Le quart de ' + base + ' → ' + res + '.'
      : '10 % de ' + base + ' = ' + (base / 10) + ', donc ' + p + ' % = ' + (p / 10) + ' × ' + (base / 10) + ' = ' + res + '.';
    return {q: p + ' % de ' + base, a: String(res), expl};
  }
},
{
  id: 'pct-malin', nom: 'Pourcentages malins', icone: '🔄', cat: 'Pourcentages',
  astuce: "x % de y = y % de x. 8 % de 50 = 50 % de 8 = 4 !",
  methode: `<p class="lede">Une propriété que presque personne ne connaît, et qui fait gagner un temps fou : <mark>on peut échanger les deux nombres</mark>.</p>
<div class="formule">x % de y = y % de x</div>
<div class="etapes">
<p><strong>8 % de 50</strong> — difficile ? Retourne-le : <strong>50 % de 8</strong> = la moitié de 8 = <mark>4</mark>.</p>
<p><strong>16 % de 25</strong> → 25 % de 16 = le quart de 16 = <mark>4</mark>.</p>
<p><strong>4 % de 75</strong> → 75 % de 4 = <mark>3</mark>.</p>
</div>
<p>Pourquoi ? Parce que x % de y = (x × y) ÷ 100, et la multiplication est commutative. Le calcul est le même, mais l'un des deux sens est <strong>beaucoup</strong> plus facile à faire de tête.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Devant un pourcentage pénible, retourne-le. Cherche toujours le sens où tu tombes sur 50 %, 25 % ou 10 %.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Aux concours SESAME et ACCÈS, ce réflexe transforme des questions « longues » en calculs de deux secondes.</p></div>`,
  gen(R){
    // on ne tire que des cas où le retournement rend le calcul VRAIMENT facile :
    // la base devient 50 % (moitié), 25 % (quart) ou 75 % (trois quarts) du petit nombre.
    const petits = [4, 8, 12, 16, 20, 24, 28, 36, 40, 60], bases = [25, 50, 75];
    const x = R.pick(petits), y = R.pick(bases);
    const res = +(x * y / 100).toFixed(2);
    const aide = y === 50 ? 'la moitié de ' + x : y === 25 ? 'le quart de ' + x : 'les trois quarts de ' + x;
    return {q: x + ' % de ' + y, a: String(res),
      expl: 'Retourne : ' + x + ' % de ' + y + ' = ' + y + ' % de ' + x + ', c\'est-à-dire ' + aide + ' = ' + String(res).replace('.', ',') + '.'};
  }
},
{
  id: 'fractions', nom: 'Fractions ↔ % ↔ décimaux', icone: '🍕', cat: 'Pourcentages',
  astuce: "1/4 = 0,25 = 25 % — connais les 8 conversions par cœur.",
  methode: `<p class="lede">Les mêmes valeurs reviennent en boucle sous trois habillages. Les connaître <mark>par cœur</mark> supprime des dizaines de calculs.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Fraction</th><th>Décimal</th><th>Pourcentage</th></tr></thead>
<tbody>
<tr><td>1/2</td><td>0,5</td><td>50 %</td></tr>
<tr><td>1/3</td><td>≈ 0,333</td><td>≈ 33,3 %</td></tr>
<tr><td>1/4</td><td>0,25</td><td>25 %</td></tr>
<tr><td>3/4</td><td>0,75</td><td>75 %</td></tr>
<tr><td>1/5</td><td>0,2</td><td>20 %</td></tr>
<tr><td>1/8</td><td>0,125</td><td>12,5 %</td></tr>
<tr><td>1/10</td><td>0,1</td><td>10 %</td></tr>
<tr><td>1/20</td><td>0,05</td><td>5 %</td></tr>
</tbody></table></div>
<p>Pour convertir une fraction en pourcentage : divise le haut par le bas, puis ×100. <strong>3/8</strong> = 0,375 → <mark>37,5 %</mark>.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Une fraction, un décimal et un pourcentage, c'est <mark>le même nombre</mark> écrit de trois façons. Choisis toujours l'écriture qui rend ton calcul facile.</p></div>`,
  gen(R){
    const T = [['1/2','0.5','50'],['1/4','0.25','25'],['3/4','0.75','75'],['1/5','0.2','20'],['2/5','0.4','40'],['1/8','0.125','12.5'],['3/8','0.375','37.5'],['1/10','0.1','10'],['1/20','0.05','5'],['3/5','0.6','60'],['7/10','0.7','70'],['5/8','0.625','62.5']];
    const r = R.pick(T), mode = R.int(1, 2);
    if (mode === 1) return {q: r[0] + ' en pourcentage ? (nombre seul)', a: r[2], expl: r[0] + ' = ' + r[1].replace('.', ',') + ' = ' + r[2] + ' %.'};
    return {q: r[2] + ' % en écriture décimale ?', a: r[1], accept: [r[0]], expl: r[2] + ' % = ' + r[2] + ' ÷ 100 = ' + r[1].replace('.', ',') + ' (soit ' + r[0] + ').'};
  }
},
{
  id: 'evolution', nom: 'Hausses et baisses', icone: '📈', cat: 'Pourcentages',
  astuce: "+20 % → ×1,2 · −20 % → ×0,8. Un seul calcul, jamais deux.",
  methode: `<p class="lede">Une évolution en pourcentage se fait <mark>en une seule multiplication</mark> — c'est le cœur du programme de STMG et un classique des concours.</p>
<div class="formule">+ t % → × (1 + t/100) &nbsp;·&nbsp; − t % → × (1 − t/100)</div>
<div class="etapes">
<p><strong>Un prix de 250 € augmente de 20 %</strong> : 250 × 1,2 = <mark>300 €</mark>.</p>
<p><strong>Il baisse ensuite de 20 %</strong> : 300 × 0,8 = <mark>240 €</mark>.</p>
<p>Surprise : on ne revient pas à 250 € ! Une baisse de 20 % <strong>n'annule pas</strong> une hausse de 20 %, car elle s'applique à une base plus grande.</p>
</div>
<p><strong>Évolutions successives</strong> : on <mark>multiplie</mark> les coefficients, on ne les additionne jamais. +10 % puis +10 % → 1,1 × 1,1 = 1,21, soit +21 % (et non +20 %).</p>
<div class="box piege"><p class="box-t">Piège de concours</p><p>« Le prix augmente de 50 % puis baisse de 50 % » → 1,5 × 0,5 = 0,75 : le prix a <strong>baissé de 25 %</strong>. Le piège tombe presque à chaque session.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Une évolution = <mark>une multiplication par un coefficient</mark>. Plusieurs évolutions = on multiplie les coefficients entre eux. On n'additionne jamais des pourcentages successifs.</p></div>`,
  gen(R){
    const base = R.pick([80, 120, 150, 200, 240, 250, 300, 400, 500]);
    const t = R.pick([10, 20, 25, 50, 5, 30]);
    const sens = R.pick(['hausse', 'baisse']);
    const k = sens === 'hausse' ? 1 + t / 100 : 1 - t / 100;
    const res = +(base * k).toFixed(2);
    return {q: base + ' € ' + (sens === 'hausse' ? 'augmente' : 'baisse') + ' de ' + t + ' %. Nouveau prix (en €) ?', a: String(res),
      expl: 'Coefficient ' + (sens === 'hausse' ? '1 + ' + t + '/100' : '1 − ' + t + '/100') + ' = ' + String(k).replace('.', ',') + ' → ' + base + ' × ' + String(k).replace('.', ',') + ' = ' + String(res).replace('.', ',') + ' €.'};
  }
},
{
  id: 'proportion', nom: 'Règle de trois éclair', icone: '⚖️', cat: 'Pourcentages',
  astuce: "Passe par 1 unité, ou repère le coefficient d'un coup d'œil.",
  methode: `<p class="lede">La proportionnalité se résout de tête dès qu'on repère <mark>le coefficient</mark> ou qu'on <mark>passe par l'unité</mark>.</p>
<div class="etapes">
<p><strong>3 croissants coûtent 4,50 €. Combien pour 7 ?</strong></p>
<p>Méthode 1 — par l'unité : 4,50 ÷ 3 = 1,50 € l'un, puis × 7 = <mark>10,50 €</mark>.</p>
<p>Méthode 2 — par le coefficient : de 3 à 7… pas rond. On garde la méthode 1.</p>
<p><strong>4 stylos coûtent 6 €. Combien pour 12 ?</strong></p>
<p>Ici le coefficient saute aux yeux : 12 = 3 × 4, donc prix = 3 × 6 = <mark>18 €</mark>. Instantané.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Regarde d'abord si l'un est un multiple simple de l'autre (×2, ×3, ×10) : c'est immédiat. Sinon, <mark>passe par 1 unité</mark>.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie la cohérence : plus de quantité doit donner plus cher. Ce contrôle de bon sens élimine la moitié des erreurs de concours.</p></div>`,
  gen(R){
    const u = R.pick([1.5, 2, 2.5, 3, 4, 5, 6, 0.8]);
    const n1 = R.int(2, 6), n2 = R.int(3, 12);
    const p1 = +(u * n1).toFixed(2), p2 = +(u * n2).toFixed(2);
    return {q: n1 + ' articles coûtent ' + String(p1).replace('.', ',') + ' €.\nCombien coûtent ' + n2 + ' articles (en €) ?', a: String(p2),
      expl: 'Prix unitaire : ' + String(p1).replace('.', ',') + ' ÷ ' + n1 + ' = ' + String(u).replace('.', ',') + ' €. Puis × ' + n2 + ' = ' + String(p2).replace('.', ',') + ' €.'};
  }
},

/* ============ ASTUCES DE CHAMPION ============ */
{
  id: 'estim', nom: 'Ordres de grandeur', icone: '🔭', cat: 'Astuces de champion',
  astuce: "Arrondis tout, compte les zéros : la bonne réponse saute aux yeux.",
  methode: `<p class="lede">Aux QCM, il est souvent inutile de calculer : <mark>l'ordre de grandeur élimine trois réponses sur quatre</mark>.</p>
<div class="etapes">
<p><strong>397 × 21 ≈ ?</strong></p>
<p>J'arrondis : 400 × 20 = 8 000. Aucun besoin du résultat exact (8 337) pour choisir dans une liste.</p>
<p><strong>Compter les zéros</strong> : 400 × 20 = 4 × 2 = 8, suivi de 2 + 1 = 3 zéros → 8 000.</p>
</div>
<p>Ce réflexe sert aussi de <strong>contrôle systématique</strong> : après chaque calcul posé, demande-toi « l'ordre de grandeur est-il crédible ? ». Une réponse dix fois trop grande se détecte en une seconde — et c'est l'erreur la plus fréquente aux examens.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Arrondir n'est pas tricher : c'est une méthode. Estime <mark>avant</mark> de calculer, contrôle <mark>après</mark>.</p></div>`,
  gen(R){
    const a = R.pick([197, 297, 397, 498, 612, 789, 1980]), b = R.pick([19, 21, 29, 31, 48, 51]);
    const exact = a * b;
    const mag = Math.pow(10, String(Math.round(exact)).length - 1);
    const good = Math.round(exact / mag) * mag;
    const choix = [good, good * 10, good / 10, good * 2].map(x => String(Math.round(x)));
    const uniq = [...new Set(choix)];
    while (uniq.length < 4) uniq.push(String(Math.round(good * (uniq.length + 3))));
    return {q: 'Environ combien fait ' + a + ' × ' + b + ' ?', a: String(good), choix: uniq.slice(0, 4),
      expl: 'On arrondit : ≈ ' + Math.round(a / 100) * 100 + ' × ' + Math.round(b / 10) * 10 + ' ≈ ' + good + ' (valeur exacte ' + exact + ').'};
  }
},
{
  id: 'simplif', nom: 'Simplifier avant de calculer', icone: '✂️', cat: 'Astuces de champion',
  astuce: "Divise le haut et le bas par le même nombre avant de foncer.",
  methode: `<p class="lede">La technique du paresseux intelligent : <mark>on simplifie d'abord, on calcule ensuite</mark> — souvent il ne reste presque rien à calculer.</p>
<div class="etapes">
<p><strong>480 ÷ 15</strong> : je divise les deux par 5 → 96 ÷ 3 = <mark>32</mark>.</p>
<p><strong>36/48</strong> : les deux par 12 → <mark>3/4</mark>.</p>
<p><strong>25 × 36 ÷ 5</strong> : je simplifie 25 et 5 → 5 × 36 = <mark>180</mark>.</p>
<p><strong>14 × 15</strong> : je déplace un facteur → 7 × 30 = <mark>210</mark>. <em>(j'ai coupé 14 en deux et doublé 15)</em></p>
</div>
<p>Ce dernier geste est très puissant : dans un produit, tu peux <strong>diviser un facteur par 2 si tu multiplies l'autre par 2</strong>. 16 × 25 → 8 × 50 → 4 × 100 = 400.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Avant tout calcul, demande-toi : « puis-je simplifier ? ». Deux secondes de réflexion valent souvent trente secondes de calcul.</p></div>`,
  gen(R){
    const t = R.int(1, 2);
    if (t === 1){ const q0 = R.int(11, 40), d = R.pick([15, 25, 35, 45]); const n = q0 * d;
      return {q: n + ' ÷ ' + d, a: String(q0), expl: 'Je divise les deux par 5 : ' + (n / 5) + ' ÷ ' + (d / 5) + ' = ' + q0 + '.'}; }
    const a = R.pick([14, 16, 18, 24, 12]), b = R.pick([15, 25, 35, 50]);
    return {q: a + ' × ' + b, a: String(a * b), expl: 'Je coupe ' + a + ' en deux et je double ' + b + ' : ' + (a / 2) + ' × ' + (b * 2) + ' = ' + (a * b) + '.'};
  }
},
{
  id: 'moyennes', nom: 'Moyennes de tête', icone: '📊', cat: 'Astuces de champion',
  astuce: "Choisis un pivot et fais la moyenne des écarts.",
  methode: `<p class="lede">Calculer une moyenne sans tout additionner : on prend un <mark>pivot</mark> et on ne travaille que sur les écarts.</p>
<div class="etapes">
<p><strong>Moyenne de 12, 14, 15, 19</strong></p>
<p>1. Pivot : 15 (au jugé, vers le milieu).</p>
<p>2. Écarts : −3, −1, 0, +4. Somme = 0.</p>
<p>3. Moyenne des écarts : 0 ÷ 4 = 0 → moyenne = 15 + 0 = <mark>15</mark>.</p>
<p><strong>Moyenne de 48, 52, 53</strong> — pivot 50 : écarts −2, +2, +3 → somme 3, ÷3 = 1 → <mark>51</mark>.</p>
</div>
<p>Utile pour tes notes : si tu as 11, 13 et 15 de moyenne, pivot 13, écarts −2, 0, +2 → moyenne exactement <strong>13</strong>.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Moyenne = pivot + (moyenne des écarts au pivot). On manipule des petits nombres au lieu de grands.</p></div>`,
  gen(R){
    const n = R.pick([3, 4]), pivot = R.pick([10, 12, 15, 20, 50]);
    let ecarts = [], somme = 0;
    for (let i = 0; i < n; i++){ const e = R.int(-4, 4); ecarts.push(e); somme += e; }
    // ajuster pour que la moyenne soit propre
    const reste = ((somme % n) + n) % n;
    if (reste !== 0){ ecarts[0] -= reste; somme -= reste; }
    const vals = ecarts.map(e => pivot + e);
    const moy = pivot + somme / n;
    return {q: 'Moyenne de ' + vals.join(' ; ') + ' ?', a: String(moy),
      expl: 'Pivot ' + pivot + ', écarts ' + ecarts.map(e => (e >= 0 ? '+' + e : e)).join(', ') + ' → somme ' + somme + ', ÷ ' + n + ' = ' + (somme / n) + '. Moyenne = ' + pivot + ' + ' + (somme / n) + ' = ' + moy + '.'};
  }
},
{
  id: 'puissances', nom: 'Puissances utiles', icone: '🔺', cat: 'Astuces de champion',
  astuce: "Connais 2⁴=16, 2⁵=32, 2¹⁰=1024, et les carrés jusqu'à 20².",
  methode: `<p class="lede">Quelques puissances reviennent sans cesse. Les connaître par cœur, c'est <mark>autant de calculs supprimés</mark>.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Puissances de 2</th><th>Carrés</th><th>Cubes</th></tr></thead>
<tbody>
<tr><td>2² = 4 · 2³ = 8</td><td>11² = 121 · 12² = 144</td><td>2³ = 8</td></tr>
<tr><td>2⁴ = 16 · 2⁵ = 32</td><td>13² = 169 · 14² = 196</td><td>3³ = 27</td></tr>
<tr><td>2⁶ = 64 · 2⁷ = 128</td><td>15² = 225 · 16² = 256</td><td>4³ = 64</td></tr>
<tr><td>2⁸ = 256 · 2¹⁰ = 1024</td><td>20² = 400 · 25² = 625</td><td>5³ = 125</td></tr>
</tbody></table></div>
<p>Et les deux règles qui évitent tout calcul : <strong>a<sup>n</sup> × a<sup>p</sup> = a<sup>n+p</sup></strong> (2³ × 2⁴ = 2⁷ = 128) et <strong>a<sup>n</sup> ÷ a<sup>p</sup> = a<sup>n−p</sup></strong>.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Quand tu multiplies des puissances du <mark>même nombre</mark>, tu additionnes les exposants. Jamais on ne multiplie les exposants (sauf pour (a<sup>n</sup>)<sup>p</sup>).</p></div>`,
  gen(R){
    const t = R.int(1, 3);
    if (t === 1){ const n = R.int(2, 10); return {q: '2^' + n + ' (2 puissance ' + n + ')', a: String(Math.pow(2, n)), expl: 'On double ' + n + ' fois : ' + Math.pow(2, n) + '.'}; }
    if (t === 2){ const n = R.int(11, 20); return {q: n + '²', a: String(n * n), expl: n + ' × ' + n + ' = ' + (n * n) + ' (à connaître par cœur).'}; }
    const a = R.int(2, 5), n = R.int(2, 4), p = R.int(2, 3);
    return {q: a + '^' + n + ' × ' + a + '^' + p + ' = ' + a + '^ ? (l\'exposant seul)', a: String(n + p), expl: 'Même base : on additionne les exposants, ' + n + ' + ' + p + ' = ' + (n + p) + '.'};
  }
}

];
})();
