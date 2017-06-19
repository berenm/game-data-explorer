FileEditorView = require './file-editor-view'

exec = require('child_process').execSync

module.exports =
class WAVEditorView extends FileEditorView
  @content: ->
    @div class: 'gde-editor', tabindex: -1, =>
      @div class: 'gde-container', =>
        @div class: 'audio-container', =>
          @div class: 'audio-cell', =>
            @audio controls: true, outlet: 'audio'

  refresh: ->
    exec("ffmpeg -y -i '#{@path}' '#{@path}'.wav")
    @audio.attr('src', "#{@path}.wav")
