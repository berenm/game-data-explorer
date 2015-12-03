{View} = require 'atom-space-pen-views'

module.exports =
class EntryView extends View
  initialize: ->
    @on 'click', =>
      @select()
      @activate()
      false

    atom.commands.add @element,
      'core:confirm': =>
        @activate() if @isSelected()

      'core:move-down': =>
        if @isSelected()
          entries = @closest('.xoreos-editor').find('.entry')
          $(entries[entries.index(@name) + 1]).view()?.select()

      'core:move-up': =>
        if @isSelected()
          entries = @closest('.xoreos-editor').find('.entry')
          $(entries[entries.index(@name) - 1]).view()?.select()

  isSelected: -> @hasClass('selected')

  select: ->
    @closest('.xoreos-editor').find('.selected').toggleClass('selected')
    @addClass('selected')
    @focus()
