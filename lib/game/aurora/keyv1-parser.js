/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

import path from 'path'

import {BIFFV1Parser} from './biffv1-parser'
import BinaryFile from '../../core/binary-file'

const BifParser = new Parser()
  .endianess('little')
  .uint32('size')
  .uint32('pathOffset')
  .uint16('pathSize')
  .uint16('drive')
allowUnsafeNewFunction(() => BifParser.compile())
BifParser.size = BifParser.sizeOf()

const ResParser = new Parser()
  .endianess('little')
  .string('name', {length: 16, stripNull: true})
  .uint16('type')
  .uint32('indexes')
allowUnsafeNewFunction(() => ResParser.compile())
ResParser.size = ResParser.sizeOf()

const HeaderParser = new Parser()
  .endianess('little')
  .string('magic',   {length: 4, assert: 'KEY '})
  .string('version', {length: 4, assert: 'V1  '})
  .uint32('bifCount')
  .uint32('resCount')
  .uint32('bifTableOffset')
  .uint32('resTableOffset')
  .uint32('buildYear')
  .uint32('buildDay')
allowUnsafeNewFunction(() => HeaderParser.compile())
HeaderParser.size = HeaderParser.sizeOf()

const Extensions = {
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
  '2066': 'ptt'
}

class KEYV1Parser {
  parse(parser, offset) {
    return parser.parse(this.file.readSync(offset, parser.size))
  }

  constructor(file) {
    this.file = file
    const header = this.parse(HeaderParser, 0)

    this.bifs = []
    for (let i = 0, end = header.bifCount; i < end; i++) {
      const bif = this.parse(BifParser, header.bifTableOffset + (i * BifParser.size))

      const buffer = this.file.readSync(bif.pathOffset, bif.pathSize)
      bif.path = buffer.toString().split('\x00')[0].replace('\\', '/')
      delete bif.pathSize
      delete bif.pathOffset

      this.bifs.push(bif)
    }

    this.ress = {}
    for (let i = 0, end = header.resCount; i < end; i++) {
      const res = this.parse(ResParser, header.resTableOffset + (i * ResParser.size))
      res.bifIndex = res.indexes >> 20
      res.resIndex = (res.indexes << 12) >> 12
      delete res.indexes

      const resPath = res.name + '.' + Extensions[res.type]
      delete res.type
      delete res.name

      this.ress[resPath] = res
    }
  }

  list() {
    const out = []
    for (let resPath in this.ress) {
      const res = this.ress[resPath]
      out.push(path.join(this.file.path, this.bifs[res.bifIndex].path, resPath))
    }
    return out
  }

  read(resPath) {
    const res = this.ress[path.basename(resPath)]
    const bif = this.bifs[res.bifIndex]

    if (!bif.file) {
      bif.file = new BinaryFile(path.join(path.dirname(this.file.path), bif.path))
      bif.file.openSync()
    }
    if (bif.parser == null) { bif.parser = new BIFFV1Parser(bif.file) }

    return bif.parser.read(res)
  }
}

export {KEYV1Parser}
