{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'
{FourCC} = require '../common/fourcc'
{BIFFV1} = require '../data/biffv1'

path = require 'path'
fs = require 'fs'

class KEYV1
  @bifParser = new Parser()
    .endianess 'little'
    .uint32 'size'
    .uint32 'pathOffset'
    .uint16 'pathSize'
    .uint16 'drive'
  allowUnsafeNewFunction(=> @bifParser.compile())
  @bifParser.size = @bifParser.sizeOf()

  @resParser = new Parser()
    .endianess 'little'
    .string 'name', length: 16, stripNull: true
    .uint16 'type'
    .uint32 'indexes'
  allowUnsafeNewFunction(=> @resParser.compile())
  @resParser.size = @resParser.sizeOf()

  @headerParser = new Parser()
    .endianess 'little'
    .uint32 'bifCount'
    .uint32 'resCount'
    .uint32 'bifTableOffset'
    .uint32 'resTableOffset'
    .uint32 'buildYear'
    .uint32 'buildDay'
  allowUnsafeNewFunction(=> @headerParser.compile())
  @headerParser.size = @headerParser.sizeOf()

  @magicParser = new Parser()
    .endianess 'little'
    .string 'magic',   length: 4, assert: 'KEY '
    .string 'version', length: 4, assert: 'V1  '
  allowUnsafeNewFunction(=> @magicParser.compile())
  @magicParser.size = @magicParser.sizeOf()

  @extensions =
    '1': 'bmp'
    '3': 'tga'
    '4': 'wav'
    '6': 'plt'
    '7': 'ini'
    '10': 'txt'
    '2002': 'mdl'
    '2009': 'nss'
    '2010': 'ncs'
    '2012': 'are'
    '2013': 'set'
    '2014': 'ifo'
    '2015': 'bic'
    '2016': 'wok'
    '2017': '2da'
    '2022': 'txi'
    '2023': 'git'
    '2025': 'uti'
    '2027': 'utc'
    '2029': 'dlg'
    '2030': 'itp'
    '2032': 'utt'
    '2033': 'dds'
    '2035': 'uts'
    '2036': 'ltr'
    '2037': 'gff'
    '2038': 'fac'
    '2040': 'ute'
    '2042': 'utd'
    '2044': 'utp'
    '2045': 'dft'
    '2046': 'gic'
    '2047': 'gui'
    '2051': 'utm'
    '2052': 'dwk'
    '2053': 'pwk'
    '2056': 'jrl'
    '2058': 'utw'
    '2060': 'ssf'
    '2064': 'ndb'
    '2065': 'ptm'
    '2066': 'ptt'

  parse: (parser, offset) ->
    buffer = new Buffer parser.size
    bytes = fs.readSync @file, buffer, 0, parser.size, offset
    return parser.parse(buffer)

  constructor: (@path) ->
    @file = fs.openSync @path, 'r'
    @magic = @parse(KEYV1.magicParser, 0)
    @header = @parse(KEYV1.headerParser, 8)

    @bifs = []
    if @header.bifCount > 0
      for i in [0..@header.bifCount - 1]
        bif = @parse KEYV1.bifParser, @header.bifTableOffset + i * KEYV1.bifParser.size

        buffer = new Buffer bif.pathSize
        fs.readSync @file, buffer, 0, bif.pathSize, bif.pathOffset
        bif.path = buffer.toString()
          .replace /\x00+$/g, ''
          .replace '\\', '/'
        delete bif.pathSize
        delete bif.pathOffset

        @bifs.push bif

    @ress = {}
    if @header.resCount > 0
      for i in [0..@header.resCount - 1]
        res = @parse KEYV1.resParser, @header.resTableOffset + i * KEYV1.resParser.size
        res.bifIndex = res.indexes >> 20
        res.resIndex = (res.indexes << 12) >> 12
        delete res.indexes

        resPath = res.name + '.' + KEYV1.extensions[res.type]
        delete res.type
        delete res.name

        @ress[resPath] = res

  list: ->
    out = []
    for resPath, res of @ress
      out.push path.join(@path, @bifs[res.bifIndex].path, resPath)
    return out

module.exports =
  KEYV1: KEYV1
