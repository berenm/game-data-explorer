FileEditorView = require './file-editor-view'

fs = require 'fs'
{MDLASCIIParser} = require './data/aurora/mdl-ascii'

THREE = require 'three.js'
OrbitControls = require 'three-orbit-controls'
THREE.OrbitControls = OrbitControls THREE

module.exports =
class MDLEditorView extends FileEditorView
  @content: ->
    @div class: 'gde-editor', tabindex: -1, =>
      @div class: 'gde-container', =>
        @div class: 'model-container', =>
          @div class: 'model-cell', =>
            @span class: 'model', outlet: 'container'

  onResize: =>
    @renderer.setSize @container.width(), @container.height()
    @camera.aspect = @container.width() / @container.height()
    @camera.updateProjectionMatrix()
    @renderer.render @scene, @camera
    true

  refresh: ->
    addEventListener 'resize', @onResize, false
    @container.on 'contextmenu', -> false

    @renderer = new THREE.WebGLRenderer {antialias: true}
    @canvas = @renderer.domElement
    @container.append @canvas
    console.log(@canvas.offsetWidth)

    @camera = new THREE.PerspectiveCamera(
      75, 1,
      0.1, 1000)

    setTimeout => @onResize()

    @controls = new THREE.OrbitControls @camera, @canvas
    @controls.addEventListener 'change', => @renderer.render @scene, @camera
    @controls.enableDamping = true
    @controls.dampingFactor = 0.25
    @controls.enableZoom = true

    @scene = new THREE.Scene()

    @model = MDLASCIIParser.parse(fs.readFileSync(@path))
    console.log(@model)
    @node = @model.geometries[0].rootNode.children[0]

    makeMesh = (node) ->
      mesh = null
      if node.type is 'trimesh'
        faceList = node.faces.list
        indices = new Uint32Array faceList.length * 3
        for face, i in faceList
          indices[3 * i + 0] = face[0]
          indices[3 * i + 1] = face[1]
          indices[3 * i + 2] = face[2]

        vertices = new Float32Array node.vertices.list

        geometry = new THREE.BufferGeometry()
        geometry.setIndex new THREE.BufferAttribute(indices, 1)
        geometry.addAttribute 'position', new THREE.BufferAttribute(vertices, 3)

        material = new THREE.MeshBasicMaterial {wireframe: true}
        mesh = new THREE.Mesh geometry, material

      else
        mesh = new THREE.Object3D()

      if node.position?
        mesh.translateX(node.position[0])
        mesh.translateY(node.position[1])
        mesh.translateZ(node.position[2])

      # console.log(node)
      if node.orientation?
        mesh.rotateOnAxis(new THREE.Vector3(node.orientation[0], node.orientation[1], node.orientation[2]), node.orientation[3])

      for child in node.children
        mesh.add(makeMesh(child))

      return mesh

    group = new THREE.Object3D()
    for geometry in @model.geometries
      group.add makeMesh(geometry.rootNode)

    group.rotateZ Math.PI
    group.rotateX(Math.PI / 2.0)

    # group.computeBoundingSphere()
    # @camera.position.z = group.boundingSphere.radius * 3
    @camera.position.z = 5

    @scene.add group
    # @scene.add new THREE.BoundingBoxHelper(group, 0xffffff)

    ###
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );
    ###

    ###
    container.on 'resize', () =>
      @camera.aspect = @canvas.offsetWidth / @canvas.offsetHeight
      @camera.updateProjectionMatrix()
      @renderer.setSize @canvas.offsetWidth, @canvas.offsetHeight
    ###
