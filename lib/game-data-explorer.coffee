path = require 'path'
fs = require 'fs-plus'

TGAEditor = require './tga-editor'
WAVEditor = require './wav-editor'
MDLEditor = require './mdl-editor'
GLTFEditor = require './gltf-editor'
HEXEditor = require './hex-editor'

textOrBin = require 'istextorbinary'

module.exports =
class GameDataExplorer
  @editors:
    '.key': (filePath) ->
      try return new (require './aurora-keyv1-editor')(path: filePath) catch
      return null
    '.mdl': (filePath) -> return new MDLEditor(path: filePath)
    '.tga': (filePath) -> return new TGAEditor(path: filePath)
    '.wav': (filePath) -> return new WAVEditor(path: filePath)
    '.wad': (filePath) -> return new WAVEditor(path: filePath)
    '.waa': (filePath) -> return new WAVEditor(path: filePath)
    '.wam': (filePath) -> return new WAVEditor(path: filePath)
    '.wac': (filePath) -> return new WAVEditor(path: filePath)
    '.dir': (filePath) ->
      try return new (require './commandos1-dir-editor')(path: filePath) catch
      return null
    '.dat': (filePath) ->
      try return new (require './arcanum-dat1-editor')(path: filePath) catch
      try return new (require './fallout2-dat-editor')(path: filePath) catch
      try return new (require './fallout1-dat-editor')(path: filePath) catch
      return null
    '.pck': (filePath) ->
      try return new (require './commandos2-pck-editor')(path: filePath) catch
      return null
    '.art': (filePath) ->
      try return new (require './arcanim-art-editor')(path: filePath) catch
      return null
    '.bf': (filePath) ->
      try return new (require './beyond-good-and-evil-bf-editor')(path: filePath) catch
      return null
    '.gltf': (filePath) -> return new GLTFEditor(path: filePath)

  @activate: ->
    @opener = atom.workspace.addOpener (filePath = '') =>
      if fs.isFileSync(filePath)
        extName = path.extname(filePath).toLowerCase()
        callback = @editors[extName]
        if callback isnt undefined
          editor = callback filePath
          return editor if editor

        buffer = new Buffer 256
        file = fs.openSync filePath, 'r'
        bytes = fs.readSync file, buffer, 0, 256, 0
        if textOrBin.isBinarySync filePath, buffer.slice(0, bytes)
          return new HEXEditor(path: filePath)

  @deactivate: ->
    @opener.dispose()
