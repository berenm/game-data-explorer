FileEditor = require './file-editor'

module.exports =
class DAT1Editor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './dat1-editor-view'
  isEqual: (other) -> other instanceof DAT1Editor and
                      @getURI() is other.getURI()
