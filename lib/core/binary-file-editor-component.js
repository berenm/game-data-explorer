/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

import {CompositeDisposable} from 'atom'

export default class BinaryFileEditorComponent {
  constructor(properties, children) {
    this.properties = properties
    this.children = children
    this.disposables = new CompositeDisposable()
    etch.initialize(this)

    this.disposables.add(this.properties.file.onDidChange(() => { this.update() }))
    this.disposables.add(this.properties.file.onDidDelete(() => {
      const pane = atom.workspace.paneForItem(this.properties.file)
      if (pane) pane.destroyItem(this.properties.file)
    }))
  }

  render() {
    return <div className='gde-editor' on={this.properties.on}>
      <div className='gde-container'>
        {this.children}
      </div>
    </div>
  }

  update(properties, children) {
    if (properties && this.properties !== properties)
      this.properties = properties
    this.children = children
    return etch.update(this)
  }

  destroy() {
    this.disposables.dispose()
    return etch.destroy(this)
  }
}
