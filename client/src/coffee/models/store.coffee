{Transaction} = require "./transaction"
{Station} = require "./station"
exports.Store =
class Store
  @items: []
  @addItem: (item) ->
    @items.push item
  @buy: (item) ->
    transaction = new Transaction item
    if window.player.canAfford(transaction) and transaction.name isnt "a break"
      transaction.isSuccess = true
      transaction.apply()
    else if transaction.name is "a break"
      Station.fire "tookBreak"
      transaction.isSuccess = true
    else
      transaction.isSuccess = false
    Station.fire "#{transaction.state()}Purchase", transaction
