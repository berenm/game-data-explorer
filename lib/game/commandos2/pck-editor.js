/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {PCKParser} from './pck-parser'

class PCKEditor extends ArchiveFileEditor {
  static get version() { return 1 }
  get serialized() { return {path: this.file.path} }

  constructor({path}) { super({path: path, parser: PCKParser}) }
}
Serializable.includeInto(PCKEditor, __filename)

export default PCKEditor
