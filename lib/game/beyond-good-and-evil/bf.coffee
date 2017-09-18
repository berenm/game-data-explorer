{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'
{FourCC} = require '../../core/util'

path = require 'path'
fs = require 'fs'
lzo = require 'lzo'

class BF
  @entryParser = new Parser()
    .endianess 'little'
    .uint32 'offset'
    .uint32 'u000'
  allowUnsafeNewFunction(=> @entryParser.compile())
  @entryParser.size = @entryParser.sizeOf()

  @fileParser = new Parser()
    .endianess 'little'
    .uint32 'size'
    .uint32 'next'
    .uint32 'prev'
    .uint32 'folder'
    .uint32 'timestamp'
    .string 'name', length: 64, stripNull: true
  allowUnsafeNewFunction(=> @fileParser.compile())
  @fileParser.size = @fileParser.sizeOf()

  @folderParser = new Parser()
    .endianess 'little'
    .uint32 'id'
    .uint32 'child'
    .uint32 'next'
    .uint32 'prev'
    .uint32 'parent'
    .string 'name', length: 64, stripNull: true
  allowUnsafeNewFunction(=> @folderParser.compile())
  @folderParser.size = @folderParser.sizeOf()

  @headerParser = new Parser()
    .endianess 'little'
    .string 'magic', length: 4, assert: ((x) -> x is 'BIG\x00')
    .uint32 'u000'
    .uint32 'fileCount'
    .uint32 'folderCount'
    .uint32 'u001'
    .uint32 'u002'
    .uint32 'u003'
    .uint32 'u004'
    .uint32 'fileCapacity'
    .uint32 'u005'
    .uint32 'u006'
    .uint32 'fileCountBis'
    .uint32 'u007'
    .uint32 'offset'
    .uint32 'u008'
    .uint32 'u009'
    .uint32 'u010'
  allowUnsafeNewFunction(=> @headerParser.compile())
  @headerParser.size = @headerParser.sizeOf()

  makeFolderPath: (folder) =>
    if folder.parent is 0xffffffff
      return folder.name.trim()
    return path.join @makeFolderPath(@folders[folder.parent]),
           folder.name.trim()

  makeFilePath: (file) =>
    return path.join @makeFolderPath(@folders[file.folder]),
           file.name.trim()

  parse: (parser, offset) ->
    buffer = @file.readSync offset, parser.size
    return parser.parse(buffer)

  constructor: (@file) ->
    @header = @parse(BF.headerParser, 0)

    @folders = []
    if @header.folderCount > 0
      for i in [0..@header.folderCount - 1]
        folder = @parse BF.folderParser,
                        @header.offset +
                        @header.fileCapacity * BF.entryParser.size +
                        @header.fileCapacity * BF.fileParser.size +
                        i * BF.folderParser.size
        @folders.push folder

    @files = []
    if @header.fileCount > 0
      for i in [0..@header.fileCount - 1]
        entry = @parse BF.entryParser,
                       @header.offset +
                       i * BF.entryParser.size
        file = @parse BF.fileParser,
                      @header.offset +
                      @header.fileCapacity * BF.entryParser.size +
                      i * BF.fileParser.size
        file.offset = entry.offset

        @files[@makeFilePath file] = file

  list: ->
    out = []
    for filePath, file of @files
      out.push path.join(@file.path, filePath)
    out.sort()
    return out

  read: (entry) ->
    buffer = @file.readSync entry.offset + 4, entry.size
    usize = buffer.readUInt32LE(0)
    csize = buffer.readUInt32LE(4)

    if (entry.name.endsWith '.bin') and (csize <= buffer.length)
      buffer = buffer.slice 8, csize + 8
      buffer = lzo.decompress buffer, usize

    return buffer

module.exports =
  BF: BF
