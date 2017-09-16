/** @babel */

import path from 'path'

export default class ArchiveEntry {
  constructor(properties) {
    this.properties = properties
  }

  get path() { return this.properties.path }
  get name() {
    if (!this.properties.name)
      this.properties.name = path.basename(this.path)
    return this.properties.name
  }
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
    this.children = {}
  }
  isFile() { return false }
  isDirectory() { return true }
  isParentOf(entry) { return entry.path.indexOf(`${this.path}${path.sep}`) === 0 }

  addChild(entry) {
    if (!this.isParentOf(entry))
      return false

    const segments = entry.path.substring(this.path.length + 1).split(path.sep)
    if (segments.length === 0)
      return false

    if (segments.length === 1) {
      this.children[entry.name] = entry
      return true
    }

    const name = segments[0]
    let child = (this.children[name] || (this.children[name] = new DirectoryEntry({path: `${this.path}${path.sep}${name}`})))
    if (child.isDirectory())
      return child.addChild(entry)

    return false
  }
}

export {FileEntry, DirectoryEntry}
