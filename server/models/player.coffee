module.exports =
class Player
  constructor: (@id, {@fullName, @balance, @energy, @isDead, @lastUpdated, @transactions, @isConnected, @isWatching} = {}) ->
     @balance ?= 0
     @energy ?= 1
     @isDead ?= false
     @lastUpdated ?= Date.now()
     @transactions ?= []
     @isConnected ?= true
     @isWatching ?= true
  update: ({fullName, balance, energy, isDead, @transactions, isConnected, isWatching} = {}) ->
    @balance = balance if balance?
    @energy = energy if energy?
    @isDead = isDead if isDead?
    @transactions = transactions if transactions?
    @isConnected = isConnected if isConnected?
    @isWatching = isWatching if isWatching?
    @lastUpdated = Date.now()
  addTransaction: (transaction) -> @transactions? ? @transactions.push transaction : @transactions = [transaction]
  kill: -> update isDead: true
  serialize: ->
    {
      id: @id
      fullName: @fullName
      balance: @balance
      energy: @energy
      isDead: @isDead
    }
