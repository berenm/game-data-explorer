/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

import path from 'path'
import lzo from 'lzo'

const EntryParser = new Parser()
  .endianess('little')
  .uint32('offset')
  .uint32('u000')
allowUnsafeNewFunction(() => EntryParser.compile())
EntryParser.size = EntryParser.sizeOf()

const FileParser = new Parser()
  .endianess('little')
  .uint32('size')
  .uint32('next')
  .uint32('prev')
  .uint32('folder')
  .uint32('timestamp')
  .string('name', {length: 64, stripNull: true})
allowUnsafeNewFunction(() => FileParser.compile())
FileParser.size = FileParser.sizeOf()

const FolderParser = new Parser()
  .endianess('little')
  .uint32('id')
  .uint32('child')
  .uint32('next')
  .uint32('prev')
  .uint32('parent')
  .string('name', {length: 64, stripNull: true})
allowUnsafeNewFunction(() => FolderParser.compile())
FolderParser.size = FolderParser.sizeOf()

const HeaderParser = new Parser()
  .endianess('little')
  .string('magic', {length: 4, assert(x) { return x === 'BIG\x00' }})
  .uint32('u000')
  .uint32('fileCount')
  .uint32('folderCount')
  .uint32('u001')
  .uint32('u002')
  .uint32('u003')
  .uint32('u004')
  .uint32('fileCapacity')
  .uint32('u005')
  .uint32('u006')
  .uint32('fileCountBis')
  .uint32('u007')
  .uint32('offset')
  .uint32('u008')
  .uint32('u009')
  .uint32('u010')
allowUnsafeNewFunction(() => HeaderParser.compile())
HeaderParser.size = HeaderParser.sizeOf()

class BFParser {
  makeFolderPath(folders, folder) {
    if (folder.parent === 0xffffffff)
      return folder.name.trim()
    return path.join(this.makeFolderPath(folders, folders[folder.parent]),
           folder.name.trim())
  }

  makeFilePath(folders, file) {
    return path.join(this.makeFolderPath(folders, folders[file.folder]),
           file.name.trim())
  }

  parse(parser, offset) {
    return parser.parse(this.file.readSync(offset, parser.size))
  }

  constructor(file) {
    this.file = file

    const header = this.parse(HeaderParser, 0)
    const folders = []
    for (let i = 0, end = header.folderCount; i < end; i++) {
      const folder = this.parse(FolderParser, header.offset + (header.fileCapacity * EntryParser.size) + (header.fileCapacity * FileParser.size) + (i * FolderParser.size))
      folders.push(folder)
    }

    this.files = []
    for (let i = 0, end = header.fileCount; i < end; i++) {
      const entry = this.parse(EntryParser, header.offset + (i * EntryParser.size))
      const file = this.parse(FileParser, header.offset + (header.fileCapacity * EntryParser.size) + (i * FileParser.size))
      file.offset = entry.offset

      this.files[this.makeFilePath(folders, file)] = file
    }
  }

  list() {
    const out = []
    for (let filePath in this.files)
      out.push(path.join(this.file.path, filePath))
    out.sort()
    return out
  }

  read(entry) {
    let buffer = this.file.readSync(entry.offset + 4, entry.size);
    const usize = buffer.readUInt32LE(0);
    const csize = buffer.readUInt32LE(4);

    if ((entry.name.endsWith('.bin')) && (csize <= buffer.length)) {
      buffer = buffer.slice(8, csize + 8);
      buffer = lzo.decompress(buffer, usize);
    }

    return buffer;
  }
}

export {BFParser};
