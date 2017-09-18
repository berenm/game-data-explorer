/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

import path from 'path'
import {LZSS} from './lzss'

const NameParser = new Parser()
  .endianess('big')
  .uint8('name_length')
  .string('value', {length: 'name_length'})
allowUnsafeNewFunction(() => NameParser.compile())
NameParser.size = NameParser.sizeOf()

const FileParser = new Parser()
  .endianess('big')
  .nest('name', {type: NameParser})
  .uint32('flags')
  .uint32('offset')
  .uint32('size_uncompressed')
  .uint32('size_compressed')
allowUnsafeNewFunction(() => FileParser.compile())
FileParser.size = FileParser.sizeOf()

const FolderParser = new Parser()
  .endianess('big')
  .uint32('file_count')
  .uint32('unknown')
  .uint32('unknown')
  .uint32('timestamp')
  .array('files', {type: FileParser, length: 'file_count'})
allowUnsafeNewFunction(() => FolderParser.compile())
FolderParser.size = FolderParser.sizeOf()

const HeaderParser = new Parser()
  .endianess('big')
  .uint32('folder_count')
  .uint32('unknown')
  .uint32('unknown')
  .uint32('timestamp')
  .array('folder_names', {type: NameParser, length: 'folder_count'})
  .array('folders', {type: FolderParser, length: 'folder_count'})
allowUnsafeNewFunction(() => HeaderParser.compile())
HeaderParser.size = HeaderParser.sizeOf()

const CompressionFlags = {
  32: 'none',
  64: 'lzss'
}

class DATParser {
  parse(parser, size) {
    return parser.parse(this.file.readSync(0, size || parser.size))
  }

  constructor(file1) {
    this.file = file1
    const header = this.parse(HeaderParser, this.file.size)

    this.files = []
    for (let [i, folder] of header.folders.entries()) {
      const folder_name = header.folder_names[i].value.replace(/\\/g, '/')

      for (let file of folder.files) {
        const file_name = file.name.value.replace(/\\/g, '/')
        this.files[`${folder_name}/${file_name}`] = file
      }
    }
  }

  list() {
    const out = []
    for (let filePath in this.files)
      out.push(path.join(this.file.path, filePath))
    return out
  }

  read(entry) {
    if (CompressionFlags[entry.flags] === 'lzss')
      return LZSS.decompressSync(this.file.readSync(entry.offset, entry.size_compressed))
    return this.file.readSync(entry.offset, entry.size_uncompressed)
  }
}

export {DATParser}
