export class ErrorPilaWeb extends Error{}
export const SEGURO=/^[A-Za-z0-9\-_.;,~!*+'()\[\]{}%]*$/;export class Maquina{constructor(){this.pila=[];this.temp=[];this.resultado=undefined;this.palabras=new Map();this.modulos=new Map();this.ayuda=new Map();this.contexto={};this.ctx={};}
usar(modulo){for(const[nombre,fn]of Object.entries(modulo.palabras))this.palabras.set(nombre,fn);this.modulos.set(modulo.nombre,modulo);for(const[nombre,texto]of Object.entries(modulo.ayuda??{}))this.ayuda.set(nombre,{texto,modulo:modulo.nombre});return this;}
definir(nombre,fn){this.palabras.set(nombre,fn);return this;}
quitar(nombre){this.palabras.delete(nombre);return this;}
push(v){this.pila.push(v);}
pop(){if(!this.pila.length)throw new ErrorPilaWeb('pila vacía');return this.pila.pop();}
mirar(i=1){return this.pila[this.pila.length-i];}
necesitar(n){if(this.pila.length<n)throw new ErrorPilaWeb(`pila insuficiente (requiere ${n}, hay ${this.pila.length})`);}
num(v){if(typeof v==='number')return v;let s=String(v),base=10;if(s.startsWith('~')){base=16;s=s.slice(1);}
const n=base===16?parseInt(s,16):parseFloat(s.replace('_','.'));if(!Number.isFinite(n))throw new ErrorPilaWeb(`no es número: ${v}`);return n;}
valor(v){if(typeof v!=='string')return v;if(/^~[0-9a-fA-F]{3,8}$/.test(v))return'#'+v.slice(1);if(/^-?\d+_\d+$/.test(v))return v.replace('_','.');return v;}
el(v){if(v instanceof Element)return v;const e=document.getElementById(String(v));if(!e)throw new ErrorPilaWeb(`no hay ningún elemento con id "${v}"`);return e;}
texto(v){return v instanceof Element?`<${v.tagName.toLowerCase()}${v.id ? '#' + v.id : ''}>`:String(v);}
siguiente(){if(this._i+1>=this._t.length)throw new ErrorPilaWeb('falta una palabra a continuación');return this._t[++this._i];}
imprimir(v){console.log('[pila-web]',v);this.ctx.bus?.dispatchEvent(new CustomEvent('pila-web:salida',{detail:v}));}
orden(nombre,detalle={}){this.ctx.bus?.dispatchEvent(new CustomEvent('orden:'+nombre,{detail:detalle}));}
tokenizar(codigo){return String(codigo).split(/[.\s]+/).filter(Boolean);}
eval(codigo,{estricto=false,limpiar=false,elemento=null,evento=null,instante=false}={}){this.resultado=undefined;if(limpiar){this.pila=[];this.temp=[];}
if(estricto&&!SEGURO.test(codigo)){return{resultado:undefined,pila:[...this.pila],error:`código no válido: ${codigo}`};}
const previo=[this._t,this._i,this.contexto];this.contexto={elemento,evento,instante};this._t=this.tokenizar(codigo);let error=null;for(this._i=0;this._i<this._t.length;this._i++){const t=this._t[this._i];try{const palabra=this.palabras.get(t);palabra?palabra(this):this.pila.push(t);}catch(e){error=`${t}: ${e.message}`;break;}}
[this._t,this._i,this.contexto]=previo;if(error)console.warn('[pila-web]',error);return{resultado:this.resultado,pila:[...this.pila],error};}}