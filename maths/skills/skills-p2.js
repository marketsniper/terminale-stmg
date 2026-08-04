/* Phase 2 — Collège complet (4e–3e) — 10 skills */
(function(){

/* ===== Helpers internes ===== */
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t;}return a;}
function frac(n,d){
  if(d<0){n=-n;d=-d;}
  if(n===0)return '0';
  var g=gcd(n,d)||1;
  n=n/g;d=d/g;
  if(d===1)return String(n);
  return n+'/'+d;
}
function fmt(n){
  var r=Math.round(n*100)/100;
  return String(r);
}
function fr(n){return fmt(n).replace('.',',');}
var SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
function sup(n){return String(n).split('').map(function(c){return SUP[c]||c;}).join('');}
function acceptFor(a){
  var out=[];
  if(a.indexOf('.')>-1)out.push(a.replace('.',','));
  if(a.charAt(0)==='-')out.push('−'+a.slice(1));
  if(a.indexOf('.')>-1&&a.charAt(0)==='-')out.push('−'+a.slice(1).replace('.',','));
  return out.length?out:null;
}
function qcm(a,cands){
  var out=[String(a)],i;
  for(i=0;i<cands.length;i++){
    if(out.length>=4)break;
    var s=String(cands[i]);
    if(out.indexOf(s)===-1)out.push(s);
  }
  for(i=1;i<60;i++){
    if(out.length>=4)break;
    var t='autre : '+i;
    if(out.indexOf(t)===-1)out.push(t);
  }
  return out;
}
function rep(x,sep,n){
  var arr=[],i;
  for(i=0;i<n;i++)arr.push(String(x));
  return arr.join(' '+sep+' ');
}

/* ===== 1. Multiplier et diviser des relatifs ===== */
SKILLS.push({
  id:'p2-01-relatifs-multiplication',
  phase:2,
  ordre:1,
  titre:'Multiplier et diviser des relatifs',
  objectif:"Appliquer la règle des signes sans hésiter, même dans un calcul avec priorités.",
  lecon:`<p class="lede">Pour multiplier ou diviser des nombres relatifs, tu fais le calcul en deux temps : <mark>d'abord le signe, ensuite la valeur</mark>. C'est tout le secret.</p>
<p>La règle des signes est la même pour × et ÷ :</p>
<table class="tbl">
<tr><th>Signes des deux nombres</th><th>Signe du résultat</th></tr>
<tr><td>+ et +</td><td>+</td></tr>
<tr><td>− et −</td><td>+</td></tr>
<tr><td>+ et −  (ou − et +)</td><td>−</td></tr>
</table>
<p>Autrement dit : <mark>deux signes identiques donnent +, deux signes différents donnent −</mark>.</p>
<div class="etapes">
<p><strong>Exemple détaillé :</strong> calcule (−8) × 3.</p>
<p>Étape 1 — le signe : un nombre négatif × un nombre positif → signes différents → le résultat sera <strong>négatif</strong>.</p>
<p>Étape 2 — la valeur : 8 × 3 = 24.</p>
<p>Conclusion : (−8) × 3 = <strong>−24</strong>.</p>
<p>Autre exemple avec priorités : 5 − 2 × (−3). La multiplication passe avant la soustraction : 2 × (−3) = −6. Puis 5 − (−6) = 5 + 6 = <strong>11</strong>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Signes identiques → résultat positif. Signes différents → résultat négatif. La règle est identique pour la division : (−24) ÷ (−6) = 4.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Dans un produit de plusieurs facteurs, compte les signes « − » : un nombre <strong>pair</strong> de − donne un résultat positif, un nombre <strong>impair</strong> donne un résultat négatif. (−2) × (−3) × (−4) : trois signes −, donc résultat négatif : −24.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>N'oublie jamais les priorités : dans 5 − 2 × (−3), on calcule la multiplication <strong>avant</strong> la soustraction. Se jeter sur 5 − 2 est l'erreur classique.</p></div>`,
  gen(level,R){
    if(level===1){
      var a=R.int(2,9),b=R.int(2,9),t=R.int(1,3),v,q1;
      if(t===1){v=-a*b;q1='Calcule : (−'+a+') × '+b;}
      else if(t===2){v=-a*b;q1='Calcule : '+a+' × (−'+b+')';}
      else{v=a*b;q1='Calcule : (−'+a+') × (−'+b+')';}
      var ans=String(v);
      return {q:q1,a:ans,accept:acceptFor(ans),choix:null,
        expl:(v<0?'Signes différents → résultat négatif. ':'Deux signes − → résultat positif. ')+a+' × '+b+' = '+(a*b)+', donc la réponse est '+fr(v)+'.'};
    }
    if(level===2){
      var t2=R.int(1,2);
      if(t2===1){
        var q0=R.int(2,9),d=R.int(2,9),n=q0*d,s=R.int(1,3),val,qq;
        if(s===1){val=-q0;qq='Calcule : (−'+n+') ÷ '+d;}
        else if(s===2){val=-q0;qq='Calcule : '+n+' ÷ (−'+d+')';}
        else{val=q0;qq='Calcule : (−'+n+') ÷ (−'+d+')';}
        var ans2=String(val);
        return {q:qq,a:ans2,accept:acceptFor(ans2),choix:null,
          expl:'Même règle des signes que pour la multiplication. '+n+' ÷ '+d+' = '+q0+', puis on applique le signe : '+fr(val)+'.'};
      }
      var f1=R.int(2,5),f2=R.int(2,5),f3=R.int(2,4),neg=R.int(1,3);
      var fac=[f1,f2,f3],parts=[],i,prod=f1*f2*f3;
      for(i=0;i<3;i++){parts.push(i<neg?'(−'+fac[i]+')':String(fac[i]));}
      if(neg%2===1)prod=-prod;
      var ans3=String(prod);
      return {q:'Calcule : '+parts.join(' × '),a:ans3,accept:acceptFor(ans3),choix:null,
        expl:'Il y a '+neg+' signe(s) « − » : nombre '+(neg%2===0?'pair → résultat positif':'impair → résultat négatif')+'. '+f1+' × '+f2+' × '+f3+' = '+(f1*f2*f3)+', donc '+fr(prod)+'.'};
    }
    var t3=R.int(1,3);
    if(t3===1){
      var s1=R.pick([1,-1]),a4=R.int(2,5),b4=R.int(2,9),c4=R.int(2,9);
      if(b4===c4)c4=b4+2;
      var val4=s1*a4*(b4-c4);
      var left=s1<0?'(−'+a4+')':String(a4);
      var ans4=String(val4);
      return {q:'Calcule : '+left+' × ('+b4+' − '+c4+')',a:ans4,accept:acceptFor(ans4),choix:null,
        expl:'On calcule d’abord la parenthèse : '+b4+' − '+c4+' = '+fr(b4-c4)+'. Puis '+left+' × ('+fr(b4-c4)+') = '+fr(val4)+'.'};
    }
    if(t3===2){
      var sA=R.pick([1,-1]),sB=R.pick([1,-1]),a5=R.int(2,6),b5=R.int(2,6),c5=R.int(2,6),d5=R.int(2,6);
      var v1=sA*a5*b5,v2=sB*c5*d5,tot=v1+v2;
      var p1=(sA<0?'(−'+a5+')':String(a5))+' × '+b5;
      var p2=(sB<0?'(−'+c5+')':String(c5))+' × '+d5;
      var ans5=String(tot);
      return {q:'Calcule : '+p1+' + '+p2,a:ans5,accept:acceptFor(ans5),choix:null,
        expl:'Les multiplications d’abord : '+p1+' = '+fr(v1)+' et '+p2+' = '+fr(v2)+'. Puis '+fr(v1)+' + '+fr(v2)+' = '+fr(tot)+'.'};
    }
    var e6=R.int(1,10),f6=R.int(2,6),g6=R.int(2,6),sg=R.pick([1,-1]);
    var prod6=f6*(sg*g6),val6=e6-prod6;
    var g6s=sg<0?'(−'+g6+')':String(g6);
    var ans6=String(val6);
    return {q:'Calcule : '+e6+' − '+f6+' × '+g6s,a:ans6,accept:acceptFor(ans6),choix:null,
      expl:'Multiplication avant soustraction : '+f6+' × '+g6s+' = '+fr(prod6)+'. Puis '+e6+' − ('+fr(prod6)+') = '+fr(val6)+'.'};
  }
});

/* ===== 2. Additionner et soustraire des fractions ===== */
SKILLS.push({
  id:'p2-02-fractions-somme',
  phase:2,
  ordre:2,
  titre:'Additionner et soustraire des fractions',
  objectif:"Mettre deux fractions au même dénominateur et les additionner ou les soustraire sans erreur.",
  lecon:`<p class="lede">On ne peut additionner que des morceaux <mark>de même taille</mark>. Pour les fractions, « même taille » veut dire <mark>même dénominateur</mark>.</p>
<p>Cas facile : si les dénominateurs sont déjà identiques, on additionne (ou soustrait) les numérateurs et on <strong>garde le dénominateur</strong>. Exemple : 3/7 + 2/7 = 5/7.</p>
<p>Cas général : dénominateurs différents. Il faut d'abord transformer les fractions pour leur donner le même dénominateur, en multipliant <strong>en haut et en bas par le même nombre</strong> (ça ne change pas la valeur de la fraction).</p>
<div class="etapes">
<p><strong>Exemple détaillé :</strong> calcule 3/4 + 5/6.</p>
<p>Étape 1 — trouver un dénominateur commun : 4 et 6 vont tous les deux dans 12 (4 × 3 = 12 et 6 × 2 = 12).</p>
<p>Étape 2 — transformer chaque fraction : 3/4 = (3 × 3)/(4 × 3) = 9/12 et 5/6 = (5 × 2)/(6 × 2) = 10/12.</p>
<p>Étape 3 — additionner les numérateurs : 9/12 + 10/12 = 19/12.</p>
<p>Étape 4 — vérifier si on peut simplifier : 19 et 12 n'ont pas de diviseur commun, c'est fini. Résultat : <strong>19/12</strong>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Même dénominateur d'abord, toujours. Ensuite on additionne les <strong>numérateurs seulement</strong> — jamais les dénominateurs entre eux. À la fin, on simplifie si possible.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Regarde d'abord si un dénominateur est un multiple de l'autre : pour 1/3 + 5/12, il suffit de transformer 1/3 en 4/12. Sinon, le produit des deux dénominateurs marche toujours.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>1/2 + 1/3 ne fait PAS 2/5 ! On n'additionne jamais numérateurs et dénominateurs séparément. La bonne réponse : 3/6 + 2/6 = 5/6.</p></div>`,
  gen(level,R){
    if(level===1){
      var d=R.pick([4,5,6,7,8,9,10,11]);
      var n1=R.int(1,d-1),n2=R.int(1,d-1);
      if(n2===n1)n2=(n1===1)?2:(n1-1);
      var plus=R.int(0,1)===0;
      if(!plus&&n2>n1){var tmp=n1;n1=n2;n2=tmp;}
      var num=plus?(n1+n2):(n1-n2);
      var ans=frac(num,d);
      var acc=acceptFor(ans)||[];
      if(ans.indexOf('/')===-1)acc.push(ans+'/1');
      return {q:'Calcule : '+n1+'/'+d+' '+(plus?'+':'−')+' '+n2+'/'+d+'\n(donne une fraction irréductible)',
        a:ans,accept:acc.length?acc:null,choix:null,
        expl:'Même dénominateur : on '+(plus?'additionne':'soustrait')+' les numérateurs : '+n1+' '+(plus?'+':'−')+' '+n2+' = '+num+', d’où '+num+'/'+d+(ans!==(num+'/'+d)?', qui se simplifie en '+ans:'')+'.'};
    }
    if(level===2){
      var k=R.pick([2,3,4]),dd=R.pick([2,3,4,5]),D=k*dd;
      var a1=R.int(1,dd+2),b1=R.int(1,D-1);
      var minus=R.int(0,1)===1;
      var big=a1*k,small=b1,num2,qs;
      if(minus&&big>small){num2=big-small;qs=a1+'/'+dd+' − '+b1+'/'+D;}
      else if(minus&&small>big){num2=small-big;qs=b1+'/'+D+' − '+a1+'/'+dd;}
      else{num2=big+small;qs=a1+'/'+dd+' + '+b1+'/'+D;}
      var ans2=frac(num2,D);
      var acc2=acceptFor(ans2)||[];
      if(ans2.indexOf('/')===-1)acc2.push(ans2+'/1');
      return {q:'Calcule : '+qs+'\n(donne une fraction irréductible)',a:ans2,accept:acc2.length?acc2:null,choix:null,
        expl:D+' est un multiple de '+dd+' : on écrit '+a1+'/'+dd+' = '+(a1*k)+'/'+D+'. Le calcul donne '+num2+'/'+D+(ans2!==(num2+'/'+D)?' = '+ans2:'')+'.'};
    }
    var t=R.int(1,3);
    if(t===3){
      var db=R.pick([2,3,4,5]),nb=R.int(1,4),ab=R.int(1,db-1);
      var numb=nb*db+ab;
      var ansb=frac(numb,db);
      return {q:'Calcule : '+nb+' + '+ab+'/'+db+'\n(donne une fraction irréductible)',a:ansb,accept:acceptFor(ansb),choix:null,
        expl:'On écrit l’entier en fraction : '+nb+' = '+(nb*db)+'/'+db+'. Puis '+(nb*db)+'/'+db+' + '+ab+'/'+db+' = '+ansb+'.'};
    }
    var pair=R.pick([[2,3],[3,4],[2,5],[3,5],[4,5],[4,6],[6,8]]);
    var d1=pair[0],d2=pair[1],L=d1*d2/gcd(d1,d2);
    var m1=R.int(1,5),m2=R.int(1,5);
    var minus3=R.int(0,1)===1;
    var num3=m1*(L/d1)+(minus3?-1:1)*m2*(L/d2);
    var ans3=frac(num3,L);
    return {q:'Calcule : '+m1+'/'+d1+' '+(minus3?'−':'+')+' '+m2+'/'+d2+'\n(donne une fraction irréductible)',
      a:ans3,accept:acceptFor(ans3),choix:null,
      expl:'Dénominateur commun : '+L+'. On obtient '+(m1*(L/d1))+'/'+L+' '+(minus3?'−':'+')+' '+(m2*(L/d2))+'/'+L+' = '+num3+'/'+L+(ans3!==(num3+'/'+L)?' = '+ans3:'')+'.'};
  }
});

/* ===== 3. Multiplier et diviser des fractions ===== */
SKILLS.push({
  id:'p2-03-fractions-produit',
  phase:2,
  ordre:3,
  titre:'Multiplier et diviser des fractions',
  objectif:"Multiplier des fractions en ligne droite et diviser en multipliant par l'inverse.",
  lecon:`<p class="lede">Bonne nouvelle : multiplier des fractions est <mark>l'opération la plus simple</mark> qui existe sur les fractions. Pas besoin de même dénominateur !</p>
<p>Règle : on multiplie <strong>les numérateurs entre eux</strong> et <strong>les dénominateurs entre eux</strong> :</p>
<p style="text-align:center">a/b × c/d = (a × c)/(b × d)</p>
<p>Pour la division, une seule chose à savoir : <mark>diviser par une fraction, c'est multiplier par son inverse</mark>. L'inverse de c/d est d/c (on retourne la fraction).</p>
<div class="etapes">
<p><strong>Exemple détaillé :</strong> calcule 3/4 ÷ 2/5.</p>
<p>Étape 1 — remplacer la division par une multiplication par l'inverse : 3/4 ÷ 2/5 = 3/4 × 5/2.</p>
<p>Étape 2 — multiplier en ligne : (3 × 5)/(4 × 2) = 15/8.</p>
<p>Étape 3 — simplifier si possible : 15 et 8 n'ont aucun diviseur commun. Résultat : <strong>15/8</strong>.</p>
<p>Autre exemple avec simplification : 4/9 × 3/8 = (4 × 3)/(9 × 8) = 12/72 = <strong>1/6</strong> (on divise haut et bas par 12).</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Multiplication : haut × haut, bas × bas. Division : on <strong>retourne la deuxième fraction</strong> et on multiplie. On simplifie toujours le résultat.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Simplifie <strong>avant</strong> de multiplier : dans 4/9 × 3/8, le 4 se simplifie avec le 8, et le 3 avec le 9. Il reste 1/3 × 1/2 = 1/6. Les nombres restent petits, les erreurs disparaissent.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Ne mélange pas avec l'addition : ici, pas de mise au même dénominateur ! Et on retourne uniquement la fraction <strong>par laquelle on divise</strong>, jamais la première.</p></div>`,
  gen(level,R){
    if(level===1){
      var a=R.int(1,9),b=R.int(2,9),c=R.int(1,9),d=R.int(2,9);
      var ans=frac(a*c,b*d);
      return {q:'Calcule : '+a+'/'+b+' × '+c+'/'+d+'\n(donne une fraction irréductible)',a:ans,accept:acceptFor(ans),choix:null,
        expl:'Haut × haut et bas × bas : ('+a+' × '+c+')/('+b+' × '+d+') = '+(a*c)+'/'+(b*d)+(ans!==((a*c)+'/'+(b*d))?' = '+ans:'')+'.'};
    }
    if(level===2){
      var t=R.int(1,2);
      if(t===1){
        var a2=R.int(1,9),b2=R.int(2,9),c2=R.int(1,9),d2=R.int(2,9);
        var ans2=frac(a2*d2,b2*c2);
        return {q:'Calcule : '+a2+'/'+b2+' ÷ '+c2+'/'+d2+'\n(donne une fraction irréductible)',a:ans2,accept:acceptFor(ans2),choix:null,
          expl:'Diviser, c’est multiplier par l’inverse : '+a2+'/'+b2+' × '+d2+'/'+c2+' = '+(a2*d2)+'/'+(b2*c2)+(ans2!==((a2*d2)+'/'+(b2*c2))?' = '+ans2:'')+'.'};
      }
      var b3=R.pick([2,3,4,5]),a3=R.int(1,b3-1),n3=b3*R.int(2,8);
      var v3=a3*n3/b3,ans3=String(v3);
      return {q:'Calcule : '+a3+'/'+b3+' × '+n3,a:ans3,accept:acceptFor(ans3),choix:null,
        expl:'On divise '+n3+' par '+b3+' ('+n3+' ÷ '+b3+' = '+(n3/b3)+'), puis on multiplie par '+a3+' : '+(n3/b3)+' × '+a3+' = '+v3+'.'};
    }
    var t3=R.int(1,3);
    if(t3===1){
      var a4=R.int(1,5),b4=R.int(2,6),c4=R.int(1,5),d4=R.int(2,6),e4=R.int(1,5),f4=R.int(2,6);
      var ans4=frac(a4*c4*e4,b4*d4*f4);
      return {q:'Calcule : '+a4+'/'+b4+' × '+c4+'/'+d4+' × '+e4+'/'+f4+'\n(donne une fraction irréductible)',a:ans4,accept:acceptFor(ans4),choix:null,
        expl:'On multiplie tous les numérateurs et tous les dénominateurs : '+(a4*c4*e4)+'/'+(b4*d4*f4)+(ans4!==((a4*c4*e4)+'/'+(b4*d4*f4))?' = '+ans4:'')+'.'};
    }
    if(t3===2){
      var a5=R.int(1,9),b5=R.int(2,9),c5=R.int(2,6);
      var ans5=frac(a5,b5*c5);
      return {q:'Calcule : '+a5+'/'+b5+' ÷ '+c5+'\n(donne une fraction irréductible)',a:ans5,accept:acceptFor(ans5),choix:null,
        expl:'Diviser par '+c5+', c’est multiplier par 1/'+c5+' : '+a5+'/'+b5+' × 1/'+c5+' = '+a5+'/'+(b5*c5)+(ans5!==(a5+'/'+(b5*c5))?' = '+ans5:'')+'.'};
    }
    var b6=R.pick([2,3,4,5]),a6=R.int(1,b6-1),n6=b6*R.int(4,12);
    var v6=a6*n6/b6,ans6=String(v6);
    return {q:'Calcule les '+a6+'/'+b6+' de '+n6+'.',a:ans6,accept:acceptFor(ans6),choix:null,
      expl:'« Les '+a6+'/'+b6+' de '+n6+' » = '+a6+'/'+b6+' × '+n6+'. On calcule '+n6+' ÷ '+b6+' = '+(n6/b6)+', puis × '+a6+' = '+v6+'.'};
  }
});

/* ===== 4. Les puissances ===== */
SKILLS.push({
  id:'p2-04-puissances',
  phase:2,
  ordre:4,
  titre:'Les puissances',
  objectif:"Calculer a puissance n, maîtriser les signes, les puissances de 10 et la règle des exposants.",
  lecon:`<p class="lede">Une puissance est un <mark>raccourci de multiplication</mark> : a<sup>n</sup> veut dire « a multiplié par lui-même n fois ».</p>
<p>Exemples : 2<sup>5</sup> = 2 × 2 × 2 × 2 × 2 = 32 ; 10<sup>3</sup> = 10 × 10 × 10 = 1000.</p>
<div class="etapes">
<p><strong>Exemple détaillé avec les signes :</strong> compare (−3)<sup>2</sup> et −3<sup>2</sup>.</p>
<p>(−3)<sup>2</sup> : la parenthèse dit que c'est <strong>tout</strong> le nombre −3 qui est au carré : (−3) × (−3) = <strong>+9</strong>.</p>
<p>−3<sup>2</sup> : sans parenthèse, seul le 3 est au carré. C'est « l'opposé de 3<sup>2</sup> » : −(3 × 3) = <strong>−9</strong>.</p>
<p>Règle générale : un nombre négatif élevé à une puissance <strong>paire</strong> donne un résultat positif, à une puissance <strong>impaire</strong> un résultat négatif. (−2)<sup>3</sup> = −8, mais (−2)<sup>4</sup> = 16.</p>
</div>
<p><strong>Puissances de 10 :</strong> 10<sup>n</sup> = 1 suivi de n zéros. 10<sup>4</sup> = 10 000. L'<strong>écriture scientifique</strong> d'un nombre, c'est a × 10<sup>n</sup> avec <mark>1 ≤ a &lt; 10</mark> : par exemple 4500 = 4,5 × 10<sup>3</sup>.</p>
<p><strong>Règle des exposants :</strong> quand on multiplie deux puissances de <em>même base</em>, <mark>on additionne les exposants</mark> : a<sup>n</sup> × a<sup>p</sup> = a<sup>n+p</sup>. Exemple : 2<sup>4</sup> × 2<sup>3</sup> = 2<sup>7</sup>.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>a<sup>n</sup> = a × a × … × a (n facteurs). Négatif puissance paire → positif ; puissance impaire → négatif. a<sup>n</sup> × a<sup>p</sup> = a<sup>n+p</sup>.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour l'écriture scientifique, place la virgule juste après le premier chiffre non nul, puis compte de combien de rangs tu l'as déplacée : c'est ton exposant.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>2<sup>4</sup> × 2<sup>3</sup> = 2<sup>7</sup> et surtout PAS 2<sup>12</sup> ni 4<sup>7</sup>. On additionne les exposants, on ne les multiplie pas, et la base ne change pas.</p></div>`,
  gen(level,R){
    if(level===1){
      var t=R.int(1,3);
      if(t<=2){
        var p=R.pick([[2,2],[2,3],[2,4],[2,5],[2,6],[3,2],[3,3],[3,4],[4,2],[4,3],[5,2],[5,3],[6,2],[7,2],[8,2],[9,2],[10,2],[10,3]]);
        var v=Math.pow(p[0],p[1]),ans=String(v);
        return {q:'Calcule : '+p[0]+sup(p[1]),a:ans,accept:acceptFor(ans),choix:null,
          expl:p[0]+sup(p[1])+' = '+rep(p[0],'×',p[1])+' = '+v+'.'};
      }
      var b=R.int(2,9),e=R.int(2,4);
      if(b===2&&e===2)e=3;
      var good=rep(b,'×',e);
      return {q:'Que signifie '+b+sup(e)+' ?',a:good,accept:null,
        choix:qcm(good,[b+' × '+e,rep(b,'+',e),b+' × '+b,String(b*e)]),
        expl:b+sup(e)+' signifie « '+b+' multiplié par lui-même '+e+' fois » : '+good+'.'};
    }
    if(level===2){
      var t2=R.int(1,4);
      if(t2===1){
        var b2=R.int(2,5),e2=R.int(2,3),v2=Math.pow(-b2,e2),ans2=String(v2);
        return {q:'Calcule : (−'+b2+')'+sup(e2),a:ans2,accept:acceptFor(ans2),choix:null,
          expl:'Exposant '+(e2%2===0?'pair → résultat positif':'impair → résultat négatif')+' : (−'+b2+')'+sup(e2)+' = '+fr(v2)+'.'};
      }
      if(t2===2){
        var b3=R.int(2,9),v3=-b3*b3,ans3=String(v3);
        return {q:'Calcule : −'+b3+'²',a:ans3,accept:acceptFor(ans3),choix:null,
          expl:'Sans parenthèse, seul '+b3+' est au carré : −'+b3+'² = −('+b3+' × '+b3+') = '+fr(v3)+'. Ne confonds pas avec (−'+b3+')² = '+(b3*b3)+'.'};
      }
      if(t2===3){
        var e4=R.int(3,6),v4=Math.pow(10,e4),ans4=String(v4);
        return {q:'Calcule : 10'+sup(e4),a:ans4,accept:acceptFor(ans4),choix:null,
          expl:'10'+sup(e4)+' = 1 suivi de '+e4+' zéros = '+v4+'.'};
      }
      var d1=R.int(1,9),d2=R.int(1,9),e5=R.int(2,4);
      var nombre=(d1*10+d2)*Math.pow(10,e5-1);
      var good5=d1+','+d2+' × 10'+sup(e5);
      return {q:'Quelle est l’écriture scientifique de '+nombre+' ?',a:good5,accept:null,
        choix:qcm(good5,[(d1*10+d2)+' × 10'+sup(e5-1),d1+','+d2+' × 10'+sup(e5-1),'0,'+d1+d2+' × 10'+sup(e5+1),(d1*10+d2)+' × 10'+sup(e5)]),
        expl:'En écriture scientifique, le nombre devant le × doit être entre 1 et 10 : '+nombre+' = '+good5+'.'};
    }
    var t3=R.int(1,3);
    if(t3===1){
      var b6=R.pick([2,3,5,10]),n6=R.int(2,5),p6=R.int(2,5);
      if(n6===2&&p6===2)p6=3;
      var good6=b6+sup(n6+p6);
      return {q:'Simplifie : '+b6+sup(n6)+' × '+b6+sup(p6),a:good6,accept:null,
        choix:qcm(good6,[b6+sup(n6*p6),String(b6*b6)+sup(n6+p6),String(b6*b6)+sup(n6*p6),b6+sup(n6)+sup(p6)]),
        expl:'Même base → on additionne les exposants : '+n6+' + '+p6+' = '+(n6+p6)+', donc '+good6+'.'};
    }
    if(t3===2){
      var ea=R.int(1,3),eb=R.int(1,2),tot=ea+eb,v7=Math.pow(10,tot),ans7=String(v7);
      return {q:'Calcule : 10'+sup(ea)+' × 10'+sup(eb),a:ans7,accept:(acceptFor(ans7)||[]).concat(['10^'+tot,'10'+sup(tot)]),choix:null,
        expl:'10'+sup(ea)+' × 10'+sup(eb)+' = 10'+sup(tot)+' = '+v7+'.'};
    }
    var b8=R.pick([2,3]),n8=R.int(1,2),p8=R.int(1,(b8===2?3:2));
    var v8=Math.pow(b8,n8+p8),ans8=String(v8);
    return {q:'Calcule : '+b8+sup(n8)+' × '+b8+sup(p8)+'\n(donne le résultat sous forme de nombre)',a:ans8,accept:acceptFor(ans8),choix:null,
      expl:b8+sup(n8)+' × '+b8+sup(p8)+' = '+b8+sup(n8+p8)+' = '+v8+'.'};
  }
});

/* ===== 5. Les racines carrées ===== */
SKILLS.push({
  id:'p2-05-racines',
  phase:2,
  ordre:5,
  titre:'Les racines carrées',
  objectif:"Connaître les carrés parfaits jusqu'à 15², encadrer une racine et simplifier √a.",
  lecon:`<p class="lede">La racine carrée de x, notée √x, est <mark>le nombre positif qui, multiplié par lui-même, donne x</mark>. √49 = 7 parce que 7 × 7 = 49.</p>
<p>Pour être rapide, tu dois connaître par cœur les <strong>carrés parfaits</strong> :</p>
<table class="tbl">
<tr><th>n</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td></tr>
<tr><th>n²</th><td>1</td><td>4</td><td>9</td><td>16</td><td>25</td><td>36</td><td>49</td><td>64</td><td>81</td><td>100</td><td>121</td><td>144</td><td>169</td><td>196</td><td>225</td></tr>
</table>
<div class="etapes">
<p><strong>Exemple détaillé — encadrer √40 :</strong></p>
<p>Étape 1 — je cherche les deux carrés parfaits qui entourent 40 : c'est 36 (= 6²) et 49 (= 7²).</p>
<p>Étape 2 — donc 36 &lt; 40 &lt; 49, ce qui donne √36 &lt; √40 &lt; √49.</p>
<p>Conclusion : <strong>6 &lt; √40 &lt; 7</strong>. √40 est entre 6 et 7.</p>
<p><strong>Exemple — simplifier √50 :</strong> je cherche un carré parfait caché dans 50 : 50 = 25 × 2. Alors √50 = √25 × √2 = <strong>5√2</strong>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>√(a²) = a et (√a)² = a (pour a positif). √(a × b) = √a × √b : c'est cette règle qui permet de simplifier en sortant les carrés parfaits.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour simplifier √n, teste les carrés parfaits dans l'ordre décroissant : est-ce que 100, 64, 49, 36, 25, 16, 9 ou 4 divise n ? Le premier qui marche sort de la racine.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>√(a + b) n'est PAS égal à √a + √b : √(9 + 16) = √25 = 5, alors que √9 + √16 = 3 + 4 = 7. La racine ne se distribue que sur la multiplication.</p></div>`,
  gen(level,R){
    if(level===1){
      var t=R.int(1,3),n=R.int(2,15);
      if(t===1){
        var ans=String(n);
        return {q:'Calcule : √'+(n*n),a:ans,accept:null,choix:null,
          expl:n+' × '+n+' = '+(n*n)+', donc √'+(n*n)+' = '+n+'.'};
      }
      if(t===2){
        var ans2=String(n);
        return {q:'Quel nombre positif, multiplié par lui-même, donne '+(n*n)+' ?',a:ans2,accept:null,choix:null,
          expl:'C’est la définition de la racine carrée : √'+(n*n)+' = '+n+' car '+n+' × '+n+' = '+(n*n)+'.'};
      }
      var ans3=String(n*n);
      return {q:'Calcule : '+n+'²',a:ans3,accept:null,choix:null,
        expl:n+'² = '+n+' × '+n+' = '+(n*n)+'. Les carrés parfaits jusqu’à 15² sont à connaître par cœur.'};
    }
    if(level===2){
      var t2=R.int(1,3);
      if(t2===1){
        var k=R.int(2,9),m=R.int(k*k+1,(k+1)*(k+1)-1);
        var good='entre '+k+' et '+(k+1);
        return {q:'Entre quels nombres entiers consécutifs se trouve √'+m+' ?',a:good,accept:null,
          choix:qcm(good,['entre '+(k-1)+' et '+k,'entre '+(k+1)+' et '+(k+2),'entre '+(2*k)+' et '+(2*k+2)]),
          expl:(k*k)+' < '+m+' < '+((k+1)*(k+1))+', donc '+k+' < √'+m+' < '+(k+1)+'.'};
      }
      if(t2===2){
        var a4=R.int(2,20),ans4=String(a4);
        return {q:'Calcule : √('+a4+'²)',a:ans4,accept:null,choix:null,
          expl:'La racine et le carré s’annulent (pour un nombre positif) : √('+a4+'²) = '+a4+'.'};
      }
      var b5=R.pick([2,3,5,6,7,10,11,13]),ans5=String(b5);
      return {q:'Calcule : (√'+b5+')²',a:ans5,accept:null,choix:null,
        expl:'Par définition, (√'+b5+')² = '+b5+' : élever au carré annule la racine.'};
    }
    var t3=R.int(1,3);
    if(t3===1||t3===2){
      var it=R.pick([[8,2,2],[12,2,3],[18,3,2],[20,2,5],[27,3,3],[32,4,2],[45,3,5],[50,5,2],[72,6,2],[75,5,3]]);
      var inside=it[0],aa=it[1],bb=it[2];
      var good='' + aa+'√'+bb;
      return {q:'Simplifie : √'+inside,a:good,accept:null,
        choix:qcm(good,[bb+'√'+aa,String(aa*aa)+'√'+bb,aa+'√'+(aa*bb),String(inside)+'√'+bb,(aa+bb)+'√'+bb]),
        expl:inside+' = '+(aa*aa)+' × '+bb+', donc √'+inside+' = √'+(aa*aa)+' × √'+bb+' = '+good+'.'};
    }
    var pr=R.pick([[2,8,4],[2,18,6],[3,12,6],[5,20,10],[2,32,8],[3,27,9],[8,18,12]]);
    var ansP=String(pr[2]);
    return {q:'Calcule : √'+pr[0]+' × √'+pr[1],a:ansP,accept:null,choix:null,
      expl:'√'+pr[0]+' × √'+pr[1]+' = √('+pr[0]+' × '+pr[1]+') = √'+(pr[0]*pr[1])+' = '+pr[2]+'.'};
  }
});

/* ===== 6. Le calcul littéral ===== */
SKILLS.push({
  id:'p2-06-calcul-litteral',
  phase:2,
  ordre:6,
  titre:'Le calcul littéral',
  objectif:"Réduire une expression, développer k(a+b) et (a+b)(c+d), remplacer x par une valeur.",
  lecon:`<p class="lede">En calcul littéral, la lettre x représente <mark>un nombre qu'on ne connaît pas encore</mark>. Toutes les règles de calcul restent valables — il faut juste apprendre à trier.</p>
<p><strong>Réduire</strong>, c'est regrouper ce qui se ressemble : les termes en x ensemble, les nombres seuls ensemble. 3x + 5 + 4x + 2 = <strong>7x + 7</strong>. Attention : 7x + 7 ne se réduit pas plus, on ne peut pas mélanger les x et les nombres.</p>
<p><strong>Développer</strong>, c'est distribuer une multiplication sur une addition : <mark>k(a + b) = ka + kb</mark>.</p>
<div class="etapes">
<p><strong>Exemple détaillé 1 :</strong> développe 3(2x + 5).</p>
<p>Le 3 multiplie chaque terme de la parenthèse : 3 × 2x = 6x et 3 × 5 = 15. Résultat : <strong>6x + 15</strong>.</p>
<p><strong>Exemple détaillé 2 :</strong> développe (x + 2)(x + 3).</p>
<p>Chaque terme de la première parenthèse multiplie chaque terme de la seconde : x × x = x², x × 3 = 3x, 2 × x = 2x, 2 × 3 = 6.</p>
<p>On regroupe : x² + 3x + 2x + 6 = <strong>x² + 5x + 6</strong>.</p>
</div>
<p><strong>Substituer</strong>, c'est remplacer x par une valeur : pour x = 5, l'expression 4x − 3 vaut 4 × 5 − 3 = 17.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>k(a + b) = ka + kb et (a + b)(c + d) = ac + ad + bc + bd : chaque terme multiplie chaque terme, puis on réduit.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Quand tu substitues une valeur négative, mets-la toujours entre parenthèses : pour x = −3, x² − 2x devient (−3)² − 2 × (−3) = 9 + 6 = 15. Les parenthèses évitent 90 % des erreurs de signe.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>3x + 2 ne fait PAS 5x : on ne peut additionner que des termes de même nature. 3x + 2x = 5x, oui ; 3x + 2, non, ça reste tel quel.</p></div>`,
  gen(level,R){
    if(level===1){
      var t=R.int(1,2);
      if(t===1){
        var a=R.int(2,9),b=R.int(2,9),minus=R.int(0,1)===1;
        if(minus&&b>=a)b=a-1;
        if(minus&&b===0){minus=false;b=R.int(2,9);}
        var coef=minus?(a-b):(a+b);
        var ansA=coef+'x';
        return {q:'Réduis : '+a+'x '+(minus?'−':'+')+' '+b+'x',a:ansA,accept:[coef+' x'],choix:null,
          expl:a+'x '+(minus?'−':'+')+' '+b+'x = ('+a+' '+(minus?'−':'+')+' '+b+')x = '+ansA+'.'};
      }
      var a2=R.int(2,6),c2=R.int(2,6),b2=R.int(1,9),d2=R.int(1,9);
      var cx=a2+c2,ct=b2+d2;
      var ansB=cx+'x+'+ct;
      return {q:'Réduis : '+a2+'x + '+b2+' + '+c2+'x + '+d2,a:ansB,
        accept:[cx+'x + '+ct,ct+'+'+cx+'x',ct+' + '+cx+'x'],choix:null,
        expl:'On regroupe les x : '+a2+'x + '+c2+'x = '+cx+'x. Puis les nombres : '+b2+' + '+d2+' = '+ct+'. Résultat : '+cx+'x + '+ct+'.'};
    }
    if(level===2){
      var t2=R.int(1,2);
      if(t2===1){
        var k=R.int(2,6),a3=R.int(2,6),b3=R.int(1,9),minus3=R.int(0,1)===1;
        var ka=k*a3,kb=k*b3;
        var ansC=minus3?(ka+'x-'+kb):(ka+'x+'+kb);
        var accC=minus3?[ka+'x - '+kb,ka+'x − '+kb,ka+'x−'+kb]:[ka+'x + '+kb,kb+'+'+ka+'x',kb+' + '+ka+'x'];
        return {q:'Développe : '+k+'('+a3+'x '+(minus3?'−':'+')+' '+b3+')',a:ansC,accept:accC,choix:null,
          expl:'Le '+k+' multiplie chaque terme : '+k+' × '+a3+'x = '+ka+'x et '+k+' × '+b3+' = '+kb+'. Résultat : '+ka+'x '+(minus3?'−':'+')+' '+kb+'.'};
      }
      var a4=R.int(2,6),x4=R.int(2,9),b4=R.int(1,Math.min(9,a4*x4-1));
      var v4=a4*x4-b4,ans4=String(v4);
      return {q:'Calcule la valeur de '+a4+'x − '+b4+' pour x = '+x4+'.',a:ans4,accept:acceptFor(ans4),choix:null,
        expl:'On remplace x par '+x4+' : '+a4+' × '+x4+' − '+b4+' = '+(a4*x4)+' − '+b4+' = '+v4+'.'};
    }
    var t3=R.int(1,3);
    if(t3===1){
      var a5=R.int(1,6),b5=R.int(1,6);
      if(a5===2&&b5===2)b5=3;
      var s5=a5+b5,p5=a5*b5;
      var good='x² + '+s5+'x + '+p5;
      return {q:'Développe et réduis : (x + '+a5+')(x + '+b5+')',a:good,accept:null,
        choix:qcm(good,['x² + '+p5+'x + '+s5,'x² + '+p5,'x² + '+s5+'x + '+s5,'2x + '+s5]),
        expl:'x × x = x², puis '+b5+'x + '+a5+'x = '+s5+'x, et '+a5+' × '+b5+' = '+p5+'. D’où x² + '+s5+'x + '+p5+'.'};
    }
    if(t3===2){
      var c6=R.int(1,5),x6=-R.int(2,5),s6=R.pick([1,-1]);
      var v6=x6*x6+s6*c6*x6,ans6=String(v6);
      return {q:'Calcule la valeur de x² '+(s6<0?'−':'+')+' '+c6+'x pour x = −'+(-x6)+'.',a:ans6,accept:acceptFor(ans6),choix:null,
        expl:'On remplace avec des parenthèses : (−'+(-x6)+')² = '+(x6*x6)+', et '+(s6<0?'−':'+')+' '+c6+' × (−'+(-x6)+') = '+fr(s6*c6*x6)+'. Total : '+fr(v6)+'.'};
    }
    var k7=R.int(2,5),a7=R.int(2,6),b7=R.int(1,9);
    var ka7=k7*a7,kb7=k7*b7;
    var ans7='-'+ka7+'x+'+kb7;
    return {q:'Développe : −'+k7+'('+a7+'x − '+b7+')',a:ans7,
      accept:['−'+ka7+'x+'+kb7,'-'+ka7+'x + '+kb7,'−'+ka7+'x + '+kb7,kb7+'-'+ka7+'x',kb7+' - '+ka7+'x',kb7+' − '+ka7+'x'],choix:null,
      expl:'−'+k7+' × '+a7+'x = −'+ka7+'x et −'+k7+' × (−'+b7+') = +'+kb7+' (moins par moins = plus). Résultat : −'+ka7+'x + '+kb7+'.'};
  }
});

/* ===== 7. Les équations du 1er degré ===== */
SKILLS.push({
  id:'p2-07-equations',
  phase:2,
  ordre:7,
  titre:'Les équations du 1er degré',
  objectif:"Résoudre ax + b = c puis ax + b = cx + d, et mettre un petit problème en équation.",
  lecon:`<p class="lede">Une équation, c'est <mark>une balance en équilibre</mark> : ce que tu fais à gauche, tu dois le faire aussi à droite. Le but : isoler x tout seul d'un côté.</p>
<div class="etapes">
<p><strong>Exemple détaillé :</strong> résous 5x + 7 = 22.</p>
<p>Étape 1 — je retire 7 des deux côtés : 5x + 7 − 7 = 22 − 7, donc 5x = 15.</p>
<p>Étape 2 — je divise les deux côtés par 5 : x = 15 ÷ 5, donc <strong>x = 3</strong>.</p>
<p>Étape 3 — je vérifie : 5 × 3 + 7 = 15 + 7 = 22. C'est bon !</p>
<p><strong>Avec des x des deux côtés :</strong> résous 7x + 3 = 4x + 18.</p>
<p>Je regroupe les x à gauche en retirant 4x des deux côtés : 3x + 3 = 18. Puis je retire 3 : 3x = 15. Enfin je divise par 3 : <strong>x = 5</strong>.</p>
</div>
<p>Beaucoup de problèmes concrets se traduisent en équation : « je pense à un nombre, je le multiplie par 3, j'ajoute 7 et j'obtiens 25 » s'écrit 3x + 7 = 25, donc x = 6.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Ordre de résolution : 1) regrouper les x d'un seul côté ; 2) regrouper les nombres de l'autre ; 3) diviser par le coefficient de x. <mark>Toujours la même opération des deux côtés.</mark></p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie systématiquement ta solution en la remplaçant dans l'équation de départ. Trente secondes qui garantissent ta réponse — un réflexe d'or pour les concours.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Quand un terme « change de côté », son signe change : dans 3x = 18 − 3x… non ! On ne déplace pas au hasard : on <strong>ajoute ou retire la même chose des deux côtés</strong>, et le changement de signe en découle naturellement.</p></div>`,
  gen(level,R){
    if(level===1){
      var x0=R.int(2,12),a=R.int(2,9),minus=R.int(0,1)===1,b,c,qs;
      if(minus){b=R.int(1,a*x0-1);c=a*x0-b;qs=a+'x − '+b+' = '+c;}
      else{b=R.int(1,20);c=a*x0+b;qs=a+'x + '+b+' = '+c;}
      var ans=String(x0);
      return {q:'Résous : '+qs,a:ans,accept:['x='+x0,'x = '+x0],choix:null,
        expl:'On '+(minus?'ajoute':'retire')+' '+b+' des deux côtés : '+a+'x = '+(a*x0)+'. Puis on divise par '+a+' : x = '+x0+'.'};
    }
    if(level===2){
      var x1=R.int(-6,8),a1=R.int(3,9),c1=R.int(1,a1-1),b1=R.int(1,15);
      var d1=(a1-c1)*x1+b1;
      var rhs=c1+'x '+(d1<0?'− ':'+ ')+Math.abs(d1);
      var ans1=String(x1);
      return {q:'Résous : '+a1+'x + '+b1+' = '+rhs,a:ans1,accept:(acceptFor(ans1)||[]).concat(['x='+x1,'x = '+x1]),choix:null,
        expl:'On retire '+c1+'x des deux côtés : '+(a1-c1)+'x + '+b1+' = '+fr(d1)+'. Puis '+(a1-c1)+'x = '+fr(d1-b1)+', donc x = '+fr(x1)+'.'};
    }
    var t=R.int(1,4);
    if(t===1){
      var n2=R.int(3,12),a2=R.int(2,6),b2=R.int(1,15),c2=a2*n2+b2;
      var ans2=String(n2);
      return {q:'Je pense à un nombre. Je le multiplie par '+a2+', j’ajoute '+b2+' et j’obtiens '+c2+'. Quel est ce nombre ?',
        a:ans2,accept:['x='+n2,'x = '+n2],choix:null,
        expl:'L’équation est '+a2+'x + '+b2+' = '+c2+'. Donc '+a2+'x = '+(c2-b2)+' et x = '+n2+'.'};
    }
    if(t===2){
      var f=R.int(10,40),m=R.int(8,25),k2=R.int(3,12),tt=f+m*k2;
      var ans3=String(k2);
      return {q:'Un abonnement coûte '+f+' € à l’inscription, puis '+m+' € par mois. Léo a payé '+tt+' € en tout. Pendant combien de mois a-t-il été abonné ?',
        a:ans3,accept:[k2+' mois'],choix:null,
        expl:'On résout '+f+' + '+m+'x = '+tt+' : '+m+'x = '+(tt-f)+', donc x = '+k2+' mois.'};
    }
    if(t===3){
      var l=R.int(3,10),L=l+R.int(2,8),p=2*(l+L);
      var ans4=String(L);
      return {q:'Le périmètre d’un rectangle est '+p+' cm et sa largeur mesure '+l+' cm. Quelle est sa longueur (en cm) ?',
        a:ans4,accept:[L+' cm'],choix:null,
        expl:'Périmètre = 2 × (longueur + largeur) : 2 × (x + '+l+') = '+p+', donc x + '+l+' = '+(p/2)+' et x = '+L+' cm.'};
    }
    var n5=R.int(5,40),s5=2*n5+1;
    var ans5=String(n5);
    return {q:'La somme de deux nombres entiers consécutifs est '+s5+'. Quel est le plus petit des deux ?',
      a:ans5,accept:null,choix:null,
      expl:'On pose x + (x + 1) = '+s5+', soit 2x + 1 = '+s5+'. Donc 2x = '+(s5-1)+' et x = '+n5+'.'};
  }
});

/* ===== 8. Les pourcentages ===== */
SKILLS.push({
  id:'p2-08-pourcentages',
  phase:2,
  ordre:8,
  titre:'Les pourcentages',
  objectif:"Calculer p % d'une quantité, retrouver un pourcentage, appliquer une hausse ou une baisse.",
  lecon:`<p class="lede">Un pourcentage, c'est une fraction sur 100 : <mark>p % = p/100</mark>. « Prendre p % de quelque chose », c'est simplement <mark>multiplier par p/100</mark>.</p>
<div class="etapes">
<p><strong>Exemple détaillé 1 — calculer un pourcentage :</strong> combien font 30 % de 50 € ?</p>
<p>30 % de 50 = (30/100) × 50 = 0,30 × 50 = <strong>15 €</strong>.</p>
<p><strong>Exemple détaillé 2 — retrouver le pourcentage :</strong> dans une classe de 40 élèves, 14 sont demi-pensionnaires. Quel pourcentage ?</p>
<p>On calcule la proportion : 14/40 = 0,35. Puis on multiplie par 100 : 0,35 × 100 = <strong>35 %</strong>.</p>
<p><strong>Exemple détaillé 3 — appliquer une baisse :</strong> un article à 80 € est soldé à −25 %.</p>
<p>Méthode 1 : la remise vaut 25 % de 80 = 20 €, donc le prix devient 80 − 20 = 60 €.</p>
<p>Méthode 2 (plus rapide) : payer 25 % de moins, c'est payer 75 % du prix : 80 × 0,75 = <strong>60 €</strong>.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>p % de Q = Q × p/100. Pourcentage = (partie ÷ total) × 100. Hausse de p % : × (1 + p/100). Baisse de p % : × (1 − p/100).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Repères mentaux : 50 % = la moitié, 25 % = le quart, 10 % = on divise par 10, et 5 % = la moitié de 10 %. Avec ça, tu reconstruis presque tout de tête : 15 % de 60 = 6 + 3 = 9.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Une hausse de 20 % suivie d'une baisse de 20 % ne ramène PAS au prix de départ : 100 → 120 → 96. Les pourcentages successifs ne s'additionnent pas.</p></div>`,
  gen(level,R){
    if(level===1){
      var p=R.pick([5,10,20,25,50,75]),base=20*R.int(1,15);
      var v=base*p/100,ans=String(v);
      return {q:'Calcule '+p+' % de '+base+'.',a:ans,accept:acceptFor(ans),choix:null,
        expl:p+' % de '+base+' = '+base+' × '+p+'/100 = '+fr(v)+'.'};
    }
    if(level===2){
      var whole=20*R.pick([1,2,3,4,5,10]),pc=5*R.int(2,18);
      var part=whole*pc/100;
      var ctx=R.pick([
        'Dans une classe de '+whole+' élèves, '+part+' ont eu la moyenne.',
        'Sur '+whole+' billets mis en vente, '+part+' ont été vendus le premier jour.',
        'Un questionnaire a reçu '+whole+' réponses, dont '+part+' positives.'
      ]);
      var ans2=String(pc);
      return {q:ctx+' Quel pourcentage cela représente-t-il ?',a:ans2,accept:[pc+'%',pc+' %'],choix:null,
        expl:'Proportion : '+part+'/'+whole+' = '+fr(part/whole)+'. En pourcentage : '+fr(part/whole)+' × 100 = '+pc+' %.'};
    }
    var t=R.int(1,3),base3=20*R.int(2,20),p3=R.pick([5,10,20,25,50]);
    var delta=base3*p3/100;
    if(t===1){
      var vH=base3+delta,ansH=String(vH);
      return {q:'Un loyer de '+base3+' € augmente de '+p3+' %. Quel est le nouveau montant (en €) ?',a:ansH,accept:(acceptFor(ansH)||[]).concat([fr(vH)+' €',vH+' €']),choix:null,
        expl:'La hausse vaut '+p3+' % de '+base3+' = '+fr(delta)+' €. Nouveau montant : '+base3+' + '+fr(delta)+' = '+fr(vH)+' €. (Ou directement : '+base3+' × '+fr(1+p3/100)+'.)'};
    }
    if(t===2){
      var vB=base3-delta,ansB=String(vB);
      return {q:'Un article coûte '+base3+' €. Il est soldé à −'+p3+' %. Quel est le prix soldé (en €) ?',a:ansB,accept:(acceptFor(ansB)||[]).concat([fr(vB)+' €',vB+' €']),choix:null,
        expl:'La remise vaut '+p3+' % de '+base3+' = '+fr(delta)+' €. Prix soldé : '+base3+' − '+fr(delta)+' = '+fr(vB)+' €. (Ou : '+base3+' × '+fr(1-p3/100)+'.)'};
    }
    var ansD=String(delta);
    return {q:'Un article coûte '+base3+' € et bénéficie d’une remise de '+p3+' %. Quel est le montant de la remise (en €) ?',a:ansD,accept:(acceptFor(ansD)||[]).concat([fr(delta)+' €',delta+' €']),choix:null,
      expl:'Montant de la remise : '+p3+' % de '+base3+' = '+base3+' × '+p3+'/100 = '+fr(delta)+' €.'};
  }
});

/* ===== 9. Moyenne, médiane, étendue ===== */
SKILLS.push({
  id:'p2-09-statistiques',
  phase:2,
  ordre:9,
  titre:'Moyenne, médiane, étendue',
  objectif:"Calculer moyenne, médiane et étendue d'une petite série, et une moyenne pondérée de notes.",
  lecon:`<p class="lede">Trois nombres suffisent pour résumer une série de valeurs : <mark>la moyenne, la médiane et l'étendue</mark>. Chacun raconte quelque chose de différent.</p>
<p><strong>La moyenne</strong> = somme de toutes les valeurs ÷ nombre de valeurs. Elle « répartit équitablement » le total.</p>
<p><strong>La médiane</strong> = la valeur du milieu quand la série est <mark>rangée dans l'ordre croissant</mark>. La moitié des valeurs est en dessous, l'autre moitié au-dessus.</p>
<p><strong>L'étendue</strong> = valeur maximale − valeur minimale. Elle mesure la dispersion.</p>
<div class="etapes">
<p><strong>Exemple détaillé :</strong> série 12 ; 5 ; 17 ; 9 ; 12.</p>
<p>Moyenne : (12 + 5 + 17 + 9 + 12) ÷ 5 = 55 ÷ 5 = <strong>11</strong>.</p>
<p>Médiane : je range d'abord : 5 ; 9 ; 12 ; 12 ; 17. La valeur du milieu (la 3e sur 5) est <strong>12</strong>.</p>
<p>Étendue : 17 − 5 = <strong>12</strong>.</p>
</div>
<p><strong>Moyenne pondérée</strong> (tes moyennes de notes !) : chaque note compte avec son coefficient. On calcule (note₁ × coef₁ + note₂ × coef₂ + …) ÷ (somme des coefficients). Exemple : 12 (coef 1) et 15 (coef 3) : (12 × 1 + 15 × 3) ÷ 4 = 57 ÷ 4 = 14,25.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Moyenne = somme ÷ effectif. Médiane = valeur centrale d'une série <strong>ordonnée</strong>. Étendue = max − min. Moyenne pondérée : on divise par la somme des coefficients, pas par le nombre de notes.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie toujours que ta moyenne est comprise entre la plus petite et la plus grande valeur de la série. Sinon, il y a une erreur de calcul quelque part.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Chercher la médiane sans avoir rangé la série est l'erreur numéro 1. On ordonne d'abord, on prend le milieu ensuite.</p></div>`,
  gen(level,R){
    if(level===1){
      var t=R.int(1,2);
      if(t===1){
        var m=R.int(10,15);
        var e1=R.int(-3,3),e2=R.int(-3,3),e3=R.int(-3,3),e4=-(e1+e2+e3);
        var vals=R.shuffle([m+e1,m+e2,m+e3,m+e4]);
        var ans=String(m);
        return {q:'Calcule la moyenne de la série : '+vals.join(' ; '),a:ans,accept:acceptFor(ans),choix:null,
          expl:'Somme : '+vals.join(' + ')+' = '+(4*m)+'. Moyenne : '+(4*m)+' ÷ 4 = '+m+'.'};
      }
      var arr=[],i;
      for(i=0;i<5;i++)arr.push(R.int(2,30));
      var mx=Math.max.apply(null,arr),mn=Math.min.apply(null,arr);
      if(mx===mn){arr[0]=mn+4;mx=Math.max.apply(null,arr);}
      var ansE=String(mx-mn);
      return {q:'Calcule l’étendue de la série : '+arr.join(' ; '),a:ansE,accept:null,choix:null,
        expl:'Étendue = max − min = '+mx+' − '+mn+' = '+(mx-mn)+'.'};
    }
    if(level===2){
      var t2=R.int(1,2);
      if(t2===1){
        var med=[],j;
        for(j=0;j<5;j++)med.push(R.int(1,20));
        var sorted=med.slice().sort(function(x,y){return x-y;});
        var ansM=String(sorted[2]);
        return {q:'Quelle est la médiane de la série : '+med.join(' ; ')+' ?',a:ansM,accept:null,choix:null,
          expl:'On range la série : '+sorted.join(' ; ')+'. La valeur du milieu (3e sur 5) est '+sorted[2]+'.'};
      }
      var v1=R.int(6,14),v2=R.int(6,14),v3=R.int(6,14),v4=R.int(6,14);
      var S=v1+v2+v3+v4,r=((S-2)%4+4)%4;
      v1=v1-r;S=S-r;
      var moy=S/4,vals2=R.shuffle([v1,v2,v3,v4]);
      var ansMo=fmt(moy);
      return {q:'Calcule la moyenne de la série : '+vals2.join(' ; ')+'\n(réponse décimale possible)',a:ansMo,accept:acceptFor(ansMo),choix:null,
        expl:'Somme : '+S+'. Moyenne : '+S+' ÷ 4 = '+fr(moy)+'.'};
    }
    var pool=R.pick([[1,1,2],[1,2,2],[1,1,3],[1,4,5]]);
    var total=pool[0]+pool[1]+pool[2];
    var n1=R.int(10,19),n2=R.int(6,18),n3=R.int(6,18);
    var S3=n1*pool[0]+n2*pool[1]+n3*pool[2];
    var want=(total%2===0&&R.int(0,1)===1)?(total/2):0;
    var r3=((S3-want)%total+total)%total;
    n1=n1-r3;S3=S3-r3;
    var moy3=S3/total,ans3=fmt(moy3);
    return {q:'Tes notes du trimestre : '+n1+' (coefficient '+pool[0]+'), '+n2+' (coefficient '+pool[1]+'), '+n3+' (coefficient '+pool[2]+'). Calcule ta moyenne pondérée.',
      a:ans3,accept:acceptFor(ans3),choix:null,
      expl:'Somme pondérée : '+n1+' × '+pool[0]+' + '+n2+' × '+pool[1]+' + '+n3+' × '+pool[2]+' = '+S3+'. On divise par la somme des coefficients ('+total+') : '+fr(moy3)+'.'};
  }
});

/* ===== 10. Problèmes à étapes ===== */
SKILLS.push({
  id:'p2-10-problemes',
  phase:2,
  ordre:10,
  titre:'Problèmes à étapes',
  objectif:"Résoudre des problèmes concrets en 2 ou 3 étapes en mobilisant tous les acquis du collège.",
  lecon:`<p class="lede">Un problème à étapes n'est jamais difficile en entier : il est fait de <mark>petits calculs simples mis bout à bout</mark>. Tout l'art est de le découper.</p>
<p>La méthode en 4 temps :</p>
<p>1. <strong>Lire deux fois</strong> l'énoncé et souligner la question exacte.<br>
2. <strong>Lister les étapes</strong> : de quoi ai-je besoin avant de pouvoir répondre ?<br>
3. <strong>Poser chaque calcul</strong> avec une petite phrase (« prix après remise = … »).<br>
4. <strong>Vérifier la vraisemblance</strong> : un prix soldé doit être plus petit que le prix de départ !</p>
<div class="etapes">
<p><strong>Exemple entièrement détaillé :</strong> un jean coûte 80 €. Il est soldé à −25 %, puis Léa utilise un bon de 5 €. Combien paie-t-elle ?</p>
<p>Étape 1 — la remise : 25 % de 80 = 80 × 25/100 = 20 €.</p>
<p>Étape 2 — le prix soldé : 80 − 20 = 60 €.</p>
<p>Étape 3 — le bon d'achat : 60 − 5 = <strong>55 €</strong>.</p>
<p>Vérification : 55 € est bien inférieur à 80 €, et l'ordre de grandeur est cohérent.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Une étape = un calcul = une phrase. On n'enchaîne jamais deux idées dans un même calcul : c'est comme ça qu'on sème les erreurs. <mark>Découpe, calcule, vérifie.</mark></p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Avant de calculer, estime l'ordre de grandeur de la réponse (« ça devrait faire autour de 50 € »). Si ton résultat final en est loin, tu sauras qu'une étape a déraillé — réflexe très payant au brevet comme aux concours.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Réponds à la question posée, pas à une autre ! Si on demande « combien lui rend-on ? », la réponse n'est pas le total des achats mais la monnaie. Relis la question avant d'écrire ta conclusion.</p></div>`,
  gen(level,R){
    if(level===1){
      var t=R.int(1,3);
      if(t===1){
        var n1=R.int(2,3),a=R.int(2,6),n2=R.int(2,3),b=R.int(2,5);
        var total=n1*a+n2*b,rendu=50-total;
        var ans=String(rendu);
        return {q:'Sami achète '+n1+' cahiers à '+a+' € pièce et '+n2+' stylos à '+b+' € pièce. Il paie avec un billet de 50 €. Combien lui rend-on (en €) ?',
          a:ans,accept:(acceptFor(ans)||[]).concat([rendu+' €']),choix:null,
          expl:'Total des achats : '+n1+' × '+a+' + '+n2+' × '+b+' = '+total+' €. Monnaie rendue : 50 − '+total+' = '+rendu+' €.'};
      }
      if(t===2){
        var u=R.int(2,5),p1=R.int(3,6),q1=p1+R.int(2,5),c1=u*p1;
        var ans2=String(u*q1);
        return {q:p1+' cahiers identiques coûtent '+c1+' €. Combien coûtent '+q1+' cahiers (en €) ?',
          a:ans2,accept:(acceptFor(ans2)||[]).concat([(u*q1)+' €']),choix:null,
          expl:'Prix d’un cahier : '+c1+' ÷ '+p1+' = '+u+' €. Prix de '+q1+' cahiers : '+u+' × '+q1+' = '+(u*q1)+' €.'};
      }
      var nb=R.int(20,40),des=R.int(3,10),mon=R.int(2,9);
      var ans3=String(nb-des+mon);
      return {q:'Un bus part avec '+nb+' passagers. Au premier arrêt, '+des+' personnes descendent et '+mon+' montent. Combien y a-t-il de passagers dans le bus ?',
        a:ans3,accept:null,choix:null,
        expl:'Après les descentes : '+nb+' − '+des+' = '+(nb-des)+'. Après les montées : '+(nb-des)+' + '+mon+' = '+(nb-des+mon)+' passagers.'};
    }
    if(level===2){
      var t2=R.int(1,3);
      if(t2===1){
        var prix=20*R.int(3,10),pc=R.pick([10,20,25,50]),bon=R.pick([0,5,10]);
        var rem=prix*pc/100,fin=prix-rem-bon;
        var ans4=String(fin);
        var qtxt='Un blouson coûte '+prix+' €. Il est soldé à −'+pc+' %'+(bon>0?', puis la cliente utilise un bon d’achat de '+bon+' €':'')+'. Quel est le prix payé (en €) ?';
        return {q:qtxt,a:ans4,accept:(acceptFor(ans4)||[]).concat([fin+' €']),choix:null,
          expl:'Remise : '+pc+' % de '+prix+' = '+rem+' €. Prix soldé : '+prix+' − '+rem+' = '+(prix-rem)+' €'+(bon>0?'. Après le bon : '+(prix-rem)+' − '+bon+' = '+fin+' €':'')+'.'};
      }
      if(t2===2){
        var part=R.int(9,25),red=R.pick([6,9,12]),fac=3*part+red;
        var ans5=String(part);
        return {q:'Trois amis dînent au restaurant. La facture est de '+fac+' €. Le serveur leur accorde une réduction de '+red+' €, puis ils partagent le reste en trois parts égales. Combien paie chacun (en €) ?',
          a:ans5,accept:(acceptFor(ans5)||[]).concat([part+' €']),choix:null,
          expl:'Après réduction : '+fac+' − '+red+' = '+(3*part)+' €. Chacun paie '+(3*part)+' ÷ 3 = '+part+' €.'};
      }
      var l6=R.int(4,8),d6=R.pick([50,150,200,250,300]);
      var v6=l6*d6/100,ans6=fmt(v6);
      return {q:'Une voiture consomme '+l6+' litres d’essence pour 100 km. Combien de litres consomme-t-elle pour '+d6+' km ?',
        a:ans6,accept:(acceptFor(ans6)||[]).concat([fr(v6)+' L',ans6+' L']),choix:null,
        expl:d6+' km = '+fr(d6/100)+' fois 100 km. Consommation : '+l6+' × '+fr(d6/100)+' = '+fr(v6)+' litres.'};
    }
    var t3=R.int(1,3);
    if(t3===1){
      var k=R.int(3,8),n7=40*k,occ=30*k,p7=R.pick([10,20,30,40,50,60]);
      var enf=occ*p7/100,ans7=String(enf);
      return {q:'Un cinéma compte '+n7+' places. Les 3/4 des places sont occupées. Parmi les spectateurs, '+p7+' % sont des enfants. Combien y a-t-il d’enfants ?',
        a:ans7,accept:null,choix:null,
        expl:'Spectateurs : 3/4 de '+n7+' = '+occ+'. Enfants : '+p7+' % de '+occ+' = '+enf+'.'};
    }
    if(t3===2){
      var s8=400*R.int(3,6),c8=100*R.int(2,4);
      var loyer=s8/4,reste=s8-loyer-c8;
      var ans8=String(reste);
      return {q:'Marc gagne '+s8+' € par mois. Il consacre 25 % de son salaire au loyer et dépense '+c8+' € en courses. Combien lui reste-t-il (en €) ?',
        a:ans8,accept:(acceptFor(ans8)||[]).concat([reste+' €']),choix:null,
        expl:'Loyer : 25 % de '+s8+' = '+loyer+' €. Reste : '+s8+' − '+loyer+' − '+c8+' = '+reste+' €.'};
    }
    var n9=R.int(6,12),a9=10*R.int(2,5),p9=R.pick([10,20,50]),f9=R.int(5,15);
    var tot9=n9*a9,apres=tot9*(100-p9)/100,paye=apres+f9;
    var ans9=String(paye);
    return {q:'Un club commande '+n9+' maillots à '+a9+' € pièce. Le vendeur accorde une remise de '+p9+' % sur le total, puis facture '+f9+' € de livraison. Quel est le montant payé (en €) ?',
      a:ans9,accept:(acceptFor(ans9)||[]).concat([paye+' €']),choix:null,
      expl:'Total : '+n9+' × '+a9+' = '+tot9+' €. Après la remise de '+p9+' % : '+tot9+' × '+fr((100-p9)/100)+' = '+apres+' €. Avec la livraison : '+apres+' + '+f9+' = '+paye+' €.'};
  }
});

})();
