/** @babel */

import etch from 'etch'

import {CompositeDisposable} from 'atom'

export default class AbstractComponent {
  constructor(properties, children, callback) {
    this.properties = properties
    this.children = children
    this.disposables = new CompositeDisposable()
    if (callback) callback()
    etch.initialize(this)
  }

  update(properties, children, callback) {
    if (properties && this.properties !== properties) this.properties = properties
    if (children && this.children !== children) this.children = children
    if (callback) callback()
    return etch.update(this)
  }

  destroy(callback) {
    this.disposables.dispose()
    if (callback) callback()
    return etch.destroy(this)
  }
}
