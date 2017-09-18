/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

import path from 'path'

const EntryParser = new Parser()
  .endianess('little')
  .string('name', {length: 32, stripNull: true})
  .uint32('unknown')
  .uint32('type')
  .uint32('size')
  .uint32('offset')
allowUnsafeNewFunction(() => EntryParser.compile())
EntryParser.size = EntryParser.sizeOf()

class PCKParser {
  parse(parser, offset) {
    return parser.parse(this.file.readSync(offset, parser.size))
  }

  parseEntries(parent, offset) {
    while (true) {
      const entry = this.parse(EntryParser, offset)
      offset += EntryParser.size
      entry.name = `${parent.name}/${entry.name}`
      if (entry.type === 0) { this.files[entry.name] = entry }
      if (entry.type === 1) { offset = this.parseEntries(entry, offset) }
      if (entry.type === 0xff) { break }
    }
    return offset
  }

  constructor(file) {
    this.file = file
    this.files = []
    const entry = this.parse(EntryParser, 0)
    this.parseEntries(entry, EntryParser.size)
  }

  list() {
    const out = []
    for (let filePath in this.files)
      out.push(path.join(this.file.path, filePath))
    return out
  }

  read(entry) {
    return this.file.readSync(entry.offset, entry.size)
  }
}

export {PCKParser}
