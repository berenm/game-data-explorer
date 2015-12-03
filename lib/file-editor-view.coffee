{ScrollView} = require 'atom-space-pen-views'
{CompositeDisposable} = require 'atom'

module.exports =
class FileEditorView extends ScrollView
  initialize: (editor) ->
    commandDisposable = super()
    commandDisposable.dispose()

    @setModel(editor)

  setPath: (path) ->
    if path and @path isnt path
      @path = path
      @refresh()

  setModel: (editor) ->
    @editorSubscriptions?.dispose()
    @editorSubscriptions = null

    if editor?
      @editorSubscriptions = new CompositeDisposable()
      @editor = editor
      @setPath(editor.getPath())
      @editorSubscriptions.add editor.file.onDidChange =>
        @refresh()
      @editorSubscriptions.add editor.file.onDidDelete =>
        atom.workspace.paneForItem(@editor)?.destroyItem(@editor)
      @editorSubscriptions.add editor.onDidDestroy =>
        @editorSubscriptions?.dispose()
        @editorSubscriptions = null
