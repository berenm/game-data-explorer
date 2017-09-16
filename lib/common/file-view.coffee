EntryView = require './entry-view'

module.exports =
class FileView extends EntryView
  @content: (archivePath, entry) ->
    @li class: 'list-item entry', tabindex: -1, =>
      @span entry.name, class: 'file icon', outlet: 'name'

  initialize: (@archivePath, @entry, @callback) ->
    super
    @name.addClass('icon-file-text')

  activate: -> @callback(@entry)
