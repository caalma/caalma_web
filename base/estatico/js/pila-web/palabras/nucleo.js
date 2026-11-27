// Manejo de pila.
export default {
  nombre: 'nucleo',
  ayuda: {
    DUP: 'a → a a        duplica el tope',
    DRP: 'a →            descarta el tope',
    SWP: 'a b → b a      intercambia los dos de arriba',
    ROT: 'a b c → b c a  rota los tres de arriba',
    OVR: 'a b → a b a    copia el segundo',
    NIP: 'a b → b        descarta el segundo',
    TUK: 'a b → b a b    copia el tope debajo del segundo',
    CLR: '→              vacía la pila',
    PRF: '→ n            apila cuántos datos hay',
    _DT: 'a →            lleva el tope a la pila temporal',
    _TD: '→ a            trae el tope de la pila temporal',
    AYU: '→              lista todas las palabras con su explicación',
    QUE: 'QUE PALABRA    explica una palabra. Ej: QUE.FOC',
  },
  palabras: {
    DUP: (vm) => { vm.necesitar(1); vm.push(vm.mirar(1)); },                    // a -> a a
    DRP: (vm) => { vm.necesitar(1); vm.pop(); },                                // a ->
    SWP: (vm) => { vm.necesitar(2); const b = vm.pop(), a = vm.pop(); vm.push(b); vm.push(a); },       // a b -> b a
    ROT: (vm) => { vm.necesitar(3); const c = vm.pop(), b = vm.pop(), a = vm.pop(); vm.push(b); vm.push(c); vm.push(a); }, // a b c -> b c a
    OVR: (vm) => { vm.necesitar(2); vm.push(vm.mirar(2)); },                    // a b -> a b a
    NIP: (vm) => { vm.necesitar(2); const b = vm.pop(); vm.pop(); vm.push(b); },// a b -> b
    TUK: (vm) => { vm.necesitar(2); const b = vm.pop(), a = vm.pop(); vm.push(b); vm.push(a); vm.push(b); }, // a b -> b a b
    CLR: (vm) => { vm.pila.length = 0; },
    PRF: (vm) => { vm.push(vm.pila.length); },                                  // profundidad
    _DT: (vm) => { vm.temp.push(vm.pop()); },                                   // datos -> temporal
    _TD: (vm) => {
      if (!vm.temp.length) throw new Error('pila temporal vacía');
      vm.push(vm.temp.pop());
    },
    AYU: (vm) => {                                                              // lista todo, por módulo
      const filas = [];
      for (const [mod] of vm.modulos) {
        filas.push(`— ${mod} —`);
        for (const [n, a] of vm.ayuda) if (a.modulo === mod) filas.push(`${n.padEnd(5)} ${a.texto}`);
        for (const n of vm.palabras.keys()) if (!vm.ayuda.has(n) && vm.modulos.get(mod).palabras[n]) filas.push(n);
      }
      vm.imprimir(filas.join('\n'));
    },
    QUE: (vm) => {                                                              // QUE.FOC
      const n = vm.siguiente();
      const a = vm.ayuda.get(n);
      vm.imprimir(a ? `${n.padEnd(5)} ${a.texto}` : vm.palabras.has(n) ? `${n}: sin explicación` : `${n}: no es una palabra (se apilaría como texto)`);
    },
  },
};
