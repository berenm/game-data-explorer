/** @babel */

import path from 'path'
import fs from 'fs'

var BABYLON

const babylonjs = require.resolve('babylonjs')
eval(fs.readFileSync(babylonjs) + '')

const gltfloader = require.resolve(`${path.dirname(babylonjs)}/loaders/babylon.glTFFileLoader.min`)
eval(fs.readFileSync(gltfloader) + '')

BABYLON.SceneLoader._loadData = function (rootUrl, sceneFilename, scene, onSuccess, onProgress, onError) {
    var directLoad = BABYLON.SceneLoader._getDirectLoad(sceneFilename)
    var registeredPlugin = directLoad ? BABYLON.SceneLoader._getPluginForDirectLoad(sceneFilename) : BABYLON.SceneLoader._getPluginForFilename(sceneFilename)
    var plugin = registeredPlugin.plugin
    BABYLON.SceneLoader.OnPluginActivatedObservable.notifyObservers(registeredPlugin.plugin)

    var dataCallback = function (data) {
        if (scene.isDisposed) return onError("Scene has been disposed")
        try {
          onSuccess(plugin, data)
        } catch (error) {
          onError(null, error)
        }
    }

    BABYLON.Tools.ReadFile(rootUrl + sceneFilename, dataCallback)
}

BABYLON.Tools.ReadFile = function(filename, callback) {
  fs.readFile(filename, (error, data) => {
    if (error) throw new Error(`Could not read ${filename}`)
    callback(data + '')
  })
}

BABYLON.Tools.LoadFile = function (filename, callback) {
  fs.readFile(filename, (error, data) => {
    if (error) throw new Error(`Could not read ${filename}`)
    callback(data)
  })
}

BABYLON.SceneLoader.ShowLoadingScreen = false

export default BABYLON
