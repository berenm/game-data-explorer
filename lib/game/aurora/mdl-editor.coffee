FileEditor = require '../../file-editor'

module.exports =
class MDLEditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './mdl-editor-view'
  isEqual: (other) -> other instanceof MDLEditor and @getURI() is other.getURI()
