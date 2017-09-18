/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {DIRParser} from './dir-parser'

class DIREditor extends ArchiveFileEditor {
  static get version() { return 1 }
  get serialized() { return {path: this.file.path} }

  constructor({path}) { super({path: path, parser: DIRParser}) }
}
Serializable.includeInto(DIREditor, __filename)

export default DIREditor
