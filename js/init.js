(function ($,sr) {
	'use strict';

	Drupal.behaviors.bridges_init = {
		attach: function(context, settings) {
			setupDOM();
		}
	}

	// debouncing function from John Hann
	// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	var debounce = function (func, threshold, execAsap) {
		var timeout;

		return function debounced () {
			var obj = this, args = arguments;
			function delayed () {
				if (!execAsap)
					func.apply(obj, args);
					timeout = null;
			};

			if (timeout)
				clearTimeout(timeout);
			else if (execAsap)
				func.apply(obj, args);

				timeout = setTimeout(delayed, threshold || 100);
		};
	}
	// smartresize
	jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
	
	$(window).smartresize(function(){
		setupFancyNav();
		matchHeight('.flexbox .node--type-article.node--view-mode-teaser', '.header');
		matchHeight('.flexbox .node--type-article.node--view-mode-teaser .content', '.intro');
		getObjectSpace($('.block-services-intro .view-group-content'));
	});
	function getObjectSpace($elem) {
		$elem.attr('data-max-height',$elem.outerHeight());
	}
	function matchHeight(parent, selector) {
		var $parent = $(parent);
		
		// $parent is the element to search inside of for the $elem to match heights
		var $elem_to_adjust = $parent.find(selector);
		var max = 0;
		$elem_to_adjust.each(function(i) {
			$(this).css('height','auto');
			if($(this).outerHeight() > max) {
				max = $(this).outerHeight();
			}
		});
		$elem_to_adjust.each(function(i) {
			$(this).css('height', max + 'px');
		});
	}
	function setupDOM() {
// 		$('html').removeClass('flexbox');
		matchHeight('.flexbox .node--type-article.node--view-mode-teaser', '.header');
		matchHeight('.flexbox .node--type-article.node--view-mode-teaser .content', '.intro');
		$('.flexbox #block-mainnavigation .menu-items > .menu-main--item > a, .flexbox #block-mainnavigation .menu-items > .menu-main--item > span').once('indicator').each(function(i) {
			var $elem = $(this);
			var text = $elem.text();
			$elem.html($('<span />', {
				'class' : 'indicator',
				'text' : text
			}));
		});
		portableNav();
		setupFancyNav();
		$('select').not('select.no-style').once('dropdown').each(function(i) {
			var $select = $(this);
			$select.wrapAll('<div class="js-select-wrapper"></div>');
		});
		$('iframe[src*="youtube.com"]').once('wrapped').each(function(i) {
			var $iframe = $(this);
			if(!$iframe.parent().hasClass('video-wrapper')) {
				$iframe.wrapAll('<div class="video-wrapper"></div>');
			}
		});
		$('a[href*="http"]').once('external').each(function(i) {
			var $a = $(this);
			$a.attr('target','_blank');
		});
		$('.block-services-intro').once('rings').each(function(i) {
			var $block = $(this);
			var $view = $block.find('.views-element-container');
			var $parent = $view.find('.view-group-content');
			var padding = 0;
			
			
			function setupServices() {
				getObjectSpace($parent);
				$block.find('.bridges-content').prepend($view);
				var square_side = $parent.attr('data-max-height');
				var $services = $view.find('.node--type-service');
				$services.each(function(a) {
					var $n = $(this);
					$n.addClass('ring').addClass('ring-' + a);
					if(a == 0 || a == 3) {
						$n.addClass('rotate-1');
					}
					if(a == 1 || a == 4) {
						$n.addClass('rotate-2');
					}
					if(a == 2) {
						$n.addClass('rotate-3');
					}
					var concentric = 80 * a;
					square_side = $parent.attr('data-max-height') - padding - concentric;
					var offset = ($parent.attr('data-max-height') - square_side) / 2;
					$n.css('width', square_side + 'px').css('height',square_side + 'px').css('transform','translateY(' + offset + 'px) translateX(' + offset + 'px)');
					$n.find('.icon').css('background-image','url(' + $n.find('a[data-icon]').attr('data-icon') + ')');
					$n.mouseenter(function(e) {
						$block.addClass('active');
					}).mouseleave(function(e) {
						$block.removeClass('active');
					});
				});
			}
			
			var mql = window.matchMedia("(max-width:968px)");
			mediaqueryresponse(mql); // call listener function explicitly at run time
			mql.addListener(mediaqueryresponse); // attach listener function to listen in on state changes
			
			function mediaqueryresponse(mql){
				if (mql.matches) { // if media query matches
					
				} else if (!mql.matches) {
					setupServices();
				}
			}
		});
	}
	function portableNav() {
		$('#block-mainnavigation .menu-main').once('main-nav-processed').each(function(i) {
			var $nav_wrapper = $(this);
			$nav_wrapper.once('hamburger').each(function(a) {
				var $hamburger = $('<button class="hamburger hamburger--spin portable" type="button"><span class="hamburger-box"><span class="hamburger-inner"></span></span></button>');
				$nav_wrapper.append($hamburger);
				$hamburger.click(function(e) {
					e.preventDefault();
					$('html').toggleClass('nav-active');
					$hamburger.toggleClass('is-active');
				});
				setTimeout(function() {
					$('html').addClass('nav-loaded');
				}, 1000);
				$nav_wrapper.find('.menu-items').swipe( {
					swipeLeft:function(event, direction, distance, duration, fingerCount) {
						if(direction == "left"){
							event.preventDefault();
							$('html').removeClass('nav-active');
							$hamburger.removeClass('is-active');
						}
					},
					fingers:1,
					threshold:10,
					excludedElements: 'button, input, select, textarea, .noswipe'
				});
			});
		});
	}
	function setupFancyNav() {
		$('#block-mainnavigation').each(function(i) {
			var $block = $(this);
			var $menu = $block.find('.menu-items .menu-main--item');
			$menu.mouseover(function(e) {
				$('body').addClass('menu-hover');
			}).mouseout(function(e) {
				$('body').removeClass('menu-hover');
			});
			$block.find('.menu-main--item--expanded').each(function(a) {
				var $parent = $(this);
				var position = $parent.offset();
				$parent.find('.menu-main--item').each(function(b) {
					var $item = $(this);
					$item.css('margin-left', position.left + 'px');
				});
			});
		});
		
		$('#block-multisitenavigation').each(function(i) {
			var $block = $(this);
			var $content = $block.find('.bridges-content');
			var site_id = $content.find('a.active').text(); 
			var $site_tab = $('<button class="pull-tab portable" type="button">Current site: <span class="site-id">' + site_id + '</span></button>');
			
			var mql = window.matchMedia("(max-width:768px)");
			mediaqueryresponse(mql); // call listener function explicitly at run time
			mql.addListener(mediaqueryresponse); // attach listener function to listen in on state changes
	
			$content.once('multi-site-nav').each(function(a) {
				$content.append($site_tab);
				$site_tab.click(function(e) {
					e.preventDefault();
					$('html').toggleClass('multi-site-active');
				});
				setTimeout(function(b) {
					mediaqueryresponse(mql);
				}, 1000);
			});
			
			function mediaqueryresponse(mql){
				var offsetHeight = $block.outerHeight() - $('.pull-tab').outerHeight();
				if (mql.matches) { // if media query matches
					$block.css('top',-offsetHeight + 'px');
				} else if (!mql.matches) {
					$block.removeAttr('style');
				}
			}
		});
	}

}(jQuery, 'smartresize'));