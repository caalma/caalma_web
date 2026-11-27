// Páginas tipo artículo: barra de progreso, índice que resalta la sección actual,
// botones "copiar" en los bloques de código y la palabra IR para saltar a un título (id.IR).
export function iniciar(ctx) {
  const art = document.querySelector('.articulo');
  if (!art) return;

  const barra = document.querySelector('.progreso');
  const titulos = [...art.querySelectorAll('.contenido :is(h2, h3, h4)[id]')];
  const enlaces = new Map([...document.querySelectorAll('.toc-lateral a')].map((a) => [a.getAttribute('href').slice(1), a]));
  const lateral = document.querySelector('.toc-lateral');
  let esperando = false;

  function actualizar() {
    esperando = false;
    const h = document.documentElement;
    barra?.style.setProperty('--p', (100 * h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)).toFixed(1) + '%');
    let actual = null;                                      // último título que ya pasó el borde superior
    for (const t of titulos) { if (t.getBoundingClientRect().top <= 110) actual = t; else break; }
    enlaces.forEach((a, id) => {
      const on = actual && id === actual.id;
      if (on === a.classList.contains('activo')) return;
      a.classList.toggle('activo', !!on);
      if (on && lateral) {                                   // mantiene a la vista el ítem activo dentro del índice
        const r = a.getBoundingClientRect(), c = lateral.getBoundingClientRect();
        if (r.top < c.top || r.bottom > c.bottom) lateral.scrollTop += r.top - c.top - c.height / 2;
      }
    });
  }
  const pedir = () => { if (!esperando) { esperando = true; requestAnimationFrame(actualizar); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  actualizar();

  // copiar código
  art.querySelectorAll('.codigo').forEach((fig) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'copiar'; b.textContent = 'copiar';
    b.addEventListener('click', async () => {
      const texto = fig.querySelector('code').innerText;
      try { await navigator.clipboard.writeText(texto); }
      catch {                                                // sin permisos de portapapeles (http, iframes)
        const t = Object.assign(document.createElement('textarea'), { value: texto });
        document.body.append(t); t.select(); document.execCommand('copy'); t.remove();
      }
      b.textContent = 'copiado';
      setTimeout(() => { b.textContent = 'copiar'; }, 1500);
    });
    (fig.querySelector('figcaption') ?? fig).append(b);
  });

  // id IR : desplaza hasta el elemento con ese id (también "arriba")
  ctx.bus.addEventListener('orden:ir', (e) => {
    const el = document.getElementById(e.detail.id);
    if (el) el.scrollIntoView({ behavior: e.detail.suave ? 'smooth' : 'instant', block: 'start' });
    else console.warn('[articulo] no existe el elemento', e.detail.id);
  });
}
