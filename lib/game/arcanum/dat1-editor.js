/** @babel */

import ArchiveFileEditor from '../../core/archive-file-editor'
import Serializable from '../../core/serializable'
import {DAT1Parser} from './dat1-parser'

class DAT1Editor extends ArchiveFileEditor(DAT1Parser) {
}
Serializable.includeInto(DAT1Editor, __filename)

export default DAT1Editor
