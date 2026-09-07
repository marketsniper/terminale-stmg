/* ===== Le Prof : assistant de maths intégré (DESIGN-SPEC §6.28, §7.18 · PRODUCT-SPEC S1) =====
   Deux moteurs :
   1) local  : calcul, résolution, recherche dans les 52 leçons et les 25 techniques (gratuit, hors ligne, toujours actif)
   2) en ligne : Groq ou Claude, avec la clé de l'élève, lue dans localStorage et écrite depuis Réglages (M12)
   Aucune clé n'est écrite dans ce fichier. Elle ne part que vers le fournisseur choisi.

   Ce fichier ne déclare AUCUN symbole de premier niveau : tout vit dans une IIFE
   et seules les passerelles window.ASSIST_* sont exposées.
   Exposé : ASSIST_OUVRIR, ASSIST_FERMER, ASSIST_ASK, ASSIST_CHIP, ASSIST_DEBRIEF, ASSIST_CONFIG. */
(function(){
'use strict';

/* ============================================================
   0. Clés de stockage, réglages, petits utilitaires
   ============================================================ */
const K_CLAUDE = 'mzs-cle-api';     // clé Anthropic
const K_GROQ   = 'mzs-cle-groq';    // clé Groq
const K_PREF   = 'mzs-ia-pref';     // 'groq' | 'claude' | 'local'
const K_WEB    = 'mzs-web';         // '1' si la recherche web est autorisée
const K_HIST   = 'mzs-prof';        // historique du fil, hors de S (jamais envoyé au Gist)
const HIST_MAX = 30;                // messages conservés

const MODEL_CLAUDE = 'claude-opus-5';
const CLAUDE_URL   = 'https://api.anthropic.com/v1/messages';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'openai/gpt-oss-120b';   // solide en maths, généreux en gratuit
const GROQ_WEB     = 'groq/compound';         // même API, recherche web intégrée

/* Échappement et icônes : on appelle le socle (core/base.js), avec un repli si le sprite tarde. */
const ech = s => (typeof esc === 'function') ? esc(s)
  : String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icone = (nom, taille) => (typeof ic === 'function')
  ? ic(nom, 'ic-' + (taille || 20))
  : '<svg class="ic ic-' + (taille || 20) + '" aria-hidden="true" focusable="false"><use href="#i-' + nom + '"/></svg>';
const nombre = v => (typeof fv === 'function') ? fv(v) : String(v).replace('.', ',');
/* Minuterie passée au registre de core/ui.js quand il est là. */
const plusTard = (ms, fn) => (typeof after === 'function') ? after(ms, fn) : setTimeout(fn, ms);
const bruit = nom => { try { if (window.snd && typeof snd[nom] === 'function') snd[nom](); } catch(e){} };
const dire = t => { try { if (typeof window.annoncer === 'function') window.annoncer(t); } catch(e){} };

const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const strip = h => String(h).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

function lire(k){ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } }
function ecrire(k, v){ try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch(e){} }

const cleGroq   = () => lire(K_GROQ);
const cleClaude = () => lire(K_CLAUDE);
const webOn     = () => lire(K_WEB) === '1';
const enLigne   = () => navigator.onLine !== false;

/* Quel moteur en ligne ? La préférence de l'élève, sinon la clé disponible. Groq d'abord : il est gratuit. */
function fournisseur(){
  const p = lire(K_PREF);
  if (p === 'local') return null;
  if (p === 'groq' && cleGroq()) return 'groq';
  if (p === 'claude' && cleClaude()) return 'claude';
  if (cleGroq()) return 'groq';
  if (cleClaude()) return 'claude';
  return null;
}
function iaDispo(){ return !!fournisseur() && enLigne(); }
const nomFournisseur = f => f === 'groq' ? 'Groq' : f === 'claude' ? 'Claude' : 'Local';

/* ============================================================
   1. MOTEUR LOCAL : calcul, résolution, recherche dans le cours
   ============================================================ */

/* ---- évaluateur d'expressions par descente récursive, sans eval ---- */
function tokenize(src){
  const s = String(src).replace(/×/g, '*').replace(/÷/g, '/').replace(/[\u2212\u2013\u2014]/g, '-')
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
      if (eat('(')){
        const a = sum(); if (!eat(')')) return null;
        if (a === null) return null;
        if (nom === 'racine' || nom === 'sqrt') return Math.sqrt(a);
        if (nom === 'abs') return Math.abs(a);
        return null;
      }
      return null;
    }
    return null;
  }
  function power(){ const a = primary(); if (a === null) return null; if (eat('^')){ const b = power(); return b === null ? null : Math.pow(a, b); } return a; }
  function postfix(){ let a = power(); if (a === null) return null; while (eat('%')) a = a / 100; return a; }
  function prod(){
    let a = postfix(); if (a === null) return null;
    while (peek() && (peek().t === '*' || peek().t === '/')){
      const op = peek().t; p++; const b = postfix(); if (b === null) return null;
      a = op === '*' ? a * b : (b === 0 ? null : a / b);
      if (a === null) return null;
    }
    return a;
  }
  function sum(){
    let a = prod(); if (a === null) return null;
    while (peek() && (peek().t === '+' || peek().t === '-')){
      const op = peek().t; p++; const b = prod(); if (b === null) return null;
      a = op === '+' ? a + b : a - b;
    }
    return a;
  }
  const v = sum();
  return (p === tk.length && v !== null && isFinite(v)) ? v : null;
}
/* Affichage à la française (virgule, espace fine, vrai signe moins). */
const fmt = v => nombre(Math.round(v * 1e10) / 1e10);

/* ---- équations du premier degré : {a, b} pour a·x + b ---- */
function linear(src){
  const tk = tokenize(src); if (!tk) return null;
  let p = 0;
  const peek = () => tk[p], eat = t => (tk[p] && tk[p].t === t ? (p++, true) : false);
  const ADD = (x, y) => ({a: x.a + y.a, b: x.b + y.b});
  const SUB = (x, y) => ({a: x.a - y.a, b: x.b - y.b});
  const MUL = (x, y) => { if (x.a && y.a) return null; return x.a ? {a: x.a * y.b, b: x.b * y.b} : {a: y.a * x.b, b: x.b * y.b}; };
  const DIV = (x, y) => { if (y.a || y.b === 0) return null; return {a: x.a / y.b, b: x.b / y.b}; };
  function primary(){
    if (eat('-')){ const v = primary(); return v && {a: -v.a, b: -v.b}; }
    if (eat('+')) return primary();
    if (eat('(')){ const v = sum(); if (!eat(')')) return null; return v; }
    const t = peek();
    if (t && t.t === 'n'){ p++; if (peek() && peek().t === 'id' && peek().v.length === 1){ const n = t.v; p++; return {a: n, b: 0}; } return {a: 0, b: t.v}; }
    if (t && t.t === 'id' && t.v.length === 1){ p++; return {a: 1, b: 0}; }
    return null;
  }
  function prod(){
    let a = primary(); if (!a) return null;
    while (peek() && (peek().t === '*' || peek().t === '/')){
      const op = peek().t; p++; const b = primary(); if (!b) return null;
      a = op === '*' ? MUL(a, b) : DIV(a, b); if (!a) return null;
    }
    return a;
  }
  function sum(){
    let a = prod(); if (!a) return null;
    while (peek() && (peek().t === '+' || peek().t === '-')){
      const op = peek().t; p++; const b = prod(); if (!b) return null;
      a = op === '+' ? ADD(a, b) : SUB(a, b);
    }
    return a;
  }
  const v = sum();
  return p === tk.length ? v : null;
}
function solveEq(src){
  const parts = String(src).split('=');
  if (parts.length !== 2) return null;
  const g = linear(parts[0]), d = linear(parts[1]);
  if (!g || !d) return null;
  const a = g.a - d.a, b = d.b - g.b;
  if (Math.abs(a) < 1e-12) return {type: Math.abs(b) < 1e-12 ? 'infini' : 'aucune'};
  return {type: 'ok', x: b / a, a, b};
}
function pgcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a; }

/* ---- index de recherche : 52 leçons + 25 techniques ---- */
let INDEX = null;
function buildIndex(){
  if (INDEX && INDEX.length) return INDEX;
  INDEX = [];
  (window.SKILLS || []).forEach(s => INDEX.push({
    type: 'fiche', id: s.id, titre: s.titre,
    sous: 'Phase ' + s.phase + ' · compétence ' + s.phase + '.' + s.ordre,
    texte: [s.titre, s.objectif || '', strip(s.lecon || '')].join(' ')
  }));
  (window.CM_FAMS || []).forEach(f => INDEX.push({
    type: 'technique', id: f.id, titre: f.nom,
    sous: 'Technique · ' + f.cat,
    texte: [f.nom, f.astuce || '', strip(f.methode || '')].join(' ')
  }));
  INDEX.forEach(e => { e.n = norm(e.texte); });
  return INDEX;
}
const STOP = new Set(['les','des','une','uns','pour','avec','dans','que','qui','quoi','est','sont','comment','pourquoi',
  'faire','fait','sur','par','pas','plus','mais','tout','tous','cest','celui','cela','quand','donc','explique','moi',
  'mon','ton','son','peux','veux','sais','comprends','comprend','aide','stp','ma','mes','reponse','fausse','regle']);
function terms(q){
  return norm(q).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/)
    .filter(w => (w.length > 2 || /^\d+$/.test(w)) && !STOP.has(w));
}
/* « 11 » ne doit pas compter dans « 118 » : mot entier pour les nombres, début de mot pour les mots. */
function motRe(w){
  const e = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(/^\d+$/.test(w) ? '\\b' + e + '\\b' : '\\b' + e, 'g');
}
function search(q, n){
  const ws = terms(q); if (!ws.length) return [];
  const nq = norm(q);
  return buildIndex().map(e => {
    const t = norm(e.titre);
    let sc = 0, dansTitre = 0;
    ws.forEach(w => {
      if (motRe(w).test(t)){ sc += 12; dansTitre++; }
      sc += Math.min((e.n.match(motRe(w)) || []).length, 6) * 2;
    });
    if (dansTitre === ws.length && ws.length > 1) sc += 30;
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

/* ---- calcul exact : renvoie {html} quand la réponse est certaine, sinon null ---- */
function localCalc(q, ctx){
  const q2 = String(q)
    .replace(/^\s*(peux[- ]tu\s+|est[- ]ce que\s+|stp\s+|s'il te pla[iî]t\s+)*/i, '')
    .replace(/\b(calcule[rz]?|combien\s+(font|fait|vaut)|r[ée]sou[sdt]?[a-z]*|simplifie[rz]?|donne|trouve|quel\s+est|le\s+r[ée]sultat\s+de|d[ée]veloppe)\b\s*:?\s*/gi, '')
    .replace(/[?!.]+\s*$/, '').trim();
  const veutCalcul = /\b(calcule|combien|r[ée]sultat|vaut|font|fait)\b/i.test(q);

  /* 1) simplification de fraction, avant le calcul, sinon 36/48 devient 0,75 */
  const frm = (/simplifi/i.test(q) ? q2 : '').match(/([0-9]+)\s*\/\s*([0-9]+)/);
  if (frm){
    const a = +frm[1], b = +frm[2], g = pgcd(a, b);
    return {html: g <= 1
      ? '<p>La fraction <strong>' + a + '/' + b + '</strong> est déjà irréductible : leur seul diviseur commun est 1.</p>'
      : '<p>Je divise le haut et le bas par leur plus grand diviseur commun, <strong>' + g + '</strong> :</p>' +
        '<div class="etapes"><p>' + a + ' ÷ ' + g + ' = ' + (a / g) + ' et ' + b + ' ÷ ' + g + ' = ' + (b / g) + '</p>' +
        '<p><mark>' + (a / g) + '/' + (b / g) + '</mark>, soit ' + fmt(a / b) + '.</p></div>'};
  }

  /* 2) équation du premier degré */
  const eqm = q2.match(/([0-9a-z+\-*/^(). ,×÷−]*[a-z][0-9a-z+\-*/^(). ,×÷−]*=[0-9a-z+\-*/^(). ,×÷−]+)/i);
  if (eqm){
    const r = solveEq(eqm[1]);
    if (r){
      if (r.type === 'ok') return {html:
        '<p>Je résous <strong>' + ech(eqm[1].trim()) + '</strong> :</p>' +
        '<div class="etapes">' +
        '<p>1. Je regroupe les termes en x d\'un côté et les nombres de l\'autre.</p>' +
        '<p>2. J\'obtiens <strong>' + fmt(r.a) + ' x = ' + fmt(r.b) + '</strong>.</p>' +
        '<p>3. Je divise les deux côtés par ' + fmt(r.a) + ' : <mark>x = ' + fmt(r.x) + '</mark></p>' +
        '</div>' +
        '<p class="small muted">Vérifie en remplaçant x par ' + fmt(r.x) + ' dans l\'équation de départ.</p>'};
      if (r.type === 'infini') return {html: '<p>Cette équation est vraie pour <strong>toutes</strong> les valeurs de x : les deux côtés sont identiques.</p>'};
      return {html: '<p>Cette équation n\'a <strong>aucune solution</strong> : les x s\'annulent et il reste une égalité fausse.</p>'};
    }
  }

  /* 3) pourcentage « p % de n » */
  const pctm = q2.match(/([0-9][0-9\s,.]*)\s*%\s*de\s*([0-9][0-9\s,.]*)/i);
  if (pctm){
    const p = parseFloat(pctm[1].replace(/\s/g, '').replace(',', '.'));
    const b = parseFloat(pctm[2].replace(/\s/g, '').replace(',', '.'));
    if (isFinite(p) && isFinite(b)) return {html:
      '<p><strong>' + fmt(p * b / 100) + '</strong></p>' +
      '<div class="etapes"><p>10 % de ' + fmt(b) + ' = ' + fmt(b / 10) + ', donc ' + fmt(p) + ' % = ' +
      fmt(p / 10) + ' × ' + fmt(b / 10) + ' = <mark>' + fmt(p * b / 100) + '</mark>.</p></div>'};
  }

  /* 4) expression numérique : il faut un opérateur, ou un verbe de calcul explicite */
  const calcm = q2.match(/^\(*\s*[0-9][0-9\s+\-*/^%().,×÷−]*[0-9%)]$/) ? [null, q2]
              : q2.match(/([0-9(][0-9\s+\-*/^%().,×÷−]*[0-9%)])\s*$/);
  if (calcm && (/[+\-*/^×÷−]/.test(calcm[1]) || veutCalcul)){
    const v = evalExpr(calcm[1]);
    if (v !== null) return {html: '<p><strong>' + ech(calcm[1].trim()) + ' = ' + fmt(v) + '</strong></p>'};
  }
  return null;
}

/* ---- réponses issues du cours : exercice affiché, puis recherche ---- */
function localCours(q, ctx){
  const nq = norm(q);
  const veutExpl = /expliqu|pourquoi|comprend|compris|aide|bloqu|coince|indice|comment.*(fai|resou|trouv)/.test(nq);
  if (veutExpl && ctx && ctx.ex){
    const sk = ctx.skill, fam = ctx.fam;
    let h = '<p class="k">L\'exercice en cours</p><p><strong>' + ech(ctx.ex.q) + '</strong></p>';
    if (fam && fam.astuce) h += '<p class="hint-line">' + icone('lightbulb', 20) + '<span>' + ech(fam.astuce) + '</span></p>';
    if (ctx.repondu){
      if (ctx.ex.expl) h += '<div class="etapes"><p>' + ech(ctx.ex.expl) + '</p></div>';
      else if (ctx.ex.a) h += '<div class="etapes"><p>La réponse attendue est <mark>' + ech(ctx.ex.a) + '</mark>.</p></div>';
    } else {
      const meth = fam ? strip(fam.methode || '').split(/(?<=\.)\s/).slice(0, 3).join(' ')
                 : sk ? strip(sk.lecon || '').split(/(?<=\.)\s/).slice(0, 3).join(' ') : '';
      if (meth) h += '<div class="etapes"><p>' + ech(meth) + '</p></div>';
      h += '<p class="small muted">Je garde la réponse pour plus tard : c\'est en cherchant que ça rentre. ' +
           'Applique la méthode ci-dessus, puis reviens si ça bloque.</p>';
    }
    if (sk) h += '<p class="small muted">Cet exercice porte sur « ' + ech(sk.titre) + ' » : ' +
                 '<a href="#" data-goto-skill="' + ech(sk.id) + '">relire la leçon</a>.</p>';
    if (fam) h += '<p class="small muted">Technique : « ' + ech(fam.nom) + ' » : ' +
                  '<a href="#" data-goto-tech="' + ech(fam.id) + '">voir la méthode</a>.</p>';
    return h;
  }

  const res = search(q, 3);
  if (res.length){
    return '<p>Voici ce que ton cours dit là-dessus.</p>' + res.map(e =>
      '<div class="assist-hit">' +
        '<p class="assist-hit-t"><strong>' + ech(e.titre) + '</strong> <span class="small muted">' + ech(e.sous) + '</span></p>' +
        '<p class="small">' + ech(extrait(e, q)) + '</p>' +
        '<p><a href="#" data-goto-' + (e.type === 'fiche' ? 'skill' : 'tech') + '="' + ech(e.id) + '">Ouvrir la fiche</a></p>' +
      '</div>').join('') + sansCleHtml();
  }

  return '<p>Je n\'ai pas trouvé ça dans ton cours. Voici ce que je sais faire hors ligne.</p>' +
    '<ul>' +
    '<li>calculer une expression : <em>« calcule 47 × 12 + 8 »</em></li>' +
    '<li>résoudre une équation : <em>« résous 3x + 5 = 20 »</em></li>' +
    '<li>un pourcentage : <em>« 15 % de 240 »</em></li>' +
    '<li>simplifier une fraction : <em>« simplifie 36/48 »</em></li>' +
    '<li>expliquer l\'exercice affiché : <em>« explique »</em></li>' +
    '<li>chercher une notion dans tes 52 leçons et tes 25 techniques</li>' +
    '</ul>' + sansCleHtml();
}
/* Invitation discrète à ajouter une clé, seulement quand il n'y en a pas. */
function sansCleHtml(){
  return fournisseur() ? ''
    : '<p class="small muted">Moteur local · hors ligne. Ajoute une clé dans Réglages pour des explications sur mesure.</p>';
}

/* ============================================================
   2. PÉDAGOGIE LOCALE (PRODUCT-SPEC S1)
   diagnostic d'une réponse fausse, réponses de chips, débrief
   ============================================================ */

/* Valeur numérique tolérante : « 12,5 » comme « 12.5 », « −3 » comme « -3 ». */
function val(x){
  if (x === null || x === undefined) return null;
  const s = String(x).trim().replace(/\s| | /g, '').replace(/−/g, '-').replace(',', '.').replace(/[€%]/g, '');
  if (!/^-?\d*\.?\d+$/.test(s)) return null;
  const v = parseFloat(s);
  return isFinite(v) ? v : null;
}
/* Une fraction « a/b » réduite, ou null. */
function frac(x){
  const m = String(x).trim().replace(/\s/g, '').match(/^(-?\d+)\/(\d+)$/);
  if (!m) return null;
  const a = +m[1], b = +m[2];
  if (!b) return null;
  const g = pgcd(a, b) || 1;
  return {a: a / g, b: b / g, brut: {a, b}};
}

/* « Pourquoi ma réponse est fausse » sans modèle : quatre diagnostics chiffrés. */
function diagnostiqueReponse(donnee, attendue){
  const d = val(donnee), a = val(attendue);
  if (d !== null && a !== null && a !== 0){
    if (Math.abs(d + a) < 1e-9)
      return 'Ton résultat a le bon nombre et le mauvais signe. Détermine le signe à part, puis les nombres : deux gestes séparés.';
    const r = d / a;
    for (const k of [10, 100, 1000, 0.1, 0.01, 0.001]){
      if (Math.abs(r - k) < 1e-9)
        return 'Virgule décalée d\'un rang : tu as trouvé ' + nombre(d) + ' au lieu de ' + nombre(a) + '. Recompte les zéros avant de poser le résultat.';
    }
    if (Math.abs(d - a) < Math.abs(a) * 0.05)
      return 'Tu es à côté de très peu : ' + nombre(d) + ' pour ' + nombre(a) + '. C\'est une étourderie de calcul, pas une erreur de méthode.';
  }
  const fd = frac(donnee), fa = frac(attendue);
  if (fd && fa && fd.a === fa.a && fd.b === fa.b)
    return 'C\'est juste, mais pas simplifié : ' + fd.brut.a + '/' + fd.brut.b + ' vaut bien ' + fa.a + '/' + fa.b + '. Divise le haut et le bas par leur plus grand diviseur commun.';
  if (!donnee) return 'Tu as validé sans réponse. Relis l\'énoncé et pose la première étape, même incomplète.';
  return 'La réponse attendue était ' + ech(String(attendue)) + '. Reprends l\'énoncé phrase par phrase et compare avec ta première étape.';
}

/* Contexte enrichi (S1) : ce que le Prof sait vraiment de l'élève. */
function ctxCourant(){
  const c = window.ASSIST_CTX || null;
  const skills = window.SKILLS || [];
  const base = {
    ex: null, skill: null, fam: null, level: null,
    repondu: false, juste: false, donnee: '', aide: 0,
    etat: null, dernieresErreurs: [], typeDominant: null, rappels: []
  };
  if (c){
    base.ex = c.ex || null;
    base.skill = c.skillId ? skills.find(s => s.id === c.skillId) || null : null;
    base.fam = c.famId ? (window.CM_FAMS || []).find(f => f.id === c.famId) || null : null;
    base.level = c.level || null;
    base.repondu = !!c.repondu; base.juste = !!c.juste;
    base.donnee = c.donnee || ''; base.aide = c.aide || 0;
  }
  try {
    if (base.skill && typeof niveauMaitrise === 'function') base.etat = niveauMaitrise(base.skill.id);
    if (base.skill && window.S && Array.isArray(S.erreurs))
      base.dernieresErreurs = S.erreurs.filter(e => e.sid === base.skill.id).slice(0, 3);
    base.typeDominant = typeDominant();
    if (base.skill && typeof st === 'function') base.rappels = (st(base.skill.id).rev || []).slice(-3);
  } catch(e){}
  return base;
}
/* Type d'erreur le plus fréquent : {id, nom, part, conseil} ou null. */
function typeDominant(){
  try {
    const t = (window.S && S.typErr) || {};
    const paires = Object.entries(t).filter(x => x[1] > 0);
    if (!paires.length) return null;
    const total = paires.reduce((a, x) => a + x[1], 0);
    paires.sort((a, b) => b[1] - a[1]);
    const id = paires[0][0];
    const fiche = (typeof TYPES_ERR !== 'undefined' ? TYPES_ERR : []).find(x => x.id === id) || {};
    return {id: id, nom: fiche.nom || 'non classée', n: paires[0][1],
            part: Math.round(100 * paires[0][1] / total), conseil: fiche.conseil || ''};
  } catch(e){ return null; }
}
/* Première phrase utile d'une leçon ou d'une technique, pour la boîte « À retenir ». */
function regleDe(ctx){
  const src = (ctx.fam && (ctx.fam.astuce || ctx.fam.methode)) || (ctx.skill && ctx.skill.lecon) || '';
  const t = strip(src);
  if (!t) return '';
  return t.split(/(?<=\.)\s/).slice(0, 2).join(' ');
}
/* Explication de l'exercice en phrases numérotées. */
function etapesDe(ex){
  const src = ex && (ex.expl || '');
  const phrases = strip(src).split(/(?<=[.;])\s+/).filter(Boolean);
  if (!phrases.length) return '';
  return '<div class="etapes">' + phrases.slice(0, 5)
    .map((p, i) => '<p>' + (i + 1) + '. ' + ech(p) + '</p>').join('') + '</div>';
}

/* Réponse locale d'une chip, garantie sans appel réseau (S1 : moins de 50 ms). */
function reponseLocale(chip, ctx){
  const c = ctx || ctxCourant();
  if (chip === 'etape'){
    const e = etapesDe(c.ex);
    if (e) return '<p class="k">Étape par étape</p>' + e;
    if (c.ex && c.ex.a && c.repondu)
      return '<p>La réponse attendue était <mark>' + ech(String(c.ex.a)) + '</mark>. ' +
             'Refais le calcul dans l\'autre sens pour voir où ça décroche.</p>';
    return '<p>Cet exercice n\'a pas d\'étape détaillée. Repars de la méthode : ' + ech(regleDe(c) || 'relis la leçon liée.') + '</p>';
  }
  if (chip === 'pourquoi'){
    if (!c.ex) return '<p>Ouvre un exercice et je te dirai ce qui a dérapé dans ta réponse.</p>';
    if (!c.repondu) return '<p>Réponds d\'abord, même de travers : je ne peux comparer que ce que tu as posé.</p>';
    return '<p class="k">Ce qui s\'est passé</p><p>' + diagnostiqueReponse(c.donnee, c.ex.a) + '</p>';
  }
  if (chip === 'regle'){
    const r = regleDe(c);
    if (!r) return '<p>Aucune règle n\'est rattachée à cet exercice. Ouvre la leçon pour la version longue.</p>';
    return '<div class="box"><p class="box-t">À retenir</p><p>' + ech(r) + '</p></div>' +
      (c.skill ? '<p class="small muted"><a href="#" data-goto-skill="' + ech(c.skill.id) + '">Ouvrir la leçon</a></p>' : '');
  }
  if (chip === 'variante')
    return '<p>Redemande une variante depuis la carte de question : le bouton « Une autre variante » relance le même type d\'exercice avec d\'autres nombres.</p>';
  return localCours(String(chip || ''), c);
}
/* Libellé affiché pour chaque chip. */
const LIBELLE_CHIP = {
  etape: 'Explique l\'étape',
  variante: 'Une autre variante',
  pourquoi: 'Pourquoi ma réponse est fausse',
  regle: 'La règle'
};

/* Débrief local (Coach, sans clé) : quatre puces tirées de S. */
function debriefLocal(){
  const p = [];
  const puce = (fn, repli) => { try { const t = fn(); if (t) { p.push(t); return; } } catch(e){} p.push(repli); };

  puce(() => {
    const skills = window.SKILLS || [];
    const verrous = skills.filter(s => st(s.id).mastered);
    const consolidees = verrous.filter(s => niveauMaitrise(s.id).cle === 'consolide');
    const f = frontier();
    return 'Parcours : ' + verrous.length + ' verrouillées, ' + consolidees.length + ' consolidées' +
      (f ? ', frontière : ' + f.titre : '') + '.';
  }, 'Parcours : ta première séance posera les premiers repères.');

  puce(() => {
    const td = typeDominant();
    return td ? 'Erreur dominante : ' + td.nom.toLowerCase() + ' (' + td.part + ' %). ' + td.conseil : '';
  }, 'Erreur dominante : rien de marquant pour l\'instant. Classe tes erreurs après chaque séance.');

  puce(() => {
    /* med() renvoie des millisecondes, cible() des secondes. */
    let lente = null;
    (window.CM_FAMS || []).forEach(fam => {
      try {
        const ms = window.med(fam.id);
        if (ms === null || ms === undefined) return;
        const secs = ms / 1000, cb = window.cible(fam.id);
        if (secs > cb && (!lente || secs - cb > lente.ecart)) lente = {fam: fam, secs: secs, cible: cb, ecart: secs - cb};
      } catch(e){}
    });
    return lente
      ? 'Famille la plus lente : ' + lente.fam.nom + ', ' + nombre(Math.round(lente.secs * 10) / 10) +
        ' s pour une cible de ' + nombre(lente.cible) + ' s.'
      : '';
  }, 'Calcul mental : aucune famille en retard sur sa cible.');

  puce(() => {
    const rev = dueReviews();
    if (rev.length) return 'Action du jour : ' + rev.length + ' rappel' + (rev.length > 1 ? 's' : '') +
      ' à passer, en commençant par ' + rev[0].titre + '.';
    const f = frontier();
    return f ? 'Action du jour : avancer sur ' + f.titre + '.' : '';
  }, 'Action du jour : lancer une séance.');

  return '<p class="k">Ton débrief</p><ul>' + p.map(x => '<li>' + ech(x) + '</li>').join('') + '</ul>' +
    (iaDispo() ? '<p><button class="assist-chip btn sm" type="button" data-ask="Approfondis mon débrief : sur quoi passer mes deux prochaines séances ?">Approfondir avec l\'IA</button></p>' : '');
}

/* ============================================================
   3. MOTEURS EN LIGNE : Groq et Claude
   ============================================================ */
const SYSTEME = `Tu es « le Prof », le tuteur de mathématiques intégré à l'application « Maths · De zéro au sommet ».

QUI EST L'ÉLÈVE
Un lycéen français en terminale STMG (bac 2027, spécialité Gestion et finance). Il a repris les mathématiques depuis le niveau sixième et progresse par étapes : fondations 6e-5e, collège, seconde, première STMG, terminale, puis les concours SESAME et ACCÈS (avril 2027). Il peut être débutant sur une notion et à l'aise sur une autre : ne présuppose jamais un prérequis, vérifie-le ou explique-le.

TON RÔLE
- Tu ne réponds QU'À des questions de mathématiques (y compris les maths appliquées à la gestion : pourcentages, indices, suites, coûts) ou au fonctionnement de l'application. Pour toute autre demande, dis en une phrase que tu es le prof de maths et propose de revenir aux maths.
- Tu tutoies. Tu es un guide de cordée : direct, chaleureux, jamais condescendant. Tu n'emploies jamais les mots « faux », « raté » ou « échec » pour qualifier l'élève.
- Tu expliques en français, avec des nombres écrits à la française (virgule décimale, espace pour les milliers). Jamais de LaTeX ni de symboles $ : écris les fractions a/b, les puissances avec ^, et utilise les signes × ÷ et le vrai signe moins.
- Pas d'emoji, pas de tiret cadratin : utilise « : », « . » ou « · ».

MÉTHODE PÉDAGOGIQUE
- Réponses COURTES : 3 à 8 lignes en général. Une idée par phrase. Pas d'introduction ni de conclusion de politesse.
- Toujours un exemple chiffré concret quand tu expliques une règle.
- Quand tu détailles un calcul, va étape par étape, en montrant les nombres.
- Si une technique de calcul mental de l'application s'applique, cite-la par son nom.
- Termine par une question courte ou un mini-exercice quand c'est utile pour vérifier qu'il a compris.

RÈGLE ABSOLUE PENDANT UN EXERCICE
Si le contexte indique qu'un exercice est en cours et que l'élève n'a pas encore répondu, tu ne donnes JAMAIS la réponse finale. Tu donnes un indice, tu rappelles la méthode, ou tu poses une question qui le débloque. S'il insiste une deuxième fois, tu détailles la méthode sur un exemple DIFFÉRENT avec d'autres nombres. Tu ne donnes la solution complète que s'il a déjà répondu (le contexte le précise) ou s'il ne s'agit pas d'un exercice en cours.

Si tu ne sais pas ou si tu n'es pas certain d'un calcul, dis-le et propose de le refaire ensemble étape par étape. Ne fabrique jamais un résultat.`;

/* Préambule de six lignes (S1) : la progression réelle passe enfin au modèle,
   window.S étant exposé par core/etat.js. */
function contexteRag(q, ctx){
  const c = ctx || ctxCourant();
  const bouts = [];
  const skills = window.SKILLS || [];

  try {
    const alt = (typeof altitude === 'function') ? altitude() : 0;
    const acquis = (typeof masteredCount === 'function') ? masteredCount() : 0;
    const f = (typeof frontier === 'function') ? frontier() : null;
    bouts.push('PROGRESSION : ' + alt + ' m sur ' + (typeof SOMMET === 'number' ? SOMMET : 4810) +
      '. ' + acquis + ' compétences acquises sur ' + skills.length + '.' +
      (f ? ' Compétence en cours (frontière) : ' + f.titre + '.' : ''));
  } catch(e){}

  if (c.skill && c.etat)
    bouts.push('NIVEAU SUR CETTE COMPÉTENCE : ' + c.skill.titre + ' · ' + c.etat.libelle +
      (c.etat.taux !== null && c.etat.taux !== undefined ? ' · ' + Math.round(c.etat.taux * 100) + ' % sur les 10 dernières.' : '.'));

  if (c.ex){
    bouts.push('EXERCICE EN COURS\nÉnoncé : ' + c.ex.q +
      (c.skill ? '\nCompétence : ' + c.skill.titre : '') +
      (c.fam ? '\nTechnique : ' + c.fam.nom + ' · ' + (c.fam.astuce || '') : '') +
      (c.aide ? '\nIndices déjà donnés : ' + c.aide + ' sur 3.' : '') +
      (c.repondu
        ? '\nL\'élève a DÉJÀ répondu (' + (c.juste ? 'juste' : 'il avait posé « ' + c.donnee + ' »') +
          '), la réponse attendue était : ' + c.ex.a + '. Tu peux donc tout expliquer.'
        : '\nL\'élève N\'A PAS ENCORE RÉPONDU : donne un indice ou la méthode, jamais la réponse.'));
  } else if (c.skill){
    bouts.push('L\'élève est sur la leçon : ' + c.skill.titre);
  }

  if (c.dernieresErreurs && c.dernieresErreurs.length)
    bouts.push('SES 3 DERNIÈRES ERREURS SUR CETTE COMPÉTENCE\n' + c.dernieresErreurs
      .map(e => '- ' + e.q + ' : il a posé « ' + (e.given || 'rien') + ' », attendu « ' + e.a + ' »').join('\n'));

  if (c.typeDominant)
    bouts.push('TYPE D\'ERREUR DOMINANT : ' + c.typeDominant.nom + ' (' + c.typeDominant.part + ' % de ses erreurs classées).');

  try {
    const rev = (typeof dueReviews === 'function') ? dueReviews() : [];
    if (rev.length) bouts.push('RAPPELS DU JOUR : ' + rev.slice(0, 5).map(s => s.titre).join(', ') + '.');
  } catch(e){}

  const hits = search(q, 2);
  if (hits.length) bouts.push('EXTRAITS DU COURS DE L\'ÉLÈVE (utilise le même vocabulaire)\n' +
    hits.map(h => '- ' + h.titre + ' (' + h.sous + ') : ' + h.texte.slice(0, 700)).join('\n'));

  return bouts.join('\n\n') || 'Pas de contexte particulier.';
}

/* Certains modèles encadrent leur raisonnement dans <think>. On le retire,
   y compris en cours de flux, quand la balise n'est pas encore fermée. */
function nettoie(t){
  let s = String(t).replace(/<think>[\s\S]*?<\/think>/gi, '');
  const i = s.toLowerCase().lastIndexOf('<think>');
  if (i >= 0) s = s.slice(0, i);
  return s.replace(/<\/?think>/gi, '').trim();
}
const BESOIN_WEB = /\b(cherche|recherche|internet|web|actualit|r[ée]cent|aujourd|202[6-9]|date du|source|site|lien|programme officiel|sesame|acc[eè]s|concours)\b/i;

async function askGroq(q, ctx, histoire, onDelta, onInfo){
  const cle = cleGroq();
  if (!cle) throw new Error('PAS_DE_CLE');
  const messages = [{role: 'system', content: SYSTEME + '\n\nCONTEXTE ACTUEL\n\n' + contexteRag(q, ctx)}]
    .concat(histoire, [{role: 'user', content: q}]);
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
                  : 'HTTP ' + r.status + (msg ? ' · ' + msg : ''));
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
        if (dl.content){ texte += dl.content; onDelta(dl.content); }
        else if (dl.reasoning) raison += dl.reasoning;
        if (ch.finish_reason) fin = ch.finish_reason;
        if (!outil && ((dl.executed_tools && dl.executed_tools.length) || (ch.executed_tools && ch.executed_tools.length))){
          outil = true; if (onInfo) onInfo('Recherche sur le web');
        }
      }
    }
    return {texte: nettoie(texte), raison: nettoie(raison), fin};
  }

  let res;
  try { res = await appel(veutWeb ? GROQ_WEB : GROQ_MODEL, veutWeb ? {} : {reasoning_effort: 'low'}); }
  catch(e){ if (e.statut === 400) res = await appel(GROQ_MODEL, {}); else throw e; }

  if (!res.texte && veutWeb){
    if (onInfo) onInfo('Nouvelle tentative');
    res = await appel(GROQ_MODEL, {reasoning_effort: 'low'});
  }
  if (!res.texte && res.raison){ onDelta(res.raison); return res.raison; }
  if (!res.texte){ const e = new Error('VIDE'); e.detail = res.fin || 'aucun texte reçu'; throw e; }
  return res.texte;
}

async function askClaude(q, ctx, histoire, onDelta, onInfo){
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
    messages: histoire.concat([{role: 'user', content: q}])
  };
  if (webOn()) body.tools = [{type: 'web_search_20260209', name: 'web_search', max_uses: 3}];

  const r = await fetch(CLAUDE_URL, {
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
    let msg = ''; try { const j = await r.json(); msg = (j.error && j.error.message) || ''; } catch(e){}
    if (r.status === 401) throw new Error('CLE_INVALIDE');
    if (r.status === 429) throw new Error('TROP_DE_REQUETES');
    if (r.status === 400 && /credit|balance/i.test(msg)) throw new Error('CREDIT');
    throw new Error('HTTP ' + r.status + (msg ? ' · ' + msg : ''));
  }

  const reader = r.body.getReader(), dec = new TextDecoder();
  let buf = '', stop = null, texte = '';
  for (;;){
    const {done, value} = await reader.read(); if (done) break;
    buf += dec.decode(value, {stream: true});
    const lignes = buf.split('\n'); buf = lignes.pop();
    for (const l of lignes){
      if (!l.startsWith('data:')) continue;
      const d = l.slice(5).trim(); if (!d) continue;
      let ev; try { ev = JSON.parse(d); } catch(e){ continue; }
      if (ev.type === 'content_block_start' && ev.content_block && ev.content_block.type === 'server_tool_use'){ if (onInfo) onInfo('Recherche sur le web'); }
      if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta'){ texte += ev.delta.text; onDelta(ev.delta.text); }
      if (ev.type === 'message_delta' && ev.delta && ev.delta.stop_reason) stop = ev.delta.stop_reason;
      if (ev.type === 'error') throw new Error((ev.error && ev.error.message) || 'erreur de flux');
    }
  }
  if (stop === 'refusal') throw new Error('REFUS');
  return texte;
}

/* Rendu léger du markdown renvoyé par le modèle. */
function md(t){
  let h = ech(t);
  h = h.replace(/```([\s\S]*?)```/g, (m, c) => '<pre class="assist-pre">' + c.trim() + '</pre>');
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|\n)[-•]\s+(.+)/g, '$1<li>$2</li>');
  h = h.replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>');
  return h.split(/\n{2,}/).map(p => /^<(ul|pre)/.test(p.trim()) ? p : '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
}

/* ============================================================
   4. CONFIGURATION EXPOSÉE À RÉGLAGES (M12)
   Les champs de clés ne vivent plus dans le fil de conversation.
   ============================================================ */
const CLES = {groq: K_GROQ, claude: K_CLAUDE};

/* Test réel d'une clé : une requête minimale, sans flux. Ne journalise jamais la clé. */
async function testerCle(f, cle){
  const k = (cle || '').trim() || (f === 'groq' ? cleGroq() : cleClaude());
  if (!k) return {ok: false, message: 'Aucune clé à tester.'};
  if (!enLigne()) return {ok: false, message: 'Hors ligne : le test attendra la connexion.'};
  try {
    let r;
    if (f === 'groq'){
      r = await fetch(GROQ_URL, {method: 'POST',
        headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + k},
        body: JSON.stringify({model: GROQ_MODEL, max_completion_tokens: 1, messages: [{role: 'user', content: 'ok'}]})});
    } else {
      r = await fetch(CLAUDE_URL, {method: 'POST',
        headers: {'content-type': 'application/json', 'x-api-key': k,
                  'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'},
        body: JSON.stringify({model: MODEL_CLAUDE, max_tokens: 1, messages: [{role: 'user', content: 'ok'}]})});
    }
    if (r.ok) return {ok: true, message: 'Clé ' + nomFournisseur(f) + ' valide.'};
    if (r.status === 401) return {ok: false, message: 'Clé refusée. Vérifie que tu l\'as copiée en entier.'};
    if (r.status === 429) return {ok: false, message: 'Clé valide, mais le quota du jour est atteint.'};
    if (r.status === 400){
      let msg = ''; try { const j = await r.json(); msg = (j.error && j.error.message) || ''; } catch(e){}
      if (/credit|balance/i.test(msg)) return {ok: false, message: 'Clé valide, mais le compte n\'a plus de crédit.'};
      return {ok: true, message: 'Clé ' + nomFournisseur(f) + ' acceptée.'};
    }
    return {ok: false, message: 'Réponse inattendue du serveur (code ' + r.status + ').'};
  } catch(e){
    return {ok: false, message: 'Connexion impossible au serveur.'};
  }
}

window.ASSIST_CONFIG = {
  cles: CLES,
  /* lecture et écriture des clés, sans jamais les afficher ailleurs */
  cle: f => lire(CLES[f] || ''),
  setCle: (f, v) => { if (CLES[f]) ecrire(CLES[f], String(v || '').trim()); majMode(); },
  pref: () => lire(K_PREF) || 'groq',
  setPref: p => { ecrire(K_PREF, p === 'local' || p === 'claude' ? p : 'groq'); majMode(); },
  web: webOn,
  setWeb: v => { ecrire(K_WEB, v ? '1' : ''); majMode(); },
  fournisseur: fournisseur,
  nom: nomFournisseur,
  dispo: iaDispo,
  etiquette: etiquetteMode,
  tester: testerCle,
  effacer: () => { ecrire(K_GROQ, ''); ecrire(K_CLAUDE, ''); ecrire(K_PREF, 'local'); majMode(); },
  effacerHistorique: () => { histoire = []; ecrire(K_HIST, ''); if (corps) corps.innerHTML = ''; },
  aide: {
    groq:   {nom: 'Groq', hote: 'console.groq.com', chemin: 'API Keys', prix: 'gratuit, sans carte bancaire'},
    claude: {nom: 'Claude', hote: 'platform.claude.com', chemin: 'Settings puis API keys', prix: 'payant, environ 2 centimes par question'}
  }
};

/* ============================================================
   5. PANNEAU (DESIGN-SPEC §6.28)
   ============================================================ */
let panneau = null, corps = null, champ = null, zoneChips = null, ligneCtx = null;
let histoire = [];                 // [{role, content}] persisté dans localStorage
let occupe = false;
let declencheur = null;            // bouton qui a ouvert le panneau : le focus lui revient
let ecoutesFermeture = [];         // écouteurs posés à l'ouverture, retirés à la fermeture

const surBureau = () => matchMedia('(min-width: 900px)').matches;

/* ---- historique persistant, hors de S ---- */
function chargerHistoire(){
  try {
    const brut = JSON.parse(lire(K_HIST) || '[]');
    histoire = Array.isArray(brut) ? brut.filter(m => m && m.role && m.content).slice(-HIST_MAX) : [];
  } catch(e){ histoire = []; }
}
function sauverHistoire(){
  if (histoire.length > HIST_MAX) histoire = histoire.slice(-HIST_MAX);
  try { ecrire(K_HIST, JSON.stringify(histoire)); } catch(e){}
}

/* ---- construction du dialogue ---- */
function construire(){
  if (panneau) return panneau;
  const hote = document.getElementById('sheets') || document.body;
  panneau = document.createElement('dialog');
  panneau.className = 'sheet sheet-prof';
  panneau.id = 'assist-panel';
  panneau.setAttribute('aria-labelledby', 'assist-t');
  panneau.innerHTML =
    '<div class="sheet-grip" aria-hidden="true"></div>' +
    '<header class="assist-head">' +
      '<span class="assist-t" id="assist-t">Le Prof</span>' +
      '<span class="assist-mode chip" id="assist-mode" data-tone="muted">Local</span>' +
      '<button class="btn-icon assist-icon" id="assist-close" type="button" aria-label="Fermer le Prof">' + icone('x', 24) + '</button>' +
    '</header>' +
    '<p class="assist-ctx small muted" id="assist-ctx"></p>' +
    '<div class="assist-body" id="assist-body"></div>' +
    '<footer class="assist-foot">' +
      '<div class="assist-chips" id="assist-chips"></div>' +
      '<form class="assist-row" id="assist-form">' +
        '<textarea id="assist-in" rows="1" placeholder="Pose ta question" aria-label="Ta question"></textarea>' +
        '<button class="btn-primary sm" id="assist-send" type="submit" aria-label="Envoyer la question">' +
          '<span class="ic-wrap">' + icone('paper-plane-tilt', 20) + '</span>' +
        '</button>' +
      '</form>' +
    '</footer>';
  hote.appendChild(panneau);

  corps = panneau.querySelector('#assist-body');
  champ = panneau.querySelector('#assist-in');
  zoneChips = panneau.querySelector('#assist-chips');
  ligneCtx = panneau.querySelector('#assist-ctx');

  panneau.querySelector('#assist-close').addEventListener('click', () => { bruit('click'); fermer(); });
  panneau.querySelector('#assist-form').addEventListener('submit', e => { e.preventDefault(); envoyer(); });
  panneau.addEventListener('cancel', e => { e.preventDefault(); fermer(); });   // Échap sur dialogue modal

  champ.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); envoyer(); }
  });
  champ.addEventListener('input', () => {
    champ.style.height = 'auto';
    champ.style.height = Math.min(champ.scrollHeight, 110) + 'px';
  });

  /* glisser vers le bas ferme, comme les autres feuilles */
  let y0 = null;
  panneau.addEventListener('touchstart', e => {
    y0 = (e.target === corps || corps.contains(e.target)) ? null : e.touches[0].clientY;
  }, {passive: true});
  panneau.addEventListener('touchend', e => {
    if (y0 === null) return;
    const dy = (e.changedTouches[0] ? e.changedTouches[0].clientY : y0) - y0;
    y0 = null;
    if (dy > 80) fermer();
  }, {passive: true});

  corps.addEventListener('click', surClicCorps);
  chargerHistoire();
  rejouerHistoire();
  return panneau;
}

/* Clics dans le fil : liens vers une leçon ou une technique, chips insérées dans une réponse. */
function surClicCorps(e){
  const ask = e.target.closest ? e.target.closest('[data-ask]') : null;
  if (ask){ e.preventDefault(); bruit('click'); poser(ask.getAttribute('data-ask')); return; }
  const chip = e.target.closest ? e.target.closest('[data-chip]') : null;
  if (chip){ e.preventDefault(); bruit('click'); jouerChip(chip.getAttribute('data-chip')); return; }
  const a = e.target.closest ? e.target.closest('[data-goto-skill],[data-goto-tech]') : null;
  if (!a) return;
  e.preventDefault();
  fermer();
  if (typeof window.ASSIST_GO !== 'function') return;
  if (a.dataset.gotoSkill) window.ASSIST_GO('skill', a.dataset.gotoSkill);
  else if (a.dataset.gotoTech) window.ASSIST_GO('tech', a.dataset.gotoTech);
}

/* ---- bulles ---- */
function bulle(qui, html, cls){
  if (!corps) return null;
  const d = document.createElement('div');
  d.className = 'assist-msg ' + qui + (cls ? ' ' + cls : '');
  d.innerHTML = html;
  corps.appendChild(d);
  corps.scrollTop = corps.scrollHeight;
  return d;
}
function rejouerHistoire(){
  if (!corps) return;
  corps.innerHTML = '';
  histoire.forEach(m => {
    if (m.role === 'user') bulle('moi', '<p>' + ech(m.content) + '</p>');
    else bulle('bot', md(m.content));
  });
}

/* ---- pastille de moteur ---- */
function etiquetteMode(){
  const f = fournisseur();
  if (!f) return 'Local';
  if (!enLigne()) return 'Local';
  return nomFournisseur(f) + (webOn() && f === 'groq' ? ' et web' : '');
}
function majMode(){
  const m = panneau && panneau.querySelector('#assist-mode');
  if (!m) return;
  const f = fournisseur();
  const actif = f && enLigne();
  m.textContent = etiquetteMode();
  m.dataset.tone = !actif ? 'muted' : (f === 'groq' ? 'glacier' : 'gold');
}

/* ---- première ligne contextuelle (S1) ---- */
function numeroQuestion(){
  const el = document.getElementById('head-count');
  if (!el || el.hidden) return '';
  const t = (el.textContent || '').trim();
  return /^\d/.test(t) ? t : '';
}
function majLigneCtx(){
  if (!ligneCtx) return;
  const c = ctxCourant();
  if (c.ex && c.skill){
    const n = numeroQuestion();
    ligneCtx.textContent = 'Tu es sur ' + c.skill.titre + (n ? ', question ' + n : '') +
      (c.etat ? ', niveau ' + c.etat.libelle : '') + '. Indice, règle, ou variante ?';
  } else if (c.skill){
    ligneCtx.textContent = 'Tu lis ' + c.skill.titre + '. Une question sur la leçon ?';
  } else {
    ligneCtx.textContent = 'Sur quoi veux-tu travailler ?';
  }
}

/* ---- chips contextuelles ---- */
function chipsCourantes(){
  const c = ctxCourant();
  if (c.ex){
    const l = [{id: 'etape', txt: LIBELLE_CHIP.etape}];
    if (c.repondu && !c.juste) l.push({id: 'pourquoi', txt: LIBELLE_CHIP.pourquoi});
    l.push({id: 'regle', txt: LIBELLE_CHIP.regle});
    if (!c.repondu) l.push({ask: 'Donne-moi un indice sans la réponse.', txt: 'Donne-moi un indice'});
    return l;
  }
  const l = [];
  try {
    const f = (typeof frontier === 'function') ? frontier() : null;
    if (f) l.push({ask: 'Explique-moi ' + f.titre + '.', txt: 'Revoir ' + f.titre});
    const td = typeDominant();
    if (td) l.push({ask: 'Comment éviter mes erreurs de ' + td.nom.toLowerCase() + ' ?',
                    txt: 'Comprendre mes erreurs de ' + td.nom.toLowerCase()});
    const rev = (typeof dueReviews === 'function') ? dueReviews() : [];
    if (rev.length) l.push({ask: 'Rappelle-moi la règle de ' + rev[0].titre + '.', txt: 'Réviser ' + rev[0].titre});
  } catch(e){}
  /* toujours trois chips : on complète avec des entrées de repli (S1) */
  const repli = [
    {ask: 'Explique-moi les fractions.', txt: 'Découvrir les fractions'},
    {ask: 'Explique-moi les pourcentages.', txt: 'Découvrir les pourcentages'},
    {ask: 'Comment poser une division ?', txt: 'Apprendre la division posée'}
  ];
  for (let i = 0; l.length < 3 && i < repli.length; i++) l.push(repli[i]);
  return l.slice(0, 3);
}
function majChips(){
  if (!zoneChips) return;
  const l = chipsCourantes();
  zoneChips.innerHTML = l.map(x =>
    '<button class="assist-chip btn sm" type="button" ' +
    (x.id ? 'data-chip="' + ech(x.id) + '"' : 'data-ask="' + ech(x.ask) + '"') +
    '>' + ech(x.txt) + '</button>').join('');
  zoneChips.querySelectorAll('.assist-chip').forEach(b => b.addEventListener('click', () => {
    bruit('click');
    if (b.dataset.chip) jouerChip(b.dataset.chip);
    else poser(b.dataset.ask);
  }));
}

/* ---- clavier logiciel de l'iPhone : le panneau se replie au lieu d'être écrasé ---- */
function majViewport(){
  const vv = window.visualViewport;
  if (!vv || !panneau) return;
  document.documentElement.style.setProperty('--vv', Math.round(vv.height) + 'px');
  if (!surBureau()) panneau.style.maxHeight = 'calc(var(--vv) - 16px)';
}

/* ---- ouverture et fermeture ---- */
function ouvrir(){
  construire();
  majMode(); majLigneCtx(); majChips();
  if (panneau.open){ if (champ) try { champ.focus(); } catch(e){} return; }
  declencheur = document.activeElement;
  accueillir();
  try {
    if (surBureau()) panneau.show();          // panneau latéral non modal : la page reste utilisable
    else panneau.showModal();                 // feuille modale : focus piégé nativement
  } catch(e){ panneau.setAttribute('open', ''); }
  majEtatBoutons(true);
  dire('Panneau du Prof ouvert.');

  /* Échap hors dialogue modal, et suivi du clavier logiciel */
  const surTouche = e => { if (e.key === 'Escape' && panneau.open){ e.preventDefault(); fermer(); } };
  document.addEventListener('keydown', surTouche);
  ecoutesFermeture.push(() => document.removeEventListener('keydown', surTouche));
  if (window.visualViewport){
    majViewport();
    window.visualViewport.addEventListener('resize', majViewport);
    window.visualViewport.addEventListener('scroll', majViewport);
    ecoutesFermeture.push(() => {
      window.visualViewport.removeEventListener('resize', majViewport);
      window.visualViewport.removeEventListener('scroll', majViewport);
      panneau.style.maxHeight = '';
    });
  }
  plusTard(80, () => { if (panneau && panneau.open && champ) try { champ.focus(); } catch(e){} });
}
function fermer(){
  if (!panneau) return;
  ecoutesFermeture.forEach(fn => { try { fn(); } catch(e){} });
  ecoutesFermeture = [];
  try { panneau.close(); } catch(e){ panneau.removeAttribute('open'); }
  majEtatBoutons(false);
  const cible = declencheur && document.contains(declencheur) && !declencheur.hidden
    ? declencheur
    : (document.getElementById('assist-fab') && !document.getElementById('assist-fab').hidden
        ? document.getElementById('assist-fab') : document.getElementById('btn-prof-top'));
  if (cible && cible.focus) try { cible.focus(); } catch(e){}
  declencheur = null;
}
function majEtatBoutons(ouvert){
  ['assist-fab', 'btn-prof-top'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
  });
}

/* Message de bienvenue : une phrase, le seul 👋 autorisé, une seule fois. */
function accueillir(){
  if (!corps || corps.children.length) return;
  let dejaVu = false;
  try { dejaVu = !!(window.S && S.meta && S.meta.profHello); } catch(e){}
  if (!dejaVu){
    bulle('bot', '<p><span class="emoji" aria-hidden="true">👋</span> Je suis le Prof : pose ta question, je réponds avec ton cours et je ne donne jamais la réponse avant que tu aies essayé.</p>' + sansCleHtml());
    try { if (window.S && S.meta){ S.meta.profHello = true; if (typeof save === 'function') save(); } } catch(e){}
  } else {
    bulle('bot', '<p>Sur quoi veux-tu travailler ?</p>' + sansCleHtml());
  }
}

/* ============================================================
   6. CONVERSATION
   ============================================================ */
function occuper(v){
  occupe = !!v;
  const b = panneau && panneau.querySelector('#assist-send');
  if (b){ b.setAttribute('aria-busy', v ? 'true' : 'false'); b.disabled = !!v; }
}
const marque = f => '<p><span class="assist-src chip" data-tone="' +
  (f === 'local' ? 'muted' : f === 'groq' ? 'glacier' : 'gold') + '">' +
  (f === 'local' ? 'Moteur local' : nomFournisseur(f)) + '</span></p>';

/* Chip cliquée, dans la carte de question comme dans le panneau (S1) :
   la réponse locale s'affiche tout de suite, l'IA la remplace ensuite. */
function jouerChip(id){
  ouvrir();
  const c = ctxCourant();
  const libelle = LIBELLE_CHIP[id] || String(id);
  bulle('moi', '<p>' + ech(libelle) + '</p>');
  const local = reponseLocale(id, c);
  const d = bulle('bot', local + marque('local'));
  if (!iaDispo() || occupe) { majChips(); return; }
  const question = questionDeChip(id, c);
  if (!question) { majChips(); return; }
  streamer(question, c, d, local);
}
function questionDeChip(id, c){
  if (id === 'etape') return 'Détaille étape par étape la résolution de cet exercice.';
  if (id === 'pourquoi') return 'J\'ai répondu « ' + (c.donnee || 'rien') + '. Explique-moi précisément où mon raisonnement a dérapé.';
  if (id === 'regle') return 'Rappelle-moi la règle à retenir pour ce type d\'exercice, avec un exemple chiffré.';
  if (id === 'variante') return 'Propose-moi un exercice du même type avec d\'autres nombres, sans la réponse.';
  return null;
}

/* Pose une question comme si l'élève l'avait tapée. */
function poser(texte){
  const q = String(texte || '').trim();
  if (!q) return;
  ouvrir();
  if (champ) champ.value = q;
  envoyer();
}

async function envoyer(){
  if (occupe || !champ) return;
  const q = champ.value.trim();
  if (!q) return;
  champ.value = ''; champ.style.height = 'auto';
  bruit('click');
  bulle('moi', '<p>' + ech(q) + '</p>');
  const c = ctxCourant();

  /* 1. Calcul exact : le moteur local est instantané, gratuit et sûr,
        sauf si l'élève demande une explication : le modèle fait mieux. */
  const veutComprendre = /expliqu|pourquoi|comment ça marche|d[ée]taill|comprend/i.test(q);
  const exact = localCalc(q, c);
  if (exact && !veutComprendre){
    const d = bulle('bot', exact.html);
    if (iaDispo()) d.insertAdjacentHTML('beforeend',
      '<p><button class="assist-chip btn sm" type="button" data-ask="Explique-moi pourquoi ce calcul marche : ' + ech(q) + '">Comprendre ce calcul</button></p>');
    majChips();
    return;
  }

  /* 2. Sinon : le modèle s'il est joignable, le cours hors ligne. */
  const f = fournisseur();
  if (!f || !enLigne()){
    const d = bulle('bot', localCours(q, c));
    if (!enLigne() && f) d.insertAdjacentHTML('afterbegin',
      '<p class="small muted">' + icone('wifi-slash', 20) + ' Hors ligne : je réponds avec ton cours. La connexion revenue, je reprends les explications sur mesure.</p>');
    majChips();
    return;
  }

  const d = bulle('bot', '<p class="assist-think">Je réfléchis</p>');
  await streamer(q, c, d, exact ? exact.html : null);
}

/* Envoi au modèle avec repli sur le cours. `secours` est le HTML local déjà affiché. */
async function streamer(q, c, cible, secours){
  const f = fournisseur();
  if (!f || !enLigne()) return;
  occuper(true); majMode();
  let acc = '';
  try {
    const moteur = f === 'groq' ? askGroq : askClaude;
    await moteur(q, c, histoire.slice(-8),
      t => {
        acc += t;
        const v = nettoie(acc);
        if (v){ cible.innerHTML = md(v); corps.scrollTop = corps.scrollHeight; }
      },
      info => { if (!nettoie(acc)) cible.innerHTML = '<p class="assist-think">' + ech(info) + '</p>'; });
    acc = nettoie(acc);
    if (!acc){
      cible.innerHTML = '<p class="assist-err">' + icone('warning-circle', 20) +
        ' Rien n\'est revenu. Je réponds avec ton cours.</p>' + (secours || localCours(q, c)) + marque('local');
    } else {
      cible.innerHTML = md(acc) + marque(f);
      histoire.push({role: 'user', content: q}, {role: 'assistant', content: acc});
      sauverHistoire();
    }
  } catch(e){
    const m = String(e.message || e);
    const connu = {
      CLE_INVALIDE:     'Ta clé ' + nomFournisseur(f) + ' est refusée. Vérifie-la dans Réglages.',
      QUOTA:            'Quota du jour atteint. Il se remet à zéro demain. Je continue avec ton cours.',
      TROP_DE_REQUETES: 'Trop de questions d\'un coup. Attends quelques secondes.',
      CREDIT:           'Ton compte ' + nomFournisseur(f) + ' n\'a plus de crédit. Je continue avec ton cours.',
      REFUS:            'Je ne peux pas répondre à cette demande. Reformule-la côté maths.',
      PAS_DE_CLE:       'Aucune clé enregistrée. Ajoute-la dans Réglages.',
      VIDE:             'Rien n\'est revenu (' + (e.detail || 'flux vide') + '). Je réponds avec ton cours.'
    };
    const txt = connu[m] || 'Connexion impossible. Je bascule sur ton cours.';
    cible.innerHTML = '<p class="assist-err">' + icone('warning-circle', 20) + ' ' + ech(txt) + '</p>';
    if (!connu[m] || m === 'QUOTA' || m === 'CREDIT' || m === 'VIDE')
      cible.insertAdjacentHTML('beforeend', (secours || localCours(q, c)) + marque('local'));
  } finally {
    occuper(false); majMode(); majChips();
    corps.scrollTop = corps.scrollHeight;
  }
}

/* ============================================================
   7. PASSERELLES PUBLIQUES
   ============================================================ */
/* Ouvre le panneau. Avec un argument : identifiant de chip, ou question libre. */
window.ASSIST_OUVRIR = function(quoi){
  ouvrir();
  if (!quoi) return;
  if (LIBELLE_CHIP[quoi]) jouerChip(quoi);
  else poser(String(quoi));
};
window.ASSIST_FERMER = fermer;
/* Bascule, pour le bouton flottant et pour un éventuel raccourci. */
window.ASSIST_BASCULER = function(){ if (panneau && panneau.open) fermer(); else ouvrir(); };
/* Le Coach demande son débrief proprement, sans simuler de clic sur le panneau. */
window.ASSIST_ASK = function(texte){ poser(texte); };
/* Chips de la carte de question (core/question.js). */
window.ASSIST_CHIP = function(id, ctx){ jouerChip(id); };
/* Débrief local en HTML, utilisable tel quel par le Coach. */
window.ASSIST_DEBRIEF = debriefLocal;

/* ============================================================
   8. AMORÇAGE
   ============================================================ */
function amorcer(){
  const fab = document.getElementById('assist-fab');
  if (fab && !fab.dataset.profCable){
    fab.dataset.profCable = '1';
    fab.addEventListener('click', e => {
      e.preventDefault(); bruit('click');
      window.ASSIST_BASCULER();
    });
  }
  /* #btn-prof-top est câblé par app.js, qui appelle ASSIST_OUVRIR : on ne pose rien ici,
     deux écouteurs de bascule sur le même bouton s'annuleraient l'un l'autre. */
  addEventListener('online', majMode);
  addEventListener('offline', majMode);
  /* Le contexte change à chaque question : la première ligne et les chips suivent. */
  try { if (typeof window.on === 'function') window.on('question', () => { majLigneCtx(); majChips(); }); } catch(e){}
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', amorcer);
else amorcer();

})();
