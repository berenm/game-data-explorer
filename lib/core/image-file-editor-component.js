/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

import AbstractComponent from './abstract-component'
import BinaryFileEditorComponent from './binary-file-editor-component'

export default class ImageFileEditorView extends AbstractComponent {
  constructor(properties, children, callback) {
    super(properties, children, callback)

    this.image.style.display = 'none'
    this.update()

    this.image.onload = () => {
      this.image.style.display = ''
      this.image.onload = null
      this.emitter.emit('did-load')
    }
  }

  render() {
    return <BinaryFileEditorComponent ref='container' {...this.properties}>
      <div className='image-container' tabIndex='-1'>
        <div className='image-cell'>
          <img ref='image'></img>
        </div>
      </div>
    </BinaryFileEditorComponent>
  }

  update(properties, children) {
    super.update(properties, children, () => {
      this.image.src = `file://${encodeURI(this.src.replace(/\\/g, '/')).replace(/#/g, '%23').replace(/\?/g, '%3F')}?time=${Date.now()}`
    })
  }

  onDidLoad(callback) {
    return this.emitter.on('did-load', callback)
  }

  get file() { return this.properties.file }
  get container() { return this.refs.container }
  get image() { return this.container.refs.image }
  get src() { return this.file.path }
}
