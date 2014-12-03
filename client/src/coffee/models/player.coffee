exports.Player =
class Player
  constructor: (@fullName) ->
  id: 0
  firstName: -> @fullName.split(" ")[0]
  lastName: -> @fullName.split(" ")[1]
  energyField: document.querySelector(".Player__energy")
  balanceField: document.querySelector(".Player__balance")
  nameField: document.querySelector(".Player__name")
  balance: 0.00
  energy: 1
  isDead: false
  canAfford: (item) ->
    @balance >= item.price
  willKill: (amount) -> (@energy + amount) <= 0
  kill: ->
    @isDead = true
    clearInterval window.energyInterval
    @energy = 0
    @renderEnergy()
    Station.fire "playerDied"
  updateEnergy: (amount) ->
    return @kill() if @willKill amount
    from = @energy
    @energy = parseFloat (@energy + amount).toFixed(2)
    Station.fire "playerUpdate", {
      field: "energy"
      from: from
      to: @energy
    }
    @renderEnergy()
  updateBalance: (amount) ->
    from = @balance
    @balance = parseFloat (@balance + amount).toFixed(2)
    Station.fire "playerUpdate", {
      field: "balance"
      from: from
      to: @balance
    }
    @renderBalance()
  render: ->
    @renderName()
    @renderBalance()
    @renderEnergy()
  renderName: ->
    @nameField.innerHTML = @firstName()
  renderBalance: ->
    @balanceField.innerHTML = "$#{@balance}"
  renderEnergy: ->
    @energyField.innerHTML = "#{@energy * 100}%"
