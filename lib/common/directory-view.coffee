EntryView = require './entry-view'
FileView = require './file-view'

module.exports =
class DirectoryView extends EntryView
  @content: (archivePath, entry) ->
    @li class: 'list-nested-item entry collapsed', =>
      @span class: 'list-item', =>
        @span entry.getName(), class: 'directory icon icon-file-directory'
      @ol class: 'list-tree', outlet: 'entries'

  initialize: (@archivePath, @entry, @callback) ->
    super
    @isExpanded = null

  activate: -> if @isExpanded then @collapse() else @expand()

  expand: () ->
    @toggleClass('expanded')
    @toggleClass('collapsed')

    if @isExpanded == null
      for child in @entry.children
        if child.isDirectory()
          @entries.append(new DirectoryView(@archivePath, child, @callback))
        else
          @entries.append(new FileView(@archivePath, child, @callback))

    @isExpanded = true

  collapse: (isRecursive=false) ->
    @isExpanded = false
    @toggleClass('expanded')
    @toggleClass('collapsed')

  select: ->
    @closest('.xoreos-editor').find('.selected').toggleClass('selected')
    @addClass('selected')
    @focus()
