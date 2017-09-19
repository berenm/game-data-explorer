/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

import {Disposable} from 'atom'
import AbstractComponent from './abstract-component'
import BinaryFileEditorComponent from './binary-file-editor-component'

import BABYLON from '../ext/babylonjs'

export default class ModelFileEditorView extends AbstractComponent {
  constructor(properties, children, callback) {
    super(properties, children, callback)

    this.properties.engine = new BABYLON.Engine(this.model, true)

    const renderScene = () => { if (this.scene) this.scene.render() }
    this.disposables.add(new Disposable(() => {
      this.engine.stopRenderLoop(renderScene)
      this.properties.scene = null
      this.properties.engine = null
    }))
    this.engine.runRenderLoop(renderScene)

    this.update()
  }

  render() {
    return <BinaryFileEditorComponent ref='container' {...this.properties}>
      <div className='model-container' tabIndex='-1'>
        <div className='model-cell'>
          <canvas controls='true' ref='model' on={{resize: () => this.onResize()}}></canvas>
        </div>
      </div>
    </BinaryFileEditorComponent>
  }

  update(properties, children) {
    super.update(properties, children)
    setTimeout(() => this.onResize())
  }

  get file() { return this.properties.file }
  get container() { return this.refs.container }
  get model() { return this.container.refs.model }
  get src() { return this.file.path }
  get engine() { return this.properties.engine }
  get scene() { return this.properties.scene }

  onResize() {
    const rect = this.model.parentNode.getBoundingClientRect()
    if (!rect.width || !rect.height)
      return setTimeout(() => { this.onResize() }, 50)
    this.model.width = rect.width
    this.model.height = rect.height
    this.engine.resize()
  }
}
