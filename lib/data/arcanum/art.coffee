{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'
{FourCC} = require '../../common/fourcc'

path = require 'path'
fs = require 'fs'

class ART
  @frameParser = new Parser()
    .endianess 'little'
    .uint32 'width'
    .uint32 'height'
    .uint32 'size'
    .int32 'off_x'
    .int32 'off_y'
    .int32 'hot_x'
    .int32 'hot_y'
  allowUnsafeNewFunction(=> @frameParser.compile())
  @frameParser.size = @frameParser.sizeOf()

  @paletteParser = new Parser()
    .endianess 'little'
    .array 'color', length: 256, type: 'uint32le'
  allowUnsafeNewFunction(=> @paletteParser.compile())
  @paletteParser.size = @paletteParser.sizeOf()

  @headerParser = new Parser()
    .endianess 'little'
    .uint32 'flags'
    .uint32 'frame_rate'
    .uint32 'rotation_count'
    .array 'palette_list', length: 4, type: 'uint32le'
    .uint32 'action_frame'
    .uint32 'frame_count'
    .array 'info_list', length: 8, type: 'uint32le'
    .array 'size_list', length: 8, type: 'uint32le'
    .array 'data_list', length: 8, type: 'uint32le'
  allowUnsafeNewFunction(=> @headerParser.compile())
  @headerParser.size = @headerParser.sizeOf()

  parse: (parser, offset) ->
    buffer = new Buffer parser.size
    bytes = fs.readSync @file, buffer, 0, parser.size, offset
    return parser.parse(buffer)

  constructor: (@path) ->
    @file = fs.openSync @path, 'r'
    @fileSize = (fs.fstatSync @file).size
    @header = @parse ART.headerParser, 0

    if @header.flags & 1
      @header.rotation_count = 1

    @palettes = []
    for i in [0..3]
      if @header.palette_list[i] isnt 0
        @palettes.push @parse ART.paletteParser,
                              ART.headerParser.size +
                              ART.paletteParser.size * i

    @frames = []
    for i in [0..@header.frame_count * @header.rotation_count - 1]
      @frames.push @parse ART.frameParser,
                          ART.headerParser.size +
                          ART.paletteParser.size * @palettes.length +
                          ART.frameParser.size * i

    offset = ART.headerParser.size +
             ART.paletteParser.size * @palettes.length +
             ART.frameParser.size * @frames.length
    for frame in @frames
      buffer = new Buffer frame.size
      fs.readSync @file, buffer, 0, frame.size, offset
      offset += frame.size

      if frame.size is frame.width * frame.height
        frame.pixels = buffer
      else
        frame.pixels = new Buffer frame.width * frame.height
        i = j = 0
        while i < buffer.length
          byte = buffer[i++]
          rep = byte & 0x80
          cnt = byte & 0x7f
          for n in [0..cnt - 1]
            frame.pixels[j++] = buffer[i]
            i++ if rep isnt 0
          i++ if rep is 0

  list: ->
    out = []
    for filePath, file of @files
      out.push path.join(@path, filePath)
    return out

module.exports =
  ART: ART
