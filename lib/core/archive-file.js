/** @babel */

import BinaryFile from './binary-file.js'
import path from 'path'

class ArchiveEntry {
  constructor(properties) {
    this.properties = properties
  }

  get path() { return this.properties.path }
  get name() { return this.properties.name || (this.properties.name = path.basename(this.path)) }
}

class FileEntry extends ArchiveEntry {
  constructor(properties) {
    super(properties)
  }
  isFile() { return true }
  isDirectory() { return false }
}

class DirectoryEntry extends ArchiveEntry {
  constructor(properties) {
    super(properties)
    this.children = []
    this.properties.index = {}
  }
  isFile() { return false }
  isDirectory() { return true }
  isParentOf(entry) { return entry.path.indexOf(`${this.path}${path.sep}`) === 0 }

  get index() { return this.properties.index }

  addChild(entry) {
    if (!this.isParentOf(entry))
      return false

    const segments = entry.path.substring(this.path.length + 1).split(path.sep)
    if (segments.length === 0)
      return false

    if (segments.length === 1) {
      this.index[entry.name] = this.children.length
      this.children.push(entry)
      return true
    }

    const name = segments[0]
    if (!(name in this.index)) {
      this.index[name] = this.children.length
      this.children.push(new DirectoryEntry({path: `${this.path}${path.sep}${name}`}))
    }

    let child = this.children[this.index[name]]
    if (child.isDirectory())
      return child.addChild(entry)

    return false
  }
}

export default class ArchiveFile extends BinaryFile {
  constructor(path, parser) {
    super(path)
    super.openSync()

    this.properties = {}
    this.properties.parser = new (parser)(this)
  }

  get parser() { return this.properties.parser }

  listEntries() {
    let entry = new DirectoryEntry({path: this.path})

    for (let entryPath of this.parser.list())
      entry.addChild(new FileEntry({path: entryPath}))

    return [entry]
  }

  readEntry(entryPath) {
    if (entryPath in this.parser.files)
      return this.parser.read(this.parser.files[entryPath])
    else if (`./${entryPath}` in this.parser.files)
      return this.parser.read(this.parser.files[`./${entryPath}`])

    throw new Error(`Could not find entry ${entryPath} in archive ${this.file.path}`)
  }
}
