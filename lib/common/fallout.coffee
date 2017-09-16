fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn

{DAT} = require '../data/fallout/dat'
{FileEntry, DirectoryEntry} = require '../core/archive-entry'

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

    entry = new DirectoryEntry({path: archivePath})
    for filePath in file.list()
      entry.addChild(new FileEntry({path: filePath}))

    callback null, file, [entry]
