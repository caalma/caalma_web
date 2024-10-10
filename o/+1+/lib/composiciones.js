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
                max: 100,
                step: 1,
                initialX: 20,
                initialY: 20,
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
                initialX: 0,
                initialY: 0,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            },
            {
                id: 'c',
                min: 0,
                max: 6,
                step: 0.1,
                initialX: 10,
                initialY: 10,
                controles: {
                    v: (x, y) => x,
                    w: (x, y) => y,
                }
            }
        ];
    },
    'c': () => {
    },
    'd': () => {
    },
    'e': () => {
    },
    'f': () => {
    },
}


var parametros = {
    'a': () => {
        p.a1 = values['a-v'];
        p.a2 = values['a-w'];

        p.b1 = values['b-v'];
        p.b2 = values['b-w'];
    },
    'b': () => {
    },
    'c': () => {
    },
    'd': () => {
    },
    'e': () => {
    },
    'f': () => {
    },
}

var composicion = {
    // bloque_espiral
    'a': () => {
        speed = 0.0;
        osc(p.a1,0,p.a2)
            .intercal(voronoi(p.b2))
            .intercal(noise(-0.1))
            .intercal(damero(p.b1))
            .out();
    },
    // floral_tron
    'b': () => {
        speed = 0.0;
        osc(3,1,1)
            .tron(noise(3,0.2),100, 20)
            .kaleid(13)
            .scale(0.2)
            .out();
    },
    // lente
    'c': () => {
        speed = 0.0;
        let n = 57;
        osc(n,0.01,1).diff(
            osc(n, 0.01, 0.1)
                .rotate(Math.PI / 2)
        ).scale(0.2)
            .rotate(0.3)
            .modulateScale(
                shape(n, 0.1, 0.6),
                ()=>Math.sin(time)*n*n
            ).out();
    },
    // microondas
    'd': () => {
        speed = 0.0;
        let s = (n) => noise(n,n,n)
        s(11).diff(s(7))
            .colorearTime(-1,2,1)
	        .out();
    },
    // pixel_corvo
    'e': () => {
        speed = 0.0;
        noise(-1,3,2).out(o0)
        src(o0).modulatePixelate(
            voronoi(2)
        ).colorama(()=>time)
            .diff(
                src(o1).scroll(0,0.32)
            ).out(o1)
        render(o1);
    },
    // vortice_eeeee_ee_ee_ee
    'f': () => {

        speed = 2;
        src(o0)
            .colorama(0.1)
            .scroll(0.2,0.4)
            .diff(
                shape(1,0.0001,1)
                    .rotate(0,0.003)
                    .scale(1.1)
            )
            .rotate(0,0.01)
            .scale(1.3)
            .out(o0);
    }
};
