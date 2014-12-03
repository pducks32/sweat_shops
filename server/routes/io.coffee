module.exports = (app, io) ->
  _ = require "underscore"
  util = require 'util'
  Player = require './../models/player'

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
    g.players.push player
    g.io.emit "addPlayers", {
      players: [{id: player.id, fullName: player.fullName}]
      playerCount: getPlayerCount()
    }

  onUpdate = (data) ->
    player = getPlayerWithID(this.id)
    player.update data.player
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
    player.kill
    g.io.emit "playerDied", {
      id: player.id,
      player: player,
      playerCount: getPlayerCount()
    }

  onPurchase = (data) ->
    player = getPlayerWithID(this.id)
    player.addTransaction data.transaction
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
    g.io.emit "playerFilledBucket", {
      id: player.id,
      player: player
    }

  onDisconnect = (data) ->
    player = getPlayerWithID(this.id)
    player.update isConnected: false, isWatching: false
    g.io.emit "removePlayers", {
      players: [{id: player.id}]
      playerCount: getPlayerCount()
    }
  init(io)
