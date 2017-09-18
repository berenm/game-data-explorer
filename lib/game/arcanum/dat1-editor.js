/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import {DAT1} from './dat1'

class DAT1Editor extends ArchiveFileEditor {
  static deserialize({path}) { if (path) return new DAT1Editor({path: path}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'DAT1Editor', version: DAT1Editor.version, path: this.path } }
  isEqual(other) { return other instanceof DAT1Editor && (this.getURI() === other.getURI()) }

  constructor({path}) { super({path: path, parser: DAT1}) }
}

atom.deserializers.add(DAT1Editor)
export default DAT1Editor
