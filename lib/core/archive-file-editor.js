/** @babel */

import {Emitter} from 'atom'

import {fs} from './util'
import ArchiveFile from './archive-file'
import ArchiveFileEditorComponent from './archive-file-editor-component'

export default function(ParserClass) {
  return class ArchiveFileEditor {
    static get version() { return 1 }
    static validate(params) { if (params.path && fs.isFileSync(params.path)) return params }
    get serialized() { return {path: this.file.path} }

    constructor({path}) {
      this.file = new ArchiveFile(path, ParserClass)
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
}
