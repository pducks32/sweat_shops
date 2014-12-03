exports.Transaction =
class Transaction
  constructor: (@item) ->
    @price = @item.price
    @name = @item.name
  apply: ->
    @time = Date.now()
    window.player.updateEnergy @item.energy
    window.player.updateBalance (-1*@price)
  state: ->
    if @isSuccess then "successful" else "failed"
