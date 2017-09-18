/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import {KEYV1} from './keyv1'

class KEYV1Editor extends ArchiveFileEditor {
  static deserialize({path}) { if (path) return new KEYV1Editor({path: path}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'KEYV1Editor', version: KEYV1Editor.version, path: this.path } }
  isEqual(other) { return other instanceof KEYV1Editor && (this.getURI() === other.getURI()) }

  constructor({path}) { super({path: path, parser: KEYV1}) }
}

atom.deserializers.add(KEYV1Editor)
export default KEYV1Editor
