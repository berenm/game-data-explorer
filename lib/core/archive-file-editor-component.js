/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import Promise from 'bluebird'

import path from 'path'
const fs = Promise.promisifyAll(require('fs-plus'))
const temp = Promise.promisifyAll(require('temp'))

import BinaryFileEditorComponent from './binary-file-editor-component'
import AbstractComponent from './abstract-component'

class ArchiveEntryComponent extends AbstractComponent {
  constructor(properties, children, callback) {
    super(properties, children, callback)

    this.disposables.add(atom.commands.add(this.element, {
      'core:confirm': () => { if (this.isSelected()) { this.activate() } },
      'core:move-down': () => { if (this.isSelected()) this.parent.selectNext(this.index, +1) },
      'core:move-up': () => { if (this.isSelected()) this.parent.selectNext(this.index, -1) }
    }))
  }

  get entry() { return this.properties.entry }
  get root() { return this.properties.root }
  get parent() { return this.properties.parent }
  get index() { return this.properties.index }
  get isSelected() { return this.element.classList.contains('selected') }

  select() {
    let prev = [this.root.selected, this.root.selected = this][0]
    if (prev) prev.element.classList.remove('selected')
    this.element.classList.add('selected')
    this.element.focus()
  }
}

class FileComponent extends ArchiveEntryComponent {
  constructor(properties, children) {
    super(properties, children)
  }

  render() {
    return <li className='list-item entry' tabIndex='-1' on={{click: () => { this.select(); this.activate() }}}>
      <span className='file icon icon-file-text'>{this.entry.name}</span>
    </li>
  }

  activate() { this.root.openFile(this.entry) }
}

class DirectoryComponent extends ArchiveEntryComponent {
  constructor(properties, children) {
    super(properties, children, (properties) => {
      properties.isExpanded = false
    })
  }

  render() {
    let childrenList = <ol className='list-tree'></ol>
    if (this.isExpanded)
      childrenList = <ol className='list-tree'>
        {this.entry.children.map((entry, i) => {
          if (entry.isDirectory())
            return <DirectoryComponent entry={entry} root={this.root} parent={this} index={i} key={i} />
          else
            return <FileComponent entry={entry} root={this.root} parent={this} index={i} key={i} />
        })}
      </ol>

    return <li className='list-nested-item entry collapsed' tabIndex='-1'>
      <span className='list-item' on={{click: () => { this.select(); this.activate() }}}>
        <span className='directory icon icon-file-directory'>{this.properties.entry.name}</span>
      </span>
      {childrenList}
    </li>
  }

  get isExpanded() { return this.properties.isExpanded }

  activate() {
    if (this.isExpanded)
      return this.collapse()
    else
      return this.expand()
  }

  expand() {
    this.element.classList.toggle('expanded')
    this.element.classList.toggle('collapsed')
    this.properties.isExpanded = true
    this.update()
  }

  collapse() {
    this.element.classList.toggle('expanded')
    this.element.classList.toggle('collapsed')
    this.properties.isExpanded = false
    this.update()
  }

  selectNext(index, direction) {
    let nextIndex = index + direction
    if (index + direction < this.children.length && index + direction >= 0)
      this.children[nextIndex].select()
    else
      this.parent.selectNext(this.index, direction)
  }
}

export default class ArchiveFileEditorComponent extends AbstractComponent {
  constructor(properties, children) {
    super(properties, children, (properties) => {
      properties.temp = temp.mkdirSync('atom-')
      properties.entries = []
    })
    this.update()
  }

  render() {
    return <BinaryFileEditorComponent ref='container' {...this.properties}>
      <div className='inset-panel'>
        <div className='panel-heading' ref='summary'></div>
        <ol className='gde-tree padded list-tree has-collapsable-children'>
          {this.entries.map((entry, i) => {
            if (entry.isDirectory())
              return <DirectoryComponent entry={entry} root={this} parent={this} index={i} key={i} />
            else
              return <FileComponent entry={entry} root={this} parent={this} index={i} key={i} />
          })}
        </ol>
      </div>
    </BinaryFileEditorComponent>
  }

  update(properties, children=[]) {
    super.update(properties, children, () => {
      this.properties.entries = this.file.listEntries()
    })
  }

  get temp() { return this.properties.temp }
  get file() { return this.properties.file }
  get entries() { return this.properties.entries }

  openFile(entry) {
    if (entry.isDirectory()) return

    const entryPath = entry.path.substring(this.file.path.length + 1)
    const entryBuffer = this.file.readEntry(entryPath)
    const entryTemp  = path.join(this.temp, path.basename(this.file.path), entryPath)

    fs.writeFileAsync(entryTemp, entryBuffer)
      .then(() => { return atom.workspace.open(entryTemp) })
      .catch(console.error)
  }
}
