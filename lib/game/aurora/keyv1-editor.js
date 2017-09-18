/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {KEYV1} from './keyv1'

class KEYV1Editor extends ArchiveFileEditor {
  static get version() { return 1 }
  get serialized() { return {path: this.file.path} }

  constructor({path}) { super({path: path, parser: KEYV1}) }
}
Serializable.includeInto(KEYV1Editor, __filename)

export default KEYV1Editor
