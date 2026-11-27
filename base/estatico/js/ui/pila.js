// Panel flotante que muestra la pila (palabra PIL). Cierra con PILX o con ×.
import { arrastrable, formatear } from './util.js';

export function iniciar(ctx) {
  const caja = document.createElement('div');
  caja.className = 'flotante monitor';
  caja.hidden = true;
  caja.setAttribute('role', 'dialog');
  caja.setAttribute('aria-label', 'Pila de pila-web');
  caja.innerHTML = '<header><span>pila</span><button type="button" aria-label="Cerrar">×</button></header><ol class="datos"></ol>';
  document.body.append(caja);
  const lista = caja.querySelector('.datos');

  function mostrar(datos) {
    lista.replaceChildren();
    if (!datos.length) lista.innerHTML = '<li class="vacia">(vacía)</li>';
    [...datos].reverse().forEach((v, i) => {       // el tope primero
      const li = document.createElement('li');
      const tipo = typeof v === 'number' ? 'num' : v instanceof Element ? 'el' : /^-?\d+(_\d+)?$|^~[0-9a-f]+$/i.test(v) ? 'num?' : 'txt';
      li.innerHTML = '<span class="i"></span><span class="tipo"></span><span class="v"></span>';
      li.children[0].textContent = i === 0 ? 'tope' : '·';
      li.children[1].textContent = tipo;
      li.children[2].textContent = formatear(v);
      lista.append(li);
    });
    caja.hidden = false;
  }

  ctx.bus.addEventListener('orden:pila', (e) => mostrar(e.detail.datos));
  ctx.bus.addEventListener('orden:pila-cerrar', () => { caja.hidden = true; });
  caja.querySelector('button').addEventListener('click', () => { caja.hidden = true; });
  arrastrable(caja, caja.querySelector('header'));
}
