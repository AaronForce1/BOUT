/* SCROLLING VID LISTENER */

$(document).ready(function() {
  initScrollerVid();

  if ($('.fancybox-media').length > 0) {
    $('.fancybox-media').fancybox({
  		openEffect  : 'none',
  		closeEffect : 'none',
  		helpers : {
  			media : {}
  		}
    });
  }


  setTimeout(function(){
    $('#u5486').unbind();
  }, 1000);

});

function initScrollerVid() {
  var WinW = window.innerWidth;

  if (WinW < 500 && $('body').attr('data-whatinput') == "touch") {/*console.log('Autoplay Disabled');*/}
  else {
    queryVideos();
  }

  $(window).resize(function(){
    if (WinW < 500 && $('body').attr('data-whatinput') == "touch") {/*console.log('Autoplay Disabled');*/}
    else {
      queryVideos();
    }
  });

  $(window).scroll(function(){
    if (WinW < 500 && $('body').attr('data-whatinput') == "touch") {/*console.log('Autoplay Disabled');*/}
    else {
      queryVideos();
    }
  })
}

function queryVideos() {
  console.log('QUERY');

  var WinH = window.innerHeight;

  if (WinH < 414) {}
  else {
    var ScrollTop = $(window).scrollTop()

    var BottomEdge = ScrollTop + WinH;

    var self = this;
    var AllVid = $('video');

    for (var i = 0, il = AllVid.length; i < il; i++) {
      var video = $('video').get(i)
      if ($(video).offset().top < BottomEdge && $(video).offset().top > ScrollTop) {
        $(video).get(0).play();
        console.log(i+' video has played')
      }
      else {
        $(video).get(0).pause();
        //console.log(i+' video has stopped')
      }
      //console.log(WinH);
      //console.log($(video).offset().top)
    }
  }
}
