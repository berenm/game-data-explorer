/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {BF} from './bf'

class BFEditor extends ArchiveFileEditor {
  static get version() { return 1 }
  get serialized() { return {path: this.file.path} }

  constructor({path}) { super({path: path, parser: BF}) }
}
Serializable.includeInto(BFEditor, __filename)

export default BFEditor
