$(document).ready(function () {
    aSalmon.brickWall.init();
});

	aSalmon.brickWall = {
		mouseX: 0,
		mouseYStart: 0,
		mouseYEnd: 0,
		currentBrick: 0,
		currentRow: 0,
		radiansToDegrees: 360 / (2 * Math.PI),
		wreckingBallOffset: {
			x: parseInt($('.wrecking-ball').css('left')),
			y: parseInt($('.wrecking-ball').css('top'))
		},
		powerBall: $('.power-rating'),
		powerRating: 0,
		powerSize: function(e, d) {
			aSalmon.brickWall.powerRating = d.deltaY;
			var dim = Math.abs(aSalmon.brickWall.powerRating) / 2;
			aSalmon.brickWall.powerBall[0].style.height = dim + "px";
			aSalmon.brickWall.powerBall[0].style.width = dim + "px";
			aSalmon.brickWall.powerBall[0].style.left = aSalmon.brickWall.mouseX - dim/2 + "px";
			aSalmon.brickWall.powerBall[0].style.top = aSalmon.brickWall.mouseYStart - dim/2 + "px";
			aSalmon.brickWall.powerBall[0].style.borderRadius = dim + "px";
		},
        init: function () {
			aSalmon.brickWall.generateBricks();
			$('.brick').drag('init', function(e, d) {
				console.log(d.startX, d.startY);
				aSalmon.brickWall.powerBall.css({
					left: d.startX - $('.container')[0].offsetLeft,
					top: d.startY - $('.container')[0].offsetTop,
					opacity: 0.5
				});
				aSalmon.brickWall.mouseX = d.startX - $('.container')[0].offsetLeft;
				aSalmon.brickWall.mouseYStart = d.startY - $('.container')[0].offsetTop;
				aSalmon.brickWall.currentBrick = this;
				aSalmon.brickWall.currentRow = $(this).parent();
				aSalmon.brickWall.powerSize(e, d);
			});
			$('.brick').drag(function(e, d) {
				aSalmon.brickWall.powerSize(e, d);	
			});
			$('.brick').drag('end', function(e, d) {
				var angleRadians = Math.atan((aSalmon.brickWall.mouseX - aSalmon.brickWall.wreckingBallOffset.x) / (aSalmon.brickWall.mouseYStart - aSalmon.brickWall.wreckingBallOffset.y));
				var angleDegrees = Math.floor(angleRadians * aSalmon.brickWall.radiansToDegrees);
//				alert(e.pageX + ", " + aSalmon.brickWall.wreckingBallOffset.x + ", " + angleRadians + ", " + aSalmon.brickWall.radiansToDegrees);
				var props = '';
				for (i in d) {
					props += i + "\n";
				}
				//alert(angleDegrees);
				var height = (aSalmon.brickWall.mouseX - aSalmon.brickWall.wreckingBallOffset.x) / Math.sin(angleRadians);
				$('.wrecking-ball').css({
					height: height,
					'WebkitTransform': "rotate(-" + angleDegrees + "deg)"	
				});
				aSalmon.brickWall.powerSize(e, d);
				/*aSalmon.brickWall.powerBall.animateWithCss({
					opacity: 0
				}, 500, 'ease-in', function() {
					aSalmon.brickWall.powerBall.css({
						height: 1,
						width: 1
					});
				});*/
				aSalmon.brickWall.powerBall.css({
					left: -200,
					top: -200
				});
				aSalmon.brickWall.smashBricks();
			});
			$('.wrecking-ball')[0].addEventListener("webkitTransitionEnd", function () {
				$('.wrecking-ball').css({'WebkitTransform': 'rotate(45deg)'});	
			}, true);
		},
		generateBricks: function () {
			for (var i=0; i < 24; i++) {
				var brickRow = $('<div class="brick-row"></div>');
				for (var j=0; j < 10; j++) {
					var brick = $('<div class="brick"></div>');
					brick.css({
						left: j * 32,
						top: i * 20
					});
					brickRow.append(brick);
				}
				$('.container').append(brickRow);
			}
		},
		smashBricks: function() {
			var bIndex = $(aSalmon.brickWall.currentBrick).index();
			var rIndex = $(aSalmon.brickWall.currentRow).index();
			//var power = aSalmon.brickWall.mouseYEnd - aSalmon.brickWall.mouseYStart;
			if (aSalmon.brickWall.powerRating < 50) {
				var bricks = [-1, 0, 1];
			} else if (aSalmon.brickWall.powerRating < 150) {
				var bricks = [-2, -1, 0, 1, 2];				
			} else {
				var bricks = [-3, -2, -1, 0, 1, 2, 3];				
			}
			for (var i=0; i < bricks.length; i++) {
				var brickToSmashIndex = bIndex + bricks[i];
				if (brickToSmashIndex >= 0) {
					$(aSalmon.brickWall.currentRow).find('.brick').eq(bIndex + bricks[i]).delay(200).fadeOut();
				}
			}
			for (var i=1; i < bricks.length - 1; i++) {
				var brickToSmashIndex = bIndex + bricks[i];
				if (brickToSmashIndex >= 0) {
					$(aSalmon.brickWall.currentRow).prev().find('.brick').eq(bIndex + bricks[i]).delay(200).fadeOut();
					$(aSalmon.brickWall.currentRow).next().find('.brick').eq(bIndex + bricks[i]).delay(200).fadeOut();
					}
			}
			$('.container').blur();
		}
			
    };

