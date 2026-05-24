/* ============================================================
   FIRA MUSICAL — Escalat responsive cross-browser
   Chrome/Safari accepten document.body.style.zoom.
   Firefox no — fallback a transform: scale().
   ============================================================ */

(function() {
  const ANCHO_DISENO = 1920;

  const suportaZoom = (function() {
    try {
      // Firefox retorna false explícitament; alguns Safari antics també.
      return CSS && CSS.supports && CSS.supports('zoom', '0.5');
    } catch { return false; }
  })();

  function escalar() {
    const escala = window.innerWidth / ANCHO_DISENO;
    const b = document.body;
    if (escala < 1) {
      if (suportaZoom) {
        b.style.zoom = escala;
        b.style.transform = '';
        b.style.transformOrigin = '';
        b.style.width = '';
      } else {
        b.style.zoom = '';
        b.style.transform = `scale(${escala})`;
        b.style.transformOrigin = 'top left';
        b.style.width = `${100 / escala}%`;
      }
    } else {
      b.style.zoom = '';
      b.style.transform = '';
      b.style.transformOrigin = '';
      b.style.width = '';
    }
  }

  window.addEventListener('resize', escalar);
  window.addEventListener('DOMContentLoaded', escalar);
})();
