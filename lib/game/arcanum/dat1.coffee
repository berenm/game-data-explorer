{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'
{FourCC} = require '../../core/util'

path = require 'path'
fs = require 'fs'
zlib = require 'zlib'

class DAT1
  @fileParser = new Parser()
    .endianess 'little'
    .uint32 'name_size'
    .string 'name', zeroTerminated: true
    .uint32 'name_offset'
    .uint32 'type'
    .uint32 'size_uncompressed'
    .uint32 'size_compressed'
    .uint32 'offset'
  allowUnsafeNewFunction(=> @fileParser.compile())
  @fileParser.size = @fileParser.sizeOf()

  @indexParser = new Parser()
    .endianess 'little'
    .uint32 'count'
    .array 'files', type: @fileParser, readUntil: 'eof'
  allowUnsafeNewFunction(=> @indexParser.compile())
  @indexParser.size = @indexParser.sizeOf()

  @footerParser = new Parser()
    .endianess 'little'
    .array 'uuid', length: 16, type: 'uint8'
    .string 'magic', length: 4, assert: '1TAD'
    .uint32 'filenames_size'
    .uint32 'index_offset'
  allowUnsafeNewFunction(=> @footerParser.compile())
  @footerParser.size = @footerParser.sizeOf()

  @types:
    1: 'none'
    2: 'zlib'
    1024: 'folder'

  parse: (parser, offset) ->
    buffer = @file.readSync offset, parser.size
    return parser.parse(buffer)

  constructor: (@file) ->
    @footer = @parse DAT1.footerParser, @file.size - DAT1.footerParser.size

  list: ->
    indexParser = DAT1.indexParser
    indexParser.size = @footer.index_offset - DAT1.footerParser.size
    @index = @parse indexParser, @file.size - @footer.index_offset

    @files = []
    for file in @index.files
      if DAT1.types[file.type] isnt 'folder'
        @files[file.name.replace /\\/g, '/'] = file

    out = []
    for filePath, file of @files
      out.push path.join(@file.path, filePath)
    return out

  read: (entry) ->
    if DAT1.types[entry.type] is 'zlib'
      return zlib.inflateSync(@file.readSync entry.offset, entry.size_compressed)
    else
      return buffer = @file.readSync entry.offset, entry.size_uncompressed

module.exports =
  DAT1: DAT1
