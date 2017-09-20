/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

import BinaryFileEditorComponent from './core/binary-file-editor-component'
import AbstractComponent from './core/abstract-component'

class HexLineComponent extends AbstractComponent {
  constructor(properties, children) {
    super(properties, children)
  }

  render() {
    return <div className='hex-line'>
      <div className='hex-offset'>{this.toOffset(this.properties.fileOffset)}</div>
      <div className='hex-bytes'>
        {[...Array(this.properties.start - this.properties.offset)].map((_, i) => {
          return <div className='hex-byte' key={i} style='visibility: hidden'>&nbsp;&nbsp;</div>
        })}
        {this.properties.bytes.map((byte, i) => {
          return <div className={`hex-byte color-${byte}`} key={i}>{this.toByte(byte)}</div>
        })}
        {[...Array(this.properties.offset + this.properties.root.width - this.properties.end)].map((_, i) => {
          return <div className='hex-byte' key={i} style='visibility: hidden'>&nbsp;&nbsp;</div>
        })}
      </div>
      <div className='hex-chars'>
        {[...Array(this.properties.start - this.properties.offset)].map((_, i) => {
          return <div className='hex-char' key={i} style='visibility: hidden'>&nbsp;</div>
        })}
        {this.properties.bytes.map((byte, i) => {
          return <div className='hex-char' key={i}>{this.toChar(byte)}</div>
        })}
        {[...Array(this.properties.offset + this.properties.root.width - this.properties.end)].map((_, i) => {
          return <div className='hex-char' key={i} style='visibility: hidden'>&nbsp;</div>
        })}
      </div>
    </div>
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

class HexOverlayComponent extends AbstractComponent {
  constructor(properties, children) {
    super(properties, children)
  }

  render() {
    return <div className='hex-line hex-overlay'>
      <div className='hex-text'>{this.properties.line}</div>
    </div>
  }

  toOffset(offset) {
    const hex = offset.toString(16)
    return `${'00000000'.substring(hex.length)}${hex}`
  }
}

export default class HexEditorComponent extends AbstractComponent {
  constructor(properties, children) {
    super(properties, children, (properties) => {
      properties.lines = []
      properties.startOffset = 0
      properties.endOffset = 16
      properties.layers = [{type: 'bytes', offset: 0, fileOffset: 0}]
    })

    this.update()
  }

  render() {
    let groups = []
    for (let i = 0, end = this.lines.length; i < end;) {
      if (this.lines[i].type === 'bytes') {
        let elements = []
        while (i < end && this.lines[i].type === 'bytes') {
          elements.push(<HexLineComponent {...this.lines[i]} key={this.lines[i].offset} root={this}></HexLineComponent>)
          i += 1
        }
        groups.push(<div className='hex-bytes-group'>{elements}</div>)
      } else if (this.lines[i].type === 'overlay') {
        let elements = []
        while (i < end && this.lines[i].type === 'overlay') {
          elements.push(<HexOverlayComponent {...this.lines[i]} key={this.lines[i].offset} root={this}></HexOverlayComponent>)
          i += 1
        }
        groups.push(<div className='hex-overlay-group'>{elements}</div>)
      }
    }

    return <BinaryFileEditorComponent ref='container' {...this.properties}>
      <div className='hex-container'>
        <div className='hex-controls'>
        </div>
        <div className='hex-contents' on={{mousewheel: (event) => this.onMouseWheel(event)}}>
          <div className='hex-metric' ref='metrics'>
            <div className='hex-chars'>
              <div className='hex-char'>&nbsp;</div>
            </div>
          </div>
          {groups}
        </div>
      </div>
    </BinaryFileEditorComponent>
  }

  update(properties, children) {
    super.update(properties, children, () => {
      if (isNaN(this.height))
        return setTimeout(() => {
            this.startOffset = 0
            this.update()
          })

      this.refreshLines()
    })
  }

  get container() { return this.refs.container }
  get metrics() { return this.container.refs.metrics }
  get lines() { return this.properties.lines }
  get file() { return this.properties.file }
  get layers() { return this.properties.layers }

  get firstLine() { return this.container.refs.first }
  get lastLine() { return this.container.refs.last }

  get startOffset() { return this.properties.startOffset }
  get endOffset() { return this.properties.endOffset }
  get width() { return 32 }
  get height() { return Math.floor(this.container.element.getBoundingClientRect().height / this.metrics.getBoundingClientRect().height - 1) * this.width }
  get length() { return this.layers[this.layers.length - 1].offset + (this.file.size - this.layers[this.layers.length - 1].fileOffset) }

  set startOffset(startOffset) {
    let roundFileSize = Math.ceil(this.length / this.width) * this.width - this.height
    if (startOffset < 0)
      this.properties.startOffset = 0
    else if (startOffset >= roundFileSize)
      this.properties.startOffset = Math.max(0, roundFileSize)
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

    let index = 0
    for (index = 0; index < this.layers.length - 1; ++index) {
      if (this.layers[index + 1].offset > offset)
        break
    }

    let layer = this.layers[index]
    let fileOffset = layer.fileOffset
    if (layer.type === 'bytes' && offset - layer.offset >= this.width) {
       fileOffset = Math.floor(layer.fileOffset / this.width) * this.width + (offset - layer.offset)
    }

    let lines = []
    for (let o = offset, end = offset + lineCount * this.width; o < end;) {
      if (layer.type === 'overlay') {
        const line = (o - layer.offset) / this.width
        lines.push({type: 'overlay', offset: o, fileOffset: layer.fileOffset, line: layer.textLines[line]})

        if (line == layer.textLines.length - 1) {
          index += 1
          layer = this.layers[index]
        }
        fileOffset = layer.fileOffset
        o += this.width
      } else {
        const readOffset = Math.floor(fileOffset / this.width) * this.width
        if (readOffset >= this.file.size) break
        const skipLength = fileOffset - readOffset
        const keepLength = Math.min(this.width, (index === this.layers.length - 1 ? this.file.size : this.layers[index + 1].fileOffset) - readOffset)
        const buffer = this.file.readSync(readOffset, this.width).slice(skipLength, keepLength)
        lines.push({type: 'bytes', offset: o, fileOffset: readOffset, bytes: [...buffer], start: o + skipLength, end: o + skipLength + buffer.length})

        fileOffset = readOffset + this.width
        o += this.width
        if (index < this.layers.length - 1 && o >= this.layers[index + 1].offset) {
          index += 1
          layer = this.layers[index]
        }
      }
    }

    callback(lines)
  }

  refreshLines() {
    const startOffset = this.lines.length === 0 ? 0 : this.lines[0].offset
    const endOffset = this.lines.length === 0 ? this.width : this.lines[this.lines.length - 1].offset + this.width

    this.addLines(startOffset, this.lines.length === 0 ? 0 : endOffset)
    this.removeLines(startOffset, endOffset)
  }

  addOverlay(fileOffset, length, textContent) {
    let index = 0
    for (index = 0; index < this.layers.length; ++index) {
      if (this.layers[index].fileOffset >= fileOffset)
        break
    }
    const prev = index > 0 ? this.layers[index - 1] : {type: null, offset: 0, fileOffset: 0}
    const next = index < this.layers.length ? this.layers[index] : {type: null, offset: -1, fileOffset: this.file.size}

    let offset
    if (prev.type === 'overlay') {
      offset = next.offset
    } else {
      const linePadd = (fileOffset % this.width) != 0 ? 1 : 0
      const lineCount = Math.floor((fileOffset - prev.fileOffset) / this.width) + linePadd
      offset = prev.offset + lineCount * this.width
    }

    if (next.type === 'bytes') {
      next.fileOffset = fileOffset + length
    }

    if (prev.type === 'bytes' && next.fileOffset > fileOffset + length) {
      this.layers.splice(index, 0, {type: 'bytes', offset: offset, fileOffset: fileOffset + length})
    }

    const textLines = textContent.trim().split(/\r?\n/)
    this.layers.splice(index, 0, {type: 'overlay', offset: offset, fileOffset: fileOffset, textLines: textLines})

    for (index = index + 1; index < this.layers.length; ++index) {
      this.layers[index].offset += textLines.length * this.width
    }
  }
}
