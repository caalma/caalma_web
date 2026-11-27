# -*- coding:utf-8 -*-
"""Bloques de código: resalta con Pygments (si está instalado) y los envuelve en
<figure class="codigo" data-lang="..."> para darles estilo desde css/codigo.css.
Sin Pygments los bloques salen igual, sólo que sin colores."""
import html as _html
import re

try:
    from pygments import highlight
    from pygments.formatters import HtmlFormatter
    from pygments.lexer import RegexLexer
    from pygments.lexers import get_lexer_by_name
    from pygments.token import Comment, Keyword, Name, Number, Punctuation, String, Whitespace
    from pygments.util import ClassNotFound
    HAY_PYGMENTS = True
except ImportError:                                     # pragma: no cover
    HAY_PYGMENTS = False

if HAY_PYGMENTS:
    class PilaWebLexer(RegexLexer):
        """El lenguaje de pila de la web: PALABRAS en mayúsculas, números, ~colores y datos."""
        name = 'pila-web'
        aliases = ['pila-web', 'pilaweb']
        tokens = {'root': [
            (r'\s+', Whitespace),
            (r'~[0-9a-fA-F]{3,8}\b', Number.Hex),
            (r'-?\d+(?:_\d+)?(?=[\s.]|$)', Number),
            (r'_?[A-Z][A-Z0-9]{1,5}(?=[\s.]|$)', Keyword),
            (r'\.', Punctuation),
            (r'[^\s.]+', String),
        ]}

    def _lexer(lang):
        if lang in ('pila-web', 'pilaweb'):
            return PilaWebLexer()
        try:
            return get_lexer_by_name(lang)
        except ClassNotFound:
            return None

_BLOQUE = re.compile(r'<pre([^>]*)><code(?: class="language-([^"]+)")?[^>]*>(.*?)</code></pre>', re.S)


def _envolver(m):
    attrs, lang_crudo, crudo = m.groups()
    lang = (lang_crudo or '').split()[0] if lang_crudo else ''
    codigo = _html.unescape(crudo)
    cuerpo = _html.escape(codigo, quote=False)
    if HAY_PYGMENTS and lang:
        lex = _lexer(lang)
        if lex:
            cuerpo = highlight(codigo, lex, HtmlFormatter(nowrap=True, classprefix='t-')).rstrip('\n')
    # ```{.python #mi-id .mi-clase}  →  id y clases pasan al marco
    ident = re.search(r'id="([^"]+)"', attrs)
    clases = re.search(r'class="([^"]+)"', attrs)
    etiqueta = f'<figcaption>{_html.escape(lang)}</figcaption>' if lang else ''
    dl = f' data-lang="{_html.escape(lang)}"' if lang else ''
    ida = f' id="{ident.group(1)}"' if ident else ''
    cl = 'codigo' + (' ' + clases.group(1) if clases else '')
    return f'<figure class="{cl}"{ida}{dl}>{etiqueta}<pre tabindex="0"><code>{cuerpo}</code></pre></figure>'


def resaltar(texto_html):
    return _BLOQUE.sub(_envolver, texto_html)
