# -*- coding:utf-8 -*-
"""Minificadores sin dependencias para HTML, CSS y JS.

Son *conservadores*: sacan comentarios y espacios que sobran, pero no renombran
variables ni reescriben código, y en JS mantienen los saltos de línea que podrían
importar (inserción automática de ;). Si hay `node` instalado, cada JS minificado
se verifica con `node --check` y, si no pasa, se publica el original.
"""
import fnmatch
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path


# ======================================================================= CSS
def css(src):
    out = []
    n, i, depth, pend = len(src), 0, 0, False

    def emit(tok):
        nonlocal pend
        if pend and out:
            l, f = out[-1][-1], tok[0]
            if depth == 0:
                quitar = l in '{};,>:' or f in '{};,>'
            else:                                   # dentro de ( ): calc(a + b) necesita sus espacios
                quitar = l in '(,:' or f in '),'
            if not quitar:
                out.append(' ')
        pend = False
        if tok == '}' and out and out[-1] == ';':   # el último ; de un bloque sobra
            out.pop()
        out.append(tok)

    while i < n:
        c = src[i]
        if src.startswith('/*', i):
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
            pend = True
        elif c in '"\'':
            j = i + 1
            while j < n and src[j] != c:
                j += 2 if src[j] == '\\' else 1
            emit(src[i:j + 1])
            i = j + 1
        elif c.isspace():
            pend = True
            i += 1
        else:
            if c == '(':
                emit(c); depth += 1
            elif c == ')':
                emit(c); depth = max(0, depth - 1)
            else:
                emit(c)
            i += 1
    return ''.join(out)


# ======================================================================== JS
_KW_REGEX = {'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
             'throw', 'case', 'do', 'else', 'yield', 'await'}
_ANTES_REGEX = set('(,=:[!&|?{};+-*%<>~^}')
_SOLTAR_NL_TRAS = set('{([,;:=?*%&|^<>!~.')       # un salto después de esto nunca hace falta
_SOLTAR_NL_ANTES = set('})],;.?:')                 # ni antes de esto
_NUM = re.compile(r'0[xXbBoO][0-9a-fA-F_]+n?|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?n?')
_PAL = re.compile(r'[A-Za-z0-9_$\u0080-\uffff]+')


def _ident(ch):
    return ch.isalnum() or ch in '_$' or ord(ch) > 127


def js(src):
    n = len(src)
    out = []
    i = 0
    ws = 0                    # 0 nada · 1 espacio · 2 salto de línea pendiente
    kind = ''                 # tipo del último token: word num str regex tpl punct
    last = ''
    word = ''

    def skip_str(k):
        q = src[k]; k += 1
        while k < n and src[k] != q:
            k += 2 if src[k] == '\\' else 1
        return k + 1

    def scan_tpl(k):
        k += 1
        while k < n:
            c = src[k]
            if c == '\\':
                k += 2
            elif c == '`':
                return k + 1
            elif c == '$' and src[k + 1:k + 2] == '{':
                k = scan_braces(k + 2)
            else:
                k += 1
        return n

    def scan_braces(k):
        depth = 1
        while k < n and depth:
            c = src[k]
            if c in '\'"':
                k = skip_str(k)
            elif c == '`':
                k = scan_tpl(k)
            elif src.startswith('//', k):
                j = src.find('\n', k); k = n if j < 0 else j
            elif src.startswith('/*', k):
                j = src.find('*/', k + 2); k = n if j < 0 else j + 2
            else:
                depth += (c == '{') - (c == '}')
                k += 1
        return k

    def emit(tok, k):
        nonlocal ws, last, kind, word
        if ws and out:
            f = tok[0]
            if ws == 2:
                if not (last in _SOLTAR_NL_TRAS or f in _SOLTAR_NL_ANTES):
                    out.append('\n')
            else:
                if ((_ident(last) and _ident(f))
                        or (last in '+-' and f == last)
                        or (last == '/' and f in '/*')
                        or (kind == 'regex' and _ident(f))):
                    out.append(' ')
        ws = 0
        out.append(tok)
        last = tok[-1]
        kind = k
        word = tok if k == 'word' else ''

    def regex_ok():
        if not out:
            return True
        if kind == 'word':
            return word in _KW_REGEX
        if kind in ('num', 'str', 'regex', 'tpl'):
            return False
        tail = ''.join(out[-2:])
        if tail.endswith('++') or tail.endswith('--'):
            return False
        return last in _ANTES_REGEX

    while i < n:
        c = src[i]
        if c in ' \t\r\f\v\n':
            ws = max(ws, 2 if c == '\n' else 1)
            i += 1
        elif src.startswith('//', i):
            j = src.find('\n', i)
            i = n if j < 0 else j
            ws = max(ws, 1)
        elif src.startswith('/*', i):
            j = src.find('*/', i + 2)
            j = n if j < 0 else j + 2
            ws = max(ws, 2 if '\n' in src[i:j] else 1)
            i = j
        elif c in '\'"':
            j = skip_str(i); emit(src[i:j], 'str'); i = j
        elif c == '`':
            j = scan_tpl(i); emit(src[i:j], 'tpl'); i = j
        elif c == '/' and regex_ok():
            j, en_clase = i + 1, False
            while j < n and (en_clase or src[j] != '/') and src[j] != '\n':
                if src[j] == '\\':
                    j += 1
                elif src[j] == '[':
                    en_clase = True
                elif src[j] == ']':
                    en_clase = False
                j += 1
            j += 1
            while j < n and src[j].isalpha():
                j += 1
            emit(src[i:j], 'regex'); i = j
        else:
            m = _NUM.match(src, i) if (c.isdigit() or (c == '.' and src[i + 1:i + 2].isdigit())) else None
            if m:
                emit(m.group(), 'num'); i = m.end()
                continue
            m = _PAL.match(src, i)
            if m:
                emit(m.group(), 'word'); i = m.end()
            else:
                emit(c, 'punct'); i += 1
    return ''.join(out).strip()


def js_verificado(src):
    """js() + verificación con `node --check` si hay node. Devuelve (código, aviso|None)."""
    mini = js(src)
    node = shutil.which('node')
    if not node:
        return mini, None
    with tempfile.TemporaryDirectory() as d:
        ruta = Path(d) / 'x.mjs'
        ruta.write_text(mini, encoding='utf-8')
        r = subprocess.run([node, '--check', str(ruta)], capture_output=True, text=True)
    if r.returncode != 0:
        return src, 'el JS minificado no pasó node --check; se publica sin minificar'
    return mini, None


# ===================================================================== JSON
def json_ws(src):
    """Quita los espacios de un JSON sin tocar los textos (y sin reserializar)."""
    out, en_str, esc = [], False, False
    for c in src:
        if en_str:
            out.append(c)
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == '"': en_str = False
        elif c == '"':
            en_str = True; out.append(c)
        elif not c.isspace():
            out.append(c)
    return ''.join(out)


# ===================================================================== HTML
_BLOQUE = {'html', 'head', 'body', 'meta', 'link', 'title', 'script', 'style', 'noscript',
           'main', 'header', 'footer', 'nav', 'section', 'article', 'aside', 'div', 'p',
           'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table',
           'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'figure', 'figcaption', 'blockquote',
           'pre', 'hr', 'br', 'form', 'fieldset', 'details', 'summary', 'base'}
_CRUDOS = {'script', 'style', 'pre', 'textarea'}
_ETIQ = re.compile(r'<!--.*?-->|<![^>]*>|<(/?)([A-Za-z][A-Za-z0-9:-]*)((?:[^>"\']|"[^"]*"|\'[^\']*\')*)>', re.S)
_ATTR = re.compile(r'([^\s"\'=/>]+)(?:\s*=\s*("[^"]*"|\'[^\']*\'|[^\s"\'>]+))?|/')


def _etiqueta(cierra, nombre, attrs):
    partes = []
    for m in _ATTR.finditer(attrs):
        if m.group(1):
            partes.append(' ' + m.group(1) + ('=' + m.group(2) if m.group(2) else ''))
        else:
            partes.append('/')
    return '<' + cierra + nombre + ''.join(partes) + '>'


def html(src, verificar_js=True):
    items = []            # ('t', texto) | ('e', nombre, texto_etiqueta) | ('c', texto crudo)
    pos = 0
    avisos = []
    while True:
        m = _ETIQ.search(src, pos)
        texto = src[pos:m.start()] if m else src[pos:]
        if texto:
            if items and items[-1][0] == 't':
                items[-1] = ('t', items[-1][1] + texto)
            else:
                items.append(('t', texto))
        if not m:
            break
        pos = m.end()
        lit = m.group()
        if lit.startswith('<!--'):
            continue
        if lit.startswith('<!'):
            items.append(('c', re.sub(r'\s+', ' ', lit)))
            continue
        cierra, nombre, attrs = m.group(1), m.group(2).lower(), m.group(3)
        tag = _etiqueta(cierra, m.group(2), attrs)
        if nombre in _CRUDOS and not cierra and not attrs.rstrip().endswith('/'):
            fin = re.compile(r'</' + nombre + r'\s*>', re.I).search(src, pos)
            if fin:
                interior = src[pos:fin.start()]
                if nombre == 'style':
                    interior = css(interior)
                elif nombre == 'script':
                    tipo = re.search(r'type\s*=\s*["\']?([^"\'\s>]+)', attrs)
                    tipo = tipo.group(1).lower() if tipo else ''
                    if tipo in ('importmap', 'application/json', 'application/ld+json'):
                        interior = json_ws(interior)
                    elif tipo in ('', 'module', 'text/javascript', 'application/javascript') and interior.strip():
                        if verificar_js:
                            interior, aviso = js_verificado(interior)
                            if aviso: avisos.append(aviso)
                        else:
                            interior = js(interior)
                items.append(('e', nombre, tag))
                items.append(('c', interior))
                items.append(('e', nombre, '</' + nombre + '>'))
                pos = fin.end()
                continue
        items.append(('e', nombre, tag))

    def es_bloque(it):
        return it is None or (it[0] == 'e' and it[1] in _BLOQUE)

    out = []
    for k, it in enumerate(items):
        if it[0] == 't':
            t = re.sub(r'\s+', ' ', it[1])
            if es_bloque(items[k - 1] if k else None):
                t = t.lstrip()
            if es_bloque(items[k + 1] if k + 1 < len(items) else None):
                t = t.rstrip()
            out.append(t)
        elif it[0] == 'e':
            out.append(it[2])
        else:
            out.append(it[1])
    return ''.join(out).strip(), avisos


# ================================================================ publicación
def optimizar(raiz, excluir=()):
    """Minifica los .html/.css/.js bajo `raiz`. Devuelve (bytes_antes, bytes_despues, avisos)."""
    antes = despues = 0
    avisos = []
    for p in sorted(Path(raiz).rglob('*')):
        if not p.is_file() or p.suffix not in ('.html', '.css', '.js', '.mjs'):
            continue
        rel = p.relative_to(raiz).as_posix()
        if '.min.' in p.name or any(fnmatch.fnmatch(rel, pat) for pat in excluir):
            continue
        orig = p.read_text(encoding='utf-8')
        try:
            if p.suffix == '.html':
                nuevo, av = html(orig)
                avisos += [f'{rel}: {a}' for a in av]
            elif p.suffix == '.css':
                nuevo = css(orig)
            else:
                nuevo, av = js_verificado(orig)
                if av: avisos.append(f'{rel}: {av}')
        except Exception as e:                      # nunca romper la publicación por minificar
            avisos.append(f'{rel}: no se pudo minificar ({e})')
            continue
        antes += len(orig.encode())
        if nuevo and len(nuevo.encode()) < len(orig.encode()):
            p.write_text(nuevo, encoding='utf-8')
            despues += len(nuevo.encode())
        else:
            despues += len(orig.encode())
    return antes, despues, avisos
