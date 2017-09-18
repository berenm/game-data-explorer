/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {DATParser} from './dat-parser'

class Fallout2DATEditor extends ArchiveFileEditor {
  static get version() { return 1 }
  get serialized() { return {path: this.file.path} }

  constructor({path}) { super({path: path, parser: DATParser}) }
}
Serializable.includeInto(Fallout2DATEditor, __filename)

export default Fallout2DATEditor
