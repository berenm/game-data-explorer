FileEditor = require './file-editor'

module.exports =
class KEYEditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './key-editor-view'
  isEqual: (other) -> other instanceof KEYEditor and @getURI() is other.getURI()
