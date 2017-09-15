/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

import BinaryFileEditorComponent from './core/binary-file-editor-component'

class HexLineComponent {
  constructor(properties, children) {
    this.properties = properties
    this.children = children
    etch.initialize(this)
  }

  render() {
    return <div className='hex-line'>
        <div className='hex-offset'>{this.toOffset(this.properties.offset)}</div>
        <div className='hex-bytes'>
          {this.properties.bytes.map((byte, i) => {
            return <div className={`hex-byte color-${byte}`} key={i}>{this.toByte(byte)}</div>
          })}
        </div>
        <div className='hex-chars'>
          {this.properties.bytes.map((byte, i) => {
            return <div className='hex-char' key={i}>{this.toChar(byte)}</div>
          })}
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
    return etch.destroy(this)
  }

  toOffset(offset) {
    const hex = offset.toString(16)
    return `${'00000000'.substring(hex.length)}${hex}`
  }

  toByte(byte) {
    const hex = byte.toString(16)
    return `${'00'.substring(hex.length)}${hex}`
  }

  toChar(byte) {
    if (32 <= byte && byte <= 126)
      return String.fromCharCode(byte)
    return '.'
  }
}

export default class HexEditorComponent {
  constructor(properties, children) {
    this.properties = properties

    this.properties.lines = []
    this.properties.startOffset = 0
    this.properties.endOffset = 16

    this.children = children
    etch.initialize(this)
    this.update()
  }

  render() {
    return <BinaryFileEditorComponent ref='container' {...this.properties} on={{mousewheel: (event) => this.onMouseWheel(event)}}>
      <div className='hex-container'>
        <div className='hex-metric' ref='metrics'>
          <div className='hex-chars'>
            <div className='hex-char'>&nbsp;</div>
          </div>
        </div>
        {this.lines.map((line) => {
          return <HexLineComponent {...line} key={line.offset}></HexLineComponent>
        })}
      </div>
    </BinaryFileEditorComponent>
  }

  update(properties, children) {
    if (properties && this.properties !== properties)
      this.properties = properties
    if (children && this.children !== children)
      this.children = children

    if (isNaN(this.height))
      return setTimeout(() => {
          this.startOffset = 0
          this.update()
        })

    this.refreshLines()
    return etch.update(this)
  }

  destroy() {
    this.disposables.dispose()
    return etch.destroy(this)
  }

  get container() { return this.refs.container }
  get metrics() { return this.container.refs.metrics }
  get lines() { return this.properties.lines }
  get file() { return this.properties.file }

  get firstLine() { return this.container.refs.first }
  get lastLine() { return this.container.refs.last }

  get startOffset() { return this.properties.startOffset }
  get endOffset() { return this.properties.endOffset }
  get width() { return 32 }
  get height() { return Math.floor(this.container.element.getBoundingClientRect().height / this.metrics.getBoundingClientRect().height - 1) * this.width }

  set startOffset(startOffset) {
    if (startOffset >= this.file.size - this.height)
      this.properties.startOffset = Math.ceil(this.file.size / this.width) * this.width - this.height
    else if (startOffset < 0)
      this.properties.startOffset = 0
    else
      this.properties.startOffset = startOffset
    this.properties.endOffset = this.startOffset + this.height
  }

  onMouseWheel(event) {
    this.startOffset -= Math.ceil(event.wheelDelta / this.metrics.getBoundingClientRect().height) * this.width
    this.update()
  }

  removeLines(startOffset, endOffset) {
    const startDropCount = Math.floor((this.startOffset - startOffset) / this.width)
    const endDropCount = Math.floor((endOffset - this.endOffset) / this.width)

    if (startDropCount > 0)
      this.lines.splice(0, startDropCount)

    if (endDropCount > 0)
      this.lines.splice(this.lines.length - endDropCount, endDropCount)
  }

  addLines(startOffset, endOffset) {
    const startMissCount = Math.ceil((startOffset - this.startOffset) / this.width)
    const endMissCount = Math.ceil((this.endOffset - endOffset) / this.width)

    if (endMissCount > 0)
      this.readLines(endOffset, endMissCount, (lines) => this.lines.push(...lines))

    if (startMissCount > 0)
      this.readLines(this.startOffset, startMissCount, (lines) => this.lines.unshift(...lines))
  }

  readLines(offset, lineCount, callback) {
    if (lineCount < 1) return
    let lines = []

    const readLine = (offset, lineCount) => {
      if (offset < this.file.size)
        lines.push({offset: offset, bytes: [...this.file.readSync(offset, this.width)]})
      if (lineCount > 1)
        readLine(offset + this.width, lineCount - 1)
      if (lineCount === 1)
        callback(lines)
    }

    readLine(offset, lineCount)
  }

  refreshLines() {
    const startOffset = this.lines.length === 0 ? 0 : this.lines[0].offset
    const endOffset = this.lines.length === 0 ? this.width : this.lines[this.lines.length - 1].offset + this.width

    this.addLines(startOffset, this.lines.length === 0 ? 0 : endOffset)
    this.removeLines(startOffset, endOffset)
  }
}
