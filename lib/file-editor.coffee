Serializable = require 'serializable'
{Emitter, File} = require 'atom'

path = require 'path'
fs = require 'fs-plus'

module.exports =
class FileEditor extends Serializable
  atom.deserializers.add(this)

  constructor: ({path}) ->
    @file = new File(path)
    @emitter = new Emitter()

  serializeParams: -> path: @getPath()
  deserializeParams: (params={}) ->
    if fs.isFileSync(params.path)
      params
    else
      console.warn "Could not build editor for path '#{params.path}' because that file no longer exists"

  getPath: -> @file.getPath()

  destroy: -> @emitter.emit 'did-destroy'
  onDidDestroy: (callback) -> @emitter.on 'did-destroy', callback

  getTitle: ->
    if @getPath()?
      path.basename(@getPath())
    else
      'untitled'

  getURI: -> @getPath()
  isEqual: (other) -> other instanceof FileEditor and @getURI() is other.getURI()
