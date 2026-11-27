**pila-web** es el lenguaje con el que esta web se controla a sí misma. Es un lenguaje de **pila** (notación
polaca inversa, RPN): los datos se apilan y las *palabras* toman lo que necesitan de la pila y dejan su
resultado. Se puede escribir en tres lugares: la **barra de direcciones**, un **atributo HTML** y un **editor
flotante** que se abre con <kbd>Alt</kbd>+<kbd>Esc</kbd>. Funciona del lado del navegador, sin servidor.

Este artículo recorre todo el lenguaje. Los ejemplos con botones o resultados son **en vivo**: se ejecutan en
esta misma página. Para escribir los tuyos, abrí el editor con <kbd>Alt</kbd>+<kbd>Esc</kbd> y evaluá con
<kbd>Alt</kbd>+<kbd>Enter</kbd>.

## La idea

Un programa es una sucesión de **tokens** separados por puntos. Cada token es una **palabra** (si el lenguaje la
conoce) o un **dato** (si no). Un dato se apila; una palabra actúa sobre lo que hay en la pila.

```pila-web
2.3.MUL.4.SUM.RET
```

El resultado de ese programa es <b data-pila-web-mostrar="2.3.MUL.4.SUM.RET">…</b>, calculado por el lenguaje
al cargar la página a partir de un atributo. Paso a paso:

| Token | Qué ocurre | Pila después |
|---|---|---|
| `2` | es un dato: se apila | `2` |
| `3` | dato | `2 3` |
| `MUL` | multiplica los dos de arriba | `6` |
| `4` | dato | `6 4` |
| `SUM` | suma los dos de arriba | `10` |
| `RET` | saca el tope y lo deja como resultado de la evaluación | vacía (resultado: 10) |

!!! note "Por qué una pila"
    En una pila no hacen falta paréntesis ni reglas de precedencia: el orden en que se escribe es el orden en
    que ocurre. Además, ampliar el lenguaje es agregar palabras: cada una es una función de pocas líneas.

## Sintaxis

### Tokens, palabras y datos

- Los tokens se separan con **puntos**, o con **espacios y saltos de línea** (en el editor se puede escribir
  en varias líneas). En la URL se usan puntos, porque los espacios se codifican.
- Una **palabra** es un nombre en mayúsculas que está registrado (`SUM`, `IR`, `FOC`). Distingue mayúsculas de
  minúsculas: `sum` no es la palabra `SUM`.
- Todo token que **no** es una palabra es un **dato de texto** y se apila tal cual: `hola`, `portada`, `12`.
- No hay comentarios ni sintaxis especial para textos con espacios (se arman con `SPC` y `CAT`).

### Números y colores

Los datos son siempre texto; las palabras que lo necesitan **lo convierten** a lo que haga falta. Por eso `12` es
el texto «12» hasta que una palabra matemática lo usa como número:

```pila-web
12.LEN.RET      →  2     (cuenta los caracteres del texto «12»)
12.NUM.RET      →  12    (lo convierte en número)
12.1.SUM.RET    →  13    (SUM convierte sola)
```

| Se escribe | Significa | Ejemplo |
|---|---|---|
| `12`, `-3` | número entero | `12.3.SUM.RET` → 15 |
| `2_5` | decimal: el guión bajo hace de coma (el punto separa tokens) | `2_5.2.MUL.RET` → 5 |
| `~ff` | número hexadecimal | `~ff.1.SUM.RET` → 256 |
| `~1a1030` | **color** hexadecimal (3, 6 u 8 dígitos) | `~1a1030.fondo.VAR` |

El mismo `~fff` es el número 4095 para la matemática y el color `#fff` para las palabras de estilo
(`VAR`, `FND`, `TXT`): la conversión la decide la palabra que lo recibe.

### Textos con espacios

```pila-web
hola.SPC.CAT.mundo.CAT.RET    →  "hola mundo"
ab.3.REP.RET                  →  "ababab"
```

### Qué pasa cuando algo sale mal

Un token desconocido **no es un error**: se apila como texto. Si se escribe mal una palabra, el programa
sigue andando y apila el nombre mal escrito:

```pila-web
1.2.SMU.PRF.RET    →  3     (SMU no existe: se apiló como texto)
```

Cuando una palabra **sí** falla (poca pila, un dato que no es número, un elemento que no existe) la
evaluación **se detiene** y se informa el token y el motivo, por ejemplo:

```
✗ SUM: pila insuficiente (requiere 2, hay 1)
✗ SUM: no es número: abc
✗ FOC: no se pudo enfocar <section#portada>: está en una sección o panel que ahora no es interactivo (inerte)
```

En el editor el error sale en rojo. Desde la URL o un atributo no hay dónde mostrarlo: queda en la consola del
navegador, con el prefijo `[pila-web]`.

## La pila

Las palabras de manejo de pila reordenan los datos. Cada una se describe con su **efecto**: lo que consume a la
izquierda de la flecha y lo que deja a la derecha (`a b → b a`).

| Palabra | Efecto | Ejemplo | Resultado |
|---|---|---|---|
| `DUP` | `a → a a` | `3.DUP.MUL.RET` | 9 |
| `DRP` | `a →` | `1.2.DRP.RET` | 1 |
| `SWP` | `a b → b a` | `1.2.SWP.RES.RET` | 1 |
| `ROT` | `a b c → b c a` | `1.2.3.ROT.RET` | 1 |
| `OVR` | `a b → a b a` | `1.2.OVR.RET` | 1 |
| `NIP` | `a b → b` | `1.2.NIP.PRF.RET` | 1 |
| `TUK` | `a b → b a b` | `1.2.TUK.PRF.RET` | 3 |
| `PRF` | `→ n` (cuántos datos hay) | `a.b.c.PRF.RET` | 3 |
| `CLR` | vacía la pila | `1.2.3.CLR.PRF.RET` | 0 |

Con `PIL` se ve la pila en un panel flotante: <a href="#" data-pila-web-click="1.2.3.ROT.PIL">1.2.3.ROT.PIL</a>.
Cierra con la **×** o con `PILX`.

### La pila temporal

Hay una segunda pila, auxiliar, para «guardar» un dato mientras se trabaja con otros. `_DT` mueve el tope a
la pila temporal y `_TD` lo trae de vuelta:

```pila-web
1.2._DT.3.SUM._TD.SUM.RET    →  6
```

Se lee así: se apilan 1 y 2; `_DT` guarda el 2; se apila 3 y se suma al 1 (4); `_TD` trae el 2; se suma: 6.

## Matemática y texto

```pila-web
10.3.RES.RET     →  7        (resta)
7.2.DIV.RET      →  3.5      (división)
7.2.MOD.RET      →  1        (resto)
2.10.POT.RET     →  1024     (potencia)
AZR.RET          →  un número al azar entre 0 y 1
pila-web.MAY.RET →  "PILA-WEB"
pila-web.LEN.RET →  8
```

Todas las palabras matemáticas aceptan un número, un decimal con `_` o un hexadecimal con `~`. Las de texto
aceptan cualquier dato. La lista completa está en la [referencia](#referencia-de-palabras).

## Salida

Tres palabras comunican el resultado:

- `LOG` **muestra** el tope y lo consume. Va a la consola del navegador y al editor.
- `VER` lo muestra **sin consumirlo**.
- `RET` lo deja como **resultado** de la evaluación. El editor lo muestra con `=`; un atributo
  `data-pila-web-mostrar` lo escribe dentro de su elemento.

```pila-web
5.DUP.VER.MUL.LOG       muestra 5, luego 25
```

## Controlar la página

Aquí está lo que hace del lenguaje algo más que una calculadora: sus palabras de interfaz actúan sobre la propia página.

### Apariencia

`VAR` cambia una variable de estilo (CSS). La sintaxis es **valor nombre VAR**:

```pila-web
~1a1030.fondo.VAR      el fondo
~ffb454.texto.VAR      el color del texto
Georgia.FUE            la tipografía (una instalada; los _ valen como espacios)
18.TAM                 el tamaño base del texto, en píxeles
```

Probalo: <a href="#" data-pila-web-click="~1a1030.fondo.VAR.~c9ced8.texto.VAR">fondo violeta</a> ·
<a href="#" data-pila-web-click="~ffe9c7.fondo.VAR.~2a2118.texto.VAR">fondo claro</a> ·
<a href="#" data-pila-web-click="~ff6b6b.p3.VAR">títulos de tercer nivel en rojo</a> ·
<a href="#" data-pila-web-click="~0b0d12.fondo.VAR.~c9ced8.texto.VAR.~4aa8ff.p3.VAR">restaurar</a>

`FND` y `TXT` son atajos para el fondo y el texto. Estas son las variables que se pueden cambiar:

| Variable | Qué controla |
|---|---|
| `fondo`, `texto`, `tenue` | colores de fondo, de texto y de texto atenuado |
| `linea` | el color de bordes y separadores |
| `velo` | el velo que oscurece el fondo cuando hay un panel abierto |
| `fuente` | la tipografía de toda la web |
| `p1` … `p6` | la **paleta**: títulos, enlaces, código y etiquetas se colorean con estos seis colores |

!!! note "El color de acento"
    El color de acento de cada sección o página se define en su propio contenedor, por lo que no se
    cambia con `VAR`. Para recolorear todo, se cambian los seis colores de la paleta.

### Navegación y secciones

En la **portada** (secciones superpuestas que cambian con el scroll):

| Palabra | Efecto |
|---|---|
| `id.IR` | va a la sección con ese id (`utiles.IR`, `contactos.IR`) |
| `SIG` / `ANT` | sección siguiente / anterior |
| `CAPA` | apila el id de la sección actual |

En un **artículo**, `IR` desplaza hasta el título o elemento con ese id (los títulos tienen id automático):
<a href="#" data-pila-web-click="referencia-de-palabras.IR">ir a la referencia</a> ·
<a href="#" data-pila-web-click="arriba.IR">volver arriba</a>.

### Paneles

Los paneles son ventanas superpuestas que se abren sobre la página. Se identifican por su `id` y se manejan con
estas palabras:

```pila-web
ayuda.ABR                  abre el panel
ayuda.CER                  lo cierra          CERT cierra todos
ayuda.ALT                  lo abre o lo cierra, según esté
ayuda.izquierda.POS        lo mueve: abajo, arriba, izquierda, derecha o centro
ayuda.80.MAX               ocupa el 80% de la ventana (0 = su tamaño propio)
PNL                        apila el id del panel de arriba
```

Probalo: <a href="#" data-pila-web-click="ayuda.centro.POS.ayuda.ABR">abrir el panel de ayuda</a> ·
<a href="#" data-pila-web-click="elementos.derecha.POS.elementos.ABR.elementos.70.MAX">el panel de práctica, al 70%</a> ·
<a href="#" data-pila-web-click="CERT">cerrar todos</a>.

Con un panel abierto, el fondo no se desplaza, <kbd>Esc</kbd> cierra el de arriba y se pueden apilar varios.

### Elementos de la página

Estas palabras trabajan sobre **un elemento con id**. Todas aceptan el id directamente, o el elemento que
apilan `EL` y `YO`: `campo.FOC` equivale a `campo.EL.FOC`.

| Palabra | Efecto |
|---|---|
| `id EL` | apila el elemento (el panel de la pila lo muestra como `<input#campo>`) |
| `YO` | el elemento que disparó el evento (sólo dentro de un atributo `data-pila-web-…`) |
| `el ID` | su id |
| `el FOC` | le da el foco; si no puede, explica por qué |
| `campo VAL` | el valor de un `input`, `textarea` o `select` |
| `el LEE` | el texto de cualquier elemento |
| `el texto TXE` | cambia su texto |
| `el clase CLA` | agrega o quita una clase |
| `el nombre ATR` | lee un atributo |
| `el nombre valor ATS` | cambia un atributo |
| `TEC` | la tecla del evento actual (en un `keydown` o `keyup`) |

Un ejemplo con un campo de texto y un eco. Cada vez que se escribe se evalúa `pw-eco.YO.VAL.TXE`: `YO` es el
campo, `VAL` su valor y `TXE` lo escribe en el elemento `pw-eco`.

<input id="pw-campo" type="text" placeholder="escribí algo" data-pila-web-input="pw-eco.YO.VAL.TXE">
&nbsp;→&nbsp;<b id="pw-eco">…</b>

<button type="button" data-pila-web-click="pw-campo.FOC">enfocar el campo</button>
<button type="button" data-pila-web-click="pw-eco.pw-campo.VAL.MAY.TXE">eco en mayúsculas</button>
<button type="button" data-pila-web-click="pw-eco.pw-campo.EL.ID.TXE">¿cuál es su id?</button>

Y uno que reacciona a las teclas: <input id="pw-tecla" type="text" placeholder="presioná teclas"
data-pila-web-keydown="pw-tecla-eco.TEC.TXE"> → <b id="pw-tecla-eco">…</b>

Un elemento sin `id` no se puede alcanzar con estas palabras: hay que agregarle uno. `FOC` funciona con cualquier
elemento visible; si está dentro de una sección que no es la actual, o debajo de un panel, avisa que no puede.

### Herramientas y ayuda

| Palabra | Efecto |
|---|---|
| `EDT` | muestra u oculta el editor |
| `PIL` / `PILX` | muestra / cierra la pila en un panel flotante |
| `FIJ` | escribe en la URL el estado actual (sección, paneles, colores) |
| `AYU` | lista **todas** las palabras con su efecto |
| `QUE.FOC` | explica una palabra (`QUE` lee el token siguiente) |

## Dónde se escribe

### En la URL

Todo lo que sigue al `#` de la dirección es un programa. Se evalúa **al cargar** la página (con el movimiento
instantáneo, sin animación) y **cada vez que el `#` cambia**. Cada evaluación empieza con la pila vacía.

```
https://caalma.net.ar/#~1a1030.fondo.VAR.exploraciones.IR
https://caalma.net.ar/articulos/pila-web.html#ayuda.ABR
```

La URL pasa a ser un **guión que reproduce un estado**: se puede compartir, guardar como marcador o usar en
una presentación. Los enlaces comunes también funcionan, y el botón «atrás» del navegador deshace el cambio:
<a href="#~1a1030.fondo.VAR">violeta</a> · <a href="#~0b0d12.fondo.VAR">original</a>.

Por seguridad, la URL sólo admite estos caracteres: letras, números y `- _ . ; , ~ ! * + ' ( ) [ ] { } %`. Lo
demás se rechaza con «código no válido».

!!! tip "Fijar el estado actual"
    Se cambian colores, se abre un panel, se va a una sección… y con <kbd>Alt</kbd>+<kbd>U</kbd> (la palabra
    `FIJ`) la dirección se actualiza con el programa que reproduce ese estado. Se copia y se comparte.

### En atributos HTML

Cualquier elemento puede llevar una expresión en un atributo con la forma `data-pila-web-EVENTO`:

```html
<button type="button" data-pila-web-click="ayuda.ABR">Ayuda</button>
<input id="campo" data-pila-web-input="eco.YO.VAL.TXE">
<b data-pila-web-mostrar="2.3.MUL.RET">…</b>
```

- **Eventos disponibles:** `click`, `dblclick`, `mouseover`, `mouseout`, `pointerdown`, `pointerup`, `input`, `change`,
  `keydown`, `keyup`, `focusin`, `focusout` y `submit`. Funcionan también con contenido agregado después de cargar la página.
- En un enlace `<a>`, el clic no navega: se ejecuta la expresión. Si el `href` es un `#programa`, ese programa queda además en la URL.
- **`data-pila-web-inicio`** se evalúa **una vez, al cargar**.
- **`data-pila-web-mostrar`** se evalúa al cargar y escribe el `RET` dentro del elemento (o `⚠` si hay un error).
- Dentro de la expresión, `YO` es el elemento y `TEC` la tecla del evento.

### En el editor

<kbd>Alt</kbd>+<kbd>Esc</kbd> muestra u oculta el editor flotante y <kbd>Alt</kbd>+<kbd>Enter</kbd> evalúa lo escrito.

- **A diferencia de la URL, la pila se conserva** entre una evaluación y la siguiente: se puede construir un
  cálculo de a pasos. El botón *pila ∅* la vacía.
- La salida muestra, en colores, el **resultado** (`=`), los **errores** (`✗`), lo que sale por `LOG`/`VER`/`AYU` y
  la pila resultante.
- El botón *→ url* copia el programa del editor a la dirección.
- Se arrastra desde la cabecera; la salida se agranda con su tirador (ancho y alto) y el código en alto. Texto,
  posición y tamaños se recuerdan entre visitas.

### Atajos de teclado

Los atajos se definen en la configuración del sitio como **combinación → programa**:

```yaml
# base/datos/sitio.yml
atajos:
  'Alt+Escape': 'EDT'          # mostrar u ocultar el editor
  'Alt+u': 'FIJ'               # fijar el estado en la URL
  'Alt+p': 'ayuda.ALT'         # un atajo nuevo: abrir o cerrar la ayuda
```

La combinación admite `Ctrl`, `Alt`, `Shift` y `Meta` más una tecla (una letra, un número, `Escape`, `Enter`, `F1`…).
`Alt+Enter` (evaluar) pertenece al editor.

### Al iniciar, y desde la consola

Un programa de **inicio**, que corre siempre antes del de la URL, se define en la configuración:

```yaml
# base/datos/sitio.yml (o en una página: la clave de la página gana)
pila_web_inicio: '~0b0d12.fondo.VAR'
```

Y desde la consola del navegador existe el objeto global `CLM`, que sirve para experimentar:

```javascript
CLM.vm.eval('2.3.MUL.RET')
// → { resultado: 6, pila: [], error: null }
```

## Configurar los módulos

El lenguaje está organizado en **módulos de palabras** y la interfaz en **módulos de interfaz**. Cuáles se cargan
se decide en `sitio.yml`, y cada página puede cambiarlo:

```yaml
# base/datos/sitio.yml
modulos_pila_web: [nucleo, matematica, texto, salida, ui]
modulos_ui: [capas, menu, paneles, eventos, atajos, editor, pila]
```

```yaml
# base/datos/paginas/mi-pagina.yml  (sólo esta página)
modulos_pila_web: [nucleo, matematica, salida]     # sin palabras de interfaz
pila_web_inicio: ''
```

Para **anular** una función basta sacar su módulo de la lista: no hay que borrar código. Una página puede
sobreescribir `css`, `modulos_ui`, `modulos_pila_web` y `pila_web_inicio`; la clave `plantillas:` de
`sitio.yml` fija valores por defecto para cada tipo de página.

## Extender el lenguaje

Agregar una función es agregar una **palabra**. Una palabra es una función que recibe la máquina (`vm`):

```javascript
// base/estatico/js/pila-web/palabras/mio.js
export default {
  nombre: 'mio',
  ayuda: {
    DOB: 'n → 2n   el doble de un número',
  },
  palabras: {
    DOB: (vm) => {
      vm.necesitar(1);                 // avisa si falta un dato
      vm.push(vm.num(vm.pop()) * 2);   // num() convierte (y falla con un mensaje claro)
    },
  },
};
```

Después se agrega `mio` a `modulos_pila_web` y ya se puede escribir `21.DOB.RET`. El texto de `ayuda` tiene dos
partes separadas por dos o más espacios: el **efecto** y la **descripción**. Alimenta las palabras `AYU` y `QUE`, y la
tabla de la referencia de este artículo se genera a partir de él.

### Lo que ofrece la máquina

| Miembro | Qué hace |
|---|---|
| `push(v)` · `pop()` · `mirar(i)` | apilar, sacar (con error si está vacía) y mirar sin sacar |
| `necesitar(n)` | falla con un mensaje claro si hay menos de `n` datos |
| `num(v)` · `valor(v)` | convierten a número (`2_5`, `~ff`) o a valor de estilo (`~1a1030` → `#1a1030`) |
| `el(v)` · `texto(v)` | `el` acepta un id o un elemento; `texto` describe un valor para mostrarlo |
| `siguiente()` | lee el **token siguiente** en lugar de la pila (así funciona `QUE.FOC`) |
| `imprimir(v)` | muestra en la consola y en el editor |
| `orden(nombre, detalle)` | pide algo a la interfaz (ver abajo) |
| `pila` · `temp` · `resultado` | el estado: pila de datos, pila temporal y resultado |
| `contexto` | `{ elemento, evento, instante }` de la evaluación en curso |
| `usar(modulo)` · `definir(n, f)` · `quitar(n)` | registrar un módulo, una palabra o quitarla |
| `eval(código, opciones)` | evalúa; opciones: `estricto`, `limpiar`, `elemento`, `evento`, `instante` |

`eval` devuelve `{ resultado, pila, error }`. Es reentrante: si un evento disparado por una palabra evalúa otro
código, no se pisan.

### Palabras e interfaz separadas

Las palabras de página **no tocan la interfaz directamente**: emiten *órdenes* y los módulos de interfaz las atienden.

```javascript
// la palabra ABR (id ABR) hace esto:
vm.orden('abrir', { id: 'ayuda' });
// y el módulo de paneles escucha:
ctx.bus.addEventListener('orden:abrir', (e) => abrir(e.detail.id));
```

Así se puede reemplazar o quitar un módulo de interfaz sin romper el lenguaje. Las órdenes existentes son `ir`, `ir-rel`,
`abrir`, `cerrar`, `cerrar-todos`, `alternar`, `posicion`, `tamano`, `editor`, `pila`, `pila-cerrar` y `refrescar`. Los módulos
de interfaz viven en `base/estatico/js/ui/`, exportan `iniciar(ctx)` y se listan en `modulos_ui`.

Para probar una idea sin crear archivos, se puede definir una palabra desde la consola (dura hasta recargar la página):

```javascript
CLM.vm.definir('TRI', (vm) => vm.push(vm.num(vm.pop()) * 3));
```

## Límites actuales

Es un lenguaje deliberadamente chico. Hoy **no** tiene:

- condicionales ni repeticiones;
- palabras definidas por quien escribe el programa, ni variables (sólo la pila y la pila temporal);
- selección de elementos por clase o selector (sólo por `id`: el punto separa tokens y `#` lo usa la URL);
- comentarios ni textos con espacios dentro de un token.

Cada una de esas cosas es una ampliación natural: una palabra más, o un módulo nuevo.

## Referencia de palabras

Esta tabla se genera automáticamente a partir de la ayuda que lleva cada módulo, así que siempre coincide con
las palabras que existen. Con `AYU` se obtiene la misma lista dentro de la página.

{% for g in palabras_pila_web() %}
### {{ g.titulo }}

| Palabra | Efecto | Qué hace |
|---|---|---|
{% for w in g.palabras -%}
| `{{ w.nombre }}` | `{{ w.efecto|e }}` | {{ w.desc|e }} |
{% endfor %}
{% endfor %}
