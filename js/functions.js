/* specific functions */
function rotating_gradient_background(e, colors, speed){
	let g = 0;
	let c = 1;
	let i = setInterval(function(v){
		e.css('background', `linear-gradient(${g}deg, ${colors.join(', ')})`);
		g = (g + c) % 360;
	}, speed);
}

/* general functions */

function yml_load(url, fn){
	$.get(url, function(r){
		fn(jsyaml.load(r));
	});
}

function server_shutdown(){
	$.get('./exit', function(r){
		window.close();
	});
}

function close_server(sel){
	let e = $(sel);
	if(document.location.host.indexOf('localhost') < 0){
		e.remove();
	}
	e.on({
		click: function(ev){
			server_shutdown();
		}
	});
}

function ask_exit(){
	return false;
}

function on_before_unload(e){
    if (ask_exit()){
        e.preventDefault();
        e.returnValue = '';
    	server_shutdown();
        return;
    }
    delete e['returnValue'];
}


