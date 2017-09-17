FileEditorView = require './file-editor-view'

fs = require 'fs'
path = require 'path'

BABYLON = require './ext/babylonjs'

module.exports =
class GLTFEditorView extends FileEditorView
  @content: ->
    @div class: 'gde-editor', tabindex: -1, =>
      @div class: 'gde-container', =>
        @div class: 'model-container', =>
          @div class: 'model-cell', =>
            @canvas class: 'model', outlet: 'canvas'

  onResize: =>
    rect = @engine.getRenderingCanvasClientRect()
    @canvas.context.width = rect.width
    @canvas.context.height = rect.height
    @engine.resize

  refresh: ->
    @engine = new BABYLON.Engine(@canvas.context, true)

    BABYLON.SceneLoader.Load path.dirname(@path) + '/', path.basename(@path), @engine, (scene) =>
      scene.clearColor = new BABYLON.Color4 0, 0, 0, 0

      if not scene.activeCamera
        scene.activeCamera = new BABYLON.ArcRotateCamera('Camera', Math.PI, Math.PI / 8, 150, BABYLON.Vector3.Zero(), scene)
        scene.activeCamera.attachControl(@canvas.context, true)
        scene.activeCamera.zoomOn scene.meshes, false
        scene.activeCamera.allowUpsideDown = false
        scene.activeCamera.wheelPrecision = 1000 / scene.activeCamera.maxZ
        scene.activeCamera.maxZ *= 4

      light = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene)

      @engine.runRenderLoop ->
        scene.render()

    setTimeout =>
      rect = @engine.getRenderingCanvasClientRect()
      @canvas.context.width = rect.width
      @canvas.context.height = rect.height

    addEventListener 'resize', @onResize, false
