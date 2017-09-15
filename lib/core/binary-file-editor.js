/** @babel */

import {Emitter} from 'atom'

import BinaryFile from './binary-file'
import BinaryFileEditorComponent from './binary-file-editor-component'

class BinaryFileEditor {
  static deserialize({path}) { if (path) return new BinaryFileEditor({path: path}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'BinaryFileEditor', version: BinaryFileEditor.version, path: this.path } }
  isEqual(other) { return other instanceof BinaryFileEditor && (this.getURI() === other.getURI()) }

  constructor({path}) {
    this.file = new BinaryFile(path)
    this.file.openSync()

    this.emitter = new Emitter()
    this.component = new BinaryFileEditorComponent(this, [])
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

atom.deserializers.add(BinaryFileEditor)
export default BinaryFileEditor
