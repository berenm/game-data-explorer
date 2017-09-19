/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

import path from 'path'
import zlib from 'zlib'

const FileParser = new Parser()
  .endianess('little')
  .uint32('name_size')
  .string('name', {zeroTerminated: true})
  .uint32('name_offset')
  .uint32('type')
  .uint32('size_uncompressed')
  .uint32('size_compressed')
  .uint32('offset')
allowUnsafeNewFunction(() => FileParser.compile())
FileParser.size = FileParser.sizeOf()

const IndexParser = new Parser()
  .endianess('little')
  .uint32('count')
  .array('files', {type: FileParser, readUntil: 'eof'})
allowUnsafeNewFunction(() => IndexParser.compile())
IndexParser.size = IndexParser.sizeOf()

const FooterParser = new Parser()
  .endianess('little')
  .array('uuid', {length: 16, type: 'uint8'})
  .string('magic', {length: 4, assert: '1TAD'})
  .uint32('filenames_size')
  .uint32('index_offset')
allowUnsafeNewFunction(() => FooterParser.compile())
FooterParser.size = FooterParser.sizeOf()

const FileTypes = {
  1: 'none',
  2: 'zlib',
  1024: 'folder'
}

class DAT1Parser {
  parse(parser, offset, size) {
    return parser.parse(this.file.readSync(offset, size || parser.size))
  }

  constructor(file) {
    this.file = file
    const footer = this.parse(FooterParser, this.file.size - FooterParser.size)
    const index = this.parse(IndexParser, this.file.size - footer.index_offset, footer.index_offset - FooterParser.size)

    this.files = []
    for (let file of index.files) {
      if (FileTypes[file.type] !== 'folder')
        this.files[file.name.replace(/\\/g, '/')] = file
    }
  }

  list() {
    const out = []
    for (let filePath in this.files)
      out.push(path.join(this.file.path, filePath))
    return out
  }

  read(entry) {
    if (FileTypes[entry.type] === 'zlib')
      return zlib.inflateSync(this.file.readSync(entry.offset, entry.size_compressed))
    else
      return this.file.readSync(entry.offset, entry.size_uncompressed)
  }
}

export {DAT1Parser}
