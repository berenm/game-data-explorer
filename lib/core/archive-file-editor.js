/** @babel */

import {Emitter} from 'atom'

import ArchiveFile from './archive-file'
import ArchiveFileEditorComponent from './archive-file-editor-component'

class ArchiveFileEditor {
  static deserialize({path, parser}) { if (path && parser) return new ArchiveFileEditor({path: path, parser: parser}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'ArchiveFileEditor', version: ArchiveFileEditor.version, path: this.path, parser: this.parser } }
  isEqual(other) { return other instanceof ArchiveFileEditor && (this.getURI() === other.getURI()) }

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

atom.deserializers.add(ArchiveFileEditor)
export default ArchiveFileEditor
