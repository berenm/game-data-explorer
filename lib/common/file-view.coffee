EntryView = require './entry-view'

module.exports =
class FileView extends EntryView
  @content: (archivePath, entry) ->
    @li class: 'list-item entry', tabindex: -1, =>
      @span entry.getName(), class: 'file icon', outlet: 'name'

  initialize: (@archivePath, @entry, @callback) ->
    super
    if @entry.isSymbolicLink()
      @name.addClass('icon-file-symlink-file')
    else
      @name.addClass('icon-file-text')

  activate: -> @callback(@entry)
