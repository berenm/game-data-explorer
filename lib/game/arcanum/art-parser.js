/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

const FrameParser = new Parser()
  .endianess('little')
  .uint32('width')
  .uint32('height')
  .uint32('size')
  .int32('off_x')
  .int32('off_y')
  .int32('hot_x')
  .int32('hot_y')
allowUnsafeNewFunction(() => FrameParser.compile())
FrameParser.size = FrameParser.sizeOf()

const PaletteParser = new Parser()
  .endianess('little')
  .array('color', {length: 256, type: 'uint32le'})
allowUnsafeNewFunction(() => PaletteParser.compile())
PaletteParser.size = PaletteParser.sizeOf()

const HeaderParser = new Parser()
  .endianess('little')
  .uint32('flags')
  .uint32('frame_rate')
  .uint32('rotation_count')
  .array('palette_list', {length: 4, type: 'uint32le'})
  .uint32('action_frame')
  .uint32('frame_count')
  .array('info_list', {length: 8, type: 'uint32le'})
  .array('size_list', {length: 8, type: 'uint32le'})
  .array('data_list', {length: 8, type: 'uint32le'})
allowUnsafeNewFunction(() => HeaderParser.compile())
HeaderParser.size = HeaderParser.sizeOf()

class ARTParser {
  parse(parser, offset) {
    return parser.parse(this.file.readSync(offset, parser.size))
  }

  constructor(file) {
    this.file = file

    this.header = this.parse(HeaderParser, 0)
    if (this.header.flags & 1) {
      this.header.rotation_count = 1
    }

    this.palettes = []
    for (let i = 0; i <= 3; i++) {
      if (this.header.palette_list[i] !== 0)
        this.palettes.push(this.parse(PaletteParser, HeaderParser.size + (PaletteParser.size * i)))
    }

    this.frames = []
    for (let i = 0, end = (this.header.frame_count * this.header.rotation_count); i < end; ++i) {
      this.frames.push(this.parse(FrameParser, HeaderParser.size + (PaletteParser.size * this.palettes.length) + (FrameParser.size * i)))
    }

    let offset = HeaderParser.size + (PaletteParser.size * this.palettes.length) + (FrameParser.size * this.frames.length)
    for (let frame of this.frames) {
      const buffer = this.file.readSync(offset, frame.size)
      offset += frame.size

      if (frame.size === (frame.width * frame.height)) {
        frame.pixels = buffer
      } else {
        frame.pixels = new Buffer(frame.width * frame.height)

        let [i, j] = [0, 0]
        while (i < buffer.length) {
          const byte = buffer[i++]
          const rep = byte & 0x80
          const cnt = byte & 0x7f

          for (let n = 0; n < cnt; ++n) {
            frame.pixels[j++] = buffer[i]
            if (rep !== 0) { i++ }
          }

          if (rep === 0) { i++ }
        }
      }
    }
  }
}

export {ARTParser}
