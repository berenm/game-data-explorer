FileEditor = require './file-editor'

module.exports =
class WAVEditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './wav-editor-view'
  isEqual: (other) -> other instanceof WAVEditor and @getURI() is other.getURI()
