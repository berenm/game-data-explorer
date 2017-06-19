commandos = require './common/commandos'
ArchiveEditorView = require './archive-editor-view'

module.exports =
class DIREditorView extends ArchiveEditorView
  listFiles: (path, callback) ->
    return commandos.list path, callback

  readFile: (file, path, entryPath, callback) ->
    return commandos.readFile file, path, entryPath, callback
