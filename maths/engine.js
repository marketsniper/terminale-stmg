/* ===== Maths · De zéro au sommet — moteur & coach adaptatif ===== */
'use strict';

/* ---------- utilitaires ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr){ const c = arr.slice(); for (let i = c.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }
};
const JOUR = 86400000;
const todayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const PHASES = {
  1:{nom:'Fondations (6e–5e)', camp:'Camp de base'},
  2:{nom:'Collège complet (4e–3e)', camp:'Camp 1'},
  3:{nom:'Seconde', camp:'Camp 2'},
  4:{nom:'Première STMG', camp:'Camp 3'},
  5:{nom:'Terminale + concours', camp:'Camp 4'},
  6:{nom:'Sprint concours', camp:'Assaut final'},
  7:{nom:'Objectif bac', camp:'Sommet'}
};
const DATE_CONCOURS = new Date(2027, 3, 10);   // ≈ avril 2027
const DATE_BAC = new Date(2027, 5, 14);        // ≈ juin 2027
const SOMMET = 4810;                            // mètres — le Mont Blanc

SKILLS.sort((a, b) => a.phase - b.phase || a.ordre - b.ordre);

/* ---------- état persistant ---------- */
const K = 'mzs-state';
function defState(){ return { skills:{}, erreurs:[], journal:{}, cm:{fam:{}, best:null}, tests:[], son:true, debut:Date.now() }; }
let S = defState();
try { const raw = localStorage.getItem(K); if (raw) S = Object.assign(defState(), JSON.parse(raw)); } catch(e){}
function save(){ try { localStorage.setItem(K, JSON.stringify(S)); } catch(e){} }
function st(id){ return S.skills[id] || (S.skills[id] = {hist:[], n:0, ok:0, mastered:false, fragile:false, due:0, interval:0, lu:false}); }

/* ---------- sons ---------- */
let actx = null;
function audio(){ if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; }
function tone(f, o = {}){
  if (!S.son) return;
  try {
    const c = audio(), t = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + (o.dur || .12));
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(o.vol || .18, t + .012);
    g.gain.exponentialRampToValueAtTime(.001, t + (o.dur || .12));
    osc.connect(g); g.connect(c.destination); osc.start(t); osc.stop(t + (o.dur || .12) + .05);
  } catch(e){}
}
const snd = {
  click: () => tone(660, {dur:.05, vol:.1}),
  deal: () => tone(290, {slide:560, dur:.1, vol:.12}),
  good: () => { tone(660, {dur:.09}); tone(880, {dur:.12, delay:.07}); },
  bad: () => tone(215, {type:'sawtooth', slide:150, dur:.2, vol:.12}),
  pop: () => tone(520, {slide:800, dur:.09, vol:.14}),
  win(p){ const notes = p >= 1 ? [523,659,784,1047,1319] : p >= .8 ? [523,659,784,1047] : p >= .5 ? [523,659,784] : [392,330];
    notes.forEach((n, i) => tone(n, {dur:.16, vol:.15, delay:i * .09})); }
};
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(big){
  if (REDUCE) return;
  const cv = document.createElement('canvas'); cv.id = 'confetti';
  cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
  const g = cv.getContext('2d'), cols = ['#F5C64F','#5B8DEF','#3AC08F','#E4695A','#E8ECF4','#C77DFF'];
  const P = Array.from({length: big ? 160 : 90}, () => ({x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .4,
    vx: (Math.random() - .5) * 2.4, vy: 2 + Math.random() * 3.2, s: 4 + Math.random() * 5, c: R.pick(cols), r: Math.random() * Math.PI}));
  let t = 0;
  (function loop(){
    g.clearRect(0, 0, cv.width, cv.height); t++;
    for (const p of P){ p.x += p.vx; p.y += p.vy; p.vy += .025; p.r += .08;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s/2, -p.s/2, p.s, p.s * .6); g.restore(); }
    if (t < 230) requestAnimationFrame(loop); else cv.remove();
  })();
}

/* ---------- réponses : normalisation ---------- */
function normStr(s){ return String(s).trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.').replace(/[€%]/g, ''); }
function parseVal(s){
  s = normStr(s);
  const fr = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fr) { const d = parseFloat(fr[2]); return d === 0 ? NaN : parseFloat(fr[1]) / d; }
  const n = parseFloat(s);
  return /^-?\d+(\.\d+)?$/.test(s) ? n : NaN;
}
function isRight(input, ex){
  const cands = [ex.a].concat(ex.accept || []);
  const ni = normStr(input);
  if (cands.some(c => normStr(c) === ni)) return true;
  const vi = parseVal(input);
  if (!isNaN(vi)) return cands.some(c => { const v = parseVal(c); return !isNaN(v) && Math.abs(v - vi) < 1e-9; });
  return false;
}

/* ---------- maîtrise, verrous, révisions ---------- */
const MASTER_LAST = 10, MASTER_OK = 9, MASTER_MIN = 12;
function record(id, ok){
  const s = st(id);
  s.hist.push(ok ? 1 : 0); if (s.hist.length > 20) s.hist.shift();
  s.n++; if (ok) s.ok++;
  const last = s.hist.slice(-MASTER_LAST);
  if (!s.mastered && s.n >= MASTER_MIN && last.length >= MASTER_LAST && last.reduce((a,b)=>a+b,0) >= MASTER_OK){
    s.mastered = true; s.masteredAt = Date.now(); s.interval = 2; s.due = Date.now() + 2 * JOUR; s.fragile = false;
    save(); return 'mastered';
  }
  if (s.fragile){ const l3 = s.hist.slice(-3); if (l3.length === 3 && l3.every(x => x)) s.fragile = false; }
  save(); return null;
}
function tauxRecent(id){ const h = st(id).hist.slice(-MASTER_LAST); return h.length ? h.reduce((a,b)=>a+b,0) / h.length : null; }
function phaseUnlocked(p){ if (p === 1) return true; const prev = SKILLS.filter(s => s.phase === p - 1); return prev.length > 0 && prev.every(s => st(s.id).mastered); }
function frontier(){ return SKILLS.find(s => !st(s.id).mastered && phaseUnlocked(s.phase)) || null; }
function dueReviews(){
  const now = Date.now();
  return SKILLS.filter(s => { const x = st(s.id); return x.mastered && (x.fragile || (x.due && x.due <= now)); });
}
function reviewResult(id, okCount, total){
  const s = st(id);
  if (okCount / total >= .7){ s.interval = Math.min((s.interval || 2) * 2, 60); s.due = Date.now() + s.interval * JOUR; }
  else { s.fragile = true; s.interval = 2; s.due = Date.now() + 2 * JOUR; }
  save();
}
function masteredCount(){ return SKILLS.filter(s => st(s.id).mastered).length; }
function altitude(){ return SKILLS.length ? Math.round(SOMMET * masteredCount() / SKILLS.length) : 0; }

/* ---------- journal & série (streak) ---------- */
function jToday(){ const k = todayKey(); return S.journal[k] || (S.journal[k] = {a:0, ok:0, cm:0, seance:false}); }
function logAnswer(ok){ const j = jToday(); j.a++; if (ok) j.ok++; save(); }
function dayDone(k){ const j = S.journal[k]; return !!j && (j.seance || j.a >= 15); }
function streak(){
  let n = 0; const d = new Date();
  if (dayDone(todayKey(d))) n++;
  for (let i = 1; i < 400; i++){ d.setDate(d.getDate() - 1); if (dayDone(todayKey(d))) n++; else break; }
  return n;
}

/* ---------- calcul mental (familles + techniques : techniques.js) ---------- */
const CM_FAMS = window.CM_FAMS || [];
const CM_CATS = [...new Set(CM_FAMS.map(f => f.cat))];
function cmPick(){
  const weights = CM_FAMS.map(f => { const s = S.cm.fam[f.id] || {n:0, ok:0}; const err = s.n ? 1 - s.ok / s.n : .5; return .25 + err; });
  let tot = weights.reduce((a,b)=>a+b,0), r = Math.random() * tot;
  for (let i = 0; i < CM_FAMS.length; i++){ r -= weights[i]; if (r <= 0) return CM_FAMS[i]; }
  return CM_FAMS[0];
}
function cmRecord(fid, ok){ const s = S.cm.fam[fid] || (S.cm.fam[fid] = {n:0, ok:0}); s.n++; if (ok) s.ok++; const j = jToday(); j.cm++; save(); }

/* ---------- coach : analyse & messages ---------- */
function coachMessages(){
  const msgs = [];
  const sk = streak(), f = frontier(), due = dueReviews(), alt = altitude();
  const weak = SKILLS.filter(s => { const t = tauxRecent(s.id); return t !== null && t < .5 && st(s.id).n >= 6 && !st(s.id).mastered; });
  const cmTot = Object.values(S.cm.fam).reduce((a, x) => ({n:a.n + x.n, ok:a.ok + x.ok}), {n:0, ok:0});
  if (masteredCount() === 0 && (!f || st(f.id).n === 0))
    msgs.push({t:'🚀 Bienvenue au camp de base ! Ta première mission : la séance du jour. On commence tout en bas pour ne laisser aucun trou — c\'est comme ça qu\'on construit les meilleurs.', p:10});
  if (due.length >= 4) msgs.push({t:`📬 ${due.length} compétences attendent leur révision. Priorité absolue aujourd\'hui : réviser AVANT d\'apprendre du neuf — c\'est la règle n°5, celle qui grave dans le marbre.`, p:9});
  if (weak.length) msgs.push({t:`🎯 Je vois que « ${weak[0].titre} » résiste (moins de 50 % de réussite récemment). Relis la leçon calmement, puis refais une série en niveau Découverte. On ne contourne pas, on consolide.`, p:8});
  if (sk >= 3) msgs.push({t:`🔥 ${sk} jours d\'affilée — c\'est exactement comme ça qu\'on devient fort. La régularité bat le talent.`, p:5});
  if (sk === 0 && Object.keys(S.journal).length > 0) msgs.push({t:'⏰ Pas encore de séance aujourd\'hui. Même 20 minutes comptent : lance la séance du jour, je m\'occupe du menu.', p:7});
  const fam = Object.entries(S.cm.fam).filter(([, v]) => v.n >= 8).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)[0];
  if (fam && fam[1].ok / fam[1].n < .7){ const fo = CM_FAMS.find(x => x.id === fam[0]) || {};
    msgs.push({t:`🧮 En calcul mental, « ${fo.nom || fam[0]} » est ton point faible (${Math.round(100 * fam[1].ok / fam[1].n)} % de réussite). Relis la technique — ${fo.astuce || 'elle est dans l\'onglet ⚡ Techniques'} — puis fais-en un sprint dédié.`, p:6, tech: fam[0]}); }
  if (new Date().getDay() === 0) msgs.push({t:'📅 C\'est dimanche : jour du test hebdomadaire ! 20 questions pour valider ta semaine et réactiver les anciennes. Il est sur ton tableau de bord.', p:8});
  if (alt > 0) msgs.push({t:`⛰️ Tu es à ${alt} m d\'altitude (${masteredCount()}/${SKILLS.length} compétences maîtrisées). Chaque compétence validée à 90 % te fait grimper — le sommet est à ${SOMMET} m.`, p:3});
  if (f) msgs.push({t:`👉 Ta prochaine marche : « ${f.titre} » (${PHASES[f.phase].nom}). C\'est elle qui débloque la suite.`, p:4});
  if (!f && SKILLS.length) msgs.push({t:'🏔️ SOMMET ATTEINT. Toutes les compétences sont maîtrisées — maintenant, on entretient : révisions espacées et annales. Immense respect.', p:10});
  msgs.sort((a, b) => b.p - a.p);
  return msgs;
}

/* ---------- moteur d'exercices (composant partagé) ---------- */
let qSeq = 0;
function askQuestion(box, opts, cb){
  // opts : {ex:{q,a,accept,choix,expl}, tag, lvl, count, chrono:bool}
  const ex = opts.ex, myId = ++qSeq;
  const lvlNames = {1:'Découverte', 2:'Maîtrise', 3:'Expert'};
  box.innerHTML = `<div class="exo-card deal">
    <div class="exo-top">
      <span class="tag">${esc(opts.tag || '')}</span>
      ${opts.lvl ? `<span class="lvl">niv. ${lvlNames[opts.lvl] || opts.lvl}</span>` : ''}
      ${opts.chrono ? '<span class="chrono" data-ch>0 s</span>' : ''}
      ${opts.count ? `<span class="count">${esc(opts.count)}</span>` : ''}
    </div>
    <p class="qtext">${esc(ex.q)}</p>
    ${opts.hint ? `<p class="hint-line">💡 ${esc(opts.hint)}</p>` : ''}
    <div data-zone></div>
    <div data-fb></div>
  </div>`;
  snd.deal();
  const zone = box.querySelector('[data-zone]'), fb = box.querySelector('[data-fb]');
  const t0 = performance.now();
  window.ASSIST_CTX = {ex, skillId: opts.skillId || null, famId: opts.famId || null, repondu: false, juste: false, donnee: ''};
  let chInt = null;
  if (opts.chrono){ const chEl = box.querySelector('[data-ch]');
    chInt = setInterval(() => { const s = Math.floor((performance.now() - t0) / 1000); chEl.textContent = s + ' s'; if (s >= 8) chEl.classList.add('warn'); }, 500); }
  function finish(ok, given){
    if (chInt) clearInterval(chInt);
    const dt = performance.now() - t0;
    if (window.ASSIST_CTX && window.ASSIST_CTX.ex === ex) Object.assign(window.ASSIST_CTX, {repondu: true, juste: ok, donnee: given});
    if (ok) snd.good(); else { snd.bad(); box.querySelector('.exo-card').classList.add('shake'); }
    fb.innerHTML = `<p class="verdict ${ok ? 'ok' : 'ko'}">${ok ? R.pick(['✔ Exact !','✔ Parfait.','✔ Oui !','✔ Très bien.']) : '✘ Pas ça. Réponse : ' + esc(ex.a)}</p>` +
      (ex.expl ? `<div class="explain">${esc(ex.expl)}</div>` : '') +
      `<div class="next-row"><button class="primary" data-next>Continuer</button></div>`;
    const btn = fb.querySelector('[data-next]');
    btn.focus();
    btn.addEventListener('click', () => { snd.click(); cb({ok, ms: dt, given, ex}); });
  }
  if (ex.choix){
    const opts4 = R.shuffle(ex.choix);
    zone.innerHTML = `<div class="opts">${opts4.map((c, i) =>
      `<button class="opt" data-c="${esc(c)}"><span class="letter">${'ABCD'[i]}</span><span>${esc(c)}</span></button>`).join('')}</div>`;
    zone.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      const val = b.getAttribute('data-c'), ok = normStr(val) === normStr(ex.a);
      zone.querySelectorAll('.opt').forEach(x => { x.disabled = true;
        if (normStr(x.getAttribute('data-c')) === normStr(ex.a)) x.classList.add('good');
        else if (x === b) x.classList.add('bad'); else x.classList.add('dim'); });
      finish(ok, val);
    }));
  } else {
    zone.innerHTML = `<div class="answer-row"><input type="text" inputmode="decimal" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="Ta réponse…" aria-label="Réponse"><button class="primary" data-val>Valider</button></div>`;
    const inp = zone.querySelector('input');
    const go = () => { if (qSeq !== myId) return; const v = inp.value.trim(); if (!v) { inp.focus(); return; }
      inp.disabled = true; zone.querySelector('[data-val]').disabled = true; finish(isRight(v, ex), v); };
    zone.querySelector('[data-val]').addEventListener('click', go);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    inp.focus();
  }
}

function genFor(skill, level){
  try { const ex = skill.gen(level, R);
    if (!ex || typeof ex.q !== 'string' || typeof ex.a !== 'string') throw 0;
    return ex;
  } catch(e){ return {q:'(exercice indisponible — préviens le coach !)', a:'0', accept:null, choix:null, expl:''}; }
}

/* série de n questions sur un skill, niveau adaptatif */
function runSerie(box, skill, n, opts, done){
  const res = []; let level = opts.level || 1, okStreak = 0;
  const startLevel = level;
  function barHtml(){ return `<div class="serie-bar">${Array.from({length: n}, (_, i) =>
    `<i class="${i < res.length ? (res[i] ? 'ok' : 'ko') : (i === res.length ? 'cur' : '')}"></i>`).join('')}</div>`; }
  function next(){
    if (res.length >= n){ done({res, level}); return; }
    const ex = genFor(skill, level);
    const wrap = document.createElement('div');
    box.innerHTML = ''; box.appendChild(wrap);
    askQuestion(wrap, {ex, tag: skill.titre, lvl: level, chrono: opts.chrono !== false,
      skillId: skill.id, count: (res.length + 1) + ' / ' + n}, r => {
      res.push(r.ok ? 1 : 0);
      logAnswer(r.ok);
      if (opts.recordSkill !== false){
        const evt = record(skill.id, r.ok);
        if (evt === 'mastered') opts.onMastered && opts.onMastered();
      }
      if (!r.ok){
        S.erreurs.unshift({sid: skill.id, q: r.ex.q, a: r.ex.a, given: r.given, expl: r.ex.expl || '', choix: r.ex.choix || null, ts: Date.now(), redo: 0});
        if (S.erreurs.length > 120) S.erreurs.pop();
        save();
        okStreak = 0; if (level > startLevel) level--;
      } else { okStreak++; if (okStreak >= 3 && level < 3 && opts.adapt !== false){ level++; okStreak = 0; } }
      const b = box.querySelector('.serie-bar'); if (b) b.outerHTML = barHtml();
      next();
    });
    box.insertAdjacentHTML('beforeend', barHtml());
  }
  next();
}

/* ---------- vues ---------- */
const app = () => $('app');
let currentView = 'accueil';
function nav(v){ currentView = v;
  document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.v === v));
  ({accueil: vAccueil, programme: vProgramme, techniques: vTechniques, erreurs: vErreurs, coach: vCoach, regles: vRegles}[v] || vAccueil)();
  scrollTo({top: 0});
}

function joursAvant(d){ return Math.max(0, Math.ceil((d - Date.now()) / JOUR)); }

function montagneSVG(){
  const frac = SKILLS.length ? masteredCount() / SKILLS.length : 0;
  // chemin d'ascension : du pied (24,152) au sommet principal (240,20)
  const X0 = 24, Y0 = 152, X1 = 240, Y1 = 22;
  const x = X0 + (X1 - X0) * frac, y = Y0 + (Y1 - Y0) * frac;
  const camps = [];
  let cum = 0;
  for (let p = 1; p <= 7; p++){
    cum += SKILLS.filter(s => s.phase === p).length;
    const f = SKILLS.length ? cum / SKILLS.length : 0;
    camps.push({x: X0 + (X1 - X0) * f, y: Y0 + (Y1 - Y0) * f, done: SKILLS.filter(s => s.phase === p).every(s => st(s.id).mastered)});
  }
  return `<svg viewBox="0 0 360 170" role="img" aria-label="Progression : ${altitude()} mètres">
    <polygon points="0,160 120,60 170,95 240,20 300,70 360,45 360,160" fill="var(--card2)" stroke="var(--line)"/>
    <polygon points="222,38 240,20 258,38 250,40 240,33 230,40" fill="var(--ink)" opacity=".85"/>
    <line x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y1}" stroke="var(--line)" stroke-dasharray="4 5" stroke-width="1.4"/>
    ${camps.map(c => `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4" fill="${c.done ? 'var(--ok)' : 'var(--card)'}" stroke="var(--muted)"/>`).join('')}
    <g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
      <circle r="7.5" fill="var(--gold)"/>
      <text y="4.5" text-anchor="middle" font-size="9">🧗</text>
    </g>
    <line x1="240" y1="20" x2="240" y2="4" stroke="var(--ink)" stroke-width="1.5"/>
    <polygon points="240,4 254,8 240,12" fill="var(--gold)"/>
  </svg>`;
}

function vAccueil(){
  const f = frontier(), due = dueReviews(), sk = streak(), j = jToday();
  const msg = coachMessages()[0];
  const dim = new Date().getDay() === 0;
  app().innerHTML = `
  <section class="card">
    <p class="k">Ton ascension</p>
    <div class="montagne">${montagneSVG()}</div>
    <div class="row" style="justify-content:space-between">
      <span class="alt-label">⛰️ ${altitude()} m <span class="muted small">/ ${SOMMET} m</span></span>
      <span class="pill">🔥 série : ${sk} jour${sk > 1 ? 's' : ''}</span>
    </div>
    <div class="stats">
      <div class="stat"><b>${masteredCount()}<span class="muted" style="font-size:1rem">/${SKILLS.length}</span></b><span>compétences maîtrisées</span></div>
      <div class="stat"><b>${j.a}</b><span>réponses aujourd'hui</span></div>
      <div class="stat"><b>J−${joursAvant(DATE_CONCOURS)}</b><span>concours (≈ avril 2027)</span></div>
      <div class="stat"><b>J−${joursAvant(DATE_BAC)}</b><span>bac (≈ juin 2027)</span></div>
    </div>
  </section>
  ${msg ? `<div class="coach-msg"><p class="qui">🤖 Ton coach</p><p>${msg.t}</p></div>` : ''}
  <section class="card">
    <h2>La séance du jour</h2>
    <p class="muted small">Construite pour toi : échauffement de calcul mental → révisions dues → nouvelle compétence${due.length ? ` (${due.length} révision${due.length > 1 ? 's' : ''} en attente)` : ''}${f ? ` → « ${esc(f.titre)} »` : ''} → erreurs à refaire.</p>
    <div class="row" style="margin-top:.7rem">
      <button class="primary" id="go-seance">${j.seance ? 'Refaire une séance 💪' : 'Commencer ma séance →'}</button>
      <button class="ghost" id="go-cm">🧮 Calcul mental seul</button>
      <button class="ghost" id="go-tech">⚡ Techniques</button>
      ${dim || S.tests.length === 0 ? `<button class="ghost" id="go-test">📅 Test hebdo (20 q)</button>` : `<button class="ghost" id="go-test">📅 Test hebdo</button>`}
    </div>
    ${j.seance ? '<p class="small" style="color:var(--ok);margin:.6rem 0 0">✔ Séance du jour terminée — la série continue !</p>' : ''}
  </section>`;
  $('go-seance').addEventListener('click', () => { snd.click(); vSeance(); });
  $('go-cm').addEventListener('click', () => { snd.click(); vCalculMental(); });
  $('go-tech').addEventListener('click', () => { snd.click(); nav('techniques'); });
  $('go-test').addEventListener('click', () => { snd.click(); vTest(); });
}

function vProgramme(){
  let html = `<section class="card"><h2>🗺️ Le programme — 7 phases, ${SKILLS.length} compétences</h2>
  <p class="muted small">Règle des 90 % : une compétence est validée quand tu réussis 9 de tes 10 dernières réponses. Chaque phase se déverrouille quand la précédente est entièrement maîtrisée. Les leçons, elles, sont toujours lisibles.</p></section>`;
  const f = frontier();
  for (let p = 1; p <= 7; p++){
    const list = SKILLS.filter(s => s.phase === p);
    if (!list.length) continue;
    const done = list.filter(s => st(s.id).mastered).length;
    const unlocked = phaseUnlocked(p);
    html += `<div class="phase ${unlocked ? '' : 'locked'}">
      <div class="phase-head">
        <h2>${unlocked ? '' : '🔒 '}Phase ${p} · ${esc(PHASES[p].nom)}</h2>
        <span class="pbar"><i style="width:${list.length ? Math.round(100 * done / list.length) : 0}%"></i></span>
        <span class="etat">${done}/${list.length}</span>
      </div>
      <div class="skills">` +
      list.map(s => { const x = st(s.id), tr = tauxRecent(s.id);
        const icon = x.mastered ? (x.fragile ? '⚠️' : '✅') : (x.n > 0 ? '🔄' : (unlocked ? '·' : '🔒'));
        const cls = ['skill', x.mastered ? 'done' : '', x.fragile ? 'fragile' : '', f && f.id === s.id ? 'frontier' : ''].join(' ');
        return `<button class="${cls}" data-skill="${s.id}">
          <span class="num">${s.phase}.${s.ordre}</span><span class="t">${esc(s.titre)}</span>
          ${tr !== null && !x.mastered ? `<span class="small muted">${Math.round(tr * 10)}/10</span>` : ''}
          <span class="etat">${icon}</span></button>`;
      }).join('') + `</div></div>`;
  }
  app().innerHTML = html;
  document.querySelectorAll('[data-skill]').forEach(b => b.addEventListener('click', () => { snd.click(); vSkill(b.dataset.skill); }));
}

function vSkill(id){
  const skill = SKILLS.find(s => s.id === id); if (!skill) return nav('programme');
  const x = st(id), unlocked = phaseUnlocked(skill.phase), tr = tauxRecent(id);
  app().innerHTML = `
  <section class="card">
    <p class="k">Phase ${skill.phase} · ${esc(PHASES[skill.phase].nom)}</p>
    <h2>${esc(skill.titre)}</h2>
    <p class="muted">${esc(skill.objectif || '')}</p>
    <div class="row small muted">
      <span class="pill">${x.mastered ? (x.fragile ? '⚠️ à consolider' : '✅ maîtrisée') : x.n > 0 ? '🔄 en cours' : '· pas commencée'}</span>
      ${tr !== null ? `<span class="pill">réussite récente : ${Math.round(tr * 100)} %</span>` : ''}
      <span class="pill">${x.n} réponse${x.n > 1 ? 's' : ''}</span>
    </div>
  </section>
  <section class="card">
    <details ${x.lu && x.n > 0 ? '' : 'open'}>
      <summary style="cursor:pointer;font-weight:700">📖 La leçon</summary>
      <div class="lecon">${skill.lecon || '<p class="muted">Leçon en préparation.</p>'}</div>
    </details>
  </section>
  <section class="card">
    ${unlocked
      ? `<div class="row"><button class="primary" id="train">S'entraîner (série de 10) →</button>
         <label class="small muted">Niveau
           <select id="lvl" style="font:inherit;background:var(--card2);color:var(--ink);border:1px solid var(--line);border-radius:7px;padding:.3rem">
             <option value="0">Auto</option><option value="1">Découverte</option><option value="2">Maîtrise</option><option value="3">Expert</option>
           </select></label>
         <button class="ghost" id="back">← Programme</button></div>
         <div id="zone" style="margin-top:.6rem"></div>`
      : `<p>🔒 Les exercices de cette phase se déverrouillent quand la phase précédente est entièrement maîtrisée — <strong>règle des 90 %</strong>, on ne laisse aucun trou derrière soi. Tu peux déjà lire la leçon !</p>
         <button class="ghost" id="back">← Programme</button>`}
  </section>`;
  $('back') && $('back').addEventListener('click', () => { snd.click(); nav('programme'); });
  if (!unlocked) return;
  x.lu = true; save();
  $('train').addEventListener('click', () => {
    snd.click();
    const sel = parseInt($('lvl').value, 10);
    const auto = sel === 0;
    const startLvl = auto ? (tr !== null && tr >= .8 ? 2 : 1) : sel;
    $('train').disabled = true;
    runSerie($('zone'), skill, 10, {level: startLvl, adapt: auto, onMastered: () => { confetti(false); snd.win(1); }}, ({res}) => {
      const okN = res.reduce((a, b) => a + b, 0);
      const now = st(id);
      $('zone').innerHTML = `<div class="card fin-card">
        <div class="score">${okN} / ${res.length}</div>
        <p class="msg">${now.mastered && !now.fragile ? '✅ Compétence maîtrisée — tu grimpes !' : okN >= 8 ? 'Excellent — encore une série comme ça et c\'est validé.' : okN >= 5 ? 'Ça progresse. Relis la leçon sur tes erreurs, puis on y retourne.' : 'Reprends la leçon tranquillement — puis série en niveau Découverte. Aucun stress : c\'est le chemin normal.'}</p>
        <div class="row" style="justify-content:center">
          <button class="primary" id="again">Encore une série</button>
          <button class="ghost" id="back2">← Programme</button>
        </div></div>`;
      snd.win(okN / res.length);
      if (okN === res.length) confetti(false);
      $('again').addEventListener('click', () => { snd.click(); vSkill(id); setTimeout(() => $('train') && $('train').click(), 50); });
      $('back2').addEventListener('click', () => { snd.click(); nav('programme'); });
    });
  });
}

/* ---------- séance guidée ---------- */
function vSeance(){
  const plan = [];
  plan.push({t:'Échauffement', run: runWarmup});
  const due = dueReviews().slice(0, 3);
  if (due.length) plan.push({t:'Révisions', run: box => runReviews(box, due)});
  const f = frontier();
  if (f) plan.push({t:'Compétence du jour', run: box => runFrontier(box, f)});
  const errs = S.erreurs.filter(e => e.redo < 2).slice(0, 3);
  if (errs.length) plan.push({t:'Erreurs', run: box => runErrRedo(box, errs)});
  let idx = 0;
  const bilan = {cm:[0,0], rev:[0,0], sk:[0,0], err:[0,0]};
  function stepsHtml(){ return `<div class="steps">${plan.map((s, i) =>
    `<span class="step ${i < idx ? 'done' : i === idx ? 'cur' : ''}">${i < idx ? '✔ ' : ''}${s.t}</span>`).join('')}</div>`; }
  function next(){
    if (idx >= plan.length) return finale();
    app().innerHTML = `<section class="card"><h2>Séance du jour</h2>${stepsHtml()}</section><div id="zone"></div>`;
    plan[idx].run($('zone'));
  }
  function advance(){ idx++; next(); }
  function runWarmup(box){
    let i = 0, ok = 0; const N = 12; const t0 = performance.now();
    (function ask(){
      if (i >= N){ bilan.cm = [ok, N];
        const secs = Math.round((performance.now() - t0) / 1000);
        box.innerHTML = `<div class="card fin-card"><div class="score">${ok} / ${N}</div>
          <p class="msg">Échauffement bouclé en ${secs} s${ok === N ? ' — impeccable ⚡' : ''}.</p>
          <button class="primary" id="c">Continuer →</button></div>`;
        snd.win(ok / N); $('c').addEventListener('click', () => { snd.click(); advance(); });
        return; }
      const fam = cmPick(), ex = fam.gen(R);
      const wrap = document.createElement('div'); box.innerHTML = ''; box.appendChild(wrap);
      askQuestion(wrap, {ex, tag: (fam.icone || '🧮') + ' ' + fam.nom, hint: fam.astuce, famId: fam.id, chrono: true, count: (i + 1) + ' / ' + N}, r => {
        cmRecord(fam.id, r.ok); logAnswer(r.ok); if (r.ok) ok++;
        i++; ask();
      });
    })();
  }
  function runReviews(box, list){
    let li = 0, totOk = 0, totN = 0;
    (function one(){
      if (li >= list.length){ bilan.rev = [totOk, totN]; advance(); return; }
      const skill = list[li]; let ok = 0;
      runSerie(box, skill, 3, {level: 2, adapt: false, recordSkill: false, chrono: true}, ({res}) => {
        ok = res.reduce((a, b) => a + b, 0); totOk += ok; totN += res.length;
        reviewResult(skill.id, ok, res.length);
        li++; one();
      });
    })();
  }
  function runFrontier(box, skill){
    const x = st(skill.id);
    function serie(){
      const tr = tauxRecent(skill.id);
      runSerie(box, skill, 10, {level: tr !== null && tr >= .8 ? 2 : 1, onMastered: () => { confetti(true); snd.win(1); }}, ({res}) => {
        bilan.sk = [res.reduce((a, b) => a + b, 0), res.length]; advance();
      });
    }
    if (x.n === 0 || !x.lu){
      box.innerHTML = `<section class="card"><p class="k">Nouvelle compétence</p><h2>${esc(skill.titre)}</h2>
        <div class="lecon">${skill.lecon || ''}</div>
        <button class="primary" id="go">J'ai lu — aux exercices →</button></section>`;
      x.lu = true; save();
      $('go').addEventListener('click', () => { snd.click(); serie(); });
    } else serie();
  }
  function runErrRedo(box, errs){
    let i = 0, ok = 0;
    (function one(){
      if (i >= errs.length){ bilan.err = [ok, errs.length]; advance(); return; }
      const e = errs[i];
      const wrap = document.createElement('div'); box.innerHTML = ''; box.appendChild(wrap);
      askQuestion(wrap, {ex: {q: e.q, a: e.a, accept: null, choix: e.choix, expl: e.expl}, tag: '📕 Cahier d\'erreurs', chrono: false, count: (i + 1) + ' / ' + errs.length}, r => {
        logAnswer(r.ok);
        if (r.ok){ ok++; e.redo = (e.redo || 0) + 1; if (e.redo >= 2) S.erreurs = S.erreurs.filter(x => x !== e); }
        else e.redo = 0;
        save(); i++; one();
      });
    })();
  }
  function finale(){
    const j = jToday(); j.seance = true; save();
    const tot = [bilan.cm, bilan.rev, bilan.sk, bilan.err].reduce((a, x) => [a[0] + x[0], a[1] + x[1]], [0, 0]);
    const p = tot[1] ? tot[0] / tot[1] : 0;
    app().innerHTML = `<section class="card fin-card">
      <p class="k">Séance terminée</p>
      <div class="score">${tot[0]} / ${tot[1]}</div>
      <p class="msg">🔥 Série : ${streak()} jour${streak() > 1 ? 's' : ''} · ⛰️ ${altitude()} m</p>
      <p class="msg">${p >= .9 ? 'Journée de très haut niveau. À demain, même heure — la montagne t\'attend.' : p >= .7 ? 'Solide. Tes erreurs sont dans le cahier : elles reviendront jusqu\'à disparaître.' : 'L\'important, c\'est d\'être venu. Demain on consolide — c\'est comme ça qu\'on avance vraiment.'}</p>
      <div class="row" style="justify-content:center">
        <button class="primary" id="home">Tableau de bord</button>
      </div></section>`;
    snd.win(p); if (p >= .8) confetti(p >= .95);
    $('home').addEventListener('click', () => { snd.click(); nav('accueil'); });
  }
  next();
}

/* ---------- calcul mental seul ---------- */
function vCalculMental(only){
  const fams = only ? CM_FAMS.filter(f => f.id === only) : CM_FAMS;
  const titre = only ? (fams[0].icone + ' ' + fams[0].nom) : '🧮 Calcul mental — mix complet';
  const N = only ? 10 : 20;
  let i = 0, ok = 0; const t0 = performance.now();
  app().innerHTML = `<section class="card"><h2>${esc(titre)} — sprint de ${N}</h2>
    <p class="muted small">${only ? esc(fams[0].astuce) : "Objectif : moins de 4 secondes par question. La technique s'affiche sous chaque calcul — applique-la, ne calcule pas « à l'ancienne »."}</p>
    ${only ? `<button class="ghost" id="voir-methode" style="margin-top:.5rem">📖 Revoir la méthode</button>` : ''}
  </section><div id="zone"></div>`;
  if (only) $('voir-methode').addEventListener('click', () => { snd.click(); vTechniques(only); });
  const box = $('zone');
  (function ask(){
    if (i >= N){
      const secs = Math.round((performance.now() - t0) / 1000);
      let recordTxt = '';
      if (!only){
        const best = S.cm.best;
        const better = !best || ok > best.ok || (ok === best.ok && secs < best.secs);
        if (better){ S.cm.best = {ok, secs, date: Date.now()}; save(); recordTxt = ' — 🏆 nouveau record !'; if (ok >= N * .9) confetti(false); }
        else if (best) recordTxt = ` · record : ${best.ok}/${N} en ${best.secs} s`;
      } else if (ok === N) confetti(false);
      box.innerHTML = `<div class="card fin-card"><div class="score">${ok} / ${N}</div>
        <p class="msg">en ${secs} s (${(secs / N).toFixed(1)} s/question)${recordTxt}</p>
        <div class="row" style="justify-content:center"><button class="primary" id="re">Rejouer</button>
        <button class="ghost" id="tech">⚡ Techniques</button>
        <button class="ghost" id="home">Tableau de bord</button></div></div>`;
      snd.win(ok / N);
      $('re').addEventListener('click', () => { snd.click(); vCalculMental(only); });
      $('tech').addEventListener('click', () => { snd.click(); nav('techniques'); });
      $('home').addEventListener('click', () => { snd.click(); nav('accueil'); });
      return;
    }
    const fam = only ? fams[0] : cmPick(), ex = fam.gen(R);
    const wrap = document.createElement('div'); box.innerHTML = ''; box.appendChild(wrap);
    askQuestion(wrap, {ex, tag: (fam.icone || '🧮') + ' ' + fam.nom, hint: fam.astuce, famId: fam.id, chrono: true, count: (i + 1) + ' / ' + N}, r => {
      cmRecord(fam.id, r.ok); logAnswer(r.ok); if (r.ok) ok++; i++; ask();
    });
  })();
}

/* ---------- techniques de calcul mental ---------- */
function vTechniques(openId){
  const stat = fid => { const s = S.cm.fam[fid]; return s && s.n ? Math.round(100 * s.ok / s.n) : null; };
  let html = `<section class="card"><h2>⚡ Les techniques de calcul mental</h2>
    <p class="muted small">${CM_FAMS.length} méthodes de calculateur rapide, une par type de calcul. Elles s'affichent aussi en indice pendant tes sprints. Entraîne-toi technique par technique jusqu'à ce que le geste devienne automatique.</p>
    <div class="row" style="margin-top:.7rem"><button class="primary" id="mix">🧮 Sprint mix complet (20)</button></div>
  </section>`;
  for (const cat of CM_CATS){
    html += `<p class="k" style="margin:1.3rem 0 .4rem">${esc(cat)}</p>`;
    for (const f of CM_FAMS.filter(x => x.cat === cat)){
      const pct = stat(f.id);
      html += `<section class="card" style="margin:.5rem 0">
        <details ${openId === f.id ? 'open' : ''} data-fam="${f.id}">
          <summary style="cursor:pointer;display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
            <span style="font-size:1.15rem">${f.icone}</span>
            <strong>${esc(f.nom)}</strong>
            ${pct !== null ? `<span class="pill">${pct} % de réussite</span>` : ''}
          </summary>
          <p class="hint-line" style="margin:.6rem 0">💡 ${esc(f.astuce)}</p>
          <div class="lecon">${f.methode}</div>
          <div class="row"><button class="primary" data-train="${f.id}">S'entraîner sur cette technique (10) →</button></div>
        </details>
      </section>`;
    }
  }
  app().innerHTML = html;
  $('mix').addEventListener('click', () => { snd.click(); vCalculMental(); });
  document.querySelectorAll('[data-train]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); snd.click(); vCalculMental(b.dataset.train);
  }));
  document.querySelectorAll('[data-fam] summary').forEach(s => s.addEventListener('click', () => snd.click()));
  if (openId){ const el = document.querySelector(`[data-fam="${openId}"]`); if (el) el.scrollIntoView({block: 'start'}); }
}

/* ---------- test hebdo ---------- */
function vTest(){
  const pool = SKILLS.filter(s => st(s.id).n > 0 || st(s.id).mastered);
  if (pool.length < 3){
    app().innerHTML = `<section class="card"><h2>📅 Test hebdomadaire</h2>
      <p>Le test se débloque quand tu as travaillé au moins 3 compétences. Commence par quelques séances — il t'attendra dimanche !</p>
      <button class="ghost" id="home">← Retour</button></section>`;
    $('home').addEventListener('click', () => { snd.click(); nav('accueil'); });
    return;
  }
  const N = Math.min(20, pool.length * 3);
  const recent = pool.slice().sort((a, b) => (st(b.id).masteredAt || 0) - (st(a.id).masteredAt || 0));
  const picks = [];
  for (let i = 0; i < N; i++){
    const src = (i % 5 < 3 && recent.length) ? recent[i % Math.min(recent.length, 6)] : R.pick(pool);
    picks.push(src);
  }
  let i = 0, ok = 0; const perSkill = {};
  app().innerHTML = `<section class="card"><h2>📅 Test hebdomadaire — ${N} questions</h2><p class="muted small">Conditions réelles : pas de leçon, on enchaîne. Objectif 90 %.</p></section><div id="zone"></div>`;
  const box = $('zone');
  (function ask(){
    if (i >= N){
      const p = ok / N;
      S.tests.push({date: Date.now(), ok, n: N}); if (S.tests.length > 60) S.tests.shift();
      Object.entries(perSkill).forEach(([sid, r]) => { if (r[0] / r[1] < .6){ const x = st(sid); if (x.mastered) { x.fragile = true; x.due = Date.now(); } } });
      save();
      box.innerHTML = `<div class="card fin-card"><div class="score">${ok} / ${N}</div>
        <p class="msg">${p >= .9 ? '🏆 Objectif atteint — semaine validée, sans discussion.' : p >= .7 ? 'Bien — les compétences ratées repassent en révision prioritaire.' : 'Précieux : le test a révélé les points fragiles. Ils reviennent en révision dès demain — c\'est exactement à ça qu\'il sert.'}</p>
        <div class="row" style="justify-content:center"><button class="primary" id="home">Tableau de bord</button></div></div>`;
      snd.win(p); if (p >= .9) confetti(true);
      $('home').addEventListener('click', () => { snd.click(); nav('accueil'); });
      return;
    }
    const skill = picks[i], ex = genFor(skill, 2);
    const wrap = document.createElement('div'); box.innerHTML = ''; box.appendChild(wrap);
    askQuestion(wrap, {ex, tag: skill.titre, chrono: true, count: (i + 1) + ' / ' + N}, r => {
      logAnswer(r.ok); if (r.ok) ok++;
      (perSkill[skill.id] = perSkill[skill.id] || [0, 0])[1]++;
      if (r.ok) perSkill[skill.id][0]++;
      if (!r.ok){ S.erreurs.unshift({sid: skill.id, q: r.ex.q, a: r.ex.a, given: r.given, expl: r.ex.expl || '', choix: r.ex.choix || null, ts: Date.now(), redo: 0}); save(); }
      i++; ask();
    });
  })();
}

/* ---------- cahier d'erreurs ---------- */
function vErreurs(){
  const list = S.erreurs.slice(0, 40);
  app().innerHTML = `<section class="card"><h2>📕 Le cahier d'erreurs</h2>
    <p class="muted small">Chaque erreur est notée ici automatiquement (règle n°2). Refais-la correctement <strong>deux fois</strong> et elle disparaît. Le coach t'en ressert aussi en fin de séance.</p>
    ${list.length ? `<button class="primary" id="redo-all" style="margin-top:.4rem">Tout refaire maintenant (${Math.min(list.length, 10)})</button>` : ''}
  </section>
  <div id="zone">${list.length ? list.map(e => {
    const skill = SKILLS.find(s => s.id === e.sid);
    return `<div class="err"><p class="q">${esc(e.q)}</p>
      <p class="rep">Ta réponse : <s>${esc(e.given)}</s> · La bonne : <b>${esc(e.a)}</b></p>
      <p class="meta">${skill ? esc(skill.titre) + ' · ' : ''}${new Date(e.ts).toLocaleDateString('fr-FR')} · refaite ${e.redo || 0}/2</p></div>`;
  }).join('') : '<div class="card"><p>Aucune erreur en attente. Soit tu es très fort, soit il est temps de faire une séance… 😄</p></div>'}</div>`;
  const btn = $('redo-all');
  if (btn) btn.addEventListener('click', () => {
    snd.click();
    const errs = S.erreurs.filter(e => e.redo < 2).slice(0, 10);
    let i = 0, ok = 0; const box = $('zone');
    (function one(){
      if (i >= errs.length){
        box.innerHTML = `<div class="card fin-card"><div class="score">${ok} / ${errs.length}</div>
          <p class="msg">${ok === errs.length ? 'Cahier nettoyé comme un pro.' : 'Les survivantes reviendront — on ne lâche rien.'}</p>
          <button class="primary" id="back">← Cahier</button></div>`;
        snd.win(errs.length ? ok / errs.length : 1);
        $('back').addEventListener('click', () => { snd.click(); vErreurs(); });
        return;
      }
      const e = errs[i];
      const wrap = document.createElement('div'); box.innerHTML = ''; box.appendChild(wrap);
      askQuestion(wrap, {ex: {q: e.q, a: e.a, accept: null, choix: e.choix, expl: e.expl}, tag: '📕 À refaire', chrono: false, count: (i + 1) + ' / ' + errs.length}, r => {
        logAnswer(r.ok);
        if (r.ok){ ok++; e.redo = (e.redo || 0) + 1; if (e.redo >= 2) S.erreurs = S.erreurs.filter(x => x !== e); }
        else e.redo = 0;
        save(); i++; one();
      });
    })();
  });
}

/* ---------- coach (stats) ---------- */
function vCoach(){
  const msgs = coachMessages();
  const totalA = Object.values(S.journal).reduce((a, j) => a + j.a, 0);
  const totalOk = Object.values(S.journal).reduce((a, j) => a + j.ok, 0);
  const days = Object.keys(S.journal).filter(dayDone).length;
  const lastTests = S.tests.slice(-5).reverse();
  let bars = '';
  for (let p = 1; p <= 7; p++){
    const list = SKILLS.filter(s => s.phase === p); if (!list.length) continue;
    const done = list.filter(s => st(s.id).mastered).length;
    bars += `<div class="bar-row"><span class="lab">Phase ${p} · ${esc(PHASES[p].nom)}</span>
      <span class="pbar"><i style="width:${Math.round(100 * done / list.length)}%"></i></span>
      <span class="val">${done}/${list.length}</span></div>`;
  }
  const weak = SKILLS.filter(s => { const t = tauxRecent(s.id); return t !== null && t < .7 && st(s.id).n >= 5; })
    .sort((a, b) => tauxRecent(a.id) - tauxRecent(b.id)).slice(0, 5);
  app().innerHTML = `
  <section class="card"><h2>🤖 Ton coach adaptatif</h2>
    <p class="muted small">Un algorithme local (il fonctionne même hors-ligne) : il mesure chaque réponse, applique la règle des 90 %, programme tes révisions espacées et construit ta séance. Pour une explication détaillée d'une notion, ouvre une session avec Claude — ton vrai prof — qui a conçu ce programme.</p>
    ${msgs.map(m => `<div class="coach-msg"><p>${m.t}</p>${m.tech ? `<p><button class="ghost small" data-tech="${m.tech}">⚡ Ouvrir la technique</button></p>` : ''}</div>`).join('')}
  </section>
  <section class="card"><h2>Progression par phase</h2><div class="bars">${bars}</div></section>
  <section class="card"><h2>Tes chiffres</h2>
    <div class="stats">
      <div class="stat"><b>${totalA}</b><span>réponses au total</span></div>
      <div class="stat"><b>${totalA ? Math.round(100 * totalOk / totalA) : 0} %</b><span>de réussite globale</span></div>
      <div class="stat"><b>${days}</b><span>jours travaillés</span></div>
      <div class="stat"><b>${S.cm.best ? S.cm.best.ok + '/20' : '—'}</b><span>record calcul mental</span></div>
    </div>
    ${lastTests.length ? `<p class="k" style="margin-top:.8rem">Derniers tests hebdo</p>
      <p>${lastTests.map(t => `<span class="badge">${new Date(t.date).toLocaleDateString('fr-FR')} · <b>${t.ok}/${t.n}</b></span>`).join('')}</p>` : ''}
    ${weak.length ? `<p class="k" style="margin-top:.8rem">À consolider en priorité</p>
      ${weak.map(s => `<button class="skill" data-skill="${s.id}"><span class="num">${s.phase}.${s.ordre}</span><span class="t">${esc(s.titre)}</span><span class="etat">${Math.round(tauxRecent(s.id) * 100)} %</span></button>`).join('')}` : ''}
  </section>`;
  document.querySelectorAll('[data-skill]').forEach(b => b.addEventListener('click', () => { snd.click(); vSkill(b.dataset.skill); }));
  document.querySelectorAll('[data-tech]').forEach(b => b.addEventListener('click', () => { snd.click(); currentView = 'techniques';
    document.querySelectorAll('.nav button').forEach(x => x.classList.toggle('active', x.dataset.v === 'techniques'));
    vTechniques(b.dataset.tech); }));
}

/* ---------- règles ---------- */
function vRegles(){
  app().innerHTML = `
  <section class="card"><h2>📜 Les 5 règles de la méthode</h2>
    <div class="lecon">
    <div class="box retenir"><p class="box-t">Règle 1 · Les 90 %</p><p>On ne passe jamais à la suite tant qu'une compétence n'est pas réussie à <mark>9 sur 10</mark>. L'app verrouille les phases pour toi : impossible de tricher avec soi-même.</p></div>
    <div class="box retenir"><p class="box-t">Règle 2 · Le cahier d'erreurs</p><p>Chaque erreur entre automatiquement dans ton <mark>cahier d'erreurs</mark>. Elle n'en sort qu'après avoir été refaite juste <mark>deux fois</mark>. Tes erreurs sont ta mine d'or.</p></div>
    <div class="box retenir"><p class="box-t">Règle 3 · Le calcul mental quotidien</p><p><mark>Chaque séance commence par l'échauffement chrono</mark>. Objectif : moins de 4 secondes par réponse. Mais attention : on ne calcule pas « à l'ancienne » — on applique une <mark>technique</mark>. L'onglet ⚡ Techniques en contient une pour chaque type de calcul, et elle s'affiche en indice pendant l'entraînement. C'est ce qui fera la différence aux concours SESAME et ACCÈS.</p></div>
    <div class="box retenir"><p class="box-t">Règle 4 · Refaire, ne jamais relire</p><p>Ici, on ne « relit » pas : on répond, encore et encore. Les exercices sont <mark>générés à l'infini</mark> — jamais deux fois le même, jusqu'à l'automatisme.</p></div>
    <div class="box retenir"><p class="box-t">Règle 5 · La répétition espacée</p><p>Une compétence validée revient <mark>2, 4, 8, 16, 32 jours</mark> plus tard. Si elle a rouillé, le coach la remet en révision. C'est comme ça que le cerveau retient à vie.</p></div>
    <div class="box astuce"><p class="box-t">Le rythme</p><p>6 jours sur 7, 30 à 60 minutes : échauffement → révisions → nouvelle compétence → erreurs. Le dimanche, <mark>test hebdomadaire</mark> de 20 questions. La régularité bat le talent, toujours.</p></div>
    <div class="box astuce"><p class="box-t">Le cap</p><p>Phase après phase : 6e → 3e → seconde → première → terminale → concours. Destination : <mark>excellente moyenne en STMG</mark>, <mark>SESAME</mark> et <mark>ACCÈS</mark> (≈ avril 2027), bac (juin 2027). Ton altitude sur la montagne = ta progression réelle.</p></div>
    </div>
  </section>`;
}

/* ---------- passerelle pour l'assistant ---------- */
window.ASSIST_GO = function(quoi, id){
  snd.click();
  if (quoi === 'skill'){ currentView = 'programme';
    document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.v === 'programme'));
    vSkill(id); }
  else { currentView = 'techniques';
    document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.dataset.v === 'techniques'));
    vTechniques(id); }
  scrollTo({top: 0});
};

/* ---------- init ---------- */
function initSnd(){
  const b = $('snd-btn');
  const render = () => { b.textContent = S.son ? '🔊' : '🔇'; b.classList.toggle('off', !S.son); };
  b.addEventListener('click', () => { S.son = !S.son; save(); render(); if (S.son) snd.pop(); });
  render();
}
document.querySelectorAll('.nav button').forEach(b => b.addEventListener('click', () => { snd.click(); nav(b.dataset.v); }));
initSnd();
nav('accueil');
