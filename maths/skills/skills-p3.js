/* ============================================================
   Phase 3 — Seconde
   skills-p3.js — 9 skills : identités remarquables, factorisation,
   inéquations, fonctions, droites, évolutions, probabilités,
   quartiles, systèmes 2×2.
   ============================================================ */
(function(){

  /* ---------- Helpers partagés (internes à la phase 3) ---------- */

  function disp(n){ return n < 0 ? '−' + Math.abs(n) : String(n); }

  function ansInt(n){
    return { a: String(n), accept: n < 0 ? ['−' + Math.abs(n)] : null };
  }

  function frNum(x){ return String(x).replace('.', ','); }

  function eurFr(cents){ return (cents / 100).toFixed(2).replace('.', ','); }

  function ansEur(cents){
    var v = cents / 100, s = String(v), f = v.toFixed(2);
    return { a: s, accept: f === s ? null : [f] };
  }

  function pgcd(a, b){
    a = Math.abs(a); b = Math.abs(b);
    while(b){ var t = a % b; a = b; b = t; }
    return a;
  }

  // Fraction n/d : réponse canonique irréductible + formes acceptées
  function frac(n, d){
    if(n === 0) return { a: '0', accept: ['0/' + d] };
    var g = pgcd(n, d), nn = n / g, dd = d / g, acc = [];
    if(nn !== n || dd !== d) acc.push(n + '/' + d);
    var a;
    if(dd === 1){ a = String(nn); }
    else {
      a = nn + '/' + dd;
      if((nn * 1000) % dd === 0) acc.push(String(nn / dd));
    }
    return { a: a, accept: acc.length ? acc : null };
  }

  // Expression affine "mx + p" joliment écrite
  function aff(m, p){
    var s;
    if(m === 0) s = '';
    else if(m === 1) s = 'x';
    else if(m === -1) s = '−x';
    else s = (m < 0 ? '−' + Math.abs(m) : String(m)) + 'x';
    if(p > 0) s += (s ? ' + ' : '') + p;
    else if(p < 0) s += (s ? ' − ' : '−') + Math.abs(p);
    else if(!s) s = '0';
    return s;
  }

  // Polynôme ax² + bx + c (b, c >= 0 dans nos usages)
  function poly(a, b, c){
    var s = (a === 1 ? 'x²' : a + 'x²');
    if(b > 0) s += ' + ' + (b === 1 ? 'x' : b + 'x');
    if(c > 0) s += ' + ' + c;
    return s;
  }

  // Réponse d'inéquation : a = 'x>5' (ASCII), formes acceptées en plus
  function ineqAns(op, v){
    var a = 'x' + op + v;
    var acc = [];
    acc.push(op === '>' ? (v + '<x') : (v + '>x'));
    if(v < 0){
      acc.push('x' + op + '−' + Math.abs(v));
      acc.push(op === '>' ? ('−' + Math.abs(v) + '<x') : ('−' + Math.abs(v) + '>x'));
    }
    return { a: a, accept: acc };
  }

  // Coefficient multiplicateur : a = '1.15', accepte '1.150' etc.
  function cmAns(t){
    var v = (100 + t) / 100, s = String(v), f = v.toFixed(2);
    return { a: s, accept: f === s ? null : [f] };
  }

  /* ============================================================
     1. p3-01-identites — Les identités remarquables
     ============================================================ */
  SKILLS.push({
    id: 'p3-01-identites',
    phase: 3,
    ordre: 1,
    titre: 'Les identités remarquables',
    objectif: "Connaître (a+b)², (a−b)² et (a+b)(a−b) par cœur et savoir les utiliser dans les deux sens.",
    lecon: `<p class="lede">Trois formules à connaître comme ton propre prénom. Elles servent partout : pour développer vite, pour factoriser, et même pour calculer de tête. Ce sont les <mark>identités remarquables</mark>.</p>
<div class="formule">
<p>(a + b)<sup>2</sup> = a<sup>2</sup> + 2ab + b<sup>2</sup></p>
<p>(a − b)<sup>2</sup> = a<sup>2</sup> − 2ab + b<sup>2</sup></p>
<p>(a + b)(a − b) = a<sup>2</sup> − b<sup>2</sup></p>
</div>
<p>Développons ensemble (x + 3)<sup>2</sup> pour comprendre d'où vient la formule :</p>
<div class="etapes">
<p><b>Étape 1</b> — (x + 3)<sup>2</sup>, c'est (x + 3)(x + 3). Un carré, c'est un nombre multiplié par lui-même.</p>
<p><b>Étape 2</b> — On distribue tout : x×x + x×3 + 3×x + 3×3.</p>
<p><b>Étape 3</b> — Ça donne x<sup>2</sup> + 3x + 3x + 9. Les deux « 3x » s'additionnent : c'est le fameux <mark>double produit</mark>.</p>
<p><b>Étape 4</b> — Résultat : x<sup>2</sup> + 6x + 9. On retrouve bien a<sup>2</sup> + 2ab + b<sup>2</sup> avec a = x et b = 3.</p>
</div>
<p>Ces formules marchent aussi avec des nombres, pour calculer de tête : 101<sup>2</sup> = (100 + 1)<sup>2</sup> = 10 000 + 200 + 1 = 10 201. Et 102 × 98 = (100 + 2)(100 − 2) = 10 000 − 4 = 9 996. Magique, mais surtout logique.</p>
<div class="box piege"><p class="box-t">Piège classique</p><p>Écrire (a + b)<sup>2</sup> = a<sup>2</sup> + b<sup>2</sup> est l'erreur n°1 en France. C'est FAUX : il manque le double produit 2ab. Vérifie avec a = b = 1 : (1+1)<sup>2</sup> = 4, alors que 1 + 1 = 2.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Un carré développé a toujours 3 termes : <mark>carré du premier, double produit, carré du second</mark>. Seul (a + b)(a − b) donne 2 termes : a<sup>2</sup> − b<sup>2</sup>.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour vérifier un développement, remplace x par 1 dans les deux expressions : si les résultats diffèrent, tu t'es trompé quelque part.</p></div>`,
    gen(level, R){
      if(level === 1){
        var b = R.int(2, 6);
        var forme = R.pick(['plus', 'moins', 'conj']);
        var correct, d1, d2, d3, q, expl;
        if(forme === 'plus'){
          q = 'Développe : (x + ' + b + ')²';
          correct = 'x² + ' + (2*b) + 'x + ' + (b*b);
          d1 = 'x² + ' + (b*b);
          d2 = 'x² − ' + (2*b) + 'x + ' + (b*b);
          d3 = 'x² + ' + b + 'x + ' + (b*b);
          expl = '(x + ' + b + ')² = x² + 2×' + b + 'x + ' + b + '² = x² + ' + (2*b) + 'x + ' + (b*b) + '. N\'oublie jamais le double produit !';
        } else if(forme === 'moins'){
          q = 'Développe : (x − ' + b + ')²';
          correct = 'x² − ' + (2*b) + 'x + ' + (b*b);
          d1 = 'x² − ' + (b*b);
          d2 = 'x² + ' + (2*b) + 'x + ' + (b*b);
          d3 = 'x² − ' + (2*b) + 'x − ' + (b*b);
          expl = '(x − ' + b + ')² = x² − 2×' + b + 'x + ' + b + '² : le double produit est négatif, mais le carré ' + (b*b) + ' reste positif.';
        } else {
          q = 'Développe : (x + ' + b + ')(x − ' + b + ')';
          correct = 'x² − ' + (b*b);
          d1 = 'x² + ' + (b*b);
          d2 = 'x² − ' + (2*b) + 'x + ' + (b*b);
          d3 = 'x² − ' + (2*b) + 'x − ' + (b*b);
          expl = '(a + b)(a − b) = a² − b² : les doubles produits +' + b + 'x et −' + b + 'x s\'annulent. Il reste x² − ' + (b*b) + '.';
        }
        return { q: q, a: correct, accept: null, choix: [correct, d1, d2, d3], expl: expl };
      }
      if(level === 2){
        var type = R.pick(['sqplus', 'sqmoins', 'conj', 'qcm']);
        if(type === 'sqplus'){
          var t = R.pick([[21,20,1],[31,30,1],[41,40,1],[51,50,1],[61,60,1],[102,100,2],[103,100,3]]);
          var n = t[0], A = t[1], B = t[2], v = n*n;
          return { q: 'Calcule astucieusement : ' + n + '² (pense à (' + A + ' + ' + B + ')²)',
            a: String(v), accept: null, choix: null,
            expl: '(' + A + ' + ' + B + ')² = ' + (A*A) + ' + 2×' + A + '×' + B + ' + ' + (B*B) + ' = ' + (A*A) + ' + ' + (2*A*B) + ' + ' + (B*B) + ' = ' + v + '.' };
        }
        if(type === 'sqmoins'){
          var t2 = R.pick([[19,20,1],[29,30,1],[39,40,1],[49,50,1],[59,60,1],[99,100,1],[98,100,2]]);
          var n2 = t2[0], A2 = t2[1], B2 = t2[2], v2 = n2*n2;
          return { q: 'Calcule astucieusement : ' + n2 + '² (pense à (' + A2 + ' − ' + B2 + ')²)',
            a: String(v2), accept: null, choix: null,
            expl: '(' + A2 + ' − ' + B2 + ')² = ' + (A2*A2) + ' − 2×' + A2 + '×' + B2 + ' + ' + (B2*B2) + ' = ' + (A2*A2) + ' − ' + (2*A2*B2) + ' + ' + (B2*B2) + ' = ' + v2 + '.' };
        }
        if(type === 'conj'){
          var m = R.pick([20, 30, 40, 50, 100]);
          var d = R.int(1, 3);
          var v3 = m*m - d*d;
          return { q: 'Calcule astucieusement : ' + (m + d) + ' × ' + (m - d),
            a: String(v3), accept: null, choix: null,
            expl: '(' + m + ' + ' + d + ')(' + m + ' − ' + d + ') = ' + m + '² − ' + d + '² = ' + (m*m) + ' − ' + (d*d) + ' = ' + v3 + '.' };
        }
        var b2 = R.int(3, 7);
        var c2 = 'x² − ' + (2*b2) + 'x + ' + (b2*b2);
        return { q: 'Développe : (x − ' + b2 + ')²',
          a: c2, accept: null,
          choix: [c2, 'x² − ' + (b2*b2), 'x² + ' + (2*b2) + 'x + ' + (b2*b2), 'x² − ' + b2 + 'x + ' + (b2*b2)],
          expl: '(x − ' + b2 + ')² = x² − 2×' + b2 + 'x + ' + (b2*b2) + '. Trois termes, double produit négatif.' };
      }
      // level 3
      var type3 = R.pick(['carre', 'conj', 'inverse']);
      if(type3 === 'carre'){
        var k = R.int(2, 3), bb = R.int(2, 5);
        var s = R.pick(['+', '−']);
        var mid = (s === '+') ? ' + ' : ' − ';
        var correct3 = (k*k) + 'x²' + mid + (2*k*bb) + 'x + ' + (bb*bb);
        var da = k + 'x²' + mid + (2*k*bb) + 'x + ' + (bb*bb);
        var db = (k*k) + 'x²' + mid + (k*bb) + 'x + ' + (bb*bb);
        var dc = (s === '+') ? ((k*k) + 'x² + ' + (bb*bb)) : ((k*k) + 'x² − ' + (bb*bb));
        return { q: 'Développe : (' + k + 'x ' + s + ' ' + bb + ')²',
          a: correct3, accept: null, choix: [correct3, da, db, dc],
          expl: '(' + k + 'x)² = ' + (k*k) + 'x² (le coefficient est aussi au carré), double produit 2×' + k + 'x×' + bb + ' = ' + (2*k*bb) + 'x, et ' + bb + '² = ' + (bb*bb) + '.' };
      }
      if(type3 === 'conj'){
        var k2 = R.int(2, 3), b3 = R.int(2, 5);
        var c3 = (k2*k2) + 'x² − ' + (b3*b3);
        return { q: 'Développe : (' + k2 + 'x + ' + b3 + ')(' + k2 + 'x − ' + b3 + ')',
          a: c3, accept: null,
          choix: [c3, k2 + 'x² − ' + (b3*b3), (k2*k2) + 'x² + ' + (b3*b3), (k2*k2) + 'x² − ' + (2*k2*b3) + 'x − ' + (b3*b3)],
          expl: '(a + b)(a − b) = a² − b² avec a = ' + k2 + 'x : (' + k2 + 'x)² − ' + b3 + '² = ' + (k2*k2) + 'x² − ' + (b3*b3) + '.' };
      }
      var b4 = R.int(2, 6);
      var vari = R.pick(['plus', 'moins', 'diff']);
      if(vari === 'plus'){
        var cp = '(x + ' + b4 + ')²';
        return { q: 'Quelle expression est égale à x² + ' + (2*b4) + 'x + ' + (b4*b4) + ' ?',
          a: cp, accept: null,
          choix: [cp, '(x − ' + b4 + ')²', '(x + ' + (2*b4) + ')²', '(x + ' + b4 + ')(x − ' + b4 + ')'],
          expl: 'On reconnaît a² + 2ab + b² avec b = ' + b4 + ' (car ' + (b4*b4) + ' = ' + b4 + '² et ' + (2*b4) + ' = 2×' + b4 + ') : c\'est (x + ' + b4 + ')².' };
      }
      if(vari === 'moins'){
        var cm = '(x − ' + b4 + ')²';
        return { q: 'Quelle expression est égale à x² − ' + (2*b4) + 'x + ' + (b4*b4) + ' ?',
          a: cm, accept: null,
          choix: [cm, '(x + ' + b4 + ')²', '(x − ' + (2*b4) + ')²', '(x + ' + b4 + ')(x − ' + b4 + ')'],
          expl: 'Le double produit est négatif et le dernier terme positif : c\'est la forme (a − b)², donc (x − ' + b4 + ')².' };
      }
      var cd = '(x + ' + b4 + ')(x − ' + b4 + ')';
      return { q: 'Quelle expression est égale à x² − ' + (b4*b4) + ' ?',
        a: cd, accept: null,
        choix: [cd, '(x − ' + b4 + ')²', '(x + ' + b4 + ')²', '(x + ' + (b4*b4) + ')(x − ' + (b4*b4) + ')'],
        expl: 'Une différence de deux carrés : x² − ' + (b4*b4) + ' = x² − ' + b4 + '² = (x + ' + b4 + ')(x − ' + b4 + '). Attention : on prend ' + b4 + ', pas ' + (b4*b4) + ' !' };
    }
  });

  /* ============================================================
     2. p3-02-factorisation — Factoriser
     ============================================================ */
  SKILLS.push({
    id: 'p3-02-factorisation',
    phase: 3,
    ordre: 2,
    titre: 'Factoriser',
    objectif: "Transformer une somme en produit grâce au facteur commun ou aux identités remarquables.",
    lecon: `<p class="lede">Factoriser, c'est faire le chemin inverse du développement : transformer une <mark>somme</mark> en <mark>produit</mark>. C'est l'outil roi pour résoudre des équations et simplifier des expressions.</p>
<p><b>Méthode 1 : le facteur commun.</b> Si un même nombre (ou un même x) apparaît dans tous les termes, on le « sort ». Exemple avec 6x + 12 :</p>
<div class="etapes">
<p><b>Étape 1</b> — Je cherche ce qui divise les deux termes : 6x = <mark>6</mark> × x et 12 = <mark>6</mark> × 2. Le facteur commun est 6.</p>
<p><b>Étape 2</b> — Je le mets devant une parenthèse : 6x + 12 = 6 × (x + 2) = <mark>6(x + 2)</mark>.</p>
<p><b>Étape 3</b> — Je vérifie en développant : 6 × x + 6 × 2 = 6x + 12. C'est bon !</p>
</div>
<p><b>Méthode 2 : les identités remarquables à l'envers.</b> Si l'expression ressemble à un développement connu, on remonte à la forme factorisée :</p>
<div class="etapes">
<p>x<sup>2</sup> + 10x + 25 : je repère 25 = 5<sup>2</sup> et 10x = 2 × 5 × x. C'est a<sup>2</sup> + 2ab + b<sup>2</sup>, donc x<sup>2</sup> + 10x + 25 = <mark>(x + 5)<sup>2</sup></mark>.</p>
<p>x<sup>2</sup> − 49 : une différence de deux carrés, x<sup>2</sup> − 7<sup>2</sup>. Donc x<sup>2</sup> − 49 = <mark>(x + 7)(x − 7)</mark>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Face à une expression à factoriser : <mark>1) je cherche un facteur commun ; 2) sinon, je cherche une identité remarquable</mark>. Un carré parfait au bout (9, 16, 25…) et un double produit au milieu → (a ± b)². Deux carrés séparés par un moins → (a + b)(a − b).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Toujours vérifier en développant ta réponse : tu dois retomber exactement sur l'expression de départ. Ça prend 10 secondes et ça élimine 90 % des erreurs.</p></div>
<div class="box piege"><p class="box-t">Piège classique</p><p>x<sup>2</sup> − 25 n'est PAS égal à (x − 5)<sup>2</sup>. Développe pour t'en convaincre : (x − 5)<sup>2</sup> = x<sup>2</sup> − 10x + 25. La bonne factorisation est (x + 5)(x − 5).</p></div>`,
    gen(level, R){
      if(level === 1){
        var k = R.int(2, 6), m = R.int(2, 7);
        var s = R.pick(['+', '−']);
        var expr = k + 'x ' + s + ' ' + (k*m);
        var correct = k + '(x ' + s + ' ' + m + ')';
        var d1 = k + '(x ' + s + ' ' + (k*m) + ')';
        var d2 = k + '(' + k + 'x ' + s + ' ' + m + ')';
        var d3 = 'x(' + k + ' ' + s + ' ' + m + ')';
        return { q: 'Factorise : ' + expr,
          a: correct, accept: null, choix: [correct, d1, d2, d3],
          expl: k + 'x = ' + k + '×x et ' + (k*m) + ' = ' + k + '×' + m + ' : le facteur commun est ' + k + '. On obtient ' + correct + '. Vérifie en développant !' };
      }
      if(level === 2){
        var type = R.pick(['fx', 'idplus', 'idmoins']);
        if(type === 'fx'){
          var aC = R.int(2, 5), bC = R.int(2, 9);
          var expr2 = aC + 'x² + ' + bC + 'x';
          var c2 = 'x(' + aC + 'x + ' + bC + ')';
          return { q: 'Factorise : ' + expr2,
            a: c2, accept: null,
            choix: [c2, aC + 'x(x + ' + bC + ')', 'x(' + aC + 'x² + ' + bC + ')', 'x²(' + aC + ' + ' + bC + ')'],
            expl: aC + 'x² = x × ' + aC + 'x et ' + bC + 'x = x × ' + bC + ' : le facteur commun est x. Donc ' + expr2 + ' = ' + c2 + '.' };
        }
        var b = R.int(2, 7);
        if(type === 'idplus'){
          var cp = '(x + ' + b + ')²';
          return { q: 'Factorise : x² + ' + (2*b) + 'x + ' + (b*b),
            a: cp, accept: null,
            choix: [cp, '(x − ' + b + ')²', '(x + ' + (2*b) + ')²', '(x + ' + b + ')(x − ' + b + ')'],
            expl: (b*b) + ' = ' + b + '² et ' + (2*b) + 'x = 2×' + b + '×x : on reconnaît a² + 2ab + b² = (a + b)², donc ' + cp + '.' };
        }
        var cm = '(x − ' + b + ')²';
        return { q: 'Factorise : x² − ' + (2*b) + 'x + ' + (b*b),
          a: cm, accept: null,
          choix: [cm, '(x + ' + b + ')²', '(x − ' + (2*b) + ')²', '(x + ' + b + ')(x − ' + b + ')'],
          expl: 'Double produit négatif, dernier terme positif : c\'est (a − b)² = ' + cm + '. Vérifie : (x − ' + b + ')² = x² − ' + (2*b) + 'x + ' + (b*b) + '.' };
      }
      // level 3
      var type3 = R.pick(['diff', 'kx']);
      if(type3 === 'diff'){
        var b3 = R.int(2, 9);
        var c3 = '(x + ' + b3 + ')(x − ' + b3 + ')';
        return { q: 'Factorise : x² − ' + (b3*b3),
          a: c3, accept: null,
          choix: [c3, '(x − ' + b3 + ')²', '(x + ' + b3 + ')²', '(x + ' + (b3*b3) + ')(x − ' + (b3*b3) + ')'],
          expl: 'x² − ' + (b3*b3) + ' = x² − ' + b3 + '² : différence de deux carrés, donc ' + c3 + '. Surtout pas (x − ' + b3 + ')², qui donnerait un double produit.' };
      }
      var k3 = R.int(2, 4), m3 = R.int(2, 6);
      var expr3 = k3 + 'x² + ' + (k3*m3) + 'x';
      var c4 = k3 + 'x(x + ' + m3 + ')';
      return { q: 'Factorise complètement : ' + expr3,
        a: c4, accept: null,
        choix: [c4, k3 + 'x(x + ' + (k3*m3) + ')', 'x(' + k3 + 'x + ' + m3 + ')', k3 + 'x(' + k3 + 'x + ' + m3 + ')'],
        expl: 'Le facteur commun est ' + k3 + 'x (le plus grand possible) : ' + expr3 + ' = ' + c4 + '. Sortir seulement x ou seulement ' + k3 + ' serait une factorisation incomplète.' };
    }
  });

  /* ============================================================
     3. p3-03-inequations — Les inéquations
     ============================================================ */
  SKILLS.push({
    id: 'p3-03-inequations',
    phase: 3,
    ordre: 3,
    titre: 'Les inéquations',
    objectif: "Résoudre ax + b > c sans se faire piéger par le sens, et lire le signe d'un produit.",
    lecon: `<p class="lede">Une inéquation, c'est comme une équation, mais avec &lt; ou &gt; à la place du =. La solution n'est plus UN nombre : c'est <mark>tout un ensemble de nombres</mark>, comme « tous les x plus grands que 5 ».</p>
<p>Les règles sont presque les mêmes que pour les équations… avec UNE exception cruciale. Résolvons 3x + 5 &gt; 20 :</p>
<div class="etapes">
<p><b>Étape 1</b> — J'enlève 5 des deux côtés : 3x &gt; 15. (Ajouter ou enlever un nombre ne change jamais le sens.)</p>
<p><b>Étape 2</b> — Je divise par 3 des deux côtés : x &gt; 5. (Diviser par un nombre <b>positif</b> ne change pas le sens.)</p>
<p><b>Étape 3</b> — Solution : tous les nombres strictement plus grands que 5. Je teste x = 6 : 3×6 + 5 = 23 &gt; 20. ✓</p>
</div>
<p>Maintenant le cas piège : <b>−2x + 3 &gt; 11</b>.</p>
<div class="etapes">
<p><b>Étape 1</b> — J'enlève 3 : −2x &gt; 8.</p>
<p><b>Étape 2</b> — Je divise par <mark>−2, un nombre négatif : je DOIS retourner le sens</mark> : x &lt; −4.</p>
<p><b>Étape 3</b> — Vérification avec x = −5 : −2×(−5) + 3 = 13 &gt; 11. ✓</p>
</div>
<p><b>Signe d'un produit.</b> Pour savoir quand (x − 2)(x + 3) est positif ou négatif, on regarde le signe de chaque facteur : un produit est <mark>positif si les deux facteurs ont le même signe</mark>, négatif sinon. Ici les facteurs s'annulent en 2 et en −3 : le produit est négatif entre les racines (−3 &lt; x &lt; 2) et positif à l'extérieur. C'est exactement ce que résume un tableau de signes.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Multiplier ou diviser les deux côtés par un nombre <mark>négatif</mark> retourne le sens de l'inégalité. Par un positif : rien ne change. Produit de deux facteurs : <mark>négatif entre les racines, positif à l'extérieur</mark> (quand les coefficients de x sont positifs).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Doute sur le sens ? Teste un nombre ! Prends une valeur dans ta solution et vérifie l'inéquation de départ. Si ça coince, c'est que le sens devait être retourné.</p></div>`,
    gen(level, R){
      if(level === 1){
        var type = R.pick(['addsub', 'mult']);
        if(type === 'addsub'){
          var v = R.int(2, 15), b = R.int(2, 9);
          var op = R.pick(['>', '<']);
          var c = v + b;
          var r = ineqAns(op, v);
          return { q: 'Résous : x + ' + b + ' ' + op + ' ' + c + '\nRéponds sous la forme x>' + v + ' ou x<' + v + '.',
            a: r.a, accept: r.accept, choix: null,
            expl: 'On enlève ' + b + ' des deux côtés : x ' + op + ' ' + c + ' − ' + b + ', donc x ' + op + ' ' + v + '. Le sens ne change pas.' };
        }
        var k = R.int(2, 5), v2 = R.int(2, 9);
        var op2 = R.pick(['>', '<']);
        var c2 = k * v2;
        var r2 = ineqAns(op2, v2);
        return { q: 'Résous : ' + k + 'x ' + op2 + ' ' + c2 + '\nRéponds sous la forme x>' + v2 + ' ou x<' + v2 + '.',
          a: r2.a, accept: r2.accept, choix: null,
          expl: 'On divise par ' + k + ' (positif, le sens ne change pas) : x ' + op2 + ' ' + c2 + ' ÷ ' + k + ' = ' + v2 + '.' };
      }
      if(level === 2){
        var type2 = R.pick(['clavier', 'negqcm']);
        if(type2 === 'clavier'){
          var aC = R.int(2, 5), v3 = R.int(1, 9), b3 = R.int(1, 9);
          var op3 = R.pick(['>', '<']);
          var c3 = aC * v3 + b3;
          var r3 = ineqAns(op3, v3);
          return { q: 'Résous : ' + aC + 'x + ' + b3 + ' ' + op3 + ' ' + c3 + '\nRéponds sous la forme x>' + v3 + ' ou x<' + v3 + '.',
            a: r3.a, accept: r3.accept, choix: null,
            expl: 'On enlève ' + b3 + ' : ' + aC + 'x ' + op3 + ' ' + (aC*v3) + ', puis on divise par ' + aC + ' (positif) : x ' + op3 + ' ' + v3 + '.' };
        }
        var m = R.int(2, 4);
        var v4 = 0;
        while(v4 === 0){ v4 = R.int(-5, 5); }
        var b4 = R.int(1, 9);
        var c4 = -m * v4 + b4;
        var correct = 'x < ' + disp(v4);
        return { q: 'Résous : −' + m + 'x + ' + b4 + ' > ' + disp(c4),
          a: correct, accept: null,
          choix: [correct, 'x > ' + disp(v4), 'x < ' + disp(-v4), 'x > ' + disp(-v4)],
          expl: '−' + m + 'x > ' + disp(c4 - b4) + ' ; on divise par −' + m + ' (négatif), donc on RETOURNE le sens : x < ' + disp(v4) + '.' };
      }
      // level 3
      var type3 = R.pick(['clavier', 'signe']);
      if(type3 === 'clavier'){
        var a3 = R.int(2, 4);
        var v5 = 0;
        while(v5 === 0){ v5 = R.int(-5, 8); }
        var c5 = R.int(2, 12);
        var d5 = c5 - a3 * v5;
        var sens = R.pick(['>', '<']);
        var opRes = (sens === '>') ? '<' : '>';
        var r5 = ineqAns(opRes, v5);
        return { q: 'Résous : ' + c5 + ' − ' + a3 + 'x ' + sens + ' ' + disp(d5) + '\nRéponds sous la forme x>' + Math.abs(v5) + ' ou x<' + Math.abs(v5) + ' (avec le signe si besoin).',
          a: r5.a, accept: r5.accept, choix: null,
          expl: 'On enlève ' + c5 + ' : −' + a3 + 'x ' + sens + ' ' + disp(d5 - c5) + '. On divise par −' + a3 + ' (négatif) : le sens se retourne, x ' + opRes + ' ' + disp(v5) + '.' };
      }
      var r1 = 0, r2v = 0;
      while(r1 === 0){ r1 = R.int(-5, 4); }
      r2v = r1;
      while(r2v === 0 || r2v <= r1){ r2v = R.int(-4, 6); }
      function fact(r){ return r > 0 ? '(x − ' + r + ')' : '(x + ' + Math.abs(r) + ')'; }
      var sense = R.pick(['positif', 'négatif']);
      var cPos = 'x < ' + disp(r1) + ' ou x > ' + disp(r2v);
      var cNeg = disp(r1) + ' < x < ' + disp(r2v);
      if(sense === 'positif'){
        return { q: 'Le produit ' + fact(r1) + fact(r2v) + ' est strictement positif pour :',
          a: cPos, accept: null,
          choix: [cPos, cNeg, 'x > ' + disp(r1), 'x < ' + disp(r2v)],
          expl: 'Les facteurs s\'annulent en ' + disp(r1) + ' et ' + disp(r2v) + '. Le produit est positif quand les deux facteurs ont le même signe : à l\'extérieur des racines.' };
      }
      return { q: 'Le produit ' + fact(r1) + fact(r2v) + ' est strictement négatif pour :',
        a: cNeg, accept: null,
        choix: [cNeg, cPos, 'x < ' + disp(r1), 'x > ' + disp(r2v)],
        expl: 'Le produit est négatif quand les facteurs sont de signes contraires : entre les racines ' + disp(r1) + ' et ' + disp(r2v) + '.' };
    }
  });

  /* ============================================================
     4. p3-04-fonctions — Le vocabulaire des fonctions
     ============================================================ */
  SKILLS.push({
    id: 'p3-04-fonctions',
    phase: 3,
    ordre: 4,
    titre: 'Le vocabulaire des fonctions',
    objectif: "Comprendre image, antécédent et la notation f(x), et lire un tableau de valeurs sans hésiter.",
    lecon: `<p class="lede">Une fonction, c'est une <mark>machine à transformer les nombres</mark> : tu mets un nombre en entrée, elle applique toujours le même calcul, et elle sort un résultat. La notation f(x) dit simplement : « ce que la machine f renvoie quand on lui donne x ».</p>
<p>Prenons f(x) = 2x + 3 (« double le nombre puis ajoute 3 ») et calculons f(5) :</p>
<div class="etapes">
<p><b>Étape 1</b> — f(5) signifie : je remplace x par 5 partout dans la formule.</p>
<p><b>Étape 2</b> — f(5) = 2 × 5 + 3 = 10 + 3 = 13.</p>
<p><b>Étape 3</b> — Conclusion en français : <mark>l'image de 5 par f est 13</mark>. Et dans l'autre sens : <mark>5 est un antécédent de 13</mark>.</p>
</div>
<p>Retiens le sens du vocabulaire : l'<b>image</b>, c'est le résultat qui SORT de la machine. L'<b>antécédent</b>, c'est le nombre qu'on a mis en ENTRÉE (« antécédent » = qui vient avant). L'égalité f(5) = 13 contient les deux informations à la fois.</p>
<p>On lit souvent une fonction dans un <b>tableau de valeurs</b> :</p>
<table class="tbl"><tr><td><b>x</b></td><td>1</td><td>2</td><td>3</td><td>4</td></tr>
<tr><td><b>f(x)</b></td><td>5</td><td>8</td><td>11</td><td>14</td></tr></table>
<p>Lecture : l'image de 3 est le nombre juste en dessous, 11. Un antécédent de 8 est le nombre juste au-dessus, 2. <mark>Image : on lit de haut en bas. Antécédent : de bas en haut.</mark></p>
<div class="box retenir"><p class="box-t">À retenir</p><p>f(a) = b se traduit par deux phrases : « l'image de a par f est b » et « a est un antécédent de b par f ». Le nombre entre parenthèses est toujours l'entrée.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Un nombre n'a qu'<mark>une seule image</mark>, mais il peut avoir <mark>plusieurs antécédents</mark> (ou aucun). Exemple : avec f(x) = x², le nombre 9 a deux antécédents, 3 et −3.</p></div>`,
    gen(level, R){
      if(level === 1){
        var type = R.pick(['image', 'vocab', 'antec']);
        if(type === 'image'){
          var aC = R.int(2, 5), b = R.int(1, 9), x0 = R.int(2, 9);
          var v = aC * x0 + b;
          return { q: 'f(x) = ' + aC + 'x + ' + b + '. Calcule f(' + x0 + '), l\'image de ' + x0 + ' par f.',
            a: String(v), accept: null, choix: null,
            expl: 'On remplace x par ' + x0 + ' : f(' + x0 + ') = ' + aC + '×' + x0 + ' + ' + b + ' = ' + (aC*x0) + ' + ' + b + ' = ' + v + '.' };
        }
        if(type === 'vocab'){
          var n = R.int(2, 9), y = R.int(10, 40);
          var correct = 'L\'image de ' + n + ' par f est ' + y + '.';
          return { q: 'On sait que f(' + n + ') = ' + y + '. Quelle phrase est correcte ?',
            a: correct, accept: null,
            choix: [correct, 'L\'image de ' + y + ' par f est ' + n + '.', 'f(' + y + ') = ' + n, n + ' est l\'image de ' + y + ' par f.'],
            expl: 'Le nombre entre parenthèses est l\'entrée : ' + n + ' entre dans la machine, ' + y + ' en sort. Donc l\'image de ' + n + ' est ' + y + ', et ' + n + ' est un antécédent de ' + y + '.' };
        }
        var n2 = R.int(2, 9), y2 = R.int(10, 40);
        return { q: 'On sait que f(' + n2 + ') = ' + y2 + '. Donne un antécédent de ' + y2 + ' par f.',
          a: String(n2), accept: null, choix: null,
          expl: 'L\'antécédent est le nombre d\'entrée, celui entre parenthèses : ' + n2 + '.' };
      }
      if(level === 2){
        var type2 = R.pick(['carre', 'tabimage', 'tabantec']);
        if(type2 === 'carre'){
          var c = R.int(1, 6);
          var x2 = R.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
          var v2 = x2 * x2 + c;
          return { q: 'f(x) = x² + ' + c + '. Calcule f(' + disp(x2) + ').',
            a: String(v2), accept: null, choix: null,
            expl: 'f(' + disp(x2) + ') = (' + disp(x2) + ')² + ' + c + ' = ' + (x2*x2) + ' + ' + c + ' = ' + v2 + '. Le carré d\'un nombre négatif est positif !' };
        }
        var m = R.int(2, 4), b2 = R.int(1, 6);
        var xs = [1, 2, 3, 4, 5];
        var ys = xs.map(function(x){ return m * x + b2; });
        var tab = 'x    : ' + xs.join(' | ') + '\nf(x) : ' + ys.join(' | ');
        var idx = R.int(1, 3);
        if(type2 === 'tabimage'){
          return { q: 'Voici un tableau de valeurs de f :\n' + tab + '\nQuelle est l\'image de ' + xs[idx] + ' par f ?',
            a: String(ys[idx]), accept: null, choix: null,
            expl: 'On repère ' + xs[idx] + ' sur la ligne des x, et on lit juste en dessous : f(' + xs[idx] + ') = ' + ys[idx] + '.' };
        }
        return { q: 'Voici un tableau de valeurs de f :\n' + tab + '\nQuel est l\'antécédent de ' + ys[idx] + ' par f ?',
          a: String(xs[idx]), accept: null, choix: null,
          expl: 'On repère ' + ys[idx] + ' sur la ligne des f(x), et on lit juste au-dessus : l\'antécédent est ' + xs[idx] + '.' };
      }
      // level 3
      var type3 = R.pick(['poly', 'antecalc', 'vocabneg']);
      if(type3 === 'poly'){
        var a3 = R.int(1, 3), b3 = R.int(1, 5), c3 = R.int(0, 6);
        var x3 = R.int(-4, -1);
        var v3 = a3 * x3 * x3 + b3 * x3 + c3;
        var r3 = ansInt(v3);
        return { q: 'f(x) = ' + poly(a3, b3, c3) + '. Calcule f(' + disp(x3) + ').',
          a: r3.a, accept: r3.accept, choix: null,
          expl: 'f(' + disp(x3) + ') = ' + a3 + '×(' + disp(x3) + ')² + ' + b3 + '×(' + disp(x3) + ') + ' + c3 + ' = ' + (a3*x3*x3) + ' − ' + Math.abs(b3*x3) + ' + ' + c3 + ' = ' + disp(v3) + '. Attention : (' + disp(x3) + ')² = ' + (x3*x3) + ' est positif.' };
      }
      if(type3 === 'antecalc'){
        var m4 = R.int(2, 5), b4 = R.int(-6, 6);
        var x4 = 0;
        while(x4 === 0){ x4 = R.int(-5, 9); }
        var y4 = m4 * x4 + b4;
        var r4 = ansInt(x4);
        return { q: 'f(x) = ' + aff(m4, b4) + '. Quel nombre a pour image ' + disp(y4) + ' par f ?\n(cherche x tel que f(x) = ' + disp(y4) + ')',
          a: r4.a, accept: r4.accept, choix: null,
          expl: 'On résout ' + aff(m4, b4) + ' = ' + disp(y4) + ' : ' + m4 + 'x = ' + disp(y4 - b4) + ', donc x = ' + disp(x4) + '.' };
      }
      var n5 = -R.int(2, 6), y5 = R.int(3, 15);
      var c5 = 'L\'image de ' + disp(n5) + ' par f est ' + y5 + '.';
      return { q: 'Que signifie l\'égalité f(' + disp(n5) + ') = ' + y5 + ' ?',
        a: c5, accept: null,
        choix: [c5, 'L\'image de ' + y5 + ' par f est ' + disp(n5) + '.', 'f(' + y5 + ') = ' + disp(n5), disp(n5) + ' est l\'image de ' + y5 + ' par f.'],
        expl: 'Le nombre entre parenthèses, ' + disp(n5) + ', est l\'entrée. Sa sortie (son image) est ' + y5 + '. Et ' + disp(n5) + ' est un antécédent de ' + y5 + '.' };
    }
  });

  /* ============================================================
     5. p3-05-droites — Les fonctions affines et droites
     ============================================================ */
  SKILLS.push({
    id: 'p3-05-droites',
    phase: 3,
    ordre: 5,
    titre: 'Les fonctions affines et droites',
    objectif: "Maîtriser y = mx + p : calculer m et p, une image, et lire le sens de variation.",
    lecon: `<p class="lede">Une fonction affine, c'est f(x) = mx + p. Sa représentation graphique est toujours une <mark>droite</mark>. Deux nombres suffisent à tout décrire : m et p. Comprends-les et tu sais tout.</p>
<p><b>p, l'ordonnée à l'origine</b> : c'est la valeur au départ, quand x = 0. La droite coupe l'axe vertical à la hauteur p.</p>
<p><b>m, le coefficient directeur</b> (la « pente ») : quand x augmente de 1, y augmente de m. Si m est négatif, y descend.</p>
<p>Trouvons l'équation de la droite passant par A(1 ; 5) et B(3 ; 11) :</p>
<div class="etapes">
<p><b>Étape 1</b> — Le coefficient directeur se calcule avec : <mark>m = (y<sub>B</sub> − y<sub>A</sub>) ÷ (x<sub>B</sub> − x<sub>A</sub>)</mark>.</p>
<p><b>Étape 2</b> — m = (11 − 5) ÷ (3 − 1) = 6 ÷ 2 = 3. Quand x avance de 1, y monte de 3.</p>
<p><b>Étape 3</b> — Pour p, j'utilise un point connu : en A, y = mx + p donne 5 = 3 × 1 + p, donc p = 2.</p>
<p><b>Étape 4</b> — Équation : y = 3x + 2. Vérification avec B : 3 × 3 + 2 = 11. ✓</p>
</div>
<p><b>Sens de variation</b> : tout se lit sur le signe de m. <mark>m &gt; 0 : f est croissante</mark> (la droite monte). <mark>m &lt; 0 : f est décroissante</mark> (elle descend). m = 0 : f est constante (droite horizontale).</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>y = mx + p : m = (différence des y) ÷ (différence des x), et p = valeur quand x = 0. Le signe de m donne le sens de variation.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour lire p sur un graphique : regarde où la droite coupe l'axe vertical. Pour lire m : avance de 1 vers la droite et compte de combien tu montes (ou descends).</p></div>
<div class="box piege"><p class="box-t">Piège classique</p><p>Dans f(x) = 4 − 2x, le coefficient directeur n'est pas 4 ! Réécris dans l'ordre : f(x) = −2x + 4. Donc m = −2 (fonction décroissante) et p = 4.</p></div>`,
    gen(level, R){
      if(level === 1){
        var type = R.pick(['image', 'sens']);
        if(type === 'image'){
          var m = R.pick([-3, -2, -1, 1, 2, 3]);
          var p = R.int(-5, 5);
          var x0 = R.int(1, 6);
          var v = m * x0 + p;
          var r = ansInt(v);
          return { q: 'f(x) = ' + aff(m, p) + '. Calcule f(' + x0 + ').',
            a: r.a, accept: r.accept, choix: null,
            expl: 'f(' + x0 + ') = ' + disp(m) + '×' + x0 + ' ' + (p >= 0 ? '+ ' + p : '− ' + Math.abs(p)) + ' = ' + disp(m*x0) + ' ' + (p >= 0 ? '+ ' + p : '− ' + Math.abs(p)) + ' = ' + disp(v) + '.' };
        }
        var m2 = R.pick([-3, -2, -1, 1, 2, 3, 0]);
        var p2 = R.int(1, 6);
        var formule = (m2 === 0) ? String(p2) : aff(m2, p2);
        var correct = (m2 > 0) ? 'croissante' : (m2 < 0 ? 'décroissante' : 'constante');
        return { q: 'La fonction f(x) = ' + formule + ' est :',
          a: correct, accept: null,
          choix: ['croissante', 'décroissante', 'constante', 'd\'abord croissante, puis décroissante'],
          expl: (m2 === 0) ? 'Il n\'y a pas de x : f vaut toujours ' + p2 + ', elle est constante.' :
            'Le coefficient directeur est m = ' + disp(m2) + '. m ' + (m2 > 0 ? '> 0 : f est croissante (la droite monte).' : '< 0 : f est décroissante (la droite descend).') };
      }
      if(level === 2){
        var type2 = R.pick(['pente', 'ordonnee', 'eqqcm']);
        if(type2 === 'pente'){
          var m3 = R.pick([-3, -2, -1, 1, 2, 3]);
          var p3 = R.int(-5, 5);
          var x1 = R.int(-2, 2), x2 = x1 + R.int(1, 4);
          var y1 = m3 * x1 + p3, y2 = m3 * x2 + p3;
          var r3 = ansInt(m3);
          return { q: 'Une droite passe par A(' + disp(x1) + ' ; ' + disp(y1) + ') et B(' + disp(x2) + ' ; ' + disp(y2) + ').\nCalcule son coefficient directeur m.',
            a: r3.a, accept: r3.accept, choix: null,
            expl: 'm = (yB − yA) ÷ (xB − xA) = ' + disp(y2 - y1) + ' ÷ ' + disp(x2 - x1) + ' = ' + disp(m3) + '.' };
        }
        if(type2 === 'ordonnee'){
          var m4 = R.pick([-3, -2, 2, 3]);
          var p4 = R.int(-5, 5);
          var x4 = R.int(1, 5);
          var y4 = m4 * x4 + p4;
          var r4 = ansInt(p4);
          return { q: 'Une droite a pour coefficient directeur m = ' + disp(m4) + ' et passe par le point (' + x4 + ' ; ' + disp(y4) + ').\nCalcule son ordonnée à l\'origine p.',
            a: r4.a, accept: r4.accept, choix: null,
            expl: 'y = mx + p donne ' + disp(y4) + ' = ' + disp(m4) + '×' + x4 + ' + p, donc p = ' + disp(y4) + ' − (' + disp(m4*x4) + ') = ' + disp(p4) + '.' };
        }
        var m5, p5;
        do {
          m5 = R.pick([-3, -2, -1, 1, 2, 3]);
          p5 = 0;
          while(p5 === 0){ p5 = R.int(-5, 5); }
        } while(m5 === p5);
        var c5 = 'y = ' + aff(m5, p5);
        return { q: 'Une droite passe par (0 ; ' + disp(p5) + ') et a pour coefficient directeur ' + disp(m5) + '. Son équation est :',
          a: c5, accept: null,
          choix: [c5, 'y = ' + aff(p5, m5), 'y = ' + aff(-m5, p5), 'y = ' + aff(m5, -p5)],
          expl: 'Le coefficient directeur ' + disp(m5) + ' multiplie x, et p = ' + disp(p5) + ' est la valeur en x = 0 : y = ' + aff(m5, p5) + '.' };
      }
      // level 3
      var type3 = R.pick(['eq2pts', 'sensdeguise', 'imageneg']);
      if(type3 === 'eq2pts'){
        var m6, p6;
        do {
          m6 = R.pick([-3, -2, -1, 1, 2, 3]);
          p6 = 0;
          while(p6 === 0){ p6 = R.int(-5, 5); }
        } while(m6 === p6);
        var xa = R.int(-2, 1), xb = xa + R.int(2, 4);
        var ya = m6 * xa + p6, yb = m6 * xb + p6;
        var c6 = 'y = ' + aff(m6, p6);
        return { q: 'Une droite passe par A(' + disp(xa) + ' ; ' + disp(ya) + ') et B(' + disp(xb) + ' ; ' + disp(yb) + '). Son équation est :',
          a: c6, accept: null,
          choix: [c6, 'y = ' + aff(p6, m6), 'y = ' + aff(-m6, p6), 'y = ' + aff(m6, -p6)],
          expl: 'm = ' + disp(yb - ya) + ' ÷ ' + disp(xb - xa) + ' = ' + disp(m6) + ', puis avec A : ' + disp(ya) + ' = ' + disp(m6) + '×' + disp(xa) + ' + p, donc p = ' + disp(p6) + '.' };
      }
      if(type3 === 'sensdeguise'){
        var m7 = R.int(1, 4), p7 = R.int(2, 9);
        var mtxt = (m7 === 1) ? 'x' : m7 + 'x';
        return { q: 'La fonction f(x) = ' + p7 + ' − ' + mtxt + ' est :',
          a: 'décroissante', accept: null,
          choix: ['décroissante', 'croissante', 'constante', 'd\'abord croissante, puis décroissante'],
          expl: 'Réécris dans l\'ordre : f(x) = −' + m7 + 'x + ' + p7 + '. Le coefficient directeur est −' + m7 + ' < 0 : f est décroissante. Le ' + p7 + ' devant ne doit pas te tromper !' };
      }
      var m8 = R.pick([-4, -3, -2, 2, 3, 4]);
      var p8 = R.int(-6, 6);
      var x8 = R.int(-5, -1);
      var v8 = m8 * x8 + p8;
      var r8 = ansInt(v8);
      return { q: 'f(x) = ' + aff(m8, p8) + '. Calcule f(' + disp(x8) + ').',
        a: r8.a, accept: r8.accept, choix: null,
        expl: 'f(' + disp(x8) + ') = ' + disp(m8) + '×(' + disp(x8) + ') ' + (p8 >= 0 ? '+ ' + p8 : '− ' + Math.abs(p8)) + ' = ' + disp(m8*x8) + ' ' + (p8 >= 0 ? '+ ' + p8 : '− ' + Math.abs(p8)) + ' = ' + disp(v8) + '. Attention aux signes !' };
    }
  });

  /* ============================================================
     6. p3-06-evolutions — Les évolutions en pourcentage
     ============================================================ */
  SKILLS.push({
    id: 'p3-06-evolutions',
    phase: 3,
    ordre: 6,
    titre: 'Les évolutions en pourcentage',
    objectif: "Passer d'un pourcentage d'évolution au coefficient multiplicateur, enchaîner des évolutions et trouver l'évolution réciproque.",
    lecon: `<p class="lede">LE chapitre à maîtriser pour SESAME et ACCÈS : il tombe à chaque session. L'idée centrale tient en une phrase : <mark>toute évolution en pourcentage est une multiplication</mark>.</p>
<div class="formule">
<p>Hausse de t % → on multiplie par 1 + t/100</p>
<p>Baisse de t % → on multiplie par 1 − t/100</p>
</div>
<p>Ce nombre s'appelle le <b>coefficient multiplicateur</b> (CM). Exemples : +20 % → ×1,20 ; −20 % → ×0,80 ; +5 % → ×1,05. Appliquons : un article à 150 € augmente de 20 % :</p>
<div class="etapes">
<p><b>Étape 1</b> — CM = 1 + 20/100 = 1,20.</p>
<p><b>Étape 2</b> — Nouveau prix = 150 × 1,20 = <mark>180 €</mark>. Une seule multiplication, aucun risque d'erreur.</p>
</div>
<p><b>Évolutions successives</b> : on <mark>multiplie les coefficients</mark>, on n'additionne JAMAIS les pourcentages. Une hausse de 10 % suivie d'une hausse de 20 % : 1,10 × 1,20 = 1,32, soit +32 % (et non +30 %).</p>
<p><b>Évolution réciproque</b> : pour revenir au prix de départ après une évolution, on cherche le CM inverse. Après +25 % (×1,25), il faut multiplier par 1 ÷ 1,25 = 0,8, c'est-à-dire une <mark>baisse de 20 %</mark> — et non de 25 % !</p>
<div class="box piege"><p class="box-t">Piège classique</p><p>+10 % puis −10 % ne ramène PAS au point de départ : 1,10 × 0,90 = 0,99, soit −1 % au total. La baisse de 10 % s'applique à un prix plus élevé, elle « pèse » donc plus lourd.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Évolution → coefficient : +t % → ×(1 + t/100), −t % → ×(1 − t/100). Successives → on <mark>multiplie les CM</mark>. Réciproque → on <mark>divise par le CM</mark>. Retrouver le prix initial → division par le CM.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour relire un CM : compare-le à 1. CM = 1,32 → +32 %. CM = 0,72 → −28 %. La partie après le 1 (en plus ou en moins) EST le pourcentage.</p></div>`,
    gen(level, R){
      if(level === 1){
        var type = R.pick(['cm', 'prix']);
        if(type === 'cm'){
          var t = R.pick([5, 10, 15, 20, 25, 30, 40, 50]);
          var sens = R.pick(['hausse', 'baisse']);
          var tt = (sens === 'hausse') ? t : -t;
          var r = cmAns(tt);
          return { q: 'Quel est le coefficient multiplicateur associé à une ' + sens + ' de ' + t + ' % ?',
            a: r.a, accept: r.accept, choix: null,
            expl: (sens === 'hausse' ? 'Hausse de ' + t + ' % : CM = 1 + ' + t + '/100 = ' + frNum((100+t)/100) + '.' :
              'Baisse de ' + t + ' % : CM = 1 − ' + t + '/100 = ' + frNum((100-t)/100) + '.') };
        }
        var P = 20 * R.int(2, 10);
        var t2 = R.pick([5, 10, 15, 20, 25, 30, 50]);
        var sens2 = R.pick(['augmente', 'baisse']);
        var tt2 = (sens2 === 'augmente') ? t2 : -t2;
        var nouveau = P * (100 + tt2) / 100;
        return { q: 'Un article coûte ' + P + ' €. Son prix ' + sens2 + ' de ' + t2 + ' %. Quel est le nouveau prix (en €) ?',
          a: String(nouveau), accept: null, choix: null,
          expl: 'CM = ' + frNum((100+tt2)/100) + ' ; nouveau prix = ' + P + ' × ' + frNum((100+tt2)/100) + ' = ' + nouveau + ' €.' };
      }
      if(level === 2){
        var type2 = R.pick(['taux', 'successives']);
        if(type2 === 'taux'){
          var e = R.pick([
            ['1,15', 'hausse', 15], ['1,3', 'hausse', 30], ['1,05', 'hausse', 5],
            ['1,5', 'hausse', 50], ['2', 'hausse', 100], ['1,08', 'hausse', 8],
            ['0,85', 'baisse', 15], ['0,7', 'baisse', 30], ['0,92', 'baisse', 8],
            ['0,75', 'baisse', 25], ['0,5', 'baisse', 50]
          ]);
          return { q: 'Un prix est multiplié par ' + e[0] + '. De quel pourcentage a-t-il ' + (e[1] === 'hausse' ? 'augmenté' : 'baissé') + ' ? (réponds juste le nombre)',
            a: String(e[2]), accept: [e[2] + '%'], choix: null,
            expl: 'On compare le CM à 1 : ' + e[0] + ' correspond à une ' + e[1] + ' de ' + e[2] + ' %.' };
        }
        var pair = R.pick([
          [10, 20, '+32 %', '+30 %', '−32 %', '+2 %'],
          [20, 50, '+80 %', '+70 %', '−80 %', '+10 %'],
          [-10, -20, '−28 %', '−30 %', '+28 %', '−32 %'],
          [50, -20, '+20 %', '+30 %', '−20 %', '+25 %'],
          [20, -25, '−10 %', '−5 %', '+10 %', '0 %'],
          [10, -20, '−12 %', '−10 %', '+12 %', '−30 %'],
          [30, -50, '−35 %', '−20 %', '+35 %', '−15 %'],
          [20, 30, '+56 %', '+50 %', '−56 %', '+6 %'],
          [10, 50, '+65 %', '+60 %', '−65 %', '+5 %'],
          [-20, -30, '−44 %', '−50 %', '+44 %', '−56 %']
        ]);
        var t1 = pair[0], t2b = pair[1];
        function evoTxt(t){ return t > 0 ? 'augmente de ' + t + ' %' : 'baisse de ' + (-t) + ' %'; }
        var cm1 = (100 + t1) / 100, cm2 = (100 + t2b) / 100;
        var cmG = (100 + t1) * (100 + t2b) / 10000;
        return { q: 'Un prix ' + evoTxt(t1) + ', puis ' + evoTxt(t2b) + '. Quelle est l\'évolution globale ?',
          a: pair[2], accept: null,
          choix: [pair[2], pair[3], pair[4], pair[5]],
          expl: 'On multiplie les coefficients : ' + frNum(cm1) + ' × ' + frNum(cm2) + ' = ' + frNum(cmG) + ', soit ' + pair[2] + '. On n\'additionne jamais les pourcentages !' };
      }
      // level 3
      var type3 = R.pick(['reciproque', 'initial', 'piege', 'succprix']);
      if(type3 === 'reciproque'){
        var e3 = R.pick([
          [25, 'hausse', '−20 %', '−25 %', '+20 %', '−12,5 %', '1 ÷ 1,25 = 0,8 : baisse de 20 %. La réciproque n\'est jamais l\'opposé du taux !'],
          [100, 'hausse', '−50 %', '−100 %', '+50 %', '−25 %', '1 ÷ 2 = 0,5 : baisse de 50 %.'],
          [20, 'baisse', '+25 %', '+20 %', '−25 %', '+12,5 %', '1 ÷ 0,8 = 1,25 : hausse de 25 %.'],
          [50, 'baisse', '+100 %', '+50 %', '−100 %', '+200 %', '1 ÷ 0,5 = 2 : hausse de 100 %.']
        ]);
        return { q: 'Un prix subit une ' + e3[1] + ' de ' + e3[0] + ' %. Quelle évolution le ramène exactement à sa valeur initiale ?',
          a: e3[2], accept: null,
          choix: [e3[2], e3[3], e3[4], e3[5]],
          expl: e3[6] };
      }
      if(type3 === 'initial'){
        var P0 = 20 * R.int(3, 10);
        var t4 = R.pick([10, 20, 25, 50, -10, -20, -50]);
        var fin = P0 * (100 + t4) / 100;
        return { q: 'Après une ' + (t4 > 0 ? 'hausse' : 'baisse') + ' de ' + Math.abs(t4) + ' %, un article coûte ' + fin + ' €. Quel était son prix initial (en €) ?',
          a: String(P0), accept: null, choix: null,
          expl: 'Pour remonter au prix initial, on DIVISE par le CM : ' + fin + ' ÷ ' + frNum((100+t4)/100) + ' = ' + P0 + ' €.' };
      }
      if(type3 === 'piege'){
        var e4 = R.pick([
          [10, '−1 %', ['0 %', '+1 %', '−10 %'], '1,1 × 0,9 = 0,99 : le prix a baissé de 1 %. Les deux évolutions ne se compensent pas !'],
          [20, '−4 %', ['0 %', '+4 %', '−20 %'], '1,2 × 0,8 = 0,96 : baisse globale de 4 %.'],
          [50, '−25 %', ['0 %', '+25 %', '−50 %'], '1,5 × 0,5 = 0,75 : baisse globale de 25 %.']
        ]);
        return { q: 'Un prix augmente de ' + e4[0] + ' %, puis baisse de ' + e4[0] + ' %. Quelle est l\'évolution globale ?',
          a: e4[1], accept: null,
          choix: [e4[1], e4[2][0], e4[2][1], e4[2][2]],
          expl: e4[3] };
      }
      var P5 = 100 * R.int(1, 5);
      var t5a = R.pick([-50, -30, -20, -10, 10, 20, 30, 50]);
      var t5b = R.pick([-50, -30, -20, -10, 10, 20, 30, 50]);
      var v1 = P5 * (100 + t5a) / 100;
      var v2 = v1 * (100 + t5b) / 100;
      function evoT(t){ return t > 0 ? 'augmente de ' + t + ' %' : 'baisse de ' + (-t) + ' %'; }
      return { q: 'Un abonnement coûte ' + P5 + ' €. Son prix ' + evoT(t5a) + ', puis ' + evoT(t5b) + '. Quel est le prix final (en €) ?',
        a: String(v2), accept: null, choix: null,
        expl: P5 + ' × ' + frNum((100+t5a)/100) + ' = ' + v1 + ', puis ' + v1 + ' × ' + frNum((100+t5b)/100) + ' = ' + v2 + ' €.' };
    }
  });

  /* ============================================================
     7. p3-07-probabilites — Les probabilités
     ============================================================ */
  SKILLS.push({
    id: 'p3-07-probabilites',
    phase: 3,
    ordre: 7,
    titre: 'Les probabilités',
    objectif: "Calculer P(A) en situation d'équiprobabilité, utiliser l'événement contraire et la formule de l'union.",
    lecon: `<p class="lede">Une probabilité mesure la chance qu'un événement se produise : c'est un nombre <mark>entre 0 (impossible) et 1 (certain)</mark>. Bonne nouvelle : quand tous les résultats ont la même chance (dé équilibré, carte tirée au hasard…), le calcul est un simple comptage.</p>
<div class="formule"><p>Équiprobabilité : P(A) = (nombre de cas favorables) ÷ (nombre de cas possibles)</p></div>
<p>Exemple : on lance un dé équilibré à 6 faces. Quelle est la probabilité d'obtenir un nombre pair ?</p>
<div class="etapes">
<p><b>Étape 1</b> — Cas possibles : 1, 2, 3, 4, 5, 6 → il y en a 6.</p>
<p><b>Étape 2</b> — Cas favorables : 2, 4, 6 → il y en a 3.</p>
<p><b>Étape 3</b> — P(pair) = 3/6 = <mark>1/2</mark>. On simplifie toujours la fraction.</p>
</div>
<p><b>L'événement contraire</b> de A (noté A barre) est « A ne se produit pas ». Comme l'un des deux arrive forcément : <mark>P(contraire de A) = 1 − P(A)</mark>. Si P(pluie) = 0,3, alors P(pas de pluie) = 0,7. C'est souvent le raccourci le plus rapide.</p>
<p><b>Union et intersection</b> : A ∪ B signifie « A OU B (au moins l'un des deux) », A ∩ B signifie « A ET B (les deux à la fois) ». La formule à connaître :</p>
<div class="formule"><p>P(A ∪ B) = P(A) + P(B) − P(A ∩ B)</p></div>
<p>On soustrait P(A ∩ B) car les cas communs seraient comptés deux fois. Exemple avec un jeu de 32 cartes : P(roi ou cœur) = 4/32 + 8/32 − 1/32 = 11/32 (le roi de cœur est dans les deux camps).</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>P(A) = favorables ÷ possibles (fraction simplifiée). P(contraire) = 1 − P(A). P(A ∪ B) = P(A) + P(B) − P(A ∩ B).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie toujours que ton résultat est entre 0 et 1. Une « probabilité » de 1,4 ou de −0,2 signifie qu'il y a une erreur de calcul quelque part.</p></div>`,
    gen(level, R){
      if(level === 1){
        var type = R.pick(['de', 'urne']);
        if(type === 'de'){
          var ev = R.pick([
            ['un nombre pair', 3], ['un nombre impair', 3], ['un 6', 1],
            ['un nombre supérieur ou égal à 5', 2], ['un multiple de 3', 2],
            ['un nombre inférieur ou égal à 4', 4], ['un 1 ou un 2', 2]
          ]);
          var f = frac(ev[1], 6);
          return { q: 'On lance un dé équilibré à 6 faces. Quelle est la probabilité d\'obtenir ' + ev[0] + ' ?',
            a: f.a, accept: f.accept, choix: null,
            expl: 'Il y a ' + ev[1] + ' cas favorable(s) sur 6 cas possibles : P = ' + ev[1] + '/6 = ' + f.a + '.' };
        }
        var r = R.int(2, 6), b = R.int(2, 6);
        var f2 = frac(r, r + b);
        return { q: 'Une urne contient ' + r + ' boules rouges et ' + b + ' boules bleues, indiscernables au toucher. On tire une boule au hasard.\nQuelle est la probabilité de tirer une boule rouge ?',
          a: f2.a, accept: f2.accept, choix: null,
          expl: r + ' boules rouges sur ' + (r + b) + ' boules en tout : P = ' + r + '/' + (r + b) + (f2.a !== r + '/' + (r + b) ? ' = ' + f2.a : '') + '.' };
      }
      if(level === 2){
        var type2 = R.pick(['cartes', 'contraire']);
        if(type2 === 'cartes'){
          var ev2 = R.pick([
            ['un roi', 4], ['un cœur', 8], ['une figure (roi, dame ou valet)', 12],
            ['une carte rouge', 16], ['l\'as de pique', 1], ['un as', 4]
          ]);
          var f3 = frac(ev2[1], 32);
          return { q: 'On tire une carte au hasard dans un jeu de 32 cartes. Quelle est la probabilité de tirer ' + ev2[0] + ' ?',
            a: f3.a, accept: f3.accept, choix: null,
            expl: ev2[1] + ' cas favorable(s) sur 32 : P = ' + ev2[1] + '/32 = ' + f3.a + '.' };
        }
        var p100 = 5 * R.int(1, 19);
        var comp = (100 - p100) / 100;
        return { q: 'La probabilité qu\'il pleuve demain est P(A) = ' + frNum(p100 / 100) + '. Quelle est la probabilité de l\'événement contraire (pas de pluie) ?',
          a: String(comp), accept: null, choix: null,
          expl: 'P(contraire de A) = 1 − P(A) = 1 − ' + frNum(p100 / 100) + ' = ' + frNum(comp) + '.' };
      }
      // level 3
      var type3 = R.pick(['union', 'inter', 'contrqcm']);
      if(type3 === 'union' || type3 === 'inter'){
        var pa, pb, pi, pu;
        do {
          pa = R.int(3, 6); pb = R.int(3, 6);
          pi = R.int(1, Math.min(pa, pb) - 1);
          pu = pa + pb - pi;
        } while(pu > 9);
        if(type3 === 'union'){
          return { q: 'P(A) = ' + frNum(pa / 10) + ' ; P(B) = ' + frNum(pb / 10) + ' ; P(A ∩ B) = ' + frNum(pi / 10) + '.\nCalcule P(A ∪ B).',
            a: String(pu / 10), accept: null, choix: null,
            expl: 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = ' + frNum(pa / 10) + ' + ' + frNum(pb / 10) + ' − ' + frNum(pi / 10) + ' = ' + frNum(pu / 10) + '.' };
        }
        return { q: 'P(A) = ' + frNum(pa / 10) + ' ; P(B) = ' + frNum(pb / 10) + ' ; P(A ∪ B) = ' + frNum(pu / 10) + '.\nCalcule P(A ∩ B).',
          a: String(pi / 10), accept: null, choix: null,
          expl: 'On retourne la formule : P(A ∩ B) = P(A) + P(B) − P(A ∪ B) = ' + frNum(pa / 10) + ' + ' + frNum(pb / 10) + ' − ' + frNum(pu / 10) + ' = ' + frNum(pi / 10) + '.' };
      }
      var it = R.pick([
        ['On lance un dé. A : « obtenir au moins 5 ».', 'obtenir au plus 4', ['obtenir au moins 4', 'obtenir au plus 5', 'obtenir exactement 4'],
          '« Au moins 5 » = {5 ; 6}. Son contraire est tout le reste : {1 ; 2 ; 3 ; 4}, c\'est-à-dire « au plus 4 ».'],
        ['On lance un dé. A : « obtenir un nombre pair ».', 'obtenir un nombre impair', ['obtenir un 6', 'obtenir un nombre inférieur à 3', 'obtenir 2, 4 ou 6'],
          'Le contraire de « pair » est « impair » : {1 ; 3 ; 5}. Attention, « obtenir 2, 4 ou 6 », c\'est A lui-même !'],
        ['Une urne contient des boules rouges, bleues et vertes. A : « tirer une boule rouge ».', 'tirer une boule bleue ou verte', ['tirer une boule bleue', 'tirer une boule verte', 'tirer une boule rouge ou bleue'],
          'Le contraire de « rouge » est « pas rouge », donc bleue OU verte : il faut couvrir tous les autres cas.']
      ]);
      return { q: it[0] + ' Quel est l\'événement contraire de A ?',
        a: it[1], accept: null,
        choix: [it[1], it[2][0], it[2][1], it[2][2]],
        expl: it[3] };
    }
  });

  /* ============================================================
     8. p3-08-quartiles — Médiane et quartiles
     ============================================================ */
  SKILLS.push({
    id: 'p3-08-quartiles',
    phase: 3,
    ordre: 8,
    titre: 'Médiane et quartiles',
    objectif: "Déterminer Q1, la médiane et Q3 d'une série ordonnée, et savoir interpréter ces valeurs.",
    lecon: `<p class="lede">La médiane et les quartiles servent à décrire une série de valeurs en la <mark>coupant en morceaux</mark> : la médiane la coupe en deux moitiés, les quartiles en quatre quarts. Première règle absolue : <mark>la série doit être rangée dans l'ordre croissant</mark>.</p>
<p><b>La médiane</b> partage la série en deux : la moitié des valeurs sont en dessous (ou égales), la moitié au-dessus (ou égales).</p>
<div class="etapes">
<p><b>Nombre impair de valeurs</b> — c'est la valeur du milieu. Pour 9 valeurs : la 5<sup>e</sup>.</p>
<p><b>Nombre pair de valeurs</b> — il n'y a pas de milieu : on prend la moyenne des deux valeurs centrales. Pour 12 valeurs : la moyenne de la 6<sup>e</sup> et de la 7<sup>e</sup>.</p>
</div>
<p><b>Les quartiles</b> : Q1 est la plus petite valeur de la série telle qu'<mark>au moins un quart (25 %)</mark> des valeurs lui soient inférieures ou égales. Q3 : pareil avec <mark>au moins trois quarts (75 %)</mark>. En pratique, pour n valeurs : on calcule n ÷ 4 (pour Q1) ou 3n ÷ 4 (pour Q3) et on <mark>arrondit au rang supérieur</mark> si ce n'est pas entier.</p>
<p>Exemple complet avec la série ordonnée : 4 ; 6 ; 7 ; 9 ; 10 ; 12 ; 13 ; 15 ; 18 (n = 9).</p>
<div class="etapes">
<p><b>Q1</b> — 9 ÷ 4 = 2,25 → rang 3 → Q1 = 7.</p>
<p><b>Médiane</b> — 9 valeurs, milieu au rang 5 → Me = 10.</p>
<p><b>Q3</b> — 3 × 9 ÷ 4 = 6,75 → rang 7 → Q3 = 13.</p>
</div>
<p>Interprétation : au moins 25 % des valeurs sont ≤ 7, environ la moitié sont ≤ 10, au moins 75 % sont ≤ 13.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Série ordonnée d'abord ! Q1 : rang n/4 arrondi au supérieur. Médiane : milieu (ou moyenne des deux du milieu). Q3 : rang 3n/4 arrondi au supérieur.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie la cohérence : on doit toujours avoir Q1 ≤ médiane ≤ Q3. Si ton Q3 est plus petit que ta médiane, tu t'es trompé de rang.</p></div>`,
    gen(level, R){
      function serie(n){
        var arr = [R.int(2, 6)];
        for(var i = 1; i < n; i++){ arr.push(arr[i - 1] + R.int(0, 2)); }
        return arr;
      }
      if(level === 1){
        var type = R.pick(['med', 'interp']);
        if(type === 'med'){
          var n = R.pick([5, 7]);
          var arr = serie(n);
          var med = arr[(n - 1) / 2];
          return { q: 'Voici le nombre de ventes réalisées chaque jour, dans l\'ordre croissant :\n' + arr.join(' ; ') + '\nQuelle est la médiane de cette série ?',
            a: String(med), accept: null, choix: null,
            expl: 'La série compte ' + n + ' valeurs (nombre impair) : la médiane est la valeur du milieu, au rang ' + ((n + 1) / 2) + ', soit ' + med + '.' };
        }
        var mv = R.int(8, 14);
        var correct = 'Au moins la moitié des notes sont inférieures ou égales à ' + mv + '.';
        return { q: 'La médiane des notes d\'une classe vaut ' + mv + '. Que peut-on affirmer ?',
          a: correct, accept: null,
          choix: [correct, 'La moyenne de la classe est ' + mv + '.', 'La note ' + mv + ' est la note la plus fréquente.', 'Toutes les notes sont proches de ' + mv + '.'],
          expl: 'La médiane coupe la série en deux moitiés : environ 50 % des notes sont en dessous (ou égales), 50 % au-dessus. Elle ne dit rien sur la moyenne.' };
      }
      if(level === 2){
        var arr2 = serie(9);
        var quoi = R.pick(['Q1', 'med', 'Q3']);
        if(quoi === 'Q1'){
          return { q: 'Série ordonnée de 9 valeurs :\n' + arr2.join(' ; ') + '\nDétermine le premier quartile Q1.',
            a: String(arr2[2]), accept: null, choix: null,
            expl: '9 ÷ 4 = 2,25 : on arrondit au rang supérieur, rang 3. Q1 est la 3e valeur : ' + arr2[2] + '.' };
        }
        if(quoi === 'med'){
          return { q: 'Série ordonnée de 9 valeurs :\n' + arr2.join(' ; ') + '\nDétermine la médiane.',
            a: String(arr2[4]), accept: null, choix: null,
            expl: '9 valeurs : la médiane est la 5e valeur (le milieu), soit ' + arr2[4] + '.' };
        }
        return { q: 'Série ordonnée de 9 valeurs :\n' + arr2.join(' ; ') + '\nDétermine le troisième quartile Q3.',
          a: String(arr2[6]), accept: null, choix: null,
          expl: '3 × 9 ÷ 4 = 6,75 : on arrondit au rang supérieur, rang 7. Q3 est la 7e valeur : ' + arr2[6] + '.' };
      }
      // level 3
      var type3 = R.pick(['n11', 'n12', 'interpq']);
      if(type3 === 'n11'){
        var arr3 = serie(11);
        var quoi3 = R.pick([['Q1', 2, '11 ÷ 4 = 2,75 → rang 3'], ['la médiane', 5, '11 valeurs : le milieu est au rang 6'], ['Q3', 8, '3 × 11 ÷ 4 = 8,25 → rang 9']]);
        return { q: 'Série ordonnée de 11 valeurs :\n' + arr3.join(' ; ') + '\nDétermine ' + quoi3[0] + '.',
          a: String(arr3[quoi3[1]]), accept: null, choix: null,
          expl: quoi3[2] + ' : la valeur cherchée est ' + arr3[quoi3[1]] + '.' };
      }
      if(type3 === 'n12'){
        var arr4 = serie(12);
        if((arr4[5] + arr4[6]) % 2 !== 0){
          for(var i = 6; i < 12; i++){ arr4[i] += 1; }
        }
        var quoi4 = R.pick(['Q1', 'med', 'Q3']);
        if(quoi4 === 'Q1'){
          return { q: 'Série ordonnée de 12 valeurs :\n' + arr4.join(' ; ') + '\nDétermine le premier quartile Q1.',
            a: String(arr4[2]), accept: null, choix: null,
            expl: '12 ÷ 4 = 3 : Q1 est la 3e valeur, soit ' + arr4[2] + '.' };
        }
        if(quoi4 === 'med'){
          var med4 = (arr4[5] + arr4[6]) / 2;
          return { q: 'Série ordonnée de 12 valeurs :\n' + arr4.join(' ; ') + '\nDétermine la médiane.',
            a: String(med4), accept: null, choix: null,
            expl: '12 valeurs (pair) : la médiane est la moyenne des 6e et 7e valeurs, (' + arr4[5] + ' + ' + arr4[6] + ') ÷ 2 = ' + med4 + '.' };
        }
        return { q: 'Série ordonnée de 12 valeurs :\n' + arr4.join(' ; ') + '\nDétermine le troisième quartile Q3.',
          a: String(arr4[8]), accept: null, choix: null,
          expl: '3 × 12 ÷ 4 = 9 : Q3 est la 9e valeur, soit ' + arr4[8] + '.' };
      }
      var qv = R.int(8, 14);
      var lequel = R.pick(['Q1', 'Q3']);
      if(lequel === 'Q1'){
        var cq1 = 'Au moins un quart des valeurs sont inférieures ou égales à ' + qv + '.';
        return { q: 'Pour une série de salaires, on lit Q1 = ' + qv + '. Que signifie ce résultat ?',
          a: cq1, accept: null,
          choix: [cq1, 'Exactement un quart des valeurs sont égales à ' + qv + '.', qv + ' est la plus petite valeur de la série.', 'La moyenne du quart inférieur vaut ' + qv + '.'],
          expl: 'Par définition, Q1 est la plus petite valeur telle qu\'au moins 25 % des valeurs de la série lui soient inférieures ou égales.' };
      }
      var cq3 = 'Au moins les trois quarts des valeurs sont inférieures ou égales à ' + qv + '.';
      return { q: 'Pour une série de notes, on lit Q3 = ' + qv + '. Que signifie ce résultat ?',
        a: cq3, accept: null,
        choix: [cq3, 'Un quart des valeurs sont égales à ' + qv + '.', qv + ' est la plus grande valeur de la série.', '75 % des valeurs sont égales à ' + qv + '.'],
        expl: 'Par définition, Q3 est la plus petite valeur telle qu\'au moins 75 % des valeurs lui soient inférieures ou égales.' };
    }
  });

  /* ============================================================
     9. p3-09-systemes — Les systèmes 2×2
     ============================================================ */
  SKILLS.push({
    id: 'p3-09-systemes',
    phase: 3,
    ordre: 9,
    titre: 'Les systèmes 2×2',
    objectif: "Résoudre un système de deux équations à deux inconnues, y compris issu d'un problème concret.",
    lecon: `<p class="lede">Deux inconnues ? Il faut <mark>deux équations</mark>. Un système 2×2, c'est deux conditions à satisfaire en même temps — exactement ce qui arrive quand on cherche le prix de deux articles à partir de deux tickets de caisse.</p>
<p>Exemple concret : 3 croissants et 2 baguettes coûtent 6,30 €. 1 croissant et 2 baguettes coûtent 4,10 €. Notons x le prix d'un croissant et y celui d'une baguette :</p>
<div class="formule"><p>3x + 2y = 6,30&nbsp;&nbsp;&nbsp;et&nbsp;&nbsp;&nbsp;x + 2y = 4,10</p></div>
<p><b>Méthode par combinaison</b> (soustraction) :</p>
<div class="etapes">
<p><b>Étape 1</b> — Les deux équations contiennent le même « 2y ». Je soustrais la 2<sup>e</sup> de la 1<sup>re</sup> : (3x + 2y) − (x + 2y) = 6,30 − 4,10.</p>
<p><b>Étape 2</b> — Les 2y disparaissent : 2x = 2,20, donc <mark>x = 1,10</mark>. Un croissant coûte 1,10 €.</p>
<p><b>Étape 3</b> — Je remplace dans une équation : 1,10 + 2y = 4,10, donc 2y = 3, et <mark>y = 1,50</mark>.</p>
<p><b>Étape 4</b> — Vérification dans la PREMIÈRE équation : 3 × 1,10 + 2 × 1,50 = 3,30 + 3 = 6,30. ✓</p>
</div>
<p><b>Méthode par substitution</b> : quand une équation donne directement une inconnue (par exemple y = 2x), on la <mark>remplace</mark> dans l'autre équation. Avec y = 2x et x + y = 12 : x + 2x = 12, donc 3x = 12, x = 4 et y = 8.</p>
<p>Si les coefficients ne se correspondent pas, on multiplie d'abord une équation entière (les deux côtés !) pour faire apparaître le même coefficient, puis on soustrait.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p><mark>Substitution</mark> : une équation exprime x ou y → on remplace. <mark>Combinaison</mark> : on égalise un coefficient puis on soustrait les équations pour éliminer une inconnue.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie toujours ta solution dans les <mark>DEUX</mark> équations de départ. Une solution qui ne marche que dans une seule équation est fausse.</p></div>`,
    gen(level, R){
      if(level === 1){
        var type = R.pick(['sumdiff', 'subst']);
        if(type === 'sumdiff'){
          var x0 = R.int(2, 9), y0 = x0;
          while(y0 === x0){ y0 = R.int(1, 9); }
          var s = x0 + y0, d = x0 - y0;
          var which = R.pick(['x', 'y']);
          var rep = (which === 'x') ? x0 : y0;
          return { q: 'Résous le système :\nx + y = ' + s + '\nx − y = ' + disp(d) + '\nDonne la valeur de ' + which + '.',
            a: String(rep), accept: null, choix: null,
            expl: 'En additionnant les deux équations, les y disparaissent : 2x = ' + (s + d) + ', donc x = ' + x0 + ', puis y = ' + s + ' − ' + x0 + ' = ' + y0 + '.' };
        }
        var k = R.int(2, 4), x1 = R.int(2, 8);
        var y1 = k * x1, s1 = x1 + y1;
        var which1 = R.pick(['x', 'y']);
        var rep1 = (which1 === 'x') ? x1 : y1;
        return { q: 'Résous le système :\ny = ' + k + 'x\nx + y = ' + s1 + '\nDonne la valeur de ' + which1 + '.',
          a: String(rep1), accept: null, choix: null,
          expl: 'On remplace y par ' + k + 'x dans la 2e équation : x + ' + k + 'x = ' + s1 + ', soit ' + (k + 1) + 'x = ' + s1 + ', donc x = ' + x1 + ' et y = ' + y1 + '.' };
      }
      function term(c, v){ return c === 1 ? v : c + v; }
      if(level === 2){
        var a1, b1, a2, b2;
        do {
          a1 = R.int(1, 4); b1 = R.int(1, 4);
          a2 = R.int(1, 4); b2 = R.int(1, 4);
        } while(a1 * b2 === a2 * b1);
        var x2 = R.int(1, 8), y2 = R.int(1, 8);
        var c1 = a1 * x2 + b1 * y2, c2 = a2 * x2 + b2 * y2;
        var which2 = R.pick(['x', 'y']);
        var rep2 = (which2 === 'x') ? x2 : y2;
        return { q: 'Résous le système :\n' + term(a1, 'x') + ' + ' + term(b1, 'y') + ' = ' + c1 + '\n' + term(a2, 'x') + ' + ' + term(b2, 'y') + ' = ' + c2 + '\nDonne la valeur de ' + which2 + '.',
          a: String(rep2), accept: null, choix: null,
          expl: 'La solution est x = ' + x2 + ' et y = ' + y2 + '. Vérification (1re équation) : ' + a1 + '×' + x2 + ' + ' + b1 + '×' + y2 + ' = ' + c1 + '. ✓' };
      }
      // level 3
      var type3 = R.pick(['concret', 'abstrait']);
      if(type3 === 'concret'){
        var item = R.pick([
          { s1: 'croissant', pl1: 'croissants', d1: 'd\'un croissant', s2: 'baguette', pl2: 'baguettes', d2: 'd\'une baguette',
            p1: function(){ return 10 * R.int(8, 15); }, p2: function(){ return 10 * R.int(9, 15); } },
          { s1: 'stylo', pl1: 'stylos', d1: 'd\'un stylo', s2: 'cahier', pl2: 'cahiers', d2: 'd\'un cahier',
            p1: function(){ return 10 * R.int(12, 30); }, p2: function(){ return 10 * R.int(15, 35); } },
          { s1: 'place enfant', pl1: 'places enfant', d1: 'd\'une place enfant', s2: 'place adulte', pl2: 'places adulte', d2: 'd\'une place adulte',
            p1: function(){ return 100 * R.int(4, 7); }, p2: function(){ return 100 * R.int(8, 12); } }
        ]);
        var p1 = item.p1(), p2 = item.p2();
        var q11, q12, q21, q22;
        do {
          q11 = R.int(1, 4); q12 = R.int(1, 3);
          q21 = R.int(1, 3); q22 = R.int(1, 4);
        } while(q11 * q22 === q12 * q21);
        var t1 = q11 * p1 + q12 * p2;
        var t2 = q21 * p1 + q22 * p2;
        var whichI = R.pick([1, 2]);
        var rep3 = ansEur(whichI === 1 ? p1 : p2);
        function nb(n, sg, pl){ return n + ' ' + (n > 1 ? pl : sg); }
        return { q: nb(q11, item.s1, item.pl1) + ' et ' + nb(q12, item.s2, item.pl2) + ' coûtent ' + eurFr(t1) + ' €.\n' +
            nb(q21, item.s1, item.pl1) + ' et ' + nb(q22, item.s2, item.pl2) + ' coûtent ' + eurFr(t2) + ' €.\n' +
            'Quel est le prix ' + (whichI === 1 ? item.d1 : item.d2) + ' (en €) ?',
          a: rep3.a, accept: rep3.accept, choix: null,
          expl: 'Pose x = prix ' + item.d1 + ' et y = prix ' + item.d2 + ', puis élimine une inconnue par combinaison. On trouve x = ' + eurFr(p1) + ' € et y = ' + eurFr(p2) + ' €. Vérifie : ' + q11 + '×' + eurFr(p1) + ' + ' + q12 + '×' + eurFr(p2) + ' = ' + eurFr(t1) + ' €. ✓' };
      }
      var a3, b3, a4, b4;
      do {
        a3 = R.int(1, 4); b3 = R.int(1, 4);
        a4 = R.int(1, 4); b4 = R.int(1, 4);
      } while(a3 * b4 === a4 * b3);
      var x3 = 0, y3 = 0;
      while(x3 === 0){ x3 = R.int(-5, 5); }
      while(y3 === 0){ y3 = R.int(-5, 5); }
      var c3 = a3 * x3 + b3 * y3, c4 = a4 * x3 + b4 * y3;
      var which3 = R.pick(['x', 'y']);
      var rep4 = ansInt(which3 === 'x' ? x3 : y3);
      return { q: 'Résous le système :\n' + term(a3, 'x') + ' + ' + term(b3, 'y') + ' = ' + disp(c3) + '\n' + term(a4, 'x') + ' + ' + term(b4, 'y') + ' = ' + disp(c4) + '\nDonne la valeur de ' + which3 + '.',
        a: rep4.a, accept: rep4.accept, choix: null,
        expl: 'La solution est x = ' + disp(x3) + ' et y = ' + disp(y3) + '. Vérification (1re équation) : ' + a3 + '×(' + disp(x3) + ') + ' + b3 + '×(' + disp(y3) + ') = ' + disp(c3) + '. ✓' };
    }
  });

})();
