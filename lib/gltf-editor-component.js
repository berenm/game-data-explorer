/** @babel */

import path from 'path'

import BABYLON from './ext/babylonjs'

import ModelFileEditorComponent from './core/model-file-editor-component'

export default class GLTFEditorView extends ModelFileEditorComponent {
  constructor(properties, children) {
    super(properties, children)

    BABYLON.SceneLoader.Load(path.dirname(this.file.path) + '/', path.basename(this.file.path), this.engine, scene => {
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 0)

      if (!scene.activeCamera) {
        const camera = new BABYLON.ArcRotateCamera('Camera', (3 * Math.PI) / 2, -Math.PI / 2, 50, BABYLON.Vector3.Zero(), scene)
        camera.attachControl(this.model, true)

        camera.zoomOn(scene.meshes, false)
        if (camera.maxZ < camera.minZ) {
          [camera.maxZ, camera.minZ] = Array.from([camera.minZ * 10, camera.maxZ / 10])
        } else {
          camera.maxZ = Math.max(10, camera.maxZ * 10)
        }

        camera.wheelPrecision = 20000 / camera.maxZ
        camera.allowUpsideDown = false
        camera.lowerRadiusLimit = camera.minZ * 2

        scene.activeCamera = camera
      }

      new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene)

      this.properties.scene = scene
    })
  }
}
