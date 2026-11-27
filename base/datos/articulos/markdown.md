Los artículos de esta web se escriben en **Markdown**, con algunas extensiones y un par de agregados
propios. Esta guía recorre todo lo que se puede usar. Cada ejemplo muestra primero el código fuente y
después cómo se ve, así que sirve también como hoja de referencia.

## Cómo se arma un artículo

Un artículo son dos archivos:

1. Un **YAML** en `base/datos/paginas/` con los datos de la página.
2. Un **Markdown** en `base/datos/articulos/` con el texto (o el texto escrito dentro del propio YAML, con `md: |`).

```yaml
# base/datos/paginas/mi-articulo.yml
titulo: 'Un título'
plantilla: 'articulo.html'
salida: 'articulos/mi-articulo.html'
archivo: 'articulos/mi-articulo.md'
resumen: 'Una o dos frases que aparecen bajo el título y en las vistas previas.'
fecha: 2026-11-26
autor: 'Caalma'
etiquetas: [markdown, ejemplo]
```

Además de esos campos, la página acepta `portada` (una imagen bajo el título), `portada_alt`,
`color` (el acento de la página), `toc_nivel` (qué títulos entran en el índice lateral, por defecto
`'2-3'`), `paneles` (paneles sueltos disponibles en la página) e `indexar: false` (para sacarla del
`sitemap.xml`).

El texto pasa por tres etapas, en este orden:

1. **Plantillas Jinja**: se reemplazan cosas como {% raw %}`{{ cfg.base }}`{% endraw %}.
2. **Markdown**: se convierte a HTML.
3. **Resaltado**: los bloques de código reciben colores y un botón para copiar.

!!! note "El título de la página"
    El `# título` principal sale del campo `titulo` del YAML. Dentro del texto se empieza en el nivel 2
    (`##`), que es el primero que entra en el índice lateral.

## Texto

### Párrafos y saltos de línea

Un párrafo es un bloque de texto separado de otro por una línea en blanco. Un salto de línea simple
dentro de un párrafo **no** corta la línea: para forzarlo hay que terminar la línea con **dos espacios**.

```markdown
Primera línea del párrafo,
que sigue en la misma línea.

Línea con dos espacios al final  
y esta empieza abajo.
```

Primera línea del párrafo,
que sigue en la misma línea.

Línea con dos espacios al final  
y esta empieza abajo.

### Énfasis y código en línea

```markdown
*cursiva* o _cursiva_, **negrita** o __negrita__, ***ambas***.
Un `fragmento de código` dentro de la frase.
Para escribir un asterisco literal: \*así\*.
```

*cursiva* o _cursiva_, **negrita** o __negrita__, ***ambas***.
Un `fragmento de código` dentro de la frase.
Para escribir un asterisco literal: \*así\*.

El carácter `\` escapa cualquier signo de Markdown: `\* \_ \# \[ \] \( \) \{ \} \! \| \``.

### Formatos que se escriben con HTML

Markdown no tiene sintaxis para todo. Lo que falta se escribe con las etiquetas HTML, que funcionan
dentro del texto y ya tienen estilo en esta web:

```markdown
<mark>resaltado</mark>, <del>tachado</del>, <kbd>Ctrl</kbd>+<kbd>C</kbd>,
H<sub>2</sub>O, x<sup>2</sup>, <small>texto chico</small>, <abbr title="Título">abbr</abbr>.
```

<mark>resaltado</mark>, <del>tachado</del>, <kbd>Ctrl</kbd>+<kbd>C</kbd>,
H<sub>2</sub>O, x<sup>2</sup>, <small>texto chico</small>, <abbr title="Se ve al apoyar el cursor">abbr</abbr>.

Las entidades HTML (`&copy;`, `&amp;`, `&lt;`, `&nbsp;`) también se interpretan: &copy; &amp; &lt;.

## Títulos

### Dos sintaxis

```markdown
## Con almohadillas (de 1 a 6)
### Un nivel más abajo

Con subrayado (sólo niveles 1 y 2)
----------------------------------
```

Cada título recibe un **identificador automático** a partir de su texto (en minúsculas, sin tildes y
con guiones): «Énfasis y código en línea» pasa a ser `enfasis-y-codigo-en-linea`. Con él se puede
enlazar a una sección y, en esta web, se genera el **índice lateral**, el enlace `#` que aparece al
apoyar el cursor sobre el título y el salto con la palabra `IR` del lenguaje pila-web.

### Identificador y clase propios

Con la extensión de atributos se puede fijar el `id` o agregar clases:

```markdown
## Un título con id propio {: #mi-id .mi-clase }
```

!!! warning "Usar siempre `{: …}`, con dos puntos"
    La forma corta {% raw %}`{#mi-id}`{% endraw %} es válida en Markdown, pero acá **no sirve**: Jinja interpreta {% raw %}`{#`{% endraw %} como
    el comienzo de un comentario y se traga el resto del texto. La forma `{: #mi-id }` no tiene ese
    problema.

### Índice dentro del texto

El índice lateral se genera solo. Si además se quiere un índice en un punto del texto, se escribe
`[TOC]` en una línea aparte. Se recomienda no usarlo en artículos, donde ya hay uno.

## Enlaces

```markdown
[Texto del enlace](https://developer.mozilla.org/es/)
[Con título](https://developer.mozilla.org/es/ "Aparece al apoyar el cursor")
[Enlace por referencia][mdn]
<https://developer.mozilla.org/es/>
[Ir a la sección de imágenes](#imagenes)

[mdn]: https://developer.mozilla.org/es/ "MDN"
```

[Texto del enlace](https://developer.mozilla.org/es/)
· [Con título](https://developer.mozilla.org/es/ "Aparece al apoyar el cursor")
· [Enlace por referencia][mdn]
· <https://developer.mozilla.org/es/>
· [Ir a la sección de imágenes](#imagenes)

[mdn]: https://developer.mozilla.org/es/ "MDN"

Los enlaces internos al sitio se escriben con {% raw %}`{{ cfg.base }}`{% endraw %}, que vale `/` (o la
carpeta del proyecto si el sitio no está en la raíz): {% raw %}`[inicio]({{ cfg.base }})`{% endraw %}
da [inicio]({{ cfg.base }}).

### Abrir en otra pestaña

Con atributos se indica el destino. Una pestaña nueva es `_blank`; un nombre propio reutiliza siempre la misma pestaña:

```markdown
[Pestaña nueva](https://developer.mozilla.org/es/){: target="_blank" rel="noopener" }
[Pestaña con nombre](https://developer.mozilla.org/es/){: target="documentacion" rel="noopener" }
```

[Pestaña nueva](https://developer.mozilla.org/es/){: target="_blank" rel="noopener" }
· [Pestaña con nombre](https://developer.mozilla.org/es/){: target="documentacion" rel="noopener" }

!!! note "Direcciones sueltas"
    Una dirección escrita sin más (`https://ejemplo.com`) **no** se convierte en enlace. Hay que
    encerrarla entre `<` y `>`, o usar la sintaxis completa.

## Imágenes

### Sintaxis básica

La imagen se escribe como un enlace precedido de `!`. El texto entre corchetes es el **texto
alternativo** (lo leen los lectores de pantalla y se ve si la imagen no carga).

```markdown
![Una cara sonriente de colores]({% raw %}{{ cfg.base }}{% endraw %}rec/grafica/caalma_perfil.svg "Título opcional")
```

Las imágenes **nunca desbordan** la pantalla: se achican para entrar en el ancho de la columna y no
pasan del 70% del alto de la ventana, siempre conservando la proporción.

![Una cara sonriente de colores]({{ cfg.base }}rec/grafica/caalma_perfil.svg "Título opcional")

### Imagen con pie

Para agregar un pie hay que usar `<figure>` y pedirle a Markdown que procese el interior con
`markdown="1"`:

```html
<figure markdown="1">
![Una cara sonriente]({% raw %}{{ cfg.base }}{% endraw %}rec/grafica/caalma_perfil.svg)
<figcaption>El pie de la figura, centrado y en tono tenue.</figcaption>
</figure>
```

<figure markdown="1">
![Una cara sonriente]({{ cfg.base }}rec/grafica/caalma_perfil.svg)
<figcaption>El pie de la figura, centrado y en tono tenue.</figcaption>
</figure>

### Flotar junto al texto

Las clases `izq` y `der` hacen que la imagen quede a un lado y el texto la rodee. En pantallas
angostas vuelven a ser imágenes centradas.

```markdown
![Cara]({% raw %}{{ cfg.base }}{% endraw %}rec/grafica/caalma_perfil.svg){: .der width="120" }
```

![Cara]({{ cfg.base }}rec/grafica/caalma_perfil.svg){: .der width="120" }
Este párrafo rodea a la imagen que flota a la derecha. El atributo `width` fija un ancho en píxeles;
sin él, la imagen ocupa hasta el 40% de la columna. Lo mismo vale para `.izq`. El texto sigue
fluyendo alrededor hasta que la imagen termina.

Para una imagen debajo del título de la página, sin escribirla en el texto, está el campo `portada` del YAML.

## Listas

### Con viñetas y numeradas

```markdown
- Primero
- Segundo
    - Anidado (cuatro espacios)
    - Otro anidado
- Tercero

1. Uno
2. Dos
3. Tres

5. Una lista que empieza en cinco
6. Sigue en seis
```

- Primero
- Segundo
    - Anidado (cuatro espacios)
    - Otro anidado
- Tercero

1. Uno
2. Dos
3. Tres

5. Una lista que empieza en cinco
6. Sigue en seis

Las viñetas pueden ser `-`, `*` o `+`. Si una lista numerada sigue a una con viñetas hay que dejar una línea
en blanco entre ambas: la extensión `sane_lists` evita que se mezclen.

### Elementos con varios párrafos o código

Lo que va dentro de un elemento se sangra con cuatro espacios:

```markdown
1. El primer paso tiene dos párrafos.

    Este es el segundo párrafo del mismo paso.

2. El segundo paso tiene código:

    ```bash
    ./base/clmweb update
    ```
```

1. El primer paso tiene dos párrafos.

    Este es el segundo párrafo del mismo paso.

2. El segundo paso tiene código:

    ```bash
    ./base/clmweb update
    ```

### Listas de definiciones

```markdown
Pila
:   Estructura donde el último dato en entrar es el primero en salir.

Token
:   Cada trozo de un programa separado de los demás.
```

Pila
:   Estructura donde el último dato en entrar es el primero en salir.

Token
:   Cada trozo de un programa separado de los demás.

## Citas

```markdown
> Una cita simple.
>
> > Una cita dentro de la cita.
```

> Una cita simple.
>
> > Una cita dentro de la cita.

Las citas pueden contener cualquier otro elemento: listas, código, énfasis.

## Código

### En bloques

Un bloque se encierra entre tres acentos graves (o tres tildes `~~~`) y se indica el lenguaje a continuación.
El resaltado lo hace [Pygments](https://pygments.org/), que reconoce cientos de lenguajes (`python`,
`javascript`, `html`, `css`, `yaml`, `json`, `bash`, `sql`, `c`, `rust`, `diff`, `markdown`…). Además, esta web
agrega **`pila-web`**, el lenguaje propio del sitio.

~~~markdown
```python
def saludar(nombre):
    return f"Hola, {nombre}"
```
~~~

```python
def saludar(nombre):
    return f"Hola, {nombre}"
```

```pila-web
~1a1030.fondo.VAR.exploraciones.IR
```

Cada bloque con lenguaje muestra su nombre arriba y un botón **copiar**. Sin lenguaje, el código se
muestra sin colores:

```
texto plano, tal cual
    con su sangría
```

También es código un bloque sangrado con cuatro espacios, aunque no admite lenguaje.

### Identificador y clase del bloque

Con llaves se puede darle `id` y clases al bloque (el lenguaje va como clase, precedido de punto):

~~~markdown
```{.javascript #ejemplo-js .mi-clase}
console.log("hola");
```
~~~

```{.javascript #ejemplo-js .mi-clase}
console.log("hola");
```

!!! note "Qué no hay"
    No hay numeración de líneas ni resaltado de líneas sueltas (`hl_lines`). Para mostrar una
    modificación se puede usar el lenguaje `diff`:

```diff
- const color = "rojo";
+ const color = "azul";
```

## Tablas

La primera fila son los encabezados; los dos puntos de la segunda fila fijan la alineación de cada columna.

```markdown
| Izquierda | Centro | Derecha |
|:----------|:------:|--------:|
| `a`       | **b**  |     1,5 |
| c         | *d*    |    22,0 |
```

| Izquierda | Centro | Derecha |
|:----------|:------:|--------:|
| `a`       | **b**  |     1,5 |
| c         | *d*    |    22,0 |

Las celdas aceptan formato en línea (énfasis, código, enlaces, imágenes pequeñas). No hay celdas combinadas
ni varias líneas dentro de una celda. Si una tabla es más ancha que la pantalla, desliza horizontalmente
sin ensanchar la página.

## Avisos

Los avisos destacan un párrafo. Se escriben con `!!!`, el tipo, un título opcional entre comillas y
el contenido **sangrado con cuatro espacios**:

```markdown
!!! tip "Un consejo"
    Texto del aviso, con *formato* y `código`.
```

!!! note "Nota"
    Información complementaria. Es el tipo por defecto.

!!! tip "Consejo"
    Una sugerencia útil (`tip`, también `hint` y `success`).

!!! warning "Atención"
    Algo que conviene tener presente (`warning`, también `caution` y `attention`).

!!! danger "Peligro"
    Algo que puede romper cosas (`danger`, también `error`).

Un aviso puede ir **sin título** (con comillas vacías) y también puede contener otros avisos y bloques de código:

!!! note ""
    Un aviso sin título.

    !!! tip "Aviso dentro de aviso"
        Y con código:

        ```bash
        ./base/clmweb open
        ```

Cualquier otra palabra funciona como tipo (`!!! receta "Pan"`) y se ve como una nota. Para darle un
color propio basta una regla CSS para `.admonition.receta` que defina `--c`.

## Notas al pie, abreviaturas y plegables

### Notas al pie

```markdown
Un dato que necesita fuente[^fuente].

[^fuente]: La nota aparece al final del artículo, con un enlace para volver.
```

Un dato que necesita fuente[^fuente].

[^fuente]: La nota aparece al final del artículo, con un enlace para volver al punto de lectura.

### Abreviaturas

La definición se escribe en cualquier parte del texto y se aplica a **todas** las apariciones de la palabra:

```markdown
El formato CSS se explica aparte.

*[CSS]: Cascading Style Sheets
```

El formato CSS se explica aparte, y aquí aparece otra vez CSS.

*[CSS]: Cascading Style Sheets

### Contenido plegable

Con `<details>` y `markdown="1"` se hace un bloque que se abre al tocarlo:

```html
<details markdown="1">
<summary>Ver más</summary>

Dentro puede haber **Markdown**, listas y código.

</details>
```

<details markdown="1">
<summary>Ver más</summary>

Dentro puede haber **Markdown**, listas y código.

</details>

## HTML dentro de Markdown

Se puede escribir HTML en cualquier parte. En un bloque HTML (`div`, `section`, `figure`, `details`…) Markdown
**no** procesa el interior, salvo que la etiqueta lleve el atributo `markdown="1"`:

```html
<div class="mi-clase" markdown="1">
Esto sí se procesa como **Markdown**.
</div>

<div class="mi-clase">
Esto queda como **HTML puro**: los asteriscos se ven tal cual.
</div>
```

Los comentarios HTML (`<!-- así -->`) llegan al HTML, pero se eliminan al publicar si está activado
`optimizar_codigo`.

Con HTML también se pueden incluir elementos que reaccionan mediante el lenguaje pila-web, como botones
o campos de texto. Hay un artículo dedicado a eso: [pila-web, el lenguaje de la página]({{ cfg.base }}articulos/pila-web.html).

## Plantillas Jinja

Antes de convertirse en Markdown, el texto pasa por Jinja. Sirve para insertar valores de la configuración:

| Se escribe | Vale |
|---|---|
| {% raw %}`{{ cfg.base }}`{% endraw %} | `{{ cfg.base }}` |
| {% raw %}`{{ cfg.urls.sitio }}`{% endraw %} | `{{ cfg.urls.sitio }}` |
| {% raw %}`{{ cfg.urls.repositorio }}`{% endraw %} | `{{ cfg.urls.repositorio }}` |
| {% raw %}`{{ cfg.actualizacion }}`{% endraw %} | `{{ cfg.actualizacion }}` |

Y permite dejar **notas que no se publican**, con un comentario Jinja: {% raw %}`{# esto no aparece #}`{% endraw %}.

### Cuidado con las llaves

Jinja actúa sobre tres combinaciones: {% raw %}`{{`, `{%` y `{#`{% endraw %}. Si alguna aparece en el texto o en un bloque de
código (por ejemplo, al mostrar código de otro lenguaje de plantillas), hay que protegerlo:

~~~markdown
{{ '{% raw %}' }}
Aquí se puede escribir {{ '{{ lo que sea }}' }} sin que Jinja lo toque.
{{ '{% endraw %}' }}
~~~

## Lo que no está soportado

Algunas sintaxis de otras variantes de Markdown no funcionan acá. Se ven como texto literal, así que
conviene saberlo:

| No funciona | Alternativa |
|---|---|
| `~~tachado~~` | `<del>tachado</del>` |
| `- [x] tarea` (listas de tareas) | una lista común con símbolos: `✓` y `○` |
| `https://ejemplo.com` suelto | `<https://ejemplo.com>` |
| Salto de línea con `\` al final | dos espacios al final de la línea |
| `$x^2$` (fórmulas), `:smile:` (emojis) | escribir `x<sup>2</sup>`, o el carácter Unicode: 🙂 |
| {% raw %}`{#id}`{% endraw %} en un título | `{: #id }` |
| Numeración o resalte de líneas de código | bloque `diff`, o explicar en el texto |
| Pestañas, columnas, celdas combinadas | HTML con `markdown="1"` |

## Referencia rápida

| Para escribir | Sintaxis |
|---|---|
| Título | `## Título` (nivel 2 a 6) |
| Id de un título | `## Título {: #id }` |
| Cursiva / negrita | `*texto*` / `**texto**` |
| Código en línea | `` `código` `` |
| Enlace / en pestaña nueva | `[texto](url)` / `[texto](url){: target="_blank" }` |
| Imagen / flotante | `![alt](url)` / `![alt](url){: .der }` |
| Imagen con pie | `<figure markdown="1">` + `<figcaption>` |
| Lista / numerada | `- item` / `1. item` |
| Cita | `> texto` |
| Bloque de código | tres acentos graves + lenguaje (`pila-web` incluido) |
| Tabla | `\| a \| b \|` con `\|---\|---\|` debajo |
| Aviso | `!!! note "Título"` + contenido sangrado |
| Nota al pie | `texto[^1]` y `[^1]: nota` |
| Abreviatura | `*[SIGLA]: significado` |
| Plegable | `<details markdown="1">` |
| Definición | `Término` + `:   descripción` |
| Separador | `---` |
| Valor de configuración | {% raw %}`{{ cfg.base }}`{% endraw %} |
