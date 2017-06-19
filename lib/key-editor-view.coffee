xoreos = require './common/xoreos'
ArchiveEditorView = require './archive-editor-view'

module.exports =
class KEYEditorView extends ArchiveEditorView
  listFiles: (path, callback) ->
    return xoreos.list path, callback

  readFile: (file, path, entryPath, callback) ->
    return xoreos.readFile file, path, entryPath, callback
