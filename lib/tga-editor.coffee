FileEditor = require './file-editor'

module.exports =
class TGAEditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './tga-editor-view'

  isEqual: (other) -> other instanceof TGAEditor and @getURI() is other.getURI()
