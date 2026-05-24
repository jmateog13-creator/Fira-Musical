/* ============================================================
   FIRA MUSICAL — Pool de FIGURES RÍTMIQUES
   Font: 5.Documentacion/03_Reglas_Temáticas_9Grid/Tema_01_Figures_Ritmiques.md
   Rang 1r-2n ESO: redona → semicorxera + silencis + puntet.
   ============================================================ */

window.FIRA_FIGURES = (function() {

  const FIGURES = Object.freeze([
    {
      id: 'rodona', nom: 'Rodona', simbol: '𝅝', valor: 4,
      silenci: '𝄻', nomSilenci: 'Silenci de rodona',
      pistes: [
        "Sóc la més llarga de les figures comunes.",
        "Es dibuixa com un cap obert, sense pal.",
        "Duro l'equivalent a 4 negres.",
        "En un compàs de 4/4, jo sola l'omplo sencer.",
        "M'utilitzen sovint a finals de cançó, per mantenir la nota llarga.",
        "Si fos un so, faria «aaaaaaa…»: quatre temps sencers."
      ]
    },
    {
      id: 'blanca', nom: 'Blanca', simbol: '𝅗𝅥', valor: 2,
      silenci: '𝄼', nomSilenci: 'Silenci de blanca',
      pistes: [
        "Tinc el cap obert i un pal.",
        "Duro la meitat d'una rodona.",
        "Equivalo a 2 negres.",
        "En un 4/4 caben exactament 2 com jo.",
        "Sóc el cor del vals: el pas-llarg de l'1-2-3.",
        "A «Cumpleaños feliz», l'última nota llarga sóc jo."
      ]
    },
    {
      id: 'negra', nom: 'Negra', simbol: '♩', valor: 1,
      silenci: '𝄽', nomSilenci: 'Silenci de negra',
      pistes: [
        "Sóc la unitat bàsica de pulsació.",
        "Tinc el cap negre i un pal.",
        "Duro 1 pulsació.",
        "En un 4/4 caben 4 figures com jo.",
        "El batec del cor: tum-tum-tum-tum. Cada tum sóc jo.",
        "El metrònom marca el meu tempo: 60 sóc un tic per segon."
      ]
    },
    {
      id: 'corxera', nom: 'Corxera', simbol: '♪', valor: 0.5,
      silenci: '𝄾', nomSilenci: 'Silenci de corxera',
      pistes: [
        "Tinc cap negre, pal i una banderola.",
        "Duro la meitat d'una negra.",
        "Quan en sóc dues juntes, ens uneix una barra.",
        "En un 4/4 caben 8 figures com jo.",
        "Sóc l'ànima del swing del jazz: ta-tà ta-tà.",
        "Si dius «pa-tà pa-tà pa-tà pa-tà», cada síl·laba sóc jo."
      ]
    },
    {
      id: 'semicorxera', nom: 'Semicorxera', simbol: '𝅘𝅥𝅯', valor: 0.25,
      silenci: '𝄿', nomSilenci: 'Silenci de semicorxera',
      pistes: [
        "Tinc cap negre, pal i dues banderoles.",
        "Duro la meitat d'una corxera.",
        "Equivalo a un quart de negra.",
        "En un 4/4 caben 16 figures com jo.",
        "Quan vaig en grup de quatre, ens uneixen dues barres.",
        "Sóc el sucre del trap i el reggaeton: tic-tic-tic-tic dins una negra."
      ]
    }
  ]);

  const MAPA = Object.freeze(Object.fromEntries(FIGURES.map(f => [f.id, f])));

  const COMPASSOS = Object.freeze([
    { id: '2_4', numerador: 2, denominador: 4, pulsos: 2, etiqueta: '2/4' },
    { id: '3_4', numerador: 3, denominador: 4, pulsos: 3, etiqueta: '3/4' },
    { id: '4_4', numerador: 4, denominador: 4, pulsos: 4, etiqueta: '4/4' }
  ]);

  function aleatoria() {
    return FIGURES[Math.floor(Math.random() * FIGURES.length)];
  }

  function distractors(figuraCorrecta, quantitat) {
    const pool = FIGURES.filter(f => f.id !== figuraCorrecta.id);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, quantitat);
  }

  function sumaValors(figures) {
    return figures.reduce((t, f) => t + f.valor, 0);
  }

  function validarCompas(figures, compas) {
    return Math.abs(sumaValors(figures) - compas.pulsos) < 0.001;
  }

  function generarCompasValid(compas) {
    const objectiu = compas.pulsos;
    const disponibles = FIGURES.filter(f => f.valor <= objectiu);
    let restant = objectiu;
    const resultat = [];
    let intents = 0;
    while (restant > 0.001 && intents < 50) {
      const candidats = disponibles.filter(f => f.valor <= restant + 0.001);
      if (!candidats.length) break;
      const pesos = candidats.map(f => 1 / Math.max(0.25, f.valor));
      const total = pesos.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let escollit = candidats[0];
      for (let i = 0; i < candidats.length; i++) {
        r -= pesos[i];
        if (r <= 0) { escollit = candidats[i]; break; }
      }
      resultat.push(escollit);
      restant -= escollit.valor;
      intents++;
    }
    return resultat;
  }

  function generarCompasInvalid(compas) {
    const objectiu = compas.pulsos;
    let resultat;
    let suma;
    let intents = 0;
    do {
      resultat = [];
      const quants = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < quants; i++) {
        resultat.push(aleatoria());
      }
      suma = sumaValors(resultat);
      intents++;
    } while (Math.abs(suma - objectiu) < 0.001 && intents < 20);
    return resultat;
  }

  function compasAleatori(compas, valid) {
    return valid ? generarCompasValid(compas) : generarCompasInvalid(compas);
  }

  // ============================================================
  // SVG inline per a cada figura rítmica (no depèn de fonts)
  // ============================================================
  function svgFigura(figura, opcions = {}) {
    const color  = opcions.color  || '#D4AF37';
    const ample  = opcions.ample  || 36;
    const alt    = opcions.alt    || 72;
    const grossor = opcions.grossor || 2.6;

    const w = 30, h = 72;
    const capX = 10, capY = h - 10;
    const palX = capX + 8.5;
    const palTop = 8;

    let cap = '', pal = '', flags = '';

    if (figura.id === 'rodona') {
      cap = `<ellipse cx="${w/2}" cy="${h/2}" rx="9.5" ry="6.5"
              fill="none" stroke="${color}" stroke-width="${grossor + 0.5}"
              transform="rotate(-20 ${w/2} ${h/2})"/>`;
    } else {
      const fill = (figura.id === 'blanca') ? 'none' : color;
      cap = `<ellipse cx="${capX}" cy="${capY}" rx="9" ry="6"
              fill="${fill}" stroke="${color}" stroke-width="${grossor}"
              transform="rotate(-20 ${capX} ${capY})"/>`;
      pal = `<line x1="${palX}" y1="${capY - 3}" x2="${palX}" y2="${palTop}"
              stroke="${color}" stroke-width="${grossor}" stroke-linecap="round"/>`;

      if (figura.id === 'corxera') {
        flags = `<path d="M ${palX} ${palTop} q 12 7 4 18"
                  stroke="${color}" stroke-width="${grossor + 0.4}"
                  stroke-linecap="round" fill="none"/>`;
      } else if (figura.id === 'semicorxera') {
        flags = `
          <path d="M ${palX} ${palTop} q 12 7 4 18"
                stroke="${color}" stroke-width="${grossor + 0.4}"
                stroke-linecap="round" fill="none"/>
          <path d="M ${palX} ${palTop + 12} q 12 7 4 18"
                stroke="${color}" stroke-width="${grossor + 0.4}"
                stroke-linecap="round" fill="none"/>
        `;
      }
    }

    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"
             style="display:inline-block;vertical-align:middle;width:${ample}px;height:${alt}px;">
             ${cap}${pal}${flags}
            </svg>`;
  }

  function svgSilenci(figura, opcions = {}) {
    const color = opcions.color || '#D4AF37';
    const ample = opcions.ample || 30;
    const alt   = opcions.alt   || 50;
    return `<svg viewBox="0 0 30 50" xmlns="http://www.w3.org/2000/svg"
             style="display:inline-block;vertical-align:middle;width:${ample}px;height:${alt}px;">
             <rect x="9" y="22" width="12" height="6" fill="${color}"/>
            </svg>`;
  }

  return {
    FIGURES,
    MAPA,
    COMPASSOS,
    aleatoria,
    distractors,
    sumaValors,
    validarCompas,
    generarCompasValid,
    generarCompasInvalid,
    compasAleatori,
    svgFigura,
    svgSilenci
  };
})();
