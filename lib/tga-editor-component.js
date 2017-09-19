/** @babel */
/** @jsx etch.dom */

import child from 'child_process'

import ImageFileEditorComponent from './core/image-file-editor-component'

export default class TGAEditorView extends ImageFileEditorComponent {
  constructor(properties, children) {
    super(properties, children)
  }

  update(properties, children) {
    child.execSync(`convert '${this.file.path}' '${this.file.path}.png'`)
    super.update(properties, children)
  }

  get src() { return `${this.file.path}.png` }
}
