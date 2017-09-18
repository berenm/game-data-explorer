/** @babel */

import {Emitter} from 'atom'

import ArchiveFile from './archive-file'
import ArchiveFileEditorComponent from './archive-file-editor-component'
import Serializable from './serializable'

class ArchiveFileEditor {
  static get version() { return 1 }
  get serialized() { return {path: this.file.path, parser: this.file.parser} }

  constructor({path, parser}) {
    this.file = new ArchiveFile(path, parser)
    this.file.openSync()

    this.emitter = new Emitter()
    this.component = new ArchiveFileEditorComponent(this, [])
  }

  destroy() { return this.emitter.emit('did-destroy') }
  onDidDestroy(callback) { return this.emitter.on('did-destroy', callback) }

  getURI() { return this.file.path }
  getTitle() {
    if (!this.file.path) return 'untitled'
    return this.file.basename
  }

  get element() { return this.component.element }
}
Serializable.includeInto(ArchiveFileEditor, __filename)

export default ArchiveFileEditor
