/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import {DAT} from './dat'

class Fallout2DATEditor extends ArchiveFileEditor {
  static deserialize({path}) { if (path) return new Fallout2DATEditor({path: path}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'Fallout2DATEditor', version: Fallout2DATEditor.version, path: this.path } }
  isEqual(other) { return other instanceof Fallout2DATEditor && (this.getURI() === other.getURI()) }

  constructor({path}) { super({path: path, parser: DAT}) }
}

atom.deserializers.add(Fallout2DATEditor)
export default Fallout2DATEditor
