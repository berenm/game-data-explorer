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

  parse: (parser) ->
    buffer = new Buffer parser.size
    bytes = fs.readSync @file, buffer, 0, parser.size
    return parser.parse(buffer)

  parseEntries: (parent) ->
    loop
      entry = @parse PCK.entryParser
      entry.name = "#{parent.name}/#{entry.name}"
      @files[entry.name] = entry if entry.type is 0
      @parseEntries entry        if entry.type is 1
      break                      if entry.type is 0xff

  constructor: (@path) ->
    @file = fs.openSync @path, 'r'
    @fileSize = (fs.fstatSync @file).size
    @filePos = 0

    @files = []
    @parseEntries @parse PCK.entryParser

  list: ->
    out = []
    for filePath, file of @files
      out.push path.join(@path, filePath)
    return out

module.exports =
  PCK: PCK
