/** @babel */

import ImageFileEditor from '../../core/image-file-editor'
import ARTEditorComponent from './art-editor-component'
import Serializable from '../../core/serializable'

class ARTEditor extends ImageFileEditor {
  constructor({path}) {
    super({path})
    this.component = new ARTEditorComponent(this)
  }
}
Serializable.includeInto(ARTEditor, __filename)

export default ARTEditor
