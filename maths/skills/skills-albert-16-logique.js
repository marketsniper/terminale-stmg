/* ===== Maths · Objectif Albert School : alb-16 · Logique : implications, menteurs, affirmations vraies ou fausses =====
   Fichier frère de skills/skills-albert.js : une IIFE qui pousse UN objet dans window.ALBERT_SKILLS.
   Aucune banque d'énigmes fixes : chaque énoncé est assemblé au hasard puis RÉSOLU par le code
   (tableau de cas exhaustif), et gardé seulement s'il a une solution unique.
   Sous-types par niveau :
     N1 : règle « si… alors » et un fait, phrase de même sens (contraposée), déduction correcte,
          négation (tous, aucun, au moins un, et, ou), fripon et nombres (plus de, au moins, au plus…).
     N2 : coupable avec 3 témoins (une seule phrase vraie ou fausse), un chevalier ou fripon qui parle,
          syllogisme simple (clubs du lycée), chaîne de deux règles et un fait.
     N3 : coupable avec 4 témoins (ou, ni… ni), deux chevaliers ou fripons qui parlent, nombre secret
          (3 phrases, de 1 à 30), 4 affirmations qui se comptent, syllogismes difficiles ou « forcément faux ».
     N4 : trois habitants chevaliers ou fripons, coupable avec 5 témoins et phrases « X ment »,
          nombre secret (4 phrases, de 1 à 50), 5 affirmations qui se comptent, robots menteurs selon le jour,
          groupe de 4 ou 5 habitants qui comptent les fripons, syllogismes à existence ou à 4 groupes.
     N5 : groupe de 6 à 8 habitants qui comptent, table ronde (nombre minimal ou maximal de chevaliers),
          chevalier, fripon et espion, nombre secret (de 1 à 100), robots menteurs avec phrases composées.
   Vérification indépendante : verifs/alb-16-logique-verif.js (relit l'énoncé, force brute). */
(function(){
'use strict';
const A = window.ALBERT_SKILLS || (window.ALBERT_SKILLS = []);

/* ---------- aides locales (copiées de la compétence de référence) ---------- */
function norm(s){ return String(s).trim().toLowerCase().replace(/[−‐‑‒–—―﹣－]/g, '-').replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
function nb(x, d){
  const f = Math.pow(10, d == null ? 2 : d), n = Math.round(x * f) / f, neg = n < 0;
  const p = String(Math.abs(n)).split('.');
  return (neg ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : '');
}
const niv = level => Math.max(1, Math.min(5, Math.round(Number(level)) || 1));

/* ---------- aides propres à cette compétence ---------- */
const NB = ' ', FI = ' ';
const gu = s => '«' + NB + s + NB + '»';
const QM = FI + '?';
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const si = c => (/^ils? /.test(c) ? "s'" + c : 'si ' + c);
const que = c => (/^[aeiouyéèêàâîïôû]/i.test(c) ? "qu'" : 'que ') + c;
const de = nom => (/^[aeiouéèêàâîïôû]/i.test(nom) ? "d'" : 'de ') + nom;
const deListe = l => (l.length === 1 ? de(l[0]) : l.slice(0, -1).map(de).join(', ') + ' et ' + de(l[l.length - 1]));
const liste = (l, mot) => (l.length < 2 ? String(l[0]) : l.slice(0, -1).join(', ') + ' ' + mot + ' ' + l[l.length - 1]);
const et = l => liste(l, 'et');
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
const MOTSF = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
/* Toutes les répartitions de n booléens, « vrai » d'abord (ordre d'un tableau de cas fait à la main). */
function toutes(n){
  if (n === 0) return [[]];
  const r = [];
  toutes(n - 1).forEach(t => { r.push([true].concat(t)); });
  toutes(n - 1).forEach(t => { r.push([false].concat(t)); });
  return r;
}
function combis(n, k){
  const r = [];
  (function rec(d, acc){ if (acc.length === k){ r.push(acc.slice()); return; } for (let i = d; i < n; i++){ acc.push(i); rec(i + 1, acc); acc.pop(); } })(0, []);
  return r;
}
/* QCM à choix textuels : la bonne réponse, les distracteurs prioritaires dans l'ordre, puis d'autres mélangés. */
function choisir(R, bonne, prio, autres){
  const vus = new Set([norm(bonne)]), ch = [bonne];
  const add = c => { if (ch.length < 4 && c != null && c !== '' && !vus.has(norm(c))){ vus.add(norm(c)); ch.push(String(c)); } };
  (prio || []).forEach(add);
  R.shuffle(autres || []).forEach(add);
  return ch;
}
const sortie = (q, a, choix, expl) => ({q, a, accept: null, choix, expl});

/* ---------- personnages ---------- */
const HOMMES = ['Arthur', 'Bruno', 'Cyril', 'Denis', 'Éric', 'Fabien', 'Gilles', 'Hugo', 'Ivan', 'Jules', 'Karim', 'Louis', 'Marc', 'Noé', 'Oscar', 'Pierre', 'Rémi', 'Sacha', 'Tom', 'Victor', 'Yanis', 'Basile'];
const PRENOMS = ['Ana', 'Bruno', 'Chloé', 'David', 'Emma', 'Farid', 'Gabriel', 'Hana', 'Inès', 'Jules', 'Kenza', 'Lucas', 'Maya', 'Nathan', 'Olivia', 'Paul', 'Rania', 'Simon', 'Tara', 'Victor'];
const ILE = [
  'Sur une île vivent des chevaliers, qui disent toujours la vérité, et des fripons, qui mentent toujours.',
  'Dans un village, chaque habitant est soit un chevalier, qui dit toujours la vérité, soit un fripon, qui ment toujours.'
];

/* =====================================================================
   NIVEAU 1
   ===================================================================== */

/* Règles « si P, alors Q » : [P, non P, Q, non Q]. Aucune proposition ne contient « et » ni « ou ». */
const REGLES = [
  ['Yanis a cours', "Yanis n'a pas cours", 'Yanis prend le bus', 'Yanis ne prend pas le bus'],
  ['le magasin est ouvert', "le magasin n'est pas ouvert", "l'enseigne est allumée", "l'enseigne n'est pas allumée"],
  ['Nina gagne son match', 'Nina ne gagne pas son match', 'Nina joue la finale', 'Nina ne joue pas la finale'],
  ['la facture est payée', "la facture n'est pas payée", 'la commande est expédiée', "la commande n'est pas expédiée"],
  ['Sami finit ses devoirs', 'Sami ne finit pas ses devoirs', 'Sami joue à la console', 'Sami ne joue pas à la console'],
  ["l'alarme sonne", "l'alarme ne sonne pas", 'les élèves sortent dans la cour', 'les élèves ne sortent pas dans la cour'],
  ['le compte est à découvert', "le compte n'est pas à découvert", 'la banque envoie un message', "la banque n'envoie pas de message"],
  ['Maya a plus de 15 de moyenne', "Maya n'a pas plus de 15 de moyenne", 'Maya reçoit les félicitations', 'Maya ne reçoit pas les félicitations'],
  ['N est un multiple de 6', "N n'est pas un multiple de 6", 'N est pair', "N n'est pas pair"],
  ['le colis pèse plus de 2 kg', 'le colis ne pèse pas plus de 2 kg', 'le transporteur facture un supplément', 'le transporteur ne facture pas de supplément'],
  ['il neige', 'il ne neige pas', "l'école est fermée", "l'école n'est pas fermée"],
  ['Paul arrose ses plantes', "Paul n'arrose pas ses plantes", 'les plantes de Paul restent vertes', 'les plantes de Paul ne restent pas vertes'],
  ['le train a du retard', "le train n'a pas de retard", 'Hugo rate sa correspondance', 'Hugo ne rate pas sa correspondance'],
  ['la température dépasse 30 degrés', 'la température ne dépasse pas 30 degrés', 'la piscine ferme plus tard', 'la piscine ne ferme pas plus tard'],
  ['Emma réussit le concours', 'Emma ne réussit pas le concours', "Emma entre à l'école d'ingénieurs", "Emma n'entre pas à l'école d'ingénieurs"],
  ['le prix baisse', 'le prix ne baisse pas', 'les ventes augmentent', "les ventes n'augmentent pas"]
];
const regleTxt = (p, q) => cap(si(p)) + ', alors ' + q + '.';
const M_REGLE = 'Regarde si le fait observé est la condition de la règle (ce qui suit « si ») ou sa conséquence (ce qui suit « alors »), puis applique la règle dans le bon sens.';

/* 1A · une règle, un fait : que peut-on conclure ? */
function g1Fait(R){
  const [ap, an, bp, bn] = R.pick(REGLES);
  const cas = R.int(0, 3), fait = [ap, an, bp, bn][cas];
  const nsp = x => 'On ne peut pas savoir ' + si(x) + '.';
  const casse = "La règle n'a pas été respectée.";
  let bonne, prio, suite;
  if (cas === 0){
    bonne = cap(bp) + '.'; prio = [cap(bn) + '.', nsp(bp), casse];
    suite = 'Ici, le fait observé est exactement la condition : ' + ap + '. La règle s\'applique, donc ' + bp + '.';
  } else if (cas === 1){
    bonne = nsp(bp); prio = [cap(bn) + '.', cap(bp) + '.', casse];
    suite = 'Ici, la condition n\'est pas remplie (' + an + ') : la règle ne dit rien dans ce cas. On ne peut donc pas savoir ' + si(bp) + '. Piège : conclure que « ' + bn + ' », c\'est raisonner « si non P, alors non Q », ce que la règle ne garantit pas.';
  } else if (cas === 2){
    bonne = nsp(ap); prio = [cap(ap) + '.', cap(an) + '.', casse];
    suite = 'Ici, on observe la conséquence (' + bp + '), pas la condition. La règle dit seulement ce qui arrive quand ' + ap + ' ; la conséquence peut avoir une autre cause. On ne peut donc pas savoir ' + si(ap) + '. Piège : conclure que « ' + ap + ' », c\'est utiliser la réciproque « si Q, alors P », qui n\'est pas garantie.';
  } else {
    bonne = cap(an) + '.'; prio = [nsp(ap), cap(ap) + '.', casse];
    suite = 'Ici, la conséquence est fausse (' + bn + '). Utilise la contraposée : la règle a le même sens que ' + gu(regleTxt(bn, an)) + ' Donc ' + an + '. En effet, si ' + ap + ', on aurait ' + bp + '. Piège : répondre qu\'on ne peut rien savoir, c\'est oublier la contraposée.';
  }
  const q = 'On sait que la règle suivante est toujours respectée : ' + gu(regleTxt(ap, bp)) + '\nOr ' + fait + '. Que peut-on en conclure' + QM;
  return sortie(q, bonne, choisir(R, bonne, prio), M_REGLE + ' ' + suite);
}

/* 1B · phrase de même sens : la contraposée, et seulement elle */
function g1Equiv(R){
  const [ap, an, bp, bn] = R.pick(REGLES);
  const inv = R.int(0, 1) === 1;
  const p = inv ? bn : ap, np = inv ? bp : an, qq = inv ? an : bp, nq = inv ? ap : bn;
  const dite = regleTxt(p, qq);
  const bonne = regleTxt(nq, np), recip = regleTxt(qq, p), inver = regleTxt(np, nq), conj = cap(p) + ' et ' + qq + '.';
  const q = 'Laquelle de ces phrases a exactement le même sens que ' + gu(dite) + QM;
  const expl = 'Une phrase « si P, alors Q » a le même sens que sa contraposée « si non Q, alors non P », et seulement elle. Ici, la contraposée est ' + gu(bonne) +
    ' Piège : la réciproque ' + gu(recip) + ' et la phrase ' + gu(inver) + ' ne sont pas garanties par la règle ; et la règle n\'affirme pas que ' + p + '.';
  return sortie(q, bonne, choisir(R, bonne, [recip, inver, conj]), expl);
}

/* 1C · laquelle de ces déductions est correcte ? */
function g1Deduc(R){
  const [ap, an, bp, bn] = R.pick(REGLES);
  const ponens = R.int(0, 1) === 1;
  const bonne = ponens ? cap(ap) + ', donc ' + bp + '.' : cap(bn) + ', donc ' + an + '.';
  const recip = cap(bp) + ', donc ' + ap + '.', inver = cap(an) + ', donc ' + bn + '.';
  const faux = R.pick([cap(ap) + ', donc ' + bn + '.', cap(bn) + ', donc ' + ap + '.']);
  /* Deux formulations distinctes : un même énoncé doit toujours avoir la même bonne réponse. */
  const q = 'On sait que la règle suivante est toujours respectée : ' + gu(regleTxt(ap, bp)) + '\n' +
    (ponens ? 'Laquelle de ces déductions est correcte' : 'Parmi ces raisonnements, lequel est correct') + QM;
  const expl = 'Avec une règle « si P, alors Q », seules deux déductions sont sûres : de P on tire Q, et de non Q on tire non P (contraposée). Ici, ' + gu(bonne) + ' ' +
    (ponens ? 'part de la condition et obtient la conséquence.' : 'part de la négation de la conséquence et obtient la négation de la condition.') +
    ' Piège : ' + gu(recip) + ' utilise la réciproque, et ' + gu(inver) + ' part de la négation de la condition ; aucune des deux n\'est garantie.';
  return sortie(q, bonne, choisir(R, bonne, [recip, inver, faux]), expl);
}

/* 1D · négations : tous, aucun, au moins un, et, ou */
const GROUPES = [
  {s: 'élève de la classe', p: 'élèves de la classe', f: 0, v: 'a la moyenne', vp: 'ont la moyenne', vn: "n'a pas la moyenne", va: "n'a la moyenne"},
  {s: "joueuse de l'équipe", p: "joueuses de l'équipe", f: 1, v: 'est blessée', vp: 'sont blessées', vn: "n'est pas blessée", va: "n'est blessée"},
  {s: 'train de la journée', p: 'trains de la journée', f: 0, v: "est à l'heure", vp: "sont à l'heure", vn: "n'est pas à l'heure", va: "n'est à l'heure"},
  {s: 'client du magasin', p: 'clients du magasin', f: 0, v: 'a payé par carte', vp: 'ont payé par carte', vn: "n'a pas payé par carte", va: "n'a payé par carte"},
  {s: 'lampe du salon', p: 'lampes du salon', f: 1, v: 'est allumée', vp: 'sont allumées', vn: "n'est pas allumée", va: "n'est allumée"},
  {s: 'nombre de la liste', p: 'nombres de la liste', f: 0, v: 'est pair', vp: 'sont pairs', vn: "n'est pas pair", va: "n'est pair"},
  {s: 'invitée de la fête', p: 'invitées de la fête', f: 1, v: 'est arrivée', vp: 'sont arrivées', vn: "n'est pas arrivée", va: "n'est arrivée"},
  {s: 'question du quiz', p: 'questions du quiz', f: 1, v: 'est facile', vp: 'sont faciles', vn: "n'est pas facile", va: "n'est facile"},
  {s: "salarié de l'entreprise", p: "salariés de l'entreprise", f: 0, v: 'travaille le samedi', vp: 'travaillent le samedi', vn: 'ne travaille pas le samedi', va: 'ne travaille le samedi'},
  {s: 'vol du jour', p: 'vols du jour', f: 0, v: 'est complet', vp: 'sont complets', vn: "n'est pas complet", va: "n'est complet"}
];
const COUPLES = [
  ['le magasin est ouvert', "le magasin n'est pas ouvert", 'la caisse fonctionne', 'la caisse ne fonctionne pas'],
  ["le train est à l'heure", "le train n'est pas à l'heure", "le bus est à l'heure", "le bus n'est pas à l'heure"],
  ['Nina a son permis', "Nina n'a pas son permis", 'elle a une voiture', "elle n'a pas de voiture"],
  ['la porte est fermée', "la porte n'est pas fermée", 'la fenêtre est fermée', "la fenêtre n'est pas fermée"],
  ['Sami a faim', "Sami n'a pas faim", 'il a soif', "il n'a pas soif"],
  ['le colis est arrivé', "le colis n'est pas arrivé", 'la facture est payée', "la facture n'est pas payée"],
  ['Emma parle anglais', 'Emma ne parle pas anglais', 'elle parle espagnol', 'elle ne parle pas espagnol'],
  ['le prix a baissé', "le prix n'a pas baissé", 'la qualité est restée la même', "la qualité n'est pas restée la même"],
  ['N est pair', "N n'est pas pair", 'N est plus grand que 10', "N n'est pas plus grand que 10"],
  ['le film est sorti', "le film n'est pas sorti", 'la bande-annonce est en ligne', "la bande-annonce n'est pas en ligne"]
];
const M_NEG = 'La négation d\'une phrase est vraie exactement quand la phrase est fausse : demande-toi ce qu\'il suffit d\'observer pour que la phrase de départ soit fausse.';
function g1Neg(R){
  const sansPt = s => s.replace(/\.$/, '');
  let dite, bonne, prio, expl;
  if (R.int(0, 9) < 6){
    const g = R.pick(GROUPES), F = g.f;
    const tous = (F ? 'Toutes' : 'Tous') + ' les ' + g.p + ' ' + g.vp + '.';
    const aucun = (F ? 'Aucune ' : 'Aucun ') + g.s + ' ' + g.va + '.';
    const alo = (F ? 'Au moins une ' : 'Au moins un ') + g.s + ' ' + g.v + '.';
    const alon = (F ? 'Au moins une ' : 'Au moins un ') + g.s + ' ' + g.vn + '.';
    const ex1 = (F ? 'Exactement une ' : 'Exactement un ') + g.s + ' ' + g.v + '.';
    const ex1n = (F ? 'Exactement une ' : 'Exactement un ') + g.s + ' ' + g.vn + '.';
    const cas = R.int(0, 3);
    if (cas === 0){
      dite = tous; bonne = alon; prio = [aucun, alo, ex1n];
      expl = 'Pour que « tous… » soit faux, un seul contre-exemple suffit : la négation est « au moins un… ne… pas ». Ici : ' + gu(sansPt(alon)) + '. Piège : ' + gu(sansPt(aucun)) + ' est beaucoup plus fort ; un seul cas suffit pour que la phrase de départ soit fausse.';
    } else if (cas === 1){
      dite = aucun; bonne = alo; prio = [tous, alon, ex1];
      expl = 'Pour que « aucun… » soit faux, un seul cas suffit : la négation est « au moins un… ». Ici : ' + gu(sansPt(alo)) + '. Piège : ' + gu(sansPt(tous)) + ' est beaucoup plus fort que nécessaire.';
    } else if (cas === 2){
      dite = alo; bonne = aucun; prio = [alon, tous, ex1];
      expl = 'Pour que « au moins un… » soit faux, il ne doit y avoir aucun cas : la négation est « aucun… ». Ici : ' + gu(sansPt(aucun)) + '. Piège : ' + gu(sansPt(alon)) + ' peut être vraie en même temps que la phrase de départ, ce n\'est donc pas sa négation.';
    } else {
      dite = alon; bonne = tous; prio = [aucun, alo, ex1];
      expl = 'Pour que « au moins un… ne… pas » soit faux, il ne doit y avoir aucun contre-exemple : la négation est « tous… ». Ici : ' + gu(sansPt(tous)) + '. Piège : ' + gu(sansPt(alo)) + ' peut être vraie en même temps que la phrase de départ.';
    }
  } else {
    const [xp, xn, yp, yn] = R.pick(COUPLES);
    if (R.int(0, 1) === 0){
      dite = cap(xp) + ' et ' + yp + '.'; bonne = cap(xn) + ' ou ' + yn + '.';
      const piege = cap(xn) + ' et ' + yn + '.';
      prio = [piege, cap(xp) + ' ou ' + yp + '.', cap(xn) + ' et ' + yp + '.'];
      expl = 'Une phrase « P et Q » est fausse dès qu\'une des deux parties est fausse : sa négation est « non P ou non Q ». Ici : ' + gu(sansPt(bonne)) + '. Piège : ' + gu(sansPt(piege)) + ' exige que les deux parties soient fausses, c\'est trop fort.';
    } else {
      dite = cap(xp) + ' ou ' + yp + '.'; bonne = cap(xn) + ' et ' + yn + '.';
      const piege = cap(xn) + ' ou ' + yn + '.';
      prio = [piege, cap(xp) + ' et ' + yp + '.', cap(xn) + ' ou ' + yp + '.'];
      expl = 'En maths, « P ou Q » est vraie dès qu\'une des deux parties est vraie ; elle n\'est fausse que si les deux sont fausses. Sa négation est donc « non P et non Q ». Ici : ' + gu(sansPt(bonne)) + '. Piège : ' + gu(sansPt(piege)) + ' est trop faible.';
    }
  }
  const q = R.int(0, 1) === 0
    ? 'Quelle est la négation de la phrase ' + gu(sansPt(dite)) + QM
    : 'Quelle phrase est vraie exactement quand la phrase ' + gu(sansPt(dite)) + ' est fausse' + QM;
  return sortie(q, bonne, choisir(R, bonne, prio), M_NEG + ' ' + expl);
}

/* 1E · un fripon annonce un nombre : que sait-on vraiment ? */
const OBJETS = [
  {s: 'frère', p: 'frères', f: 0}, {s: 'sœur', p: 'sœurs', f: 1}, {s: 'chat', p: 'chats', f: 0}, {s: 'cousin', p: 'cousins', f: 0},
  {s: 'cousine', p: 'cousines', f: 1}, {s: 'vélo', p: 'vélos', f: 0}, {s: 'montre', p: 'montres', f: 1}, {s: 'poisson rouge', p: 'poissons rouges', f: 0}
];
function g1Fripon(R){
  const o = R.pick(OBJETS), nom = R.pick(HOMMES), n = R.int(2, 6);
  const c = k => k + ' ' + (k > 1 ? o.p : o.s);
  const un = o.f ? 'une' : 'un', aucun = o.f ? 'aucune' : 'aucun';
  const jusqua = k => range(0, k).join(', ').replace(/, (\d+)$/, ' ou $1');
  const forme = R.pick(['PLUS', 'ALM', 'MOINS', 'ALP', 'EX', 'AUCUN']);
  let dit, bonne, prio, e;
  if (forme === 'PLUS'){
    dit = "J'ai plus de " + c(n) + '.'; bonne = nom + ' a ' + c(n) + ' ou moins.';
    prio = [nom + ' a moins de ' + c(n) + '.', nom + ' a exactement ' + c(n) + '.', nom + ' a ' + c(n + 1) + ' ou plus.'];
    e = '« Plus de ' + n + ' » veut dire ' + (n + 1) + ' ou plus. Le contraire est « ' + n + ' ou moins », c\'est-à-dire ' + jusqua(n) + '. Piège : « moins de ' + n + ' » oublie le cas où il en a exactement ' + n + '.';
  } else if (forme === 'ALM'){
    dit = "J'ai au moins " + c(n) + '.'; bonne = nom + ' a ' + c(n - 1) + ' ou moins.';
    /* Distracteurs jamais certains : « moins de n − 1 » oublie le cas n − 1 (avec n = 2 : « aucun »). */
    const bord = n - 1 >= 2 ? nom + ' a moins de ' + c(n - 1) + '.' : nom + " n'a " + aucun + ' ' + o.s + '.';
    prio = [bord, nom + ' a exactement ' + c(n - 1) + '.', nom + ' a ' + c(n) + ' ou plus.'];
    e = '« Au moins ' + n + ' » veut dire ' + n + ' ou plus. Le contraire est « moins de ' + n + ' », c\'est-à-dire ' + jusqua(n - 1) + '. Piège : ' + gu(bord.slice(0, -1)) + ' oublie le cas où il en a exactement ' + (n - 1) + ', et « exactement ' + (n - 1) + ' » n\'est qu\'un cas possible parmi d\'autres.';
  } else if (forme === 'MOINS'){
    dit = "J'ai moins de " + c(n) + '.'; bonne = nom + ' a ' + c(n) + ' ou plus.';
    prio = [nom + ' a plus de ' + c(n) + '.', nom + ' a exactement ' + c(n) + '.', nom + ' a ' + c(n - 1) + ' ou moins.'];
    e = '« Moins de ' + n + ' » veut dire ' + jusqua(n - 1) + '. Le contraire est « ' + n + ' ou plus ». Piège : « plus de ' + n + ' » oublie le cas où il en a exactement ' + n + '.';
  } else if (forme === 'ALP'){
    dit = "J'ai au plus " + c(n) + '.'; bonne = nom + ' a ' + c(n + 1) + ' ou plus.';
    /* Distracteurs jamais certains : « plus de n + 1 » oublie le cas n + 1. */
    prio = [nom + ' a plus de ' + c(n + 1) + '.', nom + ' a exactement ' + c(n + 1) + '.', nom + ' a ' + c(n) + ' ou moins.'];
    e = '« Au plus ' + n + ' » veut dire ' + jusqua(n) + '. Le contraire est « ' + (n + 1) + ' ou plus ». Piège : « plus de ' + (n + 1) + ' » oublie le cas où il en a exactement ' + (n + 1) + ', et « exactement ' + (n + 1) + ' » n\'est qu\'un cas possible parmi d\'autres.';
  } else if (forme === 'EX'){
    dit = "J'ai exactement " + c(n) + '.'; bonne = nom + ' a moins de ' + c(n) + ' ou plus de ' + c(n) + '.';
    prio = [nom + ' a moins de ' + c(n) + '.', nom + ' a plus de ' + c(n) + '.', nom + ' a exactement ' + c(n) + '.'];
    e = 'Le contraire de « exactement ' + n + ' » est « un autre nombre que ' + n + ' » : moins de ' + n + ' ou plus de ' + n + ', sans qu\'on sache lequel. Piège : choisir « moins » ou « plus » seul, ce n\'est pas certain.';
  } else {
    dit = "Je n'ai " + aucun + ' ' + o.s + '.'; bonne = nom + ' a au moins ' + un + ' ' + o.s + '.';
    prio = [nom + ' a exactement ' + un + ' ' + o.s + '.', nom + ' a plusieurs ' + o.p + '.', nom + " n'a " + aucun + ' ' + o.s + '.'];
    e = 'Le contraire de « aucun » est « au moins un ». Piège : « exactement un » ou « plusieurs » sont possibles, mais pas certains.';
  }
  const q = 'Sur une île, les fripons mentent toujours. ' + nom + ', un fripon, affirme : ' + gu(dit) + ' Que peut-on en déduire avec certitude' + QM;
  return sortie(q, bonne, choisir(R, bonne, prio), 'Un fripon ment toujours : la vérité est la négation exacte de sa phrase. ' + e);
}

/* =====================================================================
   COUPABLES : « une seule de ces phrases est vraie »
   ===================================================================== */
const AFFAIRES = [
  {ev: 'Le vase du salon a été cassé.', q: 'Qui a cassé le vase'},
  {ev: 'Le dernier croissant a disparu de la cuisine.', q: 'Qui a mangé le croissant'},
  {ev: "Quelqu'un a caché les clés de la voiture.", q: 'Qui a caché les clés'},
  {ev: 'Un message mystérieux a été écrit au tableau.', q: 'Qui a écrit le message'},
  {ev: 'La fenêtre de la classe est restée ouverte toute la nuit.', q: 'Qui a laissé la fenêtre ouverte'},
  {ev: 'Un cadeau surprise a été déposé sur le bureau du professeur.', q: 'Qui a déposé le cadeau'},
  {ev: 'La dernière part de gâteau a été mangée.', q: 'Qui a mangé la part de gâteau'},
  {ev: 'Le code du wifi a été changé.', q: 'Qui a changé le code'},
  {ev: 'Les plantes du bureau ont été arrosées en cachette.', q: 'Qui a arrosé les plantes'},
  {ev: 'La musique du salon a été mise à fond.', q: 'Qui a mis la musique à fond'}
];
const COND = {
  '1V': {t: 'Une seule de ces phrases est vraie.', c: 'une seule phrase vraie', v: n => 1, inv: '1F'},
  '1F': {t: 'Une seule de ces phrases est fausse.', c: 'une seule phrase fausse', v: n => n - 1, inv: '1V'},
  '2V': {t: 'Exactement deux de ces phrases sont vraies.', c: 'exactement deux phrases vraies', v: n => 2, inv: '2F'},
  '2F': {t: 'Exactement deux de ces phrases sont fausses.', c: 'exactement deux phrases fausses', v: n => n - 2, inv: '2V'}
};
function declTxt(d, sp, noms){
  const nm = z => (z === sp ? 'moi' : noms[z]);
  if (d.t === 'IS') return d.x === sp ? "C'est moi." : "C'est " + noms[d.x] + '.';
  if (d.t === 'NOT') return d.x === sp ? "Ce n'est pas moi." : "Ce n'est pas " + noms[d.x] + '.';
  if (d.t === 'OR') return "C'est " + nm(d.x) + ' ou ' + nm(d.y) + '.';
  if (d.t === 'NOR') return "Ce n'est ni " + nm(d.x) + ' ni ' + nm(d.y) + '.';
  if (d.t === 'NOTME') return "Ce n'est pas moi, c'est " + noms[d.x] + '.';
  if (d.t === 'LIES') return noms[d.y] + ' ment.';
  return noms[d.y] + ' dit la vérité.';
}
/* Valeur de vérité de chaque déclaration si le coupable est c (les phrases « X ment » se lisent après les autres). */
function verites(decl, c){
  const v = new Array(decl.length);
  decl.forEach((d, i) => {
    if (d.t === 'IS' || d.t === 'NOTME') v[i] = c === d.x;
    else if (d.t === 'NOT') v[i] = c !== d.x;
    else if (d.t === 'OR') v[i] = c === d.x || c === d.y;
    else if (d.t === 'NOR') v[i] = c !== d.x && c !== d.y;
  });
  decl.forEach((d, i) => { if (d.t === 'LIES') v[i] = !v[d.y]; else if (d.t === 'TRUTH') v[i] = v[d.y]; });
  return v;
}
function tirerDecl(R, o, sp, nS){
  const autre = () => { let x; do { x = R.int(0, nS - 1); } while (x === sp); return x; };
  const deux = () => { const l = R.shuffle(range(0, nS - 1)); return R.int(0, 3) === 0 ? [l[0], l[1]] : l.filter(z => z !== sp).slice(0, 2); };
  const t = R.pick(o.types);
  if (t === 'IS') return {t, x: autre()};
  if (t === 'NOT') return {t, x: R.int(0, 1) ? sp : autre()};
  if (t === 'NOTME') return {t, x: autre()};
  const [x, y] = deux();
  return {t, x, y};
}
function coupable(R, o){
  const ctx = R.pick(AFFAIRES), noms = R.shuffle(PRENOMS).slice(0, o.nS), nP = o.nP;
  for (let essai = 0; essai < 400; essai++){
    const decl = range(0, nP - 1).map(sp => tirerDecl(R, o, sp, o.nS));
    if (o.meta){
      const k = R.int(1, 2), qui = R.shuffle(range(0, nP - 1)).slice(0, k);
      qui.forEach(sp => {
        const cibles = range(0, nP - 1).filter(y => y !== sp && qui.indexOf(y) < 0);
        if (cibles.length) decl[sp] = {t: R.int(0, 2) ? 'LIES' : 'TRUTH', y: R.pick(cibles)};
      });
    }
    const textes = decl.map((d, sp) => declTxt(d, sp, noms));
    if (new Set(textes).size < nP) continue;
    const cle = R.pick(o.conds), C = COND[cle], cible = C.v(nP);
    const comptes = range(0, o.nS - 1).map(c => verites(decl, c).filter(Boolean).length);
    const sols = range(0, o.nS - 1).filter(c => comptes[c] === cible);
    if (sols.length !== 1) continue;
    const sol = sols[0];
    /* raccourci : deux phrases simples qui se contredisent */
    let raccourci = '';
    for (let i = 0; i < nP && !raccourci; i++) for (let j = i + 1; j < nP && !raccourci; j++){
      if (decl[i].t === 'LIES' || decl[i].t === 'TRUTH' || decl[j].t === 'LIES' || decl[j].t === 'TRUTH') continue;
      if (range(0, o.nS - 1).every(c => verites(decl, c)[i] !== verites(decl, c)[j])) raccourci = ' Raccourci : les phrases ' + de(noms[i]) + ' et ' + de(noms[j]) + ' se contredisent, donc exactement l\'une des deux est vraie.';
    }
    const Ci = COND[C.inv], solsI = range(0, o.nS - 1).filter(c => comptes[c] === Ci.v(nP));
    const piegeNom = solsI.length === 1 && solsI[0] !== sol ? noms[solsI[0]] : null;
    const proches = R.shuffle(range(0, o.nS - 1).filter(c => c !== sol)).sort((x, y) => Math.abs(comptes[x] - cible) - Math.abs(comptes[y] - cible)).map(c => noms[c]);
    const choix = choisir(R, noms[sol], (piegeNom ? [piegeNom] : []).concat(proches));
    const lignes = range(0, nP - 1).map(sp => '- ' + noms[sp] + ' : ' + gu(textes[sp])).join('\n');
    const silencieux = noms.slice(nP);
    const q = ctx.ev + ' Une seule personne l\'a fait : ' + liste(noms, 'ou') + '.\n' +
      (silencieux.length ? et(noms.slice(0, nP)) + ' déclarent :' : 'Voici leurs déclarations :') + '\n' + lignes + '\n' +
      (silencieux.length ? et(silencieux) + (silencieux.length > 1 ? ' ne disent rien. ' : ' ne dit rien. ') : '') + C.t + ' ' + ctx.q + QM;
    const puces = range(0, o.nS - 1).map(c => {
      const v = verites(decl, c), vr = range(0, nP - 1).filter(i => v[i]).map(i => noms[i]);
      const nf = nP - vr.length, fx = cle.charAt(1) === 'F' ? ', donc ' + nf + ' fausse' + (nf > 1 ? 's' : '') : '';
      return '- Si c\'est ' + noms[c] + ' : ' + (vr.length ? (vr.length > 1 ? 'phrases vraies : celles ' : 'phrase vraie : celle ') + deListe(vr) : 'aucune phrase vraie') + ' (' + vr.length + fx + ').';
    }).join('\n');
    const expl = 'On teste chaque personne comme coupable possible et on compte les phrases vraies.' + raccourci + '\n' + puces + '\n' +
      'Seul le cas où c\'est ' + noms[sol] + ' donne ' + C.c + '.' +
      (piegeNom && choix.indexOf(piegeNom) >= 0 ? ' Piège : en cherchant ' + Ci.c + ' au lieu de ' + C.c + ', on trouverait ' + piegeNom + '.' : '');
    return sortie(q, noms[sol], choix, expl);
  }
  return null;
}
const g2Coupable = R => coupable(R, {nS: 4, nP: 3, types: ['IS', 'NOT', 'NOT'], conds: ['1V', '1F'], meta: false});
const g3Coupable = R => coupable(R, {nS: 4, nP: 4, types: ['IS', 'NOT', 'OR', 'NOR', 'NOTME'], conds: ['1V', '1F', '2V'], meta: false});
const g4Coupable = R => coupable(R, {nS: 5, nP: 5, types: ['IS', 'NOT', 'OR', 'NOR', 'NOTME'], conds: ['1V', '1F', '2V', '2F'], meta: true});

/* =====================================================================
   CHEVALIERS ET FRIPONS
   ===================================================================== */
const duo = (X, Y, a, b) => (a && b ? X + ' et ' + Y + ' sont deux chevaliers.' : !a && !b ? X + ' et ' + Y + ' sont deux fripons.'
  : a ? X + ' est un chevalier et ' + Y + ' un fripon.' : X + ' est un fripon et ' + Y + ' un chevalier.');
const typ = b => (b ? 'chevalier' : 'fripon');
/* Tableau de cas : une ligne par répartition, avec la première contradiction rencontrée. */
function tableCas(noms, stmts, desc){
  return toutes(noms.length).map(a => {
    const bad = stmts.find(s => s.ev(a) !== a[s.who]);
    return '- ' + desc(a) + ' : ' + (bad ? 'impossible, car ' + noms[bad.who] + ' serait ' + typ(a[bad.who]) + ', mais sa phrase serait ' + (a[bad.who] ? 'fausse' : 'vraie') + '.' : 'cohérent.');
  }).join('\n');
}
const resoudre = (n, stmts) => toutes(n).filter(a => stmts.every(s => s.ev(a) === a[s.who]));

/* 2B · un seul habitant parle */
const SEUL = [
  {r: [false, true], t: [O => 'Nous sommes deux fripons.', O => O + ' et moi sommes tous les deux des fripons.', O => "Aucun de nous deux n'est un chevalier."],
    e: (X, Y) => 'Si ' + X + ' était un chevalier, sa phrase serait vraie, donc il serait un fripon : c\'est impossible. ' + X + ' est donc un fripon, et sa phrase est fausse : ils ne sont pas tous les deux fripons, donc ' + Y + ' est un chevalier. Piège : la négation de « nous sommes deux fripons » n\'est pas « nous sommes deux chevaliers », mais « au moins l\'un de nous est un chevalier ».'},
  {r: [true, false], t: [O => "Au moins l'un de nous deux est un fripon.", O => 'Nous ne sommes pas tous les deux des chevaliers.', O => 'Il y a au moins un fripon parmi nous deux.'],
    e: (X, Y) => 'Si ' + X + ' était un fripon, il y aurait bien un fripon parmi eux (lui-même) et sa phrase serait vraie : impossible pour un fripon. ' + X + ' est donc un chevalier ; sa phrase est vraie, il y a au moins un fripon, et ce ne peut être que ' + Y + '.'},
  {r: [true, true], t: [O => 'Je suis un fripon ou ' + O + ' est un chevalier.', O => O + ' est un chevalier ou je suis un fripon.'],
    e: (X, Y) => 'Si ' + X + ' était un fripon, la partie « je suis un fripon » serait vraie, donc toute la phrase en « ou » serait vraie : impossible pour un fripon. ' + X + ' est donc un chevalier ; sa phrase est vraie, et comme « je suis un fripon » est fausse, c\'est « ' + Y + ' est un chevalier » qui est vraie.'},
  {r: [false, false], t: [O => 'Je suis un fripon et ' + O + ' est un chevalier.', O => O + ' est un chevalier, et moi, je suis un fripon.'],
    e: (X, Y) => 'Si ' + X + ' était un chevalier, il dirait vrai, donc il serait un fripon : impossible. ' + X + ' est donc un fripon et sa phrase est fausse. Or la partie « je suis un fripon » est vraie ; pour qu\'une phrase en « et » soit fausse, il faut que l\'autre partie soit fausse : ' + Y + ' n\'est pas un chevalier, c\'est un fripon.'}
];
function g2Seul(R){
  const [X, Y] = R.shuffle(HOMMES).slice(0, 2), f = R.pick(SEUL), dit = R.pick(f.t)(Y);
  const bonne = duo(X, Y, f.r[0], f.r[1]);
  const autres = [[true, true], [true, false], [false, true], [false, false]].filter(r => r[0] !== f.r[0] || r[1] !== f.r[1]).map(r => duo(X, Y, r[0], r[1]));
  const q = R.pick(ILE) + ' Tu rencontres deux habitants, ' + X + ' et ' + Y + '. ' + X + ' te dit : ' + gu(dit) + '\nQue sont ' + X + ' et ' + Y + QM;
  return sortie(q, bonne, choisir(R, bonne, [], autres), 'Teste les deux cas pour ' + X + ' : un chevalier dit une phrase vraie, un fripon une phrase fausse. ' + f.e(X, Y));
}

/* 3B · deux habitants parlent */
const F2 = [
  {t: (O) => O + ' est un chevalier.', ev: (s, o) => o},
  {t: (O) => O + ' est un fripon.', ev: (s, o) => !o},
  {t: (O) => O + ' ment.', ev: (s, o) => !o},
  {t: (O) => O + ' dit la vérité.', ev: (s, o) => o},
  {t: (O) => O + ' et moi sommes du même type.', ev: (s, o) => s === o},
  {t: (O) => O + ' et moi sommes de types différents.', ev: (s, o) => s !== o},
  {t: () => 'Nous sommes deux chevaliers.', ev: (s, o) => s && o},
  {t: () => 'Nous sommes deux fripons.', ev: (s, o) => !s && !o},
  {t: () => "Au moins l'un de nous deux est un fripon.", ev: (s, o) => !s || !o},
  {t: () => "Au moins l'un de nous deux est un chevalier.", ev: (s, o) => s || o},
  {t: () => "Exactement l'un de nous deux est un fripon.", ev: (s, o) => s !== o},
  {t: (O) => 'Si je suis un chevalier, alors ' + O + ' est un fripon.', ev: (s, o) => !s || !o},
  {t: (O) => 'Si ' + O + ' est un chevalier, alors moi aussi.', ev: (s, o) => !o || s},
  {t: (O) => 'Si ' + O + ' est un fripon, alors moi aussi.', ev: (s, o) => o || !s}
];
function g3Duo(R){
  const N = R.shuffle(HOMMES).slice(0, 2);
  for (let essai = 0; essai < 200; essai++){
    const f0 = R.pick(F2), f1 = R.pick(F2);
    const t0 = f0.t(N[1]), t1 = f1.t(N[0]);
    if (t0 === t1) continue;
    const stmts = [{who: 0, ev: a => f0.ev(a[0], a[1])}, {who: 1, ev: a => f1.ev(a[1], a[0])}];
    const sols = resoudre(2, stmts);
    if (sols.length !== 1) continue;
    const s = sols[0], bonne = duo(N[0], N[1], s[0], s[1]);
    const autres = toutes(2).filter(a => a[0] !== s[0] || a[1] !== s[1]).map(a => duo(N[0], N[1], a[0], a[1]));
    const q = R.pick(ILE) + ' Tu rencontres ' + N[0] + ' et ' + N[1] + '.\n- ' + N[0] + ' : ' + gu(t0) + '\n- ' + N[1] + ' : ' + gu(t1) + '\nQue sont ' + N[0] + ' et ' + N[1] + QM;
    const expl = 'On teste les 4 cas possibles : chaque chevalier doit dire une phrase vraie, chaque fripon une phrase fausse.\n' +
      tableCas(N, stmts, a => N[0] + ' ' + typ(a[0]) + ', ' + N[1] + ' ' + typ(a[1])) + '\nSeul un cas est cohérent. ' + bonne +
      (/^Si /.test(t0) || /^Si /.test(t1) ? ' Rappel : une phrase « si…, alors… » dont la condition est fausse est vraie.' : '');
    return sortie(q, bonne, choisir(R, bonne, [], autres), expl);
  }
  return null;
}

/* 4A · trois habitants */
function f3Pool(R){
  const l = [
    {t: (N, i, j, k) => N[j] + ' est un chevalier.', ev: (a, i, j, k) => a[j]},
    {t: (N, i, j, k) => N[j] + ' est un fripon.', ev: (a, i, j, k) => !a[j]},
    {t: (N, i, j, k) => N[j] + ' et ' + N[k] + ' sont du même type.', ev: (a, i, j, k) => a[j] === a[k]},
    {t: (N, i, j, k) => N[j] + ' et ' + N[k] + ' sont de types différents.', ev: (a, i, j, k) => a[j] !== a[k]},
    {t: (N, i, j, k) => N[j] + ' et moi sommes du même type.', ev: (a, i, j, k) => a[i] === a[j]},
    {t: (N, i, j, k) => "Au moins l'un des deux, " + N[j] + ' ou ' + N[k] + ', est un fripon.', ev: (a, i, j, k) => !a[j] || !a[k]},
    {t: (N, i, j, k) => 'Si ' + N[j] + ' est un chevalier, alors ' + N[k] + ' aussi.', ev: (a, i, j, k) => !a[j] || a[k]}
  ];
  const nC = a => a.filter(Boolean).length;
  const m = R.int(0, 3), m2 = R.int(1, 2);
  l.push({t: () => (m === 0 ? "Il n'y a aucun chevalier parmi nous trois." : 'Il y a exactement ' + MOTS[m] + ' chevalier' + (m > 1 ? 's' : '') + ' parmi nous trois.'), ev: a => nC(a) === m});
  l.push({t: () => 'Il y a exactement ' + MOTS[m2] + ' fripon' + (m2 > 1 ? 's' : '') + ' parmi nous trois.', ev: a => 3 - nC(a) === m2});
  l.push({t: () => 'Il y a au moins ' + MOTS[m2] + ' fripon' + (m2 > 1 ? 's' : '') + ' parmi nous trois.', ev: a => 3 - nC(a) >= m2});
  return l;
}
function ensemble3(N, a){
  const C = N.filter((_, i) => a[i]);
  if (C.length === 0) return "Aucun des trois n'est un chevalier.";
  if (C.length === 3) return 'Les trois sont des chevaliers.';
  if (C.length === 1) return 'Seul ' + C[0] + ' est un chevalier.';
  return C[0] + ' et ' + C[1] + ' sont des chevaliers, ' + N[a.indexOf(false)] + ' est un fripon.';
}
function g4Trio(R){
  const N = R.shuffle(HOMMES).slice(0, 3);
  for (let essai = 0; essai < 300; essai++){
    const parlent = R.int(0, 9) < 7 ? [0, 1, 2] : R.shuffle([0, 1, 2]).slice(0, 2).sort();
    const stmts = [], textes = [];
    parlent.forEach(i => {
      const autres = R.shuffle([0, 1, 2].filter(z => z !== i)), j = autres[0], k = autres[1];
      const f = R.pick(f3Pool(R));
      textes[i] = f.t(N, i, j, k);
      stmts.push({who: i, ev: a => f.ev(a, i, j, k)});
    });
    if (new Set(textes.filter(Boolean)).size < parlent.length) continue;
    const sols = resoudre(3, stmts);
    if (sols.length !== 1) continue;
    const s = sols[0], nCh = s.filter(Boolean).length;
    const lignes = [0, 1, 2].filter(i => textes[i]).map(i => '- ' + N[i] + ' : ' + gu(textes[i])).join('\n');
    const muet = [0, 1, 2].find(i => !textes[i]);
    const parCompte = R.int(0, 1) === 0;
    const presque = toutes(3).filter(a => a.join() !== s.join()).sort((x, y) => stmts.filter(t => t.ev(x) !== x[t.who]).length - stmts.filter(t => t.ev(y) !== y[t.who]).length);
    let bonne, choix, fin;
    if (parCompte){
      bonne = String(nCh); choix = ['0', '1', '2', '3'];
      fin = 'Il y a donc ' + nCh + ' chevalier' + (nCh > 1 ? 's' : '') + '. ' + ensemble3(N, s);
    } else {
      bonne = ensemble3(N, s); choix = choisir(R, bonne, presque.map(a => ensemble3(N, a)));
      fin = 'Une seule répartition est cohérente. ' + bonne;
    }
    const q = R.pick(ILE) + ' Tu rencontres trois habitants, ' + et(N) + '.\n' + lignes + '\n' + (muet != null ? N[muet] + ' ne dit rien.\n' : '') +
      (parCompte ? 'Combien y a-t-il de chevaliers parmi ces trois habitants' : 'Qui est chevalier parmi ces trois habitants') + QM;
    const desc = a => { const C = N.filter((_, i) => a[i]), F = N.filter((_, i) => !a[i]);
      return !C.length ? 'Trois fripons' : !F.length ? 'Trois chevaliers' : (C.length > 1 ? 'Chevaliers ' : 'Chevalier ') + et(C) + (F.length > 1 ? ', fripons ' : ', fripon ') + et(F); };
    const expl = 'On teste les 8 répartitions possibles : chaque chevalier doit dire une phrase vraie, chaque fripon une phrase fausse.\n' + tableCas(N, stmts, desc) + '\n' + fin;
    return sortie(q, bonne, choix, expl);
  }
  return null;
}

/* 4F, 5A · un groupe d'habitants qui comptent les chevaliers ou les fripons */
function txtGroupe(st, n){
  const mot = st.w === 'C' ? 'chevalier' : 'fripon', mots = mot + 's';
  if (st.t === 'EX'){
    if (st.m === 0) return "Aucun d'entre nous n'est un " + mot + '.';
    if (st.m === n) return 'Nous sommes tous des ' + mots + '.';
    if (st.m === 1) return "Exactement un d'entre nous est un " + mot + '.';
    return 'Exactement ' + st.m + " d'entre nous sont des " + mots + '.';
  }
  const pre = st.t === 'AL' ? 'Au moins ' : 'Au plus ';
  return st.m === 1 ? pre + "un d'entre nous est un " + mot + '.' : pre + st.m + " d'entre nous sont des " + mots + '.';
}
function vraiGroupe(st, K, n){
  const c = st.w === 'C' ? K : n - K;
  return st.t === 'EX' ? c === st.m : st.t === 'AL' ? c >= st.m : c <= st.m;
}
function groupe(R, nmin, nmax){
  const n = R.int(nmin, nmax), N = R.shuffle(HOMMES).slice(0, n);
  for (let essai = 0; essai < 600; essai++){
    const st = N.map(() => {
      const t = R.pick(['EX', 'EX', 'AL', 'AM']), w = R.pick(['C', 'F']);
      const m = t === 'EX' ? R.int(0, n) : R.int(1, n - 1);
      return {t, w, m};
    });
    const tx = st.map(s => txtGroupe(s, n));
    if (new Set(tx).size < n) continue;
    const vr = K => range(0, n - 1).filter(i => vraiGroupe(st[i], K, n));
    const Ks = range(0, n).filter(K => vr(K).length === K);
    if (Ks.length !== 1) continue;
    const K = Ks[0];
    if (K === 0 || K === n) continue;
    const ecarts = range(0, n).filter(k => k !== K).sort((x, y) => Math.abs(vr(x).length - x) - Math.abs(vr(y).length - y));
    const choix = choisir(R, String(K), [String(n - K)].concat(ecarts.map(String)));
    const q = 'Sur une île, les chevaliers disent toujours la vérité et les fripons mentent toujours. ' + cap(MOTS[n]) + ' habitants parlent du groupe qu\'ils forment :\n' +
      range(0, n - 1).map(i => '- ' + N[i] + ' : ' + gu(tx[i])).join('\n') + '\nCombien y a-t-il de chevaliers parmi ces ' + n + ' habitants' + QM;
    const puces = range(0, n).map(k => {
      const v = vr(k);
      return '- K = ' + k + ' : ' + (v.length ? 'phrases vraies : ' + et(v.map(i => N[i])) : 'aucune phrase vraie') + ' (' + v.length + ')' + (v.length === k ? ' : cohérent.' : ', pas ' + k + ' : impossible.');
    }).join('\n');
    const expl = 'Chaque phrase ne dépend que du nombre K de chevaliers du groupe : pour chaque valeur de K, compte les phrases qui seraient vraies ; K ne convient que si on trouve exactement K phrases vraies (celles des chevaliers).\n' + puces +
      '\nIl y a donc ' + K + ' chevalier' + (K > 1 ? 's' : '') + ' : ' + et(vr(K).map(i => N[i])) + '.' + (choix.indexOf(String(n - K)) >= 0 ? ' Piège : ' + (n - K) + ' est le nombre de fripons.' : '');
    return sortie(q, String(K), choix, expl);
  }
  return null;
}
const g4Groupe = R => groupe(R, 4, 5);
const g5Groupe = R => groupe(R, 6, 8);

/* 5B · table ronde : nombre minimal ou maximal de chevaliers */
function motif(n, k){   // k = 'S1max' | 'S1min' | 'S2max' | 'S2min' ; renvoie une suite de C et F valable
  const r = [];
  if (k === 'S1max'){ for (let i = 0; i < n; i++) r.push(i % 2 === 0 && !(n % 2 === 1 && i === n - 1) ? 'C' : 'F'); }
  else if (k === 'S1min'){
    const m = Math.floor(n / 3), rr = n % 3;
    if (rr === 0) for (let i = 0; i < m; i++) r.push('C', 'F', 'F');
    else if (rr === 1){ for (let i = 0; i < m - 1; i++) r.push('C', 'F', 'F'); r.push('C', 'F', 'C', 'F'); }
    else { for (let i = 0; i < m; i++) r.push('C', 'F', 'F'); r.push('C', 'F'); }
  } else if (k === 'S2max'){
    const m = Math.floor(n / 3), rr = n % 3;
    if (rr === 0) for (let i = 0; i < m; i++) r.push('C', 'C', 'F');
    else if (rr === 1){ for (let i = 0; i < m - 1; i++) r.push('C', 'C', 'F'); r.push('C', 'F', 'C', 'F'); }
    else { for (let i = 0; i < m; i++) r.push('C', 'C', 'F'); r.push('C', 'F'); }
  } else { for (let i = 0; i < n; i++) r.push(i % 2 === 0 ? 'C' : 'F'); }
  return r;
}
function g5Table(R){
  const n = R.int(6, 15), S = R.pick(['S1', 'S2']), max = R.int(0, 1) === 1, lieu = R.pick([['personnes', 'Toutes', 'assises', 'Chacune'], ['habitants', 'Tous', 'assis', 'Chacun']]);
  const fl = Math.floor, ce = Math.ceil;
  const rep = S === 'S1' ? (max ? fl(n / 2) : ce(n / 3)) : (max ? fl(2 * n / 3) : ce(n / 2));
  const dit = S === 'S1' ? 'Mes deux voisins sont des fripons.' : 'Au moins un de mes deux voisins est un fripon.';
  const q = cap(MOTS[n] || String(n)) + ' ' + lieu[0] + ' sont ' + lieu[2] + ' autour d\'une table ronde. ' + lieu[3] + ' est soit un chevalier, qui dit toujours la vérité, soit un fripon, qui ment toujours. ' +
    lieu[1] + ' déclarent : ' + gu(dit) + '\nQuel est le ' + (max ? 'plus grand' : 'plus petit') + ' nombre possible de chevaliers autour de la table' + QM;
  const autreBorne = S === 'S1' ? (max ? ce(n / 3) : fl(n / 2)) : (max ? ce(n / 2) : fl(2 * n / 3));
  const cand = [autreBorne, S === 'S1' ? (max ? ce(n / 2) : fl(n / 3)) : (max ? ce(2 * n / 3) : fl(n / 2)), fl(n / 2), ce(n / 3), fl(2 * n / 3), ce(n / 2), fl(n / 3), n - rep, rep + 1, rep - 1]
    .filter(x => x >= 1 && x <= n && x !== rep).map(String);
  const choix = choisir(R, String(rep), cand);
  const mot = motif(n, S + (max ? 'max' : 'min')).join(' ');
  let e;
  if (S === 'S1'){
    e = 'Traduis la phrase pour chaque type : un chevalier a ses deux voisins fripons ; un fripon ment, donc au moins un de ses voisins est un chevalier.';
    e += max
      ? ' Deux chevaliers ne peuvent jamais être voisins : il y a au plus un chevalier sur deux, soit au plus ' + rep + ' (' + n + ' ÷ 2 arrondi à l\'unité inférieure). On atteint ' + rep + ' en faisant le tour de la table ainsi : ' + mot + ' (C = chevalier, F = fripon) ; chaque fripon a bien un voisin chevalier.'
      : ' Chaque fripon a besoin d\'un voisin chevalier, et un chevalier n\'a que deux voisins : avec K chevaliers, il y a au plus 2K fripons. Donc ' + n + ' ≤ 3K, et K vaut au moins ' + rep + ' (' + n + ' ÷ 3 arrondi à l\'unité supérieure). On atteint ' + rep + ' ainsi : ' + mot + ' (C = chevalier, F = fripon).';
  } else {
    e = 'Traduis la phrase pour chaque type : un chevalier a au moins un voisin fripon ; un fripon ment, donc ses deux voisins sont des chevaliers.';
    e += max
      ? ' Chaque chevalier a besoin d\'un voisin fripon, et un fripon n\'a que deux voisins : avec F fripons, il y a au plus 2F chevaliers. Donc K ≤ 2 × (' + n + ' − K), soit 3K ≤ ' + (2 * n) + ', et K vaut au plus ' + rep + '. On atteint ' + rep + ' ainsi : ' + mot + ' (C = chevalier, F = fripon).'
      : ' Deux fripons ne peuvent jamais être voisins : il y a au plus un fripon sur deux, donc au moins ' + rep + ' chevaliers (' + n + ' ÷ 2 arrondi à l\'unité supérieure). On atteint ' + rep + ' ainsi : ' + mot + ' (C = chevalier, F = fripon).';
  }
  return sortie(q, String(rep), choix, e + (choix.indexOf(String(autreBorne)) >= 0 ? ' Piège : ' + autreBorne + ' répond à l\'autre question (le ' + (max ? 'minimum' : 'maximum') + ').' : ''));
}

/* 5C · chevalier, fripon et espion */
const ROLES = ['chevalier', 'fripon', 'espion'];
const PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];   // rôle de chaque personne
function fEspion(R, i, N){
  const j = R.pick([0, 1, 2].filter(z => z !== i));
  return R.pick([
    {t: N[j] + ' est le chevalier.', ev: p => p[j] === 0},
    {t: N[j] + ' est le fripon.', ev: p => p[j] === 1},
    {t: N[j] + " est l'espion.", ev: p => p[j] === 2},
    {t: N[j] + " n'est pas l'espion.", ev: p => p[j] !== 2},
    {t: N[j] + " n'est pas le chevalier.", ev: p => p[j] !== 0},
    {t: N[j] + " n'est pas le fripon.", ev: p => p[j] !== 1},
    {t: "Je suis l'espion.", ev: p => p[i] === 2},
    {t: "Je ne suis pas l'espion.", ev: p => p[i] !== 2},
    {t: N[j] + ' ment toujours.', ev: p => p[j] === 1},
    {t: N[j] + ' dit toujours la vérité.', ev: p => p[j] === 0}
  ]);
}
const permTxt = (N, p) => 'Chevalier : ' + N[p.indexOf(0)] + ' ; fripon : ' + N[p.indexOf(1)] + ' ; espion : ' + N[p.indexOf(2)] + '.';
function g5Espion(R){
  const N = R.shuffle(HOMMES).slice(0, 3);
  for (let essai = 0; essai < 300; essai++){
    const fs = [0, 1, 2].map(i => fEspion(R, i, N));
    if (new Set(fs.map(f => f.t)).size < 3) continue;
    const okP = p => fs.every((f, i) => p[i] === 2 || f.ev(p) === (p[i] === 0));
    const sols = PERMS.filter(okP);
    if (sols.length !== 1) continue;
    const s = sols[0], bonne = permTxt(N, s);
    const nbFautes = p => fs.filter((f, i) => p[i] !== 2 && f.ev(p) !== (p[i] === 0)).length;
    const autres = PERMS.filter(p => p !== s).sort((x, y) => nbFautes(x) - nbFautes(y));
    const choix = choisir(R, bonne, autres.slice(0, 2).map(p => permTxt(N, p)), autres.slice(2).map(p => permTxt(N, p)));
    const q = N[0] + ', ' + N[1] + ' et ' + N[2] + ' sont, dans un ordre inconnu, un chevalier (qui dit toujours la vérité), un fripon (qui ment toujours) et un espion (qui dit vrai ou faux, comme il veut). Il y a un personnage de chaque sorte.\n' +
      [0, 1, 2].map(i => '- ' + N[i] + ' : ' + gu(fs[i].t)).join('\n') + '\nQui est qui' + QM;
    const puces = PERMS.map(p => {
      const bad = [0, 1, 2].find(i => p[i] !== 2 && fs[i].ev(p) !== (p[i] === 0));
      return '- Chevalier ' + N[p.indexOf(0)] + ', fripon ' + N[p.indexOf(1)] + ', espion ' + N[p.indexOf(2)] + ' : ' +
        (bad == null ? 'cohérent.' : 'impossible, car ' + N[bad] + ', ' + ROLES[p[bad]] + ', dirait une phrase ' + (p[bad] === 0 ? 'fausse.' : 'vraie.'));
    }).join('\n');
    const expl = 'On teste les 6 répartitions possibles : le chevalier doit dire vrai, le fripon doit mentir, et l\'espion peut dire n\'importe quoi.\n' + puces + '\nSeule une répartition fonctionne. ' + bonne;
    return sortie(q, bonne, choix, expl);
  }
  return null;
}

/* =====================================================================
   AFFIRMATIONS QUI SE COMPTENT (3D, 4D)
   ===================================================================== */
function txtAuto(st, n){
  const qu = st.w === 'V' ? 'vraie' : 'fausse';
  if (st.t === 'EX'){
    if (st.m === 0) return 'Aucune de ces ' + n + " affirmations n'est " + qu + '.';
    if (st.m === n) return 'Ces ' + n + ' affirmations sont toutes ' + qu + 's.';
    if (st.m === 1) return 'Exactement une de ces ' + n + ' affirmations est ' + qu + '.';
    return 'Exactement ' + st.m + ' de ces ' + n + ' affirmations sont ' + qu + 's.';
  }
  const pre = st.t === 'AL' ? 'Au moins ' : 'Au plus ';
  return st.m === 1 ? pre + 'une de ces ' + n + ' affirmations est ' + qu + '.' : pre + st.m + ' de ces ' + n + ' affirmations sont ' + qu + 's.';
}
const vraiAuto = (st, t, n) => vraiGroupe({t: st.t, w: st.w === 'V' ? 'C' : 'F', m: st.m}, t, n);
function ensAuto(l, n){
  if (l.length === 0) return "Aucune n'est vraie.";
  if (l.length === n) return 'Toutes sont vraies.';
  return 'Seulement ' + et(l.map(i => 'A' + (i + 1))) + '.';
}
function autoref(R, n){
  for (let essai = 0; essai < 600; essai++){
    const st = range(1, n).map(() => {
      const t = R.pick(['EX', 'EX', 'AL', 'AM']), w = R.pick(['V', 'F']);
      return {t, w, m: t === 'EX' ? R.int(0, n) : R.int(1, n - 1)};
    });
    const tx = st.map(s => txtAuto(s, n));
    if (new Set(tx).size < n) continue;
    const vr = t => range(0, n - 1).filter(i => vraiAuto(st[i], t, n));
    const ts = range(0, n).filter(t => vr(t).length === t);
    if (ts.length !== 1) continue;
    const t = ts[0];
    const q0 = 'Voici ' + n + ' affirmations :\n' + range(0, n - 1).map(i => '- A' + (i + 1) + ' : ' + tx[i]).join('\n') + '\n';
    let q, bonne, choix;
    if (R.int(0, 1) === 0){
      q = q0 + 'Combien de ces affirmations sont vraies' + QM; bonne = String(t);
      const proches = range(0, n).filter(k => k !== t).sort((x, y) => Math.abs(vr(x).length - x) - Math.abs(vr(y).length - y));
      choix = choisir(R, bonne, [String(n - t)].concat(proches.map(String)));
    } else {
      q = q0 + 'Quelles affirmations sont vraies' + QM; bonne = ensAuto(vr(t), n);
      const comp = range(0, n - 1).filter(i => vr(t).indexOf(i) < 0);
      choix = choisir(R, bonne, [ensAuto(comp, n)].concat(range(0, n).filter(k => k !== t).map(k => ensAuto(vr(k), n))), range(0, n - 1).map(i => ensAuto([i], n)));
    }
    const puces = range(0, n).map(k => {
      const v = vr(k);
      return '- t = ' + k + ' : seraient vraies ' + (v.length ? et(v.map(i => 'A' + (i + 1))) : 'aucune') + ', soit ' + v.length + (v.length === k ? ' : cohérent.' : ' et non ' + k + ' : impossible.');
    }).join('\n');
    const expl = 'Chaque affirmation ne dépend que du nombre t d\'affirmations vraies : teste t = 0, 1, …, ' + n + ' et garde la valeur qui donne exactement t affirmations vraies.\n' + puces +
      '\nIl y a donc ' + t + ' affirmation' + (t > 1 ? 's' : '') + ' vraie' + (t > 1 ? 's' : '') + (t ? ' : ' + et(vr(t).map(i => 'A' + (i + 1))) : '') + '.' +
      (choix.indexOf(String(n - t)) >= 0 && n - t !== t ? ' Piège : ' + (n - t) + ' est le nombre d\'affirmations fausses.' : '');
    return sortie(q, bonne, choix, expl);
  }
  return null;
}
const g3Auto = R => autoref(R, 4);
const g4Auto = R => autoref(R, 5);

/* =====================================================================
   NOMBRE SECRET (3C, 4C, 5D)
   ===================================================================== */
const estPremier = x => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; };
const estCarre = x => { const r = Math.round(Math.sqrt(x)); return r * r === x; };
const sChiffres = x => String(x).split('').reduce((s, c) => s + Number(c), 0);
function tirerPred(R, kind, M){
  if (kind === 'par') return R.int(0, 1) ? {k: kind, t: 'N est pair.', f: x => x % 2 === 0} : {k: kind, t: 'N est impair.', f: x => x % 2 === 1};
  if (kind === 'mul'){ const m = R.pick([3, 4, 5, 6, 7, 9].filter(v => v * 3 <= M)); return {k: kind, t: 'N est un multiple de ' + m + '.', f: x => x % m === 0}; }
  if (kind === 'car') return {k: kind, t: 'N est un carré parfait.', f: estCarre};
  if (kind === 'pre') return {k: kind, t: 'N est un nombre premier.', f: estPremier};
  if (kind === 'gt'){ const m = R.int(4, M - 4); return {k: kind, t: 'N est strictement plus grand que ' + m + '.', f: x => x > m}; }
  if (kind === 'lt'){ const m = R.int(5, M - 3); return {k: kind, t: 'N est strictement plus petit que ' + m + '.', f: x => x < m}; }
  if (kind === 'uni'){ const d = R.int(0, 9); return {k: kind, t: 'Le chiffre des unités de N est ' + d + '.', f: x => x % 10 === d}; }
  if (kind === 'som'){ const s = R.int(3, 12); return {k: kind, t: 'La somme des chiffres de N vaut ' + s + '.', f: x => sChiffres(x) === s}; }
  const m = R.pick([24, 30, 36, 48, 60, 72]); return {k: kind, t: 'N est un diviseur de ' + m + '.', f: x => m % x === 0};
}
function condNb(n, k){
  const f = n - k;
  if (f === 1) return 'exactement une est fausse';
  if (k === 1) return 'exactement une est vraie';
  return f <= k ? 'exactement ' + MOTSF[f] + ' sont fausses' : 'exactement ' + MOTSF[k] + ' sont vraies';
}
function nombre(R, n, M, ks){
  const nomP = R.pick(PRENOMS);
  for (let essai = 0; essai < 800; essai++){
    const kinds = R.shuffle(['par', 'mul', 'car', 'pre', 'gt', 'lt', 'uni', 'som', 'div']).slice(0, n);
    const P = kinds.map(k => tirerPred(R, k, M));
    if (P.some(p => { const c = range(1, M).filter(p.f).length; return c < 2 || c > M - 2; })) continue;
    const k = R.pick(ks);
    const cnt = x => P.filter(p => p.f(x)).length;
    const sols = range(1, M).filter(x => cnt(x) === k);
    if (sols.length !== 1) continue;
    const x0 = sols[0];
    const tous = range(1, M).filter(x => cnt(x) === n);
    const voisins = R.shuffle(range(1, M).filter(x => x !== x0 && Math.abs(cnt(x) - k) === 1)).sort((a, b) => Math.abs(a - x0) - Math.abs(b - x0));
    const choix = choisir(R, String(x0), R.shuffle(tous).slice(0, 1).concat(voisins.slice(0, 3)).map(String), range(1, M).filter(x => x !== x0).map(String));
    const q = nomP + ' pense à un nombre entier N compris entre 1 et ' + M + ', bornes incluses. Parmi les ' + MOTSF[n] + ' phrases suivantes, ' + condNb(n, k) + ' :\n' +
      P.map((p, i) => '- Phrase ' + (i + 1) + ' : ' + p.t).join('\n') + '\nQuel est le nombre N' + QM;
    const f = n - k, parFausses = f <= k;
    const cas = combis(n, parFausses ? f : k).map(sel => {
      const vraies = parFausses ? range(0, n - 1).filter(i => sel.indexOf(i) < 0) : sel;
      const lst = range(1, M).filter(x => P.every((p, i) => p.f(x) === (vraies.indexOf(i) >= 0)));
      const lib = sel.length === 1 ? 'Phrase ' + (sel[0] + 1) : 'Phrases ' + et(sel.map(i => String(i + 1)));
      return '- ' + lib + ' ' + (parFausses ? (sel.length > 1 ? 'fausses' : 'fausse') : (sel.length > 1 ? 'vraies' : 'vraie')) + ', les autres ' + (parFausses ? 'vraies' : 'fausses') + ' : ' + (lst.length ? lst.join(', ') : 'aucun nombre') + '.';
    }).join('\n');
    const vr = range(0, n - 1).filter(i => P[i].f(x0)).map(i => String(i + 1)), fx = range(0, n - 1).filter(i => !P[i].f(x0)).map(i => String(i + 1));
    const piege = tous.filter(x => choix.indexOf(String(x)) >= 0);
    const expl = 'Fais la liste des cas possibles (quelles phrases sont fausses), puis cherche, pour chaque cas, les nombres qui vérifient exactement ce cas.\n' + cas +
      '\nSeul ' + x0 + ' convient. Vérification : il rend vraie' + (vr.length > 1 ? 's les phrases ' : ' la phrase ') + et(vr) + ', et fausse' + (fx.length > 1 ? 's les phrases ' : ' la phrase ') + et(fx) + '.' +
      (piege.length ? ' Piège : ' + piege[0] + ' vérifie les ' + MOTSF[n] + ' phrases, alors que l\'énoncé en impose ' + (f === 1 ? 'une fausse' : MOTSF[f] + ' fausses') + '.' : '');
    return sortie(q, String(x0), choix, expl);
  }
  return null;
}
const g3Nombre = R => nombre(R, 3, 30, [2, 1]);
const g4Nombre = R => nombre(R, 4, 50, [3, 2, 1]);
/* Niveau 5 : 5 phrases dont une seule fausse ou une seule vraie, donc 5 cas à examiner de 1 à 100. */
const g5Nombre = R => nombre(R, 5, 100, [4, 1]);

/* =====================================================================
   SYLLOGISMES : groupes d'un lycée (2C, 3E, 4G)
   ===================================================================== */
const CLUBS = [
  {n: 'le club théâtre', d: 'du club théâtre'}, {n: 'la chorale', d: 'de la chorale'}, {n: "l'équipe de foot", d: "de l'équipe de foot"},
  {n: "le club d'échecs", d: "du club d'échecs"}, {n: "l'orchestre", d: "de l'orchestre"}, {n: 'le club photo', d: 'du club photo'},
  {n: 'le club de robotique', d: 'du club de robotique'}, {n: "l'équipe de basket", d: "de l'équipe de basket"}, {n: 'le club de danse', d: 'du club de danse'},
  {n: 'le conseil des élèves', d: 'du conseil des élèves'}, {n: 'le club de lecture', d: 'du club de lecture'}, {n: 'le journal du lycée', d: 'du journal du lycée'}
];
function phraseS(s, C){
  const X = C[s[1]], Y = C[s[2]];
  if (s[0] === 'T') return 'Tout membre ' + X.d + ' est aussi membre ' + Y.d + '.';
  if (s[0] === 'N') return 'Aucun membre ' + X.d + " n'est membre " + Y.d + '.';
  if (s[0] === 'S') return 'Au moins un membre ' + X.d + ' est aussi membre ' + Y.d + '.';
  return 'Au moins un membre ' + X.d + " n'est pas membre " + Y.d + '.';
}
/* Satisfiabilité exacte : les phrases « tout / aucun » vident des zones du diagramme ; chaque phrase « au moins un »
   et chaque groupe (non vide) exige une zone autorisée. Les zones autorisées peuvent toutes être occupées à la fois. */
function satisf(k, S){
  const T = 1 << k, ok = new Array(T).fill(true), b = (m, i) => (m >> i) & 1;
  S.forEach(s => { for (let m = 0; m < T; m++){ if (s[0] === 'T' && b(m, s[1]) && !b(m, s[2])) ok[m] = false; if (s[0] === 'N' && b(m, s[1]) && b(m, s[2])) ok[m] = false; } });
  const tem = f => { for (let m = 0; m < T; m++) if (ok[m] && f(m)) return true; return false; };
  for (let g = 0; g < k; g++) if (!tem(m => b(m, g))) return false;
  return S.every(s => (s[0] === 'S' ? tem(m => b(m, s[1]) && b(m, s[2])) : s[0] === 'O' ? tem(m => b(m, s[1]) && !b(m, s[2])) : true));
}
const NEGS = {T: 'O', O: 'T', N: 'S', S: 'N'};
const certain = (k, P, c) => !satisf(k, P.concat([[NEGS[c[0]], c[1], c[2]]]));
const exclu = (k, P, c) => !satisf(k, P.concat([c]));
const SYL = [
  {g: 3, p: [['T', 0, 1], ['T', 1, 2]], c: ['T', 0, 2], e: C => 'Un membre ' + C[0].d + ' est forcément membre ' + C[1].d + ', donc aussi membre ' + C[2].d + '.'},
  {g: 3, p: [['T', 0, 1], ['N', 1, 2]], c: ['N', 0, 2], e: C => 'Un membre ' + C[0].d + ' est forcément membre ' + C[1].d + ', et aucun membre ' + C[1].d + " n'est membre " + C[2].d + ' : il ne peut donc pas être membre ' + C[2].d + '.'},
  {g: 3, p: [['S', 0, 1], ['T', 1, 2]], c: ['S', 0, 2], e: C => 'Prends un membre ' + C[0].d + ' qui est aussi membre ' + C[1].d + ' : comme tout membre ' + C[1].d + ' est membre ' + C[2].d + ', il est aussi membre ' + C[2].d + '.'},
  {g: 3, p: [['T', 2, 1], ['N', 0, 1]], c: ['N', 0, 2], e: C => 'Si un membre ' + C[0].d + ' était membre ' + C[2].d + ', il serait aussi membre ' + C[1].d + ' (comme tout membre ' + C[2].d + '), ce qui est exclu.'},
  {g: 3, p: [['N', 1, 2], ['S', 0, 1]], c: ['O', 0, 2], e: C => 'Prends un membre ' + C[0].d + ' qui est aussi membre ' + C[1].d + ' : comme aucun membre ' + C[1].d + " n'est membre " + C[2].d + ", il n'est pas membre " + C[2].d + '.'},
  {g: 3, p: [['T', 2, 1], ['O', 0, 1]], c: ['O', 0, 2], e: C => 'Prends un membre ' + C[0].d + " qui n'est pas membre " + C[1].d + ' : il ne peut pas être membre ' + C[2].d + ', sinon il serait membre ' + C[1].d + '.'},
  {g: 3, p: [['O', 1, 2], ['T', 1, 0]], c: ['O', 0, 2], e: C => 'Prends un membre ' + C[1].d + " qui n'est pas membre " + C[2].d + ' : il est membre ' + C[0].d + ' (comme tout membre ' + C[1].d + '). C\'est donc un membre ' + C[0].d + " qui n'est pas membre " + C[2].d + '.'},
  {g: 3, p: [['T', 1, 0], ['T', 1, 2]], c: ['S', 0, 2], e: C => cap(C[1].n) + ' a au moins un membre ; il est à la fois membre ' + C[0].d + ' et membre ' + C[2].d + '.'},
  {g: 3, p: [['N', 1, 2], ['T', 1, 0]], c: ['O', 0, 2], e: C => cap(C[1].n) + ' a au moins un membre ; il est membre ' + C[0].d + ' mais pas membre ' + C[2].d + '.'},
  {g: 4, p: [['T', 0, 1], ['T', 1, 2], ['N', 2, 3]], c: ['N', 0, 3], e: C => 'Un membre ' + C[0].d + ' est membre ' + C[1].d + ', donc membre ' + C[2].d + ', donc il n\'est pas membre ' + C[3].d + '.'},
  {g: 4, p: [['S', 3, 0], ['T', 0, 1], ['T', 1, 2]], c: ['S', 3, 2], e: C => 'Prends un membre ' + C[3].d + ' qui est aussi membre ' + C[0].d + ' : il est membre ' + C[1].d + ', donc membre ' + C[2].d + '.'},
  {g: 4, p: [['T', 0, 1], ['T', 1, 2], ['O', 3, 2]], c: ['O', 3, 0], e: C => 'Prends un membre ' + C[3].d + " qui n'est pas membre " + C[2].d + ' : il n\'est pas membre ' + C[1].d + ' (sinon il serait membre ' + C[2].d + '), donc pas membre ' + C[0].d + ' (sinon il serait membre ' + C[1].d + ').'}
];
const SYL_NIV = {2: {v: [0, 1, 2], f: []}, 3: {v: [3, 4, 5, 6], f: [0, 1, 2]}, 4: {v: [7, 8, 9, 10, 11], f: [3, 4, 5, 6]}};
function syllo(R, lv){
  const L = SYL_NIV[lv], faux = L.f.length > 0 && R.int(0, 2) === 0, pat = SYL[R.pick(faux ? L.f : L.v)];
  const k = pat.g, C = R.shuffle(CLUBS).slice(0, k), P = pat.p.map(s => s.slice());
  const rep = faux ? [NEGS[pat.c[0]], pat.c[1], pat.c[2]] : pat.c.slice();
  /* « Aucun » et « au moins un… est aussi » sont symétriques : ordre fixé (alphabétique) pour qu'un même énoncé ait toujours la même réponse. */
  if ((rep[0] === 'S' || rep[0] === 'N') && C[rep[1]].n.localeCompare(C[rep[2]].n) > 0){ const t = rep[1]; rep[1] = rep[2]; rep[2] = t; }
  const cle = s => s.join(',');
  const prem = new Set(P.map(cle).concat(P.filter(s => s[0] === 'N' || s[0] === 'S').map(s => [s[0], s[2], s[1]].join(','))));
  const tous = [];
  ['T', 'N', 'S', 'O'].forEach(t => range(0, k - 1).forEach(i => range(0, k - 1).forEach(j => { if (i !== j) tous.push([t, i, j]); })));
  const valide = s => cle(s) !== cle(rep) && !prem.has(cle(s)) && (faux ? !exclu(k, P, s) : !certain(k, P, s));
  const cands = tous.filter(valide);
  const conv = [rep[0], rep[2], rep[1]];
  const prio = [conv].concat(P.filter(s => s[0] === 'T').map(s => ['T', s[2], s[1]]))
    .concat(tous.filter(s => s[1] === rep[1] && s[2] === rep[2])).filter(valide);
  const bonne = phraseS(rep, C);
  const choix = choisir(R, bonne, R.shuffle(prio).map(s => phraseS(s, C)), cands.map(s => phraseS(s, C)));
  const ordre = R.shuffle(P);
  const q = 'Dans un lycée, ' + et(R.shuffle(C).map(c => c.n)) + ' comptent chacun au moins un membre. On sait que :\n' + ordre.map(s => '- ' + phraseS(s, C)).join('\n') +
    '\nLaquelle de ces affirmations est forcément ' + (faux ? 'fausse' : 'vraie') + QM;
  const pieges = P.filter(s => s[0] === 'T').map(s => phraseS(['T', s[2], s[1]], C)).filter(t => choix.indexOf(t) >= 0);
  const expl = 'Représente chaque groupe par un cercle (un diagramme) et cherche ce qui est obligé, pas seulement possible. ' + pat.e(C) +
    (!faux && (rep[1] !== pat.c[1]) ? ' Donc ' + gu(phraseS(pat.c, C)) + ' Or une phrase « au moins un membre de X est aussi membre de Y », comme « aucun membre de X n\'est membre de Y », se lit dans les deux sens.' : '') +
    (faux ? ' Donc ' + gu(phraseS(pat.c, C)) + ' est forcément vraie, et son contraire ' + gu(bonne) + ' est forcément faux. Les autres affirmations peuvent être vraies.'
      : ' Donc ' + gu(bonne) + ' est forcément vraie. Aucune des autres affirmations n\'est obligée : chacune peut être fausse.') +
    (pieges.length ? ' Piège : ' + gu(pieges[0]) + ' renverse le sens d\'une des règles ; rien ne le garantit.' : '');
  return sortie(q, bonne, choix, expl);
}

/* =====================================================================
   CHAÎNE DE DEUX RÈGLES (2D)
   ===================================================================== */
const CHAINES = [
  [['il pleut', 'il ne pleut pas'], ['le match est annulé', "le match n'est pas annulé"], ['Léa reste à la maison', 'Léa ne reste pas à la maison']],
  [['le réveil sonne', 'le réveil ne sonne pas'], ['Nina se lève', 'Nina ne se lève pas'], ['Nina prend son petit déjeuner', 'Nina ne prend pas son petit déjeuner']],
  [['la batterie est chargée', "la batterie n'est pas chargée"], ["le téléphone s'allume", "le téléphone ne s'allume pas"], ['Sami lit ses messages', 'Sami ne lit pas ses messages']],
  [['le magasin est ouvert', "le magasin n'est pas ouvert"], ['la vitrine est éclairée', "la vitrine n'est pas éclairée"], ["les passants s'arrêtent", "les passants ne s'arrêtent pas"]],
  [['Emma réussit son examen', 'Emma ne réussit pas son examen'], ['Emma part en vacances', 'Emma ne part pas en vacances'], ["Emma prend l'avion", "Emma ne prend pas l'avion"]],
  [['le prix baisse', 'le prix ne baisse pas'], ['les ventes augmentent', "les ventes n'augmentent pas"], ["l'entreprise embauche", "l'entreprise n'embauche pas"]],
  [['le train est en retard', "le train n'est pas en retard"], ['Hugo rate son bus', 'Hugo ne rate pas son bus'], ['Hugo arrive en retard au travail', "Hugo n'arrive pas en retard au travail"]],
  [['la température dépasse 30 degrés', 'la température ne dépasse pas 30 degrés'], ['la piscine est ouverte', "la piscine n'est pas ouverte"], ['Maya va nager', 'Maya ne va pas nager']],
  [['le colis arrive avant midi', "le colis n'arrive pas avant midi"], ["Paul l'ouvre tout de suite", "Paul ne l'ouvre pas tout de suite"], ['Paul est en retard à son rendez-vous', "Paul n'est pas en retard à son rendez-vous"]]
];
function statutTxt(CH, i, j, si_, sj){
  const lit = (v, b) => CH[v][b ? 0 : 1];
  if (si_ !== null && sj !== null) return cap(lit(i, si_)) + ' et ' + lit(j, sj) + '.';
  if (si_ !== null) return cap(lit(i, si_)) + ', mais on ne peut pas savoir ' + si(CH[j][0]) + '.';
  if (sj !== null) return cap(lit(j, sj)) + ', mais on ne peut pas savoir ' + si(CH[i][0]) + '.';
  return 'On ne peut savoir ni ' + si(CH[i][0]) + ' ni ' + si(CH[j][0]) + '.';
}
function g2Chaine(R){
  const CH = R.pick(CHAINES), v = R.int(0, 2), val = R.int(0, 1) === 1;
  const mondes = toutes(3).filter(a => (!a[0] || a[1]) && (!a[1] || a[2]) && a[v] === val);
  const st = z => (mondes.every(a => a[z]) ? true : mondes.every(a => !a[z]) ? false : null);
  const [i, j] = [0, 1, 2].filter(z => z !== v);
  const bonne = statutTxt(CH, i, j, st(i), st(j));
  const opts = [true, false, null];
  const tousS = [];
  opts.forEach(x => opts.forEach(y => tousS.push(statutTxt(CH, i, j, x, y))));
  const prio = [statutTxt(CH, i, j, val, val), statutTxt(CH, i, j, null, null)];
  const [A, nA] = CH[0], [B, nB] = CH[1], [C, nC] = CH[2];
  const fait = CH[v][val ? 0 : 1];
  const q = 'On sait que ces deux règles sont toujours respectées :\n- ' + regleTxt(A, B) + '\n- ' + regleTxt(B, C) + '\nOr ' + fait + '. Que peut-on en conclure' + QM;
  let e;
  if (v === 0 && val) e = 'La première règle donne : ' + B + ' ; puis la deuxième donne : ' + C + '.';
  else if (v === 0) e = 'La condition de la première règle n\'est pas remplie : les règles ne disent rien de la suite. On ne sait ni ' + si(B) + ' ni ' + si(C) + '. Piège : conclure que « ' + nB + ' », c\'est raisonner « si non P, alors non Q », ce qui n\'est pas garanti.';
  else if (v === 1 && val) e = 'La deuxième règle donne : ' + C + '. En revanche, la première règle ne permet pas de remonter : savoir ' + que(B) + ' ne dit rien de sa condition, donc on ne sait pas ' + si(A) + '. Piège : remonter de la conséquence à la condition, c\'est utiliser la réciproque.';
  else if (v === 1) e = 'Par contraposée de la première règle, ' + gu(regleTxt(nB, nA)) + ' : donc ' + nA + '. La deuxième règle ne dit rien quand ' + nB + ' : on ne sait pas ' + si(C) + '.';
  else if (val) e = 'Les deux règles vont dans un seul sens et on ne peut pas remonter : on ne sait ni ' + si(A) + ' ni ' + si(B) + '. Piège : utiliser les réciproques.';
  else e = 'Par contraposée de la deuxième règle, ' + nB + ' ; puis, par contraposée de la première, ' + nA + '.';
  return sortie(q, bonne, choisir(R, bonne, prio, tousS), 'Applique chaque règle dans le bon sens : de la condition vers la conséquence, ou, par contraposée, de la conséquence fausse vers la condition fausse. ' + e);
}

/* =====================================================================
   ROBOTS MENTEURS SELON LE JOUR (4E, 5E)
   ===================================================================== */
const ROBOTS = [['Pim', 'Pam'], ['Bip', 'Bop'], ['Nox', 'Lux'], ['Kip', 'Kap'], ['Rok', 'Rik'], ['Zap', 'Zip']];
const TEMPO = [
  {t: 'Hier, je mentais.', ev: (L, d) => L[(d + 6) % 7]},
  {t: 'Hier, je disais la vérité.', ev: (L, d) => !L[(d + 6) % 7]},
  {t: 'Demain, je mentirai.', ev: (L, d) => L[(d + 1) % 7]},
  {t: 'Demain, je dirai la vérité.', ev: (L, d) => !L[(d + 1) % 7]}
];
function stmtAvance(R){
  const j = R.int(0, 6);
  return R.pick([
    {t: 'Hier, je mentais, et demain je mentirai aussi.', ev: (L, d) => L[(d + 6) % 7] && L[(d + 1) % 7]},
    {t: 'Hier, je disais la vérité, et demain je dirai la vérité.', ev: (L, d) => !L[(d + 6) % 7] && !L[(d + 1) % 7]},
    {t: "Hier, c'était " + JOURS[j] + '.', ev: (L, d) => (d + 6) % 7 === j},
    {t: 'Demain, ce sera ' + JOURS[j] + '.', ev: (L, d) => (d + 1) % 7 === j},
    {t: "Aujourd'hui, c'est le week-end.", ev: (L, d) => d >= 5}
  ]);
}
function tirerMensonge(R){
  const s = R.int(2, 4);
  let jours;
  if (R.int(0, 1)){ const d0 = R.int(0, 6); jours = range(0, s - 1).map(k => (d0 + k) % 7); } else jours = R.shuffle(range(0, 6)).slice(0, s);
  const L = range(0, 6).map(d => jours.indexOf(d) >= 0);
  return L;
}
const robotTxt = (nom, L) => 'Le robot ' + nom + ' ment toute la journée ' + et(range(0, 6).filter(d => L[d]).map(d => 'le ' + JOURS[d])) + ', et dit toujours la vérité les autres jours.';
function robots(R, avance){
  const paire = R.pick(ROBOTS);
  for (let essai = 0; essai < 500; essai++){
    const unSeul = avance && R.int(0, 1) === 0;
    const Ls = unSeul ? [tirerMensonge(R)] : [tirerMensonge(R), tirerMensonge(R)];
    if (!unSeul && Ls[0].join() === Ls[1].join()) continue;
    let dits;   // [{r: indice du robot, s: phrase}]
    if (unSeul) dits = [{r: 0, s: R.pick(TEMPO)}, {r: 0, s: stmtAvance(R)}];
    else if (avance) dits = [{r: 0, s: stmtAvance(R)}, {r: 1, s: R.pick(TEMPO.concat([stmtAvance(R)]))}];
    else dits = [{r: 0, s: R.pick(TEMPO)}, {r: 1, s: R.pick(TEMPO)}];
    if (dits[0].s.t === dits[1].s.t && unSeul) continue;
    const coh = (x, d) => x.s.ev(Ls[x.r], d) === !Ls[x.r][d];
    const jours = range(0, 6).filter(d => dits.every(x => coh(x, d)));
    if (jours.length !== 1) continue;
    const d0 = jours[0];
    if (dits.some(x => range(0, 6).filter(d => coh(x, d)).length === 7)) continue;
    const proches = R.shuffle(range(0, 6).filter(d => d !== d0)).sort((a, b) => dits.filter(x => !coh(x, a)).length - dits.filter(x => !coh(x, b)).length);
    const choix = choisir(R, JOURS[d0], proches.map(d => JOURS[d]));
    const noms = paire;
    const q = unSeul
      ? robotTxt(noms[0], Ls[0]) + '\nUn jour, ' + noms[0] + ' fait deux déclarations : ' + gu(dits[0].s.t) + ' et ' + gu(dits[1].s.t) + '\nQuel jour sommes-nous' + QM
      : robotTxt(noms[0], Ls[0]) + '\n' + robotTxt(noms[1], Ls[1]) + '\nUn jour, ' + noms[0] + ' déclare : ' + gu(dits[0].s.t) + ' Le même jour, ' + noms[1] + ' déclare : ' + gu(dits[1].s.t) + '\nQuel jour sommes-nous' + QM;
    const puces = dits.map(x => {
      const l = range(0, 6).filter(d => coh(x, d));
      return '- ' + noms[x.r] + ', ' + gu(x.s.t) + ' : cohérente ' + (l.length ? et(l.map(d => 'le ' + JOURS[d])) : 'aucun jour') + '.';
    }).join('\n');
    const verif = dits.map(x => 'le ' + JOURS[d0] + ', ' + noms[x.r] + ' ' + (Ls[x.r][d0] ? 'ment et sa phrase ' + gu(x.s.t) + ' est bien fausse' : 'dit la vérité et sa phrase ' + gu(x.s.t) + ' est bien vraie')).join(' ; ');
    const expl = 'Pour chaque phrase, cherche les jours où elle est cohérente : vraie un jour où le robot dit la vérité, fausse un jour où il ment (la veille du lundi est le dimanche).\n' + puces +
      '\nLe seul jour commun est le ' + JOURS[d0] + '. Vérification : ' + verif + '.';
    return sortie(q, JOURS[d0], choix, expl);
  }
  return null;
}
const g4Robots = R => robots(R, false);
const g5Robots = R => robots(R, true);

/* =====================================================================
   AIGUILLAGE PAR NIVEAU
   ===================================================================== */
const PAR_NIVEAU = {
  1: [g1Fait, g1Equiv, g1Deduc, g1Neg, g1Fripon],
  2: [g2Coupable, g2Seul, R => syllo(R, 2), g2Chaine],
  3: [g3Coupable, g3Duo, g3Nombre, g3Auto, R => syllo(R, 3)],
  4: [g4Trio, g4Coupable, g4Nombre, g4Auto, g4Robots, g4Groupe, R => syllo(R, 4)],
  5: [g5Groupe, g5Table, g5Espion, g5Nombre, g5Robots]
};
function valide(ex){
  if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string' || !Array.isArray(ex.choix) || ex.choix.length !== 4) return false;
  const n = ex.choix.map(norm);
  return new Set(n).size === 4 && n.filter(x => x === norm(ex.a)).length === 1;
}
/* Question de secours (jamais d'exception) : contraposée simple. */
const SECOURS = () => sortie(
  'On sait que la règle suivante est toujours respectée : ' + gu("S'il neige, alors l'école est fermée.") + "\nOr l'école n'est pas fermée. Que peut-on en conclure" + QM,
  'Il ne neige pas.', ['Il ne neige pas.', 'Il neige.', "On ne peut pas savoir s'il neige.", "La règle n'a pas été respectée."],
  M_REGLE + " Ici, la conséquence est fausse. Par contraposée, la règle a le même sens que « Si l'école n'est pas fermée, alors il ne neige pas ». Donc il ne neige pas.");

A.push({
  id: 'alb-16-logique',
  phase: 'albert',
  ordre: 16,
  theme: 'logique',
  titre: 'Logique : implications, menteurs, affirmations vraies ou fausses',
  objectif: 'Déduire ce qui est forcément vrai à partir de règles « si… alors », de négations, de chevaliers et fripons ou d\'affirmations dont une seule est vraie, en testant tous les cas.',
  lecon:
`<p class="lede">Dans le test, certaines questions ne demandent presque aucun calcul : il faut <mark>déduire</mark> ce qui est forcément vrai à partir de phrases données. Règles « si… alors », personnages qui mentent toujours, suspects dont un seul dit la vérité, listes d'affirmations qui parlent d'elles-mêmes : tout se résout avec trois outils simples et un <mark>tableau de cas</mark>.</p>
<h2>Ce que le test demande</h2>
<p>On te donne quelques phrases et une information sur leur vérité (elles sont vraies, ou « une seule est vraie », ou elles sont dites par quelqu'un qui ment toujours). Tu dois trouver la seule conclusion certaine : qui est coupable, qui ment, quel est le nombre, quel jour on est. Aucune formule de cours n'est demandée : on juge ta rigueur. Le piège n'est jamais un calcul, c'est une phrase mal comprise ou un cas oublié.</p>
<h2>Les outils à connaître</h2>
<h3>1. La phrase « si P, alors Q »</h3>
<p>Elle dit seulement : chaque fois que P est vrai, Q est vrai. Elle ne dit rien quand P est faux.</p>
<table class="tbl"><tr><th>Phrase</th><th>Même sens que « si P, alors Q » ?</th></tr>
<tr><td>Si non Q, alors non P (la contraposée)</td><td>Oui, toujours</td></tr>
<tr><td>Si Q, alors P (la réciproque)</td><td>Non</td></tr>
<tr><td>Si non P, alors non Q</td><td>Non</td></tr></table>
<p>Exemple : « S'il neige, alors l'école est fermée. » Si l'école est ouverte, il ne neige pas (contraposée). Mais si l'école est fermée, il ne neige pas forcément : elle peut être fermée pour une autre raison.</p>
<h3>2. La négation</h3>
<p>La négation d'une phrase est la phrase vraie exactement quand la première est fausse.</p>
<table class="tbl"><tr><th>Phrase</th><th>Sa négation</th></tr>
<tr><td>Tous les élèves ont la moyenne</td><td>Au moins un élève n'a pas la moyenne</td></tr>
<tr><td>Aucun élève n'a triché</td><td>Au moins un élève a triché</td></tr>
<tr><td>P et Q</td><td>non P ou non Q</td></tr>
<tr><td>P ou Q</td><td>non P et non Q</td></tr>
<tr><td>J'ai plus de 3 frères (4 ou plus)</td><td>J'ai 3 frères ou moins</td></tr>
<tr><td>Nous sommes deux fripons</td><td>Au moins l'un de nous est un chevalier</td></tr></table>
<p>En maths, « ou » est inclusif : « P ou Q » est vraie dès qu'au moins l'une des deux est vraie, y compris les deux.</p>
<h3>3. Chevaliers et fripons</h3>
<p>Un chevalier dit toujours vrai, un fripon ment toujours. Donc si la personne est un chevalier, sa phrase est vraie ; si c'est un fripon, sa phrase est fausse. Une phrase en « et » est fausse dès qu'une partie est fausse ; une phrase « si…, alors… » n'est fausse que si la condition est vraie et la conséquence fausse.</p>
<h2>La méthode</h2>
<div class="etapes">
<p><strong>1. Je traduis chaque phrase :</strong> qu'affirme-t-elle exactement, et quelle est sa négation ?</p>
<p><strong>2. Je cherche un raccourci :</strong> deux phrases contradictoires (exactement l'une des deux est vraie), ou une phrase impossible dans la bouche d'un fripon.</p>
<p><strong>3. Je teste tous les cas :</strong> chaque coupable possible, chaque répartition chevalier ou fripon, chaque nombre possible de phrases vraies. Je garde les cas sans contradiction.</p>
<p><strong>4. Je vérifie qu'il ne reste qu'un cas</strong>, puis je relis la question : on demande parfois les fripons, pas les chevaliers.</p>
</div>
<h2>Exemples résolus</h2>
<h3>1. Une règle et un fait</h3>
<p>« Si le magasin est ouvert, alors l'enseigne est allumée. » Or l'enseigne n'est pas allumée. Par contraposée, le magasin n'est pas ouvert. Si on avait vu l'enseigne allumée, on n'aurait rien pu dire du magasin.</p>
<h3>2. Une seule phrase est vraie</h3>
<p>Une seule personne a pris le dernier yaourt : Jade, Malik ou Sofia. Jade : « C'est Malik. » Malik : « Ce n'est pas moi. » Sofia : « Ce n'est pas Jade. » Une seule de ces phrases est vraie. Jade et Malik se contredisent : exactement l'une de leurs deux phrases est vraie. Celle de Sofia est donc fausse : c'est <strong>Jade</strong>. Vérification : si c'est Jade, seule la phrase de Malik est vraie.</p>
<h3>3. Deux habitants parlent</h3>
<p>Oscar dit : « Rémi et moi sommes du même type. » Rémi dit : « Oscar est un fripon. » Si Oscar était un chevalier, Rémi serait aussi un chevalier et dirait vrai en traitant Oscar de fripon : contradiction. Donc Oscar est un <strong>fripon</strong> ; sa phrase est fausse, donc Rémi est de l'autre type : un <strong>chevalier</strong>. Vérification : Rémi dit bien la vérité.</p>
<h3>4. Au niveau du test : des affirmations qui se comptent</h3>
<p>A1 : « Au moins deux de ces quatre affirmations sont fausses. » A2 : « Exactement une de ces quatre affirmations est vraie. » A3 : « Au plus deux de ces quatre affirmations sont vraies. » A4 : « Aucune de ces quatre affirmations n'est fausse. » Chaque phrase ne dépend que du nombre t de phrases vraies. On teste t = 0 : A1 et A3 seraient vraies, soit 2 et non 0. t = 1 : A1, A2 et A3, soit 3. t = 2 : A1 et A3, soit 2 : cohérent. t = 3 : aucune. t = 4 : seulement A4. Seul t = 2 fonctionne : <strong>A1 et A3 sont vraies</strong>.</p>
<h2>Les réflexes sans calculatrice</h2>
<ul>
<li>Écris la négation avant de raisonner : « plus de 3 » devient « 3 ou moins ».</li>
<li>Deux phrases contradictoires : exactement une des deux est vraie. C'est souvent la clé des énigmes « une seule phrase est vraie ».</li>
<li>Un fripon ne peut jamais dire une phrase qui serait vraie dans sa bouche, comme « je suis un fripon ».</li>
<li>Au brouillon, une ligne par cas (C ou F pour chaque personne, ou le nom du coupable) avec V ou F sous chaque phrase.</li>
<li>Quand les phrases parlent du nombre de phrases vraies ou de chevaliers, teste chaque nombre possible : 0, 1, 2…</li>
<li>Avec les jours de la semaine, pense au cycle : la veille du lundi est le dimanche.</li>
</ul>
<div class="box astuce"><p class="box-t">Astuce</p><p>Teste chaque cas possible (coupable, répartition des chevaliers, nombre de phrases vraies) et garde le seul qui ne crée aucune contradiction.</p></div>
<div class="box piege"><p class="box-t">Piège</p><p>Confondre la contraposée (« si non Q, alors non P », toujours juste) avec la réciproque (« si Q, alors P », pas garantie). Nier « tous » par « aucun » au lieu de « au moins un… ne… pas ». Nier « plus de 3 » par « moins de 3 » en oubliant le cas 3. Nier « nous sommes deux fripons » par « nous sommes deux chevaliers ». S'arrêter au premier cas qui marche sans vérifier les autres.</p></div>
<div class="box retenir"><p class="box-t">À retenir</p><p>Une phrase « si P, alors Q » a le même sens que sa contraposée, jamais que sa réciproque. Un chevalier dit vrai, un fripon dit faux : chaque cas se teste. La bonne réponse est le seul cas sans contradiction.</p></div>`,
  gen(level, R){
    const n = niv(level), L = PAR_NIVEAU[n];
    for (let essai = 0; essai < 40; essai++){
      try {
        const ex = R.pick(L)(R);
        if (valide(ex)) return ex;
      } catch (e){ /* on retente un autre tirage */ }
    }
    return SECOURS();
  }
});

})();
