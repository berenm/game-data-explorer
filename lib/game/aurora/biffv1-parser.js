/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

const FixResParser = new Parser()
  .endianess('little')
  .uint32('id')
  .uint32('offset')
  .uint32('partCount')
  .uint32('size')
  .uint32('type')
allowUnsafeNewFunction(() => FixResParser.compile())
FixResParser.size = FixResParser.sizeOf()

const VarResParser = new Parser()
  .endianess('little')
  .uint32('id')
  .uint32('offset')
  .uint32('size')
  .uint32('type')
allowUnsafeNewFunction(() => VarResParser.compile())
VarResParser.size = VarResParser.sizeOf()

const HeaderParser = new Parser()
  .endianess('little')
  .string('magic',   {length: 4, assert: 'BIFF'})
  .string('version', {length: 4, assert: 'V1  '})
  .uint32('varResCount')
  .uint32('fixResCount')
  .uint32('varTableOffset')
allowUnsafeNewFunction(() => HeaderParser.compile())
HeaderParser.size = HeaderParser.sizeOf()

class BIFFV1Parser {
  parse(parser, offset) {
    return parser.parse(this.file.readSync(offset, parser.size))
  }

  constructor(file) {
    this.file = file
    const header = this.parse(HeaderParser, 0)

    this.varRess = []
    for (let i = 0, end = header.varResCount; i < end; ++i)
      this.varRess.push(this.parse(VarResParser, header.varTableOffset + (i * VarResParser.size)))

    this.fixRess = []
    for (let i = 0, end = header.fixResCount; i < end; ++i)
      this.fixRess.push(this.parse(FixResParser, null))
  }

  read(entry) {
    const varRes = this.varRess[entry.resIndex]
    return this.file.readSync(varRes.offset, varRes.size)
  }
}

export {BIFFV1Parser}
