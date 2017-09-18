/** @babel */

import BinaryFileEditor from './core/binary-file-editor'
import HEXEditorComponent from './hex-editor-component'
import Serializable from './core/serializable'

class HEXEditor extends BinaryFileEditor {
  constructor({path}) {
    super({path})
    this.component = new HEXEditorComponent(this)
  }
}
Serializable.includeInto(HEXEditor, __filename)

export default HEXEditor
