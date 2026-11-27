// Menú lateral disimulado: marcas finas que, al acercar el cursor (o tocar en móvil),
// muestran título y resumen. El estilo vive en css/menu.css.
export function iniciar(ctx) {
  const menu = document.querySelector('.menu');
  if (!menu) return;
  const enlaces = [...menu.querySelectorAll('a[data-seccion]')];

  ctx.bus.addEventListener('estado:capa', (e) => {
    enlaces.forEach((a) => {
      const on = a.dataset.seccion === e.detail.id;
      a.classList.toggle('actual', on);
      on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
    });
  });

  // táctil: el primer toque despliega, el siguiente elige; tocar afuera cierra
  const sinHover = matchMedia('(hover: none)');
  menu.addEventListener('click', (e) => {
    if (sinHover.matches && !menu.classList.contains('abierto')) {
      e.preventDefault(); e.stopPropagation();
      menu.classList.add('abierto');
    } else {
      menu.classList.remove('abierto');
      e.target.closest('a')?.blur();            // con mouse, el foco no debe dejar el menú abierto
    }
  });
  document.addEventListener('pointerdown', (e) => { if (!menu.contains(e.target)) menu.classList.remove('abierto'); });
}
