fs = require 'fs'
path = require 'path'
cprocess = require 'child_process'
spawn = cprocess.spawn

{KEYV1} = require '../data/keyv1'
{BIFFV1} = require '../data/biffv1'
{FileEntry, DirectoryEntry} = require '../core/archive-entry'

module.exports =
  readFile: (keyFile, archivePath, entryPath, callback) ->
    res = keyFile.ress[path.basename(entryPath)]
    bif = keyFile.bifs[res.bifIndex]

    bif.BIFFV1 ?= new BIFFV1 path.join(path.dirname(archivePath), bif.path)

    varRes = bif.BIFFV1.varRess[res.resIndex]
    buffer = new Buffer varRes.size
    fs.readSync bif.BIFFV1.file, buffer, 0, varRes.size, varRes.offset

    callback null, buffer

  list: (archivePath, callback) ->
    keyFile = new KEYV1 archivePath

    entry = new DirectoryEntry({path: archivePath})
    for resPath in keyFile.list()
      entry.addChild(new FileEntry({path: resPath}))

    callback null, keyFile, [entry]
