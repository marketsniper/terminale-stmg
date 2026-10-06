/* ===== Maths · Prépa ECT (copie « ami ») : 14 compétences de 1re année de prépa ECT =====
   Programme officiel : BO spécial n° 1 du 11/02/2021, annexe 1 (mathématiques-informatique, ECT 1re année).
   Phase 6 de la copie de l'ami, ouverte d'emblée (window.MZS_PROFIL.phasesLibres). Source durable : ce fichier ;
   construire_maths_ami.py le copie dans app-ami/maths/skills/. Banc : organisme/banc-skills-maths.js. */
// ============================================================
// PRÉPA ECT — LOT A (phase 6)
// 5 compétences pour faire le pont terminale STMG → 1re année d'ECT :
// logique, ensembles, polynômes, suites arithmético-géométriques, sommes.
// Programme de référence : BO spécial n° 1 du 11/02/2021 (ECT 1re année, 1er semestre).
// ============================================================
(function(){

// ---------- Helpers ----------
// Entier relatif avec le vrai signe moins.
function sg(n){ return String(n).replace('-', '−'); }
// Nombre « propre » à la française (virgule, signe −), sans erreurs d'arrondi binaire.
function nb(x){ return String(Math.round(x*1e8)/1e8).replace('.', ',').replace('-', '−'); }
// Idem avec séparateur de milliers pour les grands nombres affichés.
function mil(x){
  var s = nb(x), neg = s.charAt(0) === '−';
  if (neg) s = s.slice(1);
  var parts = s.split(','), ip = parts[0], out = '';
  if (ip.length > 4){
    for (var i = 0; i < ip.length; i++){ if (i > 0 && (ip.length - i) % 3 === 0) out += ' '; out += ip.charAt(i); }
    ip = out;
  }
  return (neg ? '−' : '') + ip + (parts.length > 1 ? ',' + parts[1] : '');
}
function pgcd(a, b){ a = Math.abs(a); b = Math.abs(b); for (var i = 0; i < 80 && b; i++){ var t = a % b; a = b; b = t; } return a || 1; }
// Fraction irréductible « n/d » (ou entier).
function fracStr(n, d){ if (d < 0){ n = -n; d = -d; } var g = pgcd(n, d); n = n/g; d = d/g; return d === 1 ? sg(n) : sg(n) + '/' + d; }
// « 51/120 = 17/40 », ou « 3/7 » si déjà irréductible.
function qf(n, d){ if (d < 0){ n = -n; d = -d; } if (d === 1) return sg(n); return sg(n) + '/' + d + (pgcd(n, d) > 1 ? ' = ' + fracStr(n, d) : ''); }
function pf(n, d){ return n + '/' + d + (pgcd(n, d) > 1 ? ' = ' + fracStr(n, d) : ''); }
// Terme « + 5 » / « − 5 ».
function plus(v){ return v < 0 ? ' − ' + mil(-v) : ' + ' + mil(v); }
// Nombre entre parenthèses s'il est négatif.
function par(v){ return v < 0 ? '(' + mil(v) + ')' : mil(v); }
// Polynôme à partir de ses coefficients (du plus haut degré au terme constant), degré ≤ 3.
function poly(c){
  var deg = c.length - 1, s = '';
  for (var i = 0; i < c.length; i++){
    var k = c[i], p = deg - i;
    if (k === 0) continue;
    var ab = Math.abs(k);
    var coef = (ab === 1 && p > 0) ? '' : nb(ab);
    var mon = p === 0 ? '' : (p === 1 ? 'x' : (p === 2 ? 'x²' : 'x³'));
    if (s === '') s = (k < 0 ? '−' : '') + coef + mon;
    else s += (k < 0 ? ' − ' : ' + ') + coef + mon;
  }
  return s || '0';
}
// Facteur (x − r) ; r non nul.
function fx(r){ return r > 0 ? '(x − ' + nb(r) + ')' : '(x + ' + nb(-r) + ')'; }
// Ensemble d'entiers écrit à la française.
function ens(arr){ if (!arr.length) return '∅'; return '{' + arr.map(sg).join(' ; ') + '}'; }
function tri(arr){ return arr.slice().sort(function(u, v){ return u - v; }); }
// Normalisation identique à celle de l'app (pour garantir des choix distincts).
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
// QCM : la bonne réponse + les 3 premiers distracteurs distincts.
function qcm(bonne, autres){
  var vus = [norm(bonne)], ch = [bonne];
  for (var i = 0; i < autres.length && ch.length < 4; i++){
    var k = norm(autres[i]);
    if (vus.indexOf(k) < 0){ vus.push(k); ch.push(autres[i]); }
  }
  return ch;
}
// Puissance affichée : 2ⁿ, (−2)ⁿ, 0,8ⁿ⁺¹…
function puis(a, expo){ return (a < 0 ? '(' + nb(a) + ')' : nb(a)) + expo; }
// Exposant en caractères Unicode : 2 + ex(11) → 2¹¹, 'q' + ex('k') → qᵏ.
function ex(v){
  var M = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','k':'ᵏ','j':'ʲ','+':'⁺','−':'⁻','-':'⁻','(':'⁽',')':'⁾',' ':''};
  var s = String(v), out = '';
  for (var i = 0; i < s.length; i++) out += (M[s.charAt(i)] !== undefined ? M[s.charAt(i)] : s.charAt(i));
  return out;
}
// Intervalles
function itv(g, d, fermeG, fermeD){
  var sG = g === null ? ']−∞' : (fermeG ? '[' : ']') + sg(g);
  var sD = d === null ? '+∞[' : sg(d) + (fermeD ? ']' : '[');
  return sG + ' ; ' + sD;
}

// =====================================================
// ect-01 — Logique et raisonnement
// =====================================================
SKILLS.push({
  id: 'p6-ect-01-logique',
  phase: 6,
  ordre: 1,
  titre: 'Logique et raisonnement',
  objectif: "Manier « et », « ou », l'implication, la réciproque, la contraposée, la négation (avec ∀ et ∃), les conditions nécessaires et suffisantes, le contre-exemple et la récurrence.",
  lecon: `<p class="lede">Au lycée, on te demandait surtout de <em>calculer</em>. En prépa, on te demande de <mark>justifier</mark> : chaque phrase d'une copie doit être vraie et s'enchaîner logiquement avec la précédente. Cette compétence te donne la grammaire de ce raisonnement.</p>
<p><strong>Propositions, « et », « ou ».</strong> Une proposition est une phrase qui est soit vraie, soit fausse (« 12 est pair », « x &gt; 3 »). « P <b>et</b> Q » est vraie quand les deux sont vraies. « P <b>ou</b> Q » est vraie quand <strong>au moins une</strong> des deux est vraie : le « ou » mathématique est inclusif (les deux à la fois, c'est permis).</p>
<p><strong>L'implication P ⇒ Q</strong> se lit « si P, alors Q ». Elle n'est fausse que dans un seul cas : P vraie et Q fausse.</p>
<table>
<tr><th>P</th><th>Q</th><th>P ⇒ Q</th></tr>
<tr><td>vraie</td><td>vraie</td><td>vraie</td></tr>
<tr><td>vraie</td><td>fausse</td><td><b>fausse</b></td></tr>
<tr><td>fausse</td><td>vraie</td><td>vraie</td></tr>
<tr><td>fausse</td><td>fausse</td><td>vraie</td></tr>
</table>
<p>À partir de « si P, alors Q », on fabrique trois autres phrases :</p>
<ul>
<li>la <b>réciproque</b> : « si Q, alors P » — elle peut être fausse même quand l'implication est vraie (x = 3 ⇒ x² = 9 est vraie, mais x² = 9 n'entraîne pas x = 3 : pense à x = −3) ;</li>
<li>la <b>contraposée</b> : « si non Q, alors non P » — elle a <mark>toujours</mark> la même valeur de vérité que l'implication ;</li>
<li>la <b>négation</b> : « P et non Q » — c'est exactement le cas qui rend l'implication fausse.</li>
</ul>
<p>Quand l'implication et sa réciproque sont vraies, on écrit P ⇔ Q (« P équivaut à Q »).</p>
<p><strong>Condition nécessaire, condition suffisante.</strong> Si P ⇒ Q, on dit que P est une condition <b>suffisante</b> pour Q (il suffit d'avoir P pour avoir Q) et que Q est une condition <b>nécessaire</b> pour P (il faut avoir Q pour avoir P). Exemple : « n est multiple de 6 » est suffisant pour « n est pair », mais pas nécessaire (4 est pair sans être multiple de 6).</p>
<p><strong>Négations.</strong> On échange « et » et « ou », on échange ∀ (« pour tout ») et ∃ (« il existe »), et on nie la propriété finale.</p>
<div class="formule"><p>non(P et Q) = (non P) ou (non Q) &nbsp;•&nbsp; non(P ou Q) = (non P) et (non Q)<br>non(∀x, P(x)) = ∃x, non P(x) &nbsp;•&nbsp; non(∃x, P(x)) = ∀x, non P(x)<br>non(P ⇒ Q) = P et (non Q)</p></div>
<p>Exemple détaillé : la phrase « ∀x ∈ ℝ, x² ≥ x » est-elle vraie ?</p>
<div class="etapes">
<p>1. J'écris sa négation : on change ∀ en ∃ et on nie « x² ≥ x », ce qui donne « ∃x ∈ ℝ, x² &lt; x ».</p>
<p>2. Je cherche un tel x : pour x = 0,5, x² = 0,25 et 0,25 &lt; 0,5. La négation est vraie.</p>
<p>3. Conclusion : la phrase de départ est fausse, et x = 0,5 en est un <mark>contre-exemple</mark>. Un seul contre-exemple suffit pour démolir un « pour tout ».</p>
</div>
<p><strong>Le raisonnement par récurrence</strong> sert à prouver qu'une propriété P(n) est vraie pour tout entier n. Exemple : u(0) = 2 et u(n+1) = 2u(n) − 1 ; montrons que u(n) = 2ⁿ + 1 pour tout n ∈ ℕ.</p>
<div class="etapes">
<p>1. <strong>La propriété :</strong> pour n ∈ ℕ, je note P(n) : « u(n) = 2ⁿ + 1 ».</p>
<p>2. <strong>Initialisation :</strong> u(0) = 2 et 2⁰ + 1 = 1 + 1 = 2. Donc P(0) est vraie.</p>
<p>3. <strong>Hérédité :</strong> soit n ∈ ℕ ; je suppose P(n) vraie, c'est-à-dire u(n) = 2ⁿ + 1. Alors u(n+1) = 2u(n) − 1 = 2(2ⁿ + 1) − 1 = 2ⁿ⁺¹ + 2 − 1 = 2ⁿ⁺¹ + 1. Donc P(n+1) est vraie.</p>
<p>4. <strong>Conclusion :</strong> par récurrence, pour tout n ∈ ℕ, u(n) = 2ⁿ + 1.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>P ⇒ Q est fausse seulement si P est vraie et Q fausse. La contraposée (non Q ⇒ non P) dit la même chose que l'implication ; la réciproque (Q ⇒ P), non. Si P ⇒ Q : P est <b>suffisante</b> pour Q, Q est <b>nécessaire</b> pour P. Pour nier : ∀ ↔ ∃, « et » ↔ « ou », et on nie la conclusion.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>La négation de « x ≤ 5 » est « x &gt; 5 », pas « x ≥ 5 ». Et la négation de « tous les x vérifient P » n'est pas « aucun x ne vérifie P » : c'est « <b>au moins un</b> x ne vérifie pas P ».</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour ne plus confondre nécessaire et suffisant, reformule avec « il suffit » et « il faut » : « il suffit que n soit multiple de 6 pour que n soit pair » ; « il faut que n soit pair pour qu'il soit multiple de 6 ». Et pour un contre-exemple à « si P, alors Q », cherche un cas où P est vraie mais Q fausse.</p></div>
<p><strong>En prépa ECT :</strong> les quantificateurs servent à écrire précisément les définitions (« u est majorée » s'écrit ∃M ∈ ℝ, ∀n ∈ ℕ, u(n) ≤ M), la récurrence sert à démontrer les formules de suites (épargne, emprunts) et la contraposée t'évite des démonstrations pénibles.</p>`,
  gen(level, R){
    // ----- Banques -----
    var IMPL = [
      {P:'il pleut', Q:'le sol est mouillé', nP:'il ne pleut pas', nQ:'le sol n\'est pas mouillé', cap:true},
      {P:'n est multiple de 4', Q:'n est pair', nP:'n n\'est pas multiple de 4', nQ:'n est impair', cap:false},
      {P:'x > 3', Q:'x² > 9', nP:'x ≤ 3', nQ:'x² ≤ 9', cap:false},
      {P:'le prix augmente', Q:'la demande baisse', nP:'le prix n\'augmente pas', nQ:'la demande ne baisse pas', cap:true},
      {P:'le taux d\'intérêt baisse', Q:'les ménages empruntent davantage', nP:'le taux d\'intérêt ne baisse pas', nQ:'les ménages n\'empruntent pas davantage', cap:true},
      {P:'ABCD est un carré', Q:'ABCD est un rectangle', nP:'ABCD n\'est pas un carré', nQ:'ABCD n\'est pas un rectangle', cap:false},
      {P:'Δ > 0', Q:'le trinôme a deux racines réelles distinctes', nP:'Δ ≤ 0', nQ:'le trinôme n\'a pas deux racines réelles distinctes', cap:false},
      {P:'x = 2', Q:'x² = 4', nP:'x ≠ 2', nQ:'x² ≠ 4', cap:false},
      {P:'l\'entreprise réalise un bénéfice', Q:'l\'entreprise paie l\'impôt sur les sociétés', nP:'l\'entreprise ne réalise pas de bénéfice', nQ:'l\'entreprise ne paie pas l\'impôt sur les sociétés', cap:true}
    ];
    function si(p){ return (/^il\b/.test(p) ? 'S\'' : 'Si ') + p; }
    function phr(a, b){ return si(a) + ', alors ' + b + '.'; }
    function cap(s, ok){ return ok ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
    // CN / CS : AB = (A ⇒ B), BA = (B ⇒ A) ; ceAB / ceBA = contre-exemples quand c'est faux
    var CNCS = [
      {A:'x > 5', B:'x > 2', AB:true, BA:false, ceBA:'x = 3 vérifie x > 2 mais pas x > 5', ctx:'x désigne un réel'},
      {A:'x = 3', B:'x² = 9', AB:true, BA:false, ceBA:'x = −3 vérifie x² = 9 mais pas x = 3', ctx:'x désigne un réel'},
      {A:'n est multiple de 6', B:'n est pair', AB:true, BA:false, ceBA:'n = 4 est pair mais n\'est pas multiple de 6', ctx:'n désigne un entier naturel'},
      {A:'n est multiple de 6', B:'n est multiple de 2 et de 3', AB:true, BA:true, ctx:'n désigne un entier naturel'},
      {A:'x > 2', B:'x² > 4', AB:true, BA:false, ceBA:'x = −3 vérifie x² > 4 mais pas x > 2', ctx:'x désigne un réel'},
      {A:'n est impair', B:'n est premier', AB:false, BA:false, ceAB:'9 est impair mais pas premier', ceBA:'2 est premier mais pas impair', ctx:'n désigne un entier naturel'},
      {A:'x² = 4', B:'x = 2 ou x = −2', AB:true, BA:true, ctx:'x désigne un réel'},
      {A:'a = 0', B:'ab = 0', AB:true, BA:false, ceBA:'a = 1 et b = 0 donnent ab = 0 avec a ≠ 0', ctx:'a et b désignent des réels'},
      {A:'x < 1', B:'x < 3', AB:true, BA:false, ceBA:'x = 2 vérifie x < 3 mais pas x < 1', ctx:'x désigne un réel'},
      {A:'x ≥ 0', B:'x² ≥ 0', AB:true, BA:false, ceBA:'x = −1 vérifie x² ≥ 0 mais pas x ≥ 0', ctx:'x désigne un réel'},
      {A:'n est multiple de 4', B:'n est multiple de 6', AB:false, BA:false, ceAB:'4 est multiple de 4 mais pas de 6', ceBA:'6 est multiple de 6 mais pas de 4', ctx:'n désigne un entier naturel'},
      {A:'x² < 1', B:'x < 1', AB:true, BA:false, ceBA:'x = −2 vérifie x < 1 mais x² = 4 ≥ 1', ctx:'x désigne un réel'},
      {A:'x = 1', B:'x(x − 1) = 0', AB:true, BA:false, ceBA:'x = 0 vérifie x(x − 1) = 0 mais pas x = 1', ctx:'x désigne un réel'},
      {A:'Δ > 0', B:'le trinôme ax² + bx + c (a ≠ 0) a deux racines réelles distinctes', AB:true, BA:true, ctx:'a, b, c désignent des réels'}
    ];
    function tirageCNCS(){
      var e = R.pick(CNCS);
      if (R.int(0, 1) === 0) return {A:e.A, B:e.B, AB:e.AB, BA:e.BA, ceAB:e.ceAB, ceBA:e.ceBA, ctx:e.ctx};
      return {A:e.B, B:e.A, AB:e.BA, BA:e.AB, ceAB:e.ceBA, ceBA:e.ceAB, ctx:e.ctx};
    }
    function justif(c){
      var s = '« ' + c.A + ' ⇒ ' + c.B + ' » est ' + (c.AB ? 'vraie' : 'fausse (' + c.ceAB + ')') + ' ; ';
      s += '« ' + c.B + ' ⇒ ' + c.A + ' » est ' + (c.BA ? 'vraie' : 'fausse (' + c.ceBA + ')') + '.';
      return s;
    }
    var COMP = {'≤':'>', '<':'≥', '≥':'<', '>':'≤'};   // négation d'une inégalité
    var OPPO = {'≤':'≥', '<':'>', '≥':'≤', '>':'<'};   // erreur classique : « l'inverse »
    var SWAP = {'∀':'∃', '∃':'∀'};

    if (level === 1){
      var t = R.pick(['etou', 'recip', 'negcomp']);
      if (t === 'etou'){
        var k = R.int(12, 25);
        var PROPS = [
          [{t:'n est pair', f:function(n){ return n % 2 === 0; }}, {t:'n > ' + k, f:function(n){ return n > k; }}],
          [{t:'n est multiple de 3', f:function(n){ return n % 3 === 0; }}, {t:'n > ' + k, f:function(n){ return n > k; }}],
          [{t:'n est pair', f:function(n){ return n % 2 === 0; }}, {t:'n est multiple de 3', f:function(n){ return n % 3 === 0; }}],
          [{t:'n est multiple de 5', f:function(n){ return n % 5 === 0; }}, {t:'n est pair', f:function(n){ return n % 2 === 0; }}],
          [{t:'n est impair', f:function(n){ return n % 2 === 1; }}, {t:'n < ' + k, f:function(n){ return n < k; }}],
          [{t:'n est multiple de 3', f:function(n){ return n % 3 === 0; }}, {t:'n < ' + k, f:function(n){ return n < k; }}]
        ];
        var pq = R.pick(PROPS), P = pq[0], Q = pq[1];
        var b11 = [], b10 = [], b01 = [], b00 = [];
        for (var n = 1; n <= 40; n++){
          var p = P.f(n), q = Q.f(n);
          if (p && q) b11.push(n); else if (p) b10.push(n); else if (q) b01.push(n); else b00.push(n);
        }
        var x11 = R.pick(b11), x10 = R.pick(b10), x01 = R.pick(b01), x00 = R.pick(b00);
        var desc = x11 + ' : P vraie, Q vraie ; ' + x10 + ' : P vraie, Q fausse ; ' + x01 + ' : P fausse, Q vraie ; ' + x00 + ' : P fausse, Q fausse.';
        var v = R.pick(['et', 'pasou', 'etnon']);
        var tous = [String(x11), String(x10), String(x01), String(x00)];
        if (v === 'et') return {
          q: 'On note P : « ' + P.t + ' » et Q : « ' + Q.t + ' » (n entier naturel).\nQuel nombre vérifie « P et Q » ?',
          a: String(x11), accept: null, choix: tous,
          expl: '« P et Q » exige que les deux soient vraies. ' + desc + ' Seul ' + x11 + ' convient.'
        };
        if (v === 'pasou') return {
          q: 'On note P : « ' + P.t + ' » et Q : « ' + Q.t + ' » (n entier naturel).\nQuel nombre NE vérifie PAS « P ou Q » ?',
          a: String(x00), accept: null, choix: tous,
          expl: '« P ou Q » est vraie dès qu\'au moins une des deux est vraie ; elle n\'est fausse que si P et Q sont toutes les deux fausses. ' + desc + ' Seul ' + x00 + ' ne la vérifie pas.'
        };
        return {
          q: 'On note P : « ' + P.t + ' » et Q : « ' + Q.t + ' » (n entier naturel).\nQuel nombre vérifie « P et (non Q) » ?',
          a: String(x10), accept: null, choix: tous,
          expl: '« P et (non Q) » : P doit être vraie et Q fausse. ' + desc + ' Seul ' + x10 + ' convient.'
        };
      }
      if (t === 'recip'){
        var e = R.pick(IMPL);
        var rec = phr(e.Q, e.P), ctp = phr(e.nQ, e.nP), inv = phr(e.nP, e.nQ);
        var neg = cap(e.P + ' et ' + e.nQ + '.', e.cap);
        var dem = R.pick(['réciproque', 'contraposée', 'négation']);
        var bon = dem === 'réciproque' ? rec : (dem === 'contraposée' ? ctp : neg);
        return {
          q: 'On considère l\'implication : « ' + phr(e.P, e.Q) + ' »\nQuelle est sa ' + dem + ' ?',
          a: bon, accept: null, choix: [rec, ctp, inv, neg],
          expl: 'Pour « si P, alors Q » : la réciproque est « si Q, alors P » ; la contraposée est « si non Q, alors non P » ; la négation est « P et non Q ». '
            + 'Ici, la ' + dem + ' est : « ' + bon + ' » (« ' + inv + ' » n\'est ni la réciproque, ni la contraposée, ni la négation : c\'est un piège classique.)'
        };
      }
      // négation d'une double inégalité
      var a1 = R.int(-5, 4), b1 = a1 + R.int(2, 8);
      var formeEt = R.int(0, 1) === 0;
      if (formeEt){
        var bonN = 'x ≤ ' + sg(a1) + ' ou x > ' + sg(b1);
        return {
          q: 'x désigne un réel. Quelle est la négation de : « x > ' + sg(a1) + ' et x ≤ ' + sg(b1) + ' » ?',
          a: bonN, accept: null,
          choix: [bonN, 'x ≤ ' + sg(a1) + ' et x > ' + sg(b1), 'x < ' + sg(a1) + ' ou x ≥ ' + sg(b1), 'x < ' + sg(a1) + ' et x ≥ ' + sg(b1)],
          expl: 'non(P et Q) = (non P) ou (non Q). La négation de « x > ' + sg(a1) + ' » est « x ≤ ' + sg(a1) + ' », celle de « x ≤ ' + sg(b1) + ' » est « x > ' + sg(b1) + ' ». D\'où : ' + bonN + '.'
        };
      }
      var bonO = 'x ≥ ' + sg(a1) + ' et x < ' + sg(b1);
      return {
        q: 'x désigne un réel. Quelle est la négation de : « x < ' + sg(a1) + ' ou x ≥ ' + sg(b1) + ' » ?',
        a: bonO, accept: null,
        choix: [bonO, 'x ≥ ' + sg(a1) + ' ou x < ' + sg(b1), 'x > ' + sg(a1) + ' et x ≤ ' + sg(b1), 'x > ' + sg(a1) + ' ou x ≤ ' + sg(b1)],
        expl: 'non(P ou Q) = (non P) et (non Q). La négation de « x < ' + sg(a1) + ' » est « x ≥ ' + sg(a1) + ' », celle de « x ≥ ' + sg(b1) + ' » est « x < ' + sg(b1) + ' ». D\'où : ' + bonO + '.'
      };
    }

    if (level === 2){
      var t2 = R.pick(['cncs', 'negquant', 'negfr', 'contrex']);
      if (t2 === 'cncs'){
        var c = tirageCNCS();
        var rep = c.AB && c.BA ? 'nécessaire et suffisante' : (c.AB ? 'suffisante mais pas nécessaire' : (c.BA ? 'nécessaire mais pas suffisante' : 'ni nécessaire ni suffisante'));
        return {
          q: '(' + c.ctx + ')\nComplète : « ' + c.A + ' » est une condition … pour « ' + c.B + ' ».',
          a: rep, accept: null,
          choix: ['nécessaire et suffisante', 'suffisante mais pas nécessaire', 'nécessaire mais pas suffisante', 'ni nécessaire ni suffisante'],
          expl: justif(c) + ' Rappel : si A ⇒ B, A est suffisante pour B ; si B ⇒ A, A est nécessaire pour B. Donc « ' + c.A + ' » est une condition ' + rep + '.'
        };
      }
      if (t2 === 'negquant'){
        var TPL = [
          {d:'n ∈ ℕ', e:'u(n)'}, {d:'x ∈ ℝ', e:'f(x)'}, {d:'x ∈ [0 ; 1]', e:'g(x)'}, {d:'n ∈ ℕ', e:'v(n)'}, {d:'t ∈ [0 ; 10]', e:'C(t)'}
        ];
        var tp = R.pick(TPL), Qf = R.pick(['∀', '∃']), op = R.pick(['≤', '<', '≥', '>']), kk = R.int(-9, 20);
        var base = function(qq, o){ return qq + tp.d + ', ' + tp.e + ' ' + o + ' ' + sg(kk); };
        var bonQ = base(SWAP[Qf], COMP[op]);
        return {
          q: 'Quelle est la négation de la proposition :\n« ' + base(Qf, op) + ' » ?',
          a: bonQ, accept: null,
          choix: [bonQ, base(SWAP[Qf], op), base(Qf, COMP[op]), base(SWAP[Qf], OPPO[op])],
          expl: 'Pour nier, on change le quantificateur (' + Qf + ' devient ' + SWAP[Qf] + ') et on nie la propriété : la négation de « ' + tp.e + ' ' + op + ' ' + sg(kk) + ' » est « ' + tp.e + ' ' + COMP[op] + ' ' + sg(kk) + ' ». D\'où : ' + bonQ + '.'
        };
      }
      if (t2 === 'negfr'){
        var m = R.pick([20, 30, 40, 50, 80, 100, 150, 200]);
        var CTX = [
          {tous:'Tous les produits du catalogue coûtent moins de ' + m + ' €.',
           bon:'Au moins un produit du catalogue coûte ' + m + ' € ou plus.',
           f1:'Aucun produit du catalogue ne coûte moins de ' + m + ' €.',
           f2:'Tous les produits du catalogue coûtent plus de ' + m + ' €.',
           f3:'Au moins un produit du catalogue coûte moins de ' + m + ' €.'},
          {tous:'Tous les clients ont dépensé au moins ' + m + ' €.',
           bon:'Au moins un client a dépensé moins de ' + m + ' €.',
           f1:'Aucun client n\'a dépensé au moins ' + m + ' €.',
           f2:'Tous les clients ont dépensé moins de ' + m + ' €.',
           f3:'Au moins un client a dépensé au moins ' + m + ' €.'},
          {tous:'Il existe un salarié dont la prime dépasse ' + m + ' €.',
           bon:'Aucun salarié n\'a une prime qui dépasse ' + m + ' €.',
           f1:'Il existe un salarié dont la prime ne dépasse pas ' + m + ' €.',
           f2:'Tous les salariés ont une prime qui dépasse ' + m + ' €.',
           f3:'Il existe un salarié dont la prime est inférieure à ' + m + ' €.', rem:'Ici la phrase de départ commence par « il existe » : sa négation est un « pour tout » (« aucun salarié… », c\'est-à-dire « tous les salariés ont une prime d\'au plus ' + m + ' € »).'},
          {tous:'Chaque mois de l\'année, le chiffre d\'affaires a dépassé ' + m + ' k€.',
           bon:'Au moins un mois de l\'année, le chiffre d\'affaires n\'a pas dépassé ' + m + ' k€.',
           f1:'Aucun mois de l\'année, le chiffre d\'affaires n\'a dépassé ' + m + ' k€.',
           f2:'Chaque mois de l\'année, le chiffre d\'affaires est resté sous ' + m + ' k€.',
           f3:'Au moins un mois de l\'année, le chiffre d\'affaires a dépassé ' + m + ' k€.'}
        ];
        var cx = R.pick(CTX);
        return {
          q: 'Quelle est la négation de la phrase :\n« ' + cx.tous + ' » ?',
          a: cx.bon, accept: null, choix: [cx.bon, cx.f1, cx.f2, cx.f3],
          expl: '« Pour tout » se nie en « il existe au moins un » (et inversement), puis on nie la propriété. La négation est : « ' + cx.bon + ' » ' + (cx.rem || 'Attention, « aucun… » ou « tous… le contraire » sont des phrases beaucoup plus fortes que la négation : un seul contre-exemple suffit à contredire un « tous ».')
        };
      }
      // contre-exemple
      var s = R.pick(['impair', 'carre', 'carreK', 'euler', 'somme']);
      if (s === 'impair'){
        var ce = R.pick([9, 15, 21, 25, 27, 33, 35]);
        var op1 = R.pick([3, 5, 7, 11, 13, 17, 19, 23]), ev = R.pick([4, 6, 8, 10, 12, 14, 16, 18]);
        return {
          q: 'Quel nombre est un contre-exemple à la phrase :\n« Pour tout entier n, si n est impair, alors n est premier » ?',
          a: String(ce), accept: null, choix: [String(ce), String(op1), String(ev), '2'],
          expl: 'Un contre-exemple doit vérifier l\'hypothèse (n impair) sans vérifier la conclusion (n premier). ' + ce + ' est impair et n\'est pas premier. ' + op1 + ' est impair mais premier ; ' + ev + ' et 2 ne sont pas impairs : ils ne peuvent pas contredire la phrase.'
        };
      }
      if (s === 'carre'){
        var cv = R.pick([0.5, 0.2, 0.1, 0.25, 0.4, 0.8]);
        var ok = R.shuffle([-3, -2, -1, 0, 1, 2, 3, 5]).slice(0, 3);
        return {
          q: 'Quel nombre est un contre-exemple à la phrase :\n« Pour tout réel x, x² ≥ x » ?',
          a: nb(cv), accept: null, choix: [nb(cv)].concat(ok.map(sg)),
          expl: 'Pour x = ' + nb(cv) + ' : x² = ' + nb(cv*cv) + ' et ' + nb(cv*cv) + ' < ' + nb(cv) + ', donc x² ≥ x est faux. Pour ' + ok.map(sg).join(', ') + ', on a bien x² ≥ x (c\'est vrai pour tout x ≤ 0 et tout x ≥ 1). Un seul contre-exemple suffit à prouver que la phrase est fausse.'
        };
      }
      if (s === 'carreK'){
        var K = R.int(2, 6), d = R.int(1, 3), ceK = -(K + d);
        return {
          q: 'Quel nombre est un contre-exemple à la phrase :\n« Pour tout réel x, si x² > ' + (K*K) + ', alors x > ' + K + ' » ?',
          a: sg(ceK), accept: null, choix: [sg(ceK), String(K + 1), '0', sg(-(K - 1))],
          expl: 'Il faut x² > ' + (K*K) + ' (hypothèse vraie) mais x ≤ ' + K + ' (conclusion fausse). Pour x = ' + sg(ceK) + ' : x² = ' + (ceK*ceK) + ' > ' + (K*K) + ' et pourtant ' + sg(ceK) + ' ≤ ' + K + '. '
            + 'Pour x = ' + (K + 1) + ', hypothèse et conclusion sont vraies ; pour 0 et ' + sg(-(K - 1)) + ', l\'hypothèse est fausse.'
        };
      }
      if (s === 'euler'){
        var ce2 = R.pick([40, 41]);
        var pas = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 3);
        var val = ce2*ce2 + ce2 + 41;
        return {
          q: 'Quel entier est un contre-exemple à la phrase :\n« Pour tout entier naturel n, n² + n + 41 est un nombre premier » ?',
          a: String(ce2), accept: null, choix: [String(ce2)].concat(pas.map(String)),
          expl: 'Pour n = ' + ce2 + ' : n² + n + 41 = ' + val + ' = ' + (ce2 === 40 ? '41 × 41' : '41 × 43') + ', qui n\'est pas premier. '
            + 'Pour ' + pas.join(', ') + ', on obtient ' + pas.map(function(z){ return z*z + z + 41; }).join(', ') + ', qui sont premiers. Moralité : vérifier une propriété sur beaucoup d\'exemples ne prouve rien.'
        };
      }
      var pa = R.int(1, 5), pb = R.int(1, 5), m1 = R.int(1, 6), m2 = R.int(1, 6);
      var bonS = 'a = ' + pa + ' et b = ' + pb;
      return {
        q: 'Quel couple est un contre-exemple à la phrase :\n« Pour tous réels a et b, (a + b)² = a² + b² » ?',
        a: bonS, accept: null, choix: [bonS, 'a = 0 et b = ' + m1, 'a = ' + m2 + ' et b = 0', 'a = 0 et b = 0'],
        expl: '(a + b)² = a² + 2ab + b², donc l\'égalité n\'est vraie que si ab = 0. Avec a = ' + pa + ' et b = ' + pb + ' : (a + b)² = ' + ((pa + pb)*(pa + pb)) + ' alors que a² + b² = ' + (pa*pa + pb*pb) + '. Les trois autres couples contiennent un 0 : l\'égalité y est vraie.'
      };
    }

    // ----- level 3 -----
    var t3 = R.pick(['negdouble', 'recipvrai', 'recurr', 'structure', 'contrap']);
    if (t3 === 'negdouble'){
      var T2 = [
        {q1:'∃', v1:'M ∈ ℝ', q2:'∀', v2:'n ∈ ℕ', e:'u(n)', k:'M'},
        {q1:'∃', v1:'m ∈ ℝ', q2:'∀', v2:'x ∈ ℝ', e:'f(x)', k:'m'},
        {q1:'∀', v1:'n ∈ ℕ', q2:'∃', v2:'p ∈ ℕ', e:'p', k:'n'},
        {q1:'∀', v1:'A ∈ ℝ', q2:'∃', v2:'n ∈ ℕ', e:'u(n)', k:'A'},
        {q1:'∃', v1:'n₀ ∈ ℕ', q2:'∀', v2:'n ∈ ℕ', e:'u(n)', k:'u(n₀)'}
      ];
      var tt = R.pick(T2), o3 = R.pick(['≤', '<', '≥', '>']);
      var f = function(a, b, o){ return a + tt.v1 + ', ' + b + tt.v2 + ', ' + tt.e + ' ' + o + ' ' + tt.k; };
      var bonD = f(SWAP[tt.q1], SWAP[tt.q2], COMP[o3]);
      return {
        q: 'Quelle est la négation de :\n« ' + f(tt.q1, tt.q2, o3) + ' » ?',
        a: bonD, accept: null,
        choix: [bonD, f(SWAP[tt.q1], SWAP[tt.q2], OPPO[o3]), f(SWAP[tt.q1], tt.q2, COMP[o3]), f(tt.q1, tt.q2, COMP[o3])],
        expl: 'On change chaque quantificateur en gardant l\'ordre (' + tt.q1 + ' → ' + SWAP[tt.q1] + ', ' + tt.q2 + ' → ' + SWAP[tt.q2] + '), puis on nie la propriété finale : « ' + tt.e + ' ' + o3 + ' ' + tt.k + ' » devient « ' + tt.e + ' ' + COMP[o3] + ' ' + tt.k + ' ». D\'où : ' + bonD + '.'
      };
    }
    if (t3 === 'recipvrai'){
      var c3 = tirageCNCS();
      var rep3 = c3.AB && c3.BA ? 'L\'implication et sa réciproque sont vraies' : (c3.AB ? 'Seule l\'implication est vraie' : (c3.BA ? 'Seule la réciproque est vraie' : 'Ni l\'implication ni sa réciproque ne sont vraies'));
      return {
        q: '(' + c3.ctx + ')\nOn considère l\'implication « si ' + c3.A + ', alors ' + c3.B + ' ». Que peut-on affirmer ?',
        a: rep3, accept: null,
        choix: ['L\'implication et sa réciproque sont vraies', 'Seule l\'implication est vraie', 'Seule la réciproque est vraie', 'Ni l\'implication ni sa réciproque ne sont vraies'],
        expl: justif(c3) + (c3.AB && c3.BA ? ' On a donc une équivalence : ' + c3.A + ' ⇔ ' + c3.B + '.' : ' Une implication fausse se prouve avec un seul contre-exemple.')
      };
    }
    if (t3 === 'recurr' || t3 === 'structure'){
      var aa = R.pick([2, 3]), cc = R.int(1, 4), ll = R.pick([1, 2, 3, 4, 5, -5, -6]);
      var bb = ll*(1 - aa), u0 = cc + ll;
      var pw = function(e){ return aa + e; };
      var term = function(coef, e){ return (coef === 1 ? '' : (coef === -1 ? '−' : sg(coef) + ' × ')) + pw(e); };
      var form = function(coef, e, l){ return 'u(n) = ' + term(coef, e) + plus(l); };
      var bonR = form(cc, 'ⁿ', ll);
      var recTxt = 'u(0) = ' + sg(u0) + ' et, pour tout n ∈ ℕ, u(n+1) = ' + aa + 'u(n)' + plus(bb);
      if (t3 === 'recurr'){
        return {
          q: 'On définit ' + recTxt + '.\nQuelle formule peut-on démontrer par récurrence ?',
          a: bonR, accept: null,
          choix: qcm(bonR, [form(u0, 'ⁿ', ll), form(cc, 'ⁿ⁺¹', ll), form(cc, 'ⁿ', -ll), form(cc + 1, 'ⁿ', ll - 1)]),
          expl: 'Initialisation : pour n = 0, ' + term(cc, '⁰') + plus(ll) + ' = ' + cc + plus(ll) + ' = ' + sg(u0) + ' = u(0). '
            + 'Hérédité : si u(n) = ' + term(cc, 'ⁿ') + plus(ll) + ', alors u(n+1) = ' + aa + '(' + term(cc, 'ⁿ') + plus(ll) + ')' + plus(bb) + ' = ' + term(cc, 'ⁿ⁺¹') + plus(aa*ll) + plus(bb) + ' = ' + term(cc, 'ⁿ⁺¹') + plus(ll) + '. '
            + 'Les autres formules échouent dès n = 0 ou n = 1.'
        };
      }
      var Pn = R.pick(['« ' + bonR + ' »', '« u(n) ≥ ' + sg(Math.min(u0, ll)) + ' »', '« u(n) est un entier »', '« 1 + 2 + … + n = n(n + 1)/2 »', '« 2ⁿ ≥ n + 1 »']);
      var bonH = 'pour tout n, si P(n) est vraie, alors P(n + 1) est vraie';
      return {
        q: 'On veut démontrer par récurrence que, pour tout n ∈ ℕ, P(n) : ' + Pn + '.\nAprès l\'initialisation (P(0) vraie), que doit-on démontrer ?',
        a: bonH, accept: null,
        choix: [bonH, 'pour tout n, si P(n + 1) est vraie, alors P(n) est vraie', 'P(1) est vraie, puis P(2), puis P(3)', 'P(n) est vraie pour tout n'],
        expl: 'C\'est l\'hérédité : on suppose P(n) vraie pour un n quelconque et on en déduit P(n + 1). Supposer « P(n) vraie pour tout n », c\'est supposer ce qu\'on veut démontrer ; et vérifier quelques valeurs ne prouve rien pour tous les n.'
      };
    }
    // contraposée utile
    var CT = [
      function(){ return {impl:'Si n² est pair, alors n est pair.', bon:'Si n est impair, alors n² est impair.', f:['Si n est pair, alors n² est pair.', 'Si n² est impair, alors n est impair.', 'Si n est impair, alors n² est pair.'], ctx:'n entier'}; },
      function(){ var p = R.pick([3, 5, 7]); return {impl:'Si n² est multiple de ' + p + ', alors n est multiple de ' + p + '.', bon:'Si n n\'est pas multiple de ' + p + ', alors n² n\'est pas multiple de ' + p + '.', f:['Si n est multiple de ' + p + ', alors n² est multiple de ' + p + '.', 'Si n² n\'est pas multiple de ' + p + ', alors n n\'est pas multiple de ' + p + '.', 'Si n n\'est pas multiple de ' + p + ', alors n² est multiple de ' + p + '.'], ctx:'n entier'}; },
      function(){ return {impl:'Si ab ≠ 0, alors a ≠ 0 et b ≠ 0.', bon:'Si a = 0 ou b = 0, alors ab = 0.', f:['Si a ≠ 0 et b ≠ 0, alors ab ≠ 0.', 'Si ab = 0, alors a = 0 ou b = 0.', 'Si a = 0 et b = 0, alors ab = 0.'], ctx:'a et b réels'}; },
      function(){ var k = R.int(2, 9); return {impl:'Si x² ≠ ' + (k*k) + ', alors x ≠ ' + k + '.', bon:'Si x = ' + k + ', alors x² = ' + (k*k) + '.', f:['Si x ≠ ' + k + ', alors x² ≠ ' + (k*k) + '.', 'Si x² = ' + (k*k) + ', alors x = ' + k + '.', 'Si x = ' + k + ', alors x² ≠ ' + (k*k) + '.'], ctx:'x réel'}; },
      function(){ var k = R.int(2, 9); return {impl:'Si u(n) > ' + k + ' pour un certain n, alors la suite u n\'est pas majorée par ' + k + '.', bon:'Si la suite u est majorée par ' + k + ', alors u(n) ≤ ' + k + ' pour tout n.', f:['Si la suite u n\'est pas majorée par ' + k + ', alors u(n) > ' + k + ' pour un certain n.', 'Si la suite u est majorée par ' + k + ', alors u(n) < ' + k + ' pour tout n.', 'Si u(n) ≤ ' + k + ' pour tout n, alors la suite u est majorée par ' + k + '.'], ctx:'u suite réelle'}; }
    ];
    var ct = R.pick(CT)();
    return {
      q: '(' + ct.ctx + ') Pour démontrer « ' + ct.impl + ' », on passe par la contraposée. Laquelle ?',
      a: ct.bon, accept: null, choix: [ct.bon].concat(ct.f),
      expl: 'La contraposée de « si P, alors Q » est « si non Q, alors non P » : on nie les deux morceaux et on les échange. Ici : « ' + ct.bon + ' » Elle est équivalente à l\'implication de départ, souvent plus facile à prouver.'
    };
  }
});

// =====================================================
// ect-02 — Ensembles et cardinaux
// =====================================================
SKILLS.push({
  id: 'p6-ect-02-ensembles',
  phase: 6,
  ordre: 2,
  titre: 'Ensembles et cardinaux',
  objectif: "Utiliser union, intersection, complémentaire, lois de Morgan et produit cartésien, et calculer des cardinaux (formule de Poincaré) pour des probabilités en équiprobabilité.",
  lecon: `<p class="lede">Un ensemble, c'est une collection d'objets : les clients d'une banque, les entiers de 1 à 100, les résultats d'un lancer de dé. La prépa formalise ce que tu fais déjà avec les arbres et les tableaux : <mark>compter et combiner des groupes</mark>, pour calculer des probabilités.</p>
<p><strong>Vocabulaire.</strong> On écrit x ∈ A (« x appartient à A »). A ⊂ B signifie que tout élément de A est dans B. ∅ est l'ensemble vide. Dans un ensemble de référence E :</p>
<ul>
<li><b>A ∪ B</b> (union) : les éléments qui sont dans A <b>ou</b> dans B (au moins un des deux) ;</li>
<li><b>A ∩ B</b> (intersection) : les éléments qui sont dans A <b>et</b> dans B ; si A ∩ B = ∅, A et B sont <b>disjoints</b> ;</li>
<li><b>Ā</b> (complémentaire de A dans E) : les éléments de E qui <b>ne sont pas</b> dans A.</li>
</ul>
<p>Le lien avec la logique est direct : ∪ correspond à « ou », ∩ à « et », le complémentaire à « non ». D'où les <b>lois de Morgan</b> :</p>
<div class="formule"><p>complémentaire de (A ∪ B) = Ā ∩ B̄ &nbsp;•&nbsp; complémentaire de (A ∩ B) = Ā ∪ B̄</p></div>
<p>« Ni dans A ni dans B » = Ā ∩ B̄ ; « pas dans les deux à la fois » = Ā ∪ B̄.</p>
<p><strong>Produit cartésien.</strong> A × B est l'ensemble des <b>couples</b> (a ; b) avec a ∈ A et b ∈ B. L'ordre compte : (1 ; 2) ≠ (2 ; 1). Le plan ℝ² = ℝ × ℝ est l'ensemble des couples de réels.</p>
<p><strong>Cardinaux.</strong> Card(A) est le nombre d'éléments d'un ensemble fini A.</p>
<div class="formule"><p>Card(A ∪ B) = Card(A) + Card(B) − Card(A ∩ B) &nbsp;(formule de Poincaré)<br>Card(Ā) = Card(E) − Card(A) &nbsp;•&nbsp; Card(A × B) = Card(A) × Card(B)</p></div>
<p>Exemple détaillé : sur 200 clients d'une banque, 120 ont un livret A, 90 une assurance vie et 50 ont les deux. On choisit un client au hasard.</p>
<div class="etapes">
<p>1. Je nomme les ensembles : L (livret A), V (assurance vie). Card(L) = 120, Card(V) = 90, Card(L ∩ V) = 50.</p>
<p>2. Au moins un des deux produits : Card(L ∪ V) = 120 + 90 − 50 = <mark>160</mark> (on retire 50 car ces clients ont été comptés deux fois).</p>
<p>3. Aucun des deux (Morgan) : Card(L̄ ∩ V̄) = 200 − 160 = 40.</p>
<p>4. Livret A seulement : Card(L ∩ V̄) = 120 − 50 = 70.</p>
<p>5. En équiprobabilité, P(A) = Card(A) / Card(Ω) : la probabilité que le client n'ait aucun des deux produits vaut 40/200 = 1/5.</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>∪ = « ou », ∩ = « et », Ā = « non ». Card(A ∪ B) = Card(A) + Card(B) − Card(A ∩ B). Card(A × B) = Card(A) × Card(B). En équiprobabilité : P(A) = Card(A) / Card(Ω).</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Additionner Card(A) + Card(B) sans retirer l'intersection, c'est compter deux fois ceux qui sont dans les deux. Et le complémentaire de A ∪ B n'est pas Ā ∪ B̄ : c'est Ā ∩ B̄ (on échange ∪ et ∩).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Dès qu'il y a deux critères, fais un tableau à double entrée (A / Ā en lignes, B / B̄ en colonnes, totaux en marge) : toutes les cases se remplissent par soustraction, et tu lis directement « A seulement », « ni l'un ni l'autre »…</p></div>
<p><strong>En prépa ECT :</strong> les événements sont des ensembles (A ∩ B, Ā, système complet…), et toutes les formules de probabilités de l'année — Poincaré, probabilités totales — s'écrivent dans ce langage.</p>`,
  gen(level, R){
    var CTX = [
      {pop:'salariés', a:'parlent anglais', b:'parlent espagnol', na:'ne parlent pas anglais', nb:'ne parlent pas espagnol'},
      {pop:'clients', a:'ont acheté en ligne', b:'ont acheté en boutique', na:'n\'ont pas acheté en ligne', nb:'n\'ont pas acheté en boutique'},
      {pop:'élèves', a:'font du sport', b:'font de la musique', na:'ne font pas de sport', nb:'ne font pas de musique'},
      {pop:'ménages', a:'possèdent une voiture', b:'possèdent un vélo', na:'ne possèdent pas de voiture', nb:'ne possèdent pas de vélo'},
      {pop:'clients de la banque', a:'ont un livret A', b:'ont une assurance vie', na:'n\'ont pas de livret A', nb:'n\'ont pas d\'assurance vie'}
    ];
    var Ab = 'Ā', Bb = 'B̄';
    if (level === 1){
      var t = R.pick(['ops', 'poincare', 'cardprod', 'couple']);
      if (t === 'ops'){
        var E = R.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        var ki = R.int(1, 2), ka = R.int(2, 3), kb = R.int(2, 3);
        var I = tri(E.slice(0, ki)), Ao = tri(E.slice(ki, ki + ka)), Bo = tri(E.slice(ki + ka, ki + ka + kb));
        var A = tri(I.concat(Ao)), B = tri(I.concat(Bo)), U = tri(A.concat(Bo));
        var head = 'E = {1 ; 2 ; … ; 10}, A = ' + ens(A) + ' et B = ' + ens(B) + '.\n';
        var op = R.pick(['inter', 'union', 'comp']);
        if (op === 'inter') return {
          q: head + 'Quel est l\'ensemble A ∩ B ?',
          a: ens(I), accept: null, choix: [ens(I), ens(U), ens(Ao), ens(Bo)],
          expl: 'A ∩ B contient les éléments communs à A et à B : ' + ens(I) + '. (' + ens(U) + ' est A ∪ B, ' + ens(Ao) + ' contient les éléments de A qui ne sont pas dans B.)'
        };
        if (op === 'union') return {
          q: head + 'Quel est l\'ensemble A ∪ B ?',
          a: ens(U), accept: null, choix: [ens(U), ens(I), ens(tri(Ao.concat(Bo))), ens(A)],
          expl: 'A ∪ B contient les éléments qui sont dans A ou dans B (au moins un des deux), chacun écrit une seule fois : ' + ens(U) + '.'
        };
        var cA = [], cB = [], cI = [];
        for (var x = 1; x <= 10; x++){ if (A.indexOf(x) < 0) cA.push(x); if (B.indexOf(x) < 0) cB.push(x); if (I.indexOf(x) < 0) cI.push(x); }
        return {
          q: head + 'Quel est le complémentaire ' + Ab + ' de A dans E ?',
          a: ens(cA), accept: null, choix: [ens(cA), ens(cB), ens(cI), ens(Bo)],
          expl: Ab + ' contient les éléments de E qui ne sont pas dans A : ' + ens(cA) + '. Vérification : Card(' + Ab + ') = 10 − ' + A.length + ' = ' + cA.length + '.'
        };
      }
      if (t === 'poincare'){
        var a = R.int(10, 40), b = R.int(10, 40), c = R.int(2, Math.min(a, b) - 2);
        var cx = R.pick(CTX);
        var v = R.int(0, 1);
        if (v === 0) return {
          q: 'Card(A) = ' + a + ', Card(B) = ' + b + ' et Card(A ∩ B) = ' + c + '.\nCalcule Card(A ∪ B).',
          a: String(a + b - c), accept: null, choix: null,
          expl: 'Card(A ∪ B) = Card(A) + Card(B) − Card(A ∩ B) = ' + a + ' + ' + b + ' − ' + c + ' = ' + (a + b - c) + '.'
        };
        return {
          q: 'Dans un groupe de ' + cx.pop + ', ' + a + ' ' + cx.a + ', ' + b + ' ' + cx.b + ' et ' + c + ' sont dans les deux cas.\nCombien de ' + cx.pop + ' ' + cx.a + ' ou ' + cx.b + ' (au moins l\'un des deux) ?',
          a: String(a + b - c), accept: null, choix: null,
          expl: 'Formule de Poincaré : ' + a + ' + ' + b + ' − ' + c + ' = ' + (a + b - c) + '. On retire ' + c + ' car ces ' + cx.pop + ' ont été comptés deux fois.'
        };
      }
      if (t === 'cardprod'){
        var v2 = R.int(0, 1);
        if (v2 === 0){
          var LET = ['a', 'b', 'c', 'd', 'e', 'f'];
          var m = R.int(2, 6), n = R.int(2, 5);
          var A2 = [], B2 = LET.slice(0, n);
          for (var i = 1; i <= m; i++) A2.push(i);
          return {
            q: 'A = ' + ens(A2) + ' et B = {' + B2.join(' ; ') + '}.\nCombien d\'éléments contient A × B ?',
            a: String(m*n), accept: null, choix: null,
            expl: 'Card(A × B) = Card(A) × Card(B) = ' + m + ' × ' + n + ' = ' + (m*n) + ' : chaque élément de A forme un couple avec chacun des ' + n + ' éléments de B.'
          };
        }
        var N = R.pick([30, 40, 50, 60, 80, 100, 120]), ca = R.int(5, N - 5);
        return {
          q: 'Un ensemble E contient ' + N + ' éléments et A est une partie de E telle que Card(A) = ' + ca + '.\nCalcule Card(' + Ab + ').',
          a: String(N - ca), accept: null, choix: null,
          expl: 'Card(' + Ab + ') = Card(E) − Card(A) = ' + N + ' − ' + ca + ' = ' + (N - ca) + '.'
        };
      }
      var A3 = [1, 2, 3], B3 = R.pick([['a', 'b'], ['x', 'y'], ['p', 'q', 'r']]);
      var e1 = R.pick(A3), e2 = R.pick(B3), e3 = R.pick(A3.filter(function(z){ return z !== e1; }));
      var bon = '(' + e1 + ' ; ' + e2 + ')';
      return {
        q: 'A = {1 ; 2 ; 3} et B = {' + B3.join(' ; ') + '}.\nLequel de ces objets est un élément de A × B ?',
        a: bon, accept: null, choix: [bon, '(' + e2 + ' ; ' + e1 + ')', '{' + e1 + ' ; ' + e2 + '}', '(' + e1 + ' ; ' + e3 + ')'],
        expl: 'Un élément de A × B est un couple (x ; y) avec x ∈ A en premier et y ∈ B en second. (' + e2 + ' ; ' + e1 + ') est dans l\'ordre inverse, {' + e1 + ' ; ' + e2 + '} est un ensemble et non un couple, et ' + e3 + ' n\'appartient pas à B.'
      };
    }

    if (level === 2){
      var t2 = R.pick(['contexte', 'morgan', 'proba', 'prod']);
      if (t2 === 'contexte'){
        var cx2 = R.pick(CTX);
        var N2 = R.pick([100, 120, 150, 200, 250, 300, 400]);
        var a2 = R.int(Math.round(N2*0.3), Math.round(N2*0.6)), b2 = R.int(Math.round(N2*0.2), Math.round(N2*0.5));
        var c2 = R.int(Math.max(2, a2 + b2 - N2 + 5), Math.min(a2, b2) - 3);
        var head2 = 'Sur ' + N2 + ' ' + cx2.pop + ', ' + a2 + ' ' + cx2.a + ', ' + b2 + ' ' + cx2.b + ' et ' + c2 + ' sont dans les deux cas.\nOn note A l\'ensemble de ceux qui ' + cx2.a + ' et B l\'ensemble de ceux qui ' + cx2.b + '.\n';
        var U2 = a2 + b2 - c2;
        var w = R.pick(['ni', 'seul', 'exact', 'union']);
        if (w === 'ni') return {
          q: head2 + 'Combien ne sont ni dans A ni dans B ?',
          a: String(N2 - U2), accept: null, choix: null,
          expl: 'Card(A ∪ B) = ' + a2 + ' + ' + b2 + ' − ' + c2 + ' = ' + U2 + '. Par Morgan, « ni A ni B » est le complémentaire de A ∪ B : ' + N2 + ' − ' + U2 + ' = ' + (N2 - U2) + '.'
        };
        if (w === 'seul') return {
          q: head2 + 'Combien sont dans A mais pas dans B (A ∩ ' + Bb + ') ?',
          a: String(a2 - c2), accept: null, choix: null,
          expl: 'Parmi les ' + a2 + ' éléments de A, ' + c2 + ' sont aussi dans B. Donc Card(A ∩ ' + Bb + ') = ' + a2 + ' − ' + c2 + ' = ' + (a2 - c2) + '.'
        };
        if (w === 'exact') return {
          q: head2 + 'Combien sont dans exactement un des deux ensembles ?',
          a: String(a2 + b2 - 2*c2), accept: null, choix: null,
          expl: 'A seulement : ' + a2 + ' − ' + c2 + ' = ' + (a2 - c2) + '. B seulement : ' + b2 + ' − ' + c2 + ' = ' + (b2 - c2) + '. Total : ' + (a2 - c2) + ' + ' + (b2 - c2) + ' = ' + (a2 + b2 - 2*c2) + '.'
        };
        return {
          q: head2 + 'Calcule Card(A ∪ B).',
          a: String(U2), accept: null, choix: null,
          expl: 'Card(A ∪ B) = Card(A) + Card(B) − Card(A ∩ B) = ' + a2 + ' + ' + b2 + ' − ' + c2 + ' = ' + U2 + '.'
        };
      }
      if (t2 === 'morgan'){
        var POOL = ['A ∪ B', 'A ∩ B', Ab + ' ∩ ' + Bb, Ab + ' ∪ ' + Bb, 'A ∩ ' + Bb, Ab + ' ∩ B'];
        var cx3 = R.pick(CTX);
        var TY = [
          {ph:'qui ' + cx3.a + ' ou qui ' + cx3.b + ' (au moins l\'un des deux)', bon:'A ∪ B', typ:'A ∩ B'},
          {ph:'qui ' + cx3.a + ' et ' + cx3.b, bon:'A ∩ B', typ:'A ∪ B'},
          {ph:'qui ' + cx3.na + ' et ' + cx3.nb, bon:Ab + ' ∩ ' + Bb, typ:Ab + ' ∪ ' + Bb},
          {ph:'qui ' + cx3.na + ' ou qui ' + cx3.nb, bon:Ab + ' ∪ ' + Bb, typ:Ab + ' ∩ ' + Bb},
          {ph:'qui ' + cx3.a + ' mais ' + cx3.nb, bon:'A ∩ ' + Bb, typ:Ab + ' ∩ B'}
        ];
        var ty = R.pick(TY);
        var abs = R.int(0, 2) === 0;
        if (abs){
          var morg = R.pick([['le complémentaire de A ∪ B', Ab + ' ∩ ' + Bb, Ab + ' ∪ ' + Bb], ['le complémentaire de A ∩ B', Ab + ' ∪ ' + Bb, Ab + ' ∩ ' + Bb]]);
          var rest = R.shuffle(POOL.filter(function(z){ return z !== morg[1] && z !== morg[2]; }));
          return {
            q: 'Lois de Morgan : à quel ensemble est égal ' + morg[0] + ' ?',
            a: morg[1], accept: null, choix: [morg[1], morg[2]].concat(rest.slice(0, 2)),
            expl: 'Le complémentaire échange ∪ et ∩ : ' + morg[0] + ' = ' + morg[1] + '. En mots : « non (A ' + (morg[0].indexOf('∪') > 0 ? 'ou' : 'et') + ' B) » = « (non A) ' + (morg[0].indexOf('∪') > 0 ? 'et' : 'ou') + ' (non B) ».'
          };
        }
        var rest2 = R.shuffle(POOL.filter(function(z){ return z !== ty.bon && z !== ty.typ; }));
        return {
          q: 'On note A l\'ensemble des ' + cx3.pop + ' qui ' + cx3.a + ' et B celui des ' + cx3.pop + ' qui ' + cx3.b + '.\nL\'ensemble des ' + cx3.pop + ' ' + ty.ph + ' est :',
          a: ty.bon, accept: null, choix: [ty.bon, ty.typ].concat(rest2.slice(0, 2)),
          expl: '« et » se traduit par ∩, « ou » par ∪, « ne … pas » par le complémentaire. L\'ensemble cherché est ' + ty.bon + '.' + (ty.bon === Ab + ' ∩ ' + Bb ? ' Par Morgan, c\'est aussi le complémentaire de A ∪ B (« ni l\'un ni l\'autre »).' : (ty.bon === Ab + ' ∪ ' + Bb ? ' Par Morgan, c\'est aussi le complémentaire de A ∩ B (« pas les deux à la fois »).' : ''))
        };
      }
      if (t2 === 'proba'){
        var PQ = R.pick([[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 7], [3, 7]]);
        var p = PQ[0], q = PQ[1], pq = p*q;
        var mult = R.int(1, Math.max(1, Math.floor(120/pq)));
        var N3 = pq*mult;
        if (N3 < 20) N3 = pq*Math.ceil(20/pq);
        var cA3 = N3/p, cB3 = N3/q, cI3 = N3/pq, cU3 = cA3 + cB3 - cI3;
        var head3 = 'On choisit au hasard un entier entre 1 et ' + N3 + ' (tous ont la même probabilité). A : « il est multiple de ' + p + ' », B : « il est multiple de ' + q + ' ».\n';
        var w3 = R.pick(['union', 'inter', 'ni']);
        var base = 'Card(A) = ' + N3 + '/' + p + ' = ' + cA3 + ', Card(B) = ' + N3 + '/' + q + ' = ' + cB3 + ', et A ∩ B = multiples de ' + pq + ' (car ' + p + ' et ' + q + ' n\'ont pas d\'autre diviseur commun que 1) : Card(A ∩ B) = ' + cI3 + '. ';
        if (w3 === 'inter') return {
          q: head3 + 'Calcule P(A ∩ B) (fraction).',
          a: fracStr(cI3, N3), accept: null, choix: null,
          expl: base + 'P(A ∩ B) = ' + pf(cI3, N3) + '.'
        };
        if (w3 === 'union') return {
          q: head3 + 'Calcule P(A ∪ B) (fraction).',
          a: fracStr(cU3, N3), accept: null, choix: null,
          expl: base + 'Card(A ∪ B) = ' + cA3 + ' + ' + cB3 + ' − ' + cI3 + ' = ' + cU3 + ', donc P(A ∪ B) = ' + pf(cU3, N3) + '.'
        };
        return {
          q: head3 + 'Quelle est la probabilité que l\'entier ne soit multiple ni de ' + p + ' ni de ' + q + ' (fraction) ?',
          a: fracStr(N3 - cU3, N3), accept: null, choix: null,
          expl: base + 'Card(A ∪ B) = ' + cA3 + ' + ' + cB3 + ' − ' + cI3 + ' = ' + cU3 + '. « Ni A ni B » = ' + Ab + ' ∩ ' + Bb + ', complémentaire de A ∪ B : ' + N3 + ' − ' + cU3 + ' = ' + (N3 - cU3) + ' entiers. P = ' + pf(N3 - cU3, N3) + '.'
        };
      }
      var m4 = R.int(2, 9), n4 = R.int(2, 9);
      if (R.int(0, 1) === 0) return {
        q: 'On sait que Card(A) = ' + m4 + ' et Card(A × B) = ' + (m4*n4) + '.\nCombien vaut Card(B) ?',
        a: String(n4), accept: null, choix: null,
        expl: 'Card(A × B) = Card(A) × Card(B), donc Card(B) = ' + (m4*n4) + ' ÷ ' + m4 + ' = ' + n4 + '.'
      };
      return {
        q: 'A est un ensemble à ' + m4 + ' éléments. Combien d\'éléments contient A × A (noté aussi A²) ?',
        a: String(m4*m4), accept: null, choix: null,
        expl: 'Card(A × A) = Card(A) × Card(A) = ' + m4 + ' × ' + m4 + ' = ' + (m4*m4) + '. Les couples (x ; x) sont permis, et (x ; y) ≠ (y ; x).'
      };
    }

    // ----- level 3 -----
    var t3 = R.pick(['inverse', 'probani', 'des', 'produnion']);
    if (t3 === 'inverse'){
      var cx4 = R.pick(CTX);
      var N4 = R.pick([100, 120, 150, 200, 250, 300]);
      var a4 = R.int(Math.round(N4*0.35), Math.round(N4*0.6)), b4 = R.int(Math.round(N4*0.3), Math.round(N4*0.5));
      var c4 = R.int(Math.max(2, a4 + b4 - N4 + 5), Math.min(a4, b4) - 3);
      var u4 = a4 + b4 - c4;
      var nom4 = 'On note A l\'ensemble des ' + cx4.pop + ' qui ' + cx4.a + ' et B celui des ' + cx4.pop + ' qui ' + cx4.b + '. ';
      if (R.int(0, 1) === 0) return {
        q: 'Sur ' + N4 + ' ' + cx4.pop + ', ' + a4 + ' ' + cx4.a + ', ' + b4 + ' ' + cx4.b + ', et ' + u4 + ' vérifient au moins l\'une des deux conditions.\nCombien vérifient les deux à la fois ?',
        a: String(c4), accept: null, choix: null,
        expl: nom4 + 'Card(A ∪ B) = Card(A) + Card(B) − Card(A ∩ B), donc Card(A ∩ B) = ' + a4 + ' + ' + b4 + ' − ' + u4 + ' = ' + c4 + '.'
      };
      var ni4 = N4 - u4;
      return {
        q: 'Sur ' + N4 + ' ' + cx4.pop + ', ' + a4 + ' ' + cx4.a + ', ' + b4 + ' ' + cx4.b + ', et ' + ni4 + ' ne vérifient aucune des deux conditions.\nCombien vérifient les deux à la fois ?',
        a: String(c4), accept: null, choix: null,
        expl: nom4 + 'Card(A ∪ B) = ' + N4 + ' − ' + ni4 + ' = ' + u4 + ' (complémentaire de « ni l\'un ni l\'autre »). Puis Card(A ∩ B) = ' + a4 + ' + ' + b4 + ' − ' + u4 + ' = ' + c4 + '.'
      };
    }
    if (t3 === 'probani'){
      var cx5 = R.pick(CTX);
      var N5 = R.pick([40, 50, 60, 80, 100, 120, 200]);
      var a5 = R.int(Math.round(N5*0.3), Math.round(N5*0.55)), b5 = R.int(Math.round(N5*0.2), Math.round(N5*0.45));
      var c5 = R.int(Math.max(2, a5 + b5 - N5 + 3), Math.min(a5, b5) - 2);
      var u5 = a5 + b5 - c5;
      var w5 = R.pick(['ni', 'pasdeux', 'unseul']);
      var h5 = 'Sur ' + N5 + ' ' + cx5.pop + ', ' + a5 + ' ' + cx5.a + ', ' + b5 + ' ' + cx5.b + ' et ' + c5 + ' sont dans les deux cas. On en choisit un au hasard (équiprobabilité).\nOn note A l\'événement « il ' + cx5.a.replace(/(ont|font|parlent|possèdent)\b/, function(z){ return {ont:'a', font:'fait', parlent:'parle', 'possèdent':'possède'}[z]; }) + ' » et B l\'événement « il ' + cx5.b.replace(/(ont|font|parlent|possèdent)\b/, function(z){ return {ont:'a', font:'fait', parlent:'parle', 'possèdent':'possède'}[z]; }) + ' ».\n';
      if (w5 === 'ni') return {
        q: h5 + 'Quelle est la probabilité qu\'il ' + cx5.na.replace(/(ont|font|parlent|possèdent)\b/, function(z){ return {ont:'ait', font:'fasse', parlent:'parle', 'possèdent':'possède'}[z]; }) + ' et ' + cx5.nb.replace(/(ont|font|parlent|possèdent)\b/, function(z){ return {ont:'ait', font:'fasse', parlent:'parle', 'possèdent':'possède'}[z]; }) + ' ? (fraction)',
        a: fracStr(N5 - u5, N5), accept: null, choix: null,
        expl: 'Card(A ∪ B) = ' + a5 + ' + ' + b5 + ' − ' + c5 + ' = ' + u5 + '. Par Morgan, ' + Ab + ' ∩ ' + Bb + ' est le complémentaire de A ∪ B : ' + N5 + ' − ' + u5 + ' = ' + (N5 - u5) + '. P = ' + pf(N5 - u5, N5) + '.'
      };
      if (w5 === 'pasdeux') return {
        q: h5 + 'Quelle est la probabilité de l\'événement ' + Ab + ' ∪ ' + Bb + ' ? (fraction)',
        a: fracStr(N5 - c5, N5), accept: null, choix: null,
        expl: 'Par Morgan, ' + Ab + ' ∪ ' + Bb + ' est le complémentaire de A ∩ B (« pas les deux à la fois »). Card = ' + N5 + ' − ' + c5 + ' = ' + (N5 - c5) + ', donc P = ' + pf(N5 - c5, N5) + '.'
      };
      return {
        q: h5 + 'Quelle est la probabilité qu\'il soit dans exactement un des deux groupes ? (fraction)',
        a: fracStr(a5 + b5 - 2*c5, N5), accept: null, choix: null,
        expl: 'A seulement : ' + a5 + ' − ' + c5 + ' = ' + (a5 - c5) + ' ; B seulement : ' + b5 + ' − ' + c5 + ' = ' + (b5 - c5) + '. Total : ' + (a5 + b5 - 2*c5) + ', donc P = ' + pf(a5 + b5 - 2*c5, N5) + '.'
      };
    }
    if (t3 === 'des'){
      var w6 = R.pick(['aumoins', 'aucun', 'somme']);
      if (w6 === 'somme'){
        var s = R.int(2, 12), cnt = 6 - Math.abs(s - 7);
        return {
          q: 'On lance deux dés équilibrés à 6 faces. L\'univers est Ω = {1, …, 6} × {1, …, 6}, avec équiprobabilité.\nQuelle est la probabilité que la somme des deux dés vaille ' + s + ' ? (fraction)',
          a: fracStr(cnt, 36), accept: null, choix: null,
          expl: 'Card(Ω) = 6 × 6 = 36 couples. Couples de somme ' + s + ' : ' + (function(){ var L = []; for (var i = 1; i <= 6; i++){ var j = s - i; if (j >= 1 && j <= 6) L.push('(' + i + ' ; ' + j + ')'); } return L.join(', '); })() + ', soit ' + cnt + '. P = ' + pf(cnt, 36) + '.'
        };
      }
      var nf = R.pick([4, 6, 8, 10, 12]), kf = R.int(1, nf);
      if (w6 === 'aucun') return {
        q: 'On lance deux dés équilibrés à ' + nf + ' faces (numérotées de 1 à ' + nf + '). Ω = {1, …, ' + nf + '}², avec équiprobabilité.\nQuelle est la probabilité de n\'obtenir aucun ' + kf + ' ? (fraction)',
        a: fracStr((nf - 1)*(nf - 1), nf*nf), accept: null, choix: null,
        expl: 'Card(Ω) = ' + nf + ' × ' + nf + ' = ' + (nf*nf) + '. « Aucun ' + kf + ' » = couples dont chaque dé est dans un ensemble à ' + (nf - 1) + ' valeurs : Card = ' + (nf - 1) + ' × ' + (nf - 1) + ' = ' + ((nf - 1)*(nf - 1)) + ' (produit cartésien). P = ' + pf((nf - 1)*(nf - 1), nf*nf) + '.'
      };
      return {
        q: 'On lance deux dés équilibrés à ' + nf + ' faces (numérotées de 1 à ' + nf + '). Ω = {1, …, ' + nf + '}², avec équiprobabilité.\nQuelle est la probabilité d\'obtenir au moins un ' + kf + ' ? (fraction)',
        a: fracStr(2*nf - 1, nf*nf), accept: null, choix: null,
        expl: 'On passe par le complémentaire : « aucun ' + kf + ' » compte ' + (nf - 1) + ' × ' + (nf - 1) + ' = ' + ((nf - 1)*(nf - 1)) + ' couples sur ' + (nf*nf) + '. Donc « au moins un ' + kf + ' » en compte ' + (nf*nf) + ' − ' + ((nf - 1)*(nf - 1)) + ' = ' + (2*nf - 1) + ', et P = ' + (2*nf - 1) + '/' + (nf*nf) + (pgcd(2*nf - 1, nf*nf) > 1 ? ' = ' + fracStr(2*nf - 1, nf*nf) : '') + '.'
      };
    }
    var a7 = R.int(3, 9), b7 = R.int(3, 9), c7 = R.int(1, Math.min(a7, b7) - 1), d7 = R.int(2, 6);
    var u7 = a7 + b7 - c7;
    return {
      q: 'Card(A) = ' + a7 + ', Card(B) = ' + b7 + ', Card(A ∩ B) = ' + c7 + ' et Card(C) = ' + d7 + '.\nCalcule Card((A ∪ B) × C).',
      a: String(u7*d7), accept: null, choix: null,
      expl: 'D\'abord Card(A ∪ B) = ' + a7 + ' + ' + b7 + ' − ' + c7 + ' = ' + u7 + '. Puis Card((A ∪ B) × C) = ' + u7 + ' × ' + d7 + ' = ' + (u7*d7) + '.'
    };
  }
});

// =====================================================
// ect-03 — Polynômes
// =====================================================
SKILLS.push({
  id: 'p6-ect-03-polynomes',
  phase: 6,
  ordre: 3,
  titre: 'Polynômes : racines, factorisation, signe',
  objectif: "Utiliser le discriminant, la somme et le produit des racines, factoriser un trinôme ou un polynôme de degré 3 dont on connaît une racine, et en déduire signe, équations et inéquations.",
  lecon: `<p class="lede">Tu sais déjà résoudre ax² + bx + c = 0 avec le discriminant. La prépa te demande d'aller plus loin : <mark>lire les racines sans les calculer</mark> (somme et produit), et <mark>casser un polynôme de degré 3</mark> en morceaux plus simples dès qu'on connaît une de ses racines.</p>
<p><strong>Rappel : le trinôme</strong> ax² + bx + c (a ≠ 0) a pour discriminant Δ = b² − 4ac.</p>
<ul>
<li>Δ &gt; 0 : deux racines x₁ = (−b − √Δ)/(2a) et x₂ = (−b + √Δ)/(2a), et ax² + bx + c = a(x − x₁)(x − x₂) ;</li>
<li>Δ = 0 : une racine double x₀ = −b/(2a), et ax² + bx + c = a(x − x₀)² ;</li>
<li>Δ &lt; 0 : aucune racine réelle, pas de factorisation.</li>
</ul>
<p><strong>Signe :</strong> le trinôme est du signe de a, sauf entre ses racines (quand il en a deux).</p>
<p><strong>Somme et produit des racines.</strong> Si Δ ≥ 0, en développant a(x − x₁)(x − x₂) = ax² − a(x₁ + x₂)x + a·x₁x₂ et en identifiant avec ax² + bx + c :</p>
<div class="formule"><p>S = x₁ + x₂ = −b/a &nbsp;•&nbsp; P = x₁ × x₂ = c/a</p></div>
<p>Exemple détaillé avec 2x² − 7x + 3 :</p>
<div class="etapes">
<p>1. Δ = (−7)² − 4 × 2 × 3 = 49 − 24 = 25 &gt; 0 : deux racines.</p>
<p>2. x₁ = (7 − 5)/4 = 1/2 et x₂ = (7 + 5)/4 = 3.</p>
<p>3. Contrôle : S = 1/2 + 3 = 7/2 = −(−7)/2 ✓ et P = 1/2 × 3 = 3/2 = c/a ✓.</p>
<p>4. Factorisation : 2x² − 7x + 3 = 2(x − 1/2)(x − 3) = (2x − 1)(x − 3).</p>
</div>
<p>Usage malin : si tu connais une racine, l'autre se déduit du produit (x₂ = c/(a·x₁)) ou de la somme. Et deux nombres de somme S et de produit P sont les racines de x² − Sx + P.</p>
<p><strong>Polynômes de degré 3.</strong> Si a est racine de P (P(a) = 0), alors P(x) se factorise par (x − a) : P(x) = (x − a)Q(x) avec Q de degré 2. On cherche Q par <b>identification</b> (ou par division euclidienne, comme une division de nombres). Exemple avec P(x) = x³ − 2x² − 5x + 6 :</p>
<div class="etapes">
<p>1. Racine évidente : P(1) = 1 − 2 − 5 + 6 = 0. Donc P(x) = (x − 1)(x² + βx + γ).</p>
<p>2. Je développe : (x − 1)(x² + βx + γ) = x³ + (β − 1)x² + (γ − β)x − γ.</p>
<p>3. J'identifie : β − 1 = −2 donne β = −1 ; −γ = 6 donne γ = −6 ; contrôle : γ − β = −6 + 1 = −5 ✓.</p>
<p>4. Donc P(x) = (x − 1)(x² − x − 6), et x² − x − 6 a pour Δ = 1 + 24 = 25, racines −2 et 3 : <mark>P(x) = (x − 1)(x + 2)(x − 3)</mark>.</p>
<p>5. Tableau de signes des trois facteurs : P(x) ≥ 0 sur [−2 ; 1] ∪ [3 ; +∞[ (contrôle : P(0) = 6 &gt; 0 et P(2) = 8 − 8 − 10 + 6 = −4 &lt; 0).</p>
</div>
<div class="box retenir"><p class="box-t">À retenir</p><p>S = −b/a et P = c/a. Si P(a) = 0, alors P(x) = (x − a)Q(x) : on trouve Q par identification des coefficients. Pour le signe d'un produit, un tableau de signes avec une ligne par facteur.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>S = <b>−</b>b/a, pas b/a : le signe moins est l'erreur n° 1. Et en factorisant, n'oublie pas le coefficient a devant : 2x² − 2x − 12 = <b>2</b>(x − 3)(x + 2).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour trouver une racine évidente, teste d'abord 1, −1, 2, −2 (et plus généralement les diviseurs du terme constant quand le coefficient de x³ vaut 1). Pour P(1), il suffit d'additionner les coefficients !</p></div>
<p><strong>En prépa ECT :</strong> les polynômes reviennent partout — fonctions de coût et de bénéfice, étude de signe d'une dérivée, recherche d'extremums — et la factorisation par (x − a) est le réflexe pour résoudre une équation de degré 3.</p>`,
  gen(level, R){
    function intv(r1, r2, inside, closed){
      if (inside) return itv(r1, r2, closed, closed);
      return itv(null, r1, false, closed) + ' ∪ ' + itv(r2, null, closed, false);
    }
    if (level === 1){
      var t = R.pick(['delta', 'sp', 'fact', 'racine']);
      if (t === 'delta'){
        var a = R.pick([1, 2, 3, -1, -2, 4]), b = R.int(-9, 9), c = R.int(-9, 9);
        if (c === 0) c = 5;
        var D = b*b - 4*a*c;
        return {
          q: 'Calcule le discriminant Δ du trinôme ' + poly([a, b, c]) + '.',
          a: sg(D), accept: null, choix: null,
          expl: 'Δ = b² − 4ac = ' + par(b) + '² − 4 × ' + par(a) + ' × ' + par(c) + ' = ' + (b*b) + plus(-4*a*c) + ' = ' + sg(D) + '.'
        };
      }
      var r1 = R.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7]);
      var r2 = R.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8, 9]);
      if (r2 === r1) r2 = r1 + 1;
      if (r2 === -r1) r2 = r2 + 1;
      if (r2 === 0) r2 = 2;
      if (r2 === r1 || r2 === -r1) r2 = r1 + 3;
      var Sb = r1 + r2, Pc = r1*r2;
      var txt = poly([1, -Sb, Pc]);
      if (t === 'sp'){
        if (R.int(0, 1) === 0) return {
          q: 'Sans calculer les racines, donne la somme des racines de ' + txt + ' (on admet que Δ > 0).',
          a: sg(Sb), accept: null, choix: null,
          expl: 'Ici a = 1 et b = ' + sg(-Sb) + ', donc S = −b/a = ' + sg(Sb) + '. (Les racines sont ' + sg(Math.min(r1, r2)) + ' et ' + sg(Math.max(r1, r2)) + '.)'
        };
        return {
          q: 'Sans calculer les racines, donne le produit des racines de ' + txt + ' (on admet que Δ > 0).',
          a: sg(Pc), accept: null, choix: null,
          expl: 'Ici a = 1 et c = ' + sg(Pc) + ', donc P = c/a = ' + sg(Pc) + '. (Les racines sont ' + sg(Math.min(r1, r2)) + ' et ' + sg(Math.max(r1, r2)) + '.)'
        };
      }
      if (t === 'fact'){
        var bonF = fx(r1) + fx(r2);
        return {
          q: 'Quelle est la forme factorisée de ' + txt + ' ?',
          a: bonF, accept: null,
          choix: qcm(bonF, [fx(-r1) + fx(-r2), fx(r1) + fx(-r2), fx(-r1) + fx(r2), fx(r1 + 1) + fx(r2 + 1)]),
          expl: 'Les racines ont pour somme ' + sg(Sb) + ' et pour produit ' + sg(Pc) + ' : ce sont ' + sg(r1) + ' et ' + sg(r2) + '. Donc ' + txt + ' = ' + bonF + '. Vérifie en développant : on retrouve ' + txt + '.'
        };
      }
      var cand = [-r1, -r2, r1 + r2, r1 - r2, r2 - r1, 2*r1, r1*r2, r1 + 1, r2 + 1, 0];
      var autres = [];
      for (var i = 0; i < cand.length; i++){
        var v = cand[i];
        if (v !== r1 && v !== r2 && autres.indexOf(sg(v)) < 0 && autres.length < 3) autres.push(sg(v));
      }
      return {
        q: 'Lequel de ces nombres est une racine de ' + txt + ' ?',
        a: sg(r1), accept: null, choix: [sg(r1)].concat(autres),
        expl: 'On remplace x par ' + sg(r1) + ' : ' + par(r1) + '²' + plus(-Sb) + ' × ' + par(r1) + plus(Pc) + ' = ' + (r1*r1) + plus(-Sb*r1) + plus(Pc) + ' = 0. Les racines sont ' + sg(r1) + ' et ' + sg(r2) + ' (somme ' + sg(Sb) + ', produit ' + sg(Pc) + ').'
      };
    }

    if (level === 2){
      var t2 = R.pick(['autre', 'sommeprod', 'ineq', 'factA', 'spfrac']);
      if (t2 === 'autre'){
        var x1 = R.pick([-3, -2, -1, 1, 2, 3, 4]), pp = R.pick([-5, -3, -1, 1, 3, 5, 7]), qq = R.pick([2, 3]);
        if (pp % qq === 0) pp = pp + 1;
        // q·x² − (q·x1 + p)x + p·x1 : racines x1 et p/q
        var A2 = qq, B2 = -(qq*x1 + pp), C2 = pp*x1;
        var via = R.int(0, 1);
        return {
          q: 'On sait que ' + sg(x1) + ' est une racine de ' + poly([A2, B2, C2]) + '.\nEn utilisant ' + (via ? 'le produit' : 'la somme') + ' des racines, trouve l\'autre racine (fraction si besoin).',
          a: fracStr(pp, qq), accept: null, choix: null,
          expl: via
            ? 'P = c/a = ' + qf(C2, A2) + '. Donc ' + sg(x1) + ' × x₂ = ' + fracStr(C2, A2) + ', d\'où x₂ = ' + fracStr(C2, A2) + ' ÷ ' + par(x1) + ' = ' + fracStr(pp, qq) + '.'
            : 'S = −b/a = ' + qf(-B2, A2) + '. Donc x₂ = ' + fracStr(-B2, A2) + ' − ' + par(x1) + ' = ' + fracStr(pp, qq) + '.'
        };
      }
      if (t2 === 'sommeprod'){
        if (R.int(0, 1) === 0){
          var L = R.int(6, 30), l = R.int(2, L - 1);
          return {
            q: 'Un terrain rectangulaire a un périmètre de ' + (2*(L + l)) + ' m et une aire de ' + (L*l) + ' m².\nQuelle est sa longueur (le plus grand côté), en m ?',
            a: String(L), accept: null, choix: null,
            expl: 'Longueur et largeur ont pour somme ' + (L + l) + ' (demi-périmètre) et pour produit ' + (L*l) + ' : ce sont les racines de x² − ' + (L + l) + 'x + ' + (L*l) + '. Δ = ' + ((L + l)*(L + l)) + ' − ' + (4*L*l) + ' = ' + ((L - l)*(L - l)) + ', √Δ = ' + (L - l) + ', racines ' + l + ' et ' + L + '. Longueur : ' + L + ' m.'
          };
        }
        var u = R.int(-8, 9), w = R.int(-9, 8);
        if (u === w) w = u - 3;
        var big = Math.max(u, w), sm = Math.min(u, w);
        return {
          q: 'Deux nombres réels ont pour somme ' + sg(u + w) + ' et pour produit ' + sg(u*w) + '.\nQuel est le plus grand des deux ?',
          a: sg(big), accept: null, choix: null,
          expl: 'Ce sont les racines de x² − Sx + P = ' + poly([1, -(u + w), u*w]) + '. Δ = ' + par(u + w) + '² − 4 × ' + par(u*w) + ' = ' + ((big - sm)*(big - sm)) + ', √Δ = ' + (big - sm) + ', racines ' + sg(sm) + ' et ' + sg(big) + '. Le plus grand : ' + sg(big) + '.'
        };
      }
      if (t2 === 'ineq'){
        var p1 = R.int(-6, 4), p2 = p1 + R.int(1, 6), aa = R.pick([1, -1, 2, -2, 3]);
        var co = [aa, -aa*(p1 + p2), aa*p1*p2];
        var eco = aa < 0 && p1 >= 1 && R.int(0, 1) === 0;
        var op = R.pick(['<', '≤', '>', '≥']);
        if (eco) op = R.pick(['>', '≥']);
        var inside = (aa > 0) === (op === '<' || op === '≤');
        var closed = op === '≤' || op === '≥';
        var bonI = intv(p1, p2, inside, closed);
        var ch = [intv(p1, p2, true, false), intv(p1, p2, true, true), intv(p1, p2, false, false), intv(p1, p2, false, true)];
        var why = 'Les racines de ' + poly(co) + ' sont ' + sg(p1) + ' et ' + sg(p2) + ' (le trinôme vaut ' + (aa === 1 ? '' : (aa === -1 ? '−' : sg(aa))) + fx(p1) + fx(p2) + '). Il est du signe de a = ' + sg(aa) + ' à l\'extérieur des racines, et du signe contraire entre elles. ';
        if (eco) return {
          q: 'Le bénéfice d\'une entreprise, en milliers d\'euros, est B(x) = ' + poly(co) + ', où x est la quantité produite (en centaines d\'unités).\nPour quelles valeurs de x le bénéfice est-il ' + (op === '>' ? 'strictement positif' : 'positif ou nul') + ' ?',
          a: bonI, accept: null, choix: ch,
          expl: why + 'Comme a < 0, B(x) ' + op + ' 0 entre les racines : x ∈ ' + bonI + '. Ce sont les seuils de rentabilité.'
        };
        return {
          q: 'Résous l\'inéquation ' + poly(co) + ' ' + op + ' 0.',
          a: bonI, accept: null, choix: ch,
          expl: why + 'Donc ' + poly(co) + ' ' + op + ' 0 pour x ∈ ' + bonI + (closed ? ' (racines incluses car l\'inégalité est large).' : ' (racines exclues car l\'inégalité est stricte).')
        };
      }
      if (t2 === 'factA'){
        var k = R.pick([2, 3, -2, -3, 4, 5]);
        var s1 = R.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 6]), s2 = R.pick([-6, -3, -2, -1, 1, 2, 3, 5]);
        if (s1 === s2) s2 = s1 + 2;
        if (s2 === 0) s2 = 1;
        if (s1 === -s2) s2 = s2 + (s2 > 0 ? 1 : -1);
        if (s2 === s1) s2 = s1 + 3;
        var coA = [k, -k*(s1 + s2), k*s1*s2];
        var bonA = sg(k) + fx(s1) + fx(s2);
        return {
          q: 'Quelle est la forme factorisée de ' + poly(coA) + ' ?',
          a: bonA, accept: null,
          choix: qcm(bonA, [fx(s1) + fx(s2), sg(k) + fx(-s1) + fx(-s2), sg(k) + fx(s1) + fx(-s2), sg(-k) + fx(s1) + fx(s2)]),
          expl: 'Je mets a = ' + sg(k) + ' en facteur : ' + poly(coA) + ' = ' + sg(k) + '(' + poly([1, -(s1 + s2), s1*s2]) + '). Les racines du trinôme ont pour somme ' + sg(s1 + s2) + ' et produit ' + sg(s1*s2) + ' : ' + sg(s1) + ' et ' + sg(s2) + '. Donc ' + bonA + '.'
        };
      }
      var a5 = R.pick([2, 3, 4, 5, -2, -3]), b5 = R.int(-9, 9);
      var c5 = (a5 > 0 ? -1 : 1)*R.int(1, 9);
      if (b5 === 0) b5 = 7;
      var D5 = b5*b5 - 4*a5*c5;
      if (R.int(0, 1) === 0) return {
        q: 'Le trinôme ' + poly([a5, b5, c5]) + ' a deux racines (Δ = ' + D5 + ' > 0).\nSans les calculer, donne leur somme (fraction si besoin).',
        a: fracStr(-b5, a5), accept: null, choix: null,
        expl: 'Ici a = ' + sg(a5) + ' et b = ' + sg(b5) + ', donc S = −b/a = ' + qf(-b5, a5) + '.'
      };
      return {
        q: 'Le trinôme ' + poly([a5, b5, c5]) + ' a deux racines (Δ = ' + D5 + ' > 0).\nSans les calculer, donne leur produit (fraction si besoin).',
        a: fracStr(c5, a5), accept: null, choix: null,
        expl: 'Ici a = ' + sg(a5) + ' et c = ' + sg(c5) + ', donc P = c/a = ' + qf(c5, a5) + '. Un produit négatif signifie que les racines sont de signes contraires.'
      };
    }

    // ----- level 3 : degré 3 -----
    var NEG = [[1, 0, 1], [1, 1, 1], [1, -1, 1], [1, 2, 3], [1, -2, 2], [1, 0, 3], [1, 2, 2], [1, -1, 2], [1, 0, 2], [1, -2, 5]];
    function dev(a, beta, gamma){ return [1, beta - a, gamma - a*beta, -a*gamma]; }
    function ev(c, x){ return c[0]*x*x*x + c[1]*x*x + c[2]*x + c[3]; }
    var t3 = R.pick(['ident', 'evidente', 'nbrac', 'ineq3', 'resol']);
    if (t3 === 'ident'){
      var a = R.pick([-3, -2, -1, 1, 2, 3]), beta = R.int(-5, 5), gamma = R.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      var co3 = dev(a, beta, gamma);
      var qui = R.pick(['γ', 'β']);
      var hd = 'P(x) = ' + poly(co3) + '. On vérifie que P(' + sg(a) + ') = 0, donc P(x) = ' + fx(a) + '(x² + βx + γ).\n';
      if (qui === 'γ') return {
        q: hd + 'Détermine γ.',
        a: sg(gamma), accept: null, choix: null,
        expl: 'En développant, ' + fx(a) + '(x² + βx + γ) a pour terme constant ' + sg(-a) + ' × γ. On identifie avec ' + sg(co3[3]) + ' : ' + (a === -1 ? '' : (a === 1 ? '−' : sg(-a))) + 'γ = ' + sg(co3[3]) + ', donc γ = ' + sg(gamma) + '.'
      };
      return {
        q: hd + 'Détermine β.',
        a: sg(beta), accept: null, choix: null,
        expl: 'En développant, le coefficient de x² est β' + plus(-a) + '. On identifie avec ' + sg(co3[1]) + ' : β' + plus(-a) + ' = ' + sg(co3[1]) + ', donc β = ' + sg(beta) + '. (Et P(x) = ' + fx(a) + '(' + poly([1, beta, gamma]) + ').)'
      };
    }
    if (t3 === 'evidente'){
      var ae = R.pick([-2, -1, 1, 2]), qd = R.pick(NEG);
      var coE = dev(ae, qd[1], qd[2]);
      var vals = [-2, -1, 1, 2].map(function(z){ return 'P(' + sg(z) + ') = ' + sg(ev(coE, z)); }).join(' ; ');
      return {
        q: 'Laquelle de ces valeurs est une racine évidente de P(x) = ' + poly(coE) + ' ?',
        a: sg(ae), accept: null, choix: ['−2', '−1', '1', '2'],
        expl: 'On calcule : ' + vals + '. Seule ' + sg(ae) + ' annule P. On peut donc factoriser P(x) par ' + fx(ae) + ' : P(x) = ' + fx(ae) + '(' + poly(qd) + ').'
      };
    }
    if (t3 === 'nbrac'){
      var an = R.pick([-3, -2, -1, 1, 2, 3]);
      var mode = R.pick(['neg', 'deux', 'deux', 'double']);
      var quad, rac = [an], qtxt;
      if (mode === 'neg'){ quad = R.pick(NEG); qtxt = 'Δ = ' + (quad[1]*quad[1] - 4*quad[2]) + ' < 0, pas de racine'; }
      else if (mode === 'deux'){
        var rr = R.int(-4, 4), ss = R.int(-4, 4);
        if (ss === rr) ss = rr + 1;
        quad = [1, -(rr + ss), rr*ss];
        rac.push(rr, ss);
        qtxt = 'Δ = ' + ((rr - ss)*(rr - ss)) + ' > 0, racines ' + sg(Math.min(rr, ss)) + ' et ' + sg(Math.max(rr, ss));
      } else {
        var rd = R.int(-4, 4);
        quad = [1, -2*rd, rd*rd];
        rac.push(rd);
        qtxt = 'Δ = 0, racine double ' + sg(rd);
      }
      var dist = [];
      for (var i = 0; i < rac.length; i++) if (dist.indexOf(rac[i]) < 0) dist.push(rac[i]);
      var nbr = dist.length;
      return {
        q: 'P(x) = ' + fx(an) + '(' + poly(quad) + ').\nCombien l\'équation P(x) = 0 a-t-elle de solutions réelles distinctes ?',
        a: String(nbr), accept: null, choix: ['0', '1', '2', '3'],
        expl: 'P(x) = 0 ⇔ x = ' + sg(an) + ' ou ' + poly(quad) + ' = 0. Pour le trinôme : ' + qtxt + '. Solutions distinctes : ' + tri(dist).map(sg).join(' ; ') + ', soit ' + nbr + '.' + (nbr < rac.length ? ' Attention, une racine du trinôme coïncide avec ' + sg(an) + ' : on ne la compte qu\'une fois.' : '')
      };
    }
    if (t3 === 'ineq3'){
      var pool = R.shuffle([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]).slice(0, 3);
      var rt = tri(pool), p = rt[0], q = rt[1], r = rt[2];
      var op3 = R.pick(['>', '≥', '<', '≤']), cl = op3 === '≥' || op3 === '≤';
      var Pos = itv(p, q, cl, cl) + ' ∪ ' + itv(r, null, cl, false);
      var Neg = itv(null, p, false, cl) + ' ∪ ' + itv(q, r, cl, cl);
      var forme = R.int(0, 1) === 0
        ? fx(p) + fx(q) + fx(r)
        : fx(p) + '(' + poly([1, -(q + r), q*r]) + ')';
      var pos = op3 === '>' || op3 === '≥';
      var bon3 = pos ? Pos : Neg;
      var ch3 = pos
        ? [Pos, Neg, itv(r, null, cl, false), itv(p, r, cl, cl)]
        : [Neg, Pos, itv(null, p, false, cl), itv(q, r, cl, cl)];
      return {
        q: 'P(x) = ' + forme + '.\nRésous P(x) ' + op3 + ' 0.',
        a: bon3, accept: null, choix: ch3,
        expl: 'Les racines sont ' + sg(p) + ', ' + sg(q) + ' et ' + sg(r) + (forme.indexOf('x²') > 0 ? ' (le trinôme se factorise en ' + fx(q) + fx(r) + ')' : '') + '. Tableau de signes : P est négatif sur ]−∞ ; ' + sg(p) + '[, positif sur ]' + sg(p) + ' ; ' + sg(q) + '[, négatif sur ]' + sg(q) + ' ; ' + sg(r) + '[, positif sur ]' + sg(r) + ' ; +∞[ (contrôle : pour x très grand, P(x) > 0). Donc P(x) ' + op3 + ' 0 sur ' + bon3 + '.'
      };
    }
    // résolution complète
    var ar = R.pick([-2, -1, 1, 2]);
    var m1 = R.int(-5, 5), m2 = R.int(-5, 6);
    if (m2 === m1) m2 = m1 + 1;
    var coR = dev(ar, -(m1 + m2), m1*m2);
    var all = [];
    [ar, m1, m2].forEach(function(z){ if (all.indexOf(z) < 0) all.push(z); });
    all = tri(all);
    var dem = R.pick(['grande', 'petite']);
    var repR = dem === 'grande' ? all[all.length - 1] : all[0];
    return {
      q: 'P(x) = ' + poly(coR) + '. ' + sg(ar) + ' est une racine évidente de P.\nRésous P(x) = 0 et donne la ' + (dem === 'grande' ? 'plus grande' : 'plus petite') + ' solution.',
      a: sg(repR), accept: null, choix: null,
      expl: 'P(x) = ' + fx(ar) + '(' + poly([1, -(m1 + m2), m1*m2]) + ') par identification. Le trinôme a pour Δ = ' + ((m1 - m2)*(m1 - m2)) + ', racines ' + sg(Math.min(m1, m2)) + ' et ' + sg(Math.max(m1, m2)) + '. Solutions : ' + all.map(sg).join(' ; ') + '. La ' + (dem === 'grande' ? 'plus grande' : 'plus petite') + ' est ' + sg(repR) + '.'
    };
  }
});

// =====================================================
// ect-04 — Suites arithmético-géométriques
// =====================================================
SKILLS.push({
  id: 'p6-ect-04-suites-arith-geo',
  phase: 6,
  ordre: 4,
  titre: 'Suites arithmético-géométriques',
  objectif: "Pour u(n+1) = a·u(n) + b, trouver le point fixe ℓ, montrer que u(n) − ℓ est géométrique, en déduire u(n) et modéliser épargne, emprunt, stock ou population.",
  lecon: `<p class="lede">Au lycée, tu as vu les suites où l'on <em>ajoute</em> (arithmétiques) et celles où l'on <em>multiplie</em> (géométriques). Dans la vraie vie économique, on fait souvent <mark>les deux à la fois</mark> : un capital rapporte 3 % <b>puis</b> on verse 100 € ; un service perd 20 % de ses abonnés <b>puis</b> en gagne 300. C'est une suite arithmético-géométrique.</p>
<div class="formule"><p>u(n+1) = a·u(n) + b &nbsp;&nbsp;(a ≠ 1 ; si a = 1, la suite est arithmétique ; si b = 0, elle est géométrique)</p></div>
<p><strong>La méthode en 4 temps</strong> (c'est elle qu'on attend en prépa, plus que la formule finale) :</p>
<ul>
<li><b>Point fixe</b> : on cherche le réel ℓ tel que ℓ = aℓ + b, soit ℓ = b/(1 − a).</li>
<li><b>Suite auxiliaire</b> : on pose v(n) = u(n) − ℓ. Alors v(n+1) = u(n+1) − ℓ = (a·u(n) + b) − (aℓ + b) = a(u(n) − ℓ) = a·v(n). La suite v est géométrique de raison a.</li>
<li><b>Terme général de v</b> : v(n) = v(0)·aⁿ avec v(0) = u(0) − ℓ.</li>
<li><b>Retour à u</b> : u(n) = v(n) + ℓ.</li>
</ul>
<div class="formule"><p>ℓ = b/(1 − a) &nbsp;•&nbsp; u(n) = (u(0) − ℓ)·aⁿ + ℓ</p></div>
<p>Exemple détaillé : une plateforme a 1 000 abonnés. Chaque mois, 20 % résilient et 300 nouveaux s'inscrivent. On note u(n) le nombre d'abonnés après n mois.</p>
<div class="etapes">
<p>1. <strong>Modélisation :</strong> garder 80 %, c'est multiplier par 0,8, puis on ajoute 300 : u(n+1) = 0,8u(n) + 300, u(0) = 1 000.</p>
<p>2. <strong>Point fixe :</strong> ℓ = 0,8ℓ + 300 ⇔ 0,2ℓ = 300 ⇔ ℓ = 1 500.</p>
<p>3. <strong>Suite auxiliaire :</strong> v(n) = u(n) − 1 500 vérifie v(n+1) = 0,8u(n) + 300 − 1 500 = 0,8u(n) − 1 200 = 0,8(u(n) − 1 500) = 0,8v(n). Géométrique de raison 0,8, avec v(0) = 1 000 − 1 500 = −500.</p>
<p>4. <strong>Terme général :</strong> v(n) = −500 × 0,8ⁿ, donc <mark>u(n) = 1 500 − 500 × 0,8ⁿ</mark>.</p>
<p>5. <strong>Contrôle :</strong> u(1) = 0,8 × 1 000 + 300 = 1 100 et 1 500 − 500 × 0,8 = 1 100 ✓ ; u(2) = 0,8 × 1 100 + 300 = 1 180 et 1 500 − 500 × 0,64 = 1 180 ✓.</p>
</div>
<p><strong>Applications typiques :</strong> épargne (taux t et versement V : u(n+1) = (1 + t)u(n) + V), emprunt à annuités constantes (taux t, remboursement R : u(n+1) = (1 + t)u(n) − R), stock (pertes de p % puis livraison), population (départs en % puis arrivées fixes).</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Pour u(n+1) = a·u(n) + b : ℓ = b/(1 − a), v(n) = u(n) − ℓ est géométrique de raison a, et u(n) = (u(0) − ℓ)·aⁿ + ℓ.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>u(n) n'est <b>pas</b> u(0)·aⁿ + ℓ : c'est v(0) = u(0) − ℓ qu'on multiplie par aⁿ. Et la raison de v est a, pas b ni 1 − a.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie toujours ta formule finale sur n = 0 (elle doit redonner u(0)) puis sur n = 1 (comparer avec la relation de récurrence). Deux secondes, et tu évites une erreur de signe.</p></div>
<div class="box astuce"><p class="box-t">Et si ℓ est négatif ?</p><p>Pour une épargne qui grossit (a &gt; 1) avec des versements, ℓ = b/(1 − a) est négatif : par exemple −25 000 pour 2 % et 500 € par an. Ce n'est pas une somme réelle, juste l'outil de calcul : u(n) − ℓ = u(n) + 25 000 est géométrique de raison 1,02, et u(n) = (u(0) + 25 000) × 1,02ⁿ − 25 000. Ici la suite ne se stabilise pas, elle s'éloigne de ℓ.</p></div>
<p><strong>En prépa ECT :</strong> c'est LE modèle des emprunts à annuités constantes, de l'épargne programmée et des dynamiques de population ou de stock. Au second semestre, tu étudieras aussi son comportement à long terme.</p>`,
  gen(level, R){
    // a sous forme (num, den) pour garder des calculs exacts
    var CONTR = [[1, 2], [4, 5], [9, 10], [3, 5], [3, 4], [7, 10], [2, 5]];
    function rec(a, b){ return 'u(n+1) = ' + (a === -1 ? '−' : nb(a)) + 'u(n)' + plus(b); }
    function tirageLB(){
      // ℓ entier, b entier : on choisit ℓ = den·m, b = m·(den − num)
      var fr = R.pick(CONTR.concat([[3, 2], [2, 1], [3, 1]]));
      var num = fr[0], den = fr[1], m = R.int(2, 40)*(R.int(0, 3) === 0 ? -1 : 1);
      return {a: num/den, num: num, den: den, l: den*m, b: m*(den - num)};
    }
    function termeG(c, a, l, expo){
      var p = puis(a, expo || 'ⁿ');
      return 'u(n) = ' + (c === 1 ? '' : (c === -1 ? '−' : mil(c) + ' × ')) + p + (l === 0 ? '' : plus(l));
    }

    if (level === 1){
      var t = R.pick(['calc', 'pfixe', 'raison', 'equa']);
      if (t === 'calc'){
        var cas = R.pick(['int', 'int', 'demi']);
        var a, b, u0, n;
        if (cas === 'demi'){ a = 0.5; u0 = 4*R.int(2, 25); b = 2*R.int(-5, 10); n = 2; }
        else { a = R.pick([2, 3, -1, -2]); b = R.int(-9, 9); if (b === 0) b = 4; u0 = R.int(-5, 9); n = R.pick([2, 3]); if (a === 3 || a === -2) n = 2; }
        var u = u0, det = [];
        for (var i = 0; i < n; i++){ var nv = a*u + b; det.push('u(' + (i + 1) + ') = ' + (a === -1 ? '−' : nb(a) + ' × ') + par(u) + plus(b) + ' = ' + nb(nv)); u = nv; }
        return {
          q: 'u(0) = ' + sg(u0) + ' et, pour tout n, ' + rec(a, b) + '.\nCalcule u(' + n + ').',
          a: nb(u), accept: null, choix: null,
          expl: 'On applique la relation de proche en proche : ' + det.join(' ; ') + '.'
        };
      }
      var s = tirageLB();
      if (t === 'pfixe') return {
        q: 'On considère la suite définie par ' + rec(s.a, s.b) + '.\nCalcule son point fixe ℓ (le réel tel que ℓ = ' + nb(s.a) + 'ℓ' + plus(s.b) + ').',
        a: nb(s.l), accept: null, choix: null,
        expl: 'ℓ = ' + nb(s.a) + 'ℓ' + plus(s.b) + ' ⇔ ' + nb(1 - s.a) + 'ℓ = ' + sg(s.b) + ' ⇔ ℓ = ' + sg(s.b) + ' ÷ ' + par(1 - s.a) + ' = ' + mil(s.l) + '. (Formule : ℓ = b/(1 − a).)'
      };
      if (t === 'raison'){
        var bonR = nb(s.a);
        return {
          q: 'Soit ' + rec(s.a, s.b) + ', de point fixe ℓ = ' + mil(s.l) + '. On pose v(n) = u(n) − ℓ.\nLa suite v est géométrique de raison :',
          a: bonR, accept: null,
          choix: qcm(bonR, [nb(s.b), nb(1 - s.a), mil(s.l), nb(s.a + s.b), nb(-s.a)]),
          expl: 'v(n+1) = u(n+1) − ℓ = ' + nb(s.a) + 'u(n)' + plus(s.b) + ' − (' + nb(s.a) + 'ℓ' + plus(s.b) + ') = ' + nb(s.a) + '(u(n) − ℓ) = ' + nb(s.a) + 'v(n). La raison est a = ' + bonR + '.'
        };
      }
      var bonE = 'ℓ = ' + nb(s.a) + 'ℓ' + plus(s.b);
      return {
        q: 'Pour la suite ' + rec(s.a, s.b) + ', le point fixe ℓ est la solution de l\'équation :',
        a: bonE, accept: null,
        choix: qcm(bonE, ['ℓ = ' + nb(s.a) + plus(s.b), 'ℓ = ' + nb(s.a) + 'ℓ' + plus(-s.b), nb(s.a) + 'ℓ = ' + sg(s.b), 'ℓ = ' + sg(s.b) + 'ℓ' + plus(s.a)]),
        expl: 'Le point fixe est le nombre qui ne bouge pas quand on applique la relation : on remplace u(n) et u(n+1) par ℓ, ce qui donne ' + bonE + ', puis ℓ = ' + mil(s.l) + '.'
      };
    }

    if (level === 2){
      var t2 = R.pick(['terme', 'formule', 'modele', 'pfixeCtx']);
      if (t2 === 'terme'){
        var cas2 = R.pick(['2', '3', 'demi', 'moins1']);
        var a2, l2, v0, n2;
        if (cas2 === '2'){ a2 = 2; l2 = R.int(-9, 9); v0 = R.pick([-3, -2, -1, 1, 2, 3]); n2 = R.int(4, 8); }
        else if (cas2 === '3'){ a2 = 3; l2 = R.int(-9, 9); v0 = R.pick([-2, -1, 1, 2]); n2 = R.int(3, 5); }
        else if (cas2 === 'demi'){ a2 = 0.5; l2 = 2*R.int(-10, 20); n2 = R.int(3, 5); v0 = R.pick([-3, -1, 1, 3, 5])*Math.pow(2, n2); }
        else { a2 = -1; l2 = R.int(-9, 9); v0 = R.pick([-4, -3, -2, 2, 3, 5]); n2 = R.int(5, 12); }
        if (l2 === 0) l2 = 4;
        var cf = v0 === 1 ? '' : (v0 === -1 ? '−' : mil(v0) + ' × ');
        var b2 = l2*(1 - a2), u02 = v0 + l2, val = v0*Math.pow(a2, n2) + l2;
        return {
          q: 'u(0) = ' + sg(u02) + ' et ' + rec(a2, b2) + '.\nCalcule u(' + n2 + ') en passant par le point fixe.',
          a: nb(val), accept: null, choix: null,
          expl: 'ℓ = ' + nb(b2) + ' ÷ (1 − ' + par(a2) + ') = ' + sg(l2) + '. v(0) = u(0) − ℓ = ' + sg(u02) + ' − ' + par(l2) + ' = ' + mil(v0) + '. Donc u(n) = ' + cf + puis(a2, 'ⁿ') + plus(l2) + ' et u(' + n2 + ') = ' + mil(v0) + ' × ' + par(Math.pow(a2, n2)) + plus(l2) + ' = ' + nb(val) + '.'
        };
      }
      if (t2 === 'formule'){
        var s2 = tirageLB();
        var c0 = R.pick([-3, -2, -1, 1, 2, 3, 4, 5])*Math.abs(s2.den)*R.int(1, 5);
        var uu0 = c0 + s2.l;
        if (uu0 === 0){ c0 = c0 + s2.den; uu0 = c0 + s2.l; }
        var bonF = termeG(c0, s2.a, s2.l);
        return {
          q: 'u(0) = ' + mil(uu0) + ' et ' + rec(s2.a, s2.b) + ' (point fixe ℓ = ' + mil(s2.l) + ').\nQuelle est l\'expression de u(n) ?',
          a: bonF, accept: null,
          choix: qcm(bonF, [termeG(uu0, s2.a, s2.l), termeG(c0, s2.a, -s2.l), termeG(uu0 + s2.l, s2.a, -s2.l), termeG(c0, s2.a, s2.l, 'ⁿ⁺¹'), termeG(uu0, s2.a, s2.b)]),
          expl: 'v(n) = u(n) − ℓ est géométrique de raison ' + nb(s2.a) + ' et v(0) = ' + mil(uu0) + ' − ' + par(s2.l) + ' = ' + mil(c0) + '. Donc v(n) = ' + mil(c0) + ' × ' + puis(s2.a, 'ⁿ') + ' et ' + bonF + '. Contrôle en n = 0 : ' + mil(c0) + plus(s2.l) + ' = ' + mil(uu0) + ' ✓.'
        };
      }
      if (t2 === 'modele'){
        var ctx = R.pick(['epargne', 'emprunt', 'abonnes', 'stock']);
        var tx, V, coef, bon, f1, f2, f3, intro;
        if (ctx === 'epargne' || ctx === 'emprunt'){
          tx = R.pick([1, 2, 3, 4, 5]);
          V = ctx === 'epargne' ? R.pick([50, 100, 150, 200, 500]) : R.pick([1200, 2400, 3000, 6000]);
          var cm = 1 + tx/100, sV = ctx === 'epargne' ? V : -V;
          bon = rec(cm, sV); f1 = rec(tx/100, sV); f2 = rec(cm, -sV); f3 = rec(1 - tx/100, sV);
          intro = ctx === 'epargne'
            ? 'Un capital est placé au taux de ' + tx + ' % par an. À la fin de chaque année, après le versement des intérêts, on ajoute ' + V + ' €. On note u(n) le capital après n années.'
            : 'Une entreprise emprunte au taux annuel de ' + tx + ' %. Chaque année, après le calcul des intérêts, elle rembourse ' + mil(V) + ' €. On note u(n) le capital restant dû après n années.';
          return {
            q: intro + '\nQuelle relation vérifie la suite u ?',
            a: bon, accept: null, choix: [bon, f1, f2, f3],
            expl: 'Augmenter de ' + tx + ' %, c\'est multiplier par ' + nb(cm) + ' ; puis on ' + (ctx === 'epargne' ? 'ajoute ' + V : 'retire ' + mil(V)) + ' €. Donc ' + bon + '. (Multiplier par ' + nb(tx/100) + ' ne donnerait que les intérêts.)'
          };
        }
        var pp = R.pick([5, 10, 15, 20, 25, 30]), A = R.pick([40, 50, 80, 100, 120, 200, 300]);
        coef = 1 - pp/100;
        bon = rec(coef, A); f1 = rec(pp/100, A); f2 = rec(1 + pp/100, A); f3 = rec(coef, -A);
        intro = ctx === 'abonnes'
          ? 'Chaque mois, ' + pp + ' % des abonnés d\'un club résilient, puis ' + A + ' nouveaux abonnés s\'inscrivent. On note u(n) le nombre d\'abonnés après n mois.'
          : 'Chaque semaine, ' + pp + ' % du stock d\'un entrepôt est vendu, puis on reçoit une livraison de ' + A + ' unités. On note u(n) le stock après n semaines.';
        return {
          q: intro + '\nQuelle relation vérifie la suite u ?',
          a: bon, accept: null, choix: [bon, f1, f2, f3],
          expl: 'Perdre ' + pp + ' %, c\'est garder ' + (100 - pp) + ' %, donc multiplier par ' + nb(coef) + ' ; puis on ajoute ' + A + '. Donc ' + bon + '. (Multiplier par ' + nb(pp/100) + ' donnerait seulement la partie perdue.)'
        };
      }
      var pp2 = R.pick([4, 5, 10, 20, 25, 50]), A2 = R.int(2, 30)*10;
      var l3 = 100*A2/pp2;
      var ctx2 = R.pick(['abonnés d\'un club', 'habitants d\'un village', 'clients fidèles d\'une enseigne']);
      return {
        q: 'Chaque année, ' + pp2 + ' % des ' + ctx2 + ' partent, puis ' + A2 + ' nouveaux arrivent : u(n+1) = ' + nb(1 - pp2/100) + 'u(n) + ' + A2 + '.\nQuel est le point fixe ℓ, c\'est-à-dire l\'effectif qui resterait exactement stable ?',
        a: nb(l3), accept: null, choix: null,
        expl: 'ℓ = ' + nb(1 - pp2/100) + 'ℓ + ' + A2 + ' ⇔ ' + nb(pp2/100) + 'ℓ = ' + A2 + ' ⇔ ℓ = ' + A2 + ' ÷ ' + nb(pp2/100) + ' = ' + mil(l3) + '. Interprétation : à cet effectif, les départs (' + pp2 + ' % de ' + mil(l3) + ' = ' + A2 + ') compensent exactement les arrivées.'
      };
    }

    // ----- level 3 -----
    var t3 = R.pick(['arrondi', 'constante', 'vnplus1', 'retrouveb', 'v0ctx']);
    if (t3 === 'arrondi' || t3 === 'v0ctx'){
      var ctx3 = R.pick(['abonnes', 'epargne', 'emprunt']);
      var a3, b3, u03, l3b, unite, lib;
      if (ctx3 === 'abonnes'){
        var p3 = R.pick([10, 20, 25, 40, 50]); a3 = 1 - p3/100; b3 = R.int(3, 30)*10; l3b = b3/(p3/100);
        u03 = Math.round(l3b*R.pick([0.2, 0.4, 0.5, 1.5, 2]));
        unite = ' abonnés'; lib = 'Un club a ' + mil(u03) + ' abonnés. Chaque mois, ' + p3 + ' % résilient puis ' + b3 + ' nouveaux s\'inscrivent : u(n+1) = ' + nb(a3) + 'u(n) + ' + b3 + ', u(0) = ' + mil(u03) + '.';
      } else if (ctx3 === 'epargne'){
        var t5 = R.pick([2, 4, 5, 10]); a3 = 1 + t5/100; b3 = R.pick([100, 200, 400, 500, 1000]); l3b = -b3/(t5/100);
        u03 = R.pick([1000, 2000, 5000, 10000]);
        unite = ' €'; lib = 'On place ' + mil(u03) + ' € à ' + t5 + ' % par an et on ajoute ' + b3 + ' € à la fin de chaque année : u(n+1) = ' + nb(a3) + 'u(n) + ' + b3 + ', u(0) = ' + mil(u03) + '.';
      } else {
        var t6 = R.pick([2, 4, 5, 10]); a3 = 1 + t6/100; var Rb = R.pick([2000, 4000, 5000, 8000]); b3 = -Rb; l3b = Rb/(t6/100);
        u03 = Math.round(l3b*R.pick([0.5, 0.6, 0.7, 0.8]));
        unite = ' €'; lib = 'Une entreprise emprunte ' + mil(u03) + ' € à ' + t6 + ' % par an et rembourse ' + mil(Rb) + ' € à la fin de chaque année : u(n+1) = ' + nb(a3) + 'u(n) − ' + mil(Rb) + ', u(0) = ' + mil(u03) + ' (capital restant dû).';
      }
      var v03 = u03 - l3b;
      if (t3 === 'v0ctx'){
        return {
          q: lib + '\nOn pose v(n) = u(n) − ℓ, où ℓ est le point fixe. Calcule v(0).',
          a: nb(v03), accept: null, choix: null,
          expl: 'ℓ = ' + sg(b3) + ' ÷ (1 − ' + nb(a3) + ') = ' + sg(b3) + ' ÷ ' + par(1 - a3) + ' = ' + mil(l3b) + '. Donc v(0) = u(0) − ℓ = ' + mil(u03) + ' − ' + par(l3b) + ' = ' + mil(v03) + ', et u(n) = ' + mil(v03) + ' × ' + nb(a3) + 'ⁿ' + plus(l3b) + '.'
        };
      }
      var cands = R.shuffle([2, 3, 4, 5, 6]), nn = -1, valR = 0;
      for (var j = 0; j < cands.length; j++){
        var vv = v03*Math.pow(a3, cands[j]) + l3b, fr = vv - Math.floor(vv);
        if (nn < 0 && Math.abs(fr - 0.5) > 0.02){ nn = cands[j]; valR = vv; }
      }
      if (nn < 0){ nn = 1; valR = a3*u03 + b3; }
      var arr = Math.round(valR);
      return {
        q: lib + '\nÀ l\'aide du point fixe, calcule u(' + nn + ') arrondi à l\'unité.',
        a: String(arr), accept: null, choix: null,
        expl: 'ℓ = ' + sg(b3) + ' ÷ ' + par(1 - a3) + ' = ' + mil(l3b) + ' et v(0) = ' + mil(u03) + ' − ' + par(l3b) + ' = ' + mil(v03) + '. Donc u(n) = ' + mil(v03) + ' × ' + nb(a3) + 'ⁿ' + plus(l3b) + ' et u(' + nn + ') = ' + mil(v03) + ' × ' + nb(a3) + ex(nn) + plus(l3b) + ' ≈ ' + mil(Math.round(valR*100)/100) + ', soit environ ' + mil(arr) + unite + '.'
      };
    }
    if (t3 === 'constante'){
      var fr2 = R.pick(CONTR), aC = fr2[0]/fr2[1], uC = fr2[1]*R.int(5, 60)*10;
      var bC = uC*(1 - aC);
      return {
        q: 'Un stock de ' + mil(uC) + ' unités évolue selon u(n+1) = ' + nb(aC) + 'u(n) + b, où b est la livraison hebdomadaire.\nQuelle valeur de b rend la suite constante (stock toujours égal à ' + mil(uC) + ') ?',
        a: nb(bC), accept: null, choix: null,
        expl: 'La suite est constante si u(0) est le point fixe : ' + mil(uC) + ' = ' + nb(aC) + ' × ' + mil(uC) + ' + b, donc b = ' + mil(uC) + ' × (1 − ' + nb(aC) + ') = ' + mil(uC) + ' × ' + nb(1 - aC) + ' = ' + mil(bC) + '.'
      };
    }
    if (t3 === 'vnplus1'){
      var s3 = tirageLB();
      var bonV = 'v(n+1) = ' + nb(s3.a) + 'v(n)';
      return {
        q: 'Soit ' + rec(s3.a, s3.b) + ' et v(n) = u(n)' + plus(-s3.l) + '.\nEn simplifiant, on obtient :',
        a: bonV, accept: null,
        choix: qcm(bonV, ['v(n+1) = ' + nb(s3.a) + 'v(n)' + plus(s3.b), 'v(n+1) = v(n)' + plus(s3.b), 'v(n+1) = ' + nb(1 - s3.a) + 'v(n)', 'v(n+1) = ' + nb(s3.a) + 'v(n)' + plus(-s3.l)]),
        expl: 'v(n+1) = u(n+1)' + plus(-s3.l) + ' = ' + nb(s3.a) + 'u(n)' + plus(s3.b) + plus(-s3.l) + ' = ' + nb(s3.a) + 'u(n)' + plus(s3.b - s3.l) + ' = ' + nb(s3.a) + '(u(n)' + plus(-s3.l) + ') = ' + nb(s3.a) + 'v(n). (On a bien ' + nb(s3.a) + ' × ' + par(-s3.l) + ' = ' + mil(s3.b - s3.l) + '.)'
      };
    }
    var s4 = tirageLB();
    return {
      q: 'Une suite vérifie u(n+1) = ' + nb(s4.a) + 'u(n) + b et son point fixe vaut ℓ = ' + mil(s4.l) + '.\nCalcule b.',
      a: nb(s4.b), accept: null, choix: null,
      expl: 'ℓ = aℓ + b donne b = ℓ(1 − a) = ' + mil(s4.l) + ' × (1 − ' + nb(s4.a) + ') = ' + mil(s4.l) + ' × ' + par(1 - s4.a) + ' = ' + mil(s4.b) + '.'
    };
  }
});

// =====================================================
// ect-05 — Sommes et notation Σ
// =====================================================
SKILLS.push({
  id: 'p6-ect-05-sommes',
  phase: 6,
  ordre: 5,
  titre: 'Sommes et notation Σ',
  objectif: "Lire et manipuler la notation Σ, compter les termes, utiliser les sommes 1 + 2 + … + n et 1 + q + … + qⁿ, la linéarité et le changement d'indice.",
  lecon: `<p class="lede">En prépa, les sommes s'écrivent de façon compacte avec le symbole Σ (sigma majuscule). Ce n'est qu'une notation : derrière, il y a les sommes de suites que tu connais déjà. Il s'agit d'apprendre à <mark>la lire, la découper et la calculer</mark>.</p>
<p><strong>Lecture.</strong> Σ<sub>k=1</sub><sup>n</sup> u(k) = u(1) + u(2) + … + u(n). La lettre k (l'indice) est <em>muette</em> : on peut la remplacer par j ou i sans rien changer. Exemple : Σ<sub>k=1</sub><sup>4</sup> (2k + 1) = 3 + 5 + 7 + 9 = 24.</p>
<p><strong>Nombre de termes.</strong> De k = p à k = n, il y a <mark>n − p + 1</mark> termes (de 1 à 10 : 10 termes ; de 0 à 10 : 11 termes ; de 3 à 10 : 8 termes).</p>
<div class="formule"><p>Σ<sub>k=1</sub><sup>n</sup> k = 1 + 2 + … + n = n(n + 1)/2<br>Σ<sub>k=0</sub><sup>n</sup> q<sup>k</sup> = 1 + q + … + qⁿ = (1 − q<sup>n+1</sup>)/(1 − q) &nbsp;(q ≠ 1)</p></div>
<p><strong>Suites usuelles.</strong> Somme de termes consécutifs d'une suite arithmétique = nombre de termes × (premier + dernier)/2. Somme de termes consécutifs d'une suite géométrique de raison q ≠ 1 = premier × (1 − q<sup>nombre de termes</sup>)/(1 − q).</p>
<p><strong>Linéarité.</strong> Σ (a·u(k) + v(k)) = a·Σ u(k) + Σ v(k) : on peut couper une somme en morceaux et sortir les constantes. Attention : Σ<sub>k=1</sub><sup>n</sup> c = n × c (on ajoute n fois la constante c).</p>
<p>Exemple détaillé : calculons S = Σ<sub>k=1</sub><sup>20</sup> (3k + 2).</p>
<div class="etapes">
<p>1. Linéarité : S = 3 × Σ<sub>k=1</sub><sup>20</sup> k + Σ<sub>k=1</sub><sup>20</sup> 2.</p>
<p>2. Σ<sub>k=1</sub><sup>20</sup> k = 20 × 21/2 = 210.</p>
<p>3. Σ<sub>k=1</sub><sup>20</sup> 2 = 20 × 2 = 40 (20 termes égaux à 2).</p>
<p>4. S = 3 × 210 + 40 = <mark>670</mark>. Contrôle par la formule arithmétique : 20 termes, premier 5, dernier 62, donc 20 × (5 + 62)/2 = 670 ✓.</p>
</div>
<p><strong>Changement d'indice.</strong> En posant j = k − 1, Σ<sub>k=1</sub><sup>n</sup> u(k − 1) = Σ<sub>j=0</sub><sup>n−1</sup> u(j) : les bornes bougent avec l'indice (k = 1 donne j = 0, k = n donne j = n − 1), le nombre de termes ne change pas.</p>
<div class="box retenir"><p class="box-t">À retenir</p><p>Nombre de termes de p à n : n − p + 1. Σ<sub>k=1</sub><sup>n</sup> k = n(n + 1)/2. Σ<sub>k=0</sub><sup>n</sup> q<sup>k</sup> = (1 − q<sup>n+1</sup>)/(1 − q) pour q ≠ 1. On peut sortir les constantes et couper les sommes.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Σ<sub>k=0</sub><sup>n</sup> q<sup>k</sup> a n + 1 termes : l'exposant du haut est n + 1, pas n. Et Σ<sub>k=1</sub><sup>n</sup> 5 vaut 5n, pas 5.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>En cas de doute sur une formule, écris les deux ou trois premiers termes et teste avec n = 1 ou n = 2 : par exemple Σ<sub>k=0</sub><sup>1</sup> 2<sup>k</sup> = 1 + 2 = 3 et (1 − 2²)/(1 − 2) = 3 ✓.</p></div>
<p><strong>En prépa ECT :</strong> la notation Σ est partout — total de versements d'un plan d'épargne, coût total d'un emprunt, espérance d'une variable aléatoire E(X) = Σ x<sub>i</sub>·P(X = x<sub>i</sub>) — et tu devras transformer ces sommes avec aisance.</p>`,
  gen(level, R){
    function sig(expr, k, p, n){ return 'Σ ' + expr + ', pour ' + k + ' allant de ' + p + ' à ' + n; }
    function lin(al, be){ return poly([al, be]).replace(/x/g, 'k'); }

    if (level === 1){
      var t = R.pick(['nbtermes', 'gauss', 'direct', 'const']);
      if (t === 'nbtermes'){
        var p = R.int(0, 6), n = R.int(12, 60);
        var f = R.pick(['sig', 'list']);
        return {
          q: f === 'sig' ? 'Combien de termes compte la somme ' + sig('u(k)', 'k', p, n) + ' ?' : 'Combien de termes compte la somme u(' + p + ') + u(' + (p + 1) + ') + … + u(' + n + ') ?',
          a: String(n - p + 1), accept: null, choix: null,
          expl: 'De ' + p + ' à ' + n + ', il y a ' + n + ' − ' + p + ' + 1 = ' + (n - p + 1) + ' termes. (Le « + 1 » compte le terme de départ : de 1 à 3, il y a bien 3 termes.)'
        };
      }
      if (t === 'gauss'){
        var n2 = R.pick([10, 12, 15, 20, 24, 25, 30, 40, 50, 60, 99, 100]);
        return {
          q: R.int(0, 1) ? 'Calcule 1 + 2 + 3 + … + ' + n2 + '.' : 'Calcule ' + sig('k', 'k', 1, n2) + '.',
          a: String(n2*(n2 + 1)/2), accept: null, choix: null,
          expl: 'Σ k (k de 1 à n) = n(n + 1)/2 = ' + n2 + ' × ' + (n2 + 1) + '/2 = ' + mil(n2*(n2 + 1)/2) + '.'
        };
      }
      if (t === 'direct'){
        var w = R.pick(['aff', 'carre', 'puiss']);
        if (w === 'aff'){
          var al = R.pick([2, 3, 4, 5, -2]), be = R.int(-5, 6), m = R.int(3, 5), S = 0, L = [];
          if (be === 0) be = 1;
          for (var k = 1; k <= m; k++){ S += al*k + be; L.push(sg(al*k + be)); }
          return {
            q: 'Calcule ' + sig('(' + lin(al, be) + ')', 'k', 1, m) + '.',
            a: sg(S), accept: null, choix: null,
            expl: 'On écrit les termes (k = 1, …, ' + m + ') : ' + L.join(' + ').replace(/\+ −/g, '− ') + ' = ' + sg(S) + '.'
          };
        }
        if (w === 'carre'){
          var m2 = R.int(3, 5), p2 = R.int(0, 2), S2 = 0, L2 = [];
          for (var k2 = p2; k2 <= m2; k2++){ S2 += k2*k2; L2.push(k2*k2); }
          return {
            q: 'Calcule ' + sig('k²', 'k', p2, m2) + '.',
            a: String(S2), accept: null, choix: null,
            expl: 'On écrit les termes : ' + L2.join(' + ') + ' = ' + S2 + '.'
          };
        }
        var qb = R.pick([2, 3]), m3 = qb === 2 ? R.int(3, 5) : R.int(2, 4), S3 = 0, L3 = [];
        for (var k3 = 0; k3 <= m3; k3++){ S3 += Math.pow(qb, k3); L3.push(Math.pow(qb, k3)); }
        return {
          q: 'Calcule ' + sig(qb + 'ᵏ', 'k', 0, m3) + '.',
          a: String(S3), accept: null, choix: null,
          expl: 'On écrit les termes : ' + L3.join(' + ') + ' = ' + S3 + '. (Formule : (1 − ' + qb + ex(m3 + 1) + ')/(1 − ' + qb + ') = ' + S3 + '.)'
        };
      }
      var c = R.int(2, 9), n4 = R.int(5, 30), p4 = R.pick([0, 1, 1]);
      var nbt = n4 - p4 + 1;
      return {
        q: 'Calcule ' + sig(String(c), 'k', p4, n4) + '.',
        a: String(c*nbt), accept: null, choix: null,
        expl: 'Il y a ' + n4 + ' − ' + p4 + ' + 1 = ' + nbt + ' termes, tous égaux à ' + c + ' : la somme vaut ' + nbt + ' × ' + c + ' = ' + (c*nbt) + ' (et non ' + c + ').'
      };
    }

    if (level === 2){
      var t2 = R.pick(['geo', 'linear', 'arithCtx', 'formule', 'geoCtx']);
      if (t2 === 'geo'){
        var q = R.pick([2, 2, 3]), n = q === 2 ? R.int(4, 10) : R.int(3, 7);
        var S = (Math.pow(q, n + 1) - 1)/(q - 1);
        return {
          q: 'Calcule ' + sig(q + 'ᵏ', 'k', 0, n) + '.',
          a: String(S), accept: null, choix: null,
          expl: 'Σ qᵏ (k de 0 à n) = (1 − qⁿ⁺¹)/(1 − q). Ici : (1 − ' + q + ex(n + 1) + ')/(1 − ' + q + ') = (1 − ' + mil(Math.pow(q, n + 1)) + ')/' + par(1 - q) + ' = ' + mil(S) + '. Il y a ' + (n + 1) + ' termes, d\'où l\'exposant ' + (n + 1) + '.'
        };
      }
      if (t2 === 'linear'){
        var al = R.pick([2, 3, 4, 5, -1, -2]), be = R.int(-6, 9), n2 = R.pick([10, 12, 15, 20, 25, 30, 40, 50]);
        if (be === 0) be = 3;
        var Sk = n2*(n2 + 1)/2, S2 = al*Sk + be*n2;
        return {
          q: 'Calcule ' + sig('(' + lin(al, be) + ')', 'k', 1, n2) + '.',
          a: sg(S2), accept: null, choix: null,
          expl: 'Linéarité : ' + (al === -1 ? '−' : sg(al) + ' × ') + 'Σ k' + plus(be) + ' × ' + n2 + ' (il y a ' + n2 + ' termes). Σ k = ' + n2 + ' × ' + (n2 + 1) + '/2 = ' + Sk + '. Donc S = ' + (al === -1 ? '−' : sg(al) + ' × ') + Sk + plus(be*n2) + ' = ' + mil(S2) + '.'
        };
      }
      if (t2 === 'arithCtx'){
        var ctx = R.pick(['prod', 'loyer', 'epargne']);
        var A, r, N, unit, txt;
        if (ctx === 'prod'){ A = R.int(10, 40)*10; r = R.int(1, 6)*5; N = R.pick([6, 10, 12, 20, 24]); unit = ' unités'; txt = 'Une usine produit ' + A + ' unités le 1er mois, puis chaque mois ' + r + ' unités de plus que le mois précédent.\nQuelle est la production totale sur ' + N + ' mois ?'; }
        else if (ctx === 'loyer'){ A = R.int(6, 15)*1000; r = R.int(1, 6)*100; N = R.pick([4, 6, 8, 10, 12]); unit = ' €'; }
        else { A = R.int(2, 10)*10; r = R.int(1, 4)*5; N = R.pick([10, 12, 18, 24]); unit = ' €'; txt = 'Léo épargne ' + A + ' € le 1er mois, puis ' + r + ' € de plus chaque mois.\nCombien a-t-il épargné en tout au bout de ' + N + ' mois ?'; }
        if (ctx === 'loyer') txt = 'Un commerçant loue un local. Le loyer annuel vaut ' + mil(A) + ' € la 1re année, puis augmente de ' + r + ' € chaque année.\nQuel est le total des loyers payés sur ' + N + ' ans ?';
        var der = A + (N - 1)*r, S3 = N*(A + der)/2;
        return {
          q: txt,
          a: String(S3), accept: null, choix: null,
          expl: 'Suite arithmétique de premier terme ' + A + ' et de raison ' + r + '. Le ' + N + 'e terme vaut ' + A + ' + ' + (N - 1) + ' × ' + r + ' = ' + der + '. Somme = nombre de termes × (premier + dernier)/2 = ' + N + ' × (' + A + ' + ' + der + ')/2 = ' + mil(S3) + unit + '.'
        };
      }
      if (t2 === 'formule'){
        var qn = R.pick([2, 3, 5, 0.5]), qs = nb(qn);
        var pw = function(e){ return (qn === 0.5 ? '0,5' : qs) + e; };
        var F = {
          A: '(1 − ' + pw('ⁿ⁺¹') + ')/(1 − ' + qs + ')',
          B: '(1 − ' + pw('ⁿ') + ')/(1 − ' + qs + ')',
          C: qs + '(1 − ' + pw('ⁿ') + ')/(1 − ' + qs + ')',
          D: qs + '(1 − ' + pw('ⁿ⁺¹') + ')/(1 − ' + qs + ')',
          E: '(' + pw('ⁿ⁺¹') + ' − 1)/(1 − ' + qs + ')'
        };
        var cas = R.pick([['0', 'n', 'A', 'n + 1 termes, premier terme 1'], ['1', 'n', 'C', 'n termes, premier terme ' + qs], ['0', 'n − 1', 'B', 'n termes, premier terme 1']]);
        var bonF = F[cas[2]];
        var autres = ['A', 'B', 'C', 'D', 'E'].filter(function(z){ return z !== cas[2]; }).map(function(z){ return F[z]; });
        return {
          q: 'Pour n ≥ 1, à quoi est égale la somme ' + sig(qs + 'ᵏ', 'k', cas[0], cas[1]) + ' ?',
          a: bonF, accept: null, choix: qcm(bonF, R.shuffle(autres)),
          expl: 'Somme géométrique = premier terme × (1 − q puissance « nombre de termes »)/(1 − q). Ici : ' + cas[3] + ', donc ' + bonF + '.'
        };
      }
      var u0 = R.pick([1, 2, 3, 5, 10]), q2 = R.pick([2, 3]), N2 = q2 === 2 ? R.int(5, 9) : R.int(4, 6);
      var S5 = u0*(Math.pow(q2, N2) - 1)/(q2 - 1);
      var ctx2 = R.pick([
        'Une information est partagée par ' + u0 + ' personne' + (u0 > 1 ? 's' : '') + ' le 1er jour, puis chaque jour par ' + (q2 === 2 ? 'deux' : 'trois') + ' fois plus de personnes que la veille.\nCombien de partages au total sur ' + N2 + ' jours ?',
        'Une start-up vend ' + u0 + ' licence' + (u0 > 1 ? 's' : '') + ' le 1er mois, puis ' + (q2 === 2 ? 'deux' : 'trois') + ' fois plus chaque mois.\nCombien de licences a-t-elle vendues au total en ' + N2 + ' mois ?'
      ]);
      return {
        q: ctx2,
        a: String(S5), accept: null, choix: null,
        expl: 'Suite géométrique de premier terme ' + u0 + ' et de raison ' + q2 + ', ' + N2 + ' termes. Somme = ' + u0 + ' × (1 − ' + q2 + ex(N2) + ')/(1 − ' + q2 + ') = ' + u0 + ' × (' + mil(Math.pow(q2, N2)) + ' − 1)/' + (q2 - 1) + ' = ' + mil(S5) + '.'
      };
    }

    // ----- level 3 -----
    var t3 = R.pick(['pan', 'trouven', 'indice', 'geoArrondi', 'mixte']);
    if (t3 === 'pan'){
      var p = R.int(5, 30), n = p + R.int(10, 60);
      var nbt = n - p + 1, S = nbt*(p + n)/2;
      return {
        q: 'Calcule ' + sig('k', 'k', p, n) + ', c\'est-à-dire ' + p + ' + ' + (p + 1) + ' + … + ' + n + '.',
        a: String(S), accept: null, choix: null,
        expl: 'Il y a ' + n + ' − ' + p + ' + 1 = ' + nbt + ' termes ; somme arithmétique = ' + nbt + ' × (' + p + ' + ' + n + ')/2 = ' + mil(S) + '. Autre méthode : Σ de 1 à ' + n + ' moins Σ de 1 à ' + (p - 1) + ' = ' + (n*(n + 1)/2) + ' − ' + ((p - 1)*p/2) + ' = ' + mil(S) + '.'
      };
    }
    if (t3 === 'trouven'){
      var nn = R.int(8, 45), T = nn*(nn + 1)/2;
      if (R.int(0, 2) === 0){
        return {
          q: 'On sait que 1 + 3 + 5 + … + (2n − 1) = ' + (nn*nn) + ' (somme des n premiers entiers impairs). Que vaut n ?',
          a: String(nn), accept: null, choix: null,
          expl: 'Σ (2k − 1) pour k de 1 à n = 2 × n(n + 1)/2 − n = n². Donc n² = ' + (nn*nn) + ' et n = ' + nn + '.'
        };
      }
      return {
        q: 'Pour quel entier n a-t-on 1 + 2 + … + n = ' + T + ' ?',
        a: String(nn), accept: null, choix: null,
        expl: 'n(n + 1)/2 = ' + T + ' ⇔ n² + n − ' + (2*T) + ' = 0. Δ = 1 + ' + (8*T) + ' = ' + (1 + 8*T) + ' = ' + (2*nn + 1) + '², donc n = (−1 + ' + (2*nn + 1) + ')/2 = ' + nn + ' (l\'autre racine est négative).'
      };
    }
    if (t3 === 'indice'){
      var s = R.int(1, 3), p0 = R.int(s, s + 2), forme = R.int(0, 2);
      var fx2 = ['u(k − ' + s + ')', '(k − ' + s + ')²', '2' + ex('k−' + s)][forme];
      var fj = ['u(j)', 'j²', '2ʲ'][forme];
      var hi = function(d){ return d === 0 ? 'n' : (d > 0 ? 'n + ' + d : 'n − ' + (-d)); };
      var bonI = sig(fj, 'j', p0 - s, hi(-s));
      return {
        q: 'On pose j = k − ' + s + ' dans ' + sig(fx2, 'k', p0, 'n') + '. On obtient :',
        a: bonI, accept: null,
        choix: qcm(bonI, [sig(fj, 'j', p0 - s, 'n'), sig(fj, 'j', p0 + s, hi(s)), sig(fj, 'j', p0, hi(-s)), sig(fj, 'j', p0 - s, hi(-s + 1))]),
        expl: 'Quand k = ' + p0 + ', j = ' + p0 + ' − ' + s + ' = ' + (p0 - s) + ' ; quand k = n, j = n − ' + s + '. Les deux bornes reculent de ' + s + ' et le nombre de termes reste ' + (p0 === 1 ? 'n' : 'n − ' + (p0 - 1)) + '. D\'où : ' + bonI + '.'
      };
    }
    if (t3 === 'geoArrondi'){
      var ctx3 = R.pick([
        {q:1.05, t:'5'}, {q:1.1, t:'10'}, {q:1.02, t:'2'}, {q:1.04, t:'4'}, {q:0.9, t:'−10'}, {q:0.95, t:'−5'}
      ]);
      var V = R.pick([1000, 2000, 5000, 1200, 800, 3000]);
      var cands = R.shuffle([5, 6, 8, 10, 12]), N3 = -1, val = 0;
      for (var i = 0; i < cands.length; i++){
        var vv = V*(1 - Math.pow(ctx3.q, cands[i]))/(1 - ctx3.q), fr = vv - Math.floor(vv);
        if (N3 < 0 && Math.abs(fr - 0.5) > 0.02){ N3 = cands[i]; val = vv; }
      }
      if (N3 < 0){ N3 = 2; val = V*(1 + ctx3.q); }
      var hausse = ctx3.q > 1;
      return {
        q: 'Une entreprise vend ' + mil(V) + ' unités la 1re année ; ses ventes ' + (hausse ? 'augmentent' : 'baissent') + ' ensuite de ' + ctx3.t.replace('−', '') + ' % par an.\nQuel est le total des ventes sur ' + N3 + ' ans (arrondi à l\'unité) ?',
        a: String(Math.round(val)), accept: null, choix: null,
        expl: 'Les ventes forment une suite géométrique de premier terme ' + mil(V) + ' et de raison ' + nb(ctx3.q) + '. Total sur ' + N3 + ' ans (' + N3 + ' termes) = ' + mil(V) + ' × (1 − ' + nb(ctx3.q) + ex(N3) + ')/(1 − ' + nb(ctx3.q) + ') ≈ ' + mil(Math.round(val*100)/100) + ', soit environ ' + mil(Math.round(val)) + ' unités.'
      };
    }
    var al = R.pick([1, 2, 3, 5]), be = R.int(-4, 6), n5 = R.int(4, 9);
    if (be === 0) be = 1;
    var G = Math.pow(2, n5 + 1) - 1, S6 = al*G + be*(n5 + 1);
    return {
      q: 'Calcule ' + sig('(' + (al === 1 ? '' : al + ' × ') + '2ᵏ' + plus(be) + ')', 'k', 0, n5) + '.',
      a: sg(S6), accept: null, choix: null,
      expl: 'Linéarité : ' + (al === 1 ? '' : al + ' × ') + 'Σ 2ᵏ' + plus(be) + ' × ' + (n5 + 1) + ' (il y a ' + (n5 + 1) + ' termes, de 0 à ' + n5 + '). Σ 2ᵏ = (1 − 2' + ex(n5 + 1) + ')/(1 − 2) = ' + G + '. Donc S = ' + (al === 1 ? '' : al + ' × ') + G + plus(be*(n5 + 1)) + ' = ' + mil(S6) + '.'
    };
  }
});

})();

// ============================================================
// PHASE 6 — Prépa ECT, 1re année · LOT B (analyse)
// 5 skills : dérivation, limites, convexité, ln/exp, intégrales.
// Programme : BO spécial n°1 du 11/02/2021 (ECT 1re année).
// ============================================================
(function(){

// ---------- Helpers ----------
var SUP = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function sg(n){ return String(n).replace('-', '−'); }
function fr(x){ return String(x).replace('.', ',').replace('-', '−'); }
function neg(n){ return n<0 ? '(−' + Math.abs(n) + ')' : String(n); }
function pm(b){ return (b>=0 ? ' + ' : ' − ') + Math.abs(b); }
function pgcd(a,b){ a=Math.abs(a); b=Math.abs(b); for(var i=0;i<64 && b;i++){ var t=a%b; a=b; b=t; } return a||1; }
function frac(n,d){ if(d<0){ n=-n; d=-d; } var g=pgcd(n,d); n=n/g; d=d/g; return d===1 ? sg(n) : sg(n) + '/' + d; }
function cf(s){ if(s==='1') return ''; if(s==='−1') return '−'; if(s.indexOf('/')>-1) return s.charAt(0)==='−' ? '−(' + s.slice(1) + ')' : '(' + s + ')'; return s; }
function dv(n, d){ return n + '/' + (/[0-9,].*x|^−/.test(d) ? '(' + d + ')' : d); }
function par(s){ return /\s/.test(s) ? '(' + s + ')' : s; }
function rat(n, d){ return par(n) + '/' + (/\s|[0-9,].*x|^−/.test(d) ? '(' + d + ')' : d); }
// coefficient n/d devant xᵏ (forme « (3/2)x² »), et n/d divisé par xᵏ (forme « −1/(2x) »)
function coefX(n,d,k){ if(d<0){ n=-n; d=-d; } var g=pgcd(n,d); n/=g; d/=g; return d===1 ? mono(n,k,true) : (n<0 ? '−' : '') + '(' + Math.abs(n) + '/' + d + ')' + xp(k); }
function overX(n,d,k){ if(d<0){ n=-n; d=-d; } var g=pgcd(n,d); n/=g; d/=g; return sg(n) + '/' + (d===1 ? xp(k) : '(' + d + xp(k) + ')'); }
function eqIf(s, r){ return s===r ? s : s + ' = ' + r; }
function inf(s){ return s>0 ? '+∞' : '−∞'; }
function sup(k){ var s=String(k), o=''; for(var i=0;i<s.length;i++) o += SUP[s.charAt(i)]; return o; }
function xp(n){ return n===0 ? '1' : (n===1 ? 'x' : 'x' + sup(n)); }
function eP(k){ return k===1 ? 'e' : 'e' + sup(k); }
function pw(x,n){ var r=1; for(var i=0;i<n;i++) r*=x; return r; }
function sgn(x){ return x>0 ? 1 : -1; }
function mono(c,e,first){
  var ab=Math.abs(c), body;
  if(e===0) body=fr(ab);
  else body=(ab===1 ? '' : fr(ab)) + xp(e);
  if(first) return (c<0 ? '−' : '') + body;
  return (c<0 ? ' − ' : ' + ') + body;
}
// t = [[coef, exposant], ...] ; v = lettre de la variable (x par défaut)
function poly(t, v){
  var s='';
  for(var i=0;i<t.length;i++){ if(t[i][0]===0) continue; s += mono(t[i][0], t[i][1], s===''); }
  s = s || '0';
  return v ? s.replace(/x/g, v) : s;
}
function lin(a,b){ return poly([[a,1],[b,0]]); }
function fac(p){ return p===0 ? 'x' : '(' + lin(1,-p) + ')'; }
function fac2(p){ return p===0 ? 'x²' : '(' + lin(1,-p) + ')²'; }
var INF4 = ['+∞','−∞','0'];

// =====================================================
// ect-06 — Dérivation
// =====================================================
SKILLS.push({
  id: 'p6-ect-06-derivees',
  phase: 6,
  ordre: 6,
  titre: 'Dérivées : produit, quotient, composée',
  objectif: "Calculer un nombre dérivé et une tangente, dériver produits, quotients et composées simples, puis en déduire variations et extremums.",
  lecon: `<p class="lede">Au lycée, tu dérivais des polynômes pour savoir où une fonction monte et où elle descend. En prépa, on dérive tout : des produits, des quotients, des racines, des fonctions « emboîtées ». Bonne nouvelle : une poignée de règles suffit, à condition de les appliquer avec méthode.</p>
<p><strong>Le nombre dérivé.</strong> f'(a) est la <mark>pente de la tangente</mark> à la courbe de f au point d'abscisse a : il mesure la vitesse à laquelle f(x) varie quand x passe par a. La tangente en a a pour équation :</p>
<div class="formule"><p>y = f'(a)(x − a) + f(a)</p></div>
<p>Exemple : f(x) = x² en a = 3. On a f(3) = 9, f'(x) = 2x donc f'(3) = 6. Tangente : y = 6(x − 3) + 9, soit y = 6x − 9.</p>
<p><strong>Les dérivées usuelles.</strong></p>
<table>
<tr><th>f(x)</th><th>f'(x)</th><th>valable pour</th></tr>
<tr><td>k (constante)</td><td>0</td><td>x réel</td></tr>
<tr><td>x<sup>n</sup> (n entier ≥ 1)</td><td>n x<sup>n−1</sup></td><td>x réel</td></tr>
<tr><td>1/x</td><td>−1/x²</td><td>x ≠ 0</td></tr>
<tr><td>√x</td><td>1/(2√x)</td><td>x &gt; 0</td></tr>
</table>
<p><strong>Les opérations.</strong> u et v sont deux fonctions dérivables, k un réel :</p>
<div class="formule"><p>(u + v)' = u' + v' &nbsp;•&nbsp; (ku)' = k u' &nbsp;•&nbsp; (uv)' = u'v + uv' &nbsp;•&nbsp; (u/v)' = (u'v − uv')/v²</p></div>
<p><strong>Les composées simples.</strong> Quand une fonction est « emboîtée » dans une autre, on dérive l'extérieur, puis on <mark>multiplie par la dérivée de l'intérieur</mark> :</p>
<div class="formule"><p>(u(ax + b))' = a × u'(ax + b) &nbsp;•&nbsp; (u<sup>n</sup>)' = n u' u<sup>n−1</sup> &nbsp;•&nbsp; (√u)' = u'/(2√u) &nbsp;•&nbsp; (1/u)' = −u'/u²</p></div>
<p>Par exemple, (3x − 1)<sup>4</sup> a pour dérivée 4 × 3 × (3x − 1)³ = 12(3x − 1)³ : le « × 3 » vient de la dérivée de l'intérieur 3x − 1.</p>
<p><strong>Signe de f' et variations.</strong> Comme au lycée : si f' &gt; 0 sur un intervalle, f y est strictement croissante ; si f' &lt; 0, strictement décroissante. Et f admet un <mark>extremum local</mark> en a lorsque f' s'annule en a <em>en changeant de signe</em> : de + à −, c'est un maximum ; de − à +, un minimum.</p>
<p>Exemple complet : étudions f(x) = x/(x² + 1) sur ℝ.</p>
<div class="etapes">
<p>1. Je repère la forme : un quotient u/v avec u = x et v = x² + 1, donc u' = 1 et v' = 2x.</p>
<p>2. J'applique la formule : f'(x) = [1 × (x² + 1) − x × 2x]/(x² + 1)² = (1 − x²)/(x² + 1)².</p>
<p>3. Signe : le dénominateur est un carré non nul, toujours &gt; 0. Le signe de f' est donc celui de 1 − x² = (1 − x)(1 + x) : positif entre −1 et 1, négatif ailleurs.</p>
<p>4. Variations : f décroît sur ]−∞ ; −1], croît sur [−1 ; 1], puis décroît sur [1 ; +∞[.</p>
<p>5. Extremums : f' s'annule en changeant de signe en −1 (minimum local f(−1) = −1/2) et en 1 (<mark>maximum local f(1) = 1/2</mark>).</p>
</div>
<div class="box piege"><p class="box-t">Piège</p><p>La dérivée d'un produit n'est <strong>pas</strong> le produit des dérivées : (uv)' ≠ u'v'. Preuve express : x² = x × x a pour dérivée 2x, pas 1 × 1 = 1. Autre oubli classique, le u' des composées : (5x + 2)² se dérive en 2 × 5 × (5x + 2), pas en 2(5x + 2).</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Tangente : y = f'(a)(x − a) + f(a). Produit : (uv)' = u'v + uv'. Quotient : (u/v)' = (u'v − uv')/v². Composée : on n'oublie jamais de <mark>multiplier par u'</mark>. Un extremum local se trouve là où f' s'annule en changeant de signe.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Avant de dériver, écris u, v, u', v' sur une même ligne : la formule se remplit toute seule. Pour un quotient, garde v² sous forme de carré au lieu de le développer : il est positif, donc le signe de f' se lit sur le seul numérateur.</p></div>
<p>En prépa ECT : la dérivée est l'outil de base de toute étude de fonction (tableau de variations complet, recherche d'un coût minimal ou d'un bénéfice maximal, preuve d'inégalités). Les règles du produit, du quotient et des composées reviennent dans presque tous les sujets de concours.</p>`,
  gen(level, R){
    if(level===1){
      var t = R.int(1,4);
      if(t===1){
        var n = R.int(2,4), c = R.pick([1,2,3,4,5,-2,-3]), b = R.pick([-5,-4,-3,-2,-1,1,2,3,4,5]), d = R.int(-6,6);
        var a = (n===4) ? R.pick([-2,-1,1,2]) : R.pick([-2,-1,1,2,3]);
        var cn = c*n, p1 = cn*pw(a,n-1), res = p1 + b;
        var pa = (n-1===1) ? neg(a) : neg(a) + sup(n-1);
        return {q:"Soit f(x) = " + poly([[c,n],[b,1],[d,0]]) + ". Calcule f'(" + sg(a) + ").",
          a:sg(res), accept:null, choix:null,
          expl:"On dérive terme à terme avec (xⁿ)' = n xⁿ⁻¹, et la constante disparaît : f'(x) = " + poly([[cn,n-1],[b,0]]) + ". Donc f'(" + sg(a) + ") = " + sg(cn) + " × " + pa + pm(b) + " = " + sg(p1) + pm(b) + " = " + sg(res) + "."};
      }
      if(t===2){
        var k = R.int(3,9), ko = R.pick([3,5,7]);
        var it = R.pick([
          {f:"1/x", a:"−1/x²", d:["1/x²","−1/x","1/(2x)"], e:"(1/x)' = −1/x² (pour x ≠ 0). Ne perds pas le signe moins : la fonction inverse est décroissante sur chaque intervalle."},
          {f:"√x", a:"1/(2√x)", d:["2√x","1/√x","√x/2"], e:"(√x)' = 1/(2√x), valable pour x > 0."},
          {f:xp(k), a:k + xp(k-1), d:[k + xp(k), xp(k-1), (k-1) + xp(k-1)], e:"(xⁿ)' = n xⁿ⁻¹ : on fait descendre l'exposant devant et on le diminue de 1. Ici (" + xp(k) + ")' = " + k + xp(k-1) + "."},
          {f:k + "/x", a:"−" + k + "/x²", d:[k + "/x²", "−1/x²", "−" + k + "/x"], e:"(k/x)' = k × (−1/x²) : (" + k + "/x)' = −" + k + "/x²."},
          {f:ko + "√x", a:ko + "/(2√x)", d:[ko + "/√x", "1/(2√x)", ko + "√x/2"], e:"(k√x)' = k × 1/(2√x) : (" + ko + "√x)' = " + ko + "/(2√x)."}
        ]);
        return {q:"Quelle est la dérivée de f(x) = " + it.f + " ?", a:it.a, accept:null,
          choix:[it.a, it.d[0], it.d[1], it.d[2]], expl:it.e};
      }
      if(t===3){
        var aT = R.int(-3,4), m = R.pick([-4,-3,-2,-1,2,3,4,5]), p = R.int(-6,6);
        var eq = "y = " + poly([[m,1],[p,0]]);
        var debut = "La tangente à la courbe de f au point d'abscisse " + sg(aT) + " a pour équation " + eq + ".";
        if(R.int(1,2)===1){
          return {q:debut + " Que vaut f'(" + sg(aT) + ") ?", a:sg(m), accept:null, choix:null,
            expl:"f'(a) est le coefficient directeur (la pente) de la tangente en a. Dans " + eq + ", c'est le nombre devant x : f'(" + sg(aT) + ") = " + sg(m) + "."};
        }
        var fa = m*aT + p;
        return {q:debut + " Que vaut f(" + sg(aT) + ") ?", a:sg(fa), accept:null, choix:null,
          expl:"Le point de contact (a ; f(a)) est à la fois sur la courbe et sur la tangente : f(" + sg(aT) + ") = " + sg(m) + " × " + neg(aT) + pm(p) + " = " + sg(fa) + "."};
      }
      if(R.int(1,2)===1){
        var aa = R.pick([1,2,3,-1,-2]), kk = R.int(1,6);
        var r = frac(-kk, aa*aa);
        return {q:"Soit f(x) = " + kk + "/x, définie pour x ≠ 0. Calcule f'(" + sg(aa) + ") (valeur exacte : entier ou fraction).",
          a:r, accept:null, choix:null,
          expl:"(1/x)' = −1/x², donc f'(x) = −" + kk + "/x². f'(" + sg(aa) + ") = −" + kk + "/" + neg(aa) + "² = " + eqIf("−" + kk + "/" + (aa*aa), r) + "."};
      }
      var sq = R.int(1,5), x0 = sq*sq, kk2 = R.int(1,6), r2 = frac(kk2, 2*sq);
      return {q:"Soit f(x) = " + (kk2===1 ? '' : kk2) + "√x, définie pour x ≥ 0. Calcule f'(" + x0 + ") (valeur exacte : entier ou fraction).",
        a:r2, accept:null, choix:null,
        expl:"(√x)' = 1/(2√x), donc f'(x) = " + kk2 + "/(2√x). f'(" + x0 + ") = " + kk2 + "/(2 × √" + x0 + ") = " + kk2 + "/(2 × " + sq + ") = " + eqIf(kk2 + "/" + (2*sq), r2) + "."};
    }

    if(level===2){
      var t2 = R.int(1,5);
      if(t2===1){
        var a = R.pick([1,2,3,-1]), b = R.pick([-4,-3,-2,-1,1,2,3,4]), c = R.pick([1,2,-1]), d = R.pick([-3,-2,-1,1,2,3,5]), x0 = R.pick([-2,-1,1,2]);
        var u0 = a*x0 + b, v0 = c*x0*x0 + d, vp0 = 2*c*x0, res = a*v0 + u0*vp0;
        return {q:"Soit f(x) = (" + lin(a,b) + ")(" + poly([[c,2],[d,0]]) + "). Calcule f'(" + sg(x0) + ").",
          a:sg(res), accept:null, choix:null,
          expl:"Produit u × v avec u = " + lin(a,b) + " (u' = " + sg(a) + ") et v = " + poly([[c,2],[d,0]]) + " (v' = " + poly([[2*c,1]]) + "). f'(x) = u'v + uv'. En x = " + sg(x0) + " : u = " + sg(u0) + ", v = " + sg(v0) + ", v' = " + sg(vp0) + ". Donc f'(" + sg(x0) + ") = " + neg(a) + " × " + neg(v0) + " + " + neg(u0) + " × " + neg(vp0) + " = " + sg(res) + "."};
      }
      if(t2===2){
        var a2 = R.pick([1,2,3,-1,-2]), b2 = R.int(-5,5), c2 = R.pick([1,2]), d2 = R.int(1,5), x2 = R.int(0,3);
        if(a2*d2 - b2*c2 === 0) b2 = b2 + 1;
        var N = a2*d2 - b2*c2, den = c2*x2 + d2, r = frac(N, den*den);
        return {q:"Soit f(x) = " + rat(lin(a2,b2), lin(c2,d2)) + ". Calcule f'(" + x2 + ") (valeur exacte : entier ou fraction).",
          a:r, accept:null, choix:null,
          expl:"Quotient u/v avec u = " + lin(a2,b2) + " (u' = " + sg(a2) + ") et v = " + lin(c2,d2) + " (v' = " + c2 + "). f'(x) = (u'v − uv')/v² = [" + sg(a2) + "(" + lin(c2,d2) + ") − " + c2 + "(" + lin(a2,b2) + ")]/(" + lin(c2,d2) + ")² = " + sg(N) + "/(" + lin(c2,d2) + ")². En x = " + x2 + ", v = " + den + ", donc f'(" + x2 + ") = " + eqIf(sg(N) + "/" + (den*den), r) + "."};
      }
      if(t2===3){
        var a3 = R.int(1,5), b3 = R.int(1,6), c3 = R.int(1,4), d3 = R.int(1,6);
        if(a3*d3 === b3*c3) b3 = b3 + 1;
        var den3 = "/(" + lin(c3,d3) + ")²";
        var bon = sg(a3*d3 - b3*c3) + den3;
        return {q:"Soit f(x) = " + rat(lin(a3,b3), lin(c3,d3)) + ". Quelle est sa dérivée f'(x) ?",
          a:bon, accept:null,
          choix:[bon, sg(b3*c3 - a3*d3) + den3, (a3*d3 + b3*c3) + den3, frac(a3,c3)],
          expl:"(u/v)' = (u'v − uv')/v² avec u = " + lin(a3,b3) + ", u' = " + a3 + ", v = " + lin(c3,d3) + ", v' = " + c3 + ". Numérateur : " + a3 + "(" + lin(c3,d3) + ") − " + c3 + "(" + lin(a3,b3) + ") = " + (a3*d3) + " − " + (b3*c3) + " = " + sg(a3*d3 - b3*c3) + " (les termes en x s'éliminent). Attention à l'ordre u'v − uv', et la dérivée d'un quotient n'est pas le quotient des dérivées."};
      }
      if(t2===4){
        var cub = R.int(1,2)===1;
        var k3 = cub ? R.pick([1,-1]) : 0, k2 = cub ? R.pick([-3,-2,-1,1,2,3]) : R.pick([1,2,3,-1,-2]), k1 = R.int(-5,5), k0 = R.int(-6,6);
        var aa = R.int(-2,3);
        var fa = k3*aa*aa*aa + k2*aa*aa + k1*aa + k0, m = 3*k3*aa*aa + 2*k2*aa + k1, p = fa - m*aa;
        var askP = R.int(1,3) < 3;
        return {q:"Soit f(x) = " + poly([[k3,3],[k2,2],[k1,1],[k0,0]]) + ". La tangente à sa courbe au point d'abscisse " + sg(aa) + " s'écrit y = mx + p. " + (askP ? "Donne p (l'ordonnée à l'origine)." : "Donne m (le coefficient directeur)."),
          a:sg(askP ? p : m), accept:null, choix:null,
          expl:"f'(x) = " + poly([[3*k3,2],[2*k2,1],[k1,0]]) + ", donc f'(" + sg(aa) + ") = " + sg(m) + ", et f(" + sg(aa) + ") = " + sg(fa) + ". Tangente : y = f'(a)(x − a) + f(a) = " + neg(m) + " × " + (aa===0 ? "x" : "(" + lin(1,-aa) + ")") + pm(fa) + ", soit y = " + poly([[m,1],[p,0]]) + ". Donc " + (askP ? "p = " + sg(p) : "m = " + sg(m)) + "."};
      }
      var a5 = R.pick([2,3,-2,5,-1]), n5 = R.int(2,4);
      var w = (n5===4) ? R.pick([-1,1,2]) : R.pick([-2,-1,1,2]);
      var x5 = R.int(-1,2), b5 = w - a5*x5;
      if(b5===0){ x5 = 0; b5 = w; }
      var res5 = n5*a5*pw(w,n5-1);
      var u5 = "(" + lin(a5,b5) + ")";
      return {q:"Soit f(x) = " + u5 + sup(n5) + ". Calcule f'(" + sg(x5) + ").",
        a:sg(res5), accept:null, choix:null,
        expl:"(uⁿ)' = n u' uⁿ⁻¹ avec u = " + lin(a5,b5) + " et u' = " + sg(a5) + " : f'(x) = " + n5 + " × " + neg(a5) + " × " + u5 + (n5-1===1 ? '' : sup(n5-1)) + ". En x = " + sg(x5) + ", u = " + sg(w) + ", donc f'(" + sg(x5) + ") = " + sg(n5*a5) + " × " + neg(w) + (n5-1===1 ? '' : sup(n5-1)) + " = " + sg(res5) + ". (Sans le facteur u' = " + sg(a5) + ", on trouverait un résultat faux.)"};
    }

    // level 3
    var t3 = R.int(1,5);
    if(t3===1){
      var ca = R.pick([1,2,4,5]), kq = R.pick([5,10,20,25]), cb = R.pick([5,10,20,30]), cc = ca*kq*kq;
      var cm = (ca===1 ? '' : ca) + "q + " + cb + " + " + cc + "/q";
      var cmin = 2*ca*kq + cb;
      var base = "Le coût moyen de production (en €) de q unités est CM(q) = " + cm + ", pour q > 0.";
      var ex = "CM'(q) = " + ca + " − " + cc + "/q² = (" + (ca===1 ? '' : ca) + "q² − " + cc + ")/q². Il s'annule pour q² = " + (cc/ca) + ", soit q = " + kq + " (q > 0). CM' est négatif avant " + kq + " et positif après : CM admet un minimum en q = " + kq + ".";
      if(R.int(1,2)===1){
        return {q:base + " Pour quelle quantité q le coût moyen est-il minimal ?", a:String(kq), accept:null, choix:null, expl:ex};
      }
      return {q:base + " Quel est le coût moyen minimal, en € ?", a:String(cmin), accept:null, choix:null,
        expl:ex + " CM(" + kq + ") = " + (ca*kq) + " + " + cb + " + " + (cc/kq) + " = " + cmin + " €."};
    }
    if(t3===2){
      var w3 = R.int(1,3);
      if(w3===1){
        var pr = R.pick([[3,16,5],[4,9,5],[2,5,3],[1,3,2],[6,64,10],[2,21,5],[4,20,6],[3,7,4],[1,8,3],[2,12,4]]);
        var xr = pr[0], cr = pr[1], sr = pr[2], rr = frac(xr, sr);
        return {q:"Soit f(x) = √(x² + " + cr + "). Calcule f'(" + xr + ") (valeur exacte : entier ou fraction).",
          a:rr, accept:null, choix:null,
          expl:"(√u)' = u'/(2√u) avec u = x² + " + cr + " et u' = 2x : f'(x) = 2x/(2√(x² + " + cr + ")) = x/√(x² + " + cr + "). f'(" + xr + ") = " + xr + "/√(" + (xr*xr) + " + " + cr + ") = " + xr + "/√" + (sr*sr) + " = " + eqIf(xr + "/" + sr, rr) + "."};
      }
      if(w3===2){
        var xi = R.int(1,3), ci = R.int(1,5), ui = xi*xi + ci, ri = frac(-2*xi, ui*ui);
        return {q:"Soit f(x) = 1/(x² + " + ci + "). Calcule f'(" + xi + ") (valeur exacte : entier ou fraction).",
          a:ri, accept:null, choix:null,
          expl:"(1/u)' = −u'/u² avec u = x² + " + ci + " et u' = 2x : f'(x) = −2x/(x² + " + ci + ")². En x = " + xi + ", u = " + ui + ", donc f'(" + xi + ") = −" + (2*xi) + "/" + ui + "² = " + eqIf("−" + (2*xi) + "/" + (ui*ui), ri) + "."};
      }
      var xc = R.pick([-1,1,2]), cw = R.pick([-3,-2,-1,1,2]), uc = xc*xc + cw, rc = 6*xc*uc*uc;
      return {q:"Soit f(x) = (" + poly([[1,2],[cw,0]]) + ")³. Calcule f'(" + sg(xc) + ").",
        a:sg(rc), accept:null, choix:null,
        expl:"(u³)' = 3u'u² avec u = " + poly([[1,2],[cw,0]]) + " et u' = 2x : f'(x) = 3 × 2x × (" + poly([[1,2],[cw,0]]) + ")² = 6x(" + poly([[1,2],[cw,0]]) + ")². En x = " + sg(xc) + ", u = " + sg(uc) + ", donc f'(" + sg(xc) + ") = 6 × " + neg(xc) + " × " + neg(uc) + "² = " + sg(rc) + "."};
    }
    if(t3===3){
      var kx = R.int(1,5), k2x = kx*kx, v3 = R.int(1,3);
      var f3 = "x/(x² + " + k2x + ")";
      var ex3 = "Quotient : f'(x) = [1 × (x² + " + k2x + ") − x × 2x]/(x² + " + k2x + ")² = (" + k2x + " − x²)/(x² + " + k2x + ")². Le dénominateur est positif ; le signe est celui de " + k2x + " − x² = (" + kx + " − x)(" + kx + " + x) : négatif avant −" + kx + ", positif entre −" + kx + " et " + kx + ", négatif après " + kx + ". Donc minimum local en x = −" + kx + " et maximum local en x = " + kx + ".";
      if(v3===1) return {q:"Soit f(x) = " + f3 + " sur ℝ. En quelle valeur de x la fonction f admet-elle un maximum local ?", a:String(kx), accept:null, choix:null, expl:ex3};
      if(v3===2) return {q:"Soit f(x) = " + f3 + " sur ℝ. En quelle valeur de x la fonction f admet-elle un minimum local ?", a:sg(-kx), accept:null, choix:null, expl:ex3};
      var mx = frac(1, 2*kx);
      return {q:"Soit f(x) = " + f3 + " sur ℝ. Quelle est la valeur de son maximum local (valeur exacte) ?", a:mx, accept:null, choix:null,
        expl:ex3 + " Valeur : f(" + kx + ") = " + kx + "/(" + k2x + " + " + k2x + ") = " + eqIf(kx + "/" + (2*k2x), mx) + "."};
    }
    if(t3===4){
      var at = R.int(1,3), mt = R.int(1,4), kt = at*mt;
      var slope = frac(-kt, at*at);
      var exT = "f(" + at + ") = " + kt + "/" + at + " = " + mt + " et f'(x) = −" + kt + "/x², donc f'(" + at + ") = " + eqIf("−" + kt + "/" + (at*at), slope) + ". Tangente : y = " + cf(slope) + "(x − " + at + ") + " + mt + ", soit y = " + cf(slope) + "x + " + (2*mt) + ".";
      var debT = "Soit f(x) = " + kt + "/x sur ]0 ; +∞[ et T sa tangente au point d'abscisse " + at + ".";
      var vt = R.int(1,3);
      if(vt===1) return {q:debT + " T s'écrit y = mx + p. Donne p.", a:String(2*mt), accept:null, choix:null, expl:exT};
      if(vt===2) return {q:debT + " T s'écrit y = mx + p. Donne m (valeur exacte).", a:slope, accept:null, choix:null, expl:exT};
      return {q:debT + " En quelle abscisse T coupe-t-elle l'axe des abscisses ?", a:String(2*at), accept:null, choix:null,
        expl:exT + " On résout " + cf(slope) + "x + " + (2*mt) + " = 0 : x = " + (2*at) + "."};
    }
    var s5 = R.int(1,3), tt = R.int(1,4), rq = s5 + 2*tt;
    var A2 = 3*(rq - s5)/2, A1 = 3*rq*s5, Cf = R.pick([20,50,100]);
    var Bq = poly([[-1,3],[A2,2],[A1,1],[-Cf,0]], 'q');
    return {q:"Une entreprise produit q centaines d'objets, avec q dans [0 ; 15]. Son bénéfice, en milliers d'€, est B(q) = " + Bq + ". Pour quelle valeur de q le bénéfice est-il maximal ?",
      a:String(rq), accept:null, choix:null,
      expl:"B'(q) = " + poly([[-3,2],[2*A2,1],[A1,0]], 'q') + " = −3(" + poly([[1,2],[-(rq-s5),1],[-rq*s5,0]], 'q') + ") = −3(q − " + rq + ")(q + " + s5 + "). Sur [0 ; 15], q + " + s5 + " > 0, donc B' est du signe de −(q − " + rq + ") : positif avant " + rq + ", négatif après. B' s'annule en changeant de signe (de + à −) en q = " + rq + " : c'est le maximum."};
  }
});

// =====================================================
// ect-07 — Limites et asymptotes
// =====================================================
SKILLS.push({
  id: 'p6-ect-07-limites',
  phase: 6,
  ordre: 7,
  titre: 'Limites et asymptotes',
  objectif: "Trouver les limites des polynômes et des fractions rationnelles, traiter une division par 0, repérer les formes indéterminées et en déduire les asymptotes.",
  lecon: `<p class="lede">Une limite répond à une question simple : « vers quoi se rapproche f(x) quand x devient immense, ou quand x s'approche d'une valeur interdite ? » En prépa ECT, pas de théorie compliquée là-dessus : on apprend quelques règles sûres, et on sait s'en servir.</p>
<p><strong>Notation.</strong> On écrit lim<sub>x→+∞</sub> f(x) = L pour dire que f(x) se rapproche autant qu'on veut de L quand x devient très grand. Les limites de référence : en +∞, x, x², x³, √x… tendent vers +∞ et 1/x, 1/x² tendent vers 0. En −∞, x<sup>n</sup> tend vers +∞ si n est pair, vers −∞ si n est impair.</p>
<p><strong>Opérations.</strong> Avec L un réel non nul : L + ∞ = ∞ ; L × ∞ = ∞ (règle des signes) ; L/∞ = 0 ; L/0 = ∞ (le signe dépend de celui du 0, voir plus bas). Quatre situations ne permettent <mark>pas de conclure directement</mark> : ce sont les <strong>formes indéterminées</strong>.</p>
<div class="formule"><p>∞ − ∞ &nbsp;•&nbsp; 0 × ∞ &nbsp;•&nbsp; ∞/∞ &nbsp;•&nbsp; 0/0</p></div>
<p>Face à une forme indéterminée, on transforme l'écriture (en général, on factorise par le terme qui « pèse » le plus).</p>
<p><strong>Polynômes et fractions rationnelles en ±∞.</strong> Le résultat à connaître : en +∞ ou en −∞, un polynôme a la même limite que son <mark>terme de plus haut degré</mark> ; une fraction rationnelle a la même limite que le quotient des termes de plus haut degré du numérateur et du dénominateur.</p>
<div class="etapes">
<p>1. f(x) = (2x² − 3x + 1)/(x² + 4) en +∞ : le haut et le bas tendent vers +∞, c'est une forme ∞/∞.</p>
<p>2. Je garde les termes de plus haut degré : 2x²/x² = 2.</p>
<p>3. Conclusion : lim<sub>x→+∞</sub> f(x) = 2. La courbe s'approche de la droite y = 2 : c'est une <mark>asymptote horizontale</mark>.</p>
<p>4. g(x) = (x + 1)/(x − 2) près de 2 : le numérateur tend vers 3, le dénominateur vers 0. Si x &gt; 2 (on note x → 2<sup>+</sup>), x − 2 est un petit nombre positif : 3 divisé par un tout petit positif donne +∞. Si x &lt; 2 (x → 2<sup>−</sup>), x − 2 est petit et négatif : la limite est −∞.</p>
<p>5. Conclusion : la droite x = 2 est une <mark>asymptote verticale</mark> de la courbe de g.</p>
</div>
<p><strong>Limite d'une composée.</strong> Si l'intérieur tend vers b et que la fonction extérieure tend vers L quand on s'approche de b, la composée tend vers L. Exemple : (4x² + 1)/(x² + 3) tend vers 4 en +∞, donc √((4x² + 1)/(x² + 3)) tend vers √4 = 2.</p>
<p><strong>Asymptotes.</strong> Si lim f(x) = L en +∞ (ou en −∞), la droite y = L est asymptote horizontale. Si f(x) tend vers +∞ ou −∞ quand x tend vers a, la droite x = a est asymptote verticale. (La recherche systématique de toutes les « branches infinies » est hors programme.)</p>
<div class="box piege"><p class="box-t">Piège</p><p>« ∞ − ∞ » ne vaut pas 0, et « ∞/∞ » ne vaut pas 1 : on ne peut rien dire sans transformer. Par exemple x² − 100x tend vers +∞ en +∞ (factorise : x(x − 100)), alors que x − x² tend vers −∞.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>En ±∞ : polynôme → terme de plus haut degré ; fraction rationnelle → quotient des termes de plus haut degré. Nombre non nul divisé par 0 → ±∞ : <mark>étudie le signe du dénominateur</mark> de chaque côté. Limite finie L en ±∞ → asymptote y = L ; limite infinie en a → asymptote x = a.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour une fraction rationnelle en ±∞, compare les degrés : degré du haut plus petit → 0 ; degrés égaux → quotient des coefficients dominants ; degré du haut plus grand → ±∞ (le signe se lit sur le quotient des termes dominants).</p></div>
<p>En prépa ECT : les limites servent à compléter les bords des tableaux de variations, à justifier qu'une équation f(x) = k a une solution, à étudier la convergence des suites et, plus tard, à manipuler les intégrales et les lois de probabilité continues.</p>`,
  gen(level, R){
    if(level===1){
      var t = R.int(1,4);
      if(t===1){
        var n = R.int(2,5), a = R.pick([-3,-2,-1,1,2,3]), b = R.pick([-9,-5,-4,4,5,9,10]), c = R.int(-9,9), side = R.pick([1,-1]);
        var xl = (side>0 || n%2===0) ? 1 : -1, corr = inf(sgn(a)*xl);
        return {q:"Quelle est la limite de f(x) = " + poly([[a,n],[b,n-1],[c,0]]) + " quand x tend vers " + inf(side) + " ?",
          a:corr, accept:null, choix:['+∞','−∞','0', sg(a)],
          expl:"En " + inf(side) + ", un polynôme a la même limite que son terme de plus haut degré, ici " + mono(a,n,true) + ". " + xp(n) + " tend vers " + inf(xl) + (side<0 ? " (puissance " + (n%2===0 ? "paire" : "impaire") + ")" : "") + ", et on multiplie par " + sg(a) + " : la limite est " + corr + "."};
      }
      if(t===2){
        var a2 = R.pick([1,2,3,4,5,6,-2,-3]), c2 = R.pick([1,2,3,4]), b2 = R.pick([-7,-5,-3,-1,1,2,4,6]), d2 = R.pick([-6,-4,-2,1,3,5]), s2 = R.pick([1,-1]);
        var r2 = frac(a2,c2), f2 = rat(lin(a2,b2), lin(c2,d2));
        var q2 = R.int(1,2)===1
          ? "Soit f(x) = " + f2 + ". Sa courbe admet en " + inf(s2) + " une asymptote horizontale d'équation y = k. Donne k (valeur exacte)."
          : "Calcule la limite de f(x) = " + f2 + " quand x tend vers " + inf(s2) + " (valeur exacte).";
        return {q:q2, a:r2, accept:null, choix:null,
          expl:"En " + inf(s2) + ", on garde les termes de plus haut degré en haut et en bas : " + dv(mono(a2,1,true), mono(c2,1,true)) + " = " + eqIf(sg(a2) + "/" + c2, r2) + ". Donc lim f(x) = " + r2 + " et la droite y = " + r2 + " est asymptote horizontale."};
      }
      if(t===3){
        var FI = ["(+∞) − (+∞)", "0 × (+∞)", "(+∞)/(+∞)", "0/0"];
        var DET = [["(+∞) + (+∞)","+∞"],["3 × (+∞)","+∞"],["5/(+∞)","0"],["(+∞) × (−∞)","−∞"],["(−∞) − (+∞)","−∞"],["(+∞) − 2","+∞"],["1/(+∞)","0"],["(+∞)/4","+∞"]];
        var listeFI = "Les quatre formes indéterminées sont ∞ − ∞, 0 × ∞, ∞/∞ et 0/0.";
        var D = R.shuffle(DET);
        if(R.int(1,2)===1){
          var fi = R.pick(FI);
          return {q:"Parmi ces calculs de limites, lequel est une forme indéterminée ?", a:fi, accept:null,
            choix:[fi, D[0][0], D[1][0], D[2][0]],
            expl:listeFI + " Les autres se calculent : " + D[0][0] + " = " + D[0][1] + ", " + D[1][0] + " = " + D[1][1] + ", " + D[2][0] + " = " + D[2][1] + "."};
        }
        var F = R.shuffle(FI);
        return {q:"Parmi ces calculs de limites, lequel n'est PAS une forme indéterminée ?", a:D[0][0], accept:null,
          choix:[D[0][0], F[0], F[1], F[2]],
          expl:listeFI + " En revanche " + D[0][0] + " se calcule directement : " + D[0][1] + "."};
      }
      var L = R.pick([-3,-2,2,3,5]), gs = R.pick([1,-1]), op = R.int(1,3);
      var debut = "Quand x tend vers +∞, f(x) tend vers " + sg(L) + " et g(x) tend vers " + inf(gs) + ".";
      if(op===1) return {q:debut + " Vers quoi tend f(x) + g(x) ?", a:inf(gs), accept:null, choix:['+∞','−∞','0', sg(L)],
        expl:"Un nombre fini plus un infini : l'infini l'emporte. " + sg(L) + " + (" + inf(gs) + ") donne " + inf(gs) + "."};
      if(op===2) return {q:debut + " Vers quoi tend f(x) × g(x) ?", a:inf(sgn(L)*gs), accept:null, choix:['+∞','−∞','0', sg(L)],
        expl:"Un nombre non nul fois un infini donne un infini, avec la règle des signes : " + sg(L) + " × (" + inf(gs) + ") donne " + inf(sgn(L)*gs) + "."};
      return {q:debut + " Vers quoi tend f(x)/g(x) ?", a:'0', accept:null, choix:['+∞','−∞','0', sg(L)],
        expl:"Un nombre fini divisé par un nombre de plus en plus grand (en valeur absolue) se rapproche de 0 : " + sg(L) + "/(" + inf(gs) + ") donne 0."};
    }

    if(level===2){
      var t2 = R.int(1,5);
      if(t2===1){
        var pr = R.pick([[2,1],[1,2],[3,1],[1,3],[3,2],[2,3],[2,2],[3,3]]);
        var p = pr[0], qd = pr[1];
        var a = R.pick([1,2,3,4,-1,-2,-3]), c = R.pick([1,2,3,-1]), b = R.pick([-5,-3,-2,2,3,4]), e = R.pick([-4,-1,1,2,5,7]), k0 = R.int(-5,5);
        var side = R.pick([1,-1]);
        var num = (p===1) ? lin(a,b) : poly([[a,p],[b,p-1],[k0,0]]);
        var den = poly([[c,qd],[e,0]]);
        var rr = frac(a,c), corr, fin;
        if(p<qd){ corr = '0'; fin = overX(a, c, qd-p) + ", qui tend vers 0."; }
        else if(p===qd){ corr = rr; fin = rr + "."; }
        else {
          var s = sgn(a)*sgn(c)*((side<0 && (p-qd)%2===1) ? -1 : 1);
          corr = inf(s); fin = coefX(a, c, p-qd) + ", qui tend vers " + corr + ".";
        }
        return {q:"Quelle est la limite de f(x) = (" + num + ")/(" + den + ") quand x tend vers " + inf(side) + " ?",
          a:corr, accept:null, choix:['+∞','−∞','0', rr],
          expl:"En " + inf(side) + ", on garde le quotient des termes de plus haut degré : " + dv(mono(a,p,true), mono(c,qd,true)) + " = " + fin + " Donc lim f(x) = " + corr + "."};
      }
      if(t2===2){
        var x0 = R.int(-3,4), a2 = R.pick([1,2,-1,3]), b2 = R.int(-6,6);
        var N = a2*x0 + b2; if(N===0){ b2 = b2 + 1; N = 1; }
        var s2 = R.pick([1,-1]), res = inf(sgn(N)*s2);
        return {q:"Calcule la limite de f(x) = " + rat(lin(a2,b2), lin(1,-x0)) + " quand x tend vers " + sg(x0) + " par valeurs " + (s2>0 ? "supérieures (x → " + sg(x0) + "⁺)." : "inférieures (x → " + sg(x0) + "⁻)."),
          a:res, accept:null, choix:['+∞','−∞','0', sg(N)],
          expl:"Le numérateur tend vers " + sg(a2) + " × " + neg(x0) + pm(b2) + " = " + sg(N) + ". Le dénominateur " + lin(1,-x0) + " tend vers 0 en restant " + (s2>0 ? "positif (car x > " + sg(x0) + ")" : "négatif (car x < " + sg(x0) + ")") + ". " + sg(N) + " divisé par un nombre très petit et " + (s2>0 ? "positif" : "négatif") + " : la limite est " + res + ". La droite x = " + sg(x0) + " est asymptote verticale."};
      }
      if(t2===3){
        var c3 = R.pick([1,2,3,4,-2]), d3 = R.pick([-9,-7,-5,-3,-1,1,2,3,5,6,8]), a3 = R.pick([1,2,3,-1]), b3 = R.int(-5,5);
        if(a3*d3 === b3*c3) b3 = b3 + 1;
        var r3 = frac(-d3, c3), nv = frac(b3*c3 - a3*d3, c3);
        return {q:"Soit f(x) = " + rat(lin(a3,b3), lin(c3,d3)) + ". Sa courbe admet une asymptote verticale d'équation x = k. Donne k (valeur exacte).",
          a:r3, accept:null, choix:null,
          expl:"Une asymptote verticale apparaît là où le dénominateur s'annule sans que le numérateur s'annule : " + lin(c3,d3) + " = 0 ⇔ x = " + r3 + ". En ce point, le numérateur vaut " + nv + " ≠ 0 : f(x) tend vers +∞ ou −∞ de chaque côté, et la droite x = " + r3 + " est asymptote verticale."};
      }
      if(t2===4){
        if(R.int(1,2)===1){
          var ca = R.pick([2,3,5,8,12]), F = R.pick([100,200,500,1000]);
          return {q:"Le coût total de production de q unités est C(q) = " + ca + "q + " + F + " (en €). Le coût moyen est CM(q) = C(q)/q. Vers quelle valeur tend le coût moyen quand la production q devient très grande ?",
            a:String(ca), accept:null, choix:null,
            expl:"CM(q) = (" + ca + "q + " + F + ")/q = " + ca + " + " + F + "/q. Quand q → +∞, " + F + "/q → 0, donc CM(q) → " + ca + " €. Les coûts fixes s'amortissent sur une production énorme : la droite y = " + ca + " est asymptote horizontale."};
        }
        var pa = R.pick([30,40,45,60]), pb = R.pick([0,5,10]), pc = R.pick([2,4,5]);
        return {q:"La part de marché (en %) d'un produit, t mois après son lancement, est modélisée par f(t) = (" + lin(pa,pb).replace(/x/g,'t') + ")/(t + " + pc + "). Vers quelle valeur tend cette part de marché à long terme ?",
          a:String(pa), accept:null, choix:null,
          expl:"À long terme, t → +∞. On garde les termes de plus haut degré : " + pa + "t/t = " + pa + ". La part de marché se stabilise vers " + pa + " % (asymptote horizontale y = " + pa + ")."};
      }
      var x5 = R.int(0,3), b5 = R.int(-4,6), c5 = R.int(1,5);
      var r5 = frac(x5*x5 + b5, x5 + c5);
      return {q:"Calcule la limite de f(x) = " + rat(poly([[1,2],[b5,0]]), "x + " + c5) + " quand x tend vers " + x5 + " (valeur exacte).",
        a:r5, accept:null, choix:null,
        expl:"Le dénominateur ne s'annule pas en " + x5 + " (il vaut " + (x5 + c5) + ") : il n'y a aucune difficulté, on remplace simplement x par " + x5 + ". f(" + x5 + ") = (" + (x5*x5) + pm(b5) + ")/" + (x5 + c5) + " = " + eqIf(sg(x5*x5 + b5) + "/" + (x5 + c5), r5) + "."};
    }

    // level 3
    var t3 = R.int(1,5);
    if(t3===1){
      if(R.int(1,2)===1){
        var x0 = R.int(-2,3), a = R.pick([1,2,-1]), b = R.int(-5,5);
        var N = a*x0 + b; if(N===0){ b = b + 1; N = 1; }
        var res = inf(sgn(N));
        return {q:"Calcule la limite de f(x) = " + par(lin(a,b)) + "/" + fac2(x0) + " quand x tend vers " + sg(x0) + ".",
          a:res, accept:null, choix:['+∞','−∞','0', sg(N)],
          expl:"Le numérateur tend vers " + sg(N) + ". Le dénominateur " + fac2(x0) + " tend vers 0 en restant positif, des deux côtés (c'est un carré). " + sg(N) + " divisé par un tout petit positif : " + res + ", que x arrive par la gauche ou par la droite. Asymptote verticale x = " + sg(x0) + "."};
      }
      var k = R.int(1,3), P = R.pick([k,-k]), sd = R.pick([1,-1]), a1 = R.pick([1,2,3]), b1 = R.int(-4,4);
      var N1 = a1*P + b1; if(N1===0){ b1 = b1 + 1; N1 = N1 + 1; }
      var sDen = sd*sgn(P), res1 = inf(sgn(N1)*sDen);
      var nulF = (P>0) ? "(x − " + k + ")" : "(x + " + k + ")", autreF = (P>0) ? "(x + " + k + ")" : "(x − " + k + ")";
      return {q:"Calcule la limite de f(x) = " + par(lin(a1,b1)) + "/(x² − " + (k*k) + ") quand x → " + sg(P) + (sd>0 ? "⁺" : "⁻") + ".",
        a:res1, accept:null, choix:['+∞','−∞','0', sg(N1)],
        expl:"x² − " + (k*k) + " = (x − " + k + ")(x + " + k + "). Quand x → " + sg(P) + (sd>0 ? "⁺" : "⁻") + ", le facteur " + nulF + " tend vers 0 en restant " + (sd>0 ? "positif" : "négatif") + ", et " + autreF + " tend vers " + sg(2*P) + ". Le dénominateur tend donc vers 0 en restant " + (sDen>0 ? "positif" : "négatif") + ". Le numérateur tend vers " + sg(N1) + ". Limite : " + res1 + "."};
    }
    if(t3===2){
      var n = R.int(2,5), a2 = R.pick([1,2,3,-1,-2]), side = R.pick([1,-1]);
      var bAbs = R.pick([3,5,10,100]);
      var b2 = ((side>0) ? -sgn(a2) : sgn(a2))*bAbs, c2 = R.int(-9,9);
      var lead = sgn(a2)*((side<0 && n%2===1) ? -1 : 1);
      return {q:"Quelle est la limite de f(x) = " + poly([[a2,n],[b2,n-1],[c2,0]]) + " quand x tend vers " + inf(side) + " ?",
        a:inf(lead), accept:null, choix:['+∞','−∞','0','On ne peut pas conclure'],
        expl:"Les deux premiers termes tendent vers des infinis de signes contraires : forme indéterminée « ∞ − ∞ » en apparence. On la lève en factorisant par le terme de plus haut degré : f(x) = " + mono(a2,n,true) + " × (1 + (" + frac(b2,a2) + ")/x + …), et la parenthèse tend vers 1. Donc f a la même limite que " + mono(a2,n,true) + " en " + inf(side) + " : " + inf(lead) + "."};
    }
    if(t3===3){
      var kind = R.int(1,3), p3 = R.int(-4,5), q3 = R.int(-4,5);
      if(q3===p3) q3 = (p3===5) ? -4 : p3 + 1;
      var den, roots, B, C;
      if(kind===1){ B = -(p3+q3); C = p3*q3; roots = [p3,q3]; }
      else if(kind===2){ B = -2*p3; C = p3*p3; roots = [p3]; }
      else { B = R.int(-3,3); C = Math.floor(B*B/4) + R.int(1,5); roots = []; }
      den = poly([[1,2],[B,1],[C,0]]);
      var a3 = R.pick([1,2,3]), e3 = R.int(-5,5);
      for(var i=0;i<4;i++){
        var ok = true;
        for(var j=0;j<roots.length;j++) if(a3*roots[j] + e3 === 0) ok = false;
        if(ok) break;
        e3 = e3 + 1;
      }
      var D = B*B - 4*C;
      var exR = (roots.length===2) ? "Δ = " + sg(D) + " > 0 : deux racines, " + sg(Math.min(p3,q3)) + " et " + sg(Math.max(p3,q3)) + "."
        : (roots.length===1 ? "Δ = 0 : une seule racine, " + sg(p3) + "." : "Δ = " + sg(D) + " < 0 : le dénominateur ne s'annule jamais.");
      return {q:"Soit f(x) = " + rat(lin(a3,e3), den) + ". Combien la courbe de f admet-elle d'asymptotes verticales ?",
        a:String(roots.length), accept:null, choix:null,
        expl:"On cherche où le dénominateur s'annule : " + exR + (roots.length ? " Le numérateur " + lin(a3,e3) + " ne s'annule pas en " + (roots.length===2 ? "ces valeurs" : "cette valeur") + ", donc f tend vers ±∞ : une asymptote verticale par racine." : " Pas de valeur interdite, donc pas d'asymptote verticale.") + " Réponse : " + roots.length + "."};
    }
    if(t3===4){
      var v4 = R.int(1,3);
      if(v4===1){
        var k4 = R.int(2,5), b4 = R.int(1,9), c4 = R.int(1,9);
        return {q:"Calcule la limite de f(x) = √((" + poly([[k4*k4,2],[b4,0]]) + ")/(x² + " + c4 + ")) quand x tend vers +∞.",
          a:String(k4), accept:null, choix:null,
          expl:"Composée : on traite d'abord l'intérieur. (" + poly([[k4*k4,2],[b4,0]]) + ")/(x² + " + c4 + ") a la limite du quotient des termes dominants : " + (k4*k4) + "x²/x² = " + (k4*k4) + ". Puis la racine : √" + (k4*k4) + " = " + k4 + "."};
      }
      if(v4===2){
        var pr4 = R.pick([[2,1],[4,2],[-2,1],[3,1],[1,2],[6,2],[-6,3]]);
        var a4 = pr4[0], c4b = pr4[1], n4 = R.int(2,3), b4b = R.int(1,5), d4 = R.int(1,5);
        var r4 = frac(pw(a4,n4), pw(c4b,n4)), base4 = frac(a4,c4b);
        return {q:"Calcule la limite de f(x) = ((" + lin(a4,b4b) + ")/(" + lin(c4b,d4) + "))" + sup(n4) + " quand x tend vers +∞ (valeur exacte).",
          a:r4, accept:null, choix:null,
          expl:"L'intérieur tend vers le quotient des termes dominants : " + dv(mono(a4,1,true), mono(c4b,1,true)) + " = " + base4 + ". Puis on élève à la puissance " + n4 + " : (" + base4 + ")" + sup(n4) + " = " + r4 + "."};
      }
      var k5 = R.int(2,6), m5 = R.int(1,9), s5 = R.pick([1,-1]), r5 = frac(1,k5);
      return {q:"Calcule la limite de f(x) = 1/(" + k5 + " + " + m5 + "/x²) quand x tend vers " + inf(s5) + " (valeur exacte).",
        a:r5, accept:null, choix:null,
        expl:"x² → +∞ donc " + m5 + "/x² → 0, et le dénominateur tend vers " + k5 + ". Puis 1/X avec X → " + k5 + " donne 1/" + k5 + "."};
    }
    var a6 = R.pick([1,2,3,4,6,-2,-3]), d6 = R.pick([1,2,3,4,-2]), b6 = R.int(-5,5), c6 = R.int(-6,6), e6 = R.pick([1,3,5,-4]), s6 = R.pick([1,-1]);
    var r6 = frac(a6,d6);
    return {q:"Soit f(x) = (" + poly([[a6,2],[b6,1],[c6,0]]) + ")/(" + poly([[d6,2],[e6,0]]) + "). Sa courbe admet en " + inf(s6) + " une asymptote horizontale d'équation y = k. Donne k (valeur exacte).",
      a:r6, accept:null, choix:null,
      expl:"En " + inf(s6) + ", on garde les termes de plus haut degré : " + dv(mono(a6,2,true), mono(d6,2,true)) + " = " + eqIf(sg(a6) + "/" + d6, r6) + " (les x² se simplifient, le signe de x n'intervient pas). Donc lim f(x) = " + r6 + " : asymptote y = " + r6 + "."};
  }
});

// =====================================================
// ect-08 — Dérivée seconde et convexité
// =====================================================
SKILLS.push({
  id: 'p6-ect-08-convexite',
  phase: 6,
  ordre: 8,
  titre: 'Dérivée seconde et convexité',
  objectif: "Calculer f'', en déduire où une fonction est convexe ou concave, trouver ses points d'inflexion et interpréter la convexité d'un coût.",
  lecon: `<p class="lede">Deux fonctions peuvent être croissantes toutes les deux et n'avoir pourtant pas du tout la même allure : l'une accélère, l'autre ralentit. La <mark>convexité</mark> décrit cette courbure, et c'est la dérivée seconde qui la mesure.</p>
<p><strong>Dérivée seconde.</strong> f'' est la dérivée de f'. Exemple : f(x) = x³ − 6x² donne f'(x) = 3x² − 12x, puis f''(x) = 6x − 12.</p>
<p><strong>Convexe, concave.</strong> Une fonction est <strong>convexe</strong> sur un intervalle quand sa courbe est <mark>au-dessous de ses cordes</mark> (tout segment qui relie deux points de la courbe est au-dessus de la courbe) ; quand elle est dérivable, c'est la même chose que dire que la courbe est <mark>au-dessus de ses tangentes</mark>. Image : une courbe en forme de bol, comme x². Une fonction est <strong>concave</strong> dans la situation inverse (courbe au-dessus de ses cordes, au-dessous de ses tangentes), comme −x² ou √x.</p>
<div class="formule"><p>f'' ≥ 0 sur I ⇔ f' croissante sur I ⇔ f convexe sur I &nbsp;•&nbsp; f'' ≤ 0 sur I ⇔ f concave sur I</p></div>
<p><strong>Point d'inflexion.</strong> C'est un point où la courbe change de concavité : elle y traverse sa tangente. Si f'' s'annule en a <em>en changeant de signe</em>, le point (a ; f(a)) est un point d'inflexion.</p>
<p><strong>Un bonus utile.</strong> Si f est convexe sur un intervalle ouvert et que f'(a) = 0, alors f admet un <mark>minimum</mark> en a : le fond du bol.</p>
<p>Exemple complet : f(x) = x³ − 6x² + 9x + 1 sur ℝ.</p>
<div class="etapes">
<p>1. Je dérive deux fois : f'(x) = 3x² − 12x + 9, puis f''(x) = 6x − 12.</p>
<p>2. Signe de f'' : 6x − 12 &lt; 0 pour x &lt; 2, et &gt; 0 pour x &gt; 2.</p>
<p>3. Conclusion : f est concave sur ]−∞ ; 2] et convexe sur [2 ; +∞[.</p>
<p>4. f'' s'annule en 2 en changeant de signe : point d'inflexion d'abscisse 2, et f(2) = 8 − 24 + 18 + 1 = 3. Le point d'inflexion est <mark>(2 ; 3)</mark>.</p>
</div>
<p><strong>En économie.</strong> Si C(q) est le coût total de q unités, le coût marginal est Cm(q) = C'(q) : c'est le coût de « l'unité de plus ». Si le coût marginal est croissant (chaque unité supplémentaire coûte plus cher que la précédente), alors C'' = Cm' ≥ 0 : <mark>le coût total est convexe</mark>. Avec C(q) = q³ − 6q² + 15q + 20, on trouve C''(q) = 6q − 12 : C est concave sur [0 ; 2] (le coût marginal baisse, l'entreprise gagne en efficacité), puis convexe à partir de q = 2 (le coût marginal remonte). Le coût marginal est minimal en q = 2 : Cm(2) = 12 − 24 + 15 = 3.</p>
<div class="box piege"><p class="box-t">Piège</p><p>f''(a) = 0 ne suffit pas : il faut un <strong>changement de signe</strong>. Avec f(x) = x<sup>4</sup>, f''(x) = 12x² s'annule en 0 mais reste positive : pas de point d'inflexion, f est convexe sur tout ℝ.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>f'' ≥ 0 : convexe (au-dessus des tangentes, au-dessous des cordes). f'' ≤ 0 : concave. Point d'inflexion : f'' <mark>s'annule en changeant de signe</mark>. Coût marginal croissant ⇔ coût total convexe.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour un polynôme du second degré ax² + bx + c, f'' = 2a : convexe si a &gt; 0 (le « sourire »), concave si a &lt; 0. Pour un polynôme de degré 3, f'' est affine : il y a toujours exactement un point d'inflexion.</p></div>
<p>En prépa ECT : la convexité sert d'abord à tracer des courbes précises (étude graphique complète), puis à modéliser l'économie : coûts convexes, fonctions de production ou d'utilité concaves (rendements décroissants), et minimum d'une fonction convexe en un point où la dérivée s'annule.</p>`,
  gen(level, R){
    if(level===1){
      var t = R.int(1,4);
      if(t===1){
        var a = R.int(-2,3);
        if(R.int(1,2)===1){
          var c3 = R.pick([1,2,-1,3]), c2 = R.pick([-3,-2,-1,1,2,4]), c1 = R.int(-6,6), c0 = R.int(-5,5);
          var res = 6*c3*a + 2*c2;
          return {q:"Soit f(x) = " + poly([[c3,3],[c2,2],[c1,1],[c0,0]]) + ". Calcule f''(" + sg(a) + ").",
            a:sg(res), accept:null, choix:null,
            expl:"f'(x) = " + poly([[3*c3,2],[2*c2,1],[c1,0]]) + ", puis f''(x) = " + poly([[6*c3,1],[2*c2,0]]) + ". Donc f''(" + sg(a) + ") = " + sg(6*c3) + " × " + neg(a) + pm(2*c2) + " = " + sg(res) + "."};
        }
        var c4 = R.pick([1,-1,2]), d2 = R.pick([-3,-2,2,3,5]), d1 = R.int(-4,4);
        var res4 = 12*c4*a*a + 2*d2;
        return {q:"Soit f(x) = " + poly([[c4,4],[d2,2],[d1,1]]) + ". Calcule f''(" + sg(a) + ").",
          a:sg(res4), accept:null, choix:null,
          expl:"f'(x) = " + poly([[4*c4,3],[2*d2,1],[d1,0]]) + ", puis f''(x) = " + poly([[12*c4,2],[2*d2,0]]) + ". Donc f''(" + sg(a) + ") = " + sg(12*c4) + " × " + neg(a) + "²" + pm(2*d2) + " = " + sg(res4) + "."};
      }
      if(t===2){
        var CH = ["convexe sur ℝ","concave sur ℝ","convexe puis concave","concave puis convexe"];
        if(R.int(1,2)===1){
          var qa = R.pick([1,2,3,-1,-2,-3]), qb = R.int(-5,5), qc = R.int(-5,5);
          var bon = qa>0 ? CH[0] : CH[1];
          return {q:"Soit f(x) = " + poly([[qa,2],[qb,1],[qc,0]]) + ". Sur ℝ, la fonction f est :", a:bon, accept:null, choix:CH,
            expl:"f'(x) = " + poly([[2*qa,1],[qb,0]]) + " et f''(x) = " + sg(2*qa) + ", " + (qa>0 ? "positive" : "négative") + " sur tout ℝ. Donc f est " + bon + "."};
        }
        var ra = R.pick([1,2,-1,-3]), rb = R.int(-5,5);
        var bon2 = ra>0 ? CH[0] : CH[1];
        return {q:"Soit f(x) = " + poly([[ra,4],[rb,1]]) + ". Sur ℝ, la fonction f est :", a:bon2, accept:null, choix:CH,
          expl:"f''(x) = " + mono(12*ra,2,true) + ", qui est " + (ra>0 ? "positive" : "négative") + " ou nulle (seulement en 0, sans changement de signe). Donc f est " + bon2 + ", sans point d'inflexion."};
      }
      if(t===3){
        var it = R.pick([
          {q:"Une fonction f dérivable est convexe sur un intervalle I. Que peut-on dire de sa courbe sur I ?", a:"Elle est au-dessus de chacune de ses tangentes", d:["Elle est au-dessous de chacune de ses tangentes","Elle est au-dessus de chacune de ses cordes","Elle est toujours croissante"], e:"Convexe = courbe au-dessus de ses tangentes et au-dessous de ses cordes (forme de bol). Une fonction convexe peut très bien être décroissante, comme 1/x sur ]0 ; +∞[."},
          {q:"Une fonction f dérivable est concave sur un intervalle I. Que peut-on dire de sa courbe sur I ?", a:"Elle est au-dessous de chacune de ses tangentes", d:["Elle est au-dessus de chacune de ses tangentes","Elle est au-dessous de chacune de ses cordes","Elle est toujours décroissante"], e:"Concave = courbe au-dessous de ses tangentes et au-dessus de ses cordes. Une fonction concave peut être croissante, comme √x."},
          {q:"Si f''(x) ≥ 0 pour tout x d'un intervalle I, alors :", a:"f' est croissante sur I", d:["f est croissante sur I","f' est positive sur I","f est concave sur I"], e:"f'' est la dérivée de f' : f'' ≥ 0 signifie que f' est croissante, donc que f est convexe. Cela ne dit rien du signe de f' ni des variations de f."},
          {q:"Un point d'inflexion de la courbe de f est un point où :", a:"la courbe traverse sa tangente", d:["la dérivée f' s'annule","la fonction atteint un maximum","la courbe coupe l'axe des abscisses"], e:"En un point d'inflexion, la fonction passe de convexe à concave (ou l'inverse) : la courbe traverse sa tangente. On le repère quand f'' s'annule en changeant de signe."},
          {q:"Le coût marginal Cm(q) = C'(q) d'une entreprise est croissant. Que peut-on dire du coût total C ?", a:"Il est convexe", d:["Il est concave","Il est décroissant","Il est affine"], e:"Cm croissant ⇔ Cm' = C'' ≥ 0 ⇔ C convexe : chaque unité supplémentaire coûte plus cher que la précédente."}
        ]);
        return {q:it.q, a:it.a, accept:null, choix:[it.a, it.d[0], it.d[1], it.d[2]], expl:it.e};
      }
      var m = R.pick([2,3,4,6,-2,-3]), r = R.int(-3,4), p = -m*r;
      return {q:"On donne f''(x) = " + lin(m,p) + ". En quelle abscisse la courbe de f admet-elle un point d'inflexion ?",
        a:sg(r), accept:null, choix:null,
        expl:"f'' est affine : elle s'annule en " + lin(m,p) + " = 0, soit x = " + sg(r) + ", et change de signe en ce point. La courbe de f a donc un point d'inflexion d'abscisse " + sg(r) + "."};
    }

    if(level===2){
      var t2 = R.int(1,5);
      if(t2<=3){
        var a = (t2===3) ? R.pick([1,-1]) : R.pick([1,2,-1,-2]);
        var k = (t2===3) ? R.int(-2,3) : R.int(-3,4);
        var b = -3*a*k, c = R.int(-5,5), d = R.int(-5,5);
        var fx = poly([[a,3],[b,2],[c,1],[d,0]]);
        var f2 = poly([[6*a,1],[2*b,0]]);
        var exK = "f'(x) = " + poly([[3*a,2],[2*b,1],[c,0]]) + ", puis f''(x) = " + f2 + (k===0 ? "" : " = " + sg(6*a) + "(" + lin(1,-k) + ")") + ". f'' s'annule en x = " + sg(k) + " en changeant de signe.";
        if(t2===1) return {q:"Soit f(x) = " + fx + ". Donne l'abscisse du point d'inflexion de sa courbe.", a:sg(k), accept:null, choix:null, expl:exK};
        if(t2===2){
          var cA = "convexe sur [" + sg(k) + " ; +∞[", cB = "convexe sur ]−∞ ; " + sg(k) + "]";
          var bon = a>0 ? cA : cB;
          return {q:"Soit f(x) = " + fx + ". Laquelle de ces affirmations est vraie ?", a:bon, accept:null,
            choix:[cA, cB, "convexe sur ℝ", "concave sur ℝ"],
            expl:exK + " Comme " + sg(6*a) + (a>0 ? " > 0" : " < 0") + ", f'' est " + (a>0 ? "négative avant " + sg(k) + " et positive après" : "positive avant " + sg(k) + " et négative après") + " : f est " + bon + " et concave de l'autre côté."};
        }
        var yk = a*k*k*k + b*k*k + c*k + d;
        return {q:"Soit f(x) = " + fx + ". Sa courbe a un point d'inflexion. Donne son ordonnée.", a:sg(yk), accept:null, choix:null,
          expl:exK + " Ordonnée : f(" + sg(k) + ") = " + sg(a*k*k*k) + pm(b*k*k) + pm(c*k) + pm(d) + " = " + sg(yk) + "."};
      }
      if(t2===4){
        var m = R.int(1,3), e = R.int(-5,5), d4 = R.int(-5,5), pos = R.int(1,2)===1;
        return {q:"Soit f(x) = " + poly([[1,4],[-6*m*m,2],[e,1],[d4,0]]) + ". Sa courbe a deux points d'inflexion. Donne l'abscisse " + (pos ? "positive" : "négative") + " de l'un d'eux.",
          a:sg(pos ? m : -m), accept:null, choix:null,
          expl:"f'(x) = " + poly([[4,3],[-12*m*m,1],[e,0]]) + ", f''(x) = " + poly([[12,2],[-12*m*m,0]]) + " = 12(x − " + m + ")(x + " + m + "). f'' s'annule en changeant de signe en −" + m + " et en " + m + " : ce sont les deux abscisses des points d'inflexion. Réponse : " + sg(pos ? m : -m) + "."};
      }
      var k5 = R.int(2,6), c5 = 3*k5*k5 + R.int(1,10), F5 = R.pick([50,100,200]);
      return {q:"Le coût total de production de q unités (q ≥ 0) est C(q) = " + poly([[1,3],[-3*k5,2],[c5,1],[F5,0]], 'q') + ". À partir de quelle quantité q le coût total devient-il convexe ?",
        a:String(k5), accept:null, choix:null,
        expl:"Coût marginal : C'(q) = " + poly([[3,2],[-6*k5,1],[c5,0]], 'q') + ". C''(q) = " + poly([[6,1],[-6*k5,0]], 'q') + " = 6(q − " + k5 + ") : négatif pour q < " + k5 + " (C concave, le coût marginal baisse), positif pour q > " + k5 + " (C convexe, le coût marginal augmente). C devient convexe à partir de q = " + k5 + "."};
    }

    // level 3
    var t3 = R.int(1,5);
    if(t3===1){
      var kk = R.pick([1,2,3,4]), cc = R.int(-3,3), w = R.pick([1,2,-1,-2]), x0 = w - cc;
      var r = frac(2*kk, w*w*w), U = lin(1,cc), P = par(U);
      return {q:"Soit f(x) = " + kk + "/" + P + ", définie pour x ≠ " + sg(-cc) + ". Calcule f''(" + sg(x0) + ") (valeur exacte).",
        a:r, accept:null, choix:null,
        expl:"(1/u)' = −u'/u² : f'(x) = −" + kk + "/" + P + "². On dérive encore avec v = " + P + "², v' = 2" + P + " : f''(x) = −" + kk + " × (−2" + P + "/" + P + "⁴) = " + (2*kk) + "/" + P + "³. En x = " + sg(x0) + (cc===0 ? "" : ", " + U + " = " + sg(w)) + " : f''(" + sg(x0) + ") = " + (2*kk) + "/" + neg(w) + "³ = " + r + ". " + (w > 0 ? "Positif : f est convexe autour de ce point." : "Négatif : f est concave autour de ce point.")};
    }
    if(t3===2){
      var a = R.pick([1,2,3,-1,-2]), b = R.int(-4,4), c = R.int(-5,5), tg = R.int(-2,2), xs = R.int(-3,4);
      if(xs===tg) xs = tg + 2;
      var ft = a*tg*tg + b*tg + c, dt = 2*a*tg + b, fx0 = a*xs*xs + b*xs + c, Tx0 = dt*(xs - tg) + ft, gap = fx0 - Tx0;
      return {q:"Soit f(x) = " + poly([[a,2],[b,1],[c,0]]) + " et T sa tangente au point d'abscisse " + sg(tg) + ". Calcule f(" + sg(xs) + ") − T(" + sg(xs) + ").",
        a:sg(gap), accept:null, choix:null,
        expl:"f(" + sg(tg) + ") = " + sg(ft) + " et f'(x) = " + poly([[2*a,1],[b,0]]) + " donc f'(" + sg(tg) + ") = " + sg(dt) + ". T(x) = " + (dt===0 ? sg(ft) : cf(sg(dt)) + fac(tg) + (ft===0 ? '' : pm(ft))) + ", donc T(" + sg(xs) + ") = " + sg(Tx0) + ". f(" + sg(xs) + ") = " + sg(fx0) + ". Écart : " + sg(fx0) + " − " + neg(Tx0) + " = " + sg(gap) + ". Prévisible : f'' = " + sg(2*a) + (a>0 ? " > 0, f est convexe, sa courbe est au-dessus de ses tangentes (écart positif)." : " < 0, f est concave, sa courbe est au-dessous de ses tangentes (écart négatif).")};
    }
    if(t3===3){
      var p = R.int(-3,3), q = R.int(-3,4); if(q===p) q = p + 2;
      var cas = R.pick([
        {f:fac(p) + fac(q), n:2, e:"f'' est un produit de deux facteurs du premier degré : elle change de signe en " + sg(Math.min(p,q)) + " et en " + sg(Math.max(p,q)) + "."},
        {f:fac2(p) + fac(q), n:1, e:"Le facteur " + fac2(p) + " est un carré, toujours positif : il s'annule en " + sg(p) + " sans changer de signe. Seul " + fac(q) + " change de signe, en " + sg(q) + "."},
        {f:fac2(p), n:0, e:"f''(x) = " + fac2(p) + " est un carré : elle s'annule en " + sg(p) + " mais reste positive. f est convexe sur ℝ, sans point d'inflexion."},
        {f:"x² + " + R.int(1,9), n:0, e:"f''(x) est toujours strictement positive : f est convexe sur ℝ, aucun point d'inflexion."}
      ]);
      return {q:"La dérivée seconde d'une fonction f définie sur ℝ est f''(x) = " + cas.f + ". Combien la courbe de f a-t-elle de points d'inflexion ?",
        a:String(cas.n), accept:null, choix:null,
        expl:"Un point d'inflexion correspond à un changement de signe de f'', pas seulement à une annulation. " + cas.e + " Réponse : " + cas.n + "."};
    }
    if(t3===4){
      if(R.int(1,2)===1){
        var m4 = R.int(1,5), c4 = 2*m4*m4*m4, askV = R.int(1,2)===1;
        return {q:"Soit f(x) = x² + " + c4 + "/x sur ]0 ; +∞[. f est convexe et admet un minimum. " + (askV ? "Quelle est la valeur de ce minimum ?" : "En quelle valeur de x est-il atteint ?"),
          a:String(askV ? 3*m4*m4 : m4), accept:null, choix:null,
          expl:"f'(x) = 2x − " + c4 + "/x² et f''(x) = 2 + " + (2*c4) + "/x³ > 0 sur ]0 ; +∞[ : f est convexe. f'(x) = 0 ⇔ 2x³ = " + c4 + " ⇔ x³ = " + (c4/2) + " ⇔ x = " + m4 + ". Une fonction convexe dont la dérivée s'annule atteint là son minimum : f(" + m4 + ") = " + (m4*m4) + " + " + (c4/m4) + " = " + (3*m4*m4) + "."};
      }
      var ca = R.pick([1,2,5]), kq = R.pick([10,20,30]), cb = R.pick([10,20,40]), cc4 = ca*kq*kq;
      return {q:"Le coût moyen d'une production de q unités est CM(q) = " + (ca===1 ? '' : ca) + "q + " + cb + " + " + cc4 + "/q (en €), pour q > 0. Justifie qu'il est convexe, puis donne le coût moyen minimal, en €.",
        a:String(2*ca*kq + cb), accept:null, choix:null,
        expl:"CM'(q) = " + ca + " − " + cc4 + "/q² et CM''(q) = " + (2*cc4) + "/q³ > 0 : CM est convexe. CM'(q) = 0 ⇔ q² = " + (cc4/ca) + " ⇔ q = " + kq + ". Convexe et dérivée nulle : minimum en q = " + kq + ", CM(" + kq + ") = " + (ca*kq) + " + " + cb + " + " + (cc4/kq) + " = " + (2*ca*kq + cb) + " €."};
    }
    var k5 = R.int(2,6), c5 = 3*k5*k5 + R.int(1,12), F5 = R.pick([50,100,300]);
    return {q:"Le coût total de q unités est C(q) = " + poly([[1,3],[-3*k5,2],[c5,1],[F5,0]], 'q') + " (en €). Le coût marginal est Cm(q) = C'(q). Quel est le coût marginal minimal, en € ?",
      a:String(c5 - 3*k5*k5), accept:null, choix:null,
      expl:"Cm(q) = C'(q) = " + poly([[3,2],[-6*k5,1],[c5,0]], 'q') + ". Cm'(q) = C''(q) = 6q − " + (6*k5) + " s'annule en q = " + k5 + " en passant de − à + : Cm est minimal en q = " + k5 + " (c'est aussi le point d'inflexion de C, où le coût total passe de concave à convexe). Cm(" + k5 + ") = " + (3*k5*k5) + " − " + (6*k5*k5) + " + " + c5 + " = " + (c5 - 3*k5*k5) + " €."};
  }
});

// =====================================================
// ect-09 — Logarithme népérien et exponentielle
// =====================================================
var LNQ = {2:[0.0198,'1,02'], 3:[0.0296,'1,03'], 4:[0.0392,'1,04'], 5:[0.0488,'1,05'], 6:[0.0583,'1,06'], 8:[0.077,'1,08'], 10:[0.0953,'1,1'], 12:[0.1133,'1,12']};
var LND = {5:[-0.0513,'0,95'], 10:[-0.1054,'0,9'], 15:[-0.1625,'0,85'], 20:[-0.2231,'0,8'], 25:[-0.2877,'0,75'], 30:[-0.3567,'0,7']};
function rd3(x){ return fr(String(Math.round(x*1000)/1000)); }
function trunc2(x){ return fr(String(Math.floor(x*100)/100)); }

SKILLS.push({
  id: 'p6-ect-09-ln-exp',
  phase: 6,
  ordre: 9,
  titre: 'Logarithme népérien et exponentielle',
  objectif: "Manipuler ln et exp (règles de calcul, dérivées, équations, inéquations), trouver un seuil pour une suite géométrique et connaître les croissances comparées.",
  lecon: `<p class="lede">Les suites géométriques t'ont appris qu'un placement à 5 % « explose » : 1,05<sup>n</sup> grandit sans limite. Mais pour répondre à « au bout de combien d'années mon capital aura-t-il doublé ? », il faut résoudre 1,05<sup>n</sup> = 2, avec l'inconnue en exposant. L'outil qui fait <mark>descendre l'exposant</mark>, c'est le logarithme népérien.</p>
<p><strong>Le logarithme népérien.</strong> ln est la fonction définie sur ]0 ; +∞[ dont la dérivée est 1/x et qui vaut 0 en 1. Elle est strictement croissante, ln 1 = 0, ln e = 1 avec e ≈ 2,718, et ln x &lt; 0 quand 0 &lt; x &lt; 1. Ses règles de calcul (a et b strictement positifs, n entier) :</p>
<div class="formule"><p>ln(ab) = ln a + ln b &nbsp;•&nbsp; ln(a/b) = ln a − ln b &nbsp;•&nbsp; ln(1/b) = −ln b &nbsp;•&nbsp; ln(a<sup>n</sup>) = n ln a &nbsp;•&nbsp; ln √a = ½ ln a</p></div>
<p><strong>L'exponentielle.</strong> C'est la fonction réciproque de ln : pour tout réel x, e<sup>x</sup> est l'unique nombre strictement positif dont le logarithme vaut x. Donc e<sup>x</sup> &gt; 0 toujours, e<sup>0</sup> = 1, e<sup>1</sup> = e, et :</p>
<div class="formule"><p>e<sup>a+b</sup> = e<sup>a</sup> × e<sup>b</sup> &nbsp;•&nbsp; e<sup>−a</sup> = 1/e<sup>a</sup> &nbsp;•&nbsp; (e<sup>a</sup>)<sup>n</sup> = e<sup>na</sup> &nbsp;•&nbsp; e<sup>ln x</sup> = x (x &gt; 0) &nbsp;•&nbsp; ln(e<sup>x</sup>) = x</p></div>
<p><strong>Dérivées.</strong> (ln x)' = 1/x ; (e<sup>x</sup>)' = e<sup>x</sup> ; et pour une fonction u dérivable : (e<sup>u</sup>)' = u' e<sup>u</sup>, (ln u)' = u'/u (là où u &gt; 0).</p>
<p><strong>Équations et inéquations.</strong> Pour k &gt; 0 : e<sup>x</sup> = k ⇔ x = ln k (et si k ≤ 0, aucune solution). Pour tout réel k : ln x = k ⇔ x = e<sup>k</sup>. Comme ln et exp sont strictement croissantes, elles <mark>conservent l'ordre</mark> : e<sup>a</sup> ≤ e<sup>b</sup> ⇔ a ≤ b, et pour a, b &gt; 0, ln a ≤ ln b ⇔ a ≤ b.</p>
<p>Exemple complet : 1 000 € placés à 5 % par an (intérêts composés). Quand le capital aura-t-il doublé ? On donne ln 2 ≈ 0,693 et ln 1,05 ≈ 0,0488.</p>
<div class="etapes">
<p>1. Après n années, le capital vaut 1 000 × 1,05<sup>n</sup>. On veut 1 000 × 1,05<sup>n</sup> ≥ 2 000, soit 1,05<sup>n</sup> ≥ 2.</p>
<p>2. ln est croissante, j'applique ln des deux côtés : ln(1,05<sup>n</sup>) ≥ ln 2, soit n × ln 1,05 ≥ ln 2.</p>
<p>3. ln 1,05 &gt; 0 (car 1,05 &gt; 1) : je divise sans changer le sens. n ≥ ln 2/ln 1,05 ≈ 0,693/0,0488 ≈ 14,2.</p>
<p>4. n est entier : le capital aura doublé <mark>au bout de 15 ans</mark>.</p>
</div>
<p><strong>Croissances comparées.</strong> En +∞, ln x, x<sup>n</sup> et e<sup>x</sup> tendent tous vers +∞, mais pas à la même vitesse : <mark>l'exponentielle l'emporte sur toute puissance, et toute puissance l'emporte sur le logarithme</mark>.</p>
<div class="formule"><p>lim<sub>x→+∞</sub> e<sup>x</sup>/x<sup>n</sup> = +∞ &nbsp;•&nbsp; lim<sub>x→+∞</sub> x<sup>n</sup>/e<sup>x</sup> = 0 &nbsp;•&nbsp; lim<sub>x→+∞</sub> ln x/x = 0 &nbsp;•&nbsp; lim<sub>x→0<sup>+</sup></sub> x ln x = 0</p></div>
<p>À connaître aussi : ln x → −∞ quand x → 0<sup>+</sup>, ln x → +∞ en +∞ ; e<sup>x</sup> → 0 en −∞ et +∞ en +∞.</p>
<div class="box piege"><p class="box-t">Piège</p><p>Quand q est entre 0 et 1, ln q est <strong>négatif</strong> : diviser par ln q <mark>change le sens</mark> de l'inégalité. 0,9<sup>n</sup> ≤ 0,5 ⇔ n ln 0,9 ≤ ln 0,5 ⇔ n ≥ ln 0,5/ln 0,9 ≈ 6,58, donc n = 7. Et attention : ln(a + b) n'est pas égal à ln a + ln b.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>ln transforme les produits en sommes et fait descendre les exposants : ln(a<sup>n</sup>) = n ln a. e<sup>x</sup> = k ⇔ x = ln k ; ln x = k ⇔ x = e<sup>k</sup>. (ln u)' = u'/u, (e<sup>u</sup>)' = u'e<sup>u</sup>. Seuil d'une suite géométrique : q<sup>n</sup> ≥ s ⇔ n ≥ ln s/ln q si q &gt; 1.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour vérifier un seuil, calcule q<sup>n</sup> pour la valeur trouvée et la précédente : avec n = 15 et n = 14, 1,05<sup>15</sup> ≈ 2,08 dépasse 2 alors que 1,05<sup>14</sup> ≈ 1,98 non. Tu es sûr de ta réponse.</p></div>
<p>En prépa ECT : ln et exp sont partout aux concours : intérêts composés et actualisation, croissance d'une population, études de fonctions du type x e<sup>−x</sup> ou ln x/x, et en 2e année la loi exponentielle en probabilités.</p>`,
  gen(level, R){
    if(level===1){
      var t = R.int(1,4);
      if(t===1){
        var bs = R.pick([[2,6],[3,4],[5,3]]), b = bs[0], n = R.int(2,bs[1]), v = R.int(1,5);
        if(v===1) return {q:"On écrit ln(√" + b + ") = k × ln " + b + ". Donne k (valeur exacte).", a:"1/2", accept:null, choix:null,
          expl:"√" + b + " = " + b + "^(1/2), donc ln √" + b + " = ½ ln " + b + " : k = 1/2."};
        if(v===2) return {q:"On écrit ln(1/" + pw(b,n) + ") = k × ln " + b + ". Donne k.", a:sg(-n), accept:null, choix:null,
          expl:"1/" + pw(b,n) + " = 1/" + b + sup(n) + ", et ln(1/a) = −ln a : ln(1/" + pw(b,n) + ") = −ln(" + b + sup(n) + ") = −" + n + " ln " + b + ". Donc k = −" + n + "."};
        return {q:"On écrit ln " + pw(b,n) + " = k × ln " + b + ". Donne k.", a:String(n), accept:null, choix:null,
          expl:pw(b,n) + " = " + b + sup(n) + ", et ln(aⁿ) = n ln a : ln " + pw(b,n) + " = " + n + " ln " + b + ". Donc k = " + n + "."};
      }
      if(t===2){
        var k = R.int(2,9), it = R.pick([
          {q:"ln(" + eP(k) + ")", a:String(k), e:"ln(eˣ) = x : ln(" + eP(k) + ") = " + k + "."},
          {q:"e^(ln " + k + ")", a:String(k), e:"e^(ln x) = x pour x > 0 : e^(ln " + k + ") = " + k + "."},
          {q:"ln(1/" + eP(k) + ")", a:sg(-k), e:"ln(1/a) = −ln a : ln(1/" + eP(k) + ") = −ln(" + eP(k) + ") = −" + k + "."},
          {q:"ln(√e)", a:"1/2", e:"√e = e^(1/2), donc ln √e = ½ ln e = 1/2."},
          {q:"ln 1 + ln e", a:"1", e:"ln 1 = 0 et ln e = 1 : la somme vaut 1."},
          {q:"e⁰ − ln e", a:"0", e:"e⁰ = 1 et ln e = 1 : 1 − 1 = 0."}
        ]);
        return {q:"Calcule la valeur exacte de " + it.q + ".", a:it.a, accept:null, choix:null, expl:it.e};
      }
      if(t===3){
        var v3 = R.int(1,3);
        if(v3===1){
          var a = R.int(1,6), c = R.int(1,4), b = R.int(-3,3);
          var r = frac(a + b*c, c);
          return {q:"Soit f(x) = " + (a===1 ? '' : a + " ") + "ln x" + (b===0 ? '' : mono(b,1,false)) + " sur ]0 ; +∞[. Calcule f'(" + c + ") (valeur exacte).", a:r, accept:null, choix:null,
            expl:"(ln x)' = 1/x, donc f'(x) = " + a + "/x" + (b===0 ? '' : pm(b)) + ". f'(" + c + ") = " + a + "/" + c + (b===0 ? '' : pm(b)) + " = " + r + "."};
        }
        if(v3===2){
          var a2 = R.pick([2,3,4,5,-2,-3]), b2 = R.int(-4,4);
          return {q:"Soit f(x) = " + (a2<0 ? "−" : "") + Math.abs(a2) + "eˣ" + (b2===0 ? '' : mono(b2,2,false)) + ". Calcule f'(0).", a:sg(a2), accept:null, choix:null,
            expl:"(eˣ)' = eˣ" + (b2===0 ? "" : " et (x²)' = 2x") + " : f'(x) = " + sg(a2) + "eˣ" + (b2===0 ? '' : mono(2*b2,1,false)) + ". f'(0) = " + sg(a2) + " × e⁰" + (b2===0 ? '' : pm(2*b2) + " × 0") + " = " + sg(a2) + " (car e⁰ = 1)."};
        }
        var a3 = R.int(1,9), c3 = R.int(1,4), r3 = frac(2*c3*c3 - a3, c3);
        return {q:"Soit f(x) = x² − " + (a3===1 ? '' : a3 + " ") + "ln x sur ]0 ; +∞[. Calcule f'(" + c3 + ") (valeur exacte).", a:r3, accept:null, choix:null,
          expl:"f'(x) = 2x − " + a3 + "/x. f'(" + c3 + ") = " + (2*c3) + " − " + a3 + "/" + c3 + " = " + r3 + "."};
      }
      var v4 = R.int(1,3);
      if(v4===1){
        var a4 = R.pick([1,2,3,4,-2]), b4 = R.pick([-6,-4,-3,-2,2,3,5]), r4 = frac(-b4, a4);
        return {q:"Résous l'équation e^(" + lin(a4,b4) + ") = 1 (valeur exacte).", a:r4, accept:null, choix:null,
          expl:"e^X = 1 ⇔ X = 0 (car e⁰ = 1 et exp est strictement croissante). " + lin(a4,b4) + " = 0 ⇔ x = " + r4 + "."};
      }
      if(v4===2){
        var a5 = R.pick([1,2,3,4]), b5 = R.pick([-5,-3,-1,2,3,4,5]), r5 = frac(1 - b5, a5);
        return {q:"Résous l'équation ln(" + lin(a5,b5) + ") = 0 (valeur exacte).", a:r5, accept:null, choix:null,
          expl:"ln X = 0 ⇔ X = 1. Donc " + lin(a5,b5) + " = 1 ⇔ x = " + r5 + ". (On a bien " + lin(a5,b5) + " = 1 > 0 : la solution est valable.)"};
      }
      var k6 = R.int(1,9), a6 = R.int(2,4);
      return {q:"Résous l'équation e^(" + a6 + "x) = e^(x + " + (k6*(a6-1)) + ").", a:String(k6), accept:null, choix:null,
        expl:"exp est strictement croissante donc e^A = e^B ⇔ A = B : " + a6 + "x = x + " + (k6*(a6-1)) + (a6===2 ? "" : " ⇔ " + (a6-1) + "x = " + (k6*(a6-1))) + " ⇔ x = " + k6 + "."};
    }

    if(level===2){
      var t2 = R.int(1,5);
      if(t2===1){
        var bases = R.pick([[2,3],[3,2],[2,5]]), p = bases[0], o = bases[1];
        var a = R.int(0,3), b = R.int(1,3), c = R.int(1,2), d = R.int(0,2);
        if(a===d) a = a + 1;
        if(a + b - d < 1) b = b + (1 - (a + b - d));
        var X = pw(p,a)*pw(o,c), Y = pw(p,b), Z = pw(o,c)*pw(p,d), k = a + b - d;
        return {q:"On pose A = ln " + X + " + ln " + Y + " − ln " + Z + ". On écrit A = k × ln " + p + ". Donne k.",
          a:sg(k), accept:null, choix:null,
          expl:"ln a + ln b − ln c = ln(a × b/c) : A = ln(" + X + " × " + Y + "/" + Z + ") = ln " + (X*Y/Z) + ". Or " + (X*Y/Z) + " = " + (k===1 ? p : p + sup(k)) + " (les facteurs " + o + " se simplifient), donc A = " + (k===1 ? "" : k + " ") + "ln " + p + " : k = " + k + "."};
      }
      if(t2===2){
        var v = R.int(1,4);
        if(v===1){
          var a1 = R.pick([2,3,-1,5,-2]), r1 = R.int(-2,3), b1 = -a1*r1;
          return {q:"Soit f(x) = e^(" + lin(a1,b1) + "). Calcule f'(" + sg(r1) + ").", a:sg(a1), accept:null, choix:null,
            expl:"(e^u)' = u'e^u avec u = " + lin(a1,b1) + " et u' = " + sg(a1) + " : f'(x) = " + sg(a1) + "e^(" + lin(a1,b1) + "). En x = " + sg(r1) + ", l'exposant vaut 0 : f'(" + sg(r1) + ") = " + sg(a1) + " × e⁰ = " + sg(a1) + "."};
        }
        if(v===2){
          var a2 = R.int(1,3), b2 = R.int(1,5), x2 = R.int(0,3), r2 = frac(a2, a2*x2 + b2);
          return {q:"Soit f(x) = ln(" + lin(a2,b2) + "), pour x > " + frac(-b2,a2) + ". Calcule f'(" + x2 + ") (valeur exacte).", a:r2, accept:null, choix:null,
            expl:"(ln u)' = u'/u avec u = " + lin(a2,b2) + " et u' = " + a2 + " : f'(x) = " + a2 + "/(" + lin(a2,b2) + "). f'(" + x2 + ") = " + eqIf(a2 + "/" + (a2*x2 + b2), r2) + "."};
        }
        if(v===3){
          var c3 = R.pick([-4,-3,-2,-1,1,2,3,4]);
          return {q:"Soit f(x) = (" + lin(1,c3) + ")eˣ. Calcule f'(0).", a:sg(c3 + 1), accept:null, choix:null,
            expl:"Produit : (uv)' = u'v + uv' avec u = " + lin(1,c3) + ", v = eˣ : f'(x) = 1 × eˣ + (" + lin(1,c3) + ")eˣ = (" + lin(1,c3+1) + ")eˣ. f'(0) = " + sg(c3 + 1) + " × e⁰ = " + sg(c3 + 1) + "."};
        }
        var c4 = R.int(1,5), x4 = R.int(1,3), r4 = frac(2*x4, x4*x4 + c4);
        return {q:"Soit f(x) = ln(x² + " + c4 + "). Calcule f'(" + x4 + ") (valeur exacte).", a:r4, accept:null, choix:null,
          expl:"(ln u)' = u'/u avec u = x² + " + c4 + " (toujours > 0) et u' = 2x : f'(x) = 2x/(x² + " + c4 + "). f'(" + x4 + ") = " + (2*x4) + "/" + (x4*x4 + c4) + " = " + r4 + "."};
      }
      if(t2===3){
        var tx = R.pick([2,3,4,5,6,8,10,12]), si = R.int(0,2);
        // couples écartés : quotient trop proche d'un entier (2 % et 8 % pour doubler, 4 % pour tripler)
        if((tx===2 || tx===8) && si===0) si = 1;
        if(tx===4 && si===1) si = 0;
        var sm = [[2,'doublé','0,6931',0.6931],[3,'triplé','1,0986',1.0986],[1.5,'augmenté de 50 %','0,4055',0.4055]][si];
        var lq = LNQ[tx], ratio = sm[3]/lq[0], n = Math.ceil(Math.log(sm[0])/Math.log(1 + tx/100) - 1e-12);
        var ctx = R.pick([
          "Un capital de " + R.pick([1000,2000,5000]) + " € est placé à " + tx + " % par an, à intérêts composés. Au bout de combien d'années aura-t-il " + sm[1] + " ?",
          "Le nombre d'abonnés d'une plateforme augmente de " + tx + " % par an. Au bout de combien d'années aura-t-il " + sm[1] + " ?"
        ]);
        return {q:ctx + " On donne ln " + fr(sm[0]) + " ≈ " + sm[2] + " et ln " + lq[1] + " ≈ " + fr(lq[0]) + ".",
          a:String(n), accept:null, choix:null,
          expl:"Après n années, on a multiplié par " + lq[1] + "ⁿ. On veut " + lq[1] + "ⁿ ≥ " + fr(sm[0]) + " ⇔ n × ln " + lq[1] + " ≥ ln " + fr(sm[0]) + " ⇔ n ≥ ln " + fr(sm[0]) + "/ln " + lq[1] + " (ln " + lq[1] + " > 0, le sens ne change pas). " + sm[2] + "/" + fr(lq[0]) + " ≈ " + trunc2(ratio) + ", donc n = " + n + " années. Vérification : " + lq[1] + sup(n-1) + " ≈ " + rd3(Math.pow(1 + tx/100, n-1)) + " et " + lq[1] + sup(n) + " ≈ " + rd3(Math.pow(1 + tx/100, n)) + "."};
      }
      if(t2===4){
        var k = R.int(2,9), a = R.int(1,9), b = R.int(1,9), it = R.pick([
          {q:"e^(2 ln " + k + ")", a:String(k*k), e:"e^(2 ln " + k + ") = e^(ln " + k + "²) = " + k + "² = " + (k*k) + "."},
          {q:"e^(ln " + a + " + ln " + b + ")", a:String(a*b), e:"ln " + a + " + ln " + b + " = ln(" + a + " × " + b + ") = ln " + (a*b) + ", donc e^(ln " + (a*b) + ") = " + (a*b) + "."},
          {q:"ln(" + eP(a) + " × " + eP(b) + ")", a:String(a + b), e:eP(a) + " × " + eP(b) + " = e^(" + a + " + " + b + ") = " + eP(a+b) + ", donc ln(" + eP(a+b) + ") = " + (a + b) + "."},
          {q:"e^(−ln " + k + ")", a:"1/" + k, e:"e^(−ln " + k + ") = 1/e^(ln " + k + ") = 1/" + k + "."},
          {q:"ln(" + eP(a) + "/" + eP(b) + ")", a:sg(a - b), e:"ln(eᵃ/eᵇ) = a − b : ici " + a + " − " + b + " = " + sg(a - b) + "."}
        ]);
        return {q:"Calcule la valeur exacte de " + it.q + ".", a:it.a, accept:null, choix:null, expl:it.e};
      }
      if(R.int(1,2)===1){
        var a5 = R.int(2,4), b5 = R.int(1,4), k5 = R.pick([2,3,5,7]);
        var bon = "x = (ln " + k5 + " − " + b5 + ")/" + a5;
        return {q:"Quelle est la solution de l'équation e^(" + lin(a5,b5) + ") = " + k5 + " ?", a:bon, accept:null,
          choix:[bon, "x = (ln " + k5 + " + " + b5 + ")/" + a5, "x = (" + eP(k5) + " − " + b5 + ")/" + a5, "x = ln " + k5 + "/" + a5 + " − " + b5],
          expl:"e^X = " + k5 + " ⇔ X = ln " + k5 + ". Donc " + lin(a5,b5) + " = ln " + k5 + " ⇔ " + a5 + "x = ln " + k5 + " − " + b5 + " ⇔ " + bon + "."};
      }
      var a6 = R.int(2,4), b6 = R.int(1,4), k6 = R.int(1,3);
      var bon6 = "x = (" + eP(k6) + " − " + b6 + ")/" + a6;
      return {q:"Quelle est la solution de l'équation ln(" + lin(a6,b6) + ") = " + k6 + " ?", a:bon6, accept:null,
        choix:[bon6, "x = (ln " + k6 + " − " + b6 + ")/" + a6, "x = (" + eP(k6) + " + " + b6 + ")/" + a6, "x = " + eP(k6) + "/" + a6 + " − " + b6],
        expl:"ln X = " + k6 + " ⇔ X = " + eP(k6) + ". Donc " + lin(a6,b6) + " = " + eP(k6) + " ⇔ " + bon6 + " (et " + lin(a6,b6) + " = " + eP(k6) + " > 0 : solution valable)."};
    }

    // level 3
    var t3 = R.int(1,5);
    if(t3===1){
      var n = R.int(2,5), it = R.pick([
        {q:"lim eˣ/" + xp(n) + " quand x → +∞", a:'+∞', e:"Croissances comparées : l'exponentielle l'emporte sur toute puissance, eˣ/" + xp(n) + " → +∞."},
        {q:"lim " + xp(n) + "/eˣ quand x → +∞", a:'0', e:"C'est l'inverse de eˣ/" + xp(n) + " qui tend vers +∞ : " + xp(n) + "/eˣ → 0."},
        {q:"lim " + xp(n) + "e^(−x) quand x → +∞", a:'0', e:xp(n) + "e^(−x) = " + xp(n) + "/eˣ : l'exponentielle l'emporte, la limite est 0."},
        {q:"lim (ln x)/x quand x → +∞", a:'0', e:"Croissances comparées : x l'emporte sur ln x, donc (ln x)/x → 0."},
        {q:"lim x/(ln x) quand x → +∞", a:'+∞', e:"C'est l'inverse de (ln x)/x, qui tend vers 0 en restant positif : x/ln x → +∞."},
        {q:"lim x ln x quand x → 0⁺", a:'0', e:"Forme « 0 × (−∞) », levée par les croissances comparées : x ln x → 0 quand x → 0⁺."},
        {q:"lim (eˣ − " + xp(n) + ") quand x → +∞", a:'+∞', e:"Forme « ∞ − ∞ ». On factorise : eˣ(1 − " + xp(n) + "/eˣ). La parenthèse tend vers 1 et eˣ → +∞ : limite +∞."},
        {q:"lim (ln x − x) quand x → +∞", a:'−∞', e:"Forme « ∞ − ∞ ». On factorise : x((ln x)/x − 1). La parenthèse tend vers −1 et x → +∞ : limite −∞."},
        {q:"lim x eˣ quand x → −∞", a:'0', e:"Forme « (−∞) × 0 ». Croissances comparées : l'exponentielle l'emporte, x eˣ → 0 en −∞."},
        {q:"lim ln x quand x → 0⁺", a:'−∞', e:"Limite de référence : ln x → −∞ quand x → 0⁺ (asymptote verticale x = 0)."}
      ]);
      return {q:"Que vaut " + it.q + " ?", a:it.a, accept:null, choix:['+∞','−∞','0','1'], expl:it.e};
    }
    if(t3===2){
      var tl = R.pick([5,10,15,20,25,30]), ti = R.int(0,2);
      // couples écartés : quotient trop proche d'un entier
      if(tl===5 && ti===1) ti = 0;
      if(tl===25 && ti===2) ti = 1;
      var tg = [[0.5,'la moitié','0,5','−0,6931',-0.6931],[0.25,'le quart','0,25','−1,3863',-1.3863],[0.1,'le dixième','0,1','−2,3026',-2.3026]][ti];
      var lq = LND[tl], ratio = tg[4]/lq[0], n = Math.ceil(Math.log(tg[0])/Math.log(1 - tl/100) - 1e-12);
      var machine = R.int(1,2)===1, unite = machine ? 'années' : 'mois';
      var qd = machine
        ? "Une machine perd " + tl + " % de sa valeur chaque année. Au bout de combien d'années sa valeur sera-t-elle au plus égale " + (ti===0 ? "à la moitié" : (ti===1 ? "au quart" : "au dixième")) + " de sa valeur d'achat ?"
        : "Le stock d'un produit en fin de série diminue de " + tl + " % chaque mois. Au bout de combien de mois le stock restant sera-t-il au plus égal " + (ti===0 ? "à la moitié" : (ti===1 ? "au quart" : "au dixième")) + " du stock de départ ?";
      return {q:qd + " On donne ln " + tg[2] + " ≈ " + tg[3] + " et ln " + lq[1] + " ≈ " + fr(lq[0]) + ".",
        a:String(n), accept:null, choix:null,
        expl:"On multiplie par " + lq[1] + " à chaque période. On veut " + lq[1] + "ⁿ ≤ " + tg[2] + " ⇔ n ln " + lq[1] + " ≤ ln " + tg[2] + ". Attention : ln " + lq[1] + " < 0, diviser par ce nombre CHANGE le sens : n ≥ ln " + tg[2] + "/ln " + lq[1] + " ≈ " + tg[3] + "/(" + fr(lq[0]) + ") ≈ " + trunc2(ratio) + ". Donc n = " + n + " " + unite + ". Vérification : " + lq[1] + sup(n-1) + " ≈ " + rd3(Math.pow(1 - tl/100, n-1)) + " et " + lq[1] + sup(n) + " ≈ " + rd3(Math.pow(1 - tl/100, n)) + "."};
    }
    if(t3===3){
      var A = R.pick([-3,-2,-1,1,2,3]), c = (A<0) ? R.int(4,6) : R.int(1,3), a = c + A, r = R.pick([-4,-3,-2,-1,1,2,3,4]), b = R.int(-3,3), d = b + A*r;
      var le = R.int(1,2)===1, opS = le ? '≤' : '≥';
      var xle = (A>0) === le;   // vrai : x ≤ r
      var cA = "]−∞ ; " + sg(r) + "]", cB = "[" + sg(r) + " ; +∞[", cC = "]−∞ ; " + sg(-r) + "]", cD = "[" + sg(-r) + " ; +∞[";
      var bon = xle ? cA : cB;
      return {q:"Quel est l'ensemble des solutions de l'inéquation e^(" + lin(a,b) + ") " + opS + " e^(" + lin(c,d) + ") ?", a:bon, accept:null,
        choix:[cA, cB, cC, cD],
        expl:"exp est strictement croissante, elle conserve l'ordre : " + lin(a,b) + " " + opS + " " + lin(c,d) + " ⇔ " + mono(A,1,true) + " " + opS + " " + sg(d - b) + (A<0 ? ". On divise par " + sg(A) + " < 0 : le sens change, " : " ⇔ ") + "x " + (xle ? '≤' : '≥') + " " + sg(r) + ". Solutions : " + bon + "."};
    }
    if(t3===4){
      var v = R.int(1,5);
      if(v===1){
        var c1 = R.int(1,5), x1 = R.int(1,3), r1 = frac(2*x1, x1*x1 + c1);
        return {q:"Soit f(x) = ln(x² + " + c1 + "). Calcule f'(" + x1 + ") (valeur exacte).", a:r1, accept:null, choix:null,
          expl:"(ln u)' = u'/u avec u = x² + " + c1 + ", u' = 2x : f'(" + x1 + ") = " + (2*x1) + "/" + (x1*x1 + c1) + " = " + r1 + "."};
      }
      if(v===2){
        var m = R.int(1,4);
        return {q:"Soit f(x) = e^(x² − " + (m*m) + "). Calcule f'(" + m + ").", a:String(2*m), accept:null, choix:null,
          expl:"(e^u)' = u'e^u avec u = x² − " + (m*m) + ", u' = 2x : f'(x) = 2x e^(x² − " + (m*m) + "). En x = " + m + ", l'exposant vaut 0 : f'(" + m + ") = " + (2*m) + " × e⁰ = " + (2*m) + "."};
      }
      if(v===3){
        var k = R.int(1,5);
        return {q:"Soit f(x) = x ln x − x sur ]0 ; +∞[. Calcule f'(" + eP(k) + ").", a:String(k), accept:null, choix:null,
          expl:"(x ln x)' = 1 × ln x + x × 1/x = ln x + 1 (produit). Donc f'(x) = ln x + 1 − 1 = ln x, et f'(" + eP(k) + ") = ln(" + eP(k) + ") = " + k + "."};
      }
      if(v===4){
        return {q:"Soit f(x) = (ln x)/x sur ]0 ; +∞[. En quelle valeur de x la fonction f atteint-elle son maximum ?", a:"e", accept:null,
          choix:["e","1","0","1/e"],
          expl:"Quotient : f'(x) = [(1/x) × x − ln x × 1]/x² = (1 − ln x)/x². x² > 0, donc f' a le signe de 1 − ln x : positif si ln x < 1, c'est-à-dire x < e, négatif si x > e. Maximum en x = e (il vaut 1/e)."};
      }
      var k5 = R.pick([-2,-1,1,2,3,4,5]);
      return {q:"Soit f(x) = (" + lin(1,-k5) + ")eˣ sur ℝ. En quelle valeur de x f admet-elle un minimum ?", a:sg(k5 - 1), accept:null, choix:null,
        expl:"Produit : f'(x) = 1 × eˣ + (" + lin(1,-k5) + ")eˣ = (" + lin(1,1-k5) + ")eˣ. Comme eˣ > 0, f' a le signe de " + lin(1,1-k5) + " : négatif avant " + sg(k5 - 1) + ", positif après. Minimum en x = " + sg(k5 - 1) + "."};
    }
    var r5 = R.int(1,6), k5b = R.int(1,5), m5 = r5*(r5 + k5b);
    return {q:"Résous l'équation ln x + ln(x + " + k5b + ") = ln " + m5 + " sur ]0 ; +∞[.", a:String(r5), accept:null, choix:null,
      expl:"Pour x > 0 : ln x + ln(x + " + k5b + ") = ln(x(x + " + k5b + ")). L'équation devient x(x + " + k5b + ") = " + m5 + ", soit " + poly([[1,2],[k5b,1],[-m5,0]]) + " = 0. Δ = " + (k5b*k5b) + " + " + (4*m5) + " = " + (k5b*k5b + 4*m5) + " = " + (2*r5 + k5b) + "². Racines : " + r5 + " et " + sg(-r5 - k5b) + ". Seule " + r5 + " est positive : x = " + r5 + "."};
  }
});

// =====================================================
// ect-10 — Primitives et intégrales
// =====================================================
function lnParts(i,j){
  var t = [];
  if(j>1) t.push("ln " + pw(2,j) + " = ln(2" + sup(j) + ") = " + j + " ln 2");
  if(i===0) t.push("ln 1 = 0");
  if(i>1) t.push("ln " + pw(2,i) + " = " + i + " ln 2");
  return t.join(" et ");
}
function integ(a,b){ return "∫ de " + sg(a) + " à " + sg(b); }

SKILLS.push({
  id: 'p6-ect-10-integrales',
  phase: 6,
  ordre: 10,
  titre: 'Primitives et intégrales',
  objectif: "Trouver une primitive avec le tableau usuel, calculer une intégrale sur un segment, utiliser Chasles et la linéarité, interpréter une aire et une valeur moyenne.",
  lecon: `<p class="lede">Dériver, c'est passer d'une quantité à sa vitesse de variation. Intégrer, c'est faire le chemin inverse : retrouver la quantité totale à partir de sa variation, par exemple le coût total à partir du coût marginal. Et, en prime, c'est la façon de calculer une <mark>aire</mark>.</p>
<p><strong>Primitive.</strong> F est une primitive de f sur un intervalle I si F' = f sur I. Exemple : x³ est une primitive de 3x², mais x³ + 7 aussi. Toutes les primitives de f s'écrivent F + c, où c est une constante.</p>
<table>
<tr><th>f(x)</th><th>une primitive F(x)</th><th>condition</th></tr>
<tr><td>x<sup>n</sup> (n entier ≥ 0)</td><td>x<sup>n+1</sup>/(n + 1)</td><td>x réel</td></tr>
<tr><td>1/x</td><td>ln x</td><td>x &gt; 0</td></tr>
<tr><td>e<sup>x</sup></td><td>e<sup>x</sup></td><td>x réel</td></tr>
<tr><td>e<sup>ax+b</sup> (a ≠ 0)</td><td>(1/a) e<sup>ax+b</sup></td><td>x réel</td></tr>
<tr><td>u'/u</td><td>ln u</td><td>u &gt; 0</td></tr>
<tr><td>u' e<sup>u</sup></td><td>e<sup>u</sup></td><td>u dérivable</td></tr>
</table>
<p><strong>Intégrale sur un segment.</strong> Si F est une primitive de f sur [a ; b] :</p>
<div class="formule"><p>∫<sub>a</sub><sup>b</sup> f(x) dx = [F(x)]<sub>a</sub><sup>b</sup> = F(b) − F(a)</p></div>
<p>Le résultat ne dépend pas de la primitive choisie : la constante c disparaît dans la soustraction.</p>
<p><strong>Propriétés.</strong> Linéarité : ∫(αf + βg) = α∫f + β∫g. Relation de Chasles : ∫<sub>a</sub><sup>b</sup> f + ∫<sub>b</sub><sup>c</sup> f = ∫<sub>a</sub><sup>c</sup> f. Et ∫<sub>a</sub><sup>a</sup> f = 0, ∫<sub>b</sub><sup>a</sup> f = −∫<sub>a</sub><sup>b</sup> f.</p>
<p><strong>Aire.</strong> Si f est <mark>positive</mark> sur [a ; b] (avec a &lt; b), ∫<sub>a</sub><sup>b</sup> f(x) dx est l'aire, en unités d'aire, du domaine compris entre la courbe, l'axe des abscisses et les droites x = a et x = b. Si f est négative, l'intégrale est négative et l'aire vaut son opposé : quand f change de signe, on découpe avec Chasles.</p>
<p><strong>Valeur moyenne.</strong> μ = (1/(b − a)) × ∫<sub>a</sub><sup>b</sup> f(x) dx : c'est la hauteur du rectangle de base [a ; b] qui a la même aire que le domaine sous la courbe.</p>
<p>Exemple complet : calculons I = ∫<sub>1</sub><sup>3</sup> (3x² − 2x + 1) dx.</p>
<div class="etapes">
<p>1. Une primitive, terme à terme : F(x) = x³ − x² + x (vérification : F'(x) = 3x² − 2x + 1).</p>
<p>2. F(3) = 27 − 9 + 3 = 21.</p>
<p>3. F(1) = 1 − 1 + 1 = 1.</p>
<p>4. I = F(3) − F(1) = 21 − 1 = <mark>20</mark>. La fonction est positive sur [1 ; 3] : l'aire sous la courbe vaut 20 unités d'aire.</p>
</div>
<p><strong>En économie.</strong> Si le coût marginal est Cm(q) = 2q + 10 (en € par unité), le coût de production des unités entre q = 10 et q = 20 est ∫<sub>10</sub><sup>20</sup> (2q + 10) dq = [q² + 10q]<sub>10</sub><sup>20</sup> = 600 − 200 = 400 €.</p>
<div class="box piege"><p class="box-t">Piège</p><p>C'est F(b) − F(a), « borne du haut moins borne du bas », pas l'inverse. Et une primitive de e<sup>3x</sup> est (1/3)e<sup>3x</sup>, pas 3e<sup>3x</sup> (qui est sa dérivée) : on <strong>divise</strong> par a.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>F' = f. ∫<sub>a</sub><sup>b</sup> f = F(b) − F(a). Linéarité et Chasles permettent de découper. Pour f ≥ 0, l'intégrale est une <mark>aire</mark>. Valeur moyenne : intégrale divisée par la longueur b − a.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Vérifie toujours une primitive en la dérivant : si tu retombes sur f, c'est gagné. En 1re année, pas d'intégration par parties ni de changement de variable : il suffit de reconnaître une forme du tableau (u'/u, u'e<sup>u</sup>, e<sup>ax+b</sup>…).</p></div>
<p>En prépa ECT : l'intégrale calcule des aires et des valeurs moyennes, puis sert à définir les lois de probabilité « à densité » (loi uniforme dès la 1re année, loi exponentielle et loi normale ensuite), où une probabilité est une aire sous une courbe.</p>`,
  gen(level, R){
    if(level===1){
      var t = R.int(1,4);
      if(t===1){
        var a = R.int(1,3), b = R.pick([1,2,3,-1,-2]), c = R.int(1,5);
        var f = poly([[3*a,2],[2*b,1],[c,0]]), bon = poly([[a,3],[b,2],[c,1]]);
        return {q:"Quelle est une primitive de f(x) = " + f + " ?", a:bon, accept:null,
          choix:[bon, poly([[6*a,1],[2*b,0]]), poly([[3*a,3],[2*b,2],[c,1]]), poly([[a,3],[b,2],[c,0]])],
          expl:"Une primitive de xⁿ est xⁿ⁺¹/(n + 1) : " + (3*a) + "x² donne " + (3*a) + " × x³/3 = " + mono(a,3,true) + ", " + mono(2*b,1,true) + " donne " + sg(2*b) + " × x²/2 = " + mono(b,2,true) + ", et " + c + " donne " + mono(c,1,true) + ". F(x) = " + bon + ". Vérification : F'(x) = " + f + "."};
      }
      if(t===2){
        var m = R.pick([2,4,6,-2]), k = R.int(-3,5), p = R.int(0,3), q = p + R.int(1,3);
        var h = m/2, Fq = h*q*q + k*q, Fp = h*p*p + k*p;
        return {q:"Calcule I = " + integ(p,q) + " de (" + lin(m,k) + ") dx.", a:sg(Fq - Fp), accept:null, choix:null,
          expl:"Une primitive : F(x) = " + poly([[h,2],[k,1]]) + ". I = F(" + q + ") − F(" + p + ") = " + sg(Fq) + " − " + neg(Fp) + " = " + sg(Fq - Fp) + "."};
      }
      if(t===3){
        if(R.int(1,2)===1){
          var bb = R.int(1,4);
          return {q:"Calcule I = " + integ(0,bb) + " de 3x² dx.", a:String(bb*bb*bb), accept:null, choix:null,
            expl:"Une primitive de 3x² est x³. I = " + bb + "³ − 0³ = " + (bb*bb*bb) + "."};
        }
        var p3 = R.int(-1,2), q3 = p3 + R.int(1,3), r3 = frac(q3*q3*q3 - p3*p3*p3, 3);
        return {q:"Calcule I = " + integ(p3,q3) + " de x² dx (valeur exacte).", a:r3, accept:null, choix:null,
          expl:"Une primitive de x² est x³/3. I = " + q3 + "³/3 − " + neg(p3) + "³/3 = (" + (q3*q3*q3) + " − " + neg(p3*p3*p3) + ")/3 = " + eqIf((q3*q3*q3 - p3*p3*p3) + "/3", r3) + "."};
      }
      var a4 = R.int(-2,1), b4 = a4 + R.int(1,3), c4 = b4 + R.int(1,3), A = R.pick([-5,-3,-2,2,3,4,6,7]), B = R.pick([-4,-1,1,2,5,8]), v = R.int(1,4);
      if(v===1) return {q:"On sait que " + integ(a4,b4) + " de f(x) dx = " + sg(A) + " et " + integ(b4,c4) + " de f(x) dx = " + sg(B) + ". Calcule " + integ(a4,c4) + " de f(x) dx.",
        a:sg(A + B), accept:null, choix:null, expl:"Relation de Chasles : " + integ(a4,c4) + " = " + integ(a4,b4) + " + " + integ(b4,c4) + " = " + sg(A) + " + " + neg(B) + " = " + sg(A + B) + "."};
      if(v===2){
        var al = R.pick([2,3,-1]), be = R.pick([1,2,-2]);
        return {q:"On sait que " + integ(a4,b4) + " de f(x) dx = " + sg(A) + " et " + integ(a4,b4) + " de g(x) dx = " + sg(B) + ". Calcule " + integ(a4,b4) + " de (" + (al===-1 ? "−" : al) + "f(x) " + (be<0 ? "− " + Math.abs(be) : "+ " + (be===1 ? "" : be)) + "g(x)) dx.",
          a:sg(al*A + be*B), accept:null, choix:null,
          expl:"Linéarité : on peut sortir les constantes et séparer la somme. " + sg(al) + " × " + neg(A) + " + " + neg(be) + " × " + neg(B) + " = " + sg(al*A) + " + " + neg(be*B) + " = " + sg(al*A + be*B) + "."};
      }
      if(v===3) return {q:"On sait que " + integ(a4,b4) + " de f(x) dx = " + sg(A) + ". Que vaut " + integ(b4,a4) + " de f(x) dx ?",
        a:sg(-A), accept:null, choix:null, expl:"Échanger les bornes change le signe : " + integ(b4,a4) + " = −" + integ(a4,b4) + " = " + sg(-A) + ". En effet F(" + sg(a4) + ") − F(" + sg(b4) + ") = −(F(" + sg(b4) + ") − F(" + sg(a4) + "))."};
      return {q:"On sait que " + integ(a4,c4) + " de f(x) dx = " + sg(A) + " et " + integ(a4,b4) + " de f(x) dx = " + sg(B) + ". Calcule " + integ(b4,c4) + " de f(x) dx.",
        a:sg(A - B), accept:null, choix:null, expl:"Chasles : " + integ(a4,c4) + " = " + integ(a4,b4) + " + " + integ(b4,c4) + ", donc " + integ(b4,c4) + " = " + sg(A) + " − " + neg(B) + " = " + sg(A - B) + "."};
    }

    if(level===2){
      var t2 = R.int(1,5);
      if(t2===1){
        var a = R.pick([1,2,-1]), b = R.pick([-3,-2,-1,1,2,3]), c = R.int(-4,5), p = R.int(-2,1), q = p + R.int(1,3);
        var F = function(x){ return a*x*x*x + b*x*x + c*x; };
        return {q:"Calcule I = " + integ(p,q) + " de (" + poly([[3*a,2],[2*b,1],[c,0]]) + ") dx.", a:sg(F(q) - F(p)), accept:null, choix:null,
          expl:"Une primitive : F(x) = " + poly([[a,3],[b,2],[c,1]]) + ". F(" + q + ") = " + sg(F(q)) + " et F(" + sg(p) + ") = " + sg(F(p)) + ". I = " + sg(F(q)) + " − " + neg(F(p)) + " = " + sg(F(q) - F(p)) + "."};
      }
      if(t2===2){
        if(R.int(1,2)===1){
          var a2 = R.int(1,6), k2 = R.int(1,4);
          return {q:"Calcule I = ∫ de 1 à " + eP(k2) + " de " + a2 + "/x dx.", a:String(a2*k2), accept:null, choix:null,
            expl:"Une primitive de " + a2 + "/x sur ]0 ; +∞[ est " + (a2===1 ? '' : a2 + " ") + "ln x. I = " + (a2===1 ? '' : a2 + " ") + "ln(" + eP(k2) + ") − " + (a2===1 ? '' : a2 + " ") + "ln 1 = " + a2 + " × " + k2 + " − 0 = " + (a2*k2) + "."};
        }
        var m2 = R.int(2,9), c2 = R.int(1,5);
        return {q:"Calcule I = ∫ de 0 à ln " + m2 + " de " + (c2===1 ? '' : c2) + "eˣ dx.", a:String(c2*(m2 - 1)), accept:null, choix:null,
          expl:"Une primitive de " + (c2===1 ? '' : c2) + "eˣ est " + (c2===1 ? '' : c2) + "eˣ. I = " + (c2===1 ? '' : c2) + "e^(ln " + m2 + ") − " + (c2===1 ? '' : c2) + "e⁰ = " + (c2*m2) + " − " + c2 + " = " + (c2*(m2 - 1)) + "."};
      }
      if(t2===3){
        var v3 = R.int(1,3);
        if(v3===1){
          var a3 = R.pick([2,3,4,5,-2]), b3 = R.pick([-3,-1,1,2,3]);
          var E = "e^(" + lin(a3,b3) + ")", co = a3>0 ? "(1/" + a3 + ")" : "−(1/" + (-a3) + ")";
          return {q:"Quelle est une primitive de f(x) = " + E + " ?", a:co + E, accept:null,
            choix:[co + E, sg(a3) + E, E, "(" + lin(a3,b3) + ")" + E],
            expl:"Une primitive de e^(ax + b) est (1/a)e^(ax + b). Vérification : la dérivée de " + co + E + " est " + co + " × " + sg(a3) + " × " + E + " = " + E + ". (" + sg(a3) + E + " est la dérivée de f, pas une primitive.)"};
        }
        if(v3===2){
          if(R.int(1,2)===1){
            var c4 = R.int(1,9), U = "x² + " + c4;
            return {q:"Quelle est une primitive de f(x) = 2x/(" + U + ") sur ℝ ?", a:"ln(" + U + ")", accept:null,
              choix:["ln(" + U + ")", "2x·ln(" + U + ")", "ln(2x)", "1/(" + U + ")"],
              expl:"f est de la forme u'/u avec u = " + U + " (toujours > 0) et u' = 2x. Une primitive est ln u = ln(" + U + ")."};
          }
          var a5 = R.pick([2,3,5]), b5 = R.int(1,5), U5 = lin(a5,b5);
          return {q:"Quelle est une primitive de f(x) = " + a5 + "/(" + U5 + ") sur ]" + frac(-b5,a5) + " ; +∞[ ?", a:"ln(" + U5 + ")", accept:null,
            choix:["ln(" + U5 + ")", a5 + "·ln(" + U5 + ")", "(1/" + a5 + ")ln(" + U5 + ")", "−" + a5 + "/(" + U5 + ")²"],
            expl:"f est de la forme u'/u avec u = " + U5 + " (> 0 sur cet intervalle) et u' = " + a5 + ". Une primitive est ln(" + U5 + "). Vérification : (ln u)' = " + a5 + "/(" + U5 + ")."};
        }
        if(R.int(1,2)===1){
          return {q:"Quelle est une primitive de f(x) = 2x e^(x²) ?", a:"e^(x²)", accept:null,
            choix:["e^(x²)", "2x·e^(x²)", "x²·e^(x²)", "e^(2x)"],
            expl:"f est de la forme u'e^u avec u = x², u' = 2x. Une primitive est e^u = e^(x²). Vérification : (e^(x²))' = 2x e^(x²)."};
        }
        var b6 = R.int(1,4), U6 = "x² + " + (b6===1 ? '' : b6) + "x";
        return {q:"Quelle est une primitive de f(x) = (2x + " + b6 + ")e^(" + U6 + ") ?", a:"e^(" + U6 + ")", accept:null,
          choix:["e^(" + U6 + ")", "(2x + " + b6 + ")·e^(" + U6 + ")", "(" + U6 + ")·e^(" + U6 + ")", "e^(2x + " + b6 + ")"],
          expl:"f est de la forme u'e^u avec u = " + U6 + " et u' = 2x + " + b6 + ". Une primitive est e^u = e^(" + U6 + ")."};
      }
      if(t2===4){
        if(R.int(1,2)===1){
          var mc = R.pick([1,2]), kc = R.pick([5,10,20]), q1 = R.pick([0,10,20]), q2 = q1 + 10*R.int(1,3);
          var G = function(x){ return mc*x*x/2 + kc*x; };
          return {q:"Le coût marginal d'une entreprise est Cm(q) = " + (mc===1 ? '' : mc) + "q + " + kc + " (en € par unité). Le coût de production des unités entre q = " + q1 + " et q = " + q2 + " vaut ∫ de " + q1 + " à " + q2 + " de Cm(q) dq. Calcule-le, en €.",
            a:String(G(q2) - G(q1)), accept:null, choix:null,
            expl:"Une primitive de Cm : C(q) = " + (mc===1 ? "q²/2" : "q²") + " + " + kc + "q. C(" + q2 + ") − C(" + q1 + ") = " + G(q2) + " − " + G(q1) + " = " + (G(q2) - G(q1)) + " €. On retrouve le coût total à partir du coût marginal."};
        }
        var ma = R.int(1,3), ka = R.int(1,5), pa = R.int(0,3), qa = pa + R.int(1,3);
        var ra = frac(ma*(qa*qa - pa*pa) + 2*ka*(qa - pa), 2);
        return {q:"Soit f(x) = " + lin(ma,ka) + ". Calcule l'aire, en unités d'aire, du domaine compris entre sa courbe, l'axe des abscisses et les droites x = " + pa + " et x = " + qa + " (valeur exacte).",
          a:ra, accept:null, choix:null,
          expl:"Sur [" + pa + " ; " + qa + "], f est positive, donc l'aire est l'intégrale. Primitive : F(x) = " + (ma===2 ? "x²" : (ma===1 ? "" : ma) + "x²/2") + " + " + (ka===1 ? '' : ka) + "x. Aire = F(" + qa + ") − F(" + pa + ") = " + frac(ma*qa*qa + 2*ka*qa, 2) + " − " + frac(ma*pa*pa + 2*ka*pa, 2) + " = " + ra + "."};
      }
      if(R.int(1,2)===1){
        var a7 = R.int(1,3), b7 = R.int(-3,4), c7 = R.int(-5,5), x7 = R.int(1,3);
        return {q:"F est la primitive de f(x) = " + lin(2*a7,b7) + " qui vérifie F(0) = " + sg(c7) + ". Calcule F(" + x7 + ").",
          a:sg(a7*x7*x7 + b7*x7 + c7), accept:null, choix:null,
          expl:"Les primitives de f sont " + poly([[a7,2],[b7,1]]) + " + c. F(0) = c = " + sg(c7) + ", donc F(x) = " + poly([[a7,2],[b7,1],[c7,0]]) + ". F(" + x7 + ") = " + sg(a7*x7*x7 + b7*x7 + c7) + "."};
      }
      var b8 = R.int(-3,3), c8 = R.int(-4,6), x8 = R.int(-1,2), C8 = c8 - 1 - b8;
      return {q:"F est la primitive de f(x) = " + poly([[3,2],[b8,0]]) + " qui vérifie F(1) = " + sg(c8) + ". Calcule F(" + sg(x8) + ").",
        a:sg(x8*x8*x8 + b8*x8 + C8), accept:null, choix:null,
        expl:"Les primitives sont " + poly([[1,3],[b8,1]]) + " + c. F(1) = 1" + pm(b8) + " + c = " + sg(c8) + " donne c = " + sg(C8) + ". F(x) = " + poly([[1,3],[b8,1],[C8,0]]) + " et F(" + sg(x8) + ") = " + sg(x8*x8*x8 + b8*x8 + C8) + "."};
    }

    // level 3
    var t3 = R.int(1,5);
    if(t3===1){
      var v1 = R.int(1,3);
      if(v1===1){
        var a1 = R.int(1,3), b1 = R.int(2,5), c1 = R.pick([0,10,20,50]);
        return {q:"La demande d'un produit (en milliers d'unités) au jour t, pour t dans [0 ; " + b1 + "], est D(t) = " + poly([[3*a1,2],[c1,0]], 't') + ". Quelle est la demande moyenne sur cette période ?",
          a:String(a1*b1*b1 + c1), accept:null, choix:null,
          expl:"Valeur moyenne : μ = (1/" + b1 + ") × ∫ de 0 à " + b1 + " de D(t) dt. Primitive : " + poly([[a1,3],[c1,1]], 't') + ". Intégrale = " + (a1*b1*b1*b1 + c1*b1) + ". μ = " + (a1*b1*b1*b1 + c1*b1) + "/" + b1 + " = " + (a1*b1*b1 + c1) + " milliers d'unités."};
      }
      var m1 = R.pick([1,2,3,-1,-2]), k1 = R.int(-3,6), p1 = R.int(-2,2), q1 = p1 + R.int(1,4);
      var I1n = m1*(q1*q1 - p1*p1) + 2*k1*(q1 - p1), mu = frac(I1n, 2*(q1 - p1));
      if(v1===2) return {q:"Calcule la valeur moyenne de f(x) = " + lin(m1,k1) + " sur [" + sg(p1) + " ; " + q1 + "] (valeur exacte).", a:mu, accept:null, choix:null,
        expl:"μ = (1/(" + q1 + " − " + neg(p1) + ")) × ∫ de " + sg(p1) + " à " + q1 + " de f(x) dx. Primitive : " + coefX(m1, 2, 2) + (k1===0 ? "" : mono(k1,1,false)) + ". Intégrale = " + frac(I1n, 2) + ", longueur = " + (q1 - p1) + ", donc μ = " + mu + "."};
      var bq = R.int(1,4), a3 = R.int(1,3);
      return {q:"Calcule la valeur moyenne de f(x) = " + (3*a3) + "x² sur [0 ; " + bq + "].", a:String(a3*bq*bq), accept:null, choix:null,
        expl:"∫ de 0 à " + bq + " de " + (3*a3) + "x² dx = [" + (a3===1 ? '' : a3) + "x³] = " + (a3*bq*bq*bq) + ". μ = " + (a3*bq*bq*bq) + "/" + bq + " = " + (a3*bq*bq) + "."};
    }
    if(t3===2){
      var d = R.int(0,3), i = R.int(0,2), j = i + R.int(1,3), c = R.int(1,3);
      var lo = pw(2,i) - d, hi = pw(2,j) - d, k = c*(j - i);
      var fx = c + "/" + (d===0 ? "x" : "(x + " + d + ")");
      return {q:"Calcule I = " + integ(lo,hi) + " de " + fx + " dx. Le résultat s'écrit k × ln 2 : donne k.", a:String(k), accept:null, choix:null,
        expl:"Forme u'/u avec u = " + (d===0 ? "x" : "x + " + d) + " (> 0 sur [" + sg(lo) + " ; " + sg(hi) + "]) : une primitive est " + (c===1 ? '' : c + " ") + "ln" + (d===0 ? " x" : "(x + " + d + ")") + ". I = " + (c===1 ? '' : c + " ") + "ln " + pw(2,j) + " − " + (c===1 ? '' : c + " ") + "ln " + pw(2,i) + ". Or " + lnParts(i,j) + ", donc I = " + (c===1 ? "" : c + " × ") + "(" + j + " − " + i + ") ln 2 = " + (k===1 ? "" : k + " ") + "ln 2 : k = " + k + "."};
    }
    if(t3===3){
      var p = R.int(1,3), q = p + R.int(1,4), askA = R.int(1,2)===1;
      var In = q*q - 2*p*q, An = p*p + (q - p)*(q - p);
      var ex = "f(x) = x − " + p + " est négative sur [0 ; " + p + "] et positive sur [" + p + " ; " + q + "]. Primitive : x²/2 − " + (p===1 ? "" : p) + "x. ∫ de 0 à " + p + " = " + frac(-p*p, 2) + " et ∫ de " + p + " à " + q + " = " + frac((q - p)*(q - p), 2) + ".";
      if(askA) return {q:"Soit f(x) = x − " + p + ". Calcule l'aire, en unités d'aire, du domaine compris entre sa courbe, l'axe des abscisses et les droites x = 0 et x = " + q + " (valeur exacte).",
        a:frac(An, 2), accept:null, choix:null,
        expl:ex + " Une aire est toujours positive : on change le signe de la partie sous l'axe. Aire = " + frac(p*p, 2) + " + " + frac((q - p)*(q - p), 2) + " = " + frac(An, 2) + ". (L'intégrale de 0 à " + q + ", elle, vaut " + frac(In, 2) + ".)"};
      return {q:"Soit f(x) = x − " + p + ". Calcule I = ∫ de 0 à " + q + " de f(x) dx (valeur exacte).", a:frac(In, 2), accept:null, choix:null,
        expl:"Primitive : F(x) = x²/2 − " + (p===1 ? "" : p) + "x. I = F(" + q + ") − F(0) = " + frac(q*q, 2) + " − " + (p*q) + " = " + frac(In, 2) + ". " + ex + " Chasles : " + frac(-p*p, 2) + " + " + frac((q - p)*(q - p), 2) + " = " + frac(In, 2) + "."};
    }
    if(t3===4){
      var a4 = R.int(2,5), c4 = R.int(1,6), k4 = frac(c4, a4);
      return {q:"Calcule I = ∫ de 0 à 1 de " + (c4===1 ? '' : c4) + "e^(" + a4 + "x) dx. Le résultat s'écrit k(" + eP(a4) + " − 1) : donne k (valeur exacte).",
        a:k4, accept:null, choix:null,
        expl:"Une primitive de e^(" + a4 + "x) est (1/" + a4 + ")e^(" + a4 + "x), donc une primitive de f est " + c4 + " × (1/" + a4 + ")e^(" + a4 + "x) = " + cf(k4) + "e^(" + a4 + "x). I = " + cf(k4) + "(" + eP(a4) + " − e⁰) = " + cf(k4) + "(" + eP(a4) + " − 1). Donc k = " + k4 + "."};
    }
    var k5 = R.int(0,4), a5 = R.int(2,6), T = a5*a5 + k5*a5;
    if(k5===0){
      return {q:"Trouve le réel a > 0 tel que ∫ de 0 à a de 2x dx = " + T + ".", a:String(a5), accept:null, choix:null,
        expl:"∫ de 0 à a de 2x dx = [x²] de 0 à a = a². On veut a² = " + T + ", et a > 0 : a = " + a5 + "."};
    }
    return {q:"Trouve le réel a > 0 tel que ∫ de 0 à a de (2x + " + k5 + ") dx = " + T + ".", a:String(a5), accept:null, choix:null,
      expl:"Primitive : x² + " + (k5===1 ? '' : k5) + "x, donc l'intégrale vaut a² + " + (k5===1 ? '' : k5) + "a. On résout a² + " + (k5===1 ? '' : k5) + "a − " + T + " = 0 : Δ = " + (k5*k5) + " + " + (4*T) + " = " + (k5*k5 + 4*T) + " = " + (2*a5 + k5) + "². Racines " + a5 + " et " + sg(-a5 - k5) + " ; on garde la positive : a = " + a5 + "."};
  }
});

})();

// ============================================================
// PHASE 6 — Prépa ECT, lot C
// ect-11 probabilités conditionnelles, ect-12 variables aléatoires,
// ect-13 coefficients binomiaux et lois usuelles, ect-14 systèmes et matrices.
// ============================================================
(function(){

// ---------- Helpers partagés ----------
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); for(var i=0;i<200 && b;i++){ var t=a%b; a=b; b=t; } return a||1; }
// Nombre affiché à la française (virgule, vrai signe moins), sans erreur d'arrondi flottant.
function nf(x){
  var s=(Math.round(x*1e6)/1e6).toFixed(6).replace(/0+$/,'').replace(/\.$/,'');
  if(s==='-0') s='0';
  return s.replace('.',',').replace('-','−');
}
function par(x){ return x<0 ? '('+nf(x)+')' : nf(x); }
// Fraction n/d simplifiée (ou entier).
function fq(n,d){ if(d<0){ n=-n; d=-d; } var g=gcd(n,d); n=n/g; d=d/g; return d===1 ? nf(n) : nf(n)+'/'+d; }
function sup(n){ return String(n).replace(/\d/g,function(d){ return '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(+d); }); }
function pw(b,e){ var r=1; for(var i=0;i<e;i++) r*=b; return r; }
// Valeur exacte de num / 10^k (num entier) en écriture décimale française.
function D(num,k){
  var neg=num<0; num=Math.abs(num); var p=pw(10,k);
  var ip=Math.floor(num/p), fp=num-ip*p;
  var s=String(ip);
  if(fp>0) s += '.' + ('000000000000'+fp).slice(-k).replace(/0+$/,'');
  if(neg && (ip>0 || fp>0)) s='-'+s;
  return s.replace('.',',').replace('-','−');
}
// Même chose, avec exactement k décimales (0,80 et non 0,8) : pour les arrondis.
function Dk(num,k){ var p=pw(10,k), ip=Math.floor(num/p), fp=num-ip*p; return String(ip)+(k>0?','+('000000000000'+fp).slice(-k):''); }
// Arrondi de num/den (entiers positifs) à 10^-k près ; alt = l'autre arrondi si on tombe pile au milieu.
function arrondi(num,den,k){
  var p=pw(10,k), t=2*num*p;
  var r=Math.floor((t+den)/(2*den));
  var half=(t%(2*den))===den;
  return {s:Dk(r,k), alt: half ? Dk(r-1,k) : null};
}
function cle(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g,'-').replace(/\s+/g,'').replace(/,/g,'.').replace(/[€%]/g,''); }
// QCM : la bonne réponse + les 3 premiers distracteurs distincts de la liste, mélangés.
function qcm(R,a,cands){
  var out=[a], vus={}; vus[cle(a)]=1;
  for(var i=0;i<cands.length && out.length<4;i++){
    var c=cands[i]; if(c===null || c===undefined) continue;
    var k=cle(c); if(vus[k]) continue;
    vus[k]=1; out.push(c);
  }
  return R.shuffle(out);
}
function fact(n){ var r=1; for(var i=2;i<=n;i++) r*=i; return r; }
function Cb(n,k){ if(k<0 || k>n) return 0; var r=1; for(var i=1;i<=k;i++) r=r*(n-k+i)/i; return Math.round(r); }
// Écriture d'une équation linéaire : coefs entiers, second membre quelconque.
function terme(c,v,premier){
  if(c===0) return '';
  var a=Math.abs(c), co=(a===1?'':String(a))+v;
  if(premier) return (c<0?'−':'')+co;
  return (c<0?' − ':' + ')+co;
}
function eq(row,vars){
  var s='', first=true, n=row.length-1;
  for(var j=0;j<n;j++){ if(row[j]===0) continue; s+=terme(row[j],vars[j],first); first=false; }
  if(first) s='0';
  return s+' = '+nf(row[n]);
}
function sysTxt(M,vars){ var t=[]; for(var i=0;i<M.length;i++) t.push(eq(M[i],vars)); return '{ '+t.join(' ; ')+' }'; }
function mat(M){ var t=[]; for(var i=0;i<M.length;i++){ var r=[]; for(var j=0;j<M[i].length;j++) r.push(nf(M[i][j])); t.push(r.join(' ')); } return '('+t.join(' ; ')+')'; }
function mul(A,B){
  var C=[];
  for(var i=0;i<A.length;i++){ var r=[]; for(var j=0;j<B[0].length;j++){ var s=0; for(var k=0;k<B.length;k++) s+=A[i][k]*B[k][j]; r.push(s); } C.push(r); }
  return C;
}
function det2(a,b,c,d){ return a*d-b*c; }
function det3(M){
  return M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1]) - M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0]) + M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);
}
// Détail du calcul ligne × colonne : « 2 × 1 + (−3) × 4 = −10 ».
function lc(ligne,colonne){
  var t=[], s=0;
  for(var k=0;k<ligne.length;k++){ t.push(par(ligne[k])+' × '+par(colonne[k])); s+=ligne[k]*colonne[k]; }
  return t.join(' + ')+' = '+nf(s);
}
function colTxt(M,j){ var t=[]; for(var i=0;i<M.length;i++) t.push(nf(M[i][j])); return '('+t.join(' ; ')+')'; }
// Pivot de Gauss commenté sur un système (lignes [coefs..., second membre]) de Cramer, solution connue.
function gauss(M0,vars,sol){
  var n=M0.length, A=[], etapes=[], i, j, r;
  for(i=0;i<n;i++) A.push(M0[i].slice());
  for(var c=0;c<n-1;c++){
    var pre='';
    if(A[c][c]===0){
      for(r=c+1;r<n;r++){ if(A[r][c]!==0){ var tmp=A[c]; A[c]=A[r]; A[r]=tmp; pre='L'+(c+1)+' ↔ L'+(r+1)+', puis '; break; } }
    }
    var ops=[];
    for(r=c+1;r<n;r++){
      if(A[r][c]===0) continue;
      var p=A[c][c], q=A[r][c], nr=[];
      if(q%p===0){
        var k=q/p;
        for(j=0;j<=n;j++) nr.push(A[r][j]-k*A[c][j]);
        ops.push('L'+(r+1)+' ← L'+(r+1)+(k>0?' − ':' + ')+(Math.abs(k)===1?'':Math.abs(k))+'L'+(c+1));
      } else {
        var al=p, be=-q; if(al<0){ al=-al; be=-be; }
        for(j=0;j<=n;j++) nr.push(al*A[r][j]+be*A[c][j]);
        ops.push('L'+(r+1)+' ← '+al+'L'+(r+1)+(be<0?' − ':' + ')+(Math.abs(be)===1?'':Math.abs(be))+'L'+(c+1));
      }
      A[r]=nr;
    }
    if(ops.length || pre) etapes.push(pre+(ops.length?ops.join(' et '):'rien à éliminer')+' : '+sysTxt(A,vars)+'.');
  }
  // remontée
  var rem=[];
  for(i=n-1;i>=0;i--){
    var cst=0; for(j=i+1;j<n;j++) cst+=A[i][j]*sol[j];
    var g=terme(A[i][i],vars[i],true)+(cst===0?'':(cst>0?' + ':' − ')+nf(Math.abs(cst)));
    var txt='L'+(i+1)+' : '+g+' = '+nf(A[i][n]);
    if(cst!==0 && A[i][i]!==1) txt+=', donc '+terme(A[i][i],vars[i],true)+' = '+nf(A[i][n]-cst);
    txt+=', d\'où '+vars[i]+' = '+nf(sol[i]);
    rem.push(txt);
  }
  return (etapes.length?etapes.join(' ')+' On remonte. ':'On remonte depuis la dernière ligne. ')+rem.join(' ; ')+'.';
}

// Notation binomiale en colonne pour les leçons.
function bin(n,k){ return '(<span style="display:inline-block;vertical-align:middle;text-align:center;line-height:1.05;font-size:.8em">'+n+'<br>'+k+'</span>)'; }

// =====================================================
// ect-11 — Probabilités conditionnelles, totales, Bayes
// =====================================================
SKILLS.push({
  id: 'p6-ect-11-probas-cond',
  phase: 6,
  ordre: 11,
  titre: 'Probabilités conditionnelles et formule de Bayes',
  objectif: "Passer de l'arbre aux formules : Poincaré, probabilités composées et totales, Bayes pour inverser un conditionnement, indépendance.",
  lecon: `<p class="lede">En terminale, tu raisonnais sur des arbres. En prépa, l'arbre reste ton brouillon, mais on écrit des formules : chaque branche est une probabilité conditionnelle, chaque chemin une probabilité composée. Rien de nouveau sur le fond, juste un langage plus précis… et une formule de plus, celle de Bayes.</p>
<p><strong>Les événements.</strong> Ω est l'univers (tous les résultats possibles). Ā est le contraire de A : P(Ā) = 1 − P(A). A ∩ B se lit « A et B », A ∪ B se lit « A ou B » (ou les deux). A et B sont <mark>incompatibles</mark> s'ils ne peuvent pas se produire ensemble : A ∩ B = ∅.</p>
<div class="formule"><p>Formule de Poincaré : P(A ∪ B) = P(A) + P(B) − P(A ∩ B)</p></div>
<p>On retire P(A ∩ B) parce que ce morceau a été compté deux fois. Si A et B sont incompatibles, P(A ∩ B) = 0 et il reste P(A ∪ B) = P(A) + P(B). En situation d'équiprobabilité (dé équilibré, tirage au hasard), P(A) = nombre de cas favorables ÷ nombre de cas possibles.</p>
<p><strong>Probabilité conditionnelle.</strong> Si P(A) ≠ 0, la probabilité de B sachant A est :</p>
<div class="formule"><p>P<sub>A</sub>(B) = P(A ∩ B) / P(A) &nbsp;•&nbsp; donc P(A ∩ B) = P(A) × P<sub>A</sub>(B)</p></div>
<p>Dans les exercices de l'app, l'indice s'écrit avec un tiret bas : P_A(B). La deuxième égalité, c'est ta règle « on multiplie le long d'un chemin ». Elle se prolonge : P(A₁ ∩ A₂ ∩ A₃) = P(A₁) × P<sub>A₁</sub>(A₂) × P<sub>A₁∩A₂</sub>(A₃) — c'est la <mark>formule des probabilités composées</mark>, utile pour les tirages successifs sans remise.</p>
<p><strong>Système complet et probabilités totales.</strong> Des événements A₁, …, Aₙ forment un système complet s'ils sont deux à deux incompatibles et que leur réunion est Ω : à chaque fois, <em>exactement un</em> des Aᵢ se réalise. Ce sont les branches qui partent du premier nœud de ton arbre (par exemple A et Ā). Pour tout événement B :</p>
<div class="formule"><p>P(B) = P(A₁ ∩ B) + … + P(Aₙ ∩ B) = P(A₁) P<sub>A₁</sub>(B) + … + P(Aₙ) P<sub>Aₙ</sub>(B)</p></div>
<p><strong>Formule de Bayes.</strong> L'arbre te donne P<sub>A</sub>(B) ; souvent, la question porte sur P<sub>B</sub>(A). Bayes sert à <mark>inverser le conditionnement</mark> :</p>
<div class="formule"><p>P<sub>B</sub>(A) = P(A ∩ B) / P(B) = P(A) P<sub>A</sub>(B) / P(B), avec P(B) calculée par les probabilités totales.</p></div>
<p>Exemple complet : une maladie touche 2 % d'une population. Un test est positif chez 95 % des malades, et aussi chez 10 % des personnes saines (faux positifs). Une personne a un test positif : quelle est la probabilité qu'elle soit malade ? On note M « être malade » et T « test positif ».</p>
<div class="etapes">
<p>1. Je traduis l'énoncé : P(M) = 0,02, P<sub>M</sub>(T) = 0,95, P<sub>M̄</sub>(T) = 0,1. On cherche P<sub>T</sub>(M) : le conditionnement est inversé, c'est du Bayes.</p>
<p>2. Les deux chemins qui mènent à T : P(M ∩ T) = 0,02 × 0,95 = 0,019 et P(M̄ ∩ T) = 0,98 × 0,1 = 0,098.</p>
<p>3. Probabilités totales avec le système complet (M, M̄) : P(T) = 0,019 + 0,098 = 0,117.</p>
<p>4. Bayes : P<sub>T</sub>(M) = 0,019 / 0,117 ≈ <mark>0,16</mark>. Moins d'une chance sur six : la maladie est si rare que la plupart des tests positifs sont des faux positifs.</p>
</div>
<table class="tbl"><tr><th>Chemin</th><th>Calcul</th><th>Probabilité</th></tr><tr><td>M puis T</td><td>0,02 × 0,95</td><td>0,019</td></tr><tr><td>M puis T̄</td><td>0,02 × 0,05</td><td>0,001</td></tr><tr><td>M̄ puis T</td><td>0,98 × 0,1</td><td>0,098</td></tr><tr><td>M̄ puis T̄</td><td>0,98 × 0,9</td><td>0,882</td></tr></table>
<p><strong>Indépendance.</strong> A et B sont indépendants si P(A ∩ B) = P(A) × P(B). Quand P(A) ≠ 0, cela revient à P<sub>A</sub>(B) = P(B) : savoir que A s'est produit ne change rien aux chances de B.</p>
<div class="box piege"><p class="box-t">Piège</p><p>P<sub>A</sub>(B) et P<sub>B</sub>(A) n'ont <strong>rien à voir</strong> : 95 % des malades ont un test positif, mais seulement 16 % des tests positifs viennent de malades. Et ne confonds pas incompatibles (A ∩ B = ∅) et indépendants (P(A ∩ B) = P(A)P(B)) : deux événements de probabilités non nulles qui sont incompatibles ne sont jamais indépendants.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>P(A ∪ B) = P(A) + P(B) − P(A ∩ B). P<sub>A</sub>(B) = P(A ∩ B) / P(A). Probabilités totales : P(B) = Σ P(Aᵢ) P<sub>Aᵢ</sub>(B) sur un système complet. Bayes : P<sub>B</sub>(A) = P(A) P<sub>A</sub>(B) / P(B). Indépendance : P(A ∩ B) = P(A) P(B).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Dans Bayes, le numérateur est toujours <mark>l'un des termes</mark> de la somme du dénominateur. Calcule d'abord tous les chemins qui mènent à B, additionne-les, puis divise celui qui passe par A par le total.</p></div>
<p>En prépa ECT : ces formules reviennent dans presque tous les sujets de concours (contrôle qualité, tests, clients fidèles), et la rédaction attendue cite le système complet utilisé avant d'appliquer la formule des probabilités totales.</p>`,
  gen(level, R){
    // Urne de jetons numérotés : événements usuels, comptés à la main.
    function urne(){
      var N=R.int(10,20), K1=R.int(3,N-4), K2=R.int(4,N-2);
      var evs=R.shuffle([
        {t:'le numéro est pair', f:function(x){ return x%2===0; }},
        {t:'le numéro est un multiple de 3', f:function(x){ return x%3===0; }},
        {t:'le numéro est un multiple de 5', f:function(x){ return x%5===0; }},
        {t:'le numéro est inférieur ou égal à '+K1, f:function(x){ return x<=K1; }},
        {t:'le numéro est supérieur ou égal à '+K2, f:function(x){ return x>=K2; }}
      ]);
      var A=evs[0], B=evs[1], nA=0, nB=0, nAB=0;
      for(var x=1;x<=N;x++){ var a=A.f(x), b=B.f(x); if(a) nA++; if(b) nB++; if(a&&b) nAB++; }
      return {N:N, A:A, B:B, nA:nA, nB:nB, nAB:nAB};
    }

    if(level===1){
      var t=R.int(1,5);
      if(t===1){
        var k=R.int(3,97);
        var v=R.pick([
          ['On donne P(A) = '+D(k,2)+'. Calcule P(Ā).', 'P(Ā) = 1 − P(A) = 1 − '+D(k,2)+' = '+D(100-k,2)+'.'],
          ['La probabilité qu\'un client pris au hasard achète au moins un article est '+D(k,2)+'. Quelle est la probabilité qu\'il n\'achète rien ?', '« N\'acheter rien » est l\'événement contraire : 1 − '+D(k,2)+' = '+D(100-k,2)+'.'],
          ['La probabilité qu\'une pièce prélevée au hasard soit conforme est '+D(k,2)+'. Quelle est la probabilité qu\'elle ne soit pas conforme ?', 'Événement contraire : 1 − '+D(k,2)+' = '+D(100-k,2)+'.']
        ]);
        return {q:v[0], a:D(100-k,2), accept:null, choix:null, pct:true, expl:v[1]};
      }
      if(t===2){
        var k1=5*R.int(4,14), k2=5*R.int(4,14);
        var lo=Math.max(1,(k1+k2-100)/5), hi=Math.min(k1,k2)/5-1;
        var k3=5*R.int(lo,hi), u=k1+k2-k3;
        if(R.int(1,2)===1){
          var q1=R.pick([
            'On donne P(A) = '+D(k1,2)+', P(B) = '+D(k2,2)+' et P(A ∩ B) = '+D(k3,2)+'. Calcule P(A ∪ B).',
            'Dans une enseigne, '+k1+' % des clients ont la carte de fidélité, '+k2+' % ont déjà commandé en ligne et '+k3+' % sont dans les deux cas. On choisit un client au hasard. Quelle est la probabilité qu\'il ait la carte OU qu\'il ait déjà commandé en ligne ?'
          ]);
          return {q:q1, a:D(u,2), accept:null, choix:null, pct:true,
            expl:'Formule de Poincaré : P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = '+D(k1,2)+' + '+D(k2,2)+' − '+D(k3,2)+' = '+D(u,2)+'. On retire P(A ∩ B), compté deux fois.'};
        }
        return {q:'On donne P(A) = '+D(k1,2)+', P(B) = '+D(k2,2)+' et P(A ∪ B) = '+D(u,2)+'. Calcule P(A ∩ B).',
          a:D(k3,2), accept:null, choix:null, pct:true,
          expl:'Poincaré : P(A ∪ B) = P(A) + P(B) − P(A ∩ B), donc P(A ∩ B) = P(A) + P(B) − P(A ∪ B) = '+D(k1,2)+' + '+D(k2,2)+' − '+D(u,2)+' = '+D(k3,2)+'.'};
      }
      if(t===3){
        var a=R.int(2,8), c=5*R.int(1,19), inter=a*c; // P(A) = a/10, P_A(B) = c/100, P(A∩B) = a*c/1000
        if(R.int(1,2)===1){
          return {q:'On donne P(A) = '+D(a,1)+' et P(A ∩ B) = '+D(inter,3)+'. Calcule P_A(B), la probabilité de B sachant A.',
            a:D(c,2), accept:null, choix:null, pct:true,
            expl:'P_A(B) = P(A ∩ B) / P(A) = '+D(inter,3)+' / '+D(a,1)+' = '+D(c,2)+'.'};
        }
        var q3=R.pick([
          'On donne P(A) = '+D(a,1)+' et P_A(B) = '+D(c,2)+'. Calcule P(A ∩ B).',
          a*10+' % des visiteurs d\'un site créent un compte. Parmi eux, '+c+' % passent commande. Quelle est la probabilité qu\'un visiteur crée un compte ET passe commande ?'
        ]);
        return {q:q3, a:D(inter,3), accept:null, choix:null, pct:true,
          expl:'Probabilités composées : P(A ∩ B) = P(A) × P_A(B) = '+D(a,1)+' × '+D(c,2)+' = '+D(inter,3)+'.'};
      }
      if(t===4){
        var U=urne();
        var nU=U.nA+U.nB-U.nAB;
        return {q:'Une urne contient '+U.N+' jetons numérotés de 1 à '+U.N+'. On en tire un au hasard. A : « '+U.A.t+' », B : « '+U.B.t+' ». Calcule P(A ∪ B) (valeur exacte, en fraction).',
          a:fq(nU,U.N), accept:[nU+'/'+U.N], choix:null, pct:true,
          expl:'Équiprobabilité : A compte '+U.nA+' jetons, B en compte '+U.nB+', et '+U.nAB+' jeton(s) sont dans les deux. Poincaré : P(A ∪ B) = '+U.nA+'/'+U.N+' + '+U.nB+'/'+U.N+' − '+U.nAB+'/'+U.N+' = '+nU+'/'+U.N+(fq(nU,U.N)!==nU+'/'+U.N?' = '+fq(nU,U.N):'')+'.'};
      }
      var pa=5*R.int(2,8), pb=5*R.int(2,8);
      if(R.int(1,2)===1){
        return {q:'A et B sont deux événements incompatibles, avec P(A) = '+D(pa,2)+' et P(B) = '+D(pb,2)+'. Calcule P(A ∪ B).',
          a:D(pa+pb,2), accept:null, choix:null, pct:true,
          expl:'Incompatibles : P(A ∩ B) = 0, donc P(A ∪ B) = P(A) + P(B) = '+D(pa,2)+' + '+D(pb,2)+' = '+D(pa+pb,2)+'.'};
      }
      var kd=R.int(1,3), md=R.int(kd+2,6), nd=kd+7-md;
      return {q:'On lance un dé équilibré à 6 faces. A : « obtenir un nombre inférieur ou égal à '+kd+' », B : « obtenir un nombre supérieur ou égal à '+md+' ». Calcule P(A ∪ B) (valeur exacte, en fraction).',
        a:fq(nd,6), accept:[nd+'/6'], choix:null, pct:true,
        expl:'A et B sont incompatibles (aucun nombre n\'est à la fois ≤ '+kd+' et ≥ '+md+'), donc P(A ∪ B) = P(A) + P(B) = '+kd+'/6 + '+(7-md)+'/6 = '+nd+'/6'+(fq(nd,6)!==nd+'/6'?' = '+fq(nd,6):'')+'.'};
    }

    if(level===2){
      var t2=R.int(1,6);
      if(t2===1){
        var pA=10*R.int(2,8), p1=5*R.int(1,19), p2=5*R.int(1,19);
        if(p2===p1) p2=(p1>=50)?p1-25:p1+25;
        var num=pA*p1+(100-pA)*p2;
        var ctx=R.pick([
          pA+' % des clients d\'une boutique ont la carte de fidélité. '+p1+' % des porteurs de la carte achètent pendant les soldes, contre '+p2+' % des autres clients. On choisit un client au hasard. Quelle est la probabilité qu\'il achète pendant les soldes ?',
          'Dans une entreprise, '+pA+' % des salariés ont suivi une formation. Parmi eux, '+p1+' % ont obtenu une promotion, contre '+p2+' % chez ceux qui ne l\'ont pas suivie. Quelle est la probabilité qu\'un salarié choisi au hasard ait obtenu une promotion ?',
          'Un fournisseur livre '+pA+' % des commandes par transporteur et le reste par la poste. '+p1+' % des livraisons par transporteur arrivent en retard, contre '+p2+' % par la poste. Quelle est la probabilité qu\'une commande prise au hasard arrive en retard ?'
        ]);
        return {q:ctx+' (valeur exacte)', a:D(num,4), accept:null, choix:null, pct:true,
          expl:'Système complet (A, Ā) avec P(A) = '+D(pA,2)+' et P(Ā) = '+D(100-pA,2)+'. Probabilités totales : P(B) = '+D(pA,2)+' × '+D(p1,2)+' + '+D(100-pA,2)+' × '+D(p2,2)+' = '+D(pA*p1,4)+' + '+D((100-pA)*p2,4)+' = '+D(num,4)+'.'};
      }
      if(t2===2){
        var parts=R.pick([[50,30,20],[40,35,25],[45,30,25],[60,25,15],[20,30,50],[35,40,25],[25,25,50],[30,50,20]]);
        var d=[R.int(1,6),R.int(1,6),R.int(1,6)];
        var num2=parts[0]*d[0]+parts[1]*d[1]+parts[2]*d[2];
        var c2=R.pick([
          ['Une usine possède trois machines M₁, M₂, M₃ qui produisent respectivement '+parts[0]+' %, '+parts[1]+' % et '+parts[2]+' % des pièces. Leurs taux de pièces défectueuses sont '+d[0]+' %, '+d[1]+' % et '+d[2]+' %. On prélève une pièce au hasard. Quelle est la probabilité qu\'elle soit défectueuse ?','M₁, M₂, M₃'],
          ['Un magasin vend par trois canaux : boutique ('+parts[0]+' % des ventes), site web ('+parts[1]+' %) et marketplace ('+parts[2]+' %). Les taux de retour sont '+d[0]+' %, '+d[1]+' % et '+d[2]+' %. Quelle est la probabilité qu\'une vente prise au hasard soit retournée ?','boutique, site, marketplace'],
          ['Trois fournisseurs F₁, F₂, F₃ assurent '+parts[0]+' %, '+parts[1]+' % et '+parts[2]+' % des livraisons. Leurs taux de colis abîmés sont '+d[0]+' %, '+d[1]+' % et '+d[2]+' %. Quelle est la probabilité qu\'un colis pris au hasard soit abîmé ?','F₁, F₂, F₃']
        ]);
        return {q:c2[0]+' (valeur exacte)', a:D(num2,4), accept:null, choix:null, pct:true,
          expl:'('+c2[1]+') forment un système complet. Probabilités totales : '+D(parts[0],2)+' × '+D(d[0],2)+' + '+D(parts[1],2)+' × '+D(d[1],2)+' + '+D(parts[2],2)+' × '+D(d[2],2)+' = '+D(parts[0]*d[0],4)+' + '+D(parts[1]*d[1],4)+' + '+D(parts[2]*d[2],4)+' = '+D(num2,4)+'.'};
      }
      if(t2===3){
        var n=R.int(8,20), dd=R.int(2,Math.min(6,n-3));
        if(R.int(1,2)===1){
          return {q:'Un lot de '+n+' articles contient '+dd+' articles défectueux. On prélève successivement 2 articles, sans remise. Quelle est la probabilité que les deux soient défectueux ? (fraction)',
            a:fq(dd*(dd-1),n*(n-1)), accept:[dd*(dd-1)+'/'+(n*(n-1))], choix:null, pct:true,
            expl:'Probabilités composées : P(D₁ ∩ D₂) = P(D₁) × P_D₁(D₂) = '+dd+'/'+n+' × '+(dd-1)+'/'+(n-1)+' = '+(dd*(dd-1))+'/'+(n*(n-1))+' = '+fq(dd*(dd-1),n*(n-1))+'. Après le premier tirage, il ne reste que '+(n-1)+' articles dont '+(dd-1)+' défectueux.'};
        }
        return {q:'Un lot de '+n+' articles contient '+dd+' articles défectueux. On prélève successivement 2 articles, sans remise. Quelle est la probabilité que le premier soit défectueux et le second en bon état ? (fraction)',
          a:fq(dd*(n-dd),n*(n-1)), accept:[dd*(n-dd)+'/'+(n*(n-1))], choix:null, pct:true,
          expl:'Probabilités composées : '+dd+'/'+n+' × '+(n-dd)+'/'+(n-1)+' = '+(dd*(n-dd))+'/'+(n*(n-1))+' = '+fq(dd*(n-dd),n*(n-1))+'. Après le premier tirage (défectueux), il reste '+(n-1)+' articles dont '+(n-dd)+' en bon état.'};
      }
      if(t2===4){
        var x=R.int(1,9), y=R.int(1,9);
        if(R.int(1,2)===1){
          return {q:'A et B sont indépendants, avec P(A) = '+D(x,1)+' et P(B) = '+D(y,1)+'. Calcule P(A ∩ B).',
            a:D(x*y,2), accept:null, choix:null, pct:true,
            expl:'Indépendance : P(A ∩ B) = P(A) × P(B) = '+D(x,1)+' × '+D(y,1)+' = '+D(x*y,2)+'.'};
        }
        var uu=10*x+10*y-x*y;
        return {q:'A et B sont indépendants, avec P(A) = '+D(x,1)+' et P(B) = '+D(y,1)+'. Calcule P(A ∪ B).',
          a:D(uu,2), accept:null, choix:null, pct:true,
          expl:'Indépendance : P(A ∩ B) = '+D(x,1)+' × '+D(y,1)+' = '+D(x*y,2)+'. Poincaré : P(A ∪ B) = '+D(x,1)+' + '+D(y,1)+' − '+D(x*y,2)+' = '+D(uu,2)+'.'};
      }
      if(t2===5){
        var xa=R.int(2,8), yb=R.int(2,8), ind=R.int(1,2)===1;
        var prod=xa*yb, off=R.pick([2,3,5]);
        var pi=ind?prod:((prod+off<=10*Math.min(xa,yb) && R.int(1,2)===1)||prod-off<1?prod+off:prod-off);
        var bon=ind?'Indépendants':'Non indépendants';
        return {q:'On donne P(A) = '+D(xa,1)+', P(B) = '+D(yb,1)+' et P(A ∩ B) = '+D(pi,2)+'. Que peut-on dire de A et B ?',
          a:bon, accept:null, choix:R.shuffle(['Indépendants','Non indépendants','Incompatibles','Indépendants et incompatibles']),
          expl:'P(A) × P(B) = '+D(xa,1)+' × '+D(yb,1)+' = '+D(prod,2)+(ind?', égal à P(A ∩ B) : A et B sont indépendants.':', différent de P(A ∩ B) = '+D(pi,2)+' : A et B ne sont pas indépendants.')+' Ils ne sont pas incompatibles, puisque P(A ∩ B) ≠ 0.'};
      }
      var U2=urne();
      if(U2.nAB===0 || R.int(1,3)===1){
        return {q:'Une urne contient '+U2.N+' jetons numérotés de 1 à '+U2.N+'. On en tire un au hasard. A : « '+U2.A.t+' », B : « '+U2.B.t+' ». Calcule P(A ∩ B) (valeur exacte, en fraction ; 0 si impossible).',
          a:fq(U2.nAB,U2.N), accept:[U2.nAB+'/'+U2.N], choix:null, pct:true,
          expl:'On compte les jetons qui vérifient les deux conditions : '+U2.nAB+' sur '+U2.N+', donc P(A ∩ B) = '+fq(U2.nAB,U2.N)+'.'};
      }
      return {q:'Une urne contient '+U2.N+' jetons numérotés de 1 à '+U2.N+'. On en tire un au hasard. A : « '+U2.A.t+' », B : « '+U2.B.t+' ». Calcule P_A(B) (valeur exacte, en fraction).',
        a:fq(U2.nAB,U2.nA), accept:[U2.nAB+'/'+U2.nA], choix:null, pct:true,
        expl:'P_A(B) = P(A ∩ B) / P(A) = ('+U2.nAB+'/'+U2.N+') / ('+U2.nA+'/'+U2.N+') = '+U2.nAB+'/'+U2.nA+(fq(U2.nAB,U2.nA)!==U2.nAB+'/'+U2.nA?' = '+fq(U2.nAB,U2.nA):'')+'. Sachant A, on ne regarde que les '+U2.nA+' jetons de A.'};
    }

    // level 3
    var t3=R.int(1,6);
    if(t3===1){
      var pr=R.pick([1,2,3,4,5,8,10]), se=R.pick([90,92,95,98,99]), fp=R.pick([2,3,5,8,10]);
      var nm=pr*se, dn=pr*se+(100-pr)*fp, ar=arrondi(nm,dn,2);
      var acc=[fq(nm,dn)]; if(ar.alt) acc.push(ar.alt);
      var cx=R.pick([
        ['Une maladie touche '+pr+' % d\'une population. Un test est positif chez '+se+' % des malades et chez '+fp+' % des personnes saines. Une personne a un test positif. Quelle est la probabilité qu\'elle soit malade ?','M « malade », T « test positif »'],
        ['Dans une banque, '+pr+' % des transactions sont frauduleuses. Le logiciel déclenche une alerte pour '+se+' % des transactions frauduleuses et pour '+fp+' % des transactions normales. Une alerte se déclenche. Quelle est la probabilité que la transaction soit frauduleuse ?','M « fraude », T « alerte »'],
        ['Dans une usine, '+pr+' % des pièces ont un défaut caché. Un détecteur signale '+se+' % des pièces défectueuses, mais aussi '+fp+' % des pièces saines. Une pièce est signalée. Quelle est la probabilité qu\'elle soit réellement défectueuse ?','M « défectueuse », T « signalée »']
      ]);
      return {q:cx[0]+' Donne le résultat arrondi à 0,01.', a:ar.s, accept:acc, choix:null, pct:true,
        expl:'On note '+cx[1]+'. P(M ∩ T) = '+D(pr,2)+' × '+D(se,2)+' = '+D(nm,4)+' ; P(M̄ ∩ T) = '+D(100-pr,2)+' × '+D(fp,2)+' = '+D((100-pr)*fp,4)+'. Probabilités totales : P(T) = '+D(dn,4)+'. Bayes : P_T(M) = '+D(nm,4)+' / '+D(dn,4)+' ≈ '+ar.s+'.'};
    }
    if(t3===2){
      var pt=R.pick([[50,30,20],[40,35,25],[45,30,25],[60,25,15],[20,30,50],[35,40,25],[25,25,50],[30,50,20]]);
      var dm=[R.int(1,6),R.int(1,6),R.int(1,6)], im=R.int(0,2);
      var tot=pt[0]*dm[0]+pt[1]*dm[1]+pt[2]*dm[2], nmi=pt[im]*dm[im];
      return {q:'Trois machines M₁, M₂, M₃ produisent respectivement '+pt[0]+' %, '+pt[1]+' % et '+pt[2]+' % des pièces, avec des taux de défaut de '+dm[0]+' %, '+dm[1]+' % et '+dm[2]+' %. Une pièce prélevée au hasard est défectueuse. Quelle est la probabilité qu\'elle vienne de M'+['₁','₂','₃'][im]+' ? (valeur exacte, en fraction)',
        a:fq(nmi,tot), accept:[nmi+'/'+tot], choix:null, pct:true,
        expl:'Probabilités totales : P(D) = '+D(pt[0]*dm[0],4)+' + '+D(pt[1]*dm[1],4)+' + '+D(pt[2]*dm[2],4)+' = '+D(tot,4)+'. Bayes : P_D(M'+['₁','₂','₃'][im]+') = '+D(nmi,4)+' / '+D(tot,4)+' = '+nmi+'/'+tot+(fq(nmi,tot)!==nmi+'/'+tot?' = '+fq(nmi,tot):'')+'.'};
    }
    if(t3===3){
      var ga=R.int(2,7), g1=5*R.int(8,18), g2=5*R.int(1,8);
      var nAB=ga*g1, nB=ga*g1+(10-ga)*g2; // en millièmes
      var rep=arrondi(nAB,nB,2);
      var rPAB=arrondi(g1,100,2).s, rInter=arrondi(nAB,1000,2).s, rB=arrondi(nB,1000,2).s;
      var cxt=R.pick([
        [ga*10+' % des clients d\'une banque ont un crédit immobilier. Parmi eux, '+g1+' % ont aussi une assurance vie ; parmi les autres clients, '+g2+' %. Un client a une assurance vie. Quelle est la probabilité qu\'il ait un crédit immobilier ?','A « crédit immobilier », B « assurance vie »'],
        [ga*10+' % des visiteurs d\'un salon sont des professionnels. '+g1+' % des professionnels passent une commande, contre '+g2+' % des particuliers. Un visiteur a passé commande. Quelle est la probabilité que ce soit un professionnel ?','A « professionnel », B « commande »'],
        [ga*10+' % des abonnés d\'une plateforme ont l\'offre premium. '+g1+' % des abonnés premium renouvellent, contre '+g2+' % des autres. Un abonné a renouvelé. Quelle est la probabilité qu\'il ait l\'offre premium ?','A « premium », B « renouvelle »']
      ]);
      return {q:cxt[0]+' (arrondi à 0,01)', a:rep.s, accept:null,
        choix:qcm(R,rep.s,[rPAB,rInter,rB,arrondi(nB-nAB,1000,2).s,D(Math.max(1,Math.round(100*nAB/nB)-5),2)]),
        expl:'On note '+cxt[1]+'. On cherche P_B(A), pas P_A(B) = '+D(g1,2)+'. P(A ∩ B) = '+D(ga,1)+' × '+D(g1,2)+' = '+D(nAB,3)+' ; P(B) = '+D(nAB,3)+' + '+D(10-ga,1)+' × '+D(g2,2)+' = '+D(nB,3)+'. Bayes : P_B(A) = '+D(nAB,3)+' / '+D(nB,3)+' ≈ '+rep.s+'.'};
    }
    if(t3===4){
      var a4=10*R.int(2,8), b1=5*R.int(2,18), x4=5*R.int(1,18);
      var tot4=a4*b1+(100-a4)*x4;
      var ctx4=R.int(1,2)===1;
      var c4=ctx4
        ? 'Une entreprise a deux usines : celle de Lyon produit '+a4+' % des articles, celle de Lille le reste. '+b1+' % des articles produits à Lyon sont vendus dans le mois. Au total, '+nf(tot4/100)+' % des articles sont vendus dans le mois. Quelle est la proportion d\'articles vendus dans le mois parmi ceux produits à Lille ?'
        : 'On sait que P(A) = '+D(a4,2)+', P_A(B) = '+D(b1,2)+' et P(B) = '+D(tot4,4)+'. Calcule P_Ā(B).';
      return {q:c4+' (valeur exacte, sous forme décimale)', a:D(x4,2), accept:null, choix:null, pct:true,
        expl:(ctx4?'On note A « produit à Lyon » (Ā : « produit à Lille ») et B « vendu dans le mois » ; on cherche x = P_Ā(B). ':'On note x = P_Ā(B). ')+'Probabilités totales : P(B) = P(A) P_A(B) + P(Ā) P_Ā(B), soit '+D(tot4,4)+' = '+D(a4,2)+' × '+D(b1,2)+' + '+D(100-a4,2)+' × x. Donc '+D(100-a4,2)+' x = '+D(tot4,4)+' − '+D(a4*b1,4)+' = '+D((100-a4)*x4,4)+' et x = '+D(x4,2)+'.'};
    }
    if(t3===5){
      var n5=R.int(10,20), d5=R.int(2,5), b5=n5-d5;
      var nu=b5*(b5-1)*(b5-2), de=n5*(n5-1)*(n5-2);
      if(R.int(1,2)===1){
        return {q:'Un lot de '+n5+' articles contient '+d5+' articles défectueux. On en prélève 3 successivement, sans remise. Quelle est la probabilité qu\'aucun ne soit défectueux ? (fraction)',
          a:fq(nu,de), accept:[nu+'/'+de], choix:null, pct:true,
          expl:'Probabilités composées : P(B₁ ∩ B₂ ∩ B₃) = P(B₁) × P_B₁(B₂) × P_B₁∩B₂(B₃) = '+b5+'/'+n5+' × '+(b5-1)+'/'+(n5-1)+' × '+(b5-2)+'/'+(n5-2)+' = '+nu+'/'+de+' = '+fq(nu,de)+'.'};
      }
      var nu2=de-nu;
      return {q:'Un lot de '+n5+' articles contient '+d5+' articles défectueux. On en prélève 3 successivement, sans remise. Quelle est la probabilité qu\'au moins un soit défectueux ? (fraction)',
        a:fq(nu2,de), accept:[nu2+'/'+de], choix:null, pct:true,
        expl:'Contraire de « aucun défectueux », dont la probabilité vaut '+b5+'/'+n5+' × '+(b5-1)+'/'+(n5-1)+' × '+(b5-2)+'/'+(n5-2)+' = '+fq(nu,de)+'. Donc 1 − '+fq(nu,de)+' = '+fq(nu2,de)+'.'};
    }
    var k6=5*R.int(4,14), l6=5*R.int(4,14);
    var lo6=Math.max(1,(k6+l6-100)/5), hi6=Math.min(k6,l6)/5-1;
    var m6=5*R.int(lo6,hi6), u6=k6+l6-m6;
    return {q:'Dans une entreprise, '+k6+' % des salariés parlent anglais, '+l6+' % parlent espagnol et '+m6+' % parlent les deux. On choisit un salarié au hasard. Quelle est la probabilité qu\'il ne parle ni anglais ni espagnol ?',
      a:D(100-u6,2), accept:null, choix:null, pct:true,
      expl:'« Ni A ni B » est le contraire de A ∪ B. Poincaré : P(A ∪ B) = '+D(k6,2)+' + '+D(l6,2)+' − '+D(m6,2)+' = '+D(u6,2)+'. Donc P(Ā ∩ B̄) = 1 − '+D(u6,2)+' = '+D(100-u6,2)+'.'};
  }
});

// =====================================================
// ect-12 — Variables aléatoires finies
// =====================================================
SKILLS.push({
  id: 'p6-ect-12-variables-aleatoires',
  phase: 6,
  ordre: 12,
  titre: 'Variables aléatoires : loi, espérance, variance',
  objectif: "Lire et exploiter la loi d'une variable aléatoire finie : fonction de répartition, espérance, transfert, variance par König-Huygens, jeu équitable.",
  lecon: `<p class="lede">Une variable aléatoire X, c'est un nombre qui dépend du hasard : le gain à un jeu, le nombre de ventes d'une journée, le nombre de pièces défectueuses. Tout ce qu'on veut savoir sur X est dans sa <mark>loi</mark> : la liste des valeurs possibles et de leurs probabilités.</p>
<p>Exemple fil rouge : à un jeu, ton gain X (en €) vaut −2, 1 ou 5, avec les probabilités suivantes.</p>
<table class="tbl"><tr><th>xᵢ</th><td>−2</td><td>1</td><td>5</td></tr><tr><th>P(X = xᵢ)</th><td>0,5</td><td>0,3</td><td>0,2</td></tr></table>
<p>Les événements [X = −2], [X = 1], [X = 5] forment un système complet : la somme des probabilités vaut toujours <mark>1</mark> (ici 0,5 + 0,3 + 0,2 = 1). C'est ce qui permet de retrouver une probabilité manquante.</p>
<p><strong>Fonction de répartition.</strong> F(x) = P(X ≤ x) : on additionne les probabilités des valeurs inférieures ou égales à x. Ici F(x) = 0 si x &lt; −2, F(x) = 0,5 si −2 ≤ x &lt; 1, F(x) = 0,8 si 1 ≤ x &lt; 5 et F(x) = 1 si x ≥ 5. C'est une fonction « en escalier » ; par exemple F(3) = 0,8 et P(X = 1) = F(1) − F(−2) = 0,3.</p>
<div class="formule"><p>E(X) = Σ xᵢ P(X = xᵢ) &nbsp;•&nbsp; E(aX + b) = aE(X) + b &nbsp;•&nbsp; E(g(X)) = Σ g(xᵢ) P(X = xᵢ)</p></div>
<p>L'espérance est la <mark>moyenne à long terme</mark> de X. La dernière formule est le théorème de transfert : pour calculer E(X²), on garde les mêmes probabilités et on met les xᵢ² à la place des xᵢ. La variance mesure la dispersion autour de la moyenne ; en pratique, on la calcule avec la formule de König-Huygens :</p>
<div class="formule"><p>V(X) = E(X²) − E(X)² &nbsp;•&nbsp; V(aX + b) = a² V(X) &nbsp;•&nbsp; σ(X) = √V(X)</p></div>
<div class="etapes">
<p>1. Espérance : E(X) = −2 × 0,5 + 1 × 0,3 + 5 × 0,2 = −1 + 0,3 + 1 = 0,3. En moyenne, le joueur gagne 0,30 € par partie.</p>
<p>2. Transfert : E(X²) = 4 × 0,5 + 1 × 0,3 + 25 × 0,2 = 2 + 0,3 + 5 = 7,3.</p>
<p>3. König-Huygens : V(X) = 7,3 − 0,3² = 7,3 − 0,09 = <mark>7,21</mark>.</p>
<p>4. Écart-type : σ(X) = √7,21 ≈ 2,69.</p>
<p>5. Si chaque gain est doublé et qu'on ajoute 1 € (Y = 2X + 1) : E(Y) = 2 × 0,3 + 1 = 1,6 et V(Y) = 2² × 7,21 = 28,84.</p>
</div>
<p><strong>Jeu équitable.</strong> Un jeu est équitable quand l'espérance du gain net est nulle : E(X) = 0. Si E(X) &gt; 0, il est favorable au joueur ; si E(X) &lt; 0, il est favorable à l'organisateur.</p>
<div class="box piege"><p class="box-t">Piège</p><p>V(aX + b) = <strong>a²</strong> V(X) : le carré, et le b disparaît (décaler toutes les valeurs ne change pas leur dispersion). Et E(X²) n'est pas E(X)² : 7,3 ≠ 0,09.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Somme des probabilités = 1. F(x) = P(X ≤ x). E(X) = Σ xᵢ P(X = xᵢ), linéaire : E(aX + b) = aE(X) + b. V(X) = E(X²) − E(X)², V(aX + b) = a²V(X), σ = √V. Jeu équitable : E(gain) = 0.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Écris la loi en tableau, puis ajoute une ligne xᵢ² en dessous : E(X) et E(X²) se lisent alors directement, et la variance tombe en une ligne.</p></div>
<p>En prépa ECT : espérance et variance servent à comparer des risques (deux placements de même gain moyen, mais de variances différentes) ; la variable centrée réduite X* = (X − E(X)) / σ(X), d'espérance 0 et de variance 1, prépare les lois continues de 2e année.</p>`,
  gen(level, R){
    // Loi finie aléatoire : n valeurs entières croissantes, probabilités en dixièmes (S=10) ou en vingtièmes (S=20).
    function loi(n,S){
      var p=[], reste=S, i;
      for(i=0;i<n-1;i++){ var mx=reste-(n-1-i); var v=R.int(1,Math.min(mx,Math.ceil(S/2))); p.push(v); reste-=v; }
      p.push(reste);
      var x=[R.int(-3,1)];
      for(i=1;i<n;i++) x.push(x[i-1]+R.int(1,3));
      var f=(S===10)?1:5, k=(S===10)?1:2;
      var sx=0, sx2=0;
      for(i=0;i<n;i++){ sx+=x[i]*p[i]*f; sx2+=x[i]*x[i]*p[i]*f; }
      return {x:x, p:p, f:f, k:k, n:n, sx:sx, sx2:sx2};
    }
    function ps(L,i){ return D(L.p[i]*L.f,L.k); }
    function loiTxt(L){ var t=[]; for(var i=0;i<L.n;i++) t.push('P(X = '+nf(L.x[i])+') = '+ps(L,i)); return t.join(' ; '); }
    function eDetail(L,carre){ var t=[]; for(var i=0;i<L.n;i++) t.push((carre?par(L.x[i])+'²':par(L.x[i]))+' × '+ps(L,i)); return t.join(' + '); }

    if(level===1){
      var t=R.int(1,5);
      if(t===1){
        var L=loi(R.int(3,4),R.pick([10,20])), im=R.int(0,L.n-1), autres=[], s=0;
        var pr=[];
        for(var i=0;i<L.n;i++){ if(i!==im){ autres.push('P(X = '+nf(L.x[i])+') = '+ps(L,i)); pr.push(ps(L,i)); s+=L.p[i]*L.f; } }
        return {q:'X prend les valeurs '+L.x.map(nf).join(', ')+'. On sait que '+autres.join(' ; ')+'. Calcule P(X = '+nf(L.x[im])+').',
          a:ps(L,im), accept:null, choix:null, pct:true,
          expl:'La somme des probabilités vaut 1 : P(X = '+nf(L.x[im])+') = 1 − ('+pr.join(' + ')+') = 1 − '+D(s,L.k)+' = '+ps(L,im)+'.'};
      }
      if(t===2){
        var L2=loi(3,R.pick([10,20]));
        var ctx=R.pick(['La loi de X est : ','Le gain X (en €) d\'un jeu a pour loi : ','Le nombre X d\'incidents par jour sur une chaîne de production suit la loi : ']);
        if(ctx.indexOf('incidents')>=0 && L2.x[0]<0){ var d0=L2.x[0]; for(var j=0;j<3;j++) L2.x[j]-=d0; L2.sx=0; for(j=0;j<3;j++) L2.sx+=L2.x[j]*L2.p[j]*L2.f; }
        return {q:ctx+loiTxt(L2)+'. Calcule E(X).', a:D(L2.sx,L2.k), accept:null, choix:null,
          expl:'E(X) = Σ xᵢ P(X = xᵢ) = '+eDetail(L2,false)+' = '+D(L2.sx,L2.k)+'.'};
      }
      if(t===3){
        var L3=loi(4,R.pick([10,20])), jj=R.int(0,2), cum=0;
        for(var a=0;a<=jj;a++) cum+=L3.p[a]*L3.f;
        var gap=L3.x[jj+1]-L3.x[jj];
        var tt=(gap>=2)?L3.x[jj]+1:L3.x[jj]+0.5;
        var mode=R.int(1,3);
        if(mode===1) return {q:'La loi de X est : '+loiTxt(L3)+'. On note F sa fonction de répartition. Calcule F('+nf(L3.x[jj])+').',
          a:D(cum,L3.k), accept:null, choix:null, pct:true,
          expl:'F('+nf(L3.x[jj])+') = P(X ≤ '+nf(L3.x[jj])+') : on additionne les probabilités des valeurs ≤ '+nf(L3.x[jj])+', soit '+D(cum,L3.k)+'.'};
        if(mode===2) return {q:'La loi de X est : '+loiTxt(L3)+'. On note F sa fonction de répartition. Calcule F('+nf(tt)+').',
          a:D(cum,L3.k), accept:null, choix:null, pct:true,
          expl:'F('+nf(tt)+') = P(X ≤ '+nf(tt)+'). Les valeurs ≤ '+nf(tt)+' sont '+L3.x.slice(0,jj+1).map(nf).join(', ')+' : F('+nf(tt)+') = '+D(cum,L3.k)+'. F est en escalier : elle ne change qu\'aux valeurs prises par X.'};
        return {q:'La loi de X est : '+loiTxt(L3)+'. Calcule P(X > '+nf(L3.x[jj])+').',
          a:D(pw(10,L3.k)-cum,L3.k), accept:null, choix:null, pct:true,
          expl:'P(X > '+nf(L3.x[jj])+') = 1 − P(X ≤ '+nf(L3.x[jj])+') = 1 − F('+nf(L3.x[jj])+') = 1 − '+D(cum,L3.k)+' = '+D(pw(10,L3.k)-cum,L3.k)+'.'};
      }
      if(t===4){
        var E=R.int(-6,12)+R.pick([0,0,0.5]), aa=R.pick([2,3,4,5,10,-1,-2,-3]), bb=R.pick([-20,-10,-5,-3,1,2,5,8,15]);
        var res=aa*E+bb;
        var lib4=terme(aa,'X',true)+(bb<0?' − ':' + ')+Math.abs(bb);
        var q4=R.pick([
          'On sait que E(X) = '+nf(E)+'. Calcule E('+lib4+').',
          'Une variable aléatoire X vérifie E(X) = '+nf(E)+'. On pose Y = '+lib4+'. Calcule E(Y).'
        ]);
        return {q:q4, a:nf(res), accept:null, choix:null,
          expl:'Linéarité : E(aX + b) = aE(X) + b = '+par(aa)+' × '+par(E)+' '+(bb<0?'− ':'+ ')+Math.abs(bb)+' = '+nf(res)+'.'};
      }
      var nv=R.int(3,4), L5=loi(nv,10);
      var base=R.int(0,3); L5.sx=0;
      for(var z=0;z<nv;z++){ L5.x[z]=base+z; L5.sx+=L5.x[z]*L5.p[z]; }
      return {q:'Le nombre X de clients qui se présentent à un guichet en 5 minutes suit la loi : '+loiTxt(L5)+'. Quel est le nombre moyen de clients, E(X) ?',
        a:D(L5.sx,1), accept:null, choix:null,
        expl:'E(X) = '+eDetail(L5,false)+' = '+D(L5.sx,1)+' client(s) en moyenne.'};
    }

    if(level===2){
      var t2=R.int(1,6);
      if(t2===1){
        var M=loi(3,R.pick([10,20]));
        var g=R.pick(['x²','(x − 1)²','x³']), vals=[], s2=0, det=[];
        for(var i2=0;i2<3;i2++){
          var xv=M.x[i2], gv=(g==='x²')?xv*xv:(g==='x³'?xv*xv*xv:(xv-1)*(xv-1));
          vals.push(gv); s2+=gv*M.p[i2]*M.f; det.push(par(gv)+' × '+ps(M,i2));
        }
        var lib=(g==='x²')?'X²':(g==='x³'?'X³':'(X − 1)²');
        return {q:'La loi de X est : '+loiTxt(M)+'. À l\'aide du théorème de transfert, calcule E('+lib+').',
          a:D(s2,M.k), accept:null, choix:null,
          expl:'Transfert : E(g(X)) = Σ g(xᵢ) P(X = xᵢ), avec les mêmes probabilités. E('+lib+') = '+det.join(' + ')+' = '+D(s2,M.k)+'.'};
      }
      if(t2===2){
        var e=R.int(-4,8)+R.pick([0,0.5]), vv=R.pick([1,2,3,4,5,6,0.25,0.75,1.5,2.5]);
        var e2=e*e+vv;
        return {q:'Une variable aléatoire X vérifie E(X) = '+nf(e)+' et E(X²) = '+nf(e2)+'. Calcule V(X).',
          a:nf(vv), accept:null, choix:null,
          expl:'König-Huygens : V(X) = E(X²) − E(X)² = '+nf(e2)+' − '+par(e)+'² = '+nf(e2)+' − '+nf(e*e)+' = '+nf(vv)+'.'};
      }
      if(t2===3){
        var V=R.pick([2,3,4,5,6,0.5,1.5,2.5]), a3=R.pick([2,3,4,5,-2,-3]), b3=R.pick([-7,-5,-1,1,3,4,10]);
        var bon=nf(a3*a3*V);
        var lib3=nf(a3)+'X '+(b3<0?'− ':'+ ')+Math.abs(b3);
        return {q:'On sait que V(X) = '+nf(V)+'. Que vaut V('+lib3+') ?', a:bon, accept:null,
          choix:qcm(R,bon,[nf(a3*V),nf(a3*a3*V+b3),nf(a3*V+b3),nf(Math.abs(a3)*V),nf(a3*a3*V+b3*b3),nf(a3*a3*V+1),nf(2*a3*a3*V),nf(a3*a3*V-1),nf(a3*a3*V+2)]),
          expl:'V(aX + b) = a² V(X) : le décalage b ne change pas la dispersion. V('+lib3+') = '+par(a3)+'² × '+nf(V)+' = '+(a3*a3)+' × '+nf(V)+' = '+bon+'.'};
      }
      if(t2===4){
        var part=R.pick([[1,2,3],[1,1,4],[2,1,3],[1,3,2],[2,2,2]]);
        var g1=R.pick([6,8,10,12,15,20]), g2=R.pick([1,2,3,4]), m=R.pick([1,2,3,4,5]);
        var faces=[[6],[5,4],[3,2,1]];
        var f1=[], f2=[], f3=[], fc=6;
        for(var u=0;u<part[0];u++) f1.push(fc--);
        for(u=0;u<part[1];u++) f2.push(fc--);
        for(u=0;u<part[2];u++) f3.push(fc--);
        var numE=g1*part[0]+g2*part[1]-m*part[2];
        return {q:'On lance un dé équilibré. On gagne '+g1+' € si l\'on obtient '+f1.join(' ou ')+', on gagne '+g2+' € si l\'on obtient '+f2.join(' ou ')+', et on perd '+m+' € sinon. On note X le gain algébrique. Calcule le gain moyen E(X) (valeur exacte).',
          a:fq(numE,6), accept:[numE+'/6'], choix:null,
          expl:'Loi : P(X = '+g1+') = '+part[0]+'/6, P(X = '+g2+') = '+part[1]+'/6, P(X = −'+m+') = '+part[2]+'/6. E(X) = ('+g1+' × '+part[0]+' + '+g2+' × '+part[1]+' − '+m+' × '+part[2]+') / 6 = '+numE+'/6'+(fq(numE,6)!==numE+'/6'?' = '+fq(numE,6):'')+(numE===0?' : le jeu est équitable.':(numE>0?' : jeu favorable au joueur.':' : jeu défavorable au joueur.'))};
      }
      if(t2===5){
        var sg=R.pick([1,2,3,4,5,0.5,1.5,0.4,0.3,1.2]), vr=sg*sg;
        if(R.int(1,2)===1){
          return {q:'Une variable aléatoire X a pour variance V(X) = '+nf(vr)+'. Calcule son écart-type σ(X).',
            a:nf(sg), accept:null, choix:null,
            expl:'σ(X) = √V(X) = √'+nf(vr)+' = '+nf(sg)+'.'};
        }
        var a5=R.pick([2,3,4,5,10,-2,-3]), b5=R.int(-9,9);
        return {q:'On sait que σ(X) = '+nf(sg)+'. Calcule σ('+nf(a5)+'X '+(b5<0?'− ':'+ ')+Math.abs(b5)+').',
          a:nf(Math.abs(a5)*sg), accept:null, choix:null,
          expl:'V(aX + b) = a²V(X), donc σ(aX + b) = |a| σ(X) = '+Math.abs(a5)+' × '+nf(sg)+' = '+nf(Math.abs(a5)*sg)+'. Un écart-type n\'est jamais négatif.'};
      }
      var L6=loi(3,10);
      var Ex=L6.sx, Ex2=L6.sx2, Vn=10*Ex2-Ex*Ex; // V × 100
      return {q:'La loi de X est : '+loiTxt(L6)+'. On donne E(X) = '+D(Ex,1)+'. Calcule E(X²) puis V(X) ; donne V(X).',
        a:D(Vn,2), accept:null, choix:null,
        expl:'Transfert : E(X²) = '+eDetail(L6,true)+' = '+D(Ex2,1)+'. König-Huygens : V(X) = '+D(Ex2,1)+' − '+par(Ex/10)+'² = '+D(Ex2,1)+' − '+D(Ex*Ex,2)+' = '+D(Vn,2)+'.'};
    }

    // level 3
    var t3=R.int(1,6);
    if(t3===1){
      var W=loi(R.int(3,4),R.pick([10,20]));
      var Vw=pw(10,W.k)*W.sx2-W.sx*W.sx; // V × 10^(2k)
      var ctx3=R.pick(['La loi de X est : ','Le nombre X de ventes réalisées par un commercial dans la journée suit la loi : ','Le gain X (en €) d\'une loterie a pour loi : ']);
      if(ctx3.indexOf('ventes')>=0 && W.x[0]<0){
        var dec0=W.x[0]; W.sx=0; W.sx2=0;
        for(var w=0;w<W.n;w++){ W.x[w]-=dec0; W.sx+=W.x[w]*W.p[w]*W.f; W.sx2+=W.x[w]*W.x[w]*W.p[w]*W.f; }
        Vw=pw(10,W.k)*W.sx2-W.sx*W.sx;
      }
      return {q:ctx3+loiTxt(W)+'. Calcule V(X) (valeur exacte).', a:D(Vw,2*W.k), accept:null, choix:null,
        expl:'E(X) = '+eDetail(W,false)+' = '+D(W.sx,W.k)+'. E(X²) = '+eDetail(W,true)+' = '+D(W.sx2,W.k)+'. V(X) = E(X²) − E(X)² = '+D(W.sx2,W.k)+' − '+D(W.sx*W.sx,2*W.k)+' = '+D(Vw,2*W.k)+'.'};
    }
    if(t3===2){
      var nb=R.pick([5,6,8,10,12,20]), kg=R.int(1,Math.min(4,nb-1)), tt3=R.int(1,4);
      var mise=kg*tt3, gain=nb*tt3;
      if(R.int(1,2)===1){
        return {q:'Une urne contient '+nb+' boules dont '+kg+' gagnante(s). Pour jouer, on paie '+mise+' € ; si la boule tirée est gagnante, on reçoit une somme S (la mise n\'est pas rendue). Quelle valeur de S (en €) rend le jeu équitable ?',
          a:nf(gain), accept:null, choix:null,
          expl:'Gain net X : S − '+mise+' avec probabilité '+kg+'/'+nb+', et −'+mise+' sinon. E(X) = ('+kg+'/'+nb+')(S − '+mise+') − ('+(nb-kg)+'/'+nb+') × '+mise+' = ('+kg+'/'+nb+') S − '+mise+'. Équitable : E(X) = 0, donc S = '+mise+' × '+nb+'/'+kg+' = '+gain+' €.'};
      }
      return {q:'Une urne contient '+nb+' boules dont '+kg+' gagnante(s). Si la boule tirée est gagnante, le joueur reçoit '+gain+' € ; dans tous les cas, il a payé une mise de m €. Quelle mise m (en €) rend le jeu équitable ?',
        a:nf(mise), accept:null, choix:null,
        expl:'Gain net X : '+gain+' − m avec probabilité '+kg+'/'+nb+', et −m sinon. E(X) = ('+kg+'/'+nb+') × '+gain+' − m. Équitable : E(X) = 0, donc m = '+kg+' × '+gain+' / '+nb+' = '+mise+' €.'};
    }
    if(t3===3){
      var x1=R.int(-2,1), x2=x1+R.int(1,3), x3=x2+R.int(1,3);
      var pp=R.int(1,7), qq=R.int(1,8-pp), rr=10-pp-qq;
      var Eq=x1*pp+x2*qq+x3*rr; // E × 10
      return {q:'X prend les valeurs '+nf(x1)+', '+nf(x2)+' et '+nf(x3)+'. On sait que P(X = '+nf(x3)+') = '+D(rr,1)+' et E(X) = '+D(Eq,1)+'. On note p = P(X = '+nf(x1)+'). Calcule p.',
        a:D(pp,1), accept:null, choix:null, pct:true,
        expl:'Avec q = P(X = '+nf(x2)+') : p + q = 1 − '+D(rr,1)+' = '+D(10-rr,1)+', et E(X) = '+par(x1)+' × p + '+par(x2)+' × q + '+par(x3)+' × '+D(rr,1)+' = '+D(Eq,1)+'. On remplace q par '+D(10-rr,1)+' − p : '+terme(x1-x2,'p',true)+' = '+D(Eq,1)+' − '+par(x2)+' × '+D(10-rr,1)+' − '+par(x3)+' × '+D(rr,1)+' = '+nf((Eq-x3*rr-x2*(10-rr))/10)+', donc p = '+D(pp,1)+' (et q = '+D(qq,1)+').'};
    }
    if(t3===4){
      var EX=R.int(8,40), sx=R.pick([2,3,4,5,6]), pu=R.pick([5,8,10,12,15,20,25]), cf=10*R.int(5,40);
      var ask=R.int(1,3);
      var head='Le nombre X d\'articles vendus par jour vérifie E(X) = '+EX+' et σ(X) = '+sx+'. Chaque article rapporte '+pu+' € et les frais fixes sont de '+cf+' € par jour : le bénéfice est B = '+pu+'X − '+cf+'. ';
      if(ask===1) return {q:head+'Calcule E(B), en €.', a:nf(pu*EX-cf), accept:null, choix:null,
        expl:'Linéarité : E(B) = '+pu+' E(X) − '+cf+' = '+pu+' × '+EX+' − '+cf+' = '+nf(pu*EX-cf)+' €.'};
      if(ask===2) return {q:head+'Calcule V(B).', a:nf(pu*pu*sx*sx), accept:null, choix:null,
        expl:'V(X) = σ(X)² = '+(sx*sx)+'. V(B) = '+pu+'² × V(X) = '+(pu*pu)+' × '+(sx*sx)+' = '+nf(pu*pu*sx*sx)+' (les frais fixes ne changent pas la variance).'};
      return {q:head+'Calcule σ(B), en €.', a:nf(pu*sx), accept:null, choix:null,
        expl:'σ(B) = |'+pu+'| × σ(X) = '+pu+' × '+sx+' = '+nf(pu*sx)+' €. Les '+cf+' € de frais fixes décalent B sans changer sa dispersion.'};
    }
    if(t3===5){
      var y0=R.int(-2,2), ys=[y0,y0+R.int(1,2)], i5;
      ys.push(ys[1]+R.int(1,3)); ys.push(ys[2]+R.int(1,2));
      var c1=R.int(1,4), c2=c1+R.int(1,3), c3=c2+R.int(1,9-c2);
      var Fv=[c1,c2,c3,10], jx=R.int(1,3);
      var pf=Fv[jx]-Fv[jx-1];
      var txt='';
      for(i5=0;i5<4;i5++) txt+=(i5?' ; ':'')+'F('+nf(ys[i5])+') = '+D(Fv[i5],1);
      return {q:'X prend les valeurs '+ys.map(nf).join(', ')+' et sa fonction de répartition vérifie : '+txt+'. Calcule P(X = '+nf(ys[jx])+').',
        a:D(pf,1), accept:null, choix:null, pct:true,
        expl:'P(X = '+nf(ys[jx])+') = P(X ≤ '+nf(ys[jx])+') − P(X ≤ '+nf(ys[jx-1])+') = F('+nf(ys[jx])+') − F('+nf(ys[jx-1])+') = '+D(Fv[jx],1)+' − '+D(Fv[jx-1],1)+' = '+D(pf,1)+'.'};
    }
    var cas=R.pick([
      {q:'Pour toute variable aléatoire finie X, laquelle de ces égalités est toujours vraie ?', a:'V(X) = E(X²) − E(X)²', d:['V(X) = E(X)² − E(X²)','V(X) = E(X²) − E(X)','V(X) = E(X²)'], e:'C\'est la formule de König-Huygens. Elle garantit V(X) ≥ 0, donc E(X²) ≥ E(X)².'},
      {q:'Si Y = 3X − 4, que vaut V(Y) ?', a:'9V(X)', d:['3V(X)','9V(X) − 4','3V(X) − 4'], e:'V(aX + b) = a²V(X) : V(3X − 4) = 3² V(X) = 9V(X). La constante −4 disparaît.'},
      {q:'Si Y = −2X + 5, que vaut E(Y) ?', a:'−2E(X) + 5', d:['2E(X) + 5','−2E(X)','4E(X) + 5'], e:'Linéarité de l\'espérance : E(aX + b) = aE(X) + b, avec a = −2 et b = 5.'},
      {q:'Si Y = −2X + 5, que vaut V(Y) ?', a:'4V(X)', d:['−2V(X)','−2V(X) + 5','4V(X) + 5'], e:'V(aX + b) = a²V(X) = (−2)² V(X) = 4V(X). Une variance n\'est jamais négative.'},
      {q:'Le gain algébrique X d\'un jeu vérifie E(X) = −0,4. Que peut-on dire du jeu ?', a:'Il est défavorable au joueur', d:['Il est équitable','Il est favorable au joueur','On ne peut rien dire sans V(X)'], e:'E(X) < 0 : en moyenne, le joueur perd 0,40 € par partie. Le jeu est défavorable au joueur.'},
      {q:'X* = (X − E(X)) / σ(X) est la variable centrée réduite associée à X. Que valent E(X*) et V(X*) ?', a:'E(X*) = 0 et V(X*) = 1', d:['E(X*) = 1 et V(X*) = 0','E(X*) = 0 et V(X*) = 0','E(X*) = E(X) et V(X*) = 1'], e:'Linéarité : E(X*) = (E(X) − E(X)) / σ = 0. Et V(X*) = V(X) / σ² = 1.'}
    ]);
    return {q:cas.q, a:cas.a, accept:null, choix:qcm(R,cas.a,cas.d), expl:cas.e};
  }
});

// =====================================================
// ect-13 — Coefficients binomiaux et lois usuelles
// =====================================================
SKILLS.push({
  id: 'p6-ect-13-binomiale',
  phase: 6,
  ordre: 13,
  titre: 'Coefficients binomiaux et loi binomiale',
  objectif: "Calculer n! et les coefficients binomiaux, puis reconnaître et exploiter les lois uniforme, de Bernoulli et binomiale.",
  lecon: `<p class="lede">Une même expérience simple répétée plusieurs fois — un client qui achète ou non, une pièce conforme ou non — c'est la situation la plus fréquente des sujets de concours. Pour la traiter, il faut un outil de comptage, les coefficients binomiaux, et une loi : la loi binomiale.</p>
<p><strong>Factorielle.</strong> n! = 1 × 2 × … × n (et 0! = 1). Par exemple 5! = 120. C'est le nombre de façons de ranger n objets dans un ordre.</p>
<p><strong>Coefficient binomial.</strong> ${bin('n','k')}, qui se lit « k parmi n », est le nombre de façons de choisir k éléments parmi n. Dans les exercices de l'app, on l'écrit sur une ligne : « 2 parmi 5 ».</p>
<div class="formule"><p>${bin('n','k')} = n! / (k! (n − k)!) &nbsp;•&nbsp; ${bin('n','k')} = ${bin('n','n − k')} &nbsp;•&nbsp; ${bin('n + 1','k + 1')} = ${bin('n','k')} + ${bin('n','k + 1')}</p></div>
<p>Exemple : ${bin(5,2)} = 5! / (2! × 3!) = 120 / (2 × 6) = 10. Interprétation qui va te servir : dans un arbre où l'on répète 5 fois une épreuve, il y a ${bin(5,2)} = 10 chemins qui contiennent exactement 2 succès. La symétrie se comprend aussi : choisir les 2 succès revient à choisir les 3 échecs. La dernière formule (Pascal) construit le triangle ligne par ligne : chaque nombre est la somme des deux nombres situés au-dessus.</p>
<table class="tbl"><tr><th>n \\ k</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr><tr><th>2</th><td>1</td><td>2</td><td>1</td><td></td><td></td><td></td></tr><tr><th>3</th><td>1</td><td>3</td><td>3</td><td>1</td><td></td><td></td></tr><tr><th>4</th><td>1</td><td>4</td><td>6</td><td>4</td><td>1</td><td></td></tr><tr><th>5</th><td>1</td><td>5</td><td>10</td><td>10</td><td>5</td><td>1</td></tr></table>
<p><strong>Trois lois usuelles.</strong></p>
<ul><li><strong>Uniforme</strong> sur ⟦1 ; n⟧ : chaque valeur 1, 2, …, n a la probabilité 1/n (un dé équilibré, un numéro tiré au hasard). E(X) = (n + 1)/2 et V(X) = (n² − 1)/12.</li>
<li><strong>Bernoulli</strong> B(p) : une seule épreuve, X = 1 en cas de succès (probabilité p), 0 sinon. E(X) = p et V(X) = p(1 − p).</li>
<li><strong>Binomiale</strong> B(n ; p) : X compte le nombre de succès quand on répète n fois, de façon <mark>indépendante</mark>, une épreuve de Bernoulli de paramètre p.</li></ul>
<div class="formule"><p>X ↪ B(n ; p) : P(X = k) = ${bin('n','k')} p<sup>k</sup> (1 − p)<sup>n − k</sup> &nbsp;•&nbsp; E(X) = np &nbsp;•&nbsp; V(X) = np(1 − p)</p></div>
<p>Exemple : 20 % des clients d'un magasin achètent l'article en promotion. On observe 4 clients, indépendamment. X = nombre d'acheteurs.</p>
<div class="etapes">
<p>1. Je reconnais la loi : 4 répétitions indépendantes, succès « acheter » de probabilité 0,2. Donc X ↪ B(4 ; 0,2).</p>
<p>2. P(X = 2) = ${bin(4,2)} × 0,2² × 0,8² = 6 × 0,04 × 0,64 = <mark>0,1536</mark>.</p>
<p>3. P(X = 0) = 0,8⁴ = 0,4096, donc P(X ≥ 1) = 1 − 0,4096 = 0,5904.</p>
<p>4. E(X) = 4 × 0,2 = 0,8 acheteur en moyenne, et V(X) = 4 × 0,2 × 0,8 = 0,64.</p>
</div>
<div class="box piege"><p class="box-t">Piège</p><p>La loi binomiale exige des répétitions <strong>indépendantes</strong> et identiques : tirages avec remise, ou population si grande que le tirage ne change rien. Un tirage sans remise dans un petit lot n'est pas binomial. Et ${bin('n','k')} n'est pas n!/k! : il manque le (n − k)! au dénominateur.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>${bin('n','k')} = n!/(k!(n − k)!) compte les chemins à k succès. Uniforme : E = (n + 1)/2. Bernoulli : E = p, V = p(1 − p). Binomiale B(n ; p) : P(X = k) = ${bin('n','k')} p<sup>k</sup>(1 − p)<sup>n − k</sup>, E = np, V = np(1 − p).</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Pour « au moins un succès », passe toujours par le contraire : P(X ≥ 1) = 1 − P(X = 0) = 1 − (1 − p)<sup>n</sup>. Et pour ${bin('n',2)}, retiens le raccourci n(n − 1)/2.</p></div>
<p>En prépa ECT : la rédaction type « on répète n fois, de manière indépendante, l'épreuve de Bernoulli… donc X ↪ B(n ; p) » est attendue mot pour mot aux concours, et la loi binomiale sert ensuite d'appui pour les approximations de 2e année.</p>`,
  gen(level, R){
    function bt(n,k){ return '« '+k+' parmi '+n+' »'; }

    if(level===1){
      var t=R.int(1,6);
      if(t===1){
        var n=R.int(3,7);
        if(R.int(1,2)===1){
          var dt=[]; for(var i=1;i<=n;i++) dt.push(i);
          return {q:'Calcule '+n+'! (factorielle '+n+').', a:String(fact(n)), accept:null, choix:null,
            expl:n+'! = '+dt.join(' × ')+' = '+fact(n)+'.'};
        }
        var m=R.int(5,12);
        return {q:'Calcule '+m+'! / '+(m-1)+'!.', a:String(m), accept:null, choix:null,
          expl:m+'! = '+m+' × '+(m-1)+'!, donc le quotient vaut '+m+'. Inutile de tout développer.'};
      }
      if(t===2){
        var n2=R.int(4,8), k2=R.int(2,3);
        var bon=String(Cb(n2,k2));
        var c=Cb(n2,k2);
        var q2=R.pick([
          'Calcule le coefficient binomial '+bt(n2,k2)+'.',
          'On répète '+n2+' fois une épreuve à deux issues (succès ou échec). Combien de chemins de l\'arbre contiennent exactement '+k2+' succès ?',
          'De combien de façons peut-on choisir '+k2+' produits parmi '+n2+' pour une vitrine ?'
        ]);
        return {q:q2, a:bon, accept:null,
          choix:qcm(R,bon,[String(fact(n2)/fact(k2)),String(fact(n2)/fact(n2-k2)),String(n2*k2),String(Cb(n2,k2+1)),String(c+n2),String(c+1)]),
          expl:bt(n2,k2)+' = '+n2+'! / ('+k2+'! × '+(n2-k2)+'!) = '+fact(n2)+' / ('+fact(k2)+' × '+fact(n2-k2)+') = '+c+'.'};
      }
      if(t===3){
        var n3=R.int(8,25), k3=R.int(1,2);
        var v3=Cb(n3,k3);
        return {q:'Calcule '+bt(n3,n3-k3)+'.', a:String(v3), accept:null, choix:null,
          expl:'Symétrie : '+bt(n3,n3-k3)+' = '+bt(n3,k3)+(k3===1?' = '+n3:' = '+n3+' × '+(n3-1)+' / 2 = '+v3)+'.'};
      }
      if(t===4){
        var p=R.pick([1,2,3,4,6,7,8,9])*10+R.pick([0,0,5]);
        if(R.int(1,2)===1){
          return {q:'X suit la loi de Bernoulli de paramètre p = '+D(p,2)+'. Calcule E(X).', a:D(p,2), accept:null, choix:null,
            expl:'Pour une loi de Bernoulli, E(X) = 0 × (1 − p) + 1 × p = p = '+D(p,2)+'.'};
        }
        return {q:'X suit la loi de Bernoulli de paramètre p = '+D(p,2)+'. Calcule V(X) (valeur exacte).', a:D(p*(100-p),4), accept:null, choix:null,
          expl:'V(X) = p(1 − p) = '+D(p,2)+' × '+D(100-p,2)+' = '+D(p*(100-p),4)+'.'};
      }
      if(t===5){
        var n5=R.int(4,30);
        var q5=R.pick([
          'X suit la loi uniforme sur ⟦1 ; '+n5+'⟧. Calcule E(X).',
          'On tire au hasard un ticket parmi '+n5+' tickets numérotés de 1 à '+n5+'. X est le numéro obtenu. Calcule E(X).'
        ]);
        return {q:q5, a:nf((n5+1)/2), accept:null, choix:null,
          expl:'X suit la loi uniforme sur ⟦1 ; '+n5+'⟧, donc E(X) = (n + 1)/2 = '+(n5+1)+'/2 = '+nf((n5+1)/2)+'.'};
      }
      var n6=R.int(5,10), k6=R.int(1,n6-2);
      var u=Cb(n6,k6), v=Cb(n6,k6+1);
      return {q:'On sait que '+bt(n6,k6)+' = '+u+' et '+bt(n6,k6+1)+' = '+v+'. Grâce à la formule de Pascal, calcule '+bt(n6+1,k6+1)+'.',
        a:String(u+v), accept:null, choix:null,
        expl:'Pascal : '+bt(n6+1,k6+1)+' = '+bt(n6,k6)+' + '+bt(n6,k6+1)+' = '+u+' + '+v+' = '+(u+v)+'.'};
    }

    if(level===2){
      var t2=R.int(1,6);
      if(t2===1){
        var nn=R.int(2,4), kk=R.int(0,nn), a=R.int(1,9);
        var num=Cb(nn,kk)*pw(a,kk)*pw(10-a,nn-kk);
        var ctx=R.pick([
          'X suit la loi binomiale B('+nn+' ; '+D(a,1)+'). Calcule P(X = '+kk+') (valeur exacte).',
          'Une machine produit une pièce défectueuse avec probabilité '+D(a,1)+', indépendamment d\'une pièce à l\'autre. On prélève '+nn+' pièces. Quelle est la probabilité qu\'exactement '+kk+' soient défectueuses ? (valeur exacte)',
          'Chaque client d\'un magasin achète un article en promotion avec probabilité '+D(a,1)+', indépendamment des autres. On observe '+nn+' clients et X compte les acheteurs. Calcule P(X = '+kk+') (valeur exacte).'
        ]);
        return {q:ctx, a:D(num,nn), accept:null, choix:null, pct:true,
          expl:'X ↪ B('+nn+' ; '+D(a,1)+'). P(X = '+kk+') = '+bt(nn,kk)+' × '+D(a,1)+(kk===1?'':sup(kk))+' × '+D(10-a,1)+(nn-kk===1?'':sup((nn-kk)))+' = '+Cb(nn,kk)+' × '+D(pw(a,kk),kk)+' × '+D(pw(10-a,nn-kk),nn-kk)+' = '+D(num,nn)+'.'};
      }
      if(t2===2){
        var n2=R.pick([10,20,25,40,50,100,200]), p2=R.pick([5,10,20,25,30,40,60,75,80]);
        var E=n2*p2/100, V=n2*p2*(100-p2)/10000;
        var c2=R.pick([
          ['Un commercial démarche '+n2+' prospects ; chacun signe un contrat avec probabilité '+D(p2,2)+', indépendamment. X est le nombre de contrats signés. ','contrats signés'],
          ['Un contrôle prélève '+n2+' pièces dans une grande production où '+p2+' % des pièces sont défectueuses. X est le nombre de pièces défectueuses. ','pièces défectueuses'],
          ['On envoie un e-mail promotionnel à '+n2+' clients ; chacun l\'ouvre avec probabilité '+D(p2,2)+', indépendamment. X est le nombre d\'e-mails ouverts. ','e-mails ouverts']
        ]);
        if(R.int(1,2)===1) return {q:c2[0]+'Calcule E(X).', a:nf(E), accept:null, choix:null,
          expl:'X ↪ B('+n2+' ; '+D(p2,2)+'), donc E(X) = np = '+n2+' × '+D(p2,2)+' = '+nf(E)+' '+c2[1]+' en moyenne.'};
        return {q:c2[0]+'Calcule V(X).', a:nf(V), accept:null, choix:null,
          expl:'X ↪ B('+n2+' ; '+D(p2,2)+'), donc V(X) = np(1 − p) = '+n2+' × '+D(p2,2)+' × '+D(100-p2,2)+' = '+nf(V)+'.'};
      }
      if(t2===3){
        var n3=R.int(5,30), p3=R.pick([10,20,30,40,60,70,80,90,15,25,35]);
        var sit=R.pick([
          'On lance '+n3+' fois une pièce truquée qui tombe sur pile avec probabilité '+D(p3,2)+'. X est le nombre de « pile ».',
          'Un QCM comporte '+n3+' questions indépendantes ; un candidat répond juste à chacune avec probabilité '+D(p3,2)+'. X est le nombre de bonnes réponses.',
          'Dans une très grande clientèle, '+p3+' % des clients sont abonnés. On interroge '+n3+' clients au hasard (tirages assimilés à des tirages avec remise). X est le nombre d\'abonnés interrogés.'
        ]);
        var bon3='B('+n3+' ; '+D(p3,2)+')';
        return {q:sit+' Quelle est la loi de X ?', a:bon3, accept:null,
          choix:qcm(R,bon3,['B('+n3+' ; '+D(100-p3,2)+')','B('+D(p3,2)+')','U(⟦1 ; '+n3+'⟧)','B('+(n3+1)+' ; '+D(p3,2)+')']),
          expl:'On répète '+n3+' fois, de manière indépendante, une même épreuve de Bernoulli dont le succès a pour probabilité '+D(p3,2)+'. X compte les succès : X ↪ B('+n3+' ; '+D(p3,2)+').'};
      }
      if(t2===4){
        var nb=R.int(2,4), ab=R.int(1,9), q0=pw(10-ab,nb);
        if(R.int(1,2)===1){
          return {q:'X suit la loi B('+nb+' ; '+D(ab,1)+'). Calcule P(X = 0) (valeur exacte).', a:D(q0,nb), accept:null, choix:null, pct:true,
            expl:'P(X = 0) = '+bt(nb,0)+' × '+D(ab,1)+'⁰ × '+D(10-ab,1)+sup(nb)+' = '+D(10-ab,1)+sup(nb)+' = '+D(q0,nb)+'.'};
        }
        return {q:'Chaque jour, un site web subit une panne avec probabilité '+D(ab,1)+', indépendamment des autres jours. Quelle est la probabilité d\'au moins une panne sur '+nb+' jours ? (valeur exacte)',
          a:D(pw(10,nb)-q0,nb), accept:null, choix:null, pct:true,
          expl:'X = nombre de jours de panne, X ↪ B('+nb+' ; '+D(ab,1)+'). P(X ≥ 1) = 1 − P(X = 0) = 1 − '+D(10-ab,1)+sup(nb)+' = 1 − '+D(q0,nb)+' = '+D(pw(10,nb)-q0,nb)+'.'};
      }
      if(t2===5){
        var nc=R.int(3,6), kc=R.int(0,nc), cc=Cb(nc,kc), dd=pw(2,nc);
        return {q:'On lance '+nc+' fois une pièce équilibrée. Quelle est la probabilité d\'obtenir exactement '+kc+' fois « pile » ? (fraction)',
          a:fq(cc,dd), accept:[cc+'/'+dd], choix:null, pct:true,
          expl:'X ↪ B('+nc+' ; 1/2). P(X = '+kc+') = '+bt(nc,kc)+' × (1/2)'+sup(kc)+' × (1/2)'+sup((nc-kc))+' = '+cc+'/'+dd+(fq(cc,dd)!==cc+'/'+dd?' = '+fq(cc,dd):'')+'.'};
      }
      var n6=R.int(4,9), k6=R.int(2,n6-2);
      var bon6=String(Cb(n6,k6));
      return {q:'Une machine fabrique '+n6+' pièces ; chacune est conforme (C) ou non (N). Combien de suites différentes de résultats comportent exactement '+k6+' pièces non conformes ?',
        a:bon6, accept:null, choix:qcm(R,bon6,[String(fact(n6)/fact(k6)),String(n6*k6),String(pw(2,n6)),String(Cb(n6,k6-1)),String(fact(n6)/fact(n6-k6))]),
        expl:'Il s\'agit de choisir les '+k6+' rangs des pièces non conformes parmi '+n6+' : '+bt(n6,k6)+' = '+n6+'! / ('+k6+'! × '+(n6-k6)+'!) = '+bon6+'.'};
    }

    // level 3
    var t3=R.int(1,6);
    if(t3===1){
      var n=R.int(4,6), a3=R.int(1,4), le=R.int(1,2)===1;
      var p0=pw(10-a3,n), p1=n*a3*pw(10-a3,n-1), den=pw(10,n);
      var nume=le?(p0+p1):(den-p0-p1);
      var ar=arrondi(nume,den,2), acc=[D(nume,n)]; if(ar.alt) acc.push(ar.alt);
      var lab=le?'au plus une':'au moins deux';
      return {q:'Dans une production, '+(a3*10)+' % des pièces sont défectueuses. On prélève '+n+' pièces (tirages assimilés à des tirages avec remise). Quelle est la probabilité d\'obtenir '+lab+' pièce'+(le?'':'s')+' défectueuse'+(le?'':'s')+' ? (arrondi à 0,01)',
        a:ar.s, accept:acc, choix:null, pct:true,
        expl:'X ↪ B('+n+' ; '+D(a3,1)+'). P(X = 0) = '+D(10-a3,1)+sup(n)+' = '+D(p0,n)+' et P(X = 1) = '+n+' × '+D(a3,1)+' × '+D(10-a3,1)+sup((n-1))+' = '+D(p1,n)+'. '+(le?'P(X ≤ 1) = '+D(p0,n)+' + '+D(p1,n)+' = '+D(nume,n):'P(X ≥ 2) = 1 − P(X = 0) − P(X = 1) = '+D(nume,n))+' ≈ '+ar.s+'.'};
    }
    if(t3===2){
      if(R.int(1,2)===1){
        var pp=R.pick([2,4,5,8,10,20,25]), mult=R.int(2,12), nn3=mult*100/gcd(100,pp);
        var E3=nn3*pp/100;
        return {q:'Le taux de clics sur une publicité est de '+pp+' %, indépendamment d\'un internaute à l\'autre. Combien d\'internautes faut-il toucher pour obtenir en moyenne '+nf(E3)+' clics ?',
          a:String(nn3), accept:null, choix:null,
          expl:'X ↪ B(n ; '+D(pp,2)+') et E(X) = np. On veut n × '+D(pp,2)+' = '+nf(E3)+', donc n = '+nf(E3)+' / '+D(pp,2)+' = '+nn3+'.'};
      }
      var pv=R.pick([10,20,25,40,50,60,75,80]), nv=R.pick([20,40,60,80,100,200]);
      var Ev=nv*pv/100, Vv=nv*pv*(100-pv)/10000;
      return {q:'X suit une loi binomiale B(n ; p) avec E(X) = '+nf(Ev)+' et V(X) = '+nf(Vv)+'. Détermine p.',
        a:D(pv,2), accept:null, choix:null, pct:true,
        expl:'V(X) / E(X) = np(1 − p) / (np) = 1 − p = '+nf(Vv)+' / '+nf(Ev)+' = '+D(100-pv,2)+'. Donc p = '+D(pv,2)+' (et n = '+nf(Ev)+' / '+D(pv,2)+' = '+nv+').'};
    }
    if(t3===3){
      var ng=R.pick([10,20,30,50]), pg=R.pick([10,20,25,40,50]), ag=R.pick([5,10,20,50]), cg=R.pick([2,3,5,10]);
      var EG=ag*ng*pg/100-cg*ng, VG=ag*ag*ng*pg*(100-pg)/10000;
      var head='Un vendeur rencontre '+ng+' clients par jour ; chacun achète avec probabilité '+D(pg,2)+', indépendamment. X est le nombre de ventes. Chaque vente rapporte '+ag+' € et chaque rendez-vous coûte '+cg+' € : le gain du jour est G = '+ag+'X − '+(cg*ng)+'. ';
      if(R.int(1,2)===1) return {q:head+'Calcule E(G), en €.', a:nf(EG), accept:null, choix:null,
        expl:'X ↪ B('+ng+' ; '+D(pg,2)+'), donc E(X) = '+ng+' × '+D(pg,2)+' = '+nf(ng*pg/100)+'. Linéarité : E(G) = '+ag+' × '+nf(ng*pg/100)+' − '+(cg*ng)+' = '+nf(EG)+' €.'};
      return {q:head+'Calcule V(G).', a:nf(VG), accept:null, choix:null,
        expl:'V(X) = np(1 − p) = '+ng+' × '+D(pg,2)+' × '+D(100-pg,2)+' = '+nf(ng*pg*(100-pg)/10000)+'. V(G) = '+ag+'² × V(X) = '+(ag*ag)+' × '+nf(ng*pg*(100-pg)/10000)+' = '+nf(VG)+'.'};
    }
    if(t3===4){
      var nu=R.int(3,15);
      var q4=R.pick([
        'X suit la loi uniforme sur ⟦1 ; '+nu+'⟧. Calcule V(X) (valeur exacte).',
        'Un employé est tiré au sort parmi '+nu+' employés numérotés de 1 à '+nu+'. X est le numéro obtenu. Calcule V(X) (valeur exacte).'
      ]);
      return {q:q4, a:fq(nu*nu-1,12), accept:[(nu*nu-1)+'/12'], choix:null,
        expl:'Loi uniforme sur ⟦1 ; n⟧ : V(X) = (n² − 1)/12 = ('+(nu*nu)+' − 1)/12 = '+(nu*nu-1)+'/12'+(fq(nu*nu-1,12)!==(nu*nu-1)+'/12'?' = '+fq(nu*nu-1,12):'')+'.'};
    }
    if(t3===5){
      var nk=R.int(5,16), val=nk*(nk-1)/2;
      if(R.int(1,2)===1){
        return {q:'Dans un tournoi, chaque équipe rencontre une fois chacune des autres. Il y a '+val+' matchs au total. Combien y a-t-il d\'équipes ?',
          a:String(nk), accept:null, choix:null,
          expl:'Un match = un choix de 2 équipes parmi n : '+bt('n',2)+' = n(n − 1)/2 = '+val+', donc n(n − 1) = '+(2*val)+' = '+nk+' × '+(nk-1)+'. Il y a '+nk+' équipes.'};
      }
      return {q:'Trouve l\'entier n tel que '+bt('n',2)+' = '+val+'.', a:String(nk), accept:null, choix:null,
        expl:bt('n',2)+' = n(n − 1)/2 = '+val+' donne n(n − 1) = '+(2*val)+' = '+nk+' × '+(nk-1)+', donc n = '+nk+'.'};
    }
    var nd=R.int(2,4), kd=R.int(0,Math.min(2,nd)), cd=Cb(nd,kd)*pw(5,nd-kd), dd6=pw(6,nd);
    return {q:'On lance '+nd+' fois un dé équilibré. X est le nombre de 6 obtenus. Calcule P(X = '+kd+') (valeur exacte, en fraction).',
      a:fq(cd,dd6), accept:[cd+'/'+dd6], choix:null, pct:true,
      expl:'X ↪ B('+nd+' ; 1/6). P(X = '+kd+') = '+bt(nd,kd)+' × (1/6)'+sup(kd)+' × (5/6)'+sup((nd-kd))+' = '+Cb(nd,kd)+' × '+pw(5,nd-kd)+' / '+dd6+' = '+cd+'/'+dd6+(fq(cd,dd6)!==cd+'/'+dd6?' = '+fq(cd,dd6):'')+'.'};
  }
});

// =====================================================
// ect-14 — Systèmes linéaires et calcul matriciel
// =====================================================
SKILLS.push({
  id: 'p6-ect-14-systemes-matrices',
  phase: 6,
  ordre: 14,
  titre: 'Pivot de Gauss et calcul matriciel',
  objectif: "Résoudre un système 2×2 ou 3×3 par la méthode du pivot de Gauss, l'écrire sous forme AX = B et calculer avec des matrices (somme, produit).",
  lecon: `<p class="lede">Trois inconnues, trois équations : au lycée, on bricolait par substitution. En prépa, on applique une méthode qui marche à tous les coups, le <mark>pivot de Gauss</mark>, et on range les nombres dans des tableaux appelés matrices.</p>
<p><strong>Convention d'écriture dans les exercices.</strong> Un système s'écrit sur une ligne : { x + y + z = 6 ; 2x − y + z = 3 ; … }. Une matrice s'écrit ligne par ligne, les lignes séparées par un point-virgule : A = (2 1 ; 0 3) est la matrice dont la 1re ligne est 2, 1 et la 2e ligne 0, 3. Une matrice colonne s'écrit (1 ; −2 ; 3).</p>
<p><strong>Le pivot de Gauss.</strong> On note L1, L2, L3 les lignes. Trois opérations ne changent pas les solutions : échanger deux lignes (Li ↔ Lj), multiplier une ligne par un réel non nul (Li ← αLi), ajouter à une ligne un multiple d'une autre (Li ← Li + βLj, ou plus généralement Li ← αLi + βLj avec α ≠ 0). Le but : faire apparaître un système <mark>triangulaire</mark>, puis remonter.</p>
<div class="etapes">
<p>1. Système : { x + y + z = 6 ; 2x − y + z = 3 ; x + 2y − z = 2 }. Le pivot est le coefficient 1 devant x dans L1.</p>
<p>2. J'élimine x dans L2 et L3 : L2 ← L2 − 2L1 donne −3y − z = −9 ; L3 ← L3 − L1 donne y − 2z = −4.</p>
<p>3. J'élimine y dans L3 avec le nouveau pivot −3 : L3 ← 3L3 + L2 donne −7z = −21.</p>
<p>4. Le système est triangulaire : { x + y + z = 6 ; −3y − z = −9 ; −7z = −21 }.</p>
<p>5. Je remonte : z = 3 ; puis −3y − 3 = −9, donc y = 2 ; puis x = 6 − 2 − 3 = 1. Solution <mark>(1 ; 2 ; 3)</mark>, que je vérifie dans les trois équations de départ.</p>
</div>
<p>Pour un système 2×2, c'est la même chose avec une seule élimination. Quand chaque étape fournit un pivot non nul, le système a une solution unique (on dit qu'il est de Cramer).</p>
<p><strong>Calcul matriciel.</strong> Une matrice à n lignes et p colonnes est un tableau de nombres. On additionne deux matrices de même taille coefficient par coefficient, et multiplier par un réel, c'est multiplier chaque coefficient. Le <mark>produit</mark> AB existe quand le nombre de colonnes de A est égal au nombre de lignes de B ; le coefficient ligne i, colonne j de AB est obtenu en faisant « ligne i de A × colonne j de B » : on multiplie terme à terme et on additionne.</p>
<div class="formule"><p>(1 2 ; 3 4) × (0 1 ; 1 0) = (2 1 ; 4 3) &nbsp;•&nbsp; mais (0 1 ; 1 0) × (1 2 ; 3 4) = (3 4 ; 1 2)</p></div>
<p>Exemple économique : deux magasins vendent trois produits. Les quantités vendues forment Q = (10 5 2 ; 4 8 6) (une ligne par magasin), les prix unitaires la colonne P = (3 ; 2 ; 5).</p>
<table class="tbl" style="min-width:0;width:auto"><tr><th></th><th>Produit 1</th><th>Produit 2</th><th>Produit 3</th><th>Recette = QP</th></tr><tr><th>Magasin 1</th><td>10</td><td>5</td><td>2</td><td>10 × 3 + 5 × 2 + 2 × 5 = 50</td></tr><tr><th>Magasin 2</th><td>4</td><td>8</td><td>6</td><td>4 × 3 + 8 × 2 + 6 × 5 = 58</td></tr></table>
<p><strong>Écriture matricielle.</strong> Le système { x + y + z = 6 ; 2x − y + z = 3 ; x + 2y − z = 2 } s'écrit AX = B avec A = (1 1 1 ; 2 −1 1 ; 1 2 −1), X = (x ; y ; z) et B = (6 ; 3 ; 2) : la ligne i de A contient les coefficients de l'équation i.</p>
<div class="box piege"><p class="box-t">Piège</p><p>Le produit n'est <strong>pas commutatif</strong> : en général AB ≠ BA (l'exemple ci-dessus le montre). Et on ne multiplie pas deux matrices coefficient par coefficient : c'est toujours ligne × colonne.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Pivot de Gauss : Li ↔ Lj, Li ← αLi, Li ← Li + βLj, jusqu'au système triangulaire, puis on remonte. Coefficient (i, j) de AB = ligne i de A × colonne j de B. Taille : (n × p) × (p × q) donne n × q. AB ≠ BA en général.</p></div>
<div class="box astuce"><p class="box-t">Astuce</p><p>Écris toujours l'opération (L2 ← L2 − 2L1) à côté de la ligne transformée, et termine par une vérification de la solution dans les équations de départ : c'est 20 secondes qui sauvent des points.</p></div>
<p>En prépa ECT : ce chapitre est repris en 2e année avec les matrices carrées (puissances, inverses, suites récurrentes), et le pivot de Gauss reste la méthode de base pour résoudre tout système et inverser une matrice.</p>`,
  gen(level, R){
    var V2=['x','y'], V3=['x','y','z'];
    function nz(a,b){ var v=R.int(a,b-1); return v>=0?v+1:v; } // entier non nul dans [a ; b]
    // Système 2×2 de Cramer à solution entière (tentatives bornées, repli fixe).
    function sys2(lo,hi){
      var M=null, s=[R.int(lo,hi),R.int(lo,hi)];
      for(var t=0;t<30 && !M;t++){
        var a=nz(-4,5), b=nz(-4,5), c=nz(-4,5), d=nz(-4,5);
        if(det2(a,b,c,d)!==0) M=[[a,b],[c,d]];
      }
      if(!M) M=[[1,2],[3,-1]];
      return {M:M, s:s, S:[[M[0][0],M[0][1],M[0][0]*s[0]+M[0][1]*s[1]],[M[1][0],M[1][1],M[1][0]*s[0]+M[1][1]*s[1]]]};
    }
    // Système 3×3 de Cramer : A = L·U (L unitriangulaire inférieure, U triangulaire à diagonale non nulle).
    function sys3(){
      var U=[[R.pick([1,1,1,2,-1]),R.int(-2,2),R.int(-2,2)],[0,R.pick([1,-1,2,-2,3]),R.int(-2,2)],[0,0,R.pick([1,-1,2,-2,3,-3])]];
      var L=[[1,0,0],[R.int(-2,2),1,0],[R.int(-2,2),R.int(-2,2),1]];
      var A=mul(L,U);
      if(R.int(1,3)===1){ var tmp=A[1]; A[1]=A[2]; A[2]=tmp; }
      if(det3(A)===0) A=[[1,1,1],[2,-1,1],[1,2,-1]];
      var s=[R.int(-3,5),R.int(-3,5),R.int(-3,5)], S=[];
      for(var i=0;i<3;i++) S.push([A[i][0],A[i][1],A[i][2],A[i][0]*s[0]+A[i][1]*s[1]+A[i][2]*s[2]]);
      return {A:A, s:s, S:S};
    }
    function rnd(n,p,lo,hi){ var M=[]; for(var i=0;i<n;i++){ var r=[]; for(var j=0;j<p;j++) r.push(R.int(lo,hi)); M.push(r); } return M; }
    function ligne(M,i){ return M[i]; }
    function colonne(M,j){ var c=[]; for(var i=0;i<M.length;i++) c.push(M[i][j]); return c; }

    if(level===1){
      var t=R.int(1,5);
      if(t===1){
        var P=sys2(-5,6), iv=R.int(0,1);
        return {q:'Résous le système '+sysTxt(P.S,V2)+'. Donne '+V2[iv]+'.', a:nf(P.s[iv]), accept:null, choix:null,
          expl:gauss(P.S,V2,P.s)+' Solution : x = '+nf(P.s[0])+', y = '+nf(P.s[1])+'.'};
      }
      if(t===2){
        var A=rnd(2,2,-4,6), B=rnd(2,2,-4,6), al=R.pick([2,3,-1,-2]), be=R.pick([1,1,2,-1,-3]);
        var i=R.int(0,1), j=R.int(0,1), v=al*A[i][j]+be*B[i][j];
        var lib=(al===-1?'−':nf(al))+'A '+(be<0?'− ':'+ ')+(Math.abs(be)===1?'':Math.abs(be))+'B';
        return {q:'A = '+mat(A)+' et B = '+mat(B)+'. Donne le coefficient ligne '+(i+1)+', colonne '+(j+1)+' de la matrice '+lib+'.',
          a:nf(v), accept:null, choix:null,
          expl:'On travaille coefficient par coefficient : '+par(al)+' × '+par(A[i][j])+' + '+par(be)+' × '+par(B[i][j])+' = '+nf(v)+'.'};
      }
      if(t===3){
        var A3=rnd(2,2,-3,5), X=rnd(2,1,-3,5), i3=R.int(0,1);
        var v3=A3[i3][0]*X[0][0]+A3[i3][1]*X[1][0];
        return {q:'A = '+mat(A3)+' et X = '+mat(X)+' (matrice colonne). Donne le coefficient de la ligne '+(i3+1)+' de AX.',
          a:nf(v3), accept:null, choix:null,
          expl:'Ligne '+(i3+1)+' de A × colonne X : '+lc(A3[i3],[X[0][0],X[1][0]])+'.'};
      }
      if(t===4){
        var a1=nz(-3,4), k=nz(-3,4), b1=nz(-5,6), b2=nz(-5,6);
        var a2=k*a1;
        var S=[[a1,b1,R.int(-9,9)],[a2,b2,R.int(-9,9)]];
        var ks=Math.abs(k)===1?'':String(Math.abs(k));
        var bon='L2 ← L2 '+(k>0?'−':'+')+' '+ks+'L1';
        var faux=['L2 ← L2 '+(k>0?'+':'−')+' '+ks+'L1', 'L2 ← '+ks+'L2 − L1', 'L1 ← L1 '+(k>0?'−':'+')+' '+ks+'L2', 'L2 ← L1 − L2'];
        if(Math.abs(k)===1) faux[1]='L2 ← 2L2 '+(k>0?'−':'+')+' L1';
        return {q:'Dans le système '+sysTxt(S,V2)+', quelle opération élimine x de la 2e ligne ?', a:bon, accept:null,
          choix:qcm(R,bon,faux),
          expl:'Le coefficient de x dans L2 ('+nf(a2)+') vaut '+nf(k)+' fois celui de L1 ('+nf(a1)+'). '+bon+' donne pour x : '+nf(a2)+(k>0?' − ':' + ')+Math.abs(k)+' × '+par(a1)+' = 0 : x disparaît de L2.'};
      }
      var n5=R.int(2,3), Vn=n5===2?V2:V3, M5=[], sec=rnd(n5,1,-9,12), S5=[];
      for(var r=0;r<n5;r++){ var rw=[]; for(var cc=0;cc<n5;cc++) rw.push(nz(-4,6)); M5.push(rw); S5.push(rw.concat([sec[r][0]])); }
      var i5=R.int(0,n5-1), j5=R.int(0,n5-1);
      return {q:'On écrit le système '+sysTxt(S5,Vn)+' sous la forme AX = B, avec X = ('+Vn.join(' ; ')+'). Donne le coefficient ligne '+(i5+1)+', colonne '+(j5+1)+' de A.',
        a:nf(M5[i5][j5]), accept:null, choix:null,
        expl:'La ligne '+(i5+1)+' de A contient les coefficients de l\'équation '+(i5+1)+', dans l\'ordre '+Vn.join(', ')+'. La colonne '+(j5+1)+' correspond à '+Vn[j5]+' : le coefficient est '+nf(M5[i5][j5])+'.'};
    }

    if(level===2){
      var t2=R.int(1,6);
      if(t2===1){
        var d=[R.pick([1,2,-1,3]),R.pick([1,2,-1,-2,3]),R.pick([1,2,-1,-2,3,4])];
        var T=[[d[0],R.int(-3,3),R.int(-3,3)],[0,d[1],R.int(-3,3)],[0,0,d[2]]];
        var s=[R.int(-4,6),R.int(-4,6),R.int(-4,6)], ST=[];
        for(var ii=0;ii<3;ii++) ST.push([T[ii][0],T[ii][1],T[ii][2],T[ii][0]*s[0]+T[ii][1]*s[1]+T[ii][2]*s[2]]);
        var iv2=R.pick([0,0,1,2]);
        return {q:'Le système '+sysTxt(ST,V3)+' est triangulaire. Résous-le et donne '+V3[iv2]+'.', a:nf(s[iv2]), accept:null, choix:null,
          expl:gauss(ST,V3,s)};
      }
      if(t2===2){
        var A2=rnd(2,2,-3,5), B2=rnd(2,2,-3,5), i2=R.int(0,1), j2=R.int(0,1);
        var C2=mul(A2,B2);
        return {q:'A = '+mat(A2)+' et B = '+mat(B2)+'. Donne le coefficient ligne '+(i2+1)+', colonne '+(j2+1)+' de AB.',
          a:nf(C2[i2][j2]), accept:null, choix:null,
          expl:'Ligne '+(i2+1)+' de A × colonne '+(j2+1)+' de B : '+lc(ligne(A2,i2),colonne(B2,j2))+'.'};
      }
      if(t2===3){
        var A3=rnd(2,3,-3,5), X3=rnd(3,1,-3,4), i3=R.int(0,1);
        var C3=mul(A3,X3);
        return {q:'A = '+mat(A3)+' (2 lignes, 3 colonnes) et X = '+mat(X3)+' (colonne). Donne le coefficient de la ligne '+(i3+1)+' de AX.',
          a:nf(C3[i3][0]), accept:null, choix:null,
          expl:'AX est une matrice colonne à 2 lignes. Ligne '+(i3+1)+' de A × X : '+lc(ligne(A3,i3),colonne(X3,0))+'.'};
      }
      if(t2===4){
        var Q=rnd(2,3,1,12), Pz=[[R.int(2,15)],[R.int(2,15)],[R.int(2,15)]], m=R.int(0,1);
        var rec=Q[m][0]*Pz[0][0]+Q[m][1]*Pz[1][0]+Q[m][2]*Pz[2][0];
        var c4=R.pick([
          ['Deux magasins vendent trois produits. Les quantités vendues sont Q = '+mat(Q)+' (une ligne par magasin, une colonne par produit) et les prix unitaires, en €, P = '+mat(Pz)+'. Calcule la recette du magasin '+(m+1)+', c\'est-à-dire le coefficient de la ligne '+(m+1)+' de QP.','€'],
          ['Une entreprise a deux ateliers qui utilisent trois matières premières. Les quantités consommées (en kg) sont Q = '+mat(Q)+' (une ligne par atelier) et les coûts au kg, en €, C = '+mat(Pz)+'. Calcule le coût de l\'atelier '+(m+1)+' (ligne '+(m+1)+' de QC).','€']
        ]);
        return {q:c4[0], a:nf(rec), accept:null, choix:null,
          expl:'Ligne '+(m+1)+' × colonne des prix : '+lc(Q[m],[Pz[0][0],Pz[1][0],Pz[2][0]])+' €.'};
      }
      if(t2===5){
        var pr=[R.int(8,30),R.int(8,30)], M=null;
        for(var tt=0;tt<30 && !M;tt++){ var a=R.int(1,5), b=R.int(1,5), c=R.int(1,5), dd=R.int(1,5); if(det2(a,b,c,dd)!==0) M=[[a,b],[c,dd]]; }
        if(!M) M=[[2,3],[1,4]];
        var t1=M[0][0]*pr[0]+M[0][1]*pr[1], t2b=M[1][0]*pr[0]+M[1][1]*pr[1];
        var obj=R.pick([
          [{s:'café',p:'cafés',d:'d\'un café'},{s:'croissant',p:'croissants',d:'d\'un croissant'}],
          [{s:'stylo',p:'stylos',d:'d\'un stylo'},{s:'cahier',p:'cahiers',d:'d\'un cahier'}],
          [{s:'ticket de bus',p:'tickets de bus',d:'d\'un ticket de bus'},{s:'ticket de métro',p:'tickets de métro',d:'d\'un ticket de métro'}],
          [{s:'kilo de pommes',p:'kilos de pommes',d:'d\'un kilo de pommes'},{s:'kilo de poires',p:'kilos de poires',d:'d\'un kilo de poires'}]
        ]);
        var who=R.int(0,1);
        var qt=function(k,it){ return k+' '+(k>1?it.p:it.s); };
        var eur=function(tenths){ return (tenths/10).toFixed(2).replace('.',','); };
        var S2=[[M[0][0],M[0][1],t1/10],[M[1][0],M[1][1],t2b/10]];
        return {q:'Une commande de '+qt(M[0][0],obj[0])+' et '+qt(M[0][1],obj[1])+' coûte '+eur(t1)+' € ; une commande de '+qt(M[1][0],obj[0])+' et '+qt(M[1][1],obj[1])+' coûte '+eur(t2b)+' €. Quel est le prix '+obj[who].d+', en € ?',
          a:nf(pr[who]/10), accept:[eur(pr[who])], choix:null,
          expl:'On note x le prix '+obj[0].d+' et y celui '+obj[1].d+' : '+sysTxt(S2,V2)+'. '+gauss(S2,V2,[pr[0]/10,pr[1]/10])+' Le prix '+obj[who].d+' est donc de '+eur(pr[who])+' €.'};
      }
      var P3=sys3(), il=R.int(0,2);
      var bonEq=eq(P3.S[il],V3);
      var trans=[colonne(P3.A,il)[0],colonne(P3.A,il)[1],colonne(P3.A,il)[2],P3.S[il][3]];
      var autreB=P3.S[(il+1)%3][3];
      return {q:'A = '+mat(P3.A)+', X = (x ; y ; z) et B = '+mat([[P3.S[0][3]],[P3.S[1][3]],[P3.S[2][3]]])+'. Quelle est l\'équation n° '+(il+1)+' du système AX = B ?',
        a:bonEq, accept:null,
        choix:qcm(R,bonEq,[eq(trans,V3),eq(P3.S[il].slice(0,3).concat([autreB]),V3),eq(P3.S[il].slice(0,3).concat([-P3.S[il][3]]),V3),eq([P3.S[il][0],P3.S[il][1],-P3.S[il][2]+(P3.S[il][2]===0?1:0),P3.S[il][3]],V3),eq([P3.S[il][0]+1,P3.S[il][1],P3.S[il][2],P3.S[il][3]],V3)]),
        expl:'La ligne '+(il+1)+' de A donne les coefficients de x, y, z ; le coefficient '+(il+1)+' de B donne le second membre : '+bonEq+'. Attention à ne pas lire une colonne de A à la place d\'une ligne.'};
    }

    // level 3
    var t3=R.int(1,6);
    if(t3===1){
      var P=sys3(), iv3=R.int(0,2);
      return {q:'Résous par la méthode du pivot de Gauss le système '+sysTxt(P.S,V3)+'. Donne '+V3[iv3]+'.', a:nf(P.s[iv3]), accept:null, choix:null,
        expl:gauss(P.S,V3,P.s)+' Solution (x ; y ; z) = ('+P.s.map(nf).join(' ; ')+').'};
    }
    if(t3===2){
      var A=null, pr3=[R.int(2,9),R.int(2,9),R.int(2,9)];
      for(var tt3=0;tt3<40 && !A;tt3++){ var Mt=rnd(3,3,1,4); if(det3(Mt)!==0) A=Mt; }
      if(!A) A=[[1,1,1],[1,2,3],[2,1,1]];
      var S3=[];
      for(var r3=0;r3<3;r3++) S3.push([A[r3][0],A[r3][1],A[r3][2],A[r3][0]*pr3[0]+A[r3][1]*pr3[1]+A[r3][2]*pr3[2]]);
      var obj3=R.pick([
        [{s:'T-shirt',p:'T-shirts',d:'d\'un T-shirt'},{s:'casquette',p:'casquettes',d:'d\'une casquette'},{s:'sac',p:'sacs',d:'d\'un sac'}],
        [{s:'kilo de farine',p:'kilos de farine',d:'d\'un kilo de farine'},{s:'kilo de sucre',p:'kilos de sucre',d:'d\'un kilo de sucre'},{s:'kilo de beurre',p:'kilos de beurre',d:'d\'un kilo de beurre'}],
        [{s:'heure de montage',p:'heures de montage',d:'d\'une heure de montage'},{s:'heure de peinture',p:'heures de peinture',d:'d\'une heure de peinture'},{s:'heure d\'emballage',p:'heures d\'emballage',d:'d\'une heure d\'emballage'}]
      ]);
      var w=R.int(0,2);
      var qt3=function(k,it){ return k+' '+(k>1?it.p:it.s); };
      var q3='Trois commandes : '+S3.map(function(rw){ return qt3(rw[0],obj3[0])+', '+qt3(rw[1],obj3[1])+' et '+qt3(rw[2],obj3[2])+' pour '+rw[3]+' €'; }).join(' ; ')+'. On note x, y, z les prix respectifs '+obj3[0].d+', '+obj3[1].d+' et '+obj3[2].d+'. Résous le système et donne le prix '+obj3[w].d+', en €.';
      return {q:q3, a:nf(pr3[w]), accept:null, choix:null,
        expl:'Système : '+sysTxt(S3,V3)+'. '+gauss(S3,V3,pr3)+' Le prix cherché est '+nf(pr3[w])+' €.'};
    }
    if(t3===3){
      if(R.int(1,2)===1){
        var A4=rnd(3,3,-2,4), X4=rnd(3,1,-3,4), i4=R.int(0,2), C4=mul(A4,X4);
        return {q:'A = '+mat(A4)+' et X = '+mat(X4)+'. Donne le coefficient de la ligne '+(i4+1)+' de AX.', a:nf(C4[i4][0]), accept:null, choix:null,
          expl:'Ligne '+(i4+1)+' de A × X : '+lc(A4[i4],colonne(X4,0))+'.'};
      }
      var A5=rnd(3,3,-2,3), B5=rnd(3,3,-2,3), i5=R.int(0,2), j5=R.int(0,2), C5=mul(A5,B5);
      return {q:'A = '+mat(A5)+' et B = '+mat(B5)+'. Donne le coefficient ligne '+(i5+1)+', colonne '+(j5+1)+' de AB.', a:nf(C5[i5][j5]), accept:null, choix:null,
        expl:'Ligne '+(i5+1)+' de A × colonne '+(j5+1)+' de B '+colTxt(B5,j5)+' : '+lc(A5[i5],colonne(B5,j5))+'.'};
    }
    if(t3===4){
      var A6=rnd(2,2,-3,4), B6=rnd(2,2,-3,4), i6=R.int(0,1), j6=R.int(0,1);
      var AB=mul(A6,B6), BA=mul(B6,A6);
      if(AB[i6][j6]===BA[i6][j6]){ B6[0][1]+=1; AB=mul(A6,B6); BA=mul(B6,A6); }
      var bon=nf(BA[i6][j6]);
      return {q:'A = '+mat(A6)+' et B = '+mat(B6)+'. On a calculé AB = '+mat(AB)+'. Donne le coefficient ligne '+(i6+1)+', colonne '+(j6+1)+' de BA.',
        a:bon, accept:null, choix:null,
        expl:'Dans BA, c\'est la ligne '+(i6+1)+' de B × la colonne '+(j6+1)+' de A : '+lc(B6[i6],colonne(A6,j6))+'. '+(BA[i6][j6]!==AB[i6][j6]?'Ce n\'est pas le coefficient '+nf(AB[i6][j6])+' de AB : le produit matriciel n\'est pas commutatif.':'')};
    }
    if(t3===5){
      var A7=rnd(2,2,-3,4), i7=R.int(0,1), j7=R.int(0,1), A2=mul(A7,A7);
      var bon7=nf(A2[i7][j7]);
      return {q:'A = '+mat(A7)+'. Donne le coefficient ligne '+(i7+1)+', colonne '+(j7+1)+' de A² = A × A.', a:bon7, accept:null,
        choix:qcm(R,bon7,[nf(A7[i7][j7]*A7[i7][j7]),nf(2*A7[i7][j7]),nf(A2[i7][j7]+1),nf(A2[1-i7][1-j7]),nf(A2[i7][j7]-2),nf(A2[i7][j7]+2),nf(A2[i7][j7]-1),nf(A2[i7][j7]+3)]),
        expl:'A² = A × A : ligne '+(i7+1)+' de A × colonne '+(j7+1)+' de A : '+lc(A7[i7],colonne(A7,j7))+(A2[i7][j7]!==A7[i7][j7]*A7[i7][j7]?'. Ce n\'est pas le carré du coefficient ('+par(A7[i7][j7])+'² = '+nf(A7[i7][j7]*A7[i7][j7])+').':'. Ici le résultat coïncide avec le carré du coefficient, mais c\'est un hasard : la règle reste ligne × colonne.')};
    }
    var S6=rnd(3,3,0,9), Pp=[[R.int(5,40)],[R.int(5,40)],[R.int(5,40)]], m6=R.int(0,2);
    var val=S6[m6][0]*Pp[0][0]+S6[m6][1]*Pp[1][0]+S6[m6][2]*Pp[2][0];
    return {q:'Trois entrepôts stockent trois références. Le stock est S = '+mat(S6)+' (une ligne par entrepôt, en unités) et la valeur unitaire, en €, V = '+mat(Pp)+'. Quelle est la valeur du stock de l\'entrepôt '+(m6+1)+' (ligne '+(m6+1)+' de SV), en € ?',
      a:nf(val), accept:null, choix:null,
      expl:'Ligne '+(m6+1)+' de S × colonne V : '+lc(S6[m6],colonne(Pp,0))+' €.'};
  }
});

})();
