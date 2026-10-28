/* ===== Mon dossier Parcoursup · deux fonctions IA optionnelles =====
   1. Lire un bulletin photographié (modèle de vision) ; 2. relire un texte (remarques, jamais de réécriture).
   Clé : celle déjà saisie par l'élève dans l'app STMG (stmg-cle-groq) ou dans l'app maths (mzs-cle-groq), lue dans
   localStorage et jamais écrite ailleurs. Aucune requête sans un geste explicite de l'élève. Aucune autre requête réseau.
   Constantes à garder alignées sur index.html (lignes GROQ_URL / VISION) : Groq retire un modèle tous les six mois environ. */
'use strict';
window.DOSSIER_IA = (function () {
  const E = window.DOSSIER_ETAT;
  const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const MODELE_TEXTE = 'openai/gpt-oss-120b';
  const VISION = ['qwen/qwen3.8-27b', 'qwen/qwen3.6-27b', 'meta-llama/llama-4-scout-17b-16e-instruct'];   // doc Groq Vision, 27/10/2026 : seul le premier est encore listé
  const COTE = 2000, QUALITE = 0.85;

  function dispo() { return !!E.cleIA(); }
  function enLigne() { return navigator.onLine !== false; }

  /* photo → JPEG réduit en mémoire (jamais stocké) */
  function reduire(file) {
    return new Promise(function (res, rej) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        try {
          const r = Math.min(1, COTE / Math.max(img.naturalWidth, img.naturalHeight));
          const w = Math.max(1, Math.round(img.naturalWidth * r)), hh = Math.max(1, Math.round(img.naturalHeight * r));
          const cv = document.createElement('canvas'); cv.width = w; cv.height = hh;
          const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, hh); g.drawImage(img, 0, 0, w, hh);
          URL.revokeObjectURL(url);
          res(cv.toDataURL('image/jpeg', QUALITE));
        } catch (e) { rej(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('IMAGE')); };
      img.src = url;
    });
  }
  function jsonDe(brut) {
    const t = String(brut || '').replace(/<think>[\s\S]*?<\/think>/g, '');
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a < 0 || b < a) throw new Error('JSON');
    return JSON.parse(t.slice(a, b + 1));
  }
  function erreurDe(statut, texte) {
    const e = new Error(statut === 401 ? 'CLE_INVALIDE' : statut === 429 ? 'QUOTA' : statut === 413 ? 'TROP_GROS' : 'HTTP ' + statut);
    e.statut = statut; e.detail = String(texte || '').slice(0, 300); return e;
  }
  async function appel(messages, extras, signal) {
    const cle = E.cleIA(); if (!cle) throw new Error('PAS_DE_CLE');
    if (!enLigne()) throw new Error('HORS_LIGNE');
    const body = Object.assign({ messages: messages, stream: false }, extras || {});
    const r = await fetch(GROQ_URL, { method: 'POST', signal: signal, headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + cle }, body: JSON.stringify(body) });
    if (!r.ok) { let t = ''; try { t = await r.text(); } catch (e) { } throw erreurDe(r.status, t); }
    const j = await r.json();
    const ch = j && j.choices && j.choices[0];
    return { texte: (ch && ch.message && ch.message.content) || '', fin: ch && ch.finish_reason };
  }
  function modeleInconnu(e) { return e.statut === 404 || ((e.statut === 400 || e.statut === 403) && /model|decommission|does not exist|not found|not supported|vision|image/i.test(e.detail || '')); }

  const SYS_BULLETIN = 'Tu lis la photo ou la capture d’écran d’un bulletin scolaire français (lycée). Tu réponds UNIQUEMENT par un objet JSON valide, sans texte autour. ' +
    'Format strict : {"periode":"T1|T2|T3|S1|S2|?","lignes":[{"matiere":"","coef":null,"moy":null,"classe":null,"min":null,"max":null,"rang":null,"effectif":null,"appreciation":""}],"moyenneGenerale":null,"moyenneClasse":null}. ' +
    'Les nombres gardent la virgule ou le point tels qu’écrits (chaînes acceptées), null si absent. Une ligne par matière, dans l’ordre du document. ' +
    'N’invente rien, n’arrondis rien, ne recopie ni le nom, ni la date de naissance, ni l’adresse de l’élève. Un chiffre douteux est suivi de (?).';
  async function lireBulletin(file, signal, surEtat) {
    const dataUrl = await reduire(file);
    const user = [{ type: 'text', text: 'Recopie ce bulletin dans le format JSON demandé.' }, { type: 'image_url', image_url: { url: dataUrl } }];
    const msgs = [{ role: 'system', content: SYS_BULLETIN }, { role: 'user', content: user }];
    let derniere = null;
    for (const modele of VISION) {
      let json = true, raisonne = true;
      for (let essai = 0; essai < 4; essai++) {
        const extras = { model: modele, max_completion_tokens: 3000, temperature: 0.2 };
        if (json) extras.response_format = { type: 'json_object' };
        if (raisonne) extras.reasoning_format = 'hidden';
        try {
          if (surEtat) surEtat('Lecture en cours' + (essai ? ' (nouvel essai)' : '') + '…');
          const r = await appel(msgs, extras, signal);
          const j = jsonDe(r.texte);
          E.S.ia.lecturesBulletin = (E.S.ia.lecturesBulletin || 0) + 1; E.sauver();
          return j;
        } catch (e) {
          derniere = e;
          if (e.name === 'AbortError') throw e;
          if (e.message === 'PAS_DE_CLE' || e.message === 'HORS_LIGNE' || e.message === 'CLE_INVALIDE') throw e;
          if (e.statut === 400 && /reasoning/i.test(e.detail || '') && raisonne) { raisonne = false; continue; }
          if (e.statut === 400 && /json|response_format/i.test(e.detail || '') && json) { json = false; continue; }
          if (modeleInconnu(e)) break;
          if (e.message === 'JSON' && essai < 1) continue;
          if (e.message === 'QUOTA') { const m = /try again in (?:(\d+)m)?([\d.]+)s/i.exec(e.detail || ''); const s = m ? (+(m[1] || 0)) * 60 + parseFloat(m[2]) : 0; if (s > 0 && s <= 60 && essai < 2) { if (surEtat) surEtat('Quota atteint : nouvel essai dans ' + Math.ceil(s) + ' s…'); await new Promise(function (r) { setTimeout(r, s * 1000 + 500); }); continue; } }
          throw e;
        }
      }
    }
    throw derniere || new Error('MODELE');
  }

  const SYS_RELECTURE = 'Tu relis un texte qu’un lycéen de terminale STMG (18 ans, Bordeaux) écrira dans son dossier Parcoursup. Tu tutoies, tu es direct, chaleureux, jamais condescendant. ' +
    'RÈGLE ABSOLUE : tu ne réécris JAMAIS le texte, tu ne proposes JAMAIS de phrase de remplacement, pas même un exemple de formulation. Tu donnes seulement 3 à 6 remarques courtes (une phrase chacune) : ce qui manque (fait chiffré, date, lien avec la formation), ce qui est flou, ce qui est trop long, une faute récurrente. ' +
    'Tu réponds UNIQUEMENT par un objet JSON {"remarques":["…","…"]}. Français uniquement, nombres à la française, jamais de LaTeX.';
  async function relire(texte, rubrique, contexte, signal) {
    const user = 'RUBRIQUE : ' + rubrique + (contexte ? '\nCONTEXTE : ' + contexte : '') + '\nLIMITE : 1 500 caractères.\nTEXTE DE L’ÉLÈVE :\n' + texte;
    const r = await appel([{ role: 'system', content: SYS_RELECTURE }, { role: 'user', content: user }], { model: MODELE_TEXTE, max_completion_tokens: 900, temperature: 0.3, reasoning_effort: 'low', response_format: { type: 'json_object' } }, signal);
    const j = jsonDe(r.texte);
    let rem = Array.isArray(j.remarques) ? j.remarques.map(function (x) { return String(x || '').trim(); }).filter(Boolean).slice(0, 6) : [];
    /* garde-fou : jamais un texte de remplacement (réponse trop longue ou qui recopie le texte source) */
    const total = rem.join(' ');
    const src = window.DOSSIER_CALC.sansAccent(texte);
    const copie = rem.some(function (x) { const t = window.DOSSIER_CALC.sansAccent(x); return t.length > 60 && src.indexOf(t.slice(0, 60)) !== -1; });
    const recouvre = total.length > 0 && texte.length > 0 && total.length > 0.4 * texte.length && total.length > 400;
    if (total.length > 900 || copie || recouvre) throw new Error('REECRITURE');
    E.S.ia.relectures = (E.S.ia.relectures || 0) + 1; E.sauver();
    return rem;
  }
  function message(e) {
    const m = e && e.message || '';
    if (m === 'PAS_DE_CLE') return 'Pour utiliser l’IA, ajoute ta clé dans les réglages IA de l’app (accueil des exercices, bouton Réglages IA).';
    if (m === 'HORS_LIGNE' || /Failed to fetch|Load failed|NetworkError/i.test(m)) return 'Hors ligne : cette fonction sera possible une fois connecté.';
    if (m === 'CLE_INVALIDE') return 'Clé IA refusée : corrige-la dans les réglages IA de l’app.';
    if (m === 'QUOTA') return 'Quota de la clé atteint : réessaie dans une minute.';
    if (m === 'REECRITURE') return 'L’IA a tenté de réécrire ton texte : réponse écartée. Réessaie, ou relis-le toi-même avec le plan en 4 points.';
    if (m === 'IMAGE') return 'Je n’ai pas pu ouvrir cette image. Essaie une photo JPEG ou une capture d’écran.';
    if (m === 'MODELE') return 'Le modèle de lecture n’est plus disponible chez le fournisseur : l’app sera mise à jour. Saisis le bulletin à la main en attendant.';
    if (e && e.name === 'AbortError') return 'Lecture annulée.';
    return 'Je n’ai pas réussi à lire ce bulletin. Réessaie avec plus de lumière, ou saisis-le à la main.';
  }
  return { dispo: dispo, enLigne: enLigne, lireBulletin: lireBulletin, relire: relire, message: message, GROQ_URL: GROQ_URL, VISION: VISION };
})();
