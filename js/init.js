/* underscore custom settings */
_.templateSettings = {
  interpolate:/\{\{=([\s\S]+?)\}\}/g,
  evaluate:/\{\{([\s\S]+?)\}\}/g,
  escape:/\{\{--([\s\S]+?)\}--\}/g
};


/* global variable */
var G = {};


/* initialization */
$(window).on({
	load: function(){

		yml_load('./cfg/general.yml', function(v){
			G.cfg = v;
			$('#content').html(marked(G.cfg.content));
			$('#update').html(G.cfg.update);
			
			let html = $('html');
			let colors;
			if(html.hasClass('error')){
				colors = G.cfg.background_gradiente.error;
			}else{
				colors = G.cfg.background_gradiente.normal;
			}
			rotating_gradient_background(html, colors, G.cfg.background_gradiente.speed);
		});

	},
});

window.addEventListener('beforeunload', on_before_unload);