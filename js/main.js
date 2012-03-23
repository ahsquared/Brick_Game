// change siteName to applicable name for the site
$(function () {
    aSalmon.brickWall.init();
});

var aSalmon = {
    brickWall: {
		mouseX: 0,
		mouseYStart: 0,
		mouseYEnd: 0,
		currentBrick: 0,
		currentRow: 0,
		radiansToDegrees: 360 / (2 * Math.PI),
        init: function () {
			aSalmon.brickWall.generateBricks();
			$('.brick').mousedown(function (e) {
				aSalmon.brickWall.mouseX = e.pageX - $('.container')[0].offsetLeft;
				aSalmon.brickWall.mouseYStart = e.pageY - $('.container')[0].offsetTop;
				aSalmon.brickWall.currentBrick = this;
				aSalmon.brickWall.currentRow = $(this).parent();
			});
			$('.brick').mouseup(function (e) {
				aSalmon.brickWall.mouseYEnd = e.pageY - $('.container')[0].offsetTop;
				var angleRadians = Math.atan(aSalmon.brickWall.mouseX / aSalmon.brickWall.mouseYStart)
				var angleDegrees = angleRadians * aSalmon.brickWall.radiansToDegrees;
				var height = aSalmon.brickWall.mouseX / Math.sin(angleRadians);
				$('.wrecking-ball').css({
					height: height,
					'WebkitTransform': 'rotate(-' + angleDegrees + 'deg)'	
				});
				aSalmon.brickWall.smashBricks();
			});
			$('.brick').click( function (e) {
				aSalmon.brickWall.smashBricks(e, this);
			});
			$('.wrecking-ball')[0].addEventListener("webkitTransitionEnd", function () {
				$('.wrecking-ball').css({'WebkitTransform': 'rotate(0deg)'});	
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
			var power = aSalmon.brickWall.mouseYEnd - aSalmon.brickWall.mouseYStart;
			if (power < 50) {
				var bricks = [-1, 0, 1];
			} else if (power < 150) {
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
			
    }	

};