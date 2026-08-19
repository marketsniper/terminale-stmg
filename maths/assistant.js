/* ===== Le Prof — assistant maths intégré =====
   Deux moteurs :
   1) local  : moteur de maths + recherche dans le cours (gratuit, hors-ligne, toujours actif)
   2) claude : vraie IA conversationnelle + recherche web (clé API de l'utilisateur, localStorage)
   La clé n'est JAMAIS envoyée ailleurs qu'à api.anthropic.com et n'est jamais écrite dans le code.
*/
(function(){
'use strict';

const K_CLAUDE = 'mzs-cle-api';    // clé Anthropic (payant, qualité maximale)
const K_GROQ   = 'mzs-cle-groq';   // clé Groq (gratuit)
const K_PREF   = 'mzs-ia-pref';    // 'groq' | 'claude' | 'local'
const K_WEB    = 'mzs-web';
const MODEL_CLAUDE = 'claude-opus-5';
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';   // solide en maths, 1 000 requêtes/jour en gratuit
const GROQ_WEB   = 'groq/compound';         // même API + recherche web intégrée

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const strip = h => String(h).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

function lire(k){ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } }
function ecrire(k, v){ try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch(e){} }
const cleGroq   = () => lire(K_GROQ);
const cleClaude = () => lire(K_CLAUDE);
function webOn(){ return lire(K_WEB) === '1'; }
function setWeb(v){ ecrire(K_WEB, v ? '1' : '0'); }

/* Quel moteur d'IA ? La préférence de l'élève, sinon la clé disponible.
   Groq d'abord : il est gratuit. */
function fournisseur(){
  const p = lire(K_PREF);
  if (p === 'local') return null;
  if (p === 'groq' && cleGroq()) return 'groq';
  if (p === 'claude' && cleClaude()) return 'claude';
  if (cleGroq()) return 'groq';
  if (cleClaude()) return 'claude';
  return null;
}
const enLigne = () => navigator.onLine !== false;
function iaDispo(){ return !!fournisseur() && enLigne(); }
const nomFournisseur = f => f === 'groq' ? 'Groq' : f === 'claude' ? 'Claude' : 'local';

/* ============================================================
   1. MOTEUR LOCAL — calcul, résolution, recherche dans le cours
   ============================================================ */

/* --- évaluateur d'expressions (descente récursive, aucun eval) --- */
function tokenize(src){
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–—]/g, '-')
               .replace(/,(\d)/g, '.$1').replace(/\s+/g, '');
  const out = []; let i = 0;
  while (i < s.length){
    const c = s[i];
    if (/[0-9.]/.test(c)){ let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; out.push({t:'n', v:parseFloat(s.slice(i, j))}); i = j; continue; }
    if (/[a-zA-Z]/.test(c)){ let j = i; while (j < s.length && /[a-zA-Z]/.test(s[j])) j++; out.push({t:'id', v:s.slice(i, j)}); i = j; continue; }
    if ('+-*/^()%'.includes(c)){ out.push({t:c}); i++; continue; }
    return null;
  }
  return out;
}
function evalExpr(src){
  const tk = tokenize(src); if (!tk || !tk.length) return null;
  let p = 0;
  const peek = () => tk[p], eat = t => (tk[p] && tk[p].t === t ? (p++, true) : false);
  function primary(){
    if (eat('-')){ const v = primary(); return v === null ? null : -v; }
    if (eat('+')) return primary();
    if (eat('(')){ const v = sum(); if (!eat(')')) return null; return v; }
    const t = peek();
    if (t && t.t === 'n'){ p++; return t.v; }
    if (t && t.t === 'id'){
      const nom = t.v.toLowerCase(); p++;
      if (nom === 'pi') return Math.PI;
      if (eat('(')){ const a = sum(); if (!eat(')')) return null;
        if (a === null) return null;
        if (nom === 'racine' || nom === 'sqrt') return Math.sqrt(a);
        if (nom === 'abs') return Math.abs(a);
        return null; }
      return null;
    }
    return null;
  }
  function power(){ const a = primary(); if (a === null) return null; if (eat('^')){ const b = power(); return b === null ? null : Math.pow(a, b); } return a; }
  function postfix(){ let a = power(); if (a === null) return null; while (eat('%')) a = a / 100; return a; }
  function prod(){ let a = postfix(); if (a === null) return null;
    while (peek() && (peek().t === '*' || peek().t === '/')){ const op = peek().t; p++; const b = postfix(); if (b === null) return null; a = op === '*' ? a * b : (b === 0 ? null : a / b); if (a === null) return null; } return a; }
  function sum(){ let a = prod(); if (a === null) return null;
    while (peek() && (peek().t === '+' || peek().t === '-')){ const op = peek().t; p++; const b = prod(); if (b === null) return null; a = op === '+' ? a + b : a - b; } return a; }
  const v = sum();
  return (p === tk.length && v !== null && isFinite(v)) ? v : null;
}
const fmt = v => {
  const r = Math.round(v * 1e10) / 1e10;
  return String(r).replace('.', ',');
};

/* --- résolution d'équations du 1er degré : renvoie {a,b} pour a·x + b --- */
function linear(src){
  const tk = tokenize(src); if (!tk) return null;
  let p = 0;
  const peek = () => tk[p], eat = t => (tk[p] && tk[p].t === t ? (p++, true) : false);
  const A = (a, b) => ({a: a.a + b.a, b: a.b + b.b});
  const S = (a, b) => ({a: a.a - b.a, b: a.b - b.b});
  const M = (a, b) => { if (a.a && b.a) return null; return a.a ? {a: a.a * b.b, b: a.b * b.b} : {a: b.a * a.b, b: a.b * b.b}; };
  const D = (a, b) => { if (b.a || b.b === 0) return null; return {a: a.a / b.b, b: a.b / b.b}; };
  function primary(){
    if (eat('-')){ const v = primary(); return v && {a: -v.a, b: -v.b}; }
    if (eat('+')) return primary();
    if (eat('(')){ const v = sum(); if (!eat(')')) return null; return v; }
    const t = peek();
    if (t && t.t === 'n'){ p++; if (peek() && peek().t === 'id' && peek().v.length === 1){ const n = t.v; p++; return {a: n, b: 0}; } return {a: 0, b: t.v}; }
    if (t && t.t === 'id' && t.v.length === 1){ p++; return {a: 1, b: 0}; }
    return null;
  }
  function prod(){ let a = primary(); if (!a) return null;
    while (peek() && (peek().t === '*' || peek().t === '/')){ const op = peek().t; p++; const b = primary(); if (!b) return null; a = op === '*' ? M(a, b) : D(a, b); if (!a) return null; } return a; }
  function sum(){ let a = prod(); if (!a) return null;
    while (peek() && (peek().t === '+' || peek().t === '-')){ const op = peek().t; p++; const b = prod(); if (!b) return null; a = op === '+' ? A(a, b) : S(a, b); } return a; }
  const v = sum();
  return p === tk.length ? v : null;
}
function solveEq(src){
  const parts = src.split('=');
  if (parts.length !== 2) return null;
  const g = linear(parts[0]), d = linear(parts[1]);
  if (!g || !d) return null;
  const a = g.a - d.a, b = d.b - g.b;
  if (Math.abs(a) < 1e-12) return {type: Math.abs(b) < 1e-12 ? 'infini' : 'aucune'};
  return {type: 'ok', x: b / a, a, b, g, d};
}

/* --- pgcd / simplification de fraction --- */
function pgcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a; }

/* --- index de recherche sur les leçons + techniques --- */
let INDEX = null;
function buildIndex(){
  if (INDEX) return INDEX;
  INDEX = [];
  (window.SKILLS || []).forEach(s => INDEX.push({
    type: 'fiche', id: s.id, titre: s.titre,
    sous: 'Phase ' + s.phase + ' · compétence ' + s.phase + '.' + s.ordre,
    texte: [s.titre, s.objectif || '', strip(s.lecon || '')].join(' ')
  }));
  (window.CM_FAMS || []).forEach(f => INDEX.push({
    type: 'technique', id: f.id, titre: f.nom, icone: f.icone,
    sous: 'Technique · ' + f.cat,
    texte: [f.nom, f.astuce, strip(f.methode || '')].join(' ')
  }));
  INDEX.forEach(e => e.n = norm(e.texte));
  return INDEX;
}
const STOP = new Set(['les','des','une','uns','pour','avec','dans','que','qui','quoi','est','sont','comment','pourquoi','faire','fait','sur','par','pas','plus','mais','tout','tous','cest','celui','cela','quand','donc','explique','moi','mon','ton','son','peux','veux','sais','comprends','comprend','aide','stp']);
function terms(q){
  return norm(q).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
    .filter(w => (w.length > 2 || /^\d+$/.test(w)) && !STOP.has(w));
}
// « 11 » ne doit pas compter dans « 118 » : mot entier pour les nombres,
// début de mot pour les mots (pour attraper fraction/fractions, multiplier/multiplication)
function motRe(w){
  const e = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(/^\d+$/.test(w) ? '\\b' + e + '\\b' : '\\b' + e, 'g');
}
function search(q, n){
  const ws = terms(q); if (!ws.length) return [];
  const nq = norm(q);
  const res = ws.map(motRe);
  return buildIndex().map(e => {
    const t = norm(e.titre);
    let sc = 0, dansTitre = 0;
    ws.forEach((w, i) => {
      res[i].lastIndex = 0;
      if (motRe(w).test(t)){ sc += 12; dansTitre++; }
      sc += Math.min((e.n.match(motRe(w)) || []).length, 6) * 2;
    });
    if (dansTitre === ws.length && ws.length > 1) sc += 30;   // tous les mots dans le titre
    if (nq.includes(t) || t.split(' ').every(m => m.length < 3 || nq.includes(m))) sc += 15;
    return {e, sc};
  }).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, n || 3).map(x => x.e);
}
function extrait(entry, q){
  const ws = terms(q), t = entry.texte, nt = entry.n;
  let best = -1;
  for (const w of ws){ const i = nt.indexOf(w); if (i >= 0 && (best < 0 || i < best)) best = i; }
  if (best < 0) best = 0;
  const start = Math.max(0, t.lastIndexOf('.', best) + 1);
  return t.slice(start, start + 320).trim() + (t.length > start + 320 ? '…' : '');
}

/* --- moteur local : renvoie {html, sur} — sur = réponse exacte et certaine --- */
function localAnswer(q, ctx){ const r = localCalc(q, ctx); return r ? r.html : localCours(q, ctx); }
function localCalc(q, ctx){
  const nq = norm(q);
  // on retire les verbes de commande pour ne garder que l'expression mathématique
  const q2 = q.replace(/^\s*(peux[- ]tu\s+|est[- ]ce que\s+|stp\s+|s'il te pla[iî]t\s+)*/i, '')
              .replace(/\b(calcule[rz]?|combien\s+(font|fait|vaut)|r[ée]sou[sdt]?[a-z]*|simplifie[rz]?|donne|trouve|quel\s+est|le\s+r[ée]sultat\s+de|d[ée]veloppe)\b\s*:?\s*/gi, '')
              .replace(/[?!.]+\s*$/, '').trim();
  const veutCalcul = /\b(calcule|combien|r[ée]sultat|vaut|font|fait)\b/i.test(q);

  // 1) simplification de fraction (avant le calcul, sinon 36/48 devient 0,75)
  const frm = (/simplifi/i.test(q) ? q2 : '').match(/([0-9]+)\s*\/\s*([0-9]+)/);
  if (frm){
    const a = +frm[1], b = +frm[2], g = pgcd(a, b);
    return {html: g <= 1
      ? `<p>La fraction <strong>${a}/${b}</strong> est déjà irréductible : leur seul diviseur commun est 1.</p>`
      : `<p>Je divise le haut et le bas par leur plus grand diviseur commun, <strong>${g}</strong> :</p>
         <div class="etapes"><p>${a} ÷ ${g} = ${a / g} et ${b} ÷ ${g} = ${b / g}</p><p>→ <mark>${a / g}/${b / g}</mark> (soit ${fmt(a / b)})</p></div>`};
  }

  // 2) équation
  const eqm = q2.match(/([0-9a-z+\-*/^(). ,×÷−]*[a-z][0-9a-z+\-*/^(). ,×÷−]*=[0-9a-z+\-*/^(). ,×÷−]+)/i);
  if (eqm){
    const r = solveEq(eqm[1]);
    if (r){
      if (r.type === 'ok'){
        const x = r.x;
        return {html: `<p>Je résous <strong>${esc(eqm[1].trim())}</strong> :</p>
        <div class="etapes">
        <p>1. Je regroupe les termes en x d'un côté et les nombres de l'autre.</p>
        <p>2. J'obtiens <strong>${fmt(r.a)} x = ${fmt(r.b)}</strong>.</p>
        <p>3. Je divise les deux côtés par ${fmt(r.a)} : <mark>x = ${fmt(x)}</mark></p>
        </div>
        <p class="small muted">Vérifie toujours en remplaçant x par ${fmt(x)} dans l'équation de départ.</p>`};
      }
      if (r.type === 'infini') return {html: `<p>Cette équation est vraie pour <strong>toutes</strong> les valeurs de x : les deux côtés sont identiques.</p>`};
      return {html: `<p>Cette équation n'a <strong>aucune solution</strong> : les x s'annulent et il reste une égalité fausse.</p>`};
    }
  }

  // 3) pourcentage « p % de n »
  const pctm = q2.match(/([0-9][0-9\s,.]*)\s*%\s*de\s*([0-9][0-9\s,.]*)/i);
  if (pctm){
    const p = parseFloat(pctm[1].replace(/\s/g, '').replace(',', '.')), b = parseFloat(pctm[2].replace(/\s/g, '').replace(',', '.'));
    if (isFinite(p) && isFinite(b))
      return {html: `<p><strong>${fmt(p * b / 100)}</strong></p><div class="etapes"><p>10 % de ${fmt(b)} = ${fmt(b / 10)}, donc ${fmt(p)} % = ${fmt(p / 10)} × ${fmt(b / 10)} = <mark>${fmt(p * b / 100)}</mark>.</p></div>`};
  }

  // 4) calcul d'une expression — il faut un opérateur, ou un verbe de calcul explicite
  const calcm = q2.match(/^\(*\s*[0-9][0-9\s+\-*/^%().,×÷−]*[0-9%)]$/) ? [null, q2]
              : q2.match(/([0-9(][0-9\s+\-*/^%().,×÷−]*[0-9%)])\s*$/);
  if (calcm && (/[+\-*/^×÷−]/.test(calcm[1]) || veutCalcul)){
    const v = evalExpr(calcm[1]);
    if (v !== null) return {html: `<p><strong>${esc(calcm[1].trim())} = ${fmt(v)}</strong></p>`};
  }
  return null;   // rien de certain : c'est à l'IA (ou au cours) de répondre
}

/* --- réponses issues du cours : exercice en cours, puis recherche --- */
function localCours(q, ctx){
  const nq = norm(q);
  const veutExpl = /expliqu|pourquoi|comprend|compris|aide|bloqu|coince|indice|comment.*(fai|résou|trouv)/.test(nq);
  if (veutExpl && ctx && ctx.ex){
    const sk = ctx.skill, fam = ctx.fam;
    let h = `<p class="k">L'exercice en cours</p><p><strong>${esc(ctx.ex.q)}</strong></p>`;
    if (fam && fam.astuce) h += `<p class="hint-line">💡 ${esc(fam.astuce)}</p>`;
    if (ctx.repondu){
      if (ctx.ex.expl) h += `<div class="etapes"><p>${esc(ctx.ex.expl)}</p></div>`;
      else if (ctx.ex.a) h += `<div class="etapes"><p>La réponse attendue est <mark>${esc(ctx.ex.a)}</mark>.</p></div>`;
    } else {
      // pas encore répondu : méthode et indice, jamais la réponse
      const meth = fam ? strip(fam.methode).split(/(?<=\.)\s/).slice(0, 3).join(' ')
                 : sk ? strip(sk.lecon).split(/(?<=\.)\s/).slice(0, 3).join(' ') : '';
      if (meth) h += `<div class="etapes"><p>${esc(meth)}</p></div>`;
      h += `<p class="small muted">Je ne te donne pas la réponse tant que tu n'as pas essayé — c'est comme ça qu'on apprend. Applique la méthode ci-dessus, puis reviens si ça bloque.</p>`;
    }
    if (sk) h += `<p class="small muted">Cet exercice porte sur « ${esc(sk.titre)} » — <a href="#" data-goto-skill="${esc(sk.id)}">relire la leçon</a>.</p>`;
    if (fam) h += `<p class="small muted">Technique : « ${esc(fam.nom)} » — <a href="#" data-goto-tech="${esc(fam.id)}">voir la méthode</a>.</p>`;
    return h;
  }

  // 5) recherche dans le cours
  const res = search(q, 3);
  if (res.length){
    return `<p>Voici ce que ton cours dit là-dessus :</p>` + res.map(e => `
      <div class="assist-hit">
        <p class="assist-hit-t">${e.icone ? e.icone + ' ' : ''}<strong>${esc(e.titre)}</strong> <span class="small muted">${esc(e.sous)}</span></p>
        <p class="small">${esc(extrait(e, q))}</p>
        <p><a href="#" data-goto-${e.type === 'fiche' ? 'skill' : 'tech'}="${esc(e.id)}">Ouvrir</a></p>
      </div>`).join('') +
      `<p class="small muted">Pour une explication sur mesure, active le <strong>mode Claude</strong> (bouton ⚙︎ en haut du panneau).</p>`;
  }

  return `<p>Je n'ai pas trouvé ça dans ton cours. Je sais faire, en mode local :</p>
  <ul>
    <li>calculer une expression — <em>« calcule 47 × 12 + 8 »</em></li>
    <li>résoudre une équation — <em>« résous 3x + 5 = 20 »</em></li>
    <li>un pourcentage — <em>« 15 % de 240 »</em></li>
    <li>simplifier une fraction — <em>« simplifie 36/48 »</em></li>
    <li>expliquer l'exercice affiché — <em>« explique »</em></li>
    <li>chercher une notion dans tes 52 leçons et 25 techniques</li>
  </ul>
  <p class="small muted">Pour discuter vraiment (« pourquoi ça marche ? », « donne-moi un autre exemple »), active le <strong>mode Claude</strong> avec ⚙︎.</p>`;
}

/* ============================================================
   2. MOTEUR CLAUDE — API Anthropic depuis le navigateur
   ============================================================ */
const SYSTEME = `Tu es « le Prof », le tuteur de mathématiques intégré à l'application « Maths · De zéro au sommet ».

QUI EST L'ÉLÈVE
Un lycéen français en terminale STMG (bac 2027, spécialité Gestion et finance). Il a repris les mathématiques depuis le niveau sixième et progresse par étapes : fondations 6e-5e, collège, seconde, première STMG, terminale, puis les concours SESAME et ACCÈS (avril 2027). Il peut donc être débutant sur une notion et à l'aise sur une autre — ne présuppose jamais un prérequis, vérifie-le ou explique-le.

TON RÔLE
- Tu ne réponds QU'À des questions de mathématiques (y compris les maths appliquées à la gestion : pourcentages, indices, suites, coûts) ou au fonctionnement de l'application. Pour toute autre demande, dis en une phrase que tu es le prof de maths et propose de revenir aux maths.
- Tu tutoies. Tu es chaleureux, direct, jamais condescendant.
- Tu expliques en français, avec des nombres écrits à la française (virgule décimale, espace pour les milliers). Jamais de LaTeX ni de symboles $ : écris les fractions a/b, les puissances avec ^, et utilise × ÷ −.

MÉTHODE PÉDAGOGIQUE
- Réponses COURTES : 3 à 8 lignes en général. Une idée par phrase. Pas d'introduction ni de conclusion de politesse.
- Toujours un exemple chiffré concret quand tu expliques une règle.
- Quand tu détailles un calcul, va étape par étape, en montrant les nombres.
- Si une technique de calcul mental de l'application s'applique, cite-la par son nom.
- Termine par une question courte ou un mini-exercice quand c'est utile pour vérifier qu'il a compris.

RÈGLE ABSOLUE PENDANT UN EXERCICE
Si le contexte indique qu'un exercice est en cours et que l'élève n'a pas encore répondu, tu ne donnes JAMAIS la réponse finale. Tu donnes un indice, tu rappelles la méthode, ou tu poses une question qui le débloque. S'il insiste une deuxième fois, tu détailles la méthode sur un exemple DIFFÉRENT avec d'autres nombres. Tu ne donnes la solution complète que s'il a déjà répondu (le contexte le précise) ou s'il ne s'agit pas d'un exercice en cours.

Si tu ne sais pas ou si tu n'es pas certain d'un calcul, dis-le et propose de le refaire ensemble étape par étape. Ne fabrique jamais un résultat.`;

function contexteRag(q, ctx){
  const bouts = [];
  if (ctx && ctx.ex){
    bouts.push('EXERCICE EN COURS\nÉnoncé : ' + ctx.ex.q +
      (ctx.skill ? '\nCompétence : ' + ctx.skill.titre : '') +
      (ctx.fam ? '\nTechnique : ' + ctx.fam.nom + ' — ' + ctx.fam.astuce : '') +
      (ctx.repondu ? '\nL\'élève a DÉJÀ répondu (' + (ctx.juste ? 'juste' : 'faux, il avait mis « ' + ctx.donnee + ' »') + '), la réponse attendue était : ' + ctx.ex.a + '. Tu peux donc tout expliquer.'
                   : '\nL\'élève N\'A PAS ENCORE RÉPONDU : donne un indice ou la méthode, jamais la réponse.'));
  } else if (ctx && ctx.skill){
    bouts.push('L\'élève est sur la leçon : ' + ctx.skill.titre);
  }
  const hits = search(q, 2);
  if (hits.length) bouts.push('EXTRAITS DU COURS DE L\'ÉLÈVE (utilise le même vocabulaire)\n' +
    hits.map(h => '— ' + h.titre + ' (' + h.sous + ') : ' + h.texte.slice(0, 700)).join('\n'));
  const st = window.S;
  if (st && st.skills){
    const done = Object.values(st.skills).filter(x => x.mastered).length;
    bouts.push('PROGRESSION : ' + done + ' compétences maîtrisées sur ' + (window.SKILLS || []).length + '.');
  }
  return bouts.join('\n\n') || 'Pas de contexte particulier.';
}

/* --- Groq : gratuit, API compatible OpenAI, streaming SSE ---
   Le modèle « compound » (recherche web) ne renvoie pas toujours de texte :
   on ne l'utilise que si la question a vraiment besoin du web, et on retombe
   automatiquement sur le modèle standard si le flux revient vide. */
const BESOIN_WEB = /\b(cherche|recherche|internet|web|actualit|r[ée]cent|aujourd|202[6-9]|date du|source|site|lien|programme officiel|sesame|acc[eè]s|concours)\b/i;

/* Certains modèles de raisonnement encadrent leur réflexion dans <think>…</think>.
   On la retire — y compris pendant le streaming, où la balise n'est pas encore fermée. */
function nettoie(t){
  let s = t.replace(/<think>[\s\S]*?<\/think>/gi, '');
  const i = s.toLowerCase().lastIndexOf('<think>');
  if (i >= 0) s = s.slice(0, i);
  return s.replace(/<\/?think>/gi, '').trim();
}

async function askGroq(q, ctx, hist, onDelta, onInfo){
  const cle = cleGroq();
  if (!cle) throw new Error('PAS_DE_CLE');
  const messages = [{role: 'system', content: SYSTEME + '\n\nCONTEXTE ACTUEL\n\n' + contexteRag(q, ctx)}]
    .concat(hist, [{role: 'user', content: q}]);
  const veutWeb = webOn() && BESOIN_WEB.test(q);

  async function appel(modele, extras){
    const r = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + cle},
      body: JSON.stringify(Object.assign({model: modele, messages, stream: true, max_completion_tokens: 4000}, extras))
    });
    if (!r.ok){
      let msg = ''; try { const j = await r.json(); msg = (j.error && j.error.message) || ''; } catch(e){}
      const err = new Error(r.status === 401 ? 'CLE_INVALIDE' : r.status === 429 ? 'QUOTA'
                  : 'HTTP ' + r.status + (msg ? ' — ' + msg : ''));
      err.statut = r.status; err.detail = msg; throw err;
    }
    const reader = r.body.getReader(), dec = new TextDecoder();
    let buf = '', texte = '', raison = '', fin = '', outil = false;
    for (;;){
      const {done, value} = await reader.read(); if (done) break;
      buf += dec.decode(value, {stream: true});
      const lignes = buf.split('\n'); buf = lignes.pop();
      for (const l of lignes){
        if (!l.startsWith('data:')) continue;
        const d = l.slice(5).trim(); if (!d || d === '[DONE]') continue;
        let ev; try { ev = JSON.parse(d); } catch(e){ continue; }
        const ch = ev.choices && ev.choices[0]; if (!ch) continue;
        const dl = ch.delta || {};
        if (dl.content){ const t = dl.content; texte += t; onDelta(t); }
        else if (dl.reasoning) raison += dl.reasoning;       // filet de sécurité
        if (ch.finish_reason) fin = ch.finish_reason;
        if (!outil && ((dl.executed_tools && dl.executed_tools.length) || (ch.executed_tools && ch.executed_tools.length))){
          outil = true; onInfo && onInfo('🔎 recherche sur le web…');
        }
      }
    }
    return {texte: nettoie(texte), raison: nettoie(raison), fin};
  }

  // 1er essai : modèle standard (ou compound si la question appelle vraiment le web)
  let res;
  try { res = await appel(veutWeb ? GROQ_WEB : GROQ_MODEL, veutWeb ? {} : {reasoning_effort: 'low'}); }
  catch(e){ if (e.statut === 400) res = await appel(GROQ_MODEL, {}); else throw e; }

  // 2e essai : le flux est revenu sans texte → on repasse sur le modèle standard
  if (!res.texte && veutWeb){
    onInfo && onInfo('nouvelle tentative…');
    res = await appel(GROQ_MODEL, {reasoning_effort: 'low'});   // appel() diffuse déjà le texte
  }
  if (!res.texte && res.raison){ onDelta(res.raison); return res.raison; }
  if (!res.texte){
    const e = new Error('VIDE'); e.detail = res.fin || 'aucun texte reçu'; throw e;
  }
  return res.texte;
}

async function askClaude(q, ctx, hist, onDelta, onInfo){
  const cle = cleClaude();
  if (!cle) throw new Error('PAS_DE_CLE');
  const body = {
    model: MODEL_CLAUDE,
    max_tokens: 16000,
    stream: true,
    output_config: {effort: 'medium'},
    system: [
      {type: 'text', text: SYSTEME, cache_control: {type: 'ephemeral'}},
      {type: 'text', text: 'CONTEXTE ACTUEL\n\n' + contexteRag(q, ctx)}
    ],
    messages: hist.concat([{role: 'user', content: q}])
  };
  if (webOn()) body.tools = [{type: 'web_search_20260209', name: 'web_search', max_uses: 3}];

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': cle,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });

  if (!r.ok){
    let msg = '';
    try { const j = await r.json(); msg = (j.error && j.error.message) || ''; } catch(e){}
    if (r.status === 401) throw new Error('CLE_INVALIDE');
    if (r.status === 429) throw new Error('TROP_DE_REQUETES');
    if (r.status === 400 && /credit|balance/i.test(msg)) throw new Error('CREDIT');
    throw new Error('HTTP ' + r.status + (msg ? ' — ' + msg : ''));
  }

  const reader = r.body.getReader(), dec = new TextDecoder();
  let buf = '', stop = null, texte = '';
  for (;;){
    const {done, value} = await reader.read();
    if (done) break;
    buf += dec.decode(value, {stream: true});
    const lignes = buf.split('\n'); buf = lignes.pop();
    for (const l of lignes){
      if (!l.startsWith('data:')) continue;
      const d = l.slice(5).trim(); if (!d) continue;
      let ev; try { ev = JSON.parse(d); } catch(e){ continue; }
      if (ev.type === 'content_block_start' && ev.content_block && ev.content_block.type === 'server_tool_use') onInfo && onInfo('🔎 recherche sur le web…');
      if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta'){ texte += ev.delta.text; onDelta(ev.delta.text); }
      if (ev.type === 'message_delta' && ev.delta && ev.delta.stop_reason) stop = ev.delta.stop_reason;
      if (ev.type === 'error') throw new Error((ev.error && ev.error.message) || 'erreur de flux');
    }
  }
  if (stop === 'refusal') throw new Error('REFUS');
  return texte;
}

/* --- rendu léger du markdown renvoyé par Claude --- */
function md(t){
  let h = esc(t);
  h = h.replace(/```([\s\S]*?)```/g, (m, c) => '<pre class="assist-pre">' + c.trim() + '</pre>');
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|\n)[-•]\s+(.+)/g, '$1<li>$2</li>');
  h = h.replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>');
  return h.split(/\n{2,}/).map(p => /^<(ul|pre)/.test(p.trim()) ? p : '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
}

/* ============================================================
   3. INTERFACE — bouton flottant + panneau
   ============================================================ */
let hist = [], ouvert = false, occupe = false;

function ctxCourant(){
  const c = window.ASSIST_CTX || null;
  if (!c) return null;
  return {
    ex: c.ex || null,
    skill: c.skillId ? (window.SKILLS || []).find(s => s.id === c.skillId) : null,
    fam: c.famId ? (window.CM_FAMS || []).find(f => f.id === c.famId) : null,
    repondu: !!c.repondu, juste: !!c.juste, donnee: c.donnee || ''
  };
}

function ui(){
  if (document.getElementById('assist-panel')) return;
  const btn = document.createElement('button');
  btn.id = 'assist-fab'; btn.type = 'button';
  btn.setAttribute('aria-label', 'Ouvrir le prof');
  btn.innerHTML = '🎓';
  document.body.appendChild(btn);

  const p = document.createElement('div');
  p.id = 'assist-panel'; p.className = 'hidden';
  p.innerHTML = `
   <div class="assist-head">
     <span class="assist-t">🎓 Le Prof</span>
     <span class="assist-mode" id="assist-mode"></span>
     <button class="assist-icon" id="assist-cfg" type="button" title="Réglages" aria-label="Réglages">⚙︎</button>
     <button class="assist-icon" id="assist-close" type="button" title="Fermer" aria-label="Fermer">✕</button>
   </div>
   <div class="assist-body" id="assist-body"></div>
   <div class="assist-foot">
     <div class="assist-chips" id="assist-chips"></div>
     <div class="assist-row">
       <textarea id="assist-in" rows="1" placeholder="Pose ta question…" aria-label="Ta question"></textarea>
       <button class="primary" id="assist-send" type="button">→</button>
     </div>
   </div>`;
  document.body.appendChild(p);

  const body = p.querySelector('#assist-body'), input = p.querySelector('#assist-in');

  function say(who, html, cls){
    const d = document.createElement('div');
    d.className = 'assist-msg ' + who + (cls ? ' ' + cls : '');
    d.innerHTML = html;
    body.appendChild(d); body.scrollTop = body.scrollHeight;
    return d;
  }
  function majMode(){
    const m = p.querySelector('#assist-mode'), f = fournisseur();
    if (!f){ m.textContent = 'local'; m.className = 'assist-mode'; return; }
    if (!enLigne()){ m.textContent = 'local · hors-ligne'; m.className = 'assist-mode'; return; }
    m.textContent = nomFournisseur(f) + (webOn() && f === 'groq' ? ' + web' : '');
    m.title = webOn() && f === 'groq' ? 'La recherche web ne se déclenche que sur les questions qui en ont besoin' : '';
    m.className = 'assist-mode on';
  }
  function chips(){
    const c = p.querySelector('#assist-chips'), ctx = ctxCourant();
    const list = ctx && ctx.ex
      ? ['Explique cet exercice', 'Donne-moi un indice', 'Un exemple plus simple']
      : ['C\'est quoi une fraction ?', 'Explique les pourcentages', 'Comment poser une division ?'];
    c.innerHTML = list.map(t => `<button class="assist-chip" type="button">${esc(t)}</button>`).join('');
    c.querySelectorAll('.assist-chip').forEach(b => b.addEventListener('click', () => { input.value = b.textContent; envoyer(); }));
  }

  function bienvenue(){
    body.innerHTML = '';
    const f = fournisseur();
    say('bot', `<p>Salut 👋 Je suis ton prof de maths. Pose-moi n'importe quelle question — sur l'exercice affiché, sur une notion, ou un calcul à vérifier.</p>` +
      (f ? `<p class="small muted">Je bascule tout seul : calculs exacts et hors-ligne → moteur <strong>local</strong> ; questions de fond → <strong>${nomFournisseur(f)}</strong>.</p>`
         : `<p class="small muted">Mode <strong>local</strong> : gratuit et hors-ligne (calculs, résolutions, recherche dans tes 52 leçons). Pour les questions de fond, ajoute une clé gratuite avec ⚙︎.</p>`));
    chips();
  }

  function reglages(){
    const pref = lire(K_PREF) || 'groq';
    say('bot', `
      <p class="k">Réglages de l'IA</p>
      <p class="small">Le moteur <strong>local</strong> marche toujours, gratuitement et hors-ligne. Pour les questions plus poussées, ajoute une clé ci-dessous. Elle est enregistrée <strong>uniquement sur cet appareil</strong>, jamais dans le code du site.</p>
      <div class="assist-cfg">
        <label class="small"><strong>Groq — gratuit</strong> (1 000 questions/jour, sans carte bancaire)</label>
        <input type="password" id="assist-groq" placeholder="gsk_…" value="${esc(cleGroq())}" autocomplete="off" spellcheck="false">
        <label class="small"><strong>Claude — payant</strong> (~2 ct/question, qualité maximale)</label>
        <input type="password" id="assist-claude" placeholder="sk-ant-…" value="${esc(cleClaude())}" autocomplete="off" spellcheck="false">
        <label class="small">À utiliser en priorité :
          <select id="assist-pref">
            <option value="groq" ${pref==='groq'?'selected':''}>Groq (gratuit)</option>
            <option value="claude" ${pref==='claude'?'selected':''}>Claude (payant)</option>
            <option value="local" ${pref==='local'?'selected':''}>Local uniquement</option>
          </select></label>
        <label class="small"><input type="checkbox" id="assist-web" ${webOn() ? 'checked' : ''}> Autoriser la recherche web</label>
        <div class="row">
          <button class="primary small" id="assist-save" type="button">Enregistrer</button>
          <button class="ghost small" id="assist-clear" type="button">Tout effacer</button>
        </div>
      </div>
      <p class="small muted">Clé Groq gratuite : <strong>console.groq.com</strong> → API Keys. Clé Claude : <strong>platform.claude.com/settings/keys</strong>. Les clés partent uniquement vers le fournisseur choisi.</p>`, 'cfg');
    const last = body.lastElementChild;
    last.querySelector('#assist-save').addEventListener('click', () => {
      ecrire(K_GROQ, last.querySelector('#assist-groq').value.trim());
      ecrire(K_CLAUDE, last.querySelector('#assist-claude').value.trim());
      ecrire(K_PREF, last.querySelector('#assist-pref').value);
      setWeb(last.querySelector('#assist-web').checked);
      majMode();
      const f = fournisseur();
      say('bot', f ? `<p>✅ IA activée (<strong>${nomFournisseur(f)}</strong>). Le moteur local reste utilisé pour les calculs exacts et hors-ligne.</p>`
                   : '<p>Mode local uniquement. Calculs, résolutions et recherche dans ton cours restent disponibles.</p>');
    });
    last.querySelector('#assist-clear').addEventListener('click', () => {
      ecrire(K_GROQ, ''); ecrire(K_CLAUDE, ''); ecrire(K_PREF, 'local');
      last.querySelector('#assist-groq').value = ''; last.querySelector('#assist-claude').value = '';
      majMode(); say('bot', '<p>Clés effacées de cet appareil. Retour au mode local.</p>');
    });
  }

  const tag = f => `<span class="assist-src">${f === 'local' ? '📴 hors-ligne' : nomFournisseur(f)}</span>`;

  async function envoyer(){
    if (occupe) return;
    const q = input.value.trim(); if (!q) return;
    input.value = ''; input.style.height = 'auto';
    say('moi', '<p>' + esc(q) + '</p>');
    const ctx = ctxCourant();

    // 1. Calcul exact : le moteur local est instantané, gratuit et sûr — sauf si
    //    l'élève demande une explication, auquel cas l'IA fait mieux.
    const veutComprendre = /expliqu|pourquoi|comment ça marche|d[ée]taill|comprend/i.test(q);
    const exact = localCalc(q, ctx);
    if (exact && !veutComprendre){
      const d = say('bot', exact.html);
      if (iaDispo()) d.insertAdjacentHTML('beforeend',
        '<p><button class="assist-chip" data-approfondir="1">Pourquoi ça marche ?</button></p>');
      chips(); return;
    }

    // 2. Sinon : l'IA si elle est joignable, le cours hors-ligne.
    const f = fournisseur();
    if (!f || !enLigne()){
      const d = say('bot', localCours(q, ctx));
      if (!enLigne() && f) d.insertAdjacentHTML('afterbegin',
        '<p class="small muted">📴 Hors-ligne : je réponds avec ton cours. Reconnecte-toi pour l\'IA.</p>');
      chips(); return;
    }

    occupe = true; majMode();
    const d = say('bot', '<p class="assist-think">réfléchit…</p>');
    let acc = '';
    try {
      const moteur = f === 'groq' ? askGroq : askClaude;
      await moteur(q, ctx, hist.slice(-8),
        t => { acc += t; const v = nettoie(acc); if (v) d.innerHTML = md(v); body.scrollTop = body.scrollHeight; },
        info => { if (!nettoie(acc)) d.innerHTML = '<p class="assist-think">' + esc(info) + '</p>'; });
      acc = nettoie(acc);
      if (!acc){ d.innerHTML = '<p class="assist-err">⚠️ L\'IA n\'a rien renvoyé. Je réponds avec ton cours :</p>'
        + (exact ? exact.html : localCours(q, ctx)) + tag('local'); }
      else d.insertAdjacentHTML('beforeend', tag(f));
      hist.push({role: 'user', content: q}, {role: 'assistant', content: acc});
      if (hist.length > 16) hist = hist.slice(-16);
    } catch(e){
      const m = String(e.message || e);
      const connu = {
        CLE_INVALIDE: 'Ta clé ' + nomFournisseur(f) + ' est refusée. Vérifie-la dans ⚙︎.',
        QUOTA: 'Quota gratuit atteint pour aujourd\'hui (il se remet à zéro chaque jour). Je continue avec ton cours :',
        TROP_DE_REQUETES: 'Trop de questions d\'un coup — attends quelques secondes.',
        CREDIT: 'Ton compte ' + nomFournisseur(f) + ' n\'a plus de crédit. Je continue avec ton cours :',
        REFUS: 'Je ne peux pas répondre à cette demande. Reformule-la côté maths.',
        PAS_DE_CLE: 'Aucune clé enregistrée — ouvre ⚙︎.',
        VIDE: 'L\'IA n\'a rien renvoyé (' + (e.detail || '?') + '). Je réponds avec ton cours :'
      };
      const txt = connu[m] || 'Connexion impossible. Je bascule sur ton cours :';
      d.innerHTML = '<p class="assist-err">⚠️ ' + esc(txt) + '</p>';
      if (!connu[m] || m === 'QUOTA' || m === 'CREDIT' || m === 'VIDE'){
        d.insertAdjacentHTML('beforeend', (exact ? exact.html : localCours(q, ctx)) + tag('local'));
      }
    } finally { occupe = false; majMode(); chips(); }
  }

  btn.addEventListener('click', () => { ouvert = !ouvert; p.classList.toggle('hidden', !ouvert); btn.classList.toggle('on', ouvert);
    if (ouvert){ if (!body.children.length) bienvenue(); else chips(); majMode(); setTimeout(() => input.focus(), 60); } });
  p.querySelector('#assist-close').addEventListener('click', () => { ouvert = false; p.classList.add('hidden'); btn.classList.remove('on'); });
  p.querySelector('#assist-cfg').addEventListener('click', reglages);
  p.querySelector('#assist-send').addEventListener('click', envoyer);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); envoyer(); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 110) + 'px'; });

  body.addEventListener('click', e => {
    const app = e.target.closest('[data-approfondir]');
    if (app){ e.preventDefault(); app.remove();
      const q = [...body.querySelectorAll('.assist-msg.moi')].pop();
      input.value = 'Explique-moi pourquoi : ' + (q ? q.textContent.trim() : '');
      envoyer(); return; }
    const a = e.target.closest('[data-goto-skill],[data-goto-tech]');
    if (!a) return;
    e.preventDefault();
    ouvert = false; p.classList.add('hidden'); btn.classList.remove('on');
    if (a.dataset.gotoSkill && typeof window.ASSIST_GO === 'function') window.ASSIST_GO('skill', a.dataset.gotoSkill);
    if (a.dataset.gotoTech && typeof window.ASSIST_GO === 'function') window.ASSIST_GO('tech', a.dataset.gotoTech);
  });

  majMode();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();
