// Arranque: carga los módulos declarados en datos/sitio.yml y ejecuta el guion de la URL.
import { Maquina } from './pila-web/maquina.js';

const cfg = JSON.parse(document.getElementById('clm-config').textContent);
const bus = new EventTarget();
const vm = new Maquina();
const ctx = { cfg, bus, vm, estado: { capa: null, paneles: [], vars: {} } };
vm.ctx = ctx;
window.CLM = ctx;                               // para experimentar desde la consola

const cargar = (ruta, nombre) =>
  import(`./${ruta}/${nombre}.js`).catch((e) => { console.warn(`[init] módulo ${ruta}/${nombre}:`, e); return null; });

// 1) palabras del lenguaje   2) módulos de interfaz   (en el orden del yml)
const modulosPalabras = await Promise.all(cfg.modulos_pila_web.map((n) => cargar('pila-web/palabras', n)));
modulosPalabras.forEach((m) => m && vm.usar(m.default));
const ui = await Promise.all(cfg.modulos_ui.map((n) => cargar('ui', n)));
ui.forEach((m) => m?.iniciar?.(ctx));

// 3) guion de inicio + guion de la URL
const guionURL = () => { try { return decodeURIComponent(location.hash.slice(1)); } catch { return ''; } };
function ejecutarURL(instante) {
  const g = guionURL();
  if (!g) return;
  const r = vm.eval(g, { estricto: true, limpiar: true, instante });
  if (r.error) console.warn('[url]', r.error);
}

if (cfg.pila_web_inicio) vm.eval(cfg.pila_web_inicio, { estricto: true, limpiar: true, instante: true });
ejecutarURL(true);
window.addEventListener('hashchange', () => ejecutarURL(false));
