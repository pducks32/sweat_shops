# util.log_request = require "./../helpers/log_request"
exports.Station =
class Station
  @fire: (name, details) ->
    switch name
      when "newPlayer" then @onNewPlayer()
      when "playerUpdate" then @onPlayerUpdate details
      when "correctBox" then @onCorrectBox details
      when "wrongBox" then @onWrongBox details
      when "getPlayer" then @onGetPlayer details
      when "tookBreak" then @onTookBreak()
      when "successfulPurchase" then @onSuccessfulPurchase details
      when "failedPurchase" then @onFailedPurchase details
      when "bucketFilled" then @onBucketFilled()
      when "visibilityChange" then @onVisibilityChange details
      when "playerDied" then @onPlayerDeath()
      else console.error("UNKNOWN EVENT: (#{name})")
  @onNewPlayer: (details) ->
    window.socket.emit "newPlayer", window.player
  @onPlayerUpdate: (details) ->
    window.socket.emit "update", {player: window.player}
  @onSuccessfulPurchase: (details) ->
    NotificationCenter.congratulate "You have bought #{details.name} for $#{details.price.toFixed(2)}"
    window.socket.emit "purchase", {
      transaction: {
        name: details.name
        price: details.price
      }
    }
  @onFailedPurchase: (details) ->
    NotificationCenter.error "You do not have enough money. Work Harder!"
  @onBucketFilled: ->
    window.socket.emit "bucketFilled"
  @onGetPlayer: (details) ->
    window.socket.emit "getPlayer", {
      id: details.id
    }
  @onTookBreak = ->
    clearInterval window.energyInterval
    window.gameOver("No Breaks", "Because you took a break you were fired from your job and without a source of income: you died.")
    window.socket.emit "break"
  @onPlayerDeath: ->
    window.gameOver("You Died", "You had no energy left and literally fell over on the job. Your manager didn't even notice.")
    window.socket.emit "death"
  @onCorrectBox: (details) ->
    buckets = window.bucketList.map (bucket) ->
      {
        color: bucket.color,
        currentTally: bucket.currentTally,
        requiredAmount: bucket.requiredAmount,
        totalValue: bucket.totalValue
      }

    window.socket.emit "correctbox", {
      box: details.box
      buckets: buckets
    }
  @onWrongBox: (details) ->
    buckets = window.bucketList.map (bucket) ->
      {
        color: bucket.color,
        currentTally: bucket.currentTally,
        requiredAmount: bucket.requiredAmount,
        totalValue: bucket.totalValue
      }

    window.socket.emit "wrongbox", {
      box: details.box
      buckets: buckets
    }
  @onVisibilityChange: (details) ->
    window.socket.emit "visibilityChange", {
      fromState: details.fromState
      toState: details.toState
    }
