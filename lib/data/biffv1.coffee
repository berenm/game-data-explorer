{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'
{FourCC} = require '../common/fourcc'

path = require 'path'
fs = require 'fs'

class BIFFV1
  @fixResParser = new Parser()
    .endianess 'little'
    .uint32 'id'
    .uint32 'offset'
    .uint32 'partCount'
    .uint32 'size'
    .uint32 'type'
  allowUnsafeNewFunction(=> @fixResParser.compile())
  @fixResParser.size = @fixResParser.sizeOf()

  @varResParser = new Parser()
    .endianess 'little'
    .uint32 'id'
    .uint32 'offset'
    .uint32 'size'
    .uint32 'type'
  allowUnsafeNewFunction(=> @varResParser.compile())
  @varResParser.size = @varResParser.sizeOf()

  @headerParser = new Parser()
    .endianess 'little'
    .uint32 'varResCount'
    .uint32 'fixResCount'
    .uint32 'varTableOffset'
  allowUnsafeNewFunction(=> @headerParser.compile())
  @headerParser.size = @headerParser.sizeOf()

  @magicParser = new Parser()
    .endianess 'little'
    .string 'magic',   length: 4, assert: 'BIFF'
    .string 'version', length: 4, assert: 'V1  '
  allowUnsafeNewFunction(=> @magicParser.compile())
  @magicParser.size = @magicParser.sizeOf()

  parse: (parser, offset) ->
    buffer = new Buffer parser.size
    bytes = fs.readSync @file, buffer, 0, parser.size, offset
    return parser.parse(buffer)

  constructor: (@path) ->
    @file = fs.openSync @path, 'r'
    @magic = @parse(BIFFV1.magicParser, 0)
    @header = @parse(BIFFV1.headerParser, 8)

    @varRess = []
    if @header.varResCount > 0
      for i in [0..@header.varResCount - 1]
        @varRess.push @parse BIFFV1.varResParser, @header.varTableOffset + i * BIFFV1.varResParser.size

    @fixRess = []
    if @header.fixResCount > 0
      for i in [0..@header.fixResCount - 1]
        @fixRess.push @parse BIFFV1.fixResParser, null

module.exports =
  BIFFV1: BIFFV1
