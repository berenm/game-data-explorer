/** @babel */
/** @jsx etch.dom */

import child from 'child_process'

import {fs} from '../../core/util'
import ImageFileEditorComponent from '../../core/image-file-editor-component'

import {ARTParser} from './art-parser'

export default class ARTEditorView extends ImageFileEditorComponent {
  constructor(properties, children) {
    super(properties, children, (properties) => {
      properties.parser = new ARTParser(properties.file)
    })
  }

  update(properties, children) {
    let frameList = ``
    let maxWidth = 0
    let maxHeight = 0
    let maxOffX = 0
    let maxOffY = 0
    for (let frame of this.parser.frames) {
      maxWidth = Math.max(frame.width - frame.off_x, maxWidth)
      maxHeight = Math.max(frame.height - frame.off_y, maxHeight)
      maxOffX = Math.max(frame.off_x, maxOffX)
      maxOffY = Math.max(frame.off_y, maxOffY)
    }

    for (let [i, frame] of this.parser.frames.entries()) {
      const buffer = new Buffer(frame.pixels.length * 4)
      for (let j = 0, end = frame.pixels.length, offset = 0; j < end; ++j) {
        const palette = this.parser.palettes[0]
        const pixel = frame.pixels[j]
        const color = pixel === 0 ? 0 : palette.color[pixel] + 0xff000000
        buffer.writeUInt8((color >> 16) & 0xff, offset++)
        buffer.writeUInt8((color >>  8) & 0xff, offset++)
        buffer.writeUInt8((color >>  0) & 0xff, offset++)
        buffer.writeUInt8((color >> 24) & 0xff, offset++)
      }

      const fileName = `${this.file.path}-${i}.pam`
      const frameFile = fs.openSync(fileName, 'w')
      fs.appendFileSync(frameFile,
                       'P7\n' +
                       `WIDTH ${frame.width}\n` +
                       `HEIGHT ${frame.height}\n` +
                       'DEPTH 8\n' +
                       'MAXVAL 255\n' +
                       'TUPLTYPE RGB_ALPHA\n' +
                       'ENDHDR\n')
      fs.appendFileSync(frameFile, buffer)

      const framePage = ` -page +${maxOffX - frame.off_x}+${maxOffY - frame.off_y} '${fileName}'`
      child.execSync(`convert -size ${maxOffX + maxWidth}x${maxOffY + maxHeight} -background transparent xc:none ${framePage} -layers flatten '${this.file.path}-${i.toString().padStart(4, '0')}.png'`)

      frameList += framePage
    }

    let framePerRotation = this.parser.frames.length / this.parser.header.rotation_count
    let commandLine = ''
    for (let i = 0; i < this.parser.header.rotation_count; i++) {
      commandLine += ' \\('
      for (let j = 0; j < framePerRotation; j++) {
        commandLine += ` '${this.file.path}-${(i * framePerRotation + j).toString().padStart(4, '0')}.png'`
      }
      commandLine += ' +append \\)'
    }

    child.execSync(`convert ${commandLine} -append '${this.file.path}.sheet.png'`)
    child.execSync(`convert -background transparent ${frameList} -set delay ${this.parser.header.frame_rate} -set dispose background -page ${maxOffX + maxWidth}x${maxOffY + maxHeight} '${this.file.path}.gif'`)
    super.update(properties, children)
  }

  get parser() { return this.properties.parser }
  get src() { return `${this.file.path}.sheet.png` }
}
