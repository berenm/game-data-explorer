fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn

{DAT} = require '../data/fallout2/dat'
ArchiveEntry = require './archive-entry'

zlib = require 'zlib'

module.exports =
  readFile: (datFile, archivePath, entryPath, callback) ->
    file = datFile.files[entryPath]

    if DAT.flags[file.flags] is 'zlib'
      buffer = new Buffer file.size_compressed
      fs.readSync datFile.file, buffer, 0, buffer.length, file.offset
      buffer = zlib.inflateSync buffer
    else
      buffer = new Buffer file.size_uncompressed
      fs.readSync datFile.file, buffer, 0, buffer.length, file.offset

    callback null, buffer

  list: (archivePath, callback) ->
    file = new DAT archivePath

    entry = new ArchiveEntry(archivePath, 5)
    for filePath in file.list()
      entry.add(new ArchiveEntry(filePath, 0))

    callback null, file, [entry]
