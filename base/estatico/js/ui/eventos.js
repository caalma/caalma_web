// Expresiones pila-web dentro de atributos HTML:
//   data-pila-web-<evento>="expr"   se evalúa cuando ocurre el evento (click, input, keydown, mouseover…)
//   data-pila-web-inicio="expr"     se evalúa una vez al cargar
//   data-pila-web-mostrar="expr"    se evalúa al cargar y el RET reemplaza el texto del elemento
// Dentro de la expresión: YO (el elemento), TEC (tecla), VAL, EL, etc. Ver palabras/ui.js.
const EVENTOS = ['click', 'dblclick', 'mouseover', 'mouseout', 'pointerdown', 'pointerup',
                 'input', 'change', 'keydown', 'keyup', 'focusin', 'focusout', 'submit'];

export function iniciar(ctx) {
  const { vm } = ctx;

  for (const tipo of EVENTOS) {
    document.addEventListener(tipo, (ev) => {
      const el = ev.target.closest?.(`[data-pila-web-${tipo}]`);
      if (!el) return;
      if (tipo === 'click' && el.tagName === 'A') ev.preventDefault();
      vm.eval(el.getAttribute(`data-pila-web-${tipo}`), { elemento: el, evento: ev });
      // un enlace "#guion" deja ese guion en la URL, sin crear historial
      if (tipo === 'click' && el.tagName === 'A' && el.getAttribute('href')?.startsWith('#') && el.getAttribute('href') !== '#') {
        history.replaceState(null, '', el.getAttribute('href'));
      }
    });
  }

  const arrancar = (raiz = document) => {
    raiz.querySelectorAll('[data-pila-web-inicio]').forEach((el) => vm.eval(el.dataset.pilaWebInicio, { elemento: el, instante: true }));
    raiz.querySelectorAll('[data-pila-web-mostrar]').forEach((el) => {
      const r = vm.eval(el.dataset.pilaWebMostrar, { elemento: el, limpiar: true });
      el.textContent = r.error ? '⚠' : (r.resultado ?? '');
    });
  };
  arrancar();
  ctx.bus.addEventListener('orden:refrescar', () => arrancar());
}
