{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'

path = require 'path'
fs = require 'fs'

class DIR
  @entryParser = new Parser()
    .endianess 'little'
    .string 'name', length: 32, stripNull: true
    .uint32 'type'
    .uint32 'size'
    .uint32 'offset'
  allowUnsafeNewFunction(=> @entryParser.compile())
  @entryParser.size = @entryParser.sizeOf()

  parse: (parser, offset) ->
    return parser.parse(@file.readSync offset, parser.size)

  parseEntries: (folder, offset) ->
    loop
      entry = @parse DIR.entryParser, offset
      offset += DIR.entryParser.size
      entry.name = entry.name.replace /\x00.*$/g, ''
      entry.name = "#{folder}#{entry.name}"
      @files[entry.name] = entry                      if entry.type is 0xcdcdcd00
      offset = @parseEntries "#{entry.name}/", offset if entry.type is 0xcdcdcd01
      break                                           if entry.type is 0xcdcdcdff
    return offset

  constructor: (@file) ->
    @files = []
    @parseEntries '', 0

  list: ->
    out = []
    for filePath, file of @files
      out.push path.join(@file.path, filePath)
    return out

  read: (entry) ->
    return @file.readSync entry.offset, entry.size

module.exports =
  DIR: DIR
