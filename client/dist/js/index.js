(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Box, Bucket, ConveyorBelt, Item, Player, Transaction, addPlayers, blueBucket, breakItem, foodItem, greenBucket, onPlayerDeath, redBucket, removePlayers, setupBlueBox, setupGreenBox, setupRedBox, setupYellowBox, updatePlayerCount, userName, waterItem, yellowBucket, _, _ref, _ref1;

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


function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") {
        return;
    }

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=");
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) {
            parms[n] = [];
        }

        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}
;

window.socket = io();

window.boxes = [];

window.energyInterval = setInterval((function() {
  return window.player.updateEnergy(-0.013);
}), 750);

userName = (_ref = (_ref1 = parseURLParams(document.location.search)) != null ? _ref1.name[0] : void 0) != null ? _ref : prompt("What is your first and last name?");

window.player = new Player(userName);

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
  var addPlayer, player, _i, _len, _ref2;
  addPlayer = function(player) {
    NotificationCenter.info("" + player.fullName + " has joined. Work Harder!");
    if (Modernizr.sessionstorage) {
      return sessionStorage.setItem(player.id, player.fullName);
    }
  };
  _ref2 = data.players;
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    player = _ref2[_i];
    addPlayer(player);
  }
  return updatePlayerCount(data);
});

window.socket.on("removePlayers", removePlayers = function(data) {
  var player, removePlayer, _i, _len, _ref2;
  removePlayer = function(player) {
    if (Modernizr.sessionstorage) {
      return sessionStorage.removeItem(player.id);
    }
  };
  _ref2 = data.players;
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    player = _ref2[_i];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9QRFVDS1MvQ29kZS9JZ25hdGl1cy9SZWxpZ2lvbi9zd2VhdF9zaG9wcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL1BEVUNLUy9Db2RlL0lnbmF0aXVzL1JlbGlnaW9uL3N3ZWF0X3Nob3BzL2NsaWVudC9zcmMvY29mZmVlL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvQ29kZS9JZ25hdGl1cy9SZWxpZ2lvbi9zd2VhdF9zaG9wcy9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvYm94LmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvQ29kZS9JZ25hdGl1cy9SZWxpZ2lvbi9zd2VhdF9zaG9wcy9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvYnVja2V0LmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvQ29kZS9JZ25hdGl1cy9SZWxpZ2lvbi9zd2VhdF9zaG9wcy9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvY29udmV5b3JfYmVsdC5jb2ZmZWUiLCIvVXNlcnMvUERVQ0tTL0NvZGUvSWduYXRpdXMvUmVsaWdpb24vc3dlYXRfc2hvcHMvY2xpZW50L3NyYy9jb2ZmZWUvbW9kZWxzL2l0ZW0uY29mZmVlIiwiL1VzZXJzL1BEVUNLUy9Db2RlL0lnbmF0aXVzL1JlbGlnaW9uL3N3ZWF0X3Nob3BzL2NsaWVudC9zcmMvY29mZmVlL21vZGVscy9ub3RpZmljYXRpb25fY2VudGVyLmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvQ29kZS9JZ25hdGl1cy9SZWxpZ2lvbi9zd2VhdF9zaG9wcy9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvcGxheWVyLmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvQ29kZS9JZ25hdGl1cy9SZWxpZ2lvbi9zd2VhdF9zaG9wcy9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvc3RhdGlvbi5jb2ZmZWUiLCIvVXNlcnMvUERVQ0tTL0NvZGUvSWduYXRpdXMvUmVsaWdpb24vc3dlYXRfc2hvcHMvY2xpZW50L3NyYy9jb2ZmZWUvbW9kZWxzL3N0b3JlLmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvQ29kZS9JZ25hdGl1cy9SZWxpZ2lvbi9zd2VhdF9zaG9wcy9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvdHJhbnNhY3Rpb24uY29mZmVlIiwiL1VzZXJzL1BEVUNLUy9Db2RlL0lnbmF0aXVzL1JlbGlnaW9uL3N3ZWF0X3Nob3BzL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLHVSQUFBOztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQUFKLENBQUE7O0FBQUEsTUFDUSxPQUFBLENBQVEsY0FBUixFQUFQLEdBREQsQ0FBQTs7QUFBQSxTQUVXLE9BQUEsQ0FBUSxpQkFBUixFQUFWLE1BRkQsQ0FBQTs7QUFBQSxlQUdpQixPQUFBLENBQVEsd0JBQVIsRUFBaEIsWUFIRCxDQUFBOztBQUFBLE9BSVMsT0FBQSxDQUFRLGVBQVIsRUFBUixJQUpELENBQUE7O0FBQUEsU0FLVyxPQUFBLENBQVEsaUJBQVIsRUFBVixNQUxELENBQUE7O0FBQUEsTUFNTSxDQUFDLE9BQVAsR0FBaUIsT0FBQSxDQUFRLGtCQUFSLENBQTJCLENBQUMsT0FON0MsQ0FBQTs7QUFBQSxNQU9NLENBQUMsS0FBUCxHQUFlLE9BQUEsQ0FBUSxnQkFBUixDQUF5QixDQUFDLEtBUHpDLENBQUE7O0FBQUEsY0FRZ0IsT0FBQSxDQUFRLHNCQUFSLEVBQWYsV0FSRCxDQUFBOztBQUFBLE1BU00sQ0FBQyxrQkFBUCxHQUE0QixPQUFBLENBQVEsOEJBQVIsQ0FBdUMsQ0FBQyxrQkFUcEUsQ0FBQTs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLENBQUE7O0FBQUEsTUFzQ00sQ0FBQyxNQUFQLEdBQWdCLEVBQUEsQ0FBQSxDQXRDaEIsQ0FBQTs7QUFBQSxNQXVDTSxDQUFDLEtBQVAsR0FBZSxFQXZDZixDQUFB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXyA9IHJlcXVpcmUgXCJ1bmRlcnNjb3JlXCJcbntCb3h9ID0gcmVxdWlyZSBcIi4vbW9kZWxzL2JveFwiXG57QnVja2V0fSA9IHJlcXVpcmUgXCIuL21vZGVscy9idWNrZXRcIlxue0NvbnZleW9yQmVsdH0gPSByZXF1aXJlIFwiLi9tb2RlbHMvY29udmV5b3JfYmVsdFwiXG57SXRlbX0gPSByZXF1aXJlIFwiLi9tb2RlbHMvaXRlbVwiXG57UGxheWVyfSA9IHJlcXVpcmUgXCIuL21vZGVscy9wbGF5ZXJcIlxud2luZG93LlN0YXRpb24gPSByZXF1aXJlKFwiLi9tb2RlbHMvc3RhdGlvblwiKS5TdGF0aW9uXG53aW5kb3cuU3RvcmUgPSByZXF1aXJlKFwiLi9tb2RlbHMvc3RvcmVcIikuU3RvcmVcbntUcmFuc2FjdGlvbn0gPSByZXF1aXJlIFwiLi9tb2RlbHMvdHJhbnNhY3Rpb25cIlxud2luZG93Lk5vdGlmaWNhdGlvbkNlbnRlciA9IHJlcXVpcmUoXCIuL21vZGVscy9ub3RpZmljYXRpb25fY2VudGVyXCIpLk5vdGlmaWNhdGlvbkNlbnRlclxuXG5gXG5mdW5jdGlvbiBwYXJzZVVSTFBhcmFtcyh1cmwpIHtcbiAgICB2YXIgcXVlcnlTdGFydCA9IHVybC5pbmRleE9mKFwiP1wiKSArIDEsXG4gICAgICAgIHF1ZXJ5RW5kICAgPSB1cmwuaW5kZXhPZihcIiNcIikgKyAxIHx8IHVybC5sZW5ndGggKyAxLFxuICAgICAgICBxdWVyeSA9IHVybC5zbGljZShxdWVyeVN0YXJ0LCBxdWVyeUVuZCAtIDEpLFxuICAgICAgICBwYWlycyA9IHF1ZXJ5LnJlcGxhY2UoL1xcKy9nLCBcIiBcIikuc3BsaXQoXCImXCIpLFxuICAgICAgICBwYXJtcyA9IHt9LCBpLCBuLCB2LCBudjtcblxuICAgIGlmIChxdWVyeSA9PT0gdXJsIHx8IHF1ZXJ5ID09PSBcIlwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbnYgPSBwYWlyc1tpXS5zcGxpdChcIj1cIik7XG4gICAgICAgIG4gPSBkZWNvZGVVUklDb21wb25lbnQobnZbMF0pO1xuICAgICAgICB2ID0gZGVjb2RlVVJJQ29tcG9uZW50KG52WzFdKTtcblxuICAgICAgICBpZiAoIXBhcm1zLmhhc093blByb3BlcnR5KG4pKSB7XG4gICAgICAgICAgICBwYXJtc1tuXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFybXNbbl0ucHVzaChudi5sZW5ndGggPT09IDIgPyB2IDogbnVsbCk7XG4gICAgfVxuICAgIHJldHVybiBwYXJtcztcbn1cbmBcblxud2luZG93LnNvY2tldCA9IGlvKClcbndpbmRvdy5ib3hlcyA9IFtdXG53aW5kb3cuZW5lcmd5SW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoLT4gd2luZG93LnBsYXllci51cGRhdGVFbmVyZ3kgLTAuMDEzICksIDc1MClcbnVzZXJOYW1lID0gcGFyc2VVUkxQYXJhbXMoZG9jdW1lbnQubG9jYXRpb24uc2VhcmNoKT8ubmFtZVswXSA/IHByb21wdChcIldoYXQgaXMgeW91ciBmaXJzdCBhbmQgbGFzdCBuYW1lP1wiKVxud2luZG93LnBsYXllciA9IG5ldyBQbGF5ZXIgdXNlck5hbWVcbndpbmRvdy5TdGF0aW9uLmZpcmUgXCJuZXdQbGF5ZXJcIlxuXG53aW5kb3cucGxheWVyLnJlbmRlcigpXG53aW5kb3cuR2FtZU92ZXJGaWVsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuR2FtZU92ZXJcIilcbndpbmRvdy5HYW1lT3ZlclRpdGxlRmllbGQgPSB3aW5kb3cuR2FtZU92ZXJGaWVsZC5xdWVyeVNlbGVjdG9yKFwiLkdhbWVPdmVyX190aXRsZVwiKVxud2luZG93LkdhbWVPdmVyTWVzc2FnZUZpZWxkID0gd2luZG93LkdhbWVPdmVyRmllbGQucXVlcnlTZWxlY3RvcihcIi5HYW1lT3Zlcl9fbWVzc2FnZVwiKVxud2luZG93LmdhbWVPdmVyID0gKHRpdGxlLCBtc2cpIC0+XG4gIHdpbmRvdy5HYW1lT3ZlclRpdGxlRmllbGQuaW5uZXJIVE1MID0gdGl0bGVcbiAgd2luZG93LkdhbWVPdmVyTWVzc2FnZUZpZWxkLmlubmVySFRNTCA9IG1zZ1xuICB3aW5kb3cuR2FtZU92ZXJGaWVsZC5zdHlsZS5vcGFjaXR5ID0gMFxuICB3aW5kb3cuR2FtZU92ZXJGaWVsZC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiXG4gIHdpbmRvdy5HYW1lT3ZlckZpZWxkLnN0eWxlLm9wYWNpdHkgPSAxXG4jIFNldHVwIFBsYXllciBDb3VudFxud2luZG93LnBsYXllckNvdW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciBcInNtYWxsLnBsYXllcnMgLnBsYXllci1jb3VudFwiXG53aW5kb3cuYWxpdmVQbGF5ZXJDb3VudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgXCJzbWFsbC5wbGF5ZXJzIC5hbGl2ZS1wbGF5ZXItY291bnRcIlxuXG5yZWRCdWNrZXQgPSBuZXcgQnVja2V0KHtcbiAgICAgIGNvbnRhaW5lcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5CdWNrZXQtLXJlZFwiKSxcbiAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgfSk7XG5ibHVlQnVja2V0ID0gbmV3IEJ1Y2tldCh7XG4gICAgICBjb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuQnVja2V0LS1ibHVlXCIpLFxuICAgICAgY29sb3I6IFwiYmx1ZVwiLFxuICAgICAgfSk7XG5ncmVlbkJ1Y2tldCA9IG5ldyBCdWNrZXQoe1xuICAgICAgY29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLkJ1Y2tldC0tZ3JlZW5cIiksXG4gICAgICBjb2xvcjogXCJncmVlblwiLFxuICAgICAgfSk7XG55ZWxsb3dCdWNrZXQgPSBuZXcgQnVja2V0KHtcbiAgICAgIGNvbnRhaW5lcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5CdWNrZXQtLXllbGxvd1wiKSxcbiAgICAgIGNvbG9yOiBcInllbGxvd1wiLFxuICAgICAgfSk7XG53aW5kb3cuYnVja2V0cyA9IFtyZWRCdWNrZXQuZHJhZ2dpZSwgYmx1ZUJ1Y2tldC5kcmFnZ2llLCBncmVlbkJ1Y2tldC5kcmFnZ2llLCB5ZWxsb3dCdWNrZXQuZHJhZ2dpZV1cbndpbmRvdy5idWNrZXRMaXN0ID0gW3JlZEJ1Y2tldCwgYmx1ZUJ1Y2tldCwgZ3JlZW5CdWNrZXQsIHllbGxvd0J1Y2tldF1cblxuIyBTZXR1cCBCb3hlcy4uLkZPUiBOT1dcbl8uZWFjaCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLkJveC0tcmVkXCIpLCBzZXR1cFJlZEJveCA9IChlbGVtZW50LCBpbmRleCwgYXJyYXkpID0+XG4gIHdpbmRvdy5ib3hlcy5wdXNoKG5ldyBCb3ggZWxlbWVudCwgXCJjb2xvclwiKVxuXy5lYWNoIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuQm94LS1ibHVlXCIpLCBzZXR1cEJsdWVCb3ggPSAoZWxlbWVudCwgaW5kZXgsIGFycmF5KSA9PlxuICB3aW5kb3cuYm94ZXMucHVzaChuZXcgQm94IGVsZW1lbnQsIFwiYmx1ZVwiKVxuXy5lYWNoIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuQm94LS1ncmVlblwiKSwgc2V0dXBHcmVlbkJveCA9IChlbGVtZW50LCBpbmRleCwgYXJyYXkpID0+XG4gIHdpbmRvdy5ib3hlcy5wdXNoKG5ldyBCb3ggZWxlbWVudCwgXCJncmVlblwiKVxuXy5lYWNoIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuQm94LS15ZWxsb3dcIiksIHNldHVwWWVsbG93Qm94ID0gKGVsZW1lbnQsIGluZGV4LCBhcnJheSkgPT5cbiAgd2luZG93LmJveGVzLnB1c2gobmV3IEJveCBlbGVtZW50LCBcInllbGxvd1wiKVxuXG5cblxuXG5cblxuXG4jIFNldHVwIFN0b3JlXG5mb29kSXRlbSA9IEl0ZW0uZnJvbVNlbGVjdG9yIFwiLkl0ZW0tLWZvb2RcIlxud2F0ZXJJdGVtID0gSXRlbS5mcm9tU2VsZWN0b3IgXCIuSXRlbS0td2F0ZXJcIlxuYnJlYWtJdGVtID0gSXRlbS5mcm9tU2VsZWN0b3IgXCIuSXRlbS0tYnJlYWtcIlxuU3RvcmUuYWRkSXRlbSBmb29kSXRlbVxuU3RvcmUuYWRkSXRlbSB3YXRlckl0ZW1cblN0b3JlLmFkZEl0ZW0gYnJlYWtJdGVtXG5cbiMgU2V0dXAgVmlzYWJpbGl0eVxuaWYgZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJ2aXNpYmlsaXR5Y2hhbmdlXCIsIC0+XG4gICAgdG9TdGF0ZSA9ICFkb2N1bWVudC5oaWRkZW5cbiAgICBmcm9tU3RhdGUgPSB3aW5kb3cucGxheWVyLmlzV2F0Y2hpbmdcbiAgICB3aW5kb3cucGxheWVyLmlzV2F0Y2hpbmcgPSB0b1N0YXRlXG4gICAgU3RhdGlvbi5maXJlIFwidmlzaWJpbGl0eUNoYW5nZVwiLCB7IGZyb21TdGF0ZSwgdG9TdGF0ZSB9XG5cbiMgU2V0dXAgTGlzdGVuZXJzXG53aW5kb3cuc29ja2V0Lm9uIFwicGxheWVySURcIiwgKGRhdGEpIC0+XG4gIHdpbmRvdy5wbGF5ZXIuaWQgPSBkYXRhLmlkXG53aW5kb3cuc29ja2V0Lm9uIFwiYWRkUGxheWVyc1wiLCBhZGRQbGF5ZXJzID0gKGRhdGEpIC0+XG4gIGFkZFBsYXllciA9IChwbGF5ZXIpIC0+XG4gICAgTm90aWZpY2F0aW9uQ2VudGVyLmluZm8gXCIje3BsYXllci5mdWxsTmFtZX0gaGFzIGpvaW5lZC4gV29yayBIYXJkZXIhXCJcbiAgICBpZiBNb2Rlcm5penIuc2Vzc2lvbnN0b3JhZ2VcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0gcGxheWVyLmlkLCBwbGF5ZXIuZnVsbE5hbWVcbiAgYWRkUGxheWVyKHBsYXllcikgZm9yIHBsYXllciBpbiBkYXRhLnBsYXllcnNcbiAgdXBkYXRlUGxheWVyQ291bnQoZGF0YSlcblxud2luZG93LnNvY2tldC5vbiBcInJlbW92ZVBsYXllcnNcIiwgcmVtb3ZlUGxheWVycyA9IChkYXRhKSAtPlxuICByZW1vdmVQbGF5ZXIgPSAocGxheWVyKSAtPlxuICAgIGlmIE1vZGVybml6ci5zZXNzaW9uc3RvcmFnZVxuICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSBwbGF5ZXIuaWRcbiAgcmVtb3ZlUGxheWVyKHBsYXllcikgZm9yIHBsYXllciBpbiBkYXRhLnBsYXllcnNcbiAgdXBkYXRlUGxheWVyQ291bnQoZGF0YSlcblxuXG53aW5kb3cuc29ja2V0Lm9uIFwicGxheWVyRGllZFwiLCBvblBsYXllckRlYXRoID0gKGRhdGEpIC0+XG4gIHBsYXllciA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oZGF0YS5pZClcbiAgTm90aWZpY2F0aW9uQ2VudGVyLmluZm8gXCJZb3VyIGZyaWVuZCAje3BsYXllcn0gaGFzIGRpZWQuIFdvcmsgSGFyZGVyIVwiIHVubGVzcyB3aW5kb3cucGxheWVyLmlkIGlzIGRhdGEuaWRcbiAgdXBkYXRlUGxheWVyQ291bnQgZGF0YVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgXCJzdG9yYWdlXCIsIHVwZGF0ZVBsYXllckNvdW50XG5cbnVwZGF0ZVBsYXllckNvdW50ID0gKGRhdGEpIC0+XG4gIHdpbmRvdy5wbGF5ZXJDb3VudC5pbm5lckhUTUwgPSBcIiN7ZGF0YS5wbGF5ZXJDb3VudC5hbGx9XCJcbiAgd2luZG93LmFsaXZlUGxheWVyQ291bnQuaW5uZXJIVE1MID0gXCIje2RhdGEucGxheWVyQ291bnQuYXJlQWxpdmV9XCJcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgXCJ1bmxvYWRcIiwgKGV2dCkgLT5cbiAgc2Vzc2lvblN0b3JhZ2UuY2xlYXIoKVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgXCJsb2FkXCIsIChldnQpIC0+XG4gIHNlc3Npb25TdG9yYWdlLmNsZWFyKClcbiIsIl8gPSByZXF1aXJlIFwidW5kZXJzY29yZVwiXG5leHBvcnRzLkJveCA9XG5jbGFzcyBCb3hcbiAgQGNvbG9yczogW1wicmVkXCIsIFwiYmx1ZVwiLCBcImdyZWVuXCIsIFwieWVsbG93XCJdXG4gIEByYW5kb21Db2xvcjogLT5cbiAgICBfLnNhbXBsZSBAY29sb3JzXG4gIEByZW5kZXJDb2xvcjogKGNvbG9yKSAtPlxuICAgIFwiPGRpdiBjbGFzcz1cXFwiQm94IEJveC0tI3tjb2xvcn1cXD48L2Rpdj5cIlxuICBjb25zdHJ1Y3RvcjogKEBlbGVtZW50LCBAY29sb3IpIC0+XG4gICAgQGRyYWdnaWUgPSBuZXcgRHJhZ2dhYmxlKEBlbGVtZW50LCB3aW5kb3cuYnVja2V0cywge1xuICAgICAgZHJhZ2dhYmlsaXR5OiB7Y29udGFpbm1lbnQ6IFwiI3NjZW5lXCJ9LFxuICAgICAgc2Nyb2xsOiBmYWxzZSxcbiAgICAgIG9uU3RhcnQ6ID0+IEBvbkRyYWdTdGFydCgpLFxuICAgICAgb25FbmQ6ICh3YXNEcm9wcGVkKSA9PiBAb25EcmFnRW5kKHdhc0Ryb3BwZWQpXG4gICAgICB9KVxuICBvbkRyYWdTdGFydDogLT5cbiAgICB3aW5kb3cuZHJhZ2dlZEJveCA9IHRoaXNcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiQm94LS1kcmFnZ2luZ1wiKVxuICAgICMkY29udmV5b3JCZWx0LmhpZGVCb3ggJGRyYWdnZWRFbGVtZW50XG4gIG9uRHJhZ0VuZDogKHdhc0Ryb3BwZWQpIC0+XG4gICAgQGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIkJveC0tZHJhZ2dpbmdcIilcbiAgICBpZiB3YXNEcm9wcGVkXG4gICAgICBAZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiQm94LS0je0Bjb2xvcn1cIilcbiAgICAgIEBjb2xvciA9IEJveC5yYW5kb21Db2xvcigpXG4gICAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiQm94LS0je0Bjb2xvcn1cIilcbiIsIntTdGF0aW9ufSA9IHJlcXVpcmUgXCIuL3N0YXRpb25cIlxuZXhwb3J0cy5CdWNrZXQgPVxuY2xhc3MgQnVja2V0XG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICB7QGNvbnRhaW5lciwgQGNvbG9yLCBAdG90YWxWYWx1ZSwgQHJlcXVpcmVkQW1vdW50fSA9IG9wdGlvbnNcbiAgICBAcmVxdWlyZWRBbW91bnQgfHw9IDEyXG4gICAgQHRvdGFsVmFsdWUgfHw9IDAuMVxuICAgIEBlbGVtZW50ID0gQGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLkJ1Y2tldF9fRHJvcFpvbmVcIilcbiAgICBAdGFsbHlFbGVtZW50ID0gQGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLkJ1Y2tldF9fVGFsbHlcIilcbiAgICBAZHJhZ2dpZSA9IG5ldyBEcm9wcGFibGUoQGVsZW1lbnQsIHtcbiAgICAgIG9uRHJvcDogKGluc3RhbmNlLCBkcmFnZ2FibGVFbGUpID0+XG4gICAgICAgIEBvbkRyb3AoKVxuICAgICAgfSlcbiAgY3VycmVudFRhbGx5OiAwXG4gIG9uOiAodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmU9ZmFsc2UpIC0+XG4gICAgQGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSlcbiAgcmVnaXN0ZXJIYW5kbGVyczogLT5cbiAgICBAb24oXCJkcmFnZW50ZXJcIiwgQG9uRHJhZ0VudGVyKVxuICAgIEBvbihcImRyYWdsZWF2ZVwiLCBAb25EcmFnTGVhdmUpXG4gIG9uRHJhZ0VudGVyOiAoZSkgLT5cbiAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKFwiQnVja2V0LS1kcmFnb3ZlclwiKVxuICBvbkRyb3BMZWF2ZTogKGUpIC0+XG4gICAgZS50YXJnZXQuY2xhc3NMaXN0LnJlbW92ZShcIkJ1Y2tldC0tZHJhZ292ZXJcIilcbiAgb25Ecm9wOiAtPlxuICAgICMkY29udmV5b3JCZWx0LnJlbW92ZUJveCAkZHJhZ2dlZEJveFxuICAgIGlmIHdpbmRvdy5kcmFnZ2VkQm94LmNvbG9yID09IEBjb2xvclxuICAgICAgQGRyb3BTdWNjZXNzZnVsKClcbiAgICBlbHNlXG4gICAgICBAZHJvcEZhaWxlZCgpXG4gIGRyb3BTdWNjZXNzZnVsOiAtPlxuICAgIEB0YWxseUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3AtLXN1Y2Nlc3NcIilcbiAgICBAdGFsbHlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wLS1mYWlsdXJlXCIpXG4gICAgQGN1cnJlbnRUYWxseSsrXG4gICAgQHRhbGx5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHJvcC0tc3VjY2Vzc1wiKVxuICAgIEB1cGRhdGVUYWxseSgpXG4gICAgU3RhdGlvbi5maXJlIFwiY29ycmVjdEJveFwiLCB7XG4gICAgICBib3g6IEBjb2xvclxuICAgIH1cblxuICBkcm9wRmFpbGVkOiAtPlxuICAgIEB0YWxseUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRyb3AtLXN1Y2Nlc3NcIilcbiAgICBAdGFsbHlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wLS1mYWlsdXJlXCIpXG4gICAgQGN1cnJlbnRUYWxseS0tXG4gICAgQHRhbGx5RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZHJvcC0tZmFpbHVyZVwiKVxuICAgIEB1cGRhdGVUYWxseSgpXG4gICAgU3RhdGlvbi5maXJlIFwid3JvbmdCb3hcIiwge1xuICAgICAgYm94OiBAY29sb3JcbiAgICB9XG5cbiAgdXBkYXRlVGFsbHk6IC0+XG4gICAgaWYgQGlzRnVsbCgpXG4gICAgICBTdGF0aW9uLmZpcmUgXCJidWNrZXRGaWxsZWRcIlxuICAgICAgQGVtcHR5KClcbiAgICAgIHdpbmRvdy5wbGF5ZXIudXBkYXRlQmFsYW5jZSBAdG90YWxWYWx1ZVxuICAgIG5ld1RleHQgPSBcIiN7QGN1cnJlbnRUYWxseX0vI3tAcmVxdWlyZWRBbW91bnR9XCJcbiAgICBAdGFsbHlFbGVtZW50LmlubmVySFRNTCA9IG5ld1RleHRcbiAgaXNGdWxsOiAtPlxuICAgIEBjdXJyZW50VGFsbHkgPT0gQHJlcXVpcmVkQW1vdW50XG4gIGVtcHR5OiAtPlxuICAgIEBjdXJyZW50VGFsbHkgPSAwXG4iLCJleHBvcnRzLkNvbnZleW9yQmVsdCA9XG5jbGFzcyBDb252ZXlvckJlbHRcbiAgQGNvbG9yczogW1wicmVkXCIsIFwiYmx1ZVwiLCBcImdyZWVuXCIsIFwieWVsbG93XCJdXG4gIEByYW5kb21Db2xvcjogLT5cbiAgICBfLnNhbXBsZSBAY29sb3JzXG4gIGNvbnN0cnVjdG9yOiAoQGVsZW1lbnQpIC0+XG4gIGJveGVzOiBbW11dXG4gIGFkZEJveDogKGJveCkgLT5cbiAgICBAYm94ZXMucHVzaChib3gpXG4gIG5ld0JveDogKGNvbG9yPUByYW5kb21Db2xvcikgLT5cbiAgICBhZGRCb3ggQm94LnJlbmRlckNvbG9yKGNvbG9yKSwgKG5ldyBCb3goY29sb3IpKVxuIiwiZXhwb3J0cy5JdGVtID1cbmNsYXNzIEl0ZW1cbiAgY29uc3RydWN0b3I6IChAbmFtZSwgQHByaWNlLCBAZW5lcmd5LCBAZWxlbWVudD1cIlwiKSAtPlxuICAgIEBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJjbGlja1wiLCAoZXZ0KSA9PiBTdG9yZS5idXkgdGhpc1xuICBAZnJvbUVsZW1lbnQ6IChlbGVtZW50KSAtPlxuICAgIG5hbWUgPSBlbGVtZW50LmRhdGFzZXQubmFtZVxuICAgIHByaWNlID0gcGFyc2VGbG9hdCBlbGVtZW50LmRhdGFzZXQucHJpY2VcbiAgICBlbmVyZ3lHYWluID0gcGFyc2VGbG9hdCBlbGVtZW50LmRhdGFzZXQuZW5lcmd5XG4gICAgbmV3IEl0ZW0obmFtZSwgcHJpY2UsIGVuZXJneUdhaW4sIGVsZW1lbnQpXG4gIEBmcm9tSWQ6IChpZCkgLT5cbiAgICBAZnJvbUVsZW1lbnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgaWRcbiAgQGZyb21TZWxlY3RvcjogKHNlbGVjdG9yKSAtPlxuICAgIEBmcm9tRWxlbWVudCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIHNlbGVjdG9yXG4iLCJOb3RpZmljYXRpb25DZW50ZXIgPSB7fVxuTm90aWZpY2F0aW9uQ2VudGVyLmNvbmdyYXR1bGF0ZSA9IGh1bWFuZS5zcGF3bih7IGFkZG5DbHM6ICdodW1hbmUtZmxhdHR5LXN1Y2Nlc3MnLCB0aW1lb3V0OiAxMDAwIH0pXG5Ob3RpZmljYXRpb25DZW50ZXIuZXJyb3IgPSBodW1hbmUuc3Bhd24oeyBhZGRuQ2xzOiAnaHVtYW5lLWZsYXR0eS1lcnJvcicsIHRpbWVvdXQ6IDEwMDAgfSlcbk5vdGlmaWNhdGlvbkNlbnRlci5pbmZvID0gaHVtYW5lLnNwYXduKHsgYWRkbkNsczogJ2h1bWFuZS1mbGF0dHktaW5mbycsIHRpbWVvdXQ6IDc1MCB9KVxubW9kdWxlLmV4cG9ydHMuTm90aWZpY2F0aW9uQ2VudGVyID0gTm90aWZpY2F0aW9uQ2VudGVyXG4iLCJleHBvcnRzLlBsYXllciA9XG5jbGFzcyBQbGF5ZXJcbiAgY29uc3RydWN0b3I6IChAZnVsbE5hbWUpIC0+XG4gIGlkOiAwXG4gIGZpcnN0TmFtZTogLT4gQGZ1bGxOYW1lLnNwbGl0KFwiIFwiKVswXVxuICBsYXN0TmFtZTogLT4gQGZ1bGxOYW1lLnNwbGl0KFwiIFwiKVsxXVxuICBlbmVyZ3lGaWVsZDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5QbGF5ZXJfX2VuZXJneVwiKVxuICBiYWxhbmNlRmllbGQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuUGxheWVyX19iYWxhbmNlXCIpXG4gIG5hbWVGaWVsZDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5QbGF5ZXJfX25hbWVcIilcbiAgYmFsYW5jZTogMC4wMFxuICBlbmVyZ3k6IDFcbiAgaXNEZWFkOiBmYWxzZVxuICBjYW5BZmZvcmQ6IChpdGVtKSAtPlxuICAgIEBiYWxhbmNlID49IGl0ZW0ucHJpY2VcbiAgd2lsbEtpbGw6IChhbW91bnQpIC0+IChAZW5lcmd5ICsgYW1vdW50KSA8PSAwXG4gIGtpbGw6IC0+XG4gICAgQGlzRGVhZCA9IHRydWVcbiAgICBjbGVhckludGVydmFsIHdpbmRvdy5lbmVyZ3lJbnRlcnZhbFxuICAgIEBlbmVyZ3kgPSAwXG4gICAgQHJlbmRlckVuZXJneSgpXG4gICAgU3RhdGlvbi5maXJlIFwicGxheWVyRGllZFwiXG4gIHVwZGF0ZUVuZXJneTogKGFtb3VudCkgLT5cbiAgICByZXR1cm4gQGtpbGwoKSBpZiBAd2lsbEtpbGwgYW1vdW50XG4gICAgZnJvbSA9IEBlbmVyZ3lcbiAgICBAZW5lcmd5ID0gcGFyc2VGbG9hdCAoQGVuZXJneSArIGFtb3VudCkudG9GaXhlZCgyKVxuICAgIFN0YXRpb24uZmlyZSBcInBsYXllclVwZGF0ZVwiLCB7XG4gICAgICBmaWVsZDogXCJlbmVyZ3lcIlxuICAgICAgZnJvbTogZnJvbVxuICAgICAgdG86IEBlbmVyZ3lcbiAgICB9XG4gICAgQHJlbmRlckVuZXJneSgpXG4gIHVwZGF0ZUJhbGFuY2U6IChhbW91bnQpIC0+XG4gICAgZnJvbSA9IEBiYWxhbmNlXG4gICAgQGJhbGFuY2UgPSBwYXJzZUZsb2F0IChAYmFsYW5jZSArIGFtb3VudCkudG9GaXhlZCgyKVxuICAgIFN0YXRpb24uZmlyZSBcInBsYXllclVwZGF0ZVwiLCB7XG4gICAgICBmaWVsZDogXCJiYWxhbmNlXCJcbiAgICAgIGZyb206IGZyb21cbiAgICAgIHRvOiBAYmFsYW5jZVxuICAgIH1cbiAgICBAcmVuZGVyQmFsYW5jZSgpXG4gIHJlbmRlcjogLT5cbiAgICBAcmVuZGVyTmFtZSgpXG4gICAgQHJlbmRlckJhbGFuY2UoKVxuICAgIEByZW5kZXJFbmVyZ3koKVxuICByZW5kZXJOYW1lOiAtPlxuICAgIEBuYW1lRmllbGQuaW5uZXJIVE1MID0gQGZpcnN0TmFtZSgpXG4gIHJlbmRlckJhbGFuY2U6IC0+XG4gICAgQGJhbGFuY2VGaWVsZC5pbm5lckhUTUwgPSBcIiQje0BiYWxhbmNlfVwiXG4gIHJlbmRlckVuZXJneTogLT5cbiAgICBAZW5lcmd5RmllbGQuaW5uZXJIVE1MID0gXCIje0BlbmVyZ3kgKiAxMDB9JVwiXG4iLCIjIHV0aWwubG9nX3JlcXVlc3QgPSByZXF1aXJlIFwiLi8uLi9oZWxwZXJzL2xvZ19yZXF1ZXN0XCJcbmV4cG9ydHMuU3RhdGlvbiA9XG5jbGFzcyBTdGF0aW9uXG4gIEBmaXJlOiAobmFtZSwgZGV0YWlscykgLT5cbiAgICBzd2l0Y2ggbmFtZVxuICAgICAgd2hlbiBcIm5ld1BsYXllclwiIHRoZW4gQG9uTmV3UGxheWVyKClcbiAgICAgIHdoZW4gXCJwbGF5ZXJVcGRhdGVcIiB0aGVuIEBvblBsYXllclVwZGF0ZSBkZXRhaWxzXG4gICAgICB3aGVuIFwiY29ycmVjdEJveFwiIHRoZW4gQG9uQ29ycmVjdEJveCBkZXRhaWxzXG4gICAgICB3aGVuIFwid3JvbmdCb3hcIiB0aGVuIEBvbldyb25nQm94IGRldGFpbHNcbiAgICAgIHdoZW4gXCJnZXRQbGF5ZXJcIiB0aGVuIEBvbkdldFBsYXllciBkZXRhaWxzXG4gICAgICB3aGVuIFwidG9va0JyZWFrXCIgdGhlbiBAb25Ub29rQnJlYWsoKVxuICAgICAgd2hlbiBcInN1Y2Nlc3NmdWxQdXJjaGFzZVwiIHRoZW4gQG9uU3VjY2Vzc2Z1bFB1cmNoYXNlIGRldGFpbHNcbiAgICAgIHdoZW4gXCJmYWlsZWRQdXJjaGFzZVwiIHRoZW4gQG9uRmFpbGVkUHVyY2hhc2UgZGV0YWlsc1xuICAgICAgd2hlbiBcImJ1Y2tldEZpbGxlZFwiIHRoZW4gQG9uQnVja2V0RmlsbGVkKClcbiAgICAgIHdoZW4gXCJ2aXNpYmlsaXR5Q2hhbmdlXCIgdGhlbiBAb25WaXNpYmlsaXR5Q2hhbmdlIGRldGFpbHNcbiAgICAgIHdoZW4gXCJwbGF5ZXJEaWVkXCIgdGhlbiBAb25QbGF5ZXJEZWF0aCgpXG4gICAgICBlbHNlIGNvbnNvbGUuZXJyb3IoXCJVTktOT1dOIEVWRU5UOiAoI3tuYW1lfSlcIilcbiAgQG9uTmV3UGxheWVyOiAoZGV0YWlscykgLT5cbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJuZXdQbGF5ZXJcIiwgd2luZG93LnBsYXllclxuICBAb25QbGF5ZXJVcGRhdGU6IChkZXRhaWxzKSAtPlxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcInVwZGF0ZVwiLCB7cGxheWVyOiB3aW5kb3cucGxheWVyfVxuICBAb25TdWNjZXNzZnVsUHVyY2hhc2U6IChkZXRhaWxzKSAtPlxuICAgIE5vdGlmaWNhdGlvbkNlbnRlci5jb25ncmF0dWxhdGUgXCJZb3UgaGF2ZSBib3VnaHQgI3tkZXRhaWxzLm5hbWV9IGZvciAkI3tkZXRhaWxzLnByaWNlLnRvRml4ZWQoMil9XCJcbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJwdXJjaGFzZVwiLCB7XG4gICAgICB0cmFuc2FjdGlvbjoge1xuICAgICAgICBuYW1lOiBkZXRhaWxzLm5hbWVcbiAgICAgICAgcHJpY2U6IGRldGFpbHMucHJpY2VcbiAgICAgIH1cbiAgICB9XG4gIEBvbkZhaWxlZFB1cmNoYXNlOiAoZGV0YWlscykgLT5cbiAgICBOb3RpZmljYXRpb25DZW50ZXIuZXJyb3IgXCJZb3UgZG8gbm90IGhhdmUgZW5vdWdoIG1vbmV5LiBXb3JrIEhhcmRlciFcIlxuICBAb25CdWNrZXRGaWxsZWQ6IC0+XG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwiYnVja2V0RmlsbGVkXCJcbiAgQG9uR2V0UGxheWVyOiAoZGV0YWlscykgLT5cbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJnZXRQbGF5ZXJcIiwge1xuICAgICAgaWQ6IGRldGFpbHMuaWRcbiAgICB9XG4gIEBvblRvb2tCcmVhayA9IC0+XG4gICAgY2xlYXJJbnRlcnZhbCB3aW5kb3cuZW5lcmd5SW50ZXJ2YWxcbiAgICB3aW5kb3cuZ2FtZU92ZXIoXCJObyBCcmVha3NcIiwgXCJCZWNhdXNlIHlvdSB0b29rIGEgYnJlYWsgeW91IHdlcmUgZmlyZWQgZnJvbSB5b3VyIGpvYiBhbmQgd2l0aG91dCBhIHNvdXJjZSBvZiBpbmNvbWU6IHlvdSBkaWVkLlwiKVxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcImJyZWFrXCJcbiAgQG9uUGxheWVyRGVhdGg6IC0+XG4gICAgd2luZG93LmdhbWVPdmVyKFwiWW91IERpZWRcIiwgXCJZb3UgaGFkIG5vIGVuZXJneSBsZWZ0IGFuZCBsaXRlcmFsbHkgZmVsbCBvdmVyIG9uIHRoZSBqb2IuIFlvdXIgbWFuYWdlciBkaWRuJ3QgZXZlbiBub3RpY2UuXCIpXG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwiZGVhdGhcIlxuICBAb25Db3JyZWN0Qm94OiAoZGV0YWlscykgLT5cbiAgICBidWNrZXRzID0gd2luZG93LmJ1Y2tldExpc3QubWFwIChidWNrZXQpIC0+XG4gICAgICB7XG4gICAgICAgIGNvbG9yOiBidWNrZXQuY29sb3IsXG4gICAgICAgIGN1cnJlbnRUYWxseTogYnVja2V0LmN1cnJlbnRUYWxseSxcbiAgICAgICAgcmVxdWlyZWRBbW91bnQ6IGJ1Y2tldC5yZXF1aXJlZEFtb3VudCxcbiAgICAgICAgdG90YWxWYWx1ZTogYnVja2V0LnRvdGFsVmFsdWVcbiAgICAgIH1cblxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcImNvcnJlY3Rib3hcIiwge1xuICAgICAgYm94OiBkZXRhaWxzLmJveFxuICAgICAgYnVja2V0czogYnVja2V0c1xuICAgIH1cbiAgQG9uV3JvbmdCb3g6IChkZXRhaWxzKSAtPlxuICAgIGJ1Y2tldHMgPSB3aW5kb3cuYnVja2V0TGlzdC5tYXAgKGJ1Y2tldCkgLT5cbiAgICAgIHtcbiAgICAgICAgY29sb3I6IGJ1Y2tldC5jb2xvcixcbiAgICAgICAgY3VycmVudFRhbGx5OiBidWNrZXQuY3VycmVudFRhbGx5LFxuICAgICAgICByZXF1aXJlZEFtb3VudDogYnVja2V0LnJlcXVpcmVkQW1vdW50LFxuICAgICAgICB0b3RhbFZhbHVlOiBidWNrZXQudG90YWxWYWx1ZVxuICAgICAgfVxuXG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwid3Jvbmdib3hcIiwge1xuICAgICAgYm94OiBkZXRhaWxzLmJveFxuICAgICAgYnVja2V0czogYnVja2V0c1xuICAgIH1cbiAgQG9uVmlzaWJpbGl0eUNoYW5nZTogKGRldGFpbHMpIC0+XG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwidmlzaWJpbGl0eUNoYW5nZVwiLCB7XG4gICAgICBmcm9tU3RhdGU6IGRldGFpbHMuZnJvbVN0YXRlXG4gICAgICB0b1N0YXRlOiBkZXRhaWxzLnRvU3RhdGVcbiAgICB9XG4iLCJ7VHJhbnNhY3Rpb259ID0gcmVxdWlyZSBcIi4vdHJhbnNhY3Rpb25cIlxue1N0YXRpb259ID0gcmVxdWlyZSBcIi4vc3RhdGlvblwiXG5leHBvcnRzLlN0b3JlID1cbmNsYXNzIFN0b3JlXG4gIEBpdGVtczogW11cbiAgQGFkZEl0ZW06IChpdGVtKSAtPlxuICAgIEBpdGVtcy5wdXNoIGl0ZW1cbiAgQGJ1eTogKGl0ZW0pIC0+XG4gICAgdHJhbnNhY3Rpb24gPSBuZXcgVHJhbnNhY3Rpb24gaXRlbVxuICAgIGlmIHdpbmRvdy5wbGF5ZXIuY2FuQWZmb3JkKHRyYW5zYWN0aW9uKSBhbmQgdHJhbnNhY3Rpb24ubmFtZSBpc250IFwiYSBicmVha1wiXG4gICAgICB0cmFuc2FjdGlvbi5pc1N1Y2Nlc3MgPSB0cnVlXG4gICAgICB0cmFuc2FjdGlvbi5hcHBseSgpXG4gICAgZWxzZSBpZiB0cmFuc2FjdGlvbi5uYW1lIGlzIFwiYSBicmVha1wiXG4gICAgICBTdGF0aW9uLmZpcmUgXCJ0b29rQnJlYWtcIlxuICAgICAgdHJhbnNhY3Rpb24uaXNTdWNjZXNzID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIHRyYW5zYWN0aW9uLmlzU3VjY2VzcyA9IGZhbHNlXG4gICAgU3RhdGlvbi5maXJlIFwiI3t0cmFuc2FjdGlvbi5zdGF0ZSgpfVB1cmNoYXNlXCIsIHRyYW5zYWN0aW9uXG4iLCJleHBvcnRzLlRyYW5zYWN0aW9uID1cbmNsYXNzIFRyYW5zYWN0aW9uXG4gIGNvbnN0cnVjdG9yOiAoQGl0ZW0pIC0+XG4gICAgQHByaWNlID0gQGl0ZW0ucHJpY2VcbiAgICBAbmFtZSA9IEBpdGVtLm5hbWVcbiAgYXBwbHk6IC0+XG4gICAgQHRpbWUgPSBEYXRlLm5vdygpXG4gICAgd2luZG93LnBsYXllci51cGRhdGVFbmVyZ3kgQGl0ZW0uZW5lcmd5XG4gICAgd2luZG93LnBsYXllci51cGRhdGVCYWxhbmNlICgtMSpAcHJpY2UpXG4gIHN0YXRlOiAtPlxuICAgIGlmIEBpc1N1Y2Nlc3MgdGhlbiBcInN1Y2Nlc3NmdWxcIiBlbHNlIFwiZmFpbGVkXCJcbiIsIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuNy4wXG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDE0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgaW4gdGhlIGJyb3dzZXIsIG9yIGBleHBvcnRzYCBvbiB0aGUgc2VydmVyLlxuICB2YXIgcm9vdCA9IHRoaXM7XG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBfYCB2YXJpYWJsZS5cbiAgdmFyIHByZXZpb3VzVW5kZXJzY29yZSA9IHJvb3QuXztcblxuICAvLyBTYXZlIGJ5dGVzIGluIHRoZSBtaW5pZmllZCAoYnV0IG5vdCBnemlwcGVkKSB2ZXJzaW9uOlxuICB2YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSwgT2JqUHJvdG8gPSBPYmplY3QucHJvdG90eXBlLCBGdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhclxuICAgIHB1c2ggICAgICAgICAgICAgPSBBcnJheVByb3RvLnB1c2gsXG4gICAgc2xpY2UgICAgICAgICAgICA9IEFycmF5UHJvdG8uc2xpY2UsXG4gICAgY29uY2F0ICAgICAgICAgICA9IEFycmF5UHJvdG8uY29uY2F0LFxuICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kO1xuXG4gIC8vIENyZWF0ZSBhIHNhZmUgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgdXNlIGJlbG93LlxuICB2YXIgXyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBfKSByZXR1cm4gb2JqO1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBfKSkgcmV0dXJuIG5ldyBfKG9iaik7XG4gICAgdGhpcy5fd3JhcHBlZCA9IG9iajtcbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciAqKk5vZGUuanMqKiwgd2l0aFxuICAvLyBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3IgdGhlIG9sZCBgcmVxdWlyZSgpYCBBUEkuIElmIHdlJ3JlIGluXG4gIC8vIHRoZSBicm93c2VyLCBhZGQgYF9gIGFzIGEgZ2xvYmFsIG9iamVjdC5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS43LjAnO1xuXG4gIC8vIEludGVybmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlZmZpY2llbnQgKGZvciBjdXJyZW50IGVuZ2luZXMpIHZlcnNpb25cbiAgLy8gb2YgdGhlIHBhc3NlZC1pbiBjYWxsYmFjaywgdG8gYmUgcmVwZWF0ZWRseSBhcHBsaWVkIGluIG90aGVyIFVuZGVyc2NvcmVcbiAgLy8gZnVuY3Rpb25zLlxuICB2YXIgY3JlYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHJldHVybiBmdW5jO1xuICAgIHN3aXRjaCAoYXJnQ291bnQgPT0gbnVsbCA/IDMgOiBhcmdDb3VudCkge1xuICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG90aGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIG90aGVyKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBIG1vc3RseS1pbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBjYWxsYmFja3MgdGhhdCBjYW4gYmUgYXBwbGllZFxuICAvLyB0byBlYWNoIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGRlc2lyZWQgcmVzdWx0IOKAlCBlaXRoZXJcbiAgLy8gaWRlbnRpdHksIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuICBfLml0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBfLmlkZW50aXR5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSByZXR1cm4gY3JlYXRlQ2FsbGJhY2sodmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KTtcbiAgICBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHJldHVybiBfLm1hdGNoZXModmFsdWUpO1xuICAgIHJldHVybiBfLnByb3BlcnR5KHZhbHVlKTtcbiAgfTtcblxuICAvLyBDb2xsZWN0aW9uIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFRoZSBjb3JuZXJzdG9uZSwgYW4gYGVhY2hgIGltcGxlbWVudGF0aW9uLCBha2EgYGZvckVhY2hgLlxuICAvLyBIYW5kbGVzIHJhdyBvYmplY3RzIGluIGFkZGl0aW9uIHRvIGFycmF5LWxpa2VzLiBUcmVhdHMgYWxsXG4gIC8vIHNwYXJzZSBhcnJheS1saWtlcyBhcyBpZiB0aGV5IHdlcmUgZGVuc2UuXG4gIF8uZWFjaCA9IF8uZm9yRWFjaCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGksIGxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA9PT0gK2xlbmd0aCkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtpXSwgaSwgb2JqKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50LlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBbXTtcbiAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0gQXJyYXkobGVuZ3RoKSxcbiAgICAgICAgY3VycmVudEtleTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICByZXN1bHRzW2luZGV4XSA9IGl0ZXJhdGVlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgdmFyIHJlZHVjZUVycm9yID0gJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC5cbiAgXy5yZWR1Y2UgPSBfLmZvbGRsID0gXy5pbmplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0LCA0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgaW5kZXggPSAwLCBjdXJyZW50S2V5O1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgaWYgKCFsZW5ndGgpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgICAgbWVtbyA9IG9ialtrZXlzID8ga2V5c1tpbmRleCsrXSA6IGluZGV4KytdO1xuICAgIH1cbiAgICBmb3IgKDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQsIDQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gKyBvYmoubGVuZ3RoICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBpbmRleCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBjdXJyZW50S2V5O1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgaWYgKCFpbmRleCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgICBtZW1vID0gb2JqW2tleXMgPyBrZXlzWy0taW5kZXhdIDogLS1pbmRleF07XG4gICAgfVxuICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBtZW1vID0gaXRlcmF0ZWUobWVtbywgb2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHZhbHVlIHdoaWNoIHBhc3NlcyBhIHRydXRoIHRlc3QuIEFsaWFzZWQgYXMgYGRldGVjdGAuXG4gIF8uZmluZCA9IF8uZGV0ZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBfLnNvbWUob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGZvciB3aGljaCBhIHRydXRoIHRlc3QgZmFpbHMuXG4gIF8ucmVqZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm5lZ2F0ZShfLml0ZXJhdGVlKHByZWRpY2F0ZSkpLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIGN1cnJlbnRLZXk7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAoIXByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIGluZGV4LCBjdXJyZW50S2V5O1xuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgaWYgKHByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbnMgYSBnaXZlbiB2YWx1ZSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZSA9IGZ1bmN0aW9uKG9iaiwgdGFyZ2V0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgIHJldHVybiBfLmluZGV4T2Yob2JqLCB0YXJnZXQpID49IDA7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiAoaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXSkuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG4gIF8ucGx1Y2sgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBfLm1hcChvYmosIF8ucHJvcGVydHkoa2V5KSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmlsdGVyYDogc2VsZWN0aW5nIG9ubHkgb2JqZWN0c1xuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLndoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubWF0Y2hlcyhhdHRycykpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbmRgOiBnZXR0aW5nIHRoZSBmaXJzdCBvYmplY3RcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5maW5kV2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmluZChvYmosIF8ubWF0Y2hlcyhhdHRycykpO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWF4aW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5tYXggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IC1JbmZpbml0eSwgbGFzdENvbXB1dGVkID0gLUluZmluaXR5LFxuICAgICAgICB2YWx1ZSwgY29tcHV0ZWQ7XG4gICAgaWYgKGl0ZXJhdGVlID09IG51bGwgJiYgb2JqICE9IG51bGwpIHtcbiAgICAgIG9iaiA9IG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA+IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgICBpZiAoY29tcHV0ZWQgPiBsYXN0Q29tcHV0ZWQgfHwgY29tcHV0ZWQgPT09IC1JbmZpbml0eSAmJiByZXN1bHQgPT09IC1JbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gb2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGggPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgaWYgKHZhbHVlIDwgcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gSW5maW5pdHkgJiYgcmVzdWx0ID09PSBJbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGEgY29sbGVjdGlvbiwgdXNpbmcgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIHRoZVxuICAvLyBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4gIF8uc2h1ZmZsZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBzZXQgPSBvYmogJiYgb2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGggPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBzZXQubGVuZ3RoO1xuICAgIHZhciBzaHVmZmxlZCA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwLCByYW5kOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKDAsIGluZGV4KTtcbiAgICAgIGlmIChyYW5kICE9PSBpbmRleCkgc2h1ZmZsZWRbaW5kZXhdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHNldFtpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGEgY29sbGVjdGlvbi5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xuICAgICAgaWYgKG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgICAgcmV0dXJuIG9ialtfLnJhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICAgIH1cbiAgICByZXR1cm4gXy5zaHVmZmxlKG9iaikuc2xpY2UoMCwgTWF0aC5tYXgoMCwgbikpO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpXG4gICAgICB9O1xuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYTtcbiAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxlZnQuaW5kZXggLSByaWdodC5pbmRleDtcbiAgICB9KSwgJ3ZhbHVlJyk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdXNlZCBmb3IgYWdncmVnYXRlIFwiZ3JvdXAgYnlcIiBvcGVyYXRpb25zLlxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihiZWhhdmlvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHZhciBrZXkgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwgdmFsdWUsIGtleSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XS5wdXNoKHZhbHVlKTsgZWxzZSByZXN1bHRba2V5XSA9IFt2YWx1ZV07XG4gIH0pO1xuXG4gIC8vIEluZGV4ZXMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiwgc2ltaWxhciB0byBgZ3JvdXBCeWAsIGJ1dCBmb3JcbiAgLy8gd2hlbiB5b3Uga25vdyB0aGF0IHlvdXIgaW5kZXggdmFsdWVzIHdpbGwgYmUgdW5pcXVlLlxuICBfLmluZGV4QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICB9KTtcblxuICAvLyBDb3VudHMgaW5zdGFuY2VzIG9mIGFuIG9iamVjdCB0aGF0IGdyb3VwIGJ5IGEgY2VydGFpbiBjcml0ZXJpb24uIFBhc3NcbiAgLy8gZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZSB0byBjb3VudCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlXG4gIC8vIGNyaXRlcmlvbi5cbiAgXy5jb3VudEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgaWYgKF8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0rKzsgZWxzZSByZXN1bHRba2V5XSA9IDE7XG4gIH0pO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdGVlKG9iaik7XG4gICAgdmFyIGxvdyA9IDAsIGhpZ2ggPSBhcnJheS5sZW5ndGg7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSBsb3cgKyBoaWdoID4+PiAxO1xuICAgICAgaWYgKGl0ZXJhdGVlKGFycmF5W21pZF0pIDwgdmFsdWUpIGxvdyA9IG1pZCArIDE7IGVsc2UgaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBTYWZlbHkgY3JlYXRlIGEgcmVhbCwgbGl2ZSBhcnJheSBmcm9tIGFueXRoaW5nIGl0ZXJhYmxlLlxuICBfLnRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkgcmV0dXJuIHNsaWNlLmNhbGwob2JqKTtcbiAgICBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gb2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGggPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIFNwbGl0IGEgY29sbGVjdGlvbiBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBwYXNzID0gW10sIGZhaWwgPSBbXTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmopIHtcbiAgICAgIChwcmVkaWNhdGUodmFsdWUsIGtleSwgb2JqKSA/IHBhc3MgOiBmYWlsKS5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW3Bhc3MsIGZhaWxdO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgaWYgKG4gPCAwKSByZXR1cm4gW107XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIG4pO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGxhc3QgZW50cnkgb2YgdGhlIGFycmF5LiBFc3BlY2lhbGx5IHVzZWZ1bCBvblxuICAvLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiBhbGwgdGhlIHZhbHVlcyBpblxuICAvLyB0aGUgYXJyYXksIGV4Y2x1ZGluZyB0aGUgbGFzdCBOLiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGhcbiAgLy8gYF8ubWFwYC5cbiAgXy5pbml0aWFsID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIChuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbikpKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgbGFzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIE1hdGgubWF4KGFycmF5Lmxlbmd0aCAtIG4sIDApKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKlxuICAvLyBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ucmVzdCA9IF8udGFpbCA9IF8uZHJvcCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbik7XG4gIH07XG5cbiAgLy8gVHJpbSBvdXQgYWxsIGZhbHN5IHZhbHVlcyBmcm9tIGFuIGFycmF5LlxuICBfLmNvbXBhY3QgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgXy5pZGVudGl0eSk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYSByZWN1cnNpdmUgYGZsYXR0ZW5gIGZ1bmN0aW9uLlxuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGlucHV0LCBzaGFsbG93LCBzdHJpY3QsIG91dHB1dCkge1xuICAgIGlmIChzaGFsbG93ICYmIF8uZXZlcnkoaW5wdXQsIF8uaXNBcnJheSkpIHtcbiAgICAgIHJldHVybiBjb25jYXQuYXBwbHkob3V0cHV0LCBpbnB1dCk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBpbnB1dC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gaW5wdXRbaV07XG4gICAgICBpZiAoIV8uaXNBcnJheSh2YWx1ZSkgJiYgIV8uaXNBcmd1bWVudHModmFsdWUpKSB7XG4gICAgICAgIGlmICghc3RyaWN0KSBvdXRwdXQucHVzaCh2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHNoYWxsb3cpIHtcbiAgICAgICAgcHVzaC5hcHBseShvdXRwdXQsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICAvLyBGbGF0dGVuIG91dCBhbiBhcnJheSwgZWl0aGVyIHJlY3Vyc2l2ZWx5IChieSBkZWZhdWx0KSwgb3IganVzdCBvbmUgbGV2ZWwuXG4gIF8uZmxhdHRlbiA9IGZ1bmN0aW9uKGFycmF5LCBzaGFsbG93KSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4oYXJyYXksIHNoYWxsb3csIGZhbHNlLCBbXSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gW107XG4gICAgaWYgKCFfLmlzQm9vbGVhbihpc1NvcnRlZCkpIHtcbiAgICAgIGNvbnRleHQgPSBpdGVyYXRlZTtcbiAgICAgIGl0ZXJhdGVlID0gaXNTb3J0ZWQ7XG4gICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXRlcmF0ZWUgIT0gbnVsbCkgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldO1xuICAgICAgaWYgKGlzU29ydGVkKSB7XG4gICAgICAgIGlmICghaSB8fCBzZWVuICE9PSB2YWx1ZSkgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICBzZWVuID0gdmFsdWU7XG4gICAgICB9IGVsc2UgaWYgKGl0ZXJhdGVlKSB7XG4gICAgICAgIHZhciBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpLCBhcnJheSk7XG4gICAgICAgIGlmIChfLmluZGV4T2Yoc2VlbiwgY29tcHV0ZWQpIDwgMCkge1xuICAgICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKF8uaW5kZXhPZihyZXN1bHQsIHZhbHVlKSA8IDApIHtcbiAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxuICAvLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbiAgXy51bmlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuaXEoZmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUsIFtdKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiBbXTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGFyZ3NMZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICAgIGlmIChfLmNvbnRhaW5zKHJlc3VsdCwgaXRlbSkpIGNvbnRpbnVlO1xuICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBhcmdzTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKGFyZ3VtZW50c1tqXSwgaXRlbSkpIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGogPT09IGFyZ3NMZW5ndGgpIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFRha2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvbmUgYXJyYXkgYW5kIGEgbnVtYmVyIG9mIG90aGVyIGFycmF5cy5cbiAgLy8gT25seSB0aGUgZWxlbWVudHMgcHJlc2VudCBpbiBqdXN0IHRoZSBmaXJzdCBhcnJheSB3aWxsIHJlbWFpbi5cbiAgXy5kaWZmZXJlbmNlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IGZsYXR0ZW4oc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCB0cnVlLCB0cnVlLCBbXSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICByZXR1cm4gIV8uY29udGFpbnMocmVzdCwgdmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIHZhciBsZW5ndGggPSBfLm1heChhcmd1bWVudHMsICdsZW5ndGgnKS5sZW5ndGg7XG4gICAgdmFyIHJlc3VsdHMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdHNbaV0gPSBfLnBsdWNrKGFyZ3VtZW50cywgaSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENvbnZlcnRzIGxpc3RzIGludG8gb2JqZWN0cy4gUGFzcyBlaXRoZXIgYSBzaW5nbGUgYXJyYXkgb2YgYFtrZXksIHZhbHVlXWBcbiAgLy8gcGFpcnMsIG9yIHR3byBwYXJhbGxlbCBhcnJheXMgb2YgdGhlIHNhbWUgbGVuZ3RoIC0tIG9uZSBvZiBrZXlzLCBhbmQgb25lIG9mXG4gIC8vIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgXy5vYmplY3QgPSBmdW5jdGlvbihsaXN0LCB2YWx1ZXMpIHtcbiAgICBpZiAobGlzdCA9PSBudWxsKSByZXR1cm4ge307XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhbiBpdGVtIGluIGFuIGFycmF5LFxuICAvLyBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcbiAgLy8gZm9yICoqaXNTb3J0ZWQqKiB0byB1c2UgYmluYXJ5IHNlYXJjaC5cbiAgXy5pbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGlzU29ydGVkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNTb3J0ZWQgPT0gJ251bWJlcicpIHtcbiAgICAgICAgaSA9IGlzU29ydGVkIDwgMCA/IE1hdGgubWF4KDAsIGxlbmd0aCArIGlzU29ydGVkKSA6IGlzU29ydGVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSA9IF8uc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgICByZXR1cm4gYXJyYXlbaV0gPT09IGl0ZW0gPyBpIDogLTE7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIF8ubGFzdEluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgZnJvbSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGlkeCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAodHlwZW9mIGZyb20gPT0gJ251bWJlcicpIHtcbiAgICAgIGlkeCA9IGZyb20gPCAwID8gaWR4ICsgZnJvbSArIDEgOiBNYXRoLm1pbihpZHgsIGZyb20gKyAxKTtcbiAgICB9XG4gICAgd2hpbGUgKC0taWR4ID49IDApIGlmIChhcnJheVtpZHhdID09PSBpdGVtKSByZXR1cm4gaWR4O1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgcmFuZ2UgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyBpZHgrKywgc3RhcnQgKz0gc3RlcCkge1xuICAgICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldXNhYmxlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciBwcm90b3R5cGUgc2V0dGluZy5cbiAgdmFyIEN0b3IgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4gIC8vIG9wdGlvbmFsbHkpLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgRnVuY3Rpb24uYmluZGAgaWZcbiAgLy8gYXZhaWxhYmxlLlxuICBfLmJpbmQgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MsIGJvdW5kO1xuICAgIGlmIChuYXRpdmVCaW5kICYmIGZ1bmMuYmluZCA9PT0gbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmdW5jKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQmluZCBtdXN0IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uJyk7XG4gICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSkgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICBDdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIHNlbGYgPSBuZXcgQ3RvcjtcbiAgICAgIEN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHNlbGYsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgaWYgKF8uaXNPYmplY3QocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH07XG4gICAgcmV0dXJuIGJvdW5kO1xuICB9O1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xuICAvLyBhcyBhIHBsYWNlaG9sZGVyLCBhbGxvd2luZyBhbnkgY29tYmluYXRpb24gb2YgYXJndW1lbnRzIHRvIGJlIHByZS1maWxsZWQuXG4gIF8ucGFydGlhbCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgYm91bmRBcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IDA7XG4gICAgICB2YXIgYXJncyA9IGJvdW5kQXJncy5zbGljZSgpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyZ3MubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3NbaV0gPT09IF8pIGFyZ3NbaV0gPSBhcmd1bWVudHNbcG9zaXRpb24rK107XG4gICAgICB9XG4gICAgICB3aGlsZSAocG9zaXRpb24gPCBhcmd1bWVudHMubGVuZ3RoKSBhcmdzLnB1c2goYXJndW1lbnRzW3Bvc2l0aW9uKytdKTtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQmluZCBhIG51bWJlciBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBSZW1haW5pbmcgYXJndW1lbnRzXG4gIC8vIGFyZSB0aGUgbWV0aG9kIG5hbWVzIHRvIGJlIGJvdW5kLiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXQgYWxsIGNhbGxiYWNrc1xuICAvLyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBpLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLCBrZXk7XG4gICAgaWYgKGxlbmd0aCA8PSAxKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBbGwgbXVzdCBiZSBwYXNzZWQgZnVuY3Rpb24gbmFtZXMnKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIG9ialtrZXldID0gXy5iaW5kKG9ialtrZXldLCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIE1lbW9pemUgYW4gZXhwZW5zaXZlIGZ1bmN0aW9uIGJ5IHN0b3JpbmcgaXRzIHJlc3VsdHMuXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xuICAgIHZhciBtZW1vaXplID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgY2FjaGUgPSBtZW1vaXplLmNhY2hlO1xuICAgICAgdmFyIGFkZHJlc3MgPSBoYXNoZXIgPyBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IGtleTtcbiAgICAgIGlmICghXy5oYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjYWNoZVthZGRyZXNzXTtcbiAgICB9O1xuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gbWVtb2l6ZTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgcmV0dXJuIF8uZGVsYXkuYXBwbHkoXywgW2Z1bmMsIDFdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBhdCBtb3N0IG9uY2VcbiAgLy8gZHVyaW5nIGEgZ2l2ZW4gd2luZG93IG9mIHRpbWUuIE5vcm1hbGx5LCB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHdpbGwgcnVuXG4gIC8vIGFzIG11Y2ggYXMgaXQgY2FuLCB3aXRob3V0IGV2ZXIgZ29pbmcgbW9yZSB0aGFuIG9uY2UgcGVyIGB3YWl0YCBkdXJhdGlvbjtcbiAgLy8gYnV0IGlmIHlvdSdkIGxpa2UgdG8gZGlzYWJsZSB0aGUgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2UsIHBhc3NcbiAgLy8gYHtsZWFkaW5nOiBmYWxzZX1gLiBUbyBkaXNhYmxlIGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSwgZGl0dG8uXG4gIF8udGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gICAgdmFyIGNvbnRleHQsIGFyZ3MsIHJlc3VsdDtcbiAgICB2YXIgdGltZW91dCA9IG51bGw7XG4gICAgdmFyIHByZXZpb3VzID0gMDtcbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbm93ID0gXy5ub3coKTtcbiAgICAgIGlmICghcHJldmlvdXMgJiYgb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSkgcHJldmlvdXMgPSBub3c7XG4gICAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChub3cgLSBwcmV2aW91cyk7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBpZiAocmVtYWluaW5nIDw9IDAgfHwgcmVtYWluaW5nID4gd2FpdCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCBhcmdzLCBjb250ZXh0LCB0aW1lc3RhbXAsIHJlc3VsdDtcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3QgPSBfLm5vdygpIC0gdGltZXN0YW1wO1xuXG4gICAgICBpZiAobGFzdCA8IHdhaXQgJiYgbGFzdCA+IDApIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdGltZXN0YW1wID0gXy5ub3coKTtcbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgaWYgKCF0aW1lb3V0KSB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICBpZiAoY2FsbE5vdykge1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIF8ucGFydGlhbCh3cmFwcGVyLCBmdW5jKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgbmVnYXRlZCB2ZXJzaW9uIG9mIHRoZSBwYXNzZWQtaW4gcHJlZGljYXRlLlxuICBfLm5lZ2F0ZSA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhcHJlZGljYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICB2YXIgc3RhcnQgPSBhcmdzLmxlbmd0aCAtIDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSBzdGFydDtcbiAgICAgIHZhciByZXN1bHQgPSBhcmdzW3N0YXJ0XS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgd2hpbGUgKGktLSkgcmVzdWx0ID0gYXJnc1tpXS5jYWxsKHRoaXMsIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIGFmdGVyIGJlaW5nIGNhbGxlZCBOIHRpbWVzLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBiZWZvcmUgYmVpbmcgY2FsbGVkIE4gdGltZXMuXG4gIF8uYmVmb3JlID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICB2YXIgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA+IDApIHtcbiAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gXy5wYXJ0aWFsKF8uYmVmb3JlLCAyKTtcblxuICAvLyBPYmplY3QgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYE9iamVjdC5rZXlzYFxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBDb252ZXJ0IGFuIG9iamVjdCBpbnRvIGEgbGlzdCBvZiBgW2tleSwgdmFsdWVdYCBwYWlycy5cbiAgXy5wYWlycyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciBwYWlycyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcGFpcnNbaV0gPSBba2V5c1tpXSwgb2JqW2tleXNbaV1dXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xuICB9O1xuXG4gIC8vIEludmVydCB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gVGhlIHZhbHVlcyBtdXN0IGJlIHNlcmlhbGl6YWJsZS5cbiAgXy5pbnZlcnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W29ialtrZXlzW2ldXV0gPSBrZXlzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHNvcnRlZCBsaXN0IG9mIHRoZSBmdW5jdGlvbiBuYW1lcyBhdmFpbGFibGUgb24gdGhlIG9iamVjdC5cbiAgLy8gQWxpYXNlZCBhcyBgbWV0aG9kc2BcbiAgXy5mdW5jdGlvbnMgPSBfLm1ldGhvZHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgbmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG9ialtrZXldKSkgbmFtZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXMuc29ydCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBhIGdpdmVuIG9iamVjdCB3aXRoIGFsbCB0aGUgcHJvcGVydGllcyBpbiBwYXNzZWQtaW4gb2JqZWN0KHMpLlxuICBfLmV4dGVuZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHZhciBzb3VyY2UsIHByb3A7XG4gICAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgZm9yIChwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIHByb3ApKSB7XG4gICAgICAgICAgICBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgb25seSBjb250YWluaW5nIHRoZSB3aGl0ZWxpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLnBpY2sgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9LCBrZXk7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIGZvciAoa2V5IGluIG9iaikge1xuICAgICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgICAgaWYgKGl0ZXJhdGVlKHZhbHVlLCBrZXksIG9iaikpIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KFtdLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgb2JqID0gbmV3IE9iamVjdChvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmopIHJlc3VsdFtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5uZWdhdGUoaXRlcmF0ZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ubWFwKGNvbmNhdC5hcHBseShbXSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSwgU3RyaW5nKTtcbiAgICAgIGl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICByZXR1cm4gIV8uY29udGFpbnMoa2V5cywga2V5KTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBfLnBpY2sob2JqLCBpdGVyYXRlZSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICBpZiAob2JqW3Byb3BdID09PSB2b2lkIDApIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09PSAxIC8gYjtcbiAgICAvLyBBIHN0cmljdCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGBudWxsID09IHVuZGVmaW5lZGAuXG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHJldHVybiBhID09PSBiO1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT09IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgLy8gU3RyaW5ncywgbnVtYmVycywgcmVndWxhciBleHByZXNzaW9ucywgZGF0ZXMsIGFuZCBib29sZWFucyBhcmUgY29tcGFyZWQgYnkgdmFsdWUuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgLy8gUmVnRXhwcyBhcmUgY29lcmNlZCB0byBzdHJpbmdzIGZvciBjb21wYXJpc29uIChOb3RlOiAnJyArIC9hL2kgPT09ICcvYS9pJylcbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuICcnICsgYSA9PT0gJycgKyBiO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS5cbiAgICAgICAgLy8gT2JqZWN0KE5hTikgaXMgZXF1aXZhbGVudCB0byBOYU5cbiAgICAgICAgaWYgKCthICE9PSArYSkgcmV0dXJuICtiICE9PSArYjtcbiAgICAgICAgLy8gQW4gYGVnYWxgIGNvbXBhcmlzb24gaXMgcGVyZm9ybWVkIGZvciBvdGhlciBudW1lcmljIHZhbHVlcy5cbiAgICAgICAgcmV0dXJuICthID09PSAwID8gMSAvICthID09PSAxIC8gYiA6ICthID09PSArYjtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PT0gK2I7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcbiAgICAvLyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLCBhYnN0cmFjdCBvcGVyYXRpb24gYEpPYC5cbiAgICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxuICAgICAgaWYgKGFTdGFja1tsZW5ndGhdID09PSBhKSByZXR1cm4gYlN0YWNrW2xlbmd0aF0gPT09IGI7XG4gICAgfVxuICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3Rgc1xuICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgIGlmIChcbiAgICAgIGFDdG9yICE9PSBiQ3RvciAmJlxuICAgICAgLy8gSGFuZGxlIE9iamVjdC5jcmVhdGUoeCkgY2FzZXNcbiAgICAgICdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIgJiZcbiAgICAgICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiBhQ3RvciBpbnN0YW5jZW9mIGFDdG9yICYmXG4gICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcilcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gQWRkIHRoZSBmaXJzdCBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wdXNoKGEpO1xuICAgIGJTdGFjay5wdXNoKGIpO1xuICAgIHZhciBzaXplLCByZXN1bHQ7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGNsYXNzTmFtZSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgLy8gQ29tcGFyZSBhcnJheSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkuXG4gICAgICBzaXplID0gYS5sZW5ndGg7XG4gICAgICByZXN1bHQgPSBzaXplID09PSBiLmxlbmd0aDtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgICAgIGlmICghKHJlc3VsdCA9IGVxKGFbc2l6ZV0sIGJbc2l6ZV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgdmFyIGtleXMgPSBfLmtleXMoYSksIGtleTtcbiAgICAgIHNpemUgPSBrZXlzLmxlbmd0aDtcbiAgICAgIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzIGJlZm9yZSBjb21wYXJpbmcgZGVlcCBlcXVhbGl0eS5cbiAgICAgIHJlc3VsdCA9IF8ua2V5cyhiKS5sZW5ndGggPT09IHNpemU7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIHdoaWxlIChzaXplLS0pIHtcbiAgICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXJcbiAgICAgICAgICBrZXkgPSBrZXlzW3NpemVdO1xuICAgICAgICAgIGlmICghKHJlc3VsdCA9IF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3Qgb2JqZWN0IGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wb3AoKTtcbiAgICBiU3RhY2sucG9wKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiLCBbXSwgW10pO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikgfHwgXy5pc0FyZ3VtZW50cyhvYmopKSByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAuXG4gIF8uZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSksIHdoZXJlXG4gIC8vIHRoZXJlIGlzbid0IGFueSBpbnNwZWN0YWJsZSBcIkFyZ3VtZW50c1wiIHR5cGUuXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gICAgXy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIF8uaGFzKG9iaiwgJ2NhbGxlZScpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuIFdvcmsgYXJvdW5kIGFuIElFIDExIGJ1Zy5cbiAgaWYgKHR5cGVvZiAvLi8gIT09ICdmdW5jdGlvbicpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdmdW5jdGlvbicgfHwgZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xuICB9O1xuXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cbiAgXy5pc05hTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzTnVtYmVyKG9iaikgJiYgb2JqICE9PSArb2JqO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gb2JqICE9IG51bGwgJiYgaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG4gIH07XG5cbiAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gVW5kZXJzY29yZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgX2AgdmFyaWFibGUgdG8gaXRzXG4gIC8vIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5fID0gcHJldmlvdXNVbmRlcnNjb3JlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRlZXMuXG4gIF8uaWRlbnRpdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBfLmNvbnN0YW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfTtcblxuICBfLm5vb3AgPSBmdW5jdGlvbigpe307XG5cbiAgXy5wcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBwcmVkaWNhdGUgZm9yIGNoZWNraW5nIHdoZXRoZXIgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHNldCBvZiBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5tYXRjaGVzID0gZnVuY3Rpb24oYXR0cnMpIHtcbiAgICB2YXIgcGFpcnMgPSBfLnBhaXJzKGF0dHJzKSwgbGVuZ3RoID0gcGFpcnMubGVuZ3RoO1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuICFsZW5ndGg7XG4gICAgICBvYmogPSBuZXcgT2JqZWN0KG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwYWlyID0gcGFpcnNbaV0sIGtleSA9IHBhaXJbMF07XG4gICAgICAgIGlmIChwYWlyWzFdICE9PSBvYmpba2V5XSB8fCAhKGtleSBpbiBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJ1biBhIGZ1bmN0aW9uICoqbioqIHRpbWVzLlxuICBfLnRpbWVzID0gZnVuY3Rpb24obiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgYWNjdW0gPSBBcnJheShNYXRoLm1heCgwLCBuKSk7XG4gICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIGFjY3VtW2ldID0gaXRlcmF0ZWUoaSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXG4gIF8ucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICB9O1xuXG4gIC8vIEEgKHBvc3NpYmx5IGZhc3Rlcikgd2F5IHRvIGdldCB0aGUgY3VycmVudCB0aW1lc3RhbXAgYXMgYW4gaW50ZWdlci5cbiAgXy5ub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH07XG5cbiAgIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlc2NhcGVNYXAgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgICAnYCc6ICcmI3g2MDsnXG4gIH07XG4gIHZhciB1bmVzY2FwZU1hcCA9IF8uaW52ZXJ0KGVzY2FwZU1hcCk7XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICB2YXIgY3JlYXRlRXNjYXBlciA9IGZ1bmN0aW9uKG1hcCkge1xuICAgIHZhciBlc2NhcGVyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHJldHVybiBtYXBbbWF0Y2hdO1xuICAgIH07XG4gICAgLy8gUmVnZXhlcyBmb3IgaWRlbnRpZnlpbmcgYSBrZXkgdGhhdCBuZWVkcyB0byBiZSBlc2NhcGVkXG4gICAgdmFyIHNvdXJjZSA9ICcoPzonICsgXy5rZXlzKG1hcCkuam9pbignfCcpICsgJyknO1xuICAgIHZhciB0ZXN0UmVnZXhwID0gUmVnRXhwKHNvdXJjZSk7XG4gICAgdmFyIHJlcGxhY2VSZWdleHAgPSBSZWdFeHAoc291cmNlLCAnZycpO1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHN0cmluZyA9IHN0cmluZyA9PSBudWxsID8gJycgOiAnJyArIHN0cmluZztcbiAgICAgIHJldHVybiB0ZXN0UmVnZXhwLnRlc3Qoc3RyaW5nKSA/IHN0cmluZy5yZXBsYWNlKHJlcGxhY2VSZWdleHAsIGVzY2FwZXIpIDogc3RyaW5nO1xuICAgIH07XG4gIH07XG4gIF8uZXNjYXBlID0gY3JlYXRlRXNjYXBlcihlc2NhcGVNYXApO1xuICBfLnVuZXNjYXBlID0gY3JlYXRlRXNjYXBlcih1bmVzY2FwZU1hcCk7XG5cbiAgLy8gSWYgdGhlIHZhbHVlIG9mIHRoZSBuYW1lZCBgcHJvcGVydHlgIGlzIGEgZnVuY3Rpb24gdGhlbiBpbnZva2UgaXQgd2l0aCB0aGVcbiAgLy8gYG9iamVjdGAgYXMgY29udGV4dDsgb3RoZXJ3aXNlLCByZXR1cm4gaXQuXG4gIF8ucmVzdWx0ID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuICAgIHJldHVybiBfLmlzRnVuY3Rpb24odmFsdWUpID8gb2JqZWN0W3Byb3BlcnR5XSgpIDogdmFsdWU7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgaW50ZWdlciBpZCAodW5pcXVlIHdpdGhpbiB0aGUgZW50aXJlIGNsaWVudCBzZXNzaW9uKS5cbiAgLy8gVXNlZnVsIGZvciB0ZW1wb3JhcnkgRE9NIGlkcy5cbiAgdmFyIGlkQ291bnRlciA9IDA7XG4gIF8udW5pcXVlSWQgPSBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xuICB9O1xuXG4gIC8vIEJ5IGRlZmF1bHQsIFVuZGVyc2NvcmUgdXNlcyBFUkItc3R5bGUgdGVtcGxhdGUgZGVsaW1pdGVycywgY2hhbmdlIHRoZVxuICAvLyBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICBldmFsdWF0ZSAgICA6IC88JShbXFxzXFxTXSs/KSU+L2csXG4gICAgaW50ZXJwb2xhdGUgOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGUgICAgICA6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6ICAgICAgXCInXCIsXG4gICAgJ1xcXFwnOiAgICAgJ1xcXFwnLFxuICAgICdcXHInOiAgICAgJ3InLFxuICAgICdcXG4nOiAgICAgJ24nLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICB2YXIgZXNjYXBlciA9IC9cXFxcfCd8XFxyfFxcbnxcXHUyMDI4fFxcdTIwMjkvZztcblxuICB2YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdO1xuICB9O1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIC8vIE5COiBgb2xkU2V0dGluZ3NgIG9ubHkgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIHNldHRpbmdzLCBvbGRTZXR0aW5ncykge1xuICAgIGlmICghc2V0dGluZ3MgJiYgb2xkU2V0dGluZ3MpIHNldHRpbmdzID0gb2xkU2V0dGluZ3M7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKGVzY2FwZXIsIGVzY2FwZUNoYXIpO1xuICAgICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG5cbiAgICAgIGlmIChlc2NhcGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBlc2NhcGUgKyBcIikpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoaW50ZXJwb2xhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBpbnRlcnBvbGF0ZSArIFwiKSk9PW51bGw/Jyc6X190KStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGV2YWx1YXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZSArIFwiXFxuX19wKz0nXCI7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkb2JlIFZNcyBuZWVkIHRoZSBtYXRjaCByZXR1cm5lZCB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IG9mZmVzdC5cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcbiAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gICAgLy8gSWYgYSB2YXJpYWJsZSBpcyBub3Qgc3BlY2lmaWVkLCBwbGFjZSBkYXRhIHZhbHVlcyBpbiBsb2NhbCBzY29wZS5cbiAgICBpZiAoIXNldHRpbmdzLnZhcmlhYmxlKSBzb3VyY2UgPSAnd2l0aChvYmp8fHt9KXtcXG4nICsgc291cmNlICsgJ31cXG4nO1xuXG4gICAgc291cmNlID0gXCJ2YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4sXCIgK1xuICAgICAgXCJwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xcblwiICtcbiAgICAgIHNvdXJjZSArICdyZXR1cm4gX19wO1xcbic7XG5cbiAgICB0cnkge1xuICAgICAgdmFyIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB2YXIgYXJndW1lbnQgPSBzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJztcbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIGFyZ3VtZW50ICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24uIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBpbnN0YW5jZSA9IF8ob2JqKTtcbiAgICBpbnN0YW5jZS5fY2hhaW4gPSB0cnVlO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgcmVzdWx0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgXy5lYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBmdW5jLmFwcGx5KF8sIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICBfLm1peGluKF8pO1xuXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndW5zaGlmdCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvYmogPSB0aGlzLl93cmFwcGVkO1xuICAgICAgbWV0aG9kLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICAgIGlmICgobmFtZSA9PT0gJ3NoaWZ0JyB8fCBuYW1lID09PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBvYmopO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEFkZCBhbGwgYWNjZXNzb3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gIF8ucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gIH07XG5cbiAgLy8gQU1EIHJlZ2lzdHJhdGlvbiBoYXBwZW5zIGF0IHRoZSBlbmQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBBTUQgbG9hZGVyc1xuICAvLyB0aGF0IG1heSBub3QgZW5mb3JjZSBuZXh0LXR1cm4gc2VtYW50aWNzIG9uIG1vZHVsZXMuIEV2ZW4gdGhvdWdoIGdlbmVyYWxcbiAgLy8gcHJhY3RpY2UgZm9yIEFNRCByZWdpc3RyYXRpb24gaXMgdG8gYmUgYW5vbnltb3VzLCB1bmRlcnNjb3JlIHJlZ2lzdGVyc1xuICAvLyBhcyBhIG5hbWVkIG1vZHVsZSBiZWNhdXNlLCBsaWtlIGpRdWVyeSwgaXQgaXMgYSBiYXNlIGxpYnJhcnkgdGhhdCBpc1xuICAvLyBwb3B1bGFyIGVub3VnaCB0byBiZSBidW5kbGVkIGluIGEgdGhpcmQgcGFydHkgbGliLCBidXQgbm90IGJlIHBhcnQgb2ZcbiAgLy8gYW4gQU1EIGxvYWQgcmVxdWVzdC4gVGhvc2UgY2FzZXMgY291bGQgZ2VuZXJhdGUgYW4gZXJyb3Igd2hlbiBhblxuICAvLyBhbm9ueW1vdXMgZGVmaW5lKCkgaXMgY2FsbGVkIG91dHNpZGUgb2YgYSBsb2FkZXIgcmVxdWVzdC5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZSgndW5kZXJzY29yZScsIFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfO1xuICAgIH0pO1xuICB9XG59LmNhbGwodGhpcykpO1xuIl19
