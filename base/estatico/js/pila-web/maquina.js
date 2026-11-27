// pila-web: lenguaje mínimo de pila (RPN) pensado para vivir en la URL, en atributos y en el editor.
//
//   código  = tokens separados por "." o por espacios/saltos de línea
//   token   = PALABRA (si está registrada)  ó  dato (se apila como texto)
//   números = "12", "2_5" (=2.5), "~ff" (=255, hex). Las palabras convierten con vm.num()
//
// Todo lo que sabe hacer el lenguaje son *palabras* agrupadas en *módulos*:
//   { nombre: 'mi-modulo', palabras: { NOM: (vm) => { ... } } }
// Ver palabras/*.js. Para agregar una función nueva basta una palabra nueva.

export class ErrorPilaWeb extends Error {}

// Caracteres admitidos cuando el código viene de la URL (#...)
export const SEGURO = /^[A-Za-z0-9\-_.;,~!*+'()\[\]{}%]*$/;

export class Maquina {
  constructor() {
    this.pila = [];            // pila de datos
    this.temp = [];            // pila temporal (_DT / _TD)
    this.resultado = undefined; // lo fija RET
    this.palabras = new Map();
    this.modulos = new Map();
    this.ayuda = new Map();    // NOMBRE -> { texto, modulo }   (lo usan AYU y QUE)
    this.contexto = {};        // { elemento, evento, instante } durante una evaluación
    this.ctx = {};             // contexto de la app (bus, estado, cfg). Lo completa init.js
  }

  // --- extensión -----------------------------------------------------------
  usar(modulo) {
    for (const [nombre, fn] of Object.entries(modulo.palabras)) this.palabras.set(nombre, fn);
    this.modulos.set(modulo.nombre, modulo);
    for (const [nombre, texto] of Object.entries(modulo.ayuda ?? {})) this.ayuda.set(nombre, { texto, modulo: modulo.nombre });
    return this;
  }
  definir(nombre, fn) { this.palabras.set(nombre, fn); return this; }
  quitar(nombre) { this.palabras.delete(nombre); return this; }

  // --- pila ------------------------------------------------------------------
  push(v) { this.pila.push(v); }
  pop() {
    if (!this.pila.length) throw new ErrorPilaWeb('pila vacía');
    return this.pila.pop();
  }
  mirar(i = 1) { return this.pila[this.pila.length - i]; }
  necesitar(n) {
    if (this.pila.length < n) throw new ErrorPilaWeb(`pila insuficiente (requiere ${n}, hay ${this.pila.length})`);
  }

  // --- conversiones ------------------------------------------------------------
  num(v) {
    if (typeof v === 'number') return v;
    let s = String(v), base = 10;
    if (s.startsWith('~')) { base = 16; s = s.slice(1); }
    const n = base === 16 ? parseInt(s, 16) : parseFloat(s.replace('_', '.'));
    if (!Number.isFinite(n)) throw new ErrorPilaWeb(`no es número: ${v}`);
    return n;
  }
  // "~1a2b3c" -> "#1a2b3c" ; "2_5" -> "2.5" ; resto igual
  valor(v) {
    if (typeof v !== 'string') return v;
    if (/^~[0-9a-fA-F]{3,8}$/.test(v)) return '#' + v.slice(1);
    if (/^-?\d+_\d+$/.test(v)) return v.replace('_', '.');
    return v;
  }
  // acepta un elemento (lo que apilan EL y YO) o el id de uno
  el(v) {
    if (v instanceof Element) return v;
    const e = document.getElementById(String(v));
    if (!e) throw new ErrorPilaWeb(`no hay ningún elemento con id "${v}"`);
    return e;
  }
  // descripción corta de un valor para mostrarlo:  <section#portada>
  texto(v) {
    return v instanceof Element ? `<${v.tagName.toLowerCase()}${v.id ? '#' + v.id : ''}>` : String(v);
  }
  // palabras que leen el token siguiente en vez de la pila (ej: QUE.FOC)
  siguiente() {
    if (this._i + 1 >= this._t.length) throw new ErrorPilaWeb('falta una palabra a continuación');
    return this._t[++this._i];
  }

  // --- salida / órdenes hacia la interfaz -------------------------------------
  imprimir(v) {
    console.log('[pila-web]', v);
    this.ctx.bus?.dispatchEvent(new CustomEvent('pila-web:salida', { detail: v }));
  }
  orden(nombre, detalle = {}) {
    this.ctx.bus?.dispatchEvent(new CustomEvent('orden:' + nombre, { detail: detalle }));
  }

  // --- evaluación ---------------------------------------------------------------
  tokenizar(codigo) { return String(codigo).split(/[.\s]+/).filter(Boolean); }

  eval(codigo, { estricto = false, limpiar = false, elemento = null, evento = null, instante = false } = {}) {
    this.resultado = undefined;
    if (limpiar) { this.pila = []; this.temp = []; }
    if (estricto && !SEGURO.test(codigo)) {
      return { resultado: undefined, pila: [...this.pila], error: `código no válido: ${codigo}` };
    }
    // reentrante: un evento disparado por una palabra puede evaluar otro código sin pisar a éste
    const previo = [this._t, this._i, this.contexto];
    this.contexto = { elemento, evento, instante };
    this._t = this.tokenizar(codigo);
    let error = null;
    for (this._i = 0; this._i < this._t.length; this._i++) {
      const t = this._t[this._i];
      try {
        const palabra = this.palabras.get(t);
        palabra ? palabra(this) : this.pila.push(t);
      } catch (e) {
        error = `${t}: ${e.message}`;
        break;
      }
    }
    [this._t, this._i, this.contexto] = previo;
    if (error) console.warn('[pila-web]', error);
    return { resultado: this.resultado, pila: [...this.pila], error };
  }
}
