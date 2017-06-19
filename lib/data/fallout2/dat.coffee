{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'
{FourCC} = require '../../common/fourcc'

path = require 'path'
fs = require 'fs'

class DAT
  @nameParser = new Parser()
    .endianess 'little'
    .uint32 'name_length'
    .string 'value', length: 'name_length'
  allowUnsafeNewFunction(=> @nameParser.compile())
  @nameParser.size = @nameParser.sizeOf()

  @fileParser = new Parser()
    .endianess 'little'
    .nest   'name', type: @nameParser
    .uint8  'flags'
    .uint32 'size_uncompressed'
    .uint32 'size_compressed'
    .uint32 'offset'
  allowUnsafeNewFunction(=> @fileParser.compile())
  @fileParser.size = @fileParser.sizeOf()

  @indexParser = new Parser()
    .endianess 'little'
    .uint32 'file_count'
    .array 'files', type: @fileParser, length: 'file_count'
  allowUnsafeNewFunction(=> @indexParser.compile())
  @indexParser.size = @indexParser.sizeOf()

  @footerParser = new Parser()
    .endianess 'little'
    .uint32 'index_size'
    .uint32 'file_size'
  allowUnsafeNewFunction(=> @footerParser.compile())
  @footerParser.size = @footerParser.sizeOf()

  @flags:
    0: 'none'
    1: 'zlib'

  parse: (parser, offset) ->
    buffer = new Buffer parser.size
    bytes = fs.readSync @file, buffer, 0, parser.size, offset
    return parser.parse(buffer)

  constructor: (@path) ->
    @file = fs.openSync @path, 'r'
    @fileSize = (fs.fstatSync @file).size
    @footer = @parse DAT.footerParser, @fileSize - DAT.footerParser.size
    if @footer.file_size isnt @fileSize
      throw new Error 'Footer file size does not match file size'

    indexParser = DAT.indexParser
    indexParser.size = @footer.index_size
    @index = @parse indexParser, @fileSize - @footer.index_size - DAT.footerParser.size

    @files = []
    for file in @index.files
      @files[file.name.value.replace /\\/g, '/'] = file

  list: ->
    out = []
    for filePath, file of @files
      out.push path.join(@path, filePath)
    return out

module.exports =
  DAT: DAT
