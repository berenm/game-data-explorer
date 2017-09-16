fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn
lzo = require 'lzo'

{BF} = require '../data/bf'
{FileEntry, DirectoryEntry} = require '../core/archive-entry'

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

    entry = new DirectoryEntry({path: archivePath})
    for filePath in bfFile.list()
      entry.addChild(new FileEntry({path: filePath}))

    callback null, bfFile, [entry]
