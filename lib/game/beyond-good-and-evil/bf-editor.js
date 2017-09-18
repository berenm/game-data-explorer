/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import {BF} from './bf'

class BFEditor extends ArchiveFileEditor {
  static deserialize({path}) { if (path) return new BFEditor({path: path}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'BFEditor', version: BFEditor.version, path: this.path } }
  isEqual(other) { return other instanceof BFEditor && (this.getURI() === other.getURI()) }

  constructor({path}) { super({path: path, parser: BF}) }
}

atom.deserializers.add(BFEditor)
export default BFEditor
