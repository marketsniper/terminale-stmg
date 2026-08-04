(function(){
// ===== Helpers partagés (phase 4) =====
function fr(x){ return String(x).replace('.', ','); }
function r2(x){ return Math.round(x*100)/100; }
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ var t=a%b; a=b; b=t; } return a||1; }
function par(n){ return n<0 ? '('+n+')' : String(n); }
function trino(a,b,c){
  var s=(a===1?'':(a===-1?'−':String(a).replace('-','−')))+'x²';
  if(b!==0) s+=(b>0?' + ':' − ')+(Math.abs(b)===1?'':Math.abs(b))+'x';
  if(c!==0) s+=(c>0?' + ':' − ')+Math.abs(c);
  return s;
}
function cube(a,b,c,d){
  var s=(a===1?'':(a===-1?'−':String(a).replace('-','−')))+'x³';
  if(b!==0) s+=(b>0?' + ':' − ')+(Math.abs(b)===1?'':Math.abs(b))+'x²';
  if(c!==0) s+=(c>0?' + ':' − ')+(Math.abs(c)===1?'':Math.abs(c))+'x';
  if(d!==0) s+=(d>0?' + ':' − ')+Math.abs(d);
  return s;
}
function lin(a,b){
  var s='';
  if(a!==0) s=(a===1?'x':(a===-1?'−x':String(a).replace('-','−')+'x'));
  if(b!==0||a===0) s+=(s===''?String(b).replace('-','−'):(b>0?' + '+b:' − '+Math.abs(b)));
  return s===''?'0':s;
}

// ============================================================
// p4-01 — Le second degré
// ============================================================
SKILLS.push({
  id: 'p4-01-second-degre',
  phase: 4,
  ordre: 1,
  titre: 'Le second degré',
  objectif: "Trouver les racines d'un trinôme avec le discriminant et donner son signe.",
  lecon: `<p class="lede">Une fonction du second degré s'écrit f(x) = ax² + bx + c. Sa courbe est une parabole, et tout se joue avec un seul nombre : <mark>le discriminant Δ</mark>.</p>
<p>Première étape, toujours : <mark>identifier a, b et c avec leurs signes</mark>. Dans f(x) = x² − 5x + 6 : a = 1, b = −5, c = 6.</p>
<div class="formule"><p>Δ = b² − 4ac.&nbsp; Si Δ &gt; 0, l'équation f(x) = 0 a deux solutions : x = (−b − √Δ) ÷ (2a) et x = (−b + √Δ) ÷ (2a).</p></div>
<div class="etapes">
<p>Exemple complet avec f(x) = x² − 5x + 6 :</p>
<p>1. J'identifie : a = 1, b = −5, c = 6.</p>
<p>2. Je calcule Δ = (−5)² − 4 × 1 × 6 = 25 − 24 = 1. Comme Δ &gt; 0, il y a deux racines.</p>
<p>3. √Δ = 1. Première racine : (5 − 1) ÷ 2 = 2. Deuxième racine : (5 + 1) ÷ 2 = 3.</p>
<p>4. Je vérifie : 2² − 5 × 2 + 6 = 4 − 10 + 6 = 0. Ça marche.</p>
</div>
<p>Le <mark>signe du trinôme</mark> : quand Δ &gt; 0, f(x) est du <mark>signe de a à l'extérieur</mark> des racines, et du signe contraire entre elles. Ici a = 1 &gt; 0 : positif avant 2, négatif entre 2 et 3, positif après 3.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Δ = b² − 4ac, racines = (−b ± √Δ) ÷ (2a). Signe de a dehors, signe contraire dedans.</p></div>
<div class="box piege"><p class="box-t">Piège classique</p><p>Si b = −5, alors b² = (−5)² = <mark>+25</mark>, jamais −25. Mets toujours b entre parenthèses avant de le mettre au carré.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Une fois tes racines trouvées, remplace x par l'une d'elles dans f(x) : tu dois tomber sur 0. Vérification gratuite en dix secondes.</p></div>`,
  gen(level, R){
    var x1, x2, a;
    if(level===1){ a=1; x1=R.int(1,4); x2=x1+R.int(1,4); }
    else if(level===2){ a=1; x1=R.int(-5,-1); x2=R.int(1,5); }
    else { a=R.pick([1,2,-1]); x1=R.int(-6,-1); x2=R.int(1,6); }
    var b=-a*(x1+x2), c=a*x1*x2;
    var D=b*b-4*a*c;
    var f='f(x) = '+trino(a,b,c);
    var petite=Math.min(x1,x2), grande=Math.max(x1,x2);
    var type=(level===1)?R.int(1,3):R.int(2,4);
    if(type===1){
      var kq=R.pick([['a',a],['b',b],['c',c]]);
      return {q:'On considère '+f+'.\nQue vaut le coefficient '+kq[0]+' ?', a:String(kq[1]), accept:null, choix:null,
        expl:'Dans ax² + bx + c : a est devant x², b devant x, et c est le nombre tout seul. Attention au signe !'};
    }
    if(type===2){
      return {q:'On considère '+f+'.\nCalcule le discriminant Δ = b² − 4ac.', a:String(D), accept:null, choix:null,
        expl:'Ici b² = '+par(b)+'² = '+(b*b)+' et 4ac = 4 × '+par(a)+' × '+par(c)+' = '+(4*a*c)+'. Donc Δ = '+(b*b)+' − '+par(4*a*c)+' = '+D+'.'};
    }
    if(type===3){
      var which=R.pick(['petite','grande']);
      return {q:'On considère '+f+'. On sait que Δ = '+D+'.\nDonne la plus '+which+' des deux racines.',
        a:String(which==='petite'?petite:grande), accept:null, choix:null,
        expl:'Avec x = (−b ± √Δ) ÷ (2a) et √Δ = '+Math.sqrt(D)+', on trouve les racines '+petite+' et '+grande+'.'};
    }
    var pos=a>0;
    return {q:'Le trinôme '+f+' a pour racines '+petite+' et '+grande+'.\nQuel est le signe de f(x) sur l\'intervalle ]'+petite+' ; '+grande+'[ ?',
      a:(pos?'négatif':'positif'), accept:null,
      choix:['positif','négatif','nul','positif puis négatif'],
      expl:'Un trinôme est du signe de a à l\'extérieur des racines et du signe contraire entre les racines. Ici a = '+a+'.'};
  }
});

// ============================================================
// p4-02 — Le nombre dérivé
// ============================================================
SKILLS.push({
  id: 'p4-02-nombre-derive',
  phase: 4,
  ordre: 2,
  titre: 'Le nombre dérivé',
  objectif: "Comprendre que f'(a) est la pente de la tangente et savoir la lire ou la calculer.",
  lecon: `<p class="lede">Le nombre dérivé, c'est simplement <mark>une pente</mark>. Rien de plus effrayant que ça.</p>
<p>Entre deux points d'une courbe, le <mark>taux de variation</mark> mesure la pente moyenne :</p>
<div class="formule"><p>Taux de variation entre a et b = (f(b) − f(a)) ÷ (b − a)</p></div>
<p>C'est « ce que gagne y » divisé par « ce que gagne x ». Exemple avec f(x) = x² entre 1 et 3 : (f(3) − f(1)) ÷ (3 − 1) = (9 − 1) ÷ 2 = 4.</p>
<p>Maintenant, zoome sur UN point de la courbe. La droite qui « frôle » la courbe en ce point s'appelle la <mark>tangente</mark>. Le nombre dérivé <mark>f'(a) est le coefficient directeur (la pente) de la tangente</mark> au point d'abscisse a.</p>
<div class="etapes">
<p>Lire f'(2) sur un graphique :</p>
<p>1. Je repère le point de la courbe d'abscisse 2 et je regarde la tangente tracée en ce point.</p>
<p>2. Je choisis deux points bien lisibles DE LA TANGENTE, par exemple (2 ; 3) et (4 ; 9).</p>
<p>3. Pente = (9 − 3) ÷ (4 − 2) = 6 ÷ 2 = 3. Donc f'(2) = 3.</p>
</div>
<p>Interprétation : f'(2) = 3 signifie qu'autour de x = 2, quand x avance de 1, la courbe monte d'environ 3. Si f'(a) &lt; 0, la tangente descend ; si f'(a) = 0, la tangente est <mark>horizontale</mark>.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>f'(a) = pente de la tangente au point d'abscisse a. Pente = (différence des y) ÷ (différence des x).</p></div>
<div class="box piege"><p class="box-t">Piège classique</p><p>Ne confonds pas f(a) (la hauteur du point) et f'(a) (la pente en ce point). Ce sont deux informations totalement différentes.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour la pente, pense « escalier » : je monte (ou descends) de combien quand j'avance de 1 ?</p></div>`,
  gen(level, R){
    var type=R.int(1,3);
    if(type===1){
      var a1,b1;
      if(level===1){ a1=R.int(1,4); b1=a1+R.int(1,4); }
      else if(level===2){ a1=R.int(-4,0); b1=a1+R.int(2,6); }
      else { a1=R.int(-6,-1); b1=a1+R.int(1,4); }
      var t=a1+b1;
      return {q:'On considère f(x) = x².\nCalcule le taux de variation de f entre '+a1+' et '+b1+', c\'est-à-dire (f('+b1+') − f('+par(a1)+')) ÷ ('+b1+' − '+par(a1)+').',
        a:String(t), accept:null, choix:null,
        expl:'f('+b1+') = '+(b1*b1)+' et f('+a1+') = '+(a1*a1)+'. Taux = ('+(b1*b1)+' − '+(a1*a1)+') ÷ '+(b1-a1)+' = '+t+'.'};
    }
    if(type===2){
      var x0=R.int(1,4), dx=(level===3?2:R.int(1,3)), m, y0=R.int(-3,5);
      if(level===1) m=R.int(1,5);
      else if(level===2) m=R.pick([-4,-3,-2,-1,2,3,4,5]);
      else m=R.pick([1,3,5,-1,-3,-5])/2;
      var y2=y0+m*dx;
      return {q:'La tangente à la courbe de f au point d\'abscisse '+x0+' passe par les points ('+x0+' ; '+y0+') et ('+(x0+dx)+' ; '+y2+').\nQue vaut f\'('+x0+') ?',
        a:String(m), accept:null, choix:null,
        expl:'f\'('+x0+') est le coefficient directeur de la tangente : ('+y2+' − '+par(y0)+') ÷ ('+(x0+dx)+' − '+x0+') = '+fr(m)+'.'};
    }
    var a0=R.int(1,5);
    if(level>=2 && R.int(0,1)===1){
      var bonne0='La tangente au point d\'abscisse '+a0+' est horizontale';
      return {q:'On sait que f\'('+a0+') = 0.\nQu\'est-ce que cela signifie pour la courbe de f ?',
        a:bonne0, accept:null,
        choix:[bonne0,'La courbe coupe l\'axe des abscisses en x = '+a0,'f('+a0+') = 0','La fonction f est nulle partout'],
        expl:'f\'('+a0+') = 0 signifie que la pente de la tangente est nulle : la tangente est horizontale. Cela ne dit rien sur la valeur de f('+a0+').'};
    }
    var m3=R.pick([2,3,4,5,-2,-3]);
    var bonne='La tangente au point d\'abscisse '+a0+' a pour coefficient directeur '+m3;
    return {q:'On sait que f\'('+a0+') = '+m3+'.\nQue peut-on en déduire ?',
      a:bonne, accept:null,
      choix:[bonne,'f('+a0+') = '+m3,'La courbe passe par le point ('+a0+' ; '+m3+')',(m3>0?'La fonction f est croissante partout':'La fonction f est décroissante partout')],
      expl:'f\'('+a0+') est la pente de la tangente en x = '+a0+', pas la valeur de f. Et cette pente ne vaut que localement, autour de '+a0+'.'};
  }
});

// ============================================================
// p4-03 — Calculer des dérivées
// ============================================================
SKILLS.push({
  id: 'p4-03-derivees',
  phase: 4,
  ordre: 3,
  titre: 'Calculer des dérivées',
  objectif: "Dériver sans hésiter les polynômes de degré 1, 2 et 3.",
  lecon: `<p class="lede">Dériver un polynôme, c'est appliquer trois formules et deux règles. Une fois le réflexe installé, ça prend dix secondes.</p>
<table class="tbl"><tr><th>f(x)</th><th>f'(x)</th></tr>
<tr><td>ax + b</td><td>a</td></tr>
<tr><td>x²</td><td>2x</td></tr>
<tr><td>x³</td><td>3x²</td></tr>
<tr><td>constante (ex : 7)</td><td>0</td></tr></table>
<p>Le geste général : <mark>l'exposant descend devant, puis la puissance baisse de 1</mark>. Pour x³ : le 3 descend, il reste x². Et deux règles pour assembler :</p>
<p>• On dérive <mark>terme par terme</mark> (les + et les − se conservent).<br>• Un coefficient devant reste devant : (5x²)' = 5 × 2x = 10x.</p>
<div class="etapes">
<p>Exemple complet : f(x) = 2x³ − 5x² + 4x − 7.</p>
<p>1. (2x³)' = 2 × 3x² = 6x²</p>
<p>2. (−5x²)' = −5 × 2x = −10x</p>
<p>3. (4x)' = 4</p>
<p>4. (−7)' = 0 (une constante ne varie pas, sa pente est nulle)</p>
<p>Bilan : f'(x) = 6x² − 10x + 4.</p>
</div>
<p>Ensuite, calculer f'(2) c'est juste remplacer x par 2 dans f'(x) : 6 × 4 − 10 × 2 + 4 = 24 − 20 + 4 = 8.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>(ax + b)' = a ; (x²)' = 2x ; (x³)' = 3x² ; (constante)' = 0. On dérive terme par terme.</p></div>
<div class="box piege"><p class="box-t">Piège classique</p><p>La constante toute seule disparaît (dérivée 0), mais le coefficient devant un x reste : (3x)' = 3, pas 0 !</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie le degré : la dérivée d'un polynôme de degré 3 est TOUJOURS de degré 2. Si tu obtiens du x³ dans f'(x), tu as oublié de baisser la puissance.</p></div>`,
  gen(level, R){
    if(level===1){
      var t=R.int(1,3);
      if(t===1){
        var aa=R.int(2,9), bb=R.int(1,9);
        return {q:'f(x) = '+aa+'x + '+bb+'.\nQue vaut f\'(x) ? (réponds par un nombre)', a:String(aa), accept:null, choix:null,
          expl:'La dérivée de ax + b est a : la pente vaut '+aa+' partout, et le + '+bb+' disparaît.'};
      }
      if(t===2){
        return {q:'Quelle est la dérivée de f(x) = x² ?', a:'2x', accept:null, choix:['2x','x','2','x²'],
          expl:'(x²)\' = 2x : l\'exposant 2 descend devant, la puissance baisse de 1.'};
      }
      return {q:'Quelle est la dérivée de f(x) = x³ ?', a:'3x²', accept:null, choix:['3x²','x²','3x','3x³'],
        expl:'(x³)\' = 3x² : le 3 descend devant, et x³ devient x².'};
    }
    if(level===2){
      var A=R.int(1,4), B=R.int(-5,5), C=R.int(-9,9), k=R.int(1,4);
      var v=2*A*k+B;
      return {q:'f(x) = '+trino(A,B,C)+'.\nCalcule f\'('+k+').', a:String(v), accept:null, choix:null,
        expl:'f\'(x) = '+lin(2*A,B)+'. En x = '+k+' : '+(2*A)+' × '+k+' + '+par(B)+' = '+v+'.'};
    }
    if(R.int(1,3)===3){
      var A3=R.int(1,3), B3=R.int(1,5), D3=R.int(1,9);
      var corr=(3*A3)+'x² − '+(2*B3)+'x';
      return {q:'f(x) = '+cube(A3,-B3,0,D3)+'.\nQuelle est l\'expression de f\'(x) ?',
        a:corr, accept:null,
        choix:[corr,(3*A3)+'x² − '+(2*B3)+'x + '+D3,(A3===1?'':A3)+'x² − '+(B3===1?'':B3)+'x',(3*A3)+'x³ − '+(2*B3)+'x²'],
        expl:'('+A3+'x³)\' = '+(3*A3)+'x², (−'+B3+'x²)\' = −'+(2*B3)+'x, et la constante '+D3+' donne 0.'};
    }
    var A2=R.int(1,2), B2=R.int(-3,3), C2=R.int(-5,5), D2=R.int(-9,9), k2=R.int(1,3);
    var v2=3*A2*k2*k2+2*B2*k2+C2;
    return {q:'f(x) = '+cube(A2,B2,C2,D2)+'.\nCalcule f\'('+k2+').', a:String(v2), accept:null, choix:null,
      expl:'f\'(x) = '+trino(3*A2,2*B2,C2)+'. En x = '+k2+', cela donne '+v2+'.'};
  }
});

// __CHUNK__
})();
