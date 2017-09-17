/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

import AbstractComponent from './abstract-component'

export default class BinaryFileEditorComponent extends AbstractComponent {
  constructor(properties, children) {
    super(properties, children)

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
}
