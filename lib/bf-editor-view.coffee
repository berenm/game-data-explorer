bge = require './common/bge'
ArchiveEditorView = require './archive-editor-view'

module.exports =
class BFEditorView extends ArchiveEditorView
  listFiles: (path, callback) ->
    return bge.list path, callback

  readFile: (file, path, entryPath, callback) ->
    return bge.readFile file, path, entryPath, callback
