export default {
  nombre: 'salida',
  ayuda: {
    LOG: 'a →            muestra el tope (consola y editor) y lo consume',
    VER: 'a → a          muestra el tope sin consumirlo',
    RET: 'a →            fija el resultado de la evaluación (= en el editor)',
  },
  palabras: {
    LOG: (vm) => { vm.necesitar(1); vm.imprimir(vm.pop()); },   // consume y muestra
    VER: (vm) => { vm.necesitar(1); vm.imprimir(vm.mirar(1)); },// muestra sin consumir
    RET: (vm) => { vm.necesitar(1); vm.resultado = vm.pop(); }, // fija el resultado de la evaluación
  },
};
