FileEditor = require './file-editor'

module.exports =
class HEXEditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './hex-editor-view'
  isEqual: (other) -> other instanceof HEXEditor and @getURI() is other.getURI()
