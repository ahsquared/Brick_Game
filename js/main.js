// change siteName to applicable name for the site
var aSalmon = {};
$(function () {
    aSalmon.shazamBrickGame.init();

});
aSalmon.shazamBrickGame = {
    gameUrl: 'http://shazam.stageweb01.alphasalmonstaging.com',
    fbSharePage: '/share.aspx?v=10',
    mouseX: 0,
    mouseYStart: 0,
    mouseYEnd: 0,
    currentBrick: 0,
    currentRow: 0,
    radiansToDegrees: 360 / (2 * Math.PI),
    gameStarted: false,
    level: 0,
    lives: 3,
    scores: [],
    bricksRemaining: 0,
    bricksForCurrentLevel: 0,
    cloudsActive: false,
    bombsActive: false,
    snowActive: false,
    wreckingBallOffset: {
        x: parseInt($('.wrecking-ball').css('left')),
        y: parseInt($('.wrecking-ball').css('top'))
    },
    iPadFactor: 1,
    isIpad: false,
    checkIpad: function () {
       aSalmon.shazamBrickGame.isIpad = navigator.userAgent.match(/iPad/i) != null;
    },
    init: function () {
        aSalmon.shazamBrickGame.checkForCapableBrowser();

        var swipeOptions = {
            swipe: aSalmon.shazamBrickGame.swipeHandler,
            allowPageScroll: 'none'
        };
        $('#instructions').swipe(swipeOptions);
        window.addEventListener('orientationchange', function () {
            if (window.orientation == -90 || window.orientation == 90) {
                alert('This game only works in portrait - please rotate your phone');
            }
        }, true);
        $('#instructions').scroll(function () {
            var scrollTop = $('#instructions').scrollTop();
            console.log(scrollTop);
            if (scrollTop > 80) {
                $('#more-content').css('backgroundPosition', 'top left');
            } else {
                $('#more-content').css('backgroundPosition', 'bottom left');
            }
        });
        aSalmon.shazamBrickGame.checkIpad();
        if (aSalmon.shazamBrickGame.isIpad) {
            $('body').addClass('ipad');
        }
        aSalmon.shazamBrickGame.preloadImages('img/brick-sprite-large.png,img/brick-sprite-small.png,img/instructions.png');
        $('.start-game').click(function (evt) {
            evt.preventDefault();
            aSalmon.shazamBrickGame.generateNewLevel();
        });
        
        $('.wrecking-ball')[0].addEventListener("webkitTransitionEnd", function (evt) {
            if (evt.propertyName == "width") {
                $('.shadow').remove();
                $('.wrecking-ball').addClass('reset');
                $('.wrecking-ball .blur').fadeOut(100);
                aSalmon.shazamBrickGame.smashBricks();
            }
        }, true);
        $('.wrecking-ball')[0].addEventListener("transitionend", function (evt) {
            if (evt.propertyName == "width") {
                $('.shadow').remove();
                $('.wrecking-ball').addClass('reset');
                $('.wrecking-ball .blur').fadeOut(100);
                aSalmon.shazamBrickGame.smashBricks();
            }
        }, true);
        $('.wrecking-ball')[0].addEventListener("webkitAnimationEnd", function () {
            $('.wrecking-ball').removeClass('reset').attr('style', '');
        });
        $('.wrecking-ball')[0].addEventListener("animationend", function () {
            $('.wrecking-ball').removeClass('reset').attr('style', '');
        });
        $('#swing').bind('click.prevent', function (evt) {
            evt.preventDefault();
        });
        $('#play-btn').click(function (evt) {
            evt.preventDefault();
            $('#level-start').hide();
            $('#game-level').show();
            aSalmon.shazamBrickGame.timer();
            aSalmon.shazamBrickGame.startObstacles();
            if (aSalmon.shazamBrickGame.level == 1) {
                aSalmon.shazamBrickGame.startInactivityTimer();
            }
        });
        $('.play-again-btn').click(function (evt) {
            evt.preventDefault();
            var loc = window.location.href.split('#')[0];
            window.location.href = loc;
        });
        $('#how-to-play').click(function (evt) {
            evt.preventDefault();
            $('#intro').css('left', '-320px');
            $('#how-to-play-overlay').css('left', '0');
        });
        $('#how-to-play-overlay .close').click(function (evt) {
            evt.preventDefault();
            $('#how-to-play-overlay').css('left', '320px');
            $('#intro').css('left', '0');
        });
    },
    checkForCapableBrowser: function () {
        if ($('html').hasClass('no-cssanimations') || $('html').hasClass('no-csstransitions') || $('html').hasClass('no-csstransforms')) {
            aSalmon.shazamBrickGame.disableGame();
        } else {
            if (/Firefox[\/\s](\d+\.*\d*)/.test(navigator.userAgent)) {
                console.log(RegExp.$1);
                var ffversion = new Number(RegExp.$1);
                if (ffversion < 14) {
                    aSalmon.shazamBrickGame.disableGame();
                } else {
                    $('#amex-bar, #game-logo, #intro .start-game, #how-to-play').css('display', 'block');
                }
            } else {
                $('#amex-bar, #game-logo, #intro .start-game, #how-to-play').css('display', 'block');
            }
        }
    },
    disableGame: function() {
        if ($('html').hasClass('no-backgroundsize')) {
            $('#amex-bar, #game-logo').hide();
        } else {
            $('#amex-bar, #game-logo').css('display', 'block');
        }
        $('#intro .start-game, #how-to-play').hide();
        $('.not-supported').css('display', 'block');
    },
    swipeHandler: function (event, direction) {
        if (direction == "left") {
            console.log('left');
            $('.instructions-img').removeClass('slideRight').addClass('slideLeft');
            $('#dot1').css('backgroundPosition', 'top right');
            $('#dot2').css('backgroundPosition', 'top left');
        } else if (direction == "right") {
            $('.instructions-img').removeClass('slideLeft').addClass('slideRight');
            $('#dot1').css('backgroundPosition', 'top left');
            $('#dot2').css('backgroundPosition', 'top right');
        }
    },
    startObstacles: function () {
        if (aSalmon.shazamBrickGame.cloudsActive) {
            aSalmon.shazamBrickGame.generateCloud();
            //console.log('obstacles - clouds');
        }
        if (aSalmon.shazamBrickGame.bombsActive) {
            aSalmon.shazamBrickGame.generateBombs();
            //console.log('obstacles - bombs');
        }
        if (aSalmon.shazamBrickGame.snowActive) {
            aSalmon.shazamBrickGame.generateSnow();
            //console.log('obstacles - snow');
        }

    },
    preloadImages: function (images) {
        if (images != null) {
            images = images.split(',');
            var len = images.length;
            var imageObj = [];
            for (var i = 0; i < len; i++) {
                imageObj[i] = new Image();
                imageObj[i].src = images[i];
            }
        }
    },
    generateNewLevel: function () {
        $('#remaining-lives div').removeClass('dead');
        $('#home').hide();
        $('#game-level').hide();
        $('.wrecking-ball').removeClass('reset').attr('style', '');
        aSalmon.shazamBrickGame.level++;
        $('#level-start').attr('class', 'l-' + aSalmon.shazamBrickGame.level);
        if (aSalmon.shazamBrickGame.level > 1) {
            $('#lvl-num').text(aSalmon.shazamBrickGame.level - 1);
            $('#lvl-perc').text(Math.round(aSalmon.shazamBrickGame.scores[aSalmon.shazamBrickGame.level - 2] / 100));
            $('#previous-level').show();
        }
        $('#level-start').fadeIn();
        aSalmon.shazamBrickGame.setupWall();
        switch (aSalmon.shazamBrickGame.level) {
            case 1:
                $('#level-number').css('background-position', 'top left');
                break;
            case 2:
                $('#level-number').css('background-position', 'left -13px');
                break;
            case 3:
                $('#level-number').css('background-position', 'left -26px');
                aSalmon.shazamBrickGame.cloudsActive = true;
                break;
            case 4:
                $('#level-number').css('background-position', 'left -39px');
                aSalmon.shazamBrickGame.cloudsActive = true;
                aSalmon.shazamBrickGame.bombsActive = true;
                break;
            case 5:
                $('#level-number').css('background-position', 'left -52px');
                aSalmon.shazamBrickGame.snowActive = true;
                aSalmon.shazamBrickGame.bombsActive = true;
                aSalmon.shazamBrickGame.cloudsActive = true;
                break;
        }
        aSalmon.shazamBrickGame.lives = 3;
    },
    setupWall: function () {
        aSalmon.shazamBrickGame.generateBricks();
        aSalmon.shazamBrickGame.attachBrickEvents();
    },
    generateBricks: function () {
        $('#the-wall').empty();
        var wall = $('<div class="wall-container"></div>');
        var counter = 0;
        var firstRowLength = 5;
        var secondRowLength = 6;
        var firstRowOffset = -27;
        var secondRowOffset = -65;
        var numRows = 13;
        if (aSalmon.shazamBrickGame.isIpad) {
            numRows = 12;
        }
        var brickSize = '';
        var brickWidth = 75;
        var brickHeight = 26;
        if (aSalmon.shazamBrickGame.level == 1) {
            var firstRowLength = 4;
            var secondRowLength = 3;
            var firstRowOffset = -65;
            var secondRowOffset = -5;
            var numRows = 9;
            if (aSalmon.shazamBrickGame.isIpad) {
                numRows = 8;
            }
            var brickSize = 'large';
            var brickWidth = 110;
            var brickHeight = 38;
        }
        for (var i = 0; i < numRows; i++) {
            var brickRow = $('<div class="brick-row"></div>');
            var rowlength = secondRowLength;
            if (i % 2 == 0) {
                brickRow.css('left', firstRowOffset);
                rowlength = firstRowLength;
            } else {
                brickRow.css('left', secondRowOffset);
            }
            for (var j = 0; j < rowlength; j++) {
                counter++;
                var brick = $('<div class="brick ' + brickSize + '"></div>');
                var rnd = Math.random();
                var bg = '';
                if (rnd <= 0.33) {
                    bg = aSalmon.shazamBrickGame.level + "-1";
                } else if (rnd <= 0.66) {
                    bg = aSalmon.shazamBrickGame.level + "-2";
                } else {
                    bg = aSalmon.shazamBrickGame.level + "-3"
                }
                brick.css({
                    left: j * brickWidth,
                    top: i * brickHeight
                    //backgroundImage: "url(img/brick-" + bg + ".png)"
                }).addClass('brick-' + bg);
                var brickPartNo = Math.floor(Math.random() * 2) + 1;
                var brickPartStr = '';
                for (var k = 0; k < brickPartNo; k++) {
                    var brickCrackNo = Math.floor(Math.random() * 2) + 1;
                    brickPartStr += '<div class="part' + (k + 1) + '" style="width: ' + (100 / brickPartNo) + '%;"><div class="crack c' + brickCrackNo + '"></div></div>'
                }
                var brickParts = $(brickPartStr);
                brick.append(brickParts);
                brickRow.append(brick);
            }
            wall.append(brickRow);
        }
        $('#the-wall').append(wall);
        aSalmon.shazamBrickGame.bricksForCurrentLevel = counter;
        aSalmon.shazamBrickGame.bricksRemaining = counter;
        $('#bricks-remaining').text(counter);
    },
    attachBrickEvents: function () {
        $('.brick').click(function (e) {
            clearTimeout(aSalmon.shazamBrickGame.inactivityTimer);
            $('.wrecking-ball').removeClass('reset').attr('style', '');
            $('.broken-ball').css('display', 'none');
            $('.shadow').remove();
            //$('.cloud, .bomb, .snow-flake').remove();
            $('.wrecking-ball').css('display', 'block');
            aSalmon.shazamBrickGame.mouseX = e.pageX - $('.wrap')[0].offsetLeft;
            aSalmon.shazamBrickGame.mouseYStart = e.pageY - $('#the-wall')[0].offsetTop;
            aSalmon.shazamBrickGame.currentBrick = this;
            aSalmon.shazamBrickGame.currentRow = $(this).parent();
            var shadow = $('<div class="shadow"></div>');
            shadow.css({
                left: aSalmon.shazamBrickGame.mouseX - (43 * aSalmon.shazamBrickGame.iPadFactor),
                top: aSalmon.shazamBrickGame.mouseYStart - (44 * aSalmon.shazamBrickGame.iPadFactor)
            });
            $('#the-wall').append(shadow);
            var angleRadians = Math.atan((aSalmon.shazamBrickGame.mouseX - aSalmon.shazamBrickGame.wreckingBallOffset.x) / (aSalmon.shazamBrickGame.mouseYStart - aSalmon.shazamBrickGame.wreckingBallOffset.y));
            var angleDegrees = -1 * Math.floor(angleRadians * aSalmon.shazamBrickGame.radiansToDegrees);
            var height = (aSalmon.shazamBrickGame.mouseX - aSalmon.shazamBrickGame.wreckingBallOffset.x) / Math.sin(angleRadians);
            var topOffset = 483 - height;
            //console.log(angleRadians, -angleDegrees, height, topOffset);
            aSalmon.shazamBrickGame.brickSmashLocation.height = height + 80;
            aSalmon.shazamBrickGame.brickSmashLocation.topOffset = topOffset;
            aSalmon.shazamBrickGame.brickSmashLocation.angleDegrees = angleDegrees;
            $('#swing').unbind('click.swing').bind('click.swing', function (evt) {
                evt.preventDefault();
                aSalmon.shazamBrickGame.swingWreckingBall();
            });
        });
        $('.brick').each(function() {
            $(this)[0].addEventListener("webkitTransitionEnd", function () {
                $(this).hide();
            });
        });
        $('.brick').each(function () {
            $(this)[0].addEventListener("transitionend", function () {
                $(this).hide();
            });
        });

    },
    swingWreckingBall: function () {
        //var swingDelay = Math.floor(Math.random() * 500) + 100;
        $('.wrecking-ball').css({
            //top: -topOffset,
            height: aSalmon.shazamBrickGame.brickSmashLocation.height,
            left: 65,
            width: 145,
            'WebkitTransformOrigin': '0 ' + aSalmon.shazamBrickGame.brickSmashLocation.topOffset,
            //'WebkitTransitionDelay': swingDelay + 'ms',
            'WebkitTransitionDuration': '1000ms',
            'WebkitTransform': "rotate(" + aSalmon.shazamBrickGame.brickSmashLocation.angleDegrees + "deg)",
            'MozTransformOrigin': '0 ' + aSalmon.shazamBrickGame.brickSmashLocation.topOffset,
            'MozTransitionDuration': '1000ms',
            'MozTransform': "rotate(" + aSalmon.shazamBrickGame.brickSmashLocation.angleDegrees + "deg)"
    });
        //$('.wrecking-ball .blur').height(aSalmon.shazamBrickGame.brickSmashLocation.height).show();
        $('.shadow').css({
            //'WebkitTransitionDelay': swingDelay + 'ms',
            'WebkitTransitionDuration': '1000ms',
            'WebkitTransform': "scale(0.5)",
            'MozTransitionDuration': '1000ms',
            'MozTransform': "scale(0.5)",
            opacity: 1
        });
        $('#swing').unbind('click.swing');

    },
    brickSmashLocation: {
        height: 0,
        left: 65,
        width: 117,
        topOffset: 0,
        angleDegrees: 0
    },
    smashBricks: function () {
        if (!aSalmon.shazamBrickGame.checkBombCollision()) {
            if (!aSalmon.shazamBrickGame.checkCloudCollision() && !aSalmon.shazamBrickGame.checkSnowCollision()) {
                var bIndex = $(aSalmon.shazamBrickGame.currentBrick).index();
                var rIndex = $(aSalmon.shazamBrickGame.currentRow).index();
                var maxIndex = $('.brick-row').length;
                var bricks = [];
                if (aSalmon.shazamBrickGame.level == 1) {
                    bricks = [-2, -1, 0, 1, 2];
                } else {
                    bricks = [-3, -2, -1, 0, 1, 2, 3];
                }
                for (var i = 0; i < bricks.length; i++) {
                    var brickToSmashIndex = bIndex + bricks[i];
                    if (brickToSmashIndex >= 0) {
                        $(aSalmon.shazamBrickGame.currentRow).find('.brick').eq(bIndex + bricks[i]).addClass('smashed');
                    }
                }
                for (var i = 1; i < bricks.length - 1; i++) {
                    var brickToSmashIndex = bIndex + bricks[i];
                    if (brickToSmashIndex >= 0) {
                        if (rIndex >= 1) $('.brick-row').eq(rIndex - 1).find('.brick').eq(bIndex + bricks[i]).addClass('smashed');
                        if (rIndex < maxIndex) $('.brick-row').eq(rIndex + 1).find('.brick').eq(bIndex + bricks[i]).addClass('smashed');
                    }
                }
                for (var i = 2; i < bricks.length - 2; i++) {
                    var brickToSmashIndex = bIndex + bricks[i];
                    if (brickToSmashIndex >= 0) {
                        if (rIndex >= 2) $('.brick-row').eq(rIndex - 2).find('.brick').eq(bIndex + bricks[i]).addClass('smashed');
                        if (rIndex < maxIndex - 1) $('.brick-row').eq(rIndex + 2).find('.brick').eq(bIndex + bricks[i]).addClass('smashed');
                    }
                }
            }
        } else {
            $('.brick').addClass('smashed');
        }
        $('.smashed').each(function () {
            var x = (Math.random() * 200) - 100;
            var y = (Math.random() * 400) + 300;
            var rot = (Math.random() * 720) - 360;
            var scale = Math.random();
            $(this).css({
                'WebkitTransform': 'translateX(' + x + 'px) translateY(' + y + 'px) scale(' + scale + ')',
                'MozTransform': 'translateX(' + x + 'px) translateY(' + y + 'px) scale(' + scale + ')'
        });
            $(this).find('.part1, .part2, .part3').each(function (index) {
                var xOffset = (Math.random() * 200) - 100;
                var yOffset = (Math.random() * 100) - 50;
                var rotOffset = (Math.random() * 360) - 180;
                $(this).css({
                    'WebkitTransform': 'translateX(' + (x + xOffset) + 'px) translateY(' + (y + yOffset) + 'px) rotate(' + (rot + rotOffset) + 'deg) scale(' + scale + ')',
                    'MozTransform': 'translateX(' + (x + xOffset) + 'px) translateY(' + (y + yOffset) + 'px) rotate(' + (rot + rotOffset) + 'deg) scale(' + scale + ')'
            });
            });
        });
        $('.smashed .crack').show();
        $('.dust').css({
            top: aSalmon.shazamBrickGame.mouseYStart - 60,
            left: aSalmon.shazamBrickGame.mouseX - 160,
            'WebkitTransform': 'scale(2.5)',
            'MozTransform': 'scale(2.5)'
    }).fadeOut(600, function () {
            $('.dust').css({
                top: -400,
                left: -400,
                display: 'block',
                'WebkitTransform': 'scale(.3)',
                'MozTransform': 'scale(.3)'
    });
        });
        
        aSalmon.shazamBrickGame.bricksRemaining = aSalmon.shazamBrickGame.bricksForCurrentLevel - $('#the-wall .brick.smashed').length;
        $('#bricks-remaining').text(aSalmon.shazamBrickGame.bricksRemaining);
        aSalmon.shazamBrickGame.removeLife();
        aSalmon.shazamBrickGame.checkScore();
        $('.container').blur();
    },
    checkCloudCollision: function () {
        if ($('.cloud').length > 0) {
            $('.cloud').addClass('paused');
            var numClouds = $('.cloud').length;
            for (i = 0; i < numClouds; i++) {
                var cloud = $('.cloud').eq(i);
                var cloudPosX = cloud.position().left + 47;
                var cloudPosY = cloud.position().top + 36;
                if (Math.pow(cloudPosX - aSalmon.shazamBrickGame.mouseX, 2) + Math.pow(cloudPosY - aSalmon.shazamBrickGame.mouseYStart, 2) < 8000) {
                    cloud.remove();
                    $('#splash').css({
                        opacity: 1,
                        display: 'block',
                        left: aSalmon.shazamBrickGame.mouseX - 72,
                        top: aSalmon.shazamBrickGame.mouseYStart - 74
                    }).animate({
                        opacity: 0
                    }, 2000, function () {
                        $(this).css('display', 'none');
                    });
                    $('.cloud').removeClass('paused');
                    return true;
                }
            }
            $('.cloud').removeClass('paused');
        }
        return false;
    },
    checkSnowCollision: function () {
        if ($('.snow-flake').length > 0) {
            $('.snow-flake').addClass('paused');
            var numSnowFlakes = $('.snow-flake').length;
            for (i = 0; i < numSnowFlakes; i++) {
                var snowFlake = $('.snow-flake').eq(i);
                var snowFlakePosX = snowFlake.position().left + 70;
                var snowFlakePosY = snowFlake.position().top + 70;
                console.log(Math.pow(snowFlakePosX - aSalmon.shazamBrickGame.mouseX, 2) + Math.pow(snowFlakePosY - aSalmon.shazamBrickGame.mouseYStart, 2));
                if (Math.pow(snowFlakePosX - aSalmon.shazamBrickGame.mouseX, 2) + Math.pow(snowFlakePosY - aSalmon.shazamBrickGame.mouseYStart, 2) < 7000) {
                    console.log('freeze');
                    snowFlake.remove();
                    $('.wrecking-ball').css('background-position', '-400px -800px');
                    $('.broken-ball').css('display', 'block');
                    $('.snow-flake').removeClass('paused');
                    return true;
                }
            }
            $('.snow-flake').removeClass('paused');
        }
        return false;
    },
    checkBombCollision: function () {
        if ($('.bomb').length > 0) {
            $('.bomb').addClass('paused');
            var bomb = $('.bomb').eq(0);
            var bombPosX = bomb.position().left + 64;
            var bombPosY = bomb.position().top + 52;
            if (Math.pow(bombPosX - aSalmon.shazamBrickGame.mouseX, 2) + Math.pow(bombPosY - aSalmon.shazamBrickGame.mouseYStart, 2) < 5000) {
                bomb.remove();
                return true;
            }
            $('.bomb').removeClass('paused');
        }
        return false;
    },
    generateCloud: function () {
        var numClouds = Math.floor((Math.random() * 2) + 1);
        for (i = 0; i < numClouds; i++) {
            var cloud = $('<div class="cloud cloud-pass"></div>');
            var delayRnd = Math.random();
            var heightRnd = Math.random();
            cloud.css({
                'WebkitAnimationDuration': Math.floor((Math.random() * 3000) + 4000) + "ms",
                'WebkitAnimationDelay': Math.floor(delayRnd * i * 800) + "ms",
                'MozAnimationDuration': Math.floor((Math.random() * 3000) + 4000) + "ms",
                'MozAnimationDelay': Math.floor(delayRnd * i * 800) + "ms",
                top: (heightRnd * (i + 1) * 140)
            });
            $('#the-wall').append(cloud);
        }
        var lastCloud = $('.cloud').length - 1;
        $('.cloud')[lastCloud].addEventListener('webkitAnimationEnd', function () {
            aSalmon.shazamBrickGame.generateCloud();
        });
        $('.cloud')[lastCloud].addEventListener('animationend', function () {
            aSalmon.shazamBrickGame.generateCloud();
        });
        if ($('.splash').length < 1) {
            var splash = $('<div id="splash"></div>');
            $('#the-wall').append(splash);
        }
    },
    generateSnow: function () {
        var numSnowFlakes = 1 + Math.round(Math.random());
        for (i = 0; i < numSnowFlakes; i++) {
            var snowFlake = $('<div class="snow-flake snow-fall"></div>');
            var delayRnd = Math.random();
            var leftRnd = Math.random();
            snowFlake.css({
                'WebkitAnimationDuration': Math.floor((Math.random() * 3000) + 3500) + "ms",
                'WebkitAnimationDelay': Math.floor(delayRnd * i * 2000) + "ms",
                'MozAnimationDuration': Math.floor((Math.random() * 3000) + 3500) + "ms",
                'MozAnimationDelay': Math.floor(delayRnd * i * 2000) + "ms",
                left: (leftRnd * (i + 1) * 150)
            });
            $('#the-wall').append(snowFlake);
        }
        var lastflake = $('.snow-flake').length - 1;
        $('.snow-flake')[lastflake].addEventListener('webkitAnimationEnd', function () {
            aSalmon.shazamBrickGame.generateSnow();
        });
        $('.snow-flake')[lastflake].addEventListener('animationend', function () {
            aSalmon.shazamBrickGame.generateSnow();
        });
    },
    generateBombs: function () {
        var bomb = $('<div class="bomb bomb-drop"></div>');
        var delayRnd = Math.random();
        var leftRnd = Math.random();
        bomb.css({
            'WebkitAnimationDuration': Math.floor((Math.random() * 3000) + 4000) + "ms",
            'WebkitAnimationDelay': Math.floor(delayRnd * i * 2000) + "ms",
            'MozAnimationDuration': Math.floor((Math.random() * 3000) + 4000) + "ms",
            'MozAnimationDelay': Math.floor(delayRnd * i * 2000) + "ms",
            left: Math.floor(leftRnd * (i + 1) * 140)
        });
        $('#the-wall').append(bomb);
        var lastbomb = $('.bomb').length - 1;
        $('.bomb')[lastbomb].addEventListener('webkitAnimationEnd', function () {
            $('.bomb').remove();
            aSalmon.shazamBrickGame.generateBombs();
        });
        $('.bomb')[lastbomb].addEventListener('animationend', function () {
            $('.bomb').remove();
            aSalmon.shazamBrickGame.generateBombs();
        });
    },
    removeLife: function () {
        aSalmon.shazamBrickGame.lives--;
        switch (aSalmon.shazamBrickGame.lives) {
            case 2:
                $('#life3').addClass('dead');
                break;
            case 1:
                $('#life2').addClass('dead');
                break;
            case 0:
                $('#life1').addClass('dead');
                break;
        }
    },
    computeScore: function() {
        return Math.round(10000 * ((aSalmon.shazamBrickGame.bricksForCurrentLevel - aSalmon.shazamBrickGame.bricksRemaining) / aSalmon.shazamBrickGame.bricksForCurrentLevel));
    },
    checkScore: function () {
        if (aSalmon.shazamBrickGame.bricksRemaining < aSalmon.shazamBrickGame.bricksForCurrentLevel * .25 && aSalmon.shazamBrickGame.level < 5) {
            aSalmon.shazamBrickGame.scores.push(aSalmon.shazamBrickGame.computeScore());
            window.setTimeout(aSalmon.shazamBrickGame.generateNewLevel, 1000);
            aSalmon.shazamBrickGame.resetTimer();
        } else if (aSalmon.shazamBrickGame.bricksRemaining < aSalmon.shazamBrickGame.bricksForCurrentLevel * .25 && aSalmon.shazamBrickGame.level == 5) {
            aSalmon.shazamBrickGame.scores.push(aSalmon.shazamBrickGame.computeScore());
            aSalmon.shazamBrickGame.resetTimer();
            $('#level-start').hide();
            aSalmon.shazamBrickGame.generateScoreSheet();
            aSalmon.shazamBrickGame.gameOver(true);

        } else {
            if (aSalmon.shazamBrickGame.lives == 0) {
                aSalmon.shazamBrickGame.scores.push(aSalmon.shazamBrickGame.computeScore());
                aSalmon.shazamBrickGame.generateScoreSheet();
                aSalmon.shazamBrickGame.gameOver(false);
            }
        }
    },
    generateScoreSheet: function () {
        var totalScore = 0;
        var len = aSalmon.shazamBrickGame.scores.length;
        for (var i = 0; i < len; i++) {
            $('#score-sheet ul li').eq(i).find('span').text(aSalmon.shazamBrickGame.scores[i]);
            totalScore += aSalmon.shazamBrickGame.scores[i];
        }
        $('.total-score').text(totalScore);
        var encodedURI = encodeURIComponent("http://www.amex.com.au");
        var encodedText = encodeURIComponent("I just scored " + totalScore + " pts in the #Amex #ImpossibleGame. Like to take a swing yourself?");
        var tweetUrl = "https://twitter.com/share?url=" + encodedURI + "&text=" + encodedText;
        var encodedFBURI = encodeURIComponent(aSalmon.shazamBrickGame.gameUrl + aSalmon.shazamBrickGame.fbSharePage);
        var fbShareUrl = "http://www.facebook.com/sharer/sharer.php?u=" + encodedFBURI;
        //console.log(tweetUrl);
        $('.tw').attr('href', tweetUrl);
        $(".fb").attr('href', fbShareUrl);
    },
    timeRemaining: 31,
    gameTimer: null,
    timer: function () {
        if (aSalmon.shazamBrickGame.timeRemaining >= 1) {
            aSalmon.shazamBrickGame.gameTimer = setTimeout(aSalmon.shazamBrickGame.timer, 1000);
            aSalmon.shazamBrickGame.timeRemaining -= 1;
            $('#timer').text(aSalmon.shazamBrickGame.timeRemaining);
        } else {
            aSalmon.shazamBrickGame.checkScore();
            aSalmon.shazamBrickGame.gameOver(false);
        }
    },
    resetTimer: function() {
        clearTimeout(aSalmon.shazamBrickGame.gameTimer);
        aSalmon.shazamBrickGame.timeRemaining = 31;
    },
    inactivityTimer: null,
    startInactivityTimer: function () {
        aSalmon.shazamBrickGame.inactivityTimer = setTimeout(aSalmon.shazamBrickGame.helpOut, 5000);
    },
    helpOut: function () {
        alert('Select a spot on the wall and take a swing.');
    },
    gameOver: function (won) {
        aSalmon.shazamBrickGame.resetTimer();
        if (won) {
            $('.bad-luck').hide();
            //$('play-again-btn').hide();
            $('.well-done').show();
        } else {
            $('.well-done').hide();
            //$('play-again-btn').show();
            $('.bad-luck').show();
        }
        $('#game-level').delay(500).fadeOut(1000, function () {
            $('#game-over').fadeIn(function () {
                $('#game-over .progress-bar').css('width', '320px');
                $('#score-sheet').delay(5000).fadeIn(1000);
            }).delay(5000).fadeOut(0);
        });
    }
			
};
