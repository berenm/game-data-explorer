FileEditor = require './file-editor'

module.exports =
class PCKEditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './pck-editor-view'
  isEqual: (other) -> other instanceof PCKEditor and
                      @getURI() is other.getURI()
