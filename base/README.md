# base

Todo lo necesario para **generar** el sitio. El resultado se escribe en `../docs/`, que es lo que publica GitHub Pages.

Es una web estática: Python (Jinja2 + Markdown) arma las páginas a partir de archivos YAML, y el navegador sólo
recibe HTML, CSS y JavaScript propios (sin frameworks ni librerías externas).

## Estructura

```
<raíz del repositorio>
├── base/                  ← este directorio: lo que se edita
│   ├── clmweb             generador: update / push / open
│   ├── activar_entorno    crea y activa el entorno virtual de Python (se carga con `source`)
│   ├── requirements.txt   dependencias de Python
│   ├── clmlib/            minificador y resaltado de código (módulos de Python)
│   ├── datos/             contenido y configuración (YAML y Markdown)
│   ├── plantillas/        plantillas Jinja2 (HTML)
│   └── estatico/          css, js, imágenes… se copian tal cual a docs/
├── docs/                  ← se genera: NO editar a mano (se borra y se rehace en cada update)
├── README.md              presentación del sitio
├── LICENSE
└── .gitignore
```

## Puesta en marcha

Requisitos: **Python 3.9 o superior** y `git`. Opcionales: `Pygments` (colores en los bloques de código, ya está en
`requirements.txt`) y `node` (verifica cada JavaScript minificado antes de publicarlo).

```bash
cd base
source activar_entorno        # crea ./venv, lo activa e instala requirements.txt
```

`activar_entorno` usa `python3.9`; si en tu sistema el ejecutable se llama distinto, cambiá esa línea. El entorno
(`base/venv/`) está excluido de git. En las sesiones siguientes basta con `. venv/bin/activate`.

## Comandos

`clmweb` se puede ejecutar **desde cualquier carpeta**; ubica solo el resto del proyecto. Desde la raíz del repositorio:

| Comando | Qué hace |
|---|---|
| `./base/clmweb update` | regenera `docs/` con los contenidos actuales |
| `./base/clmweb open` | sirve `docs/` en local (`http://127.0.0.1:8000`), **regenera al guardar** cualquier archivo y abre el navegador |
| `./base/clmweb open --remoto` | abre la web publicada |
| `./base/clmweb push "mensaje"` | `update` + `git add -A` + `commit` + `push` (la primera vez crea la rama remota con `-u origin`) |

Opciones: `--sin-optimizar` (en `update`, `push` y `open`) saltea la minificación; `open` acepta `--puerto N` y
`--sin-navegador`. Cuando el entorno está activo y estás en `base/`, alcanza con `./clmweb update`.

Los módulos ES **no cargan desde `file://`**, por eso `open` usa un servidor local (y desactiva su caché).
La generación es **atómica**: el sitio se arma en `.docs_nuevo/` y sólo reemplaza a `docs/` si todo salió bien, así que
un YAML a medio escribir no deja el sitio roto. Los archivos temporales de los editores (`.#x`, `#x#`, `x~`, `.swp`)
se ignoran.

## Dónde tocar

| Quiero… | Archivo |
|---|---|
| cambiar colores, fuente, módulos, atajos, tema | `datos/sitio.yml` |
| agregar, mover u ocultar una sección de la portada | una línea en `datos/paginas/index.yml` + `datos/secciones/<id>.yml` |
| paneles con botón en una sección | clave `paneles:` en el yml de la sección (`posicion:`, `ancho:`, `boton: false`) |
| paneles sueltos (sin botón ni menú) | `datos/paneles/<id>.yml` + `paneles: [<id>]` en la página; se abren con `<id>.ABR` |
| clase y pestaña de cada item de una lista | `clase:` y `target:` en los items de una sección `tipo: lista` |
| un artículo nuevo | ver [Artículos](#artículos) |
| un tipo de sección nuevo | `plantillas/secciones/<tipo>.html` y `tipo: <tipo>` |
| el menú lateral a la derecha | `menu.lado: 'derecha'` en `datos/sitio.yml` |
| una palabra nueva del lenguaje | `estatico/js/pila-web/palabras/*.js` (ver [pila-web](#el-lenguaje-pila-web)) |
| un comportamiento de interfaz | `estatico/js/ui/<módulo>.js` + su nombre en `modulos_ui` |
| imágenes, favicon, `CNAME`, `robots.txt` | `estatico/` (se copian a `docs/`) |

Las rutas de este documento y de los comentarios dentro de los YAML son relativas a `base/`.

## Configuración (`datos/sitio.yml`)

| Clave | Para qué sirve |
|---|---|
| `titulo`, `idioma`, `base` | datos generales. `base` es `'/'` con dominio propio y `'/nombre-repo/'` si se publica en `usuario.github.io/nombre-repo/` |
| `metadatos`, `urls` | descripción, dominio, imagen para compartir, favicon, URL del sitio y del repositorio |
| `tema` | `fuente`, `fondo`, `texto`, `tenue`, `velo` y `paleta` (seis colores). Se vuelcan como variables CSS (`--fondo`, `--p1`…`--p6`) |
| `fuentes_css` | hojas de fuentes externas (por defecto Fira Code de Google Fonts) |
| `menu.lado` | `'izquierda'` o `'derecha'` |
| `panel_pos`, `panel_max` | posición por defecto de los paneles y % de ventana al maximizarlos |
| `atajos` | atajos de teclado: `'Alt+u': 'FIJ'` (combinación → programa pila-web) |
| `css` | hojas de `estatico/css/` que se cargan, en orden |
| `modulos_ui` | módulos de `estatico/js/ui/` que se activan |
| `modulos_pila_web` | módulos de palabras de `estatico/js/pila-web/palabras/` que se cargan |
| `pila_web_inicio` | programa pila-web que corre siempre al cargar, antes del de la URL |
| `plantillas` | valores por defecto de las claves anteriores según la plantilla de la página |
| `cabecera` | logo, nombre y enlaces extra de la cabecera de los artículos |
| `sitemap` | genera `sitemap.xml` y `robots.txt` (si no existen en `estatico/`) |
| `optimizar_codigo`, `optimizar_excluir` | minificación de lo publicado (ver [Publicación](#publicación)) |

### Valores por página

Las claves `css`, `modulos_ui`, `modulos_pila_web` y `pila_web_inicio` se pueden redefinir en el YAML de cada página.
La prioridad es: `sitio.yml` < `plantillas.<plantilla>` (en `sitio.yml`) < la propia página. La lista de claves
permitidas es `SOBREESCRIBIBLES` en `clmweb`.

## Páginas, secciones y paneles

- **Página** (`datos/paginas/*.yml`): una por archivo HTML generado. Campos: `titulo`, `plantilla`, `salida` (ruta dentro de
  `docs/`), `secciones` (portada), `paneles` (sueltos), `archivo` o `md` (artículos), `resumen`, `fecha`, `indexar`…
- **Sección** (`datos/secciones/<id>.yml`): un bloque de la portada, con `titulo`, `resumen` (se ve en el menú), `tipo`
  (`texto` o `lista`), `color` y `paneles`. El orden lo da la lista `secciones:` de la página.
- **Panel** (`datos/paneles/<id>.yml` o inline en una sección): ventana superpuesta con `titulo`, `posicion`
  (`abajo`, `arriba`, `izquierda`, `derecha`, `centro`), `ancho`, `boton`, y su contenido (`md`, o `tipo: lista`).
- **Plantillas** (`plantillas/`): `frontal.html` (portada), `articulo.html`, `simple.html` (404), `secciones/<tipo>.html` y
  `partes/` (trozos compartidos).

En todo el Markdown se puede usar Jinja (`{{ cfg.base }}`, `{{ cfg.urls.sitio }}`…). **Cuidado**: `{{`, `{%` y `{#` los
interpreta Jinja aunque estén dentro de código; se protegen con `{% raw %}…{% endraw %}`.

## Artículos

Un artículo son dos archivos: un YAML en `datos/paginas/` y el texto en Markdown en `datos/articulos/`.

```yaml
titulo: 'Un título'
plantilla: 'articulo.html'
salida: 'articulos/mi-articulo.html'
archivo: 'articulos/mi-articulo.md'
resumen: '…'
fecha: 2026-11-26
autor: 'Caalma'
etiquetas: [uno, dos]
```

La plantilla genera la cabecera fija (logo, inicio, arriba), el índice lateral automático de los títulos, la barra de
progreso, el tiempo de lectura y bloques de código con colores y botón «copiar». Hay dos artículos que sirven de
referencia y de ejemplo:

- `datos/articulos/markdown.md`: **toda la sintaxis de Markdown** que acepta el generador, con ejemplos.
- `datos/articulos/pila-web.md`: **el lenguaje pila-web** completo (la tabla de palabras se genera sola).

## Publicación

- **GitHub Pages**: Settings → Pages → rama `main`, carpeta `/docs`. El dominio propio va en `estatico/CNAME`.
- **`optimizar_codigo: true`** minifica el html, css y js de `docs/` en cada regeneración (todos, no sólo los modificados).
  Es **conservador**: quita comentarios y espacios, no renombra nada. Si hay `node`, cada JS minificado se verifica con
  `node --check` y, si falla, se publica el original. `optimizar_excluir` lista patrones que no se tocan (por defecto
  `o/*` y `ir/*`); los archivos `*.min.*` se saltean solos.
- **Caché**: cada `.js` y `.css` se pide con una huella de contenido (`?v=…`; los módulos, mediante un *import map*),
  así el navegador nunca usa una versión vieja.
- **SEO y compartir**: cada página tiene su `canonical`, `og:*`, `theme-color`, y se generan `sitemap.xml` y `robots.txt`.
- **Peso**: cada `update` imprime el peso total de `docs/` y el de los html, css y js propios.

## El lenguaje pila-web

Lenguaje de pila (RPN) que corre en el navegador y controla la página. Se escribe en la URL (`#…`), en atributos
`data-pila-web-<evento>` y en un editor flotante (<kbd>Alt+Esc</kbd> lo muestra, <kbd>Alt+Enter</kbd> evalúa). La
descripción completa, con ejemplos en vivo, está en el artículo `datos/articulos/pila-web.md`; dentro de la página,
`AYU` lista las palabras y `QUE.PALABRA` explica una.

Organización del código:

```
estatico/js/
├── init.js                  arranque: carga los módulos declarados en sitio.yml y ejecuta la URL
├── pila-web/
│   ├── maquina.js           la máquina (pila, tokens, evaluación)
│   └── palabras/*.js        módulos de palabras: nucleo, matematica, texto, salida, ui
└── ui/*.js                  módulos de interfaz: capas, menu, paneles, eventos, atajos, editor, pila, articulo
```

Agregar una palabra es agregar una función a un módulo (o crear uno nuevo y sumarlo a `modulos_pila_web`):

```javascript
export default {
  nombre: 'mio',
  ayuda: { DOB: 'n → 2n   el doble de un número' },       // efecto + dos espacios + descripción
  palabras: { DOB: (vm) => { vm.necesitar(1); vm.push(vm.num(vm.pop()) * 2); } },
};
```

Las palabras de página no tocan la interfaz: emiten órdenes (`vm.orden('abrir', {id})`) que atienden los módulos de
`ui/`, de modo que cualquiera de los dos lados se puede reemplazar. El texto de `ayuda` alimenta `AYU`, `QUE` y la tabla
de referencia del artículo.

## Solución de problemas

- **No pasa nada al escribir una palabra**: un token desconocido se apila como texto. Probá `PIL` o `AYU`.
- **`FOC`, `VAL` y compañía no encuentran el elemento**: necesita un `id`. Se agrega en el HTML o, en Markdown, con `{: #mi-id }`.
- **Un cambio en `estatico/` no se ve**: `update`/`open` lo copian siempre; si usás `file://` los módulos no cargan (usá `open`).
- **Error de Jinja al generar**: casi siempre es una `{{`, `{%` o `{#` suelta en un texto.
- **Un JS no se minificó** (`AVISO` al generar): se publicó el original; el mensaje indica el archivo.
- **Peso**: Fira Code se carga desde Google Fonts. Para no depender de un servicio externo se puede alojar el `woff2` en
  `estatico/` y declarar un `@font-face` en `estatico/css/base.css`.
