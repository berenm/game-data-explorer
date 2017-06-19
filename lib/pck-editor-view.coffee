commandos2 = require './common/commandos2'
ArchiveEditorView = require './archive-editor-view'

module.exports =
class PCKEditorView extends ArchiveEditorView
  listFiles: (path, callback) ->
    return commandos2.list path, callback

  readFile: (file, path, entryPath, callback) ->
    return commandos2.readFile file, path, entryPath, callback
