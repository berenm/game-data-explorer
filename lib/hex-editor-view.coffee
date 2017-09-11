FileEditorView = require './file-editor-view'

path = require 'path'
fs = require 'fs-plus'

module.exports =
class HEXEditorView extends FileEditorView
  @content: ->
    @div class: 'gde-editor', tabindex: -1, =>
      @div class: 'gde-container', =>
        @div class: 'hex-container', outlet: 'container', =>
          @div class: 'hex-metric', style: 'visibility: hidden', outlet: 'metricLine', =>
            @div class: 'hex-chars', => @div class: 'hex-char', '&nbsp'

  lineWidth: 32

  initialize: (@viewer) ->
    super
    @on 'mousewheel', (event) => @onMouseWheel(event.originalEvent.wheelDelta)

  destroy: ->
    @off 'mousewheel'
    super

  onMouseWheel: (delta) ->
    @viewOffset -= Math.ceil(delta / @metricLine.height()) * @lineWidth
    @refreshLines()

  refresh: ->
    @viewOffset = 0
    @viewEndOffset = 1024
    @metricLine.hide()

    @hexFile = fs.openSync @path, 'r'
    @hexFileSize = (fs.fstatSync @hexFile).size

    setTimeout =>
      @refreshLines()

  removeLines: ->
    firstOffset = @container.find('.hex-offset:first').text()
    startOffset = if firstOffset then parseInt firstOffset, 16 else 0
    startDropCount = Math.floor((@viewOffset - startOffset) / @lineWidth)

    lastOffset = @container.find('.hex-offset:last').text()
    endOffset = if lastOffset then parseInt(lastOffset, 16) + @lineWidth else @lineWidth
    endDropCount = Math.floor((endOffset - @viewEndOffset) / @lineWidth)

    if startDropCount > 0
      @container.find('.hex-line').slice(0, startDropCount).remove()

    if endDropCount > 0
      @container.find('.hex-line').slice(-endDropCount).remove()

  addLines: ->
    firstOffset = @container.find('.hex-offset:first').text()
    startOffset = if firstOffset then parseInt firstOffset, 16 else 0
    startMissCount = Math.ceil((startOffset - @viewOffset) / @lineWidth)

    lastOffset = @container.find('.hex-offset:last').text()
    endOffset = if lastOffset then parseInt(lastOffset, 16) + @lineWidth else 0
    endMissCount = Math.ceil((@viewEndOffset - endOffset) / @lineWidth)

    if endMissCount > 0
      @readLines endOffset, endMissCount, (lines) => @container.append lines

    if startMissCount > 0
      @readLines @viewOffset, startMissCount, (lines) => @container.prepend lines

  readLines: (offset, lineCount, callback) ->
    return if lineCount < 1
    lines = ''
    buffer = new Buffer @lineWidth

    readLine = (offset, lineCount) =>
      if offset < @hexFileSize
        fs.readSync @hexFile, buffer, 0, @lineWidth, offset
        line = bytes = chars = ''
        for byte, i in buffer
          bytes += "<div class='hex-byte color-#{byte}'>#{@toByte byte}</div>"
          chars += "<div class='hex-char'>#{@toChar byte}</div>"
        line += "<div class='hex-offset'>#{@toOffset offset}</div>"
        line += "<div class='hex-bytes'>#{bytes}</div>"
        line += "<div class='hex-chars'>#{chars}</div>"

        lines += "<div class='hex-line'>#{line}</div>"
      readLine offset + @lineWidth, lineCount - 1 if lineCount > 1
      callback lines if lineCount is 1

    readLine offset, lineCount

  refreshLines: ->
    viewSize = Math.floor(@container.height() / @metricLine.height()) * @lineWidth
    @viewOffset = Math.ceil(@hexFileSize / @lineWidth) * @lineWidth - viewSize if @viewOffset >= @hexFileSize - viewSize
    @viewOffset = 0 if @viewOffset < 0
    @viewEndOffset = @viewOffset + viewSize
    @addLines()
    @removeLines()

  toOffset: (offset) ->
    hex = offset.toString 16
    return "#{'00000000'.substring hex.length}#{hex}"

  toByte: (byte) ->
    hex = byte.toString 16
    return "#{'00'.substring hex.length}#{hex}"

  toChar: (byte) ->
    return String.fromCharCode(byte) if 32 <= byte <= 126
    return '.'
