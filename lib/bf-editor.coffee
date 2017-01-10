FileEditor = require './file-editor'

module.exports =
class BFEditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './bf-editor-view'
  isEqual: (other) -> other instanceof BFEditor and @getURI() is other.getURI()
