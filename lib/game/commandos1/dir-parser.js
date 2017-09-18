/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

import path from 'path'

const EntryParser = new Parser()
  .endianess('little')
  .string('name', {length: 32, stripNull: true})
  .uint32('type')
  .uint32('size')
  .uint32('offset')
allowUnsafeNewFunction(() => EntryParser.compile())
EntryParser.size = EntryParser.sizeOf()

class DIRParser {
  parse(parser, offset) {
    return parser.parse(this.file.readSync(offset, parser.size))
  }

  parseEntries(folder, offset) {
    while (true) {
      const entry = this.parse(EntryParser, offset)
      offset += EntryParser.size
      entry.name = entry.name.split('\x00')[0]
      entry.name = `${folder}${entry.name}`
      if (entry.type === 0xcdcdcd00) { this.files[entry.name] = entry }
      if (entry.type === 0xcdcdcd01) { offset = this.parseEntries(`${entry.name}/`, offset) }
      if (entry.type === 0xcdcdcdff) { break }
    }
    return offset
  }

  constructor(file) {
    this.file = file
    this.files = []
    this.parseEntries('', 0)
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

export {DIRParser}
