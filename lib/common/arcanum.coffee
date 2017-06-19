fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn

{DAT1} = require '../data/arcanum/dat1'
ArchiveEntry = require './archive-entry'

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

    entry = new ArchiveEntry(archivePath, 5)
    for filePath in file.list()
      entry.add(new ArchiveEntry(filePath, 0))

    callback null, file, [entry]
