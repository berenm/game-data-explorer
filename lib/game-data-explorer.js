/** @babel */

import {fs} from './core/util'
import path from 'path'

const EDITORS = {
  '.key': (path) => {
    try { return new (require('./game/aurora/keyv1-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.mdl': (path) => {
    try { return new (require('./mdl-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.tga': (path) => {
    try { return new (require('./tga-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.wav': (path) => {
    try { return new (require('./wav-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.wad': (path) => {
    try { return new (require('./wav-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.waa': (path) => {
    try { return new (require('./wav-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.wam': (path) => {
    try { return new (require('./wav-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.wac': (path) => {
    try { return new (require('./wav-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.dir': (path) => {
    try { return new (require('./game/commandos1/dir-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.dat': (path) => {
    try { return new (require('./game/arcanum/dat1-editor'))({path}) } catch (error) { /* ignore */ }
    try { return new (require('./game/fallout2/dat-editor'))({path}) } catch (error) { /* ignore */ }
    try { return new (require('./game/fallout1/dat-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.pck': (path) => {
    try { return new (require('./game/commandos2/pck-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.art': (path) => {
    try { return new (require('./game/arcanum/art-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.bf': (path) => {
    try { return new (require('./game/beyond-good-and-evil/bf-editor'))({path}) } catch (error) { /* ignore */ }
  },
  '.gltf': (path) => {
    try { return new (require('./gltf-editor'))({path}) } catch (error) { /* ignore */ }
  }
}

export default class GameDataExplorer {
  static isBinary(buffer) {
    for (let [encoding, invalidchars] of [['utf8', ['\x00', '\ufffd']]]) {
      for (let invalidchar of invalidchars) {
        if (buffer.toString(encoding).includes(invalidchar)) {
          return true
        }
      }
    }
    return false
  }

  static activate() {
    let extname = path.extname
    return this.opener = atom.workspace.addOpener((path) => {
      if (path == null) return
      if (!fs.isFileSync(path)) return

      const ext = extname(path).toLowerCase()
      if (fs.isCompressedExtension(ext) ||
          fs.isImageExtension(ext))
        return

      const callback = EDITORS[ext]
      if (callback) {
        const editor = callback(path)
        if (editor)
          return editor
      }

      const buffer = new Buffer(64)
      const file = fs.openSync(path, 'r')
      const bytes = fs.readSync(file, buffer, 0, buffer.length, 0)
      if (GameDataExplorer.isBinary(buffer.slice(0, bytes)))
        return new (require('./hex-editor'))({path})
    })
  }

  static deactivate() {
    return this.opener.dispose()
  }

  static deserialize(object) {
    if (!object.class || !object.module)
      return

    if (!object.module.startsWith(__dirname))
      return

    const clazz = require('./' + path.relative(__dirname, object.module))
    if (clazz.name != object.class || clazz.version != object.version)
      return

    return clazz.deserialize(object)
  }
}
