humanize = require 'humanize-plus'
path = require 'path'
fs = require 'fs-plus'
temp = require 'temp'

arcanum = require './common/arcanum'
FileView = require './common/file-view'
DirectoryView = require './common/directory-view'

FileEditorView = require './file-editor-view'

module.exports =
class DAT1EditorView extends FileEditorView
  @content: ->
    @div class: 'xoreos-editor', tabindex: -1, =>
      @div class: 'xoreos-container', =>
        @div outlet: 'loadingMessage', class: 'padded icon icon-hourglass text-info', 'Loading content\u2026'
        @div outlet: 'errorMessage', class: 'padded icon icon-alert text-error'
        @div class: 'inset-panel', =>
          @div outlet: 'summary', class: 'panel-heading'
          @ol outlet: 'tree', class: 'xoreos-tree padded list-tree has-collapsable-children'

  initialize: (editor) ->
    super(editor)

    @on 'focus', =>
      @focusSelectedFile()
      false

  refresh: ->
    @summary.hide()
    @tree.hide()
    @loadingMessage.show()
    @errorMessage.hide()

    originalPath = @path
    temp.mkdir 'atom-', (error, @tempDirPath) =>
      if error?
        console.error("Error creating temp directory: #{tempDirPath}", error)
      else
        arcanum.list @path, (error, @file, entries) =>
          return unless originalPath is @path

          @loadingMessage.hide()
          if error?
            message = 'Reading the archive file failed'
            message += ": #{error.message}" if error.message
            @errorMessage.show().text(message)
          else
            @createTreeEntries(entries)
            @updateSummary()

  openFile: (entry) ->
    return unless not entry.isDirectory()
    entryPath = entry.getPath().substring(@path.length + 1)
    arcanum.readFile @file, @path, entryPath, (error, contents) =>
      if error?
        console.error("Error reading: #{entryPath} from #{@path}", error)
      else
        tempFilePath = path.join(@tempDirPath, path.basename(@path), entryPath)
        fs.writeFile tempFilePath, contents, (error) ->
          if error?
            console.error("Error writing to #{tempFilePath}", error)
          else
            atom.workspace.open(tempFilePath)

  createTreeEntries: (entries) ->
    @tree.empty()

    for entry in entries
      if entry.isDirectory()
        @tree.append(new DirectoryView(@path, entry, (entry) => @openFile(entry)))
      else
        @tree.append(new FileView(@path, entry, (entry) => @openFile(entry)))

    @tree.show()
    @tree.find('.file').view()?.select()

  updateSummary: ->
    fileCount = @tree.find('.file').length
    fileLabel = if fileCount is 1 then '1 file' else "#{humanize.intComma(fileCount)} files"

    directoryCount = @tree.find('.directory').length
    directoryLabel = if directoryCount is 1 then '1 folder' else "#{humanize.intComma(directoryCount)} folders"

    @summary.text("#{humanize.fileSize(fs.getSizeSync(@path))} with #{fileLabel} and #{directoryLabel}").show()

  focusSelectedFile: -> @tree.find('.selected').view()?.focus()
  focus: -> @focusSelectedFile()
