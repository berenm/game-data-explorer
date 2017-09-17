/** @babel */

import ArchiveFileEditor from './core/archive-file-editor'
import {DAT} from './data/fallout1/dat'

class Fallout1DATEditor extends ArchiveFileEditor {
  static deserialize({path}) { if (path) return new Fallout1DATEditor({path: path}) }
  static get version() { return 1 }
  serialize() { return { deserializer: 'Fallout1DATEditor', version: Fallout1DATEditor.version, path: this.path } }
  isEqual(other) { return other instanceof Fallout1DATEditor && (this.getURI() === other.getURI()) }

  constructor({path}) { super({path: path, parser: DAT}) }
}

atom.deserializers.add(Fallout1DATEditor)
export default Fallout1DATEditor
