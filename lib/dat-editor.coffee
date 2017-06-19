FileEditor = require './file-editor'

module.exports =
class DATEditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './dat-editor-view'
  isEqual: (other) -> other instanceof DATEditor and
                      @getURI() is other.getURI()
