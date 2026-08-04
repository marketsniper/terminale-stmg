(function(){

// ---------- Helpers partagés ----------
function fr(x){ return String(x).replace('.', ','); }
function dec(x){ return String(Math.round(x*100)/100); }
function fmtPct(v){ return (v>0?'+':(v<0?'−':'')) + Math.abs(v) + ' %'; }
function pctAcc(t){
  var ab = String(Math.abs(t));
  if(t>=0) return ['+'+ab, ab+' %', ab+'%', '+'+ab+' %', '+'+ab+'%'];
  return ['−'+ab, '-'+ab+' %', '-'+ab+'%', '−'+ab+' %', '−'+ab+'%'];
}
function pol(a,b,c){
  var s = (a===1?'':(a===-1?'−':String(a).replace('-','−'))) + 'x²';
  s += ' ' + (b>=0?'+':'−') + ' ' + Math.abs(b) + 'x';
  s += ' ' + (c>=0?'+':'−') + ' ' + Math.abs(c);
  return s;
}
function neg(n){ return n<0 ? '(−'+Math.abs(n)+')' : String(n); }

// =====================================================
// p7-01 — Automatismes format bac
// =====================================================
SKILLS.push({
  id: 'p7-01-automatismes-bac',
  phase: 7,
  ordre: 1,
  titre: 'Automatismes format bac',
  objectif: "Répondre vite et juste aux questions d'automatismes de l'épreuve : pourcentages, évolutions, lectures directes.",
  lecon: `<p class="lede">Le jour du bac, l'épreuve démarre par une salve de questions d'automatismes : des calculs rapides, sans calculatrice. Ce n'est pas une question d'intelligence, c'est une question de réflexes — et les réflexes, ça se construit en s'entraînant.</p>
<p>Les stars de cette partie, ce sont les pourcentages sous toutes leurs formes. Voici la méthode sur l'exemple le plus classique : un prix passe de 40 € à 50 €, quel est le taux d'évolution ?</p>
<div class="etapes">
<p>1. Je calcule la variation : 50 − 40 = 10.</p>
<p>2. Je divise par la valeur de <strong>départ</strong> : 10 ÷ 40 = 0,25.</p>
<p>3. Je convertis en pourcentage : 0,25 = 25 %. Le prix a augmenté de <mark>+25 %</mark>.</p>
</div>
<p>Autre réflexe central : le coefficient multiplicateur (CM). Augmenter de 25 %, c'est multiplier par 1,25. Baisser de 25 %, c'est multiplier par 0,75. Ce coefficient permet tout : enchaîner des évolutions (on multiplie les CM entre eux) ou retrouver un prix initial (on divise par le CM).</p>
<div class="formule"><p>Hausse de t % : CM = 1 + t/100 &nbsp;•&nbsp; Baisse de t % : CM = 1 − t/100</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Deux évolutions successives ne s'additionnent <strong>jamais</strong>. +20 % puis −10 %, ce n'est pas +10 % : c'est 1,2 × 0,9 = 1,08, donc <mark>+8 %</mark>.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Taux d'évolution = (arrivée − départ) ÷ départ. Coefficient multiplicateur = 1 + t/100. Évolutions successives : on <mark>multiplie les coefficients</mark>, on n'additionne pas les taux.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour calculer un pourcentage de tête, pars de 10 % (on décale juste la virgule). 30 % de 250 ? 10 % = 25, donc 30 % = 75. Et 5 %, c'est la moitié de 10 %.</p></div>`,
  gen(level, R){
    if(level===1){
      var type = R.int(1,4);
      if(type===1){
        var p = R.pick([5,10,20,25,30,50]);
        var m = 20*R.int(2,15);
        var res = m*p/100;
        var q = R.pick([
          'Calcule ' + p + ' % de ' + m + '.',
          'Un article coûte ' + m + ' €. Il est soldé à −' + p + ' %. Quel est le montant de la remise, en € ?',
          'Dans un lycée de ' + m + ' élèves, ' + p + ' % sont en terminale. Combien d\'élèves cela représente-t-il ?'
        ]);
        return {q:q, a:String(res), accept:null, choix:null,
          expl:p + ' % de ' + m + ' = ' + m + ' × ' + p + '/100 = ' + res + '.'};
      }
      if(type===2){
        var f = R.pick([['1/2',50],['1/4',25],['3/4',75],['1/5',20],['2/5',40],['1/10',10],['3/10',30],['1/20',5]]);
        return {q:'Écris la proportion ' + f[0] + ' sous forme de pourcentage.',
          a:String(f[1]), accept:[f[1]+' %', f[1]+'%'], choix:null,
          expl:f[0] + ' = ' + fr(dec(f[1]/100)) + ' = ' + f[1] + ' %.'};
      }
      if(type===3){
        var N = R.pick([10,20,25,50]);
        var k = R.int(2, N-2);
        var pct = k*(100/N);
        return {q:'Dans un groupe de ' + N + ' personnes, ' + k + ' sont abonnées à un service de streaming. Quel pourcentage du groupe cela représente-t-il ?',
          a:String(pct), accept:[pct+' %', pct+'%', dec(pct/100)], choix:null,
          expl:k + '/' + N + ' = ' + fr(dec(pct/100)) + ' = ' + pct + ' %.'};
      }
      var p1 = R.pick([5,10,20,25,50,75]);
      var sens = R.pick(['hausse','baisse']);
      var cm = sens==='hausse' ? (100+p1)/100 : (100-p1)/100;
      var aStr = dec(cm);
      var acc = (aStr.indexOf('.')>-1 && aStr.split('.')[1].length===1) ? [aStr+'0'] : null;
      return {q:'Quel est le coefficient multiplicateur associé à une ' + sens + ' de ' + p1 + ' % ?',
        a:aStr, accept:acc, choix:null,
        expl:'Une ' + sens + ' de ' + p1 + ' % correspond à CM = 1 ' + (sens==='hausse'?'+':'−') + ' ' + p1 + '/100 = ' + fr(aStr) + '.'};
    }

    if(level===2){
      var type2 = R.int(1,4);
      if(type2===1){
        var old = 20*R.int(2,10);
        var t = R.pick([5,10,15,20,25,50,-5,-10,-20,-25,-50]);
        var nv = old*(100+t)/100;
        var q2 = R.pick([
          'Le prix d\'un article passe de ' + old + ' € à ' + nv + ' €. Quel est le taux d\'évolution, en % ?',
          'Le chiffre d\'affaires d\'une boutique passe de ' + old + ' milliers d\'€ à ' + nv + ' milliers d\'€. Quel est le taux d\'évolution, en % ?'
        ]);
        return {q:q2, a:String(t), accept:pctAcc(t), choix:null,
          expl:'(' + nv + ' − ' + old + ') ÷ ' + old + ' = ' + fr(dec((nv-old)/old)) + ', soit ' + fmtPct(t) + '.'};
      }
      if(type2===2){
        if(R.int(1,2)===1){
          var t2 = R.pick([5,15,20,25,40,-10,-20,-30]);
          var cm2 = fr(dec((100+t2)/100));
          return {q:'Un prix est multiplié par ' + cm2 + '. Quel est le taux d\'évolution, en % ?',
            a:String(t2), accept:pctAcc(t2), choix:null,
            expl:'CM = 1 + t/100 : ' + cm2 + ' correspond à ' + fmtPct(t2) + '.'};
        }
        var p2 = R.pick([15,35,40,60,5,45]);
        var sens2 = R.pick(['hausse','baisse']);
        var cmv = sens2==='hausse' ? (100+p2)/100 : (100-p2)/100;
        var aS = dec(cmv);
        var acc2 = (aS.indexOf('.')>-1 && aS.split('.')[1].length===1) ? [aS+'0'] : null;
        return {q:'Par quel coefficient multiplie-t-on un prix qui subit une ' + sens2 + ' de ' + p2 + ' % ?',
          a:aS, accept:acc2, choix:null,
          expl:'CM = 1 ' + (sens2==='hausse'?'+':'−') + ' ' + p2 + '/100 = ' + fr(aS) + '.'};
      }
      if(type2===3){
        var m3 = R.pick([2,3,4,5,-2,-3]);
        var b3 = R.pick([-5,-4,-3,-2,-1,1,2,3,4,5,6,8,10]);
        var x0 = R.int(2,9);
        var y = m3*x0 + b3;
        var mS = String(m3).replace('-','−');
        return {q:'Une droite passe par le point (0 ; ' + String(b3).replace('-','−') + ') et a pour coefficient directeur ' + mS + '. Quelle est la valeur de y au point d\'abscisse x = ' + x0 + ' ?',
          a:String(y), accept:null, choix:null,
          expl:'y = ' + mS + 'x ' + (b3>=0?'+ ':'− ') + Math.abs(b3) + ' : y = ' + mS + ' × ' + x0 + ' ' + (b3>=0?'+ ':'− ') + Math.abs(b3) + ' = ' + String(y).replace('-','−') + '.'};
      }
      var p4 = 5*R.int(2,18);
      var m4 = 20*R.int(3,12);
      var res4 = m4*p4/100;
      var q4 = R.pick([
        'Calcule ' + p4 + ' % de ' + m4 + '.',
        'Une entreprise compte ' + m4 + ' salariés, dont ' + p4 + ' % travaillent à temps partiel. Combien de salariés cela représente-t-il ?'
      ]);
      return {q:q4, a:String(res4), accept:null, choix:null,
        expl:p4 + ' % de ' + m4 + ' = ' + m4 + ' × ' + p4 + '/100 = ' + res4 + '. (Astuce : 10 % de ' + m4 + ' = ' + (m4/10) + '.)'};
    }

    // level 3
    var type3 = R.int(1,4);
    if(type3===1){
      var pr = R.pick([[20,-10],[10,20],[20,20],[-10,-20],[30,-10],[50,20],[-20,50],[-20,-20],[30,10],[40,-20]]);
      var p5 = pr[0], q5 = pr[1];
      var g = ((100+p5)*(100+q5) - 10000)/100;
      var s = p5+q5, prod = Math.round(p5*q5/100), h = (p5+q5)/2;
      var lab1 = p5>0 ? 'une hausse de ' + p5 + ' %' : 'une baisse de ' + (-p5) + ' %';
      var lab2 = q5>0 ? 'une hausse de ' + q5 + ' %' : 'une baisse de ' + (-q5) + ' %';
      var cm1 = fr(dec((100+p5)/100)), cm2 = fr(dec((100+q5)/100)), cmg = fr(dec((100+p5)*(100+q5)/10000));
      return {q:'Un prix subit ' + lab1 + ', puis ' + lab2 + '. Quel est le taux d\'évolution global ?',
        a:fmtPct(g), accept:null, choix:[fmtPct(g), fmtPct(s), fmtPct(prod), fmtPct(h)],
        expl:'Les taux ne s\'additionnent pas : on multiplie les coefficients. ' + cm1 + ' × ' + cm2 + ' = ' + cmg + ', soit ' + fmtPct(g) + '.'};
    }
    if(type3===2){
      var init = 20*R.int(3,12);
      var t6 = R.pick([25,50,-20,-50,10,-25,20]);
      var nv6 = init*(100+t6)/100;
      var lab6 = t6>0 ? 'une hausse de ' + t6 + ' %' : 'une baisse de ' + (-t6) + ' %';
      var cm6 = fr(dec((100+t6)/100));
      return {q:'Après ' + lab6 + ', un article coûte ' + nv6 + ' €. Quel était son prix initial, en € ?',
        a:String(init), accept:null, choix:null,
        expl:'On divise par le coefficient : ' + nv6 + ' ÷ ' + cm6 + ' = ' + init + ' €. (Surtout pas ' + nv6 + ' moins ' + Math.abs(t6) + ' % !)'};
    }
    if(type3===3){
      var rec = R.pick([
        {t:'une hausse de 25 %', a:'−20 %', d:['−25 %','−15 %','+20 %'], e:'× 1,25 puis × 0,8 = × 1 : il faut −20 %, car 0,8 = 1 ÷ 1,25.'},
        {t:'une hausse de 100 %', a:'−50 %', d:['−100 %','−75 %','+50 %'], e:'× 2 puis × 0,5 = × 1 : il faut −50 %, car 0,5 = 1 ÷ 2.'},
        {t:'une baisse de 20 %', a:'+25 %', d:['+20 %','+30 %','−25 %'], e:'× 0,8 puis × 1,25 = × 1 : il faut +25 %, car 1,25 = 1 ÷ 0,8.'},
        {t:'une baisse de 50 %', a:'+100 %', d:['+50 %','+200 %','−100 %'], e:'× 0,5 puis × 2 = × 1 : il faut +100 %, car après −50 % il faut doubler.'}
      ]);
      return {q:'Un prix subit ' + rec.t + '. Quel taux d\'évolution le ramène ensuite à sa valeur initiale ?',
        a:rec.a, accept:null, choix:[rec.a, rec.d[0], rec.d[1], rec.d[2]],
        expl:rec.e};
    }
    var mu = R.pick([
      {q:'Multiplier un prix par 1,5 revient à appliquer quelle évolution, en % ?', a:'50', acc:['+50','50 %','50%','+50 %','+50%'], e:'CM = 1,5 = 1 + 50/100 : c\'est une hausse de 50 %.'},
      {q:'Multiplier un prix par 2 revient à l\'augmenter de quel pourcentage ?', a:'100', acc:['+100','100 %','100%','+100 %','+100%'], e:'Doubler, c\'est CM = 2 = 1 + 100/100, soit +100 %.'},
      {q:'Augmenter une quantité de 300 %, c\'est la multiplier par combien ?', a:'4', acc:null, e:'CM = 1 + 300/100 = 4. On multiplie par 4, pas par 3.'},
      {q:'Diviser un prix par 2 revient à appliquer quelle évolution, en % ?', a:'-50', acc:['−50','-50 %','-50%','−50 %','−50%'], e:'Diviser par 2, c\'est × 0,5 = 1 − 50/100, soit −50 %.'},
      {q:'Multiplier un prix par 0,7 revient à appliquer quelle évolution, en % ?', a:'-30', acc:['−30','-30 %','-30%','−30 %','−30%'], e:'CM = 0,7 = 1 − 30/100 : c\'est une baisse de 30 %.'},
      {q:'Multiplier un prix par 1,05 revient à appliquer quelle évolution, en % ?', a:'5', acc:['+5','5 %','5%','+5 %','+5%'], e:'CM = 1,05 = 1 + 5/100, soit +5 %.'}
    ]);
    return {q:mu.q, a:mu.a, accept:mu.acc, choix:null, expl:mu.e};
  }
});

// =====================================================
// p7-02 — Révision suites et fonctions
// =====================================================
SKILLS.push({
  id: 'p7-02-revision-analyse',
  phase: 7,
  ordre: 2,
  titre: 'Révision suites et fonctions',
  objectif: "Mobiliser suites, dérivées et variations dans des situations de gestion, comme le jour du bac.",
  lecon: `<p class="lede">Bonne nouvelle : toute la partie « analyse » du bac tient en trois réflexes. Reconnaître le type de suite, savoir dériver, et lire le signe de la dérivée. On révise les trois d'un coup.</p>
<p><strong>Réflexe 1 — les suites.</strong> On ajoute toujours le même nombre ? Suite <mark>arithmétique</mark> de raison r, et u<sub>n</sub> = u<sub>0</sub> + n × r. On multiplie toujours par le même nombre ? Suite <mark>géométrique</mark> de raison q, et v<sub>n</sub> = v<sub>0</sub> × q<sup>n</sup>. En gestion, « +5 % par an » signifie géométrique de raison 1,05.</p>
<p><strong>Réflexe 2 — dériver.</strong></p>
<div class="formule"><p>(x²)' = 2x &nbsp;•&nbsp; (ax² + bx + c)' = 2ax + b &nbsp;•&nbsp; une constante seule disparaît</p></div>
<p><strong>Réflexe 3 — le signe de la dérivée</strong> donne les variations de la fonction. Exemple type du bac : une entreprise a un bénéfice B(x) = −2x² + 80x − 200 pour x objets produits.</p>
<div class="etapes">
<p>1. Je dérive : B'(x) = −4x + 80.</p>
<p>2. Je cherche où B'(x) = 0 : −4x + 80 = 0, donc x = 20.</p>
<p>3. Signe : avant 20, B'(x) &gt; 0 donc B monte ; après 20, B'(x) &lt; 0 donc B descend.</p>
<p>4. Conclusion : le bénéfice est <mark>maximal pour 20 objets</mark>, et il vaut B(20) = −800 + 1600 − 200 = 600 €.</p>
</div>
<div class="box piege"><p class="box-t">Piège</p><p>Dans u<sub>n</sub> = u<sub>0</sub> + n × r, le n compte les <strong>étapes depuis le départ</strong>. De 2020 à 2026, il y a n = 6 étapes, pas 7.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Arithmétique : + r, donc u<sub>n</sub> = u<sub>0</sub> + nr. Géométrique : × q, donc v<sub>n</sub> = v<sub>0</sub> × q<sup>n</sup>. Et f' positive = f croissante, f' négative = f décroissante.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Le maximum d'un bénéfice se trouve toujours là où B'(x) s'annule en passant de + à −. Commence chaque exercice par « je dérive » : tu seras déjà à mi-chemin.</p></div>`,
  gen(level, R){
    if(level===1){
      var type = R.int(1,3);
      if(type===1){
        var r = R.pick([5,10,15,20,25,-5,-10]);
        var u0 = (r<0) ? 10*R.int(12,30) : 10*R.int(3,20);
        var n = R.int(4,8);
        var un = u0 + n*r;
        if(R.int(1,2)===1){
          return {q:'La suite (un) est arithmétique de premier terme u0 = ' + u0 + ' et de raison r = ' + String(r).replace('-','−') + '. Calcule u' + n + '.',
            a:String(un), accept:null, choix:null,
            expl:'un = u0 + n × r : u' + n + ' = ' + u0 + ' + ' + n + ' × ' + neg(r) + ' = ' + un + '.'};
        }
        var verbe = r>0 ? 'gagne ' + r : 'perd ' + (-r);
        return {q:'Un club compte ' + u0 + ' adhérents en 2020 et ' + verbe + ' adhérents chaque année. Combien d\'adhérents compte-t-il en ' + (2020+n) + ' ?',
          a:String(un), accept:null, choix:null,
          expl:'Suite arithmétique : de 2020 à ' + (2020+n) + ', il y a ' + n + ' étapes. ' + u0 + ' + ' + n + ' × ' + neg(r) + ' = ' + un + '.'};
      }
      if(type===2){
        var qr = R.pick([2,3,10]);
        var k = R.int(2,5);
        var vk = R.int(2,12);
        var step = R.pick([1,2]);
        var ans = vk * Math.pow(qr, step);
        var e = 'On multiplie par ' + qr + ' à chaque rang : v' + (k+1) + ' = ' + (vk*qr);
        if(step===2) e += ', puis v' + (k+2) + ' = ' + ans;
        e += '.';
        return {q:'La suite (vn) est géométrique de raison q = ' + qr + ' et v' + k + ' = ' + vk + '. Calcule v' + (k+step) + '.',
          a:String(ans), accept:null, choix:null, expl:e};
      }
      var a1 = R.pick([1,2,3]);
      var b1 = R.pick([2,3,4,5,-2,-3,-4]);
      var c1 = R.pick([1,2,3,5,6,-2,-4]);
      var x1 = R.int(1,4);
      var f1 = a1*x1*x1 + b1*x1 + c1;
      return {q:'Soit f(x) = ' + pol(a1,b1,c1) + '. Calcule f(' + x1 + ').',
        a:String(f1), accept:null, choix:null,
        expl:'f(' + x1 + ') = ' + a1 + ' × ' + x1 + '² + ' + neg(b1) + ' × ' + x1 + ' + ' + neg(c1) + ' = ' + (a1*x1*x1) + ' + ' + neg(b1*x1) + ' + ' + neg(c1) + ' = ' + f1 + '.'};
    }

    if(level===2){
      var type2 = R.int(1,4);
      if(type2===1){
        var a2 = R.pick([1,2,3,-2]);
        var b2 = R.pick([2,3,4,5,6,-3,-4,-6]);
        var c2 = R.pick([1,2,5,-2,-5,7]);
        var x2 = R.int(1,5);
        var ans2 = 2*a2*x2 + b2;
        return {q:'Soit f(x) = ' + pol(a2,b2,c2) + '. Calcule f\'(' + x2 + ').',
          a:String(ans2), accept:null, choix:null,
          expl:'f\'(x) = ' + String(2*a2).replace('-','−') + 'x ' + (b2>=0?'+ ':'− ') + Math.abs(b2) + ' (la constante disparaît). f\'(' + x2 + ') = ' + String(2*a2).replace('-','−') + ' × ' + x2 + ' ' + (b2>=0?'+ ':'− ') + Math.abs(b2) + ' = ' + String(ans2).replace('-','−') + '.'};
      }
      if(type2===2){
        var a3 = R.pick([2,3,4,5]);
        var b3 = R.int(2,9);
        var c3 = R.pick([-8,-5,-3,-2,2,3,4,6,7]);
        var bon = (2*a3) + 'x + ' + b3;
        return {q:'Soit f(x) = ' + pol(a3,b3,c3) + '. Quelle est sa dérivée f\'(x) ?',
          a:bon, accept:null,
          choix:[bon, a3 + 'x + ' + b3, (2*a3) + 'x', (2*a3) + 'x² + ' + b3],
          expl:'(ax²)\' = 2ax, (bx)\' = b et la constante disparaît : f\'(x) = ' + bon + '.'};
      }
      if(type2===3){
        var co = R.pick([[100,20,2,144],[100,20,3,172.8],[200,50,2,450],[40,50,3,135],[500,10,2,605],[80,25,2,125],[1000,10,3,1331],[400,5,2,441]]);
        var v0 = co[0], t = co[1], n3 = co[2], res = co[3];
        var cm = fr(dec(1 + t/100));
        var q3 = R.pick([
          'Un capital de ' + v0 + ' € augmente de ' + t + ' % par an. Quelle est sa valeur, en €, après ' + n3 + ' ans ?',
          'Le chiffre d\'affaires d\'une boutique est de ' + v0 + ' milliers d\'€ et augmente de ' + t + ' % par an. Que vaudra-t-il, en milliers d\'€, dans ' + n3 + ' ans ?'
        ]);
        return {q:q3, a:dec(res), accept:null, choix:null,
          expl:'Suite géométrique de raison ' + cm + ' : ' + v0 + ' × ' + cm + '^' + n3 + ' = ' + fr(dec(res)) + '.'};
      }
      var pos = R.pick([true,false]);
      var a4 = R.pick([2,3,4,5]);
      var xs = R.int(2,9);
      var M = xs + R.int(3,8);
      var dstr = pos ? ('−' + a4 + 'x + ' + (a4*xs)) : (a4 + 'x − ' + (a4*xs));
      var mont = 'f est croissante puis décroissante';
      var desc = 'f est décroissante puis croissante';
      var correct = pos ? mont : desc;
      return {q:'Sur [0 ; ' + M + '], la dérivée d\'une fonction f est f\'(x) = ' + dstr + '. Que peut-on dire des variations de f ?',
        a:correct, accept:null,
        choix:[mont, desc, 'f est croissante sur tout [0 ; ' + M + ']', 'f est décroissante sur tout [0 ; ' + M + ']'],
        expl:'f\'(x) = 0 pour x = ' + xs + '. Avant, f\' est ' + (pos?'positive (f croissante)':'négative (f décroissante)') + ' ; après, c\'est l\'inverse.'};
    }

    // level 3
    var type3 = R.int(1,4);
    if(type3===1){
      var a5 = R.pick([1,2,5]);
      var xm = R.int(5,30);
      var b5 = 2*a5*xm;
      var c5 = 50*R.int(2,10);
      var aStr = (a5===1?'−':'−'+a5);
      return {q:'Une entreprise fabrique x objets par jour. Son bénéfice, en €, est B(x) = ' + aStr + 'x² + ' + b5 + 'x − ' + c5 + '. Combien d\'objets doit-elle produire pour que le bénéfice soit maximal ?',
        a:String(xm), accept:null, choix:null,
        expl:'B\'(x) = −' + (2*a5) + 'x + ' + b5 + ', qui s\'annule pour x = ' + b5 + ' ÷ ' + (2*a5) + ' = ' + xm + '. B croît avant, décroît après : maximum pour ' + xm + ' objets.'};
    }
    if(type3===2){
      var u0b = 100*R.int(2,6);
      var rb = R.pick([50,100,150,200]);
      var kb = R.int(4,9);
      var S = u0b + rb*kb;
      if(R.int(1,2)===1){
        return {q:'En janvier (mois 0), une salle de sport compte ' + u0b + ' abonnés. Chaque mois, elle gagne ' + rb + ' abonnés. À partir de quel mois n le nombre d\'abonnés atteint-il ' + S + ' ?',
          a:String(kb), accept:null, choix:null,
          expl:'un = ' + u0b + ' + ' + rb + 'n. On veut ' + u0b + ' + ' + rb + 'n ≥ ' + S + ', donc n ≥ ' + (S-u0b) + ' ÷ ' + rb + ' = ' + kb + '.'};
      }
      return {q:'La suite (un) est arithmétique : u0 = ' + u0b + ' et r = ' + rb + '. À partir de quel rang n a-t-on un ≥ ' + S + ' ?',
        a:String(kb), accept:null, choix:null,
        expl:'un = u0 + n × r = ' + u0b + ' + ' + rb + 'n ≥ ' + S + ' donne n ≥ ' + (S-u0b) + '/' + rb + ' = ' + kb + '.'};
    }
    if(type3===3){
      var qq = R.pick([2,3]);
      var v0c = qq===2 ? R.pick([5,10,20]) : R.pick([2,5,10]);
      var nc = qq===2 ? R.int(3,6) : R.int(2,4);
      var Sc = v0c * Math.pow(qq, nc);
      var seq = String(v0c), val = v0c;
      for(var i=0;i<nc;i++){ val = val*qq; seq += ' → ' + val; }
      var verbe2 = qq===2 ? 'double' : 'triple';
      return {q:'Le nombre de vues d\'une vidéo ' + verbe2 + ' chaque jour. Elle compte aujourd\'hui ' + v0c + ' milliers de vues. Au bout de combien de jours atteindra-t-elle ' + Sc + ' milliers de vues ?',
        a:String(nc), accept:null, choix:null,
        expl:'Suite géométrique de raison ' + qq + ' : ' + seq + '. Il faut ' + nc + ' jours.'};
    }
    var a6 = R.pick([2,3,-2]);
    var b6 = R.pick([2,3,4,-3,-5]);
    var c6 = R.pick([1,2,5,-4]);
    var x6 = -R.int(2,5);
    var f6 = a6*x6*x6 + b6*x6 + c6;
    return {q:'Soit f(x) = ' + pol(a6,b6,c6) + '. Calcule f(' + String(x6).replace('-','−') + ').',
      a:String(f6), accept:null, choix:null,
      expl:'f(' + neg(x6) + ') = ' + neg(a6) + ' × ' + neg(x6) + '² + ' + neg(b6) + ' × ' + neg(x6) + ' + ' + neg(c6) + ' = ' + neg(a6*x6*x6) + ' + ' + neg(b6*x6) + ' + ' + neg(c6) + ' = ' + String(f6).replace('-','−') + '. Attention aux signes : (−x)² est positif.'};
  }
});

// =====================================================
// p7-03 — Révision probas et stats
// =====================================================
SKILLS.push({
  id: 'p7-03-revision-probas',
  phase: 7,
  ordre: 3,
  titre: 'Révision probas et stats',
  objectif: "Enchaîner arbres, probabilités conditionnelles, totales et ajustements sans hésiter.",
  lecon: `<p class="lede">Au bac, la partie probas repose sur un seul outil roi : l'arbre pondéré. Si tu sais le dessiner et le lire, tu sais presque tout faire.</p>
<p>Exemple complet : dans une entreprise, 60 % des salariés sont des femmes. Parmi les femmes, 30 % télétravaillent ; parmi les hommes, 45 %. On tire un salarié au hasard.</p>
<div class="etapes">
<p>1. Je dessine l'arbre : deux branches F (0,6) et H (0,4), puis sur chacune, T et « pas T ».</p>
<p>2. Le long d'un chemin, je <mark>multiplie</mark> : P(F ∩ T) = 0,6 × 0,3 = 0,18 (être une femme ET télétravailler).</p>
<p>3. Pour P(T), j'<mark>additionne tous les chemins</mark> qui mènent à T : P(T) = 0,6 × 0,3 + 0,4 × 0,45 = 0,18 + 0,18 = 0,36. C'est la formule des probabilités totales.</p>
<p>4. Pour « renverser » l'arbre : P(F sachant T) = P(F ∩ T) ÷ P(T) = 0,18 ÷ 0,36 = 0,5.</p>
</div>
<div class="formule"><p>P(A ∩ B) = P(A) × P(B sachant A) &nbsp;•&nbsp; P(B sachant A) = P(A ∩ B) ÷ P(A)</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>« Sachant » change le point de départ : P(B sachant A) se calcule <strong>parmi</strong> les cas où A est réalisé, donc on divise par P(A). Ne confonds pas P(A ∩ B) (les deux à la fois, sur tout le monde) et P(B sachant A) (B, mais seulement chez les A).</p></div>
<p>Côté stats, la droite d'ajustement y = ax + b résume un nuage de points. Pour prédire une valeur, tu remplaces x par le rang voulu ; pour savoir quand un objectif sera atteint, tu résous ax + b = objectif.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Arbre : on <mark>multiplie le long d'un chemin</mark>, on <mark>additionne les chemins</mark>. Conditionnelle : P(A sachant B) = P(A ∩ B) ÷ P(B). Ajustement : y = ax + b sert à prédire.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie toujours ton arbre : les branches qui partent d'un même nœud doivent totaliser 1. C'est le meilleur détecteur d'erreurs de l'épreuve.</p></div>`,
  gen(level, R){
    if(level===1){
      var type = R.int(1,4);
      if(type===1){
        var pA = 10*R.int(2,8);
        var pB = 10*R.int(1,9);
        var res = dec(pA*pB/10000);
        return {q:'On donne P(A) = ' + fr(dec(pA/100)) + ' et P(B sachant A) = ' + fr(dec(pB/100)) + '. Calcule P(A ∩ B).',
          a:res, accept:null, choix:null,
          expl:'P(A ∩ B) = P(A) × P(B sachant A) = ' + fr(dec(pA/100)) + ' × ' + fr(dec(pB/100)) + ' = ' + fr(res) + '.'};
      }
      if(type===2){
        var p = 5*R.int(1,19);
        var res2 = dec((100-p)/100);
        return {q:'On donne P(A) = ' + fr(dec(p/100)) + '. Quelle est la probabilité de l\'événement contraire de A ?',
          a:res2, accept:null, choix:null,
          expl:'P(contraire de A) = 1 − P(A) = 1 − ' + fr(dec(p/100)) + ' = ' + fr(res2) + '.'};
      }
      if(type===3){
        var cadres = R.pick([40,60,80,100]);
        var pc = 5*R.int(1,18);
        var bil = cadres*pc/100;
        var total = cadres + R.pick([60,100,120,150]);
        return {q:'Une entreprise emploie ' + total + ' salariés, dont ' + cadres + ' cadres. Parmi les cadres, ' + bil + ' sont bilingues. Quel pourcentage des cadres est bilingue ?',
          a:String(pc), accept:[pc+' %', pc+'%', dec(pc/100)], choix:null,
          expl:'On divise par l\'effectif des cadres, pas par le total : ' + bil + ' ÷ ' + cadres + ' = ' + fr(dec(pc/100)) + ' = ' + pc + ' %.'};
      }
      var a4 = R.pick([0.5,1.5,2,2.5,3]);
      var x4 = 2*R.int(2,6);
      var b4 = 5*R.int(1,8);
      var y4 = a4*x4 + b4;
      return {q:'Après un ajustement affine, on obtient y = ' + fr(String(a4)) + 'x + ' + b4 + ', où x est le rang de l\'année et y le chiffre d\'affaires en milliers d\'€. Estime y pour x = ' + x4 + '.',
        a:String(y4), accept:null, choix:null,
        expl:'On remplace x par ' + x4 + ' : y = ' + fr(String(a4)) + ' × ' + x4 + ' + ' + b4 + ' = ' + y4 + '.'};
    }

    if(level===2){
      var type2 = R.int(1,4);
      if(type2===1){
        var pA2 = 10*R.int(2,8);
        var p1 = 10*R.int(1,9);
        var p2 = 10*R.int(1,9);
        if(p2===p1){ p2 = (p2===90) ? 10 : p2+10; }
        var pB2 = dec((pA2*p1 + (100-pA2)*p2)/10000);
        var q2;
        if(R.int(1,2)===1){
          q2 = 'Dans une entreprise, ' + pA2 + ' % des salariés sont des femmes. Parmi les femmes, ' + p1 + ' % télétravaillent ; parmi les hommes, ' + p2 + ' %. On choisit un salarié au hasard. Quelle est la probabilité qu\'il télétravaille ?';
        } else {
          q2 = pA2 + ' % des clients d\'une boutique ont la carte de fidélité. ' + p1 + ' % des porteurs de la carte utilisent l\'application, contre ' + p2 + ' % des clients sans carte. On interroge un client au hasard. Quelle est la probabilité qu\'il utilise l\'application ?';
        }
        return {q:q2, a:pB2, accept:null, choix:null,
          expl:'Probabilités totales : ' + fr(dec(pA2/100)) + ' × ' + fr(dec(p1/100)) + ' + ' + fr(dec((100-pA2)/100)) + ' × ' + fr(dec(p2/100)) + ' = ' + fr(dec(pA2*p1/10000)) + ' + ' + fr(dec((100-pA2)*p2/10000)) + ' = ' + fr(pB2) + '.'};
      }
      if(type2===2){
        var pA3 = 10*R.int(2,8);
        var tg = 10*R.int(1,9);
        var inter = dec(pA3*tg/10000);
        var res3 = dec(tg/100);
        return {q:'On donne P(A) = ' + fr(dec(pA3/100)) + ' et P(A ∩ B) = ' + fr(inter) + '. Calcule P(B sachant A).',
          a:res3, accept:null, choix:null,
          expl:'P(B sachant A) = P(A ∩ B) ÷ P(A) = ' + fr(inter) + ' ÷ ' + fr(dec(pA3/100)) + ' = ' + fr(res3) + '.'};
      }
      if(type2===3){
        var pA4 = 10*R.int(2,8);
        var pb4 = 10*R.int(1,9);
        if(R.int(1,2)===1){
          var r4 = dec(pA4*pb4/10000);
          return {q:'Dans un magasin, ' + pA4 + ' % des clients paient par carte. Parmi ceux qui paient par carte, ' + pb4 + ' % utilisent le sans-contact. Quelle est la probabilité qu\'un client pris au hasard paie par carte en sans-contact ?',
            a:r4, accept:null, choix:null,
            expl:'On multiplie le long du chemin : ' + fr(dec(pA4/100)) + ' × ' + fr(dec(pb4/100)) + ' = ' + fr(r4) + '.'};
        }
        var r5 = dec((100-pA4)*pb4/10000);
        return {q:pA4 + ' % des visiteurs d\'un site utilisent un mobile. Parmi les visiteurs qui n\'utilisent PAS de mobile, ' + pb4 + ' % restent plus de 5 minutes. Quelle est la probabilité qu\'un visiteur ne soit pas sur mobile ET reste plus de 5 minutes ?',
          a:r5, accept:null, choix:null,
          expl:'P(non mobile) = 1 − ' + fr(dec(pA4/100)) + ' = ' + fr(dec((100-pA4)/100)) + ', puis on multiplie : ' + fr(dec((100-pA4)/100)) + ' × ' + fr(dec(pb4/100)) + ' = ' + fr(r5) + '.'};
      }
      var bon = 'P(A) × P(B sachant A) + P(non A) × P(B sachant non A)';
      return {q:'Dans un arbre pondéré à deux branches A et non A, quelle formule donne P(B) (formule des probabilités totales) ?',
        a:bon, accept:null,
        choix:[bon, 'P(A) × P(B sachant A)', 'P(A) + P(B sachant A)', 'P(B sachant A) + P(B sachant non A)'],
        expl:'P(B) s\'obtient en additionnant TOUS les chemins qui mènent à B : celui qui passe par A et celui qui passe par non A.'};
    }

    // level 3
    var type3 = R.int(1,3);
    if(type3===1){
      var co = R.pick([[40,30,20,50],[60,50,25,75],[20,60,10,60],[50,30,10,75],[60,40,60,50],[75,40,40,75],[80,30,40,75],[20,80,30,40],[50,60,20,75],[40,60,10,80]]);
      var pA5 = co[0], pAB = co[1], pnAB = co[2], ansPct = co[3];
      var ab = dec(pA5*pAB/10000);
      var Btot = dec((pA5*pAB + (100-pA5)*pnAB)/10000);
      var ares = dec(ansPct/100);
      var fracs = {40:'2/5', 50:'1/2', 60:'3/5', 75:'3/4', 80:'4/5'};
      var acc = [ansPct+' %', ansPct+'%'];
      if(fracs[ansPct]) acc.push(fracs[ansPct]);
      return {q:'Deux agences traitent des dossiers de crédit. L\'agence A traite ' + pA5 + ' % des dossiers, et ' + pAB + ' % de ses dossiers sont acceptés. L\'agence B traite le reste, et ' + pnAB + ' % de ses dossiers sont acceptés. On choisit un dossier accepté au hasard. Quelle est la probabilité qu\'il vienne de l\'agence A ?',
        a:ares, accept:acc, choix:null,
        expl:'P(accepté) = ' + fr(dec(pA5/100)) + ' × ' + fr(dec(pAB/100)) + ' + ' + fr(dec((100-pA5)/100)) + ' × ' + fr(dec(pnAB/100)) + ' = ' + fr(Btot) + '. Puis P(A sachant accepté) = ' + fr(ab) + ' ÷ ' + fr(Btot) + ' = ' + fr(ares) + '.'};
    }
    if(type3===2){
      var a5 = R.pick([2,2.5,4,5]);
      var xs = (a5===2.5) ? 2*R.int(4,9) : R.int(6,15);
      var b5 = 5*R.int(2,10);
      var target = a5*xs + b5;
      if(R.int(1,2)===1){
        return {q:'La droite d\'ajustement des ventes est y = ' + fr(String(a5)) + 'x + ' + b5 + ' (y en milliers d\'unités, x = rang de l\'année). Pour quel rang x les ventes atteignent-elles ' + target + ' milliers d\'unités ?',
          a:String(xs), accept:null, choix:null,
          expl:'On résout ' + fr(String(a5)) + 'x + ' + b5 + ' = ' + target + ' : x = (' + target + ' − ' + b5 + ') ÷ ' + fr(String(a5)) + ' = ' + xs + '.'};
      }
      return {q:'La droite d\'ajustement des ventes est y = ' + fr(String(a5)) + 'x + ' + b5 + ', où x est le nombre d\'années après 2020 et y les ventes en milliers d\'unités. En quelle année les ventes atteindront-elles ' + target + ' milliers d\'unités ?',
        a:String(2020+xs), accept:null, choix:null,
        expl:'On résout ' + fr(String(a5)) + 'x + ' + b5 + ' = ' + target + ' : x = ' + xs + ', soit l\'année 2020 + ' + xs + ' = ' + (2020+xs) + '.'};
    }
    var pA6 = R.pick([20,40,60,80]);
    var p16 = 5*R.int(1,8);
    var p26 = 5*R.int(1,8);
    if(p26===p16){ p26 = (p26===40) ? 5 : p26+5; }
    if(R.int(1,2)===1){
      var rB = dec((pA6*p16 + (100-pA6)*p26)/10000);
      return {q:'Une usine possède deux machines. La machine A produit ' + pA6 + ' % des pièces, dont ' + p16 + ' % sont défectueuses. La machine B produit le reste, dont ' + p26 + ' % sont défectueuses. On prélève une pièce au hasard. Quelle est la probabilité qu\'elle soit défectueuse ?',
        a:rB, accept:null, choix:null,
        expl:'Probabilités totales : ' + fr(dec(pA6/100)) + ' × ' + fr(dec(p16/100)) + ' + ' + fr(dec((100-pA6)/100)) + ' × ' + fr(dec(p26/100)) + ' = ' + fr(dec(pA6*p16/10000)) + ' + ' + fr(dec((100-pA6)*p26/10000)) + ' = ' + fr(rB) + '.'};
    }
    var rAnb = dec(pA6*(100-p16)/10000);
    return {q:'Une usine possède deux machines. La machine A produit ' + pA6 + ' % des pièces, dont ' + p16 + ' % sont défectueuses. On prélève une pièce au hasard. Quelle est la probabilité qu\'elle vienne de la machine A et qu\'elle ne soit PAS défectueuse ?',
      a:rAnb, accept:null, choix:null,
      expl:'Sur la branche A, P(non défectueuse sachant A) = 1 − ' + fr(dec(p16/100)) + ' = ' + fr(dec((100-p16)/100)) + '. Puis ' + fr(dec(pA6/100)) + ' × ' + fr(dec((100-p16)/100)) + ' = ' + fr(rAnb) + '.'};
  }
});

})();
