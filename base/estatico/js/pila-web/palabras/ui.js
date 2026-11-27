// Palabras que actúan sobre la página. No tocan la interfaz directamente:
// emiten "órdenes" (vm.orden) que atienden los módulos de js/ui/. Así se puede
// reemplazar o quitar un módulo de interfaz sin romper el lenguaje.
const raiz = document.documentElement;
const ENFOCABLES = 'a[href],button,input,select,textarea,summary,[tabindex],[contenteditable=""],[contenteditable="true"]';
const GENERICAS = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui']);
const CAMPOS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OUTPUT', 'BUTTON']);

export default {
  nombre: 'ui',
  ayuda: {
    IR: 'id →            va a la sección (o al título, en un artículo) con ese id',
    SIG: '→              sección siguiente',
    ANT: '→              sección anterior',
    CAPA: '→ id           apila el id de la sección actual',
    ABR: 'id →           abre el panel',
    CER: 'id →           cierra el panel',
    CERT: '→              cierra todos los paneles',
    ALT: 'id →           abre o cierra el panel',
    POS: 'id pos →       mueve el panel: abajo arriba izquierda derecha centro',
    MAX: 'id pct →       el panel ocupa pct% de la ventana (0 = tamaño propio)',
    PNL: '→ id           apila el id del panel de arriba',
    EDT: '→              muestra u oculta el editor',
    PIL: '→              muestra la pila en un panel flotante',
    PILX: '→              cierra ese panel',
    VAR: 'valor nombre →  cambia la variable CSS --nombre. Ej: ~1a1030.fondo.VAR',
    FND: 'color →         cambia el fondo',
    TXT: 'color →         cambia el color del texto',
    FUE: 'nombre →        cambia la fuente. Ej: Fira_Code.FUE',
    TAM: 'px →            tamaño base del texto',
    EL: 'id → el         apila el ELEMENTO con ese id (se muestra como <tag#id>)',
    YO: '→ el            apila el elemento que disparó el evento (sólo dentro de data-pila-web-click, etc.)',
    ID: 'el → id         id de un elemento',
    FOC: 'el →           da el foco a un elemento (id o elemento). Avisa si no puede',
    VAL: 'campo → texto  valor de un input, textarea o select',
    LEE: 'el → texto     texto de cualquier elemento',
    TXE: 'el texto →     cambia el texto de un elemento',
    CLA: 'el clase →    agrega o quita una clase CSS',
    ATR: 'el nombre → v  lee un atributo',
    ATS: 'el nombre v →  cambia un atributo',
    TEC: '→ tecla        tecla del evento actual (en data-pila-web-keydown)',
    FIJ: '→              escribe en la URL el estado actual (sección, paneles, colores)',
  },
  palabras: {
    // --- navegación -------------------------------------------------------
    IR:  (vm) => { vm.orden('ir', { id: String(vm.pop()), suave: !vm.contexto.instante }); },   // id IR
    SIG: (vm) => { vm.orden('ir-rel', { d: +1 }); },
    ANT: (vm) => { vm.orden('ir-rel', { d: -1 }); },
    CAPA: (vm) => { vm.push(vm.ctx.estado.capa ?? ''); },                                       // apila la sección actual

    // --- paneles ------------------------------------------------------------
    ABR:  (vm) => { vm.orden('abrir', { id: String(vm.pop()) }); },                            // id ABR
    CER:  (vm) => { vm.orden('cerrar', { id: String(vm.pop()) }); },                           // id CER
    CERT: (vm) => { vm.orden('cerrar-todos'); },
    ALT:  (vm) => { vm.orden('alternar', { id: String(vm.pop()) }); },                         // id ALT
    POS:  (vm) => { vm.necesitar(2); const pos = String(vm.pop()); vm.orden('posicion', { id: String(vm.pop()), pos }); }, // id pos POS
    // id porcentaje MAX : el panel ocupa ese % de la ventana (1-100). Con 0 vuelve a su tamaño propio.
    MAX:  (vm) => {
      vm.necesitar(2);
      const pct = vm.num(vm.pop());
      if (pct < 0 || pct > 100) throw new Error('el porcentaje va de 0 a 100');
      vm.orden('tamano', { id: String(vm.pop()), pct });
    },
    PNL:  (vm) => { const p = vm.ctx.estado.paneles; vm.push(p[p.length - 1] ?? ''); },        // panel superior

    // --- herramientas flotantes -------------------------------------------------
    EDT:  (vm) => { vm.orden('editor'); },                                                      // mostrar/ocultar el editor
    PIL:  (vm) => { vm.orden('pila', { datos: [...vm.pila] }); },                               // muestra la pila en un panel flotante
    PILX: (vm) => { vm.orden('pila-cerrar'); },

    // --- apariencia (variables CSS de :root) -----------------------------------
    // valor nombre VAR    ej: ~1a1030.fondo.VAR   (los colores se escriben ~hex)
    VAR: (vm) => {
      vm.necesitar(2);
      const nombre = String(vm.pop()), valor = vm.valor(vm.pop());
      raiz.style.setProperty('--' + nombre, valor);
      vm.ctx.estado.vars[nombre] = String(valor);
    },
    FND: (vm) => { vm.necesitar(1); const c = vm.valor(vm.pop()); raiz.style.setProperty('--fondo', c); vm.ctx.estado.vars.fondo = String(c); },
    TXT: (vm) => { vm.necesitar(1); const c = vm.valor(vm.pop()); raiz.style.setProperty('--texto', c); vm.ctx.estado.vars.texto = String(c); },
    FUE: (vm) => {                                                                              // Fira_Code FUE
      vm.necesitar(1);
      const n = String(vm.pop()).replace(/_/g, ' ');
      const f = `${GENERICAS.has(n) ? n : `'${n}'`}, ui-monospace, monospace`;     // serif, monospace… no llevan comillas
      raiz.style.setProperty('--fuente', f);
      vm.ctx.estado.vars.fuente = f;
    },
    TAM: (vm) => { vm.necesitar(1); const n = vm.num(vm.pop()); raiz.style.fontSize = n + 'px'; },

    // --- elementos, foco, evento actual ------------------------------------------
    // Las palabras que piden un elemento aceptan su id directamente:  campo.FOC  =  campo.EL.FOC
    // EL sirve para fallar temprano si el id no existe y para reutilizarlo:  campo.EL.DUP.FOC.VAL
    EL:  (vm) => { vm.necesitar(1); vm.push(vm.el(vm.pop())); },                               // id EL  -> elemento
    YO:  (vm) => {                                                                              // elemento que disparó el evento
      if (!vm.contexto.elemento) throw new Error('YO sólo existe dentro de un evento (data-pila-web-click="…", data-pila-web-input="…")');
      vm.push(vm.contexto.elemento);
    },
    ID:  (vm) => { vm.necesitar(1); vm.push(vm.el(vm.pop()).id); },                            // el ID -> id
    FOC: (vm) => {                                                                              // el FOC
      vm.necesitar(1);
      const el = vm.el(vm.pop());
      if (!el.matches(ENFOCABLES)) el.setAttribute('tabindex', '-1');   // contenedores: se enfocan por código
      el.focus();
      if (document.activeElement !== el) {
        const causa = el.closest('[inert]') ? 'está en una sección o panel que ahora no es interactivo (inerte)'
          : el.closest('[hidden]') ? 'está oculto' : el.disabled ? 'está deshabilitado'
          : !el.getClientRects().length ? 'no se ve en pantalla' : 'el navegador no lo permitió';
        throw new Error(`no se pudo enfocar ${vm.texto(el)}: ${causa}`);
      }
    },
    VAL: (vm) => {                                                                              // campo VAL -> texto
      vm.necesitar(1);
      const el = vm.el(vm.pop());
      if (el.isContentEditable) vm.push(el.textContent);
      else if (CAMPOS.has(el.tagName)) vm.push(el.value);
      else throw new Error(`${vm.texto(el)} no es un campo de formulario (para su texto usá LEE)`);
    },
    LEE: (vm) => { vm.necesitar(1); vm.push(vm.el(vm.pop()).textContent); },                   // el LEE -> texto
    TEC: (vm) => { vm.push(vm.contexto.evento?.key ?? ''); },                                  // tecla del evento
    TXE: (vm) => { vm.necesitar(2); const t = vm.pop(); vm.el(vm.pop()).textContent = t; },   // el texto TXE
    CLA: (vm) => { vm.necesitar(2); const c = String(vm.pop()); vm.el(vm.pop()).classList.toggle(c); }, // el clase CLA
    ATR: (vm) => { vm.necesitar(2); const n = String(vm.pop()); vm.push(vm.el(vm.pop()).getAttribute(n) ?? ''); },   // el nombre ATR -> valor
    ATS: (vm) => { vm.necesitar(3); const v = vm.pop(), n = String(vm.pop()); vm.el(vm.pop()).setAttribute(n, v); }, // el nombre valor ATS

    // --- la URL como guion ------------------------------------------------------------
    // FIJ: escribe en la URL un guion que reproduce el estado actual (sección, paneles, variables)
    FIJ: (vm) => {
      const { capa, paneles, vars } = vm.ctx.estado;
      const t = [];
      for (const [n, v] of Object.entries(vars)) {
        const e = /^#[0-9a-f]{3,8}$/i.test(v) ? '~' + v.slice(1) : v;
        if (/^[A-Za-z0-9\-_~!*+'()%]+$/.test(e)) t.push(e, n, 'VAR');
      }
      if (capa) t.push(capa, 'IR');
      for (const p of paneles) t.push(p, 'ABR');
      history.replaceState(null, '', '#' + t.join('.'));
    },
  },
};
