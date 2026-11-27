// Editor mínimo del lenguaje en un panel flotante.
//   Alt+Enter evalúa. Mostrar/ocultar se define en `atajos` (datos/sitio.yml) con la palabra EDT.
import { arrastrable } from './util.js';
export function iniciar(ctx) {
  const { vm } = ctx;
  const GUARDADO = 'clm.editor';
  const guardar = (v) => { try { localStorage.setItem(GUARDADO, v); } catch {} };
  const leer = () => { try { return localStorage.getItem(GUARDADO) ?? ''; } catch { return ''; } };

  const caja = document.createElement('div');
  caja.className = 'flotante editor';
  caja.hidden = true;
  caja.setAttribute('role', 'dialog');
  caja.setAttribute('aria-label', 'Editor de pila-web');
  caja.innerHTML = `
    <header><span>pila-web</span><small>Alt+Enter evalúa</small></header>
    <textarea id="pila-web-editor" spellcheck="false" autocomplete="off" placeholder="2.3.MUL.4.SUM.LOG"></textarea>
    <div class="acciones">
      <button type="button" data-a="eval">evaluar</button>
      <button type="button" data-a="url">→ url</button>
      <button type="button" data-a="clr">pila ∅</button>
    </div>
    <pre class="salida" id="pila-web-salida" aria-live="polite"></pre>`;
  document.body.append(caja);

  const area = caja.querySelector('textarea');
  const salida = caja.querySelector('.salida');
  const cabecera = caja.querySelector('header');
  area.value = leer();

  const escribir = (linea, clase = '') => {
    const l = document.createElement('div');
    if (clase) l.className = clase;
    l.textContent = linea;
    salida.append(l);
    while (salida.childElementCount > 40) salida.firstElementChild.remove();
    salida.scrollTop = salida.scrollHeight;
  };

  function evaluar() {
    guardar(area.value);
    const r = vm.eval(area.value);
    if (r.error) escribir('✗ ' + r.error, 'error');
    if (r.resultado !== undefined) escribir('= ' + vm.texto(r.resultado), 'resultado');
    escribir('pila [' + r.pila.map((v) => vm.texto(v)).join(' ') + ']', 'pila');
  }

  // Posición y tamaños se recuerdan entre visitas (clm.editor.geom).
  const GEOM = 'clm.editor.geom';
  const salidaEl = caja.querySelector('.salida');
  let posicionada = false, temporizador = 0;
  const leerGeom = () => { try { return JSON.parse(localStorage.getItem(GEOM)) ?? null; } catch { return null; } };
  function guardarGeom() {
    if (caja.hidden) return;
    const r = caja.getBoundingClientRect();
    try {
      localStorage.setItem(GEOM, JSON.stringify({
        x: Math.round(r.left), y: Math.round(r.top),
        sw: Math.round(salidaEl.offsetWidth), sh: Math.round(salidaEl.offsetHeight), th: Math.round(area.offsetHeight),
      }));
    } catch {}
  }

  // La ventana se ancla por arriba-izquierda: el tirador de la salida (esquina inferior derecha)
  // la agranda hacia abajo y a la derecha. Si algo la saca de la pantalla, se corre lo justo.
  function anclar(x, y) {
    const r = caja.getBoundingClientRect();
    x = Math.max(0, Math.min(x ?? r.left, innerWidth - r.width));
    y = Math.max(0, Math.min(y ?? r.top, innerHeight - r.height));
    Object.assign(caja.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' });
  }

  function alternar(forzar) {
    caja.hidden = forzar ?? !caja.hidden;
    if (caja.hidden) return;
    if (!posicionada) {
      posicionada = true;
      const g = leerGeom();
      if (g) {                                      // tamaños guardados (límites razonables)
        salidaEl.style.width = Math.min(g.sw, innerWidth * 0.96) + 'px';
        salidaEl.style.height = Math.min(g.sh, innerHeight * 0.8) + 'px';
        area.style.height = Math.min(g.th, innerHeight * 0.6) + 'px';
      }
      anclar(g?.x ?? 64, g?.y ?? 72);               // sin guardado: arriba a la izquierda, con lugar para crecer
    } else {
      anclar();
    }
    area.focus();
  }
  window.addEventListener('resize', () => { if (!caja.hidden) anclar(); });
  new ResizeObserver(() => {                         // al cambiar de tamaño: mantener a la vista y recordar
    if (caja.hidden || !posicionada) return;
    anclar();
    clearTimeout(temporizador);
    temporizador = setTimeout(guardarGeom, 300);
  }).observe(caja);
  caja.addEventListener('pointerup', () => setTimeout(guardarGeom, 0));   // fin de un arrastre de la cabecera

  caja.addEventListener('click', (e) => {
    const a = e.target.dataset?.a;
    if (a === 'eval') evaluar();
    if (a === 'clr') { vm.pila.length = 0; escribir('pila []', 'pila'); }
    if (a === 'url') { history.replaceState(null, '', '#' + vm.tokenizar(area.value).join('.')); escribir('url actualizada', 'pila'); }
  });
  area.addEventListener('input', () => guardar(area.value));
  area.addEventListener('keydown', (e) => {
    if (!e.altKey && !e.ctrlKey) e.stopPropagation();   // lo escrito no dispara atajos de la página
  });

  ctx.bus.addEventListener('pila-web:salida', (e) => escribir(vm.texto(e.detail), 'log'));
  ctx.bus.addEventListener('orden:editor', (e) => alternar(e.detail?.mostrar));
  // Alt+Enter también cuando el foco está en los botones del editor
  caja.addEventListener('keydown', (e) => { if (e.altKey && e.key === 'Enter') { e.preventDefault(); evaluar(); } });

  arrastrable(caja, cabecera);
}
