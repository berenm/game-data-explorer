/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {KEYV1Parser} from './keyv1-parser'

class KEYV1Editor extends ArchiveFileEditor(KEYV1Parser) {
}
Serializable.includeInto(KEYV1Editor, __filename)

export default KEYV1Editor
