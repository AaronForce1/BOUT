$(document).foundation();

$(document).ready(function(){
  if ($('.fancybox-media').length > 0) {
    $('.fancybox-media').fancybox({
  		openEffect  : 'none',
  		closeEffect : 'none',
  		helpers : {
  			media : {}
  		}
    });
  }
});
