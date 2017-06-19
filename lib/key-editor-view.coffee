aurora = require './common/aurora'
ArchiveEditorView = require './archive-editor-view'

module.exports =
class KEYEditorView extends ArchiveEditorView
  listFiles: (path, callback) ->
    return aurora.list path, callback

  readFile: (file, path, entryPath, callback) ->
    return aurora.readFile file, path, entryPath, callback
