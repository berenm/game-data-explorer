/** @babel */

import BinaryFileEditor from './core/binary-file-editor'
import HEXEditorComponent from './hex-editor-component'

class HEXEditor extends BinaryFileEditor {
  static deserialize({path}) { if (path) return new BinaryFileEditor({path: path}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'BinaryFileEditor', version: BinaryFileEditor.version, path: this.path } }
  isEqual(other) { return other instanceof BinaryFileEditor && (this.getURI() === other.getURI()) }

  constructor({path}) {
    super({path: path})
    this.component = new HEXEditorComponent(this)
  }
}

atom.deserializers.add(HEXEditor)
export default HEXEditor
