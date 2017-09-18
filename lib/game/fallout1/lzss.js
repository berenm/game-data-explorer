/** @babel */

function decompressBlock(input) {
  const minlen = 3
  const maxlen = 18
  const dlen   = 4096
  const dbuf   = Array(dlen + 1).join(' ').split('')
  let dpos     = dlen - maxlen
  let ipos     = 0
  let out      = []

  let flags = 0
  while (ipos < input.length) {
    flags = flags >> 1
    if ((flags & 0x100) === 0) {
      flags = input.readUInt8(ipos) | 0xff00
      ipos  = ipos + 1
    }

    if ((flags & 1) !== 0) {
      if (ipos > (input.length - 1)) { throw new Error('Input buffer too small') }
      out.push(dbuf[dpos % dlen] = input[ipos])
      ipos += 1
      dpos += 1
    } else {
      if (ipos > (input.length - 2)) { throw new Error('Input buffer too small') }
      let doff = input.readUInt8(ipos + 0)
      let olen = input.readUInt8(ipos + 1)
      doff = doff | ((olen & 0xf0) << 4)
      olen = (olen & 0x0f) + minlen
      for (let i = 0; i < olen; ++i)
        out.push(dbuf[(dpos + i) % dlen] = dbuf[(doff + i) % dlen])
      ipos += 2
      dpos += olen
    }
  }

  return out
}

class LZSS {
  static decompressSync(input) {
    let ipos = 0
    let npos = 0
    let rlen = 0
    let output = []

    while (ipos < input.length) {
      npos = ipos + 2
      rlen = input.slice(ipos, npos).readUInt16BE()
      ipos = npos
      if (rlen === 0) { break }
      if (rlen < 0) {
        npos = ipos - rlen
        output.push(input.slice(ipos, npos))
        ipos = npos
      } else {
        npos = ipos + rlen
        const block = decompressBlock(input.slice(ipos, Math.min(npos, input.length)))
        output = output.concat(block)
        ipos = npos
      }
    }

    return Buffer.from(output)
  }
}

module.exports=
  {LZSS}
