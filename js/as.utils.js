var aSalmon = {};
	aSalmon.utils = {
    loadFacebook: function () {
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
            fjs.parentNode.insertBefore(js, fjs);
        } (document, 'script', 'facebook-jssdk'));
    },
    loadTwitter: function () {
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (!d.getElementById(id)) {
                js = d.createElement(s);
                js.id = id; js.src = "//platform.twitter.com/widgets.js";
                fjs.parentNode.insertBefore(js, fjs);
            }
        } (document, "script", "twitter-wjs"));

    },
    loadGooglePlus: function () {
        (function () {
            var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/plusone.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
        })();
    },
    isIpad: function () {
        if ((navigator.userAgent.match(/iPad/i))) {
            return true;
        } else {
            return false;
        }
    },
    // select parent element of styled checkbox: aSalmon.utils.styleCheckBoxes($('selector'));
    styleCheckboxes: function (objs) {
        objs.each(function (index) {
            if ($(this).children("a.check_styled").length == 0) {
                $(this).find("input[type=checkbox]").before("<a href='#check_" + index + "' class='check_styled' id='check_" + index + "'></a>").css({
                    position: 'absolute',
                    left: -1,
                    top: 3,
                    zIndex: -1
                });
                $(this).find("input[type=checkbox]").each(function () {
                    (this.checked) ? $(this).prev().addClass('checked') : $(this).prev().removeClass('checked');
                });
            }
        });
        // function to 'check' the styled ones and their matching checkboxes
        $(".check_styled").click(function () {
            $(this).toggleClass('checked');
            $(this).next("input[type=checkbox]").trigger("click");
            return false;
        });
    },
    wordCounter: function (maxWords) {
        $('.word-limit').each(function () {
            var length = $(this).val().split(/\b[\s,\.-:;]*/).length;
            var remaining = maxWords + 1 - length;
            // update characters  
            $(this).parent().find('.counter span').html(remaining);
            // bind on key up event  
            $(this).bind('keydown keyup', function (e) {
                var keyCode = e.which;
                // get new length of words  
                length = $(this).val().split(/\b[\s,\.-:;]*/).length;
                remaining = maxWords + 1 - length;
                // update  
                $(this).parent().find('.counter span').html(remaining);
                //console.log(remaining, keyCode);
                if (remaining > 0) {
                    $(this).parent().find('.counter span').html(remaining);
                } else if (keyCode >= 8 && keyCode <= 46) {
                    return;
                } else {
                    e.preventDefault();
                }
            });
        });

    },
    detectWindowsMobile: function () {
        var ua = navigator.userAgent;
        var re = new RegExp("Windows Phone");
        if (re.exec(ua) != null) $('body').addClass('win-phone');
    }
};

$.fn.equalHeights = function (px) {
	//$('.builders').children('.clear').hide();
	$(this).each(function () {
		var currentTallest = 0;
		$(this).children().each(function (i) {
			if ($(this).outerHeight() > currentTallest) {
				currentTallest = $(this).height();
			}
		});
		//if (!px || !Number.prototype.pxToEm) currentTallest = currentTallest.pxToEm(); //use ems unless px is specified
		// for ie6, set height since min-height isn't supported
		if ($('html').hasClass('ie6') || $('html').hasClass('ie7')) {
			$(this).children().css({ 'height': currentTallest });
		} else {
			$(this).children().css({ 'min-height': currentTallest });
		}
		$(this).addClass('equalHeights');
	});
	return this;
};

(function($){
  
var rupper = /([A-Z])/g; 

// ----------
// Function: stopCssAnimation
// Stops an animation in its tracks!
$.fn.stopCssAnimation = function(){   
  this.each(function(){
    // When you remove the CSS Transition properties
    // it doesn't just end the animation where it was,
    // instead it jumps the animation to the end state.
    // Thus, to stop an animation, you first have to get
    // its current computed values, remove the transition
    // properties, and then finally set the elements
    // values appropriatly.
    
    // Get the computed values of the animated properties
    var $el = $(this);
    var props = $el.data("cssAnimatedProps");
    var cStyle = window.getComputedStyle(this, null);
    var cssValues = {};     
    for(var prop in props){
      prop = prop.replace( rupper, "-$1" ).toLowerCase();
      cssValues[prop] = cStyle.getPropertyValue(prop);
    }
    
    // Remove the CSS Transition CSS
    $el.css({
      '-moz-transition-property': 'none',  
      '-moz-transition-duration': '',  
      '-moz-transition-timing-function': '',
      '-webkit-transition-property': 'none',  
      '-webkit-transition-duration': '',  
      '-webkit-transition-timing-function': ''    
    });
    
    // Set the saved computed properties
    for( var prop in cssValues ){
      $el.css(prop, cssValues[prop]);
    }
    
    // Cancel any onComplete function
    $el.data("cssAnimatedProps", null);
    var timeoutId = $el.data("cssTimeoutId");
    if( timeoutId != null ) {
      clearTimeout(timeoutId);
      $el.data("cssTimeoutId", null);
    }
  });
};

// ----------
// Function: animateWithCSS
// Uses CSS transitions to animate the element. 
// 
// Parameters: 
//   Takes the same properties as jQuery's animate function.
//
//   The only difference is that the easing paramater can now be:
//   bounce, swing, linear, ease-in, ease-out, cubic-bezier, or
//   manually defined as cubic-bezier(x1,y1,x2,y2);
$.fn.animateWithCss = function(props, speed, easing, callback) {
  var optall = jQuery.speed(speed, easing, callback);  
  
	if ( jQuery.isEmptyObject( props ) ) {
		return this.each( optall.complete );
	}
  
  var easings = {
    bounce: 'cubic-bezier(0.0, 0.35, .5, 1.3)', 
    linear: 'linear',
    swing: 'ease-in-out',
  };
  
  optall.easing = optall.easing || "swing";
  optall.easing = easings[optall.easing] ? easings[optall.easing] : optall.easing;
  
  // The latest versions of Firefox do not animate from a non-explicitly set
  // css properties. So for each element to be animated, go through and
  // explicitly define 'em.
  this.each(function(){
    $(this).data("cssAnimatedProps", props);
    var cStyle = window.getComputedStyle(this, null);      
    for(var prop in props){
      prop = prop.replace( rupper, "-$1" ).toLowerCase();
      $(this).css(prop, cStyle.getPropertyValue(prop));
    }    
  });
  
  this.css({
    '-moz-transition-property': 'all', // TODO: just animate the properties we're changing  
    '-moz-transition-duration': optall.duration + 'ms',  
    '-moz-transition-timing-function': optall.easing,
    '-webkit-transition-property': 'all', // TODO: just animate the properties we're changing  
    '-webkit-transition-duration': optall.duration + 'ms',  
    '-webkit-transition-timing-function': optall.easing,
  });
  
  this.css(props);

  var self = this;
  var timeoutId = setTimeout(function() {    
    self.css({
      '-moz-transition-property': 'none',  
      '-moz-transition-duration': '',  
      '-moz-transition-timing-function': '',
      '-webkit-transition-property': 'none',  
      '-webkit-transition-duration': '',  
      '-webkit-transition-timing-function': ''
    });
    
    self.data("cssAnimatedProps", null); 
    self.data("cssTimeoutId", null);        

    if(jQuery.isFunction(optall.complete))
      optall.complete.apply(self);
  }, optall.duration);
  this.data( "cssTimeoutId", timeoutId );
  
  
  return this;
}


})(jQuery);