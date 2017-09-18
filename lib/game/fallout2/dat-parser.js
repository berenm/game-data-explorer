/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

import path from 'path'
import zlib from 'zlib'

const NameParser = new Parser()
  .endianess('little')
  .uint32('name_length')
  .string('value', {length: 'name_length'})
allowUnsafeNewFunction(() => NameParser.compile())
NameParser.size = NameParser.sizeOf()

const FileParser = new Parser()
  .endianess('little')
  .nest('name', {type: NameParser})
  .uint8('flags')
  .uint32('size_uncompressed')
  .uint32('size_compressed')
  .uint32('offset')
allowUnsafeNewFunction(() => FileParser.compile())
FileParser.size = FileParser.sizeOf()

const IndexParser = new Parser()
  .endianess('little')
  .uint32('file_count')
  .array('files', {type: FileParser, length: 'file_count'})
allowUnsafeNewFunction(() => IndexParser.compile())
IndexParser.size = IndexParser.sizeOf()

const FooterParser = new Parser()
  .endianess('little')
  .uint32('index_size')
  .uint32('file_size')
allowUnsafeNewFunction(() => FooterParser.compile())
FooterParser.size = FooterParser.sizeOf()

const CompressionFlags = {
  0: 'none',
  1: 'zlib'
}

class DATParser {
  parse(parser, offset, size) {
    return parser.parse(this.file.readSync(offset, size || parser.size))
  }

  constructor(file) {
    this.file = file

    const footer = this.parse(FooterParser, this.file.size - FooterParser.size)
    if (footer.file_size !== this.file.size) {
      throw new Error('Footer file size does not match file size')
    }

    const indexOffset = this.file.size - FooterParser.size - footer.index_size
    const index = this.parse(IndexParser, indexOffset, footer.index_size)

    this.files = []
    for (let file of index.files)
      this.files[file.name.value.replace(/\\/g, '/')] = file
  }

  list() {
    const out = []
    for (let filePath in this.files)
      out.push(path.join(this.file.path, filePath))
    return out
  }

  read(entry) {
    if (CompressionFlags[entry.flags] === 'zlib')
      return zlib.inflateSync(this.file.readSync(entry.offset, entry.size_compressed))
    else
      return this.file.readSync(entry.offset, entry.size_uncompressed)
  }
}

export {DATParser}
