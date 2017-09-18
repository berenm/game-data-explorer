{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'

path = require 'path'
fs = require 'fs'

class PCK
  @entryParser = new Parser()
    .endianess 'little'
    .string 'name', length: 32, stripNull: true
    .uint32 'unknown'
    .uint32 'type'
    .uint32 'size'
    .uint32 'offset'
  allowUnsafeNewFunction(=> @entryParser.compile())
  @entryParser.size = @entryParser.sizeOf()

  parse: (parser, offset) ->
    buffer = new Buffer parser.size
    return parser.parse(@file.readSync offset, parser.size)

  parseEntries: (parent, offset) ->
    loop
      entry = @parse PCK.entryParser, offset
      offset += PCK.entryParser.size
      entry.name = "#{parent.name}/#{entry.name}"
      @files[entry.name] = entry           if entry.type is 0
      offset = @parseEntries entry, offset if entry.type is 1
      break                                if entry.type is 0xff
    return offset

  constructor: (@file) ->
    @files = []
    entry = @parse PCK.entryParser, 0
    @parseEntries entry, PCK.entryParser.size

  list: ->
    out = []
    for filePath, file of @files
      out.push path.join(@file.path, filePath)
    return out

  read: (entry) ->
    return @file.readSync entry.offset, entry.size

module.exports =
  PCK: PCK
