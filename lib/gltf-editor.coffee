FileEditor = require './file-editor'

module.exports =
class GLTFEditor extends FileEditor
  atom.deserializers.add(this)

  getViewClass: -> require './gltf-editor-view'
  isEqual: (other) ->
    other instanceof GLTFEditor and @getURI() is other.getURI()
