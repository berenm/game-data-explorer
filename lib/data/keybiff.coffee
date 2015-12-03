{allowUnsafeNewFunction} = require 'loophole'
{Parser} = require 'binary-parser'

fs = require 'fs'

FourCC = (str) ->
  str.charCodeAt(0) << 24 +
  str.charCodeAt(1) << 16 +
  str.charCodeAt(2) << 8 +
  str.charCodeAt(3) << 0

Extension = {
  '1': 'bmp',
  '3': 'tga',
  '4': 'wav',
  '6': 'plt',
  '7': 'ini',
  '10': 'txt',
  '2002': 'mdl',
  '2009': 'nss',
  '2010': 'ncs',
  '2012': 'are',
  '2013': 'set',
  '2014': 'ifo',
  '2015': 'bic',
  '2016': 'wok',
  '2017': '2da',
  '2022': 'txi',
  '2023': 'git',
  '2025': 'uti',
  '2027': 'utc',
  '2029': 'dlg',
  '2030': 'itp',
  '2032': 'utt',
  '2033': 'dds',
  '2035': 'uts',
  '2036': 'ltr',
  '2037': 'gff',
  '2038': 'fac',
  '2040': 'ute',
  '2042': 'utd',
  '2044': 'utp',
  '2045': 'dft',
  '2046': 'gic',
  '2047': 'gui',
  '2051': 'utm',
  '2052': 'dwk',
  '2053': 'pwk',
  '2056': 'jrl',
  '2058': 'utw',
  '2060': 'ssf',
  '2064': 'ndb',
  '2065': 'ptm',
  '2066': 'ptt',
}

ContentType = {
  '1': 'binary',
  '3': 'binary',
  '4': 'binary',
  '6': 'binary',
  '7': 'ini',
  '10': 'text',
  '2002': 'mdl',
  '2009': 'text',
  '2010': 'binary',
  '2012': 'gff',
  '2013': 'ini',
  '2014': 'gff',
  '2015': 'gff',
  '2016': 'mdl',
  '2017': 'text',
  '2022': 'text',
  '2023': 'gff',
  '2025': 'gff',
  '2027': 'gff',
  '2029': 'gff',
  '2030': 'gff',
  '2032': 'gff',
  '2033': 'binary',
  '2035': 'gff',
  '2036': 'binary',
  '2037': 'gff',
  '2038': 'gff',
  '2040': 'gff',
  '2042': 'gff',
  '2044': 'gff',
  '2045': 'ini',
  '2046': 'gff',
  '2047': 'gff',
  '2051': 'gff',
  '2052': 'mdl',
  '2053': 'mdl',
  '2056': 'gff',
  '2058': 'gff',
  '2060': 'binary',
  '2064': 'binary',
  '2065': 'gff',
  '2066': 'gff',
}

class BIFFV1
  @parse: (bifData) ->
    return @parser.parse(bifData)

  @parser: new Parser().endianess('little')
    .uint32('magic', {assert: FourCC('BIFF')})
    .uint32('version', {assert: FourCC('V1  ')})
    .uint32('variableResourceCount')
    .uint32('fixedResourceCount')
    .uint32('variableTableOffset')
    .skip('variableTableOffset - 20')

    .array('variableResources', {
      type: new Parser().endianess('little')
        .uint32('id')
        .uint32('offset')
        .uint32('size')
        .uint32('type'),
      length: 'variableResourceCount'
    })

    .array('fixedResources', {
      type: new Parser().endianess('little')
        .uint32('id')
        .uint32('offset')
        .uint32('partCount')
        .uint32('size')
        .uint32('type'),
      length: 'fixedResourcesCount'
    })
allowUnsafeNewFunction(() => BIFFV1.parser.compile())

class KEYV1
  @parse: (keyData) ->
    keyFile = @parser.parse(keyData)

    for bif in keyFile.bifs
      bif.ress = {}

    for res in keyFile.ress
      res.bifId = res.id >> 20
      res.resId = res.id & ((1 << 20) - 1)

      res.extension = Extension[res.type]
      res.contentType = ContentType[res.type]
      keyFile.bifs[res.bifId]
        .ress[res.name + '.' + res.extension] = res

    bifs = {}
    for bif in keyFile.bifs
      allowUnsafeNewFunction(() =>
        bif.path = new Parser()
          .skip(bif.filenameOffset)
          .string('path', {length: bif.filenameSize, stripNull: true})
          .parse(keyData)
          .path.replace('\\', '/'))
      bifs[bif.path] = bif
    keyFile.bifs = bifs

    return keyFile

  @parser: new Parser().endianess('little')
    .uint32('magic', {assert: FourCC('KEY ')})
    .uint32('version', {assert: FourCC('V1  ')})
    .uint32('bifCount')
    .uint32('resCount')
    .uint32('bifTableOffset')
    .uint32('resTableOffset')
    .uint32('buildYear')
    .uint32('buildDay')

    .skip('bifTableOffset - offset')
    .array('bifs', {
      type: new Parser().endianess('little')
        .uint32('size')
        .uint32('filenameOffset')
        .uint16('filenameSize')
        .uint16('drive'),
      length: 'bifCount'
    })

    .skip('resTableOffset - offset')
    .array('ress', {
      type: new Parser().endianess('little')
        .string('name', {length: 16, stripNull: true})
        .uint16('type')
        .uint32('id'),
      length: 'resCount'
    })
allowUnsafeNewFunction(() => KEYV1.parser.compile())

module.exports =
  BIFFV1: BIFFV1
  KEYV1: KEYV1
