/* SCROLLING VID LISTENER */

$(document).ready(function() {
  initScrollerVid();
});

function initScrollerVid() {
  queryVideos();

  $(window).resize(function(){
    queryVideos();
  });

  $(window).scroll(function(){
    queryVideos();
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
        console.log(i+' video has stopped')
      }
      console.log(WinH);
      console.log($(video).offset().top)
    }
  }
}
