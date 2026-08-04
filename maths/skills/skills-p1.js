/* ============================================================
   Phase 1 — Fondations (6e–5e)
   10 skills : nombres, opérations posées, tables, priorités,
   relatifs, décimaux, fractions, proportionnalité.
   ============================================================ */
(function(){

  /* ---------- Outils partagés ---------- */
  function mf(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }        // 12500 -> "12 500"
  function fv(x){ return String(x).replace('.', ','); }                            // 4.5 -> "4,5" (affichage)
  function eur(c){ return (c % 100 === 0) ? String(c/100) : (c/100).toFixed(2).replace('.', ','); } // centimes -> "4,80" ou "6"
  function acc2(c){ var s = String(c/100), t = (c/100).toFixed(2); return (t === s) ? null : [t]; } // accepte "4.10" si a="4.1"
  function gcd(a,b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = a % b; a = b; b = t; } return a; }
  function sd(n){ return n < 0 ? '−' + (-n) : String(n); }                         // -7 -> "−7" (affichage)
  function pn(n){ return n < 0 ? '(−' + (-n) + ')' : String(n); }                  // -7 -> "(−7)" (affichage)
  function accPlus(n){ return n > 0 ? ['+' + n] : null; }

  /* Nombres en lettres (0 à 999 999 999) */
  var U = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
  function motsDiz(n){
    if(n < 20) return U[n];
    var d = Math.floor(n/10), r = n % 10;
    if(d === 7 || d === 9){
      var base = (d === 7) ? 'soixante' : 'quatre-vingt';
      var fin = n - (d === 7 ? 60 : 80);
      if(d === 7 && fin === 11) return 'soixante et onze';
      return base + '-' + U[fin];
    }
    var noms = {2:'vingt',3:'trente',4:'quarante',5:'cinquante',6:'soixante',8:'quatre-vingt'};
    var mot = noms[d];
    if(r === 0) return mot + (d === 8 ? 's' : '');
    if(r === 1 && d !== 8) return mot + ' et un';
    return mot + '-' + U[r];
  }
  function motsCent(n){
    var c = Math.floor(n/100), r = n % 100;
    if(c === 0) return motsDiz(r);
    var s = (c === 1) ? 'cent' : U[c] + ' cent' + (r === 0 ? 's' : '');
    return (r === 0) ? s : s + ' ' + motsDiz(r);
  }
  function motsFr(n){
    if(n === 0) return 'zéro';
    var M = Math.floor(n/1000000), m = Math.floor((n % 1000000)/1000), r = n % 1000, parts = [];
    if(M) parts.push(M === 1 ? 'un million' : motsCent(M) + ' millions');
    if(m) parts.push(m === 1 ? 'mille' : motsCent(m).replace(/cents$/,'cent').replace(/vingts$/,'vingt') + ' mille');
    if(r) parts.push(motsCent(r));
    return parts.join(' ');
  }

  /* ============================================================
     1. Lire, écrire, comparer les nombres
     ============================================================ */
  SKILLS.push({
    id: 'p1-01-nombres',
    phase: 1,
    ordre: 1,
    titre: 'Lire, écrire, comparer les nombres',
    objectif: "Lire et écrire n'importe quel nombre, le comparer, l'encadrer et le placer sur une droite graduée.",
    lecon: `<p class="lede">Un nombre, c'est une suite de chiffres où <mark>chaque position a une valeur</mark> : unités, dizaines, centaines, milliers… Savoir lire cette organisation, c'est la base de tout le calcul.</p>
<p>De droite à gauche, les positions valent de plus en plus : unités, dizaines (×10), centaines (×100), milliers (×1 000), et ainsi de suite. Dans 4 725 : 4 milliers, 7 centaines, 2 dizaines, 5 unités.</p>
<div class="etapes">
<p><strong>Écrire « vingt-trois mille quatre cent cinq » en chiffres :</strong></p>
<p>1. Le mot « mille » coupe le nombre en deux blocs : « vingt-trois » | « quatre cent cinq ».</p>
<p>2. Bloc des milliers : vingt-trois → 23.</p>
<p>3. Bloc après « mille » : quatre cent cinq → 405. Attention, ce bloc doit faire 3 chiffres : 4 centaines, 0 dizaine, 5 unités.</p>
<p>4. On recolle : <mark>23 405</mark>.</p>
</div>
<p>Pour <strong>comparer</strong> deux nombres : celui qui a le plus de chiffres est le plus grand. S'ils en ont autant, on compare chiffre par chiffre <mark>en partant de la gauche</mark> : 4 520 &gt; 4 502, car au rang des dizaines, 2 &gt; 0.</p>
<p>Pour <strong>encadrer</strong> 3 462 entre deux multiples de 100 consécutifs : je garde les 34 centaines → 3 400 &lt; 3 462 &lt; 3 500. Sur une <strong>droite graduée</strong>, je repère d'abord le pas (de 10 en 10, de 100 en 100…), puis je compte les sauts depuis un nombre connu.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Chaque chiffre vaut selon sa position. Pour comparer : d'abord le nombre de chiffres, puis chiffre par chiffre en partant de la gauche.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Écris les grands nombres par tranches de 3 chiffres en partant de la droite : 4725000 → 4 725 000. Tu lis alors directement « 4 millions 725 mille ».</p></div>`,
    gen(level, R){
      var n, v, pos, d, dep, pas, k;
      if(level === 1){
        v = R.int(1,4);
        if(v === 1){
          n = R.int(101, 9999);
          return {q:'Écris en chiffres : « ' + motsFr(n) + ' ».', a:String(n), accept:null, choix:null,
            expl:"On écrit " + mf(n) + ". Les mots « mille » et « cent » indiquent les paquets : découpe le nombre en blocs."};
        }
        if(v === 2){
          n = R.int(100, 9999);
          pos = R.pick([[1,'unités'],[10,'dizaines'],[100,'centaines']]);
          d = Math.floor(n/pos[0]) % 10;
          return {q:'Dans le nombre ' + mf(n) + ', quel est le chiffre des ' + pos[1] + ' ?', a:String(d), accept:null, choix:null,
            expl:'En partant de la droite : unités, dizaines, centaines, milliers. Ici, le chiffre des ' + pos[1] + ' est ' + d + '.'};
        }
        if(v === 3){
          var c1 = R.int(1,9), c2 = R.int(0,9), c3 = R.int(0,9);
          while(c2 === c1){ c2 = R.int(0,9); }
          while(c3 === c1 || c3 === c2){ c3 = R.int(0,9); }
          var perms = [[c1,c2,c3],[c1,c3,c2],[c2,c1,c3],[c3,c2,c1],[c2,c3,c1],[c3,c1,c2]];
          var nums = [];
          for(var i = 0; i < perms.length; i++){
            if(perms[i][0] !== 0) nums.push(perms[i][0]*100 + perms[i][1]*10 + perms[i][2]);
          }
          var quatre = R.shuffle(nums).slice(0,4);
          var maxi = Math.max.apply(null, quatre);
          return {q:'Quel est le plus grand de ces nombres ?', a:String(maxi), accept:null,
            choix: quatre.map(String),
            expl:"Ils ont autant de chiffres : compare d'abord les centaines, puis les dizaines, puis les unités."};
        }
        dep = R.int(2,8)*100; pas = 10; k = R.int(2,9);
        return {q:'Une droite est graduée de ' + pas + ' en ' + pas + '. On part de ' + dep + '. Quel nombre lit-on ' + k + ' graduations plus loin ?',
          a:String(dep + pas*k), accept:null, choix:null,
          expl:'Chaque graduation vaut ' + pas + ' : ' + dep + ' + ' + k + ' × ' + pas + ' = ' + (dep + pas*k) + '.'};
      }
      if(level === 2){
        v = R.int(1,4);
        if(v === 1){
          n = R.int(10001, 99999);
          return {q:'Écris en chiffres : « ' + motsFr(n) + ' ».', a:String(n), accept:null, choix:null,
            expl:'On écrit ' + mf(n) + ' : le bloc avant « mille », puis un bloc de 3 chiffres (complète avec des zéros si besoin).'};
        }
        if(v === 2){
          var h = R.int(10,89)*100;
          n = h + R.int(1,99);
          var th = Math.floor(n/1000)*1000;
          var ok = mf(h) + ' < ' + mf(n) + ' < ' + mf(h+100);
          return {q:'Quel est le bon encadrement de ' + mf(n) + ' entre deux multiples de 100 consécutifs ?',
            a: ok, accept:null,
            choix: [ok,
              mf(h-100) + ' < ' + mf(n) + ' < ' + mf(h),
              mf(h+100) + ' < ' + mf(n) + ' < ' + mf(h+200),
              mf(th) + ' < ' + mf(n) + ' < ' + mf(th+1000)],
            expl:'On garde les centaines de ' + mf(n) + ' : ' + mf(h) + ', et le multiple de 100 suivant est ' + mf(h+100) + '.'};
        }
        if(v === 3){
          pas = R.pick([25,50]); dep = R.int(1,8)*100; k = R.int(2,7);
          return {q:'Une droite est graduée de ' + pas + ' en ' + pas + '. On part de ' + dep + '. Quel nombre lit-on ' + k + ' graduations plus loin ?',
            a:String(dep + pas*k), accept:null, choix:null,
            expl:dep + ' + ' + k + ' × ' + pas + ' = ' + (dep + pas*k) + '.'};
        }
        var base = R.int(10,98), m1 = R.int(0,9), m2 = R.int(0,9), tail = R.int(0,99);
        while(m2 === m1){ m2 = R.int(0,9); }
        var n1 = base*1000 + m1*100 + tail, n2 = base*1000 + m2*100 + tail;
        return {q:'Écris le plus grand de ces deux nombres : ' + mf(n1) + ' ou ' + mf(n2) + '.',
          a:String(Math.max(n1,n2)), accept:null, choix:null,
          expl:'Même nombre de chiffres : on compare de gauche à droite. Ils diffèrent au rang des centaines : ' + Math.max(m1,m2) + ' > ' + Math.min(m1,m2) + '.'};
      }
      v = R.int(1,4);
      if(v === 1){
        var M = R.int(1,12), mm = R.int(0,999), rr = R.pick([0, 0, R.int(1,999)]);
        n = M*1000000 + mm*1000 + rr;
        return {q:'Écris en chiffres : « ' + motsFr(n) + ' ».', a:String(n), accept:null, choix:null,
          expl:'On écrit ' + mf(n) + ' : bloc des millions, puis bloc des mille (3 chiffres), puis bloc final (3 chiffres). Complète avec des zéros.'};
      }
      if(v === 2){
        var e = R.int(1,9), t = R.int(1,9), kk = R.int(1,9);
        var d1 = e + t/10;
        var d2 = (e*100 + t*10 - kk)/100;
        var mode = R.int(1,2);
        var paire = R.shuffle([fv(d1), fv(d2)]);
        return {q:'Écris le plus ' + (mode === 1 ? 'grand' : 'petit') + ' de ces deux nombres : ' + paire[0] + ' ou ' + paire[1] + '.',
          a: mode === 1 ? String(d1) : String(d2), accept:null, choix:null,
          expl:'Compare les dixièmes (le 1er chiffre après la virgule) : ' + fv(d1) + ' = ' + fv(d1) + '0, donc ' + fv(d1) + ' > ' + fv(d2) + '.'};
      }
      if(v === 3){
        dep = R.int(1,9); k = R.int(2,9);
        var val = (dep*10 + k)/10;
        return {q:'Une droite est graduée de 0,1 en 0,1. On part de ' + dep + '. Quel nombre lit-on ' + k + ' graduations plus loin ?',
          a:String(val), accept:null, choix:null,
          expl:'Chaque graduation vaut 0,1 : ' + dep + ' + ' + k + ' × 0,1 = ' + fv(val) + '.'};
      }
      n = R.int(100000, 9999999);
      pos = R.pick([[1000,'milliers'],[10000,'dix-milliers'],[100000,'centaines de milliers']]);
      d = Math.floor(n/pos[0]) % 10;
      return {q:'Dans le nombre ' + mf(n) + ', quel est le chiffre des ' + pos[1] + ' ?', a:String(d), accept:null, choix:null,
        expl:'Découpe par tranches de 3 : ' + mf(n) + '. Le chiffre des ' + pos[1] + ' est ' + d + '.'};
    }
  });

  /* ============================================================
     2. Additions et soustractions posées
     ============================================================ */
  SKILLS.push({
    id: 'p1-02-addition-soustraction',
    phase: 1,
    ordre: 2,
    titre: 'Additions et soustractions posées',
    objectif: "Poser une addition ou une soustraction avec retenues, entiers comme décimaux.",
    lecon: `<p class="lede">Poser une opération, c'est <mark>aligner les chiffres par colonnes</mark> — unités sous unités, dizaines sous dizaines — pour calculer sans se tromper.</p>
<p>Pour une <strong>addition posée</strong>, on calcule colonne par colonne en partant de la droite. Si une colonne dépasse 9, on écrit le chiffre des unités et on reporte <mark>une retenue</mark> dans la colonne suivante.</p>
<div class="etapes">
<p><strong>Exemple : 47 + 38</strong></p>
<p>1. Colonne des unités : 7 + 8 = 15. J'écris 5, je retiens 1.</p>
<p>2. Colonne des dizaines : 4 + 3 = 7, plus la retenue : 7 + 1 = 8.</p>
<p>3. Résultat : <mark>85</mark>.</p>
</div>
<p>Pour une <strong>soustraction posée</strong> comme 502 − 347 : aux unités, 2 − 7 est impossible. J'emprunte une dizaine : 12 − 7 = 5, et je compense en ajoutant 1 au 4 du bas. Aux dizaines : 0 − 5 impossible → 10 − 5 = 5, retenue au 3 du bas. Aux centaines : 5 − 4 = 1. Résultat : 155. Vérification : 155 + 347 = 502. ✓</p>
<p>Avec des <strong>nombres décimaux</strong>, même méthode avec une règle en plus : <mark>on aligne les virgules</mark>. Pour 45,7 + 8,65, j'écris 45,70 + 8,65 (un zéro ajouté pour avoir autant de chiffres après la virgule), puis je calcule comme d'habitude : 54,35.</p>
<div class="box piege"><p class="box-t">Piège classique</p><p>Ne jamais aligner les nombres « à gauche ». 45,7 + 8,65 ne se pose pas en collant le 4 sous le 8 : c'est la virgule qui sert de repère.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>On aligne par la droite (ou par la virgule), on calcule colonne par colonne, et chaque retenue passe à la colonne suivante.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie toujours une soustraction en additionnant : résultat + nombre soustrait = nombre de départ.</p></div>`,
    gen(level, R){
      var v, A, B;
      if(level === 1){
        v = R.int(1,3);
        if(v === 1){
          var auC = R.int(2,9), buC = R.int(Math.max(10 - auC, 1), 9);
          A = R.int(1,7)*10 + auC; B = R.int(1,7)*10 + buC;
          var su = (A % 10) + (B % 10);
          return {q:'Pose et calcule : ' + A + ' + ' + B, a:String(A + B), accept:null, choix:null,
            expl:'Unités : ' + (A % 10) + ' + ' + (B % 10) + ' = ' + su + " : j'écris " + (su % 10) + ' et je retiens 1. Dizaines : ' + Math.floor(A/10) + ' + ' + Math.floor(B/10) + ' + 1 = ' + (Math.floor(A/10) + Math.floor(B/10) + 1) + '.'};
        }
        if(v === 2){
          var at = R.int(3,9), au = R.int(3,9), bt = R.int(1,at-1), bu = R.int(0,au);
          A = at*10 + au; B = bt*10 + bu;
          return {q:'Pose et calcule : ' + A + ' − ' + B, a:String(A - B), accept:null, choix:null,
            expl:'Pas de retenue ici : unités ' + au + ' − ' + bu + ' = ' + (au - bu) + ', dizaines ' + at + ' − ' + bt + ' = ' + (at - bt) + '.'};
        }
        A = R.int(30,90); B = R.int(11, A - 5);
        return {q:'Tu as ' + A + ' €. Tu dépenses ' + B + ' €. Combien te reste-t-il, en € ?', a:String(A - B), accept:null, choix:null,
          expl:'On pose la soustraction ' + A + ' − ' + B + ' = ' + (A - B) + '.'};
      }
      if(level === 2){
        v = R.int(1,3);
        if(v === 1){
          A = R.int(146,878); B = R.int(135,899);
          return {q:'Pose et calcule : ' + A + ' + ' + B, a:String(A + B), accept:null, choix:null,
            expl:'Colonne par colonne en partant de la droite, sans oublier de reporter chaque retenue. Total : ' + mf(A + B) + '.'};
        }
        if(v === 2){
          var Ah = R.int(3,9), At = R.int(0,9), Au = R.int(0,8);
          var Bu = R.int(Au + 1, 9), Bh = R.int(1, Ah - 1), Bt = R.int(0,9);
          A = Ah*100 + At*10 + Au; B = Bh*100 + Bt*10 + Bu;
          return {q:'Pose et calcule : ' + A + ' − ' + B, a:String(A - B), accept:null, choix:null,
            expl:'Aux unités, ' + Au + ' − ' + Bu + " est impossible : on emprunte une dizaine (" + (Au + 10) + ' − ' + Bu + ' = ' + (Au + 10 - Bu) + ') et on compense dans la colonne suivante. Vérifie : ' + (A - B) + ' + ' + B + ' = ' + A + '.'};
        }
        A = R.int(157,489); B = R.int(146,498);
        return {q:'Un magasin encaisse ' + A + ' € le matin et ' + B + " € l'après-midi. Combien a-t-il encaissé en tout, en € ?",
          a:String(A + B), accept:null, choix:null,
          expl:'On pose ' + A + ' + ' + B + ' = ' + mf(A + B) + ' €.'};
      }
      v = R.int(1,3);
      if(v === 1){
        A = R.int(500,4999); B = R.int(105,999);
        while(A % 100 === 0){ A = R.int(500,4999); }
        while(B % 100 === 0){ B = R.int(105,999); }
        return {q:'Pose et calcule : ' + fv(A/100) + ' + ' + fv(B/100), a:String((A + B)/100), accept:acc2(A + B), choix:null,
          expl:'On aligne les virgules (complète avec des zéros), puis on additionne : ' + fv((A + B)/100) + '.'};
      }
      if(v === 2){
        if(R.int(1,2) === 1){
          A = R.pick([1000, 2000, 5000]);
          B = R.int(Math.floor(A/4), A - 105);
          while(B % 100 === 0){ B = B + 1; }
          return {q:'Un article coûte ' + eur(B) + ' €. Tu paies avec un billet de ' + (A/100) + ' €. Combien te rend-on, en € ?',
            a:String((A - B)/100), accept:acc2(A - B), choix:null,
            expl:'On pose ' + (A/100) + ' − ' + eur(B) + ' en écrivant ' + (A/100) + ' = ' + fv((A/100).toFixed(2)) + ' pour aligner les virgules. Monnaie : ' + eur(A - B) + ' €.'};
        }
        A = R.int(1200,6999); B = R.int(300, A - 200);
        while(A % 100 === 0){ A = A + 1; }
        while(B % 100 === 0){ B = B + 1; }
        return {q:'Pose et calcule : ' + fv(A/100) + ' − ' + fv(B/100), a:String((A - B)/100), accept:acc2(A - B), choix:null,
          expl:'Virgule sous virgule, puis on soustrait colonne par colonne : ' + fv((A - B)/100) + '. Vérifie en additionnant.'};
      }
      A = R.int(2000,9500); B = R.int(1100, A - 300);
      return {q:'Pose et calcule : ' + mf(A) + ' − ' + mf(B), a:String(A - B), accept:null, choix:null,
        expl:'Attention aux emprunts en chaîne. Vérification : ' + mf(A - B) + ' + ' + mf(B) + ' = ' + mf(A) + '.'};
    }
  });

  /* ============================================================
     3. Les tables de multiplication
     ============================================================ */
  SKILLS.push({
    id: 'p1-03-tables',
    phase: 1,
    ordre: 3,
    titre: 'Les tables de multiplication',
    objectif: "Donner instantanément n'importe quel résultat des tables de 2 à 12, dans les deux sens.",
    lecon: `<p class="lede">Les tables de multiplication sont le <mark>moteur de tout le calcul</mark> : multiplications posées, divisions, fractions… Objectif : répondre en moins de 3 secondes, dans les deux sens.</p>
<p>« Dans les deux sens », ça veut dire savoir répondre à 7 × 8 = ?, mais aussi à ? × 8 = 56. Cette deuxième forme est exactement ce qu'on utilise pour diviser : 56 ÷ 8, c'est chercher « combien de fois 8 dans 56 ».</p>
<div class="etapes">
<p><strong>Retrouver un résultat oublié — exemple avec 7 × 8 :</strong></p>
<p>1. Je pars d'un point d'appui que je connais : 7 × 10 = 70.</p>
<p>2. 7 × 8, c'est 7 × 10 moins deux paquets de 7 : 70 − 14.</p>
<p>3. Donc 7 × 8 = <mark>56</mark>.</p>
</div>
<p>Autres points d'appui : <strong>×5</strong>, c'est la moitié de ×10 (6 × 5 = 30 car 6 × 10 = 60). <strong>×9</strong>, c'est ×10 moins une fois le nombre (9 × 7 = 70 − 7 = 63). <strong>×11</strong> : on double le chiffre (11 × 6 = 66). <strong>×12</strong> : c'est ×10 plus ×2 (12 × 7 = 70 + 14 = 84).</p>
<p>Et surtout : <mark>l'ordre ne change rien</mark>. 3 × 8 = 8 × 3. Tu n'as donc que la moitié des tables à mémoriser !</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Une table sue par cœur = une division réussie. Connaître 42 = 6 × 7 te donne d'un coup : 6 × 7, 7 × 6, 42 ÷ 6 et 42 ÷ 7.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Les 5 résultats les plus ratés de France : 6 × 7 = 42, 6 × 8 = 48, 7 × 8 = 56, 7 × 9 = 63, 8 × 9 = 72. Récite-les chaque matin pendant une semaine : c'est réglé.</p></div>`,
    gen(level, R){
      var t, b, p, v, tpl;
      if(level === 1){
        t = R.int(2,5); b = R.int(2,9);
        if(R.int(0,1) === 1){ var tmp = t; t = b; b = tmp; }
        p = t * b;
        tpl = R.pick(['Calcule : ' + t + ' × ' + b, t + ' × ' + b + ' = ?', 'Combien font ' + t + ' × ' + b + ' ?']);
        return {q:tpl, a:String(p), accept:null, choix:null,
          expl:t + ' × ' + b + ' = ' + p + '. Si tu hésites, compte de ' + Math.min(t,b) + ' en ' + Math.min(t,b) + '.'};
      }
      if(level === 2){
        v = R.int(1,3);
        t = R.int(2,10); b = R.int(2,10); p = t * b;
        if(v === 1){
          tpl = R.pick(['Calcule : ' + t + ' × ' + b, t + ' × ' + b + ' = ?']);
          return {q:tpl, a:String(p), accept:null, choix:null,
            expl:t + ' × ' + b + ' = ' + p + '.'};
        }
        if(v === 2){
          return {q:'? × ' + t + ' = ' + p, a:String(b), accept:null, choix:null,
            expl:'On cherche le nombre qui, multiplié par ' + t + ', donne ' + p + " : c'est " + b + ', car ' + b + ' × ' + t + ' = ' + p + '.'};
        }
        return {q:t + ' × ? = ' + p, a:String(b), accept:null, choix:null,
          expl:'Dans la table de ' + t + ' : ' + t + ' × ' + b + ' = ' + p + '.'};
      }
      v = R.int(1,3);
      if(v === 1){
        t = R.pick([11,12]); b = R.int(3,12); p = t * b;
        return {q:'Calcule : ' + t + ' × ' + b, a:String(p), accept:null, choix:null,
          expl:t + ' × ' + b + ' = ' + b + ' × 10 ' + (t === 11 ? '+ ' + b : '+ ' + b + ' × 2') + ' = ' + p + '.'};
      }
      var HF = [[6,7],[6,8],[6,9],[7,8],[7,9],[8,9],[12,6],[12,7],[12,8],[11,7]];
      var pr = R.pick(HF);
      t = pr[0]; b = pr[1];
      if(R.int(0,1) === 1){ var tm = t; t = b; b = tm; }
      p = t * b;
      if(v === 2){
        return {q:'? × ' + t + ' = ' + p, a:String(b), accept:null, choix:null,
          expl:b + ' × ' + t + ' = ' + p + '. Cette forme « à trou » est exactement une division : ' + p + ' ÷ ' + t + ' = ' + b + '.'};
      }
      return {q:'Sans poser : ' + p + ' ÷ ' + t + ' = ?', a:String(b), accept:null, choix:null,
        expl:'Diviser, c\'est chercher dans la table : ' + t + ' × ' + b + ' = ' + p + ', donc ' + p + ' ÷ ' + t + ' = ' + b + '.'};
    }
  });

  /* ============================================================
     4. La multiplication posée
     ============================================================ */
  SKILLS.push({
    id: 'p1-04-multiplication-posee',
    phase: 1,
    ordre: 4,
    titre: 'La multiplication posée',
    objectif: "Poser et réussir une multiplication à 2 ou 3 chiffres, sans oublier retenues ni décalage.",
    lecon: `<p class="lede">La multiplication posée découpe un gros calcul en <mark>petites multiplications des tables</mark> suivies d'une addition. Deux règles font tout : les retenues et le décalage.</p>
<div class="etapes">
<p><strong>Exemple complet : 47 × 36</strong></p>
<p>1. Je pose 47 en haut, 36 en dessous, alignés à droite.</p>
<p>2. <strong>Ligne du 6</strong> (chiffre des unités de 36) : 6 × 7 = 42, j'écris 2, je retiens 4. Puis 6 × 4 = 24, plus la retenue : 24 + 4 = 28. Première ligne : 282.</p>
<p>3. <strong>Ligne du 3</strong> : ce 3 est un chiffre des dizaines, il vaut 30. Je commence donc par écrire <mark>un 0 à droite</mark> : c'est le décalage. Puis 3 × 7 = 21, j'écris 1, je retiens 2. Et 3 × 4 = 12, plus 2 = 14. Deuxième ligne : 1 410.</p>
<p>4. J'additionne les deux lignes : 282 + 1 410 = <mark>1 692</mark>.</p>
</div>
<p>Avec un nombre à 3 chiffres en bas (par exemple × 236), même logique : la ligne des centaines commence par <strong>deux zéros</strong>, car on multiplie par 200.</p>
<p>Cas rapide : multiplier par 20, 30, 40… Je multiplie par 2, 3, 4… puis <mark>j'ajoute un zéro</mark>. 26 × 30 : 26 × 3 = 78, donc 26 × 30 = 780.</p>
<div class="box piege"><p class="box-t">Piège classique</p><p>Oublier le zéro de décalage à la deuxième ligne. Sans lui, tu multiplies par 3 au lieu de 30 : ton résultat est dix fois trop petit.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Une ligne par chiffre du bas ; chaque ligne démarre avec autant de zéros que la position du chiffre l'exige ; on additionne toutes les lignes.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Avant de poser, estime l'ordre de grandeur : 47 × 36 ≈ 50 × 40 = 2 000. Si tu obtiens 16 920, tu sais immédiatement qu'il y a une erreur.</p></div>`,
    gen(level, R){
      var A, B, v;
      if(level === 1){
        v = R.int(1,2);
        A = R.int(13,79);
        while(A % 10 === 0){ A = R.int(13,79); }
        B = R.int(3,9);
        if(v === 1){
          return {q:'Pose et calcule : ' + A + ' × ' + B, a:String(A * B), accept:null, choix:null,
            expl:B + ' × ' + (A % 10) + ' = ' + (B*(A % 10)) + ' (retenue éventuelle), puis ' + B + ' × ' + Math.floor(A/10) + ' dizaines. Total : ' + (A*B) + '.'};
        }
        return {q:'Un carnet coûte ' + B + ' €. Combien coûtent ' + A + ' carnets, en € ?', a:String(A * B), accept:null, choix:null,
          expl:'On pose ' + A + ' × ' + B + ' = ' + (A*B) + ' €.'};
      }
      if(level === 2){
        v = R.int(1,2);
        if(v === 1){
          A = R.int(112,489); B = R.int(3,9);
          while(A % 10 === 0){ A = R.int(112,489); }
          return {q:'Pose et calcule : ' + A + ' × ' + B, a:String(A * B), accept:null, choix:null,
            expl:'Chiffre par chiffre en partant des unités, en reportant les retenues : ' + A + ' × ' + B + ' = ' + mf(A*B) + '.'};
        }
        A = R.int(13,68); B = R.int(12,47);
        while(A % 10 === 0){ A = R.int(13,68); }
        while(B % 10 === 0){ B = R.int(12,47); }
        return {q:'Pose et calcule : ' + A + ' × ' + B, a:String(A * B), accept:null, choix:null,
          expl:'Ligne des unités : ' + A + ' × ' + (B % 10) + ' = ' + (A*(B % 10)) + '. Ligne des dizaines (avec le 0 de décalage) : ' + A + ' × ' + (Math.floor(B/10)*10) + ' = ' + mf(A*Math.floor(B/10)*10) + '. Total : ' + mf(A*B) + '.'};
      }
      v = R.int(1,3);
      if(v === 1){
        A = R.int(123,689); B = R.int(13,58);
        while(A % 10 === 0){ A = R.int(123,689); }
        while(B % 10 === 0){ B = R.int(13,58); }
        return {q:'Pose et calcule : ' + A + ' × ' + B, a:String(A * B), accept:null, choix:null,
          expl:'Deux lignes : ' + A + ' × ' + (B % 10) + ' = ' + mf(A*(B % 10)) + ', puis ' + A + ' × ' + (Math.floor(B/10)*10) + ' = ' + mf(A*Math.floor(B/10)*10) + '. Somme : ' + mf(A*B) + '.'};
      }
      if(v === 2){
        A = R.int(13,89); B = R.pick([20,30,40,50,60]);
        while(A % 10 === 0){ A = R.int(13,89); }
        return {q:'Calcule astucieusement : ' + A + ' × ' + B, a:String(A * B), accept:null, choix:null,
          expl:A + ' × ' + (B/10) + ' = ' + (A*B/10) + ', puis on ajoute un zéro : ' + mf(A*B) + '.'};
      }
      var rg = R.int(14,32), si = R.int(12,28);
      return {q:'Une salle de spectacle compte ' + rg + ' rangées de ' + si + ' sièges. Combien de places en tout ?',
        a:String(rg * si), accept:null, choix:null,
        expl:'On pose ' + rg + ' × ' + si + ' = ' + mf(rg*si) + ' places. Ordre de grandeur pour vérifier : environ ' + (Math.round(rg/10)*10) + ' × ' + (Math.round(si/10)*10) + ' = ' + mf(Math.round(rg/10)*10*Math.round(si/10)*10) + '.'};
    }
  });

  /* ============================================================
     5. La division posée
     ============================================================ */
  SKILLS.push({
    id: 'p1-05-division-posee',
    phase: 1,
    ordre: 5,
    titre: 'La division posée',
    objectif: "Poser et réussir n'importe quelle division : euclidienne (quotient et reste), puis décimale exacte.",
    lecon: `<p class="lede">Diviser, c'est <mark>partager équitablement</mark>. La division posée répond à : « combien de fois le diviseur rentre-t-il dans le dividende, et que reste-t-il ? »</p>
<div class="etapes">
<p><strong>Exemple complet : 348 ÷ 6</strong></p>
<p>1. Je prends les chiffres de gauche : 3. Trop petit pour 6 (3 &lt; 6). Je prends donc 34.</p>
<p>2. Dans 34, combien de fois 6 ? 6 × 5 = 30, 6 × 6 = 36 (trop grand). J'écris <mark>5</mark> au quotient.</p>
<p>3. 34 − 30 = 4 : c'est le reste provisoire.</p>
<p>4. J'abaisse le chiffre suivant, le 8 : j'obtiens 48.</p>
<p>5. Dans 48, combien de fois 6 ? 6 × 8 = 48, exactement. J'écris <mark>8</mark> au quotient. Reste 0.</p>
<p>6. Résultat : 348 ÷ 6 = <mark>58</mark>. Vérification : 6 × 58 = 348. ✓</p>
</div>
<p>Quand ça ne tombe pas juste, c'est une <strong>division euclidienne</strong> : 157 ÷ 6 donne quotient 26 et reste 1, car 6 × 26 = 156 et il reste 1.</p>
<div class="formule"><p>dividende = diviseur × quotient + reste, avec <mark>reste &lt; diviseur</mark></p></div>
<p>Pour une <strong>division décimale</strong>, on continue après les unités : quand tous les chiffres sont abaissés et qu'il reste quelque chose, je place une <mark>virgule au quotient</mark> et j'abaisse un zéro. 87 ÷ 4 : quotient 21, reste 3 → virgule, j'abaisse un 0 : 30 ÷ 4 = 7, reste 2 → j'abaisse un 0 : 20 ÷ 4 = 5. Résultat : 21,75.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>À chaque étape : je cherche dans la table du diviseur, je soustrais, j'abaisse le chiffre suivant. Le reste doit toujours rester plus petit que le diviseur.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie toujours avec la multiplication : diviseur × quotient + reste doit redonner exactement le nombre de départ.</p></div>`,
    gen(level, R){
      var d, qt, r, n, v;
      if(level === 1){
        v = R.int(1,2);
        d = R.int(2,9);
        if(v === 1){
          qt = R.int(12,99); n = d * qt;
          return {q:'Pose et calcule : ' + n + ' ÷ ' + d, a:String(qt), accept:null, choix:null,
            expl:d + ' × ' + qt + ' = ' + n + ', donc ' + n + ' ÷ ' + d + ' = ' + qt + '.'};
        }
        qt = R.int(8,25); n = d * qt;
        return {q:'On partage équitablement ' + n + ' cartes entre ' + d + ' joueurs. Combien de cartes reçoit chaque joueur ?',
          a:String(qt), accept:null, choix:null,
          expl:'Partager, c\'est diviser : ' + n + ' ÷ ' + d + ' = ' + qt + ', car ' + d + ' × ' + qt + ' = ' + n + '.'};
      }
      if(level === 2){
        v = R.int(1,3);
        if(v === 3){
          d = R.int(3,9); qt = R.int(101,389); n = d * qt;
          return {q:'Pose et calcule : ' + mf(n) + ' ÷ ' + d, a:String(qt), accept:null, choix:null,
            expl:'On avance chiffre par chiffre en abaissant. Vérification : ' + d + ' × ' + qt + ' = ' + mf(n) + '.'};
        }
        d = R.int(3,9); qt = R.int(13,99); r = R.int(1, d - 1); n = d*qt + r;
        if(v === 1){
          return {q:'Dans la division euclidienne de ' + n + ' par ' + d + ', quel est le quotient ?', a:String(qt), accept:null, choix:null,
            expl:n + ' = ' + d + ' × ' + qt + ' + ' + r + ' : le quotient est ' + qt + ' et le reste ' + r + '.'};
        }
        return {q:'Dans la division euclidienne de ' + n + ' par ' + d + ', quel est le reste ?', a:String(r), accept:null, choix:null,
          expl:d + ' × ' + qt + ' = ' + (d*qt) + ' et ' + n + ' − ' + (d*qt) + ' = ' + r + '. Le reste ' + r + ' est bien plus petit que ' + d + '.'};
      }
      v = R.int(1,3);
      if(v === 1){
        d = R.pick([2,4,5,8]);
        var fracs = {2:[50], 4:[25,50,75], 5:[20,40,60,80], 8:[25,50,75]};
        var whole = R.int(11,60), frac = R.pick(fracs[d]);
        var resc = whole*100 + frac;
        n = d * resc / 100;
        return {q:'Calcule (le résultat est un nombre décimal) : ' + n + ' ÷ ' + d, a:String(resc/100), accept:acc2(resc), choix:null,
          expl:'Quand il reste quelque chose après les unités, on place la virgule au quotient et on abaisse un zéro. ' + d + ' × ' + fv(resc/100) + ' = ' + n + '.'};
      }
      if(v === 2){
        d = R.pick([11,12,15,25]); qt = R.int(12,49); r = R.int(1, d - 1); n = d*qt + r;
        var ask = R.int(1,2);
        if(ask === 1){
          return {q:'Dans la division euclidienne de ' + n + ' par ' + d + ', quel est le quotient ?', a:String(qt), accept:null, choix:null,
            expl:n + ' = ' + d + ' × ' + qt + ' + ' + r + '.'};
        }
        return {q:'Dans la division euclidienne de ' + n + ' par ' + d + ', quel est le reste ?', a:String(r), accept:null, choix:null,
          expl:d + ' × ' + qt + ' = ' + (d*qt) + ', et ' + n + ' − ' + (d*qt) + ' = ' + r + '.'};
      }
      d = R.pick([5,6,8,12]); qt = R.int(8,30); r = R.int(1, d - 1); n = d*qt + r;
      if(R.int(1,2) === 1){
        return {q:'Un fleuriste a ' + n + ' roses et compose des bouquets de ' + d + ' roses. Combien de bouquets complets peut-il faire ?',
          a:String(qt), accept:null, choix:null,
          expl:n + ' = ' + d + ' × ' + qt + ' + ' + r + ' : il fait ' + qt + ' bouquets et il reste ' + r + ' roses.'};
      }
      return {q:'Un fleuriste a ' + n + ' roses et compose des bouquets de ' + d + ' roses. Combien de roses resteront sans bouquet ?',
        a:String(r), accept:null, choix:null,
        expl:n + ' = ' + d + ' × ' + qt + ' + ' + r + ' : après ' + qt + ' bouquets, il reste ' + r + ' roses.'};
    }
  });

  /* ============================================================
     6. Les priorités de calcul
     ============================================================ */
  SKILLS.push({
    id: 'p1-06-priorites',
    phase: 1,
    ordre: 6,
    titre: 'Les priorités de calcul',
    objectif: "Calculer une expression en respectant les priorités : parenthèses, puis × et ÷, puis + et −.",
    lecon: `<p class="lede">Quand un calcul mélange plusieurs opérations, on ne lit PAS de gauche à droite : il existe un <mark>ordre de priorité</mark>, le même pour tout le monde.</p>
<div class="formule"><p>1. Les parenthèses d'abord → 2. puis × et ÷ → 3. puis + et −</p></div>
<div class="etapes">
<p><strong>Exemple : 5 + 3 × 4 − 2</strong></p>
<p>1. Pas de parenthèses. Je repère la multiplication : 3 × 4 = 12.</p>
<p>2. Le calcul devient : 5 + 12 − 2.</p>
<p>3. Il ne reste que + et − : là, je vais de gauche à droite. 5 + 12 = 17, puis 17 − 2 = <mark>15</mark>.</p>
</div>
<p>Avec des parenthèses, tout change : (5 + 3) × 4 = 8 × 4 = 32. Les parenthèses forcent le calcul intérieur en premier, même si c'est une addition.</p>
<p>Entre × et ÷ seulement (ou entre + et − seulement), il n'y a pas de chef : on calcule de gauche à droite. 20 ÷ 4 × 3 = 5 × 3 = 15.</p>
<div class="box piege"><p class="box-t">Piège classique</p><p>Calculer 4 + 3 × 5 de gauche à droite donne 35 : c'est FAUX. La multiplication passe d'abord : 4 + 15 = <mark>19</mark>.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Parenthèses, puis multiplications et divisions, puis additions et soustractions. Toujours, sans exception.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Avant de calculer, repère tous les × et ÷ : effectue-les d'abord, réécris le calcul simplifié sur une nouvelle ligne, puis termine tranquillement avec les + et les −.</p></div>`,
    gen(level, R){
      var x, y, z, w, v, res;
      if(level === 1){
        v = R.int(1,4);
        if(v === 1){
          x = R.int(2,9); y = R.int(2,9); z = R.int(2,9);
          res = x + y*z;
          return {q:'Calcule : ' + x + ' + ' + y + ' × ' + z, a:String(res), accept:null, choix:null,
            expl:'La multiplication d\'abord : ' + y + ' × ' + z + ' = ' + (y*z) + ', puis ' + x + ' + ' + (y*z) + ' = ' + res + '.'};
        }
        if(v === 2){
          x = R.int(2,9); y = R.int(2,9); z = R.int(2,9);
          var bon = y + ' × ' + z;
          return {q:'Dans le calcul ' + x + ' + ' + y + ' × ' + z + ', que dois-tu calculer en premier ?',
            a:bon, accept:null,
            choix:[bon, x + ' + ' + y, 'Je calcule de gauche à droite', "L'ordre n'a pas d'importance"],
            expl:'La multiplication est prioritaire sur l\'addition : ' + y + ' × ' + z + ' = ' + (y*z) + ', puis ' + x + ' + ' + (y*z) + ' = ' + (x + y*z) + '.'};
        }
        if(v === 3){
          x = R.int(2,7); y = R.int(2,7); z = R.int(2,6);
          res = (x + y)*z;
          return {q:'Calcule : (' + x + ' + ' + y + ') × ' + z, a:String(res), accept:null, choix:null,
            expl:'Les parenthèses d\'abord : ' + x + ' + ' + y + ' = ' + (x + y) + ', puis ' + (x + y) + ' × ' + z + ' = ' + res + '.'};
        }
        x = R.int(2,8); y = R.int(2,8);
        z = R.int(1, x*y - 1);
        res = x*y - z;
        return {q:'Calcule : ' + x + ' × ' + y + ' − ' + z, a:String(res), accept:null, choix:null,
          expl:x + ' × ' + y + ' = ' + (x*y) + ' d\'abord, puis ' + (x*y) + ' − ' + z + ' = ' + res + '.'};
      }
      if(level === 2){
        v = R.int(1,4);
        if(v === 1){
          x = R.int(2,9); y = R.int(2,6); z = R.int(2,6);
          w = R.int(1, x + y*z - 1);
          res = x + y*z - w;
          return {q:'Calcule : ' + x + ' + ' + y + ' × ' + z + ' − ' + w, a:String(res), accept:null, choix:null,
            expl:y + ' × ' + z + ' = ' + (y*z) + ' d\'abord. Puis de gauche à droite : ' + x + ' + ' + (y*z) + ' − ' + w + ' = ' + res + '.'};
        }
        if(v === 2){
          x = R.int(2,9); y = R.int(2,9); z = R.int(2,9); w = R.int(2,9);
          res = x*y + z*w;
          return {q:'Calcule : ' + x + ' × ' + y + ' + ' + z + ' × ' + w, a:String(res), accept:null, choix:null,
            expl:'Les deux multiplications d\'abord : ' + (x*y) + ' et ' + (z*w) + ', puis ' + (x*y) + ' + ' + (z*w) + ' = ' + res + '.'};
        }
        if(v === 3){
          z = R.int(2,6);
          var s = z * R.int(3,9);
          x = R.int(1, s - 1); y = s - x;
          return {q:'Calcule : (' + x + ' + ' + y + ') ÷ ' + z, a:String(s/z), accept:null, choix:null,
            expl:'Parenthèses d\'abord : ' + x + ' + ' + y + ' = ' + s + ', puis ' + s + ' ÷ ' + z + ' = ' + (s/z) + '.'};
        }
        y = R.int(2,6); z = R.int(2,6);
        x = R.int(y*z, y*z + 15);
        res = x - y*z;
        return {q:'Calcule : ' + x + ' − ' + y + ' × ' + z, a:String(res), accept:null, choix:null,
          expl:'Surtout pas de gauche à droite ! ' + y + ' × ' + z + ' = ' + (y*z) + ' d\'abord, puis ' + x + ' − ' + (y*z) + ' = ' + res + '.'};
      }
      v = R.int(1,4);
      if(v === 1){
        x = R.int(3,7); y = R.int(2,6); z = R.int(2,6); w = R.int(2,12);
        res = x*(y + z) - w;
        return {q:'Calcule : ' + x + ' × (' + y + ' + ' + z + ') − ' + w, a:String(res), accept:null, choix:null,
          expl:'Parenthèses : ' + y + ' + ' + z + ' = ' + (y + z) + '. Puis ' + x + ' × ' + (y + z) + ' = ' + (x*(y + z)) + '. Enfin − ' + w + ' : ' + res + '.'};
      }
      if(v === 2){
        x = R.int(6,12); y = R.int(1, x - 2); z = R.int(2,6); w = R.int(2,6);
        res = (x - y)*(z + w);
        return {q:'Calcule : (' + x + ' − ' + y + ') × (' + z + ' + ' + w + ')', a:String(res), accept:null, choix:null,
          expl:'Chaque parenthèse d\'abord : ' + (x - y) + ' et ' + (z + w) + ', puis ' + (x - y) + ' × ' + (z + w) + ' = ' + res + '.'};
      }
      if(v === 3){
        y = R.int(4,9); z = R.int(1, y - 1); w = R.int(2,6); x = R.int(2,15);
        res = x + (y - z)*w;
        return {q:'Calcule : ' + x + ' + (' + y + ' − ' + z + ') × ' + w, a:String(res), accept:null, choix:null,
          expl:'Parenthèse : ' + y + ' − ' + z + ' = ' + (y - z) + '. Multiplication : ' + (y - z) + ' × ' + w + ' = ' + ((y - z)*w) + '. Puis ' + x + ' + ' + ((y - z)*w) + ' = ' + res + '.'};
      }
      z = R.int(2,6); var kq = R.int(2,9); y = z*kq;
      x = R.int(kq, kq + 12); w = R.int(1,9);
      res = x - kq + w;
      return {q:'Calcule : ' + x + ' − ' + y + ' ÷ ' + z + ' + ' + w, a:String(res), accept:null, choix:null,
        expl:'La division d\'abord : ' + y + ' ÷ ' + z + ' = ' + kq + '. Puis de gauche à droite : ' + x + ' − ' + kq + ' + ' + w + ' = ' + res + '.'};
    }
  });

  /* ============================================================
     7. Les nombres relatifs (+ et −)
     ============================================================ */
  SKILLS.push({
    id: 'p1-07-relatifs',
    phase: 1,
    ordre: 7,
    titre: 'Les nombres relatifs (+ et −)',
    objectif: "Comparer, additionner et soustraire des nombres relatifs sans erreur de signe.",
    lecon: `<p class="lede">Un nombre relatif, c'est un nombre avec un signe : +5 ou −3. L'image à garder en tête : <mark>le thermomètre</mark>. Au-dessus de zéro : positif. En dessous : négatif.</p>
<p>Sur la droite graduée, les nombres augmentent vers la droite. Donc <mark>−7 &lt; −2</mark> : par −7 °C, il fait PLUS froid que par −2 °C, même si « 7 est plus grand que 2 ».</p>
<div class="etapes">
<p><strong>Additionner avec le thermomètre :</strong></p>
<p>1. (−3) + 5 : il fait −3 °C, la température monte de 5 → je passe par −2, −1, 0, 1, 2. Résultat : <mark>2</mark>.</p>
<p>2. 4 − 9 : il fait 4 °C, ça descend de 9 → 4 − 4 = 0, puis encore 5 de moins : <mark>−5</mark>.</p>
<p>3. (−2) + (−6) : deux baisses dans le même sens → <mark>−8</mark>.</p>
</div>
<p>Règles générales : <strong>même signe</strong> → j'additionne les distances à zéro et je garde le signe. <strong>Signes contraires</strong> → je soustrais les distances et je prends le signe du plus « fort » : (−3) + 5 = +2, car 5 est plus loin de zéro que 3.</p>
<p>Pour <strong>soustraire</strong>, une seule règle : soustraire un nombre, c'est <mark>ajouter son opposé</mark>. Donc (−2) − (−6) = (−2) + 6 = 4. Et 5 − (−3) = 5 + 3 = 8.</p>
<div class="box piege"><p class="box-t">Piège classique</p><p>Deux signes moins qui se suivent deviennent un plus : − (−3) = + 3. C'est LA source d'erreurs numéro un sur les relatifs.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Comparer : le plus à droite sur la droite graduée gagne. Additionner : pense au thermomètre. Soustraire : ajoute l'opposé.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>En cas de doute, dessine une mini-droite graduée au brouillon et déplace-toi dessus. Dix secondes qui évitent l'erreur de signe.</p></div>`,
    gen(level, R){
      var v, x, y, res, t0;
      if(level === 1){
        v = R.int(1,4);
        if(v === 1){
          var mode = R.int(1,3), vals, bonV;
          if(mode === 3){
            vals = [R.int(-9,-8), R.int(-7,-5), R.int(-4,-3), R.int(-2,-1)];
            bonV = Math.max.apply(null, vals);
            return {q:'Quel est le plus grand de ces nombres ?', a:String(bonV), accept:null,
              choix: vals.map(String),
              expl:'Entre deux négatifs, le plus grand est le plus proche de zéro : ' + sd(bonV) + ' est le moins « froid ».'};
          }
          vals = [R.int(-9,-5), R.int(-4,-1), R.int(0,4), R.int(5,9)];
          if(mode === 1){
            bonV = Math.max.apply(null, vals);
            return {q:'Quel est le plus grand de ces nombres ?', a:String(bonV), accept:null,
              choix: vals.map(String),
              expl:'Sur la droite graduée, le plus grand est le plus à droite : ' + sd(bonV) + '.'};
          }
          bonV = Math.min.apply(null, vals);
          return {q:'Quel est le plus petit de ces nombres ?', a:String(bonV), accept:null,
            choix: vals.map(String),
            expl:'Le plus petit est le plus à gauche sur la droite graduée (le plus « froid ») : ' + sd(bonV) + '.'};
        }
        if(v === 2){
          t0 = R.int(-9,-1); y = R.int(2,15); res = t0 + y;
          return {q:'Ce matin, il fait ' + sd(t0) + ' °C. La température monte de ' + y + ' °C. Quelle température fait-il maintenant ?',
            a:String(res), accept:accPlus(res), choix:null,
            expl:'Sur le thermomètre : de ' + sd(t0) + ', je monte de ' + y + ' → ' + sd(res) + ' °C.'};
        }
        if(v === 3){
          t0 = R.int(-5,8); y = R.int(3,12); res = t0 - y;
          return {q:'Il fait ' + sd(t0) + ' °C. La température baisse de ' + y + ' °C. Quelle température fait-il maintenant ?',
            a:String(res), accept:accPlus(res), choix:null,
            expl:'De ' + sd(t0) + ', je descends de ' + y + ' → ' + sd(res) + ' °C.'};
        }
        x = R.int(2,9); y = R.int(1,9); res = y - x;
        return {q:'Calcule : (−' + x + ') + ' + y, a:String(res), accept:accPlus(res), choix:null,
          expl:'Signes contraires : je soustrais les distances (' + Math.max(x,y) + ' − ' + Math.min(x,y) + ') et je garde le signe du plus fort. Résultat : ' + sd(res) + '.'};
      }
      if(level === 2){
        v = R.int(1,4);
        if(v === 1){
          x = R.int(2,12); y = R.int(2,12); res = x - y;
          return {q:'Calcule : ' + x + ' + (−' + y + ')', a:String(res), accept:accPlus(res), choix:null,
            expl:'Ajouter (−' + y + '), c\'est descendre de ' + y + ' : ' + x + ' − ' + y + ' = ' + sd(res) + '.'};
        }
        if(v === 2){
          x = R.int(2,12); y = R.int(2,12); res = -(x + y);
          return {q:'Calcule : (−' + x + ') + (−' + y + ')', a:String(res), accept:null, choix:null,
            expl:'Même signe : j\'additionne les distances (' + x + ' + ' + y + ' = ' + (x + y) + ') et je garde le signe − : ' + sd(res) + '.'};
        }
        if(v === 3){
          x = R.int(1,9); y = R.int(x + 1, 15); res = x - y;
          return {q:'Calcule : ' + x + ' − ' + y, a:String(res), accept:null, choix:null,
            expl:'Je descends de ' + y + ' en partant de ' + x + ' : je passe sous zéro. ' + x + ' − ' + y + ' = ' + sd(res) + '.'};
        }
        var t1 = R.int(-9,-1), t2 = R.int(1,9);
        return {q:'La température passe de ' + sd(t1) + ' °C à ' + t2 + ' °C. De combien de degrés a-t-elle augmenté ?',
          a:String(t2 - t1), accept:null, choix:null,
          expl:'De ' + sd(t1) + ' à 0, il y a ' + (-t1) + ' degrés ; de 0 à ' + t2 + ', encore ' + t2 + '. Total : ' + (t2 - t1) + ' degrés.'};
      }
      v = R.int(1,4);
      if(v === 1){
        x = R.int(2,12); y = R.int(2,12); res = y - x;
        return {q:'Calcule : (−' + x + ') − (−' + y + ')', a:String(res), accept:accPlus(res), choix:null,
          expl:'Soustraire (−' + y + '), c\'est ajouter ' + y + ' : (−' + x + ') + ' + y + ' = ' + sd(res) + '.'};
      }
      if(v === 2){
        var s1 = R.int(-9,-2), s2 = R.int(3,12), t3 = R.int(1,9);
        res = s1 + s2 - t3;
        return {q:'Calcule : ' + pn(s1) + ' + ' + s2 + ' − ' + t3, a:String(res), accept:accPlus(res), choix:null,
          expl:'De gauche à droite : ' + pn(s1) + ' + ' + s2 + ' = ' + sd(s1 + s2) + ', puis ' + sd(s1 + s2) + ' − ' + t3 + ' = ' + sd(res) + '.'};
      }
      if(v === 3){
        var solde = -R.int(15,80), depot = R.int(20,120);
        res = solde + depot;
        return {q:'Ton compte bancaire affiche un solde de ' + sd(solde) + ' €. Tu déposes ' + depot + ' €. Quel est le nouveau solde, en € ?',
          a:String(res), accept:accPlus(res), choix:null,
          expl:sd(solde) + ' + ' + depot + ' = ' + sd(res) + ' : le dépôt comble le découvert' + (res >= 0 ? ' et le dépasse.' : ', mais pas entièrement.')};
      }
      x = R.int(-5,9); y = R.int(2,9); res = x + y;
      return {q:'Calcule : ' + pn(x) + ' − (−' + y + ')', a:String(res), accept:accPlus(res), choix:null,
        expl:'Deux signes − qui se suivent deviennent un + : ' + pn(x) + ' + ' + y + ' = ' + sd(res) + '.'};
    }
  });

  /* ============================================================
     8. Les nombres décimaux
     ============================================================ */
  SKILLS.push({
    id: 'p1-08-decimaux',
    phase: 1,
    ordre: 8,
    titre: 'Les nombres décimaux',
    objectif: "Maîtriser la virgule : multiplier et diviser par 10, 100, 1 000, opérer sur les décimaux, estimer un ordre de grandeur.",
    lecon: `<p class="lede">Un nombre décimal a deux parties séparées par la virgule : la partie entière et la partie décimale. Dans 12,47 : 12 entiers, puis 4 <mark>dixièmes</mark> et 7 <mark>centièmes</mark>.</p>
<table class="tbl"><tr><th>dizaines</th><th>unités</th><th>,</th><th>dixièmes</th><th>centièmes</th></tr><tr><td>1</td><td>2</td><td>,</td><td>4</td><td>7</td></tr></table>
<p>Multiplier ou diviser par 10, 100, 1 000 ne change pas les chiffres : ça <mark>déplace la virgule</mark>.</p>
<div class="etapes">
<p><strong>La règle du déplacement :</strong></p>
<p>1. × 10, × 100, × 1 000 : la virgule part vers la <strong>droite</strong> de 1, 2, 3 rangs. Exemple : 3,47 × 100 = 347.</p>
<p>2. ÷ 10, ÷ 100, ÷ 1 000 : la virgule part vers la <strong>gauche</strong>. Exemple : 34,7 ÷ 10 = 3,47.</p>
<p>3. S'il manque des rangs, on complète avec des zéros : 3,5 × 1 000 = 3 500 et 47 ÷ 100 = 0,47.</p>
</div>
<p>Pour multiplier deux décimaux : je calcule <strong>sans les virgules</strong>, puis je replace autant de chiffres après la virgule qu'il y en a en tout dans les deux nombres. 0,4 × 0,7 : 4 × 7 = 28, deux chiffres décimaux en tout → <mark>0,28</mark>.</p>
<div class="box piege"><p class="box-t">Piège classique</p><p>0,8 est PLUS GRAND que 0,45. On ne compare pas « 8 et 45 » : on compare les dixièmes (8 contre 4). Au besoin, écris 0,80 et 0,45.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>× 10 = virgule vers la droite, ÷ 10 = virgule vers la gauche. Et multiplier par un nombre plus petit que 1 <mark>diminue</mark> : 0,4 × 0,7 = 0,28.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour estimer un ordre de grandeur, arrondis chaque nombre à un nombre simple : 49,7 × 2,1 ≈ 50 × 2 = 100. Réflexe en or pour vérifier un calcul… ou gagner du temps aux concours.</p></div>`,
    gen(level, R){
      var v, c, t, res;
      if(level === 1){
        v = R.int(1,4);
        if(v === 1){
          c = R.int(101,999);
          while(c % 10 === 0){ c = R.int(101,999); }
          var op = R.pick([10,100]);
          res = (op === 10) ? c/10 : c;
          return {q:'Calcule : ' + fv(c/100) + ' × ' + op, a:String(res), accept:null, choix:null,
            expl:'× ' + op + ' : la virgule se déplace de ' + (op === 10 ? '1 rang' : '2 rangs') + ' vers la droite : ' + fv(res) + '.'};
        }
        if(v === 2){
          t = R.int(11,99);
          while(t % 10 === 0){ t = R.int(11,99); }
          return {q:'Calcule : ' + fv(t/10) + ' ÷ 10', a:String(t/100), accept:null, choix:null,
            expl:'÷ 10 : la virgule se déplace de 1 rang vers la gauche : ' + fv(t/100) + '.'};
        }
        if(v === 3){
          c = R.int(101,9999);
          while(c % 10 === 0){ c = R.int(101,9999); }
          var posd = R.pick([['dixièmes', Math.floor(c/10) % 10], ['centièmes', c % 10]]);
          return {q:'Dans le nombre ' + fv(c/100) + ', quel est le chiffre des ' + posd[0] + ' ?', a:String(posd[1]), accept:null, choix:null,
            expl:'Après la virgule : d\'abord les dixièmes, puis les centièmes. Ici, le chiffre des ' + posd[0] + ' est ' + posd[1] + '.'};
        }
        t = R.int(3,9);
        var c2 = R.int(11, t*10 - 1);
        while(c2 % 10 === 0){ c2 = R.int(11, t*10 - 1); }
        var modeC = R.int(1,2);
        var paire = R.shuffle([fv(t/10), fv(c2/100)]);
        return {q:'Écris le plus ' + (modeC === 1 ? 'grand' : 'petit') + ' de ces deux nombres : ' + paire[0] + ' ou ' + paire[1] + '.',
          a: modeC === 1 ? String(t/10) : String(c2/100), accept:null, choix:null,
          expl:'Écris-les avec deux décimales : ' + fv(t/10) + '0 et ' + fv(c2/100) + '. On compare alors les dixièmes : ' + t + ' contre ' + Math.floor(c2/10) + '.'};
      }
      if(level === 2){
        v = R.int(1,4);
        if(v === 1){
          c = R.int(101,999);
          while(c % 10 === 0){ c = R.int(101,999); }
          return {q:'Calcule : ' + fv(c/100) + ' × 1 000', a:String(c*10), accept:null, choix:null,
            expl:'× 1 000 : la virgule saute de 3 rangs vers la droite. Il manque un rang : on complète avec un zéro → ' + mf(c*10) + '.'};
        }
        if(v === 2){
          c = R.int(101,999);
          while(c % 10 === 0){ c = R.int(101,999); }
          return {q:'Calcule : ' + c + ' ÷ 100', a:String(c/100), accept:null, choix:null,
            expl:'÷ 100 : la virgule (invisible, après le ' + (c % 10) + ') recule de 2 rangs : ' + fv(c/100) + '.'};
        }
        if(v === 3){
          var T = R.pick([5,15,25,35]), k = R.int(2,8);
          res = T*k/10;
          return {q:'Calcule : ' + fv(T/10) + ' × ' + k, a:String(res), accept:null, choix:null,
            expl:'Sans la virgule : ' + T + ' × ' + k + ' = ' + (T*k) + '. Un chiffre après la virgule au départ → ' + fv(res) + '.'};
        }
        var Ac = R.pick([125,175,225,250,275,325]), Bc = R.pick([25,50,75,125,150]);
        return {q:'Calcule : ' + fv(Ac/100) + ' + ' + fv(Bc/100), a:String((Ac + Bc)/100), accept:acc2(Ac + Bc), choix:null,
          expl:'On aligne les virgules : ' + fv(Ac/100) + ' + ' + fv(Bc/100) + ' = ' + fv((Ac + Bc)/100) + '.'};
      }
      v = R.int(1,4);
      if(v === 1){
        var p = R.int(2,19), qd = R.int(2,9);
        while(p % 10 === 0){ p = R.int(2,19); }
        res = p*qd/100;
        return {q:'Calcule : ' + fv(p/10) + ' × ' + fv(qd/10), a:String(res), accept:null, choix:null,
          expl:'Sans les virgules : ' + p + ' × ' + qd + ' = ' + (p*qd) + '. Deux chiffres décimaux en tout → ' + fv(res) + '.'};
      }
      if(v === 2){
        var kk = R.int(101,999);
        while(kk % 10 === 0){ kk = R.int(101,999); }
        var nn = kk*10;
        return {q:'Calcule : ' + mf(nn) + ' ÷ 1 000', a:String(nn/1000), accept:null, choix:null,
          expl:'÷ 1 000 : la virgule recule de 3 rangs : ' + fv(nn/1000) + '.'};
      }
      if(v === 3){
        var E = R.pick([['49,7 × 2,1', 100], ['19,8 × 4,9', 100], ['98 × 5,1', 500], ['302 × 2,9', 900], ['48,1 × 9,8', 500], ['9,9 × 8,2', 80]]);
        var og = E[1];
        return {q:'Quel est l\'ordre de grandeur de ' + E[0] + ' ?', a:String(og), accept:null,
          choix:[String(og), mf(og*10), String(og/10), mf(og*2)],
          expl:'On arrondit chaque nombre à un nombre simple avant de multiplier de tête. Résultat proche de ' + mf(og) + '.'};
      }
      c = R.int(5,95);
      while(c % 10 === 0){ c = R.int(5,95); }
      return {q:'Calcule : 1 − ' + fv(c/100), a:String((100 - c)/100), accept:null, choix:null,
        expl:'Pense en centièmes : 1 = 100 centièmes, et 100 − ' + c + ' = ' + (100 - c) + ' centièmes, soit ' + fv((100 - c)/100) + '.'};
    }
  });

  /* ============================================================
     9. Le sens des fractions
     ============================================================ */
  SKILLS.push({
    id: 'p1-09-fractions-sens',
    phase: 1,
    ordre: 9,
    titre: 'Le sens des fractions',
    objectif: "Comprendre la fraction comme un partage, comparer des fractions et prendre une fraction d'une quantité.",
    lecon: `<p class="lede">Une fraction, c'est un <mark>partage</mark> : 3/4, c'est « je coupe en 4 parts égales et j'en prends 3 ». Le nombre du bas (le <strong>dénominateur</strong>) dit en combien on coupe ; celui du haut (le <strong>numérateur</strong>) dit combien on prend.</p>
<p>Comparer une fraction à 1 devient alors évident : si je prends moins de parts qu'il n'y en a, j'ai moins d'un entier. <mark>numérateur &lt; dénominateur → fraction &lt; 1</mark> ; numérateur = dénominateur → exactement 1 (4/4 = 1) ; numérateur &gt; dénominateur → plus de 1 (7/5).</p>
<div class="etapes">
<p><strong>Calculer les 3/4 de 20 :</strong></p>
<p>1. Je coupe 20 en 4 parts égales : 20 ÷ 4 = 5. Une part vaut 5 : c'est 1/4 de 20.</p>
<p>2. J'en prends 3 : 5 × 3 = <mark>15</mark>.</p>
</div>
<div class="formule"><p>a/b d'une quantité N = (N ÷ b) × a</p></div>
<p><strong>Fractions égales</strong> : si je coupe chaque part en deux, j'ai deux fois plus de parts et j'en prends deux fois plus — rien ne change : 3/4 = 6/8. On peut multiplier (ou diviser) le haut ET le bas par le même nombre. C'est aussi comme ça qu'on <strong>simplifie</strong> : 12/18 = 2/3 (haut et bas divisés par 6).</p>
<p><strong>Comparer</strong> deux fractions de même dénominateur : parts de même taille, gagne celle qui en prend le plus (5/7 &gt; 3/7). Dénominateurs différents mais multiples ? Mets-les au même dénominateur : 3/4 = 6/8 &gt; 5/8.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Le dénominateur coupe, le numérateur prend. Prendre a/b de N : je divise par b, puis je multiplie par a.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Visualise toujours une pizza. 7/5, c'est plus d'une pizza : une entière (5/5) plus 2 parts d'une deuxième. D'un coup d'œil, tu sais si une fraction dépasse 1.</p></div>`,
    gen(level, R){
      var v, d, n, m, k;
      if(level === 1){
        v = R.int(1,4);
        if(v === 1){
          d = R.pick([3,4,5,6,8,10]); n = R.int(1, d - 1);
          while(gcd(n,d) !== 1){ n = R.int(1, d - 1); }
          var ctx = R.pick(['Une tarte est coupée en', 'Une pizza est coupée en', 'Une tablette de chocolat est partagée en']);
          return {q:ctx + ' ' + d + ' parts égales. Tu en prends ' + n + '. Quelle fraction du total as-tu prise ? (réponds sous la forme n/d)',
            a:n + '/' + d, accept:null, choix:null,
            expl:'Le dénominateur dit en combien on coupe (' + d + '), le numérateur combien on prend (' + n + ') : ' + n + '/' + d + '.'};
        }
        if(v === 2){
          var d1 = R.int(2,7), n1 = d1 + R.int(1,4);
          var bon = n1 + '/' + d1;
          var dA = R.int(3,9), nA = R.int(1, dA - 1), f1 = nA + '/' + dA;
          var dB = R.int(3,9), nB = R.int(1, dB - 1), f2 = nB + '/' + dB;
          while(f2 === f1){ dB = R.int(3,9); nB = R.int(1, dB - 1); f2 = nB + '/' + dB; }
          k = R.int(2,9);
          return {q:'Parmi ces fractions, laquelle est plus grande que 1 ?', a:bon, accept:null,
            choix:[bon, f1, f2, k + '/' + k],
            expl:'Une fraction dépasse 1 quand son numérateur (en haut) dépasse son dénominateur (en bas) : ' + bon + ' > 1. Et ' + k + '/' + k + ' = 1 exactement.'};
        }
        if(v === 3){
          d = R.pick([2,3,4,5,10]); m = R.int(2,9);
          return {q:'Calcule 1/' + d + ' de ' + (d*m) + '.', a:String(m), accept:null, choix:null,
            expl:'Prendre 1/' + d + ', c\'est diviser par ' + d + ' : ' + (d*m) + ' ÷ ' + d + ' = ' + m + '.'};
        }
        d = R.pick([3,4,5,7,8]); n = R.int(1, d - 1);
        var haut = R.int(1,2) === 1;
        return {q:'Dans la fraction ' + n + '/' + d + ', comment s\'appelle le nombre du ' + (haut ? 'haut' : 'bas') + ' ?',
          a: haut ? 'le numérateur' : 'le dénominateur', accept: haut ? ['numérateur'] : ['dénominateur'],
          choix:[haut ? 'le numérateur' : 'le dénominateur', haut ? 'le dénominateur' : 'le numérateur', 'le quotient', 'le reste'],
          expl:'En bas, le dénominateur (il dénomme la taille des parts) ; en haut, le numérateur (il compte les parts prises).'};
      }
      if(level === 2){
        v = R.int(1,4);
        if(v === 1){
          n = R.int(1,5); d = R.int(2,6);
          while(n >= d || gcd(n,d) !== 1){ n = R.int(1,5); d = R.int(2,6); }
          k = R.int(2,5);
          return {q:'Complète : ' + n + '/' + d + ' = ?/' + (d*k), a:String(n*k), accept:null, choix:null,
            expl:'Le dénominateur a été multiplié par ' + k + ' (' + d + ' × ' + k + ' = ' + (d*k) + ') : on multiplie aussi le numérateur : ' + n + ' × ' + k + ' = ' + (n*k) + '.'};
        }
        if(v === 2){
          d = R.int(5,12);
          var na = R.int(1, d - 1);
          while(gcd(na,d) !== 1){ na = R.int(1, d - 1); }
          var nb = R.int(1, d - 1);
          while(nb === na || gcd(nb,d) !== 1){ nb = R.int(1, d - 1); }
          var big = Math.max(na,nb);
          return {q:'Écris la plus grande de ces deux fractions : ' + na + '/' + d + ' ou ' + nb + '/' + d + '.',
            a:big + '/' + d, accept:null, choix:null,
            expl:'Même dénominateur = parts de même taille : gagne celle qui en prend le plus, donc ' + big + '/' + d + '.'};
        }
        if(v === 3){
          d = R.pick([3,4,5,8,10]); n = R.int(2, d - 1);
          while(gcd(n,d) !== 1){ n = R.int(2, d - 1); }
          m = R.int(2,12);
          return {q:'Calcule les ' + n + '/' + d + ' de ' + (d*m) + '.', a:String(n*m), accept:null, choix:null,
            expl:'Je divise par ' + d + ' : ' + (d*m) + ' ÷ ' + d + ' = ' + m + '. Puis je multiplie par ' + n + ' : ' + m + ' × ' + n + ' = ' + (n*m) + '.'};
        }
        var noms = {2:'demis', 3:'tiers', 4:'quarts', 5:'cinquièmes', 8:'huitièmes', 10:'dixièmes'};
        d = R.pick([2,3,4,5,8,10]);
        return {q:'Combien de ' + noms[d] + ' faut-il pour faire un entier (1) ?', a:String(d), accept:null, choix:null,
          expl:d + '/' + d + ' = 1 : il faut ' + d + ' parts de 1/' + d + ' pour reconstituer l\'entier.'};
      }
      v = R.int(1,4);
      if(v === 1){
        var p = R.int(1,7), qd = R.int(2,9);
        while(p >= qd || gcd(p,qd) !== 1){ p = R.int(1,7); qd = R.int(2,9); }
        k = R.pick([2,3,4,5,6]);
        return {q:'Simplifie au maximum la fraction ' + (p*k) + '/' + (qd*k) + '.', a:p + '/' + qd, accept:null, choix:null,
          expl:'Haut et bas sont divisibles par ' + k + ' : ' + (p*k) + ' ÷ ' + k + ' = ' + p + ' et ' + (qd*k) + ' ÷ ' + k + ' = ' + qd + ', donc ' + p + '/' + qd + '.'};
      }
      if(v === 2){
        d = R.pick([2,3,4,5]);
        var n1b = R.int(1, d - 1);
        while(gcd(n1b,d) !== 1){ n1b = R.int(1, d - 1); }
        var n2b = R.int(1, 2*d - 1);
        while(n2b === 2*n1b || gcd(n2b, 2*d) !== 1){ n2b = R.int(1, 2*d - 1); }
        var gagne = (2*n1b > n2b) ? (n1b + '/' + d) : (n2b + '/' + (2*d));
        return {q:'Écris la plus grande de ces deux fractions : ' + n1b + '/' + d + ' ou ' + n2b + '/' + (2*d) + '.',
          a:gagne, accept:null, choix:null,
          expl:'Même dénominateur ' + (2*d) + ' : ' + n1b + '/' + d + ' = ' + (2*n1b) + '/' + (2*d) + '. On compare ' + (2*n1b) + ' et ' + n2b + ' : la plus grande est ' + gagne + '.'};
      }
      if(v === 3){
        var FD = R.pick([[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[3,10],[7,10],[9,10]]);
        return {q:'Écris ' + FD[0] + '/' + FD[1] + ' en écriture décimale.', a:String(FD[0]/FD[1]), accept:null, choix:null,
          expl:FD[0] + '/' + FD[1] + ' = ' + FD[0] + ' ÷ ' + FD[1] + ' = ' + fv(FD[0]/FD[1]) + '.'};
      }
      d = R.pick([3,4,5,10]); n = R.int(2, d - 1);
      while(gcd(n,d) !== 1){ n = R.int(2, d - 1); }
      var base = d * R.int(15,60);
      return {q:'Dans un lycée de ' + base + ' élèves, les ' + n + '/' + d + ' mangent à la cantine. Combien d\'élèves cela représente-t-il ?',
        a:String(base/d*n), accept:null, choix:null,
        expl:base + ' ÷ ' + d + ' = ' + (base/d) + ', puis ' + (base/d) + ' × ' + n + ' = ' + (base/d*n) + ' élèves.'};
    }
  });

  /* ============================================================
     10. La proportionnalité
     ============================================================ */
  SKILLS.push({
    id: 'p1-10-proportionnalite',
    phase: 1,
    ordre: 10,
    titre: 'La proportionnalité',
    objectif: "Reconnaître une situation de proportionnalité et la résoudre par le coefficient ou le passage à l'unité.",
    lecon: `<p class="lede">Deux grandeurs sont <mark>proportionnelles</mark> quand on passe de l'une à l'autre en multipliant toujours par le même nombre : le coefficient. Deux fois plus de croissants → deux fois plus cher.</p>
<table class="tbl"><tr><th>Croissants</th><td>3</td><td>1</td><td>5</td></tr><tr><th>Prix (€)</th><td>3,60</td><td>1,20</td><td>6,00</td></tr></table>
<div class="etapes">
<p><strong>La méthode reine : le passage par l'unité (règle de trois)</strong></p>
<p>Problème : 3 croissants coûtent 3,60 €. Combien coûtent 5 croissants ?</p>
<p>1. Je redescends à UN croissant : 3,60 ÷ 3 = 1,20 €.</p>
<p>2. Je remonte à 5 croissants : 1,20 × 5 = <mark>6 €</mark>.</p>
</div>
<p>Autre outil : le <strong>coefficient de proportionnalité</strong>, le nombre qui fait passer d'une ligne du tableau à l'autre. Si 4 kg coûtent 10 €, le coefficient est 10 ÷ 4 = 2,5 : c'est le prix d'un kg. N'importe quelle masse × 2,5 donne son prix.</p>
<p>Les raccourcis restent permis : si je connais le prix de 3 kg, celui de 6 kg est le double, celui de 9 kg le triple.</p>
<div class="box piege"><p class="box-t">Piège classique</p><p>Tout n'est pas proportionnel ! La taille d'une personne n'est pas proportionnelle à son âge (à 40 ans, on ne mesure pas 4 fois sa taille de 10 ans). Un prix avec des frais fixes (taxi avec prise en charge) non plus. Teste : « zéro donne-t-il zéro ? doubler l'un double-t-il l'autre ? »</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Proportionnel = même coefficient partout. Méthode fiable à 100 % : diviser pour revenir à 1, puis multiplier pour aller où on veut.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Aux concours SESAME et ACCÈS, la proportionnalité est partout : prix, vitesses, recettes, pourcentages. Le réflexe « passage par l'unité » te sauvera des dizaines de fois.</p></div>`,
    gen(level, R){
      var v, u, k, tot;
      if(level === 1){
        v = R.int(1,3);
        if(v === 1){
          var IT = R.pick([['croissant','croissants'], ['cahier','cahiers'], ['ticket','tickets'], ['pain au chocolat','pains au chocolat']]);
          u = R.pick([60,80,90,120,150,250]); k = R.int(3,6); tot = u*k;
          return {q:k + ' ' + IT[1] + ' coûtent ' + eur(tot) + ' €. Quel est le prix d\'un ' + IT[0] + ', en € ?',
            a:String(u/100), accept:acc2(u), choix:null,
            expl:'On divise par ' + k + ' pour revenir à l\'unité : ' + eur(tot) + ' ÷ ' + k + ' = ' + eur(u) + ' €.'};
        }
        if(v === 2){
          var x1 = R.int(2,6), coef = R.int(2,6), x2 = R.int(2,9);
          while(x2 === x1){ x2 = R.int(2,9); }
          return {q:'Dans un tableau de proportionnalité, ' + x1 + ' donne ' + (x1*coef) + '. Combien donne ' + x2 + ' ?',
            a:String(x2*coef), accept:null, choix:null,
            expl:'Coefficient : ' + (x1*coef) + ' ÷ ' + x1 + ' = ' + coef + '. Donc ' + x2 + ' × ' + coef + ' = ' + (x2*coef) + '.'};
        }
        var k1 = R.int(2,5), pu = R.int(2,5), mm = R.pick([2,3]);
        return {q:k1 + ' kg de fruits coûtent ' + (k1*pu) + ' €. Combien coûtent ' + (k1*mm) + ' kg, en € ?',
          a:String(k1*pu*mm), accept:null, choix:null,
          expl:(k1*mm) + ' kg, c\'est ' + (mm === 2 ? 'le double' : 'le triple') + ' de ' + k1 + ' kg : le prix ' + (mm === 2 ? 'double' : 'triple') + ' aussi → ' + (k1*pu*mm) + ' €.'};
      }
      if(level === 2){
        v = R.int(1,3);
        if(v === 1){
          u = R.pick([80,120,150,180,240,250]);
          var ka = R.int(2,6), kb = R.int(2,9);
          while(kb === ka){ kb = R.int(2,9); }
          return {q:ka + ' kg de pommes coûtent ' + eur(u*ka) + ' €. Combien coûtent ' + kb + ' kg, en € ?',
            a:String(u*kb/100), accept:acc2(u*kb), choix:null,
            expl:'Prix d\'un kg : ' + eur(u*ka) + ' ÷ ' + ka + ' = ' + eur(u) + ' €. Puis ' + eur(u) + ' × ' + kb + ' = ' + eur(u*kb) + ' €.'};
        }
        if(v === 2){
          var p1 = R.pick([2,4,6]), g = R.pick([50,60,75,80,90]), p2 = R.int(2,9);
          while(p2 === p1){ p2 = R.int(2,9); }
          return {q:'Pour ' + p1 + ' personnes, il faut ' + (g*p1) + ' g de riz. Quelle masse de riz faut-il pour ' + p2 + ' personnes, en g ?',
            a:String(g*p2), accept:null, choix:null,
            expl:'Pour 1 personne : ' + (g*p1) + ' ÷ ' + p1 + ' = ' + g + ' g. Pour ' + p2 + ' : ' + g + ' × ' + p2 + ' = ' + (g*p2) + ' g.'};
        }
        var xa = R.int(2,8), c2 = R.pick([3,4,5,6,7,9]);
        var y1 = xa*c2/2;
        return {q:'Dans un tableau de proportionnalité, ' + xa + ' donne ' + fv(y1) + '. Quel est le coefficient de proportionnalité ?',
          a:String(c2/2), accept:null, choix:null,
          expl:'Coefficient = arrivée ÷ départ = ' + fv(y1) + ' ÷ ' + xa + ' = ' + fv(c2/2) + '.'};
      }
      v = R.int(1,4);
      if(v === 1){
        u = R.pick([150,250,300,350,450]); k = R.int(3,9);
        return {q:'Le raisin coûte ' + eur(u) + ' € le kilogramme. Avec ' + eur(u*k) + ' €, combien de kilogrammes peut-on acheter ?',
          a:String(k), accept:null, choix:null,
          expl:'On divise le budget par le prix d\'un kg : ' + eur(u*k) + ' ÷ ' + eur(u) + ' = ' + k + ' kg.'};
      }
      if(v === 2){
        var S = R.pick([
          [['Le prix payé selon le nombre de baguettes identiques', 'La taille d\'une personne selon son âge', 'Le prix d\'une course en taxi avec 3 € de prise en charge', 'La note obtenue selon le temps passé à réviser'],
           'Sans frais fixes et à prix unitaire constant, doubler la quantité double le prix : c\'est proportionnel. Les trois autres ne suivent aucun coefficient constant.'],
          [['La distance parcourue à vitesse constante selon la durée', 'Le prix d\'un abonnement avec frais de dossier fixes', 'Le poids d\'une personne selon sa taille', 'La température selon l\'heure de la journée'],
           'À vitesse constante, deux fois plus de temps = deux fois plus de distance : coefficient constant. Les autres situations n\'ont pas de coefficient fixe.']
        ]);
        return {q:'Quelle situation est une situation de proportionnalité ?', a:S[0][0], accept:null,
          choix:S[0], expl:S[1]};
      }
      if(v === 3){
        var vt = R.int(6,14)*10, h1 = R.int(2,4), h2 = R.int(5,9);
        return {q:'En ' + h1 + ' heures, un train parcourt ' + mf(vt*h1) + ' km. Quelle distance parcourt-il en ' + h2 + ' heures, en km ?',
          a:String(vt*h2), accept:null, choix:null,
          expl:'En 1 heure : ' + mf(vt*h1) + ' ÷ ' + h1 + ' = ' + vt + ' km. En ' + h2 + ' heures : ' + vt + ' × ' + h2 + ' = ' + mf(vt*h2) + ' km.'};
      }
      u = R.pick([70,80,90,110,130]);
      var s1 = R.int(3,6), s2 = R.int(7,12);
      return {q:s1 + ' stylos coûtent ' + eur(u*s1) + ' €. Combien coûtent ' + s2 + ' stylos, en € ?',
        a:String(u*s2/100), accept:acc2(u*s2), choix:null,
        expl:'Un stylo : ' + eur(u*s1) + ' ÷ ' + s1 + ' = ' + eur(u) + ' €. Puis ' + eur(u) + ' × ' + s2 + ' = ' + eur(u*s2) + ' €.'};
    }
  });

})();
