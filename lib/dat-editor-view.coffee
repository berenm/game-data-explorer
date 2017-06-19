fallout = require './common/fallout'
fallout2 = require './common/fallout2'
ArchiveEditorView = require './archive-editor-view'

module.exports =
class DATEditorView extends ArchiveEditorView
  listFiles: (path, callback) ->
    try
      files = fallout2.list path, callback
      @backend = fallout2
    catch
      files = fallout.list path, callback
      @backend = fallout
    return files

  readFile: (file, path, entryPath, callback) ->
    return @backend.readFile file, path, entryPath, callback
