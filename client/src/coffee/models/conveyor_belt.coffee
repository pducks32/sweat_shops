exports.ConveyorBelt =
class ConveyorBelt
  @colors: ["red", "blue", "green", "yellow"]
  @randomColor: ->
    _.sample @colors
  constructor: (@element) ->
  boxes: [[]]
  addBox: (box) ->
    @boxes.push(box)
  newBox: (color=@randomColor) ->
    addBox Box.renderColor(color), (new Box(color))
