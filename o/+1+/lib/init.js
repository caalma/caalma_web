function createDraggable(id, initialX, initialY) {
    const obj = document.createElement('div');
    obj.title = id;
    obj.classList.add('draggable');
    obj.setAttribute('id', id);
    document.getElementById('container').appendChild(obj);

    obj.style.left = `${initialX}px`;
    obj.style.top = `${initialY}px`;

    return obj;
}


function dragElement(element, configItem) {
    let posX = 0, posY = 0, startX = 0, startY = 0;

    // Soporta tanto eventos de mouse como touch
    element.onmousedown = dragMouseDown;
    element.ontouchstart = dragTouchStart;

    function dragMouseDown(e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        element.classList.add('active');
    }

    function dragTouchStart(e) {
        e.preventDefault();
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementTouchDrag;
        element.classList.add('active');
    }

    function elementDrag(e) {
        e.preventDefault();
        posX = startX - e.clientX;
        posY = startY - e.clientY;
        startX = e.clientX;
        startY = e.clientY;
        element.style.top = (element.offsetTop - posY) + "px";
        element.style.left = (element.offsetLeft - posX) + "px";
        updateValues();
    }

    function elementTouchDrag(e) {
        e.preventDefault();
        posX = startX - e.touches[0].clientX;
        posY = startY - e.touches[0].clientY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        element.style.top = (element.offsetTop - posY) + "px";
        element.style.left = (element.offsetLeft - posX) + "px";
        updateValues();
    }

    function updateValues() {
        const x = element.offsetLeft + element.offsetWidth / 2;
        const y = element.offsetTop + element.offsetHeight / 2;
        const containerWidth = document.getElementById('container').offsetWidth;
        const containerHeight = document.getElementById('container').offsetHeight;

        const normalizedX = Math.min(1, Math.max(0, x / containerWidth));
        const normalizedY = Math.min(1, Math.max(0, y / containerHeight));

        for (const [control, lambda] of Object.entries(configItem.controles)) {
            const normalizedValue = lambda(normalizedX, normalizedY);

            const range = configItem.max - configItem.min;
            let value = configItem.min + normalizedValue * range;

            value = Math.round(value / configItem.step) * configItem.step;

            values[`${configItem.id}-${control}`] = value;

            console.log(`${configItem.id}-${control} -> Valor: ${value}`);
            document.getElementById('data').innerHTML = JSON.stringify(values);
        }
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
        element.classList.remove('active');
    }

    updateValues();
}


function _dragElement(element, configItem) {
    let posX = 0, posY = 0, startX = 0, startY = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        element.classList.add('active');
    }

    function updateValues() {

        const x = element.offsetLeft + element.offsetWidth / 2; // Centro del objeto
        const y = element.offsetTop + element.offsetHeight / 2; // Centro del objeto
        const containerWidth = document.getElementById('container').offsetWidth;
        const containerHeight = document.getElementById('container').offsetHeight;

        const normalizedX = Math.min(1, Math.max(0, x / containerWidth));
        const normalizedY = Math.min(1, Math.max(0, y / containerHeight));

        for (const [control, lambda] of Object.entries(configItem.controles)) {
            const normalizedValue = lambda(normalizedX, normalizedY);

            // Calcula el valor en el rango de [min, max] y ajusta según el step
            const range = configItem.max - configItem.min;
            let value = configItem.min + normalizedValue * range;

            // Aplica el paso (step)
            value = Math.round(value / configItem.step) * configItem.step;

            // Guarda el valor en el objeto 'values' con el formato 'objeto-control'
            values[`${configItem.id}-${control}`] = value;

            console.log(`${configItem.id}-${control} -> Valor: ${value}`);
            actualizarGUI();
        }

    }

    function elementDrag(e) {
        e.preventDefault();
        posX = startX - e.clientX;
        posY = startY - e.clientY;
        startX = e.clientX;
        startY = e.clientY;
        element.style.top = (element.offsetTop - posY) + "px";
        element.style.left = (element.offsetLeft - posX) + "px";
        updateValues()
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        element.classList.remove('active');
    }

    updateValues();
}




function actualizarGUI(){
    let t = JSON.stringify(values).replaceAll(',', ',<br>');
    document.getElementById('data').innerHTML = t.substring(1, t.length -1);
    actualizarComposicion()
}


var config = [];
let values = {};
let id_composicion = '';
const visor = document.querySelector('#vcanvas');
const _hydra = new Hydra({
          canvas: visor,
          detectAudio: false,
          makeGlobal: true,
      });
const actualizarComposicion = ()=>{
    try{
        parametros[id_composicion]();
        composicion[id_composicion]();
    }catch(err){
        console.log(err);
    }
};

loadScript('./lib/hydra-extend-src.js');
loadScript('./lib/hydra-extend-color.js');
loadScript('./lib/hydra-extend-coord.js');
loadScript('./lib/hydra-extend-combine.js');
loadScript('./lib/hydra-extend-combinecoord.js');

window.onload = () => {
    visor.style.width = "100vw";
    visor.style.height = "100vh";

    id_composicion = window.location.search.replace('?', '');
    parametrosInit[id_composicion]();

    config.forEach(item => {
        const obj = createDraggable(item.id, item.initialX, item.initialY);
        dragElement(obj, item);
    });
}
