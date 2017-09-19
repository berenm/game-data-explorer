/** @babel */

import etch from 'etch'

import {Emitter, CompositeDisposable} from 'atom'

export default class AbstractComponent {
  constructor(properties, children, callback) {
    if (properties) this.properties = properties
    else this.properties = {}
    if (children) this.children = children
    else this.children = []

    this.disposables = new CompositeDisposable()
    this.emitter = new Emitter()
    if (callback) callback(this.properties, this.children)
    etch.initialize(this)
  }

  update(properties, children, callback) {
    if (properties && this.properties !== properties) this.properties = properties
    if (children && this.children !== children) this.children = children
    if (callback) callback(this.properties, this.children)
    return etch.update(this)
  }

  destroy(callback) {
    this.disposables.dispose()
    this.emitter.dispose()
    if (callback) callback()
    return etch.destroy(this)
  }
}
