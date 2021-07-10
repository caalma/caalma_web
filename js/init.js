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
			let html = $('html');
			let html_type = html.attr('id');
			colors = G.cfg.background_gradiente[html_type];
			rotating_gradient_background(html, colors, G.cfg.background_gradiente.speed);
			
			if(html_type == 'home'){
				$('#content').html(marked(G.cfg.content));
				$('#update').html(G.cfg.update);
			} 
			
		});

	},
});

window.addEventListener('beforeunload', on_before_unload);