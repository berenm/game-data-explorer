fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn

{DIR} = require '../data/commandos/dir'
ArchiveEntry = require './archive-entry'

module.exports =
  readFile: (pckFile, archivePath, entryPath, callback) ->
    file = pckFile.files[entryPath]
    buffer = new Buffer file.size
    fs.readSync pckFile.file, buffer, 0, buffer.length, file.offset

    callback null, buffer

  list: (archivePath, callback) ->
    file = new DIR archivePath

    entry = new ArchiveEntry(archivePath, 5)
    for filePath in file.list()
      entry.add(new ArchiveEntry(filePath, 0))

    callback null, file, [entry]
