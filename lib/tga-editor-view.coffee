FileEditorView = require './file-editor-view'

exec = require('child_process').execSync

module.exports =
class TGAEditorView extends FileEditorView
  @content: ->
    @div class: 'xoreos-editor', tabindex: -1, =>
      @div class: 'xoreos-container', =>
        @div class: 'image-container', =>
          @div class: 'image-cell', =>
            @img outlet: 'image'

  refresh: ->
    exec("convert #{@path} #{@path}.png")
    @image.attr('src', "#{@path}.png")
