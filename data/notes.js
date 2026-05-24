/* ============================================================
   FIRA MUSICAL — Pool de NOTES MUSICALS
   Font: 5.Documentacion/03_Reglas_Temáticas_9Grid/Tema_02_Notes_Musicals.md
   Clau de Sol, rang pràctic 1r-2n ESO (Do4 → La5).
   ============================================================ */

window.FIRA_NOTES = (function() {

  const POSICIONS_CLAU_SOL = Object.freeze({
    DO4:  { y: -2,  enLinia: false, addicional: 'sota' },
    RE4:  { y: -1,  enLinia: false, addicional: 'sota' },
    MI4:  { y:  0,  enLinia: true,  linia: 1 },
    FA4:  { y:  0.5, enLinia: false },
    SOL4: { y:  1,  enLinia: true,  linia: 2 },
    LA4:  { y:  1.5, enLinia: false },
    SI4:  { y:  2,  enLinia: true,  linia: 3 },
    DO5:  { y:  2.5, enLinia: false },
    RE5:  { y:  3,  enLinia: true,  linia: 4 },
    MI5:  { y:  3.5, enLinia: false },
    FA5:  { y:  4,  enLinia: true,  linia: 5 },
    SOL5: { y:  4.5, enLinia: false, addicional: 'sobre' },
    LA5:  { y:  5,  enLinia: false, addicional: 'sobre' }
  });

  const NOTES = [
    { id: 'DO4',  nom: 'Do',  midi: 60, hz: 261.63, octava: 4 },
    { id: 'RE4',  nom: 'Re',  midi: 62, hz: 293.66, octava: 4 },
    { id: 'MI4',  nom: 'Mi',  midi: 64, hz: 329.63, octava: 4 },
    { id: 'FA4',  nom: 'Fa',  midi: 65, hz: 349.23, octava: 4 },
    { id: 'SOL4', nom: 'Sol', midi: 67, hz: 392.00, octava: 4 },
    { id: 'LA4',  nom: 'La',  midi: 69, hz: 440.00, octava: 4 },
    { id: 'SI4',  nom: 'Si',  midi: 71, hz: 493.88, octava: 4 },
    { id: 'DO5',  nom: 'Do',  midi: 72, hz: 523.25, octava: 5 },
    { id: 'RE5',  nom: 'Re',  midi: 74, hz: 587.33, octava: 5 },
    { id: 'MI5',  nom: 'Mi',  midi: 76, hz: 659.25, octava: 5 },
    { id: 'FA5',  nom: 'Fa',  midi: 77, hz: 698.46, octava: 5 },
    { id: 'SOL5', nom: 'Sol', midi: 79, hz: 783.99, octava: 5 },
    { id: 'LA5',  nom: 'La',  midi: 81, hz: 880.00, octava: 5 }
  ].map(n => Object.freeze({ ...n, posicio: POSICIONS_CLAU_SOL[n.id] }));

  const NIVELLS = Object.freeze({
    1: { nom: 'Notes en línia',        filtre: n => n.posicio.enLinia && n.octava === 4 },
    2: { nom: 'Notes en espai',        filtre: n => !n.posicio.enLinia && !n.posicio.addicional && n.octava === 4 },
    3: { nom: 'Pentagrama complet',    filtre: n => !n.posicio.addicional },
    4: { nom: 'Amb línies addicionals', filtre: n => true }
  });

  function notesPerNivell(nivell) {
    const cfg = NIVELLS[nivell] || NIVELLS[3];
    return NOTES.filter(cfg.filtre);
  }

  function aleatoria(nivell = 3) {
    const pool = notesPerNivell(nivell);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function distractors(notaCorrecta, quantitat, nivell = 3) {
    // Filtrar per NOM (no per id) per evitar opcions visualment idèntiques
    // (p. ex. Mi4 i Mi5 generarien dos botons "Mi" indistingibles).
    const pool = notesPerNivell(nivell).filter(n => n.nom !== notaCorrecta.nom);
    // Eliminar duplicats per nom dins del pool de distractors
    const noms = new Set();
    const sensesDuplicats = [];
    [...pool].sort(() => Math.random() - 0.5).forEach(n => {
      if (!noms.has(n.nom)) { noms.add(n.nom); sensesDuplicats.push(n); }
    });
    return sensesDuplicats.slice(0, quantitat);
  }

  // Path SVG de la clau de Sol (treble clef estilitzada)
  function clauSolPath(xCentre, yLiniaSol, alturaTotal, color) {
    const escala = alturaTotal / 70;
    const cx = xCentre;
    const cy = yLiniaSol;
    return `<g transform="translate(${cx - 11 * escala} ${cy - 32 * escala}) scale(${escala})"
              fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 11 8
                       C 4 14, 4 28, 12 34
                       C 22 40, 26 28, 18 22
                       C 10 18, 8 32, 14 36
                       L 16 54
                       C 16 62, 8 62, 8 56" />
              <circle cx="14" cy="59" r="3" fill="${color}"/>
            </g>`;
  }

  function svgPentagrama(nota, opcions = {}) {
    const ample = opcions.ample || 220;
    const alt   = opcions.alt   || 140;
    const colorNota = opcions.colorNota || '#C8102E';
    const colorLinies = opcions.colorLinies || '#5A2A1C';
    const colorClau = opcions.colorClau || '#D4AF37';
    const cx    = ample / 2;
    const cyMi  = alt / 2;
    const sep   = 11;

    const xStart = 10, xEnd = ample - 14;

    const linies = [0, 1, 2, 3, 4].map(i => {
      const y = cyMi - i * sep;
      return `<line x1="${xStart}" y1="${y}" x2="${xEnd}" y2="${y}" stroke="${colorLinies}" stroke-width="1.6"/>`;
    }).join('');

    const yNota = cyMi - nota.posicio.y * sep;

    let addicionals = '';
    if (nota.posicio.addicional === 'sota') {
      for (let i = -1; i >= Math.floor(nota.posicio.y); i--) {
        const yLin = cyMi - i * sep;
        addicionals += `<line x1="${cx - 16}" y1="${yLin}" x2="${cx + 16}" y2="${yLin}" stroke="${colorLinies}" stroke-width="1.6"/>`;
      }
    } else if (nota.posicio.addicional === 'sobre') {
      for (let i = 5; i <= Math.ceil(nota.posicio.y); i++) {
        const yLin = cyMi - i * sep;
        addicionals += `<line x1="${cx - 16}" y1="${yLin}" x2="${cx + 16}" y2="${yLin}" stroke="${colorLinies}" stroke-width="1.6"/>`;
      }
    }

    // Clau de Sol al voltant de la 2a línia (G4 = y=1)
    const yLiniaSol = cyMi - 1 * sep;
    const clauSol = clauSolPath(28, yLiniaSol, sep * 7, colorClau);

    // Nota: cap ple amb pal (figura tipus negra)
    const cap = `<ellipse cx="${cx}" cy="${yNota}" rx="9" ry="6.5"
                  fill="${colorNota}" stroke="${colorNota}" stroke-width="1"
                  transform="rotate(-20 ${cx} ${yNota})"/>`;
    const palY1 = yNota - 2;
    const palY2 = yNota - 38;
    const pal = `<line x1="${cx + 8}" y1="${palY1}" x2="${cx + 8}" y2="${palY2}"
                  stroke="${colorNota}" stroke-width="2"/>`;

    return `<svg viewBox="0 0 ${ample} ${alt}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%">
      ${linies}${addicionals}${clauSol}${cap}${pal}
    </svg>`;
  }

  return {
    NOTES,
    NIVELLS,
    notesPerNivell,
    aleatoria,
    distractors,
    svgPentagrama
  };
})();
