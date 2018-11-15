var gameactive = false;
var canstart = false;
var connecteddevice = false;
var currentscreen = 'start';
var display;
var timer;
var timeObj;
var score = 0;
var median = 0;
var lastvalue = 0;
var medianlimit = 1;

function updateDeviceStatus(state) {
  if( state == 'connect' ) {
    $('#connectinfo').text('Connected - scanning minds');
  } else if( state == 'canstart' ) {
    $('#connectinfo').text('Mind Scan Complete - activity detected');
  }
}


  function getEl(inval) {
    obj = document.getElementById(inval);
    return obj;
  }

  function whichAnimationEvent(){
    var t,
      el = document.createElement("fakeelement");

    var transitions = {
        "animation"      : "animationend",
        "OAnimation"     : "oAnimationEnd",
        "MozAnimation"   : "animationend",
        "WebkitAnimation": "webkitAnimationEnd"
    }

    for (t in transitions){
      if (el.style[t] !== undefined){
        return transitions[t];
      }
    }
  }

  var animationEvent = whichAnimationEvent();
  var swiper = getEl('svajp');
  var text_1 = getEl('text-1');

  var positions = new Array( '0', '-388', '-776', '-388' );
  var phonepositions = new Array( '0px 0px', '-152px 0px', '-304px 0px', '-456px 0px', '608px 0px', '-760px 0px');
  var numpos = 0;
  var phonepos = 0;
  var sleepposition = '-1162px 0px';

  function hamstermove() {
      pos = positions[numpos] +'px 0px';
      $('#hamster').css('background-position', pos);
      numpos++;
      if(numpos == 4) {
        numpos = 0;
      }
      //console.log(numpos);
  }

  function textEnded() {
    text_1.removeEventListener(animationEvent, textEnded);

    setTimeout(function() {
      $('#text-1').removeClass('fade-in-bottom');
    }, 1000);
  }

  function swipeEnded() {
    swiper.removeEventListener(animationEvent, swipeEnded);
    $('#svajp').removeClass('svajp-motion');
    $('#mobil').css('background-position', phonepositions[phonepos]);
    phonepos++;
    $('#text-1').addClass('fade-in-bottom');
    if( phonepos > 2 ) {
      phonepos = 0;
    }
  }

  function swipe() {
    score++;
    $('#score span').text(score);
    $('#svajp').addClass('svajp-motion');
    swiper.addEventListener(animationEvent, swipeEnded);
    text_1.addEventListener(animationEvent, textEnded);
  }

   var repeater = setInterval(hamstermove, 90);

   var level = 0;

  var socket = io('http://localhost:3030');
    socket.on('connect', function() {
        socket.emit('my event', {data: 'I\'m connected!'});
    });

    socket.on('attention', function (data) {
      console.log(data.data);
      if( !connecteddevice ) {
        updateDeviceStatus( 'connect' );
        connecteddevice = true;
      }

      if( data > 1 && !canstart ) {
        updateDeviceStatus( 'canstart' );
        canstart = true;
      } else if (data < 1 && currentscreen == 'start') {
        updateDeviceStatus( 'connect' );
        canstart = false;

      }

      if( gameactive ) {

        var ypos = data * 3;
        $( '#indicator' ).css({bottom: ypos+'px'});
        $( '#energy-bar .inner .graph' ).css({width: data+'%'});


        if (data == 0) {
          if( level != 0 ) {
            clearInterval(repeater);
            $('#hamster').css('background-position', sleepposition);

            level = 1;
            median = 0;
          }
        } else if (data >= 1 && data < 20) {
          if( level != 1 ) {
            clearInterval(repeater);
            repeater = setInterval(hamstermove, 800);
            level = 1;
            median = 0;
          }
        } else if (data > 20 && data < 40) {
          if( level != 2 ) {
            clearInterval(repeater);
            repeater = setInterval(hamstermove, 600);
            level = 2;
            median = 0;
          }
        } else if (data > 40 && data < 55) {
          if(level != 3 ) {
            clearInterval(repeater);
            repeater = setInterval(hamstermove, 400);
            level = 3;
            median = 0;
          }
        } else if (data > 55 && data < 65) {
          if ( level != 4 ) {
            clearInterval(repeater);
            repeater = setInterval(hamstermove, 200);
            level = 4;
            median = 0;
          }
        } else {
          if ( level != 5 ) {
            clearInterval(repeater);
            repeater = setInterval(hamstermove, 80);
            level = 5;
          }
        }

        if( data >= 78 && lastvalue >= 78 ) {
          if( median == medianlimit ) {
            median = 0;
            swipe();
          } else {
            median++;
          }
        }

        lastvalue = data;

        $('#message').text('lv = ' + lastvalue + ' || median = ' + median);

      }

    });


    function initGame() {
      clearInterval(repeater);

      console.log('init');
      score = 0;
      $('.screen').removeClass('active');

      if( gameactive ) {
        gameactive = false;
      }

      if( canstart ) {
        canstart = false;
      }

      currentscreen = 'start';
      $('#hamster').removeClass('hamsterrun').addClass('sleep');
      $('#energy-bar .inner .graph').css({width: '0%'});
      $('#score span').text('0');
      $('#screen-start').addClass('active');

    }

    function showHelp() {
      currentscreen = 'help';
      gameactive = false;
      $('.screen').removeClass('active');
      $('#screen-help').addClass('active');
    }

    function showEndScreen() {
      currentscreen = 'end';
      $('.screen').removeClass('active');
      $('#screen-end').addClass('active');
    }

    function endGame() {
      gameactive = false;
      $('#timer').text('00:00');
      $('#final-score').text(score);
      $('#hamster').removeClass('hamsterrun').addClass('sleep');
      $('#energy-bar .inner .graph' ).css({width: '0%'});
      setTimeout(function() {
        showEndScreen();
      }, 1000);
    }

    function preStartGame() {
      $('#hamster').removeClass('hamsterrun').addClass('sleep');
      $('#timer').timer('remove');
      currentscreen = 'game';
      $('.screen').removeClass('active');
      $('#screen-game').addClass('active');
      $('#countdown span').text('3');
      $('#countdown').addClass('active');

      setTimeout(function() {
        $('#countdown span').text('2');
      }, 1000);

      setTimeout(function() {
        $('#countdown span').text('1');
      }, 2000);

      setTimeout(function() {
        $('#countdown').removeClass('active');
        startGame();
      }, 3000);

    }

    function startGame() {
      gameactive = true;

      $('#timer').timer({
        countdown: true,
        duration: '1m',
        format: '%M:%S' ,
        callback: function() {
          endGame();
        },
      });
      $('#hamster').removeClass('sleep').addClass('hamsterrun');
      //timer.onTick('restart').start();
    }

    function restart() {
      console.log('restart')
        /*if (timer.expired()) {
            //setTimeout(function () { timer1.start(); }, 1000);
            gameactive == false;
            $('#hamster').removeClass('hasmterrun').addClass('sleep');
        }*/
    }


    window.onload = function () {
          /*  display = document.querySelector('#timer'),
            timer = new CountDownTimer(5),
            timeObj = CountDownTimer.parse(5);

        format(timeObj.minutes, timeObj.seconds);

        timer.onTick(format);
        */
        /*
        document.querySelector('button').addEventListener('click', function () {
            timer.start();
        });*/


        /*
        function format(minutes, seconds) {
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            display.textContent = minutes + ':' + seconds;
        }
        */
        initGame();
    };

    document.addEventListener('keyup', function (event) {
        if (event.defaultPrevented) {
            return;
        }

        var key = event.key || event.keyCode;
        /*
        if (key === 'Escape' || key === 'Esc' || key === 27) {
            doWhateverYouWantNowThatYourKeyWasHit();
        }*/
        if( key === 'x' ) {
          if( canstart && currentscreen == 'start' ) {
            preStartGame();
          }
        }

        if( key === 'h' ) {
          if( (canstart && currentscreen == 'start') || currentscreen == 'end' ) {
            showHelp();
          }
        }

        if( key === 'b' ) {
          if( currentscreen == 'help' || currentscreen == 'end' ) {
            initGame();
          }
        }

        if( key === 'q' ) {
          if( currentscreen == 'game' || currentscreen == 'help' || currentscreen == 'end') {
            initGame();
          }
        }

        if( key === 'd' ) {
          $('#debugger').toggleClass('active');
        }
    });
