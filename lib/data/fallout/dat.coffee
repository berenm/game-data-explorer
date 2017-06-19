{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'
{FourCC} = require '../../common/fourcc'

path = require 'path'
fs = require 'fs'

class DAT
  @nameParser = new Parser()
    .endianess 'big'
    .uint8 'name_length'
    .string 'value', length: 'name_length'
  allowUnsafeNewFunction(=> @nameParser.compile())
  @nameParser.size = @nameParser.sizeOf()

  @fileParser = new Parser()
    .endianess 'big'
    .nest 'name', type: @nameParser
    .uint32 'flags'
    .uint32 'offset'
    .uint32 'size_uncompressed'
    .uint32 'size_compressed'
  allowUnsafeNewFunction(=> @fileParser.compile())
  @fileParser.size = @fileParser.sizeOf()

  @folderParser = new Parser()
    .endianess 'big'
    .uint32 'file_count'
    .uint32 'unknown'
    .uint32 'unknown'
    .uint32 'timestamp'
    .array 'files', type: @fileParser, length: 'file_count'
  allowUnsafeNewFunction(=> @folderParser.compile())
  @folderParser.size = @folderParser.sizeOf()

  @headerParser = new Parser()
    .endianess 'big'
    .uint32 'folder_count'
    .uint32 'unknown'
    .uint32 'unknown'
    .uint32 'timestamp'
    .array 'folder_names', type: @nameParser, length: 'folder_count'
    .array 'folders', type: @folderParser, length: 'folder_count'
  allowUnsafeNewFunction(=> @headerParser.compile())
  @headerParser.size = @headerParser.sizeOf()

  @flags:
    32: 'none'
    64: 'lzss'

  parse: (parser) ->
    buffer = new Buffer parser.size
    bytes = fs.readSync @file, buffer, 0, parser.size
    return parser.parse(buffer)

  constructor: (@path) ->
    @file = fs.openSync @path, 'r'
    @fileSize = (fs.fstatSync @file).size

    DAT.headerParser.size = @fileSize
    @header = @parse DAT.headerParser

    @files = []
    for folder, i in @header.folders
      folder_name = @header.folder_names[i].value.replace /\\/g, '/'
      for file in folder.files
        file_name = file.name.value.replace /\\/g, '/'
        @files["#{folder_name}/#{file_name}"] = file

  list: ->
    out = []
    for filePath, file of @files
      out.push path.join(@path, filePath)
    return out

module.exports =
  DAT: DAT
