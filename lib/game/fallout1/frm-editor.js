/** @babel */

import ImageFileEditor from '../../core/image-file-editor'
import FRMEditorComponent from './frm-editor-component'
import Serializable from '../../core/serializable'

class FRMEditor extends ImageFileEditor {
  constructor({path}) {
    super({path})
    this.component = new FRMEditorComponent(this)
  }
}
Serializable.includeInto(FRMEditor, __filename)

export default FRMEditor
