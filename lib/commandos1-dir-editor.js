/** @babel */

import ArchiveFileEditor from './core/archive-file-editor'
import {DIR} from './data/commandos1/dir'

class DIREditor extends ArchiveFileEditor {
  static deserialize({path}) { if (path) return new DIREditor({path: path}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'DIREditor', version: DIREditor.version, path: this.path } }
  isEqual(other) { return other instanceof DIREditor && (this.getURI() === other.getURI()) }

  constructor({path}) { super({path: path, parser: DIR}) }
}

atom.deserializers.add(DIREditor)
export default DIREditor
