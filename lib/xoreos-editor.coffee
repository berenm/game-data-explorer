path = require 'path'
fs = require 'fs-plus'

KEYEditor = require './key-editor'
TGAEditor = require './tga-editor'
WAVEditor = require './wav-editor'
MDLEditor = require './mdl-editor'

module.exports =
class XoreosEditor
  @config:
    executablePath:
      title: 'Path to xoreos-cli'
      type: 'string'
      default: '/usr/bin/xoreos-cli'

  @activate: ->
    @opener = atom.workspace.addOpener (filePath='') ->
      if fs.isFileSync(filePath)
        switch path.extname(filePath)
          when '.key'
            return new KEYEditor(path: filePath)
          when '.mdl'
            return new MDLEditor(path: filePath)
          when '.tga'
            return new TGAEditor(path: filePath)
          when '.wav'
            return new WAVEditor(path: filePath)

  @deactivate: ->
    @opener.dispose()
