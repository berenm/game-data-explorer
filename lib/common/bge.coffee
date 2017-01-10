fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn
lzo = require 'lzo'

{BF} = require '../data/bf'
ArchiveEntry = require './archive-entry'

module.exports =
  readFile: (bfFile, archivePath, entryPath, callback) ->
    file = bfFile.files[entryPath]

    buffer = new Buffer file.size
    fs.readSync bfFile.file, buffer, 0, file.size, file.offset + 4
    usize = buffer.readUInt32LE(0)
    csize = buffer.readUInt32LE(4)

    if (entryPath.endsWith '.bin') and (csize <= buffer.length)
      buffer = buffer.slice 8, csize + 8
      buffer = lzo.decompress buffer, usize

    callback null, buffer

  list: (archivePath, callback) ->
    bfFile = new BF archivePath

    entry = new ArchiveEntry(archivePath, 5)
    for filePath in bfFile.list()
      entry.add(new ArchiveEntry(filePath, 0))

    callback null, bfFile, [entry]
