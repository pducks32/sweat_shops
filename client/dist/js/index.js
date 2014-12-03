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

window.player = new Player(parseURLParams(document.location.search).name[0]);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL1BEVUNLUy9EZXNrdG9wL1JlbGlnaW9uL2NsaWVudC9zcmMvY29mZmVlL2luZGV4LmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvYm94LmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvYnVja2V0LmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvY29udmV5b3JfYmVsdC5jb2ZmZWUiLCIvVXNlcnMvUERVQ0tTL0Rlc2t0b3AvUmVsaWdpb24vY2xpZW50L3NyYy9jb2ZmZWUvbW9kZWxzL2l0ZW0uY29mZmVlIiwiL1VzZXJzL1BEVUNLUy9EZXNrdG9wL1JlbGlnaW9uL2NsaWVudC9zcmMvY29mZmVlL21vZGVscy9ub3RpZmljYXRpb25fY2VudGVyLmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvcGxheWVyLmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvc3RhdGlvbi5jb2ZmZWUiLCIvVXNlcnMvUERVQ0tTL0Rlc2t0b3AvUmVsaWdpb24vY2xpZW50L3NyYy9jb2ZmZWUvbW9kZWxzL3N0b3JlLmNvZmZlZSIsIi9Vc2Vycy9QRFVDS1MvRGVza3RvcC9SZWxpZ2lvbi9jbGllbnQvc3JjL2NvZmZlZS9tb2RlbHMvdHJhbnNhY3Rpb24uY29mZmVlIiwiL1VzZXJzL1BEVUNLUy9EZXNrdG9wL1JlbGlnaW9uL25vZGVfbW9kdWxlcy91bmRl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QztLQURLO0VBQUEsQ0FQUCxDQUFBOztxQkFBQTs7SUFGRixDQUFBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIl8gPSByZXF1aXJlIFwidW5kZXJzY29yZVwiXG57Qm94fSA9IHJlcXVpcmUgXCIuL21vZGVscy9ib3hcIlxue0J1Y2tldH0gPSByZXF1aXJlIFwiLi9tb2RlbHMvYnVja2V0XCJcbntDb252ZXlvckJlbHR9ID0gcmVxdWlyZSBcIi4vbW9kZWxzL2NvbnZleW9yX2JlbHRcIlxue0l0ZW19ID0gcmVxdWlyZSBcIi4vbW9kZWxzL2l0ZW1cIlxue1BsYXllcn0gPSByZXF1aXJlIFwiLi9tb2RlbHMvcGxheWVyXCJcbndpbmRvdy5TdGF0aW9uID0gcmVxdWlyZShcIi4vbW9kZWxzL3N0YXRpb25cIikuU3RhdGlvblxud2luZG93LlN0b3JlID0gcmVxdWlyZShcIi4vbW9kZWxzL3N0b3JlXCIpLlN0b3JlXG57VHJhbnNhY3Rpb259ID0gcmVxdWlyZSBcIi4vbW9kZWxzL3RyYW5zYWN0aW9uXCJcbndpbmRvdy5Ob3RpZmljYXRpb25DZW50ZXIgPSByZXF1aXJlKFwiLi9tb2RlbHMvbm90aWZpY2F0aW9uX2NlbnRlclwiKS5Ob3RpZmljYXRpb25DZW50ZXJcblxuYFxuZnVuY3Rpb24gcGFyc2VVUkxQYXJhbXModXJsKSB7XG4gICAgdmFyIHF1ZXJ5U3RhcnQgPSB1cmwuaW5kZXhPZihcIj9cIikgKyAxLFxuICAgICAgICBxdWVyeUVuZCAgID0gdXJsLmluZGV4T2YoXCIjXCIpICsgMSB8fCB1cmwubGVuZ3RoICsgMSxcbiAgICAgICAgcXVlcnkgPSB1cmwuc2xpY2UocXVlcnlTdGFydCwgcXVlcnlFbmQgLSAxKSxcbiAgICAgICAgcGFpcnMgPSBxdWVyeS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpLnNwbGl0KFwiJlwiKSxcbiAgICAgICAgcGFybXMgPSB7fSwgaSwgbiwgdiwgbnY7XG5cbiAgICBpZiAocXVlcnkgPT09IHVybCB8fCBxdWVyeSA9PT0gXCJcIikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG52ID0gcGFpcnNbaV0uc3BsaXQoXCI9XCIpO1xuICAgICAgICBuID0gZGVjb2RlVVJJQ29tcG9uZW50KG52WzBdKTtcbiAgICAgICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudChudlsxXSk7XG5cbiAgICAgICAgaWYgKCFwYXJtcy5oYXNPd25Qcm9wZXJ0eShuKSkge1xuICAgICAgICAgICAgcGFybXNbbl0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcm1zW25dLnB1c2gobnYubGVuZ3RoID09PSAyID8gdiA6IG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gcGFybXM7XG59XG5gXG5cbndpbmRvdy5zb2NrZXQgPSBpbygpXG53aW5kb3cuYm94ZXMgPSBbXVxud2luZG93LmVuZXJneUludGVydmFsID0gc2V0SW50ZXJ2YWwoKC0+IHdpbmRvdy5wbGF5ZXIudXBkYXRlRW5lcmd5KC0wLjAxMykpLCA3NTApXG53aW5kb3cucGxheWVyID0gbmV3IFBsYXllciBwYXJzZVVSTFBhcmFtcyhkb2N1bWVudC5sb2NhdGlvbi5zZWFyY2gpLm5hbWVbMF1cbndpbmRvdy5TdGF0aW9uLmZpcmUgXCJuZXdQbGF5ZXJcIlxud2luZG93LnBsYXllci5yZW5kZXIoKVxud2luZG93LkdhbWVPdmVyRmllbGQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLkdhbWVPdmVyXCIpXG53aW5kb3cuR2FtZU92ZXJUaXRsZUZpZWxkID0gd2luZG93LkdhbWVPdmVyRmllbGQucXVlcnlTZWxlY3RvcihcIi5HYW1lT3Zlcl9fdGl0bGVcIilcbndpbmRvdy5HYW1lT3Zlck1lc3NhZ2VGaWVsZCA9IHdpbmRvdy5HYW1lT3ZlckZpZWxkLnF1ZXJ5U2VsZWN0b3IoXCIuR2FtZU92ZXJfX21lc3NhZ2VcIilcbndpbmRvdy5nYW1lT3ZlciA9ICh0aXRsZSwgbXNnKSAtPlxuICB3aW5kb3cuR2FtZU92ZXJUaXRsZUZpZWxkLmlubmVySFRNTCA9IHRpdGxlXG4gIHdpbmRvdy5HYW1lT3Zlck1lc3NhZ2VGaWVsZC5pbm5lckhUTUwgPSBtc2dcbiAgd2luZG93LkdhbWVPdmVyRmllbGQuc3R5bGUub3BhY2l0eSA9IDBcbiAgd2luZG93LkdhbWVPdmVyRmllbGQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIlxuICB3aW5kb3cuR2FtZU92ZXJGaWVsZC5zdHlsZS5vcGFjaXR5ID0gMVxuIyBTZXR1cCBQbGF5ZXIgQ291bnRcbndpbmRvdy5wbGF5ZXJDb3VudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgXCJzbWFsbC5wbGF5ZXJzIC5wbGF5ZXItY291bnRcIlxud2luZG93LmFsaXZlUGxheWVyQ291bnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIFwic21hbGwucGxheWVycyAuYWxpdmUtcGxheWVyLWNvdW50XCJcblxucmVkQnVja2V0ID0gbmV3IEJ1Y2tldCh7XG4gICAgICBjb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuQnVja2V0LS1yZWRcIiksXG4gICAgICBjb2xvcjogXCJyZWRcIixcbiAgICAgIH0pO1xuYmx1ZUJ1Y2tldCA9IG5ldyBCdWNrZXQoe1xuICAgICAgY29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLkJ1Y2tldC0tYmx1ZVwiKSxcbiAgICAgIGNvbG9yOiBcImJsdWVcIixcbiAgICAgIH0pO1xuZ3JlZW5CdWNrZXQgPSBuZXcgQnVja2V0KHtcbiAgICAgIGNvbnRhaW5lcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5CdWNrZXQtLWdyZWVuXCIpLFxuICAgICAgY29sb3I6IFwiZ3JlZW5cIixcbiAgICAgIH0pO1xueWVsbG93QnVja2V0ID0gbmV3IEJ1Y2tldCh7XG4gICAgICBjb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuQnVja2V0LS15ZWxsb3dcIiksXG4gICAgICBjb2xvcjogXCJ5ZWxsb3dcIixcbiAgICAgIH0pO1xud2luZG93LmJ1Y2tldHMgPSBbcmVkQnVja2V0LmRyYWdnaWUsIGJsdWVCdWNrZXQuZHJhZ2dpZSwgZ3JlZW5CdWNrZXQuZHJhZ2dpZSwgeWVsbG93QnVja2V0LmRyYWdnaWVdXG53aW5kb3cuYnVja2V0TGlzdCA9IFtyZWRCdWNrZXQsIGJsdWVCdWNrZXQsIGdyZWVuQnVja2V0LCB5ZWxsb3dCdWNrZXRdXG5cbiMgU2V0dXAgQm94ZXMuLi5GT1IgTk9XXG5fLmVhY2ggZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5Cb3gtLXJlZFwiKSwgc2V0dXBSZWRCb3ggPSAoZWxlbWVudCwgaW5kZXgsIGFycmF5KSA9PlxuICB3aW5kb3cuYm94ZXMucHVzaChuZXcgQm94IGVsZW1lbnQsIFwiY29sb3JcIilcbl8uZWFjaCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLkJveC0tYmx1ZVwiKSwgc2V0dXBCbHVlQm94ID0gKGVsZW1lbnQsIGluZGV4LCBhcnJheSkgPT5cbiAgd2luZG93LmJveGVzLnB1c2gobmV3IEJveCBlbGVtZW50LCBcImJsdWVcIilcbl8uZWFjaCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLkJveC0tZ3JlZW5cIiksIHNldHVwR3JlZW5Cb3ggPSAoZWxlbWVudCwgaW5kZXgsIGFycmF5KSA9PlxuICB3aW5kb3cuYm94ZXMucHVzaChuZXcgQm94IGVsZW1lbnQsIFwiZ3JlZW5cIilcbl8uZWFjaCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLkJveC0teWVsbG93XCIpLCBzZXR1cFllbGxvd0JveCA9IChlbGVtZW50LCBpbmRleCwgYXJyYXkpID0+XG4gIHdpbmRvdy5ib3hlcy5wdXNoKG5ldyBCb3ggZWxlbWVudCwgXCJ5ZWxsb3dcIilcblxuXG5cblxuXG5cblxuIyBTZXR1cCBTdG9yZVxuZm9vZEl0ZW0gPSBJdGVtLmZyb21TZWxlY3RvciBcIi5JdGVtLS1mb29kXCJcbndhdGVySXRlbSA9IEl0ZW0uZnJvbVNlbGVjdG9yIFwiLkl0ZW0tLXdhdGVyXCJcbmJyZWFrSXRlbSA9IEl0ZW0uZnJvbVNlbGVjdG9yIFwiLkl0ZW0tLWJyZWFrXCJcblN0b3JlLmFkZEl0ZW0gZm9vZEl0ZW1cblN0b3JlLmFkZEl0ZW0gd2F0ZXJJdGVtXG5TdG9yZS5hZGRJdGVtIGJyZWFrSXRlbVxuXG4jIFNldHVwIFZpc2FiaWxpdHlcbmlmIGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwidmlzaWJpbGl0eWNoYW5nZVwiLCAtPlxuICAgIHRvU3RhdGUgPSAhZG9jdW1lbnQuaGlkZGVuXG4gICAgZnJvbVN0YXRlID0gd2luZG93LnBsYXllci5pc1dhdGNoaW5nXG4gICAgd2luZG93LnBsYXllci5pc1dhdGNoaW5nID0gdG9TdGF0ZVxuICAgIFN0YXRpb24uZmlyZSBcInZpc2liaWxpdHlDaGFuZ2VcIiwgeyBmcm9tU3RhdGUsIHRvU3RhdGUgfVxuXG4jIFNldHVwIExpc3RlbmVyc1xud2luZG93LnNvY2tldC5vbiBcInBsYXllcklEXCIsIChkYXRhKSAtPlxuICB3aW5kb3cucGxheWVyLmlkID0gZGF0YS5pZFxud2luZG93LnNvY2tldC5vbiBcImFkZFBsYXllcnNcIiwgYWRkUGxheWVycyA9IChkYXRhKSAtPlxuICBhZGRQbGF5ZXIgPSAocGxheWVyKSAtPlxuICAgIE5vdGlmaWNhdGlvbkNlbnRlci5pbmZvIFwiI3twbGF5ZXIuZnVsbE5hbWV9IGhhcyBqb2luZWQuIFdvcmsgSGFyZGVyIVwiXG4gICAgaWYgTW9kZXJuaXpyLnNlc3Npb25zdG9yYWdlXG4gICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtIHBsYXllci5pZCwgcGxheWVyLmZ1bGxOYW1lXG4gIGFkZFBsYXllcihwbGF5ZXIpIGZvciBwbGF5ZXIgaW4gZGF0YS5wbGF5ZXJzXG4gIHVwZGF0ZVBsYXllckNvdW50KGRhdGEpXG5cbndpbmRvdy5zb2NrZXQub24gXCJyZW1vdmVQbGF5ZXJzXCIsIHJlbW92ZVBsYXllcnMgPSAoZGF0YSkgLT5cbiAgcmVtb3ZlUGxheWVyID0gKHBsYXllcikgLT5cbiAgICBpZiBNb2Rlcm5penIuc2Vzc2lvbnN0b3JhZ2VcbiAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0gcGxheWVyLmlkXG4gIHJlbW92ZVBsYXllcihwbGF5ZXIpIGZvciBwbGF5ZXIgaW4gZGF0YS5wbGF5ZXJzXG4gIHVwZGF0ZVBsYXllckNvdW50KGRhdGEpXG5cblxud2luZG93LnNvY2tldC5vbiBcInBsYXllckRpZWRcIiwgb25QbGF5ZXJEZWF0aCA9IChkYXRhKSAtPlxuICBwbGF5ZXIgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGRhdGEuaWQpXG4gIE5vdGlmaWNhdGlvbkNlbnRlci5pbmZvIFwiWW91ciBmcmllbmQgI3twbGF5ZXJ9IGhhcyBkaWVkLiBXb3JrIEhhcmRlciFcIiB1bmxlc3Mgd2luZG93LnBsYXllci5pZCBpcyBkYXRhLmlkXG4gIHVwZGF0ZVBsYXllckNvdW50IGRhdGFcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyIFwic3RvcmFnZVwiLCB1cGRhdGVQbGF5ZXJDb3VudFxuXG51cGRhdGVQbGF5ZXJDb3VudCA9IChkYXRhKSAtPlxuICB3aW5kb3cucGxheWVyQ291bnQuaW5uZXJIVE1MID0gXCIje2RhdGEucGxheWVyQ291bnQuYWxsfVwiXG4gIHdpbmRvdy5hbGl2ZVBsYXllckNvdW50LmlubmVySFRNTCA9IFwiI3tkYXRhLnBsYXllckNvdW50LmFyZUFsaXZlfVwiXG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyIFwidW5sb2FkXCIsIChldnQpIC0+XG4gIHNlc3Npb25TdG9yYWdlLmNsZWFyKClcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyIFwibG9hZFwiLCAoZXZ0KSAtPlxuICBzZXNzaW9uU3RvcmFnZS5jbGVhcigpXG4iLCJfID0gcmVxdWlyZSBcInVuZGVyc2NvcmVcIlxuZXhwb3J0cy5Cb3ggPVxuY2xhc3MgQm94XG4gIEBjb2xvcnM6IFtcInJlZFwiLCBcImJsdWVcIiwgXCJncmVlblwiLCBcInllbGxvd1wiXVxuICBAcmFuZG9tQ29sb3I6IC0+XG4gICAgXy5zYW1wbGUgQGNvbG9yc1xuICBAcmVuZGVyQ29sb3I6IChjb2xvcikgLT5cbiAgICBcIjxkaXYgY2xhc3M9XFxcIkJveCBCb3gtLSN7Y29sb3J9XFw+PC9kaXY+XCJcbiAgY29uc3RydWN0b3I6IChAZWxlbWVudCwgQGNvbG9yKSAtPlxuICAgIEBkcmFnZ2llID0gbmV3IERyYWdnYWJsZShAZWxlbWVudCwgd2luZG93LmJ1Y2tldHMsIHtcbiAgICAgIGRyYWdnYWJpbGl0eToge2NvbnRhaW5tZW50OiBcIiNzY2VuZVwifSxcbiAgICAgIHNjcm9sbDogZmFsc2UsXG4gICAgICBvblN0YXJ0OiA9PiBAb25EcmFnU3RhcnQoKSxcbiAgICAgIG9uRW5kOiAod2FzRHJvcHBlZCkgPT4gQG9uRHJhZ0VuZCh3YXNEcm9wcGVkKVxuICAgICAgfSlcbiAgb25EcmFnU3RhcnQ6IC0+XG4gICAgd2luZG93LmRyYWdnZWRCb3ggPSB0aGlzXG4gICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIkJveC0tZHJhZ2dpbmdcIilcbiAgICAjJGNvbnZleW9yQmVsdC5oaWRlQm94ICRkcmFnZ2VkRWxlbWVudFxuICBvbkRyYWdFbmQ6ICh3YXNEcm9wcGVkKSAtPlxuICAgIEBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJCb3gtLWRyYWdnaW5nXCIpXG4gICAgaWYgd2FzRHJvcHBlZFxuICAgICAgQGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIkJveC0tI3tAY29sb3J9XCIpXG4gICAgICBAY29sb3IgPSBCb3gucmFuZG9tQ29sb3IoKVxuICAgICAgQGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIkJveC0tI3tAY29sb3J9XCIpXG4iLCJ7U3RhdGlvbn0gPSByZXF1aXJlIFwiLi9zdGF0aW9uXCJcbmV4cG9ydHMuQnVja2V0ID1cbmNsYXNzIEJ1Y2tldFxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMpIC0+XG4gICAge0Bjb250YWluZXIsIEBjb2xvciwgQHRvdGFsVmFsdWUsIEByZXF1aXJlZEFtb3VudH0gPSBvcHRpb25zXG4gICAgQHJlcXVpcmVkQW1vdW50IHx8PSAxMlxuICAgIEB0b3RhbFZhbHVlIHx8PSAwLjFcbiAgICBAZWxlbWVudCA9IEBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5CdWNrZXRfX0Ryb3Bab25lXCIpXG4gICAgQHRhbGx5RWxlbWVudCA9IEBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5CdWNrZXRfX1RhbGx5XCIpXG4gICAgQGRyYWdnaWUgPSBuZXcgRHJvcHBhYmxlKEBlbGVtZW50LCB7XG4gICAgICBvbkRyb3A6IChpbnN0YW5jZSwgZHJhZ2dhYmxlRWxlKSA9PlxuICAgICAgICBAb25Ecm9wKClcbiAgICAgIH0pXG4gIGN1cnJlbnRUYWxseTogMFxuICBvbjogKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlPWZhbHNlKSAtPlxuICAgIEBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpXG4gIHJlZ2lzdGVySGFuZGxlcnM6IC0+XG4gICAgQG9uKFwiZHJhZ2VudGVyXCIsIEBvbkRyYWdFbnRlcilcbiAgICBAb24oXCJkcmFnbGVhdmVcIiwgQG9uRHJhZ0xlYXZlKVxuICBvbkRyYWdFbnRlcjogKGUpIC0+XG4gICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZChcIkJ1Y2tldC0tZHJhZ292ZXJcIilcbiAgb25Ecm9wTGVhdmU6IChlKSAtPlxuICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoXCJCdWNrZXQtLWRyYWdvdmVyXCIpXG4gIG9uRHJvcDogLT5cbiAgICAjJGNvbnZleW9yQmVsdC5yZW1vdmVCb3ggJGRyYWdnZWRCb3hcbiAgICBpZiB3aW5kb3cuZHJhZ2dlZEJveC5jb2xvciA9PSBAY29sb3JcbiAgICAgIEBkcm9wU3VjY2Vzc2Z1bCgpXG4gICAgZWxzZVxuICAgICAgQGRyb3BGYWlsZWQoKVxuICBkcm9wU3VjY2Vzc2Z1bDogLT5cbiAgICBAdGFsbHlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wLS1zdWNjZXNzXCIpXG4gICAgQHRhbGx5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcC0tZmFpbHVyZVwiKVxuICAgIEBjdXJyZW50VGFsbHkrK1xuICAgIEB0YWxseUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyb3AtLXN1Y2Nlc3NcIilcbiAgICBAdXBkYXRlVGFsbHkoKVxuICAgIFN0YXRpb24uZmlyZSBcImNvcnJlY3RCb3hcIiwge1xuICAgICAgYm94OiBAY29sb3JcbiAgICB9XG5cbiAgZHJvcEZhaWxlZDogLT5cbiAgICBAdGFsbHlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkcm9wLS1zdWNjZXNzXCIpXG4gICAgQHRhbGx5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZHJvcC0tZmFpbHVyZVwiKVxuICAgIEBjdXJyZW50VGFsbHktLVxuICAgIEB0YWxseUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImRyb3AtLWZhaWx1cmVcIilcbiAgICBAdXBkYXRlVGFsbHkoKVxuICAgIFN0YXRpb24uZmlyZSBcIndyb25nQm94XCIsIHtcbiAgICAgIGJveDogQGNvbG9yXG4gICAgfVxuXG4gIHVwZGF0ZVRhbGx5OiAtPlxuICAgIGlmIEBpc0Z1bGwoKVxuICAgICAgU3RhdGlvbi5maXJlIFwiYnVja2V0RmlsbGVkXCJcbiAgICAgIEBlbXB0eSgpXG4gICAgICB3aW5kb3cucGxheWVyLnVwZGF0ZUJhbGFuY2UgQHRvdGFsVmFsdWVcbiAgICBuZXdUZXh0ID0gXCIje0BjdXJyZW50VGFsbHl9LyN7QHJlcXVpcmVkQW1vdW50fVwiXG4gICAgQHRhbGx5RWxlbWVudC5pbm5lckhUTUwgPSBuZXdUZXh0XG4gIGlzRnVsbDogLT5cbiAgICBAY3VycmVudFRhbGx5ID09IEByZXF1aXJlZEFtb3VudFxuICBlbXB0eTogLT5cbiAgICBAY3VycmVudFRhbGx5ID0gMFxuIiwiZXhwb3J0cy5Db252ZXlvckJlbHQgPVxuY2xhc3MgQ29udmV5b3JCZWx0XG4gIEBjb2xvcnM6IFtcInJlZFwiLCBcImJsdWVcIiwgXCJncmVlblwiLCBcInllbGxvd1wiXVxuICBAcmFuZG9tQ29sb3I6IC0+XG4gICAgXy5zYW1wbGUgQGNvbG9yc1xuICBjb25zdHJ1Y3RvcjogKEBlbGVtZW50KSAtPlxuICBib3hlczogW1tdXVxuICBhZGRCb3g6IChib3gpIC0+XG4gICAgQGJveGVzLnB1c2goYm94KVxuICBuZXdCb3g6IChjb2xvcj1AcmFuZG9tQ29sb3IpIC0+XG4gICAgYWRkQm94IEJveC5yZW5kZXJDb2xvcihjb2xvciksIChuZXcgQm94KGNvbG9yKSlcbiIsImV4cG9ydHMuSXRlbSA9XG5jbGFzcyBJdGVtXG4gIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBwcmljZSwgQGVuZXJneSwgQGVsZW1lbnQ9XCJcIikgLT5cbiAgICBAZWxlbWVudC5hZGRFdmVudExpc3RlbmVyIFwiY2xpY2tcIiwgKGV2dCkgPT4gU3RvcmUuYnV5IHRoaXNcbiAgQGZyb21FbGVtZW50OiAoZWxlbWVudCkgLT5cbiAgICBuYW1lID0gZWxlbWVudC5kYXRhc2V0Lm5hbWVcbiAgICBwcmljZSA9IHBhcnNlRmxvYXQgZWxlbWVudC5kYXRhc2V0LnByaWNlXG4gICAgZW5lcmd5R2FpbiA9IHBhcnNlRmxvYXQgZWxlbWVudC5kYXRhc2V0LmVuZXJneVxuICAgIG5ldyBJdGVtKG5hbWUsIHByaWNlLCBlbmVyZ3lHYWluLCBlbGVtZW50KVxuICBAZnJvbUlkOiAoaWQpIC0+XG4gICAgQGZyb21FbGVtZW50IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkIGlkXG4gIEBmcm9tU2VsZWN0b3I6IChzZWxlY3RvcikgLT5cbiAgICBAZnJvbUVsZW1lbnQgZG9jdW1lbnQucXVlcnlTZWxlY3RvciBzZWxlY3RvclxuIiwiTm90aWZpY2F0aW9uQ2VudGVyID0ge31cbk5vdGlmaWNhdGlvbkNlbnRlci5jb25ncmF0dWxhdGUgPSBodW1hbmUuc3Bhd24oeyBhZGRuQ2xzOiAnaHVtYW5lLWZsYXR0eS1zdWNjZXNzJywgdGltZW91dDogMTAwMCB9KVxuTm90aWZpY2F0aW9uQ2VudGVyLmVycm9yID0gaHVtYW5lLnNwYXduKHsgYWRkbkNsczogJ2h1bWFuZS1mbGF0dHktZXJyb3InLCB0aW1lb3V0OiAxMDAwIH0pXG5Ob3RpZmljYXRpb25DZW50ZXIuaW5mbyA9IGh1bWFuZS5zcGF3bih7IGFkZG5DbHM6ICdodW1hbmUtZmxhdHR5LWluZm8nLCB0aW1lb3V0OiA3NTAgfSlcbm1vZHVsZS5leHBvcnRzLk5vdGlmaWNhdGlvbkNlbnRlciA9IE5vdGlmaWNhdGlvbkNlbnRlclxuIiwiZXhwb3J0cy5QbGF5ZXIgPVxuY2xhc3MgUGxheWVyXG4gIGNvbnN0cnVjdG9yOiAoQGZ1bGxOYW1lKSAtPlxuICBpZDogMFxuICBmaXJzdE5hbWU6IC0+IEBmdWxsTmFtZS5zcGxpdChcIiBcIilbMF1cbiAgbGFzdE5hbWU6IC0+IEBmdWxsTmFtZS5zcGxpdChcIiBcIilbMV1cbiAgZW5lcmd5RmllbGQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuUGxheWVyX19lbmVyZ3lcIilcbiAgYmFsYW5jZUZpZWxkOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLlBsYXllcl9fYmFsYW5jZVwiKVxuICBuYW1lRmllbGQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuUGxheWVyX19uYW1lXCIpXG4gIGJhbGFuY2U6IDAuMDBcbiAgZW5lcmd5OiAxXG4gIGlzRGVhZDogZmFsc2VcbiAgY2FuQWZmb3JkOiAoaXRlbSkgLT5cbiAgICBAYmFsYW5jZSA+PSBpdGVtLnByaWNlXG4gIHdpbGxLaWxsOiAoYW1vdW50KSAtPiAoQGVuZXJneSArIGFtb3VudCkgPD0gMFxuICBraWxsOiAtPlxuICAgIEBpc0RlYWQgPSB0cnVlXG4gICAgY2xlYXJJbnRlcnZhbCB3aW5kb3cuZW5lcmd5SW50ZXJ2YWxcbiAgICBAZW5lcmd5ID0gMFxuICAgIEByZW5kZXJFbmVyZ3koKVxuICAgIFN0YXRpb24uZmlyZSBcInBsYXllckRpZWRcIlxuICB1cGRhdGVFbmVyZ3k6IChhbW91bnQpIC0+XG4gICAgcmV0dXJuIEBraWxsKCkgaWYgQHdpbGxLaWxsIGFtb3VudFxuICAgIGZyb20gPSBAZW5lcmd5XG4gICAgQGVuZXJneSA9IHBhcnNlRmxvYXQgKEBlbmVyZ3kgKyBhbW91bnQpLnRvRml4ZWQoMilcbiAgICBTdGF0aW9uLmZpcmUgXCJwbGF5ZXJVcGRhdGVcIiwge1xuICAgICAgZmllbGQ6IFwiZW5lcmd5XCJcbiAgICAgIGZyb206IGZyb21cbiAgICAgIHRvOiBAZW5lcmd5XG4gICAgfVxuICAgIEByZW5kZXJFbmVyZ3koKVxuICB1cGRhdGVCYWxhbmNlOiAoYW1vdW50KSAtPlxuICAgIGZyb20gPSBAYmFsYW5jZVxuICAgIEBiYWxhbmNlID0gcGFyc2VGbG9hdCAoQGJhbGFuY2UgKyBhbW91bnQpLnRvRml4ZWQoMilcbiAgICBTdGF0aW9uLmZpcmUgXCJwbGF5ZXJVcGRhdGVcIiwge1xuICAgICAgZmllbGQ6IFwiYmFsYW5jZVwiXG4gICAgICBmcm9tOiBmcm9tXG4gICAgICB0bzogQGJhbGFuY2VcbiAgICB9XG4gICAgQHJlbmRlckJhbGFuY2UoKVxuICByZW5kZXI6IC0+XG4gICAgQHJlbmRlck5hbWUoKVxuICAgIEByZW5kZXJCYWxhbmNlKClcbiAgICBAcmVuZGVyRW5lcmd5KClcbiAgcmVuZGVyTmFtZTogLT5cbiAgICBAbmFtZUZpZWxkLmlubmVySFRNTCA9IEBmaXJzdE5hbWUoKVxuICByZW5kZXJCYWxhbmNlOiAtPlxuICAgIEBiYWxhbmNlRmllbGQuaW5uZXJIVE1MID0gXCIkI3tAYmFsYW5jZX1cIlxuICByZW5kZXJFbmVyZ3k6IC0+XG4gICAgQGVuZXJneUZpZWxkLmlubmVySFRNTCA9IFwiI3tAZW5lcmd5ICogMTAwfSVcIlxuIiwiIyB1dGlsLmxvZ19yZXF1ZXN0ID0gcmVxdWlyZSBcIi4vLi4vaGVscGVycy9sb2dfcmVxdWVzdFwiXG5leHBvcnRzLlN0YXRpb24gPVxuY2xhc3MgU3RhdGlvblxuICBAZmlyZTogKG5hbWUsIGRldGFpbHMpIC0+XG4gICAgc3dpdGNoIG5hbWVcbiAgICAgIHdoZW4gXCJuZXdQbGF5ZXJcIiB0aGVuIEBvbk5ld1BsYXllcigpXG4gICAgICB3aGVuIFwicGxheWVyVXBkYXRlXCIgdGhlbiBAb25QbGF5ZXJVcGRhdGUgZGV0YWlsc1xuICAgICAgd2hlbiBcImNvcnJlY3RCb3hcIiB0aGVuIEBvbkNvcnJlY3RCb3ggZGV0YWlsc1xuICAgICAgd2hlbiBcIndyb25nQm94XCIgdGhlbiBAb25Xcm9uZ0JveCBkZXRhaWxzXG4gICAgICB3aGVuIFwiZ2V0UGxheWVyXCIgdGhlbiBAb25HZXRQbGF5ZXIgZGV0YWlsc1xuICAgICAgd2hlbiBcInRvb2tCcmVha1wiIHRoZW4gQG9uVG9va0JyZWFrKClcbiAgICAgIHdoZW4gXCJzdWNjZXNzZnVsUHVyY2hhc2VcIiB0aGVuIEBvblN1Y2Nlc3NmdWxQdXJjaGFzZSBkZXRhaWxzXG4gICAgICB3aGVuIFwiZmFpbGVkUHVyY2hhc2VcIiB0aGVuIEBvbkZhaWxlZFB1cmNoYXNlIGRldGFpbHNcbiAgICAgIHdoZW4gXCJidWNrZXRGaWxsZWRcIiB0aGVuIEBvbkJ1Y2tldEZpbGxlZCgpXG4gICAgICB3aGVuIFwidmlzaWJpbGl0eUNoYW5nZVwiIHRoZW4gQG9uVmlzaWJpbGl0eUNoYW5nZSBkZXRhaWxzXG4gICAgICB3aGVuIFwicGxheWVyRGllZFwiIHRoZW4gQG9uUGxheWVyRGVhdGgoKVxuICAgICAgZWxzZSBjb25zb2xlLmVycm9yKFwiVU5LTk9XTiBFVkVOVDogKCN7bmFtZX0pXCIpXG4gIEBvbk5ld1BsYXllcjogKGRldGFpbHMpIC0+XG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwibmV3UGxheWVyXCIsIHdpbmRvdy5wbGF5ZXJcbiAgQG9uUGxheWVyVXBkYXRlOiAoZGV0YWlscykgLT5cbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJ1cGRhdGVcIiwge3BsYXllcjogd2luZG93LnBsYXllcn1cbiAgQG9uU3VjY2Vzc2Z1bFB1cmNoYXNlOiAoZGV0YWlscykgLT5cbiAgICBOb3RpZmljYXRpb25DZW50ZXIuY29uZ3JhdHVsYXRlIFwiWW91IGhhdmUgYm91Z2h0ICN7ZGV0YWlscy5uYW1lfSBmb3IgJCN7ZGV0YWlscy5wcmljZS50b0ZpeGVkKDIpfVwiXG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwicHVyY2hhc2VcIiwge1xuICAgICAgdHJhbnNhY3Rpb246IHtcbiAgICAgICAgbmFtZTogZGV0YWlscy5uYW1lXG4gICAgICAgIHByaWNlOiBkZXRhaWxzLnByaWNlXG4gICAgICB9XG4gICAgfVxuICBAb25GYWlsZWRQdXJjaGFzZTogKGRldGFpbHMpIC0+XG4gICAgTm90aWZpY2F0aW9uQ2VudGVyLmVycm9yIFwiWW91IGRvIG5vdCBoYXZlIGVub3VnaCBtb25leS4gV29yayBIYXJkZXIhXCJcbiAgQG9uQnVja2V0RmlsbGVkOiAtPlxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcImJ1Y2tldEZpbGxlZFwiXG4gIEBvbkdldFBsYXllcjogKGRldGFpbHMpIC0+XG4gICAgd2luZG93LnNvY2tldC5lbWl0IFwiZ2V0UGxheWVyXCIsIHtcbiAgICAgIGlkOiBkZXRhaWxzLmlkXG4gICAgfVxuICBAb25Ub29rQnJlYWsgPSAtPlxuICAgIGNsZWFySW50ZXJ2YWwgd2luZG93LmVuZXJneUludGVydmFsXG4gICAgd2luZG93LmdhbWVPdmVyKFwiTm8gQnJlYWtzXCIsIFwiQmVjYXVzZSB5b3UgdG9vayBhIGJyZWFrIHlvdSB3ZXJlIGZpcmVkIGZyb20geW91ciBqb2IgYW5kIHdpdGhvdXQgYSBzb3VyY2Ugb2YgaW5jb21lOiB5b3UgZGllZC5cIilcbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJicmVha1wiXG4gIEBvblBsYXllckRlYXRoOiAtPlxuICAgIHdpbmRvdy5nYW1lT3ZlcihcIllvdSBEaWVkXCIsIFwiWW91IGhhZCBubyBlbmVyZ3kgbGVmdCBhbmQgbGl0ZXJhbGx5IGZlbGwgb3ZlciBvbiB0aGUgam9iLiBZb3VyIG1hbmFnZXIgZGlkbid0IGV2ZW4gbm90aWNlLlwiKVxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcImRlYXRoXCJcbiAgQG9uQ29ycmVjdEJveDogKGRldGFpbHMpIC0+XG4gICAgYnVja2V0cyA9IHdpbmRvdy5idWNrZXRMaXN0Lm1hcCAoYnVja2V0KSAtPlxuICAgICAge1xuICAgICAgICBjb2xvcjogYnVja2V0LmNvbG9yLFxuICAgICAgICBjdXJyZW50VGFsbHk6IGJ1Y2tldC5jdXJyZW50VGFsbHksXG4gICAgICAgIHJlcXVpcmVkQW1vdW50OiBidWNrZXQucmVxdWlyZWRBbW91bnQsXG4gICAgICAgIHRvdGFsVmFsdWU6IGJ1Y2tldC50b3RhbFZhbHVlXG4gICAgICB9XG5cbiAgICB3aW5kb3cuc29ja2V0LmVtaXQgXCJjb3JyZWN0Ym94XCIsIHtcbiAgICAgIGJveDogZGV0YWlscy5ib3hcbiAgICAgIGJ1Y2tldHM6IGJ1Y2tldHNcbiAgICB9XG4gIEBvbldyb25nQm94OiAoZGV0YWlscykgLT5cbiAgICBidWNrZXRzID0gd2luZG93LmJ1Y2tldExpc3QubWFwIChidWNrZXQpIC0+XG4gICAgICB7XG4gICAgICAgIGNvbG9yOiBidWNrZXQuY29sb3IsXG4gICAgICAgIGN1cnJlbnRUYWxseTogYnVja2V0LmN1cnJlbnRUYWxseSxcbiAgICAgICAgcmVxdWlyZWRBbW91bnQ6IGJ1Y2tldC5yZXF1aXJlZEFtb3VudCxcbiAgICAgICAgdG90YWxWYWx1ZTogYnVja2V0LnRvdGFsVmFsdWVcbiAgICAgIH1cblxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcIndyb25nYm94XCIsIHtcbiAgICAgIGJveDogZGV0YWlscy5ib3hcbiAgICAgIGJ1Y2tldHM6IGJ1Y2tldHNcbiAgICB9XG4gIEBvblZpc2liaWxpdHlDaGFuZ2U6IChkZXRhaWxzKSAtPlxuICAgIHdpbmRvdy5zb2NrZXQuZW1pdCBcInZpc2liaWxpdHlDaGFuZ2VcIiwge1xuICAgICAgZnJvbVN0YXRlOiBkZXRhaWxzLmZyb21TdGF0ZVxuICAgICAgdG9TdGF0ZTogZGV0YWlscy50b1N0YXRlXG4gICAgfVxuIiwie1RyYW5zYWN0aW9ufSA9IHJlcXVpcmUgXCIuL3RyYW5zYWN0aW9uXCJcbntTdGF0aW9ufSA9IHJlcXVpcmUgXCIuL3N0YXRpb25cIlxuZXhwb3J0cy5TdG9yZSA9XG5jbGFzcyBTdG9yZVxuICBAaXRlbXM6IFtdXG4gIEBhZGRJdGVtOiAoaXRlbSkgLT5cbiAgICBAaXRlbXMucHVzaCBpdGVtXG4gIEBidXk6IChpdGVtKSAtPlxuICAgIHRyYW5zYWN0aW9uID0gbmV3IFRyYW5zYWN0aW9uIGl0ZW1cbiAgICBpZiB3aW5kb3cucGxheWVyLmNhbkFmZm9yZCh0cmFuc2FjdGlvbikgYW5kIHRyYW5zYWN0aW9uLm5hbWUgaXNudCBcImEgYnJlYWtcIlxuICAgICAgdHJhbnNhY3Rpb24uaXNTdWNjZXNzID0gdHJ1ZVxuICAgICAgdHJhbnNhY3Rpb24uYXBwbHkoKVxuICAgIGVsc2UgaWYgdHJhbnNhY3Rpb24ubmFtZSBpcyBcImEgYnJlYWtcIlxuICAgICAgU3RhdGlvbi5maXJlIFwidG9va0JyZWFrXCJcbiAgICAgIHRyYW5zYWN0aW9uLmlzU3VjY2VzcyA9IHRydWVcbiAgICBlbHNlXG4gICAgICB0cmFuc2FjdGlvbi5pc1N1Y2Nlc3MgPSBmYWxzZVxuICAgIFN0YXRpb24uZmlyZSBcIiN7dHJhbnNhY3Rpb24uc3RhdGUoKX1QdXJjaGFzZVwiLCB0cmFuc2FjdGlvblxuIiwiZXhwb3J0cy5UcmFuc2FjdGlvbiA9XG5jbGFzcyBUcmFuc2FjdGlvblxuICBjb25zdHJ1Y3RvcjogKEBpdGVtKSAtPlxuICAgIEBwcmljZSA9IEBpdGVtLnByaWNlXG4gICAgQG5hbWUgPSBAaXRlbS5uYW1lXG4gIGFwcGx5OiAtPlxuICAgIEB0aW1lID0gRGF0ZS5ub3coKVxuICAgIHdpbmRvdy5wbGF5ZXIudXBkYXRlRW5lcmd5IEBpdGVtLmVuZXJneVxuICAgIHdpbmRvdy5wbGF5ZXIudXBkYXRlQmFsYW5jZSAoLTEqQHByaWNlKVxuICBzdGF0ZTogLT5cbiAgICBpZiBAaXNTdWNjZXNzIHRoZW4gXCJzdWNjZXNzZnVsXCIgZWxzZSBcImZhaWxlZFwiXG4iLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjcuMFxuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIGNvbmNhdCAgICAgICAgICAgPSBBcnJheVByb3RvLmNvbmNhdCxcbiAgICB0b1N0cmluZyAgICAgICAgID0gT2JqUHJvdG8udG9TdHJpbmcsXG4gICAgaGFzT3duUHJvcGVydHkgICA9IE9ialByb3RvLmhhc093blByb3BlcnR5O1xuXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuICAvLyBhcmUgZGVjbGFyZWQgaGVyZS5cbiAgdmFyXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcbiAgICBuYXRpdmVLZXlzICAgICAgICAgPSBPYmplY3Qua2V5cyxcbiAgICBuYXRpdmVCaW5kICAgICAgICAgPSBGdW5jUHJvdG8uYmluZDtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuNy4wJztcblxuICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZWZmaWNpZW50IChmb3IgY3VycmVudCBlbmdpbmVzKSB2ZXJzaW9uXG4gIC8vIG9mIHRoZSBwYXNzZWQtaW4gY2FsbGJhY2ssIHRvIGJlIHJlcGVhdGVkbHkgYXBwbGllZCBpbiBvdGhlciBVbmRlcnNjb3JlXG4gIC8vIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUNhbGxiYWNrID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAoY29udGV4dCA9PT0gdm9pZCAwKSByZXR1cm4gZnVuYztcbiAgICBzd2l0Y2ggKGFyZ0NvdW50ID09IG51bGwgPyAzIDogYXJnQ291bnQpIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvdGhlcikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBvdGhlcik7XG4gICAgICB9O1xuICAgICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQSBtb3N0bHktaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgY2FsbGJhY2tzIHRoYXQgY2FuIGJlIGFwcGxpZWRcbiAgLy8gdG8gZWFjaCBlbGVtZW50IGluIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBkZXNpcmVkIHJlc3VsdCDigJQgZWl0aGVyXG4gIC8vIGlkZW50aXR5LCBhbiBhcmJpdHJhcnkgY2FsbGJhY2ssIGEgcHJvcGVydHkgbWF0Y2hlciwgb3IgYSBwcm9wZXJ0eSBhY2Nlc3Nvci5cbiAgXy5pdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gXy5pZGVudGl0eTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhbHVlKSkgcmV0dXJuIGNyZWF0ZUNhbGxiYWNrKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCk7XG4gICAgaWYgKF8uaXNPYmplY3QodmFsdWUpKSByZXR1cm4gXy5tYXRjaGVzKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxuICAvLyBzcGFyc2UgYXJyYXktbGlrZXMgYXMgaWYgdGhleSB3ZXJlIGRlbnNlLlxuICBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gb2JqO1xuICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBpLCBsZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgIGlmIChsZW5ndGggPT09ICtsZW5ndGgpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpbaV0sIGksIG9iaik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtrZXlzW2ldXSwga2V5c1tpXSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdGVlIHRvIGVhY2ggZWxlbWVudC5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gW107XG4gICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCksXG4gICAgICAgIGN1cnJlbnRLZXk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgcmVzdWx0c1tpbmRleF0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIHZhciByZWR1Y2VFcnJvciA9ICdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJztcblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIGluZGV4ID0gMCwgY3VycmVudEtleTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgIGlmICghbGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbaW5kZXgrK10gOiBpbmRleCsrXTtcbiAgICB9XG4gICAgZm9yICg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBtZW1vID0gaXRlcmF0ZWUobWVtbywgb2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0LCA0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICsgb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgaW5kZXggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgY3VycmVudEtleTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgIGlmICghaW5kZXgpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgICAgbWVtbyA9IG9ialtrZXlzID8ga2V5c1stLWluZGV4XSA6IC0taW5kZXhdO1xuICAgIH1cbiAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgbWVtbyA9IGl0ZXJhdGVlKG1lbW8sIG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5zb21lKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBwYXNzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgc2VsZWN0YC5cbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5uZWdhdGUoXy5pdGVyYXRlZShwcmVkaWNhdGUpKSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXG4gIF8uZXZlcnkgPSBfLmFsbCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIGluZGV4LCBjdXJyZW50S2V5O1xuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgaWYgKCFwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbnlgLlxuICBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBpbmRleCwgY3VycmVudEtleTtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gdmFsdWUgKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICByZXR1cm4gXy5pbmRleE9mKG9iaiwgdGFyZ2V0KSA+PSAwO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF0pLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPiByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkID4gbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSAtSW5maW5pdHkgJiYgcmVzdWx0ID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtaW5pbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1pbiA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IEluZmluaXR5LFxuICAgICAgICB2YWx1ZSwgY29tcHV0ZWQ7XG4gICAgaWYgKGl0ZXJhdGVlID09IG51bGwgJiYgb2JqICE9IG51bGwpIHtcbiAgICAgIG9iaiA9IG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgICBpZiAoY29tcHV0ZWQgPCBsYXN0Q29tcHV0ZWQgfHwgY29tcHV0ZWQgPT09IEluZmluaXR5ICYmIHJlc3VsdCA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gU2h1ZmZsZSBhIGNvbGxlY3Rpb24sIHVzaW5nIHRoZSBtb2Rlcm4gdmVyc2lvbiBvZiB0aGVcbiAgLy8gW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlcuKAk1lhdGVzX3NodWZmbGUpLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgc2V0ID0gb2JqICYmIG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0gc2V0Lmxlbmd0aDtcbiAgICB2YXIgc2h1ZmZsZWQgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGluZGV4ID0gMCwgcmFuZDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHJhbmQgPSBfLnJhbmRvbSgwLCBpbmRleCk7XG4gICAgICBpZiAocmFuZCAhPT0gaW5kZXgpIHNodWZmbGVkW2luZGV4XSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgc2h1ZmZsZWRbcmFuZF0gPSBzZXRbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24uXG4gIC8vIElmICoqbioqIGlzIG5vdCBzcGVjaWZpZWQsIHJldHVybnMgYSBzaW5nbGUgcmFuZG9tIGVsZW1lbnQuXG4gIC8vIFRoZSBpbnRlcm5hbCBgZ3VhcmRgIGFyZ3VtZW50IGFsbG93cyBpdCB0byB3b3JrIHdpdGggYG1hcGAuXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgIGlmIChvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgcmV0dXJuIF8uc2h1ZmZsZShvYmopLnNsaWNlKDAsIE1hdGgubWF4KDAsIG4pKTtcbiAgfTtcblxuICAvLyBTb3J0IHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24gcHJvZHVjZWQgYnkgYW4gaXRlcmF0ZWUuXG4gIF8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICB2YXIga2V5ID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBvYmopO1xuICAgICAgICBiZWhhdmlvcihyZXN1bHQsIHZhbHVlLCBrZXkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxuICAvLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbiAgXy5ncm91cEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgaWYgKF8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7IGVsc2UgcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldKys7IGVsc2UgcmVzdWx0W2tleV0gPSAxO1xuICB9KTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRlZShvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gYXJyYXkubGVuZ3RoO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gbG93ICsgaGlnaCA+Pj4gMTtcbiAgICAgIGlmIChpdGVyYXRlZShhcnJheVttaWRdKSA8IHZhbHVlKSBsb3cgPSBtaWQgKyAxOyBlbHNlIGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG4gIH07XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoID8gb2JqLmxlbmd0aCA6IF8ua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICAvLyBTcGxpdCBhIGNvbGxlY3Rpb24gaW50byB0d28gYXJyYXlzOiBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIHNhdGlzZnkgdGhlIGdpdmVuXG4gIC8vIHByZWRpY2F0ZSwgYW5kIG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgZG8gbm90IHNhdGlzZnkgdGhlIHByZWRpY2F0ZS5cbiAgXy5wYXJ0aXRpb24gPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIgcGFzcyA9IFtdLCBmYWlsID0gW107XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7XG4gICAgICAocHJlZGljYXRlKHZhbHVlLCBrZXksIG9iaikgPyBwYXNzIDogZmFpbCkucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtwYXNzLCBmYWlsXTtcbiAgfTtcblxuICAvLyBBcnJheSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYGhlYWRgIGFuZCBgdGFrZWAuIFRoZSAqKmd1YXJkKiogY2hlY2tcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmZpcnN0ID0gXy5oZWFkID0gXy50YWtlID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5WzBdO1xuICAgIGlmIChuIDwgMCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoXG4gIC8vIGBfLm1hcGAuXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5sYXN0ID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBNYXRoLm1heChhcnJheS5sZW5ndGggLSBuLCAwKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5LiBBbGlhc2VkIGFzIGB0YWlsYCBhbmQgYGRyb3BgLlxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxuICAvLyB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKipcbiAgLy8gY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgbiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgc3RyaWN0LCBvdXRwdXQpIHtcbiAgICBpZiAoc2hhbGxvdyAmJiBfLmV2ZXJ5KGlucHV0LCBfLmlzQXJyYXkpKSB7XG4gICAgICByZXR1cm4gY29uY2F0LmFwcGx5KG91dHB1dCwgaW5wdXQpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gaW5wdXQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGlucHV0W2ldO1xuICAgICAgaWYgKCFfLmlzQXJyYXkodmFsdWUpICYmICFfLmlzQXJndW1lbnRzKHZhbHVlKSkge1xuICAgICAgICBpZiAoIXN0cmljdCkgb3V0cHV0LnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChzaGFsbG93KSB7XG4gICAgICAgIHB1c2guYXBwbHkob3V0cHV0LCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBzdHJpY3QsIG91dHB1dCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBmYWxzZSwgW10pO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBzZWVuID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhcnJheVtpXTtcbiAgICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgICBpZiAoIWkgfHwgc2VlbiAhPT0gdmFsdWUpIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgc2VlbiA9IHZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChpdGVyYXRlZSkge1xuICAgICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpO1xuICAgICAgICBpZiAoXy5pbmRleE9mKHNlZW4sIGNvbXB1dGVkKSA8IDApIHtcbiAgICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChfLmluZGV4T2YocmVzdWx0LCB2YWx1ZSkgPCAwKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlLCBbXSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gW107XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgICBpZiAoXy5jb250YWlucyhyZXN1bHQsIGl0ZW0pKSBjb250aW51ZTtcbiAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgYXJnc0xlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhhcmd1bWVudHNbal0sIGl0ZW0pKSBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChqID09PSBhcmdzTGVuZ3RoKSByZXN1bHQucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBmbGF0dGVuKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgdHJ1ZSwgdHJ1ZSwgW10pO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiBbXTtcbiAgICB2YXIgbGVuZ3RoID0gXy5tYXgoYXJndW1lbnRzLCAnbGVuZ3RoJykubGVuZ3RoO1xuICAgIHZhciByZXN1bHRzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRzW2ldID0gXy5wbHVjayhhcmd1bWVudHMsIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgaWYgKGxpc3QgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW4gaXRlbSBpbiBhbiBhcnJheSxcbiAgLy8gb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cbiAgLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4gIC8vIGZvciAqKmlzU29ydGVkKiogdG8gdXNlIGJpbmFyeSBzZWFyY2guXG4gIF8uaW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpc1NvcnRlZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgaWYgKGlzU29ydGVkKSB7XG4gICAgICBpZiAodHlwZW9mIGlzU29ydGVkID09ICdudW1iZXInKSB7XG4gICAgICAgIGkgPSBpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsZW5ndGggKyBpc1NvcnRlZCkgOiBpc1NvcnRlZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGkgPSBfLnNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2ldID09PSBpdGVtID8gaSA6IC0xO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICBfLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBpZHggPSBhcnJheS5sZW5ndGg7XG4gICAgaWYgKHR5cGVvZiBmcm9tID09ICdudW1iZXInKSB7XG4gICAgICBpZHggPSBmcm9tIDwgMCA/IGlkeCArIGZyb20gKyAxIDogTWF0aC5taW4oaWR4LCBmcm9tICsgMSk7XG4gICAgfVxuICAgIHdoaWxlICgtLWlkeCA+PSAwKSBpZiAoYXJyYXlbaWR4XSA9PT0gaXRlbSkgcmV0dXJuIGlkeDtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYW4gaW50ZWdlciBBcnJheSBjb250YWluaW5nIGFuIGFyaXRobWV0aWMgcHJvZ3Jlc3Npb24uIEEgcG9ydCBvZlxuICAvLyB0aGUgbmF0aXZlIFB5dGhvbiBgcmFuZ2UoKWAgZnVuY3Rpb24uIFNlZVxuICAvLyBbdGhlIFB5dGhvbiBkb2N1bWVudGF0aW9uXShodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvZnVuY3Rpb25zLmh0bWwjcmFuZ2UpLlxuICBfLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICBzdG9wID0gc3RhcnQgfHwgMDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgc3RlcCA9IHN0ZXAgfHwgMTtcblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIHJhbmdlID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGxlbmd0aDsgaWR4KyssIHN0YXJ0ICs9IHN0ZXApIHtcbiAgICAgIHJhbmdlW2lkeF0gPSBzdGFydDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXVzYWJsZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgcHJvdG90eXBlIHNldHRpbmcuXG4gIHZhciBDdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIHZhciBhcmdzLCBib3VuZDtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbicpO1xuICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkpIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgQ3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBzZWxmID0gbmV3IEN0b3I7XG4gICAgICBDdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGlmIChfLmlzT2JqZWN0KHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LiBfIGFjdHNcbiAgLy8gYXMgYSBwbGFjZWhvbGRlciwgYWxsb3dpbmcgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyB0byBiZSBwcmUtZmlsbGVkLlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgICAgdmFyIGFyZ3MgPSBib3VuZEFyZ3Muc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmdzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcmdzW2ldID09PSBfKSBhcmdzW2ldID0gYXJndW1lbnRzW3Bvc2l0aW9uKytdO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEJpbmQgYSBudW1iZXIgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gUmVtYWluaW5nIGFyZ3VtZW50c1xuICAvLyBhcmUgdGhlIG1ldGhvZCBuYW1lcyB0byBiZSBib3VuZC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0IGFsbCBjYWxsYmFja3NcbiAgLy8gZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCwga2V5O1xuICAgIGlmIChsZW5ndGggPD0gMSkgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzJyk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXkgPSBhcmd1bWVudHNbaV07XG4gICAgICBvYmpba2V5XSA9IF8uYmluZChvYmpba2V5XSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtb2l6ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGNhY2hlID0gbWVtb2l6ZS5jYWNoZTtcbiAgICAgIHZhciBhZGRyZXNzID0gaGFzaGVyID8gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBrZXk7XG4gICAgICBpZiAoIV8uaGFzKGNhY2hlLCBhZGRyZXNzKSkgY2FjaGVbYWRkcmVzc10gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gY2FjaGVbYWRkcmVzc107XG4gICAgfTtcbiAgICBtZW1vaXplLmNhY2hlID0ge307XG4gICAgcmV0dXJuIG1lbW9pemU7XG4gIH07XG5cbiAgLy8gRGVsYXlzIGEgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBhbmQgdGhlbiBjYWxsc1xuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXG4gIF8uZGVsYXkgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0sIHdhaXQpO1xuICB9O1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHJldHVybiBfLmRlbGF5LmFwcGx5KF8sIFtmdW5jLCAxXS5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogXy5ub3coKTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gXy5ub3coKSAtIHRpbWVzdGFtcDtcblxuICAgICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPiAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHRpbWVzdGFtcCA9IF8ubm93KCk7XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgIGlmICghdGltZW91dCkgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIG5lZ2F0ZWQgdmVyc2lvbiBvZiB0aGUgcGFzc2VkLWluIHByZWRpY2F0ZS5cbiAgXy5uZWdhdGUgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIHN0YXJ0ID0gYXJncy5sZW5ndGggLSAxO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gc3RhcnQ7XG4gICAgICB2YXIgcmVzdWx0ID0gYXJnc1tzdGFydF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHdoaWxlIChpLS0pIHJlc3VsdCA9IGFyZ3NbaV0uY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBhZnRlciBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgYmVmb3JlIGJlaW5nIGNhbGxlZCBOIHRpbWVzLlxuICBfLmJlZm9yZSA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgdmFyIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPiAwKSB7XG4gICAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmdW5jID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IF8ucGFydGlhbChfLmJlZm9yZSwgMik7XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIHRoZSB2YWx1ZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgXy52YWx1ZXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgdmFsdWVzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvYmpba2V5c1tpXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICB2YXIgc291cmNlLCBwcm9wO1xuICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGZvciAocHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBwcm9wKSkge1xuICAgICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSB7fSwga2V5O1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGl0ZXJhdGVlKSkge1xuICAgICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgdmFyIHZhbHVlID0gb2JqW2tleV07XG4gICAgICAgIGlmIChpdGVyYXRlZSh2YWx1ZSwga2V5LCBvYmopKSByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShbXSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgIG9iaiA9IG5ldyBPYmplY3Qob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgIGlmIChrZXkgaW4gb2JqKSByZXN1bHRba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpdGVyYXRlZSA9IF8ubmVnYXRlKGl0ZXJhdGVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLm1hcChjb25jYXQuYXBwbHkoW10sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSksIFN0cmluZyk7XG4gICAgICBpdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKGtleXMsIGtleSk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gXy5waWNrKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIEZpbGwgaW4gYSBnaXZlbiBvYmplY3Qgd2l0aCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gIF8uZGVmYXVsdHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKG9ialtwcm9wXSA9PT0gdm9pZCAwKSBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG4gIHZhciBlcSA9IGZ1bmN0aW9uKGEsIGIsIGFTdGFjaywgYlN0YWNrKSB7XG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAgIC8vIFNlZSB0aGUgW0hhcm1vbnkgYGVnYWxgIHByb3Bvc2FsXShodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwpLlxuICAgIGlmIChhID09PSBiKSByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PT0gMSAvIGI7XG4gICAgLy8gQSBzdHJpY3QgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkgYmVjYXVzZSBgbnVsbCA9PSB1bmRlZmluZWRgLlxuICAgIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSByZXR1cm4gYSA9PT0gYjtcbiAgICAvLyBVbndyYXAgYW55IHdyYXBwZWQgb2JqZWN0cy5cbiAgICBpZiAoYSBpbnN0YW5jZW9mIF8pIGEgPSBhLl93cmFwcGVkO1xuICAgIGlmIChiIGluc3RhbmNlb2YgXykgYiA9IGIuX3dyYXBwZWQ7XG4gICAgLy8gQ29tcGFyZSBgW1tDbGFzc11dYCBuYW1lcy5cbiAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKTtcbiAgICBpZiAoY2xhc3NOYW1lICE9PSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvZXJjZWQgdG8gc3RyaW5ncyBmb3IgY29tcGFyaXNvbiAoTm90ZTogJycgKyAvYS9pID09PSAnL2EvaScpXG4gICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgICAvLyBQcmltaXRpdmVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG9iamVjdCB3cmFwcGVycyBhcmUgZXF1aXZhbGVudDsgdGh1cywgYFwiNVwiYCBpc1xuICAgICAgICAvLyBlcXVpdmFsZW50IHRvIGBuZXcgU3RyaW5nKFwiNVwiKWAuXG4gICAgICAgIHJldHVybiAnJyArIGEgPT09ICcnICsgYjtcbiAgICAgIGNhc2UgJ1tvYmplY3QgTnVtYmVyXSc6XG4gICAgICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuXG4gICAgICAgIC8vIE9iamVjdChOYU4pIGlzIGVxdWl2YWxlbnQgdG8gTmFOXG4gICAgICAgIGlmICgrYSAhPT0gK2EpIHJldHVybiArYiAhPT0gK2I7XG4gICAgICAgIC8vIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3Igb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiArYSA9PT0gMCA/IDEgLyArYSA9PT0gMSAvIGIgOiArYSA9PT0gK2I7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT09ICtiO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiO1xuICAgIH1cbiAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHNcbiAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICBpZiAoXG4gICAgICBhQ3RvciAhPT0gYkN0b3IgJiZcbiAgICAgIC8vIEhhbmRsZSBPYmplY3QuY3JlYXRlKHgpIGNhc2VzXG4gICAgICAnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiICYmXG4gICAgICAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgYUN0b3IgaW5zdGFuY2VvZiBhQ3RvciAmJlxuICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIGJDdG9yIGluc3RhbmNlb2YgYkN0b3IpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcbiAgICB2YXIgc2l6ZSwgcmVzdWx0O1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChjbGFzc05hbWUgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgc2l6ZSA9IGEubGVuZ3RoO1xuICAgICAgcmVzdWx0ID0gc2l6ZSA9PT0gYi5sZW5ndGg7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICAgIHdoaWxlIChzaXplLS0pIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBlcShhW3NpemVdLCBiW3NpemVdLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKGEpLCBrZXk7XG4gICAgICBzaXplID0ga2V5cy5sZW5ndGg7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcyBiZWZvcmUgY29tcGFyaW5nIGRlZXAgZXF1YWxpdHkuXG4gICAgICByZXN1bHQgPSBfLmtleXMoYikubGVuZ3RoID09PSBzaXplO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyXG4gICAgICAgICAga2V5ID0ga2V5c1tzaXplXTtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBfLmhhcyhiLCBrZXkpICYmIGVxKGFba2V5XSwgYltrZXldLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKCk7XG4gICAgYlN0YWNrLnBvcCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUGVyZm9ybSBhIGRlZXAgY29tcGFyaXNvbiB0byBjaGVjayBpZiB0d28gb2JqZWN0cyBhcmUgZXF1YWwuXG4gIF8uaXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXEoYSwgYiwgW10sIFtdKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cbiAgXy5pc0VsZW1lbnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9iai5ub2RlVHlwZSA9PT0gMSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhbiBhcnJheT9cbiAgLy8gRGVsZWdhdGVzIHRvIEVDTUE1J3MgbmF0aXZlIEFycmF5LmlzQXJyYXlcbiAgXy5pc0FycmF5ID0gbmF0aXZlSXNBcnJheSB8fCBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xuICB9O1xuXG4gIC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0RhdGUsIGlzUmVnRXhwLlxuICBfLmVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmhhcyhvYmosICdjYWxsZWUnKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLiBXb3JrIGFyb3VuZCBhbiBJRSAxMSBidWcuXG4gIGlmICh0eXBlb2YgLy4vICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgXy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PSAnZnVuY3Rpb24nIHx8IGZhbHNlO1xuICAgIH07XG4gIH1cblxuICAvLyBJcyBhIGdpdmVuIG9iamVjdCBhIGZpbml0ZSBudW1iZXI/XG4gIF8uaXNGaW5pdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gaXNGaW5pdGUob2JqKSAmJiAhaXNOYU4ocGFyc2VGbG9hdChvYmopKTtcbiAgfTtcblxuICAvLyBJcyB0aGUgZ2l2ZW4gdmFsdWUgYE5hTmA/IChOYU4gaXMgdGhlIG9ubHkgbnVtYmVyIHdoaWNoIGRvZXMgbm90IGVxdWFsIGl0c2VsZikuXG4gIF8uaXNOYU4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIG9iaiAhPT0gK29iajtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgYm9vbGVhbj9cbiAgXy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB0cnVlIHx8IG9iaiA9PT0gZmFsc2UgfHwgdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0ZWVzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgXy5ub29wID0gZnVuY3Rpb24oKXt9O1xuXG4gIF8ucHJvcGVydHkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgdmFyIHBhaXJzID0gXy5wYWlycyhhdHRycyksIGxlbmd0aCA9IHBhaXJzLmxlbmd0aDtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAhbGVuZ3RoO1xuICAgICAgb2JqID0gbmV3IE9iamVjdChvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGFpciA9IHBhaXJzW2ldLCBrZXkgPSBwYWlyWzBdO1xuICAgICAgICBpZiAocGFpclsxXSAhPT0gb2JqW2tleV0gfHwgIShrZXkgaW4gb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSdW4gYSBmdW5jdGlvbiAqKm4qKiB0aW1lcy5cbiAgXy50aW1lcyA9IGZ1bmN0aW9uKG4sIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGFjY3VtID0gQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xuICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZXNjYXBlTWFwID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjeDI3OycsXG4gICAgJ2AnOiAnJiN4NjA7J1xuICB9O1xuICB2YXIgdW5lc2NhcGVNYXAgPSBfLmludmVydChlc2NhcGVNYXApO1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgdmFyIGNyZWF0ZUVzY2FwZXIgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIgZXNjYXBlciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWFwW21hdGNoXTtcbiAgICB9O1xuICAgIC8vIFJlZ2V4ZXMgZm9yIGlkZW50aWZ5aW5nIGEga2V5IHRoYXQgbmVlZHMgdG8gYmUgZXNjYXBlZFxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IG9iamVjdFtwcm9wZXJ0eV0oKSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgdmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTtcbiAgfTtcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICAvLyBOQjogYG9sZFNldHRpbmdzYCBvbmx5IGV4aXN0cyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBzZXR0aW5ncywgb2xkU2V0dGluZ3MpIHtcbiAgICBpZiAoIXNldHRpbmdzICYmIG9sZFNldHRpbmdzKSBzZXR0aW5ncyA9IG9sZFNldHRpbmdzO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShlc2NhcGVyLCBlc2NhcGVDaGFyKTtcbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBBZG9iZSBWTXMgbmVlZCB0aGUgbWF0Y2ggcmV0dXJuZWQgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBvZmZlc3QuXG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyAncmV0dXJuIF9fcDtcXG4nO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdmFyIGFyZ3VtZW50ID0gc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaic7XG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyBhcmd1bWVudCArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLiBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBfKG9iaik7XG4gICAgaW5zdGFuY2UuX2NoYWluID0gdHJ1ZTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0aGlzLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIF8uZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICBfLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufS5jYWxsKHRoaXMpKTtcbiJdfQ==
