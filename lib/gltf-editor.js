/** @babel */

import ModelFileEditor from './core/model-file-editor'
import GLTFEditorComponent from './gltf-editor-component'
import Serializable from './core/serializable'

class GLTFEditor extends ModelFileEditor {
  constructor({path}) {
    super({path})
    this.component = new GLTFEditorComponent(this)
  }
}
Serializable.includeInto(GLTFEditor, __filename)

export default GLTFEditor
