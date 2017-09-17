{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'
{FourCC} = require '../fourcc'

path = require 'path'
fs = require 'fs'
zlib = require 'zlib'

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
    return parser.parse(@file.readSync offset, parser.size)

  constructor: (@file) ->
    @footer = @parse DAT.footerParser, @file.size - DAT.footerParser.size
    if @footer.file_size isnt @file.size
      throw new Error 'Footer file size does not match file size'

    indexParser = DAT.indexParser
    indexParser.size = @footer.index_size
    @index = @parse indexParser, @file.size - @footer.index_size - DAT.footerParser.size

    @files = []
    for file in @index.files
      @files[file.name.value.replace /\\/g, '/'] = file

  list: ->
    out = []
    for filePath, file of @files
      out.push path.join(@file.path, filePath)
    return out

  read: (entry) ->
    if DAT.flags[entry.flags] is 'zlib'
      return zlib.inflateSync(@file.readSync entry.offset, entry.size_compressed)
    else
      return @file.readSync entry.offset, entry.size_uncompressed

module.exports =
  DAT: DAT
