{Box} = require "./box"
{Bucket} = require "./bucket"
{ConveyorBelt} = require "./conveyor_belt"
{Item} = require "./item"
{Player} = require "./player"
{Station} = require "./station"
{Store} = require "./store"
{Transaction} = require "./transaction"

# Setup Dragging Functionality
$draggedBox = null

# Setup Buckets
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
$buckets = [redBucket.draggie, blueBucket.draggie, greenBucket.draggie, yellowBucket.draggie]

# Setup Boxes...FOR NOW
redBox = new Box document.querySelector(".Box--red"), "red"
blueBox = new Box document.querySelector(".Box--blue"), "blue"
greenBox = new Box document.querySelector(".Box--green"), "green"
purpleBox = new Box document.querySelector(".Box--yellow"), "yellow"

# Setup Player
$energyField = document.querySelector(".Player__energy")
$balanceField = document.querySelector(".Player__balance")
$nameField = document.querySelector(".Player__name")
$player = new Player("Patrick Metcalfe")
$player.render()

# Setup Store
foodItem = Item.fromSelector ".Item--food"
waterItem = Item.fromSelector ".Item--water"
breakItem = Item.fromSelector ".Item--break"
Store.addItem foodItem
Store.addItem waterItem
Store.addItem breakItem

# Setup Notification Center
# humane.baseCls = "humane-flatty"
$notificationCenter = {}
$notificationCenter.congratulate = humane.spawn({ addnCls: 'humane-flatty-success', timeout: 1000 })
$notificationCenter.error = humane.spawn({ addnCls: 'humane-flatty-error', timeout: 1000 })
$notificationCenter.info = humane.spawn({ addnCls: 'humane-flatty-info', timeout: 750 })

# Setup Socket
$socket = io('localhost:8000')
Station.fire "newPlayer"

# Setup Visability
if Modernizr.pagevisibility
  hidden = Modernizr.prefixed('hidden', document, false)
  visabilityChange = Modernizr.prefixed('visibilitychange', document, false)
  document.addEventListener hidden, ->
    toState = document[hidden]
    fromState = $player.isWatching
    $player.isWatching = toState
    Station.fire "visibilityChange", { fromState, toState }

# Setup Listeners
$socket.on "playerID", (data) ->
  console.log "Recieved 'playerID' with id: #{data.id}"
  $player.id = data.id
$socket.on "addPlayers", addPlayers
$socket.on "removePlayers", removePlayers
addPlayer = (player) ->
  if Modernizr.sessionstorage
    sessionStorage.setItem player.id, player.name
addPlayers = (data) ->
  addPlayer(player) for player in data.players
removePlayer = (player) ->
  if Modernizr.sessionstorage
    sessionStorage.removeItem player.id
removePlayers = (data) ->
  removePlayer(player) for player in data.players

# Setup Player Count
$playerCount = document.querySelector ".player-count"
$alivePlayerCount = document.querySelector ".alive-player-count"

socket.on "playerDied", onPlayerDeath
window.addEventListener "storage", updatePlayerCount
onPlayerDeath = (data) ->
  player = sessionStorage.getItem(data.id)
  $notificationCenter.info "Your friend #{player} has died. Work Harder!"
  updatePlayerCount data
updatePlayerCount = (data) ->
  $playerCount.innerHtml = "#{sessionStorage.length}"
  $alivePlayerCount.innerHtml = "#{data.alivePlayerCount}" if data.alivePlayerCount?
