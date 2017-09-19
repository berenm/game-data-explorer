/** @babel */
/** @jsx etch.dom */

import child from 'child_process'

import AudioFileEditorComponent from './core/audio-file-editor-component'

export default class WAVEditorView extends AudioFileEditorComponent {
  constructor(properties, children) {
    super(properties, children)
  }

  update(properties, children) {
    child.execSync(`ffmpeg -y -i '${this.file.path}' '${this.file.path}'.wav`)
    super.update(properties, children)
  }

  get src() { return `${this.file.path}.wav` }
}
