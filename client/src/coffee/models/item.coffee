exports.Item =
class Item
  constructor: (@name, @price, @energy, @element="") ->
    @element.addEventListener "click", (evt) => Store.buy this
  @fromElement: (element) ->
    name = element.dataset.name
    price = parseFloat element.dataset.price
    energyGain = parseFloat element.dataset.energy
    new Item(name, price, energyGain, element)
  @fromId: (id) ->
    @fromElement document.getElementById id
  @fromSelector: (selector) ->
    @fromElement document.querySelector selector
