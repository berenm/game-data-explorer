/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import {DIRParser} from './dir-parser'

class DIREditor extends ArchiveFileEditor {
  static deserialize({path}) { if (path) return new DIREditor({path: path}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'DIREditor', version: DIREditor.version, path: this.path } }
  isEqual(other) { return other instanceof DIREditor && (this.getURI() === other.getURI()) }

  constructor({path}) { super({path: path, parser: DIRParser}) }
}

atom.deserializers.add(DIREditor)
export default DIREditor
