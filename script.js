/*******************************************************

 /'\_/`\
/\      \     __    ___ ___     ___   _ __   __  __
\ \ \__\ \  /'__`\/' __` __`\  / __`\/\`'__\/\ \/\ \
 \ \ \_/\ \/\  __//\ \/\ \/\ \/\ \L\ \ \ \/ \ \ \_\ \
  \ \_\\ \_\ \____\ \_\ \_\ \_\ \____/\ \_\  \/`____ \
   \/_/ \/_/\/____/\/_/\/_/\/_/\/___/  \/_/   `/___/> \
                                                 /\___/
                                                 \/__/

********************************************************/

/**
 * @author Waseem Dahman
 */

(function app() {

  /**
   * Represents a memory game.
   * @constructor
   */
  function Memory() {
    this.values = [
      '0x1F602_#EF5350',
      '0x1F603_#EC407A',
      '0x1F606_#AB47BC',
      '0x1F60D_#7E57C2',
      '0x1F616_#5C6BC0',
      '0x1F61C_#42A5F5',
      '0x1F618_#26A69A',
      '0x1F628_#66BB6A',
    ];
    this.cards       = null;
    this.activePair  = [];
    this.startTime   = null;
    this.endTime     = null;
    this.gameStarted = false;
    this.gameEnded   = false;
    this.remaining   = 0;
    this.dialog      = null;
    this.init();
  };

  Memory.prototype = {

    /**
     * Initializer
     * @return {memory} - The game itself
     */
    init: function init() {
      var _this = this;
      // generate possible values
      var values = _this.getPossibilities(_this.values);
      // render cards
      _this.cards = document.querySelectorAll('.card');
      _this.remaining = _this.cards.length / 2;
      _this.cards = [].map.call(_this.cards, function update(card, i) {
        // reset before render
        card.className = 'card flip-c';
        var front = card.querySelector('.front .text');
        var back  = card.querySelector('.back .text');
        front.innerHTML = '?';
        back.innerHTML  = String.fromCodePoint(values[i].split('_')[0]);
        card.dataset.value = values[i].split('_')[0];
        back.parentNode.style.backgroundColor = values[i].split('_')[1];
        // handleClicks
        card.addEventListener('click', function handleClick() {
          _this.play(this);
        });
        return _this;
      });
    },

    /**
     * Play function (an event handler attached to every card)
     * @card  {object} card - An node object (from a node list)
     */
    play: function play(card) {
      var _this = this;
      console.log(card);
      // handle first turn
      if (!_this.started) {
        _this.started = true;
        _this.startTime = new Date();
      }
      // if card isn't already active
      if (!card.classList.contains('active')) {
        // if it still needs to paired up
        if (_this.activePair.length < 2) {
          // activate and pair up
          card.classList.add('active');
          _this.activePair.push(card);
          // if a pair is ready to be compared
          if (_this.activePair.length === 2) {
            var card1 = _this.activePair[0];
            var card2 = _this.activePair[1];
            // compare the two
            if (_this.compareValues(card1, card2)) {
              card1.classList.add('match');
              card2.classList.add('match');
              // decrement remaining matches
              _this.remaining--;
              // check if game is not done yet
              if (_this.remaining === 0) {
                // end game!
                _this.endGame();
              } else {
                // reset the pair
                _this.resetPair();
              }
            }
          }
        } else {
          _this.deactivatePair();
          card.classList.add('active');
          _this.activePair.push(card);
        }
      }
    },

    /**
     * Deativating the active pair (removes classes)
     */
    deactivatePair: function deactivatePair() {
      var _this = this;
      _this.activePair.forEach(function deactivate(card) {
        card.classList.remove('active');
      });
      _this.resetPair();
    },

    /**
     * Ending the game (shows dialog box to reset the game)
     */
    endGame: function endGame() {
      var _this    = this;
      _this.endTime = new Date();
      _this.gameEnded = true;

      var template = '<h1>YOU MADE IT!</h1><p>It took you <span class="time">%t</span> to complete the game!</p><button>Play again</button>';

      // set time to template
      template = template.replace('%t', function setTime() {
        var time = _this.calculateTime();
        if (time.minutes > 0) {
          return (
            time.minutes + ((time.minutes > 1) ? ' minutes' : ' minute') +
            ' and ' +
            time.seconds + ((time.seconds > 1) ? ' seconds' : ' second')
          );
        }
        return time.seconds + ((time.seconds > 1) ? ' seconds' : ' second');
      });

      // setup dialog
      var popup = document.createElement('DIV');
      popup.classList.add('complete');
      popup.innerHTML = template;
      _this.dialog = popup;

      // play again?
      var button = popup.querySelector('button');
      button.addEventListener('click', function handleClick() {
        _this.resetGame();
      });

      // show dialog
      setTimeout(function showDialog() {
        document.body.appendChild(popup);
        popup.classList.add('popup');
      }, 600);
    },

    /**
     * Reset the active pair
     * @return {array} - The active pair
     */
    resetPair: function resetPair() {
      var _this = this;
      _this.activePair = [];
      return _this.activePair;
    },

    /**
     * Reset the game
     * @return {memory} - The game itself
     */
    resetGame: function resetGame() {
      var _this = this;
      document.body.removeChild(_this.dialog);
      _this.activePair  = [];
      _this.init();
      return _this;
    },

    /**
     * Generate a shuffled doubled array
     * @param  {array} array - Takes an array
     * @return {array}       - Returns a shuffled doubled array
     */
    getPossibilities: function Possibilities(array) {
      var _this = this;
      var doubledValues = array.concat(array); // double
      return _this.shuffleArray(doubledValues);
    },

    /**
     * Shuffle an array
     * @param  {array} array - Takes an array
     * @return {array}       - Returns a shuffled array
     */
    shuffleArray: function shuffleArray(array) {
      /*
      Durstenfeld shuffle algorithim
      https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
      */
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    },

    /**
     * Compare two cards
     * @param  {object} card1 - Card, a node elemnt
     * @param  {object} card2 - Card, a node elemnt
     * @return {boolean}      - True, if cards are the same
     */
    compareValues: function compareValues(card1, card2) {
      if (card1.dataset.value === card2.dataset.value) {
        return true;
      }
    },

    /**
     * Calculate playtime
     * @return {object} - Milliseconds, seconds and minutes
     */
    calculateTime: function calculateTime() {
      var _this = this;
      var duration = _this.endTime - _this.startTime;
      return {
        duration: duration,
        seconds: Math.round((duration / 1000) % 60),
        minutes: Math.round(duration / (1000 * 60) % 60),
      };
    },

  };

  var game = new Memory();
  // window.game = game;
})();
