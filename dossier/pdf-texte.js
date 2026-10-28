(function () {
/* ===== Extraction de texte positionné d'un PDF simple (bulletin exporté d'Excel / Charlemagne), SANS dépendance =====
   Fonctionne dans le navigateur (DecompressionStream) et sous Node 22 (même API globale).
   Limites assumées : polices simples (WinAnsi / Standard), streams FlateDecode ou non compressés, texte via Tj/TJ/'/".
   Les PDF à polices CID (Identity-H) donnent un texte vide : l'appelant propose alors un autre mode d'import.
   API : pdfTexte(arrayBuffer) → Promise<{pages: [{fragments: [{x, y, taille, texte}]}]}>
         pdfLignes(page, tolerance=2.5) → [{y, fragments:[…triés par x]}] */
'use strict';

const CP1252 = {128:'€',130:'‚',131:'ƒ',132:'„',133:'…',134:'†',135:'‡',136:'ˆ',137:'‰',138:'Š',139:'‹',140:'Œ',142:'Ž',145:'‘',146:'’',147:'“',148:'”',149:'•',150:'–',151:'—',152:'˜',153:'™',154:'š',155:'›',156:'œ',158:'ž',159:'Ÿ'};
function decodeWinAnsi(octets){
  let s = '';
  for (const b of octets) s += b < 128 ? String.fromCharCode(b) : (CP1252[b] || String.fromCharCode(b));
  return s;
}

/* Décompresse un stream zlib (FlateDecode) ; renvoie null si ce n'est pas du zlib valide. */
async function inflate(octets){
  /* Node (tests) : zlib synchrone ; navigateur : DecompressionStream */
  if (typeof window === 'undefined' && typeof require === 'function'){
    try { return new Uint8Array(require('zlib').inflateSync(octets)); } catch(e){ return null; }
  }
  try {
    /* un flux zlib suivi d'octets parasites (fin de ligne avant « endstream ») fait échouer certains moteurs : on rogne */
    let fin = octets.length;
    while (fin > 0 && (octets[fin - 1] === 10 || octets[fin - 1] === 13 || octets[fin - 1] === 32 || octets[fin - 1] === 9)) fin--;
    octets = octets.subarray(0, fin);
    const ds = new DecompressionStream('deflate');
    const w = ds.writable.getWriter();
    const ecriture = w.write(octets).then(() => w.close()).catch(() => {});
    const parts = []; const r = ds.readable.getReader();
    for (;;){ const {done, value} = await r.read(); if (done) break; parts.push(value); }
    await ecriture;
    let n = 0; parts.forEach(p => n += p.length);
    const out = new Uint8Array(n); let o = 0; parts.forEach(p => { out.set(p, o); o += p.length; });
    return out;
  } catch(e){ return null; }
}

/* Localise tous les blocs « stream … endstream » avec leur dictionnaire (texte latin1 qui précède). */
function blocs(buf){
  const latin = new TextDecoder('latin1').decode(buf);
  const res = []; let i = 0;
  for (;;){
    const s = latin.indexOf('stream', i); if (s < 0) break;
    let d = s + 6; if (latin[d] === '\r') d++; if (latin[d] === '\n') d++;
    const e = latin.indexOf('endstream', d); if (e < 0) break;
    const dict = latin.slice(Math.max(0, latin.lastIndexOf('<<', s) - 0), s);   // approximatif mais suffisant
    const m = /\/Length\s+(\d+)(?!\s+\d+\s+R)/.exec(dict);
    const fin = (m && d + Number(m[1]) <= e) ? d + Number(m[1]) : e;
    res.push({dict, debut: d, fin});
    i = e + 9;
  }
  return res;
}

/* Lexeur minimal d'un flux de contenu : renvoie opérateurs et opérandes dans l'ordre. */
function* lexer(src){
  let i = 0; const n = src.length;
  const isWs = c => c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === '\f' || c === '\0';
  const isDelim = c => '()<>[]{}/%'.indexOf(c) >= 0;
  while (i < n){
    const c = src[i];
    if (isWs(c)){ i++; continue; }
    if (c === '%'){ while (i < n && src[i] !== '\n' && src[i] !== '\r') i++; continue; }
    if (c === '('){                                    // chaîne littérale
      let depth = 1, j = i + 1; const out = [];
      while (j < n && depth > 0){
        let ch = src[j];
        if (ch === '\\'){
          const nx = src[j + 1];
          if (nx >= '0' && nx <= '7'){ let oct = ''; let k = j + 1; while (k < n && k < j + 4 && src[k] >= '0' && src[k] <= '7'){ oct += src[k]; k++; } out.push(parseInt(oct, 8)); j = k; continue; }
          const map = {n: 10, r: 13, t: 9, b: 8, f: 12, '(': 40, ')': 41, '\\': 92};
          if (nx in map){ out.push(map[nx]); j += 2; continue; }
          if (nx === '\n'){ j += 2; continue; } if (nx === '\r'){ j += (src[j + 2] === '\n') ? 3 : 2; continue; }
          out.push(nx.charCodeAt(0)); j += 2; continue;
        }
        if (ch === '('){ depth++; } else if (ch === ')'){ depth--; if (depth === 0){ j++; break; } }
        out.push(ch.charCodeAt(0)); j++;
      }
      yield {t: 'str', v: out}; i = j; continue;
    }
    if (c === '<' && src[i + 1] !== '<'){                // chaîne hexadécimale
      const e = src.indexOf('>', i); const hex = src.slice(i + 1, e).replace(/\s+/g, '');
      const out = []; for (let k = 0; k + 1 < hex.length + 1; k += 2) out.push(parseInt((hex[k] || '0') + (hex[k + 1] || '0'), 16));
      yield {t: 'str', v: out}; i = e + 1; continue;
    }
    if (c === '<' && src[i + 1] === '<'){ yield {t: 'op', v: '<<'}; i += 2; continue; }
    if (c === '>' && src[i + 1] === '>'){ yield {t: 'op', v: '>>'}; i += 2; continue; }
    if (c === '[' || c === ']' || c === '{' || c === '}'){ yield {t: 'op', v: c}; i++; continue; }
    if (c === '/'){ let j = i + 1; while (j < n && !isWs(src[j]) && !isDelim(src[j])) j++; yield {t: 'name', v: src.slice(i + 1, j)}; i = j; continue; }
    let j = i; while (j < n && !isWs(src[j]) && !isDelim(src[j])) j++;
    const tok = src.slice(i, j); i = j;
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(tok)) yield {t: 'num', v: parseFloat(tok)};
    else yield {t: 'op', v: tok};
  }
}

/* Interprète un flux de contenu et renvoie les fragments de texte positionnés. */
function fragmentsDuFlux(src){
  const frags = []; let pile = [];
  let tm = [1, 0, 0, 1, 0, 0], tlm = [1, 0, 0, 1, 0, 0], taille = 0, tl = 0, enTexte = false, tableau = null;
  const ajouter = octets => {
    const texte = decodeWinAnsi(octets);
    if (!texte.trim()) return;
    frags.push({x: Math.round(tm[4] * 100) / 100, y: Math.round(tm[5] * 100) / 100, taille, texte});
    tm = tm.slice(); tm[4] += texte.length * taille * 0.5;   // avance approximative (sans largeurs de glyphes)
  };
  for (const tok of lexer(src)){
    if (tableau){
      if (tok.t === 'op' && tok.v === ']'){
        /* TJ : chaînes et ajustements ; un grand recul (< −200 millièmes) vaut un espace */
        const octets = [];
        for (const el of tableau){ if (el.t === 'str') octets.push(...el.v); else if (el.t === 'num' && el.v < -200) octets.push(32); }
        tableau = null; ajouter(octets); pile = []; continue;
      }
      tableau.push(tok); continue;
    }
    if (tok.t !== 'op'){ pile.push(tok); if (tok.t === 'op' && tok.v === '[') tableau = []; continue; }
    const op = tok.v;
    if (op === '['){ tableau = []; continue; }
    switch (op){
      case 'BT': enTexte = true; tm = [1, 0, 0, 1, 0, 0]; tlm = tm.slice(); break;
      case 'ET': enTexte = false; break;
      case 'Tf': taille = pile.length >= 1 && pile[pile.length - 1].t === 'num' ? pile[pile.length - 1].v : taille; break;
      case 'TL': tl = pile.length ? pile[pile.length - 1].v : tl; break;
      case 'Tm': if (pile.length >= 6){ tm = pile.slice(-6).map(p => p.v); tlm = tm.slice(); } break;
      case 'Td': case 'TD': if (pile.length >= 2){ const [tx, ty] = pile.slice(-2).map(p => p.v); tlm = tlm.slice(); tlm[4] += tx; tlm[5] += ty; tm = tlm.slice(); if (op === 'TD') tl = -ty; } break;
      case 'T*': tlm = tlm.slice(); tlm[5] -= tl; tm = tlm.slice(); break;
      case 'Tj': if (enTexte && pile.length && pile[pile.length - 1].t === 'str') ajouter(pile[pile.length - 1].v); break;
      case "'": tlm = tlm.slice(); tlm[5] -= tl; tm = tlm.slice(); if (pile.length && pile[pile.length - 1].t === 'str') ajouter(pile[pile.length - 1].v); break;
      case '"': tlm = tlm.slice(); tlm[5] -= tl; tm = tlm.slice(); if (pile.length && pile[pile.length - 1].t === 'str') ajouter(pile[pile.length - 1].v); break;
      default: break;
    }
    pile = [];
  }
  return frags;
}

async function pdfTexte(arrayBuffer){
  const buf = new Uint8Array(arrayBuffer);
  const pages = [];
  for (const b of blocs(buf)){
    const brut = buf.subarray(b.debut, b.fin);
    let octets = brut;
    if (/FlateDecode/.test(b.dict)){ octets = await inflate(brut); if (!octets) continue; }
    /* seuls les flux de contenu nous intéressent : pas les polices (Length1), images, objets, xref, métadonnées */
    if (/\/Length1|\/Subtype\s*\/Image|\/Type\s*\/ObjStm|\/Type\s*\/XRef|\/Type\s*\/Metadata|\/Subtype\s*\/Form/.test(b.dict)) continue;
    const src = new TextDecoder('latin1').decode(octets);
    if (src.indexOf('BT') < 0 || src.indexOf('ET') < 0) continue;            // pas un flux de contenu textuel
    const frags = fragmentsDuFlux(src);
    if (frags.length) pages.push({fragments: frags});
  }
  return {pages};
}

/* Regroupe les fragments d'une page en lignes (y proches), triées de haut en bas puis de gauche à droite. */
function pdfLignes(page, tolerance){
  const tol = tolerance == null ? 2.5 : tolerance;
  const f = page.fragments.slice().sort((a, b) => b.y - a.y || a.x - b.x);
  const lignes = [];
  for (const fr of f){
    const l = lignes.length ? lignes[lignes.length - 1] : null;
    if (l && Math.abs(l.y - fr.y) <= tol) l.fragments.push(fr); else lignes.push({y: fr.y, fragments: [fr]});
  }
  lignes.forEach(l => l.fragments.sort((a, b) => a.x - b.x));
  return lignes;
}

if (typeof module !== 'undefined' && module.exports) module.exports = {pdfTexte: pdfTexte, pdfLignes: pdfLignes};
if (typeof window !== 'undefined') window.DOSSIER_PDF = {pdfTexte: pdfTexte, pdfLignes: pdfLignes};
})();
