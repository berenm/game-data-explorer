fallout = require './common/fallout'
ArchiveEditorView = require './archive-editor-view'

module.exports =
class DATEditorView extends ArchiveEditorView
  listFiles: (path, callback) ->
    return fallout.list path, callback

  readFile: (file, path, entryPath, callback) ->
    return fallout.readFile file, path, entryPath, callback
