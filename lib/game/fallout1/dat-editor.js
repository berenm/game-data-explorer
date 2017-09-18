/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {DATParser} from './dat-parser'

class Fallout1DATEditor extends ArchiveFileEditor {
  static get version() { return 1 }
  get serialized() { return {path: this.file.path} }

  constructor({path}) { super({path: path, parser: DATParser}) }
}
Serializable.includeInto(Fallout1DATEditor, __filename)

export default Fallout1DATEditor
