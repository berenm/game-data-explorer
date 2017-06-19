FileEditorView = require './file-editor-view'

exec = require('child_process').execSync
fs = require 'fs'

{ART} = require './data/arcanum/art'

module.exports =
class ARTEditorView extends FileEditorView
  @content: ->
    @div class: 'xoreos-editor', tabindex: -1, =>
      @div class: 'xoreos-container', =>
        @div class: 'image-container', =>
          @div class: 'image-cell', =>
            @img outlet: 'image'

  refresh: ->
    artFile = new ART @path

    frameList = "-dispose previous -delay #{artFile.header.frame_rate}x1000"
    maxWidth = 0
    maxHeight = 0
    maxOffX = 0
    maxOffY = 0
    for i, frame of artFile.frames
      maxWidth = Math.max(frame.width - frame.off_x, maxWidth)
      maxHeight = Math.max(frame.height - frame.off_y, maxHeight)
      maxOffX = Math.max(frame.off_x, maxOffX)
      maxOffY = Math.max(frame.off_y, maxOffY)

    for i, frame of artFile.frames
      buffer = new Buffer frame.pixels.length * 4
      offset = 0
      for j in [0..frame.pixels.length - 1]
        palette = artFile.palettes[0]
        pixel = frame.pixels[j]
        if pixel is 0
          color = 0
        else
          color = palette.color[pixel] + 0xff000000

        buffer.writeUInt8 (color >> 16) & 0xff, offset++
        buffer.writeUInt8 (color >>  8) & 0xff, offset++
        buffer.writeUInt8 (color >>  0) & 0xff, offset++
        buffer.writeUInt8 (color >> 24) & 0xff, offset++

      fileName = "#{@path}-#{i}.pam"
      frameFile = fs.openSync fileName, 'w'
      fs.appendFileSync frameFile,
                       'P7\n' +
                       "WIDTH #{frame.width}\n" +
                       "HEIGHT #{frame.height}\n" +
                       'DEPTH 8\n' +
                       'MAXVAL 255\n' +
                       'TUPLTYPE RGB_ALPHA\n' +
                       'ENDHDR\n'
      fs.appendFileSync frameFile, buffer
      frameList += " -page +#{maxOffX - frame.off_x}+#{maxOffY - frame.off_y} '#{fileName}'"

    exec("convert -size #{maxOffX + maxWidth}x#{maxOffY + maxHeight} xc:none #{frameList} '#{@path}.gif'")
    @image.attr('src', "#{@path}.gif")
