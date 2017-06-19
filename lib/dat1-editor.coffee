FileEditor = require './file-editor'
{DAT1} = require './data/arcanum/dat1'

module.exports =
class DAT1Editor extends FileEditor
  atom.deserializers.add(this)

  constructor: ({path}) ->
    super({path})
    new DAT1 path

  getViewClass: -> require './dat1-editor-view'
  isEqual: (other) -> other instanceof DAT1Editor and
                      @getURI() is other.getURI()
