FileEditor = require './file-editor'

module.exports =
class DIREditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './dir-editor-view'
  isEqual: (other) -> other instanceof DIREditor and
                      @getURI() is other.getURI()
