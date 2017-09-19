/** @babel */

import AudioFileEditor from './core/audio-file-editor'
import WAVEditorComponent from './wav-editor-component'
import Serializable from './core/serializable'

class WAVEditor extends AudioFileEditor {
  constructor({path}) {
    super({path})
    this.component = new WAVEditorComponent(this)
  }
}
Serializable.includeInto(WAVEditor, __filename)

export default WAVEditor
