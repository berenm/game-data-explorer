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

  parse: (parser) ->
    buffer = new Buffer parser.size
    bytes = fs.readSync @file, buffer, 0, parser.size
    return parser.parse(buffer)

  parseEntries: (folder) ->
    loop
      entry = @parse DIR.entryParser
      entry.name = "#{folder}#{entry.name}"
      @files[entry.name] = entry     if entry.type is 0xcdcdcd00
      @parseEntries "#{entry.name}/" if entry.type is 0xcdcdcd01
      break                          if entry.type is 0xcdcdcdff

  constructor: (@path) ->
    @file = fs.openSync @path, 'r'
    @fileSize = (fs.fstatSync @file).size
    @filePos = 0

    @files = []
    @parseEntries ''

  list: ->
    out = []
    for filePath, file of @files
      out.push path.join(@path, filePath)
    return out

module.exports =
  DIR: DIR
