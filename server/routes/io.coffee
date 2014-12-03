module.exports = (app, io) ->
  _ = require "underscore"
  util = require 'util'
  Player = require './../models/player'

  green = '\u001b[42m \u001b[0m'
  red = '\u001b[41m \u001b[0m'
  g = {
    io: undefined
    players: []
  }

  init = (sio) ->
    g.io = sio
    bindSocketEvents()
    g

  getPlayerCount = ->
    all = g.players.length
    areConnected = _.where(g.players, {isConnected: true}).length
    areAlive = _.where(g.players, {isDead: false, isConnected: true}).length
    {all, areConnected, areAlive}

  getPlayerWithID = (id) ->
    _.find g.players, {id}

  bindSocketEvents = ->
    g.io.sockets.on 'connection', (socket) ->
      util.log "Client Connected: #{socket.id}"
      socket.emit "playerID", {id: socket.id}
      socket.emit "addPlayers", {
        players: g.players.map (player) -> {id: player.id, fullName: player.fullName}
        playerCount: getPlayerCount()
      }
      socket.on 'disconnect', onDisconnect
      socket.on 'newPlayer', onNewPlayer
      socket.on 'update', onUpdate
      socket.on 'getPlayer', onGetPlayer
      socket.on 'correctbox', onCorrectBox
      socket.on 'wrongbox', onWrongBox
      socket.on 'death', onDeath
      socket.on 'break', onBreak
      #socket.on 'visibilityChange', onVisibilityChange
      socket.on 'purchase', onPurchase
      socket.on 'bucketFilled', onBucketFilled
      socket.on 'debug', onDebug

  onDebug = (data) ->
    util.log data.text

  onVisibilityChange = (data) ->
    player = getPlayerWithID(this.id)
    util.log util.inspect(player)
    player.update isWatching: data.toState
    g.io.emit "playerVisibilityChanged", {
      id: player.id,
      from: data.fromState,
      to: data.toState
    }

  onNewPlayer = (data) ->
    player = new Player this.id, data
    util.log "#{player.fullName} joined!"
    g.players.push player
    g.io.emit "addPlayers", {
      players: [{id: player.id, fullName: player.fullName}]
      playerCount: getPlayerCount()
    }

  onUpdate = (data) ->
    player = getPlayerWithID(this.id)
    if player?
      util.log "#{player.fullName} has #{player.energy} energy left!" if (0.24 <= player.energy <= 0.26) or (0.49 <= player.energy <= 0.51)
      player?.update data.player
      g.io.emit "playerUpdated", {
        id: player.id,
        player: player
      }

  onGetPlayer = (data) ->
    player = getPlayerWithID(data.id)
    this.emit "player", {
      player: player
    }

  onBreak = (data) ->
    player = getPlayerWithID(this.id)
    util.log "#{player.fullName} took a break :("
    g.io.emit "playerTookBreak", {
      id: player.id,
      player: player,
    }
    player.kill
    g.io.emit "playerDied", {
      id: player.id,
      player: player,
      playerCount: getPlayerCount()
    }

  onDeath = (data) ->
    player = getPlayerWithID(this.id)
    util.log "#{player.fullName} died!"
    player.kill
    g.io.emit "playerDied", {
      id: player.id,
      player: player,
      playerCount: getPlayerCount()
    }

  onPurchase = (data) ->
    player = getPlayerWithID(this.id)
    player.addTransaction data.transaction
    util.log "#{player.fullName} made a purchase"
    g.io.emit "purchaseMade", {
      id: player.id,
      name: data.transaction.name
      player: player
    }

  onCorrectBox = (data) ->
    player = getPlayerWithID(this.id)
    g.io.emit "playerCorrectBox", {
      id: player.id
      box: data.box
      buckets: data.buckets
    }

  onWrongBox = (data) ->
    player = getPlayerWithID(this.id)
    g.io.emit "playerWrongBox", {
      id: player.id
      box: data.box
      buckets: data.buckets
    }

  onBucketFilled = (data) ->
    player = getPlayerWithID(this.id)
    util.log "#{player.fullName} filled a Bucket!"
    g.io.emit "playerFilledBucket", {
      id: player.id,
      player: player
    }

  onDisconnect = (data) ->
    player = getPlayerWithID(this.id)
    util.log "#{player.fullName} left!!" if player?
    player?.update isConnected: false, isWatching: false
    g.io.emit "removePlayers", {
      players: [{id: this.id}]
      playerCount: getPlayerCount()
    }
  init(io)
