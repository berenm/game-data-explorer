class LZSS
  @decompressBlock: (input) ->
    out    = []
    minlen = 3
    maxlen = 18
    dlen   = 4096
    dpos   = dlen - maxlen
    dbuf   = (' ' for [1..dlen])
    ipos   = 0

    flags = 0
    while ipos < input.length
      flags = flags >> 1
      if (flags & 0x100) is 0
        flags = input.readUInt8(ipos) | 0xff00
        ipos  = ipos + 1

      if (flags & 1) isnt 0
        if ipos > input.length - 1 then throw new Error 'Input buffer too small'
        out.push(dbuf[dpos % dlen] = input[ipos])
        ipos += 1
        dpos += 1
      else
        if ipos > input.length - 2 then throw new Error 'Input buffer too small'
        doff = input.readUInt8(ipos + 0)
        olen = input.readUInt8(ipos + 1)
        doff = doff | ((olen & 0xf0) << 4)
        olen = (olen & 0x0f) + minlen
        for i in [0...olen]
          out.push(dbuf[(dpos + i) % dlen] = dbuf[(doff + i) % dlen])
        ipos += 2
        dpos += olen
    return out

  @decompressSync: (input) ->
    ipos = 0
    npos = 0
    rlen = 0
    output = []
    while ipos < input.length
      npos = ipos + 2
      rlen = input.slice(ipos, npos).readUInt16BE()
      ipos = npos
      break if rlen is 0
      if rlen < 0
        npos = ipos - rlen
        output.push input.slice(ipos, npos)
        ipos = npos
      else
        npos = ipos + rlen
        block = @decompressBlock input.slice(ipos, Math.min(npos, input.length))
        output = output.concat block
        ipos = npos
    return Buffer.from output

module.exports=
  LZSS: LZSS
