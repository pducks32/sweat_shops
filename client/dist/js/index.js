(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Box, Bucket, ConveyorBelt, Item, Player, Transaction, addPlayers, blueBucket, breakItem, foodItem, greenBucket, onPlayerDeath, redBucket, removePlayers, setupBlueBox, setupGreenBox, setupRedBox, setupYellowBox, updatePlayerCount, waterItem, yellowBucket, _;

_ = require("underscore");

Box = require("./models/box").Box;

Bucket = require("./models/bucket").Bucket;

ConveyorBelt = require("./models/conveyor_belt").ConveyorBelt;

Item = require("./models/item").Item;

Player = require("./models/player").Player;

window.Station = require("./models/station").Station;

window.Store = require("./models/store").Store;

Transaction = require("./models/transaction").Transaction;

window.NotificationCenter = require("./models/notification_center").NotificationCenter;

window.socket = io();

window.boxes = [];

window.energyInterval = setInterval((function() {
  return window.player.updateEnergy(-0.013);
}), 550);

window.player = new Player("Patrick Metcalfe");

window.Station.fire("newPlayer");

window.player.render();

window.GameOverField = document.querySelector(".GameOver");

window.GameOverTitleField = window.GameOverField.querySelector(".GameOver__title");

window.GameOverMessageField = window.GameOverField.querySelector(".GameOver__message");

window.gameOver = function(title, msg) {
  window.GameOverTitleField.innerHTML = title;
  window.GameOverMessageField.innerHTML = msg;
  window.GameOverField.style.opacity = 0;
  window.GameOverField.style.display = "block";
  return window.GameOverField.style.opacity = 1;
};

window.playerCount = document.querySelector("small.players .player-count");

window.alivePlayerCount = document.querySelector("small.players .alive-player-count");

redBucket = new Bucket({
  container: document.querySelector(".Bucket--red"),
  color: "red"
});

blueBucket = new Bucket({
  container: document.querySelector(".Bucket--blue"),
  color: "blue"
});

greenBucket = new Bucket({
  container: document.querySelector(".Bucket--green"),
  color: "green"
});

yellowBucket = new Bucket({
  container: document.querySelector(".Bucket--yellow"),
  color: "yellow"
});

window.buckets = [redBucket.draggie, blueBucket.draggie, greenBucket.draggie, yellowBucket.draggie];

window.bucketList = [redBucket, blueBucket, greenBucket, yellowBucket];

_.each(document.querySelectorAll(".Box--red"), setupRedBox = (function(_this) {
  return function(element, index, array) {
    return window.boxes.push(new Box(element, "color"));
  };
})(this));

_.each(document.querySelectorAll(".Box--blue"), setupBlueBox = (function(_this) {
  return function(element, index, array) {
    return window.boxes.push(new Box(element, "blue"));
  };
})(this));

_.each(document.querySelectorAll(".Box--green"), setupGreenBox = (function(_this) {
  return function(element, index, array) {
    return window.boxes.push(new Box(element, "green"));
  };
})(this));

_.each(document.querySelectorAll(".Box--yellow"), setupYellowBox = (function(_this) {
  return function(element, index, array) {
    return window.boxes.push(new Box(element, "yellow"));
  };
})(this));

foodItem = Item.fromSelector(".Item--food");

waterItem = Item.fromSelector(".Item--water");

breakItem = Item.fromSelector(".Item--break");

Store.addItem(foodItem);

Store.addItem(waterItem);

Store.addItem(breakItem);

if (document.visibilityState) {
  document.addEventListener("visibilitychange", function() {
    var fromState, toState;
    toState = !document.hidden;
    fromState = window.player.isWatching;
    window.player.isWatching = toState;
    return Station.fire("visibilityChange", {
      fromState: fromState,
      toState: toState
    });
  });
}

window.socket.on("playerID", function(data) {
  return window.player.id = data.id;
});

window.socket.on("addPlayers", addPlayers = function(data) {
  var addPlayer, player, _i, _len, _ref;
  addPlayer = function(player) {
    NotificationCenter.info("" + player.fullName + " has joined. Work Harder!");
    if (Modernizr.sessionstorage) {
      return sessionStorage.setItem(player.id, player.fullName);
    }
  };
  _ref = data.players;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    player = _ref[_i];
    addPlayer(player);
  }
  return updatePlayerCount(data);
});

window.socket.on("removePlayers", removePlayers = function(data) {
  var player, removePlayer, _i, _len, _ref;
  removePlayer = function(player) {
    if (Modernizr.sessionstorage) {
      return sessionStorage.removeItem(player.id);
    }
  };
  _ref = data.players;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    player = _ref[_i];
    removePlayer(player);
  }
  return updatePlayerCount(data);
});

window.socket.on("playerDied", onPlayerDeath = function(data) {
  var player;
  player = sessionStorage.getItem(data.id);
  if (window.player.id !== data.id) {
    NotificationCenter.info("Your friend " + player + " has died. Work Harder!");
  }
  return updatePlayerCount(data);
});

window.addEventListener("storage", updatePlayerCount);

updatePlayerCount = function(data) {
  window.playerCount.innerHTML = "" + data.playerCount.all;
  return window.alivePlayerCount.innerHTML = "" + data.playerCount.areAlive;
};

window.addEventListener("unload", function(evt) {
  return sessionStorage.clear();
});

window.addEventListener("load", function(evt) {
  return sessionStorage.clear();
});


},{"./models/box":2,"./models/bucket":3,"./models/conveyor_belt":4,"./models/item":5,"./models/notification_center":6,"./models/player":7,"./models/station":8,"./models/store":9,"./models/transaction":10,"underscore":11}],2:[function(require,module,exports){
var Box, _;

_ = require("underscore");

exports.Box = Box = (function() {
  Box.colors = ["red", "blue", "green", "yellow"];

  Box.randomColor = function() {
    return _.sample(this.colors);
  };

  Box.renderColor = function(color) {
    return "<div class=\"Box Box--" + color + "\></div>";
  };

  function Box(element, color) {
    this.element = element;
    this.color = color;
    this.draggie = new Draggable(this.element, window.buckets, {
      draggability: {
        containment: "#scene"
      },
      scroll: false,
      onStart: (function(_this) {
        return function() {
          return _this.onDragStart();
        };
      })(this),
      onEnd: (function(_this) {
        return function(wasDropped) {
          return _this.onDragEnd(wasDropped);
        };
      })(this)
    });
  }

  Box.prototype.onDragStart = function() {
    window.draggedBox = this;
    return this.element.classList.add("Box--dragging");
  };

  Box.prototype.onDragEnd = function(wasDropped) {
    this.element.classList.remove("Box--dragging");
    if (wasDropped) {
      this.element.classList.remove("Box--" + this.color);
      this.color = Box.randomColor();
      return this.element.classList.add("Box--" + this.color);
    }
  };

  return Box;

})();


},{"underscore":11}],3:[function(require,module,exports){
var Bucket, Station;

Station = require("./station").Station;

exports.Bucket = Bucket = (function() {
  function Bucket(options) {
    this.container = options.container, this.color = options.color, this.totalValue = options.totalValue, this.requiredAmount = options.requiredAmount;
    this.requiredAmount || (this.requiredAmount = 12);
    this.totalValue || (this.totalValue = 0.1);
    this.element = this.container.querySelector(".Bucket__DropZone");
    this.tallyElement = this.container.querySelector(".Bucket__Tally");
    this.draggie = new Droppable(this.element, {
      onDrop: (function(_this) {
        return function(instance, draggableEle) {
          return _this.onDrop();
        };
      })(this)
    });
  }

  Bucket.prototype.currentTally = 0;

  Bucket.prototype.on = function(type, listener, useCapture) {
    if (useCapture == null) {
      useCapture = false;
    }
    return this.element.addEventListener(type, listener, useCapture);
  };

  Bucket.prototype.registerHandlers = function() {
    this.on("dragenter", this.onDragEnter);
    return this.on("dragleave", this.onDragLeave);
  };

  Bucket.prototype.onDragEnter = function(e) {
    return e.target.classList.add("Bucket--dragover");
  };

  Bucket.prototype.onDropLeave = function(e) {
    return e.target.classList.remove("Bucket--dragover");
  };

  Bucket.prototype.onDrop = function() {
    if (window.draggedBox.color === this.color) {
      return this.dropSuccessful();
    } else {
      return this.dropFailed();
    }
  };

  Bucket.prototype.dropSuccessful = function() {
    this.tallyElement.classList.remove("drop--success");
    this.tallyElement.classList.remove("drop--failure");
    this.currentTally++;
    this.tallyElement.classList.add("drop--success");
    this.updateTally();
    return Station.fire("correctBox", {
      box: this.color
    });
  };

  Bucket.prototype.dropFailed = function() {
    this.tallyElement.classList.remove("drop--success");
    this.tallyElement.classList.remove("drop--failure");
    this.currentTally--;
    this.tallyElement.classList.add("drop--failure");
    this.updateTally();
    return Station.fire("wrongBox", {
      box: this.color
    });
  };

  Bucket.prototype.updateTally = function() {
    var newText;
    if (this.isFull()) {
      Station.fire("bucketFilled");
      this.empty();
      window.player.updateBalance(this.totalValue);
    }
    newText = "" + this.currentTally + "/" + this.requiredAmount;
    return this.tallyElement.innerHTML = newText;
  };

  Bucket.prototype.isFull = function() {
    return this.currentTally === this.requiredAmount;
  };

  Bucket.prototype.empty = function() {
    return this.currentTally = 0;
  };

  return Bucket;

})();


},{"./station":8}],4:[function(require,module,exports){
var ConveyorBelt;

exports.ConveyorBelt = ConveyorBelt = (function() {
  ConveyorBelt.colors = ["red", "blue", "green", "yellow"];

  ConveyorBelt.randomColor = function() {
    return _.sample(this.colors);
  };

  function ConveyorBelt(element) {
    this.element = element;
  }

  ConveyorBelt.prototype.boxes = [[]];

  ConveyorBelt.prototype.addBox = function(box) {
    return this.boxes.push(box);
  };

  ConveyorBelt.prototype.newBox = function(color) {
    if (color == null) {
      color = this.randomColor;
    }
    return addBox(Box.renderColor(color), new Box(color));
  };

  return ConveyorBelt;

})();


},{}],5:[function(require,module,exports){
var Item;

exports.Item = Item = (function() {
  function Item(name, price, energy, element) {
    this.name = name;
    this.price = price;
    this.energy = energy;
    this.element = element != null ? element : "";
    this.element.addEventListener("click", (function(_this) {
      return function(evt) {
        return Store.buy(_this);
      };
    })(this));
  }

  Item.fromElement = function(element) {
    var energyGain, name, price;
    name = element.dataset.name;
    price = parseFloat(element.dataset.price);
    energyGain = parseFloat(element.dataset.energy);
    return new Item(name, price, energyGain, element);
  };

  Item.fromId = function(id) {
    return this.fromElement(document.getElementById(id));
  };

  Item.fromSelector = function(selector) {
    return this.fromElement(document.querySelector(selector));
  };

  return Item;

})();


},{}],6:[function(require,module,exports){
var NotificationCenter;

NotificationCenter = {};

NotificationCenter.congratulate = humane.spawn({
  addnCls: 'humane-flatty-success',
  timeout: 1000
});

NotificationCenter.error = humane.spawn({
  addnCls: 'humane-flatty-error',
  timeout: 1000
});

NotificationCenter.info = humane.spawn({
  addnCls: 'humane-flatty-info',
  timeout: 750
});

module.exports.NotificationCenter = NotificationCenter;


},{}],7:[function(require,module,exports){
var Player;

exports.Player = Player = (function() {
  function Player(fullName) {
    this.fullName = fullName;
  }

  Player.prototype.id = 0;

  Player.prototype.firstName = function() {
    return this.fullName.split(" ")[0];
  };

  Player.prototype.lastName = function() {
    return this.fullName.split(" ")[1];
  };

  Player.prototype.energyField = document.querySelector(".Player__energy");

  Player.prototype.balanceField = document.querySelector(".Player__balance");

  Player.prototype.nameField = document.querySelector(".Player__name");

  Player.prototype.balance = 0.00;

  Player.prototype.energy = 1;

  Player.prototype.isDead = false;

  Player.prototype.canAfford = function(item) {
    return this.balance >= item.price;
  };

  Player.prototype.willKill = function(amount) {
    return (this.energy + amount) <= 0;
  };

  Player.prototype.kill = function() {
    this.isDead = true;
    clearInterval(window.energyInterval);
    this.energy = 0;
    this.renderEnergy();
    return Station.fire("playerDied");
  };

  Player.prototype.updateEnergy = function(amount) {
    var from;
    if (this.willKill(amount)) {
      return this.kill();
    }
    from = this.energy;
    this.energy = parseFloat((this.energy + amount).toFixed(2));
    Station.fire("playerUpdate", {
      field: "energy",
      from: from,
      to: this.energy
    });
    return this.renderEnergy();
  };

  Player.prototype.updateBalance = function(amount) {
    var from;
    from = this.balance;
    this.balance = parseFloat((this.balance + amount).toFixed(2));
    Station.fire("playerUpdate", {
      field: "balance",
      from: from,
      to: this.balance
    });
    return this.renderBalance();
  };

  Player.prototype.render = function() {
    this.renderName();
    this.renderBalance();
    return this.renderEnergy();
  };

  Player.prototype.renderName = function() {
    return this.nameField.innerHTML = this.firstName();
  };

  Player.prototype.renderBalance = function() {
    return this.balanceField.innerHTML = "$" + this.balance;
  };

  Player.prototype.renderEnergy = function() {
    return this.energyField.innerHTML = "" + (this.energy * 100) + "%";
  };

  return Player;

})();


},{}],8:[function(require,module,exports){
var Station;

exports.Station = Station = (function() {
  function Station() {}

  Station.fire = function(name, details) {
    switch (name) {
      case "newPlayer":
        return this.onNewPlayer();
      case "playerUpdate":
        return this.onPlayerUpdate(details);
      case "correctBox":
        return this.onCorrectBox(details);
      case "wrongBox":
        return this.onWrongBox(details);
      case "getPlayer":
        return this.onGetPlayer(details);
      case "tookBreak":
        return this.onTookBreak();
      case "successfulPurchase":
        return this.onSuccessfulPurchase(details);
      case "failedPurchase":
        return this.onFailedPurchase(details);
      case "bucketFilled":
        return this.onBucketFilled();
      case "visibilityChange":
        return this.onVisibilityChange(details);
      case "playerDied":
        return this.onPlayerDeath();
      default:
        return console.error("UNKNOWN EVENT: (" + name + ")");
    }
  };

  Station.onNewPlayer = function(details) {
    return window.socket.emit("newPlayer", window.player);
  };

  Station.onPlayerUpdate = function(details) {
    return window.socket.emit("update", {
      player: window.player
    });
  };

  Station.onSuccessfulPurchase = function(details) {
    NotificationCenter.congratulate("You have bought " + details.name + " for $" + (details.price.toFixed(2)));
    return window.socket.emit("purchase", {
      transaction: {
        name: details.name,
        price: details.price
      }
    });
  };

  Station.onFailedPurchase = function(details) {
    return NotificationCenter.error("You do not have enough money. Work Harder!");
  };

  Station.onBucketFilled = function() {
    return window.socket.emit("bucketFilled");
  };

  Station.onGetPlayer = function(details) {
    return window.socket.emit("getPlayer", {
      id: details.id
    });
  };

  Station.onTookBreak = function() {
    clearInterval(window.energyInterval);
    window.gameOver("No Breaks", "Because you took a break you were fired from your job and without a source of income: you died.");
    return window.socket.emit("break");
  };

  Station.onPlayerDeath = function() {
    window.gameOver("You Died", "You had no energy left and literally fell over on the job. Your manager didn't even notice.");
    return window.socket.emit("death");
  };

  Station.onCorrectBox = function(details) {
    var buckets;
    buckets = window.bucketList.map(function(bucket) {
      return {
        color: bucket.color,
        currentTally: bucket.currentTally,
        requiredAmount: bucket.requiredAmount,
        totalValue: bucket.totalValue
      };
    });
    return window.socket.emit("correctbox", {
      box: details.box,
      buckets: buckets
    });
  };

  Station.onWrongBox = function(details) {
    var buckets;
    buckets = window.bucketList.map(function(bucket) {
      return {
        color: bucket.color,
        currentTally: bucket.currentTally,
        requiredAmount: bucket.requiredAmount,
        totalValue: bucket.totalValue
      };
    });
    return window.socket.emit("wrongbox", {
      box: details.box,
      buckets: buckets
    });
  };

  Station.onVisibilityChange = function(details) {
    return window.socket.emit("visibilityChange", {
      fromState: details.fromState,
      toState: details.toState
    });
  };

  return Station;

})();


},{}],9:[function(require,module,exports){
var Station, Store, Transaction;

Transaction = require("./transaction").Transaction;

Station = require("./station").Station;

exports.Store = Store = (function() {
  function Store() {}

  Store.items = [];

  Store.addItem = function(item) {
    return this.items.push(item);
  };

  Store.buy = function(item) {
    var transaction;
    transaction = new Transaction(item);
    if (window.player.canAfford(transaction) && transaction.name !== "a break") {
      transaction.isSuccess = true;
      transaction.apply();
    } else if (transaction.name === "a break") {
      Station.fire("tookBreak");
      transaction.isSuccess = true;
    } else {
      transaction.isSuccess = false;
    }
    return Station.fire("" + (transaction.state()) + "Purchase", transaction);
  };

  return Store;

})();


},{"./station":8,"./transaction":10}],10:[function(require,module,exports){
var Transaction;

exports.Transaction = Transaction = (function() {
  function Transaction(item) {
    this.item = item;
    this.price = this.item.price;
    this.name = this.item.name;
  }

  Transaction.prototype.apply = function() {
    this.time = Date.now();
    window.player.updateEnergy(this.item.energy);
    return window.player.updateBalance(-1 * this.price);
  };

  Transaction.prototype.state = function() {
    if (this.isSuccess) {
      return "successful";
    } else {
      return "failed";
    }
  };

  return Transaction;

})();


},{}],11:[function(require,module,exports){
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL1BEVUNLUy9EZXNrdG9wL1JlbGlnaW9uL2NsaWVudC9zcmMvY29mZmVlL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvYm94LmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvYnVja2V0LmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvY29udmV5b3JfYmVsdC5jb2ZmZWUiLCIvVXNlcnMvUERVQ0tTL0Rlc2t0b3AvUmVsaWdpb24vY2xpZW50L3NyYy9jb2ZmZWUvbW9kZWxzL2l0ZW0uY29mZmVlIiwiL1VzZXJzL1BEVUNLUy9EZXNrdG9wL1JlbGlnaW9uL2NsaWVudC9zcmMvY29mZmVlL21vZGVscy9ub3RpZmljYXRpb25fY2VudGVyLmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvcGxheWVyLmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvc3RhdGlvbi5jb2ZmZWUiLCIvVXNlcnMvUERVQ0tTL0Rlc2t0b3AvUmVsaWdpb24vY2xpZW50L3NyYy9jb2ZmZWUvbW9kZWxzL3N0b3JlLmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvdHJhbnNhY3Rpb24uY29mZmVlIiwiL1VzZXJzL1BEVUNLUy9EZXNrdG9wL1JlbGlnaW9uL25vZGVfbW9kdWxlcy91bmRl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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgXCJ1bmRlcnNjb3JlXCJcbntCb3h9ID0gcmVxdWlyZSBcIi4vbW9kZWxzL2JveFwiXG57QnVja2V0fSA9IHJlcXVpcmUgXCIuL21vZGVscy9idWNrZXRcIlxue0NvbnZleW9yQmVsdH0gPSByZXF1aXJlIFwiLi9tb2RlbHMvY29udmV5b3JfYmVsdFwiXG57SXRlbX0gPSByZXF1aXJlIFwiLi9tb2RlbHMvaXRlbVwiXG57UGxheWVyfSA9IHJlcXVpcmUgXCIuL21vZGVscy9wbGF5ZXJcIlxud2luZG93LlN0YXRpb24gPSByZXF1aXJlKFwiLi9tb2RlbHMvc3RhdGlvblwiKS5TdGF0aW9uXG53aW5kb3cuU3RvcmUgPSByZXF1aXJlKFwiLi9tb2RlbHMvc3RvcmVcIikuU3RvcmVcbntUcmFuc2FjdGlvbn0gPSByZXF1aXJlIFwiLi9tb2RlbHMvdHJhbnNhY3Rpb25cIlxud2luZG93Lk5vdGlmaWNhdGlvbkNlbnRlciA9IHJlcXVpcmUoXCIuL21vZGVscy9ub3RpZmljYXRpb25fY2VudGVyXCIpLk5vdGlmaWNhdGlvbkNlbnRlclxuXG53aW5kb3cuc29ja2V0ID0gaW8oKVxud2luZG93LmJveGVzID0gW11cbndpbmRvdy5lbmVyZ3lJbnRlcnZhbCA9IHNldEludGVydmFsKCgtPiB3aW5kb3cucGxheWVyLnVwZGF0ZUVuZXJneSgtMC4wMTMpKSwgNTUwKVxud2luZG93LnBsYXllciA9IG5ldyBQbGF5ZXIoXCJQYXRyaWNrIE1ldGNhbGZlXCIpXG53aW5kb3cuU3RhdGlvbi5maXJlIFwibmV3UGxheWVyXCJcbndpbmRvdy5wbGF5ZXIucmVuZGVyKClcbndpbmRvdy5HYW1lT3ZlckZpZWxkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5HYW1lT3ZlclwiKVxud2luZG93LkdhbWVPdmVyVGl0bGVGaWVsZCA9IHdpbmRvdy5HYW1lT3ZlckZpZWxkLnF1ZXJ5U2VsZWN0b3IoXCIuR2FtZU92ZXJfX3RpdGxlXCIpXG53aW5kb3cuR2FtZU92ZXJNZXNzYWdlRmllbGQgPSB3aW5kb3cuR2FtZU92ZXJGaWVsZC5xdWVyeVNlbGVjdG9yKFwiLkdhbWVPdmVyX19tZXNzYWdlXCIpXG53aW5kb3cuZ2FtZU92ZXIgPSAodGl0bGUsIG1zZykgLT5cbiAgd2luZG93LkdhbWVPdmVyVGl0bGVGaWVsZC5pbm5lckhUTUwgPSB0aXRsZVxuICB3aW5kb3cuR2FtZU92ZXJNZXNzYWdlRmllbGQuaW5uZXJIVE1MID0gbXNnXG4gIHdpbmRvdy5HYW1lT3ZlckZpZWxkLnN0eWxlLm9wYWNpdHkgPSAwXG4gIHdpbmRvdy5HYW1lT3ZlckZpZWxkLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCJcbiAgd2luZG93LkdhbWVPdmVyRmllbGQuc3R5bGUub3BhY2l0eSA9IDFcbiMgU2V0dXAgUGxheWVyIENvdW50XG53aW5kb3cucGxheWVyQ291bnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIFwic21hbGwucGxheWVycyAucGxheWVyLWNvdW50XCJcbndpbmRvdy5hbGl2ZVBsYXllckNvdW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciBcInNtYWxsLnBsYXllcnMgLmFsaXZlLXBsYXllci1jb3VudFwiXG5cbnJlZEJ1Y2tldCA9IG5ldyBCdWNrZXQoe1xuICAgICAgY29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLkJ1Y2tldC0tcmVkXCIpLFxuICAgICAgY29sb3I6IFwicmVkXCIsXG4gICAgICB9KTtcbmJsdWVCdWNrZXQgPSBuZXcgQnVja2V0KHtcbiAgICAgIGNvbnRhaW5lcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5CdWNrZXQtLWJsdWVcIiksXG4gICAgICBjb2xvcjogXCJibHVlXCIsXG4gICAgICB9KTtcbmdyZWVuQnVja2V0ID0gbmV3IEJ1Y2tldCh7XG4gICAgICBjb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuQnVja2V0LS1ncmVlblwiKSxcbiAgICAgIGNvbG9yOiBcImdyZWVuXCIsXG4gICAgICB9KTtcbnllbGxvd0J1Y2tldCA9IG5ldyBCdWNrZXQoe1xuICAgICAgY29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLkJ1Y2tldC0teWVsbG93XCIpLFxuICAgICAgY29sb3I6IFwieWVsbG93XCIsXG4gICAgICB9KTtcbndpbmRvdy5idWNrZXRzID0gW3JlZEJ1Y2tldC5kcmFnZ2llLCBibHVlQnVja2V0LmRyYWdnaWUsIGdyZWVuQnVja2V0LmRyYWdnaWUsIHllbGxvd0J1Y2tldC5kcmFnZ2llXVxud2luZG93LmJ1Y2tldExpc3QgPSBbcmVkQnVja2V0LCBibHVlQnVja2V0LCBncmVlbkJ1Y2tldCwgeWVsbG93QnVja2V0XVxuXG4jIFNldHVwIEJveGVzLi4uRk9SIE5PV1xuXy5lYWNoIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuQm94LS1yZWRcIiksIHNldHVwUmVkQm94ID0gKGVsZW1lbnQsIGluZGV4LCBhcnJheSkgPT5cbiAgd2luZG93LmJveGVzLnB1c2gobmV3IEJveCBlbGVtZW50LCBcImNvbG9yXCIpXG5fLmVhY2ggZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5Cb3gtLWJsdWVcIiksIHNldHVwQmx1ZUJveCA9IChlbGVtZW50LCBpbmRleCwgYXJyYXkpID0+XG4gIHdpbmRvdy5ib3hlcy5wdXNoKG5ldyBCb3ggZWxlbWVudCwgXCJibHVlXCIpXG5fLmVhY2ggZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5Cb3gtLWdyZWVuXCIpLCBzZXR1cEdyZWVuQm94ID0gKGVsZW1lbnQsIGluZGV4LCBhcnJheSkgPT5cbiAgd2luZG93LmJveGVzLnB1c2gobmV3IEJveCBlbGVtZW50LCBcImdyZWVuXCIpXG5fLmVhY2ggZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5Cb3gtLXllbGxvd1wiKSwgc2V0dXBZZWxsb3dCb3ggPSAoZWxlbWVudCwgaW5kZXgsIGFycmF5KSA9PlxuICB3aW5kb3cuYm94ZXMucHVzaChuZXcgQm94IGVsZW1lbnQsIFwieWVsbG93XCIpXG5cblxuXG5cblxuXG5cbiMgU2V0dXAgU3RvcmVcbmZvb2RJdGVtID0gSXRlbS5mcm9tU2VsZWN0b3IgXCIuSXRlbS0tZm9vZFwiXG53YXRlckl0ZW0gPSBJdGVtLmZyb21TZWxlY3RvciBcIi5JdGVtLS13YXRlclwiXG5icmVha0l0ZW0gPSBJdGVtLmZyb21TZWxlY3RvciBcIi5JdGVtLS1icmVha1wiXG5TdG9yZS5hZGRJdGVtIGZvb2RJdGVtXG5TdG9yZS5hZGRJdGVtIHdhdGVySXRlbVxuU3RvcmUuYWRkSXRlbSBicmVha0l0ZW1cblxuIyBTZXR1cCBWaXNhYmlsaXR5XG5pZiBkb2N1bWVudC52aXNpYmlsaXR5U3RhdGVcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcInZpc2liaWxpdHljaGFuZ2VcIiwgLT5cbiAgICB0b1N0YXRlID0gIWRvY3VtZW50LmhpZGRlblxuICAgIGZyb21TdGF0ZSA9IHdpbmRvdy5wbGF5ZXIuaXNXYXRjaGluZ1xuICAgIHdpbmRvdy5wbGF5ZXIuaXNXYXRjaGluZyA9IHRvU3RhdGVcbiAgICBTdGF0aW9uLmZpcmUgXCJ2aXNpYmlsaXR5Q2hhbmdlXCIsIHsgZnJvbVN0YXRlLCB0b1N0YXRlIH1cblxuIyBTZXR1cCBMaXN0ZW5lcnNcbndpbmRvdy5zb2NrZXQub24gXCJwbGF5ZXJJRFwiLCAoZGF0YSkgLT5cbiAgd2luZG93LnBsYXllci5pZCA9IGRhdGEuaWRcbndpbmRvdy5zb2NrZXQub24gXCJhZGRQbGF5ZXJzXCIsIGFkZFBsYXllcnMgPSAoZGF0YSkgLT5cbiAgYWRkUGxheWVyID0gKHBsYXllcikgLT5cbiAgICBOb3RpZmljYXRpb25DZW50ZXIuaW5mbyBcIiN7cGxheWVyLmZ1bGxOYW1lfSBoYXMgam9pbmVkLiBXb3JrIEhhcmRlciFcIlxuICAgIGlmIE1vZGVybml6ci5zZXNzaW9uc3RvcmFnZVxuICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSBwbGF5ZXIuaWQsIHBsYXllci5mdWxsTmFtZVxuICBhZGRQbGF5ZXIocGxheWVyKSBmb3IgcGxheWVyIGluIGRhdGEucGxheWVyc1xuICB1cGRhdGVQbGF5ZXJDb3VudChkYXRhKVxuXG53aW5kb3cuc29ja2V0Lm9uIFwicmVtb3ZlUGxheWVyc1wiLCByZW1vdmVQbGF5ZXJzID0gKGRhdGEpIC0+XG4gIHJlbW92ZVBsYXllciA9IChwbGF5ZXIpIC0+XG4gICAgaWYgTW9kZXJuaXpyLnNlc3Npb25zdG9yYWdlXG4gICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtIHBsYXllci5pZFxuICByZW1vdmVQbGF5ZXIocGxheWVyKSBmb3IgcGxheWVyIGluIGRhdGEucGxheWVyc1xuICB1cGRhdGVQbGF5ZXJDb3VudChkYXRhKVxuXG5cbndpbmRvdy5zb2NrZXQub24gXCJwbGF5ZXJEaWVkXCIsIG9uUGxheWVyRGVhdGggPSAoZGF0YSkgLT5cbiAgcGxheWVyID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShkYXRhLmlkKVxuICBOb3RpZmljYXRpb25DZW50ZXIuaW5mbyBcIllvdXIgZnJpZW5kICN7cGxheWVyfSBoYXMgZGllZC4gV29yayBIYXJkZXIhXCIgdW5sZXNzIHdpbmRvdy5wbGF5ZXIuaWQgaXMgZGF0YS5pZFxuICB1cGRhdGVQbGF5ZXJDb3VudCBkYXRhXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBcInN0b3JhZ2VcIiwgdXBkYXRlUGxheWVyQ291bnRcblxudXBkYXRlUGxheWVyQ291bnQgPSAoZGF0YSkgLT5cbiAgd2luZG93LnBsYXllckNvdW50LmlubmVySFRNTCA9IFwiI3tkYXRhLnBsYXllckNvdW50LmFsbH1cIlxuICB3aW5kb3cuYWxpdmVQbGF5ZXJDb3VudC5pbm5lckhUTUwgPSBcIiN7ZGF0YS5wbGF5ZXJDb3VudC5hcmVBbGl2ZX1cIlxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBcInVubG9hZFwiLCAoZXZ0KSAtPlxuICBzZXNzaW9uU3RvcmFnZS5jbGVhcigpXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBcImxvYWRcIiwgKGV2dCkgLT5cbiAgc2Vzc2lvblN0b3JhZ2UuY2xlYXIoKVxuIiwiXyA9IHJlcXVpcmUgXCJ1bmRlcnNjb3JlXCJcbmV4cG9ydHMuQm94ID1cbmNsYXNzIEJveFxuICBAY29sb3JzOiBbXCJyZWRcIiwgXCJibHVlXCIsIFwiZ3JlZW5cIiwgXCJ5ZWxsb3dcIl1cbiAgQHJhbmRvbUNvbG9yOiAtPlxuICAgIF8uc2FtcGxlIEBjb2xvcnNcbiAgQHJlbmRlckNvbG9yOiAoY29sb3IpIC0+XG4gICAgXCI8ZGl2IGNsYXNzPVxcXCJCb3ggQm94LS0je2NvbG9yfVxcPjwvZGl2PlwiXG4gIGNvbnN0cnVjdG9yOiAoQGVsZW1lbnQsIEBjb2xvcikgLT5cbiAgICBAZHJhZ2dpZSA9IG5ldyBEcmFnZ2FibGUoQGVsZW1lbnQsIHdpbmRvdy5idWNrZXRzLCB7XG4gICAgICBkcmFnZ2FiaWxpdHk6IHtjb250YWlubWVudDogXCIjc2NlbmVcIn0sXG4gICAgICBzY3JvbGw6IGZhbHNlLFxuICAgICAgb25TdGFydDogPT4gQG9uRHJhZ1N0YXJ0KCksXG4gICAgICBvbkVuZDogKHdhc0Ryb3BwZWQpID0+IEBvbkRyYWdFbmQod2FzRHJvcHBlZClcbiAgICAgIH0pXG4gIG9uRHJhZ1N0YXJ0OiAtPlxuICAgIHdpbmRvdy5kcmFnZ2VkQm94ID0gdGhpc1xuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJCb3gtLWRyYWdnaW5nXCIpXG4gICAgIyRjb252ZXlvckJlbHQuaGlkZUJveCAkZHJhZ2dlZEVsZW1lbnRcbiAgb25EcmFnRW5kOiAod2FzRHJvcHBlZCkgLT5cbiAgICBAZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiQm94LS1kcmFnZ2luZ1wiKVxuICAgIGlmIHdhc0Ryb3BwZWRcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJCb3gtLSN7QGNvbG9yfVwiKVxuICAgICAgQGNvbG9yID0gQm94LnJhbmRvbUNvbG9yKClcbiAgICAgIEBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJCb3gtLSN7QGNvbG9yfVwiKVxuIiwie1N0YXRpb259ID0gcmVxdWlyZSBcIi4vc3RhdGlvblwiXG5leHBvcnRzLkJ1Y2tldCA9XG5jbGFzcyBCdWNrZXRcbiAgY29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuICAgIHtAY29udGFpbmVyLCBAY29sb3IsIEB0b3RhbFZhbHVlLCBAcmVxdWlyZWRBbW91bnR9ID0gb3B0aW9uc1xuICAgIEByZXF1aXJlZEFtb3VudCB8fD0gMTJcbiAgICBAdG90YWxWYWx1ZSB8fD0gMC4xXG4gICAgQGVsZW1lbnQgPSBAY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuQnVja2V0X19Ecm9wWm9uZVwiKVxuICAgIEB0YWxseUVsZW1lbnQgPSBAY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuQnVja2V0X19UYWxseVwiKVxuICAgIEBkcmFnZ2llID0gbmV3IERyb3BwYWJsZShAZWxlbWVudCwge1xuICAgICAgb25Ecm9wOiAoaW5zdGFuY2UsIGRyYWdnYWJsZUVsZSkgPT5cbiAgICAgICAgQG9uRHJvcCgpXG4gICAgICB9KVxuICBjdXJyZW50VGFsbHk6IDBcbiAgb246ICh0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZT1mYWxzZSkgLT5cbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKVxuICByZWdpc3RlckhhbmRsZXJzOiAtPlxuICAgIEBvbihcImRyYWdlbnRlclwiLCBAb25EcmFnRW50ZXIpXG4gICAgQG9uKFwiZHJhZ2xlYXZlXCIsIEBvbkRyYWdMZWF2ZSlcbiAgb25EcmFnRW50ZXI6IChlKSAtPlxuICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJCdWNrZXQtLWRyYWdvdmVyXCIpXG4gIG9uRHJvcExlYXZlOiAoZSkgLT5cbiAgICBlLnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKFwiQnVja2V0LS1kcmFnb3ZlclwiKVxuICBvbkRyb3A6IC0+XG4gICAgIyRjb252ZXlvckJlbHQucmVtb3ZlQm94ICRkcmFnZ2VkQm94XG4gICAgaWYgd2luZG93LmRyYWdnZWRCb3guY29sb3IgPT0gQGNvbG9yXG4gICAgICBAZHJvcFN1Y2Nlc3NmdWwoKVxuICAgIGVsc2VcbiAgICAgIEBkcm9wRmFpbGVkKClcbiAgZHJvcFN1Y2Nlc3NmdWw6IC0+XG4gICAgQHRhbGx5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcC0tc3VjY2Vzc1wiKVxuICAgIEB0YWxseUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3AtLWZhaWx1cmVcIilcbiAgICBAY3VycmVudFRhbGx5KytcbiAgICBAdGFsbHlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcm9wLS1zdWNjZXNzXCIpXG4gICAgQHVwZGF0ZVRhbGx5KClcbiAgICBTdGF0aW9uLmZpcmUgXCJjb3JyZWN0Qm94XCIsIHtcbiAgICAgIGJveDogQGNvbG9yXG4gICAgfVxuXG4gIGRyb3BGYWlsZWQ6IC0+XG4gICAgQHRhbGx5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcC0tc3VjY2Vzc1wiKVxuICAgIEB0YWxseUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3AtLWZhaWx1cmVcIilcbiAgICBAY3VycmVudFRhbGx5LS1cbiAgICBAdGFsbHlFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkcm9wLS1mYWlsdXJlXCIpXG4gICAgQHVwZGF0ZVRhbGx5KClcbiAgICBTdGF0aW9uLmZpcmUgXCJ3cm9uZ0JveFwiLCB7XG4gICAgICBib3g6IEBjb2xvclxuICAgIH1cblxuICB1cGRhdGVUYWxseTogLT5cbiAgICBpZiBAaXNGdWxsKClcbiAgICAgIFN0YXRpb24uZmlyZSBcImJ1Y2tldEZpbGxlZFwiXG4gICAgICBAZW1wdHkoKVxuICAgICAgd2luZG93LnBsYXllci51cGRhdGVCYWxhbmNlIEB0b3RhbFZhbHVlXG4gICAgbmV3VGV4dCA9IFwiI3tAY3VycmVudFRhbGx5fS8je0ByZXF1aXJlZEFtb3VudH1cIlxuICAgIEB0YWxseUVsZW1lbnQuaW5uZXJIVE1MID0gbmV3VGV4dFxuICBpc0Z1bGw6IC0+XG4gICAgQGN1cnJlbnRUYWxseSA9PSBAcmVxdWlyZWRBbW91bnRcbiAgZW1wdHk6IC0+XG4gICAgQGN1cnJlbnRUYWxseSA9IDBcbiIsImV4cG9ydHMuQ29udmV5b3JCZWx0ID1cbmNsYXNzIENvbnZleW9yQmVsdFxuICBAY29sb3JzOiBbXCJyZWRcIiwgXCJibHVlXCIsIFwiZ3JlZW5cIiwgXCJ5ZWxsb3dcIl1cbiAgQHJhbmRvbUNvbG9yOiAtPlxuICAgIF8uc2FtcGxlIEBjb2xvcnNcbiAgY29uc3RydWN0b3I6IChAZWxlbWVudCkgLT5cbiAgYm94ZXM6IFtbXV1cbiAgYWRkQm94OiAoYm94KSAtPlxuICAgIEBib3hlcy5wdXNoKGJveClcbiAgbmV3Qm94OiAoY29sb3I9QHJhbmRvbUNvbG9yKSAtPlxuICAgIGFkZEJveCBCb3gucmVuZGVyQ29sb3IoY29sb3IpLCAobmV3IEJveChjb2xvcikpXG4iLCJleHBvcnRzLkl0ZW0gPVxuY2xhc3MgSXRlbVxuICBjb25zdHJ1Y3RvcjogKEBuYW1lLCBAcHJpY2UsIEBlbmVyZ3ksIEBlbGVtZW50PVwiXCIpIC0+XG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcImNsaWNrXCIsIChldnQpID0+IFN0b3JlLmJ1eSB0aGlzXG4gIEBmcm9tRWxlbWVudDogKGVsZW1lbnQpIC0+XG4gICAgbmFtZSA9IGVsZW1lbnQuZGF0YXNldC5uYW1lXG4gICAgcHJpY2UgPSBwYXJzZUZsb2F0IGVsZW1lbnQuZGF0YXNldC5wcmljZVxuICAgIGVuZXJneUdhaW4gPSBwYXJzZUZsb2F0IGVsZW1lbnQuZGF0YXNldC5lbmVyZ3lcbiAgICBuZXcgSXRlbShuYW1lLCBwcmljZSwgZW5lcmd5R2FpbiwgZWxlbWVudClcbiAgQGZyb21JZDogKGlkKSAtPlxuICAgIEBmcm9tRWxlbWVudCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCBpZFxuICBAZnJvbVNlbGVjdG9yOiAoc2VsZWN0b3IpIC0+XG4gICAgQGZyb21FbGVtZW50IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Igc2VsZWN0b3JcbiIsIk5vdGlmaWNhdGlvbkNlbnRlciA9IHt9XG5Ob3RpZmljYXRpb25DZW50ZXIuY29uZ3JhdHVsYXRlID0gaHVtYW5lLnNwYXduKHsgYWRkbkNsczogJ2h1bWFuZS1mbGF0dHktc3VjY2VzcycsIHRpbWVvdXQ6IDEwMDAgfSlcbk5vdGlmaWNhdGlvbkNlbnRlci5lcnJvciA9IGh1bWFuZS5zcGF3bih7IGFkZG5DbHM6ICdodW1hbmUtZmxhdHR5LWVycm9yJywgdGltZW91dDogMTAwMCB9KVxuTm90aWZpY2F0aW9uQ2VudGVyLmluZm8gPSBodW1hbmUuc3Bhd24oeyBhZGRuQ2xzOiAnaHVtYW5lLWZsYXR0eS1pbmZvJywgdGltZW91dDogNzUwIH0pXG5tb2R1bGUuZXhwb3J0cy5Ob3RpZmljYXRpb25DZW50ZXIgPSBOb3RpZmljYXRpb25DZW50ZXJcbiIsImV4cG9ydHMuUGxheWVyID1cbmNsYXNzIFBsYXllclxuICBjb25zdHJ1Y3RvcjogKEBmdWxsTmFtZSkgLT5cbiAgaWQ6IDBcbiAgZmlyc3ROYW1lOiAtPiBAZnVsbE5hbWUuc3BsaXQoXCIgXCIpWzBdXG4gIGxhc3ROYW1lOiAtPiBAZnVsbE5hbWUuc3BsaXQoXCIgXCIpWzFdXG4gIGVuZXJneUZpZWxkOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLlBsYXllcl9fZW5lcmd5XCIpXG4gIGJhbGFuY2VGaWVsZDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5QbGF5ZXJfX2JhbGFuY2VcIilcbiAgbmFtZUZpZWxkOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLlBsYXllcl9fbmFtZVwiKVxuICBiYWxhbmNlOiAwLjAwXG4gIGVuZXJneTogMVxuICBpc0RlYWQ6IGZhbHNlXG4gIGNhbkFmZm9yZDogKGl0ZW0pIC0+XG4gICAgQGJhbGFuY2UgPj0gaXRlbS5wcmljZVxuICB3aWxsS2lsbDogKGFtb3VudCkgLT4gKEBlbmVyZ3kgKyBhbW91bnQpIDw9IDBcbiAga2lsbDogLT5cbiAgICBAaXNEZWFkID0gdHJ1ZVxuICAgIGNsZWFySW50ZXJ2YWwgd2luZG93LmVuZXJneUludGVydmFsXG4gICAgQGVuZXJneSA9IDBcbiAgICBAcmVuZGVyRW5lcmd5KClcbiAgICBTdGF0aW9uLmZpcmUgXCJwbGF5ZXJEaWVkXCJcbiAgdXBkYXRlRW5lcmd5OiAoYW1vdW50KSAtPlxuICAgIHJldHVybiBAa2lsbCgpIGlmIEB3aWxsS2lsbCBhbW91bnRcbiAgICBmcm9tID0gQGVuZXJneVxuICAgIEBlbmVyZ3kgPSBwYXJzZUZsb2F0IChAZW5lcmd5ICsgYW1vdW50KS50b0ZpeGVkKDIpXG4gICAgU3RhdGlvbi5maXJlIFwicGxheWVyVXBkYXRlXCIsIHtcbiAgICAgIGZpZWxkOiBcImVuZXJneVwiXG4gICAgICBmcm9tOiBmcm9tXG4gICAgICB0bzogQGVuZXJneVxuICAgIH1cbiAgICBAcmVuZGVyRW5lcmd5KClcbiAgdXBkYXRlQmFsYW5jZTogKGFtb3VudCkgLT5cbiAgICBmcm9tID0gQGJhbGFuY2VcbiAgICBAYmFsYW5jZSA9IHBhcnNlRmxvYXQgKEBiYWxhbmNlICsgYW1vdW50KS50b0ZpeGVkKDIpXG4gICAgU3RhdGlvbi5maXJlIFwicGxheWVyVXBkYXRlXCIsIHtcbiAgICAgIGZpZWxkOiBcImJhbGFuY2VcIlxuICAgICAgZnJvbTogZnJvbVxuICAgICAgdG86IEBiYWxhbmNlXG4gICAgfVxuICAgIEByZW5kZXJCYWxhbmNlKClcbiAgcmVuZGVyOiAtPlxuICAgIEByZW5kZXJOYW1lKClcbiAgICBAcmVuZGVyQmFsYW5jZSgpXG4gICAgQHJlbmRlckVuZXJneSgpXG4gIHJlbmRlck5hbWU6IC0+XG4gICAgQG5hbWVGaWVsZC5pbm5lckhUTUwgPSBAZmlyc3ROYW1lKClcbiAgcmVuZGVyQmFsYW5jZTogLT5cbiAgICBAYmFsYW5jZUZpZWxkLmlubmVySFRNTCA9IFwiJCN7QGJhbGFuY2V9XCJcbiAgcmVuZGVyRW5lcmd5OiAtPlxuICAgIEBlbmVyZ3lGaWVsZC5pbm5lckhUTUwgPSBcIiN7QGVuZXJneSAqIDEwMH0lXCJcbiIsIiMgdXRpbC5sb2dfcmVxdWVzdCA9IHJlcXVpcmUgXCIuLy4uL2hlbHBlcnMvbG9nX3JlcXVlc3RcIlxuZXhwb3J0cy5TdGF0aW9uID1cbmNsYXNzIFN0YXRpb25cbiAgQGZpcmU6IChuYW1lLCBkZXRhaWxzKSAtPlxuICAgIHN3aXRjaCBuYW1lXG4gICAgICB3aGVuIFwibmV3UGxheWVyXCIgdGhlbiBAb25OZXdQbGF5ZXIoKVxuICAgICAgd2hlbiBcInBsYXllclVwZGF0ZVwiIHRoZW4gQG9uUGxheWVyVXBkYXRlIGRldGFpbHNcbiAgICAgIHdoZW4gXCJjb3JyZWN0Qm94XCIgdGhlbiBAb25Db3JyZWN0Qm94IGRldGFpbHNcbiAgICAgIHdoZW4gXCJ3cm9uZ0JveFwiIHRoZW4gQG9uV3JvbmdCb3ggZGV0YWlsc1xuICAgICAgd2hlbiBcImdldFBsYXllclwiIHRoZW4gQG9uR2V0UGxheWVyIGRldGFpbHNcbiAgICAgIHdoZW4gXCJ0b29rQnJlYWtcIiB0aGVuIEBvblRvb2tCcmVhaygpXG4gICAgICB3aGVuIFwic3VjY2Vzc2Z1bFB1cmNoYXNlXCIgdGhlbiBAb25TdWNjZXNzZnVsUHVyY2hhc2UgZGV0YWlsc1xuICAgICAgd2hlbiBcImZhaWxlZFB1cmNoYXNlXCIgdGhlbiBAb25GYWlsZWRQdXJjaGFzZSBkZXRhaWxzXG4gICAgICB3aGVuIFwiYnVja2V0RmlsbGVkXCIgdGhlbiBAb25CdWNrZXRGaWxsZWQoKVxuICAgICAgd2hlbiBcInZpc2liaWxpdHlDaGFuZ2VcIiB0aGVuIEBvblZpc2liaWxpdHlDaGFuZ2UgZGV0YWlsc1xuICAgICAgd2hlbiBcInBsYXllckRpZWRcIiB0aGVuIEBvblBsYXllckRlYXRoKClcbiAgICAgIGVsc2UgY29uc29sZS5lcnJvcihcIlVOS05PV04gRVZFTlQ6ICgje25hbWV9KVwiKVxuICBAb25OZXdQbGF5ZXI6IChkZXRhaWxzKSAtPlxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcIm5ld1BsYXllclwiLCB3aW5kb3cucGxheWVyXG4gIEBvblBsYXllclVwZGF0ZTogKGRldGFpbHMpIC0+XG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwidXBkYXRlXCIsIHtwbGF5ZXI6IHdpbmRvdy5wbGF5ZXJ9XG4gIEBvblN1Y2Nlc3NmdWxQdXJjaGFzZTogKGRldGFpbHMpIC0+XG4gICAgTm90aWZpY2F0aW9uQ2VudGVyLmNvbmdyYXR1bGF0ZSBcIllvdSBoYXZlIGJvdWdodCAje2RldGFpbHMubmFtZX0gZm9yICQje2RldGFpbHMucHJpY2UudG9GaXhlZCgyKX1cIlxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcInB1cmNoYXNlXCIsIHtcbiAgICAgIHRyYW5zYWN0aW9uOiB7XG4gICAgICAgIG5hbWU6IGRldGFpbHMubmFtZVxuICAgICAgICBwcmljZTogZGV0YWlscy5wcmljZVxuICAgICAgfVxuICAgIH1cbiAgQG9uRmFpbGVkUHVyY2hhc2U6IChkZXRhaWxzKSAtPlxuICAgIE5vdGlmaWNhdGlvbkNlbnRlci5lcnJvciBcIllvdSBkbyBub3QgaGF2ZSBlbm91Z2ggbW9uZXkuIFdvcmsgSGFyZGVyIVwiXG4gIEBvbkJ1Y2tldEZpbGxlZDogLT5cbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJidWNrZXRGaWxsZWRcIlxuICBAb25HZXRQbGF5ZXI6IChkZXRhaWxzKSAtPlxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcImdldFBsYXllclwiLCB7XG4gICAgICBpZDogZGV0YWlscy5pZFxuICAgIH1cbiAgQG9uVG9va0JyZWFrID0gLT5cbiAgICBjbGVhckludGVydmFsIHdpbmRvdy5lbmVyZ3lJbnRlcnZhbFxuICAgIHdpbmRvdy5nYW1lT3ZlcihcIk5vIEJyZWFrc1wiLCBcIkJlY2F1c2UgeW91IHRvb2sgYSBicmVhayB5b3Ugd2VyZSBmaXJlZCBmcm9tIHlvdXIgam9iIGFuZCB3aXRob3V0IGEgc291cmNlIG9mIGluY29tZTogeW91IGRpZWQuXCIpXG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwiYnJlYWtcIlxuICBAb25QbGF5ZXJEZWF0aDogLT5cbiAgICB3aW5kb3cuZ2FtZU92ZXIoXCJZb3UgRGllZFwiLCBcIllvdSBoYWQgbm8gZW5lcmd5IGxlZnQgYW5kIGxpdGVyYWxseSBmZWxsIG92ZXIgb24gdGhlIGpvYi4gWW91ciBtYW5hZ2VyIGRpZG4ndCBldmVuIG5vdGljZS5cIilcbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJkZWF0aFwiXG4gIEBvbkNvcnJlY3RCb3g6IChkZXRhaWxzKSAtPlxuICAgIGJ1Y2tldHMgPSB3aW5kb3cuYnVja2V0TGlzdC5tYXAgKGJ1Y2tldCkgLT5cbiAgICAgIHtcbiAgICAgICAgY29sb3I6IGJ1Y2tldC5jb2xvcixcbiAgICAgICAgY3VycmVudFRhbGx5OiBidWNrZXQuY3VycmVudFRhbGx5LFxuICAgICAgICByZXF1aXJlZEFtb3VudDogYnVja2V0LnJlcXVpcmVkQW1vdW50LFxuICAgICAgICB0b3RhbFZhbHVlOiBidWNrZXQudG90YWxWYWx1ZVxuICAgICAgfVxuXG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwiY29ycmVjdGJveFwiLCB7XG4gICAgICBib3g6IGRldGFpbHMuYm94XG4gICAgICBidWNrZXRzOiBidWNrZXRzXG4gICAgfVxuICBAb25Xcm9uZ0JveDogKGRldGFpbHMpIC0+XG4gICAgYnVja2V0cyA9IHdpbmRvdy5idWNrZXRMaXN0Lm1hcCAoYnVja2V0KSAtPlxuICAgICAge1xuICAgICAgICBjb2xvcjogYnVja2V0LmNvbG9yLFxuICAgICAgICBjdXJyZW50VGFsbHk6IGJ1Y2tldC5jdXJyZW50VGFsbHksXG4gICAgICAgIHJlcXVpcmVkQW1vdW50OiBidWNrZXQucmVxdWlyZWRBbW91bnQsXG4gICAgICAgIHRvdGFsVmFsdWU6IGJ1Y2tldC50b3RhbFZhbHVlXG4gICAgICB9XG5cbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJ3cm9uZ2JveFwiLCB7XG4gICAgICBib3g6IGRldGFpbHMuYm94XG4gICAgICBidWNrZXRzOiBidWNrZXRzXG4gICAgfVxuICBAb25WaXNpYmlsaXR5Q2hhbmdlOiAoZGV0YWlscykgLT5cbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJ2aXNpYmlsaXR5Q2hhbmdlXCIsIHtcbiAgICAgIGZyb21TdGF0ZTogZGV0YWlscy5mcm9tU3RhdGVcbiAgICAgIHRvU3RhdGU6IGRldGFpbHMudG9TdGF0ZVxuICAgIH1cbiIsIntUcmFuc2FjdGlvbn0gPSByZXF1aXJlIFwiLi90cmFuc2FjdGlvblwiXG57U3RhdGlvbn0gPSByZXF1aXJlIFwiLi9zdGF0aW9uXCJcbmV4cG9ydHMuU3RvcmUgPVxuY2xhc3MgU3RvcmVcbiAgQGl0ZW1zOiBbXVxuICBAYWRkSXRlbTogKGl0ZW0pIC0+XG4gICAgQGl0ZW1zLnB1c2ggaXRlbVxuICBAYnV5OiAoaXRlbSkgLT5cbiAgICB0cmFuc2FjdGlvbiA9IG5ldyBUcmFuc2FjdGlvbiBpdGVtXG4gICAgaWYgd2luZG93LnBsYXllci5jYW5BZmZvcmQodHJhbnNhY3Rpb24pIGFuZCB0cmFuc2FjdGlvbi5uYW1lIGlzbnQgXCJhIGJyZWFrXCJcbiAgICAgIHRyYW5zYWN0aW9uLmlzU3VjY2VzcyA9IHRydWVcbiAgICAgIHRyYW5zYWN0aW9uLmFwcGx5KClcbiAgICBlbHNlIGlmIHRyYW5zYWN0aW9uLm5hbWUgaXMgXCJhIGJyZWFrXCJcbiAgICAgIFN0YXRpb24uZmlyZSBcInRvb2tCcmVha1wiXG4gICAgICB0cmFuc2FjdGlvbi5pc1N1Y2Nlc3MgPSB0cnVlXG4gICAgZWxzZVxuICAgICAgdHJhbnNhY3Rpb24uaXNTdWNjZXNzID0gZmFsc2VcbiAgICBTdGF0aW9uLmZpcmUgXCIje3RyYW5zYWN0aW9uLnN0YXRlKCl9UHVyY2hhc2VcIiwgdHJhbnNhY3Rpb25cbiIsImV4cG9ydHMuVHJhbnNhY3Rpb24gPVxuY2xhc3MgVHJhbnNhY3Rpb25cbiAgY29uc3RydWN0b3I6IChAaXRlbSkgLT5cbiAgICBAcHJpY2UgPSBAaXRlbS5wcmljZVxuICAgIEBuYW1lID0gQGl0ZW0ubmFtZVxuICBhcHBseTogLT5cbiAgICBAdGltZSA9IERhdGUubm93KClcbiAgICB3aW5kb3cucGxheWVyLnVwZGF0ZUVuZXJneSBAaXRlbS5lbmVyZ3lcbiAgICB3aW5kb3cucGxheWVyLnVwZGF0ZUJhbGFuY2UgKC0xKkBwcmljZSlcbiAgc3RhdGU6IC0+XG4gICAgaWYgQGlzU3VjY2VzcyB0aGVuIFwic3VjY2Vzc2Z1bFwiIGVsc2UgXCJmYWlsZWRcIlxuIiwiLy8gICAgIFVuZGVyc2NvcmUuanMgMS43LjBcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGV4cG9ydHNgIG9uIHRoZSBzZXJ2ZXIuXG4gIHZhciByb290ID0gdGhpcztcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyXG4gICAgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICBjb25jYXQgICAgICAgICAgID0gQXJyYXlQcm90by5jb25jYXQsXG4gICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQ7XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0LlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjcuMCc7XG5cbiAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVmZmljaWVudCAoZm9yIGN1cnJlbnQgZW5naW5lcykgdmVyc2lvblxuICAvLyBvZiB0aGUgcGFzc2VkLWluIGNhbGxiYWNrLCB0byBiZSByZXBlYXRlZGx5IGFwcGxpZWQgaW4gb3RoZXIgVW5kZXJzY29yZVxuICAvLyBmdW5jdGlvbnMuXG4gIHZhciBjcmVhdGVDYWxsYmFjayA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkgcmV0dXJuIGZ1bmM7XG4gICAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgb3RoZXIpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEEgbW9zdGx5LWludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGNhbGxiYWNrcyB0aGF0IGNhbiBiZSBhcHBsaWVkXG4gIC8vIHRvIGVhY2ggZWxlbWVudCBpbiBhIGNvbGxlY3Rpb24sIHJldHVybmluZyB0aGUgZGVzaXJlZCByZXN1bHQg4oCUIGVpdGhlclxuICAvLyBpZGVudGl0eSwgYW4gYXJiaXRyYXJ5IGNhbGxiYWNrLCBhIHByb3BlcnR5IG1hdGNoZXIsIG9yIGEgcHJvcGVydHkgYWNjZXNzb3IuXG4gIF8uaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBjcmVhdGVDYWxsYmFjayh2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpO1xuICAgIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkgcmV0dXJuIF8ubWF0Y2hlcyh2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgcmF3IG9iamVjdHMgaW4gYWRkaXRpb24gdG8gYXJyYXktbGlrZXMuIFRyZWF0cyBhbGxcbiAgLy8gc3BhcnNlIGFycmF5LWxpa2VzIGFzIGlmIHRoZXkgd2VyZSBkZW5zZS5cbiAgXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgaSwgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoID09PSArbGVuZ3RoKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2ldLCBpLCBvYmopO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIHJlc3VsdHMgPSBBcnJheShsZW5ndGgpLFxuICAgICAgICBjdXJyZW50S2V5O1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIHJlc3VsdHNbaW5kZXhdID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICB2YXIgcmVkdWNlRXJyb3IgPSAnUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZSc7XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQsIDQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IDAsIGN1cnJlbnRLZXk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICBpZiAoIWxlbmd0aCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgICBtZW1vID0gb2JqW2tleXMgPyBrZXlzW2luZGV4KytdIDogaW5kZXgrK107XG4gICAgfVxuICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgbWVtbyA9IGl0ZXJhdGVlKG1lbW8sIG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArIG9iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGluZGV4ID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIGN1cnJlbnRLZXk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICBpZiAoIWluZGV4KSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbLS1pbmRleF0gOiAtLWluZGV4XTtcbiAgICB9XG4gICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIF8uc29tZShvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGxpc3QpKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubmVnYXRlKF8uaXRlcmF0ZWUocHJlZGljYXRlKSksIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBpbmRleCwgY3VycmVudEtleTtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmICghcHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIGN1cnJlbnRLZXk7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIHZhbHVlICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCB0YXJnZXQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgcmV0dXJuIF8uaW5kZXhPZihvYmosIHRhcmdldCkgPj0gMDtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSBmdW5jdGlvbihvYmosIG1ldGhvZCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIChpc0Z1bmMgPyBtZXRob2QgOiB2YWx1ZVttZXRob2RdKS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gb2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGggPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgaWYgKHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPCByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHNldCA9IG9iaiAmJiBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IHNldC5sZW5ndGg7XG4gICAgdmFyIHNodWZmbGVkID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDAsIHJhbmQ7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByYW5kID0gXy5yYW5kb20oMCwgaW5kZXgpO1xuICAgICAgaWYgKHJhbmQgIT09IGluZGV4KSBzaHVmZmxlZFtpbmRleF0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gc2V0W2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdGVlLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgY3JpdGVyaWE6IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldLnB1c2godmFsdWUpOyBlbHNlIHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0ZWUob2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IGxvdyArIGhpZ2ggPj4+IDE7XG4gICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgcmV0dXJuIF8ubWFwKG9iaiwgXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuICBfLnNpemUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAwO1xuICAgIHJldHVybiBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBjb2xsZWN0aW9uIGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIHBhc3MgPSBbXSwgZmFpbCA9IFtdO1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikge1xuICAgICAgKHByZWRpY2F0ZSh2YWx1ZSwga2V5LCBvYmopID8gcGFzcyA6IGZhaWwpLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBbcGFzcywgZmFpbF07XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVswXTtcbiAgICBpZiAobiA8IDApIHJldHVybiBbXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aFxuICAvLyBgXy5tYXBgLlxuICBfLmluaXRpYWwgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gKG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKSkpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgTWF0aC5tYXgoYXJyYXkubGVuZ3RoIC0gbiwgMCkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqXG4gIC8vIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KSB7XG4gICAgaWYgKHNoYWxsb3cgJiYgXy5ldmVyeShpbnB1dCwgXy5pc0FycmF5KSkge1xuICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShvdXRwdXQsIGlucHV0KTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGlucHV0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpbnB1dFtpXTtcbiAgICAgIGlmICghXy5pc0FycmF5KHZhbHVlKSAmJiAhXy5pc0FyZ3VtZW50cyh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKCFzdHJpY3QpIG91dHB1dC5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2hhbGxvdykge1xuICAgICAgICBwdXNoLmFwcGx5KG91dHB1dCwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgc3RyaWN0LCBvdXRwdXQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgZmFsc2UsIFtdKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoZSBhcnJheSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNwZWNpZmllZCB2YWx1ZShzKS5cbiAgXy53aXRob3V0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4gIC8vIGJlZW4gc29ydGVkLCB5b3UgaGF2ZSB0aGUgb3B0aW9uIG9mIHVzaW5nIGEgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiBbXTtcbiAgICBpZiAoIV8uaXNCb29sZWFuKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdGVlO1xuICAgICAgaXRlcmF0ZWUgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChpdGVyYXRlZSAhPSBudWxsKSBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaV07XG4gICAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgICAgaWYgKCFpIHx8IHNlZW4gIT09IHZhbHVlKSByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHNlZW4gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGksIGFycmF5KTtcbiAgICAgICAgaWYgKF8uaW5kZXhPZihzZWVuLCBjb21wdXRlZCkgPCAwKSB7XG4gICAgICAgICAgc2Vlbi5wdXNoKGNvbXB1dGVkKTtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXy5pbmRleE9mKHJlc3VsdCwgdmFsdWUpIDwgMCkge1xuICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pcShmbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSwgdHJ1ZSwgW10pKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4gIC8vIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYXJnc0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgaWYgKF8uY29udGFpbnMocmVzdWx0LCBpdGVtKSkgY29udGludWU7XG4gICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGFyZ3NMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoYXJndW1lbnRzW2pdLCBpdGVtKSkgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaiA9PT0gYXJnc0xlbmd0aCkgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gZmxhdHRlbihzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIHRydWUsIHRydWUsIFtdKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gW107XG4gICAgdmFyIGxlbmd0aCA9IF8ubWF4KGFyZ3VtZW50cywgJ2xlbmd0aCcpLmxlbmd0aDtcbiAgICB2YXIgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJndW1lbnRzLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydHMgbGlzdHMgaW50byBvYmplY3RzLiBQYXNzIGVpdGhlciBhIHNpbmdsZSBhcnJheSBvZiBgW2tleSwgdmFsdWVdYFxuICAvLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2ZcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIGlmIChsaXN0ID09IG51bGwpIHJldHVybiB7fTtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgaXNTb3J0ZWQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgaWYgKHR5cGVvZiBpc1NvcnRlZCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpID0gaXNTb3J0ZWQgPCAwID8gTWF0aC5tYXgoMCwgbGVuZ3RoICsgaXNTb3J0ZWQpIDogaXNTb3J0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gXy5zb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpXSA9PT0gaXRlbSA/IGkgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgXy5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBmcm9tKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaWR4ID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgZnJvbSA9PSAnbnVtYmVyJykge1xuICAgICAgaWR4ID0gZnJvbSA8IDAgPyBpZHggKyBmcm9tICsgMSA6IE1hdGgubWluKGlkeCwgZnJvbSArIDEpO1xuICAgIH1cbiAgICB3aGlsZSAoLS1pZHggPj0gMCkgaWYgKGFycmF5W2lkeF0gPT09IGl0ZW0pIHJldHVybiBpZHg7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBzdGVwIHx8IDE7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciByYW5nZSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7IGlkeCsrLCBzdGFydCArPSBzdGVwKSB7XG4gICAgICByYW5nZVtpZHhdID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV1c2FibGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHByb3RvdHlwZSBzZXR0aW5nLlxuICB2YXIgQ3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncywgYm91bmQ7XG4gICAgaWYgKG5hdGl2ZUJpbmQgJiYgZnVuYy5iaW5kID09PSBuYXRpdmVCaW5kKSByZXR1cm4gbmF0aXZlQmluZC5hcHBseShmdW5jLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdCaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb24nKTtcbiAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgYm91bmQpKSByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIEN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgc2VsZiA9IG5ldyBDdG9yO1xuICAgICAgQ3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkoc2VsZiwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICBpZiAoXy5pc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gMDtcbiAgICAgIHZhciBhcmdzID0gYm91bmRBcmdzLnNsaWNlKCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJncy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJnc1tpXSA9PT0gXykgYXJnc1tpXSA9IGFyZ3VtZW50c1twb3NpdGlvbisrXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGksIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsIGtleTtcbiAgICBpZiAobGVuZ3RoIDw9IDEpIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0gYXJndW1lbnRzW2ldO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBjYWNoZSA9IG1lbW9pemUuY2FjaGU7XG4gICAgICB2YXIgYWRkcmVzcyA9IGhhc2hlciA/IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5O1xuICAgICAgaWYgKCFfLmhhcyhjYWNoZSwgYWRkcmVzcykpIGNhY2hlW2FkZHJlc3NdID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNhY2hlW2FkZHJlc3NdO1xuICAgIH07XG4gICAgbWVtb2l6ZS5jYWNoZSA9IHt9O1xuICAgIHJldHVybiBtZW1vaXplO1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9LCB3YWl0KTtcbiAgfTtcblxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcbiAgLy8gY2xlYXJlZC5cbiAgXy5kZWZlciA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICByZXR1cm4gXy5kZWxheS5hcHBseShfLCBbZnVuYywgMV0uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciB0aW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IF8ubm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xuXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdCA9IF8ubm93KCkgLSB0aW1lc3RhbXA7XG5cbiAgICAgIGlmIChsYXN0IDwgd2FpdCAmJiBsYXN0ID4gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBuZWdhdGVkIHZlcnNpb24gb2YgdGhlIHBhc3NlZC1pbiBwcmVkaWNhdGUuXG4gIF8ubmVnYXRlID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBzdGFydCA9IGFyZ3MubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IHN0YXJ0O1xuICAgICAgdmFyIHJlc3VsdCA9IGFyZ3Nbc3RhcnRdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoaS0tKSByZXN1bHQgPSBhcmdzW2ldLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgYWZ0ZXIgYmVpbmcgY2FsbGVkIE4gdGltZXMuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5iZWZvcmUgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHZhciBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzID4gMCkge1xuICAgICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVuYyA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBfLnBhcnRpYWwoXy5iZWZvcmUsIDIpO1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgXG4gIF8ua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgaWYgKG5hdGl2ZUtleXMpIHJldHVybiBuYXRpdmVLZXlzKG9iaik7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzW2ldID0gb2JqW2tleXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHBhaXJzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgdmFyIHNvdXJjZSwgcHJvcDtcbiAgICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwgcHJvcCkpIHtcbiAgICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30sIGtleTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgICBpZiAoaXRlcmF0ZWUodmFsdWUsIGtleSwgb2JqKSkgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoW10sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICBvYmogPSBuZXcgT2JqZWN0KG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICBpZiAoa2V5IGluIG9iaikgcmVzdWx0W2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ub21pdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGl0ZXJhdGVlKSkge1xuICAgICAgaXRlcmF0ZWUgPSBfLm5lZ2F0ZShpdGVyYXRlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5tYXAoY29uY2F0LmFwcGx5KFtdLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChvYmpbcHJvcF0gPT09IHZvaWQgMCkgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIChzaGFsbG93LWNsb25lZCkgZHVwbGljYXRlIG9mIGFuIG9iamVjdC5cbiAgXy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiBfLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogXy5leHRlbmQoe30sIG9iaik7XG4gIH07XG5cbiAgLy8gSW52b2tlcyBpbnRlcmNlcHRvciB3aXRoIHRoZSBvYmosIGFuZCB0aGVuIHJldHVybnMgb2JqLlxuICAvLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXG4gIF8udGFwID0gZnVuY3Rpb24ob2JqLCBpbnRlcmNlcHRvcikge1xuICAgIGludGVyY2VwdG9yKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTlxuICAgICAgICBpZiAoK2EgIT09ICthKSByZXR1cm4gK2IgIT09ICtiO1xuICAgICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gK2EgPT09IDAgPyAxIC8gK2EgPT09IDEgLyBiIDogK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09PSArYjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYjtcbiAgICB9XG4gICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzXG4gICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgaWYgKFxuICAgICAgYUN0b3IgIT09IGJDdG9yICYmXG4gICAgICAvLyBIYW5kbGUgT2JqZWN0LmNyZWF0ZSh4KSBjYXNlc1xuICAgICAgJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYiAmJlxuICAgICAgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIGFDdG9yIGluc3RhbmNlb2YgYUN0b3IgJiZcbiAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiBiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG4gICAgdmFyIHNpemUsIHJlc3VsdDtcbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoY2xhc3NOYW1lID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIHNpemUgPSBhLmxlbmd0aDtcbiAgICAgIHJlc3VsdCA9IHNpemUgPT09IGIubGVuZ3RoO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gZXEoYVtzaXplXSwgYltzaXplXSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhhKSwga2V5O1xuICAgICAgc2l6ZSA9IGtleXMubGVuZ3RoO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMgYmVmb3JlIGNvbXBhcmluZyBkZWVwIGVxdWFsaXR5LlxuICAgICAgcmVzdWx0ID0gXy5rZXlzKGIpLmxlbmd0aCA9PT0gc2l6ZTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlclxuICAgICAgICAgIGtleSA9IGtleXNbc2l6ZV07XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIsIFtdLCBbXSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiBhcnJheSwgc3RyaW5nLCBvciBvYmplY3QgZW1wdHk/XG4gIC8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNTdHJpbmcob2JqKSB8fCBfLmlzQXJndW1lbnRzKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cC5cbiAgXy5lYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIF9bJ2lzJyArIG5hbWVdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgbmFtZSArICddJztcbiAgICB9O1xuICB9KTtcblxuICAvLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFKSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5oYXMob2JqLCAnY2FsbGVlJyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS4gV29yayBhcm91bmQgYW4gSUUgMTEgYnVnLlxuICBpZiAodHlwZW9mIC8uLyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT09ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdGVlcy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIF8uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ubm9vcCA9IGZ1bmN0aW9uKCl7fTtcblxuICBfLnByb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIHZhciBwYWlycyA9IF8ucGFpcnMoYXR0cnMpLCBsZW5ndGggPSBwYWlycy5sZW5ndGg7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gIWxlbmd0aDtcbiAgICAgIG9iaiA9IG5ldyBPYmplY3Qob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBhaXIgPSBwYWlyc1tpXSwga2V5ID0gcGFpclswXTtcbiAgICAgICAgaWYgKHBhaXJbMV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRlZShpKTtcbiAgICByZXR1cm4gYWNjdW07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gIH07XG5cbiAgLy8gQSAocG9zc2libHkgZmFzdGVyKSB3YXkgdG8gZ2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcCBhcyBhbiBpbnRlZ2VyLlxuICBfLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfTtcblxuICAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVzY2FwZU1hcCA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmI3gyNzsnLFxuICAgICdgJzogJyYjeDYwOydcbiAgfTtcbiAgdmFyIHVuZXNjYXBlTWFwID0gXy5pbnZlcnQoZXNjYXBlTWFwKTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIHZhciBjcmVhdGVFc2NhcGVyID0gZnVuY3Rpb24obWFwKSB7XG4gICAgdmFyIGVzY2FwZXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgcmV0dXJuIG1hcFttYXRjaF07XG4gICAgfTtcbiAgICAvLyBSZWdleGVzIGZvciBpZGVudGlmeWluZyBhIGtleSB0aGF0IG5lZWRzIHRvIGJlIGVzY2FwZWRcbiAgICB2YXIgc291cmNlID0gJyg/OicgKyBfLmtleXMobWFwKS5qb2luKCd8JykgKyAnKSc7XG4gICAgdmFyIHRlc3RSZWdleHAgPSBSZWdFeHAoc291cmNlKTtcbiAgICB2YXIgcmVwbGFjZVJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UsICdnJyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgc3RyaW5nID0gc3RyaW5nID09IG51bGwgPyAnJyA6ICcnICsgc3RyaW5nO1xuICAgICAgcmV0dXJuIHRlc3RSZWdleHAudGVzdChzdHJpbmcpID8gc3RyaW5nLnJlcGxhY2UocmVwbGFjZVJlZ2V4cCwgZXNjYXBlcikgOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbiAgXy5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKGVzY2FwZU1hcCk7XG4gIF8udW5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKHVuZXNjYXBlTWFwKTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIGBwcm9wZXJ0eWAgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdCB3aXRoIHRoZVxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyBvYmplY3RbcHJvcGVydHldKCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIHZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07XG4gIH07XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgLy8gTkI6IGBvbGRTZXR0aW5nc2Agb25seSBleGlzdHMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgc2V0dGluZ3MsIG9sZFNldHRpbmdzKSB7XG4gICAgaWYgKCFzZXR0aW5ncyAmJiBvbGRTZXR0aW5ncykgc2V0dGluZ3MgPSBvbGRTZXR0aW5ncztcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UoZXNjYXBlciwgZXNjYXBlQ2hhcik7XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRvYmUgVk1zIG5lZWQgdGhlIG1hdGNoIHJldHVybmVkIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3Qgb2ZmZXN0LlxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcblxuICAgIHRyeSB7XG4gICAgICB2YXIgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHZhciBhcmd1bWVudCA9IHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonO1xuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgYXJndW1lbnQgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbi4gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGluc3RhbmNlID0gXyhvYmopO1xuICAgIGluc3RhbmNlLl9jaGFpbiA9IHRydWU7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBfLmVhY2goXy5mdW5jdGlvbnMob2JqKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XG4gICAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChuYW1lID09PSAnc2hpZnQnIHx8IG5hbWUgPT09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgXy5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgfTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCd1bmRlcnNjb3JlJywgW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cbn0uY2FsbCh0aGlzKSk7XG4iXX0=
