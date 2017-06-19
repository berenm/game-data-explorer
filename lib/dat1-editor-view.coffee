arcanum = require './common/arcanum'
ArchiveEditorView = require './archive-editor-view'

module.exports =
class DAT1EditorView extends ArchiveEditorView
  listFiles: (path, callback) ->
    return arcanum.list path, callback

  readFile: (file, path, entryPath, callback) ->
    return arcanum.readFile file, path, entryPath, callback
