/** @babel */

import {Emitter} from 'atom'

import {fs} from './util'
import BinaryFile from './binary-file'
import ModelFileEditorComponent from './model-file-editor-component'
import Serializable from './serializable'

class ModelFileEditor {
  static get version() { return 1 }
  static validate(params) { if (params.path && fs.isFileSync(params.path)) return params }
  get serialized() { return {path: this.properties.path} }

  constructor({path}) {
    this.file = new BinaryFile(path)
    this.file.openSync()

    this.properties = {}
    this.properties.path = path
    this.emitter = new Emitter()
    this.component = new ModelFileEditorComponent(this, [])
  }

  destroy() {
    this.component.destroy();
    return this.emitter.emit('did-destroy')
  }
  onDidDestroy(callback) { return this.emitter.on('did-destroy', callback) }

  getURI() { return this.file.path }
  getTitle() {
    if (!this.file.path) return 'untitled'
    return this.file.basename
  }

  get element() { return this.component.element }
}
Serializable.includeInto(ModelFileEditor, __filename)

export default ModelFileEditor
