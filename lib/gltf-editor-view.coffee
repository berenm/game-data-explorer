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

  render: =>
    @scene.render()

  refresh: ->
    @engine = new BABYLON.Engine(@canvas.context, true)

    @editorSubscriptions.add atom.workspace.onDidDestroyPaneItem (event) =>
      if event.item is @editor
        @engine.stopRenderLoop @render
        @scene = null
        @engine = null

    BABYLON.SceneLoader.Load path.dirname(@path) + '/', path.basename(@path), @engine, (scene) =>
      scene.clearColor = new BABYLON.Color4 0, 0, 0, 0

      if not scene.activeCamera
        camera = new BABYLON.ArcRotateCamera('Camera', 3 * Math.PI / 2, -Math.PI / 2, 50, BABYLON.Vector3.Zero(), scene)
        camera.attachControl(@canvas.context, true)

        camera.zoomOn scene.meshes, false
        if (camera.maxZ < camera.minZ)
          [camera.maxZ, camera.minZ] = [camera.minZ * 10, camera.maxZ / 10]
        else
          camera.maxZ = Math.max(10, camera.maxZ * 10)

        camera.wheelPrecision = 20000 / camera.maxZ
        camera.allowUpsideDown = false
        camera.lowerRadiusLimit = camera.minZ * 2

        scene.activeCamera = camera

      light = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene)

      @scene = scene
      @engine.runRenderLoop @render

    setTimeout =>
      rect = @engine.getRenderingCanvasClientRect()
      @canvas.context.width = rect.width
      @canvas.context.height = rect.height

    addEventListener 'resize', @onResize, false
