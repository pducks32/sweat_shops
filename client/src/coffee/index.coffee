_ = require "underscore"
{Box} = require "./models/box"
{Bucket} = require "./models/bucket"
{ConveyorBelt} = require "./models/conveyor_belt"
{Item} = require "./models/item"
{Player} = require "./models/player"
window.Station = require("./models/station").Station
window.Store = require("./models/store").Store
{Transaction} = require "./models/transaction"
window.NotificationCenter = require("./models/notification_center").NotificationCenter

`
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
`

window.socket = io()
window.boxes = []
window.energyInterval = setInterval((-> window.player.updateEnergy -0.013 ), 750)
userName = parseURLParams(document.location.search)?.name[0] ? prompt("What is your first and last name?")
window.player = new Player userName
window.Station.fire "newPlayer"

window.player.render()
window.GameOverField = document.querySelector(".GameOver")
window.GameOverTitleField = window.GameOverField.querySelector(".GameOver__title")
window.GameOverMessageField = window.GameOverField.querySelector(".GameOver__message")
window.gameOver = (title, msg) ->
  window.GameOverTitleField.innerHTML = title
  window.GameOverMessageField.innerHTML = msg
  window.GameOverField.style.opacity = 0
  window.GameOverField.style.display = "block"
  window.GameOverField.style.opacity = 1
# Setup Player Count
window.playerCount = document.querySelector "small.players .player-count"
window.alivePlayerCount = document.querySelector "small.players .alive-player-count"

redBucket = new Bucket({
      container: document.querySelector(".Bucket--red"),
      color: "red",
      });
blueBucket = new Bucket({
      container: document.querySelector(".Bucket--blue"),
      color: "blue",
      });
greenBucket = new Bucket({
      container: document.querySelector(".Bucket--green"),
      color: "green",
      });
yellowBucket = new Bucket({
      container: document.querySelector(".Bucket--yellow"),
      color: "yellow",
      });
window.buckets = [redBucket.draggie, blueBucket.draggie, greenBucket.draggie, yellowBucket.draggie]
window.bucketList = [redBucket, blueBucket, greenBucket, yellowBucket]

# Setup Boxes...FOR NOW
_.each document.querySelectorAll(".Box--red"), setupRedBox = (element, index, array) =>
  window.boxes.push(new Box element, "color")
_.each document.querySelectorAll(".Box--blue"), setupBlueBox = (element, index, array) =>
  window.boxes.push(new Box element, "blue")
_.each document.querySelectorAll(".Box--green"), setupGreenBox = (element, index, array) =>
  window.boxes.push(new Box element, "green")
_.each document.querySelectorAll(".Box--yellow"), setupYellowBox = (element, index, array) =>
  window.boxes.push(new Box element, "yellow")







# Setup Store
foodItem = Item.fromSelector ".Item--food"
waterItem = Item.fromSelector ".Item--water"
breakItem = Item.fromSelector ".Item--break"
Store.addItem foodItem
Store.addItem waterItem
Store.addItem breakItem

# Setup Visability
if document.visibilityState
  document.addEventListener "visibilitychange", ->
    toState = !document.hidden
    fromState = window.player.isWatching
    window.player.isWatching = toState
    Station.fire "visibilityChange", { fromState, toState }

# Setup Listeners
window.socket.on "playerID", (data) ->
  window.player.id = data.id
window.socket.on "addPlayers", addPlayers = (data) ->
  addPlayer = (player) ->
    NotificationCenter.info "#{player.fullName} has joined. Work Harder!"
    if Modernizr.sessionstorage
      sessionStorage.setItem player.id, player.fullName
  addPlayer(player) for player in data.players
  updatePlayerCount(data)

window.socket.on "removePlayers", removePlayers = (data) ->
  removePlayer = (player) ->
    if Modernizr.sessionstorage
      sessionStorage.removeItem player.id
  removePlayer(player) for player in data.players
  updatePlayerCount(data)


window.socket.on "playerDied", onPlayerDeath = (data) ->
  player = sessionStorage.getItem(data.id)
  NotificationCenter.info "Your friend #{player} has died. Work Harder!" unless window.player.id is data.id
  updatePlayerCount data
window.addEventListener "storage", updatePlayerCount

updatePlayerCount = (data) ->
  window.playerCount.innerHTML = "#{data.playerCount.all}"
  window.alivePlayerCount.innerHTML = "#{data.playerCount.areAlive}"

window.addEventListener "unload", (evt) ->
  sessionStorage.clear()
window.addEventListener "load", (evt) ->
  sessionStorage.clear()
