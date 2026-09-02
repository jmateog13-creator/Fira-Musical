/* ============================================================
   FIRA MUSICAL — Estadístiques agregades (localStorage)
   Mode docent: registra esdeveniments per a anàlisi posterior.
   ============================================================ */

// PONT AULATECH · contracte v1, inline (compartit per les 5 atraccions, no
// cal tocar 5 index.html per afegir un <script src> més).
if (!window.AulaTechBridge) {
  window.AulaTechBridge = (function (w) {
    const clamp01 = (v) => { v = Number(v); return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0; };
    const int = (v) => { v = Math.round(Number(v)); return Number.isFinite(v) && v > 0 ? v : 0; };
    const sent = new Set();
    return {
      t0: Date.now(),
      startClock() { this.t0 = Date.now(); sent.clear(); },
      send(gameId, f) {
        f = f || {};
        const data = {
          p_juego_id: String(gameId || 'fira-musical'), p_bloque: 'general', p_tema: null,
          p_completado: !!f.completat, p_precision: clamp01(f.precisio),
          p_errores: int(f.errors), p_racha_max: int(f.rachaMax),
          p_tiempo_ms: int(f.tempsMs === undefined ? Date.now() - this.t0 : f.tempsMs),
          p_perfecto: !!f.perfecte,
        };
        try { w.parent.postMessage({ source: 'aulatech', action: 'GAME_END', v: 1, data }, '*'); }
        catch (e) { /* standalone */ }
        return data;
      },
      sendOnce(gameId, f) {
        const k = String(gameId);
        if (sent.has(k)) return null;
        sent.add(k);
        return this.send(k, f);
      },
    };
  })(window);
}

window.FiraStats = (function() {

  const KEY = 'fira_musical_stats';

  const PLANTILLA_JOC = () => ({
    partides: 0,
    encerts: 0,
    errors: 0,
    nivellsCompletats: 0,
    ultimaSessio: null,
    millorEstrelles: 0,
    tempsTotal: 0
  });

  const JOCS = ['derby', 'vident', 'timbalers', 'pesca', 'gran_tir'];

  // La Fira és un "examen" multi-atracció: la victòria és GLOBAL (les 5
  // atraccions visitades, no una atracció individual).
  function checkFiraGlobal(dades) {
    if (JOCS.every(id => dades[id].nivellsCompletats > 0)) {
      window.AulaTechBridge.sendOnce('fira-musical', { completat: true });
    }
  }

  function carregar() {
    try {
      const dades = JSON.parse(localStorage.getItem(KEY)) || {};
      JOCS.forEach(id => {
        if (!dades[id]) dades[id] = PLANTILLA_JOC();
      });
      if (!dades._meta) dades._meta = { creat: new Date().toISOString() };
      return dades;
    } catch {
      const buit = { _meta: { creat: new Date().toISOString() } };
      JOCS.forEach(id => buit[id] = PLANTILLA_JOC());
      return buit;
    }
  }

  function desar(dades) {
    localStorage.setItem(KEY, JSON.stringify(dades));
  }

  function registrar(idJoc, event, info = {}) {
    if (!JOCS.includes(idJoc)) return;
    const dades = carregar();
    const joc = dades[idJoc];
    const ara = new Date().toISOString();

    switch (event) {
      case 'partida_iniciada':
        joc.partides++;
        joc.ultimaSessio = ara;
        break;
      case 'encert':
        joc.encerts++;
        break;
      case 'error':
        joc.errors++;
        break;
      case 'nivell_completat':
        joc.nivellsCompletats++;
        checkFiraGlobal(dades);
        break;
      case 'estrelles_actualitzades':
        if (info.estrelles > joc.millorEstrelles) joc.millorEstrelles = info.estrelles;
        break;
    }
    desar(dades);
  }

  function obtenir() {
    const dades = carregar();
    const resum = {};
    JOCS.forEach(id => {
      const j = dades[id];
      const total = j.encerts + j.errors;
      resum[id] = {
        ...j,
        precisio: total > 0 ? Math.round((j.encerts / total) * 100) : null
      };
    });
    resum._meta = dades._meta;
    return resum;
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  function exportarCSV() {
    const dades = obtenir();
    const files = [
      ['Joc', 'Partides', 'Encerts', 'Errors', 'Precisió %', 'Nivells completats', 'Millor estrelles', 'Última sessió']
    ];
    const noms = {
      derby: 'Derby de Notes',
      vident: 'La Vident',
      timbalers: 'Timbalers',
      pesca: "Pesca d'Ànecs",
      gran_tir: 'Gran Tir'
    };
    JOCS.forEach(id => {
      const j = dades[id];
      files.push([
        noms[id],
        j.partides,
        j.encerts,
        j.errors,
        j.precisio !== null ? j.precisio : '—',
        j.nivellsCompletats,
        j.millorEstrelles,
        j.ultimaSessio || '—'
      ]);
    });
    return files.map(f => f.join(';')).join('\n');
  }

  return { registrar, obtenir, reset, exportarCSV, JOCS };
})();

/* ── Sortida directa quan el joc s'obre en pestanya pròpia ───────────────────
   Dins de l'app el joc viu en un iframe i el pare (Viewer) recull el missatge.
   Però el Gimnàs obre els jocs amb target="_blank": allà `parent` és un mateix,
   el postMessage s'envia a si mateix i no arriba enlloc.
   Com que tot es serveix des del mateix origen, la sessió de l'alumne ja és al
   localStorage. Fem servir fetch contra l'API REST i NO el client del CDN:
   així no hi ha llibreria externa que carregui tard ni cursa amb la sessió.
   La clau és la publicable (ja viatja al bundle de l'app); qui protegeix les
   dades és l'RLS i que submit_game_result() decideix el pagament al servidor. */
(function () {
  if (window.parent !== window) return;   // dins de l'app: ja ho recull el pare
  if (window.__atDirecte) return;         // ja escoltat: mai dues vegades
  window.__atDirecte = true;
  var SB = 'https://dxpdciplsxjmtfhnbqao.supabase.co';
  var AK = 'sb_publishable_nOg_fx9ai3hbMOD4-ZI-Sg_V9i9VZhW';
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.source !== 'aulatech' || d.action !== 'GAME_END' || !d.data) return;
    var raw = localStorage.getItem('sb-dxpdciplsxjmtfhnbqao-auth-token');
    if (!raw) return;                     // ningú connectat: no hi ha res a reportar
    var tok; try { tok = JSON.parse(raw).access_token; } catch (_) { return; }
    if (!tok) return;
    fetch(SB + '/rest/v1/rpc/submit_game_result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: AK, Authorization: 'Bearer ' + tok },
      body: JSON.stringify(d.data),
    }).catch(function () { /* sense xarxa: es perd la partida, però el joc no es trenca */ });
  });
})();
