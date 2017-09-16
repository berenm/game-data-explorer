fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn

{PCK} = require '../data/commandos2/pck'
{FileEntry, DirectoryEntry} = require '../core/archive-entry'

module.exports =
  readFile: (pckFile, archivePath, entryPath, callback) ->
    file = pckFile.files[entryPath]
    buffer = new Buffer file.size
    fs.readSync pckFile.file, buffer, 0, buffer.length, file.offset

    callback null, buffer

  list: (archivePath, callback) ->
    file = new PCK archivePath

    entry = new DirectoryEntry({path: archivePath})
    for filePath in file.list()
      entry.addChild(new FileEntry({path: filePath}))

    callback null, file, [entry]
