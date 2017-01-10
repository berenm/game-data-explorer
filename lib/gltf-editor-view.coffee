FileEditorView = require './file-editor-view'

fs = require 'fs'

THREE = require 'three'
OrbitControls = require 'three-orbit-controls'
THREE.OrbitControls = OrbitControls THREE

GLTFLoader = require './data/three-gltf-loader.js'
THREE.GLTFLoader = GLTFLoader THREE

module.exports =
class GLTFEditorView extends FileEditorView
  @content: ->
    @div class: 'xoreos-editor', tabindex: -1, =>
      @div class: 'xoreos-container', =>
        @div class: 'model-container', =>
          @div class: 'model-cell', =>
            @span class: 'model', outlet: 'container'

  onResize: =>
    @camera.aspect = @container.width() / @container.height()
    @camera.updateProjectionMatrix()
    @renderer.setSize @container.width(), @container.height()
    true

  animate: =>
    if @mixer
      requestAnimationFrame @animate
      @mixer.update @clock.getDelta()

    THREE.GLTFLoader.Shaders.update @scene, @camera
    @controls.update()
    @renderer.render @scene, @camera

  refresh: ->
    addEventListener 'resize', @onResize, false
    @container.on 'contextmenu', -> false

    @clock = new THREE.Clock()

    @renderer = new THREE.WebGLRenderer {antialias: true}
    @renderer.setClearColor 0x222222
    @renderer.setSize @container.width(), @container.height()

    @canvas = @renderer.domElement
    @container.append @canvas

    THREE.GLTFLoader.Shaders.removeAll()
    @model = new THREE.GLTFLoader()
    @model.load @path, (gltf) =>
      @scene = gltf.scene

      if gltf.cameras and gltf.cameras.length > 0
        @camera = gltf.cameras[0]
        @camera.position.z = 10
      else
        @camera = new THREE.PerspectiveCamera 75, @container.width() /  @container.height(), 0.001, 1000
        @camera.position.z = 10

      @controls = new THREE.OrbitControls @camera, @renderer.domElement
      @controls.enableDamping = true
      @controls.dampingFactor = 0.25
      @controls.enableZoom = true

      if gltf.animations and gltf.animations.length > 0
        @mixer = new THREE.AnimationMixer gltf.scene
        for animation in gltf.animations
          @mixer.clipAction(animation).play()
      else
        @controls.addEventListener 'change', =>
          THREE.GLTFLoader.Shaders.update @scene, @camera
          @renderer.render @scene, @camera

      setTimeout =>
        @onResize()
        @animate()
