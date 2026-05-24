/* ============================================================
   FIRA MUSICAL — Estadístiques agregades (localStorage)
   Mode docent: registra esdeveniments per a anàlisi posterior.
   ============================================================ */

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
