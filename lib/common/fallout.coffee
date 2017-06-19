fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn

{DAT} = require '../data/fallout/dat'
ArchiveEntry = require './archive-entry'

{LZSS} = require '../data/fallout/lzss'

module.exports =
  readFile: (datFile, archivePath, entryPath, callback) ->
    file = datFile.files[entryPath]
    file = datFile.files["./#{entryPath}"] if not file

    if DAT.flags[file.flags] is 'lzss'
      buffer = new Buffer file.size_compressed
      fs.readSync datFile.file, buffer, 0, buffer.length, file.offset
      buffer = LZSS.decompressSync buffer
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
