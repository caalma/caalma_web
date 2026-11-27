var p = new Object();

var parametrosInit = {
    'a': () => {
        config = [
            {
                id: 'a',
                min: 0.1,
                max: 10,
                step: 0.1,
                initialX: 150,
                initialY: 200,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            },
            {
                id: 'b',
                min: 1,
                max: 20,
                step: 1,
                initialX: 200,
                initialY: 150,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            }
        ];
    },

    'b': () => {
        config = [
            {
                id: 'a',
                min: 0,
                max: 10,
                step: 1,
                initialX: 100,
                initialY: 100,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            },
            {
                id: 'b',
                min: -3,
                max: 3,
                step: 0.01,
                initialX: 150,
                initialY: 150,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            }
        ];
    },

    'c': () => {
        config = [
            {
                id: 'a',
                min: 0,
                max: 6,
                step: 0.1,
                initialX: 150,
                initialY: 200,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            },
            {
                id: 'b',
                min: 2,
                max: 30,
                step: 0.1,
                initialX: 200,
                initialY: 150,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            }
        ];
    },

    'd': () => {
        config = [
            {
                id: 'a',
                min: 1,
                max: 30,
                step: 1,
                initialX: 150,
                initialY: 200,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            },
            {
                id: 'b',
                min: -1.0,
                max: 1,
                step: 0.1,
                initialX: 200,
                initialY: 150,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            }
        ];
    },

    'e': () => {
        config = [
            {
                id: 'a',
                min: 1.0,
                max: 3.0,
                step: 0.1,
                initialX: 250,
                initialY: 250,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            },
            {
                id: 'b',
                min: -10,
                max: 10,
                step: 1,
                initialX: 200,
                initialY: 200,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            }
        ];
    },

    'f': () => {
        config = [
            {
                id: 'a',
                min: -3.0,
                max: 3.0,
                step: 0.1,
                initialX: 260,
                initialY: 230,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            },
            {
                id: 'b',
                min: -2,
                max: 6,
                step: 1,
                initialX: 200,
                initialY: 150,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            }
        ];
    },

}


var parametros = {
    'a': () => {
        p.a1 = values['a-v']; p.a2 = values['a-w'];
        p.b1 = values['b-v']; p.b2 = values['b-w'];
    },

    'b': () => {
        p.a1 = values['a-v']; p.a2 = values['a-w'];
        p.b1 = values['b-v']; p.b2 = values['b-w'];
    },

    'c': () => {
        p.a1 = values['a-v']; p.a2 = values['a-w'];
        p.b1 = values['b-v']; p.b2 = values['b-w'];
    },

    'd': () => {
        p.a1 = values['a-v']; p.a2 = values['a-w'];
        p.b1 = values['b-v']; p.b2 = values['b-w'];
    },

    'e': () => {
        p.a1 = values['a-v']; p.a2 = values['a-w'];
        p.b1 = values['b-v']; p.b2 = values['b-w'];
    },

    'f': () => {
        p.a1 = values['a-v']; p.a2 = values['a-w'];
        p.b1 = values['b-v']; p.b2 = values['b-w'];
    }
}

var composicion = {
    // microondas
    'a': () => {
        speed = 0.3;
        let s = (n) => noise(n,n,n)
        s(11).diff(s(p.b1)) // 7
            .colorearTime(-1,p.a1,1) // 2
	        .out();
    },

    // pixel_corvo
    'b': () => {
        speed = 0.1;
        noise(-1,3,p.a1).out(o0) // 2
        src(o0).modulatePixelate(
            voronoi(p.a2) // 2
        ).colorama(()=>time)
            .diff(
                src(o1).scroll(0,p.b1) // 0.32
            ).out(o1)
        render(o1);
    },

    // bloque_espiral
    'c': () => {
        speed = 0.1;
        osc(p.a1,0,p.a2)
            .intercal(voronoi(p.b2))
            .intercal(noise(-0.1))
            .intercal(damero(p.b1))
            .out();
    },

    // floral_tron
    'd': () => {
        speed = 0.2;
        osc(3,1,1)
            .tron(noise(p.a2/3,0.2),100, 20) // 3
            .kaleid(p.a1) // 13
            .scale(p.b1) // 0.2
            .out();
    },

    // vortice_eeeee_ee_ee_ee
    'e': () => {
        speed = 0.4;
        src(o0)
            .colorama(0.1)
            .scroll(0.2,0.04)
            .diff(
                shape(1,0.0001,1)
                    .rotate(0,0.003)
                    .scale(p.a2) // 1.1
            )
            .rotate(0, p.b1) // 0.01
            .scale(p.a1) // 1.3
            .out(o0);
    },

    // lente
    'f': () => {
        speed = 0.3;
        let n = 57;
        osc(n,0.01,p.b2).diff(
            osc(n, 0.01, p.b1)
                .rotate(Math.PI / 2)
        ).scale(p.a1)
            .rotate(p.a2)
            .modulateScale(
                shape(n, 0.1, 0.6),
                ()=>Math.sin(time)*n*n
            ).out();
    },

};
