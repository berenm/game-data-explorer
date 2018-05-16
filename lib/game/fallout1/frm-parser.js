/** @babel */

import {allowUnsafeNewFunction} from 'loophole'
import {Parser} from 'binary-parser'

const FrameParser = new Parser()
  .endianess('big')
  .uint16('width')
  .uint16('height')
  .uint32('size')
  .int16('rel_x')
  .int16('rel_y')
allowUnsafeNewFunction(() => FrameParser.compile())
FrameParser.size = FrameParser.sizeOf()

const HeaderParser = new Parser()
  .endianess('big')
  .uint32('version')
  .uint16('frame_rate')
  .uint16('action_frame')
  .uint16('frame_count')
  .array('off_x', {length: 6, type: 'int16be'})
  .array('off_y', {length: 6, type: 'int16be'})
  .array('offset', {length: 6, type: 'uint32be'})
  .uint32('data_size')
allowUnsafeNewFunction(() => HeaderParser.compile())
HeaderParser.size = HeaderParser.sizeOf()

class FRMParser {
  parse(parser, offset) {
    return parser.parse(this.file.readSync(offset, parser.size))
  }

  parseFrame(offset) {
    let frame = this.parse(FrameParser, offset)
    offset += FrameParser.size

    frame.pixels = this.file.readSync(offset, frame.size)
    offset += frame.size

    this.frames.push(frame)
    return offset
  }

  constructor(file) {
    this.file = file

    let offset = 0
    this.header = this.parse(HeaderParser, offset)
    offset += HeaderParser.size

    this.frames = []
    if (this.header.frame_count == 1) {
      this.rotation_count = 1
      offset = this.parseFrame(offset)
    } else {
      if (this.file.filePath.toLowerCase().endsWith('frm'))
        this.rotation_count = 6
      else
        this.rotation_count = 1

      let offset = HeaderParser.size
      for (let r = 0; r < this.rotation_count; ++r) {
        for (let i = 0, end = this.header.frame_count; i < end; ++i) {
          offset = this.parseFrame(offset)
        }
      }
    }
  }
}

export {FRMParser}
