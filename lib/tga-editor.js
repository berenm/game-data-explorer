/** @babel */

import ImageFileEditor from './core/image-file-editor'
import TGAEditorComponent from './tga-editor-component'
import Serializable from './core/serializable'

class TGAEditor extends ImageFileEditor {
  constructor({path}) {
    super({path})
    this.component = new TGAEditorComponent(this)
  }
}
Serializable.includeInto(TGAEditor, __filename)

export default TGAEditor
