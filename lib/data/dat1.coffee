{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'
{FourCC} = require '../common/fourcc'

path = require 'path'
fs = require 'fs'

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
    buffer = new Buffer parser.size
    bytes = fs.readSync @file, buffer, 0, parser.size, offset
    return parser.parse(buffer)

  constructor: (@path) ->
    @file = fs.openSync @path, 'r'
    @fileSize = (fs.fstatSync @file).size
    @footer = @parse DAT1.footerParser, @fileSize - DAT1.footerParser.size

  list: ->
    indexParser = DAT1.indexParser
    indexParser.size = @footer.index_offset - DAT1.footerParser.size
    @index = @parse indexParser, @fileSize - @footer.index_offset

    @files = []
    for file in @index.files
      if DAT1.types[file.type] isnt 'folder'
        @files[file.name.replace /\\/g, '/'] = file

    out = []
    for filePath, file of @files
      out.push path.join(@path, filePath)
    return out

module.exports =
  DAT1: DAT1
