/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

import AbstractComponent from './abstract-component'
import BinaryFileEditorComponent from './binary-file-editor-component'

export default class AudioFileEditorView extends AbstractComponent {
  constructor(properties, children, callback) {
    super(properties, children, callback)

    this.update()
  }

  render() {
    return <BinaryFileEditorComponent ref='container' {...this.properties}>
      <div className='audio-container' tabIndex='-1'>
        <div className='audio-cell'>
          <audio controls='true' ref='audio'></audio>
        </div>
      </div>
    </BinaryFileEditorComponent>
  }

  update(properties, children) {
    super.update(properties, children, () => {
      this.audio.src = `file://${encodeURI(this.src.replace(/\\/g, '/')).replace(/#/g, '%23').replace(/\?/g, '%3F')}?time=${Date.now()}`
    })
  }

  get file() { return this.properties.file }
  get container() { return this.refs.container }
  get audio() { return this.container.refs.audio }
  get src() { return this.file.path }
}
