/** @babel */
/** @jsx etch.dom */

import child from 'child_process'

import {fs} from '../../core/util'
import ImageFileEditorComponent from '../../core/image-file-editor-component'

import {FRMParser} from './frm-parser'

export default class FRMEditorView extends ImageFileEditorComponent {
  constructor(properties, children) {
    super(properties, children, (properties) => {
      properties.parser = new FRMParser(properties.file)
    })
  }

  update(properties, children) {
    let frameList = ``
    let [offX, offY] = [0, 0]
    let [minX, maxX] = [+Infinity, 0]
    let [minY, maxY] = [+Infinity, 0]
    for (let [i, frame] of this.parser.frames.entries()) {
      if ((i % this.parser.header.frame_count) == 0) {
        offX = this.parser.header.off_x[i / this.parser.header.frame_count]
        offY = this.parser.header.off_y[i / this.parser.header.frame_count]
      }

      offX += frame.rel_x
      offY += frame.rel_y
      frame.off_x = offX - Math.floor(frame.width / 2)
      frame.off_y = offY - frame.height
      minX = Math.min(minX, frame.off_x)
      minY = Math.min(minY, frame.off_y)
      maxX = Math.max(maxX, frame.off_x + frame.width)
      maxY = Math.max(maxY, frame.off_y + frame.height)
    }

    let maxWidth = maxX - minX
    let maxHeight = maxY - minY
    for (let frame of this.parser.frames) {
      frame.off_x -= minX
      frame.off_y -= minY
    }

    const palette = {color: [
      0x000000ff, 0xffececec, 0xffdcdcdc, 0xffcccccc, 0xffbcbcbc, 0xffb0b0b0, 0xffa0a0a0, 0xff909090, 0xff808080, 0xff747474, 0xff646464, 0xff545454, 0xff484848, 0xff383838, 0xff282828, 0xff202020,
      0xfffcecec, 0xffecd8d8, 0xffdcc4c4, 0xffd0b0b0, 0xffc0a0a0, 0xffb09090, 0xffa48080, 0xff947070, 0xff846060, 0xff785454, 0xff684444, 0xff583838, 0xff4c2c2c, 0xff3c2424, 0xff2c1818, 0xff201010,
      0xffececfc, 0xffd8d8ec, 0xffc4c4dc, 0xffb0b0d0, 0xffa0a0c0, 0xff9090b0, 0xff8080a4, 0xff707094, 0xff606084, 0xff545478, 0xff444468, 0xff383858, 0xff2c2c4c, 0xff24243c, 0xff18182c, 0xff101020,
      0xfffcb0f0, 0xffc460a8, 0xff682460, 0xff4c1448, 0xff380c34, 0xff281024, 0xff240424, 0xff1c0c18, 0xfffcfcc8, 0xfffcfc7c, 0xffe4d80c, 0xffccb81c, 0xffb89c28, 0xffa48830, 0xff907824, 0xff7c6818,
      0xff6c5810, 0xff584808, 0xff483804, 0xff342800, 0xff201800, 0xffd8fc9c, 0xffb4d884, 0xff98b870, 0xff78985c, 0xff5c7848, 0xff405834, 0xff283820, 0xff706050, 0xff544834, 0xff383020, 0xff687850,
      0xff707820, 0xff706828, 0xff606024, 0xff4c4424, 0xff383020, 0xff9cac9c, 0xff789478, 0xff587c58, 0xff406840, 0xff385858, 0xff304c48, 0xff28443c, 0xff203c2c, 0xff1c3024, 0xff142818, 0xff102010,
      0xff183018, 0xff10240c, 0xff081c04, 0xff041400, 0xff040c00, 0xff8c9c9c, 0xff789498, 0xff648894, 0xff507c90, 0xff406c8c, 0xff30588c, 0xff2c4c7c, 0xff28446c, 0xff20385c, 0xff1c304c, 0xff182840,
      0xff9ca4a4, 0xff384868, 0xff505858, 0xff586884, 0xff384050, 0xffbcbcbc, 0xffaca498, 0xffa0907c, 0xff947c60, 0xff88684c, 0xff7c5834, 0xff704824, 0xff643c14, 0xff583008, 0xfffccccc, 0xfffcb0b0,
      0xfffc9898, 0xfffc7c7c, 0xfffc6464, 0xfffc4848, 0xfffc3030, 0xfffc0000, 0xffe00000, 0xffc40000, 0xffa80000, 0xff900000, 0xff740000, 0xff580000, 0xff400000, 0xfffce0c8, 0xfffcc494, 0xfffcb878,
      0xfffcac60, 0xfffc9c48, 0xfffc942c, 0xfffc8814, 0xfffc7c00, 0xffdc6c00, 0xffc06000, 0xffa45000, 0xff844400, 0xff683400, 0xff4c2400, 0xff301800, 0xfff8d4a4, 0xffd8b078, 0xffc8a064, 0xffbc9054,
      0xffac8044, 0xff9c7434, 0xff8c6428, 0xff7c581c, 0xff704c14, 0xff604008, 0xff503404, 0xff402800, 0xff342000, 0xfffce4b8, 0xffe8c898, 0xffd4ac7c, 0xffc49064, 0xffb0744c, 0xffa05c38, 0xff904c2c,
      0xff843c20, 0xff782c18, 0xff6c2010, 0xff5c1408, 0xff480c04, 0xff3c0400, 0xfffce8dc, 0xfff8d4bc, 0xfff4c0a0, 0xfff0b084, 0xfff0a06c, 0xfff0945c, 0xffd88054, 0xffc07048, 0xffa86040, 0xff905038,
      0xff784030, 0xff603024, 0xff48241c, 0xff381814, 0xff64e464, 0xff149814, 0xff00a400, 0xff505048, 0xff006c00, 0xff8c8c84, 0xff1c1c1c, 0xff685038, 0xff302820, 0xff8c7060, 0xff483828, 0xff0c0c0c,
      0xff3c3c3c, 0xff6c746c, 0xff788478, 0xff889488, 0xff94a494, 0xff586860, 0xff607068, 0xff3cf800, 0xff38d408, 0xff34b410, 0xff309414, 0xff287418, 0xfffcfcfc, 0xfff0ecd0, 0xffd0b888, 0xff987c50,
      0xff68583c, 0xff504024, 0xff34281c, 0xff18100c, 0xff000000, 0xff006c00, 0xff0b7307, 0xff1b7b0f, 0xff2b831b, 0xff6b6b6f, 0xff63677f, 0xff576b8f, 0xff0093a3, 0xff6bbbff, 0xffff0000, 0xffd70000,
      0xff932b0b, 0xffff7700, 0xffff3b00, 0xff470000, 0xff7b0000, 0xffb30000, 0xff7b0000, 0xff470000, 0xff533f2b, 0xff4b3b2b, 0xff433727, 0xff3f3327, 0xff372f23, 0xff332b23, 0xfffc0000, 0xffffffff]}
    for (let [i, frame] of this.parser.frames.entries()) {
      const buffer = new Buffer(frame.pixels.length * 4)
      for (let j = 0, end = frame.pixels.length, offset = 0; j < end; ++j) {
        const pixel = frame.pixels[j]
        const color = palette.color[pixel]
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

      const framePage = ` -page +${frame.off_x}+${frame.off_y} '${fileName}'`
      child.execSync(`convert -size ${maxWidth}x${maxHeight} -background transparent xc:none ${framePage} -layers flatten '${this.file.path}-${i.toString().padStart(4, '0')}.png'`)

      frameList += framePage
    }

    if (this.parser.frames.length == 1) {
      child.execSync(`convert '${this.file.path}-0000.png' '${this.file.path}.png'`)
    } else {
      let framePerRotation = this.parser.frames.length / this.parser.rotation_count
      let animCmdLine = ''
      let gridCmdLine = ''
      for (let i = 0; i < this.parser.rotation_count; i++) {
        gridCmdLine += ' \\('
        for (let j = 0; j < framePerRotation; j++) {
          gridCmdLine += ` '${this.file.path}-${(i * framePerRotation + j).toString().padStart(4, '0')}.png'`
          animCmdLine += ` '${this.file.path}-${(i * framePerRotation + j).toString().padStart(4, '0')}.png'`
        }
        gridCmdLine += ' +append \\)'
      }

      child.execSync(`convert ${gridCmdLine} -append '${this.file.path}.png'`)
      child.execSync(`convert -background transparent ${animCmdLine} -set delay ${50 / this.parser.header.frame_rate} -set dispose background -page ${maxWidth}x${maxHeight} -morph 1 '${this.file.path}.gif'`)
    }

    super.update(properties, children)
  }

  get parser() { return this.properties.parser }
  get src() {
    if (this.parser.frames.length == 1) {
      return `${this.file.path}.png`
    } else {
      return `${this.file.path}.gif`
    }
  }
}
