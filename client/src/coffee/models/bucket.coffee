{Station} = require "./station"
exports.Bucket =
class Bucket
  constructor: (options) ->
    {@container, @color, @totalValue, @requiredAmount} = options
    @requiredAmount ||= 12
    @totalValue ||= 0.1
    @element = @container.querySelector(".Bucket__DropZone")
    @tallyElement = @container.querySelector(".Bucket__Tally")
    @draggie = new Droppable(@element, {
      onDrop: (instance, draggableEle) =>
        @onDrop()
      })
  currentTally: 0
  on: (type, listener, useCapture=false) ->
    @element.addEventListener(type, listener, useCapture)
  registerHandlers: ->
    @on("dragenter", @onDragEnter)
    @on("dragleave", @onDragLeave)
  onDragEnter: (e) ->
    e.target.classList.add("Bucket--dragover")
  onDropLeave: (e) ->
    e.target.classList.remove("Bucket--dragover")
  onDrop: ->
    #$conveyorBelt.removeBox $draggedBox
    if window.draggedBox.color == @color
      @dropSuccessful()
    else
      @dropFailed()
  dropSuccessful: ->
    @tallyElement.classList.remove("drop--success")
    @tallyElement.classList.remove("drop--failure")
    @currentTally++
    @tallyElement.classList.add("drop--success")
    @updateTally()
    Station.fire "correctBox", {
      box: @color
    }

  dropFailed: ->
    @tallyElement.classList.remove("drop--success")
    @tallyElement.classList.remove("drop--failure")
    @currentTally--
    @tallyElement.classList.add("drop--failure")
    @updateTally()
    Station.fire "wrongBox", {
      box: @color
    }

  updateTally: ->
    if @isFull()
      Station.fire "bucketFilled"
      @empty()
      window.player.updateBalance @totalValue
    newText = "#{@currentTally}/#{@requiredAmount}"
    @tallyElement.innerHTML = newText
  isFull: ->
    @currentTally == @requiredAmount
  empty: ->
    @currentTally = 0
