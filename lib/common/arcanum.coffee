fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn

{DAT1} = require '../data/arcanum/dat1'
{FileEntry, DirectoryEntry} = require '../core/archive-entry'

zlib = require 'zlib'

module.exports =
  readFile: (dat1File, archivePath, entryPath, callback) ->
    file = dat1File.files[entryPath]

    if DAT1.types[file.type] is 'zlib'
      buffer = new Buffer file.size_compressed
      fs.readSync dat1File.file, buffer, 0, buffer.length, file.offset
      buffer = zlib.inflateSync buffer
    else
      buffer = new Buffer file.size_uncompressed
      fs.readSync dat1File.file, buffer, 0, buffer.length, file.offset

    callback null, buffer

  list: (archivePath, callback) ->
    file = new DAT1 archivePath

    entry = new DirectoryEntry({path: archivePath})
    for filePath in file.list()
      entry.addChild(new FileEntry({path: filePath}))

    callback null, file, [entry]
