_ = require "underscore"
exports.Box =
class Box
  @colors: ["red", "blue", "green", "yellow"]
  @randomColor: ->
    _.sample @colors
  @renderColor: (color) ->
    "<div class=\"Box Box--#{color}\></div>"
  constructor: (@element, @color) ->
    @draggie = new Draggable(@element, window.buckets, {
      draggability: {containment: "#scene"},
      scroll: false,
      onStart: => @onDragStart(),
      onEnd: (wasDropped) => @onDragEnd(wasDropped)
      })
  onDragStart: ->
    window.draggedBox = this
    @element.classList.add("Box--dragging")
    #$conveyorBelt.hideBox $draggedElement
  onDragEnd: (wasDropped) ->
    @element.classList.remove("Box--dragging")
    if wasDropped
      @element.classList.remove("Box--#{@color}")
      @color = Box.randomColor()
      @element.classList.add("Box--#{@color}")
