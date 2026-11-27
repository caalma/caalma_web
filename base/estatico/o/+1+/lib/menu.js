/* Menú de +1+.
   Se muestra cuando se entra a la página sin indicar una imagen, o con una que no existe.
   Lo carga index.html (junto con composiciones.js, que define cuáles imágenes hay). No usa Hydra. */
(function () {
    'use strict';

    /* Nombre de cada imagen. Si se agrega una composición en composiciones.js y no figura acá,
       aparece igual en el menú con su letra. */
    var nombres = {
        a: 'microondas',
        b: 'pixel corvo',
        c: 'bloque espiral',
        d: 'floral tron',
        e: 'vórtice eeeee ee ee ee',
        f: 'lente'
    };
    var colores = ['#8b7cf6', '#4fd18b', '#4aa8ff', '#ff6b6b', '#ffb454', '#e879c9'];

    function el(tag, props) {
        var e = Object.assign(document.createElement(tag), props || {});
        for (var i = 2; i < arguments.length; i++) if (arguments[i] != null) e.append(arguments[i]);
        return e;
    }

    /* el menú reemplaza al lienzo de la obra */
    ['vcanvas', 'data', 'container'].forEach(function (id) {
        var x = document.getElementById(id);
        if (x) x.remove();
    });
    var css = el('link', { rel: 'stylesheet', href: './lib/menu.css' });
    document.head.appendChild(css);
    document.body.className = 'menu';
    document.title = '+1+ · elegí una imagen';

    var pedido = window.ID_OBRA || '';
    var ids = Object.keys(parametrosInit);

    var lista = el('ul', { className: 'imagenes' });
    ids.forEach(function (id, i) {
        var tile = el('a', { href: '?' + id, className: 'imagen' },
            el('span', { className: 'letra', textContent: id }),
            el('span', { className: 'nombre', textContent: nombres[id] || 'imagen ' + id }),
            el('code', { textContent: '?' + id }));
        tile.style.setProperty('--c', colores[i % colores.length]);
        lista.appendChild(el('li', {}, tile));
    });

    document.body.append(el('main', {},
        el('header', {},
            el('h1', { textContent: '+1+' }),
            el('p', { className: 'autoria', textContent: 'obra de caalma · Carlos Alberto Macheratti' })),

        el('section', { className: 'texto' },
            el('p', {}, el('strong', { textContent: '+1+' }),
                ' es una obra impresa de seis imágenes. Cada imagen lleva un código QR que abre esta página ' +
                'con su versión interactiva.'),
            el('p', { textContent:
                'Allí la imagen se genera en tiempo real y se transforma con dos controles: dos círculos que se ' +
                'arrastran con el dedo o con el mouse. Cada círculo cambia dos valores de la imagen, uno según su ' +
                'posición horizontal y otro según la vertical.' })),

        el('nav', { 'aria-label': 'Imágenes de la obra' },
            el('p', { className: pedido ? 'aviso' : 'pie-menu',
                      textContent: pedido
                          ? 'No existe la imagen «' + pedido + '».'
                          : 'Llegaste sin indicar una imagen.' }),
            el('p', { className: 'pie-menu', textContent: 'Escaneá el QR de la que quieras ver, o elegí una:' }),
            lista),

        el('footer', {},
            el('a', { href: '/', textContent: 'caalma.net.ar' }),
            ' · visuales en vivo con ',
            el('a', { href: 'https://hydra.ojack.xyz', rel: 'noopener', textContent: 'Hydra' }))));
})();
